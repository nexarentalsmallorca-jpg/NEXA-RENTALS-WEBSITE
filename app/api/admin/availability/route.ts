import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  nexaFleet,
  normalizeVehicleText,
  findVehicleByCodigo,
  extractVehicleCodeFromText,
  resolveFleetGroupFromWebsiteVehicle,
  vehicleDisplayName,
  vehicleShortName,
  type NexaVehicle,
} from "@/lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NexaFleetGroup =
  | "piaggio_liberty_125"
  | "kymco_sky_town_125"
  | "sym_symphony_125"
  | "e_bike"
  | "scooter";

type BookingRow = {
  id?: string | number;
  status?: string | null;
  source?: string | null;

  pickup_date?: string | null;
  pickup_time?: string | null;
  dropoff_date?: string | null;
  dropoff_time?: string | null;

  from?: string | null;
  to?: string | null;

  vehicle_code?: string | null;
  assigned_vehicle_code?: string | null;
  scooter_code?: string | null;

  vehicle_name?: string | null;
  vehicle_id?: string | null;
  fleet_group?: string | null;
  quantity?: number | string | null;

  vehicle?: {
    codigo?: string | null;
    code?: string | null;
    matricula?: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;
};

type WebAvailabilityBlockRow = {
  id: string;
  block_type: "fleet_group" | "vehicle";
  fleet_group: string;
  vehicle_code?: string | null;
  quantity: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  note?: string | null;
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;
const WEB_AVAILABILITY_TABLE = "web_availability_blocks";

const BLOCKING_STATUSES = [
  "confirmed",
  "paid",
  "active",
  "pending",
  "reserved",
  "manual",
  "online",
  "contract_generated",
  "contract generated",
  "payment_pending",
  "payment pending",
  "deposit_paid",
  "deposit paid",
  "rented_out",
  "rented out",
  "reserve_now",
  "rent_now",
];

const NON_BLOCKING_STATUSES = [
  "cancelled",
  "canceled",
  "rejected",
  "refunded",
  "expired",
  "failed",
  "completed",
  "finished",
  "closed",
  "deleted",
  "returned",
  "finalizada",
];

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

function safeNormalizeText(value: unknown) {
  return normalizeVehicleText(String(value || ""));
}

function normalizeVehicleCode(value?: string | number | null) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function getScooterFleet() {
  return nexaFleet.filter((vehicle) => vehicle.tipo === "Scooter 125cc");
}

function getPiaggioFleet() {
  return getScooterFleet().filter(
    (vehicle) => vehicle.fleetGroup === "piaggio_liberty_125"
  );
}

function getKymcoFleet() {
  return getScooterFleet().filter(
    (vehicle) => vehicle.fleetGroup === "kymco_sky_town_125"
  );
}

function getSymFleet() {
  return getScooterFleet().filter(
    (vehicle) => vehicle.fleetGroup === "sym_symphony_125"
  );
}

function getEBikeFleet() {
  return nexaFleet.filter((vehicle) => vehicle.tipo === "E-Bike");
}

function getFleetGroupDisplayName(fleetGroup: NexaFleetGroup) {
  if (fleetGroup === "piaggio_liberty_125") {
    return "Piaggio Liberty 125";
  }

  if (fleetGroup === "kymco_sky_town_125") {
    return "KYMCO Sky Town 125";
  }

  if (fleetGroup === "sym_symphony_125") {
    return "SYM Symphony 125";
  }

  if (fleetGroup === "e_bike") {
    return "E-Bike";
  }

  return "Scooter";
}

function getFleetByGroup(fleetGroup: NexaFleetGroup) {
  if (fleetGroup === "piaggio_liberty_125") {
    return getPiaggioFleet();
  }

  if (fleetGroup === "kymco_sky_town_125") {
    return getKymcoFleet();
  }

  if (fleetGroup === "sym_symphony_125") {
    return getSymFleet();
  }

  if (fleetGroup === "e_bike") {
    return getEBikeFleet();
  }

  return getScooterFleet();
}

function resolveFleetGroupKeyFromWebsiteVehicle({
  vehicleId,
  vehicleName,
  fleetGroup,
}: {
  vehicleId?: string | null;
  vehicleName?: string | null;
  fleetGroup?: string | null;
}): NexaFleetGroup {
  const cleanFleetGroup = safeNormalizeText(fleetGroup);
  const cleanId = safeNormalizeText(vehicleId);
  const cleanName = safeNormalizeText(vehicleName);

  if (cleanFleetGroup === "piaggio_liberty_125") {
    return "piaggio_liberty_125";
  }

  if (cleanFleetGroup === "kymco_sky_town_125") {
    return "kymco_sky_town_125";
  }

  if (cleanFleetGroup === "sym_symphony_125") {
    return "sym_symphony_125";
  }

  if (cleanFleetGroup === "e_bike") {
    return "e_bike";
  }

  if (cleanFleetGroup === "scooter") {
    return "scooter";
  }

  const exactCode =
    extractVehicleCodeFromText(String(vehicleId || "")) ||
    extractVehicleCodeFromText(String(vehicleName || ""));

  const exactVehicle = findVehicleByCodigo(exactCode);

  if (exactVehicle?.fleetGroup === "piaggio_liberty_125") {
    return "piaggio_liberty_125";
  }

  if (exactVehicle?.fleetGroup === "kymco_sky_town_125") {
    return "kymco_sky_town_125";
  }

  if (exactVehicle?.fleetGroup === "sym_symphony_125") {
    return "sym_symphony_125";
  }

  if (exactVehicle?.tipo === "E-Bike") {
    return "e_bike";
  }

  const isKymco =
    cleanId === "s4" ||
    cleanId === "kymco-sky-town-125" ||
    cleanId.includes("kymco") ||
    cleanId.includes("sky-town") ||
    cleanName.includes("kymco") ||
    cleanName.includes("sky town") ||
    cleanName.includes("sky-town") ||
    cleanName.includes("skytown");

  if (isKymco) {
    return "kymco_sky_town_125";
  }

  const isSym =
    cleanId === "s3" ||
    cleanId === "sym-symphony-125" ||
    cleanName.includes("sym") ||
    cleanName.includes("symphony");

  if (isSym) {
    return "sym_symphony_125";
  }

  const isPiaggio =
    cleanId === "s2" ||
    cleanId === "piaggio-liberty-125" ||
    cleanName.includes("piaggio") ||
    cleanName.includes("liberty");

  if (isPiaggio) {
    return "piaggio_liberty_125";
  }

  const isEBike =
    cleanId.startsWith("e") ||
    cleanName.includes("e-bike") ||
    cleanName.includes("ebike") ||
    cleanName.includes("electric bike") ||
    cleanName.includes("engwe") ||
    cleanName.includes("p275");

  if (isEBike) {
    return "e_bike";
  }

  return "scooter";
}

function makeDateTime(date?: string | null, time?: string | null) {
  if (!date) return null;

  const safeTime = String(time || "00:00").slice(0, 5);
  const value = new Date(`${date}T${safeTime}:00`);

  if (Number.isNaN(value.getTime())) return null;

  return value;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function rangesOverlapSelection({
  blockedStart,
  blockedEnd,
  requestedStart,
  requestedEnd,
}: {
  blockedStart: Date;
  blockedEnd: Date;
  requestedStart: Date;
  requestedEnd: Date;
}) {
  const blockedBufferedEnd = addMinutes(
    blockedEnd,
    BUFFER_MINUTES_AFTER_BOOKING
  );
  const requestedBufferedEnd = addMinutes(
    requestedEnd,
    BUFFER_MINUTES_AFTER_BOOKING
  );

  return blockedStart < requestedBufferedEnd && blockedBufferedEnd > requestedStart;
}

function getBookingVehicleCode(booking: BookingRow) {
  return normalizeVehicleCode(
    booking.assigned_vehicle_code ||
      booking.vehicle_code ||
      booking.scooter_code ||
      booking.vehicle?.codigo ||
      booking.vehicle?.code ||
      extractVehicleCodeFromText(String(booking.vehicle_name || ""))
  );
}

function bookingShouldBlock(status?: string | null) {
  const cleanStatus = safeNormalizeText(status);

  if (!cleanStatus) return true;
  if (NON_BLOCKING_STATUSES.includes(cleanStatus)) return false;
  if (BLOCKING_STATUSES.includes(cleanStatus)) return true;

  return true;
}

function bookingOverlapsSelection({
  booking,
  requestedStart,
  requestedEnd,
}: {
  booking: BookingRow;
  requestedStart: Date;
  requestedEnd: Date;
}) {
  const bookingStart = makeDateTime(
    booking.pickup_date || booking.from,
    booking.pickup_time || "00:00"
  );

  const bookingEnd = makeDateTime(
    booking.dropoff_date || booking.to,
    booking.dropoff_time || "23:59"
  );

  if (!bookingStart || !bookingEnd) return false;

  return rangesOverlapSelection({
    blockedStart: bookingStart,
    blockedEnd: bookingEnd,
    requestedStart,
    requestedEnd,
  });
}

function bookingBelongsToFleetGroup({
  booking,
  fleetGroup,
  fleetCodes,
}: {
  booking: BookingRow;
  fleetGroup: NexaFleetGroup;
  fleetCodes: string[];
}) {
  const code = getBookingVehicleCode(booking);

  if (code && fleetCodes.includes(code)) {
    return true;
  }

  const bookingFleetGroupFromColumn = safeNormalizeText(booking.fleet_group);

  if (bookingFleetGroupFromColumn === fleetGroup) {
    return true;
  }

  const resolved = resolveFleetGroupFromWebsiteVehicle({
    vehicleId: booking.vehicle_id || code || "",
    vehicleName: [
      booking.vehicle_name,
      booking.vehicle?.marca,
      booking.vehicle?.modelo,
      booking.vehicle?.codigo,
      booking.vehicle?.code,
    ]
      .filter(Boolean)
      .join(" "),
  });

  const resolvedKey = resolveFleetGroupKeyFromWebsiteVehicle({
    vehicleId: booking.vehicle_id || code || "",
    vehicleName: resolved.group || booking.vehicle_name || "",
  });

  return resolvedKey === fleetGroup;
}

function blockOverlapsSelection({
  block,
  requestedStart,
  requestedEnd,
}: {
  block: WebAvailabilityBlockRow;
  requestedStart: Date;
  requestedEnd: Date;
}) {
  const blockStart = makeDateTime(block.start_date, block.start_time);
  const blockEnd = makeDateTime(block.end_date, block.end_time);

  if (!blockStart || !blockEnd) return false;

  return rangesOverlapSelection({
    blockedStart: blockStart,
    blockedEnd: blockEnd,
    requestedStart,
    requestedEnd,
  });
}

function fleetGroupBlockApplies(
  blockFleetGroup: string,
  requestedFleetGroup: NexaFleetGroup
) {
  const cleanBlockGroup = safeNormalizeText(blockFleetGroup);

  if (cleanBlockGroup === requestedFleetGroup) return true;

  if (requestedFleetGroup === "scooter") {
    return [
      "piaggio_liberty_125",
      "kymco_sky_town_125",
      "sym_symphony_125",
      "scooter",
    ].includes(cleanBlockGroup);
  }

  return cleanBlockGroup === "scooter";
}

function getAvailabilityMessage({
  available,
  availableCount,
  fleetGroup,
}: {
  available: boolean;
  availableCount: number;
  fleetGroup: NexaFleetGroup;
}) {
  const vehicleName = getFleetGroupDisplayName(fleetGroup);

  if (!available) {
    return "This vehicle is not available for the selected date/time. Please change the dates or choose another vehicle.";
  }

  if (fleetGroup === "piaggio_liberty_125") {
    return `${availableCount} ${vehicleName} scooter${
      availableCount === 1 ? "" : "s"
    } available for these dates.`;
  }

  if (
    fleetGroup === "kymco_sky_town_125" ||
    fleetGroup === "sym_symphony_125"
  ) {
    return `${vehicleName} is available for these dates.`;
  }

  return `${availableCount} vehicle${
    availableCount === 1 ? "" : "s"
  } available for these dates.`;
}

function createBadRequest(message: string) {
  return NextResponse.json(
    {
      ok: false,
      available: false,
      message,
    },
    { status: 400 }
  );
}

async function loadBookings() {
  const supabaseAdmin = getSupabaseAdmin();

  const fullSelect = `
    id,
    status,
    source,
    pickup_date,
    pickup_time,
    dropoff_date,
    dropoff_time,
    from,
    to,
    vehicle_code,
    assigned_vehicle_code,
    scooter_code,
    vehicle_name,
    vehicle_id,
    fleet_group,
    quantity,
    vehicle:vehicles (
      codigo,
      code,
      matricula,
      marca,
      modelo
    )
  `;

  const mediumSelect = `
    id,
    status,
    source,
    pickup_date,
    pickup_time,
    dropoff_date,
    dropoff_time,
    from,
    to,
    vehicle_code,
    vehicle_name,
    assigned_vehicle_code,
    fleet_group,
    quantity
  `;

  const oldSelect = `
    id,
    status,
    pickup_date,
    pickup_time,
    dropoff_date,
    dropoff_time,
    vehicle_name,
    assigned_vehicle_code,
    fleet_group,
    quantity
  `;

  const firstTry = await supabaseAdmin
    .from("bookings")
    .select(fullSelect)
    .limit(2000);

  if (!firstTry.error) {
    return {
      data: firstTry.data || [],
      error: null,
      mode: "full",
    };
  }

  console.warn(
    "⚠️ Availability full select failed, trying medium select:",
    firstTry.error?.message || firstTry.error
  );

  const secondTry = await supabaseAdmin
    .from("bookings")
    .select(mediumSelect)
    .limit(2000);

  if (!secondTry.error) {
    return {
      data: secondTry.data || [],
      error: null,
      mode: "medium",
    };
  }

  console.warn(
    "⚠️ Availability medium select failed, trying old select:",
    secondTry.error?.message || secondTry.error
  );

  const thirdTry = await supabaseAdmin
    .from("bookings")
    .select(oldSelect)
    .limit(2000);

  return {
    data: thirdTry.data || [],
    error: thirdTry.error,
    mode: "old",
  };
}

async function loadWebAvailabilityBlocks(from: string, to: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const result = await supabaseAdmin
    .from(WEB_AVAILABILITY_TABLE)
    .select(
      "id, block_type, fleet_group, vehicle_code, quantity, start_date, start_time, end_date, end_time, note"
    )
    .lte("start_date", to)
    .gte("end_date", from)
    .limit(1000);

  return {
    data: (result.data || []) as WebAvailabilityBlockRow[],
    error: result.error,
  };
}

function getUnknownFleetBlockingCount({
  blockingBookings,
  fleetGroup,
  fleetCodes,
}: {
  blockingBookings: BookingRow[];
  fleetGroup: NexaFleetGroup;
  fleetCodes: string[];
}) {
  let count = 0;

  for (const booking of blockingBookings) {
    const code = getBookingVehicleCode(booking);
    const storedQuantity = Math.floor(Number(booking.quantity || 1));
    const bookingQuantity =
      Number.isFinite(storedQuantity) && storedQuantity > 0
        ? storedQuantity
        : 1;

    if (code && fleetCodes.includes(code)) {
      count += Math.max(0, bookingQuantity - 1);
      continue;
    }

    const belongs = bookingBelongsToFleetGroup({
      booking,
      fleetGroup,
      fleetCodes,
    });

    if (belongs) {
      count += bookingQuantity;
    }
  }

  return count;
}

function getBookedVehicleCodes({
  blockingBookings,
  fleetCodes,
}: {
  blockingBookings: BookingRow[];
  fleetCodes: string[];
}) {
  return Array.from(
    new Set(
      blockingBookings
        .map(getBookingVehicleCode)
        .filter((code) => code && fleetCodes.includes(code))
    )
  );
}

function getVehiclePublicName(vehicle: NexaVehicle) {
  return `${vehicle.marca} ${vehicle.modelo}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const vehicleId = searchParams.get("vehicleId") || "";
    const vehicleName = searchParams.get("vehicleName") || "";
    const fleetGroupParam = searchParams.get("fleetGroup") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const pickupTime = searchParams.get("pickupTime") || "10:00";
    const dropoffTime = searchParams.get("dropoffTime") || pickupTime;

    if (!from || !to) {
      return createBadRequest("Missing pickup or drop-off date.");
    }

    const requestedStart = makeDateTime(from, pickupTime);
    const requestedEnd = makeDateTime(to, dropoffTime);

    if (!requestedStart || !requestedEnd) {
      return createBadRequest("Invalid pickup or drop-off date/time.");
    }

    if (requestedEnd <= requestedStart) {
      return createBadRequest("Drop-off date/time must be after pickup date/time.");
    }

    const fleetGroup = resolveFleetGroupKeyFromWebsiteVehicle({
      vehicleId,
      vehicleName,
      fleetGroup: fleetGroupParam,
    });

    const fleet = getFleetByGroup(fleetGroup);

    if (!fleet.length) {
      return createBadRequest(
        "This vehicle type is not available for online booking."
      );
    }

    const fleetCodes = fleet.map((vehicle) =>
      normalizeVehicleCode(vehicle.codigo)
    );

    const [bookingResult, manualBlockResult] = await Promise.all([
      loadBookings(),
      loadWebAvailabilityBlocks(from, to),
    ]);

    const { data, error, mode } = bookingResult;

    if (error) {
      console.error("❌ Availability check Supabase error:", error);

      return NextResponse.json(
        {
          ok: false,
          available: false,
          message:
            "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
        },
        { status: 500 }
      );
    }

    if (manualBlockResult.error) {
      console.error(
        "❌ Web availability blocks Supabase error:",
        manualBlockResult.error
      );

      return NextResponse.json(
        {
          ok: false,
          available: false,
          message:
            "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
        },
        { status: 500 }
      );
    }

    const bookings = (data || []) as BookingRow[];

    const overlappingBlockingBookings = bookings.filter((booking) => {
      if (!bookingShouldBlock(booking.status)) {
        return false;
      }

      if (
        !bookingOverlapsSelection({
          booking,
          requestedStart,
          requestedEnd,
        })
      ) {
        return false;
      }

      return bookingBelongsToFleetGroup({
        booking,
        fleetGroup,
        fleetCodes,
      });
    });

    const overlappingManualBlocks = manualBlockResult.data.filter((block) => {
      if (
        !blockOverlapsSelection({
          block,
          requestedStart,
          requestedEnd,
        })
      ) {
        return false;
      }

      if (block.block_type === "vehicle") {
        return fleetCodes.includes(normalizeVehicleCode(block.vehicle_code));
      }

      return fleetGroupBlockApplies(block.fleet_group, fleetGroup);
    });

    const bookedVehicleCodes = getBookedVehicleCodes({
      blockingBookings: overlappingBlockingBookings,
      fleetCodes,
    });

    const unknownFleetBlockingCount = getUnknownFleetBlockingCount({
      blockingBookings: overlappingBlockingBookings,
      fleetGroup,
      fleetCodes,
    });

    const manuallyBlockedVehicleCodes = Array.from(
      new Set(
        overlappingManualBlocks
          .filter((block) => block.block_type === "vehicle")
          .map((block) => normalizeVehicleCode(block.vehicle_code))
          .filter((code) => code && fleetCodes.includes(code))
      )
    );

    const fleetQuantityBlockCount = overlappingManualBlocks
      .filter((block) => block.block_type === "fleet_group")
      .reduce((total, block) => {
        const quantity = Math.max(0, Math.floor(Number(block.quantity || 0)));
        return total + quantity;
      }, 0);

    const directlyUnavailableCodes = new Set([
      ...bookedVehicleCodes,
      ...manuallyBlockedVehicleCodes,
    ]);

    const directlyAvailableVehicles = fleet.filter(
      (vehicle) =>
        !directlyUnavailableCodes.has(normalizeVehicleCode(vehicle.codigo))
    );

    const anonymousCapacityReduction =
      unknownFleetBlockingCount + fleetQuantityBlockCount;

    const availableVehicles =
      anonymousCapacityReduction > 0
        ? directlyAvailableVehicles.slice(anonymousCapacityReduction)
        : directlyAvailableVehicles;

    const assignedVehicle = availableVehicles[0] || null;
    const available = availableVehicles.length > 0;

    const bookedCount = Math.min(
      fleet.length,
      bookedVehicleCodes.length + unknownFleetBlockingCount
    );

    const availableCount = availableVehicles.length;
    const manuallyBlockedCount = Math.max(
      0,
      fleet.length - bookedCount - availableCount
    );

    return NextResponse.json({
      ok: true,
      available,
      vehicleName: getFleetGroupDisplayName(fleetGroup),
      fleetGroup,
      totalFleet: fleet.length,
      bookedCount,
      manuallyBlockedCount,
      availableCount,
      unknownFleetBlockingCount,
      fleetQuantityBlockCount,
      bookedVehicleCodes,
      manuallyBlockedVehicleCodes,
      availableVehicleCodes: availableVehicles.map((vehicle) => vehicle.codigo),
      assignedVehicleCode: assignedVehicle?.codigo || null,
      assignedVehicleName: assignedVehicle
        ? getVehiclePublicName(assignedVehicle)
        : null,
      assignedVehicleMatricula: assignedVehicle?.matricula || null,
      assignedVehicleShortName: assignedVehicle
        ? vehicleShortName(assignedVehicle)
        : null,
      assignedVehicleDisplayName: assignedVehicle
        ? vehicleDisplayName(assignedVehicle)
        : null,
      bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
      queryMode: mode,
      message: getAvailabilityMessage({
        available,
        availableCount,
        fleetGroup,
      }),
    });
  } catch (error: any) {
    console.error("❌ Availability route error:", error);

    return NextResponse.json(
      {
        ok: false,
        available: false,
        message:
          error?.message ||
          "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
      },
      { status: 500 }
    );
  }
}
