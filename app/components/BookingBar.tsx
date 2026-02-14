"use client";

import React, { useMemo, useState } from "react";

type DateRange = { from?: Date; to?: Date };
type ActiveField = "pickup" | "dropoff";

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
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function fmt(d?: Date) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const last = endOfMonth(viewMonth);
  const startDow = (first.getDay() + 6) % 7; // Monday start

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function BookingBar() {
  // fixed pickup location (not shown in bar, but used in URL)
  const pickupLocation = "Magaluf (Carrer Galeón 13)";

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    [today]
  );

  const [range, setRange] = useState<DateRange>({ from: today, to: tomorrow });
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");

  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const canSearch = Boolean(range.from && range.to);

  function openCalendar(which: ActiveField) {
    setActiveField(which);
    setOpen(true);
  }

  function pickDate(day: Date) {
    // If editing pickup: set from, and if to exists and is before new from -> clear to
    if (activeField === "pickup") {
      const newFrom = day;
      const newTo = range.to && startOfDay(range.to) < startOfDay(newFrom) ? undefined : range.to;
      setRange({ from: newFrom, to: newTo });
      // After selecting pickup, automatically switch to dropoff for smoother flow
      setActiveField("dropoff");
      return;
    }

    // editing dropoff: require from first
    if (!range.from) {
      setRange({ from: day, to: undefined });
      setActiveField("dropoff");
      return;
    }

    const from = range.from;
    const to = day < from ? from : day;
    const finalFrom = day < from ? day : from;

    setRange({ from: finalFrom, to });
    // auto close when both are selected
    setOpen(false);
  }

  function onSearch() {
    if (!range.from || !range.to) {
      setActiveField(range.from ? "dropoff" : "pickup");
      setOpen(true);
      return;
    }

    const params = new URLSearchParams({
      pickupLocation,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      pickupTime,
      dropoffTime,
    });

    window.location.href = `/time?${params.toString()}`;
  }

return (
  <div className="relative z-50 w-full">
    {/* Pickup text (Option B) */}
    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
      <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur">
        <PinIcon />
        Pick-up: <span className="text-white">{pickupLocation}</span>
      </span>
    </div>

    {/* CANVA STYLE BAR */}
    <div
      className="
        inline-flex items-stretch
        rounded-2xl
        bg-[#F6D7C6]
        shadow-[0_20px_60px_rgba(0,0,0,0.35)]
        overflow-hidden
        border border-black/10
      "
    >
      {/* PICKUP DATE */}
      <button
        type="button"
        onClick={() => openCalendar("pickup")}
        className="
          flex items-center gap-3
          px-4 py-3
          min-w-[170px]
          border-r border-black/15
          text-left
          hover:bg-black/5
          transition
        "
      >
        <CalendarMini />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-black/65">Pick-up Date</div>
          <div className="text-[13px] font-extrabold text-black">{fmt(range.from)}</div>
        </div>
      </button>

      {/* PICKUP TIME */}
      <div
        className="
          flex items-center gap-3
          px-4 py-3
          min-w-[140px]
          border-r border-black/15
        "
      >
        <ClockMini />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-black/65">Time</div>
          <input
            type="time"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="bg-transparent text-[13px] font-extrabold text-black outline-none"
          />
        </div>
      </div>

      {/* DROPOFF DATE */}
      <button
        type="button"
        onClick={() => openCalendar("dropoff")}
        className="
          flex items-center gap-3
          px-4 py-3
          min-w-[170px]
          border-r border-black/15
          text-left
          hover:bg-black/5
          transition
        "
      >
        <CalendarMini />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-black/65">Drop-off Date</div>
          <div className="text-[13px] font-extrabold text-black">{fmt(range.to)}</div>
        </div>
      </button>

      {/* DROPOFF TIME */}
      <div className="flex items-center gap-3 px-4 py-3 min-w-[140px]">
        <ClockMini />
        <div className="leading-tight">
          <div className="text-[11px] font-semibold text-black/65">Time</div>
          <input
            type="time"
            value={dropoffTime}
            onChange={(e) => setDropoffTime(e.target.value)}
            className="bg-transparent text-[13px] font-extrabold text-black outline-none"
          />
        </div>
      </div>

      {/* SEARCH BUTTON */}
      <button
        type="button"
        onClick={onSearch}
        className="
          bg-[#FF6A00]
          px-7
          font-extrabold
          text-black
          text-[15px]
          hover:brightness-95
          active:scale-[0.99]
          transition
          rounded-l-none
          rounded-r-2xl
          min-w-[120px]
        "
      >
        Search
      </button>
    </div>

      {/* CALENDAR MODAL (BOOKING.COM BEHAVIOR) */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-[min(920px,95vw)] rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <div className="text-sm text-gray-500">
                  {activeField === "pickup" ? "Select pick-up date" : "Select drop-off date"}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {fmt(range.from)} → {fmt(range.to)}
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4">
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                className="h-10 w-10 rounded-xl border hover:bg-gray-50"
              >
                ‹
              </button>

              <div className="font-bold text-gray-900">
                {viewMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>

              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="h-10 w-10 rounded-xl border hover:bg-gray-50"
              >
                ›
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 px-5 text-xs text-gray-500">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
                <div key={w} className="py-2 text-center">
                  {w}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 px-5 pb-5">
              {cells.map((d, idx) => {
                if (!d) return <div key={idx} className="h-11" />;

                const inRange =
                  range.from &&
                  range.to &&
                  d >= startOfDay(range.from) &&
                  d <= startOfDay(range.to);

                const isStart = range.from && isSameDay(d, range.from);
                const isEnd = range.to && isSameDay(d, range.to);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pickDate(d)}
                    className={[
                      "h-11 rounded-xl font-bold transition",
                      "hover:bg-gray-100",
                      inRange ? "bg-orange-100" : "",
                      isStart || isEnd ? "bg-[#FF6A00] text-black" : "text-gray-900",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setRange({})}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2 font-bold text-gray-700 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!range.from || !range.to) return;
                    setOpen(false);
                  }}
                  className={[
                    "rounded-xl px-5 py-2 font-extrabold",
                    range.from && range.to
                      ? "bg-[#FF6A00] text-black hover:brightness-95"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed",
                  ].join(" ")}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- tiny icons --- */
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
