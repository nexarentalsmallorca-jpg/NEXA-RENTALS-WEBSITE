import type { Metadata } from "next";
import Link from "next/link";
import BlogRentalGuides from "@/app/components/blog/BlogRentalGuides";
import { defaultLocale, isValidLocale, type Locale } from "@/i18n/routing";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "E-Bike Rental Mallorca | Premium Electric Bikes by Nexa Rentals",
  description:
    "Looking for e-bike rental in Mallorca? Nexa Rentals offers premium electric bikes in Magaluf with fast online booking and a smooth rental experience for tourists.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function EBikeRentalMallorcaPage({ params }: Props) {
  const { locale: requestedLocale } = await params;
  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Premium E-Bike Mobility in Mallorca
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              E-Bike Rental <span style={{ color: ORANGE }}>Mallorca</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for the best e-bike rental in Mallorca? Nexa Rentals offers
              premium electric bikes in Magaluf with fast online booking, modern
              vehicles, and a smooth rental experience for tourists who want a
              flexible and eco-friendly way to explore the island.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/${locale}/vehicles`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
                  boxShadow: "0 10px 30px rgba(255,122,0,0.25)",
                }}
              >
                View Available E-Bikes
              </Link>

              <Link
                href={`/${locale}`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
              >
                Book Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Easy Online Booking</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Reserve your e-bike rental in Mallorca in just a few steps with a
              simple and modern booking experience.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Comfortable Electric Bikes</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Our premium electric bikes are perfect for relaxed island rides,
              local routes, and convenient daily travel in Mallorca.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Eco-Friendly Exploration</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Discover Mallorca in a smarter and cleaner way with a comfortable
              e-bike rental designed for tourists and visitors.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Premium Electric Bike Hire in Mallorca
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Mallorca is an amazing place to explore by e-bike. From coastal roads
            and beach promenades to town routes and scenic areas, electric bikes
            offer a comfortable and enjoyable way to discover more of the island.
            Nexa Rentals provides premium e-bike hire in Mallorca for tourists who
            want convenience, freedom, and a modern riding experience.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Our e-bike rental Mallorca service is ideal for visitors who prefer an
            eco-friendly and relaxed way to move around. Instead of depending on
            taxis or public transport, you can enjoy the island at your own pace
            with a high-quality electric bike from Nexa Rentals.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Whether you want to ride near Magaluf, visit nearby attractions, or
            simply enjoy more flexibility during your stay, our electric bike rental
            options are designed to make your Mallorca experience smoother and more
            enjoyable.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">E-Bike Rental in Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Nexa Rentals offers e-bike rental in Magaluf for tourists who want a
              smooth, comfortable, and practical way to enjoy the local area and
              explore Mallorca with ease.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Comfortable Island Riding</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Electric bikes are great for beach areas, sightseeing, scenic routes,
              and short daily trips. They are an excellent choice for relaxed and
              eco-friendly island travel.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="rounded-[30px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(255,255,255,0.03),rgba(0,0,0,0.2))] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Why Choose <span style={{ color: ORANGE }}>Nexa Rentals</span> for E-Bikes
          </h2>

          <ul className="mt-6 space-y-4 text-white/80">
            <li>Premium e-bike rental service in Mallorca</li>
            <li>Fast online booking for tourists</li>
            <li>Comfortable electric bikes for island exploration</li>
            <li>Convenient Magaluf-based service</li>
            <li>Modern, eco-friendly, and customer-focused experience</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Book Your E-Bike Rental in Mallorca Today
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            Nexa Rentals is ready to help you enjoy a premium and eco-friendly
            e-bike rental experience in Mallorca. Book online, choose your vehicle,
            and explore the island with more comfort and freedom.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/vehicles`}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
                boxShadow: "0 10px 30px rgba(255,122,0,0.25)",
              }}
            >
              See Fleet
            </Link>

            <Link
              href={`/${locale}`}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              Start Booking
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <BlogRentalGuides locale={locale} variant="dark" />
      </section>
    </main>
  );
}