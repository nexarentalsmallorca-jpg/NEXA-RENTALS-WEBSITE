import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

const SESSION_TTL_MINUTES = 30;

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
  bundle: null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function createToken() {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now()}${Math.random().toString(36).slice(2, 18)}`;
}

function getSessionManifestPath(sessionToken: string) {
  return `mobile-sessions/${sessionToken}/session.json`;
}

async function ensureTempBucket() {
  const { data: bucket, error: getError } =
    await supabaseAdmin.storage.getBucket(TEMP_BUCKET);

  if (bucket?.id) {
    return;
  }

  if (getError) {
    const message = cleanText(getError.message).toLowerCase();

    if (
      !message.includes("not found") &&
      !message.includes("does not exist") &&
      !message.includes("404")
    ) {
      throw new Error(
        `Could not inspect temporary document bucket: ${getError.message}`,
      );
    }
  }

  const { error: createError } =
    await supabaseAdmin.storage.createBucket(TEMP_BUCKET, {
      public: false,
      fileSizeLimit: 15 * 1024 * 1024,
    });

  if (createError) {
    const message = cleanText(createError.message).toLowerCase();

    if (
      !message.includes("already exists") &&
      !message.includes("duplicate")
    ) {
      throw new Error(
        `Could not create temporary document bucket: ${createError.message}`,
      );
    }
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
      `Could not save mobile document session: ${error.message}`,
    );
  }

  return path;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const contractNumber = cleanText(body?.contractNumber);
    const vehicleCode = cleanText(body?.vehicleCode);

    await ensureTempBucket();

    const sessionToken = createToken();

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + SESSION_TTL_MINUTES * 60 * 1000,
    );

    const manifest: MobileSessionManifest = {
      version: 1,
      sessionToken,
      contractNumber,
      vehicleCode,
      status: "waiting",
      uploadedCount: 0,
      uploadedFiles: [],
      bundle: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    await saveManifest(manifest);

    const mobileUrl = buildMobileUrl(
      request,
      sessionToken,
    );

    return NextResponse.json({
      ok: true,
      success: true,
      sessionToken,
      mobileUrl,
      expiresAt: manifest.expiresAt,
      status: manifest.status,
      uploadedCount: manifest.uploadedCount,
    });
  } catch (error: any) {
    console.error("CREATE MOBILE DOCUMENT SESSION ERROR", {
      name: cleanText(error?.name),
      message: cleanText(error?.message).slice(0, 350),
    });

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error:
          error?.message ||
          "Could not create the mobile document session.",
      },
      { status: 500 },
    );
  }
}
