"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";

type Tip = {
  title: string;
  text: string;
};

type PlanType = "half" | "full" | null;

declare global {
  interface Window {
    __nexaNeroCopilotMounted?: boolean;
  }
}

const WELCOME_TIP: Tip = {
  title: "Need help booking?",
  text: "Choose your scooter, then select Half Day or Full Day to start your reservation.",
};

const DEFAULT_TIP: Tip = {
  title: "Nero AI Assistant",
  text: "Created by Nexa Rentals. I can help you with prices, license, deposit, insurance and booking.",
};

const LANGUAGE_MAINTENANCE_TIP: Tip = {
  title: "Languages under maintenance",
  text: "Other languages are temporarily unavailable while we finish the website update. You can still use the website in English.",
};

function getElementText(element: HTMLElement | null) {
  if (!element) return "";

  return `${element.innerText || ""} ${element.textContent || ""} ${
    element.getAttribute("aria-label") || ""
  } ${element.getAttribute("placeholder") || ""}`.toLowerCase();
}

function getTargetElement(element: HTMLElement | null) {
  if (!element) return null;

  return element.closest(
    "button, a, input, textarea, [data-nexa-step], [role='button']"
  ) as HTMLElement | null;
}

function isPlanButton(element: HTMLElement | null, plan: "half" | "full") {
  if (!element) return false;

  const target = getTargetElement(element);
  if (!target || !(target instanceof HTMLButtonElement)) return false;

  const step = (target.getAttribute("data-nexa-step") || "").toLowerCase();
  const text = getElementText(target);

  if (plan === "half") {
    return (
      step === "plan-half-day" ||
      step.includes("plan-half") ||
      (text.includes("half day") &&
        (text.includes("most popular") ||
          text.includes("best value") ||
          text.includes("pickup 09:30") ||
          text.includes("return 19:00") ||
          text.includes("€")))
    );
  }

  return (
    step === "plan-full-day" ||
    step.includes("plan-full") ||
    (text.includes("full day") &&
      (text.includes("flexible rental") ||
        text.includes("24h") ||
        text.includes("max 6 days") ||
        text.includes("€")))
  );
}

function detectStepFromElement(element: HTMLElement | null): Tip | null {
  if (!element) return null;

  if (isPlanButton(element, "half")) {
    return {
      title: "Half Day Plan",
      text: "Great value option. Half Day is the most popular choice for a shorter same-day ride.",
    };
  }

  if (isPlanButton(element, "full")) {
    return {
      title: "Full Day Plan",
      text: "Full Day gives you more freedom with 24-hour rental blocks and up to 6 days online.",
    };
  }

  return null;
}

function detectClickStep(element: HTMLElement | null): Tip | null {
  if (!element) return null;

  if (isPlanButton(element, "half")) {
    return {
      title: "Great Choice",
      text: "Half Day selected. Now choose your pickup date. The return is automatically the same day.",
    };
  }

  if (isPlanButton(element, "full")) {
    return {
      title: "Great Choice",
      text: "Full Day selected. Now choose your preferred pickup date.",
    };
  }

  return null;
}

export default function NeroBookingCopilot() {
  const [mounted, setMounted] = useState(false);
  const [allowRender, setAllowRender] = useState(false);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState<Tip>(DEFAULT_TIP);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [isMobileLike, setIsMobileLike] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const selectedPlanRef = useRef<PlanType>(null);
  const activeHoverTargetRef = useRef<HTMLElement | null>(null);
  const ownsCopilotRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.__nexaNeroCopilotMounted) {
      setAllowRender(false);
      setMounted(true);
      return;
    }

    window.__nexaNeroCopilotMounted = true;
    ownsCopilotRef.current = true;

    setAllowRender(true);
    setMounted(true);

    return () => {
      if (ownsCopilotRef.current) {
        window.__nexaNeroCopilotMounted = false;
        ownsCopilotRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    const updateDeviceMode = () => {
      if (typeof window === "undefined") return;

      const mobile =
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches ||
        window.innerWidth <= 768;

      setIsMobileLike(mobile);
    };

    updateDeviceMode();
    window.addEventListener("resize", updateDeviceMode);

    return () => {
      window.removeEventListener("resize", updateDeviceMode);
    };
  }, []);

  useEffect(() => {
    selectedPlanRef.current = selectedPlan;
  }, [selectedPlan]);

  const eyeStyle = useMemo(() => {
    if (isMobileLike) {
      return { transform: "translate(0px, 0px)" };
    }

    const button = buttonRef.current;

    if (!button) {
      return { transform: "translate(0px, 0px)" };
    }

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = Math.max(-1, Math.min(1, (mouse.x - centerX) / 190));
    const dy = Math.max(-1, Math.min(1, (mouse.y - centerY) / 190));

    return {
      transform: `translate(${dx * 6}px, ${dy * 5}px)`,
    };
  }, [mouse, isMobileLike]);

  const shineStyle = useMemo(() => {
    if (isMobileLike) {
      return { transform: "translate(0px, 0px)" };
    }

    const button = buttonRef.current;

    if (!button) {
      return { transform: "translate(0px, 0px)" };
    }

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = Math.max(-1, Math.min(1, (mouse.x - centerX) / 280));
    const dy = Math.max(-1, Math.min(1, (mouse.y - centerY) / 280));

    return {
      transform: `translate(${dx * 10}px, ${dy * 8}px)`,
    };
  }, [mouse, isMobileLike]);

  function clearHideTimer() {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function closeTipImmediately() {
    clearHideTimer();
    activeHoverTargetRef.current = null;
    setOpen(false);
  }

  function scheduleClose(delay = 120) {
    clearHideTimer();

    hideTimerRef.current = window.setTimeout(() => {
      activeHoverTargetRef.current = null;
      setOpen(false);
    }, delay);
  }

  function showTip(nextTip: Tip, duration: number | null = 2400) {
    setTip(nextTip);
    setOpen(true);

    clearHideTimer();

    if (duration !== null) {
      hideTimerRef.current = window.setTimeout(() => {
        activeHoverTargetRef.current = null;
        setOpen(false);
      }, duration);
    }
  }

  function showHoverTip(nextTip: Tip, target: HTMLElement) {
    activeHoverTargetRef.current = target;
    showTip(nextTip, null);
  }

  function getCurrentLocale() {
    const firstPathPart = window.location.pathname.split("/").filter(Boolean)[0];
    return firstPathPart || "en";
  }

  function chatWithNero() {
    const section = document.getElementById("nero-ai-assistant");

    window.dispatchEvent(new CustomEvent("nexa:focus-nero-chat"));

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      showTip(
        {
          title: "Ask Nero Anything",
          text: "I can answer questions about prices, license, deposit, insurance, location and booking.",
        },
        3200
      );

      return;
    }

    const locale = getCurrentLocale();
    window.location.href = `/${locale}/#nero-ai-assistant`;
  }

  function handleCopilotMouseEnter() {
    if (isMobileLike) return;
    if (tip.title === WELCOME_TIP.title) return;

    clearHideTimer();
  }

  function handleCopilotMouseLeave(e: ReactMouseEvent<HTMLDivElement>) {
    if (isMobileLike) return;

    const nextTarget = e.relatedTarget as Node | null;

    if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
      return;
    }

    scheduleClose(120);
  }

  useEffect(() => {
    if (!allowRender) return;

    function handleLanguageMaintenance(e: Event) {
      const customEvent = e as CustomEvent<{ title?: string; text?: string }>;

      showTip(
        {
          title: customEvent.detail?.title || LANGUAGE_MAINTENANCE_TIP.title,
          text: customEvent.detail?.text || LANGUAGE_MAINTENANCE_TIP.text,
        },
        6500
      );
    }

    window.addEventListener(
      "nexa:language-maintenance",
      handleLanguageMaintenance
    );

    return () => {
      window.removeEventListener(
        "nexa:language-maintenance",
        handleLanguageMaintenance
      );
    };
  }, [allowRender]);

  useEffect(() => {
    if (!allowRender) return;

    const welcomeTimer = window.setTimeout(() => {
      showTip(WELCOME_TIP, 2400);
    }, 900);

    return () => window.clearTimeout(welcomeTimer);
  }, [allowRender]);

  useEffect(() => {
    if (!allowRender) return;

    function onMove(e: MouseEvent) {
      if (isMobileLike) return;
      setMouse({ x: e.clientX, y: e.clientY });
    }

    function onMouseOver(e: MouseEvent) {
      if (isMobileLike) return;

      const rawElement = e.target as HTMLElement;
      const target = getTargetElement(rawElement);
      if (!target) return;

      const detected = detectStepFromElement(target);

      if (detected) {
        showHoverTip(detected, target);
      }
    }

    function onMouseOut(e: MouseEvent) {
      if (isMobileLike) return;

      const rawElement = e.target as HTMLElement;
      const target = getTargetElement(rawElement);
      const nextTarget = e.relatedTarget as Node | null;

      if (nextTarget && wrapperRef.current?.contains(nextTarget)) {
        return;
      }

      const activeTarget = activeHoverTargetRef.current;

      if (activeTarget && nextTarget && activeTarget.contains(nextTarget)) {
        return;
      }

      if (target && activeTarget && target === activeTarget) {
        closeTipImmediately();
        return;
      }

      if (target && activeTarget && activeTarget.contains(target)) {
        closeTipImmediately();
      }
    }

    function onClick(e: MouseEvent) {
      const element = e.target as HTMLElement;

      if (isPlanButton(element, "half")) {
        setSelectedPlan("half");
        selectedPlanRef.current = "half";
      }

      if (isPlanButton(element, "full")) {
        setSelectedPlan("full");
        selectedPlanRef.current = "full";
      }

      const detected = detectClickStep(element);

      if (detected) {
        showTip(detected, 3200);
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mouseout", onMouseOut);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("click", onClick);
      clearHideTimer();
    };
  }, [allowRender, isMobileLike]);

  const copilot = (
    <div
      ref={wrapperRef}
      onMouseEnter={handleCopilotMouseEnter}
      onMouseLeave={handleCopilotMouseLeave}
      style={{
        position: "fixed",
        right: isMobileLike ? "14px" : "clamp(14px, 1.6vw, 24px)",
        bottom: isMobileLike ? "96px" : "104px",
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
        pointerEvents: "auto",
      }}
      className="nero-copilot-wrap"
      data-nexa-nero-copilot="true"
    >
      {open && (
        <div className="animate-[neroPop_0.2s_ease-out] relative w-[min(312px,calc(100vw-32px))] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0c12]/95 p-4 pr-10 text-white shadow-[0_22px_70px_rgba(124,58,237,0.28),0_10px_34px_rgba(249,115,22,0.18)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_38%)]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/6" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeTipImmediately();
            }}
            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/8 text-[15px] font-black leading-none text-white/70 transition hover:bg-white/14 hover:text-white active:scale-95"
            aria-label="Close Nero popup"
          >
            ×
          </button>

          <div className="relative z-10">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(96,165,250,0.16),rgba(124,58,237,0.18),rgba(249,115,22,0.18))] shadow-[0_0_30px_rgba(124,58,237,0.28)]">
                <img
                  src="/images/ai-icon.png"
                  alt="Nexa AI Copilot"
                  className="h-8 w-8 object-contain drop-shadow-[0_0_14px_rgba(124,58,237,0.55)]"
                  draggable={false}
                />
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                  NEXA AI COPILOT
                </div>

                <p className="mt-2 bg-gradient-to-r from-[#fdba74] via-[#c084fc] to-[#7dd3fc] bg-clip-text text-[15px] font-black text-transparent">
                  {tip.title}
                </p>

                <p className="mt-1.5 text-[13px] leading-6 text-neutral-200/92">
                  {tip.text}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={chatWithNero}
              className="mt-4 w-full rounded-[18px] border border-white/10 bg-[linear-gradient(135deg,#f97316_0%,#c084fc_50%,#60a5fa_100%)] px-4 py-2.5 text-[14px] font-black text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition hover:scale-[1.01] hover:brightness-105 active:scale-[0.985]"
            >
              Chat with Nero
            </button>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={chatWithNero}
        onMouseEnter={() => {
          if (!isMobileLike) showTip(DEFAULT_TIP, null);
        }}
        className={[
          "group relative overflow-hidden rounded-full border border-white/12 bg-[#06070c] shadow-[0_0_24px_rgba(59,130,246,0.22),0_0_44px_rgba(124,58,237,0.24),0_0_60px_rgba(249,115,22,0.18)] transition duration-300 hover:scale-110 active:scale-95",
          isMobileLike
            ? "h-[62px] w-[62px] nero-mobile-idle"
            : "h-[clamp(64px,5vw,72px)] w-[clamp(64px,5vw,72px)]",
        ].join(" ")}
        aria-label="Chat with Nero"
      >
        <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(96,165,250,0.85),rgba(124,58,237,0.95),rgba(249,115,22,0.92),rgba(96,165,250,0.85))]" />
        <div className="absolute inset-[3px] rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_50%_18%,rgba(96,165,250,0.22),transparent_30%),radial-gradient(circle_at_72%_28%,rgba(249,115,22,0.18),transparent_25%),linear-gradient(180deg,rgba(18,18,26,0.98),rgba(7,8,14,0.96))]" />
        <div className="absolute inset-[8px] rounded-full border border-white/8 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_34%)]" />

        <div
          style={shineStyle}
          className="absolute left-4 top-3 h-4 w-4 rounded-full bg-white/45 blur-[1px] transition-transform duration-75"
        />

        <div className="absolute left-1/2 top-[29%] flex -translate-x-1/2 gap-3">
          <span
            className={[
              "relative h-4 w-4 rounded-full bg-gradient-to-br from-white to-[#dbeafe] shadow-[0_0_16px_rgba(191,219,254,1)]",
              isMobileLike ? "nero-mobile-eye" : "",
            ].join(" ")}
          >
            <span
              style={eyeStyle}
              className={[
                "absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#05060a] transition-transform duration-75",
                isMobileLike ? "nero-mobile-pupil" : "",
              ].join(" ")}
            />
          </span>

          <span
            className={[
              "relative h-4 w-4 rounded-full bg-gradient-to-br from-white to-[#ffedd5] shadow-[0_0_16px_rgba(255,237,213,1)]",
              isMobileLike ? "nero-mobile-eye" : "",
            ].join(" ")}
          >
            <span
              style={eyeStyle}
              className={[
                "absolute left-1/2 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#05060a] transition-transform duration-75",
                isMobileLike ? "nero-mobile-pupil" : "",
              ].join(" ")}
            />
          </span>
        </div>

        <div
          className={[
            "absolute bottom-[28%] left-1/2 h-3.5 w-8 -translate-x-1/2 rounded-b-full border-b-[3px] border-[#fde68a] shadow-[0_0_14px_rgba(251,191,36,0.28)] transition-all duration-200 group-hover:w-9 group-hover:border-b-[4px]",
            isMobileLike ? "nero-mobile-mouth" : "",
          ].join(" ")}
        />

        <div className="absolute bottom-[7px] left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-2 py-[2px] text-[9px] font-black tracking-[0.25em] text-white/90 shadow-[0_0_14px_rgba(124,58,237,0.35)]">
          AI
        </div>

        <div className="absolute -left-3 top-3 h-10 w-10 rounded-full bg-[#60a5fa]/16 blur-[18px]" />
        <div className="absolute -right-2 bottom-2 h-10 w-10 rounded-full bg-[#f97316]/18 blur-[18px]" />
        <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 transition group-hover:opacity-100" />
      </button>

      <style jsx>{`
        @keyframes neroPop {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.94);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes neroMobileFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-2px) rotate(-1deg);
          }
          50% {
            transform: translateY(-5px) rotate(0.8deg);
          }
          75% {
            transform: translateY(-2px) rotate(-0.6deg);
          }
        }

        @keyframes neroMobileBlink {
          0%,
          43%,
          47%,
          90%,
          100% {
            transform: scaleY(1);
          }
          45%,
          46% {
            transform: scaleY(0.14);
          }
          92%,
          93% {
            transform: scaleY(0.18);
          }
        }

        @keyframes neroMobilePupilDance {
          0%,
          100% {
            transform: translate(-50%, -50%) translate(0px, 0px);
          }
          20% {
            transform: translate(-50%, -50%) translate(1px, -1px);
          }
          40% {
            transform: translate(-50%, -50%) translate(-1px, 0px);
          }
          60% {
            transform: translate(-50%, -50%) translate(1px, 1px);
          }
          80% {
            transform: translate(-50%, -50%) translate(0px, -1px);
          }
        }

        @keyframes neroMobileSmile {
          0%,
          100% {
            width: 32px;
            border-bottom-width: 3px;
            transform: translateX(-50%) scaleX(1);
          }
          50% {
            width: 36px;
            border-bottom-width: 4px;
            transform: translateX(-50%) scaleX(1.04);
          }
        }

        .nero-mobile-idle {
          animation: neroMobileFloat 3.2s ease-in-out infinite;
        }

        .nero-mobile-eye {
          transform-origin: center center;
          animation: neroMobileBlink 4.8s ease-in-out infinite;
        }

        .nero-mobile-pupil {
          animation: neroMobilePupilDance 3.6s ease-in-out infinite;
        }

        .nero-mobile-mouth {
          animation: neroMobileSmile 2.8s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .nero-copilot-wrap {
            right: 14px !important;
            bottom: 96px !important;
          }
        }
      `}</style>
    </div>
  );

  if (!mounted || !allowRender) return null;

  return createPortal(copilot, document.body);
}