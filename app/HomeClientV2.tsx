"use client";

import Navbar from "./Navbar";
import FeaturedFleet from "./FeaturedFleet";
import ShopSection from "./components/ShopSection";
import BookingBar from "./components/BookingBar";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

export default function HomeClientV2() {
  const THEME = {
    bg: "#0f1115",
    surface: "rgba(255,255,255,0.035)",
    borderSoft: "rgba(255,255,255,0.08)",
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white" style={{ background: THEME.bg }}>
      <main className="relative overflow-hidden">
        <Navbar />

        <section className="relative -mt-2 pb-10 pt-0 lg:-mt-4 lg:pb-14">
          <div className="mx-auto w-full max-w-[1920px]">
            <div className="relative overflow-hidden border-y border-black/10 shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
              <div className="absolute inset-0">
                <img
                  src="/images/herobg2.jpg"
                  alt=""
                  className="h-full w-full select-none object-cover"
                  style={{ objectPosition: "center bottom" }}
                  draggable={false}
                />
              </div>

              <div className="relative z-10 mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 2xl:px-10">
                <div className="min-h-[720px] py-8 xl:min-h-[760px] 2xl:min-h-[820px]">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between">
                    {/* LEFT CONTENT */}
                    <div className="w-full lg:w-[360px] xl:w-[400px] 2xl:w-[430px] lg:shrink-0 lg:pt-4">
                      <h1
                        className={`${poppins.className} whitespace-nowrap text-[34px] font-black uppercase leading-none tracking-[-0.04em] text-[#111111] sm:text-[42px] lg:text-[44px] xl:text-[50px]`}
                      >
                        PIAGGIO LIBERTY 125
                      </h1>

                      <div className="mt-10 flex items-start gap-4">
                        <div className="relative w-[128px] rounded-[24px] border-2 border-[#ff5a2a] bg-white px-3 pb-3 pt-6 shadow-sm sm:w-[140px] xl:w-[150px]">
                          <div className="absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff3b30] to-[#ff9b3d] px-2.5 py-[3px] text-[9px] font-extrabold uppercase tracking-[0.04em] text-black">
                            Most Popular
                          </div>

                          <div className="text-center">
                            <div className="text-[24px] font-black leading-none text-[#ff3b30] line-through decoration-[2px]">
                              45€
                            </div>
                            <div className="mt-1 text-[40px] font-black leading-none text-[#ff7a00]">
                              39€
                            </div>
                            <div className="mt-1 text-[14px] font-semibold leading-none text-[#222]">
                              Half Day
                            </div>
                          </div>
                        </div>

                        <div className="w-[122px] rounded-[22px] bg-white px-3 pb-3 pt-5 shadow-sm ring-1 ring-black/6 sm:w-[132px] xl:w-[140px]">
                          <div className="text-center">
                            <div className="text-[24px] font-black leading-none text-[#ff3b30] line-through decoration-[2px]">
                              55€
                            </div>
                            <div className="mt-1 text-[40px] font-black leading-none text-black">
                              49€
                            </div>
                            <div className="mt-1 text-[14px] font-semibold leading-none text-[#222]">
                              Full Day
                            </div>
                          </div>
                        </div>
                      </div>

                      <ul className="mt-8 list-disc space-y-[4px] pl-5 text-[15px] leading-[1.3] text-[#222] marker:text-black sm:text-[16px] lg:text-[15px] xl:text-[16px]">
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

                    {/* CENTER IMAGE */}
                    <div className="relative flex min-h-[420px] flex-1 items-end justify-center lg:min-h-[620px] xl:min-h-[680px] 2xl:min-h-[740px]">
                      <div className="relative flex h-full w-full items-end justify-center overflow-visible">
                        <img
                          src="/images/piaggio.png"
                          alt="Piaggio Liberty 125"
                          className="relative z-10 h-auto w-full object-contain drop-shadow-[0_34px_42px_rgba(0,0,0,0.24)] max-w-[620px] sm:max-w-[720px] lg:max-w-[820px] xl:max-w-[920px] 2xl:max-w-[1040px]"
                          style={{
                            transform: "translateY(18px) scale(1.18)",
                            transformOrigin: "bottom center",
                          }}
                        />

                        <div
                          className="pointer-events-none absolute z-0 rounded-[999px] bg-black/14 blur-[24px]"
                          style={{
                            width: "66%",
                            height: "56px",
                            left: "50%",
                            bottom: "26px",
                            transform: "translateX(-50%)",
                          }}
                        />
                      </div>
                    </div>

                    {/* RIGHT BOOKING CARD */}
                    <div className="w-full lg:flex lg:w-[410px] lg:min-w-[410px] lg:shrink-0 lg:items-center lg:justify-end xl:w-[430px] xl:min-w-[430px] 2xl:w-[450px] 2xl:min-w-[450px]">
                      <div className="ml-auto w-full max-w-[430px]">
                        <BookingBar />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-20 hidden items-center justify-between px-8 lg:flex xl:px-10 2xl:px-14">
                  <button
                    type="button"
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[34px] font-light leading-none text-black shadow-sm transition hover:bg-white"
                    aria-label="Previous scooter"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[34px] font-light leading-none text-black shadow-sm transition hover:bg-white"
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

      <section className="relative pb-12 pt-8 sm:pb-14 sm:pt-10">
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