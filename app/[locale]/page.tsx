import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import NexaBookingShowroomV3 from "../components/NexaBookingShowroomV3";
import { defaultLocale, isValidLocale, type Locale } from "../../i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: requestedLocale } = await params;

  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  const seo = {
    en: {
      title: "Scooter Rental Mallorca | NEXA Rentals",
      description:
        "Rent a scooter in Mallorca with NEXA Rentals. 50cc and 125cc scooters, easy online booking and convenient rental service from Magaluf.",
    },
    es: {
      title: "Alquiler de Scooters en Mallorca | NEXA Rentals",
      description:
        "Alquila una scooter en Mallorca con NEXA Rentals. Scooters de 50cc y 125cc, reserva online fácil y servicio de alquiler desde Magaluf.",
    },
    de: {
      title: "Roller mieten Mallorca | NEXA Rentals",
      description:
        "Roller auf Mallorca mieten mit NEXA Rentals. 50cc und 125cc Roller, einfache Online-Buchung und Rollervermietung in Magaluf.",
    },
    fr: {
  title: "NEXA Rentals Magaluf | Scooters & E-Bikes",
  description:
    "NEXA Rentals à Magaluf. Choisissez votre scooter ou e-bike, consultez les disponibilités et réservez facilement en ligne pour votre séjour à Majorque.",
},
    it: {
      title: "Noleggio Scooter Maiorca | NEXA Rentals",
      description:
        "Noleggia uno scooter a Maiorca con NEXA Rentals. Scooter 50cc e 125cc, prenotazione online facile e servizio di noleggio da Magaluf.",
    },
  } as const;

  const selected =
    locale in seo
      ? seo[locale as keyof typeof seo]
      : seo.en;

  return {
    ...selected,
    alternates: {
      canonical: `https://www.nexarentals.es/${locale}`,
      languages: {
        en: "https://www.nexarentals.es/en",
        es: "https://www.nexarentals.es/es",
        de: "https://www.nexarentals.es/de",
        fr: "https://www.nexarentals.es/fr",
        it: "https://www.nexarentals.es/it",
        "x-default": "https://www.nexarentals.es/en",
      },
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale: requestedLocale } = await params;

  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  setRequestLocale(locale);

  return (
    <Suspense fallback={null}>
      <NexaBookingShowroomV3 key={locale} />
    </Suspense>
  );
}