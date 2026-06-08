import type { MetadataRoute } from "next";
import { getBlogsForLocale } from "../lib/blogs";
import { locales, type Locale } from "../i18n/routing";

const baseUrl = "https://www.nexarentals.es";

const DEFAULT_LAST_MODIFIED = new Date("2026-06-08");

const routes = [
  "",

  // Core pages
  "/about",
  "/vehicles",
  "/blog",

  // Main money pages
  "/scooter-rental-magaluf",
  "/scooter-rental-mallorca",
  "/rent-scooter-mallorca-125cc",
  "/ebike-rental-mallorca",

  // Support SEO landing pages
  "/best-scooter-rental-magaluf",
  "/best-scooter-rental-mallorca",
  "/cheap-scooter-rental-magaluf",
  "/cheap-scooter-rental-mallorca",
  "/ebike-rental-mallorca-cheap",
];

function getStaticPriority(route: string) {
  if (route === "") return 1;

  if (
    route === "/scooter-rental-magaluf" ||
    route === "/scooter-rental-mallorca" ||
    route === "/rent-scooter-mallorca-125cc" ||
    route === "/ebike-rental-mallorca"
  ) {
    return 0.95;
  }

  if (
    route === "/best-scooter-rental-magaluf" ||
    route === "/best-scooter-rental-mallorca" ||
    route === "/cheap-scooter-rental-magaluf" ||
    route === "/cheap-scooter-rental-mallorca" ||
    route === "/ebike-rental-mallorca-cheap"
  ) {
    return 0.85;
  }

  if (route === "/vehicles") return 0.85;
  if (route === "/blog") return 0.75;
  if (route === "/about") return 0.7;

  return 0.7;
}

function getStaticChangeFrequency(
  route: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "") return "daily";
  if (route === "/blog") return "weekly";

  return "monthly";
}

function getBlogPriority(slug: string) {
  const highIntentKeywords = [
    "license",
    "licence",
    "125cc",
    "car-licence",
    "car-license",
    "tourists",
    "price",
    "cost",
    "deposit",
    "online",
    "magaluf",
    "palmanova",
    "routes",
    "places",
    "scooter-rental",
    "ebike",
    "e-bike",
  ];

  const isHighIntent = highIntentKeywords.some((keyword) =>
    slug.toLowerCase().includes(keyword)
  );

  return isHighIntent ? 0.75 : 0.65;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const rootEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: DEFAULT_LAST_MODIFIED,
    changeFrequency: "daily",
    priority: 1,
  };

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: getStaticChangeFrequency(route),
      priority: getStaticPriority(route),
    }))
  );

  const blogEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => {
    const localeKey = locale as Locale;

    return getBlogsForLocale(localeKey).map((blog) => ({
      url: `${baseUrl}/${locale}/blog/${blog.slug}`,
      lastModified: blog.updatedAt
        ? new Date(blog.updatedAt)
        : DEFAULT_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: getBlogPriority(blog.slug),
    }));
  });

  return [rootEntry, ...staticEntries, ...blogEntries];
}