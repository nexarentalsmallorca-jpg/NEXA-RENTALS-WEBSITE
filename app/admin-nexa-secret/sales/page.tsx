"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentMethod = "cash" | "card" | "unpaid";
type SalesView = "daily" | "weekly" | "monthly";

type SalesBooking = {
  id?: string;
  createdAt?: string;
  created_at?: string;
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

  vehicle?: {
    codigo?: string;
    matricula?: string;
    marca?: string;
    modelo?: string;
  };

  contractData?: {
    numeroContrato?: string;
    nombreCliente?: string;
    telefono?: string;
    email?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    total?: string;
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
  };
};

type SalesPoint = {
  key: string;
  label: string;
  totalCents: number;
  cashCents: number;
  cardCents: number;
  unpaidCents: number;
  bookingCount: number;
};

function cleanText(value: any) {
  return String(value || "").trim();
}

function getStoredManualBookings(): SalesBooking[] {
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

function formatMoneyFromCents(cents?: number) {
  const value = Number(cents || 0);

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value / 100);
}

function formatDate(value?: string) {
  if (!value) return "No date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function getTotalCents(booking: SalesBooking) {
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

function getPaymentMethod(booking: SalesBooking): PaymentMethod {
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

  return "border-white/10 bg-white/[0.05] text-white/45";
}

function getCustomerName(booking: SalesBooking) {
  return (
    cleanText(booking.customer_name) ||
    cleanText(booking.contractData?.nombreCliente) ||
    "Customer"
  );
}

function getCustomerPhone(booking: SalesBooking) {
  return cleanText(booking.phone) || cleanText(booking.contractData?.telefono);
}

function getVehicleName(booking: SalesBooking) {
  if (booking.vehicle_name) return booking.vehicle_name;

  const vehicle = booking.vehicle;

  return [
    vehicle?.codigo,
    vehicle?.matricula,
    vehicle?.marca,
    vehicle?.modelo,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getContractNumber(booking: SalesBooking) {
  return (
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id) ||
    "Contract"
  );
}

function getSaleDate(booking: SalesBooking) {
  return (
    cleanText(booking.pickup_date) ||
    cleanText(booking.contractData?.fechaEntrega) ||
    cleanText(booking.createdAt) ||
    cleanText(booking.created_at) ||
    new Date().toISOString()
  ).slice(0, 10);
}

function getCreatedAt(booking: SalesBooking) {
  return cleanText(booking.createdAt || booking.created_at || getSaleDate(booking));
}

function isCancelledBooking(booking: SalesBooking) {
  const status = String(booking.status || "").toLowerCase();

  return (
    status.includes("cancel") ||
    status.includes("failed") ||
    status.includes("refunded")
  );
}

function getBookingKey(booking: SalesBooking) {
  return (
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id) ||
    `${getCustomerName(booking)}-${getSaleDate(booking)}`
  );
}

function dedupeBookings(bookings: SalesBooking[]) {
  const map = new Map<string, SalesBooking>();

  bookings.forEach((booking) => {
    const key = getBookingKey(booking);

    if (!map.has(key)) {
      map.set(key, booking);
    }
  });

  return Array.from(map.values());
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getGroupKey(dateString: string, view: SalesView) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  if (view === "daily") return toDateKey(date);

  if (view === "weekly") {
    const weekStart = startOfWeek(date);
    return toDateKey(weekStart);
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getGroupLabel(key: string, view: SalesView) {
  if (view === "daily") {
    return formatDate(key);
  }

  if (view === "weekly") {
    const start = new Date(`${key}T00:00:00`);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${formatDate(toDateKey(start))} - ${formatDate(toDateKey(end))}`;
  }

  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function buildSalesPoints(bookings: SalesBooking[], view: SalesView) {
  const map = new Map<string, SalesPoint>();

  bookings.forEach((booking) => {
    if (isCancelledBooking(booking)) return;

    const amount = getTotalCents(booking);
    if (amount <= 0) return;

    const paymentMethod = getPaymentMethod(booking);
    const saleDate = getSaleDate(booking);
    const key = getGroupKey(saleDate, view);

    const current =
      map.get(key) ||
      ({
        key,
        label: getGroupLabel(key, view),
        totalCents: 0,
        cashCents: 0,
        cardCents: 0,
        unpaidCents: 0,
        bookingCount: 0,
      } satisfies SalesPoint);

    current.totalCents += amount;
    current.bookingCount += 1;

    if (paymentMethod === "cash") current.cashCents += amount;
    if (paymentMethod === "card") current.cardCents += amount;
    if (paymentMethod === "unpaid") current.unpaidCents += amount;

    map.set(key, current);
  });

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function downloadCsv(bookings: SalesBooking[], view: SalesView) {
  const rows = [
    [
      "Date",
      "Contract",
      "Customer",
      "Phone",
      "Vehicle",
      "Payment Method",
      "Total EUR",
      "Source",
      "Status",
    ],
    ...bookings.map((booking) => [
      getSaleDate(booking),
      getContractNumber(booking),
      getCustomerName(booking),
      getCustomerPhone(booking),
      getVehicleName(booking),
      paymentMethodLabel(getPaymentMethod(booking)),
      (getTotalCents(booking) / 100).toFixed(2),
      cleanText(booking.source),
      cleanText(booking.status),
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `nexa-sales-${view}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

export default function SalesPage() {
  const [bookings, setBookings] = useState<SalesBooking[]>([]);
  const [view, setView] = useState<SalesView>("daily");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSales() {
    setIsLoading(true);
    setError("");

    const localBookings = getStoredManualBookings();

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();
      const apiBookings = Array.isArray(data?.bookings) ? data.bookings : [];

      setBookings(dedupeBookings([...apiBookings, ...localBookings]));

      if (!data?.ok && data?.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setBookings(localBookings);
      setError(
        err?.message ||
          "Could not load Supabase sales. Showing local sales only."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSales();

    function refreshFromStorage() {
      loadSales();
    }

    window.addEventListener("storage", refreshFromStorage);

    return () => {
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  const validSales = useMemo(() => {
    return bookings
      .filter((booking) => !isCancelledBooking(booking))
      .filter((booking) => getTotalCents(booking) > 0)
      .sort((a, b) => {
        const dateA = new Date(getCreatedAt(a)).getTime() || 0;
        const dateB = new Date(getCreatedAt(b)).getTime() || 0;

        return dateB - dateA;
      });
  }, [bookings]);

  const filteredSales = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) return validSales;

    return validSales.filter((booking) => {
      const text = [
        getSaleDate(booking),
        getContractNumber(booking),
        getCustomerName(booking),
        getCustomerPhone(booking),
        getVehicleName(booking),
        getPaymentMethod(booking),
        booking.source,
        booking.status,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(cleanSearch);
    });
  }, [validSales, search]);

  const summary = useMemo(() => {
    const totalCents = filteredSales.reduce(
      (sum, booking) => sum + getTotalCents(booking),
      0
    );

    const cashCents = filteredSales
      .filter((booking) => getPaymentMethod(booking) === "cash")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    const cardCents = filteredSales
      .filter((booking) => getPaymentMethod(booking) === "card")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    const unpaidCents = filteredSales
      .filter((booking) => getPaymentMethod(booking) === "unpaid")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    return {
      totalCents,
      cashCents,
      cardCents,
      unpaidCents,
      bookingCount: filteredSales.length,
      averageCents: filteredSales.length
        ? Math.round(totalCents / filteredSales.length)
        : 0,
    };
  }, [filteredSales]);

  const salesPoints = useMemo(() => {
    return buildSalesPoints(filteredSales, view);
  }, [filteredSales, view]);

  const maxChartValue = useMemo(() => {
    return Math.max(...salesPoints.map((point) => point.totalCents), 1);
  }, [salesPoints]);

  const comparison = useMemo(() => {
    if (salesPoints.length < 2) {
      return {
        current: salesPoints[salesPoints.length - 1]?.totalCents || 0,
        previous: 0,
        difference: 0,
        percentage: 0,
      };
    }

    const current = salesPoints[salesPoints.length - 1].totalCents;
    const previous = salesPoints[salesPoints.length - 2].totalCents;
    const difference = current - previous;
    const percentage = previous ? Math.round((difference / previous) * 100) : 100;

    return {
      current,
      previous,
      difference,
      percentage,
    };
  }, [salesPoints]);

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">
              Sales / Revenue
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
              Revenue Control Center
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/55">
              Track every paid booking from manual contracts and website
              bookings. View cash/card totals, daily/weekly/monthly performance,
              compare the latest period, and download a CSV sales summary.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={loadSales}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white/70 transition hover:border-orange-400/30 hover:text-white"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => downloadCsv(filteredSales, view)}
              className="rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500 px-5 py-3 text-sm font-black text-white shadow-[0_15px_45px_rgba(16,185,129,0.22)] transition hover:-translate-y-0.5"
            >
              Download Summary
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          value={formatMoneyFromCents(summary.totalCents)}
          subtitle={`${summary.bookingCount} paid bookings`}
          tone="emerald"
        />

        <StatCard
          title="Cash"
          value={formatMoneyFromCents(summary.cashCents)}
          subtitle="Manual cash payments"
          tone="emerald"
        />

        <StatCard
          title="Card"
          value={formatMoneyFromCents(summary.cardCents)}
          subtitle="Card / Stripe payments"
          tone="sky"
        />

        <StatCard
          title="Unpaid / Unknown"
          value={formatMoneyFromCents(summary.unpaidCents)}
          subtitle="Needs checking"
          tone="yellow"
        />

        <StatCard
          title="Average Sale"
          value={formatMoneyFromCents(summary.averageCents)}
          subtitle="Average per booking"
          tone="purple"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.38fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Revenue chart
              </p>

              <h3 className="mt-1 text-2xl font-black text-white">
                {view === "daily"
                  ? "Daily Sales"
                  : view === "weekly"
                  ? "Weekly Sales"
                  : "Monthly Sales"}
              </h3>
            </div>

            <div className="flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
              {(["daily", "weekly", "monthly"] as SalesView[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setView(item)}
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                    view === item
                      ? "bg-white text-black"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {salesPoints.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center text-sm font-bold text-white/45">
                No sales data found yet.
              </div>
            ) : (
              salesPoints.slice(-14).map((point) => {
                const width = Math.max(
                  5,
                  Math.round((point.totalCents / maxChartValue) * 100)
                );

                return (
                  <div key={point.key}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          {point.label}
                        </p>
                        <p className="text-xs font-bold text-white/35">
                          {point.bookingCount} booking
                          {point.bookingCount === 1 ? "" : "s"}
                        </p>
                      </div>

                      <p className="text-sm font-black text-emerald-300">
                        {formatMoneyFromCents(point.totalCents)}
                      </p>
                    </div>

                    <div className="h-4 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-purple-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                        Cash {formatMoneyFromCents(point.cashCents)}
                      </span>

                      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-2 py-1 text-sky-300">
                        Card {formatMoneyFromCents(point.cardCents)}
                      </span>

                      {point.unpaidCents > 0 ? (
                        <span className="rounded-full border border-yellow-400/20 bg-yellow-500/10 px-2 py-1 text-yellow-300">
                          Unpaid {formatMoneyFromCents(point.unpaidCents)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
              Comparison
            </p>

            <h3 className="mt-1 text-2xl font-black text-white">
              Latest Period
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Current
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {formatMoneyFromCents(comparison.current)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                  Previous
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {formatMoneyFromCents(comparison.previous)}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  comparison.difference >= 0
                    ? "border-emerald-400/20 bg-emerald-500/10"
                    : "border-red-400/20 bg-red-500/10"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-[0.18em] ${
                    comparison.difference >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  Difference
                </p>
                <p className="mt-1 text-2xl font-black text-white">
                  {comparison.difference >= 0 ? "+" : ""}
                  {formatMoneyFromCents(comparison.difference)}
                </p>
                <p
                  className={`mt-1 text-sm font-black ${
                    comparison.difference >= 0
                      ? "text-emerald-300"
                      : "text-red-300"
                  }`}
                >
                  {comparison.difference >= 0 ? "+" : ""}
                  {comparison.percentage}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Search
            </p>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Search customer, phone, vehicle, contract..."
            />

            {error ? (
              <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#080A10]/80 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="hidden grid-cols-9 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/35 xl:grid">
          <div>Date</div>
          <div>Contract</div>
          <div className="col-span-2">Customer</div>
          <div>Vehicle</div>
          <div>Source</div>
          <div>Payment</div>
          <div className="text-right">Total</div>
          <div className="text-right">Status</div>
        </div>

        {isLoading ? (
          <div className="px-5 py-10 text-sm font-bold text-white/45">
            Loading sales...
          </div>
        ) : null}

        {!isLoading && filteredSales.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-2xl font-black text-white">No sales found</p>
            <p className="mt-2 text-sm font-medium text-white/45">
              Create a booking with total price and payment method first.
            </p>
          </div>
        ) : null}

        {!isLoading &&
          filteredSales.map((booking) => {
            const paymentMethod = getPaymentMethod(booking);

            return (
              <div
                key={`${getContractNumber(booking)}-${getSaleDate(booking)}`}
                className="grid gap-4 border-b border-white/5 px-5 py-5 text-sm transition hover:bg-white/[0.04] xl:grid-cols-9 xl:items-center"
              >
                <div className="font-bold text-white/60">
                  {formatDate(getSaleDate(booking))}
                </div>

                <div>
                  <p className="font-black text-white">
                    {getContractNumber(booking)}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {cleanText(booking.createdAt || booking.created_at)}
                  </p>
                </div>

                <div className="xl:col-span-2">
                  <p className="font-black text-white">
                    {getCustomerName(booking)}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Phone: {getCustomerPhone(booking) || "-"}
                  </p>
                </div>

                <div className="font-bold text-white/60">
                  {getVehicleName(booking) || "Vehicle"}
                </div>

                <div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-white/55">
                    {booking.source || "Manual"}
                  </span>
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

                <div className="text-right text-lg font-black text-emerald-300">
                  {formatMoneyFromCents(getTotalCents(booking))}
                </div>

                <div className="text-right">
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-black text-white/45">
                    {booking.status || "Active"}
                  </span>
                </div>
              </div>
            );
          })}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "emerald" | "sky" | "yellow" | "purple";
}) {
  const styles = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
  };

  return (
    <div className={`rounded-[28px] border p-5 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.22em]">{title}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/45">{subtitle}</p>
    </div>
  );
}