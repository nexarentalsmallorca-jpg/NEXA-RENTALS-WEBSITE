"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

type VehicleType = "scooter" | "ebike";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  pricePerDay: number;
  seats?: number;
  cc?: number; // scooters
  rangeKm?: number; // ebikes
  image: string;
  tags: string[];
};

// ✅ Example fleet (replace images with your real ones in /public/images)
const FLEET: Vehicle[] = [
  {
    id: "scooter-125-1",
    name: "Scooter 125cc",
    type: "scooter",
    pricePerDay: 39,
    seats: 2,
    cc: 125,
    image: "/images/scooter-125.png",
    tags: ["Automatic", "2 helmets", "Best seller"],
  },
  {
    id: "scooter-50-1",
    name: "Scooter 50cc",
    type: "scooter",
    pricePerDay: 29,
    seats: 2,
    cc: 50,
    image: "/images/scooter-50.png",
    tags: ["Easy to ride", "City rides"],
  },
  {
    id: "ebike-1",
    name: "E-Bike Premium",
    type: "ebike",
    pricePerDay: 25,
    rangeKm: 60,
    image: "/images/ebike-premium.png",
    tags: ["Long range", "Comfort"],
  },
  {
    id: "ebike-2",
    name: "E-Bike Urban",
    type: "ebike",
    pricePerDay: 19,
    rangeKm: 45,
    image: "/images/ebike-urban.png",
    tags: ["Lightweight", "Budget"],
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/80">
      {children}
    </span>
  );
}

export default function VehiclesGrid() {
  const sp = useSearchParams();

  // These come from your hero booking panel via query params (we’ll add that in step 2)
  const start = sp.get("start"); // "YYYY-MM-DD"
  const end = sp.get("end");     // "YYYY-MM-DD"
  const time = sp.get("time");   // "09:00-19:00" etc

  const [typeFilter, setTypeFilter] = useState<VehicleType | "all">("all");
  const [search, setSearch] = useState("");

  // ✅ Demo availability logic
  // Later you’ll replace this with real availability from your database.
  const availableVehicles = useMemo(() => {
    let list = [...FLEET];

    if (typeFilter !== "all") {
      list = list.filter(v => v.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q));
    }

    // Example: pretend 50cc is unavailable for some date range (demo only)
    if (start && end && start === end) {
      list = list.filter(v => v.id !== "scooter-50-1");
    }

    return list;
  }, [typeFilter, search, start, end]);

  return (
    <section className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold">
          Available Vehicles
        </h1>

        <p className="text-white/60 mt-2">
          {start && end ? (
            <>
              Showing availability for <span className="text-white">{start}</span> →{" "}
              <span className="text-white">{end}</span>
              {time ? <> • <span className="text-white">{time}</span></> : null}
            </>
          ) : (
            "Select dates on the homepage to filter availability."
          )}
        </p>

        {/* Filters */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-xl border ${
                typeFilter === "all" ? "bg-white/10 border-white/20" : "border-white/10"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("scooter")}
              className={`px-4 py-2 rounded-xl border ${
                typeFilter === "scooter" ? "bg-white/10 border-white/20" : "border-white/10"
              }`}
            >
              Scooters
            </button>
            <button
              onClick={() => setTypeFilter("ebike")}
              className={`px-4 py-2 rounded-xl border ${
                typeFilter === "ebike" ? "bg-white/10 border-white/20" : "border-white/10"
              }`}
            >
              E-Bikes
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle..."
            className="w-full md:w-80 px-4 py-2 rounded-xl bg-white/5 border border-white/10 outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {availableVehicles.length === 0 ? (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-white/70">
            No vehicles available for these filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableVehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
              >
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5">
  {/* glow behind */}
  <div className="absolute inset-0">
    <div className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-3xl" />
  </div>

  <Image
    src={v.image}
    alt={v.name}
    fill
    className="object-contain p-4 relative z-10"
  />
</div>



                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold">{v.name}</h3>
                    <div className="text-right">
                      <div className="text-xl font-bold">€{v.pricePerDay}</div>
                      <div className="text-xs text-white/60">per day</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {v.type === "scooter" ? (
                      <>
                        {v.cc ? <Pill>{v.cc}cc</Pill> : null}
                        {v.seats ? <Pill>{v.seats} seats</Pill> : null}
                      </>
                    ) : (
                      <>
                        {v.rangeKm ? <Pill>{v.rangeKm} km range</Pill> : null}
                        <Pill>Pedal assist</Pill>
                      </>
                    )}

                    {v.tags.slice(0, 2).map((t) => (
                      <Pill key={t}>{t}</Pill>
                    ))}
                  </div>

                  <button
                    className="mt-5 w-full py-3 rounded-xl bg-orange-500 text-black font-semibold hover:opacity-90 transition"
                    onClick={() => alert(`Selected: ${v.name}`)}
                  >
                    Rent this vehicle
                  </button>

                  <p className="mt-3 text-xs text-white/50">
                    Next step: connect checkout + payment + booking system.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
