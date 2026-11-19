"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Montserrat } from "next/font/google";
import { useLocale } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type Locale = "en" | "es" | "de" | "fr" | "it" | "nl" | "pl" | "sv" | "da" | "no" | "pt" | "cs" | "uk";

const LOCATION_COPY: Record<Locale, Record<"interactive" | "larger" | "location" | "find" | "description" | "every" | "open" | "closed" | "open_now" | "opens_today" | "opens_tomorrow" | "checking" | "local_time" | "mallorca" | "maps", string>> = {
  "en": {
    "interactive": "Interactive Map",
    "larger": "View larger map",
    "location": "Location",
    "find": "Find Us in Magaluf",
    "description": "Visit our pickup point in Magaluf. Easy directions and fast handover before your ride.",
    "every": "Every day",
    "open": "OPEN",
    "closed": "CLOSED",
    "open_now": "Open now",
    "opens_today": "Opens today at 09:30",
    "opens_tomorrow": "Opens tomorrow at 09:30",
    "checking": "Checking",
    "local_time": "Local time in Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "Open in your maps"
  },
  "es": {
    "interactive": "Mapa interactivo",
    "larger": "Ampliar mapa",
    "location": "Ubicación",
    "find": "Encuéntranos en Magaluf",
    "description": "Visita nuestro punto de recogida en Magaluf. Cómo llegar fácilmente y recogida rápida antes de tu viaje.",
    "every": "Todos los días",
    "open": "ABIERTO",
    "closed": "CERRADO",
    "open_now": "Abierto ahora",
    "opens_today": "Abre hoy a las 09:30",
    "opens_tomorrow": "Abre mañana a las 09:30",
    "checking": "Comprobando",
    "local_time": "Hora local en Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "Abrir en mapas"
  },
  "de": {
    "interactive": "Interaktive Karte",
    "larger": "Karte vergrößern",
    "location": "Standort",
    "find": "Besuche uns in Magaluf",
    "description": "Besuche unsere Abholstation in Magaluf. Einfache Anfahrt und schnelle Übergabe vor deiner Fahrt.",
    "every": "Täglich",
    "open": "GEÖFFNET",
    "closed": "GESCHLOSSEN",
    "open_now": "Jetzt geöffnet",
    "opens_today": "Öffnet heute um 09:30",
    "opens_tomorrow": "Öffnet morgen um 09:30",
    "checking": "Wird geprüft",
    "local_time": "Ortszeit auf Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "In Karten öffnen"
  },
  "fr": {
    "interactive": "Carte interactive",
    "larger": "Agrandir la carte",
    "location": "Localisation",
    "find": "Retrouvez-nous à Magaluf",
    "description": "Rendez-vous à notre point de retrait à Magaluf. Accès facile et remise rapide avant votre balade.",
    "every": "Tous les jours",
    "open": "OUVERT",
    "closed": "FERMÉ",
    "open_now": "Ouvert maintenant",
    "opens_today": "Ouvre aujourd’hui à 09:30",
    "opens_tomorrow": "Ouvre demain à 09:30",
    "checking": "Vérification",
    "local_time": "Heure locale à Majorque :",
    "mallorca": "Majorque :",
    "maps": "Ouvrir dans Plans"
  },
  "it": {
    "interactive": "Mappa interattiva",
    "larger": "Ingrandisci mappa",
    "location": "Posizione",
    "find": "Vieni a trovarci a Magaluf",
    "description": "Visita il nostro punto di ritiro a Magaluf. Indicazioni semplici e consegna rapida prima della partenza.",
    "every": "Ogni giorno",
    "open": "APERTO",
    "closed": "CHIUSO",
    "open_now": "Aperto ora",
    "opens_today": "Apre oggi alle 09:30",
    "opens_tomorrow": "Apre domani alle 09:30",
    "checking": "Verifica in corso",
    "local_time": "Ora locale a Maiorca:",
    "mallorca": "Maiorca:",
    "maps": "Apri nelle mappe"
  },
  "nl": {
    "interactive": "Interactieve kaart",
    "larger": "Grotere kaart bekijken",
    "location": "Locatie",
    "find": "Vind ons in Magaluf",
    "description": "Bezoek ons afhaalpunt in Magaluf. Eenvoudige route en snelle overdracht voor vertrek.",
    "every": "Elke dag",
    "open": "OPEN",
    "closed": "GESLOTEN",
    "open_now": "Nu geopend",
    "opens_today": "Opent vandaag om 09:30",
    "opens_tomorrow": "Opent morgen om 09:30",
    "checking": "Controleren",
    "local_time": "Lokale tijd op Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "Openen in kaarten"
  },
  "pl": {
    "interactive": "Mapa interaktywna",
    "larger": "Powiększ mapę",
    "location": "Lokalizacja",
    "find": "Znajdź nas w Magaluf",
    "description": "Odwiedź nasz punkt odbioru w Magaluf. Łatwy dojazd i szybki odbiór przed wycieczką.",
    "every": "Codziennie",
    "open": "OTWARTE",
    "closed": "ZAMKNIĘTE",
    "open_now": "Teraz otwarte",
    "opens_today": "Otwarcie dziś o 09:30",
    "opens_tomorrow": "Otwarcie jutro o 09:30",
    "checking": "Sprawdzanie",
    "local_time": "Czas lokalny na Majorce:",
    "mallorca": "Majorka:",
    "maps": "Otwórz w mapach"
  },
  "sv": {
    "interactive": "Interaktiv karta",
    "larger": "Visa större karta",
    "location": "Plats",
    "find": "Hitta oss i Magaluf",
    "description": "Besök vår upphämtningsplats i Magaluf. Enkel vägbeskrivning och snabb överlämning före turen.",
    "every": "Varje dag",
    "open": "ÖPPET",
    "closed": "STÄNGT",
    "open_now": "Öppet nu",
    "opens_today": "Öppnar idag kl. 09:30",
    "opens_tomorrow": "Öppnar imorgon kl. 09:30",
    "checking": "Kontrollerar",
    "local_time": "Lokal tid på Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "Öppna i kartor"
  },
  "da": {
    "interactive": "Interaktivt kort",
    "larger": "Vis større kort",
    "location": "Placering",
    "find": "Find os i Magaluf",
    "description": "Besøg vores afhentningssted i Magaluf. Nem rutevejledning og hurtig udlevering før turen.",
    "every": "Hver dag",
    "open": "ÅBENT",
    "closed": "LUKKET",
    "open_now": "Åbent nu",
    "opens_today": "Åbner i dag kl. 09:30",
    "opens_tomorrow": "Åbner i morgen kl. 09:30",
    "checking": "Tjekker",
    "local_time": "Lokal tid på Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "Åbn i kort"
  },
  "no": {
    "interactive": "Interaktivt kart",
    "larger": "Vis større kart",
    "location": "Beliggenhet",
    "find": "Finn oss i Magaluf",
    "description": "Besøk hentestedet vårt i Magaluf. Enkel veibeskrivelse og rask utlevering før turen.",
    "every": "Hver dag",
    "open": "ÅPENT",
    "closed": "STENGT",
    "open_now": "Åpent nå",
    "opens_today": "Åpner i dag kl. 09:30",
    "opens_tomorrow": "Åpner i morgen kl. 09:30",
    "checking": "Sjekker",
    "local_time": "Lokal tid på Mallorca:",
    "mallorca": "Mallorca:",
    "maps": "Åpne i kart"
  },
  "pt": {
    "interactive": "Mapa interativo",
    "larger": "Ver mapa maior",
    "location": "Localização",
    "find": "Encontre-nos em Magaluf",
    "description": "Visite o nosso ponto de recolha em Magaluf. Indicações simples e entrega rápida antes do passeio.",
    "every": "Todos os dias",
    "open": "ABERTO",
    "closed": "FECHADO",
    "open_now": "Aberto agora",
    "opens_today": "Abre hoje às 09:30",
    "opens_tomorrow": "Abre amanhã às 09:30",
    "checking": "A verificar",
    "local_time": "Hora local em Maiorca:",
    "mallorca": "Maiorca:",
    "maps": "Abrir nos mapas"
  },
  "cs": {
    "interactive": "Interaktivní mapa",
    "larger": "Zobrazit větší mapu",
    "location": "Poloha",
    "find": "Najdete nás v Magalufu",
    "description": "Navštivte naše výdejní místo v Magalufu. Snadná cesta a rychlé předání před jízdou.",
    "every": "Každý den",
    "open": "OTEVŘENO",
    "closed": "ZAVŘENO",
    "open_now": "Právě otevřeno",
    "opens_today": "Dnes otevírá v 09:30",
    "opens_tomorrow": "Zítra otevírá v 09:30",
    "checking": "Ověřujeme",
    "local_time": "Místní čas na Mallorce:",
    "mallorca": "Mallorca:",
    "maps": "Otevřít v mapách"
  },
  "uk": {
    "interactive": "Інтерактивна карта",
    "larger": "Збільшити карту",
    "location": "Розташування",
    "find": "Знайдіть нас у Магалуфі",
    "description": "Відвідайте наш пункт видачі в Магалуфі. Зручний маршрут і швидка видача перед поїздкою.",
    "every": "Щодня",
    "open": "ВІДЧИНЕНО",
    "closed": "ЗАЧИНЕНО",
    "open_now": "Зараз відчинено",
    "opens_today": "Відкривається сьогодні о 09:30",
    "opens_tomorrow": "Відкривається завтра о 09:30",
    "checking": "Перевіряємо",
    "local_time": "Місцевий час на Майорці:",
    "mallorca": "Майорка:",
    "maps": "Відкрити на карті"
  }
};

function getLocationLocale(value: string): Locale { const code = value.toLowerCase().split("-")[0]; return ["en", "es", "de", "fr", "it", "nl", "pl", "sv", "da", "no", "pt", "cs", "uk"] .includes(code) ? code as Locale : "en"; }

type OpenStatus = {
  isOpen: boolean;
  label: string;
  subLabel: string;
  localTime: string;
};

const ADDRESS = "C. Galeón, 13, Loc 57, 07181 Magaluf, Balearic Islands";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands&z=17&output=embed";

function getMadridTimeStatus(copy: typeof LOCATION_COPY["en"]): OpenStatus {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0"
  );

  const totalMinutes = hour * 60 + minute;

  const isOpen = totalMinutes >= 9 * 60 + 30 && totalMinutes < 13 * 60 + 30;

  let subLabel = copy.open_now;

  if (!isOpen) {
    subLabel = totalMinutes < 9 * 60 + 30
      ? copy.opens_today
      : copy.opens_tomorrow;
  }

  return {
    isOpen,
    label: isOpen ? copy.open : copy.closed,
    subLabel,
    localTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`,
  };
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M9 18.5L3.75 21V6L9 3.5M9 18.5L15 21M9 18.5V3.5M15 21L20.25 18.5V3.5L15 6M15 21V6M15 6L9 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12 21s7-5.25 7-11a7 7 0 1 0-14 0c0 5.75 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5v5l3.25 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LocationV3() {
  const locale = getLocationLocale(useLocale());
  const copy = LOCATION_COPY[locale];
  const [status, setStatus] = useState<OpenStatus | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getMadridTimeStatus(copy));
    };

    updateStatus();

    const interval = window.setInterval(updateStatus, 30 * 1000);

    return () => window.clearInterval(interval);
  }, [copy]);

  const statusClasses = useMemo(() => {
    if (!status) return "border-white/15 bg-white/[0.04] text-white";

    return status.isOpen
      ? "border-emerald-400/35 bg-emerald-400/[0.09] text-emerald-300"
      : "border-red-400/35 bg-red-400/[0.09] text-red-300";
  }, [status]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    section.style.setProperty("--nexa-x", `${event.clientX - rect.left}px`);
    section.style.setProperty("--nexa-y", `${event.clientY - rect.top}px`);
    section.classList.add("nexa-location-cursor-active");
  };

  const handleMouseLeave = () => {
    sectionRef.current?.classList.remove("nexa-location-cursor-active");
  };

  return (
    <section
      ref={sectionRef}
      id="location"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${montserrat.className} relative isolate overflow-hidden bg-black px-5 py-8 text-white sm:px-7 lg:px-8`}
    >
      <div className="pointer-events-none absolute inset-0 -z-30 bg-black" />

      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_48%_0%,rgba(255,255,255,0.05),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_45%)]" />

      <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="nexa-cursor-story pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300">
        <div className="absolute left-[-5%] top-[5%] rotate-[-7deg] text-[clamp(26px,4.7vw,62px)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.10]">
          Scooter Rental
        </div>

        <div className="absolute right-[-6%] top-[36%] rotate-[6deg] text-[clamp(24px,4.3vw,56px)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.08]">
          Magaluf Pickup
        </div>

        <div className="absolute bottom-[6%] left-[8%] text-[clamp(24px,4.3vw,56px)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.075]">
          NEXA Rentals
        </div>

        <div className="absolute inset-0 opacity-45 [background-image:radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1.5px)] [background-size:24px_24px]" />
      </div>

      {/* DESKTOP / TABLET ORIGINAL LAYOUT */}
      <div className="nexa-location-desktop-layout relative mx-auto grid max-w-[920px] items-center gap-5 lg:grid-cols-[0.95fr_0.86fr] lg:gap-7">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.025] p-1.5 shadow-[0_18px_46px_rgba(0,0,0,0.48)]">
            <div className="relative overflow-hidden rounded-[13px] border border-white/10 bg-white">
              <iframe
                title="NEXA Rentals Magaluf location map"
                src={GOOGLE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[210px] w-full sm:h-[220px] lg:h-[240px]"
                style={{
                  border: 0,
                  filter: "brightness(1.05) contrast(0.98) saturate(1.08)",
                }}
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-0 rounded-[13px] shadow-[inset_0_0_18px_rgba(255,255,255,0.28),inset_0_0_10px_rgba(0,0,0,0.04)]" />

              <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-black/75 shadow-[0_8px_22px_rgba(0,0,0,0.12)] backdrop-blur-md">
                {copy.interactive}
              </div>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-3 rounded-full border border-black/10 bg-white/92 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-black/78 shadow-[0_8px_22px_rgba(0,0,0,0.14)] backdrop-blur-md transition duration-300 hover:scale-[1.05] hover:bg-black hover:text-white"
              >
                {copy.larger}
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-3">
            <div className="mb-2 text-[8px] font-black uppercase tracking-[0.48em] text-white/50">
              {copy.location}
            </div>

            <h2 className="max-w-[460px] text-[30px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[36px] lg:text-[40px]">
              {copy.find}
            </h2>

            <div className="mt-3 h-px w-12 bg-white/52" />

            <p className="mt-3 max-w-[430px] text-[12.5px] font-medium leading-[1.7] tracking-[-0.02em] text-white/68">
              {copy.description}
            </p>
          </div>

          <div className="flex items-start gap-2.5 border-b border-white/10 pb-3">
            <div className="mt-0.5 text-white/78">
              <LocationIcon />
            </div>

            <p className="max-w-[430px] text-[12.5px] font-medium leading-[1.55] tracking-[-0.02em] text-white/78">
              {ADDRESS}
            </p>
          </div>

          <div className="grid gap-3 border-b border-white/10 py-3 md:grid-cols-[0.95fr_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[14px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[15px]">
                  09:30 – 13:30
                </div>

                <div className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/38">
                  {copy.every}
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-white/10 md:pl-4">
              <div
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] ${statusClasses}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? copy.checking}
              </div>

              <div className="mt-1.5 text-[11px] font-semibold text-white/72">
                {status?.subLabel ?? copy.checking}
              </div>

              <div className="mt-0.5 text-[10px] text-white/34">
                {copy.local_time} {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>

          <a
            href={GOOGLE_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="nexa-location-pulse group mt-4 flex w-full items-center justify-between rounded-[14px] bg-white px-4 py-3.5 text-black shadow-[0_0_30px_rgba(255,255,255,0.22)] transition duration-300 hover:bg-neutral-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-125">
                <MapIcon />
              </span>

              <span className="text-[14px] font-black tracking-[-0.035em] sm:text-[16px]">
                {copy.maps}
              </span>
            </span>

            <span className="text-2xl font-light leading-none transition duration-300 group-hover:translate-x-1.5">
              ›
            </span>
          </a>
        </div>
      </div>

      {/* MOBILE ONLY COMPACT LAYOUT */}
      <div className="nexa-location-mobile-layout relative mx-auto hidden w-full max-w-[430px]">
        <div className="nexa-location-mobile-top">
          <div className="nexa-location-mobile-map">
            <div className="relative h-full w-full overflow-hidden rounded-[15px] border border-white/12 bg-white p-[2px] shadow-[0_14px_34px_rgba(0,0,0,0.48)]">
              <div className="relative h-full w-full overflow-hidden rounded-[13px] bg-white">
                <iframe
                  title="NEXA Rentals Magaluf location map mobile"
                  src={GOOGLE_MAP_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                  style={{
                    border: 0,
                    filter: "brightness(1.05) contrast(0.98) saturate(1.08)",
                  }}
                  allowFullScreen
                />

                <div className="pointer-events-none absolute inset-0 rounded-[13px] shadow-[inset_0_0_16px_rgba(255,255,255,0.25),inset_0_0_8px_rgba(0,0,0,0.08)]" />

                <div className="pointer-events-none absolute left-[7px] top-[7px] rounded-full border border-black/10 bg-white/90 px-[7px] py-[4px] text-[5.8px] font-black uppercase tracking-[0.15em] text-black/75 shadow-[0_8px_20px_rgba(0,0,0,0.12)] backdrop-blur-md">
                  {copy.interactive}
                </div>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-[7px] left-[7px] rounded-full border border-black/10 bg-white/92 px-[7px] py-[4px] text-[5.8px] font-black uppercase tracking-[0.12em] text-black/78 shadow-[0_8px_20px_rgba(0,0,0,0.14)] backdrop-blur-md"
                >
                  {copy.larger}
                </a>
              </div>
            </div>
          </div>

          <div className="nexa-location-mobile-info">
            <div className="text-[6px] font-black uppercase tracking-[0.35em] text-white/42">
              {copy.location}
            </div>

            <h2 className="mt-[5px] text-[21px] font-black leading-[0.94] tracking-[-0.07em] text-white">
              {copy.find}
            </h2>

            <div className="mt-[8px] h-px w-[32px] bg-white/45" />

            <div className="mt-[9px] flex items-start gap-[7px]">
              <div className="mt-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[11px] font-bold leading-[1.08] tracking-[-0.04em] text-white">
                  09:30 – 13:30
                </div>

                <div className="mt-[4px] text-[6px] font-black uppercase tracking-[0.16em] text-white/35">
                  {copy.every}
                </div>
              </div>
            </div>

            <div className="mt-[10px]">
              <div
                className={`inline-flex items-center gap-[5px] rounded-[7px] border px-[7px] py-[4px] text-[6.5px] font-black uppercase tracking-[0.15em] ${statusClasses}`}
              >
                <span
                  className={`h-[5px] w-[5px] rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? copy.checking}
              </div>

              <div className="mt-[5px] text-[8px] font-semibold leading-[1.25] text-white/70">
                {status?.subLabel ?? copy.checking}
              </div>

              <div className="mt-[2px] text-[7px] leading-[1.25] text-white/34">
                {copy.mallorca} {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>
        </div>

        <a
          href={GOOGLE_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="nexa-location-pulse group mt-[13px] flex w-full items-center justify-between rounded-[13px] bg-white px-[13px] py-[11px] text-black shadow-[0_0_26px_rgba(255,255,255,0.22)] transition duration-300 hover:bg-neutral-100"
        >
          <span className="flex items-center gap-[9px]">
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-110">
              <MapIcon />
            </span>

            <span className="text-[12px] font-black tracking-[-0.035em]">
              {copy.maps}
            </span>
          </span>

          <span className="text-[22px] font-light leading-none transition duration-300 group-hover:translate-x-1.5">
            ›
          </span>
        </a>
      </div>

      <style jsx global>{`
        .nexa-location-cursor-active .nexa-cursor-story {
          opacity: 1;
        }

        .nexa-cursor-story {
          -webkit-mask-image: radial-gradient(
            circle 155px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.82) 34%,
            rgba(0, 0, 0, 0.18) 58%,
            transparent 75%
          );
          mask-image: radial-gradient(
            circle 155px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.82) 34%,
            rgba(0, 0, 0, 0.18) 58%,
            transparent 75%
          );
        }

        .nexa-location-mobile-layout {
          display: none;
        }

        @keyframes nexaLocationPulse {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 22px rgba(255, 255, 255, 0.18),
              0 12px 30px rgba(0, 0, 0, 0.28);
          }

          10% {
            transform: scale(1.065);
            box-shadow:
              0 0 72px rgba(255, 255, 255, 0.42),
              0 18px 48px rgba(0, 0, 0, 0.38);
          }

          20% {
            transform: scale(1);
            box-shadow:
              0 0 26px rgba(255, 255, 255, 0.2),
              0 12px 30px rgba(0, 0, 0, 0.28);
          }

          32% {
            transform: scale(1.04);
            box-shadow:
              0 0 58px rgba(255, 255, 255, 0.34),
              0 18px 44px rgba(0, 0, 0, 0.36);
          }

          46% {
            transform: scale(1);
          }

          100% {
            transform: scale(1);
          }
        }

        .nexa-location-pulse {
          position: relative;
          overflow: hidden;
          animation: nexaLocationPulse 1.15s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .nexa-location-pulse::after {
          content: "";
          position: absolute;
          inset: -70% auto -70% -55%;
          width: 38%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.98),
            transparent
          );
          opacity: 0.9;
          animation: nexaLocationShine 1.65s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes nexaLocationShine {
          0% {
            left: -55%;
          }

          50%,
          100% {
            left: 130%;
          }
        }

        .nexa-location-pulse:hover {
          animation-play-state: paused;
          transform: scale(1.045);
          box-shadow:
            0 0 80px rgba(255, 255, 255, 0.42),
            0 24px 64px rgba(0, 0, 0, 0.44);
        }

        .nexa-location-pulse:active {
          transform: scale(0.96);
        }

        @media (max-width: 767px) {
          #location {
            padding: 22px 12px 28px !important;
          }

          .nexa-location-desktop-layout {
            display: none !important;
          }

          .nexa-location-mobile-layout {
            display: block !important;
          }

          .nexa-location-mobile-top {
            display: grid !important;
            grid-template-columns: 44% 1fr !important;
            align-items: stretch !important;
            gap: 12px !important;
          }

          .nexa-location-mobile-map {
            height: 184px !important;
            min-width: 0 !important;
          }

          .nexa-location-mobile-info {
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding-bottom: 2px !important;
          }

          .nexa-cursor-story {
            display: none !important;
          }
        }

        @media (max-width: 390px) {
          .nexa-location-mobile-top {
            grid-template-columns: 42% 1fr !important;
            gap: 10px !important;
          }

          .nexa-location-mobile-map {
            height: 176px !important;
          }
        }

        @media (max-width: 350px) {
          .nexa-location-mobile-top {
            grid-template-columns: 40% 1fr !important;
            gap: 9px !important;
          }

          .nexa-location-mobile-map {
            height: 168px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-location-pulse,
          .nexa-location-pulse::after {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}