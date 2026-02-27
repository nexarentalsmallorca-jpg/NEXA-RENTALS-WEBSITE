"use client";
export const dynamic = "force-dynamic";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../Navbar";
import { useLocale, useTranslations } from "next-intl";

/* ---------------- types ---------------- */
type VehicleType = "Scooter" | "E-Bike";

type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  pricePerDay: number;
  imageUrl: string;
  badges: string[];
  spec1?: string;
  spec2?: string;
};

/* ---------------- fleet ---------------- */
const VEHICLES: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 55,
    imageUrl: "/images/zontes125.png",
    badges: ["Premium", "Performance"],
    spec1: "125cc • Automatic",
    spec2: "Best for fast rides",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 45,
    imageUrl: "/images/liberty125.png",
    badges: ["Popular", "Best Seller"],
    spec1: "125cc • Automatic",
    spec2: "Smooth + easy handling",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    type: "Scooter",
    pricePerDay: 45,
    imageUrl: "/images/sym.png",
    badges: ["Comfort", "Practical"],
    spec1: "125cc • Automatic",
    spec2: "Stable city ride",
  },
  {
    id: "e1",
    name: "ENGWE X26 (Performance)",
    type: "E-Bike",
    pricePerDay: 29,
    imageUrl: "/images/citybike2.png",
    badges: ["Premium", "Cruise Control"],
    spec1: "Up to 90km range",
    spec2: "Powerful & fun",
  },
  {
    id: "e2",
    name: "ENGWE M20 (JOY)",
    type: "E-Bike",
    pricePerDay: 25,
    imageUrl: "/images/e20.png",
    badges: ["Practical", "Power"],
    spec1: "Up to 60km range",
    spec2: "Great value",
  },
  {
    id: "e3",
    name: "P275 SE (Comfort)",
    type: "E-Bike",
    pricePerDay: 33,
    imageUrl: "/images/ebike-urban.png",
    badges: ["Comfort", "Stable"],
    spec1: "Up to 45km range",
    spec2: "Easy for everyone",
  },
];

/* ---------------- theme ---------------- */
const ORANGE = "#FF7A00";
const BG = "#070707";

/* ---------------- helpers ---------------- */
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function parseISO(v?: string | null) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
function fmtDate(d?: Date, locale?: string) {
  if (!d) return "--/--/----";
  return d.toLocaleDateString(locale || undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function safeParam(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.trim().length ? v : undefined;
}
function formatTimeLabel(t?: string, locale?: string) {
  if (!t) return "--:--";
  const [hhStr, mmStr] = t.split(":");
  const hh = Number(hhStr);
  if (Number.isNaN(hh)) return t;

  const date = new Date();
  date.setHours(hh, Number(mmStr), 0, 0);

  return new Intl.DateTimeFormat(locale || undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
function daysBetween(from?: Date, to?: Date) {
  if (!from || !to) return 1;
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  const diff = Math.max(0, b - a);
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}
function money(n: number) {
  return Math.round(n);
}
function discountRate(days: number) {
  if (days >= 14) return 0.22;
  if (days >= 7) return 0.15;
  if (days >= 4) return 0.1;
  if (days >= 2) return 0.06;
  return 0;
}
function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}
function phoneOk(v: string) {
  const digits = v.replace(/[^\d+]/g, "");
  return digits.length >= 7;
}

/* ---------------- page ---------------- */

export default function CheckoutClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const t = useTranslations("checkout");
  const locale = useLocale();

  // booking params
  const pickupLocation =
    safeParam(sp, "pickupLocation") ?? t("defaultPickupLocation");
  const from = parseISO(safeParam(sp, "from"));
  const to = parseISO(safeParam(sp, "to"));
  const pickupTime = safeParam(sp, "pickupTime") ?? "10:00";
  const dropoffTime = safeParam(sp, "dropoffTime") ?? "10:00";
  const rentalDays = useMemo(() => daysBetween(from, to), [from, to]);

  const vehicleId = safeParam(sp, "vehicleId") ?? "s2";
  const vehicle = useMemo(
    () => VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[1],
    [vehicleId]
  );

  // price
  const rate = discountRate(rentalDays);
  const discountedPerDay = vehicle.pricePerDay * (1 - rate);
  const total = discountedPerDay * rentalDays;
  const discountPct = Math.round(rate * 100);

  // payment policy
  const payNow = total * 0.5;
  const payPickup = total - payNow;
  const deposit = 150;

  // required details
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // optional notes
  const [notes, setNotes] = useState("");

  // optional uploads
  const [dlFront, setDlFront] = useState<File | null>(null);
  const [dlBack, setDlBack] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

  // checkboxes
  const [contractReadyOk, setContractReadyOk] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const canPay =
    firstName.trim().length >= 2 &&
    surname.trim().length >= 2 &&
    phoneOk(phone) &&
    emailOk(email) &&
    contractReadyOk &&
    agreeTerms;

  // ✅ FIX: include locale in the route
  const backToVehicles = () => {
    router.push(`/${locale}/vehicles?${sp.toString()}`);
  };

  const payNowAction = async () => {
  if (!canPay) return;

  // amount Stripe needs is in cents
  const amountCents = Math.round(payNow * 100);

  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: amountCents,
      name: `NEXA Deposit 50% — ${vehicle.name} (${rentalDays} day${rentalDays > 1 ? "s" : ""})`,
      // optional: send extra info if you want later for webhooks/logs
      // metadata: { vehicleId, pickupLocation, pickupTime, dropoffTime, from: from?.toISOString() ?? "", to: to?.toISOString() ?? "" }
    }),
  });

  const data = await res.json();

  if (!res.ok || !data?.url) {
    alert("Payment error. Please try again.");
    return;
  }

  window.location.href = data.url;
};
  return (
    <div className="min-h-screen text-white" style={{ background: BG }}>
      {/* subtle premium background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.025),transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.85)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      </div>

      <Navbar />
      <div className="h-16 md:h-20" />

      <header className="mx-auto max-w-6xl px-4 pt-5 pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[12px] font-black text-white/65">
              {t("step2of2")}
            </div>
            <h1 className="mt-1 text-2xl md:text-[28px] font-black tracking-tight">
              {t("confirmAndPay")}{" "}
              <span style={{ color: ORANGE }}>{t("in60Seconds")}</span>
            </h1>

            <div className="mt-2 flex flex-wrap gap-2">
              <Chip>{pickupLocation}</Chip>
              <Chip>
                {fmtDate(from, locale)} • {formatTimeLabel(pickupTime, locale)}
              </Chip>
              <Chip>
                {fmtDate(to, locale)} • {formatTimeLabel(dropoffTime, locale)}
              </Chip>
              <Chip>
                {rentalDays}{" "}
                {t(rentalDays > 1 ? "daysPlural" : "daysSingular")}
              </Chip>
              {discountPct > 0 && (
                <Chip accent>
                  {t("savePct", { pct: discountPct })}
                </Chip>
              )}
            </div>
          </div>

          <button
            onClick={backToVehicles}
            className="rounded-2xl px-5 py-3 text-[13px] font-black border hover:bg-white/5 transition"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            {t("backToVehicles")}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5">
          {/* LEFT: vehicle */}
          <section
            className="rounded-3xl border p-4 md:p-5"
            style={{
              borderColor: "rgba(255,255,255,0.10)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {vehicle.badges.slice(0, 2).map((b) => (
                    <Tag key={b}>{b}</Tag>
                  ))}
                </div>

                <h2 className="mt-2 text-xl md:text-2xl font-black tracking-tight">
                  {vehicle.name}
                </h2>

                <div className="mt-1 text-[13px] text-white/65">
                  {vehicle.type} • {vehicle.spec1}
                  {vehicle.spec2 ? ` • ${vehicle.spec2}` : ""}
                </div>
              </div>

              <div
                className="shrink-0 rounded-2xl border px-3 py-2 text-right"
                style={{
                  borderColor: "rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.28)",
                }}
              >
                {discountPct > 0 && (
                  <div className="text-[11px] font-black text-white/55">
                    <span className="line-through">
                      €{money(vehicle.pricePerDay)}
                    </span>{" "}
                    {t("perDayShort")}
                  </div>
                )}
                <div
                  className="text-xl font-black leading-none"
                  style={{ color: ORANGE }}
                >
                  €{money(discountedPerDay)}
                  <span className="text-[11px] text-white/60">
                    {t("perDayShort")}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-white/60">
                  {t("total")}:{" "}
                  <span className="font-black text-white/85">
                    €{money(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mt-4 h-[180px] md:h-[210px] w-full">
              <div className="pointer-events-none absolute left-1/2 bottom-7 h-8 w-[65%] -translate-x-1/2 rounded-full bg-black/60 blur-xl opacity-70" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name}
                className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)]"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-end justify-between">
                <div className="text-[15px] font-black">{t("included")}</div>
                <div className="text-[11px] text-white/55">
                  {t("noExtraFees")}
                </div>
              </div>

              {/* ✅ MOBILE: tiny horizontal row | ✅ DESKTOP: keep exactly as before */}
              <div className="mt-3">
                {/* mobile / tablet */}
                <div className="flex gap-2 overflow-x-auto md:overflow-visible lg:hidden">
                  <IncludedMini
                    title={t("helmet")}
                    sub={t("free")}
                    badge={t("includedBadge")}
                  />
                  <IncludedMini
                    title={t("lock")}
                    sub={t("free")}
                    badge={t("includedBadge")}
                  />
                  <IncludedMini
                    title={t("cargoBox")}
                    sub={t("free")}
                    badge={t("includedBadge")}
                  />
                </div>

                {/* desktop (unchanged) */}
                <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Included
                    title={t("helmet")}
                    sub={t("free")}
                    badge={t("includedBadge")}
                  />
                  <Included
                    title={t("lock")}
                    sub={t("free")}
                    badge={t("includedBadge")}
                  />
                  <Included
                    title={t("cargoBox")}
                    sub={t("free")}
                    badge={t("includedBadge")}
                  />
                </div>
              </div>

              <div
                className="mt-3 rounded-2xl border p-3 text-[12px]"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.22)",
                }}
              >
                <div className="font-black" style={{ color: ORANGE }}>
                  {t("contractReadyTitle")}
                </div>
                <div className="mt-1 text-white/70">
                  {t("contractReadyDesc")}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className="space-y-5">
            {/* details */}
            <div
              className="rounded-3xl border p-4 md:p-5"
              style={{
                borderColor: "rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-black">{t("yourDetails")}</div>
                  <div className="mt-1 text-[12px] text-white/65">
                    {t("detailsHint")}
                  </div>
                </div>
                <div className="text-[11px] text-white/55">
                  {t("required")}{" "}
                  <span className="text-white/80 font-black">*</span>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label={t("nameLabel")}>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-2xl border px-4 py-3 text-[14px] font-semibold text-white/90 outline-none"
                      style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        background: "rgba(0,0,0,0.35)",
                      }}
                      placeholder={t("namePlaceholder")}
                      autoComplete="given-name"
                    />
                  </Field>

                  <Field label={t("surnameLabel")}>
                    <input
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full rounded-2xl border px-4 py-3 text-[14px] font-semibold text-white/90 outline-none"
                      style={{
                        borderColor: "rgba(255,255,255,0.12)",
                        background: "rgba(0,0,0,0.35)",
                      }}
                      placeholder={t("surnamePlaceholder")}
                      autoComplete="family-name"
                    />
                  </Field>
                </div>

                <Field label={t("phoneLabel")}>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3 text-[14px] font-semibold text-white/90 outline-none"
                    style={{
                      borderColor: "rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.35)",
                    }}
                    placeholder={t("phonePlaceholder")}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </Field>

                <Field label={t("emailLabel")}>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border px-4 py-3 text-[14px] font-semibold text-white/90 outline-none"
                    style={{
                      borderColor: "rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.35)",
                    }}
                    placeholder={t("emailPlaceholder")}
                    autoComplete="email"
                    inputMode="email"
                  />
                </Field>

                {/* uploads */}
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "rgba(0,0,0,0.22)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-black">
                      {t("documentsOptional")}
                    </div>
                    <div className="text-[11px] text-white/55">
                      {t("fasterPickup")}
                    </div>
                  </div>
                  <div className="mt-1 text-[12px] text-white/65">
                    {t("documentsDesc")}
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <UploadField
                      label={t("dlFront")}
                      file={dlFront}
                      onFile={(f) => setDlFront(f)}
                      brandColor={ORANGE}
                      chooseHint={t("chooseFilesHint")}
                      removeText={t("remove")}
                    />
                    <UploadField
                      label={t("dlBack")}
                      file={dlBack}
                      onFile={(f) => setDlBack(f)}
                      brandColor={ORANGE}
                      chooseHint={t("chooseFilesHint")}
                      removeText={t("remove")}
                    />
                    <UploadField
                      label={t("idFront")}
                      file={idFront}
                      onFile={(f) => setIdFront(f)}
                      brandColor={ORANGE}
                      chooseHint={t("chooseFilesHint")}
                      removeText={t("remove")}
                    />
                    <UploadField
                      label={t("idBack")}
                      file={idBack}
                      onFile={(f) => setIdBack(f)}
                      brandColor={ORANGE}
                      chooseHint={t("chooseFilesHint")}
                      removeText={t("remove")}
                    />
                  </div>
                </div>

                <Field label={t("notesLabel")}>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full min-h-[85px] rounded-2xl border px-4 py-3 text-[14px] font-semibold text-white/90 outline-none"
                    style={{
                      borderColor: "rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.35)",
                    }}
                    placeholder={t("notesPlaceholder")}
                  />
                </Field>
              </div>
            </div>

            {/* payment */}
            <div
              className="rounded-3xl border p-4 md:p-5"
              style={{
                borderColor: "rgba(255,255,255,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-black">{t("payment")}</div>
                  <div className="mt-1 text-[12px] text-white/65">
                    {t("pay")}{" "}
                    <span style={{ color: ORANGE, fontWeight: 900 }}>
                      {t("percent50")}
                    </span>{" "}
                    {t("now")} • {t("payRemaining")}{" "}
                    <span style={{ color: ORANGE, fontWeight: 900 }}>
                      {t("percent50")}
                    </span>{" "}
                    {t("atPickupOffice")}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-white/55">
                    {t("onlineToday")}
                  </div>
                  <div className="text-xl font-black" style={{ color: ORANGE }}>
                    €{money(payNow)}
                  </div>
                </div>
              </div>

              {/* SIMPLE breakdown */}
              <div
                className="mt-4 rounded-2xl border p-4 text-[13px]"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                <Row
                  left={<span className="text-white/70">{t("payNow50")}</span>}
                  right={
                    <span className="font-black text-white/90">
                      €{money(payNow)}
                    </span>
                  }
                />
                <div className="mt-2">
                  <Row
                    left={
                      <span className="text-white/70">{t("payPickup50")}</span>
                    }
                    right={
                      <span className="font-black text-white/90">
                        €{money(payPickup)}
                      </span>
                    }
                  />
                </div>

                <div
                  className="mt-3 pt-3 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.10)" }}
                >
                  <Row
                    left={
                      <span className="text-white/55">{t("rentalTotal")}</span>
                    }
                    right={
                      <span className="font-black text-white/80">
                        €{money(total)}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* checkboxes */}
              <div
                className="mt-4 rounded-2xl border p-4 space-y-3"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.25)",
                }}
              >
                <CheckLine
                  checked={contractReadyOk}
                  onChange={setContractReadyOk}
                  text={t("checkContractReady")}
                />
                <CheckLine
                  checked={agreeTerms}
                  onChange={setAgreeTerms}
                  text={t("checkAgreeTerms")}
                />
                <CheckLine
                  checked={marketingOptIn}
                  onChange={setMarketingOptIn}
                  text={t("checkMarketing")}
                  optional
                />
              </div>

              {/* CTA */}
              <button
                onClick={payNowAction}
                disabled={!canPay}
                className="mt-4 w-full rounded-2xl px-6 py-4 text-[14px] font-black text-black transition"
                style={{
                  background: canPay
                    ? "linear-gradient(180deg, rgba(255,122,0,1), rgba(255,122,0,0.92))"
                    : "rgba(255,255,255,0.10)",
                  boxShadow: "none",
                  opacity: canPay ? 1 : 0.6,
                  cursor: canPay ? "pointer" : "not-allowed",
                }}
              >
                {t("pay50NowAndBook")}
              </button>

              {/* IMPORTANT deposit reminder (highlighted & near button) */}
              <div
                className="mt-3 rounded-2xl border p-3 text-[12px]"
                style={{
                  borderColor: "rgba(255,122,0,0.35)",
                  background: "rgba(255,122,0,0.08)",
                }}
              >
                <div className="font-black" style={{ color: ORANGE }}>
                  {t("depositImportantTitle")}
                </div>
                <div className="mt-1 text-white/75">
                  {t("depositTextBefore")}{" "}
                  <span className="font-black" style={{ color: "#FFB074" }}>
                    €{deposit}
                  </span>{" "}
                  {t("depositTextAfter")}
                </div>
              </div>

              {!canPay && (
                <div className="mt-3 text-[11px] text-white/45">
                  {t("toContinue")}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/55">
                <span>{t("secureCheckout")}</span>
                <span className="text-white/35">•</span>
                <span>{t("localSupport")}</span>
                <span className="text-white/35">•</span>
                <span>{t("noHiddenFees")}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------------- UI components ---------------- */

function Chip({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-black"
      style={{
        borderColor: accent
          ? "rgba(255,122,0,0.30)"
          : "rgba(255,255,255,0.12)",
        background: accent ? "rgba(255,122,0,0.10)" : "rgba(255,255,255,0.03)",
        color: accent ? "#FFB074" : "rgba(255,255,255,0.86)",
      }}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
        color: "rgba(255,255,255,0.78)",
      }}
    >
      {children}
    </span>
  );
}

function Included({
  title,
  sub,
  badge,
}: {
  title: string;
  sub: string;
  badge: string;
}) {
  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <div className="text-[13px] font-black">{title}</div>
      <div className="mt-1 text-[12px] text-white/65">{sub}</div>
      <div
        className="mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black"
        style={{ background: "rgba(255,122,0,0.12)", color: "#FFB074" }}
      >
        {badge}
      </div>
    </div>
  );
}

/* ✅ NEW: tiny included (mobile/tablet only) */
function IncludedMini({
  title,
  sub,
  badge,
}: {
  title: string;
  sub: string;
  badge: string;
}) {
  return (
    <div
      className="flex-shrink-0 rounded-2xl border px-3 py-2"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <div className="text-[12px] font-black leading-tight">{title}</div>
      <div className="mt-0.5 text-[10px] text-white/65 leading-tight">{sub}</div>
      <div
        className="mt-2 inline-flex rounded-full px-2 py-[3px] text-[9px] font-black"
        style={{ background: "rgba(255,122,0,0.12)", color: "#FFB074" }}
      >
        {badge}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[12px] font-black text-white/80">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 truncate">{left}</div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

function CheckLine({
  checked,
  onChange,
  text,
  optional,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: string;
  optional?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4"
        style={{ accentColor: ORANGE }}
      />
      <span
        className={`text-[12px] ${optional ? "text-white/65" : "text-white/70"}`}
      >
        {text}
      </span>
    </label>
  );
}

function UploadField({
  label,
  file,
  onFile,
  brandColor,
  chooseHint,
  removeText,
}: {
  label: string;
  file: File | null;
  onFile: (f: File | null) => void;
  brandColor: string;
  chooseHint: string;
  removeText: string;
}) {
  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        borderColor: "rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <div className="text-[12px] font-black text-white/80">{label}</div>

      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          className="w-full text-[12px]"
          style={{
            color: brandColor,
          }}
        />
      </div>

      {file ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-[11px]">
          <span className="text-white/60 truncate">{file.name}</span>
          <button
            type="button"
            onClick={() => onFile(null)}
            className="rounded-full px-3 py-1 font-black border hover:bg-white/5 transition"
            style={{ borderColor: "rgba(255,255,255,0.12)", color: "#FFB074" }}
          >
            {removeText}
          </button>
        </div>
      ) : (
        <div className="mt-2 text-[11px]" style={{ color: brandColor }}>
          {chooseHint}
        </div>
      )}
    </div>
  );
}