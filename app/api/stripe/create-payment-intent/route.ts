import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// 50% deposit calculator
function calcDeposit(totalAmount: number) {
  return Math.round(totalAmount * 0.5);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      bookingId,
      totalAmount, // cents
      currency = "eur",
      customerEmail,
      pickupDateISO,
      returnDateISO,
      bikeName,
    } = body;

    // Basic validation
    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid totalAmount" },
        { status: 400 }
      );
    }

    const depositAmount = calcDeposit(totalAmount);

    // Create PaymentIntent (CUSTOM CHECKOUT)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: currency.toLowerCase(),

      // Enables Apple Pay, Google Pay automatically
      automatic_payment_methods: {
        enabled: true,
      },

      receipt_email: customerEmail,

      metadata: {
        bookingId: String(bookingId),
        totalAmount: String(totalAmount),
        depositAmount: String(depositAmount),
        remainingAmount: String(totalAmount - depositAmount),
        pickupDateISO: pickupDateISO ? String(pickupDateISO) : "",
        returnDateISO: returnDateISO ? String(returnDateISO) : "",
        bikeName: bikeName ? String(bikeName) : "",
        paymentType: "deposit_50_percent",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      depositAmount,
      currency,
    });
  } catch (error: any) {
    console.error("Stripe PaymentIntent Error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}