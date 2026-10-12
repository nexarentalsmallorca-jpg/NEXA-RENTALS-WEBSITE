
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ScannerStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "error";

type BarcodeResult = {
  rawValue: string;
};

type BarcodeDetectorInstance = {
  detect(
    source: HTMLVideoElement
  ): Promise<BarcodeResult[]>;
};

type BarcodeDetectorConstructor = {
  new (options: {
    formats: string[];
  }): BarcodeDetectorInstance;
};

type BarcodeWindow = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

const ADMIN_BASE = "/admin-nexa-secret";

function getScooterCode(raw: string): string | null {
  const value = raw.trim();

  if (!value) return null;

  try {
    const url = new URL(value);

    // Only accept QR codes belonging to NEXA.

    const allowedHosts = [
      "nexarentals.es",
      "www.nexarentals.es",
    ];

    if (!allowedHosts.includes(url.hostname)) {
      return null;
    }

    if (url.protocol !== "https:") {
      return null;
    }

    // Public scooter QR format:
    // /en/fleet/SCOOTER-CODE
    // /es/fleet/SCOOTER-CODE

    const segments = url.pathname
      .split("/")
      .filter(Boolean);

    const fleetIndex = segments.indexOf("fleet");

    if (
      fleetIndex < 0 ||
      fleetIndex !== segments.length - 2
    ) {
      return null;
    }

    const code = decodeURIComponent(
      segments[fleetIndex + 1]
    );

    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(code)) {
      return null;
    }

    return code;
  } catch {
    return null;
  }
}

export default function NexaScooterScannerPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef =
    useRef<BarcodeDetectorInstance | null>(null);

  const runningRef = useRef(false);
  const scanningRef = useRef(false);
  const navigatingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const [status, setStatus] =
    useState<ScannerStatus>("idle");

  const [error, setError] = useState("");
  const [lastCode, setLastCode] = useState("");

  const stopScanner = useCallback(() => {
    runningRef.current = false;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    streamRef.current?.getTracks().forEach(
      (track) => track.stop()
    );

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;
    scanningRef.current = false;
  }, []);

  const handleQrResult = useCallback(
    (rawValue: string) => {
      if (navigatingRef.current) return;

      const code = getScooterCode(rawValue);

      if (!code) {
        return;
      }

      navigatingRef.current = true;
      setLastCode(code);

      stopScanner();

      // The private maintenance page and its APIs
      // must independently verify the admin session.
      // A QR code is never an authentication token.

      router.push(
        `${ADMIN_BASE}/maintenance/${encodeURIComponent(
          code
        )}`
      );
    },
    [router, stopScanner]
  );

  const scanFrame = useCallback(async () => {
    if (
      !runningRef.current ||
      navigatingRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const detector = detectorRef.current;

    if (
      !video ||
      !detector ||
      video.readyState < 2
    ) {
      timerRef.current = window.setTimeout(
        scanFrame,
        200
      );
      return;
    }

    if (scanningRef.current) {
      timerRef.current = window.setTimeout(
        scanFrame,
        200
      );
      return;
    }

    scanningRef.current = true;

    try {
      const results = await detector.detect(video);

      if (!runningRef.current) return;

      for (const result of results) {
        const code = getScooterCode(
          result.rawValue
        );

        if (code) {
          handleQrResult(result.rawValue);
          return;
        }
      }
    } catch (err) {
      console.warn(
        "NEXA QR detection error:",
        err
      );
    } finally {
      scanningRef.current = false;
    }

    if (
      runningRef.current &&
      !navigatingRef.current
    ) {
      timerRef.current = window.setTimeout(
        scanFrame,
        200
      );
    }
  }, [handleQrResult]);

  const startScanner = useCallback(async () => {
    if (runningRef.current) return;

    setError("");
    setLastCode("");
    setStatus("starting");

    navigatingRef.current = false;

    try {
      if (
        !window.isSecureContext ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error(
          "Camera access requires HTTPS and a supported browser."
        );
      }

      const BarcodeDetectorAPI = (
        window as BarcodeWindow
      ).BarcodeDetector;

      if (!BarcodeDetectorAPI) {
        throw new Error(
          "This browser does not support the built-in QR scanner. Open NEXA OS in a compatible browser."
        );
      }

      const detector = new BarcodeDetectorAPI({
        formats: ["qr_code"],
      });

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach(
          (track) => track.stop()
        );

        throw new Error(
          "Camera preview is not available."
        );
      }

      video.srcObject = stream;

      await video.play();

      detectorRef.current = detector;
      runningRef.current = true;

      setStatus("scanning");

      void scanFrame();
    } catch (err) {
      stopScanner();

      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start camera."
      );
    }
  }, [scanFrame, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-8 text-white">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={ADMIN_BASE}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← NEXA OS
          </Link>

          <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-300">
            Private scanner
          </span>
        </div>

        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
            NEXA FLEET
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Scan Scooter
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Point your camera at a NEXA scooter QR
            code to open its maintenance record.
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111622]">
          <div className="relative aspect-[3/4] max-h-[520px] w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />

            {status !== "scanning" && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-[#0d121c] px-8 text-center">
                <svg
                  width="68"
                  height="68"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 9V5a1 1 0 0 1 1-1h4" />
                  <path d="M15 4h4a1 1 0 0 1 1 1v4" />
                  <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
                  <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
                  <rect
                    x="8"
                    y="8"
                    width="8"
                    height="8"
                    rx="1"
                  />
                </svg>

                <p className="mt-5 text-base font-semibold">
                  {status === "starting"
                    ? "Starting camera..."
                    : "Camera ready"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Tap the button below to begin.
                </p>
              </div>
            )}

            {status === "scanning" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-[230px] w-[230px] rounded-[25px] border border-orange-400/40 bg-orange-400/[0.03]">
                  <div className="absolute -left-[2px] -top-[2px] h-12 w-12 rounded-tl-[25px] border-l-4 border-t-4 border-orange-400" />
                  <div className="absolute -right-[2px] -top-[2px] h-12 w-12 rounded-tr-[25px] border-r-4 border-t-4 border-orange-400" />
                  <div className="absolute -bottom-[2px] -left-[2px] h-12 w-12 rounded-bl-[25px] border-b-4 border-l-4 border-orange-400" />
                  <div className="absolute -bottom-[2px] -right-[2px] h-12 w-12 rounded-br-[25px] border-b-4 border-r-4 border-orange-400" />

                  <div className="absolute left-5 right-5 top-1/2 h-[2px] bg-orange-400/70 shadow-[0_0_18px_rgba(251,146,60,0.8)]" />
                </div>
              </div>
            )}

            {status === "scanning" && (
              <div className="absolute bottom-5 left-0 right-0 text-center">
                <span className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs font-medium text-white backdrop-blur">
                  Searching for scooter QR...
                </span>
              </div>
            )}
          </div>

          <div className="p-5">
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}

            {lastCode && (
              <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                Scooter detected: {lastCode}
              </div>
            )}

            {status === "scanning" ? (
              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  setStatus("idle");
                }}
                className="min-h-[54px] w-full rounded-2xl border border-white/15 bg-white/10 text-sm font-bold transition hover:bg-white/15"
              >
                Stop Scanner
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void startScanner()}
                disabled={status === "starting"}
                className="min-h-[54px] w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {status === "starting"
                  ? "Starting..."
                  : "Open Camera & Scan"}
              </button>
            )}

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Only NEXA scooter QR codes are accepted.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold">
            How it works
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Scan the QR code attached to a scooter.
            NEXA reads its fleet code and opens
            the corresponding private maintenance
            page automatically.
          </p>
        </div>
      </div>
    </main>
  );
}
