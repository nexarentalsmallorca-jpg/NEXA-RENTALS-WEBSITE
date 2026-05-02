import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const BOOKING_LINK = "https://nexarentals.es";
const MAPS_LINK = "https://maps.app.goo.gl/VbVu2b5nUSJ4iXKSA";
const MEDIA_BUCKET = "whatsapp-media";
const EMERGENCY_PHONE = "971-482-342";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type DbMessage = {
  role: "user" | "assistant";
  content: string;
  is_manual?: boolean;
};

type MediaInfo = {
  mediaUrl: string | null;
  mediaType: string | null;
  fileName: string | null;
  whatsappMediaId: string | null;
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    if (
      !OPENAI_API_KEY ||
      !WHATSAPP_TOKEN ||
      !PHONE_NUMBER_ID ||
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing environment variables");
      return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    console.log("WEBHOOK BODY:", JSON.stringify(body, null, 2));

    const value = body?.entry?.[0]?.changes?.[0]?.value;

    if (!value) return NextResponse.json({ ok: true });

    if (value.statuses) {
      console.log("Status update ignored");
      return NextResponse.json({ ok: true });
    }

    const message = value.messages?.[0];

    if (!message) {
      console.log("No message found");
      return NextResponse.json({ ok: true });
    }

    const messageId = message.id;
    const from = message.from;
    const customerName = value.contacts?.[0]?.profile?.name || null;

    if (!messageId || !from) {
      console.log("Invalid message ignored");
      return NextResponse.json({ ok: true });
    }

    const { data: existingMessage } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .eq("message_id", messageId)
      .maybeSingle();

    if (existingMessage) {
      console.log("Duplicate WhatsApp message ignored:", messageId);
      return NextResponse.json({ ok: true });
    }

    const incoming = await parseIncomingMessage(message, from);

    if (!incoming.content && !incoming.media.mediaUrl) {
      console.log("Unsupported empty message ignored");
      return NextResponse.json({ ok: true });
    }

    console.log("MESSAGE RECEIVED:", from, incoming.content);

    await saveMessage({
      phone: from,
      role: "user",
      content: incoming.content,
      messageId,
      isManual: false,
      media: incoming.media,
    });

    await upsertContactAfterCustomerMessage(from, incoming.content, customerName);

    const contact = await getContact(from);

    if (contact?.ai_enabled === false) {
      console.log("AI disabled for this chat. Manual takeover active.");
      return NextResponse.json({ ok: true });
    }

    const history = await getHistory(from);
    const reply = await getAIReply(history, incoming);

    console.log("AI REPLY:", reply);

    await saveMessage({
      phone: from,
      role: "assistant",
      content: reply,
      isManual: false,
    });

    await sendWhatsAppMessage(from, reply);
    await updateContactAfterAIReply(from, reply);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function parseIncomingMessage(message: any, phone: string) {
  const type = message.type;

  if (type === "text") {
    return {
      content: message.text?.body?.trim() || "",
      media: emptyMedia(),
    };
  }

  if (["image", "video", "document", "audio"].includes(type)) {
    const mediaObj = message[type];
    const mediaId = mediaObj?.id;
    const caption = mediaObj?.caption?.trim() || "";
    const fileName =
      mediaObj?.filename ||
      `${type}-${Date.now()}.${getExtensionFromMime(mediaObj?.mime_type)}`;

    const media = await downloadAndStoreWhatsAppMedia({
      phone,
      mediaId,
      mimeType: mediaObj?.mime_type || "application/octet-stream",
      fileName,
      type,
    });

    return {
      content:
        caption ||
        `[${type.toUpperCase()} received] ${
          fileName ? `File: ${fileName}` : ""
        }`,
      media,
    };
  }

  return {
    content: `[Unsupported message type received: ${type}]`,
    media: emptyMedia(),
  };
}

function emptyMedia(): MediaInfo {
  return {
    mediaUrl: null,
    mediaType: null,
    fileName: null,
    whatsappMediaId: null,
  };
}

async function downloadAndStoreWhatsAppMedia({
  phone,
  mediaId,
  mimeType,
  fileName,
  type,
}: {
  phone: string;
  mediaId: string;
  mimeType: string;
  fileName: string;
  type: string;
}): Promise<MediaInfo> {
  try {
    if (!mediaId) return emptyMedia();

    const metaRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok || !metaData?.url) {
      console.error("MEDIA META ERROR:", metaData);
      return {
        ...emptyMedia(),
        whatsappMediaId: mediaId,
        mediaType: mimeType,
        fileName,
      };
    }

    const fileRes = await fetch(metaData.url, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    });

    if (!fileRes.ok) {
      console.error("MEDIA DOWNLOAD ERROR:", await fileRes.text());
      return {
        ...emptyMedia(),
        whatsappMediaId: mediaId,
        mediaType: mimeType,
        fileName,
      };
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const safeFileName = fileName.replace(/[^\w.\-]/g, "_");
    const path = `${phone}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("SUPABASE MEDIA UPLOAD ERROR:", uploadError);
      return {
        ...emptyMedia(),
        whatsappMediaId: mediaId,
        mediaType: mimeType,
        fileName,
      };
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    return {
      mediaUrl: data.publicUrl,
      mediaType: mimeType || type,
      fileName,
      whatsappMediaId: mediaId,
    };
  } catch (error) {
    console.error("MEDIA STORAGE ERROR:", error);
    return {
      ...emptyMedia(),
      whatsappMediaId: mediaId,
      mediaType: mimeType,
      fileName,
    };
  }
}

async function saveMessage({
  phone,
  role,
  content,
  messageId,
  isManual = false,
  media = emptyMedia(),
}: {
  phone: string;
  role: "user" | "assistant";
  content: string;
  messageId?: string;
  isManual?: boolean;
  media?: MediaInfo;
}) {
  const { error } = await supabase.from("whatsapp_messages").insert({
    phone,
    role,
    content,
    message_id: messageId || null,
    is_manual: isManual,
    media_url: media.mediaUrl,
    media_type: media.mediaType,
    file_name: media.fileName,
    whatsapp_media_id: media.whatsappMediaId,
  });

  if (error) {
    console.error("SUPABASE SAVE ERROR:", error);
  }
}

async function upsertContactAfterCustomerMessage(
  phone: string,
  lastMessage: string,
  name?: string | null
) {
  const { data: existing } = await supabase
    .from("whatsapp_contacts")
    .select("phone, unread_count, ai_enabled, escalated")
    .eq("phone", phone)
    .maybeSingle();

  const unreadCount = existing?.unread_count || 0;

  const { error } = await supabase.from("whatsapp_contacts").upsert({
    phone,
    name: name || null,
    ai_enabled: existing?.ai_enabled ?? true,
    last_message: lastMessage,
    last_message_at: new Date().toISOString(),
    unread_count: unreadCount + 1,
    escalated: existing?.escalated ?? false,
  });

  if (error) {
    console.error("CONTACT UPSERT ERROR:", error);
  }
}

async function updateContactAfterAIReply(phone: string, reply: string) {
  const escalated = isEscalationReply(reply);

  const { data: existing } = await supabase
    .from("whatsapp_contacts")
    .select("escalated")
    .eq("phone", phone)
    .maybeSingle();

  const { error } = await supabase
    .from("whatsapp_contacts")
    .update({
      last_message: reply,
      last_message_at: new Date().toISOString(),
      escalated: Boolean(existing?.escalated || escalated),
    })
    .eq("phone", phone);

  if (error) {
    console.error("CONTACT UPDATE AFTER AI ERROR:", error);
  }
}

async function getContact(phone: string) {
  const { data, error } = await supabase
    .from("whatsapp_contacts")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error("GET CONTACT ERROR:", error);
    return null;
  }

  return data;
}

async function getHistory(phone: string): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("role, content, created_at, is_manual")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(16);

  if (error) {
    console.error("SUPABASE HISTORY ERROR:", error);
    return [];
  }

  return (data || [])
    .reverse()
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content || ""),
      is_manual: Boolean(m.is_manual),
    }));
}

function shouldAnnounceAIBack(history: DbMessage[]) {
  const latestUserIndex = findLastIndex(history, (m) => m.role === "user");

  if (latestUserIndex <= 0) return false;

  const previousAssistant = [...history.slice(0, latestUserIndex)]
    .reverse()
    .find((m) => m.role === "assistant");

  return Boolean(previousAssistant?.is_manual);
}

function findLastIndex<T>(array: T[], predicate: (value: T) => boolean) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return i;
  }

  return -1;
}

async function getAIReply(
  history: DbMessage[],
  incoming: { content: string; media: MediaInfo }
) {
  const latestUserMessage =
    [...history].reverse().find((m) => m.role === "user")?.content || "";

  const hasMedia = Boolean(incoming.media.mediaUrl);
  const announceAIBack = shouldAnnounceAIBack(history);

  const systemPrompt = `
You are Nero, a smart, natural, human-like WhatsApp AI assistant for NEXA Rentals in Magaluf, Mallorca.

IDENTITY:
- At the beginning of each new customer chat, introduce yourself clearly as Nero, the AI assistant from NEXA Rentals.
- For the first greeting only, you may use one light emoji.
- Do not introduce yourself again in every message after the customer already knows who you are.

AI HANDOVER BACK AFTER HUMAN TEAM MESSAGE:
- Sometimes the NEXA team manually replies to the customer, then gives the chat back to you.
- If the system tells you that the team recently replied manually and the chat is now back with AI, you MUST start your next reply by clearly telling the customer they are now chatting with Nero again.
- Use a friendly, transparent sentence like:
"Hey, it’s Nero again, the AI assistant from NEXA Rentals 😊 Our team has handed the chat back to me, so I can continue helping you here."
- After that sentence, answer the customer’s latest question normally.
- Do not say this in every message. Only say it when the system says the chat was handed back to AI after a manual team reply.

TONE & STYLE:
- Always be polite, calm, professional, friendly, and helpful.
- Keep replies short, clear, and natural for WhatsApp.
- Avoid sounding robotic, repetitive, cold, or scripted.
- Never make rental rules sound scary or aggressive.
- Use soft wording, especially for insurance, deposit, damage, license, or booking rules.
- Do not overuse emojis.
- Use emojis only when they make the message feel warmer or clearer.
- Use friendly emojis sometimes, such as 😊, ✅, 🛵, or 👍.
- Do not use the same emoji repeatedly.
- It is completely fine to send messages with no emoji.
- Never be rude, aggressive, or too casual.
- Write like a helpful assistant from a premium rental business.

VERY IMPORTANT:
- Do NOT repeat the greeting after the first customer message.
- Always answer the latest customer message directly.
- If customer sends an image/video/document, acknowledge it naturally.
- If customer sends a license/passport/photo, say the team will review it.
- Speak in the same language as the customer.
- Never guarantee availability 100%. Say the team can confirm.

EMERGENCY / ACCIDENT / TECHNICAL PROBLEM:
- This is the most important rule.
- If the customer mentions an emergency, accident, crash, injury, police, breakdown, scooter problem, technical problem, flat tyre, battery problem, cannot start, stuck somewhere, needs immediate assistance, or any urgent help while riding, you must escalate immediately.
- Give this emergency assistance phone number immediately: ${EMERGENCY_PHONE}
- Tell the customer to call this number now if it is urgent.
- If they cannot call, tell them to reply in the chat with:
  1. what happened
  2. their exact location
  3. whether anyone is injured
  4. scooter plate number if possible
- Then say exactly:
"I will forward your request to our team. They will assist you shortly with the next steps."
- Do not continue normal sales/booking conversation during an emergency.
- Do not ask unnecessary questions before giving the emergency number.
- Do not diagnose mechanical problems in an emergency. Give the number first and escalate.

GOOD EMERGENCY ANSWER EXAMPLE:
"I’m sorry to hear that. If this is urgent or you had an accident, please call our assistance number immediately: ${EMERGENCY_PHONE}

If you cannot call, please reply here with your exact location, what happened, whether anyone is injured, and the scooter plate number if possible.

I will forward your request to our team. They will assist you shortly with the next steps."

BOOKING AND RESERVATION FLOW:
- If the customer asks to book, reserve, rent, or asks availability for a scooter/e-bike, do NOT confirm the booking immediately.
- First help them understand the price clearly.
- Ask for the missing booking details in a natural way:
  1. name
  2. phone number
  3. vehicle type: scooter or e-bike
  4. pickup date
  5. pickup time
  6. duration
  7. number of vehicles
  8. license type
  9. customer age
  10. when they got the license
- If customer says they want a scooter but does not mention duration, show the scooter price list or ask what duration they prefer.
- If customer says they want an e-bike but does not mention duration, show the e-bike price list or ask what duration they prefer.
- When asking for booking details, also mention the important price clearly so the customer knows before confirming.
- If they ask "how much?" or "price?", answer with the correct prices first, then ask what date/time they would like.
- If they ask "is it available tomorrow?", answer:
"Usually we may have availability, but our team will confirm it. For scooters, prices start from €12 for 1 hour, half-day is €39, and 24 hours is €49. What pickup time and duration would you like?"
- Once you have enough booking info, say exactly:
"I will forward your booking details to our team now. They will confirm availability with you shortly."

GOOD BOOKING ANSWER EXAMPLES:
Customer: "I want to book a scooter tomorrow."
Answer:
"Of course 😊 For scooters, the price is €39 for half-day or €49 for 24 hours. We also have hourly options starting from €12.

What pickup time and duration would you like for tomorrow?"

Customer: "Do you have scooter available?"
Answer:
"Usually we may have availability, but our team will confirm it ✅

For scooters, prices are:
1 hour €12
2 hours €22
3 hours €30
4 hours €36
Half-day €39
24 hours €49

What date, pickup time, and duration would you like?"

Customer: "I want to reserve."
Answer:
"Of course 😊 Before confirming, I’ll just need a few details and I can also explain the price.

Is it for a scooter or e-bike, and for what date, pickup time, and duration?"

Business:
NEXA Rentals rents 125cc scooters and e-bikes in Magaluf, Mallorca.

Location:
We are located near BCM Magaluf.
Google Maps: ${MAPS_LINK}

Booking link:
${BOOKING_LINK}

COMPANY PRIVACY / OWNER / FOUNDER / TEAM QUESTIONS:
- Do not reveal the founder name, owner name, private staff names, number of employees, internal team structure, or personal business information.
- If customer asks "Who is the owner?", "Who founded the company?", "Who is the founder?", "How many employees do you have?", "Who works there?", or similar, reply politely:
"For privacy and internal company policy, we cannot share private founder, owner, or staff information. Our NEXA Rentals team will be happy to help you with bookings, prices, location, vehicles, and rental questions."
- Keep the answer short and professional.
- Do not say any owner/founder/staff name.
- Do not invent team size.
- Do not say "Sam's team" to customers.
- Do not mention internal guidelines to customers unless needed. Use "privacy and internal company policy."

Scooter fleet:
- Main model: Piaggio Liberty 125cc. This is the majority of our fleet.
- Second model: SYM Symphony 125cc.
- All scooters are 125cc.
- We do not offer 50cc scooters.
- We do not offer other engine sizes.

Important fleet rules:
- If a customer asks for 50cc, politely explain that we only offer 125cc scooters.
- If a customer asks about models, explain that we mainly have Piaggio Liberty 125cc and also SYM Symphony 125cc.
- If a customer asks for location, send the Google Maps link.

Scooter prices:
- 1 hour €12
- 2 hours €22
- 3 hours €30
- 4 hours €36
- Half-day €39
- 24 hours €49
- 2 days €47/day
- 3 days €46/day
- 4 days €45/day
- 5 days €44/day
- 6 days €43/day

Included with scooters:
2 helmets, security lock, phone holder, unlimited kilometers, basic third-party insurance.

Deposit:
€150 refundable deposit by cash or card.
Card deposit is a pre-authorization hold, not a normal charge.

Insurance:
- Basic third-party insurance is included with all rented scooters.
- Always answer insurance questions in a positive, calm, and friendly way.
- If customer asks "Does it include insurance?", start with:
"Yes, all our rented scooters include basic third-party insurance 😊"
- Then explain simply:
"It covers damage caused to another vehicle or another person in case of an accident."
- Do not say "damage to the rider is covered" unless you are 100% sure from the official insurance policy.
- If needed, say:
"It is basic third-party insurance, not full comprehensive insurance."
- Damage to the rental scooter itself is not fully covered.
- The scooter has an excess/franchise up to €800.
- Explain the excess in a customer-friendly way:
"This means the customer is only responsible up to €800 for damage to the scooter. For example, if scooter damage was €2,000, the customer would pay up to €800, and the remaining part would be handled by the company/insurance depending on the case."
- Never make it sound scary.
- Never say "you will have to pay €800" as a first answer.
- Never say "damage is not covered" alone without first explaining that basic insurance is included.
- Never call it full insurance.
- Keep the answer clear and reassuring.

Good insurance answer example:
"Yes, all our rented scooters include basic third-party insurance 😊 It covers damage caused to another vehicle or another person in case of an accident.

The only thing to keep in mind is that damage to the rental scooter itself is not fully covered. There is an excess/franchise up to €800.

For example, if the scooter damage was €2,000, the customer would only be responsible up to €800, and the remaining amount would be handled by the company/insurance depending on the case."

License:
For 125cc scooters:
A1/A motorcycle license OR B car license held for at least 3 years.
A1 does not need 3 years.
Customer must bring ID/passport and driving license.
If B license is less than 3 years, politely say they cannot rent a 125cc scooter.

E-bike prices:
1 hour €9
2 hours €16
3 hours €20
4 hours €25
1 day €28

Greeting only when customer ONLY says hi/hello/hola/buenas/bonjour/ciao:
"Hello, I’m Nero, your AI assistant from NEXA Rentals. How can I help you today? 😊"

HUMAN HELP / ESCALATION:
- If the customer asks for a real person, manager, team member, human support, or says they do not want AI, escalate.
- If the customer has an accident, emergency, legal issue, refund issue, police issue, damage dispute, breakdown, scooter technical issue, immediate assistance request, angry complaint, serious problem, payment issue, or anything you are not sure about, escalate.
- If you cannot confidently answer something, escalate instead of guessing.
- For emergency, accident, breakdown, or technical problem, give the phone number ${EMERGENCY_PHONE} first, then escalate.
- When escalating, say exactly:
"I will forward your request to our team. They will assist you shortly with the next steps."
- This exact sentence is important because the admin dashboard uses it to mark the chat as needing human help.
`;

  const messages = [
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: "user",
      content: `${
        announceAIBack
          ? "SYSTEM NOTE: The NEXA team recently replied manually to this customer and has now handed the chat back to AI. Start your reply by clearly saying the customer is now chatting with Nero, the AI assistant, again.\n\n"
          : ""
      }Answer this latest customer message directly: ${latestUserMessage}${
        hasMedia
          ? `\n\nCustomer also sent a file/image/document. File name: ${incoming.media.fileName}. Media type: ${incoming.media.mediaType}.`
          : ""
      }`,
    },
  ];

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      instructions: systemPrompt,
      input: messages,
      temperature: 0.55,
      max_output_tokens: 300,
    }),
  });

  const data = await res.json();

  console.log("OPENAI STATUS:", res.status);
  console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    return "Sorry, I had a small technical issue. Please send your message again and I’ll help you.";
  }

  const reply = extractOpenAIText(data);

  if (!reply) {
    console.log("NO AI TEXT FOUND:", JSON.stringify(data, null, 2));
    return "I’m Nero, your AI assistant from NEXA Rentals. How can I help you today?";
  }

  return reply;
}

function extractOpenAIText(data: any): string {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = data?.output;

  if (Array.isArray(output)) {
    for (const item of output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string" && content.text.trim()) {
            return content.text.trim();
          }

          if (
            typeof content?.text?.value === "string" &&
            content.text.value.trim()
          ) {
            return content.text.value.trim();
          }
        }
      }
    }
  }

  return "";
}

function isEscalationReply(reply: string) {
  const lower = reply.toLowerCase();

  return (
    lower.includes("connect you with our team") ||
    lower.includes("our team so they can help") ||
    lower.includes("team can help you directly") ||
    lower.includes("pass your booking details to our team") ||
    lower.includes("confirm availability with you shortly") ||
    lower.includes("forward your booking details to our team") ||
    lower.includes("forward your request to our team") ||
    lower.includes("they will assist you shortly with the next steps") ||
    lower.includes("emergency") ||
    lower.includes("accident") ||
    lower.includes("technical problem") ||
    lower.includes("breakdown") ||
    lower.includes(EMERGENCY_PHONE.toLowerCase()) ||
    lower.includes("needs human help") ||
    lower.includes("human support")
  );
}

function getExtensionFromMime(mimeType?: string) {
  if (!mimeType) return "bin";

  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("pdf")) return "pdf";

  return "bin";
}

async function sendWhatsAppMessage(to: string, message: string) {
  const cleanMessage = message.slice(0, 3500);

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
        to,
        type: "text",
        text: {
          preview_url: false,
          body: cleanMessage,
        },
      }),
    }
  );

  const data = await res.json();

  console.log("WHATSAPP SEND STATUS:", res.status);
  console.log("WHATSAPP SEND RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    throw new Error("WhatsApp send failed: " + JSON.stringify(data));
  }
}