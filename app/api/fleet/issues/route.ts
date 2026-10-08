
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";
import { verifyNexaAdminSession } from "@/lib/nexaAdminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = [
  "engine",
  "brakes",
  "tires",
  "electrical",
  "body",
  "suspension",
  "steering",
  "noise_vibration",
  "accident",
  "other",
] as const;

const ALLOWED_SEVERITIES = [
  "minor",
  "attention",
  "do_not_rent",
] as const;

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

function getVehicle(rawCode: unknown) {
  if (typeof rawCode !== "string") {
    return null;
  }

  const code = normalizeVehicleCode(rawCode);

  return code
    ? findVehicleByCodigo(code)
    : null;
}

export async function GET(request: NextRequest) {
  if (!verifyNexaAdminSession(request)) {
    return unauthorized();
  }

  try {
    const vehicle = getVehicle(
      request.nextUrl.searchParams.get("vehicleCode")
    );

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const { data, error } = await supabaseAdmin
      .from("nexa_fleet_issues")
      .select("*")
      .eq("vehicle_code", vehicle.codigo)
      .order("opened_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Fleet issues GET error:", error);

    return jsonError(
      "Failed to load vehicle issues.",
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

    const vehicle = getVehicle(body.vehicleCode);

    if (!vehicle) {
      return jsonError("Invalid vehicle code.");
    }

    const category = String(
      body.category || ""
    ).trim();

    if (
      !ALLOWED_CATEGORIES.some(
        (allowed) => allowed === category
      )
    ) {
      return jsonError("Invalid issue category.");
    }

    const severity = String(
      body.severity || ""
    ).trim();

    if (
      !ALLOWED_SEVERITIES.some(
        (allowed) => allowed === severity
      )
    ) {
      return jsonError("Invalid issue severity.");
    }

    const description = String(
      body.description || ""
    ).trim();

    if (!description) {
      return jsonError("Issue description is required.");
    }

    if (description.length > 3000) {
      return jsonError(
        "Issue description is too long."
      );
    }

    const reportedBy = String(
      body.reportedBy || "NEXA Staff"
    ).trim().slice(0, 120);

    const { data: issue, error: issueError } =
      await supabaseAdmin
        .from("nexa_fleet_issues")
        .insert({
          vehicle_code: vehicle.codigo,
          category,
          severity,
          description,
          status: "open",
          opened_at: new Date().toISOString(),
          reported_by: reportedBy || "NEXA Staff",
        })
        .select("*")
        .single();

    if (issueError) throw issueError;

    let updatedState = null;

    /*
      Critical issue:
      Immediately mark the scooter Do Not Rent.

      Non-critical issue:
      Keep the current road-ready status.
    */

    if (severity === "do_not_rent") {
      const { data: existingState, error: stateReadError } =
        await supabaseAdmin
          .from("nexa_fleet_vehicle_state")
          .select("*")
          .eq("vehicle_code", vehicle.codigo)
          .maybeSingle();

      if (stateReadError) throw stateReadError;

      const statePayload = {
        road_ready: false,
        public_health_status: "temporarily_unavailable",
        internal_status: "do_not_rent",
      };

      const query = existingState
        ? supabaseAdmin
            .from("nexa_fleet_vehicle_state")
            .update(statePayload)
            .eq("vehicle_code", vehicle.codigo)
        : supabaseAdmin
            .from("nexa_fleet_vehicle_state")
            .insert({
              vehicle_code: vehicle.codigo,
              current_km: 0,
              ...statePayload,
            });

      const { data, error: stateError } = await query
        .select("*")
        .single();

      if (stateError) throw stateError;

      updatedState = data;
    }

    const { error: auditError } = await supabaseAdmin
      .from("nexa_fleet_activity_log")
      .insert({
        vehicle_code: vehicle.codigo,
        action_type: "issue_reported",
        entity_type: "issue",
        entity_id: issue.id,
        new_value: {
          issue,
          state: updatedState,
        },
        performed_by: issue.reported_by,
      });

    if (auditError) {
      console.error(
        "Fleet issue activity log error:",
        auditError
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        issue,
        state: updatedState,
      },
    });
  } catch (error) {
    console.error("Fleet issues POST error:", error);

    return jsonError(
      "Failed to report issue.",
      500
    );
  }
}
