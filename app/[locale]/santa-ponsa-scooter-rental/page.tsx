

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Poppins } from "next/font/google";

import GoogleReviewsV3 from "../../components/GoogleReviewsV3";
import LocationV3 from "../../components/LocationV3";
import NexaStatsStripV3 from "../../components/NexaStatsStripV3";
import NeroWebsiteAssistant from "../../components/NeroWebsiteAssistant";

const pageFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-nexa-seo",
});

const SUPPORTED_LOCALES = [
  "en",
  "es",
  "de",
  "fr",
  "it",
  "nl",
  "pl",
  "sv",
  "da",
  "no",
  "pt",
  "cs",
  "uk",
] as const;

type Locale = (typeof SUPPORTED_LOCALES)[number];

type PageProps = {
  params:
    | {
        locale: string;
      }
    | Promise<{
        locale: string;
      }>;
};

const LANGUAGES: {
  code: Locale;
  label: string;
  short: string;
  flagSrc: string;
}[] = [
  { code: "en", label: "English", short: "EN", flagSrc: "/images/en.png" },
  { code: "es", label: "Español", short: "ES", flagSrc: "/images/es.png" },
  { code: "de", label: "Deutsch", short: "DE", flagSrc: "/images/de.png" },
  { code: "fr", label: "Français", short: "FR", flagSrc: "/images/fr.png" },
  { code: "it", label: "Italiano", short: "IT", flagSrc: "/images/it.png" },
  { code: "nl", label: "Nederlands", short: "NL", flagSrc: "/images/NL.png" },
  { code: "pl", label: "Polski", short: "PL", flagSrc: "/images/PL.png" },
  { code: "sv", label: "Svenska", short: "SV", flagSrc: "/images/sv.png" },
  { code: "da", label: "Dansk", short: "DA", flagSrc: "/images/DA.png" },
  { code: "no", label: "Norsk", short: "NO", flagSrc: "/images/NO.png" },
  { code: "pt", label: "Português", short: "PT", flagSrc: "/images/pt.png" },
  { code: "cs", label: "Čeština", short: "CS", flagSrc: "/images/CS.png" },
  { code: "uk", label: "Українська", short: "UK", flagSrc: "/images/UK.png" },
];

const INCLUDED_ITEMS = [
  {
    image: "/images/ex4.png",
    title: "Two helmets",
    text: "Included for the rider and passenger.",
  },
  {
    image: "/images/ex1.jpg",
    title: "50-litre top box",
    text: "Practical space for a beach bag, helmet or shopping.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Waterproof phone holder",
    text: "Ideal for navigation from Santa Ponsa across Mallorca.",
  },
  {
    image: "/images/ex3.png",
    title: "Security lock",
    text: "For secure stops at the beach, your hotel or scenic viewpoints.",
  },
  {
    image: "/images/ex5.png",
    title: "Insurance",
    text: "Basic insurance is included.",
  },
];

function normalizeLocale(locale: string | undefined): Locale {
  if (SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }

  return "en";
}

async function getPageLocale(params: PageProps["params"]) {
  const resolvedParams = await params;
  return normalizeLocale(resolvedParams?.locale);
}

function getLanguageHref(languageCode: Locale) {
  if (languageCode === "en") {
    return "/en/santa-ponsa-scooter-rental";
  }

  if (languageCode === "it") {
    return "/it/scooter-a-noleggio-santa-ponsa";
  }

  if (languageCode === "de") {
    return "/de/rollerverleih-santa-ponsa";
  }

  return `/${languageCode}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const isEnglishPage = locale === "en";

  return {
    title:
      "Santa Ponsa Scooter Rental | 125cc Scooter Hire Mallorca | NEXA Rentals",
    description:
      "Scooter rental in Santa Ponsa, Mallorca. Book a 125cc scooter online from €39 with NEXA Rentals, pay securely and collect it in Magaluf, around 10 minutes from Santa Ponsa. Ideal for Santa Ponsa, Costa de la Calma, El Toro, Port Adriano and south-west Mallorca.",
    keywords: [
      "Santa Ponsa scooter rental",
      "scooter rental Santa Ponsa",
      "scooter rental Santa Ponsa Mallorca",
      "scooter hire Santa Ponsa",
      "motor scooter rental Santa Ponsa",
      "125cc scooter Santa Ponsa",
      "125cc scooter Santa Ponsa Mallorca",
      "Santa Ponsa scooter hire Mallorca",
      "book scooter online Santa Ponsa",
      "scooter rental Costa de la Calma",
      "scooter rental El Toro",
      "scooter rental Port Adriano",
      "scooter rental Paguera",
      "scooter rental Magaluf",
      "NEXA Rentals Magaluf",
      "cheap scooter rental Mallorca",
    ],
    alternates: {
      canonical:
        "https://www.nexarentals.es/en/santa-ponsa-scooter-rental",
    },
    openGraph: {
      title:
        "Santa Ponsa Scooter Rental | NEXA Rentals Mallorca",
      description:
        "Book a 125cc scooter online for Santa Ponsa and south-west Mallorca. NEXA Rentals is around 10 minutes from Santa Ponsa, with collection and return at our Magaluf office.",
      url: "https://www.nexarentals.es/en/santa-ponsa-scooter-rental",
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "Scooter rental in Santa Ponsa, Mallorca, with NEXA Rentals",
        },
      ],
      locale: "en_GB",
      type: "website",
    },
    robots: {
      index: isEnglishPage,
      follow: true,
      googleBot: {
        index: isEnglishPage,
        follow: true,
      },
    },
  };
}

export default async function SantaPonsaScooterRentalPage({
  params,
}: PageProps) {
  const locale = await getPageLocale(params);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];

  const homeHref = `/${locale}`;
  const bookHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;
  const externalBookingHref = `/${locale}/home`;
  const mapsHref = "https://maps.app.goo.gl/YTDy4J1VGNbnXJFZ8";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where can I rent a scooter in Santa Ponsa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can book your 125cc scooter online with NEXA Rentals and collect it from our office in Magaluf. NEXA Rentals is around 10 minutes from Santa Ponsa and is a practical choice if you are staying in Santa Ponsa, Costa de la Calma, El Toro, Port Adriano or Paguera.",
        },
      },
      {
        "@type": "Question",
        name: "How far is NEXA Rentals from Santa Ponsa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NEXA Rentals is in Magaluf, around 10 minutes from Santa Ponsa by car or taxi. Collection and return take place directly at the NEXA Rentals office in Magaluf.",
        },
      },
      {
        "@type": "Question",
        name: "Is scooter delivery available in Santa Ponsa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. We do not currently provide a scooter delivery service in Santa Ponsa. Collection and return take place directly at NEXA Rentals in Magaluf, keeping the vehicle handover quick, secure and straightforward.",
        },
      },
      {
        "@type": "Question",
        name: "Can I pay online for my Santa Ponsa scooter rental?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can book your scooter online and pay the rental price online, so your 125cc scooter is reserved for the dates you select.",
        },
      },
      {
        "@type": "Question",
        name: "Which driving licence do I need for a 125cc scooter in Mallorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A, A1 and A2 motorcycle licences are accepted. You may also ride a 125cc scooter with a category B car licence if it has been valid for at least 3 years. Provisional and learner licences are not accepted.",
        },
      },
      {
        "@type": "Question",
        name: "What is included with scooter rental in Santa Ponsa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NEXA Rentals includes two helmets, a 50-litre top box, a security lock, a waterproof phone holder, unlimited kilometres and basic insurance.",
        },
      },
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "NEXA Rentals",
    url: "https://www.nexarentals.es",
    image: "https://www.nexarentals.es/images/personscooter.jpg",
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: "C. Galeón, 13, Loc 57",
      postalCode: "07181",
      addressLocality: "Magaluf",
      addressRegion: "Illes Balears",
      addressCountry: "ES",
    },
    areaServed: [
      "Santa Ponsa",
      "Costa de la Calma",
      "El Toro",
      "Port Adriano",
      "Paguera",
      "Magaluf",
      "Palmanova",
      "Calvià",
      "Mallorca",
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "14:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "15:00",
        closes: "20:00",
      },
    ],
    makesOffer: {
      "@type": "Offer",
      name: "125cc scooter rental in Santa Ponsa, Mallorca",
      price: "39",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      areaServed: "Santa Ponsa, Mallorca",
    },
  };

  return (
    <main className={`${pageFont.variable} nexa-seo-page`}>
      <Script
        id="nexa-seo-navbar-scroll"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var ticking = false;

              function getScrollTop() {
                return Math.max(
                  window.scrollY || 0,
                  document.documentElement.scrollTop || 0,
                  document.body.scrollTop || 0
                );
              }

              function applyNavbarState() {
                var navbar = document.querySelector(".nexa-seo-navbar");
                var scrolled = getScrollTop() > 18;

                if (navbar) {
                  navbar.setAttribute("data-scrolled", scrolled ? "true" : "false");
                }

                document.documentElement.classList.toggle("nexa-seo-page-scrolled", scrolled);
              }

              function requestUpdate() {
                if (ticking) return;

                ticking = true;

                window.requestAnimationFrame(function () {
                  ticking = false;
                  applyNavbarState();
                });
              }

              applyNavbarState();

              window.addEventListener("scroll", requestUpdate, { passive: true });
              window.addEventListener("resize", requestUpdate);
              document.addEventListener("scroll", requestUpdate, {
                passive: true,
                capture: true
              });

              setTimeout(applyNavbarState, 50);
              setTimeout(applyNavbarState, 350);
            })();
          `,
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c"),
        }}
      />

      <header className="nexa-seo-navbar" data-scrolled="false">
        <div className="nexa-seo-nav-inner">
          <Link
            href={homeHref}
            className="nexa-seo-logo-link nexa-hide-on-scroll"
          >
            <Image
              src="/images/reallogo.png"
              alt="NEXA Rentals"
              width={290}
              height={96}
              priority
              className="nexa-seo-logo"
            />
          </Link>

          <div
            className="nexa-scroll-arrows nexa-scroll-arrows-left"
            aria-hidden="true"
          >
            <span>→</span>
            <span>→</span>
            <span>→</span>
          </div>

          <Link href={bookHref} className="nexa-seo-book-button">
            <span>Book now</span>
          </Link>

          <div
            className="nexa-scroll-arrows nexa-scroll-arrows-right"
            aria-hidden="true"
          >
            <span>←</span>
            <span>←</span>
            <span>←</span>
          </div>

          <div className="nexa-seo-nav-right nexa-hide-on-scroll">
            <Link href={contactHref} className="nexa-seo-contact-button">
              Contact
            </Link>

            <details className="nexa-seo-language">
              <summary className="nexa-seo-language-current">
                <Image
                  src={currentLanguage.flagSrc}
                  alt={currentLanguage.label}
                  width={20}
                  height={20}
                  className="nexa-seo-flag"
                />
                <span>{currentLanguage.short}</span>
                <span className="nexa-seo-arrow">▾</span>
              </summary>

              <div className="nexa-seo-language-menu">
                {LANGUAGES.map((language) => {
                  const active = language.code === locale;

                  return (
                    <Link
                      key={language.code}
                      href={getLanguageHref(language.code)}
                      className={
                        active
                          ? "nexa-seo-language-option active"
                          : "nexa-seo-language-option"
                      }
                    >
                      <span className="nexa-seo-language-left">
                        <Image
                          src={language.flagSrc}
                          alt={language.label}
                          width={22}
                          height={22}
                          className="nexa-seo-flag"
                        />
                        <span>{language.label}</span>
                      </span>

                      <span className="nexa-seo-language-short">
                        {language.short}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="nexa-hero-section">
        <div className="nexa-hero-grid">
          <div className="nexa-hero-copy">
            <h1>
              Santa Ponsa scooter rental: hire a 125cc scooter and explore
              Mallorca freely.
            </h1>

            <p className="nexa-hero-text">
              Looking for <strong>scooter rental in Santa Ponsa</strong>,{" "}
              <strong>scooter hire in Santa Ponsa</strong> or a{" "}
              <strong>125cc scooter in Santa Ponsa, Mallorca</strong>? With NEXA
              Rentals, you can book your scooter online, pay securely and
              collect your 125cc scooter directly from our Magaluf office.
            </p>

            <p className="nexa-hero-text small">
              Ideal if you are staying in Santa Ponsa, Costa de la Calma, El
              Toro, Port Adriano, Paguera or elsewhere in south-west Mallorca and want
              to visit beaches, restaurants, viewpoints and nearby resorts
              without depending on taxis.
            </p>

            <div className="nexa-hero-actions">
              <Link href={bookHref} className="nexa-primary-cta">
                Book your scooter now
              </Link>

              <Link href={contactHref} className="nexa-secondary-cta">
                Questions? Contact us
              </Link>
            </div>

            <div className="nexa-online-note">
              Book online at{" "}
              <a
                href={externalBookingHref}
                target="_blank"
                rel="noreferrer"
              >
                www.nexarentals.es/en/home
              </a>
            </div>

            <div className="nexa-distance-note">
              <div>
                <strong>Around 10 minutes from Santa Ponsa.</strong>
                <span>
                  NEXA Rentals is in Magaluf: book online, collect your scooter in
                  Magaluf and ride directly towards Santa Ponsa, Costa de la Calma
                  or Port Adriano.
                </span>
              </div>

              <a href={mapsHref} target="_blank" rel="noreferrer">
                Open in Maps
              </a>
            </div>

            <div className="nexa-hero-points">
              <div>
                <strong>from €39</strong>
                <span>Half-day scooter rental</span>
              </div>

              <div>
                <strong>125cc</strong>
                <span>Piaggio and SYM scooters</span>
              </div>

              <div>
                <strong>Santa Ponsa</strong>
                <span>Book online and collect in Magaluf</span>
              </div>
            </div>
          </div>

          <div className="nexa-hero-visual">
            <div className="nexa-visual-stack">
              <div className="nexa-orange-shape" />

              <div className="nexa-photo-card nexa-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Scooter rental in Santa Ponsa, Mallorca, with NEXA Rentals"
                  width={900}
                  height={620}
                  priority
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-photo-card nexa-photo-card-bottom">
                <Image
                  src="/images/scooterperson2.jpg"
                  alt="Scooter rental in Santa Ponsa and south-west Mallorca"
                  width={900}
                  height={720}
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-floating-price">
                <span>from</span>
                <strong>39€</strong>
                <small>all included</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-trust-section">
        <p>
          For travellers staying in Santa Ponsa and south-west
          Mallorca
        </p>

        <div className="nexa-trust-logos">
          <span>Santa Ponsa scooter rental</span>
          <span>Scooter rental Santa Ponsa</span>
          <span>10 min from Santa Ponsa</span>
          <span>Port Adriano</span>
          <span>Costa de la Calma</span>
          <span>125cc scooters</span>
        </div>
      </section>

      <section className="nexa-fast-info-section">
        <div className="nexa-fast-info-grid">
          {INCLUDED_ITEMS.map((item) => (
            <div key={item.title} className="nexa-included-item">
              <span className="nexa-orange-check">✓</span>

              <div className="nexa-included-image-wrap">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={260}
                  height={180}
                  className="nexa-included-image"
                />
              </div>

              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="nexa-components-section">
        <GoogleReviewsV3 />
      </section>

      <section className="nexa-components-section stats">
        <NexaStatsStripV3 />
      </section>

      <section className="nexa-content-section">
        <div className="nexa-content-grid">
          <article>
            <span className="nexa-section-label">
              Why choose NEXA Rentals?
            </span>

            <h2>
              Rent a scooter near Santa Ponsa with simple online booking.
            </h2>

            <p>
              Many travellers staying in Santa Ponsa look for a reliable
              scooter rental service in Mallorca so they do not have to depend
              on taxis, buses or long waits every day. With NEXA Rentals, the
              process is simple: book your 125cc scooter online, pay online and
              collect it directly from our office in Magaluf.
            </p>

            <p>
              NEXA Rentals is around 10 minutes from Santa Ponsa, making it a
              practical option if you are staying in Santa Ponsa, Costa de la Calma,
              El Toro, Port Adriano, Paguera, Palmanova, Magaluf or Calvià. Explore
              beaches, coves, restaurants and viewpoints at your own pace and
              enjoy more freedom during your Mallorca holiday.
            </p>
          </article>

          <aside className="nexa-info-box">
            <h3>What is included</h3>

            <ul>
              <li>125cc scooter for Santa Ponsa and Mallorca</li>
              <li>Around 10 minutes from Santa Ponsa</li>
              <li>Online booking and payment</li>
              <li>Two helmets included</li>
              <li>
                50-litre top box for a beach bag, helmet or shopping
              </li>
              <li>Waterproof phone holder for navigation</li>
              <li>Security lock included</li>
              <li>Unlimited kilometres</li>
              <li>Basic insurance included</li>
              <li>Collection and return at NEXA Rentals in Magaluf</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="nexa-how-section">
        <div className="nexa-how-inner">
          <span className="nexa-section-label">How it works</span>

          <h2>
            Book your scooter for Santa Ponsa in just a few simple steps.
          </h2>

          <div className="nexa-how-grid">
            <div>
              <span>01</span>
              <h3>Choose your scooter online</h3>
              <p>
                Choose your 125cc scooter, rental date and duration. Booking is
                quick, clear and ideal if you are staying in Santa Ponsa or
                nearby areas.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Pay online</h3>
              <p>
                Pay the rental price online and reserve your scooter for your
                holiday dates. This confirms the vehicle before your rental
                begins.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Collect in Magaluf</h3>
              <p>
                Come to NEXA Rentals in Magaluf with your original driving licence
                and an ID card or passport. Our office is around 10 minutes
                from Santa Ponsa. We will explain everything before you set off
                towards Santa Ponsa, the beach or your planned route.
              </p>
            </div>
          </div>

          <Link href={bookHref} className="nexa-bottom-cta">
            Book your scooter for Santa Ponsa
          </Link>
        </div>
      </section>

      <section className="nexa-seo-text-section">
        <div className="nexa-seo-text-inner">
          <span className="nexa-section-label">
            Santa Ponsa scooter rental
          </span>

          <h2>
            For travellers who want to explore Santa Ponsa and Mallorca with
            complete freedom.
          </h2>

          <p>
            When you search for “Santa Ponsa scooter rental”, “scooter rental
            Santa Ponsa”, “motor scooter rental Santa Ponsa”, “scooter hire Santa
            Ponsa” or “125cc scooter Santa Ponsa Mallorca”, you probably want a simple
            solution rather than a complicated process. NEXA Rentals provides
            clear information, online booking, secure payment and a scooter for
            exploring Mallorca freely.
          </p>

          <p>
            This page is particularly useful if you are staying in Santa Ponsa,
            Costa de la Calma, El Toro, Port Adriano, Paguera or elsewhere in
            south-west Mallorca. NEXA Rentals is in Magaluf, around 10 minutes
            from Santa Ponsa. We do not currently provide scooter delivery in
            Santa Ponsa: collection and return take place directly at NEXA Rentals
            in Magaluf, so vehicle handover remains personal, quick and well
            organised.
          </p>

          <div className="nexa-keyword-cloud">
            <span>Santa Ponsa scooter rental</span>
            <span>Scooter rental Santa Ponsa</span>
            <span>125cc scooter Santa Ponsa</span>
            <span>Motor scooter rental Santa Ponsa</span>
            <span>Scooter hire Santa Ponsa</span>
            <span>Scooter rental Costa de la Calma</span>
            <span>Scooter rental Port Adriano</span>
            <span>10 minutes from Santa Ponsa</span>
            <span>NEXA Rentals Magaluf</span>
          </div>
        </div>
      </section>

      <section className="nexa-location-section">
        <LocationV3 />
      </section>

      <section className="nexa-faq-section">
        <div className="nexa-faq-inner">
          <span className="nexa-section-label">Frequently asked questions</span>

          <h2>Questions about scooter rental in Santa Ponsa</h2>

          <div className="nexa-faq-list">
            <details>
              <summary>
                Which driving licence do I need for a 125cc scooter?
              </summary>
              <p>
                A, A1 and A2 motorcycle licences are accepted. You may also ride a
                125cc scooter with a category B car licence if it has been
                valid for at least 3 years. Provisional and learner licences
                are not accepted.
              </p>
            </details>

            <details>
              <summary>How far is NEXA Rentals from Santa Ponsa?</summary>
              <p>
                NEXA Rentals is in Magaluf, around 10 minutes from Santa Ponsa. You
                can book online, collect your scooter in Magaluf and ride
                directly towards Santa Ponsa, Costa de la Calma, El Toro or Port
                Adriano.
              </p>
            </details>

            <details>
              <summary>
                Can I have the scooter delivered directly to Santa Ponsa?
              </summary>
              <p>
                No. We do not currently provide a scooter delivery service in
                Santa Ponsa. Collection and return take place directly at NEXA
                Rentals in Magaluf, keeping the vehicle handover quicker, clear
                and secure.
              </p>
            </details>

            <details>
              <summary>Can I pay for the scooter online?</summary>
              <p>
                Yes. You can book online and pay the rental price online, so your
                scooter is reserved for the dates you select.
              </p>
            </details>

            <details>
              <summary>What is included in the price?</summary>
              <p>
                Two helmets, a 50-litre top box, a security lock, a waterproof
                phone holder, unlimited kilometres and basic insurance are
                included.
              </p>
            </details>

            <details>
              <summary>
                Is NEXA Rentals a good option for Santa Ponsa, El Toro and Port
                Adriano?
              </summary>
              <p>
                Yes. NEXA Rentals is a practical option if you are staying in
                Santa Ponsa, Costa de la Calma, El Toro, Port Adriano, Paguera,
                Magaluf or Palmanova and want to rent a 125cc scooter in
                Mallorca.
              </p>
            </details>
          </div>

          <div className="nexa-final-cta">
            <h3>Ready to explore Santa Ponsa and Mallorca?</h3>
            <p>
              Book your 125cc scooter online and start directly from NEXA
              Rentals in Magaluf, around 10 minutes from Santa Ponsa.
            </p>
            <div className="nexa-final-cta-actions">
              <Link href={bookHref}>Book your scooter now</Link>
              <a href={mapsHref} target="_blank" rel="noreferrer">
                Open in Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="nexa-seo-footer">
        <div className="nexa-seo-footer-inner">
          <div className="nexa-seo-footer-brand">
            <Image
              src="/images/reallogo.png"
              alt="NEXA Rentals"
              width={220}
              height={72}
              className="nexa-seo-footer-logo"
            />
            <p>
              NEXA Rentals · Scooter and e-bike rental in Magaluf, Mallorca
            </p>
          </div>

          <div className="nexa-seo-footer-actions">
            <Link href={bookHref}>Book now</Link>
            <Link href={contactHref}>Contact</Link>
          </div>
        </div>
      </footer>

      <NeroWebsiteAssistant />

      <style>{`
        .nexa-seo-page,
        .nexa-seo-page * {
          font-family:
            var(--font-nexa-seo),
            Poppins,
            Arial,
            Helvetica,
            sans-serif;
          box-sizing: border-box;
        }

        .nexa-seo-page {
          min-height: 100vh;
          padding-top: 68px;
          background: #ffffff;
          color: #111116;
          overflow-x: hidden;
        }

        .nexa-seo-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2147483000;
          width: 100%;
          background: #000000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
          transform: translateZ(0);
        }

        .nexa-seo-nav-inner {
          position: relative;
          max-width: 1480px;
          height: 68px;
          margin: 0 auto;
          padding: 0 clamp(18px, 4vw, 56px);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nexa-hide-on-scroll {
          transform-origin: center;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition:
            opacity 260ms ease,
            visibility 260ms ease,
            transform 260ms ease;
        }

        .nexa-seo-navbar[data-scrolled="true"] .nexa-hide-on-scroll,
        html.nexa-seo-page-scrolled .nexa-seo-navbar .nexa-hide-on-scroll {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-12px) scale(0.98);
        }

        .nexa-seo-navbar[data-scrolled="true"],
        html.nexa-seo-page-scrolled .nexa-seo-navbar {
          box-shadow: 0 16px 42px rgba(0, 0, 0, 0.36);
        }

        .nexa-seo-logo-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          z-index: 3;
        }

        .nexa-seo-logo {
          width: auto;
          height: 48px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.45));
          transition:
            transform 220ms ease,
            filter 220ms ease;
        }

        .nexa-seo-logo-link:hover .nexa-seo-logo {
          transform: scale(1.025);
          filter: drop-shadow(0 10px 24px rgba(255, 122, 0, 0.2));
        }

        .nexa-scroll-arrows {
          position: absolute;
          top: 50%;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ff7a00;
          font-size: 31px;
          font-weight: 900;
          line-height: 1;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          filter: drop-shadow(0 0 12px rgba(255, 122, 0, 0.44));
          transition:
            opacity 260ms ease,
            visibility 260ms ease,
            transform 260ms ease;
        }

        .nexa-scroll-arrows-left {
          right: calc(50% + 118px);
          transform: translateY(-50%) translateX(-22px);
        }

        .nexa-scroll-arrows-right {
          left: calc(50% + 118px);
          transform: translateY(-50%) translateX(22px);
        }

        .nexa-seo-navbar[data-scrolled="true"] .nexa-scroll-arrows,
        html.nexa-seo-page-scrolled .nexa-seo-navbar .nexa-scroll-arrows {
          opacity: 1;
          visibility: visible;
        }

        .nexa-seo-navbar[data-scrolled="true"] .nexa-scroll-arrows-left,
        html.nexa-seo-page-scrolled .nexa-seo-navbar .nexa-scroll-arrows-left {
          transform: translateY(-50%) translateX(0);
        }

        .nexa-seo-navbar[data-scrolled="true"] .nexa-scroll-arrows-right,
        html.nexa-seo-page-scrolled .nexa-seo-navbar .nexa-scroll-arrows-right {
          transform: translateY(-50%) translateX(0);
        }

        .nexa-scroll-arrows span {
          display: inline-block;
          animation: nexaArrowPulseRight 1.05s ease-in-out infinite;
        }

        .nexa-scroll-arrows-right span {
          animation-name: nexaArrowPulseLeft;
        }

        .nexa-scroll-arrows span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .nexa-scroll-arrows span:nth-child(3) {
          animation-delay: 0.24s;
        }

        @keyframes nexaArrowPulseRight {
          0%,
          100% {
            opacity: 0.32;
            transform: translateX(-7px) scale(0.94);
          }

          50% {
            opacity: 1;
            transform: translateX(7px) scale(1.08);
          }
        }

        @keyframes nexaArrowPulseLeft {
          0%,
          100% {
            opacity: 0.32;
            transform: translateX(7px) scale(0.94);
          }

          50% {
            opacity: 1;
            transform: translateX(-7px) scale(1.08);
          }
        }

        .nexa-seo-book-button {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          min-width: 178px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 999px;
          background: #ffffff;
          color: #000000;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 12px;
          font-weight: 900;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.26),
            0 14px 34px rgba(255, 255, 255, 0.14),
            0 20px 50px rgba(0, 0, 0, 0.38);
          animation: nexaSeoHeartbeat 1.75s ease-in-out infinite;
          transition:
            box-shadow 220ms ease,
            background 220ms ease,
            color 220ms ease;
          z-index: 4;
        }

        .nexa-seo-book-button::before {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-130%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 122, 0, 0.36),
            transparent
          );
          transition: transform 700ms ease;
        }

        .nexa-seo-book-button span {
          position: relative;
          z-index: 2;
        }

        .nexa-seo-book-button:hover {
          animation-play-state: paused;
          background: #ff7a00;
          color: #000000;
          box-shadow:
            0 0 0 1px rgba(255, 122, 0, 0.7),
            0 0 28px rgba(255, 122, 0, 0.58),
            0 18px 46px rgba(255, 122, 0, 0.28);
        }

        .nexa-seo-book-button:hover::before {
          transform: translateX(130%);
        }

        .nexa-seo-book-button:active {
          animation-play-state: paused;
          transform: translate(-50%, -50%) scale(0.91);
          box-shadow:
            0 0 0 1px rgba(255, 122, 0, 0.7),
            0 0 14px rgba(255, 122, 0, 0.38);
        }

        @keyframes nexaSeoHeartbeat {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }

          12% {
            transform: translate(-50%, -50%) scale(1.075);
          }

          24% {
            transform: translate(-50%, -50%) scale(1);
          }

          36% {
            transform: translate(-50%, -50%) scale(1.045);
          }

          48% {
            transform: translate(-50%, -50%) scale(1);
          }

          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .nexa-seo-nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          z-index: 5;
        }

        .nexa-seo-contact-button {
          height: 40px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.92);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-size: 11px;
          font-weight: 800;
          animation: nexaSoftPulse 2.25s ease-in-out infinite;
          transition:
            background 220ms ease,
            border-color 220ms ease,
            color 220ms ease,
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .nexa-seo-contact-button:hover {
          animation-play-state: paused;
          transform: translateY(-1px) scale(1.04);
          border-color: rgba(255, 122, 0, 0.58);
          background: rgba(255, 122, 0, 0.12);
          color: #ffffff;
          box-shadow: 0 12px 28px rgba(255, 122, 0, 0.14);
        }

        .nexa-seo-contact-button:active {
          animation-play-state: paused;
          transform: scale(0.93);
        }

        @keyframes nexaSoftPulse {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(255, 122, 0, 0);
          }

          50% {
            box-shadow: 0 0 22px rgba(255, 122, 0, 0.14);
          }
        }

        .nexa-seo-language {
          position: relative;
        }

        .nexa-seo-language summary {
          list-style: none;
        }

        .nexa-seo-language summary::-webkit-details-marker {
          display: none;
        }

        .nexa-seo-language-current {
          height: 40px;
          min-width: 92px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 11px;
          font-weight: 900;
          user-select: none;
          transition:
            background 220ms ease,
            border-color 220ms ease,
            transform 220ms ease;
        }

        .nexa-seo-language-current:hover {
          border-color: rgba(255, 122, 0, 0.55);
          background: rgba(255, 255, 255, 0.11);
        }

        .nexa-seo-language-current:active {
          transform: scale(0.95);
        }

        .nexa-seo-flag {
          border-radius: 999px;
          object-fit: cover;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
        }

        .nexa-seo-arrow {
          display: inline-block;
          font-size: 10px;
          opacity: 0.74;
          transition: transform 220ms ease;
        }

        .nexa-seo-language[open] .nexa-seo-arrow {
          transform: rotate(180deg);
        }

        .nexa-seo-language-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: 250px;
          max-height: 430px;
          overflow-y: auto;
          padding: 8px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.94);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.68);
          backdrop-filter: blur(18px);
        }

        .nexa-seo-language-option {
          width: 100%;
          min-height: 44px;
          padding: 8px 10px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition:
            background 180ms ease,
            color 180ms ease,
            transform 180ms ease;
        }

        .nexa-seo-language-option:hover {
          transform: translateX(2px);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .nexa-seo-language-option.active {
          background: rgba(255, 122, 0, 0.16);
          color: #ffffff;
        }

        .nexa-seo-language-left {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .nexa-seo-language-short {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: #ff7a00;
        }

        .nexa-hero-section {
          padding: clamp(54px, 7vw, 96px) clamp(18px, 4vw, 56px) 42px;
          background: #ffffff;
        }

        .nexa-hero-grid {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(430px, 1.05fr);
          gap: clamp(34px, 6vw, 86px);
          align-items: center;
        }

        .nexa-hero-copy {
          position: relative;
          z-index: 2;
        }

        .nexa-hero-copy h1 {
          max-width: 670px;
          margin: 0;
          color: #141318;
          font-size: clamp(42px, 5.15vw, 76px);
          line-height: 1.02;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .nexa-hero-text {
          max-width: 650px;
          margin: 26px 0 0;
          color: #5f5d69;
          font-size: clamp(16px, 1.22vw, 18px);
          line-height: 1.78;
          letter-spacing: -0.018em;
          font-weight: 500;
        }

        .nexa-hero-text strong {
          color: #17161c;
          font-weight: 800;
        }

        .nexa-hero-text.small {
          margin-top: 14px;
          color: #74727e;
        }

        .nexa-hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }

        .nexa-primary-cta,
        .nexa-secondary-cta,
        .nexa-bottom-cta,
        .nexa-final-cta a {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: -0.01em;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            background 220ms ease,
            color 220ms ease,
            border-color 220ms ease;
        }

        .nexa-primary-cta,
        .nexa-bottom-cta,
        .nexa-final-cta a {
          padding: 0 26px;
          background: #111116;
          color: #ffffff;
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.2);
          animation: nexaButtonBreath 1.95s ease-in-out infinite;
        }

        @keyframes nexaButtonBreath {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.035);
          }
        }

        .nexa-primary-cta:hover,
        .nexa-bottom-cta:hover,
        .nexa-final-cta a:hover {
          animation-play-state: paused;
          transform: translateY(-2px) scale(1.04);
          background: #ff7a00;
          color: #111116;
          box-shadow: 0 20px 44px rgba(255, 122, 0, 0.3);
        }

        .nexa-primary-cta:active,
        .nexa-secondary-cta:active,
        .nexa-bottom-cta:active,
        .nexa-final-cta a:active {
          animation-play-state: paused;
          transform: scale(0.94);
        }

        .nexa-secondary-cta {
          padding: 0 22px;
          background: #ffffff;
          color: #171720;
          border: 1px solid rgba(17, 17, 22, 0.1);
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.06);
          animation: nexaSecondaryPulse 2.25s ease-in-out infinite;
        }

        @keyframes nexaSecondaryPulse {
          0%,
          100% {
            box-shadow: 0 18px 38px rgba(17, 17, 22, 0.06);
          }

          50% {
            box-shadow: 0 18px 38px rgba(255, 122, 0, 0.16);
          }
        }

        .nexa-secondary-cta:hover {
          animation-play-state: paused;
          transform: translateY(-2px) scale(1.03);
          border-color: rgba(255, 122, 0, 0.45);
          color: #ff7a00;
        }

        .nexa-online-note {
          margin-top: 16px;
          color: #787682;
          font-size: 13px;
          font-weight: 600;
        }

        .nexa-online-note a {
          color: #ff7a00;
          font-weight: 900;
          text-decoration: none;
          border-bottom: 2px solid rgba(255, 122, 0, 0.45);
          transition:
            color 180ms ease,
            border-color 180ms ease;
        }

        .nexa-online-note a:hover {
          color: #111116;
          border-color: #111116;
        }

        .nexa-distance-note {
          margin-top: 18px;
          max-width: 650px;
          padding: 18px 18px;
          border-radius: 24px;
          background:
            radial-gradient(circle at 100% 0%, rgba(255, 122, 0, 0.16), transparent 34%),
            #f7f7fb;
          border: 1px solid rgba(17, 17, 22, 0.07);
          box-shadow: 0 18px 42px rgba(17, 17, 22, 0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .nexa-distance-note div {
          min-width: 0;
        }

        .nexa-distance-note strong {
          display: block;
          color: #15141c;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .nexa-distance-note span {
          display: block;
          margin-top: 5px;
          color: #676571;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.45;
        }

        .nexa-distance-note a {
          flex: 0 0 auto;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111116;
          color: #ffffff;
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: -0.01em;
          box-shadow: 0 14px 30px rgba(17, 17, 22, 0.18);
          transition:
            transform 220ms ease,
            background 220ms ease,
            color 220ms ease,
            box-shadow 220ms ease;
        }

        .nexa-distance-note a:hover {
          transform: translateY(-2px) scale(1.04);
          background: #ff7a00;
          color: #111116;
          box-shadow: 0 18px 38px rgba(255, 122, 0, 0.28);
        }

        .nexa-distance-note a:active {
          transform: scale(0.94);
        }

        .nexa-hero-points {
          margin-top: 42px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          max-width: 650px;
        }

        .nexa-hero-points div {
          padding-top: 18px;
          border-top: 1px solid rgba(17, 17, 22, 0.1);
        }

        .nexa-hero-points strong {
          display: block;
          color: #15141c;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -0.045em;
        }

        .nexa-hero-points span {
          display: block;
          margin-top: 5px;
          color: #777685;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
        }

        .nexa-hero-visual {
          position: relative;
          min-height: 860px;
        }

        .nexa-visual-stack {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 860px;
        }

        .nexa-orange-shape {
          position: absolute;
          top: 26px;
          right: 20px;
          width: min(86%, 460px);
          height: 720px;
          border-radius: 42px;
          background:
            radial-gradient(
              circle at 78% 18%,
              rgba(255, 255, 255, 0.52),
              transparent 24%
            ),
            linear-gradient(135deg, #ff6500 0%, #ff8a00 52%, #ffb347 100%);
          box-shadow: 0 34px 84px rgba(255, 122, 0, 0.28);
        }

        .nexa-photo-card {
          position: absolute;
          overflow: hidden;
          border-radius: 30px;
          background: #f1f1f1;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.18),
            0 8px 22px rgba(17, 17, 22, 0.08);
        }

        .nexa-photo-card-top {
          top: 50px;
          left: 0;
          width: min(74%, 430px);
          height: 340px;
        }

        .nexa-photo-card-bottom {
          top: 410px;
          left: 52px;
          width: min(82%, 500px);
          height: 310px;
        }

        .nexa-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .nexa-floating-price {
          position: absolute;
          top: 18px;
          right: 0;
          bottom: auto;
          z-index: 5;
          width: 122px;
          height: 122px;
          border-radius: 999px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #111116;
          color: #ffffff;
          box-shadow:
            0 18px 46px rgba(17, 17, 22, 0.24),
            0 0 0 9px rgba(255, 122, 0, 0.2);
          border: 4px solid #ff7a00;
        }

        .nexa-floating-price span {
          display: block;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.02em;
          color: #ffb347;
          text-transform: none;
        }

        .nexa-floating-price small {
          display: block;
          margin-top: 2px;
          color: #ffb347;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .nexa-floating-price strong {
          display: block;
          color: #ffffff;
          font-size: 33px;
          font-weight: 900;
          letter-spacing: -0.08em;
        }

        .nexa-trust-section {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 34px 18px 48px;
          text-align: center;
          background: #ffffff;
        }

        .nexa-trust-section p {
          margin: 0;
          color: #15141c;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.035em;
        }

        .nexa-trust-logos {
          margin-top: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: clamp(16px, 3vw, 34px);
          color: #aaa8b5;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .nexa-fast-info-section {
          padding: 0 clamp(18px, 4vw, 56px) 78px;
          background: #ffffff;
        }

        .nexa-fast-info-grid {
          max-width: 1110px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(18px, 2.4vw, 34px);
          align-items: start;
          background: #ffffff;
        }

        .nexa-included-item {
          position: relative;
          text-align: center;
          padding: 0 6px;
          background: #ffffff;
          border: 0;
          box-shadow: none;
          min-height: 0;
        }

        .nexa-orange-check {
          position: absolute;
          top: 0;
          right: 18%;
          z-index: 3;
          display: inline-flex;
          color: #ff7a00;
          font-size: 26px;
          line-height: 1;
          font-weight: 900;
          background: transparent;
          border: 0;
          box-shadow: none;
          text-shadow: 0 8px 22px rgba(255, 122, 0, 0.22);
        }

        .nexa-included-image-wrap {
          width: 100%;
          height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff !important;
          border: 0;
          box-shadow: none;
          overflow: visible;
          isolation: isolate;
        }

        .nexa-included-image {
          width: 100%;
          max-width: 160px;
          height: 100%;
          object-fit: contain;
          display: block;
          background: transparent !important;
          mix-blend-mode: multiply;
          filter: brightness(1.08) contrast(1.08);
          transition:
            transform 220ms ease,
            filter 220ms ease;
        }

        .nexa-included-item:hover .nexa-included-image {
          transform: translateY(-4px) scale(1.035);
          filter: brightness(1.1) contrast(1.1);
        }

        .nexa-included-item strong {
          display: block;
          margin-top: 13px;
          color: #15141c;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.12;
        }

        .nexa-included-item p {
          max-width: 170px;
          margin: 8px auto 0;
          color: #6b6974;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.45;
        }

        .nexa-components-section {
          position: relative;
          background: #ffffff;
          overflow: hidden;
        }

        .nexa-components-section.stats {
          background: #fbfbfd;
        }

        .nexa-content-section {
          padding: 92px clamp(18px, 4vw, 56px);
          background: #ffffff;
        }

        .nexa-content-grid {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: clamp(28px, 5vw, 70px);
          align-items: start;
        }

        .nexa-section-label {
          display: inline-flex;
          margin-bottom: 16px;
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .nexa-content-grid h2,
        .nexa-how-inner h2,
        .nexa-seo-text-inner h2,
        .nexa-faq-inner h2 {
          margin: 0;
          color: #15141c;
          font-size: clamp(34px, 4vw, 56px);
          line-height: 1.04;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .nexa-content-grid p,
        .nexa-how-grid p,
        .nexa-seo-text-inner p,
        .nexa-faq-list p,
        .nexa-final-cta p {
          color: #666574;
          font-size: 17px;
          line-height: 1.78;
          letter-spacing: -0.015em;
          font-weight: 500;
        }

        .nexa-info-box {
          padding: 30px;
          border-radius: 34px;
          background:
            radial-gradient(circle at 100% 0%, rgba(255, 122, 0, 0.16), transparent 34%),
            #f7f7fb;
          border: 1px solid rgba(17, 17, 22, 0.06);
          box-shadow: 0 26px 70px rgba(17, 17, 22, 0.08);
        }

        .nexa-info-box h3 {
          margin: 0 0 18px;
          color: #15141c;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.05em;
        }

        .nexa-info-box ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 13px;
        }

        .nexa-info-box li {
          position: relative;
          padding-left: 24px;
          color: #53525e;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.45;
        }

        .nexa-info-box li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ff7a00;
          box-shadow: 0 0 0 4px rgba(255, 122, 0, 0.14);
        }

        .nexa-how-section {
          padding: 96px clamp(18px, 4vw, 56px);
          background:
            radial-gradient(circle at 15% 0%, rgba(255, 122, 0, 0.13), transparent 34%),
            #fbfbfd;
        }

        .nexa-how-inner {
          max-width: 1160px;
          margin: 0 auto;
          text-align: center;
        }

        .nexa-how-grid {
          margin-top: 36px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          text-align: left;
        }

        .nexa-how-grid div {
          padding: 28px;
          border-radius: 32px;
          background: #ffffff;
          border: 1px solid rgba(17, 17, 22, 0.07);
          box-shadow: 0 22px 60px rgba(17, 17, 22, 0.06);
        }

        .nexa-how-grid span {
          display: inline-flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #111116;
          color: #ff7a00;
          font-size: 13px;
          font-weight: 900;
        }

        .nexa-how-grid h3 {
          margin: 20px 0 0;
          color: #15141c;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -0.055em;
        }

        .nexa-how-grid p {
          margin-bottom: 0;
          font-size: 15.5px;
        }

        .nexa-bottom-cta {
          margin-top: 34px;
        }

        .nexa-seo-text-section {
          padding: 96px clamp(18px, 4vw, 56px);
          background: #ffffff;
        }

        .nexa-seo-text-inner {
          max-width: 940px;
          margin: 0 auto;
          text-align: center;
        }

        .nexa-keyword-cloud {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .nexa-keyword-cloud span {
          display: inline-flex;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f4f4f8;
          color: #4d4b55;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(17, 17, 22, 0.06);
        }

        .nexa-location-section {
          background: #fbfbfd;
          overflow: hidden;
        }

        .nexa-faq-section {
          padding: 92px clamp(18px, 4vw, 56px) 110px;
          background: #ffffff;
        }

        .nexa-faq-inner {
          max-width: 920px;
          margin: 0 auto;
        }

        .nexa-faq-list {
          margin-top: 34px;
          display: grid;
          gap: 14px;
        }

        .nexa-faq-list details {
          border-radius: 24px;
          background: #f7f7fb;
          border: 1px solid rgba(17, 17, 22, 0.06);
          padding: 20px 22px;
        }

        .nexa-faq-list summary {
          cursor: pointer;
          color: #15141c;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .nexa-faq-list p {
          margin-bottom: 0;
        }

        .nexa-final-cta {
          margin-top: 34px;
          padding: 32px;
          border-radius: 34px;
          background:
            radial-gradient(circle at 90% 0%, rgba(255, 179, 71, 0.28), transparent 38%),
            linear-gradient(135deg, #111116 0%, #242128 100%);
          color: #ffffff;
          text-align: center;
          box-shadow: 0 28px 80px rgba(17, 17, 22, 0.18);
        }

        .nexa-final-cta h3 {
          margin: 0;
          color: #ffffff;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.06em;
        }

        .nexa-final-cta p {
          margin: 10px auto 22px;
          max-width: 560px;
          color: rgba(255, 255, 255, 0.72);
        }

        .nexa-final-cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .nexa-final-cta a {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-final-cta a:hover {
          background: #ffffff;
          color: #111116;
        }

        .nexa-final-cta-actions a:nth-child(2) {
          background: #ffffff;
          color: #111116;
        }

        .nexa-final-cta-actions a:nth-child(2):hover {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-seo-footer {
          background: #000000;
          color: #ffffff;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nexa-seo-footer-inner {
          max-width: 1480px;
          min-height: 118px;
          margin: 0 auto;
          padding: 24px clamp(18px, 4vw, 56px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .nexa-seo-footer-brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .nexa-seo-footer-logo {
          width: auto;
          height: 42px;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.55));
        }

        .nexa-seo-footer-brand p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .nexa-seo-footer-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nexa-seo-footer-actions a {
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-size: 11px;
          font-weight: 800;
          transition:
            color 180ms ease,
            transform 180ms ease;
        }

        .nexa-seo-footer-actions a:hover {
          color: #ff7a00;
          transform: translateY(-1px);
        }

        @media (max-width: 1120px) {
          .nexa-fast-info-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            row-gap: 42px;
          }
        }

        @media (max-width: 1020px) {
          .nexa-hero-grid {
            grid-template-columns: 1fr;
          }

          .nexa-hero-copy {
            text-align: center;
          }

          .nexa-hero-copy h1,
          .nexa-hero-text,
          .nexa-hero-points,
          .nexa-distance-note {
            margin-left: auto;
            margin-right: auto;
          }

          .nexa-hero-actions {
            justify-content: center;
          }

          .nexa-hero-visual {
            min-height: 820px;
            max-width: 620px;
            width: 100%;
            margin: 0 auto;
          }

          .nexa-visual-stack {
            min-height: 820px;
          }

          .nexa-orange-shape {
            right: 24px;
          }

          .nexa-content-grid {
            grid-template-columns: 1fr;
          }

          .nexa-how-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .nexa-seo-page {
            padding-top: 64px;
          }

          .nexa-seo-nav-inner {
            height: 64px;
            padding: 0 14px;
          }

          .nexa-seo-logo {
            height: 42px;
          }

          .nexa-seo-book-button {
            min-width: 136px;
            height: 40px;
            font-size: 10px;
            letter-spacing: 0.12em;
          }

          .nexa-scroll-arrows {
            font-size: 24px;
            gap: 4px;
          }

          .nexa-scroll-arrows-left {
            right: calc(50% + 88px);
          }

          .nexa-scroll-arrows-right {
            left: calc(50% + 88px);
          }

          .nexa-seo-contact-button {
            display: none;
          }

          .nexa-seo-language-current {
            min-width: 76px;
            height: 38px;
            padding: 0 10px;
            font-size: 10px;
          }

          .nexa-seo-language-menu {
            right: 0;
            width: 228px;
          }

          .nexa-seo-footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .nexa-seo-footer-brand {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        @media (max-width: 680px) {
          .nexa-hero-section {
            padding-top: 42px;
          }

          .nexa-hero-copy h1 {
            font-size: 42px;
            letter-spacing: -0.06em;
          }

          .nexa-hero-text {
            font-size: 15.5px;
            line-height: 1.65;
          }

          .nexa-hero-points {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-top: 34px;
          }

          .nexa-hero-points div {
            padding: 16px;
            border: 1px solid rgba(17, 17, 22, 0.08);
            border-radius: 22px;
            background: #ffffff;
          }

          .nexa-fast-info-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            row-gap: 38px;
          }

          .nexa-hero-visual {
            min-height: 690px;
          }

          .nexa-visual-stack {
            min-height: 690px;
          }

          .nexa-orange-shape {
            width: 80%;
            height: 560px;
            top: 18px;
            right: 0;
            border-radius: 28px;
          }

          .nexa-photo-card-top {
            width: 74%;
            height: 240px;
            top: 54px;
            border-radius: 22px;
          }

          .nexa-photo-card-bottom {
            width: 80%;
            height: 230px;
            top: 334px;
            left: 28px;
            border-radius: 22px;
          }

          .nexa-floating-price {
            top: 14px;
            right: 18px;
            bottom: auto;
            width: 88px;
            height: 88px;
          }

          .nexa-floating-price strong {
            font-size: 26px;
          }

          .nexa-content-section,
          .nexa-how-section,
          .nexa-seo-text-section,
          .nexa-faq-section {
            padding-top: 68px;
            padding-bottom: 68px;
          }

          .nexa-content-grid h2,
          .nexa-how-inner h2,
          .nexa-seo-text-inner h2,
          .nexa-faq-inner h2 {
            font-size: 36px;
            letter-spacing: -0.058em;
          }
        }

        @media (max-width: 520px) {
          .nexa-seo-logo {
            height: 34px;
          }

          .nexa-seo-book-button {
            min-width: 118px;
            height: 38px;
            font-size: 9px;
            letter-spacing: 0.1em;
          }

          .nexa-scroll-arrows {
            display: none;
          }

          .nexa-seo-language-current {
            min-width: 64px;
            gap: 5px;
          }

          .nexa-seo-language-current span:nth-child(2) {
            display: none;
          }

          .nexa-hero-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .nexa-primary-cta,
          .nexa-secondary-cta {
            width: 100%;
          }

          .nexa-distance-note {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .nexa-distance-note a {
            width: 100%;
          }

          .nexa-final-cta-actions {
            flex-direction: column;
          }

          .nexa-final-cta-actions a {
            width: 100%;
          }

          .nexa-fast-info-grid {
            grid-template-columns: 1fr;
          }

          .nexa-hero-visual {
            min-height: 620px;
          }

          .nexa-visual-stack {
            min-height: 620px;
          }

          .nexa-orange-shape {
            width: 84%;
            height: 500px;
          }

          .nexa-photo-card-top {
            width: 76%;
            height: 210px;
          }

          .nexa-photo-card-bottom {
            width: 84%;
            height: 210px;
            top: 306px;
            left: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-seo-book-button,
          .nexa-primary-cta,
          .nexa-secondary-cta,
          .nexa-bottom-cta,
          .nexa-final-cta a,
          .nexa-seo-contact-button,
          .nexa-scroll-arrows span,
          .nexa-hide-on-scroll,
          .nexa-scroll-arrows {
            animation: none !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}