import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About NEXA Rentals | Mallorca’s First AI-Powered Scooter Rental Experience",
  description:
    "Learn about NEXA Rentals, the first scooter rental company in Mallorca to introduce an advanced AI assistant across website and WhatsApp. Premium scooter and e-bike rental in Magaluf with fast booking, multilingual support, and modern technology.",
  keywords: [
    "about NEXA Rentals",
    "NEXA Rentals Mallorca",
    "scooter rental Magaluf",
    "scooter rental Mallorca",
    "e-bike rental Magaluf",
    "AI scooter rental Mallorca",
    "WhatsApp AI assistant Mallorca",
    "premium scooter rental Mallorca",
    "rent scooter in Magaluf",
    "motorbike rental Mallorca",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About NEXA Rentals | Mallorca’s First AI-Powered Scooter Rental Experience",
    description:
      "Premium scooter and e-bike rental in Magaluf powered by advanced AI support, fast booking, multilingual assistance, and modern customer experience.",
    url: "/about",
    siteName: "NEXA Rentals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About NEXA Rentals | Mallorca’s First AI-Powered Scooter Rental Experience",
    description:
      "Discover NEXA Rentals, a modern scooter and e-bike rental company in Magaluf using advanced AI across its website and WhatsApp.",
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "NEXA Rentals",
    description:
      "Premium scooter and e-bike rental company in Magaluf, Mallorca, known for advanced AI customer support, fast online booking, and multilingual service.",
    areaServed: "Mallorca",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Magaluf",
      addressRegion: "Balearic Islands",
      addressCountry: "ES",
    },
    url: "https://www.nexarentals.com/about",
    brand: "NEXA Rentals",
    knowsAbout: [
      "Scooter rental in Magaluf",
      "E-bike rental in Magaluf",
      "AI customer support",
      "WhatsApp booking assistant",
      "Tourist mobility in Mallorca",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}