
const MODEL =
  process.env.OPENAI_DOCUMENT_MODEL?.trim() || "gpt-4.1-mini";

const BUCKET =
  process.env.NEXA_DOCUMENT_TEMP_BUCKET?.trim() ||
  "nexa-customer-documents-temp";

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;
const AI_TIMEOUT_MS = 45000;

type Kind =
  | "passport"
  | "identity"
  | "driving_licence"
  | "other"
  | "unknown";

type Side = "front" | "back" | "photo_page" | "unknown";

type Autofill = {
  nombreCliente: string;
  dniPasaporte: string;
  direccion: string;
  permisoConducir: string;
  paisExpedicion: string;
  fechaCaducidad: string;
};

type StoredDocument = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  tempPath: string;
};

type DocumentInput = StoredDocument & {
  buffer: Buffer;
};

type AiResult = {
  autofill: Autofill;
  documents: Array<{
    originalName: string;
    kind: Kind;
    side: Side;
  }>;
  warnings: string[];
};

class DocumentError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
    this.name = "DocumentError";
  }
}

const text = (value: unknown) => String(value ?? "").trim();

const ms = (start: number) =>
  Math.round(performance.now() - start);

function validate(documents: StoredDocument[]) {
  if (!documents.length || documents.length > MAX_FILES) {
    throw new DocumentError("Invalid document count.", 400);
  }

  let total = 0;

  for (const document of documents) {
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/pdf",
      ].includes(document.mimeType)
    ) {
      throw new DocumentError(
        "Unsupported document format.",
        400,
      );
    }

    if (
      !Number.isSafeInteger(document.size) ||
      document.size <= 0 ||
      document.size > MAX_FILE_BYTES
    ) {
      throw new DocumentError("Invalid document size.", 400);
    }

    total += document.size;
  }

  if (total > MAX_TOTAL_BYTES) {
    throw new DocumentError("Documents exceed 80 MB.", 400);
  }
}

const outputSchema = {
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
          originalName: { type: "string" },
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
        },
        required: ["originalName", "kind", "side"],
      },
    },
    warnings: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["autofill", "documents", "warnings"],
} as const;

function prompt(documents: DocumentInput[]) {
  return `Extract customer document information for NEXA Rentals.

FILES:
${documents.map((d, i) => `${i + 1}. ${d.originalName}`).join("\n")}

Return:
nombreCliente: full legal name from ID or passport.
dniPasaporte: ID or passport number, NOT licence number.
direccion: residential address only if printed.
permisoConducir: driving licence document number.
paisExpedicion: driving licence issuing country.
fechaCaducidad: driving licence expiry date YYYY-MM-DD.

Classify each supplied file with its exact originalName, kind and side.

Combine front and back images.
Never invent missing values.
Do not confuse issue date, birth date and expiry date.
Do not confuse ID number with licence number.
For uncertain fields, use an empty string.
Flag unreadable documents or conflicting identities.
Return structured JSON only.`;
}

function responseText(raw: any): string {
  if (typeof raw?.output_text === "string") {
    return raw.output_text;
  }

  return (raw?.output || [])
    .flatMap((item: any) => item?.content || [])
    .filter((part: any) => part?.type === "output_text")
    .map((part: any) => text(part.text))
    .join("");
}

async function uploadAiFile(
  apiKey: string,
  document: DocumentInput,
) {
  const form = new FormData();

  form.set("purpose", "user_data");

  form.set(
    "file",
    new File(
      [new Uint8Array(document.buffer)],
      document.originalName,
      { type: document.mimeType },
    ),
  );

  const response = await fetch(
    "https://api.openai.com/v1/files",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.id) {
    throw new DocumentError(
      "AI file preparation failed.",
      502,
    );
  }

  return text(result.id);
}

async function analyzeAi(
  documents: DocumentInput[],
): Promise<AiResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new DocumentError(
      "OPENAI_API_KEY is missing.",
      500,
    );
  }

  const started = performance.now();
  const uploadedIds: string[] = [];

  try {
    const inputs = await Promise.all(
      documents.map(async (document) => {
        if (
          ["image/jpeg", "image/png", "image/webp"].includes(
            document.mimeType,
          )
        ) {
          return {
            type: "input_image",
            image_url:
              `data:${document.mimeType};base64,` +
              document.buffer.toString("base64"),
            detail: "high",
          };
        }

        const id = await uploadAiFile(apiKey, document);
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
        text: prompt(documents),
      },
    ];

    inputs.forEach((input, index) => {
      content.push({
        type: "input_text",
        text: `FILE ${index + 1}: ${documents[index].originalName}`,
      });

      content.push(input);
    });

    const requestStarted = performance.now();

    const response = await fetch(
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
              name: "nexa_document_extraction",
              strict: true,
              schema: outputSchema,
            },
          },
          max_output_tokens: 1600,
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      },
    );

    const raw = await response.json().catch(() => null);

    console.info("NEXA OPENAI TIMING", {
      model: MODEL,
      requestMs: ms(requestStarted),
      totalAiMs: ms(started),
      status: response.status,
      requestId: response.headers.get("x-request-id"),
    });

    if (!response.ok) {
      console.error("NEXA OPENAI ERROR", {
        status: response.status,
        code: text(raw?.error?.code),
        message: text(raw?.error?.message).slice(0, 300),
      });

      throw new DocumentError(
        "AI analysis failed.",
        502,
      );
    }

    if (raw?.status === "incomplete") {
      throw new DocumentError(
        "AI analysis incomplete.",
        502,
      );
    }

    const resultText = responseText(raw);

    if (!resultText) {
      throw new DocumentError(
        "AI returned no document data.",
        502,
      );
    }

    let parsed: AiResult;

    try {
      parsed = JSON.parse(resultText) as AiResult;
    } catch {
      throw new DocumentError(
        "Invalid AI document response.",
        502,
      );
    }

    if (
      !parsed?.autofill ||
      !Array.isArray(parsed.documents) ||
      !Array.isArray(parsed.warnings)
    ) {
      throw new DocumentError(
        "Incomplete AI document response.",
        502,
      );
    }

    return parsed;
  } finally {
    // Remove temporary files uploaded to OpenAI.
    await Promise.allSettled(
      uploadedIds.map(async (id) => {
        await fetch(
          `https://api.openai.com/v1/files/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            signal: AbortSignal.timeout(1500),
          },
        );
      }),
    );
  }
}

function createBundle(
  documents: DocumentInput[],
  result: AiResult,
  sessionId: string,
) {
  return {
    sessionId,
    files: documents.map((document, index) => {
      const classification =
        result.documents.find(
          (item) =>
            item.originalName.toLowerCase() ===
            document.originalName.toLowerCase(),
        ) || result.documents[index];

      return {
        id: document.id,
        originalName: document.originalName,
        storedName: document.storedName,
        mimeType: document.mimeType,
        size: document.size,
        tempPath: document.tempPath,
        kind: classification?.kind || "unknown",
        side: classification?.side || "unknown",
      };
    }),
    autofill: {
      nombreCliente: text(result.autofill.nombreCliente),
      dniPasaporte: text(result.autofill.dniPasaporte),
      direccion: text(result.autofill.direccion),
      permisoConducir: text(result.autofill.permisoConducir),
      paisExpedicion: text(result.autofill.paisExpedicion),
      fechaCaducidad: text(result.autofill.fechaCaducidad),
    },
    warnings: result.warnings.map(text).filter(Boolean),
    analyzedAt: new Date().toISOString(),
    tempBucket: BUCKET,
  };
}

/**
 * Analyze documents already uploaded by the QR workflow.
 *
 * Called by:
 * app/api/admin/documents/mobile-session/process/route.ts
 *
 * Does not upload documents to Supabase again.
 * Does not delete QR document files.
 * Does not modify website licence verification.
 */
export async function analyzeExistingDocuments(
  documents: DocumentInput[],
  sessionId: string,
) {
  const started = performance.now();

  validate(documents);

  for (const document of documents) {
    if (document.buffer.length !== document.size) {
      throw new DocumentError(
        "Document size mismatch.",
        400,
      );
    }

    if (!document.tempPath.startsWith("mobile-sessions/")) {
      throw new DocumentError(
        "Invalid QR document path.",
        400,
      );
    }
  }

  const result = await analyzeAi(documents);

  const bundle = createBundle(
    documents,
    result,
    sessionId,
  );

  console.info("NEXA QR ANALYZE TIMING", {
    fileCount: documents.length,
    totalMs: ms(started),
    duplicateStorageUploads: 0,
  });

  return bundle;
}
