"use client";

import { useEffect, useRef, useState } from "react";
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [sectionInView, setSectionInView] = useState(false);
  const [animationRun, setAnimationRun] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionInView(true);
          setAnimationRun((current) => current + 1);
        } else {
          setSectionInView(false);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

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
      ref={sectionRef}
      id="mallorca-scooter-rental-guide"
      aria-labelledby="mallorca-scooter-rental-guide-title"
      className={`${montserrat.className} bg-white px-4 py-12 text-black sm:px-6 lg:px-8 lg:py-16`}
      style={{ fontFamily: montserrat.style.fontFamily }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData).replace(/</g, "\\u003c"),
        }}
      />

      <style jsx>{`
        @keyframes guideQuestionReveal {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .guide-question-animate {
          opacity: 0;
          animation-name: guideQuestionReveal;
          animation-duration: 560ms;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <h2
          id="mallorca-scooter-rental-guide-title"
          className="mx-auto max-w-4xl text-center text-3xl font-black uppercase leading-[0.95] tracking-[-0.055em] text-black sm:text-5xl lg:text-[58px]"
        >
          Mallorca Scooter Rental Guide
        </h2>

        <div className="mt-10 grid gap-x-12 border-t border-black/10 sm:mt-12 lg:grid-cols-2">
          {guideQuestions.map((item, index) => {
            const isOpen = openIndex === index;
            const number = String(index + 1).padStart(2, "0");
            const href = `/${locale}/blog/${item.slug}`;
            const delay = `${Math.min(index, 14) * 85}ms`;

            return (
              <article
                key={`${animationRun}-${item.slug}`}
                className={`border-b border-black/10 bg-white ${
                  sectionInView ? "guide-question-animate" : "opacity-0"
                }`}
                style={{
                  animationDelay: sectionInView ? delay : "0ms",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="group flex w-full items-center justify-between gap-5 bg-white py-4 text-left transition sm:py-[18px]"
                  aria-expanded={isOpen}
                  aria-controls={`guide-answer-${index}`}
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span className="mt-[3px] shrink-0 text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                      {number}
                    </span>

                    <span className="text-[14px] font-extrabold leading-snug tracking-[-0.025em] text-black sm:text-[15px] lg:text-[16px]">
                      {item.question}
                    </span>
                  </span>

                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.045] text-black transition duration-300 group-hover:bg-black group-hover:text-white ${
                      isOpen ? "rotate-180 bg-black text-white" : ""
                    }`}
                    aria-hidden
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
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
                    <div className="pb-5 pl-[42px] pr-12">
                      <p className="max-w-2xl text-[13px] font-medium leading-6 tracking-[-0.01em] text-black/58 sm:text-sm">
                        {item.answer}
                      </p>

                      <Link
                        href={href}
                        className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:text-black/55"
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

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}#booking`}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-black px-7 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-black/85"
          >
            Book online now
          </Link>

          <Link
            href={`/${locale}/blog`}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/15 bg-white px-7 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white"
          >
            View all guides
          </Link>
        </div>
      </div>
    </section>
  );
}