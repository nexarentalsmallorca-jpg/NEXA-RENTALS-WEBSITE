import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const BUCKET = "booking-documents";

type UploadResult = {
  path: string;
  name: string;
};

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env keys. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local and Vercel."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

async function uploadOne(
  supabase: SupabaseClient,
  bookingId: string,
  label: string,
  file: File | null
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { path: "", name: "" };
  }

  const safeName = sanitizeFileName(file.name || `${label}.bin`);
  const path = `${bookingId}/${label}-${Date.now()}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
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
    const supabase = getSupabaseAdmin();

    const formData = await req.formData();
    const bookingId = String(formData.get("bookingId") || "").trim();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Missing bookingId" },
        { status: 400 }
      );
    }

    const dlFrontValue = formData.get("dlFront");
    const dlBackValue = formData.get("dlBack");
    const idFrontValue = formData.get("idFront");
    const idBackValue = formData.get("idBack");

    const dlFrontFile = isUploadFile(dlFrontValue) ? dlFrontValue : null;
    const dlBackFile = isUploadFile(dlBackValue) ? dlBackValue : null;
    const idFrontFile = isUploadFile(idFrontValue) ? idFrontValue : null;
    const idBackFile = isUploadFile(idBackValue) ? idBackValue : null;

    const [dlFrontRes, dlBackRes, idFrontRes, idBackRes] =
      await Promise.all([
        uploadOne(supabase, bookingId, "dl-front", dlFrontFile),
        uploadOne(supabase, bookingId, "dl-back", dlBackFile),
        uploadOne(supabase, bookingId, "id-front", idFrontFile),
        uploadOne(supabase, bookingId, "id-back", idBackFile),
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
      {
        success: false,
        error:
          error?.message ||
          "Upload failed. Please try again or continue without documents.",
      },
      { status: 500 }
    );
  }
}