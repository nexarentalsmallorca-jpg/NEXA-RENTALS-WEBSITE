import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Best Scooter Rental Mallorca | Premium Service by Nexa Rentals",
  description:
    "Looking for the best scooter rental in Mallorca? Nexa Rentals offers premium 125cc scooters and e-bikes in Magaluf with fast online booking, modern vehicles, and a smooth tourist-friendly experience.",
};

export default function BestScooterRentalMallorcaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Premium Scooter Experience in Mallorca
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Best Scooter Rental <span style={{ color: ORANGE }}>Mallorca</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Looking for the best scooter rental in Mallorca? Nexa Rentals offers
              premium 125cc scooters and modern e-bikes in Magaluf with fast online
              booking, tourist-friendly service, and a smooth rental experience
              built for comfort, freedom, and convenience.
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
                View Premium Fleet
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
            <h2 className="text-xl font-bold">Premium Vehicles</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Our scooters and e-bikes are selected to deliver comfort, style,
              practicality, and a better overall rental experience in Mallorca.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Fast Online Booking</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Nexa Rentals makes booking simple, modern, and quick for tourists
              who want to reserve their vehicle without hassle.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-bold">Tourist-Friendly Experience</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">
              We focus on convenience, clarity, and a smooth process from booking
              to pickup so visitors can enjoy Mallorca more easily.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 md:p-10">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            Why Nexa Rentals Is One of the Best Scooter Rental Options in Mallorca
          </h2>

          <p className="mt-5 text-base leading-8 text-white/75">
            Choosing the best scooter rental in Mallorca means looking for more
            than just a vehicle. Tourists want an experience that feels reliable,
            professional, and easy from start to finish. Nexa Rentals was built
            around exactly that idea: premium mobility with a modern and
            customer-focused service.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Our scooters are ideal for beach trips, scenic routes, sightseeing,
            and moving around tourist areas with more speed and flexibility. With
            fast online booking and a Magaluf-based service, Nexa Rentals helps
            visitors enjoy Mallorca with less waiting and more freedom.
          </p>

          <p className="mt-5 text-base leading-8 text-white/75">
            Whether you want a practical 125cc scooter or a comfortable e-bike,
            Nexa Rentals combines quality vehicles, easy booking, and a premium
            brand experience designed for modern travelers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">Best Scooter Rental in Magaluf</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Nexa Rentals is based in Magaluf, making it easy for tourists to
              rent a premium scooter quickly and start exploring Mallorca with
              convenience and confidence.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-2xl font-bold">125cc Scooters and E-Bikes</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Our fleet includes practical 125cc scooters and modern e-bikes for
              tourists who want comfort, style, and flexibility while discovering
              Mallorca.
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
            Book With One of the Best Scooter Rental Brands in Mallorca
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            If you want a premium and tourist-friendly scooter rental experience
            in Mallorca, Nexa Rentals is ready to help. Choose your vehicle, book
            online, and enjoy the island with freedom, style, and convenience.
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