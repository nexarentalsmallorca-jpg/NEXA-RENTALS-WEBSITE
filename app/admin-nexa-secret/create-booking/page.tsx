"use client";

import { useMemo, useState } from "react";
import { nexaFleet } from "../../../lib/nexaFleet";

type BookingForm = {
  numeroContrato: string;
  codigoVehiculo: string;

  kmSalida: string;
  combustibleSalida: string;

  fechaEntrega: string;
  horaEntrega: string;
  fechaDevolucion: string;
  horaDevolucion: string;

  nombreCliente: string;
  dniPasaporte: string;
  telefono: string;
  email: string;
  direccion: string;

  permisoConducir: string;
  paisExpedicion: string;
  fechaCaducidad: string;

  segundoNombre: string;
  segundoPermiso: string;
  segundoPais: string;
  segundoFechaCaducidad: string;
  segundoDireccion: string;

  dias: string;
  precioPorDia: string;
  total: string;
  pagado: string;

  notas: string;
};

const initialForm: BookingForm = {
  numeroContrato: "",
  codigoVehiculo: "",

  kmSalida: "",
  combustibleSalida: "7/7",

  fechaEntrega: "",
  horaEntrega: "",
  fechaDevolucion: "",
  horaDevolucion: "",

  nombreCliente: "",
  dniPasaporte: "",
  telefono: "",
  email: "",
  direccion: "",

  permisoConducir: "",
  paisExpedicion: "",
  fechaCaducidad: "",

  segundoNombre: "",
  segundoPermiso: "",
  segundoPais: "",
  segundoFechaCaducidad: "",
  segundoDireccion: "",

  dias: "",
  precioPorDia: "",
  total: "",
  pagado: "",

  notas: "",
};

const requiredFields: Array<keyof BookingForm> = [
  "codigoVehiculo",
  "combustibleSalida",
  "fechaEntrega",
  "horaEntrega",
  "fechaDevolucion",
  "horaDevolucion",
  "nombreCliente",
  "dniPasaporte",
  "telefono",
  "email",
  "direccion",
  "permisoConducir",
  "paisExpedicion",
  "fechaCaducidad",
  "dias",
  "precioPorDia",
  "total",
  "pagado",
];

export default function CreateBookingPage() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [contractStatus, setContractStatus] = useState("");
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);

  const selectedVehicle = useMemo(() => {
    return nexaFleet.find((vehicle) => vehicle.codigo === form.codigoVehiculo);
  }, [form.codigoVehiculo]);

  const nextContractNumber = useMemo(() => {
    if (typeof window === "undefined") return "NX-75";

    const currentBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    const nextNumber = 75 + currentBookings.length;

    return `NX-${nextNumber}`;
  }, [success]);

  function updateField(field: keyof BookingForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function createContractNumber() {
    const currentBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    const nextNumber = 75 + currentBookings.length;

    return `NX-${nextNumber}`;
  }

  function saveBookingToLocalStorage(bookingToSave: any) {
    const currentBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    localStorage.setItem(
      "nexa_manual_bookings",
      JSON.stringify([bookingToSave, ...currentBookings])
    );
  }

  function updateBookingInLocalStorage(updatedBooking: any) {
    const latestBookings = JSON.parse(
      localStorage.getItem("nexa_manual_bookings") || "[]"
    );

    const replacedBookings = latestBookings.map((booking: any) =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    );

    localStorage.setItem(
      "nexa_manual_bookings",
      JSON.stringify(replacedBookings)
    );
  }

  async function generateContractPdf(newBooking: any) {
    setIsGeneratingContract(true);
    setContractStatus("Generando PDF del contrato...");

    try {
      const response = await fetch("/api/admin/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: newBooking,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        console.error("PDF generation failed:", data.error);
        setContractStatus(
          "La reserva se ha guardado, pero el PDF no se pudo generar."
        );
        return;
      }

      const updatedBooking = {
        ...newBooking,
        contractPdf: {
          fileName: data.fileName,
          pdfBase64: data.pdfBase64,
          drive: data.drive,
          generatedAt: new Date().toISOString(),
        },
      };

      updateBookingInLocalStorage(updatedBooking);

      if (data.drive?.uploaded) {
        setContractStatus(
          `PDF generado y subido a Google Drive: ${data.fileName}`
        );
      } else if (data.drive?.skipped) {
        setContractStatus(
          `PDF generado correctamente. Google Drive está pendiente de configurar con ENV vars.`
        );
      } else {
        setContractStatus(`PDF generado correctamente: ${data.fileName}`);
      }

      console.log("PDF contract generated:", data);
    } catch (err) {
      console.error("PDF generation request failed:", err);
      setContractStatus(
        "La reserva se ha guardado, pero hubo un error al generar el PDF."
      );
    } finally {
      setIsGeneratingContract(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setContractStatus("");

    const missingFields = requiredFields.filter((field) => !form[field].trim());

    if (missingFields.length > 0) {
      setError(
        "Faltan campos obligatorios. Revisa el formulario antes de generar el contrato."
      );
      return;
    }

    if (!selectedVehicle) {
      setError("Selecciona un vehículo válido.");
      return;
    }

    const numeroContratoAutomatico = createContractNumber();

    const newBooking = {
      id: numeroContratoAutomatico,
      createdAt: new Date().toISOString(),
      status: "Activa",
      source: "Manual",
      vehicle: selectedVehicle,
      contractData: {
        ...form,
        numeroContrato: numeroContratoAutomatico,
        oficinaEntrega: "OFICINA MAGALUF",
        oficinaDevolucion: "OFICINA MAGALUF",
        fianza: "150 €",
        franquicia: "800 €",
        extras:
          "Casco 1, Casco 2, Soporte móvil, Baúl, Antirrobo con alarma",
      },
    };

    saveBookingToLocalStorage(newBooking);

    setForm((prev) => ({
      ...prev,
      numeroContrato: numeroContratoAutomatico,
    }));

    setSuccess(
      `Reserva creada correctamente con contrato ${numeroContratoAutomatico} para ${form.nombreCliente}. Vehículo ${selectedVehicle.codigo} bloqueado en el sistema local.`
    );

    console.log("NEXA booking created:", newBooking);

    await generateContractPdf(newBooking);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
          Reserva Manual
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
          Crear Contrato de Alquiler
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-white/55">
          Rellena los datos del cliente, conductor, vehículo y alquiler. El
          sistema guardará la reserva, bloqueará el vehículo, generará el PDF del
          contrato y lo subirá a Google Drive cuando estén configuradas las ENV
          vars.
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_0.72fr]"
      >
        <section className="space-y-6 rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div>
            <h3 className="text-2xl font-black text-white">
              Datos del Vehículo
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Al seleccionar N1, N2, N3, etc., se rellenan matrícula, marca,
              modelo y bastidor automáticamente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-orange-400/20 bg-orange-400/10 px-4 py-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-300">
                Número de contrato automático
              </p>
              <p className="mt-1 text-base font-black text-white">
                {form.numeroContrato || nextContractNumber}
              </p>
            </div>

            <select
              value={form.codigoVehiculo}
              onChange={(e) => updateField("codigoVehiculo", e.target.value)}
              className="rounded-2xl border border-white/10 bg-[#11131A] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            >
              <option value="">Seleccionar vehículo *</option>
              {nexaFleet.map((vehicle) => (
                <option key={vehicle.codigo} value={vehicle.codigo}>
                  {vehicle.codigo} · {vehicle.matricula} · {vehicle.marca}{" "}
                  {vehicle.modelo}
                </option>
              ))}
            </select>

            <input
              readOnly
              value={selectedVehicle?.matricula || ""}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
              placeholder="Matrícula"
            />

            <input
              readOnly
              value={
                selectedVehicle
                  ? `${selectedVehicle.marca} ${selectedVehicle.modelo}`
                  : ""
              }
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
              placeholder="Marca / Modelo"
            />

            <input
              readOnly
              value={selectedVehicle?.bastidor || ""}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
              placeholder="Bastidor / VIN"
            />

            <input
              readOnly
              value={selectedVehicle?.combustible || "Gasolina"}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-white/70 outline-none placeholder:text-white/30"
              placeholder="Combustible"
            />

            <input
              value={form.kmSalida}
              onChange={(e) => updateField("kmSalida", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="KM salida opcional"
            />

            <input
              value={form.combustibleSalida}
              onChange={(e) => updateField("combustibleSalida", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Combustible salida: 7/7, 6/7... *"
            />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              Datos del Alquiler
            </h3>
            <p className="mt-1 text-sm text-white/45">
              La oficina se rellenará automáticamente como OFICINA MAGALUF.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={form.fechaEntrega}
              onChange={(e) => updateField("fechaEntrega", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            />

            <input
              type="time"
              value={form.horaEntrega}
              onChange={(e) => updateField("horaEntrega", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            />

            <input
              type="date"
              value={form.fechaDevolucion}
              onChange={(e) => updateField("fechaDevolucion", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            />

            <input
              type="time"
              value={form.horaDevolucion}
              onChange={(e) => updateField("horaDevolucion", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              Datos del Cliente
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.nombreCliente}
              onChange={(e) => updateField("nombreCliente", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Nombre completo *"
            />

            <input
              value={form.dniPasaporte}
              onChange={(e) => updateField("dniPasaporte", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="DNI / Pasaporte *"
            />

            <input
              value={form.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Teléfono *"
            />

            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Email *"
            />

            <input
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50 md:col-span-2"
              placeholder="Dirección *"
            />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              Datos del Conductor/a
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.permisoConducir}
              onChange={(e) => updateField("permisoConducir", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Permiso de conducir *"
            />

            <input
              value={form.paisExpedicion}
              onChange={(e) => updateField("paisExpedicion", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="País de expedición *"
            />

            <input
              type="date"
              value={form.fechaCaducidad}
              onChange={(e) => updateField("fechaCaducidad", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              Segundo/a Conductor/a
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Opcional. Solo rellenar si aplica.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={form.segundoNombre}
              onChange={(e) => updateField("segundoNombre", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="2º Nombre"
            />

            <input
              value={form.segundoPermiso}
              onChange={(e) => updateField("segundoPermiso", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="2º Permiso de conducir"
            />

            <input
              value={form.segundoPais}
              onChange={(e) => updateField("segundoPais", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="2º País expedición"
            />

            <input
              type="date"
              value={form.segundoFechaCaducidad}
              onChange={(e) =>
                updateField("segundoFechaCaducidad", e.target.value)
              }
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none focus:border-orange-400/50"
            />

            <input
              value={form.segundoDireccion}
              onChange={(e) => updateField("segundoDireccion", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50 md:col-span-2"
              placeholder="2º Dirección"
            />
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div>
            <h3 className="text-2xl font-black text-white">
              Detalles del Alquiler
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Precio, fianza, pagado y resumen del contrato.
            </p>
          </div>

          <div className="grid gap-4">
            <input
              value={form.dias}
              onChange={(e) => updateField("dias", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Días *"
            />

            <input
              value={form.precioPorDia}
              onChange={(e) => updateField("precioPorDia", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Precio por día *"
            />

            <input
              value={form.total}
              onChange={(e) => updateField("total", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Total *"
            />

            <input
              value={form.pagado}
              onChange={(e) => updateField("pagado", e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Pagado *"
            />

            <textarea
              value={form.notas}
              onChange={(e) => updateField("notas", e.target.value)}
              className="min-h-[120px] rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30 focus:border-orange-400/50"
              placeholder="Notas internas opcionales"
            />
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
              Vista rápida del contrato
            </p>

            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>
                <span className="font-black text-white">Contrato:</span>{" "}
                {form.numeroContrato || nextContractNumber}
              </p>
              <p>
                <span className="font-black text-white">Vehículo:</span>{" "}
                {selectedVehicle
                  ? `${selectedVehicle.codigo} · ${selectedVehicle.matricula} · ${selectedVehicle.marca} ${selectedVehicle.modelo}`
                  : "Sin seleccionar"}
              </p>
              <p>
                <span className="font-black text-white">Cliente:</span>{" "}
                {form.nombreCliente || "Sin rellenar"}
              </p>
              <p>
                <span className="font-black text-white">Entrega:</span>{" "}
                {form.fechaEntrega || "--"} {form.horaEntrega || "--"}
              </p>
              <p>
                <span className="font-black text-white">Devolución:</span>{" "}
                {form.fechaDevolucion || "--"} {form.horaDevolucion || "--"}
              </p>
              <p>
                <span className="font-black text-white">Total:</span>{" "}
                {form.total || "0"} €
              </p>
              <p>
                <span className="font-black text-white">Fianza:</span> 150 €
              </p>
              <p>
                <span className="font-black text-white">Franquicia:</span> 800 €
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
              {success}
            </div>
          ) : null}

          {contractStatus ? (
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-300">
              {contractStatus}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isGeneratingContract}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-4 text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isGeneratingContract
              ? "Generando contrato PDF..."
              : "Crear reserva + generar contrato"}
          </button>
        </section>
      </form>
    </div>
  );
}