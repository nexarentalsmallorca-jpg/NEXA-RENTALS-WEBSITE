import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const BOOKING_LINK = "https://nexarentals.es";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type DbMessage = {
  role: "user" | "assistant";
  content: string;
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
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const body = await req.json();
    console.log("WEBHOOK BODY:", JSON.stringify(body, null, 2));

    const value = body?.entry?.[0]?.changes?.[0]?.value;

    if (!value) {
      return NextResponse.json({ ok: true });
    }

    // Ignore delivery/read/sent status updates
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
    const text = message.text?.body?.trim();

    // Ignore non-text messages
    if (!messageId || !from || !text) {
      console.log("Non-text or empty message ignored");
      return NextResponse.json({ ok: true });
    }

    // Duplicate protection
    const { data: existingMessage, error: duplicateError } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .eq("message_id", messageId)
      .maybeSingle();

    if (duplicateError) {
      console.error("Duplicate check error:", duplicateError);
    }

    if (existingMessage) {
      console.log("Duplicate WhatsApp message ignored:", messageId);
      return NextResponse.json({ ok: true });
    }

    console.log("MESSAGE RECEIVED:", from, text);

    await saveMessage(from, "user", text, messageId);

    const history = await getHistory(from);

    const reply = await getAIReply(history);

    console.log("AI REPLY:", reply);

    await saveMessage(from, "assistant", reply);

    await sendWhatsAppMessage(from, reply);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function saveMessage(
  phone: string,
  role: "user" | "assistant",
  content: string,
  messageId?: string
) {
  const { error } = await supabase.from("whatsapp_messages").insert({
    phone,
    role,
    content,
    message_id: messageId || null,
  });

  if (error) {
    console.error("SUPABASE SAVE ERROR:", error);
  }
}

async function getHistory(phone: string): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("role, content, created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(14);

  if (error) {
    console.error("SUPABASE HISTORY ERROR:", error);
    return [];
  }

  return (data || [])
    .reverse()
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content || ""),
    }));
}

async function getAIReply(history: DbMessage[]) {
  const systemPrompt = `
You are Nero, a smart, natural, human-like WhatsApp AI assistant for NEXA Rentals in Magaluf, Mallorca.

Style:
- Reply naturally like a real assistant.
- Keep replies short and useful for WhatsApp.
- Answer the customer's exact question first.
- Do not repeat the same message every time.
- Speak in the same language as the customer.
- Use emojis lightly.
- Never guarantee availability 100%. Say the team can confirm.

Business:
NEXA Rentals rents 125cc scooters and e-bikes in Magaluf, Mallorca.
Location: near BCM Magaluf.
Booking link: ${BOOKING_LINK}

Greeting:
If the customer only says hi, hello, hola, buenas, bonjour, ciao, or similar, reply:
"Hello, I’m Nero, your virtual AI assistant from NEXA Rentals. How can I help you today? 😊"

Scooters:
- Mostly black Piaggio Liberty 125cc
- Also SYM Symphony 125cc
- All scooters are 125cc

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
Released when scooter returns in same condition, on time, with full fuel and no new damage.

Insurance:
Basic third-party insurance included.
Damage to the rental scooter itself is not fully covered.
Customer is responsible up to €800 excess/franchise.
Never call it full insurance.

License:
For 125cc scooters:
A1/A motorcycle license OR B car license held for at least 3 years.
A1 does not need 3 years.
Customer must bring ID/passport and driving license.
If B license is less than 3 years, politely say they cannot rent a 125cc scooter.

E-bikes:
Mountain e-bike and city e-bike.
Prices:
1 hour €9
2 hours €16
3 hours €20
4 hours €25
1 day €28

Booking:
If customer wants to book, collect only missing info:
name, pickup date, pickup time, rental duration, number of scooters/e-bikes, license type.
Also offer booking link: ${BOOKING_LINK}

Sensitive cases:
If accident, legal issue, refund, police, damage dispute, emergency, angry complaint, or serious problem:
Say: "I’ll connect you with our team so they can help you directly."

Important:
Do not dump all prices unless asked.
If customer gives partial booking info, remember it and ask only the next missing detail.
`;

  const conversationText = history
    .map((m) => `${m.role === "user" ? "Customer" : "Nero"}: ${m.content}`)
    .join("\n");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      instructions: systemPrompt,
      input: conversationText,
      temperature: 0.6,
      max_output_tokens: 250,
    }),
  });

  const data = await res.json();

  console.log("OPENAI STATUS:", res.status);
  console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    return "Sorry, I had a small technical issue. Please send your message again and I’ll help you.";
  }

  const reply = data?.output_text?.trim();

  return (
    reply ||
    "Hello, I’m Nero, your virtual AI assistant from NEXA Rentals. How can I help you today? 😊"
  );
}

async function sendWhatsAppMessage(to: string, message: string) {
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
          body: message,
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