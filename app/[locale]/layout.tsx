// app/[locale]/layout.tsx
import "../globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import NexaFooter from "../components/NexaFooter";
import WhatsAppSupport from "../components/WhatsAppSupport";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { locales } from "../../i18n/routing";

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
  title: "Scooter Rental Mallorca | Nexa Rentals Magaluf",
  description:
    "Looking for scooter rental in Mallorca? Nexa Rentals offers premium scooters and e-bikes in Magaluf with fast online booking, modern vehicles, and a smooth rental experience for tourists.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  const safeLocale = locales.includes(locale as any) ? locale : "en";

  setRequestLocale(safeLocale);

  const messages = await getMessages();

  return (
    <html
      lang={safeLocale}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={safeLocale} messages={messages}>
          {children}

          <WhatsAppSupport
            phone="34600000000"
            messages={[
              "Hey! Need any help?",
              "Want the best scooter for your trip?",
              "Booking takes only Few seconds ⚡",
              "Message us, we reply fast 🙂",
            ]}
          />

          <NexaFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}