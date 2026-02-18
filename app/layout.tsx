import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import NexaFooter from "./components/NexaFooter";
import WhatsAppSupport from "./components/WhatsAppSupport";

/**
 * Premium Font System
 * - Inter → body / UI
 * - Playfair → headings / luxury feel
 */

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
  title: "NEXA Rentals",
  description: "Premium scooter & e-bike rentals in Mallorca",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}

        {/* WhatsApp Floating Icon (Bottom Right) */}
        <WhatsAppSupport
  phone="34600000000"
  messages={[
    "Hey! Need any help?",
    "Want the best scooter for your trip?",
    "Booking takes only Few seconds ⚡",
    "Message us, we reply fast 🙂",
  ]}
/>

        {/* Global Footer Bar */}
        <NexaFooter />
      </body>
    </html>
  );
}
