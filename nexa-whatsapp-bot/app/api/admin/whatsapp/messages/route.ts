import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function isAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const phone = normalizePhone(req.nextUrl.searchParams.get("phone") || "");

    if (!phone) {
      return NextResponse.json({ error: "Missing phone" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("whatsapp_messages")
      .select(
        `
        id,
        phone,
        role,
        content,
        created_at,
        is_manual,
        message_id,
        media_url,
        media_type,
        file_name,
        whatsapp_media_id,
        delivery_status,
        delivered_at,
        read_at,
        failed_reason
      `
      )
      .eq("phone", phone)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("MESSAGES ROUTE ERROR:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error: any) {
    console.error("MESSAGES ROUTE SERVER ERROR:", error);

    return NextResponse.json(
      {
        error: "Server error loading messages",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

function normalizePhone(phone: string) {
  return String(phone || "").replace(/[^\d]/g, "");
}