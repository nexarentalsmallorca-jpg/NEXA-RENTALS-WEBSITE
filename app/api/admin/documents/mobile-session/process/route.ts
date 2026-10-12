
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual, randomUUID } from "crypto";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { analyzeExistingDocuments } from "@/lib/nexaDocumentAnalyzer";

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
const DOWNLOAD_CONCURRENCY = 6;

type UploadedFile = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  tempPath: string;
  uploadedAt?: string;
};

type DocumentBundle = {
  sessionId: string;
  files: Array<{
    id: string;
    originalName: string;
    storedName?: string;
    mimeType: string;
    size: number;
    kind?: string;
    side?: string;
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
  tempBucket?: string;
};

type Manifest = {
  version: number;
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

type ProcessingLock = {
  owner: string;
  startedAt: string;
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

function elapsed(startedAt: number) {
  return Math.round(performance.now() - startedAt);
}

function verifyAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
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

    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest();

    const received = Buffer.from(signatureHex, "hex");

    return (
      expected.length === received.length &&
      timingSafeEqual(expected, received)
    );
  } catch {
    return false;
  }
}

function manifestPath(token: string) {
  return `mobile-sessions/${token}/session.json`;
}

function lockPath(token: string) {
  return `mobile-sessions/${token}/processing.lock`;
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

function validateUploadedFiles(
  files: UploadedFile[],
  token: string,
) {
  if (
    !Array.isArray(files) ||
    files.length === 0 ||
    files.length > MAX_FILES
  ) {
    throw new Error(
      "No valid uploaded documents were found.",
    );
  }

  const allowedPrefix =
    `mobile-sessions/${token}/uploads/`;

  const seenPaths = new Set<string>();
  let totalBytes = 0;

  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/pdf",
  ]);

  for (const file of files) {
    if (
      !file ||
      typeof file.tempPath !== "string" ||
      !file.tempPath.startsWith(allowedPrefix) ||
      file.tempPath
        .slice(allowedPrefix.length)
        .includes("/") ||
      file.tempPath.includes("..")
    ) {
      throw new Error("Invalid document storage path.");
    }

    if (seenPaths.has(file.tempPath)) {
      throw new Error("Duplicate document storage path.");
    }

    seenPaths.add(file.tempPath);

    if (
      !Number.isSafeInteger(file.size) ||
      file.size <= 0 ||
      file.size > MAX_FILE_BYTES
    ) {
      throw new Error("Invalid document size.");
    }

    if (!allowedMimeTypes.has(file.mimeType)) {
      throw new Error("Invalid document format.");
    }

    totalBytes += file.size;

    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error(
        "Documents exceed the total size limit.",
      );
    }
  }
}

async function downloadOneFile(file: UploadedFile) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(file.tempPath);

  if (error || !data) {
    throw new Error(
      "Could not retrieve an uploaded document.",
    );
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  if (buffer.length !== file.size) {
    throw new Error(
      "Uploaded document size does not match.",
    );
  }

  return {
    id: file.id,
    originalName: file.originalName,
    storedName: file.storedName,
    mimeType: file.mimeType,
    size: file.size,
    tempPath: file.tempPath,
    buffer,
  };
}

async function downloadFiles(files: UploadedFile[]) {
  const results = new Array<
    Awaited<ReturnType<typeof downloadOneFile>>
  >(files.length);

  for (
    let start = 0;
    start < files.length;
    start += DOWNLOAD_CONCURRENCY
  ) {
    const batch = files.slice(
      start,
      start + DOWNLOAD_CONCURRENCY,
    );

    const downloaded = await Promise.all(
      batch.map(downloadOneFile),
    );

    downloaded.forEach((file, index) => {
      results[start + index] = file;
    });
  }

  return results;
}

/**
 * Best-effort lock using Supabase Storage.
 *
 * This prevents ordinary simultaneous processing
 * requests, but is not a transactional database lock.
 *
 * A database lease is recommended for production
 * crash recovery.
 */
async function acquireLock(
  token: string,
): Promise<{
  acquired: boolean;
  owner: string;
}> {
  const owner = randomUUID();

  const lock: ProcessingLock = {
    owner,
    startedAt: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(
      lockPath(token),
      Buffer.from(JSON.stringify(lock)),
      {
        contentType: "application/json",
        upsert: false,
        cacheControl: "no-store",
      },
    );

  if (!error) {
    return {
      acquired: true,
      owner,
    };
  }

  const statusCode = String(
    (error as { statusCode?: string | number }).statusCode ??
      "",
  );

  const message = error.message.toLowerCase();

  const duplicate =
    statusCode === "409" ||
    message.includes("already exists") ||
    message.includes("duplicate") ||
    message.includes("resource already exists");

  if (duplicate) {
    return {
      acquired: false,
      owner,
    };
  }

  throw new Error(
    `Could not acquire processing lock: ${error.message}`,
  );
}

async function releaseLock(
  token: string,
  owner: string,
) {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(lockPath(token));

    if (error || !data) {
      return;
    }

    const lock = JSON.parse(
      await data.text(),
    ) as ProcessingLock;

    if (lock.owner !== owner) {
      return;
    }

    const { error: removeError } =
      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([lockPath(token)]);

    if (removeError) {
      console.warn(
        "NEXA PROCESS LOCK RELEASE WARNING",
        removeError.message,
      );
    }
  } catch (error) {
    console.warn(
      "NEXA PROCESS LOCK RELEASE WARNING",
      error instanceof Error ? error.message : "Unknown",
    );
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return jsonError(
      "Admin session expired or invalid. Please log in again.",
      401,
    );
  }

  const startedAt = performance.now();

  let token = "";
  let lockOwner = "";
  let lockAcquired = false;

  try {
    const body = await request.json().catch(() => null);

    token =
      typeof body?.token === "string"
        ? body.token.trim()
        : "";

    if (!/^[a-f0-9]{32}$/.test(token)) {
      return jsonError("Invalid QR session token.", 400);
    }

    const manifestStartedAt = performance.now();
    const manifest = await loadManifest(token);

    if (!manifest || manifest.sessionToken !== token) {
      return jsonError("QR session not found.", 404);
    }

    if (
      !Number.isFinite(Date.parse(manifest.expiresAt)) ||
      Date.now() >= Date.parse(manifest.expiresAt)
    ) {
      return jsonError(
        "QR session expired. Generate a new QR.",
        410,
      );
    }

    if (
      manifest.status === "ready" &&
      manifest.bundle
    ) {
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

    validateUploadedFiles(
      manifest.uploadedFiles,
      token,
    );

    const manifestMs = elapsed(manifestStartedAt);

    const lockStartedAt = performance.now();

    const lock = await acquireLock(token);

    lockOwner = lock.owner;
    lockAcquired = lock.acquired;

    if (!lockAcquired) {
      return NextResponse.json(
        {
          ok: true,
          success: true,
          status: "processing",
          message: "Analysis is already running.",
        },
        { status: 202 },
      );
    }

    const lockMs = elapsed(lockStartedAt);

    // Recheck the session after acquiring the lock.
    const current = await loadManifest(token);

    if (!current || current.sessionToken !== token) {
      return jsonError("QR session not found.", 404);
    }

    if (
      current.status === "ready" &&
      current.bundle
    ) {
      return NextResponse.json({
        ok: true,
        success: true,
        status: "ready",
        sessionId: current.bundle.sessionId,
      });
    }

    if (current.status !== "processing") {
      return jsonError(
        "QR session is not ready for analysis.",
        409,
      );
    }

    validateUploadedFiles(
      current.uploadedFiles,
      token,
    );

    // Download the already uploaded photos.
    // Do not upload another copy to Supabase.
    const downloadStartedAt = performance.now();

    const documents = await downloadFiles(
      current.uploadedFiles,
    );

    const downloadMs = elapsed(downloadStartedAt);

    // Run the shared AI analyzer.
    const analysisStartedAt = performance.now();

    const result = await analyzeExistingDocuments(
      documents,
      `nexa_qr_${token}`,
    );

    const analysisMs = elapsed(analysisStartedAt);

    const latest = await loadManifest(token);

    if (!latest || latest.sessionToken !== token) {
      return jsonError(
        "QR session disappeared during analysis.",
        409,
      );
    }

    if (
      latest.status === "ready" &&
      latest.bundle
    ) {
      return NextResponse.json({
        ok: true,
        success: true,
        status: "ready",
        sessionId: latest.bundle.sessionId,
      });
    }

    if (latest.status !== "processing") {
      return jsonError(
        "QR session changed during analysis.",
        409,
      );
    }

    // Preserve the existing file paths for the
    // Google Drive contract attachment workflow.
    const nextBundle: DocumentBundle = {
      sessionId: result.sessionId,
      files: result.files,
      autofill: result.autofill,
      warnings: result.warnings,
      analyzedAt: result.analyzedAt,
      tempBucket: BUCKET,
    };

    latest.bundle = nextBundle;
    latest.status = "ready";
    latest.updatedAt = new Date().toISOString();

    await saveManifest(latest);

    console.info("NEXA DOCUMENT PROCESS TIMING", {
      fileCount: documents.length,
      totalBytes: documents.reduce(
        (sum, document) => sum + document.size,
        0,
      ),
      manifestMs,
      lockMs,
      downloadMs,
      analysisMs,
      totalMs: elapsed(startedAt),
      duplicateStorageUploads: 0,
    });

    // Do not delete the original QR uploads.
    // Their paths are referenced by the bundle.

    return NextResponse.json({
      ok: true,
      success: true,
      status: "ready",
      sessionId: nextBundle.sessionId,
    });
  } catch (error) {
    console.error("MOBILE DOCUMENT PROCESS ERROR", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
      elapsedMs: elapsed(startedAt),
    });

    return jsonError(
      "AI processing failed. Uploaded photos are saved. Please retry.",
      500,
    );
  } finally {
    if (lockAcquired && token && lockOwner) {
      await releaseLock(token, lockOwner);
    }
  }
}
