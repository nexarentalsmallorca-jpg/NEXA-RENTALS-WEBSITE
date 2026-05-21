import type { Locale } from "@/i18n/routing";
import type { BlogLocaleContent, BlogLocalePack } from "../helpers";

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
    meta: (title) => `${title} with NEXA Rentals Mallorca: practical prices, booking advice, licence checks and tourist tips for Magaluf.`,
    excerpt: (title) => `Practical tourist guide to ${title.toLowerCase()} with NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} depends on your dates, licence, route and rental duration. NEXA Rentals helps visitors compare options, check availability and book online before arrival.`,
    ctaTitle: "Ready to book in Magaluf?",
    ctaText: "See available scooters and e-bikes on /en/vehicles or ask the team a question through /en/contact.",
    faqs: (title) => [
      { question: `Is ${title.toLowerCase()} suitable for tourists?`, answer: "Yes. It is written for visitors staying in Magaluf, Palmanova and nearby Mallorca resorts." },
      { question: "Should I book before arrival?", answer: "Yes, online booking is recommended in high season because popular scooters and e-bikes can sell out." },
      { question: "What should I bring to pickup?", answer: "Bring your original driving licence when required, passport or ID, booking confirmation and a payment method for deposit or extras." },
      { question: "Can NEXA Rentals help before I book?", answer: "Yes. Contact NEXA Rentals on WhatsApp or through /en/contact if you are unsure about licence rules, routes or availability." },
    ],
  },
  es: {
    meta: (title) => `${title} con NEXA Rentals Mallorca: precios, licencia, reserva online y consejos claros para turistas en Magaluf.`,
    excerpt: (title) => `Guia practica para turistas sobre ${title.toLowerCase()} con NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} depende de tus fechas, licencia, ruta y duracion del alquiler. NEXA Rentals ayuda a comprobar disponibilidad, condiciones y reserva online antes de llegar.`,
    ctaTitle: "Listo para reservar en Magaluf?",
    ctaText: "Consulta scooters y e-bikes disponibles en /es/vehicles o pregunta al equipo desde /es/contact.",
    faqs: (title) => [
      { question: `Es ${title.toLowerCase()} adecuado para turistas?`, answer: "Si. La guia esta pensada para visitantes alojados en Magaluf, Palmanova y otras zonas cercanas de Mallorca." },
      { question: "Conviene reservar antes de llegar?", answer: "Si, en temporada alta la reserva online es recomendable porque los scooters y e-bikes mas solicitados pueden agotarse." },
      { question: "Que debo llevar a la recogida?", answer: "Trae la licencia original cuando sea necesaria, pasaporte o DNI, confirmacion de reserva y metodo de pago para deposito o extras." },
      { question: "Puede ayudar NEXA Rentals antes de reservar?", answer: "Si. Contacta por WhatsApp o desde /en/contact si tienes dudas sobre licencia, rutas o disponibilidad." },
    ],
  },
  de: {
    meta: (title) => `${title} mit NEXA Rentals Mallorca: Preise, Fuhrerschein, Online-Buchung und klare Tipps fur Touristen in Magaluf.`,
    excerpt: (title) => `Praktischer Touristenratgeber zu ${title.toLowerCase()} mit NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} hangt von deinen Daten, deinem Fuhrerschein, der Route und der Mietdauer ab. NEXA Rentals hilft bei Verfugbarkeit, Bedingungen und Online-Buchung vor der Anreise.`,
    ctaTitle: "Bereit zur Buchung in Magaluf?",
    ctaText: "Sieh verfugbare Roller und E-Bikes unter /de/vehicles oder frage das Team uber /de/contact.",
    faqs: (title) => [
      { question: `Ist ${title.toLowerCase()} fur Touristen geeignet?`, answer: "Ja. Der Ratgeber richtet sich an Gaste in Magaluf, Palmanova und den nahen Ferienorten Mallorcas." },
      { question: "Sollte ich vor der Ankunft buchen?", answer: "Ja, in der Hochsaison ist Online-Buchung sinnvoll, weil beliebte Roller und E-Bikes ausgebucht sein konnen." },
      { question: "Was muss ich zur Abholung mitbringen?", answer: "Bring den originalen Fuhrerschein, falls erforderlich, Reisepass oder Ausweis, Buchungsbestatigung und ein Zahlungsmittel fur Kaution oder Extras mit." },
      { question: "Kann NEXA Rentals vor der Buchung helfen?", answer: "Ja. Kontaktiere NEXA Rentals per WhatsApp oder uber /en/contact, wenn du Fragen zu Fuhrerschein, Routen oder Verfugbarkeit hast." },
    ],
  },
  fr: {
    meta: (title) => `${title} avec NEXA Rentals Mallorca : prix, permis, reservation en ligne et conseils clairs pour touristes a Magaluf.`,
    excerpt: (title) => `Guide pratique pour touristes sur ${title.toLowerCase()} avec NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} depend de vos dates, de votre permis, de votre itineraire et de la duree de location. NEXA Rentals aide a verifier disponibilites, conditions et reservation en ligne avant l'arrivee.`,
    ctaTitle: "Pret a reserver a Magaluf ?",
    ctaText: "Consultez les scooters et e-bikes disponibles sur /en/vehicles ou posez une question a l'equipe via /en/contact.",
    faqs: (title) => [
      { question: `${title} convient-il aux touristes ?`, answer: "Oui. Ce guide s'adresse aux visiteurs loges a Magaluf, Palmanova et dans les stations proches de Majorque." },
      { question: "Faut-il reserver avant l'arrivee ?", answer: "Oui, la reservation en ligne est conseillee en haute saison car les scooters et e-bikes populaires peuvent etre complets." },
      { question: "Que dois-je apporter au retrait ?", answer: "Apportez le permis original si necessaire, passeport ou carte d'identite, confirmation de reservation et moyen de paiement pour depot ou extras." },
      { question: "NEXA Rentals peut-il aider avant de reserver ?", answer: "Oui. Contactez NEXA Rentals sur WhatsApp ou via /en/contact pour toute question de permis, itineraire ou disponibilite." },
    ],
  },
  it: {
    meta: (title) => `${title} con NEXA Rentals Mallorca: prezzi, patente, prenotazione online e consigli chiari per turisti a Magaluf.`,
    excerpt: (title) => `Guida pratica per turisti su ${title.toLowerCase()} con NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} dipende da date, patente, itinerario e durata del noleggio. NEXA Rentals aiuta a verificare disponibilita, condizioni e prenotazione online prima dell'arrivo.`,
    ctaTitle: "Pronto a prenotare a Magaluf?",
    ctaText: "Consulta scooter ed e-bike disponibili su /it/vehicles o fai una domanda al team da /it/contact.",
    faqs: (title) => [
      { question: `${title} e adatto ai turisti?`, answer: "Si. La guida e pensata per chi soggiorna a Magaluf, Palmanova e nelle localita vicine di Maiorca." },
      { question: "Conviene prenotare prima dell'arrivo?", answer: "Si, in alta stagione la prenotazione online e consigliata perche scooter ed e-bike richiesti possono esaurirsi." },
      { question: "Cosa devo portare al ritiro?", answer: "Porta la patente originale quando richiesta, passaporto o carta d'identita, conferma di prenotazione e metodo di pagamento per deposito o extra." },
      { question: "NEXA Rentals puo aiutare prima di prenotare?", answer: "Si. Contatta NEXA Rentals su WhatsApp o da /en/contact per dubbi su patente, percorsi o disponibilita." },
    ],
  },
  pt: {
    meta: (title) => `${title} com a NEXA Rentals Mallorca: precos, carta, reserva online e conselhos claros para turistas em Magaluf.`,
    excerpt: (title) => `Guia pratico para turistas sobre ${title.toLowerCase()} com a NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} depende das datas, carta, percurso e duracao do aluguer. A NEXA Rentals ajuda a confirmar disponibilidade, condicoes e reserva online antes da chegada.`,
    ctaTitle: "Pronto para reservar em Magaluf?",
    ctaText: "Veja scooters e e-bikes disponiveis em /pt/vehicles ou fale com a equipa em /pt/contact.",
    faqs: (title) => [
      { question: `${title} e adequado para turistas?`, answer: "Sim. O guia foi escrito para visitantes em Magaluf, Palmanova e outras zonas proximas de Maiorca." },
      { question: "Devo reservar antes de chegar?", answer: "Sim, na epoca alta a reserva online e recomendada porque as scooters e e-bikes mais procuradas podem esgotar." },
      { question: "O que devo levar para o levantamento?", answer: "Traga a carta original quando necessaria, passaporte ou documento de identidade, confirmacao da reserva e metodo de pagamento para caucao ou extras." },
      { question: "A NEXA Rentals pode ajudar antes da reserva?", answer: "Sim. Contacte por WhatsApp ou em /en/contact se tiver duvidas sobre carta, percursos ou disponibilidade." },
    ],
  },
  sv: {
    meta: (title) => `${title} med NEXA Rentals Mallorca: priser, korkort, onlinebokning och tydliga tips for turister i Magaluf.`,
    excerpt: (title) => `Praktisk turistguide om ${title.toLowerCase()} med NEXA Rentals Mallorca.`,
    quickAnswer: (title) => `${title} beror pa datum, korkort, rutt och hyrestid. NEXA Rentals hjalper dig att kontrollera tillganglighet, villkor och onlinebokning fore ankomst.`,
    ctaTitle: "Redo att boka i Magaluf?",
    ctaText: "Se tillgangliga skotrar och elcyklar pa /sv/vehicles eller stall en fraga till teamet via /sv/contact.",
    faqs: (title) => [
      { question: `Passar ${title.toLowerCase()} for turister?`, answer: "Ja. Guiden ar skriven for besokare i Magaluf, Palmanova och naraliggande orter pa Mallorca." },
      { question: "Bor jag boka fore ankomst?", answer: "Ja, under hogsasong rekommenderas onlinebokning eftersom populara skotrar och elcyklar kan bli fullbokade." },
      { question: "Vad ska jag ta med till upphamtningen?", answer: "Ta med originalkorkort nar det kravs, pass eller ID, bokningsbekraftelse och betalningsmedel for deposition eller tillagg." },
      { question: "Kan NEXA Rentals hjalpa fore bokning?", answer: "Ja. Kontakta NEXA Rentals pa WhatsApp eller via /en/contact om du ar osaker pa korkort, rutter eller tillganglighet." },
    ],
  },
};

export function createLocalizedPostSpec(
  locale: Locale,
  spec: BriefPostSpec
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
  pt: "Confirme a disponibilidade online antes de chegar e traga os documentos originais necessarios para o levantamento.",
  sv: "Kontrollera tillgangligheten online fore ankomst och ta med originalhandlingarna som kravs vid upphamtning.",
};

const FIRST_PARAGRAPH: Record<Locale, (title: string, focus: string) => string> = {
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
  pt: (title, focus) =>
    `${focus} Este guia explica ${title.toLowerCase()} de forma pratica para visitantes em Magaluf, Palmanova e no sudoeste de Maiorca.`,
  sv: (title, focus) =>
    `${focus} Den har guiden forklarar ${title.toLowerCase()} praktiskt for besokare i Magaluf, Palmanova och sydvastra Mallorca.`,
};

export function createBlogLocalePack(
  locale: Locale,
  specs: LocalizedPostSpec[]
): BlogLocalePack {
  return specs.reduce<BlogLocalePack>((pack, spec) => {
    const content: BlogLocaleContent = {
      slug: spec.slug,
      title: spec.title,
      metaTitle:
        spec.metaTitle ?? `${spec.title} | NEXA Rentals Mallorca`,
      metaDescription: spec.metaDescription,
      excerpt: spec.excerpt,
      imageAlt: spec.imageAlt,
      quickAnswer: spec.quickAnswer,
      sections: spec.sections.map((section) => ({
        heading: section.heading,
        paragraphs: [
          FIRST_PARAGRAPH[locale](spec.title, section.focus),
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
