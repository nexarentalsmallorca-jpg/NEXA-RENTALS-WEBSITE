"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Premium Vehicles Page (NEXA Rentals)
 * - Reads: pickupLocation, from, to, pickupTime, dropoffTime from URL
 * - Premium UI: hero + sticky booking summary + filters + sorting + cards
 * - Safe for Next build: this file is "use client" and page.tsx wraps in Suspense
 */

type VehicleType = "Scooter" | "Motorbike" | "Car" | "E-Bike";
type Transmission = "Auto" | "Manual";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  seats: number;
  transmission: Transmission;
  pricePerDay: number;
  rating: number; // 0..5
  reviews: number;
  imageUrl: string;
  badges: string[];
  featured?: boolean;
};

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

const VEHICLES: Vehicle[] = [
  {
    id: "v1",
    name: "Yamaha NMAX 125",
    brand: "Yamaha",
    type: "Scooter",
    seats: 2,
    transmission: "Auto",
    pricePerDay: 39,
    rating: 4.8,
    reviews: 241,
    imageUrl:
      "https://images.unsplash.com/photo-1527333656061-ca7adf608ae1?auto=format&fit=crop&w=1400&q=80",
    badges: ["Best Seller", "Fuel Efficient"],
    featured: true,
  },
  {
    id: "v2",
    name: "Honda PCX 125",
    brand: "Honda",
    type: "Scooter",
    seats: 2,
    transmission: "Auto",
    pricePerDay: 37,
    rating: 4.7,
    reviews: 190,
    imageUrl:
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1400&q=80",
    badges: ["Comfort Ride"],
    featured: true,
  },
  {
    id: "v3",
    name: "Vespa Primavera 125",
    brand: "Vespa",
    type: "Scooter",
    seats: 2,
    transmission: "Auto",
    pricePerDay: 45,
    rating: 4.9,
    reviews: 112,
    imageUrl:
      "https://images.unsplash.com/photo-1517957754642-2870518e16f8?auto=format&fit=crop&w=1400&q=80",
    badges: ["Premium", "Iconic"],
  },
  {
    id: "v4",
    name: "Kawasaki Z650",
    brand: "Kawasaki",
    type: "Motorbike",
    seats: 2,
    transmission: "Manual",
    pricePerDay: 89,
    rating: 4.6,
    reviews: 78,
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
    badges: ["Sport", "Power"],
  },
  {
    id: "v5",
    name: "BMW 1 Series (Automatic)",
    brand: "BMW",
    type: "Car",
    seats: 5,
    transmission: "Auto",
    pricePerDay: 119,
    rating: 4.7,
    reviews: 64,
    imageUrl:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80",
    badges: ["Premium", "A/C"],
    featured: true,
  },
  {
    id: "v6",
    name: "Urban E-Bike Pro",
    brand: "NEXA",
    type: "E-Bike",
    seats: 1,
    transmission: "Auto",
    pricePerDay: 29,
    rating: 4.5,
    reviews: 51,
    imageUrl:
      "https://images.unsplash.com/photo-1520975682031-a5a40304f2a4?auto=format&fit=crop&w=1400&q=80",
    badges: ["Eco", "Easy Ride"],
  },
];

type SortKey = "featured" | "price_low" | "price_high" | "rating";

export default function VehiclesClient() {
  const sp = useSearchParams();
  const router = useRouter();

  // ---- read booking params ----
  const pickupLocation = safeParam(sp, "pickupLocation") ?? "Magaluf (Carrer Galeón 13)";
  const from = parseISO(safeParam(sp, "from"));
  const to = parseISO(safeParam(sp, "to"));
  const pickupTime = safeParam(sp, "pickupTime") ?? "10:00";
  const dropoffTime = safeParam(sp, "dropoffTime") ?? "10:00";

  const rentalDays = useMemo(() => daysBetween(from, to), [from, to]);

  // ---- filters ----
  const [type, setType] = useState<VehicleType | "All">("All");
  const [transmission, setTransmission] = useState<Transmission | "All">("All");
  const [seats, setSeats] = useState<number | "All">("All");
  const [minPrice, setMinPrice] = useState<number>(20);
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  // keep price bounds sensible
  useEffect(() => {
    if (minPrice > maxPrice) setMinPrice(maxPrice);
  }, [minPrice, maxPrice]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = VEHICLES.filter((v) => {
      if (type !== "All" && v.type !== type) return false;
      if (transmission !== "All" && v.transmission !== transmission) return false;
      if (seats !== "All" && v.seats !== seats) return false;
      if (v.pricePerDay < minPrice || v.pricePerDay > maxPrice) return false;
      if (q) {
        const hay = `${v.name} ${v.brand} ${v.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // sort
    list = [...list].sort((a, b) => {
      if (sort === "featured") {
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (bf !== af) return bf - af;
        // tie-breaker rating
        return b.rating - a.rating;
      }
      if (sort === "price_low") return a.pricePerDay - b.pricePerDay;
      if (sort === "price_high") return b.pricePerDay - a.pricePerDay;
      return b.rating - a.rating;
    });

    return list;
  }, [type, transmission, seats, minPrice, maxPrice, query, sort]);

  const featured = useMemo(() => VEHICLES.filter((v) => v.featured), []);

  const resetFilters = () => {
    setType("All");
    setTransmission("All");
    setSeats("All");
    setMinPrice(20);
    setMaxPrice(150);
    setQuery("");
    setSort("featured");
  };

  const onEditDates = () => {
    // go back to homepage (or wherever BookingBar lives)
    router.push("/");
  };

  const onSelectVehicle = (v: Vehicle) => {
    // keep booking params and add vehicle id
    const params = new URLSearchParams(sp.toString());
    params.set("vehicleId", v.id);
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070A12] via-[#0B1022] to-[#06070C] text-white">
      {/* Top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-[-180px] h-[380px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]" />

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live availability • Magaluf
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">
                Choose your ride
                <span className="text-white/70"> — premium rentals</span>
              </h1>

              <p className="mt-2 max-w-2xl text-white/70">
                Curated scooters, bikes, e-bikes and cars — clean, insured and ready in minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onEditDates}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/85 hover:bg-white/10 transition"
              >
                Edit dates
              </button>
              <a
                href="#fleet"
                className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:opacity-90 transition"
              >
                View fleet
              </a>
            </div>
          </div>

          {/* Premium booking summary bar */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Pill label="Pickup" value={`${fmtDate(from)} • ${formatTimeLabel(pickupTime)}`} />
                <Pill label="Dropoff" value={`${fmtDate(to)} • ${formatTimeLabel(dropoffTime)}`} />
                <Pill label="Location" value={pickupLocation} />
                <Pill label="Duration" value={`${rentalDays} day${rentalDays > 1 ? "s" : ""}`} />
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3">
                <div className="text-sm text-white/70">
                  {results.length} option{results.length !== 1 ? "s" : ""} found
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-white/10 bg-[#0E1430] px-3 py-2 text-sm font-bold text-white/90 outline-none hover:border-white/20 transition"
                >
                  <option value="featured">Featured</option>
                  <option value="price_low">Price: Low → High</option>
                  <option value="price_high">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="fleet" className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pb-16">
          {/* Featured row */}
          <section className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight">Featured picks</h2>
              <div className="text-xs text-white/60">Premium availability, best value</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.slice(0, 3).map((v) => (
                <FeaturedCard key={v.id} v={v} days={rentalDays} onSelect={() => onSelectVehicle(v)} />
              ))}
            </div>
          </section>

          {/* Layout: Filters + Grid */}
          <section className="mt-10 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
            {/* Filters */}
            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black">Filters</div>
                    <div className="text-xs text-white/60">Refine your selection</div>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-xs font-black text-white/70 hover:text-white transition"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white/70">Search</label>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Yamaha, Vespa, BMW..."
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#0E1430] px-3 py-2 text-sm font-semibold text-white/90 outline-none placeholder:text-white/35 focus:border-white/20 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-white/70">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0E1430] px-3 py-2 text-sm font-semibold text-white/90 outline-none hover:border-white/20 transition"
                      >
                        <option value="All">All</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Motorbike">Motorbike</option>
                        <option value="E-Bike">E-Bike</option>
                        <option value="Car">Car</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white/70">Transmission</label>
                      <select
                        value={transmission}
                        onChange={(e) => setTransmission(e.target.value as any)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0E1430] px-3 py-2 text-sm font-semibold text-white/90 outline-none hover:border-white/20 transition"
                      >
                        <option value="All">All</option>
                        <option value="Auto">Auto</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-white/70">Seats</label>
                      <select
                        value={seats}
                        onChange={(e) => setSeats(e.target.value === "All" ? "All" : Number(e.target.value))}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-[#0E1430] px-3 py-2 text-sm font-semibold text-white/90 outline-none hover:border-white/20 transition"
                      >
                        <option value="All">All</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="5">5</option>
                      </select>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#0E1430] p-3">
                      <div className="text-xs font-bold text-white/70">Price / day</div>
                      <div className="mt-1 text-sm font-black">${minPrice} — ${maxPrice}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-white/70">
                        <span>Min</span>
                        <span>${minPrice}</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={200}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-white/70">
                        <span>Max</span>
                        <span>${maxPrice}</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={200}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-black">Need help?</div>
                    <div className="mt-1 text-xs text-white/70">
                      WhatsApp support • fast pickup • flexible returns
                    </div>
                    <button className="mt-3 w-full rounded-xl bg-white px-4 py-2 text-sm font-black text-black hover:opacity-90 transition">
                      Contact support
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight">All vehicles</h2>
                  <p className="mt-1 text-sm text-white/60">
                    Tap a card to select. Pricing updates based on your dates.
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  Premium availability
                </div>
              </div>

              <div className="mt-5">
                <AnimatePresence mode="popLayout">
                  {results.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
                    >
                      <div className="text-xl font-black">No matches</div>
                      <div className="mt-2 text-sm text-white/70">
                        Try widening price range or clearing filters.
                      </div>
                      <button
                        onClick={resetFilters}
                        className="mt-4 rounded-xl bg-white px-5 py-2 text-sm font-black text-black hover:opacity-90 transition"
                      >
                        Reset filters
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {results.map((v) => (
                        <VehicleCard
                          key={v.id}
                          v={v}
                          days={rentalDays}
                          onSelect={() => onSelectVehicle(v)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer bar */}
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/85">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-sm font-black">Premium included</div>
                    <div className="mt-1 text-sm text-white/60">
                      Helmet options • local support • quick pickup • transparent pricing
                    </div>
                  </div>
                  <button className="rounded-xl bg-white px-5 py-2 text-sm font-black text-black hover:opacity-90 transition">
                    See what’s included
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* --------------------------- UI Bits --------------------------- */

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0E1430] px-3 py-2">
      <div className="text-[11px] font-black text-white/60">{label}</div>
      <div className="text-sm font-extrabold text-white/90">{value}</div>
    </div>
  );
}

function FeaturedCard({
  v,
  days,
  onSelect,
}: {
  v: Vehicle;
  days: number;
  onSelect: () => void;
}) {
  const total = v.pricePerDay * days;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    >
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.imageUrl}
          alt={v.name}
          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 bottom-4">
          <div className="text-xs font-black text-white/70">{v.type} • {v.transmission}</div>
          <div className="text-lg font-black">{v.name}</div>
        </div>

        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/90 backdrop-blur">
          ★ {v.rating.toFixed(1)}
          <span className="text-white/60">({v.reviews})</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {v.badges.slice(0, 3).map((b) => (
            <span key={b} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black text-white/80">
              {b}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-sm text-white/60">From</div>
            <div className="text-2xl font-black">${v.pricePerDay}<span className="text-sm text-white/60">/day</span></div>
          </div>

          <div className="text-right">
            <div className="text-sm text-white/60">Est. total</div>
            <div className="text-lg font-black">${total}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="rounded-xl bg-white px-4 py-2 text-center text-sm font-black text-black group-hover:opacity-90 transition">
            Select
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function VehicleCard({
  v,
  days,
  onSelect,
}: {
  v: Vehicle;
  days: number;
  onSelect: () => void;
}) {
  const total = v.pricePerDay * days;

  return (
    <motion.button
      layout
      onClick={onSelect}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
    >
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.imageUrl}
          alt={v.name}
          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
        <div className="absolute left-4 bottom-4">
          <div className="text-xs font-black text-white/70">{v.brand} • {v.type}</div>
          <div className="text-base font-black">{v.name}</div>
        </div>

        <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/90 backdrop-blur">
          ★ {v.rating.toFixed(1)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black text-white/75">
          <Tag>{v.transmission}</Tag>
          <Tag>{v.seats} seat{v.seats > 1 ? "s" : ""}</Tag>
          {v.badges.slice(0, 2).map((b) => (
            <Tag key={b}>{b}</Tag>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-xs text-white/60">Price</div>
            <div className="text-xl font-black">
              ${v.pricePerDay}
              <span className="text-sm text-white/60">/day</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-white/60">Est. total</div>
            <div className="text-lg font-black">${total}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-white/60">{v.reviews} reviews</div>
          <div className="rounded-xl bg-white px-4 py-2 text-sm font-black text-black group-hover:opacity-90 transition">
            Select
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      {children}
    </span>
  );
}
