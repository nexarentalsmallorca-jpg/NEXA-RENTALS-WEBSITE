import React, { Suspense } from "react";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
      <HomeClient />
    </Suspense>
  );
}
