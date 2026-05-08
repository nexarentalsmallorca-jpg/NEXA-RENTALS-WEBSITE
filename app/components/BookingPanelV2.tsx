"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type RentalPlan = "half" | "full" | null;
type ActiveField = "pickup" | "dropoff";
type DateRange = { from?: Date; to?: Date };

type SeasonalPricing = {
  seasonName: string;
  halfDayPrice: number;
  halfDayOldPrice: number;
  fullDayOldPrice: number;
  fullDayPricing: Record<number, number>;
};

type BookingPanelV2Props = {
  vehicleName?: string;
  checkoutBasePath?: string;
  onPricingChange?: (pricing: SeasonalPricing) => void;
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
};

function getSeasonalPricing(date = new Date()): SeasonalPricing {
  const month = date.getMonth();

  if (month === 4 || month === 5) {
    return {
      seasonName: "Early Season",
      halfDayPrice: 34,
      halfDayOldPrice: 45,
      fullDayOldPrice: 55,
      fullDayPricing: {
        1: 42,
        2: 40,
        3: 39,
        4: 38,
        5: 37,
        6: 36,
      },
    };
  }

  if (month === 6 || month === 7) {
    return {
      seasonName: "Peak Season",
      halfDayPrice: 39,
      halfDayOldPrice: 45,
      fullDayOldPrice: 55,
      fullDayPricing: {
        1: 49,
        2: 47,
        3: 46,
        4: 45,
        5: 44,
        6: 43,
      },
    };
  }

  if (month === 8 || month === 9) {
    return {
      seasonName: "Late Season",
      halfDayPrice: 36,
      halfDayOldPrice: 45,
      fullDayOldPrice: 55,
      fullDayPricing: {
        1: 45,
        2: 43,
        3: 42,
        4: 41,
        5: 40,
        6: 39,
      },
    };
  }

  return {
    seasonName: "Winter Season",
    halfDayPrice: 32,
    halfDayOldPrice: 45,
    fullDayOldPrice: 55,
    fullDayPricing: {
      1: 39,
      2: 37,
      3: 36,
      4: 35,
      5: 34,
      6: 33,
    },
  };
}

const ORANGE = "#FF6A00";
const BLUE = "#00D9FF";
const PURPLE = "#8B5CF6";
const PANEL_BG = "#F3F3F4";
const CARD_BG = "#FFFFFF";
const SOFT = "rgba(17,17,17,0.10)";
const MUTED = "rgba(17,17,17,0.55)";
const DARK = "#0E1117";
const DEFAULT_PICKUP_LOCATION = "Magaluf (Carrer Galeón 13)";
const WHATSAPP_NUMBER = "34971482342";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, days: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayDiff(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86400000);
}

function fmtDate(d?: Date) {
  if (!d) return "Select date";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTimeLabel(t: string) {
  const [hh, mm] = t.split(":").map(Number);
  const date = new Date();
  date.setHours(hh, mm, 0, 0);
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildTimeOptions(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number
) {
  const out: string[] = [];
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  for (let m = start; m <= end; m += 30) {
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    out.push(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }

  return out;
}

function buildMonthGrid(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const last = endOfMonth(viewMonth);
  const startDow = (first.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);

  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getRate(days: number, pricing: SeasonalPricing) {
  if (days <= 1) return pricing.fullDayPricing[1];
  if (days >= 6) return pricing.fullDayPricing[6];
  return pricing.fullDayPricing[days];
}

function normalizeVehicleName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveCheckoutVehicleId(vehicleName: string) {
  const normalized = normalizeVehicleName(vehicleName);

  if (normalized.includes("piaggio liberty 125")) return "s2";
  if (normalized.includes("sym symphony 125")) return "s3";
  if (normalized.includes("zontes 125e")) return "s1";

  return "s2";
}

function resolveAvailabilityVehicleId(vehicleName: string) {
  const normalized = normalizeVehicleName(vehicleName);

  if (normalized.includes("sym symphony 125")) return "N8";

  return resolveCheckoutVehicleId(vehicleName);
}

function buildWhatsAppAvailabilityLink(
  vehicleName: string,
  plan: RentalPlan,
  from?: Date
) {
  const text = `Hi NEXA Rentals, I would like to rent more than one scooter${
    plan ? ` (${plan === "half" ? "Half Day" : "Full Day"})` : ""
  }${
    from ? ` on ${fmtDate(from)}` : ""
  }. Can you please confirm availability for ${vehicleName}?`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 2V5M16 2V5M3 9H21M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3 4 5 4Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function FieldCard({
  label,
  value,
  onClick,
  disabled,
  muted,
  icon,
  buttonRef,
  highlight,
}: {
  label: string;
  value: string;
  onClick?: () => void;
  disabled?: boolean;
  muted?: boolean;
  icon: React.ReactNode;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  highlight?: boolean;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "nexa-field-card flex w-full items-center justify-between rounded-[15px] border px-[clamp(10px,0.8vw,12px)] py-[clamp(9px,0.7vw,10px)] text-left transition-all duration-200",
        disabled
          ? "cursor-not-allowed opacity-55"
          : "cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] active:scale-[0.985]",
      ].join(" ")}
      style={{
        background: muted ? "#ECECEE" : CARD_BG,
        borderColor: highlight ? "rgba(255,106,0,0.40)" : SOFT,
        boxShadow: highlight ? "0 0 0 3px rgba(255,106,0,0.12)" : "none",
      }}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="nexa-field-icon flex h-[clamp(30px,2.1vw,32px)] w-[clamp(30px,2.1vw,32px)] shrink-0 items-center justify-center rounded-full bg-[#E9E9EC] text-[#111]">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="nexa-field-label truncate text-[clamp(8px,0.72vw,10px)] font-extrabold uppercase tracking-[0.12em] text-black/45">
            {label}
          </div>
          <div className="nexa-field-value mt-0.5 truncate text-[clamp(12px,0.95vw,13px)] font-black text-black">
            {value}
          </div>
        </div>
      </div>

      <span className="nexa-field-status shrink-0 pl-2 text-[clamp(9px,0.75vw,11px)] font-bold text-black/45">
        {disabled && !muted ? "Locked" : muted ? "Auto" : "Select"}
      </span>
    </button>
  );
}

function DropdownCard({
  title,
  options,
  activeValue,
  onSelect,
}: {
  title: string;
  options: string[];
  activeValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="absolute left-0 top-[calc(100%+8px)] z-[999] w-full overflow-hidden rounded-[16px] border bg-white shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
      <div className="border-b px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.12em] text-black/55">
        {title}
      </div>

      <div className="max-h-[min(220px,34vh)] overflow-auto p-2">
        {options.map((option) => {
          const active = option === activeValue;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className="mb-1 w-full cursor-pointer rounded-[11px] px-3 py-2 text-left text-[12px] font-black transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.985]"
              style={{
                background: active
                  ? "linear-gradient(135deg,#FF6A00 0%,#FF8A2B 100%)"
                  : "#F3F3F4",
                color: active ? "#FFFFFF" : "#111111",
                boxShadow: active ? "0 10px 24px rgba(255,106,0,0.22)" : "none",
              }}
            >
              {formatTimeLabel(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniMonth({
  month,
  range,
  plan,
  activeField,
  minBookableDate,
  onPick,
}: {
  month: Date;
  range: DateRange;
  plan: RentalPlan;
  activeField: ActiveField;
  minBookableDate: Date;
  onPick: (day: Date) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(month), [month]);

  const weekdays = useMemo(() => {
    const baseMonday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }).map((_, i) =>
      new Intl.DateTimeFormat("en", { weekday: "short" }).format(
        new Date(
          baseMonday.getFullYear(),
          baseMonday.getMonth(),
          baseMonday.getDate() + i
        )
      )
    );
  }, []);

  return (
    <div className="nexa-calendar-month-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
            Rental calendar
          </div>
          <div className="mt-1 text-[clamp(23px,3vw,30px)] font-black tracking-[-0.05em] text-black">
            {month.toLocaleString("en", { month: "long", year: "numeric" })}
          </div>
        </div>

        <div className="hidden rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black/45 sm:inline-flex">
          From tomorrow
        </div>
      </div>

      <div className="mb-3 grid grid-cols-7 text-center text-[11px] font-black text-black/40">
        {weekdays.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[clamp(6px,1.4vw,10px)]">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="h-[clamp(38px,7vw,48px)]" />;

          const isUnavailable = startOfDay(day) < minBookableDate;
          const isStart = !!range.from && isSameDay(day, range.from);
          const isEnd = !!range.to && isSameDay(day, range.to);

          const inRange =
            !!range.from &&
            !!range.to &&
            startOfDay(day) >= startOfDay(range.from) &&
            startOfDay(day) <= startOfDay(range.to);

          let disabled = isUnavailable;

          if (
            plan === "full" &&
            activeField === "dropoff" &&
            range.from &&
            startOfDay(day) < startOfDay(addDays(range.from, 1))
          ) {
            disabled = true;
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onPick(day)}
              className={[
                "relative h-[clamp(38px,7vw,48px)] overflow-hidden rounded-[15px] text-[13px] font-black transition-all duration-200",
                disabled
                  ? "cursor-not-allowed text-black/18"
                  : "cursor-pointer text-black hover:-translate-y-[2px] hover:shadow-[0_14px_26px_rgba(255,106,0,0.16)] active:scale-[0.96]",
              ].join(" ")}
              style={{
                background:
                  isStart || isEnd
                    ? `linear-gradient(135deg, ${ORANGE} 0%, ${PURPLE} 55%, ${BLUE} 120%)`
                    : inRange
                    ? "linear-gradient(135deg,rgba(255,106,0,0.18),rgba(139,92,246,0.10))"
                    : disabled
                    ? "linear-gradient(180deg,#F4F4F5 0%,#ECECEF 100%)"
                    : "linear-gradient(180deg,#FFFFFF 0%,#F4F4F7 100%)",
                color: isStart || isEnd ? "#fff" : undefined,
                boxShadow:
                  isStart || isEnd
                    ? "0 16px 32px rgba(255,106,0,0.25), 0 0 0 3px rgba(255,106,0,0.12)"
                    : "inset 0 1px 0 rgba(255,255,255,0.85)",
                border:
                  isStart || isEnd
                    ? "1px solid rgba(255,255,255,0.22)"
                    : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span className="relative z-10">{day.getDate()}</span>
              {(isStart || isEnd) && (
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_48%)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlanCard({
  selected,
  label,
  badge,
  oldPrice,
  newPrice,
  line1,
  line2,
  chip,
  onClick,
  strong,
  step,
  enableAiCopilot = true,
}: {
  selected: boolean;
  label: string;
  badge: string;
  oldPrice: string;
  newPrice: string;
  line1: string;
  line2: string;
  chip: string;
  onClick: () => void;
  strong?: boolean;
  step: "plan-half-day" | "plan-full-day";
  enableAiCopilot?: boolean;
}) {
  const baseBg = strong
    ? "linear-gradient(180deg,#FFFFFF 0%,#FFF9F3 100%)"
    : "linear-gradient(180deg,#FFFFFF 0%,#FAFAFA 100%)";

  const hoverBg = strong
    ? "linear-gradient(135deg,#FFF7F0 0%,#FFE4CC 100%)"
    : "linear-gradient(135deg,#FAFAFA 0%,#F3EEE8 100%)";

  const selectedBg = strong
    ? "linear-gradient(135deg,#FFF2E5 0%,#FFD8B4 100%)"
    : "linear-gradient(135deg,#FFF8F1 0%,#F1E7DA 100%)";

  return (
    <button
      type="button"
      data-nexa-step={enableAiCopilot ? step : undefined}
      data-nexa-copilot={enableAiCopilot ? "desktop" : undefined}
      onClick={onClick}
      className={[
        "nexa-plan-card group relative w-full overflow-hidden rounded-[18px] border px-[clamp(9px,0.85vw,12px)] py-[clamp(10px,0.95vw,12px)] text-left transition-all duration-300",
        "cursor-pointer hover:-translate-y-[3px] active:scale-[0.97]",
      ].join(" ")}
      style={{
        background: selected ? selectedBg : baseBg,
        borderColor: selected
          ? "rgba(255,106,0,0.70)"
          : strong
          ? "rgba(255,106,0,0.44)"
          : SOFT,
        boxShadow: selected
          ? "0 0 0 3px rgba(255,106,0,0.14), 0 18px 34px rgba(255,106,0,0.18)"
          : strong
          ? "0 10px 24px rgba(255,106,0,0.08)"
          : "0 6px 16px rgba(0,0,0,0.05)",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = selected ? selectedBg : baseBg;
      }}
    >
      {selected && (
        <div
          className="pointer-events-none absolute inset-[6px] rounded-[14px]"
          style={{
            border: "2px solid rgba(255,106,0,0.35)",
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.18),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div
          className="nexa-plan-badge inline-flex rounded-full px-2.5 py-1 text-[clamp(7px,0.6vw,8px)] font-black uppercase tracking-[0.08em] text-white"
          style={{
            background: "linear-gradient(90deg,#111111 0%,#2A2A2A 100%)",
            boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
          }}
        >
          {badge}
        </div>

        <div className="nexa-plan-price-row mt-2 flex items-end gap-2">
          <span className="nexa-plan-old text-[clamp(13px,1vw,15px)] font-black text-black/28 line-through">
            {oldPrice}
          </span>
          <span
            className="nexa-plan-new text-[clamp(26px,2.15vw,30px)] font-black leading-none transition-all duration-300 group-hover:scale-[1.06]"
            style={{
              color: strong || selected ? ORANGE : "#111111",
              textShadow: selected ? "0 8px 20px rgba(255,106,0,0.18)" : "none",
            }}
          >
            {newPrice}
          </span>
        </div>

        <div className="nexa-plan-label mt-1 text-[clamp(11px,0.95vw,13px)] font-black uppercase tracking-[0.04em] text-[#111111]">
          {label}
        </div>

        <div className="nexa-plan-lines mt-2 text-[clamp(9px,0.74vw,10px)] font-semibold leading-4 text-black/58">
          {line1}
          <br />
          {line2}
        </div>

        <div
          className="nexa-plan-chip mt-2 inline-flex items-center rounded-full border px-2 py-1 text-[clamp(8px,0.66vw,9px)] font-black uppercase tracking-[0.06em]"
          style={{
            borderColor: strong ? "rgba(255,106,0,0.22)" : "rgba(17,17,17,0.10)",
            background: strong ? "rgba(255,255,255,0.74)" : "rgba(17,17,17,0.03)",
            color: strong ? "#C85A00" : "rgba(17,17,17,0.58)",
          }}
        >
          {chip}
        </div>
      </div>
    </button>
  );
}

export default function BookingPanelV2({
  vehicleName = "Piaggio Liberty 125",
  checkoutBasePath = "/checkout",
  onPricingChange,
}: BookingPanelV2Props) {
  const router = useRouter();

  const minBookableDate = useMemo(() => addDays(startOfDay(new Date()), 1), []);
  const pickupHalfOptions = useMemo(() => buildTimeOptions(9, 30, 14, 0), []);
  const pickupFullOptions = useMemo(() => buildTimeOptions(9, 30, 20, 0), []);
  const returnHalfOptions = useMemo(() => ["19:00", "19:30", "20:00"], []);

  const [plan, setPlan] = useState<RentalPlan>(null);
  const [range, setRange] = useState<DateRange>({});
  const [pickupTime, setPickupTime] = useState("10:00");
  const [halfReturnTime, setHalfReturnTime] = useState("20:00");
  const [notice, setNotice] = useState("");
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [enableAiCopilot, setEnableAiCopilot] = useState(false);

  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");

  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [returnTimeOpen, setReturnTimeOpen] = useState(false);

  const pickupBtnRef = useRef<HTMLButtonElement | null>(null);
  const returnBtnRef = useRef<HTMLButtonElement | null>(null);
  const pickupDropdownRef = useRef<HTMLDivElement | null>(null);
  const returnDropdownRef = useRef<HTMLDivElement | null>(null);

  const [scrollStartMonth, setScrollStartMonth] = useState(startOfMonth(minBookableDate));
  const [viewMonth, setViewMonth] = useState(startOfMonth(minBookableDate));
  const [monthsAhead, setMonthsAhead] = useState(12);
  const monthsScrollRef = useRef<HTMLDivElement | null>(null);
  const monthWrapRefs = useRef<Array<HTMLDivElement | null>>([]);

  const onPricingChangeRef = useRef(onPricingChange);

  useEffect(() => {
    onPricingChangeRef.current = onPricingChange;
  }, [onPricingChange]);

  useEffect(() => {
    const mq = window.matchMedia(
      "(min-width: 768px) and (hover: hover) and (pointer: fine)"
    );

    const update = () => {
      setEnableAiCopilot(mq.matches);
    };

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  const checkoutVehicleId = useMemo(
    () => resolveCheckoutVehicleId(vehicleName),
    [vehicleName]
  );

  const availabilityVehicleId = useMemo(
    () => resolveAvailabilityVehicleId(vehicleName),
    [vehicleName]
  );

  const pickupOptions = plan === "half" ? pickupHalfOptions : pickupFullOptions;

  const activePricing = useMemo(() => {
    return getSeasonalPricing(range.from || minBookableDate);
  }, [range.from, minBookableDate]);

  useEffect(() => {
    onPricingChangeRef.current?.(activePricing);
  }, [activePricing]);

  const monthsList = useMemo(
    () =>
      Array.from({ length: monthsAhead + 1 }, (_, i) =>
        addMonths(scrollStartMonth, i)
      ),
    [scrollStartMonth, monthsAhead]
  );

  const fullDayCount = useMemo(() => {
    if (plan !== "full" || !range.from || !range.to) return 0;
    return Math.max(1, dayDiff(range.from, range.to));
  }, [plan, range.from, range.to]);

  const fullDayRate = useMemo(() => {
    if (plan !== "full" || !fullDayCount) {
      return activePricing.fullDayPricing[1];
    }

    return getRate(fullDayCount, activePricing);
  }, [plan, fullDayCount, activePricing]);

  const returnDate = plan === "half" ? range.from : range.to;
  const returnTime = plan === "half" ? halfReturnTime : pickupTime;

  const finalTotal = useMemo(() => {
    if (plan === "half") return activePricing.halfDayPrice;
    if (plan === "full" && fullDayCount > 0) return fullDayRate * fullDayCount;
    return 0;
  }, [plan, fullDayCount, fullDayRate, activePricing]);

  const saveAmount = useMemo(() => {
    if (plan === "half") {
      return activePricing.halfDayOldPrice - activePricing.halfDayPrice;
    }

    if (plan === "full" && fullDayCount > 0) {
      return activePricing.fullDayOldPrice * fullDayCount - finalTotal;
    }

    return 0;
  }, [plan, fullDayCount, finalTotal, activePricing]);

  const whatsappAvailabilityHref = useMemo(() => {
    return buildWhatsAppAvailabilityLink(vehicleName, plan, range.from);
  }, [vehicleName, plan, range.from]);

  const compactSummary = useMemo(() => {
    if (plan === "half" && range.from) {
      return `Half Day • ${fmtDate(range.from)} • €${activePricing.halfDayPrice}`;
    }

    if (plan === "full" && range.from && range.to && fullDayCount > 0) {
      return `${fullDayCount} Day${
        fullDayCount > 1 ? "s" : ""
      } • €${fullDayRate}/day • €${finalTotal}`;
    }

    return "Choose plan to begin";
  }, [
    plan,
    range.from,
    range.to,
    fullDayCount,
    fullDayRate,
    finalTotal,
    activePricing,
  ]);

  const hasCompleteRentalSelection = useMemo(() => {
    if (plan === "half") {
      return !!range.from && !!pickupTime && !!halfReturnTime;
    }

    if (plan === "full") {
      return !!range.from && !!range.to && fullDayCount >= 1 && fullDayCount <= 6;
    }

    return false;
  }, [plan, range.from, range.to, fullDayCount, pickupTime, halfReturnTime]);

  const availabilityConfirmed =
    availability?.ok === true && availability.available === true;

  const isUnavailable =
    availability?.ok === true && availability.available === false;

  const canCheckout = useMemo(() => {
    if (!hasCompleteRentalSelection) return false;
    if (isCheckingAvailability) return false;
    if (!availabilityConfirmed) return false;
    if (isUnavailable) return false;

    return true;
  }, [
    hasCompleteRentalSelection,
    isCheckingAvailability,
    availabilityConfirmed,
    isUnavailable,
  ]);

  useEffect(() => {
    setAvailability(null);
    setNotice("");
  }, [vehicleName, plan, range.from, range.to, pickupTime, halfReturnTime]);

  useEffect(() => {
    if (!hasCompleteRentalSelection || !plan || !range.from || !returnDate) {
      setIsCheckingAvailability(false);
      return;
    }

    let cancelled = false;

    async function checkAvailability() {
      setIsCheckingAvailability(true);

      try {
        const selectedFrom = range.from;
        const selectedTo = returnDate;

        if (!selectedFrom || !selectedTo || !plan) {
          if (!cancelled) {
            setAvailability(null);
            setIsCheckingAvailability(false);
          }
          return;
        }

        const params = new URLSearchParams({
          vehicleId: String(availabilityVehicleId),
          vehicleName: String(vehicleName),
          plan: String(plan),
          from: toISODate(selectedFrom),
          to: toISODate(selectedTo),
          pickupTime: String(pickupTime),
          dropoffTime: String(returnTime),
        });

        const response = await fetch(
          `/api/admin/bookings/availability?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setAvailability({
              ok: false,
              available: false,
              message:
                "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
            });
          }
          return;
        }

        const data = (await response.json()) as AvailabilityResult;

        if (!cancelled) {
          setAvailability(data);
        }
      } catch {
        if (!cancelled) {
          setAvailability({
            ok: false,
            available: false,
            message:
              "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAvailability(false);
        }
      }
    }

    const timeout = window.setTimeout(checkAvailability, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    hasCompleteRentalSelection,
    availabilityVehicleId,
    vehicleName,
    plan,
    range.from,
    returnDate,
    pickupTime,
    returnTime,
  ]);

  function openCalendar(which: ActiveField) {
    if (!plan) {
      setNotice("Please choose Half Day or Full Day first.");
      return;
    }

    if (plan === "half" && which === "dropoff") {
      setNotice("For Half Day, drop-off date is the same as pickup date.");
      return;
    }

    const anchorDate =
      which === "pickup"
        ? range.from || minBookableDate
        : range.to || range.from || minBookableDate;

    const anchorMonth = startOfMonth(anchorDate);

    setActiveField(which);
    setNotice("");
    setPickupTimeOpen(false);
    setReturnTimeOpen(false);
    setScrollStartMonth(anchorMonth);
    setViewMonth(anchorMonth);
    setMonthsAhead(12);
    setCalendarOpen(true);
  }

  function handlePlanSelect(nextPlan: Exclude<RentalPlan, null>) {
    setPlan(nextPlan);
    setRange({});
    setNotice("");
    setShowPriceDetails(false);
    setAvailability(null);
    setPickupTime("10:00");
    setHalfReturnTime("20:00");
    setPickupTimeOpen(false);
    setReturnTimeOpen(false);
    setIsCheckingAvailability(false);

    window.setTimeout(() => {
      setActiveField("pickup");
      setScrollStartMonth(startOfMonth(minBookableDate));
      setViewMonth(startOfMonth(minBookableDate));
      setMonthsAhead(12);
      setCalendarOpen(true);
    }, 60);
  }

  function onPickDate(day: Date) {
    if (startOfDay(day) < minBookableDate || !plan) return;

    setAvailability(null);
    setIsCheckingAvailability(false);

    if (plan === "half") {
      setRange({ from: day, to: day });
      setCalendarOpen(false);
      setNotice("");

      window.setTimeout(() => {
        setPickupTimeOpen(true);
      }, 150);

      return;
    }

    if (plan === "full") {
      if (activeField === "pickup") {
        setRange({ from: day, to: undefined });
        setActiveField("dropoff");
        setNotice("Now select your drop-off date. Maximum rental is 6 days.");
        return;
      }

      if (!range.from) return;

      const minDrop = addDays(range.from, 1);
      const maxDrop = addDays(range.from, 6);

      if (startOfDay(day) < startOfDay(minDrop)) {
        setNotice("Full Day booking must be at least 24 hours.");
        return;
      }

      if (startOfDay(day) > startOfDay(maxDrop)) {
        setNotice("Maximum online rental is 6 days.");
        return;
      }

      setRange({ from: range.from, to: day });
      setNotice("");
      setCalendarOpen(false);

      window.setTimeout(() => {
        setPickupTimeOpen(true);
      }, 150);

      return;
    }
  }

  function onProceed() {
    if (isCheckingAvailability) {
      setNotice("Checking vehicle availability. Please wait a moment.");
      return;
    }

    if (isUnavailable) {
      setNotice(
        availability?.message ||
          "This vehicle is not available for the selected date/time. Please choose another date or time."
      );
      return;
    }

    if (!availabilityConfirmed) {
      setNotice(
        availability?.message ||
          "Live availability must be confirmed before checkout. Please wait a moment."
      );
      return;
    }

    if (!canCheckout || !range.from) {
      setNotice("Please complete your booking details first.");
      return;
    }

    const resolvedReturnDate = returnDate || range.from;
    const resolvedDays = plan === "half" ? 1 : fullDayCount;
    const resolvedRate =
      plan === "half" ? activePricing.halfDayPrice : fullDayRate;

    const params = new URLSearchParams({
      vehicleId: checkoutVehicleId,
      vehicle: vehicleName,
      pickupLocation: DEFAULT_PICKUP_LOCATION,
      from: toISODate(range.from),
      to: toISODate(resolvedReturnDate),
      pickupTime,
      dropoffTime: returnTime,
      plan: plan || "",
      total: String(finalTotal),
      days: String(resolvedDays),
      rate: String(resolvedRate),
      availabilityChecked: "true",
      availabilityVehicleId,
      availableCount:
        typeof availability?.availableCount === "number"
          ? String(availability.availableCount)
          : "",
      onlineFleetNotice:
        "For more than one scooter, we recommend booking via WhatsApp so our team can confirm availability first.",
    });

    router.push(`${checkoutBasePath}?${params.toString()}`);
  }

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (pickupBtnRef.current?.contains(target)) return;
      if (returnBtnRef.current?.contains(target)) return;
      if (pickupDropdownRef.current?.contains(target)) return;
      if (returnDropdownRef.current?.contains(target)) return;

      setPickupTimeOpen(false);
      setReturnTimeOpen(false);
    }

    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (!calendarOpen) return;

    const t = window.setTimeout(() => {
      monthsScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
      setViewMonth(scrollStartMonth);

      const panel = document.querySelector(".nexa-booking-panel");
      panel?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);

    return () => {
      window.clearTimeout(t);
    };
  }, [calendarOpen, scrollStartMonth]);

  function onMonthsScroll() {
    const el = monthsScrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    if (scrollTop + clientHeight >= scrollHeight - 240) {
      setMonthsAhead((prev) => prev + 6);
    }

    const targetY = scrollTop + 18;
    let bestIdx = 0;

    for (let i = 0; i < monthWrapRefs.current.length; i++) {
      const node = monthWrapRefs.current[i];
      if (!node) continue;
      if (node.offsetTop <= targetY) bestIdx = i;
      else break;
    }

    const m = monthsList[bestIdx];
    if (m) setViewMonth(m);
  }

  function scrollToMonth(index: number) {
    const el = monthsScrollRef.current;
    const node = monthWrapRefs.current[index];
    if (!el || !node) return;

    el.scrollTo({
      top: node.offsetTop - 8,
      behavior: "smooth",
    });
  }

  const currentIndex = useMemo(() => {
    const a = startOfMonth(scrollStartMonth);
    const b = startOfMonth(viewMonth);
    const diff =
      (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());

    return Math.max(0, Math.min(monthsList.length - 1, diff));
  }, [scrollStartMonth, viewMonth, monthsList.length]);

  return (
    <div
      className="nexa-booking-panel relative z-20 w-full rounded-[clamp(20px,1.8vw,24px)] border p-[clamp(9px,0.9vw,12px)] shadow-[0_14px_42px_rgba(0,0,0,0.12)]"
      style={{ background: PANEL_BG, borderColor: SOFT }}
    >
      <style jsx>{`
        @keyframes magicalPulseDance {
          0% {
            transform: scale(1) translateY(0);
            box-shadow: 0 10px 22px rgba(255, 106, 0, 0.18);
          }
          20% {
            transform: scale(1.04) translateY(-2px);
            box-shadow: 0 16px 28px rgba(255, 106, 0, 0.28);
          }
          40% {
            transform: scale(0.995) translateY(0);
            box-shadow: 0 12px 24px rgba(255, 106, 0, 0.2);
          }
          60% {
            transform: scale(1.05) translateY(-1px);
            box-shadow: 0 18px 32px rgba(255, 106, 0, 0.3);
          }
          80% {
            transform: scale(1.01) translateY(0);
            box-shadow: 0 14px 26px rgba(255, 106, 0, 0.24);
          }
          100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 10px 22px rgba(255, 106, 0, 0.18);
          }
        }

        .checkout-button-magical {
          animation: magicalPulseDance 1.2s ease-in-out infinite;
        }

        .nexa-calendar-modal {
          pointer-events: none;
        }

        .nexa-calendar-box {
          pointer-events: auto;
          background:
            radial-gradient(circle at 12% 0%, rgba(255, 106, 0, 0.13), transparent 32%),
            radial-gradient(circle at 88% 10%, rgba(0, 217, 255, 0.13), transparent 30%),
            radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.10), transparent 32%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(246, 246, 249, 0.98));
        }

        .nexa-calendar-month-card {
          border-radius: 28px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background:
            radial-gradient(circle at 0% 0%, rgba(255, 106, 0, 0.10), transparent 34%),
            radial-gradient(circle at 100% 0%, rgba(0, 217, 255, 0.08), transparent 32%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.72));
          box-shadow:
            0 22px 65px rgba(0, 0, 0, 0.09),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
          padding: clamp(16px, 2.2vw, 24px);
          backdrop-filter: blur(18px);
        }

        .nexa-calendar-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .nexa-calendar-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 999px;
        }

        .nexa-calendar-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${ORANGE}, ${PURPLE}, ${BLUE});
          border-radius: 999px;
        }

        @media (max-width: 767px) {
          .nexa-booking-panel {
            width: min(100%, 342px);
            margin-left: auto;
            margin-right: auto;
            border-radius: 22px !important;
            padding: 9px !important;
            box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
          }

          .nexa-vehicle-card {
            padding: 9px 11px !important;
            border-radius: 15px !important;
          }

          .nexa-vehicle-label {
            font-size: 8px !important;
            letter-spacing: 0.14em !important;
          }

          .nexa-vehicle-name {
            font-size: 13px !important;
          }

          .nexa-plan-grid {
            gap: 7px !important;
            margin-top: 8px !important;
          }

          .nexa-plan-card {
            border-radius: 15px !important;
            padding: 8px 8px !important;
            min-height: 128px;
          }

          .nexa-plan-badge {
            font-size: 6.5px !important;
            padding: 4px 7px !important;
            letter-spacing: 0.06em !important;
            max-width: 100%;
            white-space: nowrap;
          }

          .nexa-plan-price-row {
            margin-top: 8px !important;
            gap: 5px !important;
          }

          .nexa-plan-old {
            font-size: 12px !important;
          }

          .nexa-plan-new {
            font-size: 27px !important;
          }

          .nexa-plan-label {
            font-size: 11px !important;
          }

          .nexa-plan-lines {
            margin-top: 5px !important;
            font-size: 8.6px !important;
            line-height: 1.35 !important;
          }

          .nexa-plan-chip {
            margin-top: 7px !important;
            font-size: 7px !important;
            padding: 4px 6px !important;
            letter-spacing: 0.04em !important;
          }

          .nexa-whatsapp-availability {
            margin-top: 8px !important;
            border-radius: 15px !important;
            padding: 9px 10px !important;
          }

          .nexa-whatsapp-availability-title {
            font-size: 8px !important;
          }

          .nexa-whatsapp-availability-text {
            font-size: 9.2px !important;
            line-height: 1.42 !important;
          }

          .nexa-whatsapp-availability-btn {
            font-size: 9px !important;
            padding: 7px 9px !important;
          }

          .nexa-fields-wrap {
            margin-top: 8px !important;
            gap: 7px !important;
          }

          .nexa-field-card {
            min-height: 48px;
            border-radius: 14px !important;
            padding: 8px 9px !important;
          }

          .nexa-field-icon {
            width: 28px !important;
            height: 28px !important;
          }

          .nexa-field-label {
            font-size: 7.5px !important;
            letter-spacing: 0.09em !important;
          }

          .nexa-field-value {
            font-size: 11.5px !important;
          }

          .nexa-field-status {
            font-size: 8.5px !important;
          }

          .nexa-summary-box {
            margin-top: 8px !important;
            border-radius: 15px !important;
            padding: 10px !important;
          }

          .nexa-summary-title {
            font-size: 8px !important;
          }

          .nexa-summary-text {
            font-size: 12px !important;
          }

          .nexa-total-box {
            border-radius: 11px !important;
            padding: 8px 9px !important;
          }

          .nexa-total-value {
            font-size: 18px !important;
          }

          .nexa-price-details-btn {
            margin-top: 7px !important;
            font-size: 10px !important;
          }

          .nexa-checkout-btn {
            margin-top: 8px !important;
            padding-top: 10px !important;
            padding-bottom: 10px !important;
            border-radius: 14px !important;
            font-size: 13px !important;
          }

          .nexa-panel-note {
            margin-top: 8px !important;
            border-radius: 13px !important;
            padding: 8px 10px !important;
            font-size: 9.5px !important;
            line-height: 1.45 !important;
          }

          .nexa-calendar-modal {
            align-items: flex-start !important;
            justify-content: center !important;
            padding: max(10px, env(safe-area-inset-top)) 10px 10px !important;
            background: rgba(0, 0, 0, 0.28) !important;
            backdrop-filter: blur(6px) !important;
          }

          .nexa-calendar-box {
            width: min(100%, 430px) !important;
            max-height: 84svh !important;
            border-radius: 30px !important;
          }

          .nexa-calendar-scroll {
            max-height: 48svh !important;
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .nexa-calendar-month-card {
            border-radius: 24px;
            padding: 16px;
          }
        }

        @media (max-width: 380px) {
          .nexa-booking-panel {
            width: min(100%, 324px);
            padding: 8px !important;
          }

          .nexa-plan-card {
            min-height: 121px;
            padding: 7px !important;
          }

          .nexa-plan-new {
            font-size: 25px !important;
          }

          .nexa-plan-lines {
            font-size: 8px !important;
          }

          .nexa-field-card {
            min-height: 45px;
          }

          .nexa-panel-note {
            display: none;
          }

          .nexa-calendar-box {
            max-height: 82svh !important;
          }

          .nexa-calendar-scroll {
            max-height: 46svh !important;
          }
        }
      `}</style>

      <div
        className="nexa-vehicle-card rounded-[16px] border px-3 py-[clamp(10px,0.8vw,12px)]"
        style={{ background: "#ECECEF", borderColor: SOFT }}
      >
        <div
          className="nexa-vehicle-label text-[clamp(8px,0.7vw,10px)] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: MUTED }}
        >
          Vehicle
        </div>
        <div className="nexa-vehicle-name mt-0.5 truncate text-[clamp(14px,1.1vw,16px)] font-black text-black">
          {vehicleName}
        </div>
      </div>

      <div className="nexa-plan-grid relative z-30 mt-2.5 grid grid-cols-2 gap-[clamp(7px,0.7vw,8px)]">
        <PlanCard
          selected={plan === "half"}
          label="Half Day"
          badge="Most Popular"
          oldPrice={`€${activePricing.halfDayOldPrice}`}
          newPrice={`€${activePricing.halfDayPrice}`}
          line1="Pickup 09:30–14:00"
          line2="Return 19:00–20:00"
          chip="Best value today"
          strong
          step="plan-half-day"
          enableAiCopilot={enableAiCopilot}
          onClick={() => handlePlanSelect("half")}
        />

        <PlanCard
          selected={plan === "full"}
          label="Full Day"
          badge="Full Day"
          oldPrice={`€${activePricing.fullDayOldPrice}`}
          newPrice={`€${activePricing.fullDayPricing[1]}`}
          line1="24h / 48h / 72h"
          line2="Max 6 days"
          chip="Flexible rental"
          step="plan-full-day"
          enableAiCopilot={enableAiCopilot}
          onClick={() => handlePlanSelect("full")}
        />
      </div>

      <div
        className="nexa-whatsapp-availability mt-2.5 flex items-center justify-between gap-3 rounded-[16px] border px-3 py-2.5"
        style={{
          background: "linear-gradient(135deg,#FFF7EF 0%,#FFFFFF 100%)",
          borderColor: "rgba(255,106,0,0.22)",
          boxShadow: "0 10px 24px rgba(255,106,0,0.06)",
        }}
      >
        <div className="min-w-0">
          <div className="nexa-whatsapp-availability-title text-[11px] font-black uppercase tracking-[0.12em] text-[#C85A00]">
            Need more than one scooter?
          </div>
          <p className="nexa-whatsapp-availability-text mt-1 text-[11px] font-semibold leading-5 text-black/62">
            If you are looking to rent multiple scooters, we recommend booking via
            WhatsApp so our team can confirm availability instantly.
          </p>
        </div>

        <a
          href={whatsappAvailabilityHref}
          target="_blank"
          rel="noreferrer"
          className="nexa-whatsapp-availability-btn shrink-0 rounded-full px-3 py-2 text-[11px] font-black text-white shadow-[0_10px_22px_rgba(34,197,94,0.22)] transition hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
          }}
        >
          Book via WhatsApp
        </a>
      </div>

      <div className="nexa-fields-wrap mt-2.5 grid grid-cols-1 gap-2">
        <FieldCard
          label="Pickup Date"
          value={fmtDate(range.from)}
          onClick={() => openCalendar("pickup")}
          disabled={!plan}
          icon={<CalendarIcon />}
          highlight={calendarOpen && activeField === "pickup"}
        />

        <div className="grid grid-cols-2 gap-2">
          <div className="relative min-w-0">
            <FieldCard
              label="Pickup Time"
              value={formatTimeLabel(pickupTime)}
              onClick={() => {
                if (!plan) {
                  setNotice("Please choose Half Day or Full Day first.");
                  return;
                }

                if (plan === "half" && !range.from) {
                  setNotice("Please choose your date first.");
                  return;
                }

                setReturnTimeOpen(false);
                setPickupTimeOpen((v) => !v);
              }}
              disabled={!plan}
              icon={<ClockIcon />}
              buttonRef={pickupBtnRef}
              highlight={pickupTimeOpen}
            />

            {pickupTimeOpen && (
              <div ref={pickupDropdownRef}>
                <DropdownCard
                  title="Pickup Time"
                  options={pickupOptions}
                  activeValue={pickupTime}
                  onSelect={(value) => {
                    setPickupTime(value);
                    setPickupTimeOpen(false);

                    if (plan === "half") {
                      window.setTimeout(() => {
                        setReturnTimeOpen(true);
                      }, 150);
                    }
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative min-w-0">
            <FieldCard
              label="Return Time"
              value={formatTimeLabel(returnTime)}
              onClick={
                plan === "half"
                  ? () => {
                      if (!range.from) {
                        setNotice("Please choose your date first.");
                        return;
                      }

                      setPickupTimeOpen(false);
                      setReturnTimeOpen((v) => !v);
                    }
                  : undefined
              }
              disabled={!plan}
              muted={plan === "full"}
              icon={<ClockIcon />}
              buttonRef={returnBtnRef}
              highlight={plan === "half" && returnTimeOpen}
            />

            {plan === "half" && returnTimeOpen && (
              <div ref={returnDropdownRef}>
                <DropdownCard
                  title="Return Time"
                  options={returnHalfOptions}
                  activeValue={halfReturnTime}
                  onSelect={(value) => {
                    setHalfReturnTime(value);
                    setReturnTimeOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <FieldCard
          label="Drop-off Date"
          value={plan === "half" ? fmtDate(range.from) : fmtDate(range.to)}
          onClick={() => openCalendar("dropoff")}
          disabled={!plan}
          muted={plan === "half"}
          icon={<CalendarIcon />}
          highlight={calendarOpen && activeField === "dropoff"}
        />
      </div>

      {hasCompleteRentalSelection ? (
        <div
          className="mt-2.5 rounded-[15px] border px-3 py-2.5 text-[11px] font-bold leading-5"
          style={{
            background: isUnavailable
              ? "#FFF1F1"
              : isCheckingAvailability
              ? "#EFF8FF"
              : availabilityConfirmed
              ? "#ECFDF3"
              : "#FFF7ED",
            borderColor: isUnavailable
              ? "rgba(239,68,68,0.24)"
              : isCheckingAvailability
              ? "rgba(14,165,233,0.22)"
              : availabilityConfirmed
              ? "rgba(34,197,94,0.22)"
              : "rgba(255,106,0,0.22)",
            color: isUnavailable
              ? "#991B1B"
              : isCheckingAvailability
              ? "#075985"
              : availabilityConfirmed
              ? "#166534"
              : "#9C4300",
          }}
        >
          {isCheckingAvailability
            ? "Checking live scooter availability..."
            : isUnavailable
            ? availability?.message ||
              "This scooter is not available for the selected date/time. Please choose another date or time."
            : availabilityConfirmed
            ? typeof availability?.availableCount === "number" &&
              typeof availability?.totalFleet === "number"
              ? `${availability.availableCount}/${availability.totalFleet} scooter(s) available for this date/time.${
                  availability.bufferMinutes
                    ? ` ${availability.bufferMinutes} minutes buffer included.`
                    : ""
                }`
              : "Scooter available for this date/time."
            : availability?.message || "Waiting for live availability confirmation..."}
        </div>
      ) : null}

      <div
        className="nexa-summary-box mt-2.5 rounded-[18px] p-[clamp(10px,0.9vw,12px)]"
        style={{ background: DARK }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="nexa-summary-title text-[clamp(8px,0.72vw,10px)] font-extrabold uppercase tracking-[0.12em] text-white/45">
              Summary
            </div>

            <div className="nexa-summary-text mt-1 truncate text-[clamp(12px,1vw,14px)] font-black text-white">
              {compactSummary}
            </div>

            {plan === "half" && canCheckout && (
              <div className="mt-1 text-[clamp(10px,0.78vw,11px)] font-semibold text-[#FFB27A]">
                <span className="line-through text-white/35">
                  €{activePricing.halfDayOldPrice}
                </span>
                <span className="mx-1">→</span>
                <span className="text-white">€{activePricing.halfDayPrice}</span>
              </div>
            )}
          </div>

          <div className="nexa-total-box shrink-0 rounded-[12px] bg-white/8 px-3 py-2 text-right">
            <div className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-white/45">
              Total
            </div>
            <div className="nexa-total-value mt-0.5 text-[clamp(19px,1.6vw,22px)] font-black text-white">
              {hasCompleteRentalSelection ? `€${finalTotal}` : "--"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPriceDetails((v) => !v)}
          className="nexa-price-details-btn mt-2 text-[11px] font-bold text-[#FFB27A] transition hover:text-white"
        >
          {showPriceDetails ? "Hide price details" : "View price details"}
        </button>

        {showPriceDetails && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div
              className="rounded-[12px] border px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/45">
                Before
              </div>
              <div className="mt-1 text-[12px] font-black text-white">
                {plan === "half"
                  ? `€${activePricing.halfDayOldPrice}`
                  : plan === "full" && fullDayCount > 0
                  ? `€${activePricing.fullDayOldPrice}/day`
                  : "--"}
              </div>
            </div>

            <div
              className="rounded-[12px] border px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/45">
                After
              </div>
              <div className="mt-1 text-[12px] font-black text-white">
                {plan === "half"
                  ? `€${activePricing.halfDayPrice}`
                  : plan === "full" && fullDayCount > 0
                  ? `€${fullDayRate}/day`
                  : "--"}
              </div>
            </div>

            <div
              className="rounded-[12px] border px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/45">
                Length
              </div>
              <div className="mt-1 text-[12px] font-black text-white">
                {plan === "half"
                  ? "Same day"
                  : plan === "full" && fullDayCount > 0
                  ? `${fullDayCount} day${fullDayCount > 1 ? "s" : ""}`
                  : "--"}
              </div>
            </div>

            <div
              className="rounded-[12px] border px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white/45">
                Save
              </div>
              <div className="mt-1 text-[12px] font-black text-[#FFB27A]">
                {plan ? `€${Math.max(0, saveAmount)}` : "--"}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onProceed}
        disabled={!canCheckout}
        className={[
          "nexa-checkout-btn mt-2.5 w-full rounded-[15px] px-5 py-[clamp(10px,0.9vw,12px)] text-[clamp(13px,1.05vw,15px)] font-black text-white transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45",
          canCheckout ? "checkout-button-magical" : "",
        ].join(" ")}
        style={{
          background: "linear-gradient(135deg,#FF6A00 0%,#FF8A2B 100%)",
        }}
      >
        {isCheckingAvailability
          ? "Checking availability..."
          : isUnavailable
          ? "Not available"
          : availabilityConfirmed
          ? "Proceed to Checkout"
          : "Confirming availability..."}
      </button>

      {notice ? (
        <div
          className="nexa-panel-note mt-2.5 rounded-[14px] border px-3 py-2.5 text-[11px] font-bold leading-5"
          style={{
            background: "#FFF3E8",
            borderColor: "rgba(255,106,0,0.22)",
            color: "#9C4300",
          }}
        >
          {notice}
        </div>
      ) : (
        <div
          className="nexa-panel-note mt-2.5 rounded-[14px] border px-3 py-2.5 text-[clamp(10px,0.78vw,11px)] font-semibold leading-5"
          style={{
            background: "#ECECEE",
            borderColor: SOFT,
            color: "rgba(17,17,17,0.60)",
          }}
        >
          {plan === "half"
            ? "Half Day rentals: pickup 09:30–14:00, return 19:00–20:00. For more than one scooter, we recommend booking via WhatsApp."
            : "Full Day bookings follow 24h blocks. For more than one scooter, we recommend booking via WhatsApp."}
        </div>
      )}

      {calendarOpen && (
        <div
          className="nexa-calendar-modal fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/35 p-3 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCalendarOpen(false);
          }}
        >
          <div
            className="nexa-calendar-box w-[min(760px,calc(100vw-24px))] overflow-hidden rounded-[32px] border shadow-[0_32px_110px_rgba(0,0,0,0.32)]"
            style={{ borderColor: "rgba(255,255,255,0.34)" }}
          >
            <div
              className="relative overflow-hidden border-b px-5 py-5"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <div className="pointer-events-none absolute right-[-60px] top-[-70px] h-44 w-44 rounded-full bg-cyan-400/20 blur-[60px]" />
              <div className="pointer-events-none absolute left-[-60px] top-[-70px] h-44 w-44 rounded-full bg-orange-400/20 blur-[60px]" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-black/45 shadow-sm">
                    {plan === "half"
                      ? "Select rental date"
                      : activeField === "pickup"
                      ? "Select pickup date"
                      : "Select drop-off date"}
                  </div>

                  <div className="mt-3 text-[clamp(34px,5vw,46px)] font-black leading-none tracking-[-0.07em] text-black">
                    {viewMonth.toLocaleString("en", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCalendarOpen(false)}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/65 text-[24px] font-black text-black shadow-[0_14px_34px_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4">
              <button
                type="button"
                onClick={() => scrollToMonth(Math.max(0, currentIndex - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[25px] font-black text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
              >
                ‹
              </button>

              <div className="rounded-full border border-black/10 bg-white/65 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-sm">
                Scroll months
              </div>

              <button
                type="button"
                onClick={() =>
                  scrollToMonth(Math.min(monthsList.length - 1, currentIndex + 1))
                }
                className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[25px] font-black text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-95"
              >
                ›
              </button>
            </div>

            <div
              ref={monthsScrollRef}
              onScroll={onMonthsScroll}
              className="nexa-calendar-scroll max-h-[min(58svh,590px)] overflow-y-auto px-5 pb-5"
            >
              <div className="grid grid-cols-1 gap-5">
                {monthsList.map((month, index) => (
                  <div
                    key={`${month.getFullYear()}-${month.getMonth()}`}
                    ref={(el) => {
                      monthWrapRefs.current[index] = el;
                    }}
                  >
                    <MiniMonth
                      month={month}
                      range={range}
                      plan={plan}
                      activeField={activeField}
                      minBookableDate={minBookableDate}
                      onPick={onPickDate}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex items-center justify-between border-t bg-white/45 px-5 py-4 backdrop-blur-xl"
              style={{ borderColor: "rgba(0,0,0,0.08)" }}
            >
              <button
                type="button"
                onClick={() => {
                  setRange({});
                  setAvailability(null);
                  setNotice("");
                  setIsCheckingAvailability(false);
                }}
                className="text-[13px] font-black text-black/55 transition hover:text-black"
              >
                Clear dates
              </button>

              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="rounded-[18px] px-6 py-3 text-[13px] font-black text-white shadow-[0_16px_34px_rgba(255,106,0,0.25)] transition hover:-translate-y-0.5 hover:brightness-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg,${ORANGE} 0%,${PURPLE} 58%,${BLUE} 130%)`,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}