"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
    numeroContrato: string;
    fechaEntrega: string;
    horaEntrega: string;
    fechaDevolucion: string;
    horaDevolucion: string;
    nombreCliente: string;
    dniPasaporte: string;
    telefono: string;
    email: string;
    direccion: string;
    dias: string;
    precioPorDia: string;
    total: string;
    pagado: string;
    kmSalida?: string;
    combustibleSalida: string;
  };
};

function formatDateTime(date?: string, time?: string) {
  if (!date && !time) return "Sin fecha";
  return `${date || "--"} · ${time || "--"}`;
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

function getStatusStyle(status: string) {
  if (status === "En alquiler") {
    return "border-orange-400/20 bg-orange-400/10 text-orange-300";
  }

  if (status === "Confirmada") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-300";
  }

  if (status === "Finalizada") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  return "border-white/10 bg-white/[0.06] text-white/60";
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    setBookings(savedBookings);
  }, []);

  const filteredBookings = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) return bookings;

    return bookings.filter((booking) => {
      const text = [
        booking.id,
        booking.source,
        booking.vehicle.codigo,
        booking.vehicle.matricula,
        booking.vehicle.marca,
        booking.vehicle.modelo,
        booking.contractData.nombreCliente,
        booking.contractData.dniPasaporte,
        booking.contractData.telefono,
        booking.contractData.email,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(cleanSearch);
    });
  }, [bookings, search]);

  function clearTestBookings() {
    const confirmed = window.confirm(
      "¿Seguro que quieres borrar todas las reservas guardadas en localStorage?"
    );

    if (!confirmed) return;

    localStorage.removeItem("nexa_manual_bookings");
    setBookings([]);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
              Control de Reservas
            </p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
              Reservas y Contratos
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
              Aquí aparecen las reservas manuales creadas desde NEXA OS. Ahora
              se guardan en localStorage para pruebas; después irán a Supabase.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={clearTestBookings}
              className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15"
            >
              Clear Test Data
            </button>

            <Link
              href="/admin-nexa-secret/create-booking"
              className="rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-center text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.25)] transition hover:-translate-y-0.5"
            >
              + Crear Reserva
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-orange-400/20 bg-orange-400/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            Total reservas
          </p>
          <p className="mt-2 text-4xl font-black text-white">
            {bookings.length}
          </p>
        </div>

        <div className="rounded-[28px] border border-sky-400/20 bg-sky-400/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
            En alquiler
          </p>
          <p className="mt-2 text-4xl font-black text-white">
            {bookings.filter((booking) => getBookingStatus(booking) === "En alquiler").length}
          </p>
        </div>

        <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
            Contratos
          </p>
          <p className="mt-2 text-4xl font-black text-white">
            {bookings.length}
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por contrato, cliente, DNI, matrícula, teléfono..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-sm font-bold text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
        />
      </section>

      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#080A10]/80 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="hidden grid-cols-9 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/35 xl:grid">
          <div>Contrato</div>
          <div>Fuente</div>
          <div className="col-span-2">Cliente</div>
          <div>Vehículo</div>
          <div>Entrega</div>
          <div>Devolución</div>
          <div>Estado</div>
          <div className="text-right">Total</div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-2xl font-black text-white">
              No hay reservas todavía
            </p>
            <p className="mt-2 text-sm font-medium text-white/45">
              Crea una reserva manual para verla aquí automáticamente.
            </p>
            <Link
              href="/admin-nexa-secret/create-booking"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-sm font-black text-white"
            >
              Crear primera reserva
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const status = getBookingStatus(booking);

            return (
              <div
                key={booking.id}
                className="grid gap-4 border-b border-white/5 px-5 py-5 text-sm transition hover:bg-white/[0.04] xl:grid-cols-9 xl:items-center"
              >
                <div>
                  <p className="font-black text-white">{booking.id}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="font-bold text-orange-300">
                  {booking.source}
                </div>

                <div className="xl:col-span-2">
                  <p className="font-black text-white">
                    {booking.contractData.nombreCliente}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    DNI/Pasaporte: {booking.contractData.dniPasaporte}
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Tel: {booking.contractData.telefono}
                  </p>
                </div>

                <div>
                  <p className="font-black text-white">
                    {booking.vehicle.codigo}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {booking.vehicle.matricula} · {booking.vehicle.marca}{" "}
                    {booking.vehicle.modelo}
                  </p>
                </div>

                <div className="font-medium text-white/60">
                  {formatDateTime(
                    booking.contractData.fechaEntrega,
                    booking.contractData.horaEntrega
                  )}
                </div>

                <div className="font-medium text-white/60">
                  {formatDateTime(
                    booking.contractData.fechaDevolucion,
                    booking.contractData.horaDevolucion
                  )}
                </div>

                <div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${getStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="text-right text-lg font-black text-white">
                  €{booking.contractData.total}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}