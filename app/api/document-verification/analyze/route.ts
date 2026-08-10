import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "document_verification_sessions";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 28 * 1024 * 1024;

/*
 * You can override this in Vercel with:
 * OPENAI_DOCUMENT_MODEL
 *
 * gpt-4o is used by default because document
 * photographs require strong image-reading ability.
 */
const MODEL =
  process.env.OPENAI_DOCUMENT_MODEL?.trim() ||
  "gpt-4o";

type IdentityType = "id" | "passport";

type StepKey =
  | "dlFront"
  | "dlBack"
  | "idFront"
  | "idBack";

type Outcome =
  | "accepted"
  | "retake"
  | "manual_review"
  | "rejected";

type VehicleClass = {
  category: string;
  validFrom: string;
  validUntil: string;
};

type ExtractedDocument = {
  documentDetected: boolean;
  readable: boolean;

  firstName: string;
  lastName: string;
  fullName: string;

  dateOfBirth: string;
  dateOfExpiry: string;

  documentNumber: string;

  nationality: string;
  address: string;
  countryCode: string;

  documentType: string;
  issueDate: string;

  vehicleClasses: VehicleClass[];
};

type AiExtraction = {
  quality: {
    overall:
      | "good"
      | "retake"
      | "uncertain";

    retakeSides: StepKey[];
    issues: string[];
  };

  licence: ExtractedDocument;

  identity: ExtractedDocument & {
    selectedType: IdentityType;
  };

  /*
   * Kept in the response structure for compatibility
   * with the existing scanner page.
   *
   * It is never used to accept or reject a booking.
   */
  nameMatch:
    | "match"
    | "mismatch"
    | "uncertain";
};

class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

function documentSchema(
  withSelectedType: boolean
) {
  const properties: Record<
    string,
    unknown
  > = {
    documentDetected: {
      type: "boolean",
    },

    readable: {
      type: "boolean",
    },

    firstName: {
      type: "string",
    },

    lastName: {
      type: "string",
    },

    fullName: {
      type: "string",
    },

    dateOfBirth: {
      type: "string",
    },

    dateOfExpiry: {
      type: "string",
    },

    documentNumber: {
      type: "string",
    },

    nationality: {
      type: "string",
    },

    address: {
      type: "string",
    },

    countryCode: {
      type: "string",
    },

    documentType: {
      type: "string",
    },

    issueDate: {
      type: "string",
    },

    vehicleClasses: {
      type: "array",

      items: {
        type: "object",

        additionalProperties: false,

        properties: {
          category: {
            type: "string",
          },

          validFrom: {
            type: "string",
          },

          validUntil: {
            type: "string",
          },
        },

        required: [
          "category",
          "validFrom",
          "validUntil",
        ],
      },
    },
  };

  const required =
    Object.keys(properties);

  if (withSelectedType) {
    properties.selectedType = {
      type: "string",

      enum: [
        "id",
        "passport",
      ],
    };

    required.push(
      "selectedType"
    );
  }

  return {
    type: "object",

    additionalProperties: false,

    properties,

    required,
  };
}

const DOCUMENT_SCHEMA = {
  type: "object",

  additionalProperties: false,

  properties: {
    quality: {
      type: "object",

      additionalProperties: false,

      properties: {
        overall: {
          type: "string",

          enum: [
            "good",
            "retake",
            "uncertain",
          ],
        },

        retakeSides: {
          type: "array",

          items: {
            type: "string",

            enum: [
              "dlFront",
              "dlBack",
              "idFront",
              "idBack",
            ],
          },
        },

        issues: {
          type: "array",

          items: {
            type: "string",
          },
        },
      },

      required: [
        "overall",
        "retakeSides",
        "issues",
      ],
    },

    licence: documentSchema(
      false
    ),

    identity: documentSchema(
      true
    ),

    nameMatch: {
      type: "string",

      enum: [
        "match",
        "mismatch",
        "uncertain",
      ],
    },
  },

  required: [
    "quality",
    "licence",
    "identity",
    "nameMatch",
  ],
} as const;

function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

function isFile(
  value:
    FormDataEntryValue | null
): value is File {
  return value instanceof File;
}

function getOutputText(
  data: any
) {
  if (
    typeof data?.output_text ===
    "string"
  ) {
    return data.output_text;
  }

  const parts: string[] = [];

  for (
    const item of
    data?.output || []
  ) {
    if (
      item?.type !==
      "message"
    ) {
      continue;
    }

    for (
      const content of
      item?.content || []
    ) {
      if (
        content?.type ===
          "output_text" &&
        typeof content.text ===
          "string"
      ) {
        parts.push(
          content.text
        );
      }
    }
  }

  return parts.join("");
}

function getRefusalText(
  data: any
) {
  const refusals: string[] = [];

  for (
    const item of
    data?.output || []
  ) {
    if (
      item?.type !==
      "message"
    ) {
      continue;
    }

    for (
      const content of
      item?.content || []
    ) {
      if (
        content?.type ===
          "refusal" &&
        typeof content.refusal ===
          "string"
      ) {
        refusals.push(
          content.refusal
        );
      }
    }
  }

  return refusals.join(" ");
}

function parseIsoDate(
  value: string
) {
  const match =
    cleanText(value).match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const date = new Date(
    `${match[1]}-${match[2]}-${match[3]}T00:00:00Z`
  );

  if (
    !Number.isFinite(
      date.getTime()
    )
  ) {
    return null;
  }

  if (
    date.getUTCFullYear() !==
      Number(match[1]) ||
    date.getUTCMonth() + 1 !==
      Number(match[2]) ||
    date.getUTCDate() !==
      Number(match[3])
  ) {
    return null;
  }

  return date;
}

function todayUtc() {
  const now = new Date();

  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
}

function isPast(
  value: string
) {
  const date =
    parseIsoDate(value);

  /*
   * A missing or unreadable expiry date
   * is not treated as expired.
   *
   * Some older licences are permanent
   * or do not display an expiry date.
   */
  if (!date) {
    return false;
  }

  return (
    date.getTime() <
    todayUtc()
  );
}

function isFuture(
  value: string
) {
  const date =
    parseIsoDate(value);

  if (!date) {
    return false;
  }

  return (
    date.getTime() >
    todayUtc()
  );
}

function heldForThreeYears(
  value: string
) {
  const from =
    parseIsoDate(value);

  if (!from) {
    return null;
  }

  const threshold = new Date(
    Date.UTC(
      from.getUTCFullYear() + 3,
      from.getUTCMonth(),
      from.getUTCDate()
    )
  );

  return (
    todayUtc() >=
    threshold.getTime()
  );
}

function normalCategory(
  value: string
) {
  return cleanText(value)
    .toUpperCase()
    .replace(
      /[^A-Z0-9]/g,
      ""
    );
}

function decide(
  extraction: AiExtraction
) {
  /*
   * Only driving-licence photographs can
   * cause a retake.
   *
   * The ID/passport is collected for contract
   * preparation and does not control acceptance.
   */
  const licenceRetakeSides =
    extraction.quality
      .retakeSides
      .filter(
        (side): side is StepKey =>
          side === "dlFront" ||
          side === "dlBack"
      );

  const licenceCannotBeRead =
    !extraction.licence
      .documentDetected ||
    !extraction.licence
      .readable;

  const licencePhotoNeedsRetake =
    extraction.quality
      .overall ===
      "retake" &&
    licenceRetakeSides.length >
      0;

  if (
    licenceCannotBeRead ||
    licencePhotoNeedsRetake
  ) {
    const reasons =
      extraction.quality
        .issues.length > 0
        ? extraction.quality
            .issues
        : [
            "The driving licence could not be read clearly.",
          ];

    return {
      outcome:
        "retake" as Outcome,

      message:
        reasons[0] ||
        "Please retake the driving licence photograph.",

      reasons,

      retakeSides:
        licenceRetakeSides.length >
        0
          ? licenceRetakeSides
          : [
              "dlFront",
              "dlBack",
            ] as StepKey[],
    };
  }

  /*
   * Reject only when an expiry date is
   * clearly visible and is already past.
   *
   * Missing expiry dates are allowed.
   */
  if (
    isPast(
      extraction.licence
        .dateOfExpiry
    )
  ) {
    return {
      outcome:
        "rejected" as Outcome,

      message:
        "The driving licence appears to be expired.",

      reasons: [
        "Driving licence expired",
      ],

      retakeSides:
        [] as StepKey[],
    };
  }

  const classes =
    extraction.licence
      .vehicleClasses
      .map((item) => ({
        ...item,

        normalized:
          normalCategory(
            item.category
          ),
      }))
      .filter(
        (item) =>
          Boolean(
            item.normalized
          )
      );

  /*
   * If the AI could read the licence but
   * could not confidently read its category
   * table, allow the booking to continue
   * for manual review.
   */
  if (
    classes.length === 0
  ) {
    return {
      outcome:
        "manual_review" as Outcome,

      message:
        "Documents received. NEXA Rentals will confirm the driving licence manually before pickup.",

      reasons: [
        "Driving licence categories could not be read confidently",
      ],

      retakeSides:
        [] as StepKey[],
    };
  }

  const motorcycleCategories =
    classes.filter(
      (item) =>
        [
          "A",
          "A1",
          "A2",
        ].includes(
          item.normalized
        )
    );

  const validMotorcycle =
    motorcycleCategories.find(
      (item) =>
        !isPast(
          item.validUntil
        ) &&
        !isFuture(
          item.validFrom
        )
    );

  /*
   * A, A1 and A2 are directly valid for
   * NEXA's 125cc scooters.
   *
   * No minimum holding period is required.
   */
  if (validMotorcycle) {
    const manualReasons:
      string[] = [];

    if (
      extraction.quality
        .overall ===
      "uncertain"
    ) {
      manualReasons.push(
        ...(
          extraction.quality
            .issues.length >
          0
            ? extraction
                .quality
                .issues
            : [
                "Driving licence reading needs manual confirmation",
              ]
        )
      );
    }

    if (
      isFuture(
        extraction.licence
          .issueDate
      )
    ) {
      manualReasons.push(
        "The detected driving licence issue date needs manual confirmation"
      );
    }

    if (
      manualReasons.length >
      0
    ) {
      return {
        outcome:
          "manual_review" as Outcome,

        message:
          "Documents received. NEXA Rentals will confirm the driving licence manually before pickup.",

        reasons: [
          ...new Set(
            manualReasons
          ),
        ],

        retakeSides:
          [] as StepKey[],
      };
    }

    return {
      outcome:
        "accepted" as Outcome,

      message:
        "Driving licence accepted.",

      reasons:
        [] as string[],

      retakeSides:
        [] as StepKey[],
    };
  }

  const bCategories =
    classes.filter(
      (item) =>
        item.normalized ===
        "B"
    );

  const validBClass =
    bCategories.find(
      (item) =>
        !isPast(
          item.validUntil
        ) &&
        !isFuture(
          item.validFrom
        )
    );

  if (validBClass) {
    /*
     * For category B, use only the B category's
     * own valid-from date.
     *
     * The general card issue date may represent
     * a renewal or replacement and must not be
     * used to calculate the three-year period.
     */
    const bHeld =
      heldForThreeYears(
        validBClass.validFrom
      );

    if (
      bHeld === false
    ) {
      return {
        outcome:
          "rejected" as Outcome,

        message:
          "A category B driving licence must have been held for at least 3 years to ride a 125cc scooter in Spain.",

        reasons: [
          "Category B held for less than 3 years",
        ],

        retakeSides:
          [] as StepKey[],
      };
    }

    if (
      bHeld === null
    ) {
      return {
        outcome:
          "manual_review" as Outcome,

        message:
          "Documents received. NEXA Rentals will confirm the category B start date manually before pickup.",

        reasons: [
          "Category B valid-from date could not be read confidently",
        ],

        retakeSides:
          [] as StepKey[],
      };
    }

    if (
      extraction.quality
        .overall ===
      "uncertain"
    ) {
      return {
        outcome:
          "manual_review" as Outcome,

        message:
          "Documents received. NEXA Rentals will confirm the driving licence manually before pickup.",

        reasons:
          extraction.quality
            .issues.length > 0
            ? [
                ...new Set(
                  extraction
                    .quality
                    .issues
                ),
              ]
            : [
                "Driving licence reading needs manual confirmation",
              ],

        retakeSides:
          [] as StepKey[],
      };
    }

    return {
      outcome:
        "accepted" as Outcome,

      message:
        "Driving licence accepted.",

      reasons:
        [] as string[],

      retakeSides:
        [] as StepKey[],
    };
  }

  /*
   * A clearly detected AM-only licence cannot
   * be used for NEXA's 125cc scooters.
   */
  const hasAm =
    classes.some(
      (item) =>
        item.normalized ===
        "AM" &&
        !isPast(
          item.validUntil
        )
    );

  const hasPotentiallyCompatible =
    motorcycleCategories.length >
      0 ||
    bCategories.length > 0;

  if (
    hasAm &&
    !hasPotentiallyCompatible
  ) {
    return {
      outcome:
        "rejected" as Outcome,

      message:
        "Category AM is only valid for mopeds up to 50cc. NEXA Rentals only provides 125cc scooters.",

      reasons: [
        "AM licence is not valid for a 125cc scooter",
      ],

      retakeSides:
        [] as StepKey[],
    };
  }

  /*
   * A relevant category was visible but its
   * validity period has clearly expired or
   * has not started yet.
   */
  if (
    hasPotentiallyCompatible
  ) {
    return {
      outcome:
        "rejected" as Outcome,

      message:
        "The detected driving licence category is not currently valid for a 125cc scooter.",

      reasons: [
        "Compatible category is expired or not yet valid",
      ],

      retakeSides:
        [] as StepKey[],
    };
  }

  /*
   * Other clearly readable categories do not
   * authorise one of NEXA's 125cc scooters.
   */
  return {
    outcome:
      "rejected" as Outcome,

    message:
      "A valid A, A1, A2, or category B licence held for at least 3 years is required for a 125cc scooter.",

    reasons: [
      "No compatible driving licence category detected",
    ],

    retakeSides:
      [] as StepKey[],
  };
}

async function toImageInput(
  file: File,
  label: string
) {
  const mimeType =
    cleanText(file.type)
      .toLowerCase();

  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ].includes(
      mimeType
    )
  ) {
    throw new ApiError(
      `${label} must be a JPEG, PNG, WEBP, or GIF image.`,
      400
    );
  }

  if (
    file.size <= 0 ||
    file.size >
      MAX_FILE_BYTES
  ) {
    throw new ApiError(
      `${label} must be smaller than 8 MB.`,
      400
    );
  }

  const base64 =
    Buffer.from(
      await file.arrayBuffer()
    ).toString(
      "base64"
    );

  return {
    label,

    item: {
      type:
        "input_image" as const,

      image_url:
        `data:${mimeType};base64,${base64}`,

      /*
       * High detail is important for small
       * licence categories and dates.
       */
      detail:
        "high" as const,
    },
  };
}

export async function POST(
  req: Request
) {
  try {
    const apiKey =
      process.env
        .OPENAI_API_KEY;

    if (!apiKey) {
      throw new ApiError(
        "OPENAI_API_KEY is missing in Vercel.",
        500
      );
    }

    const form =
      await req.formData();

    const sessionToken =
      cleanText(
        form.get(
          "sessionToken"
        )
      );

    const identityType =
      cleanText(
        form.get(
          "identityType"
        )
      ) as IdentityType;

    if (!sessionToken) {
      throw new ApiError(
        "Missing sessionToken.",
        400
      );
    }

    if (
      identityType !==
        "id" &&
      identityType !==
        "passport"
    ) {
      throw new ApiError(
        "Invalid identityType.",
        400
      );
    }

    /*
     * Prevent arbitrary requests from sending
     * unrelated images to the OpenAI API.
     */
    const {
      data: session,
      error: sessionError,
    } =
      await supabaseAdmin
        .from(TABLE)
        .select(
          "session_token,status,expires_at"
        )
        .eq(
          "session_token",
          sessionToken
        )
        .maybeSingle();

    if (sessionError) {
      throw new Error(
        `Could not validate session: ${sessionError.message}`
      );
    }

    if (!session) {
      throw new ApiError(
        "Verification session not found.",
        404
      );
    }

    const expiresAt =
      new Date(
        session.expires_at
      ).getTime();

    if (
      !Number.isFinite(
        expiresAt
      )
    ) {
      throw new Error(
        "Verification session has an invalid expiry date."
      );
    }

    if (
      expiresAt <=
      Date.now()
    ) {
      throw new ApiError(
        "Verification session expired.",
        410
      );
    }

    if (
      session.status !==
      "scanning"
    ) {
      throw new ApiError(
        "Verification session is not active.",
        409
      );
    }

    const required:
      Array<
        [
          StepKey,
          string,
        ]
      > = [
      [
        "dlFront",
        "DRIVING LICENCE FRONT",
      ],

      [
        "dlBack",
        "DRIVING LICENCE BACK",
      ],

      [
        "idFront",
        identityType ===
        "passport"
          ? "PASSPORT PHOTO PAGE"
          : "IDENTITY CARD FRONT",
      ],
    ];

    if (
      identityType ===
      "id"
    ) {
      required.push([
        "idBack",
        "IDENTITY CARD BACK",
      ]);
    }

    const files:
      Array<{
        key: StepKey;
        label: string;
        file: File;
      }> = [];

    for (
      const [
        key,
        label,
      ] of required
    ) {
      const value =
        form.get(key);

      if (
        !isFile(value)
      ) {
        throw new ApiError(
          `${label} is missing.`,
          400
        );
      }

      files.push({
        key,
        label,
        file: value,
      });
    }

    const totalBytes =
      files.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.file.size,
        0
      );

    if (
      totalBytes >
      MAX_TOTAL_BYTES
    ) {
      throw new ApiError(
        "The document images are too large.",
        400
      );
    }

    const images =
      await Promise.all(
        files.map(
          (item) =>
            toImageInput(
              item.file,
              item.label
            )
        )
      );

    const content:
      any[] = [
      {
        type:
          "input_text",

        text:
          `You read rental documents for NEXA Rentals in Spain.

The customer selected this identity-document option: ${identityType}.

PRIMARY TASK — DRIVING LICENCE

Read the driving licence front and back carefully.

Extract:
- the licence holder details;
- the general issue date when visible;
- the general expiry date when visible;
- every visible driving category;
- each category's own valid-from date;
- each category's own valid-until date.

Small text and the category table are extremely important. Inspect the high-detail images carefully.

Read only information visibly present in the photographs. Never invent missing characters, categories or dates.

Return clearly readable dates as YYYY-MM-DD.

If an expiry date is missing, permanent, lifetime, shown with a dash, or not printed on the licence, return an empty string. A missing expiry date is not an error and must not cause a retake.

Do not use the general card issue date as the category B valid-from date. Category B's valid-from date must come from the category table.

Do not judge whether the document is genuine or authentic.

QUALITY RULES

quality.overall and quality.retakeSides must be based only on whether the DRIVING LICENCE can be read well enough to identify its categories and relevant dates.

Use "retake" only when the driving licence is genuinely unreadable because:
- the category table cannot be read;
- important driving-licence information is hidden by severe blur or glare;
- the driving licence is absent;
- the wrong side is shown.

Do not demand a perfect photograph. Normal perspective, small hand movement, minor reflections and slightly cropped decorative edges are acceptable when the categories and dates remain readable.

When a retake is necessary, include only dlFront and/or dlBack in quality.retakeSides.

If the licence is mostly readable but one result is uncertain, use quality.overall "uncertain" instead of "retake". The booking will then continue for manual review.

IDENTITY DOCUMENT

The ID card or passport is collected only to prepare the rental contract.

Extract any clearly visible identity details, but:
- never use identity quality to reject the booking;
- never request an identity-document retake;
- never require the identity document to have an expiry date;
- never compare its name or document number with the driving licence;
- never use an identity mismatch in quality.overall;
- never use a different selected identity type to reject the booking.

For compatibility, always return nameMatch as "uncertain".`,
      },
    ];

    for (
      const image of
      images
    ) {
      content.push({
        type:
          "input_text",

        text:
          image.label,
      });

      content.push(
        image.item
      );
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        60_000
      );

    let openaiResponse:
      Response;

    try {
      openaiResponse =
        await fetch(
          "https://api.openai.com/v1/responses",
          {
            method:
              "POST",

            headers: {
              Authorization:
                `Bearer ${apiKey}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                model:
                  MODEL,

                store:
                  false,

                input: [
                  {
                    role:
                      "user",

                    content,
                  },
                ],

                text: {
                  format: {
                    type:
                      "json_schema",

                    name:
                      "nexa_document_screening",

                    strict:
                      true,

                    schema:
                      DOCUMENT_SCHEMA,
                  },
                },

                max_output_tokens:
                  2200,
              }),

            signal:
              controller.signal,
          }
        );
    } catch (
      caught: any
    ) {
      if (
        caught?.name ===
        "AbortError"
      ) {
        throw new ApiError(
          "Document analysis timed out. Please try again.",
          504
        );
      }

      throw caught;
    } finally {
      clearTimeout(
        timeout
      );
    }

    const responseText =
      await openaiResponse.text();

    let raw: any = {};

    if (responseText) {
      try {
        raw =
          JSON.parse(
            responseText
          );
      } catch {
        throw new ApiError(
          "The document analysis service returned an invalid response.",
          502
        );
      }
    }

    if (
      !openaiResponse.ok
    ) {
      console.error(
        "OPENAI DOCUMENT ANALYSIS ERROR:",
        raw
      );

      throw new ApiError(
        "The document analysis service is temporarily unavailable.",
        502
      );
    }

    const refusal =
      getRefusalText(raw);

    if (refusal) {
      console.error(
        "OPENAI DOCUMENT ANALYSIS REFUSAL:",
        refusal
      );

      throw new ApiError(
        "The document photographs could not be analyzed automatically.",
        422
      );
    }

    if (
      raw?.status ===
      "incomplete"
    ) {
      console.error(
        "OPENAI DOCUMENT ANALYSIS INCOMPLETE:",
        raw?.incomplete_details
      );

      throw new ApiError(
        "Document analysis was incomplete. Please try again.",
        502
      );
    }

    const outputText =
      getOutputText(raw);

    if (!outputText) {
      throw new ApiError(
        "OpenAI returned no document result.",
        502
      );
    }

    let extraction:
      AiExtraction;

    try {
      extraction =
        JSON.parse(
          outputText
        ) as AiExtraction;
    } catch {
      console.error(
        "OPENAI DOCUMENT JSON PARSE ERROR:",
        outputText
      );

      throw new ApiError(
        "The document result could not be read.",
        502
      );
    }

    /*
     * OpenAI reads the visible document data.
     * The server-side code applies NEXA's
     * 125cc licence rules.
     */
    const decision =
      decide(
        extraction
      );

    return NextResponse.json({
      success:
        true,

      ...decision,

      licenceData:
        extraction.licence,

      identityData:
        extraction.identity,

      analysis:
        extraction,
    });
  } catch (
    error: any
  ) {
    console.error(
      "DOCUMENT ANALYSIS ERROR:",
      error
    );

    const status =
      error instanceof ApiError
        ? error.status
        : 500;

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Could not analyze documents.",
      },
      {
        status,
      }
    );
  }
}