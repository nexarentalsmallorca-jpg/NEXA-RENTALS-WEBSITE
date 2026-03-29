import type { Metadata } from "next";
import { Suspense } from "react";
import VehiclesClient from "./VehiclesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Scooter Rental Mallorca Fleet | Nexa Rentals Magaluf",
  description:
    "Browse premium scooter rental Mallorca options, 125cc scooters, and e-bike rental in Magaluf. Fast online booking with Nexa Rentals.",
};

export default function VehiclesPage() {
  return (
    <Suspense fallback={null}>
      <VehiclesClient />
    </Suspense>
  );
}