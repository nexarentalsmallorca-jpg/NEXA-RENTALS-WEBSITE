"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  phone?: string; // example: 34612345678 (no +, no spaces)
  message?: string; // message sent when user clicks WhatsApp
  messages?: string[]; // 4 messages shown in sequence
  firstDelayMs?: number; // delay before the first bubble
  visibleMs?: number; // how long bubble stays visible
  gapMs?: number; // time between bubbles
};

export default function WhatsAppSupport({
  phone = "34600000000",
  message = "Hi NEXA Rentals! I need help with booking.",
  messages = [
    "Hey! Need any help?",
    "Want the best scooter for your trip?",
    "Booking takes only 60 seconds ⚡",
    "Message us — we reply fast 🙂",
  ],
  firstDelayMs = 3000,
  visibleMs = 4200,
  gapMs = 1600,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState(messages[0] ?? "");

  // Keep timers so we can clear them safely
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Clear any old timers (safety)
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];

    const msgs = messages.slice(0, 4); // ensure max 4
    if (msgs.length === 0) return;

    let t = firstDelayMs;

    msgs.forEach((txt) => {
      // Show
      timers.current.push(
        window.setTimeout(() => {
          setBubbleText(txt);
          setShowBubble(true);
        }, t)
      );

      // Hide
      timers.current.push(
        window.setTimeout(() => {
          setShowBubble(false);
        }, t + visibleMs)
      );

      // Next message time
      t += visibleMs + gapMs;
    });

    // After 4 messages, it stops (no interval)

    return () => {
      timers.current.forEach((x) => window.clearTimeout(x));
      timers.current = [];
    };
  }, [mounted, messages, firstDelayMs, visibleMs, gapMs]);

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  const ui = (
    <div
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {/* 💬 Premium Bubble */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp chat"
        style={{
          pointerEvents: showBubble ? "auto" : "none",
          transform: showBubble ? "translateX(0px)" : "translateX(18px)",
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

      {/* 🟢 WhatsApp Icon (always visible) */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Support"
        style={{
          pointerEvents: "auto",
          width: 72,
          height: 72,
          borderRadius: "50%",
          overflow: "hidden",
          display: "block",
          background: "transparent",
        }}
      >
        <img
          src="/images/whatsapp.png"
          alt="WhatsApp"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </a>
    </div>
  );

  if (!mounted) return null;

  // ✅ Portal keeps it fixed even if your page uses transforms/filters
  return createPortal(ui, document.body);
}
