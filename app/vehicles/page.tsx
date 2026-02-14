import BookingBar from "../components/BookingBar";
import VehiclesGrid from "./VehiclesGrid";

function safeString(v: unknown) {
  return typeof v === "string" ? v : undefined;
}

function parseISO(v?: string) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function prettyDate(d?: Date) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function prettyTime(t?: string) {
  if (!t) return "--:--";
  // expects "HH:mm"
  const [hhStr, mmStr] = t.split(":");
  const hh = Number(hhStr);
  if (!Number.isFinite(hh)) return t;
  const ampm = hh >= 12 ? "PM" : "AM";
  const hour12 = ((hh + 11) % 12) + 1;
  return `${String(hour12).padStart(2, "0")}:${mmStr} ${ampm}`;
}

export default function VehiclesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pickupLocation =
    safeString(searchParams.pickupLocation) || "Magaluf (Carrer Galeón 13)";

  const fromISO = safeString(searchParams.from);
  const toISO = safeString(searchParams.to);

  const from = parseISO(fromISO);
  const to = parseISO(toISO);

  const pickupTime = safeString(searchParams.pickupTime) || "10:00";
  const dropoffTime = safeString(searchParams.dropoffTime) || "10:00";

  const hasTrip = Boolean(from && to);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top hero header */}
      <div className="relative overflow-hidden">
        {/* background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,106,0,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(255,255,255,0.08),transparent_45%)]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-6">
          <div className="flex flex-col gap-2">
            <div className="text-xs tracking-widest text-white/60">
              NEXA Rentals • Mallorca
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Choose your ride
            </h1>
            <p className="text-white/70 max-w-2xl">
              Pick your dates and time, then select from our scooters & e-bikes.
              Fast pickup at Carrer Galeón 13.
            </p>
          </div>

          {/* Booking bar stays premium on vehicles page too */}
          <div className="mt-6">
            <BookingBar />

          </div>

          {/* Trip summary card */}
          <div className="mt-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex flex-col">
                  <div className="text-xs text-white/60">Your trip</div>
                  <div className="font-bold">
                    {pickupLocation}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm">
                  <div className="rounded-xl bg-black/30 px-3 py-2 border border-white/10">
                    <div className="text-white/60 text-xs">Pick-up</div>
                    <div className="font-extrabold">
                      {prettyDate(from)} • {prettyTime(pickupTime)}
                    </div>
                  </div>

                  <div className="rounded-xl bg-black/30 px-3 py-2 border border-white/10">
                    <div className="text-white/60 text-xs">Drop-off</div>
                    <div className="font-extrabold">
                      {prettyDate(to)} • {prettyTime(dropoffTime)}
                    </div>
                  </div>

                  {!hasTrip && (
                    <div className="text-xs text-yellow-200/90">
                      Select dates above to filter availability.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* small divider */}
          <div className="mt-6 h-px w-full bg-white/10" />
        </div>
    </div>

      {/* Vehicles section */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Optional: quick filters row (you can wire later) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="text-white/80 font-semibold">
            Available vehicles
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/70">
              Free cancellation
            </span>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/70">
              Instant confirmation
            </span>
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/70">
              Pickup in Magaluf
            </span>
          </div>
        </div>

        {/* Your fleet grid component */}
        <VehiclesGrid
          // if your VehiclesGrid supports props, pass them:
          // fromISO={fromISO}
          // toISO={toISO}
          // pickupTime={pickupTime}
          // dropoffTime={dropoffTime}
        />
      </div>
    </div>
  );
}
