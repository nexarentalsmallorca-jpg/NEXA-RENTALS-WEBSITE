
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

type MaintenanceRecord = {
  id?: string;
  vehicle_code: string;
  maintenance_type: string;
  performed_km: number | null;
  performed_at: string | null;
  next_due_km: number | null;
  next_due_at?: string | null;
};

type InspectionItem = {
  item_key: string;
  status: string;
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

function getLatestByType(
  records: MaintenanceRecord[],
  maintenanceType: string
): MaintenanceRecord | null {
  return (
    records.find(
      (record) => record.maintenance_type === maintenanceType
    ) || null
  );
}

function getLatestRoutineService(
  records: MaintenanceRecord[]
): MaintenanceRecord | null {
  return (
    records.find(
      (record) =>
        record.maintenance_type === "engine_oil" ||
        record.maintenance_type === "general_service"
    ) || null
  );
}

function getRemainingKm(
  nextDueKm: number | null,
  currentKm: number
): number | null {
  if (nextDueKm === null) {
    return null;
  }

  return nextDueKm - currentKm;
}

function checkInspectionGroup(
  items: InspectionItem[],
  keys: string[]
): boolean {
  return keys.every((key) =>
    items.some(
      (item) =>
        item.item_key === key &&
        item.status === "pass"
    )
  );
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

    const [
      stateResult,
      inspectionResult,
      maintenanceResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("nexa_fleet_vehicle_state")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .maybeSingle(),

      supabaseAdmin
        .from("nexa_fleet_inspections")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("inspected_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),

      supabaseAdmin
        .from("nexa_fleet_maintenance_records")
        .select("*")
        .eq("vehicle_code", vehicle.codigo)
        .order("performed_at", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (stateResult.error) {
      throw stateResult.error;
    }

    if (inspectionResult.error) {
      throw inspectionResult.error;
    }

    if (maintenanceResult.error) {
      throw maintenanceResult.error;
    }

    const state = stateResult.data;
    const latestInspection = inspectionResult.data;

    const maintenanceRows =
      (maintenanceResult.data || []) as MaintenanceRecord[];

    let inspectionItems: InspectionItem[] = [];

    if (latestInspection?.id) {
      const { data, error } = await supabaseAdmin
        .from("nexa_fleet_inspection_items")
        .select("item_key,status")
        .eq("inspection_id", latestInspection.id);

      if (error) {
        throw error;
      }

      inspectionItems = (data || []) as InspectionItem[];
    }

    /*
      SERVICE HISTORY

      The last service is selected from actual
      maintenance records.

      Current odometer KM is NEVER used as the
      last service KM.

      Next service KM comes from the SAME record.
    */

    const latestService =
      getLatestRoutineService(maintenanceRows);

    const latestOil =
      getLatestByType(maintenanceRows, "engine_oil");

    const latestGeneral =
      getLatestByType(maintenanceRows, "general_service");

    const latestBelt =
      getLatestByType(maintenanceRows, "cvt_belt");

    const latestOilFilter =
      getLatestByType(maintenanceRows, "oil_filter");

    const latestAirFilter =
      getLatestByType(maintenanceRows, "air_filter");

    const latestWeights =
      getLatestByType(maintenanceRows, "variator_weights");

    const latestSparkPlug =
      getLatestByType(maintenanceRows, "spark_plug");

    const latestInjectorCleaner =
      getLatestByType(maintenanceRows, "injector_cleaner");

    const currentKm =
      numberOrNull(state?.current_km) ?? 0;

    const lastServiceAt =
      latestService?.performed_at ?? null;

    const lastServiceKm =
      numberOrNull(latestService?.performed_km);

    const nextServiceKm =
      numberOrNull(latestService?.next_due_km);

    const kmRemaining =
      getRemainingKm(nextServiceKm, currentKm);

    /*
      BELT MAINTENANCE

      Belt replacement has its own independent
      history and next replacement target.

      Default interval is handled by the
      maintenance POST API (10,000 KM).

      We do not invent a completed belt
      replacement when no record exists.
    */

    const lastBeltAt =
      latestBelt?.performed_at ?? null;

    const lastBeltKm =
      numberOrNull(latestBelt?.performed_km);

    const nextBeltKm =
      numberOrNull(latestBelt?.next_due_km);

    const beltKmRemaining =
      getRemainingKm(nextBeltKm, currentKm);

    /*
      INSPECTION CHECKS

      Only show a category as checked when
      all required checks actually passed.
    */

    const publicChecks = {
      brakes: checkInspectionGroup(
        inspectionItems,
        ["front_brake", "rear_brake"]
      ),

      tires: checkInspectionGroup(
        inspectionItems,
        ["front_tire", "rear_tire"]
      ),

      lights: checkInspectionGroup(
        inspectionItems,
        ["headlight", "brake_light", "indicators"]
      ),

      controls: checkInspectionGroup(
        inspectionItems,
        ["horn", "mirrors", "steering"]
      ),
    };

    /*
      PUBLIC VEHICLE HEALTH

      Respect the saved road-ready status.
      Missing state must not be treated as
      proof that the scooter is healthy.
    */

    const roadReady =
      state?.road_ready === true;

    const publicStatus = roadReady
      ? "healthy"
      : "temporarily_unavailable";

    const headline = roadReady
      ? "Healthy"
      : "Temporarily unavailable";

    const roadReadyLabel = roadReady
      ? "Road Ready"
      : "Currently unavailable";

    /*
      ANONYMOUS QR SESSION
    */

    const existingSession = request.cookies.get(
      "nexa_fleet_public_session"
    )?.value;

    const sessionId =
      existingSession || randomUUID();

    /*
      Scan logging should not prevent a customer
      from seeing the vehicle health page.
    */

    try {
      const { error: scanError } = await supabaseAdmin
        .from("nexa_fleet_qr_scans")
        .insert({
          vehicle_code: vehicle.codigo,
          viewer_type: "public",
          session_id: sessionId,
          user_agent:
            request.headers.get("user-agent") || null,
          referrer:
            request.headers.get("referer") || null,
        });

      if (scanError) {
        console.error(
          "Public QR scan logging error:",
          scanError
        );
      }
    } catch (scanError) {
      console.error(
        "Public QR scan logging failed:",
        scanError
      );
    }

    /*
      PUBLIC RESPONSE

      Existing response properties are preserved
      for compatibility with the customer page.

      Additional belt and component information
      is included for future display.
    */

    const response = NextResponse.json({
      ok: true,

      data: {
        vehicle: {
          code: vehicle.codigo,
          registration: vehicle.matricula,
          make: vehicle.marca,
          model: vehicle.modelo,
          publicName: `${vehicle.marca} ${vehicle.modelo}`,
          imageUrl: getQrDisplayImage(
            vehicle.fleetGroup
          ),
        },

        health: {
          roadReady,
          publicStatus,
          headline,
          roadReadyLabel,
        },

        mileage: {
          currentKm,
        },

        inspection: latestInspection
          ? {
              inspectedAt:
                latestInspection.inspected_at,

              result:
                latestInspection.result,

              summary:
                latestInspection.public_summary ||
                "Routine safety inspection completed.",

              checks: publicChecks,
            }
          : null,

        routineService: {
          lastServiceAt,
          lastServiceKm,
          nextServiceKm,
          kmRemaining,
          monitored: latestService !== null,
        },

        beltService: {
          lastBeltAt,
          lastBeltKm,
          nextBeltKm,
          kmRemaining: beltKmRemaining,
          defaultIntervalKm: 10000,
          monitored: latestBelt !== null,
        },

        componentMaintenance: {
          engineOil: {
            lastKm:
              numberOrNull(latestOil?.performed_km),
            lastDate:
              latestOil?.performed_at ?? null,
            nextKm:
              numberOrNull(latestOil?.next_due_km),
          },

          oilFilter: {
            lastKm:
              numberOrNull(latestOilFilter?.performed_km),
            lastDate:
              latestOilFilter?.performed_at ?? null,
            nextKm:
              numberOrNull(latestOilFilter?.next_due_km),
          },

          airFilter: {
            lastKm:
              numberOrNull(latestAirFilter?.performed_km),
            lastDate:
              latestAirFilter?.performed_at ?? null,
            nextKm:
              numberOrNull(latestAirFilter?.next_due_km),
          },

          injectorCleaner: {
            lastKm:
              numberOrNull(latestInjectorCleaner?.performed_km),
            lastDate:
              latestInjectorCleaner?.performed_at ?? null,
            nextKm:
              numberOrNull(latestInjectorCleaner?.next_due_km),
          },

          cvtBelt: {
            lastKm: lastBeltKm,
            lastDate: lastBeltAt,
            nextKm: nextBeltKm,
          },

          variatorWeights: {
            lastKm:
              numberOrNull(latestWeights?.performed_km),
            lastDate:
              latestWeights?.performed_at ?? null,
            nextKm:
              numberOrNull(latestWeights?.next_due_km),
          },

          sparkPlug: {
            lastKm:
              numberOrNull(latestSparkPlug?.performed_km),
            lastDate:
              latestSparkPlug?.performed_at ?? null,
            nextKm:
              numberOrNull(latestSparkPlug?.next_due_km),
          },

          generalService: {
            lastKm:
              numberOrNull(latestGeneral?.performed_km),
            lastDate:
              latestGeneral?.performed_at ?? null,
            nextKm:
              numberOrNull(latestGeneral?.next_due_km),
          },
        },
      },
    });

    if (!existingSession) {
      response.cookies.set(
        "nexa_fleet_public_session",
        sessionId,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        }
      );
    }

    return response;
  } catch (error) {
    console.error("Public fleet GET error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to load vehicle status.",
      500
    );
  }
}
