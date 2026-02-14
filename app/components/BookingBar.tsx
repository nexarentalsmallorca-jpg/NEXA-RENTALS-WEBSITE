"use client";

import React, { useMemo, useState } from "react";

type DateRange = { from?: Date; to?: Date };

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

export default function BookingBar() {
  const pickupLocation = "Magaluf (Carrer Galeón 13)";
  const today = new Date();

  const [range, setRange] = useState<DateRange>({
    from: today,
    to: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  });

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(startOfMonth(today));
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffTime, setDropoffTime] = useState("10:00");

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  function onPick(day: Date) {
    if (!range.from) {
      setRange({ from: day });
      return;
    }
    if (range.from && !range.to) {
      const [a, b] = day < range.from ? [day, range.from] : [range.from, day];
      setRange({ from: a, to: b });
      return;
    }
    setRange({ from: day, to: undefined });
  }

  const label =
    range.from && range.to
      ? `${range.from.toLocaleDateString()} → ${range.to.toLocaleDateString()}`
      : "Select dates";

  const canSearch = range.from && range.to;

  return (
    <div className="w-full relative z-50">
      <div className="mx-auto max-w-5xl">
        {/* BAR */}
        <div className="rounded-xl bg-white p-2 shadow-xl">
          <div className="flex flex-col md:flex-row overflow-hidden rounded-lg border-4 border-yellow-400">

            {/* LOCATION */}
            <div className="px-4 py-3 border-b md:border-b-0 md:border-r">
              <div className="text-xs text-gray-500">Pick-up location</div>
              <div className="font-semibold">{pickupLocation}</div>
            </div>

            {/* DATES */}
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-3 text-left border-b md:border-b-0 md:border-r flex-1"
            >
              <div className="text-xs text-gray-500">Dates</div>
              <div className="font-semibold">{label}</div>
            </button>

            {/* TIME */}
            <div className="px-4 py-3 border-b md:border-b-0 md:border-r">
              <div className="text-xs text-gray-500">Pick-up time</div>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="font-semibold outline-none"
              />
            </div>

            <div className="px-4 py-3 border-b md:border-b-0 md:border-r">
              <div className="text-xs text-gray-500">Drop-off time</div>
              <input
                type="time"
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
                className="font-semibold outline-none"
              />
            </div>

            {/* SEARCH */}
            <button
              disabled={!canSearch}
              className="bg-blue-700 text-white font-bold px-8 py-4 disabled:opacity-50"
              onClick={() => {
                if (!range.from || !range.to) return;

                const params = new URLSearchParams({
                  from: range.from.toISOString(),
                  to: range.to.toISOString(),
                  pickupTime,
                  dropoffTime,
                });

                window.location.href = `/time?${params}`;
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CALENDAR */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-[90vw] max-w-3xl shadow-2xl">
            
            {/* Header */}
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-lg">Select your dates</h2>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Month nav */}
            <div className="flex justify-between mb-4">
              <button onClick={() => setViewMonth(addMonths(viewMonth, -1))}>‹</button>
              <div className="font-semibold">
                {viewMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>
              <button onClick={() => setViewMonth(addMonths(viewMonth, 1))}>›</button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2">
              {cells.map((d, i) => {
                if (!d) return <div key={i} className="h-12" />;

                const inRange =
                  range.from &&
                  range.to &&
                  d >= startOfDay(range.from) &&
                  d <= startOfDay(range.to);

                const isStart = range.from && isSameDay(d, range.from);
                const isEnd = range.to && isSameDay(d, range.to);

                return (
                  <button
                    key={i}
                    onClick={() => onPick(d)}
                    className={[
                      "h-12 rounded-lg font-semibold",
                      inRange ? "bg-blue-100" : "hover:bg-gray-100",
                      isStart || isEnd ? "bg-blue-600 text-white" : "",
                    ].join(" ")}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-6">
              <button onClick={() => setRange({})}>Clear</button>
              <button
                onClick={() => setOpen(false)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
