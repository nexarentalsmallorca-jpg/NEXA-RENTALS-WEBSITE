"use client";

import Navbar from "@/app/Navbar";
import dynamic from "next/dynamic";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";

const NeroWebsiteAssistant = dynamic(
  () => import("@/app/components/NeroWebsiteAssistant"),
  {
    ssr: false,
    loading: () => null,
  }
);

const ORANGE = "#FF7A00";
const BLUE = "#00D9FF";
const PURPLE = "#8B5CF6";

const WHATSAPP_NUMBER = "34971482342";
const PHONE_DISPLAY = "+34 971 48 23 42";
const EMAIL = "info@nexarentals.es";
const ADDRESS = "Carrer Galeón 13, Magaluf, Mallorca";
const MAPS_LINK = "https://maps.app.goo.gl/YZBz7UeeHicKD4B99";

const NAVBAR_OFFSET = 170;

type Locale = "en" | "es" | "de" | "fr" | "it" | "pt" | "sv";

type ContactCopy = {
  heroBadge: string;
  heroTitleA: string;
  heroTitleGradient: string;
  heroText: string;
  whatsappUs: string;
  emailUs: string;
  neroEyebrow: string;
  neroTitle: string;
  online: string;
  instantHelp: string;
  neroCardText: string;
  chatWithNero: string;
  contactCards: {
    whatsapp: { title: string; label: string };
    email: { title: string; label: string };
    location: { title: string; label: string };
  };
  aiSectionBadge: string;
  aiSectionTitleA: string;
  aiSectionTitleGradient: string;
  aiSectionText: string;
  formEyebrow: string;
  formTitle: string;
  formText: string;
  placeholders: {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };
  successMessage: string;
  errorMessage: string;
  sending: string;
  sendMessage: string;
  quickEyebrow: string;
  quickTitle: string;
  quickText: string;
  fillForm: string;
  locationTitle: string;
  locationText: string;
  openDirections: string;
  openWhatsApp: string;
  quickQuestions: string[];
  formQuestionPrefix: string;
};

function getSafeLocale(locale: string): Locale {
  return ["en", "es", "de", "fr", "it", "pt", "sv"].includes(locale)
    ? (locale as Locale)
    : "en";
}

const COPY: Record<Locale, ContactCopy> = {
  en: {
    heroBadge: "Contact NEXA Rentals in Magaluf",
    heroTitleA: "Contact",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "Need help with scooter rental, e-bike rental, license rules, deposit, insurance, pickup location, or booking details? Chat with Nero AI, send us a message, or contact us directly on WhatsApp.",
    whatsappUs: "WhatsApp Us",
    emailUs: "Email Us",
    neroEyebrow: "NERO AI CONTACT SUPPORT",
    neroTitle: "Ask before you wait",
    online: "Online",
    instantHelp: "Instant help",
    neroCardText:
      "Nero AI can help with prices, availability, license rules, deposit, insurance, pickup location, and booking details.",
    chatWithNero: "Chat with Nero AI now",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Fast support for bookings",
      },
      email: {
        title: "Email",
        label: "General inquiries",
      },
      location: {
        title: "Pickup Location",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Live AI support before you contact us",
    aiSectionTitleA: "Chat instantly with",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Ask Nero about scooter prices, license requirements, deposits, insurance, pickup location, e-bikes, availability, or booking details. If you still need personal help, use the contact form below.",
    formEyebrow: "DIRECT MESSAGE",
    formTitle: "Send us a message",
    formText:
      "Your message will be sent directly to the NEXA Rentals team. We usually reply as quickly as possible.",
    placeholders: {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      subject: "Subject",
      message: "Your message...",
    },
    successMessage: "Thank you. Your message has been sent successfully.",
    errorMessage: "Failed to send message. Please try again.",
    sending: "Sending...",
    sendMessage: "Send Message",
    quickEyebrow: "QUICK CONTACT",
    quickTitle: "Need faster support?",
    quickText:
      "For urgent bookings or quick questions, WhatsApp is usually the fastest option. For detailed messages, use the form.",
    fillForm: "Fill form:",
    locationTitle: "Location",
    locationText:
      "We are located in Magaluf. Tap below to open the exact pickup location in Google Maps.",
    openDirections: "Open Directions",
    openWhatsApp: "Open WhatsApp",
    quickQuestions: [
      "Can I rent a 125cc scooter with a car license?",
      "How much is the deposit?",
      "Is insurance included?",
      "Can I book a scooter for tomorrow?",
    ],
    formQuestionPrefix: "Hi NEXA Rentals, I have a question:",
  },

  es: {
    heroBadge: "Contacta con NEXA Rentals en Magaluf",
    heroTitleA: "Contacta con",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "¿Necesitas ayuda con el alquiler de scooter, e-bike, normas de licencia, depósito, seguro, ubicación de recogida o detalles de reserva? Habla con Nero AI, envíanos un mensaje o contáctanos directamente por WhatsApp.",
    whatsappUs: "WhatsApp",
    emailUs: "Enviar email",
    neroEyebrow: "SOPORTE DE CONTACTO NERO AI",
    neroTitle: "Pregunta antes de esperar",
    online: "Online",
    instantHelp: "Ayuda instantánea",
    neroCardText:
      "Nero AI puede ayudarte con precios, disponibilidad, normas de licencia, depósito, seguro, ubicación de recogida y detalles de reserva.",
    chatWithNero: "Hablar con Nero AI ahora",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Soporte rápido para reservas",
      },
      email: {
        title: "Email",
        label: "Consultas generales",
      },
      location: {
        title: "Lugar de recogida",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Soporte AI en vivo antes de contactarnos",
    aiSectionTitleA: "Chatea al instante con",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Pregunta a Nero sobre precios de scooters, requisitos de licencia, depósitos, seguro, ubicación de recogida, e-bikes, disponibilidad o detalles de reserva. Si todavía necesitas ayuda personal, usa el formulario de contacto abajo.",
    formEyebrow: "MENSAJE DIRECTO",
    formTitle: "Envíanos un mensaje",
    formText:
      "Tu mensaje se enviará directamente al equipo de NEXA Rentals. Normalmente respondemos lo más rápido posible.",
    placeholders: {
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Número de teléfono",
      subject: "Asunto",
      message: "Tu mensaje...",
    },
    successMessage: "Gracias. Tu mensaje se ha enviado correctamente.",
    errorMessage: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
    sending: "Enviando...",
    sendMessage: "Enviar mensaje",
    quickEyebrow: "CONTACTO RÁPIDO",
    quickTitle: "¿Necesitas soporte más rápido?",
    quickText:
      "Para reservas urgentes o preguntas rápidas, WhatsApp suele ser la opción más rápida. Para mensajes detallados, usa el formulario.",
    fillForm: "Rellenar formulario:",
    locationTitle: "Ubicación",
    locationText:
      "Estamos ubicados en Magaluf. Pulsa abajo para abrir la ubicación exacta de recogida en Google Maps.",
    openDirections: "Abrir direcciones",
    openWhatsApp: "Abrir WhatsApp",
    quickQuestions: [
      "¿Puedo alquilar un scooter 125cc con carnet de coche?",
      "¿Cuánto es el depósito?",
      "¿El seguro está incluido?",
      "¿Puedo reservar un scooter para mañana?",
    ],
    formQuestionPrefix: "Hola NEXA Rentals, tengo una pregunta:",
  },

  de: {
    heroBadge: "Kontakt zu NEXA Rentals in Magaluf",
    heroTitleA: "Kontakt",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "Brauchst du Hilfe bei Scooter-Miete, E-Bike-Miete, Führerscheinregeln, Kaution, Versicherung, Abholort oder Buchungsdetails? Chatte mit Nero AI, sende uns eine Nachricht oder kontaktiere uns direkt über WhatsApp.",
    whatsappUs: "WhatsApp",
    emailUs: "E-Mail",
    neroEyebrow: "NERO AI KONTAKT-SUPPORT",
    neroTitle: "Frag, bevor du wartest",
    online: "Online",
    instantHelp: "Soforthilfe",
    neroCardText:
      "Nero AI kann bei Preisen, Verfügbarkeit, Führerscheinregeln, Kaution, Versicherung, Abholort und Buchungsdetails helfen.",
    chatWithNero: "Jetzt mit Nero AI chatten",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Schneller Support für Buchungen",
      },
      email: {
        title: "E-Mail",
        label: "Allgemeine Anfragen",
      },
      location: {
        title: "Abholort",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Live-AI-Support, bevor du uns kontaktierst",
    aiSectionTitleA: "Sofort chatten mit",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Frag Nero zu Scooter-Preisen, Führerscheinanforderungen, Kaution, Versicherung, Abholort, E-Bikes, Verfügbarkeit oder Buchungsdetails. Wenn du persönliche Hilfe brauchst, nutze das Kontaktformular unten.",
    formEyebrow: "DIREKTE NACHRICHT",
    formTitle: "Sende uns eine Nachricht",
    formText:
      "Deine Nachricht wird direkt an das NEXA Rentals Team gesendet. Wir antworten normalerweise so schnell wie möglich.",
    placeholders: {
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefonnummer",
      subject: "Betreff",
      message: "Deine Nachricht...",
    },
    successMessage: "Danke. Deine Nachricht wurde erfolgreich gesendet.",
    errorMessage: "Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.",
    sending: "Wird gesendet...",
    sendMessage: "Nachricht senden",
    quickEyebrow: "SCHNELLKONTAKT",
    quickTitle: "Brauchst du schnellere Hilfe?",
    quickText:
      "Für dringende Buchungen oder kurze Fragen ist WhatsApp meistens die schnellste Option. Für detaillierte Nachrichten nutze das Formular.",
    fillForm: "Formular ausfüllen:",
    locationTitle: "Standort",
    locationText:
      "Wir befinden uns in Magaluf. Tippe unten, um den genauen Abholort in Google Maps zu öffnen.",
    openDirections: "Route öffnen",
    openWhatsApp: "WhatsApp öffnen",
    quickQuestions: [
      "Kann ich einen 125cc Scooter mit Autoführerschein mieten?",
      "Wie hoch ist die Kaution?",
      "Ist Versicherung inklusive?",
      "Kann ich einen Scooter für morgen buchen?",
    ],
    formQuestionPrefix: "Hallo NEXA Rentals, ich habe eine Frage:",
  },

  fr: {
    heroBadge: "Contactez NEXA Rentals à Magaluf",
    heroTitleA: "Contactez",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "Besoin d’aide pour une location de scooter, e-bike, règles de permis, caution, assurance, lieu de retrait ou détails de réservation ? Discutez avec Nero AI, envoyez-nous un message ou contactez-nous directement sur WhatsApp.",
    whatsappUs: "WhatsApp",
    emailUs: "Email",
    neroEyebrow: "SUPPORT CONTACT NERO AI",
    neroTitle: "Demandez avant d’attendre",
    online: "En ligne",
    instantHelp: "Aide instantanée",
    neroCardText:
      "Nero AI peut vous aider avec les prix, la disponibilité, les règles de permis, la caution, l’assurance, le lieu de retrait et les détails de réservation.",
    chatWithNero: "Discuter avec Nero AI maintenant",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Support rapide pour réservations",
      },
      email: {
        title: "Email",
        label: "Demandes générales",
      },
      location: {
        title: "Lieu de retrait",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Support AI en direct avant de nous contacter",
    aiSectionTitleA: "Discutez instantanément avec",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Demandez à Nero les prix des scooters, exigences de permis, cautions, assurance, lieu de retrait, e-bikes, disponibilité ou détails de réservation. Si vous avez encore besoin d’aide personnelle, utilisez le formulaire ci-dessous.",
    formEyebrow: "MESSAGE DIRECT",
    formTitle: "Envoyez-nous un message",
    formText:
      "Votre message sera envoyé directement à l’équipe NEXA Rentals. Nous répondons généralement le plus rapidement possible.",
    placeholders: {
      fullName: "Nom complet",
      email: "Adresse email",
      phone: "Numéro de téléphone",
      subject: "Sujet",
      message: "Votre message...",
    },
    successMessage: "Merci. Votre message a été envoyé avec succès.",
    errorMessage: "Impossible d’envoyer le message. Veuillez réessayer.",
    sending: "Envoi...",
    sendMessage: "Envoyer le message",
    quickEyebrow: "CONTACT RAPIDE",
    quickTitle: "Besoin d’une aide plus rapide ?",
    quickText:
      "Pour les réservations urgentes ou questions rapides, WhatsApp est généralement l’option la plus rapide. Pour les messages détaillés, utilisez le formulaire.",
    fillForm: "Remplir le formulaire :",
    locationTitle: "Localisation",
    locationText:
      "Nous sommes situés à Magaluf. Appuyez ci-dessous pour ouvrir le lieu exact de retrait sur Google Maps.",
    openDirections: "Ouvrir l’itinéraire",
    openWhatsApp: "Ouvrir WhatsApp",
    quickQuestions: [
      "Puis-je louer un scooter 125cc avec un permis voiture ?",
      "Quel est le montant de la caution ?",
      "L’assurance est-elle incluse ?",
      "Puis-je réserver un scooter pour demain ?",
    ],
    formQuestionPrefix: "Bonjour NEXA Rentals, j’ai une question :",
  },

  it: {
    heroBadge: "Contatta NEXA Rentals a Magaluf",
    heroTitleA: "Contatta",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "Hai bisogno di aiuto con noleggio scooter, e-bike, regole della patente, deposito, assicurazione, luogo di ritiro o dettagli della prenotazione? Chatta con Nero AI, inviaci un messaggio o contattaci direttamente su WhatsApp.",
    whatsappUs: "WhatsApp",
    emailUs: "Email",
    neroEyebrow: "SUPPORTO CONTATTO NERO AI",
    neroTitle: "Chiedi prima di aspettare",
    online: "Online",
    instantHelp: "Aiuto immediato",
    neroCardText:
      "Nero AI può aiutarti con prezzi, disponibilità, regole della patente, deposito, assicurazione, luogo di ritiro e dettagli della prenotazione.",
    chatWithNero: "Chatta ora con Nero AI",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Supporto rapido per prenotazioni",
      },
      email: {
        title: "Email",
        label: "Richieste generali",
      },
      location: {
        title: "Luogo di ritiro",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Supporto AI live prima di contattarci",
    aiSectionTitleA: "Chatta subito con",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Chiedi a Nero prezzi degli scooter, requisiti patente, depositi, assicurazione, luogo di ritiro, e-bike, disponibilità o dettagli di prenotazione. Se hai ancora bisogno di aiuto personale, usa il modulo qui sotto.",
    formEyebrow: "MESSAGGIO DIRETTO",
    formTitle: "Inviaci un messaggio",
    formText:
      "Il tuo messaggio sarà inviato direttamente al team NEXA Rentals. Di solito rispondiamo il più velocemente possibile.",
    placeholders: {
      fullName: "Nome completo",
      email: "Indirizzo email",
      phone: "Numero di telefono",
      subject: "Oggetto",
      message: "Il tuo messaggio...",
    },
    successMessage: "Grazie. Il tuo messaggio è stato inviato correttamente.",
    errorMessage: "Impossibile inviare il messaggio. Riprova.",
    sending: "Invio...",
    sendMessage: "Invia messaggio",
    quickEyebrow: "CONTATTO RAPIDO",
    quickTitle: "Hai bisogno di supporto più veloce?",
    quickText:
      "Per prenotazioni urgenti o domande rapide, WhatsApp è di solito l’opzione più veloce. Per messaggi dettagliati, usa il modulo.",
    fillForm: "Compila modulo:",
    locationTitle: "Posizione",
    locationText:
      "Siamo a Magaluf. Tocca qui sotto per aprire il luogo esatto di ritiro su Google Maps.",
    openDirections: "Apri indicazioni",
    openWhatsApp: "Apri WhatsApp",
    quickQuestions: [
      "Posso noleggiare uno scooter 125cc con patente auto?",
      "Quanto costa il deposito?",
      "L’assicurazione è inclusa?",
      "Posso prenotare uno scooter per domani?",
    ],
    formQuestionPrefix: "Ciao NEXA Rentals, ho una domanda:",
  },

  pt: {
    heroBadge: "Contacte a NEXA Rentals em Magaluf",
    heroTitleA: "Contacte",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "Precisa de ajuda com aluguer de scooter, e-bike, regras de carta, depósito, seguro, local de levantamento ou detalhes de reserva? Fale com Nero AI, envie-nos uma mensagem ou contacte-nos diretamente no WhatsApp.",
    whatsappUs: "WhatsApp",
    emailUs: "Email",
    neroEyebrow: "SUPORTE DE CONTACTO NERO AI",
    neroTitle: "Pergunte antes de esperar",
    online: "Online",
    instantHelp: "Ajuda instantânea",
    neroCardText:
      "Nero AI pode ajudar com preços, disponibilidade, regras de carta, depósito, seguro, local de levantamento e detalhes de reserva.",
    chatWithNero: "Falar com Nero AI agora",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Suporte rápido para reservas",
      },
      email: {
        title: "Email",
        label: "Questões gerais",
      },
      location: {
        title: "Local de levantamento",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Suporte AI ao vivo antes de nos contactar",
    aiSectionTitleA: "Fale instantaneamente com",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Pergunte ao Nero sobre preços de scooters, requisitos de carta, depósitos, seguro, local de levantamento, e-bikes, disponibilidade ou detalhes de reserva. Se ainda precisar de ajuda pessoal, use o formulário abaixo.",
    formEyebrow: "MENSAGEM DIRETA",
    formTitle: "Envie-nos uma mensagem",
    formText:
      "A sua mensagem será enviada diretamente para a equipa NEXA Rentals. Normalmente respondemos o mais rápido possível.",
    placeholders: {
      fullName: "Nome completo",
      email: "Endereço de email",
      phone: "Número de telefone",
      subject: "Assunto",
      message: "A sua mensagem...",
    },
    successMessage: "Obrigado. A sua mensagem foi enviada com sucesso.",
    errorMessage: "Não foi possível enviar a mensagem. Tente novamente.",
    sending: "A enviar...",
    sendMessage: "Enviar mensagem",
    quickEyebrow: "CONTACTO RÁPIDO",
    quickTitle: "Precisa de suporte mais rápido?",
    quickText:
      "Para reservas urgentes ou perguntas rápidas, o WhatsApp é normalmente a opção mais rápida. Para mensagens detalhadas, use o formulário.",
    fillForm: "Preencher formulário:",
    locationTitle: "Localização",
    locationText:
      "Estamos localizados em Magaluf. Toque abaixo para abrir o local exato de levantamento no Google Maps.",
    openDirections: "Abrir direções",
    openWhatsApp: "Abrir WhatsApp",
    quickQuestions: [
      "Posso alugar uma scooter 125cc com carta de carro?",
      "Quanto é o depósito?",
      "O seguro está incluído?",
      "Posso reservar uma scooter para amanhã?",
    ],
    formQuestionPrefix: "Olá NEXA Rentals, tenho uma pergunta:",
  },

  sv: {
    heroBadge: "Kontakta NEXA Rentals i Magaluf",
    heroTitleA: "Kontakta",
    heroTitleGradient: "NEXA Rentals",
    heroText:
      "Behöver du hjälp med scooteruthyrning, elcykeluthyrning, körkortsregler, deposition, försäkring, upphämtningsplats eller bokningsdetaljer? Chatta med Nero AI, skicka ett meddelande eller kontakta oss direkt på WhatsApp.",
    whatsappUs: "WhatsApp",
    emailUs: "Email",
    neroEyebrow: "NERO AI KONTAKTSUPPORT",
    neroTitle: "Fråga innan du väntar",
    online: "Online",
    instantHelp: "Direkt hjälp",
    neroCardText:
      "Nero AI kan hjälpa med priser, tillgänglighet, körkortsregler, deposition, försäkring, upphämtningsplats och bokningsdetaljer.",
    chatWithNero: "Chatta med Nero AI nu",
    contactCards: {
      whatsapp: {
        title: "WhatsApp",
        label: "Snabb support för bokningar",
      },
      email: {
        title: "Email",
        label: "Allmänna frågor",
      },
      location: {
        title: "Upphämtningsplats",
        label: "Magaluf",
      },
    },
    aiSectionBadge: "Live AI-support innan du kontaktar oss",
    aiSectionTitleA: "Chatta direkt med",
    aiSectionTitleGradient: "Nero AI",
    aiSectionText:
      "Fråga Nero om scooterpriser, körkortskrav, depositioner, försäkring, upphämtningsplats, elcyklar, tillgänglighet eller bokningsdetaljer. Om du fortfarande behöver personlig hjälp, använd kontaktformuläret nedan.",
    formEyebrow: "DIREKT MEDDELANDE",
    formTitle: "Skicka oss ett meddelande",
    formText:
      "Ditt meddelande skickas direkt till NEXA Rentals-teamet. Vi svarar vanligtvis så snabbt som möjligt.",
    placeholders: {
      fullName: "Fullständigt namn",
      email: "E-postadress",
      phone: "Telefonnummer",
      subject: "Ämne",
      message: "Ditt meddelande...",
    },
    successMessage: "Tack. Ditt meddelande har skickats.",
    errorMessage: "Det gick inte att skicka meddelandet. Försök igen.",
    sending: "Skickar...",
    sendMessage: "Skicka meddelande",
    quickEyebrow: "SNABB KONTAKT",
    quickTitle: "Behöver du snabbare support?",
    quickText:
      "För brådskande bokningar eller snabba frågor är WhatsApp vanligtvis snabbast. För detaljerade meddelanden, använd formuläret.",
    fillForm: "Fyll formulär:",
    locationTitle: "Plats",
    locationText:
      "Vi finns i Magaluf. Tryck nedan för att öppna exakt upphämtningsplats i Google Maps.",
    openDirections: "Öppna vägbeskrivning",
    openWhatsApp: "Öppna WhatsApp",
    quickQuestions: [
      "Kan jag hyra en 125cc scooter med bilkörkort?",
      "Hur mycket är depositionen?",
      "Ingår försäkring?",
      "Kan jag boka en scooter för imorgon?",
    ],
    formQuestionPrefix: "Hej NEXA Rentals, jag har en fråga:",
  },
};

function ContactPageContent() {
  const locale = getSafeLocale(useLocale());
  const copy = COPY[locale];

  const aiSectionRef = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollY, setScrollY] = useState(0);

  const focusNeroInput = () => {
    window.setTimeout(() => {
      const section = aiSectionRef.current;
      if (!section) return;

      const input = section.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLElement
      >(
        "textarea, input[type='text'], input:not([type]), [contenteditable='true']"
      );

      input?.focus();
    }, 750);
  };

  const scrollToNeroSection = () => {
    const section = aiSectionRef.current;
    if (!section) return;

    const y = section.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  const openNeroChat = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();

    scrollToNeroSection();
    window.history.replaceState(null, "", "#nexa-ai-chat");
    focusNeroInput();
  };

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    if (window.location.hash === "#nexa-ai-chat") {
      window.setTimeout(() => {
        scrollToNeroSection();
        focusNeroInput();
      }, 900);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const orbMove = useMemo(() => scrollY * 0.1, [scrollY]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fillFormWithQuestion = (question: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: question,
      message: `${copy.formQuestionPrefix} ${question}`,
    }));

    setTimeout(() => {
      const form = document.getElementById("contact-form");
      if (!form) return;

      const y = form.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }, 80);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || copy.errorMessage);
      }

      setSuccessMessage(copy.successMessage);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : copy.errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <div className="relative z-[10001]">
          <Navbar />
        </div>
      </Suspense>

      <main className="relative min-h-screen overflow-hidden bg-[#030303] px-4 pb-20 pt-10 text-white sm:px-6 md:pt-16">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(255,122,0,0.18),transparent_25%),radial-gradient(circle_at_92%_10%,rgba(0,217,255,0.12),transparent_28%),radial-gradient(circle_at_50%_88%,rgba(139,92,246,0.16),transparent_32%),linear-gradient(180deg,#020202_0%,#080808_50%,#030303_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.72)_80%)]" />

          <div
            className="absolute -left-28 top-24 h-[430px] w-[430px] rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,122,0,0.22), rgba(255,122,0,0.08), transparent 74%)",
              transform: `translate3d(0, ${orbMove}px, 0)`,
            }}
          />

          <div
            className="absolute right-[-140px] top-[170px] h-[520px] w-[520px] rounded-full blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, rgba(0,217,255,0.14), rgba(139,92,246,0.14), transparent 76%)",
              transform: `translate3d(0, ${orbMove * 0.7}px, 0)`,
            }}
          />

          <div className="absolute inset-0 opacity-25 mix-blend-screen">
            <div className="floating-contact-particle contact-particle-1" />
            <div className="floating-contact-particle contact-particle-2" />
            <div className="floating-contact-particle contact-particle-3" />
            <div className="floating-contact-particle contact-particle-4" />
            <div className="floating-contact-particle contact-particle-5" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <section className="grid items-center gap-10 pb-12 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:pt-12">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 shadow-2xl backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: ORANGE }}
                    />
                    <span
                      className="relative inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: ORANGE }}
                    />
                  </span>
                  {copy.heroBadge}
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                  {copy.heroTitleA}{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, ${BLUE})`,
                    }}
                  >
                    {copy.heroTitleGradient}
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                  {copy.heroText}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex min-h-[56px] items-center justify-center overflow-hidden rounded-2xl px-7 text-sm font-bold text-black transition duration-300 hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 38%, ${PURPLE} 72%, ${BLUE} 100%)`,
                      boxShadow: "0 18px 45px rgba(255,122,0,0.25)",
                    }}
                  >
                    <span className="relative z-10">{copy.whatsappUs}</span>
                    <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                  </a>

                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex min-h-[56px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.04] hover:border-cyan-300/40 hover:bg-white/[0.1]"
                  >
                    {copy.emailUs}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative">
                <div className="absolute -inset-10 rounded-[40px] bg-[radial-gradient(circle,rgba(255,122,0,0.18),rgba(139,92,246,0.14),rgba(0,217,255,0.12),transparent_75%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,122,0,0.13),rgba(139,92,246,0.09),rgba(0,217,255,0.07))]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

                  <div className="relative rounded-[28px] border border-white/10 bg-black/35 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.34em] text-white/40">
                          {copy.neroEyebrow}
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight">
                          {copy.neroTitle}
                        </h2>
                      </div>

                      <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                        {copy.online}
                      </div>
                    </div>

                    <div className="relative mt-8 flex justify-center">
                      <div className="relative h-[180px] w-[180px]">
                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.58),rgba(139,92,246,0.48),rgba(0,217,255,0.34),rgba(255,255,255,0.07),transparent_74%)] blur-[3px] animate-pulse" />
                        <div className="absolute inset-[14px] rounded-full border border-white/15 bg-[radial-gradient(circle,rgba(255,122,0,0.24),rgba(139,92,246,0.22),rgba(0,217,255,0.16),rgba(0,0,0,0.22))] backdrop-blur-xl" />
                        <div className="absolute inset-[48px] rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(255,122,0,0.45),rgba(139,92,246,0.42),rgba(0,217,255,0.38),transparent_100%)] shadow-[0_0_44px_rgba(255,255,255,0.18)]" />

                        <div className="contact-orb-ring contact-orb-ring-1" />
                        <div className="contact-orb-ring contact-orb-ring-2" />
                        <div className="contact-orb-ring contact-orb-ring-3" />

                        <div className="contact-orb-node contact-orb-node-1" />
                        <div className="contact-orb-node contact-orb-node-2" />
                        <div className="contact-orb-node contact-orb-node-3" />
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-200/80">
                        {copy.instantHelp}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/78">
                        {copy.neroCardText}
                      </p>
                    </div>

                    <a
                      href="#nexa-ai-chat"
                      onClick={openNeroChat}
                      className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl text-sm font-black text-black transition duration-300 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${ORANGE}, #ffd3aa, ${BLUE})`,
                      }}
                    >
                      {copy.chatWithNero}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="grid grid-cols-1 gap-5 pb-12 md:grid-cols-3">
            <ContactCard
              title={copy.contactCards.whatsapp.title}
              label={copy.contactCards.whatsapp.label}
              value={PHONE_DISPLAY}
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              icon="WA"
              delay={0}
            />

            <ContactCard
              title={copy.contactCards.email.title}
              label={copy.contactCards.email.label}
              value={EMAIL}
              href={`mailto:${EMAIL}`}
              icon="@"
              delay={80}
            />

            <ContactCard
              title={copy.contactCards.location.title}
              label={copy.contactCards.location.label}
              value={ADDRESS}
              href={MAPS_LINK}
              icon="PIN"
              delay={160}
            />
          </section>

          <section
            id="nexa-ai-chat"
            ref={aiSectionRef}
            className="scroll-mt-[170px] pb-14"
          >
            <Reveal>
              <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6 md:p-8">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />
                <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />
                <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[110px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="relative mb-7 text-center">
                  <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 shadow-2xl backdrop-blur-xl">
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: ORANGE }}
                      />
                      <span
                        className="relative inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ORANGE }}
                      />
                    </span>
                    {copy.aiSectionBadge}
                  </div>

                  <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl md:text-5xl">
                    {copy.aiSectionTitleA}{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, ${BLUE})`,
                      }}
                    >
                      {copy.aiSectionTitleGradient}
                    </span>
                  </h2>

                  <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/66 md:text-base">
                    {copy.aiSectionText}
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#050505] p-2 shadow-2xl md:p-4">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,122,0,0.08),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(0,217,255,0.08),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.08),transparent_35%)]" />

                  <div className="relative min-h-[760px] overflow-hidden rounded-[26px] border border-white/10 bg-black/40">
                    <NeroWebsiteAssistant />
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div
                id="contact-form"
                className="relative scroll-mt-[170px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-7 md:p-8"
              >
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-white/42">
                    {copy.formEyebrow}
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    {copy.formTitle}
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-white/62">
                    {copy.formText}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        type="text"
                        name="fullName"
                        placeholder={copy.placeholders.fullName}
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />

                      <InputField
                        type="email"
                        name="email"
                        placeholder={copy.placeholders.email}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        type="tel"
                        name="phone"
                        placeholder={copy.placeholders.phone}
                        value={formData.phone}
                        onChange={handleChange}
                      />

                      <InputField
                        type="text"
                        name="subject"
                        placeholder={copy.placeholders.subject}
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <textarea
                      name="message"
                      placeholder={copy.placeholders.message}
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/38 focus:border-orange-400/50 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(255,122,0,0.08)] sm:text-base"
                    />

                    {successMessage && (
                      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        {successMessage}
                      </div>
                    )}

                    {errorMessage && (
                      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative mt-2 min-h-[56px] overflow-hidden rounded-2xl text-sm font-black text-black transition duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                      style={{
                        background: `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 38%, ${PURPLE} 72%, ${BLUE} 100%)`,
                      }}
                    >
                      <span className="relative z-10">
                        {loading ? copy.sending : copy.sendMessage}
                      </span>
                      <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                    </button>
                  </form>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <aside className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl md:p-8">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute -bottom-20 left-4 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-white/42">
                    {copy.quickEyebrow}
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    {copy.quickTitle}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-white/66">
                    {copy.quickText}
                  </p>

                  <div className="mt-7 space-y-3">
                    {copy.quickQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => fillFormWithQuestion(question)}
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-sm font-semibold text-white/68 transition duration-300 hover:-translate-y-1 hover:border-orange-400/35 hover:bg-white/[0.06] hover:text-white"
                      >
                        {copy.fillForm} {question}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[26px] border border-white/10 bg-black/30 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-200/80">
                      {copy.locationTitle}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      {copy.locationText}
                    </p>
                  </div>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 text-sm font-black text-white backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-cyan-300/35 hover:bg-white/[0.1]"
                  >
                    {copy.openDirections}
                  </a>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl px-6 text-sm font-black text-black transition duration-300 hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE}, #ffd3aa, ${BLUE})`,
                    }}
                  >
                    {copy.openWhatsApp}
                  </a>
                </div>
              </aside>
            </Reveal>
          </section>
        </div>
      </main>

      <style jsx global>{`
        .floating-contact-particle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(0, 217, 255, 0.65) 35%,
            rgba(139, 92, 246, 0.4) 65%,
            transparent 100%
          );
          filter: blur(1px);
          animation: contactFloat 10s ease-in-out infinite;
        }

        .contact-particle-1 {
          width: 9px;
          height: 9px;
          left: 12%;
          top: 20%;
        }

        .contact-particle-2 {
          width: 12px;
          height: 12px;
          left: 78%;
          top: 18%;
          animation-delay: 1.4s;
        }

        .contact-particle-3 {
          width: 8px;
          height: 8px;
          left: 62%;
          top: 54%;
          animation-delay: 2.8s;
        }

        .contact-particle-4 {
          width: 11px;
          height: 11px;
          left: 24%;
          top: 76%;
          animation-delay: 4.1s;
        }

        .contact-particle-5 {
          width: 7px;
          height: 7px;
          left: 90%;
          top: 70%;
          animation-delay: 5.3s;
        }

        .contact-orb-ring {
          position: absolute;
          inset: 50%;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          transform: translate(-50%, -50%);
        }

        .contact-orb-ring-1 {
          width: 120px;
          height: 120px;
          animation: contactSpin 14s linear infinite;
        }

        .contact-orb-ring-2 {
          width: 145px;
          height: 145px;
          border-color: rgba(0, 217, 255, 0.22);
          animation: contactSpinReverse 18s linear infinite;
        }

        .contact-orb-ring-3 {
          width: 168px;
          height: 168px;
          border-color: rgba(139, 92, 246, 0.18);
          animation: contactSpin 24s linear infinite;
        }

        .contact-orb-node {
          position: absolute;
          height: 9px;
          width: 9px;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 1),
            rgba(255, 122, 0, 0.82),
            rgba(0, 217, 255, 0.65)
          );
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.25);
        }

        .contact-orb-node-1 {
          top: 24px;
          left: 86px;
        }

        .contact-orb-node-2 {
          top: 82px;
          right: 10px;
        }

        .contact-orb-node-3 {
          bottom: 28px;
          left: 42px;
        }

        @keyframes contactFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes contactSpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes contactSpinReverse {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
      `}</style>
    </>
  );
}

function ContactCard({
  title,
  label,
  value,
  href,
  icon,
  delay,
}: {
  title: string;
  label: string;
  value: string;
  href: string;
  icon: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group relative block h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/25 hover:bg-white/[0.07] hover:shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
      >
        <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/10" />

        <div className="relative">
          <div
            className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-xs font-black text-black"
            style={{
              background: `linear-gradient(135deg, ${ORANGE}, #ffd3aa, ${BLUE})`,
            }}
          >
            {icon}
          </div>

          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-white/58">{label}</p>
          <p className="mt-4 text-sm font-bold leading-6 text-white underline underline-offset-4">
            {value}
          </p>
        </div>
      </a>
    </Reveal>
  );
}

function InputField({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/38 focus:border-orange-400/50 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(255,122,0,0.08)] sm:text-base"
    />
  );
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-8 opacity-0 blur-sm"
      }`}
    >
      {children}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}