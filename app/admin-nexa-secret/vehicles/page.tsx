"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/dashboard/AdminShell";
import { nexaFleet } from "../../../lib/nexaFleet";

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

function isVehicleCurrentlyRented(vehicleCode: string, bookings: SavedBooking[]) {
  const now = new Date();

  return bookings.find((booking) => {
    if (booking.vehicle.codigo !== vehicleCode) return false;

    const start = new Date(
      `${booking.contractData.fechaEntrega}T${
        booking.contractData.horaEntrega || "00:00"
      }`
    );
    const end = new Date(
      `${booking.contractData.fechaDevolucion}T${
        booking.contractData.horaDevolucion || "23:59"
      }`
    );

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return now >= start && now <= end;
  });
}

function getNextBooking(vehicleCode: string, bookings: SavedBooking[]) {
  const now = new Date();

  return bookings
    .filter((booking) => booking.vehicle.codigo === vehicleCode)
    .filter((booking) => {
      const start = new Date(
        `${booking.contractData.fechaEntrega}T${
          booking.contractData.horaEntrega || "00:00"
        }`
      );

      return !Number.isNaN(start.getTime()) && start > now;
    })
    .sort((a, b) => {
      const aDate = new Date(
        `${a.contractData.fechaEntrega}T${
          a.contractData.horaEntrega || "00:00"
        }`
      ).getTime();

      const bDate = new Date(
        `${b.contractData.fechaEntrega}T${
          b.contractData.horaEntrega || "00:00"
        }`
      ).getTime();

      return aDate - bDate;
    })[0];
}

export default function VehiclesPage() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);

  useEffect(() => {
    const savedBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    setBookings(savedBookings);
  }, []);

  const stats = useMemo(() => {
    const rented = nexaFleet.filter((vehicle) =>
      isVehicleCurrentlyRented(vehicle.codigo, bookings)
    ).length;

    return {
      total: nexaFleet.length,
      rented,
      available: nexaFleet.length - rented,
    };
  }, [bookings]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
            Control de Flota
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            Vehículos NEXA
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
            Aquí están tus vehículos reales N1–N8. El sistema detecta si están
            alquilados ahora según las reservas manuales guardadas.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
              Total flota
            </p>
            <p className="mt-2 text-4xl font-black text-white">{stats.total}</p>
          </div>

          <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
              Disponibles ahora
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {stats.available}
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-400/20 bg-orange-400/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              En alquiler ahora
            </p>
            <p className="mt-2 text-4xl font-black text-white">
              {stats.rented}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nexaFleet.map((vehicle) => {
            const activeBooking = isVehicleCurrentlyRented(
              vehicle.codigo,
              bookings
            );

            const nextBooking = getNextBooking(vehicle.codigo, bookings);

            const status = activeBooking ? "Alquilado" : "Disponible";

            return (
              <div
                key={vehicle.codigo}
                className="group rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-400/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
                      {vehicle.codigo}
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-white">
                      {vehicle.marca} {vehicle.modelo}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-white/45">
                      {vehicle.tipo} · Año {vehicle.ano}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${
                      status === "Disponible"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-orange-400/20 bg-orange-400/10 text-orange-300"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      Matrícula
                    </p>
                    <p className="mt-1 text-lg font-black text-white">
                      {vehicle.matricula}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      Bastidor / VIN
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-white/70">
                      {vehicle.bastidor}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                      Combustible
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      {vehicle.combustible}
                    </p>
                  </div>
                </div>

                {activeBooking ? (
                  <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                      Alquiler activo
                    </p>
                    <p className="mt-1 font-black text-white">
                      {activeBooking.contractData.nombreCliente}
                    </p>
                    <p className="mt-1 text-xs font-medium text-white/55">
                      Devuelve: {activeBooking.contractData.fechaDevolucion} ·{" "}
                      {activeBooking.contractData.horaDevolucion}
                    </p>
                  </div>
                ) : nextBooking ? (
                  <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-300">
                      Próxima reserva
                    </p>
                    <p className="mt-1 font-black text-white">
                      {nextBooking.contractData.nombreCliente}
                    </p>
                    <p className="mt-1 text-xs font-medium text-white/55">
                      {nextBooking.contractData.fechaEntrega} ·{" "}
                      {nextBooking.contractData.horaEntrega}
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      Listo para alquilar
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/55">
                      No hay alquiler activo ni próxima reserva guardada.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </AdminShell>
  );
}