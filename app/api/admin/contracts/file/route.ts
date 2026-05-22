import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "booking-documents";

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path")?.trim();

    if (!path || path.includes("..")) {
      return NextResponse.json(
        { ok: false, error: "Invalid or missing storage path." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { ok: false, error: error?.message || "Could not create download link." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      signedUrl: data.signedUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to load contract file." },
      { status: 500 }
    );
  }
}
