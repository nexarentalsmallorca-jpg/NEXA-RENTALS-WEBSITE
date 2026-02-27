import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // IMPORTANT: Stripe needs Node runtime (not Edge)
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(stripeSecretKey);

type Body = {
  amount: number; // cents
  name?: string;
  locale?: string;

  // Optional booking data (recommended)
  booking?: {
    vehicleId?: string;
    vehicleName?: string;
    pickupLocation?: string;
    from?: string;
    to?: string;
    pickupTime?: string;
    dropoffTime?: string;
    rentalDays?: number;
    total?: number; // euros
    payNow?: number; // euros
    payPickup?: number; // euros
    customerName?: string;
    customerSurname?: string;
    customerPhone?: string;
    customerEmail?: string;
  };
};

function safeLocale(input?: string) {
  // Allow only short locales you use (change if you need more)
  const allowed = new Set(["en", "es", "fr", "de", "it"]);
  if (!input) return "en";
  return allowed.has(input) ? input : "en";
}

export async function POST(req: Request) {
  try {
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const body = (await req.json()) as Body;

    const amount = Number(body.amount);
    const locale = safeLocale(body.locale);

    // ✅ Validate amount (must be integer cents, minimum €1)
    if (!Number.isFinite(amount) || amount < 100 || Math.round(amount) !== amount) {
      return NextResponse.json(
        { error: "Invalid amount. Must be integer cents and >= 100." },
        { status: 400 }
      );
    }

    const productName = body.name?.trim() || "NEXA Rental Deposit (50%)";

    // Optional metadata for later webhooks / confirmations
    const meta: Record<string, string> = {};
    if (body.booking) {
      const b = body.booking;
      if (b.vehicleId) meta.vehicleId = String(b.vehicleId);
      if (b.vehicleName) meta.vehicleName = String(b.vehicleName);
      if (b.pickupLocation) meta.pickupLocation = String(b.pickupLocation);
      if (b.from) meta.from = String(b.from);
      if (b.to) meta.to = String(b.to);
      if (b.pickupTime) meta.pickupTime = String(b.pickupTime);
      if (b.dropoffTime) meta.dropoffTime = String(b.dropoffTime);
      if (typeof b.rentalDays === "number") meta.rentalDays = String(b.rentalDays);

      if (typeof b.total === "number") meta.total = String(b.total);
      if (typeof b.payNow === "number") meta.payNow = String(b.payNow);
      if (typeof b.payPickup === "number") meta.payPickup = String(b.payPickup);

      if (b.customerName) meta.customerName = String(b.customerName);
      if (b.customerSurname) meta.customerSurname = String(b.customerSurname);
      if (b.customerPhone) meta.customerPhone = String(b.customerPhone);
      if (b.customerEmail) meta.customerEmail = String(b.customerEmail);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      // card + wallets automatically where supported
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
            },
            unit_amount: amount, // cents
          },
          quantity: 1,
        },
      ],

      // Nice to collect email in Stripe too
      customer_email: body.booking?.customerEmail || undefined,

      // Metadata stays with the payment/session
      metadata: meta,

      success_url: `${origin}/${locale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      {
        error: "Stripe checkout failed",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}