import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Scooter Rental Mallorca | Premium Scooter Hire by Nexa Rentals",
  description:
    "Looking for scooter rental in Mallorca? Nexa Rentals offers premium 125cc scooters and e-bikes in Magaluf with fast online booking, modern vehicles, and a smooth rental experience for tourists.",
};

export default function ScooterRentalMallorcaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Premium Mobility in Mallorca
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Scooter Rental <span style={{ color: ORANGE }}>Mallorca</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for the best scooter rental in Mallorca? Nexa Rentals offers
              premium 125cc scooters and modern e-bikes in Magaluf with fast online
              booking, tourist-friendly service, and a smooth rental experience
              built for exploring the island with freedom and style.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/vehicles"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
                  boxShadow: "0 10px 30px rgba(255,122,0,0.25)",
                }}
              >
                View Available Vehicles
              </Link>

              <Link
                href="/"
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
            <h2 className="text-xl font-bold">Fast Online Booking</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Reserve your scooter rental in Mallorca in just a few steps with a
              smooth online booking experience designed for tourists.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Premium 125cc Scooters</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Our fleet includes practical and stylish 125cc scooters that are ideal
              for moving around Mallorca comfortably and efficiently.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Tourist-Friendly Service</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Nexa Rentals is built for visitors who want a reliable, modern, and
              easy way to explore Mallorca without hassle.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Premium Scooter Hire in Mallorca
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Mallorca is one of the best islands in Europe to explore by scooter.
            From beach roads and scenic coastal routes to lively tourist areas and
            charming local streets, having your own scooter gives you flexibility,
            speed, and convenience throughout your trip. Nexa Rentals makes scooter
            hire in Mallorca simple, premium, and easy to book online.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Our scooter rental Mallorca service is designed for tourists who want a
            stylish and practical way to travel. Instead of waiting for taxis,
            dealing with schedules, or paying high transport costs, you can enjoy
            the island at your own pace with a modern rental vehicle from Nexa
            Rentals.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Whether you are planning beach visits, restaurant trips, sightseeing, or
            simply want more freedom during your stay, our rental fleet is built to
            help you enjoy Mallorca comfortably. We focus on premium presentation,
            simple booking, and a professional customer experience from start to
            finish.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">125cc Scooter Rental Mallorca</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Our 125cc scooter rental Mallorca options are ideal for visitors who
              want a practical, comfortable, and modern vehicle for discovering the
              island. These scooters are perfect for short city trips, scenic rides,
              beach access, and moving between popular tourist areas.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Scooter Rental in Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Nexa Rentals is based in Magaluf, making it easy for tourists staying
              in the area to book and ride quickly. Our scooter rental Magaluf
              service is built for convenience, speed, and a premium booking
              experience.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="rounded-[30px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(255,255,255,0.03),rgba(0,0,0,0.2))] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Why Choose <span style={{ color: ORANGE }}>Nexa Rentals</span>
          </h2>

          <ul className="mt-6 space-y-4 text-white/80">
            <li>Premium scooter rental service in Mallorca</li>
            <li>Fast online booking and modern user experience</li>
            <li>125cc scooters and e-bikes for tourists</li>
            <li>Convenient Magaluf-based pickup</li>
            <li>Reliable, stylish, and customer-focused service</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Book Your Scooter Rental in Mallorca Today
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            If you want a smooth, premium, and tourist-friendly scooter rental in
            Mallorca, Nexa Rentals is ready to help. Book online, choose your
            vehicle, and enjoy the freedom to explore Mallorca with confidence.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/vehicles"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
                boxShadow: "0 10px 30px rgba(255,122,0,0.25)",
              }}
            >
              See Fleet
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              Start Booking
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}