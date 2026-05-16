import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { uploadContractPdfToGoogleDrive } from "@/lib/googleDrive";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "booking-documents";

type UploadResult = {
  path: string;
  name: string;
};

function sanitizeFileName(name: string) {
  return String(name || "file")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180);
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
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

async function uploadContractPdfToSupabase(
  supabase: SupabaseClient,
  bookingId: string,
  file: File | null
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { path: "", name: "" };
  }

  const safeName = sanitizeFileName(file.name || "contract.pdf");
  const finalName = safeName.toLowerCase().endsWith(".pdf")
    ? safeName
    : `${safeName}.pdf`;

  const path = `${bookingId}/contract-${Date.now()}-${finalName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (error) {
    throw new Error(`contract PDF Supabase upload failed: ${error.message}`);
  }

  return {
    path,
    name: file.name || finalName,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseAdmin();

    const formData = await req.formData();

    const bookingId = cleanText(formData.get("bookingId"));

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: "Missing bookingId" },
        { status: 400 }
      );
    }

    const customerName = cleanText(formData.get("customerName"));
    const contractDate = cleanText(formData.get("contractDate"));
    const contractNumber = cleanText(formData.get("contractNumber"));
    const vehicleCode = cleanText(formData.get("vehicleCode"));
    const vehiclePlate = cleanText(formData.get("vehiclePlate"));
    const customerFolderName = cleanText(formData.get("customerFolderName"));
    const folderName = cleanText(formData.get("folderName"));

    const dlFrontValue = formData.get("dlFront");
    const dlBackValue = formData.get("dlBack");
    const idFrontValue = formData.get("idFront");
    const idBackValue = formData.get("idBack");

    const contractPdfValue =
      formData.get("contractPdf") ||
      formData.get("contract") ||
      formData.get("pdf") ||
      formData.get("file");

    const dlFrontFile = isUploadFile(dlFrontValue) ? dlFrontValue : null;
    const dlBackFile = isUploadFile(dlBackValue) ? dlBackValue : null;
    const idFrontFile = isUploadFile(idFrontValue) ? idFrontValue : null;
    const idBackFile = isUploadFile(idBackValue) ? idBackValue : null;
    const contractPdfFile = isUploadFile(contractPdfValue)
      ? contractPdfValue
      : null;

    const [dlFrontRes, dlBackRes, idFrontRes, idBackRes, contractSupabaseRes] =
      await Promise.all([
        uploadOne(supabase, bookingId, "dl-front", dlFrontFile),
        uploadOne(supabase, bookingId, "dl-back", dlBackFile),
        uploadOne(supabase, bookingId, "id-front", idFrontFile),
        uploadOne(supabase, bookingId, "id-back", idBackFile),
        uploadContractPdfToSupabase(supabase, bookingId, contractPdfFile),
      ]);

    let googleDriveContract: any = {
      uploaded: false,
      skipped: true,
      failed: false,
      reason: "No contract PDF file was sent to the upload API.",
      fileId: null,
      fileName: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      folderName: null,
      folderWebViewLink: null,
      parentFolderId: null,
    };

    if (contractPdfFile && contractPdfFile.size > 0) {
      const arrayBuffer = await contractPdfFile.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      const finalPdfName =
        contractPdfFile.name && contractPdfFile.name.toLowerCase().endsWith(".pdf")
          ? contractPdfFile.name
          : `${contractNumber || bookingId || "NEXA_CONTRACT"}.pdf`;

      googleDriveContract = await uploadContractPdfToGoogleDrive({
        fileName: finalPdfName,
        pdfBuffer,
        folderName: folderName || undefined,
        customerFolderName: customerFolderName || undefined,
        customerName: customerName || undefined,
        contractDate: contractDate || undefined,
        contractNumber: contractNumber || bookingId || undefined,
        vehicleCode: vehicleCode || undefined,
        vehiclePlate: vehiclePlate || undefined,
      });
    }

    console.log("✅ Booking documents upload completed:", {
      bookingId,
      dlFrontPath: dlFrontRes.path,
      dlBackPath: dlBackRes.path,
      idFrontPath: idFrontRes.path,
      idBackPath: idBackRes.path,
      contractSupabasePath: contractSupabaseRes.path,
      googleDriveUploaded: googleDriveContract?.uploaded,
      googleDriveFailed: googleDriveContract?.failed,
      googleDriveReason: googleDriveContract?.reason,
      googleDriveFileLink: googleDriveContract?.webViewLink,
      googleDriveFolderLink: googleDriveContract?.folderWebViewLink,
    });

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

      contractPdfPath: contractSupabaseRes.path,
      contractPdfName: contractSupabaseRes.name,

      googleDriveContractUploaded: Boolean(googleDriveContract?.uploaded),
      googleDriveContractSkipped: Boolean(googleDriveContract?.skipped),
      googleDriveContractFailed: Boolean(googleDriveContract?.failed),
      googleDriveContractReason: googleDriveContract?.reason || null,

      googleDriveFileId: googleDriveContract?.fileId || null,
      googleDriveFileName: googleDriveContract?.fileName || null,
      googleDriveFileLink: googleDriveContract?.webViewLink || null,
      googleDriveFileDownloadLink: googleDriveContract?.webContentLink || null,

      googleDriveFolderId: googleDriveContract?.folderId || null,
      googleDriveFolderName: googleDriveContract?.folderName || null,
      googleDriveFolderLink: googleDriveContract?.folderWebViewLink || null,
      googleDriveParentFolderId: googleDriveContract?.parentFolderId || null,

      googleDrive: googleDriveContract,
    });
  } catch (error: any) {
    console.error("UPLOAD BOOKING DOCUMENTS ERROR:", {
      message: error?.message,
      stack: error?.stack,
      responseData: error?.response?.data,
    });

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