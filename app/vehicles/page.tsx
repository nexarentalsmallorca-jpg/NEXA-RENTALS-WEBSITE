import Navbar from "../Navbar";
import VehiclesGrid from "./VehiclesGrid";
export const dynamic = "force-dynamic";

export default function VehiclesPage() {
  return (
    <main>
      <Navbar />
      <VehiclesGrid />
    </main>
  );
}
