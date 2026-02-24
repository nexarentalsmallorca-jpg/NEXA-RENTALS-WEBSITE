// app/[locale]/layout.tsx
import "../globals.css";
import type {Metadata} from "next";
import {Inter, Playfair_Display} from "next/font/google";
import NexaFooter from "../components/NexaFooter";
import WhatsAppSupport from "../components/WhatsAppSupport";
import {NextIntlClientProvider} from "next-intl";
import {getMessages} from "next-intl/server";
import {notFound} from "next/navigation";
import {locales} from "../../next-intl.config";

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
  const {locale} = params;// ✅ FIX: no await

  if (!locales.includes(locale as any)) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
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