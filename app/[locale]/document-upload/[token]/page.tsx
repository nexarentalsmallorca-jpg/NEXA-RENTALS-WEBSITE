"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";

type UploadResponse = {
  ok?: boolean;
  success?: boolean;
  error?: string;
  uploadedCount?: number;
  status?: string;
};

type MobileFileItem = {
  key: string;
  file: File;
  previewUrl?: string;
};

const MAX_FILES = 30;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 80 * 1024 * 1024;

// Conservative document settings: prioritize readable text.
const MAX_IMAGE_DIMENSION = 2400;
const JPEG_QUALITY = 0.88;

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
  "pdf",
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(file: File) {
  return file.name.split(".").pop()?.toLowerCase() || "";
}

function makeKey() {
  return crypto.randomUUID();
}

function optimizedName(name: string) {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base}_nexa.jpg`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo optimizar la imagen."));
      },
      "image/jpeg",
      quality,
    );
  });
}

async function optimizeImage(file: File): Promise<File> {
  const extension = extensionOf(file);

  // Preserve PDFs and HEIC/HEIF. Browser support for
  // decoding HEIC is inconsistent across devices.
  if (
    extension === "pdf" ||
    extension === "heic" ||
    extension === "heif"
  ) {
    return file;
  }

  if (
    !["jpg", "jpeg", "png", "webp"].includes(extension)
  ) {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
  } catch {
    // Keep original if the browser cannot decode it.
    return file;
  }

  try {
    const longestSide = Math.max(
      bitmap.width,
      bitmap.height,
    );

    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / longestSide,
    );

    const width = Math.max(
      1,
      Math.round(bitmap.width * scale),
    );

    const height = Math.max(
      1,
      Math.round(bitmap.height * scale),
    );

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: false,
    });

    if (!context) {
      return file;
    }

    // White background prevents transparency from
    // becoming black when converting PNG to JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height,
    );

    const blob = await canvasToBlob(
      canvas,
      JPEG_QUALITY,
    );

    // Never replace the original with a larger file.
    if (blob.size >= file.size) {
      return file;
    }

    return new File(
      [blob],
      optimizedName(file.name),
      {
        type: "image/jpeg",
        lastModified: Date.now(),
      },
    );
  } finally {
    bitmap.close();
  }
}

export default function MobileDocumentUploadPage() {
  const params = useParams<{ token: string }>();

  const token = String(params?.token || "").trim();

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsRef = useRef<MobileFileItem[]>([]);
  const busyRef = useRef(false);

  const [items, setItems] = useState<MobileFileItem[]>([]);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [uploadedCount, setUploadedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const [uploadSeconds, setUploadSeconds] = useState<number | null>(
    null,
  );

  const totalBytes = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.file.size,
        0,
      ),
    [items],
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  function resetInputs() {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function addFiles(fileList: FileList | null) {
    if (
      !fileList?.length ||
      busyRef.current ||
      finished
    ) {
      return;
    }

    busyRef.current = true;
    setIsPreparing(true);
    setError("");
    setMessage("Preparando fotos para envío rápido...");

    const incoming = Array.from(fileList);

    try {
      if (itemsRef.current.length + incoming.length > MAX_FILES) {
        throw new Error(
          `Máximo ${MAX_FILES} archivos por sesión.`,
        );
      }

      const accepted: MobileFileItem[] = [];

      try {
        for (const file of incoming) {
          const extension = extensionOf(file);

          if (!ALLOWED_EXTENSIONS.includes(extension)) {
            throw new Error(
              `Archivo no permitido: ${file.name}`,
            );
          }

          if (
            file.size <= 0 ||
            file.size > MAX_FILE_BYTES
          ) {
            throw new Error(
              `${file.name} supera el límite de 15 MB o está vacío.`,
            );
          }

          const optimized = await optimizeImage(file);

          if (optimized.size > MAX_FILE_BYTES) {
            throw new Error(
              `${file.name} supera el límite permitido.`,
            );
          }

          accepted.push({
            key: makeKey(),
            file: optimized,
            previewUrl:
              optimized.type.startsWith("image/") &&
              !["heic", "heif"].includes(extensionOf(optimized))
                ? URL.createObjectURL(optimized)
                : undefined,
          });
        }

        const newTotal =
          itemsRef.current.reduce(
            (sum, item) => sum + item.file.size,
            0,
          ) +
          accepted.reduce(
            (sum, item) => sum + item.file.size,
            0,
          );

        if (newTotal > MAX_TOTAL_BYTES) {
          throw new Error(
            "El tamaño total supera el máximo de 80 MB.",
          );
        }

        itemsRef.current = [
          ...itemsRef.current,
          ...accepted,
        ];

        setItems(itemsRef.current);

        const originalBytes = incoming.reduce(
          (sum, file) => sum + file.size,
          0,
        );

        const optimizedBytes = accepted.reduce(
          (sum, item) => sum + item.file.size,
          0,
        );

        setMessage(
          optimizedBytes < originalBytes
            ? `Fotos optimizadas: ${formatBytes(originalBytes)} → ${formatBytes(optimizedBytes)}.`
            : "Documentos preparados para enviar.",
        );
      } catch (caught) {
        accepted.forEach((item) => {
          if (item.previewUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
        });

        throw caught;
      }
    } catch (caught) {
      setMessage("");

      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron preparar los documentos.",
      );
    } finally {
      resetInputs();
      setIsPreparing(false);
      busyRef.current = false;
    }
  }

  function removeFile(key: string) {
    if (busyRef.current) return;

    const found = itemsRef.current.find(
      (item) => item.key === key,
    );

    if (found?.previewUrl) {
      URL.revokeObjectURL(found.previewUrl);
    }

    itemsRef.current = itemsRef.current.filter(
      (item) => item.key !== key,
    );

    setItems(itemsRef.current);
    setError("");
    setMessage("");
  }

  function clearAll() {
    if (busyRef.current) return;

    itemsRef.current.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    itemsRef.current = [];
    setItems([]);

    setError("");
    setMessage("");

    resetInputs();
  }

  async function uploadDocuments() {
    if (busyRef.current || finished) return;

    if (!/^[a-f0-9]{32}$/.test(token)) {
      setError("Sesión QR inválida.");
      return;
    }

    const selected = [...itemsRef.current];

    if (!selected.length) {
      setError("Añade al menos un documento.");
      return;
    }

    busyRef.current = true;
    setIsUploading(true);
    setError("");
    setMessage("Enviando documentos a NEXA...");

    const startedAt = performance.now();

    try {
      const formData = new FormData();

      formData.append("token", token);

      for (const item of selected) {
        formData.append(
          "documents",
          item.file,
          item.file.name,
        );
      }

      const response = await fetch(
        "/api/admin/documents/mobile-session/upload",
        {
          method: "POST",
          body: formData,
          cache: "no-store",
        },
      );

      const rawText = await response.text();

      let data: UploadResponse = {};

      try {
        data = rawText
          ? (JSON.parse(rawText) as UploadResponse)
          : {};
      } catch {
        throw new Error(
          `Respuesta inválida del servidor (${response.status}).`,
        );
      }

      if (
        !response.ok ||
        (!data.ok && !data.success)
      ) {
        throw new Error(
          data.error ||
            `Error al enviar documentos (${response.status}).`,
        );
      }

      const elapsed = Math.round(
        (performance.now() - startedAt) / 1000,
      );

      setUploadSeconds(elapsed);
      setUploadedCount(
        Number(data.uploadedCount || selected.length),
      );

      setFinished(true);

      setMessage(
        "Documentos recibidos. Vuelve al ordenador para continuar.",
      );

      selected.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      itemsRef.current = [];
      setItems([]);
    } catch (caught) {
      setMessage("");

      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudieron enviar los documentos.",
      );
    } finally {
      setIsUploading(false);
      busyRef.current = false;
    }
  }

  const busy = isPreparing || isUploading;

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
            Haz fotos claras del DNI, pasaporte o permiso de conducir.
            Comprueba que todos los números y fechas sean legibles.
          </p>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={busy || finished}
              className="rounded-[24px] bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-500 px-5 py-5 text-base font-black text-white shadow-[0_18px_55px_rgba(249,115,22,0.2)] transition active:scale-[0.99] disabled:opacity-50"
            >
              📷 Hacer foto
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy || finished}
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
            onChange={(event) => {
              void addFiles(event.target.files);
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/*,application/pdf"
            className="hidden"
            onChange={(event) => {
              void addFiles(event.target.files);
            }}
          />

          {isPreparing && (
            <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4 text-sm font-bold text-orange-200">
              Optimizando imágenes...
            </div>
          )}

          {finished && (
            <div className="mt-6 rounded-[24px] border border-emerald-400/20 bg-emerald-500/10 p-5">
              <p className="text-lg font-black text-emerald-300">
                ✓ Documentos enviados
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-white/60">
                {uploadedCount} archivo
                {uploadedCount === 1 ? "" : "s"} recibido
                {uploadedCount === 1 ? "" : "s"}.
                Puedes volver al ordenador.
              </p>

              {uploadSeconds !== null && (
                <p className="mt-3 text-xs font-bold text-emerald-300/70">
                  Tiempo de envío: {uploadSeconds} segundos
                </p>
              )}
            </div>
          )}

          {items.length > 0 && !finished && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/55">
                    Preparados para enviar
                  </p>

                  <p className="mt-1 text-xs font-semibold text-white/35">
                    {items.length} archivo
                    {items.length === 1 ? "" : "s"} ·{" "}
                    {formatBytes(totalBytes)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={busy}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-white/50 disabled:opacity-40"
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
                        alt="Vista previa del documento"
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xs font-black text-white/45">
                        {extensionOf(item.file).toUpperCase()}
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
                      disabled={busy}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-black text-red-300 disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  void uploadDocuments();
                }}
                disabled={busy}
                className="mt-4 w-full rounded-[24px] bg-emerald-500 px-5 py-5 text-base font-black text-white shadow-[0_18px_55px_rgba(16,185,129,0.2)] transition active:scale-[0.99] disabled:opacity-50"
              >
                {isUploading
                  ? "Enviando documentos..."
                  : `Enviar ${items.length} archivo${items.length === 1 ? "" : "s"} a NEXA`}
              </button>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-center text-[11px] font-semibold leading-5 text-white/25">
              Sesión temporal privada de NEXA Rentals.
              Los documentos quedan vinculados a esta operación
              de alquiler.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}