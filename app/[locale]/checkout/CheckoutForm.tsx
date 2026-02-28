"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

function localeBasePath() {
  // "/en/checkout" -> "/en"
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

    // If no redirect was needed, payment succeeded immediately
    window.location.href = `${base}/checkout/success`;
  }

  return (
    <form className="rounded-2xl border border-neutral-800 bg-black/40 p-6" onSubmit={onSubmit}>
      <h2 className="text-xl font-semibold text-white">Pay 50% deposit</h2>
      <p className="mt-1 text-sm text-neutral-300">Remaining 50% at pickup.</p>

      <div className="mt-6">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      <button
        disabled={!stripe || !elements || loading}
        className="mt-6 w-full rounded-xl bg-[#FF7A00] px-4 py-3 font-semibold text-black transition-all duration-200 hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? "Processing…" : "Pay deposit"}
      </button>

      {msg && <p className="mt-3 text-sm text-neutral-200">{msg}</p>}
    </form>
  );
}