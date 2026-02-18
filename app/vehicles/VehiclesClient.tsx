"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

type VehicleType = "Scooter" | "E-Bike";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  brand: string; // kept (not displayed)
  seats: number; // kept (not displayed)
  pricePerDay: number; // NORMAL 1-day price
  rating: number; // kept (not displayed)
  reviews: number; // kept (not displayed)
  imageUrl: string;
  badges: string[];
  featured?: boolean;
  spec1?: string; // only spec1 is shown
  spec2?: string; // not shown
};

/* ---------------- date helpers ---------------- */

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseISO(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
function fmtDate(d?: Date) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function safeParam(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.trim().length ? v : undefined;
}
function formatTimeLabel(t?: string) {
  if (!t) return "--:--";
  const [hhStr, mmStr] = t.split(":");
  const hh = Number(hhStr);
  if (Number.isNaN(hh)) return t;
  const ampm = hh >= 12 ? "PM" : "AM";
  const hour12 = ((hh + 11) % 12) + 1;
  return `${String(hour12).padStart(2, "0")}:${mmStr} ${ampm}`;
}
function daysBetween(from?: Date, to?: Date) {
  if (!from || !to) return 0;
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  const diff = Math.max(0, b - a);
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

/* ---------------- fleet ---------------- */

const VEHICLES: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    brand: "ZONTES",
    type: "Scooter",
    seats: 2,
    pricePerDay: 55,
    rating: 4.8,
    reviews: 241,
    imageUrl: "/images/zontes125.png",
    badges: ["Premium", "Performance"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
    featured: true,
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    brand: "PIAGGIO",
    type: "Scooter",
    seats: 2,
    pricePerDay: 45,
    rating: 4.7,
    reviews: 190,
    imageUrl: "/images/liberty125.png",
    badges: ["Best Seller", "Great Value"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
    featured: true,
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    brand: "SYM",
    type: "Scooter",
    seats: 2,
    pricePerDay: 45,
    rating: 4.9,
    reviews: 112,
    imageUrl: "/images/sym.png",
    badges: ["Comfort", "Practical"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
  },
  {
    id: "e1",
    name: "ENGWE X26 (Performance)",
    brand: "ENGWE",
    type: "E-Bike",
    seats: 1,
    pricePerDay: 29,
    rating: 4.6,
    reviews: 51,
    imageUrl: "/images/citybike2.png",
    badges: ["Premium", "Cruise Control"],
    spec1: "Up to 90km range",
    spec2: "Lock • Helmet included",
    featured: true,
  },
  {
    id: "e2",
    name: "ENGWE M20 (JOY)",
    brand: "ENGWE",
    type: "E-Bike",
    seats: 1,
    pricePerDay: 25,
    rating: 4.5,
    reviews: 34,
    imageUrl: "/images/e20.png",
    badges: ["Practical", "Power"],
    spec1: "Up to 60km range",
    spec2: "Lock • Helmet included",
  },
  {
    id: "e3",
    name: "P275 SE (Comfort)",
    brand: "ENGWE",
    type: "E-Bike",
    seats: 1,
    pricePerDay: 33,
    rating: 4.7,
    reviews: 29,
    imageUrl: "/images/ebike-urban.png",
    badges: ["Comfort", "Stable"],
    spec1: "Up to 45km range",
    spec2: "Lock • Helmet included",
  },
];

/* ---------------- theme + pricing ---------------- */

// Keep your accent
const ORANGE = "#FF7A00";

// ✅ Luxury charcoal/graphite (Zontes-like) base
const THEME = {
  bg: "#0f1115", // main background (premium charcoal)
  bg2: "#141820", // subtle depth
  surface: "rgba(255,255,255,0.035)", // cards/chips
  surface2: "rgba(255,255,255,0.055)", // slightly stronger
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.08)",
  textSoft: "rgba(255,255,255,0.65)",
  textDim: "rgba(255,255,255,0.50)",
};

function discountRate(days: number) {
  if (days >= 14) return 0.22;
  if (days >= 7) return 0.15;
  if (days >= 4) return 0.1;
  if (days >= 2) return 0.06;
  return 0;
}
function money(n: number) {
  return Math.round(n);
}

/* ---------------- page ---------------- */

export default function VehiclesClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const pickupLocation = safeParam(sp, "pickupLocation") ?? "Magaluf (Carrer Galeón 13)";
  const from = parseISO(safeParam(sp, "from"));
  const to = parseISO(safeParam(sp, "to"));
  const pickupTime = safeParam(sp, "pickupTime") ?? "10:00";
  const dropoffTime = safeParam(sp, "dropoffTime") ?? "10:00";
  const rentalDays = useMemo(() => daysBetween(from, to), [from, to]);

  const rate = discountRate(rentalDays);
  const discountPct = Math.round(rate * 100);

  // exact ordering:
  // row1: Piaggio (bigger), Zontes, Sym
  // row2: all ebikes
  const results = useMemo(() => {
    const map = new Map(VEHICLES.map((v) => [v.id, v]));
    const orderedIds = ["s2", "s1", "s3", "e1", "e2", "e3"];
    return orderedIds.map((id) => map.get(id)!).filter(Boolean);
  }, []);

  const onSelectVehicle = (v: Vehicle) => {
    const params = new URLSearchParams(sp.toString());
    params.set("vehicleId", v.id);
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: THEME.bg }}>
      {/* ✅ Luxury grey background: graphite gradient + soft halos + vignette + grain */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* graphite depth wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 700px at 50% 0%, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.0) 62%), linear-gradient(180deg, #0f1115 0%, #0f1115 35%, #0c0e12 100%)",
          }}
        />

        {/* warm halos (keep subtle) */}
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

        {/* premium vignette (less “pure black”) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.00), rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <Navbar />
      <div className="h-20 md:h-24" />

      {/* Header: premium + calm */}
      <header className="mx-auto max-w-7xl px-4 pt-6 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black text-white/75"
                style={{ borderColor: THEME.borderSoft, background: THEME.surface }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: ORANGE }} />
                Live availability
              </div>

              <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
                Available <span style={{ color: ORANGE }}>vehicles</span>
              </h1>

              {/* booking chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <BigChip>{pickupLocation}</BigChip>
                <BigChip>
                  {fmtDate(from)} • {formatTimeLabel(pickupTime)}
                </BigChip>
                <BigChip>
                  {fmtDate(to)} • {formatTimeLabel(dropoffTime)}
                </BigChip>
                <BigChip>
                  {rentalDays} day{rentalDays > 1 ? "s" : ""}
                </BigChip>
                {discountPct > 0 && <BigChip accent>{discountPct}% discount /day</BigChip>}
              </div>

              <div className="mt-3 text-sm" style={{ color: THEME.textSoft }}>
                Choose a vehicle — then tap <span className="text-white/85 font-bold">Reserve</span>.
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="rounded-2xl px-6 py-4 text-base md:text-sm font-black border hover:bg-white/5 transition"
              style={{ borderColor: THEME.border }}
            >
              Change dates
            </button>
          </div>

          {/* trust row */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <TrustPill icon="helmet" title="Free Helmet Included" />
            <TrustPill icon="support" title="24/7 Assistance" />
            <TrustPill icon="shield" title="Full Insurance" />
          </div>

          {/* soft divider */}
          <div
            className="mt-1 h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
            }}
          />
        </div>
      </header>

      {/* Vehicles: 3 columns only */}
      <main className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((v, idx) => {
            const isPiaggioBig = v.id === "s2";

            const discountedPerDay = v.pricePerDay * (1 - rate);
            const total = discountedPerDay * rentalDays;
            const showDiscountUI = rentalDays > 1 && rate > 0;

            // sizing
            const pad = isPiaggioBig ? "p-6" : "p-5";
            const imgH = isPiaggioBig ? "h-[200px]" : "h-[175px]";
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
                  borderColor: isPiaggioBig ? "rgba(255,122,0,0.26)" : THEME.borderSoft,
                  // ✅ more “graphite card”, less “black”
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.028))",
                  boxShadow: isPiaggioBig
                    ? "0 30px 90px rgba(255,122,0,0.10)"
                    : "0 24px 70px rgba(0,0,0,0.38)",
                }}
              >
                {/* inner rim highlight */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.00))",
                    opacity: 0.55,
                  }}
                />

                {/* warm glow behind vehicle */}
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 top-[-120px] h-[260px] w-[260px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,122,0,0.28) 0%, rgba(255,122,0,0) 70%)",
                    }}
                  />
                </div>

                <div className={`relative z-10 ${pad}`}>
                  {/* tags */}
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

                  {/* name on top */}
                  <div className="mt-3">
                    <div className={`${nameSize} font-black tracking-tight`}>{v.name}</div>
                  </div>

                  {/* image */}
                  <div className={`relative mt-3 ${imgH} w-full`}>
                    {/* ✅ softer shadow (less harsh black) */}
                    <div className="pointer-events-none absolute left-1/2 bottom-6 h-9 w-[78%] -translate-x-1/2 rounded-full blur-xl opacity-70"
                      style={{ background: "rgba(0,0,0,0.45)" }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_36px_46px_rgba(0,0,0,0.50)]"
                    />
                  </div>

                  {/* ✅ PRICE + BUTTON same level */}
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      {showDiscountUI && (
                        <div className="text-sm font-black" style={{ color: THEME.textDim }}>
                          <span className="line-through" style={{ color: "rgba(255,255,255,0.42)" }}>
                            €{money(v.pricePerDay)}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.40)" }}> /day</span>
                        </div>
                      )}

                      <div className={`${priceSize} font-black leading-none`} style={{ color: ORANGE }}>
                        €{money(discountedPerDay)}
                        <span className="text-sm" style={{ color: THEME.textSoft }}>
                          /day
                        </span>
                      </div>

                      <div className="mt-1 text-sm" style={{ color: THEME.textSoft }}>
                        Total: <span className="font-black text-white/85">€{money(total)}</span>{" "}
                        <span style={{ color: THEME.textDim }}>
                          ({rentalDays} day{rentalDays > 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>

                    {/* button right side aligned with price */}
                    <button
                      onClick={() => onSelectVehicle(v)}
                      className="shrink-0 rounded-2xl px-6 py-3 text-[15px] font-black text-black hover:opacity-90 transition"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,122,0,1), rgba(255,122,0,0.85))",
                        boxShadow: "0 18px 38px rgba(255,122,0,0.18)",
                      }}
                      aria-label={`Reserve ${v.name}`}
                    >
                      Reserve
                    </button>
                  </div>

                  {/* spec (only 1 line) */}
                  <div className="mt-3 text-sm" style={{ color: THEME.textSoft }}>
                    {v.spec1}
                  </div>

                  {/* tiny calm footer hint for “soul” */}
                  <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: THEME.textDim }}>
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: "rgba(255,122,0,0.55)" }}
                    />
                    Instant confirmation • Local support
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* bottom soft fade (lux) */}
      <div className="pointer-events-none h-16 w-full" />
    </div>
  );
}

/* ---------------- components ---------------- */

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
      className="rounded-2xl border px-4 py-3 flex items-center gap-3"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        // ✅ was rgba(0,0,0,0.20) (felt “black”); now graphite glass
        background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.020))",
      }}
    >
      <Icon kind={icon} />
      <div className="text-sm font-black text-white/85">{title}</div>
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
