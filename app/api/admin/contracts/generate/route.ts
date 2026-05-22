import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import NexaContractPDF from "../../../../components/contracts/NexaContractPDF";
import {
  persistContractPdfToSupabaseStorage,
  tryUpdateBookingContractMetadata,
} from "@/lib/contractPdfStorage";
import { normalizeBookingForContractPdf } from "@/lib/contractBookingNormalize";
import {
  getCustomerFolderNameFromFileName,
  uploadContractPdfToGoogleDrive,
} from "@/lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type BookingLike = {
  id?: string;
  status?: string;
  vehicle?: {
    codigo?: string;
    matricula?: string;
    marca?: string;
    modelo?: string;
  };
  contractData?: {
    numeroContrato?: string;
    fechaEntrega?: string;
    horaEntrega?: string;
    fechaDevolucion?: string;
    horaDevolucion?: string;
    nombreCliente?: string;
    dniPasaporte?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    permisoConducir?: string;
    paisExpedicion?: string;
    fechaCaducidad?: string;
    dias?: string;
    precioPorDia?: string;
    total?: string;
    pagado?: string;
    metodoPago?: string;
    paymentMethod?: string;
    [key: string]: any;
  };
  [key: string]: any;
};

type DriveUploadResult = {
  uploaded?: boolean;
  skipped?: boolean;
  failed?: boolean;
  reason?: string | null;
  error?: string;
  fileId?: string | null;
  fileName?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  folderId?: string | null;
  folderName?: string | null;
  folderWebViewLink?: string | null;
  customerFolderName?: string | null;
  customerFolderId?: string | null;
  customerFolderWebViewLink?: string | null;
  parentFolderId?: string | null;
  [key: string]: any;
};

const BUFFER_MINUTES_AFTER_BOOKING = 60;

function cleanText(value: any) {
  return String(value || "").trim();
}

function sanitizeDriveName(value: string) {
  return cleanText(value || "NEXA")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/[^a-zA-Z0-9-_ .]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/-+/g, "-")
    .replace(/^[-_.\s]+|[-_.\s]+$/g, "")
    .slice(0, 140);
}

function sanitizeFileName(value: string) {
  const clean = sanitizeDriveName(value);
  return clean || "NEXA_CONTRACT";
}

function getContractNumber(booking: BookingLike) {
  return (
    cleanText(booking?.contractData?.numeroContrato) ||
    cleanText(booking?.id) ||
    "NX-CONTRACT"
  );
}

function getCustomerName(booking: BookingLike) {
  return cleanText(booking?.contractData?.nombreCliente) || "Cliente";
}

function getVehicleCode(booking: BookingLike) {
  return cleanText(booking?.vehicle?.codigo) || "Vehiculo";
}

function getVehiclePlate(booking: BookingLike) {
  return cleanText(booking?.vehicle?.matricula) || "Matricula";
}

function getPickupDate(booking: BookingLike) {
  return (
    cleanText(booking?.contractData?.fechaEntrega) ||
    new Date().toISOString().slice(0, 10)
  );
}

function createCustomerFolderName(booking: BookingLike) {
  const pickupDate = getPickupDate(booking);
  const customerName = getCustomerName(booking);
  const contractNumber = getContractNumber(booking);
  const vehicleCode = getVehicleCode(booking);

  return sanitizeDriveName(
    `${customerName}_${pickupDate}_${contractNumber}_${vehicleCode}`
  );
}

function createContractFileName(booking: BookingLike) {
  const contractNumber = getContractNumber(booking);
  const customerName = getCustomerName(booking);
  const vehicleCode = getVehicleCode(booking);
  const plate = getVehiclePlate(booking);
  const pickupDate = getPickupDate(booking);

  const safeContractNumber = sanitizeFileName(contractNumber);
  const safeName = sanitizeFileName(customerName);
  const safeVehicleCode = sanitizeFileName(vehicleCode);
  const safePlate = sanitizeFileName(plate);

  return `${safeContractNumber}_${pickupDate}_${safeName}_${safeVehicleCode}_${safePlate}_NEXA_RENTALS.pdf`;
}

function buildDateTime(date?: string, time?: string) {
  if (!date || !time) return null;

  const value = new Date(`${date}T${time}`);

  if (Number.isNaN(value.getTime())) return null;

  return value;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getBookingRange(booking: BookingLike) {
  const start = buildDateTime(
    booking?.contractData?.fechaEntrega,
    booking?.contractData?.horaEntrega
  );

  const end = buildDateTime(
    booking?.contractData?.fechaDevolucion,
    booking?.contractData?.horaDevolucion
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

function isCancelledOrFinished(booking: BookingLike) {
  const status = String(booking?.status || "").toLowerCase();

  return (
    status.includes("cancel") ||
    status.includes("cancelada") ||
    status.includes("cancelled") ||
    status.includes("canceled") ||
    status.includes("failed") ||
    status.includes("refunded") ||
    status.includes("returned") ||
    status.includes("finalizada") ||
    status.includes("completed") ||
    status.includes("finished")
  );
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

function validateBooking(booking: BookingLike) {
  if (!booking) return "Missing booking data.";
  if (!booking.vehicle) return "Missing vehicle data.";
  if (!booking.contractData) return "Missing contract data.";

  if (!booking.contractData.numeroContrato) return "Missing contract number.";
  if (!booking.contractData.nombreCliente) return "Missing customer name.";
  if (!booking.vehicle.codigo) return "Missing vehicle code.";
  if (!booking.vehicle.matricula) return "Missing vehicle plate.";

  if (!booking.contractData.fechaEntrega) return "Missing pickup date.";
  if (!booking.contractData.horaEntrega) return "Missing pickup time.";
  if (!booking.contractData.fechaDevolucion) return "Missing return date.";
  if (!booking.contractData.horaDevolucion) return "Missing return time.";

  if (!booking.contractData.dniPasaporte) return "Missing DNI/passport.";
  if (!booking.contractData.telefono) return "Missing phone number.";
  if (!booking.contractData.direccion) return "Missing address.";
  if (!booking.contractData.permisoConducir) return "Missing driving license.";
  if (!booking.contractData.paisExpedicion) return "Missing license country.";

  if (!booking.contractData.fechaCaducidad) {
    return "Missing license expiry date.";
  }

  if (!booking.contractData.dias) return "Missing rental days.";
  if (!booking.contractData.precioPorDia) return "Missing daily price.";
  if (!booking.contractData.total) return "Missing total.";
  if (!booking.contractData.pagado) return "Missing paid amount.";

  const range = getBookingRange(booking);

  if (!range) return "Invalid pickup or return date/time.";

  if (range.end <= range.start) {
    return "Return date/time must be after pickup date/time.";
  }

  return null;
}

function checkVehicleOverlap(
  booking: BookingLike,
  existingBookings: BookingLike[]
) {
  const newRange = getBookingRange(booking);

  if (!newRange) return null;

  const vehicleCode = booking?.vehicle?.codigo;

  if (!vehicleCode) return null;

  const currentBookingId = String(booking?.id || "");
  const currentContractNumber = String(
    booking?.contractData?.numeroContrato || ""
  );

  const conflict = existingBookings.find((existingBooking) => {
    if (!existingBooking) return false;
    if (isCancelledOrFinished(existingBooking)) return false;

    const existingId = String(existingBooking?.id || "");
    const existingContractNumber = String(
      existingBooking?.contractData?.numeroContrato || ""
    );

    if (currentBookingId && existingId && currentBookingId === existingId) {
      return false;
    }

    if (
      currentContractNumber &&
      existingContractNumber &&
      currentContractNumber === existingContractNumber
    ) {
      return false;
    }

    const existingVehicleCode = existingBooking?.vehicle?.codigo;

    if (existingVehicleCode !== vehicleCode) return false;

    const existingRange = getBookingRange(existingBooking);

    if (!existingRange) return false;

    return isOverlapping(
      newRange.start,
      newRange.blockedEnd,
      existingRange.start,
      existingRange.blockedEnd
    );
  });

  if (!conflict) return null;

  const conflictRange = getBookingRange(conflict);

  return {
    booking: conflict,
    returnDate: conflictRange?.end || null,
    blockedEnd: conflictRange?.blockedEnd || null,
  };
}

function bufferToBase64(buffer: Buffer) {
  return buffer.toString("base64");
}

const DRIVE_UPLOAD_TIMEOUT_MS = 50_000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function safeUploadToGoogleDrive({
  booking,
  fileName,
  pdfBuffer,
}: {
  booking: BookingLike;
  fileName: string;
  pdfBuffer: Buffer;
}): Promise<DriveUploadResult> {
  const customerFolderName = getCustomerFolderNameFromFileName(fileName);

  try {
    console.log("📤 Starting contract Google Drive upload from generate route:", {
      fileName,
      customerFolderName,
      contractNumber: getContractNumber(booking),
      customerName: getCustomerName(booking),
      vehicleCode: getVehicleCode(booking),
      vehiclePlate: getVehiclePlate(booking),
      pdfSize: pdfBuffer.length,
    });

    const driveResult = await uploadContractPdfToGoogleDrive({
      fileName,
      pdfBuffer,
      folderName: customerFolderName,
      customerFolderName,
      customerName: getCustomerName(booking),
      contractDate: getPickupDate(booking),
      contractNumber: getContractNumber(booking),
      vehicleCode: getVehicleCode(booking),
      vehiclePlate: getVehiclePlate(booking),
    });

    console.log("✅ Google Drive result from contract generate route:", {
      uploaded: driveResult?.uploaded,
      skipped: driveResult?.skipped,
      failed: driveResult?.failed,
      reason: driveResult?.reason,
      fileLink: driveResult?.webViewLink,
      folderLink: driveResult?.folderWebViewLink,
    });

    return {
      ...driveResult,
      customerFolderName,
      folderName: driveResult?.folderName || customerFolderName,
    };
  } catch (error: any) {
    console.error("❌ Google Drive upload failed inside generate route:", {
      message: error?.message,
      stack: error?.stack,
      responseData: error?.response?.data,
    });

    return {
      uploaded: false,
      skipped: false,
      failed: true,
      customerFolderName,
      folderName: customerFolderName,
      error: error?.message || "Google Drive upload failed.",
      reason: error?.message || "Google Drive upload failed.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawBooking = body.booking as BookingLike;
    const existingBookings = Array.isArray(body.existingBookings)
      ? (body.existingBookings as BookingLike[])
      : [];
    const skipOverlapCheck = Boolean(body.skipOverlapCheck || body.regenerate);

    const booking = normalizeBookingForContractPdf(
      rawBooking
    ) as BookingLike;

    if (booking?.contractData && !booking.contractData.email) {
      booking.contractData.email = "";
    }

    const validationError = validateBooking(booking);

    if (validationError) {
      return NextResponse.json(
        {
          ok: false,
          error: validationError,
        },
        { status: 400 }
      );
    }

    const overlapConflict = skipOverlapCheck
      ? null
      : checkVehicleOverlap(booking, existingBookings);

    if (overlapConflict) {
      const vehicleCode = booking?.vehicle?.codigo || "este vehículo";

      const conflictReturn = overlapConflict.blockedEnd
        ? `${formatDateEs(overlapConflict.blockedEnd)} a las ${formatTimeEs(
            overlapConflict.blockedEnd
          )}`
        : overlapConflict.returnDate
        ? `${formatDateEs(overlapConflict.returnDate)} a las ${formatTimeEs(
            overlapConflict.returnDate
          )}`
        : "la fecha de devolución de la otra reserva";

      return NextResponse.json(
        {
          ok: false,
          error: `El vehículo ${vehicleCode} ya está reservado en esas fechas. Estará disponible después del ${conflictReturn}.`,
          conflict: {
            bookingId: overlapConflict.booking?.id || null,
            contractNumber:
              overlapConflict.booking?.contractData?.numeroContrato || null,
            returnDate: overlapConflict.returnDate?.toISOString() || null,
            blockedEnd: overlapConflict.blockedEnd?.toISOString() || null,
          },
        },
        { status: 409 }
      );
    }

    const fileName = createContractFileName(booking);
    const customerFolderName = getCustomerFolderNameFromFileName(fileName);
    const bookingKey =
      cleanText(booking?.id) ||
      getContractNumber(booking) ||
      `booking_${Date.now()}`;

    const pdfDocument = React.createElement(NexaContractPDF as any, {
      booking: booking as any,
    });

    const pdfBuffer = await renderToBuffer(pdfDocument as any);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "PDF was generated empty. Google Drive upload was not started.",
        },
        { status: 500 }
      );
    }

    let driveResult: DriveUploadResult = {
      uploaded: false,
      skipped: true,
      failed: false,
      reason: "Google Drive upload not started.",
    };

    driveResult = await safeUploadToGoogleDrive({
      booking,
      fileName,
      pdfBuffer: Buffer.from(pdfBuffer),
    });

    let storageResult: Awaited<
      ReturnType<typeof persistContractPdfToSupabaseStorage>
    > = { ok: false, error: "Storage upload not started." };

    try {
      storageResult = await withTimeout(
        persistContractPdfToSupabaseStorage({
          bookingKey,
          fileName,
          pdfBuffer: Buffer.from(pdfBuffer),
        }),
        12_000,
        "Supabase storage upload"
      );
    } catch (storageError: any) {
      console.error("❌ Supabase storage upload failed:", storageError);
      storageResult = {
        ok: false,
        error: storageError?.message || "Supabase storage upload failed.",
      };
    }

    const metadataUpdate = await tryUpdateBookingContractMetadata({
      bookingKey,
      contractNumber: getContractNumber(booking),
      storage: storageResult,
      drive: driveResult,
      fileName,
    });

    const includePdfBase64 = !storageResult.ok;
    const pdfBase64 = includePdfBase64
      ? bufferToBase64(Buffer.from(pdfBuffer))
      : undefined;

    return NextResponse.json({
      ok: true,
      pdfGenerated: true,
      fileName,
      customerFolderName,
      pdfBase64,
      storage: storageResult,
      bookingMetadataUpdated: Boolean(metadataUpdate?.ok),
      drive: driveResult,
      googleDriveUploaded: Boolean(driveResult?.uploaded),
      googleDriveFailed: Boolean(driveResult?.failed),
      googleDriveSkipped: Boolean(driveResult?.skipped),
      googleDriveFileLink: driveResult?.webViewLink || null,
      googleDriveFolderLink: driveResult?.folderWebViewLink || null,
      googleDriveReason: driveResult?.reason || driveResult?.error || null,
      warnings: [
        !storageResult.ok
          ? storageResult.error || "Contract PDF was not saved to Supabase storage."
          : null,
        driveResult?.failed
          ? driveResult?.reason || driveResult?.error || "Google Drive upload failed."
          : null,
        driveResult?.skipped
          ? driveResult?.reason || "Google Drive upload skipped (check GOOGLE_DRIVE_* env vars)."
          : null,
      ].filter(Boolean),
    });
  } catch (error: any) {
    console.error("❌ Contract generation error:", {
      message: error?.message,
      stack: error?.stack,
      responseData: error?.response?.data,
    });

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to generate contract PDF.",
      },
      { status: 500 }
    );
  }
}