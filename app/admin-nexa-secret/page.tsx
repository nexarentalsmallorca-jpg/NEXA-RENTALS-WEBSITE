"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DashboardCard from "../components/dashboard/DashboardCard";
import { nexaFleet } from "../../lib/nexaFleet";

type SavedBooking = {
  id: string;
  createdAt: string;
  status: string;
  source: string;
  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
    ano: string;
    bastidor: string;
    combustible: string;
    tipo: string;
  };
  contractData: {
    fechaEntrega: string;
    horaEntrega: string;
    fechaDevolucion: string;
    horaDevolucion: string;
    nombreCliente: string;
    total: string;
  };
};

function isToday(dateString: string) {
  const today = new Date();
  const date = new Date(`${dateString}T00:00`);

  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

function getBookingStatus(booking: SavedBooking) {
  const now = new Date();
  const start = new Date(
    `${booking.contractData.fechaEntrega}T${booking.contractData.horaEntrega || "00:00"}`
  );
  const end = new Date(
    `${booking.contractData.fechaDevolucion}T${booking.contractData.horaDevolucion || "23:59"}`
  );

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Activa";
  }

  if (now < start) return "Confirmada";
  if (now >= start && now <= end) return "En alquiler";
  return "Finalizada";
}

function isVehicleCurrentlyRented(vehicleCode: string, bookings: SavedBooking[]) {
  return bookings.some(
    (booking) =>
      booking.vehicle.codigo === vehicleCode &&
      getBookingStatus(booking) === "En alquiler"
  );
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);

  useEffect(() => {
    const savedBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    setBookings(savedBookings);
  }, []);

  const stats = useMemo(() => {
    const todayPickups = bookings.filter((booking) =>
      isToday(booking.contractData.fechaEntrega)
    ).length;

    const todayReturns = bookings.filter((booking) =>
      isToday(booking.contractData.fechaDevolucion)
    ).length;

    const activeRentals = bookings.filter(
      (booking) => getBookingStatus(booking) === "En alquiler"
    ).length;

    const rentedVehicles = nexaFleet.filter((vehicle) =>
      isVehicleCurrentlyRented(vehicle.codigo, bookings)
    ).length;

    const vehiclesFree = nexaFleet.length - rentedVehicles;

    const totalRevenue = bookings.reduce((sum, booking) => {
      const amount = Number(String(booking.contractData.total || "0").replace(",", "."));
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

    return {
      todayPickups,
      todayReturns,
      activeRentals,
      vehiclesFree,
      contracts: bookings.length,
      totalRevenue,
    };
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [bookings]);

  return (
    <div className="space-y-8">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
              Private Operating System
            </p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
              NEXA OS is now reading real manual bookings.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/55">
              This dashboard now reads your local test bookings, calculates
              active rentals, free vehicles, today pickups and generated
              contracts. Next step: Supabase database.
            </p>
          </div>

          <div className="rounded-[26px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              System
            </p>
            <p className="mt-1 text-2xl font-black text-white">Live Local</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Today Pickups"
          value={String(stats.todayPickups)}
          subtitle={`${stats.todayReturns} returns today`}
          icon="↗"
          glow="orange"
        />
        <DashboardCard
          title="Active Rentals"
          value={String(stats.activeRentals)}
          subtitle="Currently on the road"
          icon="◈"
          glow="blue"
        />
        <DashboardCard
          title="Vehicles Free"
          value={String(stats.vehiclesFree)}
          subtitle={`Out of ${nexaFleet.length} vehicles`}
          icon="✓"
          glow="green"
        />
        <DashboardCard
          title="Contracts"
          value={String(stats.contracts)}
          subtitle={`Local revenue: €${stats.totalRevenue.toFixed(2)}`}
          icon="✦"
          glow="purple"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
                Operations
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Recent Bookings
              </h3>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-300">
              Real Local Data
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {recentBookings.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
                <p className="text-xl font-black text-white">
                  No bookings yet
                </p>
                <p className="mt-2 text-sm text-white/45">
                  Create a manual booking and it will appear here.
                </p>
                <Link
                  href="/admin-nexa-secret/create-booking"
                  className="mt-5 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-sm font-black text-white"
                >
                  Create Booking
                </Link>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:bg-white/[0.06] md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-black text-white">
                      {booking.id} · {booking.contractData.nombreCliente}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/45">
                      {booking.vehicle.codigo} · {booking.vehicle.matricula} ·{" "}
                      {booking.vehicle.marca} {booking.vehicle.modelo}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-bold text-white/65">
                      {booking.contractData.fechaEntrega}{" "}
                      {booking.contractData.horaEntrega} -{" "}
                      {booking.contractData.fechaDevolucion}{" "}
                      {booking.contractData.horaDevolucion}
                    </p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                      {getBookingStatus(booking)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
            Quick Actions
          </p>
          <h3 className="mt-1 text-2xl font-black text-white">
            Control Center
          </h3>

          <div className="mt-6 space-y-3">
            <Link
              href="/admin-nexa-secret/create-booking"
              className="block rounded-3xl border border-orange-400/20 bg-orange-400/10 p-4 transition hover:bg-orange-400/15"
            >
              <p className="font-black text-white">1. Create Manual Booking</p>
              <p className="mt-1 text-sm text-white/50">
                Create NX-75, NX-76... contracts and block vehicles locally.
              </p>
            </Link>

            <Link
              href="/admin-nexa-secret/vehicles"
              className="block rounded-3xl border border-sky-400/20 bg-sky-400/10 p-4 transition hover:bg-sky-400/15"
            >
              <p className="font-black text-white">2. Check Fleet Status</p>
              <p className="mt-1 text-sm text-white/50">
                See which NEXA scooters are available or rented.
              </p>
            </Link>

            <Link
              href="/admin-nexa-secret/bookings"
              className="block rounded-3xl border border-purple-400/20 bg-purple-400/10 p-4 transition hover:bg-purple-400/15"
            >
              <p className="font-black text-white">3. View Bookings</p>
              <p className="mt-1 text-sm text-white/50">
                Search contracts, customers, plates and rental history.
              </p>
            </Link>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
              Next development
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-white/60">
              After this local version works, we connect the same booking logic
              to Supabase so your public website and dashboard share real
              availability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}