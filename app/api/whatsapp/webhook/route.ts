import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

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
    const body = await req.json();

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (!from || !text) {
      return NextResponse.json({ ok: true });
    }

    const aiReply = await getAIReply(text);

    await sendWhatsAppMessage(from, aiReply);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function getAIReply(customerMessage: string) {
  const prompt = `
You are Nero, the AI assistant for NEXA Rentals in Magaluf, Mallorca.

Business info:
- We rent 125cc scooters and e-bikes.
- Location: near BCM Magaluf.
- 125cc scooter price: €49 for 24 hours.
- Half-day scooter: €39.
- 2 days scooter: €47/day.
- Includes: 2 helmets, lock, phone holder, unlimited kilometers.
- Deposit: €150 refundable, cash or card preauthorization.
- License: B car license held for 3+ years, or A1/A motorcycle license.
- Customer must bring ID/passport and driving license.

Important rules:
- Reply short, friendly, professional.
- Never promise 100% availability.
- Say: "Usually yes, please tell me pickup date and time and I will confirm."
- Ask for date, pickup time, number of scooters, and license type.
- If customer asks about accident, police, legal problem, complaint, refund, or damage, say: "I will connect you with our team."
- Do not invent prices.
`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: customerMessage,
        },
      ],
    }),
  });

  const data = await res.json();

  return (
    data.output_text ||
    "Hello! Thanks for contacting NEXA Rentals. Please tell me your pickup date and time."
  );
}

async function sendWhatsAppMessage(to: string, message: string) {
  await fetch(`https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`, {
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
        body: message,
      },
    }),
  });
}