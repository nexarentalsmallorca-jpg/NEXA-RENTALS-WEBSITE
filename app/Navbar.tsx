"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type Locale = "en" | "es" | "de" | "fr" | "sv" | "it" | "pt";

const LANGUAGES: { code: Locale; label: string; flagSrc: string; short: string }[] = [
  { code: "en", label: "English", flagSrc: "/images/en.png", short: "EN" },
  { code: "es", label: "Español", flagSrc: "/images/es.png", short: "ES" },
  { code: "de", label: "Deutsch", flagSrc: "/images/de.png", short: "DE" },
  { code: "fr", label: "Français", flagSrc: "/images/fr.png", short: "FR" },
  { code: "sv", label: "Svenska", flagSrc: "/images/sv.png", short: "SV" },
  { code: "it", label: "Italiano", flagSrc: "/images/it.png", short: "IT" },
  { code: "pt", label: "Português", flagSrc: "/images/pt.png", short: "PT" },
];

function safeGetLocaleFromPath(pathname: string): Locale {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "home") return "en";
  const first = parts[0] as Locale | undefined;
  if (first && LANGUAGES.some((l) => l.code === first)) return first;
  return "en";
}

function replaceLocaleInPath(pathname: string, currentLocale: Locale, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);

  if (parts[0] === "home") {
    const rest = parts.slice(1);
    const out = `/${nextLocale}/${rest.join("/")}`;
    return out === `/${nextLocale}/` ? `/${nextLocale}` : out;
  }

  if (parts.length === 0) return `/${nextLocale}`;

  const hasLocale = LANGUAGES.some((l) => l.code === (parts[0] as Locale));
  const rest = hasLocale ? parts.slice(1) : parts;

  const out = `/${nextLocale}/${rest.join("/")}`;
  return out === `/${nextLocale}/` ? `/${nextLocale}` : out;
}

export default function Navbar() {
  const t = useTranslations("nav");

  const navRef = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLocale: Locale = safeGetLocaleFromPath(pathname);

  const currentLang = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0];

  const homeHref = `/${currentLocale}`;
  const fleetHref = `/${currentLocale}/fleet`;
  const blogsHref = `/${currentLocale}/#blogs`;
  const contactHref = `/${currentLocale}/#contact`;
  const aboutHref = `/${currentLocale}/#about`;

  useEffect(() => {
    const setNavHeight = () => {
      if (!navRef.current) return;
      document.documentElement.style.setProperty("--nav-height", `${navRef.current.offsetHeight}px`);
    };

    setNavHeight();
    window.addEventListener("resize", setNavHeight);

    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 1);

      // Close overlays when scrolling
      if (y > 1) {
        setMobileOpen(false);
        setLangOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("resize", setNavHeight);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const onSelectLocale = (nextLocale: Locale) => {
    setLangOpen(false);
    setMobileOpen(false);

    const nextPath = replaceLocaleInPath(pathname, currentLocale, nextLocale);
    const qs = searchParams?.toString() || "";
    const finalPath = qs ? `${nextPath}?${qs}` : nextPath;

    router.push(finalPath);

    // ✅ Force Next.js to re-render translations
    setTimeout(() => {
      router.refresh();
    }, 50);
  };

  return (
    <>
      {/* FIXED NAVBAR (NO BACKGROUND) */}
      <header
        ref={(el) => {
          navRef.current = el;
        }}
        className={[
          "fixed left-0 right-0 top-0 z-[9999]",
          "transition-transform duration-500 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        {/* No bg, no border — just spacing */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* MOBILE: grid 3 columns: left language, middle logo, right hamburger */}
          {/* DESKTOP: flex: logo left, nav right, language far right */}
          <div className="py-0 md:py 8">
            {/* MOBILE ROW */}
            <div className="grid grid-cols-3 items-center md:hidden">
              {/* LEFT: Language */}
              <div className="relative justify-self-start">
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 backdrop-blur-sm hover:bg-white/10"
                  aria-expanded={langOpen}
                  aria-label="Select language"
                >
                  <Image
                    src={currentLang.flagSrc}
                    alt={currentLang.label}
                    width={18}
                    height={18}
                    className="rounded-full"
                  />
                  <span className="uppercase tracking-[0.18em] text-white/90">{currentLang.short}</span>
                  <span className="text-white/70">▾</span>
                </button>

                {/* Dropdown */}
                <div
                  className={[
                    "absolute left-0 mt-2 w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]/90 backdrop-blur-xl",
                    "transition-all duration-200",
                    langOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-2 pointer-events-none",
                  ].join(" ")}
                >
                  <div className="p-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => onSelectLocale(l.code)}
                        className={[
                          "w-full rounded-xl px-3 py-2 transition flex items-center justify-between",
                          l.code === currentLocale ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
                        ].join(" ")}
                      >
                        <span className="flex items-center gap-3">
                          <Image src={l.flagSrc} alt={l.label} width={22} height={22} className="rounded-full" />
                          <span className="text-sm">{l.label}</span>
                        </span>

                        <span className="text-xs uppercase tracking-[0.18em] text-white/60">{l.short}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MIDDLE: Logo */}
              <a href={homeHref} className="justify-self-center select-none">
                <Image
                  src="/images/logo.png"
                  alt="NEXA Rentals"
                  width={112}
                  height={112}
                  priority
                  className="h-32 w-32 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                />
              </a>

              {/* RIGHT: Hamburger */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => {
                  setMobileOpen((v) => !v);
                  setLangOpen(false);
                }}
                className="justify-self-end inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <span className="sr-only">Menu</span>
                <div className="relative h-5 w-5">
                  <span
                    className={[
                      "absolute left-0 top-[2px] block h-[2px] w-5 bg-white/90 transition-all duration-200",
                      mobileOpen ? "top-[9px] rotate-45" : "rotate-0",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-[9px] block h-[2px] w-5 bg-white/90 transition-all duration-200",
                      mobileOpen ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-[16px] block h-[2px] w-5 bg-white/90 transition-all duration-200",
                      mobileOpen ? "top-[9px] -rotate-45" : "rotate-0",
                    ].join(" ")}
                  />
                </div>
              </button>
            </div>

            {/* DESKTOP ROW */}
            <div className="hidden md:flex items-center">
              {/* LEFT: Logo */}
              <a href={homeHref} className="select-none flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="NEXA Rentals"
                  width={112}
                  height={112}
                  priority
                  className="h-40 w-40 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                />
              </a>

              {/* RIGHT SIDE: Nav links then language at far right */}
              <div className="ml-auto flex items-center gap-10">
                <nav className="flex items-center gap-10">
                  <a className="nav-link" href={homeHref}>
                    {t("home")}
                  </a>
                  <a className="nav-link" href={fleetHref}>
                    {t("fleet")}
                  </a>
                  <a className="nav-link" href={blogsHref}>
                    {t("blogs")}
                  </a>
                  <a className="nav-link" href={aboutHref}>
                    {t("about")}
                  </a>

                  {/* CONTACT as minimal luxury CTA (last) */}
                  <a className="nav-link nav-cta" href={contactHref}>
  CONTACT US
</a>
                </nav>

                {/* FAR RIGHT: Language dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLangOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#1b1f27]/75 px-3 py-2 text-xs text-white/90 backdrop-blur-sm hover:bg-[#232a35]/80 hover:border-white/20"
                    aria-expanded={langOpen}
                    aria-label="Select language"
                  >
                    <Image
                      src={currentLang.flagSrc}
                      alt={currentLang.label}
                      width={18}
                      height={18}
                      className="rounded-full"
                    />
                    <span className="uppercase tracking-[0.18em] text-white/90">{currentLang.short}</span>
                    <span className="text-white/70">▾</span>
                  </button>

                  <div
                    className={[
                      "absolute right-0 mt-2 w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]/90 backdrop-blur-xl",
                      "transition-all duration-200",
                      langOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-2 pointer-events-none",
                    ].join(" ")}
                  >
                    <div className="p-2">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => onSelectLocale(l.code)}
                          className={[
                            "w-full rounded-xl px-3 py-2 transition flex items-center justify-between",
                            l.code === currentLocale ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-3">
                            <Image src={l.flagSrc} alt={l.label} width={22} height={22} className="rounded-full" />
                            <span className="text-sm">{l.label}</span>
                          </span>

                          <span className="text-xs uppercase tracking-[0.18em] text-white/60">{l.short}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Global layout fix: pushes ALL pages below fixed navbar */}
      <div aria-hidden className="h-[var(--nav-height)]" />

      {/* MOBILE DRAWER (unchanged) */}
      <div className="md:hidden">
        <div
          onClick={() => setMobileOpen(false)}
          className={[
            "fixed inset-0 z-[9998] transition-opacity duration-200",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          ].join(" ")}
          style={{ background: "rgba(0,0,0,0.55)" }}
        />

        <aside
          className={[
            "fixed top-0 right-0 z-[9999] h-[100svh] w-[78vw] max-w-[320px]",
            "border-l border-white/10 bg-[#0f1115]/88 backdrop-blur-xl",
            "transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          aria-hidden={!mobileOpen}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
            <span className="text-sm tracking-[0.22em] uppercase text-white/70">Menu</span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-white/90 text-xl leading-none">×</span>
            </button>
          </div>

          <nav className="px-5 py-4">
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href={homeHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/home.png" alt="Home" width={22} height={22} className="opacity-90" />
              <span>{t("home")}</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href={fleetHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/fleet.png" alt="Our Fleet" width={22} height={22} className="opacity-90" />
              <span>{t("fleet")}</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href={blogsHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/blogs.png" alt="Blogs" width={22} height={22} className="opacity-90" />
              <span>{t("blogs")}</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href={contactHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/contact.png" alt="Contact" width={22} height={22} className="opacity-90" />
              <span>{t("contact")}</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href={aboutHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/nexa.png" alt="About NEXA" width={22} height={22} className="opacity-90" />
              <span>{t("about")}</span>
            </a>
          </nav>
        </aside>
      </div>

      {/* ULTRA LUXURY NAV LINK FONT + HOVER/CLICK (DESKTOP NAV ONLY) */}
      <style jsx global>{`
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 10px 2px;
          font-family: "Cinzel", "Playfair Display", "Cormorant Garamond", "Didot", "Bodoni MT", serif;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.94);
          transition: transform 220ms ease, color 220ms ease, text-shadow 220ms ease, opacity 220ms ease,
            filter 220ms ease, background-color 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          will-change: transform;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-link::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 1px;
          width: 0%;
          height: 2px;
          transform: translateX(-50%);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0),
            rgba(255, 163, 41, 1),
            rgba(255, 255, 255, 0)
          );
          opacity: 0;
          filter: drop-shadow(0 0 10px rgba(255, 163, 41, 0.55));
          transition: width 260ms ease, opacity 260ms ease;
        }

        .nav-link:hover {
          color: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
          text-shadow: 0 0 22px rgba(255, 163, 41, 0.32), 0 0 10px rgba(255, 255, 255, 0.12);
          filter: brightness(1.08);
        }

        .nav-link:hover::after {
          width: 125%;
          opacity: 1;
        }

        .nav-link:active {
          transform: translateY(0px) scale(0.965);
          text-shadow: 0 0 14px rgba(255, 163, 41, 0.26);
          filter: brightness(1.02);
        }

        .nav-link:focus-visible {
          outline: none;
          text-shadow: 0 0 22px rgba(255, 163, 41, 0.34), 0 0 10px rgba(255, 255, 255, 0.14);
        }

        .nav-link:focus-visible::after {
          width: 125%;
          opacity: 1;
        }

        /* PREMIUM GREY LUXURY CTA */
.nav-cta {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);

  /* premium gradient grey */
  background: linear-gradient(
    180deg,
    rgba(60, 64, 72, 0.85) 0%,
    rgba(38, 41, 48, 0.9) 55%,
    rgba(22, 24, 29, 0.95) 100%
  );

  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 0.16em;

  backdrop-filter: blur(10px);

  box-shadow:
    0 10px 26px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.6);

  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* remove underline glow */
.nav-cta::after {
  display: none;
}

.nav-cta:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 163, 41, 0.45);

  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.45),
    0 0 22px rgba(255, 163, 41, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  color: #fff;
}

.nav-cta:active {
  transform: translateY(0px) scale(0.985);
}

.nav-cta:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px rgba(255, 163, 41, 0.25),
    0 14px 34px rgba(0, 0, 0, 0.35);
}

        /* keep underline effect off for the CTA (cleaner / more premium) */
        .nav-cta::after {
          display: none;
        }

        .nav-cta:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 163, 41, 0.62);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.22), 0 0 26px rgba(255, 163, 41, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          text-shadow: 0 0 18px rgba(255, 163, 41, 0.18), 0 0 10px rgba(0, 0, 0, 0.35);
          filter: none;
        }

        .nav-cta:active {
          transform: translateY(0px) scale(0.985);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        }

        .nav-cta:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 163, 41, 0.24), 0 14px 34px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        }
      `}</style>
    </>
  );
}