import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE =
  "document_verification_sessions";

const BASE_SESSION_MINUTES =
  20;

const MAX_GROUP_AGE_MS =
  2 * 60 * 60 * 1000;

type SessionStatus =
  | "pending"
  | "scanning"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

type IdentityType =
  | "id"
  | "passport";

type DriverProfile = {
  driverIndex: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
};

type CompleteSessionBody = {
  sessionToken?: string;

  action?:
    | "start"
    | "complete"
    | "fail"
    | "cancel";

  identityType?: IdentityType;

  firstName?: string;
  lastName?: string;
  homeAddress?: string;

  licenceData?: any;
  identityData?: any;

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

  identity_type:
    | IdentityType
    | null;

  first_name: string | null;
  last_name: string | null;
  home_address: string | null;

  licence_data: any;
  identity_data: any;

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

function cleanText(
  value: unknown
) {
  return String(
    value ??
    ""
  ).trim();
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

function cleanLocale(
  value: unknown
) {
  const locale =
    cleanText(
      value
    ).toLowerCase();

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

  return allowed.includes(
    locale
  )
    ? locale
    : "en";
}

function cleanFleetGroup(
  value: unknown
) {
  return (
    cleanText(
      value
    )
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]/g,
        ""
      )
      .slice(
        0,
        80
      ) ||
    "scooter"
  );
}

function normalizeDriverCount(
  value: unknown
) {
  return Math.min(
    15,
    Math.max(
      1,
      Math.floor(
        Number(
          value
        ) ||
        1
      )
    )
  );
}

/*
 * Driver details are intentionally optional here.
 *
 * The scanner extracts the driver's name from the licence.
 * Phone, email and full customer address are collected later
 * in the normal checkout form.
 */
function cleanDriverProfile(
  value: any,
  driverCount: number,
  fallbackDriverIndex = 1
): DriverProfile {
  const requestedDriverIndex =
    Number(
      value?.driverIndex ??
      fallbackDriverIndex
    );

  const driverIndex =
    Math.min(
      driverCount,
      Math.max(
        1,
        Number.isInteger(
          requestedDriverIndex
        )
          ? requestedDriverIndex
          : fallbackDriverIndex
      )
    );

  return {
    driverIndex,

    firstName:
      cleanText(
        value?.firstName
      ).slice(
        0,
        100
      ),

    lastName:
      cleanText(
        value?.lastName
      ).slice(
        0,
        100
      ),

    phone:
      cleanText(
        value?.phone
      ).slice(
        0,
        80
      ),

    email:
      cleanText(
        value?.email
      ).slice(
        0,
        250
      ),

    address:
      cleanText(
        value?.address
      ).slice(
        0,
        500
      ),
  };
}

function isExpired(
  expiresAt:
    | string
    | null
    | undefined
) {
  const expiry =
    expiresAt
      ? new Date(
          expiresAt
        ).getTime()
      : NaN;

  return (
    !Number.isFinite(
      expiry
    ) ||
    Date.now() >=
      expiry
  );
}

function isTerminalStatus(
  status: SessionStatus
) {
  return [
    "completed",
    "failed",
    "expired",
    "cancelled",
  ].includes(
    status
  );
}

function sessionMetadata(
  row: VerificationSessionRow
) {
  return isRecord(
    row.licence_data
  )
    ? row.licence_data
    : {};
}

function getDriverProfileFromSession(
  row: VerificationSessionRow
) {
  const licenceData =
    sessionMetadata(
      row
    );

  const driverCount =
    normalizeDriverCount(
      licenceData
        .driverCount
    );

  const storedProfile =
    isRecord(
      licenceData
        .driverProfile
    )
      ? licenceData
          .driverProfile
      : {};

  return cleanDriverProfile(
    {
      ...storedProfile,

      firstName:
        row.first_name ||
        cleanText(
          storedProfile
            .firstName
        ),

      lastName:
        row.last_name ||
        cleanText(
          storedProfile
            .lastName
        ),

      address:
        row.home_address ||
        cleanText(
          storedProfile
            .address
        ),
    },
    driverCount
  );
}

function mergeDriverProfile(
  existingLicence:
    Record<string, unknown>,
  body:
    CompleteSessionBody
) {
  const incomingLicence =
    isRecord(
      body.licenceData
    )
      ? body.licenceData
      : {};

  const existingProfile =
    isRecord(
      existingLicence
        .driverProfile
    )
      ? existingLicence
          .driverProfile
      : {};

  const incomingProfile =
    isRecord(
      incomingLicence
        .driverProfile
    )
      ? incomingLicence
          .driverProfile
      : {};

  const driverCount =
    normalizeDriverCount(
      existingLicence
        .driverCount
    );

  const driverIndex =
    Number(
      incomingProfile
        .driverIndex ??
      existingProfile
        .driverIndex ??
      1
    );

  return cleanDriverProfile(
    {
      ...existingProfile,
      ...incomingProfile,

      driverIndex,

      firstName:
        cleanText(
          body.firstName
        ) ||
        cleanText(
          incomingLicence
            .firstName
        ) ||
        cleanText(
          incomingProfile
            .firstName
        ) ||
        cleanText(
          existingProfile
            .firstName
        ),

      lastName:
        cleanText(
          body.lastName
        ) ||
        cleanText(
          incomingLicence
            .lastName
        ) ||
        cleanText(
          incomingProfile
            .lastName
        ) ||
        cleanText(
          existingProfile
            .lastName
        ),

      address:
        cleanText(
          body.homeAddress
        ) ||
        cleanText(
          incomingLicence
            .address
        ) ||
        cleanText(
          incomingProfile
            .address
        ) ||
        cleanText(
          existingProfile
            .address
        ),

      phone:
        cleanText(
          incomingProfile
            .phone
        ) ||
        cleanText(
          existingProfile
            .phone
        ),

      email:
        cleanText(
          incomingProfile
            .email
        ) ||
        cleanText(
          existingProfile
            .email
        ),
    },
    driverCount,
    Number.isInteger(
      driverIndex
    )
      ? driverIndex
      : 1
  );
}

function publicSessionData(
  row: VerificationSessionRow
) {
  const licenceData =
    sessionMetadata(
      row
    );

  const driverProfile =
    getDriverProfileFromSession(
      row
    );

  const documentUpload =
    isRecord(
      licenceData
        .documentUpload
    )
      ? licenceData
          .documentUpload
      : {};

  const publicLicenceData = {
    ...licenceData,

    driverProfile,
  };

  return {
    sessionToken:
      row.session_token,

    bookingId:
      row.booking_id,

    status:
      row.status,

    locale:
      row.locale,

    identityType:
      row.identity_type,

    firstName:
      row.first_name ||
      driverProfile
        .firstName ||
      "",

    lastName:
      row.last_name ||
      driverProfile
        .lastName ||
      "",

    homeAddress:
      row.home_address ||
      driverProfile
        .address ||
      "",

    driverProfile,

    driverCount:
      normalizeDriverCount(
        licenceData
          .driverCount
      ),

    vehicleName:
      cleanText(
        licenceData
          .vehicleName
      ),

    fleetGroup:
      cleanText(
        licenceData
          .fleetGroup
      ),

    analysisOutcome:
      licenceData
        .verificationOutcome ||
      null,

    messageKey:
      cleanText(
        licenceData
          .verificationMessageKey
      ),

    reasons:
      Array.isArray(
        licenceData
          .verificationReasons
      )
        ? licenceData
            .verificationReasons
        : [],

    licenceData:
      publicLicenceData,

    identityData:
      row.identity_data ||
      null,

    dlFrontPath:
      row.dl_front_path ||
      cleanText(
        documentUpload
          .dlFrontPath
      ),

    dlBackPath:
      row.dl_back_path ||
      cleanText(
        documentUpload
          .dlBackPath
      ),

    idFrontPath:
      row.id_front_path ||
      cleanText(
        documentUpload
          .idFrontPath
      ),

    idBackPath:
      row.id_back_path ||
      cleanText(
        documentUpload
          .idBackPath
      ),

    dlFrontName:
      row.dl_front_name ||
      cleanText(
        documentUpload
          .dlFrontName
      ),

    dlBackName:
      row.dl_back_name ||
      cleanText(
        documentUpload
          .dlBackName
      ),

    idFrontName:
      row.id_front_name ||
      cleanText(
        documentUpload
          .idFrontName
      ),

    idBackName:
      row.id_back_name ||
      cleanText(
        documentUpload
          .idBackName
      ),

    errorMessage:
      row.error_message ||
      "",

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    expiresAt:
      row.expires_at,

    completedAt:
      row.completed_at,
  };
}

async function findSession(
  sessionToken: string
): Promise<
  VerificationSessionRow | null
> {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        TABLE
      )
      .select(
        "*"
      )
      .eq(
        "session_token",
        sessionToken
      )
      .maybeSingle();

  if (
    error
  ) {
    throw new Error(
      `Could not read verification session: ${error.message}`
    );
  }

  return (
    data as
      | VerificationSessionRow
      | null
  ) ??
  null;
}

async function markExpired(
  row: VerificationSessionRow
) {
  if (
    !isExpired(
      row.expires_at
    ) ||
    isTerminalStatus(
      row.status
    )
  ) {
    return row;
  }

  const now =
    new Date()
      .toISOString();

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        TABLE
      )
      .update({
        status:
          "expired",

        updated_at:
          now,

        error_message:
          "Verification session expired.",
      })
      .eq(
        "session_token",
        row.session_token
      )
      .select(
        "*"
      )
      .single();

  if (
    error
  ) {
    throw new Error(
      `Could not expire verification session: ${error.message}`
    );
  }

  return (
    data as
      VerificationSessionRow
  );
}

export async function POST(
  req: Request
) {
  try {
    const body =
      await req
        .json()
        .catch(
          () => ({})
        );

    const locale =
      cleanLocale(
        body?.locale
      );

    const fleetGroup =
      cleanFleetGroup(
        body?.fleetGroup
      );

    const driverCount =
      normalizeDriverCount(
        body?.driverCount
      );

    const requestedDriverIndex =
      Number(
        body
          ?.driverProfile
          ?.driverIndex ??
        body?.driverIndex ??
        1
      );

    const driverProfile =
      cleanDriverProfile(
        body?.driverProfile,
        driverCount,
        Number.isInteger(
          requestedDriverIndex
        )
          ? requestedDriverIndex
          : 1
      );

    const parentSessionToken =
      cleanText(
        body
          ?.parentSessionToken
      );

    let bookingId =
      "";

    if (
      parentSessionToken
    ) {
      const parent =
        await findSession(
          parentSessionToken
        );

      if (
        !parent
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "The group verification session was not found.",
          },
          {
            status:
              404,
          }
        );
      }

      const parentCreated =
        new Date(
          parent.created_at
        ).getTime();

      if (
        !Number.isFinite(
          parentCreated
        ) ||
        Date.now() -
          parentCreated >
          MAX_GROUP_AGE_MS
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "The group verification session expired. Please restart checkout.",
          },
          {
            status:
              410,
          }
        );
      }

      bookingId =
        parent.booking_id;
    } else {
      bookingId = [
        "bk",
        fleetGroup,
        Date.now(),
        randomUUID()
          .replace(
            /-/g,
            ""
          )
          .slice(
            0,
            8
          ),
      ].join(
        "_"
      );
    }

    const duplicateQuery =
      await supabaseAdmin
        .from(
          TABLE
        )
        .select(
          "id,status,licence_data,created_at"
        )
        .eq(
          "booking_id",
          bookingId
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (
      duplicateQuery.error
    ) {
      throw new Error(
        `Could not check group verification: ${duplicateQuery.error.message}`
      );
    }

    const activeDuplicate =
      (
        duplicateQuery.data ||
        []
      ).find(
        (
          item: any
        ) => {
          const metadata =
            isRecord(
              item.licence_data
            )
              ? item.licence_data
              : {};

          const existingProfile =
            isRecord(
              metadata
                .driverProfile
            )
              ? metadata
                  .driverProfile
              : {};

          return (
            Number(
              existingProfile
                .driverIndex
            ) ===
              driverProfile
                .driverIndex &&
            [
              "pending",
              "scanning",
            ].includes(
              cleanText(
                item.status
              ).toLowerCase()
            )
          );
        }
      );

    if (
      activeDuplicate
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            `Driver ${driverProfile.driverIndex} already has an active scanner session.`,
        },
        {
          status:
            409,
        }
      );
    }

    const sessionToken =
      randomUUID();

    const now =
      new Date();

    const sessionMinutes =
      Math.min(
        120,
        Math.max(
          BASE_SESSION_MINUTES,
          driverCount *
            10
        )
      );

    const expiresAt =
      new Date(
        now.getTime() +
        sessionMinutes *
          60 *
          1000
      );

    const licenceData = {
      driverProfile,

      driverCount,

      vehicleName:
        cleanText(
          body?.vehicleName
        ).slice(
          0,
          220
        ),

      fleetGroup,

      rentalStartDate:
        cleanText(
          body
            ?.rentalStartDate
        ).slice(
          0,
          20
        ),

      rentalEndDate:
        cleanText(
          body
            ?.rentalEndDate
        ).slice(
          0,
          20
        ),

      pickupTime:
        cleanText(
          body?.pickupTime
        ).slice(
          0,
          20
        ),

      dropoffTime:
        cleanText(
          body?.dropoffTime
        ).slice(
          0,
          20
        ),

      /*
       * Names and contact details will be populated later
       * from the scanner and normal checkout form.
       */
      verificationOutcome:
        "pending",
    };

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          TABLE
        )
        .insert({
          session_token:
            sessionToken,

          booking_id:
            bookingId,

          status:
            "pending",

          locale,

          first_name:
            driverProfile
              .firstName ||
            null,

          last_name:
            driverProfile
              .lastName ||
            null,

          home_address:
            driverProfile
              .address ||
            null,

          licence_data:
            licenceData,

          created_at:
            now.toISOString(),

          updated_at:
            now.toISOString(),

          expires_at:
            expiresAt
              .toISOString(),
        })
        .select(
          "*"
        )
        .single();

    if (
      error
    ) {
      throw new Error(
        `Could not create verification session: ${error.message}`
      );
    }

    const row =
      data as
        VerificationSessionRow;

    return NextResponse.json({
      success:
        true,

      ...publicSessionData(
        row
      ),

      verifyPath:
        `/${locale}/verify-documents` +
        `?session=${encodeURIComponent(
          sessionToken
        )}`,
    });
  } catch (
    error: any
  ) {
    console.error(
      "DOCUMENT VERIFICATION SESSION CREATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Could not create document verification session.",
      },
      {
        status:
          500,
      }
    );
  }
}

export async function GET(
  req: Request
) {
  try {
    const sessionToken =
      cleanText(
        new URL(
          req.url
        ).searchParams.get(
          "session"
        )
      );

    if (
      !sessionToken
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Missing verification session.",
        },
        {
          status:
            400,
        }
      );
    }

    let row =
      await findSession(
        sessionToken
      );

    if (
      !row
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Verification session was not found.",
        },
        {
          status:
            404,
        }
      );
    }

    row =
      await markExpired(
        row
      );

    return NextResponse.json({
      success:
        true,

      ...publicSessionData(
        row
      ),
    });
  } catch (
    error: any
  ) {
    console.error(
      "DOCUMENT VERIFICATION SESSION READ ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Could not read document verification session.",
      },
      {
        status:
          500,
      }
    );
  }
}

export async function PATCH(
  req: Request
) {
  try {
    const body =
      (
        await req.json()
      ) as CompleteSessionBody;

    const sessionToken =
      cleanText(
        body.sessionToken
      );

    const action =
      body.action;

    if (
      !sessionToken ||
      !action
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Missing verification session or action.",
        },
        {
          status:
            400,
        }
      );
    }

    let existing =
      await findSession(
        sessionToken
      );

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Verification session was not found.",
        },
        {
          status:
            404,
        }
      );
    }

    existing =
      await markExpired(
        existing
      );

    if (
      existing.status ===
      "expired"
    ) {
      return NextResponse.json(
        {
          success:
            false,

          status:
            "expired",

          error:
            "This verification session has expired. Please restart checkout.",
        },
        {
          status:
            410,
        }
      );
    }

    if (
      existing.status ===
      "completed"
    ) {
      return NextResponse.json({
        success:
          true,

        ...publicSessionData(
          existing
        ),
      });
    }

    const now =
      new Date()
        .toISOString();

    const existingLicence =
      sessionMetadata(
        existing
      );

    if (
      action ===
      "start"
    ) {
      if (
        [
          "failed",
          "cancelled",
        ].includes(
          existing.status
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            status:
              existing.status,

            error:
              "This verification session can no longer be started.",
          },
          {
            status:
              409,
          }
        );
      }

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            TABLE
          )
          .update({
            status:
              "scanning",

            updated_at:
              now,

            error_message:
              null,
          })
          .eq(
            "session_token",
            sessionToken
          )
          .select(
            "*"
          )
          .single();

      if (
        error
      ) {
        throw new Error(
          `Could not start verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success:
          true,

        ...publicSessionData(
          data as
            VerificationSessionRow
        ),
      });
    }

    if (
      action ===
      "complete"
    ) {
      const identityType =
        body.identityType;

      if (
        identityType !==
          "id" &&
        identityType !==
          "passport"
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "Identity document type must be ID or passport.",
          },
          {
            status:
              400,
          }
        );
      }

      const dlFrontPath =
        cleanText(
          body.dlFrontPath
        );

      const dlBackPath =
        cleanText(
          body.dlBackPath
        );

      const idFrontPath =
        cleanText(
          body.idFrontPath
        );

      const idBackPath =
        cleanText(
          body.idBackPath
        );

      if (
        !dlFrontPath ||
        !dlBackPath ||
        !idFrontPath ||
        (
          identityType ===
            "id" &&
          !idBackPath
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            error:
              "All required driver documents must be uploaded.",
          },
          {
            status:
              400,
          }
        );
      }

      const incomingLicence =
        isRecord(
          body.licenceData
        )
          ? body.licenceData
          : {};

      const driverProfile =
        mergeDriverProfile(
          existingLicence,
          body
        );

      const mergedLicence = {
        ...existingLicence,
        ...incomingLicence,

        driverProfile,
      };

      const firstName =
        driverProfile
          .firstName ||
        cleanText(
          body.firstName
        ) ||
        existing.first_name;

      const lastName =
        driverProfile
          .lastName ||
        cleanText(
          body.lastName
        ) ||
        existing.last_name;

      const homeAddress =
        driverProfile
          .address ||
        cleanText(
          body.homeAddress
        ) ||
        existing.home_address;

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            TABLE
          )
          .update({
            status:
              "completed",

            identity_type:
              identityType,

            first_name:
              firstName ||
              null,

            last_name:
              lastName ||
              null,

            home_address:
              homeAddress ||
              null,

            licence_data:
              mergedLicence,

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
              identityType ===
              "id"
                ? idBackPath
                : null,

            dl_front_name:
              cleanText(
                body.dlFrontName
              ) ||
              null,

            dl_back_name:
              cleanText(
                body.dlBackName
              ) ||
              null,

            id_front_name:
              cleanText(
                body.idFrontName
              ) ||
              null,

            id_back_name:
              identityType ===
              "id"
                ? cleanText(
                    body.idBackName
                  ) ||
                  null
                : null,

            error_message:
              null,

            updated_at:
              now,

            completed_at:
              now,
          })
          .eq(
            "session_token",
            sessionToken
          )
          .select(
            "*"
          )
          .single();

      if (
        error
      ) {
        throw new Error(
          `Could not complete verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success:
          true,

        ...publicSessionData(
          data as
            VerificationSessionRow
        ),
      });
    }

    if (
      action ===
      "fail"
    ) {
      const errorMessage =
        cleanText(
          body.errorMessage
        ) ||
        "Document verification failed.";

      const incomingLicence =
        isRecord(
          body.licenceData
        )
          ? body.licenceData
          : {};

      const driverProfile =
        mergeDriverProfile(
          existingLicence,
          body
        );

      const mergedLicence = {
        ...existingLicence,
        ...incomingLicence,

        driverProfile,

        verificationOutcome:
          "rejected",
      };

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            TABLE
          )
          .update({
            status:
              "failed",

            identity_type:
              body.identityType ||
              existing.identity_type,

            first_name:
              driverProfile
                .firstName ||
              existing.first_name,

            last_name:
              driverProfile
                .lastName ||
              existing.last_name,

            home_address:
              driverProfile
                .address ||
              existing.home_address,

            licence_data:
              mergedLicence,

            identity_data:
              body.identityData ??
              existing.identity_data,

            dl_front_path:
              cleanText(
                body.dlFrontPath
              ) ||
              existing.dl_front_path,

            dl_back_path:
              cleanText(
                body.dlBackPath
              ) ||
              existing.dl_back_path,

            id_front_path:
              cleanText(
                body.idFrontPath
              ) ||
              existing.id_front_path,

            id_back_path:
              cleanText(
                body.idBackPath
              ) ||
              existing.id_back_path,

            dl_front_name:
              cleanText(
                body.dlFrontName
              ) ||
              existing.dl_front_name,

            dl_back_name:
              cleanText(
                body.dlBackName
              ) ||
              existing.dl_back_name,

            id_front_name:
              cleanText(
                body.idFrontName
              ) ||
              existing.id_front_name,

            id_back_name:
              cleanText(
                body.idBackName
              ) ||
              existing.id_back_name,

            error_message:
              errorMessage,

            updated_at:
              now,

            completed_at:
              now,
          })
          .eq(
            "session_token",
            sessionToken
          )
          .select(
            "*"
          )
          .single();

      if (
        error
      ) {
        throw new Error(
          `Could not fail verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success:
          true,

        ...publicSessionData(
          data as
            VerificationSessionRow
        ),
      });
    }

    if (
      action ===
      "cancel"
    ) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            TABLE
          )
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
          .select(
            "*"
          )
          .single();

      if (
        error
      ) {
        throw new Error(
          `Could not cancel verification session: ${error.message}`
        );
      }

      return NextResponse.json({
        success:
          true,

        ...publicSessionData(
          data as
            VerificationSessionRow
        ),
      });
    }

    return NextResponse.json(
      {
        success:
          false,

        error:
          "Unknown verification action.",
      },
      {
        status:
          400,
      }
    );
  } catch (
    error: any
  ) {
    console.error(
      "DOCUMENT VERIFICATION SESSION UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Could not update document verification session.",
      },
      {
        status:
          500,
      }
    );
  }
}