"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";

type ScannerLocale =
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

type IdentityType = "id" | "passport";
type StepKey = "dlFront" | "dlBack" | "idFront" | "idBack";

type Stage =
  | "loading"
  | "camera"
  | "preview"
  | "identity-choice"
  | "analyzing"
  | "decision"
  | "complete"
  | "error";

type DecisionKey =
  | "retake"
  | "licence_expired"
  | "identity_expired"
  | "b_less_than_three_years"
  | "no_compatible_category"
  | "category_not_yet_valid"
  | "manual_review"
  | "accepted";

type SessionData = {
  success: boolean;
  bookingId?: string;
  status?:
    | "pending"
    | "scanning"
    | "completed"
    | "failed"
    | "expired"
    | "cancelled";
  error?: string;
};

type Analysis = {
  success: boolean;
  outcome: "accepted" | "retake" | "manual_review" | "rejected";
  messageKey?: DecisionKey;
  message: string;
  reasons: string[];
  retakeSides: StepKey[];
  licenceData: any;
  identityData: any;
  analysis: any;
  error?: string;
};

type Quality = {
  tone: "good" | "warn" | "neutral";
  text: string;
};

type StepCopy = {
  eyebrow: string;
  title: string;
  instruction: string;
};

type Copy = {
  scanner: string;
  step: string;
  openingCamera: string;
  alignDocument: string;
  tooDark: string;
  tooMuchGlare: string;
  holdStill: string;
  moveCloser: string;
  automaticReady: string;
  capturing: string;
  licenceCaptured: string;
  chooseIdentity: string;
  identityHelp: string;
  idCard: string;
  frontAndBack: string;
  passport: string;
  photoPage: string;
  openingScanner: string;
  reviewingDocuments: string;
  connecting: string;
  checking: string;
  retakeTitle: string;
  rejectedTitle: string;
  retakeButton: string;
  scanAgain: string;
  returnCheckout: string;
  documentsReceived: string;
  verificationComplete: string;
  manualComplete: string;
  acceptedComplete: string;
  returningCheckout: string;
  returnBooking: string;
  attention: string;
  takePhotoInstead: string;
  tryAgain: string;
  continueManual: string;
  missingSession: string;
  sessionError: string;
  updateError: string;
  cameraUnsupported: string;
  cameraDenied: string;
  cameraError: string;
  captureError: string;
  invalidPhoto: string;
  analysisError: string;
  saveError: string;
  steps: Record<StepKey, StepCopy>;
  decisions: Record<DecisionKey, string>;
};

const COPY: Record<ScannerLocale, Copy> = {
  en: {
    scanner: "NEXA secure scanner",
    step: "Step",
    openingCamera: "Opening rear camera...",
    alignDocument: "Align the complete document inside the frame",
    tooDark: "Too dark — move toward better light",
    tooMuchGlare: "Too much glare — tilt the document slightly",
    holdStill: "Hold the document still",
    moveCloser: "Move slightly closer and keep all four corners visible",
    automaticReady: "Clear position — automatic capture is ready",
    capturing: "Capturing automatically...",
    licenceCaptured: "Driving licence captured",
    chooseIdentity: "Choose your identity document",
    identityHelp:
      "Use the original document you will bring when collecting the scooter.",
    idCard: "ID card",
    frontAndBack: "Front and back",
    passport: "Passport",
    photoPage: "Photo page",
    openingScanner: "Opening secure scanner",
    reviewingDocuments: "Reviewing your documents",
    connecting: "Connecting to your booking...",
    checking:
      "Checking clarity, issue dates, expiry dates and licence categories...",
    retakeTitle: "Please retake a photo",
    rejectedTitle: "Licence cannot be accepted",
    retakeButton: "Retake requested photo",
    scanAgain: "Scan again",
    returnCheckout: "Return to checkout",
    documentsReceived: "Documents received",
    verificationComplete: "Verification complete",
    manualComplete:
      "Your booking can continue. NEXA Rentals will confirm the documents manually before pickup.",
    acceptedComplete:
      "Your documents passed the automatic checks and were connected to your booking.",
    returningCheckout: "Returning to checkout...",
    returnBooking: "You can return to the booking screen",
    attention: "Scanner needs attention",
    takePhotoInstead: "Take photo instead",
    tryAgain: "Try again",
    continueManual: "Continue for manual review",
    missingSession: "The secure verification session is missing.",
    sessionError:
      "This verification session is unavailable. Please restart from checkout.",
    updateError: "Could not update the verification session.",
    cameraUnsupported: "This browser does not support live camera access.",
    cameraDenied:
      "Camera permission was blocked. Allow camera access in your browser, or take a photo instead.",
    cameraError: "Could not open the rear camera.",
    captureError: "Could not capture the document photograph.",
    invalidPhoto: "Please select or take a readable image.",
    analysisError: "The documents could not be analyzed. Please try again.",
    saveError: "The document photographs could not be saved.",
    steps: {
      dlFront: {
        eyebrow: "Driving licence · Front",
        title: "Place the front inside the frame",
        instruction:
          "Keep all four corners visible. Avoid glare and hold the licence steady.",
      },
      dlBack: {
        eyebrow: "Driving licence · Back",
        title: "Now scan the back",
        instruction:
          "Turn the licence over and keep the complete card inside the frame.",
      },
      idFront: {
        eyebrow: "Identity document · Front",
        title: "Place the document inside the frame",
        instruction:
          "Show the complete passport photo page or the front of your ID card.",
      },
      idBack: {
        eyebrow: "Identity card · Back",
        title: "Now scan the back",
        instruction:
          "Keep every edge visible and make sure the small text is sharp.",
      },
    },
    decisions: {
      retake:
        "One or more photographs are unclear. Please retake the requested image.",
      licence_expired: "The driving licence appears to be expired.",
      identity_expired:
        "The passport or identity document appears to be expired.",
      b_less_than_three_years:
        "In Spain, a category B driving licence must have been held for at least 3 years to ride a 125cc scooter. Your category B does not yet meet this requirement.",
      no_compatible_category:
        "A valid A, A1, A2, or category B licence held for at least 3 years is required.",
      category_not_yet_valid:
        "The detected driving licence category is not valid yet.",
      manual_review:
        "Documents received. NEXA Rentals will confirm them manually before pickup.",
      accepted: "Documents accepted.",
    },
  },

  es: {
    scanner: "Escáner seguro de NEXA",
    step: "Paso",
    openingCamera: "Abriendo la cámara trasera...",
    alignDocument: "Coloca el documento completo dentro del marco",
    tooDark: "Está demasiado oscuro — busca más luz",
    tooMuchGlare: "Hay demasiado reflejo — inclina un poco el documento",
    holdStill: "Mantén el documento quieto",
    moveCloser: "Acércalo un poco y mantén visibles las cuatro esquinas",
    automaticReady: "Posición clara — la captura automática está lista",
    capturing: "Capturando automáticamente...",
    licenceCaptured: "Permiso de conducir capturado",
    chooseIdentity: "Elige tu documento de identidad",
    identityHelp:
      "Usa el documento original que traerás al recoger el scooter.",
    idCard: "Documento de identidad",
    frontAndBack: "Anverso y reverso",
    passport: "Pasaporte",
    photoPage: "Página con foto",
    openingScanner: "Abriendo el escáner seguro",
    reviewingDocuments: "Revisando tus documentos",
    connecting: "Conectando con tu reserva...",
    checking:
      "Comprobando nitidez, fechas de expedición y caducidad, y categorías del permiso...",
    retakeTitle: "Vuelve a hacer la foto",
    rejectedTitle: "No se puede aceptar el permiso",
    retakeButton: "Repetir la foto solicitada",
    scanAgain: "Escanear de nuevo",
    returnCheckout: "Volver al pago",
    documentsReceived: "Documentos recibidos",
    verificationComplete: "Verificación completada",
    manualComplete:
      "Tu reserva puede continuar. NEXA Rentals confirmará los documentos manualmente antes de la recogida.",
    acceptedComplete:
      "Tus documentos han superado las comprobaciones automáticas y se han vinculado a tu reserva.",
    returningCheckout: "Volviendo al pago...",
    returnBooking: "Puedes volver a la pantalla de reserva",
    attention: "El escáner necesita atención",
    takePhotoInstead: "Hacer una foto",
    tryAgain: "Intentar de nuevo",
    continueManual: "Continuar para revisión manual",
    missingSession: "Falta la sesión segura de verificación.",
    sessionError:
      "Esta sesión de verificación no está disponible. Reinicia el proceso desde el pago.",
    updateError: "No se pudo actualizar la sesión de verificación.",
    cameraUnsupported:
      "Este navegador no admite el acceso a la cámara en directo.",
    cameraDenied:
      "Se ha bloqueado el permiso de cámara. Permite el acceso o haz una foto.",
    cameraError: "No se pudo abrir la cámara trasera.",
    captureError: "No se pudo capturar la foto del documento.",
    invalidPhoto: "Selecciona o toma una imagen legible.",
    analysisError:
      "No se pudieron analizar los documentos. Inténtalo de nuevo.",
    saveError: "No se pudieron guardar las fotos de los documentos.",
    steps: {
      dlFront: {
        eyebrow: "Permiso de conducir · Anverso",
        title: "Coloca el anverso dentro del marco",
        instruction:
          "Mantén visibles las cuatro esquinas, evita reflejos y no muevas el permiso.",
      },
      dlBack: {
        eyebrow: "Permiso de conducir · Reverso",
        title: "Ahora escanea el reverso",
        instruction:
          "Dale la vuelta y mantén la tarjeta completa dentro del marco.",
      },
      idFront: {
        eyebrow: "Documento de identidad · Anverso",
        title: "Coloca el documento dentro del marco",
        instruction:
          "Muestra completa la página con foto del pasaporte o el anverso del documento de identidad.",
      },
      idBack: {
        eyebrow: "Documento de identidad · Reverso",
        title: "Ahora escanea el reverso",
        instruction:
          "Mantén todos los bordes visibles y asegúrate de que el texto pequeño esté nítido.",
      },
    },
    decisions: {
      retake:
        "Una o varias fotos no están claras. Repite la imagen solicitada.",
      licence_expired: "El permiso de conducir parece estar caducado.",
      identity_expired:
        "El pasaporte o documento de identidad parece estar caducado.",
      b_less_than_three_years:
        "En España, debes tener el permiso de categoría B desde hace al menos 3 años para conducir un scooter de 125 cc. Tu categoría B todavía no cumple este requisito.",
      no_compatible_category:
        "Se requiere un permiso A, A1, A2 válido o un permiso B con al menos 3 años de antigüedad.",
      category_not_yet_valid:
        "La categoría detectada del permiso de conducir todavía no es válida.",
      manual_review:
        "Documentos recibidos. NEXA Rentals los confirmará manualmente antes de la recogida.",
      accepted: "Documentos aceptados.",
    },
  },

  de: {
    scanner: "Sicherer NEXA-Scanner",
    step: "Schritt",
    openingCamera: "Rückkamera wird geöffnet...",
    alignDocument: "Richte das vollständige Dokument im Rahmen aus",
    tooDark: "Zu dunkel — gehe zu besserem Licht",
    tooMuchGlare: "Zu starke Spiegelung — neige das Dokument leicht",
    holdStill: "Halte das Dokument ruhig",
    moveCloser: "Gehe etwas näher heran und zeige alle vier Ecken",
    automaticReady: "Klare Position — automatische Aufnahme bereit",
    capturing: "Automatische Aufnahme...",
    licenceCaptured: "Führerschein erfasst",
    chooseIdentity: "Wähle dein Ausweisdokument",
    identityHelp:
      "Verwende das Originaldokument, das du bei der Abholung mitbringst.",
    idCard: "Personalausweis",
    frontAndBack: "Vorder- und Rückseite",
    passport: "Reisepass",
    photoPage: "Fotoseite",
    openingScanner: "Sicherer Scanner wird geöffnet",
    reviewingDocuments: "Dokumente werden geprüft",
    connecting: "Verbindung mit deiner Buchung...",
    checking:
      "Schärfe, Ausstellungs- und Ablaufdaten sowie Führerscheinklassen werden geprüft...",
    retakeTitle: "Bitte Foto erneut aufnehmen",
    rejectedTitle: "Führerschein kann nicht akzeptiert werden",
    retakeButton: "Angefordertes Foto wiederholen",
    scanAgain: "Erneut scannen",
    returnCheckout: "Zurück zur Kasse",
    documentsReceived: "Dokumente erhalten",
    verificationComplete: "Überprüfung abgeschlossen",
    manualComplete:
      "Deine Buchung kann fortgesetzt werden. NEXA Rentals prüft die Dokumente vor der Abholung manuell.",
    acceptedComplete:
      "Deine Dokumente haben die automatischen Prüfungen bestanden und wurden mit deiner Buchung verknüpft.",
    returningCheckout: "Zurück zur Kasse...",
    returnBooking: "Du kannst zum Buchungsbildschirm zurückkehren",
    attention: "Scanner benötigt Aufmerksamkeit",
    takePhotoInstead: "Stattdessen Foto aufnehmen",
    tryAgain: "Erneut versuchen",
    continueManual: "Zur manuellen Prüfung fortfahren",
    missingSession: "Die sichere Verifizierungssitzung fehlt.",
    sessionError:
      "Diese Verifizierungssitzung ist nicht verfügbar. Starte erneut an der Kasse.",
    updateError: "Die Verifizierungssitzung konnte nicht aktualisiert werden.",
    cameraUnsupported: "Dieser Browser unterstützt keinen Live-Kamerazugriff.",
    cameraDenied:
      "Die Kameraberechtigung wurde blockiert. Erlaube den Zugriff oder nimm ein Foto auf.",
    cameraError: "Die Rückkamera konnte nicht geöffnet werden.",
    captureError: "Das Dokumentfoto konnte nicht aufgenommen werden.",
    invalidPhoto: "Bitte wähle oder fotografiere ein lesbares Bild.",
    analysisError:
      "Die Dokumente konnten nicht analysiert werden. Bitte versuche es erneut.",
    saveError: "Die Dokumentfotos konnten nicht gespeichert werden.",
    steps: {
      dlFront: {
        eyebrow: "Führerschein · Vorderseite",
        title: "Vorderseite in den Rahmen legen",
        instruction:
          "Zeige alle vier Ecken, vermeide Spiegelungen und halte den Führerschein ruhig.",
      },
      dlBack: {
        eyebrow: "Führerschein · Rückseite",
        title: "Jetzt die Rückseite scannen",
        instruction:
          "Drehe den Führerschein um und halte die gesamte Karte im Rahmen.",
      },
      idFront: {
        eyebrow: "Ausweisdokument · Vorderseite",
        title: "Dokument in den Rahmen legen",
        instruction:
          "Zeige die vollständige Pass-Fotoseite oder die Vorderseite deines Personalausweises.",
      },
      idBack: {
        eyebrow: "Personalausweis · Rückseite",
        title: "Jetzt die Rückseite scannen",
        instruction:
          "Zeige alle Ränder und achte darauf, dass die kleine Schrift scharf ist.",
      },
    },
    decisions: {
      retake:
        "Ein oder mehrere Fotos sind unklar. Bitte nimm das angeforderte Bild erneut auf.",
      licence_expired: "Der Führerschein scheint abgelaufen zu sein.",
      identity_expired:
        "Der Reisepass oder Ausweis scheint abgelaufen zu sein.",
      b_less_than_three_years:
        "In Spanien muss ein Führerschein der Klasse B seit mindestens 3 Jahren bestehen, um einen 125-ccm-Roller zu fahren. Deine Klasse B erfüllt diese Voraussetzung noch nicht.",
      no_compatible_category:
        "Erforderlich ist ein gültiger Führerschein A, A1, A2 oder Klasse B seit mindestens 3 Jahren.",
      category_not_yet_valid:
        "Die erkannte Führerscheinklasse ist noch nicht gültig.",
      manual_review:
        "Dokumente erhalten. NEXA Rentals prüft sie vor der Abholung manuell.",
      accepted: "Dokumente akzeptiert.",
    },
  },

  fr: {
    scanner: "Scanner sécurisé NEXA",
    step: "Étape",
    openingCamera: "Ouverture de la caméra arrière...",
    alignDocument: "Alignez le document entier dans le cadre",
    tooDark: "Trop sombre — rapprochez-vous d’une meilleure lumière",
    tooMuchGlare: "Trop de reflet — inclinez légèrement le document",
    holdStill: "Maintenez le document immobile",
    moveCloser:
      "Rapprochez-vous légèrement et gardez les quatre coins visibles",
    automaticReady: "Position nette — capture automatique prête",
    capturing: "Capture automatique...",
    licenceCaptured: "Permis de conduire capturé",
    chooseIdentity: "Choisissez votre pièce d’identité",
    identityHelp:
      "Utilisez le document original que vous apporterez lors du retrait du scooter.",
    idCard: "Carte d’identité",
    frontAndBack: "Recto et verso",
    passport: "Passeport",
    photoPage: "Page avec photo",
    openingScanner: "Ouverture du scanner sécurisé",
    reviewingDocuments: "Vérification de vos documents",
    connecting: "Connexion à votre réservation...",
    checking:
      "Vérification de la netteté, des dates de délivrance et d’expiration, et des catégories du permis...",
    retakeTitle: "Veuillez reprendre une photo",
    rejectedTitle: "Le permis ne peut pas être accepté",
    retakeButton: "Reprendre la photo demandée",
    scanAgain: "Scanner à nouveau",
    returnCheckout: "Retourner au paiement",
    documentsReceived: "Documents reçus",
    verificationComplete: "Vérification terminée",
    manualComplete:
      "Votre réservation peut continuer. NEXA Rentals confirmera manuellement les documents avant le retrait.",
    acceptedComplete:
      "Vos documents ont passé les contrôles automatiques et ont été associés à votre réservation.",
    returningCheckout: "Retour au paiement...",
    returnBooking: "Vous pouvez revenir à l’écran de réservation",
    attention: "Le scanner nécessite votre attention",
    takePhotoInstead: "Prendre une photo",
    tryAgain: "Réessayer",
    continueManual: "Continuer pour vérification manuelle",
    missingSession: "La session de vérification sécurisée est manquante.",
    sessionError:
      "Cette session de vérification n’est pas disponible. Recommencez depuis le paiement.",
    updateError: "Impossible de mettre à jour la session de vérification.",
    cameraUnsupported:
      "Ce navigateur ne prend pas en charge l’accès direct à la caméra.",
    cameraDenied:
      "L’autorisation de la caméra a été bloquée. Autorisez l’accès ou prenez une photo.",
    cameraError: "Impossible d’ouvrir la caméra arrière.",
    captureError: "Impossible de capturer la photo du document.",
    invalidPhoto: "Veuillez sélectionner ou prendre une image lisible.",
    analysisError:
      "Les documents n’ont pas pu être analysés. Veuillez réessayer.",
    saveError: "Les photos des documents n’ont pas pu être enregistrées.",
    steps: {
      dlFront: {
        eyebrow: "Permis de conduire · Recto",
        title: "Placez le recto dans le cadre",
        instruction:
          "Gardez les quatre coins visibles, évitez les reflets et tenez le permis immobile.",
      },
      dlBack: {
        eyebrow: "Permis de conduire · Verso",
        title: "Scannez maintenant le verso",
        instruction:
          "Retournez le permis et gardez la carte entière dans le cadre.",
      },
      idFront: {
        eyebrow: "Pièce d’identité · Recto",
        title: "Placez le document dans le cadre",
        instruction:
          "Montrez toute la page photo du passeport ou le recto de votre carte d’identité.",
      },
      idBack: {
        eyebrow: "Carte d’identité · Verso",
        title: "Scannez maintenant le verso",
        instruction:
          "Gardez tous les bords visibles et assurez-vous que les petits caractères sont nets.",
      },
    },
    decisions: {
      retake:
        "Une ou plusieurs photos ne sont pas nettes. Veuillez reprendre l’image demandée.",
      licence_expired: "Le permis de conduire semble expiré.",
      identity_expired: "Le passeport ou la pièce d’identité semble expiré.",
      b_less_than_three_years:
        "En Espagne, le permis de catégorie B doit être détenu depuis au moins 3 ans pour conduire un scooter de 125 cm³. Votre catégorie B ne remplit pas encore cette condition.",
      no_compatible_category:
        "Un permis A, A1, A2 valide ou un permis B détenu depuis au moins 3 ans est requis.",
      category_not_yet_valid:
        "La catégorie de permis détectée n’est pas encore valide.",
      manual_review:
        "Documents reçus. NEXA Rentals les confirmera manuellement avant le retrait.",
      accepted: "Documents acceptés.",
    },
  },

  it: {
    scanner: "Scanner sicuro NEXA",
    step: "Passaggio",
    openingCamera: "Apertura della fotocamera posteriore...",
    alignDocument: "Allinea l’intero documento dentro la cornice",
    tooDark: "Troppo buio — spostati verso una luce migliore",
    tooMuchGlare: "Troppo riflesso — inclina leggermente il documento",
    holdStill: "Tieni fermo il documento",
    moveCloser:
      "Avvicinati leggermente e mantieni visibili tutti e quattro gli angoli",
    automaticReady: "Posizione nitida — acquisizione automatica pronta",
    capturing: "Acquisizione automatica...",
    licenceCaptured: "Patente acquisita",
    chooseIdentity: "Scegli il documento d’identità",
    identityHelp:
      "Usa il documento originale che porterai al ritiro dello scooter.",
    idCard: "Carta d’identità",
    frontAndBack: "Fronte e retro",
    passport: "Passaporto",
    photoPage: "Pagina con foto",
    openingScanner: "Apertura dello scanner sicuro",
    reviewingDocuments: "Verifica dei documenti",
    connecting: "Collegamento alla prenotazione...",
    checking:
      "Controllo di nitidezza, date di rilascio e scadenza e categorie della patente...",
    retakeTitle: "Ripeti la foto",
    rejectedTitle: "La patente non può essere accettata",
    retakeButton: "Ripeti la foto richiesta",
    scanAgain: "Scansiona di nuovo",
    returnCheckout: "Torna al pagamento",
    documentsReceived: "Documenti ricevuti",
    verificationComplete: "Verifica completata",
    manualComplete:
      "La prenotazione può continuare. NEXA Rentals confermerà manualmente i documenti prima del ritiro.",
    acceptedComplete:
      "I documenti hanno superato i controlli automatici e sono stati collegati alla prenotazione.",
    returningCheckout: "Ritorno al pagamento...",
    returnBooking: "Puoi tornare alla schermata di prenotazione",
    attention: "Lo scanner richiede attenzione",
    takePhotoInstead: "Scatta una foto",
    tryAgain: "Riprova",
    continueManual: "Continua per la verifica manuale",
    missingSession: "Manca la sessione di verifica sicura.",
    sessionError:
      "Questa sessione di verifica non è disponibile. Ricomincia dal pagamento.",
    updateError: "Impossibile aggiornare la sessione di verifica.",
    cameraUnsupported:
      "Questo browser non supporta l’accesso diretto alla fotocamera.",
    cameraDenied:
      "L’autorizzazione della fotocamera è stata bloccata. Consenti l’accesso o scatta una foto.",
    cameraError: "Impossibile aprire la fotocamera posteriore.",
    captureError: "Impossibile acquisire la foto del documento.",
    invalidPhoto: "Seleziona o scatta un’immagine leggibile.",
    analysisError: "Impossibile analizzare i documenti. Riprova.",
    saveError: "Impossibile salvare le foto dei documenti.",
    steps: {
      dlFront: {
        eyebrow: "Patente · Fronte",
        title: "Posiziona il fronte nella cornice",
        instruction:
          "Mantieni visibili tutti e quattro gli angoli, evita i riflessi e tieni ferma la patente.",
      },
      dlBack: {
        eyebrow: "Patente · Retro",
        title: "Ora scansiona il retro",
        instruction:
          "Gira la patente e mantieni l’intera tessera dentro la cornice.",
      },
      idFront: {
        eyebrow: "Documento d’identità · Fronte",
        title: "Posiziona il documento nella cornice",
        instruction:
          "Mostra l’intera pagina con foto del passaporto o il fronte della carta d’identità.",
      },
      idBack: {
        eyebrow: "Carta d’identità · Retro",
        title: "Ora scansiona il retro",
        instruction:
          "Mantieni visibili tutti i bordi e assicurati che il testo piccolo sia nitido.",
      },
    },
    decisions: {
      retake: "Una o più foto non sono nitide. Ripeti l’immagine richiesta.",
      licence_expired: "La patente sembra scaduta.",
      identity_expired:
        "Il passaporto o il documento d’identità sembra scaduto.",
      b_less_than_three_years:
        "In Spagna, la patente di categoria B deve essere posseduta da almeno 3 anni per guidare uno scooter 125 cc. La tua categoria B non soddisfa ancora questo requisito.",
      no_compatible_category:
        "È richiesta una patente A, A1, A2 valida oppure una patente B posseduta da almeno 3 anni.",
      category_not_yet_valid:
        "La categoria di patente rilevata non è ancora valida.",
      manual_review:
        "Documenti ricevuti. NEXA Rentals li confermerà manualmente prima del ritiro.",
      accepted: "Documenti accettati.",
    },
  },

  pt: {
    scanner: "Scanner seguro NEXA",
    step: "Passo",
    openingCamera: "A abrir a câmara traseira...",
    alignDocument: "Alinhe o documento completo dentro da moldura",
    tooDark: "Demasiado escuro — procure melhor iluminação",
    tooMuchGlare: "Demasiado reflexo — incline ligeiramente o documento",
    holdStill: "Mantenha o documento imóvel",
    moveCloser: "Aproxime ligeiramente e mantenha os quatro cantos visíveis",
    automaticReady: "Posição nítida — captura automática pronta",
    capturing: "A capturar automaticamente...",
    licenceCaptured: "Carta de condução capturada",
    chooseIdentity: "Escolha o documento de identidade",
    identityHelp:
      "Use o documento original que irá trazer ao levantar a scooter.",
    idCard: "Cartão de identidade",
    frontAndBack: "Frente e verso",
    passport: "Passaporte",
    photoPage: "Página com fotografia",
    openingScanner: "A abrir o scanner seguro",
    reviewingDocuments: "A verificar os documentos",
    connecting: "A ligar à sua reserva...",
    checking:
      "A verificar nitidez, datas de emissão e validade e categorias da carta...",
    retakeTitle: "Volte a tirar a fotografia",
    rejectedTitle: "A carta não pode ser aceite",
    retakeButton: "Repetir a fotografia pedida",
    scanAgain: "Digitalizar novamente",
    returnCheckout: "Voltar ao pagamento",
    documentsReceived: "Documentos recebidos",
    verificationComplete: "Verificação concluída",
    manualComplete:
      "A reserva pode continuar. A NEXA Rentals confirmará os documentos manualmente antes do levantamento.",
    acceptedComplete:
      "Os documentos passaram nas verificações automáticas e foram associados à reserva.",
    returningCheckout: "A voltar ao pagamento...",
    returnBooking: "Pode voltar ao ecrã de reserva",
    attention: "O scanner precisa de atenção",
    takePhotoInstead: "Tirar uma fotografia",
    tryAgain: "Tentar novamente",
    continueManual: "Continuar para revisão manual",
    missingSession: "Falta a sessão segura de verificação.",
    sessionError:
      "Esta sessão de verificação não está disponível. Recomece a partir do pagamento.",
    updateError: "Não foi possível atualizar a sessão de verificação.",
    cameraUnsupported: "Este navegador não suporta acesso direto à câmara.",
    cameraDenied:
      "A permissão da câmara foi bloqueada. Permita o acesso ou tire uma fotografia.",
    cameraError: "Não foi possível abrir a câmara traseira.",
    captureError: "Não foi possível capturar a fotografia do documento.",
    invalidPhoto: "Selecione ou tire uma imagem legível.",
    analysisError: "Não foi possível analisar os documentos. Tente novamente.",
    saveError: "Não foi possível guardar as fotografias dos documentos.",
    steps: {
      dlFront: {
        eyebrow: "Carta de condução · Frente",
        title: "Coloque a frente dentro da moldura",
        instruction:
          "Mantenha os quatro cantos visíveis, evite reflexos e segure a carta sem mexer.",
      },
      dlBack: {
        eyebrow: "Carta de condução · Verso",
        title: "Agora digitalize o verso",
        instruction:
          "Vire a carta e mantenha o cartão completo dentro da moldura.",
      },
      idFront: {
        eyebrow: "Documento de identidade · Frente",
        title: "Coloque o documento dentro da moldura",
        instruction:
          "Mostre a página completa do passaporte com fotografia ou a frente do cartão de identidade.",
      },
      idBack: {
        eyebrow: "Cartão de identidade · Verso",
        title: "Agora digitalize o verso",
        instruction:
          "Mantenha todas as margens visíveis e certifique-se de que o texto pequeno está nítido.",
      },
    },
    decisions: {
      retake:
        "Uma ou mais fotografias não estão nítidas. Repita a imagem pedida.",
      licence_expired: "A carta de condução parece estar caducada.",
      identity_expired:
        "O passaporte ou documento de identidade parece estar caducado.",
      b_less_than_three_years:
        "Em Espanha, é necessário possuir a carta de categoria B há pelo menos 3 anos para conduzir uma scooter de 125 cc. A sua categoria B ainda não cumpre este requisito.",
      no_compatible_category:
        "É necessária uma carta A, A1 ou A2 válida, ou uma carta B com pelo menos 3 anos.",
      category_not_yet_valid:
        "A categoria detetada da carta ainda não é válida.",
      manual_review:
        "Documentos recebidos. A NEXA Rentals irá confirmá-los manualmente antes do levantamento.",
      accepted: "Documentos aceites.",
    },
  },