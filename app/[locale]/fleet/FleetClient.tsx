"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import Navbar from "../../Navbar";

const ORANGE = "#FF7A00";

export default function FleetClient() {
  const locale = useLocale();

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{ background: "#0f1115" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 560px at 50% -10%, rgba(255,122,0,0.12) 0%, rgba(255,122,0,0) 62%), radial-gradient(760px 520px at 85% 15%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #0f1115 0%, #0d1014 50%, #090a0d 100%)",
          }}
        />

        <div
          className="absolute left-1/2 top-[-240px] h-[620px] w-[620px] -translate-x-1/2 rounded-full blur-[120px] opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(255,122,0,0.28) 0%, rgba(255,122,0,0) 72%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.10] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <Navbar />

      <section className="relative mx-auto flex min-h-[calc(100vh-var(--total-nav-space,130px))] w-full max-w-6xl items-center justify-center px-4 pb-20 pt-8 md:px-6">
        <div
          className="relative w-full overflow-hidden rounded-[34px] border p-6 text-center shadow-[0_28px_100px_rgba(0,0,0,0.42)] md:p-10 lg:p-12"
          style={{
            borderColor: "rgba(255,255,255,0.10)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
          }}
        >
          <div
            className="pointer-events-none absolute right-[-130px] top-[-130px] h-[300px] w-[300px] rounded-full blur-[100px] opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(255,122,0,0.35) 0%, rgba(255,122,0,0) 70%)",
            }}
          />

          <div
            className="pointer-events-none absolute left-[-120px] bottom-[-140px] h-[320px] w-[320px] rounded-full blur-[110px] opacity-20"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 72%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] md:text-xs"
              style={{
                borderColor: "rgba(255,122,0,0.28)",
                background: "rgba(255,122,0,0.10)",
                color: "#FFB074",
              }}
            >
              <span className="h-2 w-2 rounded-full bg-[#FF7A00] shadow-[0_0_18px_rgba(255,122,0,0.95)]" />
              Page under maintenance
            </div>

            <h1 className="text-[38px] font-black leading-[0.95] tracking-[-0.05em] md:text-6xl lg:text-7xl">
              This page is currently
              <span style={{ color: ORANGE }}> under design</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
              We are temporarily improving this section of the NEXA Rentals
              website. The page will be available again soon with a better,
              cleaner and more premium experience.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/${locale}`}
                className="rounded-2xl px-6 py-4 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.99]"
                style={{
                  background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.86) 100%)`,
                  boxShadow: "0 18px 44px rgba(255,122,0,0.18)",
                }}
              >
                Back to Home
              </Link>

              <a
                href="https://wa.me/34971482342"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border px-6 py-4 text-sm font-black text-white transition hover:bg-white/[0.06] active:scale-[0.99]"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.045)",
                }}
              >
                Contact on WhatsApp
              </a>
            </div>

            <div
              className="mx-auto mt-8 rounded-2xl border px-4 py-3 text-sm font-semibold leading-6 text-white/58"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.035)",
              }}
            >
              Online booking from the home page remains safe and active.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}