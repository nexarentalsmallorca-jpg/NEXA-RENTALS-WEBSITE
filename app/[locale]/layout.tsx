// app/[locale]/layout.tsx
import "../globals.css";
import type {Metadata} from "next";
import {Inter, Playfair_Display} from "next/font/google";
import NexaFooter from "../components/NexaFooter";
import WhatsAppSupport from "../components/WhatsAppSupport";
import {NextIntlClientProvider} from "next-intl";
import {locales, defaultLocale} from "../../i18n/next-intl.config";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  display: "swap"
});

export const metadata: Metadata = {
  title: "NEXA Rentals",
  description: "Premium scooter & e-bike rentals in Mallorca"
};

type Props = {
  children: React.ReactNode;
  params: {locale: string};
};

export default async function RootLayout({children, params}: Props) {
  const locale = params?.locale;

  // Keep your behavior: fallback instead of 404
  const safeLocale = locales.includes(locale as any) ? locale : defaultLocale;

const messages = (await import(`../i18n/messages/${safeLocale}.json`)).default;

  return (
    <html
      lang={safeLocale}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={safeLocale} messages={messages}>
          {children}
        </NextIntlClientProvider>

        <WhatsAppSupport
          phone="34600000000"
          messages={[
            "Hey! Need any help?",
            "Want the best scooter for your trip?",
            "Booking takes only Few seconds ⚡",
            "Message us, we reply fast 🙂"
          ]}
        />

        <NexaFooter />
      </body>
    </html>
  );
}