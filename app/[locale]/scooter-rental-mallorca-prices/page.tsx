// app/[locale]/scooter-rental-mallorca-prices/page.tsx

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
  variable: "--font-nexa-seo",
  display: "swap",
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
    text: "Practical storage for a bag, helmet or beach essentials.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Waterproof phone holder",
    text: "Ideal for navigation around Mallorca.",
  },
  {
    image: "/images/ex3.png",
    title: "Security lock",
    text: "For secure stops at your hotel, the beach or a restaurant.",
  },
  {
    image: "/images/ex5.png",
    title: "Insurance",
    text: "Basic insurance is included in the price.",
  },
];

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/1HJFHyvzDNcrgrc99";

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
    return "/en/scooter-rental-mallorca-prices";
  }

  if (languageCode === "it") {
    return "/it/prezzi-noleggio-scooter-maiorca";
  }

  if (languageCode === "de") {
    return "/de/roller-mieten-mallorca-preise";
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
      "Scooter Rental Mallorca Prices | from €39 All Included | NEXA Rentals",
    description:
      "Scooter rental prices in Mallorca: 125cc scooters from €39 for a half day and €49 for 24 hours. Book online with NEXA Rentals and collect in Magaluf. Two helmets, top box, security lock, phone holder and unlimited kilometres included.",
    keywords: [
      "scooter rental Mallorca prices",
      "scooter hire Mallorca prices",
      "Mallorca scooter rental prices",
      "Mallorca scooter hire prices",
      "scooter rental Mallorca from 39 euro",
      "scooter rental Mallorca 39€",
      "scooter rental Mallorca 49€",
      "125cc scooter Mallorca prices",
      "125cc scooter hire Mallorca",
      "motor scooter rental Mallorca prices",
      "cheap scooter rental Mallorca",
      "affordable scooter hire Mallorca",
      "scooter rental Magaluf prices",
      "scooter hire Magaluf prices",
      "Mallorca scooter rental rates",
      "scooter rental Mallorca deposit",
      "Mallorca scooter deposit",
      "all inclusive scooter rental Mallorca",
      "scooter rental Mallorca no hidden costs",
      "NEXA Rentals prices",
      "NEXA Rentals Magaluf",
    ],
    alternates: {
      canonical:
        "https://www.nexarentals.es/en/scooter-rental-mallorca-prices",
    },
    openGraph: {
      title: "Scooter Rental Mallorca Prices | NEXA Rentals",
      description:
        "125cc scooters from €39 for a half day and €49 for 24 hours. Two helmets, top box, security lock, phone holder and unlimited kilometres included.",
      url: "https://www.nexarentals.es/en/scooter-rental-mallorca-prices",
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "Scooter rental prices in Mallorca with NEXA Rentals",
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

export default async function ScooterRentalMallorcaPricesPage({
  params,
}: PageProps) {
  const locale = await getPageLocale(params);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];

  const homeHref = `/${locale}`;
  const bookHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does it cost to rent a scooter in Mallorca with NEXA Rentals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "With NEXA Rentals, a 125cc scooter starts from €39 for a half day. A 24-hour rental costs €49. Reduced daily rates are also available for multi-day rentals.",
        },
      },
      {
        "@type": "Question",
        name: "What is included in the scooter rental price?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The price includes two helmets, a 50-litre top box, security lock, waterproof phone holder, unlimited kilometres and basic insurance.",
        },
      },
      {
        "@type": "Question",
        name: "Is a deposit required to rent a scooter in Mallorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. With NEXA Rentals, the deposit is €150 per scooter. The deposit is returned after the scooter has been returned correctly.",
        },
      },
      {
        "@type": "Question",
        name: "Are there any hidden costs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The main extras, including two helmets, top box, security lock, waterproof phone holder, unlimited kilometres and basic insurance, are included. The €150 deposit is separate and is returned after the scooter has been returned correctly.",
        },
      },
      {
        "@type": "Question",
        name: "Where do I collect the scooter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Collection and return take place directly at NEXA Rentals, C. Galeón, 13, Loc 57, 07181 Magaluf. We do not currently provide a scooter delivery service.",
        },
      },
      {
        "@type": "Question",
        name: "Which driving licence do I need for a 125cc scooter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A, A1 and A2 motorcycle licences are accepted. You may also ride a 125cc scooter with a category B car licence if it has been valid for at least 3 years.",
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
      "Mallorca",
      "Magaluf",
      "Palmanova",
      "Santa Ponsa",
      "Palma",
      "Calvià",
      "Paguera",
      "Camp de Mar",
      "Portals Nous",
      "Cala Vinyes",
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
    makesOffer: [
      {
        "@type": "Offer",
        name: "125cc scooter rental for a half day",
        price: "39",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        areaServed: "Mallorca",
      },
      {
        "@type": "Offer",
        name: "125cc scooter rental for 24 hours",
        price: "49",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        areaServed: "Mallorca",
      },
    ],
  };

  return (
    <main className={`${pageFont.variable} nexa-seo-page`}>
      <Script
        id="nexa-seo-navbar-scroll-prices"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              function updateNavbar() {
                var navbar = document.querySelector(".nexa-seo-navbar");
                var scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 18;
                if (navbar) navbar.setAttribute("data-scrolled", scrolled ? "true" : "false");
                document.documentElement.classList.toggle("nexa-seo-page-scrolled", scrolled);
              }
              updateNavbar();
              window.addEventListener("scroll", updateNavbar, { passive: true });
              window.addEventListener("resize", updateNavbar);
              setTimeout(updateNavbar, 80);
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
            <div className="nexa-hero-topline">
              <span className="nexa-hero-kicker">
                125cc scooters from €39 · all included
              </span>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="nexa-top-map-button"
              >
                Get directions
              </a>
            </div>

            <h1>
              Scooter rental in Mallorca: clear, simple and affordable prices.
            </h1>

            <p className="nexa-hero-text">
              Looking for{" "}
              <strong>scooter rental prices in Mallorca</strong>,{" "}
              <strong>affordable scooter hire in Mallorca</strong> or a{" "}
              <strong>125cc scooter from €39</strong>? With NEXA Rentals, you
              get transparent rates, simple online booking and collection
              directly from our office in Magaluf.
            </p>

            <p className="nexa-hero-text small">
              Half-day rental starts from €39 and 24 hours costs €49. The price
              includes two helmets, a 50-litre top box, security lock,
              waterproof phone holder, unlimited kilometres and basic
              insurance. The deposit is €150 per scooter and is returned after
              the scooter has been returned correctly.
            </p>

            <div className="nexa-hero-actions">
              <Link href={bookHref} className="nexa-primary-cta">
                Check prices and book
              </Link>

              <Link href={contactHref} className="nexa-secondary-cta">
                Questions? Contact us
              </Link>
            </div>

            <div className="nexa-online-note">
              Book online at{" "}
              <Link href={bookHref}>www.nexarentals.es/en/home</Link>
            </div>

            <div className="nexa-hero-points">
              <div>
                <strong>€39</strong>
                <span>Half day until 20:00</span>
              </div>

              <div>
                <strong>€49</strong>
                <span>Scooter rental for 24 hours</span>
              </div>

              <div>
                <strong>€150</strong>
                <span>Deposit per scooter</span>
              </div>
            </div>
          </div>

          <div className="nexa-hero-visual">
            <div className="nexa-visual-stack">
              <div className="nexa-orange-shape" />

              <div className="nexa-photo-card nexa-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Scooter rental prices in Mallorca with NEXA Rentals"
                  width={900}
                  height={620}
                  priority
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-photo-card nexa-photo-card-bottom">
                <Image
                  src="/images/scooterperson2.jpg"
                  alt="125cc scooter rental in Mallorca from 39 euros"
                  width={900}
                  height={720}
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-floating-price">
                <span>from</span>
                <strong>€39</strong>
                <small>all included</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-trust-section">
        <p>Transparent scooter rental prices in Mallorca and Magaluf</p>

        <div className="nexa-trust-logos">
          <span>from €39</span>
          <span>24 hours €49</span>
          <span>all included</span>
          <span>125cc scooters</span>
          <span>€150 deposit</span>
        </div>
      </section>

      <section className="nexa-price-section">
        <div className="nexa-price-inner">
          <span className="nexa-section-label">Prices</span>

          <h2>Clear rates without complicated conditions.</h2>

          <div className="nexa-price-grid">
            <div className="nexa-price-card">
              <span className="nexa-price-badge">Half day</span>
              <h3>Same Day</h3>
              <p className="nexa-price-time">
                Morning collection · return by 20:00
              </p>
              <div className="nexa-price-number">
                <span>from</span>
                <strong>€39</strong>
              </div>
              <ul>
                <li>125cc scooter</li>
                <li>Two helmets included</li>
                <li>Top box included</li>
                <li>Security lock included</li>
                <li>Phone holder included</li>
                <li>Unlimited kilometres</li>
              </ul>
              <Link href={bookHref}>Book a half day</Link>
            </div>

            <div className="nexa-price-card featured">
              <span className="nexa-price-badge">Most popular</span>
              <h3>24 hours</h3>
              <p className="nexa-price-time">
                Perfect for day trips and flexible plans
              </p>
              <div className="nexa-price-number">
                <span>only</span>
                <strong>€49</strong>
              </div>
              <ul>
                <li>125cc scooter for 24 hours</li>
                <li>Two helmets included</li>
                <li>Top box included</li>
                <li>Security lock included</li>
                <li>Phone holder included</li>
                <li>Unlimited kilometres</li>
              </ul>
              <Link href={bookHref}>Book 24 hours</Link>
            </div>

            <div className="nexa-price-card">
              <span className="nexa-price-badge">Multi-day</span>
              <h3>Multi-Day</h3>
              <p className="nexa-price-time">
                Ideal for longer stays in Mallorca
              </p>
              <div className="nexa-price-number">
                <span>from</span>
                <strong>€43</strong>
              </div>
              <ul>
                <li>2 days: €47 per day</li>
                <li>3 days: €46 per day</li>
                <li>4 days: €45 per day</li>
                <li>5 days: €44 per day</li>
                <li>6 days: €43 per day</li>
                <li>Everything included</li>
              </ul>
              <Link href={bookHref}>Book multiple days</Link>
            </div>
          </div>

          <div className="nexa-deposit-box">
            <div>
              <strong>€150 deposit per scooter</strong>
              <p>
                The deposit is returned after the scooter has been returned
                correctly. Bring your original driving licence and a passport
                or identity card.
              </p>
            </div>
            <Link href={bookHref}>Check availability</Link>
          </div>
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
              Scooter prices in Mallorca
            </span>

            <h2>
              Why NEXA Rentals prices are simple to understand.
            </h2>

            <p>
              Many travellers search for scooter rental prices in Mallorca,
              affordable scooter hire in Mallorca or 125cc scooters from €39.
              With NEXA Rentals, the choice is simple: check the price online,
              book directly and collect your scooter from our office in
              Magaluf.
            </p>

            <p>
              The main extras are already included in the rental price. You
              receive two helmets, a 50-litre top box, security lock,
              waterproof phone holder, unlimited kilometres and basic
              insurance. The €150 deposit per scooter is separate and is
              returned after the scooter has been returned correctly.
            </p>
          </article>

          <aside className="nexa-info-box">
            <h3>Included in the price</h3>

            <ul>
              <li>125cc scooter for exploring Mallorca</li>
              <li>Two helmets included</li>
              <li>50-litre top box for a bag, helmet or accessories</li>
              <li>Waterproof phone holder</li>
              <li>Security lock included</li>
              <li>Unlimited kilometres</li>
              <li>Basic insurance included</li>
              <li>Online booking and secure online payment</li>
              <li>Collection and return at NEXA Rentals in Magaluf</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="nexa-how-section">
        <div className="nexa-how-inner">
          <span className="nexa-section-label">How it works</span>

          <h2>Check the price, book online and collect in Magaluf.</h2>

          <div className="nexa-how-grid">
            <div>
              <span>01</span>
              <h3>Choose your date</h3>
              <p>
                Select the date, rental duration and scooter. You will
                immediately see the option that best suits your plans.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Pay online</h3>
              <p>
                Pay the rental price online and reserve your 125cc scooter for
                your stay in Mallorca.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Collect in Magaluf</h3>
              <p>
                Visit NEXA Rentals with your original driving licence and
                passport or identity card. After the handover and explanation,
                you can begin your journey.
              </p>
            </div>
          </div>

          <Link href={bookHref} className="nexa-bottom-cta">
            Check prices now
          </Link>
        </div>
      </section>

      <section className="nexa-seo-text-section">
        <div className="nexa-seo-text-inner">
          <span className="nexa-section-label">
            Scooter rental rates in Mallorca
          </span>

          <h2>
            For travellers looking for affordable prices and useful extras
            included in the rental.
          </h2>

          <p>
            When you search for “scooter rental Mallorca prices”, “cheap
            scooter rental Mallorca”, “Mallorca scooter hire prices” or “125cc
            scooter prices Mallorca”, you want to know exactly how much you
            will pay and what is included.
          </p>

          <p>
            With NEXA Rentals, you get 125cc scooters with clear rates and
            important extras already included. We do not currently provide a
            scooter delivery service. Collection and return take place directly
            at NEXA Rentals in Magaluf, so the vehicle handover, document
            checks and return are handled simply and securely.
          </p>

          <div className="nexa-keyword-cloud">
            <span>Scooter rental Mallorca prices</span>
            <span>Cheap scooter rental Mallorca</span>
            <span>125cc scooter from €39</span>
            <span>Mallorca scooter rental €49</span>
            <span>Scooter rental Mallorca deposit</span>
            <span>All inclusive scooter rental Mallorca</span>
            <span>Scooter prices Magaluf</span>
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

          <h2>Questions about scooter rental prices in Mallorca</h2>

          <div className="nexa-faq-list">
            <details>
              <summary>
                How much does it cost to rent a scooter with NEXA Rentals?
              </summary>
              <p>
                A half-day rental starts from €39. A 24-hour rental costs €49.
                Reduced daily rates are available for multi-day rentals.
              </p>
            </details>

            <details>
              <summary>What is included in the price?</summary>
              <p>
                Two helmets, a 50-litre top box, security lock, waterproof
                phone holder, unlimited kilometres and basic insurance are
                included.
              </p>
            </details>

            <details>
              <summary>How much is the deposit?</summary>
              <p>
                The deposit is €150 per scooter. It is returned after the
                vehicle has been returned correctly.
              </p>
            </details>

            <details>
              <summary>Are there any hidden costs?</summary>
              <p>
                The main extras are included in the rental price. The deposit
                is separate and is returned when the scooter is returned
                correctly.
              </p>
            </details>

            <details>
              <summary>Where does collection take place?</summary>
              <p>
                Collection and return take place directly at NEXA Rentals,
                C. Galeón, 13, Loc 57, 07181 Magaluf. We do not currently
                provide a scooter delivery service.
              </p>
            </details>

            <details>
              <summary>Which driving licence do I need?</summary>
              <p>
                A, A1 and A2 motorcycle licences are accepted. You may also
                ride a 125cc scooter with a category B car licence if it has
                been valid for at least 3 years.
              </p>
            </details>
          </div>

          <div className="nexa-final-cta">
            <h3>Found the right price?</h3>
            <p>
              Book your 125cc scooter online and collect it directly from NEXA
              Rentals in Magaluf.
            </p>
            <Link href={bookHref}>Book your scooter now</Link>
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
          font-family: var(--font-nexa-seo), Poppins, Arial, Helvetica, sans-serif;
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
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition: opacity 260ms ease, visibility 260ms ease, transform 260ms ease;
        }

        .nexa-seo-navbar[data-scrolled="true"] .nexa-hide-on-scroll,
        html.nexa-seo-page-scrolled .nexa-seo-navbar .nexa-hide-on-scroll {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-12px) scale(0.98);
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
          border-radius: 999px;
          background: #ffffff;
          color: #000000;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 14px 34px rgba(255, 255, 255, 0.14), 0 20px 50px rgba(0, 0, 0, 0.38);
          animation: nexaSeoHeartbeat 1.75s ease-in-out infinite;
          z-index: 4;
        }

        .nexa-seo-book-button:hover {
          animation-play-state: paused;
          background: #ff7a00;
          color: #000000;
        }

        .nexa-seo-book-button:active {
          transform: translate(-50%, -50%) scale(0.91);
        }

        @keyframes nexaSeoHeartbeat {
          0% { transform: translate(-50%, -50%) scale(1); }
          12% { transform: translate(-50%, -50%) scale(1.075); }
          24% { transform: translate(-50%, -50%) scale(1); }
          36% { transform: translate(-50%, -50%) scale(1.045); }
          48% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        .nexa-scroll-arrows {
          position: absolute;
          top: 50%;
          z-index: 3;
          display: flex;
          gap: 8px;
          color: #ff7a00;
          font-size: 31px;
          font-weight: 900;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          filter: drop-shadow(0 0 12px rgba(255, 122, 0, 0.44));
          transition: opacity 260ms ease, visibility 260ms ease, transform 260ms ease;
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
          transform: translateY(-50%) translateX(0);
        }

        .nexa-seo-nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          z-index: 5;
        }

        .nexa-seo-contact-button,
        .nexa-seo-language-current {
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-size: 11px;
          font-weight: 900;
        }

        .nexa-seo-contact-button {
          padding: 0 18px;
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
          min-width: 92px;
          padding: 0 13px;
          gap: 8px;
          cursor: pointer;
        }

        .nexa-seo-flag {
          border-radius: 999px;
          object-fit: cover;
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
          background: rgba(0, 0, 0, 0.94);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.68);
        }

        .nexa-seo-language-option {
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
        }

        .nexa-seo-language-option:hover,
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
          color: #ff7a00;
          font-size: 10px;
          font-weight: 900;
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

        .nexa-hero-topline {
          display: inline-flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 8px;
          margin-bottom: 22px;
          max-width: 100%;
        }

        .nexa-hero-kicker {
          display: inline-flex;
          align-items: center;
          min-height: 40px;
          padding: 9px 13px;
          border-radius: 999px;
          background: rgba(255, 122, 0, 0.1);
          color: #ff7a00;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .nexa-hero-kicker::before {
          content: "📍";
          margin-right: 7px;
          font-size: 12px;
        }

        .nexa-top-map-button {
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 11px;
          border-radius: 999px;
          background: #111116;
          color: #ffffff;
          text-decoration: none;
          font-size: 9.5px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          white-space: nowrap;
          box-shadow: 0 12px 26px rgba(17, 17, 22, 0.12);
        }

        .nexa-top-map-button:hover {
          background: #ff7a00;
          color: #111116;
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
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }

        .nexa-primary-cta,
        .nexa-secondary-cta,
        .nexa-bottom-cta,
        .nexa-final-cta a,
        .nexa-price-card a,
        .nexa-deposit-box a {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        .nexa-primary-cta,
        .nexa-bottom-cta,
        .nexa-final-cta a,
        .nexa-price-card a,
        .nexa-deposit-box a {
          padding: 0 26px;
          background: #111116;
          color: #ffffff;
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.2);
        }

        .nexa-primary-cta:hover,
        .nexa-bottom-cta:hover,
        .nexa-final-cta a:hover,
        .nexa-price-card a:hover,
        .nexa-deposit-box a:hover {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-secondary-cta {
          padding: 0 22px;
          background: #ffffff;
          color: #171720;
          border: 1px solid rgba(17, 17, 22, 0.1);
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.06);
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
        }

        .nexa-hero-points span {
          display: block;
          margin-top: 5px;
          color: #777685;
          font-size: 13px;
          font-weight: 600;
        }

        .nexa-hero-visual {
          position: relative;
          min-height: 860px;
        }

        .nexa-visual-stack {
          position: relative;
          width: 100%;
          min-height: 860px;
        }

        .nexa-orange-shape {
          position: absolute;
          top: 26px;
          right: 20px;
          width: min(86%, 460px);
          height: 720px;
          border-radius: 42px;
          background: linear-gradient(135deg, #ff6500 0%, #ff8a00 52%, #ffb347 100%);
          box-shadow: 0 34px 84px rgba(255, 122, 0, 0.28);
        }

        .nexa-photo-card {
          position: absolute;
          overflow: hidden;
          border-radius: 30px;
          background: #f1f1f1;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.18);
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
          box-shadow: 0 0 0 9px rgba(255, 122, 0, 0.2);
          border: 4px solid #ff7a00;
        }

        .nexa-floating-price span,
        .nexa-floating-price small {
          color: #ffb347;
          font-size: 11px;
          font-weight: 900;
        }

        .nexa-floating-price strong {
          color: #ffffff;
          font-size: 33px;
          font-weight: 900;
        }

        .nexa-trust-section {
          padding: 34px 18px 48px;
          text-align: center;
          background: #ffffff;
        }

        .nexa-trust-section p {
          margin: 0;
          color: #15141c;
          font-size: 18px;
          font-weight: 800;
        }

        .nexa-trust-logos {
          margin-top: 26px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: clamp(16px, 3vw, 34px);
          color: #aaa8b5;
          font-size: 14px;
          font-weight: 900;
        }

        .nexa-price-section {
          padding: 92px clamp(18px, 4vw, 56px);
          background: #fbfbfd;
        }

        .nexa-price-inner {
          max-width: 1160px;
          margin: 0 auto;
          text-align: center;
        }

        .nexa-price-inner h2 {
          max-width: 760px;
          margin: 0 auto;
          color: #15141c;
          font-size: clamp(34px, 4vw, 56px);
          line-height: 1.04;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .nexa-price-grid {
          margin-top: 38px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          text-align: left;
        }

        .nexa-price-card {
          position: relative;
          padding: 30px;
          border-radius: 34px;
          background: #ffffff;
          border: 1px solid rgba(17, 17, 22, 0.07);
          box-shadow: 0 24px 70px rgba(17, 17, 22, 0.08);
          overflow: hidden;
        }

        .nexa-price-card.featured {
          background: #111116;
          color: #ffffff;
          transform: translateY(-12px);
          box-shadow: 0 34px 90px rgba(17, 17, 22, 0.22);
        }

        .nexa-price-badge {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 122, 0, 0.12);
          color: #ff7a00;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .nexa-price-card.featured .nexa-price-badge {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-price-card h3 {
          margin: 22px 0 0;
          color: #15141c;
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .nexa-price-card.featured h3 {
          color: #ffffff;
        }

        .nexa-price-time {
          min-height: 52px;
          margin: 8px 0 0;
          color: #6c6a76;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 700;
        }

        .nexa-price-card.featured .nexa-price-time {
          color: rgba(255, 255, 255, 0.66);
        }

        .nexa-price-number {
          margin-top: 24px;
          display: flex;
          align-items: end;
          gap: 8px;
        }

        .nexa-price-number span {
          padding-bottom: 9px;
          color: #8a8894;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .nexa-price-number strong {
          color: #111116;
          font-size: 58px;
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -0.07em;
        }

        .nexa-price-card.featured .nexa-price-number span {
          color: #ffb347;
        }

        .nexa-price-card.featured .nexa-price-number strong {
          color: #ffffff;
        }

        .nexa-price-card ul {
          margin: 26px 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 12px;
        }

        .nexa-price-card li {
          position: relative;
          padding-left: 24px;
          color: #56545f;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.45;
        }

        .nexa-price-card.featured li {
          color: rgba(255, 255, 255, 0.76);
        }

        .nexa-price-card li::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: #ff7a00;
          font-weight: 900;
        }

        .nexa-price-card a {
          width: 100%;
          margin-top: 26px;
        }

        .nexa-price-card.featured a {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-deposit-box {
          margin-top: 22px;
          padding: 28px;
          border-radius: 32px;
          background: #ffffff;
          border: 1px solid rgba(17, 17, 22, 0.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          text-align: left;
          box-shadow: 0 22px 60px rgba(17, 17, 22, 0.06);
        }

        .nexa-deposit-box strong {
          color: #15141c;
          font-size: 24px;
          font-weight: 900;
        }

        .nexa-deposit-box p {
          max-width: 680px;
          margin: 8px 0 0;
          color: #686673;
          font-size: 15px;
          line-height: 1.65;
          font-weight: 600;
        }

        .nexa-deposit-box a {
          flex-shrink: 0;
        }

        .nexa-fast-info-section {
          padding: 78px clamp(18px, 4vw, 56px);
          background: #ffffff;
        }

        .nexa-fast-info-grid {
          max-width: 1110px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(18px, 2.4vw, 34px);
        }

        .nexa-included-item {
          position: relative;
          text-align: center;
          padding: 0 6px;
        }

        .nexa-orange-check {
          position: absolute;
          top: 0;
          right: 18%;
          z-index: 3;
          color: #ff7a00;
          font-size: 26px;
          font-weight: 900;
        }

        .nexa-included-image-wrap {
          height: 118px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nexa-included-image {
          width: 100%;
          max-width: 160px;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .nexa-included-item strong {
          display: block;
          margin-top: 13px;
          color: #15141c;
          font-size: 18px;
          font-weight: 900;
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
          background: #ffffff;
          overflow: hidden;
        }

        .nexa-components-section.stats,
        .nexa-how-section,
        .nexa-location-section {
          background: #fbfbfd;
        }

        .nexa-content-section,
        .nexa-how-section,
        .nexa-seo-text-section,
        .nexa-faq-section {
          padding: 92px clamp(18px, 4vw, 56px);
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
          font-weight: 500;
        }

        .nexa-info-box {
          padding: 30px;
          border-radius: 34px;
          background: #f7f7fb;
          border: 1px solid rgba(17, 17, 22, 0.06);
          box-shadow: 0 26px 70px rgba(17, 17, 22, 0.08);
        }

        .nexa-info-box h3 {
          margin: 0 0 18px;
          color: #15141c;
          font-size: 24px;
          font-weight: 900;
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
        }

        .nexa-how-inner,
        .nexa-seo-text-inner,
        .nexa-faq-inner {
          max-width: 1160px;
          margin: 0 auto;
          text-align: center;
        }

        .nexa-seo-text-inner,
        .nexa-faq-inner {
          max-width: 940px;
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
        }

        .nexa-bottom-cta {
          margin-top: 34px;
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
        }

        .nexa-faq-list {
          margin-top: 34px;
          display: grid;
          gap: 14px;
          text-align: left;
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
        }

        .nexa-final-cta {
          margin-top: 34px;
          padding: 32px;
          border-radius: 34px;
          background: linear-gradient(135deg, #111116 0%, #242128 100%);
          color: #ffffff;
          text-align: center;
        }

        .nexa-final-cta h3 {
          margin: 0;
          color: #ffffff;
          font-size: 34px;
          font-weight: 900;
        }

        .nexa-final-cta p {
          max-width: 560px;
          margin: 10px auto 22px;
          color: rgba(255, 255, 255, 0.72);
        }

        .nexa-final-cta a {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-seo-footer {
          background: #000000;
          color: #ffffff;
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
        }

        .nexa-seo-footer-brand p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 13px;
          font-weight: 600;
        }

        .nexa-seo-footer-actions {
          display: flex;
          gap: 14px;
        }

        .nexa-seo-footer-actions a {
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.13em;
          font-size: 11px;
          font-weight: 800;
        }

        .nexa-seo-footer-actions a:hover {
          color: #ff7a00;
        }

        @media (max-width: 1120px) {
          .nexa-fast-info-grid,
          .nexa-price-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            row-gap: 42px;
          }
        }

        @media (max-width: 1020px) {
          .nexa-hero-grid,
          .nexa-content-grid,
          .nexa-how-grid,
          .nexa-price-grid {
            grid-template-columns: 1fr;
          }

          .nexa-price-card.featured {
            transform: none;
          }

          .nexa-deposit-box {
            flex-direction: column;
            align-items: flex-start;
          }

          .nexa-hero-copy,
          .nexa-how-inner,
          .nexa-seo-text-inner {
            text-align: center;
          }

          .nexa-hero-topline,
          .nexa-hero-actions {
            justify-content: center;
          }

          .nexa-hero-copy h1,
          .nexa-hero-text,
          .nexa-hero-points {
            margin-left: auto;
            margin-right: auto;
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
            display: none;
          }

          .nexa-seo-contact-button {
            display: none;
          }

          .nexa-seo-language-current {
            min-width: 76px;
            height: 38px;
          }

          .nexa-seo-language-menu {
            width: 228px;
          }
        }

        @media (max-width: 680px) {
          .nexa-hero-section {
            padding: 42px 16px 42px;
          }

          .nexa-hero-copy h1 {
            font-size: 42px;
          }

          .nexa-hero-topline {
            justify-content: center;
            flex-wrap: wrap;
          }

          .nexa-hero-points {
            grid-template-columns: 1fr;
          }

          .nexa-fast-info-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
          }

          .nexa-photo-card-bottom {
            width: 80%;
            height: 230px;
            top: 334px;
            left: 28px;
          }

          .nexa-floating-price {
            width: 88px;
            height: 88px;
            top: 14px;
            right: 18px;
          }

          .nexa-floating-price strong {
            font-size: 26px;
          }

          .nexa-content-section,
          .nexa-how-section,
          .nexa-seo-text-section,
          .nexa-faq-section,
          .nexa-price-section {
            padding-top: 68px;
            padding-bottom: 68px;
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
          }

          .nexa-seo-language-current span:nth-child(2) {
            display: none;
          }

          .nexa-primary-cta,
          .nexa-secondary-cta,
          .nexa-price-card a,
          .nexa-deposit-box a {
            width: 100%;
          }

          .nexa-fast-info-grid {
            grid-template-columns: 1fr;
          }

          .nexa-price-card {
            padding: 24px;
          }

          .nexa-price-number strong {
            font-size: 50px;
          }

          .nexa-hero-visual,
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
      `}</style>
    </main>
  );
}