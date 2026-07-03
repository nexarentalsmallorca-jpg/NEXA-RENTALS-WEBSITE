"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type OpenStatus = {
  isOpen: boolean;
  label: string;
  subLabel: string;
  localTime: string;
};

const ADDRESS = "C. Galeón, 13, Loc 57, 07181 Magaluf, Balearic Islands";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands&z=17&output=embed";

function getMadridTimeStatus(): OpenStatus {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0"
  );

  const totalMinutes = hour * 60 + minute;

  const morningOpen = totalMinutes >= 9 * 60 && totalMinutes < 14 * 60;
  const afternoonOpen = totalMinutes >= 15 * 60 && totalMinutes < 20 * 60;
  const isOpen = morningOpen || afternoonOpen;

  let subLabel = "Open now";

  if (!isOpen) {
    if (totalMinutes < 9 * 60) {
      subLabel = "Opens today at 09:00";
    } else if (totalMinutes >= 14 * 60 && totalMinutes < 15 * 60) {
      subLabel = "Reopens today at 15:00";
    } else {
      subLabel = "Opens tomorrow at 09:00";
    }
  }

  return {
    isOpen,
    label: isOpen ? "OPEN" : "CLOSED",
    subLabel,
    localTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`,
  };
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M9 18.5L3.75 21V6L9 3.5M9 18.5L15 21M9 18.5V3.5M15 21L20.25 18.5V3.5L15 6M15 21V6M15 6L9 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12 21s7-5.25 7-11a7 7 0 1 0-14 0c0 5.75 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5v5l3.25 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LocationV3() {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getMadridTimeStatus());
    };

    updateStatus();

    const interval = window.setInterval(updateStatus, 30 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const statusClasses = useMemo(() => {
    if (!status) return "border-white/15 bg-white/[0.04] text-white";

    return status.isOpen
      ? "border-emerald-400/35 bg-emerald-400/[0.09] text-emerald-300"
      : "border-red-400/35 bg-red-400/[0.09] text-red-300";
  }, [status]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    section.style.setProperty("--nexa-x", `${event.clientX - rect.left}px`);
    section.style.setProperty("--nexa-y", `${event.clientY - rect.top}px`);
    section.classList.add("nexa-location-cursor-active");
  };

  const handleMouseLeave = () => {
    sectionRef.current?.classList.remove("nexa-location-cursor-active");
  };

  return (
    <section
      ref={sectionRef}
      id="location"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${montserrat.className} relative isolate overflow-hidden bg-black px-5 py-8 text-white sm:px-7 lg:px-8`}
    >
      <div className="pointer-events-none absolute inset-0 -z-30 bg-black" />

      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_48%_0%,rgba(255,255,255,0.05),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_45%)]" />

      <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="nexa-cursor-story pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300">
        <div className="absolute left-[-5%] top-[5%] rotate-[-7deg] text-[clamp(26px,4.7vw,62px)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.10]">
          Scooter Rental
        </div>

        <div className="absolute right-[-6%] top-[36%] rotate-[6deg] text-[clamp(24px,4.3vw,56px)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.08]">
          Magaluf Pickup
        </div>

        <div className="absolute bottom-[6%] left-[8%] text-[clamp(24px,4.3vw,56px)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.075]">
          NEXA Rentals
        </div>

        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1.5px)] [background-size:24px_24px]" />
      </div>

      {/* DESKTOP / TABLET ORIGINAL LAYOUT */}
      <div className="nexa-location-desktop-layout relative mx-auto grid max-w-[920px] items-center gap-5 lg:grid-cols-[0.95fr_0.86fr] lg:gap-7">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.025] p-1.5 shadow-[0_18px_46px_rgba(0,0,0,0.48)]">
            <div className="relative overflow-hidden rounded-[13px] border border-white/10 bg-white">
              <iframe
                title="NEXA Rentals Magaluf location map"
                src={GOOGLE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[210px] w-full sm:h-[220px] lg:h-[240px]"
                style={{
                  border: 0,
                  filter: "brightness(1.05) contrast(0.98) saturate(1.08)",
                }}
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-0 rounded-[13px] shadow-[inset_0_0_18px_rgba(255,255,255,0.28),inset_0_0_10px_rgba(0,0,0,0.04)]" />

              <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-black/75 shadow-[0_8px_22px_rgba(0,0,0,0.12)] backdrop-blur-md">
                Interactive Map
              </div>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 rounded-full border border-black/10 bg-white/92 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-black/78 shadow-[0_8px_22px_rgba(0,0,0,0.14)] backdrop-blur-md transition duration-300 hover:scale-[1.05] hover:bg-black hover:text-white"
              >
                View larger map
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-3">
            <div className="mb-2 text-[8px] font-black uppercase tracking-[0.48em] text-white/50">
              Location
            </div>

            <h2 className="max-w-[460px] text-[30px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[36px] lg:text-[40px]">
              Find Us in Magaluf
            </h2>

            <div className="mt-3 h-px w-12 bg-white/52" />

            <p className="mt-3 max-w-[430px] text-[12.5px] font-medium leading-[1.7] tracking-[-0.02em] text-white/68">
              Visit our pickup point in Magaluf. Easy directions and fast
              handover before your ride.
            </p>
          </div>

          <div className="flex items-start gap-2.5 border-b border-white/10 pb-3">
            <div className="mt-0.5 text-white/78">
              <LocationIcon />
            </div>

            <p className="max-w-[430px] text-[12.5px] font-medium leading-[1.55] tracking-[-0.02em] text-white/78">
              {ADDRESS}
            </p>
          </div>

          <div className="grid gap-3 border-b border-white/10 py-3 md:grid-cols-[0.95fr_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[14px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[15px]">
                  09:00 – 14:00
                </div>

                <div className="mt-0.5 text-[14px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[15px]">
                  15:00 – 20:00
                </div>

                <div className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/38">
                  Every day
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-white/10 md:pl-4">
              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${statusClasses}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? "Checking"}
              </div>

              <div className="mt-1.5 text-[11px] font-semibold text-white/72">
                {status?.subLabel ?? "Checking local time"}
              </div>

              <div className="mt-0.5 text-[10px] text-white/34">
                Local time in Mallorca: {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>

          <a
            href={GOOGLE_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="nexa-location-pulse group mt-4 flex w-full items-center justify-between rounded-[14px] bg-white px-4 py-3.5 text-black shadow-[0_0_30px_rgba(255,255,255,0.22)] transition duration-300 hover:bg-neutral-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-125">
                <MapIcon />
              </span>

              <span className="text-[14px] font-black tracking-[-0.035em] sm:text-[16px]">
                Open in your maps
              </span>
            </span>

            <span className="text-2xl font-light leading-none transition duration-300 group-hover:translate-x-1.5">
              ›
            </span>
          </a>
        </div>
      </div>

      {/* MOBILE ONLY COMPACT LAYOUT */}
      <div className="nexa-location-mobile-layout relative mx-auto hidden w-full max-w-[430px]">
        <div className="nexa-location-mobile-top">
          <div className="nexa-location-mobile-map">
            <div className="relative h-full w-full overflow-hidden rounded-[15px] border border-white/12 bg-white p-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.48)]">
              <div className="relative h-full w-full overflow-hidden rounded-[13px] bg-white">
                <iframe
                  title="NEXA Rentals Magaluf location map mobile"
                  src={GOOGLE_MAP_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                  style={{
                    border: 0,
                    filter: "brightness(1.05) contrast(0.98) saturate(1.08)",
                  }}
                  allowFullScreen
                />

                <div className="pointer-events-none absolute inset-0 rounded-[13px] shadow-[inset_0_0_16px_rgba(255,255,255,0.25),inset_0_0_8px_rgba(0,0,0,0.08)]" />

                <div className="pointer-events-none absolute left-[7px] top-[7px] rounded-full border border-black/10 bg-white/90 px-[7px] py-[4px] text-[5.8px] font-black uppercase tracking-[0.15em] text-black/75 shadow-[0_8px_20px_rgba(0,0,0,0.12)] backdrop-blur-md">
                  Interactive Map
                </div>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-[7px] left-[7px] rounded-full border border-black/10 bg-white/92 px-[7px] py-[4px] text-[5.8px] font-black uppercase tracking-[0.12em] text-black/78 shadow-[0_8px_20px_rgba(0,0,0,0.14)] backdrop-blur-md"
                >
                  View larger map
                </a>
              </div>
            </div>
          </div>

          <div className="nexa-location-mobile-info">
            <div className="text-[6px] font-black uppercase tracking-[0.35em] text-white/42">
              Location
            </div>

            <h2 className="mt-[5px] text-[21px] font-black leading-[0.94] tracking-[-0.07em] text-white">
              Find Us in Magaluf
            </h2>

            <div className="mt-[8px] h-px w-[32px] bg-white/45" />

            <div className="mt-[9px] flex items-start gap-[7px]">
              <div className="mt-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[11px] font-bold leading-[1.08] tracking-[-0.04em] text-white">
                  09:00 – 14:00
                </div>

                <div className="mt-[2px] text-[11px] font-bold leading-[1.08] tracking-[-0.04em] text-white">
                  15:00 – 20:00
                </div>

                <div className="mt-[4px] text-[6px] font-black uppercase tracking-[0.16em] text-white/35">
                  Every day
                </div>
              </div>
            </div>

            <div className="mt-[10px]">
              <div
                className={`inline-flex items-center gap-[5px] rounded-[7px] border px-[7px] py-[4px] text-[6.5px] font-black uppercase tracking-[0.15em] ${statusClasses}`}
              >
                <span
                  className={`h-[5px] w-[5px] rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? "Checking"}
              </div>

              <div className="mt-[5px] text-[8px] font-semibold leading-[1.25] text-white/70">
                {status?.subLabel ?? "Checking local time"}
              </div>

              <div className="mt-[2px] text-[7px] leading-[1.25] text-white/34">
                Mallorca: {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>
        </div>

        <a
          href={GOOGLE_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="nexa-location-pulse group mt-[13px] flex w-full items-center justify-between rounded-[13px] bg-white px-[13px] py-[11px] text-black shadow-[0_0_26px_rgba(255,255,255,0.22)] transition duration-300 hover:bg-neutral-100"
        >
          <span className="flex items-center gap-[9px]">
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-110">
              <MapIcon />
            </span>

            <span className="text-[12px] font-black tracking-[-0.035em]">
              Open in your maps
            </span>
          </span>

          <span className="text-[22px] font-light leading-none transition duration-300 group-hover:translate-x-1.5">
            ›
          </span>
        </a>
      </div>

      <style jsx global>{`
        .nexa-location-cursor-active .nexa-cursor-story {
          opacity: 1;
        }

        .nexa-cursor-story {
          -webkit-mask-image: radial-gradient(
            circle 155px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.82) 34%,
            rgba(0, 0, 0, 0.18) 58%,
            transparent 75%
          );
          mask-image: radial-gradient(
            circle 155px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.82) 34%,
            rgba(0, 0, 0, 0.18) 58%,
            transparent 75%
          );
        }

        .nexa-location-mobile-layout {
          display: none;
        }

        @keyframes nexaLocationPulse {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 22px rgba(255, 255, 255, 0.18),
              0 12px 30px rgba(0, 0, 0, 0.28);
          }

          10% {
            transform: scale(1.065);
            box-shadow:
              0 0 72px rgba(255, 255, 255, 0.42),
              0 18px 48px rgba(0, 0, 0, 0.38);
          }

          20% {
            transform: scale(1);
            box-shadow:
              0 0 26px rgba(255, 255, 255, 0.2),
              0 12px 30px rgba(0, 0, 0, 0.28);
          }

          32% {
            transform: scale(1.04);
            box-shadow:
              0 0 58px rgba(255, 255, 255, 0.34),
              0 18px 44px rgba(0, 0, 0, 0.36);
          }

          46% {
            transform: scale(1);
          }

          100% {
            transform: scale(1);
          }
        }

        .nexa-location-pulse {
          position: relative;
          overflow: hidden;
          animation: nexaLocationPulse 1.15s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .nexa-location-pulse::after {
          content: "";
          position: absolute;
          inset: -70% auto -70% -55%;
          width: 38%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.98),
            transparent
          );
          opacity: 0.9;
          animation: nexaLocationShine 1.65s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes nexaLocationShine {
          0% {
            left: -55%;
          }

          50%,
          100% {
            left: 130%;
          }
        }

        .nexa-location-pulse:hover {
          animation-play-state: paused;
          transform: scale(1.045);
          box-shadow:
            0 0 80px rgba(255, 255, 255, 0.42),
            0 24px 64px rgba(0, 0, 0, 0.44);
        }

        .nexa-location-pulse:active {
          transform: scale(0.96);
        }

        @media (max-width: 767px) {
          #location {
            padding: 22px 12px 28px !important;
          }

          .nexa-location-desktop-layout {
            display: none !important;
          }

          .nexa-location-mobile-layout {
            display: block !important;
          }

          .nexa-location-mobile-top {
            display: grid !important;
            grid-template-columns: 44% 1fr !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .nexa-location-mobile-map {
            height: 184px !important;
            min-width: 0 !important;
          }

          .nexa-location-mobile-info {
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding-bottom: 2px !important;
          }

          .nexa-cursor-story {
            display: none !important;
          }
        }

        @media (max-width: 390px) {
          .nexa-location-mobile-top {
            grid-template-columns: 42% 1fr !important;
            gap: 10px !important;
          }

          .nexa-location-mobile-map {
            height: 176px !important;
          }
        }

        @media (max-width: 350px) {
          .nexa-location-mobile-top {
            grid-template-columns: 40% 1fr !important;
            gap: 9px !important;
          }

          .nexa-location-mobile-map {
            height: 168px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-location-pulse,
          .nexa-location-pulse::after {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}