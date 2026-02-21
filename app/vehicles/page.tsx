import { Suspense } from "react";
import VehiclesClient from "./VehiclesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function VehiclesPage() {
  return (
    <Suspense fallback={null}>
      <VehiclesClient />
    </Suspense>
  );
}