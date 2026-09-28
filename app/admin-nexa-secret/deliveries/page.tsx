"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Building2,
  CalendarClock,
  ExternalLink,
  FileText,
  Hotel,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plane,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import AdminShell from "../../components/dashboard/AdminShell";

type DeliveryDetails = {
  serviceMethod: "hotel_delivery" | "airport_delivery";
  deliveryArea: string;
  deliveryAreaId: string;
  destinationKind: string;
  deliveryAddress: string;
  deliveryTime: string;
  collectionTime: string;
  deliveryFeeCents: number;
  collectionFeeCents: number;
  serviceFeesCents: number;
  rentalAmountCents: number;
  hotelName: string;
  hotelRoom: string;
  hotelAddress: string;
  hotelPlaceId: string;
  hotelGoogleMapsUrl: string;
  hotelPhotos: string[];
  airbnbAddress: string;
  airbnbPlaceId: string;
  airbnbStreetName: string;
  airbnbStreetNumber: string;
  airbnbBlockNumber: string;
  airbnbBuildingName: string;
  airbnbFloor: string;
  airbnbDoorNumber: string;
  airbnbPostalCode: string;
  airbnbCity: string;
  airbnbGoogleMapsUrl: string;
  airportReturnMethod: string;
  officeReturnTime: string;
};

type Reservation = {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  vehicleName: string;
  quantity: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: string;
  status: string;
  contractNumber: string;
  hasDocuments: boolean;
  createdAt: string;
  isDelivery: boolean;
  deliveryDetails: DeliveryDetails | null;
};

type BookingDocument = {
  key: string;
  label: string;
  available: boolean;
  url: string;
  downloadUrl: string;
  name: string;
  error?: string;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(Number(cents || 0) / 100);
}

function dateTime(date: string, time: string) {
  if (!date) return "Not available";
  const value = new Date(`${date}T${time || "00:00"}:00`);

  if (Number.isNaN(value.getTime())) {
    return `${date} · ${time || "--:--"}`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function isToday(date: string) {
  if (!date) return false;
  const today = new Date();
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return date === key;
}

function deliveryTitle(details: DeliveryDetails) {
  if (details.serviceMethod === "airport_delivery") return "Airport delivery";
  if (details.destinationKind === "hotel") return details.hotelName || "Hotel delivery";
  return "Airbnb / address delivery";
}

function deliveryAddress(details: DeliveryDetails) {
  return (
    details.deliveryAddress ||
    details.hotelAddress ||
    details.airbnbAddress ||
    "Address not available"
  );
}

function mapsUrl(details: DeliveryDetails) {
  return details.hotelGoogleMapsUrl || details.airbnbGoogleMapsUrl || "";
}

export default function DeliveriesPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<BookingDocument[] | null>(null);
  const [documentsCustomer, setDocumentsCustomer] = useState("");
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const loadDeliveries = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/reservations", {
        method: "GET",
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Could not load delivery bookings.");
      }

      setReservations(
        (Array.isArray(data.reservations) ? data.reservations : []).filter(
          (reservation: Reservation) =>
            reservation.isDelivery && reservation.deliveryDetails,
        ),
      );
    } catch (loadError: any) {
      setError(loadError?.message || "Could not load delivery bookings.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries();
    const interval = window.setInterval(() => loadDeliveries(false), 30_000);
    return () => window.clearInterval(interval);
  }, [loadDeliveries]);

  const visibleDeliveries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reservations;

    return reservations.filter((reservation) => {
      const details = reservation.deliveryDetails;
      return [
        reservation.customerName,
        reservation.customerEmail,
        reservation.phone,
        reservation.contractNumber,
        reservation.vehicleName,
        details?.deliveryArea,
        details?.hotelName,
        details?.deliveryAddress,
        details?.hotelAddress,
        details?.airbnbAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [reservations, search]);

  const deliveryCountToday = reservations.filter((reservation) =>
    isToday(reservation.pickupDate),
  ).length;

  const collectionCountToday = reservations.filter((reservation) =>
    isToday(reservation.dropoffDate),
  ).length;

  async function openDocuments(reservation: Reservation) {
    setDocumentsCustomer(reservation.customerName);
    setDocuments([]);
    setDocumentsLoading(true);

    try {
      const response = await fetch(
        `/api/admin/reservations?action=documents&id=${encodeURIComponent(reservation.id)}`,
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Could not load customer documents.");
      }

      setDocuments(Array.isArray(data.documents) ? data.documents : []);
    } catch (documentError: any) {
      setDocuments([
        {
          key: "error",
          label: documentError?.message || "Could not load customer documents.",
          available: false,
          url: "",
          downloadUrl: "",
          name: "",
        },
      ]);
    } finally {
      setDocumentsLoading(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-5">
        <section className="overflow-hidden rounded-2xl border border-orange-400/20 bg-[radial-gradient(circle_at_85%_0%,rgba(249,115,22,0.20),transparent_34%),linear-gradient(135deg,#111318,#090A0D)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                <Truck size={14} />
                Delivery operations
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Upcoming deliveries & collections
              </h1>

              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-white/48">
                Hotel, Airbnb and airport bookings with their exact address, times, customer documents and payment details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadDeliveries()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-xs font-black text-white transition hover:bg-white/[0.12]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Active deliveries" value={reservations.length} />
            <Metric label="Deliveries today" value={deliveryCountToday} />
            <Metric label="Collections today" value={collectionCountToday} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0B0D12]/92 p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:p-5">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/32" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, hotel, area, address or booking number"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/28 focus:border-orange-400/45 focus:bg-white/[0.065]"
            />
          </label>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm font-bold text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0D12]/88 text-white/50">
            <Loader2 className="mr-3 animate-spin" size={20} />
            Loading delivery bookings…
          </div>
        ) : visibleDeliveries.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0B0D12]/88 px-6 text-center">
            <Truck size={34} className="text-orange-300" />
            <h2 className="mt-4 text-xl font-black text-white">No delivery bookings found</h2>
            <p className="mt-2 text-sm font-semibold text-white/42">
              New paid delivery bookings will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleDeliveries.map((reservation) => {
              const details = reservation.deliveryDetails!;
              const locationUrl = mapsUrl(details);
              const totalFees =
                details.serviceFeesCents ||
                details.deliveryFeeCents + details.collectionFeeCents;
              const rentalAmount =
                details.rentalAmountCents ||
                Math.max(0, reservation.totalAmount - totalFees);

              return (
                <article
                  key={reservation.id || reservation.contractNumber}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]/94 shadow-[0_18px_55px_rgba(0,0,0,0.26)]"
                >
                  <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/16 to-transparent p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-[0_12px_28px_rgba(249,115,22,0.25)]">
                          {details.serviceMethod === "airport_delivery" ? (
                            <Plane size={19} />
                          ) : details.destinationKind === "hotel" ? (
                            <Hotel size={19} />
                          ) : (
                            <Building2 size={19} />
                          )}
                        </span>

                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
                            {details.serviceMethod === "airport_delivery"
                              ? "Airport delivery"
                              : "Delivery booking"}
                          </p>
                          <h2 className="mt-1 truncate text-xl font-black text-white">
                            {deliveryTitle(details)}
                          </h2>
                          <p className="mt-1 text-xs font-bold text-white/38">
                            {reservation.contractNumber}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
                        Paid
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Info icon={<CalendarClock size={16} />} label="Deliver" value={dateTime(reservation.pickupDate, details.deliveryTime || reservation.pickupTime)} />
                      <Info icon={<CalendarClock size={16} />} label="Collect / return" value={dateTime(reservation.dropoffDate, details.collectionTime || details.officeReturnTime || reservation.dropoffTime)} />
                    </div>

                    <div className="rounded-xl border border-orange-400/15 bg-orange-500/[0.07] p-4">
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 shrink-0 text-orange-300" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-300/70">
                            {details.deliveryArea || "Delivery location"}
                          </p>
                          <p className="mt-1 text-sm font-bold leading-6 text-white">
                            {deliveryAddress(details)}
                          </p>
                          {details.hotelRoom ? (
                            <p className="mt-1 text-xs font-bold text-white/50">Room: {details.hotelRoom}</p>
                          ) : null}
                          {locationUrl ? (
                            <a
                              href={locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-black transition hover:bg-orange-100"
                            >
                              Open Google Maps
                              <ExternalLink size={14} />
                            </a>
                          ) : null}
                        </div>
                      </div>

                      {details.destinationKind === "airbnb" ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          <AddressDetail label="Street" value={details.airbnbStreetName} />
                          <AddressDetail label="Number" value={details.airbnbStreetNumber} />
                          <AddressDetail label="Block" value={details.airbnbBlockNumber} />
                          <AddressDetail label="Building" value={details.airbnbBuildingName} />
                          <AddressDetail label="Floor" value={details.airbnbFloor} />
                          <AddressDetail label="Door" value={details.airbnbDoorNumber} />
                          <AddressDetail label="Postal code" value={details.airbnbPostalCode} />
                          <AddressDetail label="City" value={details.airbnbCity} />
                        </div>
                      ) : null}

                      {details.airportReturnMethod ? (
                        <p className="mt-3 text-xs font-bold text-white/55">
                          Airport return: {details.airportReturnMethod.replaceAll("_", " ")}
                          {details.officeReturnTime ? ` · ${details.officeReturnTime}` : ""}
                        </p>
                      ) : null}
                    </div>

                    {details.hotelPhotos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {details.hotelPhotos.map((photo, index) => (
                          <a key={`${photo}-${index}`} href={photo} target="_blank" rel="noopener noreferrer">
                            <img
                              src={photo}
                              alt={`${details.hotelName || "Hotel"} ${index + 1}`}
                              className="h-24 w-full rounded-xl border border-white/10 object-cover transition hover:opacity-80"
                            />
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Info icon={<UserRound size={16} />} label="Customer" value={reservation.customerName} />
                      <Info icon={<Phone size={16} />} label="Phone" value={reservation.phone || "-"} />
                      <Info icon={<Mail size={16} />} label="Email" value={reservation.customerEmail || "-"} />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                      <MoneyLine label="Rental amount" value={money(rentalAmount)} />
                      <MoneyLine label="Delivery fee" value={money(details.deliveryFeeCents)} />
                      <MoneyLine label="Collection fee" value={money(details.collectionFeeCents)} />
                      <MoneyLine label="Delivery fees total" value={money(totalFees)} />
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <MoneyLine label="Total paid online" value={money(reservation.amountPaid || reservation.totalAmount)} strong />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-bold text-white/42">
                        {reservation.quantity} × {reservation.vehicleName}
                      </p>

                      <button
                        type="button"
                        onClick={() => openDocuments(reservation)}
                        disabled={!reservation.hasDocuments}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black text-white transition hover:bg-white/[0.11] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <FileText size={15} />
                        {reservation.hasDocuments ? "Customer documents" : "No documents"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {documents !== null ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setDocuments(null)}
            aria-label="Close documents"
          />

          <section className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0B0D12] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Secure documents</p>
                <h2 className="mt-1 text-2xl font-black text-white">{documentsCustomer}</h2>
              </div>
              <button
                type="button"
                onClick={() => setDocuments(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/[0.12]"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {documentsLoading ? (
                <div className="col-span-full flex min-h-32 items-center justify-center text-sm font-bold text-white/50">
                  <Loader2 className="mr-3 animate-spin" size={18} />
                  Loading secure links…
                </div>
              ) : (
                documents.map((document) => (
                  <div key={document.key} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm font-black text-white">{document.label}</p>
                    {document.available ? (
                      <div className="mt-3 flex gap-2">
                        <a href={document.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-white px-3 py-2 text-xs font-black text-black">View</a>
                        <a href={document.downloadUrl} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white">Download</a>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs font-bold text-red-300">{document.error || "Not available"}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/35">{label}</p>
      <p className="mt-1 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function Info({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center gap-2 text-orange-300">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-[0.14em]">{label}</p>
      </div>
      <p className="mt-2 break-words text-sm font-bold leading-5 text-white/72">{value}</p>
    </div>
  );
}

function MoneyLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className={`text-xs ${strong ? "font-black text-white" : "font-bold text-white/45"}`}>{label}</span>
      <span className={`text-sm ${strong ? "font-black text-orange-300" : "font-black text-white/75"}`}>{value}</span>
    </div>
  );
}

function AddressDetail({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-white/30">{label}</p>
      <p className="mt-1 text-xs font-bold text-white/72">{value}</p>
    </div>
  );
}
