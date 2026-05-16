"use client";

import AdminShell from "../../components/dashboard/AdminShell";

const rows = [
  {
    vehicle: "SCOOTER-001",
    today: "Available",
    tomorrow: "Rented",
    next: "Available",
  },
  {
    vehicle: "SCOOTER-002",
    today: "Rented",
    tomorrow: "Rented",
    next: "Available",
  },
  {
    vehicle: "EBIKE-001",
    today: "Available",
    tomorrow: "Available",
    next: "Maintenance",
  },
];

export default function CalendarPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
            Availability
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            Vehicle Calendar
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
            This will show which scooter or e-bike is free, rented, blocked or
            in maintenance by date and time.
          </p>
        </section>

        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#080A10]/80 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="grid grid-cols-4 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/35">
            <div>Vehicle</div>
            <div>Today</div>
            <div>Tomorrow</div>
            <div>Next Day</div>
          </div>

          {rows.map((row) => (
            <div
              key={row.vehicle}
              className="grid grid-cols-4 border-b border-white/5 px-5 py-5 text-sm"
            >
              <div className="font-black text-white">{row.vehicle}</div>
              {[row.today, row.tomorrow, row.next].map((status, index) => (
                <div key={index}>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${
                      status === "Available"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : status === "Maintenance"
                        ? "border-red-400/20 bg-red-400/10 text-red-300"
                        : "border-orange-400/20 bg-orange-400/10 text-orange-300"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}