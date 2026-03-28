import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "booking-documents";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadOne(
  bookingId: string,
  label: string,
  file: File | null
): Promise<{ path: string; name: string }> {
  if (!file) return { path: "", name: "" };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const safeName = sanitizeFileName(file.name || `${label}.bin`);
  const path = `${bookingId}/${label}-${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`${label} upload failed: ${error.message}`);
  }

  return {
    path,
    name: file.name || safeName,
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const bookingId = String(formData.get("bookingId") || "").trim();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    const dlFront = formData.get("dlFront");
    const dlBack = formData.get("dlBack");
    const idFront = formData.get("idFront");
    const idBack = formData.get("idBack");

    const dlFrontFile = dlFront instanceof File ? dlFront : null;
    const dlBackFile = dlBack instanceof File ? dlBack : null;
    const idFrontFile = idFront instanceof File ? idFront : null;
    const idBackFile = idBack instanceof File ? idBack : null;

    const [dlFrontRes, dlBackRes, idFrontRes, idBackRes] = await Promise.all([
      uploadOne(bookingId, "dl-front", dlFrontFile),
      uploadOne(bookingId, "dl-back", dlBackFile),
      uploadOne(bookingId, "id-front", idFrontFile),
      uploadOne(bookingId, "id-back", idBackFile),
    ]);

    return NextResponse.json({
      success: true,

      dlFrontPath: dlFrontRes.path,
      dlBackPath: dlBackRes.path,
      idFrontPath: idFrontRes.path,
      idBackPath: idBackRes.path,

      dlFrontName: dlFrontRes.name,
      dlBackName: dlBackRes.name,
      idFrontName: idFrontRes.name,
      idBackName: idBackRes.name,
    });
  } catch (error: any) {
    console.error("UPLOAD BOOKING DOCUMENTS ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}