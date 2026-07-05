import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function calcFullPayment(totalAmount: number) {
  return Math.round(totalAmount);
}

function cleanMetadataValue(value: unknown, maxLength = 500) {
  if (value === null || value === undefined) return "";
  return String(value).slice(0, maxLength);
}

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured." },
        { status: 500 }
      );
    }

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
      vehicleCode,
      assignedVehicleCode,
      assignedVehicleName,
      assignedVehicleMatricula,
      assignedVehicleDisplayName,
      fleetGroup,

      plan,
      ratePerDay,
      days,
      total,

      availabilityChecked,
      availableCount,
      totalFleet,

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

    const finalVehicleName =
      assignedVehicleDisplayName ||
      bikeName ||
      vehicleName ||
      vehicle ||
      assignedVehicleName ||
      "";

    const finalPublicVehicleName =
      vehicleName || vehicle || bikeName || assignedVehicleName || "";

    const finalVehicleCode = assignedVehicleCode || vehicleCode || "";

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

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email" },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { error: "Missing customer name" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Missing customer phone" },
        { status: 400 }
      );
    }

    if (!vehicleId || !finalVehicleName) {
      return NextResponse.json(
        { error: "Missing vehicle details" },
        { status: 400 }
      );
    }

    if (!finalVehicleCode) {
      return NextResponse.json(
        {
          error:
            "Missing assigned scooter code. Please go back and select the dates again.",
        },
        { status: 400 }
      );
    }

    if (!fleetGroup) {
      return NextResponse.json(
        {
          error:
            "Missing fleet group. Please go back and select the vehicle again.",
        },
        { status: 400 }
      );
    }

    if (!pickupDateISO || !returnDateISO || !pickupTime || !dropoffTime) {
      return NextResponse.json(
        { error: "Missing rental date or time details" },
        { status: 400 }
      );
    }

    // IMPORTANT:
    // totalAmount is already sent to Stripe in cents.
    // Example: €39.00 = 3900
    // Old system charged 50% here.
    // New system charges the full booking amount online.
    const amountToCharge = calcFullPayment(totalAmount);
    const amountPaidOnline = amountToCharge;
    const remainingAmount = 0;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountToCharge,
      currency: String(currency).toLowerCase(),

      automatic_payment_methods: {
        enabled: true,
      },

      receipt_email: cleanMetadataValue(customerEmail, 250),

      metadata: {
        bookingId: cleanMetadataValue(bookingId, 120),

        totalAmount: String(totalAmount),
        amountToCharge: String(amountToCharge),
        amountPaidOnline: String(amountPaidOnline),
        remainingAmount: String(remainingAmount),

        paymentType: "pay_full_amount",
        booking_source: "website",
        booking_status: "payment_pending",

        customer_email: cleanMetadataValue(customerEmail, 250),
        customer_name: cleanMetadataValue(customerName, 250),
        phone: cleanMetadataValue(phone, 80),

        vehicle_id: cleanMetadataValue(vehicleId, 80),
        vehicle_name: cleanMetadataValue(finalVehicleName, 220),
        public_vehicle_name: cleanMetadataValue(finalPublicVehicleName, 180),

        vehicle_code: cleanMetadataValue(finalVehicleCode, 40),
        assigned_vehicle_code: cleanMetadataValue(finalVehicleCode, 40),
        assigned_vehicle_name: cleanMetadataValue(assignedVehicleName, 160),
        assigned_vehicle_matricula: cleanMetadataValue(
          assignedVehicleMatricula,
          80
        ),
        assigned_vehicle_display_name: cleanMetadataValue(
          finalVehicleName,
          220
        ),
        fleet_group: cleanMetadataValue(fleetGroup, 80),

        plan: cleanMetadataValue(plan || "full", 40),
        rate_per_day: ratePerDay !== undefined ? String(ratePerDay) : "",
        days: days !== undefined ? String(days) : "",
        rental_total_eur: total !== undefined ? String(total) : "",

        pickup_date: cleanMetadataValue(pickupDateISO, 40),
        dropoff_date: cleanMetadataValue(returnDateISO, 40),
        pickup_time: cleanMetadataValue(pickupTime, 40),
        dropoff_time: cleanMetadataValue(dropoffTime, 40),
        pickup_location: cleanMetadataValue(pickupLocation, 250),

        availability_checked: cleanMetadataValue(
          availabilityChecked || "pending-api",
          80
        ),
        available_count: cleanMetadataValue(availableCount, 40),
        total_fleet: cleanMetadataValue(totalFleet, 40),

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

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingId,

      amountToCharge,
      amountPaidOnline,
      remainingAmount,
      totalAmount,

      // Compatibility with old frontend names.
      // This prevents breaking other files that may still read depositAmount.
      depositAmount: amountToCharge,

      currency,
      assignedVehicleCode: finalVehicleCode,
      fleetGroup,
    });
  } catch (error: any) {
    console.error("Stripe PaymentIntent Error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}