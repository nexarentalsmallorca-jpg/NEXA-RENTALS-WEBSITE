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

function normalizeInspectionStatus(value: unknown) {
  const clean = String(value || "").trim().toLowerCase();

  if (
    clean === "pass" ||
    clean === "attention" ||
    clean === "fail" ||
    clean === "not_checked"
  ) {
    return clean;
  }

  return "not_checked";
}

function calculateOverallResult(
  items: Array<{
    status?: unknown;
  }>
) {
  const statuses = items.map((item) =>
    normalizeInspectionStatus(item.status)
  );

  if (statuses.includes("fail")) {
    return "fail";
  }

  if (statuses.includes("attention")) {
    return "attention";
  }

  return "pass";
}

export async function GET(request: NextRequest) {
  try {
    const vehicleCode = normalizeVehicleCode(
      request.nextUrl.searchParams.get("vehicleCode")
    );

    if (!vehicleCode) {
      return jsonError("vehicleCode is required.");
    }

    const vehicle = findVehicleByCodigo(vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const { data: inspections, error: inspectionError } = await supabaseAdmin
      .from("nexa_fleet_inspections")
      .select("*")
      .eq("vehicle_code", vehicle.codigo)
      .order("inspected_at", { ascending: false });

    if (inspectionError) throw inspectionError;

    const inspectionIds = (inspections || []).map((item) => item.id);

    let items: any[] = [];

    if (inspectionIds.length > 0) {
      const { data: inspectionItems, error: itemsError } = await supabaseAdmin
        .from("nexa_fleet_inspection_items")
        .select("*")
        .in("inspection_id", inspectionIds)
        .order("created_at", { ascending: true });

      if (itemsError) throw itemsError;

      items = inspectionItems || [];
    }

    const output = (inspections || []).map((inspection) => ({
      ...inspection,
      items: items.filter(
        (item) => item.inspection_id === inspection.id
      ),
    }));

    return NextResponse.json({
      ok: true,
      data: output,
    });
  } catch (error) {
    console.error("Fleet inspection GET error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to load inspections.",
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

    const odometerKm = numberOrNull(body.odometerKm);

    if (odometerKm === null || odometerKm < 0) {
      return jsonError("Valid odometer kilometers are required.");
    }

    const inspectionType = String(
      body.inspectionType || "technical"
    ).trim();

    const allowedInspectionTypes = [
      "technical",
      "weekly",
      "pre_rental",
      "post_rental",
      "other",
    ];

    if (!allowedInspectionTypes.includes(inspectionType)) {
      return jsonError("Invalid inspection type.");
    }

    const inspectionItems = Array.isArray(body.items)
      ? body.items
      : [];

    if (inspectionItems.length === 0) {
      return jsonError("Inspection items are required.");
    }

    const result = calculateOverallResult(inspectionItems);

    const inspectionPayload = {
      vehicle_code: vehicle.codigo,
      inspection_type: inspectionType,
      odometer_km: Math.round(odometerKm),
      result,
      public_summary:
        body.publicSummary ||
        "Routine safety inspection completed.",
      internal_notes: body.internalNotes
        ? String(body.internalNotes)
        : null,
      inspected_by: body.inspectedBy
        ? String(body.inspectedBy)
        : "admin",
      inspected_at: body.inspectedAt || new Date().toISOString(),
    };

    const { data: inspection, error: inspectionError } =
      await supabaseAdmin
        .from("nexa_fleet_inspections")
        .insert(inspectionPayload)
        .select("*")
        .single();

    if (inspectionError) throw inspectionError;

    const itemPayloads = inspectionItems.map((item: any) => ({
      inspection_id: inspection.id,
      item_key: String(item.itemKey || ""),
      item_label: String(item.itemLabel || ""),
      status: normalizeInspectionStatus(item.status),
      value_text:
        item.valueText === undefined || item.valueText === null
          ? null
          : String(item.valueText),
      value_number:
        numberOrNull(item.valueNumber) === null
          ? null
          : Number(item.valueNumber),
      unit:
        item.unit === undefined || item.unit === null
          ? null
          : String(item.unit),
      internal_note:
        item.internalNote === undefined ||
        item.internalNote === null ||
        item.internalNote === ""
          ? null
          : String(item.internalNote),
    }));

    const { data: savedItems, error: itemsError } =
      await supabaseAdmin
        .from("nexa_fleet_inspection_items")
        .insert(itemPayloads)
        .select("*");

    if (itemsError) throw itemsError;

    const roadReady = result !== "fail";

    const internalStatus =
      result === "fail"
        ? "do_not_rent"
        : result === "attention"
          ? "attention_required"
          : "healthy";

    const { data: existingState, error: existingStateError } =
      await supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .maybeSingle();

    if (existingStateError) throw existingStateError;

    const { data: updatedState, error: stateError } =
      await supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .upsert(
          {
            vehicle_code: vehicle.codigo,
            current_km: Math.round(odometerKm),
            road_ready: roadReady,
            public_health_status: roadReady
              ? "healthy"
              : "temporarily_unavailable",
            internal_status: internalStatus,
            last_inspection_at: inspection.inspected_at,
          },
          {
            onConflict: "vehicle_code",
          }
        )
        .select("*")
        .single();

    if (stateError) throw stateError;

    await supabaseAdmin
      .from("nexa_fleet_activity_log")
      .insert({
        vehicle_code: vehicle.codigo,
        action_type: "inspection_completed",
        entity_type: "inspection",
        entity_id: inspection.id,
        old_value: existingState,
        new_value: {
          inspection,
          state: updatedState,
        },
        performed_by: inspection.inspected_by,
      });

    return NextResponse.json({
      ok: true,
      data: {
        inspection,
        items: savedItems || [],
        state: updatedState,
      },
    });
  } catch (error) {
    console.error("Fleet inspection POST error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to save inspection.",
      500
    );
  }
}