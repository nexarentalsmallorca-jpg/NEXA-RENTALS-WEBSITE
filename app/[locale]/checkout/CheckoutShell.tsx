"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutShell({
  clientSecret,
}: {
  clientSecret: string;
}) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "flat",
      variables: {
        colorPrimary: "#FF7A00",
        colorBackground: "#FBF7EF",
        colorText: "#111111",
        colorDanger: "#D92D20",
        colorTextSecondary: "rgba(17,17,17,0.58)",
        colorTextPlaceholder: "rgba(17,17,17,0.35)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        fontSizeBase: "15px",
        spacingUnit: "5px",
        borderRadius: "18px",
      },
      rules: {
        ".Tab": {
          backgroundColor: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
          color: "#111111",
        },
        ".Tab:hover": {
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(255,122,0,0.35)",
          color: "#111111",
        },
        ".Tab--selected": {
          backgroundColor: "#FF7A00",
          border: "1px solid rgba(255,122,0,0.60)",
          color: "#111111",
          boxShadow:
            "0 16px 34px rgba(255,122,0,0.28), 0 0 0 4px rgba(255,122,0,0.10)",
        },
        ".TabIcon": {
          color: "#111111",
        },
        ".Label": {
          color: "rgba(17,17,17,0.58)",
          fontWeight: "700",
          fontSize: "12px",
          letterSpacing: "0.02em",
        },
        ".Input": {
          backgroundColor: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(0,0,0,0.10)",
          color: "#111111",
          boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
          padding: "14px 15px",
        },
        ".Input:hover": {
          border: "1px solid rgba(255,122,0,0.32)",
          backgroundColor: "#FFFFFF",
        },
        ".Input:focus": {
          border: "1px solid rgba(255,122,0,0.65)",
          boxShadow:
            "0 0 0 4px rgba(255,122,0,0.11), 0 10px 24px rgba(0,0,0,0.08)",
        },
        ".Block": {
          backgroundColor: "rgba(255,255,255,0.68)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        },
        ".AccordionItem": {
          backgroundColor: "rgba(255,255,255,0.68)",
          border: "1px solid rgba(0,0,0,0.08)",
        },
        ".AccordionItem--selected": {
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(255,122,0,0.34)",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}