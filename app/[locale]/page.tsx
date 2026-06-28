import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import HomeClientV3 from "../HomeClientV3";
import { defaultLocale, isValidLocale, type Locale } from "../../i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Scooter Rental Mallorca | Nexa Rentals Magaluf",
  description:
    "Looking for scooter rental in Mallorca? Nexa Rentals offers premium scooters and e-bikes in Magaluf with fast online booking, modern vehicles, and a smooth rental experience for tourists.",
};

export default async function Page({ params }: PageProps) {
  const { locale: requestedLocale } = await params;

  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <HomeClientV3 key={locale} />
    </Suspense>
  );
}