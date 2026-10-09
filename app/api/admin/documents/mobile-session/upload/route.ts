import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BUCKET = process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() || "nexa-customer-documents-temp";
const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;
const MIME: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", heic: "image/heic", heif: "image/heif", pdf: "application/pdf",
};

type UploadedFile = {
  id: string; originalName: string; storedName: string;
  mimeType: string; size: number; tempPath: string; uploadedAt: string;
};
type Manifest = {
  version: 1; sessionToken: string; contractNumber: string; vehicleCode: string;
  status: "waiting" | "uploading" | "processing" | "ready" | "expired";
  uploadedCount: number; uploadedFiles: UploadedFile[];
  bundle: unknown | null; createdAt: string; updatedAt: string; expiresAt: string;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ ok: false, success: false, error: message }, { status });
}
function manifestPath(token: string) {
  return `mobile-sessions/${token}/session.json`;
}
async function readManifest(token: string): Promise<Manifest | null> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(manifestPath(token));
  if (error || !data) return null;
  try { return JSON.parse(await data.text()) as Manifest; } catch { return null; }
}
async function saveManifest(manifest: Manifest) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(
    manifestPath(manifest.sessionToken),
    Buffer.from(JSON.stringify(manifest)),
    { contentType: "application/json", upsert: true, cacheControl: "no-store" },
  );
  if (error) throw new Error(`Unable to save session status: ${error.message}`);
}
function safeName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 90) || "document";
}
async function storeFile(token: string, file: File): Promise<UploadedFile> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const mimeType = MIME[extension];
  const id = randomUUID();
  const storedName = `${id}_${safeName(file.name)}`;
  const tempPath = `mobile-sessions/${token}/uploads/${storedName}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(
    tempPath, Buffer.from(await file.arrayBuffer()),
    { contentType: mimeType, upsert: false, cacheControl: "no-store" },
  );
  if (error) throw new Error(`Unable to store ${file.name}: ${error.message}`);
  return { id, originalName: file.name, storedName, mimeType,
    size: file.size, tempPath, uploadedAt: new Date().toISOString() };
}

export async function POST(request: NextRequest) {
  let saved: UploadedFile[] = [];
  let token = "";
  let manifest: Manifest | null = null;
  try {
    const form = await request.formData();
    token = String(form.get("token") || "").trim();
    if (!/^[a-f0-9]{32}$/.test(token)) return errorResponse("Invalid QR session token.", 400);
    manifest = await readManifest(token);
    if (!manifest || manifest.sessionToken !== token) return errorResponse("QR session not found.", 404);
    const expiry = Date.parse(manifest.expiresAt);
    if (!Number.isFinite(expiry) || Date.now() >= expiry) return errorResponse("QR session expired. Refresh the QR.", 410);
    if (manifest.status !== "waiting") return errorResponse("This QR session has already received documents. Generate a new QR.", 409);

    const files = form.getAll("documents").filter((v): v is File => v instanceof File);
    if (!files.length || files.length > MAX_FILES) return errorResponse("Choose 1 to 30 documents.", 400);
    let total = 0;
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!MIME[ext]) return errorResponse(`Unsupported document type: ${file.name}`, 400);
      if (file.size <= 0 || file.size > MAX_FILE_BYTES) return errorResponse(`Invalid size for ${file.name} (maximum 15 MB).`, 400);
      total += file.size;
    }
    if (total > MAX_TOTAL_BYTES) return errorResponse("Maximum combined upload is 80 MB.", 400);

    manifest.status = "uploading";
    manifest.updatedAt = new Date().toISOString();
    await saveManifest(manifest);

    // A small concurrency limit speeds up multiple photos without exhausting memory.
    for (let i = 0; i < files.length; i += 3) {
      const batch = await Promise.allSettled(files.slice(i, i + 3).map(file => storeFile(token, file)));
      for (const result of batch) if (result.status === "fulfilled") saved.push(result.value);
      const failure = batch.find(result => result.status === "rejected");
      if (failure && failure.status === "rejected") throw failure.reason;
    }

    manifest.uploadedFiles = saved;
    manifest.uploadedCount = saved.length;
    manifest.bundle = null;
    manifest.status = "processing";
    manifest.updatedAt = new Date().toISOString();
    await saveManifest(manifest);

    // Analysis is intentionally NOT called here. The next worker route will
    // process these stored files and publish the bundle to this manifest.
    return NextResponse.json({ ok: true, success: true, uploadedCount: saved.length,
      status: "processing", sessionId: token });
  } catch (error) {
    console.error("MOBILE DOCUMENT UPLOAD ERROR", {
      message: error instanceof Error ? error.message.slice(0, 250) : "Unknown error",
    });
    if (saved.length) {
      await supabaseAdmin.storage.from(BUCKET).remove(saved.map(file => file.tempPath)).catch(() => null);
    }
    if (manifest && manifest.status !== "ready") {
      try {
        manifest.status = "waiting";
        manifest.uploadedFiles = [];
        manifest.uploadedCount = 0;
        manifest.updatedAt = new Date().toISOString();
        await saveManifest(manifest);
      } catch { /* Preserve original error. */ }
    }
    return errorResponse("Document upload failed. Please try again.", 500);
  }
}
