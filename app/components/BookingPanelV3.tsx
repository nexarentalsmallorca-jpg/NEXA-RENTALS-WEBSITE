"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

type RentalPlan = "half" | "full" | null;
type ActiveDateField = "pickup" | "dropoff";
type ActiveTimeField = "pickup" | "return" | null;
type ServiceMethod = "office" | "hotel_delivery" | "airport_delivery";
type DestinationKind = "hotel" | "airbnb";
type AirportReturnMethod = "office" | "hotel_delivery";
type Locale =
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
  | "cs"
  | "sr"
  | "uk";
type AvailabilityFleetGroup =
  | "piaggio_liberty_125"
  | "kymco_sky_town_125"
  | "sym_symphony_125";

type DeliveryArea = {
  id: string;
  name: string;
  fee: number;
  slotMinutes: 10 | 30;
};

type HotelSelection = {
  placeId: string;
  name: string;
  address: string;
  mapsUrl: string;
  photos: string[];
  rating?: number;
  ratingCount?: number;
};

type AirbnbAddressDetails = {
  placeId: string;
  formattedAddress: string;
  streetName: string;
  streetNumber: string;
  blockNumber: string;
  buildingName: string;
  floor: string;
  doorNumber: string;
  postalCode: string;
  city: string;
  mapsUrl: string;
};

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePhoto = {
  getURI?: (options?: { maxWidth?: number; maxHeight?: number }) => string;
};

type GooglePlaceResult = {
  id?: string;
  displayName?: string;
  formattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
  googleMapsURI?: string;
  photos?: GooglePhoto[];
  rating?: number;
  userRatingCount?: number;
  fetchFields?: (options: { fields: string[] }) => Promise<{ place: GooglePlaceResult }>;
};

type GooglePlacePrediction = {
  placeId?: string;
  mainText?: { toString: () => string };
  secondaryText?: { toString: () => string };
  text?: { toString: () => string };
  toPlace?: () => GooglePlaceResult;
};

type GooglePlacesLibrary = {
  Place: {
    searchByText: (request: Record<string, unknown>) => Promise<{
      places: GooglePlaceResult[];
    }>;
  };
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: Record<string, unknown>) => Promise<{
      suggestions: Array<{ placePrediction?: GooglePlacePrediction }>;
    }>;
  };
  AutocompleteSessionToken: new () => unknown;
};

type SeasonalPricing = {
  seasonName: string;
  halfDayPrice: number;
  halfDayOldPrice: number;
  fullDayOldPrice: number;
  fullDayPricing: Record<number, number>;
};

type BookingPanelV3Props = {
  vehicleName?: string;
  checkoutBasePath?: string;
  onPricingChange?: (pricing: SeasonalPricing) => void;
};

type AvailabilityResult = {
  ok: boolean;
  available: boolean;
  vehicleName?: string;
  totalFleet?: number;
  bookedCount?: number;
  availableCount?: number;
  message?: string;
  nextAvailableText?: string;
  bufferMinutes?: number;
  fleetGroup?: string;
  bookedVehicleCodes?: string[];
  availableVehicleCodes?: string[];
  assignedVehicleCode?: string | null;
  assignedVehicleName?: string | null;
  assignedVehicleMatricula?: string | null;
  assignedVehicleDisplayName?: string | null;
};

type DeliverySlotAvailability = {
  time: string;
  available: boolean;
  availableCount: number;
  reason:
    | "available"
    | "pickup_slot_reserved"
    | "collection_slot_reserved"
    | "fleet_unavailable";
};

type DeliverySlotsResponse = {
  ok: boolean;
  available: boolean;
  slots?: DeliverySlotAvailability[];
  message?: string;
};

type ExtraBookingPanelCopy = {
  serviceQuestion: string;
  officePickup: string;
  hotelDelivery: string;
  airportDelivery: string;
  selected: string;
  change: string;
  chooseTownArea: string;
  free: string;
  eachWay: string;
  hotelAirbnbDelivery: string;
  chooseDeliveryArea: string;
  deliveryAreaInstruction: string;
  townArea: string;
  deliveryFeeEachWay: string;
  liveDeliveryAvailability: string;
  selectDeliveryTime: string;
  deliveryCollectionSameTime: string;
  airportDeliveryTimeNote: string;
  available: string;
  unavailable: string;
  checkingDeliveryCollectionTimes: string;
  deliveryTimesError: string;
  tryAgain: string;
  scooterAvailable: string;
  scootersAvailable: string;
  chooseGreenTime: string;
  confirmTime: string;
  hotelDeliveryArea: string;
  selectHotelTitle: string;
  hotelSearchInstruction: string;
  searchHotelName: string;
  hotelPlaceholder: string;
  bestMatches: string;
  hotelsNearby: string;
  searching: string;
  results: string;
  loadingHotels: string;
  noHotelsFound: string;
  selectedHotel: string;
  googleReviews: string;
  hotelPhoto: string;
  openHotelPhoto: string;
  view: string;
  noPhoto: string;
  roomOptional: string;
  roomExample: string;
  verifiedGoogleMaps: string;
  selectHotelResultHelp: string;
  googleMapsInfo: string;
  selectHotel: string;
  hotelPhotoViewer: string;
  closePhoto: string;
  zoomOut: string;
  zoomIn: string;
  airbnbPrivateAddress: string;
  airbnbPrivateAddressShort: string;
  confirmDeliveryAddress: string;
  findAddressGoogle: string;
  addressPlaceholder: string;
  addressSearchUnavailable: string;
  addressOutsideArea: string;
  addressLoadFailed: string;
  streetName: string;
  streetHouseNumber: string;
  blockOptional: string;
  buildingOptional: string;
  floorOptional: string;
  doorOptional: string;
  postalCode: string;
  townAreaRequired: string;
  addressWarning: string;
  requiredFieldsGoogle: string;
  selectAddress: string;
  blockToken: string;
  floorToken: string;
  doorToken: string;
  deliveryDatesNotice: string;
  scrollMonths: string;
  winterOfficeNotice: string;
  deliveryLocation: string;
  airportLocationFee: string;
  howReturnScooter: string;
  returnOfficeFree: string;
  hotelAirbnbCollection: string;
  officeReturnTime: string;
  airportCollectionUnavailable: string;
  selectDeliveryArea: string;
  selectCollectionArea: string;
  hotel: string;
  airbnbAddressOption: string;
  roomLabel: string;
  edit: string;
  deliveryCollection: string;
  selectLiveTime: string;
  chooseTime: string;
  rentalDeliverySummary: string;
  deliveryCollectionFree: string;
};

type BookingPanelCopy = ExtraBookingPanelCopy & {
  vehicle: string;
  sameDayRental: string;
  fullDay: string;
  chooseQuantity: string;
  multiDayDiscount: string;
  mostPopular: string;
  pickupDate: string;
  pickupTime: string;
  returnTime: string;
  dropoffDate: string;
  selectDate: string;
  selectDates: string;
  selectTime: string;
  choosePlanFirst: string;
  chooseDateFirst: string;
  fullMin24: string;
  maxOnline6: string;
  checkingWait: string;
  unavailableNotice: string;
  availabilityRequired: string;
  completeDetails: string;
  availabilityError: string;
  checkingLive: string;
  availableCount: string;
  notEnoughQuantity: string;
  summary: string;
  choosePlanBegin: string;
  day: string;
  days: string;
  hour: string;
  hours: string;
  total: string;
  normalPrice: string;
  nowPrice: string;
  checkout: string;
  checkingAvailability: string;
  notAvailable: string;
  confirmingAvailability: string;
  close: string;
  sameDropoffTime: string;
  noTimesToday: string;
};

const EXTRA_EN_COPY: ExtraBookingPanelCopy = {
  serviceQuestion: "How would you like to receive your scooter?",
  officePickup: "Office Pickup",
  hotelDelivery: "Hotel Delivery",
  airportDelivery: "Airport Delivery",
  selected: "{method} selected",
  change: "Change",
  chooseTownArea: "Choose town or area",
  free: "Free",
  eachWay: "€{fee} each way",
  hotelAirbnbDelivery: "Hotel / Airbnb delivery",
  chooseDeliveryArea: "Choose delivery area",
  deliveryAreaInstruction: "Select your town and see the delivery fee for each way.",
  townArea: "Town / Area",
  deliveryFeeEachWay: "Delivery fee · each way",
  liveDeliveryAvailability: "Live delivery availability",
  selectDeliveryTime: "Select your delivery time",
  deliveryCollectionSameTime: "The same time is reserved for delivery on {pickupDate} and collection on {dropoffDate}.",
  airportDeliveryTimeNote: "Choose the airport delivery time for {pickupDate}. Your office return remains at {returnTime}.",
  available: "Available",
  unavailable: "Unavailable",
  checkingDeliveryCollectionTimes: "Checking live delivery and collection times…",
  deliveryTimesError: "Live delivery times could not be loaded. Please try again.",
  tryAgain: "Try again",
  scooterAvailable: "{count} scooter available",
  scootersAvailable: "{count} scooters available",
  chooseGreenTime: "Choose one green time",
  confirmTime: "Confirm time",
  hotelDeliveryArea: "Hotel delivery · {area}",
  selectHotelTitle: "Select your hotel",
  hotelSearchInstruction: "Search Google hotels, confirm the exact address and add your room number.",
  searchHotelName: "Search hotel name",
  hotelPlaceholder: "Start typing a hotel in {area}",
  bestMatches: "Best matches",
  hotelsNearby: "Hotels nearby",
  searching: "Searching…",
  results: "{count} results",
  loadingHotels: "Loading hotels in {area}…",
  noHotelsFound: "No matching hotels were found inside {area}. Try another hotel name, or change the delivery area.",
  selectedHotel: "Selected hotel",
  googleReviews: "{count} Google reviews",
  hotelPhoto: "{hotel} photo {number}",
  openHotelPhoto: "Open {hotel} photo {number}",
  view: "View",
  noPhoto: "No photo",
  roomOptional: "Room number · optional",
  roomExample: "Example: 214",
  verifiedGoogleMaps: "View verified location on Google Maps",
  selectHotelResultHelp: "Select a hotel result to review its address and photos.",
  googleMapsInfo: "Hotel information provided by Google Maps",
  selectHotel: "Select hotel",
  hotelPhotoViewer: "Hotel photo viewer",
  closePhoto: "Close photo",
  zoomOut: "Zoom out",
  zoomIn: "Zoom in",
  airbnbPrivateAddress: "Airbnb / private address · {area}",
  airbnbPrivateAddressShort: "Airbnb / private address",
  confirmDeliveryAddress: "Confirm the delivery address",
  findAddressGoogle: "Find your complete address on Google Maps *",
  addressPlaceholder: "Street and number in {area}",
  addressSearchUnavailable: "Address search is temporarily unavailable.",
  addressOutsideArea: "This address does not appear to be inside {area}. Please select an address in the chosen delivery area.",
  addressLoadFailed: "We could not load this address. Please choose another result.",
  streetName: "Street name *",
  streetHouseNumber: "Street / house number *",
  blockOptional: "Block number · optional",
  buildingOptional: "Building name · optional",
  floorOptional: "Floor · optional",
  doorOptional: "Door number · optional",
  postalCode: "Postal code *",
  townAreaRequired: "Town / area *",
  addressWarning: "Please double-check the complete address before confirming. The address must be inside the selected delivery area. Incorrect, incomplete or out-of-area information may prevent delivery and may result in the booking payment being non-refundable.",
  requiredFieldsGoogle: "* Required fields · Select a Google address first",
  selectAddress: "Select address",
  blockToken: "Block {value}",
  floorToken: "Floor {value}",
  doorToken: "Door {value}",
  deliveryDatesNotice: "Delivery dates: 1 Nov–31 Mar. For other dates, select Office Pickup.",
  scrollMonths: "Scroll months",
  winterOfficeNotice: "Winter office pickup and return: morning 09:30–11:00 · evening 18:00–20:00. From 11:30–17:30 our team operates hotel and Airbnb deliveries. Delivery is free each way in Magaluf, Palmanova and Torrenova.",
  deliveryLocation: "Delivery location",
  airportLocationFee: "Palma de Mallorca Airport · €{fee}",
  howReturnScooter: "How will you return the scooter?",
  returnOfficeFree: "Return to office · Free",
  hotelAirbnbCollection: "Hotel/Airbnb collection",
  officeReturnTime: "Office return time",
  airportCollectionUnavailable: "Airport collection is not available. Return to our office or arrange collection from your accommodation.",
  selectDeliveryArea: "Select delivery area",
  selectCollectionArea: "Select collection area",
  hotel: "Hotel",
  airbnbAddressOption: "Airbnb / Address",
  roomLabel: "Room: {room}",
  edit: "Edit",
  deliveryCollection: "Delivery · collection",
  selectLiveTime: "Select live time",
  chooseTime: "Choose time",
  rentalDeliverySummary: "Rental €{rental} + delivery/collection €{fees}",
  deliveryCollectionFree: "Delivery and collection included free",
};

const EN_COPY: BookingPanelCopy = {
  ...EXTRA_EN_COPY,
  vehicle: "Vehicle",
  sameDayRental: "Same Day Rental",
  fullDay: "Full Day",
  chooseQuantity: "Select how many scooters you need",
  multiDayDiscount: "Discounted price on multiple-day rentals",
  mostPopular: "Most Popular",
  pickupDate: "Pickup Date",
  pickupTime: "Pickup Time",
  returnTime: "Return Time",
  dropoffDate: "Drop-off Date",
  selectDate: "Select date",
  selectDates: "Select",
  selectTime: "Select time",
  choosePlanFirst: "Please select Same Day Rental or Full Day first.",
  chooseDateFirst: "Please choose your pickup date first.",
  fullMin24: "Full Day booking must be at least 24 hours.",
  maxOnline6:
    "Maximum rental is 6 days. You can only rent up to 6 days online.",
  checkingWait: "Checking availability. Please wait a moment.",
  unavailableNotice:
    "This vehicle is not available for the selected date/time. Please change the dates or choose another vehicle.",
  availabilityRequired:
    "Live availability must be confirmed before checkout. Please wait a moment.",
  completeDetails: "Please complete your booking details first.",
  availabilityError:
    "Live availability could not be confirmed. Please try again or contact us on WhatsApp.",
  checkingLive: "Checking live availability...",
  availableCount: "{available} available",
  notEnoughQuantity:
    "Only {available} available. Please lower the quantity or contact us on WhatsApp.",
  summary: "Summary",
  choosePlanBegin: "Choose plan to begin",
  day: "day",
  days: "days",
  hour: "hour",
  hours: "hours",
  total: "Total",
  normalPrice: "Normal price",
  nowPrice: "Now",
  checkout: "Proceed to Checkout",
  checkingAvailability: "Checking availability...",
  notAvailable: "Not available",
  confirmingAvailability: "Confirming availability...",
  close: "Close",
  sameDropoffTime: "Drop-off time is the same as pickup time.",
  noTimesToday:
    "No more pickup times are available today. Please choose another date.",
};

function copy(overrides: Partial<BookingPanelCopy>): BookingPanelCopy {
  return { ...EN_COPY, ...overrides };
}

const I18N: Partial<Record<Locale, BookingPanelCopy>> = {
  en: EN_COPY,
  es: copy({
    vehicle: "Vehículo",
    sameDayRental: "Alquiler mismo día",
    fullDay: "Día completo",
    chooseQuantity: "Selecciona cuántos scooters necesitas",
    multiDayDiscount: "Precio con descuento en alquileres de varios días",
    mostPopular: "Más popular",
    pickupDate: "Fecha de recogida",
    pickupTime: "Hora de recogida",
    returnTime: "Hora de devolución",
    dropoffDate: "Fecha de devolución",
    selectDate: "Seleccionar fecha",
    selectDates: "Seleccionar",
    selectTime: "Seleccionar hora",
    choosePlanFirst:
      "Por favor selecciona Alquiler mismo día o Día completo primero.",
    chooseDateFirst: "Por favor elige primero la fecha de recogida.",
    fullMin24: "La reserva de Día completo debe ser de al menos 24 horas.",
    maxOnline6:
      "El alquiler máximo es de 6 días. Solo puedes reservar hasta 6 días online.",
    checkingWait: "Comprobando disponibilidad. Espera un momento.",
    unavailableNotice:
      "Este vehículo no está disponible para la fecha/hora seleccionada. Cambia las fechas o elige otro vehículo.",
    availabilityRequired:
      "La disponibilidad en vivo debe confirmarse antes del checkout. Espera un momento.",
    completeDetails: "Por favor completa los datos de tu reserva primero.",
    availabilityError:
      "No se pudo confirmar la disponibilidad en vivo. Inténtalo de nuevo o contáctanos por WhatsApp.",
    checkingLive: "Comprobando disponibilidad...",
    availableCount: "{available} disponibles",
    notEnoughQuantity:
      "Solo hay {available} disponibles. Baja la cantidad o contáctanos por WhatsApp.",
    summary: "Resumen",
    choosePlanBegin: "Elige un plan para empezar",
    day: "día",
    days: "días",
    hour: "hora",
    hours: "horas",
    total: "Total",
    normalPrice: "Precio normal",
    nowPrice: "Ahora",
    checkout: "Ir al checkout",
    checkingAvailability: "Comprobando disponibilidad...",
    notAvailable: "No disponible",
    confirmingAvailability: "Confirmando disponibilidad...",
    close: "Cerrar",
    sameDropoffTime:
      "La hora de devolución es la misma que la hora de recogida.",
    noTimesToday: "Ya no hay horas disponibles para hoy. Elige otra fecha.",
  }),
  de: copy({
    vehicle: "Fahrzeug",
    sameDayRental: "Gleicher Tag",
    fullDay: "Ganzer Tag",
    chooseQuantity: "Wähle, wie viele Scooter du brauchst",
    multiDayDiscount: "Rabattpreis bei mehrtägiger Miete",
    mostPopular: "Beliebt",
    pickupDate: "Abholdatum",
    pickupTime: "Abholzeit",
    returnTime: "Rückgabezeit",
    dropoffDate: "Rückgabedatum",
    selectDate: "Datum wählen",
    selectDates: "Auswählen",
    selectTime: "Zeit wählen",
    choosePlanFirst: "Bitte wähle zuerst Gleicher Tag oder Ganzer Tag.",
    chooseDateFirst: "Bitte wähle zuerst das Abholdatum.",
    fullMin24: "Eine Ganzer-Tag-Buchung muss mindestens 24 Stunden sein.",
    maxOnline6: "Die maximale Mietdauer beträgt 6 Tage.",
    checkingWait: "Verfügbarkeit wird geprüft. Bitte warte einen Moment.",
    unavailableNotice:
      "Dieses Fahrzeug ist für das gewählte Datum/die Uhrzeit nicht verfügbar.",
    availabilityRequired:
      "Die Live-Verfügbarkeit muss vor dem Checkout bestätigt werden.",
    completeDetails: "Bitte vervollständige zuerst deine Buchungsdetails.",
    availabilityError:
      "Die Live-Verfügbarkeit konnte nicht bestätigt werden. Bitte versuche es erneut.",
    checkingLive: "Live-Verfügbarkeit wird geprüft...",
    availableCount: "{available} verfügbar",
    notEnoughQuantity:
      "Nur {available} verfügbar. Bitte reduziere die Anzahl oder kontaktiere uns.",
    summary: "Zusammenfassung",
    choosePlanBegin: "Wähle einen Plan",
    day: "Tag",
    days: "Tage",
    hour: "Stunde",
    hours: "Stunden",
    total: "Gesamt",
    normalPrice: "Normalpreis",
    nowPrice: "Jetzt",
    checkout: "Weiter zum Checkout",
    checkingAvailability: "Verfügbarkeit wird geprüft...",
    notAvailable: "Nicht verfügbar",
    confirmingAvailability: "Verfügbarkeit wird bestätigt...",
    close: "Schließen",
    sameDropoffTime: "Die Rückgabezeit ist gleich wie die Abholzeit.",
    noTimesToday: "Für heute sind keine Abholzeiten mehr verfügbar.",
  }),
  fr: copy({
    vehicle: "Véhicule",
    sameDayRental: "Même journée",
    fullDay: "Journée complète",
    chooseQuantity: "Sélectionnez le nombre de scooters",
    multiDayDiscount: "Prix réduit pour plusieurs jours",
    mostPopular: "Populaire",
    pickupDate: "Date de retrait",
    pickupTime: "Heure de retrait",
    returnTime: "Heure de retour",
    dropoffDate: "Date de retour",
    selectDate: "Sélectionner une date",
    selectDates: "Sélectionner",
    selectTime: "Sélectionner l’heure",
    choosePlanFirst:
      "Veuillez d’abord choisir Même journée ou Journée complète.",
    chooseDateFirst: "Veuillez d’abord choisir la date de retrait.",
    fullMin24:
      "Une réservation Journée complète doit durer au moins 24 heures.",
    maxOnline6: "La location maximale est de 6 jours.",
    checkingWait: "Vérification de la disponibilité. Veuillez patienter.",
    unavailableNotice:
      "Ce véhicule n’est pas disponible pour la date/heure sélectionnée.",
    availabilityRequired:
      "La disponibilité en direct doit être confirmée avant le paiement.",
    completeDetails: "Veuillez compléter les détails de votre réservation.",
    availabilityError:
      "La disponibilité en direct n’a pas pu être confirmée. Réessayez.",
    checkingLive: "Vérification de la disponibilité...",
    availableCount: "{available} disponible(s)",
    notEnoughQuantity:
      "Seulement {available} disponible(s). Réduisez la quantité ou contactez-nous.",
    summary: "Résumé",
    choosePlanBegin: "Choisissez un plan",
    day: "jour",
    days: "jours",
    hour: "heure",
    hours: "heures",
    total: "Total",
    normalPrice: "Prix normal",
    nowPrice: "Maintenant",
    checkout: "Passer au paiement",
    checkingAvailability: "Vérification...",
    notAvailable: "Non disponible",
    confirmingAvailability: "Confirmation...",
    close: "Fermer",
    sameDropoffTime: "L’heure de retour est la même que l’heure de retrait.",
    noTimesToday: "Plus d’heures de retrait disponibles aujourd’hui.",
  }),
  it: copy({
    vehicle: "Veicolo",
    sameDayRental: "Stesso giorno",
    fullDay: "Giornata intera",
    chooseQuantity: "Seleziona quanti scooter ti servono",
    multiDayDiscount: "Prezzo scontato per più giorni",
    mostPopular: "Popolare",
    pickupDate: "Data ritiro",
    pickupTime: "Orario ritiro",
    returnTime: "Orario riconsegna",
    dropoffDate: "Data riconsegna",
    selectDate: "Seleziona data",
    selectDates: "Seleziona",
    selectTime: "Seleziona ora",
    choosePlanFirst: "Scegli prima Stesso giorno o Giornata intera.",
    chooseDateFirst: "Scegli prima la data di ritiro.",
    fullMin24:
      "La prenotazione Giornata intera deve essere di almeno 24 ore.",
    maxOnline6: "Il noleggio massimo è di 6 giorni.",
    checkingWait: "Controllo disponibilità. Attendi un momento.",
    unavailableNotice:
      "Questo veicolo non è disponibile per la data/ora selezionata.",
    availabilityRequired:
      "La disponibilità live deve essere confermata prima del checkout.",
    completeDetails: "Completa prima i dettagli della prenotazione.",
    availabilityError:
      "La disponibilità live non può essere confermata. Riprova.",
    checkingLive: "Controllo disponibilità...",
    availableCount: "{available} disponibili",
    notEnoughQuantity:
      "Solo {available} disponibili. Riduci la quantità o contattaci.",
    summary: "Riepilogo",
    choosePlanBegin: "Scegli un piano",
    day: "giorno",
    days: "giorni",
    hour: "ora",
    hours: "ore",
    total: "Totale",
    normalPrice: "Prezzo normale",
    nowPrice: "Ora",
    checkout: "Vai al checkout",
    checkingAvailability: "Controllo...",
    notAvailable: "Non disponibile",
    confirmingAvailability: "Conferma...",
    close: "Chiudi",
    sameDropoffTime: "L’orario di riconsegna è uguale all’orario di ritiro.",
    noTimesToday: "Non ci sono più orari disponibili per oggi.",
  }),
  nl: copy({
    vehicle: "Voertuig",
    sameDayRental: "Huur op dezelfde dag",
    fullDay: "Hele dag",
    chooseQuantity: "Selecteer hoeveel scooters je nodig hebt",
    multiDayDiscount: "Korting bij huur voor meerdere dagen",
    mostPopular: "Meest populair",
    pickupDate: "Ophaaldatum",
    pickupTime: "Ophaaltijd",
    returnTime: "Inlevertijd",
    dropoffDate: "Inleverdatum",
    selectDate: "Datum selecteren",
    selectDates: "Selecteren",
    selectTime: "Tijd selecteren",
    choosePlanFirst: "Kies eerst Huur op dezelfde dag of Hele dag.",
    chooseDateFirst: "Kies eerst je ophaaldatum.",
    fullMin24: "Een boeking voor een hele dag moet minstens 24 uur duren.",
    maxOnline6:
      "De maximale huurperiode is 6 dagen. Je kunt online maximaal 6 dagen huren.",
    checkingWait: "Beschikbaarheid controleren. Even geduld.",
    unavailableNotice:
      "Dit voertuig is niet beschikbaar voor de geselecteerde datum/tijd. Wijzig de datums of kies een ander voertuig.",
    availabilityRequired:
      "De actuele beschikbaarheid moet vóór het afrekenen worden bevestigd. Even geduld.",
    completeDetails: "Vul eerst alle boekingsgegevens in.",
    availabilityError:
      "De actuele beschikbaarheid kon niet worden bevestigd. Probeer het opnieuw of neem contact met ons op via WhatsApp.",
    checkingLive: "Actuele beschikbaarheid controleren...",
    availableCount: "{available} beschikbaar",
    notEnoughQuantity:
      "Slechts {available} beschikbaar. Verlaag het aantal of neem contact met ons op via WhatsApp.",
    summary: "Overzicht",
    choosePlanBegin: "Kies een optie om te beginnen",
    day: "dag",
    days: "dagen",
    hour: "uur",
    hours: "uur",
    total: "Totaal",
    normalPrice: "Normale prijs",
    nowPrice: "Nu",
    checkout: "Doorgaan naar afrekenen",
    checkingAvailability: "Beschikbaarheid controleren...",
    notAvailable: "Niet beschikbaar",
    confirmingAvailability: "Beschikbaarheid bevestigen...",
    close: "Sluiten",
    sameDropoffTime: "De inlevertijd is gelijk aan de ophaaltijd.",
    noTimesToday:
      "Er zijn vandaag geen ophaaltijden meer beschikbaar. Kies een andere datum.",
  }),
  pl: copy({
    vehicle: "Pojazd",
    sameDayRental: "Wynajem tego samego dnia",
    fullDay: "Pełny dzień",
    chooseQuantity: "Wybierz liczbę potrzebnych skuterów",
    multiDayDiscount: "Niższa cena przy wynajmie na kilka dni",
    mostPopular: "Najpopularniejsze",
    pickupDate: "Data odbioru",
    pickupTime: "Godzina odbioru",
    returnTime: "Godzina zwrotu",
    dropoffDate: "Data zwrotu",
    selectDate: "Wybierz datę",
    selectDates: "Wybierz",
    selectTime: "Wybierz godzinę",
    choosePlanFirst:
      "Najpierw wybierz Wynajem tego samego dnia lub Pełny dzień.",
    chooseDateFirst: "Najpierw wybierz datę odbioru.",
    fullMin24: "Rezerwacja na pełny dzień musi trwać co najmniej 24 godziny.",
    maxOnline6:
      "Maksymalny okres wynajmu wynosi 6 dni. Online możesz wynająć skuter na maksymalnie 6 dni.",
    checkingWait: "Sprawdzamy dostępność. Proszę czekać.",
    unavailableNotice:
      "Ten pojazd nie jest dostępny w wybranym terminie. Zmień daty lub wybierz inny pojazd.",
    availabilityRequired:
      "Dostępność musi zostać potwierdzona przed przejściem do płatności. Proszę czekać.",
    completeDetails: "Najpierw uzupełnij dane rezerwacji.",
    availabilityError:
      "Nie udało się potwierdzić dostępności. Spróbuj ponownie lub skontaktuj się z nami przez WhatsApp.",
    checkingLive: "Sprawdzamy aktualną dostępność...",
    availableCount: "Dostępne: {available}",
    notEnoughQuantity:
      "Dostępne są tylko {available}. Zmniejsz liczbę lub skontaktuj się z nami przez WhatsApp.",
    summary: "Podsumowanie",
    choosePlanBegin: "Wybierz opcję, aby rozpocząć",
    day: "dzień",
    days: "dni",
    hour: "godzina",
    hours: "godziny",
    total: "Razem",
    normalPrice: "Cena regularna",
    nowPrice: "Teraz",
    checkout: "Przejdź do płatności",
    checkingAvailability: "Sprawdzamy dostępność...",
    notAvailable: "Niedostępny",
    confirmingAvailability: "Potwierdzamy dostępność...",
    close: "Zamknij",
    sameDropoffTime: "Godzina zwrotu jest taka sama jak godzina odbioru.",
    noTimesToday:
      "Na dziś nie ma już dostępnych godzin odbioru. Wybierz inną datę.",
  }),
  pt: copy({
    vehicle: "Veículo",
    sameDayRental: "Mesmo dia",
    fullDay: "Dia completo",
    chooseQuantity: "Selecione quantas scooters precisa",
    multiDayDiscount: "Preço com desconto para vários dias",
    mostPopular: "Mais popular",
    pickupDate: "Data de levantamento",
    pickupTime: "Hora de levantamento",
    returnTime: "Hora de devolução",
    dropoffDate: "Data de devolução",
    selectDate: "Selecionar data",
    selectDates: "Selecionar",
    selectTime: "Selecionar hora",
    choosePlanFirst: "Escolha primeiro Mesmo dia ou Dia completo.",
    chooseDateFirst: "Escolha primeiro a data de levantamento.",
    fullMin24: "A reserva de Dia completo deve ter pelo menos 24 horas.",
    maxOnline6: "O aluguer máximo é de 6 dias.",
    checkingWait: "A verificar disponibilidade. Aguarde.",
    unavailableNotice:
      "Este veículo não está disponível para a data/hora selecionada.",
    availabilityRequired:
      "A disponibilidade ao vivo deve ser confirmada antes do checkout.",
    completeDetails: "Complete primeiro os dados da reserva.",
    availabilityError:
      "Não foi possível confirmar a disponibilidade. Tente novamente.",
    checkingLive: "A verificar disponibilidade...",
    availableCount: "{available} disponíveis",
    notEnoughQuantity:
      "Apenas {available} disponíveis. Reduza a quantidade ou contacte-nos.",
    summary: "Resumo",
    choosePlanBegin: "Escolha um plano",
    day: "dia",
    days: "dias",
    hour: "hora",
    hours: "horas",
    total: "Total",
    normalPrice: "Preço normal",
    nowPrice: "Agora",
    checkout: "Continuar para pagamento",
    checkingAvailability: "A verificar...",
    notAvailable: "Não disponível",
    confirmingAvailability: "A confirmar...",
    close: "Fechar",
    sameDropoffTime: "A hora de devolução é igual à hora de levantamento.",
    noTimesToday: "Não há mais horários disponíveis hoje.",
  }),
  sv: copy({
    vehicle: "Fordon",
    sameDayRental: "Samma dag",
    fullDay: "Heldag",
    chooseQuantity: "Välj hur många scooters du behöver",
    multiDayDiscount: "Rabatterat pris för flera dagar",
    mostPopular: "Populärast",
    pickupDate: "Upphämtningsdatum",
    pickupTime: "Upphämtningstid",
    returnTime: "Återlämningstid",
    dropoffDate: "Återlämningsdatum",
    selectDate: "Välj datum",
    selectDates: "Välj",
    selectTime: "Välj tid",
    choosePlanFirst: "Välj först Samma dag eller Heldag.",
    chooseDateFirst: "Välj först upphämtningsdatum.",
    fullMin24: "Heldagsbokning måste vara minst 24 timmar.",
    maxOnline6: "Max onlinebokning är 6 dagar.",
    checkingWait: "Kontrollerar tillgänglighet. Vänta en stund.",
    unavailableNotice:
      "Detta fordon är inte tillgängligt för valt datum/tid.",
    availabilityRequired:
      "Live-tillgänglighet måste bekräftas före checkout.",
    completeDetails: "Fyll i bokningsuppgifterna först.",
    availabilityError:
      "Live-tillgänglighet kunde inte bekräftas. Försök igen.",
    checkingLive: "Kontrollerar tillgänglighet...",
    availableCount: "{available} tillgängliga",
    notEnoughQuantity:
      "Endast {available} tillgängliga. Minska antal eller kontakta oss.",
    summary: "Sammanfattning",
    choosePlanBegin: "Välj en plan",
    day: "dag",
    days: "dagar",
    hour: "timme",
    hours: "timmar",
    total: "Totalt",
    normalPrice: "Normalpris",
    nowPrice: "Nu",
    checkout: "Fortsätt till betalning",
    checkingAvailability: "Kontrollerar...",
    notAvailable: "Ej tillgänglig",
    confirmingAvailability: "Bekräftar...",
    close: "Stäng",
    sameDropoffTime: "Återlämningstiden är samma som upphämtningstiden.",
    noTimesToday: "Inga fler tider finns tillgängliga idag.",
  }),
  da: copy({
    vehicle: "Køretøj",
    sameDayRental: "Leje samme dag",
    fullDay: "Hel dag",
    chooseQuantity: "Vælg, hvor mange scootere du har brug for",
    multiDayDiscount: "Rabatpris ved leje i flere dage",
    mostPopular: "Mest populær",
    pickupDate: "Afhentningsdato",
    pickupTime: "Afhentningstid",
    returnTime: "Afleveringstid",
    dropoffDate: "Afleveringsdato",
    selectDate: "Vælg dato",
    selectDates: "Vælg",
    selectTime: "Vælg tidspunkt",
    choosePlanFirst: "Vælg først Leje samme dag eller Hel dag.",
    chooseDateFirst: "Vælg først din afhentningsdato.",
    fullMin24: "En heldagsbooking skal vare mindst 24 timer.",
    maxOnline6:
      "Den maksimale lejeperiode er 6 dage. Du kan højst leje i 6 dage online.",
    checkingWait: "Tjekker tilgængelighed. Vent venligst.",
    unavailableNotice:
      "Dette køretøj er ikke tilgængeligt på den valgte dato/tid. Skift datoerne, eller vælg et andet køretøj.",
    availabilityRequired:
      "Den aktuelle tilgængelighed skal bekræftes før betaling. Vent venligst.",
    completeDetails: "Udfyld først dine bookingoplysninger.",
    availabilityError:
      "Den aktuelle tilgængelighed kunne ikke bekræftes. Prøv igen, eller kontakt os på WhatsApp.",
    checkingLive: "Tjekker aktuel tilgængelighed...",
    availableCount: "{available} tilgængelige",
    notEnoughQuantity:
      "Kun {available} tilgængelige. Reducer antallet, eller kontakt os på WhatsApp.",
    summary: "Oversigt",
    choosePlanBegin: "Vælg en mulighed for at begynde",
    day: "dag",
    days: "dage",
    hour: "time",
    hours: "timer",
    total: "I alt",
    normalPrice: "Normalpris",
    nowPrice: "Nu",
    checkout: "Fortsæt til betaling",
    checkingAvailability: "Tjekker tilgængelighed...",
    notAvailable: "Ikke tilgængelig",
    confirmingAvailability: "Bekræfter tilgængelighed...",
    close: "Luk",
    sameDropoffTime: "Afleveringstiden er den samme som afhentningstiden.",
    noTimesToday:
      "Der er ikke flere ledige afhentningstider i dag. Vælg en anden dato.",
  }),
  no: copy({
    vehicle: "Kjøretøy",
    sameDayRental: "Leie samme dag",
    fullDay: "Hel dag",
    chooseQuantity: "Velg hvor mange scootere du trenger",
    multiDayDiscount: "Rabattert pris ved leie i flere dager",
    mostPopular: "Mest populær",
    pickupDate: "Hentedato",
    pickupTime: "Hentetid",
    returnTime: "Returtid",
    dropoffDate: "Returdato",
    selectDate: "Velg dato",
    selectDates: "Velg",
    selectTime: "Velg tidspunkt",
    choosePlanFirst: "Velg først Leie samme dag eller Hel dag.",
    chooseDateFirst: "Velg først hentedato.",
    fullMin24: "En heldagsbestilling må vare i minst 24 timer.",
    maxOnline6:
      "Maksimal leieperiode er 6 dager. Du kan bare leie i opptil 6 dager på nett.",
    checkingWait: "Sjekker tilgjengelighet. Vennligst vent.",
    unavailableNotice:
      "Dette kjøretøyet er ikke tilgjengelig på valgt dato/tid. Endre datoene eller velg et annet kjøretøy.",
    availabilityRequired:
      "Aktuell tilgjengelighet må bekreftes før betaling. Vennligst vent.",
    completeDetails: "Fyll først ut bestillingsopplysningene.",
    availabilityError:
      "Aktuell tilgjengelighet kunne ikke bekreftes. Prøv igjen eller kontakt oss på WhatsApp.",
    checkingLive: "Sjekker aktuell tilgjengelighet...",
    availableCount: "{available} tilgjengelige",
    notEnoughQuantity:
      "Bare {available} tilgjengelige. Reduser antallet eller kontakt oss på WhatsApp.",
    summary: "Sammendrag",
    choosePlanBegin: "Velg et alternativ for å begynne",
    day: "dag",
    days: "dager",
    hour: "time",
    hours: "timer",
    total: "Totalt",
    normalPrice: "Normalpris",
    nowPrice: "Nå",
    checkout: "Fortsett til betaling",
    checkingAvailability: "Sjekker tilgjengelighet...",
    notAvailable: "Ikke tilgjengelig",
    confirmingAvailability: "Bekrefter tilgjengelighet...",
    close: "Lukk",
    sameDropoffTime: "Returtiden er den samme som hentetiden.",
    noTimesToday:
      "Det er ingen flere hentetider tilgjengelig i dag. Velg en annen dato.",
  }),
  sr: copy({
    vehicle: "Vozilo",
    sameDayRental: "Iznajmljivanje istog dana",
    fullDay: "Ceo dan",
    chooseQuantity: "Izaberite koliko skutera vam je potrebno",
    multiDayDiscount: "Snižena cena za iznajmljivanje na više dana",
    mostPopular: "Najpopularnije",
    pickupDate: "Datum preuzimanja",
    pickupTime: "Vreme preuzimanja",
    returnTime: "Vreme vraćanja",
    dropoffDate: "Datum vraćanja",
    selectDate: "Izaberite datum",
    selectDates: "Izaberite",
    selectTime: "Izaberite vreme",
    choosePlanFirst: "Prvo izaberite Iznajmljivanje istog dana ili Ceo dan.",
    chooseDateFirst: "Prvo izaberite datum preuzimanja.",
    fullMin24: "Rezervacija za ceo dan mora trajati najmanje 24 sata.",
    maxOnline6:
      "Maksimalno trajanje najma je 6 dana. Onlajn možete iznajmiti najviše 6 dana.",
    checkingWait: "Proveravamo dostupnost. Molimo sačekajte.",
    unavailableNotice:
      "Ovo vozilo nije dostupno za izabrani datum/vreme. Promenite datume ili izaberite drugo vozilo.",
    availabilityRequired:
      "Trenutna dostupnost mora biti potvrđena pre plaćanja. Molimo sačekajte.",
    completeDetails: "Prvo popunite podatke za rezervaciju.",
    availabilityError:
      "Trenutna dostupnost nije mogla biti potvrđena. Pokušajte ponovo ili nas kontaktirajte putem WhatsApp-a.",
    checkingLive: "Proveravamo trenutnu dostupnost...",
    availableCount: "Dostupno: {available}",
    notEnoughQuantity:
      "Dostupno je samo {available}. Smanjite količinu ili nas kontaktirajte putem WhatsApp-a.",
    summary: "Pregled",
    choosePlanBegin: "Izaberite opciju za početak",
    day: "dan",
    days: "dana",
    hour: "sat",
    hours: "sata",
    total: "Ukupno",
    normalPrice: "Redovna cena",
    nowPrice: "Sada",
    checkout: "Nastavite na plaćanje",
    checkingAvailability: "Proveravamo dostupnost...",
    notAvailable: "Nije dostupno",
    confirmingAvailability: "Potvrđujemo dostupnost...",
    close: "Zatvori",
    sameDropoffTime: "Vreme vraćanja je isto kao vreme preuzimanja.",
    noTimesToday:
      "Danas više nema dostupnih termina za preuzimanje. Izaberite drugi datum.",
  }),
  uk: copy({
    vehicle: "Транспорт",
    sameDayRental: "Оренда в той самий день",
    fullDay: "Повний день",
    chooseQuantity: "Оберіть потрібну кількість скутерів",
    multiDayDiscount: "Знижена ціна при оренді на кілька днів",
    mostPopular: "Найпопулярніше",
    pickupDate: "Дата отримання",
    pickupTime: "Час отримання",
    returnTime: "Час повернення",
    dropoffDate: "Дата повернення",
    selectDate: "Оберіть дату",
    selectDates: "Обрати",
    selectTime: "Оберіть час",
    choosePlanFirst:
      "Спочатку оберіть Оренду в той самий день або Повний день.",
    chooseDateFirst: "Спочатку оберіть дату отримання.",
    fullMin24: "Оренда на повний день має тривати щонайменше 24 години.",
    maxOnline6:
      "Максимальний термін оренди — 6 днів. Онлайн можна орендувати не більше ніж на 6 днів.",
    checkingWait: "Перевіряємо наявність. Будь ласка, зачекайте.",
    unavailableNotice:
      "Цей транспорт недоступний на вибрану дату/час. Змініть дати або оберіть інший транспорт.",
    availabilityRequired:
      "Актуальну наявність потрібно підтвердити перед оплатою. Будь ласка, зачекайте.",
    completeDetails: "Спочатку заповніть дані бронювання.",
    availabilityError:
      "Не вдалося підтвердити актуальну наявність. Спробуйте ще раз або напишіть нам у WhatsApp.",
    checkingLive: "Перевіряємо актуальну наявність...",
    availableCount: "Доступно: {available}",
    notEnoughQuantity:
      "Доступно лише {available}. Зменште кількість або напишіть нам у WhatsApp.",
    summary: "Підсумок",
    choosePlanBegin: "Оберіть варіант, щоб почати",
    day: "день",
    days: "днів",
    hour: "година",
    hours: "години",
    total: "Разом",
    normalPrice: "Звичайна ціна",
    nowPrice: "Зараз",
    checkout: "Перейти до оплати",
    checkingAvailability: "Перевіряємо наявність...",
    notAvailable: "Недоступно",
    confirmingAvailability: "Підтверджуємо наявність...",
    close: "Закрити",
    sameDropoffTime: "Час повернення збігається з часом отримання.",
    noTimesToday:
      "На сьогодні більше немає доступного часу отримання. Оберіть іншу дату.",
  }),
};

const CS_BASE_COPY: Partial<BookingPanelCopy> = {
  vehicle: "Vozidlo",
  sameDayRental: "Pronájem ve stejný den",
  fullDay: "Celý den",
  chooseQuantity: "Vyberte počet skútrů",
  multiDayDiscount: "Zvýhodněná cena při pronájmu na více dní",
  mostPopular: "Nejoblíbenější",
  pickupDate: "Datum vyzvednutí",
  pickupTime: "Čas vyzvednutí",
  returnTime: "Čas vrácení",
  dropoffDate: "Datum vrácení",
  selectDate: "Vybrat datum",
  selectDates: "Vybrat",
  selectTime: "Vybrat čas",
  choosePlanFirst: "Nejprve vyberte Pronájem ve stejný den nebo Celý den.",
  chooseDateFirst: "Nejprve vyberte datum vyzvednutí.",
  fullMin24: "Rezervace na celý den musí trvat alespoň 24 hodin.",
  maxOnline6: "Maximální online pronájem je 6 dní.",
  checkingWait: "Kontrolujeme dostupnost. Chvíli prosím počkejte.",
  unavailableNotice: "Toto vozidlo není ve vybraném termínu k dispozici. Změňte datum nebo vyberte jiné vozidlo.",
  availabilityRequired: "Před pokračováním k platbě je nutné potvrdit aktuální dostupnost. Chvíli prosím počkejte.",
  completeDetails: "Nejprve dokončete údaje rezervace.",
  availabilityError: "Aktuální dostupnost se nepodařilo potvrdit. Zkuste to znovu nebo nás kontaktujte přes WhatsApp.",
  checkingLive: "Kontrolujeme aktuální dostupnost...",
  availableCount: "Dostupné: {available}",
  notEnoughQuantity: "K dispozici je pouze {available}. Snižte počet nebo nás kontaktujte přes WhatsApp.",
  summary: "Shrnutí",
  choosePlanBegin: "Vyberte možnost a začněte",
  day: "den",
  days: "dní",
  hour: "hodina",
  hours: "hodiny",
  total: "Celkem",
  normalPrice: "Běžná cena",
  nowPrice: "Nyní",
  checkout: "Pokračovat k platbě",
  checkingAvailability: "Kontrolujeme dostupnost...",
  notAvailable: "Nedostupné",
  confirmingAvailability: "Potvrzujeme dostupnost...",
  close: "Zavřít",
  sameDropoffTime: "Čas vrácení je stejný jako čas vyzvednutí.",
  noTimesToday: "Na dnešek už nejsou k dispozici žádné časy vyzvednutí. Vyberte jiné datum.",
};

const EXTRA_I18N: Record<Locale, ExtraBookingPanelCopy> = {
  en: EXTRA_EN_COPY,
  es: {
    serviceQuestion: "¿Cómo quieres recibir tu scooter?",
    officePickup: "Recogida en oficina",
    hotelDelivery: "Entrega en hotel",
    airportDelivery: "Entrega en aeropuerto",
    selected: "{method} seleccionado",
    change: "Cambiar",
    chooseTownArea: "Elige localidad o zona",
    free: "Gratis",
    eachWay: "€{fee} por trayecto",
    hotelAirbnbDelivery: "Entrega en hotel / Airbnb",
    chooseDeliveryArea: "Elige la zona de entrega",
    deliveryAreaInstruction: "Selecciona tu localidad y consulta la tarifa de entrega por trayecto.",
    townArea: "Localidad / Zona",
    deliveryFeeEachWay: "Tarifa de entrega · por trayecto",
    liveDeliveryAvailability: "Disponibilidad de entrega en vivo",
    selectDeliveryTime: "Selecciona la hora de entrega",
    deliveryCollectionSameTime: "Se reserva la misma hora para la entrega el {pickupDate} y la recogida el {dropoffDate}.",
    airportDeliveryTimeNote: "Elige la hora de entrega en el aeropuerto para el {pickupDate}. La devolución en oficina sigue siendo a las {returnTime}.",
    available: "Disponible",
    unavailable: "No disponible",
    checkingDeliveryCollectionTimes: "Comprobando horarios de entrega y recogida en vivo…",
    deliveryTimesError: "No se pudieron cargar los horarios de entrega. Inténtalo de nuevo.",
    tryAgain: "Intentar de nuevo",
    scooterAvailable: "{count} scooter disponible",
    scootersAvailable: "{count} scooters disponibles",
    chooseGreenTime: "Elige una hora en verde",
    confirmTime: "Confirmar hora",
    hotelDeliveryArea: "Entrega en hotel · {area}",
    selectHotelTitle: "Selecciona tu hotel",
    hotelSearchInstruction: "Busca tu hotel en Google, confirma la dirección exacta y añade el número de habitación.",
    searchHotelName: "Buscar nombre del hotel",
    hotelPlaceholder: "Empieza a escribir un hotel en {area}",
    bestMatches: "Mejores coincidencias",
    hotelsNearby: "Hoteles cercanos",
    searching: "Buscando…",
    results: "{count} resultados",
    loadingHotels: "Cargando hoteles en {area}…",
    noHotelsFound: "No se encontraron hoteles coincidentes dentro de {area}. Prueba con otro nombre o cambia la zona de entrega.",
    selectedHotel: "Hotel seleccionado",
    googleReviews: "{count} reseñas de Google",
    hotelPhoto: "Foto {number} de {hotel}",
    openHotelPhoto: "Abrir foto {number} de {hotel}",
    view: "Ver",
    noPhoto: "Sin foto",
    roomOptional: "Número de habitación · opcional",
    roomExample: "Ejemplo: 214",
    verifiedGoogleMaps: "Ver ubicación verificada en Google Maps",
    selectHotelResultHelp: "Selecciona un hotel para revisar su dirección y fotos.",
    googleMapsInfo: "Información del hotel proporcionada por Google Maps",
    selectHotel: "Seleccionar hotel",
    hotelPhotoViewer: "Visor de fotos del hotel",
    closePhoto: "Cerrar foto",
    zoomOut: "Alejar",
    zoomIn: "Acercar",
    airbnbPrivateAddress: "Airbnb / dirección privada · {area}",
    airbnbPrivateAddressShort: "Airbnb / dirección privada",
    confirmDeliveryAddress: "Confirma la dirección de entrega",
    findAddressGoogle: "Busca tu dirección completa en Google Maps *",
    addressPlaceholder: "Calle y número en {area}",
    addressSearchUnavailable: "La búsqueda de direcciones no está disponible temporalmente.",
    addressOutsideArea: "Esta dirección no parece estar dentro de {area}. Selecciona una dirección dentro de la zona de entrega elegida.",
    addressLoadFailed: "No pudimos cargar esta dirección. Elige otro resultado.",
    streetName: "Nombre de la calle *",
    streetHouseNumber: "Número de calle / vivienda *",
    blockOptional: "Número de bloque · opcional",
    buildingOptional: "Nombre del edificio · opcional",
    floorOptional: "Planta · opcional",
    doorOptional: "Número de puerta · opcional",
    postalCode: "Código postal *",
    townAreaRequired: "Localidad / zona *",
    addressWarning: "Comprueba bien la dirección completa antes de confirmar. Debe estar dentro de la zona de entrega seleccionada. Los datos incorrectos, incompletos o fuera de zona pueden impedir la entrega y hacer que el pago de la reserva no sea reembolsable.",
    requiredFieldsGoogle: "* Campos obligatorios · Selecciona primero una dirección de Google",
    selectAddress: "Seleccionar dirección",
    blockToken: "Bloque {value}",
    floorToken: "Planta {value}",
    doorToken: "Puerta {value}",
    deliveryDatesNotice: "Fechas de entrega: 1 nov–31 mar. Para otras fechas, selecciona Recogida en oficina.",
    scrollMonths: "Desplázate por los meses",
    winterOfficeNotice: "Recogida y devolución en oficina en invierno: mañana 09:30–11:00 · tarde 18:00–20:00. De 11:30–17:30 nuestro equipo realiza entregas en hoteles y Airbnb. La entrega es gratis por trayecto en Magaluf, Palmanova y Torrenova.",
    deliveryLocation: "Lugar de entrega",
    airportLocationFee: "Aeropuerto de Palma de Mallorca · €{fee}",
    howReturnScooter: "¿Cómo devolverás el scooter?",
    returnOfficeFree: "Devolver en oficina · Gratis",
    hotelAirbnbCollection: "Recogida en hotel/Airbnb",
    officeReturnTime: "Hora de devolución en oficina",
    airportCollectionUnavailable: "No ofrecemos recogida en el aeropuerto. Devuelve el scooter en nuestra oficina o solicita recogida en tu alojamiento.",
    selectDeliveryArea: "Seleccionar zona de entrega",
    selectCollectionArea: "Seleccionar zona de recogida",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Dirección",
    roomLabel: "Habitación: {room}",
    edit: "Editar",
    deliveryCollection: "Entrega · recogida",
    selectLiveTime: "Seleccionar hora disponible",
    chooseTime: "Elegir hora",
    rentalDeliverySummary: "Alquiler €{rental} + entrega/recogida €{fees}",
    deliveryCollectionFree: "Entrega y recogida incluidas gratis",
  },
  de: {
    serviceQuestion: "Wie möchtest du deinen Scooter erhalten?",
    officePickup: "Abholung im Büro",
    hotelDelivery: "Lieferung zum Hotel",
    airportDelivery: "Lieferung zum Flughafen",
    selected: "{method} ausgewählt",
    change: "Ändern",
    chooseTownArea: "Ort oder Gebiet wählen",
    free: "Kostenlos",
    eachWay: "€{fee} pro Strecke",
    hotelAirbnbDelivery: "Hotel-/Airbnb-Lieferung",
    chooseDeliveryArea: "Liefergebiet wählen",
    deliveryAreaInstruction: "Wähle deinen Ort und sieh die Liefergebühr pro Strecke.",
    townArea: "Ort / Gebiet",
    deliveryFeeEachWay: "Liefergebühr · pro Strecke",
    liveDeliveryAvailability: "Live-Lieferverfügbarkeit",
    selectDeliveryTime: "Lieferzeit auswählen",
    deliveryCollectionSameTime: "Für die Lieferung am {pickupDate} und die Abholung am {dropoffDate} wird dieselbe Uhrzeit reserviert.",
    airportDeliveryTimeNote: "Wähle die Flughafen-Lieferzeit für den {pickupDate}. Deine Rückgabe im Büro bleibt um {returnTime}.",
    available: "Verfügbar",
    unavailable: "Nicht verfügbar",
    checkingDeliveryCollectionTimes: "Live-Zeiten für Lieferung und Abholung werden geprüft…",
    deliveryTimesError: "Die Lieferzeiten konnten nicht geladen werden. Bitte versuche es erneut.",
    tryAgain: "Erneut versuchen",
    scooterAvailable: "{count} Scooter verfügbar",
    scootersAvailable: "{count} Scooter verfügbar",
    chooseGreenTime: "Wähle eine grüne Uhrzeit",
    confirmTime: "Zeit bestätigen",
    hotelDeliveryArea: "Hotellieferung · {area}",
    selectHotelTitle: "Hotel auswählen",
    hotelSearchInstruction: "Suche dein Hotel bei Google, bestätige die genaue Adresse und gib deine Zimmernummer an.",
    searchHotelName: "Hotelname suchen",
    hotelPlaceholder: "Hotel in {area} eingeben",
    bestMatches: "Beste Treffer",
    hotelsNearby: "Hotels in der Nähe",
    searching: "Suche…",
    results: "{count} Ergebnisse",
    loadingHotels: "Hotels in {area} werden geladen…",
    noHotelsFound: "In {area} wurden keine passenden Hotels gefunden. Probiere einen anderen Hotelnamen oder ändere das Liefergebiet.",
    selectedHotel: "Ausgewähltes Hotel",
    googleReviews: "{count} Google-Bewertungen",
    hotelPhoto: "Foto {number} von {hotel}",
    openHotelPhoto: "Foto {number} von {hotel} öffnen",
    view: "Ansehen",
    noPhoto: "Kein Foto",
    roomOptional: "Zimmernummer · optional",
    roomExample: "Beispiel: 214",
    verifiedGoogleMaps: "Bestätigten Standort in Google Maps ansehen",
    selectHotelResultHelp: "Wähle ein Hotel aus, um Adresse und Fotos zu prüfen.",
    googleMapsInfo: "Hotelinformationen von Google Maps",
    selectHotel: "Hotel auswählen",
    hotelPhotoViewer: "Hotel-Fotoanzeige",
    closePhoto: "Foto schließen",
    zoomOut: "Verkleinern",
    zoomIn: "Vergrößern",
    airbnbPrivateAddress: "Airbnb / Privatadresse · {area}",
    airbnbPrivateAddressShort: "Airbnb / Privatadresse",
    confirmDeliveryAddress: "Lieferadresse bestätigen",
    findAddressGoogle: "Vollständige Adresse in Google Maps suchen *",
    addressPlaceholder: "Straße und Hausnummer in {area}",
    addressSearchUnavailable: "Die Adresssuche ist vorübergehend nicht verfügbar.",
    addressOutsideArea: "Diese Adresse scheint nicht in {area} zu liegen. Bitte wähle eine Adresse im ausgewählten Liefergebiet.",
    addressLoadFailed: "Diese Adresse konnte nicht geladen werden. Bitte wähle ein anderes Ergebnis.",
    streetName: "Straßenname *",
    streetHouseNumber: "Straße / Hausnummer *",
    blockOptional: "Blocknummer · optional",
    buildingOptional: "Gebäudename · optional",
    floorOptional: "Etage · optional",
    doorOptional: "Türnummer · optional",
    postalCode: "Postleitzahl *",
    townAreaRequired: "Ort / Gebiet *",
    addressWarning: "Bitte prüfe die vollständige Adresse vor der Bestätigung. Sie muss im ausgewählten Liefergebiet liegen. Falsche, unvollständige oder außerhalb des Gebiets liegende Angaben können die Lieferung verhindern und dazu führen, dass die Buchungszahlung nicht erstattet wird.",
    requiredFieldsGoogle: "* Pflichtfelder · Bitte zuerst eine Google-Adresse auswählen",
    selectAddress: "Adresse auswählen",
    blockToken: "Block {value}",
    floorToken: "Etage {value}",
    doorToken: "Tür {value}",
    deliveryDatesNotice: "Liefertermine: 1. Nov.–31. März. Für andere Termine bitte Abholung im Büro wählen.",
    scrollMonths: "Monate scrollen",
    winterOfficeNotice: "Winterliche Abholung und Rückgabe im Büro: morgens 09:30–11:00 · abends 18:00–20:00. Von 11:30–17:30 führt unser Team Hotel- und Airbnb-Lieferungen durch. Lieferung pro Strecke ist in Magaluf, Palmanova und Torrenova kostenlos.",
    deliveryLocation: "Lieferort",
    airportLocationFee: "Flughafen Palma de Mallorca · €{fee}",
    howReturnScooter: "Wie möchtest du den Scooter zurückgeben?",
    returnOfficeFree: "Im Büro zurückgeben · Kostenlos",
    hotelAirbnbCollection: "Abholung am Hotel/Airbnb",
    officeReturnTime: "Rückgabezeit im Büro",
    airportCollectionUnavailable: "Eine Abholung am Flughafen ist nicht verfügbar. Gib den Scooter in unserem Büro zurück oder vereinbare die Abholung an deiner Unterkunft.",
    selectDeliveryArea: "Liefergebiet wählen",
    selectCollectionArea: "Abholgebiet wählen",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Adresse",
    roomLabel: "Zimmer: {room}",
    edit: "Bearbeiten",
    deliveryCollection: "Lieferung · Abholung",
    selectLiveTime: "Live-Zeit auswählen",
    chooseTime: "Zeit wählen",
    rentalDeliverySummary: "Miete €{rental} + Lieferung/Abholung €{fees}",
    deliveryCollectionFree: "Lieferung und Abholung kostenlos inklusive",
  },
  fr: {
    serviceQuestion: "Comment souhaitez-vous recevoir votre scooter ?",
    officePickup: "Retrait à l’agence",
    hotelDelivery: "Livraison à l’hôtel",
    airportDelivery: "Livraison à l’aéroport",
    selected: "{method} sélectionné",
    change: "Modifier",
    chooseTownArea: "Choisissez une ville ou une zone",
    free: "Gratuit",
    eachWay: "€{fee} par trajet",
    hotelAirbnbDelivery: "Livraison hôtel / Airbnb",
    chooseDeliveryArea: "Choisissez la zone de livraison",
    deliveryAreaInstruction: "Sélectionnez votre ville et consultez les frais de livraison par trajet.",
    townArea: "Ville / Zone",
    deliveryFeeEachWay: "Frais de livraison · par trajet",
    liveDeliveryAvailability: "Disponibilité de livraison en direct",
    selectDeliveryTime: "Sélectionnez l’heure de livraison",
    deliveryCollectionSameTime: "La même heure est réservée pour la livraison le {pickupDate} et la collecte le {dropoffDate}.",
    airportDeliveryTimeNote: "Choisissez l’heure de livraison à l’aéroport pour le {pickupDate}. Votre retour à l’agence reste prévu à {returnTime}.",
    available: "Disponible",
    unavailable: "Indisponible",
    checkingDeliveryCollectionTimes: "Vérification en direct des horaires de livraison et de collecte…",
    deliveryTimesError: "Impossible de charger les horaires de livraison. Veuillez réessayer.",
    tryAgain: "Réessayer",
    scooterAvailable: "{count} scooter disponible",
    scootersAvailable: "{count} scooters disponibles",
    chooseGreenTime: "Choisissez un horaire en vert",
    confirmTime: "Confirmer l’heure",
    hotelDeliveryArea: "Livraison à l’hôtel · {area}",
    selectHotelTitle: "Sélectionnez votre hôtel",
    hotelSearchInstruction: "Recherchez votre hôtel sur Google, confirmez l’adresse exacte et ajoutez votre numéro de chambre.",
    searchHotelName: "Rechercher le nom de l’hôtel",
    hotelPlaceholder: "Commencez à saisir un hôtel à {area}",
    bestMatches: "Meilleurs résultats",
    hotelsNearby: "Hôtels à proximité",
    searching: "Recherche…",
    results: "{count} résultats",
    loadingHotels: "Chargement des hôtels à {area}…",
    noHotelsFound: "Aucun hôtel correspondant n’a été trouvé dans {area}. Essayez un autre nom d’hôtel ou changez de zone de livraison.",
    selectedHotel: "Hôtel sélectionné",
    googleReviews: "{count} avis Google",
    hotelPhoto: "Photo {number} de {hotel}",
    openHotelPhoto: "Ouvrir la photo {number} de {hotel}",
    view: "Voir",
    noPhoto: "Aucune photo",
    roomOptional: "Numéro de chambre · facultatif",
    roomExample: "Exemple : 214",
    verifiedGoogleMaps: "Voir l’emplacement vérifié sur Google Maps",
    selectHotelResultHelp: "Sélectionnez un hôtel pour vérifier son adresse et ses photos.",
    googleMapsInfo: "Informations sur l’hôtel fournies par Google Maps",
    selectHotel: "Sélectionner l’hôtel",
    hotelPhotoViewer: "Visionneuse de photos de l’hôtel",
    closePhoto: "Fermer la photo",
    zoomOut: "Dézoomer",
    zoomIn: "Zoomer",
    airbnbPrivateAddress: "Airbnb / adresse privée · {area}",
    airbnbPrivateAddressShort: "Airbnb / adresse privée",
    confirmDeliveryAddress: "Confirmez l’adresse de livraison",
    findAddressGoogle: "Recherchez votre adresse complète sur Google Maps *",
    addressPlaceholder: "Rue et numéro à {area}",
    addressSearchUnavailable: "La recherche d’adresse est temporairement indisponible.",
    addressOutsideArea: "Cette adresse ne semble pas se trouver dans {area}. Veuillez sélectionner une adresse dans la zone de livraison choisie.",
    addressLoadFailed: "Nous n’avons pas pu charger cette adresse. Veuillez choisir un autre résultat.",
    streetName: "Nom de rue *",
    streetHouseNumber: "Rue / numéro *",
    blockOptional: "Numéro de bloc · facultatif",
    buildingOptional: "Nom du bâtiment · facultatif",
    floorOptional: "Étage · facultatif",
    doorOptional: "Numéro de porte · facultatif",
    postalCode: "Code postal *",
    townAreaRequired: "Ville / zone *",
    addressWarning: "Veuillez vérifier attentivement l’adresse complète avant de confirmer. Elle doit se trouver dans la zone de livraison sélectionnée. Des informations incorrectes, incomplètes ou hors zone peuvent empêcher la livraison et rendre le paiement de la réservation non remboursable.",
    requiredFieldsGoogle: "* Champs obligatoires · Sélectionnez d’abord une adresse Google",
    selectAddress: "Sélectionner l’adresse",
    blockToken: "Bloc {value}",
    floorToken: "Étage {value}",
    doorToken: "Porte {value}",
    deliveryDatesNotice: "Dates de livraison : 1 nov.–31 mars. Pour les autres dates, choisissez Retrait à l’agence.",
    scrollMonths: "Faire défiler les mois",
    winterOfficeNotice: "Retrait et retour à l’agence en hiver : matin 09:30–11:00 · soir 18:00–20:00. De 11:30–17:30, notre équipe effectue les livraisons aux hôtels et Airbnb. La livraison est gratuite par trajet à Magaluf, Palmanova et Torrenova.",
    deliveryLocation: "Lieu de livraison",
    airportLocationFee: "Aéroport de Palma de Majorque · €{fee}",
    howReturnScooter: "Comment rendrez-vous le scooter ?",
    returnOfficeFree: "Retour à l’agence · Gratuit",
    hotelAirbnbCollection: "Collecte hôtel/Airbnb",
    officeReturnTime: "Heure de retour à l’agence",
    airportCollectionUnavailable: "La collecte à l’aéroport n’est pas disponible. Retournez le scooter à notre agence ou organisez une collecte depuis votre hébergement.",
    selectDeliveryArea: "Sélectionner la zone de livraison",
    selectCollectionArea: "Sélectionner la zone de collecte",
    hotel: "Hôtel",
    airbnbAddressOption: "Airbnb / Adresse",
    roomLabel: "Chambre : {room}",
    edit: "Modifier",
    deliveryCollection: "Livraison · collecte",
    selectLiveTime: "Sélectionner un horaire disponible",
    chooseTime: "Choisir l’heure",
    rentalDeliverySummary: "Location €{rental} + livraison/collecte €{fees}",
    deliveryCollectionFree: "Livraison et collecte incluses gratuitement",
  },
  it: {
    serviceQuestion: "Come vuoi ricevere il tuo scooter?",
    officePickup: "Ritiro in ufficio",
    hotelDelivery: "Consegna in hotel",
    airportDelivery: "Consegna in aeroporto",
    selected: "{method} selezionato",
    change: "Cambia",
    chooseTownArea: "Scegli località o zona",
    free: "Gratis",
    eachWay: "€{fee} a tratta",
    hotelAirbnbDelivery: "Consegna hotel / Airbnb",
    chooseDeliveryArea: "Scegli la zona di consegna",
    deliveryAreaInstruction: "Seleziona la località e visualizza il costo di consegna per tratta.",
    townArea: "Località / Zona",
    deliveryFeeEachWay: "Costo consegna · a tratta",
    liveDeliveryAvailability: "Disponibilità consegna in tempo reale",
    selectDeliveryTime: "Seleziona l’orario di consegna",
    deliveryCollectionSameTime: "Lo stesso orario viene riservato per la consegna il {pickupDate} e il ritiro il {dropoffDate}.",
    airportDeliveryTimeNote: "Scegli l’orario di consegna in aeroporto per il {pickupDate}. La restituzione in ufficio resta alle {returnTime}.",
    available: "Disponibile",
    unavailable: "Non disponibile",
    checkingDeliveryCollectionTimes: "Controllo in tempo reale degli orari di consegna e ritiro…",
    deliveryTimesError: "Impossibile caricare gli orari di consegna. Riprova.",
    tryAgain: "Riprova",
    scooterAvailable: "{count} scooter disponibile",
    scootersAvailable: "{count} scooter disponibili",
    chooseGreenTime: "Scegli un orario verde",
    confirmTime: "Conferma orario",
    hotelDeliveryArea: "Consegna in hotel · {area}",
    selectHotelTitle: "Seleziona il tuo hotel",
    hotelSearchInstruction: "Cerca il tuo hotel su Google, conferma l’indirizzo esatto e aggiungi il numero della camera.",
    searchHotelName: "Cerca nome hotel",
    hotelPlaceholder: "Inizia a digitare un hotel a {area}",
    bestMatches: "Migliori risultati",
    hotelsNearby: "Hotel nelle vicinanze",
    searching: "Ricerca…",
    results: "{count} risultati",
    loadingHotels: "Caricamento hotel a {area}…",
    noHotelsFound: "Nessun hotel corrispondente trovato a {area}. Prova un altro nome o cambia zona di consegna.",
    selectedHotel: "Hotel selezionato",
    googleReviews: "{count} recensioni Google",
    hotelPhoto: "Foto {number} di {hotel}",
    openHotelPhoto: "Apri foto {number} di {hotel}",
    view: "Visualizza",
    noPhoto: "Nessuna foto",
    roomOptional: "Numero camera · opzionale",
    roomExample: "Esempio: 214",
    verifiedGoogleMaps: "Visualizza posizione verificata su Google Maps",
    selectHotelResultHelp: "Seleziona un hotel per controllare indirizzo e foto.",
    googleMapsInfo: "Informazioni hotel fornite da Google Maps",
    selectHotel: "Seleziona hotel",
    hotelPhotoViewer: "Visualizzatore foto hotel",
    closePhoto: "Chiudi foto",
    zoomOut: "Riduci zoom",
    zoomIn: "Aumenta zoom",
    airbnbPrivateAddress: "Airbnb / indirizzo privato · {area}",
    airbnbPrivateAddressShort: "Airbnb / indirizzo privato",
    confirmDeliveryAddress: "Conferma l’indirizzo di consegna",
    findAddressGoogle: "Trova il tuo indirizzo completo su Google Maps *",
    addressPlaceholder: "Via e numero a {area}",
    addressSearchUnavailable: "La ricerca indirizzi è temporaneamente non disponibile.",
    addressOutsideArea: "Questo indirizzo non sembra trovarsi a {area}. Seleziona un indirizzo nella zona di consegna scelta.",
    addressLoadFailed: "Non siamo riusciti a caricare questo indirizzo. Scegli un altro risultato.",
    streetName: "Nome della via *",
    streetHouseNumber: "Via / numero civico *",
    blockOptional: "Numero blocco · opzionale",
    buildingOptional: "Nome edificio · opzionale",
    floorOptional: "Piano · opzionale",
    doorOptional: "Numero porta · opzionale",
    postalCode: "CAP *",
    townAreaRequired: "Località / zona *",
    addressWarning: "Controlla attentamente l’indirizzo completo prima di confermare. Deve trovarsi nella zona di consegna selezionata. Dati errati, incompleti o fuori zona possono impedire la consegna e rendere non rimborsabile il pagamento della prenotazione.",
    requiredFieldsGoogle: "* Campi obbligatori · Seleziona prima un indirizzo Google",
    selectAddress: "Seleziona indirizzo",
    blockToken: "Blocco {value}",
    floorToken: "Piano {value}",
    doorToken: "Porta {value}",
    deliveryDatesNotice: "Date di consegna: 1 nov–31 mar. Per le altre date seleziona Ritiro in ufficio.",
    scrollMonths: "Scorri i mesi",
    winterOfficeNotice: "Ritiro e restituzione in ufficio in inverno: mattina 09:30–11:00 · sera 18:00–20:00. Dalle 11:30 alle 17:30 il nostro team effettua consegne a hotel e Airbnb. La consegna è gratuita a tratta a Magaluf, Palmanova e Torrenova.",
    deliveryLocation: "Luogo di consegna",
    airportLocationFee: "Aeroporto di Palma di Maiorca · €{fee}",
    howReturnScooter: "Come restituirai lo scooter?",
    returnOfficeFree: "Restituzione in ufficio · Gratis",
    hotelAirbnbCollection: "Ritiro hotel/Airbnb",
    officeReturnTime: "Orario restituzione in ufficio",
    airportCollectionUnavailable: "Il ritiro in aeroporto non è disponibile. Restituisci lo scooter in ufficio oppure organizza il ritiro presso il tuo alloggio.",
    selectDeliveryArea: "Seleziona zona di consegna",
    selectCollectionArea: "Seleziona zona di ritiro",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Indirizzo",
    roomLabel: "Camera: {room}",
    edit: "Modifica",
    deliveryCollection: "Consegna · ritiro",
    selectLiveTime: "Seleziona orario disponibile",
    chooseTime: "Scegli orario",
    rentalDeliverySummary: "Noleggio €{rental} + consegna/ritiro €{fees}",
    deliveryCollectionFree: "Consegna e ritiro inclusi gratuitamente",
  },
  nl: {
    serviceQuestion: "Hoe wil je je scooter ontvangen?",
    officePickup: "Ophalen op kantoor",
    hotelDelivery: "Bezorging bij hotel",
    airportDelivery: "Bezorging op luchthaven",
    selected: "{method} geselecteerd",
    change: "Wijzigen",
    chooseTownArea: "Kies plaats of gebied",
    free: "Gratis",
    eachWay: "€{fee} per rit",
    hotelAirbnbDelivery: "Hotel-/Airbnb-bezorging",
    chooseDeliveryArea: "Kies bezorggebied",
    deliveryAreaInstruction: "Selecteer je plaats en bekijk de bezorgkosten per rit.",
    townArea: "Plaats / Gebied",
    deliveryFeeEachWay: "Bezorgkosten · per rit",
    liveDeliveryAvailability: "Live bezorgbeschikbaarheid",
    selectDeliveryTime: "Kies je bezorgtijd",
    deliveryCollectionSameTime: "Dezelfde tijd wordt gereserveerd voor bezorging op {pickupDate} en ophalen op {dropoffDate}.",
    airportDeliveryTimeNote: "Kies de bezorgtijd op de luchthaven voor {pickupDate}. Je retour op kantoor blijft om {returnTime}.",
    available: "Beschikbaar",
    unavailable: "Niet beschikbaar",
    checkingDeliveryCollectionTimes: "Live bezorg- en ophaaltijden controleren…",
    deliveryTimesError: "De bezorgtijden konden niet worden geladen. Probeer het opnieuw.",
    tryAgain: "Opnieuw proberen",
    scooterAvailable: "{count} scooter beschikbaar",
    scootersAvailable: "{count} scooters beschikbaar",
    chooseGreenTime: "Kies een groene tijd",
    confirmTime: "Tijd bevestigen",
    hotelDeliveryArea: "Hotelbezorging · {area}",
    selectHotelTitle: "Selecteer je hotel",
    hotelSearchInstruction: "Zoek je hotel op Google, bevestig het exacte adres en voeg je kamernummer toe.",
    searchHotelName: "Hotelnaam zoeken",
    hotelPlaceholder: "Typ een hotel in {area}",
    bestMatches: "Beste overeenkomsten",
    hotelsNearby: "Hotels in de buurt",
    searching: "Zoeken…",
    results: "{count} resultaten",
    loadingHotels: "Hotels in {area} laden…",
    noHotelsFound: "Geen passende hotels gevonden in {area}. Probeer een andere hotelnaam of wijzig het bezorggebied.",
    selectedHotel: "Geselecteerd hotel",
    googleReviews: "{count} Google-beoordelingen",
    hotelPhoto: "Foto {number} van {hotel}",
    openHotelPhoto: "Foto {number} van {hotel} openen",
    view: "Bekijken",
    noPhoto: "Geen foto",
    roomOptional: "Kamernummer · optioneel",
    roomExample: "Voorbeeld: 214",
    verifiedGoogleMaps: "Geverifieerde locatie bekijken op Google Maps",
    selectHotelResultHelp: "Selecteer een hotel om het adres en de foto’s te bekijken.",
    googleMapsInfo: "Hotelinformatie geleverd door Google Maps",
    selectHotel: "Hotel selecteren",
    hotelPhotoViewer: "Fotoviewer hotel",
    closePhoto: "Foto sluiten",
    zoomOut: "Uitzoomen",
    zoomIn: "Inzoomen",
    airbnbPrivateAddress: "Airbnb / privéadres · {area}",
    airbnbPrivateAddressShort: "Airbnb / privéadres",
    confirmDeliveryAddress: "Bezorgadres bevestigen",
    findAddressGoogle: "Zoek je volledige adres op Google Maps *",
    addressPlaceholder: "Straat en nummer in {area}",
    addressSearchUnavailable: "Adres zoeken is tijdelijk niet beschikbaar.",
    addressOutsideArea: "Dit adres lijkt niet binnen {area} te liggen. Selecteer een adres in het gekozen bezorggebied.",
    addressLoadFailed: "We konden dit adres niet laden. Kies een ander resultaat.",
    streetName: "Straatnaam *",
    streetHouseNumber: "Straat / huisnummer *",
    blockOptional: "Bloknummer · optioneel",
    buildingOptional: "Gebouwnaam · optioneel",
    floorOptional: "Verdieping · optioneel",
    doorOptional: "Deurnummer · optioneel",
    postalCode: "Postcode *",
    townAreaRequired: "Plaats / gebied *",
    addressWarning: "Controleer het volledige adres zorgvuldig voordat je bevestigt. Het adres moet binnen het geselecteerde bezorggebied liggen. Onjuiste, onvolledige of buiten het gebied gelegen informatie kan bezorging verhinderen en ertoe leiden dat de boekingsbetaling niet wordt terugbetaald.",
    requiredFieldsGoogle: "* Verplichte velden · Selecteer eerst een Google-adres",
    selectAddress: "Adres selecteren",
    blockToken: "Blok {value}",
    floorToken: "Verdieping {value}",
    doorToken: "Deur {value}",
    deliveryDatesNotice: "Bezorgdatums: 1 nov–31 mrt. Kies voor andere datums Ophalen op kantoor.",
    scrollMonths: "Door maanden scrollen",
    winterOfficeNotice: "Wintertijden voor ophalen en terugbrengen op kantoor: ochtend 09:30–11:00 · avond 18:00–20:00. Van 11:30–17:30 verzorgt ons team hotel- en Airbnb-bezorgingen. Bezorging is per rit gratis in Magaluf, Palmanova en Torrenova.",
    deliveryLocation: "Bezorglocatie",
    airportLocationFee: "Luchthaven Palma de Mallorca · €{fee}",
    howReturnScooter: "Hoe breng je de scooter terug?",
    returnOfficeFree: "Terugbrengen op kantoor · Gratis",
    hotelAirbnbCollection: "Ophalen bij hotel/Airbnb",
    officeReturnTime: "Retourtijd op kantoor",
    airportCollectionUnavailable: "Ophalen op de luchthaven is niet beschikbaar. Breng de scooter terug naar ons kantoor of laat hem bij je accommodatie ophalen.",
    selectDeliveryArea: "Bezorggebied selecteren",
    selectCollectionArea: "Ophaalgebied selecteren",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Adres",
    roomLabel: "Kamer: {room}",
    edit: "Bewerken",
    deliveryCollection: "Bezorging · ophalen",
    selectLiveTime: "Live tijd selecteren",
    chooseTime: "Tijd kiezen",
    rentalDeliverySummary: "Huur €{rental} + bezorging/ophalen €{fees}",
    deliveryCollectionFree: "Bezorging en ophalen gratis inbegrepen",
  },
  pl: {
    serviceQuestion: "Jak chcesz odebrać swój skuter?",
    officePickup: "Odbiór w biurze",
    hotelDelivery: "Dostawa do hotelu",
    airportDelivery: "Dostawa na lotnisko",
    selected: "Wybrano: {method}",
    change: "Zmień",
    chooseTownArea: "Wybierz miejscowość lub obszar",
    free: "Gratis",
    eachWay: "€{fee} za przejazd",
    hotelAirbnbDelivery: "Dostawa do hotelu / Airbnb",
    chooseDeliveryArea: "Wybierz obszar dostawy",
    deliveryAreaInstruction: "Wybierz miejscowość i sprawdź opłatę za dostawę w jedną stronę.",
    townArea: "Miejscowość / Obszar",
    deliveryFeeEachWay: "Opłata za dostawę · w jedną stronę",
    liveDeliveryAvailability: "Dostępność dostawy na żywo",
    selectDeliveryTime: "Wybierz godzinę dostawy",
    deliveryCollectionSameTime: "Ta sama godzina zostanie zarezerwowana na dostawę {pickupDate} i odbiór {dropoffDate}.",
    airportDeliveryTimeNote: "Wybierz godzinę dostawy na lotnisko na {pickupDate}. Zwrot w biurze pozostaje o {returnTime}.",
    available: "Dostępne",
    unavailable: "Niedostępne",
    checkingDeliveryCollectionTimes: "Sprawdzamy na żywo godziny dostawy i odbioru…",
    deliveryTimesError: "Nie udało się wczytać godzin dostawy. Spróbuj ponownie.",
    tryAgain: "Spróbuj ponownie",
    scooterAvailable: "Dostępny {count} skuter",
    scootersAvailable: "Dostępne skutery: {count}",
    chooseGreenTime: "Wybierz zieloną godzinę",
    confirmTime: "Potwierdź godzinę",
    hotelDeliveryArea: "Dostawa do hotelu · {area}",
    selectHotelTitle: "Wybierz hotel",
    hotelSearchInstruction: "Wyszukaj hotel w Google, potwierdź dokładny adres i dodaj numer pokoju.",
    searchHotelName: "Wyszukaj nazwę hotelu",
    hotelPlaceholder: "Zacznij wpisywać hotel w {area}",
    bestMatches: "Najlepsze dopasowania",
    hotelsNearby: "Hotele w pobliżu",
    searching: "Wyszukiwanie…",
    results: "Wyniki: {count}",
    loadingHotels: "Wczytywanie hoteli w {area}…",
    noHotelsFound: "Nie znaleziono pasujących hoteli w {area}. Spróbuj innej nazwy hotelu lub zmień obszar dostawy.",
    selectedHotel: "Wybrany hotel",
    googleReviews: "Opinie Google: {count}",
    hotelPhoto: "Zdjęcie {number} hotelu {hotel}",
    openHotelPhoto: "Otwórz zdjęcie {number} hotelu {hotel}",
    view: "Zobacz",
    noPhoto: "Brak zdjęcia",
    roomOptional: "Numer pokoju · opcjonalnie",
    roomExample: "Przykład: 214",
    verifiedGoogleMaps: "Zobacz zweryfikowaną lokalizację w Google Maps",
    selectHotelResultHelp: "Wybierz hotel, aby sprawdzić jego adres i zdjęcia.",
    googleMapsInfo: "Informacje o hotelu dostarczane przez Google Maps",
    selectHotel: "Wybierz hotel",
    hotelPhotoViewer: "Podgląd zdjęć hotelu",
    closePhoto: "Zamknij zdjęcie",
    zoomOut: "Pomniejsz",
    zoomIn: "Powiększ",
    airbnbPrivateAddress: "Airbnb / adres prywatny · {area}",
    airbnbPrivateAddressShort: "Airbnb / adres prywatny",
    confirmDeliveryAddress: "Potwierdź adres dostawy",
    findAddressGoogle: "Znajdź pełny adres w Google Maps *",
    addressPlaceholder: "Ulica i numer w {area}",
    addressSearchUnavailable: "Wyszukiwanie adresów jest chwilowo niedostępne.",
    addressOutsideArea: "Ten adres prawdopodobnie nie znajduje się w {area}. Wybierz adres w wybranym obszarze dostawy.",
    addressLoadFailed: "Nie udało się wczytać tego adresu. Wybierz inny wynik.",
    streetName: "Nazwa ulicy *",
    streetHouseNumber: "Ulica / numer domu *",
    blockOptional: "Numer bloku · opcjonalnie",
    buildingOptional: "Nazwa budynku · opcjonalnie",
    floorOptional: "Piętro · opcjonalnie",
    doorOptional: "Numer drzwi · opcjonalnie",
    postalCode: "Kod pocztowy *",
    townAreaRequired: "Miejscowość / obszar *",
    addressWarning: "Przed potwierdzeniem dokładnie sprawdź pełny adres. Musi znajdować się w wybranym obszarze dostawy. Nieprawidłowe, niepełne lub pozaobszarowe dane mogą uniemożliwić dostawę i spowodować, że płatność za rezerwację nie będzie podlegała zwrotowi.",
    requiredFieldsGoogle: "* Pola wymagane · Najpierw wybierz adres Google",
    selectAddress: "Wybierz adres",
    blockToken: "Blok {value}",
    floorToken: "Piętro {value}",
    doorToken: "Drzwi {value}",
    deliveryDatesNotice: "Daty dostawy: 1 lis–31 mar. Dla innych dat wybierz Odbiór w biurze.",
    scrollMonths: "Przewijaj miesiące",
    winterOfficeNotice: "Zimowy odbiór i zwrot w biurze: rano 09:30–11:00 · wieczorem 18:00–20:00. W godzinach 11:30–17:30 nasz zespół realizuje dostawy do hoteli i Airbnb. Dostawa w jedną stronę jest bezpłatna w Magaluf, Palmanova i Torrenova.",
    deliveryLocation: "Miejsce dostawy",
    airportLocationFee: "Lotnisko Palma de Mallorca · €{fee}",
    howReturnScooter: "Jak zwrócisz skuter?",
    returnOfficeFree: "Zwrot w biurze · Gratis",
    hotelAirbnbCollection: "Odbiór z hotelu/Airbnb",
    officeReturnTime: "Godzina zwrotu w biurze",
    airportCollectionUnavailable: "Odbiór z lotniska nie jest dostępny. Zwróć skuter w naszym biurze albo zamów odbiór z miejsca zakwaterowania.",
    selectDeliveryArea: "Wybierz obszar dostawy",
    selectCollectionArea: "Wybierz obszar odbioru",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Adres",
    roomLabel: "Pokój: {room}",
    edit: "Edytuj",
    deliveryCollection: "Dostawa · odbiór",
    selectLiveTime: "Wybierz dostępną godzinę",
    chooseTime: "Wybierz godzinę",
    rentalDeliverySummary: "Wynajem €{rental} + dostawa/odbiór €{fees}",
    deliveryCollectionFree: "Dostawa i odbiór w cenie",
  },
  sv: {
    serviceQuestion: "Hur vill du få din scooter?",
    officePickup: "Hämtning på kontoret",
    hotelDelivery: "Leverans till hotell",
    airportDelivery: "Leverans till flygplats",
    selected: "{method} vald",
    change: "Ändra",
    chooseTownArea: "Välj ort eller område",
    free: "Gratis",
    eachWay: "€{fee} per väg",
    hotelAirbnbDelivery: "Hotell-/Airbnb-leverans",
    chooseDeliveryArea: "Välj leveransområde",
    deliveryAreaInstruction: "Välj din ort och se leveransavgiften per väg.",
    townArea: "Ort / Område",
    deliveryFeeEachWay: "Leveransavgift · per väg",
    liveDeliveryAvailability: "Live-tillgänglighet för leverans",
    selectDeliveryTime: "Välj leveranstid",
    deliveryCollectionSameTime: "Samma tid reserveras för leverans den {pickupDate} och hämtning den {dropoffDate}.",
    airportDeliveryTimeNote: "Välj leveranstid till flygplatsen för {pickupDate}. Returen på kontoret är fortfarande {returnTime}.",
    available: "Tillgänglig",
    unavailable: "Ej tillgänglig",
    checkingDeliveryCollectionTimes: "Kontrollerar leverans- och hämtningstider live…",
    deliveryTimesError: "Leveranstiderna kunde inte laddas. Försök igen.",
    tryAgain: "Försök igen",
    scooterAvailable: "{count} scooter tillgänglig",
    scootersAvailable: "{count} scooters tillgängliga",
    chooseGreenTime: "Välj en grön tid",
    confirmTime: "Bekräfta tid",
    hotelDeliveryArea: "Hotellleverans · {area}",
    selectHotelTitle: "Välj ditt hotell",
    hotelSearchInstruction: "Sök hotellet på Google, bekräfta den exakta adressen och lägg till rumsnumret.",
    searchHotelName: "Sök hotellnamn",
    hotelPlaceholder: "Börja skriva ett hotell i {area}",
    bestMatches: "Bästa träffar",
    hotelsNearby: "Hotell i närheten",
    searching: "Söker…",
    results: "{count} resultat",
    loadingHotels: "Laddar hotell i {area}…",
    noHotelsFound: "Inga matchande hotell hittades i {area}. Prova ett annat hotellnamn eller byt leveransområde.",
    selectedHotel: "Valt hotell",
    googleReviews: "{count} Google-recensioner",
    hotelPhoto: "Foto {number} av {hotel}",
    openHotelPhoto: "Öppna foto {number} av {hotel}",
    view: "Visa",
    noPhoto: "Ingen bild",
    roomOptional: "Rumsnummer · valfritt",
    roomExample: "Exempel: 214",
    verifiedGoogleMaps: "Visa verifierad plats på Google Maps",
    selectHotelResultHelp: "Välj ett hotell för att kontrollera adress och bilder.",
    googleMapsInfo: "Hotellinformation från Google Maps",
    selectHotel: "Välj hotell",
    hotelPhotoViewer: "Bildvisare för hotell",
    closePhoto: "Stäng bild",
    zoomOut: "Zooma ut",
    zoomIn: "Zooma in",
    airbnbPrivateAddress: "Airbnb / privat adress · {area}",
    airbnbPrivateAddressShort: "Airbnb / privat adress",
    confirmDeliveryAddress: "Bekräfta leveransadressen",
    findAddressGoogle: "Hitta din fullständiga adress på Google Maps *",
    addressPlaceholder: "Gata och nummer i {area}",
    addressSearchUnavailable: "Adressökningen är tillfälligt otillgänglig.",
    addressOutsideArea: "Adressen verkar inte ligga i {area}. Välj en adress inom det valda leveransområdet.",
    addressLoadFailed: "Vi kunde inte ladda den här adressen. Välj ett annat resultat.",
    streetName: "Gatunamn *",
    streetHouseNumber: "Gata / husnummer *",
    blockOptional: "Blocknummer · valfritt",
    buildingOptional: "Byggnadsnamn · valfritt",
    floorOptional: "Våning · valfritt",
    doorOptional: "Dörrnummer · valfritt",
    postalCode: "Postnummer *",
    townAreaRequired: "Ort / område *",
    addressWarning: "Kontrollera hela adressen noggrant innan du bekräftar. Adressen måste ligga inom det valda leveransområdet. Felaktiga, ofullständiga eller utanför området angivna uppgifter kan förhindra leverans och göra bokningsbetalningen icke återbetalningsbar.",
    requiredFieldsGoogle: "* Obligatoriska fält · Välj först en Google-adress",
    selectAddress: "Välj adress",
    blockToken: "Block {value}",
    floorToken: "Våning {value}",
    doorToken: "Dörr {value}",
    deliveryDatesNotice: "Leveransdatum: 1 nov–31 mar. För andra datum väljer du Hämtning på kontoret.",
    scrollMonths: "Bläddra mellan månader",
    winterOfficeNotice: "Vintertider för hämtning och retur på kontoret: morgon 09:30–11:00 · kväll 18:00–20:00. Mellan 11:30–17:30 gör vårt team leveranser till hotell och Airbnb. Leverans per väg är gratis i Magaluf, Palmanova och Torrenova.",
    deliveryLocation: "Leveransplats",
    airportLocationFee: "Palma de Mallorca flygplats · €{fee}",
    howReturnScooter: "Hur vill du lämna tillbaka scootern?",
    returnOfficeFree: "Lämna på kontoret · Gratis",
    hotelAirbnbCollection: "Hämtning från hotell/Airbnb",
    officeReturnTime: "Returtid på kontoret",
    airportCollectionUnavailable: "Hämtning på flygplatsen är inte tillgänglig. Lämna scootern på vårt kontor eller ordna hämtning från ditt boende.",
    selectDeliveryArea: "Välj leveransområde",
    selectCollectionArea: "Välj hämtningsområde",
    hotel: "Hotell",
    airbnbAddressOption: "Airbnb / Adress",
    roomLabel: "Rum: {room}",
    edit: "Redigera",
    deliveryCollection: "Leverans · hämtning",
    selectLiveTime: "Välj tillgänglig tid",
    chooseTime: "Välj tid",
    rentalDeliverySummary: "Hyra €{rental} + leverans/hämtning €{fees}",
    deliveryCollectionFree: "Leverans och hämtning ingår gratis",
  },
  da: {
    serviceQuestion: "Hvordan vil du modtage din scooter?",
    officePickup: "Afhentning på kontoret",
    hotelDelivery: "Levering til hotel",
    airportDelivery: "Levering til lufthavn",
    selected: "{method} valgt",
    change: "Skift",
    chooseTownArea: "Vælg by eller område",
    free: "Gratis",
    eachWay: "€{fee} pr. vej",
    hotelAirbnbDelivery: "Hotel-/Airbnb-levering",
    chooseDeliveryArea: "Vælg leveringsområde",
    deliveryAreaInstruction: "Vælg din by og se leveringsgebyret pr. vej.",
    townArea: "By / Område",
    deliveryFeeEachWay: "Leveringsgebyr · pr. vej",
    liveDeliveryAvailability: "Live tilgængelighed for levering",
    selectDeliveryTime: "Vælg leveringstid",
    deliveryCollectionSameTime: "Samme tidspunkt reserveres til levering den {pickupDate} og afhentning den {dropoffDate}.",
    airportDeliveryTimeNote: "Vælg leveringstid til lufthavnen for {pickupDate}. Din aflevering på kontoret er fortsat kl. {returnTime}.",
    available: "Tilgængelig",
    unavailable: "Ikke tilgængelig",
    checkingDeliveryCollectionTimes: "Tjekker live tider for levering og afhentning…",
    deliveryTimesError: "Leveringstiderne kunne ikke indlæses. Prøv igen.",
    tryAgain: "Prøv igen",
    scooterAvailable: "{count} scooter tilgængelig",
    scootersAvailable: "{count} scootere tilgængelige",
    chooseGreenTime: "Vælg et grønt tidspunkt",
    confirmTime: "Bekræft tid",
    hotelDeliveryArea: "Hotellevering · {area}",
    selectHotelTitle: "Vælg dit hotel",
    hotelSearchInstruction: "Søg efter dit hotel på Google, bekræft den præcise adresse og tilføj værelsesnummer.",
    searchHotelName: "Søg hotelnavn",
    hotelPlaceholder: "Begynd at skrive et hotel i {area}",
    bestMatches: "Bedste resultater",
    hotelsNearby: "Hoteller i nærheden",
    searching: "Søger…",
    results: "{count} resultater",
    loadingHotels: "Indlæser hoteller i {area}…",
    noHotelsFound: "Der blev ikke fundet matchende hoteller i {area}. Prøv et andet hotelnavn, eller skift leveringsområde.",
    selectedHotel: "Valgt hotel",
    googleReviews: "{count} Google-anmeldelser",
    hotelPhoto: "Foto {number} af {hotel}",
    openHotelPhoto: "Åbn foto {number} af {hotel}",
    view: "Se",
    noPhoto: "Intet foto",
    roomOptional: "Værelsesnummer · valgfrit",
    roomExample: "Eksempel: 214",
    verifiedGoogleMaps: "Se bekræftet placering på Google Maps",
    selectHotelResultHelp: "Vælg et hotel for at kontrollere adresse og billeder.",
    googleMapsInfo: "Hotelinformation leveret af Google Maps",
    selectHotel: "Vælg hotel",
    hotelPhotoViewer: "Hotelbilledviser",
    closePhoto: "Luk foto",
    zoomOut: "Zoom ud",
    zoomIn: "Zoom ind",
    airbnbPrivateAddress: "Airbnb / privat adresse · {area}",
    airbnbPrivateAddressShort: "Airbnb / privat adresse",
    confirmDeliveryAddress: "Bekræft leveringsadressen",
    findAddressGoogle: "Find din fulde adresse på Google Maps *",
    addressPlaceholder: "Gade og nummer i {area}",
    addressSearchUnavailable: "Adressesøgning er midlertidigt utilgængelig.",
    addressOutsideArea: "Denne adresse ser ikke ud til at ligge i {area}. Vælg en adresse i det valgte leveringsområde.",
    addressLoadFailed: "Vi kunne ikke indlæse denne adresse. Vælg et andet resultat.",
    streetName: "Gadenavn *",
    streetHouseNumber: "Gade / husnummer *",
    blockOptional: "Bloknummer · valgfrit",
    buildingOptional: "Bygningsnavn · valgfrit",
    floorOptional: "Etage · valgfrit",
    doorOptional: "Dørnummer · valgfrit",
    postalCode: "Postnummer *",
    townAreaRequired: "By / område *",
    addressWarning: "Kontrollér hele adressen grundigt, før du bekræfter. Adressen skal være inden for det valgte leveringsområde. Forkerte, ufuldstændige eller uden for området angivne oplysninger kan forhindre levering og kan gøre bookingbetalingen ikke-refunderbar.",
    requiredFieldsGoogle: "* Obligatoriske felter · Vælg først en Google-adresse",
    selectAddress: "Vælg adresse",
    blockToken: "Blok {value}",
    floorToken: "Etage {value}",
    doorToken: "Dør {value}",
    deliveryDatesNotice: "Leveringsdatoer: 1. nov.–31. mar. Vælg Afhentning på kontoret for andre datoer.",
    scrollMonths: "Rul gennem måneder",
    winterOfficeNotice: "Vintertider for afhentning og aflevering på kontoret: morgen 09:30–11:00 · aften 18:00–20:00. Fra 11:30–17:30 leverer vores team til hoteller og Airbnb. Levering pr. vej er gratis i Magaluf, Palmanova og Torrenova.",
    deliveryLocation: "Leveringssted",
    airportLocationFee: "Palma de Mallorca Lufthavn · €{fee}",
    howReturnScooter: "Hvordan vil du returnere scooteren?",
    returnOfficeFree: "Aflever på kontoret · Gratis",
    hotelAirbnbCollection: "Afhentning fra hotel/Airbnb",
    officeReturnTime: "Afleveringstid på kontoret",
    airportCollectionUnavailable: "Afhentning i lufthavnen er ikke tilgængelig. Aflever scooteren på vores kontor, eller aftal afhentning fra dit overnatningssted.",
    selectDeliveryArea: "Vælg leveringsområde",
    selectCollectionArea: "Vælg afhentningsområde",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Adresse",
    roomLabel: "Værelse: {room}",
    edit: "Rediger",
    deliveryCollection: "Levering · afhentning",
    selectLiveTime: "Vælg ledigt tidspunkt",
    chooseTime: "Vælg tid",
    rentalDeliverySummary: "Leje €{rental} + levering/afhentning €{fees}",
    deliveryCollectionFree: "Levering og afhentning inkluderet gratis",
  },
  no: {
    serviceQuestion: "Hvordan vil du motta scooteren?",
    officePickup: "Henting på kontoret",
    hotelDelivery: "Levering til hotell",
    airportDelivery: "Levering til flyplass",
    selected: "{method} valgt",
    change: "Endre",
    chooseTownArea: "Velg sted eller område",
    free: "Gratis",
    eachWay: "€{fee} per vei",
    hotelAirbnbDelivery: "Hotell-/Airbnb-levering",
    chooseDeliveryArea: "Velg leveringsområde",
    deliveryAreaInstruction: "Velg stedet ditt og se leveringsgebyret per vei.",
    townArea: "Sted / Område",
    deliveryFeeEachWay: "Leveringsgebyr · per vei",
    liveDeliveryAvailability: "Live leveringstilgjengelighet",
    selectDeliveryTime: "Velg leveringstid",
    deliveryCollectionSameTime: "Samme tidspunkt reserveres for levering {pickupDate} og henting {dropoffDate}.",
    airportDeliveryTimeNote: "Velg leveringstid til flyplassen for {pickupDate}. Retur på kontoret er fortsatt kl. {returnTime}.",
    available: "Tilgjengelig",
    unavailable: "Ikke tilgjengelig",
    checkingDeliveryCollectionTimes: "Sjekker live tider for levering og henting…",
    deliveryTimesError: "Leveringstidene kunne ikke lastes inn. Prøv igjen.",
    tryAgain: "Prøv igjen",
    scooterAvailable: "{count} scooter tilgjengelig",
    scootersAvailable: "{count} scootere tilgjengelige",
    chooseGreenTime: "Velg en grønn tid",
    confirmTime: "Bekreft tid",
    hotelDeliveryArea: "Hotellevering · {area}",
    selectHotelTitle: "Velg hotellet ditt",
    hotelSearchInstruction: "Søk etter hotellet på Google, bekreft nøyaktig adresse og legg til romnummer.",
    searchHotelName: "Søk hotellnavn",
    hotelPlaceholder: "Begynn å skrive et hotell i {area}",
    bestMatches: "Beste treff",
    hotelsNearby: "Hoteller i nærheten",
    searching: "Søker…",
    results: "{count} resultater",
    loadingHotels: "Laster hoteller i {area}…",
    noHotelsFound: "Ingen samsvarende hoteller ble funnet i {area}. Prøv et annet hotellnavn eller bytt leveringsområde.",
    selectedHotel: "Valgt hotell",
    googleReviews: "{count} Google-anmeldelser",
    hotelPhoto: "Bilde {number} av {hotel}",
    openHotelPhoto: "Åpne bilde {number} av {hotel}",
    view: "Vis",
    noPhoto: "Ingen bilde",
    roomOptional: "Romnummer · valgfritt",
    roomExample: "Eksempel: 214",
    verifiedGoogleMaps: "Se bekreftet plassering på Google Maps",
    selectHotelResultHelp: "Velg et hotell for å se adresse og bilder.",
    googleMapsInfo: "Hotellinformasjon fra Google Maps",
    selectHotel: "Velg hotell",
    hotelPhotoViewer: "Bildevisning for hotell",
    closePhoto: "Lukk bilde",
    zoomOut: "Zoom ut",
    zoomIn: "Zoom inn",
    airbnbPrivateAddress: "Airbnb / privat adresse · {area}",
    airbnbPrivateAddressShort: "Airbnb / privat adresse",
    confirmDeliveryAddress: "Bekreft leveringsadressen",
    findAddressGoogle: "Finn hele adressen din på Google Maps *",
    addressPlaceholder: "Gate og nummer i {area}",
    addressSearchUnavailable: "Adressesøk er midlertidig utilgjengelig.",
    addressOutsideArea: "Denne adressen ser ikke ut til å ligge i {area}. Velg en adresse i det valgte leveringsområdet.",
    addressLoadFailed: "Vi kunne ikke laste inn denne adressen. Velg et annet resultat.",
    streetName: "Gatenavn *",
    streetHouseNumber: "Gate / husnummer *",
    blockOptional: "Blokknummer · valgfritt",
    buildingOptional: "Bygningsnavn · valgfritt",
    floorOptional: "Etasje · valgfritt",
    doorOptional: "Dørnummer · valgfritt",
    postalCode: "Postnummer *",
    townAreaRequired: "Sted / område *",
    addressWarning: "Kontroller hele adressen nøye før du bekrefter. Adressen må være innenfor valgt leveringsområde. Feil, ufullstendige eller utenfor området oppgitte opplysninger kan hindre levering og kan føre til at bestillingsbetalingen ikke refunderes.",
    requiredFieldsGoogle: "* Obligatoriske felt · Velg først en Google-adresse",
    selectAddress: "Velg adresse",
    blockToken: "Blokk {value}",
    floorToken: "Etasje {value}",
    doorToken: "Dør {value}",
    deliveryDatesNotice: "Leveringsdatoer: 1. nov.–31. mar. Velg Henting på kontoret for andre datoer.",
    scrollMonths: "Bla gjennom måneder",
    winterOfficeNotice: "Vintertider for henting og retur på kontoret: morgen 09:30–11:00 · kveld 18:00–20:00. Fra 11:30–17:30 leverer teamet vårt til hoteller og Airbnb. Levering per vei er gratis i Magaluf, Palmanova og Torrenova.",
    deliveryLocation: "Leveringssted",
    airportLocationFee: "Palma de Mallorca lufthavn · €{fee}",
    howReturnScooter: "Hvordan vil du returnere scooteren?",
    returnOfficeFree: "Returner på kontoret · Gratis",
    hotelAirbnbCollection: "Henting fra hotell/Airbnb",
    officeReturnTime: "Returtid på kontoret",
    airportCollectionUnavailable: "Henting på flyplassen er ikke tilgjengelig. Returner scooteren på kontoret vårt eller avtal henting fra overnattingsstedet ditt.",
    selectDeliveryArea: "Velg leveringsområde",
    selectCollectionArea: "Velg henteområde",
    hotel: "Hotell",
    airbnbAddressOption: "Airbnb / Adresse",
    roomLabel: "Rom: {room}",
    edit: "Rediger",
    deliveryCollection: "Levering · henting",
    selectLiveTime: "Velg tilgjengelig tid",
    chooseTime: "Velg tid",
    rentalDeliverySummary: "Leie €{rental} + levering/henting €{fees}",
    deliveryCollectionFree: "Levering og henting inkludert gratis",
  },
  pt: {
    serviceQuestion: "Como gostaria de receber a sua scooter?",
    officePickup: "Levantamento no escritório",
    hotelDelivery: "Entrega no hotel",
    airportDelivery: "Entrega no aeroporto",
    selected: "{method} selecionado",
    change: "Alterar",
    chooseTownArea: "Escolha a localidade ou zona",
    free: "Grátis",
    eachWay: "€{fee} por trajeto",
    hotelAirbnbDelivery: "Entrega em hotel / Airbnb",
    chooseDeliveryArea: "Escolha a zona de entrega",
    deliveryAreaInstruction: "Selecione a sua localidade e veja a taxa de entrega por trajeto.",
    townArea: "Localidade / Zona",
    deliveryFeeEachWay: "Taxa de entrega · por trajeto",
    liveDeliveryAvailability: "Disponibilidade de entrega em tempo real",
    selectDeliveryTime: "Selecione a hora de entrega",
    deliveryCollectionSameTime: "A mesma hora fica reservada para a entrega em {pickupDate} e recolha em {dropoffDate}.",
    airportDeliveryTimeNote: "Escolha a hora de entrega no aeroporto para {pickupDate}. A devolução no escritório mantém-se às {returnTime}.",
    available: "Disponível",
    unavailable: "Indisponível",
    checkingDeliveryCollectionTimes: "A verificar horários de entrega e recolha em tempo real…",
    deliveryTimesError: "Não foi possível carregar os horários de entrega. Tente novamente.",
    tryAgain: "Tentar novamente",
    scooterAvailable: "{count} scooter disponível",
    scootersAvailable: "{count} scooters disponíveis",
    chooseGreenTime: "Escolha um horário verde",
    confirmTime: "Confirmar hora",
    hotelDeliveryArea: "Entrega no hotel · {area}",
    selectHotelTitle: "Selecione o seu hotel",
    hotelSearchInstruction: "Pesquise o seu hotel no Google, confirme a morada exata e adicione o número do quarto.",
    searchHotelName: "Pesquisar nome do hotel",
    hotelPlaceholder: "Comece a escrever um hotel em {area}",
    bestMatches: "Melhores resultados",
    hotelsNearby: "Hotéis próximos",
    searching: "A pesquisar…",
    results: "{count} resultados",
    loadingHotels: "A carregar hotéis em {area}…",
    noHotelsFound: "Não foram encontrados hotéis correspondentes em {area}. Tente outro nome ou altere a zona de entrega.",
    selectedHotel: "Hotel selecionado",
    googleReviews: "{count} avaliações Google",
    hotelPhoto: "Foto {number} de {hotel}",
    openHotelPhoto: "Abrir foto {number} de {hotel}",
    view: "Ver",
    noPhoto: "Sem foto",
    roomOptional: "Número do quarto · opcional",
    roomExample: "Exemplo: 214",
    verifiedGoogleMaps: "Ver localização verificada no Google Maps",
    selectHotelResultHelp: "Selecione um hotel para rever a morada e as fotos.",
    googleMapsInfo: "Informação do hotel fornecida pelo Google Maps",
    selectHotel: "Selecionar hotel",
    hotelPhotoViewer: "Visualizador de fotos do hotel",
    closePhoto: "Fechar foto",
    zoomOut: "Reduzir zoom",
    zoomIn: "Aumentar zoom",
    airbnbPrivateAddress: "Airbnb / morada privada · {area}",
    airbnbPrivateAddressShort: "Airbnb / morada privada",
    confirmDeliveryAddress: "Confirme a morada de entrega",
    findAddressGoogle: "Encontre a sua morada completa no Google Maps *",
    addressPlaceholder: "Rua e número em {area}",
    addressSearchUnavailable: "A pesquisa de moradas está temporariamente indisponível.",
    addressOutsideArea: "Esta morada não parece estar dentro de {area}. Selecione uma morada na zona de entrega escolhida.",
    addressLoadFailed: "Não foi possível carregar esta morada. Escolha outro resultado.",
    streetName: "Nome da rua *",
    streetHouseNumber: "Rua / número da porta *",
    blockOptional: "Número do bloco · opcional",
    buildingOptional: "Nome do edifício · opcional",
    floorOptional: "Andar · opcional",
    doorOptional: "Número da porta · opcional",
    postalCode: "Código postal *",
    townAreaRequired: "Localidade / zona *",
    addressWarning: "Confirme cuidadosamente a morada completa antes de avançar. A morada deve ficar dentro da zona de entrega selecionada. Informação incorreta, incompleta ou fora da zona pode impedir a entrega e fazer com que o pagamento da reserva não seja reembolsável.",
    requiredFieldsGoogle: "* Campos obrigatórios · Selecione primeiro uma morada do Google",
    selectAddress: "Selecionar morada",
    blockToken: "Bloco {value}",
    floorToken: "Andar {value}",
    doorToken: "Porta {value}",
    deliveryDatesNotice: "Datas de entrega: 1 nov–31 mar. Para outras datas, selecione Levantamento no escritório.",
    scrollMonths: "Percorrer meses",
    winterOfficeNotice: "Levantamento e devolução no escritório no inverno: manhã 09:30–11:00 · noite 18:00–20:00. Das 11:30–17:30 a nossa equipa realiza entregas em hotéis e Airbnb. A entrega é grátis por trajeto em Magaluf, Palmanova e Torrenova.",
    deliveryLocation: "Local de entrega",
    airportLocationFee: "Aeroporto de Palma de Maiorca · €{fee}",
    howReturnScooter: "Como vai devolver a scooter?",
    returnOfficeFree: "Devolver no escritório · Grátis",
    hotelAirbnbCollection: "Recolha em hotel/Airbnb",
    officeReturnTime: "Hora de devolução no escritório",
    airportCollectionUnavailable: "A recolha no aeroporto não está disponível. Devolva a scooter no nosso escritório ou combine a recolha no seu alojamento.",
    selectDeliveryArea: "Selecionar zona de entrega",
    selectCollectionArea: "Selecionar zona de recolha",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Morada",
    roomLabel: "Quarto: {room}",
    edit: "Editar",
    deliveryCollection: "Entrega · recolha",
    selectLiveTime: "Selecionar hora disponível",
    chooseTime: "Escolher hora",
    rentalDeliverySummary: "Aluguer €{rental} + entrega/recolha €{fees}",
    deliveryCollectionFree: "Entrega e recolha incluídas gratuitamente",
  },
  cs: {
    serviceQuestion: "Jak si přejete skútr převzít?",
    officePickup: "Vyzvednutí v kanceláři",
    hotelDelivery: "Doručení do hotelu",
    airportDelivery: "Doručení na letiště",
    selected: "Vybráno: {method}",
    change: "Změnit",
    chooseTownArea: "Vyberte město nebo oblast",
    free: "Zdarma",
    eachWay: "€{fee} za jednu cestu",
    hotelAirbnbDelivery: "Doručení do hotelu / Airbnb",
    chooseDeliveryArea: "Vyberte oblast doručení",
    deliveryAreaInstruction: "Vyberte město a zobrazte cenu doručení za jednu cestu.",
    townArea: "Město / Oblast",
    deliveryFeeEachWay: "Poplatek za doručení · za jednu cestu",
    liveDeliveryAvailability: "Aktuální dostupnost doručení",
    selectDeliveryTime: "Vyberte čas doručení",
    deliveryCollectionSameTime: "Stejný čas bude rezervován pro doručení dne {pickupDate} a vyzvednutí dne {dropoffDate}.",
    airportDeliveryTimeNote: "Vyberte čas doručení na letiště pro {pickupDate}. Vrácení v kanceláři zůstává v {returnTime}.",
    available: "Dostupné",
    unavailable: "Nedostupné",
    checkingDeliveryCollectionTimes: "Kontrolujeme aktuální časy doručení a vyzvednutí…",
    deliveryTimesError: "Časy doručení se nepodařilo načíst. Zkuste to znovu.",
    tryAgain: "Zkusit znovu",
    scooterAvailable: "{count} skútr dostupný",
    scootersAvailable: "Dostupné skútry: {count}",
    chooseGreenTime: "Vyberte zelený čas",
    confirmTime: "Potvrdit čas",
    hotelDeliveryArea: "Doručení do hotelu · {area}",
    selectHotelTitle: "Vyberte svůj hotel",
    hotelSearchInstruction: "Vyhledejte hotel na Googlu, potvrďte přesnou adresu a přidejte číslo pokoje.",
    searchHotelName: "Hledat název hotelu",
    hotelPlaceholder: "Začněte psát název hotelu v {area}",
    bestMatches: "Nejlepší shody",
    hotelsNearby: "Hotely v okolí",
    searching: "Vyhledávání…",
    results: "Výsledků: {count}",
    loadingHotels: "Načítání hotelů v {area}…",
    noHotelsFound: "V oblasti {area} nebyly nalezeny odpovídající hotely. Zkuste jiný název nebo změňte oblast doručení.",
    selectedHotel: "Vybraný hotel",
    googleReviews: "{count} recenzí Google",
    hotelPhoto: "Fotografie {number} hotelu {hotel}",
    openHotelPhoto: "Otevřít fotografii {number} hotelu {hotel}",
    view: "Zobrazit",
    noPhoto: "Bez fotografie",
    roomOptional: "Číslo pokoje · volitelné",
    roomExample: "Příklad: 214",
    verifiedGoogleMaps: "Zobrazit ověřenou polohu v Google Maps",
    selectHotelResultHelp: "Vyberte hotel a zkontrolujte jeho adresu a fotografie.",
    googleMapsInfo: "Informace o hotelu poskytuje Google Maps",
    selectHotel: "Vybrat hotel",
    hotelPhotoViewer: "Prohlížeč fotografií hotelu",
    closePhoto: "Zavřít fotografii",
    zoomOut: "Oddálit",
    zoomIn: "Přiblížit",
    airbnbPrivateAddress: "Airbnb / soukromá adresa · {area}",
    airbnbPrivateAddressShort: "Airbnb / soukromá adresa",
    confirmDeliveryAddress: "Potvrďte adresu doručení",
    findAddressGoogle: "Najděte svou úplnou adresu v Google Maps *",
    addressPlaceholder: "Ulice a číslo v {area}",
    addressSearchUnavailable: "Vyhledávání adres je dočasně nedostupné.",
    addressOutsideArea: "Tato adresa se zřejmě nenachází v oblasti {area}. Vyberte adresu ve zvolené oblasti doručení.",
    addressLoadFailed: "Tuto adresu se nepodařilo načíst. Vyberte jiný výsledek.",
    streetName: "Název ulice *",
    streetHouseNumber: "Ulice / číslo domu *",
    blockOptional: "Číslo bloku · volitelné",
    buildingOptional: "Název budovy · volitelné",
    floorOptional: "Patro · volitelné",
    doorOptional: "Číslo dveří · volitelné",
    postalCode: "PSČ *",
    townAreaRequired: "Město / oblast *",
    addressWarning: "Před potvrzením pečlivě zkontrolujte celou adresu. Musí se nacházet ve vybrané oblasti doručení. Nesprávné, neúplné nebo mimo oblast uvedené údaje mohou zabránit doručení a mohou způsobit, že platba za rezervaci nebude vratná.",
    requiredFieldsGoogle: "* Povinná pole · Nejprve vyberte adresu Google",
    selectAddress: "Vybrat adresu",
    blockToken: "Blok {value}",
    floorToken: "Patro {value}",
    doorToken: "Dveře {value}",
    deliveryDatesNotice: "Termíny doručení: 1. lis.–31. bře. Pro jiné termíny zvolte Vyzvednutí v kanceláři.",
    scrollMonths: "Procházet měsíce",
    winterOfficeNotice: "Zimní vyzvednutí a vrácení v kanceláři: ráno 09:30–11:00 · večer 18:00–20:00. Od 11:30–17:30 náš tým zajišťuje doručení do hotelů a Airbnb. Doručení za jednu cestu je zdarma v Magaluf, Palmanova a Torrenova.",
    deliveryLocation: "Místo doručení",
    airportLocationFee: "Letiště Palma de Mallorca · €{fee}",
    howReturnScooter: "Jak skútr vrátíte?",
    returnOfficeFree: "Vrátit v kanceláři · Zdarma",
    hotelAirbnbCollection: "Vyzvednutí v hotelu/Airbnb",
    officeReturnTime: "Čas vrácení v kanceláři",
    airportCollectionUnavailable: "Vyzvednutí na letišti není k dispozici. Vraťte skútr v naší kanceláři nebo si sjednejte vyzvednutí z ubytování.",
    selectDeliveryArea: "Vybrat oblast doručení",
    selectCollectionArea: "Vybrat oblast vyzvednutí",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Adresa",
    roomLabel: "Pokoj: {room}",
    edit: "Upravit",
    deliveryCollection: "Doručení · vyzvednutí",
    selectLiveTime: "Vybrat dostupný čas",
    chooseTime: "Vybrat čas",
    rentalDeliverySummary: "Pronájem €{rental} + doručení/vyzvednutí €{fees}",
    deliveryCollectionFree: "Doručení a vyzvednutí v ceně zdarma",
  },
  sr: {
    serviceQuestion: "Kako želite da preuzmete svoj skuter?",
    officePickup: "Preuzimanje u kancelariji",
    hotelDelivery: "Dostava u hotel",
    airportDelivery: "Dostava na aerodrom",
    selected: "Izabrano: {method}",
    change: "Promeni",
    chooseTownArea: "Izaberite mesto ili oblast",
    free: "Besplatno",
    eachWay: "€{fee} po smeru",
    hotelAirbnbDelivery: "Dostava u hotel / Airbnb",
    chooseDeliveryArea: "Izaberite oblast dostave",
    deliveryAreaInstruction: "Izaberite mesto i pogledajte cenu dostave po smeru.",
    townArea: "Mesto / Oblast",
    deliveryFeeEachWay: "Cena dostave · po smeru",
    liveDeliveryAvailability: "Dostupnost dostave uživo",
    selectDeliveryTime: "Izaberite vreme dostave",
    deliveryCollectionSameTime: "Isto vreme se rezerviše za dostavu {pickupDate} i preuzimanje {dropoffDate}.",
    airportDeliveryTimeNote: "Izaberite vreme dostave na aerodrom za {pickupDate}. Povratak u kancelariju ostaje u {returnTime}.",
    available: "Dostupno",
    unavailable: "Nedostupno",
    checkingDeliveryCollectionTimes: "Proveravamo dostupna vremena dostave i preuzimanja…",
    deliveryTimesError: "Vremena dostave nisu mogla da se učitaju. Pokušajte ponovo.",
    tryAgain: "Pokušaj ponovo",
    scooterAvailable: "Dostupan je {count} skuter",
    scootersAvailable: "Dostupno skutera: {count}",
    chooseGreenTime: "Izaberite zeleno vreme",
    confirmTime: "Potvrdi vreme",
    hotelDeliveryArea: "Dostava u hotel · {area}",
    selectHotelTitle: "Izaberite hotel",
    hotelSearchInstruction: "Pronađite hotel na Google-u, potvrdite tačnu adresu i dodajte broj sobe.",
    searchHotelName: "Pretraži naziv hotela",
    hotelPlaceholder: "Počnite da kucate hotel u {area}",
    bestMatches: "Najbolji rezultati",
    hotelsNearby: "Hoteli u blizini",
    searching: "Pretraga…",
    results: "Rezultata: {count}",
    loadingHotels: "Učitavanje hotela u {area}…",
    noHotelsFound: "Nisu pronađeni odgovarajući hoteli u oblasti {area}. Probajte drugi naziv hotela ili promenite oblast dostave.",
    selectedHotel: "Izabrani hotel",
    googleReviews: "{count} Google recenzija",
    hotelPhoto: "Fotografija {number} hotela {hotel}",
    openHotelPhoto: "Otvori fotografiju {number} hotela {hotel}",
    view: "Pogledaj",
    noPhoto: "Nema fotografije",
    roomOptional: "Broj sobe · opciono",
    roomExample: "Primer: 214",
    verifiedGoogleMaps: "Pogledaj potvrđenu lokaciju na Google Maps",
    selectHotelResultHelp: "Izaberite hotel da proverite adresu i fotografije.",
    googleMapsInfo: "Informacije o hotelu pruža Google Maps",
    selectHotel: "Izaberi hotel",
    hotelPhotoViewer: "Pregled fotografija hotela",
    closePhoto: "Zatvori fotografiju",
    zoomOut: "Umanji",
    zoomIn: "Uvećaj",
    airbnbPrivateAddress: "Airbnb / privatna adresa · {area}",
    airbnbPrivateAddressShort: "Airbnb / privatna adresa",
    confirmDeliveryAddress: "Potvrdite adresu dostave",
    findAddressGoogle: "Pronađite kompletnu adresu na Google Maps *",
    addressPlaceholder: "Ulica i broj u {area}",
    addressSearchUnavailable: "Pretraga adresa je privremeno nedostupna.",
    addressOutsideArea: "Ova adresa izgleda nije u oblasti {area}. Izaberite adresu unutar izabrane oblasti dostave.",
    addressLoadFailed: "Nismo mogli da učitamo ovu adresu. Izaberite drugi rezultat.",
    streetName: "Naziv ulice *",
    streetHouseNumber: "Ulica / kućni broj *",
    blockOptional: "Broj bloka · opciono",
    buildingOptional: "Naziv zgrade · opciono",
    floorOptional: "Sprat · opciono",
    doorOptional: "Broj vrata · opciono",
    postalCode: "Poštanski broj *",
    townAreaRequired: "Mesto / oblast *",
    addressWarning: "Pažljivo proverite kompletnu adresu pre potvrde. Adresa mora biti unutar izabrane oblasti dostave. Netačni, nepotpuni ili podaci van oblasti mogu sprečiti dostavu i mogu dovesti do toga da uplata rezervacije ne bude refundirana.",
    requiredFieldsGoogle: "* Obavezna polja · Prvo izaberite Google adresu",
    selectAddress: "Izaberi adresu",
    blockToken: "Blok {value}",
    floorToken: "Sprat {value}",
    doorToken: "Vrata {value}",
    deliveryDatesNotice: "Datumi dostave: 1. nov–31. mar. Za druge datume izaberite Preuzimanje u kancelariji.",
    scrollMonths: "Listaj mesece",
    winterOfficeNotice: "Zimsko preuzimanje i vraćanje u kancelariji: jutro 09:30–11:00 · veče 18:00–20:00. Od 11:30–17:30 naš tim obavlja dostave u hotele i Airbnb. Dostava po smeru je besplatna u Magalufu, Palmanovi i Torrenovi.",
    deliveryLocation: "Mesto dostave",
    airportLocationFee: "Aerodrom Palma de Mallorca · €{fee}",
    howReturnScooter: "Kako ćete vratiti skuter?",
    returnOfficeFree: "Vrati u kancelariju · Besplatno",
    hotelAirbnbCollection: "Preuzimanje iz hotela/Airbnb",
    officeReturnTime: "Vreme vraćanja u kancelariju",
    airportCollectionUnavailable: "Preuzimanje na aerodromu nije dostupno. Vratite skuter u našu kancelariju ili dogovorite preuzimanje iz smeštaja.",
    selectDeliveryArea: "Izaberi oblast dostave",
    selectCollectionArea: "Izaberi oblast preuzimanja",
    hotel: "Hotel",
    airbnbAddressOption: "Airbnb / Adresa",
    roomLabel: "Soba: {room}",
    edit: "Izmeni",
    deliveryCollection: "Dostava · preuzimanje",
    selectLiveTime: "Izaberi dostupno vreme",
    chooseTime: "Izaberi vreme",
    rentalDeliverySummary: "Najam €{rental} + dostava/preuzimanje €{fees}",
    deliveryCollectionFree: "Dostava i preuzimanje uključeni besplatno",
  },
  uk: {
    serviceQuestion: "Як ви хочете отримати скутер?",
    officePickup: "Отримання в офісі",
    hotelDelivery: "Доставка до готелю",
    airportDelivery: "Доставка в аеропорт",
    selected: "Вибрано: {method}",
    change: "Змінити",
    chooseTownArea: "Оберіть місто або район",
    free: "Безкоштовно",
    eachWay: "€{fee} в один бік",
    hotelAirbnbDelivery: "Доставка до готелю / Airbnb",
    chooseDeliveryArea: "Оберіть зону доставки",
    deliveryAreaInstruction: "Оберіть місто та перегляньте вартість доставки в один бік.",
    townArea: "Місто / Район",
    deliveryFeeEachWay: "Вартість доставки · в один бік",
    liveDeliveryAvailability: "Актуальна доступність доставки",
    selectDeliveryTime: "Оберіть час доставки",
    deliveryCollectionSameTime: "Один і той самий час резервується для доставки {pickupDate} та забору {dropoffDate}.",
    airportDeliveryTimeNote: "Оберіть час доставки в аеропорт на {pickupDate}. Повернення в офіс залишається о {returnTime}.",
    available: "Доступно",
    unavailable: "Недоступно",
    checkingDeliveryCollectionTimes: "Перевіряємо актуальні години доставки та забору…",
    deliveryTimesError: "Не вдалося завантажити часи доставки. Спробуйте ще раз.",
    tryAgain: "Спробувати ще раз",
    scooterAvailable: "Доступний {count} скутер",
    scootersAvailable: "Доступно скутерів: {count}",
    chooseGreenTime: "Оберіть зелений час",
    confirmTime: "Підтвердити час",
    hotelDeliveryArea: "Доставка до готелю · {area}",
    selectHotelTitle: "Оберіть свій готель",
    hotelSearchInstruction: "Знайдіть готель у Google, підтвердьте точну адресу та додайте номер кімнати.",
    searchHotelName: "Пошук назви готелю",
    hotelPlaceholder: "Почніть вводити готель у {area}",
    bestMatches: "Найкращі збіги",
    hotelsNearby: "Готелі поруч",
    searching: "Пошук…",
    results: "Результатів: {count}",
    loadingHotels: "Завантаження готелів у {area}…",
    noHotelsFound: "У районі {area} не знайдено відповідних готелів. Спробуйте іншу назву або змініть зону доставки.",
    selectedHotel: "Вибраний готель",
    googleReviews: "Відгуків Google: {count}",
    hotelPhoto: "Фото {number} готелю {hotel}",
    openHotelPhoto: "Відкрити фото {number} готелю {hotel}",
    view: "Переглянути",
    noPhoto: "Немає фото",
    roomOptional: "Номер кімнати · необов’язково",
    roomExample: "Приклад: 214",
    verifiedGoogleMaps: "Переглянути підтверджене місце в Google Maps",
    selectHotelResultHelp: "Оберіть готель, щоб перевірити адресу та фото.",
    googleMapsInfo: "Інформація про готель надана Google Maps",
    selectHotel: "Обрати готель",
    hotelPhotoViewer: "Перегляд фото готелю",
    closePhoto: "Закрити фото",
    zoomOut: "Зменшити",
    zoomIn: "Збільшити",
    airbnbPrivateAddress: "Airbnb / приватна адреса · {area}",
    airbnbPrivateAddressShort: "Airbnb / приватна адреса",
    confirmDeliveryAddress: "Підтвердьте адресу доставки",
    findAddressGoogle: "Знайдіть повну адресу в Google Maps *",
    addressPlaceholder: "Вулиця та номер у {area}",
    addressSearchUnavailable: "Пошук адрес тимчасово недоступний.",
    addressOutsideArea: "Схоже, ця адреса не знаходиться в районі {area}. Оберіть адресу в межах вибраної зони доставки.",
    addressLoadFailed: "Не вдалося завантажити цю адресу. Оберіть інший результат.",
    streetName: "Назва вулиці *",
    streetHouseNumber: "Вулиця / номер будинку *",
    blockOptional: "Номер блоку · необов’язково",
    buildingOptional: "Назва будівлі · необов’язково",
    floorOptional: "Поверх · необов’язково",
    doorOptional: "Номер дверей · необов’язково",
    postalCode: "Поштовий індекс *",
    townAreaRequired: "Місто / район *",
    addressWarning: "Уважно перевірте повну адресу перед підтвердженням. Вона має бути в межах вибраної зони доставки. Неправильні, неповні або позазонні дані можуть унеможливити доставку та призвести до того, що оплата бронювання не повертатиметься.",
    requiredFieldsGoogle: "* Обов’язкові поля · Спочатку оберіть адресу Google",
    selectAddress: "Обрати адресу",
    blockToken: "Блок {value}",
    floorToken: "Поверх {value}",
    doorToken: "Двері {value}",
    deliveryDatesNotice: "Дати доставки: 1 лист.–31 бер. Для інших дат оберіть Отримання в офісі.",
    scrollMonths: "Прокручувати місяці",
    winterOfficeNotice: "Зимове отримання та повернення в офісі: ранок 09:30–11:00 · вечір 18:00–20:00. З 11:30–17:30 наша команда виконує доставки до готелів і Airbnb. Доставка в один бік безкоштовна в Magaluf, Palmanova та Torrenova.",
    deliveryLocation: "Місце доставки",
    airportLocationFee: "Аеропорт Пальма-де-Майорка · €{fee}",
    howReturnScooter: "Як ви повернете скутер?",
    returnOfficeFree: "Повернути в офіс · Безкоштовно",
    hotelAirbnbCollection: "Забір з готелю/Airbnb",
    officeReturnTime: "Час повернення в офіс",
    airportCollectionUnavailable: "Забір в аеропорту недоступний. Поверніть скутер у наш офіс або замовте забір з місця проживання.",
    selectDeliveryArea: "Обрати зону доставки",
    selectCollectionArea: "Обрати зону забору",
    hotel: "Готель",
    airbnbAddressOption: "Airbnb / Адреса",
    roomLabel: "Кімната: {room}",
    edit: "Редагувати",
    deliveryCollection: "Доставка · забір",
    selectLiveTime: "Обрати доступний час",
    chooseTime: "Обрати час",
    rentalDeliverySummary: "Оренда €{rental} + доставка/забір €{fees}",
    deliveryCollectionFree: "Доставка та забір включені безкоштовно",
  },
};

(
  Object.keys(EXTRA_I18N) as Locale[]
).forEach((supportedLocale) => {
  I18N[supportedLocale] = copy({
    ...(supportedLocale === "cs" ? CS_BASE_COPY : {}),
    ...(I18N[supportedLocale] || {}),
    ...EXTRA_I18N[supportedLocale],
  });
});

const DEFAULT_PICKUP_LOCATION = "NEXA Rentals, Magaluf";
const KYMCO_SKY_TOWN_PRICE_INCREASE = 10;
const AIRPORT_DELIVERY_FEE = 29;

const DELIVERY_AREAS: DeliveryArea[] = [
  { id: "magaluf", name: "Magaluf", fee: 0, slotMinutes: 10 },
  { id: "palmanova", name: "Palmanova", fee: 0, slotMinutes: 10 },
  { id: "torrenova", name: "Torrenova", fee: 0, slotMinutes: 10 },
  { id: "cala-vinyes", name: "Cala Vinyes", fee: 5, slotMinutes: 10 },
  { id: "son-caliu", name: "Son Caliu", fee: 5, slotMinutes: 10 },
  { id: "el-toro", name: "El Toro", fee: 7, slotMinutes: 10 },
  { id: "portals-nous", name: "Portals Nous", fee: 7, slotMinutes: 10 },
  {
    id: "costa-den-blanes",
    name: "Costa d'en Blanes",
    fee: 7,
    slotMinutes: 10,
  },
  { id: "illetes", name: "Illetes", fee: 7, slotMinutes: 10 },
  {
    id: "sol-de-mallorca",
    name: "Sol de Mallorca",
    fee: 7,
    slotMinutes: 10,
  },
  { id: "portals-vells", name: "Portals Vells", fee: 7, slotMinutes: 10 },
  {
    id: "costa-de-la-calma",
    name: "Costa de la Calma",
    fee: 9,
    slotMinutes: 10,
  },
  { id: "peguera", name: "Peguera", fee: 9, slotMinutes: 10 },
  { id: "cala-major", name: "Cala Major", fee: 9, slotMinutes: 10 },
  { id: "santa-ponsa", name: "Santa Ponsa", fee: 10, slotMinutes: 10 },
  { id: "bendinat", name: "Bendinat", fee: 10, slotMinutes: 10 },
  { id: "palma", name: "Palma", fee: 10, slotMinutes: 30 },
];

const PLAN_ATTENTION_ACTIVE_MS = 3000;
const PLAN_ATTENTION_REST_MS = 3000;
const PLAN_ATTENTION_RESTART_DELAY_MS = 20;

const DELIVERY_AREA_POSTCODES: Record<string, string> = {
  magaluf: "07181",
  palmanova: "07181",
  torrenova: "07181",
  "cala-vinyes": "07181",
  "son-caliu": "07181",
  "el-toro": "07180",
  "portals-nous": "07181",
  "costa-den-blanes": "07181",
  illetes: "07181",
  "sol-de-mallorca": "07181",
  "portals-vells": "07181",
  "costa-de-la-calma": "07183",
  peguera: "07160",
  "cala-major": "07015",
  "santa-ponsa": "07180",
  bendinat: "07181",
  palma: "07001",
};

const HOTEL_AREA_LOCALITIES: Record<string, string[]> = {
  magaluf: ["Magaluf", "Torrenova"],
  palmanova: ["Palmanova", "Palma Nova"],
  torrenova: ["Torrenova", "Magaluf"],
  "cala-vinyes": ["Cala Vinyes", "Cala Vinyas"],
  "son-caliu": ["Son Caliu"],
  "el-toro": ["El Toro"],
  "portals-nous": ["Portals Nous"],
  "costa-den-blanes": ["Costa d'en Blanes", "Costa den Blanes"],
  illetes: ["Illetes", "Ses Illetes"],
  "sol-de-mallorca": ["Sol de Mallorca"],
  "portals-vells": ["Portals Vells", "Cala Portals Vells"],
  "costa-de-la-calma": ["Costa de la Calma"],
  peguera: ["Peguera", "Paguera"],
  "cala-major": ["Cala Major", "Cala Mayor"],
  "santa-ponsa": ["Santa Ponsa", "Santa Ponça"],
  bendinat: ["Bendinat"],
  palma: ["Palma", "Platja de Palma", "Playa de Palma"],
};

let googlePlacesLibraryPromise: Promise<GooglePlacesLibrary> | null = null;

const GOOGLE_PLACES_READY_TIMEOUT_MS = 20000;
const GOOGLE_PLACES_POLL_INTERVAL_MS = 100;

function getGoogleMapsImporter() {
  const googleWindow = window as typeof window & {
    google?: {
      maps?: {
        importLibrary?: (name: string) => Promise<unknown>;
      };
    };
  };

  return googleWindow.google?.maps?.importLibrary;
}

async function waitForGoogleMapsImporter() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < GOOGLE_PLACES_READY_TIMEOUT_MS) {
    const importLibrary = getGoogleMapsImporter();

    if (importLibrary) return importLibrary;

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, GOOGLE_PLACES_POLL_INTERVAL_MS);
    });
  }

  throw new Error("GOOGLE_PLACES_READY_TIMEOUT");
}

function loadGooglePlacesLibrary() {
  if (googlePlacesLibraryPromise) return googlePlacesLibraryPromise;

  googlePlacesLibraryPromise = (async () => {
    if (typeof window === "undefined") {
      throw new Error("GOOGLE_PLACES_BROWSER_ONLY");
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_KEY_MISSING");
    }

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-nexa-google-maps="true"]'
    );

    if (script?.dataset.nexaGoogleMapsState === "error") {
      script.remove();
      script = null;
    }

    if (!script && !getGoogleMapsImporter()) {
      script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        apiKey
      )}&loading=async&v=weekly&libraries=places`;
      script.async = true;
      script.defer = true;
      script.dataset.nexaGoogleMaps = "true";
      script.dataset.nexaGoogleMapsState = "loading";
      script.addEventListener(
        "load",
        () => {
          if (script) script.dataset.nexaGoogleMapsState = "loaded";
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        () => {
          if (script) script.dataset.nexaGoogleMapsState = "error";
        },
        { once: true }
      );
      document.head.appendChild(script);
    }

    const importLibrary = await waitForGoogleMapsImporter();
    return (await importLibrary("places")) as GooglePlacesLibrary;
  })().catch((error) => {
    googlePlacesLibraryPromise = null;
    throw error;
  });

  return googlePlacesLibraryPromise;
}

const SEASONAL_PRICING: SeasonalPricing[] = [
  {
    seasonName: "Winter",
    halfDayPrice: 36,
    halfDayOldPrice: 45,
    fullDayOldPrice: 55,
    fullDayPricing: { 1: 39, 2: 38, 3: 37, 4: 36, 5: 35, 6: 34 },
  },
  {
    seasonName: "Spring",
    halfDayPrice: 36,
    halfDayOldPrice: 45,
    fullDayOldPrice: 55,
    fullDayPricing: { 1: 45, 2: 43, 3: 42, 4: 41, 5: 40, 6: 39 },
  },
  {
    seasonName: "Summer",
    halfDayPrice: 39,
    halfDayOldPrice: 45,
    fullDayOldPrice: 55,
    fullDayPricing: { 1: 49, 2: 47, 3: 46, 4: 45, 5: 44, 6: 43 },
  },
  {
    seasonName: "Autumn",
    halfDayPrice: 36,
    halfDayOldPrice: 45,
    fullDayOldPrice: 55,
    fullDayPricing: { 1: 45, 2: 43, 3: 42, 4: 41, 5: 40, 6: 39 },
  },
];

function normalizeLocale(value: string | undefined): Locale {
  if (
    value === "es" ||
    value === "de" ||
    value === "fr" ||
    value === "it" ||
    value === "nl" ||
    value === "pl" ||
    value === "da" ||
    value === "no" ||
    value === "pt" ||
    value === "sv" ||
    value === "cs" ||
    value === "sr" ||
    value === "uk"
  ) {
    return value;
  }

  return "en";
}

function getSeasonalPricing(date: Date): SeasonalPricing {
  const month = date.getMonth() + 1;

  if (month === 12 || month === 1 || month === 2) return SEASONAL_PRICING[0];
  if (month >= 3 && month <= 5) return SEASONAL_PRICING[1];
  if (month >= 6 && month <= 8) return SEASONAL_PRICING[2];

  return SEASONAL_PRICING[3];
}

function isKymcoSkyTown(vehicleName: string) {
  const normalizedVehicleName = vehicleName.toLowerCase().replace(/[\s-]+/g, "");

  return (
    normalizedVehicleName.includes("kymco") ||
    normalizedVehicleName.includes("kimco") ||
    normalizedVehicleName.includes("skytown")
  );
}

function getVehiclePricing(
  pricing: SeasonalPricing,
  vehicleName: string
): SeasonalPricing {
  if (!isKymcoSkyTown(vehicleName)) return pricing;

  return {
    ...pricing,
    halfDayPrice: pricing.halfDayPrice + KYMCO_SKY_TOWN_PRICE_INCREASE,
    halfDayOldPrice: pricing.halfDayOldPrice + KYMCO_SKY_TOWN_PRICE_INCREASE,
    fullDayOldPrice: pricing.fullDayOldPrice + KYMCO_SKY_TOWN_PRICE_INCREASE,
    fullDayPricing: Object.fromEntries(
      Object.entries(pricing.fullDayPricing).map(([days, price]) => [
        days,
        price + KYMCO_SKY_TOWN_PRICE_INCREASE,
      ])
    ) as Record<number, number>,
  };
}

function getRate(
  days: number,
  pricing: SeasonalPricing,
  vehicleName: string
) {
  const normalizedDays = Math.max(days, 1);

  if (normalizedDays <= 6) {
    return pricing.fullDayPricing[normalizedDays];
  }

  if (normalizedDays <= 14) {
    return pricing.fullDayPricing[6];
  }

  const vehiclePriceIncrease = isKymcoSkyTown(vehicleName)
    ? KYMCO_SKY_TOWN_PRICE_INCREASE
    : 0;

  if (normalizedDays <= 19) return 38 + vehiclePriceIncrease;
  if (normalizedDays <= 29) return 35 + vehiclePriceIncrease;
  if (normalizedDays === 30) return 30 + vehiclePriceIncrease;

  return 25 + vehiclePriceIncrease;
}

function getSameDayHourlyRate(
  pickupTime: string,
  returnTime: string,
  fallbackPrice: number
) {
  const pickupMinutes = timeToMinutes(pickupTime);
  const returnMinutes = timeToMinutes(returnTime);
  const diffMinutes = Math.max(30, returnMinutes - pickupMinutes);
  const roundedHours = Math.max(1, Math.ceil(diffMinutes / 60));

  if (roundedHours <= 1) return 12;
  if (roundedHours === 2) return 22;
  if (roundedHours === 3) return 30;
  if (roundedHours === 4) return 36;

  return fallbackPrice;
}

function getSameDayRoundedHours(pickupTime: string, returnTime: string) {
  const pickupMinutes = timeToMinutes(pickupTime);
  const returnMinutes = timeToMinutes(returnTime);
  const diffMinutes = Math.max(30, returnMinutes - pickupMinutes);
  return Math.max(1, Math.ceil(diffMinutes / 60));
}

function getLocalizedCheckoutBasePath(
  checkoutBasePath: string | undefined,
  locale: Locale
) {
  if (checkoutBasePath) return checkoutBasePath;
  return `/${locale}/checkout`;
}

function startOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, amount: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + amount);
  return clone;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function dayDiff(from: Date, to: Date) {
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return Math.round((end - start) / 86400000);
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fmtDate(date: Date | undefined, locale: Locale, fallback: string) {
  if (!date) return fallback;

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getDaysInMonth(month: Date) {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
}

function buildMonthDays(month: Date) {
  const daysInMonth = getDaysInMonth(month);
  const first = startOfMonth(month);
  const mondayOffset = (first.getDay() + 6) % 7;
  const leadingEmptyCells = Array.from({ length: mondayOffset }).map(
    () => null
  );
  const monthDays = Array.from({ length: daysInMonth }).map(
    (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)
  );

  return [...leadingEmptyCells, ...monthDays];
}

function getLocalizedWeekdays(locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    weekday: "short",
  });
  const monday = new Date(2026, 0, 5);

  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(monday, index);
    return formatter.format(day).replace(".", "").slice(0, 3);
  });
}

function getWinterSeasonKey(date: Date) {
  const month = date.getMonth();

  if (month >= 10) return date.getFullYear();
  if (month <= 2) return date.getFullYear() - 1;

  return null;
}

function isWinterDeliveryDate(date: Date) {
  return getWinterSeasonKey(date) !== null;
}

function getNextDeliveryDate(date: Date) {
  const today = startOfDay(date);

  if (isWinterDeliveryDate(today)) return today;

  return new Date(today.getFullYear(), 10, 1);
}

function buildTimeOptions(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  stepMinutes = 30
) {
  const result: string[] = [];
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  for (let minutes = start; minutes <= end; minutes += stepMinutes) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    result.push(`${hour}:${minute}`);
  }

  return result;
}

function buildOfficeTimeOptions(date: Date) {
  if (isWinterDeliveryDate(date)) {
    return [
      ...buildTimeOptions(9, 30, 11, 0, 30),
      ...buildTimeOptions(18, 0, 20, 0, 30),
    ];
  }

  return buildTimeOptions(9, 30, 20, 0, 30);
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function filterTimesForDate(options: string[], date: Date | undefined) {
  if (!date) return options;

  const today = startOfDay(new Date());
  const selected = startOfDay(date);

  if (selected.getTime() !== today.getTime()) return options;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const minimumMinutes = currentMinutes + 60;

  return options.filter((option) => timeToMinutes(option) >= minimumMinutes);
}

function replaceTokens(text: string, tokens: Record<string, string | number>) {
  return Object.entries(tokens).reduce(
    (current, [key, value]) =>
      current.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    text
  );
}

function getVehicleConfig(vehicleName: string) {
  const lower = vehicleName.toLowerCase();
  const quantityOptions = Array.from({ length: 15 }, (_, index) => index + 1);

  if (isKymcoSkyTown(vehicleName)) {
    return {
      checkoutVehicleId: "kymco-sky-town-125",
      availabilityFleetGroup: "kymco_sky_town_125" as AvailabilityFleetGroup,
      quantityOptions,
    };
  }

  if (lower.includes("sym")) {
    return {
      checkoutVehicleId: "sym-symphony-125",
      availabilityFleetGroup: "sym_symphony_125" as AvailabilityFleetGroup,
      quantityOptions,
    };
  }

  return {
    checkoutVehicleId: "piaggio-liberty-125",
    availabilityFleetGroup: "piaggio_liberty_125" as AvailabilityFleetGroup,
    quantityOptions,
  };
}

function getAddressComponent(
  components: GoogleAddressComponent[] | undefined,
  type: string
) {
  return (
    components?.find((component) => component.types?.includes(type))?.longText ||
    ""
  );
}

function normalizePlaceText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isPlaceInsideDeliveryArea(
  formattedAddress: string,
  components: GoogleAddressComponent[] | undefined,
  area: DeliveryArea
) {
  const normalizedAddress = normalizePlaceText(formattedAddress);
  const normalizedArea = normalizePlaceText(area.name);
  const selectedPostcode = DELIVERY_AREA_POSTCODES[area.id];
  const placePostcode = getAddressComponent(components, "postal_code");

  return (
    normalizedAddress.includes(normalizedArea) ||
    (!!selectedPostcode && placePostcode === selectedPostcode)
  );
}

function getHotelAreaLocalities(area: DeliveryArea) {
  return HOTEL_AREA_LOCALITIES[area.id] || [area.name];
}

function isHotelInsideSelectedArea(
  place: GooglePlaceResult,
  area: DeliveryArea
) {
  const addressParts = [place.formattedAddress || ""];

  (place.addressComponents || []).forEach((component) => {
    if (
      component.types?.some((type) =>
        [
          "locality",
          "postal_town",
          "sublocality",
          "sublocality_level_1",
          "neighborhood",
        ].includes(type)
      )
    ) {
      addressParts.push(component.longText || "", component.shortText || "");
    }
  });

  const normalizedAddress = ` ${normalizePlaceText(addressParts.join(" "))} `;

  return getHotelAreaLocalities(area).some((locality) => {
    const normalizedLocality = normalizePlaceText(locality);
    return normalizedAddress.includes(` ${normalizedLocality} `);
  });
}

function googlePlaceToHotel(place: GooglePlaceResult): HotelSelection | null {
  const name = place.displayName?.trim();
  const address = place.formattedAddress?.trim();

  if (!name || !address) return null;

  return {
    placeId: place.id || "",
    name,
    address,
    mapsUrl: place.googleMapsURI || "",
    photos: (place.photos || [])
      .slice(0, 3)
      .map((photo) => photo.getURI?.({ maxWidth: 900, maxHeight: 600 }) || "")
      .filter(Boolean),
    rating: place.rating,
    ratingCount: place.userRatingCount,
  };
}

function buildAirbnbAddress(
  details: AirbnbAddressDetails,
  tt: BookingPanelCopy
) {
  return [
    `${details.streetName} ${details.streetNumber}`.trim(),
    details.blockNumber
      ? replaceTokens(tt.blockToken, { value: details.blockNumber })
      : "",
    details.buildingName,
    details.floor
      ? replaceTokens(tt.floorToken, { value: details.floor })
      : "",
    details.doorNumber
      ? replaceTokens(tt.doorToken, { value: details.doorNumber })
      : "",
    `${details.postalCode} ${details.city}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}

function emptyAirbnbAddress(area: DeliveryArea): AirbnbAddressDetails {
  return {
    placeId: "",
    formattedAddress: "",
    streetName: "",
    streetNumber: "",
    blockNumber: "",
    buildingName: "",
    floor: "",
    doorNumber: "",
    postalCode: DELIVERY_AREA_POSTCODES[area.id] || "",
    city: area.name,
    mapsUrl: "",
  };
}

function FieldButton({
  label,
  value,
  disabled,
  onClick,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-[58px] rounded-[15px] border border-black/10 bg-white px-3 py-2 text-left transition hover:border-black/26 hover:bg-black/[0.025] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/[0.025] disabled:text-black/35"
    >
      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-black/42">
        {label}
      </div>
      <div className="mt-1 text-[12px] font-black text-black">{value}</div>
    </button>
  );
}

function TimeDropdown({
  label,
  value,
  options,
  open,
  disabled,
  onToggle,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  disabled: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="min-h-[58px] w-full rounded-[15px] border border-black/10 bg-white px-3 py-2 text-left transition hover:border-black/26 hover:bg-black/[0.025] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/[0.025] disabled:text-black/35"
      >
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-black/42">
          {label}
        </div>
        <div className="mt-1 text-[12px] font-black text-black">{value}</div>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[64px] z-[60] max-h-[210px] overflow-auto rounded-[18px] border border-black/10 bg-white p-2 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={[
                "mb-1 flex w-full items-center justify-between rounded-[13px] px-3 py-2 text-left text-[12px] font-black transition last:mb-0",
                option === value
                  ? "bg-black text-white"
                  : "bg-black/[0.035] text-black hover:bg-black/[0.08]",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ServiceMethodButton({
  selected,
  title,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "service-method-button group relative flex min-h-[108px] w-full items-center overflow-hidden rounded-[8px] border border-transparent px-5 py-4 text-left text-black transition-[color,box-shadow] duration-300",
        selected ? "service-method-selected" : "",
      ].join(" ")}
    >
      <span
        className="service-method-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0"
        aria-hidden="true"
      />

      <span
        className="service-method-icon relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] border border-black/10 bg-black/[0.035] transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10"
        aria-hidden="true"
      >
        {icon}
      </span>

      <span className="relative min-w-0 flex-1 pl-4">
        <span className="block text-[15px] font-black uppercase leading-[1.16] tracking-[0.06em]">
          {title}
        </span>
      </span>

      <span
        className="service-method-arrow relative ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-current/[0.14] text-[20px] font-medium transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      >
        →
      </span>
    </button>
  );
}

function DeliveryAreaPicker({
  value,
  attention,
  onChange,
  tt,
}: {
  value: string;
  attention: boolean;
  onChange: (value: string) => void;
  tt: BookingPanelCopy;
}) {
  const [open, setOpen] = useState(false);
  const [hasBeenPressed, setHasBeenPressed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const selectedArea = DELIVERY_AREAS.find((area) => area.id === value) || null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <div className="relative mt-1.5">
      <button
        type="button"
        onClick={() => {
          setHasBeenPressed(true);
          setOpen(true);
        }}
        className={[
          "delivery-area-trigger group relative flex h-12 w-full items-center justify-between gap-3 overflow-hidden rounded-[7px] border border-transparent px-3 text-left text-[12px] font-black outline-none transition-[color,box-shadow,transform] duration-300",
          attention && !hasBeenPressed ? "delivery-area-attention" : "",
          open ? "delivery-area-open" : "",
        ].join(" ")}
        style={{
          color: "#ffffff",
          background:
            "linear-gradient(#050505, #050505) padding-box, linear-gradient(105deg, #7c3aed, #f97316, #22c55e, #2563eb, #7c3aed) border-box",
          backgroundSize: "100% 100%, 300% 300%",
          borderColor: "transparent",
          opacity: 1,
          WebkitAppearance: "none",
          appearance: "none",
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className="pointer-events-none absolute inset-[1px] z-0 rounded-[6px] bg-black"
          style={{ backgroundColor: "#000000" }}
          aria-hidden="true"
        />

        <span
          className="delivery-area-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
          aria-hidden="true"
        />

        <span className="relative z-20 text-white">
          {selectedArea?.name || tt.chooseTownArea}
        </span>

        <span className="relative z-20 flex items-center gap-2 text-white">
          {selectedArea ? (
            <span className="delivery-area-fee rounded-[4px] bg-white/[0.12] px-2 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-white/80 transition-colors duration-300">
              {selectedArea.fee === 0
                ? tt.free
                : replaceTokens(tt.eachWay, { fee: selectedArea.fee })}
            </span>
          ) : null}
          <span
            className={[
              "text-[11px] opacity-55 transition-transform duration-200",
              open ? "rotate-180" : "rotate-0",
            ].join(" ")}
            aria-hidden="true"
          >
            ▾
          </span>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="nexa-area-dialog fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none overflow-hidden border-0 bg-transparent p-3 text-black"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div
          className="flex w-[min(680px,calc(100vw-24px))] flex-col overflow-hidden rounded-[18px] border border-black/10 bg-white text-black shadow-[0_32px_110px_rgba(0,0,0,0.38)]"
          style={{ maxHeight: "min(680px, calc(100svh - 24px))" }}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/42">
                {tt.hotelAirbnbDelivery}
              </div>
              <div className="mt-1 text-[22px] font-black tracking-[-0.04em]">
                {tt.chooseDeliveryArea}
              </div>
              <div className="mt-1 text-[11px] font-bold text-black/48">
                {tt.deliveryAreaInstruction}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-black/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-black/62 transition hover:bg-black hover:text-white active:scale-95"
            >
              {tt.close}
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-black/10 bg-black px-4 py-3 text-[9px] font-black uppercase tracking-[0.11em] text-white">
            <span>{tt.townArea}</span>
            <span className="text-right">{tt.deliveryFeeEachWay}</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2" role="listbox">
            {DELIVERY_AREAS.map((area) => {
              const selected = area.id === value;

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    onChange(area.id);
                    setOpen(false);
                  }}
                  className={[
                    "group mb-1 grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[6px] border border-transparent px-4 py-3 text-left transition-all duration-200 last:mb-0 hover:-translate-y-px active:translate-y-0 active:scale-[0.985]",
                    selected
                      ? "bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]"
                      : "bg-black/[0.025] text-black hover:bg-black hover:text-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]",
                  ].join(" ")}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="truncate text-[12px] font-black">
                    {area.name}
                  </span>
                  <span
                    className={[
                      "text-right text-[11px] font-black",
                      selected
                        ? "text-white"
                        : "text-black/62 group-hover:text-white",
                    ].join(" ")}
                  >
                    {area.fee === 0 ? tt.free : `€${area.fee}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </dialog>
    </div>
  );
}

function DeliveryTimeModal({
  open,
  pickupDate,
  dropoffDate,
  area,
  vehicleId,
  vehicleName,
  fleetGroup,
  quantity,
  plan,
  value,
  collectionRequired,
  rentalDropoffTime,
  locale,
  tt,
  onClose,
  onConfirm,
}: {
  open: boolean;
  pickupDate: Date;
  dropoffDate: Date;
  area: DeliveryArea | null;
  vehicleId: string;
  vehicleName: string;
  fleetGroup: AvailabilityFleetGroup;
  quantity: number;
  plan: RentalPlan;
  value: string;
  collectionRequired: boolean;
  rentalDropoffTime: string;
  locale: Locale;
  tt: BookingPanelCopy;
  onClose: () => void;
  onConfirm: (value: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [slots, setSlots] = useState<DeliverySlotAvailability[]>([]);
  const [selectedTime, setSelectedTime] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
      return;
    }

    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      mode: "delivery_slots",
      vehicleId,
      vehicleName,
      fleetGroup,
      quantity: String(quantity),
      plan: String(plan || "full"),
      from: toISODate(pickupDate),
      to: toISODate(dropoffDate),
      pickupTime: value || "11:30",
      dropoffTime: rentalDropoffTime || value || "11:30",
      collectionRequired: collectionRequired ? "true" : "false",
      rentalDropoffTime: rentalDropoffTime || value || "11:30",
      slotMinutes: String(area?.slotMinutes || 30),
    });

    void fetch(`/api/admin/availability?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as DeliverySlotsResponse;
        if (!response.ok || !data.ok || !Array.isArray(data.slots)) {
          throw new Error(data.message || "Times could not be loaded.");
        }

        setSlots(data.slots);
        const currentStillAvailable = data.slots.some(
          (slot) => slot.time === value && slot.available
        );
        setSelectedTime(currentStillAvailable ? value : "");
      })
      .catch((fetchError) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }
        setSlots([]);
        setSelectedTime("");
        setError(tt.deliveryTimesError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    open,
    pickupDate,
    dropoffDate,
    area,
    vehicleId,
    vehicleName,
    fleetGroup,
    quantity,
    plan,
    value,
    collectionRequired,
    rentalDropoffTime,
    refreshKey,
    tt.deliveryTimesError,
  ]);

  const selectedSlot = slots.find(
    (slot) => slot.time === selectedTime && slot.available
  );

  return (
    <dialog
      ref={dialogRef}
      className="nexa-delivery-time-dialog fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none overflow-hidden border-0 bg-transparent p-3 text-black"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-[min(760px,calc(100vw-24px))] flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_34px_120px_rgba(0,0,0,0.42)]"
        style={{ maxHeight: "min(720px, calc(100svh - 24px))" }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45">
              {tt.liveDeliveryAvailability}
            </div>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.025em]">
              {tt.selectDeliveryTime}
            </h2>
            <p className="mt-1 text-[11px] font-normal leading-5 text-black/55">
              {collectionRequired
                ? replaceTokens(tt.deliveryCollectionSameTime, {
                    pickupDate: fmtDate(pickupDate, locale, ""),
                    dropoffDate: fmtDate(dropoffDate, locale, ""),
                  })
                : replaceTokens(tt.airportDeliveryTimeNote, {
                    pickupDate: fmtDate(pickupDate, locale, ""),
                    returnTime: rentalDropoffTime,
                  })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[7px] border border-black/10 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] transition hover:bg-black hover:text-white active:scale-95"
          >
            {tt.close}
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-4 border-b border-black/10 bg-black/[0.025] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.08em]">
          <span className="inline-flex items-center gap-1.5 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> {tt.available}
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-700">
            <span className="h-2 w-2 rounded-full bg-red-500" /> {tt.unavailable}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-[12px] font-medium text-black/50">
              <span className="inline-flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/15 border-t-black" />
                {tt.checkingDeliveryCollectionTimes}
              </span>
            </div>
          ) : error ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
              <p className="text-[12px] font-medium text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
                className="rounded-[7px] bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#222] active:scale-95"
              >
                {tt.tryAgain}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot) => {
                const selected = selectedTime === slot.time && slot.available;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={[
                      "relative min-h-[52px] rounded-[7px] border px-2 py-3 text-[12px] font-semibold transition",
                      selected
                        ? "border-emerald-700 bg-emerald-600 text-white shadow-[0_10px_24px_rgba(5,150,105,0.25)]"
                        : slot.available
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:-translate-y-px hover:bg-emerald-100"
                          : "cursor-not-allowed border-red-200 bg-red-50 text-red-500 opacity-80",
                    ].join(" ")}
                    aria-label={`${slot.time} ${slot.available ? tt.available : tt.unavailable}`}
                  >
                    <span
                      className={[
                        "absolute left-2 top-2 h-1.5 w-1.5 rounded-full",
                        selected
                          ? "bg-white"
                          : slot.available
                            ? "bg-emerald-500"
                            : "bg-red-500",
                      ].join(" ")}
                    />
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 bg-white px-5 py-3">
          <div className="text-[10px] font-normal text-black/48">
            {selectedSlot
              ? replaceTokens(
                  selectedSlot.availableCount === 1
                    ? tt.scooterAvailable
                    : tt.scootersAvailable,
                  { count: selectedSlot.availableCount }
                )
              : tt.chooseGreenTime}
          </div>
          <button
            type="button"
            disabled={!selectedSlot || loading}
            onClick={() => {
              if (selectedSlot) onConfirm(selectedSlot.time);
            }}
            className="rounded-[8px] bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#222] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/32"
          >
            {tt.confirmTime}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function HotelSelectionModal({
  open,
  area,
  locale,
  tt,
  initialSelection,
  initialRoom,
  onClose,
  onConfirm,
}: {
  open: boolean;
  area: DeliveryArea;
  locale: Locale;
  tt: BookingPanelCopy;
  initialSelection: HotelSelection | null;
  initialRoom: string;
  onClose: () => void;
  onConfirm: (hotel: HotelSelection, room: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HotelSelection[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelSelection | null>(null);
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchRetry, setSearchRetry] = useState(0);
  const [photoViewer, setPhotoViewer] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
      return;
    }

    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelectedHotel(initialSelection);
    setRoom(initialRoom);
    setQuery(initialSelection?.name || "");
    setSearchRetry(0);
    setPhotoViewer(null);
    setPhotoZoom(1);
  }, [open, area.id, initialSelection, initialRoom]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let retryTimeout: number | null = null;
    let shouldKeepLoading = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);

      try {
        const library = await loadGooglePlacesLibrary();
        const textQuery = query.trim()
          ? `${query.trim()} hotel in ${area.name}, Mallorca, Spain`
          : `hotels in ${area.name}, Mallorca, Spain`;
        const response = await library.Place.searchByText({
          textQuery,
          fields: [
            "id",
            "displayName",
            "formattedAddress",
            "addressComponents",
            "googleMapsURI",
            "photos",
            "rating",
            "userRatingCount",
          ],
          includedType: "hotel",
          useStrictTypeFiltering: false,
          maxResultCount: 15,
          language: locale,
          region: "ES",
        });

        if (cancelled) return;

        const hotels = response.places
          .filter((place) => isHotelInsideSelectedArea(place, area))
          .map(googlePlaceToHotel)
          .filter((hotel): hotel is HotelSelection => !!hotel);
        setResults(hotels);
      } catch {
        if (cancelled) return;
        setResults([]);
        shouldKeepLoading = true;
        retryTimeout = window.setTimeout(() => {
          if (!cancelled) setSearchRetry((current) => current + 1);
        }, 900);
      } finally {
        if (!cancelled && !shouldKeepLoading) setLoading(false);
      }
    }, query.trim() ? 320 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (retryTimeout !== null) window.clearTimeout(retryTimeout);
    };
  }, [open, area.id, area.name, locale, query, searchRetry]);

  return (
    <dialog
      ref={dialogRef}
      className="nexa-accommodation-dialog fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none overflow-hidden border-0 bg-transparent p-3 text-black"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="nexa-hotel-modal-content flex w-[min(920px,calc(100vw-24px))] flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_34px_120px_rgba(0,0,0,0.42)]"
        style={{
          maxHeight: "min(760px, calc(100svh - 24px))",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/45">
              {replaceTokens(tt.hotelDeliveryArea, { area: area.name })}
            </div>
            <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.025em]">
              {tt.selectHotelTitle}
            </h2>
            <p className="mt-1 text-[11px] font-normal leading-5 text-black/55">
              {tt.hotelSearchInstruction}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[7px] border border-black/10 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] transition hover:bg-black hover:text-white active:scale-95"
          >
            {tt.close}
          </button>
        </div>

        <div className="shrink-0 border-b border-black/10 p-4">
          <label className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-black/50">
            {tt.searchHotelName}
          </label>
          <div className="relative mt-2">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/38"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedHotel(null);
              }}
              autoFocus
              placeholder={replaceTokens(tt.hotelPlaceholder, { area: area.name })}
              className="h-14 w-full rounded-[9px] border border-black/12 bg-black/[0.025] pl-12 pr-4 text-[14px] font-medium outline-none transition focus:border-black focus:bg-white focus:shadow-[0_10px_30px_rgba(0,0,0,0.09)]"
            />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-black/10 p-3 lg:border-b-0 lg:border-r">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/45">
                {query.trim() ? tt.bestMatches : tt.hotelsNearby}
              </span>
              <span className="text-[9px] font-medium text-black/42">
                {loading
                  ? tt.searching
                  : replaceTokens(tt.results, { count: results.length })}
              </span>
            </div>

            <div className="space-y-1.5">
              {loading && results.length === 0 ? (
                <div className="rounded-[9px] border border-black/8 bg-black/[0.025] p-4 text-[11px] font-medium leading-5 text-black/50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/15 border-t-black/70" />
                    {replaceTokens(tt.loadingHotels, { area: area.name })}
                  </span>
                </div>
              ) : null}
              {results.map((hotel) => {
                const selected = selectedHotel?.placeId === hotel.placeId;
                return (
                  <button
                    key={`${hotel.placeId}-${hotel.name}`}
                    type="button"
                    onClick={() => setSelectedHotel(hotel)}
                    className={[
                      "w-full rounded-[8px] border px-3 py-3 text-left transition active:scale-[0.985]",
                      selected
                        ? "border-black bg-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]"
                        : "border-black/8 bg-black/[0.025] text-black hover:border-black/20 hover:bg-black/[0.055]",
                    ].join(" ")}
                  >
                    <span className="block text-[12px] font-semibold leading-5">{hotel.name}</span>
                    <span
                      className={[
                        "mt-1 block text-[10px] font-normal leading-4",
                        selected ? "text-white/65" : "text-black/48",
                      ].join(" ")}
                    >
                      {hotel.address}
                    </span>
                  </button>
                );
              })}
              {!loading && results.length === 0 ? (
                <div className="rounded-[9px] border border-black/8 bg-black/[0.025] p-4 text-[11px] font-normal leading-5 text-black/50">
                  {replaceTokens(tt.noHotelsFound, { area: area.name })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="p-4">
            {selectedHotel ? (
              <>
                <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/45">
                  {tt.selectedHotel}
                </div>
                <div className="mt-1 text-[19px] font-semibold tracking-[-0.02em]">
                  {selectedHotel.name}
                </div>
                <div className="mt-1 text-[11px] font-normal leading-5 text-black/58">
                  {selectedHotel.address}
                </div>
                {selectedHotel.rating ? (
                  <div className="mt-2 text-[10px] font-semibold text-black/60">
                    ★ {selectedHotel.rating.toFixed(1)}
                    {selectedHotel.ratingCount
                      ? ` · ${replaceTokens(tt.googleReviews, {
                          count: selectedHotel.ratingCount,
                        })}`
                      : ""}
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => {
                    const photo = selectedHotel.photos[index];

                    return photo ? (
                      <button
                        key={photo}
                        type="button"
                        onClick={() => {
                          setPhotoZoom(1);
                          setPhotoViewer({
                            src: photo,
                            alt: replaceTokens(tt.hotelPhoto, {
                              hotel: selectedHotel.name,
                              number: index + 1,
                            }),
                          });
                        }}
                        className="group relative aspect-[4/3] w-full overflow-hidden rounded-[7px] bg-black/[0.04] text-left outline-none transition hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)] focus-visible:ring-2 focus-visible:ring-black"
                        aria-label={replaceTokens(tt.openHotelPhoto, {
                          hotel: selectedHotel.name,
                          number: index + 1,
                        })}
                      >
                        <img
                          src={photo}
                          alt={replaceTokens(tt.hotelPhoto, {
                            hotel: selectedHotel.name,
                            number: index + 1,
                          })}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
                        />
                        <span className="absolute bottom-2 right-2 rounded-[5px] bg-black/70 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.08em] text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                          {tt.view}
                        </span>
                      </button>
                    ) : (
                      <div
                        key={`hotel-photo-placeholder-${index}`}
                        className="flex aspect-[4/3] items-center justify-center rounded-[7px] bg-black/[0.04] text-[9px] font-medium text-black/30"
                      >
                        {tt.noPhoto}
                      </div>
                    );
                  })}
                </div>

                <label className="mt-4 block text-[9px] font-semibold uppercase tracking-[0.14em] text-black/50">
                  {tt.roomOptional}
                  <input
                    value={room}
                    onChange={(event) => setRoom(event.target.value)}
                    placeholder={tt.roomExample}
                    className="mt-2 h-11 w-full rounded-[8px] border border-black/12 bg-white px-3 text-[12px] font-medium normal-case tracking-normal outline-none transition focus:border-black"
                  />
                </label>

                {selectedHotel.mapsUrl ? (
                  <a
                    href={selectedHotel.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-[10px] font-semibold text-black underline underline-offset-4"
                  >
                    {tt.verifiedGoogleMaps}
                  </a>
                ) : null}
              </>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center text-center text-[12px] font-normal leading-5 text-black/45">
                {tt.selectHotelResultHelp}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-3">
          <div className="text-[9px] font-normal text-black/45">
            {tt.googleMapsInfo}
          </div>
          <button
            type="button"
            disabled={!selectedHotel}
            onClick={() => {
              if (selectedHotel) onConfirm(selectedHotel, room.trim());
            }}
            className="rounded-[8px] bg-black px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#222] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/32"
          >
            {tt.selectHotel}
          </button>
        </div>
      </div>

      {photoViewer ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/[0.88] p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={tt.hotelPhotoViewer}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPhotoViewer(null);
          }}
        >
          <div className="relative flex h-full w-full max-w-[1180px] flex-col items-center justify-center overflow-hidden">
            <button
              type="button"
              onClick={() => setPhotoViewer(null)}
              className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center rounded-[7px] border border-white/20 bg-black/[0.65] text-[24px] font-light leading-none text-white backdrop-blur-md transition hover:bg-white hover:text-black active:scale-95"
              aria-label={tt.closePhoto}
            >
              ×
            </button>

            <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-[8px] border border-white/[0.15] bg-black/70 p-2 text-white shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setPhotoZoom((current) => Math.max(1, current - 0.25))}
                disabled={photoZoom <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-[6px] text-[22px] font-light transition hover:bg-white/[0.15] disabled:opacity-35"
                aria-label={tt.zoomOut}
              >
                −
              </button>
              <span className="min-w-[54px] text-center text-[11px] font-medium">
                {Math.round(photoZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setPhotoZoom((current) => Math.min(3, current + 0.25))}
                disabled={photoZoom >= 3}
                className="flex h-10 w-10 items-center justify-center rounded-[6px] text-[22px] font-light transition hover:bg-white/[0.15] disabled:opacity-35"
                aria-label={tt.zoomIn}
              >
                +
              </button>
            </div>

            <div className="flex h-[calc(100%_-_64px)] w-full items-center justify-center overflow-auto pb-12 pt-12">
              <img
                src={photoViewer.src}
                alt={photoViewer.alt}
                className="max-h-full max-w-full select-none object-contain transition-transform duration-200"
                style={{ transform: `scale(${photoZoom})` }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

function AirbnbAddressModal({
  open,
  area,
  locale,
  tt,
  initialDetails,
  onClose,
  onConfirm,
}: {
  open: boolean;
  area: DeliveryArea;
  locale: Locale;
  tt: BookingPanelCopy;
  initialDetails: AirbnbAddressDetails | null;
  onClose: () => void;
  onConfirm: (details: AirbnbAddressDetails) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const sessionTokenRef = useRef<unknown>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);
  const [details, setDetails] = useState<AirbnbAddressDetails>(() =>
    emptyAirbnbAddress(area)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
      return;
    }

    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const nextDetails = initialDetails || emptyAirbnbAddress(area);
    setDetails(nextDetails);
    setSearchQuery(nextDetails.formattedAddress || "");
    setSuggestions([]);
    setError("");
    sessionTokenRef.current = null;
  }, [open, area.id, initialDetails]);

  useEffect(() => {
    if (!open || searchQuery.trim().length < 3 || details.placeId) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const library = await loadGooglePlacesLibrary();
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new library.AutocompleteSessionToken();
        }
        const response = await library.AutocompleteSuggestion.fetchAutocompleteSuggestions(
          {
            input: `${searchQuery.trim()}, ${area.name}, Mallorca, Spain`,
            includedRegionCodes: ["es"],
            language: locale,
            region: "ES",
            sessionToken: sessionTokenRef.current,
          }
        );

        if (cancelled) return;
        setSuggestions(
          response.suggestions
            .map((suggestion) => suggestion.placePrediction)
            .filter((prediction): prediction is GooglePlacePrediction => !!prediction)
            .slice(0, 8)
        );
      } catch {
        if (cancelled) return;
        setSuggestions([]);
        setError(tt.addressSearchUnavailable);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    open,
    area.name,
    locale,
    searchQuery,
    details.placeId,
    tt.addressSearchUnavailable,
  ]);

  async function selectAddressPrediction(prediction: GooglePlacePrediction) {
    const place = prediction.toPlace?.();
    if (!place?.fetchFields) return;

    setLoading(true);
    setError("");

    try {
      const response = await place.fetchFields({
        fields: [
          "id",
          "formattedAddress",
          "addressComponents",
          "googleMapsURI",
        ],
      });
      const selectedPlace = response.place;
      const components = selectedPlace.addressComponents;
      const formattedAddress = selectedPlace.formattedAddress || "";

      if (!isPlaceInsideDeliveryArea(formattedAddress, components, area)) {
        setSuggestions([]);
        setError(
          replaceTokens(tt.addressOutsideArea, { area: area.name })
        );
        return;
      }

      const nextDetails: AirbnbAddressDetails = {
        ...details,
        placeId: selectedPlace.id || prediction.placeId || "",
        formattedAddress,
        streetName: getAddressComponent(components, "route"),
        streetNumber: getAddressComponent(components, "street_number"),
        postalCode:
          getAddressComponent(components, "postal_code") ||
          DELIVERY_AREA_POSTCODES[area.id] ||
          "",
        city: area.name,
        mapsUrl: selectedPlace.googleMapsURI || "",
      };
      setDetails(nextDetails);
      setSearchQuery(nextDetails.formattedAddress);
      setSuggestions([]);
      sessionTokenRef.current = null;
    } catch {
      setError(tt.addressLoadFailed);
    } finally {
      setLoading(false);
    }
  }

  const canConfirm =
    !!details.placeId &&
    details.streetName.trim().length >= 2 &&
    details.streetNumber.trim().length >= 1 &&
    details.postalCode.trim().length >= 4 &&
    details.city.trim().length >= 2;

  const fieldClass =
    "mt-1.5 h-11 w-full rounded-[8px] border border-black/12 bg-white px-3 text-[12px] font-bold outline-none transition focus:border-black";

  return (
    <dialog
      ref={dialogRef}
      className="nexa-accommodation-dialog fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none overflow-hidden border-0 bg-transparent p-3 text-black"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-[min(760px,calc(100vw-24px))] flex-col overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_34px_120px_rgba(0,0,0,0.42)]"
        style={{ maxHeight: "min(780px, calc(100svh - 24px))" }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/42">
              {replaceTokens(tt.airbnbPrivateAddress, { area: area.name })}
            </div>
            <h2 className="mt-1 text-[24px] font-black tracking-[-0.04em]">
              {tt.confirmDeliveryAddress}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[7px] border border-black/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.12em] transition hover:bg-black hover:text-white active:scale-95"
          >
            {tt.close}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <label className="block text-[9px] font-black uppercase tracking-[0.14em] text-black/48">
            {tt.findAddressGoogle}
          </label>
          <div className="relative mt-2">
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setDetails((current) => ({
                  ...current,
                  placeId: "",
                  formattedAddress: "",
                  mapsUrl: "",
                }));
              }}
              autoFocus
              placeholder={replaceTokens(tt.addressPlaceholder, { area: area.name })}
              className="h-14 w-full rounded-[9px] border border-black/12 bg-black/[0.025] px-4 text-[14px] font-bold outline-none transition focus:border-black focus:bg-white focus:shadow-[0_10px_30px_rgba(0,0,0,0.09)]"
            />
            {loading ? (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-black/35">
                {tt.searching}
              </span>
            ) : null}
          </div>

          {suggestions.length > 0 ? (
            <div className="mt-2 overflow-hidden rounded-[9px] border border-black/10 bg-white p-1 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
              {suggestions.map((prediction) => (
                <button
                  key={prediction.placeId || prediction.text?.toString()}
                  type="button"
                  onClick={() => void selectAddressPrediction(prediction)}
                  className="mb-1 w-full rounded-[7px] px-3 py-2.5 text-left transition last:mb-0 hover:bg-black hover:text-white"
                >
                  <span className="block text-[11px] font-black">
                    {prediction.mainText?.toString() || prediction.text?.toString()}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-semibold opacity-55">
                    {prediction.secondaryText?.toString()}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="mt-2 rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-[11px] font-bold leading-5 text-amber-900">
              {error}
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.streetName}
              <input
                value={details.streetName}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    streetName: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.streetHouseNumber}
              <input
                value={details.streetNumber}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    streetNumber: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.blockOptional}
              <input
                value={details.blockNumber}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    blockNumber: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.buildingOptional}
              <input
                value={details.buildingName}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    buildingName: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.floorOptional}
              <input
                value={details.floor}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    floor: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.doorOptional}
              <input
                value={details.doorNumber}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    doorNumber: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.postalCode}
              <input
                value={details.postalCode}
                onChange={(event) =>
                  setDetails((current) => ({
                    ...current,
                    postalCode: event.target.value,
                  }))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-[9px] font-black uppercase tracking-[0.12em] text-black/48">
              {tt.townAreaRequired}
              <input
                value={details.city}
                readOnly
                className={`${fieldClass} cursor-not-allowed bg-black/[0.045] text-black/58`}
              />
            </label>
          </div>

          <div className="mt-4 rounded-[9px] border border-red-200 bg-red-50 px-4 py-3 text-[10px] font-bold leading-5 text-red-800">
            {tt.addressWarning}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/10 bg-white px-4 py-3">
          <div className="text-[9px] font-bold text-black/42">
            {tt.requiredFieldsGoogle}
          </div>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return;
              onConfirm({
                ...details,
                formattedAddress: buildAirbnbAddress(details, tt),
              });
            }}
            className="rounded-[8px] bg-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#222] active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/32"
          >
            {tt.selectAddress}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function PlanButton({
  selected,
  title,
  oldPrice,
  price,
  subtitle,
  needsChoice,
  popular,
  popularLabel,
  onClick,
}: {
  selected: boolean;
  title: string;
  oldPrice: number;
  price: number;
  subtitle?: string;
  needsChoice: boolean;
  popular?: boolean;
  popularLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "plan-choice-button relative min-h-[104px] overflow-visible rounded-[11px] border p-3 text-left transition-all duration-300 ease-out active:scale-[0.97]",
        selected
          ? popular
            ? "plan-popular plan-selected border-transparent bg-black text-white shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
            : "plan-secondary plan-selected border-black bg-black text-white shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
          : popular
            ? "plan-popular border-transparent bg-white text-black shadow-[0_15px_38px_rgba(0,0,0,0.10)] hover:-translate-y-1 hover:scale-[1.018] hover:shadow-[0_24px_64px_rgba(168,85,247,0.22)]"
            : "plan-secondary border-black/40 bg-white text-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.10)] hover:-translate-y-1 hover:scale-[1.018] hover:border-black hover:bg-black/[0.025] hover:shadow-[0_22px_58px_rgba(0,0,0,0.16)]",
        needsChoice ? "plan-needs-choice" : "",
      ].join(" ")}
    >
      {popular ? (
        <span className="absolute left-1/2 top-[-10px] -translate-x-1/2 rounded-full bg-[linear-gradient(135deg,#ec4899,#d946ef,#7c3aed,#38bdf8)] px-3 py-1 text-center text-[7.5px] font-black uppercase leading-none tracking-[0.14em] text-white shadow-[0_10px_26px_rgba(168,85,247,0.34)]">
          {popularLabel}
        </span>
      ) : null}

      <div
        className={[
          "text-[10px] font-black uppercase tracking-[0.12em]",
          selected ? "text-white/62" : "text-black/58",
        ].join(" ")}
      >
        {title}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span
          className={[
            "text-[13px] font-black line-through",
            selected ? "text-white/28" : "text-black/25",
          ].join(" ")}
        >
          €{oldPrice}
        </span>

        <span className="text-[33px] font-black leading-none tracking-[-0.05em]">
          €{price}
        </span>
      </div>

      {subtitle ? (
        <div
          className={[
            "mt-2 text-[9px] font-extrabold leading-3",
            selected ? "text-white/55" : "text-black/46",
          ].join(" ")}
        >
          {subtitle}
        </div>
      ) : null}
    </button>
  );
}

function CalendarModal({
  locale,
  tt,
  open,
  plan,
  activeField,
  pickupDate,
  dropoffDate,
  minBookableDate,
  notice,
  noticeIsWarning,
  deliveryWindowActive,
  isDateAllowed,
  onClose,
  onPick,
  onConfirmDates,
  onSetViewMonth,
  viewMonth,
}: {
  locale: Locale;
  tt: BookingPanelCopy;
  open: boolean;
  plan: RentalPlan;
  activeField: ActiveDateField;
  pickupDate?: Date;
  dropoffDate?: Date;
  minBookableDate: Date;
  notice: string;
  noticeIsWarning: boolean;
  deliveryWindowActive: boolean;
  isDateAllowed?: (day: Date) => boolean;
  onClose: () => void;
  onPick: (day: Date) => void;
  onConfirmDates: () => void;
  onSetViewMonth: (month: Date) => void;
  viewMonth: Date;
}) {
  const monthsScrollerRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const weekdayLabels = useMemo(() => getLocalizedWeekdays(locale), [locale]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const monthsList = useMemo(() => {
    const base = startOfMonth(minBookableDate);
    return Array.from({ length: 72 }).map((_, index) => addMonths(base, index));
  }, [minBookableDate]);

  const scrollToMonth = useCallback(
    (month: Date, behavior: ScrollBehavior = "smooth") => {
      const currentIndex = monthsList.findIndex(
        (itemMonth) =>
          itemMonth.getFullYear() === month.getFullYear() &&
          itemMonth.getMonth() === month.getMonth()
      );

      const scroller = monthsScrollerRef.current;
      const item = scroller?.querySelector<HTMLDivElement>(
        `[data-calendar-month-index="${currentIndex}"]`
      );

      if (scroller && item) {
        const scrollerRect = scroller.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const top = Math.max(
          0,
          scroller.scrollTop + itemRect.top - scrollerRect.top - 12
        );
        scroller.scrollTo({ top, behavior });
      }
    },
    [monthsList]
  );

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (!wasOpenRef.current) {
      window.requestAnimationFrame(() => {
        scrollToMonth(viewMonth, "auto");
      });
    }

    wasOpenRef.current = true;
  }, [open, scrollToMonth, viewMonth]);

  const canConfirmFullRange = plan === "full" && !!pickupDate && !!dropoffDate;
  const deliveryWindowMessage = tt.deliveryDatesNotice;
  const displayedNotice = notice ||
    (deliveryWindowActive ? deliveryWindowMessage : "");
  const displayedNoticeIsWarning = deliveryWindowActive || noticeIsWarning;

  function handleMonthJump(amount: number) {
    const nextMonth = addMonths(viewMonth, amount);
    onSetViewMonth(nextMonth);

    window.requestAnimationFrame(() => {
      scrollToMonth(nextMonth, "smooth");
    });
  }

  function handleCalendarScroll() {
    const scroller = monthsScrollerRef.current;
    if (!scroller) return;

    const scrollerTop = scroller.scrollTop;
    let currentMonth = viewMonth;
    let closestDistance = Number.POSITIVE_INFINITY;

    monthsList.forEach((month, index) => {
      const item = scroller.querySelector<HTMLDivElement>(
        `[data-calendar-month-index="${index}"]`
      );

      if (!item) return;

      const distance = Math.abs(item.offsetTop - scrollerTop - 8);

      if (distance < closestDistance) {
        closestDistance = distance;
        currentMonth = month;
      }
    });

    if (
      currentMonth.getFullYear() !== viewMonth.getFullYear() ||
      currentMonth.getMonth() !== viewMonth.getMonth()
    ) {
      onSetViewMonth(currentMonth);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="nexa-calendar-dialog fixed inset-0 m-0 h-[100dvh] w-screen max-h-none max-w-none overflow-hidden border-0 bg-transparent p-3 text-black"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="flex w-[min(760px,calc(100vw-24px))] flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white text-black shadow-[0_32px_110px_rgba(0,0,0,0.36)]"
        style={{ maxHeight: "min(700px, calc(100svh - 24px))" }}
      >
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-black/10 px-5 py-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/44">
              {activeField === "pickup" ? tt.pickupDate : tt.dropoffDate}
            </div>
            <div className="mt-1 text-[21px] font-black tracking-[-0.04em]">
              {viewMonth.toLocaleString(locale === "en" ? "en" : locale, {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/65 transition hover:bg-black hover:text-white"
          >
            {tt.close}
          </button>
        </div>

        <div className="shrink-0 border-b border-black/10 px-5 py-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleMonthJump(-1)}
              className="rounded-full bg-black/[0.04] px-4 py-2 text-[13px] font-black transition hover:bg-black hover:text-white"
            >
              ←
            </button>

            <div className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-black/38">
              {tt.scrollMonths}
            </div>

            <button
              type="button"
              onClick={() => handleMonthJump(1)}
              className="rounded-full bg-black/[0.04] px-4 py-2 text-[13px] font-black transition hover:bg-black hover:text-white"
            >
              →
            </button>
          </div>
        </div>

        {displayedNotice ? (
          <div
            className={[
              "mx-5 mt-3 rounded-[14px] border px-3 py-2 text-[11px] font-bold leading-5",
              displayedNoticeIsWarning
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-black/10 bg-black/[0.03] text-black/70",
            ].join(" ")}
          >
            {displayedNotice}
          </div>
        ) : null}

        <div
          ref={monthsScrollerRef}
          onScroll={handleCalendarScroll}
          className="calendar-months-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {monthsList.map((month, monthIndex) => {
              const monthCells = buildMonthDays(month);

              return (
                <div
                  key={`${month.getFullYear()}-${month.getMonth()}`}
                  data-calendar-month-index={monthIndex}
                  className="scroll-mt-4"
                >
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div className="text-[18px] font-black tracking-[-0.035em] text-black">
                      {month.toLocaleString(locale === "en" ? "en" : locale, {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>

                    <div className="h-px flex-1 bg-black/10" />
                  </div>

                  <div className="mb-1.5 grid grid-cols-7 gap-1.5">
                    {weekdayLabels.map((weekday, index) => (
                      <div
                        key={`${weekday}-${index}`}
                        className="py-1 text-center text-[8px] font-black uppercase tracking-[0.08em] text-black/35"
                      >
                        {weekday}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {monthCells.map((day, index) => {
                      if (!day) {
                        return (
                          <div
                            key={`empty-${monthIndex}-${index}`}
                            className="aspect-square"
                          />
                        );
                      }

                      const unavailable =
                        startOfDay(day) < startOfDay(minBookableDate);

                      const isPickupSelected =
                        !!pickupDate &&
                        startOfDay(day).getTime() ===
                          startOfDay(pickupDate).getTime();

                      const isDropoffSelected =
                        !!dropoffDate &&
                        startOfDay(day).getTime() ===
                          startOfDay(dropoffDate).getTime();

                      const selected =
                        plan === "full"
                          ? isPickupSelected || isDropoffSelected
                          : activeField === "pickup" && isPickupSelected;

                      const inRange =
                        plan === "full" &&
                        pickupDate &&
                        dropoffDate &&
                        startOfDay(day) > startOfDay(pickupDate) &&
                        startOfDay(day) < startOfDay(dropoffDate);

                      const blockedByBookingRules = isDateAllowed
                        ? !isDateAllowed(day)
                        : false;
                      const disabled = unavailable || blockedByBookingRules;

                      return (
                        <button
                          key={toISODate(day)}
                          type="button"
                          disabled={unavailable}
                          aria-disabled={disabled}
                          onClick={() => onPick(day)}
                          className={[
                            "aspect-square rounded-[14px] text-[12px] font-black transition",
                            selected
                              ? "bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
                              : inRange
                                ? "bg-black/[0.13] text-black"
                                : "bg-black/[0.035] text-black hover:bg-black/[0.09]",
                            disabled && !selected
                              ? "cursor-not-allowed bg-black/[0.02] text-black/18"
                              : "",
                            disabled && selected
                              ? "cursor-not-allowed bg-black text-white opacity-100"
                              : "",
                          ].join(" ")}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {plan === "full" ? (
          <div className="shrink-0 border-t border-black/10 bg-white px-5 py-3">
            <button
              type="button"
              disabled={!canConfirmFullRange}
              onClick={onConfirmDates}
              className="w-full rounded-[18px] bg-black px-5 py-4 text-[12px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#222] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/32"
            >
              {tt.selectDates}
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

export default function BookingPanelV3({
  vehicleName = "Piaggio Liberty 125",
  checkoutBasePath,
  onPricingChange,
}: BookingPanelV3Props) {
  const rawLocale = useLocale();
  const locale = normalizeLocale(rawLocale);
  const tt = I18N[locale] || EN_COPY;
  const router = useRouter();

  const { checkoutVehicleId, availabilityFleetGroup, quantityOptions } =
    useMemo(() => getVehicleConfig(vehicleName), [vehicleName]);

  const minBookableDate = useMemo(() => startOfDay(new Date()), []);

  const [serviceMethod, setServiceMethod] = useState<ServiceMethod | null>(null);
  const [plan, setPlan] = useState<RentalPlan>(null);
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [halfReturnTime, setHalfReturnTime] = useState("20:00");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeDateField, setActiveDateField] =
    useState<ActiveDateField>("pickup");
  const [viewMonth, setViewMonth] = useState(startOfMonth(minBookableDate));
  const [activeTimeField, setActiveTimeField] = useState<ActiveTimeField>(null);
  const [deliveryAreaId, setDeliveryAreaId] = useState("");
  const [destinationKind, setDestinationKind] =
    useState<DestinationKind | null>(null);
  const [hotelName, setHotelName] = useState("");
  const [hotelRoom, setHotelRoom] = useState("");
  const [airbnbAddress, setAirbnbAddress] = useState("");
  const [hotelSelection, setHotelSelection] =
    useState<HotelSelection | null>(null);
  const [airbnbDetails, setAirbnbDetails] =
    useState<AirbnbAddressDetails | null>(null);
  const [accommodationModal, setAccommodationModal] =
    useState<DestinationKind | null>(null);
  const [deliveryTimeModalOpen, setDeliveryTimeModalOpen] = useState(false);
  const [airportReturnMethod, setAirportReturnMethod] =
    useState<AirportReturnMethod>("office");
  const [officeReturnTime, setOfficeReturnTime] = useState("18:00");
  const [deliveryTimeConfirmed, setDeliveryTimeConfirmed] = useState(false);
  const [planAttention, setPlanAttention] = useState(false);
  const planAttentionActiveTimeoutRef = useRef<number | null>(null);
  const planAttentionRestTimeoutRef = useRef<number | null>(null);
  const planAttentionRestartTimeoutRef = useRef<number | null>(null);

  const officeScheduleDate = pickupDate || minBookableDate;
  const officeTimeOptionsBase = useMemo(
    () => buildOfficeTimeOptions(officeScheduleDate),
    [officeScheduleDate]
  );
  const sameDayPickupOptionsBase = useMemo(
    () => officeTimeOptionsBase.filter((option) => option !== "20:00"),
    [officeTimeOptionsBase]
  );
  const fullPickupOptionsBase = officeTimeOptionsBase;
  const returnHalfOptionsBase = officeTimeOptionsBase;

  useEffect(() => {
    let cancelled = false;
    let retryTimeout: number | null = null;

    const preloadGooglePlaces = () => {
      void loadGooglePlacesLibrary().catch(() => {
        if (cancelled) return;
        retryTimeout = window.setTimeout(preloadGooglePlaces, 1500);
      });
    };

    preloadGooglePlaces();

    return () => {
      cancelled = true;
      if (retryTimeout !== null) window.clearTimeout(retryTimeout);
    };
  }, []);

  const selectedDeliveryArea = useMemo(
    () => DELIVERY_AREAS.find((area) => area.id === deliveryAreaId) || null,
    [deliveryAreaId]
  );

  const isDeliveryService =
    serviceMethod === "hotel_delivery" || serviceMethod === "airport_delivery";

  const winterOfficeScheduleActive =
    serviceMethod === "office" && isWinterDeliveryDate(officeScheduleDate);

  const selectedServiceLabel =
    serviceMethod === "office"
      ? tt.officePickup
      : serviceMethod === "hotel_delivery"
        ? tt.hotelAirbnbDelivery
        : serviceMethod === "airport_delivery"
          ? tt.airportDelivery
          : "";

  const deliveryTimeOptionsBase = useMemo(() => {
    const stepMinutes =
      serviceMethod === "airport_delivery"
        ? 30
        : selectedDeliveryArea?.slotMinutes || 10;

    return buildTimeOptions(11, 30, 17, 30, stepMinutes);
  }, [serviceMethod, selectedDeliveryArea]);

  const baseActivePricing = useMemo(() => {
    return getSeasonalPricing(pickupDate || minBookableDate);
  }, [pickupDate, minBookableDate]);

  const kymcoSkyTownPriceIncrease = isKymcoSkyTown(vehicleName)
    ? KYMCO_SKY_TOWN_PRICE_INCREASE
    : 0;

  const activePricing = useMemo(() => {
    return getVehiclePricing(baseActivePricing, vehicleName);
  }, [baseActivePricing, vehicleName]);

  const sameDayRoundedHours = useMemo(() => {
    return getSameDayRoundedHours(pickupTime, halfReturnTime);
  }, [pickupTime, halfReturnTime]);

  const sameDayDynamicPrice = useMemo(() => {
    return (
      getSameDayHourlyRate(
        pickupTime,
        halfReturnTime,
        baseActivePricing.halfDayPrice
      ) + kymcoSkyTownPriceIncrease
    );
  }, [
    pickupTime,
    halfReturnTime,
    baseActivePricing.halfDayPrice,
    kymcoSkyTownPriceIncrease,
  ]);

  useEffect(() => {
    onPricingChange?.(activePricing);
  }, [activePricing, onPricingChange]);

  useEffect(() => {
    if (quantityOptions.includes(quantity)) return;
    setQuantity(quantityOptions[0] || 1);
  }, [quantity, quantityOptions]);

  const pickupOptions = useMemo(() => {
    const base = isDeliveryService
      ? deliveryTimeOptionsBase
      : plan === "half"
        ? sameDayPickupOptionsBase
        : fullPickupOptionsBase;
    return filterTimesForDate(base, pickupDate);
  }, [
    isDeliveryService,
    deliveryTimeOptionsBase,
    plan,
    sameDayPickupOptionsBase,
    fullPickupOptionsBase,
    pickupDate,
  ]);

  const returnHalfOptions = useMemo(() => {
    const pickupMinutes = timeToMinutes(pickupTime);

    return returnHalfOptionsBase.filter(
      (option) => timeToMinutes(option) > pickupMinutes
    );
  }, [returnHalfOptionsBase, pickupTime]);

  const returnDate = plan === "half" ? pickupDate : dropoffDate;
  const returnTime =
    plan === "half"
      ? halfReturnTime
      : serviceMethod === "airport_delivery" && airportReturnMethod === "office"
        ? officeReturnTime
        : pickupTime;

  const fullDayCount = useMemo(() => {
    if (plan !== "full" || !pickupDate || !dropoffDate) return 0;
    return Math.max(1, dayDiff(pickupDate, dropoffDate));
  }, [plan, pickupDate, dropoffDate]);

  const fullDayRate = useMemo(() => {
    if (plan !== "full" || !fullDayCount) {
      return activePricing.fullDayPricing[1];
    }

    return getRate(fullDayCount, activePricing, vehicleName);
  }, [plan, fullDayCount, activePricing, vehicleName]);

  const singleScooterTotal = useMemo(() => {
    if (plan === "half") return sameDayDynamicPrice;
    if (plan === "full" && fullDayCount > 0) return fullDayRate * fullDayCount;
    return 0;
  }, [plan, fullDayCount, fullDayRate, sameDayDynamicPrice]);

  const rentalTotal = useMemo(() => {
    return singleScooterTotal * quantity;
  }, [singleScooterTotal, quantity]);

  const deliveryDetailsComplete = useMemo(() => {
    if (serviceMethod === "office") return true;

    if (serviceMethod === "hotel_delivery") {
      if (!selectedDeliveryArea || !destinationKind) return false;
      if (destinationKind === "hotel") {
        return !!hotelSelection && hotelName.trim().length >= 2;
      }
      return (
        !!airbnbDetails &&
        airbnbDetails.streetName.trim().length >= 2 &&
        airbnbDetails.streetNumber.trim().length >= 1 &&
        airbnbDetails.postalCode.trim().length >= 4 &&
        airbnbAddress.trim().length >= 8
      );
    }

    if (serviceMethod === "airport_delivery") {
      if (airportReturnMethod === "office") return true;
      if (!selectedDeliveryArea || !destinationKind) return false;
      if (destinationKind === "hotel") {
        return !!hotelSelection && hotelName.trim().length >= 2;
      }
      return (
        !!airbnbDetails &&
        airbnbDetails.streetName.trim().length >= 2 &&
        airbnbDetails.streetNumber.trim().length >= 1 &&
        airbnbDetails.postalCode.trim().length >= 4 &&
        airbnbAddress.trim().length >= 8
      );
    }

    return false;
  }, [
    serviceMethod,
    selectedDeliveryArea,
    destinationKind,
    hotelName,
    hotelSelection,
    airbnbAddress,
    airbnbDetails,
    airportReturnMethod,
    officeReturnTime,
  ]);

  const deliveryFee =
    serviceMethod === "airport_delivery"
      ? AIRPORT_DELIVERY_FEE
      : serviceMethod === "hotel_delivery"
        ? selectedDeliveryArea?.fee || 0
        : 0;

  const collectionFee =
    serviceMethod === "hotel_delivery"
      ? selectedDeliveryArea?.fee || 0
      : serviceMethod === "airport_delivery" &&
          airportReturnMethod === "hotel_delivery"
        ? selectedDeliveryArea?.fee || 0
        : 0;

  const serviceFees = deliveryFee + collectionFee;
  const finalTotal = rentalTotal + serviceFees;

  const normalFullDayTotal = useMemo(() => {
    if (plan !== "full" || fullDayCount <= 1) return 0;
    return activePricing.fullDayPricing[1] * fullDayCount * quantity;
  }, [plan, fullDayCount, activePricing, quantity]);

  const hasDiscount =
    plan === "full" && fullDayCount > 1 && normalFullDayTotal > rentalTotal;

  const hasCompleteRentalSelection = useMemo(() => {
    if (!serviceMethod) return false;

    if (plan === "half") {
      return !!pickupDate && !!pickupTime && !!halfReturnTime && quantity >= 1;
    }

    if (plan === "full") {
      return (
        !!pickupDate &&
        !!dropoffDate &&
        fullDayCount >= 1 &&
        !!pickupTime &&
        deliveryDetailsComplete &&
        (!isDeliveryService || deliveryTimeConfirmed) &&
        quantity >= 1
      );
    }

    return false;
  }, [
    plan,
    pickupDate,
    dropoffDate,
    fullDayCount,
    pickupTime,
    halfReturnTime,
    quantity,
    serviceMethod,
    deliveryDetailsComplete,
    isDeliveryService,
    deliveryTimeConfirmed,
  ]);

  const isUnavailable =
    availability !== null &&
    availability.ok === true &&
    availability.available === false;

  const quantityUnavailable =
    availability !== null &&
    availability.ok === true &&
    availability.available === true &&
    typeof availability.availableCount === "number" &&
    availability.availableCount < quantity;

  const availabilityConfirmed =
    availability !== null &&
    availability.ok === true &&
    availability.available === true &&
    !quantityUnavailable;

  const canCheckout =
    hasCompleteRentalSelection &&
    availabilityConfirmed &&
    !isCheckingAvailability &&
    !isUnavailable &&
    !quantityUnavailable;

  const summaryText = useMemo(() => {
    if (plan === "half" && pickupDate) {
      return `${quantity} × ${tt.sameDayRental} • ${sameDayRoundedHours} ${
        sameDayRoundedHours > 1 ? tt.hours : tt.hour
      }`;
    }

    if (plan === "full" && pickupDate && dropoffDate && fullDayCount > 0) {
      return `${quantity} × ${fullDayCount} ${
        fullDayCount > 1 ? tt.days : tt.day
      } • €${fullDayRate}/${tt.day}`;
    }

    return tt.choosePlanBegin;
  }, [
    plan,
    pickupDate,
    dropoffDate,
    fullDayCount,
    fullDayRate,
    quantity,
    tt,
    sameDayRoundedHours,
  ]);

  useEffect(() => {
    setAvailability(null);
    setNotice("");
  }, [
    vehicleName,
    serviceMethod,
    plan,
    pickupDate,
    dropoffDate,
    pickupTime,
    halfReturnTime,
    quantity,
    deliveryAreaId,
    destinationKind,
    hotelName,
    airbnbAddress,
    hotelSelection,
    airbnbDetails,
    airportReturnMethod,
    officeReturnTime,
    deliveryTimeConfirmed,
  ]);

  useEffect(() => {
    if (!plan || !pickupDate) return;

    if (pickupOptions.length === 0) {
      setNotice(tt.noTimesToday);
      return;
    }

    if (!pickupOptions.includes(pickupTime)) {
      setPickupTime(pickupOptions[0]);
    }
  }, [plan, pickupDate, pickupOptions, pickupTime, tt.noTimesToday]);

  useEffect(() => {
    if (plan !== "half") return;

    if (returnHalfOptions.length === 0) {
      setHalfReturnTime("20:00");
      return;
    }

    if (!returnHalfOptions.includes(halfReturnTime)) {
      setHalfReturnTime(returnHalfOptions[returnHalfOptions.length - 1]);
    }
  }, [plan, returnHalfOptions, halfReturnTime]);

  useEffect(() => {
    if (!hasCompleteRentalSelection || !plan || !pickupDate || !returnDate) {
      setIsCheckingAvailability(false);
      return;
    }

    let cancelled = false;

    async function checkAvailability() {
      setIsCheckingAvailability(true);

      try {
        if (!pickupDate || !returnDate || !plan) {
          if (!cancelled) {
            setAvailability(null);
            setIsCheckingAvailability(false);
          }
          return;
        }

        const params = new URLSearchParams({
          vehicleId: String(checkoutVehicleId),
          vehicleName: String(vehicleName),
          fleetGroup: String(availabilityFleetGroup),
          plan: String(plan),
          from: toISODate(pickupDate),
          to: toISODate(returnDate),
          pickupTime: String(pickupTime),
          dropoffTime: String(returnTime),
          quantity: String(quantity),
          serviceMethod: String(serviceMethod || "office"),
          collectionRequired: String(
            serviceMethod === "hotel_delivery" ||
              airportReturnMethod === "hotel_delivery"
          ),
        });

        const response = await fetch(
          `/api/admin/availability?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = (await response.json()) as AvailabilityResult;

        if (!response.ok) {
          if (!cancelled) {
            setAvailability({
              ok: false,
              available: false,
              message: tt.availabilityError,
            });
          }
          return;
        }

        if (!cancelled) {
          setAvailability(data);
        }
      } catch {
        if (!cancelled) {
          setAvailability({
            ok: false,
            available: false,
            message: tt.availabilityError,
          });
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAvailability(false);
        }
      }
    }

    const timeout = window.setTimeout(checkAvailability, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    hasCompleteRentalSelection,
    checkoutVehicleId,
    vehicleName,
    availabilityFleetGroup,
    plan,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    quantity,
    serviceMethod,
    airportReturnMethod,
    tt.availabilityError,
  ]);

  const clearPlanAttentionTimers = useCallback(() => {
    if (planAttentionActiveTimeoutRef.current) {
      window.clearTimeout(planAttentionActiveTimeoutRef.current);
      planAttentionActiveTimeoutRef.current = null;
    }

    if (planAttentionRestTimeoutRef.current) {
      window.clearTimeout(planAttentionRestTimeoutRef.current);
      planAttentionRestTimeoutRef.current = null;
    }

    if (planAttentionRestartTimeoutRef.current) {
      window.clearTimeout(planAttentionRestartTimeoutRef.current);
      planAttentionRestartTimeoutRef.current = null;
    }
  }, []);

  const beginPlanAttentionCycle = useCallback(
    (initialDelay = 0) => {
      clearPlanAttentionTimers();

      if (plan) {
        setPlanAttention(false);
        return;
      }

      const runPulse = () => {
        setPlanAttention(false);

        planAttentionRestartTimeoutRef.current = window.setTimeout(() => {
          setPlanAttention(true);
        }, PLAN_ATTENTION_RESTART_DELAY_MS);

        planAttentionActiveTimeoutRef.current = window.setTimeout(() => {
          setPlanAttention(false);

          planAttentionRestTimeoutRef.current = window.setTimeout(() => {
            runPulse();
          }, PLAN_ATTENTION_REST_MS);
        }, PLAN_ATTENTION_ACTIVE_MS);
      };

      if (initialDelay > 0) {
        planAttentionRestTimeoutRef.current = window.setTimeout(() => {
          runPulse();
        }, initialDelay);

        return;
      }

      runPulse();
    },
    [clearPlanAttentionTimers, plan]
  );

  useEffect(() => {
    if (plan) {
      clearPlanAttentionTimers();
      setPlanAttention(false);
      return;
    }

    beginPlanAttentionCycle(0);

    return () => {
      clearPlanAttentionTimers();
    };
  }, [plan, beginPlanAttentionCycle, clearPlanAttentionTimers]);

  function triggerPlanAttention() {
    beginPlanAttentionCycle(0);
  }

  function openCalendar(field: ActiveDateField) {
    if (!plan) {
      setNotice(tt.choosePlanFirst);
      setActiveTimeField(null);
      triggerPlanAttention();
      return;
    }

    const defaultCalendarDate = isDeliveryService
      ? getNextDeliveryDate(minBookableDate)
      : minBookableDate;

    if (field === "dropoff" && plan === "half") {
      setNotice("");
      setActiveDateField("pickup");
      setViewMonth(startOfMonth(pickupDate || defaultCalendarDate));
      setCalendarOpen(true);
      return;
    }

    if (field === "dropoff" && !pickupDate) {
      setNotice(tt.chooseDateFirst);
      setActiveDateField("pickup");
      setViewMonth(startOfMonth(defaultCalendarDate));
      setCalendarOpen(true);
      return;
    }

    setNotice("");
    setActiveTimeField(null);
    setActiveDateField(field);
    setViewMonth(
      startOfMonth(
        field === "pickup"
          ? pickupDate || defaultCalendarDate
          : dropoffDate || pickupDate || defaultCalendarDate
      )
    );
    setCalendarOpen(true);
  }

  function handleServiceMethodSelect(nextMethod: ServiceMethod) {
    clearPlanAttentionTimers();
    setPlanAttention(false);
    setServiceMethod(nextMethod);
    setPickupDate(undefined);
    setDropoffDate(undefined);
    setPickupTime(nextMethod === "office" ? "09:30" : "11:30");
    setHalfReturnTime("20:00");
    setDeliveryAreaId("");
    setDestinationKind(null);
    setHotelName("");
    setHotelRoom("");
    setAirbnbAddress("");
    setHotelSelection(null);
    setAirbnbDetails(null);
    setAccommodationModal(null);
    setAirportReturnMethod("office");
    setOfficeReturnTime("18:00");
    setDeliveryTimeConfirmed(false);
    setDeliveryTimeModalOpen(false);
    setAvailability(null);
    setNotice("");
    setIsCheckingAvailability(false);
    setActiveTimeField(null);
    setActiveDateField("pickup");

    if (nextMethod === "office") {
      setPlan(null);
      setViewMonth(startOfMonth(minBookableDate));
      setCalendarOpen(false);
      return;
    }

    const firstDeliveryDate = getNextDeliveryDate(minBookableDate);
    setPlan("full");
    setViewMonth(startOfMonth(firstDeliveryDate));
    setNotice("");
    setCalendarOpen(true);
  }

  function handleChangeServiceMethod() {
    clearPlanAttentionTimers();
    setPlanAttention(false);
    setServiceMethod(null);
    setPlan(null);
    setPickupDate(undefined);
    setDropoffDate(undefined);
    setPickupTime("10:00");
    setHalfReturnTime("20:00");
    setDeliveryTimeModalOpen(false);
    setDeliveryAreaId("");
    setDestinationKind(null);
    setHotelName("");
    setHotelRoom("");
    setAirbnbAddress("");
    setHotelSelection(null);
    setAirbnbDetails(null);
    setAccommodationModal(null);
    setAirportReturnMethod("office");
    setOfficeReturnTime("18:00");
    setDeliveryTimeConfirmed(false);
    setAvailability(null);
    setNotice("");
    setIsCheckingAvailability(false);
    setActiveTimeField(null);
    setActiveDateField("pickup");
    setViewMonth(startOfMonth(minBookableDate));
    setCalendarOpen(false);
  }

  function isCalendarDateAllowed(day: Date) {
    if (!isDeliveryService) return true;
    if (!isWinterDeliveryDate(day)) return false;

    if (activeDateField === "dropoff" && pickupDate) {
      return getWinterSeasonKey(day) === getWinterSeasonKey(pickupDate);
    }

    return true;
  }

  function handlePlanSelect(nextPlan: Exclude<RentalPlan, null>) {
    clearPlanAttentionTimers();
    setPlanAttention(false);
    setPlan(nextPlan);
    setPickupDate(undefined);
    setDropoffDate(undefined);
    setPickupTime("10:00");
    setHalfReturnTime("20:00");
    setAvailability(null);
    setNotice("");
    setIsCheckingAvailability(false);
    setActiveTimeField(null);
    setActiveDateField("pickup");
    setViewMonth(startOfMonth(minBookableDate));

    window.setTimeout(() => {
      setCalendarOpen(true);
    }, 90);
  }

  function handleCalendarPick(day: Date) {
    if (!plan) return;

    if (!isCalendarDateAllowed(day)) {
      setNotice(tt.deliveryDatesNotice);
      return;
    }

    if (isDeliveryService) {
      setDeliveryTimeConfirmed(false);
      setDeliveryTimeModalOpen(false);
    }

    if (activeDateField === "pickup") {
      setPickupDate(day);
      setNotice("");
      setAvailability(null);
      setViewMonth(startOfMonth(day));

      const filteredOptions = filterTimesForDate(
        isDeliveryService
          ? deliveryTimeOptionsBase
          : plan === "half"
            ? sameDayPickupOptionsBase
            : fullPickupOptionsBase,
        day
      );

      if (filteredOptions.length > 0) {
        setPickupTime(
          filteredOptions.includes(isDeliveryService ? "11:30" : "10:00")
            ? isDeliveryService
              ? "11:30"
              : "10:00"
            : filteredOptions[0]
        );
      }

      if (plan === "half") {
        setDropoffDate(undefined);
        setCalendarOpen(false);
        window.setTimeout(() => {
          setActiveTimeField("pickup");
        }, 140);
        return;
      }

      setDropoffDate(undefined);
      setActiveDateField("dropoff");
      return;
    }

    if (!pickupDate) {
      setNotice(tt.chooseDateFirst);
      setActiveDateField("pickup");
      return;
    }

    const days = dayDiff(pickupDate, day);

    if (days < 1) {
      setNotice(tt.fullMin24);
      return;
    }

    setDropoffDate(day);
    setNotice("");
    setViewMonth(startOfMonth(day));
  }

  function handleConfirmCalendarDates() {
    if (plan !== "full") return;

    if (!pickupDate) {
      setNotice(tt.chooseDateFirst);
      setActiveDateField("pickup");
      return;
    }

    if (!dropoffDate) {
      setNotice(tt.fullMin24);
      setActiveDateField("dropoff");
      return;
    }

    const days = dayDiff(pickupDate, dropoffDate);

    if (days < 1) {
      setNotice(tt.fullMin24);
      setActiveDateField("dropoff");
      return;
    }

    setNotice("");
    setCalendarOpen(false);

    if (!isDeliveryService) {
      window.setTimeout(() => {
        setActiveTimeField("pickup");
      }, 140);
    } else if (
      serviceMethod === "airport_delivery" &&
      airportReturnMethod === "office"
    ) {
      window.setTimeout(() => setDeliveryTimeModalOpen(true), 140);
    }
  }

  function handlePickupTimeSelect(value: string) {
    setPickupTime(value);

    if (plan === "half") {
      const nextReturnOptions = returnHalfOptionsBase.filter(
        (option) => timeToMinutes(option) > timeToMinutes(value)
      );

      if (nextReturnOptions.length > 0) {
        if (!nextReturnOptions.includes(halfReturnTime)) {
          setHalfReturnTime(nextReturnOptions[nextReturnOptions.length - 1]);
        }
      }

      setActiveTimeField("return");
      return;
    }

    setActiveTimeField(null);
  }

  function handleReturnTimeSelect(value: string) {
    setHalfReturnTime(value);
    setActiveTimeField(null);
  }

  function handleFieldWithoutPlan() {
    if (!plan) {
      setNotice(tt.choosePlanFirst);
      triggerPlanAttention();
      return;
    }
  }

  function onProceed() {
    if (isCheckingAvailability) {
      setNotice(tt.checkingWait);
      return;
    }

    if (isUnavailable) {
      setNotice(tt.unavailableNotice);
      return;
    }

    if (quantityUnavailable) {
      const available = availability?.availableCount ?? 0;
      setNotice(replaceTokens(tt.notEnoughQuantity, { available }));
      return;
    }

    if (!availabilityConfirmed) {
      setNotice(
        availability?.ok === false
          ? tt.availabilityError
          : tt.availabilityRequired
      );
      return;
    }

    if (!canCheckout || !pickupDate) {
      setNotice(tt.completeDetails);
      return;
    }

    const resolvedReturnDate = returnDate || pickupDate;
    const resolvedDays = plan === "half" ? 1 : fullDayCount;
    const resolvedRate = plan === "half" ? sameDayDynamicPrice : fullDayRate;

    const params = new URLSearchParams({
      vehicleId: checkoutVehicleId,
      vehicle: vehicleName,
      vehicleName,
      fleetGroup: String(availability?.fleetGroup || availabilityFleetGroup),
      assignedVehicleCode: String(availability?.assignedVehicleCode || ""),
      assignedVehicleName: String(availability?.assignedVehicleName || ""),
      assignedVehicleMatricula: String(
        availability?.assignedVehicleMatricula || ""
      ),
      assignedVehicleDisplayName: String(
        availability?.assignedVehicleDisplayName || ""
      ),
      pickupLocation:
        serviceMethod === "airport_delivery"
          ? "Palma de Mallorca Airport"
          : serviceMethod === "hotel_delivery"
            ? selectedDeliveryArea?.name || "Hotel / Airbnb delivery"
            : DEFAULT_PICKUP_LOCATION,
      serviceMethod: serviceMethod || "office",
      deliveryArea: selectedDeliveryArea?.name || "",
      deliveryAreaId: selectedDeliveryArea?.id || "",
      destinationKind: destinationKind || "",
      hotelName,
      hotelRoom,
      hotelAddress: hotelSelection?.address || "",
      hotelPlaceId: hotelSelection?.placeId || "",
      hotelGoogleMapsUrl: hotelSelection?.mapsUrl || "",
      hotelPhotos: JSON.stringify(hotelSelection?.photos || []),
      airbnbAddress,
      airbnbPlaceId: airbnbDetails?.placeId || "",
      airbnbStreetName: airbnbDetails?.streetName || "",
      airbnbStreetNumber: airbnbDetails?.streetNumber || "",
      airbnbBlockNumber: airbnbDetails?.blockNumber || "",
      airbnbBuildingName: airbnbDetails?.buildingName || "",
      airbnbFloor: airbnbDetails?.floor || "",
      airbnbDoorNumber: airbnbDetails?.doorNumber || "",
      airbnbPostalCode: airbnbDetails?.postalCode || "",
      airbnbCity: airbnbDetails?.city || "",
      airbnbGoogleMapsUrl: airbnbDetails?.mapsUrl || "",
      deliveryAddress:
        destinationKind === "hotel"
          ? hotelSelection?.address || ""
          : destinationKind === "airbnb"
            ? airbnbAddress
            : "",
      airportReturnMethod:
        serviceMethod === "airport_delivery" ? airportReturnMethod : "",
      officeReturnTime:
        serviceMethod === "airport_delivery" && airportReturnMethod === "office"
          ? officeReturnTime
          : "",
      deliveryFee: String(deliveryFee),
      collectionFee: String(collectionFee),
      serviceFees: String(serviceFees),
      from: toISODate(pickupDate),
      to: toISODate(resolvedReturnDate),
      pickupTime,
      dropoffTime: returnTime,
      plan: plan || "",
      quantity: String(quantity),
      total: String(finalTotal),
      singleScooterTotal: String(singleScooterTotal),
      days: String(resolvedDays),
      rate: String(resolvedRate),
      sameDayHours: plan === "half" ? String(sameDayRoundedHours) : "",
      availabilityChecked: "true",
      availableCount:
        typeof availability?.availableCount === "number"
          ? String(availability.availableCount)
          : "",
      totalFleet:
        typeof availability?.totalFleet === "number"
          ? String(availability.totalFleet)
          : "",
      onlineFleetNotice:
        "Quantity selected online. Live availability was checked before checkout.",
    });

    const localizedCheckoutBasePath = getLocalizedCheckoutBasePath(
      checkoutBasePath,
      locale
    );

    router.push(`${localizedCheckoutBasePath}?${params.toString()}`);
  }

  const needsPlanChoice = planAttention && !plan;
  const noticeIsWarning =
    notice === tt.choosePlanFirst ||
    notice === tt.maxOnline6 ||
    notice === tt.fullMin24 ||
    notice === tt.chooseDateFirst ||
    notice === tt.noTimesToday;

  return (
    <div className="nexa-booking-panel-v3 relative z-20 w-full rounded-[20px] border border-black/10 bg-white p-4 text-black shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <style jsx global>{`
        .nexa-booking-panel-v3 {
          max-width: 410px;
        }

        .nexa-booking-panel-v3 button,
        .nexa-booking-panel-v3 input,
        .nexa-booking-panel-v3 select,
        .nexa-booking-panel-v3 textarea {
          border-radius: 8px !important;
        }

        .nexa-calendar-dialog[open],
        .nexa-area-dialog[open],
        .nexa-accommodation-dialog[open],
        .nexa-delivery-time-dialog[open] {
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .nexa-calendar-dialog::backdrop,
        .nexa-area-dialog::backdrop,
        .nexa-accommodation-dialog::backdrop,
        .nexa-delivery-time-dialog::backdrop {
          background: rgba(0, 0, 0, 0.52);
          -webkit-backdrop-filter: blur(7px);
          backdrop-filter: blur(7px);
        }

        .nexa-ai-copilot,
        .nexa-ai-copilot-card,
        .nexa-copilot,
        .booking-copilot,
        .ai-copilot,
        [data-nexa-copilot],
        [data-booking-copilot],
        [data-ai-copilot] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        .plan-popular {
          border-color: transparent !important;
          background:
            linear-gradient(#ffffff, #ffffff) padding-box,
            linear-gradient(135deg, #ec4899, #d946ef, #7c3aed, #38bdf8)
              border-box !important;
          box-shadow:
            0 15px 38px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(168, 85, 247, 0.18) !important;
        }

        .plan-popular.plan-selected {
          border-color: transparent !important;
          background:
            linear-gradient(#000000, #000000) padding-box,
            linear-gradient(135deg, #ec4899, #d946ef, #7c3aed, #38bdf8)
              border-box !important;
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.22),
            0 0 0 1px rgba(168, 85, 247, 0.28) !important;
        }

        .plan-secondary.plan-needs-choice {
          border-color: rgba(0, 0, 0, 0.42) !important;
          box-shadow:
            inset 0 0 0 1px rgba(0, 0, 0, 0.12),
            0 16px 38px rgba(0, 0, 0, 0.12) !important;
        }

        .plan-needs-choice {
          animation: planHeartbeat 0.72s ease-in-out infinite !important;
        }

        .plan-needs-choice::before,
        .plan-needs-choice::after {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 13px;
          padding: 2px;
          animation: planRing 1.05s ease-out infinite;
          pointer-events: none;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .plan-popular.plan-needs-choice::before,
        .plan-popular.plan-needs-choice::after {
          background: linear-gradient(
            135deg,
            #ec4899,
            #d946ef,
            #7c3aed,
            #38bdf8
          );
        }

        .plan-secondary.plan-needs-choice::before,
        .plan-secondary.plan-needs-choice::after {
          background: linear-gradient(
            135deg,
            rgba(17, 24, 39, 0.72),
            rgba(107, 114, 128, 0.62),
            rgba(209, 213, 219, 0.72)
          );
        }

        .plan-needs-choice::after {
          animation-delay: 0.62s;
        }

        .checkout-button-pulse {
          border-color: transparent;
          background:
            linear-gradient(#050505, #050505) padding-box,
            linear-gradient(105deg, #f97316, #facc15, #ec4899, #7c3aed, #f97316)
              border-box;
          background-size: 100% 100%, 300% 300%;
          box-shadow: 0 14px 34px rgba(249, 115, 22, 0.24);
          animation:
            checkoutPulse 1.9s ease-in-out infinite,
            serviceMethodBorderFlow 4.5s linear infinite;
        }

        .checkout-button-pulse:hover {
          animation-play-state: paused;
          transform: translateY(-1px) scale(1.006);
        }

        .checkout-button-pulse:hover .checkout-button-shine {
          opacity: 1;
          animation: serviceMethodShine 0.72s ease-out both;
        }

        .service-method-button {
          background:
            linear-gradient(#ffffff, #ffffff) padding-box,
            linear-gradient(
                105deg,
                #7c3aed,
                #f97316,
                #22c55e,
                #2563eb,
                #7c3aed
              )
              border-box;
          background-size: 100% 100%, 300% 300%;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.075);
          animation:
            serviceMethodHeartbeat 3s ease-in-out infinite,
            serviceMethodBorderFlow 6s linear infinite;
          will-change: transform;
        }

        .service-method-button:hover,
        .service-method-button.service-method-selected {
          color: #ffffff;
          background:
            linear-gradient(#050505, #050505) padding-box,
            linear-gradient(
                105deg,
                #7c3aed,
                #f97316,
                #22c55e,
                #2563eb,
                #7c3aed
              )
              border-box;
          background-size: 100% 100%, 300% 300%;
          box-shadow:
            0 15px 32px rgba(0, 0, 0, 0.24),
            0 0 0 1px rgba(124, 58, 237, 0.08);
        }

        .service-method-button:hover {
          animation-play-state: paused;
          transform: translateY(-2px) scale(1.008);
        }

        .service-method-button:active {
          animation: none;
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
        }

        .service-method-button:hover .service-method-shine {
          opacity: 1;
          animation: serviceMethodShine 0.72s ease-out both;
        }

        .service-method-button.service-method-selected .service-method-icon {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
        }

        .nexa-booking-panel-v3 .delivery-area-trigger {
          color: #ffffff !important;
          background:
            linear-gradient(#050505, #050505) padding-box,
            linear-gradient(
                105deg,
                #7c3aed,
                #f97316,
                #22c55e,
                #2563eb,
                #7c3aed
              )
              border-box !important;
          background-size: 100% 100%, 300% 300% !important;
          border-color: transparent !important;
          opacity: 1 !important;
          -webkit-appearance: none;
          appearance: none;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
          animation: serviceMethodBorderFlow 5s linear infinite;
          will-change: transform, background-position;
        }

        .destination-choice-button {
          color: #111111;
          background:
            linear-gradient(#f1f1f1, #f1f1f1) padding-box,
            linear-gradient(
                105deg,
                #7c3aed,
                #f97316,
                #22c55e,
                #2563eb,
                #7c3aed
              )
              border-box;
          background-size: 100% 100%, 300% 300%;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
        }

        .delivery-area-trigger.delivery-area-attention {
          color: #ffffff;
          background:
            linear-gradient(#050505, #050505) padding-box,
            linear-gradient(
                105deg,
                #7c3aed,
                #f97316,
                #22c55e,
                #2563eb,
                #7c3aed
              )
              border-box;
          background-size: 100% 100%, 300% 300%;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
          animation:
            deliveryAreaHeartbeat 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite,
            serviceMethodBorderFlow 5s linear infinite;
          will-change: transform;
        }

        .delivery-area-trigger:hover,
        .delivery-area-trigger.delivery-area-open,
        .destination-choice-button:hover,
        .destination-choice-button.destination-choice-selected {
          color: #ffffff;
          background:
            linear-gradient(#050505, #050505) padding-box,
            linear-gradient(
                105deg,
                #7c3aed,
                #f97316,
                #22c55e,
                #2563eb,
                #7c3aed
              )
              border-box;
          background-size: 100% 100%, 300% 300%;
          box-shadow: 0 15px 32px rgba(0, 0, 0, 0.22);
          animation-play-state: paused;
          transform: translateY(-2px) scale(1.008);
        }

        .delivery-area-trigger.delivery-area-open {
          animation: serviceMethodBorderFlow 5s linear infinite;
        }

        .delivery-area-trigger:hover .delivery-area-fee,
        .delivery-area-trigger.delivery-area-open .delivery-area-fee {
          color: rgba(255, 255, 255, 0.78);
          background: rgba(255, 255, 255, 0.12);
        }

        .delivery-area-trigger:active,
        .destination-choice-button:active {
          animation: none;
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 5px 14px rgba(0, 0, 0, 0.18);
        }

        .delivery-area-trigger:hover .delivery-area-shine,
        .destination-choice-button:hover .destination-choice-shine {
          opacity: 1;
          animation: serviceMethodShine 0.72s ease-out both;
        }

        .destination-choice-button.destination-choice-attention {
          animation:
            serviceMethodHeartbeat 3s ease-in-out 3s infinite,
            serviceMethodBorderFlow 6s linear 3s infinite;
          will-change: transform;
        }

        .calendar-months-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.24) transparent;
          scroll-behavior: smooth;
        }

        .calendar-months-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .calendar-months-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .calendar-months-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.24);
        }

        @keyframes planHeartbeat {
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

        @keyframes planRing {
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

        @keyframes checkoutPulse {
          0% {
            transform: scale(1);
          }

          14% {
            transform: scale(1.025);
          }

          28% {
            transform: scale(1);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes serviceMethodHeartbeat {
          0%,
          16%,
          100% {
            transform: scale(1);
          }

          4% {
            transform: scale(1.018);
          }

          8% {
            transform: scale(0.995);
          }

          12% {
            transform: scale(1.012);
          }
        }

        @keyframes deliveryAreaHeartbeat {
          0%,
          44%,
          100% {
            transform: scale(1);
          }

          7% {
            transform: translateY(-1px) scale(1.035);
          }

          13% {
            transform: translateY(0) scale(0.995);
          }

          20% {
            transform: translateY(-1px) scale(1.026);
          }

          29% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes serviceMethodBorderFlow {
          0% {
            background-position: 0 0, 0% 50%;
          }

          100% {
            background-position: 0 0, 300% 50%;
          }
        }

        @keyframes serviceMethodShine {
          from {
            left: -50%;
          }

          to {
            left: 125%;
          }
        }

        @media (max-width: 767px) {
          .nexa-booking-panel-v3 {
            max-width: 100%;
            border-radius: 16px;
            padding: 12px;
          }

          .calendar-months-scroll {
            max-height: 62vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .checkout-button-pulse,
          .service-method-button,
          .service-method-button:hover .service-method-shine,
          .delivery-area-trigger,
          .delivery-area-trigger:hover .delivery-area-shine,
          .destination-choice-button,
          .destination-choice-button:hover .destination-choice-shine,
          .plan-needs-choice,
          .plan-needs-choice::before,
          .plan-needs-choice::after {
            animation: none !important;
          }
        }
      `}</style>

      <div className="rounded-[12px] border border-black/10 bg-black/[0.03] px-3 py-3">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
          {tt.vehicle}
        </div>
        <div className="mt-0.5 truncate text-[15px] font-black text-black">
          {vehicleName}
        </div>

        {serviceMethod ? (
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-black/10 pt-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[linear-gradient(135deg,#7c3aed,#f97316,#22c55e,#2563eb)] text-[10px] font-black text-white"
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="truncate text-[10px] font-black uppercase tracking-[0.07em] text-black/68">
                {replaceTokens(tt.selected, {
                  method: selectedServiceLabel,
                })}
              </span>
            </div>

            <button
              type="button"
              onClick={handleChangeServiceMethod}
              className="shrink-0 rounded-[5px] border border-black/[0.12] bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-black transition hover:border-black hover:bg-black hover:text-white active:scale-95"
            >
              {tt.change}
            </button>
          </div>
        ) : null}
      </div>

      {!serviceMethod ? (
      <div className="mt-3">
        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
          {tt.serviceQuestion}
        </div>
        <div className="grid grid-cols-1 gap-3">
          <ServiceMethodButton
            selected={serviceMethod === "office"}
            title={tt.officePickup}
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10h18M5 10v10h14V10M4 4h16l1 6H3l1-6Z" />
                <path d="M9 20v-5h6v5" />
              </svg>
            }
            onClick={() => handleServiceMethodSelect("office")}
          />
          <ServiceMethodButton
            selected={serviceMethod === "hotel_delivery"}
            title={tt.hotelAirbnbDelivery}
            icon={
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h11v11H3z" />
                <path d="M14 10h3.5L21 14v3h-7z" />
                <path d="M5.5 17a2 2 0 1 0 4 0M16.5 17a2 2 0 1 0 4 0" />
                <path d="M14 14h7" />
              </svg>
            }
            onClick={() => handleServiceMethodSelect("hotel_delivery")}
          />
        </div>
      </div>
      ) : null}

      {serviceMethod ? (
        <>
      {serviceMethod === "office" ? (
      <div className="mt-3 grid grid-cols-2 gap-2">
        <PlanButton
          selected={plan === "half"}
          title={tt.sameDayRental}
          oldPrice={activePricing.halfDayOldPrice}
          price={
            plan === "half" ? sameDayDynamicPrice : activePricing.halfDayPrice
          }
          needsChoice={needsPlanChoice}
          popular
          popularLabel={tt.mostPopular}
          onClick={() => handlePlanSelect("half")}
        />

        <PlanButton
          selected={plan === "full"}
          title={tt.fullDay}
          oldPrice={activePricing.fullDayOldPrice}
          price={activePricing.fullDayPricing[1]}
          subtitle={tt.multiDayDiscount}
          needsChoice={needsPlanChoice}
          onClick={() => handlePlanSelect("full")}
        />
      </div>
      ) : null}

      <div className="mt-3 rounded-[12px] border border-black/10 bg-black/[0.03] px-3 py-3">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-black/60">
          {tt.chooseQuantity}
        </div>

        <select
          value={String(quantity)}
          onChange={(event) => {
            setQuantity(Number(event.target.value));
            setAvailability(null);
            setNotice("");
          }}
          className="h-11 w-full rounded-[14px] border border-black/10 bg-white px-3 text-[13px] font-black text-black outline-none transition focus:border-black/30"
        >
          {quantityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <FieldButton
          label={tt.pickupDate}
          value={fmtDate(pickupDate, locale, tt.selectDate)}
          disabled={false}
          onClick={() =>
            plan ? openCalendar("pickup") : handleFieldWithoutPlan()
          }
        />

        <FieldButton
          label={tt.dropoffDate}
          value={
            plan === "half"
              ? fmtDate(pickupDate, locale, tt.selectDate)
              : fmtDate(dropoffDate, locale, tt.selectDate)
          }
          disabled={false}
          onClick={() =>
            plan ? openCalendar("dropoff") : handleFieldWithoutPlan()
          }
        />

        {serviceMethod === "office" ? (
          <>
        <TimeDropdown
          label={tt.pickupTime}
          value={pickupTime}
          options={pickupOptions}
          open={activeTimeField === "pickup"}
          disabled={!plan}
          onToggle={() => {
            if (!plan) {
              handleFieldWithoutPlan();
              return;
            }

            if (!pickupDate) {
              setNotice(tt.chooseDateFirst);
              return;
            }

            if (pickupOptions.length === 0) {
              setNotice(tt.noTimesToday);
              return;
            }

            setActiveTimeField((current) =>
              current === "pickup" ? null : "pickup"
            );
          }}
          onSelect={handlePickupTimeSelect}
        />

        <TimeDropdown
          label={tt.returnTime}
          value={returnTime}
          options={returnHalfOptions}
          open={activeTimeField === "return"}
          disabled={!plan || plan === "full"}
          onToggle={() => {
            if (!plan) {
              handleFieldWithoutPlan();
              return;
            }

            if (!pickupDate) {
              setNotice(tt.chooseDateFirst);
              return;
            }

            if (plan === "full") return;

            setActiveTimeField((current) =>
              current === "return" ? null : "return"
            );
          }}
          onSelect={handleReturnTimeSelect}
        />
          </>
        ) : null}
      </div>



      {winterOfficeScheduleActive && plan ? (
        <div className="mt-2 rounded-[13px] border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-4 text-sky-900">
          {tt.winterOfficeNotice}
        </div>
      ) : null}

      {isDeliveryService && pickupDate && dropoffDate ? (
        <div className="mt-3 rounded-[12px] border border-black/10 bg-black/[0.03] p-3">
          {serviceMethod === "airport_delivery" ? (
            <div className="mb-3 rounded-[14px] border border-black/10 bg-white px-3 py-2.5">
              <div className="text-[8px] font-black uppercase tracking-[0.16em] text-black/42">
                {tt.deliveryLocation}
              </div>
              <div className="mt-1 text-[12px] font-black text-black">
                {replaceTokens(tt.airportLocationFee, {
                  fee: AIRPORT_DELIVERY_FEE,
                })}
              </div>
              <div className="mt-3 text-[8px] font-black uppercase tracking-[0.16em] text-black/42">
                {tt.howReturnScooter}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAirportReturnMethod("office");
                    setDeliveryTimeConfirmed(false);
                    setDeliveryTimeModalOpen(false);
                  }}
                  className={[
                    "rounded-[12px] border px-2 py-2 text-[9px] font-black uppercase",
                    airportReturnMethod === "office"
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black",
                  ].join(" ")}
                >
                  {tt.returnOfficeFree}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAirportReturnMethod("hotel_delivery");
                    setDeliveryTimeConfirmed(false);
                    setDeliveryTimeModalOpen(false);
                  }}
                  className={[
                    "rounded-[12px] border px-2 py-2 text-[9px] font-black uppercase",
                    airportReturnMethod === "hotel_delivery"
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black",
                  ].join(" ")}
                >
                  {tt.hotelAirbnbCollection}
                </button>
              </div>
              {airportReturnMethod === "office" ? (
                <label className="mt-3 block text-[8px] font-black uppercase tracking-[0.14em] text-black/42">
                  {tt.officeReturnTime}
                  <select
                    value={officeReturnTime}
                    onChange={(event) => setOfficeReturnTime(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-[12px] border border-black/10 bg-white px-3 text-[11px] font-black text-black outline-none focus:border-black/30"
                  >
                    {buildOfficeTimeOptions(
                      dropoffDate || pickupDate || minBookableDate
                    ).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <div className="mt-2 text-[9px] font-bold leading-4 text-black/52">
                {tt.airportCollectionUnavailable}
              </div>
            </div>
          ) : null}

          {serviceMethod === "hotel_delivery" ||
          airportReturnMethod === "hotel_delivery" ? (
            <>
              <label className="block text-[8px] font-black uppercase tracking-[0.16em] text-black/42">
                {serviceMethod === "hotel_delivery"
                  ? tt.selectDeliveryArea
                  : tt.selectCollectionArea}
              </label>
              <DeliveryAreaPicker
                value={deliveryAreaId}
                attention={!deliveryAreaId}
                tt={tt}
                onChange={(nextAreaId) => {
                  setDeliveryAreaId(nextAreaId);
                  setDestinationKind(null);
                  setHotelName("");
                  setHotelRoom("");
                  setAirbnbAddress("");
                  setHotelSelection(null);
                  setAirbnbDetails(null);
                  setAccommodationModal(null);
                  setDeliveryTimeConfirmed(false);
                  setDeliveryTimeModalOpen(false);
                }}
              />

              {selectedDeliveryArea ? (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccommodationModal("hotel")}
                      className={[
                        "destination-choice-button group relative min-h-[52px] overflow-hidden rounded-[7px] border border-transparent px-3 py-3 text-[10px] font-black uppercase tracking-[0.05em] transition-[color,box-shadow,transform] duration-300",
                        !destinationKind ? "destination-choice-attention" : "",
                        destinationKind === "hotel"
                          ? "destination-choice-selected"
                          : "",
                      ].join(" ")}
                    >
                      <span
                        className="destination-choice-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                        aria-hidden="true"
                      />
                      <span className="relative">{tt.hotel}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccommodationModal("airbnb")}
                      className={[
                        "destination-choice-button group relative min-h-[52px] overflow-hidden rounded-[7px] border border-transparent px-3 py-3 text-[10px] font-black uppercase tracking-[0.05em] transition-[color,box-shadow,transform] duration-300",
                        !destinationKind ? "destination-choice-attention" : "",
                        destinationKind === "airbnb"
                          ? "destination-choice-selected"
                          : "",
                      ].join(" ")}
                    >
                      <span
                        className="destination-choice-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
                        aria-hidden="true"
                      />
                      <span className="relative">{tt.airbnbAddressOption}</span>
                    </button>
                  </div>

                  {destinationKind === "hotel" && hotelSelection ? (
                    <div className="mt-2 flex items-start justify-between gap-3 rounded-[8px] border border-black/10 bg-white p-3">
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-black text-black">
                          {hotelSelection.name}
                        </div>
                        <div className="mt-1 line-clamp-2 text-[9px] font-bold leading-4 text-black/48">
                          {hotelSelection.address}
                        </div>
                        {hotelRoom ? (
                          <div className="mt-1 text-[9px] font-black text-black/56">
                            {replaceTokens(tt.roomLabel, { room: hotelRoom })}
                          </div>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => setAccommodationModal("hotel")}
                        className="shrink-0 rounded-[6px] border border-black/12 px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] transition hover:bg-black hover:text-white active:scale-95"
                      >
                        {tt.edit}
                      </button>
                    </div>
                  ) : destinationKind === "airbnb" && airbnbDetails ? (
                    <div className="mt-2 flex items-start justify-between gap-3 rounded-[8px] border border-black/10 bg-white p-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-black">
                          {tt.airbnbPrivateAddressShort}
                        </div>
                        <div className="mt-1 line-clamp-3 text-[9px] font-bold leading-4 text-black/48">
                          {airbnbAddress}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAccommodationModal("airbnb")}
                        className="shrink-0 rounded-[6px] border border-black/12 px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] transition hover:bg-black hover:text-white active:scale-95"
                      >
                        {tt.edit}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {deliveryDetailsComplete ? (
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/10 pt-3">
              <div className="min-w-0">
                <div className="text-[8px] font-semibold uppercase tracking-[0.15em] text-black/42">
                  {tt.deliveryCollection}
                </div>
                <div className="mt-1 text-[12px] font-semibold text-black">
                  {deliveryTimeConfirmed
                    ? `${pickupTime} · ${returnTime}`
                    : tt.selectLiveTime}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeliveryTimeModalOpen(true)}
                className={[
                  "shrink-0 rounded-[7px] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition active:scale-95",
                  deliveryTimeConfirmed
                    ? "border border-black/12 bg-white text-black hover:bg-black hover:text-white"
                    : "bg-black text-white shadow-[0_8px_22px_rgba(0,0,0,0.18)] hover:bg-[#222]",
                ].join(" ")}
              >
                {deliveryTimeConfirmed ? tt.change : tt.chooseTime}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {plan === "full" && serviceMethod === "office" ? (
        <div className="mt-2 rounded-[13px] border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-[10.5px] font-black leading-4 text-emerald-700">
          {tt.sameDropoffTime}
        </div>
      ) : null}

      {notice ? (
        <div
          className={[
            "mt-3 rounded-[14px] border px-3 py-2 text-[11px] font-bold leading-5",
            noticeIsWarning
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-black/10 bg-black/[0.03] text-black/70",
          ].join(" ")}
        >
          {notice}
        </div>
      ) : null}

      {hasCompleteRentalSelection ? (
        <div
          className={[
            "mt-3 rounded-[16px] border px-3 py-2 text-[11px] font-bold leading-5",
            isUnavailable || quantityUnavailable
              ? "border-red-200 bg-red-50 text-red-700"
              : isCheckingAvailability
                ? "border-black/10 bg-black/[0.03] text-black/60"
                : availabilityConfirmed
                  ? "border-black/10 bg-black text-white"
                  : "border-black/10 bg-black/[0.03] text-black/60",
          ].join(" ")}
        >
          {isCheckingAvailability
            ? tt.checkingLive
            : isUnavailable
              ? tt.unavailableNotice
              : quantityUnavailable
                ? replaceTokens(tt.notEnoughQuantity, {
                    available: availability?.availableCount ?? 0,
                  })
                : availabilityConfirmed
                  ? replaceTokens(tt.availableCount, {
                      available: availability?.availableCount ?? quantity,
                    })
                  : availability?.ok === false
                    ? tt.availabilityError
                    : tt.confirmingAvailability}
        </div>
      ) : null}

      <div className="mt-3 rounded-[12px] border border-black/10 bg-black/[0.03] p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
              {tt.summary}
            </div>
            <div className="mt-1 truncate text-[13px] font-black text-black">
              {summaryText}
            </div>

            {hasDiscount ? (
              <div className="mt-1 text-[11px] font-black text-black/58">
                <span className="mr-2 text-black/35 line-through">
                  €{normalFullDayTotal}
                </span>
                <span>
                  {tt.nowPrice} €{rentalTotal}
                </span>
              </div>
            ) : null}

            {serviceFees > 0 ? (
              <div className="mt-1 text-[10px] font-bold text-black/52">
                {replaceTokens(tt.rentalDeliverySummary, {
                  rental: rentalTotal,
                  fees: serviceFees,
                })}
              </div>
            ) : isDeliveryService && deliveryDetailsComplete ? (
              <div className="mt-1 text-[10px] font-bold text-emerald-700">
                {tt.deliveryCollectionFree}
              </div>
            ) : null}
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
              {tt.total}
            </div>
            <div className="mt-0.5 text-[25px] font-black leading-none tracking-[-0.05em] text-black">
              {hasCompleteRentalSelection ? `€${finalTotal}` : "--"}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onProceed}
        disabled={!canCheckout}
        className={[
          "group relative mt-3 w-full overflow-hidden rounded-[9px] border border-transparent bg-black px-5 py-3.5 text-[13px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#222] active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-black/20 disabled:text-black/34",
          canCheckout ? "checkout-button-pulse" : "",
        ].join(" ")}
      >
        <span
          className="checkout-button-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0"
          aria-hidden="true"
        />
        <span className="relative">
          {isCheckingAvailability
            ? tt.checkingAvailability
            : isUnavailable || quantityUnavailable
              ? tt.notAvailable
              : availabilityConfirmed
                ? tt.checkout
                : tt.confirmingAvailability}
        </span>
      </button>

      {selectedDeliveryArea ? (
        <>
          <HotelSelectionModal
            open={accommodationModal === "hotel"}
            area={selectedDeliveryArea}
            locale={locale}
            tt={tt}
            initialSelection={hotelSelection}
            initialRoom={hotelRoom}
            onClose={() => setAccommodationModal(null)}
            onConfirm={(hotel, room) => {
              setHotelSelection(hotel);
              setHotelName(hotel.name);
              setHotelRoom(room);
              setAirbnbDetails(null);
              setAirbnbAddress("");
              setDestinationKind("hotel");
              setDeliveryTimeConfirmed(false);
              setAccommodationModal(null);
              window.setTimeout(() => setDeliveryTimeModalOpen(true), 90);
            }}
          />
          <AirbnbAddressModal
            open={accommodationModal === "airbnb"}
            area={selectedDeliveryArea}
            locale={locale}
            tt={tt}
            initialDetails={airbnbDetails}
            onClose={() => setAccommodationModal(null)}
            onConfirm={(details) => {
              setAirbnbDetails(details);
              setAirbnbAddress(details.formattedAddress);
              setHotelSelection(null);
              setHotelName("");
              setHotelRoom("");
              setDestinationKind("airbnb");
              setDeliveryTimeConfirmed(false);
              setAccommodationModal(null);
              window.setTimeout(() => setDeliveryTimeModalOpen(true), 90);
            }}
          />
        </>
      ) : null}

      {isDeliveryService &&
      pickupDate &&
      dropoffDate &&
      deliveryDetailsComplete ? (
        <DeliveryTimeModal
          open={deliveryTimeModalOpen}
          pickupDate={pickupDate}
          dropoffDate={dropoffDate}
          area={selectedDeliveryArea}
          vehicleId={checkoutVehicleId}
          vehicleName={vehicleName}
          fleetGroup={availabilityFleetGroup}
          quantity={quantity}
          plan={plan}
          value={pickupTime}
          collectionRequired={
            serviceMethod === "hotel_delivery" ||
            airportReturnMethod === "hotel_delivery"
          }
          rentalDropoffTime={returnTime}
          locale={locale}
          tt={tt}
          onClose={() => setDeliveryTimeModalOpen(false)}
          onConfirm={(value) => {
            setPickupTime(value);
            setDeliveryTimeConfirmed(true);
            setAvailability(null);
            setNotice("");
            setActiveTimeField(null);
            setDeliveryTimeModalOpen(false);
          }}
        />
      ) : null}

      <CalendarModal
        locale={locale}
        tt={tt}
        open={calendarOpen}
        plan={plan}
        activeField={activeDateField}
        pickupDate={pickupDate}
        dropoffDate={dropoffDate}
        minBookableDate={minBookableDate}
        viewMonth={viewMonth}
        notice={notice}
        noticeIsWarning={noticeIsWarning}
        deliveryWindowActive={isDeliveryService}
        onClose={() => setCalendarOpen(false)}
        onSetViewMonth={(month) => setViewMonth(startOfMonth(month))}
        onPick={handleCalendarPick}
        onConfirmDates={handleConfirmCalendarDates}
        isDateAllowed={isCalendarDateAllowed}
      />
        </>
      ) : null}
    </div>
  );
}
