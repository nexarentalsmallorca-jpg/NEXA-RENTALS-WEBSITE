import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_TABLE =
  "document_verification_sessions";

type ExistingBooking = {
  id: string | number;
  status?: string | null;
  booking_status?: string | null;
};

type HoldConversionResult = {
  found: boolean;
  wasAlreadyConverted: boolean;
};

type DriverOutcome =
  | "accepted"
  | "manual_review"
  | "rejected";

type DriverDocuments = {
  identityType: string;

  dlFrontPath: string;
  dlBackPath: string;
  idFrontPath: string;
  idBackPath: string;

  dlFrontName: string;
  dlBackName: string;
  idFrontName: string;
  idBackName: string;
};

type DriverVerification = {
  driverIndex: number;
  driverName: string;
  phone: string;
  email: string;
  address: string;

  sessionStatus: string;
  outcome: DriverOutcome;

  approved: boolean;
  passenger: boolean;

  documents: DriverDocuments;
};

function getSessionDriverContact(
  row:
    any
) {
  const licenceData =
    isRecord(
      row?.licence_data
    )
      ? row.licence_data
      : {};

  const driverProfile =
    isRecord(
      licenceData
        .driverProfile
    )
      ? licenceData
          .driverProfile
      : {};

  return {
    phone:
      recordText(
        driverProfile,
        "phone",
        "telephone",
        "whatsapp"
      ),

    email:
      recordText(
        driverProfile,
        "email"
      ),

    address:
      recordText(
        driverProfile,
        "address",
        "homeAddress"
      ),
  };
}

type VerificationBundle = {
  drivers: DriverVerification[];

  requestedQuantity: number;
  approvedCount: number;
  rejectedCount: number;
  passengerCount: number;

  passengerDriverIndexes: number[];

  primaryDocuments: DriverDocuments;
};

function safeText(
  value: unknown
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(
    value
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function metadataText(
  metadata: Stripe.Metadata,
  ...keys: string[]
) {
  for (
    const key of
    keys
  ) {
    const value =
      metadata[
        key
      ];

    if (
      typeof value ===
        "string" &&
      value.trim() !==
        ""
    ) {
      return value.trim();
    }
  }

  return "";
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
      value
    );

  if (
    Number.isInteger(
      quantity
    ) &&
    quantity >=
      1 &&
    quantity <=
      15
  ) {
    return quantity;
  }

  return 1;
}

function optionalPositiveCount(
  value: unknown
) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    String(
      value
    ).trim() ===
      ""
  ) {
    return null;
  }

  const count =
    Number(
      value
    );

  if (
    Number.isInteger(
      count
    ) &&
    count >=
      1 &&
    count <=
      15
  ) {
    return count;
  }

  return null;
}

function optionalNonNegativeCount(
  value: unknown
) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    String(
      value
    ).trim() ===
      ""
  ) {
    return null;
  }

  const count =
    Number(
      value
    );

  if (
    Number.isInteger(
      count
    ) &&
    count >=
      0 &&
    count <=
      15
  ) {
    return count;
  }

  return null;
}

function normalizeCents(
  value: unknown
) {
  const amount =
    Number(
      value
    );

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <
      0
  ) {
    return 0;
  }

  return Math.round(
    amount
  );
}

function moneyFromCents(
  value: unknown
) {
  return (
    normalizeCents(
      value
    ) /
    100
  ).toFixed(
    2
  );
}

function cleanCurrency(
  value: unknown
) {
  return String(
    value ||
    "eur"
  ).toUpperCase();
}

function formatDate(
  value: string
) {
  const match =
    value.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (
    !match
  ) {
    return (
      value ||
      "-"
    );
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function isUuid(
  value: string
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function recordText(
  record: Record<
    string,
    unknown
  >,
  ...keys: string[]
) {
  for (
    const key of
    keys
  ) {
    const value =
      record[
        key
      ];

    if (
      typeof value ===
        "string" &&
      value.trim() !==
        ""
    ) {
      return value.trim();
    }
  }

  return "";
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

function emptyDocuments():
  DriverDocuments {
  return {
    identityType:
      "",

    dlFrontPath:
      "",

    dlBackPath:
      "",

    idFrontPath:
      "",

    idBackPath:
      "",

    dlFrontName:
      "",

    dlBackName:
      "",

    idFrontName:
      "",

    idBackName:
      "",
  };
}

function hasDocumentPaths(
  documents:
    DriverDocuments
) {
  return Boolean(
    documents
      .dlFrontPath ||
    documents
      .dlBackPath ||
    documents
      .idFrontPath ||
    documents
      .idBackPath
  );
}

function getBookingId(
  pi:
    Stripe.PaymentIntent
) {
  return (
    metadataText(
      pi.metadata ||
        {},
      "bookingId",
      "booking_id"
    ) ||
    pi.id
  );
}

function getHoldId(
  pi:
    Stripe.PaymentIntent
) {
  const holdId =
    metadataText(
      pi.metadata ||
        {},
      "hold_id",
      "holdId"
    );

  return isUuid(
    holdId
  )
    ? holdId
    : "";
}

function getFleetGroup(
  pi:
    Stripe.PaymentIntent
) {
  const metadata =
    pi.metadata ||
    {};

  const explicitFleetGroup =
    normalizeText(
      metadataText(
        metadata,
        "fleet_group"
      )
    );

  if (
    explicitFleetGroup
  ) {
    return explicitFleetGroup;
  }

  /*
   * Compatibility for older PaymentIntents.
   */
  const vehicleText =
    normalizeText(
      [
        metadataText(
          metadata,
          "vehicle_id"
        ),

        metadataText(
          metadata,
          "vehicle_name"
        ),

        metadataText(
          metadata,
          "public_vehicle_name"
        ),
      ].join(
        " "
      )
    );

  if (
    vehicleText.includes(
      "e-bike"
    ) ||
    vehicleText.includes(
      "ebike"
    ) ||
    vehicleText.includes(
      "e_bike"
    )
  ) {
    return "e_bike";
  }

  if (
    vehicleText.includes(
      "sym"
    ) ||
    vehicleText.includes(
      "symphony"
    ) ||
    vehicleText.includes(
      "s3"
    )
  ) {
    return "sym_symphony_125";
  }

  if (
    vehicleText.includes(
      "piaggio"
    ) ||
    vehicleText.includes(
      "liberty"
    ) ||
    vehicleText.includes(
      "s2"
    )
  ) {
    return "piaggio_liberty_125";
  }

  if (
    vehicleText.includes(
      "kymco"
    ) ||
    vehicleText.includes(
      "skytown"
    )
  ) {
    return "kymco_skytown_125";
  }

  return "";
}

function getPublicVehicleName(
  pi:
    Stripe.PaymentIntent
) {
  const metadata =
    pi.metadata ||
    {};

  return (
    metadataText(
      metadata,
      "public_vehicle_name",
      "vehicle_name"
    ) ||
    "125cc Scooter"
  );
}

function getPaymentSummary(
  pi:
    Stripe.PaymentIntent
) {
  const metadata =
    pi.metadata ||
    {};

  const amountPaid =
    normalizeCents(
      pi.amount_received
    ) ||
    normalizeCents(
      metadataText(
        metadata,
        "amount_paid_online",
        "depositAmount"
      )
    ) ||
    normalizeCents(
      pi.amount
    );

  const totalAmount =
    normalizeCents(
      metadataText(
        metadata,
        "total_amount",
        "totalAmount"
      )
    ) ||
    amountPaid;

  const remainingMetadata =
    metadataText(
      metadata,
      "remaining_amount",
      "remainingAmount"
    );

  const remainingAmount =
    remainingMetadata !==
      ""
      ? normalizeCents(
          remainingMetadata
        )
      : Math.max(
          totalAmount -
            amountPaid,
          0
        );

  return {
    amountPaid,
    totalAmount,
    remainingAmount,

    fullyPaid:
      remainingAmount ===
        0 &&
      amountPaid >=
        totalAmount,
  };
}

function getLegacyDocuments(
  pi:
    Stripe.PaymentIntent
): DriverDocuments {
  const metadata =
    pi.metadata ||
    {};

  return {
    identityType:
      metadataText(
        metadata,
        "identity_type"
      ),

    dlFrontPath:
      metadataText(
        metadata,
        "dl_front_path"
      ),

    dlBackPath:
      metadataText(
        metadata,
        "dl_back_path"
      ),

    idFrontPath:
      metadataText(
        metadata,
        "id_front_path"
      ),

    idBackPath:
      metadataText(
        metadata,
        "id_back_path"
      ),

    dlFrontName:
      metadataText(
        metadata,
        "dl_front_name"
      ),

    dlBackName:
      metadataText(
        metadata,
        "dl_back_name"
      ),

    idFrontName:
      metadataText(
        metadata,
        "id_front_name"
      ),

    idBackName:
      metadataText(
        metadata,
        "id_back_name"
      ),
  };
}

function getSessionDriverIndex(
  row:
    any
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

function getSessionOutcome(
  row:
    any
): DriverOutcome {
  const outcome =
    normalizeText(
      row?.licence_data
        ?.verificationOutcome
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
    normalizeText(
      row?.status
    ) ===
      "completed"
  ) {
    return "accepted";
  }

  return "rejected";
}

function getSessionDriverName(
  row:
    any,
  driverIndex:
    number
) {
  const licenceData =
    isRecord(
      row?.licence_data
    )
      ? row.licence_data
      : {};

  const driverProfile =
    isRecord(
      licenceData
        .driverProfile
    )
      ? licenceData
          .driverProfile
      : {};

  const directName =
    recordText(
      driverProfile,
      "fullName",
      "driverName",
      "name"
    );

  if (
    directName
  ) {
    return directName;
  }

  const firstName =
    recordText(
      driverProfile,
      "firstName",
      "givenName"
    );

  const lastName =
    recordText(
      driverProfile,
      "lastName",
      "surname",
      "familyName"
    );

  const combinedName =
    [
      firstName,
      lastName,
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      )
      .trim();

  return (
    combinedName ||
    `Driver ${driverIndex}`
  );
}

function getSessionDocuments(
  row:
    any
): DriverDocuments {
  const licenceData =
    isRecord(
      row?.licence_data
    )
      ? row.licence_data
      : {};

  const documentUpload =
    isRecord(
      licenceData
        .documentUpload
    )
      ? licenceData
          .documentUpload
      : null;

  if (
    !documentUpload
  ) {
    return emptyDocuments();
  }

  return {
    identityType:
      recordText(
        documentUpload,
        "identityType"
      ),

    dlFrontPath:
      recordText(
        documentUpload,
        "dlFrontPath"
      ),

    dlBackPath:
      recordText(
        documentUpload,
        "dlBackPath"
      ),

    idFrontPath:
      recordText(
        documentUpload,
        "idFrontPath"
      ),

    idBackPath:
      recordText(
        documentUpload,
        "idBackPath"
      ),

    dlFrontName:
      recordText(
        documentUpload,
        "dlFrontName"
      ),

    dlBackName:
      recordText(
        documentUpload,
        "dlBackName"
      ),

    idFrontName:
      recordText(
        documentUpload,
        "idFrontName"
      ),

    idBackName:
      recordText(
        documentUpload,
        "idBackName"
      ),
  };
}

async function loadVerificationBundle(
  pi:
    Stripe.PaymentIntent
): Promise<VerificationBundle> {
  const metadata =
    pi.metadata ||
    {};

  const quantity =
    normalizeQuantity(
      metadataText(
        metadata,
        "quantity"
      )
    );

  const requestedQuantity =
    optionalPositiveCount(
      metadataText(
        metadata,
        "requested_quantity"
      )
    ) ||
    quantity;

  const metadataApprovedCount =
    optionalNonNegativeCount(
      metadataText(
        metadata,
        "approved_driver_count"
      )
    );

  const metadataRejectedCount =
    optionalNonNegativeCount(
      metadataText(
        metadata,
        "rejected_driver_count"
      )
    );

  const metadataPassengerCount =
    optionalNonNegativeCount(
      metadataText(
        metadata,
        "passenger_count"
      )
    );

  const passengerDriverIndexes =
    parseDriverIndexes(
      metadataText(
        metadata,
        "passenger_driver_indexes"
      )
    );

  const legacyDocuments =
    getLegacyDocuments(
      pi
    );

  const fleetGroup =
    getFleetGroup(
      pi
    );

  /*
   * E-bikes do not require driving-licence verification.
   */
  if (
    fleetGroup ===
    "e_bike"
  ) {
    return {
      drivers:
        [],

      requestedQuantity,

      approvedCount:
        metadataApprovedCount ??
        quantity,

      rejectedCount:
        metadataRejectedCount ??
        0,

      passengerCount:
        metadataPassengerCount ??
        passengerDriverIndexes
          .length,

      passengerDriverIndexes,

      primaryDocuments:
        legacyDocuments,
    };
  }

  const bookingId =
    getBookingId(
      pi
    );

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
    throw new Error(
      `Could not load driver verification sessions: ${error.message}`
    );
  }

  /*
   * Keep only the newest session for each driver.
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
      getSessionDriverIndex(
        row
      ),
      row
    );
  }

  const passengerIndexSet =
    new Set(
      passengerDriverIndexes
    );

  const drivers =
    Array.from(
      latestByDriver
        .values()
    )
      .map(
        (
          row
        ): DriverVerification => {
          const driverIndex =
            getSessionDriverIndex(
              row
            );

          const outcome =
            getSessionOutcome(
              row
            );

          const contact =
            getSessionDriverContact(
              row
            );

          return {
            driverIndex,

            driverName:
              getSessionDriverName(
                row,
                driverIndex
              ),

            phone:
              contact.phone,

            email:
              contact.email,

            address:
              contact.address,

            sessionStatus:
              normalizeText(
                row?.status
              ) ||
              "unknown",

            outcome,

            approved:
              outcome ===
                "accepted" ||
              outcome ===
                "manual_review",

            passenger:
              passengerIndexSet.has(
                driverIndex
              ),

            documents:
              getSessionDocuments(
                row
              ),
          };
        }
      )
      .sort(
        (
          a,
          b
        ) =>
          a.driverIndex -
          b.driverIndex
      );

  const actualApprovedCount =
    drivers.filter(
      (
        driver
      ) =>
        driver.approved
    ).length;

  const actualRejectedCount =
    drivers.filter(
      (
        driver
      ) =>
        !driver.approved
    ).length;

  /*
   * The final PaymentIntent metadata is authoritative because
   * it was validated immediately before payment.
   */
  const approvedCount =
    metadataApprovedCount ??
    (
      drivers.length >
        0
        ? actualApprovedCount
        : quantity
    );

  const rejectedCount =
    metadataRejectedCount ??
    actualRejectedCount;

  const passengerCount =
    metadataPassengerCount ??
    passengerDriverIndexes
      .length;

  const approvedDriverWithDocuments =
    drivers.find(
      (
        driver
      ) =>
        driver.approved &&
        hasDocumentPaths(
          driver.documents
        )
    );

  const anyDriverWithDocuments =
    drivers.find(
      (
        driver
      ) =>
        hasDocumentPaths(
          driver.documents
        )
    );

  const sessionDocuments =
    approvedDriverWithDocuments
      ?.documents ||
    anyDriverWithDocuments
      ?.documents;

  const primaryDocuments =
    sessionDocuments &&
    hasDocumentPaths(
      sessionDocuments
    )
      ? sessionDocuments
      : legacyDocuments;

  if (
    drivers.length >
      0 &&
    metadataApprovedCount !==
      null &&
    metadataApprovedCount !==
      actualApprovedCount
  ) {
    console.warn(
      "DRIVER COUNT DIFFERENCE:",
      {
        paymentIntent:
          pi.id,

        metadataApprovedCount,
        actualApprovedCount,
      }
    );
  }

  return {
    drivers,
    requestedQuantity,
    approvedCount,
    rejectedCount,
    passengerCount,
    passengerDriverIndexes,
    primaryDocuments,
  };
}

function buildCoreBookingPayload(
  pi:
    Stripe.PaymentIntent,
  verification:
    VerificationBundle
) {
  const metadata =
    pi.metadata ||
    {};

  const holdId =
    getHoldId(
      pi
    );

  const fleetGroup =
    getFleetGroup(
      pi
    );

  const quantity =
    normalizeQuantity(
      metadataText(
        metadata,
        "quantity"
      )
    );

  const payment =
    getPaymentSummary(
      pi
    );

  const documents =
    verification
      .primaryDocuments;

  const payload:
    Record<
      string,
      unknown
    > = {
      stripe_payment_intent_id:
        pi.id,

      status:
        "paid",

      booking_status:
        "confirmed",

      booking_source:
        metadataText(
          metadata,
          "booking_source"
        ) ||
        "website",

      customer_name:
        metadataText(
          metadata,
          "customer_name"
        ),

      customer_email:
        metadataText(
          metadata,
          "customer_email"
        ),

      phone:
        metadataText(
          metadata,
          "phone"
        ),

      pickup_date:
        metadataText(
          metadata,
          "pickup_date"
        ),

      pickup_time:
        metadataText(
          metadata,
          "pickup_time"
        ),

      dropoff_date:
        metadataText(
          metadata,
          "dropoff_date"
        ),

      dropoff_time:
        metadataText(
          metadata,
          "dropoff_time"
        ),

      vehicle_name:
        getPublicVehicleName(
          pi
        ),

      fleet_group:
        fleetGroup ||
        null,

      quantity,

      /*
       * Website bookings reserve a category and quantity.
       * Exact scooter assignment remains manual.
       */
      assigned_vehicle_code:
        null,

      /*
       * The existing booking table keeps the primary approved
       * driver's documents in its original columns.
       *
       * Every driver's complete references remain securely
       * stored inside their verification session.
       */
      dl_front_path:
        documents
          .dlFrontPath,

      dl_back_path:
        documents
          .dlBackPath,

      id_front_path:
        documents
          .idFrontPath,

      id_back_path:
        documents
          .idBackPath,

      amount:
        payment.amountPaid,

      currency:
        pi.currency ||
        "eur",
    };

  if (
    holdId
  ) {
    payload.hold_id =
      holdId;
  }

  return payload;
}

function buildFullBookingPayload(
  pi:
    Stripe.PaymentIntent,
  verification:
    VerificationBundle
) {
  const metadata =
    pi.metadata ||
    {};

  const corePayload =
    buildCoreBookingPayload(
      pi,
      verification
    );

  const publicVehicleName =
    getPublicVehicleName(
      pi
    );

  return {
    ...corePayload,

    source:
      metadataText(
        metadata,
        "booking_source"
      ) ||
      "website",

    booking_action:
      "reserve_now",

    /*
     * Exact scooter assignment must happen manually.
     */
    vehicle_code:
      "",

    scooter_code:
      "",

    public_vehicle_name:
      publicVehicleName,

    payment_method:
      pi
        .payment_method_types
        ?.[0] ||
      "card",

    payment_status:
      "paid",

    contract_number:
      getBookingId(
        pi
      ),
  };
}

function bookingAlreadyConfirmed(
  booking:
    ExistingBooking
) {
  return (
    normalizeText(
      booking.status
    ) ===
      "paid" &&
    normalizeText(
      booking
        .booking_status
    ) ===
      "confirmed"
  );
}

async function findExistingBooking(
  paymentIntentId:
    string
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "bookings"
      )
      .select(
        "id,status,booking_status"
      )
      .eq(
        "stripe_payment_intent_id",
        paymentIntentId
      )
      .limit(
        1
      );

  if (
    error
  ) {
    throw new Error(
      `Could not check the existing booking: ${error.message}`
    );
  }

  return (
    data?.[0] ||
    null
  ) as
    | ExistingBooking
    | null;
}

async function writeBookingPayload(
  payload:
    Record<
      string,
      unknown
    >,
  existingBooking:
    ExistingBooking | null
) {
  if (
    existingBooking
  ) {
    return supabaseAdmin
      .from(
        "bookings"
      )
      .update(
        payload
      )
      .eq(
        "id",
        existingBooking.id
      )
      .select(
        "id"
      )
      .limit(
        1
      );
  }

  return supabaseAdmin
    .from(
      "bookings"
    )
    .insert(
      payload
    )
    .select(
      "id"
    )
    .limit(
      1
    );
}

async function savePaidBooking(
  pi:
    Stripe.PaymentIntent,
  verification:
    VerificationBundle
) {
  const existingBooking =
    await findExistingBooking(
      pi.id
    );

  /*
   * Stripe can retry the same webhook.
   * Never create another booking for the same payment.
   */
  if (
    existingBooking &&
    bookingAlreadyConfirmed(
      existingBooking
    )
  ) {
    console.log(
      "BOOKING ALREADY CONFIRMED:",
      pi.id
    );

    return {
      alreadyConfirmed:
        true,

      bookingRowId:
        existingBooking.id,
    };
  }

  const fullPayload =
    buildFullBookingPayload(
      pi,
      verification
    );

  let result =
    await writeBookingPayload(
      fullPayload,
      existingBooking
    );

  /*
   * Compatibility fallback for installations where one of
   * the optional legacy booking columns does not exist.
   */
  if (
    result.error
  ) {
    console.warn(
      "FULL BOOKING SAVE FAILED. TRYING CORE PAYLOAD:",
      result.error
        .message
    );

    const corePayload =
      buildCoreBookingPayload(
        pi,
        verification
      );

    result =
      await writeBookingPayload(
        corePayload,
        existingBooking
      );
  }

  if (
    result.error
  ) {
    const retryBooking =
      await findExistingBooking(
        pi.id
      );

    if (
      retryBooking &&
      bookingAlreadyConfirmed(
        retryBooking
      )
    ) {
      return {
        alreadyConfirmed:
          true,

        bookingRowId:
          retryBooking.id,
      };
    }

    throw new Error(
      `The paid booking could not be saved: ${result.error.message}`
    );
  }

  const bookingRowId =
    result.data?.[0]
      ?.id ||
    existingBooking?.id;

  console.log(
    "PAID BOOKING SAVED:",
    bookingRowId,
    pi.id
  );

  return {
    alreadyConfirmed:
      false,

    bookingRowId,
  };
}

async function findPaymentHold(
  pi:
    Stripe.PaymentIntent
) {
  const holdId =
    getHoldId(
      pi
    );

  if (
    holdId
  ) {
    const byId =
      await supabaseAdmin
        .from(
          "payment_holds"
        )
        .select(
          "id,status"
        )
        .eq(
          "id",
          holdId
        )
        .limit(
          1
        );

    if (
      byId.error
    ) {
      throw new Error(
        `Could not check the payment hold: ${byId.error.message}`
      );
    }

    if (
      byId.data?.[0]
    ) {
      return byId
        .data[0];
    }
  }

  const byPaymentIntent =
    await supabaseAdmin
      .from(
        "payment_holds"
      )
      .select(
        "id,status"
      )
      .eq(
        "stripe_payment_intent_id",
        pi.id
      )
      .limit(
        1
      );

  if (
    byPaymentIntent
      .error
  ) {
    throw new Error(
      `Could not check the PaymentIntent hold: ${byPaymentIntent.error.message}`
    );
  }

  return (
    byPaymentIntent
      .data?.[0] ||
    null
  );
}

async function convertPaymentHold(
  pi:
    Stripe.PaymentIntent
): Promise<HoldConversionResult> {
  const hold =
    await findPaymentHold(
      pi
    );

  if (
    !hold
  ) {
    /*
     * Older PaymentIntents may not have an inventory hold.
     * Their paid booking is still saved.
     */
    if (
      getHoldId(
        pi
      )
    ) {
      console.warn(
        "PAYMENT SUCCEEDED BUT HOLD WAS NOT FOUND:",
        pi.id,
        getHoldId(
          pi
        )
      );
    }

    return {
      found:
        false,

      wasAlreadyConverted:
        false,
    };
  }

  if (
    normalizeText(
      hold.status
    ) ===
    "converted"
  ) {
    return {
      found:
        true,

      wasAlreadyConverted:
        true,
    };
  }

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "payment_holds"
      )
      .update({
        status:
          "converted",

        stripe_payment_intent_id:
          pi.id,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        hold.id
      );

  if (
    error
  ) {
    throw new Error(
      `The payment hold could not be converted: ${error.message}`
    );
  }

  console.log(
    "PAYMENT HOLD CONVERTED:",
    hold.id
  );

  return {
    found:
      true,

    wasAlreadyConverted:
      false,
  };
}

async function releasePaymentHold(
  pi:
    Stripe.PaymentIntent,
  status:
    | "payment_failed"
    | "cancelled"
) {
  const holdId =
    getHoldId(
      pi
    );

  if (
    holdId
  ) {
    const byId =
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
      byId.error
    ) {
      throw new Error(
        `Could not release the payment hold: ${byId.error.message}`
      );
    }
  }

  const byPaymentIntent =
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
        "stripe_payment_intent_id",
        pi.id
      )
      .eq(
        "status",
        "active"
      );

  if (
    byPaymentIntent
      .error
  ) {
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
  const apiKey =
    process.env
      .RESEND_API_KEY;

  if (
    !apiKey
  ) {
    throw new Error(
      "Missing RESEND_API_KEY."
    );
  }

  return new Resend(
    apiKey
  );
}

function getFromEmail() {
  return (
    process.env
      .FROM_EMAIL ||
    process.env
      .RESEND_FROM ||
    "onboarding@resend.dev"
  );
}

function getOwnerEmails() {
  const possibleEmails = [
    process.env
      .OWNER_EMAIL,

    "nexarentalsmallorca@gmail.com",
  ];

  return Array.from(
    new Set(
      possibleEmails.filter(
        (
          email
        ): email is string =>
          typeof email ===
            "string" &&
          email.trim() !==
            ""
      )
    )
  );
}

function driverOutcomeLabel(
  driver:
    DriverVerification
) {
  if (
    driver.passenger
  ) {
    return "Passenger — not counted as a driver";
  }

  if (
    driver.outcome ===
    "manual_review"
  ) {
    return "Approved after manual review";
  }

  if (
    driver.outcome ===
    "accepted"
  ) {
    return "Approved driver";
  }

  return "Not approved as a driver";
}

function buildDriverEmailHtml(
  verification:
    VerificationBundle,
  fleetGroup:
    string
) {
  if (
    fleetGroup ===
    "e_bike"
  ) {
    return `
      <div style="background:#f8fafc;border:1px solid #cbd5e1;padding:12px;border-radius:10px;">
        Driving-licence verification is not required for this e-bike booking.
      </div>
    `;
  }

  if (
    verification
      .drivers
      .length ===
    0
  ) {
    return `
      <div style="background:#fff7ed;border:1px solid #fb923c;padding:12px;border-radius:10px;">
        No driver verification sessions were found.
        Check the booking manually before scooter assignment.
      </div>
    `;
  }

  return verification
    .drivers
    .map(
      (
        driver
      ) => {
        const documents =
          driver.documents;

        const statusColor =
          driver.passenger
            ? "#2563eb"
            : driver.approved
              ? "#15803d"
              : "#b91c1c";

        return `
          <div style="border:1px solid #d1d5db;border-radius:10px;padding:14px;margin:12px 0;">
            <h3 style="margin:0 0 8px 0;">
              Driver ${driver.driverIndex}: ${safeText(
                driver.driverName
              )}
            </h3>

            <p style="color:${statusColor};">
              <b>${safeText(
                driverOutcomeLabel(
                  driver
                )
              )}</b>
            </p>

            <p><b>Verification outcome:</b> ${safeText(
              driver.outcome
            )}</p>

            <p><b>Session status:</b> ${safeText(
              driver.sessionStatus
            )}</p>

            <p><b>Identity type:</b> ${safeText(
              documents.identityType ||
              "-"
            )}</p>

            <p><b>Phone / WhatsApp:</b> ${safeText(
              driver.phone ||
              "-"
            )}</p>

            <p><b>Email:</b> ${safeText(
              driver.email ||
              "-"
            )}</p>

            <p><b>Home address:</b> ${safeText(
              driver.address ||
              "-"
            )}</p>

            <p><b>Driving licence front:</b> ${safeText(
              documents.dlFrontName ||
              "-"
            )}</p>

            <p><b>Driving licence front path:</b> ${safeText(
              documents.dlFrontPath ||
              "-"
            )}</p>

            <p><b>Driving licence back:</b> ${safeText(
              documents.dlBackName ||
              "-"
            )}</p>

            <p><b>Driving licence back path:</b> ${safeText(
              documents.dlBackPath ||
              "-"
            )}</p>

            <p><b>ID/passport front:</b> ${safeText(
              documents.idFrontName ||
              "-"
            )}</p>

            <p><b>ID/passport front path:</b> ${safeText(
              documents.idFrontPath ||
              "-"
            )}</p>

            <p><b>ID back:</b> ${safeText(
              documents.idBackName ||
              "-"
            )}</p>

            <p><b>ID back path:</b> ${safeText(
              documents.idBackPath ||
              "-"
            )}</p>
          </div>
        `;
      }
    )
    .join(
      ""
    );
}

async function sendOwnerEmail(
  pi:
    Stripe.PaymentIntent,
  bookingRowId:
    string |
    number |
    undefined,
  verification:
    VerificationBundle
) {
  const resend =
    getResendClient();

  const metadata =
    pi.metadata ||
    {};

  const payment =
    getPaymentSummary(
      pi
    );

  const quantity =
    normalizeQuantity(
      metadataText(
        metadata,
        "quantity"
      )
    );

  const currency =
    cleanCurrency(
      pi.currency
    );

  const bookingId =
    getBookingId(
      pi
    );

  const fleetGroup =
    getFleetGroup(
      pi
    );

  const holdId =
    getHoldId(
      pi
    );

  const passengerIndexes =
    verification
      .passengerDriverIndexes
      .length >
    0
      ? verification
          .passengerDriverIndexes
          .join(
            ", "
          )
      : "-";

  const driverHtml =
    buildDriverEmailHtml(
      verification,
      fleetGroup
    );

  const {
    data,
    error,
  } =
    await resend
      .emails
      .send({
        from:
          `Nexa Bookings <${getFromEmail()}>`,

        to:
          getOwnerEmails(),

        subject:
          `✅ New booking paid — ${quantity} scooter${
            quantity ===
              1
              ? ""
              : "s"
          }`,

        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
            <h2 style="color:#f97316;">
              New paid booking received ✅
            </h2>

            <div style="background:#ecfdf3;border:1px solid #22c55e;padding:12px;border-radius:10px;margin-bottom:16px;">
              <b>Payment received successfully.</b><br/>
              Exact scooter codes have not been assigned automatically.
              Assign the scooters manually from the admin system.
            </div>

            <p><b>Booking ID:</b> ${safeText(
              bookingId
            )}</p>

            <p><b>Database row:</b> ${safeText(
              bookingRowId ||
              "-"
            )}</p>

            <p><b>PaymentIntent:</b> ${safeText(
              pi.id
            )}</p>

            <p><b>Payment hold:</b> ${safeText(
              holdId ||
              "-"
            )}</p>

            <hr/>

            <p><b>Customer:</b> ${safeText(
              metadataText(
                metadata,
                "customer_name"
              ) ||
              "-"
            )}</p>

            <p><b>Email:</b> ${safeText(
              metadataText(
                metadata,
                "customer_email"
              ) ||
              "-"
            )}</p>

            <p><b>Phone:</b> ${safeText(
              metadataText(
                metadata,
                "phone"
              ) ||
              "-"
            )}</p>

            <hr/>

            <p><b>Vehicle category:</b> ${safeText(
              getPublicVehicleName(
                pi
              )
            )}</p>

            <p><b>Fleet group:</b> ${safeText(
              fleetGroup ||
              "-"
            )}</p>

            <p><b>Originally requested scooters:</b>
              ${verification.requestedQuantity}
            </p>

            <p><b>Final confirmed scooters:</b>
              ${quantity}
            </p>

            <p><b>Approved drivers:</b>
              ${verification.approvedCount}
            </p>

            <p><b>Rejected drivers:</b>
              ${verification.rejectedCount}
            </p>

            <p><b>Passengers:</b>
              ${verification.passengerCount}
            </p>

            <p><b>Passenger driver indexes:</b>
              ${safeText(
                passengerIndexes
              )}
            </p>

            <p><b>Exact scooter assignment:</b>
              Manual assignment required
            </p>

            <p><b>Plan:</b> ${safeText(
              metadataText(
                metadata,
                "plan"
              ) ||
              "-"
            )}</p>

            <p><b>Days:</b> ${safeText(
              metadataText(
                metadata,
                "days"
              ) ||
              "-"
            )}</p>

            <p><b>Rate per day:</b> ${safeText(
              metadataText(
                metadata,
                "rate_per_day"
              ) ||
              "-"
            )}</p>

            <p><b>Pickup:</b> ${safeText(
              formatDate(
                metadataText(
                  metadata,
                  "pickup_date"
                )
              )
            )} at ${safeText(
              metadataText(
                metadata,
                "pickup_time"
              ) ||
              "-"
            )}</p>

            <p><b>Drop-off:</b> ${safeText(
              formatDate(
                metadataText(
                  metadata,
                  "dropoff_date"
                )
              )
            )} at ${safeText(
              metadataText(
                metadata,
                "dropoff_time"
              ) ||
              "-"
            )}</p>

            <p><b>Pickup location:</b> ${safeText(
              metadataText(
                metadata,
                "pickup_location"
              ) ||
              "-"
            )}</p>

            <p><b>Available after hold:</b> ${safeText(
              metadataText(
                metadata,
                "available_after_hold",
                "available_count"
              ) ||
              "-"
            )}</p>

            <p><b>Total online fleet:</b> ${safeText(
              metadataText(
                metadata,
                "total_online_fleet",
                "total_fleet"
              ) ||
              "-"
            )}</p>

            <p><b>Notes:</b> ${safeText(
              metadataText(
                metadata,
                "notes"
              ) ||
              "-"
            )}</p>

            <hr/>

            <h2>Driver verification and documents</h2>

            ${driverHtml}

            <hr/>

            <p><b>Total rental amount:</b>
              ${moneyFromCents(
                payment.totalAmount
              )}
              ${currency}
            </p>

            <p><b>Amount paid online:</b>
              ${moneyFromCents(
                payment.amountPaid
              )}
              ${currency}
            </p>

            <p><b>Remaining rental amount:</b>
              ${moneyFromCents(
                payment.remainingAmount
              )}
              ${currency}
            </p>

            <p><b>Rental fully paid:</b>
              ${
                payment.fullyPaid
                  ? "Yes"
                  : "No"
              }
            </p>

            <p><b>Marketing opt-in:</b> ${safeText(
              metadataText(
                metadata,
                "marketing_opt_in"
              ) ||
              "no"
            )}</p>
          </div>
        `,
      });

  if (
    error
  ) {
    throw new Error(
      `Owner confirmation email failed: ${error.message}`
    );
  }

  console.log(
    "OWNER EMAIL SENT:",
    data
  );
}

async function sendCustomerEmail(
  pi:
    Stripe.PaymentIntent,
  verification:
    VerificationBundle
) {
  const metadata =
    pi.metadata ||
    {};

  const customerEmail =
    metadataText(
      metadata,
      "customer_email"
    );

  if (
    !customerEmail
  ) {
    console.warn(
      "CUSTOMER EMAIL MISSING:",
      pi.id
    );

    return;
  }

  const resend =
    getResendClient();

  const payment =
    getPaymentSummary(
      pi
    );

  const currency =
    cleanCurrency(
      pi.currency
    );

  const quantity =
    normalizeQuantity(
      metadataText(
        metadata,
        "quantity"
      )
    );

  const paymentMessage =
    payment.fullyPaid
      ? `
        <p style="color:#15803d;">
          <b>Your complete rental amount has been paid online.</b>
          No rental balance remains to be paid at pickup.
        </p>
      `
      : `
        <p>
          <b>Remaining rental amount due at pickup:</b>
          ${moneyFromCents(
            payment.remainingAmount
          )} ${currency}
        </p>
      `;

  const quantityAdjustmentMessage =
    verification
      .requestedQuantity >
    quantity
      ? `
        <div style="background:#eff6ff;border:1px solid #60a5fa;padding:12px;border-radius:10px;margin:14px 0;">
          You originally requested
          <b>${verification.requestedQuantity} scooters</b>.
          Your final confirmed booking contains
          <b>${quantity} scooters</b> based on the completed driver verification.
        </div>
      `
      : "";

  const {
    data,
    error,
  } =
    await resend
      .emails
      .send({
        from:
          `Nexa Rentals <${getFromEmail()}>`,

        to:
          customerEmail,

        subject:
          "✅ Your Nexa Rentals booking is confirmed",

        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
            <h2 style="color:#f97316;">
              Your booking is confirmed ✅
            </h2>

            <p>
              Hi ${safeText(
                metadataText(
                  metadata,
                  "customer_name"
                )
              )},
            </p>

            <p>
              Thank you for choosing <b>Nexa Rentals</b>.
              Your payment was successful and your booking is confirmed.
            </p>

            ${quantityAdjustmentMessage}

            <hr/>

            <h3>Booking details</h3>

            <p><b>Booking ID:</b> ${safeText(
              getBookingId(
                pi
              )
            )}</p>

            <p><b>Vehicle:</b> ${safeText(
              getPublicVehicleName(
                pi
              )
            )}</p>

            <p><b>Confirmed quantity:</b>
              ${quantity}
            </p>

            <p><b>Plan:</b> ${safeText(
              metadataText(
                metadata,
                "plan"
              ) ||
              "-"
            )}</p>

            <p><b>Pickup:</b> ${safeText(
              formatDate(
                metadataText(
                  metadata,
                  "pickup_date"
                )
              )
            )} at ${safeText(
              metadataText(
                metadata,
                "pickup_time"
              ) ||
              "-"
            )}</p>

            <p><b>Drop-off:</b> ${safeText(
              formatDate(
                metadataText(
                  metadata,
                  "dropoff_date"
                )
              )
            )} at ${safeText(
              metadataText(
                metadata,
                "dropoff_time"
              ) ||
              "-"
            )}</p>

            <p><b>Pickup location:</b> ${safeText(
              metadataText(
                metadata,
                "pickup_location"
              ) ||
              "Carrer Galeón 13, Magaluf"
            )}</p>

            <hr/>

            <h3>Payment summary</h3>

            <p><b>Total rental amount:</b>
              ${moneyFromCents(
                payment.totalAmount
              )}
              ${currency}
            </p>

            <p><b>Amount paid online:</b>
              ${moneyFromCents(
                payment.amountPaid
              )}
              ${currency}
            </p>

            ${paymentMessage}

            <hr/>

            <h3>Required documents</h3>

            <ul>
              <li>Original valid driving licence for every approved driver</li>
              <li>Passport or national ID</li>
            </ul>

            <h3>Refundable security deposit</h3>

            <ul>
              <li>
                A refundable security deposit of
                <b>€150 per scooter</b> is required at pickup.
              </li>

              <li>
                The security deposit is separate from the rental payment.
              </li>

              <li>
                The security deposit must be paid at pickup.
              </li>
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

  if (
    error
  ) {
    throw new Error(
      `Customer confirmation email failed: ${error.message}`
    );
  }

  console.log(
    "CUSTOMER EMAIL SENT:",
    data
  );
}

export async function POST(
  req:
    Request
) {
  const stripeSecretKey =
    process.env
      .STRIPE_SECRET_KEY;

  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (
    !stripeSecretKey
  ) {
    console.error(
      "Missing STRIPE_SECRET_KEY"
    );

    return new NextResponse(
      "Missing Stripe configuration",
      {
        status:
          500,
      }
    );
  }

  if (
    !webhookSecret
  ) {
    console.error(
      "Missing STRIPE_WEBHOOK_SECRET"
    );

    return new NextResponse(
      "Missing Stripe webhook configuration",
      {
        status:
          500,
      }
    );
  }

  const signature =
    req.headers.get(
      "stripe-signature"
    );

  if (
    !signature
  ) {
    return new NextResponse(
      "Missing Stripe signature",
      {
        status:
          400,
      }
    );
  }

  const rawBody =
    await req.text();

  const stripe =
    new Stripe(
      stripeSecretKey
    );

  let event:
    Stripe.Event;

  try {
    event =
      stripe.webhooks
        .constructEvent(
          rawBody,
          signature,
          webhookSecret
        );
  } catch (
    error: any
  ) {
    console.error(
      "STRIPE WEBHOOK SIGNATURE ERROR:",
      error
    );

    return new NextResponse(
      `Webhook Error: ${
        error?.message ||
        "Invalid Stripe signature"
      }`,
      {
        status:
          400,
      }
    );
  }

  try {
    switch (
      event.type
    ) {
      case "payment_intent.succeeded": {
        const paymentIntent =
          event.data
            .object as Stripe.PaymentIntent;

        /*
         * Load all driver sessions and secure document references
         * before saving the paid booking.
         */
        const verification =
          await loadVerificationBundle(
            paymentIntent
          );

        /*
         * First save the confirmed booking.
         * If this fails, Stripe receives 500 and retries.
         */
        const bookingResult =
          await savePaidBooking(
            paymentIntent,
            verification
          );

        /*
         * Convert the temporary inventory hold.
         */
        const holdResult =
          await convertPaymentHold(
            paymentIntent
          );

        /*
         * Prevent duplicate confirmation emails during normal
         * Stripe webhook retries.
         */
        const shouldSendEmails =
          !bookingResult
            .alreadyConfirmed ||
          (
            holdResult
              .found &&
            !holdResult
              .wasAlreadyConverted
          );

        if (
          shouldSendEmails
        ) {
          try {
            await sendOwnerEmail(
              paymentIntent,
              bookingResult
                .bookingRowId,
              verification
            );
          } catch (
            emailError
          ) {
            console.error(
              "OWNER EMAIL SEND FAILED:",
              emailError
            );
          }

          try {
            await sendCustomerEmail(
              paymentIntent,
              verification
            );
          } catch (
            emailError
          ) {
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
          event.data
            .object as Stripe.PaymentIntent;

        await releasePaymentHold(
          paymentIntent,
          "payment_failed"
        );

        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent =
          event.data
            .object as Stripe.PaymentIntent;

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
      received:
        true,
    });
  } catch (
    error: any
  ) {
    console.error(
      "STRIPE WEBHOOK PROCESSING ERROR:",
      error
    );

    /*
     * Status 500 is deliberate so Stripe retries instead
     * of silently losing a paid booking.
     */
    return NextResponse.json(
      {
        received:
          false,

        error:
          error?.message ||
          "The Stripe event could not be processed.",
      },
      {
        status:
          500,
      }
    );
  }
}