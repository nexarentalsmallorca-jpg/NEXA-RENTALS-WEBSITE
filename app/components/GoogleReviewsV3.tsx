"use client";

import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useLocale } from "next-intl";
import type { CSSProperties, MouseEvent } from "react";

const reviewFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-review-montserrat",
});

type Locale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "it"
  | "pt"
  | "sv"
  | "nl"
  | "pl"
  | "da"
  | "no"
  | "cs"
  | "uk";

type ReviewImage = {
  id: number;
  src: string;
  alt: string;
};

const COPY: Record<
  Locale,
  {
    title: string;
    rating: string;
    reviews: string;
    mobileProof: string;
    altPrefix: string;
  }
> = {
  en: {
    title: "Loved by scooter riders in Mallorca.",
    rating: "Google Reviews",
    reviews: "",
    mobileProof: "5.0 stars from 41 reviews",
    altPrefix: "Google review",
  },
  es: {
    title: "Scooters recomendados por clientes en Mallorca.",
    rating: "Reseñas de Google",
    reviews: "44 reseñas en Google",
    mobileProof: "5,0 estrellas de 41 reseñas",
    altPrefix: "Reseña de Google",
  },
  de: {
    title: "Beliebt bei Rollerfahrern auf Mallorca.",
    rating: "Google-Bewertungen",
    reviews: "44 Bewertungen auf Google",
    mobileProof: "5,0 Sterne aus 41 Bewertungen",
    altPrefix: "Google-Bewertung",
  },
  fr: {
    title: "Apprécié par les conducteurs de scooters à Majorque.",
    rating: "Avis Google",
    reviews: "44 avis sur Google",
    mobileProof: "5,0 étoiles sur 41 avis",
    altPrefix: "Avis Google",
  },
  it: {
    title: "Amato dai clienti scooter a Maiorca.",
    rating: "Recensioni Google",
    reviews: "44 recensioni su Google",
    mobileProof: "5,0 stelle da 41 recensioni",
    altPrefix: "Recensione Google",
  },
  pt: {
    title: "Adorado por condutores de scooter em Maiorca.",
    rating: "Avaliações Google",
    reviews: "44 avaliações no Google",
    mobileProof: "5,0 estrelas em 41 avaliações",
    altPrefix: "Avaliação Google",
  },
  sv: {
    title: "Älskat av scooterförare på Mallorca.",
    rating: "Google-recensioner",
    reviews: "44 recensioner på Google",
    mobileProof: "5,0 stjärnor från 41 recensioner",
    altPrefix: "Google-recension",
  },
  nl: {
    title: "Geliefd bij scooterrijders in Mallorca.",
    rating: "Google Reviews",
    reviews: "44 reviews op Google",
    mobileProof: "5,0 sterren uit 41 reviews",
    altPrefix: "Google review",
  },
  pl: {
    title: "Polecane przez kierowców skuterów na Majorce.",
    rating: "Opinie Google",
    reviews: "44 opinii w Google",
    mobileProof: "5,0 gwiazdek z 41 opinii",
    altPrefix: "Opinia Google",
  },
  da: {
    title: "Elsket af scooterkunder på Mallorca.",
    rating: "Google-anmeldelser",
    reviews: "44 anmeldelser på Google",
    mobileProof: "5,0 stjerner fra 41 anmeldelser",
    altPrefix: "Google-anmeldelse",
  },
  no: {
    title: "Elsket av scooterførere på Mallorca.",
    rating: "Google-anmeldelser",
    reviews: "44 anmeldelser på Google",
    mobileProof: "5,0 stjerner fra 41 anmeldelser",
    altPrefix: "Google-anmeldelse",
  },
  cs: {
    title: "Oblíbené mezi jezdci na skútru na Mallorce.",
    rating: "Recenze Google",
    reviews: "44 recenzí na Google",
    mobileProof: "5,0 hvězdiček ze 41 recenzí",
    altPrefix: "Recenze Google",
  },
  uk: {
    title: "Улюблений сервіс серед водіїв скутерів на Майорці.",
    rating: "Відгуки Google",
    reviews: "44 відгуків у Google",
    mobileProof: "5,0 зірок із 41 відгуку",
    altPrefix: "Відгук Google",
  },
};

function getSafeLocale(locale: string): Locale {
  return [
    "en",
    "es",
    "de",
    "fr",
    "it",
    "pt",
    "sv",
    "nl",
    "pl",
    "da",
    "no",
    "cs",
    "uk",
  ].includes(locale)
    ? (locale as Locale)
    : "en";
}

const reviews: ReviewImage[] = [
  { id: 1, src: "/images/ReviewPNG1.png", alt: "Google review 1" },
  { id: 2, src: "/images/ReviewPNG2.png", alt: "Google review 2" },
  { id: 3, src: "/images/ReviewPNG3.png", alt: "Google review 3" },
  { id: 4, src: "/images/ReviewPNG4.png", alt: "Google review 4" },
  { id: 5, src: "/images/ReviewPNG5.png", alt: "Google review 5" },
  { id: 6, src: "/images/ReviewPNG6.png", alt: "Google review 6" },
  { id: 7, src: "/images/ReviewPNG7.png", alt: "Google review 7" },
  { id: 8, src: "/images/ReviewPNG8.png", alt: "Google review 8" },
  { id: 9, src: "/images/ReviewPNG9.png", alt: "Google review 9" },
  { id: 10, src: "/images/ReviewPNG10.png", alt: "Google review 10" },
  { id: 11, src: "/images/ReviewPNG11.png", alt: "Google review 11" },
  { id: 12, src: "/images/ReviewPNG12.png", alt: "Google review 12" },
  { id: 13, src: "/images/ReviewPNG13.png", alt: "Google review 13" },
  { id: 14, src: "/images/ReviewPNG14.png", alt: "Google review 14" },
  { id: 15, src: "/images/ReviewPNG15.png", alt: "Google review 15" },
];

const firstRow = reviews.slice(0, 8);
const secondRow = reviews.slice(7, 15);
const thirdRow = [
  reviews[2],
  reviews[5],
  reviews[8],
  reviews[11],
  reviews[14],
  reviews[0],
  reviews[4],
  reviews[9],
];

function ReviewImageCard({
  review,
  altPrefix,
  priority = false,
}: {
  review: ReviewImage;
  altPrefix: string;
  priority?: boolean;
}) {
  return (
    <article className="review-v3-card group/card relative shrink-0 overflow-hidden rounded-[18px] border border-black/10 bg-white p-[4px] shadow-[0_18px_55px_rgba(0,0,0,0.14)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.018] hover:border-black/20 hover:shadow-[0_24px_75px_rgba(0,0,0,0.20)]">
      <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#efefed]">
        <Image
          src={review.src}
          alt={`${altPrefix} ${review.id}`}
          fill
          sizes="(max-width: 640px) 250px, (max-width: 1024px) 330px, (max-width: 1440px) 390px, 430px"
          className="object-cover transition-transform duration-700 group-hover/card:scale-[1.025]"
          priority={priority}
        />
      </div>
    </article>
  );
}

function ReviewStrip({
  items,
  direction,
  altPrefix,
}: {
  items: ReviewImage[];
  direction: "left" | "right";
  altPrefix: string;
}) {
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="group/strip relative overflow-hidden py-2">
      <div
        className={[
          "review-v3-track flex w-max will-change-transform group-hover/strip:[animation-play-state:paused]",
          direction === "left"
            ? "animate-[reviewV3ScrollLeft_48s_linear_infinite]"
            : "animate-[reviewV3ScrollRight_48s_linear_infinite]",
        ].join(" ")}
      >
        {repeated.map((review, index) => (
          <ReviewImageCard
            key={`${direction}-${review.id}-${index}`}
            review={review}
            altPrefix={altPrefix}
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  );
}

export default function GoogleReviewsV3() {
  const locale = getSafeLocale(useLocale());
  const copy = COPY[locale];

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--review-mouse-x",
      `${event.clientX - rect.left}px`
    );

    event.currentTarget.style.setProperty(
      "--review-mouse-y",
      `${event.clientY - rect.top}px`
    );
  }

  const sectionStyle = {
    "--review-mouse-x": "50%",
    "--review-mouse-y": "50%",
  } as CSSProperties;

  return (
    <section
      style={sectionStyle}
      onMouseMove={handleMouseMove}
      className={`${reviewFont.variable} ${reviewFont.className} review-v3-section group/reviews relative isolate overflow-hidden bg-[#ececea] py-[clamp(46px,5vw,78px)] text-black`}
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.88),transparent_31%),radial-gradient(circle_at_82%_92%,rgba(0,0,0,0.105),transparent_35%),linear-gradient(180deg,#f2f2ee_0%,#e2e2df_48%,#eeeeeb_100%)]" />

      <div className="review-v3-cursor-grid pointer-events-none absolute inset-0 -z-20 opacity-0 transition-opacity duration-500 group-hover/reviews:opacity-100" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(255,255,255,0.38)_100%)]" />

      <div className="pointer-events-none absolute left-[-12%] top-[5%] -z-10 h-[320px] w-[320px] rounded-full bg-black/[0.055] blur-[95px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] -z-10 h-[400px] w-[400px] rounded-full bg-black/[0.065] blur-[110px]" />

      <div className="review-v3-header mx-auto mb-[clamp(26px,3.2vw,46px)] max-w-[1320px] px-5 text-center sm:px-8">
        <div className="review-v3-pill mx-auto inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/75 px-5 py-2.5 shadow-[0_14px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
          <span className="review-v3-pill-stars text-[12px] tracking-[0.18em] text-black">
            ★★★★★
          </span>

          <span className="review-v3-pill-text text-[10px] uppercase tracking-[0.22em] text-black/55">
            {copy.rating}
          </span>

          <span className="review-v3-pill-proof hidden text-[9px] uppercase tracking-[0.14em] text-black/48">
            {copy.mobileProof}
          </span>
        </div>

        <h2 className="review-v3-title mx-auto mt-6 max-w-[1160px] text-[clamp(32px,4.8vw,70px)] uppercase leading-[1.02] text-black">
          {copy.title}
        </h2>

        <p className="review-v3-subtitle mt-4 text-[clamp(13px,1.35vw,18px)] uppercase tracking-[0.2em] text-black/48">
          {copy.reviews}
        </p>
      </div>

      <div className="relative">
        <div className="review-v3-edge-shadow pointer-events-none absolute inset-y-0 left-0 z-20 w-[72px] bg-gradient-to-r from-[#0a0a0a] via-[#141414]/75 to-transparent sm:w-[clamp(110px,12vw,220px)]" />
        <div className="review-v3-edge-shadow pointer-events-none absolute inset-y-0 right-0 z-20 w-[72px] bg-gradient-to-l from-[#0a0a0a] via-[#141414]/75 to-transparent sm:w-[clamp(110px,12vw,220px)]" />

        <ReviewStrip
          items={firstRow}
          direction="left"
          altPrefix={copy.altPrefix}
        />

        <div className="mt-2">
          <ReviewStrip
            items={secondRow}
            direction="right"
            altPrefix={copy.altPrefix}
          />
        </div>

        <div className="review-v3-mobile-third mt-2">
          <ReviewStrip
            items={thirdRow}
            direction="left"
            altPrefix={copy.altPrefix}
          />
        </div>
      </div>

      <style jsx global>{`
        .review-v3-section,
        .review-v3-section * {
          font-family: var(--font-review-montserrat), Montserrat, Arial,
            sans-serif !important;
        }

        .review-v3-title {
          font-family: var(--font-review-montserrat), Montserrat, Arial,
            sans-serif !important;
          font-weight: 500 !important;
          letter-spacing: 0.035em !important;
          word-spacing: 0.12em !important;
        }

        .review-v3-pill-stars,
        .review-v3-pill-text,
        .review-v3-pill-proof,
        .review-v3-subtitle {
          font-family: var(--font-review-montserrat), Montserrat, Arial,
            sans-serif !important;
          font-weight: 600 !important;
        }

        .review-v3-section {
          --review-mouse-x: 50%;
          --review-mouse-y: 50%;
        }

        .review-v3-mobile-third {
          display: none;
        }

        .review-v3-cursor-grid {
          background-image:
            linear-gradient(rgba(0, 0, 0, 0.13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.13) 1px, transparent 1px),
            linear-gradient(rgba(0, 0, 0, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.055) 1px, transparent 1px);
          background-size:
            92px 92px,
            92px 92px,
            23px 23px,
            23px 23px;
          background-position:
            center,
            center,
            center,
            center;
          mask-image: radial-gradient(
            circle 190px at var(--review-mouse-x) var(--review-mouse-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.86) 38%,
            rgba(0, 0, 0, 0.34) 66%,
            transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            circle 190px at var(--review-mouse-x) var(--review-mouse-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.86) 38%,
            rgba(0, 0, 0, 0.34) 66%,
            transparent 100%
          );
        }

        .review-v3-card {
          width: clamp(300px, 25vw, 430px);
          height: clamp(91px, 7.6vw, 130px);
        }

        .review-v3-track {
          gap: clamp(14px, 1.35vw, 24px);
        }

        @keyframes reviewV3ScrollLeft {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-25%);
          }
        }

        @keyframes reviewV3ScrollRight {
          from {
            transform: translateX(-25%);
          }

          to {
            transform: translateX(0);
          }
        }

        @media (min-width: 1024px) and (max-width: 1280px) {
          .review-v3-card {
            width: 338px;
            height: 102px;
          }

          .review-v3-track {
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .review-v3-section {
            padding-top: 34px !important;
            padding-bottom: 38px !important;
          }

          .review-v3-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            margin-bottom: 16px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .review-v3-title {
            order: 1 !important;
            margin-top: 0 !important;
            max-width: 340px !important;
            font-size: clamp(20px, 5.7vw, 24px) !important;
            line-height: 1.08 !important;
            letter-spacing: 0.016em !important;
            word-spacing: 0.035em !important;
          }

          .review-v3-pill {
            order: 2 !important;
            margin-top: 12px !important;
            gap: 7px !important;
            max-width: 260px !important;
            padding: 7px 12px !important;
            border-radius: 999px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.07) !important;
          }

          .review-v3-pill-stars {
            font-size: 10px !important;
            letter-spacing: 0.15em !important;
            line-height: 1 !important;
          }

          .review-v3-pill-text {
            font-size: 8px !important;
            letter-spacing: 0.18em !important;
            line-height: 1 !important;
          }

          .review-v3-pill-proof {
            display: block !important;
            flex-basis: 100% !important;
            margin-top: 1px !important;
            text-align: center !important;
            font-size: 7.5px !important;
            line-height: 1.1 !important;
            letter-spacing: 0.12em !important;
          }

          .review-v3-subtitle {
            display: none !important;
          }

          .review-v3-card {
            width: 252px;
            height: 76px;
            border-radius: 14px;
            padding: 3px;
          }

          .review-v3-card > div {
            border-radius: 11px;
          }

          .review-v3-track {
            gap: 12px;
          }

          .review-v3-mobile-third {
            display: block !important;
          }

          .review-v3-edge-shadow {
            display: none !important;
          }

          .review-v3-cursor-grid {
            opacity: 0 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .review-v3-track {
            animation: none !important;
            transform: none !important;
          }

          .review-v3-cursor-grid {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}