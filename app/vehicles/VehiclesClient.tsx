"use client";
import { useSearchParams } from "next/navigation";

export default function VehiclesClient() {
  const sp = useSearchParams();
  // your existing vehicles UI...
  return <div className="text-white">Vehicles grid…</div>;
}
