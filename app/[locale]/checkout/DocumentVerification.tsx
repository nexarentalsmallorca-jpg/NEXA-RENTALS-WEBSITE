"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export type IdentityDocumentType =
  | "id"
  | "passport";

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

type Props = {
  autoStart?: boolean;

  from?: Date | null;
  to?: Date | null;

  pickupTime: string;
  dropoffTime: string;

  onComplete?: (
    payload: DocumentVerificationPayload
  ) => void;

  onCancel?: () => void;
};

type SessionStatus =
  | "pending"
  | "scanning"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

type InterfaceStatus =
  | "idle"
  | "preparing"
  | "checking"
  | "ready"
  | "error";

type SessionData = {
  success: boolean;

  sessionToken?: string;
  bookingId?: string;

  status?: SessionStatus;

  identityType?: IdentityDocumentType | null;

  analysisOutcome?:
    | "accepted"
    | "retake"
    | "manual_review"
    | "rejected"
    | null;

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

  verifyPath?: string;

  error?: string;
  errorMessage?: string;
};

const EMPTY_DOCUMENT: ExtractedDocumentData = {
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

function param(
  search: {
    get(name: string): string | null;
  },
  name: string
) {
  return String(
    search.get(name) || ""
  ).trim();
}

function localIsoDate(
  value?: Date | null
) {
  if (
    !value ||
    !Number.isFinite(value.getTime())
  ) {
    return "";
  }

  const year = value.getFullYear();

  const month = String(
    value.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    value.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeScannerUrl(
  data: SessionData,
  includeReturnUrl: boolean
) {
  if (
    typeof window === "undefined" ||
    !data.verifyPath
  ) {
    return "";
  }

  const url = new URL(
    data.verifyPath,
    window.location.origin
  );

  if (includeReturnUrl) {
    url.searchParams.set(
      "return",
      window.location.href
    );
  }

  return url.toString();
}

export default function DocumentVerification({
  autoStart = true,
  from,
  to,
  pickupTime,
  dropoffTime,
  onComplete,
  onCancel,
}: Props) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const completedRef = useRef(false);

  const [session, setSession] =
    useState<SessionData | null>(null);

  const [status, setStatus] =
    useState<InterfaceStatus>("idle");

  const [error, setError] =
    useState("");

  const [qrUrl, setQrUrl] =
    useState("");

  const fleetGroup = useMemo(
    () =>
      param(
        searchParams,
        "fleetGroup"
      ) || "scooter",
    [searchParams]
  );

  const vehicleName = useMemo(
    () =>
      param(
        searchParams,
        "vehicleName"
      ) ||
      param(
        searchParams,
        "vehicle"
      ) ||
      "scooter",
    [searchParams]
  );

  const returnedToken = useMemo(
    () =>
      param(
        searchParams,
        "verification_session"
      ),
    [searchParams]
  );

  const rentalStartDate = useMemo(
    () => localIsoDate(from),
    [from]
  );

  const rentalEndDate = useMemo(
    () => localIsoDate(to),
    [to]
  );

  const finish = useCallback(
    (data: SessionData) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;

      const licenceData: ExtractedDocumentData = {
        ...EMPTY_DOCUMENT,

        firstName:
          data.firstName || "",

        lastName:
          data.lastName || "",

        fullName: [
          data.firstName,
          data.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        address:
          data.homeAddress || "",
      };

      onComplete?.({
        identityType:
          data.identityType === "passport"
            ? "passport"
            : "id",

        dlFront: null,
        dlBack: null,

        idFront: null,
        idBack: null,

        passport: null,

        licenceData,
        identityData: null,

        rawLicenceResult: null,
        rawIdentityResult: null,

        sessionToken:
          data.sessionToken,

        bookingId:
          data.bookingId,

        dlFrontPath:
          data.dlFrontPath || "",

        dlBackPath:
          data.dlBackPath || "",

        idFrontPath:
          data.idFrontPath || "",

        idBackPath:
          data.idBackPath || "",

        dlFrontName:
          data.dlFrontName || "",

        dlBackName:
          data.dlBackName || "",

        idFrontName:
          data.idFrontName || "",

        idBackName:
          data.idBackName || "",
      });
    },
    [onComplete]
  );

  const readSession = useCallback(
    async (token: string) => {
      const response = await fetch(
        `/api/document-verification/session?session=${encodeURIComponent(
          token
        )}`,
        {
          cache: "no-store",
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
            "Could not read verification session."
        );
      }

      return data;
    },
    []
  );

  const createSession =
    useCallback(async () => {
      setStatus("preparing");
      setError("");
      setQrUrl("");

      if (
        !rentalStartDate ||
        !rentalEndDate
      ) {
        throw new Error(
          "Please select valid pickup and return dates before verifying documents."
        );
      }

      const response = await fetch(
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
            rentalStartDate,
            rentalEndDate,
            pickupTime,
            dropoffTime,
          }),
        }
      );

      const data =
        (await response.json()) as SessionData;

      if (
        !response.ok ||
        !data.success ||
        !data.sessionToken ||
        !data.verifyPath
      ) {
        throw new Error(
          data.error ||
            "Could not create the secure scanner session."
        );
      }

      const desktopScannerUrl =
        makeScannerUrl(
          data,
          false
        );

      if (!desktopScannerUrl) {
        throw new Error(
          "Could not generate the secure QR code."
        );
      }

      setSession(data);
      setQrUrl(desktopScannerUrl);
      setStatus("ready");

      return data;
    }, [
      locale,
      fleetGroup,
      vehicleName,
      rentalStartDate,
      rentalEndDate,
      pickupTime,
      dropoffTime,
    ]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        if (returnedToken) {
          setStatus("checking");

          const data =
            await readSession(
              returnedToken
            );

          if (cancelled) {
            return;
          }

          if (
            data.status ===
            "completed"
          ) {
            finish(data);
            return;
          }

          if (
            data.status ===
            "failed"
          ) {
            throw new Error(
              data.errorMessage ||
                "Documents were not accepted."
            );
          }
        }

        if (
          autoStart &&
          !cancelled
        ) {
          await createSession();
        }
      } catch (caught: any) {
        if (!cancelled) {
          setError(
            caught?.message ||
              "Could not prepare document verification."
          );

          setStatus("error");
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [
    autoStart,
    createSession,
    finish,
    readSession,
    returnedToken,
  ]);

  useEffect(() => {
    const token =
      session?.sessionToken;

    if (!token) {
      return;
    }

    let stopped = false;

    let timer:
      | number
      | undefined;

    async function checkSession() {
      try {
        const data =
          await readSession(
            token as string
          );

        if (
          stopped ||
          completedRef.current
        ) {
          return;
        }

        if (
          data.status ===
          "completed"
        ) {
          setStatus("checking");
          finish(data);
          return;
        }

        if (
          data.status ===
          "failed"
        ) {
          setError(
            data.errorMessage ||
              "Documents were not accepted."
          );

          setStatus("error");
          return;
        }

        if (
          data.status ===
            "expired" ||
          data.status ===
            "cancelled"
        ) {
          setError(
            "The secure scanner link expired. Create a new scanner link and try again."
          );

          setStatus("error");
          return;
        }
      } catch {
        /*
         * Temporary polling interruption:
         * retry automatically.
         */
      }

      if (!stopped) {
        timer =
          window.setTimeout(
            checkSession,
            1300
          );
      }
    }

    timer =
      window.setTimeout(
        checkSession,
        700
      );

    return () => {
      stopped = true;

      if (timer) {
        window.clearTimeout(
          timer
        );
      }
    };
  }, [
    session?.sessionToken,
    finish,
    readSession,
  ]);

  async function prepareAgain() {
    try {
      completedRef.current =
        false;

      setSession(null);
      setQrUrl("");

      await createSession();
    } catch (caught: any) {
      setError(
        caught?.message ||
          "Could not create a new scanner link."
      );

      setStatus("error");
    }
  }

  async function openScanner() {
    try {
      setError("");

      let data = session;

      if (
        data?.sessionToken &&
        data.verifyPath
      ) {
        const current =
          await readSession(
            data.sessionToken
          );

        if (
          current.status ===
          "completed"
        ) {
          setStatus("checking");
          finish(current);
          return;
        }

        if (
          current.status !==
            "pending" &&
          current.status !==
            "scanning"
        ) {
          data =
            await createSession();
        }
      } else {
        data =
          await createSession();
      }

      if (
        !data.verifyPath ||
        !data.sessionToken
      ) {
        throw new Error(
          "Scanner link is missing."
        );
      }

      const mobileScannerUrl =
        makeScannerUrl(
          data,
          true
        );

      if (!mobileScannerUrl) {
        throw new Error(
          "Could not open the secure scanner."
        );
      }

      window.location.assign(
        mobileScannerUrl
      );
    } catch (caught: any) {
      setError(
        caught?.message ||
          "Could not open the scanner."
      );

      setStatus("error");
    }
  }

  const busy =
    status === "preparing" ||
    status === "checking";

  const qrReady =
    status === "ready" &&
    Boolean(qrUrl);

  return (
    <section
      id="nexa-document-verification"
      className="overflow-hidden border border-black/10 bg-white"
    >
      <div className="p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
              Faster pickup · Secure documents
            </div>

            <h2 className="mt-2 text-[28px] font-black leading-none tracking-[-0.045em] text-black md:text-[32px]">
              Validate your documents
            </h2>

            <p className="mt-3 max-w-2xl text-[13px] font-medium leading-6 text-black/58">
              Verify your driving
              licence and passport or
              ID before pickup.
            </p>
          </div>

          <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700 sm:block">
            Secure session
          </div>
        </div>

        {error ? (
          <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[12px] font-bold leading-5 text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void prepareAgain()
              }
              className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-red-800 underline underline-offset-4"
            >
              Create a new secure link
            </button>
          </div>
        ) : null}

        <div className="mt-7 hidden md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-center md:gap-10">
          <div className="mx-auto w-full max-w-[286px]">
            <div className="nexa-gradient-frame rounded-[27px] p-[2px] shadow-[0_24px_60px_rgba(41,31,89,0.18)]">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[25px] bg-white p-[20px]">
                {qrReady ? (
                  <div className="w-full overflow-hidden rounded-[16px] bg-white p-2">
                    <QRCodeSVG
                      value={qrUrl}
                      size={230}
                      level="M"
                      marginSize={0}
                      bgColor="#ffffff"
                      fgColor="#050505"
                      title="Scan to verify your NEXA Rentals documents"
                      className="h-auto w-full"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="nexa-loader h-11 w-11 rounded-full border-[3px] border-black/10 border-t-black" />

                    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.14em] text-black/45">
                      {status ===
                      "checking"
                        ? "Checking documents"
                        : "Creating secure QR"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.12em] text-black/35">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Private one-time scanner
            </div>
          </div>

          <div>
            <DesktopInstruction
              number="1"
              title="Scan this QR code"
              description="Open your phone camera and scan the QR code shown on this screen."
              active
            />

            <DesktopInstruction
              number="2"
              title="Verify your documents"
              description="Scan the front and back of your driving licence, then choose an ID card or passport."
            />

            <DesktopInstruction
              number="3"
              title="Keep this page open"
              description="When verification finishes on your phone, this checkout will update automatically."
              last
            />
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["1", "Licence"],
              ["2", "ID or passport"],
              ["3", "Finish"],
            ].map(
              ([number, label]) => (
                <div
                  key={number}
                  className="min-h-[74px] border border-black/10 bg-[#f7f7f7] px-2 py-3 text-center"
                >
                  <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                    {number}
                  </span>

                  <div className="mt-2 text-[9px] font-black leading-3 text-black/55">
                    {label}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="nexa-heartbeat mt-5">
            <div className="nexa-gradient-button rounded-[15px] p-[2px] shadow-[0_18px_45px_rgba(86,67,214,0.28)]">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void openScanner()
                }
                className="flex min-h-[62px] w-full items-center justify-center gap-3 rounded-[13px] bg-transparent px-5 text-[12px] font-black uppercase tracking-[0.13em] text-white transition active:scale-[0.975] disabled:cursor-wait disabled:text-white/70"
              >
                {busy ? (
                  <>
                    <span className="nexa-loader h-5 w-5 rounded-full border-2 border-white/30 border-t-white" />
                    Preparing scanner
                  </>
                ) : (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18 text-[16px]">
                      ▣
                    </span>

                    Verify your documents
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mx-auto mt-3 max-w-sm text-center text-[10px] font-bold leading-4 text-black/40">
            Opens the private
            full-screen camera scanner
            on this phone.
          </p>
        </div>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="mt-5 w-full py-2 text-[11px] font-black text-black/45"
          >
            Cancel and go back
          </button>
        ) : null}
      </div>

      <style jsx global>{`
        @keyframes nexa-gradient-flow {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes nexa-heartbeat {
          0%,
          42%,
          100% {
            transform: scale(1);
          }

          48% {
            transform: scale(1.018);
          }

          54% {
            transform: scale(1);
          }

          60% {
            transform: scale(1.012);
          }

          66% {
            transform: scale(1);
          }
        }

        @keyframes nexa-loader-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .nexa-gradient-frame,
        .nexa-gradient-button {
          background: linear-gradient(
            115deg,
            #24c8ff,
            #536dfe,
            #8b5cf6,
            #d946ef,
            #ff7a18,
            #24c8ff
          );

          background-size: 320% 320%;

          animation:
            nexa-gradient-flow
            4.2s
            ease
            infinite;
        }

        .nexa-heartbeat {
          transform-origin: center;

          animation:
            nexa-heartbeat
            2.2s
            ease-in-out
            infinite;
        }

        .nexa-loader {
          animation:
            nexa-loader-spin
            0.8s
            linear
            infinite;
        }

        @media (
          prefers-reduced-motion:
            reduce
        ) {
          .nexa-gradient-frame,
          .nexa-gradient-button,
          .nexa-heartbeat,
          .nexa-loader {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

function DesktopInstruction({
  number,
  title,
  description,
  active = false,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      <div className="relative flex shrink-0 flex-col items-center">
        <div
          className={[
            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-black",

            active
              ? "bg-black text-white shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
              : "border border-black/12 bg-white text-black/45",
          ].join(" ")}
        >
          {number}
        </div>

        {!last ? (
          <div className="h-[54px] w-px bg-black/10" />
        ) : null}
      </div>

      <div className="pt-1">
        <h3 className="text-[15px] font-black tracking-[-0.02em] text-black">
          {title}
        </h3>

        <p className="mt-1 max-w-md text-[11px] font-semibold leading-5 text-black/48">
          {description}
        </p>
      </div>
    </div>
  );
}