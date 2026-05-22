import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  extractVehicleCodeFromText,
  findVehicleByCodigo,
  getEBikeFleet,
  getPiaggioFleet,
  getScooterFleet,
  getSymFleet,
  normalizeVehicleText,
  vehicleDisplayName,
  vehicleShortName,
  type NexaVehicle,
} from "@/lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NexaFleetGroup =
  | "piaggio_liberty_125"
  | "sym_symphony_125"
  | "e_bike"
  | "scooter";

type BookingAction = "rent_now" | "reserve_now";

type BookingRow = {
  id?: string | number;
  created_at?: string;
  stripe_payment_intent_id?: string | null;
  status?: string | null;
  source?: string | null;
  booking_action?: BookingAction | string | null;
  bookingAction?: BookingAction | string | null;

  customer_name?: string | null;
  customer_email?: string | null;
  phone?: string | null;

  pickup_date?: string | null;
  pickup_time?: string | null;
  dropoff_date?: string | null;
  dropoff_time?: string | null;

  from?: string | null;
  to?: string | null;

  vehicle_name?: string | null;
  vehicle_id?: string | null;
  vehicle_code?: string | null;
  assigned_vehicle_code?: string | null;
  scooter_code?: string | null;
  fleet_group?: string | null;

  amount?: number | null;
  currency?: string | null;

  payment_method?: string | null;
  payment_status?: string | null;
  contract_number?: string | null;

  vehicle?: {
    codigo?: string | null;
    code?: string | null;
    matricula?: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;

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
    bookingAction?: BookingAction;
  };
};

type BookingInput = {
  stripePaymentIntentId: string;
  status: string;
  source: string;
  bookingAction: BookingAction;

  customerName: string;
  customerEmail: string;
  phone: string;

  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;

  vehicleId: string;
  vehicleName: string;
  vehicleCode: string;
  assignedVehicleCode: string;
  fleetGroup: NexaFleetGroup;

  amount: number;
  currency: string;

  paymentMethod: string;
  paymentStatus: string;

  contractNumber: string;
};

type SupabaseWriteResult = {
  data: any[] | null;
  error: any | null;
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;

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

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeVehicleCode(value?: unknown) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function safeNormalizeText(value: unknown) {
  return normalizeVehicleText(String(value || ""));
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

function buildDateTime(date?: string | null, time?: string | null) {
  const cleanDate = cleanText(date);
  const cleanTime = cleanText(time) || "00:00";

  if (!cleanDate) return null;

  const value = new Date(`${cleanDate}T${cleanTime}:00`);

  return Number.isNaN(value.getTime()) ? null : value;
}

function isOverlapping(
  selectedStart: Date,
  selectedEnd: Date,
  bookedStart: Date,
  bookedEnd: Date
) {
  return selectedStart < bookedEnd && bookedStart < selectedEnd;
}

function isInactiveBooking(status?: string | null) {
  const clean = safeNormalizeText(status);

  if (!clean) return false;

  return NON_BLOCKING_STATUSES.includes(clean);
}

function isPastBooking(booking: BookingRow) {
  const range = getBookingRange(booking);

  if (!range) return false;

  return new Date() > range.bufferedEnd;
}

function getFleetByGroup(group: NexaFleetGroup) {
  if (group === "piaggio_liberty_125") return getPiaggioFleet();
  if (group === "sym_symphony_125") return getSymFleet();
  if (group === "e_bike") return getEBikeFleet();
  return getScooterFleet();
}

function getFleetGroupDisplayName(group: NexaFleetGroup) {
  if (group === "piaggio_liberty_125") return "Piaggio Liberty 125";
  if (group === "sym_symphony_125") return "SYM Symphony 125";
  if (group === "e_bike") return "E-Bike";
  return "Scooter";
}

function getVehiclePublicName(vehicle: NexaVehicle) {
  return `${vehicle.marca} ${vehicle.modelo}`;
}

function resolveVehicleFleetGroup(vehicle?: NexaVehicle | null): NexaFleetGroup {
  if (!vehicle) return "scooter";

  if (vehicle.tipo === "E-Bike") return "e_bike";
  if (safeNormalizeText(vehicle.marca) === "sym") return "sym_symphony_125";
  if (safeNormalizeText(vehicle.marca) === "piaggio") {
    return "piaggio_liberty_125";
  }

  return "scooter";
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

  if (cleanFleetGroup === "piaggio_liberty_125") return "piaggio_liberty_125";
  if (cleanFleetGroup === "sym_symphony_125") return "sym_symphony_125";
  if (cleanFleetGroup === "e_bike") return "e_bike";

  const exactCode =
    extractVehicleCodeFromText(String(vehicleId || "")) ||
    extractVehicleCodeFromText(String(vehicleName || ""));

  const exactVehicle = findVehicleByCodigo(exactCode);

  if (exactVehicle) return resolveVehicleFleetGroup(exactVehicle);

  if (
    cleanId === "s3" ||
    cleanName.includes("sym") ||
    cleanName.includes("symphony")
  ) {
    return "sym_symphony_125";
  }

  if (
    cleanId === "s2" ||
    cleanName.includes("piaggio") ||
    cleanName.includes("liberty")
  ) {
    return "piaggio_liberty_125";
  }

  if (
    cleanId.startsWith("e") ||
    cleanName.includes("e-bike") ||
    cleanName.includes("ebike") ||
    cleanName.includes("engwe") ||
    cleanName.includes("p275")
  ) {
    return "e_bike";
  }

  return "scooter";
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

function resolveBookingFleetGroup(booking: BookingRow): NexaFleetGroup {
  const exactCode = getBookingVehicleCode(booking);
  const exactVehicle = findVehicleByCodigo(exactCode);

  if (exactVehicle) return resolveVehicleFleetGroup(exactVehicle);

  return resolveFleetGroupKeyFromWebsiteVehicle({
    vehicleId: booking.vehicle_id || booking.vehicle_code || exactCode,
    vehicleName: [
      booking.vehicle_name,
      booking.vehicle?.marca,
      booking.vehicle?.modelo,
    ]
      .filter(Boolean)
      .join(" "),
    fleetGroup: booking.fleet_group,
  });
}

function getBookingRange(booking: BookingRow) {
  const pickupDate =
    cleanText(booking.pickup_date) ||
    cleanText(booking.from) ||
    cleanText(booking.contractData?.fechaEntrega);

  const pickupTime =
    cleanText(booking.pickup_time) ||
    cleanText(booking.contractData?.horaEntrega);

  const dropoffDate =
    cleanText(booking.dropoff_date) ||
    cleanText(booking.to) ||
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

function normalizePaymentMethod(value: unknown) {
  const raw = safeNormalizeText(value);

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

function normalizeBookingAction(value: unknown): BookingAction {
  const clean = safeNormalizeText(value);

  if (
    clean === "rent_now" ||
    clean === "rented_out" ||
    clean === "rented" ||
    clean === "picked_up" ||
    clean === "picked up" ||
    clean === "en alquiler" ||
    clean.includes("rent now") ||
    clean.includes("rented") ||
    clean.includes("picked") ||
    clean.includes("alquilado") ||
    clean.includes("en alquiler")
  ) {
    return "rent_now";
  }

  return "reserve_now";
}

function normalizeBookingStatus(value: unknown, action: BookingAction) {
  const clean = safeNormalizeText(value);

  if (
    clean.includes("cancel") ||
    clean.includes("failed") ||
    clean.includes("refunded")
  ) {
    return "cancelled";
  }

  if (
    clean.includes("returned") ||
    clean.includes("completed") ||
    clean.includes("finished") ||
    clean.includes("finalizada")
  ) {
    return "returned";
  }

  return action === "rent_now" ? "rented_out" : "reserved";
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

function resolvePublicBookingInput(body: any): BookingInput {
  const booking = body?.booking || {};
  const contractData = booking?.contractData || {};
  const vehicle = booking?.vehicle || {};

  const fallbackId = `booking_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  const rawBookingAction =
    getBodyValue(body, ["bookingAction", "booking_action"]) ||
    getNestedBodyValue(body, [
      "booking.bookingAction",
      "booking.booking_action",
      "booking.contractData.bookingAction",
    ]) ||
    contractData?.bookingAction;

  const bookingAction = normalizeBookingAction(rawBookingAction);

  const rawStatus =
    getBodyValue(body, ["status"]) ||
    getNestedBodyValue(body, ["booking.status"]) ||
    booking?.status ||
    "";

  const status = normalizeBookingStatus(rawStatus, bookingAction);

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
      contractData?.numeroContrato ||
      fallbackId
  );

  const vehicleId = cleanText(
    getBodyValue(body, ["vehicleId", "vehicle_id"]) ||
      getNestedBodyValue(body, ["booking.vehicleId", "booking.vehicle_id"]) ||
      ""
  );

  const vehicleName = cleanText(
    getBodyValue(body, [
      "vehicleName",
      "vehicle",
      "vehicle_name",
      "assignedVehicleDisplayName",
      "assigned_vehicle_display_name",
    ]) ||
      getNestedBodyValue(body, [
        "booking.vehicleName",
        "booking.vehicle_name",
        "booking.assignedVehicleDisplayName",
        "booking.assigned_vehicle_display_name",
      ]) ||
      [
        vehicle?.codigo,
        vehicle?.matricula,
        vehicle?.marca,
        vehicle?.modelo,
      ]
        .filter(Boolean)
        .join(" · ")
  );

  const rawVehicleCode = cleanText(
    getBodyValue(body, [
      "assignedVehicleCode",
      "assigned_vehicle_code",
      "vehicleCode",
      "vehicle_code",
      "scooterCode",
      "scooter_code",
    ]) ||
      getNestedBodyValue(body, [
        "booking.assignedVehicleCode",
        "booking.assigned_vehicle_code",
        "booking.vehicleCode",
        "booking.vehicle_code",
        "booking.scooterCode",
        "booking.scooter_code",
        "booking.vehicle.codigo",
      ]) ||
      extractVehicleCodeFromText(String(vehicleName || ""))
  );

  const assignedVehicleCode = normalizeVehicleCode(
    getBodyValue(body, ["assignedVehicleCode", "assigned_vehicle_code"]) ||
      getNestedBodyValue(body, [
        "booking.assignedVehicleCode",
        "booking.assigned_vehicle_code",
      ]) ||
      rawVehicleCode
  );

  const fleetGroup = resolveFleetGroupKeyFromWebsiteVehicle({
    vehicleId: vehicleId || rawVehicleCode,
    vehicleName,
    fleetGroup:
      getBodyValue(body, ["fleetGroup", "fleet_group"]) ||
      getNestedBodyValue(body, ["booking.fleetGroup", "booking.fleet_group"]),
  });

  const pickupDate = cleanText(
    getBodyValue(body, ["pickupDate", "pickup_date", "from"]) ||
      getNestedBodyValue(body, ["booking.pickupDate", "booking.pickup_date"]) ||
      contractData?.fechaEntrega
  );

  const pickupTime = cleanText(
    getBodyValue(body, ["pickupTime", "pickup_time"]) ||
      getNestedBodyValue(body, ["booking.pickupTime", "booking.pickup_time"]) ||
      contractData?.horaEntrega
  );

  const dropoffDate = cleanText(
    getBodyValue(body, ["dropoffDate", "dropoff_date", "to"]) ||
      getNestedBodyValue(body, [
        "booking.dropoffDate",
        "booking.dropoff_date",
      ]) ||
      contractData?.fechaDevolucion
  );

  const dropoffTime = cleanText(
    getBodyValue(body, ["dropoffTime", "dropoff_time"]) ||
      getNestedBodyValue(body, [
        "booking.dropoffTime",
        "booking.dropoff_time",
      ]) ||
      contractData?.horaDevolucion
  );

  const customerName = cleanText(
    getBodyValue(body, ["customerName", "customer_name", "name"]) ||
      getNestedBodyValue(body, [
        "booking.customerName",
        "booking.customer_name",
        "booking.name",
      ]) ||
      contractData?.nombreCliente
  );

  const customerEmail = cleanText(
    getBodyValue(body, ["customerEmail", "customer_email", "email"]) ||
      getNestedBodyValue(body, [
        "booking.customerEmail",
        "booking.customer_email",
        "booking.email",
      ]) ||
      contractData?.email
  );

  const phone = cleanText(
    getBodyValue(body, ["phone", "telefono", "customerPhone"]) ||
      getNestedBodyValue(body, [
        "booking.phone",
        "booking.telefono",
        "booking.customerPhone",
      ]) ||
      contractData?.telefono
  );

  const amountRaw =
    getBodyValue(body, ["amount", "total", "totalPrice", "price"]) ||
    getNestedBodyValue(body, [
      "booking.amount",
      "booking.total",
      "booking.totalPrice",
      "booking.price",
    ]) ||
    contractData?.total;

  const amount =
    typeof amountRaw === "number" && amountRaw > 999
      ? amountRaw
      : cleanMoneyToCents(amountRaw);

  const paymentMethod = normalizePaymentMethod(
    getBodyValue(body, ["paymentMethod", "payment_method", "metodoPago"]) ||
      getNestedBodyValue(body, [
        "booking.paymentMethod",
        "booking.payment_method",
        "booking.metodoPago",
      ]) ||
      contractData?.paymentMethod ||
      contractData?.metodoPago ||
      "card"
  );

  const source = cleanText(
    getBodyValue(body, ["source"]) ||
      getNestedBodyValue(body, ["booking.source"]) ||
      "website"
  );

  const contractNumber = cleanText(
    getBodyValue(body, ["contractNumber", "contract_number"]) ||
      getNestedBodyValue(body, [
        "booking.contractNumber",
        "booking.contract_number",
      ]) ||
      contractData?.numeroContrato ||
      stripePaymentIntentId ||
      fallbackId
  );

  return {
    stripePaymentIntentId,
    status,
    source,
    bookingAction,

    customerName,
    customerEmail,
    phone,

    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,

    vehicleId,
    vehicleName,
    vehicleCode: normalizeVehicleCode(rawVehicleCode),
    assignedVehicleCode,
    fleetGroup,

    amount,
    currency: cleanText(getBodyValue(body, ["currency"]) || "eur"),

    paymentMethod,
    paymentStatus: paymentMethod === "unpaid" ? "unpaid" : "paid",

    contractNumber,
  };
}

async function checkAvailability({
  requestedGroup,
  requestedVehicleCode,
  selectedStart,
  selectedEnd,
}: {
  requestedGroup: NexaFleetGroup;
  requestedVehicleCode: string;
  selectedStart: Date;
  selectedEnd: Date;
}) {
  const selectedBufferedEnd = addMinutes(
    selectedEnd,
    BUFFER_MINUTES_AFTER_BOOKING
  );

  const fleet = getFleetByGroup(requestedGroup);

  if (!fleet.length) {
    return {
      available: false,
      reason: "fleet_not_found",
      totalFleet: 0,
      bookedCount: 0,
      availableCount: 0,
      bookedVehicleCodes: [] as string[],
      availableVehicles: [] as NexaVehicle[],
      assignedVehicle: null as NexaVehicle | null,
      overlappingBookings: [] as BookingRow[],
    };
  }

  const fleetCodes = fleet.map((vehicle) => vehicle.codigo);

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw new Error(error.message);

  const bookings = Array.isArray(data) ? (data as BookingRow[]) : [];

  const blockingBookings = bookings.filter((booking) => {
    if (isInactiveBooking(booking.status)) return false;
    if (isPastBooking(booking)) return false;

    const bookingGroup = resolveBookingFleetGroup(booking);
    if (bookingGroup !== requestedGroup) return false;

    const bookingVehicleCode = getBookingVehicleCode(booking);
    if (!fleetCodes.includes(bookingVehicleCode)) return false;

    const range = getBookingRange(booking);
    if (!range) return false;

    return isOverlapping(
      selectedStart,
      selectedBufferedEnd,
      range.start,
      range.bufferedEnd
    );
  });

  const bookedVehicleCodes = Array.from(
    new Set(blockingBookings.map(getBookingVehicleCode).filter(Boolean))
  );

  const normalizedRequestedVehicleCode = normalizeVehicleCode(
    requestedVehicleCode
  );

  if (
    normalizedRequestedVehicleCode &&
    fleetCodes.includes(normalizedRequestedVehicleCode) &&
    bookedVehicleCodes.includes(normalizedRequestedVehicleCode)
  ) {
    return {
      available: false,
      reason: "exact_vehicle_conflict",
      totalFleet: fleet.length,
      bookedCount: bookedVehicleCodes.length,
      availableCount: 0,
      bookedVehicleCodes,
      availableVehicles: [] as NexaVehicle[],
      assignedVehicle: null as NexaVehicle | null,
      overlappingBookings: blockingBookings,
    };
  }

  let availableVehicles = fleet.filter(
    (vehicle) => !bookedVehicleCodes.includes(vehicle.codigo)
  );

  if (
    normalizedRequestedVehicleCode &&
    fleetCodes.includes(normalizedRequestedVehicleCode)
  ) {
    availableVehicles = availableVehicles.filter(
      (vehicle) => vehicle.codigo === normalizedRequestedVehicleCode
    );
  }

  const assignedVehicle = availableVehicles[0] || null;

  return {
    available: availableVehicles.length > 0,
    reason: availableVehicles.length > 0 ? "available" : "fleet_group_full",
    totalFleet: fleet.length,
    bookedCount: bookedVehicleCodes.length,
    availableCount: availableVehicles.length,
    bookedVehicleCodes,
    availableVehicles,
    assignedVehicle,
    overlappingBookings: blockingBookings,
  };
}

function normalizeBookingForDashboard(row: any) {
  const vehicleName = cleanText(row.vehicle_name);
  const assignedVehicleCode = normalizeVehicleCode(
    row.assigned_vehicle_code ||
      row.vehicle_code ||
      row.scooter_code ||
      extractVehicleCodeFromText(String(vehicleName || ""))
  );

  const vehicle = findVehicleByCodigo(assignedVehicleCode);

  const fleetGroup =
    (cleanText(row.fleet_group) as NexaFleetGroup) ||
    resolveVehicleFleetGroup(vehicle) ||
    resolveFleetGroupKeyFromWebsiteVehicle({
      vehicleId: row.vehicle_id || row.vehicle_code,
      vehicleName,
    });

  const amountCents = Number(row.amount || 0);
  const customerName = cleanText(row.customer_name) || "Customer";

  const createdAt =
    cleanText(row.created_at) ||
    cleanText(row.createdAt) ||
    new Date().toISOString();

  const paymentMethod = normalizePaymentMethod(row.payment_method);

  const bookingAction = normalizeBookingAction(
    row.booking_action || row.bookingAction || row.status
  );

  const status = normalizeBookingStatus(row.status, bookingAction);

  const contractNumber =
    cleanText(row.contract_number) ||
    cleanText(row.stripe_payment_intent_id) ||
    cleanText(row.id);

  const rawSource = cleanText(row.source);
  const paymentIntentId = cleanText(row.stripe_payment_intent_id);
  const looksManual =
    safeNormalizeText(rawSource) === "manual" ||
    /^NX-\d+$/i.test(paymentIntentId) ||
    /^NX-\d+$/i.test(contractNumber);

  const source = looksManual ? "Manual" : rawSource || "website";

  const resolvedVehicleName =
    vehicleName ||
    (vehicle
      ? vehicleDisplayName(vehicle)
      : getFleetGroupDisplayName(fleetGroup));

  return {
    ...row,

    id: cleanText(row.id) || cleanText(row.stripe_payment_intent_id),
    createdAt,
    created_at: createdAt,

    source,
    status,
    booking_action: bookingAction,
    bookingAction,

    stripe_payment_intent_id: cleanText(row.stripe_payment_intent_id),

    customer_name: customerName,
    customer_email: cleanText(row.customer_email),
    phone: cleanText(row.phone),

    pickup_date: cleanText(row.pickup_date),
    pickup_time: cleanText(row.pickup_time),
    dropoff_date: cleanText(row.dropoff_date),
    dropoff_time: cleanText(row.dropoff_time),

    vehicle_id: cleanText(row.vehicle_id),
    vehicle_name: resolvedVehicleName,
    vehicle_code: assignedVehicleCode,
    assigned_vehicle_code: assignedVehicleCode,
    scooter_code: assignedVehicleCode,
    fleet_group: fleetGroup,

    amount: amountCents,
    amount_eur: amountCents / 100,
    currency: cleanText(row.currency || "eur"),

    payment_method: paymentMethod,
    payment_status: cleanText(row.payment_status || "paid"),

    contract_number: contractNumber,

    vehicle: {
      codigo: assignedVehicleCode,
      matricula: vehicle?.matricula || "",
      marca:
        vehicle?.marca ||
        (resolvedVehicleName.toLowerCase().includes("sym") ? "SYM" : "Piaggio"),
      modelo:
        vehicle?.modelo ||
        (resolvedVehicleName.toLowerCase().includes("sym")
          ? "Symphony 125"
          : "Liberty 125"),
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
      bookingAction,
      assignedVehicleCode,
      fleetGroup,
    },

    contractPdf: buildContractPdfFromRow(row),
  };
}

function buildContractPdfFromRow(row: any) {
  const storagePath = cleanText(row.contract_pdf_path);
  const driveLink = cleanText(row.google_drive_file_link);

  if (!storagePath && !driveLink) return undefined;

  return {
    fileName: cleanText(row.contract_pdf_name) || undefined,
    storagePath: storagePath || undefined,
    drive: driveLink
      ? {
          uploaded: true,
          webViewLink: driveLink,
          webContentLink: driveLink,
          fileName: cleanText(row.contract_pdf_name) || undefined,
        }
      : undefined,
  };
}

function fallbackPayloadWithoutModernColumns(payload: any) {
  const {
    booking_action,
    vehicle_id,
    assigned_vehicle_code,
    scooter_code,
    fleet_group,
    payment_method,
    payment_status,
    contract_number,
    source,
    ...rest
  } = payload;

  return rest;
}

function fallbackPayloadWithoutBookingAction(payload: any) {
  const { booking_action, ...rest } = payload;
  return rest;
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

function resolvePatchAction(action: unknown) {
  const clean = safeNormalizeText(action);

  if (
    clean === "cancel" ||
    clean === "cancelled" ||
    clean === "canceled" ||
    clean === "cancelada"
  ) {
    return {
      status: "cancelled",
      booking_action: "reserve_now" as BookingAction,
    };
  }

  if (
    clean === "picked_up" ||
    clean === "picked up" ||
    clean === "rent_now" ||
    clean === "rented_out" ||
    clean === "rented"
  ) {
    return {
      status: "rented_out",
      booking_action: "rent_now" as BookingAction,
    };
  }

  if (
    clean === "returned" ||
    clean === "return" ||
    clean === "finished" ||
    clean === "completed" ||
    clean === "finalizada"
  ) {
    return {
      status: "returned",
      booking_action: "rent_now" as BookingAction,
    };
  }

  if (clean === "reserved" || clean === "reserve_now") {
    return {
      status: "reserved",
      booking_action: "reserve_now" as BookingAction,
    };
  }

  return null;
}

function buildPatchFilters(body: any) {
  const stripePaymentIntentId = cleanText(
    body?.stripePaymentIntentId ||
      body?.stripe_payment_intent_id ||
      body?.paymentIntentId ||
      body?.payment_intent_id ||
      body?.key ||
      body?.bookingKey
  );

  const contractNumber = cleanText(
    body?.contractNumber ||
      body?.contract_number ||
      body?.numeroContrato ||
      body?.booking?.contractData?.numeroContrato ||
      body?.booking?.contractNumber
  );

  const bookingId = cleanText(
    body?.bookingId ||
      body?.booking_id ||
      body?.id ||
      body?.booking?.id ||
      body?.booking?.key
  );

  return {
    stripePaymentIntentId,
    contractNumber,
    bookingId,
  };
}

async function updateBookingByFilters({
  filters,
  payload,
}: {
  filters: ReturnType<typeof buildPatchFilters>;
  payload: any;
}): Promise<SupabaseWriteResult> {
  let firstError: any = null;

  async function tryUpdate(column: string, value: string | number) {
    const result: any = await supabaseAdmin
      .from("bookings")
      .update(payload)
      .eq(column, value)
      .select();

    if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
      return result;
    }

    if (result.error && !firstError) firstError = result.error;
    return null;
  }

  if (filters.stripePaymentIntentId) {
    const result = await tryUpdate(
      "stripe_payment_intent_id",
      filters.stripePaymentIntentId
    );
    if (result) return result;
  }

  if (filters.contractNumber) {
    const result = await tryUpdate("contract_number", filters.contractNumber);
    if (result) return result;
  }

  if (filters.bookingId) {
    const numericId = Number(filters.bookingId);
    const idValue = Number.isFinite(numericId) ? numericId : filters.bookingId;

    const byId = await tryUpdate("id", idValue);
    if (byId) return byId;

    const byPayment = await tryUpdate(
      "stripe_payment_intent_id",
      filters.bookingId
    );
    if (byPayment) return byPayment;

    const byContract = await tryUpdate("contract_number", filters.bookingId);
    if (byContract) return byContract;
  }

  if (firstError) {
    return {
      data: null,
      error: firstError,
    };
  }

  return {
    data: [],
    error: null,
  };
}

async function saveBookingPayload(payload: any): Promise<SupabaseWriteResult> {
  let result: any = await supabaseAdmin
    .from("bookings")
    .upsert(payload, { onConflict: "stripe_payment_intent_id" })
    .select();

  if (!result.error) return result;

  console.warn(
    "BOOKINGS POST FULL PAYLOAD FAILED, TRYING WITHOUT booking_action:",
    result.error?.message || result.error
  );

  result = await supabaseAdmin
    .from("bookings")
    .upsert(fallbackPayloadWithoutBookingAction(payload), {
      onConflict: "stripe_payment_intent_id",
    })
    .select();

  if (!result.error) return result;

  console.warn(
    "BOOKINGS POST WITHOUT booking_action FAILED, TRYING WITHOUT MODERN COLUMNS:",
    result.error?.message || result.error
  );

  result = await supabaseAdmin
    .from("bookings")
    .upsert(fallbackPayloadWithoutModernColumns(payload), {
      onConflict: "stripe_payment_intent_id",
    })
    .select();

  if (!result.error) return result;

  console.warn(
    "BOOKINGS POST MODERN PAYLOAD FAILED, TRYING OLD TABLE FALLBACK:",
    result.error?.message || result.error
  );

  result = await supabaseAdmin
    .from("bookings")
    .upsert(fallbackPayloadForOldBookingsTable(payload), {
      onConflict: "stripe_payment_intent_id",
    })
    .select();

  return result;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("BOOKINGS GET ERROR:", error);

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
    console.error("BOOKINGS GET FAILED:", error);

    return NextResponse.json({
      ok: false,
      bookings: [],
      error: error?.message || "Failed to load bookings.",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    if (!input.vehicleName && !input.vehicleCode && !input.vehicleId) {
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

    const availability = await checkAvailability({
      requestedGroup: input.fleetGroup,
      requestedVehicleCode: input.assignedVehicleCode || input.vehicleCode,
      selectedStart,
      selectedEnd,
    });

    const fleetLabel = getFleetGroupDisplayName(input.fleetGroup);

    if (!availability.available || !availability.assignedVehicle) {
      return NextResponse.json(
        {
          ok: false,
          available: false,
          error:
            availability.reason === "exact_vehicle_conflict"
              ? `Vehicle ${
                  input.assignedVehicleCode || input.vehicleCode
                } is already booked for the selected dates.`
              : `${fleetLabel} is not available for the selected dates. Please change your dates or choose another vehicle.`,
          fleetGroup: input.fleetGroup,
          reason: availability.reason,
          totalFleet: availability.totalFleet,
          bookedCount: availability.bookedCount,
          availableCount: availability.availableCount,
          bookedVehicleCodes: availability.bookedVehicleCodes,
          bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
        },
        { status: 409 }
      );
    }

    const assignedVehicle = availability.assignedVehicle;
    const assignedVehicleCode = assignedVehicle.codigo;
    const assignedVehicleDisplayName = vehicleDisplayName(assignedVehicle);
    const publicVehicleName = getVehiclePublicName(assignedVehicle);

    const payload = {
      stripe_payment_intent_id: input.stripePaymentIntentId,
      status: input.status,
      booking_action: input.bookingAction,

      customer_name: input.customerName,
      customer_email: input.customerEmail,
      phone: input.phone,

      pickup_date: input.pickupDate,
      pickup_time: input.pickupTime,
      dropoff_date: input.dropoffDate,
      dropoff_time: input.dropoffTime,

      vehicle_id: input.vehicleId,
      vehicle_name:
        assignedVehicleDisplayName || input.vehicleName || publicVehicleName,
      vehicle_code: assignedVehicleCode,
      assigned_vehicle_code: assignedVehicleCode,
      scooter_code: assignedVehicleCode,
      fleet_group: input.fleetGroup,

      amount: input.amount,
      currency: input.currency,

      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,

      source: input.source,
      contract_number: input.contractNumber,
    };

    const { data, error } = await saveBookingPayload(payload);

    if (error) {
      console.error("BOOKINGS POST ERROR:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error?.message || "Failed to save booking.",
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
      assignedVehicleCode,
      assignedVehicleName: publicVehicleName,
      assignedVehicleShortName: vehicleShortName(assignedVehicle),
      assignedVehicleDisplayName,
      availability: {
        fleetGroup: input.fleetGroup,
        totalFleet: availability.totalFleet,
        bookedCount: availability.bookedCount + 1,
        availableCount: Math.max(0, availability.availableCount - 1),
        bookedVehicleCodes: [
          ...availability.bookedVehicleCodes,
          assignedVehicleCode,
        ],
        bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
      },
    });
  } catch (error: any) {
    console.error("BOOKINGS POST FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to save booking.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const actionResult = resolvePatchAction(body?.action || body?.status);

    if (!actionResult) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid action. Use cancel, picked_up, returned, rented_out or reserved.",
        },
        { status: 400 }
      );
    }

    const filters = buildPatchFilters(body);

    if (
      !filters.stripePaymentIntentId &&
      !filters.contractNumber &&
      !filters.bookingId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing booking identifier. Send stripePaymentIntentId, contractNumber or bookingId.",
        },
        { status: 400 }
      );
    }

    const fullPayload = {
      status: actionResult.status,
      booking_action: actionResult.booking_action,
    };

    let result = await updateBookingByFilters({
      filters,
      payload: fullPayload,
    });

    if (result.error) {
      console.warn(
        "BOOKINGS PATCH FULL PAYLOAD FAILED, TRYING STATUS ONLY:",
        result.error?.message || result.error
      );

      result = await updateBookingByFilters({
        filters,
        payload: {
          status: actionResult.status,
        },
      });
    }

    if (result.error) {
      console.error("BOOKINGS PATCH ERROR:", result.error);

      return NextResponse.json(
        {
          ok: false,
          error: result.error?.message || "Failed to update booking.",
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(result.data) || result.data.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Booking not found in Supabase.",
          filters,
        },
        { status: 404 }
      );
    }

    const updatedBooking = normalizeBookingForDashboard(result.data[0]);

    return NextResponse.json({
      ok: true,
      booking: updatedBooking,
      updated: result.data.length,
    });
  } catch (error: any) {
    console.error("BOOKINGS PATCH FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to update booking.",
      },
      { status: 500 }
    );
  }
}
