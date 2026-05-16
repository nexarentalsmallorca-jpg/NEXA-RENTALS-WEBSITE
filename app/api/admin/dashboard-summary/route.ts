import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { nexaFleet } from "../../../../lib/nexaFleet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaymentMethod = "cash" | "card" | "unpaid";
type BookingAction = "rent_now" | "reserve_now";
type ComputedStatus =
  | "rented"
  | "reserved"
  | "finished"
  | "cancelled"
  | "wanted";

type BookingRow = {
  id?: string | number;
  created_at?: string;
  createdAt?: string;

  stripe_payment_intent_id?: string;
  status?: string;
  source?: string;
  booking_action?: string;
  bookingAction?: string;

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
  amount_eur?: number;
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
    pagado?: string;
    bookingAction?: string;
  };
};

type NormalizedBooking = {
  id: string;
  key: string;
  createdAt: string;
  status: string;
  computedStatus: ComputedStatus;
  source: string;
  bookingAction: BookingAction;

  amountCents: number;
  paymentMethod: PaymentMethod;

  customerName: string;
  phone: string;
  email: string;
  contractNumber: string;

  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  startIso: string | null;
  endIso: string | null;

  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
  };
};

const MAX_ROWS = 1000;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey);
}

function cleanText(value: any) {
  return String(value || "").trim();
}

function normalizeStatusText(value?: string) {
  return cleanText(value).toLowerCase();
}

function extractVehicleCode(value?: string | null) {
  const match = cleanText(value).match(/\bN\d+\b/i);
  return match?.[0]?.toUpperCase() || "";
}

function safeDateTime(date?: string, time?: string) {
  const cleanDate = cleanText(date);
  if (!cleanDate) return null;

  const cleanTime = cleanText(time) || "00:00";
  const value = new Date(`${cleanDate}T${cleanTime}`);

  return Number.isNaN(value.getTime()) ? null : value;
}

function isSameCalendarDay(a: Date | null, b: Date) {
  if (!a) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplayDate(date: Date | null) {
  if (!date) return "No date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayTime(date: Date | null) {
  if (!date) return "--:--";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getPickupLabel(start: Date | null) {
  if (!start) return "Pickup date not available";

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameCalendarDay(start, today)) {
    return `Pickup today at ${formatDisplayTime(start)}`;
  }

  if (isSameCalendarDay(start, tomorrow)) {
    return `Pickup tomorrow at ${formatDisplayTime(start)}`;
  }

  return `Pickup on ${formatDisplayDate(start)} at ${formatDisplayTime(start)}`;
}

function getReturnLabel(end: Date | null) {
  if (!end) return "Return date not available";

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameCalendarDay(end, today)) {
    return `Returns today at ${formatDisplayTime(end)}`;
  }

  if (isSameCalendarDay(end, tomorrow)) {
    return `Returns tomorrow at ${formatDisplayTime(end)}`;
  }

  return `Returns on ${formatDisplayDate(end)} at ${formatDisplayTime(end)}`;
}

function formatBookingWindow(start: Date | null, end: Date | null) {
  if (!start || !end) return "--";

  return `${formatDisplayDate(start)} ${formatDisplayTime(
    start
  )} - ${formatDisplayDate(end)} ${formatDisplayTime(end)}`;
}

function normalizeBookingAction(value?: string): BookingAction {
  const clean = normalizeStatusText(value);

  if (
    clean === "rent_now" ||
    clean === "rented_out" ||
    clean === "rented" ||
    clean === "picked_up" ||
    clean === "picked up" ||
    clean === "en alquiler" ||
    clean.includes("rent now") ||
    clean.includes("rented") ||
    clean.includes("alquilado") ||
    clean.includes("en alquiler")
  ) {
    return "rent_now";
  }

  return "reserve_now";
}

function isCancelledStatus(status?: string) {
  const clean = normalizeStatusText(status);

  return (
    clean.includes("cancel") ||
    clean.includes("cancelada") ||
    clean.includes("cancelled") ||
    clean.includes("canceled") ||
    clean.includes("failed") ||
    clean.includes("refunded")
  );
}

function isReturnedStatus(status?: string) {
  const clean = normalizeStatusText(status);

  return (
    clean.includes("returned") ||
    clean.includes("finalizada") ||
    clean.includes("completed") ||
    clean.includes("finished")
  );
}

function isWantedStatus(status?: string) {
  const clean = normalizeStatusText(status);

  return (
    clean.includes("wanted") ||
    clean.includes("problem") ||
    clean.includes("maintenance") ||
    clean.includes("blocked") ||
    clean.includes("taller") ||
    clean.includes("averia") ||
    clean.includes("avería")
  );
}

function getComputedStatus({
  rawStatus,
  bookingAction,
  end,
}: {
  rawStatus: string;
  bookingAction: BookingAction;
  end: Date | null;
}): ComputedStatus {
  if (isCancelledStatus(rawStatus)) return "cancelled";
  if (isReturnedStatus(rawStatus)) return "finished";
  if (isWantedStatus(rawStatus)) return "wanted";

  if (end && new Date() > end) return "finished";

  if (bookingAction === "rent_now") return "rented";

  return "reserved";
}

function normalizePaymentMethod(value?: string): PaymentMethod {
  const clean = normalizeStatusText(value);

  if (clean.includes("cash") || clean.includes("efectivo")) return "cash";

  if (
    clean.includes("card") ||
    clean.includes("tarjeta") ||
    clean.includes("stripe")
  ) {
    return "card";
  }

  return "unpaid";
}

function moneyTextToNumber(value?: string) {
  if (!value) return 0;

  const clean = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(clean);

  return Number.isFinite(amount) ? amount : 0;
}

function getAmountCents(booking: BookingRow) {
  if (typeof booking.amount === "number") return booking.amount;

  if (typeof booking.amount_eur === "number") {
    return Math.round(booking.amount_eur * 100);
  }

  return Math.round(moneyTextToNumber(booking.contractData?.total) * 100);
}

function getBookingKey(booking: BookingRow) {
  return (
    cleanText(booking.stripe_payment_intent_id) ||
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id)
  );
}

function parseVehicle(booking: BookingRow) {
  const vehicleCode =
    cleanText(booking.vehicle?.codigo) ||
    cleanText(booking.vehicle_code) ||
    extractVehicleCode(booking.vehicle_name);

  const fleetVehicle = vehicleCode
    ? nexaFleet.find((vehicle) => vehicle.codigo === vehicleCode)
    : null;

  if (fleetVehicle) {
    return {
      codigo: fleetVehicle.codigo,
      matricula: fleetVehicle.matricula,
      marca: fleetVehicle.marca,
      modelo: fleetVehicle.modelo,
    };
  }

  const vehicleName = cleanText(booking.vehicle_name);
  const text = `${vehicleName} ${booking.vehicle?.marca || ""} ${
    booking.vehicle?.modelo || ""
  }`.toLowerCase();

  return {
    codigo: vehicleCode || cleanText(booking.vehicle?.codigo) || "ONLINE",
    matricula: cleanText(booking.vehicle?.matricula) || "-",
    marca:
      cleanText(booking.vehicle?.marca) ||
      (text.includes("sym")
        ? "SYM"
        : text.includes("piaggio")
        ? "Piaggio"
        : "Vehicle"),
    modelo:
      cleanText(booking.vehicle?.modelo) ||
      (text.includes("sym")
        ? "Symphony 125"
        : text.includes("piaggio")
        ? "Liberty 125"
        : vehicleName),
  };
}

function normalizeBooking(booking: BookingRow): NormalizedBooking {
  const contractData = booking.contractData || {};

  const pickupDate = cleanText(booking.pickup_date || contractData.fechaEntrega);
  const pickupTime = cleanText(booking.pickup_time || contractData.horaEntrega);

  const dropoffDate = cleanText(
    booking.dropoff_date || contractData.fechaDevolucion
  );
  const dropoffTime = cleanText(
    booking.dropoff_time || contractData.horaDevolucion
  );

  const start = safeDateTime(pickupDate, pickupTime);
  const end = safeDateTime(dropoffDate, dropoffTime);

  const rawStatus = cleanText(booking.status || "reserved");

  const bookingAction = normalizeBookingAction(
    booking.booking_action ||
      booking.bookingAction ||
      contractData.bookingAction ||
      rawStatus
  );

  const paymentMethod = normalizePaymentMethod(
    booking.payment_method ||
      contractData.metodoPago ||
      contractData.paymentMethod ||
      contractData.pagado
  );

  const vehicle = parseVehicle(booking);

  return {
    id: cleanText(booking.id) || getBookingKey(booking),
    key: getBookingKey(booking),
    createdAt:
      cleanText(booking.createdAt || booking.created_at) ||
      new Date().toISOString(),
    status: rawStatus,
    computedStatus: getComputedStatus({
      rawStatus,
      bookingAction,
      end,
    }),
    source: cleanText(booking.source || "website"),
    bookingAction,

    amountCents: getAmountCents(booking),
    paymentMethod,

    customerName:
      cleanText(booking.customer_name || contractData.nombreCliente) ||
      "Customer",
    phone: cleanText(booking.phone || contractData.telefono) || "-",
    email: cleanText(booking.customer_email || contractData.email),
    contractNumber:
      cleanText(
        booking.contract_number || contractData.numeroContrato || booking.id
      ) || "-",

    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    startIso: start ? start.toISOString() : null,
    endIso: end ? end.toISOString() : null,

    vehicle,
  };
}

function dedupeBookings(bookings: NormalizedBooking[]) {
  const map = new Map<string, NormalizedBooking>();

  bookings.forEach((booking) => {
    if (!booking.key) return;

    const existing = map.get(booking.key);

    if (!existing) {
      map.set(booking.key, booking);
      return;
    }

    if (existing.source !== "Manual" && booking.source === "Manual") {
      map.set(booking.key, {
        ...booking,
        amountCents: existing.amountCents || booking.amountCents,
      });
      return;
    }

    if (booking.amountCents > existing.amountCents) {
      map.set(booking.key, booking);
    }
  });

  return Array.from(map.values());
}

function sortNewest(bookings: NormalizedBooking[]) {
  return [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function sortByPickup(bookings: NormalizedBooking[]) {
  return [...bookings].sort((a, b) => {
    const startA = a.startIso ? new Date(a.startIso).getTime() : 0;
    const startB = b.startIso ? new Date(b.startIso).getTime() : 0;

    return startA - startB;
  });
}

function publicBookingCard(booking: NormalizedBooking) {
  const start = booking.startIso ? new Date(booking.startIso) : null;
  const end = booking.endIso ? new Date(booking.endIso) : null;

  return {
    id: booking.id,
    key: booking.key,
    source: booking.source,
    status: booking.status,
    computedStatus: booking.computedStatus,
    bookingAction: booking.bookingAction,

    customerName: booking.customerName,
    phone: booking.phone,
    email: booking.email,
    contractNumber: booking.contractNumber,

    amountCents: booking.amountCents,
    paymentMethod: booking.paymentMethod,

    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    dropoffDate: booking.dropoffDate,
    dropoffTime: booking.dropoffTime,
    startIso: booking.startIso,
    endIso: booking.endIso,

    pickupLabel: getPickupLabel(start),
    returnLabel: getReturnLabel(end),
    windowLabel: formatBookingWindow(start, end),

    vehicle: booking.vehicle,
  };
}

function buildDashboardSummary(bookings: NormalizedBooking[]) {
  const now = new Date();

  const activeBookings = sortByPickup(
    bookings.filter((booking) => booking.computedStatus === "rented")
  );

  const upcomingBookings = sortByPickup(
    bookings.filter((booking) => booking.computedStatus === "reserved")
  );

  const wantedBookings = bookings.filter(
    (booking) => booking.computedStatus === "wanted"
  );

  const todayPickups = sortByPickup(
    bookings.filter((booking) => {
      if (
        booking.computedStatus === "cancelled" ||
        booking.computedStatus === "finished"
      ) {
        return false;
      }

      const start = booking.startIso ? new Date(booking.startIso) : null;
      return isSameCalendarDay(start, now);
    })
  );

  const todayReturns = sortByPickup(
    bookings.filter((booking) => {
      if (
        booking.computedStatus === "cancelled" ||
        booking.computedStatus === "finished"
      ) {
        return false;
      }

      const end = booking.endIso ? new Date(booking.endIso) : null;
      return isSameCalendarDay(end, now);
    })
  );

  const fleetRows = nexaFleet.map((vehicle) => {
    const wantedBooking = wantedBookings.find(
      (booking) => booking.vehicle.codigo === vehicle.codigo
    );

    if (wantedBooking) {
      return {
        codigo: vehicle.codigo,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        status: "wanted",
        label: "Problem",
        sub: wantedBooking.status || "Needs attention",
        booking: publicBookingCard(wantedBooking),
      };
    }

    const activeBooking = activeBookings.find(
      (booking) => booking.vehicle.codigo === vehicle.codigo
    );

    if (activeBooking) {
      return {
        codigo: vehicle.codigo,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        status: "rented",
        label: "Rented out",
        sub: `${activeBooking.customerName} · ${
          publicBookingCard(activeBooking).returnLabel
        }`,
        booking: publicBookingCard(activeBooking),
      };
    }

    const nextBooking = upcomingBookings.find(
      (booking) => booking.vehicle.codigo === vehicle.codigo
    );

    if (nextBooking) {
      return {
        codigo: vehicle.codigo,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        status: "reserved",
        label: "Reserved",
        sub: `${nextBooking.customerName} · ${
          publicBookingCard(nextBooking).pickupLabel
        }`,
        booking: publicBookingCard(nextBooking),
      };
    }

    return {
      codigo: vehicle.codigo,
      matricula: vehicle.matricula,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      status: "available",
      label: "Available",
      sub: "Ready to rent now.",
      booking: null,
    };
  });

  const validBookings = bookings.filter(
    (booking) => booking.computedStatus !== "cancelled"
  );

  const totalCents = validBookings.reduce(
    (sum, booking) => sum + booking.amountCents,
    0
  );

  const cashCents = validBookings
    .filter((booking) => booking.paymentMethod === "cash")
    .reduce((sum, booking) => sum + booking.amountCents, 0);

  const cardCents = validBookings
    .filter((booking) => booking.paymentMethod === "card")
    .reduce((sum, booking) => sum + booking.amountCents, 0);

  return {
    generatedAt: new Date().toISOString(),

    stats: {
      totalFleet: nexaFleet.length,
      availableVehicles: fleetRows.filter(
        (vehicle) => vehicle.status === "available"
      ).length,
      rentedVehicles: fleetRows.filter((vehicle) => vehicle.status === "rented")
        .length,
      reservedVehicles: fleetRows.filter(
        (vehicle) => vehicle.status === "reserved"
      ).length,
      wantedVehicles: fleetRows.filter((vehicle) => vehicle.status === "wanted")
        .length,

      totalRevenueCents: totalCents,
      cashRevenueCents: cashCents,
      cardRevenueCents: cardCents,

      totalBookings: bookings.length,
      activeBookings: activeBookings.length,
      upcomingBookings: upcomingBookings.length,
      todayPickups: todayPickups.length,
      todayReturns: todayReturns.length,
    },

    fleetRows,

    rentedVehicles: activeBookings.map(publicBookingCard),
    upcomingReservations: upcomingBookings.slice(0, 12).map(publicBookingCard),
    pickupsToday: todayPickups.slice(0, 12).map(publicBookingCard),
    returnsToday: todayReturns.slice(0, 12).map(publicBookingCard),

    recentBookings: bookings.slice(0, 20).map(publicBookingCard),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json(
        {
          ok: false,
          error: "Supabase ENV vars are not configured.",
          summary: null,
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS);

    if (error) {
      console.error("DASHBOARD SUMMARY GET ERROR:", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          summary: null,
        },
        { status: 500 }
      );
    }

    const normalizedBookings = sortNewest(
      dedupeBookings((data || []).map((booking) => normalizeBooking(booking)))
    );

    const summary = buildDashboardSummary(normalizedBookings);

    return NextResponse.json({
      ok: true,
      summary,
    });
  } catch (error: any) {
    console.error("DASHBOARD SUMMARY GET FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load dashboard summary.",
        summary: null,
      },
      { status: 500 }
    );
  }
}