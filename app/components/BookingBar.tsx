"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";

/**
 * NEXA BookingBar (single file, no props needed)
 * ------------------------------------------------------------------
 * ✅ Same Canva bar look
 * ✅ Pickup location shown above bar (Option B)
 * ✅ Calendar modal background matches bar (#F6D7C6)
 * ✅ Modal opens higher (won't go out of screen)
 * ✅ Two months side-by-side
 * ✅ Month + Year dropdown jump
 * ✅ Disable past dates
 * ✅ Hover = light orange
 * ✅ Middle range = medium orange
 * ✅ Start & End = deep orange (#FF6A00)
 * ✅ Time dropdown (click anywhere on time box)
 * ✅ Time options ONLY 09:00 to 21:00 (30-min steps)
 * ✅ Search redirects to /vehicles with query params
 * ✅ On /vehicles, it auto-loads from URL and shows same selection
 */

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
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

/* -------------------------- URL helpers -------------------------- */
function getQueryParam(name: string) {
  if (typeof window === "undefined") return undefined;
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get(name);
  return v || undefined;
}

/* ========================== MAIN COMPONENT ========================== */
export default function BookingBar() {
  const TIME_OPTIONS = useMemo(() => buildTimeOptions(), []);
  const today = useMemo(() => startOfDay(new Date()), []);
  const tomorrow = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    [today]
  );

  // ------------------ Load from URL (Vehicles page) ------------------
  // If you open /vehicles?from=...&to=...&pickupTime=... etc,
  // it will automatically use those values.
  const urlFrom = parseISO(getQueryParam("from"));
  const urlTo = parseISO(getQueryParam("to"));
  const urlPickupTime = getQueryParam("pickupTime");
  const urlDropoffTime = getQueryParam("dropoffTime");
  const urlPickupLocation = getQueryParam("pickupLocation");

  const initialPickupLocation = urlPickupLocation || DEFAULT_LOCATION;

  const initialFrom = urlFrom ? startOfDay(urlFrom) : today;
  const initialTo = urlTo ? startOfDay(urlTo) : tomorrow;

  const [pickupLocation] = useState(initialPickupLocation);
  const [range, setRange] = useState<DateRange>(() =>
    clampRange(initialFrom, initialTo)
  );

  const [pickupTime, setPickupTime] = useState(() => {
    if (urlPickupTime && isValidTimeOption(urlPickupTime, TIME_OPTIONS))
      return urlPickupTime;
    return "10:00";
  });
  const [dropoffTime, setDropoffTime] = useState(() => {
    if (urlDropoffTime && isValidTimeOption(urlDropoffTime, TIME_OPTIONS))
      return urlDropoffTime;
    return "10:00";
  });

  // ----------------- UI state -----------------
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialFrom));

  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);

  const pickupTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dropoffTimeBtnRef = useRef<HTMLButtonElement | null>(null);
  const timePopRef = useRef<HTMLDivElement | null>(null);

  // Close time dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;

      if (timePopRef.current && timePopRef.current.contains(t)) return;
      if (pickupTimeBtnRef.current && pickupTimeBtnRef.current.contains(t))
        return;
      if (dropoffTimeBtnRef.current && dropoffTimeBtnRef.current.contains(t))
        return;

      setPickupTimeOpen(false);
      setDropoffTimeOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  // ----------------- Actions -----------------
  function openCalendar(which: ActiveField) {
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

    if (activeField === "pickup") {
      const nextFrom = day;
      const nextTo =
        range.to && startOfDay(range.to) < startOfDay(nextFrom)
          ? undefined
          : range.to;

      setRange({ from: nextFrom, to: nextTo });
      setActiveField("dropoff");
      return;
    }

    if (!range.from) {
      setRange({ from: day });
      return;
    }

    const next = clampRange(range.from, day);
    setRange(next);

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

    const params = new URLSearchParams({
      pickupLocation,
      from: toISO(range.from),
      to: toISO(range.to),
      pickupTime,
      dropoffTime,
    });

    // ALWAYS go to vehicles page
    window.location.href = `/vehicles?${params.toString()}`;
  }

  return (
    <div className="relative z-50 w-full">
      {/* Pickup pill (Option B) */}
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
        <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
          <PinIcon />
          Pick-up: <span className="text-white">{pickupLocation}</span>
        </span>
      </div>

      {/* Canva style bar */}
      <div
        className="inline-flex items-stretch rounded-2xl overflow-hidden border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        style={{ background: BAR_BG }}
      >
        {/* Pickup Date */}
        <button
          type="button"
          onClick={() => openCalendar("pickup")}
          className="flex items-center gap-3 px-4 py-3 min-w-[170px] border-r border-black/15 text-left hover:bg-black/5 transition"
        >
          <CalendarMini />
          <div className="leading-tight">
            <div className="text-[11px] font-semibold text-black/65">
              Pick-up Date
            </div>
            <div className="text-[13px] font-extrabold text-black">
              {fmtLabel(range.from)}
            </div>
          </div>
        </button>

        {/* Pickup Time */}
        <div className="relative min-w-[160px] border-r border-black/15">
          <button
            ref={pickupTimeBtnRef}
            type="button"
            onClick={togglePickupTime}
            className="w-full h-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition"
          >
            <ClockMini />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold text-black/65">
                Time
              </div>
              <div className="text-[13px] font-extrabold text-black">
                {formatTimeLabel(pickupTime)}
              </div>
            </div>
          </button>

          {pickupTimeOpen && (
            <div ref={timePopRef}>
              <TimeDropdown
                title="Pick-up time"
                value={pickupTime}
                options={TIME_OPTIONS}
                onSelect={(t) => {
                  setPickupTime(t);
                  setPickupTimeOpen(false);
                }}
                onClose={() => setPickupTimeOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Dropoff Date */}
        <button
          type="button"
          onClick={() => openCalendar("dropoff")}
          className="flex items-center gap-3 px-4 py-3 min-w-[170px] border-r border-black/15 text-left hover:bg-black/5 transition"
        >
          <CalendarMini />
          <div className="leading-tight">
            <div className="text-[11px] font-semibold text-black/65">
              Drop-off Date
            </div>
            <div className="text-[13px] font-extrabold text-black">
              {fmtLabel(range.to)}
            </div>
          </div>
        </button>

        {/* Dropoff Time */}
        <div className="relative min-w-[160px]">
          <button
            ref={dropoffTimeBtnRef}
            type="button"
            onClick={toggleDropoffTime}
            className="w-full h-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition"
          >
            <ClockMini />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold text-black/65">
                Time
              </div>
              <div className="text-[13px] font-extrabold text-black">
                {formatTimeLabel(dropoffTime)}
              </div>
            </div>
          </button>

          {dropoffTimeOpen && (
            <div ref={timePopRef}>
              <TimeDropdown
                title="Drop-off time"
                value={dropoffTime}
                options={TIME_OPTIONS}
                onSelect={(t) => {
                  setDropoffTime(t);
                  setDropoffTimeOpen(false);
                }}
                onClose={() => setDropoffTimeOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Search */}
        <button
          type="button"
          onClick={onSearch}
          className="px-7 min-w-[120px] font-extrabold text-black text-[15px] hover:brightness-95 active:scale-[0.99] transition rounded-r-2xl"
          style={{ background: DEEP_ORANGE }}
        >
          Search
        </button>
      </div>

      {/* Calendar Modal */}
      {calendarOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-sm pb-3 px-3"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCalendar();
          }}
        >
          <div
  className="w-[min(840px,96vw)] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-[pop_.12s_ease-out] -translate-y-10"
  style={{ background: BAR_BG, transform: "translateY(-200px)" }}
>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <div>
                <div className="text-sm text-black/55 font-semibold">
                  {activeField === "pickup"
                    ? "Select pick-up date"
                    : "Select drop-off date"}
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

            {/* Controls */}
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

            {/* Two months (scrollable middle) */}
<div className="px-3 pb-4 overflow-auto flex-1">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <MiniMonth month={viewMonth} range={range} onPick={pickDate} />
    <MiniMonth month={addMonths(viewMonth, 1)} range={range} onPick={pickDate} />
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

/* ====================== Month / Year Picker ====================== */
function MonthYearPicker({
  viewMonth,
  setViewMonth,
}: {
  viewMonth: Date;
  setViewMonth: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const months = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => now + i); // next 5 years
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
          <option key={m} value={idx}>
            {m}
          </option>
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
          <option key={y} value={y}>
            {y}
          </option>
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
}: {
  month: Date;
  range: DateRange;
  onPick: (d: Date) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(month), [month]);

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

          const disabled = isPastDay(d);

          const inRange =
            range.from &&
            range.to &&
            startOfDay(d) >= startOfDay(range.from) &&
            startOfDay(d) <= startOfDay(range.to);

          const isStart = range.from && isSameDay(d, range.from);
          const isEnd = range.to && isSameDay(d, range.to);

          const hoverClass =
            !disabled && !(isStart || isEnd) ? "hover:bg-orange-200" : "";

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
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-xl hover:bg-black/5 text-black/70 transition"
        >
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
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="2"
      />
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
      <path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
