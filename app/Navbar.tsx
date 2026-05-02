"use client";

import Link from "next/link";
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

function replaceLocaleInPath(
  pathname: string,
  currentLocale: Locale,
  nextLocale: Locale
): string {
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
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();

  const detectedLocale: Locale = safeGetLocaleFromPath(pathname);
  const currentLocale: Locale = "en";
  const currentLang = LANGUAGES[0];

  const homeHref = `/${currentLocale}`;
  const fleetHref = `/${currentLocale}/fleet`;
  const blogsHref = `/${currentLocale}/#blogs`;
  const contactHref = `/${currentLocale}/contact`;
  const aboutHref = `/${currentLocale}/about`;

  function notifyLanguageMaintenance() {
    window.dispatchEvent(
      new CustomEvent("nexa:language-maintenance", {
        detail: {
          title: "Languages under maintenance",
          text:
            "Other languages are temporarily unavailable while we finish the website update. You can still use the website in English.",
        },
      })
    );
  }

  function toggleLanguageDropdown() {
    setLangOpen((current) => {
      const next = !current;

      if (next) {
        window.setTimeout(() => {
          notifyLanguageMaintenance();
        }, 80);
      }

      return next;
    });
  }

  useEffect(() => {
    const setNavHeight = () => {
      const navHeight = navRef.current?.offsetHeight || 0;
      const announcementHeight = announcementRef.current?.offsetHeight || 34;

      document.documentElement.style.setProperty("--nav-height", `${navHeight}px`);
      document.documentElement.style.setProperty("--announcement-height", `${announcementHeight}px`);
      document.documentElement.style.setProperty("--total-nav-space", `${navHeight + announcementHeight}px`);
    };

    setNavHeight();

    const resizeObserver = new ResizeObserver(setNavHeight);

    if (navRef.current) resizeObserver.observe(navRef.current);
    if (announcementRef.current) resizeObserver.observe(announcementRef.current);

    window.addEventListener("resize", setNavHeight);

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
      resizeObserver.disconnect();
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
    if (nextLocale !== "en") {
      notifyLanguageMaintenance();
      return;
    }

    setLangOpen(false);
    setMobileOpen(false);

    const nextPath = replaceLocaleInPath(pathname, detectedLocale, "en");
    const qs = searchParams?.toString() || "";
    const finalPath = qs ? `${nextPath}?${qs}` : nextPath;

    router.push(finalPath);

    setTimeout(() => {
      router.refresh();
    }, 50);
  };

  return (
    <>
      <div ref={announcementRef} className="fixed inset-x-0 top-0 z-[10000]">
        <div className="announcement-bar overflow-hidden border-b border-black/20 bg-gradient-to-r from-[#ff6a00] via-[#ff8a18] to-[#ff6a00] shadow-[0_8px_24px_rgba(255,106,0,0.22)]">
          <div className="relative flex min-h-[34px] items-center md:min-h-[42px]">
            <div className="announcement-track flex whitespace-nowrap">
              <div className="announcement-content flex items-center">
                <span className="announcement-pill">Website update in progress</span>
                <span className="announcement-text">
                  Online booking is safe and active — we are improving the website, so you may notice small visual changes or temporary display errors.
                </span>
                <span className="announcement-dot">•</span>
                <span className="announcement-strong">Your reservation is secure with Nexa Rentals</span>
                <span className="announcement-dot">•</span>
                <span className="announcement-text">Need help? Contact us anytime.</span>
                <span className="announcement-gap" />
              </div>

              <div className="announcement-content flex items-center" aria-hidden="true">
                <span className="announcement-pill">Website update in progress</span>
                <span className="announcement-text">
                  Online booking is safe and active — we are improving the website, so you may notice small visual changes or temporary display errors.
                </span>
                <span className="announcement-dot">•</span>
                <span className="announcement-strong">Your reservation is secure with Nexa Rentals</span>
                <span className="announcement-dot">•</span>
                <span className="announcement-text">Need help? Contact us anytime.</span>
                <span className="announcement-gap" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <header
        ref={(el) => {
          navRef.current = el;
        }}
        className={[
          "fixed left-0 right-0 top-[var(--announcement-height,34px)] z-[9999]",
          "transition-transform duration-500 ease-out",
          hidden ? "-translate-y-[180%]" : "translate-y-0",
        ].join(" ")}
      >
        <div className="border-b border-white/8 bg-[#0f1115]/94 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-[1480px] px-[clamp(12px,2vw,32px)]">
            <div className="py-[4px] md:py-[clamp(4px,0.55vw,8px)]">
              <div className="grid grid-cols-3 items-center md:hidden">
                <div className="relative justify-self-start">
                  <button
                    type="button"
                    onClick={toggleLanguageDropdown}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] font-black text-white/90 backdrop-blur-sm hover:bg-white/10"
                    aria-expanded={langOpen}
                    aria-label="Select language"
                  >
                    <Image
                      src={currentLang.flagSrc}
                      alt={currentLang.label}
                      width={17}
                      height={17}
                      className="rounded-full"
                    />
                    <span className="uppercase tracking-[0.14em]">{currentLang.short}</span>
                    <span className="text-white/60">▾</span>
                  </button>

                  <div
                    className={[
                      "absolute left-0 mt-2 w-[245px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]/96 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl",
                      "transition-all duration-200",
                      langOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-2 pointer-events-none",
                    ].join(" ")}
                  >
                    <div className="border-b border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                      English available now
                    </div>

                    <div className="p-2">
                      {LANGUAGES.map((l) => {
                        const disabled = l.code !== "en";

                        return (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => onSelectLocale(l.code)}
                            className={[
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 transition",
                              disabled
                                ? "cursor-not-allowed text-white/38 hover:bg-orange-500/10"
                                : "bg-white/10 text-white hover:bg-white/15",
                            ].join(" ")}
                          >
                            <span className="flex items-center gap-3">
                              <Image src={l.flagSrc} alt={l.label} width={22} height={22} className="rounded-full" />
                              <span className="text-sm">{l.label}</span>
                            </span>

                            <span
                              className={[
                                "text-[10px] uppercase tracking-[0.14em]",
                                disabled ? "text-orange-300/70" : "text-white/70",
                              ].join(" ")}
                            >
                              {disabled ? "Soon" : "Live"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Link href={homeHref} className="justify-self-center select-none">
                  <Image
                    src="/images/reallogo.png"
                    alt="NEXA Rentals"
                    width={300}
                    height={100}
                    className="h-[52px] w-auto object-contain sm:h-[58px]"
                    priority
                  />
                </Link>

                <button
                  type="button"
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileOpen}
                  onClick={() => {
                    setMobileOpen((v) => !v);
                    setLangOpen(false);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
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

              <div className="hidden items-center md:flex">
                <Link href={homeHref} className="flex shrink-0 select-none items-center">
                  <Image
                    src="/images/reallogo.png"
                    alt="NEXA Rentals"
                    width={300}
                    height={100}
                    className="h-[clamp(62px,5.4vw,82px)] w-auto object-contain"
                    priority
                  />
                </Link>

                <div className="ml-auto flex min-w-0 items-center gap-[clamp(14px,2vw,40px)]">
                  <nav className="flex min-w-0 items-center gap-[clamp(16px,2.4vw,40px)]">
                    <Link className="nav-link" href={homeHref}>
                      {t("home")}
                    </Link>

                    <Link className="nav-link" href={fleetHref}>
                      {t("fleet")}
                    </Link>

                    <Link className="nav-link" href={blogsHref}>
                      {t("blogs")}
                    </Link>

                    <Link className="nav-link" href={aboutHref}>
                      {t("about")}
                    </Link>

                    <Link className="nav-link nav-cta" href={contactHref}>
                      CONTACT US
                    </Link>
                  </nav>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={toggleLanguageDropdown}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#1b1f27]/75 px-3 py-2 text-xs text-white/90 backdrop-blur-sm hover:border-white/20 hover:bg-[#232a35]/80"
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
                        "absolute right-0 mt-2 w-[250px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]/95 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl",
                        "transition-all duration-200",
                        langOpen
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 -translate-y-2 pointer-events-none",
                      ].join(" ")}
                    >
                      <div className="border-b border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                        English available now
                      </div>

                      <div className="p-2">
                        {LANGUAGES.map((l) => {
                          const disabled = l.code !== "en";

                          return (
                            <button
                              key={l.code}
                              type="button"
                              onClick={() => onSelectLocale(l.code)}
                              className={[
                                "flex w-full items-center justify-between rounded-xl px-3 py-2 transition",
                                disabled
                                  ? "cursor-not-allowed text-white/38 hover:bg-orange-500/10"
                                  : "bg-white/10 text-white hover:bg-white/15",
                              ].join(" ")}
                            >
                              <span className="flex items-center gap-3">
                                <Image src={l.flagSrc} alt={l.label} width={22} height={22} className="rounded-full" />
                                <span className="text-sm">{l.label}</span>
                              </span>

                              <span
                                className={[
                                  "text-[10px] uppercase tracking-[0.14em]",
                                  disabled ? "text-orange-300/70" : "text-white/70",
                                ].join(" ")}
                              >
                                {disabled ? "Soon" : "Live"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        aria-hidden
        className="h-[calc(var(--total-nav-space,92px)+2px)] md:h-[calc(var(--total-nav-space,130px)+10px)]"
      />

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
            "fixed right-0 top-0 z-[9999] h-[100svh] w-[78vw] max-w-[320px]",
            "border-l border-white/10 bg-[#0f1115]/92 backdrop-blur-xl",
            "transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          aria-hidden={!mobileOpen}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-5">
            <span className="text-sm uppercase tracking-[0.22em] text-white/70">Menu</span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-xl leading-none text-white/90">×</span>
            </button>
          </div>

          <nav className="px-5 py-4">
            <Link
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={homeHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/home.png" alt="Home" width={22} height={22} className="opacity-90" />
              <span>{t("home")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={fleetHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/fleet.png" alt="Our Fleet" width={22} height={22} className="opacity-90" />
              <span>{t("fleet")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={blogsHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/blogs.png" alt="Blogs" width={22} height={22} className="opacity-90" />
              <span>{t("blogs")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={contactHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/contact.png" alt="Contact" width={22} height={22} className="opacity-90" />
              <span>{t("contact")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={aboutHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image src="/images/nexa.png" alt="About NEXA" width={22} height={22} className="opacity-90" />
              <span>{t("about")}</span>
            </Link>
          </nav>
        </aside>
      </div>

      <style jsx global>{`
        .announcement-bar {
          position: relative;
        }

        .announcement-bar::before,
        .announcement-bar::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: clamp(28px, 5vw, 80px);
          z-index: 2;
          pointer-events: none;
        }

        .announcement-bar::before {
          left: 0;
          background: linear-gradient(90deg, rgba(255, 106, 0, 1), rgba(255, 106, 0, 0));
        }

        .announcement-bar::after {
          right: 0;
          background: linear-gradient(270deg, rgba(255, 106, 0, 1), rgba(255, 106, 0, 0));
        }

        .announcement-track {
          width: max-content;
          animation: nexaAnnouncementMove 32s linear infinite;
          will-change: transform;
        }

        .announcement-bar:hover .announcement-track {
          animation-play-state: paused;
        }

        .announcement-content {
          flex-shrink: 0;
          min-height: 34px;
          padding-left: clamp(12px, 1.8vw, 24px);
          padding-right: clamp(12px, 1.8vw, 24px);
        }

        .announcement-pill {
          margin-right: 14px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: rgba(0, 0, 0, 0.88);
          padding: 4px 10px;
          color: #ffffff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        }

        .announcement-text {
          color: rgba(0, 0, 0, 0.86);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .announcement-strong {
          color: #ffffff;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          text-shadow: 0 1px 10px rgba(0, 0, 0, 0.22);
        }

        .announcement-dot {
          margin-left: 12px;
          margin-right: 12px;
          color: rgba(0, 0, 0, 0.42);
          font-size: 16px;
          font-weight: 900;
        }

        .announcement-gap {
          display: inline-block;
          width: 70px;
        }

        @keyframes nexaAnnouncementMove {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        @media (min-width: 768px) {
          .announcement-content {
            min-height: 42px;
          }

          .announcement-pill {
            margin-right: 18px;
            padding: 5px 12px;
            font-size: 10px;
            letter-spacing: 0.14em;
          }

          .announcement-text {
            font-size: 12px;
            letter-spacing: 0.08em;
          }

          .announcement-strong {
            font-size: 12px;
            letter-spacing: 0.1em;
          }

          .announcement-dot {
            margin-left: 14px;
            margin-right: 14px;
            font-size: 18px;
          }

          .announcement-gap {
            width: 90px;
          }
        }

        @media (max-width: 640px) {
          .announcement-track {
            animation-duration: 23s;
          }
        }

        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 0px 3px;
          font-family: "Cinzel", "Playfair Display", "Cormorant Garamond", "Didot", "Bodoni MT", serif;
          font-size: clamp(12px, 0.9vw, 15px);
          font-weight: 600;
          letter-spacing: clamp(0.07em, 0.5vw, 0.12em);
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.94);
          transition:
            transform 220ms ease,
            color 220ms ease,
            text-shadow 220ms ease,
            opacity 220ms ease,
            filter 220ms ease,
            background-color 220ms ease,
            box-shadow 220ms ease,
            border-color 220ms ease;
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
          transition:
            width 260ms ease,
            opacity 260ms ease;
        }

        .nav-link:hover {
          color: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
          text-shadow:
            0 0 22px rgba(255, 163, 41, 0.32),
            0 0 10px rgba(255, 255, 255, 0.12);
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
          text-shadow:
            0 0 22px rgba(255, 163, 41, 0.34),
            0 0 10px rgba(255, 255, 255, 0.14);
        }

        .nav-link:focus-visible::after {
          width: 125%;
          opacity: 1;
        }

        .nav-cta {
          padding: clamp(8px, 0.72vw, 10px) clamp(13px, 1.3vw, 18px);
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: linear-gradient(
            180deg,
            rgba(60, 64, 72, 0.85) 0%,
            rgba(38, 41, 48, 0.9) 55%,
            rgba(22, 24, 29, 0.95) 100%
          );
          color: rgba(255, 255, 255, 0.96);
          letter-spacing: clamp(0.08em, 0.58vw, 0.16em);
          backdrop-filter: blur(10px);
          box-shadow:
            0 10px 26px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 0 rgba(0, 0, 0, 0.6);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .nav-cta::after {
          display: none;
        }

        .nav-cta:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 163, 41, 0.62);
          box-shadow:
            0 14px 34px rgba(0, 0, 0, 0.22),
            0 0 26px rgba(255, 163, 41, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
          text-shadow:
            0 0 18px rgba(255, 163, 41, 0.18),
            0 0 10px rgba(0, 0, 0, 0.35);
          filter: none;
          color: #fff;
        }

        .nav-cta:active {
          transform: translateY(0px) scale(0.985);
          box-shadow:
            0 10px 26px rgba(0, 0, 0, 0.18),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        }

        .nav-cta:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 3px rgba(255, 163, 41, 0.24),
            0 14px 34px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        }

        @media (min-width: 768px) and (max-width: 1120px) {
          .nav-link {
            font-size: 11px;
            letter-spacing: 0.06em;
          }

          .nav-cta {
            padding: 8px 12px;
          }
        }
      `}</style>
    </>
  );
}