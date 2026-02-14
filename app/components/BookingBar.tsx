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

function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const last = endOfMonth(viewMonth);

  // Make grid start on Monday (Airbnb-ish)
  const startDow = (first.getDay() + 6) % 7; // Sun->6, Mon->0
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
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>({});
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
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

  const label = range.from && range.to
    ? `${formatDate(range.from)} → ${formatDate(range.to)}`
    : range.from
      ? `${formatDate(range.from)} → Select return`
      : "Select dates";

  function onPick(day: Date) {
    // If no start, set start.
    if (!range.from) {
      setRange({ from: day, to: undefined });
      return;
    }
    // If start exists and no end, set end and auto-close.
    if (range.from && !range.to) {
      const next = clampRange({ from: range.from, to: day });
      setRange(next);
      setOpen(false);
      // OPTIONAL: auto go to /time after both selected
      // window.location.href = `/time?pickupDate=${encodeURIComponent(next.from!.toISOString())}&dropoffDate=${encodeURIComponent(next.to!.toISOString())}`;
      return;
    }
    // If both exist, start over
    setRange({ from: day, to: undefined });
  }

  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="w-full">
      {/* Outer wrapper prevents overflow */}
      <div className="w-full max-w-[720px]">
        {/* Booking bar container */}
        <div className="rounded-2xl border border-orange-500/40 bg-black/55 backdrop-blur-md shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto]">
            {/* Location */}
            <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-white/10">
              <div className="text-[12px] uppercase tracking-widest text-white/60">
                Pick-up
              </div>
              <div className="text-white font-semibold">
                Magaluf (Carrer Galeón 13)
              </div>
            </div>

            {/* Dates */}
            <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-white/10">
              <div className="text-[12px] uppercase tracking-widest text-white/60">
                Pick-up → Return
              </div>

              <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full text-left text-white font-semibold hover:opacity-90"
              >
                {label}
              </button>

              {/* Popover calendar (clamped to viewport) */}
              {open && (
                <div
                  ref={popRef}
                  className="relative"
                >
                  <div
                    className="
                      absolute z-50 mt-3
                      w-[min(92vw,720px)]
                      max-w-[720px]
                      left-0
                      rounded-2xl border border-white/10
                      bg-[#0b0b0f]/95 backdrop-blur
                      shadow-2xl
                      p-4
                    "
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-semibold">
                        {viewMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewMonth((m) => addMonths(m, -1))}
                          className="h-9 w-9 rounded-xl border border-white/10 text-white hover:bg-white/5"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setViewMonth((m) => addMonths(m, 1))}
                          className="h-9 w-9 rounded-xl border border-white/10 text-white hover:bg-white/5"
                        >
                          ›
                        </button>
                      </div>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {weekdays.map((w) => (
                        <div key={w} className="text-center text-xs text-white/50 py-1">
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
                              "text-white hover:bg-white/5",
                              inRange ? "bg-orange-500/20" : "",
                              isStart || isEnd ? "bg-orange-500 text-black" : "",
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
                        className="text-white/70 hover:text-white text-sm"
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-black font-semibold hover:opacity-90"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-5 py-4 flex items-center justify-between md:justify-center gap-3">
              <button
                type="button"
                className="w-full md:w-auto rounded-xl bg-orange-500 px-6 py-3 text-black font-semibold hover:opacity-90"
                onClick={() => {
                  // Next step: go time page if both dates selected
                  if (range.from && range.to) {
                    window.location.href = `/time?from=${encodeURIComponent(range.from.toISOString())}&to=${encodeURIComponent(range.to.toISOString())}`;
                  } else {
                    setOpen(true);
                  }
                }}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <p className="mt-2 text-white/50 text-xs">
          Tip: Select start date then return date. Range highlights in orange.
        </p>
      </div>
    </div>
  );
}

// helper to compare date-only
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
