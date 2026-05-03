"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../../Navbar";
import { useLocale, useTranslations } from "next-intl";
import CheckoutShell from "./CheckoutShell";

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

/* ---------------- fleet ---------------- */
const VEHICLES: Vehicle[] = [
  {
    id: "s1",
    name: "ZONTES 125E",
    type: "Scooter",
    pricePerDay: 49,
    imageUrl: "/images/zontes125.png",
    badges: ["Premium", "Performance"],
    spec1: "125cc • Automatic",
    spec2: "Phone holder • 2 Helmets",
  },
  {
    id: "s2",
    name: "PIAGGIO LIBERTY 125",
    type: "Scooter",
    pricePerDay: 39,
    imageUrl: "/images/liberty125.png",
    badges: ["Popular", "Best Seller"],
    spec1: "125cc • Automatic",
    spec2: "Smooth + easy handling",
  },
  {
    id: "s3",
    name: "SYM SYMPHONY 125",
    type: "Scooter",
    pricePerDay: 39,
    imageUrl: "/images/sym1.png",
    badges: ["Comfort", "Practical"],
    spec1: "125cc • Automatic",
    spec2: "Stable city ride",
  },
  {
    id: "e2",
    name: "ENGWE M20 (JOY)",
    type: "E-Bike",
    pricePerDay: 28,
    imageUrl: "/images/e20.png",
    badges: ["Practical", "Power"],
    spec1: "Up to 60km range",
    spec2: "Great value",
  },
  {
    id: "e3",
    name: "P275 SE (Comfort)",
    type: "E-Bike",
    pricePerDay: 28,
    imageUrl: "/images/ebike-urban.png",
    badges: ["Comfort", "Stable"],
    spec1: "Up to 45km range",
    spec2: "Easy for everyone",
  },
];

/* ---------------- theme ---------------- */
const ORANGE = "#FF7A00";
const BLUE = "#00D9FF";
const PURPLE = "#8B5CF6";
const BG = "#050505";

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

function discountedPricePerDay(vehicle: Vehicle, days: number) {
  const safeDays = Math.max(1, days);

  const ladderRatios: Record<number, number> = {
    1: 1,
    2: 42 / 45,
    3: 39 / 45,
    4: 37 / 45,
    5: 35 / 45,
  };

  const step = safeDays >= 5 ? 5 : safeDays;
  return Math.round(vehicle.pricePerDay * ladderRatios[step]);
}

function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function phoneOk(v: string) {
  const digits = v.replace(/[^\d+]/g, "");
  return digits.length >= 7;
}

function eur(n: number) {
  return n.toFixed(2);
}

function eurFromCents(cents: number) {
  return (cents / 100).toFixed(2);
}

/* ---------------- compression ---------------- */
const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.72;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const imageBitmap = await createImageBitmap(file);

  let width = imageBitmap.width;
  let height = imageBitmap.height;

  if (width > MAX_IMAGE_WIDTH) {
    const ratio = MAX_IMAGE_WIDTH / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Image compression failed"));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, "");

  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/* ---------------- page ---------------- */
export default function CheckoutClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const t = useTranslations("checkout");
  const locale = useLocale();

  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const surnameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  const [checkoutSide, setCheckoutSide] = useState<"details" | "payment">(
    "details"
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      firstNameRef.current?.focus();
    }, 180);

    return () => window.clearTimeout(timer);
  }, []);

  const moveToNextField = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  ) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    nextRef?.current?.focus();
  };

  const pickupLocation =
    safeParam(sp, "pickupLocation") ?? t("defaultPickupLocation");

  const from = parseISO(safeParam(sp, "from"));
  const to = parseISO(safeParam(sp, "to"));
  const pickupTime = safeParam(sp, "pickupTime") ?? "10:00";
  const dropoffTime = safeParam(sp, "dropoffTime") ?? "10:00";
  const plan = safeParam(sp, "plan") ?? "full";

  const vehicleId = safeParam(sp, "vehicleId") ?? "s2";

  const vehicle = useMemo(
    () => VEHICLES.find((v) => v.id === vehicleId) ?? VEHICLES[1],
    [vehicleId]
  );

  const rentalDaysFromParams = Number(safeParam(sp, "days") ?? "");
  const rateFromParams = Number(safeParam(sp, "rate") ?? "");
  const totalFromParams = Number(safeParam(sp, "total") ?? "");

  const rentalDays = useMemo(() => {
    if (Number.isFinite(rentalDaysFromParams) && rentalDaysFromParams > 0) {
      return rentalDaysFromParams;
    }

    return daysBetween(from, to);
  }, [from, to, rentalDaysFromParams]);

  const discountedPerDayEur = useMemo(() => {
    if (Number.isFinite(rateFromParams) && rateFromParams > 0) {
      return rateFromParams;
    }

    return discountedPricePerDay(vehicle, rentalDays);
  }, [rateFromParams, vehicle, rentalDays]);

  const totalEur = useMemo(() => {
    if (Number.isFinite(totalFromParams) && totalFromParams > 0) {
      return totalFromParams;
    }

    return discountedPerDayEur * rentalDays;
  }, [totalFromParams, discountedPerDayEur, rentalDays]);

  const totalCents = Math.round(totalEur * 100);
  const payNowCents = Math.round(totalCents * 0.5);
  const payPickupCents = totalCents - payNowCents;

  const isHalfDay = plan === "half";
  const planLabel = isHalfDay ? "Half Day" : "Full Day";

  const durationLabel = isHalfDay
    ? "Half Day"
    : `${rentalDays} ${t(rentalDays > 1 ? "daysPlural" : "daysSingular")}`;

  const referencePrice = isHalfDay ? 45 : 55;

  const discountPct = Math.max(
    0,
    Math.round(((referencePrice - discountedPerDayEur) / referencePrice) * 100)
  );

  const deposit = 150;

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [dlFront, setDlFront] = useState<File | null>(null);
  const [dlBack, setDlBack] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);

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

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const backToVehicles = () => {
    router.push(`/${locale}/vehicles?${sp.toString()}`);
  };

  async function uploadBookingDocuments(
    bookingId: string
  ): Promise<UploadedDocumentPaths> {
    const emptyDocs = {
      dlFrontPath: "",
      dlBackPath: "",
      idFrontPath: "",
      idBackPath: "",
      dlFrontName: "",
      dlBackName: "",
      idFrontName: "",
      idBackName: "",
    };

    if (!dlFront && !dlBack && !idFront && !idBack) {
      return emptyDocs;
    }

    const formData = new FormData();
    formData.append("bookingId", bookingId);

    if (dlFront) formData.append("dlFront", dlFront);
    if (dlBack) formData.append("dlBack", dlBack);
    if (idFront) formData.append("idFront", idFront);
    if (idBack) formData.append("idBack", idBack);

    const res = await fetch("/api/stripe/upload-booking-documents", {
      method: "POST",
      body: formData,
    });

    const rawText = await res.text();

    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      throw new Error(
        "Document upload returned an invalid response. Please continue without documents or try again."
      );
    }

    if (!res.ok) {
      throw new Error(data?.error || "Document upload failed.");
    }

    return {
      dlFrontPath: data?.dlFrontPath || "",
      dlBackPath: data?.dlBackPath || "",
      idFrontPath: data?.idFrontPath || "",
      idBackPath: data?.idBackPath || "",
      dlFrontName: data?.dlFrontName || dlFront?.name || "",
      dlBackName: data?.dlBackName || dlBack?.name || "",
      idFrontName: data?.idFrontName || idFront?.name || "",
      idBackName: data?.idBackName || idBack?.name || "",
    };
  }

  const payNowAction = async () => {
    if (!canPay) return;

    if (clientSecret) {
      setCheckoutSide("payment");
      window.setTimeout(() => {
        document
          .getElementById("nexa-payment-card")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }

    try {
      setPayError(null);
      setPayLoading(true);

      const bookingId = `bk_${vehicle.id}_${Date.now()}`;
      const customerName = `${firstName.trim()} ${surname.trim()}`.trim();

      const uploadedDocs = await uploadBookingDocuments(bookingId);

      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          totalAmount: totalCents,
          currency: "eur",
          customerEmail: email.trim(),
          customerName,
          phone: phone.trim(),
          pickupDateISO: from ? from.toLocaleDateString("en-CA") : "",
          returnDateISO: to ? to.toLocaleDateString("en-CA") : "",
          pickupTime,
          dropoffTime,
          pickupLocation,
          bikeName: vehicle.name,
          vehicleId: vehicle.id,
          plan,
          ratePerDay: discountedPerDayEur,
          notes: notes.trim(),
          dlFrontName: uploadedDocs.dlFrontName,
          dlBackName: uploadedDocs.dlBackName,
          idFrontName: uploadedDocs.idFrontName,
          idBackName: uploadedDocs.idBackName,
          dlFrontPath: uploadedDocs.dlFrontPath,
          dlBackPath: uploadedDocs.dlBackPath,
          idFrontPath: uploadedDocs.idFrontPath,
          idBackPath: uploadedDocs.idBackPath,
          marketingOptIn,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.clientSecret) {
        throw new Error(data?.error || "Payment init failed. Try again.");
      }

      setClientSecret(data.clientSecret);

      window.setTimeout(() => {
        setCheckoutSide("payment");

        window.setTimeout(() => {
          document
            .getElementById("nexa-payment-card")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }, 160);
    } catch (e: any) {
      setPayError(e.message || "Something went wrong.");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ background: BG }}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,122,0,0.10),transparent_25%),radial-gradient(circle_at_92%_12%,rgba(0,217,255,0.08),transparent_25%),radial-gradient(circle_at_50%_88%,rgba(139,92,246,0.08),transparent_28%),linear-gradient(180deg,#040404_0%,#090909_45%,#040404_100%)]" />
        <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -left-24 top-32 h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute right-[-140px] top-44 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <header className="mb-5 lg:mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/72 backdrop-blur-xl sm:text-xs sm:tracking-[0.18em]">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ backgroundColor: ORANGE }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ORANGE }}
                  />
                </span>
                {t("step2of2")} • Secure Reservation
              </div>

              <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.92] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl lg:mt-5">
                {t("confirmAndPay")}{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, ${BLUE})`,
                  }}
                >
                  {t("in60Seconds")}
                </span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58 md:text-base lg:mt-5">
                Review your booking, add your details, upload documents if you
                want faster pickup, and complete your 50% reservation payment
                with a clean two-step checkout.
              </p>
            </div>

            <button
              onClick={backToVehicles}
              className="group inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/12 bg-white/8 px-6 text-sm font-black text-white shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-orange-400/35 hover:bg-white/12"
            >
              ← {t("backToVehicles")}
            </button>
          </div>

          <div className="mt-6 hidden gap-3 sm:grid-cols-2 xl:grid-cols-5 lg:grid">
            <Chip>{pickupLocation}</Chip>
            <Chip>{planLabel}</Chip>
            <Chip>
              {fmtDate(from, locale)} • {formatTimeLabel(pickupTime, locale)}
            </Chip>
            <Chip>
              {fmtDate(to, locale)} • {formatTimeLabel(dropoffTime, locale)}
            </Chip>
            {discountPct > 0 ? (
              <Chip accent>{t("savePct", { pct: discountPct })}</Chip>
            ) : (
              <Chip>{durationLabel}</Chip>
            )}
          </div>
        </header>

        {/* ---------------- MOBILE CHECKOUT ---------------- */}
        <div className="lg:hidden">
          <MobileBookingSummary
            vehicle={vehicle}
            pickupLocation={pickupLocation}
            from={from}
            to={to}
            pickupTime={pickupTime}
            dropoffTime={dropoffTime}
            locale={locale}
            planLabel={planLabel}
            durationLabel={durationLabel}
            discountedPerDayEur={discountedPerDayEur}
            totalEur={totalEur}
            payNowCents={payNowCents}
            payPickupCents={payPickupCents}
            discountPct={discountPct}
            t={t}
          />

          <section className="relative mt-4">
            <div className="nexa-flip-scene nexa-mobile-flip-scene">
              <div
                className={[
                  "nexa-flip-card nexa-mobile-flip-card",
                  checkoutSide === "payment" ? "nexa-flipped" : "",
                ].join(" ")}
              >
                <div className="nexa-card-face nexa-card-front">
                  <GlassCard fullHeight mobile>
                    <CheckoutDetailsSide
                      t={t}
                      firstName={firstName}
                      setFirstName={setFirstName}
                      surname={surname}
                      setSurname={setSurname}
                      phone={phone}
                      setPhone={setPhone}
                      email={email}
                      setEmail={setEmail}
                      notes={notes}
                      setNotes={setNotes}
                      firstNameRef={firstNameRef}
                      surnameRef={surnameRef}
                      phoneRef={phoneRef}
                      emailRef={emailRef}
                      notesRef={notesRef}
                      moveToNextField={moveToNextField}
                      dlFront={dlFront}
                      dlBack={dlBack}
                      idFront={idFront}
                      idBack={idBack}
                      setDlFront={setDlFront}
                      setDlBack={setDlBack}
                      setIdFront={setIdFront}
                      setIdBack={setIdBack}
                      contractReadyOk={contractReadyOk}
                      setContractReadyOk={setContractReadyOk}
                      agreeTerms={agreeTerms}
                      setAgreeTerms={setAgreeTerms}
                      marketingOptIn={marketingOptIn}
                      setMarketingOptIn={setMarketingOptIn}
                      planLabel={planLabel}
                      payNowCents={payNowCents}
                      payPickupCents={payPickupCents}
                      totalCents={totalCents}
                      deposit={deposit}
                      canPay={canPay}
                      payLoading={payLoading}
                      payError={payError}
                      onContinue={payNowAction}
                      mobile
                    />
                  </GlassCard>
                </div>

                <div
                  id="nexa-payment-card"
                  className="nexa-card-face nexa-card-back"
                >
                  <GlassCard fullHeight mobile>
                    <PaymentSide
                      t={t}
                      planLabel={planLabel}
                      payNowCents={payNowCents}
                      payPickupCents={payPickupCents}
                      deposit={deposit}
                      clientSecret={clientSecret}
                      onEdit={() => setCheckoutSide("details")}
                      mobile
                    />
                  </GlassCard>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ---------------- DESKTOP CHECKOUT - KEPT SAME ---------------- */}
        <div className="hidden grid-cols-1 gap-6 lg:grid lg:grid-cols-[1.02fr_0.98fr] xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <VehicleCard
              vehicle={vehicle}
              discountPct={discountPct}
              referencePrice={referencePrice}
              discountedPerDayEur={discountedPerDayEur}
              totalEur={totalEur}
              planLabel={planLabel}
              durationLabel={durationLabel}
              t={t}
            />

            <GlassCard compact>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-black/40">
                    {t("included")}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-black">
                    Premium pickup package
                  </h2>
                </div>

                <div className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-bold text-black/48">
                  {t("noExtraFees")}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
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

              <div className="mt-5 rounded-3xl border border-orange-400/25 bg-orange-400/8 p-5">
                <div className="text-sm font-black text-black">
                  {t("contractReadyTitle")}
                </div>

                <div className="mt-2 text-sm leading-7 text-black/62">
                  {t("contractReadyDesc")}
                </div>
              </div>
            </GlassCard>
          </section>

          <section className="relative">
            <div className="nexa-flip-scene">
              <div
                className={[
                  "nexa-flip-card",
                  checkoutSide === "payment" ? "nexa-flipped" : "",
                ].join(" ")}
              >
                <div className="nexa-card-face nexa-card-front">
                  <GlassCard fullHeight>
                    <CheckoutDetailsSide
                      t={t}
                      firstName={firstName}
                      setFirstName={setFirstName}
                      surname={surname}
                      setSurname={setSurname}
                      phone={phone}
                      setPhone={setPhone}
                      email={email}
                      setEmail={setEmail}
                      notes={notes}
                      setNotes={setNotes}
                      firstNameRef={firstNameRef}
                      surnameRef={surnameRef}
                      phoneRef={phoneRef}
                      emailRef={emailRef}
                      notesRef={notesRef}
                      moveToNextField={moveToNextField}
                      dlFront={dlFront}
                      dlBack={dlBack}
                      idFront={idFront}
                      idBack={idBack}
                      setDlFront={setDlFront}
                      setDlBack={setDlBack}
                      setIdFront={setIdFront}
                      setIdBack={setIdBack}
                      contractReadyOk={contractReadyOk}
                      setContractReadyOk={setContractReadyOk}
                      agreeTerms={agreeTerms}
                      setAgreeTerms={setAgreeTerms}
                      marketingOptIn={marketingOptIn}
                      setMarketingOptIn={setMarketingOptIn}
                      planLabel={planLabel}
                      payNowCents={payNowCents}
                      payPickupCents={payPickupCents}
                      totalCents={totalCents}
                      deposit={deposit}
                      canPay={canPay}
                      payLoading={payLoading}
                      payError={payError}
                      onContinue={payNowAction}
                    />
                  </GlassCard>
                </div>

                <div
                  id="nexa-payment-card"
                  className="nexa-card-face nexa-card-back"
                >
                  <GlassCard fullHeight>
                    <PaymentSide
                      t={t}
                      planLabel={planLabel}
                      payNowCents={payNowCents}
                      payPickupCents={payPickupCents}
                      deposit={deposit}
                      clientSecret={clientSecret}
                      onEdit={() => setCheckoutSide("details")}
                    />
                  </GlassCard>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        .nexa-flip-scene {
          width: 100%;
          min-height: 1060px;
          perspective: 1800px;
        }

        .nexa-flip-card {
          position: relative;
          width: 100%;
          min-height: 1060px;
          transform-style: preserve-3d;
          transition: transform 1.05s cubic-bezier(0.18, 0.85, 0.24, 1);
          will-change: transform;
        }

        .nexa-flip-card.nexa-flipped {
          transform: rotateY(180deg);
        }

        .nexa-card-face {
          position: absolute;
          inset: 0;
          min-height: 1060px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform-style: preserve-3d;
        }

        .nexa-card-front {
          transform: rotateY(0deg);
        }

        .nexa-card-back {
          transform: rotateY(180deg);
        }

        .nexa-card-scroll {
          max-height: none;
          overflow: visible;
          padding-right: 0;
        }

        .nexa-sticky-pay {
          margin-top: 18px;
          padding-top: 0;
          padding-bottom: 0;
          background: transparent;
          backdrop-filter: none;
        }

        .nexa-desktop-payment-scroll {
          max-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 10px;
          overscroll-behavior: contain;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 122, 0, 0.55) rgba(0, 0, 0, 0.06);
        }

        .nexa-desktop-payment-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .nexa-desktop-payment-scroll::-webkit-scrollbar-track {
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.06);
        }

        .nexa-desktop-payment-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 122, 0, 0.75),
            rgba(139, 92, 246, 0.55),
            rgba(0, 217, 255, 0.55)
          );
        }

        .nexa-desktop-payment-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(255, 122, 0, 0.95),
            rgba(139, 92, 246, 0.75),
            rgba(0, 217, 255, 0.75)
          );
        }

        @keyframes nexaPayBeat {
          0%,
          100% {
            transform: translateY(0) scale(1);
            filter: brightness(1);
          }
          50% {
            transform: translateY(-3px) scale(1.012);
            filter: brightness(1.08);
          }
        }

        @media (max-width: 1023px) {
          .nexa-mobile-flip-scene {
            min-height: 1240px;
          }

          .nexa-mobile-flip-card {
            min-height: 1240px;
          }

          .nexa-mobile-flip-card .nexa-card-face {
            min-height: 1240px;
          }
        }

        @media (max-width: 640px) {
          .nexa-mobile-flip-scene {
            min-height: 1320px;
          }

          .nexa-mobile-flip-card {
            min-height: 1320px;
          }

          .nexa-mobile-flip-card .nexa-card-face {
            min-height: 1320px;
          }
        }

        @media (max-width: 390px) {
          .nexa-mobile-flip-scene {
            min-height: 1380px;
          }

          .nexa-mobile-flip-card {
            min-height: 1380px;
          }

          .nexa-mobile-flip-card .nexa-card-face {
            min-height: 1380px;
          }
        }
      `}</style>
    </div>
  );
}

/* ---------------- mobile booking summary ---------------- */
function MobileBookingSummary({
  vehicle,
  pickupLocation,
  from,
  to,
  pickupTime,
  dropoffTime,
  locale,
  planLabel,
  durationLabel,
  discountedPerDayEur,
  totalEur,
  payNowCents,
  payPickupCents,
  discountPct,
  t,
}: {
  vehicle: Vehicle;
  pickupLocation: string;
  from?: Date;
  to?: Date;
  pickupTime: string;
  dropoffTime: string;
  locale: string;
  planLabel: string;
  durationLabel: string;
  discountedPerDayEur: number;
  totalEur: number;
  payNowCents: number;
  payPickupCents: number;
  discountPct: number;
  t: any;
}) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#f7f4ef] p-4 text-black shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-orange-400/20 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-cyan-400/15 blur-[70px]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {vehicle.badges.slice(0, 2).map((b) => (
                <Tag key={b}>{b}</Tag>
              ))}
              <Tag>{planLabel}</Tag>
            </div>

            <h2 className="mt-2 truncate text-[23px] font-black leading-none tracking-[-0.045em] text-black">
              {vehicle.name}
            </h2>

            <p className="mt-1 truncate text-xs font-semibold text-black/55">
              {vehicle.type} • {vehicle.spec1}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-black/10 bg-white/60 px-3 py-2 text-right shadow-sm">
            {discountPct > 0 && (
              <div className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-600">
                Save {discountPct}%
              </div>
            )}

            <div className="text-2xl font-black leading-none text-black">
              €{eur(totalEur)}
            </div>

            <div className="mt-1 text-[10px] font-bold text-black/45">
              Total rental
            </div>
          </div>
        </div>

        <div className="relative mt-3 h-[155px] overflow-hidden rounded-[26px] border border-black/10 bg-white/55">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.20),rgba(139,92,246,0.12),rgba(0,217,255,0.10),transparent_70%)] blur-2xl" />
          <div className="pointer-events-none absolute bottom-5 left-1/2 h-8 w-[70%] -translate-x-1/2 rounded-full bg-black/20 blur-xl" />

          <img
            src={vehicle.imageUrl}
            alt={vehicle.name}
            className="absolute inset-0 mx-auto h-full w-full object-contain p-3 drop-shadow-[0_25px_32px_rgba(0,0,0,0.35)]"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniInfo
            label="Pickup"
            value={`${fmtDate(from, locale)} • ${formatTimeLabel(
              pickupTime,
              locale
            )}`}
          />
          <MiniInfo
            label="Return"
            value={`${fmtDate(to, locale)} • ${formatTimeLabel(
              dropoffTime,
              locale
            )}`}
          />
          <MiniInfo label="Duration" value={durationLabel} />
          <MiniInfo label="Location" value={pickupLocation} />
        </div>

        <div className="mt-3 rounded-2xl border border-black/10 bg-white/55 p-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/38">
                Price breakdown
              </div>
              <div className="mt-1 text-xs font-semibold text-black/52">
                Pay 50% now and the rest at pickup.
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-black/45">
                €{eur(discountedPerDayEur)} / day
              </div>
              <div className="text-xl font-black text-black">
                €{eurFromCents(payNowCents)} now
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-black/[0.035] px-3 py-2 text-xs">
            <span className="font-semibold text-black/55">At pickup</span>
            <span className="font-black text-black">
              €{eurFromCents(payPickupCents)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <SmallIncluded>Helmet included</SmallIncluded>
          <SmallIncluded>Lock included</SmallIncluded>
          <SmallIncluded>Phone mount</SmallIncluded>
          <SmallIncluded>No extra fees</SmallIncluded>
        </div>
      </div>
    </div>
  );
}

/* ---------------- payment side ---------------- */
function PaymentSide({
  t,
  planLabel,
  payNowCents,
  payPickupCents,
  deposit,
  clientSecret,
  onEdit,
  mobile,
}: {
  t: any;
  planLabel: string;
  payNowCents: number;
  payPickupCents: number;
  deposit: number;
  clientSecret: string | null;
  onEdit: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={[
        "flex h-full flex-col",
        !mobile ? "nexa-desktop-payment-scroll" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={[
              "font-black uppercase text-black/40",
              mobile
                ? "text-[10px] tracking-[0.18em]"
                : "text-xs tracking-[0.28em]",
            ].join(" ")}
          >
            Secure card checkout
          </p>

          <h2
            className={[
              "mt-2 font-black tracking-tight text-black",
              mobile ? "text-[26px] leading-none" : "text-2xl",
            ].join(" ")}
          >
            Complete your payment
          </h2>

          <p className="mt-2 text-sm leading-6 text-black/58">
            Pay{" "}
            <span className="font-black text-black">
              €{eurFromCents(payNowCents)}
            </span>{" "}
            now to secure your booking. Remaining{" "}
            <span className="font-black text-black">
              €{eurFromCents(payPickupCents)}
            </span>{" "}
            at pickup.
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-xs font-black text-black/60 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
        >
          ← Edit
        </button>
      </div>

      <div className="mt-5 rounded-3xl border border-black/10 bg-black/[0.02] p-4 text-sm shadow-sm">
        <Row
          left={<span className="text-black/60">Selected plan</span>}
          right={<span className="font-black text-black">{planLabel}</span>}
        />

        <div className="mt-3">
          <Row
            left={<span className="text-black/60">Pay now</span>}
            right={
              <span className="font-black text-black">
                €{eurFromCents(payNowCents)}
              </span>
            }
          />
        </div>

        <div className="mt-3">
          <Row
            left={<span className="text-black/60">Pay at pickup</span>}
            right={
              <span className="font-black text-black">
                €{eurFromCents(payPickupCents)}
              </span>
            }
          />
        </div>
      </div>

      <div id="stripe-embedded" className="mt-5">
        {clientSecret ? (
          <CheckoutShell clientSecret={clientSecret} />
        ) : (
          <div className="rounded-3xl border border-black/10 bg-black/[0.02] p-6 text-sm text-black/55">
            Preparing secure checkout...
          </div>
        )}
      </div>

      <div className="mt-5 rounded-3xl border border-orange-400/25 bg-orange-400/8 p-4 text-sm leading-6">
        <div className="font-black text-black">{t("depositImportantTitle")}</div>

        <div className="mt-1 text-black/62">
          {t("depositTextBefore")}{" "}
          <span className="font-black text-black">€{eur(deposit)}</span>{" "}
          {t("depositTextAfter")}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-black/45">
        <span>{t("secureCheckout")}</span>
        <span className="text-black/25">•</span>
        <span>{t("localSupport")}</span>
        <span className="text-black/25">•</span>
        <span>{t("noHiddenFees")}</span>
      </div>
    </div>
  );
}

/* ---------------- checkout front side ---------------- */
function CheckoutDetailsSide({
  t,
  firstName,
  setFirstName,
  surname,
  setSurname,
  phone,
  setPhone,
  email,
  setEmail,
  notes,
  setNotes,
  firstNameRef,
  surnameRef,
  phoneRef,
  emailRef,
  notesRef,
  moveToNextField,
  dlFront,
  dlBack,
  idFront,
  idBack,
  setDlFront,
  setDlBack,
  setIdFront,
  setIdBack,
  contractReadyOk,
  setContractReadyOk,
  agreeTerms,
  setAgreeTerms,
  marketingOptIn,
  setMarketingOptIn,
  planLabel,
  payNowCents,
  payPickupCents,
  totalCents,
  deposit,
  canPay,
  payLoading,
  payError,
  onContinue,
  mobile,
}: {
  t: any;
  firstName: string;
  setFirstName: (v: string) => void;
  surname: string;
  setSurname: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  firstNameRef: React.RefObject<HTMLInputElement | null>;
  surnameRef: React.RefObject<HTMLInputElement | null>;
  phoneRef: React.RefObject<HTMLInputElement | null>;
  emailRef: React.RefObject<HTMLInputElement | null>;
  notesRef: React.RefObject<HTMLTextAreaElement | null>;
  moveToNextField: (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  ) => void;
  dlFront: File | null;
  dlBack: File | null;
  idFront: File | null;
  idBack: File | null;
  setDlFront: (f: File | null) => void;
  setDlBack: (f: File | null) => void;
  setIdFront: (f: File | null) => void;
  setIdBack: (f: File | null) => void;
  contractReadyOk: boolean;
  setContractReadyOk: (v: boolean) => void;
  agreeTerms: boolean;
  setAgreeTerms: (v: boolean) => void;
  marketingOptIn: boolean;
  setMarketingOptIn: (v: boolean) => void;
  planLabel: string;
  payNowCents: number;
  payPickupCents: number;
  totalCents: number;
  deposit: number;
  canPay: boolean;
  payLoading: boolean;
  payError: string | null;
  onContinue: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={[
              "font-black uppercase text-black/40",
              mobile
                ? "text-[10px] tracking-[0.18em]"
                : "text-xs tracking-[0.28em]",
            ].join(" ")}
          >
            Customer information
          </p>

          <h2
            className={[
              "mt-2 font-black tracking-tight text-black",
              mobile ? "text-[26px] leading-none" : "text-2xl",
            ].join(" ")}
          >
            {t("yourDetails")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-black/58">
            Fill in your details, check your booking, then continue to the
            secure payment side.
          </p>
        </div>

        <div className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-black/48">
          {t("required")} <span className="font-black text-black">*</span>
        </div>
      </div>

      <div className="mt-5 space-y-3.5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label={t("nameLabel")}>
            <TextInput
              ref={firstNameRef}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={(e) => moveToNextField(e, surnameRef)}
              placeholder={t("namePlaceholder")}
              autoComplete="given-name"
              autoFocus
            />
          </Field>

          <Field label={t("surnameLabel")}>
            <TextInput
              ref={surnameRef}
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              onKeyDown={(e) => moveToNextField(e, phoneRef)}
              placeholder={t("surnamePlaceholder")}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label={t("phoneLabel")}>
            <TextInput
              ref={phoneRef}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => moveToNextField(e, emailRef)}
              placeholder={t("phonePlaceholder")}
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>

          <Field label={t("emailLabel")}>
            <TextInput
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => moveToNextField(e, notesRef)}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              inputMode="email"
            />
          </Field>
        </div>

        <details className="group rounded-3xl border border-black/10 bg-black/[0.02] p-4 shadow-sm transition duration-300 open:bg-white/45 hover:bg-white/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-black">
            <span>
              {t("documentsOptional")}{" "}
              <span className="text-xs font-semibold text-black/45">
                — optional, faster pickup
              </span>
            </span>

            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-black/50 transition group-open:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-3 text-xs leading-6 text-black/56">
            Upload now to make the contract ready when you arrive. On mobile,
            the upload button can open the camera directly.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <UploadField
              label={t("dlFront")}
              buttonText="Front license"
              file={dlFront}
              onFile={(f) => setDlFront(f)}
              chooseHint={t("chooseFilesHint")}
              removeText={t("remove")}
            />

            <UploadField
              label={t("dlBack")}
              buttonText="Back license"
              file={dlBack}
              onFile={(f) => setDlBack(f)}
              chooseHint={t("chooseFilesHint")}
              removeText={t("remove")}
            />

            <UploadField
              label={t("idFront")}
              buttonText="Front ID / passport"
              file={idFront}
              onFile={(f) => setIdFront(f)}
              chooseHint={t("chooseFilesHint")}
              removeText={t("remove")}
            />

            <UploadField
              label={t("idBack")}
              buttonText="Back ID / passport"
              file={idBack}
              onFile={(f) => setIdBack(f)}
              chooseHint={t("chooseFilesHint")}
              removeText={t("remove")}
            />
          </div>
        </details>

        <Field label={t("notesLabel")}>
          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[72px] w-full resize-none rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm font-semibold text-black outline-none transition duration-300 placeholder:text-black/35 focus:border-orange-400/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,122,0,0.10)]"
            placeholder={t("notesPlaceholder")}
          />
        </Field>
      </div>

      <div className="mt-5 rounded-3xl border border-black/10 bg-black/[0.02] p-4 text-sm shadow-sm">
        <Row
          left={<span className="text-black/60">Selected plan</span>}
          right={<span className="font-black text-black">{planLabel}</span>}
        />

        <div className="mt-2">
          <Row
            left={<span className="text-black/60">{t("payNow50")}</span>}
            right={
              <span className="font-black text-black">
                €{eurFromCents(payNowCents)}
              </span>
            }
          />
        </div>

        <div className="mt-2">
          <Row
            left={<span className="text-black/60">{t("payPickup50")}</span>}
            right={
              <span className="font-black text-black">
                €{eurFromCents(payPickupCents)}
              </span>
            }
          />
        </div>

        <div className="mt-3 border-t border-black/10 pt-3">
          <Row
            left={<span className="text-black/48">{t("rentalTotal")}</span>}
            right={
              <span className="font-black text-black/80">
                €{eurFromCents(totalCents)}
              </span>
            }
          />
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-3xl border border-black/10 bg-black/[0.02] p-4 shadow-sm">
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

      <div className="mt-4 rounded-3xl border border-orange-400/25 bg-orange-400/8 p-4 text-sm leading-6">
        <div className="font-black text-black">{t("depositImportantTitle")}</div>

        <div className="mt-1 text-black/62">
          {t("depositTextBefore")}{" "}
          <span className="font-black text-black">€{eur(deposit)}</span>{" "}
          {t("depositTextAfter")}
        </div>
      </div>

      {payError && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
          {payError}
        </div>
      )}

      <div className="nexa-sticky-pay">
        <button
          type="button"
          onClick={onContinue}
          disabled={!canPay || payLoading}
          className={[
            "group relative min-h-[62px] w-full overflow-hidden rounded-2xl px-6 text-sm font-black text-black shadow-[0_20px_48px_rgba(255,122,0,0.28)] transition duration-300",
            canPay
              ? "animate-[nexaPayBeat_1.35s_ease-in-out_infinite] hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(255,122,0,0.36)]"
              : "cursor-not-allowed opacity-55",
          ].join(" ")}
          style={{
            background: canPay
              ? `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 32%, ${PURPLE} 66%, ${BLUE} 100%)`
              : "rgba(0,0,0,0.12)",
          }}
        >
          <span className="relative z-10 flex items-center justify-center">
            {payLoading
              ? "Preparing secure checkout..."
              : "Pay 50% reservation now"}
          </span>

          <span className="absolute inset-0 translate-x-[-120%] bg-white/40 transition duration-700 group-hover:translate-x-[120%]" />
        </button>

        {!canPay && (
          <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.03] p-3 text-xs text-black/46">
            {t("toContinue")}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI components ---------------- */
const GlassCard = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    sticky?: boolean;
    compact?: boolean;
    fullHeight?: boolean;
    mobile?: boolean;
  }
>(function GlassCard({ children, sticky, compact, fullHeight, mobile }, ref) {
  return (
    <div
      ref={ref}
      className={[
        "relative overflow-hidden border border-white/10 bg-[#f7f4ef] shadow-[0_24px_90px_rgba(0,0,0,0.18)]",
        mobile ? "rounded-[30px] p-4" : "rounded-[34px]",
        compact ? "p-5 md:p-6" : mobile ? "" : "p-5 md:p-6",
        fullHeight ? "h-full" : "",
        sticky ? "lg:sticky lg:top-6" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-400/12 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-cyan-400/12 blur-[90px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

      <div className="relative h-full">{children}</div>
    </div>
  );
});

function VehicleCard({
  vehicle,
  discountPct,
  referencePrice,
  discountedPerDayEur,
  totalEur,
  planLabel,
  durationLabel,
  t,
}: {
  vehicle: Vehicle;
  discountPct: number;
  referencePrice: number;
  discountedPerDayEur: number;
  totalEur: number;
  planLabel: string;
  durationLabel: string;
  t: any;
}) {
  return (
    <GlassCard>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {vehicle.badges.slice(0, 2).map((b) => (
              <Tag key={b}>{b}</Tag>
            ))}
            <Tag>{planLabel}</Tag>
          </div>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-black md:text-4xl">
            {vehicle.name}
          </h2>

          <div className="mt-2 text-sm leading-6 text-black/60">
            {vehicle.type} • {vehicle.spec1}
            {vehicle.spec2 ? ` • ${vehicle.spec2}` : ""}
          </div>
        </div>

        <div className="shrink-0 rounded-3xl border border-black/10 bg-black/[0.03] px-5 py-4 text-right shadow-sm">
          {discountPct > 0 && (
            <div className="text-xs font-black text-black/38">
              <span className="line-through">€{eur(referencePrice)}</span>{" "}
              {t("perDayShort")}
            </div>
          )}

          <div className="mt-1 text-3xl font-black leading-none text-black">
            €{eur(discountedPerDayEur)}
            <span className="ml-1 text-xs text-black/50">
              {t("perDayShort")}
            </span>
          </div>

          <div className="mt-2 text-xs text-black/50">
            {durationLabel} • {t("total")}:{" "}
            <span className="font-black text-black/85">€{eur(totalEur)}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-6 h-[230px] w-full md:h-[300px]">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.18),rgba(139,92,246,0.12),rgba(0,217,255,0.10),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-full bg-black/22 blur-2xl" />

        <img
          src={vehicle.imageUrl}
          alt={vehicle.name}
          className="absolute inset-0 mx-auto h-full w-full object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)] transition duration-500 hover:scale-[1.03]"
        />
      </div>
    </GlassCard>
  );
}

function Chip({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className="inline-flex min-h-[44px] items-center rounded-2xl border px-4 py-2 text-xs font-black shadow-sm backdrop-blur-xl"
      style={{
        borderColor: accent
          ? "rgba(255,122,0,0.34)"
          : "rgba(255,255,255,0.12)",
        background: accent ? "rgba(255,122,0,0.10)" : "rgba(255,255,255,0.06)",
        color: accent ? "#FFB074" : "rgba(255,255,255,0.84)",
      }}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black/60">
      {children}
    </span>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-black/10 bg-white/55 px-3 py-2 shadow-sm">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/35">
        {label}
      </div>
      <div className="mt-1 truncate text-xs font-black text-black/78">
        {value}
      </div>
    </div>
  );
}

function SmallIncluded({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.035] px-3 py-2 text-[11px] font-black text-black/62">
      ✓ {children}
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
    <div className="group rounded-3xl border border-black/10 bg-black/[0.02] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white">
      <div className="text-sm font-black text-black">{title}</div>
      <div className="mt-1 text-xs text-black/54">{sub}</div>

      <div className="mt-4 inline-flex rounded-full bg-orange-400/12 px-3 py-1 text-[10px] font-black text-black">
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
      <div className="text-xs font-black text-black/70">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function TextInput(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className="w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm font-semibold text-black outline-none transition duration-300 placeholder:text-black/35 focus:border-orange-400/60 focus:bg-white focus:shadow-[0_0_0_4px_rgba(255,122,0,0.10)]"
    />
  );
});

function Row({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
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
    <label className="group flex cursor-pointer select-none items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4"
        style={{ accentColor: ORANGE }}
      />

      <span
        className={`text-xs leading-6 ${
          optional ? "text-black/48" : "text-black/65"
        }`}
      >
        {text}
      </span>
    </label>
  );
}

function UploadField({
  label,
  buttonText,
  file,
  onFile,
  chooseHint,
  removeText,
}: {
  label: string;
  buttonText: string;
  file: File | null;
  onFile: (f: File | null) => void;
  chooseHint: string;
  removeText: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white">
      <div className="text-xs font-black text-black/72">{label}</div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          try {
            setLocalError(null);

            const selected = e.target.files?.[0] ?? null;

            if (!selected) {
              onFile(null);
              return;
            }

            const finalFile = selected.type.startsWith("image/")
              ? await compressImage(selected)
              : selected;

            onFile(finalFile);
          } catch (err: any) {
            setLocalError(err?.message || "Could not process file.");
            onFile(null);
          }
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative mt-2 min-h-[42px] w-full overflow-hidden rounded-xl px-3 text-xs font-black text-black transition duration-300 hover:-translate-y-0.5"
        style={{
          background: `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 38%, ${PURPLE} 72%, ${BLUE} 100%)`,
        }}
      >
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          <span>📄</span>
          {buttonText}
        </span>

        <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
      </button>

      {file ? (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-black/56">{file.name}</span>

          <button
            type="button"
            onClick={() => {
              setLocalError(null);
              onFile(null);

              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded-full border border-black/10 bg-white px-3 py-1 font-black text-black transition hover:bg-black/[0.02]"
          >
            {removeText}
          </button>
        </div>
      ) : (
        <div className="mt-2 text-xs text-black/46">{chooseHint}</div>
      )}

      {localError && (
        <div className="mt-2 text-xs text-red-600">{localError}</div>
      )}
    </div>
  );
}