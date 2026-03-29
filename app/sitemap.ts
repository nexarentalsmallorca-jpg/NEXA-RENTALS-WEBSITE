import type { MetadataRoute } from "next";

const baseUrl = "https://www.nexarentals.es";

const locales = ["en", "es", "de", "fr", "it", "pt", "sv"];

// 🔥 ALL SEO ROUTES (MAIN + ATTACK PAGES)
const routes = [
  "",
  "/scooter-rental-mallorca",
  "/cheap-scooter-rental-mallorca",
  "/scooter-rental-magaluf",
  "/ebike-rental-mallorca",
  "/vehicles",
  "/about",

  // 🔥 FUTURE SEO PAGES (we will build next)
  "/rent-scooter-mallorca-125cc",
  "/best-scooter-rental-mallorca",
  "/cheap-scooter-rental-magaluf",
  "/ebike-rental-mallorca-cheap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    routes.forEach((route) => {
      urls.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.9,
      });
    });
  });

  return urls;
}