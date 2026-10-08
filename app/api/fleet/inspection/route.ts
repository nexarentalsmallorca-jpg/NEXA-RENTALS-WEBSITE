
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";
import { verifyNexaAdminSession } from "@/lib/nexaAdminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InspectionStatus =
  | "pass"
  | "attention"
  | "fail"
  | "not_checked";

type InspectionItemInput = {
  itemKey?: unknown;
  itemLabel?: unknown;
  status?: unknown;
  valueText?: unknown;
  valueNumber?: unknown;
  unit?: unknown;
  internalNote?: unknown;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
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

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeInspectionStatus(
  value: unknown
): InspectionStatus {
  const clean = String(value || "")
    .trim()
    .toLowerCase();

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
  items: InspectionItemInput[]
): "pass" | "attention" | "fail" {
  const statuses = items.map((item) =>
    normalizeInspectionStatus(item.status)
  );

  if (statuses.includes("fail")) {
    return "fail";
  }

  if (
    statuses.includes("attention") ||
    statuses.includes("not_checked")
  ) {
    return "attention";
  }

  return "pass";
}

function safeText(
  value: unknown,
  maxLength = 1000
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
}

export async function GET(request: NextRequest) {
  if (!verifyNexaAdminSession(request)) {
    return unauthorized();
  }

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

    const {
      data: inspections,
      error: inspectionError,
    } = await supabaseAdmin
      .from("nexa_fleet_inspections")
      .select("*")
      .eq("vehicle_code", vehicle.codigo)
      .order("inspected_at", {
        ascending: false,
      });

    if (inspectionError) {
      throw inspectionError;
    }

    const inspectionIds = (inspections || []).map(
      (inspection) => inspection.id
    );

    let items: Record<string, unknown>[] = [];

    if (inspectionIds.length > 0) {
      const {
        data: inspectionItems,
        error: itemsError,
      } = await supabaseAdmin
        .from("nexa_fleet_inspection_items")
        .select("*")
        .in("inspection_id", inspectionIds)
        .order("created_at", {
          ascending: true,
        });

      if (itemsError) {
        throw itemsError;
      }

      items = inspectionItems || [];
    }

    const output = (inspections || []).map(
      (inspection) => ({
        ...inspection,
        items: items.filter(
          (item) =>
            item.inspection_id === inspection.id
        ),
      })
    );

    return NextResponse.json({
      ok: true,
      data: output,
    });
  } catch (error) {
    console.error(
      "Fleet inspection GET error:",
      error
    );

    return jsonError(
      "Failed to load inspections.",
      500
    );
  }
}

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

    const vehicleCode = normalizeVehicleCode(
      body.vehicleCode
    );

    const vehicle = findVehicleByCodigo(vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const odometerKm = numberOrNull(
      body.odometerKm
    );

    if (
      odometerKm === null ||
      !Number.isSafeInteger(odometerKm) ||
      odometerKm < 0 ||
      odometerKm > 9999999
    ) {
      return jsonError(
        "Valid inspection kilometers are required."
      );
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

    if (
      !allowedInspectionTypes.includes(
        inspectionType
      )
    ) {
      return jsonError("Invalid inspection type.");
    }

    const inspectionItems: InspectionItemInput[] =
      Array.isArray(body.items)
        ? body.items
        : [];

    if (
      inspectionItems.length === 0 ||
      inspectionItems.length > 100
    ) {
      return jsonError(
        "Between 1 and 100 inspection items are required."
      );
    }

    const seenKeys = new Set<string>();

    for (const item of inspectionItems) {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return jsonError("Invalid inspection item.");
      }

      const itemKey = String(
        item.itemKey || ""
      ).trim();

      const itemLabel = String(
        item.itemLabel || ""
      ).trim();

      if (!itemKey || !itemLabel) {
        return jsonError(
          "Every inspection item needs a key and label."
        );
      }

      if (seenKeys.has(itemKey)) {
        return jsonError(
          `Duplicate inspection item: ${itemKey}`
        );
      }

      seenKeys.add(itemKey);

      const valueNumber = numberOrNull(
        item.valueNumber
      );

      if (
        item.valueNumber !== null &&
        item.valueNumber !== undefined &&
        item.valueNumber !== "" &&
        valueNumber === null
      ) {
        return jsonError(
          `Invalid numeric value for ${itemLabel}.`
        );
      }
    }

    const result = calculateOverallResult(
      inspectionItems
    );

    /*
      INSPECTION RESULT

      pass:
        Every submitted item passed.

      attention:
        One or more items need attention
        or were not checked.

      fail:
        At least one item failed.
    */

    const inspectionPayload = {
      vehicle_code: vehicle.codigo,
      inspection_type: inspectionType,
      odometer_km: odometerKm,
      result,

      public_summary:
        safeText(body.publicSummary, 500) ||
        "Routine safety inspection completed.",

      internal_notes:
        safeText(body.internalNotes, 5000),

      inspected_by:
        safeText(body.inspectedBy, 150) ||
        "NEXA Staff",

      inspected_at:
        new Date().toISOString(),
    };

    /*
      LOAD EXISTING STATE FIRST

      We preserve current_km.
      We also preserve a manually blocked scooter
      unless staff explicitly clears that block
      using the separate Road Ready action.
    */

    const {
      data: existingState,
      error: existingStateError,
    } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .select("*")
      .eq("vehicle_code", vehicle.codigo)
      .maybeSingle();

    if (existingStateError) {
      throw existingStateError;
    }

    const {
      data: inspection,
      error: inspectionError,
    } = await supabaseAdmin
      .from("nexa_fleet_inspections")
      .insert(inspectionPayload)
      .select("*")
      .single();

    if (inspectionError) {
      throw inspectionError;
    }

    const itemPayloads = inspectionItems.map(
      (item) => ({
        inspection_id: inspection.id,

        item_key: String(
          item.itemKey || ""
        ).trim(),

        item_label: String(
          item.itemLabel || ""
        ).trim(),

        status: normalizeInspectionStatus(
          item.status
        ),

        value_text:
          safeText(item.valueText, 500),

        value_number:
          numberOrNull(item.valueNumber),

        unit:
          safeText(item.unit, 30),

        internal_note:
          safeText(item.internalNote, 1000),
      })
    );

    const {
      data: savedItems,
      error: itemsError,
    } = await supabaseAdmin
      .from("nexa_fleet_inspection_items")
      .insert(itemPayloads)
      .select("*");

    if (itemsError) {
      throw itemsError;
    }

    /*
      ROAD READY RULES

      Failed inspection:
        Scooter becomes unavailable.

      Attention or incomplete inspection:
        Scooter is not automatically cleared
        for rental.

      Passed inspection:
        Existing road-ready setting remains
        unchanged. Staff can explicitly mark
        the scooter Road Ready separately.
    */

    const wasRoadReady =
      existingState?.road_ready === true;

    const roadReady =
      result === "pass"
        ? wasRoadReady
        : false;

    const internalStatus =
      result === "fail"
        ? "do_not_rent"
        : result === "attention"
          ? "attention_required"
          : roadReady
            ? "healthy"
            : existingState?.internal_status ||
              "attention_required";

    const publicHealthStatus = roadReady
      ? "healthy"
      : "temporarily_unavailable";

    const statePayload: Record<
      string,
      unknown
    > = {
      vehicle_code: vehicle.codigo,

      road_ready: roadReady,

      public_health_status:
        publicHealthStatus,

      internal_status:
        internalStatus,

      last_inspection_at:
        inspection.inspected_at,
    };

    /*
      IMPORTANT:

      If state already exists, preserve
      current_km exactly.

      For a new vehicle state, initialize
      current_km to zero because there is no
      previous saved odometer reading.
      This is not a service history entry.
    */

    if (!existingState) {
      statePayload.current_km = 0;
    }

    const {
      data: updatedState,
      error: stateError,
    } = await supabaseAdmin
      .from("nexa_fleet_vehicle_state")
      .upsert(statePayload, {
        onConflict: "vehicle_code",
      })
      .select("*")
      .single();

    if (stateError) {
      throw stateError;
    }

    /*
      ACTIVITY LOG

      Logging failures should not turn a
      successfully saved inspection into
      an apparent failure.
    */

    const {
      error: activityError,
    } = await supabaseAdmin
      .from("nexa_fleet_activity_log")
      .insert({
        vehicle_code: vehicle.codigo,

        action_type:
          "inspection_completed",

        entity_type:
          "inspection",

        entity_id:
          inspection.id,

        old_value:
          existingState,

        new_value: {
          inspection,
          state: updatedState,
        },

        performed_by:
          inspection.inspected_by,
      });

    if (activityError) {
      console.error(
        "Inspection activity log error:",
        activityError
      );
    }

    return NextResponse.json({
      ok: true,

      data: {
        inspection,
        items: savedItems || [],
        state: updatedState,
      },
    });
  } catch (error) {
    console.error(
      "Fleet inspection POST error:",
      error
    );

    return jsonError(
      "Failed to save inspection.",
      500
    );
  }
}
