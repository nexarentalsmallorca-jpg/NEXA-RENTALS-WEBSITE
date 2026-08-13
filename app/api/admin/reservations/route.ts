import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findVehicleByCodigo,
  getFleetGroupDisplayName,
  normalizeVehicleCode,
} from "@/lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCUMENT_BUCKET = "booking-documents";
const DOCUMENT_LINK_SECONDS = 10 * 60;

const NON_BLOCKING_STATUSES = [
  "cancelled",
  "canceled",
  "rejected",
  "refunded",
  "expired",
  "payment_failed",
  "failed",
  "returned",
  "completed",
  "finished",
  "closed",
  "deleted",
  "finalizada",
];

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeStatus(value: unknown) {
  return cleanText(value).toLowerCase();
}

function isNonBlockingStatus(value: unknown) {
  return NON_BLOCKING_STATUSES.includes(
    normalizeStatus(value)
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isStripePaymentIntent(value: unknown) {
  return cleanText(value).toLowerCase().startsWith("pi_");
}

function getReservationOrigin(row: any) {
  const explicitOrigin = normalizeStatus(
    row.reservation_origin
  );

  if (
    explicitOrigin === "website" ||
    explicitOrigin === "manual_reservation"
  ) {
    return explicitOrigin;
  }

  if (isStripePaymentIntent(row.stripe_payment_intent_id)) {
    return "website";
  }

  return "";
}

function isReservationRecord(row: any) {
  const origin = getReservationOrigin(row);

  return (
    origin === "website" ||
    origin === "manual_reservation"
  );
}

function moneyTextToCents(value: unknown) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value));
  }

  const cleaned = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(cleaned);

  if (!Number.isFinite(amount)) return 0;

  return Math.max(0, Math.round(amount * 100));
}

function resolvePaymentStatus({
  totalAmount,
  amountPaid,
}: {
  totalAmount: number;
  amountPaid: number;
}) {
  if (totalAmount > 0 && amountPaid >= totalAmount) {
    return "paid";
  }

  if (amountPaid > 0) {
    return "partial";
  }

  return "unpaid";
}

function normalizeTime(value: unknown) {
  const text = cleanText(value);
  const match = text.match(/^(\d{1,2}):(\d{2})/);

  if (!match) return "00:00";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function getBookingDateTime(
  dateValue: unknown,
  timeValue: unknown
) {
  const date = cleanText(dateValue);
  const time = normalizeTime(timeValue);

  if (!date) return null;

  const result = new Date(`${date}T${time}:00`);

  return Number.isNaN(result.getTime())
    ? null
    : result;
}

function getMadridNowKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function reservationHasNotPassed(row: any) {
  const dropoffDate = cleanText(row.dropoff_date);

  if (!dropoffDate) return false;

  const dropoffTime = normalizeTime(row.dropoff_time);
  const dropoffKey = `${dropoffDate}T${dropoffTime}`;

  return dropoffKey >= getMadridNowKey();
}

function getAssignedVehicleCodes(row: any) {
  const codes: string[] = [];

  if (Array.isArray(row.assigned_vehicle_codes)) {
    for (const value of row.assigned_vehicle_codes) {
      const code = normalizeVehicleCode(cleanText(value));

      if (code) {
        codes.push(code);
      }
    }
  }

  const legacyCode = normalizeVehicleCode(
    cleanText(
      row.assigned_vehicle_code ||
        row.vehicle_code ||
        row.scooter_code
    )
  );

  if (legacyCode) {
    codes.push(legacyCode);
  }

  return Array.from(new Set(codes));
}

function getStoredMoney(row: any, modernKey: string) {
  const modernValue = Number(row?.[modernKey] || 0);

  if (modernValue > 0) {
    return modernValue;
  }

  const legacyValue = Number(row?.amount || 0);

  return Number.isFinite(legacyValue)
    ? Math.max(0, legacyValue)
    : 0;
}

function hasDocuments(row: any) {
  return Boolean(
    cleanText(row.dl_front_path) ||
      cleanText(row.dl_back_path) ||
      cleanText(row.id_front_path) ||
      cleanText(row.id_back_path)
  );
}

function normalizeReservation(row: any) {
  const origin = getReservationOrigin(row);
  const websiteBooking = origin === "website";

  const assignedVehicleCodes =
    getAssignedVehicleCodes(row);

  const primaryVehicleCode =
    assignedVehicleCodes[0] || "";

  const vehicle = findVehicleByCodigo(
    primaryVehicleCode
  );

  const totalAmount = getStoredMoney(
    row,
    "total_amount"
  );

  const amountPaid = websiteBooking
    ? getStoredMoney(row, "amount_paid")
    : Number(row.amount_paid || 0);

  const calculatedPaymentStatus =
    resolvePaymentStatus({
      totalAmount,
      amountPaid,
    });

  const paymentStatus = websiteBooking
    ? "paid"
    : cleanText(row.reservation_payment_status) ||
      cleanText(row.payment_status) ||
      calculatedPaymentStatus;

  return {
    id: cleanText(row.id),

    customerName:
      cleanText(row.customer_name) || "Customer",

    customerEmail:
      cleanText(row.customer_email),

    phone:
      cleanText(row.phone),

    pickupDate:
      cleanText(row.pickup_date),

    pickupTime:
      normalizeTime(row.pickup_time),

    dropoffDate:
      cleanText(row.dropoff_date),

    dropoffTime:
      normalizeTime(row.dropoff_time),

    fleetGroup:
      cleanText(row.fleet_group),

    fleetName:
      getFleetGroupDisplayName(row.fleet_group),

    assignedVehicleCode: primaryVehicleCode,
    assignedVehicleCodes,

    vehicleName:
      cleanText(
        row.public_vehicle_name ||
          row.vehicle_name
      ) ||
      (vehicle
        ? `${vehicle.marca} ${vehicle.modelo}`
        : getFleetGroupDisplayName(row.fleet_group)),

    vehicle: vehicle
      ? {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: vehicle.imageUrl || "",
        }
      : null,

    quantity: Math.max(
      1,
      Number(row.quantity || 1)
    ),

    totalAmount,

    amountPaid,

    remainingAmount: Math.max(
      totalAmount - amountPaid,
      0
    ),

    paymentStatus,

    paymentMethod:
      cleanText(row.payment_method) ||
      (websiteBooking ? "card" : ""),

    notes:
      cleanText(row.notes),

    source: websiteBooking
      ? "Website"
      : "Manual reservation",

    origin,

    status:
      cleanText(
        row.booking_status ||
          row.status ||
          "confirmed"
      ),

    contractNumber:
      cleanText(
        row.contract_number ||
          row.stripe_payment_intent_id ||
          row.id
      ),

    stripePaymentIntentId:
      cleanText(row.stripe_payment_intent_id),

    hasDocuments: hasDocuments(row),

    createdAt:
      cleanText(row.created_at),

    updatedAt:
      cleanText(row.updated_at),
  };
}

function sortReservations(rows: any[]) {
  return [...rows].sort((first, second) => {
    const firstStart = getBookingDateTime(
      first.pickup_date,
      first.pickup_time
    );

    const secondStart = getBookingDateTime(
      second.pickup_date,
      second.pickup_time
    );

    if (!firstStart && !secondStart) return 0;
    if (!firstStart) return 1;
    if (!secondStart) return -1;

    return (
      firstStart.getTime() -
      secondStart.getTime()
    );
  });
}

async function getVehicleAvailability(
  request: NextRequest
) {
  const { searchParams } = new URL(request.url);

  const fleetGroup = cleanText(
    searchParams.get("fleetGroup")
  );

  const pickupDate = cleanText(
    searchParams.get("pickupDate")
  );

  const pickupTime = cleanText(
    searchParams.get("pickupTime")
  );

  const dropoffDate = cleanText(
    searchParams.get("dropoffDate")
  );

  const dropoffTime = cleanText(
    searchParams.get("dropoffTime")
  );

  if (
    !fleetGroup ||
    !pickupDate ||
    !pickupTime ||
    !dropoffDate ||
    !dropoffTime
  ) {
    return NextResponse.json(
      {
        ok: false,
        available: false,
        error:
          "Select the category and pickup/return date and time.",
      },
      { status: 400 }
    );
  }

  const pickup = getBookingDateTime(
    pickupDate,
    pickupTime
  );

  const dropoff = getBookingDateTime(
    dropoffDate,
    dropoffTime
  );

  if (!pickup || !dropoff) {
    return NextResponse.json(
      {
        ok: false,
        available: false,
        error: "Invalid reservation date or time.",
      },
      { status: 400 }
    );
  }

  if (dropoff <= pickup) {
    return NextResponse.json(
      {
        ok: false,
        available: false,
        error:
          "Return date/time must be after pickup date/time.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.rpc(
    "get_reservation_vehicle_availability",
    {
      p_fleet_group: fleetGroup,
      p_pickup_date: pickupDate,
      p_pickup_time: pickupTime,
      p_dropoff_date: dropoffDate,
      p_dropoff_time: dropoffTime,
    }
  );

  if (error) {
    console.error(
      "RESERVATION AVAILABILITY ERROR:",
      error.message
    );

    return NextResponse.json(
      {
        ok: false,
        available: false,
        error:
          error.message ||
          "Could not check availability.",
      },
      { status: 500 }
    );
  }

  const vehicles = Array.isArray(data)
    ? data.map((row: any) => {
        const fleetVehicle = findVehicleByCodigo(
          row.vehicle_code
        );

        return {
          vehicleCode:
            normalizeVehicleCode(row.vehicle_code),

          publicVehicleName:
            cleanText(row.public_vehicle_name),

          fleetGroup:
            cleanText(row.fleet_group),

          exactAvailable:
            Boolean(row.exact_available),

          availabilityStatus:
            cleanText(row.availability_status),

          availableCount:
            Number(row.available_count || 0),

          totalFleet:
            Number(row.total_fleet || 0),

          bookedQuantity:
            Number(row.booked_quantity || 0),

          heldQuantity:
            Number(row.held_quantity || 0),

          vehicle: fleetVehicle
            ? {
                codigo: fleetVehicle.codigo,
                matricula: fleetVehicle.matricula,
                marca: fleetVehicle.marca,
                modelo: fleetVehicle.modelo,
                imageUrl:
                  fleetVehicle.imageUrl || "",
              }
            : null,
        };
      })
    : [];

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.exactAvailable
  );

  const firstRow = vehicles[0];

  return NextResponse.json({
    ok: true,

    available:
      Number(firstRow?.availableCount || 0) > 0,

    fleetGroup,

    fleetName:
      getFleetGroupDisplayName(fleetGroup),

    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,

    bufferMinutes: 60,

    availableCount:
      Number(firstRow?.availableCount || 0),

    totalFleet:
      Number(firstRow?.totalFleet || vehicles.length),

    bookedQuantity:
      Number(firstRow?.bookedQuantity || 0),

    heldQuantity:
      Number(firstRow?.heldQuantity || 0),

    vehicles,
    availableVehicles,
  });
}

async function createSignedDocument(
  pathValue: unknown,
  label: string
) {
  const path = cleanText(pathValue);

  if (!path) {
    return {
      label,
      available: false,
      url: "",
      fileName: "",
    };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENT_BUCKET)
    .createSignedUrl(path, DOCUMENT_LINK_SECONDS);

  if (error || !data?.signedUrl) {
    console.error(
      "DOCUMENT SIGNED URL ERROR:",
      label,
      error?.message || "No URL returned"
    );

    return {
      label,
      available: false,
      url: "",
      fileName:
        path.split("/").pop() || label,
      error:
        error?.message ||
        "Could not open this document.",
    };
  }

  return {
    label,
    available: true,
    url: data.signedUrl,
    fileName:
      path.split("/").pop() || label,
  };
}

async function getReservationDocuments(
  request: NextRequest
) {
  const { searchParams } = new URL(request.url);
  const reservationId = cleanText(
    searchParams.get("id")
  );

  if (!reservationId || !isUuid(reservationId)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid reservation ID.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `
        id,
        stripe_payment_intent_id,
        reservation_origin,
        customer_name,
        dl_front_path,
        dl_back_path,
        id_front_path,
        id_back_path
      `
    )
    .eq("id", reservationId)
    .limit(1);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error.message ||
          "Could not load the documents.",
      },
      { status: 500 }
    );
  }

  const booking = data?.[0];

  if (!booking) {
    return NextResponse.json(
      {
        ok: false,
        error: "Reservation not found.",
      },
      { status: 404 }
    );
  }

  if (getReservationOrigin(booking) !== "website") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Documents are available only for website reservations.",
      },
      { status: 403 }
    );
  }

  const documents = await Promise.all([
    createSignedDocument(
      booking.dl_front_path,
      "Driving licence front"
    ),

    createSignedDocument(
      booking.dl_back_path,
      "Driving licence back"
    ),

    createSignedDocument(
      booking.id_front_path,
      "ID or passport front"
    ),

    createSignedDocument(
      booking.id_back_path,
      "ID card back"
    ),
  ]);

  return NextResponse.json({
    ok: true,

    reservationId,

    customerName:
      cleanText(booking.customer_name),

    expiresInSeconds:
      DOCUMENT_LINK_SECONDS,

    documents,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = cleanText(
      searchParams.get("action")
    );

    if (action === "availability") {
      return getVehicleAvailability(request);
    }

    if (action === "documents") {
      return getReservationDocuments(request);
    }

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("pickup_date", {
        ascending: true,
        nullsFirst: false,
      })
      .order("pickup_time", {
        ascending: true,
        nullsFirst: false,
      })
      .limit(5000);

    if (error) {
      console.error(
        "RESERVATIONS GET ERROR:",
        error.message
      );

      return NextResponse.json(
        {
          ok: false,
          reservations: [],
          error:
            error.message ||
            "Could not load reservations.",
        },
        { status: 500 }
      );
    }

    const allRows = Array.isArray(data)
      ? data
      : [];

    const reservationRows = allRows.filter(
      (row: any) => {
        if (!isReservationRecord(row)) {
          return false;
        }

        if (isNonBlockingStatus(row.status)) {
          return false;
        }

        if (isNonBlockingStatus(row.booking_status)) {
          return false;
        }

        if (!reservationHasNotPassed(row)) {
          return false;
        }

        return true;
      }
    );

    const sortedRows =
      sortReservations(reservationRows);

    return NextResponse.json({
      ok: true,

      reservations: sortedRows.map(
        normalizeReservation
      ),

      total: sortedRows.length,
    });
  } catch (error: any) {
    console.error(
      "RESERVATIONS GET FAILED:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        reservations: [],
        error:
          error?.message ||
          "Could not load reservations.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const contractNumber = cleanText(
      body.contractNumber ||
        body.contract_number
    );

    const assignedVehicleCode =
      normalizeVehicleCode(
        cleanText(
          body.assignedVehicleCode ||
            body.assigned_vehicle_code ||
            body.vehicleCode
        )
      );

    const vehicle = findVehicleByCodigo(
      assignedVehicleCode
    );

    if (!vehicle) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Select a valid scooter from N1 to N9.",
        },
        { status: 400 }
      );
    }

    const fleetGroup = cleanText(
      body.fleetGroup ||
        body.fleet_group ||
        vehicle.fleetGroup
    );

    if (fleetGroup !== vehicle.fleetGroup) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "The selected scooter does not belong to this category.",
        },
        { status: 400 }
      );
    }

    const customerName = cleanText(
      body.customerName ||
        body.customer_name
    );

    const customerEmail = cleanText(
      body.customerEmail ||
        body.customer_email
    );

    const phone = cleanText(body.phone);

    const pickupDate = cleanText(
      body.pickupDate ||
        body.pickup_date
    );

    const pickupTime = cleanText(
      body.pickupTime ||
        body.pickup_time
    );

    const dropoffDate = cleanText(
      body.dropoffDate ||
        body.dropoff_date
    );

    const dropoffTime = cleanText(
      body.dropoffTime ||
        body.dropoff_time
    );

    const notes = cleanText(body.notes);

    const paymentMethod = cleanText(
      body.paymentMethod ||
        body.payment_method
    );

    const totalAmount = moneyTextToCents(
      body.totalAmount ??
        body.total_amount
    );

    const amountPaid = moneyTextToCents(
      body.amountPaid ??
        body.amount_paid
    );

    if (!contractNumber) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing reservation number.",
        },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing customer name.",
        },
        { status: 400 }
      );
    }

    if (
      !pickupDate ||
      !pickupTime ||
      !dropoffDate ||
      !dropoffTime
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing pickup or return date/time.",
        },
        { status: 400 }
      );
    }

    const pickup = getBookingDateTime(
      pickupDate,
      pickupTime
    );

    const dropoff = getBookingDateTime(
      dropoffDate,
      dropoffTime
    );

    if (!pickup || !dropoff || dropoff <= pickup) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Return date/time must be after pickup date/time.",
        },
        { status: 400 }
      );
    }

    if (amountPaid > totalAmount) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Amount paid cannot exceed the total amount.",
        },
        { status: 400 }
      );
    }

    const paymentStatus =
      resolvePaymentStatus({
        totalAmount,
        amountPaid,
      });

    const { data, error } = await supabaseAdmin.rpc(
      "create_manual_reservation",
      {
        p_contract_number: contractNumber,
        p_fleet_group: fleetGroup,

        p_assigned_vehicle_code:
          assignedVehicleCode,

        p_vehicle_name:
          `${vehicle.marca} ${vehicle.modelo}`,

        p_pickup_date: pickupDate,
        p_pickup_time: pickupTime,
        p_dropoff_date: dropoffDate,
        p_dropoff_time: dropoffTime,

        p_customer_name: customerName,
        p_customer_email:
          customerEmail || null,
        p_phone: phone || null,

        p_total_amount: totalAmount,
        p_amount_paid: amountPaid,
        p_payment_status: paymentStatus,

        p_payment_method:
          paymentMethod || null,

        p_notes: notes || null,
      }
    );

    if (error) {
      const message =
        error.message ||
        "Could not create the reservation.";

      const normalizedMessage =
        message.toLowerCase();

      const conflict =
        normalizedMessage.includes("already reserved") ||
        normalizedMessage.includes("not available") ||
        normalizedMessage.includes("no scooter") ||
        normalizedMessage.includes("available for");

      return NextResponse.json(
        {
          ok: false,
          conflict,
          error: message,
        },
        {
          status: conflict ? 409 : 400,
        }
      );
    }

    const result = Array.isArray(data)
      ? data[0]
      : data;

    if (!result?.reservation_id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Supabase did not return the reservation ID.",
        },
        { status: 500 }
      );
    }

    const { error: classificationError } =
      await supabaseAdmin
        .from("bookings")
        .update({
          reservation_origin:
            "manual_reservation",

          booking_source:
            "manual_reservation",

          source:
            "Reservations",

          assigned_vehicle_codes: [
            assignedVehicleCode,
          ],

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", result.reservation_id);

    if (classificationError) {
      console.error(
        "RESERVATION CLASSIFICATION ERROR:",
        classificationError.message
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "The reservation was protected, but its dashboard classification could not be saved. Refresh before trying again.",
        },
        { status: 500 }
      );
    }

    const { data: savedRows, error: savedError } =
      await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", result.reservation_id)
        .limit(1);

    if (savedError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Reservation created, but it could not be reloaded.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,

        reservation: savedRows?.[0]
          ? normalizeReservation(savedRows[0])
          : {
              id: result.reservation_id,
            },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      "RESERVATION POST FAILED:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Could not create the reservation.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const reservationId = cleanText(
      body.id ||
        body.reservationId ||
        body.reservation_id
    );

    if (!reservationId || !isUuid(reservationId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid reservation ID.",
        },
        { status: 400 }
      );
    }

    const customerName = cleanText(
      body.customerName ||
        body.customer_name
    );

    const customerEmail = cleanText(
      body.customerEmail ||
        body.customer_email
    );

    const phone = cleanText(body.phone);

    const pickupDate = cleanText(
      body.pickupDate ||
        body.pickup_date
    );

    const pickupTime = cleanText(
      body.pickupTime ||
        body.pickup_time
    );

    const dropoffDate = cleanText(
      body.dropoffDate ||
        body.dropoff_date
    );

    const dropoffTime = cleanText(
      body.dropoffTime ||
        body.dropoff_time
    );

    const fleetGroup = cleanText(
      body.fleetGroup ||
        body.fleet_group
    );

    const rawCodes = Array.isArray(
      body.assignedVehicleCodes
    )
      ? body.assignedVehicleCodes
      : body.assignedVehicleCode
      ? [body.assignedVehicleCode]
      : [];

    const assignedVehicleCodes: string[] = Array.from(
  new Set<string>(
    (rawCodes as unknown[])
      .map((value) =>
        normalizeVehicleCode(cleanText(value))
      )
      .filter((code) => code.length > 0)
  )
);

    for (const vehicleCode of assignedVehicleCodes) {
      const vehicle = findVehicleByCodigo(vehicleCode);

      if (!vehicle) {
        return NextResponse.json(
          {
            ok: false,
            error:
              `${vehicleCode} is not a valid fleet vehicle.`,
          },
          { status: 400 }
        );
      }

      if (vehicle.fleetGroup !== fleetGroup) {
        return NextResponse.json(
          {
            ok: false,
            error:
              `${vehicleCode} does not belong to the selected category.`,
          },
          { status: 400 }
        );
      }
    }

    const totalAmount = moneyTextToCents(
      body.totalAmount ??
        body.total_amount
    );

    const amountPaid = moneyTextToCents(
      body.amountPaid ??
        body.amount_paid
    );

    if (!customerName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing customer name.",
        },
        { status: 400 }
      );
    }

    if (
      !pickupDate ||
      !pickupTime ||
      !dropoffDate ||
      !dropoffTime
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing pickup or return date/time.",
        },
        { status: 400 }
      );
    }

    const pickup = getBookingDateTime(
      pickupDate,
      pickupTime
    );

    const dropoff = getBookingDateTime(
      dropoffDate,
      dropoffTime
    );

    if (!pickup || !dropoff || dropoff <= pickup) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Return date/time must be after pickup date/time.",
        },
        { status: 400 }
      );
    }

    if (amountPaid > totalAmount) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Amount paid cannot exceed the total amount.",
        },
        { status: 400 }
      );
    }

    const paymentStatus =
      resolvePaymentStatus({
        totalAmount,
        amountPaid,
      });

    const reservationStatus =
      normalizeStatus(
        body.reservationStatus ||
          body.status ||
          "confirmed"
      );

    const { data, error } = await supabaseAdmin.rpc(
      "update_reservation_control",
      {
        p_reservation_id: reservationId,

        p_customer_name: customerName,
        p_customer_email:
          customerEmail || null,
        p_phone: phone || null,

        p_pickup_date: pickupDate,
        p_pickup_time: pickupTime,
        p_dropoff_date: dropoffDate,
        p_dropoff_time: dropoffTime,

        p_fleet_group: fleetGroup,

        p_assigned_vehicle_codes:
          assignedVehicleCodes,

        p_total_amount: totalAmount,
        p_amount_paid: amountPaid,
        p_payment_status: paymentStatus,

        p_payment_method:
          cleanText(body.paymentMethod) || null,

        p_notes:
          cleanText(body.notes) || null,

        p_reservation_status:
          reservationStatus,
      }
    );

    if (error) {
      const message =
        error.message ||
        "Could not update the reservation.";

      const normalizedMessage =
        message.toLowerCase();

      const conflict =
        normalizedMessage.includes("reserved") ||
        normalizedMessage.includes("available") ||
        normalizedMessage.includes("not enough") ||
        normalizedMessage.includes("category");

      return NextResponse.json(
        {
          ok: false,
          conflict,
          error: message,
        },
        {
          status: conflict ? 409 : 400,
        }
      );
    }

    const result = Array.isArray(data)
      ? data[0]
      : data;

    const { data: updatedRows, error: loadError } =
      await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq(
          "id",
          result?.reservation_id ||
            reservationId
        )
        .limit(1);

    if (loadError || !updatedRows?.[0]) {
      return NextResponse.json(
        {
          ok: true,
          updated: true,
          reservationId,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      updated: true,
      reservation:
        normalizeReservation(updatedRows[0]),
    });
  } catch (error: any) {
    console.error(
      "RESERVATION PATCH FAILED:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Could not update the reservation.",
      },
      { status: 500 }
    );
  }
}