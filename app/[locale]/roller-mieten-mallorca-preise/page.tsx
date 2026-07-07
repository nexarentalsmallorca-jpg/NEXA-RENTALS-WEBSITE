// app/[locale]/roller-mieten-mallorca-preise/page.tsx

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
    title: "Zwei Helme",
    text: "Für Fahrer und Beifahrer inklusive.",
  },
  {
    image: "/images/ex1.jpg",
    title: "Topcase",
    text: "Praktisch für Tasche, Helm oder Strandzeug.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Handyhalterung",
    text: "Ideal für Navigation auf Mallorca.",
  },
  {
    image: "/images/ex3.png",
    title: "Schloss",
    text: "Für sichere Stopps am Hotel, Strand oder Restaurant.",
  },
  {
    image: "/images/ex5.png",
    title: "Versicherung",
    text: "Basisversicherung ist im Mietpreis enthalten.",
  },
];

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/1HJFHyvzDNcrgrc99";

function normalizeLocale(locale: string | undefined): Locale {
  if (SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }

  return "de";
}

async function getPageLocale(params: PageProps["params"]) {
  const resolvedParams = await params;
  return normalizeLocale(resolvedParams?.locale);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await getPageLocale(params);

  return {
    title:
      "Roller mieten Mallorca Preise | ab 39€ alles inklusive | NEXA Rentals",
    description:
      "Roller mieten Mallorca Preise: 125cc Roller ab 39€ halbtags und 49€ für 24 Stunden. Bei NEXA Rentals online buchen, in Magaluf abholen. 2 Helme, Topcase, Schloss, Handyhalterung und unbegrenzte Kilometer inklusive.",
    keywords: [
      "Roller mieten Mallorca Preise",
      "Scooter mieten Mallorca Preise",
      "Roller Mallorca Preise",
      "Roller mieten Mallorca ab 39",
      "Roller mieten Mallorca 39€",
      "Roller mieten Mallorca 49€",
      "125cc Roller Mallorca Preise",
      "125cc Scooter Mallorca Preise",
      "Motorroller mieten Mallorca Preise",
      "Roller mieten Mallorca günstig",
      "Scooter mieten Mallorca günstig",
      "Roller mieten Magaluf Preise",
      "Scooter mieten Magaluf Preise",
      "Roller Verleih Mallorca Preise",
      "Roller mieten Mallorca Kaution",
      "Scooter Mallorca Kaution",
      "Roller Mallorca alles inklusive",
      "Roller mieten Mallorca ohne versteckte Kosten",
      "NEXA Rentals Preise",
      "NEXA Rentals Magaluf",
    ],
    alternates: {
      canonical: `https://www.nexarentals.es/${locale}/roller-mieten-mallorca-preise`,
    },
    openGraph: {
      title: "Roller mieten Mallorca Preise | NEXA Rentals",
      description:
        "125cc Roller ab 39€ halbtags und 49€ für 24 Stunden. Alles inklusive: 2 Helme, Topcase, Schloss, Handyhalterung und unbegrenzte Kilometer.",
      url: `https://www.nexarentals.es/${locale}/roller-mieten-mallorca-preise`,
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "Roller mieten Mallorca Preise bei NEXA Rentals",
        },
      ],
      locale: "de_DE",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function RollerMietenMallorcaPreisePage({
  params,
}: PageProps) {
  const locale = await getPageLocale(params);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[2];

  const homeHref = `/${locale}`;
  const bookHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wie viel kostet Roller mieten auf Mallorca bei NEXA Rentals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bei NEXA Rentals startet die Halbtagsmiete für einen 125cc Roller ab 39€. Die 24-Stunden-Miete kostet 49€. Je nach Saison und Mietdauer können mehrtägige Preise verfügbar sein.",
        },
      },
      {
        "@type": "Question",
        name: "Was ist im Roller-Preis inklusive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Im Preis enthalten sind 2 Helme, Topcase, Schloss, Handyhalterung, unbegrenzte Kilometer und Basisversicherung.",
        },
      },
      {
        "@type": "Question",
        name: "Gibt es eine Kaution beim Roller mieten auf Mallorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Bei NEXA Rentals beträgt die Kaution 150€ pro Roller. Die Kaution wird nach ordnungsgemäßer Rückgabe des Rollers zurückgegeben.",
        },
      },
      {
        "@type": "Question",
        name: "Gibt es versteckte Kosten?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nein. Die wichtigsten Extras wie 2 Helme, Topcase, Schloss, Handyhalterung, unbegrenzte Kilometer und Basisversicherung sind inklusive. Die Kaution ist separat und wird zurückgegeben, wenn der Roller ordnungsgemäß zurückkommt.",
        },
      },
      {
        "@type": "Question",
        name: "Wo hole ich den Roller ab?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Abholung und Rückgabe erfolgen direkt bei NEXA Rentals in Magaluf. Aktuell bieten wir keinen Lieferservice an.",
        },
      },
      {
        "@type": "Question",
        name: "Welche Fahrerlaubnis brauche ich für einen 125cc Roller?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Du brauchst A, A1 oder A2. Mit einem B-Führerschein kannst du einen 125cc Roller fahren, wenn dein B-Führerschein seit mindestens 3 Jahren gültig ist.",
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
      addressRegion: "Balearic Islands",
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
    openingHours: "Mo-Su 09:00-20:00",
    makesOffer: [
      {
        "@type": "Offer",
        name: "125cc Roller Halbtagsmiete",
        price: "39",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        areaServed: "Mallorca",
      },
      {
        "@type": "Offer",
        name: "125cc Roller 24 Stunden",
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
        id="nexa-seo-navbar-scroll-preise"
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
          <Link href={homeHref} className="nexa-seo-logo-link nexa-hide-on-scroll">
            <Image
              src="/images/reallogo.png"
              alt="NEXA Rentals"
              width={290}
              height={96}
              priority
              className="nexa-seo-logo"
            />
          </Link>

          <div className="nexa-scroll-arrows nexa-scroll-arrows-left" aria-hidden="true">
            <span>→</span>
            <span>→</span>
            <span>→</span>
          </div>

          <Link href={bookHref} className="nexa-seo-book-button">
            <span>Jetzt buchen</span>
          </Link>

          <div className="nexa-scroll-arrows nexa-scroll-arrows-right" aria-hidden="true">
            <span>←</span>
            <span>←</span>
            <span>←</span>
          </div>

          <div className="nexa-seo-nav-right nexa-hide-on-scroll">
            <Link href={contactHref} className="nexa-seo-contact-button">
              Kontakt
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
                      href={`/${language.code}/roller-mieten-mallorca-preise`}
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
                125cc Roller ab 39€ · alles inklusive
              </span>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="nexa-top-map-button"
              >
                Route öffnen
              </a>
            </div>

            <h1>Roller mieten auf Mallorca: Preise klar, einfach und fair.</h1>

            <p className="nexa-hero-text">
              Du suchst nach <strong>Roller mieten Mallorca Preise</strong>,{" "}
              <strong>Scooter mieten Mallorca günstig</strong> oder{" "}
              <strong>125cc Roller Mallorca ab 39€</strong>? Bei NEXA Rentals
              bekommst du transparente Preise, einfache Online-Buchung und
              Abholung direkt in Magaluf.
            </p>

            <p className="nexa-hero-text small">
              Halbtags ab 39€, 24 Stunden 49€. Im Preis enthalten sind 2 Helme,
              Topcase, Schloss, Handyhalterung, unbegrenzte Kilometer und
              Basisversicherung. Die Kaution beträgt 150€ pro Roller und wird
              nach ordnungsgemäßer Rückgabe zurückgegeben.
            </p>

            <div className="nexa-hero-actions">
              <Link href={bookHref} className="nexa-primary-cta">
                Preise prüfen & buchen
              </Link>

              <Link href={contactHref} className="nexa-secondary-cta">
                Fragen? Kontakt
              </Link>
            </div>

            <div className="nexa-online-note">
              Online-Buchung über{" "}
              <Link href={bookHref}>{`www.nexarentals.es/${locale}/home`}</Link>
            </div>

            <div className="nexa-hero-points">
              <div>
                <strong>39€</strong>
                <span>Halbtags bis 20:00</span>
              </div>

              <div>
                <strong>49€</strong>
                <span>24 Stunden Roller</span>
              </div>

              <div>
                <strong>150€</strong>
                <span>Kaution pro Roller</span>
              </div>
            </div>
          </div>

          <div className="nexa-hero-visual">
            <div className="nexa-visual-stack">
              <div className="nexa-orange-shape" />

              <div className="nexa-photo-card nexa-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Roller mieten Mallorca Preise bei NEXA Rentals"
                  width={900}
                  height={620}
                  priority
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-photo-card nexa-photo-card-bottom">
                <Image
                  src="/images/scooterperson2.jpg"
                  alt="125cc Roller Mallorca ab 39 Euro"
                  width={900}
                  height={720}
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-floating-price">
                <span>von</span>
                <strong>39€</strong>
                <small>alles inklusive</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-trust-section">
        <p>Transparente Roller-Preise für Mallorca, Magaluf und Umgebung</p>

        <div className="nexa-trust-logos">
          <span>ab 39€</span>
          <span>24h 49€</span>
          <span>alles inklusive</span>
          <span>125cc Roller</span>
          <span>150€ Kaution</span>
        </div>
      </section>

      <section className="nexa-price-section">
        <div className="nexa-price-inner">
          <span className="nexa-section-label">Preise</span>

          <h2>Klare Preise ohne kompliziertes Kleingedrucktes.</h2>

          <div className="nexa-price-grid">
            <div className="nexa-price-card">
              <span className="nexa-price-badge">Halbtags</span>
              <h3>Same Day</h3>
              <p className="nexa-price-time">Abholung morgens · Rückgabe bis 20:00</p>
              <div className="nexa-price-number">
                <span>von</span>
                <strong>39€</strong>
              </div>
              <ul>
                <li>125cc Roller</li>
                <li>2 Helme inklusive</li>
                <li>Topcase inklusive</li>
                <li>Schloss inklusive</li>
                <li>Handyhalterung inklusive</li>
                <li>Unbegrenzte Kilometer</li>
              </ul>
              <Link href={bookHref}>Halbtags buchen</Link>
            </div>

            <div className="nexa-price-card featured">
              <span className="nexa-price-badge">Beliebt</span>
              <h3>24 Stunden</h3>
              <p className="nexa-price-time">Perfekt für Tagesausflüge und flexible Pläne</p>
              <div className="nexa-price-number">
                <span>nur</span>
                <strong>49€</strong>
              </div>
              <ul>
                <li>125cc Roller für 24 Stunden</li>
                <li>2 Helme inklusive</li>
                <li>Topcase inklusive</li>
                <li>Schloss inklusive</li>
                <li>Handyhalterung inklusive</li>
                <li>Unbegrenzte Kilometer</li>
              </ul>
              <Link href={bookHref}>24h buchen</Link>
            </div>

            <div className="nexa-price-card">
              <span className="nexa-price-badge">Mehrere Tage</span>
              <h3>Multi-Day</h3>
              <p className="nexa-price-time">Ideal für längere Mallorca-Aufenthalte</p>
              <div className="nexa-price-number">
                <span>ab</span>
                <strong>43€</strong>
              </div>
              <ul>
                <li>2 Tage: 47€ / Tag</li>
                <li>3 Tage: 46€ / Tag</li>
                <li>4 Tage: 45€ / Tag</li>
                <li>5 Tage: 44€ / Tag</li>
                <li>6 Tage: 43€ / Tag</li>
                <li>Alles inklusive</li>
              </ul>
              <Link href={bookHref}>Mehrere Tage buchen</Link>
            </div>
          </div>

          <div className="nexa-deposit-box">
            <div>
              <strong>150€ Kaution pro Roller</strong>
              <p>
                Die Kaution wird bei ordnungsgemäßer Rückgabe des Rollers
                zurückgegeben. Bitte bringe Original-Führerschein und Ausweis
                oder Pass mit.
              </p>
            </div>
            <Link href={bookHref}>Jetzt Verfügbarkeit prüfen</Link>
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
            <span className="nexa-section-label">Roller Preise Mallorca</span>

            <h2>Warum der Preis bei NEXA Rentals einfach zu verstehen ist.</h2>

            <p>
              Viele Urlauber suchen nach Roller mieten Mallorca Preise, Scooter
              mieten Mallorca günstig oder 125cc Roller Mallorca ab 39€. Bei
              NEXA Rentals soll die Entscheidung einfach sein: Du siehst den
              Preis online, buchst direkt und holst deinen Roller in Magaluf ab.
            </p>

            <p>
              Im Mietpreis sind wichtige Extras bereits enthalten. Du bekommst 2
              Helme, Topcase, Schloss, Handyhalterung, unbegrenzte Kilometer und
              Basisversicherung. Die Kaution von 150€ pro Roller ist separat und
              wird nach ordnungsgemäßer Rückgabe zurückgegeben.
            </p>
          </article>

          <aside className="nexa-info-box">
            <h3>Im Preis enthalten</h3>

            <ul>
              <li>125cc Roller für Mallorca</li>
              <li>2 Helme inklusive</li>
              <li>Topcase für Tasche, Helm oder Strandzeug</li>
              <li>Wasserdichte Handyhalterung</li>
              <li>Sicherheits-Schloss inklusive</li>
              <li>Unbegrenzte Kilometer</li>
              <li>Basisversicherung inklusive</li>
              <li>Online buchen und online bezahlen</li>
              <li>Abholung und Rückgabe bei NEXA Rentals in Magaluf</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="nexa-how-section">
        <div className="nexa-how-inner">
          <span className="nexa-section-label">So funktioniert es</span>

          <h2>Preis prüfen, online buchen und in Magaluf starten.</h2>

          <div className="nexa-how-grid">
            <div>
              <span>01</span>
              <h3>Datum wählen</h3>
              <p>
                Wähle dein Datum, deine Mietdauer und den Roller. So siehst du
                direkt die passende Option.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Online bezahlen</h3>
              <p>
                Bezahle den Mietpreis online und sichere dir deinen 125cc Roller
                für Mallorca.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>In Magaluf abholen</h3>
              <p>
                Komm mit Original-Führerschein und Ausweis oder Pass zu NEXA
                Rentals. Danach kannst du direkt losfahren.
              </p>
            </div>
          </div>

          <Link href={bookHref} className="nexa-bottom-cta">
            Jetzt Preise prüfen
          </Link>
        </div>
      </section>

      <section className="nexa-seo-text-section">
        <div className="nexa-seo-text-inner">
          <span className="nexa-section-label">Scooter Preise Mallorca</span>

          <h2>
            Für Urlauber, die faire Roller-Preise und klare Inklusivleistungen
            suchen.
          </h2>

          <p>
            Wenn du nach “Roller mieten Mallorca Preise”, “Scooter mieten
            Mallorca Preise”, “Roller mieten Mallorca günstig”, “Roller Mallorca
            39€” oder “125cc Roller Mallorca Preise” suchst, willst du wissen,
            was wirklich im Preis enthalten ist.
          </p>

          <p>
            Bei NEXA Rentals bekommst du 125cc Roller mit klaren Preisen und
            wichtigen Extras inklusive. Aktuell bieten wir keinen Lieferservice
            an. Abholung und Rückgabe erfolgen direkt bei NEXA Rentals in
            Magaluf, damit Übergabe, Dokumentencheck und Rückgabe sauber und
            sicher bleiben.
          </p>

          <div className="nexa-keyword-cloud">
            <span>Roller mieten Mallorca Preise</span>
            <span>Scooter mieten Mallorca günstig</span>
            <span>125cc Roller ab 39€</span>
            <span>Roller Mallorca 49€</span>
            <span>Roller mieten Mallorca Kaution</span>
            <span>Roller alles inklusive Mallorca</span>
            <span>Roller mieten Magaluf Preise</span>
            <span>NEXA Rentals Magaluf</span>
          </div>
        </div>
      </section>

      <section className="nexa-location-section">
        <LocationV3 />
      </section>

      <section className="nexa-faq-section">
        <div className="nexa-faq-inner">
          <span className="nexa-section-label">Häufige Fragen</span>

          <h2>Fragen zu Roller-Preisen auf Mallorca</h2>

          <div className="nexa-faq-list">
            <details>
              <summary>Wie viel kostet ein Roller bei NEXA Rentals?</summary>
              <p>
                Die Halbtagsmiete startet ab 39€. Die 24-Stunden-Miete kostet
                49€. Mehrtägige Preise können je nach Saison und Mietdauer
                verfügbar sein.
              </p>
            </details>

            <details>
              <summary>Was ist im Preis enthalten?</summary>
              <p>
                2 Helme, Topcase, Schloss, Handyhalterung, unbegrenzte Kilometer
                und Basisversicherung sind inklusive.
              </p>
            </details>

            <details>
              <summary>Wie hoch ist die Kaution?</summary>
              <p>
                Die Kaution beträgt 150€ pro Roller. Sie wird nach
                ordnungsgemäßer Rückgabe des Rollers zurückgegeben.
              </p>
            </details>

            <details>
              <summary>Gibt es versteckte Kosten?</summary>
              <p>
                Die wichtigsten Extras sind im Preis enthalten. Die Kaution ist
                separat und wird zurückgegeben, wenn der Roller ordnungsgemäß
                zurückkommt.
              </p>
            </details>

            <details>
              <summary>Wo ist die Abholung?</summary>
              <p>
                Abholung und Rückgabe erfolgen direkt bei NEXA Rentals in
                Magaluf. Aktuell bieten wir keinen Lieferservice an.
              </p>
            </details>

            <details>
              <summary>Welche Fahrerlaubnis brauche ich?</summary>
              <p>
                Du brauchst A, A1 oder A2. Mit einem B-Führerschein kannst du
                einen 125cc Roller fahren, wenn dein B-Führerschein seit
                mindestens 3 Jahren gültig ist.
              </p>
            </details>
          </div>

          <div className="nexa-final-cta">
            <h3>Preis passt?</h3>
            <p>
              Buche deinen 125cc Roller online und starte direkt bei NEXA Rentals
              in Magaluf.
            </p>
            <Link href={bookHref}>Jetzt Roller buchen</Link>
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
            <p>NEXA Rentals · Roller & E-Bike Verleih in Magaluf, Mallorca</p>
          </div>

          <div className="nexa-seo-footer-actions">
            <Link href={bookHref}>Jetzt buchen</Link>
            <Link href={contactHref}>Kontakt</Link>
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