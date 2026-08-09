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

type Props = {
  autoStart?: boolean;

  onComplete?: (
    payload: DocumentVerificationPayload
  ) => void;

  onCancel?: () => void;
};

type SessionData = {
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
  return String(search.get(name) || "").trim();
}

export default function DocumentVerification({
  autoStart = true,
  onComplete,
  onCancel,
}: Props) {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const completedRef = useRef(false);

  const [session, setSession] =
    useState<SessionData | null>(null);

  const [status, setStatus] = useState<
    | "idle"
    | "preparing"
    | "checking"
    | "ready"
    | "error"
  >("idle");

  const [error, setError] = useState("");

  const fleetGroup = useMemo(() => {
    return (
      param(searchParams, "fleetGroup") ||
      "scooter"
    );
  }, [searchParams]);

  const vehicleName = useMemo(() => {
    return (
      param(searchParams, "vehicleName") ||
      param(searchParams, "vehicle") ||
      "scooter"
    );
  }, [searchParams]);

  const returnedToken = useMemo(() => {
    return param(
      searchParams,
      "verification_session"
    );
  }, [searchParams]);

  const finish = useCallback(
    (data: SessionData) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;

      const licenceData: ExtractedDocumentData = {
        ...EMPTY_DOCUMENT,

        firstName: data.firstName || "",

        lastName: data.lastName || "",

        fullName: [
          data.firstName,
          data.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        address: data.homeAddress || "",
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

        sessionToken: data.sessionToken,
        bookingId: data.bookingId,

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

      setSession(data);
      setStatus("ready");

      return data;
    }, [
      locale,
      fleetGroup,
      vehicleName,
    ]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        /*
         * Customer returned from the
         * dedicated scanner route.
         */
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
            data.status === "completed"
          ) {
            finish(data);
            return;
          }

          if (
            data.status === "failed"
          ) {
            throw new Error(
              data.errorMessage ||
                "Documents were not accepted."
            );
          }
        }

        /*
         * Prepare the secure session
         * while the customer reads
         * the instructions.
         */
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

  async function openScanner() {
    try {
      let data = session;

      /*
       * Recheck the session before
       * navigating in case it expired
       * while the customer waited.
       */
      if (
        data?.sessionToken &&
        data.verifyPath
      ) {
        const current =
          await readSession(
            data.sessionToken
          );

        if (
          current.status !== "pending" &&
          current.status !== "scanning"
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

      /*
       * This performs real navigation.
       * Checkout disappears completely.
       */
      const scannerUrl = new URL(
        data.verifyPath,
        window.location.origin
      );

      scannerUrl.searchParams.set(
        "return",
        window.location.href
      );

      window.location.assign(
        scannerUrl.toString()
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

  return (
    <section
      id="nexa-document-verification"
      className="border border-black/10 bg-white p-5 md:p-6"
    >
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
        Faster pickup · Secure documents
      </div>

      <h2 className="mt-2 text-[28px] font-black leading-none tracking-[-0.045em] text-black">
        Validate your documents
      </h2>

      <p className="mt-3 max-w-2xl text-[13px] font-medium leading-6 text-black/58">
        Open the private full-screen
        scanner and photograph your
        driving licence plus a passport
        or ID card.
      </p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {[
          "Licence front + back",
          "Passport or ID",
          "Automatic screening",
        ].map((text, index) => (
          <div
            key={text}
            className="flex min-h-[52px] items-center gap-3 border border-black/10 bg-[#f7f7f7] px-3 py-2"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-black text-white">
              {index + 1}
            </span>

            <span className="text-[11px] font-black text-black/65">
              {text}
            </span>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void openScanner()
        }
        className="mt-5 min-h-[58px] w-full bg-black px-5 text-[13px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#222] active:scale-[0.99] disabled:cursor-wait disabled:bg-black/30"
      >
        {busy
          ? "Preparing secure scanner..."
          : "Open document scanner"}
      </button>

      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full py-2 text-[11px] font-black text-black/45"
        >
          Cancel and go back
        </button>
      ) : null}
    </section>
  );
}