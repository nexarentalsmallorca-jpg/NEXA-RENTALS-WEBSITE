"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutShell({ clientSecret }: { clientSecret: string }) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorBackground: "#0B0B0D",
        colorText: "#EDEDED",
        colorPrimary: "#FF7A00",
        borderRadius: "14px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}