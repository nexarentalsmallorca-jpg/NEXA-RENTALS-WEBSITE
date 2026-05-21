import { writeFileSync } from "fs";
import { blogTranslations } from "../lib/blog-content/i18n/translations";

const locales = ["es", "de", "fr", "it", "pt", "sv"] as const;
const out: Record<string, Record<string, { slug: string; title: string; metaTitle?: string; imageAlt: string }>> = {};

for (const loc of locales) {
  out[loc] = {};
  const pack = blogTranslations[loc];
  if (!pack) continue;
  for (const [id, v] of Object.entries(pack)) {
    out[loc][id] = {
      slug: v.slug,
      title: v.title,
      metaTitle: v.metaTitle,
      imageAlt: v.imageAlt,
    };
  }
}

writeFileSync(".blog-manual-slugs.json", JSON.stringify(out));
