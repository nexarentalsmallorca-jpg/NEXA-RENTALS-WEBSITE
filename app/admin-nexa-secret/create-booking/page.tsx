"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminShell from "../../components/dashboard/AdminShell";
import { nexaFleet } from "../../../lib/nexaFleet";

type PaymentMethod = "cash" | "card" | "";
type BookingAction = "rent_now" | "reserve_now";

type BookingForm = {
  numeroContrato: string;
  codigoVehiculo: string;

  kmSalida: string;
  combustibleSalida: string;

  fechaEntrega: string;
  horaEntrega: string;
  fechaDevolucion: string;
  horaDevolucion: string;

  nombreCliente: string;
  dniPasaporte: string;
  telefono: string;
  email: string;
  direccion: string;

  permisoConducir: string;
  paisExpedicion: string;
  fechaCaducidad: string;

  segundoNombre: string;
  segundoPermiso: string;
  segundoPais: string;
  segundoFechaCaducidad: string;
  segundoDireccion: string;

  dias: string;
  precioPorDia: string;
  total: string;

  pagado: string;
  metodoPago: PaymentMethod;

  notas: string;
};

type ManualBooking = {
  id: string;
  createdAt?: string;
  status?: string;
  source?: string;
  bookingAction?: BookingAction;
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
  contractData?: Partial<BookingForm> & {
    numeroContrato?: string;
    oficinaEntrega?: string;
    oficinaDevolucion?: string;
    fianza?: string;
    franquicia?: string;
    extras?: string;
    paymentMethod?: PaymentMethod;
    bookingAction?: BookingAction;
  };
  contractPdf?: {
    fileName?: string;
    pdfBase64?: string;
    drive?: any;
    generatedAt?: string;
  };
};

type OnlineBookingRow = {
  id?: string | number;
  created_at?: string;
  createdAt?: string;
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
  vehicle?: ManualBooking["vehicle"];
  contractData?: ManualBooking["contractData"];
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;

const initialForm: BookingForm = {
  numeroContrato: "",
  codigoVehiculo: "",

  kmSalida: "",
  combustibleSalida: "7/7",

  fechaEntrega: "",
  horaEntrega: "",
  fechaDevolucion: "",
  horaDevolucion: "",

  nombreCliente: "",
  dniPasaporte: "",
  telefono: "",
  email: "",
  direccion: "",

  permisoConducir: "",
  paisExpedicion: "",
  fechaCaducidad: "",

  segundoNombre: "",
  segundoPermiso: "",
  segundoPais: "",
  segundoFechaCaducidad: "",
  segundoDireccion: "",

  dias: "",
  precioPorDia: "",
  total: "",

  pagado: "",
  metodoPago: "",

  notas: "",
};

const requiredFields: Array<keyof BookingForm> = [
  "codigoVehiculo",
  "combustibleSalida",
  "fechaEntrega",
  "horaEntrega",
  "fechaDevolucion",
  "horaDevolucion",
  "nombreCliente",
  "dniPasaporte",
  "telefono",
  "direccion",
  "permisoConducir",
  "paisExpedicion",
  "fechaCaducidad",
  "dias",
  "precioPorDia",
  "total",
  "metodoPago",
];

function buildDateTime(date: string, time: string) {
  if (!date || !time) return null;

  const value = new Date(`${date}T${time}`);

  return Number.isNaN(value.getTime()) ? null : value;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function extractVehicleCodeFromText(value?: string | null) {
  if (!value) return "";

  const match = value.match(/\bN\d+\b/i);

  return match?.[0]?.toUpperCase() || "";
}

function getBookingVehicleCode(booking: ManualBooking) {
  const directCode = booking.vehicle?.codigo || "";
  const extractedFromDirect = extractVehicleCodeFromText(directCode);

  if (extractedFromDirect) return extractedFromDirect;

  const vehicleText = [
    booking.vehicle?.codigo,
    booking.vehicle?.matricula,
    booking.vehicle?.marca,
    booking.vehicle?.modelo,
  ]
    .filter(Boolean)
    .join(" ");

  return extractVehicleCodeFromText(vehicleText);
}

function bookingDateRange(booking: ManualBooking) {
  const data = booking.contractData;
  if (!data) return null;

  const start = buildDateTime(data.fechaEntrega || "", data.horaEntrega || "");
  const end = buildDateTime(
    data.fechaDevolucion || "",
    data.horaDevolucion || ""
  );

  if (!start || !end) return null;

  const blockedEnd = addMinutes(end, BUFFER_MINUTES_AFTER_BOOKING);

  return { start, end, blockedEnd };
}

function isOverlapping(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) {
  return startA < endB && startB < endA;
}

function isCancelledStatus(status?: string) {
  const clean = String(status || "").toLowerCase();

  return (
    clean.includes("cancel") ||
    clean.includes("cancelada") ||
    clean.includes("cancelled") ||
    clean.includes("refunded") ||
    clean.includes("failed")
  );
}

function isFinishedStatus(status?: string) {
  const clean = String(status || "").toLowerCase();

  return (
    clean.includes("finalizada") ||
    clean.includes("completed") ||
    clean.includes("finished") ||
    clean.includes("returned")
  );
}

function isInactiveStatus(status?: string) {
  return isCancelledStatus(status) || isFinishedStatus(status);
}

function formatDateEs(date: Date) {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTimeEs(date: Date) {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getReturnLabel(end: Date) {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (endDay.getTime() === today.getTime()) {
    return `Vuelve hoy a las ${formatTimeEs(end)}`;
  }

  if (endDay.getTime() === tomorrow.getTime()) {
    return `Vuelve mañana a las ${formatTimeEs(end)}`;
  }

  if (endDay.getTime() === dayAfterTomorrow.getTime()) {
    return `Vuelve pasado mañana a las ${formatTimeEs(end)}`;
  }

  return `Vuelve el ${formatDateEs(end)} a las ${formatTimeEs(end)}`;
}

function getBlockedUntilLabel(blockedEnd: Date) {
  return `Bloqueado hasta el ${formatDateEs(blockedEnd)} a las ${formatTimeEs(
    blockedEnd
  )}`;
}

function sanitizeMoneyValue(value: string) {
  return value.replace(/[^\d.,]/g, "");
}

function normalizeMoneyForContract(value: string) {
  const cleanValue = sanitizeMoneyValue(value).trim();
  if (!cleanValue) return "";
  return `${cleanValue} €`;
}

function generateTimeOptions() {
  const options: string[] = [];

  for (let hour = 9; hour <= 20; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 20 && minute > 0) continue;

      const hourLabel = String(hour).padStart(2, "0");
      const minuteLabel = String(minute).padStart(2, "0");

      options.push(`${hourLabel}:${minuteLabel}`);
    }
  }

  return options;
}

function normalizePaymentMethod(value?: string): PaymentMethod {
  const clean = String(value || "").toLowerCase();

  if (
    clean === "cash" ||
    clean.includes("cash") ||
    clean.includes("efectivo")
  ) {
    return "cash";
  }

  if (
    clean === "card" ||
    clean.includes("card") ||
    clean.includes("tarjeta") ||
    clean.includes("stripe")
  ) {
    return "card";
  }

  return "";
}

function paymentMethodLabel(value?: string) {
  const method = normalizePaymentMethod(value);

  if (method === "cash") return "Efectivo";
  if (method === "card") return "Tarjeta";

  return "No seleccionado";
}

function bookingActionLabel(value: BookingAction) {
  if (value === "rent_now") return "Rent Now / En alquiler";
  return "Reserve Now / Reservada";
}

function getStatusFromBookingAction(value: BookingAction) {
  if (value === "rent_now") return "rented_out";
  return "reserved";
}

function getStoredBookings(): ManualBooking[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function normalizeOnlineBooking(row: OnlineBookingRow): ManualBooking {
  if (row.contractData) {
    const cleanStatus = String(row.status || "").toLowerCase();
    const bookingAction: BookingAction =
      cleanStatus.includes("rented") || cleanStatus.includes("alquil")
        ? "rent_now"
        : "reserve_now";

    return {
      id: String(
        row.stripe_payment_intent_id ||
          row.contract_number ||
          row.contractData.numeroContrato ||
          row.id ||
          Date.now()
      ),
      createdAt: row.createdAt || row.created_at || new Date().toISOString(),
      status: row.status || "reserved",
      source: row.source || "Online",
      bookingAction,
      vehicle: row.vehicle || {
        codigo:
          row.vehicle_code ||
          extractVehicleCodeFromText(row.vehicle_name || "") ||
          "ONLINE",
        matricula: "",
        marca: row.vehicle_name || "Vehículo online",
        modelo: "",
        ano: "",
        bastidor: "",
        combustible: "",
        tipo: "",
      },
      contractData: {
        ...row.contractData,
        bookingAction,
        metodoPago:
          normalizePaymentMethod(row.payment_method) ||
          normalizePaymentMethod(row.contractData.metodoPago) ||
          normalizePaymentMethod(row.contractData.paymentMethod),
        paymentMethod:
          normalizePaymentMethod(row.payment_method) ||
          normalizePaymentMethod(row.contractData.paymentMethod) ||
          normalizePaymentMethod(row.contractData.metodoPago),
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

  const vehicleCode =
    row.vehicle_code || extractVehicleCodeFromText(row.vehicle_name || "");

  const method = normalizePaymentMethod(row.payment_method);

  const cleanStatus = String(row.status || "").toLowerCase();
  const bookingAction: BookingAction =
    cleanStatus.includes("rented") || cleanStatus.includes("alquil")
      ? "rent_now"
      : "reserve_now";

  return {
    id: String(paymentId),
    createdAt: row.created_at || new Date().toISOString(),
    status: row.status === "paid" ? "reserved" : row.status || "reserved",
    source: row.source || "Online",
    bookingAction,
    vehicle: {
      codigo: vehicleCode || row.vehicle_name || "ONLINE",
      matricula: "-",
      marca: row.vehicle_name || "Vehículo online",
      modelo: "",
      ano: "",
      bastidor: "",
      combustible: "",
      tipo: "",
    },
    contractData: {
      numeroContrato: row.contract_number || String(paymentId),
      fechaEntrega: row.pickup_date || "",
      horaEntrega: row.pickup_time || "",
      fechaDevolucion: row.dropoff_date || "",
      horaDevolucion: row.dropoff_time || "",
      nombreCliente: row.customer_name || "Cliente online",
      dniPasaporte: row.customer_dni || "-",
      telefono: row.phone || "",
      email: row.customer_email || "",
      direccion: row.customer_address || "-",
      dias: row.rental_days || "-",
      precioPorDia: row.price_per_day || "-",
      total: totalAmount ? `${totalAmount.toFixed(2)} €` : "0 €",
      pagado: totalAmount ? `${totalAmount.toFixed(2)} €` : "0 €",
      metodoPago: method || "card",
      paymentMethod: method || "card",
      bookingAction,
      kmSalida: "",
      combustibleSalida: "",
    },
  };
}

async function fetchOnlineBookings(): Promise<ManualBooking[]> {
  try {
    const response = await fetch("/api/admin/bookings", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    const rows = Array.isArray(data?.bookings) ? data.bookings : [];

    return rows.map((row: OnlineBookingRow) => normalizeOnlineBooking(row));
  } catch {
    return [];
  }
}

async function saveManualBookingToSharedSystem(booking: ManualBooking) {
  try {
    const response = await fetch("/api/admin/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ booking }),
    });

    if (!response.ok) {
      return { ok: false };
    }

    const data = await response.json();

    return { ok: Boolean(data?.ok) };
  } catch {
    return { ok: false };
  }
}

function ModernDateInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;

    input.focus();

    if (typeof input.showPicker === "function") {
      input.showPicker();
    }
  }

  return (
    <button
      type="button"
      onClick={openPicker}
      className="group relative flex w-full items-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-left text-white outline-none transition hover:border-orange-400/35 focus:border-orange-400/50"
    >
      <span className={`flex-1 ${value ? "text-white" : "text-white/30"}`}>
        {value || placeholder}
      </span>

      <span className="ml-3 rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-white/45 transition group-hover:text-orange-300">
        📅
      </span>

      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer opacity-0"
        tabIndex={-1}
      />
    </button>
  );
}

function ModernTimeSelect({
  value,
  onChange,
  placeholder,
  timeOptions,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  timeOptions: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 pr-12 outline-none transition focus:border-orange-400/50 ${
          value ? "text-white" : "text-white/30"
        }`}
      >
        <option value="" className="bg-[#11131A] text-white">
          {placeholder}
        </option>

        {timeOptions.map((time) => (
          <option key={time} value={time} className="bg-[#11131A] text-white">
            {time}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-white/45">
        🕒
      </div>
    </div>
  );
}

function EuroInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.05] transition focus-within:border-orange-400/50">
      <span className="pl-4 text-base font-black text-orange-300">€</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(sanitizeMoneyValue(e.target.value))}
        className="w-full rounded-2xl bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/30"
        placeholder={placeholder}
      />
    </div>
  );
}

function BookingActionSelector({
  value,
  onChange,
}: {
  value: BookingAction;
  onChange: (value: BookingAction) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">
        Tipo de operación *
      </p>
      <p className="mt-1 text-xs font-bold text-white/40">
        Selecciona si el cliente se lleva el vehículo ahora o si solo quieres
        reservarlo para una fecha futura.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("rent_now")}
          className={`rounded-2xl border px-4 py-4 text-left transition ${
            value === "rent_now"
              ? "border-orange-400/70 bg-orange-500/20 text-orange-100 shadow-[0_15px_45px_rgba(249,115,22,0.2)]"
              : "border-white/10 bg-white/[0.04] text-white/45 hover:border-orange-400/35 hover:text-orange-200"
          }`}
        >
          <span className="block text-sm font-black">Rent Now</span>
          <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
            Sale ahora
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("reserve_now")}
          className={`rounded-2xl border px-4 py-4 text-left transition ${
            value === "reserve_now"
              ? "border-sky-400/70 bg-sky-500/20 text-sky-100 shadow-[0_15px_45px_rgba(14,165,233,0.2)]"
              : "border-white/10 bg-white/[0.04] text-white/45 hover:border-sky-400/35 hover:text-sky-200"
          }`}
        >
          <span className="block text-sm font-black">Reserve Now</span>
          <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.16em] opacity-70">
            Fecha futura
          </span>
        </button>
      </div>
    </div>
  );
}

function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-300">
        Pagado *
      </p>
      <p className="mt-1 text-xs font-bold text-white/40">
        Selecciona cómo ha pagado el cliente. Esto se guardará en ventas.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("cash")}
          className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
            value === "cash"
              ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200 shadow-[0_15px_45px_rgba(16,185,129,0.18)]"
              : "border-white/10 bg-white/[0.04] text-white/45 hover:border-emerald-400/35 hover:text-emerald-200"
          }`}
        >
          Cash
          <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] opacity-70">
            Efectivo
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("card")}
          className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
            value === "card"
              ? "border-sky-400/60 bg-sky-500/20 text-sky-200 shadow-[0_15px_45px_rgba(14,165,233,0.18)]"
              : "border-white/10 bg-white/[0.04] text-white/45 hover:border-sky-400/35 hover:text-sky-200"
          }`}
        >
          Card
          <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] opacity-70">
            Tarjeta
          </span>
        </button>
      </div>
    </div>
  );
}

export default function CreateBookingPage() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [bookingAction, setBookingAction] =
    useState<BookingAction>("rent_now");
  const [manualBookings, setManualBookings] = useState<ManualBooking[]>([]);
  const [onlineBookings, setOnlineBookings] = useState<ManualBooking[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [contractStatus, setContractStatus] = useState("");
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [isLoadingOnlineBookings, setIsLoadingOnlineBookings] = useState(true);

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  async function refreshAllBookings() {
    setManualBookings(getStoredBookings());

    setIsLoadingOnlineBookings(true);
    const loadedOnlineBookings = await fetchOnlineBookings();
    setOnlineBookings(loadedOnlineBookings);
    setIsLoadingOnlineBookings(false);
  }

  useEffect(() => {
    refreshAllBookings();

    function refreshStoredBookings() {
      refreshAllBookings();
    }

    window.addEventListener("storage", refreshStoredBookings);

    return () => {
      window.removeEventListener("storage", refreshStoredBookings);
    };
  }, []);

  const allBookings = useMemo(() => {
    return [...onlineBookings, ...manualBookings];
  }, [onlineBookings, manualBookings]);

  const selectedVehicle = useMemo(() => {
    return nexaFleet.find((vehicle) => vehicle.codigo === form.codigoVehiculo);
  }, [form.codigoVehiculo]);

  const selectedDateRange = useMemo(() => {
    const start = buildDateTime(form.fechaEntrega, form.horaEntrega);
    const end = buildDateTime(form.fechaDevolucion, form.horaDevolucion);

    if (!start || !end) return null;

    const blockedEnd = addMinutes(end, BUFFER_MINUTES_AFTER_BOOKING);

    return { start, end, blockedEnd };
  }, [
    form.fechaEntrega,
    form.horaEntrega,
    form.fechaDevolucion,
    form.horaDevolucion,
  ]);

  const activeBookings = useMemo(() => {
    const now = new Date();

    return allBookings
      .map((booking) => {
        const range = bookingDateRange(booking);
        if (!range) return null;

        return {
          booking,
          start: range.start,
          end: range.end,
          blockedEnd: range.blockedEnd,
        };
      })
      .filter(Boolean)
      .filter((item) => {
        if (!item) return false;
        if (isInactiveStatus(item.booking.status)) return false;

        return item.start <= now && item.end > now;
      }) as Array<{
      booking: ManualBooking;
      start: Date;
      end: Date;
      blockedEnd: Date;
    }>;
  }, [allBookings]);

  const vehicleAvailabilityMap = useMemo(() => {
    const map = new Map<
      string,
      {
        isActiveNow: boolean;
        isBlockedForSelectedDates: boolean;
        activeBooking?: ManualBooking;
        activeEnd?: Date;
        activeBlockedEnd?: Date;
        selectedConflict?: ManualBooking;
        selectedConflictEnd?: Date;
        selectedConflictBlockedEnd?: Date;
      }
    >();

    nexaFleet.forEach((vehicle) => {
      const activeItem = activeBookings.find(
        (item) => getBookingVehicleCode(item.booking) === vehicle.codigo
      );

      let selectedConflict:
        | {
            booking: ManualBooking;
            end: Date;
            blockedEnd: Date;
          }
        | undefined;

      if (selectedDateRange && selectedDateRange.end > selectedDateRange.start) {
        const conflict = allBookings
          .map((booking) => {
            const range = bookingDateRange(booking);
            if (!range) return null;

            return {
              booking,
              start: range.start,
              end: range.end,
              blockedEnd: range.blockedEnd,
            };
          })
          .filter(Boolean)
          .find((item) => {
            if (!item) return false;
            if (isInactiveStatus(item.booking.status)) return false;

            if (getBookingVehicleCode(item.booking) !== vehicle.codigo) {
              return false;
            }

            return isOverlapping(
              selectedDateRange.start,
              selectedDateRange.blockedEnd,
              item.start,
              item.blockedEnd
            );
          });

        if (conflict) {
          selectedConflict = {
            booking: conflict.booking,
            end: conflict.end,
            blockedEnd: conflict.blockedEnd,
          };
        }
      }

      map.set(vehicle.codigo, {
        isActiveNow: Boolean(activeItem),
        isBlockedForSelectedDates: Boolean(selectedConflict),
        activeBooking: activeItem?.booking,
        activeEnd: activeItem?.end,
        activeBlockedEnd: activeItem?.blockedEnd,
        selectedConflict: selectedConflict?.booking,
        selectedConflictEnd: selectedConflict?.end,
        selectedConflictBlockedEnd: selectedConflict?.blockedEnd,
      });
    });

    return map;
  }, [activeBookings, allBookings, selectedDateRange]);

  const selectedVehicleAvailability = form.codigoVehiculo
    ? vehicleAvailabilityMap.get(form.codigoVehiculo)
    : undefined;

  const nextContractNumber = useMemo(() => {
    if (typeof window === "undefined") return "NX-75";

    const currentBookings = getStoredBookings();
    const nextNumber = 75 + currentBookings.length;

    return `NX-${nextNumber}`;
  }, [success, manualBookings.length]);

  function updateField(field: keyof BookingForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "total"
        ? {
            pagado: value,
          }
        : {}),
    }));
  }

  function createContractNumber() {
    const currentBookings = getStoredBookings();
    const nextNumber = 75 + currentBookings.length;

    return `NX-${nextNumber}`;
  }

  function saveBookingToLocalStorage(bookingToSave: ManualBooking) {
    const currentBookings = getStoredBookings();
    const updatedBookings = [bookingToSave, ...currentBookings];

    localStorage.setItem(
      "nexa_manual_bookings",
      JSON.stringify(updatedBookings)
    );

    setManualBookings(updatedBookings);
  }

  function updateBookingInLocalStorage(updatedBooking: ManualBooking) {
    const latestBookings = getStoredBookings();

    const replacedBookings = latestBookings.map((booking) =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    );

    localStorage.setItem(
      "nexa_manual_bookings",
      JSON.stringify(replacedBookings)
    );

    setManualBookings(replacedBookings);
  }

  async function generateContractPdf(newBooking: ManualBooking) {
    setIsGeneratingContract(true);
    setContractStatus("Generando PDF del contrato...");

    try {
      const response = await fetch("/api/admin/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: newBooking,
          existingBookings: allBookings.filter(
            (booking) => booking.id !== newBooking.id
          ),
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        console.error("PDF generation failed:", data.error);
        setContractStatus(
          data.error ||
            "La reserva se ha guardado, pero el PDF no se pudo generar."
        );
        return;
      }

      const updatedBooking = {
        ...newBooking,
        contractPdf: {
          fileName: data.fileName,
          pdfBase64: data.pdfBase64,
          drive: data.drive,
          generatedAt: new Date().toISOString(),
        },
      };

      updateBookingInLocalStorage(updatedBooking);

      if (data.drive?.uploaded) {
        setContractStatus(
          `PDF generado y subido a Google Drive: ${data.fileName}`
        );
      } else if (data.drive?.skipped) {
        setContractStatus(
          `PDF generado correctamente. Google Drive está pendiente de configurar con ENV vars.`
        );
      } else {
        setContractStatus(`PDF generado correctamente: ${data.fileName}`);
      }

      console.log("PDF contract generated:", data);
    } catch (err) {
      console.error("PDF generation request failed:", err);
      setContractStatus(
        "La reserva se ha guardado, pero hubo un error al generar el PDF."
      );
    } finally {
      setIsGeneratingContract(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setContractStatus("");

    const missingFields = requiredFields.filter((field) => !form[field].trim());

    if (missingFields.length > 0) {
      setError(
        "Faltan campos obligatorios. Revisa el formulario antes de generar el contrato."
      );
      return;
    }

    if (!selectedVehicle) {
      setError("Selecciona un vehículo válido.");
      return;
    }

    if (!selectedDateRange) {
      setError("Revisa la fecha y hora de entrega/devolución.");
      return;
    }

    if (selectedDateRange.end <= selectedDateRange.start) {
      setError("La fecha/hora de devolución debe ser posterior a la entrega.");
      return;
    }

    if (selectedVehicleAvailability?.isBlockedForSelectedDates) {
      const returnText = selectedVehicleAvailability.selectedConflictBlockedEnd
        ? getBlockedUntilLabel(
            selectedVehicleAvailability.selectedConflictBlockedEnd
          )
        : "ya está bloqueado para esas fechas";

      setError(
        `No puedes crear esta reserva. El vehículo ${selectedVehicle.codigo} ${returnText}.`
      );
      return;
    }

    const numeroContratoAutomatico = createContractNumber();
    const totalPagado = normalizeMoneyForContract(form.total);
    const paymentMethod = form.metodoPago;
    const finalStatus = getStatusFromBookingAction(bookingAction);

    const newBooking: ManualBooking = {
      id: numeroContratoAutomatico,
      createdAt: new Date().toISOString(),
      status: finalStatus,
      source: "Manual",
      bookingAction,
      vehicle: selectedVehicle,
      contractData: {
        ...form,
        email: form.email.trim(),
        numeroContrato: numeroContratoAutomatico,
        oficinaEntrega: "OFICINA MAGALUF",
        oficinaDevolucion: "OFICINA MAGALUF",
        precioPorDia: normalizeMoneyForContract(form.precioPorDia),
        total: normalizeMoneyForContract(form.total),
        pagado: totalPagado,
        metodoPago: paymentMethod,
        paymentMethod,
        bookingAction,
        fianza: "150 €",
        franquicia: "800 €",
        extras:
          "Casco 1, Casco 2, Soporte móvil, Baúl, Antirrobo con alarma",
      },
    };

    saveBookingToLocalStorage(newBooking);

    const sharedSave = await saveManualBookingToSharedSystem(newBooking);

    setSuccess(
      sharedSave.ok
        ? `Reserva creada correctamente con contrato ${numeroContratoAutomatico} para ${form.nombreCliente}. Estado: ${bookingActionLabel(
            bookingAction
          )}. Pago guardado como ${paymentMethodLabel(
            paymentMethod
          )}. Vehículo ${selectedVehicle.codigo} bloqueado en el sistema compartido con ${BUFFER_MINUTES_AFTER_BOOKING} minutos extra de margen.`
        : `Reserva creada correctamente con contrato ${numeroContratoAutomatico} para ${form.nombreCliente}. Estado: ${bookingActionLabel(
            bookingAction
          )}. Pago guardado como ${paymentMethodLabel(
            paymentMethod
          )}. Vehículo ${selectedVehicle.codigo} bloqueado en localStorage con ${BUFFER_MINUTES_AFTER_BOOKING} minutos extra de margen. Cuando /api/admin/bookings guarde en Supabase, también bloqueará la web.`
    );

    console.log("NEXA booking created:", newBooking);

    await generateContractPdf(newBooking);
    await refreshAllBookings();

    setForm({
      ...initialForm,
      numeroContrato: "",
    });

    setBookingAction("rent_now");

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 150);
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
            Reserva Manual
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            Crear Contrato de Alquiler
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/55">
            Rellena los datos del cliente, conductor, vehículo y alquiler. El
            sistema guardará la reserva, bloqueará el vehículo, generará el PDF
            del contrato y lo subirá a Google Drive cuando estén configuradas las
            ENV vars.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-white/50">
              Manual local: {manualBookings.length}
            </span>
            <span
              className={`rounded-full border px-3 py-2 ${
                isLoadingOnlineBookings
                  ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
                  : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              {isLoadingOnlineBookings
                ? "Cargando online..."
                : `Online detectadas: ${onlineBookings.length}`}
            </span>
            <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-orange-300">
              Margen extra: {BUFFER_MINUTES_AFTER_BOOKING} min
            </span>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 xl:grid-cols-[1fr_0.72fr]"
        >
          <section className="space-y-6 rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div>
              <h3 className="text-2xl font-black text-white">
                Datos del Vehículo
              </h3>
              <p className="mt-1 text-sm text-white/45">
                Al seleccionar N1, N2, N3, etc., se rellenan matrícula, marca,
                modelo y bastidor automáticamente. El sistema aplica 1 hora
                extra de margen después de cada reserva.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-300">
                  Número de contrato automático
                </p>
                <p className="mt-1 text-base font-black text-white">
                  {form.numeroContrato || nextContractNumber}
                </p>
              </div>

              <select
                value={form.codigoVehiculo}
                onChange={(e) => updateField("codigoVehiculo", e.target.value)}
                className="rounded-2xl border border-white/10 bg-[#11131A] px-4 py-4 text-white outline-none focus:border-orange-400/50"
              >
                <option value="">Seleccionar vehículo *</option>
                {nexaFleet.map((vehicle) => {
                  const availability = vehicleAvailabilityMap.get(
                    vehicle.codigo
                  );

                  const statusText = availability?.isBlockedForSelectedDates
                    ? "NO DISPONIBLE EN ESTAS FECHAS"
                    : availability?.isActiveNow && availability.activeEnd
                    ? getReturnLabel(availability.activeEnd)
                    : "Disponible";

                  return (
                    <option
                      key={vehicle.codigo}
                      value={vehicle.codigo}
                      disabled={availability?.isBlockedForSelectedDates}
                    >
                      {vehicle.codigo} · {vehicle.matricula} · {vehicle.marca}{" "}
                      {vehicle.modelo} · {statusText}
                    </option>
                  );
                })}
              </select>

              {selectedVehicleAvailability?.isActiveNow &&
              selectedVehicleAvailability.activeEnd ? (
                <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-4 md:col-span-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-yellow-300">
                    Vehículo actualmente alquilado
                  </p>
                  <p className="mt-1 text-sm font-bold text-white/75">
                    {selectedVehicle?.codigo} · {selectedVehicle?.matricula} ·{" "}
                    {getReturnLabel(selectedVehicleAvailability.activeEnd)}
                  </p>
                </div>
              ) : null}

              {selectedVehicleAvailability?.isBlockedForSelectedDates &&
              selectedVehicleAvailability.selectedConflictBlockedEnd ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 md:col-span-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-300">
                    No disponible para estas fechas
                  </p>
                  <p className="mt-1 text-sm font-bold text-white/75">
                    Este vehículo ya tiene una reserva cruzada.{" "}
                    {getBlockedUntilLabel(
                      selectedVehicleAvailability.selectedConflictBlockedEnd
                    )}
                    .
                  </p>
                </div>
              ) : null}

              <input
                readOnly
                value={selectedVehicle?.matricula || ""}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
                placeholder="Matrícula"
              />

              <input
                readOnly
                value={
                  selectedVehicle
                    ? `${selectedVehicle.marca} ${selectedVehicle.modelo}`
                    : ""
                }
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
                placeholder="Marca / Modelo"
              />

              <input
                readOnly
                value={selectedVehicle?.bastidor || ""}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
                placeholder="Bastidor / VIN"
              />

              <input
                readOnly
                value={selectedVehicle?.combustible || "Gasolina"}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
                placeholder="Combustible"
              />

              <input
                value={form.kmSalida}
                onChange={(e) => updateField("kmSalida", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="KM salida opcional"
              />

              <input
                value={form.combustibleSalida}
                onChange={(e) =>
                  updateField("combustibleSalida", e.target.value)
                }
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Combustible salida: 7/7, 6/7... *"
              />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                Datos del Alquiler
              </h3>
              <p className="mt-1 text-sm text-white/45">
                La oficina se rellenará automáticamente como OFICINA MAGALUF.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ModernDateInput
                value={form.fechaEntrega}
                onChange={(value) => updateField("fechaEntrega", value)}
                placeholder="Fecha entrega *"
              />

              <ModernTimeSelect
                value={form.horaEntrega}
                onChange={(value) => updateField("horaEntrega", value)}
                placeholder="Hora entrega *"
                timeOptions={timeOptions}
              />

              <ModernDateInput
                value={form.fechaDevolucion}
                onChange={(value) => updateField("fechaDevolucion", value)}
                placeholder="Fecha devolución *"
              />

              <ModernTimeSelect
                value={form.horaDevolucion}
                onChange={(value) => updateField("horaDevolucion", value)}
                placeholder="Hora devolución *"
                timeOptions={timeOptions}
              />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                Datos del Cliente
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.nombreCliente}
                onChange={(e) => updateField("nombreCliente", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Nombre completo *"
              />

              <input
                value={form.dniPasaporte}
                onChange={(e) => updateField("dniPasaporte", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="DNI / Pasaporte *"
              />

              <input
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Teléfono *"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Email opcional"
              />

              <input
                value={form.direccion}
                onChange={(e) => updateField("direccion", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50 md:col-span-2"
                placeholder="Dirección *"
              />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                Datos del Conductor/a
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.permisoConducir}
                onChange={(e) => updateField("permisoConducir", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Permiso de conducir *"
              />

              <input
                value={form.paisExpedicion}
                onChange={(e) => updateField("paisExpedicion", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="País de expedición *"
              />

              <ModernDateInput
                value={form.fechaCaducidad}
                onChange={(value) => updateField("fechaCaducidad", value)}
                placeholder="Fecha caducidad permiso *"
              />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                Segundo/a Conductor/a
              </h3>
              <p className="mt-1 text-sm text-white/45">
                Opcional. Solo rellenar si aplica.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.segundoNombre}
                onChange={(e) => updateField("segundoNombre", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="2º Nombre"
              />

              <input
                value={form.segundoPermiso}
                onChange={(e) => updateField("segundoPermiso", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="2º Permiso de conducir"
              />

              <input
                value={form.segundoPais}
                onChange={(e) => updateField("segundoPais", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="2º País expedición"
              />

              <ModernDateInput
                value={form.segundoFechaCaducidad}
                onChange={(value) =>
                  updateField("segundoFechaCaducidad", value)
                }
                placeholder="2º Fecha caducidad"
              />

              <input
                value={form.segundoDireccion}
                onChange={(e) =>
                  updateField("segundoDireccion", e.target.value)
                }
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50 md:col-span-2"
                placeholder="2º Dirección"
              />
            </div>
          </section>

          <section className="space-y-6 rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div>
              <h3 className="text-2xl font-black text-white">
                Detalles del Alquiler
              </h3>
              <p className="mt-1 text-sm text-white/45">
                Precio, fianza, forma de pago, estado y resumen del contrato.
              </p>
            </div>

            <BookingActionSelector
              value={bookingAction}
              onChange={setBookingAction}
            />

            <div className="grid gap-4">
              <input
                value={form.dias}
                onChange={(e) => updateField("dias", e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Días *"
              />

              <EuroInput
                value={form.precioPorDia}
                onChange={(value) => updateField("precioPorDia", value)}
                placeholder="Precio por día *"
              />

              <EuroInput
                value={form.total}
                onChange={(value) => updateField("total", value)}
                placeholder="Total *"
              />

              <PaymentMethodSelector
                value={form.metodoPago}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    metodoPago: value,
                    pagado: prev.total,
                  }))
                }
              />

              <textarea
                value={form.notas}
                onChange={(e) => updateField("notas", e.target.value)}
                className="min-h-[120px] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
                placeholder="Notas internas opcionales"
              />
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
                Vista rápida del contrato
              </p>

              <div className="mt-4 space-y-2 text-sm text-white/60">
                <p>
                  <span className="font-black text-white">Contrato:</span>{" "}
                  {form.numeroContrato || nextContractNumber}
                </p>
                <p>
                  <span className="font-black text-white">Estado:</span>{" "}
                  {bookingActionLabel(bookingAction)}
                </p>
                <p>
                  <span className="font-black text-white">Vehículo:</span>{" "}
                  {selectedVehicle
                    ? `${selectedVehicle.codigo} · ${selectedVehicle.matricula} · ${selectedVehicle.marca} ${selectedVehicle.modelo}`
                    : "Sin seleccionar"}
                </p>
                <p>
                  <span className="font-black text-white">Cliente:</span>{" "}
                  {form.nombreCliente || "Sin rellenar"}
                </p>
                <p>
                  <span className="font-black text-white">Entrega:</span>{" "}
                  {form.fechaEntrega || "--"} {form.horaEntrega || "--"}
                </p>
                <p>
                  <span className="font-black text-white">Devolución:</span>{" "}
                  {form.fechaDevolucion || "--"} {form.horaDevolucion || "--"}
                </p>
                <p>
                  <span className="font-black text-white">Total:</span> €{" "}
                  {form.total || "0"}
                </p>
                <p>
                  <span className="font-black text-white">Pagado:</span>{" "}
                  {form.total ? `${form.total} €` : "0 €"} ·{" "}
                  {paymentMethodLabel(form.metodoPago)}
                </p>
                <p>
                  <span className="font-black text-white">Fianza:</span> 150 €
                </p>
                <p>
                  <span className="font-black text-white">Franquicia:</span>{" "}
                  800 €
                </p>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
                {success}
              </div>
            ) : null}

            {contractStatus ? (
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300">
                {contractStatus}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isGeneratingContract}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-4 text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isGeneratingContract
                ? "Generando contrato PDF..."
                : bookingAction === "rent_now"
                ? "Rent Now + generar contrato"
                : "Reserve Now + generar contrato"}
            </button>
          </section>
        </form>
      </div>
    </AdminShell>
  );
}