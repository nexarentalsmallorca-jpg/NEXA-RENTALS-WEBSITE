"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function BookingDateRange() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const [range, setRange] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // When both dates selected -> go to /time automatically
  React.useEffect(() => {
    if (range?.from && range?.to) {
      const from = format(range.from, "yyyy-MM-dd");
      const to = format(range.to, "yyyy-MM-dd");
      router.push(`/time?from=${from}&to=${to}`);
    }
  }, [range, router]);

  const label =
    range?.from && range?.to
      ? `${format(range.from, "dd MMM")} → ${format(range.to, "dd MMM")}`
      : "Select dates";

  return (
    <div className="relative w-full max-w-[560px]">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-orange-500/40 bg-black/50 px-4 py-3 text-left text-white backdrop-blur-md hover:border-orange-500/70"
      >
        <div className="text-xs opacity-70">Pick-up → Return</div>
        <div className="text-lg font-semibold">{label}</div>
      </button>

      {/* Calendar Popover */}
      {open && (
        <div className="absolute z-50 mt-3 w-[320px] sm:w-[560px] rounded-2xl border border-orange-500/30 bg-zinc-950 p-3 shadow-2xl">
          <DayPicker
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            disabled={{ before: new Date() }}
            className="rdp-orange"
          />

          <div className="mt-2 flex justify-between gap-2">
            <button
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-white/80 hover:bg-zinc-900"
              onClick={() => {
                setRange({ from: undefined, to: undefined });
              }}
            >
              Clear
            </button>

            <button
              className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-black hover:bg-orange-400"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          {/* Orange range styling */}
          <style jsx global>{`
            /* Base */
            .rdp-orange .rdp-day {
              border-radius: 10px;
            }

            /* Selected start/end */
            .rdp-orange .rdp-day_selected {
              background: rgba(249, 115, 22, 1) !important; /* orange-500 */
              color: black !important;
            }

            /* Range middle highlight */
            .rdp-orange .rdp-day_range_middle {
              background: rgba(249, 115, 22, 0.22) !important;
              color: white !important;
              border-radius: 0 !important;
            }

            /* Make the whole row feel connected */
            .rdp-orange .rdp-day_range_start {
              border-top-right-radius: 0 !important;
              border-bottom-right-radius: 0 !important;
            }
            .rdp-orange .rdp-day_range_end {
              border-top-left-radius: 0 !important;
              border-bottom-left-radius: 0 !important;
            }

            /* Calendar styling */
            .rdp {
              --rdp-cell-size: 42px;
              --rdp-accent-color: rgba(249, 115, 22, 1);
              --rdp-background-color: rgba(249, 115, 22, 0.22);
              color: white;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
