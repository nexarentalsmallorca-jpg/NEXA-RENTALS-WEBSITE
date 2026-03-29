import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Scooter Rental Magaluf | Premium Scooter Hire by Nexa Rentals",
  description:
    "Looking for scooter rental in Magaluf? Nexa Rentals offers premium 125cc scooters and e-bikes with fast online booking and a smooth rental experience for tourists in Mallorca.",
};

export default function ScooterRentalMagalufPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Premium Mobility in Magaluf
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Scooter Rental <span style={{ color: ORANGE }}>Magaluf</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for scooter rental in Magaluf? Nexa Rentals offers premium
              scooters and e-bikes with fast online booking, tourist-friendly
              service, and a smooth rental experience designed for visitors who
              want to explore Mallorca with more freedom and less hassle.
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
            <h2 className="text-xl font-bold">Fast Booking in Magaluf</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Reserve your scooter rental in Magaluf quickly with a simple and
              premium online booking experience.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">125cc Scooters & E-Bikes</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Choose from practical 125cc scooters and comfortable e-bikes for
              exploring Magaluf and the rest of Mallorca.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Tourist-Friendly Service</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Nexa Rentals is built for tourists who want a modern, reliable,
              and easy rental experience in Magaluf.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Premium Scooter Hire in Magaluf
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Magaluf is one of the most convenient places in Mallorca to rent a
            scooter. Visitors staying near the beach, hotels, restaurants, and
            nightlife areas often want a faster and more flexible way to move
            around. Nexa Rentals offers premium scooter hire in Magaluf so you
            can enjoy Mallorca with more convenience and independence.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Instead of relying on taxis or waiting for transport, renting a
            scooter in Magaluf gives you the freedom to reach beaches, scenic
            viewpoints, nearby towns, and local attractions on your own time.
            Our service is designed for tourists who want a modern and smooth
            rental experience from booking to pickup.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Whether you are visiting Mallorca for a holiday, a weekend, or a
            longer stay, Nexa Rentals makes it easier to explore with stylish
            vehicles, fast online booking, and a premium customer experience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">125cc Scooter Rental Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Our 125cc scooter rental Magaluf options are ideal for visitors
              who want a comfortable, practical, and reliable way to travel
              around the area and explore Mallorca with flexibility.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Explore Mallorca from Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Starting in Magaluf makes it easy to enjoy more of the island.
              With a scooter or e-bike from Nexa Rentals, you can move beyond
              the hotel area and discover beaches, roads, and destinations at
              your own pace.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="rounded-[30px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(255,255,255,0.03),rgba(0,0,0,0.2))] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Why Choose <span style={{ color: ORANGE }}>Nexa Rentals</span> in Magaluf
          </h2>

          <ul className="mt-6 space-y-4 text-white/80">
            <li>Premium scooter rental service in Magaluf</li>
            <li>Fast online booking for tourists</li>
            <li>125cc scooters and e-bikes available</li>
            <li>Convenient base for exploring Mallorca</li>
            <li>Reliable, modern, and customer-focused experience</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black md:text-4xl">
            Book Your Scooter Rental in Magaluf Today
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            Nexa Rentals is ready to help you enjoy a smooth and premium scooter
            rental experience in Magaluf. Book online, choose your vehicle, and
            explore Mallorca with more freedom and convenience.
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