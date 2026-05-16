"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
  Wrench,
} from "lucide-react";
import AdminShell from "../components/dashboard/AdminShell";
import { nexaFleet } from "../../lib/nexaFleet";

type BookingAction = "rent_now" | "reserve_now";
type BookingStatus = "rented" | "reserved" | "finished" | "cancelled" | "wanted";
type NoticeTone = "red" | "yellow" | "sky" | "emerald" | "white";

type SavedBooking = {
  id?: string | number;
  createdAt?: string;
  created_at?: string;
  status?: string;
  source?: string;
  booking_action?: string;
  bookingAction?: string;
  stripe_payment_intent_id?: string;
  amount?: number;
  amount_eur?: number;
  payment_method?: string;
  contract_number?: string;
  customer_name?: string;
  customer_email?: string;
  phone?: string;
  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;
  vehicle_name?: string;
  vehicle_code?: string;
  assigned_vehicle_code?: string;
  scooter_code?: string;
  vehicle?: {
    codigo?: string;
    matricula?: string;
    marca?: string;
    modelo?: string;
    imageUrl?: string;
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
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
    bookingAction?: string;
  };
};

type NormalizedBooking = {
  id: string;
  key: string;
  createdAt: string;
  status: string;
  computedStatus: BookingStatus;
  source: string;
  bookingAction: BookingAction;
  amountCents: number;
  paymentMethod: "cash" | "card" | "unpaid";
  customerName: string;
  phone: string;
  email: string;
  contractNumber: string;
  start: Date | null;
  end: Date | null;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
    imageUrl: string;
  };
};

type FleetRow = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  imageUrl: string;
  status: "available" | "rented" | "reserved" | "wanted";
  label: string;
  detail: string;
  booking?: NormalizedBooking;
};

type MaintenanceRecord = {
  vehicleCode: string;
  currentKm: string;
  nextOilKm: string;
  lastCleaningDate: string;
  lastTirePressureDate: string;
  lastLightsCheckDate: string;
  lastBrakeCheckDate: string;
};

type DashboardNotice = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  tone: NoticeTone;
  icon: "bell" | "clock" | "alert" | "check" | "wrench";
  href?: string;
};

const MAINTENANCE_STORAGE_KEY = "nexa_vehicle_maintenance";

function cleanText(value: unknown) {
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

function isWithinHours(date: Date | null, hours: number) {
  if (!date) return false;
  const diff = date.getTime() - Date.now();
  return diff >= 0 && diff <= hours * 60 * 60 * 1000;
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

function formatMoney(cents?: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(cents || 0) / 100);
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
  if (typeof booking.amount_eur === "number") return Math.round(booking.amount_eur * 100);
  return Math.round(moneyTextToNumber(booking.contractData?.total) * 100);
}

function normalizeBookingAction(value?: string): BookingAction {
  const clean = normalizeStatusText(value);

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

function isCancelledStatus(status?: string) {
  const clean = normalizeStatusText(status);
  return clean.includes("cancel") || clean.includes("failed") || clean.includes("refunded");
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
    clean.includes("averia")
  );
}

function normalizePaymentMethod(value?: string): "cash" | "card" | "unpaid" {
  const clean = normalizeStatusText(value);

  if (clean.includes("cash") || clean.includes("efectivo")) return "cash";
  if (clean.includes("card") || clean.includes("tarjeta") || clean.includes("stripe")) return "card";
  return "unpaid";
}

function getVehicleImage(vehicle?: { codigo?: string; marca?: string; modelo?: string; imageUrl?: string }) {
  if (vehicle?.imageUrl) return vehicle.imageUrl;

  const text = `${vehicle?.codigo || ""} ${vehicle?.marca || ""} ${vehicle?.modelo || ""}`.toLowerCase();

  if (text.includes("sym") || text.includes("n8")) return "/images/sym1.png";
  if (text.includes("zonte")) return "/images/zontes125.png";
  if (text.includes("e-bike") || text.includes("engwe")) return "/images/e20.png";
  return "/images/liberty125.png";
}

function parseVehicle(booking: SavedBooking) {
  const code =
    cleanText(booking.vehicle?.codigo) ||
    cleanText(booking.assigned_vehicle_code) ||
    cleanText(booking.vehicle_code) ||
    cleanText(booking.scooter_code) ||
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
      imageUrl: getVehicleImage(fleetVehicle),
    };
  }

  const vehicleName = cleanText(booking.vehicle_name);
  const text = `${vehicleName} ${booking.vehicle?.marca || ""} ${booking.vehicle?.modelo || ""}`.toLowerCase();

  const vehicle = {
    codigo: code || cleanText(booking.vehicle?.codigo) || "ONLINE",
    matricula: cleanText(booking.vehicle?.matricula) || "-",
    marca:
      cleanText(booking.vehicle?.marca) ||
      (text.includes("sym") ? "SYM" : text.includes("piaggio") ? "Piaggio" : "Vehicle"),
    modelo:
      cleanText(booking.vehicle?.modelo) ||
      (text.includes("sym") ? "Symphony 125" : text.includes("piaggio") ? "Liberty 125" : vehicleName),
  };

  return {
    ...vehicle,
    imageUrl: getVehicleImage(vehicle),
  };
}

function getBookingKey(booking: SavedBooking) {
  return (
    cleanText(booking.stripe_payment_intent_id) ||
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id)
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
}): BookingStatus {
  if (isCancelledStatus(rawStatus)) return "cancelled";
  if (isReturnedStatus(rawStatus)) return "finished";
  if (isWantedStatus(rawStatus)) return "wanted";
  if (end && Date.now() > end.getTime()) return "finished";
  return bookingAction === "rent_now" ? "rented" : "reserved";
}

function normalizeBooking(booking: SavedBooking): NormalizedBooking {
  const contractData = booking.contractData || {};
  const pickupDate = cleanText(booking.pickup_date || contractData.fechaEntrega);
  const pickupTime = cleanText(booking.pickup_time || contractData.horaEntrega);
  const dropoffDate = cleanText(booking.dropoff_date || contractData.fechaDevolucion);
  const dropoffTime = cleanText(booking.dropoff_time || contractData.horaDevolucion);
  const start = safeDateTime(pickupDate, pickupTime);
  const end = safeDateTime(dropoffDate, dropoffTime);
  const rawStatus = cleanText(booking.status || "reserved");
  const bookingAction = normalizeBookingAction(
    booking.booking_action ||
      booking.bookingAction ||
      contractData.bookingAction ||
      rawStatus
  );

  return {
    id: cleanText(booking.id) || getBookingKey(booking),
    key: getBookingKey(booking),
    createdAt: cleanText(booking.createdAt || booking.created_at) || new Date().toISOString(),
    status: rawStatus,
    computedStatus: getComputedStatus({ rawStatus, bookingAction, end }),
    source: cleanText(booking.source || "Manual"),
    bookingAction,
    amountCents: getAmountCents(booking),
    paymentMethod: normalizePaymentMethod(
      booking.payment_method ||
        contractData.metodoPago ||
        contractData.paymentMethod ||
        contractData.pagado
    ),
    customerName: cleanText(booking.customer_name || contractData.nombreCliente) || "Customer",
    phone: cleanText(booking.phone || contractData.telefono) || "-",
    email: cleanText(booking.customer_email || contractData.email) || "-",
    contractNumber: cleanText(booking.contract_number || contractData.numeroContrato || booking.id) || "-",
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    start,
    end,
    vehicle: parseVehicle(booking),
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
      existing.computedStatus === "cancelled" ||
      existing.computedStatus === "finished" ||
      booking.computedStatus === "cancelled" ||
      booking.computedStatus === "finished"
    ) {
      const statusWinner =
        booking.computedStatus === "cancelled" ||
        booking.computedStatus === "finished"
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

    if (booking.amountCents > existing.amountCents) map.set(booking.key, booking);
  });

  return Array.from(map.values());
}

function sortNewest(bookings: NormalizedBooking[]) {
  return [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function sortByPickup(bookings: NormalizedBooking[]) {
  return [...bookings].sort((a, b) => (a.start?.getTime() || 0) - (b.start?.getTime() || 0));
}

function getPickupLabel(booking: NormalizedBooking) {
  if (!booking.start) return "Pickup date not available";
  if (isToday(booking.start)) return `Today at ${formatDisplayTime(booking.start)}`;
  if (isTomorrow(booking.start)) return `Tomorrow at ${formatDisplayTime(booking.start)}`;
  return `${formatDisplayDate(booking.start)} at ${formatDisplayTime(booking.start)}`;
}

function getReturnLabel(booking: NormalizedBooking) {
  if (!booking.end) return "Return date not available";
  if (isToday(booking.end)) return `Returns today at ${formatDisplayTime(booking.end)}`;
  if (isTomorrow(booking.end)) return `Returns tomorrow at ${formatDisplayTime(booking.end)}`;
  return `Returns ${formatDisplayDate(booking.end)} at ${formatDisplayTime(booking.end)}`;
}

function getStoredManualBookings(): SavedBooking[] {
  if (typeof window === "undefined") return [];

  try {
    const savedBookings = JSON.parse(localStorage.getItem("nexa_manual_bookings") || "[]");
    return Array.isArray(savedBookings) ? savedBookings : [];
  } catch {
    return [];
  }
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

function numberValue(value?: string) {
  const parsed = Number(String(value || "").replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysSince(dateValue?: string) {
  if (!dateValue) return 9999;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 9999;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function loadMaintenanceRecords(): MaintenanceRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(localStorage.getItem(MAINTENANCE_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function buildMaintenanceNotices(records: MaintenanceRecord[]): DashboardNotice[] {
  const notices: DashboardNotice[] = [];

  records.forEach((record) => {
    const currentKm = numberValue(record.currentKm);
    const nextOilKm = numberValue(record.nextOilKm);
    const cleaningDays = daysSince(record.lastCleaningDate);
    const tireDays = daysSince(record.lastTirePressureDate);
    const lightsDays = daysSince(record.lastLightsCheckDate);
    const brakeDays = daysSince(record.lastBrakeCheckDate);

    if (nextOilKm && currentKm && nextOilKm - currentKm <= 0) {
      notices.push({
        id: `${record.vehicleCode}-oil`,
        title: `${record.vehicleCode} oil service due`,
        detail: `Reached ${currentKm} km.`,
        meta: "Maintenance",
        tone: "red",
        icon: "wrench",
        href: "/admin-nexa-secret/maintenance",
      });
    } else if (nextOilKm && currentKm && nextOilKm - currentKm <= 250) {
      notices.push({
        id: `${record.vehicleCode}-oil-soon`,
        title: `${record.vehicleCode} oil service soon`,
        detail: `${nextOilKm - currentKm} km remaining.`,
        meta: "Maintenance",
        tone: "yellow",
        icon: "wrench",
        href: "/admin-nexa-secret/maintenance",
      });
    }

    if (cleaningDays > 7) {
      notices.push({
        id: `${record.vehicleCode}-cleaning`,
        title: `${record.vehicleCode} cleaning overdue`,
        detail: `${cleaningDays} days since last cleaning.`,
        meta: "Maintenance",
        tone: "yellow",
        icon: "wrench",
        href: "/admin-nexa-secret/maintenance",
      });
    }

    if (tireDays > 7 || lightsDays > 14 || brakeDays > 14) {
      notices.push({
        id: `${record.vehicleCode}-checks`,
        title: `${record.vehicleCode} safety checks needed`,
        detail: "Tires, lights or brakes need attention.",
        meta: "Maintenance",
        tone: "yellow",
        icon: "wrench",
        href: "/admin-nexa-secret/maintenance",
      });
    }
  });

  return notices;
}

function buildBookingNotices(bookings: NormalizedBooking[]): DashboardNotice[] {
  const notices: DashboardNotice[] = [];

  bookings.forEach((booking) => {
    if (booking.computedStatus === "cancelled" || booking.computedStatus === "finished") return;

    const source = booking.source.toLowerCase();
    const isOfficialWebsite =
      !source.includes("manual") &&
      !booking.key.toLowerCase().startsWith("nx-") &&
      (source.includes("website") ||
        source.includes("online") ||
        source.includes("stripe"));

    if (isOfficialWebsite) {
      notices.push({
        id: `${booking.key}-online`,
        title: "Online booking received",
        detail: `${booking.customerName} booked ${booking.vehicle.codigo}.`,
        meta: getPickupLabel(booking),
        tone: "sky",
        icon: "bell",
        href: "/admin-nexa-secret/bookings",
      });
    }

    if (isToday(booking.start) && isFutureDateTime(booking.start)) {
      notices.push({
        id: `${booking.key}-pickup`,
        title: `${booking.vehicle.codigo} pickup today`,
        detail: `${booking.customerName} is scheduled for ${formatDisplayTime(booking.start)}.`,
        meta: `Contract ${booking.contractNumber}`,
        tone: "yellow",
        icon: "clock",
        href: "/admin-nexa-secret/bookings",
      });
    } else if (
      booking.computedStatus === "reserved" &&
      isToday(booking.start) &&
      isPastDateTime(booking.start)
    ) {
      notices.push({
        id: `${booking.key}-missed-pickup`,
        title: `${booking.vehicle.codigo} pickup time passed`,
        detail: `${booking.customerName} was scheduled for ${formatDisplayTime(
          booking.start
        )}.`,
        meta: "Check booking",
        tone: "red",
        icon: "alert",
        href: "/admin-nexa-secret/bookings",
      });
    } else if (
      isFutureDateTime(booking.start) &&
      (isTomorrow(booking.start) || isWithinHours(booking.start, 72))
    ) {
      notices.push({
        id: `${booking.key}-upcoming`,
        title: `${booking.vehicle.codigo} reservation coming`,
        detail: `${booking.customerName} picks up ${getPickupLabel(booking)}.`,
        meta: "Upcoming",
        tone: "white",
        icon: "bell",
        href: "/admin-nexa-secret/bookings",
      });
    }

    if (isToday(booking.end) && booking.computedStatus === "rented") {
      notices.push({
        id: `${booking.key}-return`,
        title: `${booking.vehicle.codigo} return today`,
        detail: `${booking.customerName} should return at ${formatDisplayTime(booking.end)}.`,
        meta: "Return",
        tone: "emerald",
        icon: "check",
        href: "/admin-nexa-secret/bookings",
      });
    }

    if (booking.computedStatus === "wanted") {
      notices.push({
        id: `${booking.key}-wanted`,
        title: `${booking.vehicle.codigo} needs attention`,
        detail: booking.status || "Vehicle marked as problem.",
        meta: "Alert",
        tone: "red",
        icon: "alert",
        href: "/admin-nexa-secret/maintenance",
      });
    }
  });

  return notices;
}

function toneClasses(tone: NoticeTone) {
  if (tone === "red") return "border-red-400/25 bg-red-500/10 text-red-300";
  if (tone === "yellow") return "border-amber-400/25 bg-amber-500/10 text-amber-300";
  if (tone === "sky") return "border-sky-400/25 bg-sky-500/10 text-sky-300";
  if (tone === "emerald") return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
  return "border-white/10 bg-white/[0.055] text-white/65";
}

function vehicleStatusClasses(status: FleetRow["status"]) {
  if (status === "available") return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
  if (status === "rented") return "border-orange-400/25 bg-orange-500/10 text-orange-300";
  if (status === "reserved") return "border-sky-400/25 bg-sky-500/10 text-sky-300";
  return "border-red-400/25 bg-red-500/10 text-red-300";
}

function NoticeIcon({ icon }: { icon: DashboardNotice["icon"] }) {
  if (icon === "clock") return <Clock3 size={17} />;
  if (icon === "alert") return <AlertTriangle size={17} />;
  if (icon === "check") return <CheckCircle2 size={17} />;
  if (icon === "wrench") return <Wrench size={17} />;
  return <Bell size={17} />;
}

export default function AdminDashboardPage() {
  const [rawBookings, setRawBookings] = useState<SavedBooking[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    const manualBookings = getStoredManualBookings();
    const apiBookings = await fetchApiBookings();
    setRawBookings([...apiBookings, ...manualBookings]);
    setMaintenanceRecords(loadMaintenanceRecords());
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();

    const interval = window.setInterval(loadDashboard, 60_000);
    const refreshFromStorage = () => loadDashboard();

    window.addEventListener("storage", refreshFromStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  const dashboard = useMemo(() => {
    const bookings = sortNewest(dedupeBookings(rawBookings.map(normalizeBooking)));
    const activeBookings = sortByPickup(bookings.filter((booking) => booking.computedStatus === "rented"));
    const upcomingBookings = sortByPickup(bookings.filter((booking) => booking.computedStatus === "reserved"));
    const wantedBookings = bookings.filter((booking) => booking.computedStatus === "wanted");

    const fleetRows: FleetRow[] = nexaFleet.map((vehicle) => {
      const wantedBooking = wantedBookings.find((booking) => booking.vehicle.codigo === vehicle.codigo);
      const activeBooking = activeBookings.find((booking) => booking.vehicle.codigo === vehicle.codigo);
      const nextBooking = upcomingBookings.find((booking) => booking.vehicle.codigo === vehicle.codigo);
      const imageUrl = getVehicleImage(vehicle);

      if (wantedBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl,
          status: "wanted",
          label: "Attention",
          detail: wantedBooking.status || "Needs action",
          booking: wantedBooking,
        };
      }

      if (activeBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl,
          status: "rented",
          label: "Rented",
          detail: `${activeBooking.customerName} - ${getReturnLabel(activeBooking)}`,
          booking: activeBooking,
        };
      }

      if (nextBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl,
          status: "reserved",
          label: "Reserved",
          detail: `${nextBooking.customerName} - ${getPickupLabel(nextBooking)}`,
          booking: nextBooking,
        };
      }

      return {
        codigo: vehicle.codigo,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        imageUrl,
        status: "available",
        label: "Available",
        detail: "Ready to rent",
      };
    });

    const todayPickups = sortByPickup(
      bookings.filter(
        (booking) =>
          booking.computedStatus !== "cancelled" &&
          booking.computedStatus !== "finished" &&
          isToday(booking.start) &&
          isFutureDateTime(booking.start)
      )
    );

    const todayReturns = sortByPickup(
      bookings.filter(
        (booking) =>
          booking.computedStatus === "rented" &&
          isToday(booking.end)
      )
    );

    const validBookings = bookings.filter((booking) => booking.computedStatus !== "cancelled");
    const totalCents = validBookings.reduce((sum, booking) => sum + booking.amountCents, 0);
    const todayCents = validBookings
      .filter((booking) => isToday(new Date(booking.createdAt)))
      .reduce((sum, booking) => sum + booking.amountCents, 0);

    const notices = [
      ...buildBookingNotices(bookings),
      ...buildMaintenanceNotices(maintenanceRecords),
    ].slice(0, 14);

    return {
      bookings,
      activeBookings,
      upcomingBookings,
      fleetRows,
      todayPickups,
      todayReturns,
      notices,
      totalCents,
      todayCents,
      availableCount: fleetRows.filter((vehicle) => vehicle.status === "available").length,
      rentedCount: fleetRows.filter((vehicle) => vehicle.status === "rented").length,
      reservedCount: fleetRows.filter((vehicle) => vehicle.status === "reserved").length,
      alertCount: notices.filter((notice) => notice.tone === "red" || notice.tone === "yellow").length,
    };
  }, [rawBookings, maintenanceRecords]);

  const heroVehicle =
    dashboard.fleetRows.find((vehicle) => vehicle.status === "rented") ||
    dashboard.fleetRows.find((vehicle) => vehicle.status === "reserved") ||
    dashboard.fleetRows[0];

  return (
    <AdminShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <main className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]/90 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <div className="grid min-h-[310px] gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col justify-between p-6 lg:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                    <Sparkles size={14} />
                    Live operations
                  </div>

                  <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-white md:text-5xl">
                    Today’s fleet, bookings and alerts in one place.
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/50">
                    Vehicles release automatically after return time. Cancel or return a booking and the scooter becomes available again across the system.
                  </p>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-4">
                  <HeroMetric label="Free" value={dashboard.availableCount} />
                  <HeroMetric label="Rented" value={dashboard.rentedCount} />
                  <HeroMetric label="Reserved" value={dashboard.reservedCount} />
                  <HeroMetric label="Alerts" value={dashboard.alertCount} />
                </div>
              </div>

              <div className="relative border-t border-white/10 bg-[radial-gradient(circle_at_55%_30%,rgba(255,122,24,0.22),transparent_38%),linear-gradient(140deg,rgba(255,255,255,0.07),rgba(255,255,255,0.015))] p-6 lg:border-l lg:border-t-0">
                <div className="absolute right-5 top-5 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-black text-white/65">
                  {loading ? "Refreshing..." : "Live"}
                </div>

                <div className="flex h-full flex-col justify-end">
                  {heroVehicle ? (
                    <>
                      <img
                        src={heroVehicle.imageUrl}
                        alt={heroVehicle.codigo}
                        className="mx-auto h-44 w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.55)] md:h-56"
                      />
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-3xl font-black text-white">{heroVehicle.codigo}</p>
                            <p className="mt-1 text-sm font-bold text-white/50">
                              {heroVehicle.matricula} - {heroVehicle.marca} {heroVehicle.modelo}
                            </p>
                          </div>

                          <span className={`rounded-full border px-3 py-1 text-xs font-black ${vehicleStatusClasses(heroVehicle.status)}`}>
                            {heroVehicle.label}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-bold text-white/55">{heroVehicle.detail}</p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-2xl border border-white/10 bg-[#0B0D12]/88 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
                    Fleet board
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">Vehicles</h3>
                </div>

                <Link
                  href="/admin-nexa-secret/vehicles"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white/70 transition hover:bg-white/[0.09] hover:text-white"
                >
                  Open fleet
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {dashboard.fleetRows.map((vehicle) => (
                  <Link
                    href="/admin-nexa-secret/bookings"
                    key={vehicle.codigo}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-0.5 hover:bg-white/[0.06]"
                  >
                    <div className="relative h-28 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.11),transparent_50%)] p-3">
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.codigo}
                        className="h-full w-full object-contain drop-shadow-[0_20px_28px_rgba(0,0,0,0.45)]"
                      />
                      <span className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${vehicleStatusClasses(vehicle.status)}`}>
                        {vehicle.label}
                      </span>
                    </div>

                    <div className="p-4">
                      <p className="text-2xl font-black text-white">{vehicle.codigo}</p>
                      <p className="mt-1 text-xs font-bold text-white/45">
                        {vehicle.matricula} - {vehicle.marca} {vehicle.modelo}
                      </p>
                      <p className="mt-3 min-h-[38px] text-xs font-bold leading-5 text-white/55">
                        {vehicle.detail}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="sticky top-[92px] rounded-2xl border border-white/10 bg-[#0B0D12]/92 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
                  Notification center
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">Today & next</h3>
              </div>

              <button
                onClick={loadDashboard}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/65 transition hover:bg-white/[0.09] hover:text-white"
                aria-label="Refresh dashboard"
              >
                <RefreshCw size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {dashboard.notices.length === 0 ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                  <div className="flex items-center gap-3 text-emerald-300">
                    <CheckCircle2 size={20} />
                    <p className="text-sm font-black text-white">All clear</p>
                  </div>
                  <p className="mt-2 text-sm font-bold text-emerald-300">
                    No urgent bookings, returns or maintenance alerts right now.
                  </p>
                </div>
              ) : (
                dashboard.notices.map((notice) => {
                  const content = (
                    <div className={`rounded-2xl border p-4 ${toneClasses(notice.tone)}`}>
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 text-current">
                          <NoticeIcon icon={notice.icon} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white">{notice.title}</p>
                          <p className="mt-1 text-xs font-bold leading-5 text-white/58">{notice.detail}</p>
                          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-current">
                            {notice.meta}
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                  return notice.href ? (
                    <Link key={notice.id} href={notice.href} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={notice.id}>{content}</div>
                  );
                })
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <MiniMovement
                icon={<CalendarClock size={17} />}
                title="Pickups today"
                value={dashboard.todayPickups.length}
              />
              <MiniMovement
                icon={<CheckCircle2 size={17} />}
                title="Returns today"
                value={dashboard.todayReturns.length}
              />
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniMovement({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/60">
          {icon}
        </span>
        <p className="text-sm font-black text-white/65">{title}</p>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
