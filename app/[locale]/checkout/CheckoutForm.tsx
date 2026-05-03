"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const ORANGE = "#FF7A00";
const BLUE = "#00D9FF";
const PURPLE = "#8B5CF6";

function localeBasePath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const locale = parts[0] ? `/${parts[0]}` : "";
  return locale;
}

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!stripe || !elements) return;

    setLoading(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setMsg(submitError.message || "Check details.");
      setLoading(false);
      return;
    }

    const base = localeBasePath();

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${base}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMsg(error.message || "Payment failed.");
      setLoading(false);
      return;
    }

    window.location.href = `${base}/checkout/success`;
  }

  const readyToPay = Boolean(stripe && elements && !loading);

  return (
    <>
      <form
        className="relative overflow-hidden rounded-[32px] border border-black/10 bg-[#FBF7EF] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.18)] md:p-6"
        onSubmit={onSubmit}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-400/16 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-cyan-400/14 blur-[95px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/10 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-black/52 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                    style={{ backgroundColor: ORANGE }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: ORANGE }}
                  />
                </span>
                Secure Card Checkout
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-black">
                Pay 50% deposit
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-black/58">
                Enter your card details securely. The remaining 50% is paid at
                pickup when you collect the vehicle.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-black/10 bg-white/72 px-3 py-2 text-right shadow-sm sm:block">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/42">
                Protected
              </div>
              <div className="mt-1 text-xs font-black text-black">
                Stripe Secure
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-black/10 bg-white/58 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_38px_rgba(0,0,0,0.08)] transition duration-300 hover:border-orange-400/25 hover:bg-white/70 md:p-4">
            <PaymentElement options={{ layout: "tabs" }} />
          </div>

          <button
            disabled={!stripe || !elements || loading}
            className={[
              "group relative mt-6 min-h-[60px] w-full overflow-hidden rounded-2xl px-4 text-black shadow-[0_18px_42px_rgba(255,122,0,0.25)] transition duration-300",
              readyToPay
                ? "nexa-pay-pulse hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(255,122,0,0.34)]"
                : "cursor-not-allowed opacity-60",
            ].join(" ")}
            style={{
              background: `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 34%, ${PURPLE} 68%, ${BLUE} 100%)`,
            }}
          >
            <span className="relative z-10 flex items-center justify-center text-[17px] font-black tracking-[-0.01em] sm:text-[18px]">
              {loading ? "Processing secure payment…" : "Pay now"}
            </span>

            <span className="absolute inset-0 translate-x-[-120%] bg-white/40 transition duration-700 group-hover:translate-x-[120%]" />
            <span className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28),transparent_55%)]" />
          </button>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <TrustPill text="Encrypted payment" />
            <TrustPill text="Fast confirmation" />
            <TrustPill text="No hidden fees" />
          </div>

          {msg && (
            <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-700">
              {msg}
            </p>
          )}
        </div>
      </form>

      <style jsx global>{`
        @keyframes nexaPayPulse {
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

        .nexa-pay-pulse {
          animation: nexaPayPulse 1.35s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

function TrustPill({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-center text-[11px] font-black text-black/52 shadow-sm">
      {text}
    </div>
  );
}