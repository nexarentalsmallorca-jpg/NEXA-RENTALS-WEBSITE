import { NextResponse } from "next/server";
import { uploadContractPdfToGoogleDrive } from "@/lib/googleDrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const fileName = `NEXA_DRIVE_TEST_${Date.now()}.pdf`;
    const pdfBuffer = Buffer.from(
      `%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF`
    );

    const result = await uploadContractPdfToGoogleDrive({
      fileName,
      pdfBuffer,
      customerFolderName: fileName.replace(/\.pdf$/i, ""),
      contractNumber: "NEXA-DRIVE-TEST",
      customerName: "Drive Test",
    });

    return NextResponse.json({
      ok: Boolean(result.uploaded),
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Drive test failed.",
      },
      { status: 500 }
    );
  }
}
