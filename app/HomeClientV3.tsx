"use client";

import { Manrope, Montserrat } from "next/font/google";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import NavbarV3 from "./NavbarV3";
import NexaBookingShowroomV3 from "./components/NexaBookingShowroomV3";

const titleFont = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const uiFont = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const FRAME_COUNT = 684;
const FRAME_EXTENSION = "webp";
const FRAME_PATH = "/nexa-v3/frames";

type Locale = "en" | "es" | "de" | "fr" | "sv" | "it" | "pt";

type Scene = {
  id: string;
  startFrame: number;
  endFrame: number;
  number: string;
  kicker: string;
  title: string;
  text: string;
  type: "hero" | "callout";
  side?: "left" | "right";
  markerLeft?: string;
  markerTop?: string;
  lineWidth?: number;
  lineAngle?: number;
  heroLeft?: string;
  heroTop?: string;
  textShiftY?: number;
};

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

const V3_COPY: Record<
  Locale,
  {
    hero: {
      titleTop: string;
      titleBottom: string;
      subtitle: string;
      primaryCta: string;
    };
    finalCta: {
      eyebrow: string;
      title: string;
      description: string;
      button: string;
    };
    scroll: string;
  }
> = {
  en: {
    hero: {
      titleTop: "Ride Mallorca",
      titleBottom: "with NEXA Rentals.",
      subtitle:
        "Book online, pick up in Magaluf, and ride with everything ready from the moment you arrive.",
      primaryCta: "Book Your Scooter",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "Ready to explore Mallorca?",
      description:
        "Choose your scooter, reserve online, and pick it up in Magaluf with everything ready for the ride.",
      button: "Start Booking",
    },
    scroll: "Scroll",
  },
  es: {
    hero: {
      titleTop: "Descubre Mallorca",
      titleBottom: "con NEXA.",
      subtitle:
        "Reserva online, recoge en Magaluf y conduce con todo preparado desde el primer momento.",
      primaryCta: "Reservar Scooter",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "¿Listo para explorar Mallorca?",
      description:
        "Elige tu scooter, reserva online y recógelo en Magaluf con todo preparado para tu ruta.",
      button: "Empezar reserva",
    },
    scroll: "Desliza",
  },
  de: {
    hero: {
      titleTop: "Mallorca erleben",
      titleBottom: "mit NEXA.",
      subtitle:
        "Online buchen, in Magaluf abholen und mit allem startklar losfahren.",
      primaryCta: "Scooter buchen",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "Bereit, Mallorca zu entdecken?",
      description:
        "Wähle deinen Scooter, buche online und hole ihn in Magaluf fahrbereit ab.",
      button: "Buchung starten",
    },
    scroll: "Scrollen",
  },
  fr: {
    hero: {
      titleTop: "Explorez Mallorca",
      titleBottom: "avec NEXA.",
      subtitle:
        "Réservez en ligne, récupérez à Magaluf et partez avec tout prêt pour la route.",
      primaryCta: "Réserver un scooter",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "Prêt à explorer Mallorca ?",
      description:
        "Choisissez votre scooter, réservez en ligne et récupérez-le à Magaluf prêt pour la route.",
      button: "Commencer la réservation",
    },
    scroll: "Défiler",
  },
  it: {
    hero: {
      titleTop: "Vivi Mallorca",
      titleBottom: "con NEXA.",
      subtitle:
        "Prenota online, ritira a Magaluf e parti con tutto pronto per il viaggio.",
      primaryCta: "Prenota scooter",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "Pronto a esplorare Mallorca?",
      description:
        "Scegli il tuo scooter, prenota online e ritiralo a Magaluf già pronto per la strada.",
      button: "Inizia prenotazione",
    },
    scroll: "Scorri",
  },
  pt: {
    hero: {
      titleTop: "Explore Mallorca",
      titleBottom: "com NEXA.",
      subtitle:
        "Reserve online, levante em Magaluf e conduza com tudo pronto desde o primeiro momento.",
      primaryCta: "Reservar scooter",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "Pronto para explorar Mallorca?",
      description:
        "Escolha a sua scooter, reserve online e levante-a em Magaluf com tudo pronto para a viagem.",
      button: "Começar reserva",
    },
    scroll: "Deslize",
  },
  sv: {
    hero: {
      titleTop: "Upplev Mallorca",
      titleBottom: "med NEXA.",
      subtitle:
        "Boka online, hämta i Magaluf och kör iväg med allt redo från första stund.",
      primaryCta: "Boka scooter",
    },
    finalCta: {
      eyebrow: "NEXA Rentals",
      title: "Redo att utforska Mallorca?",
      description:
        "Välj din scooter, boka online och hämta den i Magaluf med allt redo för resan.",
      button: "Starta bokning",
    },
    scroll: "Scrolla",
  },
};

const SCENES: Scene[] = [
  {
    id: "intro",
    type: "hero",
    startFrame: 1,
    endFrame: 92,
    number: "00",
    kicker: "NEXA RENTALS MALLORCA",
    title: "Ride Mallorca with NEXA.",
    text: "Book your scooter online in minutes.",
    heroLeft: "5.5vw",
    heroTop: "57%",
  },
  {
    id: "phone-holder",
    type: "callout",
    startFrame: 96,
    endFrame: 288,
    number: "01",
    kicker: "WATERPROOF PHONE HOLDER",
    title: "Navigation, protected.",
    text: "A waterproof phone holder is included, so you can follow routes around Mallorca with confidence.",
    side: "right",
    markerLeft: "39.5%",
    markerTop: "39%",
    lineWidth: 135,
    lineAngle: -5,
    textShiftY: -42,
  },
  {
    id: "seat-storage",
    type: "callout",
    startFrame: 326,
    endFrame: 398,
    number: "02",
    kicker: "UNDER-SEAT STORAGE",
    title: "Space under the seat.",
    text: "Extra storage for small bags, documents and essentials while you ride.",
    side: "right",
    markerLeft: "42.5%",
    markerTop: "61%",
    lineWidth: 150,
    lineAngle: -8,
    textShiftY: -54,
  },
  {
    id: "security-lock",
    type: "callout",
    startFrame: 388,
    endFrame: 452,
    number: "03",
    kicker: "SECURITY LOCK INCLUDED",
    title: "Park with confidence.",
    text: "A security lock is included with your rental, ready for safer stops around the island.",
    side: "right",
    markerLeft: "35.2%",
    markerTop: "43.5%",
    lineWidth: 132,
    lineAngle: 1,
    textShiftY: -52,
  },
  {
    id: "top-box",
    type: "callout",
    startFrame: 464,
    endFrame: 536,
    number: "04",
    kicker: "50L TOP BOX INCLUDED",
    title: "More space, every ride.",
    text: "A 50L rear top box gives you room for helmets, shopping bags and beach items.",
    side: "left",
    markerLeft: "66%",
    markerTop: "44%",
    lineWidth: 170,
    lineAngle: 4,
    textShiftY: -54,
  },
  {
    id: "helmet",
    type: "callout",
    startFrame: 537,
    endFrame: 616,
    number: "05",
    kicker: "HELMET INCLUDED FREE",
    title: "Ready from pickup.",
    text: "Helmet included with your scooter rental, ready before the ride begins.",
    side: "left",
    markerLeft: "64%",
    markerTop: "45%",
    lineWidth: 160,
    lineAngle: 2,
    textShiftY: -48,
  },
  {
    id: "outro",
    type: "hero",
    startFrame: 617,
    endFrame: 684,
    number: "06",
    kicker: "BOOK ONLINE",
    title: "Your ride starts here.",
    text: "Choose your scooter, select your time and reserve online in minutes.",
    heroLeft: "5.5vw",
    heroTop: "57%",
  },
];

function isLocale(value: string | undefined): value is Locale {
  return Boolean(value && LANGUAGES.some((language) => language.code === value));
}

function safeGetLocaleFromPath(pathname: string): Locale {
  const parts = pathname.split("/").filter(Boolean);
  const firstPart = parts[0];

  if (isLocale(firstPart)) return firstPart;

  return "en";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothStep(value: number) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function padFrame(frame: number) {
  return String(frame).padStart(4, "0");
}

function frameSrc(frame: number) {
  return `${FRAME_PATH}/frame_${padFrame(frame)}.${FRAME_EXTENSION}`;
}

function sceneOpacity(frame: number, scene: Scene) {
  const fadeFrames = 28;
  const fadeIn = smoothStep((frame - scene.startFrame) / fadeFrames);
  const fadeOut =
    1 - smoothStep((frame - (scene.endFrame - fadeFrames)) / fadeFrames);

  return clamp(Math.min(fadeIn, fadeOut), 0, 1);
}

function getTextStyle(scene: Scene, opacity: number): CSSProperties {
  const lift = (1 - opacity) * 18;

  if (scene.type === "hero") {
    return {
      left: scene.heroLeft || "5.5vw",
      top: scene.heroTop || "56%",
      transform: `translateY(${lift}px)`,
      width: "500px",
    };
  }

  const markerLeft = scene.markerLeft || "50%";
  const markerTop = scene.markerTop || "50%";
  const lineWidth = scene.lineWidth || 150;
  const textGap = 34;
  const shiftY = scene.textShiftY || -48;

  if (scene.side === "left") {
    return {
      right: `calc(100% - ${markerLeft} + ${lineWidth + textGap}px)`,
      top: `calc(${markerTop} + ${shiftY}px)`,
      transform: `translateX(-${(1 - opacity) * 22}px)`,
      width: "430px",
    };
  }

  return {
    left: `calc(${markerLeft} + ${lineWidth + textGap}px)`,
    top: `calc(${markerTop} + ${shiftY}px)`,
    transform: `translateX(${(1 - opacity) * 22}px)`,
    width: "430px",
  };
}

function getLineStyle(scene: Scene, opacity: number): CSSProperties {
  const markerLeft = scene.markerLeft || "50%";
  const markerTop = scene.markerTop || "50%";
  const lineWidth = scene.lineWidth || 150;
  const angle = scene.lineAngle || 0;

  if (scene.side === "left") {
    return {
      left: markerLeft,
      top: `calc(${markerTop} + 2px)`,
      width: `${lineWidth}px`,
      transform: `translateX(-${lineWidth + 15}px) rotate(${angle}deg) scaleX(${opacity})`,
      transformOrigin: "right center",
    };
  }

  return {
    left: markerLeft,
    top: `calc(${markerTop} + 2px)`,
    width: `${lineWidth}px`,
    transform: `translateX(15px) rotate(${angle}deg) scaleX(${opacity})`,
    transformOrigin: "left center",
  };
}

export default function HomeClientV3() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedFramesRef = useRef<Set<number>>(new Set());
  const failedFramesRef = useRef<Set<number>>(new Set());

  const animationFrameRef = useRef<number | null>(null);
  const imageLoadFrameRef = useRef<number | null>(null);
  const preloadTimerRef = useRef<number | null>(null);

  const lastDrawnFrameRef = useRef(0);
  const wantedFrameRef = useRef(1);
  const lastCanvasWidthRef = useRef(0);
  const lastCanvasHeightRef = useRef(0);

  const showBookingShowroomRef = useRef(false);
  const openingShowroomRef = useRef(false);
  const autoShowroomLockRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  const activeLocaleFromProvider = useLocale() as Locale;
  const pathname = usePathname() || "/";

  const detectedLocale = safeGetLocaleFromPath(pathname);
  const currentLocale: Locale = isLocale(activeLocaleFromProvider)
    ? activeLocaleFromProvider
    : detectedLocale;

  const copy = V3_COPY[currentLocale] || V3_COPY.en;

  const [hasResolvedMobileMode, setHasResolvedMobileMode] = useState(false);
  const [isMobileDirectShowroom, setIsMobileDirectShowroom] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [scrollHintVisible, setScrollHintVisible] = useState(true);
  const [showBookingShowroom, setShowBookingShowroom] = useState(false);
  const [isOpeningShowroom, setIsOpeningShowroom] = useState(false);
  const [showroomEntered, setShowroomEntered] = useState(false);

  const activeScene = useMemo(() => {
    return (
      SCENES.find(
        (scene) =>
          currentFrame >= scene.startFrame && currentFrame <= scene.endFrame,
      ) || null
    );
  }, [currentFrame]);

  const activeSceneOpacity = activeScene
    ? sceneOpacity(currentFrame, activeScene)
    : 0;

  const introHeroOpacity = clamp(
    1 - smoothStep((currentFrame - 58) / 54),
    0,
    1,
  );

  const shouldShowCallout =
    activeScene && activeScene.type === "callout" && activeSceneOpacity > 0;

  const finalCtaProgress = smoothStep((currentFrame - 630) / 34);

  function getPageScrollY() {
    if (typeof window === "undefined") return 0;

    return (
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  function getScrollProgress() {
    const section = sectionRef.current;

    if (!section || typeof window === "undefined") return 0;

    const scrollableDistance = Math.max(
      1,
      section.offsetHeight - window.innerHeight,
    );

    return clamp(
      (getPageScrollY() - section.offsetTop) / scrollableDistance,
      0,
      1,
    );
  }

  function getFrameFromProgress(progress: number) {
    return clamp(
      Math.round(progress * (FRAME_COUNT - 1)) + 1,
      1,
      FRAME_COUNT,
    );
  }

  function drawImageCover(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number,
  ) {
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let x: number;
    let y: number;

    if (imageAspect > canvasAspect) {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imageAspect;
      x = (canvasWidth - drawWidth) / 2;
      y = 0;
    } else {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imageAspect;
      x = 0;
      y = (canvasHeight - drawHeight) / 2;
    }

    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function drawImageContain(
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    canvasWidth: number,
    canvasHeight: number,
    frame: number,
  ) {
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth: number;
    let drawHeight: number;
    let x: number;
    let y: number;

    if (imageAspect > canvasAspect) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imageAspect;
      x = 0;
      y = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imageAspect;
      x = (canvasWidth - drawWidth) / 2;
      y = 0;
    }

    const introProgress = clamp(frame / 115, 0, 1);
    const introEase = smoothStep(introProgress);

    const introScale = 0.88 + introEase * 0.12;
    const introMoveX = canvasWidth * (0.07 * (1 - introEase));
    const introMoveY = canvasHeight * (0.065 * (1 - introEase));

    const finalWidth = drawWidth * introScale;
    const finalHeight = drawHeight * introScale;
    const finalX = x + (drawWidth - finalWidth) / 2 + introMoveX;
    const finalY = y + (drawHeight - finalHeight) / 2 + introMoveY;

    context.drawImage(image, finalX, finalY, finalWidth, finalHeight);
  }

  function drawFrame(frame: number, forceDraw = false) {
    const canvas = canvasRef.current;
    const image = imagesRef.current[frame];

    if (!canvas || !image || !image.complete || image.naturalWidth <= 0) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const targetWidth = Math.max(1, Math.floor(width * dpr));
    const targetHeight = Math.max(1, Math.floor(height * dpr));

    const canvasSizeChanged =
      canvas.width !== targetWidth ||
      canvas.height !== targetHeight ||
      lastCanvasWidthRef.current !== targetWidth ||
      lastCanvasHeightRef.current !== targetHeight;

    if (!forceDraw && !canvasSizeChanged && frame === lastDrawnFrameRef.current) {
      return;
    }

    if (canvasSizeChanged) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      lastCanvasWidthRef.current = targetWidth;
      lastCanvasHeightRef.current = targetHeight;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.save();
    context.filter = "blur(28px) brightness(1.08)";
    context.globalAlpha = 0.26;
    drawImageCover(context, image, canvas.width, canvas.height);
    context.restore();

    context.save();

    const gradient = context.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.46,
      canvas.width * 0.05,
      canvas.width * 0.5,
      canvas.height * 0.46,
      canvas.width * 0.76,
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(0.58, "rgba(0,0,0,0.12)");
    gradient.addColorStop(1, "rgba(0,0,0,0.02)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    context.save();
    context.filter = "brightness(1.12) contrast(1.04)";
    drawImageContain(context, image, canvas.width, canvas.height, frame);
    context.restore();

    lastDrawnFrameRef.current = frame;
    setCurrentFrame(frame);
  }

  function requestRedrawFromImageLoad(frame: number) {
    const wantedFrame = wantedFrameRef.current;

    if (frame !== 1 && Math.abs(frame - wantedFrame) > 120) return;
    if (imageLoadFrameRef.current !== null) return;

    imageLoadFrameRef.current = window.requestAnimationFrame(() => {
      imageLoadFrameRef.current = null;

      const progress = getScrollProgress();
      const targetFrame = getFrameFromProgress(progress);
      const readyFrame = getBestReadyFrame(targetFrame);

      if (readyFrame !== null) {
        drawFrame(readyFrame, true);
      }
    });
  }

  function ensureFrameLoaded(frame: number) {
    const safeFrame = clamp(Math.round(frame), 1, FRAME_COUNT);

    if (imagesRef.current[safeFrame]) return;
    if (failedFramesRef.current.has(safeFrame)) return;

    const image = new window.Image();

    image.decoding = "async";
    image.loading = "eager";

    image.onload = () => {
      loadedFramesRef.current.add(safeFrame);

      if (safeFrame === 1) {
        setFirstFrameReady(true);
        drawFrame(1, true);
      }

      setLoadingProgress(
        Math.min(
          100,
          Math.round((loadedFramesRef.current.size / FRAME_COUNT) * 100),
        ),
      );

      requestRedrawFromImageLoad(safeFrame);
    };

    image.onerror = () => {
      failedFramesRef.current.add(safeFrame);
      imagesRef.current[safeFrame] = null;

      if (process.env.NODE_ENV !== "production") {
        console.warn(`NEXA V3 frame failed to load: ${frameSrc(safeFrame)}`);
      }
    };

    imagesRef.current[safeFrame] = image;
    image.src = frameSrc(safeFrame);
  }

  function preloadAround(frame: number) {
    const safeFrame = clamp(Math.round(frame), 1, FRAME_COUNT);

    ensureFrameLoaded(safeFrame);

    for (let offset = 1; offset <= 90; offset++) {
      const before = safeFrame - offset;
      const after = safeFrame + offset;

      if (before >= 1) ensureFrameLoaded(before);
      if (after <= FRAME_COUNT) ensureFrameLoaded(after);
    }
  }

  function getBestReadyFrame(targetFrame: number) {
    const targetImage = imagesRef.current[targetFrame];

    if (targetImage?.complete && targetImage.naturalWidth > 0) {
      return targetFrame;
    }

    for (let offset = 1; offset <= 160; offset++) {
      const before = targetFrame - offset;
      const after = targetFrame + offset;

      if (before >= 1) {
        const beforeImage = imagesRef.current[before];

        if (beforeImage?.complete && beforeImage.naturalWidth > 0) {
          return before;
        }
      }

      if (after <= FRAME_COUNT) {
        const afterImage = imagesRef.current[after];

        if (afterImage?.complete && afterImage.naturalWidth > 0) {
          return after;
        }
      }
    }

    const firstImage = imagesRef.current[1];

    if (firstImage?.complete && firstImage.naturalWidth > 0) {
      return 1;
    }

    return null;
  }

  function drawCurrentScrollFrame(forceDraw = false) {
    const progress = getScrollProgress();
    const targetFrame = getFrameFromProgress(progress);

    wantedFrameRef.current = targetFrame;

    preloadAround(targetFrame);

    const frameToDraw = getBestReadyFrame(targetFrame);

    if (frameToDraw !== null) {
      drawFrame(frameToDraw, forceDraw);
    }
  }

  function startFrameLoop() {
    if (animationFrameRef.current !== null) return;

    const loop = () => {
      drawCurrentScrollFrame(false);
      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    animationFrameRef.current = window.requestAnimationFrame(loop);
  }

  function stopFrameLoop() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }

  function openBookingShowroom() {
    if (showBookingShowroomRef.current || openingShowroomRef.current) return;

    openingShowroomRef.current = true;
    autoShowroomLockRef.current = true;
    setIsOpeningShowroom(true);
    setShowroomEntered(false);

    window.history.pushState(
      { nexaView: "showroom" },
      "",
      window.location.href,
    );

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    window.setTimeout(() => {
      setShowBookingShowroom(true);

      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });

        window.requestAnimationFrame(() => {
          setIsOpeningShowroom(false);
          setShowroomEntered(true);
          openingShowroomRef.current = false;
        });
      });
    }, 520);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const updateMobileShowroom = () => {
      setIsMobileDirectShowroom(mediaQuery.matches);
      setHasResolvedMobileMode(true);
    };

    updateMobileShowroom();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMobileShowroom);
    } else {
      mediaQuery.addListener(updateMobileShowroom);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateMobileShowroom);
      } else {
        mediaQuery.removeListener(updateMobileShowroom);
      }
    };
  }, []);

  useEffect(() => {
    showBookingShowroomRef.current = showBookingShowroom;
  }, [showBookingShowroom]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!window.location.hash) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasResolvedMobileMode) return;
    if (isMobileDirectShowroom) return;
    if (showBookingShowroom) return;

    ensureFrameLoaded(1);

    for (let i = 2; i <= Math.min(FRAME_COUNT, 96); i++) {
      ensureFrameLoaded(i);
    }

    let cancelled = false;
    let nextFrame = 97;

    const preloadChunk = () => {
      if (cancelled) return;

      const endFrame = Math.min(FRAME_COUNT, nextFrame + 22);

      for (; nextFrame <= endFrame; nextFrame++) {
        ensureFrameLoaded(nextFrame);
      }

      if (nextFrame <= FRAME_COUNT) {
        preloadTimerRef.current = window.setTimeout(preloadChunk, 180);
      }
    };

    preloadTimerRef.current = window.setTimeout(preloadChunk, 500);

    const emergencyDraw = window.setTimeout(() => {
      drawCurrentScrollFrame(true);
    }, 850);

    return () => {
      cancelled = true;
      window.clearTimeout(emergencyDraw);

      if (preloadTimerRef.current !== null) {
        window.clearTimeout(preloadTimerRef.current);
        preloadTimerRef.current = null;
      }
    };
  }, [hasResolvedMobileMode, isMobileDirectShowroom, showBookingShowroom]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasResolvedMobileMode) return;
    if (isMobileDirectShowroom) return;
    if (showBookingShowroom) return;

    let resizeTimer: number | null = null;

    const forceDraw = () => {
      drawCurrentScrollFrame(true);
    };

    const handleScrollOrWheel = () => {
      drawCurrentScrollFrame(false);
    };

    const handleResize = () => {
      lastCanvasWidthRef.current = 0;
      lastCanvasHeightRef.current = 0;

      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        drawCurrentScrollFrame(true);
      }, 80);
    };

    window.addEventListener("scroll", handleScrollOrWheel, { passive: true });
    window.addEventListener("wheel", handleScrollOrWheel, { passive: true });
    window.addEventListener("touchmove", handleScrollOrWheel, { passive: true });
    window.addEventListener("resize", handleResize);

    const firstDrawFrame = window.requestAnimationFrame(() => {
      forceDraw();
      startFrameLoop();
    });

    const secondDrawTimer = window.setTimeout(() => {
      forceDraw();
    }, 650);

    return () => {
      window.cancelAnimationFrame(firstDrawFrame);
      window.clearTimeout(secondDrawTimer);

      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }

      window.removeEventListener("scroll", handleScrollOrWheel);
      window.removeEventListener("wheel", handleScrollOrWheel);
      window.removeEventListener("touchmove", handleScrollOrWheel);
      window.removeEventListener("resize", handleResize);

      stopFrameLoop();

      if (imageLoadFrameRef.current !== null) {
        window.cancelAnimationFrame(imageLoadFrameRef.current);
        imageLoadFrameRef.current = null;
      }
    };
  }, [
    hasResolvedMobileMode,
    isMobileDirectShowroom,
    showBookingShowroom,
    firstFrameReady,
  ]);

  useEffect(() => {
    if (showBookingShowroom) return;

    function canOpenShowroomFromEnd() {
      return (
        firstFrameReady &&
        !showBookingShowroomRef.current &&
        !autoShowroomLockRef.current &&
        !openingShowroomRef.current &&
        getScrollProgress() >= 0.992
      );
    }

    function openShowroomFromEnd() {
      if (!canOpenShowroomFromEnd()) return;
      openBookingShowroom();
    }

    function handleWheel(event: WheelEvent) {
      if (event.deltaY <= 0) return;
      if (!canOpenShowroomFromEnd()) return;

      event.preventDefault();
      openShowroomFromEnd();
    }

    function handleKeyDown(event: KeyboardEvent) {
      const forwardKeys = [
        "ArrowDown",
        "PageDown",
        " ",
        "Spacebar",
        "End",
      ];

      if (!forwardKeys.includes(event.key)) return;
      if (!canOpenShowroomFromEnd()) return;

      event.preventDefault();
      openShowroomFromEnd();
    }

    function handleTouchStart(event: TouchEvent) {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    }

    function handleTouchMove(event: TouchEvent) {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY ?? null;

      if (startY === null || currentY === null) return;

      const swipingUp = startY - currentY > 18;

      if (!swipingUp) return;
      if (!canOpenShowroomFromEnd()) return;

      event.preventDefault();
      openShowroomFromEnd();
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [firstFrameReady, showBookingShowroom]);

  useEffect(() => {
    function handlePopState() {
      if (showBookingShowroomRef.current || openingShowroomRef.current) {
        autoShowroomLockRef.current = false;
        openingShowroomRef.current = false;
        setIsOpeningShowroom(false);
        setShowroomEntered(false);
        setShowBookingShowroom(false);

        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    function hideScrollHintOnFirstScroll() {
      if (getPageScrollY() > 8) {
        setScrollHintVisible(false);
        window.removeEventListener("scroll", hideScrollHintOnFirstScroll);
        window.removeEventListener("wheel", hideScrollHintOnFirstScroll);
        window.removeEventListener("touchmove", hideScrollHintOnFirstScroll);
      }
    }

    window.addEventListener("scroll", hideScrollHintOnFirstScroll, {
      passive: true,
    });
    window.addEventListener("wheel", hideScrollHintOnFirstScroll, {
      passive: true,
    });
    window.addEventListener("touchmove", hideScrollHintOnFirstScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", hideScrollHintOnFirstScroll);
      window.removeEventListener("wheel", hideScrollHintOnFirstScroll);
      window.removeEventListener("touchmove", hideScrollHintOnFirstScroll);
    };
  }, []);

  if (!hasResolvedMobileMode) {
    return (
      <main
        className="fixed inset-0 z-[2147483000] min-h-[100svh] bg-black"
        aria-hidden="true"
      />
    );
  }

  if (isMobileDirectShowroom) {
    return (
      <main className="min-h-[100svh] overflow-hidden bg-black text-white">
        <NexaBookingShowroomV3 />
      </main>
    );
  }

  if (showBookingShowroom) {
    return (
      <main className="min-h-screen overflow-hidden bg-black text-white">
        <div
          className="min-h-screen transition-opacity duration-[850ms] ease-out"
          style={{ opacity: showroomEntered ? 1 : 0 }}
        >
          <NexaBookingShowroomV3 />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white">
      <style jsx global>{`
        html {
          scroll-behavior: auto !important;
        }

        body {
          background: #000000;
        }

        .nexa-v3-canvas {
          display: block;
          transform: translateZ(0);
          backface-visibility: hidden;
          will-change: transform;
        }

        .nexa-v3-text-shell {
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .nexa-v3-hero-title {
          text-wrap: balance;
        }

        .nexa-v3-hero-subtitle {
          text-wrap: pretty;
        }

        .nexa-v3-scroll-mouse {
          position: relative;
          width: 30px;
          height: 48px;
          border: 1px solid rgba(255, 255, 255, 0.48);
          border-radius: 999px;
          box-shadow:
            0 0 28px rgba(255, 255, 255, 0.08),
            inset 0 0 18px rgba(255, 255, 255, 0.04);
        }

        .nexa-v3-scroll-mouse::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 10px;
          width: 4px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.86);
          transform: translateX(-50%);
          animation: nexa-v3-scroll-dot 1.7s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.42);
        }

        @keyframes nexa-v3-scroll-dot {
          0% {
            opacity: 0;
            transform: translate(-50%, 0);
          }

          22% {
            opacity: 1;
          }

          70% {
            opacity: 1;
            transform: translate(-50%, 16px);
          }

          100% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
        }

        @media (max-width: 1023px) {
          .nexa-v3-desktop-text {
            display: none !important;
          }

          .nexa-v3-desktop-hero {
            display: none !important;
          }

          .nexa-v3-final-cta {
            display: none !important;
          }

          .nexa-v3-scroll-hint {
            display: none !important;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative bg-black"
        style={{ height: "1250vh" }}
      >
        <div className="sticky top-0 h-screen overflow-hidden bg-black">
          <canvas
            ref={canvasRef}
            className="nexa-v3-canvas relative z-10 h-screen w-screen"
          />

          <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_52%_42%,transparent_0%,rgba(0,0,0,0.04)_48%,rgba(0,0,0,0.46)_100%)]" />

          <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(90deg,rgba(0,0,0,0.44)_0%,rgba(0,0,0,0.22)_25%,transparent_52%,rgba(0,0,0,0.16)_100%)]" />

          <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.08)_18%,transparent_52%,rgba(0,0,0,0.34)_100%)]" />

          <NavbarV3 onBookClick={openBookingShowroom} />

          {!firstFrameReady && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
              <div
                className={`${uiFont.className} text-[11px] font-bold uppercase tracking-[0.34em] text-white/44`}
              >
                Loading NEXA 3.0
              </div>

              <div className="mt-4 h-px w-56 bg-white/10">
                <div
                  className="h-px bg-white"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              <div
                className={`${uiFont.className} mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/28`}
              >
                {loadingProgress}%
              </div>
            </div>
          )}

          <div
            className="nexa-v3-desktop-hero pointer-events-none absolute inset-0 z-30"
            style={{
              opacity: firstFrameReady ? introHeroOpacity : 0,
              transform: `translateY(${(1 - introHeroOpacity) * 18}px)`,
            }}
          >
            <div className="absolute left-[clamp(40px,5.2vw,88px)] top-[53%] w-[min(610px,42vw)] -translate-y-1/2">
              <h1
                className={`${titleFont.className} nexa-v3-hero-title text-[clamp(52px,5.05vw,86px)] font-light uppercase leading-[0.92] tracking-[0.015em] text-white drop-shadow-[0_30px_86px_rgba(0,0,0,0.86)]`}
              >
                <span className="block">{copy.hero.titleTop}</span>
                <span className="block text-white/90">
                  {copy.hero.titleBottom}
                </span>
              </h1>

              <p
                className={`${uiFont.className} nexa-v3-hero-subtitle mt-6 max-w-[440px] text-[15.5px] font-semibold leading-7 tracking-[0.01em] text-white/78 drop-shadow-[0_18px_46px_rgba(0,0,0,0.82)]`}
              >
                {copy.hero.subtitle}
              </p>

              <div
                className={`${uiFont.className} pointer-events-auto mt-9 flex items-center`}
              >
                <button
                  type="button"
                  onClick={openBookingShowroom}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-[12px] font-extrabold uppercase tracking-[0.24em] text-black shadow-[0_26px_76px_rgba(0,0,0,0.48)] transition hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.98]"
                >
                  <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(90deg,transparent,rgba(255,157,61,0.30),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
                  <span className="relative">{copy.hero.primaryCta}</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`${uiFont.className} nexa-v3-scroll-hint pointer-events-none absolute right-[clamp(44px,6.5vw,118px)] top-[58%] z-40 hidden -translate-y-1/2 flex-col items-center gap-4 transition-all duration-500 lg:flex`}
            style={{
              opacity:
                scrollHintVisible && currentFrame < 8 && firstFrameReady
                  ? 1
                  : 0,
              transform: `translateY(${
                scrollHintVisible && currentFrame < 8 ? "-50%" : "-44%"
              })`,
            }}
          >
            <div className="nexa-v3-scroll-mouse" />

            <div className="flex flex-col items-center gap-3">
              <span className="h-12 w-px bg-gradient-to-b from-white/42 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/46 [writing-mode:vertical-rl]">
                {copy.scroll}
              </span>
            </div>
          </div>

          {shouldShowCallout && (
            <div
              className="nexa-v3-desktop-text pointer-events-none absolute inset-0 z-30"
              style={{ opacity: activeSceneOpacity }}
            >
              {activeScene.type === "callout" &&
                activeScene.markerLeft &&
                activeScene.markerTop &&
                activeScene.lineWidth &&
                activeScene.side && (
                  <>
                    <div
                      className="absolute h-[7px] w-[7px] rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                      style={{
                        left: activeScene.markerLeft,
                        top: activeScene.markerTop,
                        transform: `translate(-50%, -50%) scale(${
                          0.78 + activeSceneOpacity * 0.22
                        })`,
                      }}
                    >
                      <span className="absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/22" />
                    </div>

                    <div
                      className="absolute overflow-hidden"
                      style={getLineStyle(activeScene, activeSceneOpacity)}
                    >
                      <div
                        className={[
                          "h-px w-full",
                          activeScene.side === "left"
                            ? "bg-gradient-to-l from-white via-white/50 to-transparent"
                            : "bg-gradient-to-r from-white via-white/50 to-transparent",
                        ].join(" ")}
                      />
                    </div>
                  </>
                )}

              <div
                className="nexa-v3-text-shell absolute"
                style={getTextStyle(activeScene, activeSceneOpacity)}
              >
                <div className={`${uiFont.className} flex items-center gap-4`}>
                  <span className="h-px w-11 bg-white/80" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-white/78">
                    {activeScene.number} / {activeScene.kicker}
                  </span>
                </div>

                <h2
                  className={`${titleFont.className} mt-4 text-[42px] font-light uppercase leading-[0.92] tracking-[0.01em] text-white drop-shadow-[0_18px_46px_rgba(0,0,0,0.78)]`}
                >
                  {activeScene.title}
                </h2>

                <p
                  className={`${uiFont.className} mt-4 max-w-[370px] text-[14px] font-medium leading-7 tracking-[0.01em] text-white/76 drop-shadow-[0_12px_34px_rgba(0,0,0,0.7)]`}
                >
                  {activeScene.text}
                </p>
              </div>
            </div>
          )}

          <div
            className="nexa-v3-final-cta pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-8 transition-all duration-700"
            style={{
              opacity: currentFrame >= 630 ? finalCtaProgress : 0,
              transform: `translateY(${(1 - finalCtaProgress) * 22}px)`,
            }}
          >
            <div className="absolute inset-0 bg-black/28 backdrop-blur-[7px]" />

            <div className="pointer-events-auto relative z-10 flex max-w-[920px] flex-col items-center text-center">
              <div
                className={`${uiFont.className} mb-5 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.32em] text-white/42`}
              >
                <span className="h-px w-16 bg-[#ff9d3d]/70" />
                {copy.finalCta.eyebrow}
                <span className="h-px w-16 bg-[#ff9d3d]/70" />
              </div>

              <h2
                className={`${titleFont.className} text-[clamp(48px,5vw,82px)] font-light uppercase leading-[0.92] tracking-[0.01em] text-white drop-shadow-[0_30px_90px_rgba(0,0,0,0.82)]`}
              >
                {copy.finalCta.title}
              </h2>

              <p
                className={`${uiFont.className} mt-6 max-w-[560px] text-[15px] font-medium leading-7 tracking-[0.01em] text-white/68 drop-shadow-[0_18px_46px_rgba(0,0,0,0.82)]`}
              >
                {copy.finalCta.description}
              </p>

              <button
                type="button"
                onClick={openBookingShowroom}
                className={`${uiFont.className} group relative mt-9 inline-flex items-center justify-center overflow-hidden rounded-full bg-white px-9 py-4 text-[12px] font-extrabold uppercase tracking-[0.24em] text-black shadow-[0_28px_80px_rgba(0,0,0,0.52)] transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]`}
              >
                <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(90deg,transparent,rgba(255,157,61,0.30),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
                <span className="relative">{copy.finalCta.button}</span>
              </button>
            </div>
          </div>

          <div
            className="pointer-events-none fixed inset-0 z-[999] bg-black transition-opacity duration-[520ms] ease-in-out"
            style={{ opacity: isOpeningShowroom ? 1 : 0 }}
          />
        </div>
      </section>
    </main>
  );
}