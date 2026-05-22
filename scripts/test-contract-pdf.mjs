/**
 * Run: node scripts/test-contract-pdf.mjs
 * Tests contract PDF generation outside Next.js.
 */
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Register TSX for NexaContractPDF if needed — use dynamic import of built path
async function main() {
  const sampleBooking = {
    id: "NX-TEST-001",
    vehicle: {
      codigo: "N4",
      matricula: "5682MGY",
      marca: "Piaggio",
      modelo: "Liberty 125",
      bastidor: "TESTVIN123",
      combustible: "Gasolina",
    },
    contractData: {
      numeroContrato: "NX-TEST-001",
      oficinaEntrega: "OFICINA MAGALUF",
      oficinaDevolucion: "OFICINA MAGALUF",
      fechaEntrega: "2026-05-22",
      horaEntrega: "10:00",
      fechaDevolucion: "2026-05-25",
      horaDevolucion: "18:00",
      kmSalida: "1000",
      combustibleSalida: "7/7",
      nombreCliente: "Test Cliente",
      dniPasaporte: "X1234567",
      telefono: "+34 600000000",
      email: "test@test.com",
      direccion: "Magaluf",
      permisoConducir: "B123",
      paisExpedicion: "UK",
      fechaCaducidad: "01/01/2030",
      dias: "3",
      precioPorDia: "30 €",
      total: "90 €",
      pagado: "90 €",
      metodoPago: "cash",
      fianza: "150 €",
      franquicia: "800 €",
      extras: "Casco 1, Casco 2",
    },
  };

  try {
    // eslint-disable-next-line import/no-unresolved
    const mod = await import("../app/components/contracts/NexaContractPDF.tsx");
    const NexaContractPDF = mod.default;
    const doc = React.createElement(NexaContractPDF, { booking: sampleBooking });
    const buf = await renderToBuffer(doc);
    console.log("OK PDF bytes:", buf.length);
    process.exit(0);
  } catch (err) {
    console.error("PDF TEST FAILED:", err?.message || err);
    console.error(err?.stack);
    process.exit(1);
  }
}

main();
