import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
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
    { status }
  );
}

function getQrDisplayImage(fleetGroup: string) {
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

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { code } = await context.params;

    const vehicleCode = normalizeVehicleCode(code);
    const vehicle = findVehicleByCodigo(vehicleCode);

    if (!vehicle) {
      return jsonError("Vehicle not found.", 404);
    }

    const { data: state, error: stateError } =
      await supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .maybeSingle();

    if (stateError) throw stateError;

    const { data: latestInspection, error: inspectionError } =
      await supabaseAdmin
        .from("nexa_fleet_inspections")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("inspected_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (inspectionError) throw inspectionError;

    let inspectionItems: any[] = [];

    if (latestInspection?.id) {
      const { data, error } =
        await supabaseAdmin
          .from("nexa_fleet_inspection_items")
          .select("*")
          .eq(
            "inspection_id",
            latestInspection.id
          )
          .order("created_at", {
            ascending: true,
          });

      if (error) throw error;

      inspectionItems = data || [];
    }

    const {
      data: maintenanceRows,
      error: maintenanceError,
    } = await supabaseAdmin
      .from("nexa_fleet_maintenance_records")
      .select("*")
      .eq("vehicle_code", vehicle.codigo)
      .order("performed_at", {
        ascending: false,
      });

    if (maintenanceError) {
      throw maintenanceError;
    }

    const maintenanceByType =
      new Map<string, any>();

    for (const row of maintenanceRows || []) {
      if (
        !maintenanceByType.has(
          row.maintenance_type
        )
      ) {
        maintenanceByType.set(
          row.maintenance_type,
          row
        );
      }
    }

    const latestOil =
      maintenanceByType.get("engine_oil") ||
      null;

    const latestGeneral =
      maintenanceByType.get(
        "general_service"
      ) || null;

    let mostRecentService: any = null;

    if (
      latestOil?.performed_at &&
      latestGeneral?.performed_at
    ) {
      mostRecentService =
        new Date(
          latestOil.performed_at
        ).getTime() >
        new Date(
          latestGeneral.performed_at
        ).getTime()
          ? latestOil
          : latestGeneral;
    } else {
      mostRecentService =
        latestGeneral ||
        latestOil ||
        null;
    }

    const publicChecks = {
      brakes: inspectionItems.some(
        (item) =>
          String(
            item.item_key || ""
          ).includes("brake") &&
          item.status === "pass"
      ),

      tires: inspectionItems.some(
        (item) =>
          String(
            item.item_key || ""
          ).includes("tire") &&
          item.status === "pass"
      ),

      lights: inspectionItems.some(
        (item) =>
          (
            String(
              item.item_key || ""
            ).includes("light") ||
            String(
              item.item_key || ""
            ).includes("indicator")
          ) &&
          item.status === "pass"
      ),

      controls: inspectionItems.some(
        (item) =>
          (
            String(
              item.item_key || ""
            ).includes("horn") ||
            String(
              item.item_key || ""
            ).includes("steering") ||
            String(
              item.item_key || ""
            ).includes("mirror")
          ) &&
          item.status === "pass"
      ),
    };

    const currentKm = Number(
      state?.current_km || 0
    );

    const nextServiceKm =
      latestOil?.next_due_km !==
        null &&
      latestOil?.next_due_km !==
        undefined
        ? Number(
            latestOil.next_due_km
          )
        : null;

    const kmRemaining =
      nextServiceKm !== null
        ? nextServiceKm - currentKm
        : null;

    // -----------------------------------------------------
    // Anonymous QR/customer session
    // -----------------------------------------------------

    const existingSession =
      request.cookies.get(
        "nexa_fleet_public_session"
      )?.value;

    const sessionId =
      existingSession || randomUUID();

    // Record this public vehicle-page opening.
    //
    // We deliberately do NOT store customer names,
    // phone numbers or IP addresses here.
    await supabaseAdmin
      .from("nexa_fleet_qr_scans")
      .insert({
        vehicle_code:
          vehicle.codigo,

        viewer_type: "public",

        session_id: sessionId,

        user_agent:
          request.headers.get(
            "user-agent"
          ) || null,

        referrer:
          request.headers.get(
            "referer"
          ) || null,
      });

    const response =
      NextResponse.json({
        ok: true,

        data: {
          vehicle: {
            code:
              vehicle.codigo,

            registration:
              vehicle.matricula,

            make:
              vehicle.marca,

            model:
              vehicle.modelo,

            publicName: `${vehicle.marca} ${vehicle.modelo}`,

            imageUrl:
              getQrDisplayImage(
                vehicle.fleetGroup
              ),
          },

          health: {
            roadReady:
              state?.road_ready ??
              true,

            publicStatus:
              state?.public_health_status ||
              "healthy",

            headline:
              state?.road_ready ===
              false
                ? "Temporarily unavailable"
                : "Healthy",

            roadReadyLabel:
              state?.road_ready ===
              false
                ? "Currently unavailable"
                : "Road Ready",
          },

          mileage: {
            currentKm,
          },

          inspection:
            latestInspection
              ? {
                  inspectedAt:
                    latestInspection.inspected_at,

                  result:
                    latestInspection.result,

                  summary:
                    latestInspection.public_summary ||
                    "Routine safety inspection completed.",

                  checks:
                    publicChecks,
                }
              : null,

          routineService: {
            lastServiceAt:
              mostRecentService?.performed_at ||
              null,

            lastServiceKm:
              mostRecentService?.performed_km ??
              null,

            nextServiceKm,

            kmRemaining,

            monitored: true,
          },
        },
      });

    // Anonymous cookie so repeat activity can
    // be grouped without knowing customer identity.
    if (!existingSession) {
      response.cookies.set(
        "nexa_fleet_public_session",
        sessionId,
        {
          httpOnly: true,
          secure:
            process.env.NODE_ENV ===
            "production",
          sameSite: "lax",
          path: "/",
          maxAge:
            60 * 60 * 24 * 365,
        }
      );
    }

    return response;
  } catch (error) {
    console.error(
      "Public fleet GET error:",
      error
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to load vehicle status.",
      500
    );
  }
}