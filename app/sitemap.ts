import type { MetadataRoute } from "next";

import { getBlogsForLocale } from "../lib/blogs";
import { type Locale } from "../i18n/routing";

import {
  SEO_BASE_URL,
  SEO_LANGUAGES,
  getSeoAlternates,
  getSeoUrl,
  seoRouteGroups,
  type SeoLanguage,
} from "../lib/seoRoutes";

const baseUrl = SEO_BASE_URL;

/**
 * Keep stable dates instead of using new Date() on every deployment.
 *
 * DEFAULT_LAST_MODIFIED:
 * Existing/core pages.
 *
 * SEO_LAST_MODIFIED:
 * The latest multilingual 22-page SEO campaign.
 */
const DEFAULT_LAST_MODIFIED = new Date("2026-06-08");
const SEO_LAST_MODIFIED = new Date("2026-08-29");

/**
 * Only these languages are intentionally being pushed into the
 * multilingual SEO indexing campaign right now.
 *
 * When Polish / Danish / Swedish / Dutch are finished, we add them
 * to lib/seoRoutes.ts and this sitemap automatically expands.
 */
const INDEXED_LOCALES = SEO_LANGUAGES;

/**
 * Routes that genuinely use the same route slug across the currently
 * indexed locales.
 *
 * Do NOT put translated SEO landing-page slugs here.
 */
const sharedStaticRoutes = [
  "",
  "/about",
  "/vehicles",
  "/blog",
  "/blog/scooter-rental-guides",
] as const;

/**
 * Existing English SEO / commercial routes that are separate from
 * the new 22-page multilingual campaign.
 *
 * These are intentionally included only under /en here so the sitemap
 * does not create fake combinations such as:
 *
 * /de/cheap-scooter-rental-mallorca
 * /fr/best-scooter-rental-mallorca
 *
 * Their translated equivalents can be mapped separately later.
 */
const englishOnlyRoutes = [
  "/scooter-rental-mallorca",
  "/rent-scooter-mallorca-125cc",
  "/ebike-rental-mallorca",
  "/best-scooter-rental-magaluf",
  "/best-scooter-rental-mallorca",
  "/cheap-scooter-rental-magaluf",
  "/cheap-scooter-rental-mallorca",
  "/ebike-rental-mallorca-cheap",
] as const;

function getStaticPriority(route: string) {
  if (route === "") return 1;

  if (
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

/**
 * These values are mainly organizational.
 * Google decides crawl frequency and ranking independently.
 */
function getSeoLandingPriority(routeId: string) {
  if (
    routeId === "motor-scooter-rental-mallorca" ||
    routeId === "rent-a-scooter-mallorca" ||
    routeId === "mallorca-scooter-rental" ||
    routeId === "scooter-hire-mallorca"
  ) {
    return 0.95;
  }

  if (
    routeId === "scooter-rental-magaluf" ||
    routeId === "scooter-rental-santa-ponsa" ||
    routeId === "scooter-rental-paguera" ||
    routeId === "scooter-rental-palma" ||
    routeId === "scooter-rental-palma-de-mallorca" ||
    routeId === "scooter-rental-palmanova" ||
    routeId === "scooter-rental-palma-nova"
  ) {
    return 0.93;
  }

  if (
    routeId === "scooter-rental-mallorca-prices" ||
    routeId === "scooter-rental-mallorca-driving-licence" ||
    routeId === "scooter-rental-mallorca-airport"
  ) {
    return 0.92;
  }

  return 0.9;
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

function getSharedAlternates(route: string) {
  const languages: Record<string, string> = {};

  for (const locale of INDEXED_LOCALES) {
    languages[locale] = `${baseUrl}/${locale}${route}`;
  }

  languages["x-default"] = `${baseUrl}/en${route}`;

  return languages;
}

function createSeoEntries(): MetadataRoute.Sitemap {
  return seoRouteGroups.flatMap((group) => {
    const alternates = getSeoAlternates(group);

    return INDEXED_LOCALES.map((language: SeoLanguage) => ({
      url: getSeoUrl(language, group.routes[language]),
      lastModified: SEO_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: getSeoLandingPriority(group.id),
      alternates: {
        languages: alternates,
      },
    }));
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  /**
   * Root / domain entry.
   */
  const rootEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: DEFAULT_LAST_MODIFIED,
    changeFrequency: "daily",
    priority: 1,
  };

  /**
   * Shared routes for the five languages currently being intentionally
   * indexed and promoted.
   */
  const sharedStaticEntries: MetadataRoute.Sitemap =
    INDEXED_LOCALES.flatMap((locale) =>
      sharedStaticRoutes.map((route) => ({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: DEFAULT_LAST_MODIFIED,
        changeFrequency: getStaticChangeFrequency(route),
        priority: getStaticPriority(route),
        alternates: {
          languages: getSharedAlternates(route),
        },
      }))
    );

  /**
   * Older English-only SEO / commercial pages.
   *
   * We keep them visible to Google without generating incorrect
   * translated URL combinations.
   */
  const englishOnlyEntries: MetadataRoute.Sitemap = englishOnlyRoutes.map(
    (route) => ({
      url: `${baseUrl}/en${route}`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: getStaticChangeFrequency(route),
      priority: getStaticPriority(route),
    })
  );

  /**
   * The main 22-page campaign:
   *
   * 22 page groups
   * x
   * 5 languages
   * =
   * 110 correctly localized SEO URLs.
   *
   * Every URL includes hreflang relationships to the other four
   * translated versions plus x-default.
   */
  const seoEntries = createSeoEntries();

  /**
   * Localized blog content.
   *
   * For now we intentionally include only the five languages that are
   * part of the current indexing campaign.
   */
  const blogEntries: MetadataRoute.Sitemap = INDEXED_LOCALES.flatMap(
    (locale) => {
      const localeKey = locale as Locale;

      return getBlogsForLocale(localeKey).map((blog) => ({
        url: `${baseUrl}/${locale}/blog/${blog.slug}`,
        lastModified: blog.updatedAt
          ? new Date(blog.updatedAt)
          : DEFAULT_LAST_MODIFIED,
        changeFrequency: "monthly" as const,
        priority: getBlogPriority(blog.slug),
      }));
    }
  );

  /**
   * Final defensive deduplication.
   *
   * This prevents the same production URL from accidentally appearing
   * twice if future route lists overlap.
   */
  const allEntries = [
    rootEntry,
    ...sharedStaticEntries,
    ...englishOnlyEntries,
    ...seoEntries,
    ...blogEntries,
  ];

  const entriesByUrl = new Map<
    string,
    MetadataRoute.Sitemap[number]
  >();

  for (const entry of allEntries) {
    entriesByUrl.set(entry.url, entry);
  }

  return Array.from(entriesByUrl.values());
}