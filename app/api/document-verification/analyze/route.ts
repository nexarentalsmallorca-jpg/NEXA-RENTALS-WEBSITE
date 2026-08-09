import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE =
  "document_verification_sessions";

const MAX_FILE_BYTES =
  8 * 1024 * 1024;

const MAX_TOTAL_BYTES =
  28 * 1024 * 1024;

const MODEL =
  process.env.OPENAI_DOCUMENT_MODEL ||
  "gpt-4o-mini";

type IdentityType =
  | "id"
  | "passport";

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

  vehicleClasses:
    VehicleClass[];
};

type AiExtraction = {
  quality: {
    overall:
      | "good"
      | "retake"
      | "uncertain";

    retakeSides:
      StepKey[];

    issues:
      string[];
  };

  licence:
    ExtractedDocument;

  identity:
    ExtractedDocument & {
      selectedType:
        IdentityType;
    };

  nameMatch:
    | "match"
    | "mismatch"
    | "uncertain";
};

const DOCUMENT_SCHEMA = {
  type: "object",

  additionalProperties:
    false,

  properties: {
    quality: {
      type: "object",

      additionalProperties:
        false,

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
            type:
              "string",
          },
        },
      },

      required: [
        "overall",
        "retakeSides",
        "issues",
      ],
    },

    licence:
      documentSchema(
        false
      ),

    identity:
      documentSchema(
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

function documentSchema(
  withSelectedType:
    boolean
) {
  const properties: Record<
    string,
    unknown
  > = {
    documentDetected: {
      type:
        "boolean",
    },

    readable: {
      type:
        "boolean",
    },

    firstName: {
      type:
        "string",
    },

    lastName: {
      type:
        "string",
    },

    fullName: {
      type:
        "string",
    },

    dateOfBirth: {
      type:
        "string",
    },

    dateOfExpiry: {
      type:
        "string",
    },

    documentNumber: {
      type:
        "string",
    },

    nationality: {
      type:
        "string",
    },

    address: {
      type:
        "string",
    },

    countryCode: {
      type:
        "string",
    },

    documentType: {
      type:
        "string",
    },

    issueDate: {
      type:
        "string",
    },

    vehicleClasses: {
      type:
        "array",

      items: {
        type:
          "object",

        additionalProperties:
          false,

        properties: {
          category: {
            type:
              "string",
          },

          validFrom: {
            type:
              "string",
          },

          validUntil: {
            type:
              "string",
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
    Object.keys(
      properties
    );

  if (
    withSelectedType
  ) {
    properties.selectedType =
      {
        type:
          "string",

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
    type:
      "object",

    additionalProperties:
      false,

    properties,

    required,
  };
}

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
  return (
    value instanceof
    File
  );
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
        return content.text;
      }
    }
  }

  return "";
}

function parseIsoDate(
  value: string
) {
  const match =
    cleanText(
      value
    ).match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!match) {
    return null;
  }

  const date =
    new Date(
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

function isPast(
  value: string
) {
  const date =
    parseIsoDate(
      value
    );

  if (!date) {
    return false;
  }

  const now =
    new Date();

  const today =
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

  return (
    date.getTime() <
    today
  );
}

function heldForThreeYears(
  value: string
) {
  const from =
    parseIsoDate(
      value
    );

  if (!from) {
    return null;
  }

  const today =
    new Date();

  const threshold =
    new Date(
      Date.UTC(
        from.getUTCFullYear() +
          3,

        from.getUTCMonth(),

        from.getUTCDate()
      )
    );

  return (
    today.getTime() >=
    threshold.getTime()
  );
}

function normalCategory(
  value: string
) {
  return cleanText(
    value
  )
    .toUpperCase()
    .replace(
      /[^A-Z0-9]/g,
      ""
    );
}

function decide(
  extraction:
    AiExtraction,

  identityType:
    IdentityType
) {
  const retakeSides =
    extraction.quality
      .retakeSides;

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
    return {
      outcome:
        "retake" as Outcome,

      message:
        extraction.quality
          .issues[0] ||
        "One or more photographs are unclear. Please retake the requested image.",

      reasons:
        extraction.quality
          .issues,

      retakeSides:
        retakeSides.length >
        0
          ? retakeSides
          : ([
              "dlFront",
              "dlBack",
              "idFront",
            ] as StepKey[]),
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
    Boolean(
      motorcycle
    );

  let bMissingDate =
    false;

  if (
    !licenceAllowed &&
    bClass
  ) {
    const bHeld =
      heldForThreeYears(
        bClass.validFrom ||
          extraction.licence
            .issueDate
      );

    licenceAllowed =
      bHeld === true;

    bMissingDate =
      bHeld === null;

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
  }

  if (
    !licenceAllowed &&
    !bMissingDate
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
    bMissingDate
  ) {
    manualReasons.push(
      "The category B start date needs manual review"
    );
  }

  if (
    !extraction.licence
      .dateOfExpiry
  ) {
    manualReasons.push(
      "The driving licence expiry date needs manual review"
    );
  }

  if (
    !extraction.identity
      .dateOfExpiry
  ) {
    manualReasons.push(
      "The identity document expiry date needs manual review"
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
    manualReasons.push(
      ...extraction.quality
        .issues
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
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ].includes(file.type)
  ) {
    throw new Error(
      `${label} must be a JPEG, PNG, WEBP, or GIF image.`
    );
  }

  if (
    file.size <= 0 ||
    file.size >
      MAX_FILE_BYTES
  ) {
    throw new Error(
      `${label} must be smaller than 8 MB.`
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
        `data:${file.type};base64,${base64}`,

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
      throw new Error(
        "OPENAI_API_KEY is missing in Vercel."
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

    if (
      !sessionToken
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Missing sessionToken.",
        },
        {
          status:
            400,
        }
      );
    }

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
            "Invalid identityType.",
        },
        {
          status:
            400,
        }
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

    if (
      sessionError
    ) {
      throw new Error(
        `Could not validate session: ${sessionError.message}`
      );
    }

    if (!session) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Verification session not found.",
        },
        {
          status:
            404,
        }
      );
    }

    if (
      new Date(
        session.expires_at
      ).getTime() <=
      Date.now()
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Verification session expired.",
        },
        {
          status:
            410,
        }
      );
    }

    if (
      [
        "failed",
        "expired",
        "cancelled",
      ].includes(
        session.status
      )
    ) {
      return NextResponse.json(
        {
          success:
            false,

          error:
            "Verification session is no longer active.",
        },
        {
          status:
            409,
        }
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

    const files =
      required.map(
        ([
          key,
          label,
        ]) => {
          const value =
            form.get(
              key
            );

          if (
            !isFile(
              value
            )
          ) {
            throw new Error(
              `${label} is missing.`
            );
          }

          return {
            key,
            label,
            file:
              value,
          };
        }
      );

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
      throw new Error(
        "The document images are too large."
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
          `You screen rental documents for NEXA Rentals in Spain. The customer selected ${identityType}.
Read only what is visibly present. Never guess missing characters or dates. Do not claim that a document is genuine.
Return dates only as YYYY-MM-DD; return an empty string if not clearly readable.
For the driving licence, list each vehicle category separately and its own valid-from/valid-until date when visible.
Mark retake when text is blurred, important edges are cropped, glare hides information, the wrong side is shown, or a required document is absent.
Use retakeSides to identify exactly which photographs must be taken again.
Compare the holder name on the driving licence with the passport/ID name.`,
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
     * The browser never sees it.
     */
    const openaiResponse =
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
        }
      );

    const raw =
      await openaiResponse.json();

    if (
      !openaiResponse.ok
    ) {
      console.error(
        "OPENAI DOCUMENT ANALYSIS ERROR:",
        raw
      );

      throw new Error(
        raw?.error?.message ||
          "OpenAI could not analyze the documents."
      );
    }

    const outputText =
      getOutputText(
        raw
      );

    if (
      !outputText
    ) {
      throw new Error(
        "OpenAI returned no document result."
      );
    }

    const extraction =
      JSON.parse(
        outputText
      ) as AiExtraction;

    /*
     * OpenAI extracts the data.
     * Our code applies the actual
     * rental rules.
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

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Could not analyze documents.",
      },
      {
        status:
          500,
      }
    );
  }
}