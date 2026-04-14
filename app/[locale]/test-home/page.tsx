import { Suspense } from "react";
import HomeClientV2 from "../../HomeClientV2";

export default function TestHomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
      <HomeClientV2 />
    </Suspense>
  );
}