import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function isAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone, message } = await req.json();

  if (!phone || !message) {
    return NextResponse.json(
      { error: "Phone and message required" },
      { status: 400 }
    );
  }

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          preview_url: false,
          body: message.slice(0, 3500),
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: 500 });
  }

  await supabase.from("whatsapp_messages").insert({
    phone,
    role: "assistant",
    content: message,
    is_manual: true,
  });

  await supabase.from("whatsapp_contacts").upsert({
    phone,
    last_message: message,
    last_message_at: new Date().toISOString(),
    escalated: false,
  });

  return NextResponse.json({ ok: true, data });
}