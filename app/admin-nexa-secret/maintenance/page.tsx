"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/dashboard/AdminShell";
import { nexaFleet } from "../../../lib/nexaFleet";

type MaintenanceStatus = "good" | "due_soon" | "overdue";

type MaintenanceRecord = {
  vehicleCode: string;
  currentKm: string;
  lastOilKm: string;
  nextOilKm: string;
  lastCleaningDate: string;
  lastTirePressureDate: string;
  lastLightsCheckDate: string;
  lastBrakeCheckDate: string;
  notes: string;
};

const STORAGE_KEY = "nexa_vehicle_maintenance";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function numberValue(value: string) {
  const clean = String(value || "").replace(/[^\d]/g, "");
  const parsed = Number(clean);

  return Number.isFinite(parsed) ? parsed : 0;
}

function daysSince(dateValue: string) {
  if (!dateValue) return 9999;

  const date = new Date(`${dateValue}T00:00:00`);
  const now = new Date();

  if (Number.isNaN(date.getTime())) return 9999;

  const diff = now.getTime() - date.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getMaintenanceStatus(record: MaintenanceRecord): MaintenanceStatus {
  const currentKm = numberValue(record.currentKm);
  const nextOilKm = numberValue(record.nextOilKm);

  const oilRemaining = nextOilKm - currentKm;
  const cleaningDays = daysSince(record.lastCleaningDate);
  const tireDays = daysSince(record.lastTirePressureDate);
  const lightsDays = daysSince(record.lastLightsCheckDate);
  const brakeDays = daysSince(record.lastBrakeCheckDate);

  if (
    oilRemaining <= 0 ||
    cleaningDays > 7 ||
    tireDays > 7 ||
    lightsDays > 14 ||
    brakeDays > 14
  ) {
    return "overdue";
  }

  if (
    oilRemaining <= 250 ||
    cleaningDays >= 5 ||
    tireDays >= 5 ||
    lightsDays >= 10 ||
    brakeDays >= 10
  ) {
    return "due_soon";
  }

  return "good";
}

function statusLabel(status: MaintenanceStatus) {
  if (status === "overdue") return "Needs attention";
  if (status === "due_soon") return "Due soon";
  return "Healthy";
}

function statusClasses(status: MaintenanceStatus) {
  if (status === "overdue") {
    return "border-red-400/25 bg-red-500/10 text-red-300";
  }

  if (status === "due_soon") {
    return "border-yellow-400/25 bg-yellow-500/10 text-yellow-300";
  }

  return "border-emerald-400/25 bg-emerald-500/10 text-emerald-300";
}

function getDefaultRecords(): MaintenanceRecord[] {
  return nexaFleet.map((vehicle) => ({
    vehicleCode: vehicle.codigo,
    currentKm: "",
    lastOilKm: "",
    nextOilKm: "",
    lastCleaningDate: "",
    lastTirePressureDate: "",
    lastLightsCheckDate: "",
    lastBrakeCheckDate: "",
    notes: "",
  }));
}

function loadMaintenanceRecords(): MaintenanceRecord[] {
  if (typeof window === "undefined") return getDefaultRecords();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const savedRecords = Array.isArray(saved) ? saved : [];

    return nexaFleet.map((vehicle) => {
      const existing = savedRecords.find(
        (record: MaintenanceRecord) => record.vehicleCode === vehicle.codigo
      );

      return {
        vehicleCode: vehicle.codigo,
        currentKm: existing?.currentKm || "",
        lastOilKm: existing?.lastOilKm || "",
        nextOilKm: existing?.nextOilKm || "",
        lastCleaningDate: existing?.lastCleaningDate || "",
        lastTirePressureDate: existing?.lastTirePressureDate || "",
        lastLightsCheckDate: existing?.lastLightsCheckDate || "",
        lastBrakeCheckDate: existing?.lastBrakeCheckDate || "",
        notes: existing?.notes || "",
      };
    });
  } catch {
    return getDefaultRecords();
  }
}

function saveMaintenanceRecords(records: MaintenanceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getVehicleName(vehicleCode: string) {
  const vehicle = nexaFleet.find((item) => item.codigo === vehicleCode);

  if (!vehicle) return vehicleCode;

  return `${vehicle.codigo} · ${vehicle.matricula} · ${vehicle.marca} ${vehicle.modelo}`;
}

function getVehicleShortName(vehicleCode: string) {
  const vehicle = nexaFleet.find((item) => item.codigo === vehicleCode);

  if (!vehicle) return vehicleCode;

  return `${vehicle.codigo} · ${vehicle.matricula}`;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [selectedVehicleCode, setSelectedVehicleCode] = useState("");

  useEffect(() => {
    const loadedRecords = loadMaintenanceRecords();
    setRecords(loadedRecords);
    setSelectedVehicleCode(loadedRecords[0]?.vehicleCode || "");
  }, []);

  const selectedRecord = useMemo(() => {
    return (
      records.find((record) => record.vehicleCode === selectedVehicleCode) ||
      records[0]
    );
  }, [records, selectedVehicleCode]);

  const summary = useMemo(() => {
    const statuses = records.map((record) => getMaintenanceStatus(record));

    return {
      total: records.length,
      healthy: statuses.filter((status) => status === "good").length,
      dueSoon: statuses.filter((status) => status === "due_soon").length,
      overdue: statuses.filter((status) => status === "overdue").length,
    };
  }, [records]);

  function updateRecord(
    vehicleCode: string,
    field: keyof MaintenanceRecord,
    value: string
  ) {
    setRecords((prev) => {
      const next = prev.map((record) =>
        record.vehicleCode === vehicleCode
          ? {
              ...record,
              [field]: value,
            }
          : record
      );

      saveMaintenanceRecords(next);

      return next;
    });
  }

  function quickMarkToday(vehicleCode: string, field: keyof MaintenanceRecord) {
    updateRecord(vehicleCode, field, todayIsoDate());
  }

  function setNextOilFromCurrent(vehicleCode: string) {
    const record = records.find((item) => item.vehicleCode === vehicleCode);

    if (!record) return;

    const currentKm = numberValue(record.currentKm);
    const nextOilKm = currentKm + 3000;

    setRecords((prev) => {
      const next = prev.map((item) =>
        item.vehicleCode === vehicleCode
          ? {
              ...item,
              lastOilKm: String(currentKm || ""),
              nextOilKm: String(nextOilKm || ""),
            }
          : item
      );

      saveMaintenanceRecords(next);

      return next;
    });
  }

  if (!selectedRecord) {
    return (
      <AdminShell>
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-white">
          Loading maintenance...
        </div>
      </AdminShell>
    );
  }

  const selectedStatus = getMaintenanceStatus(selectedRecord);
  const selectedCurrentKm = numberValue(selectedRecord.currentKm);
  const selectedNextOilKm = numberValue(selectedRecord.nextOilKm);
  const oilRemaining = selectedNextOilKm - selectedCurrentKm;

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
                Fleet Health
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
                Vehicle Maintenance
              </h2>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/55">
                Track kilometers, oil service, cleaning, tire pressure, lights,
                brakes and notes for every scooter. The system will show service
                reminders when kilometers or checks are due.
              </p>
            </div>

            <div
              className={`rounded-2xl border px-5 py-3 text-sm font-black ${statusClasses(
                selectedStatus
              )}`}
            >
              Selected: {statusLabel(selectedStatus)}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="Fleet"
            value={summary.total}
            tone="white"
            subtitle="Tracked vehicles"
          />
          <StatCard
            label="Healthy"
            value={summary.healthy}
            tone="emerald"
            subtitle="No urgent work"
          />
          <StatCard
            label="Due Soon"
            value={summary.dueSoon}
            tone="yellow"
            subtitle="Check shortly"
          />
          <StatCard
            label="Overdue"
            value={summary.overdue}
            tone="red"
            subtitle="Needs action"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
                  Vehicles
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  Fleet List
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {records.map((record) => {
                const status = getMaintenanceStatus(record);
                const isActive = record.vehicleCode === selectedVehicleCode;

                return (
                  <button
                    key={record.vehicleCode}
                    type="button"
                    onClick={() => setSelectedVehicleCode(record.vehicleCode)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-orange-400/30 bg-orange-500/10"
                        : "border-white/10 bg-white/[0.035] hover:bg-white/[0.055]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-white">
                          {getVehicleShortName(record.vehicleCode)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-white/38">
                          KM: {record.currentKm || "Not set"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusClasses(
                          status
                        )}`}
                      >
                        {statusLabel(status)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
                  Selected Vehicle
                </p>
                <h3 className="mt-2 text-3xl font-black text-white">
                  {getVehicleName(selectedRecord.vehicleCode)}
                </h3>
              </div>

              <span
                className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] ${statusClasses(
                  selectedStatus
                )}`}
              >
                {statusLabel(selectedStatus)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoCard
                title="Current KM"
                value={selectedRecord.currentKm || "Not set"}
                subtitle="Update after every rental"
              />
              <InfoCard
                title="Next Oil Service"
                value={
                  selectedRecord.nextOilKm
                    ? `${selectedRecord.nextOilKm} km`
                    : "Not set"
                }
                subtitle={
                  selectedRecord.nextOilKm
                    ? oilRemaining <= 0
                      ? "Service overdue"
                      : `${oilRemaining} km remaining`
                    : "Set next service km"
                }
              />
              <InfoCard
                title="Last Cleaning"
                value={selectedRecord.lastCleaningDate || "Not saved"}
                subtitle={`${daysSince(selectedRecord.lastCleaningDate)} days ago`}
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <MaintenanceInput
                label="Current Kilometers"
                value={selectedRecord.currentKm}
                placeholder="Example: 12850"
                onChange={(value) =>
                  updateRecord(selectedRecord.vehicleCode, "currentKm", value)
                }
              />

              <MaintenanceInput
                label="Last Oil Service KM"
                value={selectedRecord.lastOilKm}
                placeholder="Example: 10000"
                onChange={(value) =>
                  updateRecord(selectedRecord.vehicleCode, "lastOilKm", value)
                }
              />

              <MaintenanceInput
                label="Next Oil Service KM"
                value={selectedRecord.nextOilKm}
                placeholder="Example: 13000"
                onChange={(value) =>
                  updateRecord(selectedRecord.vehicleCode, "nextOilKm", value)
                }
              />

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setNextOilFromCurrent(selectedRecord.vehicleCode)}
                  className="w-full rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-4 text-sm font-black text-orange-300 transition hover:bg-orange-500/15"
                >
                  Set next oil +3000 km
                </button>
              </div>

              <DateCheckInput
                label="Last Cleaning"
                value={selectedRecord.lastCleaningDate}
                onChange={(value) =>
                  updateRecord(
                    selectedRecord.vehicleCode,
                    "lastCleaningDate",
                    value
                  )
                }
                onToday={() =>
                  quickMarkToday(selectedRecord.vehicleCode, "lastCleaningDate")
                }
              />

              <DateCheckInput
                label="Last Tire Pressure Check"
                value={selectedRecord.lastTirePressureDate}
                onChange={(value) =>
                  updateRecord(
                    selectedRecord.vehicleCode,
                    "lastTirePressureDate",
                    value
                  )
                }
                onToday={() =>
                  quickMarkToday(
                    selectedRecord.vehicleCode,
                    "lastTirePressureDate"
                  )
                }
              />

              <DateCheckInput
                label="Last Lights / Indicators Check"
                value={selectedRecord.lastLightsCheckDate}
                onChange={(value) =>
                  updateRecord(
                    selectedRecord.vehicleCode,
                    "lastLightsCheckDate",
                    value
                  )
                }
                onToday={() =>
                  quickMarkToday(
                    selectedRecord.vehicleCode,
                    "lastLightsCheckDate"
                  )
                }
              />

              <DateCheckInput
                label="Last Brake Check"
                value={selectedRecord.lastBrakeCheckDate}
                onChange={(value) =>
                  updateRecord(
                    selectedRecord.vehicleCode,
                    "lastBrakeCheckDate",
                    value
                  )
                }
                onToday={() =>
                  quickMarkToday(selectedRecord.vehicleCode, "lastBrakeCheckDate")
                }
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                Notes / Problems
              </label>
              <textarea
                value={selectedRecord.notes}
                onChange={(e) =>
                  updateRecord(
                    selectedRecord.vehicleCode,
                    "notes",
                    e.target.value
                  )
                }
                placeholder="Example: rear tire slightly low, left indicator checked, customer scratched mirror..."
                className="mt-2 min-h-[130px] w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/50"
              />
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  tone,
}: {
  label: string;
  value: number;
  subtitle: string;
  tone: "white" | "emerald" | "yellow" | "red";
}) {
  const styles = {
    white: "border-white/10 bg-white/[0.04] text-white/70",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
  };

  return (
    <div className={`rounded-[26px] border p-5 ${styles[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-4xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-white/38">{subtitle}</p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {title}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/38">{subtitle}</p>
    </div>
  );
}

function MaintenanceInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
        placeholder={placeholder}
        inputMode="numeric"
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/50"
      />
    </label>
  );
}

function DateCheckInput({
  label,
  value,
  onChange,
  onToday,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onToday: () => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </span>

      <div className="mt-2 flex gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4 text-sm font-bold text-white outline-none focus:border-orange-400/50"
        />

        <button
          type="button"
          onClick={onToday}
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/15"
        >
          Today
        </button>
      </div>
    </label>
  );
}