
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MaintenanceRecord = {
  id?: string;
  maintenance_type?: string;
  performed_km?: number;
  performed_at?: string;
  next_due_km?: number | null;
  notes?: string | null;
};

type FleetIssue = {
  id: string;
  category: string;
  severity: string;
  description: string;
  status: string;
  opened_at: string;
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
  latestMaintenance: Record<string, MaintenanceRecord | null>;
  latestInspection?: {
    inspected_at?: string;
    result?: string;
  } | null;
  openIssues?: FleetIssue[];
  serviceSummary?: {
    lastServiceDate: string | null;
    lastServiceKm: number | null;
    nextServiceKm: number | null;
    kmUntilService: number | null;
  };
  beltSummary?: {
    lastBeltDate: string | null;
    lastBeltKm: number | null;
    nextBeltKm: number | null;
    kmUntilBelt: number | null;
  };
};

type InspectionStatus =
  | "pass"
  | "attention"
  | "fail"
  | "not_checked";

type InspectionItem = {
  itemKey: string;
  itemLabel: string;
  status: InspectionStatus;
  valueNumber?: string;
  unit?: string;
};

type ServiceEntry = {
  selected: boolean;
  performedKm: string;
  performedAt: string;
  nextDueKm: string;
};

const serviceOptions = [
  { value: "engine_oil", label: "Engine Oil", interval: 2000 },
  { value: "oil_filter", label: "Oil Filter", interval: 4000 },
  { value: "air_filter", label: "Air Filter", interval: 6000 },
  { value: "injector_cleaner", label: "Injector Cleaner", interval: 5000 },
  { value: "cvt_belt", label: "CVT Belt", interval: 10000 },
  { value: "variator_weights", label: "Variator Weights", interval: 10000 },
  { value: "spark_plug", label: "Spark Plug", interval: 10000 },
  { value: "brake_service", label: "Brake Service", interval: 0 },
  { value: "tire_replacement", label: "Tyre Replacement", interval: 0 },
  { value: "battery", label: "Battery", interval: 0 },
  { value: "general_service", label: "General Service", interval: 2000 },
  { value: "other", label: "Other", interval: 0 },
];

const inspectionTemplate: InspectionItem[] = [
  { itemKey: "front_brake", itemLabel: "Front Brake", status: "not_checked" },
  { itemKey: "rear_brake", itemLabel: "Rear Brake", status: "not_checked" },
  { itemKey: "front_tire", itemLabel: "Front Tyre", status: "not_checked" },
  { itemKey: "rear_tire", itemLabel: "Rear Tyre", status: "not_checked" },
  {
    itemKey: "front_tire_pressure",
    itemLabel: "Front Tyre Pressure",
    status: "not_checked",
    valueNumber: "",
    unit: "bar",
  },
  {
    itemKey: "rear_tire_pressure",
    itemLabel: "Rear Tyre Pressure",
    status: "not_checked",
    valueNumber: "",
    unit: "bar",
  },
  { itemKey: "headlight", itemLabel: "Headlight", status: "not_checked" },
  { itemKey: "brake_light", itemLabel: "Brake Light", status: "not_checked" },
  { itemKey: "indicators", itemLabel: "Indicators", status: "not_checked" },
  { itemKey: "horn", itemLabel: "Horn", status: "not_checked" },
  { itemKey: "mirrors", itemLabel: "Mirrors", status: "not_checked" },
  { itemKey: "steering", itemLabel: "Steering", status: "not_checked" },
  { itemKey: "suspension", itemLabel: "Suspension", status: "not_checked" },
  { itemKey: "stand", itemLabel: "Stand", status: "not_checked" },
  { itemKey: "visible_leaks", itemLabel: "Visible Leaks", status: "not_checked" },
  { itemKey: "body_condition", itemLabel: "Body Condition", status: "not_checked" },
];

function todayLocal() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatKm(value?: number | null) {
  if (value === null || value === undefined) return "Not set";
  return `${Number(value).toLocaleString("en-GB")} km`;
}

function parseKm(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > 9999999) return null;
  return parsed;
}

function createInspectionItems() {
  return inspectionTemplate.map((item) => ({ ...item }));
}

function getError(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

async function apiRequest(
  url: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>
) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Session expired. Please log in to NEXA OS again.");
  }

  if (!response.ok || !result?.ok) {
    throw new Error(result?.error || "Request failed.");
  }

  return result;
}

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-orange-400/60";

const panelClass =
  "rounded-[28px] border border-white/10 bg-[#0B0B0C] p-5";

export default function MobileVehicleMaintenancePage() {
  const params = useParams();
  const router = useRouter();
  const code = String(params?.code || "").toUpperCase();

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [km, setKm] = useState("");

  const [showService, setShowService] = useState(false);
  const [showInspection, setShowInspection] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  const [serviceEntries, setServiceEntries] = useState<
    Record<string, ServiceEntry>
  >({});
  const [serviceNotes, setServiceNotes] = useState("");
  const [serviceCost, setServiceCost] = useState("");

  const [inspectionItems, setInspectionItems] = useState(
    createInspectionItems()
  );
  const [inspectionNotes, setInspectionNotes] = useState("");

  const [issueCategory, setIssueCategory] = useState("other");
  const [issueSeverity, setIssueSeverity] = useState("minor");
  const [issueDescription, setIssueDescription] = useState("");

  async function loadVehicle(showLoader = false) {
    try {
      if (showLoader) setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/fleet/maintenance?vehicleCode=${encodeURIComponent(code)}`,
        {
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        router.replace(
          `/admin-nexa-secret/login?next=${encodeURIComponent(
            `/admin-nexa-secret/maintenance/${code}`
          )}`
        );
        return;
      }

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Failed to load vehicle.");
      }

      const data = result.data as Snapshot;
      setSnapshot(data);
      setKm(String(data.state.current_km ?? 0));
    } catch (error) {
      setErrorMessage(getError(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (code) void loadVehicle(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function openService() {
    if (!snapshot) return;

    const entries: Record<string, ServiceEntry> = {};
    const currentKm = Number(snapshot.state.current_km ?? 0);

    for (const option of serviceOptions) {
      entries[option.value] = {
        selected: false,
        performedKm: String(currentKm),
        performedAt: todayLocal(),
        nextDueKm:
          option.interval > 0
            ? String(currentKm + option.interval)
            : "",
      };
    }

    setServiceEntries(entries);
    setServiceNotes("");
    setServiceCost("");
    setErrorMessage("");
    setShowService(true);
  }

  function updateServiceEntry(
    type: string,
    patch: Partial<ServiceEntry>
  ) {
    setServiceEntries((current) => ({
      ...current,
      [type]: {
        ...current[type],
        ...patch,
      },
    }));
  }

  async function updateKm() {
    const value = parseKm(km);

    if (value === null) {
      setErrorMessage("Enter a valid current odometer reading.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      await apiRequest("/api/fleet/maintenance", "PATCH", {
        vehicleCode: code,
        currentKm: value,
      });

      await loadVehicle();
      setMessage("Current KM updated. Service history unchanged.");
    } catch (error) {
      setErrorMessage(getError(error));
    } finally {
      setSaving(false);
    }
  }

  async function saveServices() {
    const selected = serviceOptions.filter(
      (option) => serviceEntries[option.value]?.selected
    );

    if (!selected.length) {
      setErrorMessage("Select at least one completed maintenance item.");
      return;
    }

    const prepared: Array<{
      maintenanceType: string;
      performedKm: number;
      performedAt: string;
      nextDueKm: number | null;
    }> = [];

    for (const option of selected) {
      const entry = serviceEntries[option.value];
      const performedKm = parseKm(entry.performedKm);
      const nextDueKm = entry.nextDueKm.trim()
        ? parseKm(entry.nextDueKm)
        : null;

      if (performedKm === null) {
        setErrorMessage(`Enter valid service KM for ${option.label}.`);
        return;
      }

      const date = new Date(`${entry.performedAt}T12:00:00`);

      if (
        !entry.performedAt ||
        Number.isNaN(date.getTime()) ||
        entry.performedAt > todayLocal()
      ) {
        setErrorMessage(`Enter a valid service date for ${option.label}.`);
        return;
      }

      if (entry.nextDueKm.trim() && nextDueKm === null) {
        setErrorMessage(`Enter valid next KM for ${option.label}.`);
        return;
      }

      if (nextDueKm !== null && nextDueKm <= performedKm) {
        setErrorMessage(
          `${option.label}: next service KM must exceed performed KM.`
        );
        return;
      }

      prepared.push({
        maintenanceType: option.value,
        performedKm,
        performedAt: `${entry.performedAt}T12:00:00`,
        nextDueKm,
      });
    }

    const cost =
      serviceCost.trim() === "" ? null : Number(serviceCost);

    if (cost !== null && (!Number.isFinite(cost) || cost < 0)) {
      setErrorMessage("Enter a valid service cost.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setErrorMessage("");

      let savedCount = 0;

      for (const service of prepared) {
        await apiRequest("/api/fleet/maintenance", "POST", {
          vehicleCode: code,
          ...service,
          notes: serviceNotes.trim() || null,
          cost,
          performedBy: "NEXA Staff",
        });

        savedCount++;

        // Remove successfully saved items from selection.
        // A retry will only submit remaining items.
        setServiceEntries((current) => ({
          ...current,
          [service.maintenanceType]: {
            ...current[service.maintenanceType],
            selected: false,
          },
        }));
      }

      setShowService(false);
      await loadVehicle();
      setMessage(`${savedCount} maintenance record(s) saved.`);
    } catch (error) {
      setErrorMessage(
        `${getError(error)} Check which services were saved before retrying.`
      );
    } finally {
      setSaving(false);
    }
  }

  function setInspectionStatus(
    index: number,
    status: InspectionStatus
  ) {
    setInspectionItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, status } : item
      )
    );
  }

  function updateInspectionValue(index: number, value: string) {
    setInspectionItems((current) =>
      current.map((item, i) =>
        i === index ? { ...item, valueNumber: value } : item
      )
    );
  }

  async function saveInspection() {
    const value = parseKm(km);

    if (value === null) {
      setErrorMessage("Enter valid inspection kilometers.");
      return;
    }

    const unchecked = inspectionItems.filter(
      (item) => item.status === "not_checked"
    );

    if (unchecked.length > 0) {
      setErrorMessage(
        `Complete all inspection checks first. ${unchecked.length} remaining.`
      );
      return;
    }

    for (const item of inspectionItems) {
      if (item.unit) {
        const pressure = Number(item.valueNumber);

        if (
          !item.valueNumber?.trim() ||
          !Number.isFinite(pressure) ||
          pressure < 0
        ) {
          setErrorMessage(
            `Enter a valid measurement for ${item.itemLabel}.`
          );
          return;
        }
      }
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      await apiRequest("/api/fleet/inspection", "POST", {
        vehicleCode: code,
        inspectionType: "technical",
        odometerKm: value,
        publicSummary:
          "Routine safety inspection completed by NEXA Rentals.",
        internalNotes: inspectionNotes.trim() || null,
        inspectedBy: "NEXA Staff",
        items: inspectionItems.map((item) => ({
          itemKey: item.itemKey,
          itemLabel: item.itemLabel,
          status: item.status,
          valueNumber: item.valueNumber?.trim()
            ? Number(item.valueNumber)
            : null,
          unit: item.unit || null,
        })),
      });

      setShowInspection(false);
      setInspectionItems(createInspectionItems());
      setInspectionNotes("");
      await loadVehicle();
      setMessage(
        "Inspection saved. Road Ready must be confirmed separately."
      );
    } catch (error) {
      setErrorMessage(getError(error));
    } finally {
      setSaving(false);
    }
  }

  async function saveIssue() {
    if (!issueDescription.trim()) {
      setErrorMessage("Enter an issue description.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      await apiRequest("/api/fleet/issues", "POST", {
        vehicleCode: code,
        category: issueCategory,
        severity: issueSeverity,
        description: issueDescription.trim(),
        reportedBy: "NEXA Staff",
      });

      setShowIssue(false);
      setIssueCategory("other");
      setIssueSeverity("minor");
      setIssueDescription("");

      await loadVehicle();

      setMessage(
        issueSeverity === "do_not_rent"
          ? "Critical issue reported. Scooter marked Do Not Rent."
          : "Issue reported successfully."
      );
    } catch (error) {
      setErrorMessage(getError(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleRoadReady() {
    if (!snapshot) return;

    const next = !snapshot.state.road_ready;

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      await apiRequest("/api/fleet/maintenance", "PATCH", {
        vehicleCode: code,
        roadReady: next,
      });

      await loadVehicle();

      setMessage(
        next
          ? "Scooter marked Road Ready."
          : "Scooter marked Do Not Rent."
      );
    } catch (error) {
      setErrorMessage(getError(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading && !snapshot) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        Loading {code}...
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="min-h-screen bg-black p-6 text-red-300">
        {errorMessage || "Vehicle not found."}
      </main>
    );
  }

  const oil = snapshot.latestMaintenance?.engine_oil;
  const belt = snapshot.latestMaintenance?.cvt_belt;
  const service = snapshot.serviceSummary;
  const uncheckedCount = inspectionItems.filter(
    (item) => item.status === "not_checked"
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] px-3 py-4 text-white">
      <div className="mx-auto max-w-md space-y-4">
        <section className={panelClass}>
          <button
            type="button"
            onClick={() =>
              router.push("/admin-nexa-secret/maintenance")
            }
            className="mb-4 text-xs font-semibold text-white/50"
          >
            ← Fleet Maintenance
          </button>

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300">
                Staff Quick Access
              </p>
              <h1 className="mt-2 text-4xl font-semibold">
                {snapshot.vehicle.codigo}
              </h1>
              <p className="mt-1 text-sm text-white/60">
                {snapshot.vehicle.matricula}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {snapshot.vehicle.marca} {snapshot.vehicle.modelo}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-2 text-[10px] font-semibold ${
                snapshot.state.road_ready
                  ? "border-emerald-400/30 text-emerald-300"
                  : "border-red-400/30 text-red-300"
              }`}
            >
              {snapshot.state.road_ready
                ? "ROAD READY"
                : "DO NOT RENT"}
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              Current Odometer
            </p>

            <div className="mt-2 flex items-end gap-2">
              <input
                value={km}
                onChange={(event) =>
                  setKm(event.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                className="min-w-0 flex-1 bg-transparent text-4xl font-semibold outline-none"
              />
              <span className="pb-1 text-sm text-white/40">KM</span>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={updateKm}
              className="mt-4 w-full rounded-xl bg-white px-4 py-4 text-sm font-semibold text-black disabled:opacity-50"
            >
              UPDATE CURRENT KM
            </button>

            <p className="mt-2 text-[11px] text-white/35">
              This does not change service dates or service kilometers.
            </p>
          </div>
        </section>

        {message && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {errorMessage && !showService && !showInspection && !showIssue && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-2 gap-3">
          <QuickButton
            title="Service"
            subtitle="Dates, KM & belt"
            onClick={openService}
          />
          <QuickButton
            title="Inspection"
            subtitle={formatDate(snapshot.state.last_inspection_at)}
            onClick={() => {
              setInspectionItems(createInspectionItems());
              setErrorMessage("");
              setShowInspection(true);
            }}
          />
          <QuickButton
            title="Report Issue"
            subtitle="Damage / fault"
            onClick={() => {
              setErrorMessage("");
              setShowIssue(true);
            }}
          />
          <QuickButton
            title={
              snapshot.state.road_ready
                ? "Do Not Rent"
                : "Road Ready"
            }
            subtitle={
              snapshot.state.road_ready
                ? "Stop scooter"
                : "Return to fleet"
            }
            danger={snapshot.state.road_ready}
            success={!snapshot.state.road_ready}
            onClick={toggleRoadReady}
          />
        </section>

        <section className={panelClass}>
          <p className="text-[10px] uppercase tracking-widest text-orange-300">
            Service Overview
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniCard
              label="Last Service Date"
              value={formatDate(
                service?.lastServiceDate ??
                  snapshot.state.last_service_at
              )}
            />
            <MiniCard
              label="Last Service KM"
              value={formatKm(service?.lastServiceKm)}
            />
            <MiniCard
              label="Next Service KM"
              value={formatKm(service?.nextServiceKm)}
            />
            <MiniCard
              label="Current KM"
              value={formatKm(snapshot.state.current_km)}
            />
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-[10px] uppercase tracking-widest text-orange-300">
            Belt Maintenance
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniCard
              label="Last Belt Change"
              value={formatDate(belt?.performed_at)}
            />
            <MiniCard
              label="Belt Changed At"
              value={formatKm(belt?.performed_km)}
            />
            <MiniCard
              label="Next Belt Change"
              value={formatKm(belt?.next_due_km)}
            />
            <MiniCard
              label="Standard Interval"
              value="10,000 km"
            />
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-[10px] uppercase tracking-widest text-white/40">
            Quick Status
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MiniCard
              label="Last Inspection"
              value={formatDate(snapshot.state.last_inspection_at)}
            />
            <MiniCard
              label="Next Engine Oil"
              value={formatKm(oil?.next_due_km)}
            />
            <MiniCard
              label="Internal Status"
              value={snapshot.state.internal_status.replace(/_/g, " ")}
            />
            <MiniCard
              label="Road Status"
              value={snapshot.state.road_ready ? "Ready" : "Stopped"}
            />
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-[10px] uppercase tracking-widest text-orange-300">
            Open Issues
          </p>

          {!snapshot.openIssues?.length ? (
            <p className="mt-3 text-sm text-white/40">
              No open issues recorded.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {snapshot.openIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold capitalize">
                      {issue.category.replace(/_/g, " ")}
                    </p>
                    <span
                      className={`text-[10px] font-semibold ${
                        issue.severity === "do_not_rent"
                          ? "text-red-300"
                          : "text-yellow-300"
                      }`}
                    >
                      {issue.severity.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    {issue.description}
                  </p>
                  <p className="mt-2 text-[10px] text-white/30">
                    {formatDate(issue.opened_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/en/fleet/${encodeURIComponent(code)}`
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-semibold"
        >
          VIEW PUBLIC QR PAGE
        </button>

        {showService && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-3">
            <div className="mx-auto max-w-md pb-10">
              <div className="rounded-[28px] border border-white/10 bg-[#111214] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-orange-300">
                      NEXA Maintenance
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Record Service
                    </h2>
                    <p className="mt-1 text-xs text-white/40">
                      Select only work actually completed.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowService(false)}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {serviceOptions.map((option) => {
                    const entry = serviceEntries[option.value];
                    if (!entry) return null;

                    return (
                      <div
                        key={option.value}
                        className={`rounded-2xl border p-4 ${
                          entry.selected
                            ? "border-orange-400/40 bg-orange-500/[0.07]"
                            : "border-white/10 bg-white/[0.025]"
                        }`}
                      >
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            updateServiceEntry(option.value, {
                              selected: !entry.selected,
                            })
                          }
                          className="flex w-full items-center justify-between text-left"
                        >
                          <div>
                            <p className="font-semibold">
                              {option.label}
                            </p>
                            <p className="mt-1 text-xs text-white/35">
                              {option.interval > 0
                                ? `Default: every ${option.interval.toLocaleString("en-GB")} km`
                                : "Manual maintenance"}
                            </p>
                          </div>
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                              entry.selected
                                ? "border-orange-400 bg-orange-500 text-black"
                                : "border-white/20 text-white/40"
                            }`}
                          >
                            {entry.selected ? "✓" : "+"}
                          </span>
                        </button>

                        {entry.selected && (
                          <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                            <label className="block">
                              <span className="text-xs text-white/60">
                                Actual Service Date
                              </span>
                              <input
                                type="date"
                                max={todayLocal()}
                                value={entry.performedAt}
                                disabled={saving}
                                onChange={(event) =>
                                  updateServiceEntry(option.value, {
                                    performedAt: event.target.value,
                                  })
                                }
                                className={inputClass}
                              />
                            </label>

                            <label className="block">
                              <span className="text-xs text-white/60">
                                KM When Serviced
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={entry.performedKm}
                                disabled={saving}
                                onChange={(event) => {
                                  const value =
                                    event.target.value.replace(/[^\d]/g, "");
                                  const performed = parseKm(value);

                                  updateServiceEntry(option.value, {
                                    performedKm: value,
                                    nextDueKm:
                                      performed !== null &&
                                      option.interval > 0
                                        ? String(performed + option.interval)
                                        : entry.nextDueKm,
                                  });
                                }}
                                placeholder="Example: 12000"
                                className={inputClass}
                              />
                            </label>

                            <label className="block">
                              <span className="text-xs text-white/60">
                                Next Service / Replacement KM
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={entry.nextDueKm}
                                disabled={saving}
                                onChange={(event) =>
                                  updateServiceEntry(option.value, {
                                    nextDueKm:
                                      event.target.value.replace(/[^\d]/g, ""),
                                  })
                                }
                                placeholder="Set next KM target"
                                className={inputClass}
                              />
                            </label>

                            <p className="text-[11px] text-white/35">
                              You can manually change the next KM target.
                              {option.value === "cvt_belt"
                                ? " Belt default: 10,000 km after replacement."
                                : ""}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <label className="mt-5 block">
                  <span className="text-xs text-white/50">
                    Service Notes
                  </span>
                  <textarea
                    value={serviceNotes}
                    disabled={saving}
                    onChange={(event) =>
                      setServiceNotes(event.target.value)
                    }
                    placeholder="Work completed, parts replaced, mechanic notes..."
                    className={`${inputClass} min-h-[90px]`}
                  />
                </label>

                <label className="mt-4 block">
                  <span className="text-xs text-white/50">
                    Cost (€)
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={serviceCost}
                    disabled={saving}
                    onChange={(event) =>
                      setServiceCost(event.target.value)
                    }
                    placeholder="Optional"
                    className={inputClass}
                  />
                </label>

                {errorMessage && (
                  <p className="mt-4 text-sm text-red-300">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={saveServices}
                  disabled={saving}
                  className="mt-5 w-full rounded-2xl bg-orange-500 px-5 py-5 text-base font-semibold text-black disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE MAINTENANCE"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showInspection && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black p-3">
            <div className="mx-auto max-w-md pb-8">
              <div className="sticky top-0 z-10 rounded-2xl border border-white/10 bg-[#111214] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-300">
                      QUICK INSPECTION
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      {code}
                    </h2>
                    <p className="text-xs text-white/40">
                      {km || "0"} km
                    </p>
                    <p className="mt-1 text-xs text-orange-300">
                      {uncheckedCount} checks remaining
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowInspection(false)}
                    className="rounded-xl border border-white/10 px-4 py-3 text-xs"
                  >
                    CLOSE
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {inspectionItems.map((item, index) => (
                  <div
                    key={item.itemKey}
                    className="rounded-2xl border border-white/10 bg-[#0B0B0C] p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">
                        {item.itemLabel}
                      </p>
                      {item.status === "not_checked" && (
                        <span className="text-[10px] text-orange-300">
                          NOT CHECKED
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {(["pass", "attention", "fail"] as const).map(
                        (status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              setInspectionStatus(index, status)
                            }
                            className={`rounded-xl border px-2 py-3 text-xs font-semibold ${
                              item.status === status
                                ? status === "pass"
                                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                                  : status === "attention"
                                    ? "border-yellow-400 bg-yellow-500/20 text-yellow-300"
                                    : "border-red-400 bg-red-500/20 text-red-300"
                                : "border-white/10 text-white/40"
                            }`}
                          >
                            {status === "attention"
                              ? "CHECK"
                              : status.toUpperCase()}
                          </button>
                        )
                      )}
                    </div>

                    {item.unit && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={item.valueNumber || ""}
                          disabled={saving}
                          onChange={(event) =>
                            updateInspectionValue(
                              index,
                              event.target.value
                            )
                          }
                          inputMode="decimal"
                          placeholder="Pressure"
                          className="w-32 rounded-xl border border-white/10 bg-black px-3 py-3 text-sm"
                        />
                        <span className="text-xs text-white/40">
                          {item.unit}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <textarea
                value={inspectionNotes}
                disabled={saving}
                onChange={(event) =>
                  setInspectionNotes(event.target.value)
                }
                placeholder="Internal inspection notes..."
                className={`${inputClass} mt-4 min-h-[100px]`}
              />

              {errorMessage && (
                <p className="mt-3 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={saveInspection}
                disabled={saving || uncheckedCount > 0}
                className="mt-4 w-full rounded-2xl bg-emerald-500 px-5 py-5 font-semibold text-black disabled:opacity-50"
              >
                {saving
                  ? "SAVING..."
                  : uncheckedCount > 0
                    ? `${uncheckedCount} CHECKS REMAINING`
                    : "COMPLETE INSPECTION"}
              </button>
            </div>
          </div>
        )}

        {showIssue && (
          <div className="fixed inset-0 z-50 flex items-end overflow-y-auto bg-black/90 p-3">
            <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/10 bg-[#111214] p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  Report Problem
                </h2>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowIssue(false)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs"
                >
                  CLOSE
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-xs text-white/50">
                  Category
                </span>
                <select
                  value={issueCategory}
                  disabled={saving}
                  onChange={(event) =>
                    setIssueCategory(event.target.value)
                  }
                  className={inputClass}
                >
                  {[
                    "engine",
                    "brakes",
                    "tires",
                    "electrical",
                    "body",
                    "suspension",
                    "steering",
                    "noise_vibration",
                    "accident",
                    "other",
                  ].map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-xs text-white/50">
                  Severity
                </span>
                <select
                  value={issueSeverity}
                  disabled={saving}
                  onChange={(event) =>
                    setIssueSeverity(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="minor">Minor</option>
                  <option value="attention">Needs Attention</option>
                  <option value="do_not_rent">Do Not Rent</option>
                </select>
              </label>

              {issueSeverity === "do_not_rent" && (
                <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-300">
                  Critical issue: this scooter will be marked
                  Do Not Rent when the report is saved.
                </p>
              )}

              <label className="mt-4 block">
                <span className="text-xs text-white/50">
                  Description
                </span>
                <textarea
                  value={issueDescription}
                  disabled={saving}
                  onChange={(event) =>
                    setIssueDescription(event.target.value)
                  }
                  placeholder="Example: rear tyre damaged..."
                  className={`${inputClass} min-h-[110px]`}
                />
              </label>

              {errorMessage && (
                <p className="mt-3 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={saveIssue}
                disabled={saving}
                className="mt-5 w-full rounded-2xl bg-red-500 px-5 py-5 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "SAVING..." : "REPORT ISSUE"}
              </button>
            </div>
          </div>
        )}
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
      className={`min-h-[120px] rounded-[24px] border p-4 text-left active:scale-[0.98] ${
        danger
          ? "border-red-400/20 bg-red-500/10"
          : success
            ? "border-emerald-400/20 bg-emerald-500/10"
            : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-xs text-white/40">
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
      <p className="text-[9px] uppercase tracking-widest text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}
