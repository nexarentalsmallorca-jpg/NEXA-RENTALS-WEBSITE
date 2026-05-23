/**
 * Generates full blog translations from English into lib/blog-content/i18n/generated/{locale}.json
 *
 * Usage: node scripts/translate-blog-posts.mjs [--force] [locale...]
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

const PARALLEL_FIELDS = 2;
const XML_CHUNK_FIELDS = 16;

const GOOGLE_LANG = {
  es: "es",
  de: "de",
  fr: "fr",
  it: "it",
  pt: "pt",
  sv: "sv",
};

const DELAY_MS = 400;
const MAX_CHUNK = 4500;
const MYMEMORY_MAX = 450;
const MAX_RETRIES = 6;
const CACHE_PATH = join(outDir, ".translation-cache.json");

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

function localeFileLooksComplete(existing, posts) {
  if (!existing || Object.keys(existing).length < posts.length) return false;
  const entry = existing[posts[0]?.id];
  if (!entry?.quickAnswer) return false;
  const qa = String(entry.quickAnswer);
  return !qa.startsWith("Yes,") && !qa.startsWith("No,");
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
    await sleep(300);
    return call(text);
  }

  const parts = [];
  for (let i = 0; i < text.length; i += MYMEMORY_MAX) {
    parts.push(await call(text.slice(i, i + MYMEMORY_MAX)));
  }
  return parts.join("");
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
          const wait = 2500 * (attempt + 1);
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

async function translateBlob(translate, text, to, cache) {
  const key = `${to}::blob::${text.length}::${text.slice(0, 80)}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const translated = await translateOne(translate, text, to);
    if (translated !== text) cache.set(key, translated);
    return translated;
  } catch (googleErr) {
    try {
      console.warn(`  Google failed, trying MyMemory...`);
      const translated = await myMemoryTranslate(text, to);
      if (translated !== text) cache.set(key, translated);
      return translated;
    } catch {
      console.warn(`  keeping EN: ${String(googleErr).slice(0, 60)}`);
      return text;
    }
  }
}

/** Flatten translatable strings from one English post in stable order. */
function flattenPostStrings(en) {
  const strings = [
    en.quickAnswer,
    en.excerpt,
    en.metaDescription,
    en.ctaTitle,
    en.ctaText,
  ];

  for (const section of en.sections) {
    strings.push(section.heading);
    strings.push(...section.paragraphs);
  }

  for (const faq of en.faqs) {
    strings.push(faq.question);
    strings.push(faq.answer);
  }

  return strings;
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function unescapeXml(text) {
  return String(text)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function toTaggedXml(strings) {
  return `<nexa-post>${strings
    .map(
      (value, index) =>
        `<nexa-block id="${index}">${escapeXml(value)}</nexa-block>`
    )
    .join("")}</nexa-post>`;
}

function parseTaggedXml(xml, expectedCount) {
  const matches = [
    ...xml.matchAll(/<nexa-block id="(\d+)">([\s\S]*?)<\/nexa-block>/g),
  ];
  const out = Array.from({ length: expectedCount }, () => "");
  for (const match of matches) {
    const id = Number(match[1]);
    if (id >= 0 && id < expectedCount) {
      out[id] = unescapeXml(match[2].trim());
    }
  }
  return out;
}

function applyFlatStrings(en, translatedStrings) {
  let i = 0;
  const next = () => translatedStrings[i++] ?? "";

  const sections = en.sections.map((section) => ({
    heading: next(),
    paragraphs: section.paragraphs.map(() => next()),
  }));

  const faqs = en.faqs.map(() => ({
    question: next(),
    answer: next(),
  }));

  return {
    ...en,
    quickAnswer: next(),
    excerpt: next(),
    metaDescription: next(),
    ctaTitle: next(),
    ctaText: next(),
    sections,
    faqs,
  };
}

async function translateStringsParallel(translate, strings, to, cache) {
  const out = [];
  for (let i = 0; i < strings.length; i += PARALLEL_FIELDS) {
    const batch = strings.slice(i, i + PARALLEL_FIELDS);
    const translated = await Promise.all(
      batch.map((s) => translateBlob(translate, s, to, cache))
    );
    out.push(...translated);
  }
  return out;
}

async function translateStringChunk(translate, chunk, to, cache) {
  const xml = toTaggedXml(chunk);
  if (xml.length <= MAX_CHUNK) {
    const translatedXml = await translateBlob(translate, xml, to, cache);
    const parsed = parseTaggedXml(translatedXml, chunk.length);
    const filled = parsed.filter((s) => s?.trim()).length;
    if (filled >= chunk.length * 0.85) {
      return parsed;
    }
  }
  return translateStringsParallel(translate, chunk, to, cache);
}

async function translatePost(translate, en, to, cache) {
  const strings = flattenPostStrings(en);
  const translatedStrings = [];

  for (let i = 0; i < strings.length; i += XML_CHUNK_FIELDS) {
    const chunk = strings.slice(i, i + XML_CHUNK_FIELDS);
    const translatedChunk = await translateStringChunk(translate, chunk, to, cache);
    translatedStrings.push(...translatedChunk);
  }

  return applyFlatStrings(en, translatedStrings);
}

function clearLocaleCache(cache, locale) {
  const prefix = `${GOOGLE_LANG[locale]}::`;
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

async function translateLocale(translate, locale, posts, manual, diskCache) {
  const to = GOOGLE_LANG[locale];
  const cache = diskCache;

  if (FORCE) {
    clearLocaleCache(cache, locale);
    saveDiskCache(cache);
  }

  const pack = {};
  let index = 0;

  for (const post of posts) {
    index += 1;
    const manualMeta = manual[locale]?.[post.id];
    if (!manualMeta?.slug) {
      console.warn(`  skip ${post.id}: no manual slug`);
      continue;
    }

    console.log(`  [${index}/${posts.length}] ${post.id}`);
    const translated = await translatePost(translate, post.en, to, cache);
    pack[post.id] = {
      ...translated,
      slug: manualMeta.slug,
      title: manualMeta.title ?? translated.title,
      metaTitle: manualMeta.metaTitle ?? translated.metaTitle,
      imageAlt: manualMeta.imageAlt ?? translated.imageAlt,
    };

    if (index % 5 === 0) saveDiskCache(cache);
  }

  saveDiskCache(cache);
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
  console.log(`Loaded ${diskCache.size} cached blob translations`);

  for (const locale of TARGET_LOCALES) {
    const outPath = join(outDir, `${locale}.json`);
    if (!FORCE && existsSync(outPath)) {
      try {
        const existing = JSON.parse(readFileSync(outPath, "utf8"));
        if (localeFileLooksComplete(existing, posts)) {
          console.log(
            `\n=== ${locale} === skip (${Object.keys(existing).length} posts, bodies translated)`
          );
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
