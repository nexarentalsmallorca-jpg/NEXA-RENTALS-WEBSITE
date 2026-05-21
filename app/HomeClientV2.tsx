"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Poppins } from "next/font/google";

import Navbar from "./Navbar";
import ShopSection from "./components/ShopSection";
import BookingPanelV2 from "./components/BookingPanelV2";
import GoogleReviews3D from "./components/GoogleReviews3D";
import WhyRidersChooseNexa from "./components/WhyRidersChooseNexa";
import NeroWebsiteAssistant from "./components/NeroWebsiteAssistant";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

type ScooterSlide = {
  id: string;
  name: string;
  bookingName: string;
  image: string;
  imageAlt: string;
  imageStyle: React.CSSProperties;
  mobileImageStyle?: React.CSSProperties;
  shadowStyle?: React.CSSProperties;
  features: string[];
  isEbike?: boolean;
};

type SeasonalHeroPricing = {
  halfDay: number;
  fullDay: number;
  halfOldPrice: number;
  fullOldPrice: number;
};

function getSeasonalHeroPricing(date = new Date()): SeasonalHeroPricing {
  const month = date.getMonth();

  if (month === 4 || month === 5) {
    return {
      halfDay: 34,
      fullDay: 42,
      halfOldPrice: 45,
      fullOldPrice: 55,
    };
  }

  if (month === 6 || month === 7) {
    return {
      halfDay: 39,
      fullDay: 49,
      halfOldPrice: 45,
      fullOldPrice: 55,
    };
  }

  if (month === 8 || month === 9) {
    return {
      halfDay: 36,
      fullDay: 45,
      halfOldPrice: 45,
      fullOldPrice: 55,
    };
  }

  return {
    halfDay: 32,
    fullDay: 39,
    halfOldPrice: 45,
    fullOldPrice: 55,
  };
}

function buildSlides(t: ReturnType<typeof useTranslations>): ScooterSlide[] {
  return [
    {
      id: "piaggio",
      name: "PIAGGIO LIBERTY 125",
      bookingName: "Piaggio Liberty 125",
      image: "/images/piaggio.png",
      imageAlt: "Piaggio Liberty 125",
      imageStyle: {
        transform: "translateX(-115px) translateY(-35px) scale(1.8)",
        pointerEvents: "none",
        userSelect: "none",
      },
      mobileImageStyle: {
        transform: "translateX(-22px) translateY(4px) scale(1.08)",
        pointerEvents: "none",
        userSelect: "none",
      },
      features: [
        t("slides.piaggio.features.0"),
        t("slides.piaggio.features.1"),
        t("slides.piaggio.features.2"),
        t("slides.piaggio.features.3"),
        t("slides.piaggio.features.4"),
        t("slides.piaggio.features.5"),
        t("slides.piaggio.features.6"),
        t("slides.piaggio.features.7"),
      ],
    },
    {
      id: "sym",
      name: "SYM SYMPHONY 125",
      bookingName: "SYM Symphony 125",
      image: "/images/sym1.png",
      imageAlt: "SYM Symphony 125",
      imageStyle: {
        transform: "translateX(-95px) translateY(10px) scale(1.1)",
        pointerEvents: "none",
        userSelect: "none",
      },
      mobileImageStyle: {
        transform: "translateX(-10px) translateY(8px) scale(0.92)",
        pointerEvents: "none",
        userSelect: "none",
      },
      features: [
        t("slides.sym.features.0"),
        t("slides.sym.features.1"),
        t("slides.sym.features.2"),
        t("slides.sym.features.3"),
        t("slides.sym.features.4"),
        t("slides.sym.features.5"),
        t("slides.sym.features.6"),
        t("slides.sym.features.7"),
      ],
    },
    {
      id: "moma e-bike",
      name: "MOMA E-BIKE",
      bookingName: "MOMA E-BIKE",
      image: "/images/ebike1.png",
      imageAlt: "MOMA E-BIKE",
      imageStyle: {
        transform:
          "translateX(-80px) translateY(-100px) scale(1.6) rotate(0deg)",
        pointerEvents: "none",
        userSelect: "none",
      },
      mobileImageStyle: {
        transform: "translateX(-8px) translateY(-8px) scale(1.03)",
        pointerEvents: "none",
        userSelect: "none",
      },
      shadowStyle: {
        width: "100%",
        height: "34px",
        bottom: "34px",
        opacity: 0.99,
      },
      features: [
        t("slides.moma.features.0"),
        t("slides.moma.features.1"),
        t("slides.moma.features.2"),
        t("slides.moma.features.3"),
      ],
      isEbike: true,
    },
    {
      id: "cecotec-ebike",
      name: "CECOTEC e-Xplore MTB E-BIKE",
      bookingName: "CECOTEC e-Xplore MTB E-BIKE",
      image: "/images/ebike2.png",
      imageAlt: "CECOTEC e-Xplore MTB E-BIKE",
      imageStyle: {
        transform:
          "translateX(-70px) translateY(-20px) scale(1.1) rotate(-2deg)",
        pointerEvents: "none",
        userSelect: "none",
      },
      mobileImageStyle: {
        transform: "translateX(-5px) translateY(0px) scale(0.94) rotate(-2deg)",
        pointerEvents: "none",
        userSelect: "none",
      },
      shadowStyle: {
        width: "100%",
        height: "34px",
        bottom: "34px",
        opacity: 0.99,
      },
      features: [
        t("slides.cecotec.features.0"),
        t("slides.cecotec.features.1"),
        t("slides.cecotec.features.2"),
        t("slides.cecotec.features.3"),
      ],
      isEbike: true,
    },
  ];
}

export default function HomeClientV2() {
  const t = useTranslations("home");
  const locale = useLocale();

  const THEME = {
    bg: "#0f1115",
    surface: "rgba(255,255,255,0.035)",
    borderSoft: "rgba(255,255,255,0.08)",
  };

  const slides = useMemo(() => buildSlides(t), [t]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animationTick, setAnimationTick] = useState(0);
  const [heroPricing, setHeroPricing] = useState<SeasonalHeroPricing>(() =>
    getSeasonalHeroPricing()
  );

  const bookingPanelHostRef = useRef<HTMLDivElement | null>(null);

  const activeSlide = useMemo(
    () => slides[activeIndex] || slides[0],
    [slides, activeIndex]
  );

  const isEbike = !!activeSlide.isEbike;

  function goPrev() {
    setDirection("prev");
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setAnimationTick((prev) => prev + 1);
  }

  function goNext() {
    setDirection("next");
    setActiveIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setAnimationTick((prev) => prev + 1);
  }

  function triggerBookingPlan(planType: "half" | "full") {
    if (isEbike) return;

    const root = bookingPanelHostRef.current;
    if (!root) return;

    const buttons = Array.from(root.querySelectorAll("button"));
    const target = buttons.find((btn) => {
      const text = (btn.textContent || "").toLowerCase();
      return planType === "half"
        ? text.includes(t("hero.plans.halfDay").toLowerCase())
        : text.includes(t("hero.plans.fullDay").toLowerCase());
    });

    if (target instanceof HTMLButtonElement) {
      target.click();
    }
  }

  const handleHeroPricingChange = useCallback((pricing: any) => {
    setHeroPricing({
      halfDay: pricing.halfDayPrice,
      fullDay: pricing.fullDayPricing[1],
      halfOldPrice: pricing.halfDayOldPrice,
      fullOldPrice: pricing.fullDayOldPrice,
    });
  }, []);

  const motionKey = `${activeSlide.id}-${activeIndex}-${animationTick}-${direction}`;

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    t("hero.ebike.whatsappMessage", {
      vehicle: activeSlide.bookingName,
    })
  )}`;

  return (
    <div
      className="relative min-h-screen overflow-x-clip text-white"
      style={{ background: THEME.bg }}
    >
      <style jsx global>{`
        @keyframes nexaHeadingIn {
          0% {
            opacity: 0;
            transform: translateY(-44px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes nexaPriceIn {
          0% {
            opacity: 0;
            transform: translateY(-58px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes nexaFeaturesIn {
          0% {
            opacity: 0;
            transform: translateX(-54px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes nexaPanelIn {
          0% {
            opacity: 0;
            transform: translateX(72px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes nexaImageInNext {
          0% {
            opacity: 0;
            transform: translateX(140px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes nexaImageInPrev {
          0% {
            opacity: 0;
            transform: translateX(-140px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes nexaShadowIn {
          0% {
            opacity: 0;
            transform: scale(0.84);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes magicalWhatsAppDance {
          0% {
            transform: scale(1) translateY(0);
            box-shadow: 0 10px 24px rgba(34, 197, 94, 0.28);
          }
          20% {
            transform: scale(1.04) translateY(-2px);
            box-shadow: 0 16px 30px rgba(34, 197, 94, 0.38);
          }
          40% {
            transform: scale(0.995) translateY(0);
            box-shadow: 0 12px 24px rgba(34, 197, 94, 0.3);
          }
          60% {
            transform: scale(1.05) translateY(-1px);
            box-shadow: 0 18px 34px rgba(34, 197, 94, 0.42);
          }
          80% {
            transform: scale(1.01) translateY(0);
            box-shadow: 0 14px 28px rgba(34, 197, 94, 0.34);
          }
          100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 10px 24px rgba(34, 197, 94, 0.28);
          }
        }

        .nexa-animate-heading {
          animation: nexaHeadingIn 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        .nexa-animate-prices {
          animation: nexaPriceIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.06s;
          will-change: transform, opacity;
        }

        .nexa-animate-features {
          animation: nexaFeaturesIn 0.88s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.1s;
          will-change: transform, opacity;
        }

        .nexa-animate-panel {
          animation: nexaPanelIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 0.08s;
          will-change: transform, opacity;
        }

        .nexa-animate-image-next {
          animation: nexaImageInNext 0.95s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        .nexa-animate-image-prev {
          animation: nexaImageInPrev 0.95s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        .nexa-animate-shadow {
          animation: nexaShadowIn 0.95s cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }

        .nexa-whatsapp-magical {
          animation: magicalWhatsAppDance 1.2s ease-in-out infinite;
        }

        .nexa-mobile-hero-panel {
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.96) 0%, rgba(240, 242, 245, 0.94) 36%, rgba(210, 214, 220, 0.96) 100%),
            linear-gradient(180deg, #f9fafb 0%, #d9dde3 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -34px 70px rgba(116, 125, 138, 0.18);
        }

        .nexa-mobile-image-stage {
          position: relative;
          min-height: 275px;
        }

        .nexa-mobile-image-stage::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 24px;
          width: 76%;
          height: 32px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.22);
          filter: blur(17px);
          opacity: 0.28;
          pointer-events: none;
        }

        @media (min-width: 1024px) and (max-width: 1320px) {
          .nexa-hero-grid {
            grid-template-columns: 330px minmax(520px, 1fr) 350px;
          }

          .nexa-hero-left {
            padding-left: 28px !important;
          }

          .nexa-hero-booking {
            transform: translateX(-8px) !important;
          }

          .nexa-hero-scooter-img {
            max-width: 980px !important;
          }
        }

        @media (min-width: 1321px) and (max-width: 1600px) {
          .nexa-hero-grid {
            grid-template-columns: 410px minmax(620px, 1fr) 380px;
          }

          .nexa-hero-left {
            padding-left: 72px !important;
          }

          .nexa-hero-booking {
            transform: translateX(-28px) !important;
          }

          .nexa-hero-scooter-img {
            max-width: 1080px !important;
          }
        }

        @media (min-width: 1601px) {
          .nexa-hero-grid {
            grid-template-columns: 500px minmax(720px, 1fr) 390px;
          }

          .nexa-hero-left {
            padding-left: 160px !important;
          }

          .nexa-hero-booking {
            transform: translateX(-40px) !important;
          }

          .nexa-hero-scooter-img {
            max-width: 1180px !important;
          }
        }

        @media (max-width: 1023px) {
          .nexa-hero-scooter-img-mobile {
            max-width: 315px !important;
          }

          .nexa-mobile-booking-overlap {
            margin-top: -34px;
          }
        }

        @media (max-width: 380px) {
          .nexa-hero-scooter-img-mobile {
            max-width: 292px !important;
          }

          .nexa-mobile-booking-overlap {
            margin-top: -28px;
          }
        }
      `}</style>

      <main className="relative min-w-0 overflow-x-clip">
        <Navbar />

        <section className="relative pb-8 pt-0 lg:-mt-4 lg:pb-14">
          <div className="mx-auto w-full max-w-[1920px]">
            <div className="relative overflow-hidden border-y border-black/10 shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
              <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
                <img
                  src="/images/herobg2.jpg"
                  alt=""
                  className="h-full w-full select-none object-cover"
                  style={{ objectPosition: "center bottom" }}
                  draggable={false}
                />
              </div>

              <div className="pointer-events-none absolute inset-0 z-0 lg:hidden">
                <div className="absolute inset-0 nexa-mobile-hero-panel" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.7),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(0,0,0,0.08),transparent_45%)]" />
              </div>

              <div className="relative z-10 mx-auto w-full max-w-[1720px] px-3 sm:px-5 lg:px-8 2xl:px-10">
                <div className="py-2 sm:py-4 lg:min-h-[720px] lg:py-8 xl:min-h-[760px] 2xl:min-h-[820px]">
                  <div className="nexa-hero-grid grid grid-cols-1 gap-0 lg:min-h-[680px] lg:grid-cols-[410px_minmax(620px,1fr)_380px] lg:items-stretch lg:justify-between lg:gap-8 xl:min-h-[720px] 2xl:min-h-[780px]">
                    <div className="nexa-hero-left relative z-10 order-1 w-full pt-2 lg:shrink-0 lg:pt-4">
                      <div className="rounded-[26px] bg-white/55 px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-sm lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0">
                        <h1
                          key={`heading-${motionKey}`}
                          className={`${poppins.className} nexa-animate-heading min-h-[42px] text-center text-[30px] font-black uppercase leading-none tracking-[-0.04em] text-[#111111] sm:text-[36px] lg:min-h-[68px] lg:text-left lg:text-[44px] xl:min-h-[74px] xl:text-[50px]`}
                        >
                          {activeSlide.name}
                        </h1>

                        <div className="mt-3 grid grid-cols-2 gap-2.5 lg:hidden">
                          <div className="rounded-[16px] border border-white/70 bg-white/74 px-3 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                            <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#b35b00]">
                              {t("hero.badges.includedLabel")}
                            </div>
                            <div className="mt-1 text-[13px] font-black leading-tight text-[#1b1b1b]">
                              {t("hero.badges.includedValue")}
                            </div>
                          </div>

                          <div className="rounded-[16px] border border-white/70 bg-white/74 px-3 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                            <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#b35b00]">
                              {t("hero.badges.freedomLabel")}
                            </div>
                            <div className="mt-1 text-[13px] font-black leading-tight text-[#1b1b1b]">
                              {t("hero.badges.freedomValue")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {!isEbike && (
                        <div
                          key={`prices-${motionKey}`}
                          className="nexa-animate-prices mt-7 hidden items-start gap-4 xl:ml-1 lg:flex"
                        >
                          <button
                            type="button"
                            data-nexa-step="plan-half-day"
                            onClick={() => triggerBookingPlan("half")}
                            className="relative w-[128px] rounded-[24px] border-2 border-[#ff5a2a] bg-white px-3 pb-3 pt-6 text-left shadow-sm transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_28px_rgba(255,106,0,0.14)] active:scale-[0.985] sm:w-[140px] xl:w-[150px]"
                          >
                            <div className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff3b30] to-[#ff9b3d] px-2.5 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.04em] text-black">
                              {t("hero.plans.mostPopular")}
                            </div>

                            <div className="text-center">
                              <div className="text-[24px] font-black text-[#ff3b30] line-through">
                                {heroPricing.halfOldPrice}€
                              </div>
                              <div className="mt-1 text-[40px] font-black text-[#ff7a00]">
                                {heroPricing.halfDay}€
                              </div>
                              <div className="mt-1 text-[14px] font-semibold text-[#222]">
                                {t("hero.plans.halfDay")}
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            data-nexa-step="plan-full-day"
                            onClick={() => triggerBookingPlan("full")}
                            className="w-[122px] rounded-[22px] bg-white px-3 pb-3 pt-5 text-left shadow-sm ring-1 ring-black/6 transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_28px_rgba(0,0,0,0.10)] active:scale-[0.985] sm:w-[132px] xl:w-[140px]"
                          >
                            <div className="text-center">
                              <div className="text-[24px] font-black text-[#ff3b30] line-through">
                                {heroPricing.fullOldPrice}€
                              </div>
                              <div className="mt-1 text-[40px] font-black text-black">
                                {heroPricing.fullDay}€
                              </div>
                              <div className="mt-1 text-[14px] font-semibold text-[#222]">
                                {t("hero.plans.fullDay")}
                              </div>
                            </div>
                          </button>
                        </div>
                      )}

                      <ul
                        key={`features-${motionKey}`}
                        className="nexa-animate-features mt-8 hidden list-disc space-y-[4px] pl-5 text-[15px] text-[#222] marker:text-black lg:block"
                      >
                        {activeSlide.features.map((feature, index) => (
                          <li
                            key={`${activeSlide.id}-${index}`}
                            className="min-h-[24px]"
                          >
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="relative z-[1] order-2 flex min-h-[282px] flex-1 items-center justify-center pt-0 lg:min-h-[650px] lg:items-end xl:min-h-[690px] 2xl:min-h-[740px]">
                      <div className="pointer-events-none relative flex h-full w-full items-center justify-center overflow-visible lg:items-end">
                        <div className="nexa-mobile-image-stage flex w-full items-center justify-center lg:min-h-0 lg:overflow-visible">
                          <div
                            key={`imageWrap-${motionKey}`}
                            className={
                              direction === "next"
                                ? "nexa-animate-image-next"
                                : "nexa-animate-image-prev"
                            }
                          >
                            <img
                              src={activeSlide.image}
                              alt={activeSlide.imageAlt}
                              className="nexa-hero-scooter-img relative z-10 hidden w-full max-w-[1040px] select-none object-contain drop-shadow-[0_34px_42px_rgba(0,0,0,0.24)] lg:block"
                              style={activeSlide.imageStyle}
                              draggable={false}
                            />

                            <img
                              src={activeSlide.image}
                              alt={activeSlide.imageAlt}
                              className="nexa-hero-scooter-img-mobile relative z-10 block w-full max-w-[315px] select-none object-contain drop-shadow-[0_30px_38px_rgba(0,0,0,0.20)] lg:hidden"
                              style={
                                activeSlide.mobileImageStyle ||
                                activeSlide.imageStyle
                              }
                              draggable={false}
                            />
                          </div>

                          <div
                            key={`shadow-${motionKey}`}
                            className="nexa-animate-shadow pointer-events-none absolute z-0 hidden rounded-full bg-black blur-[28px] lg:block"
                            style={{
                              width: activeSlide.shadowStyle?.width || "66%",
                              height: activeSlide.shadowStyle?.height || "56px",
                              bottom: activeSlide.shadowStyle?.bottom || "26px",
                              opacity: activeSlide.shadowStyle?.opacity ?? 0.22,
                            }}
                          />
                        </div>
                      </div>

                      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-[30] -translate-y-1/2 lg:hidden">
                        <button
                          onClick={goPrev}
                          className="pointer-events-auto absolute left-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-black/24 text-[32px] font-light text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:scale-105 hover:bg-black/38"
                          aria-label={t("hero.slider.previous")}
                          type="button"
                        >
                          ‹
                        </button>

                        <button
                          onClick={goNext}
                          className="pointer-events-auto absolute right-0 flex h-11 w-11 items-center justify-center rounded-full border border-white/45 bg-black/24 text-[32px] font-light text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:scale-105 hover:bg-black/38"
                          aria-label={t("hero.slider.next")}
                          type="button"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    <div className="relative z-[50] order-3 w-full lg:flex lg:min-w-0 lg:items-center lg:justify-end">
                      <div
                        key={`right-${motionKey}`}
                        className="nexa-animate-panel nexa-hero-booking nexa-mobile-booking-overlap relative z-[60] mx-auto w-full max-w-[390px] lg:ml-auto"
                        ref={bookingPanelHostRef}
                      >
                        {!isEbike ? (
                          <BookingPanelV2
                            vehicleName={activeSlide.bookingName}
                            onPricingChange={handleHeroPricingChange}
                          />
                        ) : (
                          <div className="overflow-hidden rounded-[30px] border border-black/10 bg-white/90 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm">
                            <div className="rounded-[18px] border border-black/10 bg-[#f7f7f9] px-4 py-3">
                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/45">
                                {t("hero.ebike.vehicle")}
                              </div>
                              <div className="mt-1 text-[16px] font-bold text-[#111]">
                                {activeSlide.bookingName}
                              </div>
                            </div>

                            <div className="mt-4 rounded-[22px] border border-[#ffb37f] bg-gradient-to-br from-[#fff8f1] to-[#fffdf9] p-4">
                              <div className="mb-3 inline-flex rounded-full bg-gradient-to-r from-[#ff7a00] to-[#ffb04d] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black">
                                {t("hero.ebike.whatsappBookingOnly")}
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between border-b border-black/8 pb-2 text-[#111]">
                                  <span className="text-[14px] font-semibold">
                                    {t("hero.ebike.prices.oneHour")}
                                  </span>
                                  <span className="text-[22px] font-black text-[#ff7a00]">
                                    9€
                                  </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-black/8 pb-2 text-[#111]">
                                  <span className="text-[14px] font-semibold">
                                    {t("hero.ebike.prices.twoHours")}
                                  </span>
                                  <span className="text-[22px] font-black text-[#111]">
                                    16€
                                  </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-black/8 pb-2 text-[#111]">
                                  <span className="text-[14px] font-semibold">
                                    {t("hero.ebike.prices.threeHours")}
                                  </span>
                                  <span className="text-[22px] font-black text-[#111]">
                                    20€
                                  </span>
                                </div>
                                <div className="flex items-center justify-between border-b border-black/8 pb-2 text-[#111]">
                                  <span className="text-[14px] font-semibold">
                                    {t("hero.ebike.prices.fourHours")}
                                  </span>
                                  <span className="text-[22px] font-black text-[#111]">
                                    25€
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[#111]">
                                  <span className="text-[14px] font-semibold">
                                    {t("hero.ebike.prices.oneDay")}
                                  </span>
                                  <span className="text-[24px] font-black text-[#111]">
                                    28€
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 rounded-[22px] bg-[#0b1220] p-4 text-white">
                              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                                {t("hero.ebike.reserveTitle")}
                              </div>
                              <p className="mt-2 text-[14px] leading-6 text-white/82">
                                {t("hero.ebike.reserveDescription")}
                              </p>

                              <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noreferrer"
                                className="nexa-whatsapp-magical mt-4 flex h-[54px] w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(34,197,94,0.30)] transition duration-300 hover:scale-[1.02]"
                              >
                                {t("hero.ebike.sendWhatsapp")}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-[100] hidden -translate-y-1/2 lg:block">
                  <button
                    onClick={goPrev}
                    className="pointer-events-auto absolute left-6 z-[110] text-[90px] font-light text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)] transition hover:scale-110 hover:text-[#FF6A00]"
                    aria-label={t("hero.slider.previous")}
                    type="button"
                  >
                    ‹
                  </button>

                  <button
                    onClick={goNext}
                    className="pointer-events-auto absolute right-0 z-[110] text-[90px] font-light text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)] transition hover:scale-110 hover:text-[#FF6A00]"
                    aria-label={t("hero.slider.next")}
                    type="button"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GoogleReviews3D />
      <WhyRidersChooseNexa />
      <NeroWebsiteAssistant />
      <ShopSection />

      <section className="pb-16 pt-10">
        <div className="mx-auto max-w-5xl px-4">
          <div
            className="rounded-[28px] border p-6 backdrop-blur-sm"
            style={{
              background: THEME.surface,
              borderColor: THEME.borderSoft,
            }}
          >
            <h2 className="text-2xl font-bold text-white">
              {t("seo.title")}
            </h2>

            <p className="mt-4 text-white/75">
              {t("seo.beforeLink")}{" "}
              <Link
                href={`/${locale}/scooter-rental-magaluf`}
                className="font-semibold text-orange-500"
              >
                {t("seo.linkText")}
              </Link>{" "}
              {t("seo.afterLink")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}