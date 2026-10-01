"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminShell from "../../components/dashboard/AdminShell";

type MaintenanceRecord = {
  id?: string;
  vehicle_code?: string;
  maintenance_type?: string;
  performed_km?: number;
  performed_at?: string;
  next_due_km?: number | null;
  notes?: string | null;
  cost?: number | null;
  performed_by?: string | null;
};

type FleetState = {
  vehicle_code: string;
  current_km: number;
  road_ready: boolean;
  public_health_status: string;
  internal_status: string;
  last_inspection_at?: string | null;
  last_service_at?: string | null;
};

type FleetVehicle = {
  codigo: string;
  matricula: string;
  marca: string;
  modelo: string;
  imageUrl?: string;
  fleetGroup: string;
  ano?: string;
  bastidor?: string;
};

type FleetSnapshot = {
  vehicle: FleetVehicle;

  state: FleetState;

  latestMaintenance: Record<
    string,
    MaintenanceRecord | null | undefined
  >;

  latestInspection?: {
    id?: string;
    vehicle_code?: string;
    odometer_km?: number;
    result?: string;
    inspected_at?: string;
    public_summary?: string;
    internal_notes?: string | null;
  } | null;

  openIssues?: Array<{
    id: string;
    vehicle_code: string;
    category: string;
    severity: string;
    description: string;
    status: string;
    opened_at: string;
  }>;

  rules?: Array<{
    maintenance_type: string;
    interval_km: number | null;
    warning_km_before: number | null;
    grace_km: number | null;
  }>;
};

type InspectionStatus =
  | "pass"
  | "attention"
  | "fail"
  | "not_checked";

type InspectionItemForm = {
  itemKey: string;
  itemLabel: string;
  status: InspectionStatus;
  valueNumber?: string;
  unit?: string;
  internalNote?: string;
};

type QrScan = {
  id: string;
  vehicle_code: string;
  viewer_type: "public" | "staff";
  session_id?: string | null;
  scanned_at: string;
};

type HistoryTimelineItem = {
  id: string;
  type:
    | "maintenance"
    | "inspection"
    | "issue"
    | "activity";

  title: string;
  date: string;
  km?: number | null;
  details?: string | null;
  raw?: any;
};

type HistoryData = {
  vehicle: FleetVehicle;
  state: FleetState | null;
  timeline: HistoryTimelineItem[];
  maintenance: any[];
  inspections: any[];
  issues: any[];
  activity: any[];
};

const serviceTypes = [
  {
    value: "engine_oil",
    label: "Engine Oil",
  },
  {
    value: "oil_filter",
    label: "Oil Filter",
  },
  {
    value: "air_filter",
    label: "Air Filter",
  },
  {
    value: "injector_cleaner",
    label: "Injector Cleaner",
  },
  {
    value: "cvt_belt",
    label: "CVT Belt",
  },
  {
    value: "variator_weights",
    label: "Variator Weights",
  },
  {
    value: "spark_plug",
    label: "Spark Plug",
  },
  {
    value: "brake_service",
    label: "Brake Service",
  },
  {
    value: "tire_replacement",
    label: "Tire Replacement",
  },
  {
    value: "battery",
    label: "Battery",
  },
  {
    value: "general_service",
    label: "General Service",
  },
  {
    value: "other",
    label: "Other",
  },
];

const inspectionDefaults: InspectionItemForm[] = [
  {
    itemKey: "front_brake",
    itemLabel: "Front Brake",
    status: "pass",
  },
  {
    itemKey: "rear_brake",
    itemLabel: "Rear Brake",
    status: "pass",
  },
  {
    itemKey: "brake_pads",
    itemLabel: "Brake Pads / Shoes",
    status: "pass",
  },
  {
    itemKey: "front_tire",
    itemLabel: "Front Tyre Condition",
    status: "pass",
  },
  {
    itemKey: "rear_tire",
    itemLabel: "Rear Tyre Condition",
    status: "pass",
  },
  {
    itemKey: "front_tire_pressure",
    itemLabel: "Front Tyre Pressure",
    status: "pass",
    valueNumber: "",
    unit: "bar",
  },
  {
    itemKey: "rear_tire_pressure",
    itemLabel: "Rear Tyre Pressure",
    status: "pass",
    valueNumber: "",
    unit: "bar",
  },
  {
    itemKey: "headlight",
    itemLabel: "Headlight",
    status: "pass",
  },
  {
    itemKey: "high_beam",
    itemLabel: "High Beam",
    status: "pass",
  },
  {
    itemKey: "brake_light",
    itemLabel: "Brake Light",
    status: "pass",
  },
  {
    itemKey: "indicators",
    itemLabel: "Indicators",
    status: "pass",
  },
  {
    itemKey: "horn",
    itemLabel: "Horn",
    status: "pass",
  },
  {
    itemKey: "mirrors",
    itemLabel: "Mirrors",
    status: "pass",
  },
  {
    itemKey: "steering",
    itemLabel: "Steering",
    status: "pass",
  },
  {
    itemKey: "front_suspension",
    itemLabel: "Front Suspension",
    status: "pass",
  },
  {
    itemKey: "rear_suspension",
    itemLabel: "Rear Suspension",
    status: "pass",
  },
  {
    itemKey: "stand",
    itemLabel: "Side / Centre Stand",
    status: "pass",
  },
  {
    itemKey: "oil_level",
    itemLabel: "Oil Level",
    status: "pass",
  },
  {
    itemKey: "visible_leaks",
    itemLabel: "Visible Leaks",
    status: "pass",
  },
  {
    itemKey: "registration_plate",
    itemLabel: "Registration Plate",
    status: "pass",
  },
  {
    itemKey: "body_condition",
    itemLabel: "Body / General Condition",
    status: "pass",
  },
  {
    itemKey: "unusual_noise",
    itemLabel: "Unusual Noise / Vibration",
    status: "pass",
  },
];

function displayDate(
  value?: string | null,
  withTime = true
) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function serviceLabel(type?: string | null) {
  if (!type) {
    return "Maintenance";
  }

  return (
    serviceTypes.find(
      (item) => item.value === type
    )?.label ||
    type.replaceAll("_", " ")
  );
}

function statusText(status?: string) {
  if (status === "service_approaching") {
    return "Service approaching";
  }

  if (status === "service_due") {
    return "Service due";
  }

  if (status === "service_reminder") {
    return "Service reminder";
  }

  if (status === "inspection_due") {
    return "Inspection due";
  }

  if (status === "attention_required") {
    return "Attention required";
  }

  if (status === "do_not_rent") {
    return "Do not rent";
  }

  return "Healthy";
}

function statusClass(status?: string) {
  if (status === "do_not_rent") {
    return "border-red-400/30 bg-red-500/10 text-red-300";
  }

  if (status === "attention_required") {
    return "border-orange-400/30 bg-orange-500/10 text-orange-300";
  }

  if (
    status === "service_due" ||
    status === "service_reminder" ||
    status === "inspection_due"
  ) {
    return "border-yellow-400/30 bg-yellow-500/10 text-yellow-300";
  }

  if (status === "service_approaching") {
    return "border-sky-400/30 bg-sky-500/10 text-sky-300";
  }

  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
}

function inspectionStatusClass(
  status: InspectionStatus
) {
  if (status === "fail") {
    return "border-red-400/30 bg-red-500/10 text-red-300";
  }

  if (status === "attention") {
    return "border-yellow-400/30 bg-yellow-500/10 text-yellow-300";
  }

  if (status === "not_checked") {
    return "border-white/10 bg-white/[0.04] text-white/35";
  }

  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-300";
}

function timelineTypeLabel(
  type: HistoryTimelineItem["type"]
) {
  if (type === "maintenance") {
    return "Service";
  }

  if (type === "inspection") {
    return "Inspection";
  }

  if (type === "issue") {
    return "Issue";
  }

  return "Activity";
}

function timelineTypeClass(
  type: HistoryTimelineItem["type"]
) {
  if (type === "maintenance") {
    return "border-orange-400/20 bg-orange-500/10 text-orange-300";
  }

  if (type === "inspection") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (type === "issue") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  return "border-sky-400/20 bg-sky-500/10 text-sky-300";
}

function makeInspectionDefaults() {
  return inspectionDefaults.map(
    (item) => ({
      ...item,
    })
  );
}

export default function MaintenancePage() {
  const [fleet, setFleet] = useState<
    FleetSnapshot[]
  >([]);

  const [
    selectedCode,
    setSelectedCode,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    currentKmInput,
    setCurrentKmInput,
  ] = useState("");

  const [
    serviceType,
    setServiceType,
  ] = useState("engine_oil");

  const [
    serviceKm,
    setServiceKm,
  ] = useState("");

  const [
    serviceNotes,
    setServiceNotes,
  ] = useState("");

  const [
    serviceCost,
    setServiceCost,
  ] = useState("");

  const [
    inspectionKm,
    setInspectionKm,
  ] = useState("");

  const [
    inspectionNotes,
    setInspectionNotes,
  ] = useState("");

  const [
    inspectionItems,
    setInspectionItems,
  ] = useState<
    InspectionItemForm[]
  >(
    makeInspectionDefaults()
  );

  const [
    savingKm,
    setSavingKm,
  ] = useState(false);

  const [
    savingService,
    setSavingService,
  ] = useState(false);

  const [
    savingInspection,
    setSavingInspection,
  ] = useState(false);

  const [
    savingRoadReady,
    setSavingRoadReady,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    qrOpen,
    setQrOpen,
  ] = useState(false);

  const [
    historyOpen,
    setHistoryOpen,
  ] = useState(false);

  const [
    qrScans,
    setQrScans,
  ] = useState<QrScan[]>([]);

  const [
    qrLoading,
    setQrLoading,
  ] = useState(false);

  const [
    history,
    setHistory,
  ] =
    useState<HistoryData | null>(
      null
    );

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);

  const selected =
    useMemo(() => {
      return (
        fleet.find(
          (snapshot) =>
            snapshot.vehicle
              .codigo ===
            selectedCode
        ) ||
        fleet[0] ||
        null
      );
    }, [
      fleet,
      selectedCode,
    ]);

  const summary =
    useMemo(() => {
      return {
        total: fleet.length,

        healthy:
          fleet.filter(
            (item) =>
              item.state
                ?.internal_status ===
              "healthy"
          ).length,

        service:
          fleet.filter(
            (item) =>
              [
                "service_approaching",
                "service_due",
                "service_reminder",
              ].includes(
                item.state
                  ?.internal_status
              )
          ).length,

        attention:
          fleet.filter(
            (item) =>
              [
                "inspection_due",
                "attention_required",
                "do_not_rent",
              ].includes(
                item.state
                  ?.internal_status
              )
          ).length,
      };
    }, [fleet]);

  const latestServices =
    useMemo(() => {
      if (!selected) {
        return [];
      }

      return Object.entries(
        selected.latestMaintenance ||
          {}
      )
        .filter(
          ([, value]) =>
            Boolean(value)
        )
        .map(
          ([type, value]) => ({
            type,
            record:
              value as MaintenanceRecord,
          })
        );
    }, [selected]);

  const qrStats =
    useMemo(() => {
      const now = new Date();

      const startToday =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).getTime();

      const last7 =
        now.getTime() -
        7 *
          24 *
          60 *
          60 *
          1000;

      const last30 =
        now.getTime() -
        30 *
          24 *
          60 *
          60 *
          1000;

      const publicScans =
        qrScans.filter(
          (scan) =>
            scan.viewer_type ===
            "public"
        );

      const today =
        publicScans.filter(
          (scan) =>
            new Date(
              scan.scanned_at
            ).getTime() >=
            startToday
        ).length;

      const week =
        publicScans.filter(
          (scan) =>
            new Date(
              scan.scanned_at
            ).getTime() >=
            last7
        ).length;

      const month =
        publicScans.filter(
          (scan) =>
            new Date(
              scan.scanned_at
            ).getTime() >=
            last30
        ).length;

      const counts =
        new Map<
          string,
          number
        >();

      for (const scan of publicScans) {
        counts.set(
          scan.vehicle_code,
          (counts.get(
            scan.vehicle_code
          ) || 0) + 1
        );
      }

      let mostScanned =
        "None yet";

      let mostCount = 0;

      for (
        const [code, count]
        of counts.entries()
      ) {
        if (
          count > mostCount
        ) {
          mostScanned =
            code;

          mostCount =
            count;
        }
      }

      return {
        today,
        week,
        month,
        mostScanned,
        mostCount,
      };
    }, [qrScans]);

  const loadFleet =
    useCallback(
      async (
        keepSelected = true
      ) => {
        try {
          setLoading(true);
          setErrorMessage("");

          const response =
            await fetch(
              "/api/fleet/maintenance",
              {
                cache:
                  "no-store",
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.ok
          ) {
            throw new Error(
              result.error ||
                "Failed to load fleet maintenance."
            );
          }

          const nextFleet:
            FleetSnapshot[] =
            result.data || [];

          setFleet(nextFleet);

          if (
            !keepSelected ||
            !selectedCode
          ) {
            setSelectedCode(
              nextFleet[0]
                ?.vehicle
                ?.codigo || ""
            );
          } else {
            const exists =
              nextFleet.some(
                (item) =>
                  item.vehicle
                    .codigo ===
                  selectedCode
              );

            if (!exists) {
              setSelectedCode(
                nextFleet[0]
                  ?.vehicle
                  ?.codigo || ""
              );
            }
          }
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load fleet."
          );
        } finally {
          setLoading(false);
        }
      },
      [selectedCode]
    );

  const loadQrActivity =
    useCallback(
      async () => {
        try {
          setQrLoading(true);

          const response =
            await fetch(
              "/api/fleet/qr-activity",
              {
                cache:
                  "no-store",
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.ok
          ) {
            throw new Error(
              result.error ||
                "Failed to load QR activity."
            );
          }

          setQrScans(
            result.data || []
          );
        } catch (error) {
          console.error(error);
        } finally {
          setQrLoading(false);
        }
      },
      []
    );

  const loadHistory =
    useCallback(
      async (
        vehicleCode: string
      ) => {
        if (!vehicleCode) {
          return;
        }

        try {
          setHistoryLoading(
            true
          );

          const response =
            await fetch(
              `/api/fleet/history/${encodeURIComponent(
                vehicleCode
              )}`,
              {
                cache:
                  "no-store",
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.ok
          ) {
            throw new Error(
              result.error ||
                "Failed to load vehicle history."
            );
          }

          setHistory(
            result.data
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Failed to load history."
          );
        } finally {
          setHistoryLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    loadFleet(false);
    loadQrActivity();
  }, []);

  useEffect(() => {
    if (!selected) {
      return;
    }

    const km = String(
      selected.state
        ?.current_km || ""
    );

    setCurrentKmInput(km);
    setServiceKm(km);
    setInspectionKm(km);

    setHistory(null);
    setHistoryOpen(false);
  }, [
    selected?.vehicle.codigo,
  ]);

  async function refreshAll() {
    await Promise.all([
      loadFleet(),
      loadQrActivity(),
    ]);

    if (
      selected?.vehicle.codigo &&
      historyOpen
    ) {
      await loadHistory(
        selected.vehicle.codigo
      );
    }
  }

  async function updateCurrentKm() {
    if (!selected) {
      return;
    }

    const km =
      Number(
        currentKmInput
      );

    if (
      !Number.isFinite(km) ||
      km < 0
    ) {
      setErrorMessage(
        "Enter a valid current mileage."
      );

      return;
    }

    try {
      setSavingKm(true);
      setMessage("");
      setErrorMessage("");

      const response =
        await fetch(
          "/api/fleet/maintenance",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                vehicleCode:
                  selected.vehicle
                    .codigo,
                currentKm:
                  Math.round(km),
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "Failed to update mileage."
        );
      }

      setMessage(
        `${selected.vehicle.codigo} mileage updated to ${Math.round(
          km
        )} km.`
      );

      await refreshAll();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update mileage."
      );
    } finally {
      setSavingKm(false);
    }
  }

  async function toggleRoadReady() {
    if (!selected) {
      return;
    }

    const nextValue =
      !selected.state
        .road_ready;

    try {
      setSavingRoadReady(
        true
      );

      setMessage("");
      setErrorMessage("");

      const response =
        await fetch(
          "/api/fleet/maintenance",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                vehicleCode:
                  selected.vehicle
                    .codigo,
                roadReady:
                  nextValue,
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "Failed to update road-ready status."
        );
      }

      setMessage(
        nextValue
          ? `${selected.vehicle.codigo} is now Road Ready.`
          : `${selected.vehicle.codigo} is now marked Do Not Rent.`
      );

      await refreshAll();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update status."
      );
    } finally {
      setSavingRoadReady(
        false
      );
    }
  }

  async function saveService() {
    if (!selected) {
      return;
    }

    const km =
      Number(serviceKm);

    if (
      !Number.isFinite(km) ||
      km < 0
    ) {
      setErrorMessage(
        "Enter the mileage where the service was performed."
      );

      return;
    }

    try {
      setSavingService(
        true
      );

      setMessage("");
      setErrorMessage("");

      const response =
        await fetch(
          "/api/fleet/maintenance",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                vehicleCode:
                  selected.vehicle
                    .codigo,

                maintenanceType:
                  serviceType,

                performedKm:
                  Math.round(km),

                notes:
                  serviceNotes.trim() ||
                  null,

                cost:
                  serviceCost
                    ? Number(
                        serviceCost
                      )
                    : null,

                performedBy:
                  "NEXA Staff",
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "Failed to save service."
        );
      }

      setServiceNotes("");
      setServiceCost("");

      setMessage(
        `${serviceLabel(
          serviceType
        )} recorded for ${selected.vehicle.codigo}.`
      );

      await refreshAll();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save service."
      );
    } finally {
      setSavingService(
        false
      );
    }
  }

  function updateInspectionItem(
    index: number,
    updates: Partial<InspectionItemForm>
  ) {
    setInspectionItems(
      (current) =>
        current.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  ...updates,
                }
              : item
        )
    );
  }

  function resetInspection() {
    setInspectionItems(
      makeInspectionDefaults()
    );

    setInspectionNotes("");

    if (selected) {
      setInspectionKm(
        String(
          selected.state
            ?.current_km || ""
        )
      );
    }
  }

  async function saveInspection() {
    if (!selected) {
      return;
    }

    const km =
      Number(
        inspectionKm
      );

    if (
      !Number.isFinite(km) ||
      km < 0
    ) {
      setErrorMessage(
        "Enter the odometer reading for the inspection."
      );

      return;
    }

    try {
      setSavingInspection(
        true
      );

      setMessage("");
      setErrorMessage("");

      const response =
        await fetch(
          "/api/fleet/inspection",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                vehicleCode:
                  selected.vehicle
                    .codigo,

                inspectionType:
                  "technical",

                odometerKm:
                  Math.round(km),

                publicSummary:
                  "Routine safety inspection completed by NEXA Rentals.",

                internalNotes:
                  inspectionNotes.trim() ||
                  null,

                inspectedBy:
                  "NEXA Staff",

                items:
                  inspectionItems.map(
                    (item) => ({
                      itemKey:
                        item.itemKey,

                      itemLabel:
                        item.itemLabel,

                      status:
                        item.status,

                      valueNumber:
                        item.valueNumber
                          ? Number(
                              item.valueNumber
                            )
                          : null,

                      unit:
                        item.unit ||
                        null,

                      internalNote:
                        item.internalNote ||
                        null,
                    })
                  ),
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.ok
      ) {
        throw new Error(
          result.error ||
            "Failed to save inspection."
        );
      }

      setMessage(
        `Technical inspection completed for ${selected.vehicle.codigo}.`
      );

      resetInspection();

      await refreshAll();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save inspection."
      );
    } finally {
      setSavingInspection(
        false
      );
    }
  }

  async function toggleHistory() {
    if (!selected) {
      return;
    }

    const next =
      !historyOpen;

    setHistoryOpen(next);

    if (
      next &&
      !history
    ) {
      await loadHistory(
        selected.vehicle.codigo
      );
    }
  }

  function downloadPdf() {
    if (!selected) {
      return;
    }

    window.location.href =
      `/api/fleet/history/${encodeURIComponent(
        selected.vehicle.codigo
      )}/pdf`;
  }

  if (
    loading &&
    fleet.length === 0
  ) {
    return (
      <AdminShell>
        <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-8 text-white">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-300">
            NEXA Fleet
          </p>

          <p className="mt-3 text-xl font-black">
            Loading fleet maintenance...
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
                NEXA Fleet Health
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
                Fleet Maintenance
              </h1>

              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/55">
                Maintenance,
                inspections,
                QR activity,
                scooter history
                and road-ready
                management in one
                place.
              </p>
            </div>

            <button
              type="button"
              onClick={
                refreshAll
              }
              disabled={
                loading
              }
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Fleet"}
            </button>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm font-black text-emerald-300">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-black text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Fleet"
            value={
              summary.total
            }
            subtitle="Tracked vehicles"
          />

          <StatCard
            label="Healthy"
            value={
              summary.healthy
            }
            subtitle="Normal operation"
          />

          <StatCard
            label="Service"
            value={
              summary.service
            }
            subtitle="Service reminders"
          />

          <StatCard
            label="Attention"
            value={
              summary.attention
            }
            subtitle="Safety / inspection"
          />
        </section>

        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#080A10]/85">
          <button
            type="button"
            onClick={() => {
              setQrOpen(
                (value) =>
                  !value
              );

              if (
                !qrOpen
              ) {
                loadQrActivity();
              }
            }}
            className="flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
                QR Activity
              </p>

              <h2 className="mt-1 text-xl font-black text-white">
                Customer QR
                Scans
              </h2>
            </div>

            <span className="text-2xl font-black text-white/40">
              {qrOpen
                ? "−"
                : "+"}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3 px-5 pb-5 md:grid-cols-4">
            <MiniStat
              label="Today"
              value={
                qrStats.today
              }
            />

            <MiniStat
              label="7 Days"
              value={
                qrStats.week
              }
            />

            <MiniStat
              label="30 Days"
              value={
                qrStats.month
              }
            />

            <MiniStat
              label="Most Scanned"
              value={
                qrStats.mostScanned
              }
              suffix={
                qrStats.mostCount
                  ? `${qrStats.mostCount} scans`
                  : ""
              }
            />
          </div>

          {qrOpen ? (
            <div className="border-t border-white/10 p-5">
              {qrLoading ? (
                <p className="text-sm font-bold text-white/40">
                  Loading QR
                  activity...
                </p>
              ) : qrScans.length ===
                0 ? (
                <p className="text-sm font-bold text-white/40">
                  No QR activity
                  yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {qrScans
                    .slice(
                      0,
                      100
                    )
                    .map(
                      (scan) => (
                        <div
                          key={
                            scan.id
                          }
                          className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="font-black text-white">
                              {
                                scan.vehicle_code
                              }
                            </p>

                            <p className="mt-1 text-xs font-bold text-white/35">
                              {scan.viewer_type ===
                              "public"
                                ? "Public / customer page opened"
                                : "Staff page opened"}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <span
                              className={`inline-block rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
                                scan.viewer_type ===
                                "public"
                                  ? "border-sky-400/20 bg-sky-500/10 text-sky-300"
                                  : "border-orange-400/20 bg-orange-500/10 text-orange-300"
                              }`}
                            >
                              {
                                scan.viewer_type
                              }
                            </span>

                            <p className="mt-2 text-xs font-bold text-white/35">
                              {displayDate(
                                scan.scanned_at
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                </div>
              )}
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/85 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Fleet
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              Vehicles
            </h2>

            <div className="mt-5 space-y-2">
              {fleet.map(
                (
                  snapshot
                ) => {
                  const active =
                    snapshot
                      .vehicle
                      .codigo ===
                    selected
                      ?.vehicle
                      .codigo;

                  return (
                    <button
                      type="button"
                      key={
                        snapshot
                          .vehicle
                          .codigo
                      }
                      onClick={() =>
                        setSelectedCode(
                          snapshot
                            .vehicle
                            .codigo
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-orange-400/30 bg-orange-500/10"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-white">
                            {
                              snapshot
                                .vehicle
                                .codigo
                            }{" "}
                            ·{" "}
                            {
                              snapshot
                                .vehicle
                                .matricula
                            }
                          </p>

                          <p className="mt-1 text-xs font-bold text-white/40">
                            {
                              snapshot
                                .vehicle
                                .marca
                            }{" "}
                            {
                              snapshot
                                .vehicle
                                .modelo
                            }
                          </p>

                          <p className="mt-1 text-xs font-bold text-white/30">
                            {snapshot
                              .state
                              .current_km ||
                              0}{" "}
                            km
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${statusClass(
                            snapshot
                              .state
                              .internal_status
                          )}`}
                        >
                          {statusText(
                            snapshot
                              .state
                              .internal_status
                          )}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {selected ? (
            <div className="space-y-6">
              <section className="rounded-[32px] border border-white/10 bg-[#080A10]/85 p-6">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
                      Selected
                      Vehicle
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-white">
                      {
                        selected
                          .vehicle
                          .codigo
                      }{" "}
                      ·{" "}
                      {
                        selected
                          .vehicle
                          .matricula
                      }
                    </h2>

                    <p className="mt-1 text-sm font-bold text-white/45">
                      {
                        selected
                          .vehicle
                          .marca
                      }{" "}
                      {
                        selected
                          .vehicle
                          .modelo
                      }
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${statusClass(
                      selected
                        .state
                        .internal_status
                    )}`}
                  >
                    {statusText(
                      selected
                        .state
                        .internal_status
                    )}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoCard
                    label="Current KM"
                    value={`${selected.state.current_km || 0} km`}
                  />

                  <InfoCard
                    label="Road Ready"
                    value={
                      selected
                        .state
                        .road_ready
                        ? "YES"
                        : "NO"
                    }
                  />

                  <InfoCard
                    label="Last Inspection"
                    value={displayDate(
                      selected
                        .state
                        .last_inspection_at,
                      false
                    )}
                  />

                  <InfoCard
                    label="Last Service"
                    value={displayDate(
                      selected
                        .state
                        .last_service_at,
                      false
                    )}
                  />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    value={
                      currentKmInput
                    }
                    onChange={(
                      event
                    ) =>
                      setCurrentKmInput(
                        event.target.value.replace(
                          /[^\d]/g,
                          ""
                        )
                      )
                    }
                    inputMode="numeric"
                    placeholder="Current odometer km"
                    className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/50"
                  />

                  <button
                    type="button"
                    onClick={
                      updateCurrentKm
                    }
                    disabled={
                      savingKm
                    }
                    className="rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {savingKm
                      ? "Saving..."
                      : "Update KM"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={
                    toggleRoadReady
                  }
                  disabled={
                    savingRoadReady
                  }
                  className={`mt-4 w-full rounded-2xl border px-5 py-4 text-sm font-black transition ${
                    selected.state
                      .road_ready
                      ? "border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                      : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                  }`}
                >
                  {savingRoadReady
                    ? "Updating..."
                    : selected
                        .state
                        .road_ready
                      ? "MARK DO NOT RENT"
                      : "MARK ROAD READY"}
                </button>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-[#080A10]/85 p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
                  Maintenance
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Record Service
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                      Service Type
                    </span>

                    <select
                      value={
                        serviceType
                      }
                      onChange={(
                        event
                      ) =>
                        setServiceType(
                          event
                            .target
                            .value
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-[#101217] px-4 py-4 text-sm font-bold text-white outline-none"
                    >
                      {serviceTypes.map(
                        (
                          item
                        ) => (
                          <option
                            key={
                              item.value
                            }
                            value={
                              item.value
                            }
                          >
                            {
                              item.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <Field
                    label="Performed at KM"
                    value={
                      serviceKm
                    }
                    onChange={
                      setServiceKm
                    }
                    numeric
                  />

                  <Field
                    label="Cost € (optional)"
                    value={
                      serviceCost
                    }
                    onChange={
                      setServiceCost
                    }
                  />

                  <div />

                  <label className="md:col-span-2">
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                      Internal
                      Service Notes
                    </span>

                    <textarea
                      value={
                        serviceNotes
                      }
                      onChange={(
                        event
                      ) =>
                        setServiceNotes(
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Example: oil changed, no leaks, engine running normally..."
                      className="mt-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/50"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={
                    saveService
                  }
                  disabled={
                    savingService
                  }
                  className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-4 text-sm font-black text-white transition hover:bg-orange-400 disabled:opacity-50"
                >
                  {savingService
                    ? "Saving Service..."
                    : "SAVE SERVICE RECORD"}
                </button>

                <div className="mt-8">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    Latest
                    Maintenance
                  </p>

                  {latestServices.length ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {latestServices.map(
                        ({
                          type,
                          record,
                        }) => (
                          <div
                            key={
                              type
                            }
                            className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                          >
                            <p className="font-black text-white">
                              {serviceLabel(
                                type
                              )}
                            </p>

                            <p className="mt-2 text-sm font-bold text-white/50">
                              Last:{" "}
                              {record.performed_km ??
                                "—"}{" "}
                              km
                            </p>

                            <p className="mt-1 text-sm font-bold text-white/40">
                              Next:{" "}
                              {record.next_due_km
                                ? `${record.next_due_km} km`
                                : "Not scheduled"}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-white/30">
                              {displayDate(
                                record.performed_at
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm font-bold text-white/35">
                      No
                      maintenance
                      records yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-[#080A10]/85 p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                  Safety
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  Technical
                  Inspection
                </h2>

                <div className="mt-5 max-w-[260px]">
                  <Field
                    label="Inspection KM"
                    value={
                      inspectionKm
                    }
                    onChange={
                      setInspectionKm
                    }
                    numeric
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {inspectionItems.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          item.itemKey
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <p className="font-black text-white">
                            {
                              item.itemLabel
                            }
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                "pass",
                                "attention",
                                "fail",
                                "not_checked",
                              ] as InspectionStatus[]
                            ).map(
                              (
                                status
                              ) => (
                                <button
                                  key={
                                    status
                                  }
                                  type="button"
                                  onClick={() =>
                                    updateInspectionItem(
                                      index,
                                      {
                                        status,
                                      }
                                    )
                                  }
                                  className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase ${
                                    item.status ===
                                    status
                                      ? inspectionStatusClass(
                                          status
                                        )
                                      : "border-white/10 bg-white/[0.025] text-white/30"
                                  }`}
                                >
                                  {status ===
                                  "not_checked"
                                    ? "Not Checked"
                                    : status}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {item.unit ? (
                          <div className="mt-3 flex items-center gap-2">
                            <input
                              value={
                                item.valueNumber ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateInspectionItem(
                                  index,
                                  {
                                    valueNumber:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              inputMode="decimal"
                              placeholder="Value"
                              className="w-36 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-bold text-white outline-none"
                            />

                            <span className="text-xs font-black uppercase text-white/40">
                              {
                                item.unit
                              }
                            </span>
                          </div>
                        ) : null}

                        {(item.status ===
                          "attention" ||
                          item.status ===
                            "fail") && (
                          <input
                            value={
                              item.internalNote ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateInspectionItem(
                                index,
                                {
                                  internalNote:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder="Internal note about this item..."
                            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-white/25"
                          />
                        )}
                      </div>
                    )
                  )}
                </div>

                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                    Overall
                    Internal Notes
                  </span>

                  <textarea
                    value={
                      inspectionNotes
                    }
                    onChange={(
                      event
                    ) =>
                      setInspectionNotes(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Anything staff should know about this scooter..."
                    className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25"
                  />
                </label>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={
                      resetInspection
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-black text-white"
                  >
                    RESET
                  </button>

                  <button
                    type="button"
                    onClick={
                      saveInspection
                    }
                    disabled={
                      savingInspection
                    }
                    className="rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white disabled:opacity-50"
                  >
                    {savingInspection
                      ? "Saving..."
                      : "COMPLETE INSPECTION"}
                  </button>
                </div>
              </section>

              {selected
                .openIssues
                ?.length ? (
                <section className="rounded-[32px] border border-red-400/15 bg-red-500/[0.05] p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-red-300">
                    Open Issues
                  </p>

                  <div className="mt-4 space-y-3">
                    {selected.openIssues.map(
                      (
                        issue
                      ) => (
                        <div
                          key={
                            issue.id
                          }
                          className="rounded-2xl border border-red-400/15 bg-black/20 p-4"
                        >
                          <p className="font-black capitalize text-white">
                            {issue.category.replaceAll(
                              "_",
                              " "
                            )}
                          </p>

                          <p className="mt-2 text-sm font-semibold text-white/55">
                            {
                              issue.description
                            }
                          </p>

                          <span className="mt-3 inline-block rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase text-red-300">
                            {issue.severity.replaceAll(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#080A10]/85">
                <div className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
                  <button
                    type="button"
                    onClick={
                      toggleHistory
                    }
                    className="flex flex-1 items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-300">
                        Permanent
                        History
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-white">
                        Vehicle
                        History
                      </h2>
                    </div>

                    <span className="text-2xl font-black text-white/40">
                      {historyOpen
                        ? "−"
                        : "+"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={
                      downloadPdf
                    }
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black"
                  >
                    DOWNLOAD PDF
                  </button>
                </div>

                {historyOpen ? (
                  <div className="border-t border-white/10 p-6">
                    {historyLoading ? (
                      <p className="text-sm font-bold text-white/40">
                        Loading
                        history...
                      </p>
                    ) : !history ? (
                      <p className="text-sm font-bold text-white/40">
                        No history
                        loaded.
                      </p>
                    ) : history
                        .timeline
                        .length ===
                      0 ? (
                      <p className="text-sm font-bold text-white/40">
                        No
                        historical
                        events yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {history.timeline.map(
                          (
                            item
                          ) => (
                            <div
                              key={
                                item.id
                              }
                              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                            >
                              <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                <div>
                                  <span
                                    className={`inline-block rounded-full border px-2.5 py-1 text-[9px] font-black uppercase ${timelineTypeClass(
                                      item.type
                                    )}`}
                                  >
                                    {timelineTypeLabel(
                                      item.type
                                    )}
                                  </span>

                                  <p className="mt-3 font-black capitalize text-white">
                                    {serviceLabel(
                                      item.title
                                    )}
                                  </p>

                                  {item.details ? (
                                    <p className="mt-2 text-sm font-semibold leading-5 text-white/45">
                                      {
                                        item.details
                                      }
                                    </p>
                                  ) : null}
                                </div>

                                <div className="shrink-0 sm:text-right">
                                  <p className="text-xs font-bold text-white/40">
                                    {displayDate(
                                      item.date
                                    )}
                                  </p>

                                  {item.km !==
                                    null &&
                                  item.km !==
                                    undefined ? (
                                    <p className="mt-1 text-xs font-black text-white/55">
                                      {
                                        item.km
                                      }{" "}
                                      km
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            </div>
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-white">
              No fleet vehicles
              found.
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-sm font-bold text-white/38">
        {subtitle}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number | string;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">
        {value}
      </p>

      {suffix ? (
        <p className="mt-1 text-xs font-bold text-white/35">
          {suffix}
        </p>
      ) : null}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-black text-white">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  numeric = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  numeric?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </span>

      <input
        value={value}
        inputMode={
          numeric
            ? "numeric"
            : undefined
        }
        onChange={(
          event
        ) =>
          onChange(
            numeric
              ? event.target.value.replace(
                  /[^\d]/g,
                  ""
                )
              : event.target.value
          )
        }
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none focus:border-orange-400/50"
      />
    </label>
  );
}