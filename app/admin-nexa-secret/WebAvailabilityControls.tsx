"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarOff,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Trash2,
  X,
} from "lucide-react";
import {
  getFleetByGroup,
  getFleetGroupDisplayName,
  nexaFleet,
  type NexaVehicle,
} from "../../lib/nexaFleet";

type WebAvailabilityBlock = {
  id: string;
  block_type: "fleet_group" | "vehicle";
  fleet_group: string;
  vehicle_code: string | null;
  quantity: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  note: string;
  created_at: string;
};

type EditorScope =
  | {
      type: "fleet_group";
    }
  | {
      type: "vehicle";
      vehicle: NexaVehicle;
    };

type AvailabilityForm = {
  fleetGroup: string;
  quantity: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  note: string;
};

const FLEET_GROUPS = Array.from(
  new Set(
    nexaFleet
      .filter((vehicle) => vehicle.tipo === "Scooter 125cc")
      .map((vehicle) => vehicle.fleetGroup)
  )
);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function timeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function createDefaultForm(scope: EditorScope): AvailabilityForm {
  const start = new Date();
  start.setSeconds(0, 0);

  const minutes = start.getMinutes();
  const roundedMinutes = minutes === 0 ? 0 : minutes <= 30 ? 30 : 60;
  start.setMinutes(roundedMinutes);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    fleetGroup:
      scope.type === "vehicle"
        ? scope.vehicle.fleetGroup
        : "piaggio_liberty_125",
    quantity: 1,
    startDate: dateInputValue(start),
    startTime: timeInputValue(start),
    endDate: dateInputValue(end),
    endTime: timeInputValue(end),
    note: "",
  };
}

function cleanTime(value: string) {
  return String(value || "").slice(0, 5);
}

function blockEnd(block: WebAvailabilityBlock) {
  return new Date(`${block.end_date}T${cleanTime(block.end_time)}`);
}

function formatBlockWindow(block: WebAvailabilityBlock) {
  const start = new Date(
    `${block.start_date}T${cleanTime(block.start_time)}`
  );
  const end = new Date(`${block.end_date}T${cleanTime(block.end_time)}`);

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${block.start_date} ${cleanTime(block.start_time)} – ${block.end_date} ${cleanTime(
      block.end_time
    )}`;
  }

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

function getBlockTitle(block: WebAvailabilityBlock) {
  if (block.block_type === "vehicle") {
    const vehicle = nexaFleet.find(
      (item) => item.codigo === block.vehicle_code
    );

    return vehicle
      ? `${vehicle.codigo} · ${vehicle.marca} ${vehicle.modelo}`
      : block.vehicle_code || "Specific vehicle";
  }

  return `${block.quantity} × ${getFleetGroupDisplayName(block.fleet_group)}`;
}

function WebAvailabilityEditor({
  scope,
  onClose,
}: {
  scope: EditorScope;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AvailabilityForm>(() =>
    createDefaultForm(scope)
  );
  const [blocks, setBlocks] = useState<WebAvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedFleet = useMemo(
    () => getFleetByGroup(form.fleetGroup),
    [form.fleetGroup]
  );

  const visibleBlocks = useMemo(() => {
    const now = new Date();

    return blocks.filter((block) => {
      if (blockEnd(block).getTime() < now.getTime()) return false;

      if (scope.type === "vehicle") {
        return block.vehicle_code === scope.vehicle.codigo;
      }

      return block.fleet_group === form.fleetGroup;
    });
  }, [blocks, form.fleetGroup, scope]);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/web-availability", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load web availability.");
      }

      setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
    } catch (caught: any) {
      setError(caught?.message || "Failed to load web availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBlocks();
  }, [loadBlocks]);

  async function createBlock() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/web-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockType: scope.type,
          fleetGroup:
            scope.type === "vehicle"
              ? scope.vehicle.fleetGroup
              : form.fleetGroup,
          vehicleCode:
            scope.type === "vehicle" ? scope.vehicle.codigo : null,
          quantity: scope.type === "vehicle" ? 1 : form.quantity,
          startDate: form.startDate,
          startTime: form.startTime,
          endDate: form.endDate,
          endTime: form.endTime,
          note: form.note,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to block web availability.");
      }

      setSuccess("Availability was blocked on the website immediately.");
      setForm((current) => ({
        ...current,
        note: "",
      }));
      await loadBlocks();
    } catch (caught: any) {
      setError(caught?.message || "Failed to block web availability.");
    } finally {
      setSaving(false);
    }
  }

  async function removeBlock(block: WebAvailabilityBlock) {
    const confirmed = window.confirm(
      `Remove this web block and release its manual restriction?\n\n${getBlockTitle(
        block
      )}\n${formatBlockWindow(block)}`
    );

    if (!confirmed) return;

    setDeletingId(block.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/web-availability?id=${encodeURIComponent(block.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to remove web block.");
      }

      setSuccess(
        "Manual block removed. Real bookings and reservations remain protected."
      );
      await loadBlocks();
    } catch (caught: any) {
      setError(caught?.message || "Failed to remove web block.");
    } finally {
      setDeletingId("");
    }
  }

  const title =
    scope.type === "vehicle"
      ? `Set ${scope.vehicle.codigo} web availability`
      : "Block vehicle type availability";

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close availability editor"
      />

      <div className="relative z-10 max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0B0D12] shadow-[0_30px_120px_rgba(0,0,0,0.72)] sm:rounded-3xl">
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-white/10 bg-[#0B0D12]/95 p-5 backdrop-blur-xl sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
              Web availability
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
            <p className="mt-2 max-w-xl text-xs font-bold leading-5 text-white/45">
              Manual blocks are added on top of real bookings and reservations.
              Removing a block never releases a vehicle that is genuinely booked.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition hover:bg-white/[0.1] hover:text-white"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <section className="rounded-2xl border border-orange-400/20 bg-orange-500/[0.07] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
                <LockKeyhole size={19} />
              </span>
              <div>
                <h3 className="text-lg font-black text-white">
                  Block on the customer website
                </h3>
                <p className="text-xs font-bold text-white/45">
                  Select the exact period that must not be sold online.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {scope.type === "fleet_group" ? (
                <label className="sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                    Vehicle type
                  </span>
                  <select
                    value={form.fleetGroup}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        fleetGroup: event.target.value,
                        quantity: 1,
                      }))
                    }
                    className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-black text-white outline-none transition focus:border-orange-400/60"
                  >
                    {FLEET_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {getFleetGroupDisplayName(group)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-black text-white">
                    {scope.vehicle.codigo} · {scope.vehicle.matricula}
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/45">
                    {scope.vehicle.marca} {scope.vehicle.modelo}
                  </p>
                </div>
              )}

              {scope.type === "fleet_group" ? (
                <label className="sm:col-span-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                    Quantity to remove from online stock
                  </span>
                  <select
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        quantity: Number(event.target.value),
                      }))
                    }
                    className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-black text-white outline-none transition focus:border-orange-400/60"
                  >
                    {Array.from(
                      { length: Math.max(1, selectedFleet.length) },
                      (_, index) => index + 1
                    ).map((quantity) => (
                      <option key={quantity} value={quantity}>
                        {quantity} vehicle{quantity === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <DateTimeFields
                label="Blocked from"
                date={form.startDate}
                time={form.startTime}
                onDateChange={(value) =>
                  setForm((current) => ({ ...current, startDate: value }))
                }
                onTimeChange={(value) =>
                  setForm((current) => ({ ...current, startTime: value }))
                }
              />

              <DateTimeFields
                label="Blocked until"
                date={form.endDate}
                time={form.endTime}
                onDateChange={(value) =>
                  setForm((current) => ({ ...current, endDate: value }))
                }
                onTimeChange={(value) =>
                  setForm((current) => ({ ...current, endTime: value }))
                }
              />

              <label className="sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                  Note (optional)
                </span>
                <input
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  maxLength={300}
                  placeholder="Example: Paper booking for two scooters"
                  className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-orange-400/60"
                />
              </label>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
                <span>{success}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void createBlock()}
              disabled={saving}
              className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_38px_rgba(249,115,22,0.22)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <CalendarOff size={18} />
              )}
              {saving ? "Saving..." : "Block website availability"}
            </button>
          </section>

          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  Scheduled restrictions
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  Current and upcoming blocks
                </h3>
              </div>
              <button
                type="button"
                onClick={() => void loadBlocks()}
                className="text-xs font-black text-white/50 transition hover:text-white"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="flex min-h-28 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-white/45">
                  <LoaderCircle className="animate-spin" size={22} />
                </div>
              ) : visibleBlocks.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm font-bold text-white/45">
                  No current or upcoming manual blocks for this selection.
                </div>
              ) : (
                visibleBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-white">
                          {getBlockTitle(block)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-white/50">
                          {formatBlockWindow(block)}
                        </p>
                        {block.note ? (
                          <p className="mt-2 text-xs font-semibold text-white/38">
                            {block.note}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => void removeBlock(block)}
                        disabled={deletingId === block.id}
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-60"
                      >
                        {deletingId === block.id ? (
                          <LoaderCircle className="animate-spin" size={15} />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Make available
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DateTimeFields({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
}: {
  label: string;
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
        {label}
      </legend>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_120px] gap-2">
        <input
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          className="min-h-12 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-black text-white outline-none focus:border-orange-400/60 [color-scheme:dark]"
        />
        <input
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
          className="min-h-12 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm font-black text-white outline-none focus:border-orange-400/60 [color-scheme:dark]"
        />
      </div>
    </fieldset>
  );
}

export function FleetWebAvailabilityButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-4 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-[0_12px_30px_rgba(249,115,22,0.18)] transition hover:brightness-110"
      >
        <CalendarOff size={16} />
        Block vehicle quantity
      </button>

      {open ? (
        <WebAvailabilityEditor
          scope={{ type: "fleet_group" }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function VehicleWebAvailabilityButton({
  vehicleCode,
}: {
  vehicleCode: string;
}) {
  const [open, setOpen] = useState(false);
  const vehicle = nexaFleet.find((item) => item.codigo === vehicleCode);

  if (!vehicle) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-4 text-[10px] font-black uppercase tracking-[0.1em] text-orange-200 transition hover:border-orange-400/45 hover:bg-orange-500/20"
      >
        <CalendarOff size={16} />
        Set web availability
      </button>

      {open ? (
        <WebAvailabilityEditor
          scope={{ type: "vehicle", vehicle }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}