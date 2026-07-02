"use client";

import { useEffect, useMemo, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutShell({
  clientSecret,
  customerName = "",
  customerEmail = "",
  customerPhone = "",
}: {
  clientSecret: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = useMemo<StripeElementsOptions>(() => {
    return {
      clientSecret,
      appearance: {
        theme: "flat",
        variables: {
          colorPrimary: "#111111",
          colorBackground: "#FFFFFF",
          colorText: "#111111",
          colorDanger: "#D92D20",
          colorTextSecondary: "rgba(17,17,17,0.58)",
          colorTextPlaceholder: "rgba(17,17,17,0.34)",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          fontSizeBase: "15px",
          spacingUnit: "5px",
          borderRadius: "0px",
        },
        rules: {
          ".Tab": {
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(17,17,17,0.13)",
            boxShadow: "none",
            color: "#111111",
            fontWeight: "700",
          },
          ".Tab:hover": {
            backgroundColor: "rgba(17,17,17,0.035)",
            border: "1px solid rgba(17,17,17,0.35)",
            color: "#111111",
          },
          ".Tab--selected": {
            backgroundColor: "#111111",
            border: "1px solid #111111",
            color: "#FFFFFF",
            boxShadow: "none",
          },
          ".TabIcon": {
            color: "currentColor",
          },
          ".Label": {
            color: "rgba(17,17,17,0.58)",
            fontWeight: "800",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          },
          ".Input": {
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(17,17,17,0.16)",
            color: "#111111",
            boxShadow: "none",
            padding: "14px 15px",
            fontWeight: "600",
          },
          ".Input:hover": {
            border: "1px solid rgba(17,17,17,0.34)",
            backgroundColor: "#FFFFFF",
          },
          ".Input:focus": {
            border: "1px solid #111111",
            boxShadow: "0 0 0 3px rgba(17,17,17,0.08)",
          },
          ".Input--invalid": {
            border: "1px solid #D92D20",
            boxShadow: "0 0 0 3px rgba(217,45,32,0.08)",
          },
          ".Block": {
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(17,17,17,0.12)",
            boxShadow: "none",
          },
          ".AccordionItem": {
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(17,17,17,0.12)",
            boxShadow: "none",
          },
          ".AccordionItem--selected": {
            backgroundColor: "#FFFFFF",
            border: "1px solid #111111",
            boxShadow: "0 0 0 3px rgba(17,17,17,0.06)",
          },
          ".Error": {
            color: "#D92D20",
            fontWeight: "700",
          },
          ".TermsText": {
            color: "rgba(17,17,17,0.52)",
            fontSize: "11px",
            lineHeight: "1.5",
          },
        },
      },
    };
  }, [clientSecret]);

  if (!mounted) {
    return (
      <div className="nexa-stripe-shell">
        <div className="rounded-none border border-black/10 bg-white px-4 py-4 text-[13px] font-bold text-black/45">
          Preparing secure checkout...
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="nexa-stripe-shell">
        <div className="rounded-none border border-black/10 bg-white px-4 py-4 text-[13px] font-bold text-black/45">
          Preparing secure checkout...
        </div>
      </div>
    );
  }

  return (
    <div className="nexa-stripe-shell">
      <Elements key={clientSecret} stripe={stripePromise} options={options}>
        <CheckoutForm
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
        />
      </Elements>

      <style jsx global>{`
        .nexa-stripe-shell {
          width: 100%;
          min-width: 0;
          overflow: visible;
        }

        @media (max-width: 767px) {
          .nexa-stripe-shell {
            min-height: 720px;
            overflow: visible !important;
            padding-bottom: calc(env(safe-area-inset-bottom) + 48px);
          }

          .nexa-stripe-shell iframe {
            width: 100% !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}