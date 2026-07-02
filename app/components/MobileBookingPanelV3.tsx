"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inter, Poppins } from "next/font/google";
import BookingPanelV3 from "./BookingPanelV3";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const titleFont = Poppins({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
});

type Locale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "sv"
  | "it"
  | "pt"
  | "nl"
  | "pl"
  | "da"
  | "no"
  | "cs"
  | "uk";

type VehicleType = "scooter" | "ebike";

type MobileVehicle = {
  id: string;
  displayName: string;
  shortName: string;
  type: VehicleType;
  subtitle: string;
};

const MOBILE_VEHICLES: MobileVehicle[] = [
  {
    id: "piaggio-liberty",
    displayName: "Piaggio Liberty 125",
    shortName: "Piaggio Liberty",
    type: "scooter",
    subtitle: "125cc scooter rental in Magaluf",
  },
  {
    id: "sym-symphony",
    displayName: "SYM Symphony 125",
    shortName: "SYM Symphony",
    type: "scooter",
    subtitle: "125cc scooter rental in Magaluf",
  },
  {
    id: "ebike-one",
    displayName: "MOMA CITY E-Bike",
    shortName: "MOMA E-Bike",
    type: "ebike",
    subtitle: "Electric bike rental in Magaluf",
  },
  {
    id: "ebike-two",
    displayName: "CECOTEC light MTB E-Bike",
    shortName: "CECOTEC E-Bike",
    type: "ebike",
    subtitle: "Electric bike rental in Magaluf",
  },
];

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

const EBIKE_PRICES = [
  { label: "1 Hour", price: "€9" },
  { label: "2 Hours", price: "€16" },
  { label: "3 Hours", price: "€21" },
  { label: "4 Hours", price: "€25" },
  { label: "1 Day", price: "€28" },
];

function isLocale(value: string | undefined): value is Locale {
  return LANGUAGES.some((language) => language.code === value);
}

function getLocaleFromPath(pathname: string): Locale {
  const firstPart = pathname.split("/").filter(Boolean)[0];

  if (isLocale(firstPart)) {
    return firstPart;
  }

  return "en";
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  const firstPart = parts[0];

  if (isLocale(firstPart)) {
    parts[0] = nextLocale;
    return `/${parts.join("/")}`;
  }

  return `/${nextLocale}${pathname === "/" ? "" : pathname}`;
}

function getSelectedVehicle(vehicleId: string | null): MobileVehicle {
  return (
    MOBILE_VEHICLES.find((vehicle) => vehicle.id === vehicleId) ||
    MOBILE_VEHICLES[0]
  );
}

function MobileBookingLoading() {
  return (
    <main
      className={[
        inter.className,
        "flex min-h-[100svh] items-center justify-center overflow-x-hidden bg-white px-6 text-black",
      ].join(" ")}
    >
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-black" />

        <div className="mt-5 text-[11px] font-black uppercase tracking-[0.24em] text-black/45">
          Loading Booking
        </div>
      </div>
    </main>
  );
}

function MobileEbikePanel({ vehicleName }: { vehicleName: string }) {
  const whatsappMessage = `Hey NEXA Rentals, I want to rent a ${vehicleName}. Is it available?`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappMessage,
  )}`;

  return (
    <div className="w-full bg-white text-black">
      <div className="rounded-[18px] border border-black/10 bg-white p-4">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/42">
          E-Bike Prices
        </div>

        <div className="mt-4 space-y-2">
          {EBIKE_PRICES.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[14px] border border-black/10 bg-white px-3 py-3"
            >
              <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/72">
                {item.label}
              </span>

              <span className="text-[22px] font-black leading-none tracking-[-0.05em] text-black">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-[16px] border border-emerald-500/20 bg-emerald-50 px-3 py-3 text-[13px] font-black leading-5 text-emerald-700">
        For e-bike rentals, please contact us on WhatsApp to confirm live
        availability.
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center rounded-[16px] bg-[#25D366] px-5 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(37,211,102,0.28)] transition active:scale-[0.97]"
      >
        Message Us On WhatsApp
      </a>
    </div>
  );
}

function MobileLanguageSelector({
  locale,
  onChange,
}: {
  locale: Locale;
  onChange: (nextLocale: Locale) => void;
}) {
  const [open, setOpen] = useState(false);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];
  }, [locale]);

  function handleChange(nextLocale: Locale) {
    setOpen(false);
    onChange(nextLocale);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[14px] border border-black/10 bg-white px-3 text-[11px] font-black uppercase tracking-[0.14em] text-black shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl transition active:scale-95"
        aria-label="Select language"
        aria-expanded={open}
      >
        <Image
          src={currentLanguage.flagSrc}
          alt={currentLanguage.label}
          width={17}
          height={17}
          className="rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
        />

        <span>{currentLanguage.short}</span>

        <span
          className={[
            "text-[10px] text-black/52 transition-transform duration-300",
            open ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          ▾
        </span>
      </button>

      <div
        className={[
          "absolute right-0 top-[calc(100%+12px)] z-[120] w-[224px] overflow-hidden rounded-[24px] border border-white/10 bg-black/88 text-white shadow-[0_26px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition-all duration-300",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
        ].join(" ")}
      >
        <div className="px-4 pb-2 pt-4 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/42">
          Select language
        </div>

        <div className="max-h-[360px] overflow-y-auto p-2">
          {LANGUAGES.map((language) => {
            const active = language.code === locale;

            return (
              <button
                key={language.code}
                type="button"
                onClick={() => handleChange(language.code)}
                className={[
                  "group flex w-full items-center justify-between rounded-[18px] px-3 py-2.5 text-left transition active:scale-[0.98]",
                  active
                    ? "bg-white/[0.12] text-white"
                    : "text-white/68 hover:bg-white/[0.065] hover:text-white",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <Image
                    src={language.flagSrc}
                    alt={language.label}
                    width={21}
                    height={21}
                    className="rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.16)]"
                  />

                  <span className="text-sm font-semibold">
                    {language.label}
                  </span>
                </span>

                <span
                  className={[
                    "text-[10px] font-extrabold uppercase tracking-[0.16em]",
                    active
                      ? "text-[#ff7a00]"
                      : "text-white/34 group-hover:text-white/52",
                  ].join(" ")}
                >
                  {active ? "Active" : language.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobileBookingContent() {
  const providerLocale = useLocale();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathLocale = getLocaleFromPath(pathname);
  const locale: Locale = isLocale(providerLocale) ? providerLocale : pathLocale;

  const selectedVehicle = useMemo(() => {
    return getSelectedVehicle(searchParams.get("vehicle"));
  }, [searchParams]);

  useEffect(() => {
    document.body.classList.add("nexa-mobile-booking-page-active");

    return () => {
      document.body.classList.remove("nexa-mobile-booking-page-active");
    };
  }, []);

  function goBackToVehicles() {
    router.push(`/${locale}/home`);
  }

  function handleLanguageChange(nextLocale: Locale) {
    const nextPath = replaceLocaleInPath(pathname, nextLocale);
    const params = new URLSearchParams(searchParams.toString());

    if (!params.get("vehicle")) {
      params.set("vehicle", selectedVehicle.id);
    }

    const queryString = params.toString();
    const finalPath = queryString ? `${nextPath}?${queryString}` : nextPath;

    router.push(finalPath);

    window.setTimeout(() => {
      router.refresh();
    }, 50);
  }

  return (
    <main
      className={[
        inter.className,
        "mobile-booking-v3-page min-h-[100svh] overflow-x-hidden bg-white text-black",
      ].join(" ")}
    >
      <div className="sticky top-0 z-[120] bg-white px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <div className="mx-auto flex w-full max-w-[430px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBackToVehicles}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-black bg-black px-3 text-[12px] font-black uppercase tracking-[0.1em] text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)] transition active:scale-[0.97]"
            aria-label="Back to vehicles"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 5L8 12L15 19"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>Back</span>
          </button>

          <MobileLanguageSelector
            locale={locale}
            onChange={handleLanguageChange}
          />
        </div>
      </div>

      <div className="mobile-booking-content-wrap px-4 pb-[calc(env(safe-area-inset-bottom)+30px)] pt-2">
        <div className="mx-auto w-full max-w-[430px]">
          <section className="mobile-booking-title-section mb-5 bg-white">
            <div className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
              Selected Vehicle
            </div>

            <h1
              className={[
                titleFont.className,
                "mt-2 text-[27px] font-black uppercase leading-[0.95] tracking-[-0.045em] text-black",
              ].join(" ")}
            >
              {selectedVehicle.displayName}
            </h1>

            <p className="mt-2 text-[13px] font-bold leading-5 text-black/54">
              {selectedVehicle.type === "scooter"
                ? "Get up to €43 per day, All Inclusive when renting for 6 days."
                : "Fast electric bike rental in Magaluf. Contact us for live availability."}
            </p>
          </section>

          {selectedVehicle.type === "ebike" ? (
            <MobileEbikePanel vehicleName={selectedVehicle.displayName} />
          ) : (
            <BookingPanelV3
              key={`mobile-booking-${selectedVehicle.id}`}
              vehicleName={selectedVehicle.displayName}
              checkoutBasePath={`/${locale}/checkout`}
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          background: #ffffff !important;
        }

        body.nexa-mobile-booking-page-active {
          background: #ffffff !important;
        }

        body.nexa-mobile-booking-page-active .nero-copilot-wrap,
        body.nexa-mobile-booking-page-active .nero-copilot-wrap > div,
        body.nexa-mobile-booking-page-active .nexa-ai-copilot,
        body.nexa-mobile-booking-page-active .nexa-ai-copilot-card,
        body.nexa-mobile-booking-page-active .nexa-copilot,
        body.nexa-mobile-booking-page-active .booking-copilot,
        body.nexa-mobile-booking-page-active .ai-copilot,
        body.nexa-mobile-booking-page-active [data-nexa-copilot],
        body.nexa-mobile-booking-page-active [data-booking-copilot],
        body.nexa-mobile-booking-page-active [data-ai-copilot] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        .mobile-booking-v3-page {
          width: 100%;
          max-width: 100%;
          -webkit-font-smoothing: antialiased;
          text-rendering: geometricPrecision;
        }

        .mobile-booking-v3-page select,
        .mobile-booking-v3-page button {
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-booking-v3-page .nexa-booking-panel-v3 {
          max-width: 100% !important;
          width: 100% !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .mobile-booking-v3-page .nexa-booking-panel-v3:has(.calendar-months-scroll) {
          position: relative !important;
          z-index: 2147483600 !important;
        }

        .mobile-booking-v3-page .nexa-booking-panel-v3 > div.fixed {
          z-index: 2147483647 !important;
          padding: max(10px, env(safe-area-inset-top)) 10px
            max(10px, env(safe-area-inset-bottom)) !important;
        }

        .mobile-booking-v3-page .nexa-booking-panel-v3 > div.fixed > div {
          display: flex !important;
          max-height: calc(100svh - 20px) !important;
          width: min(430px, calc(100vw - 20px)) !important;
          flex-direction: column !important;
          border-radius: 24px !important;
        }

        .mobile-booking-v3-page
          .nexa-booking-panel-v3
          > div.fixed
          .calendar-months-scroll {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          max-height: min(58vh, calc(100svh - 245px)) !important;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-booking-v3-page .nexa-booking-panel-v3 > div:first-of-type {
          display: none !important;
        }

        .mobile-booking-v3-page .calendar-months-scroll {
          max-height: 62vh !important;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-booking-v3-page .plan-choice-button {
          min-height: 104px;
        }

        .mobile-booking-v3-page .nexa-booking-panel-v3 > div {
          box-shadow: none;
        }

        @media (max-width: 767px) {
          .mobile-booking-v3-page .nexa-booking-panel-v3 {
            padding: 0 !important;
            border-radius: 0 !important;
          }
        }

        @media (max-width: 390px) {
          .mobile-booking-content-wrap {
            padding-left: 12px !important;
            padding-right: 12px !important;
            padding-top: 4px !important;
          }

          .mobile-booking-title-section {
            margin-bottom: 14px !important;
          }

          .mobile-booking-title-section h1 {
            font-size: 24px !important;
            line-height: 0.98 !important;
          }

          .mobile-booking-title-section p {
            font-size: 12px !important;
            line-height: 18px !important;
          }

          .mobile-booking-v3-page .plan-choice-button {
            min-height: 96px !important;
            padding: 10px !important;
            border-radius: 16px !important;
          }

          .mobile-booking-v3-page .plan-choice-button span.text-\\[33px\\] {
            font-size: 29px !important;
          }

          .mobile-booking-v3-page .nexa-booking-panel-v3 select {
            height: 42px !important;
          }

          .mobile-booking-v3-page .nexa-booking-panel-v3 > div.fixed > div {
            width: min(430px, calc(100vw - 16px)) !important;
            max-height: calc(100svh - 16px) !important;
            border-radius: 22px !important;
          }
        }

        @media (max-width: 360px) {
          .mobile-booking-content-wrap {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .mobile-booking-title-section h1 {
            font-size: 22px !important;
          }

          .mobile-booking-v3-page .plan-choice-button {
            min-height: 90px !important;
            padding: 9px !important;
          }

          .mobile-booking-v3-page .plan-choice-button span.text-\\[33px\\] {
            font-size: 26px !important;
          }
        }

        @media (max-height: 760px) and (max-width: 430px) {
          .mobile-booking-content-wrap {
            padding-top: 0 !important;
          }

          .mobile-booking-title-section {
            margin-bottom: 12px !important;
          }

          .mobile-booking-title-section h1 {
            margin-top: 6px !important;
          }

          .mobile-booking-title-section p {
            margin-top: 6px !important;
          }

          .mobile-booking-v3-page .plan-choice-button {
            min-height: 92px !important;
          }

          .mobile-booking-v3-page
            .nexa-booking-panel-v3
            > div.fixed
            .calendar-months-scroll {
            max-height: min(54vh, calc(100svh - 230px)) !important;
          }
        }

        @media (max-height: 680px) and (max-width: 390px) {
          .mobile-booking-title-section h1 {
            font-size: 21px !important;
          }

          .mobile-booking-title-section p {
            font-size: 11.5px !important;
            line-height: 17px !important;
          }

          .mobile-booking-v3-page .plan-choice-button {
            min-height: 86px !important;
          }

          .mobile-booking-v3-page .plan-choice-button span.text-\\[33px\\] {
            font-size: 24px !important;
          }

          .mobile-booking-v3-page
            .nexa-booking-panel-v3
            > div.fixed
            .calendar-months-scroll {
            max-height: min(50vh, calc(100svh - 215px)) !important;
          }
        }
      `}</style>
    </main>
  );
}

export default function MobileBookingPanelV3() {
  return (
    <Suspense fallback={<MobileBookingLoading />}>
      <MobileBookingContent />
    </Suspense>
  );
}