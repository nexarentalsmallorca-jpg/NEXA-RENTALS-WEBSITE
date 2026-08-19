"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  CHECKOUT_LANGUAGES,
  formatCheckoutText,
  getCheckoutCopy,
  type CheckoutLocale,
} from "./checkoutI18n";

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

export type DriverProfile = {
  driverIndex: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
};

export type VerifiedDriver = {
  profile: DriverProfile;

  status:
    | "approved"
    | "manual_review"
    | "rejected";

  message: string;
  messageKey: string;
  reasons: string[];

  identityType: IdentityDocumentType;

  sessionToken: string;
  bookingId: string;

  licenceData: ExtractedDocumentData;
  identityData: ExtractedDocumentData | null;

  dlFrontPath: string;
  dlBackPath: string;
  idFrontPath: string;
  idBackPath: string;

  dlFrontName: string;
  dlBackName: string;
  idFrontName: string;
  idBackName: string;

  continueAsPassenger: boolean;
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

  drivers: VerifiedDriver[];

  requestedQuantity: number;
  approvedQuantity: number;
  rejectedQuantity: number;

  passengers: DriverProfile[];
};

type Props = {
  autoStart?: boolean;

  locale?: CheckoutLocale;

  from?: Date | null;
  to?: Date | null;

  pickupTime: string;
  dropoffTime: string;

  quantity?: number;

  vehicleName?: string;
  fleetGroup?: string;

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

type SessionData = {
  success: boolean;

  sessionToken?: string;
  bookingId?: string;

  status?: SessionStatus;

  identityType?:
    | IdentityDocumentType
    | null;

  analysisOutcome?:
    | "accepted"
    | "retake"
    | "manual_review"
    | "rejected"
    | null;

  messageKey?: string;
  reasons?: string[];

  driverProfile?:
    | DriverProfile
    | null;

  driverCount?: number;

  firstName?: string;
  lastName?: string;
  homeAddress?: string;

  licenceData?:
    | Partial<ExtractedDocumentData>
    | null;

  identityData?:
    | Partial<ExtractedDocumentData>
    | null;

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

type DriverSession = SessionData & {
  driverIndex: number;
  sessionToken: string;
  bookingId: string;
  status: SessionStatus;
  verifyPath: string;
  qrUrl: string;
};

type StoredState = {
  sessions: DriverSession[];
  results: VerifiedDriver[];

  bookingId: string;
  rootSessionToken: string;

  passengerIndexes: number[];
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

function clean(
  value: unknown
) {
  return String(
    value ??
    ""
  ).trim();
}

function param(
  search: {
    get(
      name: string
    ): string | null;
  },
  name: string
) {
  return clean(
    search.get(
      name
    )
  );
}

function localIsoDate(
  value?: Date | null
) {
  if (
    !value ||
    !Number.isFinite(
      value.getTime()
    )
  ) {
    return "";
  }

  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() +
      1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );

  return [
    year,
    month,
    day,
  ].join(
    "-"
  );
}

function completeDocument(
  value:
    | Partial<ExtractedDocumentData>
    | null
    | undefined
): ExtractedDocumentData {
  return {
    ...EMPTY_DOCUMENT,
    ...(
      value ||
      {}
    ),

    vehicleClasses:
      Array.isArray(
        value
          ?.vehicleClasses
      )
        ? value
            .vehicleClasses
        : [],
  };
}

function emptyProfile(
  driverIndex: number
): DriverProfile {
  return {
    driverIndex,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  };
}

function makeScannerUrl(
  verifyPath: string,
  includeReturnUrl: boolean,
  locale: CheckoutLocale,
  flow:
    | "desktop"
    | "mobile" = "desktop"
) {
  if (
    typeof window ===
      "undefined" ||
    !verifyPath
  ) {
    return "";
  }

  const url =
    new URL(
      verifyPath,
      window.location.origin
    );

  const pathParts =
    url.pathname
      .split("/")
      .filter(Boolean);

  const hasLocalePrefix =
    pathParts.length > 0 &&
    CHECKOUT_LANGUAGES.some(
      (language) =>
        language.code ===
        pathParts[0]
    );

  if (hasLocalePrefix) {
    pathParts[0] = locale;
  } else {
    pathParts.unshift(
      locale
    );
  }

  url.pathname =
    `/${pathParts.join("/")}`;

  url.searchParams.set(
    "verification_flow",
    flow
  );

  if (
    includeReturnUrl
  ) {
    url.searchParams.set(
      "return",
      window.location.href
    );
  }

  return url.toString();
}

function driverIndexFromData(
  data: SessionData,
  fallback = 1
) {
  return Math.min(
    15,
    Math.max(
      1,
      Number(
        data.driverProfile
          ?.driverIndex
      ) ||
        fallback
    )
  );
}

function isFinishedStatus(
  status:
    | SessionStatus
    | undefined
) {
  return (
    status ===
      "completed" ||
    status ===
      "failed"
  );
}

function upsertSession(
  current: DriverSession[],
  next: DriverSession
) {
  return [
    ...current.filter(
      (item) =>
        item.driverIndex !==
        next.driverIndex
    ),
    next,
  ].sort(
    (
      a,
      b
    ) =>
      a.driverIndex -
      b.driverIndex
  );
}

function upsertResult(
  current: VerifiedDriver[],
  next: VerifiedDriver
) {
  return [
    ...current.filter(
      (item) =>
        item.profile
          .driverIndex !==
        next.profile
          .driverIndex
    ),
    next,
  ].sort(
    (
      a,
      b
    ) =>
      a.profile
        .driverIndex -
      b.profile
        .driverIndex
  );
}

function resultFromSession(
  data: SessionData,
  fallbackDriverIndex: number
): VerifiedDriver {
  const driverIndex =
    driverIndexFromData(
      data,
      fallbackDriverIndex
    );

  const licenceData =
    completeDocument(
      data.licenceData
    );

  const identityData =
    data.identityData
      ? completeDocument(
          data.identityData
        )
      : null;

  const storedProfile =
    data.driverProfile ||
    emptyProfile(
      driverIndex
    );

  const profile: DriverProfile = {
    ...emptyProfile(
      driverIndex
    ),
    ...storedProfile,

    driverIndex,

    firstName:
      clean(
        data.firstName
      ) ||
      clean(
        licenceData
          .firstName
      ) ||
      clean(
        identityData
          ?.firstName
      ) ||
      clean(
        storedProfile
          .firstName
      ),

    lastName:
      clean(
        data.lastName
      ) ||
      clean(
        licenceData
          .lastName
      ) ||
      clean(
        identityData
          ?.lastName
      ) ||
      clean(
        storedProfile
          .lastName
      ),

    address:
      clean(
        data.homeAddress
      ) ||
      clean(
        identityData
          ?.address
      ) ||
      clean(
        licenceData
          .address
      ) ||
      clean(
        storedProfile
          .address
      ),
  };

  const rejected =
    data.status ===
      "failed" ||
    data.analysisOutcome ===
      "rejected";

  const manualReview =
    !rejected &&
    data.analysisOutcome ===
      "manual_review";

  return {
    profile,

    status:
      rejected
        ? "rejected"
        : manualReview
          ? "manual_review"
          : "approved",

    message:
      clean(
        data.errorMessage ||
        data.error
      ),

    messageKey:
      clean(
        data.messageKey
      ),

    reasons:
      Array.isArray(
        data.reasons
      )
        ? data.reasons.map(
            clean
          )
        : [],

    identityType:
      data.identityType ===
        "passport"
        ? "passport"
        : "id",

    sessionToken:
      clean(
        data.sessionToken
      ),

    bookingId:
      clean(
        data.bookingId
      ),

    licenceData,
    identityData,

    dlFrontPath:
      clean(
        data.dlFrontPath
      ),

    dlBackPath:
      clean(
        data.dlBackPath
      ),

    idFrontPath:
      clean(
        data.idFrontPath
      ),

    idBackPath:
      clean(
        data.idBackPath
      ),

    dlFrontName:
      clean(
        data.dlFrontName
      ),

    dlBackName:
      clean(
        data.dlBackName
      ),

    idFrontName:
      clean(
        data.idFrontName
      ),

    idBackName:
      clean(
        data.idBackName
      ),

    continueAsPassenger:
      false,
  };
}

function resultName(
  result: VerifiedDriver,
  driverLabel: string
) {
  return (
    [
      result.profile
        .firstName,
      result.profile
        .lastName,
    ]
      .filter(
        Boolean
      )
      .join(
        " "
      )
      .trim() ||
    driverLabel + " " +
      result.profile
        .driverIndex
  );
}

export default function DocumentVerification({
  autoStart = true,

  locale = "en",

  from,
  to,

  pickupTime,
  dropoffTime,

  quantity = 1,

  vehicleName:
    vehicleNameProp,

  fleetGroup:
    fleetGroupProp,

  onComplete,
  onCancel,
}: Props) {
  const copy =
    useMemo(
      () =>
        getCheckoutCopy(
          locale
        ),
      [locale]
    );

  const searchParams =
    useSearchParams();

  const requestedQuantity =
    Math.min(
      15,
      Math.max(
        1,
        Math.floor(
          quantity ||
          1
        )
      )
    );

  const vehicleName =
    clean(
      vehicleNameProp
    ) ||
    param(
      searchParams,
      "vehicleName"
    ) ||
    param(
      searchParams,
      "vehicle"
    ) ||
    "scooter";

  const fleetGroup =
    clean(
      fleetGroupProp
    ) ||
    param(
      searchParams,
      "fleetGroup"
    ) ||
    "scooter";

  const returnedToken =
    param(
      searchParams,
      "verification_session"
    );

  const rentalStartDate =
    localIsoDate(
      from
    );

  const rentalEndDate =
    localIsoDate(
      to
    );

  const storageKey =
    [
      "nexa-driver-verification-v3",
      fleetGroup,
      rentalStartDate,
      rentalEndDate,
      requestedQuantity,
    ].join(
      ":"
    );

  const [
    sessions,
    setSessions,
  ] =
    useState<
      DriverSession[]
    >([]);

  const [
    results,
    setResults,
  ] =
    useState<
      VerifiedDriver[]
    >([]);

  const [
    bookingId,
    setBookingId,
  ] =
    useState(
      ""
    );

  const [
    rootSessionToken,
    setRootSessionToken,
  ] =
    useState(
      ""
    );

  const [
    passengerIndexes,
    setPassengerIndexes,
  ] =
    useState<
      number[]
    >([]);

  const [
    restored,
    setRestored,
  ] =
    useState(
      false
    );

  const [
    preparing,
    setPreparing,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );

  const sessionsRef =
    useRef<
      DriverSession[]
    >([]);

  const resultsRef =
    useRef<
      VerifiedDriver[]
    >([]);

  const rootTokenRef =
    useRef(
      ""
    );

  const creatingRef =
    useRef(
      false
    );

  const completionSentRef =
    useRef(
      false
    );

  const handledReturnTokenRef =
    useRef(
      ""
    );

  useEffect(
    () => {
      sessionsRef.current =
        sessions;
    },
    [
      sessions,
    ]
  );

  useEffect(
    () => {
      resultsRef.current =
        results;
    },
    [
      results,
    ]
  );

  useEffect(
    () => {
      rootTokenRef.current =
        rootSessionToken;
    },
    [
      rootSessionToken,
    ]
  );

  useEffect(
    () => {
      try {
        const raw =
          window.sessionStorage
            .getItem(
              storageKey
            );

        if (
          raw
        ) {
          const saved =
            JSON.parse(
              raw
            ) as StoredState;

          const savedSessions =
            Array.isArray(
              saved.sessions
            )
              ? saved.sessions
                  .filter(
                    (item) =>
                      Boolean(
                        item
                          ?.sessionToken
                      )
                  )
              : [];

          const savedResults =
            Array.isArray(
              saved.results
            )
              ? saved.results
              : [];

          sessionsRef.current =
            savedSessions;

          resultsRef.current =
            savedResults;

          rootTokenRef.current =
            clean(
              saved
                .rootSessionToken
            );

          setSessions(
            savedSessions
          );

          setResults(
            savedResults
          );

          setBookingId(
            clean(
              saved.bookingId
            )
          );

          setRootSessionToken(
            clean(
              saved
                .rootSessionToken
            )
          );

          setPassengerIndexes(
            Array.isArray(
              saved
                .passengerIndexes
            )
              ? saved
                  .passengerIndexes
              : []
          );
        }
      } catch {
        window.sessionStorage
          .removeItem(
            storageKey
          );
      } finally {
        setRestored(
          true
        );
      }
    },
    [
      storageKey,
    ]
  );

  useEffect(
    () => {
      if (
        !restored
      ) {
        return;
      }

      const stored:
        StoredState = {
        sessions,
        results,
        bookingId,
        rootSessionToken,
        passengerIndexes,
      };

      window.sessionStorage
        .setItem(
          storageKey,
          JSON.stringify(
            stored
          )
        );
    },
    [
      restored,
      storageKey,
      sessions,
      results,
      bookingId,
      rootSessionToken,
      passengerIndexes,
    ]
  );

  const readSession =
    useCallback(
      async (
        token: string
      ) => {
        const response =
          await fetch(
            "/api/document-verification/session?session=" +
              encodeURIComponent(
                token
              ),
            {
              cache:
                "no-store",
            }
          );

        const data =
          (
            await response.json()
          ) as SessionData;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
            copy.sessionReadError
          );
        }

        return data;
      },
      [
        copy.sessionReadError,
      ]
    );

  const mergeSessionData =
    useCallback(
      (
        driverIndex: number,
        data: SessionData
      ) => {
        const previous =
          sessionsRef.current
            .find(
              (item) =>
                item.driverIndex ===
                driverIndex
            );

        const verifyPath =
          clean(
            data.verifyPath
          ) ||
          previous
            ?.verifyPath ||
          "";

        const sessionToken =
          clean(
            data.sessionToken
          ) ||
          previous
            ?.sessionToken ||
          "";

        const next:
          DriverSession = {
          ...previous,
          ...data,

          success:
            true,

          driverIndex,

          sessionToken,

          bookingId:
            clean(
              data.bookingId
            ) ||
            previous
              ?.bookingId ||
            bookingId,

          status:
            data.status ||
            previous
              ?.status ||
            "pending",

          verifyPath,

          qrUrl:
            verifyPath
              ? makeScannerUrl(
                  verifyPath,
                  false,
                  locale,
                  "desktop"
                )
              : previous
                  ?.qrUrl ||
                "",
        };

        const nextSessions =
          upsertSession(
            sessionsRef.current,
            next
          );

        sessionsRef.current =
          nextSessions;

        setSessions(
          nextSessions
        );

        if (
          next.bookingId
        ) {
          setBookingId(
            next.bookingId
          );
        }

        if (
          isFinishedStatus(
            next.status
          )
        ) {
          const nextResult =
            resultFromSession(
              next,
              driverIndex
            );

          const nextResults =
            upsertResult(
              resultsRef.current,
              nextResult
            );

          resultsRef.current =
            nextResults;

          setResults(
            nextResults
          );
        }
      },
      [
        bookingId,
        locale,
      ]
    );

  const createOneSession =
    useCallback(
      async (
        driverIndex: number,
        parentToken: string
      ) => {
        if (
          !rentalStartDate ||
          !rentalEndDate
        ) {
          throw new Error(
            copy.invalidDates
          );
        }

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
                  rentalStartDate,
                  rentalEndDate,
                  pickupTime,
                  dropoffTime,

                  driverIndex,

                  driverCount:
                    requestedQuantity,

                  driverProfile:
                    emptyProfile(
                      driverIndex
                    ),

                  parentSessionToken:
                    parentToken,
                }),
            }
          );

        const data =
          (
            await response.json()
          ) as SessionData;

        if (
          !response.ok ||
          !data.success ||
          !data.sessionToken ||
          !data.bookingId ||
          !data.verifyPath
        ) {
          throw new Error(
            data.error ||
            copy.scannerPrepareError
          );
        }

        const created:
          DriverSession = {
          ...data,

          success:
            true,

          driverIndex,

          sessionToken:
            data.sessionToken,

          bookingId:
            data.bookingId,

          status:
            data.status ||
            "pending",

          verifyPath:
            data.verifyPath,

          qrUrl:
            makeScannerUrl(
              data.verifyPath,
              false,
              locale,
              "desktop"
            ),
        };

        return created;
      },
      [
        locale,
        fleetGroup,
        vehicleName,
        rentalStartDate,
        rentalEndDate,
        pickupTime,
        dropoffTime,
        requestedQuantity,
        copy.invalidDates,
        copy.scannerPrepareError,
      ]
    );

  const createMissingSessions =
    useCallback(
      async () => {
        if (
          creatingRef.current
        ) {
          return;
        }

        creatingRef.current =
          true;

        setPreparing(
          true
        );

        setError(
          ""
        );

        try {
          let parentToken =
            rootTokenRef.current;

          for (
            let driverIndex =
              1;
            driverIndex <=
              requestedQuantity;
            driverIndex +=
              1
          ) {
            const existing =
              sessionsRef.current
                .find(
                  (item) =>
                    item.driverIndex ===
                    driverIndex
                );

            if (
              existing
            ) {
              if (
                !parentToken
              ) {
                parentToken =
                  existing
                    .sessionToken;
              }

              continue;
            }

            const created =
              await createOneSession(
                driverIndex,
                parentToken
              );

            if (
              !parentToken
            ) {
              parentToken =
                created
                  .sessionToken;

              rootTokenRef.current =
                parentToken;

              setRootSessionToken(
                parentToken
              );
            }

            setBookingId(
              created
                .bookingId
            );

            const nextSessions =
              upsertSession(
                sessionsRef.current,
                created
              );

            sessionsRef.current =
              nextSessions;

            setSessions(
              nextSessions
            );
          }
        } catch (
          caught: any
        ) {
          setError(
            caught?.message ||
            copy.scannerPrepareError
          );
        } finally {
          creatingRef.current =
            false;

          setPreparing(
            false
          );
        }
      },
      [
        requestedQuantity,
        createOneSession,
      ]
    );

  useEffect(
    () => {
      if (
        !restored ||
        !autoStart
      ) {
        return;
      }

      /*
       * When returning from the mobile scanner, read that
       * session first so we preserve its original group.
       */
      if (
        returnedToken &&
        handledReturnTokenRef
          .current !==
          returnedToken
      ) {
        return;
      }

      if (
        sessionsRef.current
          .length >=
        requestedQuantity
      ) {
        return;
      }

      void createMissingSessions();
    },
    [
      restored,
      autoStart,
      returnedToken,
      sessions.length,
      requestedQuantity,
      createMissingSessions,
    ]
  );

  useEffect(
    () => {
      if (
        !restored ||
        !returnedToken ||
        handledReturnTokenRef
          .current ===
          returnedToken
      ) {
        return;
      }

      handledReturnTokenRef.current =
        returnedToken;

      void readSession(
        returnedToken
      )
        .then(
          (
            data
          ) => {
            const driverIndex =
              driverIndexFromData(
                data,
                1
              );

            if (
              !rootTokenRef.current
            ) {
              rootTokenRef.current =
                returnedToken;

              setRootSessionToken(
                returnedToken
              );
            }

            mergeSessionData(
              driverIndex,
              data
            );
          }
        )
        .catch(
          (
            caught: any
          ) => {
            setError(
              caught?.message ||
              copy.returnedResultError
            );
          }
        )
        .finally(
          () => {
            const url =
              new URL(
                window.location.href
              );

            url.searchParams
              .delete(
                "verification_session"
              );

            url.searchParams
              .delete(
                "verification_result"
              );

            window.history
              .replaceState(
                {},
                "",
                url.toString()
              );
          }
        );
    },
    [
      restored,
      returnedToken,
      readSession,
      mergeSessionData,
    ]
  );

  useEffect(
    () => {
      if (
        !restored
      ) {
        return;
      }

      let stopped =
        false;

      let timer:
        | number
        | undefined;

      async function poll() {
        const activeSessions =
          sessionsRef.current
            .filter(
              (item) =>
                item.status ===
                  "pending" ||
                item.status ===
                  "scanning"
            );

        if (
          activeSessions
            .length >
          0
        ) {
          const updates =
            await Promise.all(
              activeSessions.map(
                async (
                  item
                ) => {
                  try {
                    const data =
                      await readSession(
                        item.sessionToken
                      );

                    return {
                      driverIndex:
                        item.driverIndex,

                      data,
                    };
                  } catch {
                    return null;
                  }
                }
              )
            );

          if (
            stopped
          ) {
            return;
          }

          for (
            const update of
            updates
          ) {
            if (
              update
            ) {
              mergeSessionData(
                update.driverIndex,
                update.data
              );
            }
          }
        }

        if (
          !stopped
        ) {
          timer =
            window.setTimeout(
              poll,
              1300
            );
        }
      }

      timer =
        window.setTimeout(
          poll,
          650
        );

      return () => {
        stopped =
          true;

        if (
          timer
        ) {
          window.clearTimeout(
            timer
          );
        }
      };
    },
    [
      restored,
      readSession,
      mergeSessionData,
    ]
  );

  const approvedResults =
    useMemo(
      () =>
        results.filter(
          (item) =>
            item.status ===
              "approved" ||
            item.status ===
              "manual_review"
        ),
      [
        results,
      ]
    );

  const rejectedResults =
    useMemo(
      () =>
        results.filter(
          (item) =>
            item.status ===
              "rejected"
        ),
      [
        results,
      ]
    );

  const allFinished =
    results.length ===
    requestedQuantity;

  const sendComplete =
    useCallback(
      (
        finalResults:
          VerifiedDriver[],
        finalPassengerIndexes:
          number[]
      ) => {
        if (
          completionSentRef
            .current
        ) {
          return;
        }

        const approved =
          finalResults.filter(
            (item) =>
              item.status ===
                "approved" ||
              item.status ===
                "manual_review"
          );

        if (
          !approved.length
        ) {
          setError(
            copy.noneApproved
          );

          return;
        }

        const primary =
          approved[0];

        const passengerProfiles =
          finalResults
            .filter(
              (item) =>
                item.status ===
                  "rejected" &&
                finalPassengerIndexes.includes(
                  item.profile
                    .driverIndex
                )
            )
            .map(
              (item) =>
                item.profile
            );

        const drivers =
          finalResults.map(
            (item) => ({
              ...item,

              continueAsPassenger:
                passengerProfiles.some(
                  (profile) =>
                    profile.driverIndex ===
                    item.profile
                      .driverIndex
                ),
            })
          );

        completionSentRef.current =
          true;

        window.sessionStorage
          .removeItem(
            storageKey
          );

        onComplete?.({
          identityType:
            primary.identityType,

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

          licenceData:
            primary.licenceData,

          identityData:
            primary.identityData,

          rawLicenceResult:
            null,

          rawIdentityResult:
            null,

          sessionToken:
            primary.sessionToken,

          bookingId:
            primary.bookingId ||
            bookingId,

          dlFrontPath:
            primary.dlFrontPath,

          dlBackPath:
            primary.dlBackPath,

          idFrontPath:
            primary.idFrontPath,

          idBackPath:
            primary.idBackPath,

          dlFrontName:
            primary.dlFrontName,

          dlBackName:
            primary.dlBackName,

          idFrontName:
            primary.idFrontName,

          idBackName:
            primary.idBackName,

          drivers,

          requestedQuantity,

          approvedQuantity:
            approved.length,

          rejectedQuantity:
            finalResults.length -
            approved.length,

          passengers:
            passengerProfiles,
        });
      },
      [
        bookingId,
        onComplete,
        requestedQuantity,
        storageKey,
        copy.noneApproved,
      ]
    );

  useEffect(
    () => {
      if (
        !allFinished ||
        rejectedResults
          .length >
          0 ||
        completionSentRef
          .current
      ) {
        return;
      }

      const timer =
        window.setTimeout(
          () => {
            sendComplete(
              results,
              []
            );
          },
          850
        );

      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      allFinished,
      rejectedResults.length,
      results,
      sendComplete,
    ]
  );

  const rescanDriver =
    useCallback(
      async (
        driverIndex: number
      ) => {
        setError(
          ""
        );

        completionSentRef.current =
          false;

        const nextResults =
          resultsRef.current
            .filter(
              (item) =>
                item.profile
                  .driverIndex !==
                driverIndex
            );

        resultsRef.current =
          nextResults;

        setResults(
          nextResults
        );

        setPassengerIndexes(
          (current) =>
            current.filter(
              (item) =>
                item !==
                driverIndex
            )
        );

        setPreparing(
          true
        );

        try {
          const parentToken =
            rootTokenRef.current ||
            sessionsRef.current
              .find(
                (item) =>
                  item.driverIndex !==
                  driverIndex
              )
              ?.sessionToken ||
            "";

          const created =
            await createOneSession(
              driverIndex,
              parentToken
            );

          if (
            !rootTokenRef.current
          ) {
            rootTokenRef.current =
              created
                .sessionToken;

            setRootSessionToken(
              created
                .sessionToken
            );
          }

          const nextSessions =
            upsertSession(
              sessionsRef.current,
              created
            );

          sessionsRef.current =
            nextSessions;

          setSessions(
            nextSessions
          );
        } catch (
          caught: any
        ) {
          setError(
            caught?.message ||
            copy.scannerPrepareError
          );
        } finally {
          setPreparing(
            false
          );
        }
      },
      [
        createOneSession,
        copy.scannerPrepareError,
      ]
    );

  const openScannerForDriver =
    useCallback(
      async (
        driverIndex: number
      ) => {
        try {
          setError(
            ""
          );

          let selected =
            sessionsRef.current
              .find(
                (item) =>
                  item.driverIndex ===
                  driverIndex
              );

          if (
            !selected
          ) {
            await createMissingSessions();

            selected =
              sessionsRef.current
                .find(
                  (item) =>
                    item.driverIndex ===
                    driverIndex
                );
          }

          if (
            !selected
              ?.verifyPath
          ) {
            throw new Error(
              copy.scannerOpenError
            );
          }

          const mobileUrl =
            makeScannerUrl(
              selected
                .verifyPath,
              true,
              locale,
              "mobile"
            );

          if (
            !mobileUrl
          ) {
            throw new Error(
              copy.scannerOpenError
            );
          }

          window.location.assign(
            mobileUrl
          );
        } catch (
          caught: any
        ) {
          setError(
            caught?.message ||
            copy.scannerOpenError
          );
        }
      },
      [
        createMissingSessions,
        locale,
        copy.scannerOpenError,
      ]
    );

  const nextMobileDriverIndex =
    Array.from(
      {
        length:
          requestedQuantity,
      },
      (
        _,
        index
      ) =>
        index + 1
    ).find(
      (driverIndex) =>
        !results.some(
          (result) =>
            result.profile
              .driverIndex ===
            driverIndex
        )
    );

  const readyCount =
    sessions.length;

  return (
    <section
      id="nexa-document-verification"
      className="border border-black/10 bg-white p-5 md:p-7"
    >
      <style jsx global>{`
        @keyframes nexaVerificationHeartbeat {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 12px 34px rgba(249, 115, 22, 0.18);
          }
          12% {
            transform: scale(1.018);
            box-shadow: 0 16px 42px rgba(249, 115, 22, 0.3);
          }
          24% {
            transform: scale(1);
          }
          36% {
            transform: scale(1.012);
            box-shadow: 0 14px 38px rgba(236, 72, 153, 0.22);
          }
          52% {
            transform: scale(1);
          }
        }

        @keyframes nexaVerificationShine {
          0% {
            transform: translateX(-135%) skewX(-18deg);
          }
          48%, 100% {
            transform: translateX(235%) skewX(-18deg);
          }
        }

        .nexa-verification-heartbeat {
          animation: nexaVerificationHeartbeat 2.15s ease-in-out infinite;
        }

        .nexa-verification-action {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transition: transform 150ms ease, filter 150ms ease,
            box-shadow 150ms ease;
        }

        .nexa-verification-action::after {
          position: absolute;
          inset: -40% auto -40% -28%;
          width: 24%;
          content: "";
          z-index: -1;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.42),
            transparent
          );
          animation: nexaVerificationShine 3.1s ease-in-out infinite;
        }

        .nexa-verification-action:active {
          transform: scale(0.965);
          filter: brightness(0.96);
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-verification-heartbeat,
          .nexa-verification-action::after {
            animation: none !important;
          }
        }
      `}</style>

      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
            {copy.secureVerification}
          </p>

          <h2 className="mt-2 text-[28px] font-black tracking-[-0.045em] text-black">
            {requestedQuantity ===
            1
              ? copy.scanDocuments
              : copy.validateDrivers}
          </h2>

          <p className="mt-3 max-w-2xl text-[13px] font-medium leading-6 text-black/58">
            {requestedQuantity ===
            1
              ? copy.scanHelp
              : copy.multiScanHelp}
          </p>
        </div>

        <div className="shrink-0 border border-black/10 bg-[#fafaf8] px-3 py-2 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/35">
            {copy.progress}
          </p>

          <p className="mt-1 text-sm font-black text-black">
            {results.length}/
            {requestedQuantity}
          </p>
        </div>
      </div>

      {preparing &&
      readyCount ===
        0 ? (
        <div className="mt-7 flex min-h-[260px] flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-6 text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/15 border-t-black" />

          <p className="mt-5 text-sm font-black text-black">
            {requestedQuantity === 1
              ? copy.preparingScanner
              : copy.preparingScanners}
          </p>

          <p className="mt-2 text-xs font-semibold text-black/45">
            {copy.keepOpen}
          </p>
        </div>
      ) : null}

      <div
        className={[
          "mt-7 grid gap-4",

          requestedQuantity >
          1
            ? "xl:grid-cols-2"
            : "grid-cols-1",
        ].join(
          " "
        )}
      >
        {Array.from(
          {
            length:
              requestedQuantity,
          },
          (
            _,
            index
          ) => {
            const driverIndex =
              index + 1;

            const driverSession =
              sessions.find(
                (item) =>
                  item.driverIndex ===
                  driverIndex
              );

            const result =
              results.find(
                (item) =>
                  item.profile
                    .driverIndex ===
                  driverIndex
              );

            const approved =
              result?.status ===
                "approved" ||
              result?.status ===
                "manual_review";

            const rejected =
              result?.status ===
              "rejected";

            const expired =
              driverSession
                ?.status ===
                "expired" ||
              driverSession
                ?.status ===
                "cancelled";

            const mobileDisabled =
              !result &&
              nextMobileDriverIndex !==
                driverIndex;

            return (
              <article
                key={
                  driverIndex
                }
                className={[
                  "relative border p-4 md:p-5",

                  approved
                    ? "border-emerald-300 bg-emerald-50/60"
                    : rejected
                      ? "border-red-300 bg-red-50/70"
                      : "border-black/10 bg-[#fafaf8]",
                ].join(
                  " "
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/35">
                      {copy.scooter}{" "}
                      {
                        driverIndex
                      }
                    </p>

                    <h3 className="mt-1 text-lg font-black text-black">
                      {result
                          ? resultName(
                            result,
                            copy.driver
                          )
                        : copy.driver + " " +
                          driverIndex}
                    </h3>
                  </div>

                  <div
                    className={[
                      "flex h-11 w-11 items-center justify-center rounded-full border text-xl font-black",

                      approved
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : rejected
                          ? "border-red-500 bg-red-500 text-white"
                          : driverSession
                              ?.status ===
                              "scanning"
                            ? "border-orange-400 bg-orange-50 text-orange-600"
                            : "border-black/15 bg-white text-black/30",
                    ].join(
                      " "
                    )}
                    aria-label={
                      approved
                        ? copy.approved
                        : rejected
                          ? copy.rejected
                          : copy.waiting
                    }
                  >
                    {approved
                      ? "✓"
                      : rejected
                        ? "×"
                        : driverSession
                            ?.status ===
                            "scanning"
                          ? "•••"
                          : driverIndex}
                  </div>
                </div>

                {approved ? (
                  <div className="mt-5 border border-emerald-200 bg-white/80 px-4 py-3">
                    <p className="text-sm font-black text-emerald-700">
                      {copy.driverApproved}
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-5 text-black/50">
                      {result
                        ?.status ===
                        "manual_review"
                        ? copy.manualHelp
                        : copy.approvedHelp}
                    </p>
                  </div>
                ) : rejected ? (
                  <div className="mt-5 border border-red-200 bg-white/80 px-4 py-3">
                    <p className="text-sm font-black text-red-700">
                      {copy.driverRejected}
                    </p>

                    <p className="mt-1 text-xs font-semibold leading-5 text-black/50">
                      {result
                        ?.message ||
                        copy.rejectedHelp}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 hidden items-center gap-5 md:flex">
                      <div className="flex h-[168px] w-[168px] shrink-0 items-center justify-center border border-black/10 bg-white p-3">
                        {driverSession
                          ?.verifyPath ? (
                          <QRCodeSVG
                            value={
                              makeScannerUrl(
                                driverSession.verifyPath,
                                false,
                                locale,
                                "desktop"
                              )
                            }
                            size={
                              140
                            }
                            level="M"
                            includeMargin={
                              false
                            }
                          />
                        ) : (
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-black" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-black text-black">
                          {driverSession
                            ?.status ===
                            "scanning"
                            ? copy.scanning
                            : expired
                              ? copy.scannerExpired
                              : copy.scanQr}
                        </p>

                        <p className="mt-2 text-xs font-semibold leading-5 text-black/48">
                          {copy.scanQrHelp}
                        </p>

                        {expired ? (
                          <button
                            type="button"
                            onClick={() =>
                              void rescanDriver(
                                driverIndex
                              )
                            }
                            className="mt-4 border border-black/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black"
                          >
                            {copy.createQr}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 md:hidden">
                      <button
                        type="button"
                        disabled={
                          mobileDisabled ||
                          !driverSession ||
                          expired
                        }
                        onClick={() =>
                          void openScannerForDriver(
                            driverIndex
                          )
                        }
                        className={[
                          "min-h-[62px] w-full rounded-[14px] px-5 text-[12px] font-black uppercase tracking-[0.12em] text-white",
                          "nexa-verification-action",

                          !mobileDisabled &&
                          driverSession &&
                          !expired
                            ? "nexa-verification-heartbeat bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 shadow-[0_14px_34px_rgba(249,115,22,0.22)]"
                            : "cursor-not-allowed bg-black/10 text-black/30 shadow-none",
                        ].join(
                          " "
                        )}
                      >
                        {driverSession
                          ?.status ===
                          "scanning"
                          ? formatCheckoutText(
                              copy.continueDriverScan,
                              {
                                driver:
                                  driverIndex,
                              }
                            )
                          : formatCheckoutText(
                              copy.validateDriver,
                              {
                                driver:
                                  driverIndex,
                              }
                            )}
                      </button>

                      {mobileDisabled ? (
                        <p className="mt-2 text-center text-[10px] font-bold text-black/40">
                          {formatCheckoutText(
                            copy.completeDriverFirst,
                            {
                              driver:
                                nextMobileDriverIndex ||
                                driverIndex,
                            }
                          )}
                        </p>
                      ) : null}

                      {expired ? (
                        <button
                          type="button"
                          onClick={() =>
                            void rescanDriver(
                              driverIndex
                            )
                          }
                          className="mt-3 min-h-[48px] w-full border border-black/15 bg-white px-4 text-[10px] font-black uppercase tracking-[0.12em] text-black"
                        >
                          {copy.createScanner}
                        </button>
                      ) : null}
                    </div>
                  </>
                )}

                {rejected &&
                allFinished ? (
                  <div className="mt-4 flex flex-col gap-3 border-t border-red-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    {approvedResults.length >
                    0 ? (
                      <label className="flex items-start gap-2 text-xs font-semibold text-black/65">
                        <input
                          type="checkbox"
                          checked={passengerIndexes.includes(
                            driverIndex
                          )}
                          onChange={(
                            event
                          ) =>
                            setPassengerIndexes(
                              (
                                current
                              ) =>
                                event
                                  .target
                                  .checked
                                  ? [
                                      ...new Set(
                                        [
                                          ...current,
                                          driverIndex,
                                        ]
                                      ),
                                    ]
                                  : current.filter(
                                      (
                                        item
                                      ) =>
                                        item !==
                                        driverIndex
                                    )
                            )
                          }
                          className="mt-0.5"
                        />

                        {copy.passengerOption}
                      </label>
                    ) : (
                      <span className="text-xs font-semibold text-red-700">
                        {copy.approvedRequired}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        void rescanDriver(
                          driverIndex
                        )
                      }
                      className="shrink-0 border border-black/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black"
                    >
                      {copy.scanAgain}
                    </button>
                  </div>
                ) : null}
              </article>
            );
          }
        )}
      </div>

      {error ? (
        <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-bold text-red-700">
            {error}
          </p>

          {sessions.length <
          requestedQuantity ? (
            <button
              type="button"
              onClick={() =>
                void createMissingSessions()
              }
              className="mt-3 border border-red-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-red-700"
            >
              {copy.tryAgain}
            </button>
          ) : null}
        </div>
      ) : null}

      {allFinished &&
      rejectedResults.length >
        0 ? (
        <div className="mt-6 border border-black/10 bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
            {copy.verificationComplete}
          </p>

          <h3 className="mt-2 text-2xl font-black tracking-[-0.035em] text-black">
            {formatCheckoutText(
              copy.driversApproved,
              {
                approved:
                  approvedResults.length,
                requested:
                  requestedQuantity,
              }
            )}
          </h3>

          <p className="mt-3 text-sm font-semibold leading-6 text-black/55">
            {formatCheckoutText(
              copy.partialHelp,
              {
                approved:
                  approvedResults.length,
              }
            )}
          </p>

          {approvedResults.length >
          0 ? (
            <button
              type="button"
              onClick={() =>
                sendComplete(
                  results,
                  passengerIndexes
                )
              }
              className="nexa-verification-action nexa-verification-heartbeat mt-5 min-h-[62px] w-full rounded-[14px] bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 px-5 text-[12px] font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_38px_rgba(16,185,129,0.25)]"
            >
              {formatCheckoutText(
                copy.continueWith,
                {
                  approved:
                    approvedResults.length,
                }
              )}
            </button>
          ) : null}

          {onCancel ? (
            <button
              type="button"
              onClick={
                onCancel
              }
              className="mt-3 min-h-[52px] w-full rounded-[12px] border border-red-300 bg-gradient-to-r from-red-50 to-rose-100 px-5 text-[11px] font-black uppercase tracking-[0.12em] text-red-700 transition active:scale-[0.97]"
            >
              {copy.cancelBooking}
            </button>
          ) : null}
        </div>
      ) : null}

      {allFinished &&
      rejectedResults.length ===
        0 ? (
        <div className="mt-6 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-white">
            ✓
          </span>

          <div>
            <p className="text-sm font-black text-emerald-800">
              {copy.allApproved}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-emerald-700/70">
              {copy.openingDetails}
            </p>
          </div>
        </div>
      ) : null}

      {!allFinished &&
      onCancel ? (
        <button
          type="button"
          onClick={
            onCancel
          }
          className="mt-5 w-full py-2 text-[11px] font-black text-black/45"
        >
          {copy.cancelAndBack}
        </button>
      ) : null}

      <div className="mt-6 grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-3">
        <VerificationStep
          number="01"
          title={copy.openScanner}
          description={
            requestedQuantity ===
            1
              ? copy.scanQrHelp
              : copy.openScannerHelp
          }
        />

        <VerificationStep
          number="02"
          title={copy.scanDocumentsStep}
          description={copy.scanDocumentsStepHelp}
        />

        <VerificationStep
          number="03"
          title={copy.continueCheckout}
          description={copy.continueCheckoutHelp}
        />
      </div>
    </section>
  );
}

function VerificationStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-black/10 bg-[#fafaf8] p-4">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-500">
        {number}
      </span>

      <p className="mt-2 text-sm font-black text-black">
        {title}
      </p>

      <p className="mt-1 text-[11px] font-semibold leading-5 text-black/45">
        {description}
      </p>
    </div>
  );
}