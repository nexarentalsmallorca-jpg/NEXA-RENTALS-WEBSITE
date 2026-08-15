import { NextResponse } from "next/server";
import Stripe from "stripe";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey =
  process.env
    .STRIPE_SECRET_KEY;

const SESSION_TABLE =
  "document_verification_sessions";

type DriverValidationResult = {
  approvedCount: number;
  rejectedCount: number;

  approvedDriverIndexes: number[];
  rejectedDriverIndexes: number[];
};

class DriverVerificationError extends Error {
  status: number;
  code: string;

  constructor(
    message: string,
    status = 409,
    code =
      "DRIVER_VERIFICATION_INCOMPLETE"
  ) {
    super(
      message
    );

    this.name =
      "DriverVerificationError";

    this.status =
      status;

    this.code =
      code;
  }
}

function cleanMetadataValue(
  value: unknown,
  maxLength = 500
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).slice(
    0,
    maxLength
  );
}

function normalizeText(
  value: unknown
) {
  return String(
    value ||
    ""
  )
    .trim()
    .toLowerCase();
}

function normalizeQuantity(
  value: unknown
) {
  const quantity =
    Number(
      value ??
      1
    );

  if (
    !Number.isInteger(
      quantity
    ) ||
    quantity <
      1 ||
    quantity >
      15
  ) {
    return null;
  }

  return quantity;
}

function normalizeNonNegativeCount(
  value: unknown
) {
  const count =
    Number(
      value ??
      0
    );

  if (
    !Number.isFinite(
      count
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      15,
      Math.floor(
        count
      )
    )
  );
}

function parseDriverIndexes(
  value: unknown
) {
  const rawValues =
    Array.isArray(
      value
    )
      ? value
      : String(
          value ||
          ""
        ).split(
          ","
        );

  return Array.from(
    new Set(
      rawValues
        .map(
          (
            item
          ) =>
            Number(
              item
            )
        )
        .filter(
          (
            item
          ) =>
            Number.isInteger(
              item
            ) &&
            item >=
              1 &&
            item <=
              15
        )
    )
  ).sort(
    (
      a,
      b
    ) =>
      a -
      b
  );
}

function sessionDriverIndex(
  row: any
) {
  return Math.min(
    15,
    Math.max(
      1,
      Number(
        row?.licence_data
          ?.driverProfile
          ?.driverIndex
      ) ||
        1
    )
  );
}

function sessionOutcome(
  row: any
) {
  const outcome =
    normalizeText(
      row?.licence_data
        ?.verificationOutcome
    );

  const status =
    normalizeText(
      row?.status
    );

  if (
    outcome ===
    "manual_review"
  ) {
    return "manual_review";
  }

  if (
    outcome ===
      "accepted" ||
    status ===
      "completed"
  ) {
    return "accepted";
  }

  return "rejected";
}

async function validateApprovedDrivers(
  bookingId: string,
  quantity: number
): Promise<DriverValidationResult> {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        SESSION_TABLE
      )
      .select(
        "session_token,booking_id,status,licence_data,created_at"
      )
      .eq(
        "booking_id",
        bookingId
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      );

  if (
    error
  ) {
    throw new DriverVerificationError(
      `Could not validate the approved drivers: ${error.message}`,
      500,
      "DRIVER_VERIFICATION_LOOKUP_FAILED"
    );
  }

  /*
   * A driver can retry verification.
   * Only the newest session belonging to each driver is used.
   */
  const latestByDriver =
    new Map<
      number,
      any
    >();

  for (
    const row of
    data ||
    []
  ) {
    latestByDriver.set(
      sessionDriverIndex(
        row
      ),
      row
    );
  }

  const latestSessions =
    Array.from(
      latestByDriver
        .values()
    );

  const approvedDriverIndexes =
    latestSessions
      .filter(
        (
          row
        ) => {
          const outcome =
            sessionOutcome(
              row
            );

          return (
            outcome ===
              "accepted" ||
            outcome ===
              "manual_review"
          );
        }
      )
      .map(
        (
          row
        ) =>
          sessionDriverIndex(
            row
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          a -
          b
      );

  const rejectedDriverIndexes =
    latestSessions
      .filter(
        (
          row
        ) =>
          sessionOutcome(
            row
          ) ===
          "rejected"
      )
      .map(
        (
          row
        ) =>
          sessionDriverIndex(
            row
          )
      )
      .sort(
        (
          a,
          b
        ) =>
          a -
          b
      );

  if (
    approvedDriverIndexes
      .length !==
    quantity
  ) {
    throw new DriverVerificationError(
      `The final scooter quantity must match the ${approvedDriverIndexes.length} approved driver${
        approvedDriverIndexes.length ===
          1
          ? ""
          : "s"
      }.`
    );
  }

  return {
    approvedCount:
      approvedDriverIndexes
        .length,

    rejectedCount:
      rejectedDriverIndexes
        .length,

    approvedDriverIndexes,
    rejectedDriverIndexes,
  };
}

async function cancelHold(
  holdId: string,
  status =
    "cancelled"
) {
  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "payment_holds"
      )
      .update({
        status,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        holdId
      )
      .eq(
        "status",
        "active"
      );

  if (
    error
  ) {
    console.error(
      "Could not cancel payment hold:",
      error
    );
  }
}

export async function POST(
  req: Request
) {
  let createdHoldId:
    string | null =
      null;

  let createdPaymentIntentId:
    string | null =
      null;

  try {
    if (
      !stripeSecretKey
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe secret key is not configured.",
        },
        {
          status:
            500,
        }
      );
    }

    const stripe =
      new Stripe(
        stripeSecretKey
      );

    const body =
      await req.json();

    const {
      bookingId:
        rawBookingId,

      totalAmount,

      currency =
        "eur",

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

      quantity:
        rawQuantity,

      requestedQuantity:
        rawRequestedQuantity,

      passengerCount:
        rawPassengerCount,

      passengerDriverIndexes:
        rawPassengerDriverIndexes,

      plan,
      ratePerDay,
      days,
      total,

      notes,

      /*
       * These legacy values remain supported during the safe
       * transition. The new webhook prefers the secure paths
       * stored in each verification session.
       */
      dlFrontName,
      dlBackName,
      idFrontName,
      idBackName,

      dlFrontPath,
      dlBackPath,
      idFrontPath,
      idBackPath,

      marketingOptIn,
    } =
      body;

    if (
      !rawBookingId ||
      typeof rawBookingId !==
        "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Missing booking ID.",
        },
        {
          status:
            400,
        }
      );
    }

    const bookingId =
      rawBookingId
        .trim();

    if (
      !bookingId ||
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(
        bookingId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid booking ID.",
        },
        {
          status:
            400,
        }
      );
    }

    const quantity =
      normalizeQuantity(
        rawQuantity
      );

    if (
      !quantity
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid scooter quantity.",
        },
        {
          status:
            400,
        }
      );
    }

    const normalizedRequestedQuantity =
      rawRequestedQuantity ===
        undefined ||
      rawRequestedQuantity ===
        null ||
      String(
        rawRequestedQuantity
      ).trim() ===
        ""
        ? quantity
        : normalizeQuantity(
            rawRequestedQuantity
          );

    if (
      !normalizedRequestedQuantity
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid originally requested scooter quantity.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      normalizedRequestedQuantity <
      quantity
    ) {
      return NextResponse.json(
        {
          error:
            "The requested scooter quantity cannot be lower than the final approved quantity.",
        },
        {
          status:
            400,
        }
      );
    }

    const requestedQuantity =
      normalizedRequestedQuantity;

    const passengerDriverIndexes =
      parseDriverIndexes(
        rawPassengerDriverIndexes
      );

    const finalVehicleName =
      vehicleName ||
      vehicle ||
      bikeName ||
      "125cc Scooter";

    const normalizedFleetGroup =
      String(
        fleetGroup ||
        ""
      )
        .trim()
        .toLowerCase();

    if (
      typeof totalAmount !==
        "number" ||
      !Number.isInteger(
        totalAmount
      ) ||
      totalAmount <=
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid booking total.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !customerEmail ||
      typeof customerEmail !==
        "string" ||
      !customerEmail.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Missing customer email.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !customerName ||
      typeof customerName !==
        "string" ||
      !customerName.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Missing customer name.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !phone ||
      typeof phone !==
        "string" ||
      !phone.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Missing customer phone.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !vehicleId ||
      !finalVehicleName
    ) {
      return NextResponse.json(
        {
          error:
            "Missing vehicle details.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !normalizedFleetGroup
    ) {
      return NextResponse.json(
        {
          error:
            "Missing fleet group. Please return to the booking page and select the scooter again.",
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !pickupDateISO ||
      !returnDateISO ||
      !pickupTime ||
      !dropoffTime
    ) {
      return NextResponse.json(
        {
          error:
            "Missing rental date or time details.",
        },
        {
          status:
            400,
        }
      );
    }

    let driverValidation:
      DriverValidationResult = {
        approvedCount:
          quantity,

        rejectedCount:
          0,

        approvedDriverIndexes:
          [],

        rejectedDriverIndexes:
          [],
      };

    /*
     * E-bikes do not require driving-licence verification.
     */
    if (
      normalizedFleetGroup !==
      "e_bike"
    ) {
      try {
        driverValidation =
          await validateApprovedDrivers(
            bookingId,
            quantity
          );
      } catch (
        driverError
      ) {
        if (
          driverError instanceof
          DriverVerificationError
        ) {
          return NextResponse.json(
            {
              error:
                driverError.message,

              code:
                driverError.code,
            },
            {
              status:
                driverError.status,
            }
          );
        }

        throw driverError;
      }
    }

    /*
     * Passenger indexes are allowed only for verification
     * attempts that were not approved as drivers.
     */
    if (
      normalizedFleetGroup !==
      "e_bike" &&
      passengerDriverIndexes
        .length >
        0
    ) {
      const rejectedIndexSet =
        new Set(
          driverValidation
            .rejectedDriverIndexes
        );

      const invalidPassengerIndexes =
        passengerDriverIndexes
          .filter(
            (
              driverIndex
            ) =>
              !rejectedIndexSet.has(
                driverIndex
              )
          );

      if (
        invalidPassengerIndexes
          .length >
        0
      ) {
        return NextResponse.json(
          {
            error:
              "One or more passenger selections do not belong to rejected driver verifications.",

            code:
              "INVALID_PASSENGER_SELECTION",
          },
          {
            status:
              409,
          }
        );
      }
    }

    const fallbackPassengerCount =
      normalizeNonNegativeCount(
        rawPassengerCount
      );

    const passengerCount =
      normalizedFleetGroup ===
      "e_bike"
        ? 0
        : Math.min(
            driverValidation
              .rejectedCount,

            passengerDriverIndexes
              .length >
              0
              ? passengerDriverIndexes
                  .length
              : fallbackPassengerCount
          );

    /*
     * Create the protected inventory hold using only the
     * final approved scooter quantity.
     */
    const {
      data:
        holdRows,
      error:
        holdError,
    } =
      await supabaseAdmin
        .rpc(
          "create_online_payment_hold",
          {
            p_booking_id:
              bookingId,

            p_fleet_group:
              normalizedFleetGroup,

            p_quantity:
              quantity,

            p_pickup_date:
              String(
                pickupDateISO
              ).trim(),

            p_pickup_time:
              String(
                pickupTime
              ).trim(),

            p_dropoff_date:
              String(
                returnDateISO
              ).trim(),

            p_dropoff_time:
              String(
                dropoffTime
              ).trim(),

            p_customer_email:
              customerEmail
                .trim(),

            p_hold_minutes:
              15,
          }
        );

    if (
      holdError
    ) {
      console.error(
        "Inventory hold error:",
        holdError
      );

      const message =
        holdError.message ||
        "The selected scooter is no longer available.";

      const lowerMessage =
        message.toLowerCase();

      const isAvailabilityError =
        lowerMessage.includes(
          "available"
        ) ||
        lowerMessage.includes(
          "inventory"
        ) ||
        lowerMessage.includes(
          "scooter"
        );

      return NextResponse.json(
        {
          error:
            message,

          code:
            "INSUFFICIENT_AVAILABILITY",
        },
        {
          status:
            isAvailabilityError
              ? 409
              : 400,
        }
      );
    }

    const holdResult =
      Array.isArray(
        holdRows
      )
        ? holdRows[0]
        : holdRows;

    if (
      !holdResult
        ?.hold_id
    ) {
      throw new Error(
        "Supabase did not return a payment hold ID."
      );
    }

    createdHoldId =
      String(
        holdResult
          .hold_id
      );

    const availableAfterHold =
      Number(
        holdResult
          .available_count ??
        0
      );

    const totalOnlineFleet =
      Number(
        holdResult
          .total_online_fleet ??
        0
      );

    const holdExpiresAt =
      String(
        holdResult
          .expires_at ||
        ""
      );

    const amountToCharge =
      totalAmount;

    const amountPaidOnline =
      amountToCharge;

    const remainingAmount =
      0;

    /*
     * No exact N1, N2 or other scooter code is assigned here.
     *
     * The website reserves only:
     * fleet group + final quantity + rental period.
     */
    const paymentIntent =
      await stripe
        .paymentIntents
        .create({
          amount:
            amountToCharge,

          currency:
            String(
              currency
            ).toLowerCase(),

          automatic_payment_methods: {
            enabled:
              true,
          },

          receipt_email:
            cleanMetadataValue(
              customerEmail
                .trim(),
              250
            ),

          metadata: {
            bookingId:
              cleanMetadataValue(
                bookingId,
                120
              ),

            hold_id:
              cleanMetadataValue(
                createdHoldId,
                120
              ),

            booking_source:
              "website",

            booking_status:
              "payment_pending",

            payment_type:
              "pay_full_amount",

            quantity:
              String(
                quantity
              ),

            requested_quantity:
              String(
                requestedQuantity
              ),

            approved_driver_count:
              String(
                driverValidation
                  .approvedCount
              ),

            rejected_driver_count:
              String(
                driverValidation
                  .rejectedCount
              ),

            passenger_count:
              String(
                passengerCount
              ),

            passenger_driver_indexes:
              cleanMetadataValue(
                passengerDriverIndexes
                  .join(
                    ","
                  ),
                120
              ),

            fleet_group:
              cleanMetadataValue(
                normalizedFleetGroup,
                80
              ),

            total_amount:
              String(
                totalAmount
              ),

            amount_to_charge:
              String(
                amountToCharge
              ),

            amount_paid_online:
              String(
                amountPaidOnline
              ),

            remaining_amount:
              String(
                remainingAmount
              ),

            customer_email:
              cleanMetadataValue(
                customerEmail
                  .trim(),
                250
              ),

            customer_name:
              cleanMetadataValue(
                customerName
                  .trim(),
                250
              ),

            phone:
              cleanMetadataValue(
                phone.trim(),
                80
              ),

            vehicle_id:
              cleanMetadataValue(
                vehicleId,
                80
              ),

            vehicle_name:
              cleanMetadataValue(
                finalVehicleName,
                220
              ),

            plan:
              cleanMetadataValue(
                plan ||
                "full",
                40
              ),

            rate_per_day:
              ratePerDay !==
              undefined
                ? String(
                    ratePerDay
                  )
                : "",

            days:
              days !==
              undefined
                ? String(
                    days
                  )
                : "",

            rental_total_eur:
              total !==
              undefined
                ? String(
                    total
                  )
                : "",

            pickup_date:
              cleanMetadataValue(
                pickupDateISO,
                40
              ),

            dropoff_date:
              cleanMetadataValue(
                returnDateISO,
                40
              ),

            pickup_time:
              cleanMetadataValue(
                pickupTime,
                40
              ),

            dropoff_time:
              cleanMetadataValue(
                dropoffTime,
                40
              ),

            pickup_location:
              cleanMetadataValue(
                pickupLocation,
                250
              ),

            total_online_fleet:
              String(
                totalOnlineFleet
              ),

            available_after_hold:
              String(
                availableAfterHold
              ),

            hold_expires_at:
              cleanMetadataValue(
                holdExpiresAt,
                80
              ),

            notes:
              cleanMetadataValue(
                notes,
                500
              ),

            /*
             * Temporary backwards compatibility for customers
             * who started checkout before this deployment.
             *
             * The new webhook prefers the secure Supabase
             * verification-session document references.
             */
            dl_front_name:
              cleanMetadataValue(
                dlFrontName,
                180
              ),

            dl_back_name:
              cleanMetadataValue(
                dlBackName,
                180
              ),

            id_front_name:
              cleanMetadataValue(
                idFrontName,
                180
              ),

            id_back_name:
              cleanMetadataValue(
                idBackName,
                180
              ),

            dl_front_path:
              cleanMetadataValue(
                dlFrontPath,
                250
              ),

            dl_back_path:
              cleanMetadataValue(
                dlBackPath,
                250
              ),

            id_front_path:
              cleanMetadataValue(
                idFrontPath,
                250
              ),

            id_back_path:
              cleanMetadataValue(
                idBackPath,
                250
              ),

            marketing_opt_in:
              marketingOptIn
                ? "yes"
                : "no",
          },
        });

    createdPaymentIntentId =
      paymentIntent.id;

    if (
      !paymentIntent
        .client_secret
    ) {
      throw new Error(
        "Stripe did not return a payment client secret."
      );
    }

    /*
     * Connect the Stripe PaymentIntent to its protected hold.
     */
    const {
      error:
        linkError,
    } =
      await supabaseAdmin
        .from(
          "payment_holds"
        )
        .update({
          stripe_payment_intent_id:
            paymentIntent.id,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          createdHoldId
        )
        .eq(
          "status",
          "active"
        );

    if (
      linkError
    ) {
      console.error(
        "PaymentIntent hold-link error:",
        linkError
      );

      await stripe
        .paymentIntents
        .cancel(
          paymentIntent.id
        )
        .catch(
          (
            cancelError
          ) => {
            console.error(
              "Could not cancel unlinked PaymentIntent:",
              cancelError
            );
          }
        );

      await cancelHold(
        createdHoldId,
        "cancelled"
      );

      createdPaymentIntentId =
        null;

      createdHoldId =
        null;

      throw new Error(
        "The payment session could not be connected to the scooter reservation."
      );
    }

    return NextResponse.json({
      clientSecret:
        paymentIntent
          .client_secret,

      paymentIntentId:
        paymentIntent.id,

      bookingId,

      holdId:
        createdHoldId,

      holdExpiresAt,

      quantity,

      requestedQuantity,

      approvedDriverCount:
        driverValidation
          .approvedCount,

      rejectedDriverCount:
        driverValidation
          .rejectedCount,

      passengerCount,

      passengerDriverIndexes,

      fleetGroup:
        normalizedFleetGroup,

      availableCount:
        availableAfterHold,

      totalFleet:
        totalOnlineFleet,

      amountToCharge,

      amountPaidOnline,

      remainingAmount,

      totalAmount,

      /*
       * Compatibility with the existing checkout component.
       * depositAmount represents the complete online payment.
       */
      depositAmount:
        amountToCharge,

      currency:
        String(
          currency
        ).toLowerCase(),
    });
  } catch (
    error: any
  ) {
    console.error(
      "Create PaymentIntent error:",
      error
    );

    /*
     * If Stripe was created but a later operation failed,
     * cancel the unused PaymentIntent.
     */
    if (
      createdPaymentIntentId &&
      stripeSecretKey
    ) {
      const stripe =
        new Stripe(
          stripeSecretKey
        );

      await stripe
        .paymentIntents
        .cancel(
          createdPaymentIntentId
        )
        .catch(
          (
            cancelError
          ) => {
            console.error(
              "Could not cancel failed PaymentIntent:",
              cancelError
            );
          }
        );
    }

    /*
     * Release inventory when checkout creation fails.
     */
    if (
      createdHoldId
    ) {
      await cancelHold(
        createdHoldId,
        "cancelled"
      );
    }

    return NextResponse.json(
      {
        error:
          error?.message ||
          "The secure payment session could not be created.",
      },
      {
        status:
          500,
      }
    );
  }
}