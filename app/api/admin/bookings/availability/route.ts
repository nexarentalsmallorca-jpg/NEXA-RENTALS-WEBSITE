import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FleetGroup = "piaggio_liberty_125" | "sym_symphony_125" | "unknown";

type BookingRow = {
  id?: string | number;
  created_at?: string;
  stripe_payment_intent_id?: string;
  status?: string;
  source?: string;

  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;

  vehicle_name?: string;
  vehicle_code?: string;

  customer_name?: string;
  phone?: string;

  contract_number?: string;

  vehicle?: {
    codigo?: string;
    matricula?: string;
    marca?: string;
    modelo?: string;
  };

  contractData?: {
    numeroContrato?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    nombreCliente?: string;
  };
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;

const FLEET_CAPACITY: Record<FleetGroup, number> = {
  piaggio_liberty_125: 7,
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

function cleanText(value: any) {
  return String(value || "").trim();
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function buildDateTime(date?: string, time?: string) {
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

function normalizeStatus(status?: string) {
  return cleanText(status).toLowerCase();
}

function isInactiveBooking(status?: string) {
  const clean = normalizeStatus(status);

  return (
    clean.includes("cancel") ||
    clean.includes("cancelada") ||
    clean.includes("cancelled") ||
    clean.includes("canceled") ||
    clean.includes("failed") ||
    clean.includes("refunded") ||
    clean.includes("returned") ||
    clean.includes("finalizada") ||
    clean.includes("completed") ||
    clean.includes("finished")
  );
}

function extractVehicleCode(value?: string | null) {
  const match = cleanText(value).match(/\bN\d+\b/i);
  return match?.[0]?.toUpperCase() || "";
}

function resolveFleetGroupFromText(value?: string | null): FleetGroup {
  const text = cleanText(value).toLowerCase();

  if (
    text.includes("sym") ||
    text.includes("symphony") ||
    text.includes("n8")
  ) {
    return "sym_symphony_125";
  }

  if (
    text.includes("piaggio") ||
    text.includes("liberty") ||
    text.includes("s2") ||
    text.includes("n1") ||
    text.includes("n2") ||
    text.includes("n3") ||
    text.includes("n4") ||
    text.includes("n5") ||
    text.includes("n6") ||
    text.includes("n7")
  ) {
    return "piaggio_liberty_125";
  }

  return "unknown";
}

function resolveRequestedFleetGroup(params: URLSearchParams): FleetGroup {
  const vehicleId = cleanText(params.get("vehicleId"));
  const vehicleName = cleanText(params.get("vehicleName"));

  const combined = `${vehicleId} ${vehicleName}`;

  return resolveFleetGroupFromText(combined);
}

function resolveBookingFleetGroup(booking: BookingRow): FleetGroup {
  const vehicleCode =
    cleanText(booking.vehicle_code) ||
    cleanText(booking.vehicle?.codigo) ||
    extractVehicleCode(booking.vehicle_name);

  const combined = [
    vehicleCode,
    booking.vehicle_name,
    booking.vehicle?.codigo,
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
    bufferedEnd: addMinutes(end, BUFFER_MINUTES_AFTER_BOOKING),
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
  if (group === "piaggio_liberty_125") return "Piaggio Liberty 125";
  if (group === "sym_symphony_125") return "SYM Symphony 125";
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

    const vehicleName = cleanText(searchParams.get("vehicleName"));
    const from = cleanText(searchParams.get("from"));
    const to = cleanText(searchParams.get("to"));
    const pickupTime = cleanText(searchParams.get("pickupTime"));
    const dropoffTime = cleanText(searchParams.get("dropoffTime"));

    if (!from || !to || !pickupTime || !dropoffTime) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          message: "Missing date or time for availability check.",
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
          message: "Return date/time must be after pickup date/time.",
        },
        { status: 400 }
      );
    }

    const selectedBufferedEnd = addMinutes(
      selectedEnd,
      BUFFER_MINUTES_AFTER_BOOKING
    );

    const requestedGroup = resolveRequestedFleetGroup(searchParams);
    const totalFleet = FLEET_CAPACITY[requestedGroup] || 1;
    const fleetLabel = getFleetLabel(requestedGroup);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("AVAILABILITY SUPABASE ERROR:", error);

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

    const bookings = Array.isArray(data) ? (data as BookingRow[]) : [];

    const overlappingBookings = bookings.filter((booking) => {
      if (isInactiveBooking(booking.status)) return false;

      const bookingGroup = resolveBookingFleetGroup(booking);

      if (bookingGroup !== requestedGroup) return false;

      const range = getBookingRange(booking);

      if (!range) return false;

      return isOverlapping(
        selectedStart,
        selectedBufferedEnd,
        range.start,
        range.bufferedEnd
      );
    });

    const bookedCount = overlappingBookings.length;
    const availableCount = Math.max(0, totalFleet - bookedCount);
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
      .filter(Boolean)
      .sort((a: any, b: any) => {
        return a.bufferedEnd.getTime() - b.bufferedEnd.getTime();
      })[0] as
      | {
          booking: BookingRow;
          bufferedEnd: Date;
        }
      | undefined;

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
        vehicleName: booking.vehicle_name || booking.vehicle?.modelo || "",
        pickupDate: booking.pickup_date || booking.contractData?.fechaEntrega,
        pickupTime: booking.pickup_time || booking.contractData?.horaEntrega,
        dropoffDate:
          booking.dropoff_date || booking.contractData?.fechaDevolucion,
        dropoffTime:
          booking.dropoff_time || booking.contractData?.horaDevolucion,
        status: booking.status,
      })),
    });
  } catch (error: any) {
    console.error("AVAILABILITY CHECK FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        available: false,
        message:
          "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
        error: error?.message || "Availability check failed.",
      },
      { status: 500 }
    );
  }
}