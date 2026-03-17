"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import BookingBar from "../../components/BookingBar";
import Navbar from "../../Navbar";

const ORANGE = "#FF7A00";

type VehicleType = "Scooter" | "E-Bike";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  pricePerDay: number;
  engine: string;
  seats: string;
  license: string;
  range?: string;
  imageUrl: string;
  shortNote: string;
};

const FLEET: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 55,
    engine: "125cc",
    seats: "2",
    license: "A1 / B",
    imageUrl: "/images/zontes125.png",
    shortNote: "Premium sporty scooter with strong road presence.",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 45,
    engine: "125cc",
    seats: "2",
    license: "A1 / B",
    imageUrl: "/images/liberty125.png",
    shortNote: "Easy, stylish and ideal for daily island rides.",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    type: "Scooter",
    pricePerDay: 45,
    engine: "125cc",
    seats: "2",
    license: "A1 / B",
    imageUrl: "/images/sym.png",
    shortNote: "Comfort-focused scooter for smooth relaxed travel.",
  },
  {
    id: "e2",
    name: "CITY E-BIKE COMFORT",
    type: "E-Bike",
    pricePerDay: 25,
    engine: "Electric",
    seats: "1",
    license: "No license",
    range: "Up to 60 km",
    imageUrl: "/images/e20.png",
    shortNote: "Simple eco-friendly e-bike for easy local mobility.",
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

export default function FleetClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const locale = useLocale();
  const bookingRef = useRef<HTMLDivElement | null>(null);

  const pickupLocation = sp.get("pickupLocation") || "Magaluf (Carrer Galeón 13)";
  const from = parseISO(sp.get("from"));
  const to = parseISO(sp.get("to"));
  const pickupTime = sp.get("pickupTime") || "10:00";
  const dropoffTime = sp.get("dropoffTime") || "10:00";

  const days = daysBetween(from, to);
  const hasDates = !!from && !!to && days > 0;

  const [showNeedDates, setShowNeedDates] = useState(false);
  const items = useMemo(() => FLEET, []);

  function goToBookingBar() {
    setShowNeedDates(false);
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function requireDatesOrFocus() {
    if (hasDates) {
      setShowNeedDates(false);
      return true;
    }
    setShowNeedDates(true);
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

    router.push(`/${locale}/vehicles?${params.toString()}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white" style={{ background: "#0f1115" }}>
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1000px 600px at 50% -10%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #0f1115 0%, #0d1014 50%, #0b0d11 100%)",
          }}
        />
        <div
          className="absolute left-1/2 top-[-240px] h-[620px] w-[620px] -translate-x-1/2 rounded-full blur-[120px] opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255,122,0,0.18) 0%, rgba(255,122,0,0) 72%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.10] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <Navbar />

      <div className="relative mx-auto max-w-7xl px-4 pt-4 pb-20 md:px-6 md:pt-0">
        {/* SIMPLE HERO */}
        <section className="pt-0 md:pt-0">
          <div className="max-w-3xl">
            

            <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-tight md:text-6xl">
              Choose your
              <span style={{ color: ORANGE }}> perfect ride</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              Premium scooters and e-bikes for easy, stylish movement around Mallorca.
            </p>
          </div>
        </section>

        {/* BOOKING BAR TOP */}
        <section ref={bookingRef} className="mt-8 md:mt-10">
          <div
            className="rounded-[28px] border p-4 md:p-5"
            style={{
              borderColor: showNeedDates ? "rgba(255,122,0,0.28)" : "rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.022))",
              boxShadow: showNeedDates ? "0 0 0 1px rgba(255,122,0,0.10)" : "none",
            }}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black md:text-xl">Select dates</div>
                <div className="text-sm text-white/58">Choose your rental period and continue.</div>
              </div>

              {hasDates && (
                <div
                  className="inline-flex items-center rounded-full border px-4 py-2 text-xs font-black"
                  style={{
                    borderColor: "rgba(255,122,0,0.20)",
                    background: "rgba(255,122,0,0.08)",
                    color: "#FFB074",
                  }}
                >
                  {days} day{days > 1 ? "s" : ""} selected
                </div>
              )}
            </div>

            {showNeedDates && (
              <div
                className="mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold"
                style={{
                  borderColor: "rgba(255,122,0,0.22)",
                  background: "rgba(255,122,0,0.08)",
                  color: "#FFD2AF",
                }}
              >
                Please choose your dates first.
              </div>
            )}

            <BookingBar />
          </div>
        </section>

        {/* VEHICLES GRID */}
        <section className="mt-10 md:mt-14">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {items.map((vehicle) => (
              <article
                key={vehicle.id}
                className="group relative overflow-hidden rounded-[30px] border"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.022))",
                  boxShadow: "0 24px 70px rgba(0,0,0,0.34)",
                }}
              >
                <div
                  className="pointer-events-none absolute right-[-100px] top-[-100px] h-[240px] w-[240px] rounded-full blur-[100px] opacity-20"
                  style={{
                    background: "radial-gradient(circle, rgba(255,122,0,0.20) 0%, rgba(255,122,0,0) 70%)",
                  }}
                />

                <div className="relative z-10 p-5 md:p-6">
                  <div className="relative h-[220px] w-full md:h-[280px]">
                    <div
                      className="pointer-events-none absolute left-1/2 bottom-4 h-10 w-[70%] -translate-x-1/2 rounded-full blur-xl opacity-70"
                      style={{ background: "rgba(0,0,0,0.40)" }}
                    />
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)] transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-white/42">{vehicle.type}</div>
                      <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{vehicle.name}</h2>
                    </div>

                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.18em] text-white/42">From</div>
                      <div className="mt-1 text-3xl font-black leading-none" style={{ color: ORANGE }}>
                        €{vehicle.pricePerDay}
                      </div>
                      <div className="mt-1 text-xs text-white/55">per day</div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-white/65 md:text-[15px]">
                    {vehicle.shortNote}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <SimpleSpec label="Engine" value={vehicle.engine} />
                    <SimpleSpec label="Seats" value={vehicle.seats} />
                    <SimpleSpec label="License" value={vehicle.license} />
                    <SimpleSpec label={vehicle.type === "E-Bike" ? "Range" : "Type"} value={vehicle.range || vehicle.type} />
                  </div>

                  <button
                    onClick={() => reserve(vehicle.id)}
                    className="mt-5 w-full rounded-2xl py-3 text-sm font-black text-black transition hover:opacity-95"
                    style={{
                      background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.86) 100%)`,
                      boxShadow: "0 16px 40px rgba(255,122,0,0.15)",
                    }}
                  >
                    {hasDates ? "Book this vehicle" : "Select dates first"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BOTTOM BOOKING CTA */}
        <section className="mt-12 md:mt-16">
          <div
            className="rounded-[30px] border p-6 text-center md:p-8"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.022))",
            }}
          >
            <h3 className="text-2xl font-black tracking-tight md:text-4xl">
              Ready to ride?
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/65 md:text-base">
              Choose your dates above and continue to booking.
            </p>

            <button
              onClick={goToBookingBar}
              className="mt-5 rounded-2xl px-6 py-3 text-sm font-black text-black transition hover:opacity-95"
              style={{
                background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.86) 100%)`,
                boxShadow: "0 16px 40px rgba(255,122,0,0.15)",
              }}
            >
              Go to booking bar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

function SimpleSpec({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-sm font-black text-white/88">{value}</div>
    </div>
  );
}