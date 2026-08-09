"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Manrope } from "next/font/google";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const LIVE_VERIFICATION_ORIGIN = "https://www.nexarentals.es";
const QR_SESSION_SECONDS = 10 * 60;

export type IdentityDocumentType = "id" | "passport";

export type ExtractedVehicleClass = {
  category: string;
  validFrom: string;
  validUntil: string;
};

export type ExtractedDocumentData = {
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
  vehicleClasses: ExtractedVehicleClass[];
};

export type DocumentVerificationPayload = {
  identityType: IdentityDocumentType;

  dlFront: File | null;
  dlBack: File | null;

  idFront: File | null;
  idBack: File | null;

  passport: File | null;

  licenceData: ExtractedDocumentData;
  identityData: ExtractedDocumentData | null;

  rawLicenceResult: unknown;
  rawIdentityResult: unknown | null;

  sessionToken?: string;
  bookingId?: string;

  dlFrontPath?: string;
  dlBackPath?: string;
  idFrontPath?: string;
  idBackPath?: string;

  dlFrontName?: string;
  dlBackName?: string;
  idFrontName?: string;
  idBackName?: string;
};

type DocumentVerificationProps = {
  autoStart?: boolean;

  onComplete?: (
    payload: DocumentVerificationPayload
  ) => void;

  onCancel?: () => void;
};

type SessionStatus =
  | "creating"
  | "pending"
  | "scanning"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

type SessionData = {
  success: boolean;

  sessionToken?: string;
  bookingId?: string;

  status?: SessionStatus;

  locale?: string | null;

  identityType?: IdentityDocumentType | null;

  firstName?: string;
  lastName?: string;
  homeAddress?: string;

  dlFrontPath?: string;
  dlBackPath?: string;
  idFrontPath?: string;
  idBackPath?: string;

  dlFrontName?: string;
  dlBackName?: string;
  idFrontName?: string;
  idBackName?: string;

  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  completedAt?: string | null;

  verifyPath?: string;

  errorMessage?: string;
  error?: string;
};

type MobileStage =
  | "intro"
  | "licence"
  | "identity-choice"
  | "id"
  | "passport"
  | "review"
  | "uploading"
  | "error";

type ScannerMode = "licence" | "id";

type BlinkImageDataLike = {
  width: number;
  height: number;
  data: Uint8ClampedArray | ArrayLike<number>;
};

type UploadedDocumentPaths = {
  dlFrontPath: string;
  dlBackPath: string;
  idFrontPath: string;
  idBackPath: string;

  dlFrontName: string;
  dlBackName: string;
  idFrontName: string;
  idBackName: string;
};

const EMPTY_DOCUMENT_DATA: ExtractedDocumentData = {
  firstName: "",
  lastName: "",
  fullName: "",
  dateOfBirth: "",
  dateOfExpiry: "",
  documentNumber: "",
  nationality: "",
  address: "",
  countryCode: "",
  documentType: "",
  vehicleClasses: [],
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function safeParam(
  searchParams: {
    get: (name: string) => string | null;
  },
  key: string
) {
  const value = searchParams.get(key);

  return value && value.trim()
    ? value.trim()
    : "";
}

function cleanOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(
    0,
    Math.floor(totalSeconds)
  );

  const minutes = Math.floor(
    safeSeconds / 60
  );

  const seconds =
    safeSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function textFromResult(value: any): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  const candidates = [
    value?.latin?.value,
    value?.value,
    value?.originalString?.latin?.value,
    value?.originalString?.value,
    value?.description,
    value?.rawString,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function dateFromResult(value: any): string {
  if (!value) {
    return "";
  }

  const candidates = [
    value?.originalString?.latin?.value,
    value?.originalString?.value,
    value?.gregorian?.originalString,
    value?.gregorian?.rawString,
    value?.gregorian?.value,
    value?.latin?.value,
    value?.value,
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate.trim().length > 0
    ) {
      return candidate.trim();
    }
  }

  const year =
    value?.gregorian?.year ??
    value?.year;

  const month =
    value?.gregorian?.month ??
    value?.month;

  const day =
    value?.gregorian?.day ??
    value?.day;

  if (
    Number.isFinite(Number(year)) &&
    Number.isFinite(Number(month)) &&
    Number.isFinite(Number(day))
  ) {
    return [
      String(year).padStart(4, "0"),
      String(month).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");
  }

  return "";
}

function extractVehicleClasses(
  result: any
): ExtractedVehicleClass[] {
  const possibleLists = [
    result?.vehicleClassInfo,
    result?.vehicleClassInfos,
    result?.driverLicenseInfo?.vehicleClassInfo,
    result?.driverLicenseInfo?.vehicleClassInfos,
  ];

  let list: any[] = [];

  for (const candidate of possibleLists) {
    if (Array.isArray(candidate)) {
      list = candidate;
      break;
    }
  }

  return list
    .map((item) => {
      const category =
        textFromResult(item?.vehicleClass) ||
        textFromResult(item?.licenceType) ||
        textFromResult(item?.licenseType) ||
        textFromResult(item?.category);

      return {
        category,

        validFrom: dateFromResult(
          item?.effectiveDate ??
            item?.validFrom ??
            item?.issueDate
        ),

        validUntil: dateFromResult(
          item?.expiryDate ??
            item?.validUntil
        ),
      };
    })
    .filter(
      (item) =>
        item.category.length > 0
    );
}

function extractDocumentData(
  result: any
): ExtractedDocumentData {
  if (!result) {
    return {
      ...EMPTY_DOCUMENT_DATA,
    };
  }

  const documentClassInfo =
    result?.documentClassInfo || {};

  const firstName =
    textFromResult(
      result?.firstName
    );

  const lastName =
    textFromResult(
      result?.lastName
    );

  const fullName =
    textFromResult(
      result?.fullName
    ) ||
    `${firstName} ${lastName}`.trim();

  return {
    firstName,

    lastName,

    fullName,

    dateOfBirth: dateFromResult(
      result?.dateOfBirth
    ),

    dateOfExpiry: dateFromResult(
      result?.dateOfExpiry
    ),

    documentNumber: textFromResult(
      result?.documentNumber
    ),

    nationality: textFromResult(
      result?.nationality
    ),

    address: textFromResult(
      result?.address
    ),

    countryCode: textFromResult(
      documentClassInfo
        ?.isoAlpha2CountryCode
    ),

    documentType:
      textFromResult(
        documentClassInfo?.type
      ) ||
      textFromResult(
        documentClassInfo
          ?.documentType
          ?.id
      ),

    vehicleClasses:
      extractVehicleClasses(
        result
      ),
  };
}

function isImageDataLike(
  value: unknown
): value is BlinkImageDataLike {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as {
      width?: unknown;
      height?: unknown;
      data?: unknown;
    };

  return (
    typeof candidate.width ===
      "number" &&
    typeof candidate.height ===
      "number" &&
    candidate.width > 0 &&
    candidate.height > 0 &&
    candidate.data != null
  );
}

async function imageDataToFile(
  imageDataValue: unknown,
  fileName: string
): Promise<File | null> {
  if (
    !isImageDataLike(
      imageDataValue
    )
  ) {
    return null;
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    imageDataValue.width;

  canvas.height =
    imageDataValue.height;

  const ctx =
    canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const expectedLength =
    imageDataValue.width *
    imageDataValue.height *
    4;

  const rawData =
    imageDataValue.data instanceof
    Uint8ClampedArray
      ? new Uint8ClampedArray(
          imageDataValue.data
        )
      : Uint8ClampedArray.from(
          imageDataValue.data
        );

  if (
    rawData.length !==
    expectedLength
  ) {
    return null;
  }

  const usableImageData =
    new ImageData(
      rawData,
      imageDataValue.width,
      imageDataValue.height
    );

  ctx.putImageData(
    usableImageData,
    0,
    0
  );

  const blob =
    await new Promise<
      Blob | null
    >((resolve) => {
      canvas.toBlob(
        resolve,
        "image/jpeg",
        0.94
      );
    });

  if (!blob) {
    return null;
  }

  return new File(
    [blob],
    fileName,
    {
      type: "image/jpeg",

      lastModified:
        Date.now(),
    }
  );
}

function getSubResultImage(
  result: any,
  index: number
) {
  return (
    result?.subResults?.[
      index
    ]?.documentImage ??
    null
  );
}

/*
 * BlinkID renders its own guidance/reticle over the camera.
 *
 * On the mobile NEXA scanner we want only:
 * - camera
 * - our rectangular frame
 * - our guidance
 *
 * This function keeps the camera/video path visible,
 * while visually suppressing SDK feedback chrome.
 */
function cleanBlinkIdCameraUi(
  instance: any,
  root: HTMLElement
) {
  try {
    const possibleComponents = [
      instance?.cameraManagerComponent,
      instance?.cameraManagerUi,
      instance?.cameraManager?.component,
      instance?.cameraComponent,
    ];

    for (const component of possibleComponents) {
      if (
        component?.feedbackLayerNode instanceof
        HTMLElement
      ) {
        component.feedbackLayerNode.style.opacity =
          "0";

        component.feedbackLayerNode.style.pointerEvents =
          "none";
      }

      if (
        component?.overlayLayerNode instanceof
        HTMLElement
      ) {
        component.overlayLayerNode.style.opacity =
          "0";

        component.overlayLayerNode.style.pointerEvents =
          "none";
      }
    }
  } catch {
    // Fallback below handles SDK DOM if direct nodes are unavailable.
  }

  const video =
    root.querySelector(
      "video"
    ) as HTMLVideoElement | null;

  if (!video) {
    return;
  }

  video.style.position =
    "absolute";

  video.style.inset =
    "0";

  video.style.width =
    "100%";

  video.style.height =
    "100%";

  video.style.maxWidth =
    "none";

  video.style.objectFit =
    "cover";

  video.style.background =
    "#000";

  /*
   * Walk from the camera video up toward our mount.
   * Hide sibling UI nodes at every level.
   *
   * We use opacity rather than display:none so we don't
   * interfere with any SDK processing lifecycle.
   */
  let current:
    HTMLElement | null =
    video;

  while (
    current &&
    current !== root
  ) {
    const parentElement: HTMLElement | null =
      current.parentElement;

    if (!parentElement) {
      break;
    }

    for (
      const sibling of Array.from(
        parentElement.children
      )
    ) {
      if (
        sibling === current ||
        !(sibling instanceof HTMLElement)
      ) {
        continue;
      }

      if (
        sibling.contains(video)
      ) {
        continue;
      }

      sibling.dataset.nexaBlinkidHidden =
        "true";

      sibling.style.opacity =
        "0";

      sibling.style.pointerEvents =
        "none";
    }

    parentElement.style.width =
      "100%";

    parentElement.style.height =
      "100%";

    parentElement.style.maxWidth =
      "none";

    parentElement.style.maxHeight =
      "none";

    current =
      parentElement;
  }

  root.style.position =
    "absolute";

  root.style.inset =
    "0";

  root.style.width =
    "100%";

  root.style.height =
    "100%";

  root.style.overflow =
    "hidden";

  root.style.background =
    "#000";
}

function deriveScannerGuidance(
  frameResult: any,
  mode: ScannerMode,
  side: "front" | "back"
) {
  const analysis =
    frameResult
      ?.inputImageAnalysisResult;

  const quality =
    analysis?.imageQuality ??
    analysis?.quality ??
    {};

  if (
    analysis?.glareDetected === true ||
    analysis?.hasGlare === true ||
    quality?.glareDetected === true ||
    quality?.hasGlare === true
  ) {
    return "Reduce reflections on the document";
  }

  if (
    analysis?.blurDetected === true ||
    analysis?.isBlurred === true ||
    quality?.blurDetected === true ||
    quality?.isBlurred === true
  ) {
    return "Hold your phone steady";
  }

  if (
    analysis?.documentTooFar === true ||
    analysis?.tooFar === true
  ) {
    return "Move the phone closer";
  }

  if (
    analysis?.documentTooClose === true ||
    analysis?.tooClose === true
  ) {
    return "Move the phone slightly further away";
  }

  if (
    analysis?.documentNotFound === true
  ) {
    return "Place the whole document inside the frame";
  }

  const documentName =
    mode === "licence"
      ? "driving licence"
      : "ID card";

  return side === "front"
    ? `Place the front of your ${documentName} inside the frame`
    : `Place the back of your ${documentName} inside the frame`;
}

/* -------------------------------------------------------------------------- */
/*                                SMALL UI                                    */
/* -------------------------------------------------------------------------- */

function Spinner({
  light = false,
}: {
  light?: boolean;
}) {
  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 0.85,
        repeat: Infinity,
        ease: "linear",
      }}
      className={[
        "h-8 w-8 rounded-full border-[3px]",

        light
          ? "border-white/20 border-t-white"
          : "border-black/10 border-t-black",
      ].join(" ")}
    />
  );
}

function BookingStep({
  number,
  label,
  mobileLabel,
  active,
  complete,
}: {
  number: number;
  label: string;
  mobileLabel?: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-extrabold transition-all duration-300 sm:h-8 sm:w-8 sm:text-[11px]",

          complete
            ? "border-black bg-black text-white"
            : active
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white text-black/28",
        ].join(" ")}
      >
        {complete
          ? "✓"
          : number}
      </div>

      <div
        className={[
          "min-w-0 truncate text-[8px] font-extrabold uppercase tracking-[0.06em] sm:text-[10px] sm:tracking-[0.13em]",

          active ||
          complete
            ? "text-black"
            : "text-black/28",
        ].join(" ")}
      >
        <span className="sm:hidden">
          {mobileLabel ||
            label}
        </span>

        <span className="hidden sm:inline">
          {label}
        </span>
      </div>
    </div>
  );
}

function CheckoutProgress({
  complete = false,
}: {
  complete?: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 items-center overflow-hidden">
      <BookingStep
        number={1}
        label="Validate documents"
        mobileLabel="Validate"
        active={!complete}
        complete={complete}
      />

      <div className="mx-1.5 h-px min-w-2 flex-1 bg-black/10 sm:mx-3 sm:min-w-5" />

      <BookingStep
        number={2}
        label="Your details"
        mobileLabel="Details"
      />

      <div className="mx-1.5 h-px min-w-2 flex-1 bg-black/10 sm:mx-3 sm:min-w-5" />

      <BookingStep
        number={3}
        label="Payment"
      />
    </div>
  );
}

function CountdownRing({
  secondsLeft,
}: {
  secondsLeft: number;
}) {
  const radius = 38;

  const circumference =
    2 *
    Math.PI *
    radius;

  const progress =
    Math.max(
      0,
      Math.min(
        1,
        secondsLeft /
          QR_SESSION_SECONDS
      )
    );

  const offset =
    circumference *
    (1 - progress);

  return (
    <div className="relative h-[94px] w-[94px] shrink-0">
      <svg
        viewBox="0 0 94 94"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <defs>
          <linearGradient
            id="nexaTimerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor="#7638ff"
            />

            <stop
              offset="45%"
              stopColor="#168bff"
            />

            <stop
              offset="100%"
              stopColor="#ff7a00"
            />
          </linearGradient>
        </defs>

        <circle
          cx="47"
          cy="47"
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="5"
        />

        <circle
          cx="47"
          cy="47"
          r={radius}
          fill="none"
          stroke="url(#nexaTimerGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[15px] font-extrabold tracking-[-0.04em] text-black">
          {formatCountdown(
            secondsLeft
          )}
        </div>

        <div className="mt-0.5 text-[7px] font-extrabold uppercase tracking-[0.14em] text-black/35">
          remaining
        </div>
      </div>
    </div>
  );
}

function AnimatedQrFrame({
  verificationUrl,
}: {
  verificationUrl: string;
}) {
  return (
    <div className="relative mx-auto h-[266px] w-[266px] overflow-hidden rounded-[26px] p-[2px] shadow-[0_22px_70px_rgba(0,0,0,0.13)]">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "conic-gradient(from 0deg, #7638ff 0deg, #168bff 105deg, #ff7a00 215deg, #7638ff 360deg)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[24px] bg-white p-[18px]">
        <QRCodeSVG
          value={
            verificationUrl
          }
          size={224}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
          marginSize={1}
          title="NEXA Rentals document verification"
        />
      </div>
    </div>
  );
}

function StatusDot({
  connected,
}: {
  connected: boolean;
}) {
  return (
    <motion.div
      animate={{
        opacity: [
          0.35,
          1,
          0.35,
        ],

        scale: [
          0.9,
          1.08,
          0.9,
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
      className={[
        "h-2.5 w-2.5 rounded-full",

        connected
          ? "bg-[#ff7a00]"
          : "bg-black",
      ].join(" ")}
    />
  );
}

function DocumentReadyLine({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.055] text-[12px] font-extrabold text-black">
        ✓
      </div>

      <span className="text-sm font-bold text-black/65">
        {text}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         FULLSCREEN SCANNER UI                              */
/* -------------------------------------------------------------------------- */

function ScannerDocumentAnimation({
  mode,
  side,
}: {
  mode: ScannerMode;
  side:
    | "front"
    | "back";
}) {
  return (
    <div
      className="relative h-[68px] w-[110px]"
      style={{
        perspective:
          "800px",
      }}
    >
      <motion.div
        animate={{
          rotateY:
            side ===
            "front"
              ? 0
              : 180,
        }}
        transition={{
          duration:
            0.58,

          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="relative h-full w-full"
        style={{
          transformStyle:
            "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 rounded-[9px] border border-white/20 bg-white p-2.5 text-black shadow-[0_15px_40px_rgba(0,0,0,0.45)]"
          style={{
            backfaceVisibility:
              "hidden",
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-7 rounded-full bg-black/10" />

              <div className="text-[6px] font-extrabold uppercase tracking-[0.13em] text-black/35">
                Front
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="h-6 w-5 rounded-[3px] bg-black/10" />

              <div className="flex-1 space-y-1">
                <div className="h-1 w-full rounded-full bg-black/10" />

                <div className="h-1 w-[72%] rounded-full bg-black/10" />

                <div className="h-1 w-[50%] rounded-full bg-black/10" />
              </div>
            </div>

            <div className="text-[6px] font-extrabold uppercase tracking-[0.08em]">
              {mode ===
              "licence"
                ? "Driving Licence"
                : "ID Card"}
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-[9px] border border-white/15 bg-[#1b1b1d] p-2.5 text-white shadow-[0_15px_40px_rgba(0,0,0,0.45)]"
          style={{
            backfaceVisibility:
              "hidden",

            transform:
              "rotateY(180deg)",
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-1.5 w-8 rounded-full bg-white/15" />

              <div className="text-[6px] font-extrabold uppercase tracking-[0.13em] text-white/40">
                Back
              </div>
            </div>

            <div className="space-y-1">
              <div className="h-1 w-full rounded-full bg-white/15" />

              <div className="h-1 w-[80%] rounded-full bg-white/15" />

              <div className="h-1 w-[55%] rounded-full bg-white/15" />
            </div>

            <div className="flex gap-[2px]">
              {Array.from({
                length: 12,
              }).map(
                (_, index) => (
                  <div
                    key={
                      index
                    }
                    className="h-3 flex-1 bg-white/10"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FullscreenScanner({
  mountRef,
  mode,
  side,
  guidance,
  onClose,
}: {
  mountRef:
    React.RefObject<HTMLDivElement | null>;

  mode:
    ScannerMode;

  side:
    | "front"
    | "back";

  guidance:
    string;

  onClose:
    () => void;
}) {
  const label =
    mode === "licence"
      ? "DRIVING LICENCE"
      : "ID CARD";

  const sideLabel =
    side === "front"
      ? "Front side"
      : "Back side";

  return (
    <div
      className={`${manrope.className} fixed inset-0 z-[2147483646] overflow-hidden bg-black text-white`}
    >
      {/* BlinkID camera lives underneath our interface */}
      <div
        ref={
          mountRef
        }
        id="nexa-fullscreen-blinkid-camera"
        className="absolute inset-0 h-full w-full overflow-hidden bg-black"
      />

      {/* Black camera mask + transparent document window */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-1/2 top-[46%] aspect-[1.58/1] w-[calc(100%-44px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border-[2px] border-white/75 shadow-[0_0_0_9999px_rgba(0,0,0,0.92),0_0_44px_rgba(255,255,255,0.08)]">
          <motion.div
            animate={{
              opacity: [
                0.45,
                1,
                0.45,
              ],
            }}
            transition={{
              duration:
                1.8,

              repeat:
                Infinity,

              ease:
                "easeInOut",
            }}
            className="absolute -inset-[2px] rounded-[22px] border border-[#7d55ff]/75"
          />

          {/* Corners */}
          <div className="absolute -left-[3px] -top-[3px] h-8 w-8 rounded-tl-[22px] border-l-[4px] border-t-[4px] border-white" />

          <div className="absolute -right-[3px] -top-[3px] h-8 w-8 rounded-tr-[22px] border-r-[4px] border-t-[4px] border-white" />

          <div className="absolute -bottom-[3px] -left-[3px] h-8 w-8 rounded-bl-[22px] border-b-[4px] border-l-[4px] border-white" />

          <div className="absolute -bottom-[3px] -right-[3px] h-8 w-8 rounded-br-[22px] border-b-[4px] border-r-[4px] border-white" />

          {/* Scan line */}
          <motion.div
            initial={{
              top:
                "12%",
            }}
            animate={{
              top: [
                "12%",
                "86%",
                "12%",
              ],
            }}
            transition={{
              duration:
                2.5,

              repeat:
                Infinity,

              ease:
                "easeInOut",
            }}
            className="absolute left-[7%] right-[7%] h-px bg-[linear-gradient(90deg,transparent,#66b5ff,#8c5cff,#ff8a35,transparent)] shadow-[0_0_12px_rgba(84,156,255,0.9)]"
          />
        </div>
      </div>

      {/* Minimal top information */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-5 pb-14 pt-[max(22px,env(safe-area-inset-top))]">
        <div className="mx-auto max-w-[480px] text-center">
          <motion.div
            key={
              `${mode}-${side}-${guidance}`
            }
            initial={{
              opacity:
                0,

              y:
                -5,
            }}
            animate={{
              opacity:
                1,

              y:
                0,
            }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/45">
              {label}
            </div>

            <div className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.045em] text-white">
              Scan the{" "}
              {side ===
              "front"
                ? "front"
                : "back"}{" "}
              side
            </div>

            <div className="mx-auto mt-2 max-w-[310px] text-[13px] font-semibold leading-5 text-white/65">
              {guidance}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={
          onClose
        }
        aria-label="Close scanner"
        className="absolute right-4 top-[max(18px,env(safe-area-inset-top))] z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/45 text-[23px] font-light leading-none text-white backdrop-blur-xl active:scale-[0.94]"
      >
        ×
      </button>

      {/* Bottom side indicator */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 pb-[max(28px,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center">
          <ScannerDocumentAnimation
            mode={
              mode
            }
            side={
              side
            }
          />

          <motion.div
            key={
              side
            }
            initial={{
              opacity:
                0,

              y:
                4,
            }}
            animate={{
              opacity:
                1,

              y:
                0,
            }}
            className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.19em] text-white/65"
          >
            {sideLabel}
          </motion.div>

          <div className="mt-4 flex items-center gap-2">
            <div
              className={[
                "h-1.5 rounded-full transition-all duration-300",

                side ===
                "front"
                  ? "w-7 bg-white"
                  : "w-2 bg-white/25",
              ].join(" ")}
            />

            <div
              className={[
                "h-1.5 rounded-full transition-all duration-300",

                side ===
                "back"
                  ? "w-7 bg-white"
                  : "w-2 bg-white/25",
              ].join(" ")}
            />
          </div>

          {side ===
          "back" ? (
            <motion.div
              initial={{
                opacity:
                  0,

                y:
                  8,
              }}
              animate={{
                opacity:
                  1,

                y:
                  0,
              }}
              className="mt-3 text-[11px] font-semibold text-white/45"
            >
              Front captured ✓
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function DocumentVerification({
  autoStart = true,
  onComplete,
  onCancel,
}: DocumentVerificationProps) {
  const locale =
    useLocale();

  const searchParams =
    useSearchParams();

  const creationStartedRef =
    useRef(false);

  const completionHandledRef =
    useRef(false);

  const pollTimerRef =
    useRef<
      number | null
    >(null);

  const countdownTimerRef =
    useRef<
      number | null
    >(null);

  const countdownDeadlineRef =
    useRef<number>(0);

  const expiryHandledRef =
    useRef(false);

  const mobileAutoScrollRef =
    useRef(false);

  const mobileScannerMountRef =
    useRef<
      HTMLDivElement | null
    >(null);

  const mobileScannerRef =
    useRef<any>(null);

  const mobileScannerStartingRef =
    useRef(false);

  const mobileResultHandledRef =
    useRef(false);

  const mobileChromeObserverRef =
    useRef<
      MutationObserver | null
    >(null);

  const mobileGuidanceTimerRef =
    useRef<
      number | null
    >(null);

  const mobilePreviousSideRef =
    useRef<
      "front" | "back"
    >("front");

  const passportInputRef =
    useRef<
      HTMLInputElement | null
    >(null);

  const rawLicenceResultRef =
    useRef<unknown>(null);

  const rawIdentityResultRef =
    useRef<unknown>(null);

  const [
    isMobile,
    setIsMobile,
  ] =
    useState(false);

  const [
    status,
    setStatus,
  ] =
    useState<SessionStatus>(
      autoStart
        ? "creating"
        : "pending"
    );

  const [
    sessionToken,
    setSessionToken,
  ] =
    useState("");

  const [
    bookingId,
    setBookingId,
  ] =
    useState("");

  const [
    verificationUrl,
    setVerificationUrl,
  ] =
    useState("");

  const [
    secondsLeft,
    setSecondsLeft,
  ] =
    useState(
      QR_SESSION_SECONDS
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    mobileStage,
    setMobileStage,
  ] =
    useState<MobileStage>(
      "intro"
    );

  const [
    mobileScannerMode,
    setMobileScannerMode,
  ] =
    useState<ScannerMode>(
      "licence"
    );

  const [
    mobileCurrentSide,
    setMobileCurrentSide,
  ] =
    useState<
      "front" | "back"
    >(
      "front"
    );

  const [
    mobileScannerNotice,
    setMobileScannerNotice,
  ] =
    useState("");

  const [
    mobileError,
    setMobileError,
  ] =
    useState("");

  const [
    mobileIdentityType,
    setMobileIdentityType,
  ] =
    useState<
      IdentityDocumentType | null
    >(
      null
    );

  const [
    mobileDlFront,
    setMobileDlFront,
  ] =
    useState<
      File | null
    >(null);

  const [
    mobileDlBack,
    setMobileDlBack,
  ] =
    useState<
      File | null
    >(null);

  const [
    mobileIdFront,
    setMobileIdFront,
  ] =
    useState<
      File | null
    >(null);

  const [
    mobileIdBack,
    setMobileIdBack,
  ] =
    useState<
      File | null
    >(null);

  const [
    mobilePassport,
    setMobilePassport,
  ] =
    useState<
      File | null
    >(null);

  const [
    mobilePassportPreview,
    setMobilePassportPreview,
  ] =
    useState("");

  const [
    mobileLicenceData,
    setMobileLicenceData,
  ] =
    useState<ExtractedDocumentData>({
      ...EMPTY_DOCUMENT_DATA,
    });

  const [
    mobileIdentityData,
    setMobileIdentityData,
  ] =
    useState<
      ExtractedDocumentData | null
    >(null);

  const fleetGroup =
    useMemo(() => {
      return (
        safeParam(
          searchParams,
          "fleetGroup"
        ) ||
        "scooter"
      );
    }, [
      searchParams,
    ]);

  const vehicleName =
    useMemo(() => {
      return (
        safeParam(
          searchParams,
          "vehicleName"
        ) ||
        safeParam(
          searchParams,
          "vehicle"
        ) ||
        "your scooter"
      );
    }, [
      searchParams,
    ]);

  const mobileLicenceCategories =
    useMemo(() => {
      return mobileLicenceData
        .vehicleClasses
        .map(
          (item) =>
            item.category
        )
        .filter(
          Boolean
        )
        .join(", ");
    }, [
      mobileLicenceData,
    ]);

  const mobileIsScanning =
    mobileStage ===
      "licence" ||
    mobileStage ===
      "id";

  /* ------------------------------------------------------------------------ */
  /*                          DEVICE DETECTION                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(max-width: 1023px)"
      );

    const update =
      () => {
        setIsMobile(
          mediaQuery.matches
        );
      };

    update();

    mediaQuery.addEventListener?.(
      "change",
      update
    );

    return () => {
      mediaQuery.removeEventListener?.(
        "change",
        update
      );
    };
  }, []);

  /*
   * Prevent scrolling behind the fullscreen scanner.
   */
  useEffect(() => {
    if (
      !isMobile ||
      !mobileIsScanning ||
      typeof document ===
        "undefined"
    ) {
      return;
    }

    const previousBodyOverflow =
      document.body.style.overflow;

    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    const previousBodyOverscroll =
      document.body.style.overscrollBehavior;

    document.body.style.overflow =
      "hidden";

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overscrollBehavior =
      "none";

    return () => {
      document.body.style.overflow =
        previousBodyOverflow;

      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.overscrollBehavior =
        previousBodyOverscroll;
    };
  }, [
    isMobile,
    mobileIsScanning,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                                TIMERS                                    */
  /* ------------------------------------------------------------------------ */

  const stopPolling =
    useCallback(() => {
      if (
        pollTimerRef.current !==
        null
      ) {
        window.clearInterval(
          pollTimerRef.current
        );

        pollTimerRef.current =
          null;
      }
    }, []);

  const stopCountdown =
    useCallback(() => {
      if (
        countdownTimerRef.current !==
        null
      ) {
        window.clearInterval(
          countdownTimerRef.current
        );

        countdownTimerRef.current =
          null;
      }
    }, []);

  const stopMobileGuidanceTimer =
    useCallback(() => {
      if (
        mobileGuidanceTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          mobileGuidanceTimerRef.current
        );

        mobileGuidanceTimerRef.current =
          null;
      }
    }, []);

  /* ------------------------------------------------------------------------ */
  /*                           MOBILE SCANNER CLEANUP                          */
  /* ------------------------------------------------------------------------ */

  const destroyMobileScanner =
    useCallback(async () => {
      mobileScannerStartingRef.current =
        false;

      mobileChromeObserverRef.current?.disconnect();

      mobileChromeObserverRef.current =
        null;

      stopMobileGuidanceTimer();

      const scanner =
        mobileScannerRef.current;

      mobileScannerRef.current =
        null;

      if (!scanner) {
        return;
      }

      try {
        await scanner.destroy?.();
      } catch {
        // Scanner cleanup must never block checkout.
      }
    }, [
      stopMobileGuidanceTimer,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                           URL / SESSION HELPERS                           */
  /* ------------------------------------------------------------------------ */

  const buildVerificationUrl =
    useCallback(
      (
        path: string
      ) => {
        const configuredOrigin =
          process.env
            .NEXT_PUBLIC_DOCUMENT_VERIFICATION_ORIGIN?.trim();

        if (
          configuredOrigin
        ) {
          return `${cleanOrigin(
            configuredOrigin
          )}${path}`;
        }

        if (
          typeof window ===
          "undefined"
        ) {
          return `${LIVE_VERIFICATION_ORIGIN}${path}`;
        }

        const hostname =
          window.location.hostname.toLowerCase();

        if (
          hostname ===
            "localhost" ||
          hostname ===
            "127.0.0.1"
        ) {
          return `${LIVE_VERIFICATION_ORIGIN}${path}`;
        }

        return `${cleanOrigin(
          window.location.origin
        )}${path}`;
      },
      []
    );

  const updateSession =
    useCallback(
      async (
        body: Record<
          string,
          unknown
        >
      ) => {
        if (
          !sessionToken
        ) {
          throw new Error(
            "Verification session is missing."
          );
        }

        const response =
          await fetch(
            "/api/document-verification/session",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  sessionToken,
                  ...body,
                }),
            }
          );

        const data =
          (await response.json()) as SessionData;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Could not update verification session."
          );
        }

        return data;
      },
      [
        sessionToken,
      ]
    );

  const cancelRemoteSession =
    useCallback(
      async (
        token: string
      ) => {
        if (!token) {
          return;
        }

        try {
          await fetch(
            "/api/document-verification/session",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  sessionToken:
                    token,

                  action:
                    "cancel",
                }),
            }
          );
        } catch {
          // Do not block navigation because of cleanup.
        }
      },
      []
    );

  /* ------------------------------------------------------------------------ */
  /*                           SESSION EXPIRATION                              */
  /* ------------------------------------------------------------------------ */

  const expireCurrentSession =
    useCallback(async () => {
      if (
        expiryHandledRef.current
      ) {
        return;
      }

      expiryHandledRef.current =
        true;

      stopPolling();
      stopCountdown();

      await destroyMobileScanner();

      setStatus(
        "expired"
      );

      setError(
        "This secure verification session has expired. Generate a new session to continue."
      );

      if (
        sessionToken
      ) {
        await cancelRemoteSession(
          sessionToken
        );
      }
    }, [
      sessionToken,
      stopPolling,
      stopCountdown,
      destroyMobileScanner,
      cancelRemoteSession,
    ]);

  const startCountdown =
    useCallback(() => {
      stopCountdown();

      expiryHandledRef.current =
        false;

      countdownDeadlineRef.current =
        Date.now() +
        QR_SESSION_SECONDS *
          1000;

      setSecondsLeft(
        QR_SESSION_SECONDS
      );

      countdownTimerRef.current =
        window.setInterval(
          () => {
            const remaining =
              Math.max(
                0,
                Math.ceil(
                  (
                    countdownDeadlineRef.current -
                    Date.now()
                  ) /
                    1000
                )
              );

            setSecondsLeft(
              remaining
            );

            if (
              remaining <=
              0
            ) {
              void expireCurrentSession();
            }
          },
          1000
        );
    }, [
      stopCountdown,
      expireCurrentSession,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                           CREATE VERIFICATION                             */
  /* ------------------------------------------------------------------------ */

  const createSession =
    useCallback(async () => {
      try {
        stopPolling();
        stopCountdown();

        await destroyMobileScanner();

        setError(
          ""
        );

        setMobileError(
          ""
        );

        setStatus(
          "creating"
        );

        setVerificationUrl(
          ""
        );

        setSecondsLeft(
          QR_SESSION_SECONDS
        );

        completionHandledRef.current =
          false;

        expiryHandledRef.current =
          false;

        const response =
          await fetch(
            "/api/document-verification/session",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  locale,
                  fleetGroup,
                  vehicleName,
                }),
            }
          );

        const data =
          (await response.json()) as SessionData;

        if (
          !response.ok ||
          !data.success ||
          !data.sessionToken ||
          !data.bookingId ||
          !data.verifyPath
        ) {
          throw new Error(
            data.error ||
              "Could not create verification session."
          );
        }

        setSessionToken(
          data.sessionToken
        );

        setBookingId(
          data.bookingId
        );

        setVerificationUrl(
          buildVerificationUrl(
            data.verifyPath
          )
        );

        setStatus(
          "pending"
        );

        startCountdown();
      } catch (
        createError: any
      ) {
        console.error(
          "CREATE VERIFICATION SESSION ERROR:",
          createError
        );

        setError(
          createError?.message ||
            "Could not create verification session."
        );

        setStatus(
          "failed"
        );
      }
    }, [
      locale,
      fleetGroup,
      vehicleName,
      buildVerificationUrl,
      startCountdown,
      stopPolling,
      stopCountdown,
      destroyMobileScanner,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                          DESKTOP COMPLETION                               */
  /* ------------------------------------------------------------------------ */

  const finishDesktopVerification =
    useCallback(
      (
        data: SessionData
      ) => {
        if (
          completionHandledRef.current
        ) {
          return;
        }

        completionHandledRef.current =
          true;

        stopPolling();
        stopCountdown();

        setStatus(
          "completed"
        );

        const licenceData: ExtractedDocumentData =
          {
            ...EMPTY_DOCUMENT_DATA,

            firstName:
              data.firstName ||
              "",

            lastName:
              data.lastName ||
              "",

            fullName:
              [
                data.firstName,
                data.lastName,
              ]
                .filter(
                  Boolean
                )
                .join(" "),

            address:
              data.homeAddress ||
              "",
          };

        const identityType: IdentityDocumentType =
          data.identityType ===
          "passport"
            ? "passport"
            : "id";

        const payload: DocumentVerificationPayload =
          {
            identityType,

            dlFront:
              null,

            dlBack:
              null,

            idFront:
              null,

            idBack:
              null,

            passport:
              null,

            licenceData,

            identityData:
              null,

            rawLicenceResult:
              null,

            rawIdentityResult:
              null,

            sessionToken:
              data.sessionToken ||
              sessionToken,

            bookingId:
              data.bookingId ||
              bookingId,

            dlFrontPath:
              data.dlFrontPath ||
              "",

            dlBackPath:
              data.dlBackPath ||
              "",

            idFrontPath:
              data.idFrontPath ||
              "",

            idBackPath:
              data.idBackPath ||
              "",

            dlFrontName:
              data.dlFrontName ||
              "",

            dlBackName:
              data.dlBackName ||
              "",

            idFrontName:
              data.idFrontName ||
              "",

            idBackName:
              data.idBackName ||
              "",
          };

        window.setTimeout(
          () => {
            onComplete?.(
              payload
            );
          },
          1100
        );
      },
      [
        bookingId,
        sessionToken,
        onComplete,
        stopPolling,
        stopCountdown,
      ]
    );

  const checkSession =
    useCallback(async () => {
      if (
        !sessionToken
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `/api/document-verification/session?session=${encodeURIComponent(
              sessionToken
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as SessionData;

        if (
          response.status ===
            410 ||
          data.status ===
            "expired"
        ) {
          await expireCurrentSession();

          return;
        }

        if (
          !response.ok ||
          !data.success
        ) {
          return;
        }

        if (
          data.status ===
          "scanning"
        ) {
          setStatus(
            "scanning"
          );

          return;
        }

        if (
          data.status ===
          "completed"
        ) {
          finishDesktopVerification(
            data
          );

          return;
        }

        if (
          data.status ===
          "failed"
        ) {
          stopPolling();
          stopCountdown();

          setStatus(
            "failed"
          );

          setError(
            data.errorMessage ||
              "Document verification failed."
          );

          return;
        }

        if (
          data.status ===
          "cancelled"
        ) {
          stopPolling();
          stopCountdown();

          setStatus(
            "cancelled"
          );

          setError(
            "Document verification was cancelled."
          );

          return;
        }

        setStatus(
          "pending"
        );
      } catch {
        // Temporary network problems should not destroy the session.
      }
    }, [
      sessionToken,
      finishDesktopVerification,
      expireCurrentSession,
      stopPolling,
      stopCountdown,
    ]);

  /* ------------------------------------------------------------------------ */
  /*                         CREATE SESSION ON LOAD                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !autoStart ||
      creationStartedRef.current
    ) {
      return;
    }

    creationStartedRef.current =
      true;

    void createSession();
  }, [
    autoStart,
    createSession,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                            DESKTOP POLLING                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      isMobile ||
      !sessionToken ||
      status ===
        "completed" ||
      status ===
        "failed" ||
      status ===
        "expired" ||
      status ===
        "cancelled"
    ) {
      return;
    }

    void checkSession();

    pollTimerRef.current =
      window.setInterval(
        () => {
          void checkSession();
        },
        1600
      );

    return () => {
      stopPolling();
    };
  }, [
    isMobile,
    sessionToken,
    status,
    checkSession,
    stopPolling,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                         MOBILE AUTO SCROLL                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !isMobile ||
      mobileAutoScrollRef.current ||
      (
        status !==
          "pending" &&
        status !==
          "scanning"
      )
    ) {
      return;
    }

    mobileAutoScrollRef.current =
      true;

    const timer =
      window.setTimeout(
        () => {
          document
            .getElementById(
              "nexa-document-verification"
            )
            ?.scrollIntoView({
              behavior:
                "smooth",

              block:
                "start",
            });
        },
        260
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    isMobile,
    status,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                       MOBILE SCANNER RESULT                               */
  /* ------------------------------------------------------------------------ */

  const handleMobileScannerResult =
    useCallback(
      async (
        mode: ScannerMode,
        result: any
      ) => {
        if (
          mobileResultHandledRef.current
        ) {
          return;
        }

        mobileResultHandledRef.current =
          true;

        try {
          setMobileScannerNotice(
            "Saving document..."
          );

          const frontImage =
            getSubResultImage(
              result,
              0
            );

          const backImage =
            getSubResultImage(
              result,
              1
            );

          const frontFile =
            await imageDataToFile(
              frontImage,

              mode ===
              "licence"
                ? "driving-licence-front.jpg"
                : "identity-card-front.jpg"
            );

          const backFile =
            await imageDataToFile(
              backImage,

              mode ===
              "licence"
                ? "driving-licence-back.jpg"
                : "identity-card-back.jpg"
            );

          await destroyMobileScanner();

          if (
            !frontFile
          ) {
            throw new Error(
              "The scanner could not save the front side. Please scan again."
            );
          }

          if (
            !backFile
          ) {
            throw new Error(
              "The scanner did not capture the back side. Please scan again."
            );
          }

          const extracted =
            extractDocumentData(
              result
            );

          if (
            mode ===
            "licence"
          ) {
            rawLicenceResultRef.current =
              result;

            setMobileDlFront(
              frontFile
            );

            setMobileDlBack(
              backFile
            );

            setMobileLicenceData(
              extracted
            );

            setMobileCurrentSide(
              "front"
            );

            mobilePreviousSideRef.current =
              "front";

            setMobileScannerNotice(
              ""
            );

            setMobileStage(
              "identity-choice"
            );

            return;
          }

          rawIdentityResultRef.current =
            result;

          setMobileIdFront(
            frontFile
          );

          setMobileIdBack(
            backFile
          );

          setMobileIdentityData(
            extracted
          );

          setMobileCurrentSide(
            "front"
          );

          mobilePreviousSideRef.current =
            "front";

          setMobileScannerNotice(
            ""
          );

          setMobileStage(
            "review"
          );
        } catch (
          resultError: any
        ) {
          await destroyMobileScanner();

          setMobileError(
            resultError?.message ||
              "The document could not be saved."
          );

          setMobileStage(
            "error"
          );
        }
      },
      [
        destroyMobileScanner,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /*                         START FULLSCREEN BLINKID                          */
  /* ------------------------------------------------------------------------ */

  const startMobileScanner =
    useCallback(
      async (
        mode: ScannerMode
      ) => {
        if (
          mobileScannerStartingRef.current
        ) {
          return;
        }

        const mount =
          mobileScannerMountRef.current;

        if (
          !mount
        ) {
          return;
        }

        const licenseKey =
          process.env
            .NEXT_PUBLIC_BLINKID_LICENSE_KEY;

        if (
          !licenseKey
        ) {
          setMobileError(
            "Document scanner licence is not configured."
          );

          setMobileStage(
            "error"
          );

          return;
        }

        mobileScannerStartingRef.current =
          true;

        mobileResultHandledRef.current =
          false;

        try {
          if (
            typeof window ===
            "undefined"
          ) {
            mobileScannerStartingRef.current =
              false;

            return;
          }

          await destroyMobileScanner();

          mobileScannerStartingRef.current =
            true;

          setStatus(
            "scanning"
          );

          setMobileScannerMode(
            mode
          );

          setMobileCurrentSide(
            "front"
          );

          mobilePreviousSideRef.current =
            "front";

          setMobileScannerNotice(
            mode ===
              "licence"
              ? "Place the front of your driving licence inside the frame"
              : "Place the front of your ID card inside the frame"
          );

          mount.innerHTML =
            "";

          await updateSession({
            action:
              "start",
          });

          const {
            createBlinkId,
          } =
            await import(
              "@microblink/blinkid"
            );

          /*
           * Keep resources at website root.
           *
           * Correct:
           * https://www.nexarentals.es/resources/...
           */
          const resourcesLocation =
            `${window.location.origin}/`;

          const blinkId: any =
            await createBlinkId({
              licenseKey,

              resourcesLocation,

              targetNode:
                mount,

              feedbackUiOptions: {
                showOnboardingGuide:
                  false,
              },

              cameraManagerUiOptions: {
                showMirrorCameraButton:
                  false,
              },

              scanningSettings: {
                documentCaptureModule:
                  {
                    documentImageReturnEnabled:
                      true,

                    secondSideWithNoExtractableDataSkipped:
                      false,

                    imageWithBlurRejected:
                      true,

                    imageWithGlareRejected:
                      true,

                    inputImageSelectionStrategy:
                      "optimize-for-quality",
                  },
              },
            });

          mobileScannerRef.current =
            blinkId;

          mobileScannerStartingRef.current =
            false;

          /*
           * Remove BlinkID's default visual chrome.
           * Recognition remains controlled by BlinkID.
           */
          cleanBlinkIdCameraUi(
            blinkId,
            mount
          );

          window.setTimeout(
            () => {
              cleanBlinkIdCameraUi(
                blinkId,
                mount
              );
            },
            150
          );

          window.setTimeout(
            () => {
              cleanBlinkIdCameraUi(
                blinkId,
                mount
              );
            },
            600
          );

          const observer =
            new MutationObserver(
              () => {
                cleanBlinkIdCameraUi(
                  blinkId,
                  mount
                );
              }
            );

          observer.observe(
            mount,
            {
              childList:
                true,

              subtree:
                true,
            }
          );

          mobileChromeObserverRef.current =
            observer;

          blinkId.addDocumentClassFilter(
            (
              documentClassInfo: any
            ) => {
              const documentType =
                documentClassInfo
                  ?.type ??
                documentClassInfo
                  ?.documentType
                  ?.id;

              return mode ===
                "licence"
                ? documentType ===
                    "dl"
                : documentType ===
                    "id";
            }
          );

          blinkId.addOnDocumentFilteredCallback(
            () => {
              setMobileScannerNotice(
                mode ===
                  "licence"
                  ? "Please use your driving licence"
                  : "Please use your ID card"
              );
            }
          );

          blinkId.blinkIdUxManager
            .addOnFrameProcessCallback(
              (
                frameResult: any
              ) => {
                const side =
                  frameResult
                    ?.inputImageAnalysisResult
                    ?.scanningSide;

                const nextSide:
                  | "front"
                  | "back" =
                  side ===
                  "second"
                    ? "back"
                    : "front";

                if (
                  nextSide !==
                  mobilePreviousSideRef.current
                ) {
                  mobilePreviousSideRef.current =
                    nextSide;

                  setMobileCurrentSide(
                    nextSide
                  );

                  stopMobileGuidanceTimer();

                  if (
                    nextSide ===
                    "back"
                  ) {
                    setMobileScannerNotice(
                      "Front captured — flip your document"
                    );

                    mobileGuidanceTimerRef.current =
                      window.setTimeout(
                        () => {
                          setMobileScannerNotice(
                            mode ===
                              "licence"
                              ? "Place the back of your driving licence inside the frame"
                              : "Place the back of your ID card inside the frame"
                          );
                        },
                        1350
                      );
                  }
                } else {
                  const guidance =
                    deriveScannerGuidance(
                      frameResult,
                      mode,
                      nextSide
                    );

                  /*
                   * Don't overwrite the special flip message
                   * while it is being displayed.
                   */
                  if (
                    mobileGuidanceTimerRef.current ===
                    null
                  ) {
                    setMobileScannerNotice(
                      guidance
                    );
                  }
                }
              }
            );

          blinkId.addOnErrorCallback(
            (
              scannerError: any
            ) => {
              const readable =
                typeof scannerError ===
                  "string"
                  ? scannerError
                  : scannerError
                      ?.message ||
                    "";

              if (
                readable
              ) {
                setMobileScannerNotice(
                  readable
                );
              }
            }
          );

          blinkId.addOnResultCallback(
            (
              result: any
            ) => {
              void handleMobileScannerResult(
                mode,
                result
              );
            }
          );
        } catch (
          scannerError: any
        ) {
          mobileScannerStartingRef.current =
            false;

          await destroyMobileScanner();

          console.error(
            "MOBILE BLINKID START ERROR:",
            scannerError
          );

          setMobileError(
            scannerError?.message ||
              "The camera scanner could not start."
          );

          setMobileStage(
            "error"
          );
        }
      },
      [
        destroyMobileScanner,
        updateSession,
        handleMobileScannerResult,
        stopMobileGuidanceTimer,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /*                     OPEN SCANNER WHEN STAGE CHANGES                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !isMobile
    ) {
      return;
    }

    if (
      mobileStage !==
        "licence" &&
      mobileStage !==
        "id"
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void startMobileScanner(
            mobileStage ===
              "licence"
              ? "licence"
              : "id"
          );
        },
        180
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    isMobile,
    mobileStage,
    startMobileScanner,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                            MOBILE ACTIONS                                 */
  /* ------------------------------------------------------------------------ */

  function startMobileLicence() {
    if (
      !sessionToken ||
      !bookingId
    ) {
      setMobileError(
        "The secure session is still preparing. Please wait a moment and try again."
      );

      setMobileStage(
        "error"
      );

      return;
    }

    setMobileError(
      ""
    );

    setMobileStage(
      "licence"
    );
  }

  async function closeMobileScanner() {
    await destroyMobileScanner();

    setMobileScannerNotice(
      ""
    );

    setMobileCurrentSide(
      "front"
    );

    mobilePreviousSideRef.current =
      "front";

    /*
     * If the licence is already captured,
     * return to identity selection.
     */
    if (
      mobileDlFront &&
      mobileDlBack
    ) {
      setMobileStage(
        "identity-choice"
      );

      return;
    }

    setMobileStage(
      "intro"
    );

    setStatus(
      "pending"
    );
  }

  function chooseMobileIdCard() {
    setMobileIdentityType(
      "id"
    );

    setMobilePassport(
      null
    );

    rawIdentityResultRef.current =
      null;

    if (
      mobilePassportPreview
    ) {
      URL.revokeObjectURL(
        mobilePassportPreview
      );

      setMobilePassportPreview(
        ""
      );
    }

    setMobileStage(
      "id"
    );
  }

  function chooseMobilePassport() {
    setMobileIdentityType(
      "passport"
    );

    setMobileIdFront(
      null
    );

    setMobileIdBack(
      null
    );

    setMobileIdentityData(
      null
    );

    rawIdentityResultRef.current =
      null;

    setMobileStage(
      "passport"
    );
  }

  function openPassportCamera() {
    passportInputRef.current?.click();
  }

  async function handlePassportPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[
        0
      ] ??
      null;

    if (
      !selected
    ) {
      return;
    }

    if (
      !selected.type.startsWith(
        "image/"
      )
    ) {
      setMobileError(
        "Please take a clear photo of the passport photo page."
      );

      setMobileStage(
        "error"
      );

      return;
    }

    if (
      mobilePassportPreview
    ) {
      URL.revokeObjectURL(
        mobilePassportPreview
      );
    }

    setMobilePassport(
      selected
    );

    setMobilePassportPreview(
      URL.createObjectURL(
        selected
      )
    );

    setMobileStage(
      "review"
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                           UPLOAD MOBILE DOCS                              */
  /* ------------------------------------------------------------------------ */

  async function uploadMobileDocuments(): Promise<UploadedDocumentPaths> {
    if (
      !bookingId
    ) {
      throw new Error(
        "Booking verification ID is missing."
      );
    }

    if (
      !mobileDlFront ||
      !mobileDlBack
    ) {
      throw new Error(
        "Both sides of the driving licence are required."
      );
    }

    const finalIdFront =
      mobileIdentityType ===
      "passport"
        ? mobilePassport
        : mobileIdFront;

    const finalIdBack =
      mobileIdentityType ===
      "id"
        ? mobileIdBack
        : null;

    if (
      !finalIdFront
    ) {
      throw new Error(
        mobileIdentityType ===
          "passport"
          ? "Passport photo is missing."
          : "ID card front is missing."
      );
    }

    if (
      mobileIdentityType ===
        "id" &&
      !finalIdBack
    ) {
      throw new Error(
        "ID card back is missing."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "bookingId",
      bookingId
    );

    formData.append(
      "dlFront",
      mobileDlFront
    );

    formData.append(
      "dlBack",
      mobileDlBack
    );

    formData.append(
      "idFront",
      finalIdFront
    );

    if (
      finalIdBack
    ) {
      formData.append(
        "idBack",
        finalIdBack
      );
    }

    const response =
      await fetch(
        "/api/stripe/upload-booking-documents",
        {
          method:
            "POST",

          body:
            formData,
        }
      );

    const rawText =
      await response.text();

    let data: any =
      {};

    try {
      data =
        rawText
          ? JSON.parse(
              rawText
            )
          : {};
    } catch {
      throw new Error(
        "Document upload returned an invalid response."
      );
    }

    if (
      !response.ok
    ) {
      throw new Error(
        data?.error ||
          "Document upload failed."
      );
    }

    return {
      dlFrontPath:
        data?.dlFrontPath ||
        "",

      dlBackPath:
        data?.dlBackPath ||
        "",

      idFrontPath:
        data?.idFrontPath ||
        "",

      idBackPath:
        data?.idBackPath ||
        "",

      dlFrontName:
        data?.dlFrontName ||
        mobileDlFront.name,

      dlBackName:
        data?.dlBackName ||
        mobileDlBack.name,

      idFrontName:
        data?.idFrontName ||
        finalIdFront.name,

      idBackName:
        data?.idBackName ||
        finalIdBack?.name ||
        "",
    };
  }

  /* ------------------------------------------------------------------------ */
  /*                          COMPLETE MOBILE                                  */
  /* ------------------------------------------------------------------------ */

  async function completeMobileVerification() {
    if (
      !mobileIdentityType
    ) {
      setMobileError(
        "Please choose your ID card or passport."
      );

      setMobileStage(
        "error"
      );

      return;
    }

    try {
      setMobileError(
        ""
      );

      setMobileStage(
        "uploading"
      );

      const uploaded =
        await uploadMobileDocuments();

      const firstName =
        mobileLicenceData
          .firstName ||
        mobileIdentityData
          ?.firstName ||
        "";

      const lastName =
        mobileLicenceData
          .lastName ||
        mobileIdentityData
          ?.lastName ||
        "";

      const homeAddress =
        mobileIdentityData
          ?.address ||
        mobileLicenceData
          .address ||
        "";

      await updateSession({
        action:
          "complete",

        identityType:
          mobileIdentityType,

        firstName,

        lastName,

        homeAddress,

        licenceData:
          mobileLicenceData,

        identityData:
          mobileIdentityType ===
          "id"
            ? mobileIdentityData
            : null,

        dlFrontPath:
          uploaded.dlFrontPath,

        dlBackPath:
          uploaded.dlBackPath,

        idFrontPath:
          uploaded.idFrontPath,

        idBackPath:
          uploaded.idBackPath,

        dlFrontName:
          uploaded.dlFrontName,

        dlBackName:
          uploaded.dlBackName,

        idFrontName:
          uploaded.idFrontName,

        idBackName:
          uploaded.idBackName,
      });

      await destroyMobileScanner();

      stopCountdown();
      stopPolling();

      setStatus(
        "completed"
      );

      const payload: DocumentVerificationPayload =
        {
          identityType:
            mobileIdentityType,

          dlFront:
            mobileDlFront,

          dlBack:
            mobileDlBack,

          idFront:
            mobileIdentityType ===
            "id"
              ? mobileIdFront
              : null,

          idBack:
            mobileIdentityType ===
            "id"
              ? mobileIdBack
              : null,

          passport:
            mobileIdentityType ===
            "passport"
              ? mobilePassport
              : null,

          licenceData:
            mobileLicenceData,

          identityData:
            mobileIdentityType ===
            "id"
              ? mobileIdentityData
              : null,

          rawLicenceResult:
            rawLicenceResultRef.current,

          rawIdentityResult:
            mobileIdentityType ===
            "id"
              ? rawIdentityResultRef.current
              : null,

          sessionToken,

          bookingId,

          dlFrontPath:
            uploaded.dlFrontPath,

          dlBackPath:
            uploaded.dlBackPath,

          idFrontPath:
            uploaded.idFrontPath,

          idBackPath:
            uploaded.idBackPath,

          dlFrontName:
            uploaded.dlFrontName,

          dlBackName:
            uploaded.dlBackName,

          idFrontName:
            uploaded.idFrontName,

          idBackName:
            uploaded.idBackName,
        };

      window.setTimeout(
        () => {
          onComplete?.(
            payload
          );
        },
        850
      );
    } catch (
      verificationError: any
    ) {
      setMobileError(
        verificationError
          ?.message ||
          "Could not complete document verification."
      );

      setMobileStage(
        "error"
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                              RETRY                                        */
  /* ------------------------------------------------------------------------ */

  function retryMobileFromError() {
    setMobileError(
      ""
    );

    if (
      !mobileDlFront ||
      !mobileDlBack
    ) {
      setMobileStage(
        "licence"
      );

      return;
    }

    if (
      !mobileIdentityType
    ) {
      setMobileStage(
        "identity-choice"
      );

      return;
    }

    if (
      mobileIdentityType ===
        "id" &&
      (
        !mobileIdFront ||
        !mobileIdBack
      )
    ) {
      setMobileStage(
        "id"
      );

      return;
    }

    if (
      mobileIdentityType ===
        "passport" &&
      !mobilePassport
    ) {
      setMobileStage(
        "passport"
      );

      return;
    }

    setMobileStage(
      "review"
    );
  }

  function resetMobileFlow() {
    void destroyMobileScanner();

    setMobileStage(
      "intro"
    );

    setMobileScannerMode(
      "licence"
    );

    setMobileCurrentSide(
      "front"
    );

    setMobileScannerNotice(
      ""
    );

    setMobileError(
      ""
    );

    setMobileIdentityType(
      null
    );

    setMobileDlFront(
      null
    );

    setMobileDlBack(
      null
    );

    setMobileIdFront(
      null
    );

    setMobileIdBack(
      null
    );

    setMobilePassport(
      null
    );

    setMobileLicenceData({
      ...EMPTY_DOCUMENT_DATA,
    });

    setMobileIdentityData(
      null
    );

    rawLicenceResultRef.current =
      null;

    rawIdentityResultRef.current =
      null;

    mobilePreviousSideRef.current =
      "front";

    if (
      mobilePassportPreview
    ) {
      URL.revokeObjectURL(
        mobilePassportPreview
      );

      setMobilePassportPreview(
        ""
      );
    }
  }

  function retrySession() {
    stopPolling();
    stopCountdown();

    resetMobileFlow();

    setSessionToken(
      ""
    );

    setBookingId(
      ""
    );

    setVerificationUrl(
      ""
    );

    setSecondsLeft(
      QR_SESSION_SECONDS
    );

    completionHandledRef.current =
      false;

    expiryHandledRef.current =
      false;

    mobileAutoScrollRef.current =
      false;

    void createSession();
  }

  async function handleCancel() {
    stopPolling();
    stopCountdown();

    await destroyMobileScanner();

    if (
      sessionToken
    ) {
      await cancelRemoteSession(
        sessionToken
      );
    }

    onCancel?.();
  }

  /* ------------------------------------------------------------------------ */
  /*                               CLEANUP                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      stopPolling();
      stopCountdown();
      stopMobileGuidanceTimer();

      mobileChromeObserverRef.current?.disconnect();

      void destroyMobileScanner();
    };
  }, [
    stopPolling,
    stopCountdown,
    stopMobileGuidanceTimer,
    destroyMobileScanner,
  ]);

  useEffect(() => {
    return () => {
      if (
        mobilePassportPreview
      ) {
        URL.revokeObjectURL(
          mobilePassportPreview
        );
      }
    };
  }, [
    mobilePassportPreview,
  ]);

  const phoneConnected =
    status ===
    "scanning";

  const complete =
    status ===
    "completed";

  /* ------------------------------------------------------------------------ */
  /*                       FULLSCREEN SCANNER PORTAL                           */
  /* ------------------------------------------------------------------------ */

  const fullscreenScanner =
    isMobile &&
    mobileIsScanning &&
    typeof document !==
      "undefined"
      ? createPortal(
          <FullscreenScanner
            mountRef={
              mobileScannerMountRef
            }
            mode={
              mobileScannerMode
            }
            side={
              mobileCurrentSide
            }
            guidance={
              mobileScannerNotice ||
              (
                mobileCurrentSide ===
                "front"
                  ? mobileScannerMode ===
                    "licence"
                    ? "Place the front of your driving licence inside the frame"
                    : "Place the front of your ID card inside the frame"
                  : mobileScannerMode ===
                    "licence"
                    ? "Place the back of your driving licence inside the frame"
                    : "Place the back of your ID card inside the frame"
              )
            }
            onClose={() => {
              void closeMobileScanner();
            }}
          />,
          document.body
        )
      : null;

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {fullscreenScanner}

      <section
        id="nexa-document-verification"
        className={`${manrope.className} flex h-full w-full min-w-0 max-w-full scroll-mt-4 flex-col overflow-x-hidden text-[#111] lg:min-h-[590px]`}
      >
        <input
          ref={
            passportInputRef
          }
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={
            handlePassportPhoto
          }
        />

        <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-5">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-black/30">
              Fast pickup
            </div>

            <h2 className="mt-1 text-[27px] font-extrabold leading-[1.08] tracking-[-0.045em] text-black sm:text-[32px] 2xl:text-[36px]">
              Validate your documents
            </h2>

            <p className="mt-2 max-w-[560px] text-sm font-medium leading-6 text-black/45 2xl:text-[15px]">
              Verify your driving licence and your ID card or passport before continuing.
            </p>
          </div>

          {onCancel ? (
            <button
              type="button"
              onClick={() => {
                void handleCancel();
              }}
              className="hidden shrink-0 border border-black/12 bg-white px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black/55 transition hover:border-black hover:bg-black hover:text-white active:scale-[0.97] sm:block"
            >
              Cancel
            </button>
          ) : null}
        </div>

        <div className="mt-5 min-w-0 overflow-hidden border-y border-black/10 py-4 sm:mt-6">
          <CheckoutProgress
            complete={
              complete
            }
          />
        </div>

        <div className="flex min-w-0 max-w-full flex-1 flex-col pt-5">
          {status ===
          "creating" ? (
            <div className="flex min-h-[300px] w-full min-w-0 flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center lg:min-h-[390px]">
              <Spinner />

              <h3 className="mt-5 text-[20px] font-extrabold tracking-[-0.035em] text-black">
                Preparing secure verification
              </h3>

              <p className="mt-2 text-sm font-medium text-black/42">
                Preparing your private document session...
              </p>
            </div>
          ) : null}

          {(status ===
            "pending" ||
            phoneConnected) &&
          verificationUrl ? (
            <>
              {/* DESKTOP ONLY */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="hidden min-w-0 border border-black/10 bg-white px-5 py-5 lg:block lg:px-7 lg:py-6"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="max-w-[520px]">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-black/30">
                      {phoneConnected
                        ? "Phone connected"
                        : "Scan with your phone"}
                    </div>

                    <h3 className="mt-1 text-[20px] font-extrabold tracking-[-0.035em] text-black sm:text-[22px]">
                      {phoneConnected
                        ? "Complete the validation on your phone"
                        : "Keep your documents ready"}
                    </h3>

                    <p className="mt-2 text-sm font-medium leading-6 text-black/50">
                      Keep your{" "}
                      <strong className="font-extrabold text-black">
                        driving licence
                      </strong>{" "}
                      and your{" "}
                      <strong className="font-extrabold text-black">
                        ID card or passport
                      </strong>{" "}
                      in your hand. Scan the QR code below and validate them securely on your phone.
                    </p>
                  </div>

                  <CountdownRing
                    secondsLeft={
                      secondsLeft
                    }
                  />
                </div>

                <div className="mt-6 grid min-w-0 items-center gap-7 md:grid-cols-[292px_minmax(0,1fr)]">
                  <div className="flex min-w-0 justify-center md:justify-start">
                    <AnimatedQrFrame
                      verificationUrl={
                        verificationUrl
                      }
                    />
                  </div>

                  <div className="flex min-h-[250px] min-w-0 flex-col justify-center border-t border-black/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <StatusDot
                        connected={
                          phoneConnected
                        }
                      />

                      <div className="min-w-0">
                        <div className="text-[15px] font-extrabold text-black">
                          {phoneConnected
                            ? "Your phone is connected"
                            : "Waiting for your phone"}
                        </div>

                        <div className="mt-0.5 text-xs font-medium text-black/40">
                          {phoneConnected
                            ? "Continue scanning your documents on your phone."
                            : "Open your phone camera and scan the QR code."}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-black/10 pt-5">
                      <div className="grid gap-3">
                        <DocumentReadyLine
                          text="Driving licence"
                        />

                        <DocumentReadyLine
                          text="ID card or passport"
                        />
                      </div>
                    </div>

                    <div className="mt-6 border-t border-black/10 pt-4">
                      <p className="text-[11px] font-medium leading-5 text-black/36">
                        This secure verification session expires automatically when the timer reaches zero.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* MOBILE PRE-SCANNER FLOW */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="w-full min-w-0 max-w-full lg:hidden"
              >
                {mobileStage ===
                "intro" ? (
                  <div className="w-full min-w-0 overflow-hidden border border-black/10 bg-white px-5 py-6">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-black/30">
                      Ready to validate
                    </div>

                    <h3 className="mt-1 text-[23px] font-extrabold leading-tight tracking-[-0.04em] text-black">
                      Keep your documents ready
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-6 text-black/50">
                      Keep your{" "}
                      <strong className="font-extrabold text-black">
                        driving licence
                      </strong>{" "}
                      and your{" "}
                      <strong className="font-extrabold text-black">
                        ID card or passport
                      </strong>{" "}
                      ready.
                    </p>

                    <motion.button
                      type="button"
                      onClick={
                        startMobileLicence
                      }
                      animate={{
                        y: [
                          0,
                          -3,
                          0,
                        ],

                        scale: [
                          1,
                          1.01,
                          1,
                        ],
                      }}
                      transition={{
                        duration:
                          2.4,

                        repeat:
                          Infinity,

                        ease:
                          "easeInOut",
                      }}
                      className="nexa-mobile-verify-button relative mt-6 flex min-h-[64px] w-full items-center justify-center overflow-hidden rounded-[18px] px-5 text-[14px] font-extrabold uppercase tracking-[0.1em] text-white shadow-[0_18px_48px_rgba(71,75,255,0.24)] active:scale-[0.97]"
                    >
                      <span className="nexa-mobile-verify-button-glow" />

                      <span className="nexa-mobile-verify-button-shine" />

                      <span className="relative z-10 flex items-center gap-2">
                        Validate documents

                        <span className="text-[19px]">
                          →
                        </span>
                      </span>
                    </motion.button>

                    <div className="mt-5 flex min-w-0 items-center justify-between gap-3 border-t border-black/10 pt-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <StatusDot
                          connected={
                            false
                          }
                        />

                        <span className="truncate text-xs font-bold text-black/45">
                          Secure session ready
                        </span>
                      </div>

                      <span className="shrink-0 text-xs font-extrabold text-black/55">
                        {formatCountdown(
                          secondsLeft
                        )}
                      </span>
                    </div>
                  </div>
                ) : null}

                {mobileStage ===
                "identity-choice" ? (
                  <motion.div
                    initial={{
                      opacity:
                        0,

                      y:
                        12,
                    }}
                    animate={{
                      opacity:
                        1,

                      y:
                        0,
                    }}
                    className="w-full min-w-0 overflow-hidden border border-black/10 bg-white px-5 py-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-[17px] font-extrabold text-white">
                      ✓
                    </div>

                    <div className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-black/30">
                      Driving licence complete
                    </div>

                    <h3 className="mt-1 text-[23px] font-extrabold tracking-[-0.04em] text-black">
                      ID card or passport?
                    </h3>

                    <p className="mt-2 text-sm font-medium leading-6 text-black/45">
                      Choose the document you have with you.
                    </p>

                    <div className="mt-6 grid min-w-0 grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={
                          chooseMobileIdCard
                        }
                        className="min-w-0 rounded-[16px] border border-black/12 bg-white p-4 text-left transition hover:border-black/30 active:scale-[0.98]"
                      >
                        <div className="flex h-11 w-14 items-center justify-center rounded-[8px] bg-black text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                          ID
                        </div>

                        <div className="mt-4 text-[16px] font-extrabold text-black">
                          ID card
                        </div>

                        <p className="mt-1 text-[11px] font-medium leading-5 text-black/42">
                          Scan front and back.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={
                          chooseMobilePassport
                        }
                        className="min-w-0 rounded-[16px] border border-black/12 bg-white p-4 text-left transition hover:border-black/30 active:scale-[0.98]"
                      >
                        <div className="flex h-14 w-11 items-center justify-center rounded-[5px] bg-black text-[17px] text-white">
                          ✦
                        </div>

                        <div className="mt-1 text-[16px] font-extrabold text-black">
                          Passport
                        </div>

                        <p className="mt-1 text-[11px] font-medium leading-5 text-black/42">
                          Photograph photo page.
                        </p>
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {mobileStage ===
                "passport" ? (
                  <motion.div
                    initial={{
                      opacity:
                        0,

                      y:
                        12,
                    }}
                    animate={{
                      opacity:
                        1,

                      y:
                        0,
                    }}
                    className="flex min-h-[440px] w-full min-w-0 flex-col items-center justify-center overflow-hidden rounded-[18px] bg-black px-6 py-8 text-center text-white"
                  >
                    <motion.div
                      animate={{
                        rotateY: [
                          0,
                          7,
                          0,
                          -7,
                          0,
                        ],
                      }}
                      transition={{
                        duration:
                          3,

                        repeat:
                          Infinity,
                      }}
                      className="flex h-[160px] w-[118px] flex-col rounded-[6px] bg-[#191919] p-4 text-left shadow-2xl"
                    >
                      <div className="text-[8px] font-extrabold uppercase tracking-[0.17em] text-white/45">
                        Passport
                      </div>

                      <div className="mt-6 flex gap-3">
                        <div className="h-14 w-10 bg-white/15" />

                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-1.5 w-full bg-white/15" />

                          <div className="h-1.5 w-[80%] bg-white/15" />

                          <div className="h-1.5 w-[60%] bg-white/15" />
                        </div>
                      </div>

                      <div className="mt-auto space-y-1">
                        <div className="h-1 w-full bg-white/15" />

                        <div className="h-1 w-full bg-white/15" />
                      </div>
                    </motion.div>

                    <h3 className="mt-7 text-[23px] font-extrabold tracking-[-0.04em]">
                      Photograph your passport
                    </h3>

                    <p className="mt-2 max-w-[340px] text-sm font-medium leading-6 text-white/55">
                      Open the photo page and keep the complete page visible.
                    </p>

                    <button
                      type="button"
                      onClick={
                        openPassportCamera
                      }
                      className="mt-7 min-h-[54px] rounded-[16px] bg-white px-7 py-4 text-xs font-extrabold uppercase tracking-[0.15em] text-black active:scale-[0.98]"
                    >
                      Open camera
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMobileStage(
                          "identity-choice"
                        )
                      }
                      className="mt-4 text-xs font-bold text-white/50"
                    >
                      Choose ID card instead
                    </button>
                  </motion.div>
                ) : null}

                {mobileStage ===
                "review" ? (
                  <motion.div
                    initial={{
                      opacity:
                        0,

                      y:
                        12,
                    }}
                    animate={{
                      opacity:
                        1,

                      y:
                        0,
                    }}
                    className="w-full min-w-0 overflow-hidden border border-black/10 bg-white px-5 py-6"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-black/30">
                      Ready
                    </div>

                    <h3 className="mt-1 text-[23px] font-extrabold tracking-[-0.04em] text-black">
                      Documents captured
                    </h3>

                    <p className="mt-2 text-sm font-medium leading-6 text-black/45">
                      Everything is ready. Continue to validate your documents.
                    </p>

                    <div className="mt-6 border-y border-black/10">
                      <MobileReviewLine
                        title="Driving licence"
                        subtitle="Front + back captured"
                      />

                      <MobileReviewLine
                        title={
                          mobileIdentityType ===
                          "passport"
                            ? "Passport"
                            : "ID card"
                        }
                        subtitle={
                          mobileIdentityType ===
                          "passport"
                            ? "Photo page captured"
                            : "Front + back captured"
                        }
                      />
                    </div>

                    {mobileLicenceData.fullName ? (
                      <div className="mt-5 min-w-0 rounded-[14px] border border-black/10 bg-[#fafaf8] px-4 py-4">
                        <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-black/30">
                          Detected
                        </div>

                        <div className="mt-2 flex min-w-0 items-start justify-between gap-4">
                          <span className="shrink-0 text-xs font-semibold text-black/40">
                            Name
                          </span>

                          <span className="min-w-0 break-words text-right text-sm font-extrabold">
                            {
                              mobileLicenceData.fullName
                            }
                          </span>
                        </div>

                        {mobileLicenceCategories ? (
                          <div className="mt-3 flex min-w-0 items-start justify-between gap-4">
                            <span className="shrink-0 text-xs font-semibold text-black/40">
                              Categories
                            </span>

                            <span className="min-w-0 break-words text-right text-sm font-extrabold">
                              {
                                mobileLicenceCategories
                              }
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {mobileIdentityType ===
                      "passport" &&
                    mobilePassportPreview ? (
                      <div className="mt-5 min-w-0">
                        <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-black/30">
                          Passport photo
                        </div>

                        <div className="mt-2 w-full min-w-0 overflow-hidden rounded-[14px] border border-black/10 bg-black/[0.02]">
                          <img
                            src={
                              mobilePassportPreview
                            }
                            alt="Passport preview"
                            className="max-h-[220px] w-full object-contain"
                          />
                        </div>
                      </div>
                    ) : null}

                    <motion.button
                      type="button"
                      onClick={() => {
                        void completeMobileVerification();
                      }}
                      whileTap={{
                        scale:
                          0.98,
                      }}
                      className="nexa-mobile-verify-button relative mt-6 flex min-h-[60px] w-full items-center justify-center overflow-hidden rounded-[18px] px-5 text-[14px] font-extrabold uppercase tracking-[0.1em] text-white shadow-[0_18px_48px_rgba(71,75,255,0.24)]"
                    >
                      <span className="nexa-mobile-verify-button-glow" />

                      <span className="nexa-mobile-verify-button-shine" />

                      <span className="relative z-10">
                        Validate documents
                      </span>
                    </motion.button>
                  </motion.div>
                ) : null}

                {mobileStage ===
                "uploading" ? (
                  <div className="flex min-h-[360px] w-full min-w-0 flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center">
                    <Spinner />

                    <h3 className="mt-5 text-[22px] font-extrabold tracking-[-0.04em] text-black">
                      Saving your documents
                    </h3>

                    <p className="mt-2 max-w-[340px] text-sm font-medium leading-6 text-black/45">
                      Securely attaching them to your booking.
                    </p>
                  </div>
                ) : null}

                {mobileStage ===
                "error" ? (
                  <div className="flex min-h-[340px] w-full min-w-0 flex-col items-center justify-center border border-red-200 bg-red-50 px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-xl font-extrabold text-white">
                      !
                    </div>

                    <h3 className="mt-5 text-[22px] font-extrabold tracking-[-0.035em] text-red-900">
                      Verification needs attention
                    </h3>

                    <p className="mt-2 max-w-[360px] break-words text-sm font-semibold leading-6 text-red-700">
                      {mobileError ||
                        "Please try the document scan again."}
                    </p>

                    <button
                      type="button"
                      onClick={
                        retryMobileFromError
                      }
                      className="mt-6 rounded-[14px] bg-black px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white active:scale-[0.98]"
                    >
                      Try again
                    </button>
                  </div>
                ) : null}
              </motion.div>
            </>
          ) : null}

          {complete ? (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="flex min-h-[340px] w-full min-w-0 flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center lg:min-h-[390px]"
            >
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 14,
                }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-[24px] font-extrabold text-white"
              >
                ✓
              </motion.div>

              <h3 className="mt-6 text-[24px] font-extrabold tracking-[-0.04em] text-black">
                Documents received
              </h3>

              <p className="mt-2 max-w-[420px] text-sm font-medium leading-6 text-black/45">
                Validation completed. Preparing your customer details...
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Spinner />

                <span className="text-xs font-bold text-black/45">
                  Continuing automatically
                </span>
              </div>
            </motion.div>
          ) : null}

          {(status ===
            "failed" ||
            status ===
              "expired" ||
            status ===
              "cancelled") ? (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="flex min-h-[340px] w-full min-w-0 flex-col items-center justify-center border border-red-200 bg-red-50 px-6 text-center lg:min-h-[390px]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-xl font-extrabold text-white">
                !
              </div>

              <h3 className="mt-5 text-[22px] font-extrabold tracking-[-0.035em] text-red-900">
                {status ===
                "expired"
                  ? "Verification expired"
                  : status ===
                      "cancelled"
                    ? "Verification cancelled"
                    : "Verification unavailable"}
              </h3>

              <p className="mt-2 max-w-[430px] break-words text-sm font-semibold leading-6 text-red-700">
                {error ||
                  "Create a new secure session to continue."}
              </p>

              <button
                type="button"
                onClick={
                  retrySession
                }
                className="mt-6 bg-black px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-black/80 active:scale-[0.98]"
              >
                Start again
              </button>
            </motion.div>
          ) : null}
        </div>

        <style jsx global>{`
          .nexa-mobile-verify-button {
            background:
              linear-gradient(
                110deg,
                #6f39ff 0%,
                #2188ff 34%,
                #9b45f3 61%,
                #ff7a00 100%
              );
            background-size: 220% 220%;
            animation:
              nexa-mobile-verify-gradient
              4.5s ease infinite;
          }

          .nexa-mobile-verify-button-glow {
            position: absolute;
            inset: -35%;
            background:
              conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(
                  255,
                  255,
                  255,
                  0.34
                )
                  70deg,
                transparent 135deg,
                rgba(
                  255,
                  255,
                  255,
                  0.16
                )
                  220deg,
                transparent 300deg
              );
            animation:
              nexa-mobile-verify-spin
              3.8s linear infinite;
          }

          .nexa-mobile-verify-button-shine {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 38%;
            left: -50%;
            transform:
              skewX(-18deg);
            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(
                  255,
                  255,
                  255,
                  0.34
                ),
                transparent
              );
            animation:
              nexa-mobile-verify-shine
              2.8s ease-in-out
              infinite;
          }

          #nexa-fullscreen-blinkid-camera,
          #nexa-fullscreen-blinkid-camera > div {
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
          }

          #nexa-fullscreen-blinkid-camera video {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            max-height: none !important;
            object-fit: cover !important;
            background: #000 !important;
          }

          #nexa-fullscreen-blinkid-camera
            [data-nexa-blinkid-hidden="true"] {
            opacity: 0 !important;
            pointer-events: none !important;
          }

          @keyframes nexa-mobile-verify-gradient {
            0% {
              background-position:
                0% 50%;
            }

            50% {
              background-position:
                100% 50%;
            }

            100% {
              background-position:
                0% 50%;
            }
          }

          @keyframes nexa-mobile-verify-spin {
            from {
              transform:
                rotate(0deg);
            }

            to {
              transform:
                rotate(360deg);
            }
          }

          @keyframes nexa-mobile-verify-shine {
            0%,
            20% {
              left: -50%;
            }

            65%,
            100% {
              left: 120%;
            }
          }

          @media (max-width: 1023px) {
            #nexa-document-verification,
            #nexa-document-verification * {
              box-sizing:
                border-box;
            }

            #nexa-document-verification {
              width:
                100% !important;

              max-width:
                100% !important;

              min-width:
                0 !important;

              overflow-x:
                hidden !important;
            }

            #nexa-document-verification video,
            #nexa-document-verification canvas,
            #nexa-document-verification img {
              max-width:
                100% !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .nexa-mobile-verify-button,
            .nexa-mobile-verify-button-glow,
            .nexa-mobile-verify-button-shine {
              animation:
                none !important;
            }
          }
        `}</style>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                             MOBILE REVIEW ROW                              */
/* -------------------------------------------------------------------------- */

function MobileReviewLine({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 border-b border-black/10 py-4 last:border-b-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-extrabold text-black">
          {title}
        </div>

        <div className="mt-0.5 text-xs font-medium text-black/40">
          {subtitle}
        </div>
      </div>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-extrabold text-white">
        ✓
      </div>
    </div>
  );
}