import type { Metadata } from "next";
import Link from "next/link";

const ORANGE = "#FF7A00";

export const metadata: Metadata = {
  title: "Best Scooter Rental Magaluf | Top Rated Scooters by Nexa Rentals",
  description:
    "Looking for the best scooter rental in Magaluf? Nexa Rentals offers premium scooters and e-bikes with fast booking, top-rated service, and modern vehicles for tourists in Mallorca.",
};

export default function BestScooterRentalMagalufPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_28%),linear-gradient(180deg,#070707_0%,#0B0B0B_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-4xl">

            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Top Rated Rental Service in Magaluf
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              Best Scooter Rental <span style={{ color: ORANGE }}>Magaluf</span>
            </h1>

            <p className="mt-6 text-white/75 text-lg leading-8">
              Looking for the best scooter rental in Magaluf? Nexa Rentals offers
              premium scooters and e-bikes with fast online booking, modern vehicles,
              and a smooth experience built for tourists who want the best mobility option
              in Mallorca.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                href="/"
                className="px-6 py-3 rounded-xl text-black font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
                }}
              >
                View Best Scooters
              </Link>

              <Link
                href="/"
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5"
              >
                Book Now
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8">

          <h2 className="text-3xl font-black">Why Nexa Rentals is the Best in Magaluf</h2>

          <p className="mt-6 text-white/75 leading-8">
            When tourists search for the best scooter rental in Magaluf, they are looking
            for reliability, modern vehicles, and a smooth booking experience.
            Nexa Rentals is designed exactly for that.
          </p>

          <p className="mt-5 text-white/75 leading-8">
            Instead of outdated rental shops or slow processes, we offer a modern system
            where you can book online in seconds and get your scooter ready without delays.
          </p>

        </div>
      </section>

      {/* SEO LINKS */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-orange-500/20 p-8">

          <h2 className="text-2xl font-bold">
            Explore More Rental Options in Mallorca
          </h2>

          <div className="mt-6 flex flex-wrap gap-3">

            <Link href="/scooter-rental-magaluf" className="text-orange-400">
              Scooter Rental Magaluf
            </Link>

            <Link href="/cheap-scooter-rental-magaluf" className="text-orange-400">
              Cheap Scooter Rental Magaluf
            </Link>

            <Link href="/best-scooter-rental-mallorca" className="text-orange-400">
              Best Scooter Rental Mallorca
            </Link>

            <Link href="/scooter-rental-mallorca" className="text-orange-400">
              Scooter Rental Mallorca
            </Link>

          </div>
        </div>
      </section>

    </main>
  );
}