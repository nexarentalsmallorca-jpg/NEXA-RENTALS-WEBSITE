import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.nexarentals.es";

const TOP_LOGO_URL = `${SITE_URL}/images/nexa-logo.png`;

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: 24,
    fontSize: 7.2,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.2,
    position: "relative",
    backgroundColor: "#ffffff",
  },

  /* ---------- watermark ---------- */
  watermarkText: {
    position: "absolute",
    top: 365,
    left: 55,
    width: 470,
    textAlign: "center",
    fontSize: 23,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    opacity: 0.045,
    transform: "rotate(-32deg)",
    letterSpacing: 1.8,
  },

  /* ---------- footer ---------- */
  footer: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    borderTopWidth: 0.6,
    borderTopColor: "#c9c9c9",
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 6.2,
    color: "#5b5b5b",
  },

  footerLeft: {
    fontSize: 6.2,
    color: "#5b5b5b",
  },

  footerRight: {
    fontSize: 6.2,
    color: "#5b5b5b",
    textAlign: "right",
  },

  /* ---------- page 1 header ---------- */
  heroHeader: {
    borderWidth: 1,
    borderColor: "#222222",
    padding: 10,
    marginBottom: 12,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },

  logoArea: {
    width: 175,
    justifyContent: "center",
  },

  logo: {
    width: 130,
    height: 44,
    objectFit: "contain",
  },

  companyArea: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 10,
  },

  companyLine: {
    fontSize: 7.1,
    marginBottom: 1.6,
  },

  contractBox: {
    width: 118,
    borderWidth: 1,
    borderColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  contractLabel: {
    fontSize: 6.5,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },

  contractNumber: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },

  agreementLine: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 0.6,
    borderTopColor: "#666666",
    textAlign: "center",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#222222",
  },

  /* ---------- front page cards ---------- */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cardHalf: {
    width: "48.7%",
    borderWidth: 1,
    borderColor: "#d7d7d7",
    padding: 8,
  },

  cardFull: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d7d7d7",
    padding: 8,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    color: "#111111",
    borderBottomWidth: 0.6,
    borderBottomColor: "#d0d0d0",
    paddingBottom: 4,
  },

  fieldRow: {
    marginBottom: 3,
  },

  label: {
    fontFamily: "Helvetica-Bold",
  },

  value: {
    fontFamily: "Helvetica",
  },

  noteLine: {
    marginTop: 6,
    fontSize: 7.1,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },

  /* ---------- terms pages ---------- */
  simplePageTitleWrap: {
    marginBottom: 8,
    textAlign: "center",
  },

  simplePageTitle: {
    fontSize: 9.3,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#111111",
  },

  simplePageSubtitle: {
    marginTop: 2,
    fontSize: 6.4,
    color: "#666666",
  },

  termsBlock: {
    borderWidth: 1,
    borderColor: "#222222",
    minHeight: 690,
  },

  termsHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomColor: "#222222",
    backgroundColor: "#f7f7f7",
  },

  termsHeaderCellLeft: {
    width: "50%",
    borderRightWidth: 0.8,
    borderRightColor: "#222222",
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },

  termsHeaderCellRight: {
    width: "50%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    textAlign: "center",
  },

  termsColumns: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  termsColumnLeft: {
    width: "50%",
    borderRightWidth: 0.8,
    borderRightColor: "#222222",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 6,
  },

  termsColumnRight: {
    width: "50%",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    paddingRight: 6,
  },

  termText: {
    fontSize: 5.15,
    lineHeight: 1.18,
    marginBottom: 5,
    textAlign: "left",
  },

  termNumber: {
    fontFamily: "Helvetica-Bold",
  },

  /* ---------- final page ---------- */
  finalSection: {
    borderWidth: 1,
    borderColor: "#d7d7d7",
    padding: 10,
    marginBottom: 12,
  },

  finalSectionTitle: {
    fontSize: 8.2,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },

  finalText: {
    fontSize: 6.9,
    lineHeight: 1.25,
    marginBottom: 6,
  },

  signaturesRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  signatureItem: {
    width: "23.5%",
    borderTopWidth: 1,
    borderTopColor: "#222222",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 6.8,
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

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <Text style={styles.fieldRow}>
      <Text style={styles.label}>{label}: </Text>
      <Text style={styles.value}>{clean(value)}</Text>
    </Text>
  );
}

function Watermark() {
  return (
    <Text style={styles.watermarkText} fixed>
      OFFICIAL NEXA RENTALS CONTRACT
    </Text>
  );
}

function Footer({ contractNumber }: { contractNumber: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLeft}>
        NEXA RENTALS · Contract {contractNumber}
      </Text>

      <Text
        style={styles.footerRight}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

function FrontHeader({
  contractNumber,
  customerName,
  vehicleText,
}: {
  contractNumber: string;
  customerName?: string;
  vehicleText?: string;
}) {
  return (
    <View style={styles.heroHeader}>
      <View style={styles.heroTopRow}>
        <View style={styles.logoArea}>
          <Image src={TOP_LOGO_URL} style={styles.logo} />
        </View>

        <View style={styles.companyArea}>
          <Text style={styles.companyLine}>
            <Text style={styles.label}>Arrendador: </Text>SAHILPREET SINGH
          </Text>
          <Text style={styles.companyLine}>
            <Text style={styles.label}>Nombre Comercial: </Text>NEXA RENTALS
          </Text>
          <Text style={styles.companyLine}>
            <Text style={styles.label}>Tel.: </Text>971 48 23 42
          </Text>
          <Text style={styles.companyLine}>
            <Text style={styles.label}>NIF/NIE: </Text>Y4930755Y
          </Text>
          <Text style={styles.companyLine}>
            <Text style={styles.label}>Dirección: </Text>CARRER GALEÓN 13, LOCAL
            57
          </Text>

          {customerName ? (
            <Text style={styles.companyLine}>
              <Text style={styles.label}>Cliente: </Text>
              {customerName}
            </Text>
          ) : null}

          {vehicleText ? (
            <Text style={styles.companyLine}>
              <Text style={styles.label}>Vehículo: </Text>
              {vehicleText}
            </Text>
          ) : null}
        </View>

        <View style={styles.contractBox}>
          <Text style={styles.contractLabel}>Contrato Nº</Text>
          <Text style={styles.contractNumber}>{clean(contractNumber)}</Text>
        </View>
      </View>

      <Text style={styles.agreementLine}>
        Official Vehicle Rental Agreement · Contrato Oficial de Alquiler de
        Vehículo
      </Text>
    </View>
  );
}

const spanishTerms = [
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
  "El vehículo deberá devolverse con el mismo nivel de combustible con el que fue entregado; en caso contrario, se cobrará el combustible faltante más una tarifa de servicio adicional.",
  "Todas las multas, sanciones o infracciones cometidas durante el periodo de alquiler serán responsabilidad del arrendatario, pudiendo aplicarse una tasa administrativa por su gestión.",
  "En caso de robo o pérdida del vehículo, el arrendatario deberá notificarlo inmediatamente y presentar denuncia policial, siendo responsable del valor total del vehículo en caso de negligencia.",
  "El uso del vehículo queda limitado exclusivamente a la isla de Mallorca, estando prohibido su traslado fuera de la misma sin autorización expresa del arrendador.",
  "El uso del casco es obligatorio conforme a la normativa vigente, siendo responsabilidad exclusiva del arrendatario cualquier incumplimiento de esta obligación.",
  "El arrendatario es responsable del vehículo desde el momento de la entrega hasta su devolución, asumiendo cualquier daño, pérdida o incumplimiento de las condiciones del contrato.",
  "Las reservas podrán estar sujetas a condiciones específicas, no garantizándose el reembolso en caso de cancelación fuera de los plazos establecidos.",
  "NEXA RENTALS no se hace responsable de los objetos personales dejados en el vehículo durante el periodo de alquiler.",
  "Los datos personales del arrendatario serán tratados conforme a la legislación vigente en materia de protección de datos, utilizándose exclusivamente para la gestión del servicio contratado.",
  "En caso de incumplimiento de cualquiera de las condiciones del presente contrato, el arrendador podrá rescindir el mismo de forma inmediata.",
  "Para cualquier controversia derivada del presente contrato, las partes se someten expresamente a los juzgados y tribunales de Palma de Mallorca.",
  "Transporte de menores: Se permite el transporte de pasajeros menores de edad únicamente si tienen una edad mínima de 12 años y pueden alcanzar correctamente los reposapiés del vehículo. El cliente declara y confirma que cualquier pasajero menor de edad cumple con este requisito de edad. El conductor asume plena responsabilidad por el transporte del pasajero, incluyendo su seguridad durante todo el periodo de alquiler.",
  "Responsabilidad del pasajero: El conductor será el único responsable de cualquier persona transportada como pasajero en el vehículo alquilado. NEXA RENTALS no se hace responsable de daños, lesiones o cualquier incidente que afecte al pasajero durante el uso del vehículo. El conductor se compromete a garantizar que el pasajero cumple con las normas de seguridad, incluyendo el uso obligatorio de casco y una posición adecuada en el vehículo.",
  "El arrendatario declara expresamente, bajo su exclusiva responsabilidad, que en el momento de la recogida del vehículo se encuentra en plenas condiciones físicas y mentales para la conducción, no estando bajo los efectos del alcohol, drogas, medicamentos o cualquier sustancia que pueda afectar a su capacidad de conducción. El arrendatario reconoce que ha sido informado de la prohibición absoluta de conducir bajo los efectos de alcohol o drogas y se compromete a no utilizar el vehículo en tales condiciones durante todo el periodo de alquiler. NEXA RENTALS queda totalmente exonerada de cualquier responsabilidad derivada de accidentes, daños, lesiones o perjuicios ocasionados como consecuencia de la conducción bajo los efectos de alcohol, drogas o sustancias similares, incluso si estos hechos ocurren con posterioridad a la entrega del vehículo.",
  "La responsabilidad del uso del vehículo se transfiere íntegramente al arrendatario desde el momento de la entrega del mismo, siendo este el único responsable de cualquier uso, conducta o situación que ocurra durante el periodo de alquiler. NEXA RENTALS no será responsable de ninguna acción, negligencia, imprudencia o infracción cometida por el arrendatario una vez realizado el acto de entrega del vehículo.",
  "El arrendador no será responsable de la conducta del arrendatario tras la entrega del vehículo, incluyendo el consumo de alcohol o drogas con posterioridad a la recogida. Cualquier accidente, daño o incidente ocurrido después de la entrega del vehículo, independientemente de las circunstancias, será responsabilidad exclusiva del arrendatario.",
  "NEXA RENTALS realiza una verificación básica de la documentación y estado aparente del arrendatario en el momento de la entrega del vehículo, no pudiendo garantizar ni controlar el estado del conductor durante el periodo de alquiler. El arrendatario acepta que dicha verificación no implica en ningún caso asunción de responsabilidad por parte del arrendador.",
  "El arrendatario declara haber leído, comprendido y aceptado todas las condiciones del presente contrato, asumiendo plenamente las responsabilidades derivadas del uso del vehículo. Asimismo, el arrendatario reconoce que el incumplimiento de cualquiera de las condiciones, especialmente las relativas al consumo de alcohol o drogas, implicará su responsabilidad total frente a terceros, autoridades y NEXA RENTALS.",
  "Franquicia del seguro: El vehículo alquilado dispone de un seguro básico sujeto a una franquicia de 800€. En caso de daño, accidente, pérdida o cualquier incidencia que afecte al vehículo durante el periodo de alquiler, el arrendatario será responsable de todos los costes hasta un máximo de 800€, independientemente de la responsabilidad del siniestro, salvo disposición legal en contrario. El arrendatario autoriza expresamente a NEXA RENTALS a retener o cobrar cualquier importe necesario de la fianza o por otros medios legales, con el fin de cubrir daños, reparaciones, costes administrativos o cualquier perjuicio ocasionado, hasta el límite de la franquicia. La presente franquicia será aplicable en todos los casos, incluyendo, entre otros, accidentes, caídas, actos vandálicos, uso indebido o negligencia, salvo aquellos supuestos expresamente cubiertos por la póliza de seguro. En caso de negligencia grave, incumplimiento del contrato, conducción bajo los efectos del alcohol o drogas, o utilización del vehículo por conductores no autorizados, el arrendatario podrá ser responsable del coste total de los daños sin limitación a la franquicia de 800€.",
];

const englishTerms = [
  "The lessor NEXA RENTALS rents to the lessee the vehicle described in this contract, in good working condition, with all its accessories and documentation, and the lessee agrees to use it properly and return it under the agreed conditions.",
  "The rental is calculated in 24-hour periods from the agreed pick-up time, and the vehicle must be returned on the agreed date and time; any delay will automatically result in the charge of a full additional day.",
  "The lessee agrees to use the vehicle in accordance with current traffic regulations in Spain, and its use for competitions, illegal transport, unauthorized commercial purposes or any improper use is prohibited.",
  "It is strictly forbidden to drive the vehicle under the influence of alcohol, drugs, or any substance that may impair driving ability, and the lessee will be fully responsible for any damage, accident, penalty or consequence resulting from such breach.",
  "It is expressly forbidden to transfer the use of the vehicle to unauthorized third parties, and the lessee will be responsible for any use by third parties.",
  "The driver must hold a valid driving license in Spain, and the lessee is solely responsible for the accuracy, validity and legality of their documentation.",
  "The vehicle is delivered in good condition, clean and with the indicated fuel level, and must be returned in the same condition; otherwise, additional charges will apply for cleaning, fuel or damage.",
  "A deposit of €150 is required, which will be retained or blocked at the time of delivery and returned after inspection of the vehicle, deducting any damages, penalties or expenses arising from the rental.",
  "The vehicle has mandatory insurance; in case of an accident, the lessee must immediately notify NEXA RENTALS and complete the accident report or police report, being responsible for damages caused by negligence or breach of contract.",
  "The lessee will be responsible for any damage, breakdown or deterioration suffered by the vehicle during the rental period, including damage from accidents, falls, misuse, negligence or theft due to lack of care.",
  "The vehicle must be returned with the same fuel level as delivered; otherwise, the missing fuel will be charged plus an additional service fee.",
  "All fines, penalties or infractions incurred during the rental period will be the responsibility of the lessee, and an administrative fee may be applied for their management.",
  "In case of theft or loss of the vehicle, the lessee must notify immediately and file a police report, being responsible for the total value of the vehicle in case of negligence.",
  "The use of the vehicle is strictly limited to the island of Mallorca, and it is forbidden to take it outside without express authorization from the lessor.",
  "The use of a helmet is mandatory according to current regulations, and any failure to comply is the sole responsibility of the lessee.",
  "The lessee is responsible for the vehicle from the moment of delivery until its return, assuming any damage, loss or breach of the contract conditions.",
  "Reservations may be subject to specific conditions, and refunds are not guaranteed in case of cancellation outside the established deadlines.",
  "NEXA RENTALS is not responsible for personal belongings left in the vehicle during the rental period.",
  "The lessee’s personal data will be processed in accordance with current data protection laws and used exclusively for managing the contracted service.",
  "In case of breach of any of the conditions of this contract, the lessor may terminate it immediately.",
  "For any dispute arising from this contract, the parties expressly submit to the courts and tribunals of Palma de Mallorca.",
  "Transport of minors: The transport of minor passengers is only permitted if they are at least 12 years old and able to properly reach the footrests of the vehicle. The client declares and confirms that any minor passenger meets this minimum age requirement. The driver assumes full responsibility for transporting the passenger, including their safety throughout the entire rental period.",
  "Passenger responsibility: The driver shall be solely responsible for any person carried as a passenger on the rented vehicle. NEXA RENTALS shall not be held responsible for any damage, injury, or incident affecting the passenger during the use of the vehicle. The driver agrees to ensure that the passenger complies with all safety regulations, including the mandatory use of a helmet and proper seating on the vehicle.",
  "The renter expressly declares, under their sole responsibility, that at the time of collecting the vehicle they are in full physical and mental condition to drive and are not under the influence of alcohol, drugs, medication, or any substance that may affect driving ability. The renter acknowledges having been informed of the absolute prohibition of driving under the influence of alcohol or drugs and undertakes not to use the vehicle under such conditions throughout the rental period. NEXA RENTALS shall be fully exempt from any liability arising from accidents, damage, injuries, or losses caused as a consequence of driving under the influence of alcohol, drugs, or similar substances, even if such events occur after the delivery of the vehicle.",
  "Full responsibility for the use of the vehicle is transferred to the renter from the moment the vehicle is handed over. The renter shall be solely responsible for any use, behavior, or situation arising during the rental period. NEXA RENTALS shall not be held liable for any actions, negligence, misconduct, or violations committed by the renter after the delivery of the vehicle.",
  "The rental company shall not be responsible for the conduct of the renter after the vehicle has been delivered, including any consumption of alcohol or drugs following the collection of the vehicle. Any accident, damage, or incident occurring after the vehicle has been handed over, regardless of the circumstances, shall be the sole responsibility of the renter.",
  "NEXA RENTALS performs a basic verification of the renter’s documentation and apparent condition at the time of vehicle handover. However, it cannot guarantee or control the driver's condition during the rental period. The renter acknowledges that such verification does not imply any assumption of responsibility by the rental company.",
  "The renter declares that they have read, understood, and accepted all the terms and conditions of this agreement, and fully assume the responsibilities arising from the use of the vehicle. Furthermore, the renter acknowledges that any breach of these conditions, particularly those related to the consumption of alcohol or drugs, will result in full liability towards third parties, authorities, and NEXA RENTALS.",
  "Insurance Excess (Franchise): The rented vehicle is covered by a basic insurance policy subject to an excess of 800€. In the event of damage, accident, or loss affecting the vehicle during the rental period, the renter shall be fully responsible for all costs up to a maximum amount of 800€, regardless of fault, unless otherwise stated by law. The renter agrees that NEXA RENTALS is authorized to retain or charge any necessary amount from the security deposit, or by any other legal means, to cover damages, repairs, administrative costs, or any losses incurred, up to the value of the franchise. This excess shall apply in all cases, including but not limited to accidents, falls, vandalism, misuse, or negligence, except where coverage is expressly provided by the insurance company. In cases of gross negligence, breach of contract, driving under the influence of alcohol or drugs, or use by unauthorized drivers, the renter may be held liable for the full cost of damages, without limitation to the 800€ excess.",
];

function TermsColumns({
  spanish,
  english,
  startNumber,
}: {
  spanish: string[];
  english: string[];
  startNumber: number;
}) {
  return (
    <View style={styles.termsBlock}>
      <View style={styles.termsHeaderRow}>
        <Text style={styles.termsHeaderCellLeft}>Español</Text>
        <Text style={styles.termsHeaderCellRight}>English Translation</Text>
      </View>

      <View style={styles.termsColumns}>
        <View style={styles.termsColumnLeft}>
          {spanish.map((term, index) => (
            <Text key={`es-${startNumber + index}`} style={styles.termText}>
              <Text style={styles.termNumber}>{startNumber + index + 1}. </Text>
              {term}
            </Text>
          ))}
        </View>

        <View style={styles.termsColumnRight}>
          {english.map((term, index) => (
            <Text key={`en-${startNumber + index}`} style={styles.termText}>
              <Text style={styles.termNumber}>{startNumber + index + 1}. </Text>
              {term}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function FinalPageContent() {
  return (
    <>
      <View style={styles.simplePageTitleWrap}>
        <Text style={styles.simplePageTitle}>
          Additional Conditions · Condiciones Adicionales
        </Text>
      </View>

      <View style={styles.finalSection}>
        <Text style={styles.finalSectionTitle}>Roadside Assistance:</Text>
        <Text style={styles.finalText}>
          Free assistance is provided within 10 km only in case of mechanical
          failure not caused by the customer. If assistance is required outside
          this area, or due to customer fault, including misuse, negligence,
          flat battery, lost keys, wrong fuel or similar, a service fee of
          €50–€200 will apply depending on distance and type of service.
          Services may include on-site repair, towing, or remote assistance.
          The exact cost will be confirmed before service.
        </Text>

        <Text style={styles.finalSectionTitle}>Asistencia en Carretera:</Text>
        <Text style={styles.finalText}>
          La asistencia es gratuita dentro de un radio de 10 km únicamente en
          caso de avería mecánica no causada por el cliente. Si la asistencia
          se requiere fuera de esta zona, o por causa del cliente, incluyendo
          mal uso, negligencia, batería descargada, pérdida de llaves,
          combustible incorrecto o similar, se aplicará un coste de entre 50€
          y 200€ según la distancia y el tipo de servicio. Los servicios pueden
          incluir reparación en el lugar, remolque o asistencia remota. El
          coste exacto será confirmado antes del servicio.
        </Text>
      </View>

      <View style={styles.finalSection}>
        <Text style={styles.finalText}>
          The customer declares that they have read, understood, and fully
          accepted all the general and specific terms and conditions of this
          rental agreement, including those related to the use of the vehicle,
          responsibilities, insurance coverage, security deposit, additional
          charges, and penalties, and agrees to comply strictly with them for
          the entire duration of the contract.
        </Text>

        <Text style={styles.finalText}>
          El cliente declara haber leído, comprendido y aceptado íntegramente
          todas las condiciones generales y particulares del presente contrato
          de alquiler, incluyendo las relativas al uso del vehículo,
          responsabilidades, cobertura de seguro, fianza, cargos adicionales y
          penalizaciones, obligándose a su estricto cumplimiento durante toda la
          duración del contrato.
        </Text>
      </View>

      <View style={styles.signaturesRow}>
        <Text style={styles.signatureItem}>Firma Cliente</Text>
        <Text style={styles.signatureItem}>Firma Conductor</Text>
        <Text style={styles.signatureItem}>Firma 2º Conductor</Text>
        <Text style={styles.signatureItem}>Firma Empresa</Text>
      </View>
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

  const vehicleText = `${vehicle.codigo} · ${vehicle.matricula} · ${vehicle.marca} ${vehicle.modelo}`;

  const page2Spanish = spanishTerms.slice(0, 16);
  const page2English = englishTerms.slice(0, 16);

  const page3Spanish = spanishTerms.slice(16);
  const page3English = englishTerms.slice(16);

  return (
    <Document
      title={`Contrato ${data.numeroContrato} - ${data.nombreCliente}`}
      author="NEXA RENTALS"
      subject="Contrato de alquiler de vehículo"
      creator="NEXA OS"
      producer="NEXA OS"
    >
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <Footer contractNumber={data.numeroContrato} />

        <FrontHeader
          contractNumber={data.numeroContrato}
          customerName={data.nombreCliente}
          vehicleText={vehicleText}
        />

        <View style={styles.row}>
          <View style={styles.cardHalf}>
            <Text style={styles.cardTitle}>Datos del vehículo</Text>
            <Field label="Código" value={vehicle.codigo} />
            <Field label="Matrícula" value={vehicle.matricula} />
            <Field
              label="Marca / Modelo"
              value={`${vehicle.marca} ${vehicle.modelo}`}
            />
            <Field label="Año" value={vehicle.ano} />
            <Field label="Bastidor VIN" value={vehicle.bastidor} />
            <Field label="Combustible" value={vehicle.combustible} />
          </View>

          <View style={styles.cardHalf}>
            <Text style={styles.cardTitle}>Datos del alquiler</Text>
            <Field
              label="Entrega del vehículo"
              value={data.oficinaEntrega || "OFICINA MAGALUF"}
            />
            <Field
              label="Recogida del vehículo"
              value={data.oficinaDevolucion || "OFICINA MAGALUF"}
            />
            <Field label="Fecha entrega" value={data.fechaEntrega} />
            <Field label="Hora entrega" value={data.horaEntrega} />
            <Field label="Fecha devolución" value={data.fechaDevolucion} />
            <Field label="Hora devolución" value={data.horaDevolucion} />
            <Field label="KM salida" value={data.kmSalida || "—"} />
            <Field label="Combustible salida" value={data.combustibleSalida} />
            <Field label="KM entrada" value="" />
            <Field label="Combustible entrada" value="" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.cardHalf}>
            <Text style={styles.cardTitle}>Datos del cliente</Text>
            <Field label="Nombre" value={data.nombreCliente} />
            <Field label="DNI / Pasaporte" value={data.dniPasaporte} />
            <Field label="Teléfono" value={data.telefono} />
            <Field label="Email" value={data.email} />
            <Field label="Dirección" value={data.direccion} />
          </View>

          <View style={styles.cardHalf}>
            <Text style={styles.cardTitle}>Datos del conductor/a</Text>
            <Field label="Nombre" value={data.nombreCliente} />
            <Field label="Permiso de conducir" value={data.permisoConducir} />
            <Field label="País de expedición" value={data.paisExpedicion} />
            <Field label="Fecha de caducidad" value={data.fechaCaducidad} />
            <Field label="Dirección" value={data.direccion} />
          </View>
        </View>

        <View style={styles.cardFull}>
          <Text style={styles.cardTitle}>
            Datos del segundo/a conductor/a si aplica
          </Text>
          <View style={styles.row}>
            <View style={{ width: "48.7%" }}>
              <Field label="Nombre" value={data.segundoNombre} />
              <Field
                label="Permiso de conducir"
                value={data.segundoPermiso}
              />
            </View>
            <View style={{ width: "48.7%" }}>
              <Field label="País de expedición" value={data.segundoPais} />
              <Field
                label="Fecha de caducidad"
                value={data.segundoFechaCaducidad}
              />
            </View>
          </View>
          <Field label="Dirección" value={data.segundoDireccion} />
        </View>

        <View style={styles.cardFull}>
          <Text style={styles.cardTitle}>Detalles del alquiler</Text>

          <View style={styles.row}>
            <View style={{ width: "31.5%" }}>
              <Field label="Días" value={data.dias} />
            </View>
            <View style={{ width: "31.5%" }}>
              <Text style={styles.fieldRow}>
                <Text style={styles.label}>Precio por día: </Text>
                <Money value={data.precioPorDia} />
              </Text>
            </View>
            <View style={{ width: "31.5%" }}>
              <Text style={styles.fieldRow}>
                <Text style={styles.label}>Total: </Text>
                <Money value={data.total} />
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ width: "31.5%" }}>
              <Field label="Fianza" value={data.fianza || "150 €"} />
            </View>
            <View style={{ width: "31.5%" }}>
              <Text style={styles.fieldRow}>
                <Text style={styles.label}>Pagado: </Text>
                <Money value={data.pagado} />
              </Text>
            </View>
            <View style={{ width: "31.5%" }}>
              <Field label="Franquicia máxima" value={data.franquicia || "800 €"} />
            </View>
          </View>

          <Field
            label="Extras incluidos"
            value={
              data.extras ||
              "Casco 1, Casco 2, Soporte móvil, Baúl, Antirrobo con alarma"
            }
          />

          <Text style={styles.noteLine}>
            El arrendatario asume una franquicia máxima de 800€ en caso de
            daños.
          </Text>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <Footer contractNumber={data.numeroContrato} />

        <View style={styles.simplePageTitleWrap}>
          <Text style={styles.simplePageTitle}>
            NEXA RENTALS – TÉRMINOS Y CONDICIONES
          </Text>
          <Text style={styles.simplePageSubtitle}>
            Spanish version on the left · English translation on the right
          </Text>
        </View>

        <TermsColumns
          spanish={page2Spanish}
          english={page2English}
          startNumber={0}
        />
      </Page>

      {/* PAGE 3 */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <Footer contractNumber={data.numeroContrato} />

        <View style={styles.simplePageTitleWrap}>
          <Text style={styles.simplePageTitle}>
            NEXA RENTALS – TÉRMINOS Y CONDICIONES
          </Text>
          <Text style={styles.simplePageSubtitle}>
            Spanish version on the left · English translation on the right
          </Text>
        </View>

        <TermsColumns
          spanish={page3Spanish}
          english={page3English}
          startNumber={16}
        />
      </Page>

      {/* PAGE 4 */}
      <Page size="A4" style={styles.page}>
        <Watermark />
        <Footer contractNumber={data.numeroContrato} />
        <FinalPageContent />
      </Page>
    </Document>
  );
}