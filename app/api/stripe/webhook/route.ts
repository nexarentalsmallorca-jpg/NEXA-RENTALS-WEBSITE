import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  extractVehicleCodeFromText,
  findVehicleByCodigo,
  resolveFleetGroupFromWebsiteVehicle,
  vehicleDisplayName,
  vehicleShortName,
} from "../../../../lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUFFER_MINUTES_AFTER_BOOKING = 60;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

const OWNER_EMAIL = process.env.OWNER_EMAIL!;
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  process.env.RESEND_FROM ||
  "onboarding@resend.dev";

type BookingRow = {
  id?: string | number;
  stripe_payment_intent_id?: string;
  status?: string | null;

  pickup_date?: string | null;
  pickup_time?: string | null;
  dropoff_date?: string | null;
  dropoff_time?: string | null;

  vehicle_name?: string | null;
  vehicle_code?: string | null;
  assigned_vehicle_code?: string | null;
  scooter_code?: string | null;

  source?: string | null;

  vehicle?: {
    codigo?: string | null;
    code?: string | null;
    matricula?: string | null;
    marca?: string | null;
    modelo?: string | null;
  } | null;
};

type AssignedVehicleResult = {
  assignedVehicleName: string;
  assignedVehicleCode: string;
  assignedVehicleMatricula: string;
  assignedVehicleShortName: string;
  assignedVehicleDisplayName: string;
  fleetGroup: string;
  publicVehicleName: string;
  totalFleet: number;
  bookedCount: number;
  availableCount: number;
  assignmentStatus: "assigned" | "unassigned";
  assignmentSource: "metadata" | "auto_fallback" | "failed";
};

function formatDate(dateString?: string) {
  if (!dateString) return "-";

  const d = new Date(dateString);

  if (Number.isNaN(d.getTime())) return dateString;

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

function safeText(value?: string | number | null) {
  if (value === undefined || value === null) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function moneyFromCents(value?: string | number | null) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) return "-";

  return (amount / 100).toFixed(2);
}

function cleanCurrency(value?: string | null) {
  return String(value || "eur").toUpperCase();
}

function cleanText(value?: string | number | null) {
  return String(value || "").trim();
}

function normalizeText(value?: string | number | null) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function normalizeVehicleCode(value?: string | number | null) {
  return cleanText(value).toUpperCase().replace(/\s+/g, "");
}

function buildDateTime(date?: string | null, time?: string | null) {
  if (!date || !time) return null;

  const value = new Date(`${date}T${time}`);

  if (Number.isNaN(value.getTime())) return null;

  return value;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) {
  return startA < endB && startB < endA;
}

function isInactiveStatus(status?: string | null) {
  const clean = normalizeText(status);

  return (
    clean.includes("cancel") ||
    clean.includes("cancelada") ||
    clean.includes("canceled") ||
    clean.includes("cancelled") ||
    clean.includes("failed") ||
    clean.includes("refunded") ||
    clean.includes("returned") ||
    clean.includes("finalizada") ||
    clean.includes("completed") ||
    clean.includes("finished") ||
    clean.includes("closed")
  );
}

function bookingRowOverlapsRequest(
  row: BookingRow,
  requestedStart: Date,
  requestedEnd: Date
) {
  const start = buildDateTime(row.pickup_date, row.pickup_time);
  const end = buildDateTime(row.dropoff_date, row.dropoff_time);

  if (!start || !end) return false;

  const existingBlockedEnd = addMinutes(end, BUFFER_MINUTES_AFTER_BOOKING);
  const requestedBlockedEnd = addMinutes(
    requestedEnd,
    BUFFER_MINUTES_AFTER_BOOKING
  );

  return isOverlapping(
    requestedStart,
    requestedBlockedEnd,
    start,
    existingBlockedEnd
  );
}

function getBookingVehicleCode(row: BookingRow) {
  return normalizeVehicleCode(
    row.assigned_vehicle_code ||
      row.vehicle_code ||
      row.scooter_code ||
      row.vehicle?.codigo ||
      row.vehicle?.code ||
      extractVehicleCodeFromText(row.vehicle_name || "")
  );
}

function resolveFleetFromMetadata(md: Stripe.Metadata) {
  const explicitFleetGroup = cleanText(md.fleet_group);

  if (explicitFleetGroup) {
    const cleanFleetGroup = normalizeText(explicitFleetGroup);

    if (cleanFleetGroup === "sym_symphony_125") {
      return resolveFleetGroupFromWebsiteVehicle({
        vehicleId: "s3",
        vehicleName: "SYM Symphony 125",
      });
    }

    if (cleanFleetGroup === "piaggio_liberty_125") {
      return resolveFleetGroupFromWebsiteVehicle({
        vehicleId: "s2",
        vehicleName: "Piaggio Liberty 125",
      });
    }
  }

  return resolveFleetGroupFromWebsiteVehicle({
    vehicleId: md.vehicle_id || "",
    vehicleName:
      md.public_vehicle_name ||
      md.vehicle_name ||
      md.assigned_vehicle_display_name ||
      "",
  });
}

function getVehicleNameForCustomer(md: Stripe.Metadata) {
  return (
    md.public_vehicle_name ||
    md.vehicle_name ||
    md.assigned_vehicle_display_name ||
    md.assigned_vehicle_name ||
    "Selected vehicle"
  );
}

async function getOverlappingBookings({
  requestedStart,
  requestedEnd,
  currentPaymentIntentId,
}: {
  requestedStart: Date;
  requestedEnd: Date;
  currentPaymentIntentId: string;
}) {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      stripe_payment_intent_id,
      status,
      source,
      pickup_date,
      pickup_time,
      dropoff_date,
      dropoff_time,
      vehicle_name,
      vehicle_code,
      assigned_vehicle_code,
      scooter_code,
      vehicle:vehicles (
        codigo,
        code,
        matricula,
        marca,
        modelo
      )
    `
    )
    .limit(1000);

  if (error) {
    console.error("ASSIGN VEHICLE SUPABASE ERROR:", error);
    throw error;
  }

  const rows = (data || []) as BookingRow[];

  return rows.filter((row) => {
    if (!row) return false;
    if (row.stripe_payment_intent_id === currentPaymentIntentId) return false;
    if (isInactiveStatus(row.status)) return false;

    return bookingRowOverlapsRequest(row, requestedStart, requestedEnd);
  });
}

async function assignFirstAvailableVehicle(
  pi: Stripe.PaymentIntent
): Promise<AssignedVehicleResult> {
  const md = pi.metadata || {};

  const requestedStart = buildDateTime(md.pickup_date, md.pickup_time);
  const requestedEnd = buildDateTime(md.dropoff_date, md.dropoff_time);

  const fleetGroup = resolveFleetFromMetadata(md);
  const fleet = fleetGroup.vehicles;
  const publicVehicleName = getVehicleNameForCustomer(md);

  const metadataAssignedCode = normalizeVehicleCode(
    md.assigned_vehicle_code || md.vehicle_code || ""
  );
  const metadataVehicle = findVehicleByCodigo(metadataAssignedCode);

  if (!requestedStart || !requestedEnd || fleet.length === 0) {
    return {
      assignedVehicleName:
        md.assigned_vehicle_display_name ||
        md.vehicle_name ||
        "UNASSIGNED · Vehicle",
      assignedVehicleCode: "",
      assignedVehicleMatricula: "",
      assignedVehicleShortName: "UNASSIGNED",
      assignedVehicleDisplayName:
        md.assigned_vehicle_display_name ||
        md.vehicle_name ||
        "UNASSIGNED · Vehicle",
      fleetGroup: md.fleet_group || fleetGroup.group,
      publicVehicleName,
      totalFleet: fleet.length,
      bookedCount: 0,
      availableCount: fleet.length,
      assignmentStatus: "unassigned",
      assignmentSource: "failed",
    };
  }

  let overlappingBookings: BookingRow[] = [];

  try {
    overlappingBookings = await getOverlappingBookings({
      requestedStart,
      requestedEnd,
      currentPaymentIntentId: pi.id,
    });
  } catch {
    return {
      assignedVehicleName: `UNASSIGNED · ${publicVehicleName}`,
      assignedVehicleCode: "",
      assignedVehicleMatricula: "",
      assignedVehicleShortName: "UNASSIGNED",
      assignedVehicleDisplayName: `UNASSIGNED · ${publicVehicleName}`,
      fleetGroup: md.fleet_group || fleetGroup.group,
      publicVehicleName,
      totalFleet: fleet.length,
      bookedCount: 0,
      availableCount: fleet.length,
      assignmentStatus: "unassigned",
      assignmentSource: "failed",
    };
  }

  const bookedCodes = new Set<string>();
  let unknownFleetBookings = 0;

  overlappingBookings.forEach((row) => {
    const code = getBookingVehicleCode(row);
    const vehicle = findVehicleByCodigo(code);

    if (vehicle) {
      bookedCodes.add(vehicle.codigo);
      return;
    }

    const rowFleetGroup = resolveFleetGroupFromWebsiteVehicle({
      vehicleId: "",
      vehicleName: row.vehicle_name || "",
    });

    if (rowFleetGroup.group === fleetGroup.group) {
      unknownFleetBookings += 1;
    }
  });

  const bookedCount = Math.min(
    fleet.length,
    bookedCodes.size + unknownFleetBookings
  );

  const availableCount = Math.max(0, fleet.length - bookedCount);

  if (
    metadataVehicle &&
    fleet.some((vehicle) => vehicle.codigo === metadataVehicle.codigo) &&
    !bookedCodes.has(metadataVehicle.codigo)
  ) {
    return {
      assignedVehicleName: vehicleDisplayName(metadataVehicle),
      assignedVehicleCode: metadataVehicle.codigo,
      assignedVehicleMatricula: metadataVehicle.matricula,
      assignedVehicleShortName: vehicleShortName(metadataVehicle),
      assignedVehicleDisplayName: vehicleDisplayName(metadataVehicle),
      fleetGroup: md.fleet_group || fleetGroup.group,
      publicVehicleName,
      totalFleet: fleet.length,
      bookedCount,
      availableCount,
      assignmentStatus: "assigned",
      assignmentSource: "metadata",
    };
  }

  const availableVehicles = fleet.filter(
    (vehicle) => !bookedCodes.has(vehicle.codigo)
  );

  const finalAvailableVehicles = availableVehicles.slice(unknownFleetBookings);
  const assignedVehicle = finalAvailableVehicles[0];

  if (!assignedVehicle) {
    return {
      assignedVehicleName: `UNASSIGNED · ${publicVehicleName}`,
      assignedVehicleCode: "",
      assignedVehicleMatricula: "",
      assignedVehicleShortName: "UNASSIGNED",
      assignedVehicleDisplayName: `UNASSIGNED · ${publicVehicleName}`,
      fleetGroup: md.fleet_group || fleetGroup.group,
      publicVehicleName,
      totalFleet: fleet.length,
      bookedCount,
      availableCount,
      assignmentStatus: "unassigned",
      assignmentSource: "failed",
    };
  }

  return {
    assignedVehicleName: vehicleDisplayName(assignedVehicle),
    assignedVehicleCode: assignedVehicle.codigo,
    assignedVehicleMatricula: assignedVehicle.matricula,
    assignedVehicleShortName: vehicleShortName(assignedVehicle),
    assignedVehicleDisplayName: vehicleDisplayName(assignedVehicle),
    fleetGroup: md.fleet_group || fleetGroup.group,
    publicVehicleName,
    totalFleet: fleet.length,
    bookedCount,
    availableCount,
    assignmentStatus: "assigned",
    assignmentSource: "auto_fallback",
  };
}

function buildBookingPayload(
  pi: Stripe.PaymentIntent,
  assignment: AssignedVehicleResult
) {
  const md = pi.metadata || {};
  const amount = pi.amount_received ?? pi.amount ?? 0;

  return {
    stripe_payment_intent_id: pi.id,
    status: "paid",
    booking_action: "reserve_now",

    source: "website",

    customer_name: md.customer_name || "",
    customer_email: md.customer_email || "",
    phone: md.phone || "",

    pickup_date: md.pickup_date || "",
    pickup_time: md.pickup_time || "",
    dropoff_date: md.dropoff_date || "",
    dropoff_time: md.dropoff_time || "",

    vehicle_name:
      assignment.assignedVehicleDisplayName ||
      assignment.assignedVehicleName ||
      md.assigned_vehicle_display_name ||
      md.vehicle_name ||
      "",
    vehicle_code:
      assignment.assignedVehicleCode ||
      md.assigned_vehicle_code ||
      md.vehicle_code ||
      "",

    assigned_vehicle_code:
      assignment.assignedVehicleCode ||
      md.assigned_vehicle_code ||
      md.vehicle_code ||
      "",
    scooter_code:
      assignment.assignedVehicleCode ||
      md.assigned_vehicle_code ||
      md.vehicle_code ||
      "",

    fleet_group: assignment.fleetGroup || md.fleet_group || "",
    public_vehicle_name:
      assignment.publicVehicleName ||
      md.public_vehicle_name ||
      md.vehicle_name ||
      "",

    payment_method: "card",
    payment_status: "paid",

    contract_number: md.bookingId || pi.id,

    dl_front_path: md.dl_front_path || "",
    dl_back_path: md.dl_back_path || "",
    id_front_path: md.id_front_path || "",
    id_back_path: md.id_back_path || "",

    amount,
    currency: pi.currency || "eur",
  };
}

function fallbackPayloadWithoutModernColumns(payload: any) {
  const {
    booking_action,
    assigned_vehicle_code,
    scooter_code,
    fleet_group,
    public_vehicle_name,
    payment_method,
    payment_status,
    contract_number,
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

    dl_front_path: payload.dl_front_path,
    dl_back_path: payload.dl_back_path,
    id_front_path: payload.id_front_path,
    id_back_path: payload.id_back_path,

    amount: payload.amount,
    currency: payload.currency,
  };
}

async function savePaidBookingToSupabase(
  pi: Stripe.PaymentIntent,
  assignment: AssignedVehicleResult
) {
  const payload = buildBookingPayload(pi, assignment);

  console.log("SUPABASE BOOKING PAYLOAD:", payload);

  let { data, error } = await supabase
    .from("bookings")
    .upsert(payload, { onConflict: "stripe_payment_intent_id" })
    .select();

  if (error) {
    console.warn(
      "SUPABASE FULL BOOKING UPSERT FAILED, TRYING MODERN FALLBACK:",
      error.message
    );

    const fallbackPayload = fallbackPayloadWithoutModernColumns(payload);

    const secondTry = await supabase
      .from("bookings")
      .upsert(fallbackPayload, { onConflict: "stripe_payment_intent_id" })
      .select();

    data = secondTry.data;
    error = secondTry.error;
  }

  if (error) {
    console.warn(
      "SUPABASE MODERN FALLBACK FAILED, TRYING OLD TABLE FALLBACK:",
      error.message
    );

    const oldPayload = fallbackPayloadForOldBookingsTable(payload);

    const thirdTry = await supabase
      .from("bookings")
      .upsert(oldPayload, { onConflict: "stripe_payment_intent_id" })
      .select();

    data = thirdTry.data;
    error = thirdTry.error;
  }

  if (error) {
    console.error("SUPABASE BOOKING UPSERT ERROR:", error);
    return { ok: false, data: null, error };
  }

  console.log("SUPABASE BOOKING SAVED:", data);

  return { ok: true, data, error: null };
}

async function sendOwnerEmail(
  pi: Stripe.PaymentIntent,
  assignment: AssignedVehicleResult
) {
  const md = pi.metadata || {};
  const amount = pi.amount_received ?? pi.amount ?? 0;
  const currency = cleanCurrency(pi.currency);

  const ownerEmailResult = await resend.emails.send({
    from: `Nexa Bookings <${FROM_EMAIL}>`,
    to: [OWNER_EMAIL, "nexarentalsmallorca@gmail.com"].filter(Boolean),
    subject:
      assignment.assignmentStatus === "assigned"
        ? `✅ New booking paid — ${assignment.assignedVehicleCode} assigned`
        : `⚠️ New booking paid — vehicle needs manual assignment`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2 style="color:#f97316;">New booking received ✅</h2>

        ${
          assignment.assignmentStatus === "unassigned"
            ? `<div style="background:#fee2e2;border:1px solid #ef4444;padding:12px;border-radius:10px;margin-bottom:16px;">
                <b>⚠️ Attention:</b> The system could not auto-assign a vehicle. Please check availability manually.
              </div>`
            : `<div style="background:#ecfdf3;border:1px solid #22c55e;padding:12px;border-radius:10px;margin-bottom:16px;">
                <b>Vehicle assigned automatically:</b> ${safeText(
                  assignment.assignedVehicleName
                )}
              </div>`
        }

        <p><b>Booking ID:</b> ${safeText(md.bookingId || "-")}</p>
        <p><b>Name:</b> ${safeText(md.customer_name || "-")}</p>
        <p><b>Email:</b> ${safeText(md.customer_email || "-")}</p>
        <p><b>Phone:</b> ${safeText(md.phone || "-")}</p>

        <hr/>

        <p><b>Customer selected:</b> ${safeText(
          assignment.publicVehicleName || md.public_vehicle_name || md.vehicle_name || "-"
        )}</p>
        <p><b>Assigned vehicle:</b> ${safeText(
          assignment.assignedVehicleName || "-"
        )}</p>
        <p><b>Assigned code:</b> ${safeText(
          assignment.assignedVehicleCode || "-"
        )}</p>
        <p><b>Assigned matrícula:</b> ${safeText(
          assignment.assignedVehicleMatricula || "-"
        )}</p>
        <p><b>Fleet group:</b> ${safeText(
          assignment.fleetGroup || md.fleet_group || "-"
        )}</p>
        <p><b>Assignment source:</b> ${safeText(
          assignment.assignmentSource || "-"
        )}</p>
        <p><b>Vehicle ID:</b> ${safeText(md.vehicle_id || "-")}</p>
        <p><b>Plan:</b> ${safeText(md.plan || "-")}</p>
        <p><b>Days:</b> ${safeText(md.days || "-")}</p>
        <p><b>Rate per day:</b> ${safeText(md.rate_per_day || "-")}</p>

        <p><b>Pickup Date & Time:</b> ${safeText(
          formatDate(md.pickup_date)
        )} at ${safeText(md.pickup_time || "-")}</p>
        <p><b>Dropoff Date & Time:</b> ${safeText(
          formatDate(md.dropoff_date)
        )} at ${safeText(md.dropoff_time || "-")}</p>
        <p><b>Pickup location:</b> ${safeText(md.pickup_location || "-")}</p>

        <p><b>Fleet total:</b> ${assignment.totalFleet}</p>
        <p><b>Booked count before this booking:</b> ${assignment.bookedCount}</p>
        <p><b>Available count before this booking:</b> ${assignment.availableCount}</p>
        <p><b>Availability buffer:</b> ${BUFFER_MINUTES_AFTER_BOOKING} minutes after every booking</p>

        <p><b>Availability check:</b> ${safeText(
          md.availability_checked || "-"
        )}</p>
        <p><b>Available count at checkout:</b> ${safeText(
          md.available_count || "-"
        )}</p>
        <p><b>Total fleet at checkout:</b> ${safeText(
          md.total_fleet || "-"
        )}</p>

        <p><b>Notes:</b> ${safeText(md.notes || "-")}</p>

        <hr/>

        <p><b>Driving licence front:</b> ${safeText(
          md.dl_front_name || "-"
        )}</p>
        <p><b>Driving licence front path:</b> ${safeText(
          md.dl_front_path || "-"
        )}</p>

        <p><b>Driving licence back:</b> ${safeText(
          md.dl_back_name || "-"
        )}</p>
        <p><b>Driving licence back path:</b> ${safeText(
          md.dl_back_path || "-"
        )}</p>

        <p><b>ID front:</b> ${safeText(md.id_front_name || "-")}</p>
        <p><b>ID front path:</b> ${safeText(md.id_front_path || "-")}</p>

        <p><b>ID back:</b> ${safeText(md.id_back_name || "-")}</p>
        <p><b>ID back path:</b> ${safeText(md.id_back_path || "-")}</p>

        <hr/>

        <p><b>Total rental amount:</b> ${safeText(
          moneyFromCents(md.totalAmount)
        )} ${currency}</p>
        <p><b>Deposit paid now:</b> ${safeText(
          moneyFromCents(md.depositAmount)
        )} ${currency}</p>
        <p><b>Remaining amount:</b> ${safeText(
          moneyFromCents(md.remainingAmount)
        )} ${currency}</p>
        <p><b>Amount paid now:</b> ${(amount / 100).toFixed(2)} ${currency}</p>
        <p><b>Marketing opt-in:</b> ${safeText(md.marketing_opt_in || "no")}</p>
        <p><b>PaymentIntent:</b> ${safeText(pi.id)}</p>
      </div>
    `,
  });

  if (ownerEmailResult.error) {
    console.error("OWNER EMAIL ERROR:", ownerEmailResult.error);
  } else {
    console.log("OWNER EMAIL SENT:", ownerEmailResult.data);
  }
}

async function sendCustomerEmail(
  pi: Stripe.PaymentIntent,
  assignment: AssignedVehicleResult
) {
  const md = pi.metadata || {};
  const amount = pi.amount_received ?? pi.amount ?? 0;
  const currency = cleanCurrency(pi.currency);
  const customerEmail = md.customer_email;

  if (!customerEmail) {
    console.log("NO CUSTOMER EMAIL FOUND IN METADATA");
    return;
  }

  const customerVehicleName =
    assignment.publicVehicleName ||
    md.public_vehicle_name ||
    md.vehicle_name ||
    "Selected vehicle";

  const customerEmailResult = await resend.emails.send({
    from: `Nexa Rentals <${FROM_EMAIL}>`,
    to: customerEmail,
    subject: "✅ Your booking is confirmed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2 style="color:#f97316;">Your booking is confirmed ✅</h2>

        <p>Hi ${safeText(md.customer_name || "")},</p>
        <p>Thank you for choosing <b>Nexa Rentals</b>. Your booking has been successfully confirmed.</p>

        <hr/>

        <h3>Booking Details</h3>
        <p><b>Booking ID:</b> ${safeText(md.bookingId || "-")}</p>
        <p><b>Vehicle:</b> ${safeText(customerVehicleName)}</p>
        <p><b>Plan:</b> ${safeText(md.plan || "-")}</p>
        <p><b>Pickup Date & Time:</b> ${safeText(
          formatDate(md.pickup_date)
        )} at ${safeText(md.pickup_time || "-")}</p>
        <p><b>Dropoff Date & Time:</b> ${safeText(
          formatDate(md.dropoff_date)
        )} at ${safeText(md.dropoff_time || "-")}</p>
        <p><b>Pickup Location:</b> ${safeText(
          md.pickup_location || "Magaluf (Carrer Galeón 13)"
        )}</p>

        <hr/>

        <h3>Payment Summary</h3>
        <p><b>Amount Paid:</b> ${(amount / 100).toFixed(2)} ${currency}</p>
        <p><b>Remaining Amount (to pay at pickup):</b> ${safeText(
          moneyFromCents(md.remainingAmount)
        )} ${currency}</p>

        <hr/>

        <h3>Pickup Instructions</h3>
        <ul>
          <li>Please arrive at the pickup location on time.</li>
          <li>Bring all required documents listed below.</li>
          <li>Our team will assist you with the vehicle handover.</li>
        </ul>

        <h3>Required Documents</h3>
        <ul>
          <li>Valid driving licence original only</li>
          <li>Passport or national ID</li>
        </ul>

        <h3>Deposit & Payment</h3>
        <ul>
          <li>A <b>€150 security deposit</b> is required at pickup.</li>
          <li>The deposit is accepted <b>only by card</b>.</li>
          <li>The remaining 50% of the rental amount must be paid at pickup.</li>
        </ul>

        <hr/>

        <p>If you have any questions, simply reply to this email or contact us directly.</p>

        <p>We look forward to serving you.</p>

        <p>
          <b>Nexa Rentals Team</b><br/>
          Magaluf, Mallorca Spain
        </p>
      </div>
    `,
  });

  if (customerEmailResult.error) {
    console.error("CUSTOMER EMAIL ERROR:", customerEmailResult.error);
  } else {
    console.log("CUSTOMER EMAIL SENT:", customerEmailResult.data);
  }
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY");
    return new NextResponse("Missing Stripe config", { status: 500 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Missing Stripe webhook config", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("STRIPE WEBHOOK ERROR:", err);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;

      const assignment = await assignFirstAvailableVehicle(pi);

      await savePaidBookingToSupabase(pi, assignment);

      try {
        await sendOwnerEmail(pi, assignment);
      } catch (error) {
        console.error("OWNER EMAIL SEND FAILED:", error);
      }

      try {
        await sendCustomerEmail(pi, assignment);
      } catch (error) {
        console.error("CUSTOMER EMAIL SEND FAILED:", error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WEBHOOK PROCESSING ERROR:", error);

    return NextResponse.json(
      {
        received: true,
        warning:
          error?.message ||
          "Webhook received, but there was an internal processing warning.",
      },
      { status: 200 }
    );
  }
}