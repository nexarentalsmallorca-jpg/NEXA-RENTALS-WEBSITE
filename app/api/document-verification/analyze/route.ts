import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "document_verification_sessions";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 28 * 1024 * 1024;
const MODEL = process.env.OPENAI_DOCUMENT_MODEL?.trim() || "gpt-5.6";
const OPENAI_TIMEOUT_MS = 75_000;

type IdentityType = "id" | "passport";
type StepKey = "dlFront" | "dlBack" | "idFront" | "idBack";
type Outcome = "accepted" | "retake" | "rejected";

type DecisionKey =
  | "retake"
  | "licence_expired"
  | "b_less_than_three_years"
  | "kymco_a1_less_than_one_year"
  | "kymco_motorcycle_category_required"
  | "no_compatible_category"
  | "category_not_yet_valid"
  | "accepted";

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
    overall: "good" | "retake" | "uncertain";
    retakeSides: StepKey[];
    issues: string[];
  };
  licence: ExtractedDocument;
  identity: ExtractedDocument & {
    selectedType: IdentityType;
  };
  nameMatch: "match" | "mismatch" | "uncertain";
};

type Decision = {
  outcome: Outcome;
  messageKey: DecisionKey;
  message: string;
  reasons: string[];
  retakeSides: StepKey[];
};

type ImageInput = {
  key: StepKey;
  label: string;
  item: {
    type: "input_image";
    image_url: string;
    detail: "high";
  };
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function documentSchema(withSelectedType: boolean) {
  const properties: Record<string, unknown> = {
    documentDetected: { type: "boolean" },
    readable: { type: "boolean" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    fullName: { type: "string" },
    dateOfBirth: { type: "string" },
    dateOfExpiry: { type: "string" },
    documentNumber: { type: "string" },
    nationality: { type: "string" },
    address: { type: "string" },
    countryCode: { type: "string" },
    documentType: { type: "string" },
    issueDate: { type: "string" },
    vehicleClasses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          category: { type: "string" },
          validFrom: { type: "string" },
          validUntil: { type: "string" },
        },
        required: ["category", "validFrom", "validUntil"],
      },
    },
  };

  const required = Object.keys(properties);

  if (withSelectedType) {
    properties.selectedType = {
      type: "string",
      enum: ["id", "passport"],
    };
    required.push("selectedType");
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
          enum: ["good", "retake", "uncertain"],
        },
        retakeSides: {
          type: "array",
          items: {
            type: "string",
            enum: ["dlFront", "dlBack", "idFront", "idBack"],
          },
        },
        issues: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["overall", "retakeSides", "issues"],
    },
    licence: documentSchema(false),
    identity: documentSchema(true),
    nameMatch: {
      type: "string",
      enum: ["match", "mismatch", "uncertain"],
    },
  },
  required: ["quality", "licence", "identity", "nameMatch"],
} as const;

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

function getOutputText(data: any) {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  const parts: string[] = [];

  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;

    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("");
}

function getRefusalText(data: any) {
  const refusals: string[] = [];

  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;

    for (const content of item?.content || []) {
      if (content?.type === "refusal" && typeof content.refusal === "string") {
        refusals.push(content.refusal);
      }
    }
  }

  return refusals.join(" ");
}

function parseIsoDate(value: string) {
  const match = cleanText(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return null;

  if (
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() + 1 !== Number(match[2]) ||
    date.getUTCDate() !== Number(match[3])
  ) {
    return null;
  }

  return date;
}

function todayUtc() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function isPast(value: string) {
  const date = parseIsoDate(value);
  return date ? date.getTime() < todayUtc() : false;
}

function isFuture(value: string) {
  const date = parseIsoDate(value);
  return date ? date.getTime() > todayUtc() : false;
}

function heldForYears(value: string, years: number) {
  const from = parseIsoDate(value);
  if (!from) return null;

  const threshold = Date.UTC(
    from.getUTCFullYear() + years,
    from.getUTCMonth(),
    from.getUTCDate(),
  );

  return todayUtc() >= threshold;
}

function normalCategory(value: string) {
  return cleanText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function isKymcoSkyTownBooking(bookingId: string) {
  const normalized = cleanText(bookingId)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return normalized.includes("kymco") || normalized.includes("skytown");
}

function categoryCurrentlyValid(item: VehicleClass & { normalized: string }) {
  if (item.validFrom && isFuture(item.validFrom)) return false;
  if (item.validUntil && isPast(item.validUntil)) return false;
  return true;
}

function categoryHeldForYears(
  item: VehicleClass & { normalized: string },
  licenceIssueDate: string,
  years: number,
) {
  const direct = heldForYears(item.validFrom, years);
  if (direct !== null) return direct;

  // Older licences do not always print a per-category start date. A clearly
  // visible general licence issue date that is already older than the required
  // period is a conservative lower-bound fallback. A recent general issue date
  // is NOT used to reject because the category may have been held before a renewal.
  const fallback = heldForYears(licenceIssueDate, years);
  return fallback === true ? true : null;
}

function uniqueSteps(values: StepKey[]) {
  return [...new Set(values)];
}

function licenceRetake(
  message: string,
  reasons: string[],
  sides: StepKey[] = ["dlFront", "dlBack"],
): Decision {
  return {
    outcome: "retake",
    messageKey: "retake",
    message,
    reasons: [...new Set(reasons)],
    retakeSides: uniqueSteps(sides),
  };
}

function acceptedDecision(): Decision {
  return {
    outcome: "accepted",
    messageKey: "accepted",
    message: "Driving licence accepted.",
    reasons: [],
    retakeSides: [],
  };
}

function decide(
  extraction: AiExtraction,
  kymcoSkyTown: boolean,
  identityType: IdentityType,
): Decision {
  const licenceSides = extraction.quality.retakeSides.filter(
    (side): side is StepKey => side === "dlFront" || side === "dlBack",
  );

  if (!extraction.licence.documentDetected) {
    return licenceRetake(
      "The photographs do not appear to show a driving licence. Please retake the licence photographs.",
      extraction.quality.issues.length
        ? extraction.quality.issues
        : ["Driving licence was not detected"],
      licenceSides.length ? licenceSides : ["dlFront", "dlBack"],
    );
  }

  const holderReadable = Boolean(
    cleanText(extraction.licence.fullName) ||
      cleanText(extraction.licence.firstName) ||
      cleanText(extraction.licence.lastName),
  );

  const classes = extraction.licence.vehicleClasses
    .map((item) => ({
      ...item,
      normalized: normalCategory(item.category),
    }))
    .filter((item) => Boolean(item.normalized));

  // Do not require a perfect image or every optional field. The licence is usable
  // when the document is clearly a driving licence and the information needed for
  // the rental decision can be recovered from the two sides together.
  if (!holderReadable) {
    return licenceRetake(
      "The licence holder name could not be read. Please retake the front of the licence.",
      ["Licence holder name could not be read"],
      ["dlFront"],
    );
  }

  if (!extraction.licence.readable && classes.length === 0) {
    return licenceRetake(
      "The driving-licence categories could not be read. Please retake the back of the licence.",
      extraction.quality.issues.length
        ? extraction.quality.issues
        : ["Driving-licence categories could not be read"],
      ["dlBack"],
    );
  }

  if (classes.length === 0) {
    return licenceRetake(
      "The driving-licence category table could not be read. Please retake the back of the licence in focus.",
      ["Driving-licence categories were not detected"],
      ["dlBack"],
    );
  }

  // A missing general expiry date is allowed for old/permanent licence formats.
  if (extraction.licence.dateOfExpiry && isPast(extraction.licence.dateOfExpiry)) {
    return {
      outcome: "rejected",
      messageKey: "licence_expired",
      message: "The driving licence appears to be expired.",
      reasons: ["Driving licence expired"],
      retakeSides: [],
    };
  }

  const identityWrongType = extraction.identity.selectedType !== identityType;
  const identityCannotBeRead =
    !extraction.identity.documentDetected || !extraction.identity.readable;

  if (identityWrongType || identityCannotBeRead) {
    return {
      outcome: "retake",
      messageKey: "retake",
      message:
        identityType === "passport"
          ? "The passport photo page could not be read clearly. Please retake the passport photo."
          : "The identity card could not be read clearly. Please retake the identity card photographs.",
      reasons: [
        identityWrongType
          ? "The selected identity document type does not match the uploaded document"
          : "The identity document could not be read clearly",
      ],
      retakeSides: identityType === "passport" ? ["idFront"] : ["idFront", "idBack"],
    };
  }

  const motorcycleCategories = classes.filter((item) =>
    ["A", "A1", "A2"].includes(item.normalized),
  );

  if (kymcoSkyTown) {
    const validHigherMotorcycle = motorcycleCategories.find(
      (item) => ["A", "A2"].includes(item.normalized) && categoryCurrentlyValid(item),
    );

    if (validHigherMotorcycle) return acceptedDecision();

    const validA1 = motorcycleCategories.find(
      (item) => item.normalized === "A1" && categoryCurrentlyValid(item),
    );

    if (validA1) {
      const a1Held = categoryHeldForYears(
        validA1,
        extraction.licence.issueDate,
        1,
      );

      if (a1Held === true) return acceptedDecision();

      if (heldForYears(validA1.validFrom, 1) === false) {
        return {
          outcome: "rejected",
          messageKey: "kymco_a1_less_than_one_year",
          message:
            "The Kymco SkyTown 125 requires category A1 to have been held for at least 1 year. Category A2 or A is also accepted.",
          reasons: ["Category A1 held for less than 1 year for Kymco SkyTown"],
          retakeSides: [],
        };
      }

      return licenceRetake(
        "The A1 start date could not be confirmed. Please retake the licence side showing the category dates.",
        ["Category A1 valid-from date could not be confirmed"],
        ["dlBack"],
      );
    }

    if (motorcycleCategories.length > 0) {
      return {
        outcome: "rejected",
        messageKey: "category_not_yet_valid",
        message:
          "The detected motorcycle licence category is expired or not yet valid for the Kymco SkyTown 125.",
        reasons: ["Motorcycle category is expired or not yet valid"],
        retakeSides: [],
      };
    }

    return {
      outcome: "rejected",
      messageKey: "kymco_motorcycle_category_required",
      message:
        "The Kymco SkyTown 125 requires a valid motorcycle licence: A1 held for at least 1 year, A2, or A. Category B is not accepted for this scooter.",
      reasons: ["Kymco SkyTown requires A1 held for 1 year, A2, or A"],
      retakeSides: [],
    };
  }

  const validMotorcycle = motorcycleCategories.find(categoryCurrentlyValid);
  if (validMotorcycle) return acceptedDecision();

  const bCategories = classes.filter((item) => item.normalized === "B");
  const validBClass = bCategories.find(categoryCurrentlyValid);

  if (validBClass) {
    const bHeld = categoryHeldForYears(
      validBClass,
      extraction.licence.issueDate,
      3,
    );

    if (bHeld === true) return acceptedDecision();

    if (heldForYears(validBClass.validFrom, 3) === false) {
      return {
        outcome: "rejected",
        messageKey: "b_less_than_three_years",
        message:
          "A category B driving licence must have been held for at least 3 years to ride a 125cc scooter in Spain.",
        reasons: ["Category B held for less than 3 years"],
        retakeSides: [],
      };
    }

    return licenceRetake(
      "The category B start date could not be confirmed. Please retake the licence side showing the category dates.",
      ["Category B valid-from date could not be confirmed"],
      ["dlBack"],
    );
  }

  const hasAm = classes.some(
    (item) => item.normalized === "AM" && categoryCurrentlyValid(item),
  );
  const hasPotentiallyCompatible =
    motorcycleCategories.length > 0 || bCategories.length > 0;

  if (hasAm && !hasPotentiallyCompatible) {
    return {
      outcome: "rejected",
      messageKey: "no_compatible_category",
      message:
        "Category AM is only valid for mopeds up to 50cc. NEXA Rentals only provides 125cc scooters.",
      reasons: ["AM licence is not valid for a 125cc scooter"],
      retakeSides: [],
    };
  }

  if (hasPotentiallyCompatible) {
    return {
      outcome: "rejected",
      messageKey: "category_not_yet_valid",
      message:
        "The detected driving licence category is not currently valid for a 125cc scooter.",
      reasons: ["Compatible category is expired or not yet valid"],
      retakeSides: [],
    };
  }

  return {
    outcome: "rejected",
    messageKey: "no_compatible_category",
    message:
      "A valid A, A1, A2, or category B licence held for at least 3 years is required for a 125cc scooter.",
    reasons: ["No compatible driving licence category detected"],
    retakeSides: [],
  };
}

async function toImageInput(
  file: File,
  key: StepKey,
  label: string,
): Promise<ImageInput> {
  const mimeType = cleanText(file.type).toLowerCase();

  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
    throw new ApiError(`${label} must be a JPEG, PNG, WEBP, or GIF image.`, 400);
  }

  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    throw new ApiError(`${label} must be smaller than 8 MB.`, 400);
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  return {
    key,
    label,
    item: {
      type: "input_image",
      image_url: `data:${mimeType};base64,${base64}`,
      detail: "high",
    },
  };
}

function basePrompt(identityType: IdentityType) {
  return `You are the visual document-reading engine for NEXA Rentals in Spain.

Your job is to READ real customer photographs of driving licences and identity documents. These are often ordinary phone photos, not studio scans.

IMPORTANT OPERATING PRINCIPLE
Be tolerant of photography, but strict about the actual licence facts.
A real document photographed in a hand, on a table, at a slight angle, with mild blur, mild perspective distortion, small reflections, shadows, or background objects can still be readable. Do not request a retake merely because the image is not perfect. Use both licence sides together and inspect the high-detail images carefully.

Never invent text, dates, numbers or categories that cannot be recovered from the images.

The customer selected identity type: ${identityType}.

DRIVING LICENCE — PRIMARY TASK
1. Confirm the supplied licence images genuinely show a driving licence.
2. Read the front and back jointly.
3. Extract the holder name, licence number when readable, date of birth, country, general issue date, general expiry date when present, and every visible driving category with its own valid-from/valid-until dates.
4. Recognize modern and older European licence layouts. Do not assume every country or old licence uses the same field positions.
5. Recognize common multilingual labels and numbered EU fields. Use the document layout and visible content, not only English words.
6. Inspect the category table carefully, especially A, A1, A2, AM and B.
7. Return clearly readable dates as YYYY-MM-DD.

OLD / PERMANENT LICENCES
- A general expiry date may be missing, blank, shown as a dash, "permanent", "unlimited", "lifetime", or simply not printed on an older licence.
- In those cases return dateOfExpiry as an empty string.
- Missing general expiry alone is NOT a quality failure and must NOT cause a retake.
- If a category-specific valid-from date is printed, extract it.
- If an older licence clearly shows category B but does not print a separate B valid-from date, leave that category validFrom empty and still extract the clearly visible general licence issueDate. The server will apply a conservative eligibility fallback.
- Do not copy a general issue date into a category validFrom field unless the document itself clearly identifies it as that category's date.

READABILITY
Set licence.documentDetected=true when the photos genuinely contain a driving licence.
Set licence.readable=true when the licence is sufficiently readable to identify the holder and determine the visible driving categories, even if some optional fields or a few characters of the document number are difficult to read.
Do NOT require photographic perfection.

Use quality.overall="retake" only when a required fact for the rental decision genuinely cannot be recovered, for example:
- no driving licence is present;
- wrong/duplicate licence sides prevent reading the needed information;
- holder identity cannot be read;
- the category table cannot be read well enough to determine the relevant category;
- severe blur, glare, darkness, finger coverage, or cropping hides the required facts.

Use quality.overall="uncertain" only for secondary ambiguity that does not necessarily block the rental decision. Do not mark the whole document unreadable just because one optional field is uncertain.

FRONT/BACK
The images are labelled. Use the labels as context but visually verify the content. If a side is genuinely wrong or duplicated and this blocks reading, request only the affected side in quality.retakeSides.

IDENTITY DOCUMENT
The identity document is required and must genuinely be present and readable enough to identify the document holder.
- passport: idFront must be the readable photo/details page;
- ID card: idFront and idBack must genuinely show the two sides of an ID card;
- missing general identity expiry is not automatically an error for formats that do not display one;
- nameMatch is informational and a name mismatch alone must not decide scooter eligibility.

SECURITY
A calculator, bank card, phone screen, random card, blank paper, unrelated document, or object is not a driving licence or identity document. Never invent data to make an unrelated image pass.

Return only the structured fields required by the schema.`;
}

function recoveryPrompt(identityType: IdentityType, first: AiExtraction) {
  const firstIssues = first.quality.issues.slice(0, 8).join("; ");

  return `${basePrompt(identityType)}

SECOND-PASS RECOVERY
A first visual pass could not confidently finish the decision. Re-examine every original image from scratch at high detail.

First-pass issues: ${firstIssues || "unspecified readability issue"}.

Before asking for a retake:
- zoom attention onto the licence holder fields and the back category table;
- use both sides together;
- account for perspective and a document being held in a hand;
- distinguish mild blur from truly unreadable text;
- recognize older EU/national licence layouts;
- recover category letters and dates when they are actually visible;
- do not penalize a missing general expiry date on an old/permanent licence;
- do not require the licence number to be perfect if the licence is clearly genuine-looking as a document and the holder/category information needed for eligibility is readable.

Still never guess a category or date that is not visually recoverable. If a required eligibility fact truly cannot be recovered, request the smallest specific retake side.`;
}

async function callOpenAi(
  apiKey: string,
  prompt: string,
  images: ImageInput[],
) {
  const content: any[] = [{ type: "input_text", text: prompt }];

  for (const image of images) {
    content.push({ type: "input_text", text: image.label });
    content.push(image.item);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "nexa_document_screening",
            strict: true,
            schema: DOCUMENT_SCHEMA,
          },
        },
        max_output_tokens: 2600,
      }),
      signal: controller.signal,
    });
  } catch (caught: any) {
    if (caught?.name === "AbortError") {
      throw new ApiError("Document analysis timed out. Please try again.", 504);
    }
    throw caught;
  } finally {
    clearTimeout(timeout);
  }

  const requestId = response.headers.get("x-request-id");
  const responseText = await response.text();
  let raw: any = {};

  if (responseText) {
    try {
      raw = JSON.parse(responseText);
    } catch {
      throw new ApiError(
        "The document analysis service returned an invalid response.",
        502,
      );
    }
  }

  if (!response.ok) {
    console.error("OPENAI DOCUMENT ANALYSIS ERROR", {
      status: response.status,
      requestId,
      errorType: cleanText(raw?.error?.type),
      errorCode: cleanText(raw?.error?.code),
    });

    throw new ApiError(
      "The document analysis service is temporarily unavailable.",
      502,
    );
  }

  const refusal = getRefusalText(raw);
  if (refusal) {
    console.error("OPENAI DOCUMENT ANALYSIS REFUSAL", { requestId });
    throw new ApiError(
      "The document photographs could not be analyzed automatically.",
      422,
    );
  }

  if (raw?.status === "incomplete") {
    console.error("OPENAI DOCUMENT ANALYSIS INCOMPLETE", {
      requestId,
      reason: cleanText(raw?.incomplete_details?.reason),
    });
    throw new ApiError("Document analysis was incomplete. Please try again.", 502);
  }

  const outputText = getOutputText(raw);
  if (!outputText) {
    throw new ApiError("OpenAI returned no document result.", 502);
  }

  try {
    return JSON.parse(outputText) as AiExtraction;
  } catch {
    console.error("OPENAI DOCUMENT JSON PARSE ERROR", { requestId });
    throw new ApiError("The document result could not be read.", 502);
  }
}

function extractionScore(extraction: AiExtraction) {
  const classes = extraction.licence.vehicleClasses.filter((item) =>
    Boolean(normalCategory(item.category)),
  );

  let score = 0;
  if (extraction.licence.documentDetected) score += 5;
  if (extraction.licence.readable) score += 5;
  if (cleanText(extraction.licence.fullName)) score += 3;
  if (cleanText(extraction.licence.firstName)) score += 1;
  if (cleanText(extraction.licence.lastName)) score += 1;
  if (cleanText(extraction.licence.documentNumber)) score += 1;
  if (cleanText(extraction.licence.issueDate)) score += 2;
  if (cleanText(extraction.licence.dateOfExpiry)) score += 1;
  score += Math.min(8, classes.length * 2);
  score += Math.min(
    6,
    classes.filter((item) => cleanText(item.validFrom)).length * 2,
  );
  if (extraction.identity.documentDetected) score += 2;
  if (extraction.identity.readable) score += 2;
  if (extraction.quality.overall === "good") score += 2;
  return score;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ApiError("OPENAI_API_KEY is missing in Vercel.", 500);
    }

    const form = await req.formData();
    const sessionToken = cleanText(form.get("sessionToken"));
    const identityType = cleanText(form.get("identityType")) as IdentityType;

    if (!sessionToken) {
      throw new ApiError("Missing sessionToken.", 400);
    }

    if (identityType !== "id" && identityType !== "passport") {
      throw new ApiError("Invalid identityType.", 400);
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from(TABLE)
      .select("session_token,booking_id,status,expires_at")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (sessionError) {
      throw new Error(`Could not validate session: ${sessionError.message}`);
    }

    if (!session) {
      throw new ApiError("Verification session not found.", 404);
    }

    const expiresAt = new Date(session.expires_at).getTime();
    if (!Number.isFinite(expiresAt)) {
      throw new Error("Verification session has an invalid expiry date.");
    }

    if (expiresAt <= Date.now()) {
      throw new ApiError("Verification session expired.", 410);
    }

    if (session.status !== "scanning") {
      throw new ApiError("Verification session is not active.", 409);
    }

    const kymcoSkyTown = isKymcoSkyTownBooking(session.booking_id);

    const required: Array<[StepKey, string]> = [
      ["dlFront", "DRIVING LICENCE FRONT"],
      ["dlBack", "DRIVING LICENCE BACK"],
      [
        "idFront",
        identityType === "passport"
          ? "PASSPORT PHOTO PAGE"
          : "IDENTITY CARD FRONT",
      ],
    ];

    if (identityType === "id") {
      required.push(["idBack", "IDENTITY CARD BACK"]);
    }

    const files: Array<{ key: StepKey; label: string; file: File }> = [];

    for (const [key, label] of required) {
      const value = form.get(key);
      if (!isFile(value)) {
        throw new ApiError(`${label} is missing.`, 400);
      }
      files.push({ key, label, file: value });
    }

    const totalBytes = files.reduce((sum, item) => sum + item.file.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new ApiError("The document images are too large.", 400);
    }

    const images = await Promise.all(
      files.map((item) => toImageInput(item.file, item.key, item.label)),
    );

    const firstExtraction = await callOpenAi(
      apiKey,
      basePrompt(identityType),
      images,
    );
    const firstDecision = decide(firstExtraction, kymcoSkyTown, identityType);

    let extraction = firstExtraction;
    let decision = firstDecision;

    // A second high-detail reading is used only when the first pass requests a
    // retake. This reduces false negatives without creating a fail-open path.
    if (firstDecision.outcome === "retake") {
      const secondExtraction = await callOpenAi(
        apiKey,
        recoveryPrompt(identityType, firstExtraction),
        images,
      );
      const secondDecision = decide(secondExtraction, kymcoSkyTown, identityType);

      if (
        secondDecision.outcome !== "retake" ||
        extractionScore(secondExtraction) >= extractionScore(firstExtraction)
      ) {
        extraction = secondExtraction;
        decision = secondDecision;
      }
    }

    return NextResponse.json({
      success: true,
      ...decision,
      licenceData: extraction.licence,
      identityData: extraction.identity,
      analysis: extraction,
    });
  } catch (error: any) {
    // Do not log document images, extracted personal data, request bodies or API keys.
    console.error("DOCUMENT ANALYSIS ERROR", {
      name: cleanText(error?.name),
      status: error instanceof ApiError ? error.status : 500,
      message: cleanText(error?.message).slice(0, 300),
    });

    const status = error instanceof ApiError ? error.status : 500;

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Could not analyze documents.",
      },
      { status },
    );
  }
}
