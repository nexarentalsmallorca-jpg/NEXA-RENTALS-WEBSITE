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
  | "kymco_sky_town_125"
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
  booking_source?: string | null;
  booking_status?: string | null;
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
  public_vehicle_name?: string | null;
  vehicle_id?: string | null;
  vehicle_code?: string | null;
  assigned_vehicle_code?: string | null;
  assigned_vehicle_codes?: string[] | null;
  scooter_code?: string | null;
  fleet_group?: string | null;
  quantity?: number | null;
  amount?: number | null;
  total_amount?: number | null;
  amount_paid?: number | null;
  currency?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  reservation_payment_status?: string | null;
  contract_number?: string | null;
  contract_pdf_path?: string | null;
  contract_pdf_name?: string | null;
  google_drive_file_link?: string | null;
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

type AvailabilityResult = {
  available: boolean;
  reason: string;
  totalFleet: number;
  bookedCount: number;
  availableCount: number;
  bookedVehicleCodes: string[];
  availableVehicles: NexaVehicle[];
  assignedVehicle: NexaVehicle | null;
  overlappingBookings: BookingRow[];
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;

const NON_BLOCKING_STATUSES = [
  "cancelled",
  "canceled",
  "rejected",
  "refunded",
  "expired",
  "failed",
  "payment_failed",
  "completed",
  "finished",
  "closed",
  "deleted",
  "returned",
  "finalizada",
];

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeVehicleCode(value?: unknown) {
  return cleanText(value).toUpperCase().replace(/\s+/g, "");
}

function safeNormalizeText(value: unknown) {
  return normalizeVehicleText(cleanText(value));
}

function cleanMoneyToCents(value?: string | number) {
  if (value === undefined || value === null || value === "") return 0;

  const cleaned = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(cleaned);
  return Number.isFinite(amount) ? Math.max(0, Math.round(amount * 100)) : 0;
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
  bookedEnd: Date,
) {
  return selectedStart < bookedEnd && bookedStart < selectedEnd;
}

function isInactiveBooking(status?: string | null) {
  const clean = safeNormalizeText(status);
  return Boolean(clean && NON_BLOCKING_STATUSES.includes(clean));
}

function isPastBooking(booking: BookingRow) {
  const range = getBookingRange(booking);
  return Boolean(range && new Date() > range.bufferedEnd);
}

function getKymcoFleet() {
  return getScooterFleet().filter(
    (vehicle) => normalizeVehicleCode(vehicle.codigo) === "N9",
  );
}

function getFleetByGroup(group: NexaFleetGroup) {
  if (group === "piaggio_liberty_125") return getPiaggioFleet();
  if (group === "kymco_sky_town_125") return getKymcoFleet();
  if (group === "sym_symphony_125") return getSymFleet();
  if (group === "e_bike") return getEBikeFleet();
  return getScooterFleet();
}

function getFleetGroupDisplayName(group: NexaFleetGroup) {
  if (group === "piaggio_liberty_125") return "Piaggio Liberty 125";
  if (group === "kymco_sky_town_125") return "KYMCO Sky Town 125";
  if (group === "sym_symphony_125") return "SYM Symphony 125";
  if (group === "e_bike") return "E-Bike";
  return "Scooter";
}

function getVehiclePublicName(vehicle: NexaVehicle) {
  return `${vehicle.marca} ${vehicle.modelo}`;
}

function resolveVehicleFleetGroup(
  vehicle?: NexaVehicle | null,
): NexaFleetGroup {
  if (!vehicle) return "scooter";

  const brand = safeNormalizeText(vehicle.marca);
  const model = safeNormalizeText(vehicle.modelo);
  const code = normalizeVehicleCode(vehicle.codigo);

  if (vehicle.tipo === "E-Bike") return "e_bike";

  if (
    code === "N9" ||
    brand === "kymco" ||
    model.includes("sky town") ||
    model.includes("sky-town") ||
    model.includes("skytown")
  ) {
    return "kymco_sky_town_125";
  }

  if (brand === "sym") return "sym_symphony_125";
  if (brand === "piaggio") return "piaggio_liberty_125";
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

  if (cleanFleetGroup === "piaggio_liberty_125") {
    return "piaggio_liberty_125";
  }
  if (cleanFleetGroup === "kymco_sky_town_125") {
    return "kymco_sky_town_125";
  }
  if (cleanFleetGroup === "sym_symphony_125") {
    return "sym_symphony_125";
  }
  if (cleanFleetGroup === "e_bike") return "e_bike";

  const exactCode =
    extractVehicleCodeFromText(String(vehicleId || "")) ||
    extractVehicleCodeFromText(String(vehicleName || ""));
  const exactVehicle = findVehicleByCodigo(exactCode);
  if (exactVehicle) return resolveVehicleFleetGroup(exactVehicle);

  const kymcoText = `${cleanId} ${cleanName}`;
  if (
    cleanId === "s4" ||
    cleanId === "n9" ||
    kymcoText.includes("kymco") ||
    kymcoText.includes("sky town") ||
    kymcoText.includes("sky-town") ||
    kymcoText.includes("skytown")
  ) {
    return "kymco_sky_town_125";
  }

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
  const firstArrayCode = Array.isArray(booking.assigned_vehicle_codes)
    ? booking.assigned_vehicle_codes[0]
    : "";

  return normalizeVehicleCode(
    firstArrayCode ||
      booking.assigned_vehicle_code ||
      booking.vehicle_code ||
      booking.scooter_code ||
      booking.vehicle?.codigo ||
      booking.vehicle?.code ||
      extractVehicleCodeFromText(String(booking.vehicle_name || "")),
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
  if (raw.includes("cash") || raw.includes("efectivo")) return "cash";
  if (
    raw.includes("card") ||
    raw.includes("tarjeta") ||
    raw.includes("stripe")
  ) {
    return "card";
  }
  if (
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
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function getNestedBodyValue(body: any, keys: string[]) {
  for (const key of keys) {
    let current = body;
    for (const part of key.split(".")) current = current?.[part];
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
    booking?.status;

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
      fallbackId,
  );

  const vehicleId = cleanText(
    getBodyValue(body, ["vehicleId", "vehicle_id"]) ||
      getNestedBodyValue(body, ["booking.vehicleId", "booking.vehicle_id"]),
  );
  const vehicleName = cleanText(
    getBodyValue(body, [
      "vehicleName",
      "vehicle",
      "vehicle_name",
      "assignedVehicleDisplayName",
    ]) ||
      getNestedBodyValue(body, [
        "booking.vehicleName",
        "booking.vehicle_name",
        "booking.assignedVehicleDisplayName",
      ]) ||
      [vehicle?.codigo, vehicle?.matricula, vehicle?.marca, vehicle?.modelo]
        .filter(Boolean)
        .join(" · "),
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
      extractVehicleCodeFromText(vehicleName),
  );
  const assignedVehicleCode = normalizeVehicleCode(
    getBodyValue(body, ["assignedVehicleCode", "assigned_vehicle_code"]) ||
      getNestedBodyValue(body, [
        "booking.assignedVehicleCode",
        "booking.assigned_vehicle_code",
      ]) ||
      rawVehicleCode,
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
      contractData?.fechaEntrega,
  );
  const pickupTime = cleanText(
    getBodyValue(body, ["pickupTime", "pickup_time"]) ||
      getNestedBodyValue(body, ["booking.pickupTime", "booking.pickup_time"]) ||
      contractData?.horaEntrega,
  );
  const dropoffDate = cleanText(
    getBodyValue(body, ["dropoffDate", "dropoff_date", "to"]) ||
      getNestedBodyValue(body, [
        "booking.dropoffDate",
        "booking.dropoff_date",
      ]) ||
      contractData?.fechaDevolucion,
  );
  const dropoffTime = cleanText(
    getBodyValue(body, ["dropoffTime", "dropoff_time"]) ||
      getNestedBodyValue(body, [
        "booking.dropoffTime",
        "booking.dropoff_time",
      ]) ||
      contractData?.horaDevolucion,
  );
  const customerName = cleanText(
    getBodyValue(body, ["customerName", "customer_name", "name"]) ||
      getNestedBodyValue(body, [
        "booking.customerName",
        "booking.customer_name",
        "booking.name",
      ]) ||
      contractData?.nombreCliente,
  );
  const customerEmail = cleanText(
    getBodyValue(body, ["customerEmail", "customer_email", "email"]) ||
      getNestedBodyValue(body, [
        "booking.customerEmail",
        "booking.customer_email",
        "booking.email",
      ]) ||
      contractData?.email,
  );
  const phone = cleanText(
    getBodyValue(body, ["phone", "telefono", "customerPhone"]) ||
      getNestedBodyValue(body, [
        "booking.phone",
        "booking.telefono",
        "booking.customerPhone",
      ]) ||
      contractData?.telefono,
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
      ? Math.round(amountRaw)
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
      "card",
  );
  const source = cleanText(
    getBodyValue(body, ["source"]) ||
      getNestedBodyValue(body, ["booking.source"]) ||
      "Manual",
  );
  const contractNumber = cleanText(
    getBodyValue(body, ["contractNumber", "contract_number"]) ||
      getNestedBodyValue(body, [
        "booking.contractNumber",
        "booking.contract_number",
      ]) ||
      contractData?.numeroContrato ||
      stripePaymentIntentId ||
      fallbackId,
  );

  return {
    stripePaymentIntentId,
    status: normalizeBookingStatus(rawStatus, bookingAction),
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

function emptyAvailability(reason: string): AvailabilityResult {
  return {
    available: false,
    reason,
    totalFleet: 0,
    bookedCount: 0,
    availableCount: 0,
    bookedVehicleCodes: [],
    availableVehicles: [],
    assignedVehicle: null,
    overlappingBookings: [],
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
}): Promise<AvailabilityResult> {
  const selectedBufferedEnd = addMinutes(
    selectedEnd,
    BUFFER_MINUTES_AFTER_BOOKING,
  );
  const fleet = getFleetByGroup(requestedGroup);
  if (!fleet.length) return emptyAvailability("fleet_not_found");

  const fleetCodes = fleet.map((vehicle) =>
    normalizeVehicleCode(vehicle.codigo),
  );
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);

  const bookings = Array.isArray(data) ? (data as BookingRow[]) : [];
  const blockingBookings = bookings.filter((booking) => {
    if (isInactiveBooking(booking.status)) return false;
    if (isInactiveBooking(booking.booking_status)) return false;
    if (isPastBooking(booking)) return false;
    if (resolveBookingFleetGroup(booking) !== requestedGroup) return false;

    const code = getBookingVehicleCode(booking);
    if (!fleetCodes.includes(code)) return false;
    const range = getBookingRange(booking);
    return Boolean(
      range &&
      isOverlapping(
        selectedStart,
        selectedBufferedEnd,
        range.start,
        range.bufferedEnd,
      ),
    );
  });

  const bookedVehicleCodes = Array.from(
    new Set(blockingBookings.map(getBookingVehicleCode).filter(Boolean)),
  );
  const requestedCode = normalizeVehicleCode(requestedVehicleCode);
  const requestedConflict = Boolean(
    requestedCode &&
    fleetCodes.includes(requestedCode) &&
    bookedVehicleCodes.includes(requestedCode),
  );

  let availableVehicles = fleet.filter(
    (vehicle) =>
      !bookedVehicleCodes.includes(normalizeVehicleCode(vehicle.codigo)),
  );
  if (requestedCode && fleetCodes.includes(requestedCode)) {
    availableVehicles = availableVehicles.filter(
      (vehicle) => normalizeVehicleCode(vehicle.codigo) === requestedCode,
    );
  }

  return {
    available: availableVehicles.length > 0,
    reason: requestedConflict
      ? "exact_vehicle_conflict"
      : availableVehicles.length
        ? "available"
        : "fleet_group_full",
    totalFleet: fleet.length,
    bookedCount: bookedVehicleCodes.length,
    availableCount: availableVehicles.length,
    bookedVehicleCodes,
    availableVehicles,
    assignedVehicle: availableVehicles[0] || null,
    overlappingBookings: blockingBookings,
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

function normalizeBookingForDashboard(row: any) {
  const vehicleName = cleanText(row.vehicle_name);
  const assignedVehicleCode = getBookingVehicleCode(row);
  const vehicle = findVehicleByCodigo(assignedVehicleCode);
  const fleetGroup = resolveFleetGroupKeyFromWebsiteVehicle({
    vehicleId:
      row.vehicle_id ||
      row.vehicle_code ||
      row.assigned_vehicle_code ||
      assignedVehicleCode,
    vehicleName: [vehicleName, vehicle?.marca, vehicle?.modelo]
      .filter(Boolean)
      .join(" "),
    fleetGroup: row.fleet_group,
  });
  const amountCents = Number(row.amount || row.total_amount || 0);
  const customerName = cleanText(row.customer_name) || "Customer";
  const createdAt =
    cleanText(row.created_at) ||
    cleanText(row.createdAt) ||
    new Date().toISOString();
  const paymentMethod = normalizePaymentMethod(row.payment_method);
  const bookingAction = normalizeBookingAction(
    row.booking_action || row.bookingAction || row.status,
  );
  const status = normalizeBookingStatus(row.status, bookingAction);
  const contractNumber =
    cleanText(row.contract_number) ||
    cleanText(row.stripe_payment_intent_id) ||
    cleanText(row.id);
  const rawSource = cleanText(row.source || row.booking_source);
  const paymentIntentId = cleanText(row.stripe_payment_intent_id);
  const looksManual =
    safeNormalizeText(rawSource).includes("manual") ||
    /^NX-/i.test(paymentIntentId) ||
    /^NX-/i.test(contractNumber);
  const source = looksManual ? "Manual" : rawSource || "website";
  const resolvedVehicleName =
    vehicleName ||
    (vehicle
      ? vehicleDisplayName(vehicle)
      : getFleetGroupDisplayName(fleetGroup));

  return {
    ...row,
    id: cleanText(row.id) || paymentIntentId,
    createdAt,
    created_at: createdAt,
    source,
    status,
    booking_action: bookingAction,
    bookingAction,
    stripe_payment_intent_id: paymentIntentId,
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
    assigned_vehicle_codes: assignedVehicleCode ? [assignedVehicleCode] : [],
    scooter_code: assignedVehicleCode,
    fleet_group: fleetGroup,
    quantity: Math.max(1, Number(row.quantity || 1)),
    amount: amountCents,
    amount_eur: amountCents / 100,
    currency: cleanText(row.currency || "eur"),
    payment_method: paymentMethod,
    payment_status: cleanText(
      row.payment_status || row.reservation_payment_status || "paid",
    ),
    contract_number: contractNumber,
    vehicle: {
      codigo: assignedVehicleCode,
      matricula: vehicle?.matricula || "",
      marca:
        vehicle?.marca ||
        (fleetGroup === "kymco_sky_town_125"
          ? "KYMCO"
          : fleetGroup === "sym_symphony_125"
            ? "SYM"
            : fleetGroup === "piaggio_liberty_125"
              ? "Piaggio"
              : ""),
      modelo:
        vehicle?.modelo ||
        (fleetGroup === "kymco_sky_town_125"
          ? "Sky Town 125"
          : fleetGroup === "sym_symphony_125"
            ? "Symphony 125"
            : fleetGroup === "piaggio_liberty_125"
              ? "Liberty 125"
              : "Scooter"),
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

function fallbackPayloadWithoutOptionalColumns(payload: any) {
  const {
    booking_action,
    assigned_vehicle_codes,
    public_vehicle_name,
    total_amount,
    amount_paid,
    reservation_payment_status,
    updated_at,
    ...rest
  } = payload;
  return rest;
}

function fallbackPayloadWithoutModernColumns(payload: any) {
  const {
    booking_action,
    booking_source,
    booking_status,
    vehicle_id,
    assigned_vehicle_code,
    assigned_vehicle_codes,
    scooter_code,
    fleet_group,
    quantity,
    public_vehicle_name,
    payment_method,
    payment_status,
    reservation_payment_status,
    contract_number,
    total_amount,
    amount_paid,
    updated_at,
    ...rest
  } = payload;
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

async function saveBookingPayload(payload: any): Promise<SupabaseWriteResult> {
  const payloads = [
    payload,
    fallbackPayloadWithoutOptionalColumns(payload),
    fallbackPayloadWithoutModernColumns(payload),
    fallbackPayloadForOldBookingsTable(payload),
  ];

  let lastResult: any = { data: null, error: null };
  for (const candidate of payloads) {
    lastResult = await supabaseAdmin
      .from("bookings")
      .upsert(candidate, { onConflict: "stripe_payment_intent_id" })
      .select();

    if (!lastResult.error) return lastResult;
    console.warn(
      "BOOKINGS POST PAYLOAD FALLBACK:",
      lastResult.error?.message || lastResult.error,
    );
  }

  return lastResult;
}

function resolvePatchAction(action: unknown) {
  const clean = safeNormalizeText(action);
  if (["cancel", "cancelled", "canceled", "cancelada"].includes(clean)) {
    return {
      status: "cancelled",
      booking_action: "reserve_now" as BookingAction,
    };
  }
  if (
    ["picked_up", "picked up", "rent_now", "rented_out", "rented"].includes(
      clean,
    )
  ) {
    return {
      status: "rented_out",
      booking_action: "rent_now" as BookingAction,
    };
  }
  if (
    ["returned", "return", "finished", "completed", "finalizada"].includes(
      clean,
    )
  ) {
    return { status: "returned", booking_action: "rent_now" as BookingAction };
  }
  if (["reserved", "reserve_now"].includes(clean)) {
    return {
      status: "reserved",
      booking_action: "reserve_now" as BookingAction,
    };
  }
  return null;
}

function buildPatchFilters(body: any) {
  return {
    stripePaymentIntentId: cleanText(
      body?.stripePaymentIntentId ||
        body?.stripe_payment_intent_id ||
        body?.paymentIntentId ||
        body?.payment_intent_id ||
        body?.key ||
        body?.bookingKey,
    ),
    contractNumber: cleanText(
      body?.contractNumber ||
        body?.contract_number ||
        body?.numeroContrato ||
        body?.booking?.contractData?.numeroContrato ||
        body?.booking?.contractNumber,
    ),
    bookingId: cleanText(
      body?.bookingId ||
        body?.booking_id ||
        body?.id ||
        body?.booking?.id ||
        body?.booking?.key,
    ),
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
    if (!result.error && Array.isArray(result.data) && result.data.length) {
      return result;
    }
    if (result.error && !firstError) firstError = result.error;
    return null;
  }

  if (filters.stripePaymentIntentId) {
    const result = await tryUpdate(
      "stripe_payment_intent_id",
      filters.stripePaymentIntentId,
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
      filters.bookingId,
    );
    if (byPayment) return byPayment;
    const byContract = await tryUpdate("contract_number", filters.bookingId);
    if (byContract) return byContract;
  }

  return firstError
    ? { data: null, error: firstError }
    : { data: [], error: null };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);

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
        { ok: false, error: "Missing pickup date/time." },
        { status: 400 },
      );
    }
    if (!input.dropoffDate || !input.dropoffTime) {
      return NextResponse.json(
        { ok: false, error: "Missing drop-off date/time." },
        { status: 400 },
      );
    }

    const selectedStart = buildDateTime(input.pickupDate, input.pickupTime);
    const selectedEnd = buildDateTime(input.dropoffDate, input.dropoffTime);
    if (!selectedStart || !selectedEnd) {
      return NextResponse.json(
        { ok: false, error: "Invalid date or time." },
        { status: 400 },
      );
    }
    if (selectedEnd <= selectedStart) {
      return NextResponse.json(
        {
          ok: false,
          error: "Return date/time must be after pickup date/time.",
        },
        { status: 400 },
      );
    }

    const requestedCode = normalizeVehicleCode(
      input.assignedVehicleCode || input.vehicleCode,
    );
    const requestedVehicle = findVehicleByCodigo(requestedCode);
    if (!requestedVehicle) {
      return NextResponse.json(
        { ok: false, error: "Select a valid fleet vehicle from N1 to N9." },
        { status: 400 },
      );
    }

    const actualFleetGroup = resolveVehicleFleetGroup(requestedVehicle);
    let availability = emptyAvailability("availability_not_checked");
    let availabilityCheckFailed = false;

    /*
     * This is an admin-only booking endpoint. Availability is checked so the
     * response can warn the dashboard, but a conflict never rejects an admin
     * contract. Public checkout remains protected by its separate payment-hold
     * RPC and public availability route.
     */
    try {
      availability = await checkAvailability({
        requestedGroup: actualFleetGroup,
        requestedVehicleCode: requestedCode,
        selectedStart,
        selectedEnd,
      });
    } catch (availabilityError) {
      availabilityCheckFailed = true;
      console.warn("ADMIN BOOKING AVAILABILITY WARNING:", availabilityError);
    }

    const adminOverride =
      availabilityCheckFailed ||
      availability.reason === "exact_vehicle_conflict" ||
      availability.reason === "fleet_group_full";
    const assignedVehicle = requestedVehicle;
    const assignedVehicleCode = normalizeVehicleCode(assignedVehicle.codigo);
    const assignedVehicleDisplayName = vehicleDisplayName(assignedVehicle);
    const publicVehicleName = getVehiclePublicName(assignedVehicle);
    const nowIso = new Date().toISOString();

    const payload = {
      stripe_payment_intent_id: input.stripePaymentIntentId,
      status: input.status,
      booking_status: "confirmed",
      booking_action: input.bookingAction,
      booking_source: "manual_contract",
      customer_name: input.customerName,
      customer_email: input.customerEmail || null,
      phone: input.phone,
      pickup_date: input.pickupDate,
      pickup_time: input.pickupTime,
      dropoff_date: input.dropoffDate,
      dropoff_time: input.dropoffTime,
      vehicle_id: input.vehicleId,
      vehicle_name: assignedVehicleDisplayName || input.vehicleName,
      public_vehicle_name: publicVehicleName,
      vehicle_code: assignedVehicleCode,
      assigned_vehicle_code: assignedVehicleCode,
      assigned_vehicle_codes: [assignedVehicleCode],
      scooter_code: assignedVehicleCode,
      fleet_group: actualFleetGroup,
      quantity: 1,
      amount: input.amount,
      total_amount: input.amount,
      amount_paid: input.amount,
      currency: input.currency,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      reservation_payment_status: input.paymentStatus,
      contract_number: input.contractNumber,
      updated_at: nowIso,
    };

    const { data, error } = await saveBookingPayload(payload);
    if (error) {
      console.error("BOOKINGS POST ERROR:", error);
      return NextResponse.json(
        { ok: false, error: error?.message || "Failed to save booking." },
        { status: 500 },
      );
    }

    const savedBooking = data?.[0]
      ? normalizeBookingForDashboard(data[0])
      : null;
    const bookedVehicleCodes = Array.from(
      new Set([...availability.bookedVehicleCodes, assignedVehicleCode]),
    );

    return NextResponse.json({
      ok: true,
      available: availability.available,
      adminOverride,
      warning: adminOverride
        ? availabilityCheckFailed
          ? "The availability check could not be completed, but the admin contract was saved."
          : `Vehicle ${assignedVehicleCode} already had an overlapping booking. The admin contract was saved intentionally.`
        : "",
      booking: savedBooking,
      assignedVehicleCode,
      assignedVehicleName: publicVehicleName,
      assignedVehicleShortName: vehicleShortName(assignedVehicle),
      assignedVehicleDisplayName,
      availability: {
        fleetGroup: actualFleetGroup,
        reason: availability.reason,
        totalFleet: availability.totalFleet,
        bookedCount: bookedVehicleCodes.length,
        availableCount: Math.max(
          0,
          availability.totalFleet - bookedVehicleCodes.length,
        ),
        bookedVehicleCodes,
        bufferMinutes: BUFFER_MINUTES_AFTER_BOOKING,
        adminOverride,
      },
    });
  } catch (error: any) {
    console.error("BOOKINGS POST FAILED:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to save booking." },
      { status: 500 },
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
        { status: 400 },
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
        { status: 400 },
      );
    }

    let result = await updateBookingByFilters({
      filters,
      payload: {
        status: actionResult.status,
        booking_status:
          actionResult.status === "cancelled"
            ? "cancelled"
            : actionResult.status === "returned"
              ? "returned"
              : "confirmed",
        booking_action: actionResult.booking_action,
        updated_at: new Date().toISOString(),
      },
    });

    if (result.error) {
      console.warn(
        "BOOKINGS PATCH FULL PAYLOAD FAILED, TRYING STATUS ONLY:",
        result.error?.message || result.error,
      );
      result = await updateBookingByFilters({
        filters,
        payload: { status: actionResult.status },
      });
    }

    if (result.error) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error?.message || "Failed to update booking.",
        },
        { status: 500 },
      );
    }
    if (!Array.isArray(result.data) || result.data.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Booking not found in Supabase.", filters },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      booking: normalizeBookingForDashboard(result.data[0]),
      updated: result.data.length,
    });
  } catch (error: any) {
    console.error("BOOKINGS PATCH FAILED:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update booking." },
      { status: 500 },
    );
  }
}