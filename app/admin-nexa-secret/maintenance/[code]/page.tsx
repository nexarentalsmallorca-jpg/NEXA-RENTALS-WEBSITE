"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

type MaintenanceRecord = {
  maintenance_type?: string;
  performed_km?: number;
  performed_at?: string;
  next_due_km?: number | null;
};

type Snapshot = {
  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
  };

  state: {
    current_km: number;
    road_ready: boolean;
    internal_status: string;
    last_inspection_at?: string | null;
    last_service_at?: string | null;
  };

  latestMaintenance: Record<
    string,
    MaintenanceRecord | null | undefined
  >;

  latestInspection?: {
    inspected_at?: string;
    result?: string;
  } | null;
};

type InspectionStatus =
  | "pass"
  | "attention"
  | "fail";

type InspectionItem = {
  itemKey: string;
  itemLabel: string;
  status: InspectionStatus;
  valueNumber?: string;
  unit?: string;
};

const inspectionTemplate: InspectionItem[] = [
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
    itemKey: "front_tire",
    itemLabel: "Front Tyre",
    status: "pass",
  },
  {
    itemKey: "rear_tire",
    itemLabel: "Rear Tyre",
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
    itemKey: "suspension",
    itemLabel: "Suspension",
    status: "pass",
  },
  {
    itemKey: "stand",
    itemLabel: "Stand",
    status: "pass",
  },
  {
    itemKey: "visible_leaks",
    itemLabel: "Visible Leaks",
    status: "pass",
  },
  {
    itemKey: "body_condition",
    itemLabel: "Body Condition",
    status: "pass",
  },
];

const serviceOptions = [
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
    label: "Tyre Replacement",
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

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function createInspectionItems() {
  return inspectionTemplate.map(
    (item) => ({
      ...item,
    })
  );
}

export default function MobileVehicleMaintenancePage() {
  const params = useParams();
  const router = useRouter();

  const code = String(
    params?.code || ""
  ).toUpperCase();

  const [
    snapshot,
    setSnapshot,
  ] =
    useState<Snapshot | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [km, setKm] =
    useState("");

  const [
    showService,
    setShowService,
  ] = useState(false);

  const [
    showInspection,
    setShowInspection,
  ] = useState(false);

  const [
    showIssue,
    setShowIssue,
  ] = useState(false);

  const [
    selectedServices,
    setSelectedServices,
  ] = useState<string[]>([
    "engine_oil",
  ]);

  const [
    serviceNotes,
    setServiceNotes,
  ] = useState("");

  const [
    serviceCost,
    setServiceCost,
  ] = useState("");

  const [
    inspectionItems,
    setInspectionItems,
  ] = useState<
    InspectionItem[]
  >(
    createInspectionItems()
  );

  const [
    inspectionNotes,
    setInspectionNotes,
  ] = useState("");

  const [
    issueCategory,
    setIssueCategory,
  ] = useState("other");

  const [
    issueSeverity,
    setIssueSeverity,
  ] = useState("minor");

  const [
    issueDescription,
    setIssueDescription,
  ] = useState("");

  async function loadVehicle() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response =
        await fetch(
          `/api/fleet/maintenance?vehicleCode=${encodeURIComponent(
            code
          )}`,
          {
            cache: "no-store",
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
            "Failed to load vehicle."
        );
      }

      setSnapshot(
        result.data
      );

      setKm(
        String(
          result.data?.state
            ?.current_km || ""
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load vehicle."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (code) {
      loadVehicle();
    }
  }, [code]);

  const nextOilKm =
    useMemo(() => {
      return snapshot
        ?.latestMaintenance
        ?.engine_oil
        ?.next_due_km;
    }, [snapshot]);

  const oilRemaining =
    nextOilKm !== null &&
    nextOilKm !==
      undefined &&
    snapshot
      ? nextOilKm -
        snapshot.state
          .current_km
      : null;

  async function updateKm() {
    const value = Number(km);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      setErrorMessage(
        "Enter a valid mileage."
      );

      return;
    }

    try {
      setSaving(true);
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
                  code,
                currentKm:
                  Math.round(
                    value
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
            "Failed to update mileage."
        );
      }

      setMessage(
        "Mileage updated."
      );

      await loadVehicle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update mileage."
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleService(
    serviceType: string
  ) {
    setSelectedServices(
      (current) => {
        if (
          current.includes(
            serviceType
          )
        ) {
          return current.filter(
            (item) =>
              item !==
              serviceType
          );
        }

        return [
          ...current,
          serviceType,
        ];
      }
    );
  }

  async function saveServices() {
    const value = Number(km);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      setErrorMessage(
        "Enter a valid service mileage."
      );

      return;
    }

    if (
      selectedServices.length ===
      0
    ) {
      setErrorMessage(
        "Select at least one maintenance item."
      );

      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      for (
        const maintenanceType of selectedServices
      ) {
        const response =
          await fetch(
            "/api/fleet/maintenance",
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  vehicleCode:
                    code,

                  maintenanceType,

                  performedKm:
                    Math.round(
                      value
                    ),

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
              "Failed to save maintenance."
          );
        }
      }

      setShowService(
        false
      );

      setServiceNotes("");
      setServiceCost("");

      setSelectedServices([
        "engine_oil",
      ]);

      setMessage(
        "Maintenance saved."
      );

      await loadVehicle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save maintenance."
      );
    } finally {
      setSaving(false);
    }
  }

  function setInspectionStatus(
    index: number,
    status: InspectionStatus
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
                  status,
                }
              : item
        )
    );
  }

  function updateInspectionValue(
    index: number,
    value: string
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
                  valueNumber:
                    value,
                }
              : item
        )
    );
  }

  async function saveInspection() {
    const value = Number(km);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      setErrorMessage(
        "Enter a valid inspection mileage."
      );

      return;
    }

    try {
      setSaving(true);
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
                  code,

                inspectionType:
                  "technical",

                odometerKm:
                  Math.round(
                    value
                  ),

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

      setShowInspection(
        false
      );

      setInspectionItems(
        createInspectionItems()
      );

      setInspectionNotes(
        ""
      );

      setMessage(
        "Inspection completed."
      );

      await loadVehicle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to save inspection."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveIssue() {
    if (
      !issueDescription.trim()
    ) {
      setErrorMessage(
        "Enter an issue description."
      );

      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      const response =
        await fetch(
          "/api/fleet/issues",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                vehicleCode:
                  code,

                category:
                  issueCategory,

                severity:
                  issueSeverity,

                description:
                  issueDescription.trim(),

                reportedBy:
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
            "Failed to report issue."
        );
      }

      setShowIssue(false);
      setIssueCategory(
        "other"
      );
      setIssueSeverity(
        "minor"
      );
      setIssueDescription(
        ""
      );

      setMessage(
        "Issue reported."
      );

      await loadVehicle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to report issue."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleRoadReady() {
    if (!snapshot) {
      return;
    }

    const next =
      !snapshot.state
        .road_ready;

    try {
      setSaving(true);
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
                  code,
                roadReady:
                  next,
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
            "Failed to update status."
        );
      }

      setMessage(
        next
          ? "Scooter marked Road Ready."
          : "Scooter marked Do Not Rent."
      );

      await loadVehicle();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update status."
      );
    } finally {
      setSaving(false);
    }
  }

  if (
    loading &&
    !snapshot
  ) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md">
          <p className="font-black">
            Loading {code}...
          </p>
        </div>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-black px-4 py-6 text-white">
        <div className="mx-auto max-w-md rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="font-black text-red-300">
            {errorMessage ||
              "Vehicle not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-4 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <section className="rounded-[30px] border border-white/10 bg-[#0B0B0C] p-5">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin-nexa-secret/maintenance"
              )
            }
            className="mb-4 text-xs font-black uppercase tracking-[0.15em] text-white/35"
          >
            ← Fleet Maintenance
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">
                Staff Quick Access
              </p>

              <h1 className="mt-1 text-4xl font-black">
                {
                  snapshot
                    .vehicle
                    .codigo
                }
              </h1>

              <p className="mt-1 text-sm font-bold text-white/45">
                {
                  snapshot
                    .vehicle
                    .matricula
                }
              </p>

              <p className="mt-1 text-sm font-bold text-white/30">
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
            </div>

            <div
              className={`rounded-full border px-3 py-2 text-[10px] font-black uppercase ${
                snapshot.state
                  .road_ready
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-400/20 bg-red-500/10 text-red-300"
              }`}
            >
              {snapshot.state
                .road_ready
                ? "Road Ready"
                : "Do Not Rent"}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
              Current Odometer
            </p>

            <div className="mt-2 flex items-end gap-2">
              <input
                value={km}
                onChange={(
                  event
                ) =>
                  setKm(
                    event.target.value.replace(
                      /[^\d]/g,
                      ""
                    )
                  )
                }
                inputMode="numeric"
                className="min-w-0 flex-1 bg-transparent text-4xl font-black outline-none"
              />

              <span className="pb-1 text-sm font-black text-white/30">
                KM
              </span>
            </div>

            <button
              type="button"
              onClick={
                updateKm
              }
              disabled={
                saving
              }
              className="mt-4 w-full rounded-2xl bg-white px-4 py-4 text-sm font-black text-black active:scale-[0.99] disabled:opacity-50"
            >
              UPDATE KM
            </button>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm font-black text-emerald-300">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm font-black text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3">
          <QuickButton
            title="Service"
            subtitle={
              oilRemaining ===
              null
                ? "Record maintenance"
                : oilRemaining >
                    0
                  ? `${oilRemaining} km to oil`
                  : "Oil reminder"
            }
            onClick={() =>
              setShowService(
                true
              )
            }
          />

          <QuickButton
            title="Inspection"
            subtitle={formatDate(
              snapshot.state
                .last_inspection_at
            )}
            onClick={() =>
              setShowInspection(
                true
              )
            }
          />

          <QuickButton
            title="Report Issue"
            subtitle="Damage / fault"
            onClick={() =>
              setShowIssue(
                true
              )
            }
          />

          <QuickButton
            title={
              snapshot.state
                .road_ready
                ? "Do Not Rent"
                : "Road Ready"
            }
            subtitle={
              snapshot.state
                .road_ready
                ? "Stop scooter"
                : "Return to fleet"
            }
            danger={
              snapshot.state
                .road_ready
            }
            success={
              !snapshot.state
                .road_ready
            }
            onClick={
              toggleRoadReady
            }
          />
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0B0B0C] p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
            Quick Status
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniCard
              label="Last Service"
              value={formatDate(
                snapshot.state
                  .last_service_at
              )}
            />

            <MiniCard
              label="Inspection"
              value={formatDate(
                snapshot.state
                  .last_inspection_at
              )}
            />

            <MiniCard
              label="Next Oil"
              value={
                nextOilKm
                  ? `${nextOilKm} km`
                  : "Not set"
              }
            />

            <MiniCard
              label="Status"
              value={
                snapshot.state
                  .road_ready
                  ? "Ready"
                  : "Stopped"
              }
            />
          </div>
        </section>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/fleet/${encodeURIComponent(
                code
              )}`
            )
          }
          className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-black text-white"
        >
          VIEW PUBLIC QR PAGE
        </button>

        {showService ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 backdrop-blur-sm">
            <div className="mx-auto max-w-md pb-8">
              <div className="rounded-[30px] border border-white/10 bg-[#111214] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                      Maintenance
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      Record Service
                    </h2>

                    <p className="mt-1 text-sm font-bold text-white/35">
                      {km ||
                        "0"}{" "}
                      km
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowService(
                        false
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="mt-5 space-y-2">
                  {serviceOptions.map(
                    (service) => {
                      const active =
                        selectedServices.includes(
                          service.value
                        );

                      return (
                        <button
                          key={
                            service.value
                          }
                          type="button"
                          onClick={() =>
                            toggleService(
                              service.value
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${
                            active
                              ? "border-orange-400/30 bg-orange-500/10"
                              : "border-white/10 bg-white/[0.035]"
                          }`}
                        >
                          <span className="font-black">
                            {
                              service.label
                            }
                          </span>

                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-black ${
                              active
                                ? "border-orange-400/30 bg-orange-500 text-white"
                                : "border-white/15 bg-white/[0.04] text-white/25"
                            }`}
                          >
                            {active
                              ? "✓"
                              : ""}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>

                <label className="mt-5 block">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
                    Notes
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
                    placeholder="Optional service notes..."
                    className="mt-2 min-h-[90px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
                    Cost €
                  </span>

                  <input
                    value={
                      serviceCost
                    }
                    onChange={(
                      event
                    ) =>
                      setServiceCost(
                        event
                          .target
                          .value
                      )
                    }
                    inputMode="decimal"
                    placeholder="Optional"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25"
                  />
                </label>

                <button
                  type="button"
                  onClick={
                    saveServices
                  }
                  disabled={
                    saving
                  }
                  className="mt-5 w-full rounded-[22px] bg-orange-500 px-5 py-5 text-base font-black text-white disabled:opacity-50"
                >
                  {saving
                    ? "SAVING..."
                    : "SAVE MAINTENANCE"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showInspection ? (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black p-3">
            <div className="mx-auto max-w-md pb-8">
              <div className="sticky top-0 z-10 rounded-[26px] border border-white/10 bg-[#111214]/95 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      Quick Inspection
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {
                        snapshot
                          .vehicle
                          .codigo
                      }
                    </h2>

                    <p className="text-xs font-bold text-white/35">
                      {km ||
                        "0"}{" "}
                      km
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowInspection(
                        false
                      )
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {inspectionItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.itemKey
                      }
                      className="rounded-2xl border border-white/10 bg-[#0B0B0C] p-4"
                    >
                      <p className="font-black">
                        {
                          item.itemLabel
                        }
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <StatusButton
                          label="PASS"
                          active={
                            item.status ===
                            "pass"
                          }
                          tone="success"
                          onClick={() =>
                            setInspectionStatus(
                              index,
                              "pass"
                            )
                          }
                        />

                        <StatusButton
                          label="CHECK"
                          active={
                            item.status ===
                            "attention"
                          }
                          tone="warning"
                          onClick={() =>
                            setInspectionStatus(
                              index,
                              "attention"
                            )
                          }
                        />

                        <StatusButton
                          label="FAIL"
                          active={
                            item.status ===
                            "fail"
                          }
                          tone="danger"
                          onClick={() =>
                            setInspectionStatus(
                              index,
                              "fail"
                            )
                          }
                        />
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
                              updateInspectionValue(
                                index,
                                event
                                  .target
                                  .value
                              )
                            }
                            inputMode="decimal"
                            placeholder="Value"
                            className="w-32 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm font-bold text-white outline-none"
                          />

                          <span className="text-xs font-black uppercase text-white/35">
                            {
                              item.unit
                            }
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )
                )}
              </div>

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
                placeholder="Internal inspection notes..."
                className="mt-3 min-h-[100px] w-full rounded-2xl border border-white/10 bg-[#0B0B0C] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={
                  saveInspection
                }
                disabled={
                  saving
                }
                className="mt-4 w-full rounded-[22px] bg-emerald-500 px-5 py-5 text-base font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "SAVING..."
                  : "COMPLETE INSPECTION"}
              </button>
            </div>
          </div>
        ) : null}

        {showIssue ? (
          <div className="fixed inset-0 z-50 flex items-end bg-black/80 p-3 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-md rounded-[30px] border border-white/10 bg-[#111214] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
                    Issue
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Report Problem
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowIssue(
                      false
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-xs font-black"
                >
                  CLOSE
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
                  Category
                </span>

                <select
                  value={
                    issueCategory
                  }
                  onChange={(
                    event
                  ) =>
                    setIssueCategory(
                      event
                        .target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#17181B] px-4 py-4 font-bold text-white"
                >
                  <option value="engine">
                    Engine
                  </option>

                  <option value="brakes">
                    Brakes
                  </option>

                  <option value="tires">
                    Tyres
                  </option>

                  <option value="electrical">
                    Electrical
                  </option>

                  <option value="body">
                    Body
                  </option>

                  <option value="suspension">
                    Suspension
                  </option>

                  <option value="steering">
                    Steering
                  </option>

                  <option value="noise_vibration">
                    Noise / Vibration
                  </option>

                  <option value="accident">
                    Accident
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
                  Severity
                </span>

                <select
                  value={
                    issueSeverity
                  }
                  onChange={(
                    event
                  ) =>
                    setIssueSeverity(
                      event
                        .target
                        .value
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#17181B] px-4 py-4 font-bold text-white"
                >
                  <option value="minor">
                    Minor
                  </option>

                  <option value="attention">
                    Needs Attention
                  </option>

                  <option value="do_not_rent">
                    Do Not Rent
                  </option>
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
                  Description
                </span>

                <textarea
                  value={
                    issueDescription
                  }
                  onChange={(
                    event
                  ) =>
                    setIssueDescription(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Example: rear tyre damaged..."
                  className="mt-2 min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25"
                />
              </label>

              <button
                type="button"
                onClick={
                  saveIssue
                }
                disabled={
                  saving
                }
                className="mt-5 w-full rounded-[22px] bg-red-500 px-5 py-5 text-base font-black text-white disabled:opacity-50"
              >
                {saving
                  ? "SAVING..."
                  : "REPORT ISSUE"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function QuickButton({
  title,
  subtitle,
  onClick,
  danger = false,
  success = false,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[122px] rounded-[24px] border p-4 text-left transition active:scale-[0.98] ${
        danger
          ? "border-red-400/20 bg-red-500/10"
          : success
            ? "border-emerald-400/20 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <p className="text-lg font-black">
        {title}
      </p>

      <p className="mt-2 text-xs font-bold text-white/35">
        {subtitle}
      </p>
    </button>
  );
}

function MiniCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-sm font-black">
        {value}
      </p>
    </div>
  );
}

function StatusButton({
  active,
  label,
  tone,
  onClick,
}: {
  active: boolean;
  label: string;
  tone:
    | "success"
    | "warning"
    | "danger";
  onClick: () => void;
}) {
  const activeClass =
    tone === "success"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
      : tone === "warning"
        ? "border-yellow-400/30 bg-yellow-500/15 text-yellow-300"
        : "border-red-400/30 bg-red-500/15 text-red-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-2 py-3 text-[10px] font-black ${
        active
          ? activeClass
          : "border-white/10 bg-white/[0.03] text-white/30"
      }`}
    >
      {label}
    </button>
  );
}