"use client";

import {
  AlertTriangle,
  Bike,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Euro,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminShell from "../../components/dashboard/AdminShell";

type FleetGroup =
  | "piaggio_liberty_125"
  | "kymco_sky_town_125"
  | "sym_symphony_125";

type PaymentStatus =
  | "paid"
  | "partial"
  | "unpaid";

type Reservation = {
  id: string;

  customerName: string;
  customerEmail: string;
  phone: string;

  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;

  fleetGroup: string;
  fleetName: string;

  assignedVehicleCode: string;
  assignedVehicleCodes?: string[];

  vehicleName: string;

  vehicle?: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
    imageUrl: string;
  } | null;

  quantity: number;

  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;

  paymentStatus: PaymentStatus;
  paymentMethod: string;

  notes: string;
  source: string;
  reservationOrigin?: string;

  status: string;
  contractNumber: string;

  hasDocuments?: boolean;
  documentCount?: number;

  createdAt: string;
  updatedAt: string;
};

type AvailableVehicle = {
  vehicleCode: string;
  publicVehicleName: string;
  fleetGroup: string;

  exactAvailable: boolean;
  availabilityStatus: string;

  availableCount: number;
  totalFleet: number;
  bookedQuantity: number;
  heldQuantity: number;

  vehicle?: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
    imageUrl: string;
  } | null;
};

type AvailabilityResponse = {
  ok: boolean;
  available: boolean;

  fleetGroup: string;
  fleetName: string;

  bufferMinutes: number;

  availableCount: number;
  totalFleet: number;
  bookedQuantity: number;
  heldQuantity: number;

  vehicles: AvailableVehicle[];
  availableVehicles: AvailableVehicle[];

  error?: string;
};

type ReservationDocument = {
  key: string;
  label: string;
  name: string;
  url: string;
  downloadUrl: string;
};

type ReservationForm = {
  contractNumber: string;

  customerName: string;
  customerEmail: string;
  phone: string;

  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;

  fleetGroup: FleetGroup;

  quantity: number;
  assignedVehicleCodes: string[];

  totalAmount: string;
  amountPaid: string;
  paymentMethod: string;

  notes: string;
  status: string;
};

type FormMode =
  | "create"
  | "edit";

const EMPTY_FORM: ReservationForm = {
  contractNumber: "",

  customerName: "",
  customerEmail: "",
  phone: "",

  pickupDate: "",
  pickupTime: "10:00",
  dropoffDate: "",
  dropoffTime: "10:00",

  fleetGroup: "piaggio_liberty_125",

  quantity: 1,
  assignedVehicleCodes: [],

  totalAmount: "",
  amountPaid: "",
  paymentMethod: "unpaid",

  notes: "",
  status: "confirmed",
};

const FLEET_OPTIONS: Array<{
  value: FleetGroup;
  label: string;
  description: string;
}> = [
  {
    value: "piaggio_liberty_125",
    label: "Piaggio Liberty 125",
    description: "N1–N7",
  },
  {
    value: "kymco_sky_town_125",
    label: "KYMCO Sky Town 125",
    description: "N9",
  },
  {
    value: "sym_symphony_125",
    label: "SYM Symphony 125",
    description: "N8",
  },
];

const DOCUMENT_DEFINITIONS = [
  {
    key: "dlFront",
    label: "Driving licence front",
  },
  {
    key: "dlBack",
    label: "Driving licence back",
  },
  {
    key: "idFront",
    label: "ID / passport front",
  },
  {
    key: "idBack",
    label: "ID card back",
  },
];

const inputClasses =
  "w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/45";

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeVehicleCode(value: unknown) {
  return cleanText(value)
    .toUpperCase()
    .replace(/\s+/g, "");
}

function euroText(cents: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(cents || 0) / 100);
}

function centsToInput(cents: number) {
  const amount = Number(cents || 0) / 100;

  return amount > 0
    ? amount.toFixed(2)
    : "";
}

function euroInputToCents(value: string) {
  const clean = String(value || "")
    .replace("€", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const amount = Number(clean);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(amount * 100)
  );
}

function buildDateTime(
  date: string,
  time: string
) {
  if (!date || !time) {
    return null;
  }

  const value = new Date(
    `${date}T${time}:00`
  );

  return Number.isNaN(value.getTime())
    ? null
    : value;
}

function formatDate(date: string) {
  if (!date) {
    return "No date";
  }

  const value = new Date(
    `${date}T00:00:00`
  );

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function createContractNumber() {
  const timestamp =
    Date.now()
      .toString()
      .slice(-8);

  return `NX-R-${timestamp}`;
}

function getPaymentStatus(
  totalAmount: string,
  amountPaid: string
): PaymentStatus {
  const total =
    euroInputToCents(totalAmount);

  const paid =
    euroInputToCents(amountPaid);

  if (
    total > 0 &&
    paid >= total
  ) {
    return "paid";
  }

  if (paid > 0) {
    return "partial";
  }

  return "unpaid";
}

function paymentStatusClasses(
  status: string
) {
  if (status === "paid") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "partial") {
    return "border-amber-400/25 bg-amber-500/10 text-amber-300";
  }

  return "border-red-400/25 bg-red-500/10 text-red-300";
}

function sourceClasses(source: string) {
  const normalized =
    source.toLowerCase();

  if (
    normalized.includes("manual")
  ) {
    return "border-violet-400/25 bg-violet-500/10 text-violet-300";
  }

  return "border-sky-400/25 bg-sky-500/10 text-sky-300";
}

function isWebsiteReservation(
  reservation: Reservation
) {
  const source = [
    reservation.source,
    reservation.reservationOrigin,
    reservation.contractNumber,
  ]
    .join(" ")
    .toLowerCase();

  return (
    source.includes("website") ||
    source.includes("online") ||
    source.includes("stripe") ||
    source.includes("pi_")
  );
}

function getAssignedCodes(
  reservation: Reservation
) {
  const rawCodes =
    Array.isArray(
      reservation.assignedVehicleCodes
    )
      ? reservation.assignedVehicleCodes
      : reservation.assignedVehicleCode
      ? [
          reservation.assignedVehicleCode,
        ]
      : [];

  return Array.from(
    new Set(
      rawCodes
        .map(normalizeVehicleCode)
        .filter(Boolean)
    )
  );
}

function reservationToForm(
  reservation: Reservation
): ReservationForm {
  const knownGroup =
    FLEET_OPTIONS.some(
      (option) =>
        option.value ===
        reservation.fleetGroup
    )
      ? (reservation.fleetGroup as FleetGroup)
      : "piaggio_liberty_125";

  return {
    contractNumber:
      reservation.contractNumber,

    customerName:
      reservation.customerName,

    customerEmail:
      reservation.customerEmail,

    phone:
      reservation.phone,

    pickupDate:
      reservation.pickupDate,

    pickupTime:
      reservation.pickupTime ||
      "10:00",

    dropoffDate:
      reservation.dropoffDate,

    dropoffTime:
      reservation.dropoffTime ||
      "10:00",

    fleetGroup:
      knownGroup,

    quantity:
      Math.max(
        1,
        Number(
          reservation.quantity || 1
        )
      ),

    assignedVehicleCodes:
      getAssignedCodes(reservation),

    totalAmount:
      centsToInput(
        reservation.totalAmount
      ),

    amountPaid:
      centsToInput(
        reservation.amountPaid
      ),

    paymentMethod:
      reservation.paymentMethod ||
      "unpaid",

    notes:
      reservation.notes || "",

    status:
      reservation.status ||
      "confirmed",
  };
}

function isReservationPast(
  reservation: Reservation
) {
  const dropoff =
    buildDateTime(
      reservation.dropoffDate,
      reservation.dropoffTime ||
        "23:59"
    );

  if (!dropoff) {
    return false;
  }

  return dropoff.getTime() <
    Date.now();
}

function getDocumentValue(
  data: any,
  key: string
) {
  return (
    data?.documents?.[key] ??
    data?.documentUrls?.[key] ??
    data?.[key] ??
    null
  );
}

function normalizeDocuments(
  data: any
): ReservationDocument[] {
  if (
    Array.isArray(data?.documents)
  ) {
    return data.documents
      .map(
        (
          document: any,
          index: number
        ) => ({
          key:
            cleanText(
              document.key
            ) || `document-${index}`,

          label:
            cleanText(
              document.label
            ) || "Document",

          name:
            cleanText(
              document.name ||
                document.fileName
            ) || "Document",

          url:
            cleanText(
              document.url ||
                document.signedUrl ||
                document.previewUrl ||
                document.downloadUrl
            ),

          downloadUrl:
            cleanText(
              document.downloadUrl ||
                document.url ||
                document.signedUrl
            ),
        })
      )
      .filter(
        (
          document: ReservationDocument
        ) => Boolean(document.url)
      );
  }

  return DOCUMENT_DEFINITIONS
    .map((definition) => {
      const value =
        getDocumentValue(
          data,
          definition.key
        );

      if (!value) {
        return null;
      }

      if (
        typeof value === "string"
      ) {
        return {
          key:
            definition.key,

          label:
            definition.label,

          name:
            definition.label,

          url:
            value,

          downloadUrl:
            value,
        };
      }

      const url =
        cleanText(
          value.signedUrl ||
            value.url ||
            value.previewUrl ||
            value.downloadUrl
        );

      if (!url) {
        return null;
      }

      return {
        key:
          definition.key,

        label:
          definition.label,

        name:
          cleanText(
            value.name ||
              value.fileName
          ) ||
          definition.label,

        url,

        downloadUrl:
          cleanText(
            value.downloadUrl ||
              value.signedUrl ||
              value.url
          ) || url,
      };
    })
    .filter(
      (
        document
      ): document is ReservationDocument =>
        document !== null
    );
}

export default function ReservationsPage() {
  const [
    reservations,
    setReservations,
  ] = useState<Reservation[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    paymentFilter,
    setPaymentFilter,
  ] = useState("all");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    formMode,
    setFormMode,
  ] = useState<FormMode>("create");

  const [
    editingReservation,
    setEditingReservation,
  ] = useState<Reservation | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<ReservationForm>(
    EMPTY_FORM
  );

  const [
    availability,
    setAvailability,
  ] =
    useState<AvailabilityResponse | null>(
      null
    );

  const [
    checkingAvailability,
    setCheckingAvailability,
  ] = useState(false);

  const [
    availabilityError,
    setAvailabilityError,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    documentsOpen,
    setDocumentsOpen,
  ] = useState(false);

  const [
    documentReservation,
    setDocumentReservation,
  ] = useState<Reservation | null>(
    null
  );

  const [
    documents,
    setDocuments,
  ] = useState<
    ReservationDocument[]
  >([]);

  const [
    documentsLoading,
    setDocumentsLoading,
  ] = useState(false);

  const [
    documentsError,
    setDocumentsError,
  ] = useState("");

  const loadReservations =
    useCallback(
      async (
        showLoader = true
      ) => {
        if (showLoader) {
          setLoading(true);
        }

        setLoadError("");

        try {
          const response =
            await fetch(
              "/api/admin/reservations",
              {
                method: "GET",
                cache: "no-store",
              }
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data?.ok
          ) {
            throw new Error(
              data?.error ||
                "Could not load reservations."
            );
          }

          const rows =
            Array.isArray(
              data.reservations
            )
              ? data.reservations
              : [];

          setReservations(rows);
        } catch (error: any) {
          setLoadError(
            error?.message ||
              "Could not load reservations."
          );
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      []
    );

  useEffect(() => {
    loadReservations();

    const interval =
      window.setInterval(
        () =>
          loadReservations(false),
        30_000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [loadReservations]);

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const {
      fleetGroup,
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime,
    } = form;

    setAvailability(null);
    setAvailabilityError("");

    if (
      !fleetGroup ||
      !pickupDate ||
      !pickupTime ||
      !dropoffDate ||
      !dropoffTime
    ) {
      return;
    }

    const pickup =
      buildDateTime(
        pickupDate,
        pickupTime
      );

    const dropoff =
      buildDateTime(
        dropoffDate,
        dropoffTime
      );

    if (
      !pickup ||
      !dropoff ||
      dropoff <= pickup
    ) {
      return;
    }

    const controller =
      new AbortController();

    const timeout =
      window.setTimeout(
        async () => {
          setCheckingAvailability(
            true
          );

          try {
            const params =
              new URLSearchParams({
                action:
                  "availability",

                fleetGroup,

                pickupDate,
                pickupTime,

                dropoffDate,
                dropoffTime,
              });

            if (
              editingReservation?.id
            ) {
              params.set(
                "reservationId",
                editingReservation.id
              );

              params.set(
                "excludeReservationId",
                editingReservation.id
              );
            }

            const response =
              await fetch(
                `/api/admin/reservations?${params.toString()}`,
                {
                  method: "GET",
                  cache: "no-store",
                  signal:
                    controller.signal,
                }
              );

            const data =
              await response.json();

            if (
              !response.ok ||
              !data?.ok
            ) {
              throw new Error(
                data?.error ||
                  "Could not check availability."
              );
            }

            setAvailability(data);
          } catch (error: any) {
            if (
              error?.name !==
              "AbortError"
            ) {
              setAvailabilityError(
                error?.message ||
                  "Could not check availability."
              );
            }
          } finally {
            setCheckingAvailability(
              false
            );
          }
        },
        350
      );

    return () => {
      window.clearTimeout(
        timeout
      );

      controller.abort();
    };
  }, [
    showForm,
    editingReservation?.id,
    form.fleetGroup,
    form.pickupDate,
    form.pickupTime,
    form.dropoffDate,
    form.dropoffTime,
  ]);

  /*
   * The server already removes past
   * reservations. This second filter
   * ensures a reservation disappears
   * without waiting for the next refresh.
   */
  const activeReservations =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            !isReservationPast(
              reservation
            )
        ),
      [reservations]
    );

  const filteredReservations =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return activeReservations.filter(
        (reservation) => {
          if (
            paymentFilter !==
              "all" &&
            reservation.paymentStatus !==
              paymentFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            reservation.customerName,
            reservation.customerEmail,
            reservation.phone,
            reservation.contractNumber,
            reservation.assignedVehicleCode,
            ...getAssignedCodes(
              reservation
            ),
            reservation.vehicleName,
            reservation.fleetName,
            reservation.notes,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      activeReservations,
      search,
      paymentFilter,
    ]);

  function openCreateForm() {
    setFormMode("create");
    setEditingReservation(null);

    setForm({
      ...EMPTY_FORM,

      contractNumber:
        createContractNumber(),

      assignedVehicleCodes: [],
    });

    setAvailability(null);
    setAvailabilityError("");
    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(
    reservation: Reservation
  ) {
    setFormMode("edit");
    setEditingReservation(
      reservation
    );

    setForm(
      reservationToForm(
        reservation
      )
    );

    setAvailability(null);
    setAvailabilityError("");
    setFormError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setFormMode("create");
    setEditingReservation(null);
    setForm(EMPTY_FORM);

    setAvailability(null);
    setAvailabilityError("");
    setFormError("");
    setSuccess("");
  }

  function updateForm(
    field: keyof ReservationForm,
    value: string | number | string[]
  ) {
    setForm((current) => {
      if (
        field === "fleetGroup"
      ) {
        return {
          ...current,

          fleetGroup:
            value as FleetGroup,

          assignedVehicleCodes: [],
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });

    setFormError("");
    setSuccess("");
  }

  function toggleVehicle(
    vehicleCode: string
  ) {
    const normalizedCode =
      normalizeVehicleCode(
        vehicleCode
      );

    setForm((current) => {
      const selected =
        current.assignedVehicleCodes.includes(
          normalizedCode
        );

      if (selected) {
        return {
          ...current,

          assignedVehicleCodes:
            current.assignedVehicleCodes.filter(
              (code) =>
                code !==
                normalizedCode
            ),
        };
      }

      const maximum =
        formMode === "create"
          ? 1
          : Math.max(
              1,
              current.quantity
            );

      if (maximum === 1) {
        return {
          ...current,

          assignedVehicleCodes: [
            normalizedCode,
          ],
        };
      }

      if (
        current
          .assignedVehicleCodes
          .length >= maximum
      ) {
        return current;
      }

      return {
        ...current,

        assignedVehicleCodes: [
          ...current.assignedVehicleCodes,
          normalizedCode,
        ],
      };
    });

    setFormError("");
  }

  async function checkAvailabilityAgain() {
    if (
      !form.pickupDate ||
      !form.pickupTime ||
      !form.dropoffDate ||
      !form.dropoffTime
    ) {
      return;
    }

    const params =
      new URLSearchParams({
        action:
          "availability",

        fleetGroup:
          form.fleetGroup,

        pickupDate:
          form.pickupDate,

        pickupTime:
          form.pickupTime,

        dropoffDate:
          form.dropoffDate,

        dropoffTime:
          form.dropoffTime,
      });

    if (
      editingReservation?.id
    ) {
      params.set(
        "reservationId",
        editingReservation.id
      );

      params.set(
        "excludeReservationId",
        editingReservation.id
      );
    }

    try {
      const response =
        await fetch(
          `/api/admin/reservations?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        response.ok &&
        data?.ok
      ) {
        setAvailability(data);
      }
    } catch {
      /*
       * The protected database function
       * performs the final conflict check.
       */
    }
  }

  async function saveReservation() {
    setFormError("");
    setSuccess("");

    const totalAmount =
      euroInputToCents(
        form.totalAmount
      );

    const amountPaid =
      euroInputToCents(
        form.amountPaid
      );

    if (
      !form.customerName.trim()
    ) {
      setFormError(
        "Enter the customer name."
      );

      return;
    }

    if (
      !form.pickupDate ||
      !form.pickupTime ||
      !form.dropoffDate ||
      !form.dropoffTime
    ) {
      setFormError(
        "Select the pickup and return date/time."
      );

      return;
    }

    const pickup =
      buildDateTime(
        form.pickupDate,
        form.pickupTime
      );

    const dropoff =
      buildDateTime(
        form.dropoffDate,
        form.dropoffTime
      );

    if (
      !pickup ||
      !dropoff ||
      dropoff <= pickup
    ) {
      setFormError(
        "Return date/time must be after pickup date/time."
      );

      return;
    }

    if (
      amountPaid > totalAmount
    ) {
      setFormError(
        "Amount paid cannot exceed the total amount."
      );

      return;
    }

    const isManual =
      formMode === "create" ||
      cleanText(
        editingReservation?.source
      )
        .toLowerCase()
        .includes("manual") ||
      cleanText(
        editingReservation
          ?.reservationOrigin
      )
        .toLowerCase()
        .includes(
          "manual_reservation"
        );

    if (
      form.status !==
        "cancelled" &&
      isManual &&
      form.assignedVehicleCodes
        .length !== 1
    ) {
      setFormError(
        "Select exactly one available scooter for this manual reservation."
      );

      return;
    }

    if (
      form.assignedVehicleCodes
        .length >
      Math.max(1, form.quantity)
    ) {
      setFormError(
        `You can assign a maximum of ${form.quantity} scooter${
          form.quantity === 1
            ? ""
            : "s"
        }.`
      );

      return;
    }

    setSaving(true);

    try {
      const requestMethod =
        formMode === "edit"
          ? "PATCH"
          : "POST";

      const requestBody = {
        id:
          editingReservation?.id,

        reservationId:
          editingReservation?.id,

        contractNumber:
          form.contractNumber,

        customerName:
          form.customerName,

        customerEmail:
          form.customerEmail,

        phone:
          form.phone,

        pickupDate:
          form.pickupDate,

        pickupTime:
          form.pickupTime,

        dropoffDate:
          form.dropoffDate,

        dropoffTime:
          form.dropoffTime,

        fleetGroup:
          form.fleetGroup,

        quantity:
          form.quantity,

        assignedVehicleCode:
          form
            .assignedVehicleCodes[0] ||
          "",

        assignedVehicleCodes:
          form.assignedVehicleCodes,

        totalAmount,
        amountPaid,

        paymentStatus:
          getPaymentStatus(
            form.totalAmount,
            form.amountPaid
          ),

        paymentMethod:
          form.paymentMethod,

        notes:
          form.notes,

        status:
          form.status,
      };

      const response =
        await fetch(
          "/api/admin/reservations",
          {
            method:
              requestMethod,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.ok
      ) {
        throw new Error(
          data?.error ||
            (formMode ===
            "edit"
              ? "Could not update the reservation."
              : "Could not create the reservation.")
        );
      }

      const assignedText =
        form.assignedVehicleCodes
          .length > 0
          ? form.assignedVehicleCodes.join(
              ", "
            )
          : "No exact scooter assigned";

      setSuccess(
        formMode === "edit"
          ? `Reservation updated successfully. ${assignedText}.`
          : `Reservation ${form.contractNumber} created successfully. ${assignedText} is now blocked for these dates.`
      );

      await loadReservations(false);

      window.setTimeout(() => {
        closeForm();
      }, 1100);
    } catch (error: any) {
      setFormError(
        error?.message ||
          "The reservation could not be saved."
      );

      await checkAvailabilityAgain();
    } finally {
      setSaving(false);
    }
  }

  async function openDocuments(
    reservation: Reservation
  ) {
    setDocumentReservation(
      reservation
    );

    setDocuments([]);
    setDocumentsError("");
    setDocumentsOpen(true);
    setDocumentsLoading(true);

    try {
      const params =
        new URLSearchParams({
          action: "documents",

          reservationId:
            reservation.id,

          id:
            reservation.id,
        });

      const response =
        await fetch(
          `/api/admin/reservations?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.ok
      ) {
        throw new Error(
          data?.error ||
            "Could not load the customer documents."
        );
      }

      const normalized =
        normalizeDocuments(data);

      setDocuments(normalized);

      if (
        normalized.length === 0
      ) {
        setDocumentsError(
          "No uploaded documents were found for this booking."
        );
      }
    } catch (error: any) {
      setDocumentsError(
        error?.message ||
          "Could not load the customer documents."
      );
    } finally {
      setDocumentsLoading(false);
    }
  }

  function closeDocuments() {
    setDocumentsOpen(false);
    setDocumentReservation(null);
    setDocuments([]);
    setDocumentsError("");
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400"
          >
            <Plus size={18} />
            Create reservation
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0D12]/90 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search customer, contact, scooter, notes..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.045] py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-orange-400/40"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-[#111318] px-4 py-3 text-sm font-bold text-white outline-none"
            >
              <option value="all">
                All payments
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="partial">
                Partial
              </option>

              <option value="unpaid">
                Unpaid
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                loadReservations()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/65 transition hover:bg-white/[0.09] hover:text-white"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {loadError ? (
            <div className="m-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
              {loadError}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1700px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.025] text-left">
                  {[
                    "Pickup",
                    "Return",
                    "Customer",
                    "Contact",
                    "Vehicle",
                    "Payment",
                    "Paid / Total",
                    "Remaining",
                    "Notes",
                    "Source",
                    "Actions",
                  ].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {loading &&
                reservations.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center"
                    >
                      <Loader2
                        size={28}
                        className="mx-auto animate-spin text-orange-300"
                      />

                      <p className="mt-3 text-sm font-bold text-white/45">
                        Loading
                        reservations...
                      </p>
                    </td>
                  </tr>
                ) : filteredReservations
                    .length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-16 text-center"
                    >
                      <CalendarDays
                        size={32}
                        className="mx-auto text-white/20"
                      />

                      <p className="mt-3 text-sm font-bold text-white/45">
                        No future
                        reservations found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map(
                    (reservation) => (
                      <ReservationRow
                        key={
                          reservation.id
                        }
                        reservation={
                          reservation
                        }
                        onEdit={() =>
                          openEditForm(
                            reservation
                          )
                        }
                        onDocuments={() =>
                          openDocuments(
                            reservation
                          )
                        }
                      />
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showForm ? (
        <ReservationFormModal
          mode={formMode}
          form={form}
          reservation={
            editingReservation
          }
          availability={
            availability
          }
          availabilityError={
            availabilityError
          }
          checkingAvailability={
            checkingAvailability
          }
          saving={saving}
          formError={formError}
          success={success}
          onClose={closeForm}
          onChange={updateForm}
          onToggleVehicle={
            toggleVehicle
          }
          onSave={saveReservation}
        />
      ) : null}

      {documentsOpen ? (
        <DocumentsModal
          reservation={
            documentReservation
          }
          documents={documents}
          loading={
            documentsLoading
          }
          error={documentsError}
          onClose={closeDocuments}
        />
      ) : null}
    </AdminShell>
  );
}

function ReservationRow({
  reservation,
  onEdit,
  onDocuments,
}: {
  reservation: Reservation;
  onEdit: () => void;
  onDocuments: () => void;
}) {
  const assignedCodes =
    getAssignedCodes(
      reservation
    );

  const website =
    isWebsiteReservation(
      reservation
    );

  return (
    <tr className="border-b border-white/[0.07] transition hover:bg-white/[0.025]">
      <td className="px-4 py-4">
        <p className="text-sm font-black text-white">
          {formatDate(
            reservation.pickupDate
          )}
        </p>

        <p className="mt-1 text-xs font-bold text-orange-300">
          {reservation.pickupTime ||
            "--:--"}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-black text-white">
          {formatDate(
            reservation.dropoffDate
          )}
        </p>

        <p className="mt-1 text-xs font-bold text-white/45">
          {reservation.dropoffTime ||
            "--:--"}
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-black text-white">
          {reservation.customerName}
        </p>

        <p className="mt-1 text-xs font-bold text-white/35">
          {
            reservation.contractNumber
          }
        </p>
      </td>

      <td className="px-4 py-4">
        <p className="text-xs font-bold text-white/60">
          {reservation.phone || "-"}
        </p>

        <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-white/35">
          {reservation.customerEmail ||
            "-"}
        </p>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-white/[0.06] px-2 text-sm font-black text-white">
            {assignedCodes.length > 0
              ? assignedCodes.join(", ")
              : "—"}
          </span>

          <div>
            <p className="max-w-[240px] text-sm font-black text-white">
              {reservation.vehicleName}
            </p>

            <p className="mt-1 text-xs font-bold text-white/35">
              Quantity:{" "}
              {reservation.quantity}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span
          className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${paymentStatusClasses(
            reservation.paymentStatus
          )}`}
        >
          {reservation.paymentStatus}
        </span>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-black text-white">
          {euroText(
            reservation.amountPaid
          )}
        </p>

        <p className="mt-1 text-xs font-bold text-white/35">
          of{" "}
          {euroText(
            reservation.totalAmount
          )}
        </p>
      </td>

      <td className="px-4 py-4">
        <p
          className={`text-sm font-black ${
            reservation.remainingAmount >
            0
              ? "text-amber-300"
              : "text-emerald-300"
          }`}
        >
          {euroText(
            reservation.remainingAmount
          )}
        </p>
      </td>

      <td className="max-w-[260px] px-4 py-4">
        <p className="line-clamp-3 text-xs font-semibold leading-5 text-white/50">
          {reservation.notes ||
            "No notes"}
        </p>
      </td>

      <td className="px-4 py-4">
        <span
          className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${sourceClasses(
            reservation.source
          )}`}
        >
          {website
            ? "Website"
            : "Manual"}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex min-w-[190px] flex-col gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3 py-2.5 text-xs font-black text-orange-300 transition hover:bg-orange-500/15"
          >
            <Pencil size={15} />
            Edit
          </button>

          {website ? (
            <button
              type="button"
              onClick={onDocuments}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2.5 text-xs font-black text-sky-300 transition hover:bg-sky-500/15"
            >
              <FileText size={15} />
              View documents
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function ReservationFormModal({
  mode,
  form,
  reservation,
  availability,
  availabilityError,
  checkingAvailability,
  saving,
  formError,
  success,
  onClose,
  onChange,
  onToggleVehicle,
  onSave,
}: {
  mode: FormMode;
  form: ReservationForm;
  reservation: Reservation | null;
  availability: AvailabilityResponse | null;
  availabilityError: string;
  checkingAvailability: boolean;
  saving: boolean;
  formError: string;
  success: string;
  onClose: () => void;
  onChange: (
    field: keyof ReservationForm,
    value: string | number | string[]
  ) => void;
  onToggleVehicle: (
    vehicleCode: string
  ) => void;
  onSave: () => void;
}) {
  const originalCodes =
    reservation
      ? getAssignedCodes(
          reservation
        )
      : [];

  const maximumAssignments =
    mode === "create"
      ? 1
      : Math.max(
          1,
          form.quantity
        );

  const isWebsite =
    reservation
      ? isWebsiteReservation(
          reservation
        )
      : false;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D12] shadow-[0_40px_140px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
              {mode === "edit"
                ? "Full reservation control"
                : "Protected manual reservation"}
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              {mode === "edit"
                ? "Edit reservation"
                : "New reservation"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 hover:bg-white/[0.09] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {formError ? (
            <MessageBox
              tone="error"
              message={formError}
            />
          ) : null}

          {success ? (
            <MessageBox
              tone="success"
              message={success}
            />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Reservation number"
              icon={
                <CalendarDays
                  size={16}
                />
              }
            >
              <input
                value={
                  form.contractNumber
                }
                onChange={(event) =>
                  onChange(
                    "contractNumber",
                    event.target.value
                  )
                }
                disabled={
                  mode === "edit"
                }
                className={`${inputClasses} disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </Field>

            <Field
              label="Customer name"
              icon={
                <UserRound
                  size={16}
                />
              }
            >
              <input
                value={
                  form.customerName
                }
                onChange={(event) =>
                  onChange(
                    "customerName",
                    event.target.value
                  )
                }
                placeholder="Customer full name"
                className={
                  inputClasses
                }
              />
            </Field>

            <Field
              label="Email"
              icon={
                <Mail size={16} />
              }
            >
              <input
                type="email"
                value={
                  form.customerEmail
                }
                onChange={(event) =>
                  onChange(
                    "customerEmail",
                    event.target.value
                  )
                }
                placeholder="customer@email.com"
                className={
                  inputClasses
                }
              />
            </Field>

            <Field
              label="Phone"
              icon={
                <Phone size={16} />
              }
            >
              <input
                value={form.phone}
                onChange={(event) =>
                  onChange(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+34..."
                className={
                  inputClasses
                }
              />
            </Field>
          </div>

          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/40">
              Pickup and return
            </p>

            <div className="grid gap-4 md:grid-cols-4">
              <Field
                label="Pickup date"
                icon={
                  <CalendarDays
                    size={16}
                  />
                }
              >
                <input
                  type="date"
                  value={
                    form.pickupDate
                  }
                  onChange={(event) =>
                    onChange(
                      "pickupDate",
                      event.target.value
                    )
                  }
                  className={
                    inputClasses
                  }
                />
              </Field>

              <Field
                label="Pickup time"
                icon={
  <Clock3 size={16} />
}
              >
                <input
                  type="time"
                  value={
                    form.pickupTime
                  }
                  onChange={(event) =>
                    onChange(
                      "pickupTime",
                      event.target.value
                    )
                  }
                  className={
                    inputClasses
                  }
                />
              </Field>

              <Field
                label="Return date"
                icon={
                  <CalendarDays
                    size={16}
                  />
                }
              >
                <input
                  type="date"
                  value={
                    form.dropoffDate
                  }
                  onChange={(event) =>
                    onChange(
                      "dropoffDate",
                      event.target.value
                    )
                  }
                  className={
                    inputClasses
                  }
                />
              </Field>

              <Field
                label="Return time"
                icon={
                  <Clock3 size={16} />
                }
              >
                <input
                  type="time"
                  value={
                    form.dropoffTime
                  }
                  onChange={(event) =>
                    onChange(
                      "dropoffTime",
                      event.target.value
                    )
                  }
                  className={
                    inputClasses
                  }
                />
              </Field>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-white/40">
              Vehicle category
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              {FLEET_OPTIONS.map(
                (option) => {
                  const selected =
                    form.fleetGroup ===
                    option.value;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      onClick={() =>
                        onChange(
                          "fleetGroup",
                          option.value
                        )
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-orange-400/50 bg-orange-500/12"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]"
                      }`}
                    >
                      <p className="text-sm font-black text-white">
                        {option.label}
                      </p>

                      <p className="mt-1 text-xs font-bold text-white/35">
                        {
                          option.description
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {mode === "edit" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Scooter quantity"
                icon={
                  <Bike size={16} />
                }
              >
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={
                    form.quantity
                  }
                  disabled={
                    !isWebsite
                  }
                  onChange={(event) =>
                    onChange(
                      "quantity",
                      Math.max(
                        1,
                        Number(
                          event.target
                            .value || 1
                        )
                      )
                    )
                  }
                  className={`${inputClasses} disabled:cursor-not-allowed disabled:opacity-50`}
                />
              </Field>

              <Field
                label="Reservation status"
                icon={
                  <CheckCircle2
                    size={16}
                  />
                }
              >
                <select
                  value={form.status}
                  onChange={(event) =>
                    onChange(
                      "status",
                      event.target.value
                    )
                  }
                  className={
                    inputClasses
                  }
                >
                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="reserved">
                    Reserved
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="returned">
                    Returned
                  </option>
                </select>
              </Field>
            </div>
          ) : null}

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                  Exact scooter
                  availability
                </p>

                <p className="mt-1 text-xs font-bold text-white/30">
                  Assigned{" "}
                  {
                    form
                      .assignedVehicleCodes
                      .length
                  }
                  /{maximumAssignments}
                </p>
              </div>

              {checkingAvailability ? (
                <span className="inline-flex items-center gap-2 text-xs font-bold text-orange-300">
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />

                  Checking live
                  availability
                </span>
              ) : null}
            </div>

            {availabilityError ? (
              <MessageBox
                tone="error"
                message={
                  availabilityError
                }
              />
            ) : availability ? (
              <>
                <div className="mb-4 grid gap-3 sm:grid-cols-4">
                  <SmallMetric
                    label="Available"
                    value={
                      availability.availableCount
                    }
                  />

                  <SmallMetric
                    label="Fleet"
                    value={
                      availability.totalFleet
                    }
                  />

                  <SmallMetric
                    label="Booked"
                    value={
                      availability.bookedQuantity
                    }
                  />

                  <SmallMetric
                    label="Checkout holds"
                    value={
                      availability.heldQuantity
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {availability.vehicles.map(
                    (
                      availableVehicle
                    ) => {
                      const code =
                        normalizeVehicleCode(
                          availableVehicle.vehicleCode
                        );

                      const selected =
                        form.assignedVehicleCodes.includes(
                          code
                        );

                      /*
                       * When editing, the availability
                       * RPC may still count the current
                       * reservation. Its existing scooter
                       * remains selectable. The protected
                       * PATCH function performs the final
                       * conflict check while excluding the
                       * current reservation.
                       */
                      const existingAssignment =
                        originalCodes.includes(
                          code
                        );

                      const selectable =
                        availableVehicle.exactAvailable ||
                        existingAssignment ||
                        selected;

                      const maximumReached =
                        !selected &&
                        form
                          .assignedVehicleCodes
                          .length >=
                          maximumAssignments;

                      const disabled =
                        !selectable ||
                        maximumReached;

                      return (
                        <button
                          key={code}
                          type="button"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            onToggleVehicle(
                              code
                            )
                          }
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-emerald-400/60 bg-emerald-500/15"
                              : selectable &&
                                !maximumReached
                              ? "border-emerald-400/20 bg-emerald-500/[0.07] hover:bg-emerald-500/12"
                              : "cursor-not-allowed border-red-400/15 bg-red-500/[0.06] opacity-55"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-2xl font-black text-white">
                                {code}
                              </p>

                              <p className="mt-1 text-xs font-bold text-white/45">
                                {availableVehicle
                                  .vehicle
                                  ?.matricula ||
                                  "-"}
                              </p>
                            </div>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${
                                selected
                                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                                  : selectable
                                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                                  : "border-red-400/25 bg-red-500/10 text-red-300"
                              }`}
                            >
                              {selected
                                ? "Selected"
                                : selectable
                                ? "Available"
                                : "Booked"}
                            </span>
                          </div>

                          <p className="mt-3 text-xs font-bold text-white/45">
                            {availableVehicle.vehicle
                              ? `${availableVehicle.vehicle.marca} ${availableVehicle.vehicle.modelo}`
                              : availableVehicle.publicVehicleName}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>

                <p className="mt-3 text-xs font-bold text-white/35">
                  The final save is
                  checked atomically in
                  Supabase and includes
                  active checkout holds
                  plus the 60-minute
                  preparation margin.
                </p>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm font-bold text-white/40">
                Select the pickup and
                return date/time to see
                available scooters
                automatically.
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Total amount"
              icon={<Euro size={16} />}
            >
              <input
                inputMode="decimal"
                value={
                  form.totalAmount
                }
                onChange={(event) =>
                  onChange(
                    "totalAmount",
                    event.target.value
                  )
                }
                placeholder="0.00"
                className={
                  inputClasses
                }
              />
            </Field>

            <Field
              label="Amount paid"
              icon={<Euro size={16} />}
            >
              <input
                inputMode="decimal"
                value={form.amountPaid}
                onChange={(event) =>
                  onChange(
                    "amountPaid",
                    event.target.value
                  )
                }
                placeholder="0.00"
                className={
                  inputClasses
                }
              />
            </Field>

            <Field
              label="Payment method"
              icon={<Euro size={16} />}
            >
              <select
                value={
                  form.paymentMethod
                }
                onChange={(event) =>
                  onChange(
                    "paymentMethod",
                    event.target.value
                  )
                }
                className={
                  inputClasses
                }
              >
                <option value="unpaid">
                  Unpaid
                </option>

                <option value="cash">
                  Cash
                </option>

                <option value="card">
                  Card
                </option>

                <option value="stripe">
                  Stripe
                </option>

                <option value="bank_transfer">
                  Bank transfer
                </option>
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <PaymentMetric
              label="Paid"
              value={euroText(
                euroInputToCents(
                  form.amountPaid
                )
              )}
              tone="emerald"
            />

            <PaymentMetric
              label="Remaining"
              value={euroText(
                Math.max(
                  euroInputToCents(
                    form.totalAmount
                  ) -
                    euroInputToCents(
                      form.amountPaid
                    ),
                  0
                )
              )}
              tone="amber"
            />

            <PaymentMetric
              label="Status"
              value={getPaymentStatus(
                form.totalAmount,
                form.amountPaid
              )}
              tone={
                getPaymentStatus(
                  form.totalAmount,
                  form.amountPaid
                ) === "paid"
                  ? "emerald"
                  : getPaymentStatus(
                      form.totalAmount,
                      form.amountPaid
                    ) === "partial"
                  ? "amber"
                  : "red"
              }
            />
          </div>

          <Field
            label="Notes"
            icon={
              <StickyNote
                size={16}
              />
            }
          >
            <textarea
              value={form.notes}
              onChange={(event) =>
                onChange(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Add reservation notes..."
              rows={4}
              className={inputClasses}
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white/65 hover:bg-white/[0.09] hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={
              saving ||
              checkingAvailability
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {saving ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2
                size={18}
              />
            )}

            {saving
              ? "Checking and saving..."
              : mode === "edit"
              ? "Save all changes"
              : "Create reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentsModal({
  reservation,
  documents,
  loading,
  error,
  onClose,
}: {
  reservation: Reservation | null;
  documents: ReservationDocument[];
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0D12] shadow-[0_40px_140px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
              Secure booking
              documents
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              {reservation
                ?.customerName ||
                "Customer documents"}
            </h2>

            <p className="mt-1 text-xs font-bold text-white/35">
              {reservation
                ?.contractNumber || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 hover:bg-white/[0.09] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-sky-300"
              />

              <p className="mt-3 text-sm font-bold text-white/45">
                Creating secure
                document links...
              </p>
            </div>
          ) : error ? (
            <MessageBox
              tone="error"
              message={error}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {documents.map(
                (document) => (
                  <div
                    key={document.key}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
                  >
                    <div className="flex min-h-[320px] items-center justify-center bg-black/30 p-3">
                      <img
                        src={
                          document.url
                        }
                        alt={
                          document.label
                        }
                        className="max-h-[440px] w-full rounded-xl object-contain"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-sm font-black text-white">
                        {
                          document.label
                        }
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-white/35">
                        {
                          document.name
                        }
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <a
                          href={
                            document.url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2.5 text-xs font-black text-sky-300"
                        >
                          <FileText
                            size={15}
                          />
                          Open
                        </a>

                        <a
                          href={
                            document.downloadUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-xs font-black text-emerald-300"
                        >
                          <Download
                            size={15}
                          />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
            <div className="flex gap-3 text-amber-300">
              <AlertTriangle
                size={18}
                className="shrink-0"
              />

              <p className="text-xs font-bold leading-5">
                These are private
                identity documents.
                Secure links expire
                automatically and must
                not be shared outside
                Nexa Rentals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black text-white/45">
        {icon}
        {label}
      </span>

      {children}
    </label>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function PaymentMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone:
    | "emerald"
    | "amber"
    | "red";
}) {
  const classes =
    tone === "emerald"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : tone === "amber"
      ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
      : "border-red-400/20 bg-red-500/10 text-red-300";

  return (
    <div
      className={`rounded-2xl border p-4 ${classes}`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.16em] opacity-70">
        {label}
      </p>

      <p className="mt-1 text-lg font-black uppercase">
        {value}
      </p>
    </div>
  );
}

function MessageBox({
  tone,
  message,
}: {
  tone:
    | "error"
    | "success";
  message: string;
}) {
  const successful =
    tone === "success";

  return (
    <div
      className={`flex gap-3 rounded-2xl border p-4 ${
        successful
          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
          : "border-red-400/25 bg-red-500/10 text-red-300"
      }`}
    >
      {successful ? (
        <CheckCircle2
          size={19}
          className="shrink-0"
        />
      ) : (
        <AlertTriangle
          size={19}
          className="shrink-0"
        />
      )}

      <p className="text-sm font-bold">
        {message}
      </p>
    </div>
  );
}