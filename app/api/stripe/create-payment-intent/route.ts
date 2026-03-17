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
      totalAmount,
      currency = "eur",
      customerEmail,
      customerName,
      phone,
      pickupDateISO,
      returnDateISO,
      pickupTime,
      dropoffTime,
      pickupLocation,
      bikeName,
      vehicleId,
      notes,
      dlFrontName,
      dlBackName,
      idFrontName,
      idBackName,
      marketingOptIn,
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

      automatic_payment_methods: {
        enabled: true,
      },

      receipt_email: customerEmail,

      metadata: {
        bookingId: String(bookingId),
        totalAmount: String(totalAmount),
        depositAmount: String(depositAmount),
        remainingAmount: String(totalAmount - depositAmount),

        paymentType: "pay_50_percent",

        customer_email: customerEmail ? String(customerEmail) : "",
        customer_name: customerName ? String(customerName) : "",
        phone: phone ? String(phone) : "",

        vehicle_id: vehicleId ? String(vehicleId) : "",
        vehicle_name: bikeName ? String(bikeName) : "",

        pickup_date: pickupDateISO ? String(pickupDateISO) : "",
        dropoff_date: returnDateISO ? String(returnDateISO) : "",
        pickup_time: pickupTime ? String(pickupTime) : "",
        dropoff_time: dropoffTime ? String(dropoffTime) : "",
        pickup_location: pickupLocation ? String(pickupLocation) : "",

        notes: notes ? String(notes).slice(0, 500) : "",
        dl_front_name: dlFrontName ? String(dlFrontName) : "",
        dl_back_name: dlBackName ? String(dlBackName) : "",
        id_front_name: idFrontName ? String(idFrontName) : "",
        id_back_name: idBackName ? String(idBackName) : "",
        marketing_opt_in: marketingOptIn ? "yes" : "no",
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