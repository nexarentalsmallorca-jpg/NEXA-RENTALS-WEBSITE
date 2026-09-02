export const SEO_BASE_URL = "https://www.nexarentals.es";

export const SEO_LANGUAGES = ["en", "de", "fr", "it", "es"] as const;

export type SeoLanguage = (typeof SEO_LANGUAGES)[number];

export type SeoRouteGroup = {
  id: string;
  routes: Record<SeoLanguage, string>;
};

/**
 * Master multilingual map for the 22 NEXA Rentals SEO landing pages.
 *
 * IMPORTANT:
 * - Every object represents the SAME search-intent page in 5 languages.
 * - These exact routes are used to generate hreflang relationships.
 * - Do not place unrelated/legacy SEO pages into these groups.
 */
export const seoRouteGroups: SeoRouteGroup[] = [
  {
    id: "motor-scooter-rental-mallorca",
    routes: {
      en: "/motor-scooter-rental-mallorca",
      de: "/motorroller-mieten-mallorca",
      fr: "/location-de-scooter-majorque",
      it: "/noleggio-motorino-maiorca",
      es: "/alquiler-motos-scooter-mallorca",
    },
  },
  {
    id: "scooter-rental-camp-de-mar",
    routes: {
      en: "/scooter-rental-camp-de-mar",
      de: "/roller-mieten-camp-de-mar",
      fr: "/location-scooter-camp-de-mar",
      it: "/noleggio-scooter-camp-de-mar",
      es: "/alquiler-scooter-camp-de-mar",
    },
  },
  {
    id: "scooter-rental-el-arenal",
    routes: {
      en: "/scooter-rental-el-arenal",
      de: "/roller-mieten-el-arenal",
      fr: "/location-scooter-el-arenal",
      it: "/noleggio-scooter-el-arenal",
      es: "/alquiler-scooter-el-arenal",
    },
  },
  {
    id: "scooter-rental-el-toro",
    routes: {
      en: "/scooter-rental-el-toro",
      de: "/roller-mieten-el-toro",
      fr: "/location-scooter-el-toro",
      it: "/noleggio-scooter-el-toro",
      es: "/alquiler-scooter-el-toro",
    },
  },
  {
    id: "scooter-rental-magaluf",
    routes: {
      en: "/scooter-rental-magaluf",
      de: "/roller-mieten-magaluf",
      fr: "/location-scooter-magaluf",
      it: "/noleggio-scooter-magaluf",
      es: "/alquiler-scooter-magaluf",
    },
  },
  {
    id: "rent-a-scooter-mallorca",
    routes: {
      en: "/rent-a-scooter-mallorca",
      de: "/roller-mieten-mallorca",
      fr: "/louer-un-scooter-majorque",
      it: "/affitto-scooter-maiorca",
      es: "/alquilar-scooter-mallorca",
    },
  },
  {
    id: "scooter-rental-mallorca-airport",
    routes: {
      en: "/scooter-rental-mallorca-airport",
      de: "/roller-mieten-mallorca-flughafen",
      fr: "/location-scooter-aeroport-majorque",
      it: "/noleggio-scooter-aeroporto-maiorca",
      es: "/alquiler-scooter-aeropuerto-mallorca",
    },
  },
  {
    id: "scooter-rental-mallorca-driving-licence",
    routes: {
      en: "/scooter-rental-mallorca-driving-licence",
      de: "/roller-mieten-mallorca-fuehrerschein",
      fr: "/location-scooter-majorque-permis",
      it: "/patente-per-noleggio-scooter-maiorca",
      es: "/alquiler-scooter-mallorca-carnet-conducir",
    },
  },
  {
    id: "scooter-rental-mallorca-prices",
    routes: {
      en: "/scooter-rental-mallorca-prices",
      de: "/roller-mieten-mallorca-preise",
      fr: "/prix-location-scooter-majorque",
      it: "/prezzi-noleggio-scooter-maiorca",
      es: "/precios-alquiler-scooter-mallorca",
    },
  },
  {
    id: "scooter-rental-paguera",
    routes: {
      en: "/scooter-rental-paguera",
      de: "/roller-mieten-paguera",
      fr: "/location-scooter-paguera",
      it: "/noleggio-scooter-paguera",
      es: "/alquiler-scooter-paguera",
    },
  },
  {
    id: "scooter-rental-palma",
    routes: {
      en: "/scooter-rental-palma",
      de: "/roller-mieten-palma",
      fr: "/location-scooter-palma",
      it: "/noleggio-scooter-palma",
      es: "/alquiler-scooter-palma",
    },
  },
  {
    id: "scooter-rental-palma-de-mallorca",
    routes: {
      en: "/scooter-rental-palma-de-mallorca",
      de: "/roller-mieten-palma-de-mallorca",
      fr: "/location-scooter-palma-de-majorque",
      it: "/noleggio-scooter-palma-di-maiorca",
      es: "/alquiler-scooter-palma-de-mallorca",
    },
  },
  {
    id: "scooter-rental-palma-nova",
    routes: {
      en: "/scooter-rental-palma-nova",
      de: "/roller-mieten-palma-nova",
      fr: "/location-scooter-palma-nova",
      it: "/noleggio-scooter-palma-nova",
      es: "/alquiler-scooter-palma-nova",
    },
  },
  {
    id: "scooter-rental-palmanova",
    routes: {
      en: "/scooter-rental-palmanova",
      de: "/roller-mieten-palmanova",
      fr: "/location-scooter-palmanova",
      it: "/noleggio-scooter-palmanova",
      es: "/alquiler-scooter-palmanova",
    },
  },
  {
    id: "scooter-rental-playa-de-palma",
    routes: {
      en: "/scooter-rental-playa-de-palma",
      de: "/roller-mieten-playa-de-palma",
      fr: "/location-scooter-playa-de-palma",
      it: "/noleggio-scooter-playa-de-palma",
      es: "/alquiler-scooter-playa-de-palma",
    },
  },
  {
    id: "scooter-rental-port-andratx",
    routes: {
      en: "/scooter-rental-port-andratx",
      de: "/roller-mieten-port-andratx",
      fr: "/location-scooter-port-andratx",
      it: "/noleggio-scooter-port-andratx",
      es: "/alquiler-scooter-puerto-andratx",
    },
  },
  {
    id: "scooter-rental-portals-nous",
    routes: {
      en: "/scooter-rental-portals-nous",
      de: "/roller-mieten-portals-nous",
      fr: "/location-scooter-portals-nous",
      it: "/noleggio-scooter-portals-nous",
      es: "/alquiler-scooter-portals-nous",
    },
  },
  {
    id: "scooter-rental-santa-ponsa",
    routes: {
      en: "/scooter-rental-santa-ponsa",
      de: "/roller-mieten-santa-ponsa",
      fr: "/location-scooter-santa-ponsa",
      it: "/noleggio-scooter-santa-ponsa",
      es: "/alquiler-scooter-santa-ponsa",
    },
  },
  {
    id: "mallorca-scooter-rental",
    routes: {
      en: "/mallorca-scooter-rental",
      de: "/rollerverleih-mallorca",
      fr: "/scooter-majorque-location",
      it: "/scooter-a-noleggio-maiorca",
      es: "/mallorca-alquiler-scooter",
    },
  },
  {
    id: "paguera-scooter-rental",
    routes: {
      en: "/paguera-scooter-rental",
      de: "/rollerverleih-paguera",
      fr: "/louer-un-scooter-paguera",
      it: "/scooter-a-noleggio-paguera",
      es: "/paguera-alquiler-scooter",
    },
  },
  {
    id: "santa-ponsa-scooter-rental",
    routes: {
      en: "/santa-ponsa-scooter-rental",
      de: "/rollerverleih-santa-ponsa",
      fr: "/louer-un-scooter-santa-ponsa",
      it: "/scooter-a-noleggio-santa-ponsa",
      es: "/santa-ponsa-alquiler-scooter",
    },
  },
  {
    id: "scooter-hire-mallorca",
    routes: {
      en: "/scooter-hire-mallorca",
      de: "/scooter-mieten-mallorca",
      fr: "/location-scooter-majorque",
      it: "/noleggio-scooter-maiorca",
      es: "/alquiler-de-scooters-en-mallorca",
    },
  },
];

export function getSeoUrl(language: SeoLanguage, path: string) {
  return `${SEO_BASE_URL}/${language}${path}`;
}

export function getSeoAlternates(group: SeoRouteGroup) {
  return {
    en: getSeoUrl("en", group.routes.en),
    de: getSeoUrl("de", group.routes.de),
    fr: getSeoUrl("fr", group.routes.fr),
    it: getSeoUrl("it", group.routes.it),
    es: getSeoUrl("es", group.routes.es),
    "x-default": getSeoUrl("en", group.routes.en),
  };
}

export function findSeoRouteGroup(
  language: SeoLanguage,
  path: string
): SeoRouteGroup | undefined {
  return seoRouteGroups.find((group) => group.routes[language] === path);
}