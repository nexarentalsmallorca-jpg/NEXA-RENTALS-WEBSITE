import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

const OWNER_EMAIL = process.env.OWNER_EMAIL!;
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  process.env.RESEND_FROM ||
  "onboarding@resend.dev"; // works for testing

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("STRIPE WEBHOOK ERROR:", err);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Payment succeeded = booking confirmed
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const md = pi.metadata || {};

    const amount = pi.amount_received ?? pi.amount ?? 0;
    const currency = (pi.currency || "eur").toUpperCase();

    // Save booking (upsert avoids duplicates if webhook retries)
    const payload = {
      stripe_payment_intent_id: pi.id,
      status: "paid",
      customer_name: md.customer_name || "",
      customer_email: md.customer_email || "",
      phone: md.phone || "",
      pickup_date: md.pickup_date || "",
      pickup_time: md.pickup_time || "",
      dropoff_date: md.dropoff_date || "",
      dropoff_time: md.dropoff_time || "",
      vehicle_name: md.vehicle_name || "",
      amount,
      currency: pi.currency || "eur",
    };

    console.log("SUPABASE PAYLOAD:", payload);

    const { data: bookingRow, error: bookingError } = await supabase
      .from("bookings")
      .upsert(payload, { onConflict: "stripe_payment_intent_id" })
      .select();

    console.log("SUPABASE RESULT:", bookingRow);

    if (bookingError) {
      console.error("SUPABASE UPSERT ERROR:", bookingError);
    }

    // Email you
    try {
      const ownerEmailResult = await resend.emails.send({
        from: `Nexa Bookings <${FROM_EMAIL}>`,
        to: OWNER_EMAIL,
        subject: `✅ New booking paid — ${(amount / 100).toFixed(2)} ${currency}`,
        html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
    
    <h2 style="color:#0ea5e9;">Your booking is confirmed ✅</h2>

    <p>Hi ${md.customer_name || ""},</p>
    <p>Thank you for choosing <b>Nexa Rentals</b>. Your booking has been successfully confirmed.</p>

    <hr/>

    <h3>📄 Booking Details</h3>
    <p><b>Booking ID:</b> ${md.bookingId || "-"}</p>
    <p><b>Vehicle:</b> ${md.vehicle_name || "-"}</p>
    <p><b>Pickup:</b> ${md.pickup_date || "-"} ${md.pickup_time || ""}</p>
    <p><b>Dropoff:</b> ${md.dropoff_date || "-"} ${md.dropoff_time || ""}</p>
    <p><b>Pickup Location:</b> ${md.pickup_location || "Magaluf (Carrer Galeón 13)"}</p>

    <hr/>

    <h3>💳 Payment Summary</h3>
    <p><b>Amount Paid:</b> ${(amount / 100).toFixed(2)} ${currency}</p>
    <p><b>Remaining Amount (to pay at pickup):</b> ${
      md.remainingAmount
        ? (Number(md.remainingAmount) / 100).toFixed(2)
        : "-"
    } ${currency}</p>

    <hr/>

    <h3>📍 Pickup Instructions</h3>
    <ul>
      <li>Please arrive at the pickup location on time.</li>
      <li>Bring all required documents (see below).</li>
      <li>Our team will assist you with the vehicle handover.</li>
    </ul>

    <h3>🪪 Required Documents</h3>
    <ul>
      <li>Valid driving licence (original, no copies)</li>
      <li>Passport or national ID</li>
    </ul>

    <h3>💰 Deposit & Payment</h3>
    <ul>
      <li>A <b>€150 security deposit</b> is required at pickup</li>
      <li>Deposit is accepted <b>ONLY by card</b></li>
      <li>Remaining rental amount must be paid at pickup</li>
    </ul>

    <hr/>

    <p>If you have any questions, simply reply to this email or contact us directly.</p>

    <p>We look forward to serving you 🚀</p>

    <p><b>Nexa Rentals Team</b><br/>
    Magaluf, Mallorca</p>

  </div>
`,
      });

      if (ownerEmailResult.error) {
        console.error("OWNER EMAIL ERROR:", ownerEmailResult.error);
      } else {
        console.log("OWNER EMAIL SENT:", ownerEmailResult.data);
      }
    } catch (error) {
      console.error("OWNER EMAIL SEND FAILED:", error);
    }

    // Email customer confirmation
    const customerEmail = md.customer_email;

    if (customerEmail) {
      try {
        const customerEmailResult = await resend.emails.send({
          from: `Nexa Rentals <${FROM_EMAIL}>`,
          to: customerEmail,
          subject: "✅ Your booking is confirmed",
          html: `
            <h2>Your booking is confirmed ✅</h2>
            <p>Hi ${md.customer_name || ""},</p>
            <p>Here are your booking details:</p>

            <p><b>Booking ID:</b> ${md.bookingId || "-"}</p>
            <p><b>Vehicle:</b> ${md.vehicle_name || "-"}</p>
            <p><b>Pickup:</b> ${md.pickup_date || "-"} ${md.pickup_time || ""}</p>
            <p><b>Dropoff:</b> ${md.dropoff_date || "-"} ${md.dropoff_time || ""}</p>
            <p><b>Pickup Location:</b> ${md.pickup_location || "-"}</p>

            <p><b>Amount Paid:</b> ${(amount / 100).toFixed(2)} ${currency}</p>

            <p><b>Remaining amount at pickup:</b> ${
              md.remainingAmount
                ? (Number(md.remainingAmount) / 100).toFixed(2)
                : "-"
            } ${currency}</p>

            <p>If you need help, reply to this email.</p>
          `,
        });

        if (customerEmailResult.error) {
          console.error("CUSTOMER EMAIL ERROR:", customerEmailResult.error);
        } else {
          console.log("CUSTOMER EMAIL SENT:", customerEmailResult.data);
        }
      } catch (error) {
        console.error("CUSTOMER EMAIL SEND FAILED:", error);
      }
    } else {
      console.log("NO CUSTOMER EMAIL FOUND IN METADATA");
    }
  }

  return NextResponse.json({ received: true });
}