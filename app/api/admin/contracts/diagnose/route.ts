import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import fs from "node:fs";
import path from "node:path";
import NexaContractPDF from "@/app/components/contracts/NexaContractPDF";
import { normalizeBookingForContractPdf } from "@/lib/contractBookingNormalize";
import {
  getGoogleDriveEnvStatus,
  GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT,
  GOOGLE_DRIVE_SCOPE,
  verifyGoogleDriveOAuth,
} from "@/lib/googleDriveOAuth";
import { uploadContractPdfToGoogleDrive } from "@/lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CONTRACT_LOGO_PATH = "public/images/nexa-logo.png";

export async function GET() {
  const contractLogoPath = path.join(process.cwd(), CONTRACT_LOGO_PATH);
  const logos = {
    path: CONTRACT_LOGO_PATH,
    exists: fs.existsSync(contractLogoPath),
    usedInContracts: true,
  };

  const googleDrive = {
    ...getGoogleDriveEnvStatus(),
    contractsFolderName:
      process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_NAME?.trim() ||
      "NEXA Rentals Contract",
    requiredScope: GOOGLE_DRIVE_SCOPE,
    oauthPlaygroundRedirect: GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT,
  };

  const oauthTest = await verifyGoogleDriveOAuth();

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

  let driveUploadTest: {
    ok: boolean;
    skipped?: boolean;
    error?: string;
    folderLink?: string | null;
    fileLink?: string | null;
  } = { ok: false, skipped: true };

  if (oauthTest.ok) {
    try {
      const fileName = `NEXA_DIAGNOSE_${Date.now()}.pdf`;
      const result = await uploadContractPdfToGoogleDrive({
        fileName,
        pdfBuffer: Buffer.from(
          `%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF`
        ),
        customerFolderName: fileName.replace(/\.pdf$/i, ""),
        contractNumber: "NX-DIAGNOSE",
      });

      driveUploadTest = {
        ok: Boolean(result.uploaded),
        error: result.failed
          ? result.reason || result.error || "Drive upload failed"
          : undefined,
        folderLink: result.folderWebViewLink,
        fileLink: result.webViewLink,
      };
    } catch (error: any) {
      driveUploadTest = {
        ok: false,
        error: error?.message || "Drive upload test failed",
      };
    }
  } else {
    driveUploadTest = {
      ok: false,
      skipped: true,
      error: oauthTest.error,
    };
  }

  const allOk = pdfTest.ok && oauthTest.ok && driveUploadTest.ok;

  return NextResponse.json({
    ok: allOk,
    message: allOk
      ? "PDF + Google OAuth + Drive upload all work on this server."
      : oauthTest.ok
        ? "OAuth works but check pdfTest or driveUploadTest."
        : "Fix Google Drive OAuth (invalid_grant) — see oauthTest.error and oauthTest.hint.",
    logos,
    googleDrive,
    oauthTest,
    driveUploadTest,
    supabase,
    pdfTest,
    deployedFix: "Contract PDF uses public/images/nexa-logo.png",
  });
}
