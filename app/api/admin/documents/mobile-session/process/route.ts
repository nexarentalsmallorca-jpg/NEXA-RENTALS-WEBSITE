import { NextRequest, NextResponse } from "next/server";
import {
  createHmac,
  timingSafeEqual,
} from "crypto";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { POST as analyzeDocuments } from "@/app/api/admin/documents/analyze/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const ADMIN_COOKIE_NAME = "nexa_admin_session";

const BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;

type UploadedFile = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  tempPath: string;
  uploadedAt: string;
};

type DocumentBundle = {
  sessionId: string;
  files: Array<{
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
  }>;
  autofill?: {
    nombreCliente?: string;
    dniPasaporte?: string;
    direccion?: string;
    permisoConducir?: string;
    paisExpedicion?: string;
    fechaCaducidad?: string;
  };
  analyzedAt?: string;
  warnings?: string[];
};

type Manifest = {
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
  uploadedFiles: UploadedFile[];
  bundle: DocumentBundle | null;
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
    { status },
  );
}

/*
  Verify the same signed admin session
  created by app/api/admin/login/route.ts.

  Format:
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

async function loadManifest(
  token: string,
): Promise<Manifest | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(manifestPath(token));

  if (error || !data) {
    return null;
  }

  try {
    return JSON.parse(await data.text()) as Manifest;
  } catch {
    return null;
  }
}

async function saveManifest(manifest: Manifest) {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(
      manifestPath(manifest.sessionToken),
      Buffer.from(JSON.stringify(manifest)),
      {
        contentType: "application/json",
        upsert: true,
        cacheControl: "no-store",
      },
    );

  if (error) {
    throw new Error(
      `Could not save document session: ${error.message}`,
    );
  }
}

export async function POST(request: NextRequest) {
  // Verify authentication before reading session data.
  if (!verifyAdminSession(request)) {
    return jsonError(
      "Admin session expired or invalid. Please log in again.",
      401,
    );
  }

  let token = "";

  try {
    const body = await request.json().catch(() => null);

    token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    if (!/^[a-f0-9]{32}$/.test(token)) {
      return jsonError("Invalid QR session token.", 400);
    }

    const manifest = await loadManifest(token);

    if (!manifest || manifest.sessionToken !== token) {
      return jsonError("QR session not found.", 404);
    }

    const expiresAt = Date.parse(manifest.expiresAt);

    if (
      !Number.isFinite(expiresAt) ||
      Date.now() >= expiresAt
    ) {
      return jsonError(
        "QR session expired. Generate a new QR.",
        410,
      );
    }

    if (manifest.status === "ready" && manifest.bundle) {
      return NextResponse.json({
        ok: true,
        success: true,
        status: "ready",
        sessionId: manifest.bundle.sessionId,
      });
    }

    if (manifest.status !== "processing") {
      return jsonError(
        "Documents have not finished uploading.",
        409,
      );
    }

    const uploadedFiles = manifest.uploadedFiles;

    if (
      !Array.isArray(uploadedFiles) ||
      uploadedFiles.length === 0 ||
      uploadedFiles.length > MAX_FILES
    ) {
      return jsonError(
        "No valid uploaded documents were found.",
        400,
      );
    }

    let totalBytes = 0;

    const form = new FormData();

    form.set(
      "contractNumber",
      manifest.contractNumber || "",
    );

    form.set(
      "vehicleCode",
      manifest.vehicleCode || "",
    );

    /*
      Download files previously uploaded
      from the phone.

      Never trust arbitrary storage paths
      provided by session metadata.
    */
    for (const file of uploadedFiles) {
      const allowedPrefix =
        `mobile-sessions/${token}/uploads/`;

      if (
        !file.tempPath ||
        !file.tempPath.startsWith(allowedPrefix)
      ) {
        throw new Error("Invalid document storage path.");
      }

      if (
        !Number.isFinite(file.size) ||
        file.size <= 0 ||
        file.size > MAX_FILE_BYTES
      ) {
        throw new Error("Invalid document size.");
      }

      totalBytes += file.size;

      if (totalBytes > MAX_TOTAL_BYTES) {
        throw new Error(
          "Documents exceed the total size limit.",
        );
      }

      const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .download(file.tempPath);

      if (error || !data) {
        throw new Error(
          "Could not retrieve an uploaded document.",
        );
      }

      const buffer = await data.arrayBuffer();

      if (buffer.byteLength !== file.size) {
        throw new Error(
          "Uploaded document size does not match.",
        );
      }

      form.append(
        "documents",
        new File(
          [buffer],
          file.originalName || file.storedName,
          {
            type:
              file.mimeType ||
              "application/octet-stream",
          },
        ),
      );
    }

    /*
      Run the existing AI scanner directly.

      This avoids making a second HTTP
      request through the admin middleware.
    */
    const analysisRequest = new Request(
      new URL("/api/admin/documents/analyze", request.url),
      {
        method: "POST",
        body: form,
      },
    );

    const response = await analyzeDocuments(analysisRequest);

    const result = await response.json().catch(() => null);

    if (
      !response.ok ||
      (!result?.ok && !result?.success) ||
      !result?.sessionId
    ) {
      throw new Error(
        typeof result?.error === "string"
          ? result.error
          : "Document AI analysis failed.",
      );
    }

    /*
      Reload the session before saving
      the AI result.
    */
    const latest = await loadManifest(token);

    if (!latest || latest.status !== "processing") {
      return jsonError(
        "QR session changed during analysis.",
        409,
      );
    }

    const nextBundle: DocumentBundle = {
      sessionId: result.sessionId,
      files: Array.isArray(result.files)
        ? result.files
        : [],
      autofill: result.autofill || {},
      warnings: Array.isArray(result.warnings)
        ? result.warnings
        : [],
      analyzedAt:
        result.analyzedAt || new Date().toISOString(),
    };

    latest.bundle = nextBundle;
    latest.status = "ready";
    latest.updatedAt = new Date().toISOString();

    await saveManifest(latest);

    /*
      Remove redundant phone uploads only
      after the AI bundle is safely saved.

      The analyze route's own temporary files
      remain available for contract generation.
    */
    const rawPaths = latest.uploadedFiles
      .map((file) => file.tempPath)
      .filter(Boolean);

    if (rawPaths.length) {
      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .remove(rawPaths);

      if (error) {
        console.warn(
          "MOBILE DOCUMENT CLEANUP WARNING",
          error.message,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      success: true,
      status: "ready",
      sessionId: nextBundle.sessionId,
    });
  } catch (error) {
    console.error(
      "MOBILE DOCUMENT PROCESS ERROR:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    /*
      Keep original phone documents
      in storage if AI processing fails.
    */
    return jsonError(
      "AI processing failed. Uploaded photos are saved. Please retry.",
      500,
    );
  }
}