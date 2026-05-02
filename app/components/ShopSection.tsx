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
    setTyped("");

    const id = window.setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 20);

    return () => window.clearInterval(id);
  }, [inView, t]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.28 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="shop"
      className="relative overflow-hidden bg-[#0f1115] py-[clamp(34px,5vw,82px)] text-white"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[18%] top-[54%] h-[clamp(220px,30vw,460px)] w-[clamp(220px,30vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[clamp(48px,6vw,88px)]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.00) 70%)",
          }}
        />

        <div
          className="absolute right-[-10%] top-[10%] h-[clamp(220px,28vw,440px)] w-[clamp(220px,28vw,440px)] rounded-full opacity-20 blur-[clamp(58px,7vw,100px)]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,122,0,0.20) 0%, rgba(255,122,0,0.00) 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1480px] px-[clamp(14px,2vw,32px)]">
        <div className="shop-grid grid items-center gap-[clamp(18px,4vw,72px)] lg:grid-cols-[minmax(380px,0.95fr)_minmax(440px,1.05fr)]">
          <div
            className={[
              "shop-image-wrap relative mx-auto w-full max-w-[min(620px,92vw)] transition-all duration-700 ease-out lg:max-w-[680px]",
              inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

            <Image
              src="/images/shop.png"
              alt={t("imageAlt")}
              width={1100}
              height={1100}
              className="relative z-10 mx-auto h-auto w-full object-contain drop-shadow-[0_34px_70px_rgba(0,0,0,0.45)]"
              sizes="(max-width: 640px) 86vw, (max-width: 1024px) 92vw, 680px"
              priority={false}
            />
          </div>

          <div
            className={[
              "shop-content mx-auto w-full max-w-[680px] transition-all duration-700 ease-out lg:mx-0",
              inView ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            ].join(" ")}
          >
            <h2 className="reveal-item text-[clamp(25px,3vw,46px)] font-extrabold leading-[0.98] tracking-[-0.045em] text-white">
              {t("titleLine1")}
              <span className="block text-orange-400">{t("titleLine2")}</span>
            </h2>

            <p
              className="shop-typed reveal-item mt-[clamp(10px,1.4vw,20px)] max-w-[620px] text-[clamp(12px,1.05vw,16px)] leading-relaxed"
              style={{ color: THEME.textSoft }}
            >
              {typed || " "}
            </p>

            <div className="shop-info-grid reveal-item mt-[clamp(14px,2vw,28px)] grid gap-[clamp(10px,1.2vw,18px)] sm:grid-cols-2">
              <InfoLine
                title={t("info.pickupLocationTitle")}
                value={t("info.pickupLocationValue")}
                theme={THEME}
              />
              <InfoLine
                title={t("info.openingHoursTitle")}
                value={t("info.openingHoursValue")}
                theme={THEME}
              />
            </div>

            <div
              className="shop-bring-box reveal-item mt-[clamp(14px,2vw,28px)] rounded-[clamp(18px,1.6vw,26px)] p-[clamp(12px,1.45vw,22px)] ring-1 ring-white/10"
              style={{
                background: THEME.surface,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="text-[clamp(13px,1.05vw,16px)] font-semibold text-white">
                {t("bring.title")}
              </div>

              <ul
                className="mt-3 space-y-2.5 text-[clamp(12px,0.95vw,15px)] leading-relaxed"
                style={{ color: THEME.textSoft }}
              >
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <span>{t("bring.item1")}</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <span>{t("bring.item2")}</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <span>{t("bring.item3")}</span>
                </li>
              </ul>
            </div>

            <div className="shop-buttons reveal-item mt-[clamp(16px,2.2vw,32px)] flex flex-wrap gap-3">
              <a
                href="https://maps.app.goo.gl/hkkkK8UhTesYi1qM9"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-[clamp(16px,1.6vw,24px)] py-[clamp(9px,0.9vw,13px)] text-[clamp(12px,0.95vw,15px)] font-extrabold text-black transition hover:brightness-110 active:scale-[0.99]"
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
                className="rounded-xl px-[clamp(16px,1.6vw,24px)] py-[clamp(9px,0.9vw,13px)] text-[clamp(12px,0.95vw,15px)] font-bold text-white ring-1 ring-white/10 transition hover:bg-white/[0.05]"
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

      <style jsx>{`
        @media (max-width: 768px) {
          #shop {
            padding-top: 30px !important;
            padding-bottom: 36px !important;
          }

          .shop-grid {
            gap: 14px !important;
          }

          .shop-image-wrap {
            max-width: 74vw !important;
            margin-top: -8px !important;
            margin-bottom: -10px !important;
          }

          .shop-content {
            max-width: 100% !important;
            text-align: center;
          }

          .shop-typed {
            display: -webkit-box;
            max-width: 100% !important;
            min-height: 42px;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }

          .shop-info-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }

          .shop-bring-box {
            text-align: left;
          }

          .shop-bring-box ul {
            display: grid;
            gap: 8px;
            margin-top: 10px;
            font-size: 11.5px !important;
            line-height: 1.45 !important;
          }

          .shop-buttons {
            justify-content: center;
            gap: 8px !important;
          }

          .shop-buttons a {
            flex: 1;
            min-width: 0;
            text-align: center;
            white-space: nowrap;
          }
        }

        @media (max-width: 390px) {
          .shop-image-wrap {
            max-width: 70vw !important;
          }

          .shop-info-grid {
            grid-template-columns: 1fr !important;
          }

          .shop-buttons {
            flex-direction: column;
          }
        }
      `}</style>
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
  theme: {
    surface: string;
    textSoft: string;
  };
}) {
  return (
    <div
      className="rounded-[clamp(16px,1.5vw,24px)] p-[clamp(11px,1.35vw,20px)] ring-1 ring-white/10"
      style={{
        background: theme.surface,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="text-[clamp(10px,0.82vw,13px)] font-semibold tracking-wide"
        style={{ color: theme.textSoft }}
      >
        {title}
      </div>
      <div className="mt-1 text-[clamp(12px,1vw,16px)] font-semibold text-white">
        {value}
      </div>
    </div>
  );
}