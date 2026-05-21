import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import BlogRentalGuides from "@/app/components/blog/BlogRentalGuides";
import HomeClientV2 from "../HomeClientV2";
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
    <>
      <Suspense fallback={null}>
        <HomeClientV2 key={locale} />
      </Suspense>
      <div className="bg-[#0f1115] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <BlogRentalGuides locale={locale} variant="dark" />
        </div>
      </div>
    </>
  );
}