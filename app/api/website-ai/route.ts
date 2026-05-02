import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.NAI_API_KEY || "";

const BOOKING_LINK = "https://nexarentals.es";
const MAPS_LINK = "https://maps.app.goo.gl/VbVu2b5nUSJ4iXKSA";
const EMERGENCY_PHONE = "971-482-342";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function cleanHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];

  return history
    .filter((m: any) => {
      return (
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim()
      );
    })
    .slice(-12)
    .map((m: any) => ({
      role: m.role,
      content: String(m.content).slice(0, 1500),
    }));
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

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      console.error(
        "Missing OpenAI key. Add OPENAI_API_KEY to .env.local and Vercel."
      );

      return NextResponse.json(
        {
          reply:
            "Nero is not connected yet. Please contact us on WhatsApp while we finish connecting the AI assistant.",
          debug:
            "Missing OPENAI_API_KEY. Add OPENAI_API_KEY=sk-proj-... to .env.local and restart npm run dev.",
        },
        { status: 200 }
      );
    }

    const body = await req.json();
    const message = String(body?.message || "").trim();
    const history = cleanHistory(body?.history);

    if (!message) {
      return NextResponse.json(
        { reply: "Please write a message and I’ll help you." },
        { status: 200 }
      );
    }

    const systemPrompt = `
You are Nero, the website AI assistant for NEXA Rentals in Magaluf, Mallorca.

Your job:
- Help website visitors understand scooter and e-bike rentals.
- Help customers complete bookings.
- Answer quickly, clearly, and professionally.
- Speak in the same language as the customer.
- Keep replies short and easy to read.
- Be friendly, premium, confident, and natural.
- Do not sound robotic.

Business:
NEXA Rentals rents 125cc scooters and e-bikes in Magaluf, Mallorca.

Location:
- We are located near BCM Magaluf.
- Google Maps: ${MAPS_LINK}

Website:
- Booking website: ${BOOKING_LINK}

Scooter fleet:
- Main scooter: Piaggio Liberty 125cc.
- Second scooter: SYM Symphony 125cc.
- All scooters are 125cc.
- We do not offer 50cc scooters.

Scooter prices:
- 1 hour: €12
- 2 hours: €22
- 3 hours: €30
- 4 hours: €36
- Half-day: €39
- 24 hours: €49
- 2 days: €47/day
- 3 days: €46/day
- 4 days: €45/day
- 5 days: €44/day
- 6 days: €43/day
- Maximum online rental: 6 days.

Included with scooters:
- 2 helmets
- Security lock
- Phone holder
- Unlimited kilometers
- Basic third-party insurance

Deposit:
- €150 refundable deposit by cash or card.
- Card deposit is a pre-authorization hold, not a normal charge.

Insurance:
- Basic third-party insurance is included.
- It covers damage caused to another vehicle or another person in case of an accident.
- It is not full comprehensive insurance.
- Damage to the rental scooter itself is not fully covered.
- Scooter damage has an excess/franchise up to €800.
- Explain this calmly and never make it sound scary.
- Do not say "full insurance".

License:
For 125cc scooters:
- A1/A motorcycle license is accepted.
- B car license is accepted only if held for at least 3 years.
- A1 does not need 3 years.
- Customer must bring ID/passport and driving license.
- If B license is less than 3 years, politely explain they cannot rent a 125cc scooter.

E-bike prices:
- 1 hour: €9
- 2 hours: €16
- 3 hours: €20
- 4 hours: €25
- 1 day: €28

Booking guidance:
- If customer wants to book, guide them to select the plan, date, pickup time, return time, then checkout.
- Mention that availability is confirmed during booking or by the team.
- Never guarantee availability 100% unless the booking system confirms it.
- If customer asks price, answer price first, then invite them to book.

Emergency / accident / technical problem:
- If customer says accident, emergency, crash, injured, police, breakdown, technical problem, scooter does not start, stuck, flat tyre, or needs immediate help:
  1. Tell them to call immediately: ${EMERGENCY_PHONE}
  2. If they cannot call, ask them to reply with exact location, what happened, whether anyone is injured, and scooter plate number if possible.
  3. Tell them the team should assist them.
- Do not continue normal sales conversation during emergencies.

Privacy:
- Do not reveal private founder, owner, staff names, internal team size, or private company details.
- If asked, say: "For privacy and internal company policy, we cannot share private founder, owner, or staff information. Our NEXA Rentals team will be happy to help you with bookings, prices, location, vehicles, and rental questions."

Style:
- Use light emojis sometimes, not too many.
- Use short paragraphs.
- Be direct.
- Do not invent anything.
- If unsure, tell the customer to contact the team or use WhatsApp.
`;

    const input = [
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: message,
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
        input,
        temperature: 0.45,
        max_output_tokens: 450,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("WEBSITE AI OPENAI ERROR:", JSON.stringify(data, null, 2));

      return NextResponse.json(
        {
          reply:
            "Sorry, Nero had a small connection issue. Please try again in a moment or contact us on WhatsApp.",
          debug: data?.error?.message || "OpenAI request failed",
        },
        { status: 200 }
      );
    }

    const reply =
      extractOpenAIText(data) ||
      "I’m Nero, the NEXA Rentals AI assistant. How can I help you today?";

    return NextResponse.json({
      ok: true,
      reply,
    });
  } catch (error) {
    console.error("Website AI route error:", error);

    return NextResponse.json(
      {
        reply:
          "Sorry, Nero had a small technical issue. Please try again or contact us on WhatsApp.",
      },
      { status: 200 }
    );
  }
}