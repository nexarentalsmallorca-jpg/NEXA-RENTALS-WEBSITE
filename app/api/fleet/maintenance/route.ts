
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";
import { verifyNexaAdminSession } from "@/lib/nexaAdminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAINTENANCE_TYPES = [
  "engine_oil",
  "oil_filter",
  "air_filter",
  "cvt_belt",
  "variator_weights",
  "spark_plug",
  "injector_cleaner",
  "brake_service",
  "tire_replacement",
  "battery",
  "general_service",
  "other",
] as const;

const DEFAULT_INTERVALS: Record<string, number> = {
  engine_oil: 2000,
  oil_filter: 4000,
  air_filter: 6000,
  injector_cleaner: 5000,
  cvt_belt: 10000,
  variator_weights: 10000,
  spark_plug: 10000,
};

type MaintenanceRecord = {
  id: string;
  vehicle_code: string;
  maintenance_type: string;
  performed_km: number;
  performed_at: string;
  next_due_km: number | null;
  next_due_at: string | null;
  notes: string | null;
  cost: number | null;
  performed_by: string | null;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { ok: false, error: message },
    { status }
  );
}

function unauthorized() {
  return jsonError(
    "Unauthorized. Please log in to NEXA OS.",
    401
  );
}

function numberOrNull(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validKm(value: number | null): value is number {
  return (
    value !== null &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= 9999999
  );
}

function validDate(
  value: unknown,
  fallbackToNow = false
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallbackToNow
      ? new Date().toISOString()
      : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getVehicle(rawCode: unknown) {
  const code =
    typeof rawCode === "string"
      ? normalizeVehicleCode(rawCode)
      : "";

  return code
    ? findVehicleByCodigo(code)
    : undefined;
}

async function getState(vehicleCode: string) {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_vehicle_state")
    .select("*")
    .eq("vehicle_code", vehicleCode)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function getLatestMaintenance(
  vehicleCode: string,
  type: string
): Promise<MaintenanceRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_maintenance_records")
    .select("*")
    .eq("vehicle_code", vehicleCode)
    .eq("maintenance_type", type)
    .order("performed_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data as MaintenanceRecord | null;
}

async function getLatestInspection(vehicleCode: string) {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_inspections")
    .select("*")
    .eq("vehicle_code", vehicleCode)
    .order("inspected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

async function getOpenIssues(vehicleCode: string) {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_issues")
    .select("*")
    .eq("vehicle_code", vehicleCode)
    .neq("status", "resolved")
    .order("opened_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

async function getRulesForFleetGroup(fleetGroup: string) {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_maintenance_rules")
    .select("*")
    .eq("fleet_group", fleetGroup)
    .eq("active", true);

  if (error) throw error;

  return data || [];
}

async function getServiceSummary(vehicleCode: string) {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_maintenance_records")
    .select("*")
    .eq("vehicle_code", vehicleCode)
    .in("maintenance_type", [
      "engine_oil",
      "general_service",
    ])
    .order("performed_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data as MaintenanceRecord | null;
}

async function buildVehicleSnapshot(vehicleCode: string) {
  const vehicle = getVehicle(vehicleCode);

  if (!vehicle) {
    throw new Error(`Unknown vehicle code: ${vehicleCode}`);
  }

  const [
    state,
    latestOil,
    latestOilFilter,
    latestAirFilter,
    latestInjectorCleaner,
    latestBelt,
    latestWeights,
    latestSparkPlug,
    latestInspection,
    openIssues,
    rules,
    lastService,
  ] = await Promise.all([
    getState(vehicle.codigo),
    getLatestMaintenance(vehicle.codigo, "engine_oil"),
    getLatestMaintenance(vehicle.codigo, "oil_filter"),
    getLatestMaintenance(vehicle.codigo, "air_filter"),
    getLatestMaintenance(vehicle.codigo, "injector_cleaner"),
    getLatestMaintenance(vehicle.codigo, "cvt_belt"),
    getLatestMaintenance(vehicle.codigo, "variator_weights"),
    getLatestMaintenance(vehicle.codigo, "spark_plug"),
    getLatestInspection(vehicle.codigo),
    getOpenIssues(vehicle.codigo),
    getRulesForFleetGroup(vehicle.fleetGroup),
    getServiceSummary(vehicle.codigo),
  ]);

  const currentKm = Number(state?.current_km ?? 0);
  const nextServiceKm = lastService?.next_due_km ?? null;
  const nextBeltKm = latestBelt?.next_due_km ?? null;

  return {
    vehicle,

    state: state || {
      vehicle_code: vehicle.codigo,
      current_km: 0,
      road_ready: false,
      public_health_status: "temporarily_unavailable",
      internal_status: "attention_required",
      last_inspection_at: null,
      last_service_at: null,
    },

    latestMaintenance: {
      engine_oil: latestOil,
      oil_filter: latestOilFilter,
      air_filter: latestAirFilter,
      injector_cleaner: latestInjectorCleaner,
      cvt_belt: latestBelt,
      variator_weights: latestWeights,
      spark_plug: latestSparkPlug,
    },

    latestInspection,
    openIssues,
    rules,

    serviceSummary: {
      lastServiceDate: lastService?.performed_at ?? null,
      lastServiceKm: lastService?.performed_km ?? null,
      nextServiceKm,
      kmUntilService:
        nextServiceKm === null
          ? null
          : nextServiceKm - currentKm,
    },

    beltSummary: {
      lastBeltDate: latestBelt?.performed_at ?? null,
      lastBeltKm: latestBelt?.performed_km ?? null,
      nextBeltKm,
      kmUntilBelt:
        nextBeltKm === null
          ? null
          : nextBeltKm - currentKm,
      defaultIntervalKm: 10000,
    },
  };
}

/*
  GET

  ?vehicleCode=N1 -> one vehicle
  No vehicleCode -> fleet overview

  Private endpoint: requires signed admin session.
*/

export async function GET(request: NextRequest) {
  if (!verifyNexaAdminSession(request)) {
    return unauthorized();
  }

  try {
    const rawCode =
      request.nextUrl.searchParams.get("vehicleCode");

    if (rawCode) {
      const vehicle = getVehicle(rawCode);

      if (!vehicle) {
        return jsonError("Invalid vehicle code.", 404);
      }

      const snapshot = await buildVehicleSnapshot(
        vehicle.codigo
      );

      return NextResponse.json({
        ok: true,
        data: snapshot,
      });
    }

    const { data: states, error } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .select("vehicle_code")
      .order("vehicle_code", { ascending: true });

    if (error) throw error;

    const snapshots = await Promise.all(
      (states || [])
        .filter((state) => !!getVehicle(state.vehicle_code))
        .map((state) =>
          buildVehicleSnapshot(state.vehicle_code)
        )
    );

    return NextResponse.json({
      ok: true,
      data: snapshots,
    });
  } catch (error) {
    console.error("Fleet maintenance GET error:", error);

    return jsonError(
      "Failed to load fleet maintenance.",
      500
    );
  }
}

/*
  PATCH

  Manually updates:
  - current KM
  - road-ready status

  Does NOT:
  - create a service record
  - change last service KM/date
  - change next service KM
  - change belt history
*/

export async function PATCH(request: NextRequest) {
  if (!verifyNexaAdminSession(request)) {
    return unauthorized();
  }

  try {
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError("Invalid request body.");
    }

    const vehicle = getVehicle(body.vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const hasCurrentKm =
      Object.prototype.hasOwnProperty.call(
        body,
        "currentKm"
      );

    const hasRoadReady =
      Object.prototype.hasOwnProperty.call(
        body,
        "roadReady"
      );

    if (!hasCurrentKm && !hasRoadReady) {
      return jsonError("Nothing to update.");
    }

    const updatePayload: Record<string, unknown> = {};
    const existingState = await getState(vehicle.codigo);

    if (hasCurrentKm) {
      const currentKm = numberOrNull(body.currentKm);

      if (!validKm(currentKm)) {
        return jsonError(
          "Current KM must be a valid non-negative whole number."
        );
      }

      updatePayload.current_km = currentKm;
    }

    if (hasRoadReady) {
      if (typeof body.roadReady !== "boolean") {
        return jsonError(
          "roadReady must be true or false."
        );
      }

      if (body.roadReady) {
        const [issues, inspection] = await Promise.all([
          getOpenIssues(vehicle.codigo),
          getLatestInspection(vehicle.codigo),
        ]);

        const unsafeIssue = issues.some(
          (issue) => issue.severity === "do_not_rent"
        );

        if (
          unsafeIssue ||
          inspection?.result === "fail" ||
          inspection?.result === "attention"
        ) {
          return jsonError(
            "Cannot mark Road Ready while an unsafe issue or failed/incomplete inspection remains unresolved.",
            409
          );
        }
      }

      updatePayload.road_ready = body.roadReady;

      updatePayload.public_health_status = body.roadReady
        ? "healthy"
        : "temporarily_unavailable";

      updatePayload.internal_status = body.roadReady
        ? "healthy"
        : "do_not_rent";
    }

    /*
      Preserve existing columns on updates.

      Only initialize required fields when
      the state row does not yet exist.
    */

    let query;

    if (existingState) {
      query = supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .update(updatePayload)
        .eq("vehicle_code", vehicle.codigo);
    } else {
      query = supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .insert({
          vehicle_code: vehicle.codigo,
          current_km: 0,
          road_ready: false,
          public_health_status: "temporarily_unavailable",
          internal_status: "attention_required",
          ...updatePayload,
        });
    }

    const { data, error } = await query
      .select("*")
      .single();

    if (error) throw error;

    const { error: auditError } = await supabaseAdmin
      .from("nexa_fleet_activity_log")
      .insert({
        vehicle_code: vehicle.codigo,
        action_type: "vehicle_state_updated",
        entity_type: "vehicle_state",
        old_value: existingState,
        new_value: data,
        performed_by: "admin",
      });

    if (auditError) {
      console.error(
        "Fleet audit log error:",
        auditError
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Fleet maintenance PATCH error:", error);

    return jsonError(
      "Failed to update vehicle.",
      500
    );
  }
}

/*
  POST

  Records actual completed maintenance.

  Manually entered:
  - performed KM
  - performed date
  - next due KM (optional override)

  Never updates current_km.
*/

export async function POST(request: NextRequest) {
  if (!verifyNexaAdminSession(request)) {
    return unauthorized();
  }

  try {
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError("Invalid request body.");
    }

    const vehicle = getVehicle(body.vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const maintenanceType = String(
      body.maintenanceType || ""
    ).trim();

    if (
      !MAINTENANCE_TYPES.some(
        (type) => type === maintenanceType
      )
    ) {
      return jsonError("Invalid maintenance type.");
    }

    const performedKm = numberOrNull(
      body.performedKm
    );

    if (!validKm(performedKm)) {
      return jsonError(
        "Enter the actual kilometers when the service was performed."
      );
    }

    const performedAt = validDate(
      body.performedAt,
      true
    );

    if (!performedAt) {
      return jsonError("Invalid service date.");
    }

    if (
      new Date(performedAt).getTime() >
      Date.now() + 60000
    ) {
      return jsonError(
        "The completed service date cannot be in the future."
      );
    }

    const hasManualNextKm =
      body.nextDueKm !== null &&
      body.nextDueKm !== undefined &&
      body.nextDueKm !== "";

    let nextDueKm = hasManualNextKm
      ? numberOrNull(body.nextDueKm)
      : null;

    if (
      hasManualNextKm &&
      !validKm(nextDueKm)
    ) {
      return jsonError(
        "Invalid next service kilometers."
      );
    }

    if (nextDueKm === null) {
      const { data: rule, error: ruleError } =
        await supabaseAdmin
          .from("nexa_fleet_maintenance_rules")
          .select("interval_km")
          .eq("fleet_group", vehicle.fleetGroup)
          .eq("maintenance_type", maintenanceType)
          .eq("active", true)
          .maybeSingle();

      if (ruleError) throw ruleError;

      const interval =
        maintenanceType === "cvt_belt"
          ? 10000
          : Number(
              rule?.interval_km ??
                DEFAULT_INTERVALS[maintenanceType] ??
                0
            );

      if (
        Number.isFinite(interval) &&
        interval > 0
      ) {
        nextDueKm = performedKm + interval;
      }
    }

    if (
      nextDueKm !== null &&
      !validKm(nextDueKm)
    ) {
      return jsonError(
        "Calculated next service KM is invalid."
      );
    }

    if (
      nextDueKm !== null &&
      nextDueKm <= performedKm
    ) {
      return jsonError(
        "Next service KM must be greater than performed service KM."
      );
    }

    const nextDueAt = validDate(body.nextDueAt);

    if (body.nextDueAt && !nextDueAt) {
      return jsonError(
        "Invalid next service date."
      );
    }

    const cost = numberOrNull(body.cost);

    if (
      body.cost !== null &&
      body.cost !== undefined &&
      body.cost !== "" &&
      (cost === null || cost < 0)
    ) {
      return jsonError("Invalid service cost.");
    }

    const recordPayload = {
      vehicle_code: vehicle.codigo,
      maintenance_type: maintenanceType,
      performed_km: performedKm,
      performed_at: performedAt,
      next_due_km: nextDueKm,
      next_due_at: nextDueAt,

      notes: body.notes
        ? String(body.notes).slice(0, 3000)
        : null,

      cost,

      performed_by: body.performedBy
        ? String(body.performedBy).slice(0, 120)
        : "admin",
    };

    const {
      data: record,
      error: recordError,
    } = await supabaseAdmin
      .from("nexa_fleet_maintenance_records")
      .insert(recordPayload)
      .select("*")
      .single();

    if (recordError) throw recordError;

    /*
      Sync the most recent routine-service date.

      This does not change current KM.
    */

    if (
      maintenanceType === "engine_oil" ||
      maintenanceType === "general_service"
    ) {
      const existingState = await getState(
        vehicle.codigo
      );

      const previousDate =
        existingState?.last_service_at
          ? new Date(
              existingState.last_service_at
            ).getTime()
          : 0;

      const newDate = new Date(
        performedAt
      ).getTime();

      if (newDate >= previousDate) {
        const stateUpdate = existingState
          ? supabaseAdmin
              .from("nexa_fleet_vehicle_state")
              .update({
                last_service_at: performedAt,
              })
              .eq("vehicle_code", vehicle.codigo)
          : supabaseAdmin
              .from("nexa_fleet_vehicle_state")
              .insert({
                vehicle_code: vehicle.codigo,
                current_km: 0,
                road_ready: false,
                public_health_status:
                  "temporarily_unavailable",
                internal_status:
                  "attention_required",
                last_service_at: performedAt,
              });

        const { error: stateError } =
          await stateUpdate;

        if (stateError) {
          console.error(
            "Failed to sync last service date:",
            stateError
          );
        }
      }
    }

    const { error: auditError } =
      await supabaseAdmin
        .from("nexa_fleet_activity_log")
        .insert({
          vehicle_code: vehicle.codigo,
          action_type:
            "maintenance_record_created",
          entity_type:
            "maintenance_record",
          entity_id: record.id,
          new_value: record,
          performed_by:
            record.performed_by,
        });

    if (auditError) {
      console.error(
        "Fleet audit log error:",
        auditError
      );
    }

    return NextResponse.json({
      ok: true,
      data: record,
    });
  } catch (error) {
    console.error(
      "Fleet maintenance POST error:",
      error
    );

    return jsonError(
      "Failed to save maintenance record.",
      500
    );
  }
}
