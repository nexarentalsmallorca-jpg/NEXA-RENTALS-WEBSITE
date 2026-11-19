"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { useLocale } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type Props = {
  locale?: string;
};

type GuideQuestion = {
  question: string;
  answer: string;
  slug: string;
  linkText: string;
};

type GuideLocale = "en" | "es" | "de" | "fr" | "it" | "nl" | "pl" | "sv" | "da" | "no" | "pt" | "cs" | "uk";
const GUIDE_UI: Record<GuideLocale, { title: string; less: string; more: string; book: string; all: string; link: string }> = {
  "en": {
    "title": "Mallorca Scooter Rental Guide",
    "less": "Show less",
    "more": "See more questions",
    "book": "Book online now",
    "all": "View all guides",
    "link": "Read the full guide"
  },
  "es": {
    "title": "Guía de alquiler de scooters en Mallorca",
    "less": "Mostrar menos",
    "more": "Ver más preguntas",
    "book": "Reserva online ahora",
    "all": "Ver todas las guías",
    "link": "Leer la guía completa"
  },
  "de": {
    "title": "Ratgeber für Rollerverleih auf Mallorca",
    "less": "Weniger anzeigen",
    "more": "Weitere Fragen anzeigen",
    "book": "Jetzt online buchen",
    "all": "Alle Ratgeber ansehen",
    "link": "Vollständigen Ratgeber lesen"
  },
  "fr": {
    "title": "Guide de location de scooters à Majorque",
    "less": "Afficher moins",
    "more": "Voir plus de questions",
    "book": "Réserver en ligne",
    "all": "Voir tous les guides",
    "link": "Lire le guide complet"
  },
  "it": {
    "title": "Guida al noleggio scooter a Maiorca",
    "less": "Mostra meno",
    "more": "Altre domande",
    "book": "Prenota online ora",
    "all": "Vedi tutte le guide",
    "link": "Leggi la guida completa"
  },
  "nl": {
    "title": "Gids voor scooterhuur op Mallorca",
    "less": "Minder tonen",
    "more": "Meer vragen bekijken",
    "book": "Boek nu online",
    "all": "Alle gidsen bekijken",
    "link": "Lees de volledige gids"
  },
  "pl": {
    "title": "Poradnik wynajmu skuterów na Majorce",
    "less": "Pokaż mniej",
    "more": "Zobacz więcej pytań",
    "book": "Zarezerwuj online",
    "all": "Zobacz wszystkie poradniki",
    "link": "Przeczytaj cały poradnik"
  },
  "sv": {
    "title": "Guide till scooteruthyrning på Mallorca",
    "less": "Visa mindre",
    "more": "Visa fler frågor",
    "book": "Boka online nu",
    "all": "Visa alla guider",
    "link": "Läs hela guiden"
  },
  "da": {
    "title": "Guide til scooterleje på Mallorca",
    "less": "Vis mindre",
    "more": "Se flere spørgsmål",
    "book": "Book online nu",
    "all": "Se alle guider",
    "link": "Læs hele guiden"
  },
  "no": {
    "title": "Guide til scooterutleie på Mallorca",
    "less": "Vis mindre",
    "more": "Se flere spørsmål",
    "book": "Bestill på nett nå",
    "all": "Se alle guider",
    "link": "Les hele guiden"
  },
  "pt": {
    "title": "Guia de aluguer de scooters em Maiorca",
    "less": "Mostrar menos",
    "more": "Ver mais perguntas",
    "book": "Reserve online agora",
    "all": "Ver todos os guias",
    "link": "Ler o guia completo"
  },
  "cs": {
    "title": "Průvodce půjčením skútru na Mallorce",
    "less": "Zobrazit méně",
    "more": "Další otázky",
    "book": "Rezervovat online",
    "all": "Všechny průvodce",
    "link": "Přečíst celý průvodce"
  },
  "uk": {
    "title": "Посібник з оренди скутерів на Майорці",
    "less": "Показати менше",
    "more": "Більше запитань",
    "book": "Забронювати онлайн",
    "all": "Усі посібники",
    "link": "Читати повний посібник"
  }
};
const GUIDE_FAQ: Record<GuideLocale, { question: string; answer: string }[]> = {
  "es": [
    {
      "question": "¿Necesito carnet para alquilar un scooter de 125 cc en Mallorca?",
      "answer": "Sí. Necesitas un permiso A, A1, A2 o un permiso B de coche con al menos 3 años de antigüedad."
    },
    {
      "question": "¿Puedo alquilar un scooter en Mallorca con carnet de coche?",
      "answer": "Sí, normalmente con un permiso B de al menos 3 años. Debes presentar el carnet físico original."
    },
    {
      "question": "¿Cuánto cuesta alquilar un scooter en Magaluf?",
      "answer": "El alquiler empieza en 39 € por el mismo día y 49 € por 24 horas. Hay mejores precios para varios días."
    },
    {
      "question": "¿Cuál es la fianza para alquilar un scooter en Mallorca?",
      "answer": "En NEXA Rentals, la fianza es de 150 € por scooter, aparte del alquiler. Se devuelve tras la entrega en buen estado."
    },
    {
      "question": "¿Qué documentos necesitan los turistas para alquilar un scooter en España?",
      "answer": "El carnet de conducir original, DNI o pasaporte y los datos de la reserva o pago. No bastan fotos ni copias del carnet."
    },
    {
      "question": "¿Dónde puedo alquilar un scooter cerca de Palmanova?",
      "answer": "NEXA Rentals está cerca de Palmanova, Magaluf, Torrenova, Cala Vinyes y Calvià, con reserva online y recogida en oficina."
    },
    {
      "question": "¿Dónde puedo alquilar un scooter cerca de la playa de Magaluf?",
      "answer": "Puedes alquilar un scooter de 125 cc con cascos, soporte de móvil, candado, baúl y kilómetros ilimitados incluidos."
    },
    {
      "question": "¿Se incluyen cascos en el alquiler de scooters en Mallorca?",
      "answer": "Sí. Incluimos dos cascos para que dos personas puedan descubrir Mallorca juntas."
    },
    {
      "question": "¿Pueden viajar dos personas en un scooter de 125 cc en Mallorca?",
      "answer": "Sí, si el conductor tiene el permiso adecuado y ambos llevan casco."
    },
    {
      "question": "¿Se incluye un baúl en el alquiler de scooters?",
      "answer": "Sí. Incluimos un baúl de 50 litros para cascos, bolsas y objetos pequeños."
    },
    {
      "question": "¿Es obligatorio reservar online un scooter en Magaluf?",
      "answer": "Reservar online es la forma más segura de garantizar tu scooter, sobre todo en verano."
    },
    {
      "question": "¿Es más barato alquilar un scooter durante 2, 3, 4 o 5 días?",
      "answer": "Sí. Los alquileres de varios días suelen ofrecer un precio diario más bajo."
    },
    {
      "question": "¿Qué es mejor en Mallorca: alquilar un scooter o un coche?",
      "answer": "Para playas, aparcamiento y trayectos cortos por Magaluf o Palmanova, el scooter suele ser más cómodo."
    },
    {
      "question": "¿Pueden los turistas alquilar una bicicleta eléctrica en Magaluf?",
      "answer": "Sí. Se pueden alquilar e-bikes para paseos locales y desplazamientos a la playa sin permiso de 125 cc."
    },
    {
      "question": "¿Qué lugares visitar en scooter desde Magaluf?",
      "answer": "Destacan Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous y Andratx."
    }
  ],
  "de": [
    {
      "question": "Brauche ich einen Führerschein für einen 125-ccm-Roller auf Mallorca?",
      "answer": "Ja. Du brauchst Klasse A, A1 oder A2 oder einen seit mindestens drei Jahren gültigen B-Führerschein."
    },
    {
      "question": "Kann ich mit einem Autoführerschein einen Roller auf Mallorca mieten?",
      "answer": "Ja, normalerweise mit Klasse B seit mindestens drei Jahren. Bringe den physischen Originalführerschein mit."
    },
    {
      "question": "Was kostet ein Roller in Magaluf?",
      "answer": "Die Miete beginnt bei 39 € am selben Tag und 49 € für 24 Stunden. Mehrtagesmieten sind günstiger pro Tag."
    },
    {
      "question": "Wie hoch ist die Kaution für einen Roller auf Mallorca?",
      "answer": "Bei NEXA Rentals beträgt die Kaution 150 € pro Roller, zusätzlich zur Miete. Nach ordnungsgemäßer Rückgabe wird sie erstattet."
    },
    {
      "question": "Welche Dokumente brauchen Touristen für eine Rollermiete in Spanien?",
      "answer": "Originalführerschein, Ausweis oder Reisepass und Buchungs- beziehungsweise Zahlungsdaten. Fotos oder Kopien reichen nicht."
    },
    {
      "question": "Wo kann ich nahe Palmanova einen Roller mieten?",
      "answer": "NEXA Rentals liegt nahe Palmanova, Magaluf, Torrenova, Cala Vinyes und Calvià. Online buchen und im Büro abholen."
    },
    {
      "question": "Wo kann ich nahe dem Strand von Magaluf einen Roller mieten?",
      "answer": "Miete einen 125-ccm-Roller mit Helmen, Handyhalter, Schloss, Topcase und unbegrenzten Kilometern."
    },
    {
      "question": "Sind Helme bei der Rollermiete auf Mallorca dabei?",
      "answer": "Ja. Zwei Helme sind für gemeinsame Fahrten inklusive."
    },
    {
      "question": "Dürfen zwei Personen einen 125-ccm-Roller fahren?",
      "answer": "Ja, wenn der Fahrer den richtigen Führerschein hat und beide einen Helm tragen."
    },
    {
      "question": "Ist ein Topcase im Mietpreis enthalten?",
      "answer": "Ja. Ein 50-Liter-Topcase für Helme, Strandtaschen und Kleinigkeiten ist inklusive."
    },
    {
      "question": "Ist eine Onlinebuchung in Magaluf erforderlich?",
      "answer": "Online zu buchen ist die sicherste Möglichkeit zur Reservierung, vor allem im Sommer."
    },
    {
      "question": "Ist eine Miete für mehrere Tage günstiger?",
      "answer": "Ja. Bei zwei bis fünf Tagen ist der Tagespreis üblicherweise niedriger."
    },
    {
      "question": "Roller oder Mietwagen: Was ist auf Mallorca besser?",
      "answer": "Für Strände, Parken und kurze Fahrten in Magaluf und Palmanova ist ein Roller oft praktischer."
    },
    {
      "question": "Können Touristen in Magaluf E-Bikes mieten?",
      "answer": "Ja. E-Bikes eignen sich für Strände und kurze Ausflüge ohne 125-ccm-Führerschein."
    },
    {
      "question": "Welche Orte kann ich von Magaluf aus per Roller besuchen?",
      "answer": "Beliebte Ziele sind Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous und Andratx."
    }
  ],
  "fr": [
    {
      "question": "Faut-il un permis pour louer un scooter 125 cm³ à Majorque ?",
      "answer": "Oui. Il faut un permis A, A1 ou A2, ou un permis B obtenu depuis au moins trois ans."
    },
    {
      "question": "Peut-on louer un scooter avec un permis voiture à Majorque ?",
      "answer": "Oui, normalement avec un permis B détenu depuis trois ans. Apportez le permis original physique."
    },
    {
      "question": "Combien coûte une location de scooter à Magaluf ?",
      "answer": "À partir de 39 € pour la journée et 49 € pour 24 heures, avec des tarifs journaliers réduits pour plusieurs jours."
    },
    {
      "question": "Quelle est la caution pour louer un scooter à Majorque ?",
      "answer": "Chez NEXA Rentals, la caution est de 150 € par scooter, en plus du prix de location, remboursée après un retour en bon état."
    },
    {
      "question": "Quels documents sont nécessaires aux touristes en Espagne ?",
      "answer": "Le permis de conduire original, une carte d’identité ou un passeport et les détails de réservation ou paiement. Les copies ne suffisent pas."
    },
    {
      "question": "Où louer un scooter près de Palmanova ?",
      "answer": "NEXA Rentals se trouve près de Palmanova, Magaluf, Torrenova, Cala Vinyes et Calvià. Réservation en ligne, retrait en agence."
    },
    {
      "question": "Où louer un scooter près de la plage de Magaluf ?",
      "answer": "Louez un 125 cm³ avec casques, support téléphone, antivol, top-case et kilométrage illimité."
    },
    {
      "question": "Les casques sont-ils inclus dans la location à Majorque ?",
      "answer": "Oui, deux casques sont inclus pour voyager à deux."
    },
    {
      "question": "Peut-on rouler à deux sur un scooter 125 cm³ ?",
      "answer": "Oui, si le conducteur possède le bon permis et si les deux personnes portent un casque."
    },
    {
      "question": "Un top-case est-il inclus dans la location ?",
      "answer": "Oui, un top-case de 50 litres est inclus pour casques, sacs et petits effets."
    },
    {
      "question": "Faut-il réserver en ligne à Magaluf ?",
      "answer": "La réservation en ligne est le moyen le plus sûr de réserver, surtout en été."
    },
    {
      "question": "La location pour plusieurs jours est-elle moins chère ?",
      "answer": "Oui, les locations de deux à cinq jours offrent généralement un meilleur tarif quotidien."
    },
    {
      "question": "Scooter ou voiture : que choisir à Majorque ?",
      "answer": "Pour les plages, le stationnement et les petits trajets autour de Magaluf, le scooter est souvent plus pratique."
    },
    {
      "question": "Les touristes peuvent-ils louer un vélo électrique à Magaluf ?",
      "answer": "Oui, les vélos électriques conviennent aux sorties locales sans permis 125 cm³."
    },
    {
      "question": "Quels lieux visiter en scooter depuis Magaluf ?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous et Andratx sont populaires."
    }
  ],
  "it": [
    {
      "question": "Serve la patente per noleggiare uno scooter 125 cc a Maiorca?",
      "answer": "Sì. Serve una patente A, A1, A2 oppure una patente B conseguita da almeno tre anni."
    },
    {
      "question": "Posso noleggiare uno scooter a Maiorca con la patente auto?",
      "answer": "Sì, generalmente con patente B da almeno tre anni. Porta la patente originale fisica."
    },
    {
      "question": "Quanto costa noleggiare uno scooter a Magaluf?",
      "answer": "Da 39 € per la stessa giornata e 49 € per 24 ore, con tariffe giornaliere migliori per più giorni."
    },
    {
      "question": "Qual è il deposito per noleggiare uno scooter a Maiorca?",
      "answer": "Da NEXA Rentals il deposito è di 150 € per scooter, separato dal prezzo, restituito dopo una riconsegna corretta."
    },
    {
      "question": "Quali documenti servono ai turisti in Spagna?",
      "answer": "Patente originale, documento d’identità o passaporto e dettagli della prenotazione o del pagamento. Le copie non bastano."
    },
    {
      "question": "Dove noleggiare uno scooter vicino a Palmanova?",
      "answer": "NEXA Rentals è vicino a Palmanova, Magaluf, Torrenova, Cala Vinyes e Calvià, con prenotazione online e ritiro in ufficio."
    },
    {
      "question": "Dove noleggiare uno scooter vicino alla spiaggia di Magaluf?",
      "answer": "Noleggia un 125 cc con caschi, supporto telefono, lucchetto, bauletto e chilometri illimitati."
    },
    {
      "question": "I caschi sono inclusi nel noleggio a Maiorca?",
      "answer": "Sì, includiamo due caschi per viaggiare in coppia."
    },
    {
      "question": "Possono viaggiare due persone su uno scooter 125 cc?",
      "answer": "Sì, se il conducente ha la patente corretta ed entrambi indossano il casco."
    },
    {
      "question": "Il bauletto è incluso nel noleggio?",
      "answer": "Sì, è incluso un bauletto da 50 litri per caschi, borse e piccoli oggetti."
    },
    {
      "question": "È necessario prenotare online a Magaluf?",
      "answer": "La prenotazione online è il modo più sicuro per riservare lo scooter, soprattutto in estate."
    },
    {
      "question": "Costa meno noleggiare per più giorni?",
      "answer": "Sì, i noleggi da due a cinque giorni hanno solitamente prezzi giornalieri migliori."
    },
    {
      "question": "Scooter o auto: cosa conviene a Maiorca?",
      "answer": "Per spiagge, parcheggi e brevi tragitti a Magaluf o Palmanova, lo scooter è spesso più pratico."
    },
    {
      "question": "I turisti possono noleggiare una e-bike a Magaluf?",
      "answer": "Sì, per passeggiate e gite in spiaggia senza patente per 125 cc."
    },
    {
      "question": "Quali luoghi visitare in scooter da Magaluf?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous e Andratx."
    }
  ],
  "nl": [
    {
      "question": "Heb ik een rijbewijs nodig voor een 125cc-scooter op Mallorca?",
      "answer": "Ja. Je hebt A, A1, A2 of een autorijbewijs B van minstens drie jaar nodig."
    },
    {
      "question": "Kan ik met een autorijbewijs een scooter huren op Mallorca?",
      "answer": "Ja, meestal met rijbewijs B van minimaal drie jaar. Neem het originele fysieke rijbewijs mee."
    },
    {
      "question": "Wat kost scooterhuur in Magaluf?",
      "answer": "Vanaf €39 voor dezelfde dag en €49 voor 24 uur. Bij meerdere dagen is de dagprijs lager."
    },
    {
      "question": "Hoe hoog is de borg voor een scooter op Mallorca?",
      "answer": "Bij NEXA Rentals is de borg €150 per scooter, los van de huurprijs. Na correcte inlevering krijg je deze terug."
    },
    {
      "question": "Welke documenten hebben toeristen nodig in Spanje?",
      "answer": "Het originele rijbewijs, identiteitskaart of paspoort en boekings- of betaalgegevens. Foto’s en kopieën zijn onvoldoende."
    },
    {
      "question": "Waar kan ik een scooter huren bij Palmanova?",
      "answer": "NEXA Rentals ligt dichtbij Palmanova, Magaluf, Torrenova, Cala Vinyes en Calvià. Online boeken, ophalen op kantoor."
    },
    {
      "question": "Waar huur ik een scooter bij het strand van Magaluf?",
      "answer": "Huur een 125cc-scooter inclusief helmen, telefoonhouder, slot, topkoffer en onbeperkte kilometers."
    },
    {
      "question": "Zijn helmen inbegrepen bij scooterhuur op Mallorca?",
      "answer": "Ja, twee helmen zijn inbegrepen voor ritten met twee personen."
    },
    {
      "question": "Mogen twee personen op een 125cc-scooter?",
      "answer": "Ja, als de bestuurder het juiste rijbewijs heeft en beiden een helm dragen."
    },
    {
      "question": "Is een topkoffer bij de huur inbegrepen?",
      "answer": "Ja, een topkoffer van 50 liter voor helmen en tassen is inbegrepen."
    },
    {
      "question": "Moet ik online boeken in Magaluf?",
      "answer": "Online reserveren is het veiligst, vooral in de zomer."
    },
    {
      "question": "Is meerdere dagen huren goedkoper?",
      "answer": "Ja, bij twee tot vijf dagen is de dagprijs doorgaans lager."
    },
    {
      "question": "Scooter of auto: wat is beter op Mallorca?",
      "answer": "Voor stranden, parkeren en korte ritten in Magaluf of Palmanova is een scooter vaak handiger."
    },
    {
      "question": "Kunnen toeristen een e-bike huren in Magaluf?",
      "answer": "Ja, voor lokale uitstapjes zonder 125cc-rijbewijs."
    },
    {
      "question": "Welke plekken bezoek je per scooter vanuit Magaluf?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous en Andratx."
    }
  ],
  "pl": [
    {
      "question": "Czy potrzebuję prawa jazdy na skuter 125 cm³ na Majorce?",
      "answer": "Tak. Wymagane jest A, A1, A2 lub prawo jazdy B posiadane od co najmniej trzech lat."
    },
    {
      "question": "Czy mogę wynająć skuter z prawem jazdy na samochód?",
      "answer": "Tak, zwykle z kategorią B od co najmniej trzech lat. Zabierz oryginalny dokument."
    },
    {
      "question": "Ile kosztuje wynajem skutera w Magaluf?",
      "answer": "Od 39 € za ten sam dzień i 49 € za 24 godziny. Przy kilku dniach stawka dzienna jest niższa."
    },
    {
      "question": "Ile wynosi kaucja za skuter na Majorce?",
      "answer": "W NEXA Rentals kaucja to 150 € za skuter, osobno od opłaty za wynajem. Jest zwracana po prawidłowym oddaniu."
    },
    {
      "question": "Jakich dokumentów potrzebują turyści w Hiszpanii?",
      "answer": "Oryginalnego prawa jazdy, dowodu lub paszportu oraz danych rezerwacji lub płatności. Zdjęcia i kopie nie wystarczą."
    },
    {
      "question": "Gdzie wynająć skuter blisko Palmanovy?",
      "answer": "NEXA Rentals znajduje się blisko Palmanovy, Magaluf, Torrenovy, Cala Vinyes i Calvià. Rezerwacja online, odbiór w biurze."
    },
    {
      "question": "Gdzie wynająć skuter przy plaży Magaluf?",
      "answer": "Wynajmij skuter 125 cm³ z kaskami, uchwytem na telefon, blokadą, kufrem i nielimitowanymi kilometrami."
    },
    {
      "question": "Czy kaski są wliczone w wynajem?",
      "answer": "Tak, w cenie są dwa kaski."
    },
    {
      "question": "Czy dwie osoby mogą jechać skuterem 125 cm³?",
      "answer": "Tak, gdy kierowca ma właściwe uprawnienia i obie osoby noszą kaski."
    },
    {
      "question": "Czy kufer jest wliczony w cenę?",
      "answer": "Tak, kufer o pojemności 50 litrów na kaski i torby jest wliczony."
    },
    {
      "question": "Czy trzeba rezerwować skuter online w Magaluf?",
      "answer": "Rezerwacja online to najpewniejszy sposób, szczególnie latem."
    },
    {
      "question": "Czy wynajem na kilka dni jest tańszy?",
      "answer": "Tak, przy wynajmie na dwa do pięciu dni stawka dzienna jest zwykle niższa."
    },
    {
      "question": "Skuter czy samochód: co wybrać na Majorce?",
      "answer": "Na plaże, parkingi i krótkie trasy wokół Magaluf lub Palmanovy skuter jest często wygodniejszy."
    },
    {
      "question": "Czy turyści mogą wynająć e-bike w Magaluf?",
      "answer": "Tak, na lokalne wycieczki bez uprawnień na skuter 125 cm³."
    },
    {
      "question": "Co warto zobaczyć skuterem z Magaluf?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous i Andratx."
    }
  ],
  "sv": [
    {
      "question": "Behöver jag körkort för en 125cc-skoter på Mallorca?",
      "answer": "Ja. Körkort A, A1, A2 eller B som du haft i minst tre år krävs."
    },
    {
      "question": "Kan jag hyra skoter med bilkörkort på Mallorca?",
      "answer": "Ja, normalt med B-körkort sedan minst tre år. Ta med originalkortet."
    },
    {
      "question": "Vad kostar skoterhyra i Magaluf?",
      "answer": "Från 39 € för samma dag och 49 € för 24 timmar. Flera dagar ger lägre dagspris."
    },
    {
      "question": "Hur stor är depositionen för en skoter?",
      "answer": "Hos NEXA Rentals är depositionen 150 € per skoter utöver hyran. Den återbetalas efter korrekt återlämning."
    },
    {
      "question": "Vilka dokument behöver turister i Spanien?",
      "answer": "Originalkörkort, ID eller pass samt boknings- eller betalningsuppgifter. Bilder och kopior räcker inte."
    },
    {
      "question": "Var hyr jag skoter nära Palmanova?",
      "answer": "NEXA Rentals finns nära Palmanova, Magaluf, Torrenova, Cala Vinyes och Calvià. Boka online och hämta på kontoret."
    },
    {
      "question": "Var hyr jag skoter nära Magalufs strand?",
      "answer": "Hyr en 125cc-skoter med hjälmar, mobilhållare, lås, toppbox och fria kilometer."
    },
    {
      "question": "Ingår hjälmar i skoterhyran på Mallorca?",
      "answer": "Ja, två hjälmar ingår."
    },
    {
      "question": "Kan två personer åka på samma 125cc-skoter?",
      "answer": "Ja, med rätt körkort för föraren och hjälm på båda."
    },
    {
      "question": "Ingår en toppbox?",
      "answer": "Ja, en toppbox på 50 liter för hjälmar och väskor ingår."
    },
    {
      "question": "Måste man boka skoter online i Magaluf?",
      "answer": "Onlinebokning är säkrast, särskilt under sommaren."
    },
    {
      "question": "Blir det billigare att hyra flera dagar?",
      "answer": "Ja, två till fem dagar ger normalt ett lägre dagspris."
    },
    {
      "question": "Skoter eller bil: vad är bäst på Mallorca?",
      "answer": "För stränder, parkering och korta turer kring Magaluf är skoter ofta enklare."
    },
    {
      "question": "Kan turister hyra elcykel i Magaluf?",
      "answer": "Ja, för lokala turer utan 125cc-körkort."
    },
    {
      "question": "Vilka platser kan jag besöka med skoter från Magaluf?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous och Andratx."
    }
  ],
  "da": [
    {
      "question": "Kræver det kørekort at leje en 125cc-scooter på Mallorca?",
      "answer": "Ja. Du skal have A, A1, A2 eller B-kørekort i mindst tre år."
    },
    {
      "question": "Kan jeg leje scooter med bilkørekort?",
      "answer": "Ja, normalt med B-kørekort i mindst tre år. Medbring det originale fysiske kort."
    },
    {
      "question": "Hvad koster scooterleje i Magaluf?",
      "answer": "Fra 39 € for samme dag og 49 € for 24 timer. Flere dage giver lavere dagspris."
    },
    {
      "question": "Hvor stort er depositummet for en scooter?",
      "answer": "Hos NEXA Rentals er depositummet 150 € pr. scooter ud over lejen. Det tilbagebetales efter korrekt aflevering."
    },
    {
      "question": "Hvilke dokumenter skal turister have i Spanien?",
      "answer": "Originalt kørekort, ID eller pas og booking- eller betalingsoplysninger. Fotos og kopier er ikke nok."
    },
    {
      "question": "Hvor kan jeg leje scooter tæt på Palmanova?",
      "answer": "NEXA Rentals ligger tæt på Palmanova, Magaluf, Torrenova, Cala Vinyes og Calvià. Book online og afhent på kontoret."
    },
    {
      "question": "Hvor kan jeg leje scooter ved Magaluf-stranden?",
      "answer": "Lej en 125cc-scooter med hjelme, telefonholder, lås, topboks og fri kilometer."
    },
    {
      "question": "Er hjelme inkluderet i scooterlejen?",
      "answer": "Ja, to hjelme er inkluderet."
    },
    {
      "question": "Må to personer køre på en 125cc-scooter?",
      "answer": "Ja, hvis føreren har det rigtige kørekort og begge bruger hjelm."
    },
    {
      "question": "Er topboks inkluderet?",
      "answer": "Ja, en topboks på 50 liter til hjelme og tasker er inkluderet."
    },
    {
      "question": "Skal scooter bookes online i Magaluf?",
      "answer": "Onlinebooking er den sikreste måde, især om sommeren."
    },
    {
      "question": "Er leje i flere dage billigere?",
      "answer": "Ja, to til fem dage giver normalt en bedre dagspris."
    },
    {
      "question": "Scooter eller bil: hvad er bedst på Mallorca?",
      "answer": "Til strande, parkering og korte ture ved Magaluf er scooter ofte nemmere."
    },
    {
      "question": "Kan turister leje elcykel i Magaluf?",
      "answer": "Ja, til lokale ture uden 125cc-kørekort."
    },
    {
      "question": "Hvor kan jeg køre hen fra Magaluf på scooter?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous og Andratx."
    }
  ],
  "no": [
    {
      "question": "Trenger jeg førerkort for en 125cc-scooter på Mallorca?",
      "answer": "Ja. Du trenger A, A1, A2 eller førerkort B som du har hatt i minst tre år."
    },
    {
      "question": "Kan jeg leie scooter med bilførerkort?",
      "answer": "Ja, normalt med klasse B i minst tre år. Ta med det originale fysiske førerkortet."
    },
    {
      "question": "Hva koster scooterleie i Magaluf?",
      "answer": "Fra 39 € samme dag og 49 € for 24 timer. Flere dager gir lavere døgnpris."
    },
    {
      "question": "Hvor stort er depositumet for en scooter?",
      "answer": "Hos NEXA Rentals er depositumet 150 € per scooter i tillegg til leien. Det tilbakebetales ved korrekt levering."
    },
    {
      "question": "Hvilke dokumenter trenger turister i Spania?",
      "answer": "Originalt førerkort, ID eller pass og bestillings- eller betalingsinformasjon. Bilder og kopier er ikke nok."
    },
    {
      "question": "Hvor kan jeg leie scooter nær Palmanova?",
      "answer": "NEXA Rentals ligger nær Palmanova, Magaluf, Torrenova, Cala Vinyes og Calvià. Bestill på nett og hent på kontoret."
    },
    {
      "question": "Hvor kan jeg leie scooter ved Magaluf-stranden?",
      "answer": "Lei en 125cc-scooter med hjelmer, mobilholder, lås, toppboks og ubegrenset kjørelengde."
    },
    {
      "question": "Er hjelmer inkludert i scooterleien?",
      "answer": "Ja, to hjelmer er inkludert."
    },
    {
      "question": "Kan to personer kjøre på samme 125cc-scooter?",
      "answer": "Ja, når føreren har riktig førerkort og begge bruker hjelm."
    },
    {
      "question": "Er toppboks inkludert?",
      "answer": "Ja, en toppboks på 50 liter til hjelmer og vesker er inkludert."
    },
    {
      "question": "Må jeg bestille scooter på nett i Magaluf?",
      "answer": "Nettbestilling er den sikreste måten å reservere på, spesielt om sommeren."
    },
    {
      "question": "Blir flere dagers leie billigere?",
      "answer": "Ja, to til fem dager gir vanligvis en lavere dagspris."
    },
    {
      "question": "Scooter eller bil: hva er best på Mallorca?",
      "answer": "For strender, parkering og korte turer rundt Magaluf er scooter ofte enklere."
    },
    {
      "question": "Kan turister leie elsykkel i Magaluf?",
      "answer": "Ja, for lokale turer uten 125cc-førerkort."
    },
    {
      "question": "Hvor kan jeg kjøre scooter fra Magaluf?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous og Andratx."
    }
  ],
  "pt": [
    {
      "question": "Preciso de carta para alugar uma scooter 125 cc em Maiorca?",
      "answer": "Sim. Precisa de carta A, A1, A2 ou carta B de automóvel há pelo menos três anos."
    },
    {
      "question": "Posso alugar scooter com carta de carro?",
      "answer": "Sim, normalmente com carta B há três anos. Traga o documento físico original."
    },
    {
      "question": "Quanto custa alugar uma scooter em Magaluf?",
      "answer": "Desde 39 € para o mesmo dia e 49 € por 24 horas. Vários dias oferecem preços diários melhores."
    },
    {
      "question": "Qual é a caução para alugar scooter em Maiorca?",
      "answer": "Na NEXA Rentals, a caução é 150 € por scooter, além do aluguer, devolvida após a entrega em boas condições."
    },
    {
      "question": "Quais documentos precisam os turistas em Espanha?",
      "answer": "Carta original, documento de identidade ou passaporte e dados da reserva ou pagamento. Fotos e cópias não chegam."
    },
    {
      "question": "Onde alugar scooter perto de Palmanova?",
      "answer": "A NEXA Rentals fica perto de Palmanova, Magaluf, Torrenova, Cala Vinyes e Calvià. Reserva online e recolha na loja."
    },
    {
      "question": "Onde alugar scooter perto da praia de Magaluf?",
      "answer": "Alugue uma 125 cc com capacetes, suporte de telemóvel, cadeado, top case e quilómetros ilimitados."
    },
    {
      "question": "Os capacetes estão incluídos no aluguer?",
      "answer": "Sim, dois capacetes estão incluídos."
    },
    {
      "question": "Duas pessoas podem andar numa scooter 125 cc?",
      "answer": "Sim, se o condutor tiver a carta certa e ambos usarem capacete."
    },
    {
      "question": "O top case está incluído?",
      "answer": "Sim, inclui um top case de 50 litros para capacetes e malas."
    },
    {
      "question": "É necessário reservar online em Magaluf?",
      "answer": "A reserva online é a forma mais segura de garantir a scooter, sobretudo no verão."
    },
    {
      "question": "Alugar por vários dias fica mais barato?",
      "answer": "Sim, entre dois e cinco dias costuma haver um preço diário melhor."
    },
    {
      "question": "Scooter ou carro: o que é melhor em Maiorca?",
      "answer": "Para praias, estacionamento e percursos curtos perto de Magaluf, a scooter é muitas vezes mais prática."
    },
    {
      "question": "Os turistas podem alugar e-bikes em Magaluf?",
      "answer": "Sim, para passeios locais sem carta de 125 cc."
    },
    {
      "question": "Que lugares visitar de scooter a partir de Magaluf?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous e Andratx."
    }
  ],
  "cs": [
    {
      "question": "Potřebuji řidičák na skútr 125 ccm na Mallorce?",
      "answer": "Ano. Je potřeba oprávnění A, A1, A2 nebo skupina B alespoň tři roky."
    },
    {
      "question": "Mohu si půjčit skútr s řidičákem na auto?",
      "answer": "Ano, obvykle se skupinou B starší tří let. Přineste originální fyzický průkaz."
    },
    {
      "question": "Kolik stojí půjčení skútru v Magalufu?",
      "answer": "Od 39 € na stejný den a 49 € na 24 hodin. Vícedenní půjčení má výhodnější denní cenu."
    },
    {
      "question": "Jaká je záloha na skútr na Mallorce?",
      "answer": "U NEXA Rentals je záloha 150 € za skútr navíc k půjčovnému. Po řádném vrácení se vrací."
    },
    {
      "question": "Jaké doklady potřebují turisté ve Španělsku?",
      "answer": "Originál řidičského průkazu, občanku nebo pas a údaje o rezervaci či platbě. Fotky nestačí."
    },
    {
      "question": "Kde si půjčit skútr poblíž Palmanovy?",
      "answer": "NEXA Rentals je blízko Palmanovy, Magalufu, Torrenovy, Cala Vinyes a Calvià. Rezervace online, vyzvednutí na pobočce."
    },
    {
      "question": "Kde půjčit skútr u pláže Magaluf?",
      "answer": "Půjčte si skútr 125 ccm s helmami, držákem telefonu, zámkem, kufrem a neomezenými kilometry."
    },
    {
      "question": "Jsou helmy v ceně půjčení?",
      "answer": "Ano, dvě helmy jsou zahrnuty."
    },
    {
      "question": "Mohou na skútru 125 ccm jet dva lidé?",
      "answer": "Ano, pokud má řidič správné oprávnění a oba nosí helmu."
    },
    {
      "question": "Je v ceně zadní kufr?",
      "answer": "Ano, kufr o objemu 50 litrů na helmy a tašky je v ceně."
    },
    {
      "question": "Musím si skútr v Magalufu rezervovat online?",
      "answer": "Online rezervace je nejjistější cestou, zvláště v létě."
    },
    {
      "question": "Je půjčení na více dní levnější?",
      "answer": "Ano, dva až pět dní obvykle přináší nižší cenu za den."
    },
    {
      "question": "Skútr nebo auto: co je na Mallorce lepší?",
      "answer": "Na pláže, parkování a krátké cesty v okolí Magalufu bývá skútr praktičtější."
    },
    {
      "question": "Mohou si turisté v Magalufu půjčit elektrokolo?",
      "answer": "Ano, na místní výlety bez oprávnění na skútr 125 ccm."
    },
    {
      "question": "Kam vyrazit na skútru z Magalufu?",
      "answer": "Palmanova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous a Andratx."
    }
  ],
  "uk": [
    {
      "question": "Чи потрібні права для оренди скутера 125 куб. см на Майорці?",
      "answer": "Так. Потрібні права A, A1, A2 або категорії B, отримані щонайменше три роки тому."
    },
    {
      "question": "Чи можна орендувати скутер з автомобільними правами?",
      "answer": "Так, зазвичай із категорією B від трьох років. Візьміть оригінал посвідчення."
    },
    {
      "question": "Скільки коштує оренда скутера в Магалуфі?",
      "answer": "Від 39 € на той самий день і 49 € на 24 години. На кілька днів денна ціна нижча."
    },
    {
      "question": "Яка застава за скутер на Майорці?",
      "answer": "У NEXA Rentals застава становить 150 € за скутер окремо від оренди. Її повертають після належного повернення."
    },
    {
      "question": "Які документи потрібні туристам в Іспанії?",
      "answer": "Оригінал водійського посвідчення, паспорт або ID та дані бронювання чи оплати. Фото або копій недостатньо."
    },
    {
      "question": "Де орендувати скутер біля Пальманови?",
      "answer": "NEXA Rentals поруч із Пальмановою, Магалуфом, Торреновою, Кала-Віньєс і Кальвією. Онлайн-бронювання й отримання в офісі."
    },
    {
      "question": "Де орендувати скутер біля пляжу Магалуф?",
      "answer": "Орендуйте 125-кубовий скутер з шоломами, тримачем телефона, замком, багажним кофром і безлімітним пробігом."
    },
    {
      "question": "Чи входять шоломи у вартість оренди?",
      "answer": "Так, два шоломи входять у вартість."
    },
    {
      "question": "Чи можуть двоє їхати на скутері 125 куб. см?",
      "answer": "Так, якщо водій має потрібні права й обидва в шоломах."
    },
    {
      "question": "Чи входить багажний кофр?",
      "answer": "Так, кофр на 50 літрів для шоломів і сумок входить у вартість."
    },
    {
      "question": "Чи потрібно бронювати скутер онлайн у Магалуфі?",
      "answer": "Онлайн-бронювання — найнадійніший спосіб, особливо влітку."
    },
    {
      "question": "Чи дешевше орендувати на кілька днів?",
      "answer": "Так, за два–п’ять днів денна ціна зазвичай нижча."
    },
    {
      "question": "Скутер чи авто: що краще на Майорці?",
      "answer": "Для пляжів, парковки й коротких поїздок біля Магалуфа скутер часто зручніший."
    },
    {
      "question": "Чи можуть туристи орендувати електровелосипед у Магалуфі?",
      "answer": "Так, для місцевих поїздок без прав на скутер 125 куб. см."
    },
    {
      "question": "Куди поїхати скутером із Магалуфа?",
      "answer": "Пальманова, Кала-Віньєс, Порталс-Вельс, Санта-Понса, Порталс-Ноус та Андрач."
    }
  ],
  "en": [
    {
      "question": "Do I need a licence to rent a 125cc scooter in Mallorca?",
      "answer": "Yes. To rent a 125cc scooter in Mallorca, you need an A, A1, A2 licence, or a B car licence held for at least 3 years."
    },
    {
      "question": "Can I rent a scooter in Mallorca with a car licence?",
      "answer": "Yes, but your B car licence must normally be at least 3 years old. You must bring the original physical licence card for pickup."
    },
    {
      "question": "How much does scooter rental cost in Magaluf?",
      "answer": "Scooter rental in Magaluf starts from €39 for same-day rental and €49 for 24 hours, with better daily prices for multi-day rentals."
    },
    {
      "question": "What is the deposit for scooter rental in Mallorca?",
      "answer": "At NEXA Rentals, the scooter deposit is €150 per scooter. It is separate from the rental price and returned after the scooter comes back safely."
    },
    {
      "question": "What documents do tourists need to rent a scooter in Spain?",
      "answer": "Tourists need the original driving licence, ID or passport, and the booking/payment details. Photos or copies of the licence are not enough."
    },
    {
      "question": "Where can I rent a scooter near Palma Nova?",
      "answer": "NEXA Rentals is based close to Palma Nova, Magaluf, Torrenova, Cala Vinyes, and Calvià, with online booking and easy office pickup."
    },
    {
      "question": "Where can I rent a scooter near Magaluf beach?",
      "answer": "You can rent a 125cc scooter near Magaluf beach with helmets, phone holder, security lock, top box, and unlimited kilometres included."
    },
    {
      "question": "Are helmets included with scooter rental in Mallorca?",
      "answer": "Yes. Our scooter rentals include 2 helmets, making it easier for couples and two riders to explore Mallorca together."
    },
    {
      "question": "Can two people ride one 125cc scooter in Mallorca?",
      "answer": "Yes. Two people can ride one 125cc scooter if the driver has the correct licence and both riders wear helmets."
    },
    {
      "question": "Is a top box included with scooter rental in Mallorca?",
      "answer": "Yes. NEXA Rentals includes a 50L top box, useful for helmets, beach bags, jackets, shopping bags, and small travel items."
    },
    {
      "question": "Is online booking required for scooter rental in Magaluf?",
      "answer": "Online booking is the safest way to reserve your scooter, especially in summer when availability can change quickly."
    },
    {
      "question": "Is scooter rental cheaper for 2, 3, 4, or 5 days?",
      "answer": "Yes. Multi-day scooter rental in Mallorca usually gives a better daily price, especially for tourists staying several days."
    },
    {
      "question": "What is better in Mallorca: scooter rental or car rental?",
      "answer": "For beaches, parking, short trips, and moving around Magaluf or Palma Nova, scooter rental is often easier than car rental."
    },
    {
      "question": "Can tourists rent an e-bike in Magaluf?",
      "answer": "Yes. Tourists can rent e-bikes in Magaluf for short routes, beach trips, and relaxed local exploring without needing a 125cc licence."
    },
    {
      "question": "What are the best places to visit by scooter from Magaluf?",
      "answer": "Popular routes include Palma Nova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous, Andratx, and southwest Mallorca viewpoints."
    }
  ]
};
function getGuideLocale(value: string): GuideLocale {
  const code = value.toLowerCase().split("-")[0];
  return Object.prototype.hasOwnProperty.call(GUIDE_UI, code) ? code as GuideLocale : "en";
}

const siteBaseUrl = "https://www.nexarentals.es";
const MOBILE_VISIBLE_GUIDE_COUNT = 5;

const guideQuestions: GuideQuestion[] = [
  {
    question: "Do I need a licence to rent a 125cc scooter in Mallorca?",
    answer:
      "Yes. To rent a 125cc scooter in Mallorca, you need an A, A1, A2 licence, or a B car licence held for at least 3 years.",
    slug: "125cc-scooter-rental-mallorca-licence-rules",
    linkText: "Read the full licence guide",
  },
  {
    question: "Can I rent a scooter in Mallorca with a car licence?",
    answer:
      "Yes, but your B car licence must normally be at least 3 years old. You must bring the original physical licence card for pickup.",
    slug: "rent-scooter-mallorca-with-car-licence",
    linkText: "Read the car licence guide",
  },
  {
    question: "How much does scooter rental cost in Magaluf?",
    answer:
      "Scooter rental in Magaluf starts from €39 for same-day rental and €49 for 24 hours, with better daily prices for multi-day rentals.",
    slug: "scooter-rental-magaluf-prices",
    linkText: "See scooter rental prices",
  },
  {
    question: "What is the deposit for scooter rental in Mallorca?",
    answer:
      "At NEXA Rentals, the scooter deposit is €150 per scooter. It is separate from the rental price and returned after the scooter comes back safely.",
    slug: "scooter-rental-mallorca-deposit",
    linkText: "Read the deposit guide",
  },
  {
    question: "What documents do tourists need to rent a scooter in Spain?",
    answer:
      "Tourists need the original driving licence, ID or passport, and the booking/payment details. Photos or copies of the licence are not enough.",
    slug: "documents-needed-to-rent-scooter-spain",
    linkText: "Check required documents",
  },
  {
    question: "Where can I rent a scooter near Palma Nova?",
    answer:
      "NEXA Rentals is based close to Palma Nova, Magaluf, Torrenova, Cala Vinyes, and Calvià, with online booking and easy office pickup.",
    slug: "scooter-rental-palma-nova",
    linkText: "Read the Palma Nova guide",
  },
  {
    question: "Where can I rent a scooter near Magaluf beach?",
    answer:
      "You can rent a 125cc scooter near Magaluf beach with helmets, phone holder, security lock, top box, and unlimited kilometres included.",
    slug: "scooter-rental-magaluf-beach",
    linkText: "Read the Magaluf guide",
  },
  {
    question: "Are helmets included with scooter rental in Mallorca?",
    answer:
      "Yes. Our scooter rentals include 2 helmets, making it easier for couples and two riders to explore Mallorca together.",
    slug: "are-helmets-included-scooter-rental-mallorca",
    linkText: "Read what is included",
  },
  {
    question: "Can two people ride one 125cc scooter in Mallorca?",
    answer:
      "Yes. Two people can ride one 125cc scooter if the driver has the correct licence and both riders wear helmets.",
    slug: "can-two-people-ride-125cc-scooter-mallorca",
    linkText: "Read the two-rider guide",
  },
  {
    question: "Is a top box included with scooter rental in Mallorca?",
    answer:
      "Yes. NEXA Rentals includes a 50L top box, useful for helmets, beach bags, jackets, shopping bags, and small travel items.",
    slug: "scooter-rental-mallorca-top-box-storage",
    linkText: "Read the storage guide",
  },
  {
    question: "Is online booking required for scooter rental in Magaluf?",
    answer:
      "Online booking is the safest way to reserve your scooter, especially in summer when availability can change quickly.",
    slug: "online-scooter-booking-magaluf",
    linkText: "Read the booking guide",
  },
  {
    question: "Is scooter rental cheaper for 2, 3, 4, or 5 days?",
    answer:
      "Yes. Multi-day scooter rental in Mallorca usually gives a better daily price, especially for tourists staying several days.",
    slug: "multi-day-scooter-rental-mallorca-discounts",
    linkText: "See multi-day discounts",
  },
  {
    question: "What is better in Mallorca: scooter rental or car rental?",
    answer:
      "For beaches, parking, short trips, and moving around Magaluf or Palma Nova, scooter rental is often easier than car rental.",
    slug: "scooter-rental-vs-car-rental-mallorca",
    linkText: "Compare scooter and car rental",
  },
  {
    question: "Can tourists rent an e-bike in Magaluf?",
    answer:
      "Yes. Tourists can rent e-bikes in Magaluf for short routes, beach trips, and relaxed local exploring without needing a 125cc licence.",
    slug: "e-bike-rental-magaluf-mallorca",
    linkText: "Read the e-bike guide",
  },
  {
    question: "What are the best places to visit by scooter from Magaluf?",
    answer:
      "Popular routes include Palma Nova, Cala Vinyes, Portals Vells, Santa Ponsa, Portals Nous, Andratx, and southwest Mallorca viewpoints.",
    slug: "best-places-to-visit-by-scooter-from-magaluf",
    linkText: "Explore scooter routes",
  },
];

export default function MallorcaScooterRentalGuideHub({ locale = "en" }: Props) {
  const activeLocale = getGuideLocale(useLocale());
  const text = GUIDE_UI[activeLocale];
  const localizedQuestions: GuideQuestion[] = guideQuestions.map((item, index) => ({
    ...item,
    question: GUIDE_FAQ[activeLocale][index]?.question ?? item.question,
    answer: GUIDE_FAQ[activeLocale][index]?.answer ?? item.answer,
    linkText: activeLocale === "en" ? item.linkText : text.link,
  }));
  const sectionRef = useRef<HTMLElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number>(-1);
  const [sectionInView, setSectionInView] = useState(false);
  const [animationRun, setAnimationRun] = useState(0);
  const [mobileGuideExpanded, setMobileGuideExpanded] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionInView(true);
          setAnimationRun((current) => current + 1);
        } else {
          setSectionInView(false);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${siteBaseUrl}/${locale}/#mallorca-scooter-rental-guide-faq`,
        mainEntity: localizedQuestions.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${siteBaseUrl}/${locale}/#mallorca-scooter-rental-guide-list`,
        name: text.title,
        itemListElement: localizedQuestions.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.question,
          url: `${siteBaseUrl}/${locale}/blog/${item.slug}`,
        })),
      },
    ],
  };

  return (
    <section
      ref={sectionRef}
      id="mallorca-scooter-rental-guide"
      aria-labelledby="mallorca-scooter-rental-guide-title"
      className={`${montserrat.className} bg-white px-4 py-12 text-black sm:px-6 lg:px-8 lg:py-16`}
      style={{ fontFamily: montserrat.style.fontFamily }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData).replace(/</g, "\\u003c"),
        }}
      />

      <style jsx>{`
        @keyframes guideQuestionReveal {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .guide-question-animate {
          opacity: 0;
          animation-name: guideQuestionReveal;
          animation-duration: 560ms;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: forwards;
        }

        .mobile-guide-more-button {
          position: relative;
          overflow: hidden;
        }

        .mobile-guide-more-button::after {
          content: "";
          position: absolute;
          inset: -80% auto -80% -55%;
          width: 34%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.8),
            transparent
          );
          opacity: 0.55;
          animation: mobileGuideMoreShine 2.4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes mobileGuideMoreShine {
          0% {
            left: -55%;
          }

          48%,
          100% {
            left: 125%;
          }
        }

        @media (max-width: 767px) {
          .mobile-guide-hidden {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .guide-question-animate,
          .mobile-guide-more-button::after {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <h2
          id="mallorca-scooter-rental-guide-title"
          className="mx-auto max-w-4xl text-center text-3xl font-black uppercase leading-[0.95] tracking-[-0.055em] text-black sm:text-5xl lg:text-[58px]"
        >
          {text.title}
        </h2>

        <div className="mt-10 grid gap-x-12 border-t border-black/10 sm:mt-12 lg:grid-cols-2">
          {localizedQuestions.map((item, index) => {
            const isOpen = openIndex === index;
            const number = String(index + 1).padStart(2, "0");
            const href = `/${locale}/blog/${item.slug}`;
            const delay = `${Math.min(index, 14) * 85}ms`;
            const shouldHideOnMobile =
              !mobileGuideExpanded && index >= MOBILE_VISIBLE_GUIDE_COUNT;

            return (
              <article
                key={`${animationRun}-${mobileGuideExpanded}-${item.slug}`}
                className={`border-b border-black/10 bg-white ${
                  sectionInView ? "guide-question-animate" : "opacity-0"
                } ${shouldHideOnMobile ? "mobile-guide-hidden" : ""}`}
                style={{
                  animationDelay: sectionInView ? delay : "0ms",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="group flex w-full items-center justify-between gap-5 bg-white py-4 text-left transition sm:py-[18px]"
                  aria-expanded={isOpen}
                  aria-controls={`guide-answer-${index}`}
                >
                  <span className="flex min-w-0 items-start gap-4">
                    <span className="mt-[3px] shrink-0 text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                      {number}
                    </span>

                    <span className="text-[14px] font-extrabold leading-snug tracking-[-0.025em] text-black sm:text-[15px] lg:text-[16px]">
                      {item.question}
                    </span>
                  </span>

                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.045] text-black transition duration-300 group-hover:bg-black group-hover:text-white ${
                      isOpen ? "rotate-180 bg-black text-white" : ""
                    }`}
                    aria-hidden
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                <div
                  id={`guide-answer-${index}`}
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-5 pl-[42px] pr-12">
                      <p className="max-w-2xl text-[13px] font-medium leading-6 tracking-[-0.01em] text-black/58 sm:text-sm">
                        {item.answer}
                      </p>

                      <Link
                        href={href}
                        className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:text-black/55"
                        aria-label={`${item.linkText}: ${item.question}`}
                      >
                        {item.linkText}
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-7 flex justify-center md:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileGuideExpanded((current) => !current);

              if (mobileGuideExpanded) {
                setOpenIndex(-1);
              }
            }}
            className="mobile-guide-more-button inline-flex min-h-[48px] items-center justify-center rounded-full bg-black px-7 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition active:scale-[0.97]"
            aria-expanded={mobileGuideExpanded}
            aria-controls="mallorca-scooter-rental-guide"
          >
            {mobileGuideExpanded ? text.less : text.more}
          </button>
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}#booking`}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-black px-7 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-black/85"
          >
            {text.book}
          </Link>

          <Link
            href={`/${locale}/blog`}
            className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-black/15 bg-white px-7 text-[10px] font-black uppercase tracking-[0.22em] text-black transition hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white"
          >
            {text.all}
          </Link>
        </div>
      </div>
    </section>
  );
}