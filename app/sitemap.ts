import type { MetadataRoute } from "next";
import { getBlogsForLocale } from "../lib/blogs";
import { locales, type Locale } from "../i18n/routing";

const baseUrl = "https://www.nexarentals.es";
const DEFAULT_LAST_MODIFIED = new Date("2026-06-08");

/**
 * NEXA Rentals sitemap strategy:
 * - Keep ALL important pages and ALL blogs visible to Google.
 * - Give strongest priority to real booking/money pages.
 * - Give hub/blog pages enough priority so Google crawls the full content cluster.
 * - Avoid using new Date() on every deploy because that makes every URL look freshly changed.
 */

const staticRoutes = [
  "",

  // Core pages
  "/about",
  "/vehicles",
  "/blog",
  "/blog/scooter-rental-guides",

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

  if (route === "/blog/scooter-rental-guides") {
    return 0.9;
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
  if (route === "/blog") return 0.8;
  if (route === "/about") return 0.7;

  return 0.7;
}

function getStaticChangeFrequency(
  route: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "") return "daily";
  if (route === "/blog" || route === "/blog/scooter-rental-guides") {
    return "weekly";
  }

  return "monthly";
}

function getBlogPriority(slug: string) {
  const normalizedSlug = slug.toLowerCase();

  const veryHighIntentKeywords = [
    "license",
    "licence",
    "korkort",
    "patente",
    "carta",
    "permis",
    "125cc",
    "deposit",
    "deposito",
    "caution",
    "caucao",
    "deposition",
    "price",
    "prices",
    "cost",
    "precio",
    "prix",
    "preco",
    "prezzo",
    "kostar",
    "online",
    "book",
    "rent",
    "alquilar",
    "louer",
    "mieten",
    "noleggiare",
    "alugar",
    "hyra",
  ];

  const localIntentKeywords = [
    "magaluf",
    "palmanova",
    "mallorca",
    "majorque",
    "maiorca",
    "spain",
    "spanien",
    "spagna",
    "espana",
  ];

  const contentClusterKeywords = [
    "scooter",
    "skoter",
    "ebike",
    "e-bike",
    "elcykel",
    "routes",
    "rutas",
    "rotas",
    "itinerari",
    "places",
    "lugares",
    "lieux",
    "luoghi",
    "platser",
    "helmet",
    "helmets",
    "casco",
    "casques",
    "caschi",
    "hjalmar",
    "taxi",
    "car",
    "coche",
    "voiture",
    "auto",
    "carro",
  ];

  const hasVeryHighIntent = veryHighIntentKeywords.some((keyword) =>
    normalizedSlug.includes(keyword)
  );

  const hasLocalIntent = localIntentKeywords.some((keyword) =>
    normalizedSlug.includes(keyword)
  );

  const hasClusterIntent = contentClusterKeywords.some((keyword) =>
    normalizedSlug.includes(keyword)
  );

  if (hasVeryHighIntent && hasLocalIntent) return 0.78;
  if (hasVeryHighIntent) return 0.75;
  if (hasLocalIntent && hasClusterIntent) return 0.72;
  if (hasClusterIntent) return 0.68;

  return 0.65;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const rootEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: DEFAULT_LAST_MODIFIED,
    changeFrequency: "daily",
    priority: 1,
  };

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
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