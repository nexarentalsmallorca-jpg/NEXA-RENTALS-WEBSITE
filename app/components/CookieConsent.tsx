
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nexa_cookie_consent_v1";
const GOOGLE_ADS_ID = "AW-18058340467";

type Consent = "accepted" | "rejected";

type Copy = {
  title: string;
  message: string;
  accept: string;
  reject: string;
  settings: string;
};

const TRANSLATIONS: Record<string, Copy> = {
  en: {
    title: "Your privacy matters",
    message:
      "We use essential storage to keep this site working. With your permission, we also use Google advertising cookies to measure visits and bookings.",
    accept: "Accept all",
    reject: "Reject optional",
    settings: "Cookie settings",
  },
  es: {
    title: "Tu privacidad importa",
    message:
      "Usamos almacenamiento esencial para que la web funcione. Con tu permiso, también usamos cookies publicitarias de Google para medir visitas y reservas.",
    accept: "Aceptar todas",
    reject: "Rechazar opcionales",
    settings: "Preferencias de cookies",
  },
  de: {
    title: "Deine Privatsphäre ist wichtig",
    message:
      "Wir verwenden notwendige Speicherfunktionen. Mit deiner Einwilligung nutzen wir außerdem Google-Werbecookies zur Messung von Besuchen und Buchungen.",
    accept: "Alle akzeptieren",
    reject: "Optionale ablehnen",
    settings: "Cookie-Einstellungen",
  },
  fr: {
    title: "Votre vie privée compte",
    message:
      "Nous utilisons un stockage essentiel au fonctionnement du site. Avec votre accord, nous utilisons aussi des cookies publicitaires Google pour mesurer les visites et réservations.",
    accept: "Tout accepter",
    reject: "Refuser les facultatifs",
    settings: "Préférences des cookies",
  },
  it: {
    title: "La tua privacy conta",
    message:
      "Utilizziamo strumenti essenziali per il funzionamento del sito. Con il tuo consenso usiamo anche cookie pubblicitari Google per misurare visite e prenotazioni.",
    accept: "Accetta tutti",
    reject: "Rifiuta opzionali",
    settings: "Preferenze cookie",
  },
  nl: {
    title: "Jouw privacy is belangrijk",
    message:
      "We gebruiken noodzakelijke opslag om de site te laten werken. Met jouw toestemming gebruiken we ook Google-advertentiecookies om bezoeken en boekingen te meten.",
    accept: "Alles accepteren",
    reject: "Optionele weigeren",
    settings: "Cookie-instellingen",
  },
  pl: {
    title: "Twoja prywatność ma znaczenie",
    message:
      "Korzystamy z niezbędnego zapisu danych do działania strony. Za Twoją zgodą używamy też reklamowych plików cookie Google do pomiaru wizyt i rezerwacji.",
    accept: "Akceptuj wszystkie",
    reject: "Odrzuć opcjonalne",
    settings: "Ustawienia cookies",
  },
  sv: {
    title: "Din integritet är viktig",
    message:
      "Vi använder nödvändig lagring för webbplatsens funktion. Med ditt samtycke använder vi också Googles annonscookies för att mäta besök och bokningar.",
    accept: "Acceptera alla",
    reject: "Avvisa valfria",
    settings: "Cookieinställningar",
  },
  da: {
    title: "Dit privatliv er vigtigt",
    message:
      "Vi bruger nødvendig lagring for at få hjemmesiden til at fungere. Med dit samtykke bruger vi også Googles annoncecookies til at måle besøg og bookinger.",
    accept: "Accepter alle",
    reject: "Afvis valgfrie",
    settings: "Cookieindstillinger",
  },
  no: {
    title: "Personvernet ditt er viktig",
    message:
      "Vi bruker nødvendig lagring for at nettstedet skal fungere. Med ditt samtykke bruker vi også Googles annonseinformasjonskapsler for å måle besøk og bestillinger.",
    accept: "Godta alle",
    reject: "Avvis valgfrie",
    settings: "Innstillinger for informasjonskapsler",
  },
  pt: {
    title: "A sua privacidade importa",
    message:
      "Utilizamos armazenamento essencial para o site funcionar. Com o seu consentimento, também usamos cookies de publicidade Google para medir visitas e reservas.",
    accept: "Aceitar todos",
    reject: "Rejeitar opcionais",
    settings: "Preferências de cookies",
  },
  cs: {
    title: "Na vašem soukromí záleží",
    message:
      "Používáme nezbytné úložiště pro fungování webu. S vaším souhlasem také používáme reklamní soubory cookie Google k měření návštěv a rezervací.",
    accept: "Přijmout vše",
    reject: "Odmítnout volitelné",
    settings: "Nastavení cookies",
  },
  sr: {
    title: "Vaša privatnost je važna",
    message:
      "Koristimo neophodno skladištenje za rad sajta. Uz vašu saglasnost koristimo i Google reklamne kolačiće za merenje poseta i rezervacija.",
    accept: "Prihvati sve",
    reject: "Odbij opcione",
    settings: "Podešavanja kolačića",
  },
  uk: {
    title: "Ваша конфіденційність важлива",
    message:
      "Ми використовуємо необхідне сховище для роботи сайту. За вашою згодою також використовуємо рекламні файли cookie Google для аналізу відвідувань і бронювань.",
    accept: "Прийняти всі",
    reject: "Відхилити необов’язкові",
    settings: "Налаштування cookie",
  },
};

let googleAdsStarted = false;

function enableGoogleAdvertising() {
  if (googleAdsStarted || typeof window === "undefined") return;
  googleAdsStarted = true;

  const win = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  win.dataLayer = win.dataLayer || [];

  win.gtag = (...args: unknown[]) => {
    win.dataLayer?.push(args);
  };

  win.gtag("js", new Date());

  win.gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });

  win.gtag("config", GOOGLE_ADS_ID);

  if (
    !document.querySelector('script[data-nexa-google-ads="true"]')
  ) {
    const script = document.createElement("script");
    script.async = true;
    script.src =
      `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
    script.dataset.nexaGoogleAds = "true";
    document.head.appendChild(script);
  }
}

export default function CookieConsent({
  locale,
}: {
  locale: string;
}) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);

  const strings = TRANSLATIONS[locale] || TRANSLATIONS.en;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored === "accepted" || stored === "rejected") {
        setConsent(stored);

        if (stored === "accepted") {
          enableGoogleAdvertising();
        }
      }
    } catch {
      // Keep choices accessible if storage is unavailable.
    }

    setReady(true);
  }, []);

  function choose(value: Consent) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Choice still applies to the current page.
    }

    setConsent(value);
    setEditing(false);

    if (value === "accepted") {
      enableGoogleAdvertising();
    }

    if (value === "rejected" && googleAdsStarted) {
      window.location.reload();
    }
  }

  if (!ready) return null;

  return (
    <>
      {consent !== null && !editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="fixed bottom-2 left-3 z-[999] rounded-full border border-black/10 bg-white/95 px-3 py-1.5 text-[10px] font-medium text-black/65 shadow-sm backdrop-blur-sm transition hover:text-black"
        >
          {strings.settings}
        </button>
      ) : (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={strings.title}
          className="fixed inset-x-3 bottom-4 z-[9999] mx-auto w-auto max-w-[510px] rounded-[22px] border border-black/10 bg-white p-5 font-[family-name:var(--font-poppins)] text-black shadow-[0_20px_70px_rgba(0,0,0,.20)] sm:bottom-6 sm:p-6"
        >
          <div className="mb-2 flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg"
            >
              🍪
            </span>

            <h2 className="text-[17px] font-semibold tracking-[-0.03em]">
              {strings.title}
            </h2>
          </div>

          <p className="text-[12px] leading-[1.85] text-black/65">
            {strings.message}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => choose("rejected")}
              className="min-h-11 rounded-xl border border-black/15 bg-white px-3 text-[12px] font-semibold text-black transition duration-200 hover:border-black/40 hover:bg-black/[0.035] active:scale-[.97]"
            >
              {strings.reject}
            </button>

            <button
              type="button"
              onClick={() => choose("accepted")}
              className="relative min-h-11 overflow-hidden rounded-xl bg-gradient-to-r from-[#f47719] to-[#ff9c42] px-3 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(244,119,25,.18)] transition duration-200 hover:brightness-105 hover:shadow-[0_12px_28px_rgba(244,119,25,.3)] active:scale-[.97]"
            >
              {strings.accept}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
