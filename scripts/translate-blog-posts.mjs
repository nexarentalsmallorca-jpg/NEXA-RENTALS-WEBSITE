/**
 * Generates full blog translations from English into lib/blog-content/i18n/generated/{locale}.json
 *
 * Usage: node scripts/translate-blog-posts.mjs [locale...]
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "lib/blog-content/i18n/generated");
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const localeArgs = args.filter((a) => a !== "--force");

const TARGET_LOCALES = localeArgs.length
  ? localeArgs
  : ["es", "de", "fr", "it", "pt", "sv"];

/** Locales already fully generated in a prior run. */
const COMPLETED_LOCALES = new Set(["es", "de", "fr"]);

const GOOGLE_LANG = {
  es: "es",
  de: "de",
  fr: "fr",
  it: "it",
  pt: "pt",
  sv: "sv",
};

const DELAY_MS = 600;
const MAX_CHUNK = 4800;
const MYMEMORY_MAX = 450;
const CONCURRENCY = 1;
const MAX_RETRIES = 6;
const CACHE_PATH = join(outDir, ".translation-cache.json");
const CACHE_SAVE_EVERY = 25;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadTranslate() {
  const mod = await import("google-translate-api-x");
  return mod.translate;
}

function loadDiskCache() {
  if (!existsSync(CACHE_PATH)) return new Map();
  try {
    return new Map(Object.entries(JSON.parse(readFileSync(CACHE_PATH, "utf8"))));
  } catch {
    return new Map();
  }
}

function saveDiskCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(Object.fromEntries(cache)), "utf8");
}

async function myMemoryTranslate(text, to) {
  async function call(chunk) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    throw new Error(data.responseDetails || "MyMemory failed");
  }

  if (text.length <= MYMEMORY_MAX) {
    await sleep(350);
    return call(text);
  }

  const parts = [];
  for (let i = 0; i < text.length; i += MYMEMORY_MAX) {
    parts.push(await call(text.slice(i, i + MYMEMORY_MAX)));
  }
  return parts.join("");
}

function collectStrings(value, out) {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (k === "slug") continue;
      collectStrings(v, out);
    }
  }
}

function applyTranslated(value, map) {
  if (typeof value === "string") return map.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => applyTranslated(item, map));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = k === "slug" ? v : applyTranslated(v, map);
    }
    return out;
  }
  return value;
}

function isRateLimitError(err) {
  const msg = String(err?.message ?? err);
  return /too many requests|429|rate/i.test(msg);
}

async function translateOne(translate, text, to) {
  if (!text?.trim()) return text;

  async function callApi(chunk) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await sleep(DELAY_MS * (attempt + 1));
        const res = await translate(chunk, { from: "en", to });
        return res.text;
      } catch (err) {
        if (isRateLimitError(err) && attempt < MAX_RETRIES - 1) {
          const wait = 3000 * (attempt + 1);
          console.warn(`  rate limited, waiting ${wait / 1000}s...`);
          await sleep(wait);
          continue;
        }
        throw err;
      }
    }
    return chunk;
  }

  if (text.length <= MAX_CHUNK) return callApi(text);

  const chunks = [];
  for (let i = 0; i < text.length; i += MAX_CHUNK) {
    chunks.push(await callApi(text.slice(i, i + MAX_CHUNK)));
  }
  return chunks.join("");
}

async function translateString(translate, text, to, cache) {
  const key = `${to}::${text}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const translated = await translateOne(translate, text, to);
    cache.set(key, translated);
    return translated;
  } catch (googleErr) {
    try {
      console.warn(`  Google failed, trying MyMemory...`);
      const translated = await myMemoryTranslate(text, to);
      cache.set(key, translated);
      return translated;
    } catch {
      console.warn(`  keeping EN: ${String(googleErr).slice(0, 60)}`);
      cache.set(key, text);
      return text;
    }
  }
}

async function translateBatch(translate, strings, to, cache) {
  const unique = [...new Set(strings.filter(Boolean))];
  const pending = unique.filter((s) => !cache.has(`${to}::${s}`));
  if (pending.length === 0) return;

  let done = 0;
  for (const s of pending) {
    await translateString(translate, s, to, cache);
    done++;
    if (done % 50 === 0) console.log(`  ${done}/${pending.length}`);
    if (done % CACHE_SAVE_EVERY === 0) saveDiskCache(cache);
  }
  saveDiskCache(cache);
}

async function translateLocale(translate, locale, posts, manual, diskCache) {
  const to = GOOGLE_LANG[locale];
  const cache = diskCache;
  const allStrings = [];
  for (const post of posts) collectStrings(post.en, allStrings);

  console.log(`  collecting ${allStrings.length} strings, ${new Set(allStrings).size} unique`);
  await translateBatch(translate, allStrings, to, cache);

  const pack = {};
  for (const post of posts) {
    const manualMeta = manual[locale]?.[post.id];
    if (!manualMeta?.slug) {
      console.warn(`  skip ${post.id}: no manual slug`);
      continue;
    }

    const stringMap = new Map();
    const collected = [];
    collectStrings(post.en, collected);
    for (const s of collected) stringMap.set(s, cache.get(`${to}::${s}`) ?? s);

    const translated = applyTranslated(post.en, stringMap);
    pack[post.id] = {
      ...translated,
      slug: manualMeta.slug,
      title: manualMeta.title ?? translated.title,
      metaTitle: manualMeta.metaTitle ?? translated.metaTitle,
      imageAlt: manualMeta.imageAlt ?? translated.imageAlt,
    };
  }

  const outPath = join(outDir, `${locale}.json`);
  writeFileSync(outPath, JSON.stringify(pack, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${Object.keys(pack).length} posts)`);
}

async function main() {
  const tmpOut = join(root, ".blog-posts-export.json");
  const manualPath = join(root, ".blog-manual-slugs.json");

  execSync("npx tsx scripts/export-blog-en.ts", { cwd: root, stdio: "inherit" });
  execSync("npx tsx scripts/export-blog-manual-slugs.ts", { cwd: root, stdio: "inherit" });

  const posts = JSON.parse(readFileSync(tmpOut, "utf8"));
  const manual = JSON.parse(readFileSync(manualPath, "utf8"));

  mkdirSync(outDir, { recursive: true });
  const translate = await loadTranslate();
  const diskCache = loadDiskCache();
  console.log(`Loaded ${diskCache.size} cached translations`);

  for (const locale of TARGET_LOCALES) {
    const outPath = join(outDir, `${locale}.json`);
    if (
      !FORCE &&
      COMPLETED_LOCALES.has(locale) &&
      existsSync(outPath)
    ) {
      try {
        const existing = JSON.parse(readFileSync(outPath, "utf8"));
        if (Object.keys(existing).length >= posts.length) {
          console.log(`\n=== ${locale} === skip (already ${Object.keys(existing).length} posts)`);
          continue;
        }
      } catch {
        /* regenerate */
      }
    }

    console.log(`\n=== ${locale} ===`);
    await translateLocale(translate, locale, posts, manual, diskCache);
  }

  saveDiskCache(diskCache);
  console.log("\nDone. Run: npm run generate:blog-slugs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
