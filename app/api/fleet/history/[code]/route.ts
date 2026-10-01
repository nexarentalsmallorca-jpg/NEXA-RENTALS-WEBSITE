import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    {
      status,
    }
  );
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { code } = await context.params;

    const vehicleCode =
      normalizeVehicleCode(code);

    const vehicle =
      findVehicleByCodigo(vehicleCode);

    if (!vehicle) {
      return jsonError(
        "Vehicle not found.",
        404
      );
    }

    const [
      stateResult,
      maintenanceResult,
      inspectionsResult,
      issuesResult,
      activityResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .select("*")
        .eq(
          "vehicle_code",
          vehicle.codigo
        )
        .maybeSingle(),

      supabaseAdmin
        .from(
          "nexa_fleet_maintenance_records"
        )
        .select("*")
        .eq(
          "vehicle_code",
          vehicle.codigo
        )
        .order("performed_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from(
          "nexa_fleet_inspections"
        )
        .select("*")
        .eq(
          "vehicle_code",
          vehicle.codigo
        )
        .order("inspected_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("nexa_fleet_issues")
        .select("*")
        .eq(
          "vehicle_code",
          vehicle.codigo
        )
        .order("opened_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from(
          "nexa_fleet_activity_log"
        )
        .select("*")
        .eq(
          "vehicle_code",
          vehicle.codigo
        )
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (stateResult.error) {
      throw stateResult.error;
    }

    if (maintenanceResult.error) {
      throw maintenanceResult.error;
    }

    if (inspectionsResult.error) {
      throw inspectionsResult.error;
    }

    if (issuesResult.error) {
      throw issuesResult.error;
    }

    if (activityResult.error) {
      throw activityResult.error;
    }

    const inspectionIds =
      (
        inspectionsResult.data || []
      ).map((item) => item.id);

    let inspectionItems: any[] = [];

    if (inspectionIds.length > 0) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "nexa_fleet_inspection_items"
        )
        .select("*")
        .in(
          "inspection_id",
          inspectionIds
        )
        .order("created_at", {
          ascending: true,
        });

      if (error) throw error;

      inspectionItems = data || [];
    }

    const inspections =
      (
        inspectionsResult.data || []
      ).map((inspection) => ({
        ...inspection,

        items:
          inspectionItems.filter(
            (item) =>
              item.inspection_id ===
              inspection.id
          ),
      }));

    const timeline: Array<{
      id: string;
      type:
        | "maintenance"
        | "inspection"
        | "issue"
        | "activity";
      title: string;
      date: string;
      km?: number | null;
      details?: string | null;
      raw: any;
    }> = [];

    for (
      const item of
      maintenanceResult.data || []
    ) {
      timeline.push({
        id: `maintenance-${item.id}`,
        type: "maintenance",
        title:
          item.maintenance_type,
        date:
          item.performed_at ||
          item.created_at,
        km:
          item.performed_km ?? null,
        details:
          item.notes || null,
        raw: item,
      });
    }

    for (
      const inspection of inspections
    ) {
      timeline.push({
        id: `inspection-${inspection.id}`,
        type: "inspection",
        title: `Technical inspection - ${inspection.result}`,
        date:
          inspection.inspected_at ||
          inspection.created_at,
        km:
          inspection.odometer_km ??
          null,
        details:
          inspection.internal_notes ||
          inspection.public_summary ||
          null,
        raw: inspection,
      });
    }

    for (
      const issue of
      issuesResult.data || []
    ) {
      timeline.push({
        id: `issue-${issue.id}`,
        type: "issue",
        title: `${issue.category} issue`,
        date:
          issue.opened_at ||
          issue.created_at,
        details:
          issue.description || null,
        raw: issue,
      });
    }

    for (
      const activity of
      activityResult.data || []
    ) {
      timeline.push({
        id: `activity-${activity.id}`,
        type: "activity",
        title:
          activity.action_type ||
          "Activity",
        date:
          activity.created_at,
        details: null,
        raw: activity,
      });
    }

    timeline.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );

    return NextResponse.json({
      ok: true,
      data: {
        vehicle,
        state:
          stateResult.data || null,
        maintenance:
          maintenanceResult.data || [],
        inspections,
        issues:
          issuesResult.data || [],
        activity:
          activityResult.data || [],
        timeline,
      },
    });
  } catch (error) {
    console.error(
      "Fleet history GET error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to load vehicle history.",
      500
    );
  }
}