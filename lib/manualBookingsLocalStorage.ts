/**
 * Browser localStorage for manual bookings must NOT store PDF base64
 * (each PDF ~100–200KB+ → QuotaExceededError on nexa_manual_bookings).
 */

export type ContractPdfMeta = {
  fileName?: string;
  storagePath?: string;
  signedUrl?: string;
  drive?: {
    uploaded?: boolean;
    webViewLink?: string | null;
    webContentLink?: string | null;
    folderWebViewLink?: string | null;
    [key: string]: unknown;
  };
  generatedAt?: string;
};

export function stripContractPdfForLocalStorage(
  contractPdf: ContractPdfMeta & { pdfBase64?: string } | undefined
): ContractPdfMeta | undefined {
  if (!contractPdf) return undefined;

  const { pdfBase64: _removed, ...rest } = contractPdf;
  return rest;
}

export function stripBookingForLocalStorage<T extends { contractPdf?: unknown }>(
  booking: T
): T {
  if (!booking?.contractPdf || typeof booking.contractPdf !== "object") {
    return booking;
  }

  return {
    ...booking,
    contractPdf: stripContractPdfForLocalStorage(
      booking.contractPdf as ContractPdfMeta & { pdfBase64?: string }
    ),
  };
}

export function stripBookingsForLocalStorage<T extends { contractPdf?: unknown }>(
  bookings: T[]
): T[] {
  return bookings.map(stripBookingForLocalStorage);
}

const STORAGE_KEY = "nexa_manual_bookings";

function pruneLegacyPdfBase64InPlace(bookings: unknown[]): unknown[] {
  let changed = false;

  const pruned = bookings.map((item) => {
    if (!item || typeof item !== "object") return item;

    const booking = item as { contractPdf?: { pdfBase64?: string } };
    if (!booking.contractPdf?.pdfBase64) return item;

    changed = true;
    return stripBookingForLocalStorage(booking);
  });

  if (changed && typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    } catch {
      /* ignore — setManualBookingsLocalStorage will retry */
    }
  }

  return pruned;
}

export function getManualBookingsFromLocalStorage<T>(): T[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];

    return pruneLegacyPdfBase64InPlace(saved) as T[];
  } catch {
    return [];
  }
}

export function setManualBookingsLocalStorage<T extends { contractPdf?: unknown }>(
  bookings: T[]
): void {
  if (typeof window === "undefined") return;

  const stripped = stripBookingsForLocalStorage(bookings);
  const payload = JSON.stringify(stripped);

  try {
    localStorage.setItem(STORAGE_KEY, payload);
    return;
  } catch (error: unknown) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22);

    if (!isQuota) {
      throw error;
    }
  }

  const pruned = stripped.map((booking) => {
    const copy = { ...booking } as T & {
      contractData?: Record<string, unknown>;
      vehicle?: Record<string, unknown>;
    };

    if (copy.contractData && typeof copy.contractData === "object") {
      const cd = { ...copy.contractData };
      delete cd.observaciones;
      delete cd.notas;
      copy.contractData = cd;
    }

    return copy;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  } catch (error: unknown) {
    console.error("nexa_manual_bookings still exceeds quota after stripping PDFs:", error);
    throw new Error(
      "Local storage is full. Clear old manual bookings in Bookings or use a private window. PDFs are kept in Supabase and Google Drive."
    );
  }
}
