import { Suspense } from "react";
import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ This guarantees /fleet content runs only on the client (no SSR build crash)
const FleetClient = dynamic(() => import("./FleetClient"), { ssr: false });

export default function FleetPage() {
  return (
    <Suspense fallback={null}>
      <FleetClient />
    </Suspense>
  );
}