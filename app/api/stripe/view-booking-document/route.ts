import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "booking-documents";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path || !path.trim()) {
      return NextResponse.json(
        { error: "Missing file path" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message || "Could not create signed URL" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(data.signedUrl);
  } catch (error: any) {
    console.error("VIEW BOOKING DOCUMENT ERROR:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}