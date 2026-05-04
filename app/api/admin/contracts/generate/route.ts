import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import NexaContractPDF from "../../../../components/contracts/NexaContractPDF";
import { uploadContractPdfToGoogleDrive } from "../../../../../lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function createContractFileName(booking: any) {
  const contractNumber =
    booking?.contractData?.numeroContrato || booking?.id || "NX-CONTRACT";

  const customerName = booking?.contractData?.nombreCliente || "Cliente";
  const vehicleCode = booking?.vehicle?.codigo || "Vehiculo";
  const plate = booking?.vehicle?.matricula || "Matricula";

  const pickupDate =
    booking?.contractData?.fechaEntrega || new Date().toISOString().slice(0, 10);

  const safeName = sanitizeFileName(customerName);

  return `${contractNumber}_${pickupDate}_${safeName}_${vehicleCode}_${plate}_NEXA_RENTALS.pdf`;
}

function validateBooking(booking: any) {
  if (!booking) return "Missing booking data.";
  if (!booking.vehicle) return "Missing vehicle data.";
  if (!booking.contractData) return "Missing contract data.";
  if (!booking.contractData.numeroContrato) return "Missing contract number.";
  if (!booking.contractData.nombreCliente) return "Missing customer name.";
  if (!booking.vehicle.matricula) return "Missing vehicle plate.";

  return null;
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
    const booking = body.booking;

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

    const fileName = createContractFileName(booking);

    const pdfDocument = React.createElement(NexaContractPDF, {
      booking,
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