
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

/*
  IMAGE SETTINGS

  Piaggio keeps its original positioning.
  SYM uses contain to show more of the scooter.
*/

const DEFAULT_IMAGE_SETTINGS = {
  imageScale: 1.05,
  imageMoveY: 3,
  imageMoveX: 0,
  frameHeight: 36,
  frameMinHeight: 300,
  frameMaxHeight: 390,
  objectFit: "cover" as const,
};

const SYM_IMAGE_SETTINGS = {
  imageScale: 1.0,
  imageMoveY: 3,
  imageMoveX: 0,
  frameHeight: 36,
  frameMinHeight: 300,
  frameMaxHeight: 390,
  objectFit: "contain" as const,
};

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

  beltService?: {
    lastBeltAt: string | null;
    lastBeltKm: number | null;
    nextBeltKm: number | null;
    kmRemaining: number | null;
    defaultIntervalKm: number;
    monitored: boolean;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatKm(value?: number | null) {
  if (value === null || value === undefined) {
    return "Not recorded";
  }

  return `${Number(value).toLocaleString("en-GB")} km`;
}

function getServiceRemainingText(remaining: number | null) {
  if (remaining === null) {
    return "Not scheduled";
  }

  if (remaining > 0) {
    return `${remaining.toLocaleString("en-GB")} km remaining`;
  }

  if (remaining === 0) {
    return "Service due now";
  }

  return `${Math.abs(remaining).toLocaleString("en-GB")} km overdue`;
}

export default function PublicFleetPage() {
  const params = useParams();

  const code = String(params?.code || "").toUpperCase();

  const [data, setData] = useState<PublicFleetData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    async function loadVehicle() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/fleet/public/${encodeURIComponent(code)}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(
            result.error || "Vehicle could not be loaded."
          );
        }

        if (!cancelled) {
          setData(result.data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Vehicle could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadVehicle();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const healthy = data?.health.roadReady === true;

  const isSym =
    String(data?.vehicle.make || "")
      .toLowerCase()
      .includes("sym") ||
    String(data?.vehicle.model || "")
      .toLowerCase()
      .includes("symphony");

  const imageSettings = isSym
    ? SYM_IMAGE_SETTINGS
    : DEFAULT_IMAGE_SETTINGS;

  const checks = useMemo(() => {
    const inspection = data?.inspection;

    return [
      {
        label: "Brakes checked",
        ok: inspection?.checks.brakes === true,
      },
      {
        label: "Tyres checked",
        ok: inspection?.checks.tires === true,
      },
      {
        label: "Tyre pressure checked",
        ok: false,
      },
      {
        label: "Lights checked",
        ok: inspection?.checks.lights === true,
      },
      {
        label: "Controls checked",
        ok: inspection?.checks.controls === true,
      },
    ];
  }, [data]);

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black px-6 text-white">
        <p className="text-sm tracking-wide text-white/60">
          Loading vehicle status...
        </p>
      </main>
    );
  }

  if (!data || errorMessage) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black px-6 text-white">
        <p className="text-sm text-white/70">
          {errorMessage || "Vehicle not found."}
        </p>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        html,
        body {
          background: #000 !important;
        }

        a[href*="wa.me"],
        a[href*="whatsapp"],
        a[href*="api.whatsapp"],
        [aria-label*="WhatsApp"],
        [aria-label*="whatsapp"],
        [title*="WhatsApp"],
        [title*="whatsapp"],
        .whatsapp-widget,
        .whatsapp-button,
        .floating-whatsapp,
        .ai-widget,
        .floating-ai,
        [data-ai-widget="true"] {
          display: none !important;
        }
      `}</style>

      <main className="min-h-[100svh] w-full bg-black text-white">
        <div className="mx-auto flex min-h-[100svh] w-full max-w-[520px] flex-col bg-black">

          {/* TOP IDENTITY */}

          <header className="shrink-0 px-5 pt-[max(18px,env(safe-area-inset-top))]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-orange-300">
                  NEXA RENTALS
                </p>

                <h1 className="mt-2 text-[30px] font-medium leading-none tracking-[-0.02em] text-white">
                  {data.vehicle.code}
                </h1>

                <p className="mt-2 text-[13px] text-white/85">
                  {data.vehicle.publicName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/45">
                  Registration
                </p>

                <p className="mt-1.5 text-[13px] font-medium tracking-[0.07em] text-white">
                  {data.vehicle.registration}
                </p>

                <p className="mt-3 text-[7px] font-medium uppercase tracking-[0.17em] text-white/35">
                  Last Inspected
                </p>

                <p className="mt-1 text-[9px] text-white/65">
                  {data.inspection
                    ? formatDate(data.inspection.inspectedAt)
                    : "Not recorded"}
                </p>
              </div>
            </div>
          </header>

          {/* VEHICLE IMAGE */}

          <section className="shrink-0 px-4 pt-3">
            <div
              className="relative mx-auto w-full overflow-hidden bg-black"
              style={{
                height: `${imageSettings.frameHeight}svh`,
                minHeight: `${imageSettings.frameMinHeight}px`,
                maxHeight: `${imageSettings.frameMaxHeight}px`,
              }}
            >
              <img
                src={data.vehicle.imageUrl}
                alt={data.vehicle.publicName}
                className="absolute h-full w-full object-center"
                style={{
                  left: 0,
                  top: 0,
                  objectFit: imageSettings.objectFit,
                  transform: `
                    translate(
                      ${imageSettings.imageMoveX}%,
                      ${imageSettings.imageMoveY}%
                    )
                    scale(${imageSettings.imageScale})
                  `,
                  transformOrigin: "center center",
                }}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[34px] bg-gradient-to-t from-black to-transparent" />
            </div>
          </section>

          {/* INFORMATION */}

          <section className="flex min-h-0 flex-1 flex-col bg-black px-5">

            {/* HEALTH */}

            <div className="shrink-0 pt-1">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    healthy
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />

                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/50">
                  Vehicle Health
                </p>
              </div>

              <h2 className="mt-1.5 text-[21px] font-medium leading-none tracking-[-0.015em] text-white">
                {healthy
                  ? "Healthy"
                  : "Temporarily unavailable"}
              </h2>

              <p className="mt-1.5 text-[10px] leading-[1.45] text-white/50">
                {healthy
                  ? "Road ready and routinely maintained by NEXA Rentals."
                  : "Currently unavailable while our team completes a technical check."}
              </p>
            </div>

            {/* SAFETY CHECKS */}

            <div className="mt-3 shrink-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.19em] text-white/45">
                Safety Checks
              </p>

              <p className="mt-0.5 text-[8px] text-white/30">
                {data.inspection
                  ? `Last checked ${formatDate(
                      data.inspection.inspectedAt
                    )}`
                  : "Inspection record pending"}
              </p>

              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {checks.map((item) => (
                  <div
                    key={item.label}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    <span
                      className={`shrink-0 text-[11px] font-semibold ${
                        item.ok
                          ? "text-emerald-400"
                          : "text-white/30"
                      }`}
                    >
                      {item.ok ? "✓" : "—"}
                    </span>

                    <span
                      className={`truncate text-[9px] ${
                        item.ok
                          ? "text-white/90"
                          : "text-white/45"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SERVICE INFORMATION */}

            <div className="mt-3 shrink-0 border-t border-white/10 pt-2.5">
              <div className="grid grid-cols-3 gap-3">
                <ServiceDetail
                  label="Last Service"
                  value={formatKm(
                    data.routineService.lastServiceKm
                  )}
                  subvalue={formatDate(
                    data.routineService.lastServiceAt
                  )}
                />

                <ServiceDetail
                  label="Next Service"
                  value={
                    data.routineService.nextServiceKm !== null
                      ? formatKm(
                          data.routineService.nextServiceKm
                        )
                      : "Not set"
                  }
                  subvalue={getServiceRemainingText(
                    data.routineService.kmRemaining
                  )}
                />

                <ServiceDetail
                  label="Current KM"
                  value={formatKm(data.mileage.currentKm)}
                  subvalue="Odometer"
                />
              </div>
            </div>

            {/* CLEAN PUBLIC FOOTER */}

            <div className="min-h-6 flex-1" />

            <footer className="mb-[max(18px,env(safe-area-inset-bottom))] mt-4 border-t border-white/10 pt-3 text-center">
              <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-white/30">
                NEXA RENTALS
              </p>
              <p className="mt-1 text-[8px] text-white/25">
                Vehicle information &amp; maintenance status
              </p>
            </footer>

          </section>
        </div>
      </main>
    </>
  );
}

function ServiceDetail({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[7px] font-medium uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-medium text-white/80">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[7px] text-white/30">
        {subvalue}
      </p>
    </div>
  );
}
