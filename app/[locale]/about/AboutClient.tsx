"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import Navbar from "@/app/Navbar";

type Locale = "en" | "es" | "de" | "fr" | "it" | "pt" | "sv";

const brandOrange = "#FF7A00";
const neonBlue = "#00D9FF";
const neonPurple = "#8B5CF6";

type Highlight = {
  title: string;
  text: string;
  icon: React.ReactNode;
};

type TimelineItem = {
  number: string;
  title: string;
  text: string;
};

type TextCard = {
  title: string;
  text: string;
};

type FAQ = {
  q: string;
  a: string;
};

type AboutCopy = {
  badge: string;
  eyebrow: string;
  heroTitleBeforeFirst: string;
  heroTitleFirst: string;
  heroTitleMiddle: string;
  heroTitleAi: string;
  heroTitleAfterAi: string;
  heroText1: string;
  heroText2: string;
  viewFleet: string;
  bookNow: string;
  stats: { title: string; subtitle: string }[];
  aiPanel: {
    eyebrow: string;
    title: string;
    online: string;
    chips: string[];
    chats: { role: "customer" | "ai"; text: string }[];
  };
  who: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
    paragraphs: string[];
  };
  different: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
  };
  highlights: Highlight[];
  evolution: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
    note: string;
    timeline: TimelineItem[];
  };
  services: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
    cards: TextCard[];
  };
  mission: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
  };
  promise: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
    points: string[];
  };
  faq: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
    items: FAQ[];
  };
  finalCta: {
    eyebrow: string;
    titleA: string;
    titleGradient: string;
    text: string;
    bookOnline: string;
  };
  labels: {
    nexaSystem: string;
    customer: string;
    neroAi: string;
  };
};

function getSafeLocale(locale: string): Locale {
  return ["en", "es", "de", "fr", "it", "pt", "sv"].includes(locale)
    ? (locale as Locale)
    : "en";
}

const COPY: Record<Locale, AboutCopy> = {
  en: {
    badge: "Mallorca’s first AI-powered scooter rental experience",
    eyebrow: "FUTURE-FIRST RENTAL BRAND",
    heroTitleBeforeFirst: "We were the",
    heroTitleFirst: "first",
    heroTitleMiddle: "to bring an advanced",
    heroTitleAi: "AI assistant",
    heroTitleAfterAi: "into the scooter rental experience in Mallorca.",
    heroText1:
      "NEXA Rentals is a premium scooter and e-bike rental company in Magaluf created to modernize the rental experience through advanced technology, smarter communication, and a premium digital-first customer journey.",
    heroText2:
      "Our AI assistant works on both the website and WhatsApp, responds quickly, supports multiple languages, and helps customers understand services, booking details, and general rental information more intelligently.",
    viewFleet: "View Fleet",
    bookNow: "Book Now",
    stats: [
      { title: "24/7", subtitle: "AI Assistance" },
      { title: "Multi", subtitle: "Language Support" },
      { title: "Fast", subtitle: "Smart Booking" },
    ],
    aiPanel: {
      eyebrow: "NEXA AI CORE",
      title: "Nero Assistant",
      online: "Online 24/7",
      chips: [
        "Website AI",
        "WhatsApp AI",
        "Multilingual Replies",
        "Human Handover",
      ],
      chats: [
        { role: "customer", text: "Hi, can I book a scooter tomorrow?" },
        {
          role: "ai",
          text: "Hi, I’m Nero, the AI assistant from NEXA Rentals. I can help with availability, booking details, prices, and general rental information.",
        },
        { role: "customer", text: "Can you help in French too?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "WHO WE ARE",
      titleA: "A premium mobility brand designed for the",
      titleGradient: "future of customer experience",
      text: "NEXA Rentals is a modern scooter and e-bike rental company in Magaluf, Mallorca, created for customers who expect more speed, more clarity, and a more advanced service experience.",
      paragraphs: [
        "We created NEXA Rentals to push the local rental experience forward. Instead of relying on traditional methods, we built a digital-first system that feels cleaner, faster, and more intelligent.",
        "Our company is known for premium presentation, advanced support systems, futuristic visual design, and a modern customer journey focused on convenience and quality.",
        "NEXA Rentals is not only about scooters and e-bikes. It is about creating a memorable and high-quality experience that customers feel from the moment they land on the website.",
      ],
    },
    different: {
      eyebrow: "WHY NEXA IS DIFFERENT",
      titleA: "A more futuristic, faster, and",
      titleGradient: "smarter rental experience",
      text: "NEXA Rentals combines technology, premium branding, and customer convenience into one complete mobility experience.",
    },
    highlights: [
      {
        title: "First AI-Powered Rental Experience in Mallorca",
        text: "NEXA Rentals introduced an advanced AI assistant into the local scooter rental experience, creating a smarter and more modern way for customers to get support.",
        icon: <AiIcon />,
      },
      {
        title: "24/7 Multilingual Assistance",
        text: "Customers can receive instant replies in multiple languages through our website and WhatsApp, making the experience easier for international visitors.",
        icon: <GlobeIcon />,
      },
      {
        title: "Fast Booking System",
        text: "Our booking system is designed for speed, clarity, and convenience, helping customers reserve quickly with less friction and more confidence.",
        icon: <BoltIcon />,
      },
      {
        title: "Trendsetting Digital Approach",
        text: "NEXA Rentals is built around advanced technology, premium presentation, and a future-focused customer experience.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "THE AI EVOLUTION",
      titleA: "The first-mover approach to",
      titleGradient: "instant rental support",
      text: "NEXA Rentals introduced AI-powered communication to give customers fast, intelligent, and multilingual assistance whenever they need it.",
      note: "Our AI assistant helps customers understand services, pricing, booking options, and general rental information more quickly and more clearly.",
      timeline: [
        {
          number: "01",
          title: "A Modern Vision Was Created",
          text: "NEXA Rentals was built with the goal of making scooter and e-bike rental in Mallorca more advanced, more professional, and more customer-friendly.",
        },
        {
          number: "02",
          title: "AI Entered the Rental Experience",
          text: "Instead of relying only on manual replies, NEXA Rentals introduced an advanced AI assistant through both the website and WhatsApp.",
        },
        {
          number: "03",
          title: "Customers Started Getting Instant Help",
          text: "Visitors can now receive quick support for booking details, prices, availability, general questions, and multilingual communication.",
        },
        {
          number: "04",
          title: "A New Standard Was Set",
          text: "The result is a more futuristic and more efficient rental experience that helps position NEXA Rentals as a modern first-mover in Mallorca.",
        },
      ],
    },
    services: {
      eyebrow: "WHAT WE OFFER",
      titleA: "Premium mobility connected with",
      titleGradient: "advanced technology",
      text: "NEXA Rentals offers a more complete mobility experience by combining vehicle rental with AI-powered support and digital convenience.",
      cards: [
        {
          title: "125cc Scooter Rental",
          text: "A stylish, fast, and flexible way to explore Magaluf and Mallorca with comfort and freedom.",
        },
        {
          title: "E-Bike Rental",
          text: "A relaxed and eco-friendly option ideal for local rides, beach routes, and shorter scenic journeys.",
        },
        {
          title: "AI Website Assistant",
          text: "An intelligent assistant built to answer questions instantly, guide customers, and make the website experience smarter.",
        },
        {
          title: "AI WhatsApp Assistant",
          text: "A multilingual WhatsApp assistant available 24/7 that can also pass chats to the NEXA Rentals team whenever needed.",
        },
      ],
    },
    mission: {
      eyebrow: "OUR MISSION",
      titleA: "To make renting in Mallorca",
      titleGradient: "faster, smarter, and more memorable.",
      text: "Our mission is to modernize scooter and e-bike rental through premium vehicles, advanced AI support, fast communication, and a customer experience that feels modern from the first click.",
    },
    promise: {
      eyebrow: "THE NEXA PROMISE",
      titleA: "Premium service powered by",
      titleGradient: "smarter systems",
      text: "Every part of the NEXA Rentals experience is designed to make the customer journey clearer, faster, and more impressive.",
      points: [
        "Advanced AI support on website and WhatsApp",
        "Fast online booking flow",
        "Premium digital-first experience",
        "Multilingual customer communication",
        "Tourist-friendly service",
        "Clear and professional information",
        "Modern brand presentation",
        "Smarter customer journey",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Frequently asked about",
      titleGradient: "NEXA Rentals",
      text: "This section helps both customers and search engines understand the page more clearly, making the About page stronger and more SEO-friendly.",
      items: [
        {
          q: "What is NEXA Rentals?",
          a: "NEXA Rentals is a premium scooter and e-bike rental company in Magaluf, Mallorca, built for customers who want a modern, fast, and professional rental experience.",
        },
        {
          q: "What makes NEXA Rentals different?",
          a: "NEXA Rentals stands out through advanced technology, fast booking, premium design, and an AI assistant available across both the website and WhatsApp.",
        },
        {
          q: "Does NEXA Rentals use AI?",
          a: "Yes. NEXA Rentals uses an advanced AI assistant to help customers with information, booking guidance, multilingual support, and faster communication.",
        },
        {
          q: "Can customers get help in multiple languages?",
          a: "Yes. The AI assistant is built to respond in multiple languages to better support international visitors in Mallorca.",
        },
        {
          q: "Can I book online?",
          a: "Yes. NEXA Rentals offers a modern booking experience designed to help customers reserve quickly and easily.",
        },
      ],
    },
    finalCta: {
      eyebrow: "READY TO RIDE?",
      titleA: "Discover Mallorca with",
      titleGradient: "NEXA Rentals",
      text: "Book your scooter or e-bike online and enjoy a faster, smarter, and more premium way to move around Magaluf and Mallorca.",
      bookOnline: "Book Online",
    },
    labels: {
      nexaSystem: "NEXA SYSTEM",
      customer: "Customer",
      neroAi: "Nero AI",
    },
  },

  es: {
    badge: "La primera experiencia de alquiler de scooters con IA en Mallorca",
    eyebrow: "MARCA DE ALQUILER FUTURISTA",
    heroTitleBeforeFirst: "Fuimos los",
    heroTitleFirst: "primeros",
    heroTitleMiddle: "en traer un",
    heroTitleAi: "asistente de IA avanzado",
    heroTitleAfterAi:
      "a la experiencia de alquiler de scooters en Mallorca.",
    heroText1:
      "NEXA Rentals es una empresa premium de alquiler de scooters y e-bikes en Magaluf, creada para modernizar la experiencia de alquiler con tecnología avanzada, comunicación más inteligente y un recorrido digital premium para el cliente.",
    heroText2:
      "Nuestro asistente de IA funciona tanto en la web como en WhatsApp, responde rápido, admite varios idiomas y ayuda a los clientes a entender mejor los servicios, detalles de reserva e información general de alquiler.",
    viewFleet: "Ver flota",
    bookNow: "Reservar ahora",
    stats: [
      { title: "24/7", subtitle: "Asistencia IA" },
      { title: "Multi", subtitle: "Soporte de idiomas" },
      { title: "Rápido", subtitle: "Reserva inteligente" },
    ],
    aiPanel: {
      eyebrow: "NÚCLEO NEXA AI",
      title: "Asistente Nero",
      online: "Online 24/7",
      chips: ["IA Web", "IA WhatsApp", "Respuestas multilingües", "Traspaso humano"],
      chats: [
        { role: "customer", text: "Hola, ¿puedo reservar un scooter mañana?" },
        {
          role: "ai",
          text: "Hola, soy Nero, el asistente de IA de NEXA Rentals. Puedo ayudar con disponibilidad, reserva, precios e información general.",
        },
        { role: "customer", text: "¿También puedes ayudar en francés?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "QUIÉNES SOMOS",
      titleA: "Una marca premium de movilidad diseñada para el",
      titleGradient: "futuro de la experiencia del cliente",
      text: "NEXA Rentals es una empresa moderna de alquiler de scooters y e-bikes en Magaluf, Mallorca, creada para clientes que esperan más rapidez, más claridad y una experiencia de servicio más avanzada.",
      paragraphs: [
        "Creamos NEXA Rentals para llevar la experiencia local de alquiler a otro nivel. En vez de depender solo de métodos tradicionales, construimos un sistema digital que se siente más limpio, rápido e inteligente.",
        "Nuestra empresa destaca por su presentación premium, sistemas avanzados de soporte, diseño visual futurista y un recorrido moderno centrado en la comodidad y la calidad.",
        "NEXA Rentals no trata solo de scooters y e-bikes. Trata de crear una experiencia memorable y de alta calidad desde el momento en que el cliente entra en la web.",
      ],
    },
    different: {
      eyebrow: "POR QUÉ NEXA ES DIFERENTE",
      titleA: "Una experiencia de alquiler más futurista, rápida e",
      titleGradient: "inteligente",
      text: "NEXA Rentals combina tecnología, marca premium y comodidad del cliente en una experiencia completa de movilidad.",
    },
    highlights: [
      {
        title: "Primera experiencia de alquiler con IA en Mallorca",
        text: "NEXA Rentals introdujo un asistente de IA avanzado en la experiencia local de alquiler de scooters, creando una forma más moderna e inteligente de ofrecer soporte.",
        icon: <AiIcon />,
      },
      {
        title: "Asistencia multilingüe 24/7",
        text: "Los clientes pueden recibir respuestas instantáneas en varios idiomas desde la web y WhatsApp, haciendo la experiencia más fácil para visitantes internacionales.",
        icon: <GlobeIcon />,
      },
      {
        title: "Sistema de reserva rápido",
        text: "Nuestro sistema está diseñado para rapidez, claridad y comodidad, ayudando a reservar con menos fricción y más confianza.",
        icon: <BoltIcon />,
      },
      {
        title: "Enfoque digital pionero",
        text: "NEXA Rentals está construida alrededor de tecnología avanzada, presentación premium y una experiencia de cliente enfocada al futuro.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "LA EVOLUCIÓN DE LA IA",
      titleA: "Un enfoque pionero para el",
      titleGradient: "soporte instantáneo de alquiler",
      text: "NEXA Rentals introdujo comunicación con IA para dar a los clientes asistencia rápida, inteligente y multilingüe cuando la necesitan.",
      note: "Nuestro asistente de IA ayuda a entender servicios, precios, opciones de reserva e información general de forma más rápida y clara.",
      timeline: [
        {
          number: "01",
          title: "Se creó una visión moderna",
          text: "NEXA Rentals nació con el objetivo de hacer el alquiler de scooters y e-bikes en Mallorca más avanzado, profesional y cómodo para el cliente.",
        },
        {
          number: "02",
          title: "La IA entró en la experiencia de alquiler",
          text: "En vez de depender solo de respuestas manuales, NEXA Rentals introdujo un asistente de IA avanzado en la web y WhatsApp.",
        },
        {
          number: "03",
          title: "Los clientes empezaron a recibir ayuda instantánea",
          text: "Los visitantes ahora pueden recibir soporte rápido sobre reservas, precios, disponibilidad, preguntas generales y comunicación multilingüe.",
        },
        {
          number: "04",
          title: "Se estableció un nuevo estándar",
          text: "El resultado es una experiencia más futurista y eficiente que posiciona a NEXA Rentals como una marca moderna pionera en Mallorca.",
        },
      ],
    },
    services: {
      eyebrow: "QUÉ OFRECEMOS",
      titleA: "Movilidad premium conectada con",
      titleGradient: "tecnología avanzada",
      text: "NEXA Rentals ofrece una experiencia de movilidad más completa combinando alquiler de vehículos con soporte de IA y comodidad digital.",
      cards: [
        {
          title: "Alquiler de scooters 125cc",
          text: "Una forma elegante, rápida y flexible de explorar Magaluf y Mallorca con comodidad y libertad.",
        },
        {
          title: "Alquiler de e-bikes",
          text: "Una opción relajada y ecológica ideal para rutas locales, playa y trayectos cortos escénicos.",
        },
        {
          title: "Asistente IA web",
          text: "Un asistente inteligente diseñado para responder al instante, guiar a los clientes y hacer la experiencia web más inteligente.",
        },
        {
          title: "Asistente IA WhatsApp",
          text: "Un asistente multilingüe por WhatsApp disponible 24/7 que también puede pasar chats al equipo de NEXA Rentals cuando sea necesario.",
        },
      ],
    },
    mission: {
      eyebrow: "NUESTRA MISIÓN",
      titleA: "Hacer que alquilar en Mallorca sea",
      titleGradient: "más rápido, inteligente y memorable.",
      text: "Nuestra misión es modernizar el alquiler de scooters y e-bikes con vehículos premium, soporte avanzado de IA, comunicación rápida y una experiencia moderna desde el primer clic.",
    },
    promise: {
      eyebrow: "LA PROMESA NEXA",
      titleA: "Servicio premium impulsado por",
      titleGradient: "sistemas inteligentes",
      text: "Cada parte de la experiencia NEXA Rentals está diseñada para hacer el recorrido del cliente más claro, rápido e impresionante.",
      points: [
        "Soporte avanzado de IA en web y WhatsApp",
        "Flujo de reserva online rápido",
        "Experiencia digital premium",
        "Comunicación multilingüe",
        "Servicio pensado para turistas",
        "Información clara y profesional",
        "Presentación de marca moderna",
        "Recorrido del cliente más inteligente",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Preguntas frecuentes sobre",
      titleGradient: "NEXA Rentals",
      text: "Esta sección ayuda a clientes y buscadores a entender mejor la página, haciendo el About más fuerte y SEO-friendly.",
      items: [
        {
          q: "¿Qué es NEXA Rentals?",
          a: "NEXA Rentals es una empresa premium de alquiler de scooters y e-bikes en Magaluf, Mallorca, creada para clientes que quieren una experiencia moderna, rápida y profesional.",
        },
        {
          q: "¿Qué hace diferente a NEXA Rentals?",
          a: "NEXA Rentals destaca por tecnología avanzada, reserva rápida, diseño premium y un asistente de IA disponible en web y WhatsApp.",
        },
        {
          q: "¿NEXA Rentals usa IA?",
          a: "Sí. NEXA Rentals usa un asistente de IA avanzado para ayudar con información, guía de reserva, soporte multilingüe y comunicación más rápida.",
        },
        {
          q: "¿Los clientes pueden recibir ayuda en varios idiomas?",
          a: "Sí. El asistente de IA está diseñado para responder en varios idiomas y ayudar mejor a visitantes internacionales en Mallorca.",
        },
        {
          q: "¿Puedo reservar online?",
          a: "Sí. NEXA Rentals ofrece una experiencia moderna de reserva diseñada para reservar de forma rápida y fácil.",
        },
      ],
    },
    finalCta: {
      eyebrow: "¿LISTO PARA CONDUCIR?",
      titleA: "Descubre Mallorca con",
      titleGradient: "NEXA Rentals",
      text: "Reserva tu scooter o e-bike online y disfruta de una forma más rápida, inteligente y premium de moverte por Magaluf y Mallorca.",
      bookOnline: "Reservar online",
    },
    labels: {
      nexaSystem: "SISTEMA NEXA",
      customer: "Cliente",
      neroAi: "Nero IA",
    },
  },

  de: {
    badge: "Mallorcas erstes KI-gestütztes Scooter-Mieterlebnis",
    eyebrow: "ZUKUNFTSORIENTIERTE MIETMARKE",
    heroTitleBeforeFirst: "Wir waren die",
    heroTitleFirst: "ersten",
    heroTitleMiddle: "die einen fortschrittlichen",
    heroTitleAi: "KI-Assistenten",
    heroTitleAfterAi: "in das Scooter-Mieterlebnis auf Mallorca gebracht haben.",
    heroText1:
      "NEXA Rentals ist ein Premium-Verleih für Scooter und E-Bikes in Magaluf, entwickelt, um das Mieterlebnis durch moderne Technologie, intelligentere Kommunikation und eine hochwertige digitale Kundenreise zu modernisieren.",
    heroText2:
      "Unser KI-Assistent funktioniert auf der Website und über WhatsApp, antwortet schnell, unterstützt mehrere Sprachen und hilft Kunden, Services, Buchungsdetails und allgemeine Mietinformationen besser zu verstehen.",
    viewFleet: "Flotte ansehen",
    bookNow: "Jetzt buchen",
    stats: [
      { title: "24/7", subtitle: "KI-Unterstützung" },
      { title: "Multi", subtitle: "Sprachsupport" },
      { title: "Schnell", subtitle: "Smarte Buchung" },
    ],
    aiPanel: {
      eyebrow: "NEXA KI-KERN",
      title: "Nero Assistent",
      online: "Online 24/7",
      chips: ["Website KI", "WhatsApp KI", "Mehrsprachige Antworten", "Übergabe an Team"],
      chats: [
        { role: "customer", text: "Hallo, kann ich morgen einen Scooter buchen?" },
        {
          role: "ai",
          text: "Hallo, ich bin Nero, der KI-Assistent von NEXA Rentals. Ich kann bei Verfügbarkeit, Buchungsdetails, Preisen und allgemeinen Mietinformationen helfen.",
        },
        { role: "customer", text: "Kannst du auch auf Französisch helfen?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "WER WIR SIND",
      titleA: "Eine Premium-Mobilitätsmarke für die",
      titleGradient: "Zukunft der Kundenerfahrung",
      text: "NEXA Rentals ist ein moderner Scooter- und E-Bike-Verleih in Magaluf, Mallorca, für Kunden, die mehr Geschwindigkeit, mehr Klarheit und ein moderneres Serviceerlebnis erwarten.",
      paragraphs: [
        "Wir haben NEXA Rentals gegründet, um das lokale Mieterlebnis weiterzuentwickeln. Statt nur auf traditionelle Methoden zu setzen, haben wir ein digitales System gebaut, das sauberer, schneller und intelligenter wirkt.",
        "Unser Unternehmen steht für Premium-Präsentation, fortschrittliche Support-Systeme, futuristisches Design und eine moderne Kundenreise mit Fokus auf Komfort und Qualität.",
        "NEXA Rentals bedeutet nicht nur Scooter und E-Bikes. Es geht darum, ein hochwertiges Erlebnis zu schaffen, das Kunden ab dem ersten Besuch der Website spüren.",
      ],
    },
    different: {
      eyebrow: "WARUM NEXA ANDERS IST",
      titleA: "Ein futuristischeres, schnelleres und",
      titleGradient: "smarteres Mieterlebnis",
      text: "NEXA Rentals verbindet Technologie, Premium-Branding und Kundenkomfort zu einem vollständigen Mobilitätserlebnis.",
    },
    highlights: [
      {
        title: "Erstes KI-gestütztes Mieterlebnis auf Mallorca",
        text: "NEXA Rentals hat einen fortschrittlichen KI-Assistenten in das lokale Scooter-Mieterlebnis integriert und schafft so eine modernere Art des Kundensupports.",
        icon: <AiIcon />,
      },
      {
        title: "24/7 mehrsprachige Unterstützung",
        text: "Kunden können über Website und WhatsApp sofortige Antworten in mehreren Sprachen erhalten, was die Erfahrung für internationale Besucher einfacher macht.",
        icon: <GlobeIcon />,
      },
      {
        title: "Schnelles Buchungssystem",
        text: "Unser Buchungssystem ist auf Geschwindigkeit, Klarheit und Komfort ausgelegt, damit Kunden schneller und sicherer reservieren können.",
        icon: <BoltIcon />,
      },
      {
        title: "Trendsetzender digitaler Ansatz",
        text: "NEXA Rentals basiert auf fortschrittlicher Technologie, Premium-Präsentation und einer zukunftsorientierten Kundenerfahrung.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "DIE KI-ENTWICKLUNG",
      titleA: "Der First-Mover-Ansatz für",
      titleGradient: "sofortigen Mietsupport",
      text: "NEXA Rentals hat KI-gestützte Kommunikation eingeführt, um Kunden schnelle, intelligente und mehrsprachige Hilfe zu geben.",
      note: "Unser KI-Assistent hilft Kunden, Services, Preise, Buchungsoptionen und allgemeine Mietinformationen schneller und klarer zu verstehen.",
      timeline: [
        {
          number: "01",
          title: "Eine moderne Vision entstand",
          text: "NEXA Rentals wurde mit dem Ziel gegründet, Scooter- und E-Bike-Vermietung auf Mallorca moderner, professioneller und kundenfreundlicher zu machen.",
        },
        {
          number: "02",
          title: "KI kam ins Mieterlebnis",
          text: "Anstatt nur manuelle Antworten zu nutzen, führte NEXA Rentals einen fortschrittlichen KI-Assistenten auf Website und WhatsApp ein.",
        },
        {
          number: "03",
          title: "Kunden erhielten sofortige Hilfe",
          text: "Besucher erhalten jetzt schnelle Unterstützung zu Buchungsdetails, Preisen, Verfügbarkeit, allgemeinen Fragen und mehrsprachiger Kommunikation.",
        },
        {
          number: "04",
          title: "Ein neuer Standard wurde gesetzt",
          text: "Das Ergebnis ist ein futuristischeres und effizienteres Mieterlebnis, das NEXA Rentals als moderne First-Mover-Marke auf Mallorca positioniert.",
        },
      ],
    },
    services: {
      eyebrow: "WAS WIR ANBIETEN",
      titleA: "Premium-Mobilität verbunden mit",
      titleGradient: "fortschrittlicher Technologie",
      text: "NEXA Rentals bietet ein vollständigeres Mobilitätserlebnis durch Fahrzeugvermietung, KI-Support und digitale Bequemlichkeit.",
      cards: [
        {
          title: "125cc Scooter-Vermietung",
          text: "Eine stilvolle, schnelle und flexible Möglichkeit, Magaluf und Mallorca bequem und frei zu erkunden.",
        },
        {
          title: "E-Bike-Vermietung",
          text: "Eine entspannte und umweltfreundliche Option für lokale Fahrten, Strandrouten und kürzere Ausflüge.",
        },
        {
          title: "KI Website-Assistent",
          text: "Ein intelligenter Assistent, der sofort Fragen beantwortet, Kunden führt und die Website-Erfahrung smarter macht.",
        },
        {
          title: "KI WhatsApp-Assistent",
          text: "Ein mehrsprachiger WhatsApp-Assistent, der 24/7 verfügbar ist und Chats bei Bedarf an das NEXA Rentals Team übergeben kann.",
        },
      ],
    },
    mission: {
      eyebrow: "UNSERE MISSION",
      titleA: "Vermietung auf Mallorca",
      titleGradient: "schneller, smarter und unvergesslicher machen.",
      text: "Unsere Mission ist es, Scooter- und E-Bike-Vermietung durch Premium-Fahrzeuge, fortschrittlichen KI-Support, schnelle Kommunikation und ein modernes Kundenerlebnis zu modernisieren.",
    },
    promise: {
      eyebrow: "DAS NEXA VERSPRECHEN",
      titleA: "Premium-Service unterstützt durch",
      titleGradient: "smartere Systeme",
      text: "Jeder Teil der NEXA Rentals Erfahrung ist darauf ausgelegt, die Kundenreise klarer, schneller und beeindruckender zu machen.",
      points: [
        "Fortschrittlicher KI-Support auf Website und WhatsApp",
        "Schneller Online-Buchungsablauf",
        "Premium digitales Erlebnis",
        "Mehrsprachige Kundenkommunikation",
        "Touristenfreundlicher Service",
        "Klare und professionelle Informationen",
        "Moderne Markenpräsentation",
        "Smarte Kundenreise",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Häufig gefragt über",
      titleGradient: "NEXA Rentals",
      text: "Dieser Bereich hilft Kunden und Suchmaschinen, die Seite klarer zu verstehen, und stärkt die About-Seite für SEO.",
      items: [
        {
          q: "Was ist NEXA Rentals?",
          a: "NEXA Rentals ist ein Premium-Verleih für Scooter und E-Bikes in Magaluf, Mallorca, für Kunden, die ein modernes, schnelles und professionelles Mieterlebnis möchten.",
        },
        {
          q: "Was macht NEXA Rentals anders?",
          a: "NEXA Rentals überzeugt durch fortschrittliche Technologie, schnelle Buchung, Premium-Design und einen KI-Assistenten auf Website und WhatsApp.",
        },
        {
          q: "Nutzt NEXA Rentals KI?",
          a: "Ja. NEXA Rentals nutzt einen fortschrittlichen KI-Assistenten für Informationen, Buchungshilfe, mehrsprachigen Support und schnellere Kommunikation.",
        },
        {
          q: "Können Kunden in mehreren Sprachen Hilfe bekommen?",
          a: "Ja. Der KI-Assistent ist darauf ausgelegt, in mehreren Sprachen zu antworten und internationale Besucher auf Mallorca besser zu unterstützen.",
        },
        {
          q: "Kann ich online buchen?",
          a: "Ja. NEXA Rentals bietet ein modernes Buchungserlebnis, mit dem Kunden schnell und einfach reservieren können.",
        },
      ],
    },
    finalCta: {
      eyebrow: "BEREIT ZU FAHREN?",
      titleA: "Entdecke Mallorca mit",
      titleGradient: "NEXA Rentals",
      text: "Buche deinen Scooter oder dein E-Bike online und genieße eine schnellere, smartere und hochwertigere Art, dich in Magaluf und Mallorca zu bewegen.",
      bookOnline: "Online buchen",
    },
    labels: {
      nexaSystem: "NEXA SYSTEM",
      customer: "Kunde",
      neroAi: "Nero KI",
    },
  },

  fr: {
    badge: "La première expérience de location de scooters avec IA à Majorque",
    eyebrow: "MARQUE DE LOCATION TOURNÉE VERS L’AVENIR",
    heroTitleBeforeFirst: "Nous avons été les",
    heroTitleFirst: "premiers",
    heroTitleMiddle: "à intégrer un",
    heroTitleAi: "assistant IA avancé",
    heroTitleAfterAi:
      "dans l’expérience de location de scooters à Majorque.",
    heroText1:
      "NEXA Rentals est une entreprise premium de location de scooters et e-bikes à Magaluf, créée pour moderniser l’expérience de location grâce à la technologie avancée, une communication plus intelligente et un parcours client digital premium.",
    heroText2:
      "Notre assistant IA fonctionne sur le site et sur WhatsApp, répond rapidement, prend en charge plusieurs langues et aide les clients à mieux comprendre les services, les détails de réservation et les informations générales de location.",
    viewFleet: "Voir la flotte",
    bookNow: "Réserver",
    stats: [
      { title: "24/7", subtitle: "Assistance IA" },
      { title: "Multi", subtitle: "Support langues" },
      { title: "Rapide", subtitle: "Réservation intelligente" },
    ],
    aiPanel: {
      eyebrow: "CŒUR NEXA IA",
      title: "Assistant Nero",
      online: "En ligne 24/7",
      chips: ["IA Site web", "IA WhatsApp", "Réponses multilingues", "Transfert humain"],
      chats: [
        { role: "customer", text: "Bonjour, puis-je réserver un scooter demain ?" },
        {
          role: "ai",
          text: "Bonjour, je suis Nero, l’assistant IA de NEXA Rentals. Je peux aider avec la disponibilité, les détails de réservation, les prix et les informations générales.",
        },
        { role: "customer", text: "Pouvez-vous aussi aider en français ?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "QUI NOUS SOMMES",
      titleA: "Une marque premium de mobilité conçue pour le",
      titleGradient: "futur de l’expérience client",
      text: "NEXA Rentals est une entreprise moderne de location de scooters et e-bikes à Magaluf, Majorque, créée pour les clients qui attendent plus de rapidité, plus de clarté et un service plus avancé.",
      paragraphs: [
        "Nous avons créé NEXA Rentals pour faire évoluer l’expérience locale de location. Au lieu de compter uniquement sur des méthodes traditionnelles, nous avons construit un système digital plus clair, plus rapide et plus intelligent.",
        "Notre entreprise se distingue par une présentation premium, des systèmes de support avancés, un design futuriste et un parcours client moderne axé sur le confort et la qualité.",
        "NEXA Rentals ne concerne pas seulement les scooters et e-bikes. Il s’agit de créer une expérience mémorable et de haute qualité dès l’arrivée du client sur le site.",
      ],
    },
    different: {
      eyebrow: "POURQUOI NEXA EST DIFFÉRENT",
      titleA: "Une expérience de location plus futuriste, plus rapide et",
      titleGradient: "plus intelligente",
      text: "NEXA Rentals combine technologie, image premium et confort client dans une expérience de mobilité complète.",
    },
    highlights: [
      {
        title: "Première expérience de location avec IA à Majorque",
        text: "NEXA Rentals a intégré un assistant IA avancé dans l’expérience locale de location de scooters, créant une façon plus moderne d’aider les clients.",
        icon: <AiIcon />,
      },
      {
        title: "Assistance multilingue 24/7",
        text: "Les clients peuvent recevoir des réponses instantanées en plusieurs langues via le site et WhatsApp, ce qui facilite l’expérience des visiteurs internationaux.",
        icon: <GlobeIcon />,
      },
      {
        title: "Système de réservation rapide",
        text: "Notre système de réservation est conçu pour la rapidité, la clarté et le confort, aidant les clients à réserver avec plus de confiance.",
        icon: <BoltIcon />,
      },
      {
        title: "Approche digitale innovante",
        text: "NEXA Rentals repose sur une technologie avancée, une présentation premium et une expérience client tournée vers le futur.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "L’ÉVOLUTION IA",
      titleA: "Une approche pionnière pour le",
      titleGradient: "support instantané de location",
      text: "NEXA Rentals a introduit une communication assistée par IA pour offrir une aide rapide, intelligente et multilingue aux clients.",
      note: "Notre assistant IA aide les clients à comprendre plus vite et plus clairement les services, prix, options de réservation et informations générales.",
      timeline: [
        {
          number: "01",
          title: "Une vision moderne a été créée",
          text: "NEXA Rentals a été construit pour rendre la location de scooters et e-bikes à Majorque plus avancée, plus professionnelle et plus conviviale.",
        },
        {
          number: "02",
          title: "L’IA est entrée dans l’expérience de location",
          text: "Au lieu de dépendre uniquement des réponses manuelles, NEXA Rentals a introduit un assistant IA avancé sur le site et WhatsApp.",
        },
        {
          number: "03",
          title: "Les clients ont reçu de l’aide instantanée",
          text: "Les visiteurs peuvent désormais recevoir une aide rapide sur les réservations, prix, disponibilité, questions générales et langues.",
        },
        {
          number: "04",
          title: "Un nouveau standard a été établi",
          text: "Le résultat est une expérience plus futuriste et efficace qui positionne NEXA Rentals comme une marque moderne pionnière à Majorque.",
        },
      ],
    },
    services: {
      eyebrow: "CE QUE NOUS OFFRONS",
      titleA: "Une mobilité premium connectée à une",
      titleGradient: "technologie avancée",
      text: "NEXA Rentals offre une expérience de mobilité plus complète en combinant location de véhicules, support IA et confort digital.",
      cards: [
        {
          title: "Location de scooter 125cc",
          text: "Une façon élégante, rapide et flexible d’explorer Magaluf et Majorque avec confort et liberté.",
        },
        {
          title: "Location d’e-bike",
          text: "Une option relax et écologique idéale pour les trajets locaux, routes de plage et petites balades.",
        },
        {
          title: "Assistant IA du site",
          text: "Un assistant intelligent conçu pour répondre instantanément, guider les clients et rendre l’expérience web plus intelligente.",
        },
        {
          title: "Assistant IA WhatsApp",
          text: "Un assistant WhatsApp multilingue disponible 24/7 pouvant aussi transférer les conversations à l’équipe NEXA Rentals si nécessaire.",
        },
      ],
    },
    mission: {
      eyebrow: "NOTRE MISSION",
      titleA: "Rendre la location à Majorque",
      titleGradient: "plus rapide, plus intelligente et plus mémorable.",
      text: "Notre mission est de moderniser la location de scooters et e-bikes grâce à des véhicules premium, un support IA avancé, une communication rapide et une expérience moderne dès le premier clic.",
    },
    promise: {
      eyebrow: "LA PROMESSE NEXA",
      titleA: "Un service premium propulsé par des",
      titleGradient: "systèmes plus intelligents",
      text: "Chaque partie de l’expérience NEXA Rentals est conçue pour rendre le parcours client plus clair, plus rapide et plus impressionnant.",
      points: [
        "Support IA avancé sur site et WhatsApp",
        "Flux de réservation en ligne rapide",
        "Expérience digitale premium",
        "Communication client multilingue",
        "Service adapté aux touristes",
        "Informations claires et professionnelles",
        "Présentation de marque moderne",
        "Parcours client plus intelligent",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Questions fréquentes sur",
      titleGradient: "NEXA Rentals",
      text: "Cette section aide les clients et les moteurs de recherche à mieux comprendre la page, renforçant l’About pour le SEO.",
      items: [
        {
          q: "Qu’est-ce que NEXA Rentals ?",
          a: "NEXA Rentals est une entreprise premium de location de scooters et e-bikes à Magaluf, Majorque, conçue pour une expérience moderne, rapide et professionnelle.",
        },
        {
          q: "Qu’est-ce qui rend NEXA Rentals différent ?",
          a: "NEXA Rentals se distingue par sa technologie avancée, sa réservation rapide, son design premium et un assistant IA disponible sur le site et WhatsApp.",
        },
        {
          q: "NEXA Rentals utilise-t-il l’IA ?",
          a: "Oui. NEXA Rentals utilise un assistant IA avancé pour aider avec les informations, la réservation, le support multilingue et la communication rapide.",
        },
        {
          q: "Les clients peuvent-ils obtenir de l’aide en plusieurs langues ?",
          a: "Oui. L’assistant IA est conçu pour répondre en plusieurs langues afin de mieux aider les visiteurs internationaux à Majorque.",
        },
        {
          q: "Puis-je réserver en ligne ?",
          a: "Oui. NEXA Rentals offre une expérience de réservation moderne pour réserver rapidement et facilement.",
        },
      ],
    },
    finalCta: {
      eyebrow: "PRÊT À ROULER ?",
      titleA: "Découvrez Majorque avec",
      titleGradient: "NEXA Rentals",
      text: "Réservez votre scooter ou e-bike en ligne et profitez d’une façon plus rapide, plus intelligente et plus premium de vous déplacer à Magaluf et Majorque.",
      bookOnline: "Réserver en ligne",
    },
    labels: {
      nexaSystem: "SYSTÈME NEXA",
      customer: "Client",
      neroAi: "Nero IA",
    },
  },

  it: {
    badge: "La prima esperienza di noleggio scooter con AI a Maiorca",
    eyebrow: "BRAND DI NOLEGGIO PROIETTATO AL FUTURO",
    heroTitleBeforeFirst: "Siamo stati i",
    heroTitleFirst: "primi",
    heroTitleMiddle: "a portare un",
    heroTitleAi: "assistente AI avanzato",
    heroTitleAfterAi: "nell’esperienza di noleggio scooter a Maiorca.",
    heroText1:
      "NEXA Rentals è un’azienda premium di noleggio scooter ed e-bike a Magaluf, creata per modernizzare l’esperienza di noleggio con tecnologia avanzata, comunicazione più intelligente e un percorso cliente digitale premium.",
    heroText2:
      "Il nostro assistente AI funziona sia sul sito che su WhatsApp, risponde rapidamente, supporta più lingue e aiuta i clienti a capire meglio servizi, dettagli di prenotazione e informazioni generali.",
    viewFleet: "Vedi flotta",
    bookNow: "Prenota ora",
    stats: [
      { title: "24/7", subtitle: "Assistenza AI" },
      { title: "Multi", subtitle: "Supporto lingue" },
      { title: "Veloce", subtitle: "Prenotazione smart" },
    ],
    aiPanel: {
      eyebrow: "CORE NEXA AI",
      title: "Assistente Nero",
      online: "Online 24/7",
      chips: ["AI sito web", "AI WhatsApp", "Risposte multilingue", "Passaggio umano"],
      chats: [
        { role: "customer", text: "Ciao, posso prenotare uno scooter per domani?" },
        {
          role: "ai",
          text: "Ciao, sono Nero, l’assistente AI di NEXA Rentals. Posso aiutare con disponibilità, dettagli di prenotazione, prezzi e informazioni generali.",
        },
        { role: "customer", text: "Puoi aiutare anche in francese?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "CHI SIAMO",
      titleA: "Un brand premium di mobilità progettato per il",
      titleGradient: "futuro dell’esperienza cliente",
      text: "NEXA Rentals è un’azienda moderna di noleggio scooter ed e-bike a Magaluf, Maiorca, creata per clienti che cercano più velocità, più chiarezza e un servizio più avanzato.",
      paragraphs: [
        "Abbiamo creato NEXA Rentals per portare avanti l’esperienza locale di noleggio. Invece di usare solo metodi tradizionali, abbiamo costruito un sistema digitale più pulito, veloce e intelligente.",
        "La nostra azienda è conosciuta per presentazione premium, sistemi di supporto avanzati, design futuristico e un percorso cliente moderno focalizzato su comodità e qualità.",
        "NEXA Rentals non riguarda solo scooter ed e-bike. Riguarda la creazione di un’esperienza memorabile e di alta qualità dal primo momento sul sito.",
      ],
    },
    different: {
      eyebrow: "PERCHÉ NEXA È DIVERSA",
      titleA: "Un’esperienza di noleggio più futuristica, veloce e",
      titleGradient: "intelligente",
      text: "NEXA Rentals combina tecnologia, branding premium e comodità del cliente in un’esperienza completa di mobilità.",
    },
    highlights: [
      {
        title: "Prima esperienza di noleggio con AI a Maiorca",
        text: "NEXA Rentals ha introdotto un assistente AI avanzato nell’esperienza locale di noleggio scooter, creando un modo più moderno di offrire supporto.",
        icon: <AiIcon />,
      },
      {
        title: "Assistenza multilingue 24/7",
        text: "I clienti possono ricevere risposte istantanee in più lingue tramite sito e WhatsApp, rendendo l’esperienza più facile per i visitatori internazionali.",
        icon: <GlobeIcon />,
      },
      {
        title: "Sistema di prenotazione veloce",
        text: "Il nostro sistema è progettato per velocità, chiarezza e comodità, aiutando i clienti a prenotare con meno frizione e più fiducia.",
        icon: <BoltIcon />,
      },
      {
        title: "Approccio digitale innovativo",
        text: "NEXA Rentals è costruita attorno a tecnologia avanzata, presentazione premium e un’esperienza cliente orientata al futuro.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "L’EVOLUZIONE AI",
      titleA: "L’approccio pionieristico al",
      titleGradient: "supporto istantaneo al noleggio",
      text: "NEXA Rentals ha introdotto comunicazione con AI per offrire supporto rapido, intelligente e multilingue quando serve.",
      note: "Il nostro assistente AI aiuta i clienti a capire servizi, prezzi, opzioni di prenotazione e informazioni generali in modo più rapido e chiaro.",
      timeline: [
        {
          number: "01",
          title: "È nata una visione moderna",
          text: "NEXA Rentals è stata creata per rendere il noleggio scooter ed e-bike a Maiorca più avanzato, professionale e customer-friendly.",
        },
        {
          number: "02",
          title: "L’AI è entrata nel noleggio",
          text: "Invece di dipendere solo da risposte manuali, NEXA Rentals ha introdotto un assistente AI avanzato su sito e WhatsApp.",
        },
        {
          number: "03",
          title: "I clienti hanno iniziato a ricevere aiuto immediato",
          text: "I visitatori possono ora ricevere supporto veloce su prenotazioni, prezzi, disponibilità, domande generali e lingue.",
        },
        {
          number: "04",
          title: "È stato creato un nuovo standard",
          text: "Il risultato è un’esperienza più futuristica ed efficiente che posiziona NEXA Rentals come brand moderno pionieristico a Maiorca.",
        },
      ],
    },
    services: {
      eyebrow: "COSA OFFRIAMO",
      titleA: "Mobilità premium connessa con",
      titleGradient: "tecnologia avanzata",
      text: "NEXA Rentals offre un’esperienza di mobilità più completa combinando noleggio veicoli, supporto AI e comodità digitale.",
      cards: [
        {
          title: "Noleggio scooter 125cc",
          text: "Un modo elegante, veloce e flessibile per esplorare Magaluf e Maiorca con comfort e libertà.",
        },
        {
          title: "Noleggio e-bike",
          text: "Un’opzione rilassata ed ecologica ideale per giri locali, percorsi in spiaggia e tragitti panoramici brevi.",
        },
        {
          title: "Assistente AI sito web",
          text: "Un assistente intelligente progettato per rispondere subito, guidare i clienti e rendere l’esperienza web più smart.",
        },
        {
          title: "Assistente AI WhatsApp",
          text: "Un assistente WhatsApp multilingue disponibile 24/7 che può anche passare le chat al team NEXA Rentals quando necessario.",
        },
      ],
    },
    mission: {
      eyebrow: "LA NOSTRA MISSIONE",
      titleA: "Rendere il noleggio a Maiorca",
      titleGradient: "più veloce, intelligente e memorabile.",
      text: "La nostra missione è modernizzare il noleggio scooter ed e-bike con veicoli premium, supporto AI avanzato, comunicazione rapida e un’esperienza moderna dal primo clic.",
    },
    promise: {
      eyebrow: "LA PROMESSA NEXA",
      titleA: "Servizio premium alimentato da",
      titleGradient: "sistemi più intelligenti",
      text: "Ogni parte dell’esperienza NEXA Rentals è progettata per rendere il percorso cliente più chiaro, veloce e impressionante.",
      points: [
        "Supporto AI avanzato su sito e WhatsApp",
        "Flusso di prenotazione online veloce",
        "Esperienza digitale premium",
        "Comunicazione multilingue",
        "Servizio ideale per turisti",
        "Informazioni chiare e professionali",
        "Presentazione moderna del brand",
        "Percorso cliente più intelligente",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Domande frequenti su",
      titleGradient: "NEXA Rentals",
      text: "Questa sezione aiuta clienti e motori di ricerca a capire meglio la pagina, rendendo la pagina About più forte e SEO-friendly.",
      items: [
        {
          q: "Cos’è NEXA Rentals?",
          a: "NEXA Rentals è un’azienda premium di noleggio scooter ed e-bike a Magaluf, Maiorca, creata per chi vuole un’esperienza moderna, veloce e professionale.",
        },
        {
          q: "Cosa rende diversa NEXA Rentals?",
          a: "NEXA Rentals si distingue per tecnologia avanzata, prenotazione veloce, design premium e assistente AI su sito e WhatsApp.",
        },
        {
          q: "NEXA Rentals usa l’AI?",
          a: "Sì. NEXA Rentals usa un assistente AI avanzato per aiutare con informazioni, guida alla prenotazione, supporto multilingue e comunicazione rapida.",
        },
        {
          q: "I clienti possono ricevere aiuto in più lingue?",
          a: "Sì. L’assistente AI è progettato per rispondere in più lingue e supportare meglio i visitatori internazionali a Maiorca.",
        },
        {
          q: "Posso prenotare online?",
          a: "Sì. NEXA Rentals offre un’esperienza di prenotazione moderna per prenotare in modo rapido e semplice.",
        },
      ],
    },
    finalCta: {
      eyebrow: "PRONTO A PARTIRE?",
      titleA: "Scopri Maiorca con",
      titleGradient: "NEXA Rentals",
      text: "Prenota online il tuo scooter o e-bike e goditi un modo più veloce, intelligente e premium per muoverti a Magaluf e Maiorca.",
      bookOnline: "Prenota online",
    },
    labels: {
      nexaSystem: "SISTEMA NEXA",
      customer: "Cliente",
      neroAi: "Nero AI",
    },
  },

  pt: {
    badge: "A primeira experiência de aluguer de scooters com AI em Maiorca",
    eyebrow: "MARCA DE ALUGUER FUTURISTA",
    heroTitleBeforeFirst: "Fomos os",
    heroTitleFirst: "primeiros",
    heroTitleMiddle: "a trazer um",
    heroTitleAi: "assistente AI avançado",
    heroTitleAfterAi:
      "para a experiência de aluguer de scooters em Maiorca.",
    heroText1:
      "A NEXA Rentals é uma empresa premium de aluguer de scooters e e-bikes em Magaluf, criada para modernizar a experiência de aluguer através de tecnologia avançada, comunicação mais inteligente e uma jornada digital premium.",
    heroText2:
      "O nosso assistente AI funciona no website e no WhatsApp, responde rapidamente, suporta vários idiomas e ajuda os clientes a compreender serviços, detalhes de reserva e informação geral de aluguer.",
    viewFleet: "Ver frota",
    bookNow: "Reservar agora",
    stats: [
      { title: "24/7", subtitle: "Assistência AI" },
      { title: "Multi", subtitle: "Suporte idiomas" },
      { title: "Rápido", subtitle: "Reserva inteligente" },
    ],
    aiPanel: {
      eyebrow: "NÚCLEO NEXA AI",
      title: "Assistente Nero",
      online: "Online 24/7",
      chips: ["AI Website", "AI WhatsApp", "Respostas multilingues", "Passagem humana"],
      chats: [
        { role: "customer", text: "Olá, posso reservar uma scooter amanhã?" },
        {
          role: "ai",
          text: "Olá, sou o Nero, o assistente AI da NEXA Rentals. Posso ajudar com disponibilidade, reserva, preços e informação geral.",
        },
        { role: "customer", text: "Também podes ajudar em francês?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "QUEM SOMOS",
      titleA: "Uma marca premium de mobilidade criada para o",
      titleGradient: "futuro da experiência do cliente",
      text: "A NEXA Rentals é uma empresa moderna de aluguer de scooters e e-bikes em Magaluf, Maiorca, criada para clientes que esperam mais rapidez, mais clareza e uma experiência de serviço mais avançada.",
      paragraphs: [
        "Criámos a NEXA Rentals para levar a experiência local de aluguer mais longe. Em vez de depender apenas de métodos tradicionais, construímos um sistema digital mais limpo, rápido e inteligente.",
        "A nossa empresa é conhecida pela apresentação premium, sistemas avançados de apoio, design futurista e uma jornada moderna focada em conveniência e qualidade.",
        "A NEXA Rentals não é apenas sobre scooters e e-bikes. É sobre criar uma experiência memorável e de alta qualidade desde o primeiro momento no website.",
      ],
    },
    different: {
      eyebrow: "PORQUE A NEXA É DIFERENTE",
      titleA: "Uma experiência de aluguer mais futurista, rápida e",
      titleGradient: "inteligente",
      text: "A NEXA Rentals combina tecnologia, marca premium e conveniência do cliente numa experiência completa de mobilidade.",
    },
    highlights: [
      {
        title: "Primeira experiência de aluguer com AI em Maiorca",
        text: "A NEXA Rentals introduziu um assistente AI avançado na experiência local de aluguer de scooters, criando uma forma mais moderna de apoiar clientes.",
        icon: <AiIcon />,
      },
      {
        title: "Assistência multilingue 24/7",
        text: "Os clientes podem receber respostas instantâneas em vários idiomas através do website e WhatsApp, facilitando a experiência para visitantes internacionais.",
        icon: <GlobeIcon />,
      },
      {
        title: "Sistema de reserva rápido",
        text: "O nosso sistema foi desenhado para rapidez, clareza e conveniência, ajudando os clientes a reservar com menos atrito e mais confiança.",
        icon: <BoltIcon />,
      },
      {
        title: "Abordagem digital inovadora",
        text: "A NEXA Rentals é construída com tecnologia avançada, apresentação premium e uma experiência de cliente focada no futuro.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "A EVOLUÇÃO AI",
      titleA: "A abordagem pioneira para",
      titleGradient: "suporte instantâneo de aluguer",
      text: "A NEXA Rentals introduziu comunicação com AI para dar aos clientes assistência rápida, inteligente e multilingue sempre que precisam.",
      note: "O nosso assistente AI ajuda os clientes a compreender serviços, preços, opções de reserva e informação geral de forma mais rápida e clara.",
      timeline: [
        {
          number: "01",
          title: "Foi criada uma visão moderna",
          text: "A NEXA Rentals foi criada com o objetivo de tornar o aluguer de scooters e e-bikes em Maiorca mais avançado, profissional e amigo do cliente.",
        },
        {
          number: "02",
          title: "A AI entrou na experiência de aluguer",
          text: "Em vez de depender apenas de respostas manuais, a NEXA Rentals introduziu um assistente AI avançado no website e WhatsApp.",
        },
        {
          number: "03",
          title: "Os clientes começaram a receber ajuda instantânea",
          text: "Os visitantes podem agora receber apoio rápido sobre reservas, preços, disponibilidade, perguntas gerais e comunicação multilingue.",
        },
        {
          number: "04",
          title: "Foi criado um novo padrão",
          text: "O resultado é uma experiência mais futurista e eficiente que posiciona a NEXA Rentals como uma marca moderna pioneira em Maiorca.",
        },
      ],
    },
    services: {
      eyebrow: "O QUE OFERECEMOS",
      titleA: "Mobilidade premium conectada com",
      titleGradient: "tecnologia avançada",
      text: "A NEXA Rentals oferece uma experiência de mobilidade mais completa ao combinar aluguer de veículos com suporte AI e conveniência digital.",
      cards: [
        {
          title: "Aluguer de scooter 125cc",
          text: "Uma forma elegante, rápida e flexível de explorar Magaluf e Maiorca com conforto e liberdade.",
        },
        {
          title: "Aluguer de e-bike",
          text: "Uma opção relaxada e ecológica ideal para passeios locais, rotas de praia e pequenos trajetos panorâmicos.",
        },
        {
          title: "Assistente AI do website",
          text: "Um assistente inteligente criado para responder instantaneamente, orientar clientes e tornar a experiência web mais inteligente.",
        },
        {
          title: "Assistente AI WhatsApp",
          text: "Um assistente WhatsApp multilingue disponível 24/7 que também pode passar conversas para a equipa NEXA Rentals quando necessário.",
        },
      ],
    },
    mission: {
      eyebrow: "A NOSSA MISSÃO",
      titleA: "Tornar o aluguer em Maiorca",
      titleGradient: "mais rápido, inteligente e memorável.",
      text: "A nossa missão é modernizar o aluguer de scooters e e-bikes com veículos premium, suporte AI avançado, comunicação rápida e uma experiência moderna desde o primeiro clique.",
    },
    promise: {
      eyebrow: "A PROMESSA NEXA",
      titleA: "Serviço premium impulsionado por",
      titleGradient: "sistemas mais inteligentes",
      text: "Cada parte da experiência NEXA Rentals é desenhada para tornar a jornada do cliente mais clara, rápida e impressionante.",
      points: [
        "Suporte AI avançado no website e WhatsApp",
        "Fluxo de reserva online rápido",
        "Experiência digital premium",
        "Comunicação multilingue",
        "Serviço amigável para turistas",
        "Informação clara e profissional",
        "Apresentação de marca moderna",
        "Jornada do cliente mais inteligente",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Perguntas frequentes sobre",
      titleGradient: "NEXA Rentals",
      text: "Esta secção ajuda clientes e motores de busca a compreender melhor a página, tornando o About mais forte e SEO-friendly.",
      items: [
        {
          q: "O que é a NEXA Rentals?",
          a: "A NEXA Rentals é uma empresa premium de aluguer de scooters e e-bikes em Magaluf, Maiorca, criada para clientes que querem uma experiência moderna, rápida e profissional.",
        },
        {
          q: "O que torna a NEXA Rentals diferente?",
          a: "A NEXA Rentals destaca-se pela tecnologia avançada, reserva rápida, design premium e assistente AI disponível no website e WhatsApp.",
        },
        {
          q: "A NEXA Rentals usa AI?",
          a: "Sim. A NEXA Rentals usa um assistente AI avançado para ajudar com informação, orientação de reserva, suporte multilingue e comunicação rápida.",
        },
        {
          q: "Os clientes podem receber ajuda em vários idiomas?",
          a: "Sim. O assistente AI foi criado para responder em vários idiomas e apoiar melhor visitantes internacionais em Maiorca.",
        },
        {
          q: "Posso reservar online?",
          a: "Sim. A NEXA Rentals oferece uma experiência moderna de reserva para ajudar os clientes a reservar rapidamente e facilmente.",
        },
      ],
    },
    finalCta: {
      eyebrow: "PRONTO PARA CONDUZIR?",
      titleA: "Descubra Maiorca com",
      titleGradient: "NEXA Rentals",
      text: "Reserve a sua scooter ou e-bike online e desfrute de uma forma mais rápida, inteligente e premium de se mover por Magaluf e Maiorca.",
      bookOnline: "Reservar online",
    },
    labels: {
      nexaSystem: "SISTEMA NEXA",
      customer: "Cliente",
      neroAi: "Nero AI",
    },
  },

  sv: {
    badge: "Mallorcas första AI-drivna scooteruthyrningsupplevelse",
    eyebrow: "FRAMTIDSINRIKTAT UTHYRNINGSMÄRKE",
    heroTitleBeforeFirst: "Vi var",
    heroTitleFirst: "först",
    heroTitleMiddle: "med att ta in en avancerad",
    heroTitleAi: "AI-assistent",
    heroTitleAfterAi: "i scooteruthyrningsupplevelsen på Mallorca.",
    heroText1:
      "NEXA Rentals är ett premiumföretag för scooter- och elcykeluthyrning i Magaluf, skapat för att modernisera uthyrningsupplevelsen med avancerad teknik, smartare kommunikation och en premium digital kundresa.",
    heroText2:
      "Vår AI-assistent fungerar både på webbplatsen och WhatsApp, svarar snabbt, stöder flera språk och hjälper kunder att förstå tjänster, bokningsdetaljer och allmän uthyrningsinformation smartare.",
    viewFleet: "Se flotta",
    bookNow: "Boka nu",
    stats: [
      { title: "24/7", subtitle: "AI-hjälp" },
      { title: "Multi", subtitle: "Språkstöd" },
      { title: "Snabb", subtitle: "Smart bokning" },
    ],
    aiPanel: {
      eyebrow: "NEXA AI-KÄRNA",
      title: "Nero Assistent",
      online: "Online 24/7",
      chips: ["Webbplats AI", "WhatsApp AI", "Flerspråkiga svar", "Mänsklig överlämning"],
      chats: [
        { role: "customer", text: "Hej, kan jag boka en scooter imorgon?" },
        {
          role: "ai",
          text: "Hej, jag är Nero, AI-assistenten från NEXA Rentals. Jag kan hjälpa med tillgänglighet, bokningsdetaljer, priser och allmän information.",
        },
        { role: "customer", text: "Kan du hjälpa på franska också?" },
        {
          role: "ai",
          text: "Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape.",
        },
      ],
    },
    who: {
      eyebrow: "VILKA VI ÄR",
      titleA: "Ett premium mobilitetsmärke designat för",
      titleGradient: "framtidens kundupplevelse",
      text: "NEXA Rentals är ett modernt företag för scooter- och elcykeluthyrning i Magaluf, Mallorca, skapat för kunder som vill ha mer hastighet, mer tydlighet och en mer avancerad serviceupplevelse.",
      paragraphs: [
        "Vi skapade NEXA Rentals för att utveckla den lokala uthyrningsupplevelsen. I stället för att bara använda traditionella metoder byggde vi ett digitalt system som känns renare, snabbare och smartare.",
        "Vårt företag är känt för premium presentation, avancerade supportsystem, futuristisk design och en modern kundresa med fokus på bekvämlighet och kvalitet.",
        "NEXA Rentals handlar inte bara om scooters och elcyklar. Det handlar om att skapa en minnesvärd och högkvalitativ upplevelse från första besöket på webbplatsen.",
      ],
    },
    different: {
      eyebrow: "VARFÖR NEXA ÄR ANNORLUNDA",
      titleA: "En mer futuristisk, snabbare och",
      titleGradient: "smartare uthyrningsupplevelse",
      text: "NEXA Rentals kombinerar teknik, premium varumärke och kundbekvämlighet i en komplett mobilitetsupplevelse.",
    },
    highlights: [
      {
        title: "Första AI-drivna uthyrningsupplevelsen på Mallorca",
        text: "NEXA Rentals introducerade en avancerad AI-assistent i den lokala scooteruthyrningen och skapade ett smartare sätt att ge support.",
        icon: <AiIcon />,
      },
      {
        title: "24/7 flerspråkig hjälp",
        text: "Kunder kan få snabba svar på flera språk via webbplatsen och WhatsApp, vilket gör upplevelsen enklare för internationella besökare.",
        icon: <GlobeIcon />,
      },
      {
        title: "Snabbt bokningssystem",
        text: "Vårt bokningssystem är designat för hastighet, tydlighet och bekvämlighet, vilket hjälper kunder att reservera snabbare och tryggare.",
        icon: <BoltIcon />,
      },
      {
        title: "Trendsettande digitalt arbetssätt",
        text: "NEXA Rentals bygger på avancerad teknik, premium presentation och en framtidsfokuserad kundupplevelse.",
        icon: <WaveIcon />,
      },
    ],
    evolution: {
      eyebrow: "AI-UTVECKLINGEN",
      titleA: "Ett pionjärsätt för",
      titleGradient: "direkt uthyrningssupport",
      text: "NEXA Rentals introducerade AI-driven kommunikation för att ge kunder snabb, intelligent och flerspråkig hjälp när de behöver den.",
      note: "Vår AI-assistent hjälper kunder att förstå tjänster, priser, bokningsalternativ och allmän uthyrningsinformation snabbare och tydligare.",
      timeline: [
        {
          number: "01",
          title: "En modern vision skapades",
          text: "NEXA Rentals byggdes för att göra scooter- och elcykeluthyrning på Mallorca mer avancerad, professionell och kundvänlig.",
        },
        {
          number: "02",
          title: "AI kom in i uthyrningsupplevelsen",
          text: "I stället för att bara förlita sig på manuella svar introducerade NEXA Rentals en avancerad AI-assistent på webbplatsen och WhatsApp.",
        },
        {
          number: "03",
          title: "Kunder började få direkt hjälp",
          text: "Besökare kan nu få snabb support för bokningsdetaljer, priser, tillgänglighet, allmänna frågor och flerspråkig kommunikation.",
        },
        {
          number: "04",
          title: "En ny standard sattes",
          text: "Resultatet är en mer futuristisk och effektiv uthyrningsupplevelse som positionerar NEXA Rentals som en modern pionjär på Mallorca.",
        },
      ],
    },
    services: {
      eyebrow: "VAD VI ERBJUDER",
      titleA: "Premium mobilitet kopplad till",
      titleGradient: "avancerad teknik",
      text: "NEXA Rentals erbjuder en mer komplett mobilitetsupplevelse genom att kombinera fordonsuthyrning med AI-support och digital bekvämlighet.",
      cards: [
        {
          title: "125cc scooteruthyrning",
          text: "Ett snyggt, snabbt och flexibelt sätt att utforska Magaluf och Mallorca med komfort och frihet.",
        },
        {
          title: "Elcykeluthyrning",
          text: "Ett avslappnat och miljövänligt alternativ för lokala turer, strandrutter och kortare natursköna resor.",
        },
        {
          title: "AI webbplatsassistent",
          text: "En intelligent assistent byggd för att svara direkt, vägleda kunder och göra webbupplevelsen smartare.",
        },
        {
          title: "AI WhatsApp-assistent",
          text: "En flerspråkig WhatsApp-assistent tillgänglig 24/7 som också kan lämna över chattar till NEXA Rentals team vid behov.",
        },
      ],
    },
    mission: {
      eyebrow: "VÅRT UPPDRAG",
      titleA: "Att göra uthyrning på Mallorca",
      titleGradient: "snabbare, smartare och mer minnesvärd.",
      text: "Vårt uppdrag är att modernisera scooter- och elcykeluthyrning med premiumfordon, avancerad AI-support, snabb kommunikation och en modern upplevelse från första klicket.",
    },
    promise: {
      eyebrow: "NEXA-LÖFTET",
      titleA: "Premiumservice driven av",
      titleGradient: "smartare system",
      text: "Varje del av NEXA Rentals upplevelse är designad för att göra kundresan tydligare, snabbare och mer imponerande.",
      points: [
        "Avancerad AI-support på webbplats och WhatsApp",
        "Snabbt onlinebokningsflöde",
        "Premium digital upplevelse",
        "Flerspråkig kundkommunikation",
        "Turistvänlig service",
        "Tydlig och professionell information",
        "Modern varumärkespresentation",
        "Smartare kundresa",
      ],
    },
    faq: {
      eyebrow: "FAQ",
      titleA: "Vanliga frågor om",
      titleGradient: "NEXA Rentals",
      text: "Den här sektionen hjälper både kunder och sökmotorer att förstå sidan bättre och gör About-sidan starkare för SEO.",
      items: [
        {
          q: "Vad är NEXA Rentals?",
          a: "NEXA Rentals är ett premiumföretag för scooter- och elcykeluthyrning i Magaluf, Mallorca, byggt för kunder som vill ha en modern, snabb och professionell upplevelse.",
        },
        {
          q: "Vad gör NEXA Rentals annorlunda?",
          a: "NEXA Rentals sticker ut med avancerad teknik, snabb bokning, premiumdesign och en AI-assistent på både webbplats och WhatsApp.",
        },
        {
          q: "Använder NEXA Rentals AI?",
          a: "Ja. NEXA Rentals använder en avancerad AI-assistent för information, bokningshjälp, flerspråkig support och snabbare kommunikation.",
        },
        {
          q: "Kan kunder få hjälp på flera språk?",
          a: "Ja. AI-assistenten är byggd för att svara på flera språk och bättre hjälpa internationella besökare på Mallorca.",
        },
        {
          q: "Kan jag boka online?",
          a: "Ja. NEXA Rentals erbjuder en modern bokningsupplevelse som gör det enkelt och snabbt att reservera.",
        },
      ],
    },
    finalCta: {
      eyebrow: "REDO ATT KÖRA?",
      titleA: "Upptäck Mallorca med",
      titleGradient: "NEXA Rentals",
      text: "Boka din scooter eller elcykel online och njut av ett snabbare, smartare och mer premium sätt att röra dig i Magaluf och Mallorca.",
      bookOnline: "Boka online",
    },
    labels: {
      nexaSystem: "NEXA SYSTEM",
      customer: "Kund",
      neroAi: "Nero AI",
    },
  },
};

export default function AboutClient() {
  const locale = getSafeLocale(useLocale());
  const copy = COPY[locale];

  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrollY(y);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const nextProgress = max > 0 ? y / max : 0;
      setProgress(nextProgress);
    };

    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const heroMove = useMemo(() => scrollY * 0.09, [scrollY]);
  const orbMove = useMemo(() => scrollY * 0.16, [scrollY]);
  const beamMove = useMemo(() => scrollY * 0.06, [scrollY]);

  return (
    <>
      <Suspense fallback={null}>
        <div className="relative z-[10001]">
          <Navbar />
        </div>
      </Suspense>

      <div className="fixed left-0 right-0 top-0 z-[10002] h-[3px] bg-white/5">
        <div
          className="h-full"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${brandOrange}, ${neonPurple}, ${neonBlue})`,
            boxShadow: `0 0 22px ${brandOrange}, 0 0 28px ${neonBlue}`,
          }}
        />
      </div>

      <div
        className="pointer-events-none fixed z-[1] hidden rounded-full blur-[100px] md:block"
        style={{
          left: mouse.x - 180,
          top: mouse.y - 180,
          width: 360,
          height: 360,
          background:
            "radial-gradient(circle, rgba(255,122,0,0.10) 0%, rgba(139,92,246,0.09) 38%, rgba(0,217,255,0.07) 70%, transparent 100%)",
          transition: "left 130ms linear, top 130ms linear",
        }}
      />

      <main className="relative -mt-[260px] overflow-hidden bg-[#040404] text-white">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(255,122,0,0.16),transparent_24%),radial-gradient(circle_at_92%_12%,rgba(0,217,255,0.12),transparent_26%),radial-gradient(circle_at_52%_86%,rgba(139,92,246,0.18),transparent_30%),linear-gradient(180deg,#020202_0%,#070707_46%,#030303_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_82%)]" />

          <div
            className="absolute -left-24 top-12 h-[420px] w-[420px] rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,122,0,0.22) 0%, rgba(255,122,0,0.10) 38%, transparent 74%)",
              transform: `translate3d(0, ${orbMove}px, 0)`,
            }}
          />
          <div
            className="absolute right-[-130px] top-[90px] h-[520px] w-[520px] rounded-full blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, rgba(0,217,255,0.14) 0%, rgba(139,92,246,0.14) 44%, transparent 76%)",
              transform: `translate3d(0, ${orbMove * 0.75}px, 0)`,
            }}
          />
          <div className="absolute bottom-[12%] left-[28%] h-[360px] w-[360px] rounded-full bg-purple-500/10 blur-[120px]" />

          <div
            className="absolute -left-[5%] top-[20%] h-[2px] w-[42%] rotate-[-12deg] opacity-65"
            style={{
              transform: `translate3d(0, ${beamMove}px, 0)`,
              background:
                "linear-gradient(90deg, transparent, rgba(255,122,0,0.95), rgba(139,92,246,0.65), transparent)",
              boxShadow: "0 0 16px rgba(255,122,0,0.45)",
            }}
          />
          <div
            className="absolute right-[-8%] top-[32%] h-[2px] w-[50%] rotate-[12deg] opacity-60"
            style={{
              transform: `translate3d(0, ${-beamMove}px, 0)`,
              background:
                "linear-gradient(90deg, transparent, rgba(0,217,255,0.95), rgba(139,92,246,0.65), transparent)",
              boxShadow: "0 0 16px rgba(0,217,255,0.35)",
            }}
          />

          <div className="absolute inset-0 opacity-30 mix-blend-screen">
            <div className="floating-particle particle-1" />
            <div className="floating-particle particle-2" />
            <div className="floating-particle particle-3" />
            <div className="floating-particle particle-4" />
            <div className="floating-particle particle-5" />
            <div className="floating-particle particle-6" />
            <div className="floating-particle particle-7" />
            <div className="floating-particle particle-8" />
          </div>

          <div className="absolute inset-0 opacity-[0.16]">
            <div className="cyber-line cyber-line-1" />
            <div className="cyber-line cyber-line-2" />
            <div className="cyber-line cyber-line-3" />
          </div>
        </div>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-0 md:px-10 md:pb-20 md:pt-0">
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="relative">
                <GlowBadge>{copy.badge}</GlowBadge>

                <div className="mt-6">
                  <p className="mb-4 text-sm font-black uppercase tracking-[0.34em] text-white/42">
                    {copy.eyebrow}
                  </p>

                  <h1 className="max-w-5xl text-[46px] font-black leading-[0.93] tracking-[-0.055em] sm:text-[62px] md:text-[78px] lg:text-[92px]">
                    {copy.heroTitleBeforeFirst}{" "}
                    <GradientText>{copy.heroTitleFirst}</GradientText>{" "}
                    {copy.heroTitleMiddle}{" "}
                    <GradientText>{copy.heroTitleAi}</GradientText>{" "}
                    {copy.heroTitleAfterAi}
                  </h1>
                </div>

                <p className="mt-7 max-w-3xl text-base leading-8 text-white/76 md:text-lg">
                  {copy.heroText1}
                </p>

                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                  {copy.heroText2}
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    href={`/${locale}/fleet`}
                    className="group relative inline-flex min-h-[58px] items-center justify-center overflow-hidden rounded-2xl px-7 text-sm font-bold text-black transition duration-300 hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${brandOrange} 0%, #ffd3a7 34%, ${neonPurple} 72%, ${neonBlue} 100%)`,
                      boxShadow: "0 18px 40px rgba(255,122,0,0.24)",
                    }}
                  >
                    <span className="relative z-10">{copy.viewFleet}</span>
                    <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                  </Link>

                  <Link
                    href={`/${locale}`}
                    className="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.04] hover:border-cyan-300/40 hover:bg-white/[0.1]"
                  >
                    {copy.bookNow}
                  </Link>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                  {copy.stats.map((stat) => (
                    <StatCard
                      key={`${stat.title}-${stat.subtitle}`}
                      title={stat.title}
                      subtitle={stat.subtitle}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div
                className="relative"
                style={{
                  transform: `translate3d(0, ${heroMove}px, 0)`,
                }}
              >
                <div className="absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle,rgba(255,122,0,0.18),rgba(139,92,246,0.16),rgba(0,217,255,0.14),transparent_75%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_25px_90px_rgba(0,0,0,0.56)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,122,0,0.14),rgba(139,92,246,0.1),rgba(0,217,255,0.08))]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                  <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl" />
                  <div className="absolute bottom-6 left-6 h-24 w-24 rounded-full bg-orange-400/10 blur-3xl" />

                  <div className="relative rounded-[28px] border border-white/10 bg-black/30 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.34em] text-white/40">
                          {copy.aiPanel.eyebrow}
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight">
                          {copy.aiPanel.title}
                        </h2>
                      </div>

                      <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                        {copy.aiPanel.online}
                      </div>
                    </div>

                    <AiOrb />

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {copy.aiPanel.chips.map((chip) => (
                        <SystemChip key={chip} text={chip} />
                      ))}
                    </div>

                    <div className="mt-7 space-y-4">
                      {copy.aiPanel.chats.map((chat, index) => (
                        <ChatBubble
                          key={`${chat.role}-${index}`}
                          role={chat.role}
                          text={chat.text}
                          labels={copy.labels}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl backdrop-blur-xl md:p-12">
              <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
                <SectionHeading
                  eyebrow={copy.who.eyebrow}
                  title={
                    <>
                      {copy.who.titleA}{" "}
                      <GradientText>{copy.who.titleGradient}</GradientText>
                    </>
                  }
                  text={copy.who.text}
                />

                <div className="space-y-5 text-base leading-8 text-white/72">
                  {copy.who.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow={copy.different.eyebrow}
              title={
                <>
                  {copy.different.titleA}{" "}
                  <GradientText>{copy.different.titleGradient}</GradientText>
                </>
              }
              text={copy.different.text}
              center
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {copy.highlights.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <HoverCard>
                  <div
                    className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,122,0,0.20), rgba(139,92,246,0.18), rgba(0,217,255,0.12))",
                      color: brandOrange,
                    }}
                  >
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-black tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/68">
                    {item.text}
                  </p>
                </HoverCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="sticky top-24">
                <SectionHeading
                  eyebrow={copy.evolution.eyebrow}
                  title={
                    <>
                      {copy.evolution.titleA}{" "}
                      <GradientText>{copy.evolution.titleGradient}</GradientText>
                    </>
                  }
                  text={copy.evolution.text}
                />

                <div className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.08),rgba(139,92,246,0.08),rgba(0,217,255,0.07))] p-6 backdrop-blur-xl">
                  <p className="text-sm leading-7 text-white/76">
                    {copy.evolution.note}
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="space-y-5">
              {copy.evolution.timeline.map((item, index) => (
                <Reveal key={item.number} delay={index * 80}>
                  <TimelineCard
                    number={item.number}
                    title={item.title}
                    text={item.text}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow={copy.services.eyebrow}
              title={
                <>
                  {copy.services.titleA}{" "}
                  <GradientText>{copy.services.titleGradient}</GradientText>
                </>
              }
              text={copy.services.text}
              center
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {copy.services.cards.map((service, index) => (
              <Reveal key={service.title} delay={index * 70}>
                <ServiceCard
                  title={service.title}
                  text={service.text}
                  label={copy.labels.nexaSystem}
                />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.16),rgba(139,92,246,0.10),rgba(0,217,255,0.09),rgba(255,255,255,0.035))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[95px]" />
              <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-orange-500/10 blur-[95px]" />

              <div className="relative max-w-5xl">
                <p className="text-sm font-black uppercase tracking-[0.32em] text-orange-200/85">
                  {copy.mission.eyebrow}
                </p>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                  {copy.mission.titleA}{" "}
                  <GradientText>{copy.mission.titleGradient}</GradientText>
                </h2>
                <p className="mt-6 max-w-4xl text-base leading-8 text-white/74 md:text-lg">
                  {copy.mission.text}
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <Reveal>
              <SectionHeading
                eyebrow={copy.promise.eyebrow}
                title={
                  <>
                    {copy.promise.titleA}{" "}
                    <GradientText>{copy.promise.titleGradient}</GradientText>
                  </>
                }
                text={copy.promise.text}
              />
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {copy.promise.points.map((item, index) => (
                <Reveal key={item} delay={index * 45}>
                  <PromiseCard text={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow={copy.faq.eyebrow}
              title={
                <>
                  {copy.faq.titleA}{" "}
                  <GradientText>{copy.faq.titleGradient}</GradientText>
                </>
              }
              text={copy.faq.text}
              center
            />
          </Reveal>

          <div className="mt-12 space-y-4">
            {copy.faq.items.map((item, index) => (
              <Reveal key={item.q} delay={index * 70}>
                <details className="group rounded-[24px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-300 open:border-white/20 open:bg-white/[0.07] hover:border-cyan-300/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-black">
                    {item.q}
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm transition duration-300 group-open:rotate-45"
                      style={{ color: brandOrange }}
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-8 md:px-10 md:pb-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.18),rgba(139,92,246,0.14),rgba(0,217,255,0.12),rgba(255,255,255,0.04))] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-12">
              <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[95px]" />
              <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-[95px]" />

              <div className="relative max-w-4xl">
                <p className="text-sm font-black uppercase tracking-[0.32em] text-orange-100/80">
                  {copy.finalCta.eyebrow}
                </p>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.045em] md:text-6xl">
                  {copy.finalCta.titleA}{" "}
                  <GradientText>{copy.finalCta.titleGradient}</GradientText>.
                </h2>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/76 md:text-lg">
                  {copy.finalCta.text}
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    href={`/${locale}/fleet`}
                    className="group relative inline-flex min-h-[58px] items-center justify-center overflow-hidden rounded-2xl px-7 text-sm font-bold text-black transition duration-300 hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${brandOrange} 0%, #ffd3aa 36%, ${neonPurple} 72%, ${neonBlue} 100%)`,
                      boxShadow: "0 18px 45px rgba(255,122,0,0.28)",
                    }}
                  >
                    <span className="relative z-10">{copy.viewFleet}</span>
                    <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                  </Link>

                  <Link
                    href={`/${locale}`}
                    className="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.04] hover:border-cyan-300/40 hover:bg-white/[0.1]"
                  >
                    {copy.finalCta.bookOnline}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <GlobalAboutStyles />
    </>
  );
}

function AiOrb() {
  return (
    <div className="relative mt-8 flex justify-center">
      <div className="relative h-[235px] w-[235px]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.58),rgba(139,92,246,0.5),rgba(0,217,255,0.36),rgba(255,255,255,0.07),transparent_74%)] blur-[3px] animate-pulse" />
        <div className="absolute inset-[12px] rounded-full border border-white/12 bg-[radial-gradient(circle,rgba(255,122,0,0.28),rgba(139,92,246,0.20),rgba(0,217,255,0.18),rgba(0,0,0,0.22))] backdrop-blur-xl" />
        <div className="absolute inset-[32px] rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.12),rgba(255,122,0,0.14),rgba(139,92,246,0.12),rgba(0,217,255,0.1),transparent_82%)] backdrop-blur-xl" />
        <div className="absolute inset-[58px] rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(255,122,0,0.45),rgba(139,92,246,0.42),rgba(0,217,255,0.38),transparent_100%)] shadow-[0_0_44px_rgba(255,255,255,0.18)]" />

        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
        <div className="orb-ring orb-ring-4" />

        <div className="orb-node orb-node-1" />
        <div className="orb-node orb-node-2" />
        <div className="orb-node orb-node-3" />
        <div className="orb-node orb-node-4" />
        <div className="orb-node orb-node-5" />
      </div>
    </div>
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
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-10 opacity-0 blur-sm"
      }`}
    >
      {children}
    </div>
  );
}

function GlowBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/84 shadow-2xl backdrop-blur-xl">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
          style={{ backgroundColor: brandOrange }}
        />
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: brandOrange }}
        />
      </span>
      {children}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <p className="text-sm font-black uppercase tracking-[0.32em] text-white/42">
        {eyebrow}
      </p>
      <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-white/70 md:text-lg">
        {text}
      </p>
    </div>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage: `linear-gradient(135deg, ${brandOrange} 0%, ${neonPurple} 48%, ${neonBlue} 100%)`,
      }}
    >
      {children}
    </span>
  );
}

function StatCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] px-5 py-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="text-2xl font-black tracking-tight">{title}</div>
      <div className="mt-1 text-sm text-white/62">{subtitle}</div>
    </div>
  );
}

function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-3 hover:scale-[1.015] hover:border-white/20 hover:bg-white/[0.075] hover:shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/12" />
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/80 to-transparent" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function TimelineCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045] p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.07] hover:shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
      <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-orange-500 via-purple-400 to-cyan-300 opacity-70" />
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-purple-400/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="flex gap-5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-black"
          style={{
            background: `linear-gradient(135deg, ${brandOrange}, #ffd9ae)`,
          }}
        >
          {number}
        </div>

        <div>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{text}</p>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  title,
  text,
  label,
}: {
  title: string;
  text: string;
  label: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:bg-purple-500/10" />
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/38">
          {label}
        </p>
        <h3 className="mt-4 text-2xl font-black tracking-tight">
          <GradientText>{title}</GradientText>
        </h3>
        <p className="mt-4 text-base leading-8 text-white/70">{text}</p>
      </div>
    </div>
  );
}

function PromiseCard({ text }: { text: string }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.045] px-5 py-4 text-sm font-semibold text-white/82 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
      <div className="flex items-start gap-3">
        <CheckMark />
        <span>{text}</span>
      </div>
    </div>
  );
}

function ChatBubble({
  role,
  text,
  labels,
}: {
  role: "customer" | "ai";
  text: string;
  labels: AboutCopy["labels"];
}) {
  const isAi = role === "ai";

  return (
    <div className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
          isAi
            ? "border border-orange-400/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.10),rgba(139,92,246,0.08),rgba(0,217,255,0.06))] text-white/82"
            : "border border-white/10 bg-white/[0.07] text-white/70"
        }`}
      >
        <div
          className={`mb-1 text-[10px] font-black uppercase tracking-[0.24em] ${
            isAi ? "text-orange-200/80" : "text-white/38"
          }`}
        >
          {isAi ? labels.neroAi : labels.customer}
        </div>
        {text}
      </div>
    </div>
  );
}

function SystemChip({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-center text-xs font-bold text-white/72 backdrop-blur transition duration-300 hover:border-cyan-300/25 hover:bg-white/[0.09]">
      {text}
    </div>
  );
}

function CheckMark() {
  return (
    <span
      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,122,0,0.20), rgba(139,92,246,0.16), rgba(0,217,255,0.12))",
        color: brandOrange,
      }}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 10.5L8 14L15.5 6.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path
        d="M13 2L5 13H11L10 22L18 11H12L13 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3.6 9H20.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.6 15H20.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3C14.2 5.3 15.4 8.2 15.4 12C15.4 15.8 14.2 18.7 12 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3C9.8 5.3 8.6 8.2 8.6 12C8.6 15.8 9.8 18.7 12 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path d="M9 3H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M7.5 6H16.5C18.433 6 20 7.567 20 9.5V15.5C20 17.433 18.433 19 16.5 19H7.5C5.567 19 4 17.433 4 15.5V9.5C4 7.567 5.567 6 7.5 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M9 12H9.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M15 12H15.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M9.5 15C10.3 15.7 11.1 16 12 16C12.9 16 13.7 15.7 14.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 11H2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21.5 11H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
      <path
        d="M3 16C5 16 5.5 8 8 8C10.5 8 11 16 13.5 16C16 16 16.5 8 19 8C21 8 21 13 21 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobalAboutStyles() {
  return (
    <style jsx global>{`
      .floating-particle {
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
        animation: floaty 11s ease-in-out infinite;
      }

      .particle-1 {
        width: 8px;
        height: 8px;
        left: 12%;
        top: 22%;
        animation-delay: 0s;
      }

      .particle-2 {
        width: 12px;
        height: 12px;
        left: 78%;
        top: 18%;
        animation-delay: 1.5s;
      }

      .particle-3 {
        width: 9px;
        height: 9px;
        left: 65%;
        top: 48%;
        animation-delay: 3s;
      }

      .particle-4 {
        width: 11px;
        height: 11px;
        left: 28%;
        top: 62%;
        animation-delay: 2s;
      }

      .particle-5 {
        width: 7px;
        height: 7px;
        left: 88%;
        top: 72%;
        animation-delay: 5s;
      }

      .particle-6 {
        width: 10px;
        height: 10px;
        left: 42%;
        top: 30%;
        animation-delay: 4s;
      }

      .particle-7 {
        width: 9px;
        height: 9px;
        left: 18%;
        top: 78%;
        animation-delay: 6s;
      }

      .particle-8 {
        width: 13px;
        height: 13px;
        left: 70%;
        top: 82%;
        animation-delay: 7s;
      }

      .cyber-line {
        position: absolute;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.7),
          transparent
        );
        filter: blur(0.3px);
        animation: driftLine 14s linear infinite;
      }

      .cyber-line-1 {
        top: 18%;
        left: -10%;
        width: 45%;
        transform: rotate(11deg);
        animation-delay: 0s;
      }

      .cyber-line-2 {
        top: 42%;
        right: -12%;
        width: 48%;
        transform: rotate(-14deg);
        animation-delay: 2.2s;
      }

      .cyber-line-3 {
        top: 68%;
        left: 12%;
        width: 36%;
        transform: rotate(8deg);
        animation-delay: 1.2s;
      }

      .orb-ring {
        position: absolute;
        inset: 50%;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        transform: translate(-50%, -50%);
      }

      .orb-ring-1 {
        width: 142px;
        height: 142px;
        animation: spinSlow 14s linear infinite;
      }

      .orb-ring-2 {
        width: 170px;
        height: 170px;
        border-color: rgba(0, 217, 255, 0.22);
        animation: spinReverse 18s linear infinite;
      }

      .orb-ring-3 {
        width: 194px;
        height: 194px;
        border-color: rgba(139, 92, 246, 0.18);
        animation: spinSlow 24s linear infinite;
      }

      .orb-ring-4 {
        width: 216px;
        height: 216px;
        border-color: rgba(255, 122, 0, 0.16);
        animation: spinReverse 28s linear infinite;
      }

      .orb-node {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 1) 0%,
          rgba(255, 122, 0, 0.82) 40%,
          rgba(0, 217, 255, 0.65) 100%
        );
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.25);
      }

      .orb-node-1 {
        top: 28px;
        left: 104px;
      }

      .orb-node-2 {
        top: 82px;
        right: 12px;
      }

      .orb-node-3 {
        bottom: 34px;
        left: 46px;
      }

      .orb-node-4 {
        top: 138px;
        left: 14px;
      }

      .orb-node-5 {
        top: 168px;
        left: 146px;
      }

      @keyframes floaty {
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

      @keyframes driftLine {
        0% {
          transform: translateX(0) translateY(0) rotate(12deg);
          opacity: 0;
        }
        15% {
          opacity: 0.55;
        }
        50% {
          opacity: 0.75;
        }
        85% {
          opacity: 0.3;
        }
        100% {
          transform: translateX(30px) translateY(-8px) rotate(12deg);
          opacity: 0;
        }
      }

      @keyframes spinSlow {
        from {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }

      @keyframes spinReverse {
        from {
          transform: translate(-50%, -50%) rotate(360deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(0deg);
        }
      }
    `}</style>
  );
}