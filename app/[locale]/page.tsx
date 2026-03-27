import type { Metadata } from "next";
import { Suspense } from "react";
import HomeClient from "../HomeClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Scooter Rental Magaluf Mallorca | Nexa Rentals",
  description:
    "Rent scooters and e-bikes in Magaluf, Mallorca with Nexa Rentals. Fast online booking, premium vehicles, and a smooth rental experience for tourists.",
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <HomeClient key={locale} />
    </Suspense>
  );
}