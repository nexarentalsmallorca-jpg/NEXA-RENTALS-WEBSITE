"use client";

import { useMemo, useRef, useState } from "react";

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
  kind?:
    | "passport"
    | "identity"
    | "driving_licence"
    | "other"
    | "unknown";
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

type LocalFileItem = {
  key: string;
  file: File;
  previewUrl?: string;
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

  const totalBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  const canAnalyze = items.length > 0 && !isAnalyzing;

  function cleanupPreview(item: LocalFileItem) {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleSelectedFiles(files: FileList | null) {
    if (!files?.length) return;

    setError("");
    setStatus("");

    const currentCount = items.length;
    const incoming = Array.from(files);

    if (currentCount + incoming.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} archivos por contrato.`);
      return;
    }

    const accepted: LocalFileItem[] = [];

    for (const [index, file] of incoming.entries()) {
      const normalizedType = String(file.type || "").toLowerCase();

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

      if (!ALLOWED_TYPES.has(normalizedType) && !extensionAllowed) {
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
        key: makeLocalKey(file, currentCount + index),
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    }

    if (!accepted.length) return;

    setItems((current) => [...current, ...accepted]);

    // Any file change invalidates the previous analyzed bundle.
    setBundle(null);
    onBundleChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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

    if (inputRef.current) {
      inputRef.current.value = "";
    }
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

      let data: AnalyzeResponse = {};

      try {
        data = rawText ? (JSON.parse(rawText) as AnalyzeResponse) : {};
      } catch {
        throw new Error(
          response.ok
            ? "El servidor devolvió una respuesta inválida."
            : `Error HTTP ${response.status}: ${rawText.slice(0, 250)}`,
        );
      }

      if (!response.ok || (!data.ok && !data.success)) {
        throw new Error(
          data.error || `No se pudieron analizar los documentos (${response.status}).`,
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

      const extracted = nextBundle.autofill || {};
      const extractedCount = Object.values(extracted).filter((value) =>
        Boolean(String(value || "").trim()),
      ).length;

      setStatus(
        extractedCount > 0
          ? `IA terminada. ${extractedCount} campos detectados. Revisa los datos y pulsa "Aplicar datos al formulario".`
          : "IA terminada. Los documentos quedaron adjuntos, pero no se detectaron campos fiables para autocompletar.",
      );
    } catch (caught: unknown) {
      const message =
        caught instanceof Error
          ? caught.message
          : "No se pudieron analizar los documentos.";

      setError(message);
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

  return (
    <div className="rounded-[28px] border border-violet-400/20 bg-violet-500/[0.06] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-300">
            Documentos del cliente · IA
          </p>

          <h4 className="mt-2 text-xl font-black text-white">
            Subir, leer y adjuntar documentos
          </h4>

          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/50">
            Añade pasaporte/DNI, permiso de conducir y cualquier documento extra.
            NEXA analizará los archivos, propondrá los datos del cliente y mantendrá
            los documentos vinculados a este contrato para guardarlos después en la
            misma carpeta de Google Drive.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={isAnalyzing}
            className="rounded-2xl border border-violet-400/30 bg-violet-500/15 px-4 py-3 text-xs font-black text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📁 Añadir archivos
          </button>

          <button
            type="button"
            disabled
            title="Se activará cuando añadamos la página móvil y la sesión QR."
            className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-black text-white/30"
          >
            📱 Escanear con móvil · Próximo paso
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
        className="hidden"
        onChange={(event) => handleSelectedFiles(event.target.files)}
      />

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
              Archivos adjuntos
            </p>
            <p className="mt-1 text-xs font-semibold text-white/35">
              JPG · PNG · WEBP · HEIC/HEIF · PDF
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {items.length} archivo{items.length === 1 ? "" : "s"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
              {formatBytes(totalBytes)}
            </span>

            {bundle?.sessionId ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                Sesión lista
              </span>
            ) : null}
          </div>
        </div>

        {items.length === 0 ? (
          <button
            type="button"
            onClick={openFilePicker}
            className="mt-4 flex min-h-[150px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-8 text-center transition hover:border-violet-400/40 hover:bg-violet-500/[0.04]"
          >
            <span className="text-3xl">📎</span>
            <span className="mt-3 text-sm font-black text-white/75">
              Pulsa aquí para añadir los documentos
            </span>
            <span className="mt-1 text-xs font-semibold text-white/35">
              Puedes seleccionar varios archivos al mismo tiempo.
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
                  className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-xs font-black text-red-300 transition hover:border-red-400/35 disabled:opacity-40"
                  aria-label={`Eliminar ${item.file.name}`}
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
              disabled={!canAnalyze}
              className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 px-5 py-4 text-sm font-black text-white shadow-[0_15px_45px_rgba(139,92,246,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white/55 transition hover:border-red-400/25 hover:text-red-300 disabled:opacity-40"
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
              className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-xs font-black text-emerald-200 transition hover:border-emerald-300/50 hover:bg-emerald-500/20"
            >
              Aplicar datos al formulario
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

          {bundle.files.length > 0 ? (
            <div className="mt-4">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/40">
                Clasificación IA
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {bundle.files.map((file) => (
                  <span
                    key={file.id}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-white/55"
                  >
                    {file.originalName} · {file.kind || "unknown"}
                    {file.side && file.side !== "unknown" ? ` · ${file.side}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {bundle.warnings?.length ? (
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
              <p className="text-xs font-black text-amber-300">
                {bundle.warnings.join(" · ")}
              </p>
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
