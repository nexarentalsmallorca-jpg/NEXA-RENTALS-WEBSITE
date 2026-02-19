"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ============================== CONFIG ============================== */
const ORANGE = "#FF7A00";
const BAR_BG = "#F6D7C6";
const DEEP_ORANGE = "#FF6A00";
const DEFAULT_LOCATION = "Magaluf (Carrer Galeón 13)";

type Vehicle = {
  id: string;
  name: string;
  type: "Scooter" | "E-Bike";
  pricePerDay: number;
  badge: string;
  imageUrl: string;
};

const FEATURED: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 39,
    badge: "Best Seller",
    imageUrl: "/images/zontes125.png",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 37,
    badge: "Comfort Pick",
    imageUrl: "/images/liberty125.png",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    type: "Scooter",
    pricePerDay: 45,
    badge: "Practical",
    imageUrl: "/images/sym.png",
  },
  {
    id: "e2",
    name: "CITY e-BIKE COMFORT",
    type: "E-Bike",
    pricePerDay: 25,
    badge: "Great Value",
    imageUrl: "/images/e20.png",
  },
];

/* =========================== DATE HELPERS =========================== */
type DateRange = { from?: Date; to?: Date };
type ActiveField = "pickup" | "dropoff";

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
function fmtLabel(d?: Date) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const last = endOfMonth(viewMonth);

  // Monday start: Mon=0..Sun=6
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
  return d.toISOString();
}

/* ---------------------- 24h / 1-day helpers ---------------------- */
function addDays(d: Date, days: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}
function minDropoffDate(from: Date) {
  return startOfDay(addDays(from, 1));
}
function isBeforeDay(a: Date, b: Date) {
  return startOfDay(a) < startOfDay(b);
}
function isExactMinDay(from: Date, to: Date) {
  return isSameDay(to, addDays(from, 1));
}

/* =========================== TIME HELPERS =========================== */
function buildTimeOptions() {
  // 09:00 to 21:00 inclusive, every 30 min
  const out: string[] = [];
  for (let h = 9; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) continue;
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}
function formatTimeLabel(t: string) {
  const [hhStr, mmStr] = t.split(":");
  const hh = Number(hhStr);
  const ampm = hh >= 12 ? "PM" : "AM";
  const hour12 = ((hh + 11) % 12) + 1;
  return `${String(hour12).padStart(2, "0")}:${mmStr} ${ampm}`;
}
function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

/* ============================== UI ============================== */
export default function FeaturedFleet() {
  const router = useRouter();
  const sp = useSearchParams();
  const items = useMemo(() => FEATURED, []);

  const sectionRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // ✅ only one popup (the picker)
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const TIME_OPTIONS = useMemo(() => buildTimeOptions(), []);
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const [pickupLocation] = useState(DEFAULT_LOCATION);
  const [range, setRange] = useState<DateRange>(() => clampRange(today, tomorrow));
  const [pickupTime, setPickupTime] = useState<string>("10:00");
  const [dropoffTime, setDropoffTime] = useState<string>("10:00");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);

  const pickupTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropoffTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const pickupTimePopRef = useRef<HTMLDivElement | null>(null);
  const dropoffTimePopRef = useRef<HTMLDivElement | null>(null);

  const [err, setErr] = useState("");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
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

  // close time popovers on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;

      if (pickupTimePopRef.current && pickupTimePopRef.current.contains(t)) return;
      if (dropoffTimePopRef.current && dropoffTimePopRef.current.contains(t)) return;

      if (pickupTimeBtnRef.current && pickupTimeBtnRef.current.contains(t)) return;
      if (dropoffTimeBtnRef.current && dropoffTimeBtnRef.current.contains(t)) return;

      setPickupTimeOpen(false);
      setDropoffTimeOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const DROP_TIME_OPTIONS = useMemo(() => {
    if (!range.from || !range.to) return TIME_OPTIONS;

    if (isExactMinDay(range.from, range.to)) {
      const minMins = timeToMinutes(pickupTime);
      return TIME_OPTIONS.filter((t) => timeToMinutes(t) >= minMins);
    }
    return TIME_OPTIONS;
  }, [TIME_OPTIONS, range.from, range.to, pickupTime]);

  function openCalendar(which: ActiveField) {
    setErr("");
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);
    setActiveField(which);
    setCalendarOpen(true);
  }
  function closeCalendar() {
    setCalendarOpen(false);
  }
  function clearDates() {
    setRange({});
    setActiveField("pickup");
  }

  function pickDate(day: Date) {
    if (isPastDay(day)) return;

    if (activeField === "dropoff" && range.from) {
      const minDay = minDropoffDate(range.from);
      if (isBeforeDay(day, minDay)) return;
    }

    if (activeField === "pickup") {
      const nextFrom = day;
      const minDay = minDropoffDate(nextFrom);
      const nextTo = range.to && !isBeforeDay(range.to, minDay) ? range.to : minDay;

      setRange({ from: nextFrom, to: nextTo });
      setActiveField("dropoff");

      if (nextTo && isExactMinDay(nextFrom, nextTo)) {
        if (timeToMinutes(dropoffTime) < timeToMinutes(pickupTime)) setDropoffTime(pickupTime);
      }
      return;
    }

    if (!range.from) {
      setRange({ from: day });
      return;
    }

    const next = clampRange(range.from, day);

    if (next.from && next.to) {
      const minDay = minDropoffDate(next.from);
      if (isBeforeDay(next.to, minDay)) setRange({ from: next.from, to: minDay });
      else setRange(next);
    } else {
      setRange(next);
    }

    if (next.from && next.to && isExactMinDay(next.from, next.to)) {
      if (timeToMinutes(dropoffTime) < timeToMinutes(pickupTime)) setDropoffTime(pickupTime);
    }

    if (next.from && next.to) closeCalendar();
  }

  function togglePickupTime() {
    setCalendarOpen(false);
    setDropoffTimeOpen(false);
    setPickupTimeOpen((v) => !v);
  }
  function toggleDropoffTime() {
    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen((v) => !v);
  }

  // ✅ click card -> directly open picker popup
  function openPickerForVehicle(v: Vehicle) {
    setSelected(v);
    setOpen(true);
    setErr("");

    setRange(clampRange(today, tomorrow));
    setPickupTime("10:00");
    setDropoffTime("10:00");
    setViewMonth(startOfMonth(today));

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
  }

  function proceedToCheckout() {
    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);

    if (!selected) return;

    if (!range.from || !range.to) {
      setErr("Please select pickup and drop-off dates.");
      setActiveField(range.from ? "dropoff" : "pickup");
      setCalendarOpen(true);
      return;
    }

    const minDay = minDropoffDate(range.from);
    if (isBeforeDay(range.to, minDay)) {
      setRange({ from: range.from, to: minDay });
      return;
    }

    if (isExactMinDay(range.from, range.to)) {
      if (timeToMinutes(dropoffTime) < timeToMinutes(pickupTime)) {
        setDropoffTime(pickupTime);
        return;
      }
    }

    const params = new URLSearchParams(sp.toString());
    params.set("vehicleId", selected.id);
    params.set("pickupLocation", pickupLocation);
    params.set("from", toISO(range.from));
    params.set("to", toISO(range.to));
    params.set("pickupTime", pickupTime);
    params.set("dropoffTime", dropoffTime);

    router.push(`/checkout?${params.toString()}`);
    closePicker();
  }

  const goToVehicles = () => {
    const params = new URLSearchParams(sp.toString());
    router.push(`/vehicles?${params.toString()}`);
  };

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* Header */}
      <div className={["transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"].join(" ")}>
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
              Featured Fleet
            </div>

            <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Pick your ride
            </h2>

            <p className="mt-2 text-white/65 max-w-2xl">Premium picks — choose dates and rent instantly.</p>
          </div>

          <button onClick={goToVehicles} className="rounded-xl px-6 py-3 text-sm font-black text-black hover:opacity-90 transition" style={{ background: ORANGE }}>
            View all vehicles
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
        {items.map((v, idx) => {
          const show = idx <= activeIndex;

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => openPickerForVehicle(v)} // ✅ open picker directly
              className={[
                "group relative w-full text-left",
                "transition-all duration-700 ease-out",
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                  className="absolute left-1/2 top-[52%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] opacity-40 transition-opacity duration-500 group-hover:opacity-55"
                  style={{
                    background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.00) 70%)",
                  }}
                />
              </div>

              <div
                className="rounded-3xl border p-4 md:p-5 transition-all duration-500 group-hover:-translate-y-[2px]
                           group-hover:shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.028) 55%, rgba(255,255,255,0.03) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black"
                  style={{
                    borderColor: "rgba(255,255,255,0.14)",
                    background: "rgba(0,0,0,0.18)",
                    color: "rgba(255,255,255,0.80)",
                  }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "rgba(255,180,116,0.95)",
                      boxShadow: "0 0 18px rgba(255,122,0,0.35)",
                    }}
                  />
                  {v.badge}
                </div>

                <div className="relative mx-auto mt-3 h-[220px] w-full">
                  <div className="pointer-events-none absolute left-1/2 bottom-7 h-10 w-[78%] -translate-x-1/2 rounded-full bg-black/60 blur-xl opacity-70 transition-all duration-500 ease-out group-hover:bottom-6 group-hover:opacity-90" />
                  <img
                    src={v.imageUrl}
                    alt={v.name}
                    className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)]
                               transition-transform duration-500 ease-out group-hover:-translate-y-1"
                  />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold tracking-wide text-white/55">{v.type}</div>
                    <div className="truncate text-sm md:text-[15px] font-black text-white">{v.name}</div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-bold text-white/55">from</div>
                    <div className="text-sm font-black" style={{ color: ORANGE }}>
                      €{v.pricePerDay}
                      <span className="text-xs text-white/45">/day</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-white/55">Tap to rent</div>
                  <div
                    className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black text-black transition group-hover:brightness-110"
                    style={{
                      background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                      boxShadow: "0 16px 40px rgba(255,122,0,0.16)",
                    }}
                  >
                    Rent it
                    <ArrowIcon />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ✅ ONLY ONE POPUP: Date + Time picker */}
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
            className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background:
                "linear-gradient(180deg, rgba(15,17,21,0.96) 0%, rgba(12,14,18,0.96) 100%)",
              boxShadow: "0 36px 110px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <div className="relative p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold tracking-wide text-white/60">SELECT DATES</div>
                  <div className="mt-1 text-lg md:text-xl font-black text-white">{selected?.name}</div>
                  <div className="mt-1 text-sm text-white/60">Choose pickup & drop-off — then proceed to checkout.</div>
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

              {/* Date+Time rows */}
              <div
                className="mt-5 rounded-3xl border p-4"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                {/* Pickup */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openCalendar("pickup")}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition hover:brightness-95"
                    style={{ background: BAR_BG }}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarMini />
                      <div className="leading-tight">
                        <div className="text-[11px] font-semibold text-black/65">Pick-up Date</div>
                        <div className="text-[13px] font-extrabold text-black">{fmtLabel(range.from)}</div>
                      </div>
                    </div>
                    <span className="text-black/45 text-sm">›</span>
                  </button>

                  <div className="relative">
                    <button
                      ref={pickupTimeBtnRef}
                      type="button"
                      onClick={togglePickupTime}
                      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition hover:brightness-95"
                      style={{ background: BAR_BG }}
                    >
                      <div className="flex items-center gap-3">
                        <ClockMini />
                        <div className="leading-tight">
                          <div className="text-[11px] font-semibold text-black/65">Time</div>
                          <div className="text-[13px] font-extrabold text-black">{formatTimeLabel(pickupTime)}</div>
                        </div>
                      </div>
                      <span className="text-black/45 text-sm">›</span>
                    </button>

                    {pickupTimeOpen && (
                      <div ref={pickupTimePopRef}>
                        <TimeDropdown
                          title="Pick-up time"
                          value={pickupTime}
                          options={TIME_OPTIONS}
                          onSelect={(t) => {
                            setPickupTime(t);
                            if (range.from && range.to && isExactMinDay(range.from, range.to)) {
                              if (timeToMinutes(dropoffTime) < timeToMinutes(t)) setDropoffTime(t);
                            }
                            setPickupTimeOpen(false);
                          }}
                          onClose={() => setPickupTimeOpen(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropoff */}
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openCalendar("dropoff")}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition hover:brightness-95"
                    style={{ background: BAR_BG }}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarMini />
                      <div className="leading-tight">
                        <div className="text-[11px] font-semibold text-black/65">Drop-off Date</div>
                        <div className="text-[13px] font-extrabold text-black">{fmtLabel(range.to)}</div>
                      </div>
                    </div>
                    <span className="text-black/45 text-sm">›</span>
                  </button>

                  <div className="relative">
                    <button
                      ref={dropoffTimeBtnRef}
                      type="button"
                      onClick={toggleDropoffTime}
                      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3 text-left transition hover:brightness-95"
                      style={{ background: BAR_BG }}
                    >
                      <div className="flex items-center gap-3">
                        <ClockMini />
                        <div className="leading-tight">
                          <div className="text-[11px] font-semibold text-black/65">Time</div>
                          <div className="text-[13px] font-extrabold text-black">{formatTimeLabel(dropoffTime)}</div>
                        </div>
                      </div>
                      <span className="text-black/45 text-sm">›</span>
                    </button>

                    {dropoffTimeOpen && (
                      <div ref={dropoffTimePopRef}>
                        <TimeDropdown
                          title="Drop-off time"
                          value={dropoffTime}
                          options={DROP_TIME_OPTIONS}
                          onSelect={(t) => {
                            setDropoffTime(t);
                            setDropoffTimeOpen(false);
                          }}
                          onClose={() => setDropoffTimeOpen(false)}
                        />
                      </div>
                    )}
                  </div>
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
                ) : null}
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
                  Back
                </button>

                <button
                  type="button"
                  onClick={proceedToCheckout}
                  className="rounded-2xl px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
                  style={{
                    background: `linear-gradient(180deg, ${ORANGE} 0%, rgba(255,122,0,0.85) 100%)`,
                    boxShadow: "0 18px 44px rgba(255,122,0,0.20)",
                  }}
                >
                  Proceed to checkout
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Modal */}
          {calendarOpen && (
            <div
              className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) closeCalendar();
              }}
            >
              <div
                className={[
                  "w-full max-w-[560px]",
                  "max-h-[85svh]",
                  "rounded-2xl shadow-2xl overflow-hidden",
                  "animate-[pop_.12s_ease-out]",
                ].join(" ")}
                style={{ background: BAR_BG }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                  <div>
                    <div className="text-sm text-black/55 font-semibold">
                      {activeField === "pickup" ? "Select pick-up date" : "Select drop-off date"}
                    </div>
                    <div className="text-base font-extrabold text-black">
                      {fmtLabel(range.from)} → {fmtLabel(range.to)}
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
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    className="h-9 w-9 rounded-xl border border-black/15 hover:bg-black/5 transition"
                  >
                    ‹
                  </button>

                  <MonthYearPicker viewMonth={viewMonth} setViewMonth={setViewMonth} />

                  <button
                    type="button"
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    className="h-9 w-9 rounded-xl border border-black/15 hover:bg-black/5 transition"
                  >
                    ›
                  </button>
                </div>

                <div className="px-3 pb-4 overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MiniMonth month={viewMonth} range={range} onPick={pickDate} activeField={activeField} />
                    <MiniMonth month={addMonths(viewMonth, 1)} range={range} onPick={pickDate} activeField={activeField} />
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-black/10 bg-black/5">
                  <button type="button" onClick={clearDates} className="text-sm font-extrabold text-black/70 hover:text-black transition">
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
      )}
    </section>
  );
}

/* ====================== Month / Year Picker ====================== */
function MonthYearPicker({
  viewMonth,
  setViewMonth,
}: {
  viewMonth: Date;
  setViewMonth: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const months = useMemo(
    () => ["January","February","March","April","May","June","July","August","September","October","November","December"],
    []
  );

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => now + i);
  }, []);

  const monthIndex = viewMonth.getMonth();
  const year = viewMonth.getFullYear();

  return (
    <div className="flex items-center gap-2">
      <select
        value={monthIndex}
        onChange={(e) => {
          const m = Number(e.target.value);
          setViewMonth((old) => new Date(old.getFullYear(), m, 1));
        }}
        className="rounded-xl border border-black/15 px-3 py-2 font-extrabold text-black hover:bg-black/5 transition outline-none"
        style={{ background: BAR_BG }}
      >
        {months.map((m, idx) => (
          <option key={m} value={idx}>{m}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => {
          const y = Number(e.target.value);
          setViewMonth((old) => new Date(y, old.getMonth(), 1));
        }}
        className="rounded-xl border border-black/15 px-3 py-2 font-extrabold text-black hover:bg-black/5 transition outline-none"
        style={{ background: BAR_BG }}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}

/* ============================ Mini Month ============================ */
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

  const minDropDay = activeField === "dropoff" && range.from ? minDropoffDate(range.from) : null;

  return (
    <div className="rounded-xl border border-black/10 p-3" style={{ background: BAR_BG }}>
      <div className="mb-2 text-sm font-extrabold text-black">
        {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
      </div>

      <div className="grid grid-cols-7 text-[11px] text-black/55 mb-2 font-semibold">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w} className="py-1 text-center">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((d, idx) => {
          if (!d) return <div key={idx} className="h-9" />;

          const disabledByPast = isPastDay(d);
          const disabledByMinDrop = !!minDropDay && startOfDay(d) < startOfDay(minDropDay);
          const disabled = disabledByPast || disabledByMinDrop;

          const inRange =
            range.from &&
            range.to &&
            startOfDay(d) >= startOfDay(range.from) &&
            startOfDay(d) <= startOfDay(range.to);

          const isStart = range.from && isSameDay(d, range.from);
          const isEnd = range.to && isSameDay(d, range.to);

          const hoverClass = !disabled && !(isStart || isEnd) ? "hover:bg-orange-200" : "";

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onPick(d)}
              className={[
                "h-9 rounded-lg font-extrabold text-[13px]",
                "transition-colors duration-150 ease-out",
                disabled ? "text-black/25 cursor-not-allowed" : "text-black",
                hoverClass,
                inRange && !disabled ? "bg-orange-300/60" : "",
                (isStart || isEnd) && !disabled ? "text-black" : "",
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
      className="absolute left-0 top-full mt-2 z-[999] w-[240px] rounded-2xl border border-black/10 shadow-2xl overflow-hidden"
      style={{ background: BAR_BG }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/10">
        <div className="text-sm font-extrabold text-black">{title}</div>
        <button onClick={onClose} className="h-8 w-8 rounded-xl hover:bg-black/5 text-black/70 transition">
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
                "w-full text-left px-3 py-2 rounded-xl font-extrabold transition",
                active ? "text-black" : "text-black hover:bg-orange-200",
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
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
