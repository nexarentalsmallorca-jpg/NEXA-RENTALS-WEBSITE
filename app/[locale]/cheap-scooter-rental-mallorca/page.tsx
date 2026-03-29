import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Cheap Scooter Rental Mallorca | Affordable Scooter Hire by Nexa Rentals",
  description:
    "Looking for cheap scooter rental in Mallorca? Nexa Rentals offers affordable 125cc scooters and e-bikes in Magaluf with fast online booking, flexible pickup, and premium service for tourists.",
};

export default function CheapScooterRentalMallorcaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Affordable Scooter Hire in Mallorca
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Cheap Scooter Rental <span style={{ color: ORANGE }}>Mallorca</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for cheap scooter rental in Mallorca? Nexa Rentals offers
              affordable 125cc scooters and practical e-bikes in Magaluf with fast
              online booking, tourist-friendly service, and a smooth rental
              experience designed for visitors who want value and freedom.
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
              Nexa Rentals offers affordable scooter rental in Mallorca for tourists
              who want great value without giving up quality.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">125cc Scooters & E-Bikes</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Choose from reliable 125cc scooters and comfortable e-bikes designed
              for flexible travel around Mallorca.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Fast Booking Process</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Reserve online in just a few steps and enjoy a simple and modern
              rental experience in Magaluf.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Affordable Scooter Hire in Mallorca
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Mallorca is one of the best places to explore by scooter. Visitors often
            look for a cheap scooter rental in Mallorca that still feels reliable,
            comfortable, and easy to book. Nexa Rentals focuses on exactly that:
            giving tourists affordable mobility with a premium feel.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Our cheap scooter rental Mallorca service helps visitors move around the
            island more easily, whether they want to reach beaches, restaurants,
            sightseeing spots, or local attractions. Renting a scooter gives you
            flexibility, speed, and better value during your trip.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Instead of spending more on taxis or dealing with fixed schedules, you
            can book a practical scooter or e-bike online and enjoy Mallorca at your
            own pace. Nexa Rentals combines value, convenience, and tourist-friendly
            service in Magaluf.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Cheap 125cc Scooter Rental Mallorca</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Our affordable 125cc scooter rental Mallorca options are ideal for
              tourists who want a practical and comfortable vehicle for moving
              around the island.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Budget-Friendly Scooter Rental in Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Nexa Rentals is based in Magaluf, making it easy for visitors to book
              an affordable scooter quickly and enjoy Mallorca with more freedom.
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
            <li>Affordable scooter rental in Mallorca</li>
            <li>Fast online booking and simple process</li>
            <li>125cc scooters and e-bikes for tourists</li>
            <li>Convenient Magaluf-based service</li>
            <li>Modern, reliable, and customer-focused experience</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Book Your Cheap Scooter Rental in Mallorca
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            If you want affordable scooter rental in Mallorca without sacrificing
            quality, Nexa Rentals is ready to help. Choose your vehicle, book
            online, and explore the island with comfort and freedom.
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