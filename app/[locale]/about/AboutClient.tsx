"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const pageFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type Locale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "it"
  | "pt"
  | "sv"
  | "nl"
  | "pl"
  | "da"
  | "no"
  | "cs"
  | "uk";

type CopyLocale = "en" | "es" | "de" | "fr" | "it" | "pt" | "sv";

type AboutCopy = {
  hero: {
    title: string;
    intro: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
  };
  facts: {
    label: string;
    value: string;
  }[];
  story: {
    eyebrow: string;
    title: string;
    text: string;
  };
  sections: {
    eyebrow: string;
    title: string;
    text: string;
  }[];
  finalCta: {
    eyebrow: string;
    title: string;
    text: string;
    button: string;
  };
};

const LANGUAGES: {
  code: Locale;
  label: string;
  short: string;
  flagSrc: string;
}[] = [
  { code: "en", label: "English", short: "EN", flagSrc: "/images/en.png" },
  { code: "es", label: "Español", short: "ES", flagSrc: "/images/es.png" },
  { code: "de", label: "Deutsch", short: "DE", flagSrc: "/images/de.png" },
  { code: "fr", label: "Français", short: "FR", flagSrc: "/images/fr.png" },
  { code: "it", label: "Italiano", short: "IT", flagSrc: "/images/it.png" },
  { code: "nl", label: "Nederlands", short: "NL", flagSrc: "/images/NL.png" },
  { code: "pl", label: "Polski", short: "PL", flagSrc: "/images/PL.png" },
  { code: "sv", label: "Svenska", short: "SV", flagSrc: "/images/sv.png" },
  { code: "da", label: "Dansk", short: "DA", flagSrc: "/images/DA.png" },
  { code: "no", label: "Norsk", short: "NO", flagSrc: "/images/NO.png" },
  { code: "pt", label: "Português", short: "PT", flagSrc: "/images/pt.png" },
  { code: "cs", label: "Čeština", short: "CS", flagSrc: "/images/CS.png" },
  { code: "uk", label: "Українська", short: "UK", flagSrc: "/images/UK.png" },
];

function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && LANGUAGES.some((language) => language.code === value));
}

function getSafeLocale(locale: string): CopyLocale {
  return ["en", "es", "de", "fr", "it", "pt", "sv"].includes(locale)
    ? (locale as CopyLocale)
    : "en";
}

function getLocaleFromPath(pathname: string): Locale {
  const firstPart = pathname.split("/").filter(Boolean)[0];

  if (isLocale(firstPart)) return firstPart;

  return "en";
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  const firstPart = parts[0];

  if (isLocale(firstPart)) {
    parts[0] = nextLocale;
    return `/${parts.join("/")}`;
  }

  return `/${nextLocale}${pathname === "/" ? "" : pathname}`;
}

const COPY: Record<CopyLocale, AboutCopy> = {
  en: {
    hero: {
      title: "Mallorca mobility, made simple.",
      intro:
        "NEXA Rentals is a scooter and electric bicycle rental company based in Magaluf, Mallorca.",
      text:
        "Founded in 2026 as the rebrand of a previous rental company, NEXA Rentals was created to build a cleaner, clearer and more premium local mobility experience for visitors who want to explore Mallorca with freedom.",
      primaryCta: "Start Booking",
      secondaryCta: "Contact Us",
    },
    facts: [
      { label: "Founded", value: "2026" },
      { label: "Location", value: "Magaluf, Mallorca" },
      { label: "Mobility", value: "Scooters & electric bicycles" },
      { label: "Booking", value: "Online reservations" },
    ],
    story: {
      eyebrow: "OUR STORY",
      title: "A local rental brand rebuilt for a better customer experience.",
      text:
        "NEXA Rentals was created to give visitors a simple way to move around Mallorca without confusion. The idea is clear: simple booking, clear prices, clean vehicles, useful equipment and a professional pickup experience in Magaluf.",
    },
    sections: [
      {
        eyebrow: "WHAT WE DO",
        title: "Scooter and e-bike rentals for Mallorca visitors.",
        text:
          "We offer 125cc scooters and electric bicycles for customers who want to explore beaches, viewpoints, villages and coastal roads with more freedom.",
      },
      {
        eyebrow: "WHY NEXA",
        title: "Simple booking. Clear rules. Premium presentation.",
        text:
          "The rental process is designed to feel easy from the first click. Customers can check the details, book online, arrive at the office and start their ride with everything explained clearly.",
      },
      {
        eyebrow: "LOCAL FOCUS",
        title: "Built in Magaluf, made for Mallorca.",
        text:
          "Our goal is to grow a reliable local mobility service that helps visitors move around the island in a smarter, cleaner and more comfortable way.",
      },
    ],
    finalCta: {
      eyebrow: "READY TO RIDE?",
      title: "Book your ride with NEXA Rentals.",
      text:
        "Reserve online and enjoy a clean, simple and reliable way to explore Magaluf and Mallorca.",
      button: "Start Booking",
    },
  },

  es: {
    hero: {
      title: "Movilidad en Mallorca, hecha simple.",
      intro:
        "NEXA Rentals es una empresa de alquiler de scooters y bicicletas eléctricas ubicada en Magaluf, Mallorca.",
      text:
        "Fundada en 2026 como el rebranding de una empresa de alquiler anterior, NEXA Rentals fue creada para construir una experiencia de movilidad local más limpia, clara y premium para visitantes que quieren explorar Mallorca con libertad.",
      primaryCta: "Empezar reserva",
      secondaryCta: "Contacto",
    },
    facts: [
      { label: "Fundada", value: "2026" },
      { label: "Ubicación", value: "Magaluf, Mallorca" },
      { label: "Movilidad", value: "Scooters y bicicletas eléctricas" },
      { label: "Reserva", value: "Reservas online" },
    ],
    story: {
      eyebrow: "NUESTRA HISTORIA",
      title: "Una marca local renovada para una mejor experiencia.",
      text:
        "NEXA Rentals fue creada para ofrecer a los visitantes una forma sencilla de moverse por Mallorca sin confusión. La idea es clara: reserva simple, precios claros, vehículos limpios, equipamiento útil y una recogida profesional en Magaluf.",
    },
    sections: [
      {
        eyebrow: "QUÉ HACEMOS",
        title: "Alquiler de scooters y e-bikes para visitantes de Mallorca.",
        text:
          "Ofrecemos scooters 125cc y bicicletas eléctricas para clientes que quieren explorar playas, miradores, pueblos y carreteras de costa con más libertad.",
      },
      {
        eyebrow: "POR QUÉ NEXA",
        title: "Reserva simple. Reglas claras. Presentación premium.",
        text:
          "El proceso está diseñado para ser fácil desde el primer clic. El cliente puede ver los detalles, reservar online, venir a la oficina y empezar su ruta con todo explicado claramente.",
      },
      {
        eyebrow: "ENFOQUE LOCAL",
        title: "Nacida en Magaluf, hecha para Mallorca.",
        text:
          "Nuestro objetivo es hacer crecer un servicio local de movilidad fiable que ayude a los visitantes a moverse por la isla de una forma más cómoda, limpia y clara.",
      },
    ],
    finalCta: {
      eyebrow: "¿LISTO PARA CONDUCIR?",
      title: "Reserva tu vehículo con NEXA Rentals.",
      text:
        "Reserva online y disfruta de una forma limpia, simple y fiable de explorar Magaluf y Mallorca.",
      button: "Empezar reserva",
    },
  },

  de: {
    hero: {
      title: "Mobilität auf Mallorca, einfach gemacht.",
      intro:
        "NEXA Rentals ist ein Verleih für Scooter und elektrische Fahrräder in Magaluf, Mallorca.",
      text:
        "Gegründet im Jahr 2026 als Rebranding eines früheren Verleihunternehmens, wurde NEXA Rentals geschaffen, um Besuchern eine klarere, sauberere und hochwertigere lokale Mobilitätserfahrung auf Mallorca zu bieten.",
      primaryCta: "Buchung starten",
      secondaryCta: "Kontakt",
    },
    facts: [
      { label: "Gegründet", value: "2026" },
      { label: "Standort", value: "Magaluf, Mallorca" },
      { label: "Mobilität", value: "Scooter & elektrische Fahrräder" },
      { label: "Buchung", value: "Online-Reservierung" },
    ],
    story: {
      eyebrow: "UNSERE GESCHICHTE",
      title: "Eine lokale Mietmarke, neu aufgebaut für ein besseres Erlebnis.",
      text:
        "NEXA Rentals wurde geschaffen, um Besuchern eine einfache Möglichkeit zu geben, Mallorca ohne Verwirrung zu erkunden. Die Idee ist klar: einfache Buchung, klare Preise, saubere Fahrzeuge, nützliches Zubehör und eine professionelle Abholung in Magaluf.",
    },
    sections: [
      {
        eyebrow: "WAS WIR MACHEN",
        title: "Scooter- und E-Bike-Verleih für Mallorca-Besucher.",
        text:
          "Wir bieten 125cc Scooter und elektrische Fahrräder für Kunden, die Strände, Aussichtspunkte, Dörfer und Küstenstraßen flexibel entdecken möchten.",
      },
      {
        eyebrow: "WARUM NEXA",
        title: "Einfache Buchung. Klare Regeln. Premium-Präsentation.",
        text:
          "Der Mietprozess ist vom ersten Klick an einfach gestaltet. Kunden können Details prüfen, online buchen, ins Büro kommen und mit klaren Informationen starten.",
      },
      {
        eyebrow: "LOKALER FOKUS",
        title: "In Magaluf aufgebaut, für Mallorca gemacht.",
        text:
          "Unser Ziel ist es, einen zuverlässigen lokalen Mobilitätsservice aufzubauen, der Besuchern hilft, sich komfortabler und klarer auf der Insel zu bewegen.",
      },
    ],
    finalCta: {
      eyebrow: "BEREIT ZU FAHREN?",
      title: "Buche deine Fahrt mit NEXA Rentals.",
      text:
        "Reserviere online und genieße eine einfache, saubere und zuverlässige Art, Magaluf und Mallorca zu entdecken.",
      button: "Buchung starten",
    },
  },

  fr: {
    hero: {
      title: "La mobilité à Majorque, simplement.",
      intro:
        "NEXA Rentals est une entreprise de location de scooters et de vélos électriques basée à Magaluf, Majorque.",
      text:
        "Fondée en 2026 comme rebranding d’une ancienne entreprise de location, NEXA Rentals a été créée pour offrir une expérience de mobilité locale plus claire, plus propre et plus premium aux visiteurs qui veulent explorer Majorque librement.",
      primaryCta: "Commencer la réservation",
      secondaryCta: "Contact",
    },
    facts: [
      { label: "Fondée", value: "2026" },
      { label: "Lieu", value: "Magaluf, Majorque" },
      { label: "Mobilité", value: "Scooters et vélos électriques" },
      { label: "Réservation", value: "Réservations en ligne" },
    ],
    story: {
      eyebrow: "NOTRE HISTOIRE",
      title: "Une marque locale repensée pour une meilleure expérience.",
      text:
        "NEXA Rentals a été créée pour offrir aux visiteurs une façon simple de se déplacer à Majorque sans confusion. L’idée est claire : réservation simple, prix clairs, véhicules propres, équipement utile et retrait professionnel à Magaluf.",
    },
    sections: [
      {
        eyebrow: "CE QUE NOUS FAISONS",
        title: "Location de scooters et e-bikes pour visiteurs à Majorque.",
        text:
          "Nous proposons des scooters 125cc et des vélos électriques pour explorer plages, points de vue, villages et routes côtières avec plus de liberté.",
      },
      {
        eyebrow: "POURQUOI NEXA",
        title: "Réservation simple. Règles claires. Présentation premium.",
        text:
          "Le processus est conçu pour être facile dès le premier clic. Les clients peuvent voir les détails, réserver en ligne, venir au bureau et commencer avec des informations claires.",
      },
      {
        eyebrow: "FOCUS LOCAL",
        title: "Créée à Magaluf, pensée pour Majorque.",
        text:
          "Notre objectif est de développer un service de mobilité local fiable qui aide les visiteurs à se déplacer sur l’île de façon plus confortable et plus claire.",
      },
    ],
    finalCta: {
      eyebrow: "PRÊT À ROULER ?",
      title: "Réservez votre trajet avec NEXA Rentals.",
      text:
        "Réservez en ligne et profitez d’une façon simple, propre et fiable d’explorer Magaluf et Majorque.",
      button: "Commencer la réservation",
    },
  },

  it: {
    hero: {
      title: "Mobilità a Maiorca, resa semplice.",
      intro:
        "NEXA Rentals è un’azienda di noleggio scooter e biciclette elettriche con sede a Magaluf, Maiorca.",
      text:
        "Fondata nel 2026 come rebranding di una precedente azienda di noleggio, NEXA Rentals è stata creata per offrire ai visitatori un’esperienza di mobilità locale più chiara, pulita e premium.",
      primaryCta: "Inizia prenotazione",
      secondaryCta: "Contatto",
    },
    facts: [
      { label: "Fondata", value: "2026" },
      { label: "Posizione", value: "Magaluf, Maiorca" },
      { label: "Mobilità", value: "Scooter e biciclette elettriche" },
      { label: "Prenotazione", value: "Prenotazioni online" },
    ],
    story: {
      eyebrow: "LA NOSTRA STORIA",
      title: "Un brand locale ricostruito per una migliore esperienza.",
      text:
        "NEXA Rentals è stata creata per dare ai visitatori un modo semplice di muoversi a Maiorca senza confusione. L’idea è chiara: prenotazione semplice, prezzi trasparenti, veicoli puliti, accessori utili e ritiro professionale a Magaluf.",
    },
    sections: [
      {
        eyebrow: "COSA FACCIAMO",
        title: "Noleggio scooter ed e-bike per visitatori a Maiorca.",
        text:
          "Offriamo scooter 125cc e biciclette elettriche per esplorare spiagge, punti panoramici, villaggi e strade costiere con più libertà.",
      },
      {
        eyebrow: "PERCHÉ NEXA",
        title: "Prenotazione semplice. Regole chiare. Presentazione premium.",
        text:
          "Il processo è pensato per essere facile dal primo clic. I clienti possono controllare i dettagli, prenotare online, venire in ufficio e iniziare con tutto spiegato chiaramente.",
      },
      {
        eyebrow: "FOCUS LOCALE",
        title: "Nata a Magaluf, fatta per Maiorca.",
        text:
          "Il nostro obiettivo è far crescere un servizio locale di mobilità affidabile che aiuti i visitatori a muoversi sull’isola in modo più comodo e chiaro.",
      },
    ],
    finalCta: {
      eyebrow: "PRONTO A PARTIRE?",
      title: "Prenota il tuo mezzo con NEXA Rentals.",
      text:
        "Prenota online e goditi un modo semplice, pulito e affidabile per esplorare Magaluf e Maiorca.",
      button: "Inizia prenotazione",
    },
  },

  pt: {
    hero: {
      title: "Mobilidade em Maiorca, de forma simples.",
      intro:
        "A NEXA Rentals é uma empresa de aluguer de scooters e bicicletas elétricas em Magaluf, Maiorca.",
      text:
        "Fundada em 2026 como rebranding de uma empresa de aluguer anterior, a NEXA Rentals foi criada para oferecer uma experiência de mobilidade local mais clara, limpa e premium aos visitantes.",
      primaryCta: "Começar reserva",
      secondaryCta: "Contacto",
    },
    facts: [
      { label: "Fundada", value: "2026" },
      { label: "Localização", value: "Magaluf, Maiorca" },
      { label: "Mobilidade", value: "Scooters e bicicletas elétricas" },
      { label: "Reserva", value: "Reservas online" },
    ],
    story: {
      eyebrow: "A NOSSA HISTÓRIA",
      title: "Uma marca local reconstruída para uma melhor experiência.",
      text:
        "A NEXA Rentals foi criada para dar aos visitantes uma forma simples de se moverem por Maiorca sem confusão. A ideia é clara: reserva simples, preços transparentes, veículos limpos, equipamento útil e levantamento profissional em Magaluf.",
    },
    sections: [
      {
        eyebrow: "O QUE FAZEMOS",
        title: "Aluguer de scooters e e-bikes para visitantes em Maiorca.",
        text:
          "Oferecemos scooters 125cc e bicicletas elétricas para explorar praias, miradouros, vilas e estradas costeiras com mais liberdade.",
      },
      {
        eyebrow: "PORQUÊ NEXA",
        title: "Reserva simples. Regras claras. Apresentação premium.",
        text:
          "O processo foi pensado para ser fácil desde o primeiro clique. Os clientes podem ver os detalhes, reservar online, vir ao escritório e começar com tudo explicado claramente.",
      },
      {
        eyebrow: "FOCO LOCAL",
        title: "Criada em Magaluf, feita para Maiorca.",
        text:
          "O nosso objetivo é fazer crescer um serviço local de mobilidade fiável que ajude os visitantes a deslocarem-se pela ilha de forma mais confortável e clara.",
      },
    ],
    finalCta: {
      eyebrow: "PRONTO PARA CONDUZIR?",
      title: "Reserve o seu veículo com a NEXA Rentals.",
      text:
        "Reserve online e desfrute de uma forma simples, limpa e fiável de explorar Magaluf e Maiorca.",
      button: "Começar reserva",
    },
  },

  sv: {
    hero: {
      title: "Mobilitet på Mallorca, gjort enkelt.",
      intro:
        "NEXA Rentals är ett uthyrningsföretag för scooters och elcyklar i Magaluf, Mallorca.",
      text:
        "NEXA Rentals grundades 2026 som en rebrand av ett tidigare uthyrningsföretag och skapades för att erbjuda besökare en tydligare, renare och mer premium lokal mobilitetsupplevelse.",
      primaryCta: "Starta bokning",
      secondaryCta: "Kontakt",
    },
    facts: [
      { label: "Grundat", value: "2026" },
      { label: "Plats", value: "Magaluf, Mallorca" },
      { label: "Mobilitet", value: "Scooters och elcyklar" },
      { label: "Bokning", value: "Onlinebokning" },
    ],
    story: {
      eyebrow: "VÅR HISTORIA",
      title: "Ett lokalt varumärke ombyggt för en bättre upplevelse.",
      text:
        "NEXA Rentals skapades för att ge besökare ett enkelt sätt att röra sig runt Mallorca utan förvirring. Idén är tydlig: enkel bokning, klara priser, rena fordon, användbar utrustning och professionell upphämtning i Magaluf.",
    },
    sections: [
      {
        eyebrow: "VAD VI GÖR",
        title: "Scooter- och elcykeluthyrning för besökare på Mallorca.",
        text:
          "Vi erbjuder 125cc scooters och elcyklar för kunder som vill utforska stränder, utsiktsplatser, byar och kustvägar med mer frihet.",
      },
      {
        eyebrow: "VARFÖR NEXA",
        title: "Enkel bokning. Tydliga regler. Premium presentation.",
        text:
          "Processen är gjord för att kännas enkel från första klicket. Kunder kan se detaljer, boka online, komma till kontoret och börja med tydlig information.",
      },
      {
        eyebrow: "LOKALT FOKUS",
        title: "Byggt i Magaluf, gjort för Mallorca.",
        text:
          "Vårt mål är att växa en pålitlig lokal mobilitetstjänst som hjälper besökare att röra sig runt ön på ett bekvämare och tydligare sätt.",
      },
    ],
    finalCta: {
      eyebrow: "REDO ATT KÖRA?",
      title: "Boka din resa med NEXA Rentals.",
      text:
        "Boka online och njut av ett enkelt, rent och pålitligt sätt att utforska Magaluf och Mallorca.",
      button: "Starta bokning",
    },
  },
};

export default function AboutClient() {
  const providerLocale = useLocale();
  const pathname = usePathname() || "/";
  const router = useRouter();

  const pathLocale = getLocaleFromPath(pathname);
  const locale: Locale = isLocale(providerLocale) ? providerLocale : pathLocale;
  const copyLocale = getSafeLocale(locale);
  const copy = COPY[copyLocale];

  const [langOpen, setLangOpen] = useState(false);

  const currentLanguage = useMemo(() => {
    return LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];
  }, [locale]);

  const bookingHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;
  const backHref = `/${locale}/home`;

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLangOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  function handleLanguageChange(nextLocale: Locale) {
    setLangOpen(false);

    const nextPath = replaceLocaleInPath(pathname, nextLocale);
    const queryString =
      typeof window !== "undefined" ? window.location.search : "";
    const finalPath = `${nextPath}${queryString}`;

    router.push(finalPath);

    window.setTimeout(() => {
      router.refresh();
    }, 50);
  }

  return (
    <>
      <main
        className={`${pageFont.className} min-h-screen bg-white text-[#26313d] selection:bg-black selection:text-white`}
        style={{ fontFamily: pageFont.style.fontFamily }}
      >
        <div className="fixed left-5 top-5 z-[100] md:left-8 md:top-8">
          <Link
            href={backHref}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 border border-[#26313d]/20 bg-white/90 px-5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#26313d] shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#26313d] hover:bg-[#26313d] hover:text-white"
          >
            <span className="text-lg leading-none">←</span>
            <span>Back</span>
          </Link>
        </div>

        <div className="fixed right-5 top-5 z-[100] md:right-8 md:top-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((current) => !current)}
              className="inline-flex min-h-[46px] min-w-[96px] items-center justify-center gap-2 border border-[#26313d]/20 bg-white/90 px-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#26313d] shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#26313d] hover:bg-white"
              aria-label="Select language"
              aria-expanded={langOpen}
            >
              <Image
                src={currentLanguage.flagSrc}
                alt={currentLanguage.label}
                width={18}
                height={18}
                className="rounded-full"
              />
              <span>{currentLanguage.short}</span>
              <span
                className={[
                  "text-[10px] transition-transform duration-300",
                  langOpen ? "rotate-180" : "rotate-0",
                ].join(" ")}
              >
                ▾
              </span>
            </button>

            <div
              className={[
                "absolute right-0 top-[calc(100%+10px)] z-[110] w-[245px] border border-[#26313d]/14 bg-white/95 p-2 text-[#26313d] shadow-[0_26px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-300",
                langOpen
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
              ].join(" ")}
            >
              <div className="px-3 pb-2 pt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#26313d]/42">
                Select language
              </div>

              <div className="max-h-[430px] overflow-y-auto">
                {LANGUAGES.map((language) => {
                  const active = language.code === locale;

                  return (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={[
                        "flex w-full items-center justify-between px-3 py-2.5 text-left transition active:scale-[0.98]",
                        active
                          ? "bg-[#26313d] text-white"
                          : "text-[#26313d]/72 hover:bg-[#26313d]/[0.06] hover:text-[#26313d]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <Image
                          src={language.flagSrc}
                          alt={language.label}
                          width={22}
                          height={22}
                          className="rounded-full shadow-[0_0_0_1px_rgba(38,49,61,0.12)]"
                        />
                        <span className="text-sm font-semibold">
                          {language.label}
                        </span>
                      </span>

                      <span
                        className={[
                          "text-[10px] font-extrabold uppercase tracking-[0.16em]",
                          active ? "text-white" : "text-[#26313d]/38",
                        ].join(" ")}
                      >
                        {active ? "Active" : language.short}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <section className="relative min-h-screen border-b border-[#26313d]/12 bg-white">
          <div className="mx-auto grid min-h-screen max-w-6xl gap-14 px-6 pb-16 pt-[88px] md:px-10 md:pb-24 md:pt-[104px] lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="max-w-4xl text-[42px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#26313d] sm:text-[56px] md:text-[72px]">
                {copy.hero.title}
              </h1>

              <p className="mt-7 max-w-3xl text-[18px] font-medium leading-8 tracking-[-0.01em] text-[#26313d]/82 md:text-[21px] md:leading-9">
                {copy.hero.intro}
              </p>

              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[#26313d]/68 md:text-[16px]">
                {copy.hero.text}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={bookingHref}
                  className="inline-flex min-h-[52px] items-center justify-center border border-[#26313d] bg-[#26313d] px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition duration-300 hover:bg-white hover:text-[#26313d]"
                >
                  {copy.hero.primaryCta}
                </Link>

                <Link
                  href={contactHref}
                  className="inline-flex min-h-[52px] items-center justify-center border border-[#26313d]/35 bg-white px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#26313d] transition duration-300 hover:border-[#26313d] hover:bg-[#26313d] hover:text-white"
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="border border-[#26313d]/20 bg-white lg:mt-[238px]">
              {copy.facts.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[0.78fr_1fr] border-b border-[#26313d]/20 last:border-b-0"
                >
                  <div className="border-r border-[#26313d]/20 px-5 py-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#26313d]/48">
                    {item.label}
                  </div>

                  <div className="px-5 py-5 text-[15px] font-semibold tracking-[-0.01em] text-[#26313d]">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#26313d]/12 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#26313d]/50">
                {copy.story.eyebrow}
              </p>

              <h2 className="mt-5 max-w-2xl text-[30px] font-semibold leading-[1.14] tracking-[-0.035em] text-[#26313d] md:text-[46px]">
                {copy.story.title}
              </h2>
            </div>

            <p className="max-w-3xl text-[17px] leading-9 tracking-[-0.01em] text-[#26313d]/68 md:text-[19px]">
              {copy.story.text}
            </p>
          </div>
        </section>

        <section className="border-b border-[#26313d]/12 bg-white">
          <div className="mx-auto grid max-w-6xl gap-px bg-[#26313d]/20 px-0 md:grid-cols-3">
            {copy.sections.map((section) => (
              <article key={section.eyebrow} className="bg-white p-8 md:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#26313d]/45">
                  {section.eyebrow}
                </p>

                <h3 className="mt-5 text-[25px] font-semibold leading-[1.14] tracking-[-0.035em] text-[#26313d] md:text-[31px]">
                  {section.title}
                </h3>

                <p className="mt-5 text-[15px] leading-8 text-[#26313d]/62">
                  {section.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#26313d] text-white">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
            <div className="max-w-4xl">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/50">
                {copy.finalCta.eyebrow}
              </p>

              <h2 className="mt-6 text-[36px] font-semibold leading-[1.08] tracking-[-0.045em] md:text-[58px]">
                {copy.finalCta.title}
              </h2>

              <p className="mt-6 max-w-3xl text-[17px] leading-8 text-white/68 md:text-[19px] md:leading-9">
                {copy.finalCta.text}
              </p>

              <Link
                href={bookingHref}
                className="mt-9 inline-flex min-h-[52px] items-center justify-center border border-white bg-white px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#26313d] transition duration-300 hover:bg-[#26313d] hover:text-white"
              >
                {copy.finalCta.button}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        body {
          background: #ffffff;
        }
      `}</style>
    </>
  );
}