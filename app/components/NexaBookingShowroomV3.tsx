"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { Inter, Manrope, Montserrat, Poppins } from "next/font/google";
import { useLocale } from "next-intl";
import NavbarV3 from "../NavbarV3";
import BookingPanelV3 from "./BookingPanelV3";
import GoogleReviewsV3 from "./GoogleReviewsV3";
import NexaStatsStripV3 from "./NexaStatsStripV3";
import MallorcaScooterRentalGuideHub from "../components/MallorcaScooterRentalGuideHub";
import NeroWebsiteAssistant from "../components/NeroWebsiteAssistant";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// ================================================================
// DESKTOP ONLY - EASY POSITION AND SIZE CONTROLS
// These settings NEVER change the mobile showroom.
// Positive X = RIGHT; negative X = LEFT.
// Positive Y = DOWN; negative Y = UP.
// scale: 1 = original size, 1.2 = 20% bigger, 0.8 = 20% smaller.
// ================================================================
const DESKTOP_HERO_TUNING = {
  // All left-hand details move and resize AS ONE GROUP:
  // brand logo, model, From, price, all-inclusive, specs, and button.
  details: {
    moveRightPx: 120,
    moveDownPx: 0,
    scale: 1,
  },

  // Each scooter's image has independent controls on desktop.
  // widthPercent is its invisible image-frame width in % of screen.
  // heightPercent is the image-frame height in % of the hero.
  scooters: {
    "piaggio-liberty": {
      leftPercent: 22,
      bottomPercent: 0,
      widthPercent: 55,
      heightPercent: 90,
      moveRightPx: 0,
      moveDownPx: 0,
      scale: 1,
    },
    "kymco-sky-town": {
      leftPercent: 22,
      bottomPercent: 0,
      widthPercent: 55,
      heightPercent: 90,
      moveRightPx: 0,
      moveDownPx: 0,
      scale: 1,
    },
    "sym-symphony": {
      leftPercent: 22,
      bottomPercent: 0,
      widthPercent: 55,
      heightPercent: 90,
      moveRightPx: 0,
      moveDownPx: 0,
      scale: 1,
    },
  },

  // DESKTOP ONLY: free inclusions positioning. Edit these four values.
  // Increase rightPercent to move the list LEFT (away from the right arrow).
  // Positive moveLeftPx = LEFT; negative moveLeftPx = RIGHT.
  // Positive moveDownPx = DOWN; negative moveDownPx = UP.
  inclusions: {
    rightPercent: 10,
    moveLeftPx: 0,
    moveDownPx: 0,
    topPercent: 25,
  },

  // New desktop video remains separate from both image and text controls.
  videoScale: 1,
  videoMoveUpPercent: 0,
  videoMoveRightPercent: 0,
  videoBrightness: 1,
  whiteWashOpacity: 0,
} as const;

type VehicleFeature = {
  image: string;
  label: string;
};

type VehicleSlide = {
  id: string;
  name: string;
  displayName: string;
  image: string;
  alt: string;
  features: VehicleFeature[];
};

type MobileDirectHeroSpec = {
  image: string;
  label: string;
};

type MobileDirectHeroSlide = {
  id: string;
  vehicleId: string;
  name: string;
  image: string;
  alt: string;
  specs: MobileDirectHeroSpec[];
};

type OpenStatus = {
  isOpen: boolean;
  label: string;
  subLabel: string;
  localTime: string;
};

type ShowroomLocale =
  | "en"
  | "es"
  | "de"
  | "fr"
  | "it"
  | "nl"
  | "pl"
  | "sv"
  | "da"
  | "no"
  | "pt"
  | "sr"
  | "uk";

type ShowroomCopy = {
  chooseYourRide: string;
  from: string;
  allInclusive: string;
  select: string;
  scooter: string;
  vehicle: string;
  ebikePrices: string;
  ebikeAvailability: string;
  whatsappButton: string;
  whatsappMessage: (vehicleName: string) => string;
  previousVehicle: string;
  nextVehicle: string;
  labels: {
    engine125: string;
    engine125Short: string;
    riders2: string;
    topSpeed100: string;
    topSpeed110: string;
    automaticTransmission: string;
    automatic: string;
    helmets2Included: string;
    phoneMountIncluded: string;
    freeLockIncluded: string;
    freeTopCaseIncluded: string;
    unlimitedKilometers: string;
    rider1: string;
    pedalAssist25: string;
    helmetIncluded: string;
    lockIncluded: string;
    range100: string;
    range60: string;
    oneHour: string;
    twoHours: string;
    threeHours: string;
    fourHours: string;
    oneDay: string;
  };
};

const SHOWROOM_COPY: Record<ShowroomLocale, ShowroomCopy> = {
  en: {
    chooseYourRide: "Choose Your Ride",
    from: "From",
    allInclusive: "All inclusive",
    select: "Select",
    scooter: "Scooter",
    vehicle: "Vehicle",
    ebikePrices: "E-Bike Prices",
    ebikeAvailability:
      "For e-bike rentals, please contact us on WhatsApp to confirm live availability. Looking to rent more days? Message us on WhatsApp.",
    whatsappButton: "Message Us On WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Hey NEXA Rentals, I am looking to rent a ${vehicleName}. Is it available?`,
    previousVehicle: "Previous vehicle",
    nextVehicle: "Next vehicle",
    labels: {
      engine125: "125CC ENGINE",
      engine125Short: "125CC",
      riders2: "2 RIDERS",
      topSpeed100: "TOP SPEED 100 KM/H",
      topSpeed110: "TOP SPEED 110 KM/H",
      automaticTransmission: "AUTOMATIC TRANSMISSION",
      automatic: "AUTOMATIC",
      helmets2Included: "FREE 2 HELMETS INCLUDED",
      phoneMountIncluded: "FREE PHONE MOUNT INCLUDED",
      freeLockIncluded: "FREE LOCK INCLUDED",
      freeTopCaseIncluded: "FREE TOP CASE INCLUDED",
      unlimitedKilometers: "UNLIMITED KILOMETERS",
      rider1: "1 RIDER",
      pedalAssist25: "25 KM/H PEDAL ASSIST",
      helmetIncluded: "HELMET INCLUDED",
      lockIncluded: "LOCK INCLUDED",
      range100: "100KM RANGE",
      range60: "60KM RANGE",
      oneHour: "1 HOUR",
      twoHours: "2 HOURS",
      threeHours: "3 HOURS",
      fourHours: "4 HOURS",
      oneDay: "1 DAY",
    },
  },
  es: {
    chooseYourRide: "Elige tu vehículo",
    from: "Desde",
    allInclusive: "Todo incluido",
    select: "Elegir",
    scooter: "Scooter",
    vehicle: "Vehículo",
    ebikePrices: "Tarifas de e-bike",
    ebikeAvailability:
      "Para alquilar una e-bike, contáctanos por WhatsApp y confirma la disponibilidad al momento. ¿Quieres alquilarla más días? Escríbenos por WhatsApp.",
    whatsappButton: "Escríbenos por WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Hola NEXA Rentals, quiero alquilar una ${vehicleName}. ¿Está disponible?`,
    previousVehicle: "Vehículo anterior",
    nextVehicle: "Vehículo siguiente",
    labels: {
      engine125: "MOTOR DE 125 CC",
      engine125Short: "125 CC",
      riders2: "2 PASAJEROS",
      topSpeed100: "VELOCIDAD MÁXIMA 100 KM/H",
      topSpeed110: "VELOCIDAD MÁXIMA 110 KM/H",
      automaticTransmission: "TRANSMISIÓN AUTOMÁTICA",
      automatic: "AUTOMÁTICA",
      helmets2Included: "2 CASCOS GRATIS INCLUIDOS",
      phoneMountIncluded: "SOPORTE PARA MÓVIL GRATIS INCLUIDO",
      freeLockIncluded: "CANDADO GRATIS INCLUIDO",
      freeTopCaseIncluded: "BAÚL TRASERO GRATIS INCLUIDO",
      unlimitedKilometers: "KILÓMETROS ILIMITADOS",
      rider1: "1 PERSONA",
      pedalAssist25: "ASISTENCIA AL PEDALEO 25 KM/H",
      helmetIncluded: "CASCO INCLUIDO",
      lockIncluded: "CANDADO INCLUIDO",
      range100: "AUTONOMÍA 100 KM",
      range60: "AUTONOMÍA 60 KM",
      oneHour: "1 HORA",
      twoHours: "2 HORAS",
      threeHours: "3 HORAS",
      fourHours: "4 HORAS",
      oneDay: "1 DÍA",
    },
  },
  de: {
    chooseYourRide: "Wähle dein Fahrzeug",
    from: "Ab",
    allInclusive: "Alles inklusive",
    select: "Auswählen",
    scooter: "Roller",
    vehicle: "Fahrzeug",
    ebikePrices: "E-Bike-Preise",
    ebikeAvailability:
      "Kontaktiere uns für E-Bike-Mieten per WhatsApp, um die aktuelle Verfügbarkeit zu bestätigen. Du möchtest länger mieten? Schreib uns auf WhatsApp.",
    whatsappButton: "Per WhatsApp anfragen",
    whatsappMessage: (vehicleName) =>
      `Hallo NEXA Rentals, ich möchte ein ${vehicleName} mieten. Ist es verfügbar?`,
    previousVehicle: "Vorheriges Fahrzeug",
    nextVehicle: "Nächstes Fahrzeug",
    labels: {
      engine125: "125-CCM-MOTOR",
      engine125Short: "125 CCM",
      riders2: "2 PERSONEN",
      topSpeed100: "HÖCHSTGESCHWINDIGKEIT 100 KM/H",
      topSpeed110: "HÖCHSTGESCHWINDIGKEIT 110 KM/H",
      automaticTransmission: "AUTOMATIKGETRIEBE",
      automatic: "AUTOMATIK",
      helmets2Included: "2 KOSTENLOSE HELME INKLUSIVE",
      phoneMountIncluded: "KOSTENLOSE HANDYHALTERUNG INKLUSIVE",
      freeLockIncluded: "KOSTENLOSES SCHLOSS INKLUSIVE",
      freeTopCaseIncluded: "KOSTENLOSES TOPCASE INKLUSIVE",
      unlimitedKilometers: "UNBEGRENZTE KILOMETER",
      rider1: "1 FAHRER",
      pedalAssist25: "PEDALUNTERSTÜTZUNG BIS 25 KM/H",
      helmetIncluded: "HELM INKLUSIVE",
      lockIncluded: "SCHLOSS INKLUSIVE",
      range100: "100 KM REICHWEITE",
      range60: "60 KM REICHWEITE",
      oneHour: "1 STUNDE",
      twoHours: "2 STUNDEN",
      threeHours: "3 STUNDEN",
      fourHours: "4 STUNDEN",
      oneDay: "1 TAG",
    },
  },
  fr: {
    chooseYourRide: "Choisissez votre véhicule",
    from: "À partir de",
    allInclusive: "Tout compris",
    select: "Choisir",
    scooter: "Scooter",
    vehicle: "Véhicule",
    ebikePrices: "Tarifs des vélos électriques",
    ebikeAvailability:
      "Pour louer un vélo électrique, contactez-nous sur WhatsApp afin de confirmer la disponibilité en temps réel. Vous souhaitez louer plus longtemps ? Écrivez-nous sur WhatsApp.",
    whatsappButton: "Nous écrire sur WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Bonjour NEXA Rentals, je souhaite louer un ${vehicleName}. Est-il disponible ?`,
    previousVehicle: "Véhicule précédent",
    nextVehicle: "Véhicule suivant",
    labels: {
      engine125: "MOTEUR 125 CC",
      engine125Short: "125 CC",
      riders2: "2 PERSONNES",
      topSpeed100: "VITESSE MAXIMALE 100 KM/H",
      topSpeed110: "VITESSE MAXIMALE 110 KM/H",
      automaticTransmission: "TRANSMISSION AUTOMATIQUE",
      automatic: "AUTOMATIQUE",
      helmets2Included: "2 CASQUES OFFERTS INCLUS",
      phoneMountIncluded: "SUPPORT TÉLÉPHONE OFFERT INCLUS",
      freeLockIncluded: "ANTIVOL OFFERT INCLUS",
      freeTopCaseIncluded: "TOP CASE OFFERT INCLUS",
      unlimitedKilometers: "KILOMÉTRAGE ILLIMITÉ",
      rider1: "1 CYCLISTE",
      pedalAssist25: "ASSISTANCE AU PÉDALAGE 25 KM/H",
      helmetIncluded: "CASQUE INCLUS",
      lockIncluded: "ANTIVOL INCLUS",
      range100: "AUTONOMIE 100 KM",
      range60: "AUTONOMIE 60 KM",
      oneHour: "1 HEURE",
      twoHours: "2 HEURES",
      threeHours: "3 HEURES",
      fourHours: "4 HEURES",
      oneDay: "1 JOUR",
    },
  },
  it: {
    chooseYourRide: "Scegli il tuo veicolo",
    from: "Da",
    allInclusive: "Tutto incluso",
    select: "Scegli",
    scooter: "Scooter",
    vehicle: "Veicolo",
    ebikePrices: "Tariffe e-bike",
    ebikeAvailability:
      "Per noleggiare un'e-bike, contattaci su WhatsApp per confermare la disponibilità in tempo reale. Vuoi noleggiarla per più giorni? Scrivici su WhatsApp.",
    whatsappButton: "Scrivici su WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Ciao NEXA Rentals, vorrei noleggiare una ${vehicleName}. È disponibile?`,
    previousVehicle: "Veicolo precedente",
    nextVehicle: "Veicolo successivo",
    labels: {
      engine125: "MOTORE 125 CC",
      engine125Short: "125 CC",
      riders2: "2 PASSEGGERI",
      topSpeed100: "VELOCITÀ MASSIMA 100 KM/H",
      topSpeed110: "VELOCITÀ MASSIMA 110 KM/H",
      automaticTransmission: "CAMBIO AUTOMATICO",
      automatic: "AUTOMATICO",
      helmets2Included: "2 CASCHI GRATIS INCLUSI",
      phoneMountIncluded: "SUPPORTO TELEFONO GRATIS INCLUSO",
      freeLockIncluded: "LUCCHETTO GRATIS INCLUSO",
      freeTopCaseIncluded: "BAULETTO GRATIS INCLUSO",
      unlimitedKilometers: "CHILOMETRI ILLIMITATI",
      rider1: "1 CICLISTA",
      pedalAssist25: "PEDALATA ASSISTITA 25 KM/H",
      helmetIncluded: "CASCO INCLUSO",
      lockIncluded: "LUCCHETTO INCLUSO",
      range100: "AUTONOMIA 100 KM",
      range60: "AUTONOMIA 60 KM",
      oneHour: "1 ORA",
      twoHours: "2 ORE",
      threeHours: "3 ORE",
      fourHours: "4 ORE",
      oneDay: "1 GIORNO",
    },
  },
  nl: {
    chooseYourRide: "Kies je voertuig",
    from: "Vanaf",
    allInclusive: "Alles inbegrepen",
    select: "Kiezen",
    scooter: "Scooter",
    vehicle: "Voertuig",
    ebikePrices: "E-bikeprijzen",
    ebikeAvailability:
      "Neem voor het huren van een e-bike contact met ons op via WhatsApp om de actuele beschikbaarheid te bevestigen. Wil je langer huren? Stuur ons een WhatsApp-bericht.",
    whatsappButton: "Stuur ons een WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Hallo NEXA Rentals, ik wil graag een ${vehicleName} huren. Is deze beschikbaar?`,
    previousVehicle: "Vorig voertuig",
    nextVehicle: "Volgend voertuig",
    labels: {
      engine125: "125 CC-MOTOR",
      engine125Short: "125 CC",
      riders2: "2 PERSONEN",
      topSpeed100: "TOPSNELHEID 100 KM/U",
      topSpeed110: "TOPSNELHEID 110 KM/U",
      automaticTransmission: "AUTOMATISCHE TRANSMISSIE",
      automatic: "AUTOMATISCH",
      helmets2Included: "2 GRATIS HELMEN INBEGREPEN",
      phoneMountIncluded: "GRATIS TELEFOONHOUDER INBEGREPEN",
      freeLockIncluded: "GRATIS SLOT INBEGREPEN",
      freeTopCaseIncluded: "GRATIS TOPKOFFER INBEGREPEN",
      unlimitedKilometers: "ONBEPERKTE KILOMETERS",
      rider1: "1 FIETSER",
      pedalAssist25: "TRAPONDERSTEUNING TOT 25 KM/U",
      helmetIncluded: "HELM INBEGREPEN",
      lockIncluded: "SLOT INBEGREPEN",
      range100: "ACTIERADIUS 100 KM",
      range60: "ACTIERADIUS 60 KM",
      oneHour: "1 UUR",
      twoHours: "2 UUR",
      threeHours: "3 UUR",
      fourHours: "4 UUR",
      oneDay: "1 DAG",
    },
  },
  pl: {
    chooseYourRide: "Wybierz pojazd",
    from: "Od",
    allInclusive: "Wszystko w cenie",
    select: "Wybierz",
    scooter: "Skuter",
    vehicle: "Pojazd",
    ebikePrices: "Ceny e-rowerów",
    ebikeAvailability:
      "Aby wynająć e-rower, skontaktuj się z nami przez WhatsApp i potwierdź aktualną dostępność. Chcesz wynająć go na dłużej? Napisz do nas na WhatsAppie.",
    whatsappButton: "Napisz na WhatsAppie",
    whatsappMessage: (vehicleName) =>
      `Cześć NEXA Rentals, chcę wynająć ${vehicleName}. Czy jest dostępny?`,
    previousVehicle: "Poprzedni pojazd",
    nextVehicle: "Następny pojazd",
    labels: {
      engine125: "SILNIK 125 CM³",
      engine125Short: "125 CM³",
      riders2: "2 OSOBY",
      topSpeed100: "PRĘDKOŚĆ MAKSYMALNA 100 KM/H",
      topSpeed110: "PRĘDKOŚĆ MAKSYMALNA 110 KM/H",
      automaticTransmission: "AUTOMATYCZNA SKRZYNIA BIEGÓW",
      automatic: "AUTOMATYCZNA",
      helmets2Included: "2 DARMOWE KASKI W CENIE",
      phoneMountIncluded: "DARMOWY UCHWYT NA TELEFON W CENIE",
      freeLockIncluded: "DARMOWA BLOKADA W CENIE",
      freeTopCaseIncluded: "DARMOWY KUFER W CENIE",
      unlimitedKilometers: "NIELIMITOWANE KILOMETRY",
      rider1: "1 ROWERZYSTA",
      pedalAssist25: "WSPOMAGANIE PEDAŁOWANIA DO 25 KM/H",
      helmetIncluded: "KASK W CENIE",
      lockIncluded: "BLOKADA W CENIE",
      range100: "ZASIĘG 100 KM",
      range60: "ZASIĘG 60 KM",
      oneHour: "1 GODZINA",
      twoHours: "2 GODZINY",
      threeHours: "3 GODZINY",
      fourHours: "4 GODZINY",
      oneDay: "1 DZIEŃ",
    },
  },
  sv: {
    chooseYourRide: "Välj ditt fordon",
    from: "Från",
    allInclusive: "Allt ingår",
    select: "Välj",
    scooter: "Skoter",
    vehicle: "Fordon",
    ebikePrices: "Elcykelpriser",
    ebikeAvailability:
      "Kontakta oss på WhatsApp för att bekräfta aktuell tillgänglighet när du vill hyra en elcykel. Vill du hyra fler dagar? Skriv till oss på WhatsApp.",
    whatsappButton: "Skriv till oss på WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Hej NEXA Rentals, jag vill hyra en ${vehicleName}. Är den tillgänglig?`,
    previousVehicle: "Föregående fordon",
    nextVehicle: "Nästa fordon",
    labels: {
      engine125: "125 CC-MOTOR",
      engine125Short: "125 CC",
      riders2: "2 PERSONER",
      topSpeed100: "TOPPHASTIGHET 100 KM/H",
      topSpeed110: "TOPPHASTIGHET 110 KM/H",
      automaticTransmission: "AUTOMATLÅDA",
      automatic: "AUTOMATISK",
      helmets2Included: "2 GRATIS HJÄLMAR INGÅR",
      phoneMountIncluded: "GRATIS MOBILHÅLLARE INGÅR",
      freeLockIncluded: "GRATIS LÅS INGÅR",
      freeTopCaseIncluded: "GRATIS TOPBOX INGÅR",
      unlimitedKilometers: "OBEGRÄNSADE KILOMETER",
      rider1: "1 CYKLIST",
      pedalAssist25: "PEDALASSISTANS UPP TILL 25 KM/H",
      helmetIncluded: "HJÄLM INGÅR",
      lockIncluded: "LÅS INGÅR",
      range100: "RÄCKVIDD 100 KM",
      range60: "RÄCKVIDD 60 KM",
      oneHour: "1 TIMME",
      twoHours: "2 TIMMAR",
      threeHours: "3 TIMMAR",
      fourHours: "4 TIMMAR",
      oneDay: "1 DAG",
    },
  },
  da: {
    chooseYourRide: "Vælg dit køretøj",
    from: "Fra",
    allInclusive: "Alt inkluderet",
    select: "Vælg",
    scooter: "Scooter",
    vehicle: "Køretøj",
    ebikePrices: "E-cykelpriser",
    ebikeAvailability:
      "Kontakt os på WhatsApp for at bekræfte den aktuelle tilgængelighed, når du vil leje en e-cykel. Vil du leje i flere dage? Skriv til os på WhatsApp.",
    whatsappButton: "Skriv til os på WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Hej NEXA Rentals, jeg vil gerne leje en ${vehicleName}. Er den ledig?`,
    previousVehicle: "Forrige køretøj",
    nextVehicle: "Næste køretøj",
    labels: {
      engine125: "125 CC-MOTOR",
      engine125Short: "125 CC",
      riders2: "2 PERSONER",
      topSpeed100: "TOPHASTIGHED 100 KM/T",
      topSpeed110: "TOPHASTIGHED 110 KM/T",
      automaticTransmission: "AUTOMATGEAR",
      automatic: "AUTOMATISK",
      helmets2Included: "2 GRATIS HJELME INKLUDERET",
      phoneMountIncluded: "GRATIS MOBILHOLDER INKLUDERET",
      freeLockIncluded: "GRATIS LÅS INKLUDERET",
      freeTopCaseIncluded: "GRATIS TOPBOKS INKLUDERET",
      unlimitedKilometers: "UBEGRÆNSEDE KILOMETER",
      rider1: "1 CYKLIST",
      pedalAssist25: "PEDALASSISTANCE OP TIL 25 KM/T",
      helmetIncluded: "HJELM INKLUDERET",
      lockIncluded: "LÅS INKLUDERET",
      range100: "RÆKKEVIDDE 100 KM",
      range60: "RÆKKEVIDDE 60 KM",
      oneHour: "1 TIME",
      twoHours: "2 TIMER",
      threeHours: "3 TIMER",
      fourHours: "4 TIMER",
      oneDay: "1 DAG",
    },
  },
  no: {
    chooseYourRide: "Velg kjøretøy",
    from: "Fra",
    allInclusive: "Alt inkludert",
    select: "Velg",
    scooter: "Scooter",
    vehicle: "Kjøretøy",
    ebikePrices: "Elsykkelpriser",
    ebikeAvailability:
      "Kontakt oss på WhatsApp for å bekrefte aktuell tilgjengelighet når du vil leie en elsykkel. Vil du leie i flere dager? Skriv til oss på WhatsApp.",
    whatsappButton: "Skriv til oss på WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Hei NEXA Rentals, jeg ønsker å leie en ${vehicleName}. Er den tilgjengelig?`,
    previousVehicle: "Forrige kjøretøy",
    nextVehicle: "Neste kjøretøy",
    labels: {
      engine125: "125 CC-MOTOR",
      engine125Short: "125 CC",
      riders2: "2 PERSONER",
      topSpeed100: "TOPPHASTIGHET 100 KM/T",
      topSpeed110: "TOPPHASTIGHET 110 KM/T",
      automaticTransmission: "AUTOMATGIR",
      automatic: "AUTOMATISK",
      helmets2Included: "2 GRATIS HJELMER INKLUDERT",
      phoneMountIncluded: "GRATIS MOBILHOLDER INKLUDERT",
      freeLockIncluded: "GRATIS LÅS INKLUDERT",
      freeTopCaseIncluded: "GRATIS TOPPBOKS INKLUDERT",
      unlimitedKilometers: "UBEGRENSEDE KILOMETER",
      rider1: "1 SYKLIST",
      pedalAssist25: "PEDALASSISTANSE OPPTIL 25 KM/T",
      helmetIncluded: "HJELM INKLUDERT",
      lockIncluded: "LÅS INKLUDERT",
      range100: "REKKEVIDDE 100 KM",
      range60: "REKKEVIDDE 60 KM",
      oneHour: "1 TIME",
      twoHours: "2 TIMER",
      threeHours: "3 TIMER",
      fourHours: "4 TIMER",
      oneDay: "1 DAG",
    },
  },
  pt: {
    chooseYourRide: "Escolha o seu veículo",
    from: "Desde",
    allInclusive: "Tudo incluído",
    select: "Escolher",
    scooter: "Scooter",
    vehicle: "Veículo",
    ebikePrices: "Preços das e-bikes",
    ebikeAvailability:
      "Para alugar uma e-bike, contacte-nos pelo WhatsApp para confirmar a disponibilidade atual. Quer alugar por mais dias? Envie-nos uma mensagem pelo WhatsApp.",
    whatsappButton: "Fale connosco no WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Olá NEXA Rentals, gostaria de alugar uma ${vehicleName}. Está disponível?`,
    previousVehicle: "Veículo anterior",
    nextVehicle: "Veículo seguinte",
    labels: {
      engine125: "MOTOR 125 CC",
      engine125Short: "125 CC",
      riders2: "2 PASSAGEIROS",
      topSpeed100: "VELOCIDADE MÁXIMA 100 KM/H",
      topSpeed110: "VELOCIDADE MÁXIMA 110 KM/H",
      automaticTransmission: "TRANSMISSÃO AUTOMÁTICA",
      automatic: "AUTOMÁTICA",
      helmets2Included: "2 CAPACETES GRÁTIS INCLUÍDOS",
      phoneMountIncluded: "SUPORTE DE TELEMÓVEL GRÁTIS INCLUÍDO",
      freeLockIncluded: "CADEADO GRÁTIS INCLUÍDO",
      freeTopCaseIncluded: "TOP CASE GRÁTIS INCLUÍDO",
      unlimitedKilometers: "QUILÓMETROS ILIMITADOS",
      rider1: "1 CICLISTA",
      pedalAssist25: "ASSISTÊNCIA AO PEDAL ATÉ 25 KM/H",
      helmetIncluded: "CAPACETE INCLUÍDO",
      lockIncluded: "CADEADO INCLUÍDO",
      range100: "AUTONOMIA 100 KM",
      range60: "AUTONOMIA 60 KM",
      oneHour: "1 HORA",
      twoHours: "2 HORAS",
      threeHours: "3 HORAS",
      fourHours: "4 HORAS",
      oneDay: "1 DIA",
    },
  },
  sr: {
    chooseYourRide: "Izaberite vozilo",
    from: "Od",
    allInclusive: "Sve uključeno",
    select: "Izaberi",
    scooter: "Skuter",
    vehicle: "Vozilo",
    ebikePrices: "Cene e-bicikala",
    ebikeAvailability:
      "Za iznajmljivanje e-bicikla kontaktirajte nas putem WhatsApp-a da proverite trenutnu dostupnost. Želite više dana? Pišite nam na WhatsApp.",
    whatsappButton: "Pišite nam na WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Zdravo NEXA Rentals, želim da iznajmim ${vehicleName}. Da li je dostupan?`,
    previousVehicle: "Prethodno vozilo",
    nextVehicle: "Sledeće vozilo",
    labels: {
      engine125: "MOTOR 125 CC",
      engine125Short: "125 CC",
      riders2: "2 PUTNIKA",
      topSpeed100: "MAKSIMALNA BRZINA 100 KM/H",
      topSpeed110: "MAKSIMALNA BRZINA 110 KM/H",
      automaticTransmission: "AUTOMATSKI MENJAČ",
      automatic: "AUTOMATIK",
      helmets2Included: "2 BESPLATNE KACIGE UKLJUČENE",
      phoneMountIncluded: "BESPLATAN DRŽAČ ZA TELEFON UKLJUČEN",
      freeLockIncluded: "BESPLATNA BRAVA UKLJUČENA",
      freeTopCaseIncluded: "BESPLATNI KOFER UKLJUČEN",
      unlimitedKilometers: "NEOGRANIČENA KILOMETRAŽA",
      rider1: "1 VOZAČ",
      pedalAssist25: "POMOĆ PRI PEDALIRANJU DO 25 KM/H",
      helmetIncluded: "KACIGA UKLJUČENA",
      lockIncluded: "BRAVA UKLJUČENA",
      range100: "DOMET 100 KM",
      range60: "DOMET 60 KM",
      oneHour: "1 SAT",
      twoHours: "2 SATA",
      threeHours: "3 SATA",
      fourHours: "4 SATA",
      oneDay: "1 DAN",
    },
  },
  uk: {
    chooseYourRide: "Оберіть транспорт",
    from: "Від",
    allInclusive: "Все включено",
    select: "Обрати",
    scooter: "Скутер",
    vehicle: "Транспорт",
    ebikePrices: "Ціни на електровелосипеди",
    ebikeAvailability:
      "Для оренди електровелосипеда напишіть нам у WhatsApp, щоб підтвердити актуальну наявність. Хочете орендувати на більше днів? Напишіть нам у WhatsApp.",
    whatsappButton: "Написати у WhatsApp",
    whatsappMessage: (vehicleName) =>
      `Вітаю, NEXA Rentals! Я хочу орендувати ${vehicleName}. Чи доступний він?`,
    previousVehicle: "Попередній транспорт",
    nextVehicle: "Наступний транспорт",
    labels: {
      engine125: "ДВИГУН 125 КУБ. СМ",
      engine125Short: "125 КУБ. СМ",
      riders2: "2 ПАСАЖИРИ",
      topSpeed100: "МАКСИМАЛЬНА ШВИДКІСТЬ 100 КМ/ГОД",
      topSpeed110: "МАКСИМАЛЬНА ШВИДКІСТЬ 110 КМ/ГОД",
      automaticTransmission: "АВТОМАТИЧНА ТРАНСМІСІЯ",
      automatic: "АВТОМАТ",
      helmets2Included: "2 БЕЗКОШТОВНІ ШОЛОМИ ВКЛЮЧЕНО",
      phoneMountIncluded: "БЕЗКОШТОВНЕ КРІПЛЕННЯ ДЛЯ ТЕЛЕФОНА",
      freeLockIncluded: "БЕЗКОШТОВНИЙ ЗАМОК ВКЛЮЧЕНО",
      freeTopCaseIncluded: "БЕЗКОШТОВНИЙ КОФР ВКЛЮЧЕНО",
      unlimitedKilometers: "НЕОБМЕЖЕНИЙ ПРОБІГ",
      rider1: "1 ВЕЛОСИПЕДИСТ",
      pedalAssist25: "ДОПОМОГА ПЕДАЛЮВАННЮ ДО 25 КМ/ГОД",
      helmetIncluded: "ШОЛОМ ВКЛЮЧЕНО",
      lockIncluded: "ЗАМОК ВКЛЮЧЕНО",
      range100: "ЗАПАС ХОДУ 100 КМ",
      range60: "ЗАПАС ХОДУ 60 КМ",
      oneHour: "1 ГОДИНА",
      twoHours: "2 ГОДИНИ",
      threeHours: "3 ГОДИНИ",
      fourHours: "4 ГОДИНИ",
      oneDay: "1 ДЕНЬ",
    },
  },
};

// New showroom labels use the same next-intl locale as the existing scooter copy.
const SHOWROOM_EXTRAS_COPY: Record<ShowroomLocale, Record<"popularScooter" | "freeExtras" | "helmets" | "gloves" | "securityLock" | "phoneMount" | "topCase" | "insurance", string>> = {
  en: { popularScooter: "Popular Scooter", freeExtras: "Free Extras", helmets: "2 Helmets", gloves: "2 Pairs of Gloves", securityLock: "Security Lock", phoneMount: "Phone Mount", topCase: "Top Case", insurance: "Basic Insurance" },
  es: { popularScooter: "Scooter popular", freeExtras: "Extras gratis", helmets: "2 cascos", gloves: "2 pares de guantes", securityLock: "Candado de seguridad", phoneMount: "Soporte para móvil", topCase: "Baúl trasero", insurance: "Seguro básico" },
  de: { popularScooter: "Beliebter Roller", freeExtras: "Kostenlose Extras", helmets: "2 Helme", gloves: "2 Paar Handschuhe", securityLock: "Sicherheitsschloss", phoneMount: "Handyhalterung", topCase: "Topcase", insurance: "Basisversicherung" },
  fr: { popularScooter: "Scooter populaire", freeExtras: "Extras gratuits", helmets: "2 casques", gloves: "2 paires de gants", securityLock: "Antivol de sécurité", phoneMount: "Support téléphone", topCase: "Top-case", insurance: "Assurance de base" },
  it: { popularScooter: "Scooter popolare", freeExtras: "Extra gratuiti", helmets: "2 caschi", gloves: "2 paia di guanti", securityLock: "Bloccadisco di sicurezza", phoneMount: "Supporto telefono", topCase: "Bauletto", insurance: "Assicurazione base" },
  nl: { popularScooter: "Populaire scooter", freeExtras: "Gratis extra’s", helmets: "2 helmen", gloves: "2 paar handschoenen", securityLock: "Veiligheidsslot", phoneMount: "Telefoonhouder", topCase: "Topkoffer", insurance: "Basisverzekering" },
  pl: { popularScooter: "Popularny skuter", freeExtras: "Darmowe dodatki", helmets: "2 kaski", gloves: "2 pary rękawic", securityLock: "Blokada zabezpieczająca", phoneMount: "Uchwyt na telefon", topCase: "Kufer", insurance: "Podstawowe ubezpieczenie" },
  sv: { popularScooter: "Populär scooter", freeExtras: "Gratis tillbehör", helmets: "2 hjälmar", gloves: "2 par handskar", securityLock: "Säkerhetslås", phoneMount: "Mobilhållare", topCase: "Toppbox", insurance: "Grundförsäkring" },
  da: { popularScooter: "Populær scooter", freeExtras: "Gratis ekstraudstyr", helmets: "2 hjelme", gloves: "2 par handsker", securityLock: "Sikkerhedslås", phoneMount: "Telefonholder", topCase: "Topboks", insurance: "Basisforsikring" },
  no: { popularScooter: "Populær scooter", freeExtras: "Gratis ekstrautstyr", helmets: "2 hjelmer", gloves: "2 par hansker", securityLock: "Sikkerhetslås", phoneMount: "Mobilholder", topCase: "Toppboks", insurance: "Grunnforsikring" },
  pt: { popularScooter: "Scooter popular", freeExtras: "Extras grátis", helmets: "2 capacetes", gloves: "2 pares de luvas", securityLock: "Cadeado de segurança", phoneMount: "Suporte para telemóvel", topCase: "Top case", insurance: "Seguro básico" },
  sr: { popularScooter: "Popularan skuter", freeExtras: "Besplatni dodaci", helmets: "2 kacige", gloves: "2 para rukavica", securityLock: "Sigurnosna brava", phoneMount: "Držač telefona", topCase: "Kofer", insurance: "Osnovno osiguranje" },
  uk: { popularScooter: "Популярний скутер", freeExtras: "Безкоштовні додатки", helmets: "2 шоломи", gloves: "2 пари рукавичок", securityLock: "Захисний замок", phoneMount: "Тримач телефона", topCase: "Кофр", insurance: "Базове страхування" },
};

// Mobile hero microcopy follows the same next-intl locale as the rest of the showroom.
const MOBILE_HERO_MICROCOPY: Record<ShowroomLocale, {
  engine: string;
  passengers: string;
  distance: string;
  reassurance: string;
}> = {
  en: { engine: "125 CC", passengers: "2 PAX", distance: "UNLIMITED KM", reassurance: "All essentials included. No hidden fees." },
  es: { engine: "125 CC", passengers: "2 PLAZAS", distance: "KM ILIMITADOS", reassurance: "Todo lo esencial incluido. Sin cargos ocultos." },
  de: { engine: "125 CCM", passengers: "2 PERSONEN", distance: "UNBEGRENZTE KM", reassurance: "Alles Wichtige inklusive. Keine versteckten Kosten." },
  fr: { engine: "125 CC", passengers: "2 PLACES", distance: "KM ILLIMITÉS", reassurance: "Tout l’essentiel inclus. Aucun frais caché." },
  it: { engine: "125 CC", passengers: "2 POSTI", distance: "KM ILLIMITATI", reassurance: "Tutto l’essenziale incluso. Nessun costo nascosto." },
  nl: { engine: "125 CC", passengers: "2 PERSONEN", distance: "ONBEPERKT KM", reassurance: "Alles wat je nodig hebt inbegrepen. Geen verborgen kosten." },
  pl: { engine: "125 CM³", passengers: "2 OSOBY", distance: "BEZ LIMITU KM", reassurance: "Wszystko, co niezbędne, w cenie. Bez ukrytych opłat." },
  sv: { engine: "125 CC", passengers: "2 PERSONER", distance: "FRIA MIL", reassurance: "Allt du behöver ingår. Inga dolda avgifter." },
  da: { engine: "125 CC", passengers: "2 PERSONER", distance: "FRI KM", reassurance: "Alt det nødvendige er inkluderet. Ingen skjulte gebyrer." },
  no: { engine: "125 CC", passengers: "2 PERSONER", distance: "FRI KM", reassurance: "Alt du trenger er inkludert. Ingen skjulte gebyrer." },
  pt: { engine: "125 CC", passengers: "2 PESSOAS", distance: "KM ILIMITADOS", reassurance: "Tudo o que precisa incluído. Sem taxas ocultas." },
  sr: { engine: "125 CC", passengers: "2 OSOBE", distance: "NEOGRANIČENI KM", reassurance: "Sve što vam treba je uključeno. Bez skrivenih troškova." },
  uk: { engine: "125 КУБ. СМ", passengers: "2 ОСОБИ", distance: "БЕЗЛІМІТНИЙ ПРОБІГ", reassurance: "Усе необхідне включено. Без прихованих платежів." },
};

function normalizeShowroomLocale(locale: string): ShowroomLocale {
  const rawLocale = locale.toLowerCase().split("-")[0];
  const aliases: Record<string, ShowroomLocale> = {
    nb: "no",
    nn: "no",
    se: "sv",
    dk: "da",
    rs: "sr",
    ua: "uk",
  };
  const normalizedLocale = aliases[rawLocale] || rawLocale;

  return normalizedLocale in SHOWROOM_COPY
    ? (normalizedLocale as ShowroomLocale)
    : "en";
}

function translateVehicleLabel(label: string, copy: ShowroomCopy) {
  if (copy === SHOWROOM_COPY.en) return label;

  const labels = copy.labels;

  const translatedLabels: Record<string, string> = {
    "125CC ENGINE": labels.engine125,
    "125CC": labels.engine125Short,
    "2 PASSENGERS": labels.riders2,
    "2 Riders": labels.riders2,
    "TOP SPEED 100 KM/H": labels.topSpeed100,
    "TOP SPEED 110 KM/H": labels.topSpeed110,
    "AUTOMATIC TRANSMISSION": labels.automaticTransmission,
    Automatic: labels.automatic,
    "FREE 2 HELMETS INCLUDED": labels.helmets2Included,
    "FREE PHONE MOUNT INCLUDED": labels.phoneMountIncluded,
    "FREE LOCK INCLUDED": labels.freeLockIncluded,
    "FREE TOP CASE INCLUDED": labels.freeTopCaseIncluded,
    "UNLIMITED KILOMETERS": labels.unlimitedKilometers,
    "1 RIDER": labels.rider1,
    "1 Rider": labels.rider1,
    "25 KM/H PEDAL ASSIST": labels.pedalAssist25,
    "HELMET INCLUDED": labels.helmetIncluded,
    "LOCK INCLUDED": labels.lockIncluded,
    "Lock Included": labels.lockIncluded,
    "100KM RANGE": labels.range100,
    "100KM Range": labels.range100,
    "60KM RANGE": labels.range60,
    "60KM Range": labels.range60,
    "All Inclusive": copy.allInclusive,
    "1 Hour": labels.oneHour,
    "2 Hours": labels.twoHours,
    "3 Hours": labels.threeHours,
    "4 Hours": labels.fourHours,
    "1 Day": labels.oneDay,
  };

  return translatedLabels[label] || label;
}

declare global {
  interface Window {
    __nexaTriggerBookingPanelAttention?: boolean;
  }
}

const PIAGGIO_FEATURES: VehicleFeature[] = [
  { image: "/images/engine.png", label: "125CC ENGINE" },
  { image: "/images/people.png", label: "2 PASSENGERS" },
  { image: "/images/speed.png", label: "TOP SPEED 100 KM/H" },
  { image: "/images/helmet.png", label: "FREE 2 HELMETS INCLUDED" },
  { image: "/images/phone.png", label: "FREE PHONE MOUNT INCLUDED" },
  { image: "/images/lock.png", label: "FREE LOCK INCLUDED" },
  { image: "/images/box.png", label: "FREE TOP CASE INCLUDED" },
  { image: "/images/1111.png", label: "UNLIMITED KILOMETERS" },
];

const KYMCO_FEATURES: VehicleFeature[] = [
  { image: "/images/engine.png", label: "125CC ENGINE" },
  { image: "/images/people.png", label: "2 PASSENGERS" },
  { image: "/images/speed.png", label: "AUTOMATIC TRANSMISSION" },
  { image: "/images/helmet.png", label: "FREE 2 HELMETS INCLUDED" },
  { image: "/images/phone.png", label: "FREE PHONE MOUNT INCLUDED" },
  { image: "/images/lock.png", label: "FREE LOCK INCLUDED" },
  { image: "/images/box.png", label: "FREE TOP CASE INCLUDED" },
  { image: "/images/1111.png", label: "UNLIMITED KILOMETERS" },
];

const SYM_FEATURES: VehicleFeature[] = [
  { image: "/images/engine.png", label: "125CC ENGINE" },
  { image: "/images/people.png", label: "2 PASSENGERS" },
  { image: "/images/speed.png", label: "TOP SPEED 110 KM/H" },
  { image: "/images/helmet.png", label: "FREE 2 HELMETS INCLUDED" },
  { image: "/images/phone.png", label: "FREE PHONE MOUNT INCLUDED" },
  { image: "/images/lock.png", label: "FREE LOCK INCLUDED" },
  { image: "/images/box.png", label: "FREE TOP CASE INCLUDED" },
  { image: "/images/1111.png", label: "UNLIMITED KILOMETERS" },
];

const MOMA_EBIKE_FEATURES: VehicleFeature[] = [
  { image: "/images/people.png", label: "1 RIDER" },
  { image: "/images/speed.png", label: "25 KM/H PEDAL ASSIST" },
  { image: "/images/helmet.png", label: "HELMET INCLUDED" },
  { image: "/images/lock.png", label: "LOCK INCLUDED" },
  { image: "/images/1111.png", label: "100KM RANGE" },
];

const CECOTEC_EBIKE_FEATURES: VehicleFeature[] = [
  { image: "/images/people.png", label: "1 RIDER" },
  { image: "/images/speed.png", label: "25 KM/H PEDAL ASSIST" },
  { image: "/images/helmet.png", label: "HELMET INCLUDED" },
  { image: "/images/lock.png", label: "LOCK INCLUDED" },
  { image: "/images/1111.png", label: "60KM RANGE" },
];

const VEHICLE_SLIDES: VehicleSlide[] = [
  {
    id: "piaggio-liberty",
    name: "Piaggio Liberty",
    displayName: "Piaggio Liberty 125",
    image: "/images/piaggio-liberty-v4.0.png",
    alt: "Piaggio Liberty 125 NEXA Rentals",
    features: PIAGGIO_FEATURES,
  },
  {
    id: "kymco-sky-town",
    name: "Kymco Sky Town",
    displayName: "Kymco Sky Town 125",
    image: "/images/kymco.png",
    alt: "Kymco Sky Town 125 NEXA Rentals",
    features: KYMCO_FEATURES,
  },
  {
    id: "sym-symphony",
    name: "SYM Symphony",
    displayName: "SYM Symphony 125",
    image: "/images/sym3.png",
    alt: "SYM Symphony 125 NEXA Rentals",
    features: SYM_FEATURES,
  },
  {
    id: "ebike-one",
    name: "E-Bike",
    displayName: "MOMA CITY E-Bike",
    image: "/images/ebike1.0.png",
    alt: "NEXA Rentals electric bike",
    features: MOMA_EBIKE_FEATURES,
  },
  {
    id: "ebike-two",
    name: "E-Bike",
    displayName: "CECOTEC light MTB E-Bike",
    image: "/images/ebike2.0.png",
    alt: "NEXA Rentals premium electric bike",
    features: CECOTEC_EBIKE_FEATURES,
  },
];

// Desktop uses the exact approved mobile scooter assets and ordering.
// Keep the legacy VEHICLE_SLIDES data intact for unrelated code paths.
const DESKTOP_SCOOTER_SLIDES: VehicleSlide[] = VEHICLE_SLIDES
  .filter((vehicle) => ["piaggio-liberty", "kymco-sky-town", "sym-symphony"].includes(vehicle.id))
  .map((vehicle) => ({
    ...vehicle,
    image: ({
      "piaggio-liberty": "/images/nexapiaggio.png",
      "kymco-sky-town": "/images/realkymco.png",
      "sym-symphony": "/images/symreal.png",
    } as Record<string, string>)[vehicle.id] ?? vehicle.image,
  }));

const MOBILE_DIRECT_HERO_SLIDES: MobileDirectHeroSlide[] = [
  {
    id: "mobile-piaggio-liberty",
    vehicleId: "piaggio-liberty",
    name: "Piaggio Liberty 125",
    image: "/images/nexapiaggio.png",
    alt: "Piaggio Liberty 125 scooter rental NEXA Rentals Magaluf",
    specs: [
      { image: "/images/engine.png", label: "125CC" },
      { image: "/images/people.png", label: "2 Riders" },
      { image: "/images/speed.png", label: "100 KM/H" },
      { image: "/images/1111.png", label: "All Inclusive" },
    ],
  },
  {
    id: "mobile-kymco-sky-town",
    vehicleId: "kymco-sky-town",
    name: "SkyTown 125 CC",
    image: "/images/realkymco.png",
    alt: "Kymco SkyTown 125 scooter rental NEXA Rentals Magaluf",
    specs: [
      { image: "/images/engine.png", label: "125CC" },
      { image: "/images/people.png", label: "2 Riders" },
      { image: "/images/speed.png", label: "Automatic" },
      { image: "/images/1111.png", label: "All Inclusive" },
    ],
  },
  {
    id: "mobile-sym-symphony",
    vehicleId: "sym-symphony",
    name: "Symphony 125 CC",
    image: "/images/symreal.png",
    alt: "SYM Symphony 125 scooter rental NEXA Rentals Magaluf",
    specs: [
      { image: "/images/engine.png", label: "125CC" },
      { image: "/images/people.png", label: "2 Riders" },
      { image: "/images/speed.png", label: "110 KM/H" },
      { image: "/images/1111.png", label: "All Inclusive" },
    ],
  },
];

// Only mobile hero prices; the desktop booking/pricing logic is untouched.
const MOBILE_SCOOTER_PRICES: Record<string, string> = {
  "piaggio-liberty": "34€",
  "kymco-sky-town": "44€",
  "sym-symphony": "34€",
};

const EBIKE_PRICES = [
  { label: "1 Hour", price: "€9" },
  { label: "2 Hours", price: "€16" },
  { label: "3 Hours", price: "€21" },
  { label: "4 Hours", price: "€25" },
  { label: "1 Day", price: "€28" },
];

const LOCATION_ADDRESS =
  "C. Galeón, 13, Loc 57, 07181 Magaluf, Balearic Islands";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands";

const GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=Nexa%20Rentals%20Scooter%20E-Bike%20Rental%20Magaluf%2C%20C.%20Gale%C3%B3n%2013%20Loc%2057%2007181%20Magaluf%2C%20Balearic%20Islands&z=17&output=embed";

function getMallorcaOpenStatus(): OpenStatus {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0"
  );

  const totalMinutes = hour * 60 + minute;

  const morningOpen = totalMinutes >= 9 * 60 && totalMinutes < 14 * 60;
  const afternoonOpen = totalMinutes >= 15 * 60 && totalMinutes < 20 * 60;
  const isOpen = morningOpen || afternoonOpen;

  let subLabel = "Open now";

  if (!isOpen) {
    if (totalMinutes < 9 * 60) {
      subLabel = "Opens today at 09:00";
    } else if (totalMinutes >= 14 * 60 && totalMinutes < 15 * 60) {
      subLabel = "Reopens today at 15:00";
    } else {
      subLabel = "Opens tomorrow at 09:00";
    }
  }

  return {
    isOpen,
    label: isOpen ? "OPEN" : "CLOSED",
    subLabel,
    localTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`,
  };
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M9 18.5L3.75 21V6L9 3.5M9 18.5L15 21M9 18.5V3.5M15 21L20.25 18.5V3.5L15 6M15 21V6M15 6L9 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path
        d="M12 21s7-5.25 7-11a7 7 0 1 0-14 0c0 5.75 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5v5l3.25 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypedLine({
  text,
  className,
  delayMs = 0,
}: {
  text: string;
  className: string;
  delayMs?: number;
}) {
  return (
    <span
      className={`typed-unpack ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {text}
    </span>
  );
}

function LocationV3({ locale }: { locale: ShowroomLocale }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getMallorcaOpenStatus());
    };

    updateStatus();

    const interval = window.setInterval(updateStatus, 30 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const statusClasses = useMemo(() => {
    if (!status) {
      return "border-white/15 bg-white/[0.04] text-white";
    }

    return status.isOpen
      ? "border-emerald-400/35 bg-emerald-400/[0.09] text-emerald-300"
      : "border-red-400/35 bg-red-400/[0.09] text-red-300";
  }, [status]);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const section = sectionRef.current;

    if (!section) return;

    const rect = section.getBoundingClientRect();

    section.style.setProperty("--nexa-x", `${event.clientX - rect.left}px`);
    section.style.setProperty("--nexa-y", `${event.clientY - rect.top}px`);
    section.classList.add("nexa-location-cursor-active");
  };

  const handleMouseLeave = () => {
    sectionRef.current?.classList.remove("nexa-location-cursor-active");
  };

  return (
    <section
      ref={sectionRef}
      id="location"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${montserrat.className} relative isolate overflow-hidden bg-black px-5 py-12 text-white sm:px-8 lg:px-10`}
    >
      <div className="pointer-events-none absolute inset-0 -z-30 bg-black" />

      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.055),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_42%)]" />

      <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="nexa-location-reveal pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300">
        <div className="absolute left-[-10%] top-[7%] w-[46%] rotate-[-4deg] text-[13px] font-semibold uppercase leading-[1.9] tracking-[0.16em] text-white/[0.18]">
          <p>
            NEXA Rentals was built in Magaluf for travellers who want a faster,
            cleaner and easier way to move around Mallorca. From our pickup point
            on C. Galeón, riders can reach the beach, Palmanova, Portals,
            viewpoints, hotels and coastal roads without waiting for taxis or
            buses.
          </p>

          <p className="mt-6">
            Every rental is prepared with simple handover, clear instructions,
            helmets, lock, phone holder and local support. The idea is simple:
            arrive, collect your scooter or e-bike, and start exploring the
            island with freedom.
          </p>
        </div>

        <div className="absolute right-[-8%] top-[12%] w-[44%] rotate-[4deg] text-[12px] font-semibold uppercase leading-[1.95] tracking-[0.18em] text-white/[0.16]">
          <p>
            We are located in the heart of Magaluf, close to hotels, restaurants,
            BCM, the beach and the main tourist streets. This location makes
            pickup easy for customers staying in Magaluf, Palmanova, Son Matias
            and nearby areas.
          </p>

          <p className="mt-6">
            NEXA is made for quick movement, honest prices and a premium rental
            experience without hidden stress. Pick up, ride, return and enjoy
            Mallorca your own way.
          </p>
        </div>

        <div className="absolute bottom-[6%] left-[4%] right-[4%] grid gap-6 md:grid-cols-3">
          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 text-white/[0.20] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.38em]">
              Founded in Magaluf
            </div>
            <p className="mt-4 text-[13px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
              A local pickup point designed for tourists who want simple,
              reliable mobility from the centre of Magaluf.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 text-white/[0.20] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.38em]">
              Ride Mallorca
            </div>
            <p className="mt-4 text-[13px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
              Beach routes, mountain roads, coastal views, nearby towns and fast
              movement without depending on transport.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-6 text-white/[0.20] backdrop-blur-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.38em]">
              Fast Handover
            </div>
            <p className="mt-4 text-[13px] font-semibold uppercase leading-[1.8] tracking-[0.13em]">
              Bring your licence and ID, collect your vehicle, get the
              instructions and start riding in minutes.
            </p>
          </div>
        </div>

        <div className="absolute left-[-5%] top-[34%] text-[clamp(54px,8vw,132px)] font-black uppercase leading-none tracking-[-0.09em] text-white/[0.10]">
          NEXA RENTALS
        </div>

        <div className="absolute right-[-5%] top-[48%] text-[clamp(44px,7vw,112px)] font-black uppercase leading-none tracking-[-0.09em] text-white/[0.08]">
          MAGALUF PICKUP
        </div>

        <div className="absolute inset-0 opacity-55 [background-image:radial-gradient(circle,rgba(255,255,255,0.26)_1px,transparent_1.5px)] [background-size:24px_24px]" />
      </div>

      {/* DESKTOP ORIGINAL VERSION */}
      <div className="nexa-location-desktop-layout relative mx-auto grid max-w-[1180px] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div className="relative">
          <div className="relative overflow-hidden rounded-[22px] border border-white/13 bg-white/[0.025] p-2 shadow-[0_22px_65px_rgba(0,0,0,0.5)]">
            <div className="relative overflow-hidden rounded-[16px] border border-white/10 bg-white">
              <iframe
                title="NEXA Rentals Magaluf location map"
                src={GOOGLE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[285px] w-full sm:h-[315px] lg:h-[350px]"
                style={{
                  border: 0,
                  filter: "brightness(1.06) contrast(0.98) saturate(1.1)",
                }}
                allowFullScreen
              />

              <div className="pointer-events-none absolute inset-0 rounded-[16px] shadow-[inset_0_0_20px_rgba(255,255,255,0.22),inset_0_0_12px_rgba(0,0,0,0.04)]" />

              <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-black/10 bg-white/92 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-black/78 shadow-[0_8px_22px_rgba(0,0,0,0.13)] backdrop-blur-md">
                Interactive Map
              </div>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 left-4 rounded-full border border-black/10 bg-white/94 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.17em] text-black/80 shadow-[0_8px_22px_rgba(0,0,0,0.15)] backdrop-blur-md transition duration-300 hover:scale-[1.04] hover:bg-black hover:text-white"
              >
                View larger map
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="mb-5">
            <div className="mb-3 text-[9px] font-black uppercase tracking-[0.58em] text-white/52">
              Location
            </div>

            <h2
              className="max-w-[560px] text-[38px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[46px] lg:text-[52px]"
              style={{ fontFamily: montserrat.style.fontFamily }}
            >
              Find Us in Magaluf
            </h2>

            <div className="mt-4 h-px w-16 bg-white/55" />

            <p className="mt-5 max-w-[520px] text-[14px] font-medium leading-[1.75] tracking-[-0.02em] text-white/70 sm:text-[15px]">
              Visit our pickup point in Magaluf. Easy directions and fast
              handover before your ride.
            </p>
          </div>

          <div className="flex items-start gap-3 border-b border-white/10 pb-4">
            <div className="mt-0.5 text-white/78">
              <LocationIcon />
            </div>

            <p className="max-w-[520px] text-[13.5px] font-semibold leading-[1.55] tracking-[-0.02em] text-white/80 sm:text-[14.5px]">
              {LOCATION_ADDRESS}
            </p>
          </div>

          <div className="grid gap-4 border-b border-white/10 py-4 md:grid-cols-[0.95fr_1fr] md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[16px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[17px]">
                  09:00 – 14:00
                </div>

                <div className="mt-0.5 text-[16px] font-bold leading-tight tracking-[-0.04em] text-white sm:text-[17px]">
                  15:00 – 20:00
                </div>

                <div className="mt-1.5 text-[8.5px] font-black uppercase tracking-[0.2em] text-white/38">
                  Every day
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-white/10 md:pl-5">
              <div
                className={`inline-flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-[9.5px] font-black uppercase tracking-[0.18em] ${statusClasses}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? "Checking"}
              </div>

              <div className="mt-2 text-[12px] font-semibold text-white/72">
                {status?.subLabel ?? "Checking local time"}
              </div>

              <div className="mt-0.5 text-[10.5px] text-white/34">
                Local time in Mallorca: {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>

          <a
            href={GOOGLE_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            className="nexa-location-pulse group mt-5 flex w-full items-center justify-between rounded-[16px] bg-white px-5 py-4 text-black shadow-[0_0_32px_rgba(255,255,255,0.2)] transition duration-300 hover:bg-neutral-100"
          >
            <span className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-110">
                <MapIcon />
              </span>

              <span className="text-[16px] font-black tracking-[-0.035em] sm:text-[18px]">
                Open in your maps
              </span>
            </span>

            <span className="text-3xl font-light leading-none transition duration-300 group-hover:translate-x-1">
              ›
            </span>
          </a>
        </div>
      </div>

      {/* MOBILE ONLY COMPACT VERSION */}
      <div className="nexa-location-mobile-layout relative mx-auto hidden w-full max-w-[430px]">
        <div className="nexa-location-mobile-top grid grid-cols-[44%_1fr] items-stretch gap-3">
          <div className="nexa-location-mobile-map min-w-0">
            <div className="relative h-full w-full overflow-hidden rounded-[16px] border border-white/12 bg-white p-[2px] shadow-[0_16px_38px_rgba(0,0,0,0.5)]">
              <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-white">
                <iframe
                  title="NEXA Rentals Magaluf location map mobile"
                  src={GOOGLE_MAP_EMBED_URL}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                  style={{
                    border: 0,
                    filter: "brightness(1.06) contrast(0.98) saturate(1.1)",
                  }}
                  allowFullScreen
                />

                <div className="pointer-events-none absolute inset-0 rounded-[14px] shadow-[inset_0_0_16px_rgba(255,255,255,0.25),inset_0_0_8px_rgba(0,0,0,0.08)]" />

                <div className="pointer-events-none absolute left-[7px] top-[7px] rounded-full border border-black/10 bg-white/92 px-[7px] py-[4px] text-[5.6px] font-black uppercase tracking-[0.14em] text-black/75 shadow-[0_8px_18px_rgba(0,0,0,0.13)] backdrop-blur-md">
                  Interactive Map
                </div>

                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-[7px] left-[7px] rounded-full border border-black/10 bg-white/94 px-[7px] py-[4px] text-[5.6px] font-black uppercase tracking-[0.11em] text-black/80 shadow-[0_8px_18px_rgba(0,0,0,0.15)] backdrop-blur-md"
                >
                  View larger map
                </a>
              </div>
            </div>
          </div>

          <div className="nexa-location-mobile-info min-w-0 border-b border-white/10 pb-1">
            <div className="text-[6px] font-black uppercase tracking-[0.35em] text-white/42">
              Location
            </div>

            <h2
              className="mt-[6px] text-[21px] font-black leading-[0.94] tracking-[-0.07em] text-white"
              style={{ fontFamily: montserrat.style.fontFamily }}
            >
              Find Us in Magaluf
            </h2>

            <div className="mt-[8px] h-px w-[32px] bg-white/45" />

            <div className="mt-[10px] flex items-start gap-[7px]">
              <div className="mt-[1px] flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/[0.035] text-white">
                <ClockIcon />
              </div>

              <div>
                <div className="text-[11px] font-bold leading-[1.08] tracking-[-0.04em] text-white">
                  09:00 – 14:00
                </div>

                <div className="mt-[2px] text-[11px] font-bold leading-[1.08] tracking-[-0.04em] text-white">
                  15:00 – 20:00
                </div>

                <div className="mt-[4px] text-[6px] font-black uppercase tracking-[0.16em] text-white/36">
                  Every day
                </div>
              </div>
            </div>

            <div className="mt-[10px]">
              <div
                className={`inline-flex items-center gap-[5px] rounded-[7px] border px-[7px] py-[4px] text-[6.5px] font-black uppercase tracking-[0.15em] ${statusClasses}`}
              >
                <span
                  className={`h-[5px] w-[5px] rounded-full ${
                    status?.isOpen ? "bg-emerald-300" : "bg-red-300"
                  }`}
                />

                {status?.label ?? "Checking"}
              </div>

              <div className="mt-[5px] text-[8px] font-semibold leading-[1.25] text-white/70">
                {status?.subLabel ?? "Checking local time"}
              </div>

              <div className="mt-[2px] text-[7px] leading-[1.25] text-white/34">
                Mallorca: {status?.localTime ?? "--:--"}
              </div>
            </div>
          </div>
        </div>

        <a
          href={GOOGLE_DIRECTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="nexa-location-pulse group mt-[13px] flex w-full items-center justify-between rounded-[14px] bg-white px-[13px] py-[11px] text-black shadow-[0_0_26px_rgba(255,255,255,0.22)] transition duration-300 hover:bg-neutral-100"
        >
          <span className="flex items-center gap-[9px]">
            <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-black text-white transition duration-300 group-hover:scale-110">
              <MapIcon />
            </span>

            <span className="text-[12px] font-black tracking-[-0.035em]">
              Open in your maps
            </span>
          </span>

          <span className="text-[22px] font-light leading-none transition duration-300 group-hover:translate-x-1">
            ›
          </span>
        </a>
      </div>


      {locale === "fr" && (
        <div className="relative mx-auto mt-5 w-full max-w-[1180px] px-1 text-center">
          <a
            href="/fr/location-scooter-magaluf"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.045] px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/82 transition hover:border-white/24 hover:bg-white/[0.08] hover:text-white"
          >
            Location scooter Magaluf
          </a>
        </div>
      )}

      <style>{`
        .nexa-location-cursor-active .nexa-location-reveal {
          opacity: 1;
        }

        .nexa-location-reveal {
          -webkit-mask-image: radial-gradient(
            circle 320px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.95) 32%,
            rgba(0, 0, 0, 0.5) 58%,
            transparent 78%
          );
          mask-image: radial-gradient(
            circle 320px at var(--nexa-x) var(--nexa-y),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 0.95) 32%,
            rgba(0, 0, 0, 0.5) 58%,
            transparent 78%
          );
        }

        .nexa-location-mobile-layout {
          display: none;
        }

        @keyframes nexaLocationPulse {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 24px rgba(255, 255, 255, 0.16),
              0 14px 34px rgba(0, 0, 0, 0.3);
          }

          18% {
            transform: scale(1.025);
            box-shadow:
              0 0 46px rgba(255, 255, 255, 0.28),
              0 18px 44px rgba(0, 0, 0, 0.34);
          }

          34% {
            transform: scale(1);
            box-shadow:
              0 0 26px rgba(255, 255, 255, 0.17),
              0 14px 34px rgba(0, 0, 0, 0.3);
          }

          52% {
            transform: scale(1.014);
            box-shadow:
              0 0 38px rgba(255, 255, 255, 0.23),
              0 16px 40px rgba(0, 0, 0, 0.32);
          }

          70%,
          100% {
            transform: scale(1);
          }
        }

        .nexa-location-pulse {
          position: relative;
          overflow: hidden;
          animation: nexaLocationPulse 1.8s ease-in-out infinite;
          will-change: transform, box-shadow;
        }

        .nexa-location-pulse::after {
          content: "";
          position: absolute;
          inset: -65% auto -65% -50%;
          width: 32%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.9),
            transparent
          );
          opacity: 0.72;
          animation: nexaLocationShine 2.5s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes nexaLocationShine {
          0% {
            left: -50%;
          }

          48%,
          100% {
            left: 128%;
          }
        }

        .nexa-location-pulse:hover {
          animation-play-state: paused;
          transform: scale(1.02);
          box-shadow:
            0 0 56px rgba(255, 255, 255, 0.32),
            0 24px 56px rgba(0, 0, 0, 0.42);
        }

        .nexa-location-pulse:active {
          transform: scale(0.98);
        }

        @media (max-width: 767px) {
          #location {
            padding: 22px 12px 28px !important;
          }

          .nexa-location-desktop-layout {
            display: none !important;
          }

          .nexa-location-mobile-layout {
            display: block !important;
          }

          .nexa-location-mobile-map {
            height: 184px !important;
          }

          .nexa-location-reveal {
            display: none !important;
          }
        }

        @media (max-width: 390px) {
          .nexa-location-mobile-top {
            grid-template-columns: 42% 1fr !important;
            gap: 10px !important;
          }

          .nexa-location-mobile-map {
            height: 176px !important;
          }

          .nexa-location-mobile-info h2 {
            font-size: 20px !important;
          }
        }

        @media (max-width: 350px) {
          .nexa-location-mobile-top {
            grid-template-columns: 40% 1fr !important;
            gap: 9px !important;
          }

          .nexa-location-mobile-map {
            height: 168px !important;
          }

          .nexa-location-mobile-info h2 {
            font-size: 18px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-location-pulse,
          .nexa-location-pulse::after {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function EbikeWhatsAppPanel({
  vehicleName,
  copy,
}: {
  vehicleName: string;
  copy: ShowroomCopy;
}) {
  const whatsappMessage = copy.whatsappMessage(vehicleName);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="nexa-ebike-panel relative z-20 w-full rounded-[28px] border border-black/10 bg-white p-4 text-black shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="rounded-[18px] border border-black/10 bg-[linear-gradient(135deg,#ff7a00_0%,#ff9f1c_45%,#ffc15a_100%)]/[0.03] px-3 py-3">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
          {copy.vehicle}
        </div>
        <div className="mt-0.5 truncate text-[15px] font-black text-black">
          {vehicleName}
        </div>
      </div>

      <div className="mt-3 rounded-[18px] border border-black/10 bg-black/[0.03] p-3">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-black/46">
          {copy.ebikePrices}
        </div>

        <div className="mt-3 space-y-2">
          {EBIKE_PRICES.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[14px] border border-black/10 bg-white px-3 py-2.5"
            >
              <span className="text-[12px] font-black uppercase tracking-[0.06em] text-black/72">
                {translateVehicleLabel(item.label, copy)}
              </span>

              <span className="text-[20px] font-black leading-none tracking-[-0.05em] text-black">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-[16px] border border-emerald-500/20 bg-emerald-50 px-3 py-3 text-[17px] font-black leading-5 text-emerald-700">
        {copy.ebikeAvailability}
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ebike-whatsapp-button mt-3 flex w-full items-center justify-center rounded-[16px] bg-[#25D366] px-5 py-4 text-[13px] font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(37,211,102,0.36)] transition hover:-translate-y-1 hover:bg-[#1fc15b] hover:shadow-[0_24px_58px_rgba(37,211,102,0.46)] active:translate-y-0 active:scale-[0.97]"
      >
        {copy.whatsappButton}
      </a>

      <style>{`
        .nexa-ebike-panel {
          max-width: 410px;
        }

        .ebike-whatsapp-button {
          animation: ebikeWhatsappHeartbeat 1.75s ease-in-out infinite;
        }

        .ebike-whatsapp-button:hover {
          animation: none;
        }

        @keyframes ebikeWhatsappHeartbeat {
          0% {
            transform: scale(1);
          }

          14% {
            transform: scale(1.025);
          }

          28% {
            transform: scale(1);
          }

          42% {
            transform: scale(1.018);
          }

          58% {
            transform: scale(1);
          }

          100% {
            transform: scale(1);
          }
        }

        @media (max-width: 767px) {
          .nexa-ebike-panel {
            max-width: 100%;
            border-radius: 22px;
            padding: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ebike-whatsapp-button {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ================================================================
// MOBILE SCOOTER IMAGE CONTROLS - EDIT THESE VALUES YOURSELF
// This affects MOBILE ONLY. Desktop is completely unchanged.
// Positive moveRightPx = right; negative = left.
// Positive moveDownPx = down; negative = up.
// Increase widthPx to make scooter bigger; decrease to shrink it.
// topPercent and leftPercent set the starting position on screen.
// ================================================================
const MOBILE_SCOOTER_IMAGE = {
  widthPx: 390,
  topPercent: 53,
  leftPercent: 50,
  moveRightPx: 0,
  moveDownPx: 0,
} as const;

// MOBILE ONLY: independent scooter image adjustments (384 x 694 canvas).
// Liberty stays at its original 390px size and original position.
// widthPx: bigger/smaller; moveRightPx: +right/-left; moveDownPx: +down/-up.
// These settings change the scooter picture ONLY, never the other UI elements.
const MOBILE_SCOOTER_PER_VEHICLE: Record<string, { widthPx: number; moveRightPx: number; moveDownPx: number }> = {
  "piaggio-liberty": { widthPx: 390, moveRightPx: 0, moveDownPx: 0 },
  "kymco-sky-town": { widthPx: 320, moveRightPx: 0, moveDownPx: -15 },
  "sym-symphony": { widthPx: 335, moveRightPx: 0, moveDownPx: -18 },
};

// MOBILE ONLY: brand/model heading adjustments for Kymco and SYM.
// Piaggio's original heading remains completely untouched.
const MOBILE_ALTERNATE_HEADING = {
  topPx: 95,
  moveRightPx: 0,
  moveDownPx: 0,
  logoWidthPx: 90,
  gapPx: 7,
  modelFontSizePx: 20,
  ccFontSizePx: 13,
  ccGapPx: 5,
} as const;

// MOBILE ONLY: independent manual left/right and up/down offsets per scooter.
// Negative moveRightPx = left. These are additive to the existing positions.
// Image and video positioning are intentionally NOT connected to these controls.
const MOBILE_TEXT_PER_VEHICLE: Record<string, {
  logo: { moveRightPx: number; moveDownPx: number };
  model: { moveRightPx: number; moveDownPx: number };
  from: { moveRightPx: number; moveDownPx: number };
  amount: { moveRightPx: number; moveDownPx: number };
  inclusive: { moveRightPx: number; moveDownPx: number };
}> = {
  "piaggio-liberty": {
    logo: { moveRightPx: 0, moveDownPx: 0 },
    model: { moveRightPx: 0, moveDownPx: 0 },
    from: { moveRightPx: 0, moveDownPx: 0 },
    amount: { moveRightPx: 0, moveDownPx: 0 },
    inclusive: { moveRightPx: 0, moveDownPx: 0 },
  },
  "kymco-sky-town": {
    logo: { moveRightPx: -20, moveDownPx: 0 },
    model: { moveRightPx: -20, moveDownPx: 0 },
    from: { moveRightPx: -12, moveDownPx: -10 },
    amount: { moveRightPx: -12, moveDownPx: -5 },
    inclusive: { moveRightPx: -12, moveDownPx: -11 },
  },
  "sym-symphony": {
    logo: { moveRightPx: -12, moveDownPx: 0 },
    model: { moveRightPx: -12, moveDownPx: 0 },
    from: { moveRightPx: -12, moveDownPx: 0 },
    amount: { moveRightPx: -12, moveDownPx: 0 },
    inclusive: { moveRightPx: -12, moveDownPx: 0 },
  },
};

// The heading and three price lines enter together on each mobile scooter change.
const MOBILE_TEXT_ENTRANCE = { durationMs: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)" } as const;

// Horizontal slide travel and easing; changing durationMs changes animation speed.
const MOBILE_SCOOTER_SLIDE_ANIMATION = { durationMs: 680, easing: "cubic-bezier(0.22, 1, 0.36, 1)" } as const;

// MOBILE ONLY: adjust each component independently. Positive X = right,
// negative X = left; positive Y = down, negative Y = up.
const MOBILE_SHOWROOM_CONTROLS = {
  logo: { widthPx: 90, topPx: 96, moveRightPx: -100, moveDownPx: 0 },
  model: { fontSizePx: 20, ccFontSizePx: 13, topPx: 95, moveRightPx: 20, moveDownPx: 0, fontWeight: 700, letterSpacingEm: -0.025, ccGapPx: 6 },
  // Mobile-only pricing. Each line has its own independent position and typography.
  price: {
    moveRightPx: -105,
    moveDownPx: 0,
    topPx: 158,
    from: { text: "From", moveRightPx: 10, moveDownPx: -30, fontSizePx: 14, fontWeight: 500, color: "#F47719", letterSpacingEm: 0.01 },
    amount: { text: "34€", moveRightPx: 55, moveDownPx: -50, fontSizePx: 58, fontWeight: 800, color: "#111111", letterSpacingEm: -0.075 },
    inclusive: { text: "all-inclusive", moveRightPx: 55, moveDownPx: -50, fontSizePx: 14, fontWeight: 400, color: "#333333", letterSpacingEm: 0.025 },
    fromToAmountGapPx: 0,
    amountToInclusiveGapPx: 1,
  },
  indicators: { bottomPx: 163, moveRightPx: 0, moveDownPx: -15, activeWidthPx: 28, dotSizePx: 8, gapPx: 10,
    arrowSizePx: 26, arrowIconSizePx: 17, arrowGapPx: 17, arrowColor: "#44474D" },
  // Increase bottomPx to move the CTA UP; decrease it to move DOWN. Positive moveDownPx moves it DOWN.
  button: { widthPx: 255, heightPx: 48, bottomPx: 75, moveRightPx: 0, moveDownPx: 0, fontSizePx: 14, fontWeight: 700, letterSpacingEm: 0.065, borderRadiusPx: 28, shineEnabled: true, shineDurationSeconds: 2, shineDelaySeconds: 0 },
} as const;

// MOBILE ONLY: POPULAR SCOOTER badge for the Piaggio Liberty (384 x 694 stage).
// Choose which EDGE to measure from, then adjust its distance in pixels.
// horizontalAnchor: "left" uses leftPx; "right" uses rightPx.
// verticalAnchor: "top" uses topPx; "bottom" uses bottomPx.
// moveRightPx: positive = right; negative = left.
// moveDownPx: positive = down; negative = up.
// These settings affect ONLY the mobile badge, not the scooter or other text.
const MOBILE_MOST_POPULAR_BADGE = {
  horizontalAnchor: "left" as "left" | "right",
  verticalAnchor: "top" as "top" | "bottom",
  topPx: 210,
  bottomPx: 0,
  leftPx: 120,
  rightPx: 0,
  moveRightPx: 0,
  moveDownPx: 0,
  scale: 0.70,
} as const;

// Mobile-only translated CTA. Model names, prices and measurements remain unchanged.
const MOBILE_SELECT_SCOOTER_LABEL: Record<ShowroomLocale, string> = {
  en: "Select This Scooter",
  es: "Seleccionar esta moto",
  de: "Diesen Roller auswählen",
  fr: "Choisir ce scooter",
  it: "Seleziona questo scooter",
  nl: "Selecteer deze scooter",
  pl: "Wybierz ten skuter",
  sv: "Välj denna skoter",
  da: "Vælg denne scooter",
  no: "Velg denne scooteren",
  pt: "Selecionar esta scooter",
  sr: "Izaberite ovaj skuter",
  uk: "Обрати цей скутер",
};

// Reference layout measured on the Galaxy S25 Ultra in Chrome.
// Every mobile showroom element is laid out on this single fixed-size stage.
// Only the whole stage is scaled, so its internal proportions never change.
const MOBILE_SHOWROOM_REFERENCE = { width: 384, height: 694 } as const;

// Brand logos for the three mobile scooter slides.
const MOBILE_BRAND_LOGOS: Record<string, string | null> = {
  "piaggio-liberty": "/images/piaggiologo.png",
  "kymco-sky-town": "/images/logokymco.png",
  "sym-symphony": "/images/logosym.png",
  "ebike-one": null,
  "ebike-two": null,
};
const MOBILE_BRAND_NAMES: Record<string, string> = {
  "piaggio-liberty": "PIAGGIO",
  "kymco-sky-town": "KYMCO",
  "sym-symphony": "SYM",
  "ebike-one": "MOMA",
  "ebike-two": "CECOTEC",
};

export default function NexaBookingShowroomV3() {
  const activeLocale = useLocale();
  const showroomLocale = normalizeShowroomLocale(activeLocale);
  const copy = SHOWROOM_COPY[showroomLocale];
  const mobileHeroMicrocopy = MOBILE_HERO_MICROCOPY[showroomLocale];
  const extrasCopy = SHOWROOM_EXTRAS_COPY[showroomLocale];
  const [activeIndex, setActiveIndex] = useState(0);
  // Desktop-only booking popup. Mobile continues to use its existing booking route.
  const [desktopBookingOpen, setDesktopBookingOpen] = useState(false);

  useEffect(() => {
    if (!desktopBookingOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDesktopBookingOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [desktopBookingOpen]);
  // Desktop-only carousel state. Pre-mounted images animate in; outgoing images hide immediately.
  const [desktopMotion, setDesktopMotion] = useState<{
    from: number; to: number; direction: "left" | "right"; token: number;
  } | null>(null);
  const [desktopHasNavigated, setDesktopHasNavigated] = useState(false);
  const desktopMotionTimer = useRef<number | null>(null);
  const desktopMotionToken = useRef(0);
  useEffect(() => () => {
    if (desktopMotionTimer.current) window.clearTimeout(desktopMotionTimer.current);
  }, []);
  const [mobileHeroIndex, setMobileHeroIndex] = useState(0);
  const mobileTextOffsets = MOBILE_TEXT_PER_VEHICLE[MOBILE_DIRECT_HERO_SLIDES[mobileHeroIndex]?.vehicleId ?? "piaggio-liberty"] ?? MOBILE_TEXT_PER_VEHICLE["piaggio-liberty"];
  const [bookingPanelAttention, setBookingPanelAttention] = useState(false);
  const bookingAttentionTimeoutRef = useRef<number | null>(null);
  const mobileSwipeStartX = useRef<number | null>(null);
  const mobileSwipeStartY = useRef<number | null>(null);
  const mobileShowroomViewportRef = useRef<HTMLDivElement | null>(null);
  // The first paint uses a safe fit scale; ResizeObserver then refines it for the
  // actual visual viewport without altering the reference-stage proportions.
  const [mobileShowroomScale, setMobileShowroomScale] = useState(1);

  useEffect(() => {
    const viewport = mobileShowroomViewportRef.current;
    if (!viewport) return;

    const updateScale = () => {
      const { width, height } = viewport.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      // Fit both dimensions; do not distort or independently resize elements.
      setMobileShowroomScale(
        Math.min(
          width / MOBILE_SHOWROOM_REFERENCE.width,
          height / MOBILE_SHOWROOM_REFERENCE.height
        )
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    window.addEventListener("resize", updateScale, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);


  const slideCount = DESKTOP_SCOOTER_SLIDES.length;
  const mobileHeroSlideCount = MOBILE_DIRECT_HERO_SLIDES.length;

  const activeVehicle = useMemo(() => {
    return DESKTOP_SCOOTER_SLIDES[activeIndex] || DESKTOP_SCOOTER_SLIDES[0];
  }, [activeIndex]);

  const activeMobileHeroSlide = useMemo(() => {
    return (
      MOBILE_DIRECT_HERO_SLIDES[mobileHeroIndex] || MOBILE_DIRECT_HERO_SLIDES[0]
    );
  }, [mobileHeroIndex]);

  const isActiveVehicleEbike = activeVehicle.id.startsWith("ebike");

const isDesktopShowroomViewport = () => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(min-width: 1024px)").matches;
};

const forceDesktopShowroomTop = () => {
  if (!isDesktopShowroomViewport()) return;

  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.scrollBehavior = "auto";

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const bookingSection = document.getElementById("booking");

  if (bookingSection) {
    bookingSection.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }

  window.dispatchEvent(new Event("scroll"));
  window.dispatchEvent(new Event("resize"));
};

const syncMobileVehicleToDesktopVehicle = (mobileIndex: number) => {
    const mobileSlide =
      MOBILE_DIRECT_HERO_SLIDES[mobileIndex] || MOBILE_DIRECT_HERO_SLIDES[0];

    const matchedVehicleIndex = DESKTOP_SCOOTER_SLIDES.findIndex(
      (vehicle) => vehicle.id === mobileSlide.vehicleId
    );

    if (matchedVehicleIndex >= 0) {
      setActiveIndex(matchedVehicleIndex);
    }
  };

  const changeDesktopScooter = (nextIndex: number, direction: "left" | "right") => {
    if (nextIndex === activeIndex) return;
    if (desktopMotionTimer.current) window.clearTimeout(desktopMotionTimer.current);
    const token = ++desktopMotionToken.current;
    setDesktopHasNavigated(true);
    setDesktopMotion({ from: activeIndex, to: nextIndex, direction, token });
    setActiveIndex(nextIndex);
    const timerId = window.setTimeout(() => {
  setDesktopMotion((current) =>
    current?.token === token ? null : current
  );
  desktopMotionTimer.current = null;
}, 760);

desktopMotionTimer.current = timerId;
  };

  const goToPrevious = () => changeDesktopScooter(
    activeIndex === 0 ? slideCount - 1 : activeIndex - 1, "left"
  );

  const goToNext = () => changeDesktopScooter(
    activeIndex === slideCount - 1 ? 0 : activeIndex + 1, "right"
  );

  const goToPreviousMobileHero = () => {
    setMobileHeroIndex((current) => {
      const nextIndex = current === 0 ? mobileHeroSlideCount - 1 : current - 1;
      syncMobileVehicleToDesktopVehicle(nextIndex);
      return nextIndex;
    });
  };

  const goToNextMobileHero = () => {
    setMobileHeroIndex((current) => {
      const nextIndex = current === mobileHeroSlideCount - 1 ? 0 : current + 1;
      syncMobileVehicleToDesktopVehicle(nextIndex);
      return nextIndex;
    });
  };

  const triggerBookingPanelAttention = () => {
    if (bookingAttentionTimeoutRef.current) {
      window.clearTimeout(bookingAttentionTimeoutRef.current);
    }

    setBookingPanelAttention(false);

    window.setTimeout(() => {
      setBookingPanelAttention(true);
    }, 30);

    bookingAttentionTimeoutRef.current = window.setTimeout(() => {
      setBookingPanelAttention(false);
      bookingAttentionTimeoutRef.current = null;
    }, 3000);
  };

  const getBookingTargetElement = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      return (
        document.getElementById("mobile-booking-panel") ||
        document.getElementById("booking")
      );
    }

    return document.getElementById("booking");
  };

  const handleBookNowClick = () => {
  if (typeof window !== "undefined" && window.innerWidth < 1024) {
    const locale =
      window.location.pathname.split("/").filter(Boolean)[0] || "en";

    const vehicleId = activeMobileHeroSlide.vehicleId;

    window.location.href = `/${locale}/mobile-booking?vehicle=${encodeURIComponent(
      vehicleId,
    )}`;

    return;
  }

  // Desktop: open the actual BookingPanelV3 as a centered modal.
  // The mobile branch above is intentionally unchanged.
  setDesktopBookingOpen(true);
};

  useEffect(() => {
  const runDesktopTopReset = () => {
    forceDesktopShowroomTop();
  };

  const handleGlobalBookClick = () => {
    if (isDesktopShowroomViewport()) {
      setDesktopBookingOpen(true);
      return;
    }

    // Preserve existing mobile event handling.
    const bookingElement = getBookingTargetElement();
    if (bookingElement) {
      bookingElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    forceDesktopShowroomTop();
    triggerBookingPanelAttention();
  };

  forceDesktopShowroomTop();

  const frameOne = window.requestAnimationFrame(() => {
    forceDesktopShowroomTop();

    window.requestAnimationFrame(() => {
      forceDesktopShowroomTop();
    });
  });

  const timerOne = window.setTimeout(runDesktopTopReset, 120);
  const timerTwo = window.setTimeout(runDesktopTopReset, 350);
  const timerThree = window.setTimeout(runDesktopTopReset, 700);

  window.addEventListener("nexa:book-now-clicked", handleGlobalBookClick);

  if (window.__nexaTriggerBookingPanelAttention) {
    window.__nexaTriggerBookingPanelAttention = false;

    window.setTimeout(() => {
      if (isDesktopShowroomViewport()) {
        setDesktopBookingOpen(true);
      } else {
        forceDesktopShowroomTop();
        triggerBookingPanelAttention();
      }
    }, 450);
  }

  return () => {
    window.cancelAnimationFrame(frameOne);
    window.clearTimeout(timerOne);
    window.clearTimeout(timerTwo);
    window.clearTimeout(timerThree);

    window.removeEventListener("nexa:book-now-clicked", handleGlobalBookClick);

    if (bookingAttentionTimeoutRef.current) {
      window.clearTimeout(bookingAttentionTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  if (typeof window === "undefined") return;

  let lastMobileScrollAt = 0;
  let pendingFocusTimeout: number | null = null;

  const mobileMedia = window.matchMedia("(max-width: 1023px)");

  const isTypingElement = (element: EventTarget | null): element is HTMLElement => {
    if (!(element instanceof HTMLElement)) return false;

    const tag = element.tagName.toLowerCase();

    return (
      tag === "input" ||
      tag === "textarea" ||
      element.isContentEditable
    );
  };

  const handleMobileScroll = () => {
    if (!mobileMedia.matches) return;

    lastMobileScrollAt = performance.now();

    const activeElement = document.activeElement;

    if (isTypingElement(activeElement)) {
      activeElement.blur();
    }
  };

  const handleMobileFocusIn = (event: FocusEvent) => {
    if (!mobileMedia.matches) return;

    if (performance.now() - lastMobileScrollAt >= 1100) return;

    const element = event.target;

    if (!isTypingElement(element)) return;

    if (pendingFocusTimeout !== null) {
      window.clearTimeout(pendingFocusTimeout);
    }

    pendingFocusTimeout = window.setTimeout(() => {
      pendingFocusTimeout = null;

      if (
        mobileMedia.matches &&
        performance.now() - lastMobileScrollAt < 1100 &&
        document.activeElement === element
      ) {
        element.blur();
      }
    }, 0);
  };

  window.addEventListener("scroll", handleMobileScroll, {
    passive: true,
  });

  window.addEventListener("touchmove", handleMobileScroll, {
    passive: true,
  });

  document.addEventListener("focusin", handleMobileFocusIn);

  return () => {
    window.removeEventListener("scroll", handleMobileScroll);
    window.removeEventListener("touchmove", handleMobileScroll);
    document.removeEventListener("focusin", handleMobileFocusIn);

    if (pendingFocusTimeout !== null) {
      window.clearTimeout(pendingFocusTimeout);
    }
  };
}, []);

 return (
  <div id="nexa-showroom-v3" className="bg-black" style={{ minHeight: "100svh" }}>
    {/* Mobile navbar restored: outside the clipped hero so it stays visible on scroll. */}
    <div className="nexa-showroom-mobile-fixed-nav lg:hidden">
      <NavbarV3 onBookClick={handleBookNowClick} />
    </div>

      <section
        id="booking"
        className="relative isolate min-h-[100svh] w-full overflow-hidden bg-black text-white lg:h-screen lg:min-h-[640px]"
      >
        <div className="nexa-showroom-desktop-nav hidden lg:block">
          <NavbarV3 onBookClick={handleBookNowClick} />
        </div>

        {/* Desktop-only looping background video; mobile video remains unchanged. */}
        <div className="absolute inset-0 z-0 hidden overflow-hidden bg-black lg:block">
          <video autoPlay muted loop playsInline preload="auto"
          poster="/images/desktop-video-poster.webp"
            aria-label="NEXA Rentals desktop hero background"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: `brightness(${DESKTOP_HERO_TUNING.videoBrightness})`, transform: `translate(${DESKTOP_HERO_TUNING.videoMoveRightPercent}%, -${DESKTOP_HERO_TUNING.videoMoveUpPercent}%) scale(${DESKTOP_HERO_TUNING.videoScale})`, transformOrigin: "center center" }}>
            <source src="/videos/bigvideo2.mp4" type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: DESKTOP_HERO_TUNING.whiteWashOpacity }} />
        </div>

        {/* Mobile hero video background; mobile showroom overlay follows. */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black lg:hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/mobile-video-poster.webp"
            aria-label="NEXA Rentals hero video"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/herovideo.mp4" type="video/mp4" />
          </video>
        </div>

        {/* MOBILE ONLY: brand, model, swipeable scooter, indicators and booking CTA. */}
        <div
          ref={mobileShowroomViewportRef}
          className="pointer-events-none absolute inset-0 z-[5] overflow-hidden lg:hidden"
          aria-label="Choose your rental scooter"
        >
          <div
            className="pointer-events-auto absolute"
            style={{
              width: MOBILE_SHOWROOM_REFERENCE.width,
              height: MOBILE_SHOWROOM_REFERENCE.height,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) scale(${mobileShowroomScale})`,
              transformOrigin: "center center",
            }}
          >
          <style>{`@keyframes nexaMobileTextEnter { from { opacity: 0; transform: translate3d(-110%, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } } @media (prefers-reduced-motion: reduce) { .nexa-mobile-text-entrance { animation: none !important; } }`}</style>
          <div
            key={`mobile-text-${activeMobileHeroSlide.vehicleId}`}
            className="nexa-mobile-text-entrance pointer-events-none absolute inset-0 z-20"
            style={{ animation: `nexaMobileTextEnter ${MOBILE_TEXT_ENTRANCE.durationMs}ms ${MOBILE_TEXT_ENTRANCE.easing} both` }}
          >
          {activeMobileHeroSlide.vehicleId === "piaggio-liberty" ? (
            <>
          <div
            className="pointer-events-none absolute z-20 flex items-center justify-center"
            style={{ top: MOBILE_SHOWROOM_CONTROLS.logo.topPx + MOBILE_SHOWROOM_CONTROLS.logo.moveDownPx,
              left: `calc(50% + ${MOBILE_SHOWROOM_CONTROLS.logo.moveRightPx}px)`,
              width: MOBILE_SHOWROOM_CONTROLS.logo.widthPx, transform: "translateX(-50%)" }}
          >
            {MOBILE_BRAND_LOGOS[activeMobileHeroSlide.vehicleId] ? (
              <Image src={MOBILE_BRAND_LOGOS[activeMobileHeroSlide.vehicleId]!}
                alt={`${MOBILE_BRAND_NAMES[activeMobileHeroSlide.vehicleId]} logo`}
                width={600} height={260} priority={mobileHeroIndex === 0}
                className="h-auto w-full object-contain" />
            ) : (
              <span className="text-center text-3xl font-black tracking-[0.18em] text-white">
                {MOBILE_BRAND_NAMES[activeMobileHeroSlide.vehicleId]}
              </span>
            )}
          </div>
          <h2 className="pointer-events-none absolute z-20 w-full px-4 text-center font-bold tracking-[-0.025em] text-black"
            style={{ top: MOBILE_SHOWROOM_CONTROLS.model.topPx + MOBILE_SHOWROOM_CONTROLS.model.moveDownPx,
              left: MOBILE_SHOWROOM_CONTROLS.model.moveRightPx,
              fontSize: MOBILE_SHOWROOM_CONTROLS.model.fontSizePx, fontFamily: montserrat.style.fontFamily, fontWeight: MOBILE_SHOWROOM_CONTROLS.model.fontWeight, letterSpacing: `${MOBILE_SHOWROOM_CONTROLS.model.letterSpacingEm}em` }}>
            {activeMobileHeroSlide.vehicleId === "piaggio-liberty" ? (
              <span className="inline-flex items-baseline justify-center">
                <span>Liberty 125</span>
                <span style={{ fontSize: MOBILE_SHOWROOM_CONTROLS.model.ccFontSizePx, marginLeft: MOBILE_SHOWROOM_CONTROLS.model.ccGapPx, letterSpacing: "0.01em", fontWeight: 700 }}>CC</span>
              </span>
            ) : activeMobileHeroSlide.name}
          </h2>
          {/* MOBILE ONLY: Piaggio Liberty POPULAR SCOOTER label. */}
          <div
            className={`${montserrat.className} nexa-popular-badge pointer-events-none absolute z-30 inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border border-[#8B5CF6]/30 bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#A855F7] px-[9px] py-[5px] text-[8px] font-extrabold uppercase tracking-[0.065em] text-white shadow-[0_4px_13px_rgba(109,40,217,0.23)]`}
            style={{
              ...(MOBILE_MOST_POPULAR_BADGE.verticalAnchor === "top"
                ? { top: MOBILE_MOST_POPULAR_BADGE.topPx + MOBILE_MOST_POPULAR_BADGE.moveDownPx }
                : { bottom: MOBILE_MOST_POPULAR_BADGE.bottomPx - MOBILE_MOST_POPULAR_BADGE.moveDownPx }),
              ...(MOBILE_MOST_POPULAR_BADGE.horizontalAnchor === "left"
                ? { left: MOBILE_MOST_POPULAR_BADGE.leftPx + MOBILE_MOST_POPULAR_BADGE.moveRightPx }
                : { right: MOBILE_MOST_POPULAR_BADGE.rightPx - MOBILE_MOST_POPULAR_BADGE.moveRightPx }),
              transform: `translateX(${MOBILE_MOST_POPULAR_BADGE.horizontalAnchor === "left" ? "-50%" : "50%"}) scale(${MOBILE_MOST_POPULAR_BADGE.scale})`,
              transformOrigin: "center center",
            }}
          >
            <span aria-hidden="true">★</span> {extrasCopy.popularScooter}
          </div>

            </>
          ) : (
            <div className="pointer-events-none absolute z-20 flex items-center justify-center"
              style={{
                top: MOBILE_ALTERNATE_HEADING.topPx + MOBILE_ALTERNATE_HEADING.moveDownPx,
                left: `calc(50% + ${MOBILE_ALTERNATE_HEADING.moveRightPx}px)`,
                transform: "translateX(-50%)",
                gap: MOBILE_ALTERNATE_HEADING.gapPx,
                whiteSpace: "nowrap",
              }}>
              <Image
                src={MOBILE_BRAND_LOGOS[activeMobileHeroSlide.vehicleId]!}
                alt={`${MOBILE_BRAND_NAMES[activeMobileHeroSlide.vehicleId]} logo`}
                width={600} height={260}
                className="h-auto shrink-0 object-contain"
                style={{ width: MOBILE_ALTERNATE_HEADING.logoWidthPx, transform: `translate(${mobileTextOffsets.logo.moveRightPx}px, ${mobileTextOffsets.logo.moveDownPx}px)` }}
              />
              <span className="inline-flex shrink-0 items-baseline text-black"
                style={{ fontFamily: montserrat.style.fontFamily, fontSize: MOBILE_ALTERNATE_HEADING.modelFontSizePx, fontWeight: 700, letterSpacing: "-0.025em", transform: `translate(${mobileTextOffsets.model.moveRightPx}px, ${mobileTextOffsets.model.moveDownPx}px)` }}>
                <span>{activeMobileHeroSlide.vehicleId === "kymco-sky-town" ? "SkyTown 125" : "Symphony 125"}</span>
                <span style={{ fontSize: MOBILE_ALTERNATE_HEADING.ccFontSizePx, marginLeft: MOBILE_ALTERNATE_HEADING.ccGapPx, fontWeight: 700 }}>CC</span>
              </span>
            </div>
          )}

          {/* MOBILE ONLY: independently adjustable premium rental price. */}
          <div
            className="pointer-events-none absolute z-20 flex flex-col items-start"
            style={{
              top: MOBILE_SHOWROOM_CONTROLS.price.topPx + MOBILE_SHOWROOM_CONTROLS.price.moveDownPx,
              left: `calc(50% + ${MOBILE_SHOWROOM_CONTROLS.price.moveRightPx}px)`,
              fontFamily: montserrat.style.fontFamily,
            }}
          >
            <span style={{
              display: "block",
              transform: `translate(${MOBILE_SHOWROOM_CONTROLS.price.from.moveRightPx + mobileTextOffsets.from.moveRightPx - (copy.from.length > 5 ? Math.max(0, (copy.from.length - 4) * 9) : 0)}px, ${MOBILE_SHOWROOM_CONTROLS.price.from.moveDownPx + mobileTextOffsets.from.moveDownPx}px)`,
              fontSize: MOBILE_SHOWROOM_CONTROLS.price.from.fontSizePx,
              fontWeight: MOBILE_SHOWROOM_CONTROLS.price.from.fontWeight,
              color: MOBILE_SHOWROOM_CONTROLS.price.from.color,
              letterSpacing: `${MOBILE_SHOWROOM_CONTROLS.price.from.letterSpacingEm}em`,
              lineHeight: 1.25,
              whiteSpace: "nowrap",
            }}>{copy.from}</span>
            <span style={{
              display: "block",
              marginTop: MOBILE_SHOWROOM_CONTROLS.price.fromToAmountGapPx,
              transform: `translate(${MOBILE_SHOWROOM_CONTROLS.price.amount.moveRightPx + mobileTextOffsets.amount.moveRightPx}px, ${MOBILE_SHOWROOM_CONTROLS.price.amount.moveDownPx + mobileTextOffsets.amount.moveDownPx}px)`,
              fontSize: MOBILE_SHOWROOM_CONTROLS.price.amount.fontSizePx,
              fontWeight: MOBILE_SHOWROOM_CONTROLS.price.amount.fontWeight,
              backgroundImage: "linear-gradient(105deg, #FFB24A 0%, #FF8A24 45%, #E85B0C 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: `${MOBILE_SHOWROOM_CONTROLS.price.amount.letterSpacingEm}em`,
              lineHeight: 1.04,
              whiteSpace: "nowrap",
            }}>{MOBILE_SCOOTER_PRICES[activeMobileHeroSlide.vehicleId] ?? MOBILE_SHOWROOM_CONTROLS.price.amount.text}</span>
            <span style={{
              display: "block",
              marginTop: MOBILE_SHOWROOM_CONTROLS.price.amountToInclusiveGapPx,
              transform: `translate(${MOBILE_SHOWROOM_CONTROLS.price.inclusive.moveRightPx + mobileTextOffsets.inclusive.moveRightPx}px, ${MOBILE_SHOWROOM_CONTROLS.price.inclusive.moveDownPx + mobileTextOffsets.inclusive.moveDownPx}px)`,
              fontSize: MOBILE_SHOWROOM_CONTROLS.price.inclusive.fontSizePx,
              fontWeight: MOBILE_SHOWROOM_CONTROLS.price.inclusive.fontWeight,
              color: MOBILE_SHOWROOM_CONTROLS.price.inclusive.color,
              letterSpacing: `${MOBILE_SHOWROOM_CONTROLS.price.inclusive.letterSpacingEm}em`,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
            }}>{copy.allInclusive.toLowerCase()}</span>
          </div>

          </div>

          {/* Swipe gestures are handled ONLY on the scooter image region. */}
          <div role="group" aria-label={`Scooter ${mobileHeroIndex + 1} of ${mobileHeroSlideCount}: ${activeMobileHeroSlide.name}. Swipe horizontally to change scooter.`}
            className="absolute z-10 select-none"
            style={{ width: MOBILE_SCOOTER_IMAGE.widthPx,
              top: `${MOBILE_SCOOTER_IMAGE.topPercent}%`,
              left: `${MOBILE_SCOOTER_IMAGE.leftPercent}%`,
              transform: `translate(calc(-50% + ${MOBILE_SCOOTER_IMAGE.moveRightPx}px), calc(-50% + ${MOBILE_SCOOTER_IMAGE.moveDownPx}px))`,
              touchAction: "pan-y" }}
            onTouchStart={(event) => {
              mobileSwipeStartX.current = event.touches[0]?.clientX ?? null;
              mobileSwipeStartY.current = event.touches[0]?.clientY ?? null;
            }}
            onTouchEnd={(event) => {
              const startX = mobileSwipeStartX.current;
              const startY = mobileSwipeStartY.current;
              mobileSwipeStartX.current = null;
              mobileSwipeStartY.current = null;
              if (startX === null || startY === null) return;
              const dx = (event.changedTouches[0]?.clientX ?? startX) - startX;
              const dy = (event.changedTouches[0]?.clientY ?? startY) - startY;
              if (mobileHeroSlideCount > 1 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                if (dx < 0) goToNextMobileHero();
                else goToPreviousMobileHero();
              }
            }}>
            <div className="relative w-full" style={{ aspectRatio: "1 / 1", overflow: "visible" }}>
              {MOBILE_DIRECT_HERO_SLIDES.map((slide, index) => {
                const imageControls = MOBILE_SCOOTER_PER_VEHICLE[slide.vehicleId];
                // Stable, mounted slides allow real horizontal movement instead of popping into place.
                const relativePosition = index - mobileHeroIndex;
                return (
                  <div key={slide.id} className="absolute inset-0 flex items-center justify-center"
                    aria-hidden={index !== mobileHeroIndex}
                    style={{
                      transform: `translate3d(${relativePosition * 110}%, 0, 0)`,
                      opacity: Math.abs(relativePosition) > 1 ? 0 : 1,
                      transition: `transform ${MOBILE_SCOOTER_SLIDE_ANIMATION.durationMs}ms ${MOBILE_SCOOTER_SLIDE_ANIMATION.easing}, opacity ${MOBILE_SCOOTER_SLIDE_ANIMATION.durationMs}ms ease`,
                      pointerEvents: index === mobileHeroIndex ? "auto" : "none",
                      willChange: "transform",
                    }}>
                    <Image src={slide.image} alt={slide.alt} width={1200} height={1200}
                      priority={index === 0} draggable={false}
                      className="h-auto max-w-none select-none object-contain"
                      style={{
                        width: imageControls.widthPx,
                        transform: `translate(${imageControls.moveRightPx}px, ${imageControls.moveDownPx}px)`,
                      }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Slider arrows and indicators. Navigation becomes active when more scooter slides exist. */}
          <div className="absolute z-20 flex items-center justify-center"
            aria-label={`${activeMobileHeroSlide.name}: ${mobileHeroIndex + 1} / ${mobileHeroSlideCount}`}
            style={{ bottom: MOBILE_SHOWROOM_CONTROLS.indicators.bottomPx - MOBILE_SHOWROOM_CONTROLS.indicators.moveDownPx,
              left: `calc(50% + ${MOBILE_SHOWROOM_CONTROLS.indicators.moveRightPx}px)`,
              gap: MOBILE_SHOWROOM_CONTROLS.indicators.arrowGapPx,
              transform: "translateX(-50%)" }}>
            <button type="button" onClick={goToPreviousMobileHero}
              disabled={mobileHeroSlideCount <= 1} aria-label={copy.previousVehicle}
              className="flex shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
              style={{ width: MOBILE_SHOWROOM_CONTROLS.indicators.arrowSizePx,
                height: MOBILE_SHOWROOM_CONTROLS.indicators.arrowSizePx,
                color: MOBILE_SHOWROOM_CONTROLS.indicators.arrowColor,
                opacity: mobileHeroSlideCount > 1 ? 1 : 0.45,
                cursor: mobileHeroSlideCount > 1 ? "pointer" : "default" }}>
              <svg width={MOBILE_SHOWROOM_CONTROLS.indicators.arrowIconSizePx} height={MOBILE_SHOWROOM_CONTROLS.indicators.arrowIconSizePx}
                viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center justify-center"
              style={{ gap: MOBILE_SHOWROOM_CONTROLS.indicators.gapPx }}>
              {[0, 1, 2].map((index) => (
                <span key={index} aria-hidden="true" className="rounded-full"
                  style={{ height: MOBILE_SHOWROOM_CONTROLS.indicators.dotSizePx,
                    width: index === mobileHeroIndex ? MOBILE_SHOWROOM_CONTROLS.indicators.activeWidthPx : MOBILE_SHOWROOM_CONTROLS.indicators.dotSizePx,
                    background: index === mobileHeroIndex ? "linear-gradient(100deg,#FFB15B,#F47719)" : "#44474D",
                    boxShadow: index === mobileHeroIndex ? "0 0 10px rgba(255,139,41,0.28)" : "none" }} />
              ))}
            </div>
            <button type="button" onClick={goToNextMobileHero}
              disabled={mobileHeroSlideCount <= 1} aria-label={copy.nextVehicle}
              className="flex shrink-0 items-center justify-center rounded-full transition-opacity active:opacity-70"
              style={{ width: MOBILE_SHOWROOM_CONTROLS.indicators.arrowSizePx,
                height: MOBILE_SHOWROOM_CONTROLS.indicators.arrowSizePx,
                color: MOBILE_SHOWROOM_CONTROLS.indicators.arrowColor,
                opacity: mobileHeroSlideCount > 1 ? 1 : 0.45,
                cursor: mobileHeroSlideCount > 1 ? "pointer" : "default" }}>
              <svg width={MOBILE_SHOWROOM_CONTROLS.indicators.arrowIconSizePx} height={MOBILE_SHOWROOM_CONTROLS.indicators.arrowIconSizePx}
                viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Mobile-only compact scooter specifications and inclusive-price reassurance. */}
          <div className="pointer-events-none absolute z-20 flex flex-col items-center"
            style={{ bottom: 128, left: "50%", width: 370, transform: "translateX(-50%)", fontFamily: montserrat.style.fontFamily }}>
            <div className="flex items-center justify-center" style={{ gap: 9, color: "#222222" }}>
              <span className="flex items-center" style={{ gap: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 17a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="m12 16 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/></svg>
                {mobileHeroMicrocopy.engine}
              </span>
              <span aria-hidden="true" style={{ width: 1, height: 18, background: "#B8B8B8" }} />
              <span className="flex items-center" style={{ gap: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 19v-2a5.5 5.5 0 0 1 11 0v2H3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M16 4.5a3 3 0 0 1 0 5.8M17 13a5 5 0 0 1 3.5 4.8V19h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                {mobileHeroMicrocopy.passengers}
              </span>
              <span aria-hidden="true" style={{ width: 1, height: 18, background: "#B8B8B8" }} />
              <span className="flex items-center" style={{ gap: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 18h5a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 3"/></svg>
                {mobileHeroMicrocopy.distance}
              </span>
            </div>
            <div style={{ width: 285, height: 1, background: "#E2E2E2", marginTop: 7 }} />
            <div className="flex items-center justify-center" style={{ gap: 6, marginTop: 6, fontSize: 10, fontWeight: 600, color: "#333333", whiteSpace: "nowrap" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#E87520" strokeWidth="2"/><path d="m8 12 2.5 2.5L16 9" stroke="#E87520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {mobileHeroMicrocopy.reassurance}
            </div>
          </div>

          <button type="button" onClick={handleBookNowClick}
            className="nexa-mobile-scooter-cta absolute z-20 flex items-center justify-center overflow-hidden uppercase text-white shadow-[0_12px_32px_rgba(240,103,20,0.3)] transition-transform active:scale-[0.98]"
            style={{ width: MOBILE_SHOWROOM_CONTROLS.button.widthPx,
              height: MOBILE_SHOWROOM_CONTROLS.button.heightPx,
              bottom: MOBILE_SHOWROOM_CONTROLS.button.bottomPx - MOBILE_SHOWROOM_CONTROLS.button.moveDownPx,
              left: `calc(50% + ${MOBILE_SHOWROOM_CONTROLS.button.moveRightPx}px)`,
              transform: "translateX(-50%)", fontSize: MOBILE_SHOWROOM_CONTROLS.button.fontSizePx,
              borderRadius: MOBILE_SHOWROOM_CONTROLS.button.borderRadiusPx, fontFamily: montserrat.style.fontFamily, fontWeight: MOBILE_SHOWROOM_CONTROLS.button.fontWeight, letterSpacing: `${MOBILE_SHOWROOM_CONTROLS.button.letterSpacingEm}em`,
              background: "linear-gradient(110deg,#FFAC48 0%,#FF8B26 48%,#ED6517 100%)" }}>
            <span className="relative z-10" style={{ isolation: "isolate", transform: "translateZ(0)" }}>{MOBILE_SELECT_SCOOTER_LABEL[showroomLocale]}</span>
            {MOBILE_SHOWROOM_CONTROLS.button.shineEnabled && (
              <span aria-hidden="true" className="nexa-mobile-scooter-cta-shine pointer-events-none absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{ animationDuration: `${MOBILE_SHOWROOM_CONTROLS.button.shineDurationSeconds}s`, animationDelay: `${MOBILE_SHOWROOM_CONTROLS.button.shineDelaySeconds}s` }} />
            )}
          </button>
          <style>{`
            @keyframes nexa-mobile-cta-sheen {
              0% { transform: translate3d(-130%, 0, 0) skewX(-24deg); opacity: 0; }
              8% { opacity: 0.8; }
              65% { opacity: 0.8; }
              82% { transform: translate3d(380%, 0, 0) skewX(-24deg); opacity: 0; }
              100% { transform: translate3d(380%, 0, 0) skewX(-24deg); opacity: 0; }
            }
            .nexa-mobile-scooter-cta-shine { animation-name: nexa-mobile-cta-sheen; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform, opacity; backface-visibility: hidden; }
            @media (prefers-reduced-motion: reduce) { .nexa-mobile-scooter-cta-shine { animation: none; opacity: 0; } }
          `}</style>
          </div>
        </div>

        {/* Desktop-only composition. Each section has its own positioning classes. */}
        <div className="pointer-events-none absolute inset-0 z-10 hidden lg:block">
          <div className="absolute inset-0 bg-transparent" />
        </div>
        {/* DESKTOP ONLY: images stay mounted and preloaded. Previous image hides instantly;
            the next image slides in from the clicked direction with no opacity animation. */}
        {DESKTOP_SCOOTER_SLIDES.map((vehicle, slideIndex) => {
          const tune = DESKTOP_HERO_TUNING.scooters[vehicle.id as keyof typeof DESKTOP_HERO_TUNING.scooters];
          const isCurrent = slideIndex === activeIndex;
          const motionClass = isCurrent
            ? desktopMotion
              ? `nexa-desktop-enter-${desktopMotion.direction}`
              : desktopHasNavigated ? "" : "nexa-desktop-first-scooter"
            : "";
          return (
            <div key={`desktop-art-${vehicle.id}`}
              className={`pointer-events-none absolute z-20 hidden lg:block ${motionClass}`}
              aria-hidden={!isCurrent}
              style={{
                visibility: isCurrent ? "visible" : "hidden",
                left: `${tune.leftPercent}%`,
                bottom: `${tune.bottomPercent}%`,
                width: `${tune.widthPercent}%`,
                height: `${tune.heightPercent}%`,
              }}>
              <div className="relative h-full w-full"
                style={{
                  transform: `translate(${tune.moveRightPx}px, ${tune.moveDownPx}px) scale(${tune.scale})`,
                  transformOrigin: "center bottom",
                }}>
                <Image src={vehicle.image} alt={vehicle.alt} fill priority={slideIndex === 0}
                  sizes="(min-width: 1536px) 46vw, 52vw"
                  className="object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.16)]" />
              </div>
            </div>
          );
        })}

        {/* DESKTOP ONLY: brand, offer and button travel together with the slide. */}
        {DESKTOP_SCOOTER_SLIDES.map((vehicle, slideIndex) => {
          const isCurrent = slideIndex === activeIndex;
          const motionClass = isCurrent
            ? desktopMotion
              ? `nexa-desktop-enter-${desktopMotion.direction}`
              : desktopHasNavigated ? "" : "nexa-desktop-first-details"
            : "";
          return (
            <div key={`desktop-details-${vehicle.id}`}
              className={`${montserrat.className} nexa-desktop-detail-position absolute left-[5%] top-[24%] z-30 hidden w-[30%] max-w-[410px] text-[#1b1b1b] lg:block xl:left-[7%] ${motionClass}`}
              aria-hidden={!isCurrent}
              style={{ visibility: isCurrent ? "visible" : "hidden", pointerEvents: isCurrent ? "auto" : "none" }}>
              <div style={{
                transform: `translate(${DESKTOP_HERO_TUNING.details.moveRightPx}px, ${DESKTOP_HERO_TUNING.details.moveDownPx}px) scale(${DESKTOP_HERO_TUNING.details.scale})`,
                transformOrigin: "top left",
              }}>
                <div className="flex items-center gap-3">
                  <Image src={MOBILE_BRAND_LOGOS[vehicle.id]!}
                    alt={`${MOBILE_BRAND_NAMES[vehicle.id]} logo`}
                    width={150} height={65} className="h-12 w-auto max-w-[140px] object-contain" />
                  <h2 className="text-[clamp(19px,2vw,30px)] font-extrabold leading-tight tracking-tight">
                    {vehicle.id === "piaggio-liberty" ? "Liberty 125" : vehicle.id === "kymco-sky-town" ? "SkyTown 125" : "Symphony 125"}
                    <span className="ml-1 text-[0.55em]">CC</span>
                  </h2>
                </div>
                {vehicle.id === "piaggio-liberty" && (
                  <div className={`${montserrat.className} nexa-most-popular nexa-popular-badge relative mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#8B5CF6]/30 bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#A855F7] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.11em] text-white shadow-[0_4px_13px_rgba(109,40,217,0.23)]`}>
                    <span aria-hidden="true">★</span> {extrasCopy.popularScooter}
                  </div>
                )}
                <div className="mt-5 flex items-start gap-2">
                  <span className="pt-3 text-[clamp(15px,1.6vw,23px)] text-orange-500">{copy.from}</span>
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-[clamp(58px,6.2vw,100px)] font-black leading-none tracking-tighter text-transparent">
                    {MOBILE_SCOOTER_PRICES[vehicle.id]}
                  </span>
                </div>
                <p className="ml-20 mt-1 text-[clamp(15px,1.6vw,23px)] font-light tracking-wide text-[#383838]">{copy.allInclusive.toLowerCase()}</p>
                <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[clamp(10px,0.9vw,13px)] font-bold uppercase text-[#222222]" style={{ fontFamily: montserrat.style.fontFamily }}>
                   <span className="inline-flex items-center gap-1 whitespace-nowrap">
                     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 17a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="m12 16 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1.5" fill="currentColor"/></svg>
                     {mobileHeroMicrocopy.engine}
                   </span>
                   <span aria-hidden="true" className="h-[18px] w-px bg-[#B8B8B8]" />
                   <span className="inline-flex items-center gap-1 whitespace-nowrap">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 19v-2a5.5 5.5 0 0 1 11 0v2H3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M16 4.5a3 3 0 0 1 0 5.8M17 13a5 5 0 0 1 3.5 4.8V19h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                     {mobileHeroMicrocopy.passengers}
                   </span>
                   <span aria-hidden="true" className="h-[18px] w-px bg-[#B8B8B8]" />
                   <span className="inline-flex items-center gap-1 whitespace-nowrap">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 18h5a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 3"/></svg>
                     {mobileHeroMicrocopy.distance}
                   </span>
                 </div>
                 <div className="mt-3 h-px w-[min(100%,350px)] bg-[#E2E2E2]" />
                 <p className="mt-3 inline-flex items-start gap-1.5 text-[clamp(12px,1vw,15px)] text-[#383838]">
                   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-[1px] shrink-0"><circle cx="12" cy="12" r="9" stroke="#E87520" strokeWidth="2"/><path d="m8 12 2.5 2.5L16 9" stroke="#E87520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   {mobileHeroMicrocopy.reassurance}
                 </p>
                <button type="button" onClick={handleBookNowClick}
                  className="nexa-desktop-select-cta relative isolate mt-5 overflow-hidden rounded-full bg-gradient-to-r from-orange-300 via-orange-400 to-orange-600 px-7 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-xl transition hover:brightness-105">
                  {MOBILE_SELECT_SCOOTER_LABEL[showroomLocale]}
                </button>
              </div>
            </div>
          );
        })}

        {/* DESKTOP ONLY: included-item photos are the exact assets used in checkout. */}
        <aside key={`desktop-inclusions-${activeIndex}`}
          className={`${montserrat.className} nexa-desktop-inclusions absolute z-30 hidden rounded-[20px] border border-white/65 bg-white/65 px-3 py-3 shadow-[0_12px_40px_rgba(30,30,30,0.07)] backdrop-blur-md lg:block ${desktopMotion ? `nexa-desktop-enter-${desktopMotion.direction}` : desktopHasNavigated ? "" : "nexa-desktop-first-inclusions"}`}
          style={{
            right: `calc(${DESKTOP_HERO_TUNING.inclusions.rightPercent}% + ${DESKTOP_HERO_TUNING.inclusions.moveLeftPx}px)`,
            top: `calc(${DESKTOP_HERO_TUNING.inclusions.topPercent}% + ${DESKTOP_HERO_TUNING.inclusions.moveDownPx}px)`,
            fontFamily: montserrat.style.fontFamily,
          }}
          aria-label="Free included rental equipment">
          <div className="mb-3 flex items-center gap-2">
            <span aria-hidden="true" className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB15B] via-[#FF8B26] to-[#ED6517] shadow-[0_2px_7px_rgba(244,119,25,0.24)]">
              <svg viewBox="0 0 20 20" fill="none" className="h-[13px] w-[13px]"><path d="m4 10 4 4 8-8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3 className={`${montserrat.className} text-[clamp(13px,1.10vw,17px)] font-extrabold uppercase tracking-[0.06em] text-[#000000]`} style={{ fontFamily: montserrat.style.fontFamily }}>{extrasCopy.freeExtras}</h3>
          </div>
          {[
            { image: "/images/ex4.png", label: extrasCopy.helmets },
            { image: "/images/extra6.png", label: extrasCopy.gloves },
            { image: "/images/ex3.png", label: extrasCopy.securityLock },
            { image: "/images/ex2.jpg", label: extrasCopy.phoneMount },
            { image: "/images/ex1.jpg", label: extrasCopy.topCase },
            { image: "/images/ex5.png", label: extrasCopy.insurance },
          ].map((item) => (
            <div key={item.label} className="nexa-desktop-inclusion-row flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.06] bg-white/90 shadow-sm">
                <Image src={item.image} alt="" width={80} height={80} className="h-full w-full object-contain p-1" />
              </div>
              <span className="flex-1 text-[clamp(11px,0.98vw,14px)] font-semibold leading-tight text-[#000000]">{item.label}</span>
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5 shrink-0 text-[#F47719]">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
                <path d="m6.3 10.1 2.4 2.4 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </aside>

        {/* DESKTOP ONLY: one element per indicator, just like the mobile dots.
            The selected dot itself expands into an orange pill; there is no overlay. */}
        <div className="nexa-desktop-indicators absolute bottom-[28px] left-[54%] z-40 hidden -translate-x-1/2 items-center lg:flex"
          role="group" aria-label="Choose a scooter slide">
          <div className="flex h-8 items-center justify-center gap-[13px]">
            {DESKTOP_SCOOTER_SLIDES.map((slide, index) => (
              <button key={slide.id} type="button"
                onClick={() => changeDesktopScooter(index, index > activeIndex ? "right" : "left")}
                aria-label={`Show ${slide.displayName}`} aria-pressed={index === activeIndex}
                className="nexa-desktop-dot flex h-8 items-center justify-center rounded-full"
                style={{ width: index === activeIndex ? 58 : 22 }}>
                <span aria-hidden="true" className="nexa-desktop-dot-mark block rounded-full"
                  style={{
                    width: index === activeIndex ? 58 : 9,
                    height: index === activeIndex ? 7 : 9,
                    background: index === activeIndex
                      ? "linear-gradient(100deg,#FFB15B,#FF8B26,#ED6517)"
                      : "#55585B",
                    boxShadow: index === activeIndex ? "0 0 11px rgba(255,139,41,0.35)" : "none",
                  }} />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop booking panel removed intentionally. Mobile booking panel below stays unchanged. */}

        <div
          id="mobile-booking-panel"
          className={[
            "booking-panel-mobile hidden",
            bookingPanelAttention ? "booking-panel-attention" : "",
          ].join(" ")}
        >
          <div className="max-h-[48vh] overflow-y-auto rounded-[28px] border border-white/12 bg-black/42 p-3 shadow-[0_26px_80px_rgba(0,0,0,0.44)] backdrop-blur-2xl">
            {isActiveVehicleEbike ? (
              <EbikeWhatsAppPanel
                key={`mobile-ebike-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
                copy={copy}
              />
            ) : (
              <BookingPanelV3
                key={`mobile-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
              />
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          aria-label={copy.previousVehicle}
          className="showroom-arrow showroom-arrow-left group absolute left-5 top-1/2 z-40 flex h-24 w-16 -translate-y-1/2 items-center justify-center text-[#222]/75 transition-all duration-300 hover:text-white active:scale-95 sm:left-8 lg:left-12"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-16 w-9 drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
          >
            <path
              d="M25 7L8 32L25 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          aria-label={copy.nextVehicle}
          className="showroom-arrow showroom-arrow-right group absolute right-[390px] top-1/2 z-40 hidden h-24 w-16 -translate-y-1/2 items-center justify-center text-[#222]/75 transition-all duration-300 hover:text-white active:scale-95 lg:flex"
        >
          <svg
            viewBox="0 0 34 64"
            aria-hidden="true"
            className="h-16 w-9 drop-shadow-[0_10px_30px_rgba(0,0,0,0.65)] transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
          >
            <path
              d="M9 7L26 32L9 57"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <style>{`

                  .nexa-showroom-mobile-fixed-nav {
            display: none;
          }

          .nexa-showroom-desktop-nav {
            display: block;
          }

          @media (max-width: 1023px) {
            .nexa-showroom-mobile-fixed-nav {
              display: block !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              height: 0 !important;
              z-index: 2147483000 !important;
              isolation: isolate !important;
              transform: translateZ(0) !important;
              -webkit-transform: translateZ(0) !important;
              pointer-events: none !important;
            }

            .nexa-showroom-mobile-fixed-nav :global(header),
            .nexa-showroom-mobile-fixed-nav :global(nav) {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 2147483000 !important;
              transform: translateZ(0) !important;
              -webkit-transform: translateZ(0) !important;
              --nexa-mobile-nav-icon: #ffffff;
            }

            /* Compact mobile header, while preserving its existing controls. */
            .nexa-showroom-mobile-fixed-nav .nexa-mobile-nav,
            .nexa-showroom-mobile-fixed-nav header.nexa-mobile-nav,
            .nexa-showroom-mobile-fixed-nav nav.nexa-mobile-nav {
              height: clamp(70px, 9.5svh, 78px) !important;
              min-height: 70px !important;
              max-height: 78px !important;
              box-sizing: border-box !important;
            }

            .nexa-showroom-mobile-fixed-nav :is(header, nav) {
              --nexa-showroom-header-height: clamp(70px, 9.5svh, 78px);
            }

            .nexa-showroom-mobile-fixed-nav :global(.nexa-mobile-nav) {
              background: #000000 !important;
              background-color: #000000 !important;
              background-image: none !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              transition: none !important;
            }

            .nexa-showroom-mobile-fixed-nav :global(a),
            .nexa-showroom-mobile-fixed-nav :global(button),
            .nexa-showroom-mobile-fixed-nav :global([role="button"]) {
              pointer-events: auto !important;
            }

            .nexa-showroom-desktop-nav {
              display: none !important;
            }
          }

          @media (min-width: 1024px) {
            .nexa-showroom-desktop-nav {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              z-index: 1000 !important;
              background: #0b0b0c !important;
              box-shadow: 0 6px 22px rgba(0,0,0,.18) !important;
            }
            .nexa-showroom-desktop-nav :is(header, nav) {
              background: #0b0b0c !important;
              background-image: none !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
            }
            .nexa-showroom-desktop-nav :is(a, button) { color: #fff; }
            .nexa-showroom-mobile-fixed-nav {
              display: none !important;
            }

            .nexa-showroom-desktop-nav {
              display: block !important;
            }
          }
          #booking :global(nav),
          #booking :global(header) {
            --nexa-mobile-nav-icon: #ffffff;
          }

          #booking :global(button[aria-label="Open menu"]),
          #booking :global(button[aria-label="Toggle menu"]),
          #booking :global(button[aria-label="Menu"]),
          #booking :global(button[aria-expanded]) {
            color: #ffffff !important;
            border-color: rgba(255, 255, 255, 0.18) !important;
            background: rgba(0, 0, 0, 0.18) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }

          #booking :global(button.nexa-hamburger-button[aria-expanded]) {
            border: none !important;
            outline: none !important;
            background: none !important;
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }

          #booking :global(button[aria-label="Open menu"] svg),
          #booking :global(button[aria-label="Toggle menu"] svg),
          #booking :global(button[aria-label="Menu"] svg),
          #booking :global(button[aria-expanded] svg) {
            color: #ffffff !important;
            stroke: #ffffff !important;
          }

          .light-smoke {
            opacity: 0.65;
            animation: nexa-light-smoke 12s ease-in-out infinite alternate;
            will-change: transform, opacity;
          }

          .smoke-one {
            animation-delay: 0s;
          }

          .smoke-two {
            animation-delay: 2s;
          }

          .smoke-three {
            animation-delay: 4s;
          }

          .mobile-direct-hero-stage {
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-direct-hero-image {
            object-fit: contain !important;
            object-position: center center !important;
            background: #000000;
            will-change: opacity;
          }

          .mobile-scooter-selector {
            animation: mobileSelectorIn 360ms cubic-bezier(0.16, 1, 0.3, 1)
              both;
          }

          .mobile-selector-title {
            text-wrap: balance;
          }

          .mobile-scooter-bottom-panel {
            bottom: 70px;
          }

          .mobile-select-button {
            -webkit-tap-highlight-color: transparent;
            animation: mobileSelectPulse 1.95s ease-in-out infinite;
          }
.mobile-select-button-position {
  --select-x: 20px;
  --select-y: 0px;
  transform: translate3d(var(--select-x), var(--select-y), 0);
}
          .mobile-select-button::before {
            content: "";
            position: absolute;
            inset: 1px;
            border-radius: inherit;
            background: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.46),
              rgba(255, 255, 255, 0.08) 42%,
              rgba(0, 0, 0, 0.1)
            );
            pointer-events: none;
          }

          .mobile-select-button::after {
            content: "";
            position: absolute;
            inset: -80% auto -80% -55%;
            width: 34%;
            transform: rotate(18deg);
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.9),
              transparent
            );
            opacity: 0.7;
            animation: mobileSelectShine 2.4s ease-in-out infinite;
            pointer-events: none;
          }

          .mobile-spec-card {
            animation: mobileSpecIn 380ms cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .mobile-spec-card:nth-child(1) {
            animation-delay: 40ms;
          }

          .mobile-spec-card:nth-child(2) {
            animation-delay: 80ms;
          }

          .mobile-spec-card:nth-child(3) {
            animation-delay: 120ms;
          }

          .mobile-spec-card:nth-child(4) {
            animation-delay: 160ms;
          }

          @keyframes mobileSelectorIn {
            0% {
              opacity: 0;
              transform: translate3d(0, -10px, 0);
            }

            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes mobileSpecIn {
            0% {
              opacity: 0;
              transform: translate3d(0, 10px, 0) scale(0.98);
            }

            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes mobileSelectPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 18px 54px rgba(255, 106, 0, 0.42);
            }

            18% {
              transform: scale(1.035);
              box-shadow: 0 22px 68px rgba(255, 106, 0, 0.54);
            }

            34%,
            100% {
              transform: scale(1);
              box-shadow: 0 18px 54px rgba(255, 106, 0, 0.42);
            }
          }

          @keyframes mobileSelectShine {
            0% {
              left: -55%;
            }

            48%,
            100% {
              left: 125%;
            }
          }

          .mobile-direct-arrow {
            -webkit-tap-highlight-color: transparent;
          }

          .typed-unpack {
            display: inline-block;
            opacity: 0;
            clip-path: inset(0 100% 0 0);
            transform: translate3d(-10px, 0, 0);
            animation: showroom-text-unpack 360ms cubic-bezier(0.16, 1, 0.3, 1)
              forwards;
            will-change: opacity, transform, clip-path;
            backface-visibility: hidden;
          }

          .vehicle-feature-row {
            opacity: 0;
            transform: translate3d(-12px, 0, 0);
            animation: showroom-feature-unpack 360ms
              cubic-bezier(0.16, 1, 0.3, 1) forwards;
            will-change: opacity, transform;
            backface-visibility: hidden;
          }

          @keyframes showroom-text-unpack {
            0% {
              opacity: 0;
              clip-path: inset(0 100% 0 0);
              transform: translate3d(-10px, 0, 0);
            }

            100% {
              opacity: 1;
              clip-path: inset(0 0 0 0);
              transform: translate3d(0, 0, 0);
            }
          }

          @keyframes showroom-feature-unpack {
            0% {
              opacity: 0;
              transform: translate3d(-12px, 0, 0);
            }

            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }

          .vehicle-feature-icon::before {
            content: "";
            position: absolute;
            inset: -5px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.16);
            filter: blur(10px);
            opacity: 0.42;
          }

          .booking-panel-shell {
            transform: scale(0.88);
            transform-origin: top right;
          }

          .booking-panel-shell > div {
            overflow: visible;
          }

          .booking-panel-shell :global(*) {
            scrollbar-width: thin;
          }

          .booking-panel-shell :global(*)::-webkit-scrollbar,
          .booking-panel-mobile :global(*)::-webkit-scrollbar {
            width: 6px;
          }

          .booking-panel-shell :global(*)::-webkit-scrollbar-thumb,
          .booking-panel-mobile :global(*)::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.22);
          }

          .booking-panel-attention :global(.plan-choice-button) {
            animation: showroom-plan-heartbeat 0.72s ease-in-out infinite !important;
          }

          .booking-panel-attention :global(.plan-choice-button)::before,
          .booking-panel-attention :global(.plan-choice-button)::after {
            content: "";
            position: absolute;
            inset: -3px;
            border-radius: 21px;
            padding: 2px;
            animation: showroom-plan-ring 1.05s ease-out infinite;
            pointer-events: none;
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
          }

          .booking-panel-attention :global(.plan-popular)::before,
          .booking-panel-attention :global(.plan-popular)::after {
            background: linear-gradient(
              135deg,
              #ec4899,
              #d946ef,
              #7c3aed,
              #38bdf8
            );
          }

          .booking-panel-attention :global(.plan-secondary)::before,
          .booking-panel-attention :global(.plan-secondary)::after {
            background: linear-gradient(
              135deg,
              rgba(17, 24, 39, 0.72),
              rgba(107, 114, 128, 0.62),
              rgba(209, 213, 219, 0.72)
            );
          }

          .booking-panel-attention :global(.plan-choice-button)::after {
            animation-delay: 0.62s;
          }

          @keyframes showroom-plan-heartbeat {
            0% {
              transform: translateY(0) scale(1);
            }

            14% {
              transform: translateY(-4px) scale(1.018);
            }

            28% {
              transform: translateY(0) scale(1);
            }

            42% {
              transform: translateY(-2px) scale(1.01);
            }

            58% {
              transform: translateY(0) scale(1);
            }

            100% {
              transform: translateY(0) scale(1);
            }
          }

          @keyframes showroom-plan-ring {
            0% {
              opacity: 0;
              transform: scale(1);
            }

            18% {
              opacity: 0.82;
            }

            100% {
              opacity: 0;
              transform: scale(1.11);
            }
          }

          @keyframes nexa-light-smoke {
            0% {
              opacity: 0.38;
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              opacity: 0.62;
            }

            100% {
              opacity: 0.44;
              transform: translate3d(0, -28px, 0) scale(1.08);
            }
          }

          @media (min-width: 1024px) and (max-height: 820px) {
            #booking {
              min-height: 100vh;
            }

            .vehicle-info-card {
              left: 168px;
              top: 145px;
              width: 380px;
            }

            .vehicle-info-card h2 {
              font-size: 34px;
            }

            .booking-panel-shell {
              top: 88px;
              right: 10px;
              width: 410px;
              max-width: 410px;
              transform: scale(0.8);
            }

            .booking-panel-shell > div {
              padding: 8px;
              border-radius: 26px;
            }

            .showroom-arrow-right {
              right: 350px;
            }
          }

          @media (min-width: 1024px) and (max-width: 1280px) {
            .vehicle-info-card {
              left: 142px;
              top: 150px;
              width: 345px;
            }

            .vehicle-info-card h2 {
              font-size: 31px;
            }

            .booking-panel-shell {
              right: 12px;
              width: 410px;
              max-width: 410px;
              transform: scale(0.82);
            }

            .showroom-arrow-right {
              right: 360px;
            }
          }

          @media (max-width: 1023px) {
  :global(html),
  :global(body) {
    background: #000000 !important;
  }

  #nexa-showroom-v3 {
    background: #000000 !important;
    min-height: 100svh;
  }

  #booking {
    height: 100svh;
    min-height: 100svh;
    overflow: hidden;
    background: #000000 !important;
  }

  .mobile-direct-hero-stage,
  .mobile-direct-hero-image {
    background: #000000 !important;
  }

  .showroom-arrow,
  .booking-panel-mobile,
  .light-smoke {
    display: none !important;
  }
}

          @media (max-width: 640px) {
            #booking {
              height: 100svh;
              min-height: 100svh;
            }
          }

          @media (max-width: 390px) {
            .mobile-scooter-selector {
              top: 86px;
              padding-left: 18px;
              padding-right: 18px;
            }

            .mobile-selector-kicker {
              font-size: 8px;
              letter-spacing: 0.36em;
            }

            .mobile-selector-title {
              font-size: 22px;
            }

            .mobile-scooter-bottom-panel {
              bottom: 40px;
              padding-left: 18px;
              padding-right: 18px;
            }

            .mobile-select-button {
              height: 48px;
              min-width: 172px;
              font-size: 13px;
            }

            .mobile-spec-grid {
              margin-top: 13px;
              row-gap: 9px;
              column-gap: 10px;
            }

            .mobile-spec-card span:last-child {
              font-size: 9px;
            }
          }

          @media (max-height: 760px) and (max-width: 1023px) {
            .mobile-scooter-selector {
              top: 78px;
            }

            .mobile-selector-title {
              font-size: 22px;
            }

            .mobile-scooter-bottom-panel {
              bottom: 28px;
            }

            .mobile-spec-grid {
              margin-top: 12px;
              row-gap: 8px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .light-smoke,
            .typed-unpack,
            .vehicle-feature-row,
            .mobile-direct-hero-image,
            .mobile-direct-arrow svg,
            .mobile-scooter-selector,
            .mobile-select-button,
            .mobile-select-button::after,
            .mobile-spec-card,
            .booking-panel-attention :global(.plan-choice-button),
            .booking-panel-attention :global(.plan-choice-button)::before,
            .booking-panel-attention :global(.plan-choice-button)::after {
              animation: none !important;
              transition: none !important;
              opacity: 1 !important;
              
              transform: none !important;
              clip-path: none !important;
            }
          }


          /* New desktop-only enhancements. Mobile sizing and effects stay unchanged. */
          @media (min-width: 1024px) {
            .nexa-desktop-dot, .nexa-desktop-dot-mark { transition: width 460ms cubic-bezier(.22,1,.36,1), height 460ms cubic-bezier(.22,1,.36,1), background 320ms ease, box-shadow 320ms ease; }
            .nexa-desktop-inclusions { width: clamp(155px, 14.5vw, 240px); }
            .nexa-desktop-inclusion-row { min-height: clamp(42px, 4.5vw, 58px); border-bottom: 1px solid rgba(0,0,0,.07); }
            .nexa-desktop-inclusion-row:last-child { border-bottom: none; }
            .nexa-desktop-enter-right { animation: nexaDesktopEnterRight 750ms cubic-bezier(.22,1,.36,1) both; will-change: transform; backface-visibility: hidden; }
            .nexa-desktop-enter-left { animation: nexaDesktopEnterLeft 750ms cubic-bezier(.22,1,.36,1) both; will-change: transform; backface-visibility: hidden; }
            .nexa-desktop-first-scooter { animation: nexaDesktopEnterRight 950ms cubic-bezier(.22,1,.36,1) both; }
            .nexa-desktop-first-details { animation: nexaDesktopEnterLeft 850ms cubic-bezier(.22,1,.36,1) both; }
            .nexa-desktop-first-inclusions { animation: nexaDesktopEnterRight 950ms cubic-bezier(.22,1,.36,1) both; }
            @keyframes nexaDesktopEnterRight { from { transform: translate3d(30vw,0,0); } to { transform: translate3d(0,0,0); } }
            @keyframes nexaDesktopEnterLeft { from { transform: translate3d(-30vw,0,0); } to { transform: translate3d(0,0,0); } }
            .showroom-arrow-left, .showroom-arrow-right { overflow: hidden; isolation: isolate; transition: background .25s ease, color .25s ease, border-color .25s ease, box-shadow .25s ease, scale .25s ease !important; }
            .showroom-arrow-left:hover, .showroom-arrow-right:hover {
              color: #fff !important; border-color: #ff8b26 !important;
              background: linear-gradient(110deg,#FFAC48 0%,#FF8B26 48%,#ED6517 100%) !important;
              box-shadow: 0 12px 36px rgba(240,103,20,.38) !important;
              scale: 1.13;
            }
            .showroom-arrow-left:active, .showroom-arrow-right:active { scale: .92 !important; box-shadow: inset 0 3px 12px rgba(95,39,0,.25) !important; }
            .showroom-arrow-left::after, .showroom-arrow-right::after {
              content: ""; position: absolute; inset: -45% auto -45% -65%; width: 38%;
              background: linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);
              transform: skewX(-20deg); pointer-events: none; opacity: 0;
            }
            .showroom-arrow-left:hover::after, .showroom-arrow-right:hover::after { animation: nexaArrowShine 1.4s ease-in-out infinite; }
            @keyframes nexaArrowShine { 0% { left: -65%; opacity: 0; } 12% { opacity: .75; } 65%,100% { left: 140%; opacity: 0; } }
          }
          @media (min-width: 1024px) and (max-width: 1370px) {
            .nexa-desktop-inclusions { width: clamp(150px,16vw,208px); }
            .nexa-desktop-inclusion-row > div { width: 34px; height: 34px; }
            .nexa-desktop-detail-position { top: 24%; }
          }
          @media (min-width: 1024px) and (max-height: 750px) {
            .nexa-desktop-inclusions { max-height: 66vh; }
            .nexa-desktop-inclusion-row { min-height: 40px; }
            .nexa-desktop-inclusion-row > div { width: 32px; height: 32px; }
            .nexa-desktop-detail-position { top: 23%; }
          }
          @media (min-width: 1024px) and (max-width: 1150px) {
            .nexa-desktop-inclusions { width: 150px; }
            .nexa-desktop-inclusion-row { gap: 6px; }
            .nexa-desktop-inclusion-row svg { width: 15px; height: 15px; }
            .nexa-desktop-inclusions h3 { font-size: 11px; }
            .nexa-desktop-detail-position { left: 5%; }
          }
          @media (min-width: 1024px) and (prefers-reduced-motion: reduce) {
            .nexa-desktop-dot, .nexa-desktop-dot-mark { transition: none !important; }
            .nexa-desktop-enter-right, .nexa-desktop-exit-right, .nexa-desktop-enter-left, .nexa-desktop-exit-left,
            .nexa-desktop-first-scooter, .nexa-desktop-first-details, .nexa-desktop-first-inclusions { animation: none !important; }
            .showroom-arrow-left:hover::after,.showroom-arrow-right:hover::after { animation: none !important; }
          }

          /* DESKTOP ONLY: premium arrow controls and animated selection CTA. */
          @media (min-width: 1024px) {
            .showroom-arrow-left,
            .showroom-arrow-right {
              width: 62px !important;
              height: 62px !important;
              border-radius: 9999px !important;
              border: 1px solid rgba(0, 0, 0, 0.12) !important;
              background: rgba(255, 255, 255, 0.86) !important;
              color: #292929 !important;
              box-shadow: 0 8px 28px rgba(0, 0, 0, 0.13) !important;
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
            }

            .showroom-arrow-left { left: 38px !important; }
            .showroom-arrow-right { right: 38px !important; }

            .showroom-arrow-left:hover,
            .showroom-arrow-right:hover {
              color: #ffffff !important;
              border-color: #ff8b26 !important;
              background: linear-gradient(110deg,#FFAC48 0%,#FF8B26 48%,#ED6517 100%) !important;
              box-shadow: 0 12px 36px rgba(240,103,20,.38) !important;
            }

            .showroom-arrow-left svg,
            .showroom-arrow-right svg {
              width: 21px !important;
              height: 35px !important;
              filter: none !important;
            }

            .nexa-desktop-select-cta {
              animation: nexaDesktopSelectHeartbeat 1.9s ease-in-out infinite;
              will-change: transform, box-shadow;
            }

            .nexa-desktop-select-cta:hover {
              animation: none !important;
              transform: scale(1.09);
              box-shadow: 0 17px 42px rgba(240,103,20,0.37);
            }
            .nexa-desktop-select-cta:active {
              animation: none !important;
              transform: scale(0.97);
            }

            .nexa-desktop-select-cta::after {
              content: "";
              position: absolute;
              top: -65%;
              bottom: -65%;
              left: -55%;
              width: 33%;
              transform: rotate(18deg);
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
              pointer-events: none;
              animation: nexaDesktopSelectShine 2.2s ease-in-out infinite;
            }

            @keyframes nexaDesktopSelectHeartbeat {
              0%, 34%, 100% { transform: scale(1); box-shadow: 0 12px 30px rgba(240,103,20,0.22); }
              16% { transform: scale(1.045); box-shadow: 0 16px 42px rgba(240,103,20,0.38); }
              46% { transform: scale(1.02); box-shadow: 0 14px 36px rgba(240,103,20,0.3); }
              62% { transform: scale(1); box-shadow: 0 12px 30px rgba(240,103,20,0.22); }
            }

            @keyframes nexaDesktopSelectShine {
              0% { left: -55%; opacity: 0; }
              8% { opacity: 0.9; }
              55% { left: 125%; opacity: 0.9; }
              72%, 100% { left: 125%; opacity: 0; }
            }
          }

          @media (min-width: 1024px) and (prefers-reduced-motion: reduce) {
            .nexa-desktop-select-cta,
            .nexa-desktop-select-cta::after { animation: none !important; }
          }


          /* Both POPULAR SCOOTER badges: subtle, repeating left-to-right reflection. */
          .nexa-popular-badge {
            overflow: hidden;
            isolation: isolate;
          }
          .nexa-popular-badge::after {
            content: "";
            position: absolute;
            top: -45%;
            bottom: -45%;
            left: -58%;
            width: 34%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            transform: skewX(-22deg);
            pointer-events: none;
            animation: nexaPopularBadgeShine 2.6s ease-in-out infinite;
          }
          @keyframes nexaPopularBadgeShine {
            0% { left: -58%; opacity: 0; }
            10% { opacity: 0.8; }
            58% { left: 128%; opacity: 0.8; }
            75%, 100% { left: 128%; opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .nexa-popular-badge::after { animation: none !important; }
          }
        `}</style>
      </section>

      {/* DESKTOP ONLY: a single, clean white booking surface. Mobile remains untouched. */}
      {desktopBookingOpen && (
        <div
          className="fixed inset-0 z-[2147483100] hidden items-center justify-center bg-black/40 p-4 backdrop-blur-[5px] lg:flex lg:p-7"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDesktopBookingOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${copy.chooseYourRide} - ${activeVehicle.displayName}`}
            className={`${montserrat.className} relative flex max-h-[min(91dvh,950px)] w-full max-w-[min(760px,91vw)] flex-col overflow-hidden rounded-[26px] bg-white text-black shadow-[0_32px_100px_rgba(0,0,0,.28)]`}
          >
            <button
              type="button"
              onClick={() => setDesktopBookingOpen(false)}
              aria-label="Close booking"
              className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-[#f7f7f7] text-black transition hover:scale-105 hover:bg-[#eeeeee] active:scale-95"
            >
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
                <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="nexa-desktop-booking-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-[clamp(24px,4vw,56px)] py-[clamp(36px,5vw,58px)] pr-[clamp(24px,5vw,65px)]">
              <BookingPanelV3
                key={`desktop-booking-${activeVehicle.id}`}
                vehicleName={activeVehicle.displayName}
                desktopModal
              />
            </div>
          </div>
        </div>
      )}

      <GoogleReviewsV3 />
      <LocationV3 locale={showroomLocale} />
      <NexaStatsStripV3 />
      <MallorcaScooterRentalGuideHub />
      <NeroWebsiteAssistant />
    </div>
  );
}
