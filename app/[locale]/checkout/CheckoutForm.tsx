"use client";

import { useEffect, useMemo, useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";

const MAPS_LINK = "https://maps.app.goo.gl/L7bRwgirZLcjQqT37";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type CheckoutFormProps = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

type BookingDetails = {
  customerName: string;
  vehicleName: string;
  pickup: string;
  dropoff: string;
  plan: string;
  amountPaid: string;
};

function getHomeHref() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const locale = parts[0] || "en";
  return `/${locale}/home`;
}

function goHome() {
  window.location.href = getHomeHref();
}

function getFirstParam(searchParams: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && value.trim()) return value.trim();
  }

  return "";
}

function formatMoney(value?: string) {
  const cleanValue = value?.replace("€", "").replace(",", ".").trim() || "";
  const num = Number(cleanValue);

  if (!cleanValue || Number.isNaN(num)) return "";
  return `€${num.toFixed(2)}`;
}

function formatCents(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return `€${(value / 100).toFixed(2)}`;
}

function extractDate(value?: string) {
  if (!value) return "";

  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    const year = isoMatch[1];
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);

    if (year && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day} ${MONTHS[month - 1]} ${year}`;
    }
  }

  const slashMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = slashMatch[3];

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day} ${MONTHS[month - 1]} ${year}`;
    }
  }

  return "";
}

function extractTime(value?: string) {
  if (!value) return "";

  const timeMatch = value.match(/(\d{1,2}):(\d{2})(?:\s?(AM|PM|am|pm))?/);
  if (!timeMatch) return "";

  const hour = timeMatch[1];
  const minute = timeMatch[2];
  const suffix = timeMatch[3];

  return suffix
    ? `${hour}:${minute} ${suffix.toUpperCase()}`
    : `${hour}:${minute}`;
}

function joinDateTime(date: string, time: string) {
  if (date && time) return `${date} · ${time}`;
  if (date) return date;
  if (time) return time;
  return "";
}

function getBookingDetailsFromUrl(fallbackCustomerName: string): BookingDetails {
  const searchParams = new URLSearchParams(window.location.search);

  const pickupDate = extractDate(
    getFirstParam(searchParams, [
      "pickupDate",
      "pickUpDate",
      "pickup_date",
      "startDate",
      "start_date",
      "fromDate",
      "from",
    ])
  );

  const pickupTime = extractTime(
    getFirstParam(searchParams, [
      "pickupTime",
      "pickUpTime",
      "pickup_time",
      "startTime",
      "start_time",
      "fromTime",
    ])
  );

  const dropoffDate = extractDate(
    getFirstParam(searchParams, [
      "dropoffDate",
      "dropOffDate",
      "dropoff_date",
      "returnDate",
      "return_date",
      "endDate",
      "end_date",
      "toDate",
      "to",
    ])
  );

  const dropoffTime = extractTime(
    getFirstParam(searchParams, [
      "dropoffTime",
      "dropOffTime",
      "dropoff_time",
      "returnTime",
      "return_time",
      "endTime",
      "end_time",
      "toTime",
    ])
  );

  const amountFromUrl = getFirstParam(searchParams, [
    "paid",
    "amountPaid",
    "payNow",
    "total",
    "totalAmount",
    "rentalTotal",
    "price",
    "fullAmount",
    "amount",
  ]);

  return {
    customerName:
      getFirstParam(searchParams, ["customerName", "name"]) ||
      fallbackCustomerName,
    vehicleName: getFirstParam(searchParams, [
      "vehicleName",
      "assignedVehicleName",
      "vehicle",
      "scooter",
      "model",
    ]),
    pickup: joinDateTime(pickupDate, pickupTime),
    dropoff: joinDateTime(dropoffDate, dropoffTime),
    plan: getFirstParam(searchParams, [
      "plan",
      "rentalPlan",
      "duration",
      "selectedPlan",
    ]),
    amountPaid: formatMoney(amountFromUrl),
  };
}

function buildStripeReturnUrl() {
  const url = new URL(window.location.href);

  url.searchParams.delete("payment_intent");
  url.searchParams.delete("payment_intent_client_secret");
  url.searchParams.delete("redirect_status");
  url.searchParams.delete("preview_success");

  url.searchParams.set("nexa_payment_success", "1");

  return url.toString();
}

export default function CheckoutForm({
  customerName = "",
  customerEmail = "",
  customerPhone = "",
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );

  const [viewportReady, setViewportReady] = useState(false);
  const [mobilePaymentLayout, setMobilePaymentLayout] = useState(false);
  const [paymentElementReady, setPaymentElementReady] = useState(false);

  useEffect(() => {
    function updateViewport() {
      setMobilePaymentLayout(window.innerWidth < 768);
      setViewportReady(true);
    }

    updateViewport();

    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  useEffect(() => {
    setPaymentElementReady(false);
  }, [mobilePaymentLayout, customerName, customerEmail, customerPhone]);

  const paymentElementOptions = useMemo<StripePaymentElementOptions>(() => {
    return {
      layout: mobilePaymentLayout ? "accordion" : "tabs",
      defaultValues: {
        billingDetails: {
          name: customerName || undefined,
          email: customerEmail || undefined,
          phone: customerPhone || undefined,
        },
      },
    };
  }, [mobilePaymentLayout, customerName, customerEmail, customerPhone]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const previewSuccess = searchParams.get("preview_success") === "1";
    const returnedFromStripe = searchParams.get("nexa_payment_success") === "1";
    const clientSecret = searchParams.get("payment_intent_client_secret");

    if (!previewSuccess && !returnedFromStripe) return;

    let cancelled = false;

    async function openSuccessPopup() {
      const details = getBookingDetailsFromUrl(customerName);

      let stripeAmount = "";

      if (stripe && clientSecret) {
        const result = await stripe.retrievePaymentIntent(clientSecret);

        if (result.paymentIntent) {
          stripeAmount = formatCents(result.paymentIntent.amount);
        }
      }

      if (cancelled) return;

      setBookingDetails({
        ...details,
        amountPaid:
          details.amountPaid ||
          stripeAmount ||
          (previewSuccess ? "€39.00" : ""),
      });

      setSuccessOpen(true);
      setLoading(false);
    }

    openSuccessPopup();

    return () => {
      cancelled = true;
    };
  }, [customerName, stripe]);

  useEffect(() => {
    if (!successOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [successOpen]);

  function handlePaymentElementReady() {
    setPaymentElementReady(true);
    setMsg(null);

    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById("nexa-stripe-payment-element")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }, 120);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!stripe || !elements) {
      setMsg("Secure payment is still loading. Please wait a moment.");
      return;
    }

    if (!paymentElementReady) {
      setMsg("Payment form is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setMsg(submitError.message || "Please check your payment details.");
      setLoading(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: buildStripeReturnUrl(),
        payment_method_data: {
          billing_details: {
            name: customerName || undefined,
            email: customerEmail || undefined,
            phone: customerPhone || undefined,
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      setMsg(error.message || "Payment failed. Please try again.");
      setLoading(false);
      return;
    }

    const details = getBookingDetailsFromUrl(customerName);

    setBookingDetails({
      ...details,
      amountPaid: details.amountPaid || formatCents(paymentIntent?.amount),
    });

    setSuccessOpen(true);
    setLoading(false);
  }

  const readyToPay = Boolean(
    stripe && elements && viewportReady && paymentElementReady && !loading
  );

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="nexa-payment-form relative border border-black/10 bg-white p-5 shadow-none md:p-6"
      >
        <div className="mb-5 border-b border-black/10 pb-4">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
            Secure payment
          </div>

          <h2 className="mt-2 text-[28px] font-black leading-none tracking-[-0.045em] text-black">
            Payment details
          </h2>

          <p className="mt-2 max-w-xl text-[13px] font-medium leading-6 text-black/58">
            Enter your secure payment details below to complete your booking.
          </p>
        </div>

        <div className="nexa-payment-element-card rounded-none border border-black/10 bg-[#f7f7f7] p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between gap-4 border-b border-black/10 pb-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/42">
                Card / payment method
              </div>

              <div className="mt-1 text-[13px] font-black text-black">
                Enter your secure payment details below
              </div>
            </div>

            <div className="hidden rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-black/50 sm:block">
              Stripe secure
            </div>
          </div>

          {!paymentElementReady ? (
            <div className="nexa-payment-loading mb-3 rounded-none border border-black/10 bg-white px-4 py-3 text-[12px] font-bold text-black/50">
              Loading secure payment form...
            </div>
          ) : null}

          <div
            id="nexa-stripe-payment-element"
            className="nexa-stripe-payment-element"
          >
            {viewportReady ? (
              <PaymentElement
                key={mobilePaymentLayout ? "payment-mobile" : "payment-desktop"}
                options={paymentElementOptions}
                onReady={handlePaymentElementReady}
                onChange={() => {
                  if (!paymentElementReady) {
                    setPaymentElementReady(true);
                  }
                }}
              />
            ) : (
              <div className="py-6 text-[13px] font-bold text-black/45">
                Preparing secure payment...
              </div>
            )}
          </div>
        </div>

        {msg ? (
          <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-bold leading-5 text-red-700">
            {msg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!readyToPay}
          className={[
            "nexa-payment-submit mt-5 min-h-[56px] w-full bg-black px-5 text-[13px] font-black uppercase tracking-[0.18em] text-white transition duration-200 active:scale-[0.98]",
            readyToPay
              ? "shadow-[0_14px_34px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 hover:bg-[#222] hover:shadow-[0_20px_46px_rgba(0,0,0,0.22)] active:translate-y-0"
              : "cursor-not-allowed bg-black/20 text-black/35",
          ].join(" ")}
        >
          {loading
            ? "Processing payment..."
            : paymentElementReady
              ? "Pay now"
              : "Loading payment..."}
        </button>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <TrustPill text="Encrypted payment" />
          <TrustPill text="Fast confirmation" />
          <TrustPill text="No hidden fees" />
        </div>
      </form>

      {successOpen ? (
        <BookingConfirmedModal bookingDetails={bookingDetails} />
      ) : null}

      <style jsx global>{`
        .nexa-payment-form {
          overflow: visible;
        }

        .nexa-payment-element-card {
          overflow: visible;
        }

        .nexa-stripe-payment-element {
          width: 100%;
          min-width: 0;
          overflow: visible;
        }

        @media (max-width: 767px) {
          .nexa-payment-form {
            border-left: 0 !important;
            border-right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            padding-bottom: calc(env(safe-area-inset-bottom) + 32px) !important;
            overflow: visible !important;
          }

          .nexa-payment-element-card {
            min-height: 430px !important;
            overflow: visible !important;
            padding: 12px !important;
          }

          .nexa-payment-loading {
            position: relative;
            z-index: 1;
          }

          .nexa-stripe-payment-element {
            min-height: 360px !important;
            overflow: visible !important;
            padding-bottom: 18px !important;
          }

          .nexa-stripe-payment-element iframe {
            width: 100% !important;
            display: block !important;
          }

          .nexa-payment-submit {
            position: sticky;
            bottom: max(10px, env(safe-area-inset-bottom));
            z-index: 20;
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22);
          }
        }

        @media (max-width: 390px) {
          .nexa-payment-element-card {
            min-height: 410px !important;
            padding: 10px !important;
          }

          .nexa-stripe-payment-element {
            min-height: 340px !important;
          }

          .nexa-payment-form h2 {
            font-size: 24px !important;
          }

          .nexa-payment-form p {
            font-size: 12px !important;
            line-height: 20px !important;
          }
        }

        @media (max-height: 720px) and (max-width: 430px) {
          .nexa-payment-element-card {
            min-height: 390px !important;
          }

          .nexa-stripe-payment-element {
            min-height: 320px !important;
          }
        }
      `}</style>
    </>
  );
}

function BookingConfirmedModal({
  bookingDetails,
}: {
  bookingDetails: BookingDetails | null;
}) {
  const hasBookingDetails = Boolean(
    bookingDetails?.vehicleName ||
      bookingDetails?.customerName ||
      bookingDetails?.pickup ||
      bookingDetails?.dropoff ||
      bookingDetails?.plan ||
      bookingDetails?.amountPaid
  );

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/35 px-4 py-5 font-sans backdrop-blur-sm sm:px-6">
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-[740px] rounded-[12px] border border-black/10 bg-white px-5 py-5 shadow-[0_28px_110px_rgba(0,0,0,0.24)] sm:px-7 sm:py-6">
          <button
            type="button"
            onClick={goHome}
            aria-label="Close confirmation and return home"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-black leading-none text-black/50 transition hover:bg-black hover:text-white"
          >
            ×
          </button>

          <div className="text-center">
            <div className="text-[52px] font-black leading-none text-[#149447] sm:text-[60px]">
              ✓
            </div>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.28em] text-black/40">
              Payment received
            </p>

            <h2 className="mt-2 font-sans text-3xl font-black leading-none tracking-[-0.055em] text-black sm:text-4xl">
              Booking confirmed
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-[12px] font-semibold leading-5 text-black/55 sm:text-[13px]">
              Your payment was received and your booking is now confirmed.
            </p>
          </div>

          <div className="my-4 h-px bg-black/10" />

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
                Booking details
              </p>

              <h3 className="mt-1 font-sans text-lg font-black tracking-[-0.035em] text-black">
                Your ride is reserved
              </h3>

              <div className="mt-3">
                {hasBookingDetails ? (
                  <>
                    <ModalDetailRow
                      label="Vehicle"
                      value={bookingDetails?.vehicleName}
                    />
                    <ModalDetailRow
                      label="Customer"
                      value={bookingDetails?.customerName}
                    />
                    <ModalDetailRow
                      label="Pickup"
                      value={bookingDetails?.pickup}
                    />
                    <ModalDetailRow
                      label="Return"
                      value={bookingDetails?.dropoff}
                    />
                    <ModalDetailRow label="Plan" value={bookingDetails?.plan} />
                    <ModalDetailRow
                      label="Paid"
                      value={bookingDetails?.amountPaid}
                    />
                  </>
                ) : (
                  <p className="rounded-[10px] border border-black/10 bg-[#fafafa] px-4 py-3 text-[12px] font-semibold leading-5 text-black/60">
                    Your booking is confirmed. The full booking details are saved
                    with your confirmation email.
                  </p>
                )}
              </div>

              <div className="mt-4">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
                  Pickup location
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-[9px] bg-black px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#222]"
                  >
                    Our Location
                  </a>

                  <button
                    type="button"
                    onClick={goHome}
                    className="inline-flex items-center justify-center rounded-[9px] border border-black/10 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#f4f4f1]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-black/38">
                Bring these at pickup
              </p>

              <h3 className="mt-1 font-sans text-lg font-black tracking-[-0.035em] text-black">
                Pickup notes
              </h3>

              <div className="mt-3 space-y-3.5">
                <PickupNote
                  number="1"
                  title="Passport / ID"
                  text="Bring your original passport or national ID."
                />

                <PickupNote
                  number="2"
                  title="Valid driving licence"
                  text="A, A1, A2 or B licence held for 3+ years."
                />

                <PickupNote
                  number="3"
                  title="€150 refundable deposit"
                  text="Handled at pickup by cash or card."
                />
              </div>

              <p className="mt-4 rounded-[10px] border border-black/10 bg-[#fafafa] px-4 py-3 text-[11px] font-semibold leading-5 text-black/58">
                Please arrive at your pickup time so we can prepare your scooter
                and make the handover fast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalDetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[84px_1fr] gap-3 border-b border-black/10 py-2 last:border-b-0 sm:grid-cols-[104px_1fr]">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/38">
        {label}
      </p>
      <p className="text-[12px] font-black leading-5 text-black sm:text-[13px]">
        {value}
      </p>
    </div>
  );
}

function PickupNote({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#f4f4f1] text-[10px] font-black text-black">
        {number}
      </div>

      <div>
        <p className="text-[12px] font-black leading-5 text-black">{title}</p>
        <p className="text-[11px] font-semibold leading-5 text-black/55">
          {text}
        </p>
      </div>
    </div>
  );
}

function TrustPill({ text }: { text: string }) {
  return (
    <div className="border border-black/10 bg-white px-3 py-2 text-center text-[11px] font-black text-black/52">
      {text}
    </div>
  );
}