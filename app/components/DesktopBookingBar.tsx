"use client";

import { useMemo, useState } from "react";

type Props = {
  pickupLabel?: string; // show fixed pickup point
  onSearch?: (data: {
    pickupDate: string;
    pickupTime: string;
    dropoffDate: string;
    dropoffTime: string;
  }) => void;
};

export default function DesktopBookingBar({
  pickupLabel = "Pickup: Magaluf (Carrer Galeón 13)",
  onSearch,
}: Props) {
  const [pickupDate, setPickupDate] = useState(() => todayISO());
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropoffDate, setDropoffDate] = useState(() => plusDaysISO(3));
  const [dropoffTime, setDropoffTime] = useState("10:00");

  const payload = useMemo(
    () => ({ pickupDate, pickupTime, dropoffDate, dropoffTime }),
    [pickupDate, pickupTime, dropoffDate, dropoffTime]
  );

  return (
    <div className="hidden lg:block">
      {/* Fixed pickup badge */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[13px] text-white/80 backdrop-blur-md">
        <IconPin />
        <span className="font-semibold">{pickupLabel}</span>
      </div>

      {/* Booking.com-like bar */}
      <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-md shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="rounded-2xl border border-orange-500/35 p-2">
          <div className="flex items-stretch overflow-hidden rounded-xl bg-white">
            {/* Pick-up date */}
            <Field>
              <IconCal />
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-black/60">
                  Pick-up date
                </div>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-transparent text-[14px] font-semibold text-black outline-none"
                />
              </div>
            </Field>

            <Divider />

            {/* Pick-up time */}
            <Field>
              <IconClock />
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-black/60">
                  Time
                </div>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="bg-transparent text-[14px] font-semibold text-black outline-none"
                />
              </div>
            </Field>

            <Divider />

            {/* Drop-off date */}
            <Field>
              <IconCal />
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-black/60">
                  Drop-off date
                </div>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="bg-transparent text-[14px] font-semibold text-black outline-none"
                />
              </div>
            </Field>

            <Divider />

            {/* Drop-off time */}
            <Field>
              <IconClock />
              <div>
                <div className="text-[11px] font-semibold tracking-wide text-black/60">
                  Time
                </div>
                <input
                  type="time"
                  value={dropoffTime}
                  onChange={(e) => setDropoffTime(e.target.value)}
                  className="bg-transparent text-[14px] font-semibold text-black outline-none"
                />
              </div>
            </Field>

            {/* Search */}
            <button
              onClick={() => onSearch?.(payload)}
              className="min-w-[150px] bg-orange-500 px-7 text-[15px] font-extrabold text-black transition hover:bg-orange-400 active:scale-[0.99]"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- small building blocks ---- */
function Divider() {
  return <div className="w-[1px] bg-black/10" />;
}
function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 px-5 py-3">{children}</div>;
}

/* Helpers */
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function plusDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/* Tiny icons */
function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="text-white/70" fill="none">
      <path
        d="M12 21s7-4.438 7-11a7 7 0 1 0-14 0c0 6.562 7 11 7 11Z"
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
function IconCal() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-black/70" fill="none">
      <path
        d="M8 2v3M16 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="text-black/70" fill="none">
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
