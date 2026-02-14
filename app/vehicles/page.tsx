"use client";

export const dynamic = "force-dynamic";
import Navbar from "../Navbar";
import VehiclesGrid from "./VehiclesGrid";


export default function VehiclesPage() {
  return (
    <main>
      <Navbar />
      <VehiclesGrid />
    </main>
  );
}
