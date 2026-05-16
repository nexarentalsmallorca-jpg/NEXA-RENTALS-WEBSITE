"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { nexaFleet } from "../../../lib/nexaFleet";
import AdminShell from "../../components/dashboard/AdminShell";
type PaymentMethod = "cash" | "card" | "unpaid";
type BookingAction = "rent_now" | "reserve_now";
type ComputedStatus = "rented" | "reserved" | "finished" | "cancelled" | "problem";

type SavedBooking = {
  id?: string | number;
  createdAt?: string;
  created_at?: string;
  status?: string;
  source?: string;
  booking_action?: BookingAction | string;
  bookingAction?: BookingAction | string;

  stripe_payment_intent_id?: string;
  amount?: number;
  amount_eur?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  contract_number?: string;

  customer_name?: string;
  customer_email?: string;
  phone?: string;
  customer_dni?: string;
  customer_address?: string;

  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;

  vehicle_name?: string;
  vehicle_code?: string;
  rental_days?: string;
  price_per_day?: string;

  vehicle?: {
    codigo?: string;
    matricula?: string;
    marca?: string;
    modelo?: string;
    ano?: string;
    bastidor?: string;
    combustible?: string;
    tipo?: string;
  };

  contractData?: {
    numeroContrato?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    nombreCliente?: string;
    dniPasaporte?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    dias?: string;
    precioPorDia?: string;
    total?: string;
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
    kmSalida?: string;
    combustibleSalida?: string;
    bookingAction?: BookingAction | string;
  };

  contractPdf?: {
    fileName?: string;
    pdfBase64?: string;
    drive?: any;
    generatedAt?: string;
  };
};

type NormalizedBooking = {
  id: string;
  key: string;
  createdAt: string;
  source: string;
  rawStatus: string;
  status: ComputedStatus;
  statusLabel: string;
  bookingAction: BookingAction;

  customerName: string;
  dniPasaporte: string;
  phone: string;
  email: string;
  address: string;

  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  start: Date | null;
  end: Date | null;

  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
  };

  amountCents: number;
  paymentMethod: PaymentMethod;
  contractNumber: string;
  original: SavedBooking;
};

type VehicleSnapshot = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  imageUrl: string;
  status: "available" | "reserved" | "rented" | "problem";
  statusLabel: string;
  statusSub: string;
  booking?: NormalizedBooking;
};

type BookingActionModal = {
  booking: NormalizedBooking;
  action: "cancel" | "picked_up" | "returned";
  step: 1 | 2;
} | null;

function cleanText(value: any) {
  return String(value || "").trim();
}

function normalizeStatusText(value?: string) {
  return cleanText(value).toLowerCase();
}

function safeDateTime(date?: string, time?: string) {
  const cleanDate = cleanText(date);
  if (!cleanDate) return null;

  const cleanTime = cleanText(time) || "00:00";
  const value = new Date(`${cleanDate}T${cleanTime}`);

  return Number.isNaN(value.getTime()) ? null : value;
}

function isSameCalendarDay(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date?: Date | null) {
  return isSameCalendarDay(date, new Date());
}

function isTomorrow(date?: Date | null) {
  if (!date) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return isSameCalendarDay(date, tomorrow);
}

function isFutureDateTime(date?: Date | null) {
  return Boolean(date && date.getTime() > Date.now());
}

function isPastDateTime(date?: Date | null) {
  return Boolean(date && date.getTime() <= Date.now());
}

function formatDisplayDate(date?: Date | null) {
  if (!date) return "No date";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayTime(date?: Date | null) {
  if (!date) return "--:--";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateTime(date?: string, time?: string) {
  return `${date || "--"} · ${time || "--"}`;
}

function formatMoneyFromCents(cents?: number) {
  const value = Number(cents || 0);

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value / 100);
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

function getAmountCents(booking: SavedBooking) {
  if (typeof booking.amount === "number") return booking.amount;

  if (typeof booking.amount_eur === "number") {
    return Math.round(booking.amount_eur * 100);
  }

  return Math.round(moneyTextToNumber(booking.contractData?.total) * 100);
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

function paymentMethodLabel(method: PaymentMethod) {
  if (method === "cash") return "Cash";
  if (method === "card") return "Card";
  return "Unpaid";
}

function paymentMethodClasses(method: PaymentMethod) {
  if (method === "cash") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
  }

  if (method === "card") {
    return "border-sky-400/25 bg-sky-500/10 text-sky-300";
  }

  return "border-white/10 bg-white/[0.06] text-white/45";
}

function isOfficialWebsiteBooking(booking: NormalizedBooking) {
  const source = booking.source.toLowerCase();
  const key = booking.key.toLowerCase();

  if (source === "manual" || key.startsWith("nx-")) return false;

  return (
    source.includes("website") ||
    source.includes("online") ||
    source.includes("stripe")
  );
}

function bookingSourceLabel(booking: NormalizedBooking) {
  return isOfficialWebsiteBooking(booking) ? "Website" : "Manual";
}

function extractVehicleCode(value?: string | null) {
  const match = cleanText(value).match(/\bN\d+\b/i);
  return match?.[0]?.toUpperCase() || "";
}

function parseVehicle(booking: SavedBooking) {
  const code =
    cleanText(booking.vehicle?.codigo) ||
    cleanText(booking.vehicle_code) ||
    extractVehicleCode(booking.vehicle_name);

  const fleetVehicle = code
    ? nexaFleet.find((vehicle) => vehicle.codigo === code)
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
    codigo: code || cleanText(booking.vehicle?.codigo) || "ONLINE",
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

function getVehicleImage(vehicle?: {
  codigo?: string;
  marca?: string;
  modelo?: string;
}) {
  const text = `${vehicle?.codigo || ""} ${vehicle?.marca || ""} ${
    vehicle?.modelo || ""
  }`.toLowerCase();

  if (text.includes("sym") || text.includes("n8")) return "/images/sym1.png";
  if (text.includes("zonte")) return "/images/zontes125.png";
  if (text.includes("e-bike") || text.includes("engwe")) return "/images/e20.png";

  return "/images/liberty125.png";
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
    clean.includes("picked") ||
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

function isProblemStatus(status?: string) {
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
  const now = new Date();

  if (isCancelledStatus(rawStatus)) return "cancelled";
  if (isReturnedStatus(rawStatus)) return "finished";
  if (isProblemStatus(rawStatus)) return "problem";

  if (end && now > end) return "finished";

  if (bookingAction === "rent_now") return "rented";

  return "reserved";
}

function getStatusLabel(status: ComputedStatus) {
  if (status === "rented") return "Rented out";
  if (status === "reserved") return "Reserved";
  if (status === "finished") return "Finished";
  if (status === "cancelled") return "Cancelled";
  return "Problem";
}

function getStatusStyle(status: ComputedStatus) {
  if (status === "rented") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (status === "reserved") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-300";
  }

  if (status === "finished") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "cancelled") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  return "border-red-400/20 bg-red-500/10 text-red-300";
}

function getBookingKey(booking: SavedBooking) {
  return (
    cleanText(booking.stripe_payment_intent_id) ||
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id)
  );
}

function normalizeBooking(booking: SavedBooking): NormalizedBooking {
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

  const status = getComputedStatus({
    rawStatus,
    bookingAction,
    end,
  });

  const vehicle = parseVehicle(booking);

  return {
    id: cleanText(booking.id) || getBookingKey(booking),
    key: getBookingKey(booking),
    createdAt:
      cleanText(booking.createdAt || booking.created_at) ||
      new Date().toISOString(),
    source: cleanText(booking.source || "Manual"),
    rawStatus,
    status,
    statusLabel: getStatusLabel(status),
    bookingAction,

    customerName:
      cleanText(booking.customer_name || contractData.nombreCliente) ||
      "Customer",
    dniPasaporte: cleanText(booking.customer_dni || contractData.dniPasaporte) || "-",
    phone: cleanText(booking.phone || contractData.telefono) || "-",
    email: cleanText(booking.customer_email || contractData.email) || "-",
    address: cleanText(booking.customer_address || contractData.direccion) || "-",

    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    start,
    end,

    vehicle,

    amountCents: getAmountCents(booking),
    paymentMethod,
    contractNumber:
      cleanText(booking.contract_number || contractData.numeroContrato || booking.id) ||
      "-",
    original: booking,
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

    if (
      existing.status === "cancelled" ||
      existing.status === "finished" ||
      booking.status === "cancelled" ||
      booking.status === "finished"
    ) {
      const statusWinner =
        booking.status === "cancelled" || booking.status === "finished"
          ? booking
          : existing;

      map.set(booking.key, {
        ...statusWinner,
        amountCents: existing.amountCents || booking.amountCents,
      });
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
  return [...bookings].sort(
    (a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0)
  );
}

function getPickupLabel(booking: NormalizedBooking) {
  if (!booking.start) return "Pickup date not available";

  if (isToday(booking.start)) {
    return `Pickup today at ${formatDisplayTime(booking.start)}`;
  }

  if (isTomorrow(booking.start)) {
    return `Pickup tomorrow at ${formatDisplayTime(booking.start)}`;
  }

  return `Pickup on ${formatDisplayDate(booking.start)} at ${formatDisplayTime(
    booking.start
  )}`;
}

function getReturnLabel(booking: NormalizedBooking) {
  if (!booking.end) return "Return date not available";

  if (isToday(booking.end)) {
    return `Returns today at ${formatDisplayTime(booking.end)}`;
  }

  if (isTomorrow(booking.end)) {
    return `Returns tomorrow at ${formatDisplayTime(booking.end)}`;
  }

  return `Returns on ${formatDisplayDate(booking.end)} at ${formatDisplayTime(
    booking.end
  )}`;
}

function getStoredManualBookings(): SavedBooking[] {
  if (typeof window === "undefined") return [];

  try {
    const savedBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    return Array.isArray(savedBookings) ? savedBookings : [];
  } catch {
    return [];
  }
}

function saveManualBookings(bookings: SavedBooking[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nexa_manual_bookings", JSON.stringify(bookings));
}

async function fetchApiBookings(): Promise<SavedBooking[]> {
  try {
    const response = await fetch("/api/admin/bookings", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();

    return Array.isArray(data?.bookings) ? data.bookings : [];
  } catch {
    return [];
  }
}

async function updateBookingStatusInApi(
  booking: NormalizedBooking,
  action: "cancel" | "picked_up" | "returned"
) {
  try {
    const response = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: booking.id,
        bookingKey: booking.key,
        key: booking.key,
        stripePaymentIntentId: booking.key,
        stripe_payment_intent_id: booking.key,
        contractNumber: booking.contractNumber,
        contract_number: booking.contractNumber,
        booking: {
          id: booking.id,
          key: booking.key,
          contractNumber: booking.contractNumber,
          contractData: {
            numeroContrato: booking.contractNumber,
          },
        },
        action,
        reason: `Action ${action} from NEXA admin bookings page`,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}

function getNextLocalStatus(action: "cancel" | "picked_up" | "returned") {
  if (action === "cancel") return "cancelled";
  if (action === "picked_up") return "rented_out";
  return "returned";
}

function vehicleStatusClasses(status: VehicleSnapshot["status"]) {
  if (status === "available") return "border-emerald-400/20 bg-emerald-500/10";
  if (status === "rented") return "border-orange-400/20 bg-orange-500/10";
  if (status === "problem") return "border-red-400/20 bg-red-500/10";
  return "border-sky-400/20 bg-sky-500/10";
}

function vehicleBadgeClasses(status: VehicleSnapshot["status"]) {
  if (status === "available") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "rented") {
    return "border-orange-400/20 bg-orange-500/10 text-orange-300";
  }

  if (status === "problem") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  return "border-sky-400/20 bg-sky-500/10 text-sky-300";
}

export default function BookingsPage() {
  const [rawBookings, setRawBookings] = useState<SavedBooking[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<NormalizedBooking | null>(
    null
  );
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleSnapshot | null>(null);
  const [actionModal, setActionModal] = useState<BookingActionModal>(null);
  const [syncNotice, setSyncNotice] = useState("");
  const [isActionSaving, setIsActionSaving] = useState(false);

  async function loadBookings() {
    setLoading(true);

    const manualBookings = getStoredManualBookings();
    const apiBookings = await fetchApiBookings();

    setRawBookings([...apiBookings, ...manualBookings]);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();

    function refreshFromStorage() {
      loadBookings();
    }

    window.addEventListener("storage", refreshFromStorage);

    return () => {
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  const data = useMemo(() => {
    const allBookings = sortNewest(
      dedupeBookings(rawBookings.map((booking) => normalizeBooking(booking)))
    );

    const activeBookings = sortByPickup(
      allBookings.filter((booking) => booking.status === "rented")
    );

    const upcomingBookings = sortByPickup(
      allBookings.filter((booking) => booking.status === "reserved")
    );

    const finishedBookings = allBookings.filter(
      (booking) => booking.status === "finished"
    );

    const cancelledBookings = allBookings.filter(
      (booking) => booking.status === "cancelled"
    );

    const todayPickups = sortByPickup(
      allBookings.filter(
        (booking) =>
          booking.status !== "cancelled" &&
          booking.status !== "finished" &&
          isToday(booking.start) &&
          isFutureDateTime(booking.start)
      )
    );

    const missedPickups = sortByPickup(
      allBookings.filter(
        (booking) =>
          booking.status === "reserved" &&
          isToday(booking.start) &&
          isPastDateTime(booking.start)
      )
    );

    const returningToday = sortByPickup(
      allBookings.filter(
        (booking) =>
          booking.status !== "cancelled" &&
          booking.status !== "finished" &&
          isToday(booking.end)
      )
    );

    const reservationsTomorrow = sortByPickup(
      upcomingBookings.filter((booking) => isTomorrow(booking.start))
    );

    const visibleSearch = search.trim().toLowerCase();

    const filteredBookings = visibleSearch
      ? allBookings.filter((booking) => {
          const text = [
            booking.id,
            booking.source,
            booking.rawStatus,
            booking.statusLabel,
            booking.paymentMethod,
            booking.vehicle.codigo,
            booking.vehicle.matricula,
            booking.vehicle.marca,
            booking.vehicle.modelo,
            booking.customerName,
            booking.dniPasaporte,
            booking.phone,
            booking.email,
            booking.contractNumber,
          ]
            .join(" ")
            .toLowerCase();

          return text.includes(visibleSearch);
        })
      : allBookings;

    const totalCents = allBookings
      .filter((booking) => booking.status !== "cancelled")
      .reduce((sum, booking) => sum + booking.amountCents, 0);

    const cashCents = allBookings
      .filter(
        (booking) =>
          booking.status !== "cancelled" && booking.paymentMethod === "cash"
      )
      .reduce((sum, booking) => sum + booking.amountCents, 0);

    const cardCents = allBookings
      .filter(
        (booking) =>
          booking.status !== "cancelled" && booking.paymentMethod === "card"
      )
      .reduce((sum, booking) => sum + booking.amountCents, 0);

    const vehicleSnapshots: VehicleSnapshot[] = nexaFleet.map((vehicle) => {
      const problemBooking = allBookings.find(
        (booking) =>
          booking.vehicle.codigo === vehicle.codigo && booking.status === "problem"
      );

      if (problemBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "problem",
          booking: problemBooking,
          statusLabel: "Problem",
          statusSub: problemBooking.rawStatus || "Needs attention",
        };
      }

      const rentedBooking = activeBookings.find(
        (booking) => booking.vehicle.codigo === vehicle.codigo
      );

      if (rentedBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "rented",
          booking: rentedBooking,
          statusLabel: "Rented out",
          statusSub: `${rentedBooking.customerName} · ${getReturnLabel(
            rentedBooking
          )}`,
        };
      }

      const reservedBooking = upcomingBookings.find(
        (booking) => booking.vehicle.codigo === vehicle.codigo
      );

      if (reservedBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "reserved",
          booking: reservedBooking,
          statusLabel: "Reserved",
          statusSub: `${reservedBooking.customerName} · ${getPickupLabel(
            reservedBooking
          )}`,
        };
      }

      return {
        codigo: vehicle.codigo,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        imageUrl: getVehicleImage(vehicle),
        status: "available",
        statusLabel: "Available now",
        statusSub: "No active or upcoming booking found.",
      };
    });

    return {
      allBookings,
      filteredBookings,
      activeBookings,
      upcomingBookings,
      finishedBookings,
      cancelledBookings,
      todayPickups,
      missedPickups,
      returningToday,
      reservationsTomorrow,
      totalCents,
      cashCents,
      cardCents,
      vehicleSnapshots,
    };
  }, [rawBookings, search]);

  function updateBookingInLocalState(
    booking: NormalizedBooking,
    action: "cancel" | "picked_up" | "returned"
  ) {
    const nextStatus = getNextLocalStatus(action);

    setRawBookings((prev) =>
      prev.map((item) => {
        const key = getBookingKey(item);

        if (key !== booking.key) return item;

        return {
          ...item,
          status: nextStatus,
          booking_action: action === "picked_up" ? "rent_now" : item.booking_action,
          bookingAction: action === "picked_up" ? "rent_now" : item.bookingAction,
          contractData: {
            ...item.contractData,
            bookingAction:
              action === "picked_up"
                ? "rent_now"
                : item.contractData?.bookingAction,
          },
        };
      })
    );

    const manualBookings = getStoredManualBookings();

    const updatedManualBookings = manualBookings.map((item) => {
      const key = getBookingKey(item);

      if (key !== booking.key) return item;

      return {
        ...item,
        status: nextStatus,
        booking_action: action === "picked_up" ? "rent_now" : item.booking_action,
        bookingAction: action === "picked_up" ? "rent_now" : item.bookingAction,
        contractData: {
          ...item.contractData,
          bookingAction:
            action === "picked_up"
              ? "rent_now"
              : item.contractData?.bookingAction,
        },
      };
    });

    saveManualBookings(updatedManualBookings);
  }

  async function completeAction() {
    if (!actionModal || isActionSaving) return;

    const { booking, action } = actionModal;

    setIsActionSaving(true);
    updateBookingInLocalState(booking, action);

    const apiOk = await updateBookingStatusInApi(booking, action);

    if (apiOk) {
      setSyncNotice(
        action === "cancel"
          ? "Booking cancelled and synced. Vehicle is available again."
          : action === "picked_up"
          ? "Booking marked as rented out and synced."
          : "Booking marked as returned and synced. Vehicle is available again."
      );

      await loadBookings();
    } else {
      setSyncNotice(
        "Status updated on this screen, but Supabase did not find that booking row. If it was a browser-only test booking, it is now cleared locally."
      );
    }

    setActionModal(null);
    setSelectedBooking(null);
    setSelectedVehicle(null);
    setIsActionSaving(false);

    window.setTimeout(() => {
      setSyncNotice("");
    }, 6500);
  }

  function clearManualTestData() {
    const confirmed = window.confirm(
      "Delete only manual bookings stored in this browser localStorage? Supabase bookings will not be deleted."
    );

    if (!confirmed) return;

    localStorage.removeItem("nexa_manual_bookings");
    loadBookings();
  }

  return (
  <AdminShell>
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">
              NEXA Control Center
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              Bookings & Fleet Status
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/45">
              Rented out means the scooter is with a customer. Past return dates
              are automatically treated as finished.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
              <StatusPill
                label={loading ? "Loading bookings..." : "Bookings loaded"}
                tone={loading ? "sky" : "emerald"}
              />

              <StatusPill
                label={`Total revenue ${formatMoneyFromCents(data.totalCents)}`}
                tone="white"
              />

              <StatusPill
                label={`Cash ${formatMoneyFromCents(data.cashCents)}`}
                tone="emerald"
              />

              <StatusPill
                label={`Card ${formatMoneyFromCents(data.cardCents)}`}
                tone="sky"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={loadBookings}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.045] px-5 py-3 text-sm font-black text-white/65 transition hover:bg-white/[0.08] hover:text-white"
            >
              Refresh
            </button>

            <button
              onClick={clearManualTestData}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15"
            >
              Clear Local Test Data
            </button>

            <Link
              href="/admin-nexa-secret/create-booking"
              className="rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-center text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.20)] transition hover:-translate-y-0.5"
            >
              + Create Booking
            </Link>
          </div>
        </div>
      </section>

      {syncNotice ? (
        <section className="rounded-[22px] border border-sky-400/20 bg-sky-500/10 px-5 py-4 text-sm font-bold text-sky-200">
          {syncNotice}
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total" value={data.allBookings.length} tone="orange" />
        <StatCard label="Reserved" value={data.upcomingBookings.length} tone="sky" />
        <StatCard label="Rented out" value={data.activeBookings.length} tone="orange" />
        <StatCard label="Finished" value={data.finishedBookings.length} tone="emerald" />
        <StatCard label="Cancelled" value={data.cancelledBookings.length} tone="red" />
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <AlertBox
          title="Pickups today"
          tone="yellow"
          emptyText="No pickups scheduled for today."
          bookings={data.todayPickups}
          labelFn={getPickupLabel}
          onOpen={setSelectedBooking}
        />

        <AlertBox
          title="Returns today"
          tone="orange"
          emptyText="No vehicles returning today."
          bookings={data.returningToday}
          labelFn={getReturnLabel}
          onOpen={setSelectedBooking}
        />

        <AlertBox
          title="Tomorrow reservations"
          tone="sky"
          emptyText="No reservations for tomorrow."
          bookings={data.reservationsTomorrow}
          labelFn={getPickupLabel}
          onOpen={setSelectedBooking}
        />
      </section>

      <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Live fleet board
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              Vehicle Status Panel
            </h3>
          </div>

          <p className="text-sm font-bold text-white/40">
            Finished bookings do not keep vehicles blocked.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.vehicleSnapshots.map((vehicle) => (
            <button
              key={vehicle.codigo}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`group relative overflow-hidden rounded-[24px] border p-4 text-left transition hover:-translate-y-0.5 ${vehicleStatusClasses(
                vehicle.status
              )}`}
            >
              <div className="absolute right-3 top-3 z-10">
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${vehicleBadgeClasses(
                    vehicle.status
                  )}`}
                >
                  {vehicle.statusLabel}
                </span>
              </div>

              <div className="relative h-28 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.codigo} ${vehicle.marca} ${vehicle.modelo}`}
                  className="h-full w-full object-contain p-3 drop-shadow-[0_22px_24px_rgba(0,0,0,0.45)] transition duration-300 group-hover:scale-105"
                />
              </div>

              <div className="mt-4">
                <p className="text-2xl font-black text-white">{vehicle.codigo}</p>

                <p className="mt-1 text-sm font-bold text-white/60">
                  {vehicle.matricula} · {vehicle.marca} {vehicle.modelo}
                </p>

                <p className="mt-3 text-xs font-bold leading-5 text-white/45">
                  {vehicle.statusSub}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by contract, customer, ID, plate, phone, payment method..."
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
        />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] shadow-[0_18px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        <div className="hidden grid-cols-11 border-b border-white/[0.08] bg-white/[0.025] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/35 xl:grid">
          <div>Contract</div>
          <div>Source</div>
          <div className="col-span-2">Customer</div>
          <div>Vehicle</div>
          <div>Pickup</div>
          <div>Return</div>
          <div>Status</div>
          <div>Payment</div>
          <div className="text-right">Total</div>
          <div className="text-right">Actions</div>
        </div>

        {data.filteredBookings.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-2xl font-black text-white">No bookings found</p>
            <p className="mt-2 text-sm font-medium text-white/45">
              Create a manual booking or wait for an online booking.
            </p>
          </div>
        ) : (
          data.filteredBookings.map((booking) => {
            const isCancelled = booking.status === "cancelled";
            const isFinished = booking.status === "finished";

            return (
              <div
                key={`${booking.source}-${booking.key}`}
                className="grid gap-4 border-b border-white/5 px-5 py-5 text-sm transition hover:bg-white/[0.035] xl:grid-cols-11 xl:items-center"
              >
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="text-left"
                >
                  <p className="font-black text-white">{booking.contractNumber}</p>

                  <p className="mt-1 text-xs text-white/35">
                    {new Date(booking.createdAt).toLocaleString("en-GB")}
                  </p>
                </button>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${
                      isOfficialWebsiteBooking(booking)
                        ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
                        : "border-orange-400/20 bg-orange-500/10 text-orange-300"
                    }`}
                  >
                    {bookingSourceLabel(booking)}
                  </span>
                  {booking.status === "reserved" &&
                  isToday(booking.start) &&
                  isPastDateTime(booking.start) ? (
                    <p className="mt-2 text-xs font-bold text-yellow-300">
                      Pickup time passed
                    </p>
                  ) : null}
                </div>

                <div className="xl:col-span-2">
                  <p className="font-black text-white">{booking.customerName}</p>

                  <p className="mt-1 text-xs text-white/40">
                    ID/Passport: {booking.dniPasaporte}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Phone: {booking.phone}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Email: {booking.email}
                  </p>
                </div>

                <div>
                  <p className="font-black text-white">{booking.vehicle.codigo}</p>

                  <p className="mt-1 text-xs text-white/45">
                    {booking.vehicle.matricula} · {booking.vehicle.marca}{" "}
                    {booking.vehicle.modelo}
                  </p>
                </div>

                <div className="font-medium text-white/60">
                  {formatDateTime(booking.pickupDate, booking.pickupTime)}
                </div>

                <div className="font-medium text-white/60">
                  {formatDateTime(booking.dropoffDate, booking.dropoffTime)}
                </div>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.statusLabel}
                  </span>

                  {booking.status === "rented" ? (
                    <p className="mt-2 text-xs font-bold text-orange-200">
                      {getReturnLabel(booking)}
                    </p>
                  ) : null}

                  {booking.status === "reserved" ? (
                    <p className="mt-2 text-xs font-bold text-sky-200">
                      {getPickupLabel(booking)}
                    </p>
                  ) : null}
                </div>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${paymentMethodClasses(
                      booking.paymentMethod
                    )}`}
                  >
                    {paymentMethodLabel(booking.paymentMethod)}
                  </span>
                </div>

                <div className="text-right text-lg font-black text-white">
                  {formatMoneyFromCents(booking.amountCents)}
                </div>

                <div className="flex flex-col gap-2 xl:items-end">
                  {!isCancelled && !isFinished && booking.status !== "rented" ? (
                    <button
                      onClick={() =>
                        setActionModal({
                          booking,
                          action: "picked_up",
                          step: 1,
                        })
                      }
                      className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/15"
                    >
                      Rent out
                    </button>
                  ) : null}

                  {!isCancelled && booking.status === "rented" ? (
                    <button
                      onClick={() =>
                        setActionModal({
                          booking,
                          action: "returned",
                          step: 1,
                        })
                      }
                      className="rounded-xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-xs font-black text-sky-300 transition hover:bg-sky-500/15"
                    >
                      Returned
                    </button>
                  ) : null}

                  {!isCancelled && !isFinished ? (
                    <button
                      onClick={() =>
                        setActionModal({
                          booking,
                          action: "cancel",
                          step: 1,
                        })
                      }
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 transition hover:bg-red-500/15"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </section>

      {selectedBooking ? (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={(action) =>
            setActionModal({
              booking: selectedBooking,
              action,
              step: 1,
            })
          }
        />
      ) : null}

      {selectedVehicle ? (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onOpenBooking={(booking) => {
            setSelectedBooking(booking);
            setSelectedVehicle(null);
          }}
        />
      ) : null}

      {actionModal ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[30px] border border-red-400/20 bg-[#080A10] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-300">
              Safety confirmation {actionModal.step}/2
            </p>

            <h3 className="mt-3 text-3xl font-black text-white">
              {actionModal.step === 1
                ? "Please confirm this action"
                : "Final confirmation required"}
            </h3>

            <p className="mt-4 text-sm font-bold leading-6 text-white/55">
              You are about to{" "}
              <span className="text-white">
                {actionModal.action === "cancel"
                  ? "cancel this booking"
                  : actionModal.action === "picked_up"
                  ? "mark this vehicle as rented out"
                  : "mark this vehicle as returned"}
              </span>{" "}
              for{" "}
              <span className="text-white">
                {actionModal.booking.vehicle.codigo} ·{" "}
                {actionModal.booking.customerName}
              </span>
              .
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                disabled={isActionSaving}
                onClick={() => setActionModal(null)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Go back
              </button>

              {actionModal.step === 1 ? (
                <button
                  disabled={isActionSaving}
                  onClick={() =>
                    setActionModal({
                      ...actionModal,
                      step: 2,
                    })
                  }
                  className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-5 py-3 text-sm font-black text-yellow-300 transition hover:bg-yellow-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Yes, continue
                </button>
              ) : (
                <button
                  disabled={isActionSaving}
                  onClick={completeAction}
                  className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isActionSaving ? "Saving..." : "Final confirm"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </AdminShell>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "emerald" | "sky" | "white";
}) {
  const styles = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    white: "border-white/[0.08] bg-white/[0.045] text-white/55",
  };

  return (
    <span className={`rounded-2xl border px-4 py-3 text-xs font-black ${styles[tone]}`}>
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "orange" | "sky" | "yellow" | "red" | "emerald";
}) {
  const styles = {
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <div className={`rounded-[24px] border p-5 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em]">{label}</p>
      <p className="mt-2 text-4xl font-black text-white">{value}</p>
    </div>
  );
}

function AlertBox({
  title,
  tone,
  emptyText,
  bookings,
  labelFn,
  onOpen,
}: {
  title: string;
  tone: "yellow" | "orange" | "sky";
  emptyText: string;
  bookings: NormalizedBooking[];
  labelFn: (booking: NormalizedBooking) => string;
  onOpen: (booking: NormalizedBooking) => void;
}) {
  const styles = {
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  };

  return (
    <div className={`rounded-[24px] border p-5 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em]">{title}</p>

      <div className="mt-4 space-y-2">
        {bookings.length === 0 ? (
          <p className="text-sm font-bold text-white/45">{emptyText}</p>
        ) : (
          bookings.slice(0, 4).map((booking) => (
            <button
              key={`${title}-${booking.key}`}
              onClick={() => onOpen(booking)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-left transition hover:bg-white/[0.08]"
            >
              <p className="text-sm font-black text-white">
                {booking.vehicle.codigo} · {booking.customerName}
              </p>
              <p className="mt-1 text-xs font-bold text-white/70">
                {labelFn(booking)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function BookingDetailsModal({
  booking,
  onClose,
  onAction,
}: {
  booking: NormalizedBooking;
  onClose: () => void;
  onAction: (action: "cancel" | "picked_up" | "returned") => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#080A10] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">
              Booking details
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              {booking.vehicle.codigo} · {booking.customerName}
            </h3>

            <p className="mt-2 text-sm font-bold text-white/45">
              Contract: {booking.contractNumber}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/60 transition hover:bg-white/[0.1]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <img
              src={getVehicleImage(booking.vehicle)}
              alt={booking.vehicle.codigo}
              className="h-48 w-full object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.55)]"
            />

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-2xl font-black text-white">
                {booking.vehicle.codigo}
              </p>

              <p className="mt-1 text-sm font-bold text-white/60">
                {booking.vehicle.matricula} · {booking.vehicle.marca}{" "}
                {booking.vehicle.modelo}
              </p>

              <p className="mt-3 text-xs font-bold text-white/40">
                Status: {booking.statusLabel}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <DetailRow
              label="Pickup"
              value={formatDateTime(booking.pickupDate, booking.pickupTime)}
            />
            <DetailRow
              label="Return"
              value={formatDateTime(booking.dropoffDate, booking.dropoffTime)}
            />
            <DetailRow label="Customer" value={booking.customerName} />
            <DetailRow label="Phone" value={booking.phone} />
            <DetailRow label="Email" value={booking.email} />
            <DetailRow label="ID / Passport" value={booking.dniPasaporte} />
            <DetailRow
              label="Total"
              value={formatMoneyFromCents(booking.amountCents)}
            />
            <DetailRow
              label="Payment method"
              value={paymentMethodLabel(booking.paymentMethod)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {booking.status !== "cancelled" && booking.status !== "finished" ? (
            <button
              onClick={() => onAction("cancel")}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15"
            >
              Cancel booking
            </button>
          ) : null}

          {booking.status !== "rented" &&
          booking.status !== "cancelled" &&
          booking.status !== "finished" ? (
            <button
              onClick={() => onAction("picked_up")}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-500/15"
            >
              Mark as rented out
            </button>
          ) : null}

          {booking.status === "rented" ? (
            <button
              onClick={() => onAction("returned")}
              className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-5 py-3 text-sm font-black text-sky-300 transition hover:bg-sky-500/15"
            >
              Mark as returned
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VehicleDetailsModal({
  vehicle,
  onClose,
  onOpenBooking,
}: {
  vehicle: VehicleSnapshot;
  onClose: () => void;
  onOpenBooking: (booking: NormalizedBooking) => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-[#080A10] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">
              Vehicle status
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              {vehicle.codigo} · {vehicle.marca} {vehicle.modelo}
            </h3>

            <p className="mt-2 text-sm font-bold text-white/45">
              Plate: {vehicle.matricula}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white/60 transition hover:bg-white/[0.1]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
          <img
            src={vehicle.imageUrl}
            alt={vehicle.codigo}
            className="h-64 w-full object-contain p-4 drop-shadow-[0_30px_35px_rgba(0,0,0,0.55)]"
          />
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${vehicleBadgeClasses(
              vehicle.status
            )}`}
          >
            {vehicle.statusLabel}
          </span>

          <p className="mt-4 text-lg font-black text-white">
            {vehicle.statusSub}
          </p>

          {vehicle.booking ? (
            <div className="mt-4 space-y-2 text-sm font-bold text-white/55">
              <p>
                Customer:{" "}
                <span className="text-white">{vehicle.booking.customerName}</span>
              </p>

              <p>
                Phone: <span className="text-white">{vehicle.booking.phone}</span>
              </p>

              <p>
                Contract:{" "}
                <span className="text-white">
                  {vehicle.booking.contractNumber}
                </span>
              </p>

              <p>
                Payment:{" "}
                <span className="text-white">
                  {paymentMethodLabel(vehicle.booking.paymentMethod)}
                </span>
              </p>

              <p>
                Total:{" "}
                <span className="text-white">
                  {formatMoneyFromCents(vehicle.booking.amountCents)}
                </span>
              </p>

              <p>
                Pickup:{" "}
                <span className="text-white">
                  {formatDateTime(
                    vehicle.booking.pickupDate,
                    vehicle.booking.pickupTime
                  )}
                </span>
              </p>

              <p>
                Return:{" "}
                <span className="text-white">
                  {formatDateTime(
                    vehicle.booking.dropoffDate,
                    vehicle.booking.dropoffTime
                  )}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-emerald-300">
              This vehicle is currently available.
            </p>
          )}
        </div>

        {vehicle.booking ? (
          <button
            onClick={() => onOpenBooking(vehicle.booking!)}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.25)] transition hover:-translate-y-0.5"
          >
            Open booking details
          </button>
        ) : null}
      </div>
    </div>
  );
}
