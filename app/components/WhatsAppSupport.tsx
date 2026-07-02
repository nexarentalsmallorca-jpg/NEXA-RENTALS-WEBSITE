"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";

type Locale = "en" | "es" | "de" | "fr" | "it" | "pt" | "sv";

type Props = {
  phone?: string;
  message?: string;
  messages?: string[];
  firstDelayMs?: number;
  visibleMs?: number;
  gapMs?: number;
};

const DEFAULT_EN_MESSAGE =
  "Hi Nexa Rentals, I want to book a scooter in Magaluf. Is it available?";

const DEFAULT_EN_BUBBLES = [
  "Hey! Need any help?",
  "Want the best scooter for your trip?",
  "Booking takes only 60 seconds ⚡",
  "Message us — we reply fast 🙂",
];

const COPY: Record<
  Locale,
  {
    message: string;
    bubbles: string[];
    openChat: string;
    whatsappSupport: string;
    whatsappAlt: string;
  }
> = {
  en: {
    message:
      "Hi Nexa Rentals, I want to book a scooter in Magaluf. Is it available?",
    bubbles: [
      "Hey! Need any help?",
      "Want the best scooter for your trip?",
      "Booking takes only 60 seconds ⚡",
      "Message us — we reply fast 🙂",
    ],
    openChat: "Open WhatsApp chat",
    whatsappSupport: "WhatsApp Support",
    whatsappAlt: "WhatsApp",
  },
  es: {
    message:
      "Hola NEXA Rentals, quiero reservar un scooter en Magaluf. ¿Está disponible?",
    bubbles: [
      "¡Hola! ¿Necesitas ayuda?",
      "¿Quieres el mejor scooter para tu viaje?",
      "Reservar toma solo 60 segundos ⚡",
      "Escríbenos — respondemos rápido 🙂",
    ],
    openChat: "Abrir chat de WhatsApp",
    whatsappSupport: "Soporte por WhatsApp",
    whatsappAlt: "WhatsApp",
  },
  de: {
    message:
      "Hallo NEXA Rentals, ich möchte einen Scooter in Magaluf buchen. Ist er verfügbar?",
    bubbles: [
      "Hey! Brauchst du Hilfe?",
      "Möchtest du den besten Scooter für deine Reise?",
      "Buchen dauert nur 60 Sekunden ⚡",
      "Schreib uns — wir antworten schnell 🙂",
    ],
    openChat: "WhatsApp-Chat öffnen",
    whatsappSupport: "WhatsApp Support",
    whatsappAlt: "WhatsApp",
  },
  fr: {
    message:
      "Bonjour NEXA Rentals, je souhaite réserver un scooter à Magaluf. Est-il disponible ?",
    bubbles: [
      "Salut ! Besoin d’aide ?",
      "Tu veux le meilleur scooter pour ton voyage ?",
      "La réservation prend seulement 60 secondes ⚡",
      "Écris-nous — on répond vite 🙂",
    ],
    openChat: "Ouvrir le chat WhatsApp",
    whatsappSupport: "Support WhatsApp",
    whatsappAlt: "WhatsApp",
  },
  it: {
    message:
      "Ciao NEXA Rentals, vorrei prenotare uno scooter a Magaluf. È disponibile?",
    bubbles: [
      "Ciao! Hai bisogno di aiuto?",
      "Vuoi il miglior scooter per il tuo viaggio?",
      "Prenotare richiede solo 60 secondi ⚡",
      "Scrivici — rispondiamo velocemente 🙂",
    ],
    openChat: "Apri chat WhatsApp",
    whatsappSupport: "Supporto WhatsApp",
    whatsappAlt: "WhatsApp",
  },
  pt: {
    message:
      "Olá NEXA Rentals, quero reservar uma scooter em Magaluf. Está disponível?",
    bubbles: [
      "Olá! Precisa de ajuda?",
      "Quer a melhor scooter para a sua viagem?",
      "Reservar demora só 60 segundos ⚡",
      "Envie mensagem — respondemos rápido 🙂",
    ],
    openChat: "Abrir chat WhatsApp",
    whatsappSupport: "Suporte WhatsApp",
    whatsappAlt: "WhatsApp",
  },
  sv: {
    message:
      "Hej NEXA Rentals, jag vill boka en scooter i Magaluf. Är den tillgänglig?",
    bubbles: [
      "Hej! Behöver du hjälp?",
      "Vill du ha bästa scootern för din resa?",
      "Bokning tar bara 60 sekunder ⚡",
      "Skriv till oss — vi svarar snabbt 🙂",
    ],
    openChat: "Öppna WhatsApp-chatt",
    whatsappSupport: "WhatsApp-support",
    whatsappAlt: "WhatsApp",
  },
};

function getSafeLocale(locale: string): Locale {
  return ["en", "es", "de", "fr", "it", "pt", "sv"].includes(locale)
    ? (locale as Locale)
    : "en";
}

function isDefaultEnglishBubbles(messages?: string[]) {
  if (!messages || messages.length === 0) return true;

  const normalizedIncoming = messages.map((item) => item.trim());
  const normalizedDefault = DEFAULT_EN_BUBBLES.map((item) => item.trim());

  return (
    normalizedIncoming.length === normalizedDefault.length &&
    normalizedIncoming.every((item, index) => item === normalizedDefault[index])
  );
}

function isMobileLikeNow() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches ||
    window.innerWidth <= 1023
  );
}

export default function WhatsAppSupport({
  phone = "34971482342",
  message,
  messages,
  firstDelayMs = 3000,
  visibleMs = 4200,
  gapMs = 1600,
}: Props) {
  const locale = getSafeLocale(useLocale());
  const copy = COPY[locale];

  const finalMessage =
    !message || message.trim() === DEFAULT_EN_MESSAGE ? copy.message : message;

  const finalMessages = useMemo(() => {
    if (isDefaultEnglishBubbles(messages)) return copy.bubbles;
    return messages?.slice(0, 4) || copy.bubbles;
  }, [messages, copy.bubbles]);

  const [mounted, setMounted] = useState(false);
  const [isMobileLike, setIsMobileLike] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState(finalMessages[0] ?? "");

  const timers = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateDeviceMode = () => {
      setIsMobileLike(isMobileLikeNow());
    };

    updateDeviceMode();

    window.addEventListener("resize", updateDeviceMode);
    window.addEventListener("orientationchange", updateDeviceMode);

    return () => {
      window.removeEventListener("resize", updateDeviceMode);
      window.removeEventListener("orientationchange", updateDeviceMode);
    };
  }, []);

  useEffect(() => {
    setBubbleText(finalMessages[0] ?? "");
  }, [finalMessages]);

  useEffect(() => {
    if (!mounted) return;

    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];

    const bubbles = finalMessages.slice(0, 4);
    if (bubbles.length === 0) return;

    let delay = firstDelayMs;

    bubbles.forEach((text) => {
      timers.current.push(
        window.setTimeout(() => {
          setBubbleText(text);
          setShowBubble(true);
        }, delay)
      );

      timers.current.push(
        window.setTimeout(() => {
          setShowBubble(false);
        }, delay + visibleMs)
      );

      delay += visibleMs + gapMs;
    });

    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    };
  }, [mounted, finalMessages, firstDelayMs, visibleMs, gapMs]);

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(finalMessage)}`;

  const buttonSize = isMobileLike ? 58 : 72;

  const ui = (
    <div
      style={{
        position: "fixed",
        left: isMobileLike ? 22 : "auto",
        right: isMobileLike ? "auto" : 22,
        bottom: 22,
        zIndex: 2147483400,
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {isMobileLike && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.whatsappSupport}
          style={{
            pointerEvents: "auto",
            width: buttonSize,
            height: buttonSize,
            borderRadius: "50%",
            overflow: "hidden",
            display: "block",
            background: "transparent",
            flexShrink: 0,
          }}
        >
          <img
            src="/images/whatsapp.png"
            alt={copy.whatsappAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </a>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={copy.openChat}
        style={{
          pointerEvents: showBubble ? "auto" : "none",
          transform: showBubble
  ? "translateX(0px)"
  : "translateX(18px)",
          opacity: showBubble ? 1 : 0,
          transition: "all 320ms ease",
          background: "rgba(15,17,21,0.94)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: "10px 14px",
          maxWidth: 260,
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.25,
          textDecoration: "none",
          boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {bubbleText}
      </a>

      {!isMobileLike && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.whatsappSupport}
          style={{
            pointerEvents: "auto",
            width: buttonSize,
            height: buttonSize,
            borderRadius: "50%",
            overflow: "hidden",
            display: "block",
            background: "transparent",
          }}
        >
          <img
            src="/images/whatsapp.png"
            alt={copy.whatsappAlt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </a>
      )}
    </div>
  );

  if (!mounted) return null;

  return createPortal(ui, document.body);
}