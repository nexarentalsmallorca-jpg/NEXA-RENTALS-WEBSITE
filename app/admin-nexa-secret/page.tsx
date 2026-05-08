"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { nexaFleet } from "../../lib/nexaFleet";

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
    numeroContrato?: string;
    fechaEntrega: string;
    horaEntrega: string;
    fechaDevolucion: string;
    horaDevolucion: string;
    nombreCliente: string;
    dniPasaporte?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    dias?: string;
    precioPorDia?: string;
    total: string;
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
    kmSalida?: string;
    combustibleSalida?: string;
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

type FleetRow = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  imageUrl: string;
  status: "available" | "rented" | "reserved" | "pickup_pending" | "wanted";
  label: string;
  sub: string;
  booking?: SavedBooking;
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

function isWantedVehicleStatus(status?: string) {
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

function formatBookingWindow(booking: SavedBooking) {
  const { start, end } = getBookingTiming(booking);

  if (!start || !end) {
    return `${booking.contractData.fechaEntrega || "--"} ${
      booking.contractData.horaEntrega || "--"
    } - ${booking.contractData.fechaDevolucion || "--"} ${
      booking.contractData.horaDevolucion || "--"
    }`;
  }

  return `${formatDisplayDate(start)} ${formatDisplayTime(
    start
  )} - ${formatDisplayDate(end)} ${formatDisplayTime(end)}`;
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
      createdAt: cleanText(
        row.createdAt || row.created_at || new Date().toISOString()
      ),
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
    payment_status:
      row.payment_status || (paymentMethod === "unpaid" ? "unpaid" : "paid"),
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
      createdAt:
        booking.createdAt || booking.created_at || new Date().toISOString(),
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

    if (!existing.contractData?.telefono && booking.contractData?.telefono) {
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

function getCurrentVehicleBooking(vehicleCode: string, bookings: SavedBooking[]) {
  return bookings.find((booking) => {
    if (booking.vehicle.codigo !== vehicleCode) return false;
    return getBookingStatus(booking) === "En alquiler";
  });
}

function getPendingPickupVehicleBooking(
  vehicleCode: string,
  bookings: SavedBooking[]
) {
  return bookings.find((booking) => {
    if (booking.vehicle.codigo !== vehicleCode) return false;
    return getBookingStatus(booking) === "Pendiente pickup";
  });
}

function getNextVehicleBooking(vehicleCode: string, bookings: SavedBooking[]) {
  return sortBookingsByPickup(
    bookings.filter((booking) => {
      if (booking.vehicle.codigo !== vehicleCode) return false;
      return getBookingStatus(booking) === "Confirmada";
    })
  )[0];
}

function getStatusClasses(status: FleetRow["status"]) {
  if (status === "available") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "rented") {
    return "border-orange-400/20 bg-orange-500/10 text-orange-300";
  }

  if (status === "pickup_pending") {
    return "border-yellow-400/20 bg-yellow-500/10 text-yellow-300";
  }

  if (status === "reserved") {
    return "border-sky-400/20 bg-sky-500/10 text-sky-300";
  }

  return "border-red-400/20 bg-red-500/10 text-red-300";
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [isLoadingOnline, setIsLoadingOnline] = useState(true);
  const [onlineLoaded, setOnlineLoaded] = useState(false);

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

  const activeBookings = useMemo(() => {
    return sortBookingsByPickup(
      bookings.filter((booking) => getBookingStatus(booking) === "En alquiler")
    );
  }, [bookings]);

  const pendingPickupBookings = useMemo(() => {
    return sortBookingsByPickup(
      bookings.filter(
        (booking) => getBookingStatus(booking) === "Pendiente pickup"
      )
    );
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    return sortBookingsByPickup(
      bookings.filter((booking) => getBookingStatus(booking) === "Confirmada")
    );
  }, [bookings]);

  const wantedBookings = useMemo(() => {
    return bookings.filter((booking) => isWantedVehicleStatus(booking.status));
  }, [bookings]);

  const fleetRows = useMemo<FleetRow[]>(() => {
    return nexaFleet.map((vehicle) => {
      const wantedBooking = wantedBookings.find(
        (booking) => booking.vehicle.codigo === vehicle.codigo
      );

      if (wantedBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "wanted",
          label: "Wanted / Problem",
          sub: wantedBooking.status || "Needs attention",
          booking: wantedBooking,
        };
      }

      const currentBooking = getCurrentVehicleBooking(vehicle.codigo, bookings);

      if (currentBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "rented",
          label: "Rented out",
          sub: `${currentBooking.contractData.nombreCliente} · ${getReturnLabel(
            currentBooking
          )}`,
          booking: currentBooking,
        };
      }

      const pendingPickup = getPendingPickupVehicleBooking(
        vehicle.codigo,
        bookings
      );

      if (pendingPickup) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "pickup_pending",
          label: "Pickup pending",
          sub: `${pendingPickup.contractData.nombreCliente} · ${getPickupLabel(
            pendingPickup
          )}`,
          booking: pendingPickup,
        };
      }

      const nextBooking = getNextVehicleBooking(vehicle.codigo, bookings);

      if (nextBooking) {
        return {
          codigo: vehicle.codigo,
          matricula: vehicle.matricula,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          imageUrl: getVehicleImage(vehicle),
          status: "reserved",
          label: "Reserved",
          sub: `${nextBooking.contractData.nombreCliente} · ${getPickupLabel(
            nextBooking
          )}`,
          booking: nextBooking,
        };
      }

      return {
        codigo: vehicle.codigo,
        matricula: vehicle.matricula,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        imageUrl: getVehicleImage(vehicle),
        status: "available",
        label: "Available",
        sub: "Ready to rent now.",
      };
    });
  }, [bookings, wantedBookings]);

  const availableVehicles = useMemo(() => {
    return fleetRows.filter((vehicle) => vehicle.status === "available");
  }, [fleetRows]);

  const rentedVehicles = useMemo(() => {
    return fleetRows.filter((vehicle) => vehicle.status === "rented");
  }, [fleetRows]);

  const wantedVehicles = useMemo(() => {
    return fleetRows.filter((vehicle) => vehicle.status === "wanted");
  }, [fleetRows]);

  const todayPickups = useMemo(() => {
    return sortBookingsByPickup(
      bookings.filter((booking) => {
        const status = getBookingStatus(booking);
        const { start } = getBookingTiming(booking);

        return status !== "Cancelada" && status !== "Finalizada" && isToday(start);
      })
    );
  }, [bookings]);

  const todayReturns = useMemo(() => {
    return sortBookingsByPickup(
      bookings.filter((booking) => {
        const status = getBookingStatus(booking);
        const { end } = getBookingTiming(booking);

        return status !== "Cancelada" && status !== "Finalizada" && isToday(end);
      })
    );
  }, [bookings]);

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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-sky-500/10 blur-[90px]" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
              Private Operating System
            </p>

            <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-white md:text-5xl">
              NEXA OS Control Center
            </h2>

            <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-white/55">
              Main dashboard focused only on fleet control: total fleet,
              available vehicles, rented out vehicles, wanted/problem vehicles,
              and the real customers currently renting your vehicles.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
              <span
                className={`rounded-full border px-3 py-2 ${
                  onlineLoaded
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                    : "border-sky-400/20 bg-sky-500/10 text-sky-300"
                }`}
              >
                {isLoadingOnline
                  ? "Loading Supabase bookings..."
                  : "Supabase bookings loaded"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-white/50">
                Total sales: {formatMoneyFromCents(summary.totalCents)}
              </span>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                Cash: {formatMoneyFromCents(summary.cashCents)}
              </span>

              <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-sky-300">
                Card: {formatMoneyFromCents(summary.cardCents)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              onClick={loadBookings}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/[0.1]"
            >
              Refresh System
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MainStatCard
          title="Total Fleet"
          value={nexaFleet.length}
          subtitle="All registered NEXA vehicles"
          tone="purple"
        />

        <MainStatCard
          title="Available Vehicles"
          value={availableVehicles.length}
          subtitle="Ready to rent right now"
          tone="emerald"
        />

        <MainStatCard
          title="Rented Out"
          value={rentedVehicles.length}
          subtitle="Marked as picked up / in rental"
          tone="orange"
        />

        <MainStatCard
          title="Wanted Vehicles"
          value={wantedVehicles.length}
          subtitle="Problem, blocked or maintenance"
          tone="red"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SimpleAlertBox
          title="Pickups Today"
          tone="yellow"
          emptyText="No pickups scheduled for today."
          bookings={todayPickups}
          labelFn={getPickupLabel}
        />

        <SimpleAlertBox
          title="Returns Today"
          tone="orange"
          emptyText="No returns expected today."
          bookings={todayReturns}
          labelFn={getReturnLabel}
        />

        <SimpleAlertBox
          title="Upcoming Reservations"
          tone="sky"
          emptyText="No future reservations found."
          bookings={upcomingBookings.slice(0, 8)}
          labelFn={getPickupLabel}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
                Rented Vehicles
              </p>

              <h3 className="mt-1 text-2xl font-black text-white">
                Currently Rented Out
              </h3>

              <p className="mt-2 text-sm font-bold text-white/45">
                These are the vehicles that are currently with customers.
              </p>
            </div>

            <Link
              href="/admin-nexa-secret/bookings"
              className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-300 transition hover:bg-orange-500/15"
            >
              Open Bookings
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {activeBookings.length === 0 ? (
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-8 text-center">
                <p className="text-xl font-black text-white">
                  No vehicles rented out right now
                </p>

                <p className="mt-2 text-sm font-bold text-emerald-300">
                  All active vehicles are available unless reserved or pending
                  pickup.
                </p>
              </div>
            ) : (
              activeBookings.map((booking) => (
                <Link
                  href="/admin-nexa-secret/bookings"
                  key={`${booking.source}-${getBookingKey(booking)}`}
                  className="block rounded-3xl border border-orange-400/20 bg-orange-500/10 p-5 transition hover:bg-orange-500/15"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <p className="text-xl font-black text-white">
                        {booking.vehicle.codigo} · {booking.vehicle.matricula}
                      </p>

                      <p className="mt-1 text-sm font-bold text-white/55">
                        {booking.vehicle.marca} {booking.vehicle.modelo}
                      </p>

                      <p className="mt-3 text-lg font-black text-white">
                        {booking.contractData.nombreCliente}
                      </p>

                      <p className="mt-1 text-sm font-bold text-white/50">
                        Phone: {booking.contractData.telefono || "-"}
                      </p>

                      <p className="mt-1 text-sm font-bold text-white/50">
                        Contract: {booking.contractData.numeroContrato || booking.id}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-orange-300">
                        Rented out
                      </span>

                      <p className="mt-3 text-sm font-black text-white">
                        {getReturnLabel(booking)}
                      </p>

                      <p className="mt-2 text-xs font-bold text-white/45">
                        {formatBookingWindow(booking)}
                      </p>

                      <p className="mt-2 text-sm font-black text-emerald-300">
                        {formatMoneyFromCents(getTotalCents(booking))} ·{" "}
                        {paymentMethodLabel(getPaymentMethod(booking))}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Fleet Board
              </p>

              <h3 className="mt-1 text-2xl font-black text-white">
                Vehicles Now
              </h3>
            </div>

            <Link
              href="/admin-nexa-secret/vehicles"
              className="rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2 text-xs font-black text-sky-300 transition hover:bg-sky-500/15"
            >
              Fleet Page
            </Link>
          </div>

          <div className="mt-5 space-y-2">
            {fleetRows.map((item) => (
              <Link
                href="/admin-nexa-secret/bookings"
                key={item.codigo}
                className="block rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-white">
                      {item.codigo} · {item.matricula}
                    </p>

                    <p className="mt-1 text-xs font-bold text-white/45">
                      {item.marca} {item.modelo}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${getStatusClasses(
                      item.status
                    )}`}
                  >
                    {item.label}
                  </span>
                </div>

                <p className="mt-2 text-xs font-bold text-white/40">
                  {item.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MainStatCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: number;
  subtitle: string;
  tone: "purple" | "emerald" | "orange" | "red";
}) {
  const styles = {
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
  };

  return (
    <div className={`rounded-[30px] border p-6 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em]">{title}</p>
      <p className="mt-3 text-5xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm font-bold text-white/45">{subtitle}</p>
    </div>
  );
}

function SimpleAlertBox({
  title,
  tone,
  emptyText,
  bookings,
  labelFn,
}: {
  title: string;
  tone: "yellow" | "orange" | "sky";
  emptyText: string;
  bookings: SavedBooking[];
  labelFn: (booking: SavedBooking) => string;
}) {
  const styles = {
    yellow: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    orange: "border-orange-400/20 bg-orange-400/10 text-orange-300",
    sky: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  };

  return (
    <div className={`rounded-[30px] border p-5 ${styles[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.22em]">{title}</p>

        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-black text-white">
          {bookings.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {bookings.length === 0 ? (
          <p className="text-sm font-bold text-white/45">{emptyText}</p>
        ) : (
          bookings.slice(0, 5).map((booking) => (
            <Link
              href="/admin-nexa-secret/bookings"
              key={`${title}-${getBookingKey(booking)}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.05] p-3 transition hover:bg-white/[0.08]"
            >
              <p className="text-sm font-black text-white">
                {booking.vehicle.codigo} · {booking.contractData.nombreCliente}
              </p>

              <p className="mt-1 text-xs font-bold text-white/70">
                {labelFn(booking)}
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                {booking.source}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}