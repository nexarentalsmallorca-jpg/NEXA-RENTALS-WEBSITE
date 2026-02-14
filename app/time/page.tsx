"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

export default function TimePage() {
  const router = useRouter();
  const sp = useSearchParams();

  const from = sp.get("from");
  const to = sp.get("to");

  const [pickupTime, setPickupTime] = React.useState("10:00");
  const [dropoffTime, setDropoffTime] = React.useState("10:00");

  if (!from || !to) {
    return (
      <div className="p-8 text-white">
        Missing dates. Go back and select dates first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-orange-500/30 bg-black/40 p-6">
        <h1 className="text-2xl font-bold">Select times</h1>
        <p className="mt-1 text-sm opacity-70">
          Dates: <span className="text-orange-400">{from}</span> →{" "}
          <span className="text-orange-400">{to}</span>
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <div className="text-sm opacity-80">Pick-up time</div>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            >
              {["09:00", "10:00", "11:00", "12:00", "15:00", "18:00"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-sm opacity-80">Return time</div>
            <select
              value={dropoffTime}
              onChange={(e) => setDropoffTime(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
            >
              {["09:00", "10:00", "11:00", "12:00", "15:00", "18:00"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              router.push(
                `/vehicles?from=${from}&to=${to}&pickupTime=${encodeURIComponent(
                  pickupTime
                )}&dropoffTime=${encodeURIComponent(dropoffTime)}`
              );
            }}
            className="mt-2 w-full rounded-xl bg-orange-500 py-3 font-semibold text-black hover:bg-orange-400"
          >
            Apply → View Vehicles
          </button>
        </div>
      </div>
    </div>
  );
}
