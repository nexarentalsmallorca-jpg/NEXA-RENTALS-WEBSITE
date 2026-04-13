"use client";

import Navbar from "./Navbar";
import FeaturedFleet from "./FeaturedFleet";
import ShopSection from "./components/ShopSection";
import BookingBar from "./components/BookingBar";
import Link from "next/link";

export default function HomeClientV2() {
  const THEME = {
    bg: "#0f1115",
    bg2: "#0c0e12",
    surface: "rgba(255,255,255,0.035)",
    borderSoft: "rgba(255,255,255,0.08)",
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white" style={{ background: THEME.bg }}>
      <main className="relative overflow-hidden">
        <Navbar />

        <section className="relative pb-10 pt-0 lg:pb-14">
          <div className="mx-auto w-full max-w-[1920px]">
            <div
              className="relative overflow-hidden border-y border-black/10 shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
              style={{
                background:
                  "linear-gradient(180deg, #d8d8d8 0%, #dcdcdc 46%, #efefef 46%, #f2f2f2 100%)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url('/images/herobg2.png')",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(232,232,232,0.90) 0%, rgba(232,232,232,0.84) 20%, rgba(232,232,232,0.52) 42%, rgba(232,232,232,0.12) 62%, rgba(232,232,232,0.06) 100%)",
                }}
              />

              <div className="relative z-10 mx-auto w-full max-w-[1700px] px-4 sm:px-6 lg:px-8 2xl:px-12">
                <div className="grid min-h-[760px] grid-cols-1 lg:min-h-[calc(100vh-88px)] lg:grid-cols-12 xl:min-h-[860px] 2xl:min-h-[920px]">
                  <div className="px-5 pb-8 pt-10 sm:px-8 lg:col-span-4 lg:flex lg:flex-col lg:justify-center lg:px-10 lg:pb-14 lg:pt-8 xl:px-14 2xl:px-20">
                    <h1 className="text-[34px] font-black uppercase leading-[0.92] tracking-[-0.04em] text-[#111111] sm:text-[46px] lg:text-[56px] xl:text-[68px] 2xl:text-[78px]">
                      PIAGGIO
                      <br />
                      LIBERTY 125
                    </h1>

                    <div className="mt-6 flex items-start gap-4 sm:gap-5">
                      <div className="relative w-[118px] rounded-[26px] border-2 border-[#ff5a2a] bg-white px-3 pb-3 pt-6 shadow-sm">
                        <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff3b30] to-[#ff9b3d] px-3 py-[3px] text-[10px] font-extrabold uppercase tracking-[0.04em] text-black">
                          Most Popular
                        </div>

                        <div className="text-center">
                          <div className="text-[20px] font-black leading-none text-[#ff3b30] line-through decoration-[2px]">
                            45€
                          </div>
                          <div className="mt-1 text-[31px] font-black leading-none text-[#ff7a00]">
                            39€
                          </div>
                          <div className="mt-1 text-[15px] font-semibold leading-none text-[#222]">
                            Half Day
                          </div>
                        </div>
                      </div>

                      <div className="w-[108px] rounded-[24px] bg-white px-3 pb-3 pt-5 shadow-sm ring-1 ring-black/6">
                        <div className="text-center">
                          <div className="text-[20px] font-black leading-none text-[#ff3b30] line-through decoration-[2px]">
                            55€
                          </div>
                          <div className="mt-1 text-[31px] font-black leading-none text-black">
                            49€
                          </div>
                          <div className="mt-1 text-[15px] font-semibold leading-none text-[#222]">
                            Full Day
                          </div>
                        </div>
                      </div>
                    </div>

                    <ul className="mt-8 list-disc space-y-[5px] pl-5 text-[15px] leading-[1.35] text-[#222] marker:text-black sm:text-[16px] lg:text-[16px] xl:text-[18px] 2xl:text-[20px]">
                      <li>125cc automatic scooter</li>
                      <li>Smooth &amp; easy to ride</li>
                      <li>Perfect for city &amp; coastal rides</li>
                      <li>2 helmets included free</li>
                      <li>Free phone holder for navigation</li>
                      <li>Free security lock included</li>
                      <li>Comfortable &amp; fuel efficient</li>
                      <li>Ideal for exploring Mallorca</li>
                    </ul>
                  </div>

                  <div className="relative flex items-end justify-center px-0 pb-0 pt-0 lg:col-span-5">
                    <div className="relative flex h-full w-full items-end justify-center">
                      <img
                        src="/images/piaggio.png"
                        alt="Piaggio Liberty 125"
                        className="relative z-10 h-auto w-full object-contain drop-shadow-[0_30px_38px_rgba(0,0,0,0.24)] 
                        max-w-[720px] sm:max-w-[820px] lg:max-w-[980px] xl:max-w-[1120px] 2xl:max-w-[1240px]"
                        style={{
                          transform: "translateY(72px)",
                          transformOrigin: "bottom center",
                        }}
                      />

                      <div
                        className="pointer-events-none absolute z-0 rounded-[999px] bg-black/14 blur-[24px]"
                        style={{
                          width: "72%",
                          height: "56px",
                          left: "50%",
                          bottom: "22px",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="px-5 pb-10 pt-4 sm:px-8 lg:col-span-3 lg:flex lg:items-center lg:justify-end lg:px-4 lg:pb-14 lg:pt-8 xl:px-6 xl:pr-10 2xl:pr-16">
                    <div className="w-full max-w-[320px] rounded-[18px] bg-white p-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/6 xl:scale-[1.03] 2xl:scale-[1.08]">
                      <BookingBar />
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 hidden items-center justify-between px-8 lg:flex xl:px-12 2xl:px-16">
                  <button
                    type="button"
                    className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[34px] font-light leading-none text-black shadow-sm transition hover:bg-white"
                    aria-label="Previous scooter"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[34px] font-light leading-none text-black shadow-sm transition hover:bg-white"
                    aria-label="Next scooter"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="relative pt-8 pb-12 sm:pt-10 sm:pb-14">
        <div className="mx-auto max-w-7xl px-4">
          <FeaturedFleet />
        </div>
      </section>

      <ShopSection />

      <section className="relative pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-[28px] border p-5 backdrop-blur-sm sm:p-7 lg:p-8"
            style={{
              background: THEME.surface,
              borderColor: THEME.borderSoft,
            }}
          >
            <h2 className="font-playfair text-[24px] leading-tight text-white sm:text-[30px]">
              Scooter Rental Mallorca for Tourists
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/75 sm:text-[16px]">
              Looking for the best scooter rental in Magaluf, Mallorca?{" "}
              <Link href="/scooter-rental-magaluf" className="font-semibold text-orange-500">
                Nexa Rentals scooter rental service
              </Link>{" "}
              offers premium scooters and e-bikes for tourists who want freedom, comfort, and a smooth booking experience
              while exploring the island.
            </p>

            <h2 className="mt-8 font-playfair text-[22px] leading-tight text-white sm:text-[28px]">
              Scooter Rental in Magaluf
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/75 sm:text-[16px]">
              Our scooter rental service in Magaluf is designed for visitors who want a simple, stylish, and reliable way
              to move around Mallorca. With online booking and premium vehicles, Nexa Rentals makes it easy to enjoy the
              island without delays.
            </p>

            <h2 className="mt-8 font-playfair text-[22px] leading-tight text-white sm:text-[28px]">
              E-Bike Rental Mallorca
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/75 sm:text-[16px]">
              Discover beaches, scenic coastal roads, and local areas with our{" "}
              <Link href="/ebike-rental-mallorca" className="font-semibold text-orange-500">
                e-bike rental in Mallorca
              </Link>
              . Nexa Rentals offers a flexible and modern way for tourists to enjoy the island with more convenience.
            </p>

            <h2 className="mt-8 font-playfair text-[22px] leading-tight text-white sm:text-[28px]">
              Why Choose Nexa Rentals
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-white/75 sm:text-[16px]">
              Nexa Rentals combines premium scooters, e-bikes, simple online booking, tourist-friendly service, and a
              modern rental experience built for Mallorca. Whether you want scooter rental in Magaluf or a flexible way to
              explore the island, Nexa Rentals is designed to give you a smooth and reliable experience.
            </p>

            <p className="mt-6 text-[15px] leading-7 text-white/75 sm:text-[16px]">
              If you&apos;re staying in Magaluf and want a fast and flexible way to move around, check our{" "}
              <Link href="/scooter-rental-mallorca" className="font-semibold text-orange-500">
                scooter rental Mallorca service
              </Link>{" "}
              designed for tourists who want comfort, freedom, and a premium experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/scooter-rental-mallorca"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Scooter Rental Mallorca
              </Link>

              <Link
                href="/cheap-scooter-rental-mallorca"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Cheap Scooter Rental Mallorca
              </Link>

              <Link
                href="/scooter-rental-magaluf"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Scooter Rental Magaluf
              </Link>

              <Link
                href="/cheap-scooter-rental-magaluf"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Cheap Scooter Rental Magaluf
              </Link>

              <Link
                href="/rent-scooter-mallorca-125cc"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Rent 125cc Scooter Mallorca
              </Link>

              <Link
                href="/best-scooter-rental-mallorca"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Best Scooter Rental Mallorca
              </Link>

              <Link
                href="/ebike-rental-mallorca"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                E-Bike Rental Mallorca
              </Link>

              <Link
                href="/ebike-rental-mallorca-cheap"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-500/40 hover:text-orange-400"
              >
                Cheap E-Bike Rental Mallorca
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}