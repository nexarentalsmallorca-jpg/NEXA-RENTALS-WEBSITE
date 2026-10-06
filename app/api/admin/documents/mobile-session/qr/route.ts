import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

type MobileSessionManifest = {
  version: 1;
  sessionToken: string;
  contractNumber: string;
  vehicleCode: string;
  status: "waiting" | "uploading" | "processing" | "ready" | "expired";
  uploadedCount: number;
  uploadedFiles: Array<{
    id: string;
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    tempPath: string;
    uploadedAt: string;
  }>;
  bundle: any;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function getSessionManifestPath(sessionToken: string) {
  return `mobile-sessions/${sessionToken}/session.json`;
}

async function readManifest(
  sessionToken: string,
): Promise<MobileSessionManifest | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .download(getSessionManifestPath(sessionToken));

  if (error || !data) {
    return null;
  }

  try {
    return JSON.parse(await data.text()) as MobileSessionManifest;
  } catch {
    return null;
  }
}

function buildMobileUrl(
  request: NextRequest,
  sessionToken: string,
) {
  const origin = new URL(request.url).origin;

  return `${origin}/document-upload/${encodeURIComponent(
    sessionToken,
  )}`;
}

export async function GET(request: NextRequest) {
  try {
    const token = cleanText(
      request.nextUrl.searchParams.get("token"),
    );

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing mobile session token.",
        },
        { status: 400 },
      );
    }

    const manifest = await readManifest(token);

    if (!manifest) {
      return NextResponse.json(
        {
          ok: false,
          error: "Mobile document session not found.",
        },
        { status: 404 },
      );
    }

    const expiresAt = new Date(
      manifest.expiresAt,
    ).getTime();

    if (
      Number.isFinite(expiresAt) &&
      Date.now() > expiresAt
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Mobile document session expired.",
        },
        { status: 410 },
      );
    }

    const mobileUrl = buildMobileUrl(
      request,
      token,
    );

    const png = await QRCode.toBuffer(
      mobileUrl,
      {
        type: "png",
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
      },
    );

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
        "Content-Disposition": 'inline; filename="nexa-document-upload-qr.png"',
      },
    });
  } catch (error: any) {
    console.error("MOBILE DOCUMENT QR ERROR", {
      name: cleanText(error?.name),
      message: cleanText(error?.message).slice(0, 350),
    });

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Could not generate the mobile document QR.",
      },
      { status: 500 },
    );
  }
}
