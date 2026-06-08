import type { MetadataRoute } from "next";
import { getBlogsForLocale } from "../lib/blogs";
import { locales, type Locale } from "../i18n/routing";

const baseUrl = "https://www.nexarentals.es";

/**
 * Clean SEO sitemap for NEXA Rentals.
 *
 * Goal:
 * - Keep only strong indexable pages.
 * - Do NOT push every weak/duplicate blog to Google.
 * - Avoid changing lastModified on every deploy.
 * - Give Google a clear structure: money pages first, selected blogs second.
 */

const DEFAULT_LAST_MODIFIED = new Date("2026-06-08");

// Main pages that can directly bring bookings.
const moneyRoutes = [
  "",
  "/scooter-rental-magaluf",
  "/scooter-rental-mallorca",
  "/rent-scooter-mallorca-125cc",
  "/ebike-rental-mallorca",
  "/vehicles",
  "/about",
  "/blog",
];

// Keep these only if they are real landing pages with strong unique content.
// If any of these pages are thin, remove them later.
const supportSeoRoutes = [
  "/best-scooter-rental-magaluf",
  "/best-scooter-rental-mallorca",
];

// Blog slugs we want Google to focus on first.
// These are high-intent because they answer real booking questions.
const priorityBlogSlugs = new Set([
  // English
  "what-license-do-you-need-to-rent-a-125cc-scooter-in-spain",
  "can-you-rent-a-scooter-in-mallorca-with-a-car-licence",
  "can-tourists-rent-a-125cc-scooter-in-mallorca",
  "how-to-rent-a-scooter-online-in-magaluf-in-under-1-minute",
  "how-much-does-it-cost-to-rent-an-e-bike-in-magaluf",
  "scooter-rental-palmanova-prices-licence-pickup-info",
  "best-places-to-visit-by-scooter-from-magaluf",
  "best-scooter-routes-from-magaluf-for-first-time-visitors",
  "can-you-drive-from-magaluf-to-palma-by-scooter",
  "scooter-vs-car-rental-in-mallorca",
  "e-bike-vs-taxi-magaluf-cheapest-way-to-explore-mallorca",

  // Spanish
  "que-necesitas-alquilar-scooter-mallorca",
  "turistas-alquilar-scooter-125cc-mallorca",
  "alquilar-scooter-online-magaluf-un-minuto",
  "cuanto-cuesta-alquilar-scooter-magaluf",
  "alquiler-scooter-palmanova-precios-licencia-recogida",
  "mejor-lugar-alquilar-scooter-magaluf",
  "ir-de-magaluf-a-palma-en-scooter",
  "scooter-vs-coche-alquiler-mallorca",

  // French
  "conditions-louer-scooter-majorque",
  "touristes-louer-scooter-125cc-majorque",
  "louer-scooter-majorque-avec-permis-voiture",
  "louer-scooter-en-ligne-magaluf-moins-une-minute",
  "location-scooter-palmanova-prix-permis-retrait",
  "meilleur-endroit-louer-scooter-magaluf",
  "meilleurs-lieux-visiter-scooter-magaluf",

  // German
  "scooter-online-mieten-magaluf-unter-einer-minute",
  "was-ist-inklusive-scooter-mieten-magaluf",
  "sind-helme-bei-scooter-miete-mallorca-inklusive",

  // Italian
  "patente-noleggio-scooter-125cc-spagna",
  "noleggiare-scooter-online-magaluf-meno-un-minuto",
  "noleggio-scooter-palmanova-prezzi-patente-ritiro",
  "quanto-costa-noleggiare-scooter-magaluf",
  "migliori-luoghi-visitare-scooter-magaluf",

  // Portuguese
  "o-que-precisa-alugar-scooter-maiorca",
  "turistas-alugar-scooter-125cc-maiorca",
  "alugar-scooter-online-magaluf-menos-um-minuto",
  "aluguer-scooter-palmanova-precos-carta-levantamento",
  "melhor-local-alugar-scooter-magaluf",
  "melhores-locais-visitar-scooter-magaluf",

  // Swedish
  "vad-behover-du-hyra-skoter-mallorca",
  "turister-hyra-125cc-skoter-mallorca",
  "hyra-skoter-online-magaluf-under-en-minut",
  "skoterhyra-palmanova-priser-korkort-upphamtning",
  "basta-platsen-hyra-skoter-magaluf",
  "basta-platser-besoka-skoter-magaluf",
]);

function getPriority(route: string) {
  if (route === "") return 1;
  if (
    route === "/scooter-rental-magaluf" ||
    route === "/scooter-rental-mallorca" ||
    route === "/rent-scooter-mallorca-125cc" ||
    route === "/ebike-rental-mallorca"
  ) {
    return 0.95;
  }
  if (route === "/vehicles") return 0.85;
  if (route === "/about") return 0.75;
  if (route === "/blog") return 0.7;
  return 0.8;
}

function getChangeFrequency(
  route: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (route === "") return "daily";
  if (route === "/blog") return "weekly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [...moneyRoutes, ...supportSeoRoutes];

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
      changeFrequency: getChangeFrequency(route),
      priority: getPriority(route),
    }))
  );

  const blogEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => {
    const localeKey = locale as Locale;

    return getBlogsForLocale(localeKey)
      .filter((blog) => priorityBlogSlugs.has(blog.slug))
      .map((blog) => ({
        url: `${baseUrl}/${locale}/blog/${blog.slug}`,
        lastModified: blog.updatedAt
          ? new Date(blog.updatedAt)
          : DEFAULT_LAST_MODIFIED,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      }));
  });

  return [rootEntry, ...staticEntries, ...blogEntries];
}