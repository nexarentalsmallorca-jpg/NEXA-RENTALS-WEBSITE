"use client";

import Image from "next/image";

type ReviewImage = {
  id: number;
  src: string;
  alt: string;
};

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

const topRow = reviews.slice(0, 8);
const bottomRow = reviews.slice(8, 15);

function ReviewCard({ review }: { review: ReviewImage }) {
  return (
    <div className="review-card group/card relative shrink-0 overflow-hidden rounded-[clamp(12px,1.15vw,18px)] border border-white/15 bg-white p-[3px] shadow-[0_16px_45px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.025] hover:border-[#FF7A00]/50 sm:p-[4px]">
      <div className="relative h-full w-full overflow-hidden rounded-[clamp(9px,0.9vw,14px)] bg-black">
        <Image
          src={review.src}
          alt={review.alt}
          fill
          sizes="(max-width: 640px) 220px, (max-width: 1024px) 310px, (max-width: 1440px) 365px, 395px"
          className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
          priority={review.id <= 4}
        />
      </div>
    </div>
  );
}

function ReviewStrip({
  items,
  direction = "left",
  mobileOnly = false,
  desktopOnly = false,
}: {
  items: ReviewImage[];
  direction?: "left" | "right";
  mobileOnly?: boolean;
  desktopOnly?: boolean;
}) {
  const repeated = [...items, ...items, ...items];

  return (
    <div
      className={[
        "group relative overflow-hidden py-[clamp(4px,0.65vw,8px)]",
        mobileOnly ? "block sm:hidden" : "",
        desktopOnly ? "hidden sm:block" : "",
      ].join(" ")}
    >
      <div
        className={[
          "review-track flex w-max will-change-transform group-hover:[animation-play-state:paused]",
          direction === "left"
            ? "animate-[reviewScrollLeft_42s_linear_infinite]"
            : "animate-[reviewScrollRight_42s_linear_infinite]",
        ].join(" ")}
      >
        {repeated.map((review, index) => (
          <ReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function GoogleReviews3D() {
  return (
    <section className="relative isolate overflow-hidden bg-[#090a0d] py-7 sm:py-[clamp(34px,4vw,56px)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.12),transparent_26%),radial-gradient(circle_at_82%_100%,rgba(255,122,0,0.13),transparent_28%),linear-gradient(135deg,#15171d_0%,#090a0d_48%,#1b1d22_100%)]" />

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.09] sm:bg-[size:clamp(48px,4.8vw,70px)_clamp(48px,4.8vw,70px)] sm:opacity-[0.10]" />

      <div className="mx-auto mb-4 max-w-4xl px-4 text-center sm:mb-[clamp(18px,2.4vw,28px)]">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black text-white backdrop-blur-xl sm:mb-3 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[clamp(10px,0.85vw,12px)]">
          <span className="text-[#FF7A00]">★★★★★</span>
          18 Google Reviews
        </div>

        <h2 className="text-[28px] font-black leading-none tracking-[-0.04em] text-white sm:text-[clamp(34px,3.5vw,54px)]">
          Customer Feedback
        </h2>
      </div>

      <div className="relative space-y-[clamp(0px,0.18vw,4px)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-[#090a0d] to-transparent sm:w-[clamp(50px,7vw,140px)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-[#090a0d] to-transparent sm:w-[clamp(50px,7vw,140px)]" />

        {/* Mobile: only one compact row to keep the page shorter */}
        <ReviewStrip items={reviews} direction="left" mobileOnly />

        {/* Desktop/tablet: original two-row premium layout */}
        <ReviewStrip items={topRow} direction="left" desktopOnly />
        <ReviewStrip items={bottomRow} direction="right" desktopOnly />
      </div>

      <style jsx global>{`
        .review-card {
          width: clamp(310px, 24.2vw, 395px);
          height: clamp(94px, 7.2vw, 118px);
        }

        .review-track {
          gap: clamp(12px, 1.15vw, 18px);
        }

        @keyframes reviewScrollLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }

        @keyframes reviewScrollRight {
          from {
            transform: translateX(-33.333%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (min-width: 1024px) and (max-width: 1280px) {
          .review-card {
            width: clamp(305px, 27vw, 345px);
            height: clamp(92px, 8.4vw, 104px);
          }

          .review-track {
            gap: 14px;
          }
        }

        @media (min-width: 1281px) and (max-width: 1536px) {
          .review-card {
            width: clamp(340px, 24vw, 370px);
            height: clamp(102px, 7.5vw, 112px);
          }
        }

        @media (min-width: 1537px) {
          .review-card {
            width: 395px;
            height: 118px;
          }

          .review-track {
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .review-card {
            width: 220px;
            height: 68px;
            border-radius: 12px;
          }

          .review-track {
            gap: 10px;
          }
        }
      `}</style>
    </section>
  );
}