import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status }
  );
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

async function getLatestMaintenance(vehicleCode: string, type: string) {
  const { data, error } = await supabaseAdmin
    .from("nexa_fleet_maintenance_records")
    .select("*")
    .eq("vehicle_code", vehicleCode)
    .eq("maintenance_type", type)
    .order("performed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
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

async function buildVehicleSnapshot(vehicleCode: string) {
  const vehicle = findVehicleByCodigo(vehicleCode);

  if (!vehicle) {
    throw new Error(`Unknown vehicle code: ${vehicleCode}`);
  }

  const { data: state, error: stateError } = await supabaseAdmin
    .from("nexa_fleet_vehicle_state")
    .select("*")
    .eq("vehicle_code", vehicle.codigo)
    .maybeSingle();

  if (stateError) throw stateError;

  const [
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
  ] = await Promise.all([
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
  ]);

  return {
    vehicle,
    state: state || {
      vehicle_code: vehicle.codigo,
      current_km: 0,
      road_ready: true,
      public_health_status: "healthy",
      internal_status: "healthy",
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
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawVehicleCode = searchParams.get("vehicleCode");
    const vehicleCode = normalizeVehicleCode(rawVehicleCode);

    if (vehicleCode) {
      const snapshot = await buildVehicleSnapshot(vehicleCode);

      return NextResponse.json({
        ok: true,
        data: snapshot,
      });
    }

    const { data: states, error } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .select("*")
      .order("vehicle_code", { ascending: true });

    if (error) throw error;

    const snapshots = [];

    for (const state of states || []) {
      const vehicle = findVehicleByCodigo(state.vehicle_code);

      if (!vehicle) continue;

      const snapshot = await buildVehicleSnapshot(vehicle.codigo);

      snapshots.push(snapshot);
    }

    return NextResponse.json({
      ok: true,
      data: snapshots,
    });
  } catch (error) {
    console.error("Fleet maintenance GET error:", error);

    return jsonError(
      error instanceof Error ? error.message : "Failed to load fleet maintenance.",
      500
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const vehicleCode = normalizeVehicleCode(body.vehicleCode);
    const vehicle = findVehicleByCodigo(vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const currentKm = numberOrNull(body.currentKm);
    const roadReady =
      typeof body.roadReady === "boolean" ? body.roadReady : undefined;

    const updatePayload: Record<string, unknown> = {};

    if (currentKm !== null) {
      if (currentKm < 0) {
        return jsonError("Current kilometers cannot be negative.");
      }

      updatePayload.current_km = Math.round(currentKm);
    }

    if (roadReady !== undefined) {
      updatePayload.road_ready = roadReady;
      updatePayload.public_health_status = roadReady
        ? "healthy"
        : "temporarily_unavailable";

      if (!roadReady) {
        updatePayload.internal_status = "do_not_rent";
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return jsonError("Nothing to update.");
    }

    const { data: existingState, error: existingError } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .select("*")
      .eq("vehicle_code", vehicle.codigo)
      .maybeSingle();

    if (existingError) throw existingError;

    const { data, error } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .upsert(
        {
          vehicle_code: vehicle.codigo,
          ...updatePayload,
        },
        {
          onConflict: "vehicle_code",
        }
      )
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("nexa_fleet_activity_log").insert({
      vehicle_code: vehicle.codigo,
      action_type: "vehicle_state_updated",
      entity_type: "vehicle_state",
      old_value: existingState,
      new_value: data,
      performed_by: "admin",
    });

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Fleet maintenance PATCH error:", error);

    return jsonError(
      error instanceof Error ? error.message : "Failed to update vehicle.",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const vehicleCode = normalizeVehicleCode(body.vehicleCode);
    const vehicle = findVehicleByCodigo(vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const maintenanceType = String(body.maintenanceType || "").trim();

    const allowedMaintenanceTypes = [
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
    ];

    if (!allowedMaintenanceTypes.includes(maintenanceType)) {
      return jsonError("Invalid maintenance type.");
    }

    const performedKm = numberOrNull(body.performedKm);

    if (performedKm === null || performedKm < 0) {
      return jsonError("A valid service mileage is required.");
    }

    let nextDueKm = numberOrNull(body.nextDueKm);

    if (nextDueKm === null) {
      const { data: rule, error: ruleError } = await supabaseAdmin
        .from("nexa_fleet_maintenance_rules")
        .select("*")
        .eq("fleet_group", vehicle.fleetGroup)
        .eq("maintenance_type", maintenanceType)
        .eq("active", true)
        .maybeSingle();

      if (ruleError) throw ruleError;

      if (rule?.interval_km) {
        nextDueKm = Math.round(performedKm + Number(rule.interval_km));
      }
    }

    const recordPayload = {
      vehicle_code: vehicle.codigo,
      maintenance_type: maintenanceType,
      performed_km: Math.round(performedKm),
      performed_at: body.performedAt || new Date().toISOString(),
      next_due_km: nextDueKm === null ? null : Math.round(nextDueKm),
      next_due_at: body.nextDueAt || null,
      notes: body.notes ? String(body.notes) : null,
      cost:
        body.cost === null || body.cost === undefined || body.cost === ""
          ? null
          : Number(body.cost),
      performed_by: body.performedBy
        ? String(body.performedBy)
        : "admin",
    };

    const { data: record, error: recordError } = await supabaseAdmin
      .from("nexa_fleet_maintenance_records")
      .insert(recordPayload)
      .select("*")
      .single();

    if (recordError) throw recordError;

    const stateUpdate: Record<string, unknown> = {
      vehicle_code: vehicle.codigo,
      current_km: Math.round(performedKm),
      last_service_at: record.performed_at,
    };

    const { error: stateError } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .upsert(stateUpdate, {
        onConflict: "vehicle_code",
      });

    if (stateError) throw stateError;

    await supabaseAdmin.from("nexa_fleet_activity_log").insert({
      vehicle_code: vehicle.codigo,
      action_type: "maintenance_record_created",
      entity_type: "maintenance_record",
      entity_id: record.id,
      new_value: record,
      performed_by: record.performed_by,
    });

    return NextResponse.json({
      ok: true,
      data: record,
    });
  } catch (error) {
    console.error("Fleet maintenance POST error:", error);

    return jsonError(
      error instanceof Error ? error.message : "Failed to save maintenance record.",
      500
    );
  }
}