"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { nexaFleet } from "../../../lib/nexaFleet";

type PaymentMethod = "cash" | "card" | "unpaid";

type SavedBooking = {
  id: string;
  createdAt: string;
  created_at?: string;
  status: string;
  source: string;

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

  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
    ano?: string;
    bastidor?: string;
    combustible?: string;
    tipo?: string;
  };

  contractData: {
    numeroContrato: string;
    fechaEntrega: string;
    horaEntrega: string;
    fechaDevolucion: string;
    horaDevolucion: string;
    nombreCliente: string;
    dniPasaporte: string;
    telefono: string;
    email: string;
    direccion: string;
    dias: string;
    precioPorDia: string;
    total: string;
    pagado: string;
    metodoPago?: string;
    paymentMethod?: string;
    kmSalida?: string;
    combustibleSalida?: string;
  };

  contractPdf?: {
    fileName?: string;
    pdfBase64?: string;
    drive?: any;
    generatedAt?: string;
  };
};

type ApiBookingRow = Partial<SavedBooking> & {
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
  amount_eur?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  contract_number?: string;
  customer_dni?: string;
  customer_address?: string;
  rental_days?: string;
  price_per_day?: string;
};

type BookingAction = "cancel" | "picked_up" | "returned";

type ActionModalState = {
  booking: SavedBooking;
  action: BookingAction;
  step: 1 | 2;
} | null;

type VehicleSnapshot = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  imageUrl: string;
  status: "available" | "reserved" | "due_pickup" | "rented";
  booking?: SavedBooking;
  statusLabel: string;
  statusSub: string;
};

function cleanText(value: any) {
  return String(value || "").trim();
}

function safeDateTime(date?: string, time?: string) {
  if (!date) return null;

  const cleanTime = time && time.trim() ? time : "00:00";
  const value = new Date(`${date}T${cleanTime}`);

  if (Number.isNaN(value.getTime())) return null;

  return value;
}

function formatDateTime(date?: string, time?: string) {
  if (!date && !time) return "No date";
  return `${date || "--"} · ${time || "--"}`;
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

function normalizeMoney(value?: string | number) {
  if (value === undefined || value === null || value === "") return "0";

  const text = String(value).trim();

  if (text.includes("€")) return text.replace("€", "").trim();

  return text;
}

function getTotalCents(booking: SavedBooking) {
  if (typeof booking.amount === "number") return booking.amount;
  if (typeof booking.amount_eur === "number") {
    return Math.round(booking.amount_eur * 100);
  }

  const total = moneyTextToNumber(booking.contractData?.total);

  return Math.round(total * 100);
}

function normalizePaymentMethod(value?: string): PaymentMethod {
  const clean = String(value || "").toLowerCase();

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

function getPaymentMethod(booking: SavedBooking): PaymentMethod {
  return (
    normalizePaymentMethod(booking.payment_method) ||
    normalizePaymentMethod(booking.contractData?.metodoPago) ||
    normalizePaymentMethod(booking.contractData?.paymentMethod) ||
    normalizePaymentMethod(booking.contractData?.pagado) ||
    "unpaid"
  );
}

function paymentMethodLabel(value?: string) {
  const method = normalizePaymentMethod(value);

  if (method === "cash") return "Cash";
  if (method === "card") return "Card";

  return "Unpaid";
}

function paymentMethodClasses(value?: string) {
  const method = normalizePaymentMethod(value);

  if (method === "cash") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
  }

  if (method === "card") {
    return "border-sky-400/25 bg-sky-500/10 text-sky-300";
  }

  return "border-white/10 bg-white/[0.06] text-white/45";
}

function normalizeStatusText(status?: string) {
  return String(status || "").trim().toLowerCase();
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

function isPickedUpStatus(status?: string) {
  const clean = normalizeStatusText(status);

  return (
    clean === "en alquiler" ||
    clean === "rented" ||
    clean === "picked_up" ||
    clean === "picked up"
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

function getBookingTiming(booking: SavedBooking) {
  const start = safeDateTime(
    booking.contractData.fechaEntrega,
    booking.contractData.horaEntrega
  );

  const end = safeDateTime(
    booking.contractData.fechaDevolucion,
    booking.contractData.horaDevolucion
  );

  return { start, end };
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
  if (!date) return false;
  return isSameCalendarDay(date, new Date());
}

function isTomorrow(date?: Date | null) {
  if (!date) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return isSameCalendarDay(date, tomorrow);
}

function getReturnLabel(booking: SavedBooking) {
  const { end } = getBookingTiming(booking);

  if (!end) return "Return date not available";

  if (isToday(end)) {
    return `Returns today at ${formatDisplayTime(end)}`;
  }

  if (isTomorrow(end)) {
    return `Returns tomorrow at ${formatDisplayTime(end)}`;
  }

  return `Returns on ${formatDisplayDate(end)} at ${formatDisplayTime(end)}`;
}

function getPickupLabel(booking: SavedBooking) {
  const { start } = getBookingTiming(booking);

  if (!start) return "Pickup date not available";

  if (isToday(start)) {
    return `Pickup today at ${formatDisplayTime(start)}`;
  }

  if (isTomorrow(start)) {
    return `Pickup tomorrow at ${formatDisplayTime(start)}`;
  }

  return `Pickup on ${formatDisplayDate(start)} at ${formatDisplayTime(start)}`;
}

function getBookingStatus(booking: SavedBooking) {
  const rawStatus = booking.status || "";

  if (isCancelledStatus(rawStatus)) return "Cancelada";
  if (isReturnedStatus(rawStatus)) return "Finalizada";
  if (isPickedUpStatus(rawStatus)) return "En alquiler";

  const now = new Date();
  const { start, end } = getBookingTiming(booking);

  if (!start || !end) return rawStatus || "Activa";

  if (now < start) return "Confirmada";

  if (now >= start && now <= end) {
    return "Pendiente pickup";
  }

  return "Finalizada";
}

function getStatusStyle(status: string) {
  if (status === "En alquiler") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (status === "Pendiente pickup") {
    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";
  }

  if (status === "Confirmada") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-300";
  }

  if (status === "Finalizada") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  if (status === "Cancelada") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.06] text-white/60";
}

function extractVehicleCode(value?: string | null) {
  if (!value) return "";

  const match = value.match(/\bN\d+\b/i);

  return match?.[0]?.toUpperCase() || "";
}

function parseVehicleName(vehicleName?: string | null, vehicleCode?: string) {
  const raw = String(vehicleName || "").trim();
  const code = cleanText(vehicleCode) || extractVehicleCode(raw);

  const fleetVehicle = code
    ? nexaFleet.find((vehicle) => vehicle.codigo === code)
    : null;

  if (fleetVehicle) {
    return {
      codigo: fleetVehicle.codigo,
      matricula: fleetVehicle.matricula,
      marca: fleetVehicle.marca,
      modelo: fleetVehicle.modelo,
      ano: fleetVehicle.ano,
      bastidor: fleetVehicle.bastidor,
      combustible: fleetVehicle.combustible,
      tipo: fleetVehicle.tipo,
    };
  }

  const clean = raw.toLowerCase();
  const isSym = clean.includes("sym");
  const isPiaggio = clean.includes("piaggio");

  return {
    codigo: code || raw || "ONLINE",
    matricula: "-",
    marca: isSym ? "SYM" : isPiaggio ? "Piaggio" : raw || "Vehicle",
    modelo: isSym ? "Symphony 125" : isPiaggio ? "Liberty 125" : "",
    ano: "",
    bastidor: "",
    combustible: "Gasolina",
    tipo: "Scooter 125cc",
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

function normalizeApiBooking(row: ApiBookingRow): SavedBooking {
  if (row.vehicle && row.contractData) {
    return {
      ...(row as SavedBooking),
      id: String(
        row.stripe_payment_intent_id ||
          row.contract_number ||
          row.contractData.numeroContrato ||
          row.id ||
          Date.now()
      ),
      createdAt: cleanText(row.createdAt || row.created_at || new Date().toISOString()),
      status: cleanText(row.status || "Activa"),
      source: cleanText(row.source || "Online"),
      vehicle: row.vehicle,
      contractData: {
        ...row.contractData,
        metodoPago:
          row.payment_method ||
          row.contractData.metodoPago ||
          row.contractData.paymentMethod ||
          "unpaid",
        paymentMethod:
          row.payment_method ||
          row.contractData.paymentMethod ||
          row.contractData.metodoPago ||
          "unpaid",
      },
    };
  }

  const paymentId =
    row.stripe_payment_intent_id || `online_${row.id || Date.now()}`;

  const totalAmount =
    typeof row.amount === "number"
      ? row.amount / 100
      : typeof row.amount_eur === "number"
      ? row.amount_eur
      : 0;

  const parsedVehicle = parseVehicleName(row.vehicle_name, row.vehicle_code);
  const paymentMethod = normalizePaymentMethod(row.payment_method);

  return {
    id: String(paymentId),
    createdAt: row.created_at || new Date().toISOString(),
    created_at: row.created_at,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    amount: row.amount,
    amount_eur: row.amount_eur,
    currency: row.currency || "eur",
    payment_method: paymentMethod,
    payment_status: row.payment_status || (paymentMethod === "unpaid" ? "unpaid" : "paid"),
    contract_number: row.contract_number,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    phone: row.phone,
    customer_dni: row.customer_dni,
    customer_address: row.customer_address,
    pickup_date: row.pickup_date,
    pickup_time: row.pickup_time,
    dropoff_date: row.dropoff_date,
    dropoff_time: row.dropoff_time,
    vehicle_name: row.vehicle_name,
    vehicle_code: row.vehicle_code,
    status: row.status === "paid" ? "Activa" : row.status || "Activa",
    source: row.source || "Online",
    vehicle: parsedVehicle,
    contractData: {
      numeroContrato: row.contract_number || String(paymentId),
      fechaEntrega: row.pickup_date || "",
      horaEntrega: row.pickup_time || "",
      fechaDevolucion: row.dropoff_date || "",
      horaDevolucion: row.dropoff_time || "",
      nombreCliente: row.customer_name || "Online customer",
      dniPasaporte: row.customer_dni || "-",
      telefono: row.phone || "",
      email: row.customer_email || "",
      direccion: row.customer_address || "-",
      dias: row.rental_days || "-",
      precioPorDia: row.price_per_day || "-",
      total: totalAmount ? totalAmount.toFixed(2) : "0",
      pagado: totalAmount ? totalAmount.toFixed(2) : "0",
      metodoPago: paymentMethod,
      paymentMethod,
      kmSalida: "",
      combustibleSalida: "",
    },
  };
}

function getStoredManualBookings(): SavedBooking[] {
  if (typeof window === "undefined") return [];

  try {
    const savedBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    if (!Array.isArray(savedBookings)) return [];

    return savedBookings.map((booking) => ({
      ...booking,
      createdAt: booking.createdAt || booking.created_at || new Date().toISOString(),
      source: booking.source || "Manual",
      status: booking.status || "Activa",
      payment_method:
        booking.payment_method ||
        booking.contractData?.metodoPago ||
        booking.contractData?.paymentMethod ||
        "unpaid",
      contractData: {
        ...booking.contractData,
        metodoPago:
          booking.contractData?.metodoPago ||
          booking.contractData?.paymentMethod ||
          booking.payment_method ||
          "unpaid",
        paymentMethod:
          booking.contractData?.paymentMethod ||
          booking.contractData?.metodoPago ||
          booking.payment_method ||
          "unpaid",
      },
    }));
  } catch {
    return [];
  }
}

function saveManualBookings(bookings: SavedBooking[]) {
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
    const rows = Array.isArray(data?.bookings) ? data.bookings : [];

    return rows.map((row: ApiBookingRow) => normalizeApiBooking(row));
  } catch {
    return [];
  }
}

function getBookingKey(booking: SavedBooking) {
  return (
    cleanText(booking.stripe_payment_intent_id) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.contract_number) ||
    cleanText(booking.id)
  );
}

function dedupeBookings(bookings: SavedBooking[]) {
  const map = new Map<string, SavedBooking>();

  bookings.forEach((booking) => {
    const key = getBookingKey(booking);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, booking);
      return;
    }

    if (!existing.contractPdf && booking.contractPdf) {
      map.set(key, booking);
      return;
    }

    if (existing.source !== "Manual" && booking.source === "Manual") {
      map.set(key, {
        ...booking,
        amount: existing.amount || booking.amount,
        payment_method: booking.payment_method || existing.payment_method,
      });
    }
  });

  return Array.from(map.values());
}

function sortBookingsNewestFirst(bookings: SavedBooking[]) {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
    const dateB = new Date(b.createdAt || b.created_at || 0).getTime();

    return dateB - dateA;
  });
}

function sortBookingsByPickup(bookings: SavedBooking[]) {
  return [...bookings].sort((a, b) => {
    const aStart = getBookingTiming(a).start?.getTime() || 0;
    const bStart = getBookingTiming(b).start?.getTime() || 0;

    return aStart - bStart;
  });
}

async function updateBookingStatusInApi(
  booking: SavedBooking,
  action: BookingAction
) {
  try {
    const response = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: booking.id,
        stripePaymentIntentId:
          booking.stripe_payment_intent_id || booking.id || booking.contractData.numeroContrato,
        stripe_payment_intent_id:
          booking.stripe_payment_intent_id || booking.id || booking.contractData.numeroContrato,
        action,
        reason: `Action ${action} from NEXA admin dashboard`,
      }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [search, setSearch] = useState("");
  const [isLoadingOnline, setIsLoadingOnline] = useState(true);
  const [onlineLoaded, setOnlineLoaded] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<SavedBooking | null>(
    null
  );
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehicleSnapshot | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState>(null);
  const [syncNotice, setSyncNotice] = useState("");
  const [isActionSaving, setIsActionSaving] = useState(false);

  async function loadBookings() {
    const manualBookings = getStoredManualBookings();

    setIsLoadingOnline(true);
    const apiBookings = await fetchApiBookings();
    setIsLoadingOnline(false);
    setOnlineLoaded(true);

    const mergedBookings = sortBookingsNewestFirst(
      dedupeBookings([...apiBookings, ...manualBookings])
    );

    setBookings(mergedBookings);
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

  const filteredBookings = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) return bookings;

    return bookings.filter((booking) => {
      const text = [
        booking.id,
        booking.source,
        booking.status,
        booking.payment_method,
        booking.vehicle.codigo,
        booking.vehicle.matricula,
        booking.vehicle.marca,
        booking.vehicle.modelo,
        booking.contractData.nombreCliente,
        booking.contractData.dniPasaporte,
        booking.contractData.telefono,
        booking.contractData.email,
        booking.contractData.numeroContrato,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(cleanSearch);
    });
  }, [bookings, search]);

  const activeBookings = useMemo(() => {
    return bookings.filter(
      (booking) => getBookingStatus(booking) === "En alquiler"
    );
  }, [bookings]);

  const pendingPickupBookings = useMemo(() => {
    return bookings.filter(
      (booking) => getBookingStatus(booking) === "Pendiente pickup"
    );
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    return sortBookingsByPickup(
      bookings.filter((booking) => getBookingStatus(booking) === "Confirmada")
    );
  }, [bookings]);

  const cancelledBookings = useMemo(() => {
    return bookings.filter(
      (booking) => getBookingStatus(booking) === "Cancelada"
    );
  }, [bookings]);

  const returningToday = useMemo(() => {
    return bookings.filter((booking) => {
      const status = getBookingStatus(booking);
      const { end } = getBookingTiming(booking);

      return status !== "Cancelada" && status !== "Finalizada" && isToday(end);
    });
  }, [bookings]);

  const pickupsToday = useMemo(() => {
    return bookings.filter((booking) => {
      const status = getBookingStatus(booking);
      const { start } = getBookingTiming(booking);

      return status !== "Cancelada" && status !== "Finalizada" && isToday(start);
    });
  }, [bookings]);

  const reservationsTomorrow = useMemo(() => {
    return upcomingBookings.filter((booking) => {
      const { start } = getBookingTiming(booking);
      return isTomorrow(start);
    });
  }, [upcomingBookings]);

  const summary = useMemo(() => {
    const validBookings = bookings.filter((booking) => {
      const status = getBookingStatus(booking);
      return status !== "Cancelada";
    });

    const totalCents = validBookings.reduce(
      (sum, booking) => sum + getTotalCents(booking),
      0
    );

    const cashCents = validBookings
      .filter((booking) => getPaymentMethod(booking) === "cash")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    const cardCents = validBookings
      .filter((booking) => getPaymentMethod(booking) === "card")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    return {
      totalCents,
      cashCents,
      cardCents,
    };
  }, [bookings]);

  const vehicleSnapshots = useMemo<VehicleSnapshot[]>(() => {
    return nexaFleet.map((vehicle) => {
      const relevantBookings = bookings.filter((booking) => {
        const status = getBookingStatus(booking);
        if (status === "Cancelada" || status === "Finalizada") return false;
        return booking.vehicle.codigo === vehicle.codigo;
      });

      const currentRented = relevantBookings.find(
        (booking) => getBookingStatus(booking) === "En alquiler"
      );

      if (currentRented) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "rented",
          booking: currentRented,
          statusLabel: "Rented out",
          statusSub: `${currentRented.contractData.nombreCliente} · ${getReturnLabel(
            currentRented
          )}`,
        };
      }

      const pendingPickup = relevantBookings.find(
        (booking) => getBookingStatus(booking) === "Pendiente pickup"
      );

      if (pendingPickup) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "due_pickup",
          booking: pendingPickup,
          statusLabel: "Pickup pending",
          statusSub: `${pendingPickup.contractData.nombreCliente} · ${getPickupLabel(
            pendingPickup
          )}`,
        };
      }

      const nextBooking = sortBookingsByPickup(
        relevantBookings.filter(
          (booking) => getBookingStatus(booking) === "Confirmada"
        )
      )[0];

      if (nextBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "reserved",
          booking: nextBooking,
          statusLabel: "Reserved",
          statusSub: `${nextBooking.contractData.nombreCliente} · ${getPickupLabel(
            nextBooking
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
  }, [bookings]);

  function clearTestBookings() {
    const confirmed = window.confirm(
      "Are you sure you want to delete only manual bookings stored in localStorage? Supabase bookings will not be deleted."
    );

    if (!confirmed) return;

    localStorage.removeItem("nexa_manual_bookings");
    loadBookings();
  }

  function updateBookingInLocalState(bookingId: string, nextStatus: string) {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: nextStatus,
            }
          : booking
      )
    );

    const manualBookings = getStoredManualBookings();

    const updatedManualBookings = manualBookings.map((booking) =>
      booking.id === bookingId
        ? {
            ...booking,
            status: nextStatus,
          }
        : booking
    );

    saveManualBookings(updatedManualBookings);
  }

  async function completeAction() {
    if (!actionModal || isActionSaving) return;

    const { booking, action } = actionModal;

    let localStatus = booking.status || "Activa";

    if (action === "cancel") localStatus = "Cancelada";
    if (action === "picked_up") localStatus = "En alquiler";
    if (action === "returned") localStatus = "Finalizada";

    setIsActionSaving(true);

    updateBookingInLocalState(booking.id, localStatus);

    const apiOk = await updateBookingStatusInApi(booking, action);

    if (apiOk) {
      setSyncNotice(
        action === "cancel"
          ? "Booking cancelled and synced with Supabase. The vehicle is available again."
          : action === "picked_up"
          ? "Booking marked as picked up and synced with Supabase."
          : "Booking marked as returned and synced with Supabase. The vehicle is available again."
      );

      await loadBookings();
    } else {
      setSyncNotice(
        "Status updated inside this dashboard, but Supabase sync failed. Check /api/admin/bookings PATCH and deploy again."
      );
    }

    setIsActionSaving(false);
    setActionModal(null);
    setSelectedBooking(null);
    setSelectedVehicle(null);

    window.setTimeout(() => {
      setSyncNotice("");
    }, 6500);
  }

  function getActionText(action: BookingAction) {
    if (action === "cancel") return "cancel this booking";
    if (action === "picked_up") return "mark this vehicle as picked up";
    return "mark this vehicle as returned";
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />

        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
              NEXA Control Center
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
              Bookings, Fleet Status & Payments
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/55">
              Manage manual and website bookings, see which vehicles are
              available or rented out, track customer details, and view cash/card
              sales from each booking.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-white/50">
                Total revenue: {formatMoneyFromCents(summary.totalCents)}
              </span>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                Cash: {formatMoneyFromCents(summary.cashCents)}
              </span>

              <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sky-300">
                Card: {formatMoneyFromCents(summary.cardCents)}
              </span>

              <span
                className={`rounded-full border px-3 py-2 ${
                  onlineLoaded
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border-sky-400/20 bg-sky-500/10 text-sky-300"
                }`}
              >
                {isLoadingOnline
                  ? "Loading online bookings..."
                  : "Supabase bookings loaded"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={loadBookings}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/[0.1]"
            >
              Refresh
            </button>

            <button
              onClick={clearTestBookings}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15"
            >
              Clear Manual Test Data
            </button>

            <Link
              href="/admin-nexa-secret/create-booking"
              className="rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-center text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.25)] transition hover:-translate-y-0.5"
            >
              + Create Booking
            </Link>
          </div>
        </div>
      </section>

      {syncNotice ? (
        <section className="rounded-[24px] border border-sky-400/20 bg-sky-500/10 px-5 py-4 text-sm font-bold text-sky-200">
          {syncNotice}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total bookings" value={bookings.length} tone="orange" />
        <StatCard label="Upcoming" value={upcomingBookings.length} tone="sky" />
        <StatCard
          label="Pending pickup"
          value={pendingPickupBookings.length}
          tone="yellow"
        />
        <StatCard label="Rented out" value={activeBookings.length} tone="orange" />
        <StatCard
          label="Cancelled"
          value={cancelledBookings.length}
          tone="red"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <AlertBox
          title="Pickups today"
          tone="yellow"
          emptyText="No pickups scheduled for today."
          bookings={pickupsToday}
          labelFn={getPickupLabel}
          onOpen={setSelectedBooking}
        />

        <AlertBox
          title="Returning today"
          tone="orange"
          emptyText="No vehicles returning today."
          bookings={returningToday}
          labelFn={getReturnLabel}
          onOpen={setSelectedBooking}
        />

        <AlertBox
          title="Tomorrow reservations"
          tone="sky"
          emptyText="No reservations for tomorrow."
          bookings={reservationsTomorrow}
          labelFn={getPickupLabel}
          onOpen={setSelectedBooking}
        />
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Live fleet board
            </p>
            <h3 className="mt-1 text-2xl font-black text-white">
              Vehicle Status Panel
            </h3>
          </div>

          <p className="text-sm font-bold text-white/45">
            Click any vehicle to see booking details.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {vehicleSnapshots.map((vehicle) => {
            const isAvailable = vehicle.status === "available";
            const isRented = vehicle.status === "rented";
            const isPending = vehicle.status === "due_pickup";

            return (
              <button
                key={vehicle.codigo}
                onClick={() => setSelectedVehicle(vehicle)}
                className={[
                  "group relative overflow-hidden rounded-[28px] border p-4 text-left transition hover:-translate-y-1",
                  isAvailable
                    ? "border-emerald-400/20 bg-emerald-500/10"
                    : isRented
                    ? "border-orange-400/20 bg-orange-500/10"
                    : isPending
                    ? "border-yellow-400/20 bg-yellow-500/10"
                    : "border-sky-400/20 bg-sky-500/10",
                ].join(" ")}
              >
                <div className="absolute right-3 top-3 z-10">
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
                      isAvailable
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        : isRented
                        ? "border-orange-400/20 bg-orange-500/10 text-orange-300"
                        : isPending
                        ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-300"
                        : "border-sky-400/20 bg-sky-500/10 text-sky-300",
                    ].join(" ")}
                  >
                    {vehicle.statusLabel}
                  </span>
                </div>

                <div className="relative h-32 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_60%)]" />

                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.codigo} ${vehicle.marca} ${vehicle.modelo}`}
                    className="h-full w-full object-contain p-3 drop-shadow-[0_22px_24px_rgba(0,0,0,0.45)] transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-black text-white">
                    {vehicle.codigo}
                  </p>

                  <p className="mt-1 text-sm font-bold text-white/65">
                    {vehicle.matricula} · {vehicle.marca} {vehicle.modelo}
                  </p>

                  <p className="mt-3 text-xs font-bold leading-5 text-white/48">
                    {vehicle.statusSub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by contract, customer, ID, plate, phone, payment method..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
        />
      </section>

      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#080A10]/80 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="hidden grid-cols-11 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/35 xl:grid">
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

        {filteredBookings.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-2xl font-black text-white">No bookings yet</p>

            <p className="mt-2 text-sm font-medium text-white/45">
              Create a manual booking or wait for a paid online booking.
            </p>

            <Link
              href="/admin-nexa-secret/create-booking"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-sm font-black text-white"
            >
              Create first booking
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const status = getBookingStatus(booking);
            const isCancelled = status === "Cancelada";
            const isFinal = status === "Finalizada";
            const paymentMethod = getPaymentMethod(booking);

            return (
              <div
                key={`${booking.source}-${getBookingKey(booking)}`}
                className="grid gap-4 border-b border-white/5 px-5 py-5 text-sm transition hover:bg-white/[0.04] xl:grid-cols-11 xl:items-center"
              >
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="text-left"
                >
                  <p className="font-black text-white">
                    {booking.contractData.numeroContrato || booking.id}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleString("en-GB")
                      : "No creation date"}
                  </p>
                </button>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${
                      booking.source.toLowerCase().includes("online") ||
                      booking.source.toLowerCase().includes("website")
                        ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
                        : "border-orange-400/20 bg-orange-500/10 text-orange-300"
                    }`}
                  >
                    {booking.source}
                  </span>
                </div>

                <div className="xl:col-span-2">
                  <p className="font-black text-white">
                    {booking.contractData.nombreCliente}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    ID/Passport: {booking.contractData.dniPasaporte || "-"}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Phone: {booking.contractData.telefono || "-"}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Email: {booking.contractData.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="font-black text-white">
                    {booking.vehicle.codigo}
                  </p>

                  <p className="mt-1 text-xs text-white/45">
                    {booking.vehicle.matricula} · {booking.vehicle.marca}{" "}
                    {booking.vehicle.modelo}
                  </p>
                </div>

                <div className="font-medium text-white/60">
                  {formatDateTime(
                    booking.contractData.fechaEntrega,
                    booking.contractData.horaEntrega
                  )}
                </div>

                <div className="font-medium text-white/60">
                  {formatDateTime(
                    booking.contractData.fechaDevolucion,
                    booking.contractData.horaDevolucion
                  )}
                </div>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>

                  {status === "En alquiler" ? (
                    <p className="mt-2 text-xs font-bold text-orange-200">
                      {getReturnLabel(booking)}
                    </p>
                  ) : null}

                  {status === "Pendiente pickup" ? (
                    <p className="mt-2 text-xs font-bold text-yellow-200">
                      Confirm pickup or cancel if no-show.
                    </p>
                  ) : null}
                </div>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${paymentMethodClasses(
                      paymentMethod
                    )}`}
                  >
                    {paymentMethodLabel(paymentMethod)}
                  </span>
                </div>

                <div className="text-right text-lg font-black text-white">
                  {formatMoneyFromCents(getTotalCents(booking))}
                </div>

                <div className="flex flex-col gap-2 xl:items-end">
                  {!isCancelled && !isFinal && status !== "En alquiler" ? (
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
                      Picked up
                    </button>
                  ) : null}

                  {!isCancelled && status === "En alquiler" ? (
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

                  {!isCancelled && !isFinal ? (
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
          <div className="w-full max-w-xl rounded-[32px] border border-red-400/20 bg-[#080A10] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
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
                {getActionText(actionModal.action)}
              </span>{" "}
              for{" "}
              <span className="text-white">
                {actionModal.booking.vehicle.codigo} ·{" "}
                {actionModal.booking.contractData.nombreCliente}
              </span>
              .
            </p>

            {actionModal.action === "cancel" ? (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-200">
                Cancelling this booking will make the vehicle available again
                for the selected date/time. Only continue if the customer
                cancelled, did not arrive, or this booking was created by
                mistake.
              </div>
            ) : null}

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
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "orange" | "sky" | "yellow" | "red";
}) {
  const styles = {
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
  };

  return (
    <div className={`rounded-[28px] border p-5 ${styles[tone]}`}>
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
  bookings: SavedBooking[];
  labelFn: (booking: SavedBooking) => string;
  onOpen: (booking: SavedBooking) => void;
}) {
  const styles = {
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  };

  return (
    <div className={`rounded-[30px] border p-5 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em]">{title}</p>

      <div className="mt-4 space-y-3">
        {bookings.length === 0 ? (
          <p className="text-sm font-bold text-white/45">{emptyText}</p>
        ) : (
          bookings.slice(0, 4).map((booking) => (
            <button
              key={`${title}-${booking.id}`}
              onClick={() => onOpen(booking)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-left transition hover:bg-white/[0.08]"
            >
              <p className="text-sm font-black text-white">
                {booking.vehicle.codigo} · {booking.contractData.nombreCliente}
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

function BookingDetailsModal({
  booking,
  onClose,
  onAction,
}: {
  booking: SavedBooking;
  onClose: () => void;
  onAction: (action: BookingAction) => void;
}) {
  const status = getBookingStatus(booking);
  const paymentMethod = getPaymentMethod(booking);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[34px] border border-white/10 bg-[#080A10] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">
              Booking details
            </p>

            <h3 className="mt-2 text-3xl font-black text-white">
              {booking.vehicle.codigo} · {booking.contractData.nombreCliente}
            </h3>

            <p className="mt-2 text-sm font-bold text-white/45">
              Contract: {booking.contractData.numeroContrato || booking.id}
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
                Status: {status}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <DetailRow
              label="Pickup"
              value={formatDateTime(
                booking.contractData.fechaEntrega,
                booking.contractData.horaEntrega
              )}
            />
            <DetailRow
              label="Return"
              value={formatDateTime(
                booking.contractData.fechaDevolucion,
                booking.contractData.horaDevolucion
              )}
            />
            <DetailRow label="Return alert" value={getReturnLabel(booking)} />
            <DetailRow label="Customer" value={booking.contractData.nombreCliente} />
            <DetailRow label="Phone" value={booking.contractData.telefono || "-"} />
            <DetailRow label="Email" value={booking.contractData.email || "-"} />
            <DetailRow
              label="ID / Passport"
              value={booking.contractData.dniPasaporte || "-"}
            />
            <DetailRow
              label="Total"
              value={formatMoneyFromCents(getTotalCents(booking))}
            />
            <DetailRow label="Payment method" value={paymentMethodLabel(paymentMethod)} />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {status !== "Cancelada" && status !== "Finalizada" ? (
            <button
              onClick={() => onAction("cancel")}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15"
            >
              Cancel booking
            </button>
          ) : null}

          {status !== "En alquiler" &&
          status !== "Cancelada" &&
          status !== "Finalizada" ? (
            <button
              onClick={() => onAction("picked_up")}
              className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-black text-emerald-300 transition hover:bg-emerald-500/15"
            >
              Mark as picked up
            </button>
          ) : null}

          {status === "En alquiler" ? (
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
  onOpenBooking: (booking: SavedBooking) => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[34px] border border-white/10 bg-[#080A10] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)]">
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

        <div className="mt-5 rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
              vehicle.booking ? getBookingStatus(vehicle.booking) : "Available"
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
                <span className="text-white">
                  {vehicle.booking.contractData.nombreCliente}
                </span>
              </p>

              <p>
                Phone:{" "}
                <span className="text-white">
                  {vehicle.booking.contractData.telefono || "-"}
                </span>
              </p>

              <p>
                Contract:{" "}
                <span className="text-white">
                  {vehicle.booking.contractData.numeroContrato ||
                    vehicle.booking.id}
                </span>
              </p>

              <p>
                Payment:{" "}
                <span className="text-white">
                  {paymentMethodLabel(getPaymentMethod(vehicle.booking))}
                </span>
              </p>

              <p>
                Total:{" "}
                <span className="text-white">
                  {formatMoneyFromCents(getTotalCents(vehicle.booking))}
                </span>
              </p>

              <p>
                Pickup:{" "}
                <span className="text-white">
                  {formatDateTime(
                    vehicle.booking.contractData.fechaEntrega,
                    vehicle.booking.contractData.horaEntrega
                  )}
                </span>
              </p>

              <p>
                Return:{" "}
                <span className="text-white">
                  {formatDateTime(
                    vehicle.booking.contractData.fechaDevolucion,
                    vehicle.booking.contractData.horaDevolucion
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