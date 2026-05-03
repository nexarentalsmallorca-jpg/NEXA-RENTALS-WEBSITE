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

function resolveVehicleId(vehicleName: string) {
  const normalized = normalizeVehicleName(vehicleName);

  if (normalized.includes("piaggio liberty 125")) return "s2";
  if (normalized.includes("sym symphony 125")) return "s3";
  if (normalized.includes("zontes 125e")) return "s1";

  return "s2";
}

function buildWhatsAppAvailabilityLink(
  vehicleName: string,
  plan: RentalPlan,
  from?: Date
) {
  const text = `Hi NEXA Rentals, I would like to rent more than one scooter${
    plan ? ` (${plan === "half" ? "Half Day" : "Full Day"})` : ""
  }${from ? ` on ${fmtDate(from)}` : ""}. Can you please confirm availability for ${vehicleName}?`;

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
  today,
  onPick,
}: {
  month: Date;
  range: DateRange;
  plan: RentalPlan;
  activeField: ActiveField;
  today: Date;
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
    <div
      className="rounded-[18px] border p-[clamp(12px,2vw,16px)]"
      style={{
        background: "#fff",
        borderColor: SOFT,
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <div className="mb-3 text-[clamp(18px,3vw,20px)] font-black text-black">
        {month.toLocaleString("en", { month: "long", year: "numeric" })}
      </div>

      <div className="mb-3 grid grid-cols-7 text-center text-[11px] font-bold text-black/45">
        {weekdays.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[clamp(5px,1.4vw,8px)]">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="h-[clamp(36px,7vw,44px)]" />;

          const isPast = startOfDay(day) < today;
          const isStart = !!range.from && isSameDay(day, range.from);
          const isEnd = !!range.to && isSameDay(day, range.to);

          const inRange =
            !!range.from &&
            !!range.to &&
            startOfDay(day) >= startOfDay(range.from) &&
            startOfDay(day) <= startOfDay(range.to);

          let disabled = isPast;

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
                "h-[clamp(36px,7vw,44px)] rounded-[12px] text-[13px] font-black transition-all duration-200",
                disabled
                  ? "cursor-not-allowed text-black/20"
                  : "cursor-pointer text-black hover:-translate-y-[1px] hover:shadow-[0_10px_20px_rgba(255,106,0,0.14)] active:scale-[0.96]",
              ].join(" ")}
              style={{
                background:
                  isStart || isEnd
                    ? "linear-gradient(135deg,#FF6A00 0%,#FF8A2B 100%)"
                    : inRange
                    ? "rgba(255,106,0,0.14)"
                    : "#F4F4F5",
                color: isStart || isEnd ? "#fff" : undefined,
                boxShadow:
                  isStart || isEnd ? "0 12px 24px rgba(255,106,0,0.24)" : "none",
                outline:
                  isStart || isEnd ? "2px solid rgba(255,106,0,0.18)" : "none",
              }}
            >
              {day.getDate()}
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
      data-nexa-step={step}
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

  const today = useMemo(() => startOfDay(new Date()), []);
  const pickupHalfOptions = useMemo(() => buildTimeOptions(9, 30, 14, 0), []);
  const pickupFullOptions = useMemo(() => buildTimeOptions(9, 30, 20, 0), []);
  const returnHalfOptions = useMemo(() => ["19:00", "19:30", "20:00"], []);

  const [plan, setPlan] = useState<RentalPlan>(null);
  const [range, setRange] = useState<DateRange>({});
  const [pickupTime, setPickupTime] = useState("10:00");
  const [halfReturnTime, setHalfReturnTime] = useState("20:00");
  const [notice, setNotice] = useState("");
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeField, setActiveField] = useState<ActiveField>("pickup");

  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [returnTimeOpen, setReturnTimeOpen] = useState(false);

  const pickupBtnRef = useRef<HTMLButtonElement | null>(null);
  const returnBtnRef = useRef<HTMLButtonElement | null>(null);
  const pickupDropdownRef = useRef<HTMLDivElement | null>(null);
  const returnDropdownRef = useRef<HTMLDivElement | null>(null);

  const [scrollStartMonth, setScrollStartMonth] = useState(startOfMonth(today));
  const [viewMonth, setViewMonth] = useState(startOfMonth(today));
  const [monthsAhead, setMonthsAhead] = useState(12);
  const monthsScrollRef = useRef<HTMLDivElement | null>(null);
  const monthWrapRefs = useRef<Array<HTMLDivElement | null>>([]);

  const onPricingChangeRef = useRef(onPricingChange);

  useEffect(() => {
    onPricingChangeRef.current = onPricingChange;
  }, [onPricingChange]);

  const vehicleId = useMemo(() => resolveVehicleId(vehicleName), [vehicleName]);
  const pickupOptions = plan === "half" ? pickupHalfOptions : pickupFullOptions;

  const activePricing = useMemo(() => {
    return getSeasonalPricing(range.from || today);
  }, [range.from, today]);

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
      return `${fullDayCount} Day${fullDayCount > 1 ? "s" : ""} • €${fullDayRate}/day • €${finalTotal}`;
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

  const canCheckout = useMemo(() => {
    if (plan === "half") {
      return !!range.from && !!pickupTime && !!halfReturnTime;
    }

    if (plan === "full") {
      return !!range.from && !!range.to && fullDayCount >= 1 && fullDayCount <= 6;
    }

    return false;
  }, [plan, range.from, range.to, fullDayCount, pickupTime, halfReturnTime]);

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
      which === "pickup" ? range.from || today : range.to || range.from || today;

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
    setPickupTime("10:00");
    setHalfReturnTime("20:00");
    setPickupTimeOpen(false);
    setReturnTimeOpen(false);

    window.setTimeout(() => {
      setActiveField("pickup");
      setCalendarOpen(true);
    }, 60);
  }

  function onPickDate(day: Date) {
    if (startOfDay(day) < today || !plan) return;

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
    if (!canCheckout || !range.from) {
      setNotice("Please complete your booking details first.");
      return;
    }

    const resolvedReturnDate = returnDate || range.from;
    const resolvedDays = plan === "half" ? 1 : fullDayCount;
    const resolvedRate = plan === "half" ? activePricing.halfDayPrice : fullDayRate;

    const params = new URLSearchParams({
      vehicleId,
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
    }, 0);

    return () => window.clearTimeout(t);
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
            align-items: flex-end !important;
            padding: 0 !important;
          }

          .nexa-calendar-box {
            width: 100% !important;
            max-height: 92svh !important;
            border-radius: 24px 24px 0 0 !important;
          }

          .nexa-calendar-scroll {
            max-height: 62svh !important;
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
              {canCheckout ? `€${finalTotal}` : "--"}
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
        Proceed to Checkout
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
          className="nexa-calendar-modal fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCalendarOpen(false);
          }}
        >
          <div
            className="nexa-calendar-box w-[min(700px,calc(100vw-24px))] overflow-hidden rounded-[24px] border bg-white shadow-[0_28px_90px_rgba(0,0,0,0.25)]"
            style={{ borderColor: SOFT }}
          >
            <div
              className="flex items-start justify-between border-b px-4 py-4"
              style={{ borderColor: SOFT }}
            >
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-black/45">
                  {plan === "half"
                    ? "Select rental date"
                    : activeField === "pickup"
                    ? "Select pickup date"
                    : "Select drop-off date"}
                </div>

                <div className="mt-1 text-[22px] font-black text-black">
                  {viewMonth.toLocaleString("en", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F4] text-[18px] font-bold text-black transition hover:bg-[#ececef]"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <button
                type="button"
                onClick={() => scrollToMonth(Math.max(0, currentIndex - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border text-[20px] text-black transition hover:bg-[#f5f5f6]"
                style={{ borderColor: SOFT }}
              >
                ‹
              </button>

              <div className="rounded-full bg-[#F3F3F4] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black">
                Scroll Months
              </div>

              <button
                type="button"
                onClick={() =>
                  scrollToMonth(Math.min(monthsList.length - 1, currentIndex + 1))
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border text-[20px] text-black transition hover:bg-[#f5f5f6]"
                style={{ borderColor: SOFT }}
              >
                ›
              </button>
            </div>

            <div
              ref={monthsScrollRef}
              onScroll={onMonthsScroll}
              className="nexa-calendar-scroll max-h-[min(58svh,560px)] overflow-y-auto px-4 pb-4"
            >
              <div className="grid grid-cols-1 gap-4">
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
                      today={today}
                      onPick={onPickDate}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex items-center justify-between border-t px-4 py-4"
              style={{ borderColor: SOFT }}
            >
              <button
                type="button"
                onClick={() => {
                  setRange({});
                  setNotice("");
                }}
                className="text-[12px] font-black text-black/55 transition hover:text-black"
              >
                Clear dates
              </button>

              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="rounded-[14px] px-4 py-2.5 text-[12px] font-black text-white transition hover:brightness-95"
                style={{
                  background: "linear-gradient(135deg,#FF6A00 0%,#FF8A2B 100%)",
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