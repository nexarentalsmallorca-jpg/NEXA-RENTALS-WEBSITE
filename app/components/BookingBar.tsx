"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";

type DateRange = { from?: Date; to?: Date };
type ActiveField = "pickup" | "dropoff";

/* ----------------------------- Config ----------------------------- */
const BAR_BG = "#F6D7C6";
const DEEP_ORANGE = "#FF6A00";
const DEFAULT_LOCATION = "Magaluf (Carrer Galeón 13)";

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
function parseISO(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
function toISO(d: Date) {
  return d.toISOString();
}

/* -------------------------- Time helpers -------------------------- */
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
function isValidTimeOption(t: string, options: string[]) {
  return options.includes(t);
}
function timeToMinutes(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

/* -------------------------- URL helpers -------------------------- */
function getQueryParam(name: string) {
  if (typeof window === "undefined") return undefined;
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(name);
  return v || undefined;
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

/* ========================== MAIN COMPONENT ========================== */
export default function BookingBar() {
  const TIME_OPTIONS = useMemo(() => buildTimeOptions(), []);
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), [today]);

  const urlFrom = parseISO(getQueryParam("from"));
  const urlTo = parseISO(getQueryParam("to"));
  const urlPickupTime = getQueryParam("pickupTime");
  const urlDropoffTime = getQueryParam("dropoffTime");
  const urlPickupLocation = getQueryParam("pickupLocation");

  const initialPickupLocation = urlPickupLocation || DEFAULT_LOCATION;
  const initialFrom = urlFrom ? startOfDay(urlFrom) : today;
  const initialTo = urlTo ? startOfDay(urlTo) : tomorrow;

  const [pickupLocation] = useState(initialPickupLocation);
  const [range, setRange] = useState<DateRange>(() => clampRange(initialFrom, initialTo));

  const [pickupTime, setPickupTime] = useState(() => {
    if (urlPickupTime && isValidTimeOption(urlPickupTime, TIME_OPTIONS)) return urlPickupTime;
    return "10:00";
  });
  const [dropoffTime, setDropoffTime] = useState(() => {
    if (urlDropoffTime && isValidTimeOption(urlDropoffTime, TIME_OPTIONS)) return urlDropoffTime;
    return "10:00";
  });

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");

  // ✅ For scroll calendar:
  // - scrollStartMonth: first month rendered in the scroll list
  // - viewMonth: month shown in the top heading (auto-updates while scrolling)
  const [scrollStartMonth, setScrollStartMonth] = useState(() => startOfMonth(initialFrom));
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialFrom));
  const [monthsAhead, setMonthsAhead] = useState(10); // initial months to render (keeps loading more while scrolling)

  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);

  const pickupTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropoffTimeBtnRef = useRef<HTMLButtonElement | null>(null);

  const pickupTimePopRef = useRef<HTMLDivElement | null>(null);
  const dropoffTimePopRef = useRef<HTMLDivElement | null>(null);

  // ✅ Calendar scroll refs
  const monthsScrollRef = useRef<HTMLDivElement | null>(null);
  const monthWrapRefs = useRef<Array<HTMLDivElement | null>>([]);

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

  // ✅ dropoff time options (apply 24h rule when dropoff is next day)
  const DROP_TIME_OPTIONS = useMemo(() => {
    if (!range.from || !range.to) return TIME_OPTIONS;

    if (isExactMinDay(range.from, range.to)) {
      const minMins = timeToMinutes(pickupTime);
      return TIME_OPTIONS.filter((t) => timeToMinutes(t) >= minMins);
    }

    return TIME_OPTIONS;
  }, [TIME_OPTIONS, range.from, range.to, pickupTime]);

  const monthsList = useMemo(() => {
    // Render months continuously from scrollStartMonth forward
    return Array.from({ length: monthsAhead + 1 }, (_, i) => addMonths(scrollStartMonth, i));
  }, [scrollStartMonth, monthsAhead]);

  function openCalendar(which: ActiveField) {
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);
    setActiveField(which);

    // ✅ When opening, anchor the scroll list around the relevant month
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
        if (timeToMinutes(dropoffTime) < timeToMinutes(pickupTime)) {
          setDropoffTime(pickupTime);
        }
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
      if (isBeforeDay(next.to, minDay)) {
        setRange({ from: next.from, to: minDay });
      } else {
        setRange(next);
      }
    } else {
      setRange(next);
    }

    if (next.from && next.to && isExactMinDay(next.from, next.to)) {
      if (timeToMinutes(dropoffTime) < timeToMinutes(pickupTime)) {
        setDropoffTime(pickupTime);
      }
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

  function onSearch() {
    setCalendarOpen(false);
    setPickupTimeOpen(false);
    setDropoffTimeOpen(false);

    if (!range.from || !range.to) {
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

    const params = new URLSearchParams({
      pickupLocation,
      from: toISO(range.from),
      to: toISO(range.to),
      pickupTime,
      dropoffTime,
    });

    window.location.href = `/vehicles?${params.toString()}`;
  }

  // ✅ Scroll behavior:
  // - keeps loading next months when near bottom
  // - updates the top heading month/year automatically based on scroll position
  function onMonthsScroll() {
    const el = monthsScrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    // load more months when near bottom
    if (scrollTop + clientHeight >= scrollHeight - 220) {
      setMonthsAhead((n) => n + 6);
    }

    // update viewMonth (top heading) based on the month section closest to the top
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

  // when calendar opens, ensure scroll starts at top
  useEffect(() => {
    if (!calendarOpen) return;

    // next frame so DOM is ready
    const t = window.setTimeout(() => {
      monthsScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      // set initial heading correctly
      setViewMonth(scrollStartMonth);
    }, 0);

    return () => window.clearTimeout(t);
  }, [calendarOpen, scrollStartMonth]);

  // keep original arrow buttons, but now they scroll the list (instead of changing month state)
  function scrollToMonth(index: number) {
    const el = monthsScrollRef.current;
    const node = monthWrapRefs.current[index];
    if (!el || !node) return;
    el.scrollTo({ top: node.offsetTop - 8, behavior: "smooth" });
  }

  // figure out current index inside the rendered list
  const currentIndex = useMemo(() => {
    const a = startOfMonth(scrollStartMonth).getTime();
    const b = startOfMonth(viewMonth).getTime();
    const diffMonths = (new Date(b).getFullYear() - new Date(a).getFullYear()) * 12 + (new Date(b).getMonth() - new Date(a).getMonth());
    return Math.max(0, Math.min(monthsList.length - 1, diffMonths));
  }, [scrollStartMonth, viewMonth, monthsList.length]);

  return (
    <div className="relative z-50 w-full">
      {/* Pickup pill */}
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
        <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
          <PinIcon />
          <span className="whitespace-nowrap">Pick-up:</span>{" "}
          <span className="text-white truncate max-w-[220px] sm:max-w-[360px]">{pickupLocation}</span>
        </span>
      </div>

      {/* ✅ Mobile: Pickup row + Dropoff row | ✅ Desktop unchanged */}
      <div
        className={[
          "grid grid-cols-1 gap-2",
          "lg:inline-flex lg:items-stretch lg:gap-0",
          "rounded-2xl overflow-visible border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
        ].join(" ")}
        style={{ background: BAR_BG }}
      >
        {/* Row 1: Pickup Date + Pickup Time */}
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
              <div className="text-[11px] font-semibold text-black/65">Pick-up Date</div>
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
                <div className="text-[13px] font-extrabold text-black">{formatTimeLabel(pickupTime)}</div>
              </div>
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
                      if (timeToMinutes(dropoffTime) < timeToMinutes(t)) {
                        setDropoffTime(t);
                      }
                    }
                    setPickupTimeOpen(false);
                  }}
                  onClose={() => setPickupTimeOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Dropoff Date + Dropoff Time */}
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
              <div className="text-[11px] font-semibold text-black/65">Drop-off Date</div>
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
                <div className="text-[13px] font-extrabold text-black">{formatTimeLabel(dropoffTime)}</div>
              </div>
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

        {/* Search */}
        <button
          type="button"
          onClick={onSearch}
          className={[
            "w-full rounded-2xl py-3 font-extrabold text-black text-[15px] hover:brightness-95 active:scale-[0.99] transition",
            "lg:w-auto lg:rounded-r-2xl lg:rounded-l-none lg:px-7 lg:min-w-[120px] lg:py-0",
          ].join(" ")}
          style={{ background: DEEP_ORANGE }}
        >
          Search
        </button>
      </div>

      {/* ✅ Calendar Modal (fixed for mobile view) */}
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
            {/* Header */}
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

            {/* ✅ Controls (kept same look) — month/year auto updates as you scroll */}
            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => scrollToMonth(Math.max(0, currentIndex - 1))}
                className="h-9 w-9 rounded-xl border border-black/15 hover:bg-black/5 transition"
              >
                ‹
              </button>

              {/* ✅ AUTO month/year heading */}
              <div className="rounded-xl border border-black/15 px-4 py-2 font-extrabold text-black" style={{ background: BAR_BG }}>
                {viewMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>

              <button
                type="button"
                onClick={() => scrollToMonth(Math.min(monthsList.length - 1, currentIndex + 1))}
                className="h-9 w-9 rounded-xl border border-black/15 hover:bg-black/5 transition"
              >
                ›
              </button>
            </div>

            {/* ✅ Months SCROLLER: keep scrolling to see next months (loads more automatically) */}
            <div
              ref={monthsScrollRef}
              onScroll={onMonthsScroll}
              className="px-3 pb-4 overflow-y-auto"
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
                    <MiniMonth month={m} range={range} onPick={pickDate} activeField={activeField} />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
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
          <div key={w} className="py-1 text-center">
            {w}
          </div>
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
      className="absolute left-0 bottom-full mb-2 z-[999] w-[240px] rounded-2xl border border-black/10 shadow-2xl overflow-hidden"
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
