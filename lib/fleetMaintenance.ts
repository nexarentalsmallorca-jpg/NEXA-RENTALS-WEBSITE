import type { NexaFleetGroup } from "@/lib/nexaFleet";

export type InternalFleetStatus =
  | "healthy"
  | "service_approaching"
  | "service_due"
  | "service_reminder"
  | "inspection_due"
  | "attention_required"
  | "do_not_rent";

export type PublicFleetStatus =
  | "healthy"
  | "temporarily_unavailable";

export const DEFAULT_MAINTENANCE_INTERVALS: Record<
  string,
  {
    intervalKm: number;
    warningKmBefore: number;
    graceKm: number;
  }
> = {
  engine_oil: {
    intervalKm: 2000,
    warningKmBefore: 300,
    graceKm: 200,
  },

  oil_filter: {
    intervalKm: 4000,
    warningKmBefore: 500,
    graceKm: 400,
  },

  air_filter: {
    intervalKm: 6000,
    warningKmBefore: 500,
    graceKm: 600,
  },

  injector_cleaner: {
    intervalKm: 5000,
    warningKmBefore: 500,
    graceKm: 500,
  },

  cvt_belt: {
    intervalKm: 10000,
    warningKmBefore: 1000,
    graceKm: 500,
  },

  variator_weights: {
    intervalKm: 10000,
    warningKmBefore: 1000,
    graceKm: 500,
  },

  spark_plug: {
    intervalKm: 10000,
    warningKmBefore: 1000,
    graceKm: 500,
  },
};

export function getPublicQrImage(
  fleetGroup?: NexaFleetGroup | string | null
) {
  if (fleetGroup === "piaggio_liberty_125") {
    return "/images/qrpiaggio.png";
  }

  if (fleetGroup === "sym_symphony_125") {
    return "/images/qrsym.png";
  }

  if (fleetGroup === "kymco_sky_town_125") {
    return "/images/kymcocheckout.png";
  }

  return "/images/liberty125.png";
}

export function maintenanceTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    engine_oil: "Engine Oil",
    oil_filter: "Oil Filter",
    air_filter: "Air Filter",
    injector_cleaner: "Injector Cleaner",
    cvt_belt: "CVT Belt",
    variator_weights: "Variator Weights",
    spark_plug: "Spark Plug",
    brake_service: "Brake Service",
    tire_replacement: "Tire Replacement",
    battery: "Battery",
    general_service: "General Service",
    other: "Other",
  };

  return labels[String(type || "")] || String(type || "Maintenance");
}

export function calculateMaintenanceState({
  currentKm,
  nextDueKm,
  warningKmBefore,
  graceKm,
}: {
  currentKm: number;
  nextDueKm?: number | null;
  warningKmBefore?: number | null;
  graceKm?: number | null;
}): InternalFleetStatus {
  if (
    nextDueKm === null ||
    nextDueKm === undefined ||
    !Number.isFinite(Number(nextDueKm))
  ) {
    return "healthy";
  }

  const current = Number(currentKm || 0);
  const due = Number(nextDueKm);
  const warning = Number(warningKmBefore || 0);
  const grace = Number(graceKm || 0);

  const remaining = due - current;

  if (remaining > warning) {
    return "healthy";
  }

  if (remaining > 0) {
    return "service_approaching";
  }

  if (remaining >= -grace) {
    return "service_due";
  }

  return "service_reminder";
}

export function getMoreSeriousStatus(
  current: InternalFleetStatus,
  incoming: InternalFleetStatus
): InternalFleetStatus {
  const priority: Record<InternalFleetStatus, number> = {
    healthy: 0,
    service_approaching: 1,
    service_due: 2,
    service_reminder: 3,
    inspection_due: 4,
    attention_required: 5,
    do_not_rent: 6,
  };

  return priority[incoming] > priority[current]
    ? incoming
    : current;
}

export function publicStatusFromRoadReady(
  roadReady: boolean
): PublicFleetStatus {
  return roadReady ? "healthy" : "temporarily_unavailable";
}

export function publicHeadlineFromRoadReady(
  roadReady: boolean
) {
  return roadReady ? "Healthy" : "Temporarily unavailable";
}

export function publicRoadReadyLabel(
  roadReady: boolean
) {
  return roadReady ? "Road Ready" : "Currently unavailable";
}