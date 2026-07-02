"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { Inter, Manrope, Montserrat, Poppins } from "next/font/google";
import NavbarV3 from "../NavbarV3";
import BookingPanelV3 from "./BookingPanelV3";
import GoogleReviewsV3 from "./GoogleReviewsV3";
import NexaStatsStripV3 from "./NexaStatsStripV3";
import MallorcaScooterRentalGuideHub from "../components/MallorcaScooterRentalGuideHub";
import NeroWebsiteAssistant from "../components/NeroWebsiteAssistant";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type VehicleFeature = {
  image: string;
  label: string;
};

type VehicleSlide = {
  id: string;
  name: string;
  displayName: string;
  image: string;
  alt: string;
  features: VehicleFeature[];
};

type MobileDirectHeroSpec = {
  image: string;
  label: string;
};

type MobileDirectHeroSlide = {
  id: string;
  vehicleId: string;
  name: string;
  image: string;
  alt: string;
  specs: MobileDirectHeroSpec[];
};

type OpenStatus = {
  isOpen: boolean;
  label: string;
  subLabel: string;
  localTime: string;
};

declare global {
  interface Window {
    __nexaTriggerBookingPanelAttention?: boolean;
  }
}

const PIAGGIO_FEATURES: VehicleFeature[] = [
  { image: "/images/engine.png", label: "125CC ENGINE" },
  { image: "/images/people.png", label: "2 PASSENGERS" },
  { image: "/images/speed.png", label: "TOP SPEED 100 KM/H" },
  { image: "/images/helmet.png", label: "FREE 2 HELMETS INCLUDED" },
  { image: "/images/phone.png", label: "FREE PHONE MOUNT INCLUDED" },
  { image: "/images/lock.png", label: "FREE LOCK INCLUDED" },
  { image: "/images/box.png", label: "FREE TOP CASE INCLUDED" },
  { image: "/images/1111.png", label: "UNLIMITED KILOMETERS" },
];

const SYM_FEATURES: VehicleFeature[] = [
  { image: "/images/engine.png", label: "125CC ENGINE" },
  { image: "/images/people.png", label: "2 PASSENGERS" },
  { image: "/images/speed.png", label: "TOP SPEED 110 KM/H" },
  { image: "/images/helmet.png", label: "FREE 2 HELMETS INCLUDED" },
  { image: "/images/phone.png", label: "FREE PHONE MOUNT INCLUDED" },
  { image: "/images/lock.png", label: "FREE LOCK INCLUDED" },
  { image: "/images/box.png", label: "FREE TOP CASE INCLUDED" },
  { image: "/images/1111.png", label: "UNLIMITED KILOMETERS" },
];

const MOMA_EBIKE_FEATURES: VehicleFeature[] = [
  { image: "/images/people.png", label: "1 RIDER" },
  { image: "/images/speed.png", label: "25 KM/H PEDAL ASSIST" },
  { image: "/images/helmet.png", label: "HELMET INCLUDED" },
  { image: "/images/lock.png", label: "LOCK INCLUDED" },
  { image: "/images/1111.png", label: "100KM RANGE" },
];

const CECOTEC_EBIKE_FEATURES: VehicleFeature[] = [
  { image: "/images/people.png", label: "1 RIDER" },
  { image: "/images/speed.png", label: "25 KM/H PEDAL ASSIST" },
  { image: "/images/helmet.png", label: "HELMET INCLUDED" },
  { image: "/images/lock.png", label: "LOCK INCLUDED" },
  { image: "/images/1111.png", label: "60KM RANGE" },
];

const VEHICLE_SLIDES: VehicleSlide[] = [
  {
    id: "piaggio-liberty",
    name: "Piaggio Liberty",
    displayName: "Piaggio Liberty 125",
    image: "/images/piaggio-liberty-v4.0.png",
    alt: "Piaggio Liberty 125 NEXA Rentals",
    features: PIAGGIO_FEATURES,
  },
  {
    id: "sym-symphony",
    name: "SYM Symphony",
    displayName: "SYM Symphony 125",
    image: "/images/sym3.png",
    alt: "SYM Symphony 125 NEXA Rentals",
    features: SYM_FEATURES,
  },
  {
    id: "ebike-one",
    name: "E-Bike",
    displayName: "MOMA CITY E-Bike",
    image: "/images/ebike1.0.png",
    alt: "NEXA Rentals electric bike",
    features: MOMA_EBIKE_FEATURES,
  },
  {
    id: "ebike-two",
    name: "E-Bike",
    displayName: "CECOTEC light MTB E-Bike",
    image: "/images/ebike2.0.png",
    alt: "NEXA Rentals premium electric bike",
    features: CECOTEC_EBIKE_FEATURES,
  },
];

const MOBILE_DIRECT_HERO_SLIDES: MobileDirectHeroSlide[] = [
  {
  id: "mobile-piaggio-liberty",
  vehicleId: "piaggio-liberty",
  name: "Piaggio Liberty 125",
  image: "/images/piaggiomobile1.png",
  alt: "Piaggio Liberty 125 scooter rental NEXA Rentals Magaluf",
  specs: [
    { image: "/images/engine.png", label: "125CC" },
    { image: "/images/people.png", label: "2 Riders" },
    { image: "/images/speed.png", label: "100 KM/H" },
    { image: "/images/1111.png", label: "All Inclusive" },
  ],
},
{
  id: "mobile-sym-symphony",
  vehicleId: "sym-symphony",
  name: "SYM Symphony 125",
  image: "/images/symmobile1.png",
  alt: "SYM Symphony 125 scooter rental NEXA Rentals Magaluf",
  specs: [
    { image: "/images/engine.png", label: "125CC" },
    { image: "/images/people.png", label: "2 Riders" },
    { image: "/images/speed.png", label: "110 KM/H" },
    { image: "/images/1111.png", label: "All Inclusive" },
  ],
},
  {
    id: "mobile-ebike-one",
    vehicleId: "ebike-one",
    name: "MOMA CITY E-Bike",
    image: "/images/ebikemobile1.png",
    alt: "E Bike rental NEXA Rentals Magaluf",
    specs: [
      { image: "/images/people.png", label: "1 Rider" },
      { image: "/images/speed.png", label: "25 KM/H" },
      { image: "/images/1111.png", label: "100KM Range" },
      { image: "/images/lock.png", label: "Lock Included" },
    ],
  },
  {
    id: "mobile-ebike-two",
    vehicleId: "ebike-two",
    name: "CECOTEC light MTB E-Bike",
    image: "/images/ebikemobile2.png",
    alt: "E Bike rental NEXA Rentals Magaluf",
    specs: [
      { image: "/images/people.png", label: "1 Rider" },
      { image: "/images/speed.png", label: "25 KM/H" },
      { image: "/images/1111.png", label: "60KM Range" },
      { image: "/images/lock.png", label: "Lock Included" },
    ],
  },
];

const EBIKE_PRICES = [
  { label: "1 Hour", price: "€9" },
  { label: "2 Hours", price: "€16" },
  { label: "3 Hours", price: "€21" },
  { label: "4 Hours", price: "€25" },
  { label: "1 Day", price: "€28" },
];

const LOCATION_ADDRESS =
  "C. Galeón, 13, Loc 57, 07181 Magaluf, Balearic Islands";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands&z=17&output=embed";

function getMallorcaOpenStatus(): OpenStatus {
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
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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

function TypedLine({
  text,
  className,
  delayMs = 0,
}: {
  text: string;
  className: string;
  delayMs?: number;
}) {
  return (
    <span
      className={`typed-unpack ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {text}
    </span>
  );
}

function LocationV3() {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getMallorcaOpenStatus());
    };

    updateStatus();

    const interval = window.setInterval(updateStatus, 30 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const statusClasses = useMemo(() => {
    if (!status) {
      return "border-white/15 bg-white/[0.04] text-white";
    }

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
      className={`${montserrat.className} relative isolate overflow-hidden bg-black px-5 py-12 text-white sm:px-8 lg:px-10`}
    >
      <div className="pointer-events-none absolute inset-0 -z-30 bg-black" />

      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.055),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_42%)]" />

      <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="nexa-location-reveal pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300">
        <div className="absolute left-[-10%] top-[7%] w-[46%] rotate-[-4deg] text-[13px] font-semibold uppercase leading-[1.9] tracking-[0.16em] text-white/[0.18]">
          <p>
            NEXA Rentals was built in Magaluf for travellers who want a faster,
            cleaner and easier way to move around Mallorca. From our pickup point
            on C. Galeón, riders can reach the beach, Palmanova, Portals,
            viewpoints, hotels and coastal roads without waiting for taxis or
            buses.
          </p>

          <p className="mt-6">
            Every rental is prepared with simple handover, clear instructions,
            helmets, lock, phone holder and local support. The idea is simple:
            arrive, collect your scooter or e-bike, and start exploring the
            island with freedom.
          </p>
        </div>

        <div className="absolute right-[-8%] top-[12%] w-[44%] rotate-[4deg] text-[12px] font-semibold uppercase leading-[1.95] tracking-[0.18em] text-white/[0.16]">
          <p>
            We are located in the heart of Magaluf, close to hotels, restaurants,
            BCM, the beach and the main tourist streets. This location makes
            pickup easy for customers staying in Magaluf, Palmanova, Son Matias
            and nearby areas.
          </p>

          <p className="mt-6">
            NEXA is made for quick movement, honest prices and a premium rental
            experience without hidden stress. Pick up, ride, return and enjoy
            Mallorca your own way.
          </p>
        </div>

        <div className="absolute bottom-[6%] left-[4%] right-[4%] grid gap-6 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 text-white/[0.20] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.38em]">
              Founded in Magaluf
            </div>
            <p className="mt-4 text-[13px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
              A local pickup point designed for tourists who want simple,
              reliable mobility from the centre of Magaluf.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 text-white/[0.20] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.38em]">
              Ride Mallorca
            </div>
            <p className="mt-4 text-[13px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
              Beach routes, mountain roads, coastal views, nearby towns and fast
              movement without depending on transport.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 text-white/[0.20] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.38em]">
              Fast Handover
            </div>
            <p className="mt-4 text-[13px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
              Bring your licence and ID, collect your vehicle, get the
              instructions and start riding in minutes.
            </p>
          </div>
        </div>

        <div className="absolute left-[-5%] top-[34%] text-[clamp(54px,8vw,132px)] font-black uppercase leading-none tracking-[-0.09em] text-white/[0.10]">
          NEXA RENTALS
        </div>

        <div className="absolute right-[-5%] top-[48%] text-[clamp(44px,7vw,112px)] font-black uppercase leading-none tracking-[-0.09em] text-white/[0.08]">
          MAGALUF PICKUP
        </div>

        <div className="absolute inset-0 opacity-55 [background-image:radial-gradient(circle,rgba(255,255,255,0.26)_1px,transparent_1.5px)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1180px] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[22px] border border-white/13 bg-white/[0.025] p-2 shadow-[0_22px_65px_rgba(0,0,0,0.5)]">
            <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-white">
              <iframe
                title="NEXA Rentals Magaluf location map"
                src={GOOGLE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[285px] w-full sm:h-[315px] lg:h-[350px]"
                style={{
                  border: 0,
                  filter: "brightness(1.06) contrast(0.98) saturate(1.1)",
                }}
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-0 rounded-[16px] shadow-[inset_0_0_20px_rgba(255,255,255,0.22),inset_0_0_12px_rgba(0,0,0,0.04)]" />

              <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-black/10 bg-white/92 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-black/78 shadow-[0_8px_22px_rgba(0,0,0,0.13)] backdrop-blur-md">
                Interactive Map
              </div>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-4 rounded-full border border-black/10 bg-white/94 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.17em] text-black/80 shadow-[0_8px_22px_rgba(0,0,0,0.15)] backdrop-blur-md transition duration-300 hover:scale-[1.04] hover:bg-black hover:text-white"
              >
                View larger map
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-5">
            <div className="mb-3 text-[9px] font-black uppercase tracking-[0.58em] text-white/52">
              Location
            </div>

            <h2
              className="max-w-[560px] text-[38px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[46px] lg:text-[52px]"
              style={{ fontFamily: montserrat.style.fontFamily }}
            >
              Find Us in Magaluf
            </h2>

            <div className="mt-4 h-px w-16 bg-white/55" />

            <p className="mt-5 max-w-[520px] text-[14px] font-medium leading-[1.75] tracking-[-0.02em] text-white/70 sm:text-[15px]">
              Visit our pickup point in Magaluf. Easy directions and fast
              handover before your ride.
            </p>
          </div>

          <div className="flex items-start gap-3 border-b border-white/10 pb-4">
            <div className="mt-0.5 text-white/78">
              <LocationIcon />
            </div>

            <p className="max-w-[520px] text-[13.5px] font-semibold leading-[1.55] tracking-[-0.02em] text-white/80 sm:text-[14.5px]">
              {LOCATION_ADDRESS}
            </p>
          </div>

          <div className="grid gap-4 border-b border-white/10 py-4 md:grid-cols-[0.95fr_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[16px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[17px]">
                  09:00 – 14:00
                </div>

                <div className="mt-0.5 text-[16px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[17px]">
                  15:00 – 20:00
                </div>

                <div className="mt-1.5 text-[8.5px] font-black uppercase tracking-[0.2em] text-white/38">
                  Every day
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-white/10 md:pl-5">
              <div
                className={`inline-flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-[9.5px] font-black uppercase tracking-[0.18em] ${statusClasses}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? "Checking"}
              </div>

              <div className="mt-2 text-[12px] font-semibold text-white/72">
                {status?.subLabel ?? "Checking local time"}
              </div>

              <div className="mt-0.5 text-[10.5px] text-white/34">
                Local time in Mallorca: {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>

          <a
            href={GOOGLE_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="nexa-location-pulse group mt-5 flex w-full items-center justify-between rounded-[16px] bg-white px-5 py-4 text-black shadow-[0_0_32px_rgba(255,255,255,0.2)] transition duration-300 hover:bg-neutral-100"
          >
            <span className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-110">
                <MapIcon />
              </span>

              <span className="text-[16px] font-black tracking-[-0.035em] sm:text-[18px]">
                Open in your maps
              </span>
            </span>

            <span className="text-3xl font-light leading-none transition duration-300 group-hover:translate-x-1">
              ›
            </span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .nexa-location-cursor-active .nexa-location-reveal {
          opacity: 1;
        }

        .nexa-location-reveal {
          -webkit-mask-image: radial-gradient(
            circle 320px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.95) 32%,
            rgba(0, 0, 0, 0.5) 58%,
            transparent 78%
          );
          mask-image: radial-gradient(
            circle 320px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.95) 32%,
            rgba(0, 0, 0, 0.5) 58%,
            transparent 78%
          );
        }

        @keyframes nexaLocationPulse {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 24px rgba(255, 255, 255, 0.16),
              0 14px 34px rgba(0, 0, 0, 0.3);
          }

          18% {
            transform: scale(1.025);
            box-shadow:
              0 0 46px rgba(255, 255, 255, 0.28),
              0 18px 44px rgba(0, 0, 0, 0.34);
          }

          34% {
            transform: scale(1);
            box-shadow:
              0 0 26px rgba(255, 255, 255, 0.17),
              0 14px 34px rgba(0, 0, 0, 0.3);
          }

          52% {
            transform: scale(1.014);
            box-shadow:
              0 0 38px rgba(255, 255, 255, 0.23),
              0 16px 40px rgba(0, 0, 0, 0.32);
          }

          70%,
          100% {
            transform: scale(1);
          }
        }

        .nexa-location-pulse {
          position: relative;
          overflow: hidden;
          animation: nexaLocationPulse 1.8s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .nexa-location-pulse::after {
          content: "";
          position: absolute;
          inset: -65% auto -65% -50%;
          width: 32%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.9),
            transparent
          );
          opacity: 0.72;
          animation: nexaLocationShine 2.5s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes nexaLocationShine {
          0% {
            left: -50%;
          }

          48%,
          100% {
            left: 128%;
          }
        }

        .nexa-location-pulse:hover {
          animation-play-state: paused;
          transform: scale(1.02);
          box-shadow:
            0 0 56px rgba(255, 255, 255, 0.32),
            0 24px 56px rgba(0, 0, 0, 0.42);
        }

        .nexa-location-pulse:active {
          transform: scale(0.98);
        }

        @media (max-width: 767px) {
          #location {
            padding-top: 44px;
            padding-bottom: 48px;
          }

          .nexa-location-reveal {
            display: none;
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

function EbikeWhatsAppPanel({ vehicleName }: { vehicleName: string }) {
  const whatsappMessage = `Hey NEXA Rentals, I am looking to rent a ${vehicleName}. Is it available?`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="nexa-ebike-panel relative z-20 w-full rounded-[28px] border border-black/10 bg-white p-4 text-black shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="rounded-[18px] border border-black/10 bg-[linear-gradient(135deg,#ff7a00_0%,#ff9f1c_45%,#ffc15a_100%)]/[0.03] px-3 py-3">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
          Vehicle
        </div>
        <div className="mt-0.5 truncate text-[15px] font-black text-black">
          {vehicleName}
        </div>
      </div>

      <div className="mt-3 rounded-[18px] border border-black/10 bg-black/[0.03] p-3">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/46">
          E-Bike Prices
        </div>

        <div className="mt-3 space-y-2">
          {EBIKE_PRICES.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[14px] border border-black/10 bg-white px-3 py-2.5"
            >
              <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/72">
                {item.label}
              </span>

              <span className="text-[20px] font-black leading-none tracking-[-0.05em] text-black">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-[16px] border border-emerald-500/20 bg-emerald-50 px-3 py-3 text-[17px] font-black leading-5 text-emerald-700">
        For e-bike rentals, please contact us on WhatsApp to confirm live
        availability. Looking to rent more days? Message us on WhatsApp.
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ebike-whatsapp-button mt-3 flex w-full items-center justify-center rounded-[16px] bg-[#25D366] px-5 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(37,211,102,0.36)] transition hover:-translate-y-1 hover:bg-[#1fc15b] hover:shadow-[0_24px_58px_rgba(37,211,102,0.46)] active:translate-y-0 active:scale-[0.97]"
      >
        Message Us On WhatsApp
      </a>

      <style jsx>{`
        .nexa-ebike-panel {
          max-width: 410px;
        }

        .ebike-whatsapp-button {
          animation: ebikeWhatsappHeartbeat 1.75s ease-in-out infinite;
        }

        .ebike-whatsapp-button:hover {
          animation: none;
        }

        @keyframes ebikeWhatsappHeartbeat {
          0% {
            transform: scale(1);
          }

          14% {
            transform: scale(1.025);
          }

          28% {
            transform: scale(1);
          }

          42% {
            transform: scale(1.018);
          }

          58% {
            transform: scale(1);
          }

          100% {
            transform: scale(1);
          }
        }

        @media (max-width: 767px) {
          .nexa-ebike-panel {
            max-width: 100%;
            border-radius: 22px;
            padding: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ebike-whatsapp-button {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function NexaBookingShowroomV3() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);
  const [bookingPanelAttention, setBookingPanelAttention] = useState(false);
  const bookingAttentionTimeoutRef = useRef<number | null>(null);

  const slideCount = VEHICLE_SLIDES.length;
  const mobileHeroSlideCount = MOBILE_DIRECT_HERO_SLIDES.length;

  const activeVehicle = useMemo(() => {
    return VEHICLE_SLIDES[activeIndex] || VEHICLE_SLIDES[0];
  }, [activeIndex]);

  const activeMobileHeroSlide = useMemo(() => {
    return (
      MOBILE_DIRECT_HERO_SLIDES[mobileHeroIndex] || MOBILE_DIRECT_HERO_SLIDES[0]
    );
  }, [mobileHeroIndex]);

  const isActiveVehicleEbike = activeVehicle.id.startsWith("ebike");

const isDesktopShowroomViewport = () => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(min-width: 1024px)").matches;
};

const forceDesktopShowroomTop = () => {
  if (!isDesktopShowroomViewport()) return;

  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const bookingSection = document.getElementById("booking");

  if (bookingSection) {
    bookingSection.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }

  window.dispatchEvent(new Event("scroll"));
  window.dispatchEvent(new Event("resize"));
};

const syncMobileVehicleToDesktopVehicle = (mobileIndex: number) => {
    const mobileSlide =
      MOBILE_DIRECT_HERO_SLIDES[mobileIndex] || MOBILE_DIRECT_HERO_SLIDES[0];

    const matchedVehicleIndex = VEHICLE_SLIDES.findIndex(
      (vehicle) => vehicle.id === mobileSlide.vehicleId
    );

    if (matchedVehicleIndex >= 0) {
      setActiveIndex(matchedVehicleIndex);
    }
  };

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? slideCount - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current === slideCount - 1 ? 0 : current + 1));
  };

  const goToPreviousMobileHero = () => {
    setMobileHeroIndex((current) => {
      const nextIndex = current === 0 ? mobileHeroSlideCount - 1 : current - 1;
      syncMobileVehicleToDesktopVehicle(nextIndex);
      return nextIndex;
    });
  };

  const goToNextMobileHero = () => {
    setMobileHeroIndex((current) => {
      const nextIndex = current === mobileHeroSlideCount - 1 ? 0 : current + 1;
      syncMobileVehicleToDesktopVehicle(nextIndex);
      return nextIndex;
    });
  };

  const triggerBookingPanelAttention = () => {
    if (bookingAttentionTimeoutRef.current) {
      window.clearTimeout(bookingAttentionTimeoutRef.current);
    }

    setBookingPanelAttention(false);

    window.setTimeout(() => {
      setBookingPanelAttention(true);
    }, 30);

    bookingAttentionTimeoutRef.current = window.setTimeout(() => {
      setBookingPanelAttention(false);
      bookingAttentionTimeoutRef.current = null;
    }, 3000);
  };

  const getBookingTargetElement = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return (
        document.getElementById("mobile-booking-panel") ||
        document.getElementById("booking")
      );
    }

    return document.getElementById("booking");
  };

  const handleBookNowClick = () => {
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    const locale =
      window.location.pathname.split("/").filter(Boolean)[0] || "en";

    const vehicleId = activeMobileHeroSlide.vehicleId;

    window.location.href = `/${locale}/mobile-booking?vehicle=${encodeURIComponent(
      vehicleId,
    )}`;

    return;
  }

  const bookingElement = getBookingTargetElement();

  if (bookingElement) {
    bookingElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  triggerBookingPanelAttention();
};

  useEffect(() => {
  const runDesktopTopReset = () => {
    forceDesktopShowroomTop();
  };

  const handleGlobalBookClick = () => {
    const bookingElement = getBookingTargetElement();

    if (bookingElement) {
      bookingElement.scrollIntoView({
        behavior: isDesktopShowroomViewport() ? "auto" : "smooth",
        block: "start",
      });
    }

    forceDesktopShowroomTop();
    triggerBookingPanelAttention();
  };

  forceDesktopShowroomTop();

  const frameOne = window.requestAnimationFrame(() => {
    forceDesktopShowroomTop();

    window.requestAnimationFrame(() => {
      forceDesktopShowroomTop();
    });
  });

  const timerOne = window.setTimeout(runDesktopTopReset, 120);
  const timerTwo = window.setTimeout(runDesktopTopReset, 350);
  const timerThree = window.setTimeout(runDesktopTopReset, 700);

  window.addEventListener("nexa:book-now-clicked", handleGlobalBookClick);

  if (window.__nexaTriggerBookingPanelAttention) {
    window.__nexaTriggerBookingPanelAttention = false;

    window.setTimeout(() => {
      forceDesktopShowroomTop();
      triggerBookingPanelAttention();
    }, 450);
  }

  return () => {
    window.cancelAnimationFrame(frameOne);
    window.clearTimeout(timerOne);
    window.clearTimeout(timerTwo);
    window.clearTimeout(timerThree);

    window.removeEventListener("nexa:book-now-clicked", handleGlobalBookClick);

    if (bookingAttentionTimeoutRef.current) {
      window.clearTimeout(bookingAttentionTimeoutRef.current);
    }
  };
}, []);

 return (
  <div id="nexa-showroom-v3" className="bg-black">
      <section
        id="booking"
        className="relative isolate min-h-[100svh] w-full overflow-hidden bg-black text-white lg:h-screen lg:min-h-[640px]"
      >
        <NavbarV3 onBookClick={handleBookNowClick} />

        <div className="absolute inset-0 z-0 hidden lg:block">
          {VEHICLE_SLIDES.map((vehicle, index) => {
            const isActive = index === activeIndex;

            return (
              <Image
                key={vehicle.id}
                src={vehicle.image}
                alt={vehicle.alt}
                fill
                priority
                sizes="100vw"
                draggable={false}
                className={[
                  "select-none object-cover object-center",
                  isActive ? "block" : "hidden",
                ].join(" ")}
              />
            );
          })}
        </div>

        <div className="mobile-direct-hero-stage absolute inset-0 z-0 overflow-hidden bg-black lg:hidden">
          {MOBILE_DIRECT_HERO_SLIDES.map((vehicle, index) => {
            const isActive = index === mobileHeroIndex;

            return (
              <Image
                key={vehicle.id}
                src={vehicle.image}
                alt={vehicle.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                draggable={false}
                className={[
                  "mobile-direct-hero-image select-none object-contain object-center transition-opacity duration-200 ease-out",
                  isActive ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
            );
          })}
        </div>

        <div
  key={activeMobileHeroSlide.id}
  className={[
    inter.className,
    "mobile-scooter-selector pointer-events-none absolute inset-x-0 top-[92px] z-40 px-5 text-center text-white lg:hidden",
  ].join(" ")}
>
  <div className="mobile-selector-kicker mx-auto block text-[9px] font-extrabold uppercase tracking-[0.36em] text-white/64 drop-shadow-[0_8px_22px_rgba(0,0,0,0.88)]">
    Choose Your Ride
  </div>

    <h1
    className="mobile-selector-title mx-auto mt-2 max-w-[350px] text-[23px] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.92)]"
    style={{
      fontFamily: `${inter.style.fontFamily}, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`,
      fontWeight: 800,
      letterSpacing: "-0.01em",
    }}
  >
    {activeMobileHeroSlide.name}
  </h1>

  <div className="mobile-price-line pointer-events-none mx-auto mt-1.5 flex w-full max-w-[350px] items-center justify-center gap-1.5 text-center lg:hidden">
  <span className="text-[8px] font-black uppercase leading-none tracking-[0.24em] text-white/62 drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
    From
  </span>

  <span className="bg-[linear-gradient(180deg,#fff6c8_0%,#ffd166_38%,#ff9d2e_72%,#ff7a00_100%)] bg-clip-text text-[30px] font-black leading-none tracking-[-0.065em] text-transparent drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)]">
    {activeMobileHeroSlide.vehicleId === "ebike-one" ||
    activeMobileHeroSlide.vehicleId === "ebike-two"
      ? "9€"
      : "39€"}
  </span>

  <span className="text-[8.5px] font-black uppercase leading-none tracking-[0.14em] text-white/78 drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]">
    All inclusive
  </span>
</div>
</div>

<div
  className="mobile-scooter-bottom-panel absolute inset-x-0 z-40 pl-5 pr-[88px] lg:hidden"
  style={{ bottom: "clamp(96px, 13svh, 136px)" }}
>
  <div className="ml-1 flex max-w-[300px] flex-col items-start">
    <div className="mobile-select-button-position flex w-full justify-center">
  <button
    type="button"
    onClick={handleBookNowClick}
    className={[
      inter.className,
      "mobile-select-button relative flex h-[52px] min-w-[196px] items-center justify-center overflow-hidden rounded-full border border-[#ff7a00]/70 bg-[linear-gradient(135deg,#050505_0%,#171717_48%,#000000_100%)] px-10 text-[15px] font-black uppercase tracking-[0.3em] text-white transition duration-300 active:scale-[0.96]",
    ].join(" ")}
    style={{
      fontFamily: `${inter.style.fontFamily}, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`,
      fontWeight: 900,
    }}
  >
    <span className="relative z-10">Select</span>
  </button>
</div>

    <div className="mobile-spec-grid mt-5 grid w-full grid-cols-2 gap-x-4 gap-y-3 pr-1">
      {activeMobileHeroSlide.specs.map((spec) => (
        <div
          key={`${activeMobileHeroSlide.id}-${spec.label}`}
          className="mobile-spec-card flex items-center justify-start gap-2 px-0 py-1"
        >
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <Image
              src={spec.image}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.65)]"
            />
          </span>

          <span
            className={[
              inter.className,
              "text-left text-[9.5px] font-black uppercase leading-[1.1] tracking-[0.045em] text-white/90 drop-shadow-[0_7px_18px_rgba(0,0,0,0.88)]",
            ].join(" ")}
            style={{
              fontFamily: `${inter.style.fontFamily}, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`,
              fontWeight: 900,
            }}
          >
            {spec.label}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

        <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.00)_22%,rgba(0,0,0,0.02)_70%,rgba(0,0,0,0.24)_100%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block bg-[linear-gradient(90deg,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.00)_26%,rgba(0,0,0,0.00)_58%,rgba(0,0,0,0.50)_100%)]" />

        <div
          className="pointer-events-none absolute inset-0 z-20"
          aria-hidden="true"
        >
          <div className="light-smoke smoke-one absolute bottom-[-18%] left-[-12%] h-[48%] w-[62%] rounded-full bg-white/[0.055] blur-[90px]" />
          <div className="light-smoke smoke-two absolute bottom-[-20%] right-[-16%] h-[52%] w-[68%] rounded-full bg-white/[0.045] blur-[105px]" />
          <div className="light-smoke smoke-three absolute bottom-[-22%] left-1/2 h-[42%] w-[72%] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[95px]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[34%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_58%,rgba(0,0,0,0.46)_100%)]" />

        <button
          type="button"
          onClick={goToPreviousMobileHero}
          aria-label="Previous mobile vehicle"
          className="mobile-direct-arrow mobile-direct-arrow-left group absolute left-2 top-1/2 z-40 flex h-20 w-12 -translate-y-1/2 items-center justify-center text-white/82 transition duration-300 hover:text-white active:scale-95 sm:left-5 lg:hidden"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-14 w-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.72)] transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
          >
            <path
              d="M25 7L8 32L25 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNextMobileHero}
          aria-label="Next mobile vehicle"
          className="mobile-direct-arrow mobile-direct-arrow-right group absolute right-2 top-1/2 z-40 flex h-20 w-12 -translate-y-1/2 items-center justify-center text-white/82 transition duration-300 hover:text-white active:scale-95 sm:right-5 lg:hidden"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-14 w-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.72)] transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
          >
            <path
              d="M9 7L26 32L9 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          key={activeVehicle.id}
          className={[
            poppins.className,
            "vehicle-info-card absolute left-[176px] top-[190px] z-40 hidden w-[390px] text-black lg:block",
          ].join(" ")}
          style={{
            fontFamily: poppins.style.fontFamily,
          }}
        >
          <div
            className="text-[17px] font-black uppercase tracking-[0.28em] text-black/42 drop-shadow-[0_3px_12px_rgba(255,255,255,0.55)]"
            style={{
              fontFamily: poppins.style.fontFamily,
            }}
          >
            <TypedLine
              text="SCOOTER"
              className="font-black uppercase"
              delayMs={0}
            />
          </div>

          <h2
            className="mt-2 max-w-[390px] text-[35px] font-black uppercase leading-[0.96] tracking-[-0.045em] text-black drop-shadow-[0_8px_24px_rgba(255,255,255,0.48)]"
            style={{
              fontFamily: poppins.style.fontFamily,
              fontWeight: 900,
            }}
          >
            <TypedLine
              text={activeVehicle.displayName.toUpperCase()}
              className="font-black uppercase"
              delayMs={45}
            />
          </h2>

          <div className="mt-7 space-y-3.5">
            {activeVehicle.features.map((feature, featureIndex) => (
              <div
                key={`${activeVehicle.id}-${feature.label}`}
                className="vehicle-feature-row flex items-center gap-4"
                style={{ animationDelay: `${90 + featureIndex * 38}ms` }}
              >
                <span className="vehicle-feature-icon relative flex h-9 w-9 shrink-0 items-center justify-center">
                  <Image
                    src={feature.image}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.22)]"
                  />
                </span>

                <span
                  className="text-[13.5px] font-black uppercase leading-5 tracking-[0.035em] text-black/84 drop-shadow-[0_3px_12px_rgba(255,255,255,0.58)]"
                  style={{
                    fontFamily: poppins.style.fontFamily,
                    fontWeight: 900,
                  }}
                >
                  <TypedLine
                    text={feature.label}
                    className="font-black uppercase"
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={[
            "booking-panel-shell absolute right-6 top-[102px] z-40 hidden w-[410px] max-w-[410px] lg:block",
            bookingPanelAttention ? "booking-panel-attention" : "",
          ].join(" ")}
        >
          <div className="rounded-[28px] border border-white/12 bg-black/24 p-2 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
            {isActiveVehicleEbike ? (
              <EbikeWhatsAppPanel
                key={`desktop-ebike-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
              />
            ) : (
              <BookingPanelV3
                key={`desktop-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
              />
            )}
          </div>
        </div>

        <div
          id="mobile-booking-panel"
          className={[
            "booking-panel-mobile hidden",
            bookingPanelAttention ? "booking-panel-attention" : "",
          ].join(" ")}
        >
          <div className="max-h-[48vh] overflow-y-auto rounded-[28px] border border-white/12 bg-black/42 p-3 shadow-[0_26px_80px_rgba(0,0,0,0.44)] backdrop-blur-2xl">
            {isActiveVehicleEbike ? (
              <EbikeWhatsAppPanel
                key={`mobile-ebike-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
              />
            ) : (
              <BookingPanelV3
                key={`mobile-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
              />
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          aria-label="Previous vehicle"
          className="showroom-arrow showroom-arrow-left group absolute left-5 top-1/2 z-40 flex h-24 w-16 -translate-y-1/2 items-center justify-center text-white/75 transition-all duration-300 hover:text-white active:scale-95 sm:left-8 lg:left-12"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-16 w-9 drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
          >
            <path
              d="M25 7L8 32L25 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next vehicle"
          className="showroom-arrow showroom-arrow-right group absolute right-[390px] top-1/2 z-40 hidden h-24 w-16 -translate-y-1/2 items-center justify-center text-white/75 transition-all duration-300 hover:text-white active:scale-95 lg:flex"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-16 w-9 drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
          >
            <path
              d="M9 7L26 32L9 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label="Next vehicle"
          className="showroom-arrow showroom-arrow-right group hidden"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-14 w-8 drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
          >
            <path
              d="M9 7L26 32L9 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <style jsx>{`
          #booking :global(nav),
          #booking :global(header) {
            --nexa-mobile-nav-icon: #ffffff;
          }

          #booking :global(button[aria-label="Open menu"]),
          #booking :global(button[aria-label="Toggle menu"]),
          #booking :global(button[aria-label="Menu"]),
          #booking :global(button[aria-expanded]) {
            color: #ffffff !important;
            border-color: rgba(255, 255, 255, 0.18) !important;
            background: rgba(0, 0, 0, 0.18) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }

          #booking :global(button.nexa-hamburger-button[aria-expanded]) {
            border: none !important;
            outline: none !important;
            background: none !important;
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          #booking :global(button[aria-label="Open menu"] svg),
          #booking :global(button[aria-label="Toggle menu"] svg),
          #booking :global(button[aria-label="Menu"] svg),
          #booking :global(button[aria-expanded] svg) {
            color: #ffffff !important;
            stroke: #ffffff !important;
          }

          .light-smoke {
            opacity: 0.65;
            animation: nexa-light-smoke 12s ease-in-out infinite alternate;
            will-change: transform, opacity;
          }

          .smoke-one {
            animation-delay: 0s;
          }

          .smoke-two {
            animation-delay: 2s;
          }

          .smoke-three {
            animation-delay: 4s;
          }

          .mobile-direct-hero-stage {
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-direct-hero-image {
            object-fit: contain !important;
            object-position: center center !important;
            background: #000000;
            will-change: opacity;
          }

          .mobile-scooter-selector {
            animation: mobileSelectorIn 360ms cubic-bezier(0.16, 1, 0.3, 1)
              both;
          }

          .mobile-selector-title {
            text-wrap: balance;
          }

          .mobile-scooter-bottom-panel {
            bottom: 70px;
          }

          .mobile-select-button {
            -webkit-tap-highlight-color: transparent;
            animation: mobileSelectPulse 1.95s ease-in-out infinite;
          }
.mobile-select-button-position {
  --select-x: 20px;
  --select-y: 0px;
  transform: translate3d(var(--select-x), var(--select-y), 0);
}
          .mobile-select-button::before {
            content: "";
            position: absolute;
            inset: 1px;
            border-radius: inherit;
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.46),
              rgba(255, 255, 255, 0.08) 42%,
              rgba(0, 0, 0, 0.1)
            );
            pointer-events: none;
          }

          .mobile-select-button::after {
            content: "";
            position: absolute;
            inset: -80% auto -80% -55%;
            width: 34%;
            transform: rotate(18deg);
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.9),
              transparent
            );
            opacity: 0.7;
            animation: mobileSelectShine 2.4s ease-in-out infinite;
            pointer-events: none;
          }

          .mobile-spec-card {
            animation: mobileSpecIn 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .mobile-spec-card:nth-child(1) {
            animation-delay: 40ms;
          }

          .mobile-spec-card:nth-child(2) {
            animation-delay: 80ms;
          }

          .mobile-spec-card:nth-child(3) {
            animation-delay: 120ms;
          }

          .mobile-spec-card:nth-child(4) {
            animation-delay: 160ms;
          }

          @keyframes mobileSelectorIn {
            0% {
              opacity: 0;
              transform: translate3d(0, -10px, 0);
            }

            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes mobileSpecIn {
            0% {
              opacity: 0;
              transform: translate3d(0, 10px, 0) scale(0.98);
            }

            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes mobileSelectPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 18px 54px rgba(255, 106, 0, 0.42);
            }

            18% {
              transform: scale(1.035);
              box-shadow: 0 22px 68px rgba(255, 106, 0, 0.54);
            }

            34%,
            100% {
              transform: scale(1);
              box-shadow: 0 18px 54px rgba(255, 106, 0, 0.42);
            }
          }

          @keyframes mobileSelectShine {
            0% {
              left: -55%;
            }

            48%,
            100% {
              left: 125%;
            }
          }

          .mobile-direct-arrow {
            -webkit-tap-highlight-color: transparent;
          }

          .typed-unpack {
            display: inline-block;
            opacity: 0;
            clip-path: inset(0 100% 0 0);
            transform: translate3d(-10px, 0, 0);
            animation: showroom-text-unpack 360ms cubic-bezier(0.16, 1, 0.3, 1)
              forwards;
            will-change: opacity, transform, clip-path;
            backface-visibility: hidden;
          }

          .vehicle-feature-row {
            opacity: 0;
            transform: translate3d(-12px, 0, 0);
            animation: showroom-feature-unpack 360ms
              cubic-bezier(0.16, 1, 0.3, 1) forwards;
            will-change: opacity, transform;
            backface-visibility: hidden;
          }

          @keyframes showroom-text-unpack {
            0% {
              opacity: 0;
              clip-path: inset(0 100% 0 0);
              transform: translate3d(-10px, 0, 0);
            }

            100% {
              opacity: 1;
              clip-path: inset(0 0 0 0);
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes showroom-feature-unpack {
            0% {
              opacity: 0;
              transform: translate3d(-12px, 0, 0);
            }

            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          .vehicle-feature-icon::before {
            content: "";
            position: absolute;
            inset: -5px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.16);
            filter: blur(10px);
            opacity: 0.42;
          }

          .booking-panel-shell {
            transform: scale(0.88);
            transform-origin: top right;
          }

          .booking-panel-shell > div {
            overflow: visible;
          }

          .booking-panel-shell :global(*) {
            scrollbar-width: thin;
          }

          .booking-panel-shell :global(*)::-webkit-scrollbar,
          .booking-panel-mobile :global(*)::-webkit-scrollbar {
            width: 6px;
          }

          .booking-panel-shell :global(*)::-webkit-scrollbar-thumb,
          .booking-panel-mobile :global(*)::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.22);
          }

          .booking-panel-attention :global(.plan-choice-button) {
            animation: showroom-plan-heartbeat 0.72s ease-in-out infinite !important;
          }

          .booking-panel-attention :global(.plan-choice-button)::before,
          .booking-panel-attention :global(.plan-choice-button)::after {
            content: "";
            position: absolute;
            inset: -3px;
            border-radius: 21px;
            padding: 2px;
            animation: showroom-plan-ring 1.05s ease-out infinite;
            pointer-events: none;
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
          }

          .booking-panel-attention :global(.plan-popular)::before,
          .booking-panel-attention :global(.plan-popular)::after {
            background: linear-gradient(
              135deg,
              #ec4899,
              #d946ef,
              #7c3aed,
              #38bdf8
            );
          }

          .booking-panel-attention :global(.plan-secondary)::before,
          .booking-panel-attention :global(.plan-secondary)::after {
            background: linear-gradient(
              135deg,
              rgba(17, 24, 39, 0.72),
              rgba(107, 114, 128, 0.62),
              rgba(209, 213, 219, 0.72)
            );
          }

          .booking-panel-attention :global(.plan-choice-button)::after {
            animation-delay: 0.62s;
          }

          @keyframes showroom-plan-heartbeat {
            0% {
              transform: translateY(0) scale(1);
            }

            14% {
              transform: translateY(-4px) scale(1.018);
            }

            28% {
              transform: translateY(0) scale(1);
            }

            42% {
              transform: translateY(-2px) scale(1.01);
            }

            58% {
              transform: translateY(0) scale(1);
            }

            100% {
              transform: translateY(0) scale(1);
            }
          }

          @keyframes showroom-plan-ring {
            0% {
              opacity: 0;
              transform: scale(1);
            }

            18% {
              opacity: 0.82;
            }

            100% {
              opacity: 0;
              transform: scale(1.11);
            }
          }

          @keyframes nexa-light-smoke {
            0% {
              opacity: 0.38;
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              opacity: 0.62;
            }

            100% {
              opacity: 0.44;
              transform: translate3d(0, -28px, 0) scale(1.08);
            }
          }

          @media (min-width: 1024px) and (max-height: 820px) {
            #booking {
              min-height: 100vh;
            }

            .vehicle-info-card {
              left: 168px;
              top: 145px;
              width: 380px;
            }

            .vehicle-info-card h2 {
              font-size: 34px;
            }

            .booking-panel-shell {
              top: 88px;
              right: 10px;
              width: 410px;
              max-width: 410px;
              transform: scale(0.8);
            }

            .booking-panel-shell > div {
              padding: 8px;
              border-radius: 26px;
            }

            .showroom-arrow-right {
              right: 350px;
            }
          }

          @media (min-width: 1024px) and (max-width: 1280px) {
            .vehicle-info-card {
              left: 142px;
              top: 150px;
              width: 345px;
            }

            .vehicle-info-card h2 {
              font-size: 31px;
            }

            .booking-panel-shell {
              right: 12px;
              width: 410px;
              max-width: 410px;
              transform: scale(0.82);
            }

            .showroom-arrow-right {
              right: 360px;
            }
          }

          @media (max-width: 1023px) {
  :global(html),
  :global(body) {
    background: #000000 !important;
  }

  #nexa-showroom-v3 {
    background: #000000 !important;
    min-height: 100svh;
  }

  #booking {
    height: 100svh;
    min-height: 100svh;
    overflow: hidden;
    background: #000000 !important;
  }

  .mobile-direct-hero-stage,
  .mobile-direct-hero-image {
    background: #000000 !important;
  }

  .showroom-arrow,
  .booking-panel-mobile,
  .light-smoke {
    display: none !important;
  }
}

          @media (max-width: 640px) {
            #booking {
              height: 100svh;
              min-height: 100svh;
            }
          }

          @media (max-width: 390px) {
            .mobile-scooter-selector {
              top: 86px;
              padding-left: 18px;
              padding-right: 18px;
            }

            .mobile-selector-kicker {
              font-size: 8px;
              letter-spacing: 0.36em;
            }

            .mobile-selector-title {
              font-size: 22px;
            }

            .mobile-scooter-bottom-panel {
              bottom: 40px;
              padding-left: 18px;
              padding-right: 18px;
            }

            .mobile-select-button {
              height: 48px;
              min-width: 172px;
              font-size: 13px;
            }

            .mobile-spec-grid {
              margin-top: 13px;
              row-gap: 9px;
              column-gap: 10px;
            }

            .mobile-spec-card span:last-child {
              font-size: 9px;
            }
          }

          @media (max-height: 760px) and (max-width: 1023px) {
            .mobile-scooter-selector {
              top: 78px;
            }

            .mobile-selector-title {
              font-size: 22px;
            }

            .mobile-scooter-bottom-panel {
              bottom: 28px;
            }

            .mobile-spec-grid {
              margin-top: 12px;
              row-gap: 8px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .light-smoke,
            .typed-unpack,
            .vehicle-feature-row,
            .mobile-direct-hero-image,
            .mobile-direct-arrow svg,
            .mobile-scooter-selector,
            .mobile-select-button,
            .mobile-select-button::after,
            .mobile-spec-card,
            .booking-panel-attention :global(.plan-choice-button),
            .booking-panel-attention :global(.plan-choice-button)::before,
            .booking-panel-attention :global(.plan-choice-button)::after {
              animation: none !important;
              transition: none !important;
              opacity: 1 !important;
              transform: none !important;
              clip-path: none !important;
            }
          }
        `}</style>
      </section>

      <GoogleReviewsV3 />
      <LocationV3 />
      <NexaStatsStripV3 />
      <MallorcaScooterRentalGuideHub />
      <NeroWebsiteAssistant />
    </div>
  );
}