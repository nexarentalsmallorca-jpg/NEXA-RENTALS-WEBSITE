"use client";

export const dynamic = "force-dynamic";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Manrope } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type IdentityDocumentType = "id" | "passport";

type ScannerMode = "licence" | "id";

type Stage =
  | "loading-session"
  | "licence"
  | "identity-choice"
  | "id"
  | "passport"
  | "review"
  | "uploading"
  | "complete"
  | "error";

type ExtractedVehicleClass = {
  category: string;
  validFrom: string;
  validUntil: string;
};

type ExtractedDocumentData = {
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

type SessionResponse = {
  success: boolean;

  sessionToken?: string;
  bookingId?: string;

  status?:
    | "pending"
    | "scanning"
    | "completed"
    | "failed"
    | "expired"
    | "cancelled";

  identityType?: IdentityDocumentType | null;

  expiresAt?: string;

  error?: string;
  errorMessage?: string;
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

type BlinkImageDataLike = {
  width: number;
  height: number;
  data: Uint8ClampedArray | ArrayLike<number>;
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

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function textFromResult(value: any): string {
  if (value == null) return "";

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
  if (!value) return "";

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
    return EMPTY_DOCUMENT_DATA;
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

    dateOfBirth:
      dateFromResult(
        result?.dateOfBirth
      ),

    dateOfExpiry:
      dateFromResult(
        result?.dateOfExpiry
      ),

    documentNumber:
      textFromResult(
        result?.documentNumber
      ),

    nationality:
      textFromResult(
        result?.nationality
      ),

    address:
      textFromResult(
        result?.address
      ),

    countryCode:
      textFromResult(
        documentClassInfo
          ?.isoAlpha2CountryCode
      ),

    documentType:
      textFromResult(
        documentClassInfo
          ?.documentType?.id
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

  const rawData =
    new Uint8ClampedArray(
      imageDataValue.width *
        imageDataValue.height *
        4
    );

  rawData.set(
    Array.from(
      imageDataValue.data
    )
  );

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
    await new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.94
        );
      }
    );

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
    result?.subResults?.[index]
      ?.documentImage ??
    null
  );
}

function AnimatedDocumentCard({
  mode,
  side,
}: {
  mode: ScannerMode;
  side: "front" | "back";
}) {
  return (
    <div
      className="relative h-[76px] w-[122px] shrink-0"
      style={{
        perspective: "800px",
      }}
    >
      <motion.div
        animate={{
          rotateY:
            side === "front"
              ? 0
              : 180,
        }}
        transition={{
          duration: 0.55,
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
          className="absolute inset-0 overflow-hidden rounded-[10px] bg-white p-3 text-black shadow-lg"
          style={{
            backfaceVisibility:
              "hidden",
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-2 w-8 rounded-full bg-black/10" />

              <span className="text-[6px] font-extrabold uppercase tracking-[0.12em] text-black/35">
                Front
              </span>
            </div>

            <div className="flex items-end gap-2">
              <div className="h-6 w-5 rounded bg-black/10" />

              <div className="flex-1 space-y-1">
                <div className="h-1 w-full rounded bg-black/10" />
                <div className="h-1 w-[70%] rounded bg-black/10" />
                <div className="h-1 w-[45%] rounded bg-black/10" />
              </div>
            </div>

            <span className="text-[6px] font-extrabold uppercase tracking-[0.09em]">
              {mode ===
              "licence"
                ? "Driving licence"
                : "Identity card"}
            </span>
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden rounded-[10px] bg-[#171717] p-3 text-white shadow-lg"
          style={{
            backfaceVisibility:
              "hidden",

            transform:
              "rotateY(180deg)",
          }}
        >
          <div className="flex h-full flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-1.5 w-10 rounded-full bg-white/15" />

              <span className="text-[6px] font-extrabold uppercase tracking-[0.12em] text-white/45">
                Back
              </span>
            </div>

            <div className="space-y-1">
              <div className="h-1 w-full bg-white/15" />
              <div className="h-1 w-[80%] bg-white/15" />
              <div className="h-1 w-[55%] bg-white/15" />
            </div>

            <div className="flex gap-[2px]">
              {Array.from({
                length: 10,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-4 flex-1 bg-white/10"
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
        "h-10 w-10 rounded-full border-[3px]",

        light
          ? "border-white/20 border-t-white"
          : "border-black/10 border-t-black",
      ].join(" ")}
    />
  );
}

export default function VerifyDocumentsPage() {
  const scannerMountRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const scannerRef =
    useRef<any>(null);

  const scannerStartingRef =
    useRef(false);

  const currentModeRef =
    useRef<ScannerMode | null>(
      null
    );

  const resultHandledRef =
    useRef(false);

  const passportInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const initializedRef =
    useRef(false);

  const [
    sessionToken,
    setSessionToken,
  ] = useState("");

  const [
    sessionTokenResolved,
    setSessionTokenResolved,
  ] = useState(false);

  const [bookingId, setBookingId] =
    useState("");

  const [stage, setStage] =
    useState<Stage>(
      "loading-session"
    );

  const [
    scannerMode,
    setScannerMode,
  ] =
    useState<ScannerMode>(
      "licence"
    );

  const [
    currentSide,
    setCurrentSide,
  ] =
    useState<
      "front" | "back"
    >("front");

  const [
    scannerNotice,
    setScannerNotice,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    identityType,
    setIdentityType,
  ] =
    useState<
      IdentityDocumentType | null
    >(null);

  const [
    dlFront,
    setDlFront,
  ] =
    useState<File | null>(
      null
    );

  const [
    dlBack,
    setDlBack,
  ] =
    useState<File | null>(
      null
    );

  const [
    idFront,
    setIdFront,
  ] =
    useState<File | null>(
      null
    );

  const [
    idBack,
    setIdBack,
  ] =
    useState<File | null>(
      null
    );

  const [
    passport,
    setPassport,
  ] =
    useState<File | null>(
      null
    );

  const [
    licenceData,
    setLicenceData,
  ] =
    useState<ExtractedDocumentData>(
      EMPTY_DOCUMENT_DATA
    );

  const [
    identityData,
    setIdentityData,
  ] =
    useState<ExtractedDocumentData | null>(
      null
    );

  const [
    passportPreview,
    setPassportPreview,
  ] = useState("");

  const destroyScanner =
    useCallback(async () => {
      scannerStartingRef.current =
        false;

      currentModeRef.current =
        null;

      const scanner =
        scannerRef.current;

      scannerRef.current =
        null;

      if (!scanner) {
        return;
      }

      try {
        await scanner.destroy?.();
      } catch {
        // Scanner cleanup should
        // never block the user.
      }
    }, []);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    setSessionToken(
      cleanText(
        params.get(
          "session"
        )
      )
    );

    setSessionTokenResolved(
      true
    );
  }, []);

  const updateSession =
    useCallback(
      async (
        body: Record<
          string,
          unknown
        >
      ) => {
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
          (await response.json()) as SessionResponse;

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
      [sessionToken]
    );

  const initializeSession =
    useCallback(
      async () => {
        if (!sessionToken) {
          setError(
            "The verification link is missing its secure session."
          );

          setStage(
            "error"
          );

          return;
        }

        try {
          setError("");

          setStage(
            "loading-session"
          );

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
            (await response.json()) as SessionResponse;

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.error ||
                "This verification session is unavailable."
            );
          }

          if (
            data.status ===
            "expired"
          ) {
            throw new Error(
              "This QR code has expired. Return to the booking screen and generate a new one."
            );
          }

          if (
            data.status ===
            "completed"
          ) {
            setStage(
              "complete"
            );

            return;
          }

          if (
            data.status ===
              "cancelled" ||
            data.status ===
              "failed"
          ) {
            throw new Error(
              "This verification session can no longer be used."
            );
          }

          if (
            !data.bookingId
          ) {
            throw new Error(
              "Booking verification ID is missing."
            );
          }

          setBookingId(
            data.bookingId
          );

          await updateSession({
            action:
              "start",
          });

          setStage(
            "licence"
          );
        } catch (
          sessionError: any
        ) {
          setError(
            sessionError?.message ||
              "Could not start document verification."
          );

          setStage(
            "error"
          );
        }
      },
      [
        sessionToken,
        updateSession,
      ]
    );

  useEffect(() => {
    if (
      !sessionTokenResolved ||
      initializedRef.current
    ) {
      return;
    }

    initializedRef.current =
      true;

    void initializeSession();
  }, [
    sessionTokenResolved,
    initializeSession,
  ]);

  const handleScannerResult =
    useCallback(
      async (
        mode: ScannerMode,
        result: any
      ) => {
        if (
          resultHandledRef.current
        ) {
          return;
        }

        resultHandledRef.current =
          true;

        try {
          setScannerNotice(
            "Saving scan..."
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

          await destroyScanner();

          if (!frontFile) {
            throw new Error(
              "The scanner could not save the front image. Please scan again."
            );
          }

          if (!backFile) {
            throw new Error(
              "The scanner did not capture the back side. Please scan the document again."
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
            setDlFront(
              frontFile
            );

            setDlBack(
              backFile
            );

            setLicenceData(
              extracted
            );

            setCurrentSide(
              "front"
            );

            setScannerNotice(
              ""
            );

            setStage(
              "identity-choice"
            );

            return;
          }

          setIdFront(
            frontFile
          );

          setIdBack(
            backFile
          );

          setIdentityData(
            extracted
          );

          setCurrentSide(
            "front"
          );

          setScannerNotice(
            ""
          );

          setStage(
            "review"
          );
        } catch (
          resultError: any
        ) {
          await destroyScanner();

          setError(
            resultError?.message ||
              "The document could not be saved."
          );

          setStage(
            "error"
          );
        }
      },
      [
        destroyScanner,
      ]
    );

  const startScanner =
    useCallback(
      async (
        mode: ScannerMode
      ) => {
        if (
          scannerStartingRef.current
        ) {
          return;
        }

        if (
          currentModeRef.current ===
            mode &&
          scannerRef.current
        ) {
          return;
        }

        const mount =
          scannerMountRef.current;

        if (!mount) {
          return;
        }

        const licenseKey =
          process.env
            .NEXT_PUBLIC_BLINKID_LICENSE_KEY;

        if (!licenseKey) {
          setError(
            "Document scanner licence is not configured."
          );

          setStage(
            "error"
          );

          return;
        }

        scannerStartingRef.current =
          true;

        currentModeRef.current =
          mode;

        resultHandledRef.current =
          false;

        try {
          if (
            typeof window ===
            "undefined"
          ) {
            return;
          }

          await destroyScanner();

          scannerStartingRef.current =
            true;

          currentModeRef.current =
            mode;

          setScannerMode(
            mode
          );

          setCurrentSide(
            "front"
          );

          setScannerNotice(
            ""
          );

          mount.innerHTML =
            "";

          /*
           * IMPORTANT:
           *
           * BlinkID uses browser-only APIs such as
           * window during its module initialization.
           *
           * Loading the SDK here prevents Next.js
           * production prerendering from evaluating
           * BlinkID on the server.
           */
          const {
            createBlinkId,
          } =
            await import(
              "@microblink/blinkid"
            );

          const blinkId =
            await createBlinkId({
              licenseKey,

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

          scannerRef.current =
            blinkId;

          scannerStartingRef.current =
            false;

          blinkId.addDocumentClassFilter(
            (
              documentClassInfo: any
            ) => {
              const documentType =
                documentClassInfo
                  ?.documentType
                  ?.id;

              if (
                mode ===
                "licence"
              ) {
                return (
                  documentType ===
                  "dl"
                );
              }

              return (
                documentType ===
                "id"
              );
            }
          );

          blinkId.addOnDocumentFilteredCallback(
            () => {
              setScannerNotice(
                mode ===
                  "licence"
                  ? "Please show a driving licence."
                  : "Please show an ID card."
              );
            }
          );

          blinkId.blinkIdUxManager.addOnFrameProcessCallback(
            (
              frameResult: any
            ) => {
              const side =
                frameResult
                  ?.inputImageAnalysisResult
                  ?.scanningSide;

              if (
                side ===
                "first"
              ) {
                setCurrentSide(
                  "front"
                );
              }

              if (
                side ===
                "second"
              ) {
                setCurrentSide(
                  "back"
                );
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
                    "Scanner error";

              setScannerNotice(
                readable
              );
            }
          );

          blinkId.addOnResultCallback(
            (
              result: any
            ) => {
              void handleScannerResult(
                mode,
                result
              );
            }
          );
        } catch (
          scannerError: any
        ) {
          scannerStartingRef.current =
            false;

          await destroyScanner();

          setError(
            scannerError?.message ||
              "The camera scanner could not start."
          );

          setStage(
            "error"
          );
        }
      },
      [
        destroyScanner,
        handleScannerResult,
      ]
    );

  useEffect(() => {
    if (
      stage !==
        "licence" &&
      stage !== "id"
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void startScanner(
            stage ===
              "licence"
              ? "licence"
              : "id"
          );
        },
        300
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    stage,
    startScanner,
  ]);

  useEffect(() => {
    return () => {
      void destroyScanner();

      if (
        passportPreview
      ) {
        URL.revokeObjectURL(
          passportPreview
        );
      }
    };
  }, [
    destroyScanner,
    passportPreview,
  ]);

  function chooseIdCard() {
    setIdentityType(
      "id"
    );

    setPassport(
      null
    );

    if (
      passportPreview
    ) {
      URL.revokeObjectURL(
        passportPreview
      );

      setPassportPreview(
        ""
      );
    }

    setStage(
      "id"
    );
  }

  function choosePassport() {
    setIdentityType(
      "passport"
    );

    setIdFront(
      null
    );

    setIdBack(
      null
    );

    setIdentityData(
      null
    );

    setStage(
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
      event.target.files?.[0] ??
      null;

    if (!selected) {
      return;
    }

    if (
      !selected.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please take a photo of the passport photo page."
      );

      setStage(
        "error"
      );

      return;
    }

    if (
      passportPreview
    ) {
      URL.revokeObjectURL(
        passportPreview
      );
    }

    setPassport(
      selected
    );

    setPassportPreview(
      URL.createObjectURL(
        selected
      )
    );

    setStage(
      "review"
    );
  }

  async function uploadDocuments(): Promise<UploadedDocumentPaths> {
    if (!bookingId) {
      throw new Error(
        "Booking verification ID is missing."
      );
    }

    if (
      !dlFront ||
      !dlBack
    ) {
      throw new Error(
        "Both sides of the driving licence are required."
      );
    }

    const finalIdFront =
      identityType ===
      "passport"
        ? passport
        : idFront;

    const finalIdBack =
      identityType ===
      "id"
        ? idBack
        : null;

    if (!finalIdFront) {
      throw new Error(
        identityType ===
          "passport"
          ? "Passport photo is missing."
          : "ID card front is missing."
      );
    }

    if (
      identityType ===
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
      dlFront
    );

    formData.append(
      "dlBack",
      dlBack
    );

    formData.append(
      "idFront",
      finalIdFront
    );

    if (finalIdBack) {
      formData.append(
        "idBack",
        finalIdBack
      );
    }

    const response =
      await fetch(
        "/api/stripe/upload-booking-documents",
        {
          method: "POST",
          body: formData,
        }
      );

    const rawText =
      await response.text();

    let data: any = {};

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

    if (!response.ok) {
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
        dlFront.name,

      dlBackName:
        data?.dlBackName ||
        dlBack.name,

      idFrontName:
        data?.idFrontName ||
        finalIdFront.name,

      idBackName:
        data?.idBackName ||
        finalIdBack?.name ||
        "",
    };
  }

  async function completeVerification() {
    if (
      !identityType
    ) {
      setError(
        "Choose your ID card or passport."
      );

      setStage(
        "error"
      );

      return;
    }

    try {
      setError("");

      setStage(
        "uploading"
      );

      const uploaded =
        await uploadDocuments();

      const firstName =
        licenceData.firstName ||
        identityData
          ?.firstName ||
        "";

      const lastName =
        licenceData.lastName ||
        identityData
          ?.lastName ||
        "";

      const homeAddress =
        identityData?.address ||
        licenceData.address ||
        "";

      await updateSession({
        action:
          "complete",

        identityType,

        firstName,

        lastName,

        homeAddress,

        licenceData,

        identityData:
          identityType ===
          "id"
            ? identityData
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

      setStage(
        "complete"
      );
    } catch (
      verificationError: any
    ) {
      setError(
        verificationError
          ?.message ||
          "Could not complete document verification."
      );

      setStage(
        "error"
      );
    }
  }

  function retryFromError() {
    setError("");

    if (
      !dlFront ||
      !dlBack
    ) {
      setStage(
        "licence"
      );

      return;
    }

    if (!identityType) {
      setStage(
        "identity-choice"
      );

      return;
    }

    if (
      identityType ===
      "id" &&
      (!idFront ||
        !idBack)
    ) {
      setStage(
        "id"
      );

      return;
    }

    if (
      identityType ===
        "passport" &&
      !passport
    ) {
      setStage(
        "passport"
      );

      return;
    }

    setStage(
      "review"
    );
  }

  const licenceCategories =
    useMemo(() => {
      return licenceData
        .vehicleClasses
        .map(
          (item) =>
            item.category
        )
        .filter(Boolean)
        .join(", ");
    }, [
      licenceData,
    ]);

  const isScanning =
    stage ===
      "licence" ||
    stage === "id";

  return (
    <div
      className={`${manrope.className} min-h-screen bg-white text-[#111]`}
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

      <main className="mx-auto min-h-screen w-full max-w-[720px] px-4 pb-8 pt-4 sm:px-6">
        <header className="border-b border-black/10 pb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-black/30">
            NEXA Rentals
          </div>

          <h1 className="mt-1 text-[27px] font-extrabold leading-[1.06] tracking-[-0.045em] sm:text-[32px]">
            Document verification
          </h1>

          <p className="mt-2 text-sm font-medium leading-6 text-black/45">
            Complete this secure
            verification on your
            phone. Your booking
            will continue
            automatically on the
            computer.
          </p>
        </header>

        <div className="relative mt-4">
          <div
            ref={
              scannerMountRef
            }
            className={[
              "relative min-h-[500px] w-full overflow-hidden bg-black",

              isScanning
                ? "block"
                : "hidden",
            ].join(" ")}
          />

          {isScanning ? (
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/90 via-black/50 to-transparent px-4 pb-16 pt-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/55">
                    {scannerMode ===
                    "licence"
                      ? "Driving licence"
                      : "Identity card"}
                  </div>

                  <div className="mt-1 text-[20px] font-extrabold tracking-[-0.035em]">
                    Scan the{" "}
                    {currentSide ===
                    "front"
                      ? "front"
                      : "back"}
                  </div>

                  <p className="mt-1 max-w-[230px] text-xs font-medium leading-5 text-white/60">
                    Keep all four
                    corners visible
                    and hold the
                    document steady.
                  </p>
                </div>

                <AnimatedDocumentCard
                  mode={
                    scannerMode
                  }
                  side={
                    currentSide
                  }
                />
              </div>
            </div>
          ) : null}

          {isScanning &&
          scannerNotice ? (
            <div className="pointer-events-none absolute bottom-5 left-1/2 z-40 w-[calc(100%-32px)] -translate-x-1/2 bg-white px-4 py-3 text-center text-xs font-bold text-black shadow-xl">
              {scannerNotice}
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {stage ===
            "loading-session" ? (
              <motion.section
                key="loading"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="flex min-h-[500px] flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center"
              >
                <Spinner />

                <h2 className="mt-5 text-[21px] font-extrabold tracking-[-0.035em]">
                  Opening secure
                  session
                </h2>

                <p className="mt-2 text-sm font-medium text-black/42">
                  Connecting to
                  your booking...
                </p>
              </motion.section>
            ) : null}

            {stage ===
            "identity-choice" ? (
              <motion.section
                key="identity-choice"
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="min-h-[500px] border border-black/10 bg-white px-5 py-7"
              >
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-lg font-extrabold text-white">
                    ✓
                  </div>

                  <h2 className="mt-5 text-[23px] font-extrabold tracking-[-0.04em]">
                    Driving licence
                    captured
                  </h2>

                  <p className="mt-2 text-sm font-medium text-black/45">
                    Now choose the
                    identity
                    document you
                    have with you.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={
                      chooseIdCard
                    }
                    className="min-h-[180px] border border-black/12 bg-white p-5 text-left transition active:scale-[0.98]"
                  >
                    <div className="flex h-12 w-16 items-center justify-center bg-black text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">
                      ID
                    </div>

                    <div className="mt-5 text-[17px] font-extrabold">
                      ID card
                    </div>

                    <p className="mt-1 text-xs font-medium leading-5 text-black/42">
                      Automatically
                      scan the front
                      and back.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={
                      choosePassport
                    }
                    className="min-h-[180px] border border-black/12 bg-white p-5 text-left transition active:scale-[0.98]"
                  >
                    <div className="flex h-16 w-12 items-center justify-center bg-black text-[18px] text-white">
                      ✦
                    </div>

                    <div className="mt-1 text-[17px] font-extrabold">
                      Passport
                    </div>

                    <p className="mt-1 text-xs font-medium leading-5 text-black/42">
                      Take one clear
                      photo of the
                      passport photo
                      page.
                    </p>
                  </button>
                </div>
              </motion.section>
            ) : null}

            {stage ===
            "passport" ? (
              <motion.section
                key="passport"
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="flex min-h-[500px] flex-col items-center justify-center bg-black px-6 py-8 text-center text-white"
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
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="flex h-[170px] w-[125px] flex-col bg-[#191919] p-4 text-left shadow-2xl"
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

                <h2 className="mt-7 text-[23px] font-extrabold tracking-[-0.04em]">
                  Photograph your
                  passport
                </h2>

                <p className="mt-2 max-w-[360px] text-sm font-medium leading-6 text-white/55">
                  Open the photo
                  page. Make sure
                  the complete page
                  and all four
                  corners are
                  clearly visible.
                </p>

                <button
                  type="button"
                  onClick={
                    openPassportCamera
                  }
                  className="mt-7 bg-white px-7 py-4 text-xs font-extrabold uppercase tracking-[0.15em] text-black active:scale-[0.98]"
                >
                  Open camera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStage(
                      "identity-choice"
                    )
                  }
                  className="mt-4 text-xs font-bold text-white/50"
                >
                  Choose ID card
                  instead
                </button>
              </motion.section>
            ) : null}

            {stage ===
            "review" ? (
              <motion.section
                key="review"
                initial={{
                  opacity: 0,
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="min-h-[500px] border border-black/10 bg-white px-5 py-6"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-black/30">
                  Ready
                </div>

                <h2 className="mt-1 text-[24px] font-extrabold tracking-[-0.04em]">
                  Validate your
                  documents
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-black/45">
                  Check that both
                  documents were
                  captured before
                  completing the
                  verification.
                </p>

                <div className="mt-6 border-y border-black/10">
                  <ReviewLine
                    title="Driving licence"
                    subtitle="Front + back"
                  />

                  <ReviewLine
                    title={
                      identityType ===
                      "passport"
                        ? "Passport"
                        : "ID card"
                    }
                    subtitle={
                      identityType ===
                      "passport"
                        ? "Photo page"
                        : "Front + back"
                    }
                  />
                </div>

                {licenceData.fullName ? (
                  <div className="mt-5 border border-black/10 bg-[#fafaf8] px-4 py-4">
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-black/30">
                      Detected
                    </div>

                    <div className="mt-2 flex items-start justify-between gap-5">
                      <span className="text-xs font-semibold text-black/40">
                        Name
                      </span>

                      <span className="max-w-[65%] text-right text-sm font-extrabold">
                        {
                          licenceData.fullName
                        }
                      </span>
                    </div>

                    {licenceCategories ? (
                      <div className="mt-3 flex items-start justify-between gap-5">
                        <span className="text-xs font-semibold text-black/40">
                          Licence
                          categories
                        </span>

                        <span className="max-w-[65%] text-right text-sm font-extrabold">
                          {
                            licenceCategories
                          }
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {identityType ===
                  "passport" &&
                passportPreview ? (
                  <div className="mt-5">
                    <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-black/30">
                      Passport
                      photo
                    </div>

                    <div className="mt-2 overflow-hidden border border-black/10 bg-black/[0.02]">
                      <img
                        src={
                          passportPreview
                        }
                        alt="Passport preview"
                        className="max-h-[210px] w-full object-contain"
                      />
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => {
                    void completeVerification();
                  }}
                  className="mt-6 min-h-[56px] w-full bg-black px-6 text-sm font-extrabold text-white transition active:scale-[0.98]"
                >
                  Validate documents
                </button>
              </motion.section>
            ) : null}

            {stage ===
            "uploading" ? (
              <motion.section
                key="uploading"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="flex min-h-[500px] flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center"
              >
                <Spinner />

                <h2 className="mt-6 text-[23px] font-extrabold tracking-[-0.04em]">
                  Validating
                  documents
                </h2>

                <p className="mt-2 max-w-[350px] text-sm font-medium leading-6 text-black/45">
                  Securely saving
                  your documents
                  and connecting
                  them to your
                  booking.
                </p>
              </motion.section>
            ) : null}

            {stage ===
            "complete" ? (
              <motion.section
                key="complete"
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="flex min-h-[500px] flex-col items-center justify-center bg-black px-6 text-center text-white"
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
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[30px] font-extrabold text-black"
                >
                  ✓
                </motion.div>

                <h2 className="mt-7 text-[27px] font-extrabold tracking-[-0.045em]">
                  Verification
                  complete
                </h2>

                <p className="mt-3 max-w-[390px] text-sm font-medium leading-6 text-white/60">
                  Your documents
                  have been
                  received. You
                  can return to the
                  computer — the
                  booking will
                  continue there
                  automatically.
                </p>

                <div className="mt-8 border-t border-white/10 pt-6 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
                  NEXA Rentals
                </div>
              </motion.section>
            ) : null}

            {stage ===
            "error" ? (
              <motion.section
                key="error"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="flex min-h-[500px] flex-col items-center justify-center border border-red-200 bg-red-50 px-6 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-[23px] font-extrabold text-white">
                  !
                </div>

                <h2 className="mt-6 text-[23px] font-extrabold tracking-[-0.04em] text-red-900">
                  Verification
                  needs attention
                </h2>

                <p className="mt-2 max-w-[410px] text-sm font-semibold leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    retryFromError
                  }
                  className="mt-7 bg-black px-7 py-3.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white"
                >
                  Try again
                </button>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ReviewLine({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-black/10 py-4 last:border-b-0">
      <div>
        <div className="text-sm font-extrabold text-black">
          {title}
        </div>

        <div className="mt-0.5 text-xs font-medium text-black/40">
          {subtitle}
        </div>
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-extrabold text-white">
        ✓
      </div>
    </div>
  );
}