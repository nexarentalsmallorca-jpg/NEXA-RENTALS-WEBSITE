import type { MetadataRoute } from "next";

const baseUrl = "https://www.nexarentals.es";

const locales = ["en", "es", "de", "fr", "it", "pt", "sv"];

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

  // 🔥 FUTURE / EXPANSION PAGES
  "/cheap-scooter-rental-magaluf",
  "/ebike-rental-mallorca-cheap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.9,
    }))
  );
}