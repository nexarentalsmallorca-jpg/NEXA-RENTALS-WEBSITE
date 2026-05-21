"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type DoorRevealPhase = "closed" | "opening" | "open";

/** Match BlogPageClient REVEAL_DURATION (seconds → ms) */
const OPEN_MS = 2150;

/**
 * Opens on the visitor's first downward scroll / wheel on the blog page.
 * In-memory only (resets on full page reload) so the reveal always plays again.
 */
export function useBlogPopularDoorReveal() {
  const revealRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<DoorRevealPhase>("closed");
  const [ready, setReady] = useState(false);
  const triggeredRef = useRef(false);

  const openDoors = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setPhase("opening");
    window.setTimeout(() => setPhase("open"), OPEN_MS);
  }, []);

  useEffect(() => {
    setReady(true);
    /* legacy key skipped the animation */
    try {
      sessionStorage.removeItem("nexa-blog-popular-doors-opened");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      triggeredRef.current = true;
      setPhase("open");
      return;
    }

    const tryOpen = () => {
      if (triggeredRef.current) return;
      openDoors();
    };

    const onScroll = () => {
      if (window.scrollY > 2) tryOpen();
    };

    const onTouchStart = () => {
      /* touch scroll often follows */
    };

    let touchY = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const y = e.touches[0].clientY;
      if (touchY && touchY - y > 6) tryOpen();
      touchY = y;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        (e.key === " " && !e.shiftKey)
      ) {
        tryOpen();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [ready, openDoors]);

  /* Wheel only while closed — removed after reveal so it never fights page scroll */
  useEffect(() => {
    if (!ready || phase !== "closed") return;

    const onWheelOnce = (e: WheelEvent) => {
      if (e.deltaY > 0) openDoors();
    };

    window.addEventListener("wheel", onWheelOnce, { passive: true });
    return () => window.removeEventListener("wheel", onWheelOnce);
  }, [ready, openDoors, phase]);

  const doorsMounted = phase !== "open";
  const marqueeActive = phase === "open";

  return {
    revealRef,
    phase,
    doorsMounted,
    marqueeActive,
  };
}
