"use client";

export const dynamic = "force-dynamic";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Manrope } from "next/font/google";
import { useLocale } from "next-intl";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import CheckoutShell from "./CheckoutShell";

import DocumentVerification, {
  type DocumentVerificationPayload,
} from "./DocumentVerification";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type VehicleType =
  | "Scooter"
  | "E-Bike";

type CheckoutSide =
  | "verification"
  | "details"
  | "payment";

type Vehicle = {
  id: string;
  aliases?: string[];
  name: string;
  type: VehicleType;
  pricePerDay: number;
  imageUrl: string;
  spec1?: string;
  spec2?: string;
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

type AvailabilityResult = {
  ok: boolean;
  available: boolean;

  vehicleName?: string;

  totalFleet?: number;
  bookedCount?: number;
  availableCount?: number;

  message?: string;
  nextAvailableText?: string;

  bufferMinutes?: number;

  fleetGroup?: string;

  bookedVehicleCodes?: string[];
  availableVehicleCodes?: string[];

  assignedVehicleCode?: string | null;
  assignedVehicleName?: string | null;
  assignedVehicleMatricula?: string | null;
  assignedVehicleDisplayName?: string | null;
};

const EMPTY_DOCUMENT_PATHS: UploadedDocumentPaths =
  {
    dlFrontPath: "",
    dlBackPath: "",
    idFrontPath: "",
    idBackPath: "",

    dlFrontName: "",
    dlBackName: "",
    idFrontName: "",
    idBackName: "",
  };

const VEHICLES: Vehicle[] = [
  {
    id: "s1",

    aliases: [
      "zontes-125e",
      "zontes_125e",
    ],

    name: "Zontes 125E",

    type: "Scooter",

    pricePerDay: 49,

    imageUrl:
      "/images/zontes125.png",

    spec1:
      "125cc · Automatic",

    spec2:
      "Phone holder · 2 helmets",
  },

  {
    id: "s2",

    aliases: [
      "piaggio-liberty-125",
      "piaggio_liberty_125",
    ],

    name:
      "Piaggio Liberty 125",

    type: "Scooter",

    pricePerDay: 39,

    imageUrl:
      "/images/checkouts1.png",

    spec1:
      "125cc · Automatic",

    spec2:
      "Easy handling",
  },

  {
    id: "s3",

    aliases: [
      "sym-symphony-125",
      "sym_symphony_125",
    ],

    name:
      "SYM Symphony 125",

    type: "Scooter",

    pricePerDay: 39,

    imageUrl:
      "/images/checkouts2.png",

    spec1:
      "125cc · Automatic",

    spec2:
      "Stable ride",
  },

  {
    id: "e2",

    aliases: [
      "engwe-m20",
      "engwe_m20",
    ],

    name: "ENGWE M20",

    type: "E-Bike",

    pricePerDay: 28,

    imageUrl:
      "/images/e20.png",

    spec1:
      "Up to 60km range",

    spec2:
      "Electric bike",
  },

  {
    id: "e3",

    aliases: [
      "p275-se",
      "p275_se",
    ],

    name: "P275 SE",

    type: "E-Bike",

    pricePerDay: 28,

    imageUrl:
      "/images/ebike-urban.png",

    spec1:
      "Up to 45km range",

    spec2:
      "Electric bike",
  },
];

const INCLUDED_ITEMS = [
  {
    label: "2 Helmets",
    image: "/images/ex4.png",
  },

  {
    label: "Top Case",
    image: "/images/ex1.jpg",
  },

  {
    label: "Phone Mount",
    image: "/images/ex2.jpg",
  },

  {
    label: "Lock",
    image: "/images/ex3.png",
  },

  {
    label: "Insurance",
    image: "/images/ex5.png",
  },
];

const PICKUP_LOCATION_MAP_URL =
  "https://maps.app.goo.gl/L7bRwgirZLcjQqT37";

function startOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function parseISO(
  value?: string | null
) {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? undefined
    : date;
}

function fmtDate(
  date?: Date,
  locale?: string
) {
  if (!date) {
    return "--/--/----";
  }

  return date.toLocaleDateString(
    locale || undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function safeParam(
  searchParams: {
    get: (
      key: string
    ) => string | null;
  },
  key: string
) {
  const value =
    searchParams.get(key);

  return value &&
    value.trim().length
    ? value
    : undefined;
}

function formatTimeLabel(
  time?: string,
  locale?: string
) {
  if (!time) {
    return "--:--";
  }

  const [
    hourString,
    minuteString,
  ] = time.split(":");

  const hour =
    Number(hourString);

  if (
    Number.isNaN(hour)
  ) {
    return time;
  }

  const date =
    new Date();

  date.setHours(
    hour,
    Number(minuteString),
    0,
    0
  );

  return new Intl.DateTimeFormat(
    locale || undefined,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function daysBetween(
  from?: Date,
  to?: Date
) {
  if (!from || !to) {
    return 1;
  }

  const start =
    startOfDay(
      from
    ).getTime();

  const end =
    startOfDay(
      to
    ).getTime();

  const difference =
    Math.max(
      0,
      end - start
    );

  const days =
    Math.ceil(
      difference /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  return Math.max(
    1,
    days
  );
}

function discountedPricePerDay(
  vehicle: Vehicle,
  days: number
) {
  const safeDays =
    Math.max(
      1,
      days
    );

  const ladderRatios: Record<
    number,
    number
  > = {
    1: 1,
    2: 42 / 45,
    3: 39 / 45,
    4: 37 / 45,
    5: 35 / 45,
  };

  const step =
    safeDays >= 5
      ? 5
      : safeDays;

  return Math.round(
    vehicle.pricePerDay *
      ladderRatios[step]
  );
}

function emailOk(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

function phoneOk(
  value: string
) {
  const digits =
    value.replace(
      /[^\d+]/g,
      ""
    );

  return (
    digits.length >= 7
  );
}

function eur(
  number: number
) {
  return number.toFixed(2);
}

function eurFromCents(
  cents: number
) {
  return (
    cents / 100
  ).toFixed(2);
}

function normalizeCheckoutQuantity(
  value?: string
) {
  const parsed =
    Number.parseInt(
      value || "1",
      10
    );

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return 1;
  }

  return Math.min(
    15,
    Math.max(
      1,
      parsed
    )
  );
}

function resolveFleetGroupFromVehicle(
  vehicleId: string,
  vehicleName: string
) {
  const cleanId =
    vehicleId
      .trim()
      .toLowerCase();

  const cleanName =
    vehicleName
      .trim()
      .toLowerCase();

  if (
    cleanId === "s3" ||
    cleanId.includes(
      "sym"
    ) ||
    cleanName.includes(
      "sym"
    ) ||
    cleanName.includes(
      "symphony"
    )
  ) {
    return "sym_symphony_125";
  }

  return "piaggio_liberty_125";
}

function checkoutImageForVehicle(
  vehicle: Vehicle,
  publicVehicleName: string
) {
  const cleanId =
    vehicle.id.toLowerCase();

  const cleanName =
    publicVehicleName.toLowerCase();

  if (
    cleanId === "s2" ||
    cleanName.includes(
      "piaggio"
    ) ||
    cleanName.includes(
      "liberty"
    )
  ) {
    return "/images/checkouts1.png";
  }

  if (
    cleanId === "s3" ||
    cleanName.includes(
      "sym"
    ) ||
    cleanName.includes(
      "symphony"
    )
  ) {
    return "/images/checkouts2.png";
  }

  return vehicle.imageUrl;
}

function hasRemoteDocumentPaths(
  documents: UploadedDocumentPaths,
  identityType:
    | "id"
    | "passport"
    | null
) {
  const licenceComplete =
    Boolean(
      documents.dlFrontPath &&
        documents.dlBackPath
    );

  if (
    !licenceComplete
  ) {
    return false;
  }

  if (
    identityType ===
    "passport"
  ) {
    return Boolean(
      documents.idFrontPath
    );
  }

  if (
    identityType ===
    "id"
  ) {
    return Boolean(
      documents.idFrontPath &&
        documents.idBackPath
    );
  }

  return false;
}

async function checkCheckoutAvailability({
  vehicleId,
  vehicleName,
  fleetGroup,
  quantity,
  plan,
  from,
  to,
  pickupTime,
  dropoffTime,
}: {
  vehicleId: string;
  vehicleName: string;
  fleetGroup: string;
  quantity: number;
  plan: string;

  from?: Date;
  to?: Date;

  pickupTime: string;
  dropoffTime: string;
}): Promise<AvailabilityResult | null> {
  if (!from || !to) {
    return null;
  }

  const params =
    new URLSearchParams({
      vehicleId:
        String(vehicleId),

      vehicleName:
        String(vehicleName),

      fleetGroup:
        String(fleetGroup),

      quantity:
        String(quantity),

      plan:
        String(plan),

      from:
        from.toLocaleDateString(
          "en-CA"
        ),

      to:
        to.toLocaleDateString(
          "en-CA"
        ),

      pickupTime:
        String(pickupTime),

      dropoffTime:
        String(dropoffTime),
    });

  try {
    const response =
      await fetch(
        `/api/admin/availability?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

    return (
      await response.json()
    ) as AvailabilityResult;
  } catch {
    return null;
  }
}

export default function CheckoutClient() {
  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  const locale =
    useLocale();

  const firstNameRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const surnameRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const phoneRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const emailRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const homeAddressRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const notesRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const pickupLocation =
    safeParam(
      searchParams,
      "pickupLocation"
    ) ??
    "NEXA Rentals, Magaluf";

  const from =
    parseISO(
      safeParam(
        searchParams,
        "from"
      )
    );

  const to =
    parseISO(
      safeParam(
        searchParams,
        "to"
      )
    );

  const pickupTime =
    safeParam(
      searchParams,
      "pickupTime"
    ) ?? "10:00";

  const dropoffTime =
    safeParam(
      searchParams,
      "dropoffTime"
    ) ?? "10:00";

  const plan =
    safeParam(
      searchParams,
      "plan"
    ) ?? "full";

  const availabilityCheckedFromPanel =
    safeParam(
      searchParams,
      "availabilityChecked"
    );

  const availableCountFromPanel =
    safeParam(
      searchParams,
      "availableCount"
    );

  const totalFleetFromPanel =
    safeParam(
      searchParams,
      "totalFleet"
    );

  const quantity =
    normalizeCheckoutQuantity(
      safeParam(
        searchParams,
        "quantity"
      )
    );

  const vehicleId =
    safeParam(
      searchParams,
      "vehicleId"
    ) ?? "s2";

  const urlVehicleName =
    safeParam(
      searchParams,
      "vehicleName"
    ) ||
    safeParam(
      searchParams,
      "vehicle"
    );

  const vehicle =
    VEHICLES.find(
      (item) => {
        const idMatch =
          item.id ===
          vehicleId;

        const aliasMatch =
          item.aliases?.includes(
            vehicleId
          );

        const nameMatch =
          urlVehicleName &&
          item.name.toLowerCase() ===
            urlVehicleName.toLowerCase();

        return (
          idMatch ||
          aliasMatch ||
          nameMatch
        );
      }
    ) ||
    VEHICLES[1];

  const publicVehicleName =
    urlVehicleName ||
    vehicle.name;

  const fleetGroupFromPanel =
    safeParam(
      searchParams,
      "fleetGroup"
    ) || "";

  const resolvedFleetGroup =
    fleetGroupFromPanel ||
    resolveFleetGroupFromVehicle(
      vehicle.id,
      publicVehicleName
    );

  /*
   * Scooter bookings must complete
   * document validation.
   *
   * E-bikes skip this.
   */
  const requiresDocumentVerification =
    vehicle.type ===
    "Scooter";

  const [
    checkoutSide,
    setCheckoutSide,
  ] =
    useState<CheckoutSide>(
      requiresDocumentVerification
        ? "verification"
        : "details"
    );

  const [
    documentsCaptured,
    setDocumentsCaptured,
  ] =
    useState(
      !requiresDocumentVerification
    );

  const [
    identityDocumentType,
    setIdentityDocumentType,
  ] =
    useState<
      | "id"
      | "passport"
      | null
    >(null);

  /*
   * These values come from the
   * desktop QR verification session.
   */
  const [
    verificationSessionToken,
    setVerificationSessionToken,
  ] =
    useState("");

  const [
    verificationBookingId,
    setVerificationBookingId,
  ] =
    useState("");

  /*
   * Documents uploaded by the PHONE
   * are already inside your private
   * booking-documents bucket.
   *
   * The desktop only keeps their paths.
   */
  const [
    remoteDocuments,
    setRemoteDocuments,
  ] =
    useState<UploadedDocumentPaths>(
      EMPTY_DOCUMENT_PATHS
    );

  /*
   * These remain available for a
   * future direct mobile checkout
   * scanner where Files may arrive
   * directly inside CheckoutClient.
   */
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

  const rentalDaysFromParams =
    Number(
      safeParam(
        searchParams,
        "days"
      ) ?? ""
    );

  const rateFromParams =
    Number(
      safeParam(
        searchParams,
        "rate"
      ) ?? ""
    );

  const totalFromParams =
    Number(
      safeParam(
        searchParams,
        "total"
      ) ?? ""
    );

  const rentalDays =
    useMemo(() => {
      if (
        Number.isFinite(
          rentalDaysFromParams
        ) &&
        rentalDaysFromParams >
          0
      ) {
        return rentalDaysFromParams;
      }

      return daysBetween(
        from,
        to
      );
    }, [
      from,
      to,
      rentalDaysFromParams,
    ]);

  const discountedPerDayEur =
    useMemo(() => {
      if (
        Number.isFinite(
          rateFromParams
        ) &&
        rateFromParams >
          0
      ) {
        return rateFromParams;
      }

      return discountedPricePerDay(
        vehicle,
        rentalDays
      );
    }, [
      rateFromParams,
      vehicle,
      rentalDays,
    ]);

  const totalEur =
    useMemo(() => {
      if (
        Number.isFinite(
          totalFromParams
        ) &&
        totalFromParams >
          0
      ) {
        return totalFromParams;
      }

      return (
        discountedPerDayEur *
        rentalDays *
        quantity
      );
    }, [
      totalFromParams,
      discountedPerDayEur,
      rentalDays,
      quantity,
    ]);

  const totalCents =
    Math.round(
      totalEur * 100
    );

  const payNowCents =
    totalCents;

  const isHalfDay =
    plan === "half";

  const planLabel =
    isHalfDay
      ? "Half Day"
      : "Full Day";

  const durationLabel =
    isHalfDay
      ? "Same day"
      : `${rentalDays} ${
          rentalDays > 1
            ? "days"
            : "day"
        }`;

  const deposit =
    150;

  const checkoutImage =
    checkoutImageForVehicle(
      vehicle,
      publicVehicleName
    );

  const [
    firstName,
    setFirstName,
  ] =
    useState("");

  const [
    surname,
    setSurname,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    homeAddress,
    setHomeAddress,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    contractReadyOk,
    setContractReadyOk,
  ] =
    useState(false);

  const [
    agreeTerms,
    setAgreeTerms,
  ] =
    useState(false);

  const [
    marketingOptIn,
    setMarketingOptIn,
  ] =
    useState(false);

  const canPay =
    firstName
      .trim()
      .length >= 2 &&
    surname
      .trim()
      .length >= 2 &&
    phoneOk(phone) &&
    emailOk(email) &&
    homeAddress
      .trim()
      .length >= 8 &&
    contractReadyOk &&
    agreeTerms &&
    documentsCaptured;

  const [
    clientSecret,
    setClientSecret,
  ] =
    useState<string | null>(
      null
    );

  const [
    payLoading,
    setPayLoading,
  ] =
    useState(false);

  const [
    payError,
    setPayError,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    if (
      checkoutSide !==
      "details"
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          if (
            !firstName.trim()
          ) {
            firstNameRef.current?.focus();
            return;
          }

          if (
            !surname.trim()
          ) {
            surnameRef.current?.focus();
            return;
          }

          phoneRef.current?.focus();
        },
        220
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    checkoutSide,
    firstName,
    surname,
  ]);

  const moveToNextField = (
    event:
      React.KeyboardEvent<HTMLInputElement>,

    nextRef?: React.RefObject<
      | HTMLInputElement
      | HTMLTextAreaElement
      | null
    >
  ) => {
    if (
      event.key !==
      "Enter"
    ) {
      return;
    }

    event.preventDefault();

    nextRef?.current?.focus();
  };

  const backToVehicles =
    () => {
      router.push(
        `/${locale}/home`
      );
    };

  /*
   * Called automatically when the
   * PHONE finishes scanning.
   */
  function handleDocumentVerificationComplete(
    payload:
      DocumentVerificationPayload
  ) {
    setPayError(null);

    setIdentityDocumentType(
      payload.identityType
    );

    /*
     * Save the QR/session identifiers.
     */
    setVerificationSessionToken(
      payload.sessionToken ||
        ""
    );

    setVerificationBookingId(
      payload.bookingId ||
        ""
    );

    /*
     * Save document paths that were
     * uploaded by the phone.
     */
    const receivedRemoteDocuments: UploadedDocumentPaths =
      {
        dlFrontPath:
          payload.dlFrontPath ||
          "",

        dlBackPath:
          payload.dlBackPath ||
          "",

        idFrontPath:
          payload.idFrontPath ||
          "",

        idBackPath:
          payload.idBackPath ||
          "",

        dlFrontName:
          payload.dlFrontName ||
          "",

        dlBackName:
          payload.dlBackName ||
          "",

        idFrontName:
          payload.idFrontName ||
          "",

        idBackName:
          payload.idBackName ||
          "",
      };

    setRemoteDocuments(
      receivedRemoteDocuments
    );

    /*
     * If future mobile checkout sends
     * actual File objects directly,
     * keep those too.
     */
    setDlFront(
      payload.dlFront ||
        null
    );

    setDlBack(
      payload.dlBack ||
        null
    );

    if (
      payload.identityType ===
      "id"
    ) {
      setIdFront(
        payload.idFront ||
          null
      );

      setIdBack(
        payload.idBack ||
          null
      );
    } else {
      setIdFront(
        payload.passport ||
          payload.idFront ||
          null
      );

      setIdBack(
        null
      );
    }

    /*
     * Auto-fill anything BlinkID found.
     */
    const extractedFirstName =
      payload.licenceData
        ?.firstName ||
      payload.identityData
        ?.firstName ||
      "";

    const extractedSurname =
      payload.licenceData
        ?.lastName ||
      payload.identityData
        ?.lastName ||
      "";

    const extractedAddress =
      payload.identityData
        ?.address ||
      payload.licenceData
        ?.address ||
      "";

    if (
      extractedFirstName
    ) {
      setFirstName(
        (current) =>
          current.trim()
            ? current
            : extractedFirstName
      );
    }

    if (
      extractedSurname
    ) {
      setSurname(
        (current) =>
          current.trim()
            ? current
            : extractedSurname
      );
    }

    if (
      extractedAddress
    ) {
      setHomeAddress(
        (current) =>
          current.trim()
            ? current
            : extractedAddress
      );
    }

    /*
     * Phone verification should normally
     * have all private Supabase paths.
     *
     * We also support direct File objects
     * for future phone-first checkout.
     */
    const remoteComplete =
      hasRemoteDocumentPaths(
        receivedRemoteDocuments,
        payload.identityType
      );

    const localLicenceComplete =
      Boolean(
        payload.dlFront &&
          payload.dlBack
      );

    const localIdentityComplete =
      payload.identityType ===
      "passport"
        ? Boolean(
            payload.passport ||
              payload.idFront
          )
        : Boolean(
            payload.idFront &&
              payload.idBack
          );

    const verificationComplete =
      remoteComplete ||
      (
        localLicenceComplete &&
        localIdentityComplete
      );

    setDocumentsCaptured(
      verificationComplete
    );

    /*
     * Normally this will always be true.
     * If something is missing, don't silently
     * allow Stripe payment.
     */
    if (
      !verificationComplete
    ) {
      setPayError(
        "Your document scan completed, but one of the document references is missing. Please restart document verification."
      );
    }

    window.setTimeout(
      () => {
        setCheckoutSide(
          "details"
        );

        window.setTimeout(
          () => {
            document
              .getElementById(
                "nexa-customer-details"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "start",
              });
          },
          100
        );
      },
      450
    );
  }

  /*
   * If documents came from the phone,
   * this simply returns their existing
   * private Supabase paths.
   *
   * If local File objects exist instead,
   * it uploads them using your existing API.
   */
  async function uploadBookingDocuments(
    bookingId: string
  ): Promise<UploadedDocumentPaths> {
    const hasAnyLocalFile =
      Boolean(
        dlFront ||
          dlBack ||
          idFront ||
          idBack
      );

    if (
      !hasAnyLocalFile
    ) {
      return remoteDocuments;
    }

    const formData =
      new FormData();

    formData.append(
      "bookingId",
      bookingId
    );

    if (dlFront) {
      formData.append(
        "dlFront",
        dlFront
      );
    }

    if (dlBack) {
      formData.append(
        "dlBack",
        dlBack
      );
    }

    if (idFront) {
      formData.append(
        "idFront",
        idFront
      );
    }

    if (idBack) {
      formData.append(
        "idBack",
        idBack
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

    /*
     * Prefer newly uploaded values,
     * otherwise keep anything already
     * uploaded by remote verification.
     */
    return {
      dlFrontPath:
        data?.dlFrontPath ||
        remoteDocuments.dlFrontPath ||
        "",

      dlBackPath:
        data?.dlBackPath ||
        remoteDocuments.dlBackPath ||
        "",

      idFrontPath:
        data?.idFrontPath ||
        remoteDocuments.idFrontPath ||
        "",

      idBackPath:
        data?.idBackPath ||
        remoteDocuments.idBackPath ||
        "",

      dlFrontName:
        data?.dlFrontName ||
        dlFront?.name ||
        remoteDocuments.dlFrontName ||
        "",

      dlBackName:
        data?.dlBackName ||
        dlBack?.name ||
        remoteDocuments.dlBackName ||
        "",

      idFrontName:
        data?.idFrontName ||
        idFront?.name ||
        remoteDocuments.idFrontName ||
        "",

      idBackName:
        data?.idBackName ||
        idBack?.name ||
        remoteDocuments.idBackName ||
        "",
    };
  }

  const payNowAction =
    async () => {
      if (!canPay) {
        return;
      }

      if (
        clientSecret
      ) {
        setCheckoutSide(
          "payment"
        );

        window.setTimeout(
          () => {
            document
              .getElementById(
                "nexa-payment-card"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "start",
              });
          },
          120
        );

        return;
      }

      try {
        setPayError(
          null
        );

        setPayLoading(
          true
        );

        /*
         * Recheck live availability
         * immediately before Stripe.
         */
        const liveAvailability =
          await checkCheckoutAvailability(
            {
              vehicleId:
                vehicle.id,

              vehicleName:
                publicVehicleName,

              fleetGroup:
                resolvedFleetGroup,

              quantity,

              plan,

              from,

              to,

              pickupTime,

              dropoffTime,
            }
          );

        if (
          liveAvailability?.ok &&
          liveAvailability.available ===
            false
        ) {
          throw new Error(
            liveAvailability.message ||
              "Sorry, the selected scooter quantity is no longer available for this date and time."
          );
        }

        if (
          liveAvailability?.ok ===
          false
        ) {
          throw new Error(
            liveAvailability.message ||
              "Live availability could not be confirmed. Please try again or contact us on WhatsApp."
          );
        }

        if (
          typeof liveAvailability
            ?.availableCount ===
            "number" &&
          liveAvailability.availableCount <
            quantity
        ) {
          throw new Error(
            liveAvailability.availableCount >
              0
              ? `Only ${
                  liveAvailability.availableCount
                } scooter${
                  liveAvailability.availableCount ===
                  1
                    ? " is"
                    : "s are"
                } available for the selected date and time.`
              : "Sorry, this scooter category is sold out for the selected date and time."
          );
        }

        const finalFleetGroup =
          liveAvailability?.fleetGroup ||
          resolvedFleetGroup ||
          "";

        if (
          !finalFleetGroup
        ) {
          throw new Error(
            "The scooter category could not be confirmed. Please try again or contact us on WhatsApp."
          );
        }

        /*
         * IMPORTANT:
         *
         * For scooter verification, the phone/QR
         * session already created the booking ID.
         *
         * We MUST use the SAME booking ID so the
         * document paths and Stripe booking match.
         */
        let bookingId =
          verificationBookingId;

        if (
          requiresDocumentVerification &&
          !bookingId
        ) {
          throw new Error(
            "Document verification booking ID is missing. Please restart document verification."
          );
        }

        /*
         * E-bike checkout does not use
         * document verification, so generate
         * the booking ID here as before.
         */
        if (!bookingId) {
          bookingId =
            `bk_${finalFleetGroup}_${Date.now()}`;
        }

        const customerName =
          `${firstName.trim()} ${surname.trim()}`.trim();

        /*
         * Desktop QR flow returns existing
         * paths without re-uploading.
         */
        const uploadedDocs =
          await uploadBookingDocuments(
            bookingId
          );

        if (
          requiresDocumentVerification &&
          !hasRemoteDocumentPaths(
            uploadedDocs,
            identityDocumentType
          )
        ) {
          throw new Error(
            "Verified document files are incomplete. Please restart document verification."
          );
        }

        const finalNotes =
          [
            homeAddress.trim()
              ? `Home address: ${homeAddress.trim()}`
              : "",

            identityDocumentType
              ? `Identity document: ${
                  identityDocumentType ===
                  "passport"
                    ? "Passport"
                    : "ID card"
                }`
              : "",

            requiresDocumentVerification
              ? "Documents captured through NEXA online document verification."
              : "",

            verificationSessionToken
              ? `Document verification session: ${verificationSessionToken}`
              : "",

            notes.trim()
              ? `Notes: ${notes.trim()}`
              : "",
          ]
            .filter(Boolean)
            .join(
              "\n\n"
            );

        const response =
          await fetch(
            "/api/stripe/create-payment-intent",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  bookingId,

                  totalAmount:
                    totalCents,

                  currency:
                    "eur",

                  customerEmail:
                    email.trim(),

                  customerName,

                  phone:
                    phone.trim(),

                  homeAddress:
                    homeAddress.trim(),

                  customerAddress:
                    homeAddress.trim(),

                  address:
                    homeAddress.trim(),

                  pickupDateISO:
                    from
                      ? from.toLocaleDateString(
                          "en-CA"
                        )
                      : "",

                  returnDateISO:
                    to
                      ? to.toLocaleDateString(
                          "en-CA"
                        )
                      : "",

                  pickupTime,

                  dropoffTime,

                  pickupLocation,

                  /*
                   * Public category information.
                   */
                  bikeName:
                    publicVehicleName,

                  vehicle:
                    publicVehicleName,

                  vehicleName:
                    publicVehicleName,

                  vehicleId:
                    vehicle.id,

                  fleetGroup:
                    finalFleetGroup,

                  quantity,

                  plan,

                  ratePerDay:
                    discountedPerDayEur,

                  days:
                    rentalDays,

                  total:
                    totalEur,

                  availabilityChecked:
                    liveAvailability?.ok
                      ? "checkout-live"
                      : availabilityCheckedFromPanel ||
                        "pending-api",

                  availableCount:
                    typeof liveAvailability
                      ?.availableCount ===
                    "number"
                      ? String(
                          liveAvailability.availableCount
                        )
                      : availableCountFromPanel ||
                        "",

                  totalFleet:
                    typeof liveAvailability
                      ?.totalFleet ===
                    "number"
                      ? String(
                          liveAvailability.totalFleet
                        )
                      : totalFleetFromPanel ||
                        "",

                  notes:
                    finalNotes,

                  customerNotes:
                    notes.trim(),

                  /*
                   * Verification information.
                   */
                  documentVerificationStatus:
                    requiresDocumentVerification
                      ? "completed"
                      : "not_required",

                  verificationSessionToken,

                  identityDocumentType:
                    identityDocumentType ||
                    "",

                  /*
                   * Existing private document paths.
                   */
                  dlFrontName:
                    uploadedDocs.dlFrontName,

                  dlBackName:
                    uploadedDocs.dlBackName,

                  idFrontName:
                    uploadedDocs.idFrontName,

                  idBackName:
                    uploadedDocs.idBackName,

                  dlFrontPath:
                    uploadedDocs.dlFrontPath,

                  dlBackPath:
                    uploadedDocs.dlBackPath,

                  idFrontPath:
                    uploadedDocs.idFrontPath,

                  idBackPath:
                    uploadedDocs.idBackPath,

                  marketingOptIn,
                }),
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
          data = {};
        }

        if (
          !response.ok ||
          !data?.clientSecret
        ) {
          const errorCode =
            String(
              data?.code ||
                data?.errorCode ||
                data?.error_code ||
                ""
            ).toLowerCase();

          if (
            response.status ===
              409 ||
            errorCode.includes(
              "sold_out"
            ) ||
            errorCode.includes(
              "availability"
            ) ||
            errorCode.includes(
              "inventory"
            )
          ) {
            throw new Error(
              data?.message ||
                data?.error ||
                "The selected scooter quantity is no longer available. Please choose another date, time, or quantity."
            );
          }

          if (
            response.status ===
              410 ||
            errorCode.includes(
              "expired"
            )
          ) {
            throw new Error(
              "Your payment session expired. Please continue again so we can recheck live availability."
            );
          }

          throw new Error(
            data?.message ||
              data?.error ||
              "Payment initialization failed. Please try again."
          );
        }

        setClientSecret(
          data.clientSecret
        );

        setCheckoutSide(
          "payment"
        );

        window.setTimeout(
          () => {
            document
              .getElementById(
                "nexa-payment-card"
              )
              ?.scrollIntoView({
                behavior:
                  "smooth",

                block:
                  "start",
              });
          },
          180
        );
      } catch (
        error: any
      ) {
        setPayError(
          error?.message ||
            "Something went wrong."
        );
      } finally {
        setPayLoading(
          false
        );
      }
    };

  return (
    <div
      className={`${manrope.className} nexa-checkout-root min-h-screen bg-white text-[#111]`}
    >
      <main className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col bg-white px-4 py-4 sm:px-6 lg:px-8 2xl:max-w-[1600px]">
        <section className="flex flex-1 flex-col bg-white px-0 py-0">
          <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">
            <button
              type="button"
              onClick={
                backToVehicles
              }
              className="inline-flex items-center gap-2 text-[16px] font-extrabold tracking-[-0.01em] text-black transition duration-200 hover:-translate-x-1 hover:text-black/60 active:scale-[0.97] 2xl:text-[18px]"
            >
              <span className="text-[21px] leading-none">
                ←
              </span>

              <span>
                Vehicles
              </span>
            </button>
          </div>

          <div className="grid flex-1 gap-8 lg:grid-cols-[0.92fr_1.08fr] xl:gap-10 2xl:grid-cols-[0.94fr_1.06fr] 2xl:gap-12">
            <BookingSummary
              vehicle={
                vehicle
              }

              publicVehicleName={
                publicVehicleName
              }

              checkoutImage={
                checkoutImage
              }

              pickupLocation={
                pickupLocation
              }

              from={
                from
              }

              to={
                to
              }

              pickupTime={
                pickupTime
              }

              dropoffTime={
                dropoffTime
              }

              locale={
                locale
              }

              planLabel={
                planLabel
              }

              durationLabel={`${durationLabel} · ${quantity} scooter${
                quantity ===
                1
                  ? ""
                  : "s"
              }`}

              totalEur={
                totalEur
              }

              deposit={
                deposit
              }
            />

            {checkoutSide ===
            "verification" ? (
              <DocumentVerification
                autoStart

                onComplete={
                  handleDocumentVerificationComplete
                }

                onCancel={
                  backToVehicles
                }
              />
            ) : checkoutSide ===
              "details" ? (
              <CheckoutDetailsSide
                firstName={
                  firstName
                }

                setFirstName={
                  setFirstName
                }

                surname={
                  surname
                }

                setSurname={
                  setSurname
                }

                phone={
                  phone
                }

                setPhone={
                  setPhone
                }

                email={
                  email
                }

                setEmail={
                  setEmail
                }

                homeAddress={
                  homeAddress
                }

                setHomeAddress={
                  setHomeAddress
                }

                notes={
                  notes
                }

                setNotes={
                  setNotes
                }

                firstNameRef={
                  firstNameRef
                }

                surnameRef={
                  surnameRef
                }

                phoneRef={
                  phoneRef
                }

                emailRef={
                  emailRef
                }

                homeAddressRef={
                  homeAddressRef
                }

                notesRef={
                  notesRef
                }

                moveToNextField={
                  moveToNextField
                }

                documentsCaptured={
                  documentsCaptured
                }

                requiresDocumentVerification={
                  requiresDocumentVerification
                }

                identityDocumentType={
                  identityDocumentType
                }

                contractReadyOk={
                  contractReadyOk
                }

                setContractReadyOk={
                  setContractReadyOk
                }

                agreeTerms={
                  agreeTerms
                }

                setAgreeTerms={
                  setAgreeTerms
                }

                marketingOptIn={
                  marketingOptIn
                }

                setMarketingOptIn={
                  setMarketingOptIn
                }

                payNowCents={
                  payNowCents
                }

                canPay={
                  canPay
                }

                payLoading={
                  payLoading
                }

                payError={
                  payError
                }

                onContinue={
                  payNowAction
                }
              />
            ) : (
              <PaymentSide
                planLabel={`${planLabel} · ${quantity} scooter${
                  quantity ===
                  1
                    ? ""
                    : "s"
                }`}

                payNowCents={
                  payNowCents
                }

                deposit={
                  deposit
                }

                clientSecret={
                  clientSecret
                }

                customerName={`${firstName.trim()} ${surname.trim()}`.trim()}

                customerEmail={
                  email.trim()
                }

                customerPhone={
                  phone.trim()
                }

                onEdit={() =>
                  setCheckoutSide(
                    "details"
                  )
                }
              />
            )}
          </div>
        </section>
      </main>

      <style jsx global>{`
        html,
        body {
          background: #ffffff !important;
        }

        .nexa-checkout-root input,
        .nexa-checkout-root textarea,
        .nexa-checkout-root button {
          border-radius: 0 !important;
        }

        .nexa-checkout-root input:-webkit-autofill,
        .nexa-checkout-root textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #fafaf8 inset !important;
          -webkit-text-fill-color: #111111 !important;
        }
      `}</style>
    </div>
  );
}

function BookingSummary({
  vehicle,
  publicVehicleName,
  checkoutImage,
  pickupLocation,
  from,
  to,
  pickupTime,
  dropoffTime,
  locale,
  planLabel,
  durationLabel,
  totalEur,
  deposit,
}: {
  vehicle: Vehicle;

  publicVehicleName: string;

  checkoutImage: string;

  pickupLocation: string;

  from?: Date;
  to?: Date;

  pickupTime: string;
  dropoffTime: string;

  locale: string;

  planLabel: string;
  durationLabel: string;

  totalEur: number;

  deposit: number;
}) {
  return (
    <aside className="flex h-full flex-col">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/28">
          Selected vehicle
        </div>

        <h1
          className="mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-black sm:text-[30px] 2xl:text-[34px]"
          style={{
            fontFamily:
              manrope.style
                .fontFamily,
          }}
        >
          {publicVehicleName ||
            vehicle.name}
        </h1>

        <p className="mt-1 text-sm font-medium text-black/42 2xl:text-[15px]">
          {vehicle.type} ·{" "}
          {vehicle.spec1}
        </p>
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,1fr)_200px] 2xl:grid-cols-[minmax(0,1fr)_230px] 2xl:gap-6">
        <div className="flex h-[clamp(220px,30vh,385px)] items-center justify-center bg-white">
          <img
            src={
              checkoutImage
            }
            alt={
              publicVehicleName ||
              vehicle.name
            }
            className="h-full w-full object-contain"
          />
        </div>

        <div className="md:border-l md:border-black/10 md:pl-5 2xl:pl-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/30">
            Includes
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 md:block md:space-y-4 2xl:mt-4 2xl:space-y-5">
            {INCLUDED_ITEMS.map(
              (item) => (
                <IncludedItem
                  key={
                    item.label
                  }

                  label={
                    item.label
                  }

                  image={
                    item.image
                  }
                />
              )
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 2xl:mt-5">
        <PlainLine
          label="Pickup"

          value={`${fmtDate(
            from,
            locale
          )} · ${formatTimeLabel(
            pickupTime,
            locale
          )}`}
        />

        <PlainLine
          label="Return"

          value={`${fmtDate(
            to,
            locale
          )} · ${formatTimeLabel(
            dropoffTime,
            locale
          )}`}
        />

        <PlainLine
          label="Plan"

          value={`${planLabel} · ${durationLabel}`}
        />

        <PlainLine
          label="Pickup location"

          value={
            pickupLocation
          }

          href={
            PICKUP_LOCATION_MAP_URL
          }
        />
      </div>

      <div className="mt-4 border-t border-black/10 pt-2 2xl:mt-5">
        <PlainLine
          label="Rental total"

          value={`€${eur(
            totalEur
          )}`}

          strong
        />
      </div>

      <p className="mt-3 text-xs font-medium leading-5 text-black/45 2xl:text-[13px] 2xl:leading-6">
        A refundable security
        deposit of €
        {eur(deposit)} per
        scooter is handled at
        pickup by cash or card.
      </p>
    </aside>
  );
}

function IncludedItem({
  label,
  image,
}: {
  label: string;
  image: string;
}) {
  const mobileOrderClass =
    label === "Lock"
      ? "order-2"
      : label ===
          "Top Case"
        ? "order-3"
        : label ===
            "Insurance"
          ? "order-4"
          : label ===
              "Phone Mount"
            ? "order-5 col-span-2"
            : "order-1";

  return (
    <div
      className={[
        "flex items-center gap-2.5 md:gap-3 2xl:gap-4",
        mobileOrderClass,
      ].join(" ")}
    >
      <img
        src={
          image
        }
        alt={
          label
        }
        className="h-9 w-9 shrink-0 object-contain md:h-12 md:w-12 2xl:h-14 2xl:w-14"
      />

      <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
        <span className="shrink-0 text-[14px] font-extrabold leading-none text-[#ff7a00] md:text-[16px] 2xl:text-[18px]">
          ✓
        </span>

        <span className="truncate text-[12px] font-semibold leading-tight text-black/78 md:text-sm 2xl:text-[15px]">
          {label}
        </span>
      </div>
    </div>
  );
}

function PlainLine({
  label,
  value,
  strong,
  muted,
  href,
}: {
  label: string;
  value: string;

  strong?: boolean;
  muted?: boolean;

  href?: string;
}) {
  const valueClassName =
    [
      "max-w-[65%] text-right text-sm 2xl:text-[15px]",

      strong
        ? "font-extrabold text-black"
        : "font-semibold text-black/72",

      muted
        ? "text-black/42"
        : "",

      href
        ? "underline decoration-black/25 underline-offset-4 transition hover:text-black"
        : "",
    ].join(" ");

  return (
    <div className="flex items-start justify-between gap-5 border-b border-black/[0.07] py-2.5 last:border-b-0 2xl:py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/28">
        {label}
      </div>

      {href ? (
        <a
          href={
            href
          }
          target="_blank"
          rel="noopener noreferrer"
          className={
            valueClassName
          }
        >
          {value}
        </a>
      ) : (
        <div
          className={
            valueClassName
          }
        >
          {value}
        </div>
      )}
    </div>
  );
}

function CheckoutDetailsSide({
  firstName,
  setFirstName,

  surname,
  setSurname,

  phone,
  setPhone,

  email,
  setEmail,

  homeAddress,
  setHomeAddress,

  notes,
  setNotes,

  firstNameRef,
  surnameRef,
  phoneRef,
  emailRef,
  homeAddressRef,
  notesRef,

  moveToNextField,

  documentsCaptured,

  requiresDocumentVerification,

  identityDocumentType,

  contractReadyOk,
  setContractReadyOk,

  agreeTerms,
  setAgreeTerms,

  marketingOptIn,
  setMarketingOptIn,

  payNowCents,

  canPay,

  payLoading,

  payError,

  onContinue,
}: {
  firstName: string;

  setFirstName:
    (value: string) => void;

  surname: string;

  setSurname:
    (value: string) => void;

  phone: string;

  setPhone:
    (value: string) => void;

  email: string;

  setEmail:
    (value: string) => void;

  homeAddress: string;

  setHomeAddress:
    (value: string) => void;

  notes: string;

  setNotes:
    (value: string) => void;

  firstNameRef:
    React.RefObject<HTMLInputElement | null>;

  surnameRef:
    React.RefObject<HTMLInputElement | null>;

  phoneRef:
    React.RefObject<HTMLInputElement | null>;

  emailRef:
    React.RefObject<HTMLInputElement | null>;

  homeAddressRef:
    React.RefObject<HTMLTextAreaElement | null>;

  notesRef:
    React.RefObject<HTMLTextAreaElement | null>;

  moveToNextField: (
    event:
      React.KeyboardEvent<HTMLInputElement>,

    nextRef?: React.RefObject<
      | HTMLInputElement
      | HTMLTextAreaElement
      | null
    >
  ) => void;

  documentsCaptured:
    boolean;

  requiresDocumentVerification:
    boolean;

  identityDocumentType:
    | "id"
    | "passport"
    | null;

  contractReadyOk:
    boolean;

  setContractReadyOk:
    (value: boolean) => void;

  agreeTerms:
    boolean;

  setAgreeTerms:
    (value: boolean) => void;

  marketingOptIn:
    boolean;

  setMarketingOptIn:
    (value: boolean) => void;

  payNowCents:
    number;

  canPay:
    boolean;

  payLoading:
    boolean;

  payError:
    string | null;

  onContinue:
    () => void;
}) {
  return (
    <section
      id="nexa-customer-details"
      className="flex h-full flex-col"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-black/30">
            Step 2 of 3
          </div>

          <h2
            className="mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-black sm:text-[30px] 2xl:text-[34px]"
            style={{
              fontFamily:
                manrope.style
                  .fontFamily,
            }}
          >
            Your details
          </h2>

          <p className="mt-1 text-sm font-medium text-black/40 2xl:text-[15px]">
            Complete the
            remaining required
            fields.
          </p>
        </div>

        <div className="text-xs font-bold uppercase tracking-[0.18em] text-black/38">
          * Required
        </div>
      </div>

      {requiresDocumentVerification &&
      documentsCaptured ? (
        <div className="mt-5 flex items-center justify-between gap-4 border border-black/10 bg-black/[0.025] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-black text-xs font-extrabold text-white">
              ✓
            </div>

            <div>
              <div className="text-sm font-extrabold text-black">
                Documents
                received
              </div>

              <div className="mt-0.5 text-xs font-medium text-black/42">
                Driving licence
                +{" "}
                {identityDocumentType ===
                "passport"
                  ? "passport"
                  : "ID card"}
              </div>
            </div>
          </div>

          <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-black/35">
            Complete
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 2xl:mt-6 2xl:gap-x-6 2xl:gap-y-5">
        <Field label="First name *">
          <TextInput
            ref={
              firstNameRef
            }

            value={
              firstName
            }

            onChange={(
              event
            ) =>
              setFirstName(
                event.target.value
              )
            }

            onKeyDown={(
              event
            ) =>
              moveToNextField(
                event,
                surnameRef
              )
            }

            placeholder="John"

            autoComplete="given-name"
          />
        </Field>

        <Field label="Surname *">
          <TextInput
            ref={
              surnameRef
            }

            value={
              surname
            }

            onChange={(
              event
            ) =>
              setSurname(
                event.target.value
              )
            }

            onKeyDown={(
              event
            ) =>
              moveToNextField(
                event,
                phoneRef
              )
            }

            placeholder="Smith"

            autoComplete="family-name"
          />
        </Field>

        <Field label="Phone / WhatsApp *">
          <TextInput
            ref={
              phoneRef
            }

            value={
              phone
            }

            onChange={(
              event
            ) =>
              setPhone(
                event.target.value
              )
            }

            onKeyDown={(
              event
            ) =>
              moveToNextField(
                event,
                emailRef
              )
            }

            placeholder="+34 600 000 000"

            autoComplete="tel"

            inputMode="tel"
          />
        </Field>

        <Field label="Email *">
          <TextInput
            ref={
              emailRef
            }

            value={
              email
            }

            onChange={(
              event
            ) =>
              setEmail(
                event.target.value
              )
            }

            onKeyDown={(
              event
            ) =>
              moveToNextField(
                event,
                homeAddressRef
              )
            }

            placeholder="you@email.com"

            autoComplete="email"

            inputMode="email"
          />
        </Field>

        <Field
          label="Home address *"
          wide
        >
          <textarea
            ref={
              homeAddressRef
            }

            value={
              homeAddress
            }

            onChange={(
              event
            ) =>
              setHomeAddress(
                event.target.value
              )
            }

            className="min-h-[74px] w-full resize-none border border-black/18 bg-[#fafaf8] px-3 py-2 text-sm font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-black 2xl:min-h-[82px] 2xl:px-4 2xl:py-3 2xl:text-[15px]"

            placeholder="Street, city, postcode, country"

            autoComplete="street-address"
          />
        </Field>
      </div>

      <div className="mt-4 2xl:mt-5">
        <Field
          label="Notes"
          wide
        >
          <textarea
            ref={
              notesRef
            }

            value={
              notes
            }

            onChange={(
              event
            ) =>
              setNotes(
                event.target.value
              )
            }

            className="min-h-[60px] w-full resize-none border border-black/18 bg-[#fafaf8] px-3 py-2 text-sm font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-black 2xl:min-h-[68px] 2xl:px-4 2xl:py-3 2xl:text-[15px]"

            placeholder="Pickup request, helmet size, etc."
          />
        </Field>
      </div>

      <div className="mt-5 space-y-2.5 border-t border-black/10 pt-4 2xl:mt-6 2xl:space-y-3 2xl:pt-5">
        <CheckLine
          checked={
            contractReadyOk
          }

          onChange={
            setContractReadyOk
          }

          text="I confirm that the driving licence belongs to the person making this booking."
        />

        <CheckLine
          checked={
            agreeTerms
          }

          onChange={
            setAgreeTerms
          }

          text="I accept the rental terms."
        />

        <CheckLine
          checked={
            marketingOptIn
          }

          onChange={
            setMarketingOptIn
          }

          text="Send me offers by email."

          optional
        />
      </div>

      {payError ? (
        <div className="mt-4 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {payError}
        </div>
      ) : null}

      <button
        type="button"

        onClick={
          onContinue
        }

        disabled={
          !canPay ||
          payLoading
        }

        className={[
          "mt-5 min-h-[52px] w-full px-6 text-sm font-extrabold transition duration-200 2xl:mt-6 2xl:min-h-[56px] 2xl:text-[15px]",

          canPay
            ? "bg-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 hover:bg-black/85 hover:shadow-[0_20px_46px_rgba(0,0,0,0.20)] active:translate-y-0 active:scale-[0.98]"
            : "cursor-not-allowed bg-black/10 text-black/35",
        ].join(" ")}
      >
        {payLoading
          ? "Preparing payment..."
          : `Pay online · €${eurFromCents(
              payNowCents
            )}`}
      </button>

      {!canPay ? (
        <p className="mt-2 text-center text-xs font-medium text-black/35 2xl:text-[13px]">
          Complete the
          required fields to
          continue.
        </p>
      ) : null}
    </section>
  );
}

function PaymentSide({
  planLabel,
  payNowCents,
  deposit,
  clientSecret,
  customerName,
  customerEmail,
  customerPhone,
  onEdit,
}: {
  planLabel:
    string;

  payNowCents:
    number;

  deposit:
    number;

  clientSecret:
    string | null;

  customerName:
    string;

  customerEmail:
    string;

  customerPhone:
    string;

  onEdit:
    () => void;
}) {
  return (
    <section
      id="nexa-payment-card"
      className="h-full"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-black/30">
            Step 3 of 3
          </div>

          <h2
            className="mt-1 text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-black sm:text-[30px] 2xl:text-[34px]"
            style={{
              fontFamily:
                manrope.style
                  .fontFamily,
            }}
          >
            Payment
          </h2>

          <p className="mt-1 text-sm font-medium text-black/40 2xl:text-[15px]">
            Secure payment.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"

            onClick={
              onEdit
            }

            className="inline-flex items-center gap-2 border border-black/10 bg-white px-3 py-2 text-sm font-extrabold text-black/70 transition duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:bg-black hover:text-white active:translate-y-0 active:scale-[0.97]"
          >
            <span className="text-[16px] leading-none">
              ←
            </span>

            Back
          </button>

          <button
            type="button"

            onClick={
              onEdit
            }

            className="border border-black/10 bg-white px-3 py-2 text-sm font-bold text-black/55 transition duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:text-black active:translate-y-0 active:scale-[0.97]"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="mt-6 border-y border-black/10 py-3 2xl:mt-7 2xl:py-4">
        <PlainPaymentLine
          label="Plan"

          value={
            planLabel
          }
        />

        <PlainPaymentLine
          label="Rental total"

          value={`€${eurFromCents(
            payNowCents
          )}`}

          strong
        />
      </div>

      <p className="mt-3 text-xs font-medium leading-5 text-black/45 2xl:text-[13px] 2xl:leading-6">
        A refundable security
        deposit of €
        {eur(deposit)} per
        scooter is handled at
        pickup by cash or card.
      </p>

      <div
        id="stripe-embedded"
        className="mt-6 2xl:mt-7"
      >
        {clientSecret ? (
          <CheckoutShell
            clientSecret={
              clientSecret
            }

            customerName={
              customerName
            }

            customerEmail={
              customerEmail
            }

            customerPhone={
              customerPhone
            }
          />
        ) : (
          <div className="py-8 text-sm font-medium text-black/45">
            Preparing secure
            checkout...
          </div>
        )}
      </div>
    </section>
  );
}

function PlainPaymentLine({
  label,
  value,
  strong,
  muted,
}: {
  label:
    string;

  value:
    string;

  strong?:
    boolean;

  muted?:
    boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 py-2 2xl:py-2.5">
      <span
        className={[
          "text-sm font-medium 2xl:text-[15px]",

          muted
            ? "text-black/35"
            : "text-black/50",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={[
          "text-sm 2xl:text-[15px]",

          strong
            ? "font-extrabold text-black"
            : "font-bold text-black/75",

          muted
            ? "text-black/42"
            : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label:
    string;

  children:
    React.ReactNode;

  wide?:
    boolean;
}) {
  return (
    <label
      className={
        wide
          ? "block sm:col-span-2"
          : "block"
      }
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/45">
        {label}
      </span>

      <span className="mt-1 block">
        {children}
      </span>
    </label>
  );
}

const TextInput =
  React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >(
    function TextInput(
      props,
      ref
    ) {
      return (
        <input
          ref={
            ref
          }

          {...props}

          className="h-11 w-full border border-black/18 bg-[#fafaf8] px-3 text-sm font-semibold text-black outline-none transition placeholder:text-black/35 focus:border-black 2xl:h-12 2xl:px-4 2xl:text-[15px]"
        />
      );
    }
  );

function CheckLine({
  checked,
  onChange,
  text,
  optional,
}: {
  checked:
    boolean;

  onChange:
    (value: boolean) => void;

  text:
    string;

  optional?:
    boolean;
}) {
  return (
    <label className="flex cursor-pointer select-none items-start gap-3">
      <input
        type="checkbox"

        checked={
          checked
        }

        onChange={(
          event
        ) =>
          onChange(
            event.target.checked
          )
        }

        className="mt-1 h-4 w-4"

        style={{
          accentColor:
            "#111111",
        }}
      />

      <span
        className={[
          "text-sm leading-6 2xl:text-[15px]",

          optional
            ? "text-black/38"
            : "font-medium text-black/62",
        ].join(" ")}
      >
        {text}
      </span>
    </label>
  );
}