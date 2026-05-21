import type { Locale } from "@/i18n/routing";
import type { BlogLocalePack } from "../helpers";
import esGenerated from "./es.json";
import deGenerated from "./de.json";
import frGenerated from "./fr.json";
import itGenerated from "./it.json";
import ptGenerated from "./pt.json";
import svGenerated from "./sv.json";

function packIfNonEmpty(data: BlogLocalePack): BlogLocalePack | undefined {
  return Object.keys(data).length > 0 ? data : undefined;
}

/** Full translations from scripts/translate-blog-posts.mjs (empty {} until generated). */
export const generatedBlogTranslations: Partial<Record<Locale, BlogLocalePack>> = {
  es: packIfNonEmpty(esGenerated as BlogLocalePack),
  de: packIfNonEmpty(deGenerated as BlogLocalePack),
  fr: packIfNonEmpty(frGenerated as BlogLocalePack),
  it: packIfNonEmpty(itGenerated as BlogLocalePack),
  pt: packIfNonEmpty(ptGenerated as BlogLocalePack),
  sv: packIfNonEmpty(svGenerated as BlogLocalePack),
};
