"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/dashboard/AdminShell";

type PaymentMethod = "cash" | "card" | "unpaid";

type SalesBooking = {
  id: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  source?: string;

  amount?: number;
  amount_eur?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  contract_number?: string;

  customer_name?: string;
  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;
  vehicle_code?: string;
  vehicle_name?: string;

  contractData?: {
    numeroContrato?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    nombreCliente?: string;
    total?: string;
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
  };
};

type DailySalesRow = {
  key: string;
  dayNumber: number;
  label: string;
  date: Date;
  totalCents: number;
  cashCents: number;
  cardCents: number;
  unpaidCents: number;
  bookings: number;
  cashBookings: number;
  cardBookings: number;
  unpaidBookings: number;
};

type MonthBucket = {
  label: string;
  date: Date;
  totalCents: number;
  bookings: number;
};

function cleanText(value: any) {
  return String(value || "").trim();
}

function normalizeStatus(status?: string) {
  return cleanText(status).toLowerCase();
}

function isCancelled(status?: string) {
  const clean = normalizeStatus(status);

  return (
    clean.includes("cancel") ||
    clean.includes("cancelada") ||
    clean.includes("cancelled") ||
    clean.includes("canceled") ||
    clean.includes("failed") ||
    clean.includes("refunded")
  );
}

function isReservedBooking(booking: SalesBooking) {
  const status = normalizeStatus(booking.status);

  return (
    status.includes("reserved") ||
    status.includes("reserve") ||
    status.includes("paid") ||
    status.includes("booking") ||
    status.includes("reserva")
  );
}

function moneyTextToCents(value?: string) {
  if (!value) return 0;

  const clean = String(value)
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(clean);

  if (!Number.isFinite(amount)) return 0;

  return Math.round(amount * 100);
}

function getBookingAmountCents(booking: SalesBooking) {
  if (typeof booking.amount === "number") return booking.amount;

  if (typeof booking.amount_eur === "number") {
    return Math.round(booking.amount_eur * 100);
  }

  return moneyTextToCents(booking.contractData?.total);
}

function normalizePaymentMethod(value?: string): PaymentMethod {
  const clean = cleanText(value).toLowerCase();

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
  return normalizePaymentMethod(
    booking.payment_method ||
      booking.contractData?.metodoPago ||
      booking.contractData?.paymentMethod ||
      booking.contractData?.pagado
  );
}

function getCreatedDate(booking: SalesBooking) {
  const raw =
    booking.createdAt ||
    booking.created_at ||
    booking.pickup_date ||
    booking.contractData?.fechaEntrega;

  const date = raw ? new Date(raw) : new Date();

  if (Number.isNaN(date.getTime())) return new Date();

  return date;
}

function getBookingCustomerName(booking: SalesBooking) {
  return (
    cleanText(booking.customer_name) ||
    cleanText(booking.contractData?.nombreCliente) ||
    "Customer"
  );
}

function getBookingVehicleName(booking: SalesBooking) {
  return (
    cleanText(booking.vehicle_code) ||
    cleanText(booking.vehicle_name) ||
    "Vehicle"
  );
}

function getBookingContract(booking: SalesBooking) {
  return (
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id) ||
    "Contract"
  );
}

function getBookingKey(booking: SalesBooking) {
  return getBookingContract(booking);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);

  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);

  return copy;
}

function isSameWeek(a: Date, b: Date) {
  const weekA = getStartOfWeek(a);
  const weekB = getStartOfWeek(b);

  return weekA.getTime() === weekB.getTime();
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatCompactMoney(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function shortDayLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
  });
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
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

async function fetchApiBookings(): Promise<SalesBooking[]> {
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

function dedupeBookings(bookings: SalesBooking[]) {
  const map = new Map<string, SalesBooking>();

  bookings.forEach((booking) => {
    const key = getBookingKey(booking);

    if (!key) return;

    const existing = map.get(key);

    if (!existing) {
      map.set(key, booking);
      return;
    }

    if (getBookingAmountCents(booking) > getBookingAmountCents(existing)) {
      map.set(key, booking);
    }
  });

  return Array.from(map.values());
}

function buildMonthBuckets(bookings: SalesBooking[]) {
  const buckets = new Map<string, MonthBucket>();

  bookings.forEach((booking) => {
    if (isCancelled(booking.status)) return;

    const date = getCreatedDate(booking);
    const key = getMonthKey(date);

    const existing = buckets.get(key);

    if (!existing) {
      buckets.set(key, {
        label: monthLabel(date),
        date,
        totalCents: getBookingAmountCents(booking),
        bookings: 1,
      });
      return;
    }

    existing.totalCents += getBookingAmountCents(booking);
    existing.bookings += 1;
  });

  return Array.from(buckets.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}

function buildDailySalesRows(bookings: SalesBooking[], monthDate: Date) {
  const days = getDaysInMonth(monthDate);

  const rows: DailySalesRow[] = Array.from({ length: days }, (_, index) => {
    const date = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      index + 1
    );

    return {
      key: getDayKey(date),
      dayNumber: index + 1,
      label: shortDayLabel(date),
      date,
      totalCents: 0,
      cashCents: 0,
      cardCents: 0,
      unpaidCents: 0,
      bookings: 0,
      cashBookings: 0,
      cardBookings: 0,
      unpaidBookings: 0,
    };
  });

  bookings.forEach((booking) => {
    if (isCancelled(booking.status)) return;

    const date = getCreatedDate(booking);

    if (!isSameMonth(date, monthDate)) return;

    const row = rows[date.getDate() - 1];

    if (!row) return;

    const amount = getBookingAmountCents(booking);
    const method = getPaymentMethod(booking);

    row.totalCents += amount;
    row.bookings += 1;

    if (method === "cash") {
      row.cashCents += amount;
      row.cashBookings += 1;
    } else if (method === "card") {
      row.cardCents += amount;
      row.cardBookings += 1;
    } else {
      row.unpaidCents += amount;
      row.unpaidBookings += 1;
    }
  });

  return rows;
}

function getChangePercent(current: number, previous: number) {
  if (previous <= 0 && current <= 0) return 0;
  if (previous <= 0) return 100;

  return ((current - previous) / previous) * 100;
}

function getBestDay(rows: DailySalesRow[]) {
  return [...rows].sort((a, b) => b.totalCents - a.totalCents)[0];
}

function getAverageSale(cents: number, count: number) {
  if (count <= 0) return 0;

  return Math.round(cents / count);
}

export default function SalesPage() {
  const [bookings, setBookings] = useState<SalesBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthKey(new Date()));

  async function loadSales() {
    setLoading(true);

    const manualBookings = getStoredManualBookings();
    const apiBookings = await fetchApiBookings();

    setBookings(dedupeBookings([...apiBookings, ...manualBookings]));
    setLoading(false);
  }

  useEffect(() => {
    loadSales();

    function refreshStorage() {
      loadSales();
    }

    window.addEventListener("storage", refreshStorage);

    return () => {
      window.removeEventListener("storage", refreshStorage);
    };
  }, []);

  const selectedMonthDate = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);

    if (!year || !month) return new Date();

    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const monthOptions = useMemo(() => {
    const now = new Date();
    const available = new Map<string, string>();

    for (let i = 0; i < 12; i += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      available.set(getMonthKey(date), monthLabel(date));
    }

    bookings.forEach((booking) => {
      const date = getCreatedDate(booking);
      available.set(getMonthKey(date), monthLabel(date));
    });

    return Array.from(available.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [bookings]);

  const sales = useMemo(() => {
    const now = new Date();

    const validBookings = bookings.filter(
      (booking) => !isCancelled(booking.status)
    );

    const todayBookings = validBookings.filter((booking) =>
      isSameDay(getCreatedDate(booking), now)
    );

    const weekBookings = validBookings.filter((booking) =>
      isSameWeek(getCreatedDate(booking), now)
    );

    const monthBookings = validBookings.filter((booking) =>
      isSameMonth(getCreatedDate(booking), selectedMonthDate)
    );

    const previousMonthDate = new Date(
      selectedMonthDate.getFullYear(),
      selectedMonthDate.getMonth() - 1,
      1
    );

    const previousMonthBookings = validBookings.filter((booking) =>
      isSameMonth(getCreatedDate(booking), previousMonthDate)
    );

    const totalCents = validBookings.reduce(
      (sum, booking) => sum + getBookingAmountCents(booking),
      0
    );

    const todayCents = todayBookings.reduce(
      (sum, booking) => sum + getBookingAmountCents(booking),
      0
    );

    const weekCents = weekBookings.reduce(
      (sum, booking) => sum + getBookingAmountCents(booking),
      0
    );

    const monthCents = monthBookings.reduce(
      (sum, booking) => sum + getBookingAmountCents(booking),
      0
    );

    const previousMonthCents = previousMonthBookings.reduce(
      (sum, booking) => sum + getBookingAmountCents(booking),
      0
    );

    const cashCents = monthBookings
      .filter((booking) => getPaymentMethod(booking) === "cash")
      .reduce((sum, booking) => sum + getBookingAmountCents(booking), 0);

    const cardCents = monthBookings
      .filter((booking) => getPaymentMethod(booking) === "card")
      .reduce((sum, booking) => sum + getBookingAmountCents(booking), 0);

    const unpaidCents = monthBookings
      .filter((booking) => getPaymentMethod(booking) === "unpaid")
      .reduce((sum, booking) => sum + getBookingAmountCents(booking), 0);

    const reservationsCount = monthBookings.filter(isReservedBooking).length;
    const dailyRows = buildDailySalesRows(validBookings, selectedMonthDate);
    const bestDay = getBestDay(dailyRows);
    const averageSale = getAverageSale(monthCents, monthBookings.length);

    return {
      validBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      previousMonthBookings,
      totalCents,
      todayCents,
      weekCents,
      monthCents,
      previousMonthCents,
      cashCents,
      cardCents,
      unpaidCents,
      reservationsCount,
      averageSale,
      bestDay,
      dailyRows,
      changePercent: getChangePercent(monthCents, previousMonthCents),
      monthBuckets: buildMonthBuckets(validBookings),
    };
  }, [bookings, selectedMonthDate]);

  const recentSales = useMemo(() => {
    return [...sales.validBookings]
      .sort((a, b) => getCreatedDate(b).getTime() - getCreatedDate(a).getTime())
      .slice(0, 12);
  }, [sales.validBookings]);

  const maxDailyRevenue = useMemo(() => {
    return Math.max(...sales.dailyRows.map((row) => row.totalCents), 1);
  }, [sales.dailyRows]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-24 left-20 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />

          <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                Revenue Control
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                Sales Analytics
              </h2>

              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-white/50">
                Daily sales, cash/card split, reservations, best day, monthly
                history and latest payments. Built for fast mobile and desktop
                control.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                <span
                  className={`rounded-full border px-3 py-2 ${
                    loading
                      ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
                      : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  {loading ? "Loading sales..." : "Sales loaded"}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-white/50">
                  Total records: {sales.validBookings.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-2xl border border-white/10 bg-[#0B0D13] px-4 py-3 text-sm font-black text-white outline-none transition focus:border-orange-400/50"
              >
                {monthOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-[#0B0D13] text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={loadSales}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/[0.1]"
              >
                Refresh
              </button>

              <Link
                href="/admin-nexa-secret/create-booking"
                className="rounded-2xl bg-gradient-to-r from-emerald-500 via-orange-500 to-sky-500 px-5 py-3 text-center text-sm font-black text-white shadow-[0_15px_45px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5"
              >
                + Booking
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SalesStatCard
            title="Today"
            value={formatMoney(sales.todayCents)}
            subtitle={`${sales.todayBookings.length} bookings today`}
            tone="emerald"
          />

          <SalesStatCard
            title="This Week"
            value={formatMoney(sales.weekCents)}
            subtitle={`${sales.weekBookings.length} bookings this week`}
            tone="sky"
          />

          <SalesStatCard
            title="Selected Month"
            value={formatMoney(sales.monthCents)}
            subtitle={`${sales.monthBookings.length} bookings`}
            tone="orange"
          />

          <SalesStatCard
            title="Total Revenue"
            value={formatMoney(sales.totalCents)}
            subtitle="All non-cancelled bookings"
            tone="purple"
          />

          <SalesStatCard
            title="Reservations"
            value={String(sales.reservationsCount)}
            subtitle="Reserved/paid records"
            tone="white"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                  Daily Revenue Chart
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {monthLabel(selectedMonthDate)}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-black sm:flex">
                <LegendDot label="Total" tone="orange" />
                <LegendDot label="Cash" tone="emerald" />
                <LegendDot label="Card" tone="sky" />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="relative flex min-w-[920px] items-end gap-2 bg-[linear-gradient(to_top,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:100%_38px] pt-6">
                {sales.dailyRows.map((row) => {
                  const height = Math.max(
                    6,
                    Math.round((row.totalCents / maxDailyRevenue) * 180)
                  );

                  const isToday = isSameDay(row.date, new Date());

                  return (
                    <div
                      key={row.key}
                      className="flex w-9 flex-col items-center gap-2"
                      title={`${formatDate(row.date)} · ${formatMoney(
                        row.totalCents
                      )}`}
                    >
                      <p
                        className={`h-5 text-[10px] font-black ${
                          row.totalCents > 0 ? "text-white/70" : "text-white/18"
                        }`}
                      >
                        {row.totalCents > 0 ? formatCompactMoney(row.totalCents) : ""}
                      </p>

                      <div className="flex h-[190px] w-full items-end rounded-full bg-white/[0.035] p-1 ring-1 ring-white/[0.035]">
                        <div
                          className={`w-full rounded-full bg-gradient-to-t from-orange-500 via-purple-500 to-sky-400 transition ${
                            row.totalCents > 0 ? "opacity-100" : "opacity-25"
                          }`}
                          style={{ height: `${height}px` }}
                        />
                      </div>

                      <p
                        className={`text-[10px] font-black ${
                          isToday ? "text-orange-300" : "text-white/38"
                        }`}
                      >
                        {row.dayNumber}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
                Month Performance
              </p>

              <div className="mt-5 grid gap-3">
                <MiniMetric
                  label="Current Month"
                  value={formatMoney(sales.monthCents)}
                />
                <MiniMetric
                  label="Previous Month"
                  value={formatMoney(sales.previousMonthCents)}
                />
                <MiniMetric
                  label="Growth"
                  value={`${sales.changePercent >= 0 ? "+" : ""}${sales.changePercent.toFixed(
                    1
                  )}%`}
                  tone={sales.changePercent >= 0 ? "emerald" : "red"}
                />
                <MiniMetric
                  label="Average Sale"
                  value={formatMoney(sales.averageSale)}
                />
                <MiniMetric
                  label="Best Day"
                  value={
                    sales.bestDay?.totalCents
                      ? `${sales.bestDay.dayNumber} · ${formatMoney(
                          sales.bestDay.totalCents
                        )}`
                      : "No sales"
                  }
                  tone="orange"
                />
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                Cash vs Card
              </p>

              <div className="mt-5 space-y-3">
                <PaymentBreakdownCard
                  title="Cash"
                  amount={sales.cashCents}
                  total={sales.monthCents}
                  tone="emerald"
                />

                <PaymentBreakdownCard
                  title="Card"
                  amount={sales.cardCents}
                  total={sales.monthCents}
                  tone="sky"
                />

                <PaymentBreakdownCard
                  title="Unpaid / Unknown"
                  amount={sales.unpaidCents}
                  total={sales.monthCents}
                  tone="white"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
              Daily Table
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              Each Day of {monthLabel(selectedMonthDate)}
            </h3>

            <div className="mt-5 max-h-[560px] overflow-y-auto pr-1">
              <div className="space-y-2">
                {sales.dailyRows.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          {row.dayNumber} · {row.label}
                        </p>
                        <p className="mt-1 text-xs font-bold text-white/35">
                          {row.bookings} bookings · Cash {row.cashBookings} ·
                          Card {row.cardBookings}
                        </p>
                      </div>

                      <p className="text-lg font-black text-emerald-300">
                        {formatMoney(row.totalCents)}
                      </p>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <SmallMoneyPill
                        label="Cash"
                        value={row.cashCents}
                        tone="emerald"
                      />
                      <SmallMoneyPill
                        label="Card"
                        value={row.cardCents}
                        tone="sky"
                      />
                      <SmallMoneyPill
                        label="Unpaid"
                        value={row.unpaidCents}
                        tone="white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">
                  Recent Sales
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  Latest Payments
                </h3>
              </div>

              <Link
                href="/admin-nexa-secret/bookings"
                className="rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-300 transition hover:bg-orange-500/15"
              >
                Open Bookings
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {recentSales.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
                  <p className="text-lg font-black text-white">
                    No recent sales
                  </p>
                </div>
              ) : (
                recentSales.map((booking) => {
                  const created = getCreatedDate(booking);
                  const paymentMethod = getPaymentMethod(booking);

                  return (
                    <Link
                      href="/admin-nexa-secret/bookings"
                      key={getBookingKey(booking)}
                      className="block rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.06]"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <p className="text-sm font-black text-white">
                            {getBookingVehicleName(booking)} ·{" "}
                            {getBookingCustomerName(booking)}
                          </p>

                          <p className="mt-1 text-xs font-bold text-white/40">
                            {formatDate(created)} · Contract{" "}
                            {getBookingContract(booking)}
                          </p>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="text-lg font-black text-emerald-300">
                            {formatMoney(getBookingAmountCents(booking))}
                          </p>

                          <p
                            className={`mt-1 text-xs font-black uppercase tracking-[0.14em] ${
                              paymentMethod === "cash"
                                ? "text-emerald-300"
                                : paymentMethod === "card"
                                ? "text-sky-300"
                                : "text-white/35"
                            }`}
                          >
                            {paymentMethod}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-purple-300">
            Monthly History
          </p>

          <h3 className="mt-2 text-2xl font-black text-white">
            Saved Revenue by Month
          </h3>

          <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {sales.monthBuckets.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
                <p className="text-lg font-black text-white">
                  No sales data yet
                </p>
                <p className="mt-2 text-sm font-bold text-white/45">
                  Create bookings and they will appear here.
                </p>
              </div>
            ) : (
              sales.monthBuckets.map((month) => {
                const maxValue = Math.max(
                  ...sales.monthBuckets.map((item) => item.totalCents),
                  1
                );

                const width = Math.max(
                  8,
                  Math.round((month.totalCents / maxValue) * 100)
                );

                return (
                  <div
                    key={month.label}
                    className="rounded-3xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-white">
                          {month.label}
                        </p>
                        <p className="mt-1 text-xs font-bold text-white/40">
                          {month.bookings} bookings
                        </p>
                      </div>

                      <p className="text-lg font-black text-emerald-300">
                        {formatMoney(month.totalCents)}
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-orange-400 to-sky-400"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function SalesStatCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "emerald" | "sky" | "orange" | "purple" | "white";
}) {
  const styles = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
    white: "border-white/10 bg-white/[0.04] text-white/55",
  };

  return (
    <div className={`rounded-[26px] border p-5 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-3 truncate text-3xl font-black text-white xl:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm font-bold text-white/42">{subtitle}</p>
    </div>
  );
}

function LegendDot({
  label,
  tone,
}: {
  label: string;
  tone: "orange" | "emerald" | "sky";
}) {
  const styles = {
    orange: "bg-orange-400",
    emerald: "bg-emerald-400",
    sky: "bg-sky-400",
  };

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/50">
      <span className={`h-2 w-2 rounded-full ${styles[tone]}`} />
      {label}
    </span>
  );
}

function MiniMetric({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: string;
  tone?: "white" | "emerald" | "red" | "orange";
}) {
  const styles = {
    white: "text-white",
    emerald: "text-emerald-300",
    red: "text-red-300",
    orange: "text-orange-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-black ${styles[tone]}`}>{value}</p>
    </div>
  );
}

function PaymentBreakdownCard({
  title,
  amount,
  total,
  tone,
}: {
  title: string;
  amount: number;
  total: number;
  tone: "emerald" | "sky" | "white";
}) {
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;

  const color =
    tone === "emerald"
      ? "text-emerald-300 border-emerald-400/20 bg-emerald-500/10 from-emerald-400 to-emerald-500"
      : tone === "sky"
      ? "text-sky-300 border-sky-400/20 bg-sky-500/10 from-sky-400 to-sky-500"
      : "text-white/45 border-white/10 bg-white/[0.04] from-white/30 to-white/50";

  return (
    <div className={`rounded-3xl border p-4 ${color}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="mt-1 text-xs font-bold text-white/45">
            {percent}% of selected month
          </p>
        </div>

        <p className="text-xl font-black text-white">{formatMoney(amount)}</p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${
            tone === "emerald"
              ? "from-emerald-400 to-emerald-500"
              : tone === "sky"
              ? "from-sky-400 to-sky-500"
              : "from-white/30 to-white/50"
          }`}
          style={{ width: `${Math.max(4, percent)}%` }}
        />
      </div>
    </div>
  );
}

function SmallMoneyPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "sky" | "white";
}) {
  const styles = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
    white: "border-white/10 bg-white/[0.04] text-white/45",
  };

  return (
    <div className={`rounded-xl border px-3 py-2 ${styles[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">
        €{formatCompactMoney(value)}
      </p>
    </div>
  );
}
