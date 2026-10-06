import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.OPENAI_DOCUMENT_MODEL?.trim() || "gpt-5.6";
const OPENAI_TIMEOUT_MS = 75_000;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() || "nexa-customer-documents-temp";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;

type DocumentKind =
  | "passport"
  | "identity"
  | "driving_licence"
  | "other"
  | "unknown";

type DocumentSide = "front" | "back" | "photo_page" | "unknown";

type StoredDocument = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  kind: DocumentKind;
  side: DocumentSide;
  tempPath: string;
};

type Autofill = {
  nombreCliente: string;
  dniPasaporte: string;
  direccion: string;
  permisoConducir: string;
  paisExpedicion: string;
  fechaCaducidad: string;
};

type AiDocumentResult = {
  kind: DocumentKind;
  side: DocumentSide;
  originalName: string;
};

type AiResult = {
  autofill: Autofill;
  documents: AiDocumentResult[];
  warnings: string[];
};

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function cleanFileName(value: string) {
  const cleaned = cleanText(value || "document")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[-_.\s]+|[-_.\s]+$/g, "")
    .slice(0, 120);

  return cleaned || "document";
}

function extensionFromName(name: string) {
  const match = cleanText(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "";
}

function normalizedMimeType(file: File) {
  const type = cleanText(file.type).toLowerCase();

  if (type) return type;

  const ext = extensionFromName(file.name);

  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  if (ext === "heif") return "image/heif";
  if (ext === "pdf") return "application/pdf";

  return "application/octet-stream";
}

function isAllowedFile(file: File) {
  const mimeType = normalizedMimeType(file);
  const ext = extensionFromName(file.name);

  return (
    [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "application/pdf",
    ].includes(mimeType) ||
    ["jpg", "jpeg", "png", "webp", "heic", "heif", "pdf"].includes(ext)
  );
}

function randomId(prefix = "doc") {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return `${prefix}_${cryptoObject.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
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

function documentAnalysisSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      autofill: {
        type: "object",
        additionalProperties: false,
        properties: {
          nombreCliente: { type: "string" },
          dniPasaporte: { type: "string" },
          direccion: { type: "string" },
          permisoConducir: { type: "string" },
          paisExpedicion: { type: "string" },
          fechaCaducidad: { type: "string" },
        },
        required: [
          "nombreCliente",
          "dniPasaporte",
          "direccion",
          "permisoConducir",
          "paisExpedicion",
          "fechaCaducidad",
        ],
      },
      documents: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            kind: {
              type: "string",
              enum: [
                "passport",
                "identity",
                "driving_licence",
                "other",
                "unknown",
              ],
            },
            side: {
              type: "string",
              enum: ["front", "back", "photo_page", "unknown"],
            },
            originalName: { type: "string" },
          },
          required: ["kind", "side", "originalName"],
        },
      },
      warnings: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["autofill", "documents", "warnings"],
  } as const;
}

function buildPrompt(fileNames: string[], vehicleCode: string) {
  return `You are the document-reading engine for NEXA Rentals, a scooter-rental company in Spain.

Read all customer documents supplied in this request. They may include:
- passport photo/details pages;
- national identity cards;
- driving licences;
- front and back images;
- PDFs containing one or several document pages;
- unrelated supporting documents.

The files belong to ONE rental customer unless the documents clearly show otherwise.

FILES IN THIS REQUEST:
${fileNames.map((name, index) => `${index + 1}. ${name}`).join("\n")}

SELECTED VEHICLE CODE:
${vehicleCode || "not selected yet"}

PRIMARY GOAL:
Extract reliable customer data that can be proposed for the NEXA admin rental-contract form.

Map the values as follows:
- nombreCliente: the customer's full legal name. Prefer the identity/passport name when clear. Use readable natural spacing and capitalization.
- dniPasaporte: passport number or national ID/document number. Prefer passport/identity number, NOT the driving-licence number.
- direccion: residential address only if it is actually printed on one of the supplied documents. Never invent it.
- permisoConducir: driving-licence document number.
- paisExpedicion: country that issued the driving licence. Return a readable country name where possible.
- fechaCaducidad: driving-licence expiry date as YYYY-MM-DD. If a clearly valid old/permanent licence has no expiry printed, return an empty string.

CLASSIFICATION:
For every uploaded file, classify the primary document represented by that file:
- passport
- identity
- driving_licence
- other
- unknown

Also classify the visible side:
- front
- back
- photo_page
- unknown

When a PDF contains multiple different pages/documents, classify it according to the most important rental document it contains. Mention mixed/multiple contents in warnings.

READING RULES:
- Use all files together. Front/back pairs can complement one another.
- Ordinary phone photographs are acceptable: perspective, hands, background, mild reflections or mild blur do not automatically make a document unreadable.
- Never guess text, numbers, dates, countries or addresses.
- Do not copy a driving-licence number into dniPasaporte.
- Do not copy an identity/passport number into permisoConducir.
- Do not invent an address when none is printed.
- Do not reject the customer or make the rental eligibility decision here. This endpoint is for extraction/classification only.
- If two documents disagree materially about the person's name or document data, choose the most authoritative/clear value and add a concise warning.
- If a requested form field cannot be recovered confidently, return an empty string.
- Return dates as YYYY-MM-DD.
- Keep warnings concise and operational for the rental-desk admin.

Return only the structured JSON required by the schema.`;
}

async function ensureTempBucket() {
  const { data: bucket, error: bucketError } =
    await supabaseAdmin.storage.getBucket(TEMP_BUCKET);

  if (bucket?.id) return;

  if (bucketError) {
    const message = cleanText(bucketError.message).toLowerCase();

    // Only create the bucket when it truly does not exist.
    if (
      !message.includes("not found") &&
      !message.includes("does not exist") &&
      !message.includes("404")
    ) {
      throw new Error(
        `Could not inspect temporary document bucket: ${bucketError.message}`,
      );
    }
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(
    TEMP_BUCKET,
    {
      public: false,
      fileSizeLimit: MAX_FILE_BYTES,
    },
  );

  if (createError) {
    const message = cleanText(createError.message).toLowerCase();

    // Another request may have created it between getBucket and createBucket.
    if (
      !message.includes("already exists") &&
      !message.includes("duplicate")
    ) {
      throw new Error(
        `Could not create temporary document bucket: ${createError.message}`,
      );
    }
  }
}

async function saveTemporaryFile({
  sessionId,
  file,
  index,
}: {
  sessionId: string;
  file: File;
  index: number;
}) {
  const mimeType = normalizedMimeType(file);
  const safeOriginalName = cleanFileName(file.name);
  const storedName = `${String(index + 1).padStart(2, "0")}_${safeOriginalName}`;
  const tempPath = `${sessionId}/${storedName}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(TEMP_BUCKET)
    .upload(tempPath, buffer, {
      contentType: mimeType,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(
      `Could not save temporary document "${file.name}": ${error.message}`,
    );
  }

  return {
    buffer,
    mimeType,
    storedName,
    tempPath,
  };
}

async function uploadPdfToOpenAi({
  apiKey,
  file,
}: {
  apiKey: string;
  file: File;
}) {
  const body = new FormData();
  body.append("purpose", "user_data");
  body.append("file", file, file.name);

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  const text = await response.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiError("OpenAI returned an invalid file-upload response.", 502);
  }

  if (!response.ok || !data?.id) {
    console.error("OPENAI ADMIN DOCUMENT FILE UPLOAD ERROR", {
      status: response.status,
      errorType: cleanText(data?.error?.type),
      errorCode: cleanText(data?.error?.code),
    });

    throw new ApiError(
      "The document analysis service could not prepare the PDF.",
      502,
    );
  }

  return cleanText(data.id);
}

async function deleteOpenAiFile(apiKey: string, fileId: string) {
  if (!fileId) return;

  try {
    await fetch(`https://api.openai.com/v1/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch (error) {
    console.warn("OPENAI TEMP FILE CLEANUP WARNING", {
      message: error instanceof Error ? error.message : "Unknown cleanup error",
    });
  }
}

async function callOpenAi({
  apiKey,
  prompt,
  preparedFiles,
}: {
  apiKey: string;
  prompt: string;
  preparedFiles: Array<{
    file: File;
    mimeType: string;
    buffer: Buffer;
  }>;
}) {
  const content: any[] = [{ type: "input_text", text: prompt }];
  const uploadedOpenAiFileIds: string[] = [];

  try {
    for (const prepared of preparedFiles) {
      const nameLabel = `FILE: ${prepared.file.name}`;
      content.push({ type: "input_text", text: nameLabel });

      if (
        ["image/jpeg", "image/png", "image/webp"].includes(prepared.mimeType)
      ) {
        content.push({
          type: "input_image",
          image_url: `data:${prepared.mimeType};base64,${prepared.buffer.toString(
            "base64",
          )}`,
          detail: "high",
        });

        continue;
      }

      // PDFs are intentionally sent as file inputs so multi-page customer PDFs
      // can be read as documents. HEIC/HEIF files also use the file-input path,
      // which avoids forcing a client-side conversion in the rental desk UI.
      const fileId = await uploadPdfToOpenAi({
        apiKey,
        file: prepared.file,
      });

      uploadedOpenAiFileIds.push(fileId);

      content.push({
        type: "input_file",
        file_id: fileId,
      });
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
              name: "nexa_admin_document_extraction",
              strict: true,
              schema: documentAnalysisSchema(),
            },
          },
          max_output_tokens: 3200,
        }),
        signal: controller.signal,
      });
    } catch (caught: any) {
      if (caught?.name === "AbortError") {
        throw new ApiError(
          "Document analysis timed out. Please try again.",
          504,
        );
      }

      throw caught;
    } finally {
      clearTimeout(timeout);
    }

    const requestId = response.headers.get("x-request-id");
    const responseText = await response.text();

    let raw: any = {};

    try {
      raw = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new ApiError(
        "The document analysis service returned an invalid response.",
        502,
      );
    }

    if (!response.ok) {
      console.error("OPENAI ADMIN DOCUMENT ANALYSIS ERROR", {
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
      console.error("OPENAI ADMIN DOCUMENT ANALYSIS REFUSAL", {
        requestId,
      });

      throw new ApiError(
        "The customer documents could not be analyzed automatically.",
        422,
      );
    }

    if (raw?.status === "incomplete") {
      console.error("OPENAI ADMIN DOCUMENT ANALYSIS INCOMPLETE", {
        requestId,
        reason: cleanText(raw?.incomplete_details?.reason),
      });

      throw new ApiError(
        "Document analysis was incomplete. Please try again.",
        502,
      );
    }

    const outputText = getOutputText(raw);

    if (!outputText) {
      throw new ApiError("OpenAI returned no document result.", 502);
    }

    try {
      return JSON.parse(outputText) as AiResult;
    } catch {
      console.error("OPENAI ADMIN DOCUMENT JSON PARSE ERROR", {
        requestId,
      });

      throw new ApiError("The document result could not be read.", 502);
    }
  } finally {
    await Promise.all(
      uploadedOpenAiFileIds.map((fileId) => deleteOpenAiFile(apiKey, fileId)),
    );
  }
}

function findAiClassification(
  ai: AiResult,
  originalName: string,
  index: number,
) {
  const exact = ai.documents.find(
    (item) =>
      cleanText(item.originalName).toLowerCase() ===
      cleanText(originalName).toLowerCase(),
  );

  return exact || ai.documents[index] || null;
}

function normalizeAutofill(value: AiResult["autofill"] | undefined): Autofill {
  return {
    nombreCliente: cleanText(value?.nombreCliente),
    dniPasaporte: cleanText(value?.dniPasaporte),
    direccion: cleanText(value?.direccion),
    permisoConducir: cleanText(value?.permisoConducir),
    paisExpedicion: cleanText(value?.paisExpedicion),
    fechaCaducidad: cleanText(value?.fechaCaducidad),
  };
}

export async function POST(request: Request) {
  const tempPathsCreated: string[] = [];

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new ApiError("OPENAI_API_KEY is missing in Vercel.", 500);
    }

    const form = await request.formData();

    const contractNumber = cleanText(form.get("contractNumber"));
    const vehicleCode = cleanText(form.get("vehicleCode"));

    const rawDocuments = form.getAll("documents");
    const documents = rawDocuments.filter(
      (value): value is File => value instanceof File,
    );

    if (!documents.length) {
      throw new ApiError("No customer documents were uploaded.", 400);
    }

    if (documents.length > MAX_FILES) {
      throw new ApiError(
        `Too many files. Maximum ${MAX_FILES} documents per analysis.`,
        400,
      );
    }

    let totalBytes = 0;

    for (const file of documents) {
      if (!isAllowedFile(file)) {
        throw new ApiError(
          `Unsupported file "${file.name}". Use JPG, PNG, WEBP, HEIC/HEIF or PDF.`,
          400,
        );
      }

      if (file.size <= 0) {
        throw new ApiError(`File "${file.name}" is empty.`, 400);
      }

      if (file.size > MAX_FILE_BYTES) {
        throw new ApiError(
          `File "${file.name}" is larger than 15 MB.`,
          400,
        );
      }

      totalBytes += file.size;
    }

    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new ApiError(
        "The selected customer documents are too large in total. Upload fewer files at once.",
        400,
      );
    }

    const sessionId = randomId(
      contractNumber
        ? `nexa_${contractNumber.replace(/[^a-zA-Z0-9_-]/g, "_")}`
        : "nexa_documents",
    );

    await ensureTempBucket();

    const preparedFiles: Array<{
      file: File;
      mimeType: string;
      buffer: Buffer;
      storedName: string;
      tempPath: string;
    }> = [];

    for (const [index, file] of documents.entries()) {
      const stored = await saveTemporaryFile({
        sessionId,
        file,
        index,
      });

      tempPathsCreated.push(stored.tempPath);

      preparedFiles.push({
        file,
        mimeType: stored.mimeType,
        buffer: stored.buffer,
        storedName: stored.storedName,
        tempPath: stored.tempPath,
      });
    }

    let aiResult: AiResult;

    try {
      aiResult = await callOpenAi({
        apiKey,
        prompt: buildPrompt(
          documents.map((file) => file.name),
          vehicleCode,
        ),
        preparedFiles,
      });
    } catch (error) {
      // Keep temporary files available only when analysis succeeded.
      // Failed analysis should not leave sensitive documents sitting in temp storage.
      if (tempPathsCreated.length) {
        await supabaseAdmin.storage
          .from(TEMP_BUCKET)
          .remove(tempPathsCreated)
          .catch(() => null);
      }

      throw error;
    }

    const files: StoredDocument[] = preparedFiles.map((prepared, index) => {
      const classification = findAiClassification(
        aiResult,
        prepared.file.name,
        index,
      );

      return {
        id: randomId("file"),
        originalName: prepared.file.name,
        storedName: prepared.storedName,
        mimeType: prepared.mimeType,
        size: prepared.file.size,
        kind: classification?.kind || "unknown",
        side: classification?.side || "unknown",
        tempPath: prepared.tempPath,
      };
    });

    return NextResponse.json({
      ok: true,
      success: true,
      sessionId,
      contractNumber: contractNumber || null,
      vehicleCode: vehicleCode || null,
      files,
      autofill: normalizeAutofill(aiResult.autofill),
      warnings: Array.isArray(aiResult.warnings)
        ? aiResult.warnings.map(cleanText).filter(Boolean)
        : [],
      analyzedAt: new Date().toISOString(),
      tempBucket: TEMP_BUCKET,
    });
  } catch (error: any) {
    // Never log uploaded document contents, extracted identity data, API keys,
    // base64 image data or request bodies.
    console.error("ADMIN DOCUMENT ANALYSIS ERROR", {
      name: cleanText(error?.name),
      status: error instanceof ApiError ? error.status : 500,
      message: cleanText(error?.message).slice(0, 350),
    });

    const status = error instanceof ApiError ? error.status : 500;

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error:
          error?.message ||
          "Could not analyze the customer documents.",
      },
      { status },
    );
  }
}
