import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import NexaContractPDF from "@/app/components/contracts/NexaContractPDF";
import { normalizeBookingForContractPdf } from "@/lib/contractBookingNormalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTRACT_LOGO_PATH = "public/images/nexa-logo.png";

export async function GET() {
  const contractLogoPath = path.join(process.cwd(), CONTRACT_LOGO_PATH);
  const logos = {
    path: CONTRACT_LOGO_PATH,
    exists: fs.existsSync(contractLogoPath),
    usedInContracts: true,
  };

  const googleDrive = {
    clientId: Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID?.trim()),
    clientSecret: Boolean(process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim()),
    refreshToken: Boolean(process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim()),
    contractsFolderId: Boolean(process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID?.trim()),
    contractsFolderName:
      process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_NAME?.trim() ||
      "NEXA Rentals Contract",
  };

  const supabase = {
    url: Boolean(
      process.env.SUPABASE_URL?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    ),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  };

  let pdfTest: { ok: boolean; bytes?: number; error?: string } = { ok: false };

  try {
    const booking = normalizeBookingForContractPdf({
      id: "NX-DIAGNOSE",
      contractData: { numeroContrato: "NX-DIAGNOSE", nombreCliente: "Diagnose" },
      vehicle: { codigo: "N1", matricula: "0000XXX" },
    });

    const doc = React.createElement(NexaContractPDF, {
      booking: booking as any,
    });

    const buffer = await renderToBuffer(doc as any);
    pdfTest = { ok: buffer.length > 0, bytes: buffer.length };
  } catch (error: any) {
    pdfTest = { ok: false, error: error?.message || "PDF render failed" };
  }

  return NextResponse.json({
    ok: pdfTest.ok,
    message: pdfTest.ok
      ? "PDF engine works on this server."
      : "PDF engine FAILED — fix this before contracts will work.",
    logos,
    googleDrive,
    supabase,
    pdfTest,
    deployedFix: "Contract PDF uses public/images/nexa-logo.png",
  });
}
