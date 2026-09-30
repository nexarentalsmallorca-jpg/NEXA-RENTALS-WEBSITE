"use client";

import { useEffect } from "react";

const MOBILE_MAX_WIDTH = 680;

const COPY: Record<
  string,
  { cta: string; booking: string; location: string }
> = {
  en: {
    cta: "CHECK PRICES & SCOOTERS",
    booking: "Easy online booking",
    location: "Magaluf, Mallorca",
  },
  es: {
    cta: "VER PRECIOS Y SCOOTERS",
    booking: "Reserva online fácil",
    location: "Magaluf, Mallorca",
  },
  de: {
    cta: "PREISE & ROLLER ANSEHEN",
    booking: "Einfache Online-Buchung",
    location: "Magaluf, Mallorca",
  },
  fr: {
    cta: "VOIR LES PRIX & SCOOTERS",
    booking: "Réservation en ligne facile",
    location: "Magaluf, Majorque",
  },
  it: {
    cta: "VEDI PREZZI & SCOOTER",
    booking: "Prenotazione online facile",
    location: "Magaluf, Maiorca",
  },
  nl: {
    cta: "BEKIJK PRIJZEN & SCOOTERS",
    booking: "Eenvoudig online boeken",
    location: "Magaluf, Mallorca",
  },
  pl: {
    cta: "SPRAWDŹ CENY I SKUTERY",
    booking: "Łatwa rezerwacja online",
    location: "Magaluf, Majorka",
  },
  sv: {
    cta: "SE PRISER & SCOOTRAR",
    booking: "Enkel onlinebokning",
    location: "Magaluf, Mallorca",
  },
  da: {
    cta: "SE PRISER & SCOOTERE",
    booking: "Nem online booking",
    location: "Magaluf, Mallorca",
  },
  no: {
    cta: "SE PRISER & SCOOTERE",
    booking: "Enkel online bestilling",
    location: "Magaluf, Mallorca",
  },
  pt: {
    cta: "VER PREÇOS & SCOOTERS",
    booking: "Reserva online fácil",
    location: "Magaluf, Maiorca",
  },
  cs: {
    cta: "ZOBRAZIT CENY A SKÚTRY",
    booking: "Snadná online rezervace",
    location: "Magaluf, Mallorca",
  },
  sr: {
    cta: "POGLEDAJ CENE I SKUTERE",
    booking: "Jednostavna online rezervacija",
    location: "Magaluf, Majorka",
  },
  uk: {
    cta: "ЦІНИ ТА СКУТЕРИ",
    booking: "Просте онлайн-бронювання",
    location: "Магалуф, Майорка",
  },
};

function getLocale() {
  const first = window.location.pathname.split("/").filter(Boolean)[0] || "en";
  return COPY[first] ? first : "en";
}

function getKeywordText(root: ParentNode, fallback: string, booking: string) {
  const cloud = Array.from(
    root.querySelectorAll<HTMLElement>(".nexa-keyword-cloud span"),
  )
    .map((item) => (item.textContent || "").trim())
    .filter(Boolean)
    .slice(0, 2);

  if (cloud.length === 0) {
    return `${fallback} · ${booking}`;
  }

  return `${cloud.join(" · ")} · ${booking}`;
}

function getPanelTitle(root: ParentNode, fallback: string) {
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      ".nexa-seo-text-section .nexa-section-label, .nexa-trust-logos span, .nexa-section-label",
    ),
  )
    .map((item) => (item.textContent || "").trim())
    .filter(Boolean);

  return candidates[0] || fallback;
}

export default function NexaSeoMobileSkin() {
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    if (!media.matches) return;

    const page = document.querySelector<HTMLElement>(".nexa-seo-page");
    const hero = document.querySelector<HTMLElement>(".nexa-hero-section");
    const grid = hero?.querySelector<HTMLElement>(".nexa-hero-grid");
    const copy = hero?.querySelector<HTMLElement>(".nexa-hero-copy");
    const heading = copy?.querySelector<HTMLElement>("h1");
    const primary = copy?.querySelector<HTMLElement>(".nexa-primary-cta");

    if (!page || !hero || !grid || !copy || !heading || !primary) return;

    // Keep stable, non-null DOM references for nested callbacks.
    // TypeScript does not always preserve querySelector narrowing inside
    // functions that run later (timeouts, requestAnimationFrame, cleanup, etc.).
    const pageEl = page;
    const gridEl = grid;
    const copyEl = copy;
    const headingEl = heading;
    const primaryEl = primary;

    const locale = getLocale();
    const language = COPY[locale] || COPY.en;
    const originalHeading = (headingEl.textContent || "").trim();
    const reloadKey = `nexa:seo-mobile:return:${window.location.pathname}`;

    pageEl.classList.add("nexa-mobile-skin-active");
    primaryEl.setAttribute("data-mobile-label", language.cta);

    let location = copyEl.querySelector<HTMLElement>(".nexa-mobile-location");
    if (!location) {
      location = document.createElement("div");
      location.className = "nexa-mobile-location nexa-mobile-skin-generated";
      location.textContent = language.location;
      copyEl.insertBefore(location, headingEl);
    }

    let tagline = copyEl.querySelector<HTMLElement>(".nexa-mobile-hero-tagline");
    if (!tagline) {
      tagline = document.createElement("p");
      tagline.className = "nexa-mobile-hero-tagline nexa-mobile-skin-generated";
      tagline.textContent = getKeywordText(pageEl, originalHeading, language.booking);
      headingEl.insertAdjacentElement("afterend", tagline);
    }

    let arc = gridEl.querySelector<HTMLElement>(".nexa-mobile-orange-arc");
    if (!arc) {
      arc = document.createElement("div");
      arc.className = "nexa-mobile-orange-arc nexa-mobile-skin-generated";
      arc.setAttribute("aria-hidden", "true");

      const wave = document.createElement("div");
      wave.className = "nexa-mobile-wave-shape";

      const waveCopy = document.createElement("div");
      waveCopy.className = "nexa-mobile-wave-copy";

      const strong = document.createElement("strong");
      strong.textContent = getPanelTitle(pageEl, originalHeading);

      const span = document.createElement("span");
      span.textContent = getKeywordText(pageEl, originalHeading, language.booking);

      waveCopy.appendChild(strong);
      waveCopy.appendChild(span);
      arc.appendChild(wave);
      arc.appendChild(waveCopy);
      gridEl.appendChild(arc);
    }

    let activeRun = 0;
    const timers: number[] = [];

    function later(fn: () => void, delay: number) {
      const id = window.setTimeout(fn, delay);
      timers.push(id);
      return id;
    }

    function runHero() {
      activeRun += 1;
      const thisRun = activeRun;

      pageEl.classList.remove("nexa-mobile-hero-ready");
      headingEl.classList.remove("nexa-mobile-typing");
      headingEl.textContent = "";
      headingEl.setAttribute("aria-label", originalHeading);

      void pageEl.offsetWidth;

      headingEl.classList.add("nexa-mobile-typing");
      let index = 0;

      function typeNext() {
        if (thisRun !== activeRun) return;

        if (index < originalHeading.length) {
          headingEl.textContent += originalHeading.charAt(index);
          index += 1;
          later(typeNext, 31);
          return;
        }

        headingEl.classList.remove("nexa-mobile-typing");
        window.requestAnimationFrame(() => {
          if (thisRun !== activeRun) return;
          pageEl.classList.add("nexa-mobile-hero-ready");
        });
      }

      later(typeNext, 150);
    }

    function markBookingNavigation(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest(
        ".nexa-primary-cta, .nexa-seo-book-button, .nexa-mobile-main-cta, .nexa-bottom-cta, .nexa-final-cta a",
      );
      if (!link) return;

      try {
        window.sessionStorage.setItem(reloadKey, "1");
      } catch {
        // Navigation still works if storage is unavailable.
      }
    }

    function reloadIfReturning() {
      try {
        if (window.sessionStorage.getItem(reloadKey) !== "1") return false;
        window.sessionStorage.removeItem(reloadKey);
        window.location.reload();
        return true;
      } catch {
        return false;
      }
    }

    function onPageShow() {
      reloadIfReturning();
    }

    function onPopState() {
      later(reloadIfReturning, 0);
    }

    function onVisibility() {
      if (document.visibilityState === "visible") reloadIfReturning();
    }

    document.addEventListener("click", markBookingNavigation, true);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("visibilitychange", onVisibility);

    if (!reloadIfReturning()) runHero();

    return () => {
      activeRun += 1;
      timers.forEach((id) => window.clearTimeout(id));
      document.removeEventListener("click", markBookingNavigation, true);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("visibilitychange", onVisibility);
      pageEl.classList.remove("nexa-mobile-skin-active", "nexa-mobile-hero-ready");
      headingEl.classList.remove("nexa-mobile-typing");
      headingEl.textContent = originalHeading;
      primaryEl.removeAttribute("data-mobile-label");
      pageEl
        .querySelectorAll<HTMLElement>(".nexa-mobile-skin-generated")
        .forEach((element) => element.remove());
    };
  }, []);

  return (
    <style jsx global>{`
      @media (max-width: ${MOBILE_MAX_WIDTH}px) {
        .nexa-mobile-skin-active {
          --mobile-book-x: 0px;
          --mobile-book-y: -8px;
          --mobile-arc-x: 0px;
          --mobile-arc-y: 28px;
          --mobile-arc-height: 114px;
          --mobile-arc-text-x: 0px;
          --mobile-arc-text-y: 12px;
        }

        .nexa-mobile-skin-active .nexa-hero-section {
          position: relative !important;
          padding: 0 !important;
          background: #111116 !important;
        }

        .nexa-mobile-skin-active .nexa-hero-grid {
          position: relative !important;
          max-width: none !important;
          width: 100% !important;
          min-height: calc(94svh + 18px) !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          grid-template-areas: "hero" !important;
          gap: 0 !important;
          overflow: hidden !important;
          background: #111116 !important;
        }

        .nexa-mobile-skin-active .nexa-hero-visual {
          grid-area: hero !important;
          position: relative !important;
          width: 100% !important;
          max-width: none !important;
          min-height: calc(94svh + 18px) !important;
          margin: 0 !important;
          z-index: 1 !important;
        }

        .nexa-mobile-skin-active .nexa-visual-stack {
          position: relative !important;
          width: 100% !important;
          min-height: calc(94svh + 18px) !important;
        }

        .nexa-mobile-skin-active .nexa-orange-shape,
        .nexa-mobile-skin-active .nexa-photo-card-bottom,
        .nexa-mobile-skin-active .nexa-floating-price {
          display: none !important;
        }

        .nexa-mobile-skin-active .nexa-photo-card-top {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #111116 !important;
        }

        .nexa-mobile-skin-active .nexa-photo-card-top::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.06) 30%, rgba(0, 0, 0, 0.015) 58%, rgba(0, 0, 0, 0.12) 100%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.05) 58%, rgba(0, 0, 0, 0.01) 100%);
        }

        .nexa-mobile-skin-active .nexa-photo-card-top .nexa-hero-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: 56% center !important;
          filter: brightness(1.14) saturate(1.04) contrast(0.96) !important;
          transform: scale(0.985) !important;
          transform-origin: center center !important;
        }

        .nexa-mobile-skin-active .nexa-hero-copy {
          grid-area: hero !important;
          position: relative !important;
          z-index: 4 !important;
          min-height: calc(100svh - 168px) !important;
          padding: clamp(12px, 1.8svh, 18px) 22px 28px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          text-align: left !important;
          color: #ffffff !important;
          pointer-events: none !important;
        }

        .nexa-mobile-skin-active .nexa-mobile-location {
          order: -1;
          display: inline-flex !important;
          align-items: center;
          gap: 8px;
          margin: 0 0 10px !important;
          color: rgba(255, 255, 255, 0.94) !important;
          font-size: 11px !important;
          font-weight: 800 !important;
          letter-spacing: 0.16em !important;
          text-transform: uppercase;
          text-shadow: 0 3px 14px rgba(0, 0, 0, 0.32);
        }

        .nexa-mobile-skin-active .nexa-mobile-location::before {
          content: "●";
          color: #ff7a00;
          font-size: 10px;
          line-height: 1;
        }

        .nexa-mobile-skin-active .nexa-hero-copy h1 {
          max-width: 338px !important;
          margin: 0 !important;
          color: #ffffff !important;
          font-size: clamp(29px, 8.1vw, 38px) !important;
          line-height: 0.99 !important;
          letter-spacing: -0.062em !important;
          font-weight: 800 !important;
          text-wrap: balance;
          text-shadow: 0 5px 28px rgba(0, 0, 0, 0.36);
        }

        .nexa-mobile-skin-active .nexa-hero-copy h1.nexa-mobile-typing::after {
          content: "";
          display: inline-block;
          width: 2px;
          height: 0.86em;
          margin-left: 4px;
          vertical-align: -0.04em;
          background: #ff8a00;
          animation: nexaSkinCaret 720ms steps(1) infinite;
        }

        @keyframes nexaSkinCaret {
          0%, 48% { opacity: 1; }
          49%, 100% { opacity: 0; }
        }

        .nexa-mobile-skin-active .nexa-mobile-hero-tagline {
          display: block !important;
          max-width: 325px;
          margin: 9px 0 0 !important;
          opacity: 0;
          transform: translateX(-56px);
          color: rgba(255, 255, 255, 0.94) !important;
          font-size: 12.5px !important;
          line-height: 1.45 !important;
          letter-spacing: -0.018em !important;
          font-weight: 700 !important;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.42);
        }

        .nexa-mobile-skin-active .nexa-hero-text,
        .nexa-mobile-skin-active .nexa-hero-text.small,
        .nexa-mobile-skin-active .nexa-online-note,
        .nexa-mobile-skin-active .nexa-distance-note,
        .nexa-mobile-skin-active .nexa-hero-points,
        .nexa-mobile-skin-active .nexa-secondary-cta {
          display: none !important;
        }

        .nexa-mobile-skin-active .nexa-hero-actions {
          position: relative !important;
          left: var(--mobile-book-x) !important;
          top: var(--mobile-book-y) !important;
          width: 100% !important;
          margin-top: clamp(16px, 2.7svh, 26px) !important;
          display: flex !important;
          opacity: 0;
          transform: translateX(-72px);
          justify-content: flex-start !important;
          pointer-events: auto !important;
        }

        .nexa-mobile-skin-active.nexa-mobile-hero-ready .nexa-mobile-hero-tagline {
          animation: nexaSkinLeftIn 620ms cubic-bezier(.18,.85,.22,1) 80ms both;
        }

        .nexa-mobile-skin-active.nexa-mobile-hero-ready .nexa-hero-actions {
          animation: nexaSkinLeftIn 680ms cubic-bezier(.18,.85,.22,1) 180ms both;
        }

        @keyframes nexaSkinLeftIn {
          from { opacity: 0; transform: translateX(-72px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .nexa-mobile-skin-active .nexa-primary-cta {
          position: relative !important;
          width: auto !important;
          min-width: 224px !important;
          min-height: 56px !important;
          padding: 0 29px !important;
          overflow: hidden !important;
          border: 2px solid rgba(255, 255, 255, 0.95) !important;
          background: linear-gradient(135deg, #ff6500 0%, #ff8a00 58%, #ff9f25 100%) !important;
          color: transparent !important;
          box-shadow: 0 18px 42px rgba(255, 122, 0, 0.38), 0 0 0 0 rgba(255, 122, 0, 0.42) !important;
          font-size: 0 !important;
          animation: nexaSkinHeartbeat 1.8s ease-in-out infinite !important;
        }

        .nexa-mobile-skin-active .nexa-primary-cta::before {
          content: attr(data-mobile-label);
          position: relative;
          z-index: 2;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .nexa-mobile-skin-active .nexa-primary-cta::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -35%;
          width: 28%;
          height: 170%;
          transform: rotate(18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          animation: nexaSkinShine 2.8s ease-in-out infinite;
        }

        @keyframes nexaSkinHeartbeat {
          0%, 100% { transform: scale(1); box-shadow: 0 18px 42px rgba(255, 122, 0, 0.38), 0 0 0 0 rgba(255, 122, 0, 0.36); }
          12% { transform: scale(1.045); box-shadow: 0 20px 46px rgba(255, 122, 0, 0.44), 0 0 0 8px rgba(255, 122, 0, 0.10); }
          24% { transform: scale(1); }
          36% { transform: scale(1.025); }
          48% { transform: scale(1); }
        }

        @keyframes nexaSkinShine {
          0%, 55% { left: -45%; opacity: 0; }
          62% { opacity: 0.85; }
          78% { left: 120%; opacity: 0; }
          100% { left: 120%; opacity: 0; }
        }

        .nexa-mobile-skin-active .nexa-mobile-orange-arc {
          position: absolute !important;
          left: calc(-6% + var(--mobile-arc-x)) !important;
          bottom: calc(-1px + var(--mobile-arc-y)) !important;
          z-index: 5 !important;
          width: 112% !important;
          height: var(--mobile-arc-height) !important;
          display: block !important;
          overflow: hidden !important;
          pointer-events: none !important;
          filter: drop-shadow(0 -7px 20px rgba(255, 122, 0, 0.16));
        }

        .nexa-mobile-skin-active .nexa-mobile-wave-shape {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #ff6500 0%, #ff8a00 58%, #ff9f25 100%);
          clip-path: polygon(0 46%, 17% 46%, 24% 40%, 39% 34%, 54% 34%, 62% 27%, 76% 20%, 88% 20%, 100% 12%, 100% 100%, 0 100%);
        }

        .nexa-mobile-skin-active .nexa-mobile-wave-copy {
          position: absolute;
          right: calc(9% - var(--mobile-arc-text-x));
          bottom: calc(10px + var(--mobile-arc-text-y));
          z-index: 2;
          width: min(78%, 380px);
          color: #ffffff;
          text-align: right;
          padding-left: 16px;
          opacity: 0;
          transform: translateX(64px);
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.2);
        }

        .nexa-mobile-skin-active .nexa-mobile-wave-copy strong {
          display: block;
          font-size: 14px;
          line-height: 1.12;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .nexa-mobile-skin-active .nexa-mobile-wave-copy span {
          display: block;
          margin-top: 5px;
          font-size: 10.4px;
          line-height: 1.35;
          font-weight: 700;
          letter-spacing: 0.01em;
          opacity: 0.96;
        }

        .nexa-mobile-skin-active.nexa-mobile-hero-ready .nexa-mobile-wave-copy {
          animation: nexaSkinWaveIn 680ms cubic-bezier(.18,.85,.22,1) 220ms both;
        }

        @keyframes nexaSkinWaveIn {
          from { opacity: 0; transform: translateX(64px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .nexa-mobile-skin-active .nexa-trust-section {
          display: none !important;
        }

        .nexa-mobile-skin-active .nexa-fast-info-section {
          padding: 30px 12px 26px !important;
          background: #ffffff !important;
        }

        .nexa-mobile-skin-active .nexa-fast-info-grid {
          max-width: 560px !important;
          margin: 0 auto !important;
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 24px 8px !important;
          align-items: start !important;
        }

        .nexa-mobile-skin-active .nexa-included-item {
          min-width: 0 !important;
          padding: 0 2px !important;
          text-align: center !important;
        }

        .nexa-mobile-skin-active .nexa-orange-check {
          top: -2px !important;
          right: 8% !important;
          width: 18px !important;
          height: 18px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 999px !important;
          background: #ff7a00 !important;
          color: #ffffff !important;
          font-size: 11px !important;
          text-shadow: none !important;
          box-shadow: 0 7px 18px rgba(255, 122, 0, 0.23) !important;
        }

        .nexa-mobile-skin-active .nexa-included-image-wrap {
          height: 78px !important;
        }

        .nexa-mobile-skin-active .nexa-included-image {
          width: 100% !important;
          max-width: 94px !important;
          height: 74px !important;
          object-fit: contain !important;
        }

        .nexa-mobile-skin-active .nexa-included-item strong {
          margin-top: 8px !important;
          min-height: 32px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          color: #15141c !important;
          font-size: 12.5px !important;
          line-height: 1.12 !important;
          letter-spacing: -0.035em !important;
          font-weight: 900 !important;
        }

        .nexa-mobile-skin-active .nexa-included-item p {
          max-width: 116px !important;
          margin: 3px auto 0 !important;
          color: #777582 !important;
          font-size: 10px !important;
          line-height: 1.28 !important;
          font-weight: 600 !important;
        }

        .nexa-mobile-skin-active .nexa-fast-info-grid .nexa-included-item:nth-child(4) {
          grid-column: 1 / 2;
          transform: translateX(52%);
        }

        .nexa-mobile-skin-active .nexa-fast-info-grid .nexa-included-item:nth-child(5) {
          grid-column: 2 / 3;
          transform: translateX(52%);
        }
      }

      @media (max-width: 420px) {
        .nexa-mobile-skin-active {
          --mobile-book-x: 0px;
          --mobile-book-y: 100px;
          --mobile-arc-x: 0px;
          --mobile-arc-y: 20px;
          --mobile-arc-height: 124px;
          --mobile-arc-text-x: 0px;
          --mobile-arc-text-y: 12px;
        }

        .nexa-mobile-skin-active .nexa-hero-copy {
          min-height: calc(100svh - 160px) !important;
          padding: 0 18px 24px !important;
          transform: translateY(-30px);
        }

        .nexa-mobile-skin-active .nexa-hero-copy h1 {
          max-width: 300px !important;
          font-size: 31px !important;
        }

        .nexa-mobile-skin-active .nexa-mobile-hero-tagline {
          max-width: 290px;
          font-size: 12.5px !important;
        }

        .nexa-mobile-skin-active .nexa-primary-cta {
          min-width: 210px !important;
          min-height: 54px !important;
          padding: 0 24px !important;
        }

        .nexa-mobile-skin-active .nexa-primary-cta::before {
          font-size: 13px;
        }

        .nexa-mobile-skin-active .nexa-photo-card-top .nexa-hero-image {
          object-position: 54% center !important;
          filter: brightness(1.16) saturate(1.04) contrast(0.95) !important;
          transform: scale(0.98) !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .nexa-mobile-skin-active .nexa-mobile-hero-tagline,
        .nexa-mobile-skin-active .nexa-hero-actions,
        .nexa-mobile-skin-active .nexa-mobile-wave-copy {
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
        }
      }
    `}</style>
  );
}
