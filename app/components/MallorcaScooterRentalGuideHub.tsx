"use client";

import { useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type Props = {
  locale?: string;
};

type GuideQuestion = {
  question: string;
  answer: string;
  slug: string;
  linkText: string;
};

const siteBaseUrl = "https://www.nexarentals.es";

const guideQuestions: GuideQuestion[] = [
  {
    question: "Do I need a licence to rent a 125cc scooter in Mallorca?",
    answer:
      "Yes. To rent a 125cc scooter in Mallorca, you need an A, A1, A2 licence, or a B car licence held for at least 3 years.",
    slug: "125cc-scooter-rental-mallorca-licence-rules",
    linkText: "Read the full licence guide",
  },
  {
    question: "Can I rent a scooter in Mallorca with a car licence?",
    answer:
      "Yes, but your B car licence must normally be at least 3 years old. You must bring the original physical licence card for pickup.",
    slug: "rent-scooter-mallorca-with-car-licence",
    linkText: "Read the car licence guide",
  },
  {
    question: "How much does scooter rental cost in Magaluf?",
    answer:
      "Scooter rental in Magaluf starts from €39 for same-day rental and €49 for 24 hours, with better daily prices for multi-day rentals.",
    slug: "scooter-rental-magaluf-prices",
    linkText: "See scooter rental prices",
  },
  {
    question: "What is the deposit for scooter rental in Mallorca?",
    answer:
      "At NEXA Rentals, the scooter deposit is €150 per scooter. It is separate from the rental price and returned after the scooter comes back safely.",
    slug: "scooter-rental-mallorca-deposit",
    linkText: "Read the deposit guide",
  },
  {
    question: "What documents do tourists need to rent a scooter in Spain?",
    answer:
      "Tourists need the original driving licence, ID or passport, and the booking/payment details. Photos or copies of the licence are not enough.",
    slug: "documents-needed-to-rent-scooter-spain",
    linkText: "Check required documents",
  },
  {
    question: "Where can I rent a scooter near Palma Nova?",
    answer:
      "NEXA Rentals is based close to Palma Nova, Magaluf, Torrenova, Cala Vinyes, and Calvià, with online booking and easy office pickup.",
    slug: "scooter-rental-palma-nova",
    linkText: "Read the Palma Nova guide",
  },
  {
    question: "Where can I rent a scooter near Magaluf beach?",
    answer:
      "You can rent a 125cc scooter near Magaluf beach with helmets, phone holder, security lock, top box, and unlimited kilometres included.",
    slug: "scooter-rental-magaluf-beach",
    linkText: "Read the Magaluf guide",
  },
  {
    question: "Are helmets included with scooter rental in Mallorca?",
    answer:
      "Yes. Our scooter rentals include 2 helmets, making it easier for couples and two riders to explore Mallorca together.",
    slug: "are-helmets-included-scooter-rental-mallorca",
    linkText: "Read what is included",
  },
  {
    question: "Can two people ride one 125cc scooter in Mallorca?",
    answer:
      "Yes. Two people can ride one 125cc scooter if the driver has the correct licence and both riders wear helmets.",
    slug: "can-two-people-ride-125cc-scooter-mallorca",
    linkText: "Read the two-rider guide",
  },
  {
    question: "Is a top box included with scooter rental in Mallorca?",
    answer:
      "Yes. NEXA Rentals includes a 50L top box, useful for helmets, beach bags, jackets, shopping bags, and small travel items.",
    slug: "scooter-rental-mallorca-top-box-storage",
    linkText: "Read the storage guide",
  },
  {
    question: "Is online booking required for scooter rental in Magaluf?",
    answer:
      "Online booking is the safest way to reserve your scooter, especially in summer when availability can change quickly.",
    slug: "online-scooter-booking-magaluf",
    linkText: "Read the booking guide",
  },
  {
    question: "Is scooter rental cheaper for 2, 3, 4, or 5 days?",
    answer:
      "Yes. Multi-day scooter rental in Mallorca usually gives a better daily price, especially for tourists staying several days.",
    slug: "multi-day-scooter-rental-mallorca-discounts",
    linkText: "See multi-day discounts",
  },
  {
    question: "What is better in Mallorca: scooter rental or car rental?",
    answer:
      "For beaches, parking, short trips, and moving around Magaluf or Palma Nova, scooter rental is often easier than car rental.",
    slug: "scooter-rental-vs-car-rental-mallorca",
    linkText: "Compare scooter and car rental",
  },
  {
    question: "Can tourists rent an e-bike in Magaluf?",
    answer:
      "Yes. Tourists can rent e-bikes in Magaluf for short routes, beach trips, and relaxed local exploring without needing a 125cc licence.",
    slug: "e-bike-rental-magaluf-mallorca",
    linkText: "Read the e-bike guide",
  },
  {
    question: "What are the best places to visit by scooter from Magaluf?",
    answer:
      "Popular routes include Palma Nova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous, Andratx, and southwest Mallorca viewpoints.",
    slug: "best-places-to-visit-by-scooter-from-magaluf",
    linkText: "Explore scooter routes",
  },
];

export default function MallorcaScooterRentalGuideHub({ locale = "en" }: Props) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${siteBaseUrl}/${locale}/#mallorca-scooter-rental-guide-faq`,
        mainEntity: guideQuestions.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteBaseUrl}/${locale}/#mallorca-scooter-rental-guide-list`,
        name: "Mallorca Scooter Rental Guide",
        itemListElement: guideQuestions.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.question,
          url: `${siteBaseUrl}/${locale}/blog/${item.slug}`,
        })),
      },
    ],
  };

  return (
    <section
      id="mallorca-scooter-rental-guide"
      aria-labelledby="mallorca-scooter-rental-guide-title"
      className={`${montserrat.className} relative overflow-hidden bg-white px-4 py-14 text-black sm:px-6 lg:px-8 lg:py-20`}
      style={{ fontFamily: montserrat.style.fontFamily }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData).replace(/</g, "\\u003c"),
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[280px] w-[720px] -translate-x-1/2 rounded-full bg-black/[0.025] blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-[260px] w-[520px] rounded-full bg-black/[0.035] blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <h2
          id="mallorca-scooter-rental-guide-title"
          className="mx-auto max-w-4xl text-center text-3xl font-black uppercase leading-[0.95] tracking-[-0.055em] text-black sm:text-5xl lg:text-6xl"
          style={{ fontFamily: montserrat.style.fontFamily }}
        >
          Mallorca Scooter Rental Guide
        </h2>

        <div className="mt-12 space-y-3 sm:mt-14">
          {guideQuestions.map((item, index) => {
            const isOpen = openIndex === index;
            const number = String(index + 1).padStart(2, "0");
            const href = `/${locale}/blog/${item.slug}`;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-[24px] border border-black bg-black text-white shadow-[0_18px_55px_rgba(0,0,0,0.13)] transition duration-300 hover:shadow-[0_24px_70px_rgba(0,0,0,0.2)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7 sm:py-6"
                  aria-expanded={isOpen}
                  aria-controls={`guide-answer-${index}`}
                >
                  <span className="flex min-w-0 items-center gap-4 sm:gap-5">
                    <span className="shrink-0 text-[11px] font-black uppercase tracking-[0.22em] text-white/35 sm:text-xs">
                      {number}
                    </span>

                    <span className="text-base font-black leading-snug tracking-[-0.035em] text-white sm:text-lg lg:text-xl">
                      {item.question}
                    </span>
                  </span>

                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-lg font-black text-white transition duration-300 ${
                      isOpen ? "rotate-45 bg-white text-black" : "bg-white/[0.04]"
                    }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>

                <div
                  id={`guide-answer-${index}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-white/10 px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
                      <p className="max-w-3xl text-sm font-medium leading-7 tracking-[-0.01em] text-white/62 sm:text-[15px]">
                        {item.answer}
                      </p>

                      <Link
                        href={href}
                        className="mt-5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:text-white/60"
                        aria-label={`${item.linkText}: ${item.question}`}
                      >
                        {item.linkText}
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}#booking`}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-black px-7 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-black/85"
          >
            Book online now
          </Link>

          <Link
            href={`/${locale}/blog`}
            className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-black/15 bg-white px-7 text-[11px] font-black uppercase tracking-[0.22em] text-black transition hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white"
          >
            View all guides
          </Link>
        </div>
      </div>
    </section>
  );
}