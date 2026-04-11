"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../Navbar";
import BookingBar from "../../components/BookingBar";
import { useTranslations, useLocale } from "next-intl";

type VehicleType = "Scooter" | "E-Bike";
type AvailabilityStatus = "available" | "one-left" | "rented-out";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  seats: number;
  pricePerDay: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  badges: string[];
  featured?: boolean;
  spec1?: string;
  spec2?: string;
  availability: AvailabilityStatus;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseISO(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
function fmtDate(d?: Date, locale?: string) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(locale || undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function safeParam(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.trim().length ? v : undefined;
}
function formatTimeLabel(t?: string, locale?: string) {
  if (!t) return "--:--";
  const [hhStr, mmStr] = t.split(":");
  const hh = Number(hhStr);
  if (Number.isNaN(hh)) return t;

  const date = new Date();
  date.setHours(hh, Number(mmStr), 0, 0);

  return new Intl.DateTimeFormat(locale || undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
function daysBetween(from?: Date, to?: Date) {
  if (!from || !to) return 0;
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  const diff = Math.max(0, b - a);
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

const VEHICLES: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    brand: "ZONTES",
    type: "Scooter",
    seats: 2,
    pricePerDay: 49,
    rating: 4.8,
    reviews: 241,
    imageUrl: "/images/zontes125.png",
    badges: ["Premium", "Performance"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
    featured: true,
    availability: "rented-out",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    brand: "PIAGGIO",
    type: "Scooter",
    seats: 2,
    pricePerDay: 39,
    rating: 4.7,
    reviews: 190,
    imageUrl: "/images/liberty125.png",
    badges: ["Best Seller", "Great Value"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
    featured: true,
    availability: "rented-out",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    brand: "SYM",
    type: "Scooter",
    seats: 2,
    pricePerDay: 39,
    rating: 4.9,
    reviews: 112,
    imageUrl: "/images/sym.png",
    badges: ["Comfort", "Practical"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
    availability: "rented-out",
  },
  {
    id: "e2",
    name: "ENGWE M20 (JOY)",
    brand: "ENGWE",
    type: "E-Bike",
    seats: 1,
    pricePerDay: 28,
    rating: 4.5,
    reviews: 34,
    imageUrl: "/images/e20.png",
    badges: ["Practical", "Power"],
    spec1: "Up to 60km range",
    spec2: "Lock • Helmet included",
    availability: "rented-out",
  },
  {
    id: "e3",
    name: "P275 SE (Comfort)",
    brand: "ENGWE",
    type: "E-Bike",
    seats: 1,
    pricePerDay: 28,
    rating: 4.7,
    reviews: 29,
    imageUrl: "/images/ebike-urban.png",
    badges: ["Comfort", "Stable"],
    spec1: "Up to 45km range",
    spec2: "Lock • Helmet included",
    availability: "rented-out",
  },
];

const ORANGE = "#FF7A00";

const THEME = {
  bg: "#0f1115",
  bg2: "#141820",
  surface: "rgba(255,255,255,0.035)",
  surface2: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.08)",
  textSoft: "rgba(255,255,255,0.65)",
  textDim: "rgba(255,255,255,0.50)",
};

function discountedPricePerDay(vehicle: Vehicle, days: number) {
  const safeDays = Math.max(1, days);

  if (vehicle.id === "s2" || vehicle.id === "s3") {
    const ladderRatios: Record<number, number> = {
      1: 1,
      2: 42 / 45,
      3: 39 / 45,
      4: 37 / 45,
      5: 35 / 45,
    };

    const step = safeDays >= 5 ? 5 : safeDays;
    return Math.round(vehicle.pricePerDay * ladderRatios[step]);
  }

  const ladderRatios: Record<number, number> = {
    1: 1,
    2: 42 / 45,
    3: 39 / 45,
    4: 37 / 45,
    5: 35 / 45,
  };

  const step = safeDays >= 5 ? 5 : safeDays;
  return Math.round(vehicle.pricePerDay * ladderRatios[step]);
}

function displayDiscountPct(days: number) {
  const safeDays = Math.max(1, days);

  const basePrice = 39;
  let discounted = 39;

  if (safeDays === 2) discounted = Math.round(39 * (42 / 45));
  else if (safeDays === 3) discounted = Math.round(39 * (39 / 45));
  else if (safeDays === 4) discounted = Math.round(39 * (37 / 45));
  else if (safeDays >= 5) discounted = Math.round(39 * (35 / 45));

  return Math.max(0, Math.round(((basePrice - discounted) / basePrice) * 100));
}

function money(n: number) {
  return Math.round(n);
}

function getAvailabilityMeta(status: AvailabilityStatus) {
  if (status === "available") {
    return {
      label: "Available",
      subLabel: "Available",
      pillBg: "rgba(34,197,94,0.14)",
      pillBorder: "rgba(34,197,94,0.28)",
      pillText: "#4ADE80",
      textColor: "#4ADE80",
    };
  }

  if (status === "one-left") {
    return {
      label: "1 Left",
      subLabel: "Only 1 left",
      pillBg: "rgba(255,122,0,0.14)",
      pillBorder: "rgba(255,122,0,0.28)",
      pillText: "#FFB074",
      textColor: "#FFB074",
    };
  }

  return {
    label: "RENTED OUT",
    subLabel: "RENTED OUT",
    pillBg: "rgba(239,68,68,0.14)",
    pillBorder: "rgba(239,68,68,0.24)",
    pillText: "#F87171",
    textColor: "#F87171",
  };
}

export default function VehiclesClient() {
  const t = useTranslations("vehicles");
  const locale = useLocale();

  const sp = useSearchParams();
  const router = useRouter();

  const [showBookingPopup, setShowBookingPopup] = useState(false);

  const pickupLocation = safeParam(sp, "pickupLocation") ?? "Magaluf (Carrer Galeón 13)";
  const from = parseISO(safeParam(sp, "from"));
  const to = parseISO(safeParam(sp, "to"));
  const pickupTime = safeParam(sp, "pickupTime") ?? "10:00";
  const dropoffTime = safeParam(sp, "dropoffTime") ?? "10:00";
  const rentalDays = useMemo(() => daysBetween(from, to), [from, to]);

  const discountPct = displayDiscountPct(rentalDays);
  const hasSelectedDates = Boolean(from && to);

  const results = useMemo(() => {
    const map = new Map(VEHICLES.map((v) => [v.id, v]));
    const orderedIds = ["s2", "s3", "s1", "e2", "e3"];
    return orderedIds.map((id) => map.get(id)!).filter(Boolean);
  }, []);

  useEffect(() => {
    if (!hasSelectedDates) return;

    const pendingVehicleId = window.localStorage.getItem("nexa_pending_vehicle_id");
    if (!pendingVehicleId) return;

    const vehicle = results.find((v) => v.id === pendingVehicleId);
    window.localStorage.removeItem("nexa_pending_vehicle_id");

    if (!vehicle || vehicle.availability === "rented-out") return;

    const params = new URLSearchParams(sp.toString());
    params.set("vehicleId", vehicle.id);
    router.push(`/checkout?${params.toString()}`);
  }, [hasSelectedDates, results, router, sp]);

  const onSelectVehicle = (v: Vehicle) => {
    if (v.availability === "rented-out") return;

    if (!hasSelectedDates) {
      window.localStorage.setItem("nexa_pending_vehicle_id", v.id);
      setShowBookingPopup(true);
      return;
    }

    const params = new URLSearchParams(sp.toString());
    params.set("vehicleId", v.id);
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: THEME.bg }}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 50% 0%, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.0) 62%), linear-gradient(180deg, #0f1115 0%, #0f1115 35%, #0c0e12 100%)",
          }}
        />

        <div
          className="absolute left-1/2 top-[-280px] h-[760px] w-[760px] -translate-x-1/2 rounded-full blur-[120px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(255,122,0,0.20) 0%, rgba(255,122,0,0) 70%)",
          }}
        />
        <div
          className="absolute right-[-240px] top-[18%] h-[520px] w-[520px] rounded-full blur-[110px] opacity-14"
          style={{
            background: "radial-gradient(circle, rgba(255,180,116,0.16) 0%, rgba(255,180,116,0) 72%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.00), rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <Navbar />

      <header className="mx-auto max-w-7xl px-4 pt-0 pb-2 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 md:gap-4 items-start">
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              Scooter Rental <span style={{ color: ORANGE }}>Mallorca</span>
            </h1>

            <div className="mt-2 flex flex-wrap gap-2">
              <div className="hidden md:block">
                <BigChip>{pickupLocation}</BigChip>
              </div>

              <div className="md:hidden">
                <SmallChip>
                  {fmtDate(from, locale)} • {formatTimeLabel(pickupTime, locale)} → {fmtDate(to, locale)} •{" "}
                  {formatTimeLabel(dropoffTime, locale)}
                </SmallChip>
              </div>

              <div className="hidden md:block">
                <BigChip>
                  {fmtDate(from, locale)} • {formatTimeLabel(pickupTime, locale)}
                </BigChip>
              </div>
              <div className="hidden md:block">
                <BigChip>
                  {fmtDate(to, locale)} • {formatTimeLabel(dropoffTime, locale)}
                </BigChip>
              </div>

              <div className="md:hidden">
                <SmallChip>
                  {rentalDays} {t(rentalDays > 1 ? "daysPlural" : "daysSingular")}
                </SmallChip>
              </div>
              <div className="hidden md:block">
                <BigChip>
                  {rentalDays} {t(rentalDays > 1 ? "daysPlural" : "daysSingular")}
                </BigChip>
              </div>

              {discountPct > 0 && (
                <>
                  <div className="md:hidden">
                    <SmallChip accent>
                      {discountPct}% {t("discountPerDay")}
                    </SmallChip>
                  </div>
                  <div className="hidden md:block">
                    <BigChip accent>
                      {discountPct}% {t("discountPerDay")}
                    </BigChip>
                  </div>
                </>
              )}
            </div>

            <div className="mt-2 text-[13px] md:text-sm leading-snug" style={{ color: THEME.textSoft }}>
              {t("chooseThenTap")} <span className="text-white/85 font-bold">{t("reserve")}</span>.
            </div>
          </div>

          <div className="flex md:flex-col items-start md:items-end gap-2 md:gap-3">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-xs font-black text-white/75"
              style={{ borderColor: THEME.borderSoft, background: THEME.surface }}
            >
              <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full" style={{ background: ORANGE }} />
              {t("liveAvailability")}
            </div>

            <button
              onClick={() => router.push("/")}
              className="rounded-2xl px-4 py-2 md:px-6 md:py-3 text-[12px] md:text-sm font-black border hover:bg-white/5 transition"
              style={{ borderColor: THEME.border }}
            >
              {t("changeDates")}
            </button>
          </div>
        </div>

        <div className="mt-2 md:hidden overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 w-max pr-2">
            <TrustPillCompact icon="helmet" title="Free 2nd Helmet" />
            <TrustPillCompact icon="support" title="Free Locks Included" />
            <TrustPillCompact icon="shield" title="Free Phone Holders" />
          </div>
        </div>

        <div className="hidden md:grid mt-3 grid-cols-1 md:grid-cols-3 gap-3">
          <TrustPill icon="helmet" title="Free 2nd Helmet" />
          <TrustPill icon="support" title="Free Locks Included" />
          <TrustPill icon="shield" title="Free Phone Holders" />
        </div>

        <div
          className="mt-2 md:mt-3 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
          }}
        />
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((v, idx) => {
            const isPiaggioBig = v.id === "s2";
            const isUnavailable = v.availability === "rented-out";
            const isOneLeft = v.availability === "one-left";
            const availabilityMeta = getAvailabilityMeta(v.availability);

            const discountedPerDay = discountedPricePerDay(v, rentalDays);
            const total = discountedPerDay * rentalDays;
            const showDiscountUI = rentalDays > 1 && discountedPerDay < v.pricePerDay;

            const pad = isPiaggioBig ? "p-6" : "p-5";
            const isP275 = v.id === "e3";

            const imgH =
              isPiaggioBig
                ? "h-[200px]"
                : isP275
                ? "h-[210px] md:h-[230px]"
                : "h-[175px]";
            const nameSize = isPiaggioBig ? "text-xl md:text-2xl" : "text-lg md:text-xl";
            const priceSize = isPiaggioBig ? "text-4xl" : "text-3xl";

            const topTags = v.id === "s2" ? ["Popular", "Best Seller"] : (v.badges ?? []).slice(0, 2);

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(0.2, idx * 0.03) }}
                className="relative overflow-hidden rounded-3xl border"
                style={{
                  borderColor: isPiaggioBig
                    ? "rgba(255,122,0,0.32)"
                    : isUnavailable
                    ? "rgba(239,68,68,0.16)"
                    : THEME.borderSoft,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.028))",
                  boxShadow: isPiaggioBig
                    ? "0 30px 90px rgba(255,122,0,0.14)"
                    : isUnavailable
                    ? "0 24px 70px rgba(120,0,0,0.16)"
                    : "0 24px 70px rgba(0,0,0,0.38)",
                  opacity: isUnavailable ? 0.88 : 1,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.00))",
                    opacity: 0.55,
                  }}
                />

                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
                    style={{
                      background: isUnavailable
                        ? "radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0) 70%)"
                        : "radial-gradient(circle, rgba(255,122,0,0.28) 0%, rgba(255,122,0,0) 70%)",
                    }}
                  />
                </div>

                {isPiaggioBig && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,122,0,0.10) 0%, rgba(255,122,0,0.03) 38%, rgba(255,255,255,0.015) 100%)",
                      }}
                    />
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-[60%] bottom-[-42%] h-[220%] w-[28%] rotate-[32deg]"
                      animate={{ x: ["0%", "500%"], y: ["0%", "-6%"] }}
                      transition={{
                        duration: 4.2,
                        repeat: Infinity,
                        ease: "linear",
                        repeatDelay: 0,
                      }}
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.025) 20%, rgba(255,245,232,0.34) 50%, rgba(255,255,255,0.04) 80%, rgba(255,255,255,0) 100%)",
                        filter: "blur(11px)",
                        mixBlendMode: "screen",
                        opacity: 0.82,
                      }}
                    />
                  </>
                )}

                <div className={`relative z-10 ${pad}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      {topTags.map((b) => (
                        <MiniBadge
                          key={b}
                          highlight={v.id === "s2" && (b === "Popular" || b === "Best Seller")}
                        >
                          {b}
                        </MiniBadge>
                      ))}
                    </div>

                    <span
                      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black"
                      style={{
                        borderColor: availabilityMeta.pillBorder,
                        background: availabilityMeta.pillBg,
                        color: availabilityMeta.pillText,
                      }}
                    >
                      {availabilityMeta.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className={`${nameSize} font-black tracking-tight`}>{v.name}</div>
                  </div>

                  <div className={`relative mt-3 ${imgH} w-full`}>
                    <div
                      className="pointer-events-none absolute left-1/2 bottom-6 h-9 w-[78%] -translate-x-1/2 rounded-full blur-xl opacity-70"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    />
                    <img
                      src={v.imageUrl}
                      alt={`${v.name} scooter rental Mallorca Nexa Rentals`}
                      className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_36px_46px_rgba(0,0,0,0.50)]"
                    />
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      {showDiscountUI && (
                        <div className="text-sm font-black" style={{ color: THEME.textDim }}>
                          <span className="line-through" style={{ color: "rgba(255,255,255,0.42)" }}>
                            €{money(v.pricePerDay)}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.40)" }}> {t("perDay")}</span>
                        </div>
                      )}

                      <div className={`${priceSize} font-black leading-none`} style={{ color: ORANGE }}>
                        €{money(discountedPerDay)}
                        <span className="text-sm" style={{ color: THEME.textSoft }}>
                          {t("perDay")}
                        </span>
                      </div>

                      <div className="mt-1 text-sm" style={{ color: THEME.textSoft }}>
                        {t("total")}: <span className="font-black text-white/85">€{money(total)}</span>{" "}
                        <span style={{ color: THEME.textDim }}>
                          ({rentalDays} {t(rentalDays > 1 ? "daysPlural" : "daysSingular")})
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectVehicle(v)}
                      disabled={isUnavailable}
                      className="shrink-0 rounded-2xl px-6 py-3 text-[15px] font-black transition"
                      style={{
                        color: isUnavailable ? "rgba(255,255,255,0.75)" : "#000",
                        background: isUnavailable
                          ? "linear-gradient(180deg, rgba(120,120,120,0.95), rgba(95,95,95,0.90))"
                          : "linear-gradient(180deg, rgba(255,122,0,1), rgba(255,122,0,0.85))",
                        boxShadow: isUnavailable
                          ? "none"
                          : "0 18px 38px rgba(255,122,0,0.18)",
                        cursor: isUnavailable ? "not-allowed" : "pointer",
                        opacity: isUnavailable ? 0.9 : 1,
                      }}
                      aria-label={`${isUnavailable ? "Unavailable" : t("reserve")} ${v.name}`}
                    >
                      {isUnavailable ? "RENTED OUT" : t("reserve")}
                    </button>
                  </div>

                  <div className="mt-3 text-sm" style={{ color: THEME.textSoft }}>
                    {v.spec1}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: THEME.textDim }}>
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: availabilityMeta.textColor }}
                    />
                    <span style={{ color: availabilityMeta.textColor, fontWeight: 800 }}>
                      {availabilityMeta.subLabel}
                    </span>
                    <span>•</span>
                    <span>
                      {t("instantConfirmation")} • {t("localSupport")}
                    </span>
                  </div>

                  {isPiaggioBig && (
                    <div className="mt-3">
                      <span
                        className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          borderColor: "rgba(34,197,94,0.28)",
                          background: "rgba(34,197,94,0.12)",
                          color: "#4ADE80",
                        }}
                      >
                        Main Available Pick
                      </span>
                    </div>
                  )}

                  {isOneLeft && (
                    <div className="mt-3">
                      <span
                        className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          borderColor: "rgba(255,122,0,0.28)",
                          background: "rgba(255,122,0,0.10)",
                          color: "#FFB074",
                        }}
                      >
                        Only 1 left
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <section
          className="mt-6 rounded-3xl border p-5 md:p-7"
          style={{
            borderColor: THEME.borderSoft,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.020))",
          }}
        >
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Premium Scooter Rental in Magaluf, Mallorca
          </h2>

          <p className="mt-4 text-[14px] md:text-[15px] leading-7" style={{ color: THEME.textSoft }}>
            Looking for scooter rental in Mallorca? Nexa Rentals offers premium 125cc scooters and e-bikes in Magaluf
            with fast online booking and a smooth rental experience for tourists. Our fleet is designed for beach trips,
            scenic coastal roads, town visits, and easy travel around Mallorca.
          </p>

          <h2 className="mt-6 text-xl md:text-2xl font-black tracking-tight">
            125cc Scooter Rental Mallorca
          </h2>

          <p className="mt-3 text-[14px] md:text-[15px] leading-7" style={{ color: THEME.textSoft }}>
            Choose from reliable 125cc scooter rental options in Mallorca, including practical and premium models for
            comfortable island riding. Nexa Rentals helps visitors enjoy more flexibility, faster movement, and a more
            enjoyable Mallorca experience.
          </p>

          <h2 className="mt-6 text-xl md:text-2xl font-black tracking-tight">
            E-Bike Rental Mallorca
          </h2>

          <p className="mt-3 text-[14px] md:text-[15px] leading-7" style={{ color: THEME.textSoft }}>
            Our e-bike rental Mallorca options are ideal for relaxed rides, short local trips, and visitors who want an
            easy and eco-friendly way to explore Magaluf and nearby areas.
          </p>
        </section>
      </main>

      {showBookingPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close booking popup"
            onClick={() => {
              setShowBookingPopup(false);
              window.localStorage.removeItem("nexa_pending_vehicle_id");
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />

          <div
            className="relative z-10 w-full max-w-4xl rounded-[28px] border p-5 md:p-6"
            style={{
              borderColor: THEME.borderSoft,
              background: "linear-gradient(180deg, rgba(15,17,21,0.98), rgba(12,14,18,0.98))",
              boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight">
                  Select your dates first
                </h3>
                <p className="mt-2 text-sm md:text-[15px] leading-7" style={{ color: THEME.textSoft }}>
                  Choose your pickup and dropoff dates to continue to checkout for your selected vehicle.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowBookingPopup(false);
                  window.localStorage.removeItem("nexa_pending_vehicle_id");
                }}
                className="rounded-full border px-3 py-1.5 text-sm font-black hover:bg-white/5 transition"
                style={{ borderColor: THEME.borderSoft }}
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <BookingBar />
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none h-16 w-full" />
    </div>
  );
}

function BigChip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-4 py-2 text-sm md:text-[13px] font-black"
      style={{
        borderColor: accent ? "rgba(255,122,0,0.30)" : "rgba(255,255,255,0.10)",
        background: accent ? "rgba(255,122,0,0.10)" : "rgba(255,255,255,0.035)",
        color: accent ? "#FFB074" : "rgba(255,255,255,0.88)",
      }}
    >
      {children}
    </span>
  );
}

function SmallChip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-black leading-none"
      style={{
        borderColor: accent ? "rgba(255,122,0,0.28)" : "rgba(255,255,255,0.10)",
        background: accent ? "rgba(255,122,0,0.10)" : "rgba(255,255,255,0.035)",
        color: accent ? "#FFB074" : "rgba(255,255,255,0.88)",
      }}
    >
      {children}
    </span>
  );
}

function MiniBadge({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black"
      style={{
        borderColor: highlight ? "rgba(255,122,0,0.32)" : "rgba(255,255,255,0.10)",
        background: highlight ? "rgba(255,122,0,0.12)" : "rgba(255,255,255,0.03)",
        color: highlight ? "#FFB074" : "rgba(255,255,255,0.78)",
      }}
    >
      {children}
    </span>
  );
}

function TrustPill({ icon, title }: { icon: "helmet" | "support" | "shield"; title: string }) {
  return (
    <div
      className="rounded-2xl border px-3 py-2 md:px-4 md:py-3 flex items-center gap-2 md:gap-3"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.020))",
      }}
    >
      <div className="scale-[0.82] md:scale-100 origin-left">
        <Icon kind={icon} />
      </div>
      <div className="text-[12px] md:text-sm font-black text-white/85 leading-tight">{title}</div>
    </div>
  );
}

function TrustPillCompact({ icon, title }: { icon: "helmet" | "support" | "shield"; title: string }) {
  return (
    <div
      className="inline-flex w-auto shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.020))",
      }}
    >
      <div className="scale-[0.72] origin-left">
        <Icon kind={icon} />
      </div>
      <div className="text-[10px] font-black text-white/85 whitespace-nowrap leading-none">{title}</div>
    </div>
  );
}

function Icon({ kind }: { kind: "helmet" | "support" | "shield" }) {
  const common = {
    stroke: "#FFB074",
    strokeWidth: 2,
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "helmet") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M4 13a8 8 0 1 1 16 0v4H4v-4Z" />
        <path {...common} d="M20 17h-6" />
        <path {...common} d="M7 17v2" />
      </svg>
    );
  }

  if (kind === "support") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
        <path {...common} d="M4 12a8 8 0 0 1 16 0" />
        <path {...common} d="M4 12v4a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 0-2 2Z" />
        <path {...common} d="M20 12v4a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 2Z" />
        <path {...common} d="M12 18v2" />
      </svg>
    );
  }

  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path {...common} d="M12 2 20 6v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4Z" />
      <path {...common} d="M9 12l2 2 4-5" />
    </svg>
  );
}