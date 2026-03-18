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
          <h2>New booking received ✅</h2>
          <p><b>Booking ID:</b> ${md.bookingId || "-"}</p>
          <p><b>Name:</b> ${md.customer_name || "-"}</p>
          <p><b>Email:</b> ${md.customer_email || "-"}</p>
          <p><b>Phone:</b> ${md.phone || "-"}</p>
          <hr/>
          <p><b>Vehicle:</b> ${md.vehicle_name || "-"}</p>
          <p><b>Vehicle ID:</b> ${md.vehicle_id || "-"}</p>
          <p><b>Pickup:</b> ${md.pickup_date || "-"} ${md.pickup_time || ""}</p>
          <p><b>Dropoff:</b> ${md.dropoff_date || "-"} ${md.dropoff_time || ""}</p>
          <p><b>Pickup location:</b> ${md.pickup_location || "-"}</p>
          <p><b>Notes:</b> ${md.notes || "-"}</p>
          <hr/>
          <p><b>Driving licence front:</b> ${md.dl_front_name || "-"}</p>
          <p><b>Driving licence back:</b> ${md.dl_back_name || "-"}</p>
          <p><b>ID front:</b> ${md.id_front_name || "-"}</p>
          <p><b>ID back:</b> ${md.id_back_name || "-"}</p>
          <hr/>
          <p><b>Total rental amount:</b> ${
            md.totalAmount ? (Number(md.totalAmount) / 100).toFixed(2) : "-"
          } ${currency}</p>
          <p><b>Deposit paid now:</b> ${
            md.depositAmount ? (Number(md.depositAmount) / 100).toFixed(2) : "-"
          } ${currency}</p>
          <p><b>Remaining amount:</b> ${
            md.remainingAmount
              ? (Number(md.remainingAmount) / 100).toFixed(2)
              : "-"
          } ${currency}</p>
          <p><b>Amount Paid:</b> ${(amount / 100).toFixed(2)} ${currency}</p>
          <p><b>Marketing opt-in:</b> ${md.marketing_opt_in || "no"}</p>
          <p><b>PaymentIntent:</b> ${pi.id}</p>
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