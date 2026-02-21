"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BookingBar from "../components/BookingBar";

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

export default function FleetClient() {
  const router = useRouter();
  const sp = useSearchParams();
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
      {/* (KEEP YOUR SAME JSX HERE) */}
      {/* Paste the rest of your JSX exactly as you already have it */}
      {/* ... */}
    </main>
  );
}