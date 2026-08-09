import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "document_verification_sessions";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 28 * 1024 * 1024;

const MODEL =
  process.env.OPENAI_DOCUMENT_MODEL?.trim() ||
  "gpt-4o-mini";

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

  if (!date) {
    return false;
  }

  return (
    date.getTime() <
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
  extraction: AiExtraction,
  identityType: IdentityType
) {
  const fallbackRetakeSides:
    StepKey[] =
      identityType === "id"
        ? [
            "dlFront",
            "dlBack",
            "idFront",
            "idBack",
          ]
        : [
            "dlFront",
            "dlBack",
            "idFront",
          ];

  const validRetakeSides =
    extraction.quality
      .retakeSides
      .filter(
        (side) =>
          identityType ===
            "id" ||
          side !== "idBack"
      );

  if (
    extraction.quality
      .overall ===
      "retake" ||
    !extraction.licence
      .documentDetected ||
    !extraction.identity
      .documentDetected ||
    !extraction.licence
      .readable ||
    !extraction.identity
      .readable ||
    extraction.identity
      .selectedType !==
      identityType
  ) {
    const reasons =
      extraction.quality
        .issues.length > 0
        ? extraction.quality
            .issues
        : [
            "One or more required document photographs could not be read.",
          ];

    return {
      outcome:
        "retake" as Outcome,

      message:
        reasons[0] ||
        "One or more photographs are unclear. Please retake the requested image.",

      reasons,

      retakeSides:
        validRetakeSides.length >
        0
          ? validRetakeSides
          : fallbackRetakeSides,
    };
  }

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

  if (
    isPast(
      extraction.identity
        .dateOfExpiry
    )
  ) {
    return {
      outcome:
        "rejected" as Outcome,

      message:
        "The passport or identity document appears to be expired.",

      reasons: [
        "Identity document expired",
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
      }));

  const motorcycle =
    classes.find(
      (item) =>
        [
          "A",
          "A1",
          "A2",
        ].includes(
          item.normalized
        ) &&
        !isPast(
          item.validUntil
        )
    );

  const bClass =
    classes.find(
      (item) =>
        item.normalized ===
          "B" &&
        !isPast(
          item.validUntil
        )
    );

  let licenceAllowed =
    Boolean(motorcycle);

  let needsBDateReview =
    false;

  let selectedClass:
    | (VehicleClass & {
        normalized: string;
      })
    | undefined =
      motorcycle;

  if (
    !licenceAllowed &&
    bClass
  ) {
    selectedClass =
      bClass;

    /*
     * Important:
     * Only use the category-B valid-from
     * date from the licence category table.
     *
     * The general document issue date can
     * be a renewal/replacement date and does
     * not prove when category B was obtained.
     */
    const bHeld =
      heldForThreeYears(
        bClass.validFrom
      );

    if (
      bHeld === false
    ) {
      return {
        outcome:
          "rejected" as Outcome,

        message:
          "A category B driving licence must have been held for at least 3 years.",

        reasons: [
          "Category B held for less than 3 years",
        ],

        retakeSides:
          [] as StepKey[],
      };
    }

    if (
      bHeld === true
    ) {
      licenceAllowed =
        true;
    } else {
      needsBDateReview =
        true;
    }
  }

  if (
    !licenceAllowed &&
    !needsBDateReview
  ) {
    return {
      outcome:
        "rejected" as Outcome,

      message:
        "A valid A, A1, A2, or B licence held for 3+ years is required.",

      reasons: [
        "No compatible driving licence category detected",
      ],

      retakeSides:
        [] as StepKey[],
    };
  }

  const manualReasons:
    string[] = [];

  if (
    needsBDateReview
  ) {
    manualReasons.push(
      "The category B start date needs manual review"
    );
  }

  if (
    !parseIsoDate(
      extraction.licence
        .dateOfExpiry
    )
  ) {
    manualReasons.push(
      "The driving licence expiry date needs manual review"
    );
  }

  if (
    !parseIsoDate(
      extraction.identity
        .dateOfExpiry
    )
  ) {
    manualReasons.push(
      "The identity document expiry date needs manual review"
    );
  }

  if (
    selectedClass &&
    !parseIsoDate(
      selectedClass.validUntil
    )
  ) {
    manualReasons.push(
      "The driving licence category expiry date needs manual review"
    );
  }

  if (
    extraction.nameMatch !==
    "match"
  ) {
    manualReasons.push(
      "The names on the documents need manual review"
    );
  }

  if (
    extraction.quality
      .overall ===
    "uncertain"
  ) {
    if (
      extraction.quality
        .issues.length > 0
    ) {
      manualReasons.push(
        ...extraction.quality
          .issues
      );
    } else {
      manualReasons.push(
        "The document image quality needs manual review"
      );
    }
  }

  if (
    manualReasons.length > 0
  ) {
    return {
      outcome:
        "manual_review" as Outcome,

      message:
        "Documents received. NEXA Rentals will confirm them manually before pickup.",

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
      "Documents accepted.",

    reasons:
      [] as string[],

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
     * Never let an arbitrary request
     * send documents to OpenAI.
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

    /*
     * The scanner changes the session
     * to "scanning" before photographs
     * can be submitted.
     */
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
          `You screen rental documents for NEXA Rentals in Spain.

The customer selected this identity-document option: ${identityType}.

Read only information that is visibly present in the photographs. Never guess missing characters, names, categories, or dates. Never claim that a document is genuine or authentic.

Return all clearly readable dates only as YYYY-MM-DD. Return an empty string when a date is missing, incomplete, permanent, obscured, or not clearly readable.

For the driving licence, list every visible vehicle category separately. For each category, extract that category's own valid-from and valid-until dates from the category table when visible.

Do not use the general card issue date as the category-B valid-from date.

For identity.selectedType, report the type of identity document actually visible in the photograph. Do not simply repeat the customer's selected option when the visible document is a different type.

Mark quality.overall as "retake" when:
- text required for the checks is blurred;
- important document edges are cropped;
- glare hides information;
- the wrong document or wrong side is shown;
- a required document is absent;
- the visible identity document does not match the selected option.

Use quality.retakeSides to identify exactly which photographs must be taken again.

Compare the holder's name on the driving licence with the name on the passport or identity card.

When information cannot be determined confidently but the photographs do not clearly require a retake, use "uncertain" and explain the issue.`,
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

    /*
     * API key remains on the server.
     * The browser never receives it.
     */
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
     * OpenAI extracts visible data.
     * Our own code applies NEXA's
     * actual rental rules.
     */
    const decision =
      decide(
        extraction,
        identityType
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