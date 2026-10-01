"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

type PublicFleetData = {
  vehicle: {
    code: string;
    registration: string;
    make: string;
    model: string;
    publicName: string;
    imageUrl: string;
  };

  health: {
    roadReady: boolean;
    publicStatus: string;
    headline: string;
    roadReadyLabel: string;
  };

  mileage: {
    currentKm: number;
  };

  inspection: null | {
    inspectedAt: string;
    result: string;
    summary: string;

    checks: {
      brakes: boolean;
      tires: boolean;
      lights: boolean;
      controls: boolean;
    };
  };

  routineService: {
    lastServiceAt: string | null;
    lastServiceKm: number | null;
    nextServiceKm: number | null;
    kmRemaining: number | null;
    monitored: boolean;
  };
};

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not yet recorded";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not yet recorded";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatKm(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return `${Number(
    value
  ).toLocaleString(
    "en-GB"
  )} km`;
}

export default function PublicFleetPage() {
  const params = useParams();
  const router = useRouter();

  const code = String(
    params?.code || ""
  ).toUpperCase();

  const [
    data,
    setData,
  ] =
    useState<PublicFleetData | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function loadVehicle() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await fetch(
          `/api/fleet/public/${encodeURIComponent(
            code
          )}`,
          {
            cache:
              "no-store",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "Vehicle could not be loaded."
        );
      }

      setData(
        result.data
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Vehicle could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (code) {
      loadVehicle();
    }
  }, [code]);

  const healthy =
    data?.health
      .roadReady !== false;

  const nextServiceText =
    useMemo(() => {
      if (!data) {
        return "Monitored by NEXA";
      }

      const nextKm =
        data.routineService
          .nextServiceKm;

      if (
        nextKm === null
      ) {
        return "Monitored by NEXA";
      }

      return formatKm(
        nextKm
      );
    }, [data]);

  const remainingText =
    useMemo(() => {
      if (!data) {
        return "";
      }

      const remaining =
        data.routineService
          .kmRemaining;

      if (
        remaining === null
      ) {
        return "Routine maintenance monitored";
      }

      if (remaining > 0) {
        return `${Number(
          remaining
        ).toLocaleString(
          "en-GB"
        )} km until routine service`;
      }

      return "Routine service reminder active";
    }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-[30px] border border-white/10 bg-[#0B0B0C] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
              NEXA RENTALS
            </p>

            <p className="mt-4 text-xl font-black">
              Loading vehicle
              status...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (
    !data ||
    errorMessage
  ) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-6 text-white">
        <div className="mx-auto max-w-md rounded-[30px] border border-red-400/20 bg-red-500/10 p-6">
          <p className="text-sm font-black text-red-300">
            {errorMessage ||
              "Vehicle not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-4 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <section className="overflow-hidden rounded-[34px] border border-white/10 bg-[#0B0B0C] shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
          <div className="px-5 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-300">
                  NEXA RENTALS
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight">
                  {
                    data.vehicle
                      .code
                  }
                </h1>

                <p className="mt-1 text-sm font-bold text-white/45">
                  {
                    data.vehicle
                      .publicName
                  }
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <p className="text-xs font-black tracking-[0.12em]">
                  {
                    data.vehicle
                      .registration
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="relative overflow-hidden rounded-[30px] border border-white/[0.06] bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.08),transparent_45%),linear-gradient(180deg,#131416_0%,#080809_100%)]">
              <img
                src={
                  data.vehicle
                    .imageUrl
                }
                alt={
                  data.vehicle
                    .publicName
                }
                className="h-[285px] w-full object-contain p-4"
              />
            </div>
          </div>

          <div className="p-5">
            <div
              className={`rounded-[28px] border p-5 ${
                healthy
                  ? "border-emerald-400/20 bg-emerald-500/10"
                  : "border-yellow-400/20 bg-yellow-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full shadow-[0_0_22px_currentColor] ${
                    healthy
                      ? "bg-emerald-400 text-emerald-400"
                      : "bg-yellow-400 text-yellow-400"
                  }`}
                />

                <div>
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      healthy
                        ? "text-emerald-300"
                        : "text-yellow-300"
                    }`}
                  >
                    Vehicle
                    Health
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {healthy
                      ? "HEALTHY"
                      : "TEMPORARILY UNAVAILABLE"}
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-sm font-bold leading-5 text-white/55">
                {healthy
                  ? "This scooter is currently marked Road Ready by NEXA Rentals."
                  : "This scooter is temporarily unavailable while our team completes checks or maintenance."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[#0B0B0C] p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                Technical
                Inspection
              </p>

              <h2 className="mt-1 text-xl font-black">
                Safety Checks
              </h2>
            </div>

            {data.inspection ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300">
                Checked
              </span>
            ) : null}
          </div>

          {data.inspection ? (
            <>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">
                  Last
                  Inspection
                </p>

                <p className="mt-2 text-lg font-black">
                  {formatDate(
                    data.inspection
                      .inspectedAt
                  )}
                </p>

                <p className="mt-2 text-xs font-bold leading-5 text-white/40">
                  {
                    data.inspection
                      .summary
                  }
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <CheckCard
                  label="Brakes"
                  checked={
                    data.inspection
                      .checks
                      .brakes
                  }
                />

                <CheckCard
                  label="Tyres"
                  checked={
                    data.inspection
                      .checks
                      .tires
                  }
                />

                <CheckCard
                  label="Lights"
                  checked={
                    data.inspection
                      .checks
                      .lights
                  }
                />

                <CheckCard
                  label="Controls"
                  checked={
                    data.inspection
                      .checks
                      .controls
                  }
                />
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-sm font-bold text-white/40">
                Safety
                inspection
                history will
                appear here
                once recorded.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[#0B0B0C] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Routine
            Maintenance
          </p>

          <h2 className="mt-1 text-xl font-black">
            Service Status
          </h2>

          <div className="mt-4 space-y-3">
            <InfoCard
              label="Last Service"
              value={
                data.routineService
                  .lastServiceKm !==
                null
                  ? formatKm(
                      data.routineService
                        .lastServiceKm
                    ) ||
                    "Not recorded"
                  : "Not recorded"
              }
              subtitle={formatDate(
                data.routineService
                  .lastServiceAt
              )}
            />

            <InfoCard
              label="Next Routine Service"
              value={
                nextServiceText ||
                "Monitored by NEXA"
              }
              subtitle={
                remainingText
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-sky-400/10 bg-sky-500/[0.05] px-4 py-4">
            <p className="text-xs font-bold leading-5 text-white/45">
              Routine
              servicing is
              monitored
              internally by
              NEXA Rentals.
              A routine
              service reminder
              does not mean
              the scooter is
              unsafe or
              unavailable.
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[#0B0B0C] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Vehicle
            Information
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniCard
              label="Code"
              value={
                data.vehicle
                  .code
              }
            />

            <MiniCard
              label="Registration"
              value={
                data.vehicle
                  .registration
              }
            />

            <MiniCard
              label="Make"
              value={
                data.vehicle
                  .make
              }
            />

            <MiniCard
              label="Model"
              value={
                data.vehicle
                  .model
              }
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/admin-nexa-secret/login?next=${encodeURIComponent(
                `/admin-nexa-secret/maintenance/${data.vehicle.code}`
              )}`
            )
          }
          className="w-full rounded-[24px] border border-white/10 bg-white px-5 py-4 text-sm font-black text-black transition active:scale-[0.99]"
        >
          STAFF ACCESS
        </button>

        <p className="pb-4 text-center text-[9px] font-black uppercase tracking-[0.2em] text-white/18">
          NEXA Rentals
          Fleet Health
        </p>
      </div>
    </main>
  );
}

function CheckCard({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black ${
            checked
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
              : "border-white/10 bg-white/[0.04] text-white/20"
          }`}
        >
          {checked
            ? "✓"
            : "–"}
        </span>

        <p className="text-sm font-black">
          {label}
        </p>
      </div>

      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
        {checked
          ? "Checked"
          : "Not recorded"}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold leading-5 text-white/35">
        {subtitle}
      </p>
    </div>
  );
}

function MiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black">
        {value}
      </p>
    </div>
  );
}