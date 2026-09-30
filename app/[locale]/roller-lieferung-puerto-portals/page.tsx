// app/[locale]/roller-lieferung-puerto-portals/page.tsx


import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import GoogleReviewsV3 from "../../components/GoogleReviewsV3";
import LocationV3 from "../../components/LocationV3";
import NexaStatsStripV3 from "../../components/NexaStatsStripV3";

const LANGUAGES = [
  {
    code: "en",
    label: "English",
    short: "EN",
    flagSrc: "/images/en.png",
    href: "/en/scooter-delivery-puerto-portals",
  },
  {
    code: "es",
    label: "Español",
    short: "ES",
    flagSrc: "/images/es.png",
    href: "/es/entrega-scooter-puerto-portals",
  },
  {
    code: "de",
    label: "Deutsch",
    short: "DE",
    flagSrc: "/images/de.png",
    href: "/de/roller-lieferung-puerto-portals",
  },
  {
    code: "fr",
    label: "Français",
    short: "FR",
    flagSrc: "/images/fr.png",
    href: "/fr/livraison-scooter-puerto-portals",
  },
  {
    code: "it",
    label: "Italiano",
    short: "IT",
    flagSrc: "/images/it.png",
    href: "/it/consegna-scooter-puerto-portals",
  },
] as const;

const INCLUDED_ITEMS = [
  {
    image: "/images/ex4.png",
    title: "Two helmets",
    text: "Included for rider and passenger.",
  },
  {
    image: "/images/ex1.jpg",
    title: "Top case",
    text: "Practical storage for your belongings.",
  },
  {
    image: "/images/ex2.jpg",
    title: "Phone holder",
    text: "Ideal for navigation around Mallorca.",
  },
  {
    image: "/images/ex3.png",
    title: "Security lock",
    text: "Included for safer stops at the beach or hotel.",
  },
  {
    image: "/images/ex5.png",
    title: "Basic insurance",
    text: "Basic insurance is included.",
  },
];

export const metadata: Metadata = {
  title: "Scooter Delivery Santa Ponsa | 125cc Hotel & Airbnb Delivery | NEXA Rentals",
  description:
  "Book 125cc scooter delivery to your hotel, Airbnb or apartment in Santa Ponsa with NEXA Rentals. Easy online booking with office pickup also available.",
keywords: [
    "scooter delivery Santa Ponsa",
    "hotel scooter delivery Santa Ponsa",
    "Airbnb scooter delivery Santa Ponsa",
    "apartment scooter delivery Santa Ponsa",
    "125cc scooter Santa Ponsa",
    "scooter rental Santa Ponsa",
    "rent scooter Santa Ponsa",
    "scooter hire Santa Ponsa",
    "scooter rental delivery Mallorca",
    "hotel scooter rental Mallorca",
    "NEXA Rentals Santa Ponsa",
  ],
  alternates: {
    canonical: "https://www.nexarentals.es/en/roller-lieferung-puerto-portals",
  },
  openGraph: {
    title: "Scooter Delivery Santa Ponsa | NEXA Rentals",
   description:
  "Book 125cc scooter delivery to hotels, Airbnbs and apartments in Santa Ponsa with NEXA Rentals.",
url: "https://www.nexarentals.es/en/roller-lieferung-puerto-portals",
    siteName: "NEXA Rentals",
    images: [
      {
        url: "https://www.nexarentals.es/images/personscooter.jpg",
        width: 1200,
        height: 630,
        alt: "125cc scooter delivery in Santa Ponsa with NEXA Rentals",
      },
    ],
    locale: "en_GB",
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

export default function RollerLieferungPuertoPortalsPage() {
  const homeHref = "/en";
  const bookHref = "/en/home";
  const contactHref = "/en/contact";
  const externalBookingHref = "/en/home";
  const currentLanguage = LANGUAGES[2];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can NEXA Rentals deliver a scooter to my hotel in Santa Ponsa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can book a 125cc scooter online and choose Hotel / Airbnb Delivery during the booking flow for Santa Ponsa when delivery is available for your reservation. Office Pickup in Magaluf remains available as an alternative.",
        },
      },
      {
        "@type": "Question",
        name: "Can I book my Santa Ponsa scooter delivery online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Choose your 125cc scooter and rental dates online, then continue through the NEXA Rentals booking system and select the delivery option shown for your reservation.",
        },
      },
      {
        "@type": "Question",
        name: "What driving licence do I need for a 125cc scooter in Santa Ponsa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Licence requirements depend on the licence category you hold. Check the dedicated driving-licence page or your booking requirements before riding a 125cc scooter in Mallorca.",
        },
      },
      {
        "@type": "Question",
        name: "What is included with a NEXA Rentals 125cc scooter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Depending on the vehicle and booking, your rental can include helmets, a top case, phone holder, security lock, unlimited kilometres and basic insurance.",
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
      "Magaluf",
      "Palmanova",
      "Palma Nova",
      "Santa Ponsa",
      "Calvià",
      "Mallorca",
    ],
    makesOffer: {
      "@type": "Offer",
      name: "125cc scooter delivery Santa Ponsa",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      areaServed: "Santa Ponsa",
    },
  };

  return (
    <main className="nexa-seo-page">
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

      <Script
        id="nexa-mobile-hero-sequence"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              var RETURN_RELOAD_KEY =
                "nexa:roller-lieferung-puerto-portals:reload-on-return";

              function isMobileHero() {
                return window.matchMedia("(max-width: 680px)").matches;
              }

              function isThisSeoPage() {
                return window.location.pathname.indexOf(
                  "/roller-lieferung-puerto-portals"
                ) !== -1;
              }

              function markBookingNavigation() {
                try {
                  window.sessionStorage.setItem(RETURN_RELOAD_KEY, "1");
                } catch (error) {
                  // Ignore storage errors. The normal page navigation still works.
                }
              }

              function shouldForceReloadOnReturn() {
                if (!isMobileHero() || !isThisSeoPage()) return false;

                try {
                  return (
                    window.sessionStorage.getItem(RETURN_RELOAD_KEY) === "1"
                  );
                } catch (error) {
                  return false;
                }
              }

              function forceFreshPageAfterReturn() {
                if (!shouldForceReloadOnReturn()) return false;

                try {
                  window.sessionStorage.removeItem(RETURN_RELOAD_KEY);
                } catch (error) {
                  // Continue with the reload even if storage cleanup fails.
                }

                window.location.reload();
                return true;
              }

              function bindBookingLinks() {
                if (!isThisSeoPage()) return;

                document.addEventListener(
                  "click",
                  function (event) {
                    var target = event.target;
                    if (!(target instanceof Element)) return;

                    var link = target.closest(
                      ".nexa-primary-cta, " +
                        ".nexa-seo-book-button, " +
                        ".nexa-mobile-main-cta, " +
                        ".nexa-bottom-cta, " +
                        ".nexa-final-cta a"
                    );

                    if (!link) return;

                    markBookingNavigation();
                  },
                  true
                );
              }

              function runMobileHeroSequence() {
                if (!isMobileHero()) return;

                var page = document.querySelector(".nexa-seo-page");
                var heading = document.querySelector(".nexa-hero-copy h1");

                if (!page || !heading) return;

                /*
                 * Save the original heading once so the animation can always
                 * rebuild the exact same text after a real reload.
                 */
                if (!heading.getAttribute("data-original-heading")) {
                  heading.setAttribute(
                    "data-original-heading",
                    heading.textContent ||
                      "Scooter delivery to Santa Ponsa hotels & apartments."
                  );
                }

                var fullText =
                  heading.getAttribute("data-original-heading") ||
                  "Scooter delivery to Santa Ponsa hotels & apartments.";

                /*
                 * Reset every mobile entrance state before starting.
                 */
                page.classList.remove("nexa-mobile-hero-ready");
                page.setAttribute("data-mobile-sequence", "running");

                heading.classList.remove("nexa-mobile-typing");
                heading.textContent = "";
                heading.setAttribute("aria-label", fullText);

                /*
                 * Force a style/layout flush so opacity and transform reset
                 * before the entrance animations begin.
                 */
                void page.offsetWidth;

                heading.classList.add("nexa-mobile-typing");

                var index = 0;
                var speed = 34;

                function typeNext() {
                  if (index < fullText.length) {
                    heading.textContent += fullText.charAt(index);
                    index += 1;
                    window.setTimeout(typeNext, speed);
                    return;
                  }

                  heading.classList.remove("nexa-mobile-typing");

                  /*
                   * This class triggers the tagline, CTA and orange-panel
                   * slide-in animations in the existing CSS.
                   */
                  window.requestAnimationFrame(function () {
                    page.classList.add("nexa-mobile-hero-ready");
                    page.setAttribute("data-mobile-sequence", "done");
                  });
                }

                window.setTimeout(typeNext, 180);
              }

              function boot() {
                /*
                 * If the visitor has just returned from the booking page,
                 * reload this SEO page once. The session marker is removed
                 * before reload, so this cannot create a reload loop.
                 */
                if (forceFreshPageAfterReturn()) return;

                bindBookingLinks();
                runMobileHeroSequence();
              }

              if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", boot, {
                  once: true
                });
              } else {
                boot();
              }

              /*
               * Browser back-forward cache:
               * pageshow fires when Chrome/Safari restores the old page.
               */
              window.addEventListener("pageshow", function () {
                forceFreshPageAfterReturn();
              });

              /*
               * Next.js / browser history traversal can also surface through
               * popstate without a full page load.
               */
              window.addEventListener("popstate", function () {
                window.setTimeout(function () {
                  forceFreshPageAfterReturn();
                }, 0);
              });

              /*
               * Android Chrome can restore a tab/page and only make it visible
               * again. This catches that case too.
               */
              document.addEventListener("visibilitychange", function () {
                if (document.visibilityState === "visible") {
                  forceFreshPageAfterReturn();
                }
              });
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
            <span>→</span><span>→</span><span>→</span>
          </div>

          <Link href={bookHref} className="nexa-seo-book-button">
            <span>Book now</span>
          </Link>

          <div className="nexa-scroll-arrows nexa-scroll-arrows-right" aria-hidden="true">
            <span>←</span><span>←</span><span>←</span>
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
                {LANGUAGES.map((language) => (
                  <Link
                    key={language.code}
                    href={language.href}
                    className={
                      language.code === "de"
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
                    <span className="nexa-seo-language-short">{language.short}</span>
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>

      <section className="nexa-hero-section">
        <div className="nexa-hero-grid">
          <div className="nexa-hero-copy">
            <h1>Roller-Lieferung zu Hotels & Apartments in Puerto Portals.</h1>

            <div className="nexa-mobile-location">Puerto Portals, Mallorca</div>
            <p className="nexa-mobile-hero-tagline">
              125cc Roller · Hotel & Airbnb Lieferung · Online buchen
            </p>

            <p className="nexa-hero-text">
              Du wohnst in Puerto Portals und möchtest einen 125cc Roller zu deinem Hotel, Airbnb oder Apartment bekommen? Bei NEXA Rentals wählst du Roller und Mietdaten online und gehst anschließend zur Buchung.
            </p>

            <p className="nexa-hero-text small">
              Ein Roller eignet sich für Strände, Restaurants und Fahrten rund um Puerto Portals, Portals Nous, Costa d'en Blanes, Bendinat, Palmanova und weitere Orte auf Mallorca.
            </p>

            <div className="nexa-hero-actions">
              <Link href={bookHref} className="nexa-primary-cta">
                <span className="nexa-cta-desktop-label">Lieferung & Preise</span>
                <span className="nexa-cta-mobile-label">LIEFERUNG & PREISE</span>
              </Link>

              <Link href={contactHref} className="nexa-secondary-cta">
                Questions? Contact us
              </Link>
            </div>

            <div className="nexa-online-note">
              Online booking available through{" "}
              <a href={externalBookingHref}>NEXA Rentals online booking</a>
            </div>

            <div className="nexa-hero-points">
              <div>
                <strong>125cc</strong>
                <span>Scooters for your Mallorca trip</span>
              </div>
              <div>
                <strong>Delivery</strong>
                <span>Hotel, Airbnb or apartment option</span>
              </div>
              <div>
                <strong>Pickup</strong>
                <span>Office pickup in Magaluf also available</span>
              </div>
            </div>
          </div>

          <div className="nexa-hero-visual">
            <div className="nexa-visual-stack">
              <div className="nexa-orange-shape" />

              <div className="nexa-photo-card nexa-photo-card-top">
                <Image
                  src="/images/personscooter.jpg"
                  alt="Puerto Portals 125cc scooter delivery with NEXA Rentals"
                  width={900}
                  height={620}
                  priority
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-photo-card nexa-photo-card-bottom">
                <Image
                  src="/images/scooterperson2.jpg"
                  alt="NEXA Rentals 125cc scooter for Puerto Portals delivery"
                  width={900}
                  height={720}
                  className="nexa-hero-image"
                />
              </div>

              <div className="nexa-floating-price">
                <span>easy</span>
                <strong>BOOK</strong>
                <small>online</small>
              </div>
            </div>
          </div>

          <div className="nexa-mobile-orange-arc" aria-hidden="true">
            <svg
              className="nexa-mobile-wave-svg"
              viewBox="0 0 1000 104"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="nexaMobileWaveGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff6500" />
                  <stop offset="58%" stopColor="#ff8a00" />
                  <stop offset="100%" stopColor="#ff9f25" />
                </linearGradient>
              </defs>
              <path
                d="M0 48 L165 48 Q190 48 212 44 L350 37 Q372 36 394 36 L530 36 Q552 36 574 31 L714 23 Q738 21 760 21 L874 21 Q898 21 920 17 L1000 13 L1000 104 L0 104 Z"
                fill="url(#nexaMobileWaveGradient)"
              />
            </svg>
            <div className="nexa-mobile-wave-copy">
              <strong>Roller Lieferung Puerto Portals</strong>
              <span>125cc Roller · Hotel & Airbnb Lieferung · Büroabholung möglich</span>
            </div>
          </div>
        </div>
      </section>

      <section className="nexa-trust-section">
        <p>125cc Roller-Lieferservice für Gäste in Puerto Portals und Umgebung</p>

        <div className="nexa-trust-logos">
          <span>Roller Lieferung Puerto Portals</span>
          <span>Puerto Portals</span>
          <span>125cc</span>
          <span>Hotel</span>
          <span>Airbnb</span>
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

      <section className="nexa-mobile-action-section">
        <Link
          href={bookHref}
          className="nexa-mobile-main-cta"
        >
          Lieferung & Preise

          <span aria-hidden="true">
            →
          </span>
        </Link>

        <Link
          href={contactHref}
          className="nexa-mobile-contact-cta"
        >
          Fragen? Kontaktiere uns
        </Link>
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
              Roller Lieferung Puerto Portals
            </span>

            <h2>
              Ein einfacher Weg, einen 125cc Roller in Puerto Portals zu organisieren.
            </h2>

            <p>
              Du wohnst in Puerto Portals und möchtest einen 125cc Roller zu deinem Hotel, Airbnb oder Apartment bekommen? Bei NEXA Rentals wählst du Roller und Mietdaten online und gehst anschließend zur Buchung.
            </p>

            <p>
              Ein Roller eignet sich für Strände, Restaurants und Fahrten rund um Puerto Portals, Portals Nous, Costa d'en Blanes, Bendinat, Palmanova und weitere Orte auf Mallorca.
            </p>

          </article>

          <aside className="nexa-info-box">

            <h3>
              Was du bekommst
            </h3>

            <ul>
              <li>125cc</li>

              <li>
                Online-Buchung
              </li>

              <li>
                Hotel / Airbnb
              </li>

              <li>
                Büroabholung verfügbar
              </li>

            </ul>

          </aside>

        </div>
      </section>

      <section className="nexa-how-section">

        <div className="nexa-how-inner">

          <span className="nexa-section-label">
            So funktioniert es
          </span>

          <h2>
            Organisiere deine Roller-Lieferung nach Puerto Portals in wenigen Schritten.
          </h2>

          <div className="nexa-how-grid">

            <div>
              <span>01</span>

              <h3>
                125cc Roller wählen
              </h3>

              <p>
                Wähle deinen 125cc Roller und die Mietdaten.
              </p>
            </div>

            <div>
              <span>02</span>

              <h3>
                Lieferung oder Abholung wählen
              </h3>

              <p>
                Wähle Hotel / Airbnb Lieferung, wenn verfügbar, oder Büroabholung.
              </p>
            </div>

            <div>
              <span>03</span>

              <h3>
                Roller erhalten oder abholen
              </h3>

              <p>
                Folge den Buchungsinformationen und starte deine Fahrt.
              </p>
            </div>

          </div>

          <Link
            href={bookHref}
            className="nexa-bottom-cta"
          >
            Lieferung & Preise
          </Link>

        </div>

      </section>

      <section className="nexa-seo-text-section">

        <div className="nexa-seo-text-inner">

          <span className="nexa-section-label">
            Roller Lieferung Puerto Portals
          </span>

          <h2>
            Roller-Lieferung für Besucher in Puerto Portals.
          </h2>

          <p>
            Suchanfragen wie Roller Lieferung Puerto Portals, Roller Hotel Puerto Portals, Airbnb Roller Puerto Portals oder 125cc Roller Puerto Portals zeigen eine klare lokale Miet- und Lieferabsicht.
          </p>

          <p>
            NEXA Rentals ermöglicht die Online-Buchung für Puerto Portals und nahe Orte wie Portals Nous, Costa d'en Blanes, Bendinat, Palmanova mit den verfügbaren Liefer- oder Abholoptionen.
          </p>

          <div className="nexa-keyword-cloud">

            <span>Roller Lieferung Puerto Portals</span>
            <span>Roller mieten Puerto Portals</span>
            <span>Rollervermietung Puerto Portals</span>
            <span>Roller Hotel Puerto Portals</span>
            <span>Airbnb Roller Puerto Portals</span>
            <span>125cc Roller Puerto Portals</span>
            <span>Roller Mallorca Lieferung</span>
            <span>Roller mieten Mallorca</span>
            <span>Roller Winter Puerto Portals</span>
            <span>NEXA Rentals Puerto Portals</span>

          </div>

        </div>

      </section>

      <section className="nexa-location-section">
        <LocationV3 />
      </section>

      <section className="nexa-faq-section">

        <div className="nexa-faq-inner">

          <span className="nexa-section-label">
            Häufige Fragen
          </span>

          <h2>
            Fragen zur Roller-Lieferung in Puerto Portals
          </h2>

          <div className="nexa-faq-list">

            <details>

              <summary>
                Könnt ihr einen Roller zu meinem Hotel in Puerto Portals liefern?
              </summary>

              <p>
                Im Buchungsprozess werden die verfügbaren Optionen für Puerto Portals angezeigt. Hotel / Airbnb Lieferung kann gewählt werden, wenn verfügbar.
              </p>

            </details>

            <details>

              <summary>
                Kann ich die Roller-Lieferung nach Puerto Portals online buchen?
              </summary>

              <p>
                Ja. Wähle Roller und Mietdaten online und fahre mit der NEXA Rentals Buchung fort.
              </p>

            </details>

            <details>

              <summary>
                Welchen Führerschein brauche ich für einen 125cc Roller?
              </summary>

              <p>
                Die Anforderungen hängen von Führerscheinklasse und Gültigkeit ab.
              </p>

            </details>

            <details>

              <summary>
                Was ist bei der Miete enthalten?
              </summary>

              <p>
                Der Buchungsprozess zeigt Ausstattung und Bedingungen für den gewählten Roller.
              </p>

            </details>

            <details>

              <summary>
                Kann ich den Roller im Büro abholen?
              </summary>

              <p>
                Ja. Büroabholung bei NEXA Rentals in Magaluf bleibt im normalen Buchungsprozess verfügbar.
              </p>

            </details>

          </div>

          <div className="nexa-final-cta">

            <h3>
              Bereit für deinen Roller in Puerto Portals?
            </h3>

            <p>
              Wähle deinen 125cc Roller online und prüfe die verfügbaren Liefer- oder Abholoptionen.
            </p>

            <Link href={bookHref}>
              Lieferung & Preise
            </Link>

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
            <p>NEXA Rentals · 125cc Roller-Vermietung & Lieferung auf Mallorca</p>
          </div>

          <div className="nexa-seo-footer-actions">
            <Link href={bookHref}>Book now</Link>
            <Link href={contactHref}>Contact</Link>
          </div>
        </div>
      </footer>

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
          margin-top: 6px;
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
          font-size: 13.5px;
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


        .nexa-mobile-location,
        .nexa-mobile-hero-tagline,
        .nexa-cta-mobile-label,
        .nexa-mobile-orange-arc {
          display: none;
        }

        .nexa-cta-desktop-label {
          display: inline;
        }

        .nexa-mobile-action-section {
          display: none;
        }

        @media (max-width: 680px) {
          /* =========================================================
             MOBILE HERO POSITION CONTROLS
             Change ONLY these values to fine-tune the mobile hero.

             HERO BUTTON:
               --mobile-book-x: positive = right, negative = left
               --mobile-book-y: positive = down, negative = up

             ORANGE BOTTOM PANEL:
               --mobile-arc-x: positive = right, negative = left
               --mobile-arc-y: positive = up, negative = down
               --mobile-arc-height: overall orange panel height

             ORANGE PANEL TEXT:
               --mobile-arc-text-x: positive = right, negative = left
               --mobile-arc-text-y: positive = up, negative = down
             ========================================================= */
          .nexa-seo-page {
            --mobile-book-x: 0px;
            --mobile-book-y: -8px;

            --mobile-arc-x: 0px;
            --mobile-arc-y: 28px;
            --mobile-arc-height: 114px;

            --mobile-arc-text-x: 0px;
            --mobile-arc-text-y: 12px;

            padding-top: 64px;
          }

          .nexa-hero-section {
            position: relative;
            padding: 0;
            background: #111116;
          }

          .nexa-hero-grid {
            position: relative;
            max-width: none;
            width: 100%;
            min-height: calc(94svh + 18px);
            display: grid;
            grid-template-columns: 1fr;
            grid-template-areas: "hero";
            gap: 0;
            overflow: hidden;
            background: #111116;
          }

          .nexa-hero-visual {
            grid-area: hero;
            position: relative;
            width: 100%;
            max-width: none;
            min-height: calc(94svh + 18px);
            margin: 0;
            z-index: 1;
          }

          .nexa-visual-stack {
            position: relative;
            width: 100%;
            min-height: calc(94svh + 18px);
          }

          .nexa-orange-shape,
          .nexa-photo-card-bottom,
          .nexa-floating-price {
            display: none;
          }

          .nexa-photo-card-top {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: 0;
            box-shadow: none;
            background: #111116;
          }

          .nexa-photo-card-top::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            background:
              linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.06) 30%, rgba(0, 0, 0, 0.015) 58%, rgba(0, 0, 0, 0.12) 100%),
              linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.05) 58%, rgba(0, 0, 0, 0.01) 100%);
          }

          .nexa-photo-card-top .nexa-hero-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 56% center;
            filter: brightness(1.14) saturate(1.04) contrast(0.96);
            transform: scale(0.985);
            transform-origin: center center;
          }

          .nexa-hero-copy {
            grid-area: hero;
            position: relative;
            z-index: 4;
            min-height: calc(100svh - 168px);
            padding: clamp(12px, 1.8svh, 18px) 22px 28px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            text-align: left;
            color: #ffffff;
            pointer-events: none;
          }

          .nexa-mobile-location {
            order: -1;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 10px;
            color: rgba(255, 255, 255, 0.94);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            text-shadow: 0 3px 14px rgba(0, 0, 0, 0.32);
          }

          .nexa-mobile-location::before {
            content: "●";
            color: #ff7a00;
            font-size: 10px;
            line-height: 1;
          }

          .nexa-hero-copy h1 {
            max-width: 338px;
            margin: 0;
            color: #ffffff;
            font-size: clamp(29px, 8.1vw, 38px);
            line-height: 0.99;
            letter-spacing: -0.062em;
            font-weight: 800;
            text-wrap: balance;
            text-shadow: 0 5px 28px rgba(0, 0, 0, 0.36);
          }

          .nexa-hero-copy h1.nexa-mobile-typing::after {
            content: "";
            display: inline-block;
            width: 2px;
            height: 0.86em;
            margin-left: 4px;
            vertical-align: -0.04em;
            background: #ff8a00;
            animation: nexaMobileCaret 720ms steps(1) infinite;
          }

          @keyframes nexaMobileCaret {
            0%, 48% { opacity: 1; }
            49%, 100% { opacity: 0; }
          }

          .nexa-mobile-hero-tagline {
            display: block;
            max-width: 325px;
            margin: 9px 0 0;
            opacity: 0;
            transform: translateX(-56px);
            color: rgba(255, 255, 255, 0.94);
            font-size: 12.5px;
            line-height: 1.45;
            letter-spacing: -0.018em;
            font-weight: 700;
            text-shadow: 0 3px 18px rgba(0, 0, 0, 0.42);
          }

          .nexa-hero-text,
          .nexa-hero-text.small,
          .nexa-online-note,
          .nexa-hero-points,
          .nexa-secondary-cta {
            display: none;
          }

          .nexa-hero-actions {
            position: relative;
            left: var(--mobile-book-x);
            top: var(--mobile-book-y);
            width: 100%;
            margin-top: clamp(16px, 2.7svh, 26px);
            display: flex;
            opacity: 0;
            transform: translateX(-72px);
            justify-content: flex-start;
            pointer-events: auto;
          }

          .nexa-mobile-hero-ready .nexa-mobile-hero-tagline {
            animation: nexaMobileLeftIn 620ms cubic-bezier(.18,.85,.22,1) 80ms both;
          }

          .nexa-mobile-hero-ready .nexa-hero-actions {
            animation: nexaMobileLeftIn 680ms cubic-bezier(.18,.85,.22,1) 180ms both;
          }

          @keyframes nexaMobileLeftIn {
            from { opacity: 0; transform: translateX(-72px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .nexa-primary-cta {
            position: relative;
            width: auto;
            min-width: 224px;
            min-height: 56px;
            padding: 0 29px;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.95);
            background: linear-gradient(135deg, #ff6500 0%, #ff8a00 58%, #ff9f25 100%);
            color: #ffffff;
            box-shadow:
              0 18px 42px rgba(255, 122, 0, 0.38),
              0 0 0 0 rgba(255, 122, 0, 0.42);
            font-size: 14px;
            letter-spacing: 0;
            animation: nexaMobilePremiumHeartbeat 1.8s ease-in-out infinite;
          }

          .nexa-primary-cta::after {
            content: "";
            position: absolute;
            top: -35%;
            left: -35%;
            width: 28%;
            height: 170%;
            transform: rotate(18deg);
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
            animation: nexaMobileShine 2.8s ease-in-out infinite;
          }

          .nexa-cta-desktop-label {
            display: none;
          }

          .nexa-cta-mobile-label {
            position: relative;
            z-index: 2;
            display: inline;
          }

          @keyframes nexaMobilePremiumHeartbeat {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 18px 42px rgba(255, 122, 0, 0.38), 0 0 0 0 rgba(255, 122, 0, 0.36);
            }
            12% {
              transform: scale(1.045);
              box-shadow: 0 20px 46px rgba(255, 122, 0, 0.44), 0 0 0 8px rgba(255, 122, 0, 0.10);
            }
            24% {
              transform: scale(1);
            }
            36% {
              transform: scale(1.025);
            }
            48% {
              transform: scale(1);
            }
          }

          @keyframes nexaMobileShine {
            0%, 55% { left: -45%; opacity: 0; }
            62% { opacity: 0.85; }
            78% { left: 120%; opacity: 0; }
            100% { left: 120%; opacity: 0; }
          }


          .nexa-mobile-orange-arc {
            position: absolute;
            left: calc(-6% + var(--mobile-arc-x));
            right: auto;
            bottom: calc(-1px + var(--mobile-arc-y));
            z-index: 5;
            width: 112%;
            height: var(--mobile-arc-height);
            display: block;
            overflow: hidden;
            pointer-events: none;
            filter: drop-shadow(0 -7px 20px rgba(255, 122, 0, 0.16));
          }

          .nexa-mobile-wave-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
          }

          .nexa-mobile-wave-copy {
            position: absolute;
            right: calc(9% - var(--mobile-arc-text-x));
            bottom: calc(10px + var(--mobile-arc-text-y));
            z-index: 2;
            width: min(78%, 380px);
            color: #ffffff;
            text-align: right;
            padding-left: 16px;
            opacity: 0;
            transform: translateX(64px);
            text-shadow: 0 3px 18px rgba(0, 0, 0, 0.2);
          }

          .nexa-mobile-wave-copy strong {
            display: block;
            font-size: 14px;
            line-height: 1.12;
            font-weight: 900;
            letter-spacing: -0.03em;
          }

          .nexa-mobile-wave-copy span {
            display: block;
            margin-top: 5px;
            font-size: 10.4px;
            line-height: 1.35;
            font-weight: 700;
            letter-spacing: 0.01em;
            opacity: 0.96;
          }

          .nexa-mobile-hero-ready .nexa-mobile-wave-copy {
            animation: nexaMobileWaveCopyIn 680ms cubic-bezier(.18,.85,.22,1) 220ms both;
          }

          @keyframes nexaMobileWaveCopyIn {
            from { opacity: 0; transform: translateX(64px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .nexa-trust-section {
            display: none;
          }

          .nexa-fast-info-section {
            padding: 30px 12px 26px;
            background: #ffffff;
          }

          .nexa-fast-info-grid {
            max-width: 560px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px 8px;
            align-items: start;
          }

          .nexa-included-item {
            min-width: 0;
            padding: 0 2px;
            text-align: center;
          }

          .nexa-orange-check {
            top: -2px;
            right: 8%;
            width: 18px;
            height: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            background: #ff7a00;
            color: #ffffff;
            font-size: 11px;
            text-shadow: none;
            box-shadow: 0 7px 18px rgba(255, 122, 0, 0.23);
          }

          .nexa-included-image-wrap {
            height: 78px;
          }

          .nexa-included-image {
            width: 100%;
            max-width: 94px;
            height: 74px;
            object-fit: contain;
          }

          .nexa-included-item strong {
            margin-top: 8px;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #15141c;
            font-size: 12.5px;
            line-height: 1.12;
            letter-spacing: -0.035em;
            font-weight: 900;
          }

          .nexa-included-item p {
            max-width: 116px;
            margin: 3px auto 0;
            color: #777582;
            font-size: 10px;
            line-height: 1.28;
            font-weight: 600;
          }

          .nexa-fast-info-grid .nexa-included-item:nth-child(4) {
            grid-column: 1 / 2;
            transform: translateX(52%);
          }

          .nexa-fast-info-grid .nexa-included-item:nth-child(5) {
            grid-column: 2 / 3;
            transform: translateX(52%);
          }

          .nexa-mobile-action-section {
            padding: 0 16px 34px;
            display: grid;
            gap: 12px;
            background: #ffffff;
          }

          .nexa-mobile-main-cta,
          .nexa-mobile-contact-cta {
            width: 100%;
            min-height: 56px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            text-decoration: none;
            font-size: 12.5px;
            font-weight: 900;
            letter-spacing: -0.02em;
          }

          .nexa-mobile-main-cta {
            background: #111116;
            color: #ffffff;
            box-shadow: 0 16px 34px rgba(17, 17, 22, 0.16);
          }

          .nexa-mobile-main-cta span {
            color: #ff7a00;
            font-size: 23px;
            line-height: 1;
          }

          .nexa-mobile-contact-cta {
            min-height: 52px;
            border: 1px solid rgba(17, 17, 22, 0.12);
            background: #ffffff;
            color: #171720;
          }

          .nexa-components-section:first-of-type {
            border-top: 1px solid rgba(17, 17, 22, 0.05);
          }

          .nexa-content-section,
          .nexa-how-section,
          .nexa-seo-text-section,
          .nexa-faq-section {
            padding-top: 62px;
            padding-bottom: 62px;
          }
        }

        @media (max-width: 420px) {
          .nexa-seo-page {
            /* EXTRA SMALL PHONE OVERRIDES - edit these if needed */
            --mobile-book-x: 0px;
            --mobile-book-y: 100px;
            --mobile-arc-x: 0px;
            --mobile-arc-y: 20px;
            --mobile-arc-height: 124px;
            --mobile-arc-text-x: 0px;
            --mobile-arc-text-y: 12px;
          }

          .nexa-hero-copy {
            min-height: calc(100svh - 160px);
            padding: 0px 18px 24px;
transform: translateY(-30px);
          }

          .nexa-hero-copy h1 {
            max-width: 300px;
            font-size: 31px;
          }

          .nexa-mobile-hero-tagline {
            max-width: 290px;
            font-size: 12.5px;
          }

          .nexa-primary-cta {
            min-width: 210px;
            min-height: 54px;
            padding: 0 24px;
            font-size: 13px;
          }

          .nexa-photo-card-top .nexa-hero-image {
            object-position: 54% center;
            filter: brightness(1.16) saturate(1.04) contrast(0.95);
            transform: scale(0.98);
          }

          .nexa-fast-info-section {
            padding-left: 9px;
            padding-right: 9px;
          }

          .nexa-fast-info-grid {
            gap: 22px 6px;
          }

          .nexa-included-image-wrap {
            height: 72px;
          }

          .nexa-included-image {
            max-width: 86px;
            height: 68px;
          }

          .nexa-included-item strong {
            font-size: 12px;
          }

          .nexa-included-item p {
            max-width: 108px;
            font-size: 9.5px;
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
          .nexa-scroll-arrows,
          .nexa-primary-cta::after {
            animation: none !important;
          }

          .nexa-mobile-hero-tagline,
          .nexa-hero-actions,
          .nexa-mobile-wave-copy {
            opacity: 1 !important;
            transform: none !important;
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