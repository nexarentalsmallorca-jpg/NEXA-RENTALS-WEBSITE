"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ORANGE = "#FF7A00";

type Vehicle = {
  id: string;
  name: string;
  type: "Scooter" | "E-Bike";
  pricePerDay: number;
  rating: number;
  badge: string;
  imageUrl: string;
};

const FEATURED: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 39,
    rating: 4.8,
    badge: "Best Seller",
    imageUrl: "/images/zontes125.png",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 37,
    rating: 4.7,
    badge: "Comfort Pick",
    imageUrl: "/images/liberty125.png",
  },
  {
    id: "e1",
    name: "URBAN e-BIKE PERFORMANCE",
    type: "E-Bike",
    pricePerDay: 29,
    rating: 4.6,
    badge: "Eco Choice",
    imageUrl: "/images/citybike2.png",
  },
  {
    id: "e2",
    name: "CITY e-BIKE COMFORT",
    type: "E-Bike",
    pricePerDay: 25,
    rating: 4.5,
    badge: "Great Value",
    imageUrl: "/images/e20.png",
  },
];

export default function FeaturedFleet() {
  const router = useRouter();
  const sp = useSearchParams();
  const items = useMemo(() => FEATURED, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const START_DELAY_MS = 350;
    const STEP_MS = 350;

    let startTimer: ReturnType<typeof setTimeout> | null = null;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    if (inView) {
      setActiveIndex(-1);

      startTimer = setTimeout(() => {
        items.forEach((_, i) => {
          timers.push(
            setTimeout(() => {
              setActiveIndex((prev) => (i > prev ? i : prev));
            }, i * STEP_MS)
          );
        });
      }, START_DELAY_MS);
    } else {
      setActiveIndex(-1);
    }

    return () => {
      if (startTimer) clearTimeout(startTimer);
      timers.forEach(clearTimeout);
    };
  }, [inView, items]);

  const goToVehicles = (vehicleId?: string) => {
    const params = new URLSearchParams(sp.toString());
    if (vehicleId) params.set("vehicleId", vehicleId);
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* Header */}
      <div
        className={[
          "transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="brand-kicker">Featured Fleet</div>

            <h2
              className="mt-3 text-2xl md:text-3xl font-black tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Pick your ride
            </h2>

            <p className="mt-2 text-white/65 max-w-2xl">
              A few top picks — tap any vehicle to see details and availability.
            </p>
          </div>

          <button
            onClick={() => goToVehicles()}
            className="rounded-xl px-6 py-3 text-sm font-black text-black hover:opacity-90 transition"
            style={{ background: ORANGE }}
          >
            View all vehicles
          </button>
        </div>
      </div>

      {/* ✅ GRID FIXED HERE */}
      <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {items.map((v, idx) => {
          const show = idx <= activeIndex;

          return (
            <button
              key={v.id}
              onClick={() => goToVehicles(v.id)}
              className={[
                "group relative w-full text-left",
                "transition-all duration-700 ease-out",
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                  className="absolute left-1/2 top-[55%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px] opacity-40"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.00) 70%)",
                  }}
                />
              </div>

              <div className="relative mx-auto h-[240px] w-full">
                <div className="pointer-events-none absolute left-1/2 bottom-6 h-10 w-[75%] -translate-x-1/2 rounded-full bg-black/60 blur-xl opacity-70 transition-all duration-500 ease-out group-hover:bottom-5 group-hover:opacity-85" />

                <img
                  src={v.imageUrl}
                  alt={v.name}
                  className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white/60">{v.type}</div>
                  <div className="truncate text-sm font-black text-white">{v.name}</div>
                </div>

                <div className="shrink-0 text-sm font-black" style={{ color: ORANGE }}>
                  €{v.pricePerDay}
                  <span className="text-xs text-white/50">/day</span>
                </div>
              </div>

              <div
                className="mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-black text-white/80"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                {v.badge}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
