/**
 * Full blog translation via OpenAI (one JSON object per post).
 * Usage: node scripts/translate-blogs-openai.mjs [locale...]
 * Requires OPENAI_API_KEY in .env.local
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "lib/blog-content/i18n/generated");

const args = process.argv.slice(2);
const TARGET_LOCALES = args.length ? args : ["es", "de", "fr", "it", "pt", "sv"];

const LOCALE_NAMES = {
  es: "Spanish",
  de: "German",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  sv: "Swedish",
};

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function pickTranslatable(en) {
  return {
    title: en.title,
    metaTitle: en.metaTitle,
    metaDescription: en.metaDescription,
    excerpt: en.excerpt,
    imageAlt: en.imageAlt,
    quickAnswer: en.quickAnswer,
    sections: en.sections,
    faqs: en.faqs,
    ctaTitle: en.ctaTitle,
    ctaText: en.ctaText,
  };
}

async function openaiTranslatePost(en, locale) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in .env.local");
  }

  const language = LOCALE_NAMES[locale] || locale;
  const payload = pickTranslatable(en);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            `You translate NEXA Rentals travel blog content from English to ${language}.`,
            "Return a single JSON object with the same keys and structure as the input.",
            "Translate all user-visible strings including headings, paragraphs, FAQ questions/answers, quickAnswer, excerpt, metaDescription, ctaTitle, ctaText, imageAlt.",
            "Keep brand names: NEXA Rentals, Magaluf, Palma, Palmanova, Mallorca, TIB, Line 104.",
            "Preserve markdown links exactly, but change path locale from /en/ to /" +
              locale +
              "/ when linking to nexarentals.es.",
            "Do not shorten or omit sections.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI HTTP ${response.status}`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty OpenAI response");

  return JSON.parse(text);
}

async function main() {
  loadEnvLocal();

  const tmpOut = join(root, ".blog-posts-export.json");
  const manualPath = join(root, ".blog-manual-slugs.json");

  execSync("npx tsx scripts/export-blog-en.ts", { cwd: root, stdio: "inherit" });
  execSync("npx tsx scripts/export-blog-manual-slugs.ts", { cwd: root, stdio: "inherit" });

  const posts = JSON.parse(readFileSync(tmpOut, "utf8"));
  const manual = JSON.parse(readFileSync(manualPath, "utf8"));
  mkdirSync(outDir, { recursive: true });

  for (const locale of TARGET_LOCALES) {
    console.log(`\n=== ${locale} (${LOCALE_NAMES[locale]}) ===`);
    const pack = {};

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const manualMeta = manual[locale]?.[post.id];
      if (!manualMeta?.slug) {
        console.warn(`  skip ${post.id}: no manual slug`);
        continue;
      }

      console.log(`  [${i + 1}/${posts.length}] ${post.id}`);
      try {
        const translated = await openaiTranslatePost(post.en, locale);
        pack[post.id] = {
          ...translated,
          slug: manualMeta.slug,
          title: manualMeta.title ?? translated.title,
          metaTitle: manualMeta.metaTitle ?? translated.metaTitle,
          imageAlt: manualMeta.imageAlt ?? translated.imageAlt,
        };
      } catch (error) {
        console.error(`  FAILED ${post.id}:`, error.message);
        throw error;
      }
    }

    const outPath = join(outDir, `${locale}.json`);
    writeFileSync(outPath, JSON.stringify(pack, null, 2), "utf8");
    console.log(`Wrote ${outPath} (${Object.keys(pack).length} posts)`);
  }

  console.log("\nDone. Run: npm run generate:blog-slugs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
