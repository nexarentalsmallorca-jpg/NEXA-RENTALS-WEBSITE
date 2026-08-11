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
  | "sr"
  | "uk";
type AvailabilityFleetGroup = "piaggio_liberty_125" | "sym_symphony_125";

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

type BookingPanelCopy = {
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

const EN_COPY: BookingPanelCopy = {
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

const I18N: Record<Locale, BookingPanelCopy> = {
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

const DEFAULT_PICKUP_LOCATION = "NEXA Rentals, Magaluf";
const MAX_ONLINE_DAYS = 6;
const KYMCO_SKY_TOWN_PRICE_INCREASE = 10;

const PLAN_ATTENTION_ACTIVE_MS = 3000;
const PLAN_ATTENTION_REST_MS = 3000;
const PLAN_ATTENTION_RESTART_DELAY_MS = 20;

const SEASONAL_PRICING: SeasonalPricing[] = [
  {
    seasonName: "Winter",
    halfDayPrice: 35,
    halfDayOldPrice: 45,
    fullDayOldPrice: 55,
    fullDayPricing: { 1: 39, 2: 38, 3: 37, 4: 36, 5: 35, 6: 34 },
  },
  {
    seasonName: "Spring",
    halfDayPrice: 35,
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
    halfDayPrice: 35,
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

function getRate(days: number, pricing: SeasonalPricing) {
  return pricing.fullDayPricing[Math.min(Math.max(days, 1), MAX_ONLINE_DAYS)];
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

function buildTimeOptions(
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number
) {
  const result: string[] = [];
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  for (let minutes = start; minutes <= end; minutes += 30) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    result.push(`${hour}:${minute}`);
  }

  return result;
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
        "plan-choice-button relative min-h-[104px] overflow-visible rounded-[18px] border p-3 text-left transition-all duration-300 ease-out active:scale-[0.97]",
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
  onClose: () => void;
  onPick: (day: Date) => void;
  onConfirmDates: () => void;
  onSetViewMonth: (month: Date) => void;
  viewMonth: Date;
}) {
  const monthsScrollerRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

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
        const top = Math.max(0, item.offsetTop - 12);
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[5px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-[min(430px,calc(100vw-28px))] overflow-hidden rounded-[30px] border border-black/10 bg-white text-black shadow-[0_32px_110px_rgba(0,0,0,0.36)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-black/44">
              {activeField === "pickup" ? tt.pickupDate : tt.dropoffDate}
            </div>
            <div className="mt-1 text-[24px] font-black tracking-[-0.04em]">
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

        <div className="border-b border-black/10 px-5 py-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleMonthJump(-1)}
              className="rounded-full bg-black/[0.04] px-4 py-2 text-[13px] font-black transition hover:bg-black hover:text-white"
            >
              ←
            </button>

            <div className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-black/38">
              Scroll months
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

        {notice ? (
          <div
            className={[
              "mx-5 mt-3 rounded-[14px] border px-3 py-2 text-[11px] font-bold leading-5",
              noticeIsWarning
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-black/10 bg-black/[0.03] text-black/70",
            ].join(" ")}
          >
            {notice}
          </div>
        ) : null}

        <div
          ref={monthsScrollerRef}
          onScroll={handleCalendarScroll}
          className="calendar-months-scroll max-h-[430px] overflow-y-auto px-5 py-5"
        >
          <div className="space-y-6">
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

                      const disabled = unavailable;

                      return (
                        <button
                          key={toISODate(day)}
                          type="button"
                          disabled={disabled}
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
          <div className="border-t border-black/10 bg-white px-5 py-4">
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
    </div>
  );
}

export default function BookingPanelV3({
  vehicleName = "Piaggio Liberty 125",
  checkoutBasePath,
  onPricingChange,
}: BookingPanelV3Props) {
  const rawLocale = useLocale();
  const locale = normalizeLocale(rawLocale);
  const tt = I18N[locale] || I18N.en;
  const router = useRouter();

  const { checkoutVehicleId, availabilityFleetGroup, quantityOptions } =
    useMemo(() => getVehicleConfig(vehicleName), [vehicleName]);

  const minBookableDate = useMemo(() => startOfDay(new Date()), []);
  const sameDayPickupOptionsBase = useMemo(
    () => buildTimeOptions(9, 30, 19, 0),
    []
  );
  const fullPickupOptionsBase = useMemo(
    () => buildTimeOptions(9, 30, 20, 0),
    []
  );
  const returnHalfOptionsBase = useMemo(
    () => buildTimeOptions(10, 0, 20, 0),
    []
  );

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
  const [planAttention, setPlanAttention] = useState(false);
  const planAttentionActiveTimeoutRef = useRef<number | null>(null);
  const planAttentionRestTimeoutRef = useRef<number | null>(null);
  const planAttentionRestartTimeoutRef = useRef<number | null>(null);

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
    const base =
      plan === "half" ? sameDayPickupOptionsBase : fullPickupOptionsBase;
    return filterTimesForDate(base, pickupDate);
  }, [plan, sameDayPickupOptionsBase, fullPickupOptionsBase, pickupDate]);

  const returnHalfOptions = useMemo(() => {
    const pickupMinutes = timeToMinutes(pickupTime);

    return returnHalfOptionsBase.filter(
      (option) => timeToMinutes(option) > pickupMinutes
    );
  }, [returnHalfOptionsBase, pickupTime]);

  const returnDate = plan === "half" ? pickupDate : dropoffDate;
  const returnTime = plan === "half" ? halfReturnTime : pickupTime;

  const fullDayCount = useMemo(() => {
    if (plan !== "full" || !pickupDate || !dropoffDate) return 0;
    return Math.max(1, dayDiff(pickupDate, dropoffDate));
  }, [plan, pickupDate, dropoffDate]);

  const fullDayRate = useMemo(() => {
    if (plan !== "full" || !fullDayCount) {
      return activePricing.fullDayPricing[1];
    }

    return getRate(fullDayCount, activePricing);
  }, [plan, fullDayCount, activePricing]);

  const singleScooterTotal = useMemo(() => {
    if (plan === "half") return sameDayDynamicPrice;
    if (plan === "full" && fullDayCount > 0) return fullDayRate * fullDayCount;
    return 0;
  }, [plan, fullDayCount, fullDayRate, sameDayDynamicPrice]);

  const finalTotal = useMemo(() => {
    return singleScooterTotal * quantity;
  }, [singleScooterTotal, quantity]);

  const normalFullDayTotal = useMemo(() => {
    if (plan !== "full" || fullDayCount <= 1) return 0;
    return activePricing.fullDayPricing[1] * fullDayCount * quantity;
  }, [plan, fullDayCount, activePricing, quantity]);

  const hasDiscount =
    plan === "full" && fullDayCount > 1 && normalFullDayTotal > finalTotal;

  const hasCompleteRentalSelection = useMemo(() => {
    if (plan === "half") {
      return !!pickupDate && !!pickupTime && !!halfReturnTime && quantity >= 1;
    }

    if (plan === "full") {
      return (
        !!pickupDate &&
        !!dropoffDate &&
        fullDayCount >= 1 &&
        fullDayCount <= 6 &&
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
    plan,
    pickupDate,
    dropoffDate,
    pickupTime,
    halfReturnTime,
    quantity,
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

    if (field === "dropoff" && plan === "half") {
      setNotice("");
      setActiveDateField("pickup");
      setViewMonth(startOfMonth(pickupDate || minBookableDate));
      setCalendarOpen(true);
      return;
    }

    if (field === "dropoff" && !pickupDate) {
      setNotice(tt.chooseDateFirst);
      setActiveDateField("pickup");
      setViewMonth(startOfMonth(minBookableDate));
      setCalendarOpen(true);
      return;
    }

    setNotice("");
    setActiveTimeField(null);
    setActiveDateField(field);
    setViewMonth(
      startOfMonth(
        field === "pickup"
          ? pickupDate || minBookableDate
          : dropoffDate || pickupDate || minBookableDate
      )
    );
    setCalendarOpen(true);
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

    if (activeDateField === "pickup") {
      setPickupDate(day);
      setNotice("");
      setAvailability(null);
      setViewMonth(startOfMonth(day));

      const filteredOptions = filterTimesForDate(
        plan === "half" ? sameDayPickupOptionsBase : fullPickupOptionsBase,
        day
      );

      if (filteredOptions.length > 0) {
        setPickupTime(
          filteredOptions.includes("10:00") ? "10:00" : filteredOptions[0]
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

    if (days > MAX_ONLINE_DAYS) {
      setNotice(tt.maxOnline6);
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

    if (days > MAX_ONLINE_DAYS) {
      setNotice(tt.maxOnline6);
      setActiveDateField("dropoff");
      return;
    }

    setNotice("");
    setCalendarOpen(false);

    window.setTimeout(() => {
      setActiveTimeField("pickup");
    }, 140);
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
      pickupLocation: DEFAULT_PICKUP_LOCATION,
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
    <div className="nexa-booking-panel-v3 relative z-20 w-full rounded-[28px] border border-black/10 bg-white p-4 text-black shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <style jsx global>{`
        .nexa-booking-panel-v3 {
          max-width: 410px;
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
          border-radius: 21px;
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
          animation: checkoutPulse 1.9s ease-in-out infinite;
        }

        .checkout-button-pulse:hover {
          animation: none;
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

        @media (max-width: 767px) {
          .nexa-booking-panel-v3 {
            max-width: 100%;
            border-radius: 22px;
            padding: 12px;
          }

          .calendar-months-scroll {
            max-height: 62vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .checkout-button-pulse,
          .plan-needs-choice,
          .plan-needs-choice::before,
          .plan-needs-choice::after {
            animation: none !important;
          }
        }
      `}</style>

      <div className="rounded-[18px] border border-black/10 bg-black/[0.03] px-3 py-3">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/46">
          {tt.vehicle}
        </div>
        <div className="mt-0.5 truncate text-[15px] font-black text-black">
          {vehicleName}
        </div>
      </div>

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

      <div className="mt-3 rounded-[18px] border border-black/10 bg-black/[0.03] px-3 py-3">
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
      </div>

      {plan === "full" ? (
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

      <div className="mt-3 rounded-[18px] border border-black/10 bg-black/[0.03] p-3">
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
                  {tt.nowPrice} €{finalTotal}
                </span>
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
          "mt-3 w-full rounded-[16px] bg-black px-5 py-3.5 text-[13px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#222] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/34",
          canCheckout ? "checkout-button-pulse" : "",
        ].join(" ")}
      >
        {isCheckingAvailability
          ? tt.checkingAvailability
          : isUnavailable || quantityUnavailable
            ? tt.notAvailable
            : availabilityConfirmed
              ? tt.checkout
              : tt.confirmingAvailability}
      </button>

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
        onClose={() => setCalendarOpen(false)}
        onSetViewMonth={(month) => setViewMonth(startOfMonth(month))}
        onPick={handleCalendarPick}
        onConfirmDates={handleConfirmCalendarDates}
      />
    </div>
  );
}