// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import FooterMoneyBlogLinks from "../components/FooterMoneyBlogLinks";
import NexaFooter from "../components/NexaFooter";
import WhatsAppSupport from "../components/WhatsAppSupport";
import NeroBookingCopilot from "../components/NeroBookingCopilot";

import {
  defaultLocale,
  isValidLocale,
  locales,
  type Locale,
} from "../../i18n/routing";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nexarentals.es"),
  title: "Scooter Rental Mallorca | Nexa Rentals Magaluf",
  description:
    "Looking for scooter rental in Mallorca? Nexa Rentals offers premium scooters and e-bikes in Magaluf with fast online booking, modern vehicles, and a smooth rental experience for tourists.",

  verification: {
    google: "sWbjYNtf_2ERVardp2bSeygbKnc0bSUEw-mmGo9PVgE",
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      es: "/es",
      de: "/de",
      fr: "/fr",
      it: "/it",
      pt: "/pt",
      sv: "/sv",
      "x-default": "/en",
    },
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale: requestedLocale } = await params;

  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="overflow-x-clip" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}

          <WhatsAppSupport
            phone="34971482342"
            messages={[
              "Hey! Need any help?",
              "Want the best scooter for your trip?",
              "Booking takes only few seconds ⚡",
              "Message us, we reply fast 🙂",
            ]}
          />

          <NeroBookingCopilot />

          <FooterMoneyBlogLinks locale={locale} />
          <NexaFooter />
        </NextIntlClientProvider>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (max-width: 1023px) {
                /*
                  MOBILE ONLY:
                  Move Nero AI icon to the right side.
                  Desktop is not touched.
                */
               /*
  MOBILE ONLY:
  Move Nero AI icon to the right side.
  This targets the fixed AI wrapper by its z-index.
*/
div[style*="2147483647"] {
  left: auto !important;
  right: 18px !important;
  bottom: 84px !important;
  align-items: flex-end !important;
  gap: 10px !important;
}

/*
  MOBILE ONLY:
  Make the AI icon slightly smaller without breaking the inside design.
*/


                /*
                  MOBILE ONLY:
                  Move WhatsApp floating wrapper to the right side.
                  This targets the WhatsApp portal wrapper by its z-index.
                */
                div[style*="2147483400"] {
                  left: auto !important;
                  right: 18px !important;
                  bottom: 20px !important;
                  flex-direction: row-reverse !important;
                  align-items: flex-end !important;
                  gap: 9px !important;
                }

                /*
                  MOBILE ONLY:
                  Make WhatsApp icon slightly smaller.
                */
                div[style*="2147483400"] > a[style*="border-radius: 50%"] {
                  width: 58px !important;
                  height: 58px !important;
                  min-width: 58px !important;
                  min-height: 58px !important;
                }

                /*
                  MOBILE ONLY:
                  Make WhatsApp bubble open from the right side.
                */
                div[style*="2147483400"] > a:not([style*="border-radius: 50%"]) {
                  max-width: 230px !important;
                  font-size: 12px !important;
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}