import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const MEDIA_BUCKET = "whatsapp-media";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

type MediaInfo = {
  mediaUrl: string | null;
  mediaType: string | null;
  fileName: string | null;
  whatsappMediaId: string | null;
};

function isAuth(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return NextResponse.json(
        { error: "Missing WhatsApp environment variables" },
        { status: 500 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await handleMediaMessage(req);
    }

    return await handleTextMessage(req);
  } catch (error: any) {
    console.error("SEND ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Message failed",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleTextMessage(req: NextRequest) {
  const { phone, message, name } = await req.json();

  const cleanPhone = normalizePhone(phone || "");
  const cleanMessage = String(message || "").trim();

  if (!cleanPhone || !cleanMessage) {
    return NextResponse.json(
      { error: "Phone and message required" },
      { status: 400 }
    );
  }

  const data = await sendWhatsAppText(cleanPhone, cleanMessage);
  const messageId = data?.messages?.[0]?.id || null;

  await supabase.from("whatsapp_messages").insert({
    phone: cleanPhone,
    role: "assistant",
    content: cleanMessage,
    message_id: messageId,
    is_manual: true,
    media_url: null,
    media_type: null,
    file_name: null,
    whatsapp_media_id: null,
    delivery_status: "sent",
  });

  await upsertContact({
    phone: cleanPhone,
    name,
    lastMessage: cleanMessage,
  });

  return NextResponse.json({ ok: true, data });
}

async function handleMediaMessage(req: NextRequest) {
  const formData = await req.formData();

  const cleanPhone = normalizePhone(String(formData.get("phone") || ""));
  const cleanMessage = String(formData.get("message") || "").trim();
  const file = formData.get("file") as File | null;

  if (!cleanPhone) {
    return NextResponse.json(
      { error: "Phone number required" },
      { status: 400 }
    );
  }

  if (!file) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  const media = await uploadFileToSupabase(cleanPhone, file);

  if (!media.mediaUrl) {
    return NextResponse.json(
      {
        error:
          "File upload failed. Check that Supabase Storage bucket whatsapp-media exists and is public.",
      },
      { status: 500 }
    );
  }

  const data = await sendWhatsAppMedia({
    to: cleanPhone,
    mediaUrl: media.mediaUrl,
    mediaType: media.mediaType || file.type,
    fileName: media.fileName || file.name,
    caption: cleanMessage,
  });

  const messageId = data?.messages?.[0]?.id || null;
  const savedContent =
    cleanMessage ||
    `[${getWhatsAppMediaKind(media.mediaType || file.type).toUpperCase()} sent] ${
      media.fileName || file.name
    }`;

  await supabase.from("whatsapp_messages").insert({
    phone: cleanPhone,
    role: "assistant",
    content: savedContent,
    message_id: messageId,
    is_manual: true,
    media_url: media.mediaUrl,
    media_type: media.mediaType,
    file_name: media.fileName,
    whatsapp_media_id: media.whatsappMediaId,
    delivery_status: "sent",
  });

  await upsertContact({
    phone: cleanPhone,
    name: null,
    lastMessage: savedContent,
  });

  return NextResponse.json({ ok: true, data, media_url: media.mediaUrl });
}

async function sendWhatsAppText(phone: string, message: string) {
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

  console.log("MANUAL TEXT SEND STATUS:", res.status);
  console.log("MANUAL TEXT SEND RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    throw new Error(getWhatsAppErrorMessage(data));
  }

  return data;
}

async function sendWhatsAppMedia({
  to,
  mediaUrl,
  mediaType,
  fileName,
  caption,
}: {
  to: string;
  mediaUrl: string;
  mediaType: string;
  fileName: string;
  caption?: string;
}) {
  const kind = getWhatsAppMediaKind(mediaType);

  const payload: any = {
    messaging_product: "whatsapp",
    to,
    type: kind,
  };

  if (kind === "image") {
    payload.image = {
      link: mediaUrl,
      caption: caption || undefined,
    };
  }

  if (kind === "video") {
    payload.video = {
      link: mediaUrl,
      caption: caption || undefined,
    };
  }

  if (kind === "document") {
    payload.document = {
      link: mediaUrl,
      filename: fileName || "file",
      caption: caption || undefined,
    };
  }

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  console.log("MANUAL MEDIA SEND STATUS:", res.status);
  console.log("MANUAL MEDIA SEND RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    throw new Error(getWhatsAppErrorMessage(data));
  }

  return data;
}

async function uploadFileToSupabase(
  phone: string,
  file: File
): Promise<MediaInfo> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeFileName = file.name.replace(/[^\w.\-]/g, "_");
    const path = `${phone}/manual-${Date.now()}-${safeFileName}`;

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("SUPABASE MANUAL MEDIA UPLOAD ERROR:", error);
      return emptyMedia();
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    return {
      mediaUrl: data.publicUrl,
      mediaType: file.type || "application/octet-stream",
      fileName: file.name,
      whatsappMediaId: null,
    };
  } catch (error) {
    console.error("UPLOAD FILE ERROR:", error);
    return emptyMedia();
  }
}

async function upsertContact({
  phone,
  name,
  lastMessage,
}: {
  phone: string;
  name?: string | null;
  lastMessage: string;
}) {
  const { data: existing } = await supabase
    .from("whatsapp_contacts")
    .select("phone, name, ai_enabled, unread_count, escalated")
    .eq("phone", phone)
    .maybeSingle();

  await supabase.from("whatsapp_contacts").upsert({
    phone,
    name: name || existing?.name || null,
    ai_enabled: existing?.ai_enabled ?? false,
    last_message: lastMessage,
    last_message_at: new Date().toISOString(),
    unread_count: existing?.unread_count || 0,
    escalated: false,
  });
}

function emptyMedia(): MediaInfo {
  return {
    mediaUrl: null,
    mediaType: null,
    fileName: null,
    whatsappMediaId: null,
  };
}

function normalizePhone(phone: string) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function getWhatsAppMediaKind(mediaType: string) {
  const type = String(mediaType || "").toLowerCase();

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";

  return "document";
}

function getWhatsAppErrorMessage(data: any) {
  const message =
    data?.error?.error_data?.details ||
    data?.error?.message ||
    data?.error?.title ||
    "WhatsApp send failed";

  const code = data?.error?.code;
  const subcode = data?.error?.error_subcode;

  if (code === 131047 || String(message).toLowerCase().includes("24-hour")) {
    return (
      "WhatsApp blocked this normal message because the customer has not messaged you within the 24-hour window. " +
      "You need to send an approved WhatsApp template message first."
    );
  }

  return `WhatsApp send failed: ${message}${
    code ? ` | Code: ${code}` : ""
  }${subcode ? ` | Subcode: ${subcode}` : ""}`;
}