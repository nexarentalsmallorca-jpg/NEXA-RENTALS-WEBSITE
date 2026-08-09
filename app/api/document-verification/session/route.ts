import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "document_verification_sessions";
const SESSION_MINUTES = 20;

type SessionStatus =
  | "pending"
  | "scanning"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

type IdentityType = "id" | "passport";

type CompleteSessionBody = {
  sessionToken?: string;

  action?: "start" | "complete" | "fail" | "cancel";

  identityType?: IdentityType;

  firstName?: string;
  lastName?: string;
  homeAddress?: string;

  licenceData?: unknown;
  identityData?: unknown;

  dlFrontPath?: string;
  dlBackPath?: string;
  idFrontPath?: string;
  idBackPath?: string;

  dlFrontName?: string;
  dlBackName?: string;
  idFrontName?: string;
  idBackName?: string;

  errorMessage?: string;
};

type VerificationSessionRow = {
  id: string;

  session_token: string;
  booking_id: string;

  status: SessionStatus;

  locale: string | null;

  identity_type: IdentityType | null;

  first_name: string | null;
  last_name: string | null;
  home_address: string | null;

  licence_data: unknown;
  identity_data: unknown;

  dl_front_path: string | null;
  dl_back_path: string | null;
  id_front_path: string | null;
  id_back_path: string | null;

  dl_front_name: string | null;
  dl_back_name: string | null;
  id_front_name: string | null;
  id_back_name: string | null;

  error_message: string | null;

  created_at: string;
  updated_at: string;

  expires_at: string;
  completed_at: string | null;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function cleanLocale(value: unknown) {
  const locale = cleanText(value).toLowerCase();

  const allowed = [
    "en",
    "es",
    "de",
    "fr",
    "it",
    "pt",
    "sv",
    "da",
    "no",
    "nl",
    "pl",
    "cs",
    "uk",
  ];

  return allowed.includes(locale) ? locale : "en";
}

function cleanFleetGroup(value: unknown) {
  const raw = cleanText(value).toLowerCase();

  if (!raw) {
    return "scooter";
  }

  return raw
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 80) || "scooter";
}

function isExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return true;
  }

  const expiry = new Date(expiresAt).getTime();

  if (!Number.isFinite(expiry)) {
    return true;
  }

  return Date.now() >= expiry;
}

function isTerminalStatus(status: SessionStatus) {
  return (
    status === "completed" ||
    status === "failed" ||
    status === "expired" ||
    status === "cancelled"
  );
}

function publicSessionData(row: VerificationSessionRow) {
  return {
    sessionToken: row.session_token,
    bookingId: row.booking_id,

    status: row.status,

    locale: row.locale,

    identityType: row.identity_type,

    firstName: row.first_name || "",
    lastName: row.last_name || "",
    homeAddress: row.home_address || "",

    dlFrontPath: row.dl_front_path || "",
    dlBackPath: row.dl_back_path || "",
    idFrontPath: row.id_front_path || "",
    idBackPath: row.id_back_path || "",

    dlFrontName: row.dl_front_name || "",
    dlBackName: row.dl_back_name || "",
    idFrontName: row.id_front_name || "",
    idBackName: row.id_back_name || "",

    errorMessage: row.error_message || "",

    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
    completedAt: row.completed_at,
  };
}

async function findSession(
  sessionToken: string
): Promise<VerificationSessionRow | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select("*")
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not read verification session: ${error.message}`
    );
  }

  return (data as VerificationSessionRow | null) ?? null;
}

async function markExpired(row: VerificationSessionRow) {
  if (
    !isExpired(row.expires_at) ||
    isTerminalStatus(row.status)
  ) {
    return row;
  }

  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({
      status: "expired",
      updated_at: now,
      error_message: "Verification session expired.",
    })
    .eq("session_token", row.session_token)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not expire verification session: ${error.message}`
    );
  }

  return data as VerificationSessionRow;
}

/*
 * POST
 *
 * Desktop checkout uses this to create a new
 * QR/document-verification session.
 */
export async function POST(req: Request) {
  try {
    let body: any = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const locale = cleanLocale(body?.locale);

    const fleetGroup = cleanFleetGroup(
      body?.fleetGroup
    );

    const sessionToken = randomUUID();

    /*
     * We create the booking ID now instead of waiting
     * until Stripe starts.
     *
     * The phone can therefore upload the documents
     * directly into this booking folder.
     *
     * Later the same bookingId will be used when
     * CheckoutClient creates the Stripe payment.
     */
    const bookingId = [
      "bk",
      fleetGroup,
      Date.now(),
      randomUUID().replace(/-/g, "").slice(0, 8),
    ].join("_");

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() +
        SESSION_MINUTES * 60 * 1000
    );

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert({
        session_token: sessionToken,

        booking_id: bookingId,

        status: "pending",

        locale,

        created_at: now.toISOString(),

        updated_at: now.toISOString(),

        expires_at: expiresAt.toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Could not create verification session: ${error.message}`
      );
    }

    const row = data as VerificationSessionRow;

    return NextResponse.json({
      success: true,

      ...publicSessionData(row),

      /*
       * CheckoutClient will convert this relative path
       * into the QR-code URL.
       */
      verifyPath:
        `/${locale}/verify-documents` +
        `?session=${encodeURIComponent(sessionToken)}`,
    });
  } catch (error: any) {
    console.error(
      "DOCUMENT VERIFICATION SESSION CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Could not create document verification session.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * GET
 *
 * Used by:
 *
 * 1. Desktop checkout while waiting for the phone.
 * 2. Phone verification page to check that the QR
 *    session still exists.
 *
 * Example:
 *
 * /api/document-verification/session?session=UUID
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const sessionToken = cleanText(
      url.searchParams.get("session")
    );

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing verification session.",
        },
        {
          status: 400,
        }
      );
    }

    let row = await findSession(sessionToken);

    if (!row) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification session was not found.",
        },
        {
          status: 404,
        }
      );
    }

    row = await markExpired(row);

    return NextResponse.json({
      success: true,

      ...publicSessionData(row),
    });
  } catch (error: any) {
    console.error(
      "DOCUMENT VERIFICATION SESSION READ ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Could not read document verification session.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * PATCH
 *
 * Phone verification page uses this to update the
 * current session.
 *
 * Supported actions:
 *
 * start
 * complete
 * fail
 * cancel
 */
export async function PATCH(req: Request) {
  try {
    let body: CompleteSessionBody;

    try {
      body =
        (await req.json()) as CompleteSessionBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const sessionToken = cleanText(
      body.sessionToken
    );

    const action = body.action;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing verification session.",
        },
        {
          status: 400,
        }
      );
    }

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing verification action.",
        },
        {
          status: 400,
        }
      );
    }

    let existing =
      await findSession(sessionToken);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Verification session was not found.",
        },
        {
          status: 404,
        }
      );
    }

    existing =
      await markExpired(existing);

    if (existing.status === "expired") {
      return NextResponse.json(
        {
          success: false,

          status: "expired",

          error:
            "This verification session has expired. Please restart checkout.",
        },
        {
          status: 410,
        }
      );
    }

    /*
     * A completed session must never be overwritten.
     */
    if (
      existing.status === "completed"
    ) {
      return NextResponse.json({
        success: true,

        ...publicSessionData(existing),
      });
    }

    const now =
      new Date().toISOString();

    /*
     * PHONE OPENED THE QR LINK
     */
    if (action === "start") {
      if (
        existing.status === "failed" ||
        existing.status === "cancelled"
      ) {
        return NextResponse.json(
          {
            success: false,

            status: existing.status,

            error:
              "This verification session can no longer be started.",
          },
          {
            status: 409,
          }
        );
      }

      const { data, error } =
        await supabaseAdmin
          .from(TABLE)
          .update({
            status: "scanning",

            updated_at: now,

            error_message: null,
          })
          .eq(
            "session_token",
            sessionToken
          )
          .select("*")
          .single();

      if (error) {
        throw new Error(
          `Could not start verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success: true,

        ...publicSessionData(
          data as VerificationSessionRow
        ),
      });
    }

    /*
     * PHONE FINISHED SCANNING
     */
    if (action === "complete") {
      const identityType =
        body.identityType;

      if (
        identityType !== "id" &&
        identityType !== "passport"
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Identity document type must be ID or passport.",
          },
          {
            status: 400,
          }
        );
      }

      const dlFrontPath =
        cleanText(body.dlFrontPath);

      const dlBackPath =
        cleanText(body.dlBackPath);

      const idFrontPath =
        cleanText(body.idFrontPath);

      const idBackPath =
        cleanText(body.idBackPath);

      if (
        !dlFrontPath ||
        !dlBackPath
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Both sides of the driving licence are required.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        identityType === "id" &&
        (!idFrontPath ||
          !idBackPath)
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Both sides of the ID card are required.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Passport is stored in idFrontPath.
       * There is naturally no idBackPath.
       */
      if (
        identityType === "passport" &&
        !idFrontPath
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Passport image is required.",
          },
          {
            status: 400,
          }
        );
      }

      const updatePayload = {
        status:
          "completed" as const,

        identity_type:
          identityType,

        first_name:
          cleanText(
            body.firstName
          ) || null,

        last_name:
          cleanText(
            body.lastName
          ) || null,

        home_address:
          cleanText(
            body.homeAddress
          ) || null,

        licence_data:
          body.licenceData ??
          null,

        identity_data:
          body.identityData ??
          null,

        dl_front_path:
          dlFrontPath,

        dl_back_path:
          dlBackPath,

        id_front_path:
          idFrontPath,

        id_back_path:
          identityType === "id"
            ? idBackPath
            : null,

        dl_front_name:
          cleanText(
            body.dlFrontName
          ) || null,

        dl_back_name:
          cleanText(
            body.dlBackName
          ) || null,

        id_front_name:
          cleanText(
            body.idFrontName
          ) || null,

        id_back_name:
          identityType === "id"
            ? cleanText(
                body.idBackName
              ) || null
            : null,

        error_message:
          null,

        updated_at:
          now,

        completed_at:
          now,
      };

      const { data, error } =
        await supabaseAdmin
          .from(TABLE)
          .update(
            updatePayload
          )
          .eq(
            "session_token",
            sessionToken
          )
          .select("*")
          .single();

      if (error) {
        throw new Error(
          `Could not complete verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success: true,

        ...publicSessionData(
          data as VerificationSessionRow
        ),
      });
    }

    /*
     * SCANNER FAILED
     */
    if (action === "fail") {
      const errorMessage =
        cleanText(
          body.errorMessage
        ) ||
        "Document verification failed.";

      const { data, error } =
        await supabaseAdmin
          .from(TABLE)
          .update({
            status: "failed",

            error_message:
              errorMessage,

            updated_at:
              now,
          })
          .eq(
            "session_token",
            sessionToken
          )
          .select("*")
          .single();

      if (error) {
        throw new Error(
          `Could not fail verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success: true,

        ...publicSessionData(
          data as VerificationSessionRow
        ),
      });
    }

    /*
     * CUSTOMER CANCELLED
     */
    if (action === "cancel") {
      const { data, error } =
        await supabaseAdmin
          .from(TABLE)
          .update({
            status:
              "cancelled",

            updated_at:
              now,

            error_message:
              "Verification cancelled.",
          })
          .eq(
            "session_token",
            sessionToken
          )
          .select("*")
          .single();

      if (error) {
        throw new Error(
          `Could not cancel verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success: true,

        ...publicSessionData(
          data as VerificationSessionRow
        ),
      });
    }

    return NextResponse.json(
      {
        success: false,

        error:
          "Unknown verification action.",
      },
      {
        status: 400,
      }
    );
  } catch (error: any) {
    console.error(
      "DOCUMENT VERIFICATION SESSION UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Could not update document verification session.",
      },
      {
        status: 500,
      }
    );
  }
}