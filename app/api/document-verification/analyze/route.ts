import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLE = "document_verification_sessions";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_TOTAL_BYTES = 28 * 1024 * 1024;
const MODEL = process.env.OPENAI_DOCUMENT_MODEL?.trim() || "gpt-4o";

type IdentityType = "id" | "passport";
type StepKey = "dlFront" | "dlBack" | "idFront" | "idBack";
type Outcome = "accepted" | "retake" | "manual_review" | "rejected";
type DecisionKey =
  | "retake"
  | "licence_expired"
  | "b_less_than_three_years"
  | "kymco_a1_less_than_one_year"
  | "kymco_motorcycle_category_required"
  | "no_compatible_category"
  | "category_not_yet_valid"
  | "manual_review"
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
    if (item?.type !== "message") {
      continue;
    }

    for (const content of item?.content || []) {
      if (
        content?.type === "output_text" &&
        typeof content.text === "string"
      ) {
        parts.push(content.text);
      }
    }
  }

  return parts.join("");
}

function getRefusalText(data: any) {
  const refusals: string[] = [];

  for (const item of data?.output || []) {
    if (item?.type !== "message") {
      continue;
    }

    for (const content of item?.content || []) {
      if (
        content?.type === "refusal" &&
        typeof content.refusal === "string"
      ) {
        refusals.push(content.refusal);
      }
    }
  }

  return refusals.join(" ");
}

function parseIsoDate(value: string) {
  const match = cleanText(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

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

  if (!from) {
    return null;
  }

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

/*
 * The session route builds booking IDs as:
 * bk_<fleetGroup>_<timestamp>_<random>
 *
 * This keeps the Kymco rule limited to Kymco/SkyTown sessions and avoids
 * changing the eligibility rules for Piaggio, Symphony or other scooters.
 */
function isKymcoSkyTownBooking(bookingId: string) {
  const normalized = cleanText(bookingId)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return normalized.includes("kymco") || normalized.includes("skytown");
}

function isCurrentlyValid(item: VehicleClass & { normalized: string }) {
  return !isPast(item.validUntil) && !isFuture(item.validFrom);
}

function acceptedMotorcycleDecision(extraction: AiExtraction): Decision {
  const manualReasons: string[] = [];

  if (extraction.quality.overall === "uncertain") {
    manualReasons.push(
      ...(extraction.quality.issues.length > 0
        ? extraction.quality.issues
        : ["Driving licence reading needs manual confirmation"]),
    );
  }

  if (isFuture(extraction.licence.issueDate)) {
    manualReasons.push(
      "The detected driving licence issue date needs manual confirmation",
    );
  }

  if (manualReasons.length > 0) {
    return {
      outcome: "manual_review",
      messageKey: "manual_review",
      message:
        "Documents received. NEXA Rentals will confirm the driving licence manually before pickup.",
      reasons: [...new Set(manualReasons)],
      retakeSides: [],
    };
  }

  return {
    outcome: "accepted",
    messageKey: "accepted",
    message: "Driving licence accepted.",
    reasons: [],
    retakeSides: [],
  };
}

function decide(extraction: AiExtraction, kymcoSkyTown: boolean): Decision {
  const licenceRetakeSides = extraction.quality.retakeSides.filter(
    (side): side is StepKey => side === "dlFront" || side === "dlBack",
  );

  const licenceCannotBeRead =
    !extraction.licence.documentDetected || !extraction.licence.readable;
  const licencePhotoNeedsRetake =
    extraction.quality.overall === "retake" &&
    licenceRetakeSides.length > 0;
  const missingLicenceIdentity =
    !cleanText(extraction.licence.fullName) &&
    !(
      cleanText(extraction.licence.firstName) &&
      cleanText(extraction.licence.lastName)
    );
  const missingLicenceNumber = !cleanText(
    extraction.licence.documentNumber,
  );
  const wrongDocumentType = !/driv|licen[cs]e|permiso/i.test(
    cleanText(extraction.licence.documentType),
  );

  if (
    licenceCannotBeRead ||
    licencePhotoNeedsRetake ||
    missingLicenceIdentity ||
    missingLicenceNumber ||
    wrongDocumentType
  ) {
    let fallbackMessage = "The driving licence could not be read clearly.";

    if (wrongDocumentType) {
      fallbackMessage =
        "The photographs do not appear to show a driving licence.";
    } else if (missingLicenceIdentity || missingLicenceNumber) {
      fallbackMessage =
        "The licence holder details or licence number could not be read clearly.";
    }

    const reasons =
      extraction.quality.issues.length > 0
        ? extraction.quality.issues
        : [fallbackMessage];

    return {
      outcome: "retake",
      messageKey: "retake",
      message: reasons[0] || fallbackMessage,
      reasons,
      retakeSides:
        licenceRetakeSides.length > 0
          ? licenceRetakeSides
          : ["dlFront", "dlBack"],
    };
  }

  if (isPast(extraction.licence.dateOfExpiry)) {
    return {
      outcome: "rejected",
      messageKey: "licence_expired",
      message: "The driving licence appears to be expired.",
      reasons: ["Driving licence expired"],
      retakeSides: [],
    };
  }

  const classes = extraction.licence.vehicleClasses
    .map((item) => ({
      ...item,
      normalized: normalCategory(item.category),
    }))
    .filter((item) => Boolean(item.normalized));

  /* No detected categories must cause a retake, never a manual review. */
  if (classes.length === 0) {
    return {
      outcome: "retake",
      messageKey: "retake",
      message:
        "The driving-licence category table could not be read. Please retake the back of the licence in sharp focus.",
      reasons: ["Driving-licence categories were not detected"],
      retakeSides: ["dlBack"],
    };
  }

  const motorcycleCategories = classes.filter((item) =>
    ["A", "A1", "A2"].includes(item.normalized),
  );

  if (kymcoSkyTown) {
    /* A and A2 are accepted for the Kymco without an extra holding period. */
    const validHigherMotorcycle = motorcycleCategories.find(
      (item) =>
        ["A", "A2"].includes(item.normalized) && isCurrentlyValid(item),
    );

    if (validHigherMotorcycle) {
      return acceptedMotorcycleDecision(extraction);
    }

    /* A1 is accepted only after it has been held for at least one year. */
    const validA1 = motorcycleCategories.find(
      (item) => item.normalized === "A1" && isCurrentlyValid(item),
    );

    if (validA1) {
      const a1HeldForOneYear = heldForYears(validA1.validFrom, 1);

      if (a1HeldForOneYear === false) {
        return {
          outcome: "rejected",
          messageKey: "kymco_a1_less_than_one_year",
          message:
            "The Kymco SkyTown 125 requires category A1 to have been held for at least 1 year. Category A2 or A is also accepted.",
          reasons: ["Category A1 held for less than 1 year for Kymco SkyTown"],
          retakeSides: [],
        };
      }

      if (a1HeldForOneYear === null) {
        return {
          outcome: "manual_review",
          messageKey: "manual_review",
          message:
            "Documents received. NEXA Rentals will confirm the category A1 start date manually before pickup.",
          reasons: ["Category A1 valid-from date could not be read confidently"],
          retakeSides: [],
        };
      }

      return acceptedMotorcycleDecision(extraction);
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

    /* Category B and AM are never sufficient for the Kymco SkyTown 125. */
    return {
      outcome: "rejected",
      messageKey: "kymco_motorcycle_category_required",
      message:
        "The Kymco SkyTown 125 requires a valid motorcycle licence: A1 held for at least 1 year, A2, or A. Category B is not accepted for this scooter.",
      reasons: ["Kymco SkyTown requires A1 held for 1 year, A2, or A"],
      retakeSides: [],
    };
  }

  const validMotorcycle = motorcycleCategories.find(isCurrentlyValid);

  if (validMotorcycle) {
    return acceptedMotorcycleDecision(extraction);
  }

  const bCategories = classes.filter((item) => item.normalized === "B");
  const validBClass = bCategories.find(isCurrentlyValid);

  if (validBClass) {
    const bHeld = heldForYears(validBClass.validFrom, 3);

    if (bHeld === false) {
      return {
        outcome: "rejected",
        messageKey: "b_less_than_three_years",
        message:
          "A category B driving licence must have been held for at least 3 years to ride a 125cc scooter in Spain.",
        reasons: ["Category B held for less than 3 years"],
        retakeSides: [],
      };
    }

    if (bHeld === null) {
      return {
        outcome: "manual_review",
        messageKey: "manual_review",
        message:
          "Documents received. NEXA Rentals will confirm the category B start date manually before pickup.",
        reasons: ["Category B valid-from date could not be read confidently"],
        retakeSides: [],
      };
    }

    if (extraction.quality.overall === "uncertain") {
      return {
        outcome: "manual_review",
        messageKey: "manual_review",
        message:
          "Documents received. NEXA Rentals will confirm the driving licence manually before pickup.",
        reasons:
          extraction.quality.issues.length > 0
            ? [...new Set(extraction.quality.issues)]
            : ["Driving licence reading needs manual confirmation"],
        retakeSides: [],
      };
    }

    return {
      outcome: "accepted",
      messageKey: "accepted",
      message: "Driving licence accepted.",
      reasons: [],
      retakeSides: [],
    };
  }

  const hasAm = classes.some(
    (item) => item.normalized === "AM" && !isPast(item.validUntil),
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

async function toImageInput(file: File, label: string) {
  const mimeType = cleanText(file.type).toLowerCase();

  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mimeType)) {
    throw new ApiError(`${label} must be a JPEG, PNG, WEBP, or GIF image.`, 400);
  }

  if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
    throw new ApiError(`${label} must be smaller than 8 MB.`, 400);
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  return {
    label,
    item: {
      type: "input_image" as const,
      image_url: `data:${mimeType};base64,${base64}`,
      detail: "high" as const,
    },
  };
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
      files.map((item) => toImageInput(item.file, item.label)),
    );

    const prompt = `You read rental documents for NEXA Rentals in Spain.

The customer selected this identity-document option: ${identityType}.

PRIMARY TASK — DRIVING LICENCE

Read the driving-licence front and back carefully.

Extract:
- the licence holder's first name, last name and full name;
- the licence number;
- the licence document type;
- the date of birth;
- the general issue date when visible;
- the general expiry date when visible;
- every visible driving category;
- each category's own valid-from date;
- each category's own valid-until date.

Small text and the driving-category table are extremely important. Inspect the high-detail images carefully.

Read only information visibly present in the photographs. Never invent missing characters, numbers, categories or dates.

Return clearly readable dates as YYYY-MM-DD.

DOCUMENT CLASSIFICATION IS MANDATORY

Before extracting information, inspect the images labelled DRIVING LICENCE FRONT and DRIVING LICENCE BACK and determine whether they genuinely show the front and back of a driving licence.

A calculator, telephone, computer screen, payment card, bank card, handwritten paper, pen, blank surface, random object, unrelated document, or other non-licence image is not a driving licence.

Do not classify an object as a driving licence merely because:
- it is rectangular;
- it contains some text;
- it contains numbers;
- it contains a photograph;
- it resembles a plastic card;
- the supplied image label says driving licence.

The visible document itself must contain recognizable driving-licence structure and information.

The image labelled DRIVING LICENCE FRONT must show the front of the licence and must contain readable licence-holder information.

The image labelled DRIVING LICENCE BACK must show the back of the licence and its driving-category table.

If the images show:
- unrelated objects;
- unrelated documents;
- the same side twice;
- reversed front and back sides;
- a missing side;
- an unreadable category table;
- a screen displaying unrelated content;
- a licence too blurred, dark, cropped or reflective to read;

then:
- set licence.documentDetected to false when no driving licence is present;
- set licence.readable to false;
- set quality.overall to "retake";
- add the affected dlFront and/or dlBack value to quality.retakeSides;
- explain the specific problem in quality.issues;
- leave unreadable fields as empty strings;
- never invent information to satisfy the response schema.

Set licence.documentDetected to true only when the photographs genuinely appear to contain a driving licence.

Set licence.readable to true only when all of the following can be read sufficiently:
- the holder name;
- the driving-licence number;
- the relevant driving-category table.

Set licence.documentType to a visible description such as "driving licence" only when the image actually contains a driving licence. Do not repeat the supplied label as the document type without visually confirming it.

A calculator, random card or other object must never receive:
- licence.documentDetected=true;
- licence.readable=true;
- quality.overall="good";
- an accepted or uncertain result based on invented document information.

FRONT AND BACK VALIDATION

The front and back must be different and must correspond to their supplied labels.

If dlFront contains the licence back:
- use quality.overall "retake";
- include "dlFront" in quality.retakeSides.

If dlBack contains the licence front:
- use quality.overall "retake";
- include "dlBack" in quality.retakeSides.

If the same side appears twice:
- use quality.overall "retake";
- request a retake of the incorrectly labelled side.

If the back category table cannot be read:
- use quality.overall "retake";
- include "dlBack" in quality.retakeSides.

Do not use quality.overall "uncertain" for:
- an unrelated object;
- an unrelated document;
- a missing licence;
- missing licence-holder identity;
- a missing licence number;
- duplicate sides;
- reversed sides;
- an unreadable category table.

Use "uncertain" only when it is definitely a readable driving licence and only a secondary detail needs human confirmation.

DATE AND CATEGORY RULES

If a general expiry date is missing, permanent, lifetime, shown with a dash, or not printed on the licence, return an empty string. A missing general expiry date alone is not an error and must not cause a retake.

Do not use the general card issue date as category B's valid-from date.

Category B's valid-from date must come specifically from the driving-category table.

Extract each visible category separately, including A, A1, A2, AM and B when present.

Do not judge whether the driving licence is genuine or authentic. Only classify the visible document, evaluate readability and extract visible information.

QUALITY RULES

quality.overall and quality.retakeSides must be based only on whether the DRIVING LICENCE is the correct document and can be read well enough to identify:
- the licence holder;
- the licence number;
- the categories;
- the category validity dates.

Use quality.overall "retake" when:
- the driving licence is absent;
- the image contains an unrelated object or document;
- the wrong side is shown;
- the same side is shown twice;
- the holder name cannot be read;
- the licence number cannot be read;
- the category table cannot be read;
- required licence information is hidden by severe blur, glare, darkness or cropping.

Do not demand a perfect photograph.

Normal perspective, slight hand movement, minor reflections and slightly cropped decorative edges are acceptable only when all required licence details remain readable.

When a retake is necessary, include only "dlFront" and/or "dlBack" in quality.retakeSides.

IDENTITY DOCUMENT

The ID card or passport is collected only to prepare the rental contract.

Extract clearly visible identity details, but:
- never use identity-document quality to reject the booking;
- never request an identity-document retake;
- never add idFront or idBack to quality.retakeSides;
- never require the identity document to have an expiry date;
- never compare its name or document number with the driving licence;
- never use an identity mismatch in quality.overall;
- never use a different selected identity type to reject the booking.

Set identity.selectedType to "${identityType}".

For compatibility, always return nameMatch as "uncertain".`;

    const content: any[] = [{ type: "input_text", text: prompt }];

    for (const image of images) {
      content.push({ type: "input_text", text: image.label });
      content.push(image.item);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    let openaiResponse: Response;

    try {
      openaiResponse = await fetch("https://api.openai.com/v1/responses", {
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
          max_output_tokens: 2200,
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

    const responseText = await openaiResponse.text();
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

    if (!openaiResponse.ok) {
      console.error("OPENAI DOCUMENT ANALYSIS ERROR:", raw);
      throw new ApiError(
        "The document analysis service is temporarily unavailable.",
        502,
      );
    }

    const refusal = getRefusalText(raw);

    if (refusal) {
      console.error("OPENAI DOCUMENT ANALYSIS REFUSAL:", refusal);
      throw new ApiError(
        "The document photographs could not be analyzed automatically.",
        422,
      );
    }

    if (raw?.status === "incomplete") {
      console.error(
        "OPENAI DOCUMENT ANALYSIS INCOMPLETE:",
        raw?.incomplete_details,
      );
      throw new ApiError("Document analysis was incomplete. Please try again.", 502);
    }

    const outputText = getOutputText(raw);

    if (!outputText) {
      throw new ApiError("OpenAI returned no document result.", 502);
    }

    let extraction: AiExtraction;

    try {
      extraction = JSON.parse(outputText) as AiExtraction;
    } catch {
      console.error("OPENAI DOCUMENT JSON PARSE ERROR:", outputText);
      throw new ApiError("The document result could not be read.", 502);
    }

    const decision = decide(extraction, kymcoSkyTown);

    return NextResponse.json({
      success: true,
      ...decision,
      licenceData: extraction.licence,
      identityData: extraction.identity,
      analysis: extraction,
    });
  } catch (error: any) {
    console.error("DOCUMENT ANALYSIS ERROR:", error);

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