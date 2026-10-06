"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type MobileSessionCreateResponse = {
  ok?: boolean;
  error?: string;
  sessionToken?: string;
  mobileUrl?: string;
  expiresAt?: string;
};

type MobileSessionStatusResponse = {
  ok?: boolean;
  error?: string;
  status?: "waiting" | "uploading" | "processing" | "ready" | "expired";
  uploadedCount?: number;
  bundle?: CustomerDocumentBundle | null;
};

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

function makeLocalKey(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(file: File) {
  if (file.type === "application/pdf") return "PDF";
  if (file.type.startsWith("image/")) return "IMG";
  return "FILE";
}

function displayValue(value?: string) {
  return String(value || "").trim() || "No detectado";
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

  const [items, setItems] = useState<LocalFileItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [bundle, setBundle] = useState<CustomerDocumentBundle | null>(null);

  const [sessionToken, setSessionToken] = useState("");
  const [mobileUrl, setMobileUrl] = useState("");
  const [mobileStatus, setMobileStatus] =
    useState<MobileSessionStatusResponse["status"]>("waiting");
  const [mobileUploadedCount, setMobileUploadedCount] = useState(0);
  const [mobileSessionError, setMobileSessionError] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(true);

  const totalBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  useEffect(() => {
    let cancelled = false;

    async function createSession() {
      setIsCreatingSession(true);
      setMobileSessionError("");

      try {
        const response = await fetch("/api/admin/documents/mobile-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractNumber, vehicleCode }),
        });

        const data = (await response.json().catch(() => null)) as
          | MobileSessionCreateResponse
          | null;

        if (!response.ok || !data?.ok || !data.sessionToken || !data.mobileUrl) {
          throw new Error(
            data?.error || `No se pudo crear la sesión QR (${response.status}).`,
          );
        }

        if (cancelled) return;

        setSessionToken(data.sessionToken);
        setMobileUrl(data.mobileUrl);
        setMobileStatus("waiting");
      } catch (caught: unknown) {
        if (!cancelled) {
          setMobileSessionError(
            caught instanceof Error
              ? caught.message
              : "No se pudo crear la sesión QR.",
          );
        }
      } finally {
        if (!cancelled) setIsCreatingSession(false);
      }
    }

    createSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sessionToken) return;

    let stopped = false;

    async function poll() {
      try {
        const response = await fetch(
          `/api/admin/documents/mobile-session/status?token=${encodeURIComponent(
            sessionToken,
          )}`,
          { cache: "no-store" },
        );

        const data = (await response.json().catch(() => null)) as
          | MobileSessionStatusResponse
          | null;

        if (!response.ok || !data?.ok || stopped) return;

        if (data.status) setMobileStatus(data.status);
        if (typeof data.uploadedCount === "number") {
          setMobileUploadedCount(data.uploadedCount);
        }

        if (data.bundle?.sessionId) {
          setBundle(data.bundle);
          onBundleChange(data.bundle);

          const count = Object.values(data.bundle.autofill || {}).filter((value) =>
            Boolean(String(value || "").trim()),
          ).length;

          setStatus(
            count
              ? `Fotos recibidas desde el móvil. IA terminada: ${count} campos detectados.`
              : "Fotos recibidas desde el móvil y vinculadas al contrato.",
          );
        }
      } catch {
        // The next poll can recover.
      }
    }

    poll();
    const timer = window.setInterval(poll, 2500);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [sessionToken, onBundleChange]);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function cleanupPreview(item: LocalFileItem) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
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
      const type = String(file.type || "").toLowerCase();
      const extension = file.name.toLowerCase().split(".").pop() || "";
      const extensionAllowed = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "heic",
        "heif",
        "pdf",
      ].includes(extension);

      if (!ALLOWED_TYPES.has(type) && !extensionAllowed) {
        setError(
          `Archivo no permitido: ${file.name}. Usa JPG, PNG, WEBP, HEIC/HEIF o PDF.`,
        );
        continue;
      }

      if (file.size <= 0) {
        setError(`El archivo ${file.name} está vacío.`);
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        setError(
          `${file.name} supera el máximo de ${formatBytes(MAX_FILE_BYTES)}.`,
        );
        continue;
      }

      accepted.push({
        key: makeLocalKey(file, items.length + index),
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    }

    if (!accepted.length) return;

    setItems((current) => [...current, ...accepted]);
    setBundle(null);
    onBundleChange(null);

    if (inputRef.current) inputRef.current.value = "";
  }

  function removeItem(key: string) {
    setItems((current) => {
      const found = current.find((item) => item.key === key);
      if (found) cleanupPreview(found);
      return current.filter((item) => item.key !== key);
    });

    setBundle(null);
    onBundleChange(null);
    setStatus("");
    setError("");
  }

  function clearAll() {
    items.forEach(cleanupPreview);
    setItems([]);
    setBundle(null);
    onBundleChange(null);
    setStatus("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyzeDocuments() {
    if (!items.length || isAnalyzing) return;

    setIsAnalyzing(true);
    setError("");
    setStatus("Subiendo y analizando documentos con IA...");

    try {
      const formData = new FormData();
      formData.append("contractNumber", contractNumber || "");
      formData.append("vehicleCode", vehicleCode || "");

      for (const item of items) {
        formData.append("documents", item.file, item.file.name);
      }

      const response = await fetch("/api/admin/documents/analyze", {
        method: "POST",
        body: formData,
      });

      const rawText = await response.text();
      const data = rawText ? (JSON.parse(rawText) as AnalyzeResponse) : {};

      if (!response.ok || (!data.ok && !data.success)) {
        throw new Error(
          data.error ||
            `No se pudieron analizar los documentos (${response.status}).`,
        );
      }

      if (!data.sessionId) {
        throw new Error(
          "El servidor analizó los documentos pero no devolvió sessionId.",
        );
      }

      const nextBundle: CustomerDocumentBundle = {
        sessionId: data.sessionId,
        files: Array.isArray(data.files) ? data.files : [],
        autofill: data.autofill || {},
        analyzedAt: data.analyzedAt || new Date().toISOString(),
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
      };

      setBundle(nextBundle);
      onBundleChange(nextBundle);

      const extractedCount = Object.values(nextBundle.autofill || {}).filter(
        (value) => Boolean(String(value || "").trim()),
      ).length;

      setStatus(
        extractedCount
          ? `IA terminada. ${extractedCount} campos detectados. Revisa los datos y pulsa "Aplicar datos al formulario".`
          : "IA terminada. Los documentos quedaron adjuntos.",
      );
    } catch (caught: unknown) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron analizar los documentos.",
      );
      setStatus("");
      setBundle(null);
      onBundleChange(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function applyDetectedValues() {
    if (!bundle?.autofill) return;
    onAutofill(bundle.autofill);
    setStatus(
      "Datos aplicados. Los campos que ya habías rellenado manualmente no se han sobrescrito.",
    );
  }

  const qrImageUrl = sessionToken
    ? `/api/admin/documents/mobile-session/qr?token=${encodeURIComponent(
        sessionToken,
      )}`
    : "";

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
            Escanea el QR, haz las fotos del DNI/pasaporte y permiso de conducir,
            y NEXA las recibirá en esta reserva. Si ya tienes los documentos en el
            ordenador, usa “Subir archivos”.
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
        onChange={(event) => handleSelectedFiles(event.target.files)}
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
              <p className="text-sm font-black text-red-600">QR no disponible</p>
              <p className="mt-2 text-xs font-semibold text-black/50">
                {mobileSessionError || "No se pudo crear la sesión móvil."}
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
            <p>2. Se abrirá la página privada de esta reserva.</p>
            <p>3. Haz fotos del DNI/pasaporte y permiso de conducir.</p>
            <p>4. Las imágenes aparecerán aquí y la IA leerá los datos.</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              Estado:{" "}
              {mobileStatus === "waiting"
                ? "Esperando móvil"
                : mobileStatus === "uploading"
                  ? "Recibiendo fotos"
                  : mobileStatus === "processing"
                    ? "Analizando"
                    : mobileStatus === "ready"
                      ? "Listo"
                      : "Caducado"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {mobileUploadedCount} foto{mobileUploadedCount === 1 ? "" : "s"}
            </span>
          </div>

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

          <div className="flex flex-wrap gap-2 text-[11px] font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {items.length} archivo{items.length === 1 ? "" : "s"}
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
                    {fileIcon(item.file)}
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
                  className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300"
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
              onClick={analyzeDocuments}
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
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white/55"
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
                Comprueba los valores antes de aplicarlos al contrato.
              </p>
            </div>

            <button
              type="button"
              onClick={applyDetectedValues}
              className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-xs font-black text-emerald-200"
            >
              Aplicar datos al formulario
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <DetectedField label="Nombre completo" value={displayValue(bundle.autofill.nombreCliente)} />
            <DetectedField label="DNI / Pasaporte" value={displayValue(bundle.autofill.dniPasaporte)} />
            <DetectedField label="Dirección" value={displayValue(bundle.autofill.direccion)} />
            <DetectedField label="Permiso de conducir" value={displayValue(bundle.autofill.permisoConducir)} />
            <DetectedField label="País de expedición" value={displayValue(bundle.autofill.paisExpedicion)} />
            <DetectedField label="Caducidad permiso" value={displayValue(bundle.autofill.fechaCaducidad)} />
          </div>
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

function DetectedField({ label, value }: { label: string; value: string }) {
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
