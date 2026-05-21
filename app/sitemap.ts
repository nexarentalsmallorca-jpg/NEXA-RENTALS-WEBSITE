import type { MetadataRoute } from "next";
import { getBlogsForLocale } from "../lib/blogs";
import { locales, type Locale } from "../i18n/routing";

const baseUrl = "https://www.nexarentals.es";

// 🔥 ALL SEO ROUTES (MAIN + ATTACK PAGES)
const routes = [
  "",

  // CORE PAGES
  "/vehicles",
  "/about",

  // MAIN SEO PAGES
  "/scooter-rental-mallorca",
  "/cheap-scooter-rental-mallorca",
  "/scooter-rental-magaluf",
  "/ebike-rental-mallorca",

  // 🔥 HIGH INTENT PAGES
  "/rent-scooter-mallorca-125cc",
  "/best-scooter-rental-mallorca",
  "/best-scooter-rental-magaluf",

  // 🔥 FUTURE / EXPANSION PAGES
  "/cheap-scooter-rental-magaluf",
  "/ebike-rental-mallorca-cheap",

  "/blog",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === "" || route === "/blog"
        ? "daily"
        : "weekly") as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: route === "" ? 1 : route === "/blog" ? 0.85 : 0.9,
    }))
  );

  const blogEntries = locales.flatMap((locale) => {
    const localeKey = locale as Locale;
    return getBlogsForLocale(localeKey).map((blog) => ({
      url: `${baseUrl}/${locale}/blog/${blog.slug}`,
      lastModified: new Date(blog.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  });

  return [...staticEntries, ...blogEntries];
}