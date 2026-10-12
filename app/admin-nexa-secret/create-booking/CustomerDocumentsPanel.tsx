
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CustomerDocumentAutofill = {
  nombreCliente?: string;
  dniPasaporte?: string;
  direccion?: string;
  permisoConducir?: string;
  paisExpedicion?: string;
  fechaCaducidad?: string;
};

export type CustomerDocumentFile = {
  id: string;
  originalName: string;
  storedName?: string;
  mimeType: string;
  size: number;
  kind?: "passport" | "identity" | "driving_licence" | "other" | "unknown";
  side?: "front" | "back" | "photo_page" | "unknown";
  tempPath?: string;
};

export type CustomerDocumentBundle = {
  sessionId: string;
  files: CustomerDocumentFile[];
  autofill?: CustomerDocumentAutofill;
  analyzedAt?: string;
  warnings?: string[];
};

type LocalFileItem = {
  key: string;
  file: File;
  previewUrl?: string;
};

type AnalyzeResponse = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  sessionId?: string;
  files?: CustomerDocumentFile[];
  autofill?: CustomerDocumentAutofill;
  warnings?: string[];
  analyzedAt?: string;
};

type MobileStatus =
  | "waiting"
  | "uploading"
  | "processing"
  | "ready"
  | "expired";

type MobileSessionResponse = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  sessionToken?: string;
  mobileUrl?: string;
};

type MobileStatusResponse = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  status?: MobileStatus;
  uploadedCount?: number;
  bundle?: CustomerDocumentBundle | null;
};

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;

const POLL_INTERVAL_MS = 1000;
const MAX_AUTO_RETRIES = 2;
const RETRY_DELAYS_MS = [3000, 6000];

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "pdf",
]);

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayValue(value?: string) {
  return String(value || "").trim() || "No detectado";
}

function countFields(values?: CustomerDocumentAutofill) {
  return Object.values(values || {}).filter((value) =>
    Boolean(String(value || "").trim()),
  ).length;
}

function getError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function validBundle(
  value: CustomerDocumentBundle | null | undefined,
): value is CustomerDocumentBundle {
  return Boolean(
    value &&
      typeof value.sessionId === "string" &&
      value.sessionId.length > 0 &&
      Array.isArray(value.files),
  );
}

function isRetryableError(status: number) {
  if (status === 401 || status === 403 || status === 404) {
    return false;
  }

  if (status === 410 || status === 422) {
    return false;
  }

  return true;
}

export default function CustomerDocumentsPanel({
  contractNumber,
  vehicleCode,
  onAutofill,
  onBundleChange,
}: {
  contractNumber: string;
  vehicleCode: string;
  onAutofill: (values: CustomerDocumentAutofill) => void;
  onBundleChange: (bundle: CustomerDocumentBundle | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onAutofillRef = useRef(onAutofill);
  const onBundleChangeRef = useRef(onBundleChange);

  const mountedRef = useRef(true);
  const activeTokenRef = useRef("");

  const processingRef = useRef(false);
  const processingAttemptedRef = useRef(false);
  const processingFinishedRef = useRef(false);

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mobileResultRef = useRef("");
  const mobileReadyRef = useRef(false);

  const [items, setItems] = useState<LocalFileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [bundle, setBundle] = useState<CustomerDocumentBundle | null>(
    null,
  );

  const [sessionToken, setSessionToken] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");

  const [mobileStatus, setMobileStatus] =
    useState<MobileStatus>("waiting");

  const [mobileUploadedCount, setMobileUploadedCount] = useState(0);
  const [mobileSessionError, setMobileSessionError] = useState("");

  const [isCreatingSession, setIsCreatingSession] = useState(true);
  const [isMobileProcessing, setIsMobileProcessing] = useState(false);

  const [retryCount, setRetryCount] = useState(0);
  const [scanStartedAt, setScanStartedAt] = useState<number | null>(
    null,
  );
  const [scanDurationMs, setScanDurationMs] = useState<number | null>(
    null,
  );

  const totalBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  useEffect(() => {
    onAutofillRef.current = onAutofill;
    onBundleChangeRef.current = onBundleChange;
  }, [onAutofill, onBundleChange]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const resetProcessing = useCallback(() => {
    clearRetryTimer();

    processingRef.current = false;
    processingAttemptedRef.current = false;
    processingFinishedRef.current = false;

    retryCountRef.current = 0;
    mobileReadyRef.current = false;
    mobileResultRef.current = "";

    setRetryCount(0);
    setIsMobileProcessing(false);
    setScanStartedAt(null);
    setScanDurationMs(null);
  }, [clearRetryTimer]);

  const acceptCompletedBundle = useCallback(
    (nextBundle: CustomerDocumentBundle, token: string) => {
      if (!mountedRef.current || activeTokenRef.current !== token) {
        return;
      }

      if (!validBundle(nextBundle)) return;

      if (mobileResultRef.current === nextBundle.sessionId) {
        return;
      }

      clearRetryTimer();

      mobileResultRef.current = nextBundle.sessionId;
      mobileReadyRef.current = true;
      processingFinishedRef.current = true;
      processingAttemptedRef.current = true;

      setMobileStatus("ready");
      setIsMobileProcessing(false);
      setMobileSessionError("");
      setBundle(nextBundle);

      onBundleChangeRef.current(nextBundle);

      const detected = countFields(nextBundle.autofill);

      if (detected > 0 && nextBundle.autofill) {
        onAutofillRef.current(nextBundle.autofill);

        setStatus(
          `IA terminada. ${detected} campos aplicados automáticamente. Revisa los datos.`,
        );
      } else {
        setStatus(
          "Documentos recibidos, pero no se pudieron detectar datos del cliente.",
        );
      }

      setScanDurationMs((current) => {
        if (current !== null) return current;

        const started = scanStartedAtRef.current;

        return started === null
          ? null
          : Math.round(performance.now() - started);
      });
    },
    [clearRetryTimer],
  );

  const scanStartedAtRef = useRef<number | null>(null);

  const readMobileStatus = useCallback(
    async (
      token: string,
      signal?: AbortSignal,
    ): Promise<MobileStatusResponse | null> => {
      const response = await fetch(
        `/api/admin/documents/mobile-session/status?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal,
        },
      );

      const data = (await response.json().catch(
        () => null,
      )) as MobileStatusResponse | null;

      if (!response.ok || !data?.ok) {
        return null;
      }

      return data;
    },
    [],
  );

  const applyMobileStatus = useCallback(
    (data: MobileStatusResponse, token: string) => {
      if (!mountedRef.current || activeTokenRef.current !== token) {
        return;
      }

      if (data.status) {
        setMobileStatus(data.status);
      }

      if (typeof data.uploadedCount === "number") {
        setMobileUploadedCount(data.uploadedCount);
      }

      if (validBundle(data.bundle)) {
        acceptCompletedBundle(data.bundle, token);
        return;
      }

      if (data.status === "expired") {
        clearRetryTimer();

        setMobileSessionError(
          "La sesión QR ha caducado. Abre de nuevo el formulario para generar otro QR.",
        );
      }
    },
    [acceptCompletedBundle, clearRetryTimer],
  );

  // Create one stable QR session for this booking panel.
  useEffect(() => {
    mountedRef.current = true;

    const controller = new AbortController();

    async function createSession() {
      setIsCreatingSession(true);
      setMobileSessionError("");

      try {
        const response = await fetch(
          "/api/admin/documents/mobile-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            cache: "no-store",
            body: JSON.stringify({
              contractNumber,
              vehicleCode,
            }),
            signal: controller.signal,
          },
        );

        const data = (await response.json().catch(
          () => null,
        )) as MobileSessionResponse | null;

        if (
          !response.ok ||
          (!data?.ok && !data?.success) ||
          !data.sessionToken ||
          !data.mobileUrl
        ) {
          throw new Error(
            data?.error ||
              `No se pudo crear la sesión QR (${response.status}).`,
          );
        }

        if (!mountedRef.current || controller.signal.aborted) {
          return;
        }

        resetProcessing();

        activeTokenRef.current = data.sessionToken;

        setSessionToken(data.sessionToken);
        setMobileUrl(data.mobileUrl);
        setMobileStatus("waiting");
        setMobileUploadedCount(0);
      } catch (caught) {
        if (
          !controller.signal.aborted &&
          mountedRef.current
        ) {
          setMobileSessionError(
            getError(caught, "No se pudo crear la sesión QR."),
          );
        }
      } finally {
        if (
          !controller.signal.aborted &&
          mountedRef.current
        ) {
          setIsCreatingSession(false);
        }
      }
    }

    void createSession();

    return () => {
      mountedRef.current = false;
      controller.abort();
      clearRetryTimer();
    };

    // Keep the QR session stable while booking fields change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processMobileDocumentsRef = useRef<
    (token: string) => Promise<void>
  >(async () => {});

  const processMobileDocuments = useCallback(
    async (token: string) => {
      if (
        !token ||
        activeTokenRef.current !== token ||
        processingRef.current ||
        processingAttemptedRef.current ||
        mobileReadyRef.current
      ) {
        return;
      }

      clearRetryTimer();

      processingRef.current = true;
      processingAttemptedRef.current = true;

      if (scanStartedAtRef.current === null) {
        scanStartedAtRef.current = performance.now();
        setScanStartedAt(Date.now());
      }

      setIsMobileProcessing(true);
      setMobileSessionError("");
      setStatus("Fotos recibidas. Analizando documentos con IA...");

      const startedAt = performance.now();

      try {
        // Check whether another request has already finished.
        const existing = await readMobileStatus(token);

        if (existing && validBundle(existing.bundle)) {
          applyMobileStatus(existing, token);
          return;
        }

        if (existing?.status === "expired") {
          throw new Error("La sesión QR ha caducado.");
        }

        const response = await fetch(
          "/api/admin/documents/mobile-session/process",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            cache: "no-store",
            body: JSON.stringify({ token }),
          },
        );

        const data = (await response.json().catch(
          () => null,
        )) as {
          ok?: boolean;
          success?: boolean;
          error?: string;
          status?: string;
        } | null;

        if (
          !response.ok ||
          (!data?.ok && !data?.success)
        ) {
          const message =
            data?.error ||
            `Error al analizar documentos (${response.status}).`;

          const failure = new Error(message) as Error & {
            httpStatus?: number;
          };

          failure.httpStatus = response.status;
          throw failure;
        }

        if (
          !mountedRef.current ||
          activeTokenRef.current !== token
        ) {
          return;
        }

        processingFinishedRef.current = true;
        retryCountRef.current = 0;
        setRetryCount(0);

        setStatus(
          "Análisis terminado. Recibiendo los datos del cliente...",
        );

        // Fetch the result immediately instead of waiting
        // for the next polling interval.
        const latest = await readMobileStatus(token);

        if (latest) {
          applyMobileStatus(latest, token);
        }

        console.info("NEXA QR PROCESS SUCCESS", {
          elapsedMs: Math.round(performance.now() - startedAt),
        });
      } catch (caught) {
        if (
          !mountedRef.current ||
          activeTokenRef.current !== token ||
          mobileReadyRef.current
        ) {
          return;
        }

        const message = getError(
          caught,
          "No se pudieron analizar los documentos.",
        );

        console.warn("NEXA QR PROCESS ERROR", {
          message,
          elapsedMs: Math.round(performance.now() - startedAt),
        });

        // A failed request may still have completed on the
        // server. Check storage before attempting another job.
        let completed: MobileStatusResponse | null = null;

        try {
          completed = await readMobileStatus(token);
        } catch {
          // A temporary status error is not fatal.
        }

        if (completed && validBundle(completed.bundle)) {
          applyMobileStatus(completed, token);
          return;
        }

        if (
          !mountedRef.current ||
          activeTokenRef.current !== token ||
          mobileReadyRef.current
        ) {
          return;
        }

        const httpStatus =
          typeof caught === "object" &&
          caught !== null &&
          "httpStatus" in caught
            ? Number(
                (caught as { httpStatus?: number }).httpStatus,
              )
            : 0;

        const canRetry =
          retryCountRef.current < MAX_AUTO_RETRIES &&
          isRetryableError(httpStatus) &&
          !/expired|caducad|invalid|unauthorized|no autorizad/i.test(
            message,
          );

        if (!canRetry) {
          setMobileSessionError(message);
          setStatus(
            "No se pudo completar el análisis automático. Puedes reintentar sin subir las fotos.",
          );
          return;
        }

        const retryIndex = retryCountRef.current;

        retryCountRef.current += 1;
        setRetryCount(retryCountRef.current);

        const delayMs =
          RETRY_DELAYS_MS[retryIndex] || 6000;

        setMobileSessionError("");
        setStatus(
          `Comprobando análisis y preparando reintento automático (${retryCountRef.current}/${MAX_AUTO_RETRIES})...`,
        );

        retryTimerRef.current = setTimeout(async () => {
          retryTimerRef.current = null;

          if (
            !mountedRef.current ||
            activeTokenRef.current !== token ||
            mobileReadyRef.current
          ) {
            return;
          }

          // Always check for a completed bundle before retrying.
          try {
            const latest = await readMobileStatus(token);

            if (latest && validBundle(latest.bundle)) {
              applyMobileStatus(latest, token);
              return;
            }

            if (latest?.status === "expired") {
              setMobileSessionError(
                "La sesión QR ha caducado.",
              );
              return;
            }
          } catch {
            // Continue to the controlled retry.
          }

          if (
            !mountedRef.current ||
            activeTokenRef.current !== token ||
            mobileReadyRef.current ||
            processingRef.current
          ) {
            return;
          }

          processingAttemptedRef.current = false;

          void processMobileDocumentsRef.current(token);
        }, delayMs);
      } finally {
        processingRef.current = false;

        if (
          mountedRef.current &&
          activeTokenRef.current === token
        ) {
          setIsMobileProcessing(false);
        }
      }
    },
    [
      clearRetryTimer,
      readMobileStatus,
      applyMobileStatus,
    ],
  );

  processMobileDocumentsRef.current = processMobileDocuments;

  function retryMobileProcessing() {
    if (
      !sessionToken ||
      processingRef.current ||
      mobileReadyRef.current
    ) {
      return;
    }

    clearRetryTimer();

    retryCountRef.current = 0;
    setRetryCount(0);

    processingAttemptedRef.current = false;
    processingFinishedRef.current = false;

    setMobileSessionError("");

    void processMobileDocuments(sessionToken);
  }

  // Poll every second. This is lightweight status polling,
  // not repeated AI analysis.
  useEffect(() => {
    if (!sessionToken) return;

    let stopped = false;
    let busy = false;

    const controller = new AbortController();

    async function poll() {
      if (stopped || busy || mobileReadyRef.current) {
        return;
      }

      busy = true;

      try {
        const data = await readMobileStatus(
          sessionToken,
          controller.signal,
        );

        if (stopped || !data) return;

        applyMobileStatus(data, sessionToken);

        if (validBundle(data.bundle)) return;

        if (
          data.status === "processing" &&
          (data.uploadedCount || 0) > 0 &&
          !processingAttemptedRef.current &&
          !processingRef.current &&
          !mobileReadyRef.current
        ) {
          void processMobileDocumentsRef.current(sessionToken);
        }
      } catch {
        // Recover automatically from temporary network errors.
      } finally {
        busy = false;
      }
    }

    void poll();

    const timer = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [sessionToken, readMobileStatus, applyMobileStatus]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleSelectedFiles(files: FileList | null) {
    if (!files?.length) return;

    setError("");
    setStatus("");

    const incoming = Array.from(files);

    if (items.length + incoming.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} archivos por contrato.`);
      return;
    }

    const accepted: LocalFileItem[] = [];

    for (const [index, file] of incoming.entries()) {
      const type = file.type.toLowerCase();

      const extension =
        file.name.toLowerCase().split(".").pop() || "";

      if (
        !ALLOWED_TYPES.has(type) &&
        !ALLOWED_EXTENSIONS.has(extension)
      ) {
        setError(`Archivo no permitido: ${file.name}.`);
        continue;
      }

      if (
        file.size <= 0 ||
        file.size > MAX_FILE_BYTES
      ) {
        setError(
          `${file.name} está vacío o supera ${formatBytes(MAX_FILE_BYTES)}.`,
        );
        continue;
      }

      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
        file,
        previewUrl:
          file.type.startsWith("image/") &&
          !["heic", "heif"].includes(extension)
            ? URL.createObjectURL(file)
            : undefined,
      });
    }

    if (!accepted.length) return;

    const newTotal =
      totalBytes +
      accepted.reduce(
        (sum, item) => sum + item.file.size,
        0,
      );

    if (newTotal > MAX_TOTAL_BYTES) {
      accepted.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      setError(
        "Los archivos superan el tamaño total permitido.",
      );
      return;
    }

    setItems((current) => [...current, ...accepted]);

    setBundle(null);
    onBundleChangeRef.current(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeItem(key: string) {
    setItems((current) => {
      const found = current.find(
        (item) => item.key === key,
      );

      if (found?.previewUrl) {
        URL.revokeObjectURL(found.previewUrl);
      }

      return current.filter(
        (item) => item.key !== key,
      );
    });

    setBundle(null);
    onBundleChangeRef.current(null);

    setStatus("");
    setError("");
  }

  function clearAll() {
    items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    setItems([]);
    setBundle(null);

    onBundleChangeRef.current(null);

    setStatus("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  // Preserve desktop upload and analysis.
  async function analyzeDocuments() {
    if (!items.length || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setStatus(
      "Subiendo y analizando documentos con IA...",
    );

    try {
      const formData = new FormData();

      formData.append(
        "contractNumber",
        contractNumber || "",
      );

      formData.append(
        "vehicleCode",
        vehicleCode || "",
      );

      for (const item of items) {
        formData.append(
          "documents",
          item.file,
          item.file.name,
        );
      }

      const response = await fetch(
        "/api/admin/documents/analyze",
        {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        },
      );

      const data = (await response.json().catch(
        () => null,
      )) as AnalyzeResponse | null;

      if (
        !response.ok ||
        (!data?.ok && !data?.success) ||
        !data.sessionId
      ) {
        throw new Error(
          data?.error ||
            `No se pudieron analizar los documentos (${response.status}).`,
        );
      }

      const nextBundle: CustomerDocumentBundle = {
        sessionId: data.sessionId,
        files: Array.isArray(data.files)
          ? data.files
          : [],
        autofill: data.autofill || {},
        analyzedAt:
          data.analyzedAt ||
          new Date().toISOString(),
        warnings: Array.isArray(data.warnings)
          ? data.warnings
          : [],
      };

      setBundle(nextBundle);
      onBundleChangeRef.current(nextBundle);

      const detected = countFields(
        nextBundle.autofill,
      );

      if (
        detected > 0 &&
        nextBundle.autofill
      ) {
        onAutofillRef.current(nextBundle.autofill);

        setStatus(
          `IA terminada. ${detected} campos aplicados automáticamente. Revisa los datos.`,
        );
      } else {
        setStatus(
          "IA terminada. Los documentos quedaron adjuntos.",
        );
      }
    } catch (caught) {
      setError(
        getError(
          caught,
          "No se pudieron analizar los documentos.",
        ),
      );

      setStatus("");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function applyDetectedValues() {
    if (!bundle?.autofill) return;

    onAutofillRef.current(bundle.autofill);

    setStatus(
      "Datos aplicados. Revisa la información antes de generar el contrato.",
    );
  }

  const qrImageUrl = sessionToken
    ? `/api/admin/documents/mobile-session/qr?token=${encodeURIComponent(sessionToken)}`
    : "";

  const mobileStatusLabel =
    mobileStatus === "waiting"
      ? "Esperando móvil"
      : mobileStatus === "uploading"
        ? "Recibiendo fotos"
        : mobileStatus === "processing"
          ? isMobileProcessing
            ? "Analizando con IA"
            : mobileSessionError
              ? "Reintento disponible"
              : retryCount > 0
                ? "Reintento automático"
                : "Preparando análisis"
          : mobileStatus === "ready"
            ? "Listo"
            : "Caducado";

  return (
    <div className="rounded-[28px] border border-violet-400/20 bg-violet-500/[0.06] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-300">
            Documentos del cliente · IA
          </p>

          <h4 className="mt-2 text-xl font-black text-white">
            Escanear documentos con el móvil
          </h4>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/50">
            Escanea el QR, haz fotos del DNI, pasaporte o permiso
            de conducir y envíalas a NEXA OS. La IA analizará
            los documentos automáticamente.
          </p>
        </div>

        <button
          type="button"
          onClick={openFilePicker}
          disabled={isAnalyzing}
          className="shrink-0 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs font-black text-white/65 transition hover:border-violet-400/35 hover:text-violet-200 disabled:opacity-50"
        >
          📁 Subir archivos
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
        className="hidden"
        onChange={(event) =>
          handleSelectedFiles(event.target.files)
        }
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-[230px_1fr]">
        <div className="flex min-h-[230px] items-center justify-center rounded-[24px] border border-violet-400/25 bg-white p-4">
          {isCreatingSession ? (
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-violet-600" />

              <p className="mt-3 text-xs font-black text-black/60">
                Creando QR...
              </p>
            </div>
          ) : qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="QR para subir documentos desde el móvil"
              className="h-[198px] w-[198px] object-contain"
            />
          ) : (
            <div className="px-4 text-center">
              <p className="text-sm font-black text-red-600">
                QR no disponible
              </p>

              <p className="mt-2 text-xs font-semibold text-black/50">
                {mobileSessionError ||
                  "No se pudo crear la sesión móvil."}
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-300">
            Opción principal
          </p>

          <h5 className="mt-2 text-lg font-black text-white">
            Escanea el QR con la cámara del móvil
          </h5>

          <div className="mt-4 space-y-2 text-sm font-semibold leading-6 text-white/55">
            <p>1. Escanea este QR desde tu móvil.</p>
            <p>2. Abre la página privada de documentos.</p>
            <p>3. Haz fotos del DNI, pasaporte o permiso.</p>
            <p>4. Envía las fotos a NEXA OS.</p>
            <p>5. La IA detectará y aplicará los datos automáticamente.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              Estado: {mobileStatusLabel}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {mobileUploadedCount} foto
              {mobileUploadedCount === 1 ? "" : "s"}
            </span>

            {retryCount > 0 && !mobileReadyRef.current ? (
              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-amber-200">
                Reintento {retryCount}/{MAX_AUTO_RETRIES}
              </span>
            ) : null}

            {scanDurationMs !== null ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                Procesado en {(scanDurationMs / 1000).toFixed(1)} s
              </span>
            ) : null}
          </div>

          {isMobileProcessing ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
              <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-violet-300/20 border-t-violet-300" />

              <p className="text-xs font-bold text-violet-200">
                Leyendo documentos con IA. Las fotos ya están
                guardadas.
              </p>
            </div>
          ) : null}

          {mobileSessionError ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3">
              <p className="text-xs font-bold text-red-300">
                {mobileSessionError}
              </p>
            </div>
          ) : null}

          {mobileStatus === "processing" &&
          mobileUploadedCount > 0 &&
          !isMobileProcessing &&
          !mobileReadyRef.current &&
          processingAttemptedRef.current &&
          retryTimerRef.current === null ? (
            <button
              type="button"
              onClick={retryMobileProcessing}
              className="mt-4 w-full rounded-2xl border border-violet-400/30 bg-violet-500/15 px-4 py-3 text-xs font-black text-violet-200 transition hover:bg-violet-500/25"
            >
              ↻ Reintentar análisis sin volver a subir fotos
            </button>
          ) : null}

          {mobileUrl ? (
            <p className="mt-4 break-all text-[10px] font-semibold text-white/25">
              {mobileUrl}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
              Archivos desde el ordenador
            </p>

            <p className="mt-1 text-xs font-semibold text-white/35">
              Opción secundaria · JPG · PNG · WEBP · HEIC/HEIF · PDF
            </p>
          </div>

          <div className="flex gap-2 text-[11px] font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {items.length} archivos
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {formatBytes(totalBytes)}
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <button
            type="button"
            onClick={openFilePicker}
            className="mt-4 flex min-h-[100px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-6 text-center transition hover:border-violet-400/40"
          >
            <span className="text-2xl">📎</span>

            <span className="mt-2 text-sm font-black text-white/70">
              Subir archivos manualmente
            </span>
          </button>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
              >
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[10px] font-black text-white/55">
                    FILE
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white/80">
                    {item.file.name}
                  </p>

                  <p className="mt-1 text-[11px] font-bold text-white/35">
                    {formatBytes(item.file.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  disabled={isAnalyzing}
                  className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                void analyzeDocuments();
              }}
              disabled={isAnalyzing}
              className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 px-5 py-4 text-sm font-black text-white disabled:opacity-50"
            >
              {isAnalyzing
                ? "Analizando documentos..."
                : bundle
                  ? "Volver a analizar documentos"
                  : "✨ Analizar documentos con IA"}
            </button>

            <button
              type="button"
              onClick={clearAll}
              disabled={isAnalyzing}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white/55 disabled:opacity-50"
            >
              Quitar todos
            </button>
          </div>
        ) : null}
      </div>

      {bundle?.autofill ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Datos detectados
              </p>

              <p className="mt-1 text-xs font-semibold text-white/45">
                Los datos se han aplicado automáticamente.
                Compruébalos antes de generar el contrato.
              </p>
            </div>

            <button
              type="button"
              onClick={applyDetectedValues}
              className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-xs font-black text-emerald-200"
            >
              Volver a aplicar datos
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DetectedField
              label="Nombre completo"
              value={displayValue(bundle.autofill.nombreCliente)}
            />

            <DetectedField
              label="DNI / Pasaporte"
              value={displayValue(bundle.autofill.dniPasaporte)}
            />

            <DetectedField
              label="Dirección"
              value={displayValue(bundle.autofill.direccion)}
            />

            <DetectedField
              label="Permiso de conducir"
              value={displayValue(bundle.autofill.permisoConducir)}
            />

            <DetectedField
              label="País de expedición"
              value={displayValue(bundle.autofill.paisExpedicion)}
            />

            <DetectedField
              label="Caducidad permiso"
              value={displayValue(bundle.autofill.fechaCaducidad)}
            />
          </div>

          {bundle.warnings?.length ? (
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
              <p className="text-xs font-black text-amber-200">
                Avisos del análisis
              </p>

              {bundle.warnings.map((warning, index) => (
                <p
                  key={index}
                  className="mt-1 text-xs font-semibold text-amber-100/70"
                >
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {status ? (
        <div className="mt-4 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300">
          {status}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function DetectedField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const detected = value !== "No detectado";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm font-black ${
          detected ? "text-white/80" : "text-white/30"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
