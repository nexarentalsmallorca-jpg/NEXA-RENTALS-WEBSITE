"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type DateRange = { from?: Date; to?: Date };
type ActiveField = "pickup" | "dropoff";
type Locale = "en" | "es" | "de" | "fr" | "sv" | "it" | "pt";
type RentalPlan = "half" | "full" | null;

/* ----------------------------- Config ----------------------------- */
const BAR_BG = "#fff9f5";
const CARD_BG = "#fffdfb";
const DEEP_ORANGE = "#FF6A00";
const SOFT_ORANGE = "#FFF0E6";
const DARK_CARD = "#0E1117";
const DEFAULT_LOCATION = "Magaluf (Carrer Galeón 13)";

const HALF_DAY_OLD_PRICE = 45;
const HALF_DAY_PRICE = 39;
const HALF_DAY_RETURN_TIME = "20:00";
const HALF_DAY_TIME_OPTIONS = [
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
];

const FULL_DAY_BASE_PRICE = 49;
const FULL_DAY_PRICING: Record<number, number> = {
  1: 49,
  2: 47,
  3: 45,
  4: 44,
  5: 43,
  6: 42,
};

/* -------------------------- Locale helpers -------------------------- */
function getDocLocale() {
  if (typeof document === "undefined") return "en";
  return document.documentElement.lang || "en";
}

function getLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
  const supported: Locale[] = ["en", "es", "de", "fr", "sv", "it", "pt"];
  return first && supported.includes(first) ? first : "en";
}

/* -------------------------- Date helpers -------------------------- */
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
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isPastDay(d: Date) {
  return startOfDay(d) < startOfDay(new Date());
}
function clampRange(from?: Date, to?: Date): DateRange {
  if (!from && !to) return {};
  if (from && !to) return { from };
  if (!from && to) return { from: to };
  if (from && to && to < from) return { from: to, to: from };
  return { from, to };
}
function parseISO(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
function toISO(d: Date) {
  return d.toLocaleDateString("en-CA");
}
function fmtLabel(d?: Date) {
  if (!d) return "--/--/----";
  const locale = getDocLocale();
  return d.toLocaleDateString(locale, {
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
function minDropoffDate(from: Date) {
  return startOfDay(addDays(from, 1));
}
function isBeforeDay(a: Date, b: Date) {
  return startOfDay(a) < startOfDay(b);
}
function dayDiff(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86400000);
}

/* -------------------------- Time helpers -------------------------- */
function buildFullDayTimeOptions() {
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
  const locale = getDocLocale();
  const [hh, mm] = t.split(":").map(Number);
  const date = new Date();
  date.setHours(hh, mm, 0, 0);

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
function isValidTimeOption(t: string, options: string[]) {
  return options.includes(t);
}
function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}
function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/* -------------------------- URL helpers -------------------------- */
function getQueryParam(name: string) {
  if (typeof window === "undefined") return undefined;
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(name);
  return v || undefined;
}

/* -------------------------- Pricing helpers -------------------------- */
function getFullDayRate(days: number) {
  if (days <= 1) return FULL_DAY_PRICING[1];
  if (days >= 6) return FULL_DAY_PRICING[6];
  return FULL_DAY_PRICING[days];
}

/* ========================== MAIN COMPONENT ========================== */
export default function BookingBar() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const currentLocale = useMemo(() => getLocaleFromPath(pathname), [pathname]);

  const FULL_DAY_TIME_OPTIONS = useMemo(() => buildFullDayTimeOptions(), []);
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const urlFrom = parseISO(getQueryParam("from"));
  const urlTo = parseISO(getQueryParam("to"));
  const urlPickupTime = getQueryParam("pickupTime");
  const urlDropoffTime = getQueryParam("dropoffTime");
  const urlPickupLocation = getQueryParam("pickupLocation");
  const urlPlan = getQueryParam("plan") as RentalPlan | undefined;

  const [pickupLocation] = useState(urlPickupLocation || DEFAULT_LOCATION);
  const [plan, setPlan] = useState<RentalPlan>(urlPlan === "half" || urlPlan === "full" ? urlPlan : null);
  const [range, setRange] = useState<DateRange>(() => {
    if (urlPlan === "half" && urlFrom) {
      return { from: startOfDay(urlFrom), to: startOfDay(urlFrom) };
    }
    if (urlPlan === "full" && urlFrom && urlTo) {
      return clampRange(startOfDay(urlFrom), startOfDay(urlTo));
    }
    return {};
  });

  const [pickupTime, setPickupTime] = useState(() => {
    if (urlPlan === "half" && urlPickupTime && isValidTimeOption(urlPickupTime, HALF_DAY_TIME_OPTIONS)) {
      return urlPickupTime;
    }
    if (urlPlan === "full" && urlPickupTime && isValidTimeOption(urlPickupTime, FULL_DAY_TIME_OPTIONS)) {
      return urlPickupTime;
    }
    return "10:00";
  });

  const [dropoffTime, setDropoffTime] = useState(() => {
    if (urlPlan === "half") return HALF_DAY_RETURN_TIME;
    if (urlPlan === "full" && urlDropoffTime && isValidTimeOption(urlDropoffTime, FULL_DAY_TIME_OPTIONS)) {
      return urlDropoffTime;
    }
    return "10:00";
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");
  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [validationNotice, setValidationNotice] = useState("");

  const [scrollStartMonth, setScrollStartMonth] = useState(() => startOfMonth(urlFrom || today));
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(urlFrom || today));
  const [monthsAhead, setMonthsAhead] = useState(10);

  const pickupTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const pickupTimePopRef = useRef<HTMLDivElement | null>(null);
  const monthsScrollRef = useRef<HTMLDivElement | null>(null);
  const monthWrapRefs = useRef<Array<HTMLDivElement | null>>([]);

  const hasChosenPlan = plan !== null;
  const pickupTimeOptions = plan === "half" ? HALF_DAY_TIME_OPTIONS : FULL_DAY_TIME_OPTIONS;

  const monthsList = useMemo(() => {
    return Array.from({ length: monthsAhead + 1 }, (_, i) => addMonths(scrollStartMonth, i));
  }, [scrollStartMonth, monthsAhead]);

  const fullDayCount = useMemo(() => {
    if (plan !== "full" || !range.from || !range.to) return 0;
    return Math.max(1, dayDiff(range.from, range.to));
  }, [plan, range.from, range.to]);

  const fullDayRate = useMemo(() => {
    if (plan !== "full" || !fullDayCount) return FULL_DAY_BASE_PRICE;
    return getFullDayRate(fullDayCount);
  }, [plan, fullDayCount]);

  const originalPerDay = useMemo(() => {
    if (plan === "half") return HALF_DAY_OLD_PRICE;
    if (plan === "full") return FULL_DAY_BASE_PRICE;
    return 0;
  }, [plan]);

  const discountedPerDay = useMemo(() => {
    if (plan === "half") return HALF_DAY_PRICE;
    if (plan === "full") return fullDayRate;
    return 0;
  }, [plan, fullDayRate]);

  const totalPrice = useMemo(() => {
    if (plan === "half") return HALF_DAY_PRICE;
    if (plan === "full") return fullDayRate * fullDayCount;
    return 0;
  }, [plan, fullDayRate, fullDayCount]);

  const savingsTotal = useMemo(() => {
    if (!plan) return 0;
    if (plan === "half") return HALF_DAY_OLD_PRICE - HALF_DAY_PRICE;
    return (FULL_DAY_BASE_PRICE - fullDayRate) * fullDayCount;
  }, [plan, fullDayRate, fullDayCount]);

  const summaryTitle = useMemo(() => {
    if (plan === "half") return "Half Day Plan";
    if (plan === "full") return fullDayCount <= 1 ? "1 Day Plan" : `${fullDayCount} Day Plan`;
    return "Select Rental Type";
  }, [plan, fullDayCount]);

  const halfDayAvailableForSelectedDay = useMemo(() => {
    if (!range.from) return true;
    if (!isSameDay(range.from, today)) return true;
    return nowMinutes() <= 14 * 60;
  }, [range.from, today]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;

      if (pickupTimeBtnRef.current && pickupTimeBtnRef.current.contains(target)) return;
      if (pickupTimePopRef.current && pickupTimePopRef.current.contains(target)) return;

      setPickupTimeOpen(false);
    }

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (plan === "half") {
      if (!isValidTimeOption(pickupTime, HALF_DAY_TIME_OPTIONS)) {
        setPickupTime("10:00");
      }
      setDropoffTime(HALF_DAY_RETURN_TIME);

      setRange((prev) => {
        const from = prev.from || today;
        return { from, to: from };
      });
    }

    if (plan === "full") {
      if (!isValidTimeOption(pickupTime, FULL_DAY_TIME_OPTIONS)) {
        setPickupTime("10:00");
      }
      setDropoffTime(pickupTime);

      setRange((prev) => {
        const from = prev.from || today;
        const to = prev.to && !isSameDay(prev.to, from) ? prev.to : minDropoffDate(from);
        return { from, to };
      });
    }

    setValidationNotice("");
  }, [plan, today]);

  useEffect(() => {
    if (plan === "full") {
      setDropoffTime(pickupTime);
    }
  }, [pickupTime, plan]);

  useEffect(() => {
    if (plan === "half" && !halfDayAvailableForSelectedDay) {
      setPlan("full");
      setValidationNotice("Half day is only available for same-day rentals before 2:00 PM.");
    }
  }, [plan, halfDayAvailableForSelectedDay]);

  function showValidationNotice(message: string) {
    setValidationNotice(message);
  }

  function requirePlanFirst() {
    showValidationNotice("Please select Half Day or Full Day first.");
  }

  function openCalendar(which: ActiveField) {
    if (!hasChosenPlan) {
      requirePlanFirst();
      return;
    }

    if (plan === "half" && which === "dropoff") {
      showValidationNotice("Half day always returns the same day at 8:00 PM.");
      return;
    }

    setValidationNotice("");
    setPickupTimeOpen(false);
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
    setValidationNotice("");
    if (plan === "half") {
      setRange({});
      return;
    }
    if (plan === "full") {
      setRange({});
      setActiveField("pickup");
    }
  }

  function pickDate(day: Date) {
    if (isPastDay(day)) return;

    if (plan === "half") {
      setRange({ from: day, to: day });
      setValidationNotice("");
      return;
    }

    if (plan === "full" && activeField === "dropoff" && range.from) {
      const minDay = minDropoffDate(range.from);
      if (isBeforeDay(day, minDay)) {
        showValidationNotice("Full day rental must be at least 24 hours. Return date must be at least 1 day after pickup.");
        return;
      }
    }

    setValidationNotice("");

    if (activeField === "pickup") {
      const nextFrom = day;
      const minDay = minDropoffDate(nextFrom);
      const nextTo = range.to && !isBeforeDay(range.to, minDay) ? range.to : minDay;

      setRange({ from: nextFrom, to: nextTo });
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
      } else {
        setRange(next);
      }
    } else {
      setRange(next);
    }
  }

  function togglePickupTime() {
    if (!hasChosenPlan) {
      requirePlanFirst();
      return;
    }

    setCalendarOpen(false);
    setPickupTimeOpen((v) => !v);
    setValidationNotice("");
  }

  function onSearch() {
    setCalendarOpen(false);
    setPickupTimeOpen(false);

    if (!plan) {
      requirePlanFirst();
      return;
    }

    if (!range.from) {
      showValidationNotice("Please select your pickup date.");
      return;
    }

    if (plan === "half") {
      const pickupMinutes = timeToMinutes(pickupTime);
      const selectedToday = isSameDay(range.from, today);

      if (selectedToday && nowMinutes() > 14 * 60) {
        showValidationNotice("Half day is only available before 2:00 PM.");
        return;
      }

      if (pickupMinutes > 14 * 60) {
        showValidationNotice("Half day pickup time must be from 9:30 AM until 2:00 PM.");
        return;
      }

      const params = new URLSearchParams({
        pickupLocation,
        plan: "half",
        from: toISO(range.from),
        to: toISO(range.from),
        pickupTime,
        dropoffTime: HALF_DAY_RETURN_TIME,
      });

      router.push(`/${currentLocale}/vehicles?${params.toString()}`);
      return;
    }

    if (!range.to) {
      showValidationNotice("Please select your return date.");
      return;
    }

    const minDay = minDropoffDate(range.from);
    if (isBeforeDay(range.to, minDay)) {
      showValidationNotice("Full day rental must be at least 24 hours.");
      return;
    }

    if (pickupTime !== dropoffTime) {
      setDropoffTime(pickupTime);
      showValidationNotice("For full day rentals, return time must match pickup time exactly.");
      return;
    }

    const params = new URLSearchParams({
      pickupLocation,
      plan: "full",
      from: toISO(range.from),
      to: toISO(range.to),
      pickupTime,
      dropoffTime: pickupTime,
    });

    router.push(`/${currentLocale}/vehicles?${params.toString()}`);
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

  useEffect(() => {
    if (!calendarOpen) return;

    const t = window.setTimeout(() => {
      monthsScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      setViewMonth(scrollStartMonth);
    }, 0);

    return () => window.clearTimeout(t);
  }, [calendarOpen, scrollStartMonth]);

  function scrollToMonth(index: number) {
    const el = monthsScrollRef.current;
    const node = monthWrapRefs.current[index];
    if (!el || !node) return;
    el.scrollTo({ top: node.offsetTop - 8, behavior: "smooth" });
  }

  const currentIndex = useMemo(() => {
    const a = startOfMonth(scrollStartMonth).getTime();
    const b = startOfMonth(viewMonth).getTime();
    const diffMonths =
      (new Date(b).getFullYear() - new Date(a).getFullYear()) * 12 +
      (new Date(b).getMonth() - new Date(a).getMonth());

    return Math.max(0, Math.min(monthsList.length - 1, diffMonths));
  }, [scrollStartMonth, viewMonth, monthsList.length]);

  return (
    <div className="relative z-50 w-full max-w-[370px]">
      <div className="overflow-hidden rounded-[30px] border border-white/60 shadow-[0_22px_80px_rgba(0,0,0,0.20)] backdrop-blur-sm" style={{ background: BAR_BG }}>
        <div className="border-b border-black/8 px-5 py-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#6E6E73] px-3 py-1.5 text-[12px] font-semibold text-white">
            <PinIcon />
            <span className="truncate">{pickupLocation}</span>
          </div>

          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-black/45">
            Premium Booking
          </div>

          <h3 className="mt-1 text-[30px] font-black leading-none text-black">
            Book Your Ride
          </h3>

          <p className="mt-2 text-[13px] font-medium leading-5 text-black/60">
            Choose rental type first. Then select your date and time.
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setPlan("half");
                setValidationNotice("");
              }}
              className={[
                "relative rounded-[24px] border px-4 py-4 text-left transition",
                plan === "half"
                  ? "border-transparent shadow-[0_14px_32px_rgba(255,106,0,0.22)]"
                  : "border-black/10 hover:border-black/20",
              ].join(" ")}
              style={{ background: plan === "half" ? CARD_BG : "#ffffff" }}
            >
              <div className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                Most Popular
              </div>

              <div className="mt-7 text-[13px] font-black uppercase tracking-[0.08em] text-black/45">
                Half Day
              </div>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-[22px] font-black leading-none text-black/35 line-through">
                  €{HALF_DAY_OLD_PRICE}
                </span>
                <span className="text-[34px] font-black leading-none text-[#FF6A00]">
                  €{HALF_DAY_PRICE}
                </span>
              </div>

              <div className="mt-3 text-[12px] font-semibold leading-5 text-black/65">
                Pickup from 09:30 to 14:00
                <br />
                Return same day at 20:00
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setPlan("full");
                setValidationNotice("");
              }}
              className={[
                "rounded-[24px] border px-4 py-4 text-left transition",
                plan === "full"
                  ? "border-transparent shadow-[0_14px_32px_rgba(255,106,0,0.22)]"
                  : "border-black/10 hover:border-black/20",
              ].join(" ")}
              style={{ background: plan === "full" ? CARD_BG : "#ffffff" }}
            >
              <div className="text-[13px] font-black uppercase tracking-[0.08em] text-black/45">
                Full Day
              </div>

              <div className="mt-1 flex items-end gap-2">
                <span className="text-[22px] font-black leading-none text-black/35 line-through">
                  €55
                </span>
                <span className="text-[34px] font-black leading-none text-black">
                  €49
                </span>
              </div>

              <div className="mt-3 text-[12px] font-semibold leading-5 text-black/65">
                24h, 48h, 72h, etc.
                <br />
                Return time = pickup time
              </div>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => openCalendar("pickup")}
              disabled={!hasChosenPlan}
              className={[
                "flex w-full items-center justify-between rounded-[20px] border px-4 py-4 text-left transition",
                hasChosenPlan
                  ? "border-black/10 hover:border-black/20"
                  : "cursor-not-allowed border-black/8 opacity-55",
              ].join(" ")}
              style={{ background: CARD_BG }}
            >
              <div className="flex items-center gap-3">
                <CalendarMini />
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-black/45">
                    Pickup Date
                  </div>
                  <div className="text-[16px] font-black text-black">
                    {fmtLabel(range.from)}
                  </div>
                </div>
              </div>
              <span className="text-[13px] font-bold text-black/55">Change</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={togglePickupTime}
                disabled={!hasChosenPlan}
                ref={pickupTimeBtnRef}
                className={[
                  "relative flex items-center justify-between rounded-[20px] border px-4 py-4 text-left transition",
                  hasChosenPlan
                    ? "border-black/10 hover:border-black/20"
                    : "cursor-not-allowed border-black/8 opacity-55",
                ].join(" ")}
                style={{ background: CARD_BG }}
              >
                <div className="flex items-center gap-3">
                  <ClockMini />
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-black/45">
                      Pickup Time
                    </div>
                    <div className="text-[16px] font-black text-black">
                      {formatTimeLabel(pickupTime)}
                    </div>
                  </div>
                </div>

                <span className="text-[13px] font-bold text-black/55">Select</span>

                {pickupTimeOpen && hasChosenPlan && (
                  <div ref={pickupTimePopRef}>
                    <TimeDropdown
                      title={plan === "half" ? "Half Day Pickup Time" : "Full Day Pickup Time"}
                      value={pickupTime}
                      options={pickupTimeOptions}
                      onSelect={(selected) => {
                        setPickupTime(selected);
                        if (plan === "full") setDropoffTime(selected);
                        setPickupTimeOpen(false);
                        setValidationNotice("");
                      }}
                      onClose={() => setPickupTimeOpen(false)}
                    />
                  </div>
                )}
              </button>

              <div
                className="flex items-center justify-between rounded-[20px] border border-black/10 px-4 py-4"
                style={{ background: plan === "half" ? SOFT_ORANGE : CARD_BG }}
              >
                <div className="flex items-center gap-3">
                  <ClockMini />
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-black/45">
                      Return Time
                    </div>
                    <div className="text-[16px] font-black text-black">
                      {plan === "half" ? formatTimeLabel(HALF_DAY_RETURN_TIME) : formatTimeLabel(dropoffTime)}
                    </div>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-black/50">
                  {plan === "half" ? "Fixed" : "Matched"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openCalendar("dropoff")}
              disabled={!hasChosenPlan || plan === "half"}
              className={[
                "flex w-full items-center justify-between rounded-[20px] border px-4 py-4 text-left transition",
                hasChosenPlan && plan === "full"
                  ? "border-black/10 hover:border-black/20"
                  : "cursor-not-allowed border-black/8 opacity-55",
              ].join(" ")}
              style={{ background: plan === "half" ? SOFT_ORANGE : CARD_BG }}
            >
              <div className="flex items-center gap-3">
                <CalendarMini />
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-black/45">
                    Return Date
                  </div>
                  <div className="text-[16px] font-black text-black">
                    {plan === "half" ? fmtLabel(range.from) : fmtLabel(range.to)}
                  </div>
                </div>
              </div>
              <span className="text-[13px] font-bold text-black/55">
                {plan === "half" ? "Same Day" : "Change"}
              </span>
            </button>
          </div>

          <div className="mt-4 rounded-[24px] p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]" style={{ background: DARK_CARD }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/45">
                  Booking Summary
                </div>
                <div className="mt-2 text-[24px] font-black leading-none">
                  {summaryTitle}
                </div>
              </div>

              <div className="rounded-[20px] bg-white/8 px-4 py-3 text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/50">
                  Final Price
                </div>
                <div className="mt-1 text-[34px] font-black leading-none">
                  {plan ? `€${totalPrice}` : "--"}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[13px] font-semibold text-white/78">
              <div>
                {fmtLabel(range.from)} • {formatTimeLabel(pickupTime)}
              </div>
              <div>
                {plan === "half" ? fmtLabel(range.from) : fmtLabel(range.to)} •{" "}
                {plan === "half" ? formatTimeLabel(HALF_DAY_RETURN_TIME) : formatTimeLabel(dropoffTime)}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-[13px] font-bold text-white/85">
                <span>Price/day before discount</span>
                <span>{plan ? `€${originalPerDay}` : "--"}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-[13px] font-bold text-white/85">
                <span>Discounted price/day</span>
                <span>{plan ? `€${discountedPerDay}` : "--"}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-[13px] font-bold text-white/85">
                <span>
                  {plan === "half" ? "Rental total" : "Total price"}
                </span>
                <span>{plan ? `€${totalPrice}` : "--"}</span>
              </div>

              {plan === "full" && fullDayCount > 1 ? (
                <div className="flex items-center justify-between rounded-2xl border border-[#FF6A00]/25 bg-[#1A202B] px-4 py-3 text-[13px] font-bold text-[#FFB27A]">
                  <span>Total discount</span>
                  <span>-€{savingsTotal}</span>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onSearch}
            className="mt-4 w-full rounded-[22px] px-6 py-4 text-[18px] font-black text-white transition hover:brightness-95 active:scale-[0.99]"
            style={{ background: DEEP_ORANGE }}
          >
            Check Availability
          </button>

          <div className="mt-4 min-h-[52px]">
            {validationNotice ? (
              <div className="rounded-[18px] border border-[#FF6A00]/25 bg-[#FFF0E6] px-4 py-3 text-[13px] font-bold leading-5 text-[#9A3D00]">
                {validationNotice}
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#FF6A00]/20 bg-[#FFF4EC] px-4 py-3 text-[13px] font-semibold leading-5 text-[#9A3D00]">
                Select Half Day or Full Day first.
                <br />
                Full day discounts are applied automatically from selected dates.
              </div>
            )}
          </div>
        </div>
      </div>

      {calendarOpen && (
        <div
          className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCalendar();
          }}
        >
          <div
            className="max-h-[85svh] w-full max-w-[560px] overflow-hidden rounded-2xl shadow-2xl animate-[pop_.12s_ease-out]"
            style={{ background: BAR_BG }}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-black/55">
                  {plan === "half"
                    ? "Select half-day date"
                    : activeField === "pickup"
                    ? "Select pickup date"
                    : "Select return date"}
                </div>

                <div className="text-base font-extrabold text-black">
                  {fmtLabel(range.from)} → {plan === "half" ? fmtLabel(range.from) : fmtLabel(range.to)}
                </div>

                <div className="mt-1 text-[12px] font-semibold text-black/60">
                  {plan === "half"
                    ? "Half day is only for the same selected day."
                    : "Return date must be at least 1 day after pickup for 24h, 48h, 72h, etc."}
                </div>
              </div>

              <button
                onClick={closeCalendar}
                className="h-9 w-9 rounded-xl text-black/70 transition hover:bg-black/5"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => scrollToMonth(Math.max(0, currentIndex - 1))}
                className="h-9 w-9 rounded-xl border border-black/15 transition hover:bg-black/5"
              >
                ‹
              </button>

              <div className="rounded-xl border border-black/15 px-4 py-2 font-extrabold text-black">
                {viewMonth.toLocaleString(getDocLocale(), { month: "long", year: "numeric" })}
              </div>

              <button
                type="button"
                onClick={() => scrollToMonth(Math.min(monthsList.length - 1, currentIndex + 1))}
                className="h-9 w-9 rounded-xl border border-black/15 transition hover:bg-black/5"
              >
                ›
              </button>
            </div>

            <div
              ref={monthsScrollRef}
              onScroll={onMonthsScroll}
              className="overflow-y-auto px-3 pb-4 md:overflow-y-scroll"
              style={{ maxHeight: "55svh" }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      plan={plan}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/10 bg-black/5 px-4 py-3">
              <button
                type="button"
                onClick={clearDates}
                className="text-sm font-extrabold text-black/70 transition hover:text-black"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={closeCalendar}
                className="rounded-xl px-5 py-2 font-extrabold text-white transition hover:brightness-95"
                style={{ background: DEEP_ORANGE }}
              >
                Done
              </button>
            </div>
          </div>

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
          `}</style>
        </div>
      )}
    </div>
  );
}

/* ============================ Mini Month ============================ */
function MiniMonth({
  month,
  range,
  onPick,
  activeField,
  plan,
}: {
  month: Date;
  range: DateRange;
  onPick: (d: Date) => void;
  activeField: ActiveField;
  plan: RentalPlan;
}) {
  const cells = useMemo(() => buildMonthGrid(month), [month]);

  const minDropDay =
    activeField === "dropoff" && range.from && plan === "full"
      ? minDropoffDate(range.from)
      : null;

  const weekdays = useMemo(() => {
    const locale = getDocLocale();
    const baseMonday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }).map((_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(baseMonday.getFullYear(), baseMonday.getMonth(), baseMonday.getDate() + i)
      )
    );
  }, []);

  return (
    <div className="rounded-xl border border-black/10 p-3" style={{ background: BAR_BG }}>
      <div className="mb-2 text-sm font-extrabold text-black">
        {month.toLocaleString(getDocLocale(), { month: "long", year: "numeric" })}
      </div>

      <div className="mb-2 grid grid-cols-7 text-[11px] font-semibold text-black/55">
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
            !!minDropDay && startOfDay(d) < startOfDay(minDropDay) && !isStart && !isEnd;

          const disabled = disabledByPast || disabledByMinDrop;

          const inRange =
            !!range.from &&
            !!range.to &&
            startOfDay(d) >= startOfDay(range.from) &&
            startOfDay(d) <= startOfDay(range.to);

          const isMiddleRange = inRange && !isStart && !isEnd;

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={[
                "h-9 rounded-lg text-[13px] font-extrabold transition-colors duration-150 ease-out",
                disabled ? "cursor-not-allowed text-black/25" : "text-black hover:bg-orange-200",
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

/* ============================ Time Dropdown ============================ */
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
      className="absolute left-0 top-[calc(100%+10px)] z-[999] w-[250px] overflow-hidden rounded-2xl border border-black/10 shadow-2xl"
      style={{ background: BAR_BG }}
    >
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-2">
        <div className="text-sm font-extrabold text-black">{title}</div>
        <button onClick={onClose} className="h-8 w-8 rounded-xl text-black/70 transition hover:bg-black/5">
          ✕
        </button>
      </div>

      <div className="max-h-[260px] overflow-auto p-2">
        {options.map((t) => {
          const active = t === value;
          return (
            <button
              key={t}
              type="button"
              onClick={() => onSelect(t)}
              className={[
                "w-full rounded-xl px-3 py-2 text-left font-extrabold transition",
                active ? "text-white" : "text-black hover:bg-orange-200",
              ].join(" ")}
              style={active ? { background: DEEP_ORANGE } : undefined}
            >
              {formatTimeLabel(t)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================ Icons ================================ */
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