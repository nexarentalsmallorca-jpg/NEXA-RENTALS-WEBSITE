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
    paddingTop: 22,
    paddingBottom: 30,
    paddingHorizontal: 24,
    fontSize: 7.3,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.2,
    position: "relative",
    backgroundColor: "#ffffff",
  },

  termsPage: {
    paddingTop: 18,
    paddingBottom: 30,
    paddingHorizontal: 24,
    fontSize: 7.3,
    fontFamily: "Helvetica",
    color: "#000000",
    lineHeight: 1.15,
    position: "relative",
    backgroundColor: "#ffffff",
  },

  finalPage: {
    paddingTop: 26,
    paddingBottom: 30,
    paddingHorizontal: 24,
    fontSize: 7.3,
    fontFamily: "Helvetica",
    color: "#111111",
    lineHeight: 1.2,
    position: "relative",
    backgroundColor: "#ffffff",
  },

  pageNumber: {
    position: "absolute",
    bottom: 10,
    right: 24,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#222222",
  },

  watermarkText: {
    position: "absolute",
    top: 395,
    left: 76,
    width: 470,
    textAlign: "center",
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    opacity: 0.028,
    letterSpacing: 1.5,
    transform: "rotate(-30deg)",
  },

  premiumFrame: {
    borderWidth: 1.2,
    borderColor: "#101010",
    padding: 4,
    marginBottom: 8,
  },

  premiumInner: {
    borderWidth: 0.8,
    borderColor: "#101010",
    padding: 10,
  },

  topBar: {
    backgroundColor: "#111111",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 9,
  },

  topBarText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 7.1,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoBlock: {
    width: 195,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  logo: {
    width: 185,
    height: 80,
    objectFit: "contain",
  },

  companyBlock: {
    flex: 1,
    paddingHorizontal: 10,
  },

  brandTitle: {
    fontSize: 10.2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  companyLine: {
    fontSize: 7.2,
    marginBottom: 2,
  },

  contractBox: {
    width: 122,
    borderWidth: 1,
    borderColor: "#111111",
    backgroundColor: "#fbfbfb",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  contractLabel: {
    fontSize: 6.7,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
    color: "#4a4a4a",
  },

  contractNumber: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  officialText: {
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 0.7,
    borderTopColor: "#111111",
    textAlign: "center",
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  summaryCard: {
    borderWidth: 0.8,
    borderColor: "#111111",
    backgroundColor: "#f7f7f7",
    padding: 7,
    marginBottom: 7,
  },

  summaryRow: {
    flexDirection: "row",
  },

  summaryItem: {
    flex: 1,
    paddingRight: 8,
  },

  summaryLabel: {
    fontSize: 6.1,
    color: "#555555",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  summaryValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  section: {
    borderWidth: 0.8,
    borderColor: "#111111",
    padding: 7,
    marginBottom: 7,
    backgroundColor: "#ffffff",
  },

  sectionTitle: {
    fontSize: 8.2,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
    color: "#000000",
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#111111",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    marginBottom: 3.5,
  },

  col: {
    flex: 1,
    paddingRight: 10,
  },

  label: {
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  value: {
    color: "#111111",
  },

  importantLineBox: {
    marginTop: 5,
    borderWidth: 0.7,
    borderColor: "#111111",
    backgroundColor: "#f6f6f6",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },

  importantLine: {
    textAlign: "center",
    fontSize: 7.8,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  termsTitleWrap: {
    marginBottom: 5,
  },

  termsTitle: {
    textAlign: "center",
    fontSize: 10.2,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.45,
    textTransform: "uppercase",
    color: "#000000",
    marginBottom: 2,
  },

  termsSubtitle: {
    textAlign: "center",
    fontSize: 6.7,
    color: "#222222",
    fontFamily: "Helvetica-Bold",
  },

  termsFlowBox: {
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    width: "100%",
  },

  termsFlowHeader: {
    flexDirection: "row",
    backgroundColor: "#111111",
    borderBottomWidth: 0.8,
    borderBottomColor: "#000000",
  },

  termsFlowHeaderCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },

  termsFlowHeaderLeft: {
    borderRightWidth: 0.8,
    borderRightColor: "#ffffff",
  },

  termsFlowHeaderText: {
    textAlign: "center",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#ffffff",
  },

  termsFlowBody: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  termsFlowColumnLeft: {
    flex: 1,
    borderRightWidth: 0.8,
    borderRightColor: "#111111",
    paddingTop: 3,
    paddingBottom: 3,
    paddingHorizontal: 4,
  },

  termsFlowColumnRight: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 3,
    paddingHorizontal: 4,
  },

  termParagraph: {
    fontSize: 4.65,
    lineHeight: 1.06,
    color: "#000000",
    marginBottom: 1.65,
    fontFamily: "Helvetica",
  },

  termParagraphNumber: {
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  lastPageTitle: {
    fontSize: 10.2,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  infoBlock: {
    borderWidth: 0.8,
    borderColor: "#111111",
    padding: 8,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },

  blockTitle: {
    fontSize: 8.3,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#000000",
  },

  paragraph: {
    fontSize: 7.05,
    lineHeight: 1.28,
    marginBottom: 5,
    color: "#111111",
  },

  signaturePanel: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#111111",
    backgroundColor: "#fafafa",
    padding: 10,
  },

  signaturePanelTitle: {
    textAlign: "center",
    fontSize: 8.4,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
    color: "#000000",
  },

  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  signatureCard: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: "#111111",
    backgroundColor: "#ffffff",
    paddingTop: 26,
    paddingBottom: 6,
    paddingHorizontal: 6,
    minHeight: 54,
  },

  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 6.7,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },

  signatureSub: {
    marginTop: 2,
    textAlign: "center",
    fontSize: 5.8,
    color: "#5d5d5d",
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
    <Text>
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

function PageNumber() {
  return (
    <Text
      style={styles.pageNumber}
      fixed
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
    />
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
    <View style={styles.premiumFrame}>
      <View style={styles.premiumInner}>
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>
            NEXA RENTALS · OFFICIAL VEHICLE RENTAL AGREEMENT
          </Text>
        </View>

        <View style={styles.headerRow}>
          <View style={styles.logoBlock}>
            <Image src={TOP_LOGO_URL} style={styles.logo} />
          </View>

          <View style={styles.companyBlock}>
            <Text style={styles.brandTitle}>NEXA RENTALS</Text>

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
              <Text style={styles.label}>Dirección: </Text>CARRER GALEÓN 13, LOCAL 57
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

        <Text style={styles.officialText}>
          Contrato oficial de alquiler de vehículo · Official rental contract
        </Text>
      </View>
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
  "The renter expressly declares, under their sole responsibility, that at the time of collecting the vehicle they are in full physical and mental condition to drive and are not under the influence of alcohol, drugs, medication, or any substance that may affect driving ability. The renter acknowledges that they have been informed of the absolute prohibition on driving under the influence of alcohol or drugs and undertakes not to use the vehicle in such conditions during the entire rental period. NEXA RENTALS is fully exonerated from any responsibility arising from accidents, damages, injuries, or losses caused as a consequence of driving under the influence of alcohol, drugs, or similar substances, even if such events occur after the delivery of the vehicle.",
  "Full responsibility for the use of the vehicle is transferred to the renter from the moment the vehicle is handed over. The renter shall be solely responsible for any use, behavior, or situation arising during the rental period. NEXA RENTALS shall not be held liable for any actions, negligence, misconduct, or violations committed by the renter after the delivery of the vehicle.",
  "The rental company shall not be responsible for the conduct of the renter after the vehicle has been delivered, including any consumption of alcohol or drugs following collection. Any accident, damage, or incident occurring after the vehicle has been handed over, regardless of the circumstances, shall be the sole responsibility of the renter.",
  "NEXA RENTALS performs a basic verification of the renter’s documentation and apparent condition at the time of vehicle handover. However, it cannot guarantee or control the driver's condition during the rental period. The renter acknowledges that such verification does not imply any assumption of responsibility by the rental company.",
  "The renter declares that they have read, understood, and accepted all the terms and conditions of this agreement, and fully assume the responsibilities arising from the use of the vehicle. Furthermore, the renter acknowledges that any breach of these conditions, particularly those related to the consumption of alcohol or drugs, will result in full liability towards third parties, authorities, and NEXA RENTALS.",
  "Insurance Excess (Franchise): The rented vehicle is covered by a basic insurance policy subject to an excess of 800€. In the event of damage, accident, loss or any incident affecting the vehicle during the rental period, the renter shall be responsible for all costs up to a maximum of 800€, regardless of fault, unless otherwise provided by law. The renter expressly authorizes NEXA RENTALS to retain or charge any necessary amount from the security deposit, or by other legal means, in order to cover damages, repairs, administrative costs, or any loss caused, up to the value of the franchise. This excess shall apply in all cases, including, among others, accidents, falls, vandalism, misuse, or negligence, except where coverage is expressly provided by the insurance policy. In cases of gross negligence, breach of contract, driving under the influence of alcohol or drugs, or use by unauthorized drivers, the renter may be held liable for the full cost of damages, without limitation to the 800€ excess.",
];

function TermsBlock() {
  return (
    <>
      <View style={styles.termsTitleWrap}>
        <Text style={styles.termsTitle}>
          NEXA RENTALS – TÉRMINOS Y CONDICIONES
        </Text>
        <Text style={styles.termsSubtitle}>
          Spanish version on the left · English translation on the right
        </Text>
      </View>

      <View style={styles.termsFlowBox}>
        <View style={styles.termsFlowHeader} fixed>
          <View style={[styles.termsFlowHeaderCell, styles.termsFlowHeaderLeft]}>
            <Text style={styles.termsFlowHeaderText}>Español</Text>
          </View>

          <View style={styles.termsFlowHeaderCell}>
            <Text style={styles.termsFlowHeaderText}>English Translation</Text>
          </View>
        </View>

        <View style={styles.termsFlowBody}>
          <View style={styles.termsFlowColumnLeft}>
            {spanishTerms.map((term, index) => (
              <Text key={`spanish-term-${index}`} style={styles.termParagraph}>
                <Text style={styles.termParagraphNumber}>{index + 1}. </Text>
                {term}
              </Text>
            ))}
          </View>

          <View style={styles.termsFlowColumnRight}>
            {englishTerms.map((term, index) => (
              <Text key={`english-term-${index}`} style={styles.termParagraph}>
                <Text style={styles.termParagraphNumber}>{index + 1}. </Text>
                {term}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </>
  );
}

function FinalPageContent() {
  return (
    <>
      <Text style={styles.lastPageTitle}>
        Additional Clauses · Cláusulas Adicionales
      </Text>

      <View style={styles.infoBlock}>
        <Text style={styles.blockTitle}>Roadside Assistance:</Text>
        <Text style={styles.paragraph}>
          Free assistance is provided within 10 km only in case of mechanical
          failure not caused by the customer. If assistance is required outside
          this area, or due to customer fault, including misuse, negligence,
          flat battery, lost keys, wrong fuel or similar, a service fee of
          €50–€200 will apply depending on distance and type of service.
          Services may include on-site repair, towing, or remote assistance.
          The exact cost will be confirmed before service.
        </Text>

        <Text style={styles.blockTitle}>Asistencia en Carretera:</Text>
        <Text style={styles.paragraph}>
          La asistencia es gratuita dentro de un radio de 10 km únicamente en
          caso de avería mecánica no causada por el cliente. Si la asistencia se
          requiere fuera de esta zona, o por causa del cliente, incluyendo mal
          uso, negligencia, batería descargada, pérdida de llaves, combustible
          incorrecto o similar, se aplicará un coste de entre 50€ y 200€ según
          la distancia y el tipo de servicio. Los servicios pueden incluir
          reparación en el lugar, remolque o asistencia remota. El coste exacto
          será confirmado antes del servicio.
        </Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.paragraph}>
          The customer declares that they have read, understood, and fully
          accepted all the general and specific terms and conditions of this
          rental agreement, including those related to the use of the vehicle,
          responsibilities, insurance coverage, security deposit, additional
          charges, and penalties, and agrees to comply strictly with them for the
          entire duration of the contract.
        </Text>

        <Text style={styles.paragraph}>
          El cliente declara haber leído, comprendido y aceptado íntegramente
          todas las condiciones generales y particulares del presente contrato de
          alquiler, incluyendo las relativas al uso del vehículo,
          responsabilidades, cobertura de seguro, fianza, cargos adicionales y
          penalizaciones, obligándose a su estricto cumplimiento durante toda la
          duración del contrato.
        </Text>
      </View>

      <View style={styles.signaturePanel}>
        <Text style={styles.signaturePanelTitle}>
          Acceptance and Signatures · Aceptación y Firmas
        </Text>

        <View style={styles.signaturesRow}>
          <View style={styles.signatureCard}>
            <Text style={styles.signatureLine}>Firma Cliente</Text>
            <Text style={styles.signatureSub}>Customer Signature</Text>
          </View>

          <View style={styles.signatureCard}>
            <Text style={styles.signatureLine}>Firma Conductor</Text>
            <Text style={styles.signatureSub}>Driver Signature</Text>
          </View>

          <View style={styles.signatureCard}>
            <Text style={styles.signatureLine}>Firma 2º Conductor</Text>
            <Text style={styles.signatureSub}>Second Driver</Text>
          </View>

          <View style={styles.signatureCard}>
            <Text style={styles.signatureLine}>Firma Empresa</Text>
            <Text style={styles.signatureSub}>Company Signature</Text>
          </View>
        </View>
      </View>
    </>
  );
}

export default function NexaContractPDF({ booking }: { booking: BookingData }) {
  const data = booking.contractData;
  const vehicle = booking.vehicle;

  const vehicleText = `${vehicle.codigo} · ${vehicle.matricula} · ${vehicle.marca} ${vehicle.modelo}`;

  return (
    <Document
      title={`Contrato ${data.numeroContrato} - ${data.nombreCliente}`}
      author="NEXA RENTALS"
      subject="Contrato de alquiler de vehículo"
      creator="NEXA OS"
      producer="NEXA OS"
    >
      <Page size="A4" style={styles.page}>
        <Watermark />
        <PageNumber />

        <FrontHeader
          contractNumber={data.numeroContrato}
          customerName={data.nombreCliente}
          vehicleText={vehicleText}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Cliente</Text>
              <Text style={styles.summaryValue}>{clean(data.nombreCliente)}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vehículo</Text>
              <Text style={styles.summaryValue}>{vehicleText}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Periodo</Text>
              <Text style={styles.summaryValue}>
                {clean(data.fechaEntrega)} → {clean(data.fechaDevolucion)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del vehículo</Text>
          <View style={styles.sectionDivider} />

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
                label="Marca / Modelo"
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del alquiler</Text>
          <View style={styles.sectionDivider} />

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
              <Field label="Combustible salida" value={data.combustibleSalida} />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del cliente</Text>
          <View style={styles.sectionDivider} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Nombre" value={data.nombreCliente} />
            </View>
            <View style={styles.col}>
              <Field label="DNI / Pasaporte" value={data.dniPasaporte} />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del conductor / a</Text>
          <View style={styles.sectionDivider} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Nombre" value={data.nombreCliente} />
            </View>
            <View style={styles.col}>
              <Field label="Permiso de conducir" value={data.permisoConducir} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="País de expedición" value={data.paisExpedicion} />
            </View>
            <View style={styles.col}>
              <Field label="Fecha de caducidad" value={data.fechaCaducidad} />
            </View>
          </View>

          <Field label="Dirección" value={data.direccion} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Datos del segundo / a conductor / a si aplica
          </Text>
          <View style={styles.sectionDivider} />

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="Nombre" value={data.segundoNombre} />
            </View>
            <View style={styles.col}>
              <Field label="Permiso de conducir" value={data.segundoPermiso} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Field label="País expedición" value={data.segundoPais} />
            </View>
            <View style={styles.col}>
              <Field label="Fecha caducidad" value={data.segundoFechaCaducidad} />
            </View>
          </View>

          <Field label="Dirección" value={data.segundoDireccion} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del alquiler</Text>
          <View style={styles.sectionDivider} />

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

          <View style={styles.importantLineBox}>
            <Text style={styles.importantLine}>
              El arrendatario asume una franquicia máxima de 800€ en caso de daños.
            </Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.termsPage} wrap>
        <Watermark />
        <PageNumber />
        <TermsBlock />
      </Page>

      <Page size="A4" style={styles.finalPage}>
        <Watermark />
        <PageNumber />
        <FinalPageContent />
      </Page>
    </Document>
  );
}