// app/[locale]/roller-mieten-palma-nova/page.tsx

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
  variable: "--font-palma-nova-seo",
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
    text: "Ideal für Strandtasche, Handtuch oder kleine Einkäufe.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Handyhalterung",
    text: "Perfekt für Navigation zwischen Palma Nova, Magaluf und Calvià.",
  },
  {
    image: "/images/ex3.png",
    title: "Schloss",
    text: "Für sichere Stopps am Strand, Hotel oder Restaurant.",
  },
  {
    image: "/images/ex5.png",
    title: "Versicherung",
    text: "Basisversicherung ist inklusive.",
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
      "Roller mieten Palma Nova | Roller mieten Palmanova | NEXA Rentals",
    description:
      "Roller mieten in Palma Nova oder Palmanova bei NEXA Rentals. 125cc Scooter online buchen, in Magaluf abholen und Palma Nova, Magaluf, Son Matias, Portals Nous und Calvià flexibel entdecken.",
    keywords: [
      "Roller mieten Palma Nova",
      "Roller mieten Palmanova",
      "Scooter mieten Palma Nova",
      "Scooter mieten Palmanova",
      "125cc Roller Palma Nova",
      "125cc Roller Palmanova",
      "Roller Verleih Palma Nova",
      "Roller Verleih Palmanova",
      "Scooter Rental Palma Nova",
      "Scooter Rental Palmanova",
      "Palma Nova Roller mieten",
      "Palmanova Scooter Rental",
      "Motorroller mieten Palma Nova",
      "NEXA Rentals Palma Nova",
      "Roller online buchen Palma Nova",
    ],
    alternates: {
      canonical: `https://www.nexarentals.es/${locale}/roller-mieten-palma-nova`,
    },
    openGraph: {
      title: "Roller mieten Palma Nova | NEXA Rentals",
      description:
        "125cc Roller für Palma Nova und Palmanova online buchen. Abholung bei NEXA Rentals in Magaluf.",
      url: `https://www.nexarentals.es/${locale}/roller-mieten-palma-nova`,
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "Roller mieten Palma Nova bei NEXA Rentals",
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

export default async function RollerMietenPalmaNovaPage({ params }: PageProps) {
  const locale = await getPageLocale(params);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[2];

  const homeHref = `/${locale}`;
  const bookHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;
  const externalBookingHref = `/${locale}/home`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Kann ich in Palma Nova einen Roller mieten?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Du kannst deinen 125cc Roller online bei NEXA Rentals buchen und ihn in Magaluf abholen. Der Standort ist sehr praktisch für Gäste aus Palma Nova, Palmanova und Son Matias.",
        },
      },
      {
        "@type": "Question",
        name: "Ist NEXA Rentals nah an Palma Nova?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. NEXA Rentals befindet sich in Magaluf, direkt neben Palma Nova und Palmanova. Viele Gäste aus Palma Nova erreichen den Standort schnell und starten von dort ihre Fahrt.",
        },
      },
      {
        "@type": "Question",
        name: "Welche Fahrerlaubnis brauche ich für einen 125cc Roller?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Du brauchst A, A1 oder A2. Mit einem B-Führerschein kannst du einen 125cc Roller fahren, wenn dein Führerschein seit mindestens 3 Jahren gültig ist.",
        },
      },
      {
        "@type": "Question",
        name: "Was ist beim Roller mieten für Palma Nova inklusive?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bei NEXA Rentals sind 2 Helme, Topcase, Schloss, Handyhalterung, unbegrenzte Kilometer und Basisversicherung inklusive.",
        },
      },
      {
        "@type": "Question",
        name: "Gibt es Lieferung nach Palma Nova?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aktuell bieten wir keinen Lieferservice an. Abholung und Rückgabe erfolgen direkt bei NEXA Rentals in Magaluf.",
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
      addressLocality: "Magaluf",
      addressRegion: "Mallorca",
      addressCountry: "ES",
    },
    areaServed: [
      "Palma Nova",
      "Palmanova",
      "Son Matias",
      "Magaluf",
      "Torrenova",
      "Portals Nous",
      "Calvià",
      "Mallorca",
    ],
    openingHours: "Mo-Su 09:00-20:00",
    makesOffer: {
      "@type": "Offer",
      name: "125cc Roller mieten Palma Nova",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      areaServed: "Palma Nova",
    },
  };

  return (
    <main className={`${pageFont.variable} palma-nova-seo-page`}>
      <Script
        id="palma-nova-navbar-scroll"
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
                var navbar = document.querySelector(".palma-nova-navbar");
                var scrolled = getScrollTop() > 18;

                if (navbar) {
                  navbar.setAttribute("data-scrolled", scrolled ? "true" : "false");
                }

                document.documentElement.classList.toggle("palma-nova-page-scrolled", scrolled);
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

      <header className="palma-nova-navbar" data-scrolled="false">
        <div className="palma-nova-nav-inner">
          <Link href={homeHref} className="palma-nova-logo-link hide-on-scroll">
            <Image
              src="/images/reallogo.png"
              alt="NEXA Rentals"
              width={290}
              height={96}
              priority
              className="palma-nova-logo"
            />
          </Link>

          <div className="scroll-arrows scroll-arrows-left" aria-hidden="true">
            <span>→</span>
            <span>→</span>
            <span>→</span>
          </div>

          <Link href={bookHref} className="palma-nova-book-button">
            <span>Jetzt buchen</span>
          </Link>

          <div className="scroll-arrows scroll-arrows-right" aria-hidden="true">
            <span>←</span>
            <span>←</span>
            <span>←</span>
          </div>

          <div className="palma-nova-nav-right hide-on-scroll">
            <Link href={contactHref} className="palma-nova-contact-button">
              Kontakt
            </Link>

            <details className="palma-nova-language">
              <summary className="palma-nova-language-current">
                <Image
                  src={currentLanguage.flagSrc}
                  alt={currentLanguage.label}
                  width={20}
                  height={20}
                  className="palma-nova-flag"
                />
                <span>{currentLanguage.short}</span>
                <span className="palma-nova-arrow">▾</span>
              </summary>

              <div className="palma-nova-language-menu">
                {LANGUAGES.map((language) => {
                  const active = language.code === locale;

                  return (
                    <Link
                      key={language.code}
                      href={`/${language.code}/roller-mieten-palma-nova`}
                      className={
                        active
                          ? "palma-nova-language-option active"
                          : "palma-nova-language-option"
                      }
                    >
                      <span className="palma-nova-language-left">
                        <Image
                          src={language.flagSrc}
                          alt={language.label}
                          width={22}
                          height={22}
                          className="palma-nova-flag"
                        />
                        <span>{language.label}</span>
                      </span>

                      <span className="palma-nova-language-short">
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

      <section className="palma-nova-hero-section">
        <div className="palma-nova-hero-grid">
          <div className="palma-nova-hero-copy">
            <div className="palma-nova-topline">
              <span className="palma-nova-kicker">
                Nur ca. 10 Minuten zu Fuß von Palmanova entfernt
              </span>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="palma-nova-top-map-button"
              >
                In Google Maps öffnen
              </a>
            </div>

            <h1>Roller mieten in Palma Nova und Mallorca frei erleben.</h1>

            <p className="palma-nova-hero-text">
              Du suchst nach <strong>Roller mieten Palma Nova</strong>,{" "}
              <strong>Roller mieten Palmanova</strong> oder{" "}
              <strong>Scooter mieten Palma Nova</strong>? Bei NEXA Rentals
              buchst du deinen 125cc Roller online und holst ihn direkt im
              Nachbarort Magaluf ab.
            </p>

            <p className="palma-nova-hero-text small">
              Perfekt für Urlauber in Palma Nova, Palmanova, Son Matias und
              Magaluf, die schnell zum Strand, Hotel, Restaurant, Beachclub oder
              Aussichtspunkt fahren möchten.
            </p>

            <div className="palma-nova-hero-actions">
              <Link href={bookHref} className="palma-nova-primary-cta">
                Roller jetzt buchen
              </Link>

              <Link href={contactHref} className="palma-nova-secondary-cta">
                Fragen? Kontakt
              </Link>
            </div>

            <div className="palma-nova-online-note">
              Online-Buchung auch über{" "}
              <a href={externalBookingHref} target="_blank" rel="noreferrer">
                {`www.nexarentals.es/${locale}/home`}
              </a>
            </div>
          </div>

          <div className="palma-nova-hero-visual">
            <div className="palma-nova-visual-stack">
              <div className="palma-nova-main-panel" />

              <div className="palma-nova-photo-card palma-nova-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Roller mieten Palma Nova bei NEXA Rentals"
                  width={900}
                  height={620}
                  priority
                  className="palma-nova-hero-image"
                />
              </div>

              <div className="palma-nova-photo-card palma-nova-photo-card-bottom">
                <Image
                  src="/images/scooterperson2.jpg"
                  alt="Scooter mieten Palma Nova und Palmanova"
                  width={900}
                  height={720}
                  className="palma-nova-hero-image"
                />
              </div>

              <div className="palma-nova-price-card">
                <span>von</span>
                <strong>39€</strong>
                <small>alles inklusive</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="palma-nova-intent-section">
        <div className="palma-nova-intent-inner">
          <div>
            <span>01</span>
            <strong>Online buchen</strong>
            <p>Reserviere deinen 125cc Roller für Palma Nova schnell online.</p>
          </div>

          <div>
            <span>02</span>
            <strong>In Magaluf abholen</strong>
            <p>Unser Standort liegt praktisch für Palma Nova und Palmanova.</p>
          </div>

          <div>
            <span>03</span>
            <strong>Mallorca frei entdecken</strong>
            <p>
              Fahre flexibel nach Magaluf, Portals Nous, Santa Ponsa oder
              Calvià.
            </p>
          </div>
        </div>
      </section>

      <section className="palma-nova-included-section">
        <div className="palma-nova-section-heading">
          <span>Inklusive bei NEXA Rentals</span>
          <h2>Alles dabei für deine Fahrt ab Palma Nova.</h2>
        </div>

        <div className="palma-nova-included-grid">
          {INCLUDED_ITEMS.map((item) => (
            <div key={item.title} className="palma-nova-included-item">
              <span className="palma-nova-check">✓</span>

              <div className="palma-nova-included-image-wrap">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={260}
                  height={180}
                  className="palma-nova-included-image"
                />
              </div>

              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="palma-nova-components-section">
        <GoogleReviewsV3 />
      </section>

      <section className="palma-nova-components-section stats">
        <NexaStatsStripV3 />
      </section>

      <section className="palma-nova-content-section">
        <div className="palma-nova-content-grid">
          <article>
            <span className="palma-nova-section-label">
              Roller Verleih Palma Nova
            </span>

            <h2>Warum ein Roller in Palma Nova besonders praktisch ist.</h2>

            <p>
              Palma Nova und Palmanova sind perfekt, wenn du nah am Strand
              wohnst und trotzdem mehr von Mallorca sehen möchtest. Mit einem
              125cc Roller bist du nicht auf Taxi, Bus oder lange Fußwege
              angewiesen. Du kannst morgens zum Strand, mittags nach Magaluf und
              abends spontan nach Portals Nous oder Santa Ponsa fahren.
            </p>

            <p>
              NEXA Rentals ist für Gäste aus Palma Nova sehr praktisch, weil der
              Pickup direkt in Magaluf liegt. Du buchst online, bezahlst online
              und holst deinen Roller im Büro ab. Danach kannst du direkt los –
              ohne komplizierte Übergabe und ohne versteckte Extras.
            </p>
          </article>

          <aside className="palma-nova-local-box">
            <h3>Beliebte Suchanfragen</h3>

            <div className="palma-nova-keywords-list">
              <span>Roller mieten Palma Nova</span>
              <span>Roller mieten Palmanova</span>
              <span>Scooter mieten Palma Nova</span>
              <span>125cc Roller Palmanova</span>
              <span>Roller Verleih Palma Nova</span>
              <span>Scooter Rental Palmanova</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="palma-nova-how-section">
        <div className="palma-nova-how-inner">
          <span className="palma-nova-section-label">So funktioniert es</span>

          <h2>Von Palma Nova zum Roller in drei einfachen Schritten.</h2>

          <div className="palma-nova-how-grid">
            <div>
              <span>1</span>
              <h3>Datum wählen</h3>
              <p>
                Wähle online deinen Roller, die Mietdauer und die gewünschte
                Startzeit für deinen Mallorca-Tag.
              </p>
            </div>

            <div>
              <span>2</span>
              <h3>Online sichern</h3>
              <p>
                Bezahle online und reserviere deinen Roller fest. So ist dein
                Fahrzeug vorbereitet.
              </p>
            </div>

            <div>
              <span>3</span>
              <h3>Abholen & losfahren</h3>
              <p>
                Komm mit Original-Führerschein und Ausweis zu NEXA Rentals in
                Magaluf und starte direkt.
              </p>
            </div>
          </div>

          <Link href={bookHref} className="palma-nova-bottom-cta">
            Jetzt Roller für Palma Nova buchen
          </Link>
        </div>
      </section>

      <section className="palma-nova-seo-text-section">
        <div className="palma-nova-seo-text-inner">
          <span className="palma-nova-section-label">
            125cc Scooter Palma Nova
          </span>

          <h2>
            Für Urlauber, die Palma Nova, Palmanova und Magaluf flexibel
            verbinden möchten.
          </h2>

          <p>
            Wenn du bei Google nach “Roller mieten Palma Nova”, “Roller mieten
            Palmanova”, “Scooter mieten Palma Nova” oder “125cc Roller
            Palmanova” suchst, möchtest du wahrscheinlich eine einfache Lösung:
            online buchen, schnell abholen und ohne Stress losfahren. Genau
            dafür ist diese Seite gemacht.
          </p>

          <p>
            Palma Nova liegt direkt neben Magaluf. Deshalb ist NEXA Rentals eine
            praktische Wahl für Gäste aus Palma Nova, Son Matias, Palmanova und
            Torrenova. Du kannst deinen Roller online reservieren und bei uns in
            Magaluf abholen. Danach erreichst du Strände, Restaurants, Hotels,
            Aussichtspunkte und Nachbarorte deutlich flexibler.
          </p>

          <div className="palma-nova-keyword-cloud">
            <span>Roller mieten Palma Nova</span>
            <span>Roller mieten Palmanova</span>
            <span>Scooter Palma Nova</span>
            <span>125cc Roller Palmanova</span>
            <span>Roller Verleih Palma Nova</span>
            <span>Palma Nova Scooter Rental</span>
            <span>NEXA Rentals Magaluf</span>
            <span>Roller online buchen Mallorca</span>
          </div>
        </div>
      </section>

      <section className="palma-nova-location-section">
        <LocationV3 />
      </section>

      <section className="palma-nova-faq-section">
        <div className="palma-nova-faq-inner">
          <span className="palma-nova-section-label">Häufige Fragen</span>

          <h2>Fragen zum Roller mieten in Palma Nova</h2>

          <div className="palma-nova-faq-list">
            <details>
              <summary>Kann ich einen Roller direkt für Palma Nova buchen?</summary>
              <p>
                Ja. Du kannst deinen Roller online buchen und ihn bei NEXA
                Rentals in Magaluf abholen. Das ist praktisch für Gäste aus
                Palma Nova, Palmanova und Son Matias.
              </p>
            </details>

            <details>
              <summary>Ist Palma Nova weit von NEXA Rentals entfernt?</summary>
              <p>
                Nein. Palma Nova liegt direkt neben Magaluf. Viele Gäste aus
                Palma Nova erreichen NEXA Rentals schnell und starten von dort
                ihre Fahrt.
              </p>
            </details>

            <details>
              <summary>Welche Fahrerlaubnis brauche ich?</summary>
              <p>
                Für einen 125cc Roller brauchst du A, A1 oder A2. Mit einem
                B-Führerschein kannst du fahren, wenn dieser seit mindestens 3
                Jahren gültig ist.
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
              <summary>Kann der Roller nach Palma Nova geliefert werden?</summary>
              <p>
                Aktuell bieten wir keinen Lieferservice an. Abholung und
                Rückgabe erfolgen direkt bei NEXA Rentals in Magaluf.
              </p>
            </details>
          </div>

          <div className="palma-nova-final-cta">
            <h3>Bereit für Palma Nova?</h3>
            <p>
              Buche deinen 125cc Roller online und starte direkt bei NEXA
              Rentals in Magaluf.
            </p>
            <Link href={bookHref}>Jetzt Roller buchen</Link>
          </div>
        </div>
      </section>

      <footer className="palma-nova-footer">
        <div className="palma-nova-footer-inner">
          <div className="palma-nova-footer-brand">
            <Image
              src="/images/reallogo.png"
              alt="NEXA Rentals"
              width={220}
              height={72}
              className="palma-nova-footer-logo"
            />
            <p>NEXA Rentals · Roller & E-Bike Verleih in Magaluf, Mallorca</p>
          </div>

          <div className="palma-nova-footer-actions">
            <Link href={bookHref}>Jetzt buchen</Link>
            <Link href={contactHref}>Kontakt</Link>
          </div>
        </div>
      </footer>

      <NeroWebsiteAssistant />

      <style>{`
        .palma-nova-seo-page,
        .palma-nova-seo-page * {
          font-family:
            var(--font-palma-nova-seo),
            Poppins,
            Arial,
            Helvetica,
            sans-serif;
          box-sizing: border-box;
        }

        .palma-nova-seo-page {
          min-height: 100vh;
          padding-top: 68px;
          background: #ffffff;
          color: #111116;
          overflow-x: hidden;
        }

        .palma-nova-navbar {
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

        .palma-nova-nav-inner {
          position: relative;
          max-width: 1480px;
          height: 68px;
          margin: 0 auto;
          padding: 0 clamp(18px, 4vw, 56px);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hide-on-scroll {
          transform-origin: center;
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transition:
            opacity 260ms ease,
            visibility 260ms ease,
            transform 260ms ease;
        }

        .palma-nova-navbar[data-scrolled="true"] .hide-on-scroll,
        html.palma-nova-page-scrolled .palma-nova-navbar .hide-on-scroll {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-12px) scale(0.98);
        }

        .palma-nova-logo-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          z-index: 3;
        }

        .palma-nova-logo {
          width: auto;
          height: 48px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.45));
          transition:
            transform 220ms ease,
            filter 220ms ease;
        }

        .palma-nova-logo-link:hover .palma-nova-logo {
          transform: scale(1.025);
          filter: drop-shadow(0 10px 24px rgba(255, 122, 0, 0.2));
        }

        .scroll-arrows {
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

        .scroll-arrows-left {
          right: calc(50% + 118px);
          transform: translateY(-50%) translateX(-22px);
        }

        .scroll-arrows-right {
          left: calc(50% + 118px);
          transform: translateY(-50%) translateX(22px);
        }

        .palma-nova-navbar[data-scrolled="true"] .scroll-arrows,
        html.palma-nova-page-scrolled .palma-nova-navbar .scroll-arrows {
          opacity: 1;
          visibility: visible;
        }

        .palma-nova-navbar[data-scrolled="true"] .scroll-arrows-left,
        html.palma-nova-page-scrolled .palma-nova-navbar .scroll-arrows-left {
          transform: translateY(-50%) translateX(0);
        }

        .palma-nova-navbar[data-scrolled="true"] .scroll-arrows-right,
        html.palma-nova-page-scrolled .palma-nova-navbar .scroll-arrows-right {
          transform: translateY(-50%) translateX(0);
        }

        .scroll-arrows span {
          display: inline-block;
          animation: arrowPulseRight 1.05s ease-in-out infinite;
        }

        .scroll-arrows-right span {
          animation-name: arrowPulseLeft;
        }

        .scroll-arrows span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .scroll-arrows span:nth-child(3) {
          animation-delay: 0.24s;
        }

        @keyframes arrowPulseRight {
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

        @keyframes arrowPulseLeft {
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

        .palma-nova-book-button {
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
          animation: bookHeartbeat 1.75s ease-in-out infinite;
          transition:
            box-shadow 220ms ease,
            background 220ms ease,
            color 220ms ease;
          z-index: 4;
        }

        .palma-nova-book-button:hover {
          animation-play-state: paused;
          background: #ff7a00;
          color: #000000;
          box-shadow:
            0 0 0 1px rgba(255, 122, 0, 0.7),
            0 0 28px rgba(255, 122, 0, 0.58),
            0 18px 46px rgba(255, 122, 0, 0.28);
        }

        .palma-nova-book-button:active {
          animation-play-state: paused;
          transform: translate(-50%, -50%) scale(0.91);
        }

        @keyframes bookHeartbeat {
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

        .palma-nova-nav-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          z-index: 5;
        }

        .palma-nova-contact-button {
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
          transition:
            background 220ms ease,
            border-color 220ms ease,
            color 220ms ease,
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .palma-nova-contact-button:hover {
          transform: translateY(-1px) scale(1.04);
          border-color: rgba(255, 122, 0, 0.58);
          background: rgba(255, 122, 0, 0.12);
          color: #ffffff;
          box-shadow: 0 12px 28px rgba(255, 122, 0, 0.14);
        }

        .palma-nova-language {
          position: relative;
        }

        .palma-nova-language summary {
          list-style: none;
        }

        .palma-nova-language summary::-webkit-details-marker {
          display: none;
        }

        .palma-nova-language-current {
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
        }

        .palma-nova-flag {
          border-radius: 999px;
          object-fit: cover;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
        }

        .palma-nova-arrow {
          display: inline-block;
          font-size: 10px;
          opacity: 0.74;
          transition: transform 220ms ease;
        }

        .palma-nova-language[open] .palma-nova-arrow {
          transform: rotate(180deg);
        }

        .palma-nova-language-menu {
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

        .palma-nova-language-option {
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

        .palma-nova-language-option:hover {
          transform: translateX(2px);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .palma-nova-language-option.active {
          background: rgba(255, 122, 0, 0.16);
          color: #ffffff;
        }

        .palma-nova-language-left {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .palma-nova-language-short {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: #ff7a00;
        }

        .palma-nova-hero-section {
          position: relative;
          overflow: hidden;
          padding: clamp(64px, 7vw, 108px) clamp(18px, 4vw, 56px) 90px;
          background: #ffffff;
        }

        .palma-nova-hero-grid {
          position: relative;
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(430px, 1.05fr);
          gap: clamp(34px, 6vw, 88px);
          align-items: center;
        }

        .palma-nova-topline {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .palma-nova-kicker {
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
        }

        .palma-nova-kicker::before {
          content: "📍";
          margin-right: 7px;
          font-size: 12px;
          letter-spacing: 0;
        }

        .palma-nova-top-map-button {
          min-height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 14px;
          border-radius: 999px;
          background: #111116;
          color: #ffffff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid rgba(17, 17, 22, 0.1);
          box-shadow: 0 14px 34px rgba(17, 17, 22, 0.12);
          transition:
            transform 180ms ease,
            background 180ms ease,
            color 180ms ease,
            box-shadow 180ms ease;
        }

        .palma-nova-top-map-button:hover {
          transform: translateY(-1px) scale(1.03);
          background: #ff7a00;
          color: #111116;
          box-shadow: 0 18px 40px rgba(255, 122, 0, 0.22);
        }

        .palma-nova-top-map-button:active {
          transform: scale(0.96);
        }

        .palma-nova-hero-copy h1 {
          max-width: 700px;
          margin: 22px 0 0;
          color: #141318;
          font-size: clamp(42px, 5vw, 74px);
          line-height: 1.02;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .palma-nova-hero-text {
          max-width: 650px;
          margin: 24px 0 0;
          color: #5f5d69;
          font-size: clamp(16px, 1.22vw, 18px);
          line-height: 1.78;
          letter-spacing: -0.018em;
          font-weight: 500;
        }

        .palma-nova-hero-text strong {
          color: #17161c;
          font-weight: 800;
        }

        .palma-nova-hero-text.small {
          margin-top: 14px;
          color: #74727e;
        }

        .palma-nova-hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }

        .palma-nova-primary-cta,
        .palma-nova-secondary-cta,
        .palma-nova-bottom-cta,
        .palma-nova-final-cta a {
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

        .palma-nova-primary-cta,
        .palma-nova-bottom-cta,
        .palma-nova-final-cta a {
          padding: 0 26px;
          background: #111116;
          color: #ffffff;
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.2);
          animation: ctaBreath 1.95s ease-in-out infinite;
        }

        .palma-nova-primary-cta:hover,
        .palma-nova-bottom-cta:hover,
        .palma-nova-final-cta a:hover {
          animation-play-state: paused;
          transform: translateY(-2px) scale(1.04);
          background: #ff7a00;
          color: #111116;
          box-shadow: 0 20px 44px rgba(255, 122, 0, 0.3);
        }

        @keyframes ctaBreath {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.035);
          }
        }

        .palma-nova-secondary-cta {
          padding: 0 22px;
          background: #ffffff;
          color: #171720;
          border: 1px solid rgba(17, 17, 22, 0.1);
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.06);
        }

        .palma-nova-secondary-cta:hover {
          transform: translateY(-2px) scale(1.03);
          border-color: rgba(255, 122, 0, 0.45);
          color: #ff7a00;
        }

        .palma-nova-online-note {
          margin-top: 16px;
          color: #787682;
          font-size: 13px;
          font-weight: 600;
        }

        .palma-nova-online-note a {
          color: #ff7a00;
          font-weight: 900;
          text-decoration: none;
          border-bottom: 2px solid rgba(255, 122, 0, 0.45);
        }

        .palma-nova-hero-visual {
          position: relative;
          min-height: 860px;
        }

        .palma-nova-visual-stack {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 860px;
        }

        .palma-nova-main-panel {
          position: absolute;
          top: 26px;
          right: 20px;
          width: min(86%, 460px);
          height: 720px;
          border-radius: 42px;
          background: linear-gradient(
            135deg,
            #ff6500 0%,
            #ff8a00 52%,
            #ffb347 100%
          );
          box-shadow: 0 34px 84px rgba(255, 122, 0, 0.28);
        }

        .palma-nova-photo-card {
          position: absolute;
          overflow: hidden;
          border-radius: 30px;
          background: #f1f1f1;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.18),
            0 8px 22px rgba(17, 17, 22, 0.08);
        }

        .palma-nova-photo-card-top {
          top: 50px;
          left: 0;
          width: min(74%, 430px);
          height: 340px;
        }

        .palma-nova-photo-card-bottom {
          top: 410px;
          left: 52px;
          width: min(82%, 500px);
          height: 310px;
        }

        .palma-nova-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .palma-nova-price-card {
          position: absolute;
          top: 18px;
          right: 0;
          bottom: auto;
          width: 122px;
          height: 122px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #111116;
          border: 4px solid #ff7a00;
          color: #ffffff;
          box-shadow:
            0 18px 46px rgba(17, 17, 22, 0.24),
            0 0 0 9px rgba(255, 122, 0, 0.2);
          z-index: 6;
        }

        .palma-nova-price-card span {
          display: block;
          color: #ffb347;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.02em;
          text-transform: none;
        }

        .palma-nova-price-card small {
          display: block;
          margin-top: 2px;
          color: #ffb347;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .palma-nova-price-card strong {
          display: block;
          color: #ffffff;
          font-size: 33px;
          font-weight: 900;
          letter-spacing: -0.08em;
        }

        .palma-nova-intent-section {
          padding: 18px clamp(18px, 4vw, 56px) 72px;
          background: #ffffff;
        }

        .palma-nova-intent-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .palma-nova-intent-inner div {
          border-radius: 28px;
          background: #111116;
          color: #ffffff;
          padding: 26px;
          box-shadow: 0 24px 70px rgba(17, 17, 22, 0.11);
        }

        .palma-nova-intent-inner span {
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .palma-nova-intent-inner strong {
          display: block;
          margin-top: 12px;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.05em;
        }

        .palma-nova-intent-inner p {
          margin: 10px 0 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.55;
        }

        .palma-nova-included-section {
          padding: 0 clamp(18px, 4vw, 56px) 84px;
          background: #ffffff;
        }

        .palma-nova-section-heading {
          max-width: 760px;
          margin: 0 auto 36px;
          text-align: center;
        }

        .palma-nova-section-heading span,
        .palma-nova-section-label {
          display: inline-flex;
          margin-bottom: 16px;
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .palma-nova-section-heading h2,
        .palma-nova-content-grid h2,
        .palma-nova-how-inner h2,
        .palma-nova-seo-text-inner h2,
        .palma-nova-faq-inner h2 {
          margin: 0;
          color: #15141c;
          font-size: clamp(34px, 4vw, 56px);
          line-height: 1.04;
          letter-spacing: -0.065em;
          font-weight: 800;
        }

        .palma-nova-included-grid {
          max-width: 1110px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(18px, 2.4vw, 34px);
          align-items: start;
          background: #ffffff;
        }

        .palma-nova-included-item {
          position: relative;
          text-align: center;
          padding: 0 6px;
          background: #ffffff;
          border: 0;
          box-shadow: none;
        }

        .palma-nova-check {
          position: absolute;
          top: 0;
          right: 18%;
          z-index: 3;
          color: #ff7a00;
          font-size: 26px;
          line-height: 1;
          font-weight: 900;
          background: transparent;
          text-shadow: 0 8px 22px rgba(255, 122, 0, 0.22);
        }

        .palma-nova-included-image-wrap {
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

        .palma-nova-included-image {
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

        .palma-nova-included-item:hover .palma-nova-included-image {
          transform: translateY(-4px) scale(1.035);
          filter: brightness(1.1) contrast(1.1);
        }

        .palma-nova-included-item strong {
          display: block;
          margin-top: 13px;
          color: #15141c;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1.12;
        }

        .palma-nova-included-item p {
          max-width: 180px;
          margin: 8px auto 0;
          color: #6b6974;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.45;
        }

        .palma-nova-components-section {
          position: relative;
          background: #ffffff;
          overflow: hidden;
        }

        .palma-nova-components-section.stats {
          background: #fbfbfd;
        }

        .palma-nova-content-section {
          padding: 96px clamp(18px, 4vw, 56px);
          background: #ffffff;
        }

        .palma-nova-content-grid {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: clamp(28px, 5vw, 70px);
          align-items: start;
        }

        .palma-nova-content-grid p,
        .palma-nova-how-grid p,
        .palma-nova-seo-text-inner p,
        .palma-nova-faq-list p,
        .palma-nova-final-cta p {
          color: #666574;
          font-size: 17px;
          line-height: 1.78;
          letter-spacing: -0.015em;
          font-weight: 500;
        }

        .palma-nova-local-box {
          padding: 30px;
          border-radius: 34px;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 122, 0, 0.18),
              transparent 36%
            ),
            #f7f7fb;
          border: 1px solid rgba(17, 17, 22, 0.06);
          box-shadow: 0 26px 70px rgba(17, 17, 22, 0.08);
        }

        .palma-nova-local-box h3 {
          margin: 0 0 18px;
          color: #15141c;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.05em;
        }

        .palma-nova-keywords-list {
          display: grid;
          gap: 10px;
        }

        .palma-nova-keywords-list span {
          display: block;
          border-radius: 16px;
          background: #ffffff;
          padding: 13px 14px;
          color: #4d4b55;
          font-size: 13px;
          font-weight: 800;
          border: 1px solid rgba(17, 17, 22, 0.06);
        }

        .palma-nova-how-section {
          padding: 96px clamp(18px, 4vw, 56px);
          background:
            radial-gradient(
              circle at 15% 0%,
              rgba(255, 122, 0, 0.13),
              transparent 34%
            ),
            #fbfbfd;
        }

        .palma-nova-how-inner {
          max-width: 1160px;
          margin: 0 auto;
          text-align: center;
        }

        .palma-nova-how-grid {
          margin-top: 36px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          text-align: left;
        }

        .palma-nova-how-grid div {
          padding: 28px;
          border-radius: 32px;
          background: #ffffff;
          border: 1px solid rgba(17, 17, 22, 0.07);
          box-shadow: 0 22px 60px rgba(17, 17, 22, 0.06);
        }

        .palma-nova-how-grid span {
          display: inline-flex;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #111116;
          color: #ff7a00;
          font-size: 15px;
          font-weight: 900;
        }

        .palma-nova-how-grid h3 {
          margin: 20px 0 0;
          color: #15141c;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: -0.055em;
        }

        .palma-nova-how-grid p {
          margin-bottom: 0;
          font-size: 15.5px;
        }

        .palma-nova-bottom-cta {
          margin-top: 34px;
        }

        .palma-nova-seo-text-section {
          padding: 96px clamp(18px, 4vw, 56px);
          background: #ffffff;
        }

        .palma-nova-seo-text-inner {
          max-width: 940px;
          margin: 0 auto;
          text-align: center;
        }

        .palma-nova-keyword-cloud {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .palma-nova-keyword-cloud span {
          display: inline-flex;
          padding: 10px 14px;
          border-radius: 999px;
          background: #f4f4f8;
          color: #4d4b55;
          font-size: 12px;
          font-weight: 800;
          border: 1px solid rgba(17, 17, 22, 0.06);
        }

        .palma-nova-location-section {
          background: #fbfbfd;
          overflow: hidden;
        }

        .palma-nova-faq-section {
          padding: 92px clamp(18px, 4vw, 56px) 110px;
          background: #ffffff;
        }

        .palma-nova-faq-inner {
          max-width: 920px;
          margin: 0 auto;
        }

        .palma-nova-faq-list {
          margin-top: 34px;
          display: grid;
          gap: 14px;
        }

        .palma-nova-faq-list details {
          border-radius: 24px;
          background: #f7f7fb;
          border: 1px solid rgba(17, 17, 22, 0.06);
          padding: 20px 22px;
        }

        .palma-nova-faq-list summary {
          cursor: pointer;
          color: #15141c;
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .palma-nova-faq-list p {
          margin-bottom: 0;
        }

        .palma-nova-final-cta {
          margin-top: 34px;
          padding: 32px;
          border-radius: 34px;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(255, 179, 71, 0.28),
              transparent 38%
            ),
            linear-gradient(135deg, #111116 0%, #242128 100%);
          color: #ffffff;
          text-align: center;
          box-shadow: 0 28px 80px rgba(17, 17, 22, 0.18);
        }

        .palma-nova-final-cta h3 {
          margin: 0;
          color: #ffffff;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.06em;
        }

        .palma-nova-final-cta p {
          margin: 10px auto 22px;
          max-width: 560px;
          color: rgba(255, 255, 255, 0.72);
        }

        .palma-nova-final-cta a {
          background: #ff7a00;
          color: #111116;
        }

        .palma-nova-final-cta a:hover {
          background: #ffffff;
          color: #111116;
        }

        .palma-nova-footer {
          background: #000000;
          color: #ffffff;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .palma-nova-footer-inner {
          max-width: 1480px;
          min-height: 118px;
          margin: 0 auto;
          padding: 24px clamp(18px, 4vw, 56px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .palma-nova-footer-brand {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .palma-nova-footer-logo {
          width: auto;
          height: 42px;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.55));
        }

        .palma-nova-footer-brand p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .palma-nova-footer-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .palma-nova-footer-actions a {
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

        .palma-nova-footer-actions a:hover {
          color: #ff7a00;
          transform: translateY(-1px);
        }

        @media (max-width: 1120px) {
          .palma-nova-included-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            row-gap: 42px;
          }
        }

        @media (max-width: 1080px) {
          .palma-nova-hero-grid {
            grid-template-columns: 1fr;
          }

          .palma-nova-hero-copy {
            text-align: center;
          }

          .palma-nova-topline {
            justify-content: center;
          }

          .palma-nova-hero-copy h1,
          .palma-nova-hero-text {
            margin-left: auto;
            margin-right: auto;
          }

          .palma-nova-hero-actions {
            justify-content: center;
          }

          .palma-nova-hero-visual {
            max-width: 620px;
            margin: 0 auto;
            min-height: 820px;
          }

          .palma-nova-visual-stack {
            min-height: 820px;
          }

          .palma-nova-main-panel {
            right: 24px;
          }

          .palma-nova-content-grid {
            grid-template-columns: 1fr;
          }

          .palma-nova-how-grid,
          .palma-nova-intent-inner {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .palma-nova-seo-page {
            padding-top: 64px;
          }

          .palma-nova-nav-inner {
            height: 64px;
            padding: 0 14px;
          }

          .palma-nova-logo {
            height: 42px;
          }

          .palma-nova-book-button {
            min-width: 136px;
            height: 40px;
            font-size: 10px;
            letter-spacing: 0.12em;
          }

          .scroll-arrows {
            font-size: 24px;
            gap: 4px;
          }

          .scroll-arrows-left {
            right: calc(50% + 88px);
          }

          .scroll-arrows-right {
            left: calc(50% + 88px);
          }

          .palma-nova-contact-button {
            display: none;
          }

          .palma-nova-language-current {
            min-width: 76px;
            height: 38px;
            padding: 0 10px;
            font-size: 10px;
          }

          .palma-nova-language-menu {
            right: 0;
            width: 228px;
          }

          .palma-nova-footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .palma-nova-footer-brand {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }

        @media (max-width: 680px) {
          .palma-nova-hero-section {
            padding-top: 46px;
          }

          .palma-nova-hero-copy h1 {
            font-size: 42px;
            letter-spacing: -0.06em;
          }

          .palma-nova-hero-text {
            font-size: 15.5px;
            line-height: 1.65;
          }

          .palma-nova-topline {
            gap: 8px;
          }

          .palma-nova-kicker,
          .palma-nova-top-map-button {
            min-height: 38px;
            font-size: 9.5px;
            letter-spacing: 0.1em;
          }

          .palma-nova-hero-visual {
            min-height: 690px;
          }

          .palma-nova-visual-stack {
            min-height: 690px;
          }

          .palma-nova-main-panel {
            width: 80%;
            height: 560px;
            top: 18px;
            right: 0;
            border-radius: 28px;
          }

          .palma-nova-photo-card-top {
            width: 74%;
            height: 240px;
            top: 54px;
            border-radius: 22px;
          }

          .palma-nova-photo-card-bottom {
            width: 80%;
            height: 230px;
            top: 334px;
            left: 28px;
            border-radius: 22px;
          }

          .palma-nova-price-card {
            right: 18px;
            bottom: 40px;
            width: 88px;
            height: 88px;
          }

          .palma-nova-price-card strong {
            font-size: 26px;
          }

          .palma-nova-included-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            row-gap: 38px;
          }

          .palma-nova-content-section,
          .palma-nova-how-section,
          .palma-nova-seo-text-section,
          .palma-nova-faq-section {
            padding-top: 68px;
            padding-bottom: 68px;
          }

          .palma-nova-section-heading h2,
          .palma-nova-content-grid h2,
          .palma-nova-how-inner h2,
          .palma-nova-seo-text-inner h2,
          .palma-nova-faq-inner h2 {
            font-size: 36px;
            letter-spacing: -0.058em;
          }
        }

        @media (max-width: 520px) {
          .palma-nova-logo {
            height: 34px;
          }

          .palma-nova-book-button {
            min-width: 118px;
            height: 38px;
            font-size: 9px;
            letter-spacing: 0.1em;
          }

          .scroll-arrows {
            display: none;
          }

          .palma-nova-language-current {
            min-width: 64px;
            gap: 5px;
          }

          .palma-nova-language-current span:nth-child(2) {
            display: none;
          }

          .palma-nova-hero-section {
            padding-left: 16px;
            padding-right: 16px;
          }

          .palma-nova-primary-cta,
          .palma-nova-secondary-cta {
            width: 100%;
          }

          .palma-nova-included-grid {
            grid-template-columns: 1fr;
          }

          .palma-nova-hero-visual {
            min-height: 620px;
          }

          .palma-nova-visual-stack {
            min-height: 620px;
          }

          .palma-nova-main-panel {
            width: 84%;
            height: 500px;
          }

          .palma-nova-photo-card-top {
            width: 76%;
            height: 210px;
          }

          .palma-nova-photo-card-bottom {
            width: 84%;
            height: 210px;
            top: 306px;
            left: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .palma-nova-book-button,
          .palma-nova-primary-cta,
          .palma-nova-bottom-cta,
          .palma-nova-final-cta a,
          .scroll-arrows span,
          .hide-on-scroll,
          .scroll-arrows {
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