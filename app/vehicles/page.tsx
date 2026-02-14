import dynamic from "next/dynamic";

const VehiclesClient = dynamic(() => import("./VehiclesClient"), { ssr: false });

export default function VehiclesPage() {
  return <VehiclesClient />;
}
