import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "booking-documents";

function sanitizeStorageFileName(name: string) {
  return String(name || "contract.pdf")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180);
}

export type PersistedContractPdf = {
  ok: boolean;
  path?: string;
  name?: string;
  signedUrl?: string | null;
  error?: string;
};

export async function persistContractPdfToSupabaseStorage({
  bookingKey,
  fileName,
  pdfBuffer,
}: {
  bookingKey: string;
  fileName: string;
  pdfBuffer: Buffer;
}): Promise<PersistedContractPdf> {
  const bookingId = String(bookingKey || "").trim();

  if (!bookingId) {
    return { ok: false, error: "Missing booking key for contract PDF storage." };
  }

  if (!pdfBuffer?.length) {
    return { ok: false, error: "Empty PDF buffer." };
  }

  const safeName = sanitizeStorageFileName(fileName);
  const finalName = safeName.toLowerCase().endsWith(".pdf")
    ? safeName
    : `${safeName}.pdf`;

  const path = `${bookingId}/contract-${Date.now()}-${finalName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("❌ Contract PDF Supabase storage upload failed:", uploadError);
    return { ok: false, error: uploadError.message };
  }

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 7);

  if (signedError) {
    console.warn("⚠️ Contract PDF uploaded but signed URL failed:", signedError);
  }

  return {
    ok: true,
    path,
    name: finalName,
    signedUrl: signedData?.signedUrl || null,
  };
}

export async function tryUpdateBookingContractMetadata({
  bookingKey,
  contractNumber,
  storage,
  drive,
  fileName,
}: {
  bookingKey: string;
  contractNumber?: string;
  storage: PersistedContractPdf;
  drive: {
    uploaded?: boolean;
    fileId?: string | null;
    webViewLink?: string | null;
    folderWebViewLink?: string | null;
    fileName?: string | null;
  };
  fileName: string;
}) {
  const hasStorage = Boolean(storage.ok && storage.path);
  const hasDrive = Boolean(drive?.uploaded && drive?.webViewLink);

  if (!hasStorage && !hasDrive) return { ok: false };

  const payload: Record<string, string | null> = {
    contract_pdf_path: hasStorage ? storage.path! : null,
    contract_pdf_name: storage.name || drive?.fileName || fileName,
    google_drive_file_id: drive?.fileId || null,
    google_drive_file_link: drive?.webViewLink || null,
    google_drive_folder_link: drive?.folderWebViewLink || null,
  };

  const filters = [
    { column: "stripe_payment_intent_id", value: bookingKey },
    { column: "contract_number", value: contractNumber || bookingKey },
  ].filter((item) => item.value);

  for (const filter of filters) {
    const result = await supabaseAdmin
      .from("bookings")
      .update(payload)
      .eq(filter.column, filter.value)
      .select("id");

    if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
      return { ok: true, updated: result.data.length };
    }

    if (result.error?.message?.includes("column")) {
      console.warn(
        "BOOKINGS contract metadata columns missing — PDF is in storage only:",
        result.error.message
      );
      return { ok: false, skippedColumns: true };
    }
  }

  return { ok: false };
}
