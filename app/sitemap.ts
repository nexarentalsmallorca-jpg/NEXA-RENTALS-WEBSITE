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
 * Stable modification dates.
 *
 * Do not use new Date() here on every build because that makes Google
 * think every URL changed on every deployment.
 */
const DEFAULT_LAST_MODIFIED = new Date("2026-06-08");

/**
 * Existing multilingual rental SEO campaign.
 */
const SEO_LAST_MODIFIED = new Date("2026-08-29");

/**
 * New hotel / Airbnb delivery SEO campaign.
 */
const DELIVERY_SEO_LAST_MODIFIED = new Date("2026-09-30");

/**
 * Languages currently intentionally indexed.
 *
 * Existing SEO:
 * EN / ES / DE / FR / IT
 */
const INDEXED_LOCALES = SEO_LANGUAGES;

/**
 * Normal website routes that use the same route slug in every language.
 *
 * Never place translated SEO slugs here.
 */
const sharedStaticRoutes = [
  "",
  "/about",
  "/vehicles",
  "/blog",
  "/blog/scooter-rental-guides",
] as const;

/**
 * Older English-only commercial / SEO routes.
 *
 * We intentionally do not manufacture translated equivalents here.
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

/* =========================================================
   DELIVERY SEO CAMPAIGN
   ========================================================= */

/**
 * These are the 22 locations created by:
 *
 * scripts/generate-delivery-seo-pages.mjs
 *
 * Do not add a location here unless the actual page files exist.
 */
const DELIVERY_AREAS = [
  {
    id: "magaluf",
    slug: "magaluf",
    priority: 0.96,
  },
  {
    id: "palmanova",
    slug: "palmanova",
    priority: 0.96,
  },
  {
    id: "santa-ponsa",
    slug: "santa-ponsa",
    priority: 0.96,
  },
  {
    id: "peguera",
    slug: "peguera",
    priority: 0.95,
  },
  {
    id: "portals-nous",
    slug: "portals-nous",
    priority: 0.95,
  },
  {
    id: "el-toro",
    slug: "el-toro",
    priority: 0.95,
  },
  {
    id: "cala-vinyes",
    slug: "cala-vinyes",
    priority: 0.94,
  },
  {
    id: "playa-de-palma",
    slug: "playa-de-palma",
    priority: 0.96,
  },
  {
    id: "palma",
    slug: "palma",
    priority: 0.96,
  },
  {
    id: "cala-major",
    slug: "cala-major",
    priority: 0.94,
  },
  {
    id: "torrenova",
    slug: "torrenova",
    priority: 0.93,
  },
  {
    id: "costa-de-la-calma",
    slug: "costa-de-la-calma",
    priority: 0.92,
  },
  {
    id: "port-adriano",
    slug: "port-adriano",
    priority: 0.93,
  },
  {
    id: "puerto-portals",
    slug: "puerto-portals",
    priority: 0.93,
  },
  {
    id: "sol-de-mallorca",
    slug: "sol-de-mallorca",
    priority: 0.92,
  },
  {
    id: "son-ferrer",
    slug: "son-ferrer",
    priority: 0.91,
  },
  {
    id: "costa-den-blanes",
    slug: "costa-den-blanes",
    priority: 0.91,
  },
  {
    id: "bendinat",
    slug: "bendinat",
    priority: 0.91,
  },
  {
    id: "illetes",
    slug: "illetes",
    priority: 0.92,
  },
  {
    id: "portals-vells",
    slug: "portals-vells",
    priority: 0.9,
  },
  {
    id: "cala-fornells",
    slug: "cala-fornells",
    priority: 0.9,
  },
  {
    id: "calvia",
    slug: "calvia",
    priority: 0.92,
  },
] as const;

/**
 * Every delivery page uses a translated slug prefix.
 *
 * Example:
 *
 * EN
 * /en/scooter-delivery-santa-ponsa
 *
 * ES
 * /es/entrega-scooter-santa-ponsa
 *
 * DE
 * /de/roller-lieferung-santa-ponsa
 *
 * FR
 * /fr/livraison-scooter-santa-ponsa
 *
 * IT
 * /it/consegna-scooter-santa-ponsa
 */
const DELIVERY_LANGUAGE_PREFIXES = {
  en: "scooter-delivery",
  es: "entrega-scooter",
  de: "roller-lieferung",
  fr: "livraison-scooter",
  it: "consegna-scooter",
} as const;

type DeliveryLanguage =
  keyof typeof DELIVERY_LANGUAGE_PREFIXES;

const DELIVERY_LANGUAGES: readonly DeliveryLanguage[] = [
  "en",
  "es",
  "de",
  "fr",
  "it",
];

/**
 * Create the production pathname for one delivery page.
 */
function getDeliveryPath(
  language: DeliveryLanguage,
  areaSlug: string
) {
  const prefix =
    DELIVERY_LANGUAGE_PREFIXES[language];

  return `/${language}/${prefix}-${areaSlug}`;
}

/**
 * Create the complete production URL.
 */
function getDeliveryUrl(
  language: DeliveryLanguage,
  areaSlug: string
) {
  return `${baseUrl}${getDeliveryPath(
    language,
    areaSlug
  )}`;
}

/**
 * hreflang family for one location.
 *
 * Every delivery page points to:
 *
 * EN
 * ES
 * DE
 * FR
 * IT
 * x-default -> EN
 */
function getDeliveryAlternates(
  areaSlug: string
) {
  const languages: Record<
    string,
    string
  > = {};

  for (
    const language of DELIVERY_LANGUAGES
  ) {
    languages[language] =
      getDeliveryUrl(
        language,
        areaSlug
      );
  }

  languages["x-default"] =
    getDeliveryUrl(
      "en",
      areaSlug
    );

  return languages;
}

/**
 * Generate:
 *
 * 22 areas
 * x
 * 5 languages
 * =
 * 110 delivery URLs.
 */
function createDeliverySeoEntries(): MetadataRoute.Sitemap {
  return DELIVERY_AREAS.flatMap(
    (area) => {
      const alternates =
        getDeliveryAlternates(
          area.slug
        );

      return DELIVERY_LANGUAGES.map(
        (language) => ({
          url:
            getDeliveryUrl(
              language,
              area.slug
            ),

          lastModified:
            DELIVERY_SEO_LAST_MODIFIED,

          /**
           * These are commercial landing pages.
           *
           * Monthly is reasonable because the page itself is
           * not expected to change every day.
           */
          changeFrequency:
            "monthly" as const,

          priority:
            area.priority,

          alternates: {
            languages:
              alternates,
          },
        })
      );
    }
  );
}

/* =========================================================
   EXISTING STATIC SEO LOGIC
   ========================================================= */

function getStaticPriority(
  route: string
) {
  if (
    route === ""
  ) {
    return 1;
  }

  if (
    route ===
      "/scooter-rental-mallorca" ||
    route ===
      "/rent-scooter-mallorca-125cc" ||
    route ===
      "/ebike-rental-mallorca"
  ) {
    return 0.95;
  }

  if (
    route ===
    "/blog/scooter-rental-guides"
  ) {
    return 0.9;
  }

  if (
    route ===
      "/best-scooter-rental-magaluf" ||
    route ===
      "/best-scooter-rental-mallorca" ||
    route ===
      "/cheap-scooter-rental-magaluf" ||
    route ===
      "/cheap-scooter-rental-mallorca" ||
    route ===
      "/ebike-rental-mallorca-cheap"
  ) {
    return 0.85;
  }

  if (
    route === "/vehicles"
  ) {
    return 0.85;
  }

  if (
    route === "/blog"
  ) {
    return 0.8;
  }

  if (
    route === "/about"
  ) {
    return 0.7;
  }

  return 0.7;
}

function getStaticChangeFrequency(
  route: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (
    route === ""
  ) {
    return "daily";
  }

  if (
    route === "/blog" ||
    route ===
      "/blog/scooter-rental-guides"
  ) {
    return "weekly";
  }

  return "monthly";
}

/**
 * Priority for the EXISTING multilingual
 * rental SEO landing-page campaign.
 *
 * Sitemap priority does not determine rankings.
 * It is primarily organizational.
 */
function getSeoLandingPriority(
  routeId: string
) {
  if (
    routeId ===
      "motor-scooter-rental-mallorca" ||
    routeId ===
      "rent-a-scooter-mallorca" ||
    routeId ===
      "mallorca-scooter-rental" ||
    routeId ===
      "scooter-hire-mallorca"
  ) {
    return 0.95;
  }

  if (
    routeId ===
      "scooter-rental-magaluf" ||
    routeId ===
      "scooter-rental-santa-ponsa" ||
    routeId ===
      "scooter-rental-paguera" ||
    routeId ===
      "scooter-rental-palma" ||
    routeId ===
      "scooter-rental-palma-de-mallorca" ||
    routeId ===
      "scooter-rental-palmanova" ||
    routeId ===
      "scooter-rental-palma-nova"
  ) {
    return 0.93;
  }

  if (
    routeId ===
      "scooter-rental-mallorca-prices" ||
    routeId ===
      "scooter-rental-mallorca-driving-licence" ||
    routeId ===
      "scooter-rental-mallorca-airport"
  ) {
    return 0.92;
  }

  return 0.9;
}

/* =========================================================
   BLOG PRIORITIES
   ========================================================= */

function getBlogPriority(
  slug: string
) {
  const normalizedSlug =
    slug.toLowerCase();

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

  const hasVeryHighIntent =
    veryHighIntentKeywords.some(
      (keyword) =>
        normalizedSlug.includes(
          keyword
        )
    );

  const hasLocalIntent =
    localIntentKeywords.some(
      (keyword) =>
        normalizedSlug.includes(
          keyword
        )
    );

  const hasClusterIntent =
    contentClusterKeywords.some(
      (keyword) =>
        normalizedSlug.includes(
          keyword
        )
    );

  if (
    hasVeryHighIntent &&
    hasLocalIntent
  ) {
    return 0.78;
  }

  if (
    hasVeryHighIntent
  ) {
    return 0.75;
  }

  if (
    hasLocalIntent &&
    hasClusterIntent
  ) {
    return 0.72;
  }

  if (
    hasClusterIntent
  ) {
    return 0.68;
  }

  return 0.65;
}

/* =========================================================
   SHARED LANGUAGE ALTERNATES
   ========================================================= */

function getSharedAlternates(
  route: string
) {
  const languages: Record<
    string,
    string
  > = {};

  for (
    const locale of INDEXED_LOCALES
  ) {
    languages[locale] =
      `${baseUrl}/${locale}${route}`;
  }

  languages["x-default"] =
    `${baseUrl}/en${route}`;

  return languages;
}

/* =========================================================
   EXISTING 110-PAGE MULTILINGUAL RENTAL CAMPAIGN
   ========================================================= */

function createSeoEntries(): MetadataRoute.Sitemap {
  return seoRouteGroups.flatMap(
    (group) => {
      const alternates =
        getSeoAlternates(
          group
        );

      return INDEXED_LOCALES.map(
        (
          language: SeoLanguage
        ) => ({
          url:
            getSeoUrl(
              language,
              group.routes[
                language
              ]
            ),

          lastModified:
            SEO_LAST_MODIFIED,

          changeFrequency:
            "monthly" as const,

          priority:
            getSeoLandingPriority(
              group.id
            ),

          alternates: {
            languages:
              alternates,
          },
        })
      );
    }
  );
}

/* =========================================================
   SITEMAP
   ========================================================= */

export default function sitemap(): MetadataRoute.Sitemap {
  /**
   * Root domain.
   */
  const rootEntry: MetadataRoute.Sitemap[number] =
    {
      url: baseUrl,

      lastModified:
        DEFAULT_LAST_MODIFIED,

      changeFrequency:
        "daily",

      priority:
        1,
    };

  /**
   * Standard localized website routes.
   */
  const sharedStaticEntries: MetadataRoute.Sitemap =
    INDEXED_LOCALES.flatMap(
      (locale) =>
        sharedStaticRoutes.map(
          (route) => ({
            url:
              `${baseUrl}/${locale}${route}`,

            lastModified:
              DEFAULT_LAST_MODIFIED,

            changeFrequency:
              getStaticChangeFrequency(
                route
              ),

            priority:
              getStaticPriority(
                route
              ),

            alternates: {
              languages:
                getSharedAlternates(
                  route
                ),
            },
          })
        )
    );

  /**
   * Existing English-only pages.
   */
  const englishOnlyEntries: MetadataRoute.Sitemap =
    englishOnlyRoutes.map(
      (route) => ({
        url:
          `${baseUrl}/en${route}`,

        lastModified:
          DEFAULT_LAST_MODIFIED,

        changeFrequency:
          getStaticChangeFrequency(
            route
          ),

        priority:
          getStaticPriority(
            route
          ),
      })
    );

  /**
   * Existing multilingual rental campaign.
   *
   * 22 groups x 5 languages = 110 URLs.
   */
  const seoEntries =
    createSeoEntries();

  /**
   * NEW DELIVERY CAMPAIGN.
   *
   * 22 locations x 5 languages = 110 URLs.
   */
  const deliverySeoEntries =
    createDeliverySeoEntries();

  /**
   * Localized blog content.
   */
  const blogEntries: MetadataRoute.Sitemap =
    INDEXED_LOCALES.flatMap(
      (locale) => {
        const localeKey =
          locale as Locale;

        return getBlogsForLocale(
          localeKey
        ).map(
          (blog) => ({
            url:
              `${baseUrl}/${locale}/blog/${blog.slug}`,

            lastModified:
              blog.updatedAt
                ? new Date(
                    blog.updatedAt
                  )
                : DEFAULT_LAST_MODIFIED,

            changeFrequency:
              "monthly" as const,

            priority:
              getBlogPriority(
                blog.slug
              ),
          })
        );
      }
    );

  /**
   * Combine everything.
   */
  const allEntries = [
    rootEntry,

    ...sharedStaticEntries,

    ...englishOnlyEntries,

    ...seoEntries,

    ...deliverySeoEntries,

    ...blogEntries,
  ];

  /**
   * Defensive deduplication.
   *
   * If the exact same production URL somehow appears
   * in two lists, only one sitemap entry survives.
   */
  const entriesByUrl =
    new Map<
      string,
      MetadataRoute.Sitemap[number]
    >();

  for (
    const entry of allEntries
  ) {
    entriesByUrl.set(
      entry.url,
      entry
    );
  }

  return Array.from(
    entriesByUrl.values()
  );
}