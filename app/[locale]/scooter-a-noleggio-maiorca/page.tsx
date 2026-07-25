// app/[locale]/scooter-a-noleggio-maiorca/page.tsx

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
    title: "Due caschi",
    text: "Inclusi per conducente e passeggero.",
  },
  {
    image: "/images/ex1.jpg",
    title: "Bauletto da 50 litri",
    text: "Pratico per borsa, casco o accessori da spiaggia.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Portacellulare impermeabile",
    text: "Ideale per la navigazione a Maiorca.",
  },
  {
    image: "/images/ex3.png",
    title: "Lucchetto",
    text: "Per soste sicure in hotel, in spiaggia o al ristorante.",
  },
  {
    image: "/images/ex5.png",
    title: "Assicurazione",
    text: "L’assicurazione di base è inclusa nel prezzo del noleggio.",
  },
];

const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/1HJFHyvzDNcrgrc99";

function normalizeLocale(locale: string | undefined): Locale {
  if (SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }

  return "it";
}

async function getPageLocale(params: PageProps["params"]) {
  const resolvedParams = await params;
  return normalizeLocale(resolvedParams?.locale);
}

function getLanguageHref(languageCode: Locale) {
  if (languageCode === "it") {
    return "/it/scooter-a-noleggio-maiorca";
  }

  if (languageCode === "de") {
    return "/de/rollerverleih-mallorca";
  }

  return `/${languageCode}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const isItalianPage = locale === "it";

  return {
    title:
      "Scooter a noleggio Maiorca | Scooter 125cc da 39€ | NEXA Rentals Magaluf",
    description:
      "Scooter a noleggio a Maiorca: prenota online uno scooter 125cc con NEXA Rentals e ritiralo direttamente a Magaluf. Ideale per Magaluf, Palmanova, Santa Ponsa, Palma, Paguera e il sud-ovest di Maiorca. Due caschi, bauletto da 50 litri, lucchetto, portacellulare impermeabile e chilometri illimitati inclusi.",
    keywords: [
      "scooter a noleggio Maiorca",
      "noleggio scooter Maiorca",
      "affitto scooter Maiorca",
      "noleggio motorino Maiorca",
      "scooter rental Maiorca",
      "noleggio scooter 125cc Maiorca",
      "affitto scooter 125cc Maiorca",
      "scooter Maiorca da 39 euro",
      "noleggio scooter economico Maiorca",
      "affitto scooter economico Maiorca",
      "prenotare scooter online Maiorca",
      "scooter online Maiorca",
      "scooter a noleggio Magaluf",
      "noleggio scooter Magaluf",
      "affitto scooter Magaluf",
      "scooter 125cc Magaluf",
      "scooter a noleggio Palmanova",
      "noleggio scooter Palmanova",
      "noleggio scooter Santa Ponsa",
      "noleggio scooter Palma",
      "noleggio scooter Paguera",
      "noleggio scooter Calvià",
      "noleggio scooter sud-ovest Maiorca",
      "NEXA Rentals Maiorca",
      "NEXA Rentals Magaluf",
    ],
    alternates: {
      canonical: "https://www.nexarentals.es/it/scooter-a-noleggio-maiorca",
    },
    openGraph: {
      title: "Scooter a noleggio Maiorca | NEXA Rentals",
      description:
        "Prenota online uno scooter 125cc, ritiralo a Magaluf ed esplora Maiorca in libertà. Due caschi, bauletto da 50 litri, lucchetto, portacellulare impermeabile e chilometri illimitati inclusi.",
      url: "https://www.nexarentals.es/it/scooter-a-noleggio-maiorca",
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "Scooter a noleggio a Maiorca con NEXA Rentals",
        },
      ],
      locale: "it_IT",
      type: "website",
    },
    robots: {
      index: isItalianPage,
      follow: true,
      googleBot: {
        index: isItalianPage,
        follow: true,
      },
    },
  };
}

export default async function ScooterANoleggioMaiorcaPage({
  params,
}: PageProps) {
  const locale = await getPageLocale(params);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[4];

  const homeHref = `/${locale}`;
  const bookHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Dove posso trovare uno scooter a noleggio a Maiorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NEXA Rentals offre scooter a noleggio a Magaluf, Maiorca. Puoi prenotare online il tuo scooter 125cc e ritirarlo direttamente presso NEXA Rentals a Magaluf.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto costa noleggiare uno scooter a Maiorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Con NEXA Rentals il noleggio per mezza giornata parte da 39€. Il noleggio per 24 ore costa 49€. In base alla stagione e alla durata possono essere disponibili tariffe per più giorni.",
        },
      },
      {
        "@type": "Question",
        name: "Cosa è incluso nel noleggio dello scooter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Con NEXA Rentals sono inclusi due caschi, bauletto da 50 litri, lucchetto, portacellulare impermeabile, chilometri illimitati e assicurazione di base.",
        },
      },
      {
        "@type": "Question",
        name: "Quale patente serve per guidare uno scooter 125cc a Maiorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sono accettate le patenti A, A1 e A2. Puoi guidare uno scooter 125cc anche con la patente B, purché sia valida da almeno 3 anni.",
        },
      },
      {
        "@type": "Question",
        name: "È richiesta una cauzione per noleggiare uno scooter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sì. La cauzione è di 150€ per scooter e viene restituita dopo la corretta riconsegna del veicolo.",
        },
      },
      {
        "@type": "Question",
        name: "NEXA Rentals offre la consegna degli scooter a Maiorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Al momento non offriamo un servizio di consegna. Il ritiro e la riconsegna avvengono direttamente presso NEXA Rentals a Magaluf.",
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
      "Maiorca",
      "Magaluf",
      "Palmanova",
      "Palma Nova",
      "Santa Ponsa",
      "Palma",
      "Paguera",
      "Camp de Mar",
      "Portals Nous",
      "Cala Vinyes",
      "Calvià",
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
        name: "Noleggio scooter 125cc per mezza giornata a Maiorca",
        price: "39",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        areaServed: "Maiorca",
      },
      {
        "@type": "Offer",
        name: "Noleggio scooter 125cc per 24 ore a Maiorca",
        price: "49",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        areaServed: "Maiorca",
      },
    ],
  };

  return (
    <main className={`${pageFont.variable} nexa-seo-page`}>
      <Script
        id="nexa-seo-navbar-scroll-scooter-a-noleggio-maiorca"
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

      <Script
        id="nexa-schema-faq-scooter-a-noleggio-maiorca"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <Script
        id="nexa-schema-business-scooter-a-noleggio-maiorca"
        type="application/ld+json"
        strategy="beforeInteractive"
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
            <span>Prenota ora</span>
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
              Contatti
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
                Scooter a noleggio Maiorca · Ritiro a Magaluf
              </span>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="nexa-top-map-button"
              >
                Apri indicazioni
              </a>
            </div>

            <h1>
              Scooter a noleggio a Maiorca: prenota online il tuo 125cc e parti
              in libertà.
            </h1>

            <p className="nexa-hero-text">
              Cerchi uno <strong>scooter a noleggio a Maiorca</strong>, un{" "}
              <strong>noleggio scooter a Maiorca</strong> o un{" "}
              <strong>noleggio motorino a Maiorca</strong>? Con NEXA Rentals
              prenoti online il tuo scooter 125cc, paghi in modo sicuro e lo
              ritiri direttamente a Magaluf.
            </p>

            <p className="nexa-hero-text small">
              Ideale per Magaluf, Palmanova, Santa Ponsa, Palma, Paguera, Camp
              de Mar, Portals Nous, Cala Vinyes e il sud-ovest di Maiorca. Da
              39€ per mezza giornata e 49€ per 24 ore, con due caschi, bauletto
              da 50 litri, lucchetto, portacellulare impermeabile e chilometri
              illimitati inclusi.
            </p>

            <div className="nexa-hero-actions">
              <Link href={bookHref} className="nexa-primary-cta">
                Prenota ora lo scooter
              </Link>

              <Link href={contactHref} className="nexa-secondary-cta">
                Domande? Contattaci
              </Link>
            </div>

            <div className="nexa-online-note">
              Prenotazione online su{" "}
              <Link href={bookHref}>www.nexarentals.es/it/home</Link>
            </div>

            <div className="nexa-hero-points">
              <div>
                <strong>da 39€</strong>
                <span>Noleggio per mezza giornata</span>
              </div>

              <div>
                <strong>125cc</strong>
                <span>Scooter Piaggio e SYM</span>
              </div>

              <div>
                <strong>Magaluf</strong>
                <span>Ritiro presso l’ufficio</span>
              </div>
            </div>
          </div>

          <div className="nexa-hero-visual">
            <div className="nexa-visual-stack">
              <div className="nexa-orange-shape" />

              <div className="nexa-photo-card nexa-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Scooter a noleggio a Maiorca con NEXA Rentals"
                  width={900}
                  height={620}
                  priority
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-photo-card nexa-photo-card-bottom">
                <Image
                  src="/images/piaggio-liberty-v4.0.png"
                  alt="Scooter 125cc a noleggio a Maiorca"
                  width={900}
                  height={720}
                  className="nexa-hero-image nexa-hero-image-contain"
                />
              </div>

              <div className="nexa-floating-price">
                <span>da</span>
                <strong>39€</strong>
                <small>tutto incluso</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-trust-section">
        <p>
          Scooter a noleggio per Maiorca, Magaluf, Palmanova, Santa Ponsa e
          Palma
        </p>

        <div className="nexa-trust-logos">
          <span>Scooter a noleggio Maiorca</span>
          <span>Scooter 125cc</span>
          <span>da 39€</span>
          <span>tutto incluso</span>
          <span>Magaluf</span>
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
              Scooter a noleggio Maiorca
            </span>

            <h2>
              Il modo semplice per noleggiare uno scooter durante la tua
              vacanza a Maiorca.
            </h2>

            <p>
              Con uno scooter 125cc puoi vivere Maiorca con maggiore libertà:
              spiagge, hotel, ristoranti, porti, punti panoramici e piccole
              strade costiere diventano molto più semplici da raggiungere. NEXA
              Rentals è pensata proprio per questo: prenoti online, paghi
              online, ritiri lo scooter a Magaluf e parti subito.
            </p>

            <p>
              Il nostro servizio di noleggio è particolarmente pratico per chi
              soggiorna a Magaluf, Palmanova, Santa Ponsa, Portals Nous, Cala
              Vinyes, Paguera, Palma e nel sud-ovest di Maiorca. Al momento non
              offriamo un servizio di consegna. Il ritiro e la riconsegna
              avvengono direttamente presso NEXA Rentals a Magaluf, così la
              consegna del veicolo, il controllo dei documenti e la
              riconsegna vengono gestiti in modo chiaro e sicuro.
            </p>
          </article>

          <aside className="nexa-info-box">
            <h3>Tutto incluso</h3>

            <ul>
              <li>Scooter 125cc per Maiorca</li>
              <li>Prenotazione e pagamento online</li>
              <li>Due caschi inclusi</li>
              <li>
                Bauletto da 50 litri per borsa, casco o accessori da spiaggia
              </li>
              <li>Portacellulare impermeabile</li>
              <li>Lucchetto di sicurezza incluso</li>
              <li>Chilometri illimitati</li>
              <li>Assicurazione di base inclusa</li>
              <li>Ritiro e riconsegna presso NEXA Rentals a Magaluf</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="nexa-price-section">
        <div className="nexa-price-inner">
          <span className="nexa-section-label">Prezzi</span>

          <h2>Prezzi chiari per il tuo scooter a Maiorca.</h2>

          <div className="nexa-price-grid">
            <div className="nexa-price-card">
              <span className="nexa-price-badge">Mezza giornata</span>
              <h3>Stesso giorno</h3>
              <p>Perfetto per la spiaggia, la città o un breve itinerario.</p>
              <strong>39€</strong>
              <Link href={bookHref}>Prenota mezza giornata</Link>
            </div>

            <div className="nexa-price-card featured">
              <span className="nexa-price-badge">Più scelto</span>
              <h3>24 ore</h3>
              <p>Ideale per esplorare Maiorca con la massima libertà.</p>
              <strong>49€</strong>
              <Link href={bookHref}>Prenota 24 ore</Link>
            </div>

            <div className="nexa-price-card">
              <span className="nexa-price-badge">Cauzione</span>
              <h3>Deposito</h3>
              <p>Viene restituito dopo la corretta riconsegna dello scooter.</p>
              <strong>150€</strong>
              <Link href={bookHref}>Controlla disponibilità</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-how-section">
        <div className="nexa-how-inner">
          <span className="nexa-section-label">Come funziona</span>

          <h2>
            Noleggia uno scooter a Maiorca in tre semplici passaggi.
          </h2>

          <div className="nexa-how-grid">
            <div>
              <span>01</span>
              <h3>Scegli online</h3>
              <p>
                Seleziona il tuo scooter 125cc, la data e la durata del
                noleggio. La prenotazione è veloce, chiara e perfetta per la tua
                vacanza a Maiorca.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Conferma online</h3>
              <p>
                Paga online il prezzo del noleggio e riserva il tuo scooter per
                Magaluf, Palmanova, Santa Ponsa, Palma o il tuo itinerario
                sull’isola.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Ritira a Magaluf</h3>
              <p>
                Presentati da NEXA Rentals con la patente originale e una carta
                d’identità o un passaporto. Ti spiegheremo tutto e potrai
                partire subito.
              </p>
            </div>
          </div>

          <Link href={bookHref} className="nexa-bottom-cta">
            Prenota ora lo scooter
          </Link>
        </div>
      </section>

      <section className="nexa-seo-text-section">
        <div className="nexa-seo-text-inner">
          <span className="nexa-section-label">
            Noleggio scooter Maiorca
          </span>

          <h2>
            Per chi vuole esplorare Maiorca in autonomia e senza dipendere dai
            taxi.
          </h2>

          <p>
            Quando cerchi “scooter a noleggio Maiorca”, “noleggio scooter
            Maiorca”, “affitto scooter Maiorca”, “noleggio motorino Maiorca” o
            “scooter 125cc Maiorca”, hai bisogno di una soluzione semplice:
            prenotazione online, pagamento sicuro e uno scooter 125cc per
            muoverti liberamente.
          </p>

          <p>
            Uno scooter è particolarmente pratico per gli spostamenti tra
            Magaluf, Palmanova, Santa Ponsa, Portals Nous, Cala Vinyes, Paguera,
            Palma, Camp de Mar e molte altre località di Maiorca. NEXA Rentals
            offre una prenotazione online semplice e il ritiro a Magaluf. Al
            momento non offriamo un servizio di consegna.
          </p>

          <div className="nexa-keyword-cloud">
            <span>Scooter a noleggio Maiorca</span>
            <span>Noleggio scooter Maiorca</span>
            <span>Affitto scooter Maiorca</span>
            <span>Noleggio motorino Maiorca</span>
            <span>Scooter 125cc Maiorca</span>
            <span>Scooter economico Maiorca</span>
            <span>Noleggio scooter Magaluf</span>
            <span>NEXA Rentals Magaluf</span>
          </div>
        </div>
      </section>

      <section className="nexa-location-section">
        <LocationV3 />
      </section>

      <section className="nexa-faq-section">
        <div className="nexa-faq-inner">
          <span className="nexa-section-label">Domande frequenti</span>

          <h2>Domande sul noleggio scooter a Maiorca</h2>

          <div className="nexa-faq-list">
            <details>
              <summary>Dove si trova NEXA Rentals?</summary>
              <p>
                NEXA Rentals si trova a Magaluf, Maiorca: C. Galeón, 13, Loc
                57, 07181 Magaluf, Illes Balears, Spain.
              </p>
            </details>

            <details>
              <summary>Quanto costa noleggiare uno scooter a Maiorca?</summary>
              <p>
                Con NEXA Rentals il noleggio per mezza giornata parte da 39€.
                Il noleggio per 24 ore costa 49€. La cauzione è di 150€ per
                scooter e viene restituita dopo la corretta riconsegna.
              </p>
            </details>

            <details>
              <summary>Cosa è incluso nel prezzo?</summary>
              <p>
                Sono inclusi due caschi, bauletto da 50 litri, lucchetto,
                portacellulare impermeabile, chilometri illimitati e
                assicurazione di base.
              </p>
            </details>

            <details>
              <summary>
                Quale patente serve per guidare uno scooter 125cc?
              </summary>
              <p>
                Sono accettate le patenti A, A1 e A2. Puoi guidare uno scooter
                125cc anche con la patente B, purché sia valida da almeno 3
                anni. Patenti provvisorie e fogli rosa non sono accettati.
              </p>
            </details>

            <details>
              <summary>È disponibile la consegna a Maiorca?</summary>
              <p>
                Al momento non offriamo un servizio di consegna. Il ritiro e la
                riconsegna avvengono direttamente presso NEXA Rentals a
                Magaluf.
              </p>
            </details>
          </div>

          <div className="nexa-final-cta">
            <h3>Pronto a esplorare Maiorca?</h3>
            <p>
              Prenota online il tuo scooter 125cc e parti direttamente da NEXA
              Rentals a Magaluf.
            </p>
            <Link href={bookHref}>Prenota ora lo scooter</Link>
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
              NEXA Rentals · Noleggio scooter ed e-bike a Magaluf, Maiorca
            </p>
          </div>

          <div className="nexa-seo-footer-actions">
            <Link href={bookHref}>Prenota ora</Link>
            <Link href={contactHref}>Contatti</Link>
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
        .nexa-price-card a {
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
        .nexa-price-card a {
          padding: 0 26px;
          background: #111116;
          color: #ffffff;
          box-shadow: 0 18px 38px rgba(17, 17, 22, 0.2);
        }

        .nexa-primary-cta:hover,
        .nexa-bottom-cta:hover,
        .nexa-final-cta a:hover,
        .nexa-price-card a:hover {
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

        .nexa-hero-image-contain {
          object-fit: contain;
          padding: 18px;
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
        .nexa-location-section,
        .nexa-price-section {
          background: #fbfbfd;
        }

        .nexa-content-section,
        .nexa-how-section,
        .nexa-seo-text-section,
        .nexa-faq-section,
        .nexa-price-section {
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
        .nexa-faq-inner h2,
        .nexa-price-inner h2 {
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

        .nexa-price-inner,
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

        .nexa-price-grid {
          margin-top: 34px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .nexa-price-card {
          padding: 30px;
          border-radius: 34px;
          background: #ffffff;
          border: 1px solid rgba(17, 17, 22, 0.07);
          box-shadow: 0 22px 60px rgba(17, 17, 22, 0.06);
          text-align: left;
        }

        .nexa-price-card.featured {
          background: #111116;
          color: #ffffff;
        }

        .nexa-price-badge {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 122, 0, 0.12);
          color: #ff7a00;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .nexa-price-card h3 {
          margin: 18px 0 0;
          color: #15141c;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .nexa-price-card.featured h3 {
          color: #ffffff;
        }

        .nexa-price-card p {
          min-height: 56px;
          margin: 10px 0 18px;
          color: #666574;
          font-size: 15px;
          line-height: 1.55;
          font-weight: 600;
        }

        .nexa-price-card.featured p {
          color: rgba(255, 255, 255, 0.72);
        }

        .nexa-price-card strong {
          display: block;
          margin-bottom: 24px;
          color: #111116;
          font-size: 54px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.07em;
        }

        .nexa-price-card.featured strong {
          color: #ffffff;
        }

        .nexa-price-card a {
          width: 100%;
        }

        .nexa-price-card.featured a {
          background: #ff7a00;
          color: #111116;
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

          .nexa-price-card {
            text-align: center;
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
          .nexa-price-card a {
            width: 100%;
          }

          .nexa-fast-info-grid {
            grid-template-columns: 1fr;
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