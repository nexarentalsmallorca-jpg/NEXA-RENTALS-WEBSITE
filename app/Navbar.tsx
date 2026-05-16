"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

type Locale = "en" | "es" | "de" | "fr" | "sv" | "it" | "pt";

const LANGUAGES: {
  code: Locale;
  label: string;
  flagSrc: string;
  short: string;
}[] = [
  { code: "en", label: "English", flagSrc: "/images/en.png", short: "EN" },
  { code: "es", label: "Español", flagSrc: "/images/es.png", short: "ES" },
  { code: "de", label: "Deutsch", flagSrc: "/images/de.png", short: "DE" },
  { code: "fr", label: "Français", flagSrc: "/images/fr.png", short: "FR" },
  { code: "it", label: "Italiano", flagSrc: "/images/it.png", short: "IT" },
  { code: "pt", label: "Português", flagSrc: "/images/pt.png", short: "PT" },
  { code: "sv", label: "Svenska", flagSrc: "/images/sv.png", short: "SV" },
];

const SALES_BAR_COPY: Record<
  Locale,
  {
    badge: string;
    saveLabel: string;
    priceValue: string;
    endsIn: string;
    cta: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    selectLanguage: string;
    active: string;
    menu: string;
  }
> = {
  en: {
    badge: "May Special",
    saveLabel: "Save up to",
    priceValue: "€13",
    endsIn: "Ends in",
    cta: "See prices",
    days: "Days",
    hours: "Hrs",
    minutes: "Mins",
    seconds: "Secs",
    selectLanguage: "Select language",
    active: "Active",
    menu: "Menu",
  },
  es: {
    badge: "Especial mayo",
    saveLabel: "Ahorra hasta",
    priceValue: "13€",
    endsIn: "Termina en",
    cta: "Ver precios",
    days: "Días",
    hours: "Hrs",
    minutes: "Mins",
    seconds: "Segs",
    selectLanguage: "Seleccionar idioma",
    active: "Activo",
    menu: "Menú",
  },
  de: {
    badge: "Mai Special",
    saveLabel: "Spare bis zu",
    priceValue: "13€",
    endsIn: "Endet in",
    cta: "Preise sehen",
    days: "Tage",
    hours: "Std",
    minutes: "Min",
    seconds: "Sek",
    selectLanguage: "Sprache wählen",
    active: "Aktiv",
    menu: "Menü",
  },
  fr: {
    badge: "Offre mai",
    saveLabel: "Économisez",
    priceValue: "13€",
    endsIn: "Fin dans",
    cta: "Voir prix",
    days: "Jours",
    hours: "Hrs",
    minutes: "Mins",
    seconds: "Secs",
    selectLanguage: "Choisir la langue",
    active: "Actif",
    menu: "Menu",
  },
  it: {
    badge: "Speciale maggio",
    saveLabel: "Risparmia fino a",
    priceValue: "13€",
    endsIn: "Termina tra",
    cta: "Vedi prezzi",
    days: "Giorni",
    hours: "Ore",
    minutes: "Min",
    seconds: "Sec",
    selectLanguage: "Seleziona lingua",
    active: "Attivo",
    menu: "Menu",
  },
  pt: {
    badge: "Especial maio",
    saveLabel: "Poupe até",
    priceValue: "13€",
    endsIn: "Termina em",
    cta: "Ver preços",
    days: "Dias",
    hours: "Hrs",
    minutes: "Mins",
    seconds: "Segs",
    selectLanguage: "Selecionar idioma",
    active: "Ativo",
    menu: "Menu",
  },
  sv: {
    badge: "Majerbjudande",
    saveLabel: "Spara upp till",
    priceValue: "13€",
    endsIn: "Slutar om",
    cta: "Se priser",
    days: "Dagar",
    hours: "Tim",
    minutes: "Min",
    seconds: "Sek",
    selectLanguage: "Välj språk",
    active: "Aktiv",
    menu: "Meny",
  },
};

function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && LANGUAGES.some((language) => language.code === value));
}

function safeGetLocaleFromPath(pathname: string): Locale {
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];

  if (isLocale(first)) return first;

  return "en";
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return `/${nextLocale}`;

  const hasLocale = isLocale(parts[0]);
  const rest = hasLocale ? parts.slice(1) : parts;

  const nextPath = `/${nextLocale}${rest.length ? `/${rest.join("/")}` : ""}`;

  return nextPath.replace(/\/+$/, "") || `/${nextLocale}`;
}

function getOfferEndDate() {
  const now = new Date();
  return new Date(now.getFullYear(), 4, 31, 23, 59, 59, 999);
}

function getTimeLeft() {
  const now = new Date();
  const endDate = getOfferEndDate();
  const diff = Math.max(0, endDate.getTime() - now.getTime());

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Navbar() {
  const t = useTranslations("nav");
  const activeLocaleFromProvider = useLocale() as Locale;

  const navRef = useRef<HTMLElement | null>(null);
  const salesBarRef = useRef<HTMLDivElement | null>(null);

  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();

  const detectedLocale: Locale = safeGetLocaleFromPath(pathname);
  const currentLocale: Locale = isLocale(activeLocaleFromProvider)
    ? activeLocaleFromProvider
    : detectedLocale;

  const copy = SALES_BAR_COPY[currentLocale] || SALES_BAR_COPY.en;

  const currentLang =
    LANGUAGES.find((language) => language.code === currentLocale) ||
    LANGUAGES[0];

  const homeHref = `/${currentLocale}`;
  const fleetHref = `/${currentLocale}/fleet`;
  const blogsHref = `/${currentLocale}/#blogs`;
  const contactHref = `/${currentLocale}/contact`;
  const aboutHref = `/${currentLocale}/about`;

  const bookingHref = useMemo(() => {
    return pathname === `/${currentLocale}`
      ? "#booking"
      : `/${currentLocale}#booking`;
  }, [pathname, currentLocale]);

  function scrollToBooking() {
    const target =
      document.getElementById("booking") ||
      document.querySelector("[data-nexa-booking]") ||
      document.querySelector(".nexa-booking-panel");

    if (!target) return false;

    const navSpace =
      Number.parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--total-nav-space"
        ),
        10
      ) || 130;

    const top =
      target.getBoundingClientRect().top + window.scrollY - navSpace - 18;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });

    return true;
  }

  function handleBookingClick(e: ReactMouseEvent<HTMLAnchorElement>) {
    const isHomePage = pathname === `/${currentLocale}`;

    if (isHomePage) {
      const didScroll = scrollToBooking();

      if (didScroll) {
        e.preventDefault();
        window.history.replaceState(null, "", "#booking");
      }
    }
  }

  function toggleLanguageDropdown() {
    setLangOpen((current) => !current);
  }

  const onSelectLocale = (nextLocale: Locale) => {
    setLangOpen(false);
    setMobileOpen(false);

    const nextPath = replaceLocaleInPath(pathname, nextLocale);
    const qs = searchParams?.toString() || "";
    const finalPath = qs ? `${nextPath}?${qs}` : nextPath;

    router.push(finalPath);

    setTimeout(() => {
      router.refresh();
    }, 50);
  };

  useEffect(() => {
    setTimeLeft(getTimeLeft());

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const setNavHeight = () => {
      const navHeight = navRef.current?.offsetHeight || 0;
      const salesBarHeight = salesBarRef.current?.offsetHeight || 46;

      document.documentElement.style.setProperty(
        "--nav-height",
        `${navHeight}px`
      );
      document.documentElement.style.setProperty(
        "--announcement-height",
        `${salesBarHeight}px`
      );
      document.documentElement.style.setProperty(
        "--sales-bar-height",
        `${salesBarHeight}px`
      );
      document.documentElement.style.setProperty(
        "--total-nav-space",
        `${navHeight + salesBarHeight}px`
      );
    };

    setNavHeight();

    const resizeObserver = new ResizeObserver(setNavHeight);

    if (navRef.current) resizeObserver.observe(navRef.current);
    if (salesBarRef.current) resizeObserver.observe(salesBarRef.current);

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

  return (
    <>
      <div ref={salesBarRef} className="fixed inset-x-0 top-0 z-[10000]">
        <div className="sales-bar relative overflow-hidden border-b border-black/10 shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
          <div className="sales-bar-waves sales-bar-waves-one" />
          <div className="sales-bar-waves sales-bar-waves-two" />
          <div className="sales-bar-waves sales-bar-waves-three" />
          <div className="sales-bar-overlay" />

          <div className="relative mx-auto flex min-h-[44px] max-w-[1480px] items-center justify-between gap-2 px-[clamp(8px,2vw,32px)] py-1.5 md:min-h-[50px]">
            <Link
              href={bookingHref}
              onClick={handleBookingClick}
              className="announcement-main flex min-w-0 flex-1 items-center justify-between gap-2"
            >
              <div className="offer-left flex min-w-0 items-center gap-2 md:gap-3">
                <span className="offer-month shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-black sm:text-[12px] md:text-[14px]">
                  {copy.badge}
                </span>

                <span className="hidden h-1 w-1 shrink-0 rounded-full bg-black/45 sm:block" />

                <div className="discount-line min-w-0 truncate">
                  <span className="discount-main text-[11px] font-black uppercase tracking-[0.025em] text-black sm:text-[14px] md:text-[19px]">
                    {copy.saveLabel}{" "}
                    <span className="discount-price">{copy.priceValue}</span>
                  </span>
                </div>

                <span className="hidden h-1 w-1 shrink-0 rounded-full bg-black/45 md:block" />

                <span className="ends-label hidden shrink-0 text-[8px] font-black uppercase tracking-[0.16em] text-black/70 lg:inline-block">
                  {copy.endsIn}
                </span>
              </div>

              <div className="timer-row ml-auto flex shrink-0 items-center gap-[3px] sm:gap-1">
                <TimeBox value={pad(timeLeft.days)} label={copy.days} />
                <Colon />
                <TimeBox value={pad(timeLeft.hours)} label={copy.hours} />
                <Colon />
                <TimeBox value={pad(timeLeft.minutes)} label={copy.minutes} />
                <Colon />
                <TimeBox
                  value={pad(timeLeft.seconds)}
                  label={copy.seconds}
                  live
                />
              </div>
            </Link>

            <Link
              href={bookingHref}
              onClick={handleBookingClick}
              className="sales-cta-button hidden shrink-0 rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.11em] text-white transition hover:-translate-y-[1px] hover:bg-[#161616] active:scale-[0.97] sm:inline-flex md:px-5 md:text-[11px]"
            >
              {copy.cta}
            </Link>
          </div>
        </div>
      </div>

      <header
        ref={(el) => {
          navRef.current = el;
        }}
        className={[
          "fixed left-0 right-0 top-[var(--sales-bar-height,44px)] z-[9999]",
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
                    aria-label={copy.selectLanguage}
                  >
                    <Image
                      src={currentLang.flagSrc}
                      alt={currentLang.label}
                      width={17}
                      height={17}
                      className="rounded-full"
                    />
                    <span className="uppercase tracking-[0.14em]">
                      {currentLang.short}
                    </span>
                    <span className="text-white/60">▾</span>
                  </button>

                  <div
                    className={[
                      "absolute left-0 mt-2 w-[245px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]/96 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl",
                      "transition-all duration-200",
                      langOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0",
                    ].join(" ")}
                  >
                    <div className="border-b border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                      {copy.selectLanguage}
                    </div>

                    <div className="p-2">
                      {LANGUAGES.map((language) => {
                        const active = language.code === currentLocale;

                        return (
                          <button
                            key={language.code}
                            type="button"
                            onClick={() => onSelectLocale(language.code)}
                            className={[
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 transition",
                              active
                                ? "bg-white/12 text-white"
                                : "text-white/78 hover:bg-white/10 hover:text-white",
                            ].join(" ")}
                          >
                            <span className="flex items-center gap-3">
                              <Image
                                src={language.flagSrc}
                                alt={language.label}
                                width={22}
                                height={22}
                                className="rounded-full"
                              />
                              <span className="text-sm">{language.label}</span>
                            </span>

                            <span
                              className={[
                                "text-[10px] uppercase tracking-[0.14em]",
                                active ? "text-orange-300" : "text-white/45",
                              ].join(" ")}
                            >
                              {active ? copy.active : language.short}
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
                  <span className="sr-only">{copy.menu}</span>
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
                <Link
                  href={homeHref}
                  className="flex shrink-0 select-none items-center"
                >
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
                      {t("contact")}
                    </Link>
                  </nav>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={toggleLanguageDropdown}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#1b1f27]/75 px-3 py-2 text-xs text-white/90 backdrop-blur-sm hover:border-white/20 hover:bg-[#232a35]/80"
                      aria-expanded={langOpen}
                      aria-label={copy.selectLanguage}
                    >
                      <Image
                        src={currentLang.flagSrc}
                        alt={currentLang.label}
                        width={18}
                        height={18}
                        className="rounded-full"
                      />
                      <span className="uppercase tracking-[0.18em] text-white/90">
                        {currentLang.short}
                      </span>
                      <span className="text-white/70">▾</span>
                    </button>

                    <div
                      className={[
                        "absolute right-0 mt-2 w-[250px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]/95 shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-xl",
                        "transition-all duration-200",
                        langOpen
                          ? "pointer-events-auto translate-y-0 opacity-100"
                          : "pointer-events-none -translate-y-2 opacity-0",
                      ].join(" ")}
                    >
                      <div className="border-b border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                        {copy.selectLanguage}
                      </div>

                      <div className="p-2">
                        {LANGUAGES.map((language) => {
                          const active = language.code === currentLocale;

                          return (
                            <button
                              key={language.code}
                              type="button"
                              onClick={() => onSelectLocale(language.code)}
                              className={[
                                "flex w-full items-center justify-between rounded-xl px-3 py-2 transition",
                                active
                                  ? "bg-white/12 text-white"
                                  : "text-white/78 hover:bg-white/10 hover:text-white",
                              ].join(" ")}
                            >
                              <span className="flex items-center gap-3">
                                <Image
                                  src={language.flagSrc}
                                  alt={language.label}
                                  width={22}
                                  height={22}
                                  className="rounded-full"
                                />
                                <span className="text-sm">
                                  {language.label}
                                </span>
                              </span>

                              <span
                                className={[
                                  "text-[10px] uppercase tracking-[0.14em]",
                                  active ? "text-orange-300" : "text-white/45",
                                ].join(" ")}
                              >
                                {active ? copy.active : language.short}
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
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
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
            <span className="text-sm uppercase tracking-[0.22em] text-white/70">
              {copy.menu}
            </span>
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
              <Image
                src="/images/home.png"
                alt={t("home")}
                width={22}
                height={22}
                className="opacity-90"
              />
              <span>{t("home")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={fleetHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/images/fleet.png"
                alt={t("fleet")}
                width={22}
                height={22}
                className="opacity-90"
              />
              <span>{t("fleet")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={blogsHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/images/blogs.png"
                alt={t("blogs")}
                width={22}
                height={22}
                className="opacity-90"
              />
              <span>{t("blogs")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={contactHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/images/contact.png"
                alt={t("contact")}
                width={22}
                height={22}
                className="opacity-90"
              />
              <span>{t("contact")}</span>
            </Link>

            <Link
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-white/90 transition hover:bg-white/5 hover:text-white"
              href={aboutHref}
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src="/images/nexa.png"
                alt={t("about")}
                width={22}
                height={22}
                className="opacity-90"
              />
              <span>{t("about")}</span>
            </Link>
          </nav>
        </aside>
      </div>

      <style jsx global>{`
        .sales-bar {
          background:
            linear-gradient(
              90deg,
              #de6b00 0%,
              #ff8308 22%,
              #ff8a0f 48%,
              #ff7a00 72%,
              #e66d00 100%
            );
        }

        .sales-bar-waves {
          position: absolute;
          inset: 0;
          pointer-events: none;
          will-change: transform;
        }

        .sales-bar-waves-one {
          opacity: 0.42;
          background:
            repeating-radial-gradient(
              ellipse at 108% 50%,
              rgba(125, 66, 224, 0.30) 0px,
              rgba(125, 66, 224, 0.30) 7px,
              rgba(171, 110, 255, 0.22) 8px,
              rgba(171, 110, 255, 0.22) 14px,
              rgba(255, 255, 255, 0) 15px,
              rgba(255, 255, 255, 0) 44px
            );
          mix-blend-mode: soft-light;
          animation: nexaWaveFlowOne 16s linear infinite;
        }

        .sales-bar-waves-two {
          opacity: 0.38;
          background:
            repeating-radial-gradient(
              ellipse at 114% 50%,
              rgba(83, 30, 172, 0.22) 0px,
              rgba(83, 30, 172, 0.22) 10px,
              rgba(138, 72, 224, 0.16) 11px,
              rgba(138, 72, 224, 0.16) 21px,
              rgba(255, 255, 255, 0) 22px,
              rgba(255, 255, 255, 0) 72px
            );
          filter: blur(0.4px);
          mix-blend-mode: overlay;
          animation: nexaWaveFlowTwo 24s linear infinite;
        }

        .sales-bar-waves-three {
          opacity: 0.26;
          background:
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.08) 20%,
              rgba(125, 66, 224, 0.18) 50%,
              rgba(255, 255, 255, 0.06) 72%,
              rgba(255, 255, 255, 0) 100%
            ),
            radial-gradient(
              60% 140% at 100% 50%,
              rgba(118, 53, 217, 0.20) 0%,
              rgba(118, 53, 217, 0.10) 28%,
              rgba(255, 255, 255, 0) 58%
            );
          mix-blend-mode: soft-light;
          animation: nexaWaveFlowThree 20s linear infinite;
        }

        .sales-bar-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.22) 0%,
              rgba(255, 255, 255, 0.08) 18%,
              rgba(255, 255, 255, 0) 40%,
              rgba(0, 0, 0, 0.08) 100%
            );
        }

        .announcement-main {
          position: relative;
          z-index: 2;
        }

        .offer-month {
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .discount-main {
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        .discount-price {
          color: #ffffff;
          font-size: 1.18em;
          text-shadow:
            0 2px 12px rgba(0, 0, 0, 0.28),
            0 1px 0 rgba(0, 0, 0, 0.22);
        }

        .timer-row {
          perspective: 700px;
        }

        .timer-card {
          position: relative;
          display: inline-flex;
          min-width: 44px;
          height: 32px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 9px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: rgba(255, 255, 255, 0.96);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.9),
            inset 0 -1px 0 rgba(0, 0, 0, 0.08),
            0 6px 14px rgba(0, 0, 0, 0.18);
        }

        .timer-card::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
        }

        .timer-value-wrap {
          position: relative;
          height: 16px;
          min-width: 24px;
          overflow: hidden;
        }

        .timer-value {
          display: block;
          color: #111111;
          font-size: 14px;
          font-weight: 950;
          line-height: 16px;
          letter-spacing: 0.03em;
          text-align: center;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.75);
        }

        .timer-card.live .timer-value {
          animation: timerFlipDown 460ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .timer-label {
          margin-top: 1px;
          color: rgba(0, 0, 0, 0.58);
          font-size: 6px;
          font-weight: 950;
          line-height: 1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .timer-colon {
          color: #111111;
          font-size: 16px;
          font-weight: 950;
          line-height: 1;
          animation: colonBlink 1s ease-in-out infinite;
        }

        .sales-cta-button {
          position: relative;
          z-index: 2;
          background: #111111;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow:
            0 10px 22px rgba(0, 0, 0, 0.24),
            0 0 0 1px rgba(0, 0, 0, 0.16) inset,
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }

        @keyframes nexaWaveFlowOne {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-180px);
          }
        }

        @keyframes nexaWaveFlowTwo {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-260px);
          }
        }

        @keyframes nexaWaveFlowThree {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-220px);
          }
        }

        @keyframes timerFlipDown {
          0% {
            opacity: 0;
            transform: translateY(-115%) rotateX(55deg);
            filter: blur(3px);
          }
          55% {
            opacity: 1;
            transform: translateY(5%) rotateX(0deg);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
            filter: blur(0);
          }
        }

        @keyframes colonBlink {
          0%,
          100% {
            opacity: 0.46;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          padding: 0px 3px;
          font-family:
            "Cinzel", "Playfair Display", "Cormorant Garamond", "Didot",
            "Bodoni MT", serif;
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

        @media (max-width: 767px) {
          .sales-bar > div:last-child {
            min-height: 42px !important;
            padding-left: 7px !important;
            padding-right: 7px !important;
          }

          .sales-bar-waves-one {
            opacity: 0.38;
            animation-duration: 18s;
          }

          .sales-bar-waves-two {
            opacity: 0.28;
            animation-duration: 28s;
          }

          .sales-bar-waves-three {
            opacity: 0.20;
            animation-duration: 22s;
          }

          .announcement-main {
            width: 100%;
            gap: 6px !important;
          }

          .offer-left {
            gap: 6px !important;
          }

          .offer-month {
            font-size: 8px !important;
            letter-spacing: 0.08em !important;
          }

          .discount-main {
            font-size: 10px !important;
            letter-spacing: 0.015em !important;
          }

          .discount-price {
            font-size: 1.22em;
          }

          .timer-row {
            gap: 2px !important;
          }

          .timer-card {
            min-width: 30px;
            height: 28px;
            border-radius: 7px;
          }

          .timer-value-wrap {
            height: 13px;
            min-width: 18px;
          }

          .timer-value {
            font-size: 10px;
            line-height: 13px;
          }

          .timer-label {
            font-size: 5px;
            letter-spacing: 0.01em;
          }

          .timer-colon {
            font-size: 11px;
          }
        }

        @media (max-width: 520px) {
          .sales-cta-button {
            display: none !important;
          }

          .announcement-main {
            width: 100%;
          }

          .discount-line {
            max-width: 118px;
          }
        }

        @media (max-width: 390px) {
          .sales-bar > div:last-child {
            padding-left: 5px !important;
            padding-right: 5px !important;
          }

          .discount-line {
            max-width: 94px;
          }

          .discount-main {
            font-size: 9px !important;
          }

          .timer-card {
            min-width: 27px;
            height: 26px;
          }

          .timer-value {
            font-size: 9px;
          }

          .timer-label {
            font-size: 4.5px;
          }

          .timer-colon {
            font-size: 9px;
          }
        }
      `}</style>
    </>
  );
}

function Colon() {
  return <span className="timer-colon">:</span>;
}

function TimeBox({
  value,
  label,
  live = false,
}: {
  value: string;
  label: string;
  live?: boolean;
}) {
  return (
    <span className={`timer-card ${live ? "live" : ""}`}>
      <span className="timer-value-wrap">
        {live ? (
          <span key={value} className="timer-value">
            {value}
          </span>
        ) : (
          <span className="timer-value">{value}</span>
        )}
      </span>
      <span className="timer-label">{label}</span>
    </span>
  );
}