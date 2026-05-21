import {
  allBlogPosts,
  getBlogTranslation,
  hasBlogLocale,
  type BlogPost,
} from "@/lib/blogs";
import { defaultLocale, locales, type Locale } from "@/i18n/routing";

export const SITE_URL = "https://www.nexarentals.es";

/** Top money pages — resolved per locale by post id (not English slug). */
export const MONEY_BLOG_POST_IDS = [
  "scooter-rental-price-magaluf",
  "best-place-rent-scooter-magaluf",
  "what-you-need-rent-scooter-mallorca",
  "license-125cc-scooter-spain",
  "rent-scooter-mallorca-car-licence",
  "scooter-rental-mallorca-deposit",
  "scooter-rental-magaluf-near-beach",
  "ebike-rental-price-magaluf",
] as const;

export const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
} as const;

export function blogCanonicalPath(locale: Locale, slug: string) {
  return `/${locale}/blog/${slug}`;
}

export function blogCanonicalUrl(locale: Locale, slug: string) {
  return `${SITE_URL}${blogCanonicalPath(locale, slug)}`;
}

export function blogIndexCanonicalUrl(locale: Locale) {
  return `${SITE_URL}/${locale}/blog`;
}

/** Self-referencing canonical + full hreflang set (incl. x-default → English). */
export function buildPostHreflangLanguages(post: BlogPost): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    if (!hasBlogLocale(post, locale)) continue;
    languages[locale] = blogCanonicalUrl(
      locale,
      getBlogTranslation(post, locale).slug
    );
  }

  languages["x-default"] =
    languages[defaultLocale] ?? languages.en ?? Object.values(languages)[0];

  return languages;
}

export function buildBlogIndexHreflangLanguages(): Record<string, string> {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, blogIndexCanonicalUrl(locale)])
  ) as Record<string, string>;

  languages["x-default"] = blogIndexCanonicalUrl(defaultLocale);
  return languages;
}

export type MoneyBlogLink = {
  postId: string;
  slug: string;
  title: string;
};

export function getMoneyBlogLinks(locale: Locale): MoneyBlogLink[] {
  const links: MoneyBlogLink[] = [];

  for (const postId of MONEY_BLOG_POST_IDS) {
    const post = allBlogPosts.find((p) => p.id === postId);
    if (!post || !hasBlogLocale(post, locale)) continue;
    const t = getBlogTranslation(post, locale);
    links.push({ postId, slug: t.slug, title: t.title });
  }

  return links;
}
