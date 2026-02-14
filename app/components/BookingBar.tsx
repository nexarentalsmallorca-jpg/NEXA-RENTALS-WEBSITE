"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type DateRange = { from?: Date; to?: Date };

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function formatDate(d?: Date) {
  if (!d) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
function clampRange(range: DateRange): DateRange {
  if (range.from && range.to && range.to < range.from) {
    return { from: range.to, to: range.from };
  }
  return range;
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const last = endOfMonth(viewMonth);

  // Start week on Monday
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export default function BookingBar() {
  const pickupLabel = "Magaluf (Carrer Galeón 13)";

  const today = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(() => ({
    from: today,
    to: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  }));
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");

  const popRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  // close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (
        open &&
        popRef.current &&
        !popRef.current.contains(t) &&
        buttonRef.current &&
        !buttonRef.current.contains(t)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const label =
    range.from && range.to
      ? `${formatDate(range.from)} → ${formatDate(range.to)}`
      : range.from
      ? `${formatDate(range.from)} → Select return`
      : "Select dates";

  function onPick(day: Date) {
    if (!range.from) {
      setRange({ from: day, to: undefined });
      return;
    }
    if (range.from && !range.to) {
      const next = clampRange({ from: range.from, to: day });
      setRange(next);
      setOpen(false);
      return;
    }
    setRange({ from: day, to: undefined });
  }

  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const canSearch = Boolean(range.from && range.to);

  return (
    <div className="w-full relative z-50">

      <div className="mx-auto w-full max-w-5xl">
        {/* Booking.com style: white container + yellow border bar */}
        <div className="rounded-xl bg-white p-2 shadow-lg">
          <div className="flex flex-col overflow-hidden rounded-lg border-4 border-yellow-400 md:flex-row">
            {/* LOCATION (fixed) */}
            <div className="flex min-w-[260px] items-center gap-3 border-b border-yellow-400 bg-white px-4 py-3 md:border-b-0 md:border-r">
              <LocationIcon />
              <div className="leading-tight">
                <div className="text-xs text-gray-500">Pick-up location</div>
                <div className="font-semibold text-gray-900">{pickupLabel}</div>
              </div>
            </div>

            {/* DATES (your calendar popover) */}
            <div className="relative flex flex-1 items-center gap-3 border-b border-yellow-400 bg-white px-4 py-3 md:border-b-0 md:border-r">
              <CalendarIcon />
              <div className="w-full leading-tight">
                <div className="text-xs text-gray-500">Pick-up → Drop-off</div>
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="w-full text-left text-sm font-semibold text-gray-900 hover:opacity-90"
                >
                  {label}
                </button>
              </div>

              {/* Popover calendar */}
              {open && (
                <div ref={popRef} className="absolute left-0 top-full z-[999] mt-3">
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl p-4">
                    {/* Header */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-gray-900 font-semibold">
                        {viewMonth.toLocaleString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setViewMonth((m) => addMonths(m, -1))}
                          className="h-9 w-9 rounded-xl border border-gray-200 text-gray-900 hover:bg-gray-50"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMonth((m) => addMonths(m, 1))}
                          className="h-9 w-9 rounded-xl border border-gray-200 text-gray-900 hover:bg-gray-50"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    {/* Weekdays */}
                    <div className="mb-1 grid grid-cols-7 gap-1">
                      {weekdays.map((w) => (
                        <div key={w} className="py-1 text-center text-xs text-gray-500">
                          {w}
                        </div>
                      ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((d, idx) => {
                        if (!d) return <div key={idx} className="h-10" />;

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
                            onClick={() => onPick(d)}
                            className={[
                              "h-10 rounded-xl text-sm font-semibold transition",
                              "text-gray-900 hover:bg-gray-50",
                              inRange ? "bg-yellow-100" : "",
                              isStart || isEnd ? "bg-yellow-400 text-gray-900" : "",
                              isStart && range.to ? "rounded-l-2xl" : "",
                              isEnd && range.from ? "rounded-r-2xl" : "",
                            ].join(" ")}
                          >
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setRange({})}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-xl bg-blue-700 px-4 py-2 text-white font-semibold hover:bg-blue-800"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PICKUP TIME */}
            <div className="flex items-center gap-3 border-b border-yellow-400 bg-white px-4 py-3 md:border-b-0 md:border-r">
              <ClockIcon />
              <div className="leading-tight">
                <div className="text-xs text-gray-500">Pick-up time</div>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* DROPOFF TIME */}
            <div className="flex items-center gap-3 border-b border-yellow-400 bg-white px-4 py-3 md:border-b-0 md:border-r">
              <ClockIcon />
              <div className="leading-tight">
                <div className="text-xs text-gray-500">Drop-off time</div>
                <input
                  type="time"
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* SEARCH BUTTON */}
            <button
              type="button"
              className={[
                "min-h-[56px] px-8 py-4 text-center text-base font-bold text-white",
                canSearch ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-700/60 cursor-not-allowed",
              ].join(" ")}
              onClick={() => {
                if (!range.from || !range.to) {
                  setOpen(true);
                  return;
                }

                // Send to your /time page (keep your logic)
                const fromISO = range.from.toISOString();
                const toISO = range.to.toISOString();

                // Optional: also pass time + location
                const params = new URLSearchParams({
                  from: fromISO,
                  to: toISO,
                  pickupTime,
                  dropoffTime,
                  pickupLocation: pickupLabel,
                  pickupDate: toIsoDate(range.from),
                  dropoffDate: toIsoDate(range.to),
                });

                window.location.href = `/time?${params.toString()}`;
              }}
            >
              Search
            </button>
          </div>

          <div className="px-2 pt-2 text-xs text-gray-500">
            Pick-up location is fixed at Carrer Galeón 13. Select pick-up then drop-off date.
          </div>
        </div>
      </div>
    </div>
  );
}

/* icons */
function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-600" fill="none">
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
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-600" fill="none">
      <path
        d="M8 2v3M16 2v3M3 9h18M5 6h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-600" fill="none">
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
