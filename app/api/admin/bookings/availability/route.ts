import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FleetGroup =
  | "piaggio_liberty_125"
  | "kymco_sky_town_125"
  | "sym_symphony_125"
  | "unknown";

type BookingRow = {
  id?: string | number;
  created_at?: string;
  stripe_payment_intent_id?: string;
  status?: string | null;
  source?: string | null;

  pickup_date?: string | null;
  pickup_time?: string | null;
  dropoff_date?: string | null;
  dropoff_time?: string | null;

  vehicle_name?: string | null;
  vehicle_id?: string | null;
  fleet_group?: string | null;

  vehicle_code?: string | null;
  assigned_vehicle_code?: string | null;
  scooter_code?: string | null;

  customer_name?: string | null;
  phone?: string | null;

  contract_number?: string | null;

  vehicle?: {
    codigo?: string | null;
    code?: string | null;
    matricula?: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;

  contractData?: {
    numeroContrato?: string | null;
    fechaEntrega?: string | null;
    horaEntrega?: string | null;
    fechaDevolucion?: string | null;
    horaDevolucion?: string | null;
    nombreCliente?: string | null;
  } | null;
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;

const FLEET_CAPACITY: Record<FleetGroup, number> = {
  piaggio_liberty_125: 7,
  kymco_sky_town_125: 1,
  sym_symphony_125: 1,
  unknown: 1,
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeVehicleCode(value?: string | number | null) {
  return cleanText(value).toUpperCase().replace(/\s+/g, "");
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildDateTime(
  date?: string | null,
  time?: string | null
) {
  const cleanDate = cleanText(date);
  const cleanTime = cleanText(time) || "00:00";

  if (!cleanDate) return null;

  const value = new Date(`${cleanDate}T${cleanTime}`);

  if (Number.isNaN(value.getTime())) return null;

  return value;
}

function isOverlapping(
  selectedStart: Date,
  selectedEnd: Date,
  bookedStart: Date,
  bookedEnd: Date
) {
  return selectedStart < bookedEnd && bookedStart < selectedEnd;
}

function normalizeStatus(status?: string | null) {
  return cleanText(status).toLowerCase();
}

function isInactiveBooking(status?: string | null) {
  const clean = normalizeStatus(status);

  return (
    clean.includes("cancel") ||
    clean.includes("cancelada") ||
    clean.includes("cancelled") ||
    clean.includes("canceled") ||
    clean.includes("rejected") ||
    clean.includes("expired") ||
    clean.includes("failed") ||
    clean.includes("refunded") ||
    clean.includes("returned") ||
    clean.includes("finalizada") ||
    clean.includes("completed") ||
    clean.includes("finished") ||
    clean.includes("closed") ||
    clean.includes("deleted")
  );
}

function extractVehicleCode(value?: string | null) {
  const match = cleanText(value).match(/\bN\d+\b/i);

  return match?.[0]?.toUpperCase() || "";
}

function resolveFleetGroupFromText(
  value?: string | null
): FleetGroup {
  const text = cleanText(value).toLowerCase();
  const vehicleCode = extractVehicleCode(text);

  const isKymco =
    vehicleCode === "N9" ||
    text.includes("kymco") ||
    text.includes("sky town") ||
    text.includes("sky-town") ||
    text.includes("skytown") ||
    text.includes("kymco_sky_town_125") ||
    /\bs4\b/i.test(text);

  if (isKymco) {
    return "kymco_sky_town_125";
  }

  const isSym =
    vehicleCode === "N8" ||
    text.includes("sym_symphony_125") ||
    text.includes("symphony") ||
    /\bsym\b/i.test(text) ||
    /\bs3\b/i.test(text);

  if (isSym) {
    return "sym_symphony_125";
  }

  const isPiaggioCode = [
    "N1",
    "N2",
    "N3",
    "N4",
    "N5",
    "N6",
    "N7",
  ].includes(vehicleCode);

  const isPiaggio =
    isPiaggioCode ||
    text.includes("piaggio_liberty_125") ||
    text.includes("piaggio") ||
    text.includes("liberty") ||
    /\bs2\b/i.test(text);

  if (isPiaggio) {
    return "piaggio_liberty_125";
  }

  return "unknown";
}

function resolveRequestedFleetGroup(
  params: URLSearchParams
): FleetGroup {
  const vehicleId = cleanText(params.get("vehicleId"));
  const vehicleName = cleanText(params.get("vehicleName"));
  const fleetGroup = cleanText(params.get("fleetGroup"));

  const combined = `${vehicleId} ${vehicleName} ${fleetGroup}`;

  return resolveFleetGroupFromText(combined);
}

function getBookingVehicleCode(booking: BookingRow) {
  return normalizeVehicleCode(
    booking.assigned_vehicle_code ||
      booking.vehicle_code ||
      booking.scooter_code ||
      booking.vehicle?.codigo ||
      booking.vehicle?.code ||
      extractVehicleCode(booking.vehicle_name)
  );
}

function resolveBookingFleetGroup(
  booking: BookingRow
): FleetGroup {
  const vehicleCode = getBookingVehicleCode(booking);

  const combined = [
    booking.fleet_group,
    booking.vehicle_id,
    vehicleCode,
    booking.vehicle_name,
    booking.vehicle?.codigo,
    booking.vehicle?.code,
    booking.vehicle?.marca,
    booking.vehicle?.modelo,
  ]
    .filter(Boolean)
    .join(" ");

  return resolveFleetGroupFromText(combined);
}

function getBookingRange(booking: BookingRow) {
  const pickupDate =
    cleanText(booking.pickup_date) ||
    cleanText(booking.contractData?.fechaEntrega);

  const pickupTime =
    cleanText(booking.pickup_time) ||
    cleanText(booking.contractData?.horaEntrega);

  const dropoffDate =
    cleanText(booking.dropoff_date) ||
    cleanText(booking.contractData?.fechaDevolucion);

  const dropoffTime =
    cleanText(booking.dropoff_time) ||
    cleanText(booking.contractData?.horaDevolucion);

  const start = buildDateTime(pickupDate, pickupTime);
  const end = buildDateTime(dropoffDate, dropoffTime);

  if (!start || !end) return null;

  return {
    start,
    end,
    bufferedEnd: addMinutes(
      end,
      BUFFER_MINUTES_AFTER_BOOKING
    ),
  };
}

function getCustomerName(booking: BookingRow) {
  return (
    cleanText(booking.customer_name) ||
    cleanText(booking.contractData?.nombreCliente) ||
    "Customer"
  );
}

function getContractNumber(booking: BookingRow) {
  return (
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.stripe_payment_intent_id) ||
    cleanText(booking.id)
  );
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getFleetLabel(group: FleetGroup) {
  if (group === "piaggio_liberty_125") {
    return "Piaggio Liberty 125";
  }

  if (group === "kymco_sky_town_125") {
    return "KYMCO Sky Town 125";
  }

  if (group === "sym_symphony_125") {
    return "SYM Symphony 125";
  }

  return "Selected vehicle";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          message:
            "Live availability could not be confirmed. Please contact us on WhatsApp.",
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const vehicleName = cleanText(
      searchParams.get("vehicleName")
    );
    const from = cleanText(searchParams.get("from"));
    const to = cleanText(searchParams.get("to"));
    const pickupTime = cleanText(
      searchParams.get("pickupTime")
    );
    const dropoffTime = cleanText(
      searchParams.get("dropoffTime")
    );

    if (!from || !to || !pickupTime || !dropoffTime) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          message:
            "Missing date or time for availability check.",
        },
        { status: 400 }
      );
    }

    const selectedStart = buildDateTime(from, pickupTime);
    const selectedEnd = buildDateTime(to, dropoffTime);

    if (!selectedStart || !selectedEnd) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          message: "Invalid selected date or time.",
        },
        { status: 400 }
      );
    }

    if (selectedEnd <= selectedStart) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          message:
            "Return date/time must be after pickup date/time.",
        },
        { status: 400 }
      );
    }

    const selectedBufferedEnd = addMinutes(
      selectedEnd,
      BUFFER_MINUTES_AFTER_BOOKING
    );

    const requestedGroup =
      resolveRequestedFleetGroup(searchParams);

    const totalFleet =
      FLEET_CAPACITY[requestedGroup] || 1;

    const fleetLabel = getFleetLabel(requestedGroup);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error(
        "AVAILABILITY SUPABASE ERROR:",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          available: false,
          message:
            "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    const bookings = Array.isArray(data)
      ? (data as BookingRow[])
      : [];

    const overlappingBookings = bookings.filter(
      (booking) => {
        if (isInactiveBooking(booking.status)) {
          return false;
        }

        const bookingGroup =
          resolveBookingFleetGroup(booking);

        if (bookingGroup !== requestedGroup) {
          return false;
        }

        const range = getBookingRange(booking);

        if (!range) {
          return false;
        }

        return isOverlapping(
          selectedStart,
          selectedBufferedEnd,
          range.start,
          range.bufferedEnd
        );
      }
    );

    const bookedCount = Math.min(
      totalFleet,
      overlappingBookings.length
    );

    const availableCount = Math.max(
      0,
      totalFleet - bookedCount
    );

    const available = availableCount > 0;

    if (available) {
      return NextResponse.json({
        ok: true,
        available: true,
        vehicleName: vehicleName || fleetLabel,
        fleetGroup: requestedGroup,
        totalFleet,
        bookedCount,
        availableCount,
        bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
        message: `${availableCount}/${totalFleet} ${fleetLabel} available for the selected date/time.`,
      });
    }

    const nextReturn = overlappingBookings
      .map((booking) => {
        const range = getBookingRange(booking);

        if (!range) return null;

        return {
          booking,
          bufferedEnd: range.bufferedEnd,
        };
      })
      .filter(
        (
          item
        ): item is {
          booking: BookingRow;
          bufferedEnd: Date;
        } => item !== null
      )
      .sort((a, b) => {
        return (
          a.bufferedEnd.getTime() -
          b.bufferedEnd.getTime()
        );
      })[0];

    const nextAvailableText = nextReturn
      ? `Next possible availability may be after ${formatDateTime(
          nextReturn.bufferedEnd
        )}.`
      : "";

    return NextResponse.json({
      ok: true,
      available: false,
      vehicleName: vehicleName || fleetLabel,
      fleetGroup: requestedGroup,
      totalFleet,
      bookedCount,
      availableCount,
      bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
      nextAvailableText,
      message: `${fleetLabel} is not available for the selected dates. Please change your dates or choose another vehicle.${
        nextAvailableText ? ` ${nextAvailableText}` : ""
      }`,
      conflicts: overlappingBookings.map((booking) => ({
        contract: getContractNumber(booking),
        customer: getCustomerName(booking),
        vehicleCode: getBookingVehicleCode(booking),
        vehicleName:
          booking.vehicle_name ||
          booking.vehicle?.modelo ||
          "",
        pickupDate:
          booking.pickup_date ||
          booking.contractData?.fechaEntrega,
        pickupTime:
          booking.pickup_time ||
          booking.contractData?.horaEntrega,
        dropoffDate:
          booking.dropoff_date ||
          booking.contractData?.fechaDevolucion,
        dropoffTime:
          booking.dropoff_time ||
          booking.contractData?.horaDevolucion,
        status: booking.status,
      })),
    });
  } catch (error: any) {
    console.error(
      "AVAILABILITY CHECK FAILED:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        available: false,
        message:
          "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
        error:
          error?.message ||
          "Availability check failed.",
      },
      { status: 500 }
    );
  }
}