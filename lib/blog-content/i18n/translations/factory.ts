import type { Locale } from "@/i18n/routing";
import type {
  BlogLocaleContent,
  BlogLocalePack,
} from "../helpers";

type LocalizedSection = {
  heading: string;
  focus: string;
};

type LocalizedFaq = {
  question: string;
  answer: string;
};

export type LocalizedPostSpec = {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription: string;
  excerpt: string;
  imageAlt: string;
  quickAnswer: string;
  sections: LocalizedSection[];
  faqs: LocalizedFaq[];
  ctaTitle: string;
  ctaText: string;
};

type BriefPostSpec = {
  id: string;
  slug: string;
  title: string;
  imageAlt: string;
  sections: LocalizedSection[];
};

type LocaleCopy = {
  meta: (title: string) => string;
  excerpt: (title: string) => string;
  quickAnswer: (title: string) => string;
  ctaTitle: string;
  ctaText: string;
  faqs: (title: string) => LocalizedFaq[];
};

const COPY: Record<Locale, LocaleCopy> = {
  en: {
    meta: (title) =>
      `${title} with NEXA Rentals Mallorca: practical prices, booking advice, licence checks and tourist tips for Magaluf.`,
    excerpt: (title) =>
      `Practical tourist guide to ${title.toLowerCase()} with NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} depends on your dates, licence, route and rental duration. NEXA Rentals helps visitors compare options, check availability and book online before arrival.`,
    ctaTitle: "Ready to book in Magaluf?",
    ctaText:
      "See available scooters and e-bikes on /en or ask the team a question through /en/contact.",
    faqs: (title) => [
      {
        question: `Is ${title.toLowerCase()} suitable for tourists?`,
        answer:
          "Yes. It is written for visitors staying in Magaluf, Palmanova and nearby Mallorca resorts.",
      },
      {
        question: "Should I book before arrival?",
        answer:
          "Yes, online booking is recommended in high season because popular scooters and e-bikes can sell out.",
      },
      {
        question: "What should I bring to pickup?",
        answer:
          "Bring your original driving licence when required, passport or ID, booking confirmation and a payment method for deposit or extras.",
      },
      {
        question: "Can NEXA Rentals help before I book?",
        answer:
          "Yes. Contact NEXA Rentals on WhatsApp or through /en/contact if you are unsure about licence rules, routes or availability.",
      },
    ],
  },

  es: {
    meta: (title) =>
      `${title} con NEXA Rentals Mallorca: precios, licencia, reserva online y consejos claros para turistas en Magaluf.`,
    excerpt: (title) =>
      `Guia practica para turistas sobre ${title.toLowerCase()} con NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} depende de tus fechas, licencia, ruta y duracion del alquiler. NEXA Rentals ayuda a comprobar disponibilidad, condiciones y reserva online antes de llegar.`,
    ctaTitle: "Listo para reservar en Magaluf?",
    ctaText:
      "Consulta scooters y e-bikes disponibles en /es o pregunta al equipo desde /es/contact.",
    faqs: (title) => [
      {
        question: `Es ${title.toLowerCase()} adecuado para turistas?`,
        answer:
          "Si. La guia esta pensada para visitantes alojados en Magaluf, Palmanova y otras zonas cercanas de Mallorca.",
      },
      {
        question: "Conviene reservar antes de llegar?",
        answer:
          "Si, en temporada alta la reserva online es recomendable porque los scooters y e-bikes mas solicitados pueden agotarse.",
      },
      {
        question: "Que debo llevar a la recogida?",
        answer:
          "Trae la licencia original cuando sea necesaria, pasaporte o DNI, confirmacion de reserva y metodo de pago para deposito o extras.",
      },
      {
        question: "Puede ayudar NEXA Rentals antes de reservar?",
        answer:
          "Si. Contacta por WhatsApp o desde /es/contact si tienes dudas sobre licencia, rutas o disponibilidad.",
      },
    ],
  },

  de: {
    meta: (title) =>
      `${title} mit NEXA Rentals Mallorca: Preise, Fuhrerschein, Online-Buchung und klare Tipps fur Touristen in Magaluf.`,
    excerpt: (title) =>
      `Praktischer Touristenratgeber zu ${title.toLowerCase()} mit NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} hangt von deinen Daten, deinem Fuhrerschein, der Route und der Mietdauer ab. NEXA Rentals hilft bei Verfugbarkeit, Bedingungen und Online-Buchung vor der Anreise.`,
    ctaTitle: "Bereit zur Buchung in Magaluf?",
    ctaText:
      "Sieh verfugbare Roller und E-Bikes unter /de oder frage das Team uber /de/contact.",
    faqs: (title) => [
      {
        question: `Ist ${title.toLowerCase()} fur Touristen geeignet?`,
        answer:
          "Ja. Der Ratgeber richtet sich an Gaste in Magaluf, Palmanova und den nahen Ferienorten Mallorcas.",
      },
      {
        question: "Sollte ich vor der Ankunft buchen?",
        answer:
          "Ja, in der Hochsaison ist Online-Buchung sinnvoll, weil beliebte Roller und E-Bikes ausgebucht sein konnen.",
      },
      {
        question: "Was muss ich zur Abholung mitbringen?",
        answer:
          "Bring den originalen Fuhrerschein, falls erforderlich, Reisepass oder Ausweis, Buchungsbestatigung und ein Zahlungsmittel fur Kaution oder Extras mit.",
      },
      {
        question: "Kann NEXA Rentals vor der Buchung helfen?",
        answer:
          "Ja. Kontaktiere NEXA Rentals per WhatsApp oder uber /de/contact, wenn du Fragen zu Fuhrerschein, Routen oder Verfugbarkeit hast.",
      },
    ],
  },

  fr: {
    meta: (title) =>
      `${title} avec NEXA Rentals Mallorca : prix, permis, reservation en ligne et conseils clairs pour touristes a Magaluf.`,
    excerpt: (title) =>
      `Guide pratique pour touristes sur ${title.toLowerCase()} avec NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} depend de vos dates, de votre permis, de votre itineraire et de la duree de location. NEXA Rentals aide a verifier disponibilites, conditions et reservation en ligne avant l'arrivee.`,
    ctaTitle: "Pret a reserver a Magaluf ?",
    ctaText:
      "Consultez les scooters et e-bikes disponibles sur /fr ou posez une question a l'equipe via /fr/contact.",
    faqs: (title) => [
      {
        question: `${title} convient-il aux touristes ?`,
        answer:
          "Oui. Ce guide s'adresse aux visiteurs loges a Magaluf, Palmanova et dans les stations proches de Majorque.",
      },
      {
        question: "Faut-il reserver avant l'arrivee ?",
        answer:
          "Oui, la reservation en ligne est conseillee en haute saison car les scooters et e-bikes populaires peuvent etre complets.",
      },
      {
        question: "Que dois-je apporter au retrait ?",
        answer:
          "Apportez le permis original si necessaire, passeport ou carte d'identite, confirmation de reservation et moyen de paiement pour depot ou extras.",
      },
      {
        question: "NEXA Rentals peut-il aider avant de reserver ?",
        answer:
          "Oui. Contactez NEXA Rentals sur WhatsApp ou via /fr/contact pour toute question de permis, itineraire ou disponibilite.",
      },
    ],
  },

  it: {
    meta: (title) =>
      `${title} con NEXA Rentals Mallorca: prezzi, patente, prenotazione online e consigli chiari per turisti a Magaluf.`,
    excerpt: (title) =>
      `Guida pratica per turisti su ${title.toLowerCase()} con NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} dipende da date, patente, itinerario e durata del noleggio. NEXA Rentals aiuta a verificare disponibilita, condizioni e prenotazione online prima dell'arrivo.`,
    ctaTitle: "Pronto a prenotare a Magaluf?",
    ctaText:
      "Consulta scooter ed e-bike disponibili su /it o fai una domanda al team da /it/contact.",
    faqs: (title) => [
      {
        question: `${title} e adatto ai turisti?`,
        answer:
          "Si. La guida e pensata per chi soggiorna a Magaluf, Palmanova e nelle localita vicine di Maiorca.",
      },
      {
        question: "Conviene prenotare prima dell'arrivo?",
        answer:
          "Si, in alta stagione la prenotazione online e consigliata perche scooter ed e-bike richiesti possono esaurirsi.",
      },
      {
        question: "Cosa devo portare al ritiro?",
        answer:
          "Porta la patente originale quando richiesta, passaporto o carta d'identita, conferma di prenotazione e metodo di pagamento per deposito o extra.",
      },
      {
        question: "NEXA Rentals puo aiutare prima di prenotare?",
        answer:
          "Si. Contatta NEXA Rentals su WhatsApp o da /it/contact per dubbi su patente, percorsi o disponibilita.",
      },
    ],
  },

  nl: {
    meta: (title) =>
      `${title} met NEXA Rentals Mallorca: prijzen, rijbewijs, online reserveren en duidelijke tips voor toeristen in Magaluf.`,
    excerpt: (title) =>
      `Praktische toeristische gids over ${title.toLowerCase()} met NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} hangt af van je data, rijbewijs, route en huurperiode. NEXA Rentals helpt bezoekers opties te vergelijken, beschikbaarheid te controleren en voor aankomst online te reserveren.`,
    ctaTitle: "Klaar om te reserveren in Magaluf?",
    ctaText:
      "Bekijk beschikbare scooters en e-bikes op /nl of stel het team een vraag via /nl/contact.",
    faqs: (title) => [
      {
        question: `Is ${title.toLowerCase()} geschikt voor toeristen?`,
        answer:
          "Ja. Deze gids is geschreven voor bezoekers die in Magaluf, Palmanova en nabijgelegen plaatsen op Mallorca verblijven.",
      },
      {
        question: "Moet ik voor aankomst reserveren?",
        answer:
          "Ja. Online reserveren wordt in het hoogseizoen aanbevolen, omdat populaire scooters en e-bikes uitverkocht kunnen raken.",
      },
      {
        question: "Wat moet ik meenemen bij het ophalen?",
        answer:
          "Neem indien vereist je originele rijbewijs, paspoort of identiteitskaart, reserveringsbevestiging en een betaalmiddel voor de borg of extra opties mee.",
      },
      {
        question: "Kan NEXA Rentals mij helpen voordat ik reserveer?",
        answer:
          "Ja. Neem via WhatsApp of /nl/contact contact op met NEXA Rentals als je vragen hebt over rijbewijsregels, routes of beschikbaarheid.",
      },
    ],
  },

  pl: {
    meta: (title) =>
      `${title} z NEXA Rentals Mallorca: ceny, prawo jazdy, rezerwacja online i praktyczne porady dla turystow w Magaluf.`,
    excerpt: (title) =>
      `Praktyczny przewodnik turystyczny o ${title.toLowerCase()} z NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} zalezy od terminu, prawa jazdy, trasy i okresu wynajmu. NEXA Rentals pomaga porownac opcje, sprawdzic dostepnosc i zarezerwowac online przed przyjazdem.`,
    ctaTitle: "Gotowy na rezerwacje w Magaluf?",
    ctaText:
      "Sprawdz dostepne skutery i rowery elektryczne na /pl lub skontaktuj sie z zespolem przez /pl/contact.",
    faqs: (title) => [
      {
        question: `Czy ${title.toLowerCase()} jest odpowiednie dla turystow?`,
        answer:
          "Tak. Ten przewodnik jest przeznaczony dla osob przebywajacych w Magaluf, Palmanova i pobliskich miejscowosciach na Majorce.",
      },
      {
        question: "Czy warto zarezerwowac przed przyjazdem?",
        answer:
          "Tak. W sezonie zalecana jest rezerwacja online, poniewaz popularne skutery i rowery elektryczne moga zostac wyprzedane.",
      },
      {
        question: "Co zabrac ze soba przy odbiorze?",
        answer:
          "Zabierz oryginalne prawo jazdy, jesli jest wymagane, paszport lub dowod osobisty, potwierdzenie rezerwacji i metode platnosci za kaucje lub dodatki.",
      },
      {
        question: "Czy NEXA Rentals moze pomoc przed rezerwacja?",
        answer:
          "Tak. Skontaktuj sie z NEXA Rentals przez WhatsApp lub /pl/contact, jesli masz pytania dotyczace prawa jazdy, tras lub dostepnosci.",
      },
    ],
  },

  sv: {
    meta: (title) =>
      `${title} med NEXA Rentals Mallorca: priser, korkort, onlinebokning och tydliga tips for turister i Magaluf.`,
    excerpt: (title) =>
      `Praktisk turistguide om ${title.toLowerCase()} med NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} beror pa datum, korkort, rutt och hyrestid. NEXA Rentals hjalper dig att kontrollera tillganglighet, villkor och onlinebokning fore ankomst.`,
    ctaTitle: "Redo att boka i Magaluf?",
    ctaText:
      "Se tillgangliga skotrar och elcyklar pa /sv eller stall en fraga till teamet via /sv/contact.",
    faqs: (title) => [
      {
        question: `Passar ${title.toLowerCase()} for turister?`,
        answer:
          "Ja. Guiden ar skriven for besokare i Magaluf, Palmanova och naraliggande orter pa Mallorca.",
      },
      {
        question: "Bor jag boka fore ankomst?",
        answer:
          "Ja, under hogsasong rekommenderas onlinebokning eftersom populara skotrar och elcyklar kan bli fullbokade.",
      },
      {
        question: "Vad ska jag ta med till upphamtningen?",
        answer:
          "Ta med originalkorkort nar det kravs, pass eller ID, bokningsbekraftelse och betalningsmedel for deposition eller tillagg.",
      },
      {
        question: "Kan NEXA Rentals hjalpa fore bokning?",
        answer:
          "Ja. Kontakta NEXA Rentals pa WhatsApp eller via /sv/contact om du ar osaker pa korkort, rutter eller tillganglighet.",
      },
    ],
  },

  da: {
    meta: (title) =>
      `${title} med NEXA Rentals Mallorca: priser, korekort, onlinebooking og praktiske tips til turister i Magaluf.`,
    excerpt: (title) =>
      `Praktisk turistguide om ${title.toLowerCase()} med NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} afhaenger af dine datoer, dit korekort, din rute og lejeperioden. NEXA Rentals hjaelper med at sammenligne muligheder, kontrollere tilgaengelighed og booke online inden ankomst.`,
    ctaTitle: "Klar til at booke i Magaluf?",
    ctaText:
      "Se tilgaengelige scootere og elcykler pa /da eller kontakt teamet via /da/contact.",
    faqs: (title) => [
      {
        question: `Er ${title.toLowerCase()} egnet til turister?`,
        answer:
          "Ja. Guiden er skrevet til besogende, der bor i Magaluf, Palmanova og naerliggende ferieomrader pa Mallorca.",
      },
      {
        question: "Bor jeg booke inden ankomst?",
        answer:
          "Ja. Onlinebooking anbefales i hojsaesonen, da populaere scootere og elcykler kan blive udsolgt.",
      },
      {
        question: "Hvad skal jeg medbringe ved afhentning?",
        answer:
          "Medbring dit originale korekort, nar det kraeves, pas eller ID, bookingbekraeftelse og en betalingsmetode til depositum eller ekstraudstyr.",
      },
      {
        question: "Kan NEXA Rentals hjaelpe inden booking?",
        answer:
          "Ja. Kontakt NEXA Rentals pa WhatsApp eller via /da/contact, hvis du har sporgsmal om korekort, ruter eller tilgaengelighed.",
      },
    ],
  },

  no: {
    meta: (title) =>
      `${title} med NEXA Rentals Mallorca: priser, forerkort, nettbestilling og praktiske tips for turister i Magaluf.`,
    excerpt: (title) =>
      `Praktisk turistguide om ${title.toLowerCase()} med NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} avhenger av datoene dine, forerkortet, ruten og leieperioden. NEXA Rentals hjelper besokende med a sammenligne alternativer, sjekke tilgjengelighet og bestille pa nett for ankomst.`,
    ctaTitle: "Klar til a bestille i Magaluf?",
    ctaText:
      "Se tilgjengelige scootere og elsykler pa /no eller kontakt teamet via /no/contact.",
    faqs: (title) => [
      {
        question: `Er ${title.toLowerCase()} egnet for turister?`,
        answer:
          "Ja. Guiden er skrevet for besokende som bor i Magaluf, Palmanova og naerliggende feriesteder pa Mallorca.",
      },
      {
        question: "Bor jeg bestille for ankomst?",
        answer:
          "Ja. Nettbestilling anbefales i hoysesongen fordi populaere scootere og elsykler kan bli utsolgt.",
      },
      {
        question: "Hva ma jeg ta med ved henting?",
        answer:
          "Ta med originalt forerkort nar det kreves, pass eller ID, bestillingsbekreftelse og betalingsmetode for depositum eller tillegg.",
      },
      {
        question: "Kan NEXA Rentals hjelpe for bestilling?",
        answer:
          "Ja. Kontakt NEXA Rentals pa WhatsApp eller via /no/contact hvis du har sporsmal om forerkort, ruter eller tilgjengelighet.",
      },
    ],
  },

  pt: {
    meta: (title) =>
      `${title} com a NEXA Rentals Mallorca: precos, carta, reserva online e conselhos claros para turistas em Magaluf.`,
    excerpt: (title) =>
      `Guia pratico para turistas sobre ${title.toLowerCase()} com a NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} depende das datas, carta, percurso e duracao do aluguer. A NEXA Rentals ajuda a confirmar disponibilidade, condicoes e reserva online antes da chegada.`,
    ctaTitle: "Pronto para reservar em Magaluf?",
    ctaText:
      "Veja scooters e e-bikes disponiveis em /pt ou fale com a equipa em /pt/contact.",
    faqs: (title) => [
      {
        question: `${title} e adequado para turistas?`,
        answer:
          "Sim. O guia foi escrito para visitantes em Magaluf, Palmanova e outras zonas proximas de Maiorca.",
      },
      {
        question: "Devo reservar antes de chegar?",
        answer:
          "Sim, na epoca alta a reserva online e recomendada porque as scooters e e-bikes mais procuradas podem esgotar.",
      },
      {
        question: "O que devo levar para o levantamento?",
        answer:
          "Traga a carta original quando necessaria, passaporte ou documento de identidade, confirmacao da reserva e metodo de pagamento para caucao ou extras.",
      },
      {
        question: "A NEXA Rentals pode ajudar antes da reserva?",
        answer:
          "Sim. Contacte por WhatsApp ou em /pt/contact se tiver duvidas sobre carta, percursos ou disponibilidade.",
      },
    ],
  },

  sr: {
    meta: (title) =>
      `${title} uz NEXA Rentals Mallorca: cene, vozacka dozvola, onlajn rezervacija i prakticni saveti za turiste u Magalufu.`,
    excerpt: (title) =>
      `Praktican turisticki vodic za ${title.toLowerCase()} uz NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} zavisi od datuma, vozacke dozvole, rute i trajanja najma. NEXA Rentals pomaze posetiocima da uporede opcije, provere dostupnost i rezervisu onlajn pre dolaska.`,
    ctaTitle: "Spremni za rezervaciju u Magalufu?",
    ctaText:
      "Pogledajte dostupne skutere i elektricne bicikle na /sr ili kontaktirajte tim preko /sr/contact.",
    faqs: (title) => [
      {
        question: `Da li je ${title.toLowerCase()} pogodno za turiste?`,
        answer:
          "Da. Vodic je namenjen posetiocima koji borave u Magalufu, Palmanovi i obliznjim mestima na Majorci.",
      },
      {
        question: "Da li treba da rezervisem pre dolaska?",
        answer:
          "Da. Onlajn rezervacija se preporucuje tokom glavne sezone jer popularni skuteri i elektricne bicikle mogu biti rasprodati.",
      },
      {
        question: "Sta treba da ponesem prilikom preuzimanja?",
        answer:
          "Ponesite originalnu vozacku dozvolu kada je potrebna, pasos ili licnu kartu, potvrdu rezervacije i nacin placanja za depozit ili dodatke.",
      },
      {
        question: "Moze li NEXA Rentals pomoci pre rezervacije?",
        answer:
          "Da. Kontaktirajte NEXA Rentals preko WhatsAppa ili /sr/contact ako imate pitanja o dozvoli, rutama ili dostupnosti.",
      },
    ],
  },

  uk: {
    meta: (title) =>
      `${title} з NEXA Rentals Mallorca: ціни, водійські права, онлайн-бронювання та практичні поради для туристів у Магалуфі.`,
    excerpt: (title) =>
      `Практичний туристичний путівник про ${title.toLowerCase()} з NEXA Rentals Mallorca.`,
    quickAnswer: (title) =>
      `${title} залежить від ваших дат, водійських прав, маршруту та тривалості оренди. NEXA Rentals допомагає порівняти варіанти, перевірити наявність і забронювати онлайн до прибуття.`,
    ctaTitle: "Готові забронювати в Магалуфі?",
    ctaText:
      "Перегляньте доступні скутери та електровелосипеди на /uk або зверніться до команди через /uk/contact.",
    faqs: (title) => [
      {
        question: `Чи підходить ${title.toLowerCase()} для туристів?`,
        answer:
          "Так. Цей путівник створено для відвідувачів, які зупиняються в Магалуфі, Пальманові та сусідніх курортах Майорки.",
      },
      {
        question: "Чи потрібно бронювати до прибуття?",
        answer:
          "Так. У високий сезон рекомендується онлайн-бронювання, оскільки популярні скутери та електровелосипеди можуть бути повністю заброньовані.",
      },
      {
        question: "Що потрібно взяти із собою для отримання?",
        answer:
          "Візьміть оригінал водійських прав, якщо вони потрібні, паспорт або посвідчення особи, підтвердження бронювання та спосіб оплати депозиту чи додаткових послуг.",
      },
      {
        question: "Чи може NEXA Rentals допомогти до бронювання?",
        answer:
          "Так. Зверніться до NEXA Rentals через WhatsApp або /uk/contact, якщо маєте запитання про права, маршрути чи наявність.",
      },
    ],
  },
};

export function createLocalizedPostSpec(
  locale: Locale,
  spec: BriefPostSpec,
): LocalizedPostSpec {
  const copy = COPY[locale];

  return {
    ...spec,
    metaDescription: copy.meta(spec.title),
    excerpt: copy.excerpt(spec.title),
    quickAnswer: copy.quickAnswer(spec.title),
    ctaTitle: copy.ctaTitle,
    ctaText: copy.ctaText,
    faqs: copy.faqs(spec.title),
  };
}

const SECOND_PARAGRAPH: Record<Locale, string> = {
  en: "Check availability online before arrival and bring the original documents required at pickup.",
  es: "Comprueba la disponibilidad online antes de llegar y trae los documentos originales necesarios para la recogida.",
  de: "Prufe die Verfugbarkeit online vor deiner Ankunft und bringe die erforderlichen Originaldokumente zur Abholung mit.",
  fr: "Verifiez les disponibilites en ligne avant votre arrivee et apportez les documents originaux requis au retrait.",
  it: "Controlla la disponibilita online prima dell'arrivo e porta i documenti originali richiesti al ritiro.",
  nl: "Controleer de beschikbaarheid online voordat je aankomt en neem de originele documenten mee die bij het ophalen vereist zijn.",
  pl: "Sprawdz dostepnosc online przed przyjazdem i zabierz oryginalne dokumenty wymagane przy odbiorze.",
  sv: "Kontrollera tillgangligheten online fore ankomst och ta med originalhandlingarna som kravs vid upphamtning.",
  da: "Kontroller tilgaengeligheden online inden ankomst, og medbring de originale dokumenter, der kraeves ved afhentning.",
  no: "Sjekk tilgjengeligheten pa nett for ankomst, og ta med originaldokumentene som kreves ved henting.",
  pt: "Confirme a disponibilidade online antes de chegar e traga os documentos originais necessarios para o levantamento.",
  sr: "Proverite dostupnost onlajn pre dolaska i ponesite originalna dokumenta potrebna prilikom preuzimanja.",
  uk: "Перевірте наявність онлайн до прибуття та візьміть оригінали документів, необхідних для отримання.",
};

const FIRST_PARAGRAPH: Record<
  Locale,
  (title: string, focus: string) => string
> = {
  en: (title, focus) =>
    `${focus} This guide explains ${title.toLowerCase()} in practical terms for visitors staying in Magaluf, Palmanova and southwest Mallorca.`,

  es: (title, focus) =>
    `${focus} Esta guia explica ${title.toLowerCase()} de forma practica para visitantes alojados en Magaluf, Palmanova y el suroeste de Mallorca.`,

  de: (title, focus) =>
    `${focus} Dieser Ratgeber erklart ${title.toLowerCase()} praxisnah fur Gaste in Magaluf, Palmanova und im Sudwesten Mallorcas.`,

  fr: (title, focus) =>
    `${focus} Ce guide explique ${title.toLowerCase()} de facon pratique pour les visiteurs loges a Magaluf, Palmanova et dans le sud-ouest de Majorque.`,

  it: (title, focus) =>
    `${focus} Questa guida spiega ${title.toLowerCase()} in modo pratico per chi soggiorna a Magaluf, Palmanova e nel sud-ovest di Maiorca.`,

  nl: (title, focus) =>
    `${focus} Deze gids legt ${title.toLowerCase()} op een praktische manier uit voor bezoekers die in Magaluf, Palmanova en het zuidwesten van Mallorca verblijven.`,

  pl: (title, focus) =>
    `${focus} Ten przewodnik wyjasnia ${title.toLowerCase()} w praktyczny sposob dla osob przebywajacych w Magaluf, Palmanova i poludniowo-zachodniej czesci Majorki.`,

  sv: (title, focus) =>
    `${focus} Den har guiden forklarar ${title.toLowerCase()} praktiskt for besokare i Magaluf, Palmanova och sydvastra Mallorca.`,

  da: (title, focus) =>
    `${focus} Denne guide forklarer ${title.toLowerCase()} pa en praktisk made for besogende i Magaluf, Palmanova og det sydvestlige Mallorca.`,

  no: (title, focus) =>
    `${focus} Denne guiden forklarer ${title.toLowerCase()} pa en praktisk mate for besokende i Magaluf, Palmanova og det sorvestlige Mallorca.`,

  pt: (title, focus) =>
    `${focus} Este guia explica ${title.toLowerCase()} de forma pratica para visitantes em Magaluf, Palmanova e no sudoeste de Maiorca.`,

  sr: (title, focus) =>
    `${focus} Ovaj vodic prakticno objasnjava ${title.toLowerCase()} posetiocima koji borave u Magalufu, Palmanovi i jugozapadnom delu Majorke.`,

  uk: (title, focus) =>
    `${focus} Цей путівник практично пояснює ${title.toLowerCase()} для відвідувачів, які зупиняються в Магалуфі, Пальманові та на південному заході Майорки.`,
};

export function createBlogLocalePack(
  locale: Locale,
  specs: LocalizedPostSpec[],
): BlogLocalePack {
  return specs.reduce<BlogLocalePack>((pack, spec) => {
    const content: BlogLocaleContent = {
      slug: spec.slug,
      title: spec.title,
      metaTitle:
        spec.metaTitle ??
        `${spec.title} | NEXA Rentals Mallorca`,
      metaDescription: spec.metaDescription,
      excerpt: spec.excerpt,
      imageAlt: spec.imageAlt,
      quickAnswer: spec.quickAnswer,
      sections: spec.sections.map((section) => ({
        heading: section.heading,
        paragraphs: [
          FIRST_PARAGRAPH[locale](
            spec.title,
            section.focus,
          ),
          SECOND_PARAGRAPH[locale],
        ],
      })),
      faqs: spec.faqs,
      ctaTitle: spec.ctaTitle,
      ctaText: spec.ctaText,
    };

    pack[spec.id] = content;

    return pack;
  }, {});
}