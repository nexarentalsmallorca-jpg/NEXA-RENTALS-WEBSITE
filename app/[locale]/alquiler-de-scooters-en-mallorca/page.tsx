// app/[locale]/alquiler-de-scooters-en-mallorca/page.tsx

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
    title: "Dos cascos",
    text: "Incluidos para el conductor y el acompañante.",
  },
  {
    image: "/images/ex1.jpg",
    title: "Baúl de 50 litros",
    text: "Espacio práctico para un casco, una bolsa y objetos personales.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Soporte impermeable para móvil",
    text: "Ideal para orientarte por toda Mallorca.",
  },
  {
    image: "/images/ex3.png",
    title: "Candado de seguridad",
    text: "Para estacionar con más tranquilidad en la playa, el hotel o un restaurante.",
  },
  {
    image: "/images/ex5.png",
    title: "Seguro",
    text: "El seguro básico está incluido en el precio.",
  },
];

function normalizeLocale(locale: string | undefined): Locale {
  if (SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }

  return "es";
}

async function getPageLocale(params: PageProps["params"]) {
  const resolvedParams = await params;
  return normalizeLocale(resolvedParams?.locale);
}

function getLanguageHref(languageCode: Locale) {
  if (languageCode === "es") {
    return "/es/alquiler-de-scooters-en-mallorca";
  }

  return `/${languageCode}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const isSpanishPage = locale === "es";

  return {
    title:
      "Alquiler de scooters en Mallorca | 125 cc desde 39 € | NEXA Rentals",
    description:
      "Alquiler de scooters en Mallorca con NEXA Rentals. Reserva online scooters de 125 cc desde 39 €, recógelos en Magaluf y descubre Palmanova, Santa Ponsa, Paguera, Portals Nous y Calvià con libertad.",
    keywords: [
      "alquiler de scooters en Mallorca",
      "alquiler scooter Mallorca",
      "alquiler de scooters Mallorca",
      "alquila scooter Mallorca",
      "alquiler moto scooter Mallorca",
      "scooter 125cc Mallorca",
      "scooter de alquiler Mallorca",
      "alquiler scooter Magaluf",
      "alquiler scooter Palmanova",
      "alquiler scooter Santa Ponsa",
      "alquiler scooter barato Mallorca",
      "reservar scooter Mallorca",
      "alquiler scooter Mallorca online",
      "NEXA Rentals Magaluf",
    ],
    alternates: {
      canonical: "https://www.nexarentals.es/es/alquiler-de-scooters-en-mallorca",
    },
    openGraph: {
      title: "Alquiler de scooters en Mallorca | NEXA Rentals Magaluf",
      description:
        "Reserva scooters de 125 cc en Mallorca desde 39 €. Reserva online y recógelos en NEXA Rentals, Magaluf.",
      url: "https://www.nexarentals.es/es/alquiler-de-scooters-en-mallorca",
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "Alquiler de scooters en Mallorca con NEXA Rentals en Magaluf",
        },
      ],
      locale: "es_ES",
      type: "website",
    },
    robots: {
      index: isSpanishPage,
      follow: true,
      googleBot: {
        index: isSpanishPage,
        follow: true,
      },
    },
  };
}

export default async function ScooterRentalsInMallorcaPage({
  params,
}: PageProps) {
  const locale = await getPageLocale(params);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) ||
    LANGUAGES.find((language) => language.code === "es")!;

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
        name: "¿Dónde puedo alquilar scooters en Mallorca con NEXA Rentals?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Puedes reservar online un scooter de 125 cc y recogerlo directamente en NEXA Rentals, C. Galeón, 13, Loc 57, 07181 Magaluf. La recogida y la devolución habituales se realizan en nuestra oficina de Magaluf.",
        },
      },
      {
        "@type": "Question",
        name: "¿Puedo reservar y pagar el scooter online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí. Con NEXA Rentals puedes reservar tu scooter y pagar online el precio del alquiler. De este modo, el vehículo queda reservado para las fechas seleccionadas.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué permiso de conducir necesito para un scooter de 125 cc en Mallorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Aceptamos permisos de moto A, A1 y A2. También puedes conducir un scooter de 125 cc con un permiso de coche de categoría B que tenga al menos 3 años de antigüedad. No se aceptan permisos provisionales ni de aprendizaje.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué incluye alquilar scooters en Mallorca?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Se incluyen dos cascos, un baúl de 50 litros, candado de seguridad, soporte impermeable para móvil, kilómetros ilimitados y seguro básico.",
        },
      },
      {
        "@type": "Question",
        name: "¿Hay servicio de entrega de scooters en hoteles?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. La recogida y la devolución habituales se realizan directamente en NEXA Rentals, Magaluf. Actualmente no ofrecemos servicio de entrega de scooters.",
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
      "Magaluf",
      "Palmanova",
      "Palma Nova",
      "Santa Ponsa",
      "Portals Nous",
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
      name: "Alquiler de scooters de 125 cc en Mallorca",
      price: "39",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      areaServed: "Mallorca",
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
            <span>Reservar ahora</span>
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
              Contacto
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
            <h1>Alquila scooters en Mallorca directamente desde Magaluf.</h1>

            <p className="nexa-hero-text">
              ¿Quieres <strong>alquilar scooters en Mallorca</strong>, buscas{" "}
              <strong>alquiler de scooter en Magaluf</strong> o deseas reservar
              un <strong>scooter de 125 cc en Mallorca</strong>? Con NEXA
              Rentals puedes reservar online, pagar de forma segura y recoger
              tu scooter directamente en nuestra oficina de Magaluf.
            </p>

            <p className="nexa-hero-text small">
              Ideal para Magaluf, Palmanova, Palma Nova, Santa Ponsa, Portals
              Nous y Calvià, tanto si planeas días de playa y visitas a miradores
              o beach clubs como excursiones sin depender de taxis ni autobuses.
            </p>

            <div className="nexa-hero-actions">
              <Link href={bookHref} className="nexa-primary-cta">
                Reserva tu scooter
              </Link>

              <Link href={contactHref} className="nexa-secondary-cta">
                ¿Tienes dudas? Contáctanos
              </Link>
            </div>

            <div className="nexa-online-note">
              Reserva online en{" "}
              <a href={externalBookingHref} target="_blank" rel="noreferrer">
                www.nexarentals.es/es/home
              </a>
            </div>

            <div className="nexa-hero-points">
              <div>
                <strong>desde 39 €</strong>
                <span>Alquiler de scooter por media jornada</span>
              </div>

              <div>
                <strong>125cc</strong>
                <span>Scooters Piaggio y SYM</span>
              </div>

              <div>
                <strong>Magaluf</strong>
                <span>Recogida en nuestra oficina de alquiler</span>
              </div>
            </div>
          </div>

          <div className="nexa-hero-visual">
            <div className="nexa-visual-stack">
              <div className="nexa-orange-shape" />

              <div className="nexa-photo-card nexa-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Alquiler de scooters en Mallorca con NEXA Rentals en Magaluf"
                  width={900}
                  height={620}
                  priority
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-photo-card nexa-photo-card-bottom">
                <Image
                  src="/images/scooterperson2.jpg"
                  alt="Alquiler de scooter de 125 cc en Mallorca con NEXA Rentals"
                  width={900}
                  height={720}
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-floating-price">
                <span>desde</span>
                <strong>€39</strong>
                <small>todo incluido</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-trust-section">
        <p>Una forma sencilla de descubrir Mallorca con libertad</p>

        <div className="nexa-trust-logos">
          <span>Alquiler de scooters en Mallorca</span>
          <span>Magaluf</span>
          <span>Palmanova</span>
          <span>Santa Ponsa</span>
          <span>Scooters de 125 cc</span>
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
            <span className="nexa-section-label">¿Por qué NEXA Rentals?</span>

            <h2>La forma sencilla de alquilar scooters en Mallorca.</h2>

            <p>
              Muchos viajeros esperan a llegar de vacaciones para buscar
              alquiler de scooters en Mallorca, Magaluf o Palmanova. Con NEXA
              Rentals puedes organizarlo todo con antelación: reserva online tu
              scooter de 125 cc, paga de forma segura y recógelo directamente
              en nuestra oficina de Magaluf. Así ahorras tiempo y te aseguras de
              que el vehículo esté reservado para ti.
            </p>

            <p>
              Nuestros scooters son ideales para trayectos cortos, días de
              playa y excursiones a Magaluf, Palmanova, Palma Nova, Portals
              Nous, Santa Ponsa y Calvià. No tendrás que esperar taxis,
              consultar horarios de autobús ni soportar largas esperas. Recoge
              tu scooter y descubre Mallorca a tu propio ritmo.
            </p>
          </article>

          <aside className="nexa-info-box">
            <h3>Todo incluido</h3>

            <ul>
              <li>Scooter de 125 cc para descubrir Mallorca</li>
              <li>Reserva online y pago seguro por internet</li>
              <li>Dos cascos incluidos</li>
              <li>Baúl de 50 litros para un casco, una bolsa o accesorios</li>
              <li>Soporte impermeable para móvil</li>
              <li>Candado de seguridad incluido</li>
              <li>Kilómetros ilimitados</li>
              <li>Seguro básico incluido</li>
              <li>Recogida y devolución en NEXA Rentals, Magaluf</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="nexa-how-section">
        <div className="nexa-how-inner">
          <span className="nexa-section-label">Cómo funciona</span>

          <h2>Alquila scooters en Mallorca en tres sencillos pasos.</h2>

          <div className="nexa-how-grid">
            <div>
              <span>01</span>
              <h3>Elige tu scooter online</h3>
              <p>
                Selecciona tu scooter de 125 cc, la fecha y la duración del
                alquiler. El proceso de reserva es rápido, claro y está pensado
                para quienes visitan Mallorca.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>Paga online</h3>
              <p>
                Paga online el precio del alquiler y reserva tu scooter para las
                fechas seleccionadas. Recibirás automáticamente la confirmación
                de tu reserva.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Recógelo en Magaluf</h3>
              <p>
                Acude a NEXA Rentals con tu permiso de conducir original y tu
                pasaporte o documento de identidad. Te explicaremos todo antes
                de que comiences tu ruta.
              </p>
            </div>
          </div>

          <Link href={bookHref} className="nexa-bottom-cta">
            Reserva tus scooters en Mallorca
          </Link>
        </div>
      </section>

      <section className="nexa-seo-text-section">
        <div className="nexa-seo-text-inner">
          <span className="nexa-section-label">Alquiler de scooters en Mallorca</span>

          <h2>
            Para viajeros que quieren descubrir Mallorca con libertad, sencillez
            y comodidad.
          </h2>

          <p>
            Si buscas “alquiler de scooters en Mallorca”, “alquiler scooter Mallorca”,
            “alquiler de scooters Mallorca” o “scooter 125 cc Mallorca”,
            necesitas una solución sencilla: información clara, reserva online,
            pago seguro y un punto de recogida fácil de encontrar. NEXA Rentals
            está en Magaluf, en C. Galeón, 13, Loc 57.
          </p>

          <p>
            Nuestro servicio resulta especialmente cómodo para quienes se
            alojan en Magaluf, Palmanova, Palma Nova, Torrenova, Santa Ponsa,
            Portals Nous o Calvià. Con un scooter puedes llegar a playas,
            restaurantes, beach clubs, miradores y destinos cercanos sin
            depender siempre de un taxi. La recogida y la devolución habituales
            se realizan en nuestra oficina de Magaluf. Actualmente no ofrecemos
            servicio de entrega de scooters.
          </p>

          <div className="nexa-keyword-cloud">
            <span>Alquiler de scooters en Mallorca</span>
            <span>Alquiler scooter Mallorca</span>
            <span>Alquiler de scooters Mallorca</span>
            <span>Scooter 125 cc Mallorca</span>
            <span>Alquiler moto scooter Mallorca</span>
            <span>Alquiler scooter Magaluf</span>
            <span>Reservar scooter Mallorca</span>
            <span>NEXA Rentals Magaluf</span>
          </div>
        </div>
      </section>

      <section className="nexa-location-section">
        <LocationV3 />
      </section>

      <section className="nexa-faq-section">
        <div className="nexa-faq-inner">
          <span className="nexa-section-label">Preguntas frecuentes</span>

          <h2>Preguntas sobre cómo alquilar scooters en Mallorca</h2>

          <div className="nexa-faq-list">
            <details>
              <summary>
                ¿Qué permiso de conducir necesito para un scooter de 125 cc?
              </summary>
              <p>
                Aceptamos permisos de moto A, A1 y A2. También puedes conducir
                un scooter de 125 cc con un permiso de coche de categoría B que
                tenga al menos 3 años de antigüedad. No se aceptan permisos
                provisionales ni de aprendizaje.
              </p>
            </details>

            <details>
              <summary>¿Dónde recojo y devuelvo el scooter?</summary>
              <p>
                La recogida y la devolución habituales se realizan directamente
                en NEXA Rentals, C. Galeón, 13, Loc 57, 07181 Magaluf.
              </p>
            </details>

            <details>
              <summary>¿Puedo reservar y pagar online?</summary>
              <p>
                Sí. Puedes elegir tu scooter, las fechas y la duración del
                alquiler directamente online. El pago por internet confirma tu
                reserva para las fechas seleccionadas.
              </p>
            </details>

            <details>
              <summary>¿Qué está incluido en el precio?</summary>
              <p>
                Se incluyen dos cascos, un baúl de 50 litros, candado de
                seguridad, soporte impermeable para móvil, kilómetros
                ilimitados y seguro básico.
              </p>
            </details>

            <details>
              <summary>¿Hay servicio de entrega en hoteles?</summary>
              <p>
                No. La recogida y la devolución habituales se realizan
                directamente en NEXA Rentals, Magaluf. Actualmente no ofrecemos
                servicio de entrega de scooters.
              </p>
            </details>
          </div>

          <div className="nexa-final-cta">
            <h3>¿Listo para descubrir Mallorca?</h3>
            <p>
              Reserva online tu scooter de 125 cc y comienza tu ruta
              directamente desde Magaluf.
            </p>
            <Link href={bookHref}>Reserva tu scooter ahora</Link>
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
              NEXA Rentals · Alquiler de scooters y bicicletas eléctricas en
              Magaluf, Mallorca
            </p>
          </div>

          <div className="nexa-seo-footer-actions">
            <Link href={bookHref}>Reservar ahora</Link>
            <Link href={contactHref}>Contacto</Link>
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
            radial-gradient(
              circle at 100% 0%,
              rgba(255, 122, 0, 0.16),
              transparent 34%
            ),
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
            radial-gradient(
              circle at 15% 0%,
              rgba(255, 122, 0, 0.13),
              transparent 34%
            ),
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

        .nexa-final-cta a {
          background: #ff7a00;
          color: #111116;
        }

        .nexa-final-cta a:hover {
          background: #ffffff;
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
          .nexa-hero-points {
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