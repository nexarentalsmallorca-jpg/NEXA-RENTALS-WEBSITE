import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExistingBooking = {
  id: string | number;
  status?: string | null;
  booking_status?: string | null;
};

type HoldConversionResult = {
  found: boolean;
  wasAlreadyConverted: boolean;
};

function safeText(value: unknown) {
  if (value === undefined || value === null) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function metadataText(
  metadata: Stripe.Metadata,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = metadata[key];

    if (
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      return value.trim();
    }
  }

  return "";
}

function normalizeText(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value);

  if (
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= 15
  ) {
    return quantity;
  }

  return 1;
}

function normalizeCents(value: unknown) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount);
}

function moneyFromCents(value: unknown) {
  return (normalizeCents(value) / 100).toFixed(2);
}

function cleanCurrency(value: unknown) {
  return String(value || "eur").toUpperCase();
}

function formatDate(value: string) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return value || "-";
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function getBookingId(pi: Stripe.PaymentIntent) {
  return (
    metadataText(
      pi.metadata || {},
      "bookingId",
      "booking_id"
    ) || pi.id
  );
}

function getHoldId(pi: Stripe.PaymentIntent) {
  const holdId = metadataText(
    pi.metadata || {},
    "hold_id",
    "holdId"
  );

  return isUuid(holdId) ? holdId : "";
}

function getFleetGroup(pi: Stripe.PaymentIntent) {
  const metadata = pi.metadata || {};

  const explicitFleetGroup = normalizeText(
    metadataText(metadata, "fleet_group")
  );

  if (explicitFleetGroup) {
    return explicitFleetGroup;
  }

  /*
   * Compatibility for PaymentIntents created immediately before
   * this new webhook is deployed.
   */
  const vehicleText = normalizeText(
    [
      metadataText(metadata, "vehicle_id"),
      metadataText(metadata, "vehicle_name"),
      metadataText(metadata, "public_vehicle_name"),
    ].join(" ")
  );

  if (
    vehicleText.includes("sym") ||
    vehicleText.includes("symphony") ||
    vehicleText.includes("s3")
  ) {
    return "sym_symphony_125";
  }

  if (
    vehicleText.includes("piaggio") ||
    vehicleText.includes("liberty") ||
    vehicleText.includes("s2")
  ) {
    return "piaggio_liberty_125";
  }

  return "";
}

function getPublicVehicleName(
  pi: Stripe.PaymentIntent
) {
  const metadata = pi.metadata || {};

  return (
    metadataText(
      metadata,
      "public_vehicle_name",
      "vehicle_name"
    ) || "125cc Scooter"
  );
}

function getPaymentSummary(
  pi: Stripe.PaymentIntent
) {
  const metadata = pi.metadata || {};

  const amountPaid =
    normalizeCents(pi.amount_received) ||
    normalizeCents(
      metadataText(
        metadata,
        "amount_paid_online",
        "depositAmount"
      )
    ) ||
    normalizeCents(pi.amount);

  const totalAmount =
    normalizeCents(
      metadataText(
        metadata,
        "total_amount",
        "totalAmount"
      )
    ) || amountPaid;

  const remainingMetadata = metadataText(
    metadata,
    "remaining_amount",
    "remainingAmount"
  );

  const remainingAmount =
    remainingMetadata !== ""
      ? normalizeCents(remainingMetadata)
      : Math.max(totalAmount - amountPaid, 0);

  return {
    amountPaid,
    totalAmount,
    remainingAmount,
    fullyPaid:
      remainingAmount === 0 &&
      amountPaid >= totalAmount,
  };
}

function buildCoreBookingPayload(
  pi: Stripe.PaymentIntent
) {
  const metadata = pi.metadata || {};
  const holdId = getHoldId(pi);
  const fleetGroup = getFleetGroup(pi);
  const quantity = normalizeQuantity(
    metadataText(metadata, "quantity")
  );
  const payment = getPaymentSummary(pi);

  const payload: Record<string, unknown> = {
    stripe_payment_intent_id: pi.id,

    status: "paid",
    booking_status: "confirmed",
    booking_source:
      metadataText(
        metadata,
        "booking_source"
      ) || "website",

    customer_name: metadataText(
      metadata,
      "customer_name"
    ),
    customer_email: metadataText(
      metadata,
      "customer_email"
    ),
    phone: metadataText(metadata, "phone"),

    pickup_date: metadataText(
      metadata,
      "pickup_date"
    ),
    pickup_time: metadataText(
      metadata,
      "pickup_time"
    ),
    dropoff_date: metadataText(
      metadata,
      "dropoff_date"
    ),
    dropoff_time: metadataText(
      metadata,
      "dropoff_time"
    ),

    vehicle_name: getPublicVehicleName(pi),
    fleet_group: fleetGroup || null,
    quantity,

    /*
     * Website bookings reserve a scooter category and quantity.
     * N1–N8 will be assigned manually from the admin system.
     */
    assigned_vehicle_code: null,

    dl_front_path: metadataText(
      metadata,
      "dl_front_path"
    ),
    dl_back_path: metadataText(
      metadata,
      "dl_back_path"
    ),
    id_front_path: metadataText(
      metadata,
      "id_front_path"
    ),
    id_back_path: metadataText(
      metadata,
      "id_back_path"
    ),

    amount: payment.amountPaid,
    currency: pi.currency || "eur",
  };

  if (holdId) {
    payload.hold_id = holdId;
  }

  return payload;
}

function buildFullBookingPayload(
  pi: Stripe.PaymentIntent
) {
  const metadata = pi.metadata || {};
  const corePayload = buildCoreBookingPayload(pi);
  const publicVehicleName = getPublicVehicleName(pi);

  return {
    ...corePayload,

    source:
      metadataText(
        metadata,
        "booking_source"
      ) || "website",

    booking_action: "reserve_now",

    /*
     * These remain empty because exact scooter assignment
     * must happen manually.
     */
    vehicle_code: "",
    scooter_code: "",

    public_vehicle_name: publicVehicleName,

    payment_method:
      pi.payment_method_types?.[0] || "card",
    payment_status: "paid",

    contract_number: getBookingId(pi),
  };
}

function bookingAlreadyConfirmed(
  booking: ExistingBooking
) {
  return (
    normalizeText(booking.status) === "paid" &&
    normalizeText(booking.booking_status) ===
      "confirmed"
  );
}

async function findExistingBooking(
  paymentIntentId: string
) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, status, booking_status")
    .eq(
      "stripe_payment_intent_id",
      paymentIntentId
    )
    .limit(1);

  if (error) {
    throw new Error(
      `Could not check the existing booking: ${error.message}`
    );
  }

  return (data?.[0] || null) as
    | ExistingBooking
    | null;
}

async function writeBookingPayload(
  payload: Record<string, unknown>,
  existingBooking: ExistingBooking | null
) {
  if (existingBooking) {
    return supabaseAdmin
      .from("bookings")
      .update(payload)
      .eq("id", existingBooking.id)
      .select("id")
      .limit(1);
  }

  return supabaseAdmin
    .from("bookings")
    .insert(payload)
    .select("id")
    .limit(1);
}

async function savePaidBooking(
  pi: Stripe.PaymentIntent
) {
  const existingBooking =
    await findExistingBooking(pi.id);

  /*
   * Stripe may retry the same webhook.
   * Never create another booking for the same payment.
   */
  if (
    existingBooking &&
    bookingAlreadyConfirmed(existingBooking)
  ) {
    console.log(
      "BOOKING ALREADY CONFIRMED:",
      pi.id
    );

    return {
      alreadyConfirmed: true,
      bookingRowId: existingBooking.id,
    };
  }

  const fullPayload =
    buildFullBookingPayload(pi);

  let result = await writeBookingPayload(
    fullPayload,
    existingBooking
  );

  /*
   * Compatibility fallback:
   * if an optional legacy column does not exist, save using
   * only the confirmed old + newly installed columns.
   */
  if (result.error) {
    console.warn(
      "FULL BOOKING SAVE FAILED. TRYING CORE PAYLOAD:",
      result.error.message
    );

    const corePayload =
      buildCoreBookingPayload(pi);

    result = await writeBookingPayload(
      corePayload,
      existingBooking
    );
  }

  if (result.error) {
    /*
     * A simultaneous Stripe retry might have inserted the row.
     * Check once more before treating it as a real failure.
     */
    const retryBooking =
      await findExistingBooking(pi.id);

    if (
      retryBooking &&
      bookingAlreadyConfirmed(retryBooking)
    ) {
      return {
        alreadyConfirmed: true,
        bookingRowId: retryBooking.id,
      };
    }

    throw new Error(
      `The paid booking could not be saved: ${result.error.message}`
    );
  }

  const bookingRowId =
    result.data?.[0]?.id ||
    existingBooking?.id;

  console.log(
    "PAID BOOKING SAVED:",
    bookingRowId,
    pi.id
  );

  return {
    alreadyConfirmed: false,
    bookingRowId,
  };
}

async function findPaymentHold(
  pi: Stripe.PaymentIntent
) {
  const holdId = getHoldId(pi);

  if (holdId) {
    const byId = await supabaseAdmin
      .from("payment_holds")
      .select("id, status")
      .eq("id", holdId)
      .limit(1);

    if (byId.error) {
      throw new Error(
        `Could not check the payment hold: ${byId.error.message}`
      );
    }

    if (byId.data?.[0]) {
      return byId.data[0];
    }
  }

  const byPaymentIntent = await supabaseAdmin
    .from("payment_holds")
    .select("id, status")
    .eq(
      "stripe_payment_intent_id",
      pi.id
    )
    .limit(1);

  if (byPaymentIntent.error) {
    throw new Error(
      `Could not check the PaymentIntent hold: ${byPaymentIntent.error.message}`
    );
  }

  return byPaymentIntent.data?.[0] || null;
}

async function convertPaymentHold(
  pi: Stripe.PaymentIntent
): Promise<HoldConversionResult> {
  const hold = await findPaymentHold(pi);

  if (!hold) {
    /*
     * Old PaymentIntents created before the inventory system
     * will not have a hold. Their booking is still saved.
     */
    if (getHoldId(pi)) {
      console.warn(
        "PAYMENT SUCCEEDED BUT HOLD WAS NOT FOUND:",
        pi.id,
        getHoldId(pi)
      );
    }

    return {
      found: false,
      wasAlreadyConverted: false,
    };
  }

  if (
    normalizeText(hold.status) === "converted"
  ) {
    return {
      found: true,
      wasAlreadyConverted: true,
    };
  }

  const { error } = await supabaseAdmin
    .from("payment_holds")
    .update({
      status: "converted",
      stripe_payment_intent_id: pi.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hold.id);

  if (error) {
    throw new Error(
      `The payment hold could not be converted: ${error.message}`
    );
  }

  console.log(
    "PAYMENT HOLD CONVERTED:",
    hold.id
  );

  return {
    found: true,
    wasAlreadyConverted: false,
  };
}

async function releasePaymentHold(
  pi: Stripe.PaymentIntent,
  status:
    | "payment_failed"
    | "cancelled"
) {
  const holdId = getHoldId(pi);

  if (holdId) {
    const byId = await supabaseAdmin
      .from("payment_holds")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", holdId)
      .eq("status", "active");

    if (byId.error) {
      throw new Error(
        `Could not release the payment hold: ${byId.error.message}`
      );
    }
  }

  const byPaymentIntent = await supabaseAdmin
    .from("payment_holds")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq(
      "stripe_payment_intent_id",
      pi.id
    )
    .eq("status", "active");

  if (byPaymentIntent.error) {
    throw new Error(
      `Could not release the PaymentIntent hold: ${byPaymentIntent.error.message}`
    );
  }

  console.log(
    "PAYMENT HOLD RELEASED:",
    pi.id,
    status
  );
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing RESEND_API_KEY."
    );
  }

  return new Resend(apiKey);
}

function getFromEmail() {
  return (
    process.env.FROM_EMAIL ||
    process.env.RESEND_FROM ||
    "onboarding@resend.dev"
  );
}

function getOwnerEmails() {
  const possibleEmails = [
    process.env.OWNER_EMAIL,
    "nexarentalsmallorca@gmail.com",
  ];

  return Array.from(
    new Set(
      possibleEmails.filter(
        (email): email is string =>
          typeof email === "string" &&
          email.trim() !== ""
      )
    )
  );
}

async function sendOwnerEmail(
  pi: Stripe.PaymentIntent,
  bookingRowId: string | number | undefined
) {
  const resend = getResendClient();
  const metadata = pi.metadata || {};
  const payment = getPaymentSummary(pi);

  const quantity = normalizeQuantity(
    metadataText(metadata, "quantity")
  );

  const currency = cleanCurrency(pi.currency);
  const bookingId = getBookingId(pi);
  const fleetGroup = getFleetGroup(pi);
  const holdId = getHoldId(pi);

  const { data, error } =
    await resend.emails.send({
      from: `Nexa Bookings <${getFromEmail()}>`,
      to: getOwnerEmails(),
      subject: `✅ New booking paid — ${quantity} scooter${
        quantity === 1 ? "" : "s"
      }`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
          <h2 style="color:#f97316;">
            New paid booking received ✅
          </h2>

          <div style="background:#ecfdf3;border:1px solid #22c55e;padding:12px;border-radius:10px;margin-bottom:16px;">
            <b>Payment received successfully.</b><br/>
            Exact scooter codes N1–N8 have not been assigned automatically.
            Assign the scooters manually from the admin system.
          </div>

          <p><b>Booking ID:</b> ${safeText(
            bookingId
          )}</p>

          <p><b>Database row:</b> ${safeText(
            bookingRowId || "-"
          )}</p>

          <p><b>PaymentIntent:</b> ${safeText(
            pi.id
          )}</p>

          <p><b>Payment hold:</b> ${safeText(
            holdId || "-"
          )}</p>

          <hr/>

          <p><b>Customer:</b> ${safeText(
            metadataText(metadata, "customer_name") || "-"
          )}</p>

          <p><b>Email:</b> ${safeText(
            metadataText(metadata, "customer_email") || "-"
          )}</p>

          <p><b>Phone:</b> ${safeText(
            metadataText(metadata, "phone") || "-"
          )}</p>

          <hr/>

          <p><b>Vehicle category:</b> ${safeText(
            getPublicVehicleName(pi)
          )}</p>

          <p><b>Fleet group:</b> ${safeText(
            fleetGroup || "-"
          )}</p>

          <p><b>Quantity:</b> ${quantity}</p>

          <p><b>Exact scooter assignment:</b>
            Manual assignment required
          </p>

          <p><b>Plan:</b> ${safeText(
            metadataText(metadata, "plan") || "-"
          )}</p>

          <p><b>Days:</b> ${safeText(
            metadataText(metadata, "days") || "-"
          )}</p>

          <p><b>Rate per day:</b> ${safeText(
            metadataText(metadata, "rate_per_day") || "-"
          )}</p>

          <p><b>Pickup:</b> ${safeText(
            formatDate(
              metadataText(metadata, "pickup_date")
            )
          )} at ${safeText(
            metadataText(metadata, "pickup_time") || "-"
          )}</p>

          <p><b>Drop-off:</b> ${safeText(
            formatDate(
              metadataText(metadata, "dropoff_date")
            )
          )} at ${safeText(
            metadataText(metadata, "dropoff_time") || "-"
          )}</p>

          <p><b>Pickup location:</b> ${safeText(
            metadataText(metadata, "pickup_location") || "-"
          )}</p>

          <p><b>Available after hold:</b> ${safeText(
            metadataText(
              metadata,
              "available_after_hold",
              "available_count"
            ) || "-"
          )}</p>

          <p><b>Total online fleet:</b> ${safeText(
            metadataText(
              metadata,
              "total_online_fleet",
              "total_fleet"
            ) || "-"
          )}</p>

          <p><b>Notes:</b> ${safeText(
            metadataText(metadata, "notes") || "-"
          )}</p>

          <hr/>

          <p><b>Driving licence front:</b> ${safeText(
            metadataText(metadata, "dl_front_name") || "-"
          )}</p>

          <p><b>Driving licence front path:</b> ${safeText(
            metadataText(metadata, "dl_front_path") || "-"
          )}</p>

          <p><b>Driving licence back:</b> ${safeText(
            metadataText(metadata, "dl_back_name") || "-"
          )}</p>

          <p><b>Driving licence back path:</b> ${safeText(
            metadataText(metadata, "dl_back_path") || "-"
          )}</p>

          <p><b>ID front:</b> ${safeText(
            metadataText(metadata, "id_front_name") || "-"
          )}</p>

          <p><b>ID front path:</b> ${safeText(
            metadataText(metadata, "id_front_path") || "-"
          )}</p>

          <p><b>ID back:</b> ${safeText(
            metadataText(metadata, "id_back_name") || "-"
          )}</p>

          <p><b>ID back path:</b> ${safeText(
            metadataText(metadata, "id_back_path") || "-"
          )}</p>

          <hr/>

          <p><b>Total rental amount:</b>
            ${moneyFromCents(payment.totalAmount)}
            ${currency}
          </p>

          <p><b>Amount paid online:</b>
            ${moneyFromCents(payment.amountPaid)}
            ${currency}
          </p>

          <p><b>Remaining rental amount:</b>
            ${moneyFromCents(payment.remainingAmount)}
            ${currency}
          </p>

          <p><b>Rental fully paid:</b>
            ${payment.fullyPaid ? "Yes" : "No"}
          </p>

          <p><b>Marketing opt-in:</b> ${safeText(
            metadataText(metadata, "marketing_opt_in") || "no"
          )}</p>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      `Owner confirmation email failed: ${error.message}`
    );
  }

  console.log("OWNER EMAIL SENT:", data);
}

async function sendCustomerEmail(
  pi: Stripe.PaymentIntent
) {
  const metadata = pi.metadata || {};
  const customerEmail = metadataText(
    metadata,
    "customer_email"
  );

  if (!customerEmail) {
    console.warn(
      "CUSTOMER EMAIL MISSING:",
      pi.id
    );
    return;
  }

  const resend = getResendClient();
  const payment = getPaymentSummary(pi);
  const currency = cleanCurrency(pi.currency);

  const quantity = normalizeQuantity(
    metadataText(metadata, "quantity")
  );

  const paymentMessage = payment.fullyPaid
    ? `
      <p style="color:#15803d;">
        <b>Your complete rental amount has been paid online.</b>
        No rental balance remains to be paid at pickup.
      </p>
    `
    : `
      <p>
        <b>Remaining rental amount due at pickup:</b>
        ${moneyFromCents(payment.remainingAmount)} ${currency}
      </p>
    `;

  const { data, error } =
    await resend.emails.send({
      from: `Nexa Rentals <${getFromEmail()}>`,
      to: customerEmail,
      subject: "✅ Your Nexa Rentals booking is confirmed",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
          <h2 style="color:#f97316;">
            Your booking is confirmed ✅
          </h2>

          <p>
            Hi ${safeText(
              metadataText(metadata, "customer_name")
            )},
          </p>

          <p>
            Thank you for choosing <b>Nexa Rentals</b>.
            Your payment was successful and your booking is confirmed.
          </p>

          <hr/>

          <h3>Booking details</h3>

          <p><b>Booking ID:</b> ${safeText(
            getBookingId(pi)
          )}</p>

          <p><b>Vehicle:</b> ${safeText(
            getPublicVehicleName(pi)
          )}</p>

          <p><b>Quantity:</b> ${quantity}</p>

          <p><b>Plan:</b> ${safeText(
            metadataText(metadata, "plan") || "-"
          )}</p>

          <p><b>Pickup:</b> ${safeText(
            formatDate(
              metadataText(metadata, "pickup_date")
            )
          )} at ${safeText(
            metadataText(metadata, "pickup_time") || "-"
          )}</p>

          <p><b>Drop-off:</b> ${safeText(
            formatDate(
              metadataText(metadata, "dropoff_date")
            )
          )} at ${safeText(
            metadataText(metadata, "dropoff_time") || "-"
          )}</p>

          <p><b>Pickup location:</b> ${safeText(
            metadataText(metadata, "pickup_location") ||
              "Carrer Galeón 13, Magaluf"
          )}</p>

          <hr/>

          <h3>Payment summary</h3>

          <p><b>Total rental amount:</b>
            ${moneyFromCents(payment.totalAmount)}
            ${currency}
          </p>

          <p><b>Amount paid online:</b>
            ${moneyFromCents(payment.amountPaid)}
            ${currency}
          </p>

          ${paymentMessage}

          <hr/>

          <h3>Required documents</h3>

          <ul>
            <li>Original valid driving licence</li>
            <li>Passport or national ID</li>
          </ul>

          <h3>Refundable security deposit</h3>

          <ul>
            <li>
              A refundable security deposit of
              <b>€150 per scooter</b> is required at pickup.
            </li>

            <li>The security deposit is separate from the rental payment.</li>
            <li>The security deposit must be paid at pickup.</li>
          </ul>

          <hr/>

          <p>
            If you have any questions, simply reply to this email
            or contact us directly.
          </p>

          <p>
            We look forward to seeing you.
          </p>

          <p>
            <b>Nexa Rentals Team</b><br/>
            Magaluf, Mallorca, Spain
          </p>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      `Customer confirmation email failed: ${error.message}`
    );
  }

  console.log("CUSTOMER EMAIL SENT:", data);
}

export async function POST(req: Request) {
  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    console.error(
      "Missing STRIPE_SECRET_KEY"
    );

    return new NextResponse(
      "Missing Stripe configuration",
      { status: 500 }
    );
  }

  if (!webhookSecret) {
    console.error(
      "Missing STRIPE_WEBHOOK_SECRET"
    );

    return new NextResponse(
      "Missing Stripe webhook configuration",
      { status: 500 }
    );
  }

  const signature = req.headers.get(
    "stripe-signature"
  );

  if (!signature) {
    return new NextResponse(
      "Missing Stripe signature",
      { status: 400 }
    );
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error(
      "STRIPE WEBHOOK SIGNATURE ERROR:",
      error
    );

    return new NextResponse(
      `Webhook Error: ${
        error?.message ||
        "Invalid Stripe signature"
      }`,
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        /*
         * First save the confirmed booking.
         * If this fails, Stripe receives status 500 and retries.
         */
        const bookingResult =
          await savePaidBooking(paymentIntent);

        /*
         * Then convert the temporary payment hold.
         */
        const holdResult =
          await convertPaymentHold(paymentIntent);

        /*
         * Avoid duplicate confirmation emails on normal
         * Stripe webhook retries.
         *
         * If the booking was saved during an earlier attempt but
         * hold conversion failed, the emails are sent after the
         * retry successfully converts the hold.
         */
        const shouldSendEmails =
          !bookingResult.alreadyConfirmed ||
          (
            holdResult.found &&
            !holdResult.wasAlreadyConverted
          );

        if (shouldSendEmails) {
          try {
            await sendOwnerEmail(
              paymentIntent,
              bookingResult.bookingRowId
            );
          } catch (emailError) {
            console.error(
              "OWNER EMAIL SEND FAILED:",
              emailError
            );
          }

          try {
            await sendCustomerEmail(
              paymentIntent
            );
          } catch (emailError) {
            console.error(
              "CUSTOMER EMAIL SEND FAILED:",
              emailError
            );
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        await releasePaymentHold(
          paymentIntent,
          "payment_failed"
        );

        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent =
          event.data.object as Stripe.PaymentIntent;

        await releasePaymentHold(
          paymentIntent,
          "cancelled"
        );

        break;
      }

      default: {
        console.log(
          "UNHANDLED STRIPE EVENT:",
          event.type
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error: any) {
    console.error(
      "STRIPE WEBHOOK PROCESSING ERROR:",
      error
    );

    /*
     * Status 500 is deliberate.
     * Stripe will retry instead of silently losing a paid booking.
     */
    return NextResponse.json(
      {
        received: false,
        error:
          error?.message ||
          "The Stripe event could not be processed.",
      },
      { status: 500 }
    );
  }
}