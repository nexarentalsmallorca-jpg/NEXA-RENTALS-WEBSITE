"use client";

import {
  useCallback,
  useEffect,
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

type InterfaceStatus =
  | "drivers"
  | "preparing"
  | "ready"
  | "checking"
  | "recovery"
  | "error";

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

type StoredState = {
  profiles: DriverProfile[];
  results: VerifiedDriver[];

  bookingId: string;
  rootSessionToken: string;

  currentDriverIndex: number;

  passengerIndexes?: number[];

  session?:
    | SessionData
    | null;
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
    value ?? ""
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
      value.getMonth() + 1
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

  return `${year}-${month}-${day}`;
}

function validEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

function validProfile(
  profile: DriverProfile
) {
  return (
    profile.firstName
      .trim()
      .length >= 2 &&
    profile.lastName
      .trim()
      .length >= 2 &&
    profile.phone
      .trim()
      .length >= 6 &&
    validEmail(
      profile.email
    ) &&
    profile.address
      .trim()
      .length >= 8
  );
}

function emptyProfiles(
  quantity: number
): DriverProfile[] {
  return Array.from(
    {
      length:
        quantity,
    },
    (
      _,
      index
    ) => ({
      driverIndex:
        index + 1,

      firstName:
        "",

      lastName:
        "",

      phone:
        "",

      email:
        "",

      address:
        "",
    })
  );
}

function makeScannerUrl(
  data: SessionData,
  includeReturnUrl: boolean
) {
  if (
    typeof window ===
      "undefined" ||
    !data.verifyPath
  ) {
    return "";
  }

  const url =
    new URL(
      data.verifyPath,
      window.location.origin
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

export default function DocumentVerification({
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
  const locale =
    useLocale();

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
    `nexa-driver-verification:` +
    `${fleetGroup}:` +
    `${rentalStartDate}:` +
    `${rentalEndDate}:` +
    `${requestedQuantity}`;

  const handledTokensRef =
    useRef(
      new Set<string>()
    );

  const creatingRef =
    useRef(
      false
    );

  const [
    profiles,
    setProfiles,
  ] =
    useState<
      DriverProfile[]
    >(
      () =>
        emptyProfiles(
          requestedQuantity
        )
    );

  const [
    results,
    setResults,
  ] =
    useState<
      VerifiedDriver[]
    >([]);

  const [
    session,
    setSession,
  ] =
    useState<
      SessionData | null
    >(null);

  const [
    status,
    setStatus,
  ] =
    useState<
      InterfaceStatus
    >(
      "drivers"
    );

  const [
    error,
    setError,
  ] =
    useState(
      ""
    );

  const [
    qrUrl,
    setQrUrl,
  ] =
    useState(
      ""
    );

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
    currentDriverIndex,
    setCurrentDriverIndex,
  ] =
    useState(
      1
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

  const currentProfile =
    profiles[
      currentDriverIndex -
        1
    ];

  const approvedResults =
    results.filter(
      (item) =>
        item.status ===
          "approved" ||
        item.status ===
          "manual_review"
    );

  useEffect(
    () => {
      try {
        const raw =
          window.sessionStorage
            .getItem(
              storageKey
            );

        if (raw) {
          const saved =
            JSON.parse(
              raw
            ) as StoredState;

          if (
            Array.isArray(
              saved.profiles
            ) &&
            saved.profiles
              .length ===
              requestedQuantity
          ) {
            setProfiles(
              saved.profiles
            );

            setResults(
              Array.isArray(
                saved.results
              )
                ? saved.results
                : []
            );

            setBookingId(
              clean(
                saved.bookingId
              )
            );

            setRootSessionToken(
              clean(
                saved.rootSessionToken
              )
            );

            setPassengerIndexes(
              Array.isArray(
                saved.passengerIndexes
              )
                ? saved.passengerIndexes
                : []
            );

            setCurrentDriverIndex(
              Math.min(
                requestedQuantity,
                Math.max(
                  1,
                  Number(
                    saved.currentDriverIndex
                  ) ||
                    1
                )
              )
            );

            if (
              saved.session
                ?.sessionToken &&
              saved.session
                .verifyPath
            ) {
              setSession(
                saved.session
              );

              setQrUrl(
                makeScannerUrl(
                  saved.session,
                  false
                )
              );

              setStatus(
                "ready"
              );
            } else if (
              saved.results
                ?.length ===
              requestedQuantity
            ) {
              setStatus(
                saved.results.some(
                  (item) =>
                    item.status ===
                    "rejected"
                )
                  ? "recovery"
                  : "checking"
              );
            } else if (
              saved.results
                ?.length
            ) {
              setStatus(
                "checking"
              );
            }
          }
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
      requestedQuantity,
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
        profiles,
        results,
        bookingId,
        rootSessionToken,
        currentDriverIndex,
        passengerIndexes,
        session,
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
      profiles,
      results,
      bookingId,
      rootSessionToken,
      currentDriverIndex,
      passengerIndexes,
      session,
    ]
  );

  const readSession =
    useCallback(
      async (
        token: string
      ) => {
        const response =
          await fetch(
            `/api/document-verification/session?session=${encodeURIComponent(
              token
            )}`,
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
            "Could not read verification session."
          );
        }

        return data;
      },
      []
    );

  const createSessionForDriver =
    useCallback(
      async (
        driverIndex: number,
        parentToken?: string
      ) => {
        if (
          creatingRef.current
        ) {
          return null;
        }

        creatingRef.current =
          true;

        setStatus(
          "preparing"
        );

        setError(
          ""
        );

        setQrUrl(
          ""
        );

        try {
          if (
            !rentalStartDate ||
            !rentalEndDate
          ) {
            throw new Error(
              "Please select valid pickup and return dates before verifying documents."
            );
          }

          const profile =
            profiles[
              driverIndex -
                1
            ];

          if (
            !profile ||
            !validProfile(
              profile
            )
          ) {
            throw new Error(
              `Please complete all required details for Driver ${driverIndex}.`
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
                    driverProfile:
                      profile,
                    driverCount:
                      requestedQuantity,
                    parentSessionToken:
                      parentToken ||
                      rootSessionToken ||
                      "",
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
              "Could not create the secure scanner session."
            );
          }

          const scannerUrl =
            makeScannerUrl(
              data,
              false
            );

          if (
            !scannerUrl
          ) {
            throw new Error(
              "Could not generate the secure QR code."
            );
          }

          if (
            !rootSessionToken
          ) {
            setRootSessionToken(
              data.sessionToken
            );
          }

          setBookingId(
            data.bookingId
          );

          setCurrentDriverIndex(
            driverIndex
          );

          setSession(
            data
          );

          setQrUrl(
            scannerUrl
          );

          setStatus(
            "ready"
          );

          return data;
        } finally {
          creatingRef.current =
            false;
        }
      },
      [
        rentalStartDate,
        rentalEndDate,
        profiles,
        locale,
        fleetGroup,
        vehicleName,
        pickupTime,
        dropoffTime,
        requestedQuantity,
        rootSessionToken,
      ]
    );

  const sendComplete =
    useCallback(
      (
        finalResults:
          VerifiedDriver[],
        finalPassengerIndexes:
          number[]
      ) => {
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
            "None of the drivers passed verification. The booking cannot continue."
          );

          setStatus(
            "recovery"
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
            primary.bookingId,

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
        onComplete,
        requestedQuantity,
        storageKey,
      ]
    );

  useEffect(
    () => {
      if (
        !restored ||
        returnedToken ||
        session ||
        results.length ===
          0
      ) {
        return;
      }

      if (
        results.length ===
        requestedQuantity
      ) {
        if (
          results.some(
            (item) =>
              item.status ===
              "rejected"
          )
        ) {
          setStatus(
            "recovery"
          );
        } else {
          sendComplete(
            results,
            passengerIndexes
          );
        }

        return;
      }

      const pending =
        profiles.find(
          (profile) =>
            !results.some(
              (result) =>
                result.profile
                  .driverIndex ===
                profile.driverIndex
            )
        );

      if (
        pending
      ) {
        void createSessionForDriver(
          pending.driverIndex,
          rootSessionToken
        );
      }
    },
    [
      restored,
      returnedToken,
      session,
      results,
      requestedQuantity,
      passengerIndexes,
      profiles,
      rootSessionToken,
      createSessionForDriver,
      sendComplete,
    ]
  );

  const processFinishedSession =
    useCallback(
      async (
        data: SessionData
      ) => {
        const token =
          clean(
            data.sessionToken
          );

        if (
          !token ||
          handledTokensRef.current
            .has(
              token
            )
        ) {
          return;
        }

        if (
          data.status !==
            "completed" &&
          data.status !==
            "failed"
        ) {
          return;
        }

        handledTokensRef.current
          .add(
            token
          );

        const profile =
          data.driverProfile ||
          profiles.find(
            (item) =>
              item.driverIndex ===
              currentDriverIndex
          ) ||
          profiles[0];

        const rejected =
          data.status ===
            "failed" ||
          data.analysisOutcome ===
            "rejected";

        const result:
          VerifiedDriver = {
          profile,

          status:
            rejected
              ? "rejected"
              : data.analysisOutcome ===
                "manual_review"
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
            token,

          bookingId:
            clean(
              data.bookingId ||
              bookingId
            ),

          licenceData:
            completeDocument(
              data.licenceData
            ),

          identityData:
            data.identityData
              ? completeDocument(
                  data.identityData
                )
              : null,

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

        const nextResults = [
          ...results.filter(
            (item) =>
              item.profile
                .driverIndex !==
              profile.driverIndex
          ),

          result,
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

        setResults(
          nextResults
        );

        setSession(
          null
        );

        setQrUrl(
          ""
        );

        const pendingProfile =
          profiles.find(
            (item) =>
              !nextResults.some(
                (
                  resultItem
                ) =>
                  resultItem
                    .profile
                    .driverIndex ===
                  item.driverIndex
              )
          );

        if (
          pendingProfile
        ) {
          await createSessionForDriver(
            pendingProfile
              .driverIndex,
            rootSessionToken ||
              token
          );

          return;
        }

        if (
          nextResults.some(
            (item) =>
              item.status ===
              "rejected"
          )
        ) {
          setStatus(
            "recovery"
          );
        } else {
          sendComplete(
            nextResults,
            []
          );
        }
      },
      [
        profiles,
        currentDriverIndex,
        bookingId,
        results,
        createSessionForDriver,
        rootSessionToken,
        sendComplete,
      ]
    );

  useEffect(
    () => {
      if (
        !restored ||
        !returnedToken
      ) {
        return;
      }

      let cancelled =
        false;

      setStatus(
        "checking"
      );

      void readSession(
        returnedToken
      )
        .then(
          async (
            data
          ) => {
            if (
              cancelled
            ) {
              return;
            }

            await processFinishedSession(
              data
            );

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
        )
        .catch(
          (
            caught: any
          ) => {
            if (
              !cancelled
            ) {
              setError(
                caught?.message ||
                "Could not read verification result."
              );

              setStatus(
                "error"
              );
            }
          }
        );

      return () => {
        cancelled =
          true;
      };
    },
    [
      restored,
      returnedToken,
      readSession,
      processFinishedSession,
    ]
  );

  useEffect(
    () => {
      const token =
        session
          ?.sessionToken;

      if (
        !token ||
        status !==
          "ready"
      ) {
        return;
      }

      let stopped =
        false;

      let timer:
        | number
        | undefined;

      async function poll() {
        try {
          const data =
            await readSession(
              token as string
            );

          if (
            stopped
          ) {
            return;
          }

          if (
            data.status ===
              "completed" ||
            data.status ===
              "failed"
          ) {
            setStatus(
              "checking"
            );

            await processFinishedSession(
              data
            );

            return;
          }

          if (
            data.status ===
              "expired" ||
            data.status ===
              "cancelled"
          ) {
            setError(
              "The secure scanner link expired. Create a new link and try again."
            );

            setStatus(
              "error"
            );

            return;
          }
        } catch {
          /*
           * Temporary polling interruption.
           * Retry automatically.
           */
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
          700
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
      session
        ?.sessionToken,
      status,
      readSession,
      processFinishedSession,
    ]
  );

  function updateProfile(
    driverIndex: number,
    key:
      keyof DriverProfile,
    value: string
  ) {
    setProfiles(
      (current) =>
        current.map(
          (profile) =>
            profile.driverIndex ===
            driverIndex
              ? {
                  ...profile,

                  [key]:
                    value,
                }
              : profile
        )
    );
  }

  async function beginVerification() {
    const invalid =
      profiles.find(
        (profile) =>
          !validProfile(
            profile
          )
      );

    if (
      invalid
    ) {
      setError(
        `Please complete all required details for Driver ${invalid.driverIndex}.`
      );

      return;
    }

    try {
      await createSessionForDriver(
        1
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
        "Could not prepare document verification."
      );

      setStatus(
        "error"
      );
    }
  }

  async function prepareAgain() {
    try {
      await createSessionForDriver(
        currentDriverIndex,
        rootSessionToken
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
        "Could not create a new scanner link."
      );

      setStatus(
        "error"
      );
    }
  }

  async function rescanDriver(
    driverIndex: number
  ) {
    setResults(
      (current) =>
        current.filter(
          (item) =>
            item.profile
              .driverIndex !==
            driverIndex
        )
    );

    setPassengerIndexes(
      (current) =>
        current.filter(
          (item) =>
            item !==
            driverIndex
        )
    );

    handledTokensRef.current
      .clear();

    try {
      await createSessionForDriver(
        driverIndex,
        rootSessionToken
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
        "Could not create a new scanner link."
      );

      setStatus(
        "error"
      );
    }
  }

  async function openScanner() {
    try {
      setError(
        ""
      );

      let data =
        session;

      if (
        !data?.sessionToken ||
        !data.verifyPath
      ) {
        data =
          await createSessionForDriver(
            currentDriverIndex,
            rootSessionToken
          );
      }

      if (
        !data?.verifyPath ||
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

      if (
        !mobileScannerUrl
      ) {
        throw new Error(
          "Could not open the secure scanner."
        );
      }

      window.location.assign(
        mobileScannerUrl
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
        "Could not open the scanner."
      );

      setStatus(
        "error"
      );
    }
  }

  if (
    status ===
    "drivers"
  ) {
    return (
      <section
        id="nexa-document-verification"
        className="border border-black/10 bg-white p-5 md:p-7"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
          Driver details ·{" "}
          {requestedQuantity}{" "}
          scooter
          {requestedQuantity ===
          1
            ? ""
            : "s"}
        </p>

        <h2 className="mt-2 text-[28px] font-black tracking-[-0.045em] text-black">
          Add{" "}
          {requestedQuantity ===
          1
            ? "the driver"
            : `all ${requestedQuantity} drivers`}
        </h2>

        <p className="mt-3 text-[13px] font-medium leading-6 text-black/58">
          Each scooter needs one
          approved driver. Every
          driver will verify their
          own licence and ID or
          passport.
        </p>

        <div className="mt-6 space-y-5">
          {profiles.map(
            (
              profile
            ) => (
              <div
                key={
                  profile.driverIndex
                }
                className="border border-black/10 bg-[#fafaf8] p-4 md:p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-black text-black">
                    Driver{" "}
                    {
                      profile.driverIndex
                    }
                  </h3>

                  <span className="text-[9px] font-black uppercase tracking-[0.14em] text-black/35">
                    Scooter{" "}
                    {
                      profile.driverIndex
                    }
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <DriverInput
                    label="First name"
                    value={
                      profile.firstName
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        profile.driverIndex,
                        "firstName",
                        value
                      )
                    }
                    autoComplete="given-name"
                  />

                  <DriverInput
                    label="Surname"
                    value={
                      profile.lastName
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        profile.driverIndex,
                        "lastName",
                        value
                      )
                    }
                    autoComplete="family-name"
                  />

                  <DriverInput
                    label="Phone / WhatsApp"
                    value={
                      profile.phone
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        profile.driverIndex,
                        "phone",
                        value
                      )
                    }
                    autoComplete="tel"
                  />

                  <DriverInput
                    label="Email"
                    value={
                      profile.email
                    }
                    onChange={(
                      value
                    ) =>
                      updateProfile(
                        profile.driverIndex,
                        "email",
                        value
                      )
                    }
                    autoComplete="email"
                  />

                  <label className="sm:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black/45">
                      Home address *
                    </span>

                    <textarea
                      value={
                        profile.address
                      }
                      onChange={(
                        event
                      ) =>
                        updateProfile(
                          profile.driverIndex,
                          "address",
                          event
                            .target
                            .value
                        )
                      }
                      autoComplete="street-address"
                      className="mt-1 min-h-[72px] w-full border border-black/15 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-black"
                      placeholder="Street, city, postcode, country"
                    />
                  </label>
                </div>
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() =>
            void beginVerification()
          }
          className="mt-6 min-h-[58px] w-full bg-black px-5 text-[12px] font-black uppercase tracking-[0.14em] text-white"
        >
          Start Driver 1
          verification
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={
              onCancel
            }
            className="mt-3 w-full py-2 text-[11px] font-black text-black/45"
          >
            Cancel and go back
          </button>
        ) : null}
      </section>
    );
  }

  if (
    status ===
    "recovery"
  ) {
    return (
      <section
        id="nexa-document-verification"
        className="border border-black/10 bg-white p-5 md:p-7"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
          Group verification
          result
        </p>

        <h2 className="mt-2 text-[28px] font-black tracking-[-0.045em] text-black">
          {
            approvedResults.length
          }{" "}
          of{" "}
          {
            requestedQuantity
          }{" "}
          drivers approved
        </h2>

        <p className="mt-3 text-[13px] font-medium leading-6 text-black/58">
          Your complete booking does
          not need to be cancelled.
          You can rescan an
          unsuccessful driver or
          continue with{" "}
          {
            approvedResults.length
          }{" "}
          scooter
          {approvedResults.length ===
          1
            ? ""
            : "s"}
          .
        </p>

        <div className="mt-6 space-y-3">
          {results.map(
            (
              result
            ) => (
              <div
                key={
                  result.profile
                    .driverIndex
                }
                className={[
                  "border p-4",

                  result.status ===
                  "rejected"
                    ? "border-red-200 bg-red-50"
                    : "border-emerald-200 bg-emerald-50",
                ].join(
                  " "
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-black text-black">
                      {
                        result.profile
                          .firstName
                      }{" "}
                      {
                        result.profile
                          .lastName
                      }
                    </h3>

                    <p
                      className={[
                        "mt-1 text-xs font-bold",

                        result.status ===
                        "rejected"
                          ? "text-red-700"
                          : "text-emerald-700",
                      ].join(
                        " "
                      )}
                    >
                      {result.status ===
                      "rejected"
                        ? result.message ||
                          "This driver is not eligible for the selected scooter."
                        : result.status ===
                          "manual_review"
                          ? "Approved for booking · manual confirmation before pickup"
                          : "Approved driver"}
                    </p>
                  </div>

                  <span
                    className={[
                      "text-[10px] font-black uppercase",

                      result.status ===
                      "rejected"
                        ? "text-red-700"
                        : "text-emerald-700",
                    ].join(
                      " "
                    )}
                  >
                    {result.status ===
                    "rejected"
                      ? "Not eligible"
                      : "Approved"}
                  </span>
                </div>

                {result.status ===
                "rejected" ? (
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-start gap-2 text-xs font-semibold text-black/65">
                      <input
                        type="checkbox"
                        checked={passengerIndexes.includes(
                          result
                            .profile
                            .driverIndex
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

                                        result
                                          .profile
                                          .driverIndex,
                                      ]
                                    ),
                                  ]
                                : current.filter(
                                    (
                                      item
                                    ) =>
                                      item !==
                                      result
                                        .profile
                                        .driverIndex
                                  )
                          )
                        }
                        className="mt-0.5"
                      />

                      Add{" "}
                      {
                        result.profile
                          .firstName
                      }{" "}
                      as a passenger
                      instead
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        void rescanDriver(
                          result
                            .profile
                            .driverIndex
                        )
                      }
                      className="border border-black/15 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black"
                    >
                      Scan again
                    </button>
                  </div>
                ) : null}
              </div>
            )
          )}
        </div>

        <p className="mt-4 text-[11px] font-semibold leading-5 text-black/48">
          A passenger may travel only
          when the scooter is
          approved for two occupants,
          the rental conditions allow
          it, and Spanish passenger
          rules are followed: rear
          passenger seat, footrests
          and an approved helmet. The
          normal minimum passenger
          age is 12.
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
            className="mt-6 min-h-[58px] w-full bg-black px-5 text-[12px] font-black uppercase tracking-[0.12em] text-white"
          >
            Continue with{" "}
            {
              approvedResults.length
            }{" "}
            scooter
            {approvedResults.length ===
            1
              ? ""
              : "s"}
          </button>
        ) : null}

        {onCancel ? (
          <button
            type="button"
            onClick={
              onCancel
            }
            className="mt-3 min-h-[48px] w-full border border-red-200 bg-red-50 px-5 text-[11px] font-black uppercase tracking-[0.12em] text-red-700"
          >
            Cancel complete booking
          </button>
        ) : null}
      </section>
    );
  }

  const busy =
    status ===
      "preparing" ||
    status ===
      "checking";

  const qrReady =
    status ===
      "ready" &&
    Boolean(
      qrUrl
    );

  return (
    <section
      id="nexa-document-verification"
      className="overflow-hidden border border-black/10 bg-white"
    >
      <div className="p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
              Driver{" "}
              {
                currentDriverIndex
              }{" "}
              of{" "}
              {
                requestedQuantity
              }
            </div>

            <h2 className="mt-2 text-[28px] font-black leading-none tracking-[-0.045em] text-black md:text-[32px]">
              Verify{" "}
              {currentProfile
                ?.firstName ||
                `Driver ${currentDriverIndex}`}
            </h2>

            <p className="mt-3 max-w-2xl text-[13px] font-medium leading-6 text-black/58">
              Scan this driver’s
              licence and passport or
              ID. The next driver
              starts automatically.
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
              Create a new secure
              link
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
                      value={
                        qrUrl
                      }
                      size={
                        230
                      }
                      level="M"
                      marginSize={
                        0
                      }
                      bgColor="#ffffff"
                      fgColor="#050505"
                      title={`Scan documents for Driver ${currentDriverIndex}`}
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
          </div>

          <div className="space-y-4">
            <Instruction
              number="1"
              title={`Scan for ${
                currentProfile
                  ?.firstName ||
                `Driver ${currentDriverIndex}`
              }`}
              description="Open a phone camera and scan the private QR code."
            />

            <Instruction
              number="2"
              title="Verify this driver"
              description="Scan the driving licence front and back, then the ID card or passport."
            />

            <Instruction
              number="3"
              title="Keep checkout open"
              description="The next driver will appear automatically when this scan finishes."
            />
          </div>
        </div>

        <div className="mt-6 md:hidden">
          <button
            type="button"
            disabled={
              busy
            }
            onClick={() =>
              void openScanner()
            }
            className="min-h-[62px] w-full bg-black px-5 text-[12px] font-black uppercase tracking-[0.13em] text-white disabled:cursor-wait disabled:text-white/60"
          >
            {busy
              ? "Preparing scanner"
              : `Verify Driver ${currentDriverIndex}`}
          </button>
        </div>

        {onCancel ? (
          <button
            type="button"
            onClick={
              onCancel
            }
            className="mt-5 w-full py-2 text-[11px] font-black text-black/45"
          >
            Cancel complete booking
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

        @keyframes nexa-loader-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .nexa-gradient-frame {
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
          .nexa-loader {
            animation:
              none;
          }
        }
      `}</style>
    </section>
  );
}

function DriverInput({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  autoComplete: string;
}) {
  return (
    <label>
      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-black/45">
        {label} *
      </span>

      <input
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        autoComplete={
          autoComplete
        }
        className="mt-1 min-h-[46px] w-full border border-black/15 bg-white px-3 text-sm font-semibold outline-none focus:border-black"
      />
    </label>
  );
}

function Instruction({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-[12px] font-black text-white">
        {number}
      </div>

      <div>
        <h3 className="text-[15px] font-black text-black">
          {title}
        </h3>

        <p className="mt-1 text-[11px] font-semibold leading-5 text-black/48">
          {description}
        </p>
      </div>
    </div>
  );
}