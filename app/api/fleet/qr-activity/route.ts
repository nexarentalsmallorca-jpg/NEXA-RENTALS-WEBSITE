import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizeVehicleCode } from "@/lib/nexaFleet";

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

export async function GET(request: NextRequest) {
  try {
    const vehicleCode = normalizeVehicleCode(
      request.nextUrl.searchParams.get("vehicleCode")
    );

    let query = supabaseAdmin
      .from("nexa_fleet_qr_scans")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(200);

    if (vehicleCode) {
      query = query.eq("vehicle_code", vehicleCode);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    console.error("QR activity GET error:", error);

    return jsonError(
      error instanceof Error
        ? error.message
        : "Failed to load QR activity.",
      500
    );
  }
}