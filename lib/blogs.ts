// lib/blogs.ts
import type { Locale } from "../i18n/routing";
import { additionalBlogPosts } from "./blog-content/additional-posts";
import { applyBlogTranslations } from "./blog-content/i18n/apply";
import { applyBlogPublishSchedule } from "./blog-publish-schedule";

export type BlogCategory =
  | "Prices"
  | "License"
  | "E-Bikes"
  | "Deposits"
  | "Routes"
  | "Booking"
  | "Tips";

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogTranslation = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  heroImage: string;
  imageAlt: string;
  quickAnswer: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
  ctaTitle: string;
  ctaText: string;
};

export type BlogPost = {
  id: string;
  priority: number;
  translations: Partial<Record<Locale, BlogTranslation>> & {
    en: BlogTranslation;
  };
};

/**
 * Blog hero images in `public/images/` — filenames match each article title.
 */
const BLOG_IMAGE_FILES: Record<string, string> = {
  "scooter-rental-price-magaluf":
    "How Much Does It Cost to Rent a Scooter in Magaluf.png",
  "license-125cc-scooter-spain":
    "What License Do You Need to Rent a 125cc Scooter in Spai.png",
  "ebike-rental-price-magaluf":
    "How Much Does It Cost to Rent an E-Bike in Magaluf.png",
  "best-place-rent-scooter-magaluf":
    "Where Is the Best Place to Rent a Scooter in Magaluf.png",
  "what-you-need-rent-scooter-mallorca":
    "What Do You Need to Rent a Scooter in Mallorca.png",
  "rent-scooter-mallorca-car-licence":
    "Can You Rent a Scooter in Mallorca with a Car Licence.png",
  "scooter-rental-mallorca-deposit":
    "Do You Need a Deposit to Rent a Scooter in Mallorca.png",
  "scooter-rental-magaluf-near-beach":
    "Scooter Rental in Magaluf Near the Beach Complete Tourist Guide.png",
  "best-scooter-routes-magaluf":
    "Best Scooter Routes from Magaluf for First-Time Visitors.png",
  "best-places-visit-scooter-magaluf":
    "Best Places to Visit by Scooter from Magaluf.png",
  "magaluf-to-palma-scooter":
    "Can You Drive from Magaluf to Palma by Scooter.png",
  "scooter-vs-taxi-magaluf":
    "Scooter vs Taxi in Magaluf Which Is Cheaper for Tourists.png",
  "scooter-vs-car-rental-mallorca":
    "Scooter vs Car Rental in Mallorca Which One Is Better.png",
  "is-renting-scooter-mallorca-worth-it":
    "Is Renting a Scooter in Mallorca Worth It.png",
  "tourists-rent-125cc-mallorca":
    "Can Tourists Rent a 125cc Scooter in Mallorca.png",
  "scooter-rental-palmanova":
    "Scooter Rental in Palmanova Prices, Licence & Pickup Info.png",
  "magaluf-vs-palmanova-rental":
    "Magaluf vs Palmanova Scooter Rental Where Should You Book.png",
  "helmets-included-mallorca":
    "Do Scooter Rentals in Mallorca Include Helmets.png",
  "what-included-scooter-magaluf":
    "What Is Included When You Rent a Scooter in Magaluf.png",
  "half-day-scooter-magaluf":
    "Can You Rent a Scooter in Magaluf for Half a Day.png",
  "rent-scooter-online-magaluf":
    "How to Rent a Scooter Online in Magaluf in Under 1 Minute.png",
  "ebike-vs-scooter-magaluf":
    "E-Bike Rental in Magaluf Is It Better Than a Scooter.png",
  "best-ebike-routes-magaluf":
    "Best E-Bike Routes from Magaluf and Palmanova.png",
  "magaluf-to-palma-ebike":
    "Can You Ride an E-Bike from Magaluf to Palma.png",
  "ebike-vs-taxi-magaluf":
    "E-Bike vs Taxi in Magaluf Cheapest Way to Explore Mallorca.png",
};

const BLOG_PLACEHOLDER = "/images/reallogo.png";

export function getBlogHeroImage(postId: string): string {
  const file = BLOG_IMAGE_FILES[postId];
  if (!file) return BLOG_PLACEHOLDER;
  return `/images/${encodeURI(file)}`;
}

export function isBlogPlaceholderImage(src: string) {
  return src.includes("reallogo");
}

export function hasRealHeroImage(postId: string) {
  return postId in BLOG_IMAGE_FILES;
}

export const blogPosts: BlogPost[] = [
  {
    id: "scooter-rental-price-magaluf",
    priority: 1,
    translations: {
      en: {
        slug: "how-much-does-it-cost-to-rent-a-scooter-in-magaluf",
        title: "How Much Does It Cost to Rent a Scooter in Magaluf?",
        metaTitle: "Scooter Rental Prices in Magaluf | NEXA Rentals Mallorca",
        metaDescription:
          "How much does it cost to rent a scooter in Magaluf? Learn real scooter rental prices, half-day and full-day rates, deposit, licence rules, helmets, insurance and hidden costs.",
        excerpt:
          "Half day ~€34–39, full day ~€42–49 at NEXA — plus €150 deposit. Compare inclusions, not headline price only.",
        category: "Prices",
        readTime: "14 min read",
        publishedAt: "2026-05-17",
        updatedAt: "2026-05-17",
        heroImage: getBlogHeroImage("scooter-rental-price-magaluf"),
        imageAlt: "Scooter rental price in Magaluf Mallorca 125cc",
        quickAnswer:
          "Magaluf scooter rental often starts around €34–39 half-day and €42–49 full day (season/promotion). NEXA includes 125cc scooter, 2 helmets, phone holder, lock; deposit usually €150. Check live booking for current price — compare deposit, insurance excess, and inclusions, not cheapest headline only.",
        sections: [
          {
            heading: "How much does scooter rental cost in Magaluf?",
            paragraphs: [
              "Price depends on duration, scooter type, season, deposit, insurance, and inclusions. NEXA commonly: half day €34–39, full day €42–49, multi-day lower per day — check the [live booking page](https://www.nexarentals.es/en).",
              "Cheapest is not always best — check deposit, helmets, holder, lock, fuel, kilometres, late fees. NEXA: 125cc automatic, 2 helmets, phone holder, security lock included.",
            ],
          },
          {
            heading: "Quick price guide",
            paragraphs: [
              "Half day ~€34–39 — Palmanova, Cala Vinyes, local rides. Full day ~€42–49 — longer exploring. Multi-day — lower daily rate. Deposit often €150+ (NEXA €150). Fuel usually return same level. Helmets required — NEXA includes 2.",
            ],
          },
          {
            heading: "Why prices change and half-day rates",
            paragraphs: [
              "Season, weekends, weather, availability, promotions, and model affect price — book early in summer.",
              "Half-day suits Magaluf → Palmanova, Son Maties, Cala Vinyes, beach hopping. See [half-day rental guide](https://www.nexarentals.es/en/blog/can-you-rent-a-scooter-in-magaluf-for-half-a-day).",
            ],
          },
          {
            heading: "Full-day and multi-day pricing",
            paragraphs: [
              "Full-day: more freedom for Santa Ponça, Portals Nous, Palma, multiple stops — often better value if half vs full gap is small.",
              "Multi-day: ask overnight parking, lock, insurance, extension, and daily discount for 2–6 days.",
            ],
          },
          {
            heading: "What is included in the price?",
            paragraphs: [
              "NEXA includes: 125cc automatic, 2 helmets, phone holder, lock. Ask elsewhere: insurance, unlimited km, top box, support, final price.",
              "Details: [what is included](https://www.nexarentals.es/en/blog/what-is-included-when-you-rent-a-scooter-in-magaluf).",
            ],
          },
          {
            heading: "Deposit and insurance",
            paragraphs: [
              "Deposit is refundable security — NEXA €150 at pickup (card pre-auth or cash). Others may use €150–200 depending on vehicle.",
              "Insurance included ≠ zero responsibility — ask excess/franchise, theft, tyres, unauthorised riders, alcohol. [Deposit explained](https://www.nexarentals.es/en/blog/do-you-need-a-deposit-to-rent-a-scooter-in-mallorca).",
            ],
          },
          {
            heading: "Hidden costs, scooter vs taxi and bus",
            paragraphs: [
              "Watch for: extra helmet/holder/lock charges, fuel, late return, fines, damage, delivery fees — transparent companies explain upfront.",
              "Scooter beats multiple taxi trips in one day; taxi for night, luggage, one direct trip. [Scooter vs taxi](https://www.nexarentals.es/en/blog/scooter-vs-taxi-in-magaluf).",
              "Bus cheaper for direct Palma — [TIB Line 104](https://www.tib.org/en/web/transport/mallorca/line/104). Scooter for flexible beach stops.",
            ],
          },
          {
            heading: "125cc value, licence, routes, and best price tips",
            paragraphs: [
              "125cc worth it vs 50cc for hills, two-up, Cala Vinyes, Santa Ponça, Portals, Palma. Licence: A1, A2, A, B+3 years — see [125cc licence](https://www.nexarentals.es/en/blog/what-license-do-you-need-to-rent-a-125cc-scooter-in-spain), [requirements](https://www.nexarentals.es/en/blog/what-do-you-need-to-rent-a-scooter-in-mallorca).",
              "Half-day routes: Palmanova loop, Cala Vinyes. Full-day: Santa Ponça, Portals, Palma if confident.",
              "Book early online, compare inclusions, check deposit, return on time. [Best place to rent](https://www.nexarentals.es/en/blog/best-place-to-rent-a-scooter-in-magaluf).",
              "[NEXA scooter rental Magaluf](https://www.nexarentals.es/en/scooter-rental-magaluf) — see total cost before you pay.",
            ],
          },
        ],
        faqs: [
          {
            question: "How much does it cost to rent a scooter in Magaluf?",
            answer:
              "Commonly around €34–39 half-day and €42–49 full day depending on season and promotion.",
          },
          {
            question: "Is half-day scooter rental cheaper?",
            answer:
              "Yes — good for short routes like Magaluf to Palmanova or Cala Vinyes.",
          },
          {
            question: "Is full-day scooter rental worth it?",
            answer:
              "Yes for several stops, Santa Ponça, Portals Nous, or Palma without rushing.",
          },
          {
            question: "Do I need to pay a deposit?",
            answer:
              "Usually yes. NEXA usual deposit is €150 at pickup; other companies may differ.",
          },
          {
            question: "Are helmets included in the price?",
            answer: "At NEXA, 2 helmets are included free. Always check other companies.",
          },
          {
            question: "Is a phone holder included?",
            answer: "Yes at NEXA Rentals — free phone holder for navigation.",
          },
          {
            question: "Is scooter rental cheaper than taxi in Magaluf?",
            answer:
              "For multiple daytime trips, often yes — one rental vs several taxi fares.",
          },
          {
            question: "What licence do I need for a 125cc scooter?",
            answer:
              "Usually A1, A2, A, or B held 3+ years where accepted in Spain.",
          },
        ],
        ctaTitle: "See live scooter prices in Magaluf",
        ctaText:
          "NEXA Rentals — half day from ~€34, full day from ~€42. 2 helmets, holder, and lock included. Book online for current price.",
      },
    },
  },
  {
    id: "license-125cc-scooter-spain",
    priority: 2,
    translations: {
      en: {
        slug: "what-license-do-you-need-to-rent-a-125cc-scooter-in-spain",
        title: "What License Do You Need to Rent a 125cc Scooter in Spain?",
        metaTitle: "125cc Scooter License Spain | NEXA Rentals Mallorca",
        metaDescription:
          "What license do you need to rent a 125cc scooter in Spain? Learn A1, A2, A and car licence rules, 3-year B licence rule, tourist documents, IDP and rental tips.",
        excerpt:
          "A1, A2, A, or B+3 years often works for 125cc in Spain — rental insurance may differ. Physical licence required; non-EU may need IDP.",
        category: "License",
        readTime: "15 min read",
        publishedAt: "2026-05-17",
        updatedAt: "2026-05-17",
        heroImage: getBlogHeroImage("license-125cc-scooter-spain"),
        imageAlt: "License to rent 125cc scooter in Spain A1 and car licence rules",
        quickAnswer:
          "You need a licence allowing A1-category motorcycles: A1, A2, A, or often B car licence held 3+ years in Spain where the rental company accepts it. B under 3 years usually not enough. Non-EU may need IDP. No licence = no 125cc rental. Confirm with NEXA before booking.",
        sections: [
          {
            heading: "What licence do you need for a 125cc scooter in Spain?",
            paragraphs: [
              "Normally A1, A2, A, or B car licence held more than 3 years where accepted by the rental company and insurance.",
              "DGT lists A1 for motorcycles up to 125 cm³ and 11 kW (max 0.1 kW/kg power-to-weight). A 125cc scooter is a real motor vehicle — not like an e-bike.",
              "Simple rule: A1/A2/A = yes. B+3 years = often yes in Spain. B under 3 years = usually no. No licence = no. Non-EU = may need IDP.",
            ],
          },
          {
            heading: "Quick licence comparison",
            paragraphs: [
              "A1 — yes, designed for 125cc/11 kW. A2 — yes. A — yes. B+3 years — often yes in Spain. B under 3 years — usually no. Non-EU — depends, often IDP. No licence — no.",
            ],
          },
          {
            heading: "What is a 125cc scooter and car licence rule",
            paragraphs: [
              "125cc rental scooters are usually A1-category: automatic, up to 125cc, 11 kW — stronger than 50cc, good for Magaluf, Palmanova, Cala Vinyes, Santa Ponça, Portals, Palma.",
              "B car licence + 3 years: may allow A1-type motorcycles in Spain only — rental company must still accept under insurance. B under 3 years: need A1, A2, or A.",
              "More: [rent with car licence in Mallorca](https://www.nexarentals.es/en/blog/can-you-rent-a-scooter-in-mallorca-with-a-car-licence).",
            ],
          },
          {
            heading: "EU, UK, and non-EU tourists",
            paragraphs: [
              "EU: A1/A2/A straightforward; B check 3+ years and company policy. Bring physical licence, ID, deposit — not phone photo only.",
              "UK: confirm acceptance, B+3 years, IDP, motorcycle entitlement before paying.",
              "Non-EU (USA, Canada, India, Australia): often IDP with original licence — ask before booking, not at pickup.",
            ],
          },
          {
            heading: "50cc, e-bike, documents, and deposit",
            paragraphs: [
              "50cc has different rules — ask for that vehicle. E-bike: usually no motorcycle licence — alternative if 125cc not allowed. [E-bike vs scooter](https://www.nexarentals.es/en/blog/ebike-rental-magaluf-is-it-better-than-a-scooter).",
              "Also need: passport/ID, physical licence, IDP if required, deposit, booking, minimum age, contract. NEXA: 125cc, 2 helmets, holder, lock — licence still required.",
              "Deposit separate from rental price — ask amount, pre-auth, release, excess. [Deposit guide](https://www.nexarentals.es/en/blog/do-you-need-a-deposit-to-rent-a-scooter-in-mallorca).",
            ],
          },
          {
            heading: "Insurance, unauthorised riders, and consequences",
            paragraphs: [
              "Insurance can be stricter than general law — minimum age, licence age, categories. Check law, licence, company, and insurer before booking.",
              "Never rent without correct licence — fines, insurance void, deposit loss. Only authorised rider; passenger ≠ second driver. Ask passenger rules and 2 helmets (NEXA includes 2).",
              "See [what you need in Mallorca](https://www.nexarentals.es/en/blog/what-do-you-need-to-rent-a-scooter-in-mallorca), [tourists renting 125cc](https://www.nexarentals.es/en/blog/can-tourists-rent-a-125cc-scooter-in-mallorca).",
            ],
          },
          {
            heading: "Routes, beginners, safety, and common mistakes",
            paragraphs: [
              "Good Mallorca routes: Magaluf → Palmanova, Cala Vinyes, Son Maties, Santa Ponça, Portals, Palma if confident.",
              "Beginners: start local — avoid Palma and night riding first. Helmet always, no alcohol, indicators, lock, return on time.",
              "Avoid: assuming any car licence works, forgetting 3-year rule, no physical licence, no IDP, friend riding, booking before licence check.",
              "Confirm licence with [NEXA Rentals Magaluf](https://www.nexarentals.es/en/scooter-rental-magaluf) or [best rental location](https://www.nexarentals.es/en/blog/best-place-to-rent-a-scooter-in-magaluf) before you book.",
            ],
          },
        ],
        faqs: [
          {
            question: "What licence do I need to rent a 125cc scooter in Spain?",
            answer:
              "Usually A1, A2, A, or B held more than 3 years where accepted by the rental company.",
          },
          {
            question: "Can I rent a 125cc scooter with a car licence in Spain?",
            answer:
              "Yes in many cases if B has been held 3+ years and the company accepts it for insurance.",
          },
          {
            question: "Is a normal car licence always enough?",
            answer:
              "No — B usually needs 3+ years, and the rental company must accept it.",
          },
          {
            question: "What if my car licence is less than 3 years old?",
            answer:
              "You usually need A1, A2, or A for a 125cc scooter.",
          },
          {
            question: "Do non-EU tourists need an International Driving Permit?",
            answer:
              "Often yes — bring original licence and ask before booking.",
          },
          {
            question: "Do I need a physical licence?",
            answer:
              "Yes — a phone photo is usually not enough at pickup.",
          },
          {
            question: "Can I rent a 125cc scooter without a licence?",
            answer: "No — you need a valid licence for the vehicle category.",
          },
          {
            question: "Where can I rent a 125cc scooter in Magaluf?",
            answer:
              "NEXA Rentals — check licence, deposit, insurance, and inclusions before pickup.",
          },
        ],
        ctaTitle: "Check your licence before booking",
        ctaText:
          "Message NEXA Rentals on WhatsApp with your licence details, then book a 125cc scooter in Magaluf if you qualify.",
      },
    },
  },
  {
    id: "ebike-rental-price-magaluf",
    priority: 3,
    translations: {
      en: {
        slug: "how-much-does-it-cost-to-rent-an-e-bike-in-magaluf",
        title: "How Much Does It Cost to Rent an E-Bike in Magaluf?",
        metaTitle: "E-Bike Rental Prices in Magaluf | NEXA Rentals Mallorca",
        metaDescription:
          "How much does it cost to rent an e-bike in Magaluf? Learn real e-bike rental prices, hourly rates, full-day cost, routes, rules, safety tips and best value for tourists.",
        excerpt:
          "NEXA: €9 (1h), €16 (2h), €22 (3h), €25 (4h), €28 (1 day). Best value is usually the full day — only €3 more than 4 hours.",
        category: "E-Bikes",
        readTime: "14 min read",
        publishedAt: "2026-05-17",
        updatedAt: "2026-05-17",
        heroImage: getBlogHeroImage("ebike-rental-price-magaluf"),
        imageAlt: "E-bike rental price in Magaluf Mallorca hourly rates",
        quickAnswer:
          "NEXA Rentals Magaluf: €9 (1h), €16 (2h), €22 (3h), €25 (4h), €28 (1 day). Best value usually 1 day — only €3 more than 4 hours. Standard pedal-assist e-bikes (250W, 25 km/h assist) usually need no driving licence. Pickup Carrer Galeón 13, 09:00–20:00.",
        sections: [
          {
            heading: "How much does e-bike rental cost in Magaluf?",
            paragraphs: [
              "NEXA Rentals: 1 hour €9, 2 hours €16, 3 hours €22, 4 hours €25, 1 day €28. Cheapest flexible way to explore Magaluf, Palmanova, and Son Maties without a scooter licence.",
              "Standard pedal-assist e-bikes: motor assists while pedalling, assistance typically capped at 25 km/h and around 250W — treated differently from motor scooters.",
              "Pickup Carrer Galeón 13, Magaluf, 09:00–20:00. Book via [vehicles page](https://www.nexarentals.es/en) or WhatsApp.",
            ],
          },
          {
            heading: "Quick price guide and best value",
            paragraphs: [
              "1h €9 — quick Magaluf loop. 2h €16 — Magaluf → Palmanova. 3h €22 — relaxed beach stops. 4h €25 — half-day coastal ride. 1 day €28 — best value (only €3 more than 4h).",
              "One day removes time pressure — morning Palmanova, lunch, afternoon Son Maties, return before closing.",
            ],
          },
          {
            heading: "Why e-bikes are popular and hourly options",
            paragraphs: [
              "Beat walking in heat, avoid scooter licence, cheaper than multiple taxis for beach hopping.",
              "1 hour: test ride or hotel-to-beach — not enough for full Palmanova trip. 2 hours: best short route Magaluf → Son Maties → Palmanova. 3 hours: coffee and photo stops without rushing.",
              "4 hours: half-day exploring — but 1 day at €28 is usually better if you might ride again later.",
            ],
          },
          {
            heading: "Licence, e-bike vs scooter, taxi, and bus",
            paragraphs: [
              "Normal pedal-assist e-bike: usually no driving licence; still need ID, deposit, age rules, and rental agreement.",
              "E-bike cheaper than scooter for short local trips — see [e-bike vs scooter](https://www.nexarentals.es/en/blog/ebike-rental-magaluf-is-it-better-than-a-scooter) and [scooter prices](https://www.nexarentals.es/en/blog/how-much-does-it-cost-to-rent-a-scooter-in-magaluf).",
              "E-bike beats several taxi trips in one day; taxi for night, luggage, alcohol, bad weather. [E-bike vs taxi](https://www.nexarentals.es/en/blog/e-bike-vs-taxi-magaluf-cheapest-way-to-explore-mallorca).",
              "Bus cheaper for direct Palma — [TIB Line 104](https://www.tib.org/en/web/transport/mallorca/line/104). E-bike better for flexible Magaluf/Palmanova stops.",
            ],
          },
          {
            heading: "Best routes by rental duration",
            paragraphs: [
              "1h: Magaluf beach loop. 2h: Magaluf → Son Maties → Palmanova. 3–4h: Palmanova + beach + café stops.",
              "1 day: flexible Magaluf–Palmanova–Son Maties; confident riders may go further — check battery first.",
              "Palma: possible for confident riders; most tourists use bus or scooter — see [e-bike to Palma](https://www.nexarentals.es/en/blog/can-you-ride-an-e-bike-from-magaluf-to-palma). More routes: [best e-bike routes](https://www.nexarentals.es/en/blog/best-ebike-routes-from-magaluf-and-palmanova).",
            ],
          },
          {
            heading: "Helmet, deposit, inclusions, battery, and safety",
            paragraphs: [
              "Wear a helmet for safety especially near traffic and longer rides. Ask deposit rules before booking.",
              "Check: battery, lock, assistance levels, return time, support contact. Save battery on flats, higher assist on hills.",
              "Ride slowly on promenades, no phone while moving, lock when parked, no alcohol, return on time.",
            ],
          },
          {
            heading: "Worth it and final answer",
            paragraphs: [
              "Worth it for Magaluf, Palmanova, Son Maties, couples, solo travellers, no scooter licence, low-cost exploring. Not ideal for long cross-island trips, luggage, or night after drinking.",
              "Final prices: €9 / €16 / €22 / €25 / €28. Best value: 1 day for €28. NEXA pickup Carrer Galeón 13, 09:00–20:00.",
              "[NEXA e-bike rental Magaluf](https://www.nexarentals.es/en) — city and mountain e-bikes (Moema city, Cecotec mountain) available.",
            ],
          },
        ],
        faqs: [
          {
            question: "How much does it cost to rent an e-bike in Magaluf?",
            answer:
              "At NEXA: €9 (1h), €16 (2h), €22 (3h), €25 (4h), €28 (1 day).",
          },
          {
            question: "What is the best-value e-bike rental option?",
            answer:
              "Usually 1 day for €28 — only €3 more than 4 hours with full flexibility.",
          },
          {
            question: "Do I need a licence to rent an e-bike in Magaluf?",
            answer:
              "Usually no for standard pedal-assist e-bikes limited to 25 km/h assistance.",
          },
          {
            question: "Can I ride an e-bike from Magaluf to Palmanova?",
            answer: "Yes — one of the easiest and best tourist routes.",
          },
          {
            question: "Can I ride an e-bike from Magaluf to Palma?",
            answer:
              "Possible for confident riders; bus Line 104 is easier for most direct trips.",
          },
          {
            question: "Is e-bike rental cheaper than taxi in Magaluf?",
            answer:
              "For multiple daytime trips, often yes compared with several taxi fares.",
          },
          {
            question: "Is an e-bike cheaper than a scooter?",
            answer:
              "Usually yes for short rentals — scooters need licence, insurance, and higher operating costs.",
          },
          {
            question: "Where can I rent an e-bike in Magaluf?",
            answer:
              "NEXA Rentals — Carrer Galeón 13, open 09:00–20:00 daily.",
          },
        ],
        ctaTitle: "Book an e-bike in Magaluf",
        ctaText:
          "From €9 per hour or €28 for the full day at NEXA Rentals. Explore Palmanova without a scooter licence.",
      },
    },
  },
  {
    id: "best-place-rent-scooter-magaluf",
    priority: 4,
    translations: {
      en: {
        slug: "best-place-to-rent-a-scooter-in-magaluf",
        title: "Where Is the Best Place to Rent a Scooter in Magaluf?",
        metaTitle:
          "Best Scooter Rental in Magaluf | NEXA Rentals Mallorca",
        metaDescription:
          "Looking for the best place to rent a scooter in Magaluf? Learn where to book, what to check, licence rules, deposit, prices, helmets, pickup tips and the best scooter routes.",
        excerpt:
          "Best rental = central pickup, clear prices, 2 helmets, holder, lock, online booking. NEXA Magaluf — not just cheapest price, clearest package.",
        category: "Tips",
        readTime: "14 min read",
        publishedAt: "2026-05-20",
        updatedAt: "2026-05-20",
        heroImage: getBlogHeroImage("best-place-rent-scooter-magaluf"),
        imageAlt: "Best place to rent a scooter in Magaluf Mallorca",
        quickAnswer:
          "The best scooter rental in Magaluf is central, near beach and hotels, with transparent prices, licence checks, deposit explained, 2 helmets, phone holder, lock, online booking, and support. NEXA Rentals lists 125cc automatic scooters with those inclusions — compare full package, not headline price only.",
        sections: [
          {
            heading: "Where is the best place to rent a scooter in Magaluf?",
            paragraphs: [
              "The best place is central, close to beach and hotels, easy to reach, transparent on prices and licence, and honest about inclusions — not only the cheapest sign.",
              "Magaluf connects to Palmanova, Son Maties, Cala Vinyes, Santa Ponça, Portals Nous, and Palma. The [Palmanova–Magaluf area](https://www.palmanova-magaluf.com/) suits promenade exploring — a scooter saves summer walks and taxi queues.",
              "Look for: central pickup, online booking, clear prices, insurance info, transparent deposit, 2 helmets, phone holder, lock, support, easy return. NEXA Rentals includes 125cc automatic scooters with 2 helmets, holder, and lock.",
            ],
          },
          {
            heading: "Quick checklist: what to compare",
            paragraphs: [
              "Close to hotel/beach — saves pickup time. Clear licence rules — avoids collection problems. Transparent deposit — no surprise charges. Helmets + second helmet — essential for couples. Phone holder and lock — navigation and parking security. Online booking — reserve before sunny peak days. Insurance explained — know excess/franchise.",
            ],
          },
          {
            heading: "Why Magaluf and best pickup area",
            paragraphs: [
              "From Magaluf you reach beaches, neighbouring towns, restaurants, and Palma quickly — scooter helps when you visit several places in one day.",
              "Best pickup: near Magaluf beach, main tourist streets, easy on Google Maps, simple return access — not a hidden shop half a morning away.",
              "Renting [near Magaluf beach](https://www.nexarentals.es/en/blog/scooter-rental-magaluf-near-the-beach) helps if you want Palmanova or Cala Vinyes fast — still check deposit, insurance, and inclusions, not location alone.",
            ],
          },
          {
            heading: "What should be included and typical prices",
            paragraphs: [
              "Must include: helmet, second helmet for couples, phone holder, security lock, clear insurance and deposit rules.",
              "Half-day suits Palmanova/Cala Vinyes; full-day for longer freedom; multi-day for better daily value. See [scooter prices in Magaluf](https://www.nexarentals.es/en/blog/how-much-does-it-cost-to-rent-a-scooter-in-magaluf).",
              "Compare total cost: deposit, excess, fuel, late return, passenger rules — not headline price alone.",
            ],
          },
          {
            heading: "Licence, documents, and deposit",
            paragraphs: [
              "125cc: A1, A2, A, or B+3 years where accepted; IDP if required. Bring physical licence — see [125cc licence Spain](https://www.nexarentals.es/en/blog/what-license-do-you-need-to-rent-a-125cc-scooter-in-spain) and [what you need in Mallorca](https://www.nexarentals.es/en/blog/what-do-you-need-to-rent-a-scooter-in-mallorca).",
              "Documents: passport/ID, licence, IDP if needed, deposit method, confirmation, WhatsApp contact.",
              "Deposit usually required — ask amount, cash vs card, pre-auth, release timing, excess. [Deposit guide](https://www.nexarentals.es/en/blog/do-you-need-a-deposit-to-rent-a-scooter-in-mallorca).",
            ],
          },
          {
            heading: "Best routes, scooter vs taxi and bus",
            paragraphs: [
              "Easy routes: Magaluf → Palmanova, Son Maties, Cala Vinyes, Santa Ponça, Portals Nous; Palma for confident riders or [TIB Line 104](https://www.tib.org/en/web/transport/mallorca/line/104) bus. More: [best places by scooter](https://www.nexarentals.es/en/blog/best-places-to-visit-by-scooter-from-magaluf).",
              "Scooter by day for beach hopping; taxi at night, with luggage, or after drinking. [Scooter vs taxi](https://www.nexarentals.es/en/blog/scooter-vs-taxi-in-magaluf). Bus for cheap direct Palma; scooter for flexible stops.",
            ],
          },
          {
            heading: "How to choose a company and online booking",
            paragraphs: [
              "Yes to: clear prices, easy pickup, licence/deposit explained, 2 helmets, holder, lock, insurance, online booking, contact option, maintained scooters.",
              "Avoid: hidden deposit, no insurance explanation, surprise extras, unclear fuel policy, poor helmets.",
              "Book online in July–August before scooters sell out — see [rent online in under 1 minute](https://www.nexarentals.es/en/blog/how-to-rent-a-scooter-online-in-magaluf-in-under-1-minute).",
            ],
          },
          {
            heading: "Magaluf vs Palmanova, safety, and final answer",
            paragraphs: [
              "Palmanova is calmer; Magaluf usually better for fast tourist pickup and Cala Vinyes access. Both are close — pick clearest terms and easiest pickup. [Magaluf vs Palmanova rental](https://www.nexarentals.es/en/blog/magaluf-vs-palmanova-scooter-rental).",
              "Safety: helmet always, no alcohol, photos at pickup, lock when parked, return on time, no unauthorised riders.",
              "Best place = central, transparent, full package. NEXA Rentals: 125cc, 2 helmets, holder, lock. Book at [NEXA scooter rental Magaluf](https://www.nexarentals.es/en/scooter-rental-magaluf) or [vehicles page](https://www.nexarentals.es/en).",
            ],
          },
        ],
        faqs: [
          {
            question: "Where is the best place to rent a scooter in Magaluf?",
            answer:
              "A central rental near the tourist area with clear prices, online booking, transparent deposit, helmets, lock, phone holder, and licence checks.",
          },
          {
            question: "Is scooter rental in Magaluf worth it?",
            answer:
              "Yes for exploring Palmanova, Cala Vinyes, Santa Ponça, or Portals without taxis all day.",
          },
          {
            question: "Do I need a licence to rent a scooter in Magaluf?",
            answer:
              "Yes for 125cc — usually A1, A2, A, or B held 3+ years where accepted in Spain.",
          },
          {
            question: "Are helmets included with scooter rental in Magaluf?",
            answer:
              "Policies vary — NEXA Rentals includes 2 helmets free with 125cc scooters.",
          },
          {
            question: "Do I need a deposit?",
            answer:
              "Usually yes — refundable deposit for damage, fines, or late return. Confirm amount before booking.",
          },
          {
            question: "Can I ride from Magaluf to Palma by scooter?",
            answer:
              "Yes for confident riders; TIB Line 104 bus is available for direct public transport.",
          },
          {
            question: "Is Magaluf or Palmanova better for scooter rental?",
            answer:
              "Magaluf for fast tourist pickup; Palmanova if your hotel is there. Both are minutes apart.",
          },
          {
            question: "Where can I book scooter rental in Magaluf?",
            answer:
              "NEXA Rentals — check availability, licence, deposit, and inclusions before pickup.",
          },
        ],
        ctaTitle: "Book the best scooter rental in Magaluf",
        ctaText:
          "NEXA Rentals — 125cc scooters with 2 helmets, phone holder, and lock. Book online and explore southwest Mallorca with confidence.",
      },
    },
  },
  {
    id: "what-you-need-rent-scooter-mallorca",
    priority: 5,
    translations: {
      en: {
        slug: "what-do-you-need-to-rent-a-scooter-in-mallorca",
        title: "What Do You Need to Rent a Scooter in Mallorca?",
        metaTitle:
          "Scooter Rental Requirements Mallorca | NEXA Rentals",
        metaDescription:
          "What do you need to rent a scooter in Mallorca? Learn the real licence rules, ID/passport, deposit, age requirements, insurance, helmets and documents tourists need.",
        excerpt:
          "Licence, passport/ID, deposit, minimum age, helmet, contract. 125cc: A1/A2/A or B+3 years. NEXA includes 2 helmets, holder, and lock.",
        category: "Booking",
        readTime: "15 min read",
        publishedAt: "2026-05-20",
        updatedAt: "2026-05-20",
        heroImage: getBlogHeroImage("what-you-need-rent-scooter-mallorca"),
        imageAlt: "Requirements to rent a scooter in Mallorca documents and licence",
        quickAnswer:
          "You need a valid driving licence, passport or ID, deposit/payment method, and to meet age and insurance rules. For 125cc: A1, A2, A, or B held 3+ years where accepted; IDP if required. Bring physical licence — not phone photos only. NEXA Magaluf: 2 helmets, phone holder, lock included.",
        sections: [
          {
            heading: "What do you need to rent a scooter in Mallorca?",
            paragraphs: [
              "Normally: valid driving licence, passport or ID, deposit, minimum age, signed contract, helmet use, and clear insurance/deposit understanding.",
              "125cc needs a licence for that category in Spain — rules vary by country and rental insurance. Do not assume a car licence is always enough.",
              "Prepare: passport/ID, physical licence, IDP if required, deposit card, booking confirmation, and know helmet and return rules.",
            ],
          },
          {
            heading: "Quick requirements checklist",
            paragraphs: [
              "Passport/ID — yes. Driving licence — yes. A1/A2/A — yes for many scooters. B+3 years — sometimes for 125cc. IDP — sometimes for non-EU. Deposit — usually yes. Minimum age — yes. Helmet — yes. Contract — yes.",
            ],
          },
          {
            heading: "Valid driving licence and car licence",
            paragraphs: [
              "125cc usually requires A1, A2, A, B+3 years where accepted in Spain, or IDP if required. A1 covers motorcycles up to 125cc and 11 kW.",
              "B under 3 years — usually not enough for 125cc. B over 3 years — may work in Spain but confirm with the rental company. No licence — no rental.",
              "Full detail: [125cc licence in Spain](https://www.nexarentals.es/en/blog/what-license-do-you-need-to-rent-a-125cc-scooter-in-spain), [rent with car licence](https://www.nexarentals.es/en/blog/can-you-rent-a-scooter-in-mallorca-with-a-car-licence).",
            ],
          },
          {
            heading: "Passport, ID, and International Driving Permit",
            paragraphs: [
              "Bring original passport or national ID — not only a photo. EU citizens may use national ID; non-EU tourists usually need passport.",
              "IDP may be required for USA, Canada, India, Australia, and other non-EU licences — used with your original licence, not as a replacement. Ask before booking.",
            ],
          },
          {
            heading: "Minimum age and deposit",
            paragraphs: [
              "Age rules link to insurance — often 18 or 21+ for 125cc depending on company. Ask minimum age, licence holding period, and passenger rules.",
              "Most rentals require a deposit for damage, late return, lost keys, fines, or accessories. NEXA usual €150 at pickup — card pre-auth or cash per conditions.",
              "Ask: amount, cash vs card, pre-auth vs charge, release timing, excess/franchise. [Deposit guide](https://www.nexarentals.es/en/blog/do-you-need-a-deposit-to-rent-a-scooter-in-mallorca).",
            ],
          },
          {
            heading: "Insurance, helmets, and inclusions",
            paragraphs: [
              "Insurance included does not mean zero responsibility — understand excess, theft, tyres, mirrors, unauthorised riders, and alcohol rules. Read the contract.",
              "Helmets mandatory — rider and passenger. NEXA includes 2 helmets free. Check fit, strap, visor before leaving.",
              "Compare inclusions: second helmet, phone holder, lock, fuel policy, kilometres, pickup/return times. [What's included in Magaluf](https://www.nexarentals.es/en/blog/what-is-included-when-you-rent-a-scooter-in-magaluf), [helmets in Mallorca](https://www.nexarentals.es/en/blog/do-scooter-rentals-in-mallorca-include-helmets).",
            ],
          },
          {
            heading: "Fuel, pickup times, and scooter inspection",
            paragraphs: [
              "Fuel: usually return same level as pickup — note type and level; photo at pickup helps.",
              "Know pickup and return times — late return may cost extra, especially in high season.",
              "Inspect before riding: panels, mirrors, lights, tyres, scratches, fuel, helmets, lock, holder. Photo existing damage and ask staff to note it.",
            ],
          },
          {
            heading: "Tourists, routes, mistakes, and safety",
            paragraphs: [
              "Tourists can rent in Magaluf, Palmanova, Palma, Alcúdia, Cala d'Or with correct documents. 125cc suits Magaluf → Palmanova, Cala Vinyes, Santa Ponça, Portals — see [best places](https://www.nexarentals.es/en/blog/best-places-to-visit-by-scooter-from-magaluf), [best rental location](https://www.nexarentals.es/en/blog/best-place-to-rent-a-scooter-in-magaluf), [125cc tourists](https://www.nexarentals.es/en/blog/can-tourists-rent-a-125cc-scooter-in-mallorca).",
              "Avoid: no physical licence, assuming B is enough, no IDP, ignoring deposit/excess, no helmet check, alcohol, friend riding, late return, illegal parking.",
              "Safety: helmet always, no alcohol, indicators, careful roundabouts, holder for nav only, legal parking, lock scooter, return on time.",
              "Book at [NEXA scooter rental Magaluf](https://www.nexarentals.es/en/scooter-rental-magaluf) or [vehicles page](https://www.nexarentals.es/en) when documents are ready.",
            ],
          },
        ],
        faqs: [
          {
            question: "What documents do I need to rent a scooter in Mallorca?",
            answer:
              "Passport or ID, physical driving licence, deposit method, IDP if required, and booking confirmation.",
          },
          {
            question: "Do I need a licence to rent a scooter in Mallorca?",
            answer:
              "Yes — for 125cc usually A1, A2, A, or B held 3+ years where accepted.",
          },
          {
            question: "Can I rent a scooter in Mallorca with a car licence?",
            answer:
              "Often yes if B has been held 3+ years and the rental company accepts it for insurance.",
          },
          {
            question: "Do I need an International Driving Permit?",
            answer:
              "Some non-EU tourists need an IDP with their original licence — ask before booking.",
          },
          {
            question: "Do I need a deposit?",
            answer:
              "Usually yes — protects against damage, fines, late return, and lost accessories.",
          },
          {
            question: "Are helmets included?",
            answer:
              "Policies vary — NEXA Rentals includes 2 helmets free with 125cc scooters.",
          },
          {
            question: "Can tourists rent a 125cc scooter in Mallorca?",
            answer:
              "Yes if licence, age, ID, deposit, and insurance requirements are met.",
          },
          {
            question: "Where can I rent a scooter in Magaluf?",
            answer:
              "NEXA Rentals — check availability, licence, deposit, and inclusions before pickup.",
          },
        ],
        ctaTitle: "Rent with the right documents ready",
        ctaText:
          "NEXA Rentals Magaluf — confirm your licence on WhatsApp, then book online. 2 helmets, phone holder, and lock included.",
      },
    },
  },
];

export const allBlogPosts: BlogPost[] = applyBlogPublishSchedule(
  applyBlogTranslations([...blogPosts, ...additionalBlogPosts])
);

export function getBlogsForLocale(locale: Locale) {
  return allBlogPosts
    .filter((post) => hasBlogLocale(post, locale))
    .slice()
    .sort(
      (a, b) =>
        new Date(getBlogTranslation(b, locale).publishedAt).getTime() -
        new Date(getBlogTranslation(a, locale).publishedAt).getTime()
    )
    .map((post) => {
      const translation = getBlogTranslation(post, locale);

      return {
        id: post.id,
        priority: post.priority,
        ...translation,
        heroImage: getBlogHeroImage(post.id),
      };
    });
}

export function getBlogBySlug(locale: Locale, slug: string) {
  return allBlogPosts.find((post) => {
    if (!hasBlogLocale(post, locale)) return false;
    return getBlogTranslation(post, locale).slug === slug;
  });
}

/** Find a post when the slug matches any locale (for language switcher). */
export function findBlogPostBySlug(slug: string): BlogPost | undefined {
  return allBlogPosts.find((post) =>
    Object.values(post.translations).some((t) => t?.slug === slug)
  );
}

export function getBlogSlugForLocale(post: BlogPost, locale: Locale): string | undefined {
  return post.translations[locale]?.slug;
}

export function getBlogPathForLocale(post: BlogPost, locale: Locale): string | undefined {
  const slug = getBlogSlugForLocale(post, locale);
  if (!slug) return undefined;
  return `/${locale}/blog/${slug}`;
}

export function getBlogTranslation(post: BlogPost, locale: Locale): BlogTranslation {
  const translation = post.translations[locale];
  if (!translation) {
    throw new Error(`Missing blog translation for ${post.id} (${locale})`);
  }
  return translation;
}

export function hasBlogLocale(post: BlogPost, locale: Locale) {
  return Boolean(post.translations[locale]);
}

export function getAllBlogStaticParams() {
  return allBlogPosts.flatMap((post) =>
    Object.entries(post.translations).map(([locale, translation]) => ({
      locale,
      slug: translation.slug,
    }))
  );
}