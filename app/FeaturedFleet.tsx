"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/* ============================== CONFIG ============================== */
const ORANGE = "#FF7A00";
const BAR_BG = "#fff9f5";
const DEEP_ORANGE = "#FF6A00";
const DEFAULT_LOCATION = "Magaluf (Carrer Galeón 13)";

type Vehicle = {
  id: string;
  name: string;
  type: "Scooter" | "E-Bike";
  pricePerDay: number;
  badge: string;
  imageUrl: string;
  available: boolean;
  stockLabel?: string;
};

type DateRange = { from?: Date; to?: Date };
type ActiveField = "pickup" | "dropoff";
type PickerMode = "vehicle" | "viewAll";
type Locale = "en" | "es" | "de" | "fr" | "sv" | "it" | "pt";

const FEATURED: Vehicle[] = [
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 39,
    badge: "Best Seller",
    imageUrl: "/images/liberty125.png",
    available: false,
    stockLabel: "RENTED OUT",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    type: "Scooter",
    pricePerDay: 39,
    badge: "Practical",
    imageUrl: "/images/sym.png",
    available: false,
    stockLabel: "RENTED OUT",
  },
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 49,
    badge: "Performance",
    imageUrl: "/images/zontes125.png",
    available: false,
    stockLabel: "RENTED OUT",
  },
  {
    id: "e2",
    name: "CITY e-BIKE COMFORT",
    type: "E-Bike",
    pricePerDay: 28,
    badge: "Great Value",
    imageUrl: "/images/e20.png",
    available: false,
    stockLabel: "RENTED OUT",
  },
];

/* =========================== LOCALE HELPERS =========================== */
function getDocLocale() {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang || "en";
}

function getLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
  const supported: Locale[] = ["en", "es", "de", "fr", "sv", "it", "pt"];
  return first && supported.includes(first) ? first : "en";
}

/* =========================== DATE HELPERS =========================== */
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function addDays(d: Date, days: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isPastDay(d: Date) {
  return startOfDay(d) < startOfDay(new Date());
}
function isBeforeDay(a: Date, b: Date) {
  return startOfDay(a) < startOfDay(b);
}
function minDropoffDate(from: Date) {
  return startOfDay(addDays(from, 1));
}
function clampRange(from?: Date, to?: Date): DateRange {
  if (!from && !to) return {};
  if (from && !to) return { from };
  if (!from && to) return { from: to };
  if (from && to && to < from) return { from: to, to: from };
  return { from, to };
}
function fmtLabel(d?: Date) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(getDocLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const last = endOfMonth(viewMonth);
  const startDow = (first.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);

  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function toISO(d: Date) {
  return d.toLocaleDateString("en-CA");
}
function formatPrice(price: number) {
  return Math.round(price);
}
function dayDiff(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86400000);
}
function isWholeDayRental(from?: Date, to?: Date, pickupTime?: string, dropoffTime?: string) {
  if (!from || !to || !pickupTime || !dropoffTime) return false;
  const days = dayDiff(from, to);
  if (days < 1) return false;
  return pickupTime === dropoffTime;
}
function rentalLengthLabel(from?: Date, to?: Date) {
  if (!from || !to) return "";
  const days = dayDiff(from, to);
  if (days < 1) return "";
  if (days === 1) return "1 day (24h)";
  return `${days} days (${days * 24}h)`;
}

/* =========================== TIME HELPERS =========================== */
function buildTimeOptions() {
  const out: string[] = [];
  for (let h = 9; h <= 20; h++) {
    for (const m of [0, 30]) {
      if (h === 9 && m === 0) continue;
      if (h === 20 && m === 30) continue;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}
function formatTimeLabel(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const date = new Date();
  date.setHours(hh, mm, 0, 0);

  return new Intl.DateTimeFormat(getDocLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

/* ============================== UI ============================== */
export default function FeaturedFleet() {
  const t = useTranslations("featuredFleet");
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname() || "/";
  const currentLocale = useMemo(() => getLocaleFromPath(pathname), [pathname]);

  const items = useMemo(() => FEATURED, []);
  const mobileItems = useMemo(
    () =>
      FEATURED.filter((v) => v.id === "s2" || v.id === "e2").sort((a, b) =>
        a.id === "s2" ? -1 : b.id === "s2" ? 1 : 0
      ),
    []
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>("vehicle");

  const TIME_OPTIONS = useMemo(() => buildTimeOptions(), []);
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const [pickupLocation] = useState(DEFAULT_LOCATION);
  const [range, setRange] = useState<DateRange>(() => clampRange(today, tomorrow));
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");

  const [scrollStartMonth, setScrollStartMonth] = useState(() => startOfMonth(today));
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));
  const [monthsAhead, setMonthsAhead] = useState(10);

  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);

  const pickupTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropoffTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const pickupTimePopRef = useRef<HTMLDivElement | null>(null);
  const dropoffTimePopRef = useRef<HTMLDivElement | null>(null);

  const monthsScrollRef = useRef<HTMLDivElement | null>(null);
  const monthWrapRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [err, setErr] = useState("");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const START_DELAY_MS = 350;
    const STEP_MS = 350;

    let startTimer: ReturnType<typeof setTimeout> | null = null;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    if (inView) {
      setActiveIndex(-1);

      startTimer = setTimeout(() => {
        items.forEach((_, i) => {
          timers.push(
            setTimeout(() => {
              setActiveIndex((prev) => (i > prev ? i : prev));
            }, i * STEP_MS)
          );
        });
      }, START_DELAY_MS);
    } else {
      setActiveIndex(-1);
    }

    return () => {
      if (startTimer) clearTimeout(startTimer);
      timers.forEach(clearTimeout);
    };
  }, [inView, items]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const tNode = e.target as Node;

      if (pickupTimePopRef.current?.contains(tNode)) return;
      if (dropoffTimePopRef.current?.contains(tNode)) return;
      if (pickupTimeBtnRef.current?.contains(tNode)) return;
      if (dropoffTimeBtnRef.current?.contains(tNode)) return;

      setPickupTimeOpen(false);
      setDropoffTimeOpen(false);
    }

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    setDropoffTime(pickupTime);
  }, [pickupTime]);

  const DROP_TIME_OPTIONS = useMemo(() => {
    return [pickupTime];
  }, [pickupTime]);

  const monthsList = useMemo(
    () => Array.from({ length: monthsAhead + 1 }, (_, i) => addMonths(scrollStartMonth, i)),
    [scrollStartMonth, monthsAhead]
  );

  const currentIndex = useMemo(() => {
    const a = startOfMonth(scrollStartMonth).getTime();
    const b = startOfMonth(viewMonth).getTime();
    const diffMonths =
      (new Date(b).getFullYear() - new Date(a).getFullYear()) * 12 +
      (new Date(b).getMonth() - new Date(a).getMonth());

    return Math.max(0, Math.min(monthsList.length - 1, diffMonths));
  }, [scrollStartMonth, viewMonth, monthsList.length]);

  const rentalLabel = useMemo(() => rentalLengthLabel(range.from, range.to), [range.from, range.to]);

  useEffect(() => {
    if (!calendarOpen) return;

    const timer = window.setTimeout(() => {
      monthsScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      setViewMonth(scrollStartMonth);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [calendarOpen, scrollStartMonth]);

  function openCalendar(which: ActiveField) {
    setErr("");
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);
    setActiveField(which);

    const anchor = startOfMonth((which === "pickup" ? range.from : range.to) || range.from || today);

    setScrollStartMonth(anchor);
    setViewMonth(anchor);
    setMonthsAhead(10);
    setCalendarOpen(true);
  }

  function closeCalendar() {
    setCalendarOpen(false);
  }

  function clearDates() {
    setErr("");
    setRange({});
    setActiveField("pickup");
  }

  function pickDate(day: Date) {
    if (isPastDay(day)) return;

    if (activeField === "dropoff" && range.from) {
      const minDay = minDropoffDate(range.from);
      if (isBeforeDay(day, minDay)) {
        setErr("Return must be at least 1 full day after pickup. Rentals must follow 24h, 48h, 72h format.");
        return;
      }
    }

    setErr("");

    if (activeField === "pickup") {
      const nextFrom = day;
      const minDay = minDropoffDate(nextFrom);
      const nextTo = range.to && !isBeforeDay(range.to, minDay) ? range.to : minDay;

      setRange({ from: nextFrom, to: nextTo });
      setDropoffTime(pickupTime);
      setActiveField("dropoff");
      return;
    }

    if (!range.from) {
      setRange({ from: day });
      return;
    }

    const next = clampRange(range.from, day);

    if (next.from && next.to) {
      const minDay = minDropoffDate(next.from);
      if (isBeforeDay(next.to, minDay)) {
        setRange({ from: next.from, to: minDay });
        setErr("Minimum rental is 1 full day. Please choose 1 day, 2 days, 3 days, etc.");
      } else {
        setRange(next);
      }
    } else {
      setRange(next);
    }

    setDropoffTime(pickupTime);
  }

  function togglePickupTime() {
    setCalendarOpen(false);
    setDropoffTimeOpen(false);
    setPickupTimeOpen((v) => !v);
    setErr("");
  }

  function toggleDropoffTime() {
    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen((v) => !v);
    setErr("Return time must match pickup time exactly. Example: 10:00 pickup = 10:00 return after 1 day, 2 days, 3 days, etc.");
  }

  function openPickerForVehicle(v: Vehicle) {
    if (!v.available) return;

    setPickerMode("vehicle");
    setSelected(v);
    setOpen(true);
    setErr("");

    setRange(clampRange(today, tomorrow));
    setPickupTime("10:00");
    setDropoffTime("10:00");
    setScrollStartMonth(startOfMonth(today));
    setViewMonth(startOfMonth(today));
    setMonthsAhead(10);

    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);
  }

  function openViewAllPicker() {
    setPickerMode("viewAll");
    setSelected(null);
    setOpen(true);
    setErr("");

    setRange({});
    setPickupTime("10:00");
    setDropoffTime("10:00");
    setScrollStartMonth(startOfMonth(today));
    setViewMonth(startOfMonth(today));
    setMonthsAhead(10);
    setActiveField("pickup");

    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);
  }

  function closePicker() {
    setOpen(false);
    setErr("");
    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);
    setSelected(null);
    setPickerMode("vehicle");
  }

  function badgeToKey(badge: string) {
    switch (badge) {
      case "Best Seller":
        return "badges.bestSeller";
      case "Comfort Pick":
        return "badges.comfortPick";
      case "Practical":
        return "badges.practical";
      case "Great Value":
        return "badges.greatValue";
      default:
        return null;
    }
  }

  function getAvailabilityTone(v: Vehicle) {
    if (!v.available) {
      return {
        text: "RENTED OUT",
        color: "#FF4D4F",
        bg: "rgba(255,77,79,0.14)",
        border: "rgba(255,77,79,0.30)",
      };
    }

    if (v.stockLabel?.toLowerCase().includes("1 left")) {
      return {
        text: "1 Left",
        color: ORANGE,
        bg: "rgba(255,122,0,0.16)",
        border: "rgba(255,122,0,0.35)",
      };
    }

    return {
      text: "Available",
      color: "#22C55E",
      bg: "rgba(34,197,94,0.16)",
      border: "rgba(34,197,94,0.35)",
    };
  }

  function scrollToMonth(index: number) {
    const el = monthsScrollRef.current;
    const node = monthWrapRefs.current[index];
    if (!el || !node) return;
    el.scrollTo({ top: node.offsetTop - 8, behavior: "smooth" });
  }

  function onMonthsScroll() {
    const el = monthsScrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    if (scrollTop + clientHeight >= scrollHeight - 220) {
      setMonthsAhead((n) => n + 6);
    }

    const targetY = scrollTop + 12;
    let bestIdx = 0;

    for (let i = 0; i < monthWrapRefs.current.length; i++) {
      const node = monthWrapRefs.current[i];
      if (!node) continue;
      const y = node.offsetTop;
      if (y <= targetY) bestIdx = i;
      else break;
    }

    const m = monthsList[bestIdx];
    if (m) setViewMonth(m);
  }

  function proceedFromPicker() {
    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);

    if (!range.from || !range.to) {
      setErr(t("errors.missingDates"));
      setActiveField(range.from ? "dropoff" : "pickup");
      setCalendarOpen(true);
      return;
    }

    const minDay = minDropoffDate(range.from);
    if (isBeforeDay(range.to, minDay)) {
      setRange({ from: range.from, to: minDay });
      setErr("Minimum rental is 1 full day. Please choose 1 day, 2 days, 3 days, etc.");
      return;
    }

    if (!isWholeDayRental(range.from, range.to, pickupTime, dropoffTime)) {
      setDropoffTime(pickupTime);
      setErr("Rentals must follow exact 24h blocks. Return time must match pickup time, for example 24h, 48h, 72h, etc.");
      return;
    }

    const params = new URLSearchParams(sp.toString());
    params.set("pickupLocation", pickupLocation);
    params.set("from", toISO(range.from));
    params.set("to", toISO(range.to));
    params.set("pickupTime", pickupTime);
    params.set("dropoffTime", pickupTime);

    if (pickerMode === "viewAll") {
      router.push(`/${currentLocale}/vehicles?${params.toString()}`);
      closePicker();
      return;
    }

    if (!selected) return;

    if (!selected.available) {
      setErr("This vehicle is currently unavailable.");
      return;
    }

    params.set("vehicleId", selected.id);
    router.push(`/${currentLocale}/checkout?${params.toString()}`);
    closePicker();
  }

  return (
    <>
      <section ref={sectionRef} className="relative w-full">
        <div
          className={[
            "transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className="text-[12px] font-black tracking-[0.32em] uppercase"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.72), rgba(255,180,116,0.95), rgba(255,255,255,0.55))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {t("header.kicker")}
              </div>

              <h2
                className="mt-3 text-2xl md:text-3xl font-black tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {t("header.title")}
              </h2>

              <p className="mt-2 text-white/65 max-w-2xl">{t("header.subtitle")}</p>
            </div>

            <button
              onClick={openViewAllPicker}
              className="rounded-xl px-6 py-3 text-sm font-black text-black hover:opacity-90 transition"
              style={{ background: ORANGE }}
            >
              {t("header.viewAll")}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-6 lg:hidden">
            {mobileItems.map((v, idx) => {
              const show = idx <= activeIndex;
              const isPiaggio = v.id === "s2";
              const availability = getAvailabilityTone(v);

              const badgeText = isPiaggio
                ? t("badges.bestSeller")
                : (() => {
                    const key = badgeToKey(v.badge);
                    return key ? t(key as never) : v.badge;
                  })();

              const typeLabel = t(`vehicleTypes.${v.type}` as never);

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => openPickerForVehicle(v)}
                  disabled={!v.available}
                  className={[
                    "group relative w-full text-left",
                    "transition-all duration-700 ease-out",
                    show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16",
                    !v.available ? "cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {isPiaggio && (
                    <div className="pointer-events-none absolute inset-0 -z-10">
                      <div className="bestSellerGlow absolute -inset-6 rounded-[34px]" />
                      <div className="bestSellerAura absolute left-1/2 top-[50%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                    </div>
                  )}

                  <div
                    className={[
                      "rounded-3xl border p-4 md:p-5 transition-all duration-500 group-hover:-translate-y-[2px] group-hover:shadow-[0_24px_70px_rgba(0,0,0,0.55)]",
                      isPiaggio ? "cardSweepBestSeller" : "",
                    ].join(" ")}
                    style={{
                      borderColor: !v.available
                        ? "rgba(255,77,79,0.28)"
                        : isPiaggio
                        ? "rgba(255,122,0,0.58)"
                        : "rgba(255,255,255,0.12)",
                      background: !v.available
                        ? "linear-gradient(180deg, rgba(255,77,79,0.08) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.03) 100%)"
                        : isPiaggio
                        ? "linear-gradient(180deg, rgba(255,122,0,0.13) 0%, rgba(255,255,255,0.028) 52%, rgba(255,255,255,0.03) 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.03) 100%)",
                      boxShadow: !v.available
                        ? "0 18px 50px rgba(255,77,79,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
                        : isPiaggio
                        ? "0 28px 90px rgba(255,122,0,0.22), 0 0 0 1px rgba(255,170,90,0.05), inset 0 1px 0 rgba(255,255,255,0.07)"
                        : "inset 0 1px 0 rgba(255,255,255,0.06)",
                      opacity: !v.available ? 0.78 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          borderColor: isPiaggio ? "rgba(255,122,0,0.55)" : "rgba(255,255,255,0.14)",
                          background: isPiaggio ? "rgba(255,122,0,0.18)" : "rgba(0,0,0,0.18)",
                          color: isPiaggio ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.80)",
                        }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{
                            background: isPiaggio ? ORANGE : "rgba(255,180,116,0.95)",
                            boxShadow: isPiaggio
                              ? "0 0 22px rgba(255,122,0,0.55)"
                              : "0 0 18px rgba(255,122,0,0.35)",
                          }}
                        />
                        {badgeText}
                      </div>

                      <div
                        className="shrink-0 rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          color: availability.color,
                          background: availability.bg,
                          borderColor: availability.border,
                        }}
                      >
                        {availability.text}
                      </div>
                    </div>

                    <div className="relative mx-auto mt-3 h-[220px] w-full">
                      <div className="pointer-events-none absolute left-1/2 bottom-7 h-10 w-[78%] -translate-x-1/2 rounded-full bg-black/60 blur-xl opacity-70 transition-all duration-500 ease-out group-hover:bottom-6 group-hover:opacity-90" />
                      {isPiaggio && (
                        <div className="pointer-events-none absolute left-1/2 top-[58%] h-[130px] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,122,0,0.18)] blur-[45px]" />
                      )}
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1"
                      />
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold tracking-wide text-white/55">{typeLabel}</div>
                        <div className="truncate text-sm md:text-[15px] font-black text-white">{v.name}</div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-[11px] font-bold text-white/55">{t("pricing.from")}</div>
                        <div className="text-sm font-black" style={{ color: ORANGE }}>
                          €{formatPrice(v.pricePerDay)}
                          <span className="text-xs text-white/45">{t("pricing.perDay")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div
                        className="text-xs font-black"
                        style={{
                          color: !v.available
                            ? "rgba(255,77,79,0.92)"
                            : v.stockLabel === "Available"
                            ? "#22C55E"
                            : "rgba(255,255,255,0.82)",
                        }}
                      >
                        {!v.available ? "RENTED OUT" : v.stockLabel === "Available" ? "Available" : "Only 1 left"}
                      </div>

                      <div
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition"
                        style={{
                          background: !v.available
                            ? "linear-gradient(180deg, rgba(120,120,120,0.95) 0%, rgba(95,95,95,0.90) 100%)"
                            : `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                          boxShadow: !v.available
                            ? "0 12px 30px rgba(0,0,0,0.20)"
                            : isPiaggio
                            ? "0 18px 46px rgba(255,122,0,0.28)"
                            : "0 16px 40px rgba(255,122,0,0.16)",
                          color: !v.available ? "rgba(255,255,255,0.95)" : "#000",
                        }}
                      >
                        {!v.available ? "RENTED OUT" : t("cta.rentIt")}
                        {v.available ? <ArrowIcon /> : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:grid grid-cols-4 gap-8">
            {items.map((v, idx) => {
              const show = idx <= activeIndex;
              const availability = getAvailabilityTone(v);
              const isBestSeller = v.id === "s2";

              const badgeText = (() => {
                const key = badgeToKey(v.badge);
                return key ? t(key as never) : v.badge;
              })();

              const typeLabel = t(`vehicleTypes.${v.type}` as never);

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => openPickerForVehicle(v)}
                  disabled={!v.available}
                  className={[
                    "group relative w-full text-left",
                    "transition-all duration-700 ease-out",
                    show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16",
                    !v.available ? "cursor-not-allowed" : "",
                    isBestSeller ? "lg:scale-[1.06] z-20" : "",
                  ].join(" ")}
                >
                  <div className="pointer-events-none absolute inset-0 -z-10">
                    <div
                      className="absolute left-1/2 top-[52%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] opacity-40 transition-opacity duration-500 group-hover:opacity-55"
                      style={{
                        background: !v.available
                          ? "radial-gradient(circle, rgba(255,77,79,0.14) 0%, rgba(255,255,255,0.00) 70%)"
                          : isBestSeller
                          ? "radial-gradient(circle, rgba(255,122,0,0.28) 0%, rgba(255,180,116,0.12) 38%, rgba(255,255,255,0.00) 72%)"
                          : "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.00) 70%)",
                      }}
                    />
                    {isBestSeller && (
                      <>
                        <div className="bestSellerGlow absolute -inset-6 rounded-[34px]" />
                        <div className="bestSellerAura absolute left-1/2 top-[52%] h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                      </>
                    )}
                  </div>

                  <div
                    className={[
                      "rounded-3xl border p-4 md:p-5 transition-all duration-500 group-hover:-translate-y-[2px] group-hover:shadow-[0_24px_70px_rgba(0,0,0,0.55)]",
                      isBestSeller ? "cardSweepBestSeller" : "",
                    ].join(" ")}
                    style={{
                      borderColor: !v.available
                        ? "rgba(255,77,79,0.26)"
                        : isBestSeller
                        ? "rgba(255,122,0,0.58)"
                        : "rgba(255,255,255,0.12)",
                      background: !v.available
                        ? "linear-gradient(180deg, rgba(255,77,79,0.08) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.03) 100%)"
                        : isBestSeller
                        ? "linear-gradient(180deg, rgba(255,122,0,0.13) 0%, rgba(255,255,255,0.028) 52%, rgba(255,255,255,0.03) 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.03) 100%)",
                      boxShadow: !v.available
                        ? "0 18px 50px rgba(255,77,79,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
                        : isBestSeller
                        ? "0 30px 95px rgba(255,122,0,0.24), 0 0 0 1px rgba(255,160,80,0.05), inset 0 1px 0 rgba(255,255,255,0.07)"
                        : "inset 0 1px 0 rgba(255,255,255,0.06)",
                      opacity: !v.available ? 0.78 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          borderColor: isBestSeller ? "rgba(255,122,0,0.34)" : "rgba(255,255,255,0.14)",
                          background: isBestSeller ? "rgba(255,122,0,0.13)" : "rgba(0,0,0,0.18)",
                          color: "rgba(255,255,255,0.82)",
                        }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{
                            background: "rgba(255,180,116,0.95)",
                            boxShadow: isBestSeller
                              ? "0 0 24px rgba(255,122,0,0.55)"
                              : "0 0 18px rgba(255,122,0,0.35)",
                          }}
                        />
                        {badgeText}
                      </div>

                      <div
                        className="shrink-0 rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          color: availability.color,
                          background: availability.bg,
                          borderColor: availability.border,
                        }}
                      >
                        {availability.text}
                      </div>
                    </div>

                    <div className="relative mx-auto mt-3 h-[220px] w-full">
                      <div className="pointer-events-none absolute left-1/2 bottom-7 h-10 w-[78%] -translate-x-1/2 rounded-full bg-black/60 blur-xl opacity-70 transition-all duration-500 ease-out group-hover:bottom-6 group-hover:opacity-90" />
                      {isBestSeller && (
                        <div className="pointer-events-none absolute left-1/2 top-[58%] h-[130px] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,122,0,0.18)] blur-[45px]" />
                      )}
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1"
                      />
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold tracking-wide text-white/55">{typeLabel}</div>
                        <div className="truncate text-sm md:text-[15px] font-black text-white">{v.name}</div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-[11px] font-bold text-white/55">{t("pricing.from")}</div>
                        <div className="text-sm font-black" style={{ color: ORANGE }}>
                          €{formatPrice(v.pricePerDay)}
                          <span className="text-xs text-white/45">{t("pricing.perDay")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div
                        className="inline-flex rounded-full border px-3 py-1 text-[11px] font-black"
                        style={{
                          color: availability.color,
                          background: availability.bg,
                          borderColor: availability.border,
                        }}
                      >
                        {!v.available ? "RENTED OUT" : v.stockLabel === "1 Left" ? "Only 1 left" : "Available"}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div
                        className="text-xs font-black"
                        style={{
                          color: !v.available
                            ? "rgba(255,77,79,0.92)"
                            : v.stockLabel === "Available"
                            ? "#22C55E"
                            : "rgba(255,255,255,0.82)",
                        }}
                      >
                        {!v.available ? "RENTED OUT" : v.stockLabel === "1 Left" ? "Only 1 left" : "Available"}
                      </div>

                      <div
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition"
                        style={{
                          background: !v.available
                            ? "linear-gradient(180deg, rgba(120,120,120,0.95) 0%, rgba(95,95,95,0.90) 100%)"
                            : `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                          boxShadow: !v.available
                            ? "0 12px 30px rgba(0,0,0,0.20)"
                            : isBestSeller
                            ? "0 18px 46px rgba(255,122,0,0.28)"
                            : "0 16px 40px rgba(255,122,0,0.16)",
                          color: !v.available ? "rgba(255,255,255,0.95)" : "#000",
                        }}
                      >
                        {!v.available ? "RENTED OUT" : t("cta.rentIt")}
                        {v.available ? <ArrowIcon /> : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-[999] grid place-items-center px-4">
            <button
              type="button"
              aria-label="Close"
              onClick={closePicker}
              className="absolute inset-0 cursor-default"
              style={{
                background:
                  "radial-gradient(900px 520px at 50% 0%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 62%), rgba(0,0,0,0.70)",
              }}
            />

            <div
              className="relative w-full max-w-5xl overflow-visible rounded-[28px] border"
              style={{
                borderColor: "rgba(255,255,255,0.12)",
                background: "linear-gradient(180deg, rgba(15,17,21,0.96) 0%, rgba(12,14,18,0.96) 100%)",
                boxShadow: "0 36px 110px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div className="relative p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold tracking-wide text-white/60">
                      {pickerMode === "viewAll" ? t("header.viewAll") : t("modal.title")}
                    </div>
                    <div className="mt-1 text-lg md:text-xl font-black text-white">
                      {pickerMode === "viewAll" ? "Select your booking dates first" : selected?.name}
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      {pickerMode === "viewAll"
                        ? "Choose pickup and dropoff details to see all available vehicles."
                        : t("modal.subtitle")}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePicker}
                    className="grid h-10 w-10 place-items-center rounded-2xl border text-white/70 transition hover:text-white"
                    style={{
                      borderColor: "rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
                      <PinIcon />
                      <span className="whitespace-nowrap">Pickup</span>
                      <span className="text-white truncate max-w-[220px] sm:max-w-[360px]">
                        {pickupLocation}
                      </span>
                    </span>

                    {rentalLabel ? (
                      <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1 backdrop-blur text-white">
                        {rentalLabel}
                      </span>
                    ) : null}
                  </div>

                  <div
                    className={[
                      "grid grid-cols-1 gap-2",
                      "lg:inline-flex lg:items-stretch lg:gap-0",
                      "rounded-2xl overflow-visible border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
                    ].join(" ")}
                    style={{ background: BAR_BG }}
                  >
                    <div className="flex gap-2 lg:contents">
                      <button
                        type="button"
                        onClick={() => openCalendar("pickup")}
                        className={[
                          "flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition",
                          "rounded-2xl border border-black/15",
                          "lg:flex-none lg:rounded-none lg:border-0 lg:min-w-[170px] lg:border-r lg:border-black/15",
                        ].join(" ")}
                      >
                        <CalendarMini />
                        <div className="leading-tight">
                          <div className="text-[11px] font-semibold text-black/65">Pickup date</div>
                          <div className="text-[13px] font-extrabold text-black">{fmtLabel(range.from)}</div>
                        </div>
                      </button>

                      <div
                        className={[
                          "relative flex-1 rounded-2xl border border-black/15",
                          "lg:flex-none lg:rounded-none lg:border-0 lg:min-w-[160px] lg:border-r lg:border-black/15",
                        ].join(" ")}
                      >
                        <button
                          ref={pickupTimeBtnRef}
                          type="button"
                          onClick={togglePickupTime}
                          className="w-full h-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition rounded-2xl lg:rounded-none"
                        >
                          <ClockMini />
                          <div className="leading-tight">
                            <div className="text-[11px] font-semibold text-black/65">Time</div>
                            <div className="text-[13px] font-extrabold text-black">
                              {formatTimeLabel(pickupTime)}
                            </div>
                          </div>
                        </button>

                        {pickupTimeOpen && (
                          <div ref={pickupTimePopRef}>
                            <TimeDropdown
                              title="Pickup time"
                              value={pickupTime}
                              options={TIME_OPTIONS}
                              onSelect={(selectedTime) => {
                                setPickupTime(selectedTime);
                                setDropoffTime(selectedTime);
                                setErr("");
                                setPickupTimeOpen(false);
                              }}
                              onClose={() => setPickupTimeOpen(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 lg:contents">
                      <button
                        type="button"
                        onClick={() => openCalendar("dropoff")}
                        className={[
                          "flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition",
                          "rounded-2xl border border-black/15",
                          "lg:flex-none lg:rounded-none lg:border-0 lg:min-w-[170px] lg:border-r lg:border-black/15",
                        ].join(" ")}
                      >
                        <CalendarMini />
                        <div className="leading-tight">
                          <div className="text-[11px] font-semibold text-black/65">Dropoff date</div>
                          <div className="text-[13px] font-extrabold text-black">{fmtLabel(range.to)}</div>
                        </div>
                      </button>

                      <div
                        className={[
                          "relative flex-1 rounded-2xl border border-black/15",
                          "lg:flex-none lg:rounded-none lg:border-0 lg:min-w-[160px]",
                        ].join(" ")}
                      >
                        <button
                          ref={dropoffTimeBtnRef}
                          type="button"
                          onClick={toggleDropoffTime}
                          className="w-full h-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition rounded-2xl lg:rounded-none"
                        >
                          <ClockMini />
                          <div className="leading-tight">
                            <div className="text-[11px] font-semibold text-black/65">Time</div>
                            <div className="text-[13px] font-extrabold text-black">
                              {formatTimeLabel(dropoffTime)}
                            </div>
                          </div>
                        </button>

                        {dropoffTimeOpen && (
                          <div ref={dropoffTimePopRef}>
                            <TimeDropdown
                              title="Dropoff time"
                              value={dropoffTime}
                              options={DROP_TIME_OPTIONS}
                              onSelect={(selectedTime) => {
                                setDropoffTime(selectedTime);
                                setErr("");
                                setDropoffTimeOpen(false);
                              }}
                              onClose={() => setDropoffTimeOpen(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={proceedFromPicker}
                      className={[
                        "w-full rounded-2xl py-3 font-extrabold text-black text-[15px] hover:brightness-95 active:scale-[0.99] transition",
                        "lg:w-auto lg:rounded-r-2xl lg:rounded-l-none lg:px-7 lg:min-w-[120px] lg:py-0",
                      ].join(" ")}
                      style={{ background: DEEP_ORANGE }}
                    >
                      {pickerMode === "viewAll" ? "Show all" : t("buttons.proceed")}
                    </button>
                  </div>

                  {err ? (
                    <div
                      className="mt-4 rounded-2xl border px-4 py-3 text-sm"
                      style={{
                        borderColor: "rgba(255,122,0,0.35)",
                        background: "rgba(255,122,0,0.10)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      {err}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{
                      borderColor: "rgba(255,122,0,0.22)",
                      background: "rgba(255,122,0,0.06)",
                      color: "rgba(255,255,255,0.78)",
                    }}>
                      Rental hours: 09:30 AM - 08:00 PM. Return time must match pickup time exactly for 24h, 48h, 72h, etc.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="button"
                    onClick={closePicker}
                    className="rounded-2xl px-4 py-3 text-sm font-black text-white/75 transition hover:text-white"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  >
                    {t("buttons.back")}
                  </button>

                  <button
                    type="button"
                    onClick={proceedFromPicker}
                    className="rounded-2xl px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
                    style={{
                      background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                      boxShadow: "0 18px 44px rgba(255,122,0,0.20)",
                    }}
                  >
                    {pickerMode === "viewAll" ? "Show all vehicles" : t("buttons.proceed")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {calendarOpen && (
          <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeCalendar();
            }}
          >
            <div
              className="w-full max-w-[560px] max-h-[85svh] rounded-2xl shadow-2xl overflow-hidden animate-[pop_.12s_ease-out]"
              style={{ background: BAR_BG }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                <div>
                  <div className="text-sm text-black/55 font-semibold">
                    {activeField === "pickup" ? "Select pickup date" : "Select dropoff date"}
                  </div>
                  <div className="text-base font-extrabold text-black">
                    {fmtLabel(range.from)} → {fmtLabel(range.to)}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-black/60">
                    Select only 1 day, 2 days, 3 days, etc. Return time will always match pickup time.
                  </div>
                </div>

                <button
                  onClick={closeCalendar}
                  className="h-9 w-9 rounded-xl hover:bg-black/5 text-black/70 transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => scrollToMonth(Math.max(0, currentIndex - 1))}
                  className="h-9 w-9 rounded-xl border border-black/15 hover:bg-black/5 transition"
                >
                  ‹
                </button>

                <div
                  className="rounded-xl border border-black/15 px-4 py-2 font-extrabold text-black"
                  style={{ background: BAR_BG }}
                >
                  {viewMonth.toLocaleString(getDocLocale(), {
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => scrollToMonth(Math.min(monthsList.length - 1, currentIndex + 1))}
                  className="h-9 w-9 rounded-xl border border-black/15 hover:bg-black/5 transition"
                >
                  ›
                </button>
              </div>

              <div
                ref={monthsScrollRef}
                onScroll={onMonthsScroll}
                className="calendarScroll px-3 pb-4 overflow-y-auto md:overflow-y-scroll"
                style={{ maxHeight: "55svh" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthsList.map((m, i) => (
                    <div
                      key={`${m.getFullYear()}-${m.getMonth()}`}
                      ref={(el) => {
                        monthWrapRefs.current[i] = el;
                      }}
                    >
                      <MiniMonth
                        month={m}
                        range={range}
                        onPick={pickDate}
                        activeField={activeField}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-black/10 bg-black/5">
                <button
                  type="button"
                  onClick={clearDates}
                  className="text-sm font-extrabold text-black/70 hover:text-black transition"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={closeCalendar}
                  className="rounded-xl px-5 py-2 font-extrabold text-black hover:brightness-95 transition"
                  style={{ background: DEEP_ORANGE }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes pop {
          from {
            transform: translateY(-6px) scale(0.985);
            opacity: 0.4;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes bestSellerGlowPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.985);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.02);
          }
        }

        @keyframes bestSellerAuraPulse {
          0%,
          100% {
            opacity: 0.32;
            transform: translate(-50%, -50%) scale(0.96);
          }
          50% {
            opacity: 0.55;
            transform: translate(-50%, -50%) scale(1.06);
          }
        }

        @keyframes bestSellerSweepLoop {
          0% {
            opacity: 0;
            transform: translate(-140%, 140%) rotate(-28deg);
          }
          10% {
            opacity: 0;
            transform: translate(-140%, 140%) rotate(-28deg);
          }
          26% {
            opacity: 0.12;
          }
          40% {
            opacity: 0.5;
            transform: translate(0%, 0%) rotate(-28deg);
          }
          54% {
            opacity: 0.14;
          }
          68% {
            opacity: 0;
            transform: translate(140%, -140%) rotate(-28deg);
          }
          100% {
            opacity: 0;
            transform: translate(140%, -140%) rotate(-28deg);
          }
        }

        .bestSellerGlow {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 122, 0, 0.22) 0%,
            rgba(255, 160, 80, 0.1) 38%,
            rgba(255, 122, 0, 0.02) 58%,
            rgba(255, 122, 0, 0) 74%
          );
          filter: blur(24px);
          animation: bestSellerGlowPulse 3.8s ease-in-out infinite;
        }

        .bestSellerAura {
          background: radial-gradient(
            circle,
            rgba(255, 122, 0, 0.22) 0%,
            rgba(255, 160, 80, 0.12) 34%,
            rgba(255, 122, 0, 0.03) 58%,
            rgba(255, 122, 0, 0) 74%
          );
          filter: blur(50px);
          animation: bestSellerAuraPulse 4.2s ease-in-out infinite;
        }

        .cardSweepBestSeller {
          position: relative;
          overflow: hidden;
        }

        .cardSweepBestSeller::after {
          content: "";
          position: absolute;
          left: -38%;
          bottom: -42%;
          width: 72%;
          height: 190%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.06) 30%,
            rgba(255, 255, 255, 0.26) 50%,
            rgba(255, 236, 210, 0.1) 62%,
            rgba(255, 255, 255, 0.03) 72%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(-28deg);
          filter: blur(2px);
          pointer-events: none;
          animation: bestSellerSweepLoop 4.8s ease-in-out infinite;
        }

        @media (min-width: 768px) {
          .calendarScroll::-webkit-scrollbar {
            width: 10px;
          }

          .calendarScroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.08);
            border-radius: 999px;
          }

          .calendarScroll::-webkit-scrollbar-thumb {
            background: rgba(255, 106, 0, 0.7);
            border-radius: 999px;
            border: 2px solid ${BAR_BG};
          }

          .calendarScroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 106, 0, 0.95);
          }
        }
      `}</style>
    </>
  );
}

/* ============================ MINI MONTH ============================ */
function MiniMonth({
  month,
  range,
  onPick,
  activeField,
}: {
  month: Date;
  range: DateRange;
  onPick: (d: Date) => void;
  activeField: ActiveField;
}) {
  const cells = useMemo(() => buildMonthGrid(month), [month]);

  const minDropDay =
    activeField === "dropoff" && range.from ? minDropoffDate(range.from) : null;

  const weekdays = useMemo(() => {
    const locale = getDocLocale();
    const baseMonday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }).map((_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(
          baseMonday.getFullYear(),
          baseMonday.getMonth(),
          baseMonday.getDate() + i
        )
      )
    );
  }, []);

  return (
    <div className="rounded-xl border border-black/10 p-3" style={{ background: BAR_BG }}>
      <div className="mb-2 text-sm font-extrabold text-black">
        {month.toLocaleString(getDocLocale(), { month: "long", year: "numeric" })}
      </div>

      <div className="grid grid-cols-7 text-[11px] text-black/55 mb-2 font-semibold">
        {weekdays.map((w, idx) => (
          <div key={`${w}-${idx}`} className="py-1 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, idx) => {
          if (!d) return <div key={idx} className="h-9" />;

          const isStart = !!range.from && isSameDay(d, range.from);
          const isEnd = !!range.to && isSameDay(d, range.to);

          const disabledByPast = isPastDay(d) && !isStart && !isEnd;
          const disabledByMinDrop =
            !!minDropDay &&
            startOfDay(d) < startOfDay(minDropDay) &&
            !isStart &&
            !isEnd;

          const disabled = disabledByPast || disabledByMinDrop;

          const inRange =
            !!range.from &&
            !!range.to &&
            startOfDay(d) >= startOfDay(range.from) &&
            startOfDay(d) <= startOfDay(range.to);

          const isMiddleRange = inRange && !isStart && !isEnd;
          const hoverClass = !disabled && !isStart && !isEnd ? "hover:bg-orange-200" : "";

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={[
                "h-9 rounded-lg font-extrabold text-[13px]",
                "transition-colors duration-150 ease-out",
                disabled ? "text-black/25 cursor-not-allowed" : "",
                !disabled && !isStart && !isEnd ? "text-black" : "",
                hoverClass,
                isMiddleRange && !disabled ? "bg-orange-300/60 text-black" : "",
                (isStart || isEnd) && !disabled
                  ? "text-white shadow-[0_6px_16px_rgba(255,106,0,0.35)]"
                  : "",
              ].join(" ")}
              style={(isStart || isEnd) && !disabled ? { background: DEEP_ORANGE } : undefined}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ TIME DROPDOWN ============================ */
function TimeDropdown({
  title,
  value,
  options,
  onSelect,
  onClose,
}: {
  title: string;
  value: string;
  options: string[];
  onSelect: (t: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute left-0 bottom-full mb-2 z-[999] w-[240px] rounded-2xl border border-black/10 shadow-2xl overflow-hidden"
      style={{ background: BAR_BG }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
        <div className="text-sm font-extrabold text-black">{title}</div>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-xl hover:bg-black/5 text-black/70 transition"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[260px] overflow-auto p-2">
        {options.map((time) => {
          const active = time === value;
          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelect(time)}
              className={[
                "w-full text-left px-3 py-2 rounded-xl font-extrabold transition",
                active ? "text-black" : "text-black hover:bg-orange-200",
              ].join(" ")}
              style={active ? { background: DEEP_ORANGE } : undefined}
            >
              {formatTimeLabel(time)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================ ICONS ================================ */
function ArrowIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h12" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function CalendarMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-black/70" fill="none">
      <path
        d="M8 2v3M16 2v3M3 9h18M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ClockMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-black/70" fill="none">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-white" fill="none">
      <path
        d="M12 22s7-5.2 7-12A7 7 0 1 0 5 10c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}