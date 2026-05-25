import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Cheap Scooter Rental Magaluf | Affordable Hire by Nexa Rentals",
  description:
    "Looking for cheap scooter rental in Magaluf? Nexa Rentals offers affordable 125cc scooters and e-bikes with fast online booking, premium service, and convenient pickup in Mallorca.",
};

export default function CheapScooterRentalMagalufPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Affordable Scooter Hire in Magaluf
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Cheap Scooter Rental <span style={{ color: ORANGE }}>Magaluf</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for cheap scooter rental in Magaluf? Nexa Rentals offers
              affordable 125cc scooters and e-bikes for tourists who want a fast,
              simple, and premium way to explore Mallorca without spending too much
              on transport.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
                  boxShadow: "0 10px 30px rgba(255,122,0,0.25)",
                }}
              >
                View Affordable Vehicles
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
            <h2 className="text-xl font-bold">Affordable Daily Prices</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Nexa Rentals offers budget-friendly scooter rental in Magaluf for
              tourists who want value, flexibility, and convenience.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Perfect for Tourists</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Our scooters are ideal for hotels, beaches, restaurants, local trips,
              and easy movement around Magaluf and nearby areas.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Fast Online Booking</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Reserve your scooter online in just a few steps and enjoy a smooth
              rental experience with Nexa Rentals.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Affordable Scooter Hire in Magaluf
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Magaluf is one of the best places in Mallorca to rent a scooter.
            Visitors staying near hotels, beaches, nightlife areas, and local
            attractions often want a faster and cheaper way to move around. Nexa
            Rentals helps tourists enjoy Magaluf with affordable scooter hire and a
            premium booking experience.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Instead of relying on taxis or paying more for repeated trips, a cheap
            scooter rental in Magaluf gives you flexibility and better value. You
            can move between beaches, restaurants, scenic spots, and nearby areas
            more comfortably and on your own schedule.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Nexa Rentals focuses on combining affordable pricing, tourist-friendly
            service, and modern vehicles. That makes our scooter rental service a
            strong option for visitors who want budget-friendly mobility in
            Mallorca.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Cheap 125cc Scooter Rental Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Our affordable 125cc scooter rental Magaluf options are ideal for
              tourists who want reliable and practical vehicles for exploring the
              island with more flexibility.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Better Value for Mallorca Travel</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Renting a scooter in Magaluf can save money and time during your trip,
              especially if you want to explore more of Mallorca without depending
              on fixed transport schedules.
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
            <li>Affordable scooter rental in Magaluf</li>
            <li>Fast online booking for tourists</li>
            <li>125cc scooters and e-bikes available</li>
            <li>Convenient Magaluf-based pickup</li>
            <li>Modern, reliable, and customer-focused service</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Book Your Cheap Scooter Rental in Magaluf
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            If you want a practical and affordable way to enjoy Magaluf and
            Mallorca, Nexa Rentals is ready to help. Book online, choose your
            vehicle, and start your trip with more freedom and convenience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
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