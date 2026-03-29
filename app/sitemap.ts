import type { MetadataRoute } from "next";

const baseUrl = "https://www.nexarentals.es";

const locales = ["en", "es", "de", "fr", "it", "pt", "sv"];

const routes = [
  "",
  "/scooter-rental-mallorca",
  "/scooter-rental-magaluf",
  "/ebike-rental-mallorca",
  "/vehicles",
  "/about",
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