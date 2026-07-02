"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function NexaFooter() {
  const year = new Date().getFullYear();
  const t = useTranslations("footer");
  const locale = useLocale();

  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* MAIN FOOTER */}
        <div className="grid gap-12 py-12 md:grid-cols-[1.1fr_1fr_1fr] md:items-start lg:py-14">
          {/* LEFT — LOGO + INFO */}
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center">
              <img
                src="/images/reallogo.png"
                alt="NEXA Rentals"
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="mt-6 space-y-2 text-sm leading-6 text-white/70">
              <p className="font-semibold text-white">{t("pickup")}</p>
              <p>{t("address")}</p>
              <p>{t("hours")}</p>

              <p className="pt-2">
                <a
                  href="tel:+34971482342"
                  className="text-white/70 transition hover:text-white"
                >
                  +34 971 482 342
                </a>
              </p>

              <p>
                <a
                  href="mailto:info@nexarentals.es"
                  className="text-white/70 transition hover:text-white"
                >
                  info@nexarentals.es
                </a>
              </p>
            </div>
          </div>

          {/* MIDDLE — EMAIL */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {t("getUpdates")}
            </p>

            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
              {t("dealsText")}
            </p>

            <form
              className="mt-5 flex w-full max-w-md overflow-hidden rounded-full border border-white/15 bg-white/[0.04]"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={t("yourEmail")}
                className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/35"
              />

              <button
                type="submit"
                className="m-1 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85"
              >
                {t("join")}
              </button>
            </form>

            <p className="mt-3 text-xs text-white/40">{t("noSpam")}</p>
          </div>

          {/* RIGHT — SOCIALS */}
          <div className="md:justify-self-end md:text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {t("follow")}
            </p>

            <div className="mt-5 flex gap-3 md:justify-end">
              <SocialIcon label="Instagram" href="#" icon="instagram" />
              <SocialIcon label="Pinterest" href="#" icon="pinterest" />
              <SocialIcon label="TikTok" href="#" icon="tiktok" />
              <SocialIcon label="Facebook" href="#" icon="facebook" />
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/45">
              © {year} NEXA Rentals. {t("allRightsReserved")}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45 md:justify-end">
              <Link
                href={`/${locale}/terms-and-conditions`}
                className="transition hover:text-white"
              >
                {t("terms")}
              </Link>

              <Link
                href={`/${locale}/privacy-policy`}
                className="transition hover:text-white"
              >
                {t("privacy")}
              </Link>

              <Link
                href={`/${locale}/deposit-policy`}
                className="transition hover:text-white"
              >
                {t("depositPolicy")}
              </Link>

              <Link
                href={`/${locale}/refund-policy`}
                className="transition hover:text-white"
              >
                {t("refundPolicy")}
              </Link>

              <Link
                href={`/${locale}/cookies`}
                className="transition hover:text-white"
              >
                {t("cookies")}
              </Link>

              <Link
                href={`/${locale}/about-nexa`}
                className="transition hover:text-white"
              >
                {t("aboutNexa")}
              </Link>

              <Link
                href={`/${locale}/blog`}
                className="transition hover:text-white"
              >
                {t("blog")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

type SocialIconProps = {
  label: string;
  href: string;
  icon: "instagram" | "pinterest" | "tiktok" | "facebook";
};

function SocialIcon({ label, href, icon }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="group grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.03] text-white/70 transition hover:border-white/35 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"
    >
      {getIcon(icon)}
      <span className="sr-only">{label}</span>
    </a>
  );
}

function getIcon(name: SocialIconProps["icon"]) {
  const common = "h-[18px] w-[18px]";
  const base = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "instagram":
      return (
        <svg className={common} viewBox="0 0 24 24" {...base}>
          <rect x="6" y="6" width="12" height="12" rx="3.25" />
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="16.2" cy="7.8" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );

    case "pinterest":
      return (
        <svg className={common} viewBox="0 0 24 24" {...base}>
          <path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 3.95 2.55 7.31 6.1 8.5" />
          <path d="M10.6 19.6l1.25-5.25" />
          <path d="M11.85 14.35c.55.35 1.2.55 1.95.55 2.35 0 4.2-1.85 4.2-4.25 0-2.85-2.15-4.65-5.15-4.65-3.4 0-5.75 2.25-5.75 5.25 0 1.35.5 2.45 1.55 3.05" />
        </svg>
      );

    case "tiktok":
      return (
        <svg className={common} viewBox="0 0 24 24" {...base}>
          <path d="M14 4v10.1a3.9 3.9 0 1 1-3.4-3.87" />
          <path d="M14 7.2c1.1 1.7 2.9 2.8 5 3V7.1c-1.9-.1-3.6-1-5-2.6" />
        </svg>
      );

    case "facebook":
      return (
        <svg className={common} viewBox="0 0 24 24" {...base}>
          <path d="M14 9h3V6h-3c-2.2 0-4 1.3-4 4v3H7v3h3v6h3v-6h3l1-3h-4v-3c0-.85.25-1 1-1Z" />
        </svg>
      );

    default:
      return null;
  }
}