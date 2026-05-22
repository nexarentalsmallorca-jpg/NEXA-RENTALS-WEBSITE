"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/dashboard/AdminShell";
import {
  getManualBookingsFromLocalStorage,
  setManualBookingsLocalStorage,
  stripContractPdfForLocalStorage,
} from "@/lib/manualBookingsLocalStorage";

type ContractBooking = {
  id?: string;
  createdAt?: string;
  created_at?: string;
  status?: string;
  source?: string;

  customer_name?: string;
  phone?: string;
  amount?: number;
  amount_eur?: number;
  payment_method?: string;
  payment_status?: string;
  contract_number?: string;

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
    telefono?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    total?: string;
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
  };

  contractPdf?: {
    fileName?: string;
    pdfBase64?: string;
    storagePath?: string;
    signedUrl?: string;
    drive?: {
      uploaded?: boolean;
      webViewLink?: string;
      webContentLink?: string;
      fileId?: string;
      fileName?: string;
    };
    generatedAt?: string;
  };
};

type ApiBookingRow = ContractBooking & {
  stripe_payment_intent_id?: string;
};

function getStoredManualBookings(): ContractBooking[] {
  return getManualBookingsFromLocalStorage<ContractBooking>();
}

function saveContractPdfToLocalStorage(
  booking: ContractBooking,
  contractPdf: NonNullable<ContractBooking["contractPdf"]>
) {
  if (typeof window === "undefined") return;

  const contractNumber = getContractNumber(booking);
  const saved = getStoredManualBookings();
  const index = saved.findIndex(
    (item) => getContractNumber(item) === contractNumber
  );

  const safePdf = stripContractPdfForLocalStorage(
    contractPdf as NonNullable<ContractBooking["contractPdf"]> & {
      pdfBase64?: string;
    }
  ) as ContractBooking["contractPdf"];

  const merged: ContractBooking =
    index >= 0
      ? { ...saved[index], contractPdf: safePdf }
      : { ...booking, contractPdf: safePdf };

  if (index >= 0) {
    saved[index] = merged;
  } else {
    saved.unshift(merged);
  }

  setManualBookingsLocalStorage(saved);
}

function cleanText(value: any) {
  return String(value || "").trim();
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

  if (clean.includes("unpaid") || clean.includes("pendiente")) return "unpaid";

  return "";
}

function paymentMethodLabel(value?: string) {
  const method = normalizePaymentMethod(value);

  if (method === "cash") return "Cash";
  if (method === "card") return "Card";
  if (method === "unpaid") return "Unpaid";

  return "Unknown";
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

function getCustomerName(booking: ContractBooking) {
  return (
    cleanText(booking.customer_name) ||
    cleanText(booking.contractData?.nombreCliente) ||
    "Customer"
  );
}

function getCustomerPhone(booking: ContractBooking) {
  return cleanText(booking.phone) || cleanText(booking.contractData?.telefono);
}

function getContractNumber(booking: ContractBooking) {
  return (
    cleanText(booking.contract_number) ||
    cleanText(booking.contractData?.numeroContrato) ||
    cleanText(booking.id) ||
    "Contract"
  );
}

function getVehicleName(booking: ContractBooking) {
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

function getTotalCents(booking: ContractBooking) {
  if (typeof booking.amount === "number") return booking.amount;

  if (typeof booking.amount_eur === "number") {
    return Math.round(booking.amount_eur * 100);
  }

  const total = moneyTextToNumber(booking.contractData?.total);

  return Math.round(total * 100);
}

function getPaymentMethod(booking: ContractBooking) {
  return (
    normalizePaymentMethod(booking.payment_method) ||
    normalizePaymentMethod(booking.contractData?.metodoPago) ||
    normalizePaymentMethod(booking.contractData?.paymentMethod) ||
    normalizePaymentMethod(booking.contractData?.pagado) ||
    "unpaid"
  );
}

function getContractFileName(booking: ContractBooking) {
  const driveFileName = cleanText(booking.contractPdf?.drive?.fileName);
  if (driveFileName) return driveFileName;

  const localFileName = cleanText(booking.contractPdf?.fileName);
  if (localFileName) return localFileName;

  const createdDate = cleanText(booking.createdAt || booking.created_at).slice(
    0,
    10
  );

  const customer = getCustomerName(booking).replace(/[^\w\d]+/g, "_");
  const vehicle = getVehicleName(booking).replace(/[^\w\d]+/g, "_");
  const contractNumber = getContractNumber(booking).replace(/[^\w\d]+/g, "_");

  return `${createdDate || "NEXA"}_${contractNumber}_${customer}_${vehicle}.pdf`;
}

function getCreatedAt(booking: ContractBooking) {
  return cleanText(booking.createdAt || booking.created_at);
}

function hasPdf(booking: ContractBooking) {
  return Boolean(
    booking.contractPdf?.pdfBase64 ||
      booking.contractPdf?.signedUrl ||
      booking.contractPdf?.storagePath ||
      booking.contractPdf?.drive?.webViewLink ||
      booking.contractPdf?.drive?.webContentLink
  );
}

async function openStorageContractPdf(storagePath: string) {
  const response = await fetch(
    `/api/admin/contracts/file?path=${encodeURIComponent(storagePath)}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  if (!data?.ok || !data?.signedUrl) {
    throw new Error(data?.error || "Could not load contract PDF from storage.");
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

function isDriveUploaded(booking: ContractBooking) {
  return Boolean(
    booking.contractPdf?.drive?.uploaded ||
      booking.contractPdf?.drive?.webViewLink ||
      booking.contractPdf?.drive?.webContentLink
  );
}

function openPdfBase64(base64: string) {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = Array.from(byteCharacters).map((char) =>
    char.charCodeAt(0)
  );
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank", "noopener,noreferrer");

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

function downloadPdfBase64(base64: string, fileName: string) {
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = Array.from(byteCharacters).map((char) =>
    char.charCodeAt(0)
  );
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60_000);
}

async function handleDownload(booking: ContractBooking) {
  const fileName = getContractFileName(booking);
  const pdfBase64 = booking.contractPdf?.pdfBase64;

  if (pdfBase64) {
    downloadPdfBase64(pdfBase64, fileName);
    return;
  }

  if (booking.contractPdf?.signedUrl) {
    window.open(booking.contractPdf.signedUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (booking.contractPdf?.storagePath) {
    try {
      await openStorageContractPdf(booking.contractPdf.storagePath);
      return;
    } catch (error: any) {
      alert(error?.message || "Could not download contract PDF.");
      return;
    }
  }

  const driveDownload =
    booking.contractPdf?.drive?.webContentLink ||
    booking.contractPdf?.drive?.webViewLink;

  if (driveDownload) {
    window.open(driveDownload, "_blank", "noopener,noreferrer");
    return;
  }

  alert("This contract PDF is not available yet.");
}

async function handlePrint(booking: ContractBooking) {
  const pdfBase64 = booking.contractPdf?.pdfBase64;

  if (pdfBase64) {
    openPdfBase64(pdfBase64);
    return;
  }

  if (booking.contractPdf?.signedUrl) {
    window.open(booking.contractPdf.signedUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (booking.contractPdf?.storagePath) {
    try {
      await openStorageContractPdf(booking.contractPdf.storagePath);
      return;
    } catch (error: any) {
      alert(error?.message || "Could not open contract PDF.");
      return;
    }
  }

  const driveLink =
    booking.contractPdf?.drive?.webViewLink ||
    booking.contractPdf?.drive?.webContentLink;

  if (driveLink) {
    window.open(driveLink, "_blank", "noopener,noreferrer");
    return;
  }

  alert("This contract PDF is not available yet.");
}

function dedupeBookings(bookings: ContractBooking[]) {
  const map = new Map<string, ContractBooking>();

  bookings.forEach((booking) => {
    const key = getContractNumber(booking);

    if (!map.has(key)) {
      map.set(key, booking);
      return;
    }

    const existing = map.get(key);

    if (!existing) return;

    const existingHasPdf = hasPdf(existing);
    const newHasPdf = hasPdf(booking);

    if (!existingHasPdf && newHasPdf) {
      map.set(key, booking);
    }
  });

  return Array.from(map.values());
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [generatingContractId, setGeneratingContractId] = useState("");
  const [generateError, setGenerateError] = useState("");

  async function loadContracts() {
    setIsLoading(true);
    setError("");

    const localContracts = getStoredManualBookings();

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      const apiContracts = Array.isArray(data?.bookings)
        ? data.bookings.map((booking: ApiBookingRow) => ({
            ...booking,
            createdAt: booking.createdAt || booking.created_at,
          }))
        : [];

      const merged = dedupeBookings([...localContracts, ...apiContracts]);

      setContracts(
        merged.sort((a, b) => {
          const dateA = new Date(getCreatedAt(a)).getTime() || 0;
          const dateB = new Date(getCreatedAt(b)).getTime() || 0;

          return dateB - dateA;
        })
      );

      if (!data?.ok && data?.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setContracts(localContracts);
      setError(
        err?.message ||
          "Could not load Supabase contracts. Showing local contracts only."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGeneratePdf(booking: ContractBooking) {
    const contractNumber = getContractNumber(booking);
    setGeneratingContractId(contractNumber);
    setGenerateError("");

    try {
      const response = await fetch("/api/admin/contracts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking: {
            ...booking,
            id: booking.id || contractNumber,
            contract_number: contractNumber,
            customer_name: getCustomerName(booking),
            phone: getCustomerPhone(booking),
          },
          skipOverlapCheck: true,
          regenerate: true,
        }),
      });

      const data = await response.json();

      const hasPdfArtifact =
        data.pdfBase64 || data.storage?.signedUrl || data.storage?.path;

      if (!data.ok && !hasPdfArtifact) {
        const message =
          data.error ||
          (Array.isArray(data.warnings) ? data.warnings.join(" ") : "") ||
          "Could not generate contract PDF.";
        setGenerateError(message);
        alert(`PDF failed:\n\n${message}`);
        return;
      }

      const contractPdf = {
        fileName: data.fileName,
        storagePath: data.storage?.path,
        signedUrl: data.storage?.signedUrl,
        drive: data.drive,
        generatedAt: new Date().toISOString(),
      };

      saveContractPdfToLocalStorage(booking, contractPdf);

      setContracts((prev) =>
        prev.map((item) =>
          getContractNumber(item) === contractNumber
            ? { ...item, contractPdf }
            : item
        )
      );

      if (data.drive?.uploaded) {
        alert(`PDF generated and saved to Google Drive: ${data.fileName}`);
      } else if (Array.isArray(data.warnings) && data.warnings.length > 0) {
        alert(`PDF generated. ${data.warnings.join(" ")}`);
      } else {
        alert(`PDF generated: ${data.fileName}`);
      }
    } catch (err: any) {
      const message = err?.message || "Contract PDF generation request failed.";
      setGenerateError(message);
      alert(message);
    } finally {
      setGeneratingContractId("");
    }
  }

  useEffect(() => {
    loadContracts();

    function refreshFromStorage() {
      loadContracts();
    }

    window.addEventListener("storage", refreshFromStorage);

    return () => {
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  const filteredContracts = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) return contracts;

    return contracts.filter((booking) => {
      const text = [
        getCustomerName(booking),
        getCustomerPhone(booking),
        getContractNumber(booking),
        getVehicleName(booking),
        getContractFileName(booking),
        getPaymentMethod(booking),
        booking.status,
        booking.source,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(cleanSearch);
    });
  }, [contracts, search]);

  const summary = useMemo(() => {
    const validContracts = contracts.filter((booking) => {
      const status = String(booking.status || "").toLowerCase();

      return (
        !status.includes("cancel") &&
        !status.includes("failed") &&
        getTotalCents(booking) > 0
      );
    });

    const totalCents = validContracts.reduce(
      (sum, booking) => sum + getTotalCents(booking),
      0
    );

    const cashCents = validContracts
      .filter((booking) => getPaymentMethod(booking) === "cash")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    const cardCents = validContracts
      .filter((booking) => getPaymentMethod(booking) === "card")
      .reduce((sum, booking) => sum + getTotalCents(booking), 0);

    const driveCount = contracts.filter(isDriveUploaded).length;
    const pdfCount = contracts.filter(hasPdf).length;

    return {
      totalCents,
      cashCents,
      cardCents,
      driveCount,
      pdfCount,
      count: contracts.length,
    };
  }, [contracts]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
                PDF Archive
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
                Contracts
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
                Real generated contracts from manual bookings and Supabase
                bookings. When Google Drive is connected, uploaded Drive PDFs
                also appear here.
              </p>
            </div>

            <button
              type="button"
              onClick={loadContracts}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white/70 transition hover:border-orange-400/30 hover:text-white"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[26px] border border-orange-400/20 bg-orange-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
              Contracts
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {summary.count}
            </p>
          </div>

          <div className="rounded-[26px] border border-emerald-400/20 bg-emerald-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              Total sales
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {formatMoneyFromCents(summary.totalCents)}
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

          <div className="rounded-[26px] border border-purple-400/20 bg-purple-500/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              Drive PDFs
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {summary.driveCount}/{summary.pdfCount}
            </p>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
            placeholder="Search by customer, contract, phone, vehicle, payment method..."
          />

          {error ? (
            <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm font-bold text-yellow-300">
              {error}
            </div>
          ) : null}

          {generateError ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {generateError}
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          {isLoading ? (
            <div className="rounded-[28px] border border-white/10 bg-[#080A10]/80 p-6 text-sm font-bold text-white/45">
              Loading contracts...
            </div>
          ) : null}

          {!isLoading && filteredContracts.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-[#080A10]/80 p-6 text-sm font-bold text-white/45">
              No contracts found yet. Create a manual booking and generate the
              PDF first.
            </div>
          ) : null}

          {filteredContracts.map((booking) => {
            const contractNumber = getContractNumber(booking);
            const customerName = getCustomerName(booking);
            const vehicleName = getVehicleName(booking);
            const totalCents = getTotalCents(booking);
            const paymentMethod = getPaymentMethod(booking);
            const fileName = getContractFileName(booking);
            const createdAt = getCreatedAt(booking);
            const phone = getCustomerPhone(booking);

            return (
              <div
                key={`${contractNumber}-${fileName}`}
                className="flex flex-col justify-between gap-5 rounded-[28px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl xl:flex-row xl:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-black text-white">
                      {customerName}
                    </p>

                    <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                      {contractNumber}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${paymentMethodClasses(
                        paymentMethod
                      )}`}
                    >
                      {paymentMethodLabel(paymentMethod)}
                    </span>

                    {isDriveUploaded(booking) ? (
                      <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-purple-300">
                        Drive
                      </span>
                    ) : hasPdf(booking) ? (
                      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-300">
                        Local PDF
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                        No PDF
                      </span>
                    )}
                  </div>

                  <p className="mt-2 break-all text-sm font-bold text-white/45">
                    {fileName}
                  </p>

                  <div className="mt-3 grid gap-2 text-sm font-bold text-white/55 md:grid-cols-2 xl:grid-cols-4">
                    <p>
                      <span className="text-white/35">Date:</span>{" "}
                      {formatDate(createdAt)}
                    </p>
                    <p>
                      <span className="text-white/35">Vehicle:</span>{" "}
                      {vehicleName || "Vehicle"}
                    </p>
                    <p>
                      <span className="text-white/35">Phone:</span>{" "}
                      {phone || "No phone"}
                    </p>
                    <p>
                      <span className="text-white/35">Total:</span>{" "}
                      <span className="text-emerald-300">
                        {formatMoneyFromCents(totalCents)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 xl:justify-end">
                  {!hasPdf(booking) ? (
                    <button
                      type="button"
                      onClick={() => handleGeneratePdf(booking)}
                      disabled={generatingContractId === contractNumber}
                      className="rounded-2xl border border-orange-400/25 bg-orange-500/15 px-4 py-3 text-sm font-black text-orange-200 transition hover:border-orange-300/40 disabled:opacity-50"
                    >
                      {generatingContractId === contractNumber
                        ? "Generating..."
                        : "Generate PDF"}
                    </button>
                  ) : null}

                  {booking.contractPdf?.drive?.webViewLink ? (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          booking.contractPdf?.drive?.webViewLink,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm font-black text-purple-200 transition hover:border-purple-300/40"
                    >
                      Open Drive
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleDownload(booking)}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/70 transition hover:border-orange-400/30 hover:text-white"
                  >
                    Download
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrint(booking)}
                    className="rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                  >
                    Print
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AdminShell>
  );
}