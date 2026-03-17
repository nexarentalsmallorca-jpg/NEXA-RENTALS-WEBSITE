"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export default function ShopSection() {
  const t = useTranslations("shopSection");

  const sectionRef = useRef<HTMLElement | null>(null);
  const [typed, setTyped] = useState("");
  const [inView, setInView] = useState(false);

  const THEME = {
    surface: "rgba(255,255,255,0.035)",
    textSoft: "rgba(255,255,255,0.65)",
  };

  const ORANGE = "#FF7A00";

  useEffect(() => {
    if (!inView) return;

    const text = t("typed");

    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 20);

    return () => clearInterval(id);
  }, [inView, t]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="shop" className="relative overflow-hidden py-10 md:py-12 lg:py-16 text-white">
      {/* ✅ Subtle spotlight behind shop image */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[20%] top-[55%] h-[320px] w-[320px] md:h-[380px] md:w-[380px] lg:h-[420px] lg:w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] lg:blur-[80px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.00) 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-10">
          {/* LEFT IMAGE */}
          <div
            className={[
              "transition-all duration-700 ease-out",
              "lg:translate-x-50",
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            ].join(" ")}
          >
            <Image
              src="/images/shop.png"
              alt={t("imageAlt")}
              width={1100}
              height={1100}
              className="h-auto w-[92%] max-w-[520px] mx-auto lg:mx-0 lg:w-full lg:max-w-none lg:scale-700"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className={["lg:col-span-9", "lg:pl-100", inView ? "reveal-on" : "reveal-off"].join(" ")}>
            <h2 className="reveal-item text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {t("titleLine1")}
              <span className="block text-orange-400">{t("titleLine2")}</span>
            </h2>

            <p className="reveal-item mt-3 max-w-lg text-[12px] md:text-[13px] lg:text-sm" style={{ color: THEME.textSoft }}>
              {typed || " "}
            </p>

            <div className="reveal-item mt-5 md:mt-6 grid gap-3 md:gap-4 sm:grid-cols-2">
              <InfoLine title={t("info.pickupLocationTitle")} value={t("info.pickupLocationValue")} theme={THEME} />
              <InfoLine title={t("info.openingHoursTitle")} value={t("info.openingHoursValue")} theme={THEME} />
            </div>

            {/* Glass box */}
            <div
              className="reveal-item mt-5 md:mt-6 rounded-2xl p-3 md:p-4 ring-1 ring-white/10"
              style={{
                background: THEME.surface,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="text-[13px] md:text-sm font-semibold text-white">{t("bring.title")}</div>
              <ul
                className="mt-3 space-y-2 text-[12px] md:text-[13px] lg:text-[13px]"
                style={{ color: THEME.textSoft }}
              >
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  {t("bring.item1")}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  {t("bring.item2")}
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  {t("bring.item3")}
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="reveal-item mt-6 md:mt-7 flex flex-wrap gap-3">
              <a
                href="https://maps.app.goo.gl/hkkkK8UhTesYi1qM9"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-4 md:px-5 py-2.5 text-[13px] md:text-sm font-extrabold text-black transition hover:brightness-110 active:scale-[0.99]"
                style={{
                  background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                  boxShadow: "0 18px 44px rgba(255,122,0,0.18)",
                }}
              >
                {t("buttons.directions")}
              </a>

              <a
                href="https://wa.me/34971482342"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-4 md:px-5 py-2.5 text-[13px] md:text-sm font-bold text-white transition ring-1 ring-white/10 hover:bg-white/[0.05]"
                style={{
                  background: THEME.surface,
                }}
              >
                {t("buttons.whatsapp")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoLine({
  title,
  value,
  theme,
}: {
  title: string;
  value: string;
  theme: any;
}) {
  return (
    <div
      className="rounded-2xl p-3 md:p-4 ring-1 ring-white/10"
      style={{
        background: theme.surface,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div className="text-[11px] md:text-[12px] font-semibold tracking-wide" style={{ color: theme.textSoft }}>
        {title}
      </div>
      <div className="mt-1 text-[13px] md:text-sm font-semibold text-white">{value}</div>
    </div>
  );
}