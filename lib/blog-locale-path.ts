import { locales, type Locale } from "@/i18n/routing";
import { blogSlugByAnySlug } from "@/lib/blog-slug-index";

export function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return `/${nextLocale}`;

  const hasLocale = locales.includes(parts[0] as Locale);
  const rest = hasLocale ? parts.slice(1) : parts;

  const nextPath = `/${nextLocale}${rest.length ? `/${rest.join("/")}` : ""}`;

  return nextPath.replace(/\/+$/, "") || `/${nextLocale}`;
}

/**
 * When switching language on a blog article, map to the same post's slug in the target locale.
 */
export function replaceLocaleInPathWithBlog(
  pathname: string,
  nextLocale: Locale
): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 3) return replaceLocaleInPath(pathname, nextLocale);

  if (parts[1] !== "blog") return replaceLocaleInPath(pathname, nextLocale);

  const slug = parts[2];
  if (!slug) return `/${nextLocale}/blog`;

  const entry = blogSlugByAnySlug[slug];
  const targetSlug = entry?.[nextLocale];
  if (!targetSlug) return `/${nextLocale}/blog`;

  const rest = parts.slice(3);
  const base = `/${nextLocale}/blog/${targetSlug}`;
  return rest.length ? `${base}/${rest.join("/")}` : base;
}
