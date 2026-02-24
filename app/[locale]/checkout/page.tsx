import React, { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white" />}>
      <CheckoutClient />
    </Suspense>
  );
}
