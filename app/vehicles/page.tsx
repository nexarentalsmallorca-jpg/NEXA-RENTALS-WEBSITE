import BookingBar from "../components/BookingBar";
import VehiclesGrid from "./VehiclesGrid";

export default function VehiclesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <div className="text-xs tracking-widest text-white/60">
          NEXA Rentals • Mallorca
        </div>

        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">
          Choose your ride
        </h1>

        <p className="mt-2 max-w-2xl text-white/70">
          Pick your dates and time, then select from our scooters & e-bikes.
          Fast pickup at Carrer Galeón 13.
        </p>

        <div className="mt-6">
          <BookingBar />
        </div>

        <div className="mt-6 h-px w-full bg-white/10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        <VehiclesGrid />
      </div>
    </div>
  );
}
