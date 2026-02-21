"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingBar from "../components/BookingBar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ORANGE = "#FF7A00";

type VehicleType = "Scooter" | "E-Bike";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  pricePerDay: number;
  cc?: string;
  transmission?: string;
  tags: string[];
  imageUrl: string;
};

const FLEET: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 55,
    cc: "125cc",
    transmission: "Automatic",
    tags: ["Premium", "Performance"],
    imageUrl: "/images/zontes125.png",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 45,
    cc: "125cc",
    transmission: "Automatic",
    tags: ["Popular", "Best Seller"],
    imageUrl: "/images/liberty125.png",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    type: "Scooter",
    pricePerDay: 45,
    cc: "125cc",
    transmission: "Automatic",
    tags: ["Comfort", "Practical"],
    imageUrl: "/images/sym.png",
  },
  {
    id: "e2",
    name: "CITY e-BIKE COMFORT",
    type: "E-Bike",
    pricePerDay: 25,
    tags: ["Great Value", "Eco"],
    imageUrl: "/images/e20.png",
  },
];

/* ---------------- helpers ---------------- */
function parseISO(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function daysBetween(from?: Date, to?: Date) {
  if (!from || !to) return 0;
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * ✅ Wrapper to satisfy Next.js build/prerender rules around useSearchParams().
 * This prevents Vercel "prerender-error" on /fleet.
 */
export default function FleetPage() {
  return (
    <Suspense fallback={null}>
      <FleetPageInner />
    </Suspense>
  );
}

function FleetPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const bookingRef = useRef<HTMLDivElement | null>(null);

  // Booking params (set by BookingBar)
  const pickupLocation = sp.get("pickupLocation") || "Magaluf (Carrer Galeón 13)";
  const from = parseISO(sp.get("from"));
  const to = parseISO(sp.get("to"));
  const pickupTime = sp.get("pickupTime") || "10:00";
  const dropoffTime = sp.get("dropoffTime") || "10:00";

  const days = daysBetween(from, to);
  const hasDates = !!from && !!to && days > 0;

  const [showNeedDates, setShowNeedDates] = useState(false);
  const items = useMemo(() => FLEET, []);

  function requireDatesOrFocus() {
    if (hasDates) {
      setShowNeedDates(false);
      return true;
    }
    setShowNeedDates(true);
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }

  function reserve(vehicleId: string) {
    if (!requireDatesOrFocus()) return;

    const params = new URLSearchParams(sp.toString());
    params.set("vehicleId", vehicleId);
    params.set("pickupLocation", pickupLocation);
    params.set("from", from!.toISOString());
    params.set("to", to!.toISOString());
    params.set("pickupTime", pickupTime);
    params.set("dropoffTime", dropoffTime);

    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <main className="relative min-h-screen text-white" style={{ background: "#0f1115" }}>
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 520px at 50% 0%, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0) 62%), linear-gradient(180deg, #0f1115 0%, #0c0e12 100%)",
          }}
        />
        <div
          className="absolute -top-48 left-1/2 h-[650px] w-[650px] -translate-x-1/2 rounded-full blur-[130px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(255,122,0,0.20) 0%, rgba(255,122,0,0) 70%)",
          }}
        />
        <div
          className="absolute -bottom-56 right-[-200px] h-[650px] w-[650px] rounded-full blur-[140px] opacity-18"
          style={{
            background: "radial-gradient(circle, rgba(255,180,116,0.16) 0%, rgba(255,180,116,0) 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.11] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-10">
        {/* Heading */}
        <div
          className="text-[12px] font-black tracking-[0.32em] uppercase"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.70), rgba(255,180,116,0.98), rgba(255,255,255,0.55))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Our Fleet
        </div>

        <h1
          className="mt-3 text-3xl md:text-4xl font-black tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Choose your ride — premium scooters & e-bikes
        </h1>

        <p className="mt-3 max-w-2xl text-white/65">
          Select dates, pick your vehicle, and checkout instantly. Luxury experience, zero confusion.
        </p>

        {/* BAR + SUMMARY */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* LEFT */}
          <div ref={bookingRef} className="lg:flex-1 lg:min-w-0" style={{ maxWidth: 860 }}>
            <div className="md:scale-100 md:translate-y-0 md:origin-center scale-[0.90] origin-top translate-y-[-10px]">
              <BookingBar />
            </div>

            {showNeedDates && (
              <div
                className="mt-3 rounded-2xl border px-4 py-3 text-sm"
                style={{
                  borderColor: "rgba(255,122,0,0.35)",
                  background: "rgba(255,122,0,0.10)",
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                Please select <b>pick-up</b> and <b>drop-off</b> dates to reserve a vehicle.
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div
            className="w-full lg:w-[320px] shrink-0 rounded-3xl border p-4"
            style={{
              borderColor: "rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="text-xs font-bold tracking-wide text-white/60">SUMMARY</div>

            <div className="mt-3 space-y-2 text-sm">
              <Row k="Location" v={pickupLocation} />
              <Row k="Duration" v={hasDates ? `${days} day${days === 1 ? "" : "s"}` : "Select dates"} />
              <Row k="Pick-up" v={pickupTime} />
              <Row k="Drop-off" v={dropoffTime} />
            </div>

            <div className="mt-4 h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            <p className="mt-3 text-xs text-white/55">Choose dates first for accurate totals.</p>
          </div>
        </div>

        {/* Cards */}
        <section className="mt-4">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((v) => {
              const total = hasDates ? v.pricePerDay * days : 0;

              return (
                <div
                  key={v.id}
                  className="group relative overflow-hidden rounded-[28px] border"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.03) 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  {/* glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div
                      className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[90px]"
                      style={{
                        background: "radial-gradient(circle, rgba(255,122,0,0.22) 0%, rgba(255,122,0,0) 65%)",
                      }}
                    />
                  </div>

                  <div className="p-5">
                    {/* tags */}
                    <div className="flex flex-wrap gap-2">
                      {v.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black"
                          style={{
                            borderColor: "rgba(255,255,255,0.14)",
                            background: "rgba(0,0,0,0.16)",
                            color: "rgba(255,255,255,0.80)",
                          }}
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{
                              background: "rgba(255,180,116,0.95)",
                              boxShadow: "0 0 18px rgba(255,122,0,0.35)",
                            }}
                          />
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* image */}
                    <div className="relative mt-4 h-[240px] w-full">
                      <div className="pointer-events-none absolute left-1/2 bottom-7 h-10 w-[78%] -translate-x-1/2 rounded-full bg-black/60 blur-xl opacity-70 transition-all duration-500 group-hover:bottom-6 group-hover:opacity-90" />

                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:-translate-y-1"
                      />
                    </div>

                    {/* title */}
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold tracking-wide text-white/55">{v.type}</div>
                        <div className="truncate text-[15px] font-black text-white">{v.name}</div>

                        <div className="mt-2 text-xs text-white/55">
                          {v.cc ? `${v.cc}` : ""}
                          {v.transmission ? ` • ${v.transmission}` : ""}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-[11px] font-bold text-white/55">€{v.pricePerDay}/day</div>
                        <div className="mt-1 text-sm font-black" style={{ color: ORANGE }}>
                          {hasDates ? `Total: €${total} (${days} day${days === 1 ? "" : "s"})` : "Select dates"}
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="text-xs text-white/55">Instant confirmation • Local support</div>

                      <button
                        onClick={() => reserve(v.id)}
                        className="rounded-2xl px-5 py-3 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.99]"
                        style={{
                          background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                          boxShadow: "0 18px 44px rgba(255,122,0,0.18)",
                        }}
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/55">{k}</span>
      <span className="truncate text-right text-white/85">{v}</span>
    </div>
  );
}