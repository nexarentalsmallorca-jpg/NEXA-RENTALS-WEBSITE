"use client";

import { useEffect, useMemo, useState } from "react";

type BookingCustomer = {
  id?: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  source?: string;

  customer_name?: string;
  customer_email?: string;
  phone?: string;
  amount?: number;
  amount_eur?: number;
  payment_method?: string;
  payment_status?: string;
  contract_number?: string;
  customer_dni?: string;
  customer_address?: string;

  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;
  vehicle_name?: string;

  vehicle?: {
    codigo?: string;
    matricula?: string;
    marca?: string;
    modelo?: string;
  };

  contractData?: {
    numeroContrato?: string;
    nombreCliente?: string;
    dniPasaporte?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    permisoConducir?: string;
    paisExpedicion?: string;
    fechaCaducidad?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    total?: string;
    metodoPago?: string;
    paymentMethod?: string;
    pagado?: string;
  };
};

type CustomerProfile = {
  key: string;
  name: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  license: string;
  licenseCountry: string;
  licenseExpiry: string;
  rentalCount: number;
  totalSpentCents: number;
  cashSpentCents: number;
  cardSpentCents: number;
  lastRentalDate: string;
  lastVehicle: string;
  lastContract: string;
  bookings: BookingCustomer[];
};

function cleanText(value: any) {
  return String(value || "").trim();
}

function getStoredManualBookings(): BookingCustomer[] {
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

  if (Number.isNaN(date.getTime())) {
    return value;
  }

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

function normalizePaymentMethod(value?: string) {
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

function paymentMethodLabel(value?: string) {
  const method = normalizePaymentMethod(value);

  if (method === "cash") return "Cash";
  if (method === "card") return "Card";

  return "Unpaid";
}

function getCustomerName(booking: BookingCustomer) {
  return (
    cleanText(booking.customer_name) ||
    cleanText(booking.contractData?.nombreCliente) ||
    "Customer"
  );
}

function getCustomerPhone(booking: BookingCustomer) {
  return cleanText(booking.phone) || cleanText(booking.contractData?.telefono);
}

function getCustomerEmail(booking: BookingCustomer) {
  return (
    cleanText(booking.customer_email) || cleanText(booking.contractData?.email)
  );
}

function getCustomerDocument(booking: BookingCustomer) {
  return (
    cleanText(booking.customer_dni) ||
    cleanText(booking.contractData?.dniPasaporte)
  );
}

function getCustomerAddress(booking: BookingCustomer) {
  return (
    cleanText(booking.customer_address) ||
    cleanText(booking.contractData?.direccion)
  );
}

function getVehicleName(booking: BookingCustomer) {
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

function getBookingDate(booking: BookingCustomer) {
  return (
    cleanText(booking.pickup_date) ||
    cleanText(booking.contractData?.fechaEntrega) ||
    cleanText(booking.createdAt) ||
    cleanText(booking.created_at)
  );
}

function getCreatedAt(booking: BookingCustomer) {
  return cleanText(booking.createdAt || booking.created_at || getBookingDate(booking));
}

function getContractNumber(booking: BookingCustomer) {
  return (
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id) ||
    "Contract"
  );
}

function getTotalCents(booking: BookingCustomer) {
  if (typeof booking.amount === "number") return booking.amount;
  if (typeof booking.amount_eur === "number") {
    return Math.round(booking.amount_eur * 100);
  }

  const total = moneyTextToNumber(booking.contractData?.total);

  return Math.round(total * 100);
}

function getPaymentMethod(booking: BookingCustomer) {
  return (
    normalizePaymentMethod(booking.payment_method) ||
    normalizePaymentMethod(booking.contractData?.metodoPago) ||
    normalizePaymentMethod(booking.contractData?.paymentMethod) ||
    normalizePaymentMethod(booking.contractData?.pagado)
  );
}

function isCancelledBooking(booking: BookingCustomer) {
  const status = String(booking.status || "").toLowerCase();

  return (
    status.includes("cancel") ||
    status.includes("failed") ||
    status.includes("refunded")
  );
}

function makeCustomerKey(booking: BookingCustomer) {
  const phone = getCustomerPhone(booking);
  const email = getCustomerEmail(booking);
  const document = getCustomerDocument(booking);
  const name = getCustomerName(booking);

  return (
    phone ||
    email ||
    document ||
    name.toLowerCase().replace(/\s+/g, "_") ||
    `customer_${Date.now()}`
  );
}

function dedupeBookings(bookings: BookingCustomer[]) {
  const map = new Map<string, BookingCustomer>();

  bookings.forEach((booking) => {
    const key =
      getContractNumber(booking) ||
      cleanText(booking.id) ||
      `${getCustomerName(booking)}-${getBookingDate(booking)}`;

    if (!map.has(key)) {
      map.set(key, booking);
    }
  });

  return Array.from(map.values());
}

function buildCustomers(bookings: BookingCustomer[]) {
  const customerMap = new Map<string, CustomerProfile>();

  bookings.forEach((booking) => {
    if (isCancelledBooking(booking)) return;

    const key = makeCustomerKey(booking);
    const totalCents = getTotalCents(booking);
    const paymentMethod = getPaymentMethod(booking);
    const bookingDate = getBookingDate(booking);
    const vehicleName = getVehicleName(booking);

    const existing = customerMap.get(key);

    if (!existing) {
      customerMap.set(key, {
        key,
        name: getCustomerName(booking),
        phone: getCustomerPhone(booking),
        email: getCustomerEmail(booking),
        document: getCustomerDocument(booking),
        address: getCustomerAddress(booking),
        license: cleanText(booking.contractData?.permisoConducir),
        licenseCountry: cleanText(booking.contractData?.paisExpedicion),
        licenseExpiry: cleanText(booking.contractData?.fechaCaducidad),
        rentalCount: 1,
        totalSpentCents: totalCents,
        cashSpentCents: paymentMethod === "cash" ? totalCents : 0,
        cardSpentCents: paymentMethod === "card" ? totalCents : 0,
        lastRentalDate: bookingDate,
        lastVehicle: vehicleName,
        lastContract: getContractNumber(booking),
        bookings: [booking],
      });

      return;
    }

    existing.rentalCount += 1;
    existing.totalSpentCents += totalCents;

    if (paymentMethod === "cash") existing.cashSpentCents += totalCents;
    if (paymentMethod === "card") existing.cardSpentCents += totalCents;

    existing.bookings.push(booking);

    const existingDate = new Date(existing.lastRentalDate).getTime() || 0;
    const nextDate = new Date(bookingDate).getTime() || 0;

    if (nextDate >= existingDate) {
      existing.lastRentalDate = bookingDate;
      existing.lastVehicle = vehicleName;
      existing.lastContract = getContractNumber(booking);
    }

    if (!existing.phone) existing.phone = getCustomerPhone(booking);
    if (!existing.email) existing.email = getCustomerEmail(booking);
    if (!existing.document) existing.document = getCustomerDocument(booking);
    if (!existing.address) existing.address = getCustomerAddress(booking);
    if (!existing.license) {
      existing.license = cleanText(booking.contractData?.permisoConducir);
    }
    if (!existing.licenseCountry) {
      existing.licenseCountry = cleanText(booking.contractData?.paisExpedicion);
    }
    if (!existing.licenseExpiry) {
      existing.licenseExpiry = cleanText(booking.contractData?.fechaCaducidad);
    }
  });

  return Array.from(customerMap.values()).sort((a, b) => {
    const dateA = new Date(a.lastRentalDate).getTime() || 0;
    const dateB = new Date(b.lastRentalDate).getTime() || 0;

    return dateB - dateA;
  });
}

export default function CustomersPage() {
  const [bookings, setBookings] = useState<BookingCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadCustomers() {
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

      setBookings(dedupeBookings([...localBookings, ...apiBookings]));

      if (!data?.ok && data?.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setBookings(localBookings);
      setError(
        err?.message ||
          "Could not load Supabase customers. Showing local customers only."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();

    function refreshFromStorage() {
      loadCustomers();
    }

    window.addEventListener("storage", refreshFromStorage);

    return () => {
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  const customers = useMemo(() => buildCustomers(bookings), [bookings]);

  const filteredCustomers = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) return customers;

    return customers.filter((customer) => {
      const text = [
        customer.name,
        customer.phone,
        customer.email,
        customer.document,
        customer.address,
        customer.license,
        customer.licenseCountry,
        customer.lastVehicle,
        customer.lastContract,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(cleanSearch);
    });
  }, [customers, search]);

  const summary = useMemo(() => {
    const totalSpentCents = customers.reduce(
      (sum, customer) => sum + customer.totalSpentCents,
      0
    );

    const totalRentals = customers.reduce(
      (sum, customer) => sum + customer.rentalCount,
      0
    );

    const cashCents = customers.reduce(
      (sum, customer) => sum + customer.cashSpentCents,
      0
    );

    const cardCents = customers.reduce(
      (sum, customer) => sum + customer.cardSpentCents,
      0
    );

    return {
      totalCustomers: customers.length,
      totalRentals,
      totalSpentCents,
      cashCents,
      cardCents,
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
              Customer Database
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
              Customers
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
              Real customer profiles from manual and website bookings. This page
              groups repeated customers and shows phone, email, ID/passport,
              license details, rental history, total spent, and cash/card sales.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white/70 transition hover:border-orange-400/30 hover:text-white"
          >
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[26px] border border-orange-400/20 bg-orange-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
            Customers
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {summary.totalCustomers}
          </p>
        </div>

        <div className="rounded-[26px] border border-purple-400/20 bg-purple-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
            Rentals
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {summary.totalRentals}
          </p>
        </div>

        <div className="rounded-[26px] border border-emerald-400/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Total spent
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {formatMoneyFromCents(summary.totalSpentCents)}
          </p>
        </div>

        <div className="rounded-[26px] border border-emerald-400/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
            Cash
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {formatMoneyFromCents(summary.cashCents)}
          </p>
        </div>

        <div className="rounded-[26px] border border-sky-400/20 bg-sky-500/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
            Card
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {formatMoneyFromCents(summary.cardCents)}
          </p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
          placeholder="Search by customer, phone, email, passport, license, vehicle, contract..."
        />

        {error ? (
          <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {isLoading ? (
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 text-sm font-bold text-white/45">
            Loading customers...
          </div>
        ) : null}

        {!isLoading && filteredCustomers.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 text-sm font-bold text-white/45">
            No customers found yet. Create a manual booking or receive a website
            booking first.
          </div>
        ) : null}

        {filteredCustomers.map((customer) => {
          const latestBooking = customer.bookings
            .slice()
            .sort((a, b) => {
              const dateA = new Date(getCreatedAt(a)).getTime() || 0;
              const dateB = new Date(getCreatedAt(b)).getTime() || 0;

              return dateB - dateA;
            })[0];

          return (
            <div
              key={customer.key}
              className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
                    Customer
                  </p>
                  <h3 className="mt-3 text-2xl font-black text-white">
                    {customer.name}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-white/50">
                    {customer.phone || "No phone"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white/50">
                    {customer.email || "No email"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                    Total spent
                  </p>
                  <p className="mt-1 text-xl font-black text-white">
                    {formatMoneyFromCents(customer.totalSpentCents)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    ID / Passport
                  </p>
                  <p className="mt-1 font-black text-white">
                    {customer.document || "Not saved"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Rentals
                  </p>
                  <p className="mt-1 font-black text-white">
                    {customer.rentalCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    License
                  </p>
                  <p className="mt-1 font-black text-white">
                    {customer.license || "Not saved"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/35">
                    {customer.licenseCountry || "No country"} · Exp:{" "}
                    {customer.licenseExpiry || "No expiry"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Payment history
                  </p>
                  <p className="mt-1 font-black text-emerald-300">
                    Cash: {formatMoneyFromCents(customer.cashSpentCents)}
                  </p>
                  <p className="mt-1 font-black text-sky-300">
                    Card: {formatMoneyFromCents(customer.cardSpentCents)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Address
                  </p>
                  <p className="mt-1 font-black text-white">
                    {customer.address || "Not saved"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                  Last Rental
                </p>
                <p className="mt-1 font-black text-white">
                  {customer.lastVehicle || "Vehicle"}
                </p>
                <p className="mt-1 text-sm font-bold text-white/50">
                  {formatDate(customer.lastRentalDate)} ·{" "}
                  {customer.lastContract}
                </p>
              </div>

              {latestBooking ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                    Latest booking details
                  </p>
                  <div className="mt-3 grid gap-2 text-sm font-bold text-white/55 md:grid-cols-2">
                    <p>
                      Pickup:{" "}
                      {latestBooking.pickup_date ||
                        latestBooking.contractData?.fechaEntrega ||
                        "--"}{" "}
                      {latestBooking.pickup_time ||
                        latestBooking.contractData?.horaEntrega ||
                        "--"}
                    </p>
                    <p>
                      Dropoff:{" "}
                      {latestBooking.dropoff_date ||
                        latestBooking.contractData?.fechaDevolucion ||
                        "--"}{" "}
                      {latestBooking.dropoff_time ||
                        latestBooking.contractData?.horaDevolucion ||
                        "--"}
                    </p>
                    <p>
                      Payment: {paymentMethodLabel(getPaymentMethod(latestBooking))}
                    </p>
                    <p>Total: {formatMoneyFromCents(getTotalCents(latestBooking))}</p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}