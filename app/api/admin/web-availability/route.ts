import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  findVehicleByCodigo,
  getFleetByGroup,
  normalizeVehicleCode,
  normalizeVehicleText,
} from "@/lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "nexa_admin_session";
const TABLE = "web_availability_blocks";
const MAX_ROWS = 500;

type BlockType = "fleet_group" | "vehicle";

type CreateBlockBody = {
  blockType?: string;
  fleetGroup?: string;
  vehicleCode?: string;
  quantity?: number | string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  note?: string;
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function isAuthorized(request: NextRequest) {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value === "active";
}

function unauthorized() {
  return NextResponse.json(
    {
      ok: false,
      error: "Admin authentication required.",
    },
    { status: 401 }
  );
}

function badRequest(message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status: 400 }
  );
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function makeDateTime(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function normalizeBlockType(value: unknown): BlockType | null {
  const clean = cleanText(value);

  if (clean === "fleet_group" || clean === "vehicle") {
    return clean;
  }

  return null;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .order("start_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(MAX_ROWS);

    if (error) {
      console.error("WEB AVAILABILITY GET ERROR:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          blocks: [],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      blocks: data || [],
    });
  } catch (error: any) {
    console.error("WEB AVAILABILITY GET FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load web availability blocks.",
        blocks: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  try {
    const body = (await request.json().catch(() => null)) as CreateBlockBody | null;

    if (!body) {
      return badRequest("Missing availability details.");
    }

    const blockType = normalizeBlockType(body.blockType);
    const requestedFleetGroup = normalizeVehicleText(body.fleetGroup);
    const requestedVehicleCode = normalizeVehicleCode(body.vehicleCode);
    const startDate = cleanText(body.startDate);
    const startTime = cleanText(body.startTime);
    const endDate = cleanText(body.endDate);
    const endTime = cleanText(body.endTime);
    const note = cleanText(body.note).slice(0, 300);

    if (!blockType) {
      return badRequest("Select whether to block a vehicle type or a specific vehicle.");
    }

    if (
      !validDate(startDate) ||
      !validDate(endDate) ||
      !validTime(startTime) ||
      !validTime(endTime)
    ) {
      return badRequest("Select a valid start and end date/time.");
    }

    const start = makeDateTime(startDate, startTime);
    const end = makeDateTime(endDate, endTime);

    if (!start || !end || end <= start) {
      return badRequest("The end date/time must be after the start date/time.");
    }

    let fleetGroup = requestedFleetGroup;
    let vehicleCode: string | null = null;
    let quantity = Math.floor(Number(body.quantity || 1));

    if (blockType === "vehicle") {
      const vehicle = findVehicleByCodigo(requestedVehicleCode);

      if (!vehicle) {
        return badRequest("The selected vehicle does not exist in the current fleet.");
      }

      fleetGroup = vehicle.fleetGroup;
      vehicleCode = vehicle.codigo;
      quantity = 1;
    } else {
      const fleet = getFleetByGroup(fleetGroup);

      if (!fleet.length) {
        return badRequest("Select a valid vehicle type.");
      }

      if (!Number.isFinite(quantity) || quantity < 1 || quantity > fleet.length) {
        return badRequest(`Quantity must be between 1 and ${fleet.length}.`);
      }
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        block_type: blockType,
        fleet_group: fleetGroup,
        vehicle_code: vehicleCode,
        quantity,
        start_date: startDate,
        start_time: startTime,
        end_date: endDate,
        end_time: endTime,
        note,
      })
      .select("*")
      .single();

    if (error) {
      console.error("WEB AVAILABILITY POST ERROR:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      block: data,
      message: "Web availability block created.",
    });
  } catch (error: any) {
    console.error("WEB AVAILABILITY POST FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to create web availability block.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  try {
    const id = cleanText(new URL(request.url).searchParams.get("id"));

    if (!id) {
      return badRequest("Missing availability block ID.");
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("WEB AVAILABILITY DELETE ERROR:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Web availability block removed.",
    });
  } catch (error: any) {
    console.error("WEB AVAILABILITY DELETE FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to remove web availability block.",
      },
      { status: 500 }
    );
  }
}