import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Rent 125cc Scooter Mallorca | Nexa Rentals Magaluf",
  description:
    "Rent a 125cc scooter in Mallorca with Nexa Rentals. Perfect for tourists, easy to ride, fast online booking, and premium scooters in Magaluf.",
};

export default function RentScooter125Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      
      {/* HERO */}
      <section className="relative border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Rent <span style={{ color: ORANGE }}>125cc Scooter</span> in Mallorca
          </h1>

          <p className="mt-6 max-w-3xl text-white/75 text-lg leading-8">
            Looking to rent a 125cc scooter in Mallorca? Nexa Rentals offers
            modern, easy-to-ride scooters perfect for tourists exploring the
            island. Fast booking, premium vehicles, and smooth riding experience.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link
              href="/vehicles"
              className="px-6 py-3 rounded-xl font-bold text-black"
              style={{
                background: `linear-gradient(135deg, ${ORANGE}, #ff9a3d)`,
              }}
            >
              View 125cc Scooters
            </Link>

            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-white/20"
            >
              Start Booking
            </Link>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-3xl border border-white/10 p-8 bg-white/[0.04]">
          
          <h2 className="text-3xl font-black">
            Why Choose a 125cc Scooter in Mallorca
          </h2>

          <p className="mt-5 text-white/75 leading-8">
            A 125cc scooter is the perfect choice for tourists visiting Mallorca.
            It offers enough power for city roads, coastal routes, and longer rides
            while remaining easy to handle and comfortable for everyday use.
          </p>

          <p className="mt-5 text-white/75 leading-8">
            Whether you're staying in Magaluf or exploring the island, renting a
            scooter gives you total freedom without relying on taxis or public
            transport.
          </p>

        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.04]">
            <h3 className="font-bold text-xl">Easy to Ride</h3>
            <p className="mt-3 text-white/70">
              125cc scooters are automatic and beginner-friendly, perfect for
              tourists with basic riding experience.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.04]">
            <h3 className="font-bold text-xl">Perfect for Mallorca</h3>
            <p className="mt-3 text-white/70">
              Ideal for beaches, city roads, and scenic routes across Mallorca.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.04]">
            <h3 className="font-bold text-xl">Affordable & Efficient</h3>
            <p className="mt-3 text-white/70">
              Save money on transport while enjoying maximum flexibility.
            </p>
          </div>

        </div>
      </section>

      {/* LOCATION */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-white/10 p-8 bg-white/[0.04]">
          
          <h2 className="text-3xl font-black">
            Rent 125cc Scooter in Magaluf
          </h2>

          <p className="mt-5 text-white/75 leading-8">
            Nexa Rentals is located in Magaluf, making it easy for tourists to
            rent a scooter quickly and start exploring immediately. Our service
            is designed for convenience, speed, and premium experience.
          </p>

        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-3xl border border-orange-500/20 p-8 bg-gradient-to-br from-orange-500/10 to-black">
          
          <h2 className="text-3xl font-black">
            Book Your 125cc Scooter Today
          </h2>

          <p className="mt-4 text-white/75">
            Choose your scooter, book online, and enjoy Mallorca with total freedom.
          </p>

          <div className="mt-6 flex gap-4 flex-wrap">
            <Link
              href="/vehicles"
              className="px-6 py-3 rounded-xl font-bold text-black"
              style={{
                background: `linear-gradient(135deg, ${ORANGE}, #ff9a3d)`,
              }}
            >
              See Available Scooters
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}