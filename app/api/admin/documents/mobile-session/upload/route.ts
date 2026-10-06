import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;

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

type AnalyzeResponse = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  sessionId?: string;
  files?: CustomerDocumentFile[];
  autofill?: CustomerDocumentAutofill;
  warnings?: string[];
  analyzedAt?: string;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function safeFileName(value: string) {
  const clean = cleanText(value || "document")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[-_.\s]+|[-_.\s]+$/g, "")
    .slice(0, 120);

  return clean || "document";
}

function extensionFromName(name: string) {
  return cleanText(name).toLowerCase().split(".").pop() || "";
}

function mimeFromFile(file: File) {
  const type = cleanText(file.type).toLowerCase();
  if (type) return type;

  const ext = extensionFromName(file.name);

  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  if (ext === "pdf") return "application/pdf";

  return "application/octet-stream";
}

function isAllowedFile(file: File) {
  const mime = mimeFromFile(file);
  const ext = extensionFromName(file.name);

  return (
    [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/pdf",
    ].includes(mime) ||
    ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"].includes(ext)
  );
}

function randomId(prefix = "file") {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getManifestPath(token: string) {
  return `mobile-sessions/${token}/session.json`;
}

async function readManifest(
  token: string,
): Promise<MobileSessionManifest | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .download(getManifestPath(token));

  if (error || !data) return null;

  try {
    return JSON.parse(await data.text()) as MobileSessionManifest;
  } catch {
    return null;
  }
}

async function saveManifest(manifest: MobileSessionManifest) {
  const payload = Buffer.from(JSON.stringify(manifest, null, 2), "utf-8");

  const { error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .upload(getManifestPath(manifest.sessionToken), payload, {
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

async function savePhoneFile({
  token,
  file,
  index,
}: {
  token: string;
  file: File;
  index: number;
}) {
  const storedName = `${String(index + 1).padStart(2, "0")}_${safeFileName(
    file.name,
  )}`;

  const tempPath = `mobile-sessions/${token}/uploads/${storedName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = mimeFromFile(file);

  const { error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .upload(tempPath, buffer, {
      contentType: mimeType,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(
      `Could not save "${file.name}": ${error.message}`,
    );
  }

  return {
    id: randomId(),
    originalName: file.name,
    storedName,
    mimeType,
    size: file.size,
    tempPath,
    uploadedAt: new Date().toISOString(),
  };
}

async function analyzeFiles(
  request: NextRequest,
  manifest: MobileSessionManifest,
  files: File[],
) {
  const formData = new FormData();

  formData.append("contractNumber", manifest.contractNumber || "");
  formData.append("vehicleCode", manifest.vehicleCode || "");

  for (const file of files) {
    formData.append("documents", file, file.name);
  }

  const analyzeUrl = new URL(
    "/api/admin/documents/analyze",
    request.url,
  );

  const response = await fetch(analyzeUrl, {
    method: "POST",
    body: formData,
  });

  const rawText = await response.text();

  let data: AnalyzeResponse = {};

  try {
    data = rawText ? (JSON.parse(rawText) as AnalyzeResponse) : {};
  } catch {
    throw new Error(
      response.ok
        ? "The AI analysis route returned an invalid response."
        : `AI analysis failed (${response.status}).`,
    );
  }

  if (!response.ok || (!data.ok && !data.success)) {
    throw new Error(
      data.error ||
        `AI analysis failed (${response.status}).`,
    );
  }

  if (!data.sessionId) {
    throw new Error(
      "AI analysis completed without returning a document session ID.",
    );
  }

  const bundle: CustomerDocumentBundle = {
    sessionId: data.sessionId,
    files: Array.isArray(data.files) ? data.files : [],
    autofill: data.autofill || {},
    analyzedAt: data.analyzedAt || new Date().toISOString(),
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
  };

  return bundle;
}

export async function POST(request: NextRequest) {
  let manifest: MobileSessionManifest | null = null;

  try {
    const form = await request.formData();

    const token = cleanText(form.get("token"));

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Missing mobile session token.",
        },
        { status: 400 },
      );
    }

    manifest = await readManifest(token);

    if (!manifest) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "Mobile document session not found.",
        },
        { status: 404 },
      );
    }

    const expiresAt = new Date(manifest.expiresAt).getTime();

    if (
      Number.isFinite(expiresAt) &&
      Date.now() > expiresAt
    ) {
      manifest.status = "expired";
      manifest.updatedAt = new Date().toISOString();
      await saveManifest(manifest);

      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "This QR session has expired. Generate a new QR from NEXA OS.",
        },
        { status: 410 },
      );
    }

    const rawFiles = form.getAll("documents");
    const files = rawFiles.filter(
      (value): value is File => value instanceof File,
    );

    if (!files.length) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "No documents were selected.",
        },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: `Maximum ${MAX_FILES} files per upload.`,
        },
        { status: 400 },
      );
    }

    let totalBytes = 0;

    for (const file of files) {
      if (!isAllowedFile(file)) {
        return NextResponse.json(
          {
            ok: false,
            success: false,
            error: `Unsupported file: ${file.name}.`,
          },
          { status: 400 },
        );
      }

      if (file.size <= 0) {
        return NextResponse.json(
          {
            ok: false,
            success: false,
            error: `File is empty: ${file.name}.`,
          },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          {
            ok: false,
            success: false,
            error: `${file.name} is larger than 15 MB.`,
          },
          { status: 400 },
        );
      }

      totalBytes += file.size;
    }

    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          success: false,
          error: "The selected files are too large in total.",
        },
        { status: 400 },
      );
    }

    manifest.status = "uploading";
    manifest.updatedAt = new Date().toISOString();
    await saveManifest(manifest);

    const savedFiles: MobileSessionManifest["uploadedFiles"] = [];

    for (const [index, file] of files.entries()) {
      const saved = await savePhoneFile({
        token,
        file,
        index,
      });

      savedFiles.push(saved);
    }

    manifest.uploadedFiles = savedFiles;
    manifest.uploadedCount = savedFiles.length;
    manifest.status = "processing";
    manifest.updatedAt = new Date().toISOString();
    await saveManifest(manifest);

    const bundle = await analyzeFiles(
      request,
      manifest,
      files,
    );

    manifest.bundle = bundle;
    manifest.status = "ready";
    manifest.updatedAt = new Date().toISOString();
    await saveManifest(manifest);

    // The AI analysis route already stored the final temporary copies referenced
    // by bundle.files[].tempPath. These raw mobile-session upload copies are no
    // longer needed after successful analysis.
    const rawPaths = savedFiles
      .map((file) => file.tempPath)
      .filter(Boolean);

    if (rawPaths.length > 0) {
      const { error: cleanupError } = await supabaseAdmin.storage
        .from(TEMP_BUCKET)
        .remove(rawPaths);

      if (cleanupError) {
        console.warn("MOBILE RAW DOCUMENT CLEANUP WARNING", {
          message: cleanupError.message,
          count: rawPaths.length,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      success: true,
      uploadedCount: savedFiles.length,
      status: manifest.status,
      sessionId: bundle.sessionId,
    });
  } catch (error: any) {
    console.error("MOBILE DOCUMENT UPLOAD ERROR", {
      name: cleanText(error?.name),
      message: cleanText(error?.message).slice(0, 350),
    });

    if (manifest) {
      try {
        manifest.status = "waiting";
        manifest.updatedAt = new Date().toISOString();
        await saveManifest(manifest);
      } catch {
        // Do not mask the original upload/analysis error.
      }
    }

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error:
          error?.message ||
          "Could not upload or analyze the mobile documents.",
      },
      { status: 500 },
    );
  }
}
