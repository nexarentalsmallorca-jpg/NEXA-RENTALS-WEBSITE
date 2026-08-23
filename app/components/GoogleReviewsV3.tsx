"use client";

import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useLocale } from "next-intl";
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";

const reviewFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-review-montserrat",
});

/*
  TRUST BRAND LOGO SPACING CONTROL

  Desktop gap: change this to control the horizontal space between logos on desktop.
  Example: "60px", "76px", "90px", "110px"
*/
const TRUST_BRAND_DESKTOP_GAP = "30px";
const TRUST_BRAND_LAPTOP_GAP = "0px";
const TRUST_BRAND_MOBILE_GAP = "0px";

const FALLBACK_REVIEW_COUNT = 107;
const FALLBACK_RATING = 5;

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

type TrustBrand = {
  id: number;
  src: string;
  alt: string;
};

type GoogleReviewStats = {
  rating: number;
  reviewCount: number;
};

const COPY: Record<
  Locale,
  {
    title: string;
    rating: string;
    altPrefix: string;
  }
> = {
  en: {
    title: "Loved by scooter riders in Mallorca.",
    rating: "Google Reviews",
    altPrefix: "Google review",
  },
  es: {
    title: "Scooters recomendados por clientes en Mallorca.",
    rating: "Reseñas de Google",
    altPrefix: "Reseña de Google",
  },
  de: {
    title: "Beliebt bei Rollerfahrern auf Mallorca.",
    rating: "Google-Bewertungen",
    altPrefix: "Google-Bewertung",
  },
  fr: {
    title:
      "Apprécié par les conducteurs de scooters à Majorque.",
    rating: "Avis Google",
    altPrefix: "Avis Google",
  },
  it: {
    title: "Amato dai clienti scooter a Maiorca.",
    rating: "Recensioni Google",
    altPrefix: "Recensione Google",
  },
  pt: {
    title: "Adorado por condutores de scooter em Maiorca.",
    rating: "Avaliações Google",
    altPrefix: "Avaliação Google",
  },
  sv: {
    title: "Älskat av scooterförare på Mallorca.",
    rating: "Google-recensioner",
    altPrefix: "Google-recension",
  },
  nl: {
    title: "Geliefd bij scooterrijders in Mallorca.",
    rating: "Google Reviews",
    altPrefix: "Google review",
  },
  pl: {
    title: "Polecane przez kierowców skuterów na Majorce.",
    rating: "Opinie Google",
    altPrefix: "Opinia Google",
  },
  da: {
    title: "Elsket af scooterkunder på Mallorca.",
    rating: "Google-anmeldelser",
    altPrefix: "Google-anmeldelse",
  },
  no: {
    title: "Elsket av scooterførere på Mallorca.",
    rating: "Google-anmeldelser",
    altPrefix: "Google-anmeldelse",
  },
  cs: {
    title:
      "Oblíbené mezi jezdci na skútru na Mallorce.",
    rating: "Recenze Google",
    altPrefix: "Recenze Google",
  },
  uk: {
    title:
      "Улюблений сервіс серед водіїв скутерів на Майорці.",
    rating: "Відгуки Google",
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

function formatRating(
  locale: Locale,
  rating: number
) {
  const value = (
    Number.isFinite(rating)
      ? rating
      : FALLBACK_RATING
  ).toFixed(1);

  return locale === "en"
    ? value
    : value.replace(".", ",");
}

function getDynamicReviewText(
  locale: Locale,
  reviewCount: number,
  rating: number
) {
  const count =
    Number.isFinite(reviewCount) &&
    reviewCount > 0
      ? Math.round(reviewCount)
      : FALLBACK_REVIEW_COUNT;

  const formattedRating = formatRating(
    locale,
    rating
  );

  switch (locale) {
    case "es":
      return {
        reviews: `${count} reseñas en Google`,
        mobileProof: `${formattedRating} estrellas de ${count} reseñas`,
      };

    case "de":
      return {
        reviews: `${count} Bewertungen auf Google`,
        mobileProof: `${formattedRating} Sterne aus ${count} Bewertungen`,
      };

    case "fr":
      return {
        reviews: `${count} avis sur Google`,
        mobileProof: `${formattedRating} étoiles sur ${count} avis`,
      };

    case "it":
      return {
        reviews: `${count} recensioni su Google`,
        mobileProof: `${formattedRating} stelle da ${count} recensioni`,
      };

    case "pt":
      return {
        reviews: `${count} avaliações no Google`,
        mobileProof: `${formattedRating} estrelas em ${count} avaliações`,
      };

    case "sv":
      return {
        reviews: `${count} recensioner på Google`,
        mobileProof: `${formattedRating} stjärnor från ${count} recensioner`,
      };

    case "nl":
      return {
        reviews: `${count} reviews op Google`,
        mobileProof: `${formattedRating} sterren uit ${count} reviews`,
      };

    case "pl":
      return {
        reviews: `${count} opinii w Google`,
        mobileProof: `${formattedRating} gwiazdek z ${count} opinii`,
      };

    case "da":
      return {
        reviews: `${count} anmeldelser på Google`,
        mobileProof: `${formattedRating} stjerner fra ${count} anmeldelser`,
      };

    case "no":
      return {
        reviews: `${count} anmeldelser på Google`,
        mobileProof: `${formattedRating} stjerner fra ${count} anmeldelser`,
      };

    case "cs":
      return {
        reviews: `${count} recenzí na Google`,
        mobileProof: `${formattedRating} hvězdiček ze ${count} recenzí`,
      };

    case "uk":
      return {
        reviews: `${count} відгуків у Google`,
        mobileProof: `${formattedRating} зірок із ${count} відгуків`,
      };

    case "en":
    default:
      return {
        reviews: `${count} Reviews on Google`,
        mobileProof: `${formattedRating} stars from ${count} reviews`,
      };
  }
}

const reviews: ReviewImage[] = [
  {
    id: 1,
    src: "/images/ReviewPNG1.png",
    alt: "Google review 1",
  },
  {
    id: 2,
    src: "/images/ReviewPNG2.png",
    alt: "Google review 2",
  },
  {
    id: 3,
    src: "/images/ReviewPNG3.png",
    alt: "Google review 3",
  },
  {
    id: 4,
    src: "/images/ReviewPNG4.png",
    alt: "Google review 4",
  },
  {
    id: 5,
    src: "/images/ReviewPNG5.png",
    alt: "Google review 5",
  },
  {
    id: 6,
    src: "/images/ReviewPNG6.png",
    alt: "Google review 6",
  },
  {
    id: 7,
    src: "/images/ReviewPNG7.png",
    alt: "Google review 7",
  },
  {
    id: 8,
    src: "/images/ReviewPNG8.png",
    alt: "Google review 8",
  },
  {
    id: 9,
    src: "/images/ReviewPNG9.png",
    alt: "Google review 9",
  },
  {
    id: 10,
    src: "/images/ReviewPNG10.png",
    alt: "Google review 10",
  },
  {
    id: 11,
    src: "/images/ReviewPNG11.png",
    alt: "Google review 11",
  },
  {
    id: 12,
    src: "/images/ReviewPNG12.png",
    alt: "Google review 12",
  },
  {
    id: 13,
    src: "/images/ReviewPNG13.png",
    alt: "Google review 13",
  },
  {
    id: 14,
    src: "/images/ReviewPNG14.png",
    alt: "Google review 14",
  },
  {
    id: 15,
    src: "/images/ReviewPNG15.png",
    alt: "Google review 15",
  },
];

const trustBrands: TrustBrand[] = [
  {
    id: 1,
    src: "/images/ax1.png",
    alt: "Vibe Experience Mallorca",
  },
  {
    id: 2,
    src: "/images/ax2.png",
    alt: "Emotion scooter and bike rental",
  },
  {
    id: 3,
    src: "/images/ax3.png",
    alt: "Jala Fusion",
  },
  {
    id: 4,
    src: "/images/ax4.png",
    alt: "Saffron Desi",
  },
  {
    id: 5,
    src: "/images/ax5.png",
    alt: "Kopi Magaluf",
  },
  {
    id: 6,
    src: "/images/ax6.png",
    alt: "Heaven Tours Mallorca",
  },
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
  const repeated = [
    ...items,
    ...items,
    ...items,
    ...items,
  ];

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
        {repeated.map(
          (review, index) => (
            <ReviewImageCard
              key={`${direction}-${review.id}-${index}`}
              review={review}
              altPrefix={altPrefix}
              priority={index < 4}
            />
          )
        )}
      </div>
    </div>
  );
}

function TrustBrandsStrip() {
  const trustGapStyle = {
    "--trust-brand-gap-desktop":
      TRUST_BRAND_DESKTOP_GAP,
    "--trust-brand-gap-laptop":
      TRUST_BRAND_LAPTOP_GAP,
    "--trust-brand-gap-mobile":
      TRUST_BRAND_MOBILE_GAP,
  } as CSSProperties;

  const repeatedTrustBrands = [
    ...trustBrands,
    ...trustBrands,
    ...trustBrands,
    ...trustBrands,
  ];

  return (
    <div
      style={trustGapStyle}
      className="review-v3-trust-strip relative z-10 w-full border-t border-black/10 bg-[#ffffff]"
    >
      <div className="mx-auto flex min-h-[235px] max-w-[1320px] flex-col items-center justify-center px-5 py-12 text-center sm:px-8 lg:min-h-[245px]">
        <p className="review-v3-trust-title text-center text-[11px] font-extrabold uppercase tracking-[0.32em] text-black sm:text-[12px]">
          Trusted by local brands in Mallorca
        </p>

        <div className="review-v3-trust-logos-desktop mx-auto mt-10 flex w-full max-w-[1080px] flex-row flex-nowrap items-center justify-center">
          {trustBrands.map((brand) => (
            <div
              key={brand.id}
              className="review-v3-trust-logo-box flex h-[78px] w-[185px] shrink-0 items-center justify-center overflow-visible"
            >
              <img
                src={brand.src}
                alt={brand.alt}
                className={`review-v3-trust-logo-img ${
                  brand.id === 0
                    ? "review-v3-trust-logo-img-ax0"
                    : brand.id === 3 ||
                        brand.id === 6
                      ? "review-v3-trust-logo-img-big"
                      : ""
                }`}
              />
            </div>
          ))}
        </div>

        <div className="review-v3-trust-mobile-window mx-auto mt-8 hidden w-full overflow-hidden">
          <div className="review-v3-trust-mobile-track flex w-max will-change-transform">
            {repeatedTrustBrands.map(
              (brand, index) => (
                <div
                  key={`mobile-trust-${brand.id}-${index}`}
                  className="review-v3-trust-logo-box flex h-[68px] w-[150px] shrink-0 items-center justify-center overflow-visible"
                >
                  <img
                    src={brand.src}
                    alt={brand.alt}
                    className="review-v3-trust-logo-img"
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleReviewsV3() {
  const locale = getSafeLocale(
    useLocale()
  );

  const copy = COPY[locale];

  const [googleStats, setGoogleStats] =
    useState<GoogleReviewStats>({
      rating: FALLBACK_RATING,
      reviewCount:
        FALLBACK_REVIEW_COUNT,
    });

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadGoogleReviews() {
      try {
        const response = await fetch(
          "/api/google-reviews",
          {
            method: "GET",
            signal:
              controller.signal,
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data?.ok
        ) {
          console.warn(
            "Could not load live Google review stats:",
            data?.error ||
              response.statusText
          );
          return;
        }

        const reviewCount = Number(
          data.reviewCount
        );

        const rating = Number(
          data.rating
        );

        if (
          Number.isFinite(
            reviewCount
          ) &&
          reviewCount > 0
        ) {
          setGoogleStats({
            reviewCount,
            rating:
              Number.isFinite(
                rating
              ) && rating > 0
                ? rating
                : FALLBACK_RATING,
          });
        }
      } catch (error: any) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.warn(
          "Google review stats request failed:",
          error
        );
      }
    }

    loadGoogleReviews();

    return () => {
      controller.abort();
    };
  }, []);

  const dynamicReviewText =
    getDynamicReviewText(
      locale,
      googleStats.reviewCount,
      googleStats.rating
    );

  function handleMouseMove(
    event: MouseEvent<HTMLElement>
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--review-mouse-x",
      `${
        event.clientX -
        rect.left
      }px`
    );

    event.currentTarget.style.setProperty(
      "--review-mouse-y",
      `${
        event.clientY -
        rect.top
      }px`
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
      className={`${reviewFont.variable} ${reviewFont.className} review-v3-section group/reviews relative isolate overflow-hidden bg-[#ececea] text-black`}
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.88),transparent_31%),radial-gradient(circle_at_82%_92%,rgba(0,0,0,0.105),transparent_35%),linear-gradient(180deg,#f2f2ee_0%,#e2e2df_48%,#eeeeeb_100%)]" />

      <div className="review-v3-cursor-grid pointer-events-none absolute inset-0 -z-20 opacity-0 transition-opacity duration-500 group-hover/reviews:opacity-100" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_52%,rgba(255,255,255,0.38)_100%)]" />

      <div className="pointer-events-none absolute left-[-12%] top-[5%] -z-10 h-[320px] w-[320px] rounded-full bg-black/[0.055] blur-[95px]" />
      <div className="pointer-events-none absolute bottom-[-18%] right-[-8%] -z-10 h-[400px] w-[400px] rounded-full bg-black/[0.065] blur-[110px]" />

      <div className="review-v3-google-content py-[clamp(46px,5vw,78px)]">
        <div className="review-v3-header mx-auto mb-[clamp(26px,3.2vw,46px)] max-w-[1320px] px-5 text-center sm:px-8">
          <div className="review-v3-pill mx-auto inline-flex items-center gap-3 rounded-full border border-black/10 bg-white/75 px-5 py-2.5 shadow-[0_14px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <span className="review-v3-pill-stars text-[12px] tracking-[0.18em] text-black">
              ★★★★★
            </span>

            <span className="review-v3-pill-text text-[10px] uppercase tracking-[0.22em] text-black/55">
              {copy.rating}
            </span>

            <span className="review-v3-pill-proof hidden text-[9px] uppercase tracking-[0.14em] text-black/48">
              {
                dynamicReviewText.mobileProof
              }
            </span>
          </div>

          <h2 className="review-v3-title mx-auto mt-6 max-w-[1160px] text-[clamp(32px,4.8vw,70px)] uppercase leading-[1.02] text-black">
            {copy.title}
          </h2>

          <p className="review-v3-subtitle mt-4 text-[clamp(13px,1.35vw,18px)] uppercase tracking-[0.2em] text-black/48">
            {
              dynamicReviewText.reviews
            }
          </p>
        </div>

        <div className="relative">
          <div className="review-v3-edge-shadow pointer-events-none absolute inset-y-0 left-0 z-20 w-[72px] bg-gradient-to-r from-[#0a0a0a] via-[#141414]/75 to-transparent sm:w-[clamp(110px,12vw,220px)]" />
          <div className="review-v3-edge-shadow pointer-events-none absolute inset-y-0 right-0 z-20 w-[72px] bg-gradient-to-l from-[#0a0a0a] via-[#141414]/75 to-transparent sm:w-[clamp(110px,12vw,220px)]" />

          <ReviewStrip
            items={firstRow}
            direction="left"
            altPrefix={
              copy.altPrefix
            }
          />

          <div className="mt-2">
            <ReviewStrip
              items={secondRow}
              direction="right"
              altPrefix={
                copy.altPrefix
              }
            />
          </div>

          <div className="review-v3-mobile-third mt-2">
            <ReviewStrip
              items={thirdRow}
              direction="left"
              altPrefix={
                copy.altPrefix
              }
            />
          </div>
        </div>
      </div>

      <TrustBrandsStrip />

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
        .review-v3-subtitle,
        .review-v3-trust-title {
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

        .review-v3-trust-strip {
          background: #ffffff !important;
          box-shadow: none !important;
        }

        .review-v3-trust-logos-desktop {
          column-gap: var(--trust-brand-gap-desktop);
        }

        .review-v3-trust-logo-img {
          display: block !important;
          width: auto !important;
          height: auto !important;
          max-width: 100% !important;
          max-height: 70px !important;
          object-fit: contain !important;
          opacity: 1 !important;
          visibility: visible !important;
          transition:
            transform 300ms ease,
            opacity 300ms ease;
        }

        .review-v3-trust-logo-img:hover {
          transform: scale(1.035);
        }

        .review-v3-trust-logo-img-big {
          max-height: 86px !important;
          transform: scale(1.28);
        }

        .review-v3-trust-logo-img-ax0 {
          max-height: 86px !important;
          transform: scale(1.35);
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

        @keyframes trustBrandsMobileScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-25%);
          }
        }

        @media (min-width: 1024px) and (max-width: 1280px) {
          .review-v3-card {
            width: 338px;
            height: 102px;
          }

          .review-v3-trust-logo-img-ax0 {
            max-height: 76px !important;
            transform: scale(1.32);
          }

          .review-v3-trust-logo-img-big {
            max-height: 76px !important;
            transform: scale(1.22);
          }

          .review-v3-track {
            gap: 16px;
          }

          .review-v3-trust-logos-desktop {
            max-width: 940px !important;
            column-gap: var(--trust-brand-gap-laptop) !important;
          }

          .review-v3-trust-logo-box {
            width: 118px !important;
            height: 68px !important;
          }

          .review-v3-trust-logo-img {
            max-height: 66px !important;
          }
        }

        @media (max-width: 640px) {
          .review-v3-google-content {
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

          .review-v3-trust-title {
            color: #000000 !important;
            font-weight: 800 !important;
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

          .review-v3-trust-strip {
            background: #ffffff !important;
            box-shadow: none !important;
          }

          .review-v3-trust-strip > div {
            min-height: 185px !important;
            padding-top: 26px !important;
            padding-bottom: 28px !important;
          }

          .review-v3-trust-title {
            max-width: 310px !important;
            font-size: 9px !important;
            line-height: 1.45 !important;
            letter-spacing: 0.24em !important;
          }

          .review-v3-trust-logos-desktop {
            display: none !important;
          }

          .review-v3-trust-mobile-window {
            display: block !important;
          }

          .review-v3-trust-mobile-window {
            margin-top: 22px !important;
          }

          .review-v3-trust-mobile-track {
            column-gap: var(--trust-brand-gap-mobile);
            animation: trustBrandsMobileScroll 24s linear infinite;
          }

          .review-v3-trust-logo-box {
            width: 150px !important;
            height: 68px !important;
          }

          .review-v3-trust-logo-img {
            max-height: 60px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .review-v3-track,
          .review-v3-trust-mobile-track {
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