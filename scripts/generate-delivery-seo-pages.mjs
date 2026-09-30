import fs from "node:fs";
import path from "node:path";

import {
  AREAS,
  LANGUAGES,
  routeFor,
  canonicalFor,
  hreflangFor,
} from "./delivery-seo-catalog.mjs";

const ROOT = process.cwd();

const APP_DIR = path.join(
  ROOT,
  "app"
);

const MASTER = path.join(
  APP_DIR,
  "[locale]",
  "scooter-delivery-santa-ponsa",
  "page.tsx"
);

/*
  IMPORTANT

  true  = SAFE TEST MODE
          NOTHING is created.

  false = actually create the pages.
*/
const DRY_RUN = false;

/*
  NEVER overwrite pages that already exist.
*/
const OVERWRITE = false;

/*
  Keep our approved English Santa Ponsa
  master page untouched.
*/
const PRESERVE_MASTER = true;

const LOCALES = [
  "en",
  "es",
  "de",
  "fr",
  "it",
];

function safeReplace(
  source,
  search,
  replacement
) {
  if (
    search instanceof RegExp
  ) {
    if (!search.test(source)) {
      return source;
    }

    return source.replace(
      search,
      replacement
    );
  }

  if (!source.includes(search)) {
    return source;
  }

  return source.replace(
    search,
    replacement
  );
}

function replaceAllLiteral(
  source,
  search,
  replacement
) {
  return source.split(search).join(
    replacement
  );
}

function tsString(value) {
  return JSON.stringify(value);
}

function pascalCase(value) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-zA-Z0-9]+(.)?/g,
      (_, chr) =>
        chr
          ? chr.toUpperCase()
          : ""
    )
    .replace(
      /^[a-z]/,
      (letter) =>
        letter.toUpperCase()
    );
}

function getLanguage(locale) {
  const language =
    LANGUAGES[locale];

  if (!language) {
    throw new Error(
      `Unsupported locale: ${locale}`
    );
  }

  return language;
}

function getTargetPath(
  locale,
  area
) {
  const language =
    getLanguage(locale);

  return path.join(
    APP_DIR,
    "[locale]",
    `${language.prefix}-${area.slug}`,
    "page.tsx"
  );
}

function relativePath(
  filePath
) {
  return path
    .relative(ROOT, filePath)
    .replaceAll("\\", "/");
}

function buildLanguageMenu(
  area
) {
  const rows =
    LOCALES.map(
      (locale) => {
        const language =
          getLanguage(locale);

        return `  {
    code: "${locale}",
    label: "${language.localeLabel}",
    short: "${language.short}",
    flagSrc: "${language.flag}",
    href: "${routeFor(
      locale,
      area
    )}",
  },`;
      }
    ).join("\n");

  return `const LANGUAGES = [
${rows}
] as const;`;
}

function buildMetadata(
  locale,
  area
) {
  const language =
    getLanguage(locale);

  const canonical =
    canonicalFor(
      locale,
      area
    );

  const hreflang =
    hreflangFor(area);

  const keywords =
    language.keywords(
      area.name,
      area.aliases || []
    );

  return `export const metadata: Metadata = {
  title: ${tsString(
    language.title(area.name)
  )},

  description:
    ${tsString(
      language.description(
        area.name
      )
    )},

  keywords: ${JSON.stringify(
    keywords,
    null,
    2
  )},

  alternates: {
    canonical:
      ${tsString(
        canonical
      )},

    languages:
      ${JSON.stringify(
        hreflang,
        null,
        2
      )},
  },

  openGraph: {
    title:
      ${tsString(
        language.ogTitle(
          area.name
        )
      )},

    description:
      ${tsString(
        language.description(
          area.name
        )
      )},

    url:
      ${tsString(
        canonical
      )},

    siteName:
      "NEXA Rentals",

    locale:
      ${tsString(
        language.ogLocale
      )},

    type:
      "website",

    images: [
      {
        url:
          "https://www.nexarentals.es/images/personscooter.jpg",

        width:
          1200,

        height:
          630,

        alt:
          ${tsString(
            `${area.name} 125cc scooter delivery with NEXA Rentals`
          )},
      },
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,
    },
  },
};`;
}

function getCopy(
  locale,
  area
) {
  const l =
    getLanguage(locale);

  const nearby =
    area.nearby || [];

  const nearbyText =
    nearby
      .slice(0, 4)
      .join(", ");

  if (
    locale === "en"
  ) {
    return {
      location:
        `${area.name}, Mallorca`,

      h1:
        `Scooter delivery to ${area.name} hotels & apartments.`,

      tagline:
        "125cc scooter delivery · Hotel & Airbnb · Easy online booking",

      desktopCta:
        "Check delivery & prices",

      mobileCta:
        "CHECK DELIVERY & PRICES",

      panelTitle:
        `Scooter delivery ${area.name}`,

      panelText:
        "125cc scooters · Hotel & Airbnb delivery · Office pickup available",

      trust:
        `125cc scooter delivery for visitors staying in ${area.name} and nearby Mallorca`,

      sectionLabel:
        `Scooter delivery ${area.name}`,

      mainH2:
        `An easier way to arrange a 125cc scooter in ${area.name}.`,

      intro1:
        `Staying in ${area.name} and want a 125cc scooter delivered to your hotel, Airbnb or apartment? NEXA Rentals lets you choose your scooter and rental dates online, then continue to the booking flow where Hotel / Airbnb Delivery can be selected when available.`,

      intro2:
        `A scooter is useful for beaches, restaurants, local journeys and exploring ${area.name}${
          nearbyText
            ? `, ${nearbyText}`
            : ""
        } and nearby Mallorca without depending on taxis or bus timetables.`,

      howTitle:
        `Arrange your ${area.name} scooter delivery in a few simple steps.`,

      step1Title:
        "Choose your 125cc scooter",

      step1Text:
        "Select your 125cc scooter and rental dates.",

      step2Title:
        "Select delivery or pickup",

      step2Text:
        "Continue through the booking flow and choose Hotel / Airbnb Delivery when available, or Office Pickup.",

      step3Title:
        "Receive or collect your scooter",

      step3Text:
        "Follow the booking instructions for your selected delivery or pickup option and start your trip.",

      seoH2:
        `Scooter delivery for visitors staying in ${area.name}.`,

      seoP1:
        `People searching for scooter delivery ${area.name}, hotel scooter delivery ${area.name}, Airbnb scooter delivery ${area.name} or 125cc scooter rental ${area.name} usually want a simple local booking option and a convenient way to receive their scooter.`,

      seoP2:
        `NEXA Rentals lets visitors staying in ${area.name}${
          nearbyText
            ? ` and nearby places such as ${nearbyText}`
            : ""
        } book online and choose the delivery or office pickup option shown for their dates.`,

      faqHeading:
        `Questions about scooter delivery in ${area.name}`,

      faq1Q:
        `Can you deliver a scooter to my hotel in ${area.name}?`,

      faq1A:
        `The booking flow shows the delivery options available for your reservation in ${area.name}. Choose Hotel / Airbnb Delivery when available, or Office Pickup in Magaluf.`,

      faq2Q:
        `Can I book ${area.name} scooter delivery online?`,

      faq2A:
        "Yes. Choose your 125cc scooter and rental dates online and continue through the NEXA Rentals booking system.",

      faq3Q:
        "What licence do I need for a 125cc scooter?",

      faq3A:
        "Licence requirements depend on the category and validity of your licence. Check the dedicated licence information before riding.",

      faq4Q:
        "What is included with the scooter?",

      faq4A:
        "The booking flow shows the equipment and rental conditions applicable to your selected scooter.",

      faq5Q:
        "Can I choose office pickup instead of delivery?",

      faq5A:
        "Yes. Office Pickup from NEXA Rentals in Magaluf remains available through the normal booking flow.",

      finalTitle:
        `Ready to arrange your ${area.name} scooter?`,

      finalText:
        "Choose your 125cc scooter online and check the available delivery or office pickup options.",

      bookNow:
        "Book now",

      contact:
        "Questions? Contact us",

      footer:
        "NEXA Rentals · 125cc Scooter Rental & Delivery in Mallorca",
    };
  }

  if (
    locale === "es"
  ) {
    return {
      location:
        `${area.name}, Mallorca`,

      h1:
        `Entrega de scooter en hoteles y apartamentos de ${area.name}.`,

      tagline:
        "Scooter 125cc · Entrega hotel & Airbnb · Reserva online",

      desktopCta:
        "Ver entrega y precios",

      mobileCta:
        "VER ENTREGA Y PRECIOS",

      panelTitle:
        `Entrega scooter ${area.name}`,

      panelText:
        "Scooters 125cc · Entrega hotel & Airbnb · Recogida disponible",

      trust:
        `Entrega de scooter 125cc para visitantes alojados en ${area.name} y zonas cercanas`,

      sectionLabel:
        `Entrega scooter ${area.name}`,

      mainH2:
        `Una forma sencilla de organizar tu scooter 125cc en ${area.name}.`,

      intro1:
        `¿Te alojas en ${area.name} y quieres recibir una scooter 125cc en tu hotel, Airbnb o apartamento? Con NEXA Rentals puedes elegir la scooter y las fechas online y continuar al proceso de reserva.`,

      intro2:
        `Una scooter es práctica para playas, restaurantes y desplazamientos por ${area.name}${
          nearbyText
            ? `, ${nearbyText}`
            : ""
        } y otras zonas cercanas de Mallorca.`,

      howTitle:
        `Organiza la entrega de tu scooter en ${area.name} en pocos pasos.`,

      step1Title:
        "Elige tu scooter 125cc",

      step1Text:
        "Selecciona tu scooter 125cc y las fechas del alquiler.",

      step2Title:
        "Elige entrega o recogida",

      step2Text:
        "Continúa la reserva y selecciona Entrega en Hotel / Airbnb cuando esté disponible, o Recogida en Oficina.",

      step3Title:
        "Recibe o recoge tu scooter",

      step3Text:
        "Sigue las instrucciones de tu reserva y empieza tu viaje.",

      seoH2:
        `Entrega de scooter para visitantes alojados en ${area.name}.`,

      seoP1:
        `Las búsquedas de entrega scooter ${area.name}, scooter hotel ${area.name}, scooter Airbnb ${area.name} o scooter 125cc ${area.name} suelen tener una intención clara de alquiler local y entrega.`,

      seoP2:
        `NEXA Rentals permite reservar online para ${area.name}${
          nearbyText
            ? ` y zonas próximas como ${nearbyText}`
            : ""
        }, con las opciones de entrega o recogida disponibles en la reserva.`,

      faqHeading:
        `Preguntas sobre entrega de scooter en ${area.name}`,

      faq1Q:
        `¿Podéis entregar una scooter en mi hotel de ${area.name}?`,

      faq1A:
        `El proceso de reserva muestra las opciones disponibles para ${area.name}. Puedes seleccionar Entrega Hotel / Airbnb cuando esté disponible.`,

      faq2Q:
        `¿Puedo reservar online la entrega de scooter en ${area.name}?`,

      faq2A:
        "Sí. Elige tu scooter 125cc y tus fechas y continúa con el sistema de reservas.",

      faq3Q:
        "¿Qué permiso necesito para una scooter 125cc?",

      faq3A:
        "Los requisitos dependen de la categoría y validez de tu permiso. Consulta la información de permiso antes de conducir.",

      faq4Q:
        "¿Qué incluye el alquiler?",

      faq4A:
        "El proceso de reserva muestra el equipamiento y condiciones de la scooter seleccionada.",

      faq5Q:
        "¿Puedo recoger la scooter en la oficina?",

      faq5A:
        "Sí. La Recogida en Oficina en Magaluf sigue disponible dentro del proceso normal de reserva.",

      finalTitle:
        `¿Listo para organizar tu scooter en ${area.name}?`,

      finalText:
        "Elige tu scooter 125cc online y consulta las opciones de entrega o recogida.",

      bookNow:
        "Reservar",

      contact:
        "¿Dudas? Contáctanos",

      footer:
        "NEXA Rentals · Alquiler y entrega de scooters 125cc en Mallorca",
    };
  }

  if (
    locale === "de"
  ) {
    return {
      location:
        `${area.name}, Mallorca`,

      h1:
        `Roller-Lieferung zu Hotels & Apartments in ${area.name}.`,

      tagline:
        "125cc Roller · Hotel & Airbnb Lieferung · Online buchen",

      desktopCta:
        "Lieferung & Preise",

      mobileCta:
        "LIEFERUNG & PREISE",

      panelTitle:
        `Roller Lieferung ${area.name}`,

      panelText:
        "125cc Roller · Hotel & Airbnb Lieferung · Büroabholung möglich",

      trust:
        `125cc Roller-Lieferservice für Gäste in ${area.name} und Umgebung`,

      sectionLabel:
        `Roller Lieferung ${area.name}`,

      mainH2:
        `Ein einfacher Weg, einen 125cc Roller in ${area.name} zu organisieren.`,

      intro1:
        `Du wohnst in ${area.name} und möchtest einen 125cc Roller zu deinem Hotel, Airbnb oder Apartment bekommen? Bei NEXA Rentals wählst du Roller und Mietdaten online und gehst anschließend zur Buchung.`,

      intro2:
        `Ein Roller eignet sich für Strände, Restaurants und Fahrten rund um ${area.name}${
          nearbyText
            ? `, ${nearbyText}`
            : ""
        } und weitere Orte auf Mallorca.`,

      howTitle:
        `Organisiere deine Roller-Lieferung nach ${area.name} in wenigen Schritten.`,

      step1Title:
        "125cc Roller wählen",

      step1Text:
        "Wähle deinen 125cc Roller und die Mietdaten.",

      step2Title:
        "Lieferung oder Abholung wählen",

      step2Text:
        "Wähle Hotel / Airbnb Lieferung, wenn verfügbar, oder Büroabholung.",

      step3Title:
        "Roller erhalten oder abholen",

      step3Text:
        "Folge den Buchungsinformationen und starte deine Fahrt.",

      seoH2:
        `Roller-Lieferung für Besucher in ${area.name}.`,

      seoP1:
        `Suchanfragen wie Roller Lieferung ${area.name}, Roller Hotel ${area.name}, Airbnb Roller ${area.name} oder 125cc Roller ${area.name} zeigen eine klare lokale Miet- und Lieferabsicht.`,

      seoP2:
        `NEXA Rentals ermöglicht die Online-Buchung für ${area.name}${
          nearbyText
            ? ` und nahe Orte wie ${nearbyText}`
            : ""
        } mit den verfügbaren Liefer- oder Abholoptionen.`,

      faqHeading:
        `Fragen zur Roller-Lieferung in ${area.name}`,

      faq1Q:
        `Könnt ihr einen Roller zu meinem Hotel in ${area.name} liefern?`,

      faq1A:
        `Im Buchungsprozess werden die verfügbaren Optionen für ${area.name} angezeigt. Hotel / Airbnb Lieferung kann gewählt werden, wenn verfügbar.`,

      faq2Q:
        `Kann ich die Roller-Lieferung nach ${area.name} online buchen?`,

      faq2A:
        "Ja. Wähle Roller und Mietdaten online und fahre mit der NEXA Rentals Buchung fort.",

      faq3Q:
        "Welchen Führerschein brauche ich für einen 125cc Roller?",

      faq3A:
        "Die Anforderungen hängen von Führerscheinklasse und Gültigkeit ab.",

      faq4Q:
        "Was ist bei der Miete enthalten?",

      faq4A:
        "Der Buchungsprozess zeigt Ausstattung und Bedingungen für den gewählten Roller.",

      faq5Q:
        "Kann ich den Roller im Büro abholen?",

      faq5A:
        "Ja. Büroabholung bei NEXA Rentals in Magaluf bleibt im normalen Buchungsprozess verfügbar.",

      finalTitle:
        `Bereit für deinen Roller in ${area.name}?`,

      finalText:
        "Wähle deinen 125cc Roller online und prüfe die verfügbaren Liefer- oder Abholoptionen.",

      bookNow:
        "Buchen",

      contact:
        "Fragen? Kontaktiere uns",

      footer:
        "NEXA Rentals · 125cc Roller-Vermietung & Lieferung auf Mallorca",
    };
  }

  if (
    locale === "fr"
  ) {
    return {
      location:
        `${area.name}, Majorque`,

      h1:
        `Livraison de scooter aux hôtels & appartements de ${area.name}.`,

      tagline:
        "Scooter 125cc · Livraison hôtel & Airbnb · Réservation en ligne",

      desktopCta:
        "Livraison & tarifs",

      mobileCta:
        "LIVRAISON & TARIFS",

      panelTitle:
        `Livraison scooter ${area.name}`,

      panelText:
        "Scooters 125cc · Livraison hôtel & Airbnb · Retrait possible",

      trust:
        `Livraison de scooter 125cc pour les visiteurs séjournant à ${area.name} et dans les environs`,

      sectionLabel:
        `Livraison scooter ${area.name}`,

      mainH2:
        `Une façon simple d’organiser votre scooter 125cc à ${area.name}.`,

      intro1:
        `Vous séjournez à ${area.name} et souhaitez recevoir un scooter 125cc à votre hôtel, Airbnb ou appartement ? Avec NEXA Rentals, choisissez votre scooter et vos dates en ligne puis poursuivez la réservation.`,

      intro2:
        `Un scooter est pratique pour les plages, restaurants et déplacements autour de ${area.name}${
          nearbyText
            ? `, ${nearbyText}`
            : ""
        } et d’autres secteurs de Majorque.`,

      howTitle:
        `Organisez la livraison de votre scooter à ${area.name} en quelques étapes.`,

      step1Title:
        "Choisissez votre scooter 125cc",

      step1Text:
        "Sélectionnez votre scooter 125cc et vos dates.",

      step2Title:
        "Choisissez livraison ou retrait",

      step2Text:
        "Choisissez Livraison Hôtel / Airbnb lorsqu’elle est disponible, ou Retrait à l’agence.",

      step3Title:
        "Recevez ou récupérez votre scooter",

      step3Text:
        "Suivez les instructions de votre réservation et commencez votre trajet.",

      seoH2:
        `Livraison de scooter pour les visiteurs à ${area.name}.`,

      seoP1:
        `Les recherches livraison scooter ${area.name}, scooter hôtel ${area.name}, scooter Airbnb ${area.name} ou scooter 125cc ${area.name} correspondent à une intention locale claire de location et de livraison.`,

      seoP2:
        `NEXA Rentals permet de réserver en ligne pour ${area.name}${
          nearbyText
            ? ` et les secteurs proches comme ${nearbyText}`
            : ""
        }, avec les options disponibles pour vos dates.`,

      faqHeading:
        `Questions sur la livraison de scooter à ${area.name}`,

      faq1Q:
        `Pouvez-vous livrer un scooter à mon hôtel à ${area.name} ?`,

      faq1A:
        `Le parcours de réservation affiche les options disponibles à ${area.name}. La Livraison Hôtel / Airbnb peut être choisie lorsqu’elle est disponible.`,

      faq2Q:
        `Puis-je réserver en ligne une livraison de scooter à ${area.name} ?`,

      faq2A:
        "Oui. Choisissez votre scooter 125cc et vos dates puis poursuivez la réservation NEXA Rentals.",

      faq3Q:
        "Quel permis faut-il pour un scooter 125cc ?",

      faq3A:
        "Les exigences dépendent de la catégorie et de la validité de votre permis.",

      faq4Q:
        "Qu’est-ce qui est inclus dans la location ?",

      faq4A:
        "Le parcours de réservation indique les équipements et conditions du scooter choisi.",

      faq5Q:
        "Puis-je choisir le retrait à l’agence ?",

      faq5A:
        "Oui. Le retrait à l’agence NEXA Rentals de Magaluf reste disponible dans le parcours de réservation.",

      finalTitle:
        `Prêt à organiser votre scooter à ${area.name} ?`,

      finalText:
        "Choisissez votre scooter 125cc en ligne et consultez les options de livraison ou de retrait.",

      bookNow:
        "Réserver",

      contact:
        "Questions ? Contactez-nous",

      footer:
        "NEXA Rentals · Location & livraison de scooters 125cc à Majorque",
    };
  }

  return {
    location:
      `${area.name}, Maiorca`,

    h1:
      `Consegna scooter a hotel & appartamenti di ${area.name}.`,

    tagline:
      "Scooter 125cc · Consegna hotel & Airbnb · Prenotazione online",

    desktopCta:
      "Consegna & prezzi",

    mobileCta:
      "CONSEGNA & PREZZI",

    panelTitle:
      `Consegna scooter ${area.name}`,

    panelText:
      "Scooter 125cc · Consegna hotel & Airbnb · Ritiro disponibile",

    trust:
      `Consegna scooter 125cc per chi soggiorna a ${area.name} e nelle zone vicine`,

    sectionLabel:
      `Consegna scooter ${area.name}`,

    mainH2:
      `Un modo semplice per organizzare uno scooter 125cc a ${area.name}.`,

    intro1:
      `Soggiorni a ${area.name} e vuoi ricevere uno scooter 125cc presso hotel, Airbnb o appartamento? Con NEXA Rentals scegli scooter e date online e continui nella prenotazione.`,

    intro2:
      `Uno scooter è utile per spiagge, ristoranti e spostamenti tra ${area.name}${
        nearbyText
          ? `, ${nearbyText}`
          : ""
      } e altre zone vicine di Maiorca.`,

    howTitle:
      `Organizza la consegna del tuo scooter a ${area.name} in pochi passaggi.`,

    step1Title:
      "Scegli il tuo scooter 125cc",

    step1Text:
      "Seleziona lo scooter 125cc e le date.",

    step2Title:
      "Scegli consegna o ritiro",

    step2Text:
      "Scegli Consegna Hotel / Airbnb quando disponibile, oppure Ritiro in sede.",

    step3Title:
      "Ricevi o ritira lo scooter",

    step3Text:
      "Segui le istruzioni della prenotazione e inizia il viaggio.",

    seoH2:
      `Consegna scooter per chi soggiorna a ${area.name}.`,

    seoP1:
      `Le ricerche consegna scooter ${area.name}, scooter hotel ${area.name}, scooter Airbnb ${area.name} o scooter 125cc ${area.name} indicano un chiaro intento locale di noleggio e consegna.`,

    seoP2:
      `NEXA Rentals consente di prenotare online per ${area.name}${
        nearbyText
          ? ` e zone vicine come ${nearbyText}`
          : ""
      }, scegliendo le opzioni disponibili per le date selezionate.`,

    faqHeading:
      `Domande sulla consegna scooter a ${area.name}`,

    faq1Q:
      `Potete consegnare uno scooter al mio hotel a ${area.name}?`,

    faq1A:
      `Il percorso di prenotazione mostra le opzioni disponibili per ${area.name}. La Consegna Hotel / Airbnb può essere scelta quando disponibile.`,

    faq2Q:
      `Posso prenotare online la consegna scooter a ${area.name}?`,

    faq2A:
      "Sì. Scegli il tuo scooter 125cc e le date e continua nel sistema NEXA Rentals.",

    faq3Q:
      "Quale patente serve per uno scooter 125cc?",

    faq3A:
      "I requisiti dipendono dalla categoria e dalla validità della patente.",

    faq4Q:
      "Cosa è incluso nel noleggio?",

    faq4A:
      "Il percorso di prenotazione mostra equipaggiamento e condizioni dello scooter scelto.",

    faq5Q:
      "Posso scegliere il ritiro in sede?",

    faq5A:
      "Sì. Il ritiro presso NEXA Rentals Magaluf resta disponibile nel normale percorso di prenotazione.",

    finalTitle:
      `Pronto a organizzare il tuo scooter a ${area.name}?`,

    finalText:
      "Scegli il tuo scooter 125cc online e controlla le opzioni di consegna o ritiro.",

    bookNow:
      "Prenota",

    contact:
      "Domande? Contattaci",

    footer:
      "NEXA Rentals · Noleggio & consegna scooter 125cc a Maiorca",
  };
}

function updateMetadata(
  source,
  locale,
  area
) {
  const newMetadata =
    buildMetadata(
      locale,
      area
    );

  const pattern =
    /export const metadata: Metadata = \{[\s\S]*?\n\};(?=\n\nexport default function)/;

  if (
    pattern.test(source)
  ) {
    return source.replace(
      pattern,
      newMetadata
    );
  }

  console.log(
    `WARNING metadata pattern not found for ${locale}/${area.slug}`
  );

  return source;
}

function updateLanguages(
  source,
  area
) {
  const block =
    buildLanguageMenu(area);

  const pattern =
    /const LANGUAGES = \[[\s\S]*?\] as const;/;

  if (
    pattern.test(source)
  ) {
    return source.replace(
      pattern,
      block
    );
  }

  console.log(
    `WARNING language block not found for ${area.slug}`
  );

  return source;
}

function replaceFirstTextBetween(
  source,
  startMarker,
  endMarker,
  newText
) {
  const start =
    source.indexOf(
      startMarker
    );

  if (
    start === -1
  ) {
    return source;
  }

  const contentStart =
    start +
    startMarker.length;

  const end =
    source.indexOf(
      endMarker,
      contentStart
    );

  if (
    end === -1
  ) {
    return source;
  }

  return (
    source.slice(
      0,
      contentStart
    ) +
    newText +
    source.slice(end)
  );
}

function transformPage(
  master,
  locale,
  area
) {
  const language =
    getLanguage(locale);

  const copy =
    getCopy(
      locale,
      area
    );

  let source =
    master;

  /*
    ROUTE COMMENT
  */
  source =
    source.replace(
      /^\/\/ app\/\[locale\]\/[^\n]+\n*/,
      `// app/[locale]/${language.prefix}-${area.slug}/page.tsx\n\n`
    );

  /*
    LANGUAGES
  */
  source =
    updateLanguages(
      source,
      area
    );

  /*
    METADATA
  */
  source =
    updateMetadata(
      source,
      locale,
      area
    );

  /*
    FUNCTION NAME
  */
  source =
    source.replace(
      /export default function [A-Za-z0-9_]+\(\)/,
      `export default function ${pascalCase(
        language.prefix
      )}${pascalCase(
        area.slug
      )}Page()`
    );

  /*
    CURRENT LANGUAGE
  */
  const languageIndex =
    LOCALES.indexOf(
      locale
    );

  source =
    source.replace(
      /const currentLanguage = LANGUAGES\[\d+\];/,
      `const currentLanguage = LANGUAGES[${languageIndex}];`
    );

  /*
    LOCAL STORAGE / RETURN PATH
  */
  source =
    source.replace(
      /nexa:scooter-delivery-[^":]+:reload-on-return/g,
      `nexa:${language.prefix}-${area.slug}:reload-on-return`
    );

  source =
    source.replace(
      /\/scooter-delivery-santa-ponsa/g,
      `/${language.prefix}-${area.slug}`
    );

  /*
    HERO H1
  */
  source =
    source.replace(
      /<h1>[\s\S]*?<\/h1>/,
      `<h1>${copy.h1}</h1>`
    );

  /*
    MOBILE LOCATION
  */
  source =
    source.replace(
      /<div className="nexa-mobile-location">[\s\S]*?<\/div>/,
      `<div className="nexa-mobile-location">${copy.location}</div>`
    );

  /*
    HERO TAGLINE
  */
  source =
    source.replace(
      /<p className="nexa-mobile-hero-tagline">[\s\S]*?<\/p>/,
      `<p className="nexa-mobile-hero-tagline">
              ${copy.tagline}
            </p>`
    );

  /*
    MAIN CTA
  */
  source =
    source.replace(
      /<span className="nexa-cta-desktop-label">[\s\S]*?<\/span>/,
      `<span className="nexa-cta-desktop-label">${copy.desktopCta}</span>`
    );

  source =
    source.replace(
      /<span className="nexa-cta-mobile-label">[\s\S]*?<\/span>/,
      `<span className="nexa-cta-mobile-label">${copy.mobileCta}</span>`
    );

  /*
    HERO TEXT PARAGRAPHS
  */
  const heroTextRegex =
    /<p className="nexa-hero-text">[\s\S]*?<\/p>/;

  source =
    source.replace(
      heroTextRegex,
      `<p className="nexa-hero-text">
              ${copy.intro1}
            </p>`
    );

  const heroSmallRegex =
    /<p className="nexa-hero-text small">[\s\S]*?<\/p>/;

  source =
    source.replace(
      heroSmallRegex,
      `<p className="nexa-hero-text small">
              ${copy.intro2}
            </p>`
    );

  /*
    ORANGE MOBILE PANEL
  */
  source =
    source.replace(
      /<div className="nexa-mobile-wave-copy">[\s\S]*?<\/div>/,
      `<div className="nexa-mobile-wave-copy">
              <strong>${copy.panelTitle}</strong>
              <span>${copy.panelText}</span>
            </div>`
    );

  /*
    TRUST SECTION
  */
  source =
    source.replace(
      /<section className="nexa-trust-section">[\s\S]*?<\/section>/,
      `<section className="nexa-trust-section">
        <p>${copy.trust}</p>

        <div className="nexa-trust-logos">
          <span>${copy.panelTitle}</span>
          <span>${area.name}</span>
          <span>125cc</span>
          <span>Hotel</span>
          <span>Airbnb</span>
        </div>
      </section>`
    );

  /*
    MOBILE CTA SECTION
  */
  source =
    source.replace(
      /<section className="nexa-mobile-action-section">[\s\S]*?<\/section>/,
      `<section className="nexa-mobile-action-section">
        <Link
          href={bookHref}
          className="nexa-mobile-main-cta"
        >
          ${copy.desktopCta}

          <span aria-hidden="true">
            →
          </span>
        </Link>

        <Link
          href={contactHref}
          className="nexa-mobile-contact-cta"
        >
          ${copy.contact}
        </Link>
      </section>`
    );

  /*
    MAIN CONTENT
  */
  source =
    source.replace(
      /<section className="nexa-content-section">[\s\S]*?<\/section>/,
      `<section className="nexa-content-section">
        <div className="nexa-content-grid">

          <article>

            <span className="nexa-section-label">
              ${copy.sectionLabel}
            </span>

            <h2>
              ${copy.mainH2}
            </h2>

            <p>
              ${copy.intro1}
            </p>

            <p>
              ${copy.intro2}
            </p>

          </article>

          <aside className="nexa-info-box">

            <h3>
              ${
                locale === "en"
                  ? "What you can get"
                  : locale === "es"
                  ? "Qué puedes obtener"
                  : locale === "de"
                  ? "Was du bekommst"
                  : locale === "fr"
                  ? "Ce que vous pouvez obtenir"
                  : "Cosa puoi ottenere"
              }
            </h3>

            <ul>
              <li>125cc</li>

              <li>
                ${
                  locale === "en"
                    ? "Online booking"
                    : locale === "es"
                    ? "Reserva online"
                    : locale === "de"
                    ? "Online-Buchung"
                    : locale === "fr"
                    ? "Réservation en ligne"
                    : "Prenotazione online"
                }
              </li>

              <li>
                Hotel / Airbnb
              </li>

              <li>
                ${
                  locale === "en"
                    ? "Office pickup available"
                    : locale === "es"
                    ? "Recogida en oficina disponible"
                    : locale === "de"
                    ? "Büroabholung verfügbar"
                    : locale === "fr"
                    ? "Retrait à l’agence disponible"
                    : "Ritiro in sede disponibile"
                }
              </li>

            </ul>

          </aside>

        </div>
      </section>`
    );

  /*
    HOW SECTION
  */
  source =
    source.replace(
      /<section className="nexa-how-section">[\s\S]*?<\/section>/,
      `<section className="nexa-how-section">

        <div className="nexa-how-inner">

          <span className="nexa-section-label">
            ${
              locale === "en"
                ? "How it works"
                : locale === "es"
                ? "Cómo funciona"
                : locale === "de"
                ? "So funktioniert es"
                : locale === "fr"
                ? "Comment ça marche"
                : "Come funziona"
            }
          </span>

          <h2>
            ${copy.howTitle}
          </h2>

          <div className="nexa-how-grid">

            <div>
              <span>01</span>

              <h3>
                ${copy.step1Title}
              </h3>

              <p>
                ${copy.step1Text}
              </p>
            </div>

            <div>
              <span>02</span>

              <h3>
                ${copy.step2Title}
              </h3>

              <p>
                ${copy.step2Text}
              </p>
            </div>

            <div>
              <span>03</span>

              <h3>
                ${copy.step3Title}
              </h3>

              <p>
                ${copy.step3Text}
              </p>
            </div>

          </div>

          <Link
            href={bookHref}
            className="nexa-bottom-cta"
          >
            ${copy.desktopCta}
          </Link>

        </div>

      </section>`
    );

  /*
    SEO SECTION
  */
  const keywordList =
    language.keywords(
      area.name,
      area.aliases || []
    )
    .slice(0, 10)
    .map(
      (keyword) =>
        `            <span>${keyword}</span>`
    )
    .join("\n");

  source =
    source.replace(
      /<section className="nexa-seo-text-section">[\s\S]*?<\/section>/,
      `<section className="nexa-seo-text-section">

        <div className="nexa-seo-text-inner">

          <span className="nexa-section-label">
            ${copy.sectionLabel}
          </span>

          <h2>
            ${copy.seoH2}
          </h2>

          <p>
            ${copy.seoP1}
          </p>

          <p>
            ${copy.seoP2}
          </p>

          <div className="nexa-keyword-cloud">

${keywordList}

          </div>

        </div>

      </section>`
    );

  /*
    FAQ SECTION
  */
  source =
    source.replace(
      /<section className="nexa-faq-section">[\s\S]*?<\/section>/,
      `<section className="nexa-faq-section">

        <div className="nexa-faq-inner">

          <span className="nexa-section-label">
            ${
              locale === "en"
                ? "Frequently asked questions"
                : locale === "es"
                ? "Preguntas frecuentes"
                : locale === "de"
                ? "Häufige Fragen"
                : locale === "fr"
                ? "Questions fréquentes"
                : "Domande frequenti"
            }
          </span>

          <h2>
            ${copy.faqHeading}
          </h2>

          <div className="nexa-faq-list">

            <details>

              <summary>
                ${copy.faq1Q}
              </summary>

              <p>
                ${copy.faq1A}
              </p>

            </details>

            <details>

              <summary>
                ${copy.faq2Q}
              </summary>

              <p>
                ${copy.faq2A}
              </p>

            </details>

            <details>

              <summary>
                ${copy.faq3Q}
              </summary>

              <p>
                ${copy.faq3A}
              </p>

            </details>

            <details>

              <summary>
                ${copy.faq4Q}
              </summary>

              <p>
                ${copy.faq4A}
              </p>

            </details>

            <details>

              <summary>
                ${copy.faq5Q}
              </summary>

              <p>
                ${copy.faq5A}
              </p>

            </details>

          </div>

          <div className="nexa-final-cta">

            <h3>
              ${copy.finalTitle}
            </h3>

            <p>
              ${copy.finalText}
            </p>

            <Link href={bookHref}>
              ${copy.desktopCta}
            </Link>

          </div>

        </div>

      </section>`
    );

  /*
    FOOTER
  */
  source =
    source.replace(
      /<p>NEXA Rentals ·[\s\S]*?<\/p>/,
      `<p>${copy.footer}</p>`
    );

  /*
    LANGUAGE ACTIVE STATE
  */
  source =
    source.replace(
      /language\.code === "en"/g,
      `language.code === "${locale}"`
    );

  /*
    IMG ALTS
  */
  source =
    source.replace(
      /alt="125cc scooter delivery [^"]+ with NEXA Rentals"/g,
      `alt="${area.name} 125cc scooter delivery with NEXA Rentals"`
    );

  source =
    source.replace(
      /alt="NEXA Rentals 125cc scooter for [^"]+ delivery"/g,
      `alt="NEXA Rentals 125cc scooter for ${area.name} delivery"`
    );

  /*
    REMOVE ANY OLD 50CC LANGUAGE
  */
  source =
    source.replace(
      /50cc\s*&amp;\s*125cc/gi,
      "125cc"
    );

  source =
    source.replace(
      /50cc\s*&\s*125cc/gi,
      "125cc"
    );

  source =
    source.replace(
      /50cc\s+and\s+125cc/gi,
      "125cc"
    );

  source =
    source.replace(
      /\b50cc\b/gi,
      "125cc"
    );

  return source;
}

/*
  START
*/

console.log("");

console.log(
  "=========================================="
);

console.log(
  "NEXA DELIVERY SEO GENERATOR"
);

console.log(
  "=========================================="
);

console.log("");

console.log(
  `Mode: ${
    DRY_RUN
      ? "DRY RUN - SAFE"
      : "WRITE MODE"
  }`
);

console.log(
  `Areas: ${AREAS.length}`
);

console.log(
  `Languages: ${LOCALES.length}`
);

console.log(
  `Total routes: ${
    AREAS.length *
    LOCALES.length
  }`
);

console.log("");

if (
  !fs.existsSync(MASTER)
) {
  console.error(
    "ERROR: MASTER PAGE NOT FOUND"
  );

  console.error(
    relativePath(MASTER)
  );

  process.exit(1);
}

const master =
  fs.readFileSync(
    MASTER,
    "utf8"
  );

let wouldCreate = 0;
let created = 0;
let protectedExisting = 0;
let preservedMaster = 0;
let failed = 0;

for (
  const area of AREAS
) {
  for (
    const locale of LOCALES
  ) {
    const target =
      getTargetPath(
        locale,
        area
      );

    /*
      Preserve approved master.
    */
    if (
      PRESERVE_MASTER &&
      locale === "en" &&
      area.slug ===
        "santa-ponsa"
    ) {
      preservedMaster += 1;

      console.log(
        `MASTER KEPT   ${relativePath(
          target
        )}`
      );

      continue;
    }

    /*
      Protect anything already existing.
    */
    if (
      fs.existsSync(target) &&
      !OVERWRITE
    ) {
      protectedExisting += 1;

      console.log(
        `PROTECTED     ${relativePath(
          target
        )}`
      );

      continue;
    }

    try {
      const output =
        transformPage(
          master,
          locale,
          area
        );

      if (
        !output.includes(
          area.name
        )
      ) {
        throw new Error(
          "Generated page does not contain area name."
        );
      }

      if (
        !output.includes(
          "125cc"
        )
      ) {
        throw new Error(
          "Generated page does not contain 125cc."
        );
      }

      if (
        DRY_RUN
      ) {
        wouldCreate += 1;

        console.log(
          `WOULD CREATE ${relativePath(
            target
          )}`
        );

        continue;
      }

      fs.mkdirSync(
        path.dirname(
          target
        ),
        {
          recursive:
            true,
        }
      );

      fs.writeFileSync(
        target,
        output,
        "utf8"
      );

      created += 1;

      console.log(
        `CREATED      ${relativePath(
          target
        )}`
      );
    } catch (
      error
    ) {
      failed += 1;

      console.log(
        `FAILED       ${relativePath(
          target
        )}`
      );

      console.log(
        error instanceof Error
          ? error.message
          : String(error)
      );
    }
  }
}

console.log("");

console.log(
  "=========================================="
);

console.log(
  "RESULT"
);

console.log(
  "=========================================="
);

console.log(
  `Would create:       ${wouldCreate}`
);

console.log(
  `Created:            ${created}`
);

console.log(
  `Protected existing: ${protectedExisting}`
);

console.log(
  `Preserved master:   ${preservedMaster}`
);

console.log(
  `Failed:             ${failed}`
);

console.log("");

if (
  DRY_RUN
) {
  console.log(
    "SAFE MODE: NO FILES WERE CREATED OR MODIFIED."
  );

  console.log("");

  console.log(
    "If Failed = 0, then change:"
  );

  console.log(
    "const DRY_RUN = true;"
  );

  console.log(
    "to:"
  );

  console.log(
    "const DRY_RUN = false;"
  );
}

console.log("");