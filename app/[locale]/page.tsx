import type { Metadata } from "next";
import { Suspense } from "react";
import HomeClient from "../HomeClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Scooter Rental Mallorca | Nexa Rentals Magaluf",
  description:
    "Looking for scooter rental in Mallorca? Nexa Rentals offers premium scooters and e-bikes in Magaluf with fast online booking, modern vehicles, and a smooth rental experience for tourists.",
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <HomeClient key={locale} />
    </Suspense>
  );
}