"use client";

import React from "react";
// If you're using Next.js Image, uncomment next line and use <Image />
// import Image from "next/image";

export default function NexaFooter() {
  const year = new Date().getFullYear();

  // ✅ Luxury graphite theme
  const THEME = {
    bg: "#0f1115",
    bg2: "#0c0e12",
    surface: "rgba(255,255,255,0.035)",
    borderSoft: "rgba(255,255,255,0.08)",
    textSoft: "rgba(255,255,255,0.65)",
    textDim: "rgba(255,255,255,0.50)",
  };

  const ORANGE = "#FF7A00";

  return (
    <footer className="relative overflow-hidden text-white" style={{ background: THEME.bg }}>
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* graphite wash */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 520px at 50% 0%, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 62%), linear-gradient(180deg, #0f1115 0%, #0f1115 45%, #0c0e12 100%)",
          }}
        />

        {/* warm halos */}
        <div
          className="absolute -top-44 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[110px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(255,122,0,0.18) 0%, rgba(255,122,0,0) 70%)",
          }}
        />
        <div
          className="absolute -bottom-44 right-[-140px] h-[520px] w-[520px] rounded-full blur-[120px] opacity-16"
          style={{
            background: "radial-gradient(circle, rgba(255,180,116,0.14) 0%, rgba(255,180,116,0) 72%)",
          }}
        />

        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.00), rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* subtle grain */}
        <div
          className="absolute inset-0 opacity-[0.11] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* MAIN ROW */}
        <div className="grid gap-8 py-10 md:grid-cols-3 md:items-center">
          {/* LEFT: Logo + Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Replace with your logo image path */}
              <img src="./images/logo.png" alt="NEXA Rentals" className="h-10 w-auto" />
            </div>

            <div className="space-y-1 text-sm" style={{ color: THEME.textSoft }}>
              <p className="font-medium text-white/85">Magaluf Pickup</p>
              <p>Carrer Galeón 13, Mallorca</p>
              <p>Daily · 10:00 – 22:00</p>
              <p>
                <a className="transition hover:text-white" href="tel:+34XXXXXXXXX">
                  +34 XXX XXX XXX
                </a>{" "}
                ·{" "}
                <a className="transition hover:text-white" href="mailto:info@nexarentals.com">
                  info@nexarentals.com
                </a>
              </p>
            </div>
          </div>

          {/* MIDDLE: Subscribe */}
          <div className="md:text-center">
            <p className="text-sm font-semibold tracking-wide">Get Updates</p>
            <p className="mt-1 text-sm" style={{ color: THEME.textSoft }}>
              Deals, discounts &amp; seasonal offers.
            </p>

            <form className="mt-4 flex w-full max-w-md gap-2 md:mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none transition focus:ring-orange-500/40"
                style={{
                  background: THEME.surface,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              />
              <button
                type="submit"
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                style={{
                  background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                  boxShadow: "0 18px 44px rgba(255,122,0,0.18)",
                }}
              >
                Join
              </button>
            </form>

            <p className="mt-3 text-xs" style={{ color: THEME.textDim }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* RIGHT: Social Icons */}
          <div className="md:justify-self-end">
            <p className="text-sm font-semibold tracking-wide md:text-right">Follow</p>

            <div className="mt-4 flex gap-3 md:justify-end">
              <SocialIcon label="Instagram" href="#" icon="instagram" />
              <SocialIcon label="WhatsApp" href="#" icon="whatsapp" />
              <SocialIcon label="Pinterest" href="#" icon="pinterest" />
              <SocialIcon label="TikTok" href="#" icon="tiktok" />
              <SocialIcon label="Facebook" href="#" icon="facebook" />
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div
          className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between"
          style={{ borderTop: `1px solid ${THEME.borderSoft}` }}
        >
          <p className="text-xs" style={{ color: THEME.textDim }}>
            © {year} NEXA Rentals. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:justify-end" style={{ color: THEME.textDim }}>
            <a href="/terms" className="transition hover:text-white">
              Terms &amp; Conditions
            </a>
            <a href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="/deposit-policy" className="transition hover:text-white">
              Deposit Policy
            </a>
            <a href="/refunds" className="transition hover:text-white">
              Refund Policy
            </a>
            <a href="/cookies" className="transition hover:text-white">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

type SocialIconProps = {
  label: string;
  href: string;
  icon: "instagram" | "whatsapp" | "pinterest" | "tiktok" | "facebook";
};

function SocialIcon({ label, href, icon }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="group grid h-10 w-10 place-items-center rounded-2xl ring-1 ring-white/10 transition
                 bg-white/[0.035] hover:bg-white/[0.05] hover:shadow-[0_16px_40px_rgba(255,122,0,0.10)]
                 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <span className="transition group-hover:brightness-110" style={{ color: "rgba(255,180,116,0.95)" }}>
        {getIcon(icon)}
      </span>
      <span className="sr-only">{label}</span>
    </a>
  );
}

function getIcon(name: SocialIconProps["icon"]) {
  const common = "h-5 w-5";
  switch (name) {
    case "instagram":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 11.5a8.5 8.5 0 0 1-12.7 7.4L4 20l1.2-3.1A8.5 8.5 0 1 1 20 11.5Z" />
          <path d="M9.5 9.5c1.5 3 3 4 5 5" />
        </svg>
      );
    case "pinterest":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 3.6 2.12 6.7 5.18 8.1" />
          <path d="M9.6 19.6l1.2-5.1" />
          <path d="M10.5 10.8c.3-1.4 1.6-2.4 3.1-2.4 1.9 0 3.2 1.3 3.2 3.1 0 2.1-1.2 3.8-3.5 3.8-.7 0-1.4-.3-1.8-.8" />
        </svg>
      );
    case "tiktok":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 8c1.2 1.8 2.9 2.8 5 3v3c-2 0-3.7-.6-5-1.6V16a5 5 0 1 1-5-5" />
          <path d="M14 3v10" />
        </svg>
      );
    case "facebook":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 9h3V6h-3c-2 0-4 1-4 4v3H7v3h3v5h3v-5h3l1-3h-4v-3c0-1 .3-1 1-1Z" />
        </svg>
      );
    default:
      return null;
  }
}
