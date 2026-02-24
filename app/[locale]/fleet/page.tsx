import { Suspense } from "react";
import FleetClient from "./FleetClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FleetClient />
    </Suspense>
  );
}