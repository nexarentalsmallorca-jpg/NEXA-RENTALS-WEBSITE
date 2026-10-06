import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

type CustomerDocumentAutofill = {
  nombreCliente?: string;
  dniPasaporte?: string;
  direccion?: string;
  permisoConducir?: string;
  paisExpedicion?: string;
  fechaCaducidad?: string;
};

type CustomerDocumentFile = {
  id: string;
  originalName: string;
  storedName?: string;
  mimeType: string;
  size: number;
  kind?:
    | "passport"
    | "identity"
    | "driving_licence"
    | "other"
    | "unknown";
  side?: "front" | "back" | "photo_page" | "unknown";
  tempPath?: string;
};

type CustomerDocumentBundle = {
  sessionId: string;
  files: CustomerDocumentFile[];
  autofill?: CustomerDocumentAutofill;
  analyzedAt?: string;
  warnings?: string[];
};

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
  bundle: CustomerDocumentBundle | null;
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
  const path = getSessionManifestPath(sessionToken);

  const { data, error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .download(path);

  if (error || !data) {
    return null;
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as MobileSessionManifest;
    return parsed;
  } catch {
    return null;
  }
}

async function saveManifest(manifest: MobileSessionManifest) {
  const path = getSessionManifestPath(manifest.sessionToken);

  const payload = Buffer.from(
    JSON.stringify(manifest, null, 2),
    "utf-8",
  );

  const { error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .upload(path, payload, {
      contentType: "application/json",
      upsert: true,
      cacheControl: "no-store",
    });

  if (error) {
    throw new Error(
      `Could not update mobile document session: ${error.message}`,
    );
  }
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

    const now = Date.now();
    const expiresAt = new Date(
      manifest.expiresAt,
    ).getTime();

    if (
      Number.isFinite(expiresAt) &&
      now > expiresAt &&
      manifest.status !== "expired"
    ) {
      manifest.status = "expired";
      manifest.updatedAt = new Date().toISOString();

      await saveManifest(manifest);
    }

    return NextResponse.json({
      ok: true,
      success: true,
      status: manifest.status,
      uploadedCount: manifest.uploadedCount,
      expiresAt: manifest.expiresAt,
      bundle: manifest.bundle,
    });
  } catch (error: any) {
    console.error("MOBILE DOCUMENT SESSION STATUS ERROR", {
      name: cleanText(error?.name),
      message: cleanText(error?.message).slice(0, 350),
    });

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error:
          error?.message ||
          "Could not read the mobile document session.",
      },
      { status: 500 },
    );
  }
}
