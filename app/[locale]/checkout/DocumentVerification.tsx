"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  )}:${String(seconds).padStart(2, "0")}`;
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
  active,
  complete,
}: {
  number: number;
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5">
      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-extrabold transition-all duration-300",

          complete
            ? "border-black bg-black text-white"
            : active
              ? "border-black bg-black text-white"
              : "border-black/10 bg-white text-black/28",
        ].join(" ")}
      >
        {complete ? "✓" : number}
      </div>

      <div
        className={[
          "truncate text-[10px] font-extrabold uppercase tracking-[0.13em]",

          active || complete
            ? "text-black"
            : "text-black/28",
        ].join(" ")}
      >
        {label}
      </div>
    </div>
  );
}

function CheckoutProgress() {
  return (
    <div className="flex w-full items-center">
      <BookingStep
        number={1}
        label="Validate documents"
        active
      />

      <div className="mx-3 h-px min-w-5 flex-1 bg-black/10" />

      <BookingStep
        number={2}
        label="Your details"
      />

      <div className="mx-3 h-px min-w-5 flex-1 bg-black/10" />

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
    2 * Math.PI * radius;

  const progress = Math.max(
    0,
    Math.min(
      1,
      secondsLeft / QR_SESSION_SECONDS
    )
  );

  const offset =
    circumference * (1 - progress);

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
          value={verificationUrl}
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
        opacity: [0.35, 1, 0.35],
        scale: [0.9, 1.08, 0.9],
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

export default function DocumentVerification({
  autoStart = true,
  onComplete,
  onCancel,
}: DocumentVerificationProps) {
  const locale = useLocale();

  const searchParams =
    useSearchParams();

  const creationStartedRef =
    useRef(false);

  const completionHandledRef =
    useRef(false);

  const pollTimerRef =
    useRef<number | null>(null);

  const countdownTimerRef =
    useRef<number | null>(null);

  const countdownDeadlineRef =
    useRef<number>(0);

  const expiryHandledRef =
    useRef(false);

  const [status, setStatus] =
    useState<SessionStatus>(
      autoStart
        ? "creating"
        : "pending"
    );

  const [sessionToken, setSessionToken] =
    useState("");

  const [bookingId, setBookingId] =
    useState("");

  const [
    verificationUrl,
    setVerificationUrl,
  ] = useState("");

  const [
    secondsLeft,
    setSecondsLeft,
  ] = useState(
    QR_SESSION_SECONDS
  );

  const [error, setError] =
    useState("");

  const fleetGroup = useMemo(() => {
    return (
      safeParam(
        searchParams,
        "fleetGroup"
      ) || "scooter"
    );
  }, [searchParams]);

  const vehicleName = useMemo(() => {
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
  }, [searchParams]);

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

  const buildVerificationUrl =
    useCallback(
      (path: string) => {
        const configuredOrigin =
          process.env
            .NEXT_PUBLIC_DOCUMENT_VERIFICATION_ORIGIN?.trim();

        if (configuredOrigin) {
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

        /*
         * VERY IMPORTANT:
         *
         * A QR containing localhost cannot
         * work from another phone.
         *
         * During desktop local development,
         * the phone therefore receives the
         * real NEXA Rentals domain instead.
         */
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1"
        ) {
          return `${LIVE_VERIFICATION_ORIGIN}${path}`;
        }

        return `${cleanOrigin(
          window.location.origin
        )}${path}`;
      },
      []
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
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                sessionToken:
                  token,

                action:
                  "cancel",
              }),
            }
          );
        } catch {
          // Do not block navigation
          // because of cleanup.
        }
      },
      []
    );

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

      setStatus("expired");

      setError(
        "This secure QR code has expired. Generate a new QR code to continue."
      );

      if (sessionToken) {
        await cancelRemoteSession(
          sessionToken
        );
      }
    }, [
      sessionToken,
      stopPolling,
      stopCountdown,
      cancelRemoteSession,
    ]);

  const startCountdown =
    useCallback(() => {
      stopCountdown();

      expiryHandledRef.current =
        false;

      countdownDeadlineRef.current =
        Date.now() +
        QR_SESSION_SECONDS * 1000;

      setSecondsLeft(
        QR_SESSION_SECONDS
      );

      countdownTimerRef.current =
        window.setInterval(() => {
          const remaining =
            Math.max(
              0,
              Math.ceil(
                (
                  countdownDeadlineRef.current -
                  Date.now()
                ) / 1000
              )
            );

          setSecondsLeft(
            remaining
          );

          if (remaining <= 0) {
            void expireCurrentSession();
          }
        }, 1000);
    }, [
      stopCountdown,
      expireCurrentSession,
    ]);

  const createSession =
    useCallback(async () => {
      try {
        stopPolling();
        stopCountdown();

        setError("");

        setStatus(
          "creating"
        );

        setVerificationUrl("");

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
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
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
    ]);

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

            fullName: [
              data.firstName,
              data.lastName,
            ]
              .filter(Boolean)
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

            dlFront: null,
            dlBack: null,

            idFront: null,
            idBack: null,

            passport: null,

            licenceData,

            identityData: null,

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
      if (!sessionToken) {
        return;
      }

      try {
        const response =
          await fetch(
            `/api/document-verification/session?session=${encodeURIComponent(
              sessionToken
            )}`,
            {
              method: "GET",
              cache: "no-store",
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
        /*
         * Do nothing here.
         * A temporary connection problem
         * should not kill the QR session.
         */
      }
    }, [
      sessionToken,
      finishDesktopVerification,
      expireCurrentSession,
      stopPolling,
      stopCountdown,
    ]);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    if (
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

  useEffect(() => {
    if (
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
    sessionToken,
    status,
    checkSession,
    stopPolling,
  ]);

  useEffect(() => {
    return () => {
      stopPolling();
      stopCountdown();
    };
  }, [
    stopPolling,
    stopCountdown,
  ]);

  function retrySession() {
    stopPolling();
    stopCountdown();

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

    void createSession();
  }

  async function handleCancel() {
    stopPolling();
    stopCountdown();

    if (sessionToken) {
      await cancelRemoteSession(
        sessionToken
      );
    }

    onCancel?.();
  }

  const phoneConnected =
    status === "scanning";

  const complete =
    status === "completed";

  return (
    <section
      className={`${manrope.className} flex h-full min-h-[590px] flex-col text-[#111]`}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-black/30">
            Fast pickup
          </div>

          <h2 className="mt-1 text-[28px] font-extrabold leading-[1.08] tracking-[-0.045em] text-black sm:text-[32px] 2xl:text-[36px]">
            Validate your
            documents
          </h2>

          <p className="mt-2 max-w-[560px] text-sm font-medium leading-6 text-black/45 2xl:text-[15px]">
            Verify your driving
            licence and your ID
            card or passport
            before continuing.
          </p>
        </div>

        {onCancel ? (
          <button
            type="button"
            onClick={() => {
              void handleCancel();
            }}
            className="shrink-0 border border-black/12 bg-white px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black/55 transition hover:border-black hover:bg-black hover:text-white active:scale-[0.97]"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="mt-6 border-y border-black/10 py-4">
        <CheckoutProgress />
      </div>

      <div className="flex flex-1 flex-col pt-5">
        {status ===
        "creating" ? (
          <div className="flex min-h-[390px] flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center">
            <Spinner />

            <h3 className="mt-5 text-[20px] font-extrabold tracking-[-0.035em] text-black">
              Preparing secure
              verification
            </h3>

            <p className="mt-2 text-sm font-medium text-black/42">
              Generating your
              private QR code...
            </p>
          </div>
        ) : null}

        {(status ===
          "pending" ||
          phoneConnected) &&
        verificationUrl ? (
          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="border border-black/10 bg-white px-5 py-5 sm:px-7 sm:py-6"
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
                    driving
                    licence
                  </strong>{" "}
                  and your{" "}
                  <strong className="font-extrabold text-black">
                    ID card or
                    passport
                  </strong>{" "}
                  in your hand.
                  Scan the QR code
                  below and validate
                  them securely on
                  your phone.
                </p>
              </div>

              <CountdownRing
                secondsLeft={
                  secondsLeft
                }
              />
            </div>

            <div className="mt-6 grid items-center gap-7 md:grid-cols-[292px_minmax(0,1fr)]">
              <div className="flex justify-center md:justify-start">
                <AnimatedQrFrame
                  verificationUrl={
                    verificationUrl
                  }
                />
              </div>

              <div className="flex min-h-[250px] flex-col justify-center border-t border-black/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex items-center gap-3">
                  <StatusDot
                    connected={
                      phoneConnected
                    }
                  />

                  <div>
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
                    <DocumentReadyLine text="Driving licence" />

                    <DocumentReadyLine text="ID card or passport" />
                  </div>
                </div>

                <div className="mt-6 border-t border-black/10 pt-4">
                  <p className="text-[11px] font-medium leading-5 text-black/36">
                    This secure
                    verification
                    session expires
                    automatically when
                    the timer reaches
                    zero.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
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
            className="flex min-h-[390px] flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center"
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
              Validation completed.
              Preparing your
              customer details...
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Spinner />

              <span className="text-xs font-bold text-black/45">
                Continuing
                automatically
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
            className="flex min-h-[390px] flex-col items-center justify-center border border-red-200 bg-red-50 px-6 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-xl font-extrabold text-white">
              !
            </div>

            <h3 className="mt-5 text-[22px] font-extrabold tracking-[-0.035em] text-red-900">
              {status ===
              "expired"
                ? "QR code expired"
                : status ===
                    "cancelled"
                  ? "Verification cancelled"
                  : "Verification unavailable"}
            </h3>

            <p className="mt-2 max-w-[430px] text-sm font-semibold leading-6 text-red-700">
              {error ||
                "Create a new secure QR code to continue."}
            </p>

            <button
              type="button"
              onClick={
                retrySession
              }
              className="mt-6 bg-black px-6 py-3.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-black/80 active:scale-[0.98]"
            >
              Generate new QR
            </button>
          </motion.div>
        ) : null}
      </div>
    </section>
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