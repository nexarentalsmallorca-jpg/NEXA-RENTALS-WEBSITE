// app/components/GermanSeoLandingPage.tsx

import Link from "next/link";
import {
  getGermanSeoBreadcrumbs,
  getGermanSeoCanonicalUrl,
  NEXA_RENTALS_BUSINESS,
  type GermanSeoPage,
} from "../seo/germanSeoPages";

type Props = {
  page: GermanSeoPage;
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function GermanSeoLandingPage({ page }: Props) {
  const canonicalUrl = getGermanSeoCanonicalUrl(page);
  const breadcrumbs = getGermanSeoBreadcrumbs(page);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${NEXA_RENTALS_BUSINESS.url}/#localbusiness`,
    name: NEXA_RENTALS_BUSINESS.name,
    legalName: NEXA_RENTALS_BUSINESS.legalName,
    url: NEXA_RENTALS_BUSINESS.url,
    image: NEXA_RENTALS_BUSINESS.image,
    telephone: NEXA_RENTALS_BUSINESS.telephone,
    priceRange: NEXA_RENTALS_BUSINESS.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: NEXA_RENTALS_BUSINESS.address.streetAddress,
      addressLocality: NEXA_RENTALS_BUSINESS.address.addressLocality,
      postalCode: NEXA_RENTALS_BUSINESS.address.postalCode,
      addressRegion: NEXA_RENTALS_BUSINESS.address.addressRegion,
      addressCountry: NEXA_RENTALS_BUSINESS.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: NEXA_RENTALS_BUSINESS.geo.latitude,
      longitude: NEXA_RENTALS_BUSINESS.geo.longitude,
    },
    openingHours: NEXA_RENTALS_BUSINESS.openingHours,
    sameAs: NEXA_RENTALS_BUSINESS.sameAs,
    areaServed: [
      "Magaluf",
      "Mallorca",
      "Palmanova",
      "Santa Ponsa",
      "Paguera",
      "Portals Nous",
      "El Toro",
      "Palma de Mallorca",
    ],
    makesOffer: [
      {
        "@type": "Offer",
        name: "125cc Roller mieten Mallorca",
        priceCurrency: "EUR",
        price: "39",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
      },
      {
        "@type": "Offer",
        name: "24 Stunden Roller mieten Mallorca",
        priceCurrency: "EUR",
        price: "49",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.item,
    })),
  };

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <JsonLd data={faqSchema} />
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,0.26),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-[#070707]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-5 py-28 sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
              {page.heroKicker}
            </p>

            <h1 className="max-w-5xl text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              {page.h1}
            </h1>

            <p className="mt-7 max-w-3xl text-base leading-8 text-white/76 sm:text-lg">
              {page.heroSubtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={page.primaryCtaHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-extrabold text-black shadow-[0_18px_60px_rgba(255,255,255,0.16)] transition hover:scale-[1.02] hover:bg-orange-100"
              >
                {page.primaryCtaLabel}
              </Link>

              <Link
                href={page.secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:border-orange-300/60 hover:bg-orange-500/12"
              >
                {page.secondaryCtaLabel}
              </Link>
            </div>

            <div className="mt-9 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <p className="text-2xl font-black text-white">ab 39€</p>
                <p className="mt-1 text-sm text-white/62">Halber Tag</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <p className="text-2xl font-black text-white">ab 49€</p>
                <p className="mt-1 text-sm text-white/62">24 Stunden</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <p className="text-2xl font-black text-white">150€</p>
                <p className="mt-1 text-sm text-white/62">Kaution pro Roller</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <article className="space-y-10">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10">
              <div className="space-y-5 text-base leading-8 text-white/74">
                {page.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10">
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                {page.areaTitle}
              </h2>

              <div className="mt-6 space-y-5 text-base leading-8 text-white/74">
                {page.areaBody.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section
              id="preise"
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10"
            >
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                {page.priceTitle}
              </h2>

              <p className="mt-5 text-base leading-8 text-white/74">
                {page.priceIntro}
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {page.priceCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-3xl border border-white/10 bg-black/35 p-6"
                  >
                    <h3 className="text-lg font-extrabold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-3xl font-black text-orange-200">
                      {card.price}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-white/64">
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10">
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                {page.includedTitle}
              </h2>

              <p className="mt-5 text-base leading-8 text-white/74">
                {page.includedIntro}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {page.includedItems.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-400 text-xs font-black text-black">
                      ✓
                    </span>
                    <p className="text-sm font-semibold leading-6 text-white/78">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="fuehrerschein"
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10"
            >
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                {page.licenceTitle}
              </h2>

              <p className="mt-5 text-base leading-8 text-white/74">
                {page.licenceIntro}
              </p>

              <ul className="mt-7 space-y-3">
                {page.licenceBullets.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm leading-7 text-white/76"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10">
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                {page.pickupTitle}
              </h2>

              <div className="mt-6 space-y-5 text-base leading-8 text-white/74">
                {page.pickupBody.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {page.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10"
              >
                {section.eyebrow ? (
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-orange-200">
                    {section.eyebrow}
                  </p>
                ) : null}

                <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                  {section.title}
                </h2>

                <div className="mt-6 space-y-5 text-base leading-8 text-white/74">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {section.bullets ? (
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {section.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-semibold leading-6 text-white/72"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}

            <section
              id="faq"
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:p-10"
            >
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                Häufige Fragen zum Roller mieten auf Mallorca
              </h2>

              <div className="mt-7 divide-y divide-white/10">
                {page.faqs.map((faq) => (
                  <details key={faq.question} className="group py-5">
                    <summary className="cursor-pointer list-none text-base font-extrabold text-white">
                      <span className="inline-flex w-full items-center justify-between gap-4">
                        {faq.question}
                        <span className="text-orange-200 transition group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-4 text-sm leading-7 text-white/68">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-orange-300/20 bg-gradient-to-br from-orange-500/14 via-white/[0.04] to-black p-6 sm:p-8 lg:p-10">
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">
                Bereit für deinen Roller auf Mallorca?
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/74">
                Buche deinen 125cc Roller online und hole ihn bei NEXA Rentals
                in Magaluf ab. Preise, Extras, Führerscheinregeln und Kaution
                sind klar erklärt, damit du ohne Stress starten kannst.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={page.primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-extrabold text-black transition hover:scale-[1.02] hover:bg-orange-100"
                >
                  {page.primaryCtaLabel}
                </Link>

                <Link
                  href="/de"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/8 px-7 py-4 text-sm font-bold text-white transition hover:border-orange-300/60 hover:bg-orange-500/12"
                >
                  Zur deutschen Startseite
                </Link>
              </div>
            </section>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[2rem] border border-orange-300/20 bg-gradient-to-br from-orange-500/18 to-white/[0.05] p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-200">
                Schnellinfo
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
                NEXA Rentals Magaluf
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
                <p>
                  <strong className="text-white">Adresse:</strong>{" "}
                  C. Galeón, 13, Loc 57, 07181 Magaluf
                </p>
                <p>
                  <strong className="text-white">Öffnungszeiten:</strong>{" "}
                  09:00–14:00 und 15:00–20:00
                </p>
                <p>
                  <strong className="text-white">Roller:</strong> 125cc Piaggio
                  Liberty und SYM Symphony
                </p>
                <p>
                  <strong className="text-white">Kaution:</strong> 150€ pro
                  Roller
                </p>
              </div>

              <Link
                href={page.primaryCtaHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-extrabold text-black transition hover:bg-orange-100"
              >
                Online buchen
              </Link>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-black tracking-[-0.03em] text-white">
                Verwandte Seiten
              </h2>

              <div className="mt-5 space-y-4">
                {page.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-orange-300/50 hover:bg-orange-500/10"
                  >
                    <p className="text-sm font-extrabold text-white">
                      {link.label}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-white/58">
                      {link.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-xl font-black tracking-[-0.03em] text-white">
                Suchbegriffe dieser Seite
              </h2>

              <div className="mt-5 flex flex-wrap gap-2">
                {[page.primaryKeyword, ...page.secondaryKeywords].map(
                  (keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-white/60"
                    >
                      {keyword}
                    </span>
                  )
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}