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
  outcome:
    | "accepted"
    | "retake"
    | "manual_review"
    | "rejected";
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
    alignDocument:
      "Align the complete document inside the frame",
    tooDark:
      "Too dark — move toward better light",
    tooMuchGlare:
      "Too much glare — tilt the document slightly",
    holdStill: "Hold the document still",
    moveCloser:
      "Move slightly closer and keep all four corners visible",
    automaticReady:
      "Clear position — automatic capture is ready",
    capturing:
      "Capturing automatically...",
    licenceCaptured:
      "Driving licence captured",
    chooseIdentity:
      "Choose your identity document",
    identityHelp:
      "Use the original document you will bring when collecting the scooter.",
    idCard: "ID card",
    frontAndBack: "Front and back",
    passport: "Passport",
    photoPage: "Photo page",
    openingScanner:
      "Opening secure scanner",
    reviewingDocuments:
      "Reviewing your documents",
    connecting:
      "Connecting to your booking...",
    checking:
      "Checking clarity, issue dates, expiry dates and licence categories...",
    retakeTitle:
      "Please retake a photo",
    rejectedTitle:
      "Licence cannot be accepted",
    retakeButton:
      "Retake requested photo",
    scanAgain: "Scan again",
    returnCheckout:
      "Return to checkout",
    documentsReceived:
      "Documents received",
    verificationComplete:
      "Verification complete",
    manualComplete:
      "Your booking can continue. NEXA Rentals will confirm the documents manually before pickup.",
    acceptedComplete:
      "Your documents passed the automatic checks and were connected to your booking.",
    returningCheckout:
      "Returning to checkout...",
    returnBooking:
      "You can return to the booking screen",
    attention:
      "Scanner needs attention",
    takePhotoInstead:
      "Take photo instead",
    tryAgain: "Try again",
    continueManual:
      "Continue for manual review",
    missingSession:
      "The secure verification session is missing.",
    sessionError:
      "This verification session is unavailable. Please restart from checkout.",
    updateError:
      "Could not update the verification session.",
    cameraUnsupported:
      "This browser does not support live camera access.",
    cameraDenied:
      "Camera permission was blocked. Allow camera access in your browser, or take a photo instead.",
    cameraError:
      "Could not open the rear camera.",
    captureError:
      "Could not capture the document photograph.",
    invalidPhoto:
      "Please select or take a readable image.",
    analysisError:
      "The documents could not be analyzed. Please try again.",
    saveError:
      "The document photographs could not be saved.",
    steps: {
      dlFront: {
        eyebrow:
          "Driving licence · Front",
        title:
          "Place the front inside the frame",
        instruction:
          "Keep all four corners visible. Avoid glare and hold the licence steady.",
      },
      dlBack: {
        eyebrow:
          "Driving licence · Back",
        title:
          "Now scan the back",
        instruction:
          "Turn the licence over and keep the complete card inside the frame.",
      },
      idFront: {
        eyebrow:
          "Identity document · Front",
        title:
          "Place the document inside the frame",
        instruction:
          "Show the complete passport photo page or the front of your ID card.",
      },
      idBack: {
        eyebrow:
          "Identity card · Back",
        title:
          "Now scan the back",
        instruction:
          "Keep every edge visible and make sure the small text is sharp.",
      },
    },
    decisions: {
      retake:
        "One or more photographs are unclear. Please retake the requested image.",
      licence_expired:
        "The driving licence appears to be expired.",
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
      accepted:
        "Documents accepted.",
    },
  },

  es: {
    scanner:
      "Escáner seguro de NEXA",
    step: "Paso",
    openingCamera:
      "Abriendo la cámara trasera...",
    alignDocument:
      "Coloca el documento completo dentro del marco",
    tooDark:
      "Está demasiado oscuro — busca más luz",
    tooMuchGlare:
      "Hay demasiado reflejo — inclina un poco el documento",
    holdStill:
      "Mantén el documento quieto",
    moveCloser:
      "Acércalo un poco y mantén visibles las cuatro esquinas",
    automaticReady:
      "Posición clara — la captura automática está lista",
    capturing:
      "Capturando automáticamente...",
    licenceCaptured:
      "Permiso de conducir capturado",
    chooseIdentity:
      "Elige tu documento de identidad",
    identityHelp:
      "Usa el documento original que traerás al recoger el scooter.",
    idCard:
      "Documento de identidad",
    frontAndBack:
      "Anverso y reverso",
    passport: "Pasaporte",
    photoPage:
      "Página con foto",
    openingScanner:
      "Abriendo el escáner seguro",
    reviewingDocuments:
      "Revisando tus documentos",
    connecting:
      "Conectando con tu reserva...",
    checking:
      "Comprobando nitidez, fechas de expedición y caducidad, y categorías del permiso...",
    retakeTitle:
      "Vuelve a hacer la foto",
    rejectedTitle:
      "No se puede aceptar el permiso",
    retakeButton:
      "Repetir la foto solicitada",
    scanAgain:
      "Escanear de nuevo",
    returnCheckout:
      "Volver al pago",
    documentsReceived:
      "Documentos recibidos",
    verificationComplete:
      "Verificación completada",
    manualComplete:
      "Tu reserva puede continuar. NEXA Rentals confirmará los documentos manualmente antes de la recogida.",
    acceptedComplete:
      "Tus documentos han superado las comprobaciones automáticas y se han vinculado a tu reserva.",
    returningCheckout:
      "Volviendo al pago...",
    returnBooking:
      "Puedes volver a la pantalla de reserva",
    attention:
      "El escáner necesita atención",
    takePhotoInstead:
      "Hacer una foto",
    tryAgain:
      "Intentar de nuevo",
    continueManual:
      "Continuar para revisión manual",
    missingSession:
      "Falta la sesión segura de verificación.",
    sessionError:
      "Esta sesión de verificación no está disponible. Reinicia el proceso desde el pago.",
    updateError:
      "No se pudo actualizar la sesión de verificación.",
    cameraUnsupported:
      "Este navegador no admite el acceso a la cámara en directo.",
    cameraDenied:
      "Se ha bloqueado el permiso de cámara. Permite el acceso o haz una foto.",
    cameraError:
      "No se pudo abrir la cámara trasera.",
    captureError:
      "No se pudo capturar la foto del documento.",
    invalidPhoto:
      "Selecciona o toma una imagen legible.",
    analysisError:
      "No se pudieron analizar los documentos. Inténtalo de nuevo.",
    saveError:
      "No se pudieron guardar las fotos de los documentos.",
    steps: {
      dlFront: {
        eyebrow:
          "Permiso de conducir · Anverso",
        title:
          "Coloca el anverso dentro del marco",
        instruction:
          "Mantén visibles las cuatro esquinas, evita reflejos y no muevas el permiso.",
      },
      dlBack: {
        eyebrow:
          "Permiso de conducir · Reverso",
        title:
          "Ahora escanea el reverso",
        instruction:
          "Dale la vuelta y mantén la tarjeta completa dentro del marco.",
      },
      idFront: {
        eyebrow:
          "Documento de identidad · Anverso",
        title:
          "Coloca el documento dentro del marco",
        instruction:
          "Muestra completa la página con foto del pasaporte o el anverso del documento de identidad.",
      },
      idBack: {
        eyebrow:
          "Documento de identidad · Reverso",
        title:
          "Ahora escanea el reverso",
        instruction:
          "Mantén todos los bordes visibles y asegúrate de que el texto pequeño esté nítido.",
      },
    },
    decisions: {
      retake:
        "Una o varias fotos no están claras. Repite la imagen solicitada.",
      licence_expired:
        "El permiso de conducir parece estar caducado.",
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
      accepted:
        "Documentos aceptados.",
    },
  },

  de: {
    scanner:
      "Sicherer NEXA-Scanner",
    step: "Schritt",
    openingCamera:
      "Rückkamera wird geöffnet...",
    alignDocument:
      "Richte das vollständige Dokument im Rahmen aus",
    tooDark:
      "Zu dunkel — gehe zu besserem Licht",
    tooMuchGlare:
      "Zu starke Spiegelung — neige das Dokument leicht",
    holdStill:
      "Halte das Dokument ruhig",
    moveCloser:
      "Gehe etwas näher heran und zeige alle vier Ecken",
    automaticReady:
      "Klare Position — automatische Aufnahme bereit",
    capturing:
      "Automatische Aufnahme...",
    licenceCaptured:
      "Führerschein erfasst",
    chooseIdentity:
      "Wähle dein Ausweisdokument",
    identityHelp:
      "Verwende das Originaldokument, das du bei der Abholung mitbringst.",
    idCard:
      "Personalausweis",
    frontAndBack:
      "Vorder- und Rückseite",
    passport: "Reisepass",
    photoPage: "Fotoseite",
    openingScanner:
      "Sicherer Scanner wird geöffnet",
    reviewingDocuments:
      "Dokumente werden geprüft",
    connecting:
      "Verbindung mit deiner Buchung...",
    checking:
      "Schärfe, Ausstellungs- und Ablaufdaten sowie Führerscheinklassen werden geprüft...",
    retakeTitle:
      "Bitte Foto erneut aufnehmen",
    rejectedTitle:
      "Führerschein kann nicht akzeptiert werden",
    retakeButton:
      "Angefordertes Foto wiederholen",
    scanAgain:
      "Erneut scannen",
    returnCheckout:
      "Zurück zur Kasse",
    documentsReceived:
      "Dokumente erhalten",
    verificationComplete:
      "Überprüfung abgeschlossen",
    manualComplete:
      "Deine Buchung kann fortgesetzt werden. NEXA Rentals prüft die Dokumente vor der Abholung manuell.",
    acceptedComplete:
      "Deine Dokumente haben die automatischen Prüfungen bestanden und wurden mit deiner Buchung verknüpft.",
    returningCheckout:
      "Zurück zur Kasse...",
    returnBooking:
      "Du kannst zum Buchungsbildschirm zurückkehren",
    attention:
      "Scanner benötigt Aufmerksamkeit",
    takePhotoInstead:
      "Stattdessen Foto aufnehmen",
    tryAgain:
      "Erneut versuchen",
    continueManual:
      "Zur manuellen Prüfung fortfahren",
    missingSession:
      "Die sichere Verifizierungssitzung fehlt.",
    sessionError:
      "Diese Verifizierungssitzung ist nicht verfügbar. Starte erneut an der Kasse.",
    updateError:
      "Die Verifizierungssitzung konnte nicht aktualisiert werden.",
    cameraUnsupported:
      "Dieser Browser unterstützt keinen Live-Kamerazugriff.",
    cameraDenied:
      "Die Kameraberechtigung wurde blockiert. Erlaube den Zugriff oder nimm ein Foto auf.",
    cameraError:
      "Die Rückkamera konnte nicht geöffnet werden.",
    captureError:
      "Das Dokumentfoto konnte nicht aufgenommen werden.",
    invalidPhoto:
      "Bitte wähle oder fotografiere ein lesbares Bild.",
    analysisError:
      "Die Dokumente konnten nicht analysiert werden. Bitte versuche es erneut.",
    saveError:
      "Die Dokumentfotos konnten nicht gespeichert werden.",
    steps: {
      dlFront: {
        eyebrow:
          "Führerschein · Vorderseite",
        title:
          "Vorderseite in den Rahmen legen",
        instruction:
          "Zeige alle vier Ecken, vermeide Spiegelungen und halte den Führerschein ruhig.",
      },
      dlBack: {
        eyebrow:
          "Führerschein · Rückseite",
        title:
          "Jetzt die Rückseite scannen",
        instruction:
          "Drehe den Führerschein um und halte die gesamte Karte im Rahmen.",
      },
      idFront: {
        eyebrow:
          "Ausweisdokument · Vorderseite",
        title:
          "Dokument in den Rahmen legen",
        instruction:
          "Zeige die vollständige Pass-Fotoseite oder die Vorderseite deines Personalausweises.",
      },
      idBack: {
        eyebrow:
          "Personalausweis · Rückseite",
        title:
          "Jetzt die Rückseite scannen",
        instruction:
          "Zeige alle Ränder und achte darauf, dass die kleine Schrift scharf ist.",
      },
    },
    decisions: {
      retake:
        "Ein oder mehrere Fotos sind unklar. Bitte nimm das angeforderte Bild erneut auf.",
      licence_expired:
        "Der Führerschein scheint abgelaufen zu sein.",
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
      accepted:
        "Dokumente akzeptiert.",
    },
  },

  fr: {
    scanner:
      "Scanner sécurisé NEXA",
    step: "Étape",
    openingCamera:
      "Ouverture de la caméra arrière...",
    alignDocument:
      "Alignez le document entier dans le cadre",
    tooDark:
      "Trop sombre — rapprochez-vous d’une meilleure lumière",
    tooMuchGlare:
      "Trop de reflet — inclinez légèrement le document",
    holdStill:
      "Maintenez le document immobile",
    moveCloser:
      "Rapprochez-vous légèrement et gardez les quatre coins visibles",
    automaticReady:
      "Position nette — capture automatique prête",
    capturing:
      "Capture automatique...",
    licenceCaptured:
      "Permis de conduire capturé",
    chooseIdentity:
      "Choisissez votre pièce d’identité",
    identityHelp:
      "Utilisez le document original que vous apporterez lors du retrait du scooter.",
    idCard:
      "Carte d’identité",
    frontAndBack:
      "Recto et verso",
    passport: "Passeport",
    photoPage:
      "Page avec photo",
    openingScanner:
      "Ouverture du scanner sécurisé",
    reviewingDocuments:
      "Vérification de vos documents",
    connecting:
      "Connexion à votre réservation...",
    checking:
      "Vérification de la netteté, des dates de délivrance et d’expiration, et des catégories du permis...",
    retakeTitle:
      "Veuillez reprendre une photo",
    rejectedTitle:
      "Le permis ne peut pas être accepté",
    retakeButton:
      "Reprendre la photo demandée",
    scanAgain:
      "Scanner à nouveau",
    returnCheckout:
      "Retourner au paiement",
    documentsReceived:
      "Documents reçus",
    verificationComplete:
      "Vérification terminée",
    manualComplete:
      "Votre réservation peut continuer. NEXA Rentals confirmera manuellement les documents avant le retrait.",
    acceptedComplete:
      "Vos documents ont passé les contrôles automatiques et ont été associés à votre réservation.",
    returningCheckout:
      "Retour au paiement...",
    returnBooking:
      "Vous pouvez revenir à l’écran de réservation",
    attention:
      "Le scanner nécessite votre attention",
    takePhotoInstead:
      "Prendre une photo",
    tryAgain: "Réessayer",
    continueManual:
      "Continuer pour vérification manuelle",
    missingSession:
      "La session de vérification sécurisée est manquante.",
    sessionError:
      "Cette session de vérification n’est pas disponible. Recommencez depuis le paiement.",
    updateError:
      "Impossible de mettre à jour la session de vérification.",
    cameraUnsupported:
      "Ce navigateur ne prend pas en charge l’accès direct à la caméra.",
    cameraDenied:
      "L’autorisation de la caméra a été bloquée. Autorisez l’accès ou prenez une photo.",
    cameraError:
      "Impossible d’ouvrir la caméra arrière.",
    captureError:
      "Impossible de capturer la photo du document.",
    invalidPhoto:
      "Veuillez sélectionner ou prendre une image lisible.",
    analysisError:
      "Les documents n’ont pas pu être analysés. Veuillez réessayer.",
    saveError:
      "Les photos des documents n’ont pas pu être enregistrées.",
    steps: {
      dlFront: {
        eyebrow:
          "Permis de conduire · Recto",
        title:
          "Placez le recto dans le cadre",
        instruction:
          "Gardez les quatre coins visibles, évitez les reflets et tenez le permis immobile.",
      },
      dlBack: {
        eyebrow:
          "Permis de conduire · Verso",
        title:
          "Scannez maintenant le verso",
        instruction:
          "Retournez le permis et gardez la carte entière dans le cadre.",
      },
      idFront: {
        eyebrow:
          "Pièce d’identité · Recto",
        title:
          "Placez le document dans le cadre",
        instruction:
          "Montrez toute la page photo du passeport ou le recto de votre carte d’identité.",
      },
      idBack: {
        eyebrow:
          "Carte d’identité · Verso",
        title:
          "Scannez maintenant le verso",
        instruction:
          "Gardez tous les bords visibles et assurez-vous que les petits caractères sont nets.",
      },
    },
    decisions: {
      retake:
        "Une ou plusieurs photos ne sont pas nettes. Veuillez reprendre l’image demandée.",
      licence_expired:
        "Le permis de conduire semble expiré.",
      identity_expired:
        "Le passeport ou la pièce d’identité semble expiré.",
      b_less_than_three_years:
        "En Espagne, le permis de catégorie B doit être détenu depuis au moins 3 ans pour conduire un scooter de 125 cm³. Votre catégorie B ne remplit pas encore cette condition.",
      no_compatible_category:
        "Un permis A, A1, A2 valide ou un permis B détenu depuis au moins 3 ans est requis.",
      category_not_yet_valid:
        "La catégorie de permis détectée n’est pas encore valide.",
      manual_review:
        "Documents reçus. NEXA Rentals les confirmera manuellement avant le retrait.",
      accepted:
        "Documents acceptés.",
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
    automaticReady:
      "Posizione nitida — acquisizione automatica pronta",
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
      retake:
        "Una o più foto non sono nitide. Ripeti l’immagine richiesta.",
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
    tooMuchGlare:
      "Demasiado reflexo — incline ligeiramente o documento",
    holdStill: "Mantenha o documento imóvel",
    moveCloser:
      "Aproxime ligeiramente e mantenha os quatro cantos visíveis",
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
    updateError:
      "Não foi possível atualizar a sessão de verificação.",
    cameraUnsupported:
      "Este navegador não suporta acesso direto à câmara.",
    cameraDenied:
      "A permissão da câmara foi bloqueada. Permita o acesso ou tire uma fotografia.",
    cameraError: "Não foi possível abrir a câmara traseira.",
    captureError:
      "Não foi possível capturar a fotografia do documento.",
    invalidPhoto: "Selecione ou tire uma imagem legível.",
    analysisError:
      "Não foi possível analisar os documentos. Tente novamente.",
    saveError:
      "Não foi possível guardar as fotografias dos documentos.",
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
      licence_expired:
        "A carta de condução parece estar caducada.",
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

  sv: {
    scanner: "NEXA säker skanner",
    step: "Steg",
    openingCamera: "Öppnar bakre kameran...",
    alignDocument: "Placera hela dokumentet inom ramen",
    tooDark: "För mörkt — gå till bättre ljus",
    tooMuchGlare: "För mycket blänk — vinkla dokumentet lite",
    holdStill: "Håll dokumentet stilla",
    moveCloser:
      "Flytta lite närmare och håll alla fyra hörn synliga",
    automaticReady:
      "Tydlig position — automatisk bildtagning redo",
    capturing: "Tar bilden automatiskt...",
    licenceCaptured: "Körkort registrerat",
    chooseIdentity: "Välj identitetshandling",
    identityHelp:
      "Använd originalhandlingen som du tar med vid hämtning av skotern.",
    idCard: "ID-kort",
    frontAndBack: "Fram- och baksida",
    passport: "Pass",
    photoPage: "Fotosida",
    openingScanner: "Öppnar säker skanner",
    reviewingDocuments: "Kontrollerar dina dokument",
    connecting: "Ansluter till din bokning...",
    checking:
      "Kontrollerar skärpa, utfärdande- och utgångsdatum samt körkortskategorier...",
    retakeTitle: "Ta om fotografiet",
    rejectedTitle: "Körkortet kan inte godkännas",
    retakeButton: "Ta om begärt fotografi",
    scanAgain: "Skanna igen",
    returnCheckout: "Tillbaka till kassan",
    documentsReceived: "Dokument mottagna",
    verificationComplete: "Verifiering klar",
    manualComplete:
      "Din bokning kan fortsätta. NEXA Rentals kontrollerar dokumenten manuellt före hämtning.",
    acceptedComplete:
      "Dina dokument klarade de automatiska kontrollerna och kopplades till bokningen.",
    returningCheckout: "Återgår till kassan...",
    returnBooking: "Du kan återgå till bokningsskärmen",
    attention: "Skannern behöver din uppmärksamhet",
    takePhotoInstead: "Ta ett foto i stället",
    tryAgain: "Försök igen",
    continueManual: "Fortsätt till manuell kontroll",
    missingSession: "Den säkra verifieringssessionen saknas.",
    sessionError:
      "Verifieringssessionen är inte tillgänglig. Börja om från kassan.",
    updateError:
      "Verifieringssessionen kunde inte uppdateras.",
    cameraUnsupported:
      "Webbläsaren stöder inte direkt kameraåtkomst.",
    cameraDenied:
      "Kamerabehörigheten blockerades. Tillåt åtkomst eller ta ett foto.",
    cameraError: "Den bakre kameran kunde inte öppnas.",
    captureError: "Dokumentfotot kunde inte tas.",
    invalidPhoto: "Välj eller ta en läsbar bild.",
    analysisError:
      "Dokumenten kunde inte analyseras. Försök igen.",
    saveError: "Dokumentfotona kunde inte sparas.",
    steps: {
      dlFront: {
        eyebrow: "Körkort · Framsida",
        title: "Placera framsidan inom ramen",
        instruction:
          "Håll alla fyra hörn synliga, undvik blänk och håll körkortet stilla.",
      },
      dlBack: {
        eyebrow: "Körkort · Baksida",
        title: "Skanna nu baksidan",
        instruction:
          "Vänd körkortet och håll hela kortet inom ramen.",
      },
      idFront: {
        eyebrow: "Identitetshandling · Framsida",
        title: "Placera dokumentet inom ramen",
        instruction:
          "Visa hela passets fotosida eller framsidan av ditt ID-kort.",
      },
      idBack: {
        eyebrow: "ID-kort · Baksida",
        title: "Skanna nu baksidan",
        instruction:
          "Håll alla kanter synliga och se till att den lilla texten är skarp.",
      },
    },
    decisions: {
      retake:
        "Ett eller flera fotografier är otydliga. Ta om den begärda bilden.",
      licence_expired: "Körkortet verkar ha gått ut.",
      identity_expired:
        "Passet eller identitetshandlingen verkar ha gått ut.",
      b_less_than_three_years:
        "I Spanien måste ett körkort i kategori B ha innehafts i minst 3 år för att köra en 125-kubiksskoter. Din kategori B uppfyller ännu inte kravet.",
      no_compatible_category:
        "Ett giltigt A-, A1- eller A2-körkort, eller B-körkort som innehafts i minst 3 år, krävs.",
      category_not_yet_valid:
        "Den identifierade körkortskategorin är ännu inte giltig.",
      manual_review:
        "Dokumenten har tagits emot. NEXA Rentals kontrollerar dem manuellt före hämtning.",
      accepted: "Dokumenten godkändes.",
    },
  },

  da: {
    scanner: "NEXA sikker scanner",
    step: "Trin",
    openingCamera: "Åbner bagkamera...",
    alignDocument: "Placér hele dokumentet inden for rammen",
    tooDark: "For mørkt — gå hen til bedre lys",
    tooMuchGlare: "For meget genskin — vip dokumentet lidt",
    holdStill: "Hold dokumentet stille",
    moveCloser:
      "Gå lidt tættere på og hold alle fire hjørner synlige",
    automaticReady:
      "Tydelig placering — automatisk optagelse klar",
    capturing: "Tager billedet automatisk...",
    licenceCaptured: "Kørekort registreret",
    chooseIdentity: "Vælg identitetsdokument",
    identityHelp:
      "Brug det originale dokument, som du medbringer ved afhentning af scooteren.",
    idCard: "ID-kort",
    frontAndBack: "For- og bagside",
    passport: "Pas",
    photoPage: "Fotoside",
    openingScanner: "Åbner sikker scanner",
    reviewingDocuments: "Kontrollerer dine dokumenter",
    connecting: "Opretter forbindelse til din booking...",
    checking:
      "Kontrollerer skarphed, udstedelses- og udløbsdatoer samt kørekortkategorier...",
    retakeTitle: "Tag billedet igen",
    rejectedTitle: "Kørekortet kan ikke godkendes",
    retakeButton: "Tag det ønskede billede igen",
    scanAgain: "Scan igen",
    returnCheckout: "Tilbage til betaling",
    documentsReceived: "Dokumenter modtaget",
    verificationComplete: "Verifikation gennemført",
    manualComplete:
      "Din booking kan fortsætte. NEXA Rentals kontrollerer dokumenterne manuelt før afhentning.",
    acceptedComplete:
      "Dine dokumenter bestod de automatiske kontroller og blev knyttet til din booking.",
    returningCheckout: "Vender tilbage til betaling...",
    returnBooking: "Du kan vende tilbage til bookingskærmen",
    attention: "Scanneren kræver din opmærksomhed",
    takePhotoInstead: "Tag et billede i stedet",
    tryAgain: "Prøv igen",
    continueManual: "Fortsæt til manuel kontrol",
    missingSession: "Den sikre verifikationssession mangler.",
    sessionError:
      "Denne verifikationssession er ikke tilgængelig. Start igen fra betalingen.",
    updateError:
      "Verifikationssessionen kunne ikke opdateres.",
    cameraUnsupported:
      "Denne browser understøtter ikke direkte kameraadgang.",
    cameraDenied:
      "Kameratilladelsen blev blokeret. Tillad adgang eller tag et billede.",
    cameraError: "Bagkameraet kunne ikke åbnes.",
    captureError: "Dokumentbilledet kunne ikke tages.",
    invalidPhoto: "Vælg eller tag et læsbart billede.",
    analysisError:
      "Dokumenterne kunne ikke analyseres. Prøv igen.",
    saveError: "Dokumentbillederne kunne ikke gemmes.",
    steps: {
      dlFront: {
        eyebrow: "Kørekort · Forside",
        title: "Placér forsiden inden for rammen",
        instruction:
          "Hold alle fire hjørner synlige, undgå genskin og hold kørekortet stille.",
      },
      dlBack: {
        eyebrow: "Kørekort · Bagside",
        title: "Scan nu bagsiden",
        instruction:
          "Vend kørekortet og hold hele kortet inden for rammen.",
      },
      idFront: {
        eyebrow: "Identitetsdokument · Forside",
        title: "Placér dokumentet inden for rammen",
        instruction:
          "Vis hele passets fotoside eller forsiden af dit ID-kort.",
      },
      idBack: {
        eyebrow: "ID-kort · Bagside",
        title: "Scan nu bagsiden",
        instruction:
          "Hold alle kanter synlige, og sørg for at den lille tekst er skarp.",
      },
    },
    decisions: {
      retake:
        "Et eller flere billeder er uklare. Tag det ønskede billede igen.",
      licence_expired:
        "Kørekortet ser ud til at være udløbet.",
      identity_expired:
        "Passet eller identitetsdokumentet ser ud til at være udløbet.",
      b_less_than_three_years:
        "I Spanien skal et kategori B-kørekort have været gyldigt i mindst 3 år for at køre en 125cc-scooter. Din kategori B opfylder endnu ikke kravet.",
      no_compatible_category:
        "Der kræves et gyldigt A-, A1- eller A2-kørekort eller et B-kørekort, der har været gyldigt i mindst 3 år.",
      category_not_yet_valid:
        "Den registrerede kørekortkategori er endnu ikke gyldig.",
      manual_review:
        "Dokumenter modtaget. NEXA Rentals kontrollerer dem manuelt før afhentning.",
      accepted: "Dokumenter godkendt.",
    },
  },
    no: {
    scanner: "NEXA sikker skanner",
    step: "Trinn",
    openingCamera: "Åpner bakkamera...",
    alignDocument: "Plasser hele dokumentet innenfor rammen",
    tooDark: "For mørkt — gå til bedre lys",
    tooMuchGlare: "For mye gjenskinn — vipp dokumentet litt",
    holdStill: "Hold dokumentet stille",
    moveCloser:
      "Gå litt nærmere og hold alle fire hjørner synlige",
    automaticReady:
      "Tydelig plassering — automatisk bilde klar",
    capturing: "Tar bildet automatisk...",
    licenceCaptured: "Førerkort registrert",
    chooseIdentity: "Velg identitetsdokument",
    identityHelp:
      "Bruk originaldokumentet som du tar med ved henting av scooteren.",
    idCard: "ID-kort",
    frontAndBack: "For- og bakside",
    passport: "Pass",
    photoPage: "Fotoside",
    openingScanner: "Åpner sikker skanner",
    reviewingDocuments: "Kontrollerer dokumentene",
    connecting: "Kobler til bestillingen...",
    checking:
      "Kontrollerer skarphet, utstedelses- og utløpsdatoer samt førerkortklasser...",
    retakeTitle: "Ta bildet på nytt",
    rejectedTitle: "Førerkortet kan ikke godtas",
    retakeButton: "Ta det forespurte bildet på nytt",
    scanAgain: "Skann på nytt",
    returnCheckout: "Tilbake til betaling",
    documentsReceived: "Dokumenter mottatt",
    verificationComplete: "Verifisering fullført",
    manualComplete:
      "Bestillingen kan fortsette. NEXA Rentals kontrollerer dokumentene manuelt før henting.",
    acceptedComplete:
      "Dokumentene besto de automatiske kontrollene og ble koblet til bestillingen.",
    returningCheckout: "Går tilbake til betaling...",
    returnBooking: "Du kan gå tilbake til bestillingsskjermen",
    attention: "Skanneren trenger oppmerksomhet",
    takePhotoInstead: "Ta et bilde i stedet",
    tryAgain: "Prøv igjen",
    continueManual: "Fortsett til manuell kontroll",
    missingSession: "Den sikre verifiseringsøkten mangler.",
    sessionError:
      "Denne verifiseringsøkten er ikke tilgjengelig. Start på nytt fra betalingen.",
    updateError:
      "Verifiseringsøkten kunne ikke oppdateres.",
    cameraUnsupported:
      "Denne nettleseren støtter ikke direkte kameratilgang.",
    cameraDenied:
      "Kameratilgangen ble blokkert. Tillat tilgang eller ta et bilde.",
    cameraError:
      "Bakkameraet kunne ikke åpnes.",
    captureError:
      "Dokumentbildet kunne ikke tas.",
    invalidPhoto:
      "Velg eller ta et lesbart bilde.",
    analysisError:
      "Dokumentene kunne ikke analyseres. Prøv igjen.",
    saveError:
      "Dokumentbildene kunne ikke lagres.",
    steps: {
      dlFront: {
        eyebrow: "Førerkort · Forside",
        title: "Plasser forsiden innenfor rammen",
        instruction:
          "Hold alle fire hjørner synlige, unngå gjenskinn og hold førerkortet stille.",
      },
      dlBack: {
        eyebrow: "Førerkort · Bakside",
        title: "Skann nå baksiden",
        instruction:
          "Snu førerkortet og hold hele kortet innenfor rammen.",
      },
      idFront: {
        eyebrow: "Identitetsdokument · Forside",
        title: "Plasser dokumentet innenfor rammen",
        instruction:
          "Vis hele passets fotoside eller forsiden av ID-kortet.",
      },
      idBack: {
        eyebrow: "ID-kort · Bakside",
        title: "Skann nå baksiden",
        instruction:
          "Hold alle kanter synlige og sørg for at den lille teksten er skarp.",
      },
    },
    decisions: {
      retake:
        "Ett eller flere bilder er uklare. Ta det forespurte bildet på nytt.",
      licence_expired:
        "Førerkortet ser ut til å være utløpt.",
      identity_expired:
        "Passet eller identitetsdokumentet ser ut til å være utløpt.",
      b_less_than_three_years:
        "I Spania må et førerkort i kategori B ha vært gyldig i minst 3 år for å kjøre en 125cc-scooter. Din kategori B oppfyller ennå ikke kravet.",
      no_compatible_category:
        "Det kreves et gyldig A-, A1- eller A2-førerkort, eller et B-førerkort som har vært gyldig i minst 3 år.",
      category_not_yet_valid:
        "Den registrerte førerkortklassen er ennå ikke gyldig.",
      manual_review:
        "Dokumentene er mottatt. NEXA Rentals kontrollerer dem manuelt før henting.",
      accepted:
        "Dokumentene er godkjent.",
    },
  },

  nl: {
    scanner: "Beveiligde NEXA-scanner",
    step: "Stap",
    openingCamera: "Achtercamera openen...",
    alignDocument:
      "Plaats het volledige document binnen het kader",
    tooDark:
      "Te donker — ga naar beter licht",
    tooMuchGlare:
      "Te veel schittering — kantel het document iets",
    holdStill:
      "Houd het document stil",
    moveCloser:
      "Kom iets dichterbij en houd alle vier de hoeken zichtbaar",
    automaticReady:
      "Duidelijke positie — automatische opname gereed",
    capturing:
      "Automatisch vastleggen...",
    licenceCaptured:
      "Rijbewijs vastgelegd",
    chooseIdentity:
      "Kies je identiteitsdocument",
    identityHelp:
      "Gebruik het originele document dat je meeneemt bij het ophalen van de scooter.",
    idCard:
      "Identiteitskaart",
    frontAndBack:
      "Voor- en achterkant",
    passport:
      "Paspoort",
    photoPage:
      "Fotopagina",
    openingScanner:
      "Beveiligde scanner openen",
    reviewingDocuments:
      "Je documenten controleren",
    connecting:
      "Verbinden met je boeking...",
    checking:
      "Scherpte, afgifte- en vervaldatums en rijbewijscategorieën controleren...",
    retakeTitle:
      "Maak de foto opnieuw",
    rejectedTitle:
      "Rijbewijs kan niet worden geaccepteerd",
    retakeButton:
      "Gevraagde foto opnieuw maken",
    scanAgain:
      "Opnieuw scannen",
    returnCheckout:
      "Terug naar afrekenen",
    documentsReceived:
      "Documenten ontvangen",
    verificationComplete:
      "Verificatie voltooid",
    manualComplete:
      "Je boeking kan doorgaan. NEXA Rentals controleert de documenten handmatig vóór het ophalen.",
    acceptedComplete:
      "Je documenten zijn door de automatische controles gekomen en aan je boeking gekoppeld.",
    returningCheckout:
      "Terug naar afrekenen...",
    returnBooking:
      "Je kunt terugkeren naar het boekingsscherm",
    attention:
      "Scanner heeft aandacht nodig",
    takePhotoInstead:
      "Maak in plaats daarvan een foto",
    tryAgain:
      "Probeer opnieuw",
    continueManual:
      "Doorgaan voor handmatige controle",
    missingSession:
      "De beveiligde verificatiesessie ontbreekt.",
    sessionError:
      "Deze verificatiesessie is niet beschikbaar. Begin opnieuw bij het afrekenen.",
    updateError:
      "De verificatiesessie kon niet worden bijgewerkt.",
    cameraUnsupported:
      "Deze browser ondersteunt geen live cameratoegang.",
    cameraDenied:
      "Cameratoestemming is geblokkeerd. Sta toegang toe of maak een foto.",
    cameraError:
      "De achtercamera kon niet worden geopend.",
    captureError:
      "De documentfoto kon niet worden gemaakt.",
    invalidPhoto:
      "Selecteer of maak een leesbare afbeelding.",
    analysisError:
      "De documenten konden niet worden geanalyseerd. Probeer opnieuw.",
    saveError:
      "De documentfoto’s konden niet worden opgeslagen.",
    steps: {
      dlFront: {
        eyebrow:
          "Rijbewijs · Voorkant",
        title:
          "Plaats de voorkant binnen het kader",
        instruction:
          "Houd alle vier de hoeken zichtbaar, vermijd schittering en houd het rijbewijs stil.",
      },
      dlBack: {
        eyebrow:
          "Rijbewijs · Achterkant",
        title:
          "Scan nu de achterkant",
        instruction:
          "Draai het rijbewijs om en houd de volledige kaart binnen het kader.",
      },
      idFront: {
        eyebrow:
          "Identiteitsdocument · Voorkant",
        title:
          "Plaats het document binnen het kader",
        instruction:
          "Toon de volledige paspoortfotopagina of de voorkant van je identiteitskaart.",
      },
      idBack: {
        eyebrow:
          "Identiteitskaart · Achterkant",
        title:
          "Scan nu de achterkant",
        instruction:
          "Houd alle randen zichtbaar en zorg dat de kleine tekst scherp is.",
      },
    },
    decisions: {
      retake:
        "Een of meer foto’s zijn onduidelijk. Maak de gevraagde foto opnieuw.",
      licence_expired:
        "Het rijbewijs lijkt verlopen.",
      identity_expired:
        "Het paspoort of identiteitsdocument lijkt verlopen.",
      b_less_than_three_years:
        "In Spanje moet je een rijbewijs categorie B minimaal 3 jaar hebben om een scooter van 125 cc te besturen. Je categorie B voldoet nog niet aan deze eis.",
      no_compatible_category:
        "Een geldig rijbewijs A, A1 of A2, of een rijbewijs B dat minimaal 3 jaar in bezit is, is vereist.",
      category_not_yet_valid:
        "De gevonden rijbewijscategorie is nog niet geldig.",
      manual_review:
        "Documenten ontvangen. NEXA Rentals controleert ze handmatig vóór het ophalen.",
      accepted:
        "Documenten geaccepteerd.",
    },
  },

  pl: {
    scanner: "Bezpieczny skaner NEXA",
    step: "Krok",
    openingCamera: "Otwieranie tylnej kamery...",
    alignDocument: "Umieść cały dokument w ramce",
    tooDark: "Za ciemno — przejdź do lepszego światła",
    tooMuchGlare: "Za dużo odblasku — lekko przechyl dokument",
    holdStill: "Trzymaj dokument nieruchomo",
    moveCloser:
      "Przybliż dokument i pokaż wszystkie cztery rogi",
    automaticReady:
      "Wyraźna pozycja — automatyczne zdjęcie gotowe",
    capturing:
      "Automatyczne wykonywanie zdjęcia...",
    licenceCaptured: "Prawo jazdy zeskanowane",
    chooseIdentity: "Wybierz dokument tożsamości",
    identityHelp:
      "Użyj oryginalnego dokumentu, który przyniesiesz przy odbiorze skutera.",
    idCard: "Dowód osobisty",
    frontAndBack: "Przód i tył",
    passport: "Paszport",
    photoPage: "Strona ze zdjęciem",
    openingScanner: "Otwieranie bezpiecznego skanera",
    reviewingDocuments: "Sprawdzanie dokumentów",
    connecting: "Łączenie z rezerwacją...",
    checking:
      "Sprawdzanie ostrości, dat wydania i ważności oraz kategorii prawa jazdy...",
    retakeTitle: "Wykonaj zdjęcie ponownie",
    rejectedTitle:
      "Prawo jazdy nie może zostać zaakceptowane",
    retakeButton:
      "Powtórz wymagane zdjęcie",
    scanAgain: "Skanuj ponownie",
    returnCheckout: "Wróć do płatności",
    documentsReceived: "Dokumenty otrzymane",
    verificationComplete: "Weryfikacja zakończona",
    manualComplete:
      "Rezerwacja może być kontynuowana. NEXA Rentals ręcznie potwierdzi dokumenty przed odbiorem.",
    acceptedComplete:
      "Dokumenty przeszły automatyczne kontrole i zostały połączone z rezerwacją.",
    returningCheckout: "Powrót do płatności...",
    returnBooking:
      "Możesz wrócić do ekranu rezerwacji",
    attention: "Skaner wymaga uwagi",
    takePhotoInstead: "Zrób zdjęcie",
    tryAgain: "Spróbuj ponownie",
    continueManual:
      "Kontynuuj do ręcznej kontroli",
    missingSession:
      "Brakuje bezpiecznej sesji weryfikacyjnej.",
    sessionError:
      "Ta sesja weryfikacyjna jest niedostępna. Rozpocznij ponownie od płatności.",
    updateError:
      "Nie udało się zaktualizować sesji weryfikacyjnej.",
    cameraUnsupported:
      "Ta przeglądarka nie obsługuje dostępu do kamery na żywo.",
    cameraDenied:
      "Dostęp do kamery został zablokowany. Zezwól na dostęp lub zrób zdjęcie.",
    cameraError:
      "Nie udało się otworzyć tylnej kamery.",
    captureError:
      "Nie udało się zrobić zdjęcia dokumentu.",
    invalidPhoto:
      "Wybierz lub zrób czytelne zdjęcie.",
    analysisError:
      "Nie udało się przeanalizować dokumentów. Spróbuj ponownie.",
    saveError:
      "Nie udało się zapisać zdjęć dokumentów.",
    steps: {
      dlFront: {
        eyebrow:
          "Prawo jazdy · Przód",
        title:
          "Umieść przód w ramce",
        instruction:
          "Pokaż wszystkie cztery rogi, unikaj odblasków i trzymaj prawo jazdy nieruchomo.",
      },
      dlBack: {
        eyebrow:
          "Prawo jazdy · Tył",
        title:
          "Teraz zeskanuj tył",
        instruction:
          "Odwróć prawo jazdy i trzymaj całą kartę w ramce.",
      },
      idFront: {
        eyebrow:
          "Dokument tożsamości · Przód",
        title:
          "Umieść dokument w ramce",
        instruction:
          "Pokaż całą stronę paszportu ze zdjęciem lub przód dowodu osobistego.",
      },
      idBack: {
        eyebrow:
          "Dowód osobisty · Tył",
        title:
          "Teraz zeskanuj tył",
        instruction:
          "Pokaż wszystkie krawędzie i upewnij się, że mały tekst jest ostry.",
      },
    },
    decisions: {
      retake:
        "Co najmniej jedno zdjęcie jest niewyraźne. Wykonaj ponownie wskazane zdjęcie.",
      licence_expired:
        "Prawo jazdy wygląda na nieważne.",
      identity_expired:
        "Paszport lub dokument tożsamości wygląda na nieważny.",
      b_less_than_three_years:
        "W Hiszpanii prawo jazdy kategorii B musi być posiadane od co najmniej 3 lat, aby prowadzić skuter 125 cm³. Twoja kategoria B nie spełnia jeszcze tego wymogu.",
      no_compatible_category:
        "Wymagane jest ważne prawo jazdy A, A1, A2 lub kategoria B posiadana od co najmniej 3 lat.",
      category_not_yet_valid:
        "Wykryta kategoria prawa jazdy nie jest jeszcze ważna.",
      manual_review:
        "Dokumenty otrzymane. NEXA Rentals potwierdzi je ręcznie przed odbiorem.",
      accepted:
        "Dokumenty zaakceptowane.",
    },
  },

  cs: {
    scanner: "Bezpečný skener NEXA",
    step: "Krok",
    openingCamera: "Otevírání zadního fotoaparátu...",
    alignDocument: "Umístěte celý dokument do rámečku",
    tooDark:
      "Příliš tmavé — přesuňte se k lepšímu světlu",
    tooMuchGlare:
      "Příliš mnoho odlesků — mírně dokument nakloňte",
    holdStill: "Držte dokument v klidu",
    moveCloser:
      "Přibližte se a nechte viditelné všechny čtyři rohy",
    automaticReady:
      "Jasná poloha — automatické snímání je připraveno",
    capturing:
      "Automatické pořizování snímku...",
    licenceCaptured:
      "Řidičský průkaz zachycen",
    chooseIdentity:
      "Vyberte doklad totožnosti",
    identityHelp:
      "Použijte originální doklad, který přinesete při vyzvednutí skútru.",
    idCard:
      "Občanský průkaz",
    frontAndBack:
      "Přední a zadní strana",
    passport:
      "Cestovní pas",
    photoPage:
      "Stránka s fotografií",
    openingScanner:
      "Otevírání bezpečného skeneru",
    reviewingDocuments:
      "Kontrola dokumentů",
    connecting:
      "Připojování k rezervaci...",
    checking:
      "Kontrola ostrosti, data vydání a platnosti a skupin řidičského oprávnění...",
    retakeTitle:
      "Pořiďte fotografii znovu",
    rejectedTitle:
      "Řidičský průkaz nelze přijmout",
    retakeButton:
      "Znovu pořídit požadovanou fotografii",
    scanAgain:
      "Skenovat znovu",
    returnCheckout:
      "Zpět k platbě",
    documentsReceived:
      "Dokumenty přijaty",
    verificationComplete:
      "Ověření dokončeno",
    manualComplete:
      "Rezervace může pokračovat. NEXA Rentals dokumenty před vyzvednutím ručně potvrdí.",
    acceptedComplete:
      "Dokumenty prošly automatickou kontrolou a byly propojeny s rezervací.",
    returningCheckout:
      "Návrat k platbě...",
    returnBooking:
      "Můžete se vrátit na obrazovku rezervace",
    attention:
      "Skener vyžaduje pozornost",
    takePhotoInstead:
      "Pořídit fotografii",
    tryAgain:
      "Zkusit znovu",
    continueManual:
      "Pokračovat k ruční kontrole",
    missingSession:
      "Chybí zabezpečená ověřovací relace.",
    sessionError:
      "Tato ověřovací relace není dostupná. Začněte znovu od platby.",
    updateError:
      "Ověřovací relaci se nepodařilo aktualizovat.",
    cameraUnsupported:
      "Tento prohlížeč nepodporuje přímý přístup k fotoaparátu.",
    cameraDenied:
      "Přístup k fotoaparátu byl zablokován. Povolte přístup nebo pořiďte fotografii.",
    cameraError:
      "Zadní fotoaparát se nepodařilo otevřít.",
    captureError:
      "Fotografii dokumentu se nepodařilo pořídit.",
    invalidPhoto:
      "Vyberte nebo pořiďte čitelný snímek.",
    analysisError:
      "Dokumenty se nepodařilo analyzovat. Zkuste to znovu.",
    saveError:
      "Fotografie dokumentů se nepodařilo uložit.",
    steps: {
      dlFront: {
        eyebrow:
          "Řidičský průkaz · Přední strana",
        title:
          "Umístěte přední stranu do rámečku",
        instruction:
          "Nechte viditelné všechny čtyři rohy, vyhněte se odleskům a držte průkaz v klidu.",
      },
      dlBack: {
        eyebrow:
          "Řidičský průkaz · Zadní strana",
        title:
          "Nyní naskenujte zadní stranu",
        instruction:
          "Otočte průkaz a držte celou kartu v rámečku.",
      },
      idFront: {
        eyebrow:
          "Doklad totožnosti · Přední strana",
        title:
          "Umístěte dokument do rámečku",
        instruction:
          "Ukažte celou stránku pasu s fotografií nebo přední stranu občanského průkazu.",
      },
      idBack: {
        eyebrow:
          "Občanský průkaz · Zadní strana",
        title:
          "Nyní naskenujte zadní stranu",
        instruction:
          "Nechte viditelné všechny okraje a ujistěte se, že drobný text je ostrý.",
      },
    },
    decisions: {
      retake:
        "Jedna nebo více fotografií nejsou jasné. Pořiďte požadovaný snímek znovu.",
      licence_expired:
        "Řidičský průkaz je zřejmě neplatný.",
      identity_expired:
        "Pas nebo doklad totožnosti je zřejmě neplatný.",
      b_less_than_three_years:
        "Ve Španělsku musíte vlastnit řidičský průkaz skupiny B alespoň 3 roky, abyste mohli řídit skútr o objemu 125 ccm. Vaše skupina B tuto podmínku zatím nesplňuje.",
      no_compatible_category:
        "Je vyžadován platný průkaz A, A1, A2 nebo skupina B vlastněná alespoň 3 roky.",
      category_not_yet_valid:
        "Zjištěná skupina řidičského oprávnění ještě není platná.",
      manual_review:
        "Dokumenty přijaty. NEXA Rentals je před vyzvednutím ručně potvrdí.",
      accepted:
        "Dokumenty přijaty.",
    },
  },

  uk: {
    scanner: "Безпечний сканер NEXA",
    step: "Крок",
    openingCamera:
      "Відкриття задньої камери...",
    alignDocument:
      "Розмістіть увесь документ у рамці",
    tooDark:
      "Надто темно — перейдіть до кращого освітлення",
    tooMuchGlare:
      "Забагато відблисків — трохи нахиліть документ",
    holdStill:
      "Тримайте документ нерухомо",
    moveCloser:
      "Трохи наблизьте документ і залиште видимими всі чотири кути",
    automaticReady:
      "Чітке положення — автоматична зйомка готова",
    capturing:
      "Автоматична зйомка...",
    licenceCaptured:
      "Водійське посвідчення знято",
    chooseIdentity:
      "Виберіть документ, що посвідчує особу",
    identityHelp:
      "Використовуйте оригінал документа, який принесете під час отримання скутера.",
    idCard:
      "ID-картка",
    frontAndBack:
      "Лицьова і зворотна сторони",
    passport:
      "Паспорт",
    photoPage:
      "Сторінка з фото",
    openingScanner:
      "Відкриття безпечного сканера",
    reviewingDocuments:
      "Перевірка документів",
    connecting:
      "Підключення до бронювання...",
    checking:
      "Перевірка чіткості, дат видачі й закінчення та категорій посвідчення...",
    retakeTitle:
      "Зробіть фото ще раз",
    rejectedTitle:
      "Посвідчення не може бути прийняте",
    retakeButton:
      "Повторити потрібне фото",
    scanAgain:
      "Сканувати знову",
    returnCheckout:
      "Повернутися до оплати",
    documentsReceived:
      "Документи отримано",
    verificationComplete:
      "Перевірку завершено",
    manualComplete:
      "Бронювання може продовжуватися. NEXA Rentals вручну підтвердить документи до отримання.",
    acceptedComplete:
      "Документи пройшли автоматичні перевірки та були прив’язані до бронювання.",
    returningCheckout:
      "Повернення до оплати...",
    returnBooking:
      "Можна повернутися до екрана бронювання",
    attention:
      "Сканер потребує уваги",
    takePhotoInstead:
      "Зробити фото",
    tryAgain:
      "Спробувати ще раз",
    continueManual:
      "Продовжити для ручної перевірки",
    missingSession:
      "Відсутня безпечна сесія перевірки.",
    sessionError:
      "Ця сесія перевірки недоступна. Почніть знову зі сторінки оплати.",
    updateError:
      "Не вдалося оновити сесію перевірки.",
    cameraUnsupported:
      "Цей браузер не підтримує прямий доступ до камери.",
    cameraDenied:
      "Доступ до камери заблоковано. Дозвольте доступ або зробіть фото.",
    cameraError:
      "Не вдалося відкрити задню камеру.",
    captureError:
      "Не вдалося зробити фото документа.",
    invalidPhoto:
      "Виберіть або зробіть читабельне зображення.",
    analysisError:
      "Не вдалося проаналізувати документи. Спробуйте ще раз.",
    saveError:
      "Не вдалося зберегти фотографії документів.",
    steps: {
      dlFront: {
        eyebrow:
          "Водійське посвідчення · Лицьова сторона",
        title:
          "Розмістіть лицьову сторону в рамці",
        instruction:
          "Залиште видимими всі чотири кути, уникайте відблисків і тримайте посвідчення нерухомо.",
      },
      dlBack: {
        eyebrow:
          "Водійське посвідчення · Зворотна сторона",
        title:
          "Тепер скануйте зворотну сторону",
        instruction:
          "Переверніть посвідчення й тримайте всю картку у рамці.",
      },
      idFront: {
        eyebrow:
          "Документ особи · Лицьова сторона",
        title:
          "Розмістіть документ у рамці",
        instruction:
          "Покажіть усю сторінку паспорта з фото або лицьову сторону ID-картки.",
      },
      idBack: {
        eyebrow:
          "ID-картка · Зворотна сторона",
        title:
          "Тепер скануйте зворотну сторону",
        instruction:
          "Залиште видимими всі краї й переконайтеся, що дрібний текст чіткий.",
      },
    },
    decisions: {
      retake:
        "Одне або кілька фото нечіткі. Повторіть потрібний знімок.",
      licence_expired:
        "Схоже, строк дії водійського посвідчення закінчився.",
      identity_expired:
        "Схоже, строк дії паспорта або документа особи закінчився.",
      b_less_than_three_years:
        "В Іспанії посвідчення категорії B потрібно мати щонайменше 3 роки, щоб керувати скутером 125 куб. см. Ваша категорія B ще не відповідає цій вимозі.",
      no_compatible_category:
        "Потрібне чинне посвідчення A, A1, A2 або категорія B, отримана щонайменше 3 роки тому.",
      category_not_yet_valid:
        "Виявлена категорія водійського посвідчення ще не чинна.",
      manual_review:
        "Документи отримано. NEXA Rentals підтвердить їх вручну до отримання.",
      accepted:
        "Документи прийнято.",
    },
  },
};
const SUPPORTED_LOCALES = new Set<ScannerLocale>(
  Object.keys(COPY) as ScannerLocale[]
);

const AUTO_CAPTURE_SAMPLES = 1;
const CAMERA_WARMUP_MS = 400;
const QUALITY_CHECK_INTERVAL_MS = 150;

function getScannerLocale(value: string): ScannerLocale {
  const locale = value.toLowerCase() as ScannerLocale;
  return SUPPORTED_LOCALES.has(locale) ? locale : "en";
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function safeReturnUrl(raw: string) {
  if (!raw) return "";

  try {
    const url = new URL(raw, window.location.origin);
    return url.origin === window.location.origin
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function isStep(value: unknown): value is StepKey {
  return ["dlFront", "dlBack", "idFront", "idBack"].includes(
    String(value)
  );
}

function sourceCrop(
  video: HTMLVideoElement,
  aspect: number
) {
  const sourceAspect =
    video.videoWidth / video.videoHeight;

  let sx = 0;
  let sy = 0;
  let sw = video.videoWidth;
  let sh = video.videoHeight;

  if (sourceAspect > aspect) {
    sw = video.videoHeight * aspect;
    sx = (video.videoWidth - sw) / 2;
  } else {
    sh = video.videoWidth / aspect;
    sy = (video.videoHeight - sh) / 2;
  }

  return {
    sx,
    sy,
    sw,
    sh,
  };
}

async function normalizePhoto(
  file: File,
  invalidPhoto: string
) {
  if (
    file.size <= 6 * 1024 * 1024 &&
    ["image/jpeg", "image/png", "image/webp"].includes(
      file.type
    )
  ) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const element = new Image();

        element.onload = () => resolve(element);
        element.onerror = () =>
          reject(new Error(invalidPhoto));

        element.src = objectUrl;
      }
    );

    const longest = Math.max(
      image.naturalWidth,
      image.naturalHeight
    );

    const scale = Math.min(1, 1800 / longest);

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(
      1,
      Math.round(image.naturalWidth * scale)
    );

    canvas.height = Math.max(
      1,
      Math.round(image.naturalHeight * scale)
    );

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(invalidPhoto);
    }

    ctx.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob | null>(
      (resolve) =>
        canvas.toBlob(
          resolve,
          "image/jpeg",
          0.88
        )
    );

    if (!blob) {
      throw new Error(invalidPhoto);
    }

    return new File(
      [blob],
      `${Date.now()}-document.jpg`,
      {
        type: "image/jpeg",
      }
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function VerifyDocumentsPage() {
  const locale = getScannerLocale(useLocale());
  const copy = COPY[locale];

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const sampleCanvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const retakeQueueRef =
    useRef<StepKey[] | null>(null);

  const mountedRef = useRef(true);

  const previousFrameRef =
    useRef<Uint8ClampedArray | null>(null);

  const stableSamplesRef = useRef(0);
  const cameraStartedAtRef = useRef(0);
  const capturingRef = useRef(false);

  const captureRef =
    useRef<() => Promise<void>>(async () => {});

  const [sessionToken, setSessionToken] =
    useState("");

  const [bookingId, setBookingId] =
    useState("");

  const [returnUrl, setReturnUrl] =
    useState("");

  const [identityType, setIdentityType] =
    useState<IdentityType | null>(null);

  const [files, setFiles] = useState<
    Partial<Record<StepKey, File>>
  >({});

  const [step, setStep] =
    useState<StepKey>("dlFront");

  const [stage, setStage] =
    useState<Stage>("loading");

  const [cameraReady, setCameraReady] =
    useState(false);

  const [capturing, setCapturing] =
    useState(false);

  const [quality, setQuality] =
    useState<Quality>({
      tone: "neutral",
      text: copy.openingCamera,
    });

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [finalOutcome, setFinalOutcome] =
    useState<"accepted" | "manual_review">(
      "accepted"
    );

  const [error, setError] = useState("");

  const [cameraError, setCameraError] =
    useState(false);

  const stopCamera = useCallback(() => {
    for (
      const track of
      streamRef.current?.getTracks() || []
    ) {
      track.stop();
    }

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    previousFrameRef.current = null;
    stableSamplesRef.current = 0;
    cameraStartedAtRef.current = 0;

    setCameraReady(false);
  }, []);

  const patchSession = useCallback(
    async (body: Record<string, unknown>) => {
      const response = await fetch(
        "/api/document-verification/session",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionToken,
            ...body,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(copy.updateError);
      }

      return data;
    },
    [copy.updateError, sessionToken]
  );

  useEffect(() => {
    mountedRef.current = true;

    const previousBodyStyle =
      document.body.style.cssText;

    const previousHtmlStyle =
      document.documentElement.style.cssText;

    const previousScannerFlag =
      document.body.dataset.nexaDocumentScanner;

    document.body.dataset.nexaDocumentScanner =
      "true";

    document.body.style.overflow = "hidden";
    document.body.style.background = "#000";
    document.body.style.margin = "0";

    document.documentElement.style.background =
      "#000";

    const params = new URLSearchParams(
      window.location.search
    );

    const token = clean(params.get("session"));

    const back = safeReturnUrl(
      clean(params.get("return"))
    );

    setSessionToken(token);
    setReturnUrl(back);

    async function initialize() {
      try {
        if (!token) {
          throw new Error(copy.missingSession);
        }

        const response = await fetch(
          `/api/document-verification/session?session=${encodeURIComponent(
            token
          )}`,
          {
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as SessionData;

        if (!response.ok || !data.success) {
          throw new Error(copy.sessionError);
        }

        if (data.status === "completed") {
          setStage("complete");
          return;
        }

        if (
          [
            "failed",
            "expired",
            "cancelled",
          ].includes(data.status || "")
        ) {
          throw new Error(copy.sessionError);
        }

        if (!data.bookingId) {
          throw new Error(copy.sessionError);
        }

        setBookingId(data.bookingId);

        const started = await fetch(
          "/api/document-verification/session",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              sessionToken: token,
              action: "start",
            }),
          }
        );

        const startData =
          await started.json();

        if (
          !started.ok ||
          !startData.success
        ) {
          throw new Error(copy.sessionError);
        }

        setStage("camera");
      } catch (caught: any) {
        setError(
          caught?.message ||
            copy.sessionError
        );

        setStage("error");
      }
    }

    void initialize();

    return () => {
      mountedRef.current = false;

      stopCamera();

      document.body.style.cssText =
        previousBodyStyle;

      document.documentElement.style.cssText =
        previousHtmlStyle;

      if (previousScannerFlag === undefined) {
        delete document.body.dataset
          .nexaDocumentScanner;
      } else {
        document.body.dataset.nexaDocumentScanner =
          previousScannerFlag;
      }
    };
  }, [
    copy.missingSession,
    copy.sessionError,
    stopCamera,
  ]);

  const startCamera = useCallback(async () => {
    stopCamera();

    setCameraError(false);
    setError("");

    setQuality({
      tone: "neutral",
      text: copy.openingCamera,
    });

    try {
      if (
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error(
          copy.cameraUnsupported
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: false,
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
  ideal: 2560,
},
height: {
  ideal: 1440,
},
            },
          }
        );

      if (!mountedRef.current) {
        for (
          const track of stream.getTracks()
        ) {
          track.stop();
        }

        return;
      }

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error(copy.cameraError);
      }

      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      cameraStartedAtRef.current =
        performance.now();

      setCameraReady(true);

      setQuality({
        tone: "neutral",
        text: copy.alignDocument,
      });
    } catch (caught: any) {
      stopCamera();

      setCameraError(true);

      setError(
        caught?.name === "NotAllowedError"
          ? copy.cameraDenied
          : caught?.message ||
              copy.cameraError
      );

      setStage("error");
    }
  }, [copy, stopCamera]);

  useEffect(() => {
    if (stage !== "camera") {
      return;
    }

    void startCamera();

    return stopCamera;
  }, [
    stage,
    step,
    startCamera,
    stopCamera,
  ]);

  function frameAspect() {
    return identityType === "passport" &&
      step === "idFront"
      ? 1.42
      : 1.586;
  }

  async function makeCameraFile() {
    const video = videoRef.current;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      throw new Error(copy.captureError);
    }

    const aspect = frameAspect();

    const {
      sx,
      sy,
      sw,
      sh,
    } = sourceCrop(video, aspect);

    const canvas =
      document.createElement("canvas");

    const outputWidth = Math.min(
  2400,
  Math.max(
    1800,
    Math.round(sw)
  )
);

canvas.width = outputWidth;

canvas.height = Math.round(
  outputWidth / aspect
);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(copy.captureError);
    }

    ctx.drawImage(
      video,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob | null>(
      (resolve) =>
       canvas.toBlob(
  resolve,
  "image/jpeg",
  0.95
)
    );

    if (!blob) {
      throw new Error(copy.captureError);
    }

    return new File(
      [blob],
      `${step}-${Date.now()}.jpg`,
      {
        type: "image/jpeg",
      }
    );
  }

  async function analyzeDocuments(
    nextFiles: Partial<
      Record<StepKey, File>
    >,
    selectedType: IdentityType
  ) {
    try {
      setStage("analyzing");
      setError("");
      stopCamera();

      const form = new FormData();

      form.append(
        "sessionToken",
        sessionToken
      );

      form.append(
        "identityType",
        selectedType
      );

      form.append("locale", locale);

      for (
        const key of [
          "dlFront",
          "dlBack",
          "idFront",
          "idBack",
        ] as StepKey[]
      ) {
        const file = nextFiles[key];

        if (file) {
          form.append(key, file);
        }
      }

      const response = await fetch(
        "/api/document-verification/analyze",
        {
          method: "POST",
          body: form,
        }
      );

      const data =
        (await response.json()) as Analysis;

      if (!response.ok || !data.success) {
        throw new Error(copy.analysisError);
      }

      setAnalysis(data);

      if (
        data.outcome === "accepted" ||
        data.outcome === "manual_review"
      ) {
        await saveAndComplete(
          data,
          nextFiles,
          selectedType
        );
      } else {
        setStage("decision");
      }
    } catch {
      setError(copy.analysisError);
      setCameraError(false);
      setStage("error");
    }
  }
    async function saveAndComplete(
    result: Pick<
      Analysis,
      | "outcome"
      | "licenceData"
      | "identityData"
      | "analysis"
      | "message"
      | "reasons"
    >,
    nextFiles: Partial<
      Record<StepKey, File>
    >,
    selectedType: IdentityType
  ) {
    if (
      !bookingId ||
      !nextFiles.dlFront ||
      !nextFiles.dlBack ||
      !nextFiles.idFront
    ) {
      throw new Error(copy.saveError);
    }

    if (
      selectedType === "id" &&
      !nextFiles.idBack
    ) {
      throw new Error(copy.saveError);
    }

    const upload = new FormData();

    upload.append(
      "bookingId",
      bookingId
    );

    upload.append(
      "sessionToken",
      sessionToken
    );

    upload.append(
      "identityType",
      selectedType
    );

    upload.append(
      "dlFront",
      nextFiles.dlFront
    );

    upload.append(
      "dlBack",
      nextFiles.dlBack
    );

    upload.append(
      "idFront",
      nextFiles.idFront
    );

    if (nextFiles.idBack) {
      upload.append(
        "idBack",
        nextFiles.idBack
      );
    }

    const uploadResponse = await fetch(
      "/api/stripe/upload-booking-documents",
      {
        method: "POST",
        body: upload,
      }
    );

    const uploaded =
      await uploadResponse.json();

    if (
      !uploadResponse.ok ||
      !uploaded.success
    ) {
      throw new Error(copy.saveError);
    }

    await patchSession({
      action: "complete",
      identityType: selectedType,

      firstName:
        result.licenceData?.firstName ||
        result.identityData?.firstName ||
        "",

      lastName:
        result.licenceData?.lastName ||
        result.identityData?.lastName ||
        "",

      homeAddress:
        result.identityData?.address ||
        result.licenceData?.address ||
        "",

      licenceData: {
        ...result.licenceData,
        verificationOutcome:
          result.outcome,
        verificationReasons:
          result.reasons,
      },

      identityData:
        result.identityData,

      dlFrontPath:
        uploaded.dlFrontPath,

      dlBackPath:
        uploaded.dlBackPath,

      idFrontPath:
        uploaded.idFrontPath,

      idBackPath:
        uploaded.idBackPath || "",

      dlFrontName:
        uploaded.dlFrontName,

      dlBackName:
        uploaded.dlBackName,

      idFrontName:
        uploaded.idFrontName,

      idBackName:
        uploaded.idBackName || "",
    });

    setFinalOutcome(
      result.outcome === "manual_review"
        ? "manual_review"
        : "accepted"
    );

    setStage("complete");
  }

  async function acceptFile(file: File) {
    const nextFiles = {
      ...files,
      [step]: file,
    };

    setFiles(nextFiles);
    stopCamera();

    const queue =
      retakeQueueRef.current;

    if (queue) {
      const remaining =
        queue.slice(1);

      retakeQueueRef.current =
        remaining.length
          ? remaining
          : null;

      if (remaining.length) {
        setStep(remaining[0]);
        setStage("camera");
      } else if (identityType) {
        await analyzeDocuments(
          nextFiles,
          identityType
        );
      }

      return;
    }

    if (step === "dlFront") {
      setStep("dlBack");
      setStage("camera");
    } else if (step === "dlBack") {
      setStage("identity-choice");
    } else if (
      step === "idFront" &&
      identityType === "id"
    ) {
      setStep("idBack");
      setStage("camera");
    } else if (identityType) {
      await analyzeDocuments(
        nextFiles,
        identityType
      );
    }
  }

  async function capture() {
    if (capturingRef.current) {
      return;
    }

    capturingRef.current = true;

    setCapturing(true);

    setQuality({
      tone: "good",
      text: copy.capturing,
    });

    try {
      const file =
        await makeCameraFile();

      await acceptFile(file);
    } catch {
      setError(copy.captureError);
      setStage("error");
    } finally {
      capturingRef.current = false;

      if (mountedRef.current) {
        setCapturing(false);
      }
    }
  }

  captureRef.current = capture;

  useEffect(() => {
    if (
      stage !== "camera" ||
      !cameraReady
    ) {
      return;
    }

    const timer = window.setInterval(
      () => {
        if (capturingRef.current) {
          return;
        }

        const video =
          videoRef.current;

        if (
          !video ||
          video.readyState < 2 ||
          !video.videoWidth ||
          !video.videoHeight
        ) {
          return;
        }

        const aspect =
          identityType === "passport" &&
          step === "idFront"
            ? 1.42
            : 1.586;

        const canvas =
          sampleCanvasRef.current ||
          document.createElement("canvas");

        sampleCanvasRef.current =
          canvas;

        canvas.width = 180;

canvas.height = Math.round(
  180 / aspect
);

        const ctx = canvas.getContext(
          "2d",
          {
            willReadFrequently: true,
          }
        );

        if (!ctx) {
          return;
        }

        const {
          sx,
          sy,
          sw,
          sh,
        } = sourceCrop(
          video,
          aspect
        );

        ctx.drawImage(
          video,
          sx,
          sy,
          sw,
          sh,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const rgba = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        const gray =
          new Uint8ClampedArray(
            rgba.length / 4
          );

        let sum = 0;
        let sumSquares = 0;
        let glare = 0;
        let edgeSum = 0;
        let edgeCount = 0;

        for (
          let i = 0, p = 0;
          i < rgba.length;
          i += 4, p += 1
        ) {
          const value =
            (
              rgba[i] * 0.299 +
              rgba[i + 1] * 0.587 +
              rgba[i + 2] * 0.114
            ) | 0;

          gray[p] = value;

          sum += value;

          sumSquares +=
            value * value;

          if (value > 247) {
            glare += 1;
          }

          const x =
            p % canvas.width;

          const y = Math.floor(
            p / canvas.width
          );

          if (x > 0) {
            edgeSum += Math.abs(
              value - gray[p - 1]
            );

            edgeCount += 1;
          }

          if (y > 0) {
            edgeSum += Math.abs(
              value -
                gray[
                  p - canvas.width
                ]
            );

            edgeCount += 1;
          }
        }

        const count = gray.length;

        const brightness =
          sum / count;

        const contrast = Math.sqrt(
          Math.max(
            0,
            sumSquares / count -
              brightness * brightness
          )
        );

        const glareRatio =
          glare / count;

        const edgeScore =
          edgeCount
            ? edgeSum / edgeCount
            : 0;

        const previous =
          previousFrameRef.current;

        let motion = 0;

        if (
          previous &&
          previous.length ===
            gray.length
        ) {
          let difference = 0;

          for (
            let i = 0;
            i < gray.length;
            i += 1
          ) {
            difference += Math.abs(
              gray[i] - previous[i]
            );
          }

          motion =
            difference / gray.length;
        }

        previousFrameRef.current =
          gray;

        let nextQuality: Quality;
        let good = false;

       /*
 * Fast customer-friendly capture.
 *
 * We reject only frames that are genuinely
 * unusable. Normal hand movement is accepted.
 * Sharpness is still checked so the AI can
 * read the licence text properly.
 */
if (brightness < 30) {
  nextQuality = {
    tone: "warn",
    text: copy.tooDark,
  };
} else if (
  brightness > 242 ||
  glareRatio > 0.38
) {
  nextQuality = {
    tone: "warn",
    text: copy.tooMuchGlare,
  };
} else if (
  contrast < 13 ||
  edgeScore < 3.8
) {
  nextQuality = {
    tone: "warn",
    text: copy.moveCloser,
  };
} else if (motion > 24) {
  nextQuality = {
    tone: "warn",
    text: copy.holdStill,
  };
} else {
  good = true;

  nextQuality = {
    tone: "good",
    text: copy.automaticReady,
  };
}

        setQuality(nextQuality);

        const warmedUp =
  performance.now() -
    cameraStartedAtRef.current >=
  CAMERA_WARMUP_MS;

        if (good && warmedUp) {
          stableSamplesRef.current += 1;
        } else {
          stableSamplesRef.current = 0;
        }

        if (
          stableSamplesRef.current >=
          AUTO_CAPTURE_SAMPLES
        ) {
          stableSamplesRef.current = 0;

          void captureRef.current();
        }
      },
QUALITY_CHECK_INTERVAL_MS
);

    return () =>
      window.clearInterval(timer);
  }, [
    cameraReady,
    copy,
    identityType,
    stage,
    step,
  ]);
    async function useSelectedPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    event.target.value = "";

    if (!selected) {
      return;
    }

    if (
      !selected.type.startsWith("image/")
    ) {
      setError(copy.invalidPhoto);
      setCameraError(false);
      setStage("error");
      return;
    }

    try {
      setCameraError(false);
      setError("");

      const normalized =
        await normalizePhoto(
          selected,
          copy.invalidPhoto
        );

      await acceptFile(normalized);
    } catch (caught: any) {
      setError(
        caught?.message ||
          copy.invalidPhoto
      );

      setCameraError(false);
      setStage("error");
    }
  }

  function chooseIdentity(
    type: IdentityType
  ) {
    setIdentityType(type);
    setStep("idFront");
    setError("");
    setStage("camera");
  }

  function beginRetake() {
    const requested = (
      analysis?.retakeSides || []
    )
      .filter(isStep)
      .filter((key) =>
        identityType === "passport"
          ? key !== "idBack"
          : true
      );

    const fallbackQueue: StepKey[] =
      identityType === "id"
        ? [
            "dlFront",
            "dlBack",
            "idFront",
            "idBack",
          ]
        : [
            "dlFront",
            "dlBack",
            "idFront",
          ];

    const queue: StepKey[] =
      requested.length
        ? [...new Set(requested)]
        : fallbackQueue;

    retakeQueueRef.current = queue;

    const nextFiles = {
      ...files,
    };

    for (const key of queue) {
      delete nextFiles[key];
    }

    setFiles(nextFiles);
    setStep(queue[0]);
    setAnalysis(null);
    setError("");
    setStage("camera");
  }

  async function continueForManualReview() {
    if (!identityType) {
      return;
    }

    try {
      setStage("analyzing");
      setError("");

      await saveAndComplete(
        {
          outcome: "manual_review",

          message:
            copy.decisions.manual_review,

          reasons: [
            "Automatic screening was unavailable",
          ],

          licenceData: {},

          identityData: {
            selectedType: identityType,
          },

          analysis: null,
        },
        files,
        identityType
      );
    } catch (caught: any) {
      setError(
        caught?.message ||
          copy.saveError
      );

      setCameraError(false);
      setStage("error");
    }
  }

  function retryAfterError() {
    setError("");
    setCameraError(false);

    const hasAllFiles = Boolean(
      identityType &&
        files.dlFront &&
        files.dlBack &&
        files.idFront &&
        (
          identityType === "passport" ||
          files.idBack
        )
    );

    if (
      hasAllFiles &&
      identityType
    ) {
      void analyzeDocuments(
        files,
        identityType
      );

      return;
    }

    setStage("camera");
  }

  async function leaveAfterRejection() {
    try {
      await patchSession({
        action: "fail",

        errorMessage:
          analysis?.message ||
          copy.rejectedTitle,
      });
    } catch {
      /*
       * Navigation must still work if
       * the session update fails.
       */
    }

    if (returnUrl) {
      window.location.assign(
        returnUrl
      );
    } else {
      window.history.back();
    }
  }

  /*
   * Return to checkout automatically
   * after a successful scan.
   */
  useEffect(() => {
    if (
      stage !== "complete" ||
      !returnUrl ||
      !sessionToken
    ) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        const url =
          new URL(returnUrl);

        url.searchParams.set(
          "verification_session",
          sessionToken
        );

        url.searchParams.set(
          "verification_result",
          finalOutcome
        );

        window.location.assign(
          url.toString()
        );
      }, 1700);

    return () =>
      window.clearTimeout(timer);
  }, [
    stage,
    returnUrl,
    sessionToken,
    finalOutcome,
  ]);
    const stepCopy = copy.steps[step];

  const frameClass =
    identityType === "passport" &&
    step === "idFront"
      ? "aspect-[1.42/1]"
      : "aspect-[1.586/1]";

  const progress = useMemo(() => {
    const total =
      identityType === "passport"
        ? 3
        : 4;

    return Math.max(
      1,
      Math.min(
        total,
        Object.keys(files).length + 1
      )
    );
  }, [files, identityType]);

  return (
    <div
      id="nexa-document-scanner-root"
      className="fixed inset-0 z-[2147483647] min-h-[100svh] overflow-y-auto bg-black font-sans text-white"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={useSelectedPhoto}
      />

      {stage === "camera" ? (
        <main className="mx-auto flex min-h-[100svh] w-full max-w-[820px] flex-col px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-6">
          <header className="flex items-start justify-between gap-5">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/45">
                {copy.scanner}
              </div>

              <h1 className="mt-1 text-[18px] font-black tracking-[-0.03em]">
                {stepCopy.eyebrow}
              </h1>
            </div>

            <div className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black text-white/60">
              {copy.step} {progress}
            </div>
          </header>

          <section className="flex flex-1 flex-col justify-center py-5">
            <div
              className={`relative mx-auto w-full max-w-[700px] overflow-hidden rounded-[18px] bg-[#111] shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_30px_80px_rgba(0,0,0,0.65)] ${frameClass}`}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.18),transparent_16%,transparent_84%,rgba(0,0,0,.18))]" />

              <div className="nexa-scan-line pointer-events-none absolute left-[4%] right-[4%] top-[8%] h-px bg-white/85 shadow-[0_0_16px_rgba(255,255,255,.9)]" />

              <FrameCorners />

              {!cameraReady || capturing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75">
                  <Spinner />

                  {capturing ? (
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/75">
                      {copy.capturing}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="mx-auto mt-5 w-full max-w-[700px] text-center">
              <DocumentMotion
                side={
                  step.endsWith("Back")
                    ? "back"
                    : "front"
                }
              />

              <h2 className="mt-3 text-[21px] font-black tracking-[-0.04em] sm:text-[25px]">
                {stepCopy.title}
              </h2>

              <p className="mx-auto mt-2 max-w-[560px] text-[12px] font-semibold leading-5 text-white/52 sm:text-[13px]">
                {stepCopy.instruction}
              </p>

              <div
                className={`mx-auto mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black ${
                  quality.tone === "good"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : quality.tone === "warn"
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                      : "border-white/12 bg-white/5 text-white/55"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {capturing
                  ? copy.capturing
                  : quality.text}
              </div>
            </div>
          </section>
        </main>
      ) : null}

      {stage === "identity-choice" ? (
        <Centered>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
            {copy.licenceCaptured}
          </div>

          <h1 className="mt-3 text-[31px] font-black tracking-[-0.055em]">
            {copy.chooseIdentity}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-[13px] font-semibold leading-6 text-white/50">
            {copy.identityHelp}
          </p>

          <div className="mt-8 grid w-full max-w-[560px] grid-cols-2 gap-3">
            <Choice
              label={copy.idCard}
              detail={copy.frontAndBack}
              icon="ID"
              onClick={() =>
                chooseIdentity("id")
              }
            />

            <Choice
              label={copy.passport}
              detail={copy.photoPage}
              icon="✦"
              onClick={() =>
                chooseIdentity("passport")
              }
            />
          </div>
        </Centered>
      ) : null}

      {stage === "loading" ||
      stage === "analyzing" ? (
        <Centered>
          <Spinner />

          <h1 className="mt-6 text-[28px] font-black tracking-[-0.05em]">
            {stage === "loading"
              ? copy.openingScanner
              : copy.reviewingDocuments}
          </h1>

          <p className="mt-3 text-[13px] font-semibold text-white/45">
            {stage === "loading"
              ? copy.connecting
              : copy.checking}
          </p>
        </Centered>
      ) : null}

      {stage === "decision" &&
      analysis ? (
        <Centered>
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black ${
              analysis.outcome === "retake"
                ? "bg-amber-400 text-black"
                : "bg-red-600 text-white"
            }`}
          >
            {analysis.outcome === "retake"
              ? "↻"
              : "!"}
          </div>

          <h1 className="mt-6 text-[29px] font-black tracking-[-0.05em]">
            {analysis.outcome === "retake"
              ? copy.retakeTitle
              : copy.rejectedTitle}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[13px] font-semibold leading-6 text-white/58">
            {analysis.messageKey
              ? copy.decisions[
                  analysis.messageKey
                ]
              : analysis.message ||
                copy.decisions.retake}
          </p>

          {analysis.outcome === "retake" ? (
            <button
              type="button"
              onClick={beginRetake}
              className="mt-7 min-h-[56px] w-full max-w-md rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black"
            >
              {copy.retakeButton}
            </button>
          ) : (
            <div className="mt-7 flex w-full max-w-md flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setFiles({});
                  setIdentityType(null);
                  setAnalysis(null);
                  setStep("dlFront");
                  setStage("camera");
                }}
                className="min-h-[56px] rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black"
              >
                {copy.scanAgain}
              </button>

              <button
                type="button"
                onClick={() =>
                  void leaveAfterRejection()
                }
                className="min-h-[48px] rounded-[12px] border border-white/15 text-[11px] font-black text-white/60"
              >
                {copy.returnCheckout}
              </button>
            </div>
          )}
        </Centered>
      ) : null}

      {stage === "complete" ? (
        <Centered>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-[32px] font-black text-black">
            ✓
          </div>

          <h1 className="mt-7 text-[31px] font-black tracking-[-0.055em]">
            {finalOutcome === "manual_review"
              ? copy.documentsReceived
              : copy.verificationComplete}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[13px] font-semibold leading-6 text-white/55">
            {finalOutcome === "manual_review"
              ? copy.manualComplete
              : copy.acceptedComplete}
          </p>

          <div className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            {returnUrl
              ? copy.returningCheckout
              : copy.returnBooking}
          </div>
        </Centered>
      ) : null}

      {stage === "error" ? (
        <Centered>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl font-black">
            !
          </div>

          <h1 className="mt-6 text-[29px] font-black tracking-[-0.05em]">
            {copy.attention}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[13px] font-semibold leading-6 text-red-200">
            {error}
          </p>

          <div className="mt-7 flex w-full max-w-md flex-col gap-3">
            {cameraError ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="min-h-[56px] rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black"
              >
                {copy.takePhotoInstead}
              </button>
            ) : null}

            <button
              type="button"
              onClick={retryAfterError}
              className="min-h-[54px] rounded-[12px] border border-white/15 bg-white/5 px-5 text-[12px] font-black uppercase tracking-[0.14em] text-white"
            >
              {copy.tryAgain}
            </button>

            {!cameraError &&
            identityType &&
            files.dlFront &&
            files.dlBack &&
            files.idFront &&
            (
              identityType === "passport" ||
              files.idBack
            ) ? (
              <button
                type="button"
                onClick={() =>
                  void continueForManualReview()
                }
                className="py-3 text-[11px] font-black text-white/50"
              >
                {copy.continueManual}
              </button>
            ) : null}
          </div>
        </Centered>
      ) : null}

      <style jsx global>{`
        body[data-nexa-document-scanner="true"]
          div[style*="2147483647"],
        body[data-nexa-document-scanner="true"]
          div[style*="2147483400"] {
          display: none !important;
        }

        @keyframes nexa-scan {
          0% {
            top: 8%;
            opacity: 0.25;
          }

          50% {
            opacity: 1;
          }

          100% {
            top: 91%;
            opacity: 0.25;
          }
        }

        @keyframes nexa-card {
          0%,
          100% {
            transform: translateX(-7px)
              rotate(-2deg);
          }

          50% {
            transform: translateX(7px)
              rotate(2deg);
          }
        }

        @keyframes nexa-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .nexa-scan-line {
          animation: nexa-scan 2.2s
            ease-in-out infinite;
        }

        .nexa-card-motion {
          animation: nexa-card 2.4s
            ease-in-out infinite;
        }

        .nexa-spinner {
          animation: nexa-spin 0.85s
            linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-scan-line,
          .nexa-card-motion,
          .nexa-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
function Centered({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-[760px] flex-col items-center justify-center px-5 py-10 text-center">
      {children}
    </main>
  );
}

function Spinner() {
  return (
    <div className="nexa-spinner h-11 w-11 rounded-full border-[3px] border-white/15 border-t-white" />
  );
}

function FrameCorners() {
  return (
    <div className="pointer-events-none absolute inset-[10px]">
      <i className="absolute left-0 top-0 h-9 w-9 rounded-tl-[10px] border-l-[3px] border-t-[3px] border-white" />

      <i className="absolute right-0 top-0 h-9 w-9 rounded-tr-[10px] border-r-[3px] border-t-[3px] border-white" />

      <i className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-[10px] border-b-[3px] border-l-[3px] border-white" />

      <i className="absolute bottom-0 right-0 h-9 w-9 rounded-br-[10px] border-b-[3px] border-r-[3px] border-white" />
    </div>
  );
}

function DocumentMotion({
  side,
}: {
  side: "front" | "back";
}) {
  return (
    <div className="nexa-card-motion mx-auto flex h-10 w-16 items-center rounded-[5px] border border-white/20 bg-white/10 px-2">
      <div className="h-5 w-4 rounded-sm bg-white/20" />

      <div className="ml-2 flex-1 space-y-1">
        <div className="h-0.5 w-full bg-white/30" />

        <div className="h-0.5 w-4/5 bg-white/20" />

        <div className="h-0.5 w-3/5 bg-white/20" />
      </div>

      <span className="sr-only">
        {side}
      </span>
    </div>
  );
}

function Choice({
  label,
  detail,
  icon,
  onClick,
}: {
  label: string;
  detail: string;
  icon: string;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[180px] rounded-[16px] border border-white/15 bg-white/[0.06] p-5 text-left transition active:scale-[0.98]"
    >
      <div className="flex h-12 w-16 items-center justify-center rounded-[7px] bg-white text-[13px] font-black text-black">
        {icon}
      </div>

      <div className="mt-6 text-[18px] font-black">
        {label}
      </div>

      <div className="mt-1 text-[11px] font-bold text-white/40">
        {detail}
      </div>
    </button>
  );
}