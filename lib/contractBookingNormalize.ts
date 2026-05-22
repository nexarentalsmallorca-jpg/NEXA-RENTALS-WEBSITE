type BookingLike = {
  id?: string;
  status?: string;
  contract_number?: string;
  stripe_payment_intent_id?: string;
  pickup_date?: string;
  pickup_time?: string;
  dropoff_date?: string;
  dropoff_time?: string;
  customer_name?: string;
  phone?: string;
  customer_email?: string;
  vehicle?: Record<string, unknown>;
  contractData?: Record<string, unknown>;
  [key: string]: unknown;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function defaultTime(value: unknown, fallback = "10:00") {
  const text = cleanText(value);
  return text || fallback;
}

/** Ensures manual + Supabase rows have every field required for PDF validation/render. */
export function normalizeBookingForContractPdf(booking: BookingLike) {
  const contractData = (booking.contractData || {}) as Record<string, unknown>;
  const vehicle = (booking.vehicle || {}) as Record<string, unknown>;

  const contractNumber =
    cleanText(contractData.numeroContrato) ||
    cleanText(booking.contract_number) ||
    cleanText(booking.id) ||
    cleanText(booking.stripe_payment_intent_id) ||
    `NX-${Date.now()}`;

  const pickupDate =
    cleanText(contractData.fechaEntrega) || cleanText(booking.pickup_date);
  const dropoffDate =
    cleanText(contractData.fechaDevolucion) || cleanText(booking.dropoff_date);

  const today = new Date().toISOString().slice(0, 10);

  return {
    ...booking,
    id: cleanText(booking.id) || contractNumber,
    vehicle: {
      codigo: cleanText(vehicle.codigo) || "N1",
      matricula: cleanText(vehicle.matricula) || "0000XXX",
      marca: cleanText(vehicle.marca) || "Piaggio",
      modelo: cleanText(vehicle.modelo) || "Liberty 125",
      ano: cleanText(vehicle.ano) || "",
      bastidor: cleanText(vehicle.bastidor) || "-",
      combustible: cleanText(vehicle.combustible) || "Gasolina",
      tipo: cleanText(vehicle.tipo) || "Scooter",
    },
    contractData: {
      ...contractData,
      numeroContrato: contractNumber,
      oficinaEntrega: cleanText(contractData.oficinaEntrega) || "OFICINA MAGALUF",
      oficinaDevolucion:
        cleanText(contractData.oficinaDevolucion) || "OFICINA MAGALUF",
      fechaEntrega: pickupDate || today,
      horaEntrega: defaultTime(contractData.horaEntrega || booking.pickup_time),
      fechaDevolucion: dropoffDate || pickupDate || today,
      horaDevolucion: defaultTime(
        contractData.horaDevolucion || booking.dropoff_time,
        "18:00"
      ),
      kmSalida: cleanText(contractData.kmSalida) || "-",
      combustibleSalida: cleanText(contractData.combustibleSalida) || "7/7",
      nombreCliente:
        cleanText(contractData.nombreCliente) ||
        cleanText(booking.customer_name) ||
        "Cliente",
      dniPasaporte: cleanText(contractData.dniPasaporte) || "-",
      telefono:
        cleanText(contractData.telefono) || cleanText(booking.phone) || "-",
      email:
        cleanText(contractData.email) ||
        cleanText(booking.customer_email) ||
        "",
      direccion: cleanText(contractData.direccion) || "-",
      permisoConducir: cleanText(contractData.permisoConducir) || "-",
      paisExpedicion: cleanText(contractData.paisExpedicion) || "-",
      fechaCaducidad: cleanText(contractData.fechaCaducidad) || "01/01/2030",
      dias: cleanText(contractData.dias) || "1",
      precioPorDia: cleanText(contractData.precioPorDia) || "0 €",
      total: cleanText(contractData.total) || "0 €",
      pagado: cleanText(contractData.pagado) || cleanText(contractData.total) || "0 €",
      metodoPago:
        cleanText(contractData.metodoPago) ||
        cleanText(contractData.paymentMethod) ||
        "cash",
      paymentMethod:
        cleanText(contractData.paymentMethod) ||
        cleanText(contractData.metodoPago) ||
        "cash",
      fianza: cleanText(contractData.fianza) || "150 €",
      franquicia: cleanText(contractData.franquicia) || "800 €",
      extras:
        cleanText(contractData.extras) ||
        "Casco 1, Casco 2, Soporte móvil, Baúl, Antirrobo con alarma",
    },
  };
}
