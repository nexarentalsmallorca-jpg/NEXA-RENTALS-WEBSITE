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

  customer_name?: string;
  customer_email?: string;
  phone?: string;

  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;

  vehicle_name?: string;
  vehicle_code?: string;

  amount?: number;
  currency?: string;

  payment_method?: string;
  payment_status?: string;
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
    telefono?: string;
    email?: string;
    total?: string;
    metodoPago?: string;
    paymentMethod?: string;
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

function cleanMoneyToCents(value?: string | number) {
  if (value === undefined || value === null || value === "") return 0;

  const clean = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(clean);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100);
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

function getFleetLabel(group: FleetGroup) {
  if (group === "piaggio_liberty_125") return "Piaggio Liberty 125";
  if (group === "sym_symphony_125") return "SYM Symphony 125";
  return "Selected vehicle";
}

function normalizePaymentMethod(value: any) {
  const raw = String(value || "").trim().toLowerCase();

  if (
    raw === "cash" ||
    raw === "efectivo" ||
    raw.includes("cash") ||
    raw.includes("efectivo")
  ) {
    return "cash";
  }

  if (
    raw === "card" ||
    raw === "tarjeta" ||
    raw === "stripe" ||
    raw.includes("card") ||
    raw.includes("tarjeta") ||
    raw.includes("stripe")
  ) {
    return "card";
  }

  if (
    raw === "unpaid" ||
    raw === "pending" ||
    raw === "pendiente" ||
    raw.includes("unpaid") ||
    raw.includes("pending") ||
    raw.includes("pendiente")
  ) {
    return "unpaid";
  }

  return "card";
}

function getBodyValue(body: any, keys: string[]) {
  for (const key of keys) {
    const value = body?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return "";
}

function getNestedBodyValue(body: any, keys: string[]) {
  for (const key of keys) {
    const parts = key.split(".");
    let current = body;

    for (const part of parts) {
      current = current?.[part];
    }

    if (current !== undefined && current !== null && current !== "") {
      return current;
    }
  }

  return "";
}

function resolvePublicBookingInput(body: any) {
  const booking = body?.booking || {};
  const contractData = booking?.contractData || {};
  const vehicle = booking?.vehicle || {};

  const stripePaymentIntentId = cleanText(
    getBodyValue(body, [
      "stripePaymentIntentId",
      "stripe_payment_intent_id",
      "paymentIntentId",
      "payment_intent_id",
    ]) ||
      getNestedBodyValue(body, [
        "booking.stripePaymentIntentId",
        "booking.stripe_payment_intent_id",
        "booking.paymentIntentId",
        "booking.payment_intent_id",
      ]) ||
      booking?.id ||
      contractData?.numeroContrato
  );

  const vehicleName = cleanText(
    getBodyValue(body, ["vehicleName", "vehicle", "vehicle_name"]) ||
      getNestedBodyValue(body, ["booking.vehicleName", "booking.vehicle_name"]) ||
      [
        vehicle?.codigo,
        vehicle?.matricula,
        vehicle?.marca,
        vehicle?.modelo,
      ]
        .filter(Boolean)
        .join(" · ")
  );

  const vehicleCode = cleanText(
    getBodyValue(body, ["vehicleId", "vehicleCode", "vehicle_code"]) ||
      getNestedBodyValue(body, [
        "booking.vehicleId",
        "booking.vehicleCode",
        "booking.vehicle_code",
        "booking.vehicle.codigo",
      ]) ||
      extractVehicleCode(vehicleName)
  );

  const pickupDate = cleanText(
    getBodyValue(body, ["pickupDate", "pickup_date", "from"]) ||
      contractData?.fechaEntrega
  );

  const pickupTime = cleanText(
    getBodyValue(body, ["pickupTime", "pickup_time"]) ||
      contractData?.horaEntrega
  );

  const dropoffDate = cleanText(
    getBodyValue(body, ["dropoffDate", "dropoff_date", "to"]) ||
      contractData?.fechaDevolucion
  );

  const dropoffTime = cleanText(
    getBodyValue(body, ["dropoffTime", "dropoff_time"]) ||
      contractData?.horaDevolucion
  );

  const customerName = cleanText(
    getBodyValue(body, ["customerName", "customer_name", "name"]) ||
      contractData?.nombreCliente
  );

  const customerEmail = cleanText(
    getBodyValue(body, ["customerEmail", "customer_email", "email"]) ||
      contractData?.email
  );

  const phone = cleanText(
    getBodyValue(body, ["phone", "telefono", "customerPhone"]) ||
      contractData?.telefono
  );

  const amountRaw =
    getBodyValue(body, ["amount", "total", "totalPrice", "price"]) ||
    contractData?.total;

  const amount =
    typeof amountRaw === "number" && amountRaw > 999
      ? amountRaw
      : cleanMoneyToCents(amountRaw);

  const paymentMethod = normalizePaymentMethod(
    getBodyValue(body, ["paymentMethod", "payment_method", "metodoPago"]) ||
      contractData?.paymentMethod ||
      contractData?.metodoPago ||
      "card"
  );

  const source = cleanText(
    getBodyValue(body, ["source"]) ||
      getNestedBodyValue(body, ["booking.source"]) ||
      "website"
  );

  const status = cleanText(
    getBodyValue(body, ["status"]) ||
      getNestedBodyValue(body, ["booking.status"]) ||
      "paid"
  );

  const fallbackId = `website_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  return {
    stripePaymentIntentId: stripePaymentIntentId || fallbackId,
    status,
    source,

    customerName,
    customerEmail,
    phone,

    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,

    vehicleName,
    vehicleCode,

    amount,
    currency: cleanText(getBodyValue(body, ["currency"]) || "eur"),

    paymentMethod,
    paymentStatus: paymentMethod === "unpaid" ? "unpaid" : "paid",

    contractNumber: cleanText(
      getBodyValue(body, ["contractNumber", "contract_number"]) ||
        contractData?.numeroContrato ||
        stripePaymentIntentId ||
        fallbackId
    ),
  };
}

async function checkAvailability({
  supabase,
  requestedGroup,
  selectedStart,
  selectedEnd,
}: {
  supabase: any;
  requestedGroup: FleetGroup;
  selectedStart: Date;
  selectedEnd: Date;
}) {
  const selectedBufferedEnd = addMinutes(
    selectedEnd,
    BUFFER_MINUTES_AFTER_BOOKING
  );

  const totalFleet = FLEET_CAPACITY[requestedGroup] || 1;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(error.message);
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

  return {
    available: availableCount > 0,
    totalFleet,
    bookedCount,
    availableCount,
    overlappingBookings,
  };
}

function normalizeBookingForDashboard(row: any) {
  const vehicleName = cleanText(row.vehicle_name);
  const vehicleCode = cleanText(row.vehicle_code) || extractVehicleCode(vehicleName);

  const amountCents = Number(row.amount || 0);

  const customerName = cleanText(row.customer_name) || "Customer";

  const createdAt =
    cleanText(row.created_at) ||
    cleanText(row.createdAt) ||
    new Date().toISOString();

  const paymentMethod = normalizePaymentMethod(row.payment_method);

  const contractNumber =
    cleanText(row.contract_number) ||
    cleanText(row.stripe_payment_intent_id) ||
    cleanText(row.id);

  return {
    ...row,

    id: cleanText(row.id) || cleanText(row.stripe_payment_intent_id),
    createdAt,
    created_at: createdAt,

    source: cleanText(row.source || "website"),
    status: cleanText(row.status || "paid"),

    stripe_payment_intent_id: cleanText(row.stripe_payment_intent_id),

    customer_name: customerName,
    customer_email: cleanText(row.customer_email),
    phone: cleanText(row.phone),

    pickup_date: cleanText(row.pickup_date),
    pickup_time: cleanText(row.pickup_time),
    dropoff_date: cleanText(row.dropoff_date),
    dropoff_time: cleanText(row.dropoff_time),

    vehicle_name: vehicleName,
    vehicle_code: vehicleCode,

    amount: amountCents,
    amount_eur: amountCents / 100,
    currency: cleanText(row.currency || "eur"),

    payment_method: paymentMethod,
    payment_status: cleanText(row.payment_status || "paid"),

    contract_number: contractNumber,

    vehicle: {
      codigo: vehicleCode,
      matricula: vehicleName.includes("·")
        ? vehicleName.split("·")[1]?.trim() || ""
        : "",
      marca: vehicleName.toLowerCase().includes("sym") ? "SYM" : "Piaggio",
      modelo: vehicleName.toLowerCase().includes("sym")
        ? "Symphony 125"
        : vehicleName.toLowerCase().includes("liberty")
        ? "Liberty 125"
        : vehicleName,
    },

    contractData: {
      numeroContrato: contractNumber,
      fechaEntrega: cleanText(row.pickup_date),
      horaEntrega: cleanText(row.pickup_time),
      fechaDevolucion: cleanText(row.dropoff_date),
      horaDevolucion: cleanText(row.dropoff_time),
      nombreCliente: customerName,
      telefono: cleanText(row.phone),
      email: cleanText(row.customer_email),
      total: amountCents ? `${(amountCents / 100).toFixed(2)}€` : "",
      pagado: paymentMethod,
      metodoPago: paymentMethod,
      paymentMethod,
    },
  };
}

function fallbackPayloadForOldBookingsTable(payload: any) {
  return {
    stripe_payment_intent_id: payload.stripe_payment_intent_id,
    status: payload.status,

    customer_name: payload.customer_name,
    customer_email: payload.customer_email,
    phone: payload.phone,

    pickup_date: payload.pickup_date,
    pickup_time: payload.pickup_time,
    dropoff_date: payload.dropoff_date,
    dropoff_time: payload.dropoff_time,

    vehicle_name: payload.vehicle_name,

    dl_front_path: "",
    dl_back_path: "",
    id_front_path: "",
    id_back_path: "",

    amount: payload.amount,
    currency: payload.currency,
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({
        ok: false,
        bookings: [],
        error: "Supabase ENV vars are not configured.",
      });
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("PUBLIC BOOKINGS GET ERROR:", error);

      return NextResponse.json({
        ok: false,
        bookings: [],
        error: error.message,
      });
    }

    return NextResponse.json({
      ok: true,
      bookings: (data || []).map(normalizeBookingForDashboard),
    });
  } catch (error: any) {
    console.error("PUBLIC BOOKINGS GET FAILED:", error);

    return NextResponse.json({
      ok: false,
      bookings: [],
      error: error?.message || "Failed to load bookings.",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase ENV vars are not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const input = resolvePublicBookingInput(body);

    if (!input.pickupDate || !input.pickupTime) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing pickup date/time.",
        },
        { status: 400 }
      );
    }

    if (!input.dropoffDate || !input.dropoffTime) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing drop-off date/time.",
        },
        { status: 400 }
      );
    }

    if (!input.vehicleName && !input.vehicleCode) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing vehicle selection.",
        },
        { status: 400 }
      );
    }

    const selectedStart = buildDateTime(input.pickupDate, input.pickupTime);
    const selectedEnd = buildDateTime(input.dropoffDate, input.dropoffTime);

    if (!selectedStart || !selectedEnd) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid date or time.",
        },
        { status: 400 }
      );
    }

    if (selectedEnd <= selectedStart) {
      return NextResponse.json(
        {
          ok: false,
          error: "Return date/time must be after pickup date/time.",
        },
        { status: 400 }
      );
    }

    const requestedGroup = resolveFleetGroupFromText(
      `${input.vehicleCode} ${input.vehicleName}`
    );

    const availability = await checkAvailability({
      supabase,
      requestedGroup,
      selectedStart,
      selectedEnd,
    });

    const fleetLabel = getFleetLabel(requestedGroup);

    if (!availability.available) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          error: `${fleetLabel} is not available for the selected dates. Please change your dates or choose another vehicle.`,
          fleetGroup: requestedGroup,
          totalFleet: availability.totalFleet,
          bookedCount: availability.bookedCount,
          availableCount: availability.availableCount,
          bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
        },
        { status: 409 }
      );
    }

    const payload = {
      stripe_payment_intent_id: input.stripePaymentIntentId,
      status: input.status,

      customer_name: input.customerName,
      customer_email: input.customerEmail,
      phone: input.phone,

      pickup_date: input.pickupDate,
      pickup_time: input.pickupTime,
      dropoff_date: input.dropoffDate,
      dropoff_time: input.dropoffTime,

      vehicle_name: input.vehicleName || input.vehicleCode,
      vehicle_code: input.vehicleCode,

      amount: input.amount,
      currency: input.currency,

      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,

      source: input.source,
      contract_number: input.contractNumber,
    };

    let { data, error } = await supabase
      .from("bookings")
      .upsert(payload, { onConflict: "stripe_payment_intent_id" })
      .select();

    if (error) {
      console.warn(
        "PUBLIC BOOKINGS POST FULL PAYLOAD FAILED, TRYING OLD TABLE FALLBACK:",
        error.message
      );

      const fallbackPayload = fallbackPayloadForOldBookingsTable(payload);

      const fallbackResult = await supabase
        .from("bookings")
        .upsert(fallbackPayload, { onConflict: "stripe_payment_intent_id" })
        .select();

      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error("PUBLIC BOOKINGS POST ERROR:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const savedBooking = data?.[0]
      ? normalizeBookingForDashboard(data[0])
      : null;

    return NextResponse.json({
      ok: true,
      available: true,
      booking: savedBooking,
      availability: {
        fleetGroup: requestedGroup,
        totalFleet: availability.totalFleet,
        bookedCount: availability.bookedCount,
        availableCount: availability.availableCount - 1,
        bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
      },
    });
  } catch (error: any) {
    console.error("PUBLIC BOOKINGS POST FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to save booking.",
      },
      { status: 500 }
    );
  }
}