"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

type UploadResponse = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  uploadedCount?: number;
  status?: "waiting" | "uploading" | "processing" | "ready" | "expired";
};

type MobileFileItem = {
  key: string;
  file: File;
  previewUrl?: string;
};

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "pdf",
];

function makeKey(file: File, index: number) {
  return `${file.name}-${file.size}-${file.lastModified}-${index}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MobileDocumentUploadPage() {
  const params = useParams<{ token: string }>();
  const token = String(params?.token || "").trim();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<MobileFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const totalBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  function cleanupPreview(item: MobileFileItem) {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    setError("");
    setMessage("");

    const incoming = Array.from(fileList);

    if (items.length + incoming.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} archivos por sesión.`);
      return;
    }

    const accepted: MobileFileItem[] = [];

    for (const [index, file] of incoming.entries()) {
      const extension = file.name.toLowerCase().split(".").pop() || "";

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setError(
          `Archivo no permitido: ${file.name}. Usa JPG, PNG, WEBP, HEIC/HEIF o PDF.`,
        );
        continue;
      }

      if (file.size <= 0) {
        setError(`${file.name} está vacío.`);
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        setError(`${file.name} supera el máximo de 15 MB.`);
        continue;
      }

      accepted.push({
        key: makeKey(file, items.length + index),
        file,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    }

    if (!accepted.length) return;

    setItems((current) => [...current, ...accepted]);

    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(key: string) {
    setItems((current) => {
      const found = current.find((item) => item.key === key);
      if (found) cleanupPreview(found);

      return current.filter((item) => item.key !== key);
    });

    setMessage("");
    setError("");
  }

  function clearAll() {
    items.forEach(cleanupPreview);
    setItems([]);
    setMessage("");
    setError("");

    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadDocuments() {
    if (!token) {
      setError("Sesión QR inválida.");
      return;
    }

    if (!items.length) {
      setError("Añade al menos una foto o documento.");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("Subiendo documentos a NEXA...");

    try {
      const formData = new FormData();
      formData.append("token", token);

      for (const item of items) {
        formData.append("documents", item.file, item.file.name);
      }

      const response = await fetch(
        "/api/admin/documents/mobile-session/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const rawText = await response.text();

      let data: UploadResponse = {};

      try {
        data = rawText ? (JSON.parse(rawText) as UploadResponse) : {};
      } catch {
        throw new Error(
          response.ok
            ? "El servidor devolvió una respuesta inválida."
            : `Error HTTP ${response.status}`,
        );
      }

      if (!response.ok || (!data.ok && !data.success)) {
        throw new Error(
          data.error ||
            `No se pudieron subir los documentos (${response.status}).`,
        );
      }

      setUploadedCount(Number(data.uploadedCount || items.length));
      setFinished(true);
      setMessage(
        "Documentos enviados correctamente. Puedes volver al ordenador: NEXA ya los está procesando.",
      );

      items.forEach(cleanupPreview);
      setItems([]);
    } catch (caught: unknown) {
      setMessage("");
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron subir los documentos.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-6 text-white">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-orange-300">
                NEXA RENTALS
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Documentos del cliente
              </h1>
            </div>

            <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 text-xs font-black text-orange-300">
              QR seguro
            </div>
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-white/50">
            Haz fotos claras del DNI/pasaporte y del permiso de conducir.
            Puedes añadir tantas imágenes como necesites antes de enviarlas.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading || finished}
              className="rounded-[24px] bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-500 px-5 py-5 text-base font-black text-white shadow-[0_18px_55px_rgba(249,115,22,0.2)] transition active:scale-[0.99] disabled:opacity-50"
            >
              📷 Hacer foto
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || finished}
              className="rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-4 text-sm font-black text-white/75 transition active:scale-[0.99] disabled:opacity-50"
            >
              📁 Elegir de la galería / archivos
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => addFiles(event.target.files)}
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/*,application/pdf"
            className="hidden"
            onChange={(event) => addFiles(event.target.files)}
          />

          {finished ? (
            <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-5">
              <p className="text-lg font-black text-emerald-300">
                ✓ Documentos enviados
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
                {uploadedCount} archivo{uploadedCount === 1 ? "" : "s"} enviado
                {uploadedCount === 1 ? "" : "s"}. Puedes cerrar esta página y
                volver al mostrador.
              </p>
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
                    Preparados para enviar
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/35">
                    {items.length} archivo{items.length === 1 ? "" : "s"} ·{" "}
                    {formatBytes(totalBytes)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={isUploading}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/50"
                >
                  Quitar todos
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xs font-black text-white/45">
                        PDF
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-white/80">
                        {item.file.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white/35">
                        {formatBytes(item.file.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(item.key)}
                      disabled={isUploading}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-black text-red-300 disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={uploadDocuments}
                disabled={isUploading}
                className="mt-4 w-full rounded-[24px] bg-emerald-500 px-5 py-5 text-base font-black text-white shadow-[0_18px_55px_rgba(16,185,129,0.2)] transition active:scale-[0.99] disabled:opacity-50"
              >
                {isUploading
                  ? "Subiendo documentos..."
                  : `Enviar ${items.length} archivo${items.length === 1 ? "" : "s"} a NEXA`}
              </button>
            </div>
          ) : null}

          {message ? (
            <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          ) : null}

          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-center text-[11px] font-semibold leading-5 text-white/25">
              Sesión temporal privada de NEXA Rentals. Los documentos quedan
              vinculados únicamente a esta operación de alquiler.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
