"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Navbar from "./Navbar";
import FeaturedFleet from "./FeaturedFleet";
import ShopSection from "./components/ShopSection";
import BookingBar from "./components/BookingBar";

type Locale = "en" | "es" | "de" | "fr" | "sv" | "it" | "pt";

function getOrangeWords(locale: Locale) {
  const map: Record<Locale, string[]> = {
    en: ["Scooter", "e-Bike", "Mallorca"],
    es: ["Moto", "Bici-Electrica", "Mallorca"],
    de: ["Scooter", "Elektrische","fiets", "Mallorca"],
    fr: ["Scooter", "Vélo", "électrique", "Majorque"],
    sv: ["Scooter", "Elcykel", "Mallorca"],
    it: ["Scooter", "Bicicletta","elettrica", "Maiorca"],
    pt: ["Scooter", "Bicicleta","elétrica", "Maiorca"],
  };
  return map[locale] ?? map.en;
}

function renderStyledHeading(text: string, orangeWords: string[]) {
  const parts = text.split(/(\s+)/);

  return parts.map((p, i) => {
    const clean = p.replace(/[^\w-À-ÿ]/g, "");
    return (
      <span key={i} className={orangeWords.includes(clean) ? "text-orange-500" : ""}>
        {p}
      </span>
    );
  });
}

function normalizeHeroTitle(raw: string, locale: Locale) {
  if (!raw) return "";

  let s = raw;

  s = s.replace(/\\n/g, "\n");
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/\n\s*\n+/g, "\n");

  if (!s.includes("\n") && locale === "en") {
    s = s.replace(/\s+in\s+Mallorca$/i, "\nin Mallorca");
  }

  return s.trimEnd();
}

export default function HomeClient() {
  const locale = (useLocale() as Locale) || "en";

  // ✅ pull translations directly from messages
  const tHero = useTranslations("hero");

  const heroTitle = tHero("title");
  const heroSubtitle = tHero("subtitle");

  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  const THEME = {
    bg: "#0f1115",
    bg2: "#0c0e12",
    surface: "rgba(255,255,255,0.035)",
    borderSoft: "rgba(255,255,255,0.08)",
    textSoft: "rgba(255,255,255,0.65)",
    textDim: "rgba(255,255,255,0.50)",
  };

  const fullText = useMemo(() => normalizeHeroTitle(heroTitle, locale), [heroTitle, locale]);

  useEffect(() => {
    let i = 0;
    setTyped("");
    setTypingDone(false);

    const id = window.setInterval(() => {
      i += 1;
      setTyped(fullText.slice(0, i));

      if (i >= fullText.length) {
        window.clearInterval(id);
        setTypingDone(true);
      }
    }, 26);

    return () => window.clearInterval(id);
  }, [fullText]);

  const typedLines = useMemo(() => typed.split(/\r?\n/), [typed]);

  const [introOn, setIntroOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setIntroOn(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const orangeWords = useMemo(() => getOrangeWords(locale), [locale]);

  return (
    <div className="relative min-h-screen overflow-hidden text-white" style={{ background: THEME.bg }}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 520px at 50% 0%, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 62%), linear-gradient(180deg, #0f1115 0%, #0f1115 45%, #0c0e12 100%)",
          }}
        />

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

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.00), rgba(0,0,0,0.38) 70%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.11] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />
      </div>

      <main className="relative min-h-[100svh] overflow-hidden">
        <Navbar />

        <div
          className="hero-bg-image"
          style={{
            filter: "brightness(1.25) contrast(1.0)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-[calc(var(--nav-offset)-18px)] pb-10 sm:pb-12 lg:pb-14">
          <section className="grid min-h-[calc(100svh-var(--nav-offset))] items-center gap-8 sm:gap-10 lg:gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6 flex flex-col min-h-[calc(100svh-var(--nav-offset))]">
              <div
                className={[
                  "transition-all duration-700 ease-out",
                  "mt-0 sm:mt-0",
                  introOn ? "opacity-100 translate-y-[-120px] " : "opacity-0 translate-y-4",
                ].join(" ")}
              >
                <h1 className="font-serif text-[32px] leading-[1.10] sm:text-[46px] md:text-[60px] lg:text-[56px] lg:leading-[1.05]">
                  {typedLines
                    .filter((l) => l.trim().length > 0)
                    .map((line, idx, arr) => (
                      <div key={idx} className="whitespace-pre-wrap">
                        {renderStyledHeading(line, orangeWords)}
                        {!typingDone && idx === arr.length - 1 ? <span className="type-caret" /> : null}
                      </div>
                    ))}
                </h1>

                <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                  <span className="h-[2px] w-10 sm:w-14 rounded-full bg-gradient-to-r from-orange-500 to-yellow-300 opacity-90" />
                  <p className="text-[11px] sm:text-[14px] font-medium tracking-[0.20em] uppercase text-white/75">
                    {heroSubtitle}
                  </p>
                </div>
              </div>

              <div
                className={[
                  "mt-auto w-full max-w-[560px]",
                  "transition-all duration-700 ease-out delay-150",
                  introOn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                ].join(" ")}
              >
                <div className="scale-[0.88] origin-top translate-y-[-170px] md:scale-100 md:translate-y-[-250px] md:origin-center">
                  <BookingBar />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6" />
          </section>
        </div>
      </main>

      <section className="relative pt-8 sm:pt-10 pb-12 sm:pb-14">
        <div className="mx-auto max-w-7xl px-4">
          <FeaturedFleet />
        </div>
      </section>

      <ShopSection />

      <style jsx global>{`
        .hero-bg-image {
          position: absolute;
          inset: 0;
          z-index: 1;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: right bottom;
        }

        @media (max-width: 640px) {
          .hero-bg-image {
            background-image: url("/images/heromobile-bg.png");
            background-position: center bottom;
          }
        }
      `}</style>
    </div>
  );
}