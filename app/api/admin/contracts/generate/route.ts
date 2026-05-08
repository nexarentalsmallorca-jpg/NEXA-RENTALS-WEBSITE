import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import NexaContractPDF from "../../../../components/contracts/NexaContractPDF";
import { uploadContractPdfToGoogleDrive } from "../../../../../lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    [key: string]: any;
  };
  [key: string]: any;
};

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function createContractFileName(booking: BookingLike) {
  const contractNumber =
    booking?.contractData?.numeroContrato || booking?.id || "NX-CONTRACT";

  const customerName = booking?.contractData?.nombreCliente || "Cliente";
  const vehicleCode = booking?.vehicle?.codigo || "Vehiculo";
  const plate = booking?.vehicle?.matricula || "Matricula";

  const pickupDate =
    booking?.contractData?.fechaEntrega || new Date().toISOString().slice(0, 10);

  const safeName = sanitizeFileName(customerName);
  const safeVehicleCode = sanitizeFileName(vehicleCode);
  const safePlate = sanitizeFileName(plate);

  return `${contractNumber}_${pickupDate}_${safeName}_${safeVehicleCode}_${safePlate}_NEXA_RENTALS.pdf`;
}

function buildDateTime(date?: string, time?: string) {
  if (!date || !time) return null;

  const value = new Date(`${date}T${time}`);

  if (Number.isNaN(value.getTime())) return null;

  return value;
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

  return { start, end };
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
  if (!booking.contractData.email) return "Missing email.";
  if (!booking.contractData.direccion) return "Missing address.";
  if (!booking.contractData.permisoConducir) return "Missing driving license.";
  if (!booking.contractData.paisExpedicion) return "Missing license country.";
  if (!booking.contractData.fechaCaducidad) return "Missing license expiry date.";

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

  const conflict = existingBookings.find((existingBooking) => {
    if (!existingBooking) return false;
    if (isCancelledOrFinished(existingBooking)) return false;

    const existingVehicleCode = existingBooking?.vehicle?.codigo;

    if (existingVehicleCode !== vehicleCode) return false;

    const existingRange = getBookingRange(existingBooking);

    if (!existingRange) return false;

    return isOverlapping(
      newRange.start,
      newRange.end,
      existingRange.start,
      existingRange.end
    );
  });

  if (!conflict) return null;

  const conflictRange = getBookingRange(conflict);

  return {
    booking: conflict,
    returnDate: conflictRange?.end || null,
  };
}

function bufferToBase64(buffer: Buffer) {
  return buffer.toString("base64");
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const booking = body.booking as BookingLike;
    const existingBookings = Array.isArray(body.existingBookings)
      ? (body.existingBookings as BookingLike[])
      : [];

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

    const overlapConflict = checkVehicleOverlap(booking, existingBookings);

    if (overlapConflict) {
      const vehicleCode = booking?.vehicle?.codigo || "este vehículo";
      const conflictReturn = overlapConflict.returnDate
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
          },
        },
        { status: 409 }
      );
    }

    const fileName = createContractFileName(booking);

    const pdfDocument = React.createElement(NexaContractPDF as any, {
  booking: booking as any,
});

    const pdfStream = await renderToStream(pdfDocument as any);
    const pdfBuffer = await streamToBuffer(pdfStream as NodeJS.ReadableStream);

    const driveResult = await uploadContractPdfToGoogleDrive({
      fileName,
      pdfBuffer,
    });

    return NextResponse.json({
      ok: true,
      fileName,
      pdfBase64: bufferToBase64(pdfBuffer),
      drive: driveResult,
    });
  } catch (error: any) {
    console.error("Contract generation error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to generate contract PDF.",
      },
      { status: 500 }
    );
  }
}