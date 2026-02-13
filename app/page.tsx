"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import BookingPanel from "./components/DesktopBookingBar";
import TrustSection from "./components/TrustSection";
import ShopSection from "./components/ShopSection";

function renderStyledHeading(text: string) {
  const ORANGE = ["Scooter", "e-Bike", "Mallorca"];
  const parts = text.split(/(\s+)/);

  return parts.map((p, i) => {
    const clean = p.replace(/[^\w-]/g, "");
    return (
      <span key={i} className={ORANGE.includes(clean) ? "text-orange-500" : ""}>
        {p}
      </span>
    );
  });
}

export default function Page() {
  const fullText = "Rent A Scooter & e-Bike\nin Mallorca";
  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

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
  }, []);

  const typedLines = useMemo(() => typed.split("\n"), [typed]);

  const [introOn, setIntroOn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setIntroOn(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
    <main className="relative min-h-[100svh] bg-black text-white overflow-hidden">
      <Navbar />

      {/* One single PNG background image */}
      <div className="hero-bg-image" />

      {/* IMPORTANT:
          - Hero starts at top of viewport
          - Only content is pushed down using --nav-offset
      */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-8 pt-[calc(var(--nav-offset)-18px)] pb-14">
        <section className="grid min-h-[calc(100svh-var(--nav-offset))] items-center gap-12 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-6">
            <div
              className={[
                "transition-all duration-700 ease-out",
                introOn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              ].join(" ")}
            >
              <h1 className="font-serif text-[56px] leading-[1.05] md:text-[60px]">
                <div className="whitespace-pre-wrap">
                  {typedLines[0] ? renderStyledHeading(typedLines[0]) : null}
                  {!typingDone && typedLines.length === 1 ? (
                    <span className="type-caret" />
                  ) : null}
                </div>

                <div className="whitespace-pre-wrap">
                  {typedLines[1] ? renderStyledHeading(typedLines[1]) : null}
                  {!typingDone && typedLines.length >= 2 ? (
                    <span className="type-caret" />
                  ) : null}
                </div>
              </h1>

              <div className="mt-6 flex items-center gap-4">
                <span className="h-[2px] w-14 rounded-full bg-gradient-to-r from-orange-500 to-yellow-300 opacity-90" />
                <p className="text-[14px] font-medium tracking-[0.20em] uppercase text-white/75">
                  Rent online in 60 seconds
                </p>
              </div>
            </div>

            {/* Booking panel */}
            <div
              className={[
                "mt-10 max-w-[560px]",
                "transition-all duration-700 ease-out delay-150",
                introOn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              ].join(" ")}
            >
              <BookingPanel />
            </div>
          </div>

          {/* RIGHT EMPTY (bikes are in background image) */}
          <div className="lg:col-span-6" />
        </section>
      </div>
    </main>
    <ShopSection />

</>
  );
}




