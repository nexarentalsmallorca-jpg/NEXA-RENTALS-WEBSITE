import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type BookingData = {
  id: string;
  createdAt?: string;
  status?: string;
  source?: string;
  vehicle: {
    codigo: string;
    matricula: string;
    marca: string;
    modelo: string;
    ano?: string;
    bastidor: string;
    combustible: string;
    tipo?: string;
  };
  contractData: {
    numeroContrato: string;

    oficinaEntrega?: string;
    oficinaDevolucion?: string;

    fechaEntrega: string;
    horaEntrega: string;
    fechaDevolucion: string;
    horaDevolucion: string;

    kmSalida?: string;
    combustibleSalida: string;

    nombreCliente: string;
    dniPasaporte: string;
    telefono: string;
    email: string;
    direccion: string;

    permisoConducir: string;
    paisExpedicion: string;
    fechaCaducidad: string;

    segundoNombre?: string;
    segundoPermiso?: string;
    segundoPais?: string;
    segundoFechaCaducidad?: string;
    segundoDireccion?: string;

    dias: string;
    precioPorDia: string;
    total: string;
    pagado: string;

    fianza?: string;
    franquicia?: string;
    extras?: string;
    notas?: string;
  };
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 30,
    paddingHorizontal: 30,
    fontSize: 8.7,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.25,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#111111",
    paddingBottom: 8,
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 8.5,
    marginBottom: 2,
  },
  contractBox: {
    borderWidth: 1,
    borderColor: "#111111",
    paddingVertical: 7,
    paddingHorizontal: 10,
    minWidth: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  contractNumberLabel: {
    fontSize: 7,
    textTransform: "uppercase",
  },
  contractNumber: {
    marginTop: 3,
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  section: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#111111",
  },
  sectionTitle: {
    backgroundColor: "#111111",
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    paddingVertical: 4,
    paddingHorizontal: 6,
    textTransform: "uppercase",
  },
  sectionBody: {
    padding: 6,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  col: {
    flex: 1,
  },
  label: {
    fontFamily: "Helvetica-Bold",
  },
  value: {
    fontFamily: "Helvetica",
  },
  smallText: {
    fontSize: 7.6,
    lineHeight: 1.22,
    marginBottom: 3,
  },
  termsTitle: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
  },
  signatures: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  signatureBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#111111",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 7,
  },
});

function clean(value?: string) {
  return value && value.trim() ? value : "—";
}

function Money({ value }: { value?: string }) {
  const cleanValue = clean(value);
  const hasEuro = cleanValue.includes("€");
  return <Text>{hasEuro ? cleanValue : `${cleanValue} €`}</Text>;
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <Text>
      <Text style={styles.label}>{label}: </Text>
      <Text style={styles.value}>{clean(value)}</Text>
    </Text>
  );
}

function SpanishTerms() {
  const terms = [
    "El arrendador NEXA RENTALS cede en alquiler al arrendatario el vehículo descrito en este contrato, en buen estado de funcionamiento, con todos sus accesorios y documentación, obligándose el arrendatario a su correcta utilización y devolución en las condiciones pactadas.",
    "El alquiler se computa por periodos de 24 horas desde la hora de recogida acordada, debiendo devolverse el vehículo en la fecha y hora establecidas; cualquier retraso implicará el cobro automático de un día adicional completo.",
    "El arrendatario se compromete a utilizar el vehículo conforme a la normativa de tráfico vigente en España, quedando prohibido su uso para competiciones, transporte ilegal, fines comerciales no autorizados o cualquier uso indebido.",
    "Queda terminantemente prohibido conducir el vehículo bajo los efectos del alcohol, drogas o cualquier sustancia que afecte a la capacidad de conducción, siendo el arrendatario totalmente responsable de cualquier daño, accidente, sanción o consecuencia derivada de dicho incumplimiento.",
    "Queda expresamente prohibido ceder el uso del vehículo a terceros no autorizados en el presente contrato, siendo el arrendatario responsable de cualquier uso realizado por terceros.",
    "El conductor deberá disponer de permiso de conducción válido en España, siendo responsabilidad exclusiva del arrendatario la veracidad, vigencia y legalidad de su documentación.",
    "El vehículo se entrega en correcto estado, limpio y con el nivel de combustible indicado, debiendo devolverse en las mismas condiciones; en caso contrario, se aplicarán cargos adicionales por limpieza, combustible o deterioro.",
    "Se establece una fianza de 150€, que será retenida o bloqueada en el momento de la entrega y devuelta tras la revisión del vehículo, descontando posibles daños, penalizaciones o gastos derivados del alquiler.",
    "El vehículo dispone de seguro obligatorio; en caso de accidente, el arrendatario deberá notificar inmediatamente a NEXA RENTALS y completar el parte amistoso o denuncia correspondiente, siendo responsable de los daños ocasionados por negligencia o incumplimiento del contrato.",
    "El arrendatario será responsable de cualquier daño, avería o deterioro sufrido por el vehículo durante el periodo de alquiler, incluyendo daños por accidente, caídas, uso indebido, negligencia o robo por falta de diligencia.",
    "Todas las multas, sanciones o infracciones cometidas durante el periodo de alquiler serán responsabilidad del arrendatario, pudiendo aplicarse una tasa administrativa por su gestión.",
    "El uso del vehículo queda limitado exclusivamente a la isla de Mallorca, estando prohibido su traslado fuera de la misma sin autorización expresa del arrendador.",
    "NEXA RENTALS no se hace responsable de los objetos personales dejados en el vehículo durante el periodo de alquiler.",
    "Para cualquier controversia derivada del presente contrato, las partes se someten expresamente a los juzgados y tribunales de Palma de Mallorca.",
    "Transporte de menores: Se permite el transporte de pasajeros menores de edad únicamente si tienen una edad mínima de 12 años y pueden alcanzar correctamente los reposapiés del vehículo. El conductor asume plena responsabilidad por el transporte del pasajero.",
    "Responsabilidad del pasajero: El conductor será el único responsable de cualquier persona transportada como pasajero en el vehículo alquilado. NEXA RENTALS no se hace responsable de daños, lesiones o incidentes que afecten al pasajero durante el uso del vehículo.",
    "La responsabilidad del uso del vehículo se transfiere íntegramente al arrendatario desde el momento de la entrega del mismo, siendo este el único responsable de cualquier uso, conducta o situación que ocurra durante el periodo de alquiler.",
    "Franquicia del seguro: El vehículo alquilado dispone de un seguro básico sujeto a una franquicia de 800€. En caso de daño, accidente, pérdida o cualquier incidencia que afecte al vehículo durante el periodo de alquiler, el arrendatario será responsable de todos los costes hasta un máximo de 800€, salvo disposición legal en contrario.",
    "En caso de negligencia grave, incumplimiento del contrato, conducción bajo los efectos del alcohol o drogas, o utilización del vehículo por conductores no autorizados, el arrendatario podrá ser responsable del coste total de los daños sin limitación a la franquicia de 800€.",
    "Asistencia en Carretera: La asistencia es gratuita dentro de un radio de 10 km únicamente en caso de avería mecánica no causada por el cliente. Si la asistencia se requiere fuera de esta zona, o por causa del cliente, se aplicará un coste de entre 50€ y 200€ según la distancia y el tipo de servicio.",
    "El cliente declara haber leído, comprendido y aceptado íntegramente todas las condiciones generales y particulares del presente contrato de alquiler, incluyendo las relativas al uso del vehículo, responsabilidades, cobertura de seguro, fianza, cargos adicionales y penalizaciones.",
  ];

  return (
    <>
      <Text style={styles.termsTitle}>NEXA RENTALS – TÉRMINOS Y CONDICIONES</Text>
      {terms.map((term, index) => (
        <Text key={index} style={styles.smallText}>
          {index + 1}. {term}
        </Text>
      ))}
    </>
  );
}

function EnglishTerms() {
  const terms = [
    "The lessor NEXA RENTALS rents to the lessee the vehicle described in this contract, in good working condition, with all its accessories and documentation, and the lessee agrees to use it properly and return it under the agreed conditions.",
    "The rental is calculated in 24-hour periods from the agreed pick-up time, and the vehicle must be returned on the agreed date and time; any delay will automatically result in the charge of a full additional day.",
    "The lessee agrees to use the vehicle in accordance with current traffic regulations in Spain, and its use for competitions, illegal transport, unauthorized commercial purposes or any improper use is prohibited.",
    "It is strictly forbidden to drive the vehicle under the influence of alcohol, drugs, or any substance that may impair driving ability, and the lessee will be fully responsible for any damage, accident, penalty or consequence resulting from such breach.",
    "The driver must hold a valid driving license in Spain, and the lessee is solely responsible for the accuracy, validity and legality of their documentation.",
    "A deposit of €150 is required, which will be retained or blocked at the time of delivery and returned after inspection of the vehicle, deducting any damages, penalties or expenses arising from the rental.",
    "The lessee will be responsible for any damage, breakdown or deterioration suffered by the vehicle during the rental period, including damage from accidents, falls, misuse, negligence or theft due to lack of care.",
    "The use of the vehicle is strictly limited to the island of Mallorca, and it is forbidden to take it outside without express authorization from the lessor.",
    "Passenger responsibility: The driver shall be solely responsible for any person carried as a passenger on the rented vehicle. NEXA RENTALS shall not be held responsible for any damage, injury, or incident affecting the passenger during the use of the vehicle.",
    "Full responsibility for the use of the vehicle is transferred to the renter from the moment the vehicle is handed over. The renter shall be solely responsible for any use, behavior, or situation arising during the rental period.",
    "Insurance Excess: The rented vehicle is covered by a basic insurance policy subject to an excess of 800€. In the event of damage, accident, or loss affecting the vehicle during the rental period, the renter shall be responsible for all costs up to a maximum amount of 800€, unless otherwise stated by law.",
    "Roadside Assistance: Free assistance is provided within 10 km only in case of mechanical failure not caused by the customer. If assistance is required outside this area, or due to customer fault, a service fee of €50–€200 will apply depending on distance and type of service.",
    "The customer declares that they have read, understood, and fully accepted all the general and specific terms and conditions of this rental agreement.",
  ];

  return (
    <>
      <Text style={styles.termsTitle}>NEXA RENTALS – TERMS AND CONDITIONS</Text>
      {terms.map((term, index) => (
        <Text key={index} style={styles.smallText}>
          {index + 1}. {term}
        </Text>
      ))}
    </>
  );
}

export default function NexaContractPDF({
  booking,
}: {
  booking: BookingData;
}) {
  const data = booking.contractData;
  const vehicle = booking.vehicle;

  return (
    <Document
      title={`Contrato ${data.numeroContrato} - ${data.nombreCliente}`}
      author="NEXA RENTALS"
      subject="Contrato de alquiler de vehículo"
      creator="NEXA OS"
      producer="NEXA OS"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.title}>NEXA RENTALS</Text>
              <Text style={styles.subtitle}>Arrendador: SAHILPREET SINGH</Text>
              <Text style={styles.subtitle}>Nombre Comercial: NEXA RENTALS</Text>
              <Text style={styles.subtitle}>Tel.: 971 48 23 42</Text>
              <Text style={styles.subtitle}>NIF/NIE: Y4930755Y</Text>
              <Text style={styles.subtitle}>
                Dirección: CARRER GALEÓN 13, LOCAL 57
              </Text>
            </View>

            <View style={styles.contractBox}>
              <Text style={styles.contractNumberLabel}>Contrato Nº</Text>
              <Text style={styles.contractNumber}>
                {clean(data.numeroContrato)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del vehículo</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Código" value={vehicle.codigo} />
              </View>
              <View style={styles.col}>
                <Field label="Matrícula" value={vehicle.matricula} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field
                  label="Marca/Modelo"
                  value={`${vehicle.marca} ${vehicle.modelo}`}
                />
              </View>
              <View style={styles.col}>
                <Field label="Año" value={vehicle.ano} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Bastidor VIN" value={vehicle.bastidor} />
              </View>
              <View style={styles.col}>
                <Field label="Combustible" value={vehicle.combustible} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del alquiler</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field
                  label="Entrega del vehículo"
                  value={data.oficinaEntrega || "OFICINA MAGALUF"}
                />
              </View>
              <View style={styles.col}>
                <Field
                  label="Recogida del vehículo"
                  value={data.oficinaDevolucion || "OFICINA MAGALUF"}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Fecha entrega" value={data.fechaEntrega} />
              </View>
              <View style={styles.col}>
                <Field label="Hora entrega" value={data.horaEntrega} />
              </View>
              <View style={styles.col}>
                <Field label="KM salida" value={data.kmSalida || "—"} />
              </View>
              <View style={styles.col}>
                <Field
                  label="Combustible salida"
                  value={data.combustibleSalida}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Fecha devolución" value={data.fechaDevolucion} />
              </View>
              <View style={styles.col}>
                <Field label="Hora devolución" value={data.horaDevolucion} />
              </View>
              <View style={styles.col}>
                <Field label="KM entrada" value="" />
              </View>
              <View style={styles.col}>
                <Field label="Combustible entrada" value="" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del cliente</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Nombre" value={data.nombreCliente} />
              </View>
              <View style={styles.col}>
                <Field label="DNI/Pasaporte" value={data.dniPasaporte} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Teléfono" value={data.telefono} />
              </View>
              <View style={styles.col}>
                <Field label="Email" value={data.email} />
              </View>
            </View>

            <Field label="Dirección" value={data.direccion} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del conductor/a</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Nombre" value={data.nombreCliente} />
              </View>
              <View style={styles.col}>
                <Field
                  label="Permiso de conducir"
                  value={data.permisoConducir}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field
                  label="País de expedición"
                  value={data.paisExpedicion}
                />
              </View>
              <View style={styles.col}>
                <Field
                  label="Fecha de caducidad"
                  value={data.fechaCaducidad}
                />
              </View>
            </View>

            <Field label="Dirección" value={data.direccion} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Datos del segundo/a conductor/a si aplica
          </Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Nombre" value={data.segundoNombre} />
              </View>
              <View style={styles.col}>
                <Field
                  label="Permiso de conducir"
                  value={data.segundoPermiso}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="País expedición" value={data.segundoPais} />
              </View>
              <View style={styles.col}>
                <Field
                  label="Fecha caducidad"
                  value={data.segundoFechaCaducidad}
                />
              </View>
            </View>

            <Field label="Dirección" value={data.segundoDireccion} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del alquiler</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Días" value={data.dias} />
              </View>
              <View style={styles.col}>
                <Text>
                  <Text style={styles.label}>Precio por día: </Text>
                  <Money value={data.precioPorDia} />
                </Text>
              </View>
              <View style={styles.col}>
                <Text>
                  <Text style={styles.label}>Total: </Text>
                  <Money value={data.total} />
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <Field label="Fianza" value={data.fianza || "150 €"} />
              </View>
              <View style={styles.col}>
                <Text>
                  <Text style={styles.label}>Pagado: </Text>
                  <Money value={data.pagado} />
                </Text>
              </View>
              <View style={styles.col}>
                <Field label="Franquicia máxima" value="800 €" />
              </View>
            </View>

            <Field
              label="Extras incluidos"
              value={
                data.extras ||
                "Casco 1, Casco 2, Soporte móvil, Baúl, Antirrobo con alarma"
              }
            />
          </View>
        </View>

        <SpanishTerms />

        <View style={styles.signatures}>
          <Text style={styles.signatureBox}>Firma Cliente</Text>
          <Text style={styles.signatureBox}>Firma Conductor</Text>
          <Text style={styles.signatureBox}>Firma 2º Conductor</Text>
          <Text style={styles.signatureBox}>Firma Empresa</Text>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.title}>NEXA RENTALS</Text>
              <Text style={styles.subtitle}>
                Contract Nº: {clean(data.numeroContrato)}
              </Text>
              <Text style={styles.subtitle}>
                Customer: {clean(data.nombreCliente)}
              </Text>
              <Text style={styles.subtitle}>
                Vehicle: {vehicle.codigo} · {vehicle.matricula} ·{" "}
                {vehicle.marca} {vehicle.modelo}
              </Text>
            </View>

            <View style={styles.contractBox}>
              <Text style={styles.contractNumberLabel}>Contract Nº</Text>
              <Text style={styles.contractNumber}>
                {clean(data.numeroContrato)}
              </Text>
            </View>
          </View>
        </View>

        <EnglishTerms />

        <View style={styles.signatures}>
          <Text style={styles.signatureBox}>Customer Signature</Text>
          <Text style={styles.signatureBox}>Driver Signature</Text>
          <Text style={styles.signatureBox}>2nd Driver Signature</Text>
          <Text style={styles.signatureBox}>Company Signature</Text>
        </View>
      </Page>
    </Document>
  );
}