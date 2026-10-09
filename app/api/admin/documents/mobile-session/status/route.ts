import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

const ADMIN_COOKIE_NAME = "nexa_admin_session";

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
  status:
    | "waiting"
    | "uploading"
    | "processing"
    | "ready"
    | "expired";
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

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      ok: false,
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

/*
  Validate the signed admin session.

  This matches:
  app/api/admin/login/route.ts

  Session format:
  v1.expiration.nonce.signature
*/
function verifyAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(
    ADMIN_COOKIE_NAME,
  )?.value;

  const secret = process.env.NEXA_ADMIN_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const [version, expiresText, nonce, signatureHex] = parts;

  if (version !== "v1") return false;

  if (!/^\d+$/.test(expiresText)) return false;

  if (!/^[a-f0-9]{32}$/.test(nonce)) return false;

  if (!/^[a-f0-9]{64}$/.test(signatureHex)) return false;

  const expiresAt = Number(expiresText);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now
  ) {
    return false;
  }

  try {
    const payload = `${version}.${expiresText}.${nonce}`;

    const expectedSignature = createHmac(
      "sha256",
      secret,
    )
      .update(payload)
      .digest();

    const receivedSignature = Buffer.from(
      signatureHex,
      "hex",
    );

    return (
      expectedSignature.length === receivedSignature.length &&
      timingSafeEqual(
        expectedSignature,
        receivedSignature,
      )
    );
  } catch {
    return false;
  }
}

function manifestPath(token: string) {
  return `mobile-sessions/${token}/session.json`;
}

async function readManifest(
  token: string,
): Promise<MobileSessionManifest | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .download(manifestPath(token));

  if (error || !data) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      await data.text(),
    ) as MobileSessionManifest;

    if (
      parsed.version !== 1 ||
      parsed.sessionToken !== token
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function saveManifest(
  manifest: MobileSessionManifest,
) {
  const payload = Buffer.from(
    JSON.stringify(manifest),
    "utf-8",
  );

  const { error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .upload(
      manifestPath(manifest.sessionToken),
      payload,
      {
        contentType: "application/json",
        upsert: true,
        cacheControl: "no-store",
      },
    );

  if (error) {
    throw new Error(
      `Could not update mobile document session: ${error.message}`,
    );
  }
}

export async function GET(request: NextRequest) {
  /*
    Only a logged-in NEXA administrator
    may retrieve document analysis results.
  */
  if (!verifyAdminSession(request)) {
    return jsonError(
      "Admin session expired or invalid. Please log in again.",
      401,
    );
  }

  try {
    const token = String(
      request.nextUrl.searchParams.get("token") || "",
    ).trim();

    if (!/^[a-f0-9]{32}$/.test(token)) {
      return jsonError(
        "Invalid mobile session token.",
        400,
      );
    }

    const manifest = await readManifest(token);

    if (!manifest) {
      return jsonError(
        "Mobile document session not found.",
        404,
      );
    }

    const expiresAt = Date.parse(manifest.expiresAt);

    if (!Number.isFinite(expiresAt)) {
      return jsonError(
        "Invalid mobile session expiration.",
        500,
      );
    }

    /*
      Preserve an already completed bundle.

      Do not overwrite a successful "ready"
      session just because its QR upload
      window has expired.
    */
    if (
      Date.now() >= expiresAt &&
      manifest.status !== "ready"
    ) {
      if (manifest.status !== "expired") {
        manifest.status = "expired";
        manifest.updatedAt = new Date().toISOString();

        await saveManifest(manifest);
      }
    }

    return NextResponse.json(
      {
        ok: true,
        success: true,
        status: manifest.status,
        uploadedCount: manifest.uploadedCount,
        expiresAt: manifest.expiresAt,
        bundle:
          manifest.status === "ready"
            ? manifest.bundle
            : null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(
      "MOBILE DOCUMENT SESSION STATUS ERROR:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return jsonError(
      "Could not read the mobile document session.",
      500,
    );
  }
}