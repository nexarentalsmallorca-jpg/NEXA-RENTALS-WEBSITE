import type { Locale } from "@/i18n/routing";
import type { BlogLocalePack } from "../helpers";
import { deBlogTranslations } from "./de";
import { esBlogTranslations } from "./es";
import { frBlogTranslations } from "./fr";
import { itBlogTranslations } from "./it";
import { ptBlogTranslations } from "./pt";
import { svBlogTranslations } from "./sv";

export const blogTranslations: Partial<Record<Locale, BlogLocalePack>> = {
  es: esBlogTranslations,
  de: deBlogTranslations,
  fr: frBlogTranslations,
  it: itBlogTranslations,
  pt: ptBlogTranslations,
  sv: svBlogTranslations,
};
