import type { Locale } from "@/i18n/routing";

/** Maps any locale slug to post id and per-locale slugs (for client-side language switching). */
export type BlogSlugEntry = { id: string } & Partial<Record<Locale, string>>;

export const blogSlugByAnySlug: Record<string, BlogSlugEntry> = {
  "how-much-does-it-cost-to-rent-a-scooter-in-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "en": "how-much-does-it-cost-to-rent-a-scooter-in-magaluf"
  },
  "cuanto-cuesta-alquilar-scooter-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "es": "cuanto-cuesta-alquilar-scooter-magaluf"
  },
  "was-kostet-scooter-mieten-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "de": "was-kostet-scooter-mieten-magaluf"
  },
  "prix-location-scooter-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "fr": "prix-location-scooter-magaluf"
  },
  "quanto-costa-noleggiare-scooter-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "it": "quanto-costa-noleggiare-scooter-magaluf"
  },
  "quanto-custa-alugar-scooter-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "pt": "quanto-custa-alugar-scooter-magaluf"
  },
  "vad-kostar-hyra-skoter-magaluf": {
    "id": "scooter-rental-price-magaluf",
    "sv": "vad-kostar-hyra-skoter-magaluf"
  },
  "what-license-do-you-need-to-rent-a-125cc-scooter-in-spain": {
    "id": "license-125cc-scooter-spain",
    "en": "what-license-do-you-need-to-rent-a-125cc-scooter-in-spain"
  },
  "que-licencia-necesitas-alquilar-scooter-125cc-espana": {
    "id": "license-125cc-scooter-spain",
    "es": "que-licencia-necesitas-alquilar-scooter-125cc-espana"
  },
  "welchen-fuehrerschein-brauchst-du-125cc-scooter-spanien": {
    "id": "license-125cc-scooter-spain",
    "de": "welchen-fuehrerschein-brauchst-du-125cc-scooter-spanien"
  },
  "permis-location-scooter-125cc-espagne": {
    "id": "license-125cc-scooter-spain",
    "fr": "permis-location-scooter-125cc-espagne"
  },
  "patente-noleggio-scooter-125cc-spagna": {
    "id": "license-125cc-scooter-spain",
    "it": "patente-noleggio-scooter-125cc-spagna"
  },
  "carta-necessaria-alugar-scooter-125cc-espanha": {
    "id": "license-125cc-scooter-spain",
    "pt": "carta-necessaria-alugar-scooter-125cc-espanha"
  },
  "vilket-korkort-hyra-125cc-skoter-spanien": {
    "id": "license-125cc-scooter-spain",
    "sv": "vilket-korkort-hyra-125cc-skoter-spanien"
  },
  "how-much-does-it-cost-to-rent-an-e-bike-in-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "en": "how-much-does-it-cost-to-rent-an-e-bike-in-magaluf"
  },
  "precio-alquiler-ebike-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "es": "precio-alquiler-ebike-magaluf"
  },
  "was-kostet-ebike-mieten-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "de": "was-kostet-ebike-mieten-magaluf"
  },
  "prix-location-ebike-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "fr": "prix-location-ebike-magaluf"
  },
  "prezzo-noleggio-ebike-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "it": "prezzo-noleggio-ebike-magaluf"
  },
  "preco-aluguer-ebike-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "pt": "preco-aluguer-ebike-magaluf"
  },
  "vad-kostar-hyra-elcykel-magaluf": {
    "id": "ebike-rental-price-magaluf",
    "sv": "vad-kostar-hyra-elcykel-magaluf"
  },
  "best-place-to-rent-a-scooter-in-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "en": "best-place-to-rent-a-scooter-in-magaluf"
  },
  "mejor-lugar-alquilar-scooter-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "es": "mejor-lugar-alquilar-scooter-magaluf"
  },
  "bester-ort-scooter-mieten-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "de": "bester-ort-scooter-mieten-magaluf"
  },
  "meilleur-endroit-louer-scooter-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "fr": "meilleur-endroit-louer-scooter-magaluf"
  },
  "miglior-posto-noleggiare-scooter-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "it": "miglior-posto-noleggiare-scooter-magaluf"
  },
  "melhor-local-alugar-scooter-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "pt": "melhor-local-alugar-scooter-magaluf"
  },
  "basta-platsen-hyra-skoter-magaluf": {
    "id": "best-place-rent-scooter-magaluf",
    "sv": "basta-platsen-hyra-skoter-magaluf"
  },
  "what-do-you-need-to-rent-a-scooter-in-mallorca": {
    "id": "what-you-need-rent-scooter-mallorca",
    "en": "what-do-you-need-to-rent-a-scooter-in-mallorca"
  },
  "que-necesitas-alquilar-scooter-mallorca": {
    "id": "what-you-need-rent-scooter-mallorca",
    "es": "que-necesitas-alquilar-scooter-mallorca"
  },
  "was-brauchst-du-scooter-mieten-mallorca": {
    "id": "what-you-need-rent-scooter-mallorca",
    "de": "was-brauchst-du-scooter-mieten-mallorca"
  },
  "conditions-louer-scooter-majorque": {
    "id": "what-you-need-rent-scooter-mallorca",
    "fr": "conditions-louer-scooter-majorque"
  },
  "cosa-serve-noleggiare-scooter-maiorca": {
    "id": "what-you-need-rent-scooter-mallorca",
    "it": "cosa-serve-noleggiare-scooter-maiorca"
  },
  "o-que-precisa-alugar-scooter-maiorca": {
    "id": "what-you-need-rent-scooter-mallorca",
    "pt": "o-que-precisa-alugar-scooter-maiorca"
  },
  "vad-behover-du-hyra-skoter-mallorca": {
    "id": "what-you-need-rent-scooter-mallorca",
    "sv": "vad-behover-du-hyra-skoter-mallorca"
  },
  "can-you-rent-a-scooter-in-mallorca-with-a-car-licence": {
    "id": "rent-scooter-mallorca-car-licence",
    "en": "can-you-rent-a-scooter-in-mallorca-with-a-car-licence"
  },
  "alquilar-scooter-mallorca-carnet-coche": {
    "id": "rent-scooter-mallorca-car-licence",
    "es": "alquilar-scooter-mallorca-carnet-coche"
  },
  "scooter-mieten-mallorca-mit-autofuehrerschein": {
    "id": "rent-scooter-mallorca-car-licence",
    "de": "scooter-mieten-mallorca-mit-autofuehrerschein"
  },
  "louer-scooter-majorque-avec-permis-voiture": {
    "id": "rent-scooter-mallorca-car-licence",
    "fr": "louer-scooter-majorque-avec-permis-voiture"
  },
  "noleggiare-scooter-maiorca-con-patente-auto": {
    "id": "rent-scooter-mallorca-car-licence",
    "it": "noleggiare-scooter-maiorca-con-patente-auto"
  },
  "alugar-scooter-maiorca-com-carta-carro": {
    "id": "rent-scooter-mallorca-car-licence",
    "pt": "alugar-scooter-maiorca-com-carta-carro"
  },
  "hyra-skoter-mallorca-med-bilkorkort": {
    "id": "rent-scooter-mallorca-car-licence",
    "sv": "hyra-skoter-mallorca-med-bilkorkort"
  },
  "do-you-need-a-deposit-to-rent-a-scooter-in-mallorca": {
    "id": "scooter-rental-mallorca-deposit",
    "en": "do-you-need-a-deposit-to-rent-a-scooter-in-mallorca"
  },
  "deposito-alquiler-scooter-mallorca": {
    "id": "scooter-rental-mallorca-deposit",
    "es": "deposito-alquiler-scooter-mallorca"
  },
  "kaution-scooter-mieten-mallorca": {
    "id": "scooter-rental-mallorca-deposit",
    "de": "kaution-scooter-mieten-mallorca"
  },
  "caution-location-scooter-majorque": {
    "id": "scooter-rental-mallorca-deposit",
    "fr": "caution-location-scooter-majorque"
  },
  "deposito-noleggio-scooter-maiorca": {
    "id": "scooter-rental-mallorca-deposit",
    "it": "deposito-noleggio-scooter-maiorca"
  },
  "caucao-aluguer-scooter-maiorca": {
    "id": "scooter-rental-mallorca-deposit",
    "pt": "caucao-aluguer-scooter-maiorca"
  },
  "deposition-skoterhyra-mallorca": {
    "id": "scooter-rental-mallorca-deposit",
    "sv": "deposition-skoterhyra-mallorca"
  },
  "scooter-rental-magaluf-near-the-beach": {
    "id": "scooter-rental-magaluf-near-beach",
    "en": "scooter-rental-magaluf-near-the-beach"
  },
  "alquiler-scooter-magaluf-cerca-playa": {
    "id": "scooter-rental-magaluf-near-beach",
    "es": "alquiler-scooter-magaluf-cerca-playa"
  },
  "scooter-mieten-magaluf-nahe-strand": {
    "id": "scooter-rental-magaluf-near-beach",
    "de": "scooter-mieten-magaluf-nahe-strand"
  },
  "location-scooter-magaluf-pres-plage": {
    "id": "scooter-rental-magaluf-near-beach",
    "fr": "location-scooter-magaluf-pres-plage"
  },
  "noleggio-scooter-magaluf-vicino-spiaggia": {
    "id": "scooter-rental-magaluf-near-beach",
    "it": "noleggio-scooter-magaluf-vicino-spiaggia"
  },
  "aluguer-scooter-magaluf-perto-praia": {
    "id": "scooter-rental-magaluf-near-beach",
    "pt": "aluguer-scooter-magaluf-perto-praia"
  },
  "skoterhyra-magaluf-nara-stranden": {
    "id": "scooter-rental-magaluf-near-beach",
    "sv": "skoterhyra-magaluf-nara-stranden"
  },
  "best-scooter-routes-from-magaluf-for-first-time-visitors": {
    "id": "best-scooter-routes-magaluf",
    "en": "best-scooter-routes-from-magaluf-for-first-time-visitors"
  },
  "mejores-rutas-scooter-magaluf-primerizos": {
    "id": "best-scooter-routes-magaluf",
    "es": "mejores-rutas-scooter-magaluf-primerizos"
  },
  "beste-scooter-routen-magaluf-anfaenger": {
    "id": "best-scooter-routes-magaluf",
    "de": "beste-scooter-routen-magaluf-anfaenger"
  },
  "meilleurs-itineraires-scooter-magaluf-debutants": {
    "id": "best-scooter-routes-magaluf",
    "fr": "meilleurs-itineraires-scooter-magaluf-debutants"
  },
  "migliori-itinerari-scooter-magaluf-principianti": {
    "id": "best-scooter-routes-magaluf",
    "it": "migliori-itinerari-scooter-magaluf-principianti"
  },
  "melhores-rotas-scooter-magaluf-principiantes": {
    "id": "best-scooter-routes-magaluf",
    "pt": "melhores-rotas-scooter-magaluf-principiantes"
  },
  "basta-skoterrutter-magaluf-nyborjare": {
    "id": "best-scooter-routes-magaluf",
    "sv": "basta-skoterrutter-magaluf-nyborjare"
  },
  "best-places-to-visit-by-scooter-from-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "en": "best-places-to-visit-by-scooter-from-magaluf"
  },
  "mejores-lugares-visitar-scooter-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "es": "mejores-lugares-visitar-scooter-magaluf"
  },
  "beste-orte-mit-scooter-ab-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "de": "beste-orte-mit-scooter-ab-magaluf"
  },
  "meilleurs-lieux-visiter-scooter-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "fr": "meilleurs-lieux-visiter-scooter-magaluf"
  },
  "migliori-luoghi-visitare-scooter-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "it": "migliori-luoghi-visitare-scooter-magaluf"
  },
  "melhores-locais-visitar-scooter-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "pt": "melhores-locais-visitar-scooter-magaluf"
  },
  "basta-platser-besoka-skoter-magaluf": {
    "id": "best-places-visit-scooter-magaluf",
    "sv": "basta-platser-besoka-skoter-magaluf"
  },
  "can-you-drive-from-magaluf-to-palma-by-scooter": {
    "id": "magaluf-to-palma-scooter",
    "en": "can-you-drive-from-magaluf-to-palma-by-scooter"
  },
  "ir-de-magaluf-a-palma-en-scooter": {
    "id": "magaluf-to-palma-scooter",
    "es": "ir-de-magaluf-a-palma-en-scooter"
  },
  "von-magaluf-nach-palma-mit-scooter": {
    "id": "magaluf-to-palma-scooter",
    "de": "von-magaluf-nach-palma-mit-scooter"
  },
  "magaluf-palma-en-scooter": {
    "id": "magaluf-to-palma-scooter",
    "fr": "magaluf-palma-en-scooter"
  },
  "magaluf-palma-in-scooter": {
    "id": "magaluf-to-palma-scooter",
    "it": "magaluf-palma-in-scooter"
  },
  "magaluf-palma-de-scooter": {
    "id": "magaluf-to-palma-scooter",
    "pt": "magaluf-palma-de-scooter"
  },
  "magaluf-till-palma-med-skoter": {
    "id": "magaluf-to-palma-scooter",
    "sv": "magaluf-till-palma-med-skoter"
  },
  "scooter-vs-taxi-in-magaluf": {
    "id": "scooter-vs-taxi-magaluf",
    "en": "scooter-vs-taxi-in-magaluf"
  },
  "scooter-vs-taxi-magaluf-mas-barato": {
    "id": "scooter-vs-taxi-magaluf",
    "es": "scooter-vs-taxi-magaluf-mas-barato"
  },
  "scooter-oder-taxi-magaluf-guenstiger": {
    "id": "scooter-vs-taxi-magaluf",
    "de": "scooter-oder-taxi-magaluf-guenstiger"
  },
  "scooter-ou-taxi-magaluf-moins-cher": {
    "id": "scooter-vs-taxi-magaluf",
    "fr": "scooter-ou-taxi-magaluf-moins-cher"
  },
  "scooter-vs-taxi-magaluf-piu-economico": {
    "id": "scooter-vs-taxi-magaluf",
    "it": "scooter-vs-taxi-magaluf-piu-economico"
  },
  "scooter-vs-taxi-magaluf-mais-barato": {
    "id": "scooter-vs-taxi-magaluf",
    "pt": "scooter-vs-taxi-magaluf-mais-barato"
  },
  "skoter-eller-taxi-magaluf-billigast": {
    "id": "scooter-vs-taxi-magaluf",
    "sv": "skoter-eller-taxi-magaluf-billigast"
  },
  "scooter-vs-car-rental-in-mallorca": {
    "id": "scooter-vs-car-rental-mallorca",
    "en": "scooter-vs-car-rental-in-mallorca"
  },
  "scooter-vs-coche-alquiler-mallorca": {
    "id": "scooter-vs-car-rental-mallorca",
    "es": "scooter-vs-coche-alquiler-mallorca"
  },
  "scooter-oder-mietwagen-mallorca": {
    "id": "scooter-vs-car-rental-mallorca",
    "de": "scooter-oder-mietwagen-mallorca"
  },
  "scooter-ou-voiture-location-majorque": {
    "id": "scooter-vs-car-rental-mallorca",
    "fr": "scooter-ou-voiture-location-majorque"
  },
  "scooter-vs-auto-noleggio-maiorca": {
    "id": "scooter-vs-car-rental-mallorca",
    "it": "scooter-vs-auto-noleggio-maiorca"
  },
  "scooter-vs-carro-aluguer-maiorca": {
    "id": "scooter-vs-car-rental-mallorca",
    "pt": "scooter-vs-carro-aluguer-maiorca"
  },
  "skoter-eller-hyrbil-mallorca": {
    "id": "scooter-vs-car-rental-mallorca",
    "sv": "skoter-eller-hyrbil-mallorca"
  },
  "is-renting-a-scooter-in-mallorca-worth-it": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "en": "is-renting-a-scooter-in-mallorca-worth-it"
  },
  "merece-la-pena-alquilar-scooter-mallorca": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "es": "merece-la-pena-alquilar-scooter-mallorca"
  },
  "lohnt-sich-scooter-mieten-mallorca": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "de": "lohnt-sich-scooter-mieten-mallorca"
  },
  "louer-scooter-majorque-vaut-il-le-coup": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "fr": "louer-scooter-majorque-vaut-il-le-coup"
  },
  "conviene-noleggiare-scooter-maiorca": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "it": "conviene-noleggiare-scooter-maiorca"
  },
  "vale-a-pena-alugar-scooter-maiorca": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "pt": "vale-a-pena-alugar-scooter-maiorca"
  },
  "ar-det-vart-hyra-skoter-mallorca": {
    "id": "is-renting-scooter-mallorca-worth-it",
    "sv": "ar-det-vart-hyra-skoter-mallorca"
  },
  "can-tourists-rent-a-125cc-scooter-in-mallorca": {
    "id": "tourists-rent-125cc-mallorca",
    "en": "can-tourists-rent-a-125cc-scooter-in-mallorca"
  },
  "turistas-alquilar-scooter-125cc-mallorca": {
    "id": "tourists-rent-125cc-mallorca",
    "es": "turistas-alquilar-scooter-125cc-mallorca"
  },
  "touristen-125cc-scooter-mieten-mallorca": {
    "id": "tourists-rent-125cc-mallorca",
    "de": "touristen-125cc-scooter-mieten-mallorca"
  },
  "touristes-louer-scooter-125cc-majorque": {
    "id": "tourists-rent-125cc-mallorca",
    "fr": "touristes-louer-scooter-125cc-majorque"
  },
  "turisti-noleggiare-scooter-125cc-maiorca": {
    "id": "tourists-rent-125cc-mallorca",
    "it": "turisti-noleggiare-scooter-125cc-maiorca"
  },
  "turistas-alugar-scooter-125cc-maiorca": {
    "id": "tourists-rent-125cc-mallorca",
    "pt": "turistas-alugar-scooter-125cc-maiorca"
  },
  "turister-hyra-125cc-skoter-mallorca": {
    "id": "tourists-rent-125cc-mallorca",
    "sv": "turister-hyra-125cc-skoter-mallorca"
  },
  "scooter-rental-palmanova-prices-licence-pickup-info": {
    "id": "scooter-rental-palmanova",
    "en": "scooter-rental-palmanova-prices-licence-pickup-info"
  },
  "alquiler-scooter-palmanova-precios-licencia-recogida": {
    "id": "scooter-rental-palmanova",
    "es": "alquiler-scooter-palmanova-precios-licencia-recogida"
  },
  "scooter-mieten-palmanova-preise-fuehrerschein-abholung": {
    "id": "scooter-rental-palmanova",
    "de": "scooter-mieten-palmanova-preise-fuehrerschein-abholung"
  },
  "location-scooter-palmanova-prix-permis-retrait": {
    "id": "scooter-rental-palmanova",
    "fr": "location-scooter-palmanova-prix-permis-retrait"
  },
  "noleggio-scooter-palmanova-prezzi-patente-ritiro": {
    "id": "scooter-rental-palmanova",
    "it": "noleggio-scooter-palmanova-prezzi-patente-ritiro"
  },
  "aluguer-scooter-palmanova-precos-carta-levantamento": {
    "id": "scooter-rental-palmanova",
    "pt": "aluguer-scooter-palmanova-precos-carta-levantamento"
  },
  "skoterhyra-palmanova-priser-korkort-upphamtning": {
    "id": "scooter-rental-palmanova",
    "sv": "skoterhyra-palmanova-priser-korkort-upphamtning"
  },
  "magaluf-vs-palmanova-scooter-rental": {
    "id": "magaluf-vs-palmanova-rental",
    "en": "magaluf-vs-palmanova-scooter-rental"
  },
  "magaluf-vs-palmanova-alquiler-scooter-donde-reservar": {
    "id": "magaluf-vs-palmanova-rental",
    "es": "magaluf-vs-palmanova-alquiler-scooter-donde-reservar"
  },
  "magaluf-oder-palmanova-scooter-mieten": {
    "id": "magaluf-vs-palmanova-rental",
    "de": "magaluf-oder-palmanova-scooter-mieten"
  },
  "magaluf-ou-palmanova-location-scooter": {
    "id": "magaluf-vs-palmanova-rental",
    "fr": "magaluf-ou-palmanova-location-scooter"
  },
  "magaluf-vs-palmanova-noleggio-scooter-dove-prenotare": {
    "id": "magaluf-vs-palmanova-rental",
    "it": "magaluf-vs-palmanova-noleggio-scooter-dove-prenotare"
  },
  "magaluf-vs-palmanova-aluguer-scooter-onde-reservar": {
    "id": "magaluf-vs-palmanova-rental",
    "pt": "magaluf-vs-palmanova-aluguer-scooter-onde-reservar"
  },
  "magaluf-eller-palmanova-skoterhyra-var-boka": {
    "id": "magaluf-vs-palmanova-rental",
    "sv": "magaluf-eller-palmanova-skoterhyra-var-boka"
  },
  "do-scooter-rentals-in-mallorca-include-helmets": {
    "id": "helmets-included-mallorca",
    "en": "do-scooter-rentals-in-mallorca-include-helmets"
  },
  "alquiler-scooter-mallorca-incluye-cascos": {
    "id": "helmets-included-mallorca",
    "es": "alquiler-scooter-mallorca-incluye-cascos"
  },
  "sind-helme-bei-scooter-miete-mallorca-inklusive": {
    "id": "helmets-included-mallorca",
    "de": "sind-helme-bei-scooter-miete-mallorca-inklusive"
  },
  "casques-inclus-location-scooter-majorque": {
    "id": "helmets-included-mallorca",
    "fr": "casques-inclus-location-scooter-majorque"
  },
  "caschi-inclusi-noleggio-scooter-maiorca": {
    "id": "helmets-included-mallorca",
    "it": "caschi-inclusi-noleggio-scooter-maiorca"
  },
  "capacetes-incluidos-aluguer-scooter-maiorca": {
    "id": "helmets-included-mallorca",
    "pt": "capacetes-incluidos-aluguer-scooter-maiorca"
  },
  "ingar-hjalmar-skoterhyra-mallorca": {
    "id": "helmets-included-mallorca",
    "sv": "ingar-hjalmar-skoterhyra-mallorca"
  },
  "what-is-included-when-you-rent-a-scooter-in-magaluf": {
    "id": "what-included-scooter-magaluf",
    "en": "what-is-included-when-you-rent-a-scooter-in-magaluf"
  },
  "que-incluye-alquilar-scooter-magaluf": {
    "id": "what-included-scooter-magaluf",
    "es": "que-incluye-alquilar-scooter-magaluf"
  },
  "was-ist-inklusive-scooter-mieten-magaluf": {
    "id": "what-included-scooter-magaluf",
    "de": "was-ist-inklusive-scooter-mieten-magaluf"
  },
  "ce-qui-est-inclus-location-scooter-magaluf": {
    "id": "what-included-scooter-magaluf",
    "fr": "ce-qui-est-inclus-location-scooter-magaluf"
  },
  "cosa-include-noleggio-scooter-magaluf": {
    "id": "what-included-scooter-magaluf",
    "it": "cosa-include-noleggio-scooter-magaluf"
  },
  "o-que-inclui-alugar-scooter-magaluf": {
    "id": "what-included-scooter-magaluf",
    "pt": "o-que-inclui-alugar-scooter-magaluf"
  },
  "vad-ingar-skoterhyra-magaluf": {
    "id": "what-included-scooter-magaluf",
    "sv": "vad-ingar-skoterhyra-magaluf"
  },
  "can-you-rent-a-scooter-in-magaluf-for-half-a-day": {
    "id": "half-day-scooter-magaluf",
    "en": "can-you-rent-a-scooter-in-magaluf-for-half-a-day"
  },
  "alquilar-scooter-magaluf-medio-dia": {
    "id": "half-day-scooter-magaluf",
    "es": "alquilar-scooter-magaluf-medio-dia"
  },
  "scooter-mieten-magaluf-halber-tag": {
    "id": "half-day-scooter-magaluf",
    "de": "scooter-mieten-magaluf-halber-tag"
  },
  "louer-scooter-magaluf-demi-journee": {
    "id": "half-day-scooter-magaluf",
    "fr": "louer-scooter-magaluf-demi-journee"
  },
  "noleggiare-scooter-magaluf-mezza-giornata": {
    "id": "half-day-scooter-magaluf",
    "it": "noleggiare-scooter-magaluf-mezza-giornata"
  },
  "alugar-scooter-magaluf-meio-dia": {
    "id": "half-day-scooter-magaluf",
    "pt": "alugar-scooter-magaluf-meio-dia"
  },
  "hyra-skoter-magaluf-halvdag": {
    "id": "half-day-scooter-magaluf",
    "sv": "hyra-skoter-magaluf-halvdag"
  },
  "how-to-rent-a-scooter-online-in-magaluf-in-under-1-minute": {
    "id": "rent-scooter-online-magaluf",
    "en": "how-to-rent-a-scooter-online-in-magaluf-in-under-1-minute"
  },
  "alquilar-scooter-online-magaluf-un-minuto": {
    "id": "rent-scooter-online-magaluf",
    "es": "alquilar-scooter-online-magaluf-un-minuto"
  },
  "scooter-online-mieten-magaluf-unter-einer-minute": {
    "id": "rent-scooter-online-magaluf",
    "de": "scooter-online-mieten-magaluf-unter-einer-minute"
  },
  "louer-scooter-en-ligne-magaluf-moins-une-minute": {
    "id": "rent-scooter-online-magaluf",
    "fr": "louer-scooter-en-ligne-magaluf-moins-une-minute"
  },
  "noleggiare-scooter-online-magaluf-meno-un-minuto": {
    "id": "rent-scooter-online-magaluf",
    "it": "noleggiare-scooter-online-magaluf-meno-un-minuto"
  },
  "alugar-scooter-online-magaluf-menos-um-minuto": {
    "id": "rent-scooter-online-magaluf",
    "pt": "alugar-scooter-online-magaluf-menos-um-minuto"
  },
  "hyra-skoter-online-magaluf-under-en-minut": {
    "id": "rent-scooter-online-magaluf",
    "sv": "hyra-skoter-online-magaluf-under-en-minut"
  },
  "ebike-rental-magaluf-is-it-better-than-a-scooter": {
    "id": "ebike-vs-scooter-magaluf",
    "en": "ebike-rental-magaluf-is-it-better-than-a-scooter"
  },
  "ebike-vs-scooter-magaluf": {
    "id": "ebike-vs-scooter-magaluf",
    "es": "ebike-vs-scooter-magaluf",
    "it": "ebike-vs-scooter-magaluf",
    "pt": "ebike-vs-scooter-magaluf"
  },
  "ebike-oder-scooter-magaluf": {
    "id": "ebike-vs-scooter-magaluf",
    "de": "ebike-oder-scooter-magaluf"
  },
  "ebike-ou-scooter-magaluf": {
    "id": "ebike-vs-scooter-magaluf",
    "fr": "ebike-ou-scooter-magaluf"
  },
  "elcykel-eller-skoter-magaluf": {
    "id": "ebike-vs-scooter-magaluf",
    "sv": "elcykel-eller-skoter-magaluf"
  },
  "best-ebike-routes-from-magaluf-and-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "en": "best-ebike-routes-from-magaluf-and-palmanova"
  },
  "mejores-rutas-ebike-magaluf-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "es": "mejores-rutas-ebike-magaluf-palmanova"
  },
  "beste-ebike-routen-magaluf-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "de": "beste-ebike-routen-magaluf-palmanova"
  },
  "meilleurs-itineraires-ebike-magaluf-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "fr": "meilleurs-itineraires-ebike-magaluf-palmanova"
  },
  "migliori-itinerari-ebike-magaluf-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "it": "migliori-itinerari-ebike-magaluf-palmanova"
  },
  "melhores-rotas-ebike-magaluf-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "pt": "melhores-rotas-ebike-magaluf-palmanova"
  },
  "basta-elcykelrutter-magaluf-palmanova": {
    "id": "best-ebike-routes-magaluf",
    "sv": "basta-elcykelrutter-magaluf-palmanova"
  },
  "can-you-ride-an-e-bike-from-magaluf-to-palma": {
    "id": "magaluf-to-palma-ebike",
    "en": "can-you-ride-an-e-bike-from-magaluf-to-palma"
  },
  "ir-de-magaluf-a-palma-en-ebike": {
    "id": "magaluf-to-palma-ebike",
    "es": "ir-de-magaluf-a-palma-en-ebike"
  },
  "von-magaluf-nach-palma-mit-ebike": {
    "id": "magaluf-to-palma-ebike",
    "de": "von-magaluf-nach-palma-mit-ebike"
  },
  "magaluf-palma-en-ebike": {
    "id": "magaluf-to-palma-ebike",
    "fr": "magaluf-palma-en-ebike"
  },
  "magaluf-palma-in-ebike": {
    "id": "magaluf-to-palma-ebike",
    "it": "magaluf-palma-in-ebike"
  },
  "magaluf-palma-de-ebike": {
    "id": "magaluf-to-palma-ebike",
    "pt": "magaluf-palma-de-ebike"
  },
  "magaluf-till-palma-med-elcykel": {
    "id": "magaluf-to-palma-ebike",
    "sv": "magaluf-till-palma-med-elcykel"
  },
  "e-bike-vs-taxi-magaluf-cheapest-way-to-explore-mallorca": {
    "id": "ebike-vs-taxi-magaluf",
    "en": "e-bike-vs-taxi-magaluf-cheapest-way-to-explore-mallorca"
  },
  "ebike-vs-taxi-magaluf-forma-barata-explorar": {
    "id": "ebike-vs-taxi-magaluf",
    "es": "ebike-vs-taxi-magaluf-forma-barata-explorar",
    "pt": "ebike-vs-taxi-magaluf-forma-barata-explorar"
  },
  "ebike-oder-taxi-magaluf-guenstig-erkunden": {
    "id": "ebike-vs-taxi-magaluf",
    "de": "ebike-oder-taxi-magaluf-guenstig-erkunden"
  },
  "ebike-ou-taxi-magaluf-moins-cher-explorer": {
    "id": "ebike-vs-taxi-magaluf",
    "fr": "ebike-ou-taxi-magaluf-moins-cher-explorer"
  },
  "ebike-vs-taxi-magaluf-modo-economico-esplorare": {
    "id": "ebike-vs-taxi-magaluf",
    "it": "ebike-vs-taxi-magaluf-modo-economico-esplorare"
  },
  "elcykel-eller-taxi-magaluf-billigast-utforska": {
    "id": "ebike-vs-taxi-magaluf",
    "sv": "elcykel-eller-taxi-magaluf-billigast-utforska"
  }
};
