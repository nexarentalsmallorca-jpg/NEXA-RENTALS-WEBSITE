import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

function cleanMetadataValue(value: unknown, maxLength = 500) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 15) {
    return null;
  }

  return quantity;
}

async function cancelHold(holdId: string, status = "cancelled") {
  const { error } = await supabaseAdmin
    .from("payment_holds")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", holdId)
    .eq("status", "active");

  if (error) {
    console.error("Could not cancel payment hold:", error);
  }
}

export async function POST(req: Request) {
  let createdHoldId: string | null = null;
  let createdPaymentIntentId: string | null = null;

  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

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
      vehicle,
      vehicleName,
      vehicleId,
      fleetGroup,
      quantity: rawQuantity,

      plan,
      ratePerDay,
      days,
      total,

      notes,

      dlFrontName,
      dlBackName,
      idFrontName,
      idBackName,

      dlFrontPath,
      dlBackPath,
      idFrontPath,
      idBackPath,

      marketingOptIn,
    } = body;

    const quantity = normalizeQuantity(rawQuantity);

    const finalVehicleName =
      vehicleName || vehicle || bikeName || "125cc Scooter";

    const normalizedFleetGroup = String(fleetGroup || "")
      .trim()
      .toLowerCase();

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "Missing booking ID." },
        { status: 400 }
      );
    }

    if (
      typeof totalAmount !== "number" ||
      !Number.isInteger(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid booking total." },
        { status: 400 }
      );
    }

    if (!customerEmail || typeof customerEmail !== "string") {
      return NextResponse.json(
        { error: "Missing customer email." },
        { status: 400 }
      );
    }

    if (!customerName || typeof customerName !== "string") {
      return NextResponse.json(
        { error: "Missing customer name." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Missing customer phone." },
        { status: 400 }
      );
    }

    if (!vehicleId || !finalVehicleName) {
      return NextResponse.json(
        { error: "Missing vehicle details." },
        { status: 400 }
      );
    }

    if (!normalizedFleetGroup) {
      return NextResponse.json(
        {
          error:
            "Missing fleet group. Please return to the booking page and select the scooter again.",
        },
        { status: 400 }
      );
    }

    if (!quantity) {
      return NextResponse.json(
        { error: "Invalid scooter quantity." },
        { status: 400 }
      );
    }

    if (
      !pickupDateISO ||
      !returnDateISO ||
      !pickupTime ||
      !dropoffTime
    ) {
      return NextResponse.json(
        { error: "Missing rental date or time details." },
        { status: 400 }
      );
    }

    /*
     * Create the protected inventory hold inside Supabase.
     *
     * The database function locks this fleet group while calculating
     * capacity, preventing two customers from buying the final scooter
     * simultaneously.
     */
    const { data: holdRows, error: holdError } = await supabaseAdmin.rpc(
      "create_online_payment_hold",
      {
        p_booking_id: bookingId.trim(),
        p_fleet_group: normalizedFleetGroup,
        p_quantity: quantity,
        p_pickup_date: String(pickupDateISO).trim(),
        p_pickup_time: String(pickupTime).trim(),
        p_dropoff_date: String(returnDateISO).trim(),
        p_dropoff_time: String(dropoffTime).trim(),
        p_customer_email: customerEmail.trim(),
        p_hold_minutes: 15,
      }
    );

    if (holdError) {
      console.error("Inventory hold error:", holdError);

      const message =
        holdError.message ||
        "The selected scooter is no longer available.";

      const isAvailabilityError =
        message.toLowerCase().includes("available") ||
        message.toLowerCase().includes("inventory") ||
        message.toLowerCase().includes("scooter");

      return NextResponse.json(
        {
          error: message,
          code: "INSUFFICIENT_AVAILABILITY",
        },
        { status: isAvailabilityError ? 409 : 400 }
      );
    }

    const holdResult = Array.isArray(holdRows)
      ? holdRows[0]
      : holdRows;

    if (!holdResult?.hold_id) {
      throw new Error("Supabase did not return a payment hold ID.");
    }

    createdHoldId = String(holdResult.hold_id);

    const availableAfterHold = Number(
      holdResult.available_count ?? 0
    );

    const totalOnlineFleet = Number(
      holdResult.total_online_fleet ?? 0
    );

    const holdExpiresAt = String(holdResult.expires_at || "");

    const amountToCharge = totalAmount;
    const amountPaidOnline = amountToCharge;
    const remainingAmount = 0;

    /*
     * No N1, N2, N3, etc. is assigned here.
     *
     * The website reserves only:
     * fleet group + quantity + rental period.
     */
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountToCharge,
      currency: String(currency).toLowerCase(),

      automatic_payment_methods: {
        enabled: true,
      },

      receipt_email: cleanMetadataValue(customerEmail, 250),

      metadata: {
        bookingId: cleanMetadataValue(bookingId, 120),
        hold_id: cleanMetadataValue(createdHoldId, 120),

        booking_source: "website",
        booking_status: "payment_pending",
        payment_type: "pay_full_amount",

        quantity: String(quantity),
        fleet_group: cleanMetadataValue(normalizedFleetGroup, 80),

        total_amount: String(totalAmount),
        amount_to_charge: String(amountToCharge),
        amount_paid_online: String(amountPaidOnline),
        remaining_amount: String(remainingAmount),

        customer_email: cleanMetadataValue(customerEmail, 250),
        customer_name: cleanMetadataValue(customerName, 250),
        phone: cleanMetadataValue(phone, 80),

        vehicle_id: cleanMetadataValue(vehicleId, 80),
        vehicle_name: cleanMetadataValue(finalVehicleName, 220),

        plan: cleanMetadataValue(plan || "full", 40),
        rate_per_day:
          ratePerDay !== undefined ? String(ratePerDay) : "",
        days: days !== undefined ? String(days) : "",
        rental_total_eur:
          total !== undefined ? String(total) : "",

        pickup_date: cleanMetadataValue(pickupDateISO, 40),
        dropoff_date: cleanMetadataValue(returnDateISO, 40),
        pickup_time: cleanMetadataValue(pickupTime, 40),
        dropoff_time: cleanMetadataValue(dropoffTime, 40),
        pickup_location: cleanMetadataValue(pickupLocation, 250),

        total_online_fleet: String(totalOnlineFleet),
        available_after_hold: String(availableAfterHold),
        hold_expires_at: cleanMetadataValue(holdExpiresAt, 80),

        notes: cleanMetadataValue(notes, 500),

        dl_front_name: cleanMetadataValue(dlFrontName, 180),
        dl_back_name: cleanMetadataValue(dlBackName, 180),
        id_front_name: cleanMetadataValue(idFrontName, 180),
        id_back_name: cleanMetadataValue(idBackName, 180),

        dl_front_path: cleanMetadataValue(dlFrontPath, 250),
        dl_back_path: cleanMetadataValue(dlBackPath, 250),
        id_front_path: cleanMetadataValue(idFrontPath, 250),
        id_back_path: cleanMetadataValue(idBackPath, 250),

        marketing_opt_in: marketingOptIn ? "yes" : "no",
      },
    });

    createdPaymentIntentId = paymentIntent.id;

    if (!paymentIntent.client_secret) {
      throw new Error("Stripe did not return a payment client secret.");
    }

    /*
     * Connect the Stripe PaymentIntent to the protected hold.
     */
    const { error: linkError } = await supabaseAdmin
      .from("payment_holds")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", createdHoldId)
      .eq("status", "active");

    if (linkError) {
      console.error("PaymentIntent hold-link error:", linkError);

      await stripe.paymentIntents.cancel(paymentIntent.id).catch(
        (cancelError) => {
          console.error(
            "Could not cancel unlinked PaymentIntent:",
            cancelError
          );
        }
      );

      await cancelHold(createdHoldId, "cancelled");

      createdPaymentIntentId = null;
      createdHoldId = null;

      throw new Error(
        "The payment session could not be connected to the scooter reservation."
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingId,

      holdId: createdHoldId,
      holdExpiresAt,

      quantity,
      fleetGroup: normalizedFleetGroup,

      availableCount: availableAfterHold,
      totalFleet: totalOnlineFleet,

      amountToCharge,
      amountPaidOnline,
      remainingAmount,
      totalAmount,

      /*
       * Temporary compatibility with the existing checkout.
       * It still receives depositAmount, but it represents the
       * complete amount paid online.
       */
      depositAmount: amountToCharge,

      currency: String(currency).toLowerCase(),
    });
  } catch (error: any) {
    console.error("Create PaymentIntent error:", error);

    /*
     * If Stripe was created but a later operation failed,
     * cancel the unused PaymentIntent.
     */
    if (createdPaymentIntentId && stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey);

      await stripe.paymentIntents
        .cancel(createdPaymentIntentId)
        .catch((cancelError) => {
          console.error(
            "Could not cancel failed PaymentIntent:",
            cancelError
          );
        });
    }

    /*
     * Release inventory when checkout creation fails.
     */
    if (createdHoldId) {
      await cancelHold(createdHoldId, "cancelled");
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "The secure payment session could not be created.",
      },
      { status: 500 }
    );
  }
}