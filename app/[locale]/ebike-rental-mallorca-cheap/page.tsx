import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Cheap E-Bike Rental Mallorca | Affordable Electric Bikes by Nexa Rentals",
  description:
    "Looking for cheap e-bike rental in Mallorca? Nexa Rentals offers affordable electric bikes in Magaluf with fast online booking, tourist-friendly service, and smooth island travel.",
};

export default function CheapEBikeRentalMallorcaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Affordable E-Bike Hire in Mallorca
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Cheap E-Bike Rental <span style={{ color: ORANGE }}>Mallorca</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for cheap e-bike rental in Mallorca? Nexa Rentals offers
              affordable electric bikes in Magaluf with fast online booking and a
              smooth, tourist-friendly experience for visitors who want flexible,
              eco-friendly, and budget-friendly island travel.
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
                View Affordable E-Bikes
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
              Nexa Rentals offers budget-friendly e-bike rental in Mallorca for
              tourists who want more value and flexibility.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Eco-Friendly Island Travel</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Electric bikes are ideal for scenic routes, beach areas, local trips,
              and comfortable exploration around Mallorca.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Fast Online Booking</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Reserve your e-bike online in just a few steps and enjoy a smooth,
              modern rental experience.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Affordable Electric Bike Hire in Mallorca
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Mallorca is a great place to explore by electric bike. Visitors looking
            for cheap e-bike rental in Mallorca often want a comfortable, easy, and
            eco-friendly way to move around without spending too much on transport.
            Nexa Rentals helps tourists enjoy the island with affordable electric
            bike hire and a premium booking experience.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Renting an e-bike is a smart option for beaches, promenades, nearby
            attractions, relaxed sightseeing, and local travel. It gives you more
            flexibility than public transport and can be a more affordable way to
            enjoy Mallorca at your own pace.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Nexa Rentals combines affordable pricing, tourist-friendly service, and
            comfortable electric bikes, making our e-bike rental service a strong
            option for visitors staying in Magaluf and surrounding areas.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Cheap E-Bike Rental in Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Our affordable e-bike rental Magaluf options are ideal for tourists
              who want comfortable and budget-friendly mobility during their stay.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Better Value for Island Travel</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Electric bikes can save money and make local travel more enjoyable,
              especially for tourists who want a flexible and eco-friendly way to
              explore Mallorca.
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
            <li>Affordable e-bike rental in Mallorca</li>
            <li>Fast online booking for tourists</li>
            <li>Comfortable electric bikes for local travel</li>
            <li>Convenient Magaluf-based service</li>
            <li>Modern, eco-friendly, and customer-focused experience</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Book Your Cheap E-Bike Rental in Mallorca
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            If you want an affordable and eco-friendly way to enjoy Mallorca,
            Nexa Rentals is ready to help. Book online, choose your e-bike, and
            explore the island with more comfort and freedom.
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