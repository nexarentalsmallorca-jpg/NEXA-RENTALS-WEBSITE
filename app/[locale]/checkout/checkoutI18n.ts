export type CheckoutLocale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "it"
  | "pt"
  | "sv"
  | "da"
  | "no"
  | "nl"
  | "pl"
  | "cs"
  | "uk";

export const CHECKOUT_LANGUAGES: Array<{
  code: CheckoutLocale;
  label: string;
  short: string;
  flagSrc: string;
}> = [
  { code: "en", label: "English", short: "EN", flagSrc: "/images/en.png" },
  { code: "es", label: "Español", short: "ES", flagSrc: "/images/es.png" },
  { code: "de", label: "Deutsch", short: "DE", flagSrc: "/images/de.png" },
  { code: "fr", label: "Français", short: "FR", flagSrc: "/images/fr.png" },
  { code: "it", label: "Italiano", short: "IT", flagSrc: "/images/it.png" },
  { code: "nl", label: "Nederlands", short: "NL", flagSrc: "/images/NL.png" },
  { code: "pl", label: "Polski", short: "PL", flagSrc: "/images/PL.png" },
  { code: "sv", label: "Svenska", short: "SV", flagSrc: "/images/sv.png" },
  { code: "da", label: "Dansk", short: "DA", flagSrc: "/images/DA.png" },
  { code: "no", label: "Norsk", short: "NO", flagSrc: "/images/NO.png" },
  { code: "pt", label: "Português", short: "PT", flagSrc: "/images/pt.png" },
  { code: "cs", label: "Čeština", short: "CS", flagSrc: "/images/CS.png" },
  { code: "uk", label: "Українська", short: "UK", flagSrc: "/images/UK.png" },
];

const EN = {
  language: "Language",
  vehicles: "Vehicles",
  selectedVehicle: "Selected vehicle",
  scooter: "Scooter",
  scooters: "scooters",
  includes: "Includes",
  twoHelmets: "2 Helmets",
  topCase: "Top Case",
  phoneMount: "Phone Mount",
  lock: "Lock",
  insurance: "Insurance",
  pickup: "Pickup",
  return: "Return",
  plan: "Plan",
  pickupLocation: "Pickup location",
  rentalTotal: "Rental total",
  halfDay: "Half Day",
  fullDay: "Full Day",
  sameDay: "Same day",
  day: "day",
  days: "days",
  securityDeposit: "A refundable security deposit of €{amount} per scooter is handled at pickup by cash or card.",
  step2: "Step 2 of 3",
  yourDetails: "Your details",
  completeRemaining: "Complete the remaining required fields.",
  required: "Required",
  documentsReceived: "Documents received",
  drivingLicence: "Driving licence",
  passport: "passport",
  idCard: "ID card",
  complete: "Complete",
  primaryContact: "Primary booking contact",
  driver: "Driver",
  firstName: "First name *",
  surname: "Surname *",
  phone: "Phone / WhatsApp *",
  email: "Email *",
  homeAddress: "Home address *",
  addressPlaceholder: "Street, city, postcode, country",
  additionalDrivers: "Additional approved drivers",
  additionalDriversHelp: "Names were filled from the verified documents. Complete the remaining contact details for every driver.",
  approvedDriver: "Approved driver",
  useBookingContact: "Use booking contact",
  notes: "Notes",
  notesPlaceholder: "Pickup request, helmet size, etc.",
  licenceConfirmation: "I confirm that the driving licence belongs to the person making this booking.",
  acceptTerms: "I accept the rental terms.",
  emailOffers: "Send me offers by email.",
  preparingPayment: "Preparing payment...",
  payOnline: "Pay online · €{amount}",
  completeRequired: "Complete the required fields to continue.",
  step3: "Step 3 of 3",
  payment: "Payment",
  securePayment: "Secure payment.",
  back: "Back",
  edit: "Edit",
  preparingCheckout: "Preparing secure checkout...",
  secureVerification: "Secure document verification",
  scanDocuments: "Scan your documents",
  validateDrivers: "Validate every driver",
  scanHelp: "Scan the driving licence and ID or passport. Your name will be filled into checkout automatically.",
  multiScanHelp: "Every selected driver completes a separate secure scan. One failed driver will not stop the remaining drivers from continuing.",
  progress: "Progress",
  preparingScanner: "Preparing secure scanner...",
  preparingScanners: "Preparing secure scanner links...",
  keepOpen: "Please keep this page open.",
  approved: "Approved",
  rejected: "Rejected",
  waiting: "Waiting",
  driverApproved: "Driver approved",
  driverRejected: "Driver not approved",
  manualHelp: "Documents accepted. A manual confirmation may be completed before pickup.",
  approvedHelp: "Documents successfully scanned and validated.",
  rejectedHelp: "The submitted licence is not valid for the selected scooter.",
  scanning: "Scanning in progress",
  scannerExpired: "Scanner link expired",
  scanQr: "Scan this QR code",
  scanQrHelp: "Open the camera on the driver’s phone and scan this private QR code.",
  createQr: "Create new QR",
  continueDriverScan: "Continue Driver {driver} scan",
  validateDriver: "Validate Driver {driver}",
  completeDriverFirst: "Complete Driver {driver} first",
  createScanner: "Create new scanner",
  passengerOption: "Continue as a passenger on an approved scooter",
  approvedRequired: "At least one approved driver is required.",
  scanAgain: "Scan again",
  tryAgain: "Try preparing again",
  verificationComplete: "Verification complete",
  driversApproved: "{approved} of {requested} drivers approved",
  partialHelp: "The complete booking does not need to be cancelled. Continue with {approved} scooter(s), rescan a rejected driver, or cancel the booking.",
  continueWith: "Continue with {approved} scooter(s)",
  cancelBooking: "Cancel complete booking",
  allApproved: "All drivers approved",
  openingDetails: "Opening the checkout details...",
  cancelAndBack: "Cancel and go back",
  openScanner: "Open scanner",
  openScannerHelp: "Each driver uses their own QR or mobile validation button.",
  scanDocumentsStep: "Scan documents",
  scanDocumentsStepHelp: "Capture the driving licence and ID card or passport.",
  continueCheckout: "Continue checkout",
  continueCheckoutHelp: "Approved drivers are counted automatically before payment.",
} as const;

type BaseCheckoutCopy = {
  [K in keyof typeof EN]: string;
};

const COPY: Record<CheckoutLocale, BaseCheckoutCopy> = {
  en: EN,
  es: {
    language: "Idioma", vehicles: "Vehículos", selectedVehicle: "Vehículo seleccionado", scooter: "scooter", scooters: "scooters", includes: "Incluye", twoHelmets: "2 cascos", topCase: "Baúl", phoneMount: "Soporte para móvil", lock: "Candado", insurance: "Seguro", pickup: "Recogida", return: "Devolución", plan: "Plan", pickupLocation: "Lugar de recogida", rentalTotal: "Total del alquiler", halfDay: "Medio día", fullDay: "Día completo", sameDay: "Mismo día", day: "día", days: "días", securityDeposit: "Se gestiona un depósito de seguridad reembolsable de €{amount} por scooter al recogerlo, en efectivo o con tarjeta.", step2: "Paso 2 de 3", yourDetails: "Tus datos", completeRemaining: "Completa los campos obligatorios restantes.", required: "Obligatorio", documentsReceived: "Documentos recibidos", drivingLicence: "Permiso de conducir", passport: "pasaporte", idCard: "documento de identidad", complete: "Completado", primaryContact: "Contacto principal de la reserva", driver: "Conductor", firstName: "Nombre *", surname: "Apellidos *", phone: "Teléfono / WhatsApp *", email: "Correo electrónico *", homeAddress: "Domicilio *", addressPlaceholder: "Calle, ciudad, código postal, país", additionalDrivers: "Conductores aprobados adicionales", additionalDriversHelp: "Los nombres se han rellenado desde los documentos verificados. Completa los datos de contacto restantes de cada conductor.", approvedDriver: "Conductor aprobado", useBookingContact: "Usar contacto de la reserva", notes: "Notas", notesPlaceholder: "Solicitud de recogida, talla de casco, etc.", licenceConfirmation: "Confirmo que el permiso de conducir pertenece a la persona que realiza esta reserva.", acceptTerms: "Acepto las condiciones del alquiler.", emailOffers: "Enviarme ofertas por correo electrónico.", preparingPayment: "Preparando el pago...", payOnline: "Pagar online · €{amount}", completeRequired: "Completa los campos obligatorios para continuar.", step3: "Paso 3 de 3", payment: "Pago", securePayment: "Pago seguro.", back: "Atrás", edit: "Editar", preparingCheckout: "Preparando el pago seguro...", secureVerification: "Verificación segura de documentos", scanDocuments: "Escanea tus documentos", validateDrivers: "Verifica a todos los conductores", scanHelp: "Escanea el permiso de conducir y el documento de identidad o pasaporte. Tu nombre se rellenará automáticamente.", multiScanHelp: "Cada conductor seleccionado realiza una verificación segura independiente. Si uno falla, los demás pueden continuar.", progress: "Progreso", preparingScanner: "Preparando el escáner seguro...", preparingScanners: "Preparando los enlaces seguros...", keepOpen: "Mantén esta página abierta.", approved: "Aprobado", rejected: "Rechazado", waiting: "En espera", driverApproved: "Conductor aprobado", driverRejected: "Conductor no aprobado", manualHelp: "Documentos aceptados. Puede realizarse una confirmación manual antes de la recogida.", approvedHelp: "Documentos escaneados y verificados correctamente.", rejectedHelp: "El permiso presentado no es válido para el scooter seleccionado.", scanning: "Escaneo en curso", scannerExpired: "Enlace caducado", scanQr: "Escanea este código QR", scanQrHelp: "Abre la cámara del teléfono del conductor y escanea este código QR privado.", createQr: "Crear nuevo QR", continueDriverScan: "Continuar escaneo del conductor {driver}", validateDriver: "Verificar conductor {driver}", completeDriverFirst: "Completa primero el conductor {driver}", createScanner: "Crear nuevo escáner", passengerOption: "Continuar como pasajero en un scooter aprobado", approvedRequired: "Se necesita al menos un conductor aprobado.", scanAgain: "Escanear de nuevo", tryAgain: "Preparar de nuevo", verificationComplete: "Verificación completada", driversApproved: "{approved} de {requested} conductores aprobados", partialHelp: "No es necesario cancelar toda la reserva. Continúa con {approved} scooter(s), vuelve a escanear a un conductor rechazado o cancela la reserva.", continueWith: "Continuar con {approved} scooter(s)", cancelBooking: "Cancelar toda la reserva", allApproved: "Todos los conductores aprobados", openingDetails: "Abriendo los datos de la reserva...", cancelAndBack: "Cancelar y volver", openScanner: "Abrir escáner", openScannerHelp: "Cada conductor usa su propio QR o botón de verificación móvil.", scanDocumentsStep: "Escanear documentos", scanDocumentsStepHelp: "Captura el permiso de conducir y el documento de identidad o pasaporte.", continueCheckout: "Continuar reserva", continueCheckoutHelp: "Los conductores aprobados se cuentan automáticamente antes del pago."
  },
  de: {
    language: "Sprache", vehicles: "Fahrzeuge", selectedVehicle: "Ausgewähltes Fahrzeug", scooter: "Roller", scooters: "Roller", includes: "Inklusive", twoHelmets: "2 Helme", topCase: "Topcase", phoneMount: "Handyhalterung", lock: "Schloss", insurance: "Versicherung", pickup: "Abholung", return: "Rückgabe", plan: "Tarif", pickupLocation: "Abholort", rentalTotal: "Mietpreis gesamt", halfDay: "Halber Tag", fullDay: "Ganzer Tag", sameDay: "Gleicher Tag", day: "Tag", days: "Tage", securityDeposit: "Bei der Abholung wird eine rückzahlbare Kaution von €{amount} pro Roller in bar oder per Karte hinterlegt.", step2: "Schritt 2 von 3", yourDetails: "Deine Angaben", completeRemaining: "Fülle die restlichen Pflichtfelder aus.", required: "Pflichtfeld", documentsReceived: "Dokumente erhalten", drivingLicence: "Führerschein", passport: "Reisepass", idCard: "Personalausweis", complete: "Abgeschlossen", primaryContact: "Hauptkontakt der Buchung", driver: "Fahrer", firstName: "Vorname *", surname: "Nachname *", phone: "Telefon / WhatsApp *", email: "E-Mail *", homeAddress: "Wohnadresse *", addressPlaceholder: "Straße, Stadt, Postleitzahl, Land", additionalDrivers: "Weitere zugelassene Fahrer", additionalDriversHelp: "Die Namen wurden aus den geprüften Dokumenten übernommen. Vervollständige die Kontaktdaten jedes Fahrers.", approvedDriver: "Zugelassener Fahrer", useBookingContact: "Buchungskontakt verwenden", notes: "Hinweise", notesPlaceholder: "Abholwunsch, Helmgröße usw.", licenceConfirmation: "Ich bestätige, dass der Führerschein der buchenden Person gehört.", acceptTerms: "Ich akzeptiere die Mietbedingungen.", emailOffers: "Angebote per E-Mail senden.", preparingPayment: "Zahlung wird vorbereitet...", payOnline: "Online bezahlen · €{amount}", completeRequired: "Fülle alle Pflichtfelder aus, um fortzufahren.", step3: "Schritt 3 von 3", payment: "Zahlung", securePayment: "Sichere Zahlung.", back: "Zurück", edit: "Bearbeiten", preparingCheckout: "Sichere Zahlung wird vorbereitet...", secureVerification: "Sichere Dokumentenprüfung", scanDocuments: "Dokumente scannen", validateDrivers: "Alle Fahrer prüfen", scanHelp: "Scanne Führerschein und Personalausweis oder Reisepass. Dein Name wird automatisch eingetragen.", multiScanHelp: "Jeder ausgewählte Fahrer führt eine eigene sichere Prüfung durch. Ein abgelehnter Fahrer stoppt die übrigen nicht.", progress: "Fortschritt", preparingScanner: "Sicherer Scanner wird vorbereitet...", preparingScanners: "Sichere Scanner-Links werden vorbereitet...", keepOpen: "Bitte diese Seite geöffnet lassen.", approved: "Zugelassen", rejected: "Abgelehnt", waiting: "Wartet", driverApproved: "Fahrer zugelassen", driverRejected: "Fahrer nicht zugelassen", manualHelp: "Dokumente akzeptiert. Vor der Abholung kann eine manuelle Bestätigung erfolgen.", approvedHelp: "Dokumente erfolgreich gescannt und geprüft.", rejectedHelp: "Der vorgelegte Führerschein ist für den gewählten Roller nicht gültig.", scanning: "Scan läuft", scannerExpired: "Scanner-Link abgelaufen", scanQr: "Diesen QR-Code scannen", scanQrHelp: "Öffne die Kamera auf dem Telefon des Fahrers und scanne diesen privaten QR-Code.", createQr: "Neuen QR erstellen", continueDriverScan: "Scan von Fahrer {driver} fortsetzen", validateDriver: "Fahrer {driver} prüfen", completeDriverFirst: "Zuerst Fahrer {driver} abschließen", createScanner: "Neuen Scanner erstellen", passengerOption: "Als Beifahrer auf einem zugelassenen Roller fortfahren", approvedRequired: "Mindestens ein zugelassener Fahrer ist erforderlich.", scanAgain: "Erneut scannen", tryAgain: "Erneut vorbereiten", verificationComplete: "Prüfung abgeschlossen", driversApproved: "{approved} von {requested} Fahrern zugelassen", partialHelp: "Die gesamte Buchung muss nicht storniert werden. Fahre mit {approved} Roller(n) fort, scanne einen abgelehnten Fahrer erneut oder storniere die Buchung.", continueWith: "Mit {approved} Roller(n) fortfahren", cancelBooking: "Gesamte Buchung stornieren", allApproved: "Alle Fahrer zugelassen", openingDetails: "Buchungsdetails werden geöffnet...", cancelAndBack: "Abbrechen und zurück", openScanner: "Scanner öffnen", openScannerHelp: "Jeder Fahrer verwendet seinen eigenen QR-Code oder die mobile Prüftaste.", scanDocumentsStep: "Dokumente scannen", scanDocumentsStepHelp: "Führerschein und Personalausweis oder Reisepass erfassen.", continueCheckout: "Buchung fortsetzen", continueCheckoutHelp: "Zugelassene Fahrer werden vor der Zahlung automatisch gezählt."
  },
  fr: {
    language: "Langue", vehicles: "Véhicules", selectedVehicle: "Véhicule sélectionné", scooter: "scooter", scooters: "scooters", includes: "Inclus", twoHelmets: "2 casques", topCase: "Top case", phoneMount: "Support téléphone", lock: "Antivol", insurance: "Assurance", pickup: "Retrait", return: "Retour", plan: "Formule", pickupLocation: "Lieu de retrait", rentalTotal: "Total de la location", halfDay: "Demi-journée", fullDay: "Journée complète", sameDay: "Même jour", day: "jour", days: "jours", securityDeposit: "Une caution remboursable de €{amount} par scooter est versée au retrait, en espèces ou par carte.", step2: "Étape 2 sur 3", yourDetails: "Vos coordonnées", completeRemaining: "Complétez les champs obligatoires restants.", required: "Obligatoire", documentsReceived: "Documents reçus", drivingLicence: "Permis de conduire", passport: "passeport", idCard: "carte d’identité", complete: "Terminé", primaryContact: "Contact principal de la réservation", driver: "Conducteur", firstName: "Prénom *", surname: "Nom *", phone: "Téléphone / WhatsApp *", email: "E-mail *", homeAddress: "Adresse du domicile *", addressPlaceholder: "Rue, ville, code postal, pays", additionalDrivers: "Conducteurs approuvés supplémentaires", additionalDriversHelp: "Les noms proviennent des documents vérifiés. Complétez les coordonnées restantes de chaque conducteur.", approvedDriver: "Conducteur approuvé", useBookingContact: "Utiliser le contact de réservation", notes: "Notes", notesPlaceholder: "Demande de retrait, taille du casque, etc.", licenceConfirmation: "Je confirme que le permis appartient à la personne qui effectue cette réservation.", acceptTerms: "J’accepte les conditions de location.", emailOffers: "M’envoyer des offres par e-mail.", preparingPayment: "Préparation du paiement...", payOnline: "Payer en ligne · €{amount}", completeRequired: "Complétez les champs obligatoires pour continuer.", step3: "Étape 3 sur 3", payment: "Paiement", securePayment: "Paiement sécurisé.", back: "Retour", edit: "Modifier", preparingCheckout: "Préparation du paiement sécurisé...", secureVerification: "Vérification sécurisée des documents", scanDocuments: "Scannez vos documents", validateDrivers: "Vérifiez tous les conducteurs", scanHelp: "Scannez le permis et la carte d’identité ou le passeport. Votre nom sera rempli automatiquement.", multiScanHelp: "Chaque conducteur effectue une vérification sécurisée distincte. Un échec n’empêche pas les autres de continuer.", progress: "Progression", preparingScanner: "Préparation du scanner sécurisé...", preparingScanners: "Préparation des liens sécurisés...", keepOpen: "Gardez cette page ouverte.", approved: "Approuvé", rejected: "Refusé", waiting: "En attente", driverApproved: "Conducteur approuvé", driverRejected: "Conducteur non approuvé", manualHelp: "Documents acceptés. Une confirmation manuelle peut être effectuée avant le retrait.", approvedHelp: "Documents scannés et validés avec succès.", rejectedHelp: "Le permis présenté n’est pas valable pour le scooter sélectionné.", scanning: "Scan en cours", scannerExpired: "Lien expiré", scanQr: "Scannez ce code QR", scanQrHelp: "Ouvrez l’appareil photo du téléphone du conducteur et scannez ce QR privé.", createQr: "Créer un nouveau QR", continueDriverScan: "Continuer le scan du conducteur {driver}", validateDriver: "Vérifier le conducteur {driver}", completeDriverFirst: "Terminez d’abord le conducteur {driver}", createScanner: "Créer un nouveau scanner", passengerOption: "Continuer comme passager sur un scooter approuvé", approvedRequired: "Au moins un conducteur approuvé est requis.", scanAgain: "Scanner à nouveau", tryAgain: "Préparer à nouveau", verificationComplete: "Vérification terminée", driversApproved: "{approved} conducteur(s) approuvé(s) sur {requested}", partialHelp: "Il n’est pas nécessaire d’annuler toute la réservation. Continuez avec {approved} scooter(s), rescanner un conducteur refusé ou annulez.", continueWith: "Continuer avec {approved} scooter(s)", cancelBooking: "Annuler toute la réservation", allApproved: "Tous les conducteurs sont approuvés", openingDetails: "Ouverture des détails de réservation...", cancelAndBack: "Annuler et revenir", openScanner: "Ouvrir le scanner", openScannerHelp: "Chaque conducteur utilise son QR ou son bouton de vérification mobile.", scanDocumentsStep: "Scanner les documents", scanDocumentsStepHelp: "Capturez le permis et la carte d’identité ou le passeport.", continueCheckout: "Continuer la réservation", continueCheckoutHelp: "Les conducteurs approuvés sont comptés automatiquement avant le paiement."
  },
  it: {
    language: "Lingua", vehicles: "Veicoli", selectedVehicle: "Veicolo selezionato", scooter: "scooter", scooters: "scooter", includes: "Include", twoHelmets: "2 caschi", topCase: "Bauletto", phoneMount: "Supporto telefono", lock: "Lucchetto", insurance: "Assicurazione", pickup: "Ritiro", return: "Riconsegna", plan: "Piano", pickupLocation: "Luogo di ritiro", rentalTotal: "Totale noleggio", halfDay: "Mezza giornata", fullDay: "Giornata intera", sameDay: "Stesso giorno", day: "giorno", days: "giorni", securityDeposit: "Al ritiro è richiesto un deposito cauzionale rimborsabile di €{amount} per scooter, in contanti o con carta.", step2: "Passaggio 2 di 3", yourDetails: "I tuoi dati", completeRemaining: "Completa i campi obbligatori rimanenti.", required: "Obbligatorio", documentsReceived: "Documenti ricevuti", drivingLicence: "Patente di guida", passport: "passaporto", idCard: "carta d’identità", complete: "Completato", primaryContact: "Contatto principale della prenotazione", driver: "Conducente", firstName: "Nome *", surname: "Cognome *", phone: "Telefono / WhatsApp *", email: "E-mail *", homeAddress: "Indirizzo di casa *", addressPlaceholder: "Via, città, CAP, paese", additionalDrivers: "Altri conducenti approvati", additionalDriversHelp: "I nomi sono stati compilati dai documenti verificati. Completa i contatti rimanenti per ogni conducente.", approvedDriver: "Conducente approvato", useBookingContact: "Usa contatto prenotazione", notes: "Note", notesPlaceholder: "Richiesta di ritiro, misura casco, ecc.", licenceConfirmation: "Confermo che la patente appartiene alla persona che effettua la prenotazione.", acceptTerms: "Accetto le condizioni di noleggio.", emailOffers: "Inviami offerte via e-mail.", preparingPayment: "Preparazione del pagamento...", payOnline: "Paga online · €{amount}", completeRequired: "Completa i campi obbligatori per continuare.", step3: "Passaggio 3 di 3", payment: "Pagamento", securePayment: "Pagamento sicuro.", back: "Indietro", edit: "Modifica", preparingCheckout: "Preparazione del pagamento sicuro...", secureVerification: "Verifica sicura dei documenti", scanDocuments: "Scansiona i documenti", validateDrivers: "Verifica tutti i conducenti", scanHelp: "Scansiona patente e carta d’identità o passaporto. Il nome verrà compilato automaticamente.", multiScanHelp: "Ogni conducente esegue una verifica sicura separata. Un rifiuto non impedisce agli altri di continuare.", progress: "Avanzamento", preparingScanner: "Preparazione scanner sicuro...", preparingScanners: "Preparazione link sicuri...", keepOpen: "Mantieni aperta questa pagina.", approved: "Approvato", rejected: "Rifiutato", waiting: "In attesa", driverApproved: "Conducente approvato", driverRejected: "Conducente non approvato", manualHelp: "Documenti accettati. Potrebbe essere effettuata una conferma manuale prima del ritiro.", approvedHelp: "Documenti scansionati e verificati con successo.", rejectedHelp: "La patente presentata non è valida per lo scooter selezionato.", scanning: "Scansione in corso", scannerExpired: "Link scaduto", scanQr: "Scansiona questo codice QR", scanQrHelp: "Apri la fotocamera del telefono del conducente e scansiona questo QR privato.", createQr: "Crea nuovo QR", continueDriverScan: "Continua scansione conducente {driver}", validateDriver: "Verifica conducente {driver}", completeDriverFirst: "Completa prima il conducente {driver}", createScanner: "Crea nuovo scanner", passengerOption: "Continua come passeggero su uno scooter approvato", approvedRequired: "È richiesto almeno un conducente approvato.", scanAgain: "Scansiona di nuovo", tryAgain: "Prepara di nuovo", verificationComplete: "Verifica completata", driversApproved: "{approved} conducenti approvati su {requested}", partialHelp: "Non è necessario annullare tutta la prenotazione. Continua con {approved} scooter, ripeti un conducente rifiutato o annulla.", continueWith: "Continua con {approved} scooter", cancelBooking: "Annulla tutta la prenotazione", allApproved: "Tutti i conducenti approvati", openingDetails: "Apertura dei dettagli della prenotazione...", cancelAndBack: "Annulla e torna indietro", openScanner: "Apri scanner", openScannerHelp: "Ogni conducente usa il proprio QR o pulsante di verifica mobile.", scanDocumentsStep: "Scansiona documenti", scanDocumentsStepHelp: "Acquisisci patente e carta d’identità o passaporto.", continueCheckout: "Continua prenotazione", continueCheckoutHelp: "I conducenti approvati vengono conteggiati automaticamente prima del pagamento."
  },
  pt: {
    language: "Idioma", vehicles: "Veículos", selectedVehicle: "Veículo selecionado", scooter: "scooter", scooters: "scooters", includes: "Inclui", twoHelmets: "2 capacetes", topCase: "Top case", phoneMount: "Suporte de telemóvel", lock: "Cadeado", insurance: "Seguro", pickup: "Levantamento", return: "Devolução", plan: "Plano", pickupLocation: "Local de levantamento", rentalTotal: "Total do aluguer", halfDay: "Meio dia", fullDay: "Dia completo", sameDay: "Mesmo dia", day: "dia", days: "dias", securityDeposit: "É exigida uma caução reembolsável de €{amount} por scooter no levantamento, em dinheiro ou cartão.", step2: "Passo 2 de 3", yourDetails: "Os seus dados", completeRemaining: "Preencha os campos obrigatórios restantes.", required: "Obrigatório", documentsReceived: "Documentos recebidos", drivingLicence: "Carta de condução", passport: "passaporte", idCard: "cartão de identidade", complete: "Concluído", primaryContact: "Contacto principal da reserva", driver: "Condutor", firstName: "Nome *", surname: "Apelido *", phone: "Telefone / WhatsApp *", email: "E-mail *", homeAddress: "Morada *", addressPlaceholder: "Rua, cidade, código postal, país", additionalDrivers: "Condutores aprovados adicionais", additionalDriversHelp: "Os nomes foram preenchidos a partir dos documentos verificados. Complete os contactos de cada condutor.", approvedDriver: "Condutor aprovado", useBookingContact: "Usar contacto da reserva", notes: "Notas", notesPlaceholder: "Pedido de levantamento, tamanho do capacete, etc.", licenceConfirmation: "Confirmo que a carta pertence à pessoa que efetua esta reserva.", acceptTerms: "Aceito os termos do aluguer.", emailOffers: "Enviar-me ofertas por e-mail.", preparingPayment: "A preparar pagamento...", payOnline: "Pagar online · €{amount}", completeRequired: "Preencha os campos obrigatórios para continuar.", step3: "Passo 3 de 3", payment: "Pagamento", securePayment: "Pagamento seguro.", back: "Voltar", edit: "Editar", preparingCheckout: "A preparar pagamento seguro...", secureVerification: "Verificação segura de documentos", scanDocuments: "Digitalize os documentos", validateDrivers: "Verifique todos os condutores", scanHelp: "Digitalize a carta e o cartão de identidade ou passaporte. O nome será preenchido automaticamente.", multiScanHelp: "Cada condutor realiza uma verificação segura separada. Uma reprovação não impede os restantes.", progress: "Progresso", preparingScanner: "A preparar scanner seguro...", preparingScanners: "A preparar ligações seguras...", keepOpen: "Mantenha esta página aberta.", approved: "Aprovado", rejected: "Rejeitado", waiting: "Em espera", driverApproved: "Condutor aprovado", driverRejected: "Condutor não aprovado", manualHelp: "Documentos aceites. Poderá existir confirmação manual antes do levantamento.", approvedHelp: "Documentos digitalizados e validados com sucesso.", rejectedHelp: "A carta apresentada não é válida para o scooter selecionado.", scanning: "Digitalização em curso", scannerExpired: "Ligação expirada", scanQr: "Digitalize este código QR", scanQrHelp: "Abra a câmara do telefone do condutor e digitalize este QR privado.", createQr: "Criar novo QR", continueDriverScan: "Continuar condutor {driver}", validateDriver: "Verificar condutor {driver}", completeDriverFirst: "Conclua primeiro o condutor {driver}", createScanner: "Criar novo scanner", passengerOption: "Continuar como passageiro num scooter aprovado", approvedRequired: "É necessário pelo menos um condutor aprovado.", scanAgain: "Digitalizar novamente", tryAgain: "Preparar novamente", verificationComplete: "Verificação concluída", driversApproved: "{approved} de {requested} condutores aprovados", partialHelp: "Não é necessário cancelar toda a reserva. Continue com {approved} scooter(s), repita um condutor rejeitado ou cancele.", continueWith: "Continuar com {approved} scooter(s)", cancelBooking: "Cancelar toda a reserva", allApproved: "Todos os condutores aprovados", openingDetails: "A abrir detalhes da reserva...", cancelAndBack: "Cancelar e voltar", openScanner: "Abrir scanner", openScannerHelp: "Cada condutor usa o seu QR ou botão de verificação móvel.", scanDocumentsStep: "Digitalizar documentos", scanDocumentsStepHelp: "Capture a carta e o cartão de identidade ou passaporte.", continueCheckout: "Continuar reserva", continueCheckoutHelp: "Os condutores aprovados são contados automaticamente antes do pagamento."
  },
  sv: {
    language: "Språk", vehicles: "Fordon", selectedVehicle: "Valt fordon", scooter: "skoter", scooters: "skotrar", includes: "Ingår", twoHelmets: "2 hjälmar", topCase: "Toppbox", phoneMount: "Mobilhållare", lock: "Lås", insurance: "Försäkring", pickup: "Hämtning", return: "Återlämning", plan: "Plan", pickupLocation: "Hämtningsplats", rentalTotal: "Hyra totalt", halfDay: "Halvdag", fullDay: "Heldag", sameDay: "Samma dag", day: "dag", days: "dagar", securityDeposit: "En återbetalningsbar deposition på €{amount} per skoter betalas vid hämtning med kontanter eller kort.", step2: "Steg 2 av 3", yourDetails: "Dina uppgifter", completeRemaining: "Fyll i återstående obligatoriska fält.", required: "Obligatoriskt", documentsReceived: "Dokument mottagna", drivingLicence: "Körkort", passport: "pass", idCard: "ID-kort", complete: "Klart", primaryContact: "Huvudkontakt för bokningen", driver: "Förare", firstName: "Förnamn *", surname: "Efternamn *", phone: "Telefon / WhatsApp *", email: "E-post *", homeAddress: "Hemadress *", addressPlaceholder: "Gata, ort, postnummer, land", additionalDrivers: "Ytterligare godkända förare", additionalDriversHelp: "Namnen fylldes i från verifierade dokument. Fyll i återstående kontaktuppgifter för varje förare.", approvedDriver: "Godkänd förare", useBookingContact: "Använd bokningskontakt", notes: "Anteckningar", notesPlaceholder: "Hämtningsönskemål, hjälmstorlek osv.", licenceConfirmation: "Jag bekräftar att körkortet tillhör personen som gör bokningen.", acceptTerms: "Jag accepterar hyresvillkoren.", emailOffers: "Skicka erbjudanden via e-post.", preparingPayment: "Förbereder betalning...", payOnline: "Betala online · €{amount}", completeRequired: "Fyll i obligatoriska fält för att fortsätta.", step3: "Steg 3 av 3", payment: "Betalning", securePayment: "Säker betalning.", back: "Tillbaka", edit: "Redigera", preparingCheckout: "Förbereder säker betalning...", secureVerification: "Säker dokumentverifiering", scanDocuments: "Skanna dina dokument", validateDrivers: "Verifiera alla förare", scanHelp: "Skanna körkort och ID-kort eller pass. Namnet fylls i automatiskt.", multiScanHelp: "Varje förare gör en separat säker kontroll. En underkänd förare hindrar inte de andra.", progress: "Förlopp", preparingScanner: "Förbereder säker skanner...", preparingScanners: "Förbereder säkra länkar...", keepOpen: "Håll sidan öppen.", approved: "Godkänd", rejected: "Underkänd", waiting: "Väntar", driverApproved: "Förare godkänd", driverRejected: "Förare ej godkänd", manualHelp: "Dokument accepterade. Manuell bekräftelse kan göras före hämtning.", approvedHelp: "Dokument skannade och verifierade.", rejectedHelp: "Körkortet gäller inte för vald skoter.", scanning: "Skanning pågår", scannerExpired: "Länken har gått ut", scanQr: "Skanna denna QR-kod", scanQrHelp: "Öppna kameran på förarens telefon och skanna den privata QR-koden.", createQr: "Skapa ny QR", continueDriverScan: "Fortsätt förare {driver}", validateDriver: "Verifiera förare {driver}", completeDriverFirst: "Slutför förare {driver} först", createScanner: "Skapa ny skanner", passengerOption: "Fortsätt som passagerare på en godkänd skoter", approvedRequired: "Minst en godkänd förare krävs.", scanAgain: "Skanna igen", tryAgain: "Förbered igen", verificationComplete: "Verifiering klar", driversApproved: "{approved} av {requested} förare godkända", partialHelp: "Hela bokningen behöver inte avbokas. Fortsätt med {approved} skoter/skotrar, skanna om eller avboka.", continueWith: "Fortsätt med {approved} skoter/skotrar", cancelBooking: "Avboka hela bokningen", allApproved: "Alla förare godkända", openingDetails: "Öppnar bokningsuppgifter...", cancelAndBack: "Avbryt och gå tillbaka", openScanner: "Öppna skanner", openScannerHelp: "Varje förare använder sin QR-kod eller mobilknapp.", scanDocumentsStep: "Skanna dokument", scanDocumentsStepHelp: "Fånga körkort och ID-kort eller pass.", continueCheckout: "Fortsätt bokningen", continueCheckoutHelp: "Godkända förare räknas automatiskt före betalning."
  },
  da: {
    language: "Sprog", vehicles: "Køretøjer", selectedVehicle: "Valgt køretøj", scooter: "scooter", scooters: "scootere", includes: "Inkluderer", twoHelmets: "2 hjelme", topCase: "Topboks", phoneMount: "Telefonholder", lock: "Lås", insurance: "Forsikring", pickup: "Afhentning", return: "Aflevering", plan: "Plan", pickupLocation: "Afhentningssted", rentalTotal: "Leje i alt", halfDay: "Halv dag", fullDay: "Hel dag", sameDay: "Samme dag", day: "dag", days: "dage", securityDeposit: "Et refunderbart depositum på €{amount} pr. scooter betales ved afhentning kontant eller med kort.", step2: "Trin 2 af 3", yourDetails: "Dine oplysninger", completeRemaining: "Udfyld de resterende obligatoriske felter.", required: "Påkrævet", documentsReceived: "Dokumenter modtaget", drivingLicence: "Kørekort", passport: "pas", idCard: "ID-kort", complete: "Færdig", primaryContact: "Primær kontakt for bookingen", driver: "Fører", firstName: "Fornavn *", surname: "Efternavn *", phone: "Telefon / WhatsApp *", email: "E-mail *", homeAddress: "Hjemmeadresse *", addressPlaceholder: "Gade, by, postnummer, land", additionalDrivers: "Yderligere godkendte førere", additionalDriversHelp: "Navnene er udfyldt fra de verificerede dokumenter. Udfyld resten af kontaktoplysningerne.", approvedDriver: "Godkendt fører", useBookingContact: "Brug bookingkontakt", notes: "Bemærkninger", notesPlaceholder: "Afhentningsønske, hjelmstørrelse osv.", licenceConfirmation: "Jeg bekræfter, at kørekortet tilhører personen, der foretager bookingen.", acceptTerms: "Jeg accepterer lejevilkårene.", emailOffers: "Send mig tilbud via e-mail.", preparingPayment: "Forbereder betaling...", payOnline: "Betal online · €{amount}", completeRequired: "Udfyld de obligatoriske felter for at fortsætte.", step3: "Trin 3 af 3", payment: "Betaling", securePayment: "Sikker betaling.", back: "Tilbage", edit: "Rediger", preparingCheckout: "Forbereder sikker betaling...", secureVerification: "Sikker dokumentverifikation", scanDocuments: "Scan dine dokumenter", validateDrivers: "Kontrollér alle førere", scanHelp: "Scan kørekort og ID-kort eller pas. Navnet udfyldes automatisk.", multiScanHelp: "Hver fører gennemfører en separat sikker kontrol. Én afvisning stopper ikke de øvrige.", progress: "Fremskridt", preparingScanner: "Forbereder sikker scanner...", preparingScanners: "Forbereder sikre links...", keepOpen: "Hold siden åben.", approved: "Godkendt", rejected: "Afvist", waiting: "Venter", driverApproved: "Fører godkendt", driverRejected: "Fører ikke godkendt", manualHelp: "Dokumenter accepteret. Manuel bekræftelse kan ske før afhentning.", approvedHelp: "Dokumenter scannet og valideret.", rejectedHelp: "Kørekortet er ikke gyldigt til den valgte scooter.", scanning: "Scanning i gang", scannerExpired: "Link udløbet", scanQr: "Scan denne QR-kode", scanQrHelp: "Åbn kameraet på førerens telefon og scan den private QR-kode.", createQr: "Opret ny QR", continueDriverScan: "Fortsæt fører {driver}", validateDriver: "Kontrollér fører {driver}", completeDriverFirst: "Færdiggør fører {driver} først", createScanner: "Opret ny scanner", passengerOption: "Fortsæt som passager på en godkendt scooter", approvedRequired: "Mindst én godkendt fører er nødvendig.", scanAgain: "Scan igen", tryAgain: "Forbered igen", verificationComplete: "Verifikation færdig", driversApproved: "{approved} af {requested} førere godkendt", partialHelp: "Hele bookingen behøver ikke annulleres. Fortsæt med {approved} scooter(e), scan igen eller annuller.", continueWith: "Fortsæt med {approved} scooter(e)", cancelBooking: "Annuller hele bookingen", allApproved: "Alle førere godkendt", openingDetails: "Åbner bookingoplysninger...", cancelAndBack: "Annuller og gå tilbage", openScanner: "Åbn scanner", openScannerHelp: "Hver fører bruger sin egen QR eller mobilknap.", scanDocumentsStep: "Scan dokumenter", scanDocumentsStepHelp: "Optag kørekort og ID-kort eller pas.", continueCheckout: "Fortsæt booking", continueCheckoutHelp: "Godkendte førere tælles automatisk før betaling."
  },
  no: {
    language: "Språk", vehicles: "Kjøretøy", selectedVehicle: "Valgt kjøretøy", scooter: "scooter", scooters: "scootere", includes: "Inkluderer", twoHelmets: "2 hjelmer", topCase: "Toppboks", phoneMount: "Mobilholder", lock: "Lås", insurance: "Forsikring", pickup: "Henting", return: "Levering", plan: "Plan", pickupLocation: "Hentested", rentalTotal: "Leie totalt", halfDay: "Halv dag", fullDay: "Hel dag", sameDay: "Samme dag", day: "dag", days: "dager", securityDeposit: "Et refunderbart depositum på €{amount} per scooter betales ved henting med kontanter eller kort.", step2: "Trinn 2 av 3", yourDetails: "Dine opplysninger", completeRemaining: "Fyll ut de resterende obligatoriske feltene.", required: "Obligatorisk", documentsReceived: "Dokumenter mottatt", drivingLicence: "Førerkort", passport: "pass", idCard: "ID-kort", complete: "Fullført", primaryContact: "Hovedkontakt for bestillingen", driver: "Fører", firstName: "Fornavn *", surname: "Etternavn *", phone: "Telefon / WhatsApp *", email: "E-post *", homeAddress: "Hjemmeadresse *", addressPlaceholder: "Gate, by, postnummer, land", additionalDrivers: "Flere godkjente førere", additionalDriversHelp: "Navnene er fylt inn fra verifiserte dokumenter. Fyll ut resten av kontaktopplysningene.", approvedDriver: "Godkjent fører", useBookingContact: "Bruk bestillingskontakt", notes: "Merknader", notesPlaceholder: "Henteønske, hjelmstørrelse osv.", licenceConfirmation: "Jeg bekrefter at førerkortet tilhører personen som foretar bestillingen.", acceptTerms: "Jeg godtar leievilkårene.", emailOffers: "Send meg tilbud på e-post.", preparingPayment: "Forbereder betaling...", payOnline: "Betal på nett · €{amount}", completeRequired: "Fyll ut obligatoriske felt for å fortsette.", step3: "Trinn 3 av 3", payment: "Betaling", securePayment: "Sikker betaling.", back: "Tilbake", edit: "Rediger", preparingCheckout: "Forbereder sikker betaling...", secureVerification: "Sikker dokumentverifisering", scanDocuments: "Skann dokumentene", validateDrivers: "Kontroller alle førere", scanHelp: "Skann førerkort og ID-kort eller pass. Navnet fylles inn automatisk.", multiScanHelp: "Hver fører gjennomfører en egen sikker kontroll. Én avvisning stopper ikke de andre.", progress: "Fremdrift", preparingScanner: "Forbereder sikker skanner...", preparingScanners: "Forbereder sikre lenker...", keepOpen: "Hold siden åpen.", approved: "Godkjent", rejected: "Avvist", waiting: "Venter", driverApproved: "Fører godkjent", driverRejected: "Fører ikke godkjent", manualHelp: "Dokumenter godkjent. Manuell bekreftelse kan utføres før henting.", approvedHelp: "Dokumenter skannet og validert.", rejectedHelp: "Førerkortet er ikke gyldig for valgt scooter.", scanning: "Skanning pågår", scannerExpired: "Lenken er utløpt", scanQr: "Skann denne QR-koden", scanQrHelp: "Åpne kameraet på førerens telefon og skann den private QR-koden.", createQr: "Lag ny QR", continueDriverScan: "Fortsett fører {driver}", validateDriver: "Kontroller fører {driver}", completeDriverFirst: "Fullfør fører {driver} først", createScanner: "Lag ny skanner", passengerOption: "Fortsett som passasjer på en godkjent scooter", approvedRequired: "Minst én godkjent fører kreves.", scanAgain: "Skann igjen", tryAgain: "Forbered igjen", verificationComplete: "Verifisering fullført", driversApproved: "{approved} av {requested} førere godkjent", partialHelp: "Hele bestillingen trenger ikke kanselleres. Fortsett med {approved} scooter(e), skann igjen eller avbryt.", continueWith: "Fortsett med {approved} scooter(e)", cancelBooking: "Avbryt hele bestillingen", allApproved: "Alle førere godkjent", openingDetails: "Åpner bestillingsopplysninger...", cancelAndBack: "Avbryt og gå tilbake", openScanner: "Åpne skanner", openScannerHelp: "Hver fører bruker sin egen QR eller mobilknapp.", scanDocumentsStep: "Skann dokumenter", scanDocumentsStepHelp: "Ta bilde av førerkort og ID-kort eller pass.", continueCheckout: "Fortsett bestillingen", continueCheckoutHelp: "Godkjente førere telles automatisk før betaling."
  },
  nl: {
    language: "Taal", vehicles: "Voertuigen", selectedVehicle: "Geselecteerd voertuig", scooter: "scooter", scooters: "scooters", includes: "Inbegrepen", twoHelmets: "2 helmen", topCase: "Topkoffer", phoneMount: "Telefoonhouder", lock: "Slot", insurance: "Verzekering", pickup: "Ophalen", return: "Inleveren", plan: "Plan", pickupLocation: "Ophaallocatie", rentalTotal: "Huurtotaal", halfDay: "Halve dag", fullDay: "Hele dag", sameDay: "Dezelfde dag", day: "dag", days: "dagen", securityDeposit: "Bij het ophalen wordt een terugbetaalbare borg van €{amount} per scooter contant of per kaart betaald.", step2: "Stap 2 van 3", yourDetails: "Uw gegevens", completeRemaining: "Vul de resterende verplichte velden in.", required: "Verplicht", documentsReceived: "Documenten ontvangen", drivingLicence: "Rijbewijs", passport: "paspoort", idCard: "identiteitskaart", complete: "Voltooid", primaryContact: "Hoofdcontact van de boeking", driver: "Bestuurder", firstName: "Voornaam *", surname: "Achternaam *", phone: "Telefoon / WhatsApp *", email: "E-mail *", homeAddress: "Woonadres *", addressPlaceholder: "Straat, plaats, postcode, land", additionalDrivers: "Extra goedgekeurde bestuurders", additionalDriversHelp: "Namen zijn ingevuld vanuit geverifieerde documenten. Vul de overige contactgegevens in.", approvedDriver: "Goedgekeurde bestuurder", useBookingContact: "Boekingscontact gebruiken", notes: "Opmerkingen", notesPlaceholder: "Ophaalverzoek, helmmaat enz.", licenceConfirmation: "Ik bevestig dat het rijbewijs van de persoon is die deze boeking maakt.", acceptTerms: "Ik accepteer de huurvoorwaarden.", emailOffers: "Stuur mij aanbiedingen per e-mail.", preparingPayment: "Betaling voorbereiden...", payOnline: "Online betalen · €{amount}", completeRequired: "Vul de verplichte velden in om door te gaan.", step3: "Stap 3 van 3", payment: "Betaling", securePayment: "Veilige betaling.", back: "Terug", edit: "Bewerken", preparingCheckout: "Veilige betaling voorbereiden...", secureVerification: "Veilige documentverificatie", scanDocuments: "Scan uw documenten", validateDrivers: "Verifieer alle bestuurders", scanHelp: "Scan rijbewijs en identiteitskaart of paspoort. Uw naam wordt automatisch ingevuld.", multiScanHelp: "Elke bestuurder voltooit een aparte veilige controle. Eén afwijzing stopt de anderen niet.", progress: "Voortgang", preparingScanner: "Veilige scanner voorbereiden...", preparingScanners: "Veilige links voorbereiden...", keepOpen: "Houd deze pagina open.", approved: "Goedgekeurd", rejected: "Afgewezen", waiting: "Wachten", driverApproved: "Bestuurder goedgekeurd", driverRejected: "Bestuurder niet goedgekeurd", manualHelp: "Documenten geaccepteerd. Voor het ophalen kan handmatige bevestiging plaatsvinden.", approvedHelp: "Documenten succesvol gescand en gevalideerd.", rejectedHelp: "Het rijbewijs is niet geldig voor de gekozen scooter.", scanning: "Scan bezig", scannerExpired: "Link verlopen", scanQr: "Scan deze QR-code", scanQrHelp: "Open de camera op de telefoon van de bestuurder en scan deze privé-QR-code.", createQr: "Nieuwe QR maken", continueDriverScan: "Scan bestuurder {driver} voortzetten", validateDriver: "Bestuurder {driver} verifiëren", completeDriverFirst: "Voltooi eerst bestuurder {driver}", createScanner: "Nieuwe scanner maken", passengerOption: "Doorgaan als passagier op een goedgekeurde scooter", approvedRequired: "Minstens één goedgekeurde bestuurder is vereist.", scanAgain: "Opnieuw scannen", tryAgain: "Opnieuw voorbereiden", verificationComplete: "Verificatie voltooid", driversApproved: "{approved} van {requested} bestuurders goedgekeurd", partialHelp: "De hele boeking hoeft niet te worden geannuleerd. Ga door met {approved} scooter(s), scan opnieuw of annuleer.", continueWith: "Doorgaan met {approved} scooter(s)", cancelBooking: "Hele boeking annuleren", allApproved: "Alle bestuurders goedgekeurd", openingDetails: "Boekingsgegevens openen...", cancelAndBack: "Annuleren en terug", openScanner: "Scanner openen", openScannerHelp: "Elke bestuurder gebruikt een eigen QR of mobiele verificatieknop.", scanDocumentsStep: "Documenten scannen", scanDocumentsStepHelp: "Leg rijbewijs en identiteitskaart of paspoort vast.", continueCheckout: "Boeking voortzetten", continueCheckoutHelp: "Goedgekeurde bestuurders worden automatisch geteld vóór betaling."
  },
  pl: {
    language: "Język", vehicles: "Pojazdy", selectedVehicle: "Wybrany pojazd", scooter: "skuter", scooters: "skutery", includes: "W cenie", twoHelmets: "2 kaski", topCase: "Kufer", phoneMount: "Uchwyt na telefon", lock: "Blokada", insurance: "Ubezpieczenie", pickup: "Odbiór", return: "Zwrot", plan: "Plan", pickupLocation: "Miejsce odbioru", rentalTotal: "Łączna cena najmu", halfDay: "Pół dnia", fullDay: "Cały dzień", sameDay: "Ten sam dzień", day: "dzień", days: "dni", securityDeposit: "Przy odbiorze pobierana jest zwrotna kaucja €{amount} za skuter, gotówką lub kartą.", step2: "Krok 2 z 3", yourDetails: "Twoje dane", completeRemaining: "Uzupełnij pozostałe wymagane pola.", required: "Wymagane", documentsReceived: "Dokumenty otrzymane", drivingLicence: "Prawo jazdy", passport: "paszport", idCard: "dowód osobisty", complete: "Zakończone", primaryContact: "Główny kontakt rezerwacji", driver: "Kierowca", firstName: "Imię *", surname: "Nazwisko *", phone: "Telefon / WhatsApp *", email: "E-mail *", homeAddress: "Adres zamieszkania *", addressPlaceholder: "Ulica, miasto, kod pocztowy, kraj", additionalDrivers: "Dodatkowi zatwierdzeni kierowcy", additionalDriversHelp: "Imiona pobrano ze zweryfikowanych dokumentów. Uzupełnij dane kontaktowe każdego kierowcy.", approvedDriver: "Zatwierdzony kierowca", useBookingContact: "Użyj kontaktu rezerwacji", notes: "Uwagi", notesPlaceholder: "Prośba dotycząca odbioru, rozmiar kasku itd.", licenceConfirmation: "Potwierdzam, że prawo jazdy należy do osoby dokonującej rezerwacji.", acceptTerms: "Akceptuję warunki najmu.", emailOffers: "Wysyłaj mi oferty e-mailem.", preparingPayment: "Przygotowywanie płatności...", payOnline: "Zapłać online · €{amount}", completeRequired: "Uzupełnij wymagane pola, aby kontynuować.", step3: "Krok 3 z 3", payment: "Płatność", securePayment: "Bezpieczna płatność.", back: "Wstecz", edit: "Edytuj", preparingCheckout: "Przygotowywanie bezpiecznej płatności...", secureVerification: "Bezpieczna weryfikacja dokumentów", scanDocuments: "Zeskanuj dokumenty", validateDrivers: "Zweryfikuj wszystkich kierowców", scanHelp: "Zeskanuj prawo jazdy oraz dowód lub paszport. Imię zostanie uzupełnione automatycznie.", multiScanHelp: "Każdy kierowca przechodzi osobną bezpieczną kontrolę. Odrzucenie jednego nie zatrzyma pozostałych.", progress: "Postęp", preparingScanner: "Przygotowywanie bezpiecznego skanera...", preparingScanners: "Przygotowywanie bezpiecznych linków...", keepOpen: "Pozostaw tę stronę otwartą.", approved: "Zatwierdzony", rejected: "Odrzucony", waiting: "Oczekiwanie", driverApproved: "Kierowca zatwierdzony", driverRejected: "Kierowca niezatwierdzony", manualHelp: "Dokumenty przyjęte. Przed odbiorem może nastąpić ręczne potwierdzenie.", approvedHelp: "Dokumenty zeskanowane i zweryfikowane.", rejectedHelp: "Prawo jazdy nie jest ważne dla wybranego skutera.", scanning: "Skanowanie trwa", scannerExpired: "Link wygasł", scanQr: "Zeskanuj ten kod QR", scanQrHelp: "Otwórz aparat w telefonie kierowcy i zeskanuj prywatny kod QR.", createQr: "Utwórz nowy QR", continueDriverScan: "Kontynuuj kierowcę {driver}", validateDriver: "Zweryfikuj kierowcę {driver}", completeDriverFirst: "Najpierw ukończ kierowcę {driver}", createScanner: "Utwórz nowy skaner", passengerOption: "Kontynuuj jako pasażer zatwierdzonego skutera", approvedRequired: "Wymagany jest co najmniej jeden zatwierdzony kierowca.", scanAgain: "Skanuj ponownie", tryAgain: "Przygotuj ponownie", verificationComplete: "Weryfikacja zakończona", driversApproved: "Zatwierdzono {approved} z {requested} kierowców", partialHelp: "Nie trzeba anulować całej rezerwacji. Kontynuuj z {approved} skuterem/skuterami, zeskanuj ponownie lub anuluj.", continueWith: "Kontynuuj z {approved} skuterem/skuterami", cancelBooking: "Anuluj całą rezerwację", allApproved: "Wszyscy kierowcy zatwierdzeni", openingDetails: "Otwieranie danych rezerwacji...", cancelAndBack: "Anuluj i wróć", openScanner: "Otwórz skaner", openScannerHelp: "Każdy kierowca używa własnego QR lub przycisku mobilnego.", scanDocumentsStep: "Skanuj dokumenty", scanDocumentsStepHelp: "Zrób zdjęcia prawa jazdy i dowodu lub paszportu.", continueCheckout: "Kontynuuj rezerwację", continueCheckoutHelp: "Zatwierdzeni kierowcy są liczeni automatycznie przed płatnością."
  },
  cs: {
    language: "Jazyk", vehicles: "Vozidla", selectedVehicle: "Vybrané vozidlo", scooter: "skútr", scooters: "skútry", includes: "Zahrnuje", twoHelmets: "2 přilby", topCase: "Horní kufr", phoneMount: "Držák telefonu", lock: "Zámek", insurance: "Pojištění", pickup: "Vyzvednutí", return: "Vrácení", plan: "Tarif", pickupLocation: "Místo vyzvednutí", rentalTotal: "Cena pronájmu celkem", halfDay: "Půl dne", fullDay: "Celý den", sameDay: "Stejný den", day: "den", days: "dny", securityDeposit: "Při vyzvednutí se skládá vratná kauce €{amount} za skútr v hotovosti nebo kartou.", step2: "Krok 2 ze 3", yourDetails: "Vaše údaje", completeRemaining: "Vyplňte zbývající povinná pole.", required: "Povinné", documentsReceived: "Doklady přijaty", drivingLicence: "Řidičský průkaz", passport: "pas", idCard: "občanský průkaz", complete: "Dokončeno", primaryContact: "Hlavní kontakt rezervace", driver: "Řidič", firstName: "Jméno *", surname: "Příjmení *", phone: "Telefon / WhatsApp *", email: "E-mail *", homeAddress: "Adresa bydliště *", addressPlaceholder: "Ulice, město, PSČ, země", additionalDrivers: "Další schválení řidiči", additionalDriversHelp: "Jména byla vyplněna z ověřených dokladů. Doplňte kontaktní údaje každého řidiče.", approvedDriver: "Schválený řidič", useBookingContact: "Použít kontakt rezervace", notes: "Poznámky", notesPlaceholder: "Požadavek na vyzvednutí, velikost přilby atd.", licenceConfirmation: "Potvrzuji, že řidičský průkaz patří osobě provádějící rezervaci.", acceptTerms: "Souhlasím s podmínkami pronájmu.", emailOffers: "Posílat nabídky e-mailem.", preparingPayment: "Příprava platby...", payOnline: "Zaplatit online · €{amount}", completeRequired: "Pro pokračování vyplňte povinná pole.", step3: "Krok 3 ze 3", payment: "Platba", securePayment: "Bezpečná platba.", back: "Zpět", edit: "Upravit", preparingCheckout: "Příprava bezpečné platby...", secureVerification: "Bezpečné ověření dokladů", scanDocuments: "Naskenujte doklady", validateDrivers: "Ověřte všechny řidiče", scanHelp: "Naskenujte řidičský průkaz a občanský průkaz nebo pas. Jméno se vyplní automaticky.", multiScanHelp: "Každý řidič projde samostatným bezpečným ověřením. Zamítnutí jednoho nezastaví ostatní.", progress: "Průběh", preparingScanner: "Příprava bezpečného skeneru...", preparingScanners: "Příprava bezpečných odkazů...", keepOpen: "Nechte tuto stránku otevřenou.", approved: "Schváleno", rejected: "Zamítnuto", waiting: "Čeká", driverApproved: "Řidič schválen", driverRejected: "Řidič neschválen", manualHelp: "Doklady přijaty. Před vyzvednutím může proběhnout ruční kontrola.", approvedHelp: "Doklady byly úspěšně naskenovány a ověřeny.", rejectedHelp: "Předložený průkaz není platný pro vybraný skútr.", scanning: "Probíhá skenování", scannerExpired: "Odkaz vypršel", scanQr: "Naskenujte tento QR kód", scanQrHelp: "Otevřete fotoaparát v telefonu řidiče a naskenujte soukromý QR kód.", createQr: "Vytvořit nový QR", continueDriverScan: "Pokračovat s řidičem {driver}", validateDriver: "Ověřit řidiče {driver}", completeDriverFirst: "Nejprve dokončete řidiče {driver}", createScanner: "Vytvořit nový skener", passengerOption: "Pokračovat jako spolujezdec na schváleném skútru", approvedRequired: "Je vyžadován alespoň jeden schválený řidič.", scanAgain: "Skenovat znovu", tryAgain: "Připravit znovu", verificationComplete: "Ověření dokončeno", driversApproved: "Schváleno {approved} z {requested} řidičů", partialHelp: "Není nutné rušit celou rezervaci. Pokračujte s {approved} skútrem/skútry, skenujte znovu nebo rezervaci zrušte.", continueWith: "Pokračovat s {approved} skútrem/skútry", cancelBooking: "Zrušit celou rezervaci", allApproved: "Všichni řidiči schváleni", openingDetails: "Otevírání údajů rezervace...", cancelAndBack: "Zrušit a vrátit se", openScanner: "Otevřít skener", openScannerHelp: "Každý řidič použije vlastní QR nebo mobilní tlačítko.", scanDocumentsStep: "Skenovat doklady", scanDocumentsStepHelp: "Pořiďte řidičský průkaz a občanský průkaz nebo pas.", continueCheckout: "Pokračovat v rezervaci", continueCheckoutHelp: "Schválení řidiči se automaticky započítají před platbou."
  },
  uk: {
    language: "Мова", vehicles: "Транспорт", selectedVehicle: "Вибраний транспорт", scooter: "скутер", scooters: "скутери", includes: "Включено", twoHelmets: "2 шоломи", topCase: "Кофр", phoneMount: "Тримач телефону", lock: "Замок", insurance: "Страхування", pickup: "Отримання", return: "Повернення", plan: "Тариф", pickupLocation: "Місце отримання", rentalTotal: "Загальна оренда", halfDay: "Пів дня", fullDay: "Повний день", sameDay: "Того ж дня", day: "день", days: "днів", securityDeposit: "Під час отримання вноситься поворотна застава €{amount} за скутер готівкою або карткою.", step2: "Крок 2 з 3", yourDetails: "Ваші дані", completeRemaining: "Заповніть решту обов’язкових полів.", required: "Обов’язково", documentsReceived: "Документи отримано", drivingLicence: "Водійське посвідчення", passport: "паспорт", idCard: "ID-картка", complete: "Завершено", primaryContact: "Основний контакт бронювання", driver: "Водій", firstName: "Ім’я *", surname: "Прізвище *", phone: "Телефон / WhatsApp *", email: "Електронна пошта *", homeAddress: "Домашня адреса *", addressPlaceholder: "Вулиця, місто, індекс, країна", additionalDrivers: "Додаткові схвалені водії", additionalDriversHelp: "Імена заповнено з перевірених документів. Додайте контактні дані кожного водія.", approvedDriver: "Схвалений водій", useBookingContact: "Використати контакт бронювання", notes: "Примітки", notesPlaceholder: "Побажання щодо отримання, розмір шолома тощо.", licenceConfirmation: "Підтверджую, що посвідчення належить особі, яка робить бронювання.", acceptTerms: "Я приймаю умови оренди.", emailOffers: "Надсилати мені пропозиції електронною поштою.", preparingPayment: "Підготовка платежу...", payOnline: "Сплатити онлайн · €{amount}", completeRequired: "Заповніть обов’язкові поля, щоб продовжити.", step3: "Крок 3 з 3", payment: "Оплата", securePayment: "Безпечна оплата.", back: "Назад", edit: "Редагувати", preparingCheckout: "Підготовка безпечної оплати...", secureVerification: "Безпечна перевірка документів", scanDocuments: "Відскануйте документи", validateDrivers: "Перевірте всіх водіїв", scanHelp: "Відскануйте посвідчення та ID-картку або паспорт. Ім’я заповниться автоматично.", multiScanHelp: "Кожен водій проходить окрему безпечну перевірку. Відмова одному не зупиняє інших.", progress: "Прогрес", preparingScanner: "Підготовка безпечного сканера...", preparingScanners: "Підготовка безпечних посилань...", keepOpen: "Не закривайте цю сторінку.", approved: "Схвалено", rejected: "Відхилено", waiting: "Очікування", driverApproved: "Водія схвалено", driverRejected: "Водія не схвалено", manualHelp: "Документи прийнято. До отримання можлива ручна перевірка.", approvedHelp: "Документи успішно відскановано й перевірено.", rejectedHelp: "Посвідчення недійсне для вибраного скутера.", scanning: "Сканування триває", scannerExpired: "Посилання прострочене", scanQr: "Відскануйте цей QR-код", scanQrHelp: "Відкрийте камеру на телефоні водія та відскануйте приватний QR-код.", createQr: "Створити новий QR", continueDriverScan: "Продовжити водія {driver}", validateDriver: "Перевірити водія {driver}", completeDriverFirst: "Спочатку завершіть водія {driver}", createScanner: "Створити новий сканер", passengerOption: "Продовжити як пасажир на схваленому скутері", approvedRequired: "Потрібен щонайменше один схвалений водій.", scanAgain: "Сканувати знову", tryAgain: "Підготувати знову", verificationComplete: "Перевірку завершено", driversApproved: "Схвалено {approved} з {requested} водіїв", partialHelp: "Не потрібно скасовувати все бронювання. Продовжте з {approved} скутером/скутерами, повторіть сканування або скасуйте.", continueWith: "Продовжити з {approved} скутером/скутерами", cancelBooking: "Скасувати все бронювання", allApproved: "Усіх водіїв схвалено", openingDetails: "Відкриття даних бронювання...", cancelAndBack: "Скасувати й повернутися", openScanner: "Відкрити сканер", openScannerHelp: "Кожен водій використовує власний QR або мобільну кнопку.", scanDocumentsStep: "Сканувати документи", scanDocumentsStepHelp: "Зніміть посвідчення та ID-картку або паспорт.", continueCheckout: "Продовжити бронювання", continueCheckoutHelp: "Схвалені водії рахуються автоматично перед оплатою."
  },
};

const EXTRA_EN = {
  selectLanguage: "Select language",
  active: "Active",
  eBike: "E-Bike",
  missingDocuments:
    "Your document scan completed, but a secure document reference is missing. Please restart document verification.",
  verificationRestart:
    "Document verification is incomplete. Please restart document verification.",
  completeDriverDetails:
    "Please complete the required details for every approved driver.",
  driverDetailsSaveError: "Driver {driver} details could not be saved.",
  availabilityError:
    "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
  availabilityCount: "Only {count} scooter(s) are available for the selected date and time.",
  soldOut: "This scooter category is sold out for the selected date and time.",
  paymentExpired:
    "Your payment session expired. Please continue again so we can recheck live availability.",
  paymentInitFailed: "Payment initialization failed. Please try again.",
  genericError: "Something went wrong. Please try again.",
  invalidDates: "Please select valid pickup and return dates before verifying documents.",
  scannerPrepareError: "Could not prepare the secure scanner. Please try again.",
  sessionReadError: "Could not read the verification session.",
  returnedResultError: "Could not read the returned verification result.",
  noneApproved: "None of the drivers passed verification. The booking cannot continue.",
  scannerOpenError: "Could not open the secure scanner.",
  paymentDetails: "Payment details",
  paymentDetailsHelp: "Enter your secure payment details below to complete your booking.",
  paymentMethod: "Card / payment method",
  enterPaymentDetails: "Enter your secure payment details below",
  stripeSecure: "Stripe secure",
  loadingPaymentForm: "Loading secure payment form...",
  processingPayment: "Processing payment...",
  payNowButton: "Pay now",
  loadingPayment: "Loading payment...",
  encryptedPayment: "Encrypted payment",
  fastConfirmation: "Fast confirmation",
  noHiddenFees: "No hidden fees",
  securePaymentLoading: "Secure payment is still loading. Please wait a moment.",
  paymentFormLoading: "Payment form is still loading. Please wait a moment.",
  checkPaymentDetails: "Please check your payment details.",
  paymentFailed: "Payment failed. Please try again.",
  closeConfirmation: "Close confirmation and return home",
  paymentReceived: "Payment received",
  bookingConfirmed: "Booking confirmed",
  bookingConfirmedHelp: "Your payment was received and your booking is now confirmed.",
  bookingDetails: "Booking details",
  rideReserved: "Your ride is reserved",
  vehicle: "Vehicle",
  customer: "Customer",
  paid: "Paid",
  confirmationEmail:
    "Your booking is confirmed. The full booking details are saved with your confirmation email.",
  ourLocation: "Our location",
  close: "Close",
  bringAtPickup: "Bring these at pickup",
  pickupNotes: "Pickup notes",
  passportId: "Passport / ID",
  originalPassportId: "Bring your original passport or national ID.",
  validLicence: "Valid driving licence",
  validLicenceHelp: "A, A1, A2 or B licence held for 3+ years.",
  depositTitle: "€150 refundable deposit per scooter",
  depositHandled: "Handled at pickup by cash or card.",
  arriveOnTime:
    "Please arrive at your pickup time so we can prepare your scooter and make the handover fast.",
} as const;

type ExtraCheckoutCopy = {
  [K in keyof typeof EXTRA_EN]: string;
};

const EXTRA_COPY: Record<CheckoutLocale, ExtraCheckoutCopy> = {
  en: EXTRA_EN,
  es: {
    selectLanguage: "Seleccionar idioma",
    active: "Activo",
    eBike: "Bicicleta eléctrica",
    missingDocuments: "El escaneo terminó, pero falta una referencia segura de los documentos. Reinicia la verificación.",
    verificationRestart: "La verificación de documentos está incompleta. Reinicia la verificación.",
    completeDriverDetails: "Completa los datos obligatorios de todos los conductores aprobados.",
    driverDetailsSaveError: "No se pudieron guardar los datos del conductor {driver}.",
    availabilityError: "No se pudo confirmar la disponibilidad. Inténtalo de nuevo o contáctanos por WhatsApp.",
    availabilityCount: "Solo hay {count} scooter(s) disponibles para la fecha y hora seleccionadas.",
    soldOut: "Esta categoría de scooter está agotada para la fecha y hora seleccionadas.",
    paymentExpired: "La sesión de pago ha caducado. Continúa de nuevo para comprobar la disponibilidad.",
    paymentInitFailed: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    genericError: "Algo salió mal. Inténtalo de nuevo.",
    invalidDates: "Selecciona fechas válidas de recogida y devolución antes de verificar los documentos.",
    scannerPrepareError: "No se pudo preparar el escáner seguro. Inténtalo de nuevo.",
    sessionReadError: "No se pudo leer la sesión de verificación.",
    returnedResultError: "No se pudo leer el resultado de verificación devuelto.",
    noneApproved: "Ningún conductor superó la verificación. La reserva no puede continuar.",
    scannerOpenError: "No se pudo abrir el escáner seguro.",
    paymentDetails: "Datos de pago",
    paymentDetailsHelp: "Introduce los datos de pago seguros para completar la reserva.",
    paymentMethod: "Tarjeta / método de pago",
    enterPaymentDetails: "Introduce tus datos de pago seguros",
    stripeSecure: "Seguridad de Stripe",
    loadingPaymentForm: "Cargando el formulario de pago seguro...",
    processingPayment: "Procesando el pago...",
    payNowButton: "Pagar ahora",
    loadingPayment: "Cargando el pago...",
    encryptedPayment: "Pago cifrado",
    fastConfirmation: "Confirmación rápida",
    noHiddenFees: "Sin cargos ocultos",
    securePaymentLoading: "El pago seguro todavía se está cargando. Espera un momento.",
    paymentFormLoading: "El formulario de pago todavía se está cargando. Espera un momento.",
    checkPaymentDetails: "Comprueba los datos de pago.",
    paymentFailed: "El pago ha fallado. Inténtalo de nuevo.",
    closeConfirmation: "Cerrar la confirmación y volver al inicio",
    paymentReceived: "Pago recibido",
    bookingConfirmed: "Reserva confirmada",
    bookingConfirmedHelp: "Hemos recibido el pago y la reserva está confirmada.",
    bookingDetails: "Datos de la reserva",
    rideReserved: "Tu vehículo está reservado",
    vehicle: "Vehículo",
    customer: "Cliente",
    paid: "Pagado",
    confirmationEmail: "Tu reserva está confirmada. Encontrarás todos los datos en el correo de confirmación.",
    ourLocation: "Nuestra ubicación",
    close: "Cerrar",
    bringAtPickup: "Trae esto al recoger",
    pickupNotes: "Notas de recogida",
    passportId: "Pasaporte / documento de identidad",
    originalPassportId: "Trae tu pasaporte o documento de identidad original.",
    validLicence: "Permiso de conducir válido",
    validLicenceHelp: "Permiso A, A1, A2 o B con más de 3 años.",
    depositTitle: "Depósito reembolsable de 150 € por scooter",
    depositHandled: "Se gestiona al recoger, en efectivo o con tarjeta.",
    arriveOnTime: "Llega a la hora de recogida para que podamos preparar el scooter y agilizar la entrega.",
  },
  de: {
    selectLanguage: "Sprache auswählen",
    active: "Aktiv",
    eBike: "E-Bike",
    missingDocuments: "Der Scan wurde abgeschlossen, aber eine sichere Dokumentreferenz fehlt. Bitte starte die Prüfung neu.",
    verificationRestart: "Die Dokumentenprüfung ist unvollständig. Bitte starte sie neu.",
    completeDriverDetails: "Bitte vervollständige die Pflichtangaben für alle zugelassenen Fahrer.",
    driverDetailsSaveError: "Die Angaben für Fahrer {driver} konnten nicht gespeichert werden.",
    availabilityError: "Die Verfügbarkeit konnte nicht bestätigt werden. Bitte versuche es erneut oder kontaktiere uns per WhatsApp.",
    availabilityCount: "Für das gewählte Datum und die Uhrzeit sind nur {count} Roller verfügbar.",
    soldOut: "Diese Rollerkategorie ist für das gewählte Datum und die Uhrzeit ausverkauft.",
    paymentExpired: "Deine Zahlungssitzung ist abgelaufen. Fahre erneut fort, damit wir die Verfügbarkeit prüfen können.",
    paymentInitFailed: "Die Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.",
    genericError: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
    invalidDates: "Bitte wähle gültige Abhol- und Rückgabedaten, bevor du die Dokumente prüfst.",
    scannerPrepareError: "Der sichere Scanner konnte nicht vorbereitet werden. Bitte versuche es erneut.",
    sessionReadError: "Die Verifizierungssitzung konnte nicht gelesen werden.",
    returnedResultError: "Das zurückgegebene Prüfergebnis konnte nicht gelesen werden.",
    noneApproved: "Keiner der Fahrer hat die Prüfung bestanden. Die Buchung kann nicht fortgesetzt werden.",
    scannerOpenError: "Der sichere Scanner konnte nicht geöffnet werden.",
    paymentDetails: "Zahlungsdetails",
    paymentDetailsHelp: "Gib unten deine sicheren Zahlungsdaten ein, um die Buchung abzuschließen.",
    paymentMethod: "Karte / Zahlungsmethode",
    enterPaymentDetails: "Sichere Zahlungsdaten eingeben",
    stripeSecure: "Sicher mit Stripe",
    loadingPaymentForm: "Sicheres Zahlungsformular wird geladen...",
    processingPayment: "Zahlung wird verarbeitet...",
    payNowButton: "Jetzt bezahlen",
    loadingPayment: "Zahlung wird geladen...",
    encryptedPayment: "Verschlüsselte Zahlung",
    fastConfirmation: "Schnelle Bestätigung",
    noHiddenFees: "Keine versteckten Gebühren",
    securePaymentLoading: "Die sichere Zahlung wird noch geladen. Bitte warte einen Moment.",
    paymentFormLoading: "Das Zahlungsformular wird noch geladen. Bitte warte einen Moment.",
    checkPaymentDetails: "Bitte prüfe deine Zahlungsdaten.",
    paymentFailed: "Die Zahlung ist fehlgeschlagen. Bitte versuche es erneut.",
    closeConfirmation: "Bestätigung schließen und zur Startseite zurückkehren",
    paymentReceived: "Zahlung erhalten",
    bookingConfirmed: "Buchung bestätigt",
    bookingConfirmedHelp: "Deine Zahlung ist eingegangen und deine Buchung ist bestätigt.",
    bookingDetails: "Buchungsdetails",
    rideReserved: "Dein Fahrzeug ist reserviert",
    vehicle: "Fahrzeug",
    customer: "Kunde",
    paid: "Bezahlt",
    confirmationEmail: "Deine Buchung ist bestätigt. Alle Buchungsdetails findest du in der Bestätigungs-E-Mail.",
    ourLocation: "Unser Standort",
    close: "Schließen",
    bringAtPickup: "Zur Abholung mitbringen",
    pickupNotes: "Hinweise zur Abholung",
    passportId: "Reisepass / Ausweis",
    originalPassportId: "Bringe deinen Originalreisepass oder Personalausweis mit.",
    validLicence: "Gültiger Führerschein",
    validLicenceHelp: "Führerschein A, A1, A2 oder B seit mindestens 3 Jahren.",
    depositTitle: "150 € rückzahlbare Kaution pro Roller",
    depositHandled: "Bei der Abholung in bar oder per Karte.",
    arriveOnTime: "Bitte komme pünktlich zur Abholung, damit wir den Roller vorbereiten und die Übergabe schnell durchführen können.",
  },
  fr: buildExtra("fr", {
    selectLanguage: "Choisir la langue", active: "Actif", eBike: "Vélo électrique",
    availabilityCount: "Seulement {count} scooter(s) sont disponibles pour la date et l’heure choisies.", soldOut: "Cette catégorie de scooter est complète pour la date et l’heure choisies.",
    bookingConfirmed: "Réservation confirmée", bookingDetails: "Détails de la réservation", rideReserved: "Votre véhicule est réservé", vehicle: "Véhicule", customer: "Client", paid: "Payé", ourLocation: "Notre emplacement", close: "Fermer", bringAtPickup: "À apporter lors du retrait", pickupNotes: "Notes de retrait", passportId: "Passeport / pièce d’identité", validLicence: "Permis de conduire valide", depositTitle: "Caution remboursable de 150 € par scooter",
  }),
  it: buildExtra("it", {
    selectLanguage: "Seleziona lingua", active: "Attiva", eBike: "Bici elettrica",
    availabilityCount: "Sono disponibili solo {count} scooter per la data e l’ora selezionate.", soldOut: "Questa categoria di scooter è esaurita per la data e l’ora selezionate.",
    bookingConfirmed: "Prenotazione confermata", bookingDetails: "Dettagli della prenotazione", rideReserved: "Il tuo veicolo è riservato", vehicle: "Veicolo", customer: "Cliente", paid: "Pagato", ourLocation: "La nostra posizione", close: "Chiudi", bringAtPickup: "Da portare al ritiro", pickupNotes: "Note per il ritiro", passportId: "Passaporto / documento d’identità", validLicence: "Patente valida", depositTitle: "Deposito rimborsabile di 150 € per scooter",
  }),
  nl: buildExtra("nl", {
    selectLanguage: "Taal selecteren", active: "Actief", eBike: "E-bike",
    availabilityCount: "Er zijn slechts {count} scooter(s) beschikbaar voor de gekozen datum en tijd.", soldOut: "Deze scootercategorie is uitverkocht voor de gekozen datum en tijd.",
    bookingConfirmed: "Boeking bevestigd", bookingDetails: "Boekingsgegevens", rideReserved: "Uw voertuig is gereserveerd", vehicle: "Voertuig", customer: "Klant", paid: "Betaald", ourLocation: "Onze locatie", close: "Sluiten", bringAtPickup: "Meenemen bij het ophalen", pickupNotes: "Ophaalinformatie", passportId: "Paspoort / identiteitskaart", validLicence: "Geldig rijbewijs", depositTitle: "€ 150 terugbetaalbare borg per scooter",
  }),
  pl: buildExtra("pl", {
    selectLanguage: "Wybierz język", active: "Aktywny", eBike: "Rower elektryczny",
    availabilityCount: "Dla wybranej daty i godziny dostępnych jest tylko {count} skuterów.", soldOut: "Ta kategoria skuterów jest wyprzedana w wybranym terminie.",
    bookingConfirmed: "Rezerwacja potwierdzona", bookingDetails: "Szczegóły rezerwacji", rideReserved: "Twój pojazd jest zarezerwowany", vehicle: "Pojazd", customer: "Klient", paid: "Zapłacono", ourLocation: "Nasza lokalizacja", close: "Zamknij", bringAtPickup: "Zabierz ze sobą przy odbiorze", pickupNotes: "Informacje o odbiorze", passportId: "Paszport / dowód osobisty", validLicence: "Ważne prawo jazdy", depositTitle: "Zwrotna kaucja 150 € za skuter",
  }),
  sv: buildExtra("sv", {
    selectLanguage: "Välj språk", active: "Aktivt", eBike: "Elcykel",
    availabilityCount: "Endast {count} skoter/skotrar är tillgängliga för valt datum och tid.", soldOut: "Denna skoterkategori är slutsåld för valt datum och tid.",
    bookingConfirmed: "Bokningen är bekräftad", bookingDetails: "Bokningsuppgifter", rideReserved: "Ditt fordon är reserverat", vehicle: "Fordon", customer: "Kund", paid: "Betalt", ourLocation: "Vår plats", close: "Stäng", bringAtPickup: "Ta med vid hämtning", pickupNotes: "Hämtningsinformation", passportId: "Pass / ID", validLicence: "Giltigt körkort", depositTitle: "150 € återbetalningsbar deposition per skoter",
  }),
  da: buildExtra("da", {
    selectLanguage: "Vælg sprog", active: "Aktivt", eBike: "Elcykel",
    availabilityCount: "Kun {count} scooter(e) er ledige på den valgte dato og tid.", soldOut: "Denne scooter-kategori er udsolgt på den valgte dato og tid.",
    bookingConfirmed: "Booking bekræftet", bookingDetails: "Bookingoplysninger", rideReserved: "Dit køretøj er reserveret", vehicle: "Køretøj", customer: "Kunde", paid: "Betalt", ourLocation: "Vores placering", close: "Luk", bringAtPickup: "Medbring ved afhentning", pickupNotes: "Afhentningsnoter", passportId: "Pas / ID", validLicence: "Gyldigt kørekort", depositTitle: "150 € refunderbart depositum pr. scooter",
  }),
  no: buildExtra("no", {
    selectLanguage: "Velg språk", active: "Aktivt", eBike: "Elsykkel",
    availabilityCount: "Bare {count} scooter(e) er tilgjengelige på valgt dato og tid.", soldOut: "Denne scooterkategorien er utsolgt på valgt dato og tid.",
    bookingConfirmed: "Bestilling bekreftet", bookingDetails: "Bestillingsopplysninger", rideReserved: "Kjøretøyet ditt er reservert", vehicle: "Kjøretøy", customer: "Kunde", paid: "Betalt", ourLocation: "Vår beliggenhet", close: "Lukk", bringAtPickup: "Ta med ved henting", pickupNotes: "Henteinformasjon", passportId: "Pass / ID", validLicence: "Gyldig førerkort", depositTitle: "150 € refunderbart depositum per scooter",
  }),
  pt: buildExtra("pt", {
    selectLanguage: "Selecionar idioma", active: "Ativo", eBike: "Bicicleta elétrica",
    availabilityCount: "Apenas {count} scooter(s) estão disponíveis para a data e hora selecionadas.", soldOut: "Esta categoria de scooter está esgotada para a data e hora selecionadas.",
    bookingConfirmed: "Reserva confirmada", bookingDetails: "Detalhes da reserva", rideReserved: "O seu veículo está reservado", vehicle: "Veículo", customer: "Cliente", paid: "Pago", ourLocation: "A nossa localização", close: "Fechar", bringAtPickup: "Trazer no levantamento", pickupNotes: "Notas de levantamento", passportId: "Passaporte / documento de identidade", validLicence: "Carta de condução válida", depositTitle: "Caução reembolsável de 150 € por scooter",
  }),
  cs: buildExtra("cs", {
    selectLanguage: "Vybrat jazyk", active: "Aktivní", eBike: "Elektrokolo",
    availabilityCount: "Pro zvolené datum a čas je k dispozici pouze {count} skútrů.", soldOut: "Tato kategorie skútrů je ve zvoleném termínu vyprodána.",
    bookingConfirmed: "Rezervace potvrzena", bookingDetails: "Údaje rezervace", rideReserved: "Vaše vozidlo je rezervováno", vehicle: "Vozidlo", customer: "Zákazník", paid: "Zaplaceno", ourLocation: "Naše poloha", close: "Zavřít", bringAtPickup: "Přineste při vyzvednutí", pickupNotes: "Informace k vyzvednutí", passportId: "Pas / občanský průkaz", validLicence: "Platný řidičský průkaz", depositTitle: "Vratná kauce 150 € za skútr",
  }),
  uk: buildExtra("uk", {
    selectLanguage: "Вибрати мову", active: "Активна", eBike: "Електровелосипед",
    availabilityCount: "На вибрані дату й час доступно лише {count} скутерів.", soldOut: "Цю категорію скутерів розпродано на вибрані дату й час.",
    bookingConfirmed: "Бронювання підтверджено", bookingDetails: "Дані бронювання", rideReserved: "Ваш транспорт зарезервовано", vehicle: "Транспорт", customer: "Клієнт", paid: "Сплачено", ourLocation: "Наше розташування", close: "Закрити", bringAtPickup: "Візьміть із собою під час отримання", pickupNotes: "Інформація про отримання", passportId: "Паспорт / ID-картка", validLicence: "Чинне водійське посвідчення", depositTitle: "Поворотна застава 150 € за скутер",
  }),
};

type BuiltExtraOverrides = Pick<
  ExtraCheckoutCopy,
  | "selectLanguage"
  | "active"
  | "eBike"
  | "availabilityCount"
  | "soldOut"
  | "bookingConfirmed"
  | "bookingDetails"
  | "rideReserved"
  | "vehicle"
  | "customer"
  | "paid"
  | "ourLocation"
  | "close"
  | "bringAtPickup"
  | "pickupNotes"
  | "passportId"
  | "validLicence"
  | "depositTitle"
>;

function buildExtra(
  locale: CheckoutLocale,
  overrides: BuiltExtraOverrides,
): ExtraCheckoutCopy {
  const base = COPY[locale];
  const retry = `${base.tryAgain}.`;

  return {
    ...overrides,
    missingDocuments: `${base.documentsReceived}. ${base.cancelAndBack}.`,
    verificationRestart: `${base.secureVerification}. ${retry}`,
    completeDriverDetails: base.completeRequired,
    driverDetailsSaveError: `${base.driver} {driver}: ${retry}`,
    availabilityError: retry,
    paymentExpired: `${base.payment}: ${retry}`,
    paymentInitFailed: `${base.payment}: ${retry}`,
    genericError: retry,
    invalidDates: `${base.pickup} / ${base.return}: ${base.required}.`,
    scannerPrepareError: `${base.secureVerification}: ${retry}`,
    sessionReadError: `${base.secureVerification}: ${retry}`,
    returnedResultError: `${base.secureVerification}: ${retry}`,
    noneApproved: `${base.driverRejected}. ${base.cancelBooking}.`,
    scannerOpenError: `${base.openScanner}: ${retry}`,
    paymentDetails: base.payment,
    paymentDetailsHelp: base.securePayment,
    paymentMethod: base.payment,
    enterPaymentDetails: base.securePayment,
    stripeSecure: "Stripe",
    loadingPaymentForm: base.preparingCheckout,
    processingPayment: base.preparingPayment,
    payNowButton: base.payment,
    loadingPayment: base.preparingPayment,
    encryptedPayment: base.securePayment,
    fastConfirmation: base.complete,
    noHiddenFees: base.rentalTotal,
    securePaymentLoading: base.preparingCheckout,
    paymentFormLoading: base.preparingCheckout,
    checkPaymentDetails: retry,
    paymentFailed: `${base.payment}: ${retry}`,
    closeConfirmation: overrides.close,
    paymentReceived: `${base.payment} · ${base.complete}`,
    bookingConfirmedHelp: `${overrides.bookingConfirmed}. ${base.complete}.`,
    confirmationEmail: `${overrides.bookingConfirmed}. ${base.complete}.`,
    originalPassportId: `${base.passport} / ${base.idCard}.`,
    validLicenceHelp: "A, A1, A2 / B · 3+",
    depositHandled: base.securityDeposit.replace("{amount}", "150.00"),
    arriveOnTime: `${base.pickup}: ${base.complete}.`,
  };
}

export type CheckoutCopy = BaseCheckoutCopy & ExtraCheckoutCopy;

export function normalizeCheckoutLocale(value: string): CheckoutLocale {
  const locale = value.toLowerCase() as CheckoutLocale;
  return CHECKOUT_LANGUAGES.some((item) => item.code === locale)
    ? locale
    : "en";
}

export function getCheckoutCopy(value: string): CheckoutCopy {
  const locale = normalizeCheckoutLocale(value);
  return {
    ...COPY[locale],
    ...EXTRA_COPY[locale],
  };
}

export function formatCheckoutText(
  value: string,
  variables: Record<string, string | number>,
) {
  return Object.entries(variables).reduce(
    (text, [key, replacement]) =>
      text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}