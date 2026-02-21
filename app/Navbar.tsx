"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

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

function getLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
  if (first && LANGUAGES.some((l) => l.code === first)) return first;
  return "en";
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;

  const hasLocale = LANGUAGES.some((l) => l.code === (parts[0] as Locale));
  const rest = hasLocale ? parts.slice(1) : parts;

  const out = `/${nextLocale}/${rest.join("/")}`;
  return out === `/${nextLocale}/` ? `/${nextLocale}` : out;
}

export default function Navbar() {
  const navRef = useRef<HTMLElement | null>(null);
  const [hidden, setHidden] = useState(false);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Language dropdown
  const [langOpen, setLangOpen] = useState(false);

  const pathname = usePathname() || "/";
  const currentLocale = getLocaleFromPath(pathname);
  const currentLang = LANGUAGES.find((l) => l.code === currentLocale) ?? LANGUAGES[0];

  useEffect(() => {
    // Measure navbar height for content offset
    const setNavOffset = () => {
      if (!navRef.current) return;
      const navHeight = navRef.current.offsetHeight;
      const topGap = 16; // top-4
      document.documentElement.style.setProperty("--nav-offset", `${navHeight + topGap + 12}px`);
    };

    setNavOffset();
    window.addEventListener("resize", setNavOffset);

    // Hide/show on scroll (your original behavior)
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 1);

      if (y > 1) {
        setMobileOpen(false);
        setLangOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("resize", setNavOffset);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close on ESC
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

  // Prevent background scroll when drawer is open (mobile)
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

    const nextPath = replaceLocaleInPath(pathname, nextLocale);
    window.location.href = nextPath; // simple + reliable
  };

  return (
    <>
      <header
        ref={(el) => {
          navRef.current = el;
        }}
        className={[
          "fixed left-0 right-0 z-[9999] top-4",
          "transition-all duration-700 ease-out",
          hidden ? "-translate-y-[160%] opacity-0" : "translate-y-0 opacity-100",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex items-center justify-between">
            {/* ✅ Language selector TOP-LEFT */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 backdrop-blur-sm hover:bg-white/10"
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
                <span className="text-white/60">▾</span>
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

            {/* ✅ Center logo ONLY on mobile */}
            <a
              href="/"
              className="block select-none md:static md:translate-x-0"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Image src="/images/logo.png" alt="NEXA Rentals" width={210} height={70} priority className="h-14 w-auto md:h-26" />
            </a>

            {/* ✅ Desktop nav (UNCHANGED) */}
            <nav className="hidden md:flex items-center gap-10 ml-auto">
              <a className="nav-link" href="/">
                Home
              </a>
              <a className="nav-link" href="/fleet">
                Our Fleet
              </a>
              <a className="nav-link" href="/#blogs">
                Blogs
              </a>
              <a className="nav-link" href="/#contact">
                Contact
              </a>
              <a className="nav-link" href="/#about">
                About NEXA
              </a>
            </nav>

            {/* ✅ Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setMobileOpen((v) => !v);
                setLangOpen(false);
              }}
              className="md:hidden ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
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
        </div>
      </header>

      {/* ✅ MOBILE RIGHT SLIDE DRAWER (ONLY MOBILE CONTENT CHANGED: icons added) */}
      <div className="md:hidden">
        {/* Overlay */}
        <div
          onClick={() => setMobileOpen(false)}
          className={[
            "fixed inset-0 z-[9998] transition-opacity duration-200",
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
          ].join(" ")}
          style={{ background: "rgba(0,0,0,0.55)" }}
        />

        {/* Drawer */}
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
            {/* ✅ Icons from /images folder (home, fleet, blogs, contact, nexa) */}
            <a
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href="/"
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/home.png" alt="Home" width={22} height={22} className="opacity-90" />
              <span>Home</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href="/fleet"
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/fleet.png" alt="Our Fleet" width={22} height={22} className="opacity-90" />
              <span>Our Fleet</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href="/#blogs"
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/blogs.png" alt="Blogs" width={22} height={22} className="opacity-90" />
              <span>Blogs</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href="/#contact"
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/contact.png" alt="Contact" width={22} height={22} className="opacity-90" />
              <span>Contact</span>
            </a>

            <a
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition"
              href="/#about"
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/nexa.png" alt="About NEXA" width={22} height={22} className="opacity-90" />
              <span>About NEXA</span>
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}