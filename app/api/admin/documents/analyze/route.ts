
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL =
  process.env.OPENAI_DOCUMENT_MODEL?.trim() || "gpt-4.1-mini";

const OPENAI_TIMEOUT_MS = 45_000;

const TEMP_BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;
const STORAGE_CONCURRENCY = 4;

type DocumentKind =
  | "passport"
  | "identity"
  | "driving_licence"
  | "other"
  | "unknown";

type DocumentSide =
  | "front"
  | "back"
  | "photo_page"
  | "unknown";

type Autofill = {
  nombreCliente: string;
  dniPasaporte: string;
  direccion: string;
  permisoConducir: string;
  paisExpedicion: string;
  fechaCaducidad: string;
};

type AiDocument = {
  kind: DocumentKind;
  side: DocumentSide;
  originalName: string;
};

type AiResult = {
  autofill: Autofill;
  documents: AiDocument[];
  warnings: string[];
};

type PreparedDocument = {
  file: File;
  buffer: Buffer;
  mimeType: string;
  storedName: string;
  tempPath: string;
};

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function elapsed(start: number): number {
  return Math.round(performance.now() - start);
}

function randomId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function extension(name: string): string {
  return name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
}

function cleanFileName(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[<>:"/\\|?*]+/g, "-")
      .replace(/[^\w.\- ]+/g, "")
      .replace(/\s+/g, "_")
      .replace(/^[-_. ]+|[-_. ]+$/g, "")
      .slice(0, 120) || "document"
  );
}

function mimeTypeOf(file: File): string {
  const ext = extension(file.name);

  const byExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    pdf: "application/pdf",
  };

  return (
    byExtension[ext] ||
    cleanText(file.type).toLowerCase() ||
    "application/octet-stream"
  );
}

function validateFiles(files: File[]) {
  if (!files.length) {
    throw new ApiError("No customer documents were uploaded.", 400);
  }

  if (files.length > MAX_FILES) {
    throw new ApiError("Too many documents.", 400);
  }

  let total = 0;

  for (const file of files) {
    const mime = mimeTypeOf(file);

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/pdf",
      ].includes(mime)
    ) {
      throw new ApiError(
        `Unsupported document format: ${file.name}`,
        400,
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      throw new ApiError(
        `Invalid document size: ${file.name}`,
        400,
      );
    }

    total += file.size;
  }

  if (total > MAX_TOTAL_BYTES) {
    throw new ApiError(
      "Documents exceed the 80 MB total limit.",
      400,
    );
  }
}

function schema() {
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
              enum: [
                "front",
                "back",
                "photo_page",
                "unknown",
              ],
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

function buildPrompt(names: string[], vehicleCode: string) {
  return `You extract customer identity information for NEXA Rentals in Spain.

Read ALL supplied documents together. They belong to one rental customer unless clearly inconsistent.

FILES:
${names.map((name, i) => `${i + 1}. ${name}`).join("\n")}

Vehicle: ${vehicleCode || "not selected"}

Return these six fields:
- nombreCliente: full legal name from passport or identity document.
- dniPasaporte: passport or national identity document number, NOT the driving licence number.
- direccion: residential address ONLY when actually printed.
- permisoConducir: driving licence document number.
- paisExpedicion: country issuing the driving licence, as a readable country name.
- fechaCaducidad: driving licence expiry date YYYY-MM-DD. Use the licence document expiry, not the birth date or issue date. If a valid permanent licence has no printed expiry, return empty.

For each file, classify:
kind: passport, identity, driving_licence, other, unknown.
side: front, back, photo_page, unknown.
Include the exact originalName.

Rules:
- Combine front and back images.
- Read ordinary phone photographs despite minor perspective or reflections.
- Never invent names, addresses, dates, or document numbers.
- Never confuse the passport/ID number with the driving licence number.
- If a field cannot be read confidently, return an empty string.
- Use warnings for unreadable fields, conflicting identities, or mixed PDFs.
- Do not determine driving eligibility.
- Keep warnings short.
- Return only structured JSON.`;
}

function outputText(data: any): string {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  const parts: string[] = [];

  for (const item of data?.output || []) {
    if (item?.type !== "message") continue;

    for (const part of item?.content || []) {
      if (
        part?.type === "output_text" &&
        typeof part.text === "string"
      ) {
        parts.push(part.text);
      }
    }
  }

  return parts.join("");
}

async function ensureBucket() {
  const { data, error } =
    await supabaseAdmin.storage.getBucket(TEMP_BUCKET);

  if (data?.id) return;

  const message = cleanText(error?.message).toLowerCase();

  if (
    error &&
    !message.includes("not found") &&
    !message.includes("does not exist") &&
    !message.includes("404")
  ) {
    throw new Error("Temporary document storage is unavailable.");
  }

  const { error: createError } =
    await supabaseAdmin.storage.createBucket(TEMP_BUCKET, {
      public: false,
      fileSizeLimit: MAX_FILE_BYTES,
    });

  if (createError) {
    const reason = createError.message.toLowerCase();

    if (
      !reason.includes("already exists") &&
      !reason.includes("duplicate")
    ) {
      throw new Error("Could not initialize document storage.");
    }
  }
}

async function prepareFiles(
  files: File[],
  sessionId: string,
): Promise<PreparedDocument[]> {
  return Promise.all(
    files.map(async (file, index) => {
      const storedName =
        `${String(index + 1).padStart(2, "0")}_` +
        cleanFileName(file.name);

      return {
        file,
        buffer: Buffer.from(await file.arrayBuffer()),
        mimeType: mimeTypeOf(file),
        storedName,
        tempPath: `${sessionId}/${storedName}`,
      };
    }),
  );
}

async function saveDocuments(
  prepared: PreparedDocument[],
): Promise<void> {
  const failures: string[] = [];

  for (
    let start = 0;
    start < prepared.length;
    start += STORAGE_CONCURRENCY
  ) {
    const batch = prepared.slice(
      start,
      start + STORAGE_CONCURRENCY,
    );

    const results = await Promise.allSettled(
      batch.map(async (item) => {
        const { error } = await supabaseAdmin.storage
          .from(TEMP_BUCKET)
          .upload(item.tempPath, item.buffer, {
            contentType: item.mimeType,
            upsert: false,
            cacheControl: "3600",
          });

        if (error) throw new Error(error.message);
      }),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        failures.push("storage_upload_failed");
      }
    }

    if (failures.length) break;
  }

  if (failures.length) {
    throw new ApiError(
      "Could not save all customer documents.",
      502,
    );
  }
}

async function uploadOpenAiFile(
  apiKey: string,
  item: PreparedDocument,
): Promise<string> {
  const body = new FormData();

  body.append("purpose", "user_data");
  body.append("file", item.file, item.file.name);

  const response = await fetch(
    "https://api.openai.com/v1/files",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body,
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    },
  );

  const raw = await response.json().catch(() => null);

  if (!response.ok || !raw?.id) {
    console.error("NEXA OPENAI FILE ERROR", {
      status: response.status,
      code: cleanText(raw?.error?.code),
    });

    throw new ApiError(
      "Could not prepare document for AI analysis.",
      502,
    );
  }

  return cleanText(raw.id);
}

async function deleteOpenAiFile(
  apiKey: string,
  id: string,
) {
  try {
    await fetch(
      `https://api.openai.com/v1/files/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    console.warn("NEXA OPENAI FILE CLEANUP WARNING");
  }
}

async function analyzeWithAi(
  apiKey: string,
  prepared: PreparedDocument[],
  vehicleCode: string,
): Promise<AiResult> {
  const started = performance.now();

  const uploadedIds: string[] = [];

  try {
    const fileInputs = await Promise.allSettled(
      prepared.map(async (item) => {
        if (
          ["image/jpeg", "image/png", "image/webp"].includes(
            item.mimeType,
          )
        ) {
          return {
            type: "input_image",
            image_url:
              `data:${item.mimeType};base64,` +
              item.buffer.toString("base64"),
            detail: "high",
          };
        }

        const id = await uploadOpenAiFile(apiKey, item);

        uploadedIds.push(id);

        return {
          type: "input_file",
          file_id: id,
        };
      }),
    );

    const content: any[] = [
      {
        type: "input_text",
        text: buildPrompt(
          prepared.map((item) => item.file.name),
          vehicleCode,
        ),
      },
    ];

    for (let i = 0; i < fileInputs.length; i++) {
      const result = fileInputs[i];

      if (result.status === "rejected") {
        throw result.reason;
      }

      content.push({
        type: "input_text",
        text: `FILE: ${prepared[i].file.name}`,
      });

      content.push(result.value);
    }

    const requestStarted = performance.now();

    let response: Response;

    try {
      response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: MODEL,
            store: false,
            input: [
              {
                role: "user",
                content,
              },
            ],
            text: {
              format: {
                type: "json_schema",
                name: "nexa_admin_document_extraction",
                strict: true,
                schema: schema(),
              },
            },
            max_output_tokens: 1600,
          }),
          signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
        },
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.name === "TimeoutError")
      ) {
        throw new ApiError(
          "Document AI analysis timed out.",
          504,
        );
      }

      throw error;
    }

    const raw = await response.json().catch(() => null);

    console.info("NEXA OPENAI TIMING", {
      model: MODEL,
      fileCount: prepared.length,
      requestMs: elapsed(requestStarted),
      totalAiMs: elapsed(started),
      status: response.status,
    });

    if (!response.ok) {
      console.error("NEXA OPENAI RESPONSE ERROR", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        code: cleanText(raw?.error?.code),
        type: cleanText(raw?.error?.type),
      });

      throw new ApiError(
        "The document analysis service is unavailable.",
        502,
      );
    }

    if (raw?.status === "incomplete") {
      throw new ApiError(
        "AI analysis was incomplete.",
        502,
      );
    }

    const hasRefusal = (raw?.output || []).some(
      (item: any) =>
        (item?.content || []).some(
          (part: any) => part?.type === "refusal",
        ),
    );

    if (hasRefusal) {
      throw new ApiError(
        "The customer documents could not be analyzed.",
        422,
      );
    }

    const text = outputText(raw);

    if (!text) {
      throw new ApiError(
        "AI returned an empty document result.",
        502,
      );
    }

    let parsed: AiResult;

    try {
      parsed = JSON.parse(text) as AiResult;
    } catch {
      throw new ApiError(
        "AI returned an invalid document result.",
        502,
      );
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.autofill ||
      !Array.isArray(parsed.documents)
    ) {
      throw new ApiError(
        "AI returned incomplete document data.",
        502,
      );
    }

    return parsed;
  } finally {
    // Do not delay the successful scan while waiting
    // for nonessential OpenAI temporary-file deletion.
    if (uploadedIds.length) {
      void Promise.allSettled(
        uploadedIds.map((id) =>
          deleteOpenAiFile(apiKey, id),
        ),
      );
    }
  }
}

function normalizeAutofill(
  value: Partial<Autofill> | undefined,
): Autofill {
  return {
    nombreCliente: cleanText(value?.nombreCliente),
    dniPasaporte: cleanText(value?.dniPasaporte),
    direccion: cleanText(value?.direccion),
    permisoConducir: cleanText(value?.permisoConducir),
    paisExpedicion: cleanText(value?.paisExpedicion),
    fechaCaducidad: cleanText(value?.fechaCaducidad),
  };
}

function classificationFor(
  ai: AiResult,
  name: string,
  index: number,
): AiDocument | null {
  const exact = ai.documents.find(
    (item) =>
      cleanText(item.originalName).toLowerCase() ===
      name.toLowerCase(),
  );

  return exact || ai.documents[index] || null;
}

async function cleanupStorage(paths: string[]) {
  if (!paths.length) return;

  try {
    const { error } = await supabaseAdmin.storage
      .from(TEMP_BUCKET)
      .remove(paths);

    if (error) {
      console.warn("NEXA DOCUMENT STORAGE CLEANUP WARNING");
    }
  } catch {
    console.warn("NEXA DOCUMENT STORAGE CLEANUP WARNING");
  }
}

export async function POST(request: Request) {
  const started = performance.now();

  let pathsToCleanup: string[] = [];
  let shouldCleanup = false;

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new ApiError("OPENAI_API_KEY is missing.", 500);
    }

    const form = await request.formData();

    const contractNumber = cleanText(
      form.get("contractNumber"),
    );

    const vehicleCode = cleanText(
      form.get("vehicleCode"),
    );

    const documents = form
      .getAll("documents")
      .filter((value): value is File => value instanceof File);

    validateFiles(documents);

    const sessionId = randomId(
      contractNumber
        ? `nexa_${contractNumber.replace(
            /[^a-zA-Z0-9_-]/g,
            "_",
          )}`
        : "nexa_documents",
    );

    const prepareStarted = performance.now();

    const prepared = await prepareFiles(
      documents,
      sessionId,
    );

    const prepareMs = elapsed(prepareStarted);

    pathsToCleanup = prepared.map((item) => item.tempPath);
    shouldCleanup = true;

    // Start AI and document storage independently.
    // Neither operation needs to wait for the other.
    const storageStarted = performance.now();
    const aiStarted = performance.now();

    const [storageResult, aiResult] =
      await Promise.allSettled([
        (async () => {
          await ensureBucket();
          await saveDocuments(prepared);
        })(),
        analyzeWithAi(apiKey, prepared, vehicleCode),
      ]);

    const parallelMs = elapsed(storageStarted);

    if (storageResult.status === "rejected") {
      throw storageResult.reason;
    }

    if (aiResult.status === "rejected") {
      throw aiResult.reason;
    }

    const ai = aiResult.value;

    const files = prepared.map((item, index) => {
      const classification = classificationFor(
        ai,
        item.file.name,
        index,
      );

      return {
        id: randomId("file"),
        originalName: item.file.name,
        storedName: item.storedName,
        mimeType: item.mimeType,
        size: item.file.size,
        kind: classification?.kind || "unknown",
        side: classification?.side || "unknown",
        tempPath: item.tempPath,
      };
    });

    // Keep stored documents for Google Drive generation.
    shouldCleanup = false;

    console.info("NEXA DOCUMENT ANALYZE TIMING", {
      model: MODEL,
      fileCount: documents.length,
      totalBytes: documents.reduce(
        (sum, file) => sum + file.size,
        0,
      ),
      prepareMs,
      parallelMs,
      totalMs: elapsed(started),
    });

    return NextResponse.json({
      ok: true,
      success: true,
      sessionId,
      contractNumber: contractNumber || null,
      vehicleCode: vehicleCode || null,
      files,
      autofill: normalizeAutofill(ai.autofill),
      warnings: Array.isArray(ai.warnings)
        ? ai.warnings.map(cleanText).filter(Boolean)
        : [],
      analyzedAt: new Date().toISOString(),
      tempBucket: TEMP_BUCKET,
    });
  } catch (error) {
    if (shouldCleanup) {
      await cleanupStorage(pathsToCleanup);
    }

    const status =
      error instanceof ApiError ? error.status : 500;

    console.error("NEXA DOCUMENT ANALYSIS ERROR", {
      status,
      name:
        error instanceof Error ? error.name : "Unknown",
      elapsedMs: elapsed(started),
    });

    return NextResponse.json(
      {
        ok: false,
        success: false,
        error:
          error instanceof ApiError
            ? error.message
            : "Could not analyze customer documents.",
      },
      { status },
    );
  }
}
