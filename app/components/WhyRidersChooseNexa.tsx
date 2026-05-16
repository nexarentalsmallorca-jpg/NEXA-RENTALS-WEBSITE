"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";

type Locale = "en" | "es" | "de" | "fr" | "it" | "pt" | "sv";

type BenefitCard = {
  title: string;
  image: string;
  words: string[];
};

const IMAGES = {
  express: "/images/R4.png",
  unlimited: "/images/R5.png",
  maintenance: "/images/R6.png",
  inclusive: "/images/R2.png",
  support: "/images/R3.png",
};

const COPY: Record<
  Locale,
  {
    heading: string;
    promise: string;
    nexa: string;
    benefits: BenefitCard[];
  }
> = {
  en: {
    heading: "Why Riders Choose NEXA",
    promise: "NEXA Promise",
    nexa: "NEXA",
    benefits: [
      {
        title: "Express Booking",
        image: IMAGES.express,
        words: [
          "Fast",
          "online",
          "booking",
          "with",
          "clear",
          "pickup",
          "and",
          "return",
          "details.",
        ],
      },
      {
        title: "Unlimited Kilometers",
        image: IMAGES.unlimited,
        words: [
          "Explore",
          "Mallorca",
          "freely",
          "without",
          "worrying",
          "about",
          "distance",
          "limits.",
        ],
      },
      {
        title: "Precision Maintenance",
        image: IMAGES.maintenance,
        words: [
          "Regular",
          "check-ups,",
          "daily",
          "cleaning",
          "and",
          "careful",
          "preparation",
          "before",
          "every",
          "rental.",
        ],
      },
      {
        title: "All Inclusive",
        image: IMAGES.inclusive,
        words: [
          "Helmets,",
          "security",
          "lock",
          "and",
          "phone",
          "holder",
          "included",
          "with",
          "your",
          "ride.",
        ],
      },
      {
        title: "Local Support",
        image: IMAGES.support,
        words: [
          "Friendly",
          "local",
          "support",
          "from",
          "Magaluf",
          "whenever",
          "you",
          "need",
          "help.",
        ],
      },
    ],
  },

  es: {
    heading: "Por qué los riders eligen NEXA",
    promise: "Promesa NEXA",
    nexa: "NEXA",
    benefits: [
      {
        title: "Reserva rápida",
        image: IMAGES.express,
        words: [
          "Reserva",
          "online",
          "rápida",
          "con",
          "detalles",
          "claros",
          "de",
          "recogida",
          "y",
          "devolución.",
        ],
      },
      {
        title: "Kilómetros ilimitados",
        image: IMAGES.unlimited,
        words: [
          "Explora",
          "Mallorca",
          "libremente",
          "sin",
          "preocuparte",
          "por",
          "límites",
          "de",
          "distancia.",
        ],
      },
      {
        title: "Mantenimiento preciso",
        image: IMAGES.maintenance,
        words: [
          "Revisiones",
          "regulares,",
          "limpieza",
          "diaria",
          "y",
          "preparación",
          "cuidadosa",
          "antes",
          "de",
          "cada",
          "alquiler.",
        ],
      },
      {
        title: "Todo incluido",
        image: IMAGES.inclusive,
        words: [
          "Cascos,",
          "candado",
          "de",
          "seguridad",
          "y",
          "soporte",
          "de",
          "móvil",
          "incluidos.",
        ],
      },
      {
        title: "Soporte local",
        image: IMAGES.support,
        words: [
          "Soporte",
          "local",
          "amable",
          "desde",
          "Magaluf",
          "siempre",
          "que",
          "necesites",
          "ayuda.",
        ],
      },
    ],
  },

  de: {
    heading: "Warum Fahrer NEXA wählen",
    promise: "NEXA Versprechen",
    nexa: "NEXA",
    benefits: [
      {
        title: "Express-Buchung",
        image: IMAGES.express,
        words: [
          "Schnelle",
          "Online-Buchung",
          "mit",
          "klaren",
          "Details",
          "zur",
          "Abholung",
          "und",
          "Rückgabe.",
        ],
      },
      {
        title: "Unbegrenzte Kilometer",
        image: IMAGES.unlimited,
        words: [
          "Entdecke",
          "Mallorca",
          "frei",
          "ohne",
          "Sorgen",
          "über",
          "Kilometerlimits.",
        ],
      },
      {
        title: "Präzise Wartung",
        image: IMAGES.maintenance,
        words: [
          "Regelmäßige",
          "Checks,",
          "tägliche",
          "Reinigung",
          "und",
          "sorgfältige",
          "Vorbereitung",
          "vor",
          "jeder",
          "Miete.",
        ],
      },
      {
        title: "Alles inklusive",
        image: IMAGES.inclusive,
        words: [
          "Helme,",
          "Sicherheitsschloss",
          "und",
          "Handyhalterung",
          "sind",
          "bei",
          "deiner",
          "Fahrt",
          "inklusive.",
        ],
      },
      {
        title: "Lokaler Support",
        image: IMAGES.support,
        words: [
          "Freundlicher",
          "lokaler",
          "Support",
          "aus",
          "Magaluf",
          "wann",
          "immer",
          "du",
          "Hilfe",
          "brauchst.",
        ],
      },
    ],
  },

  fr: {
    heading: "Pourquoi les riders choisissent NEXA",
    promise: "Promesse NEXA",
    nexa: "NEXA",
    benefits: [
      {
        title: "Réservation express",
        image: IMAGES.express,
        words: [
          "Réservation",
          "en",
          "ligne",
          "rapide",
          "avec",
          "des",
          "détails",
          "clairs",
          "de",
          "retrait",
          "et",
          "retour.",
        ],
      },
      {
        title: "Kilomètres illimités",
        image: IMAGES.unlimited,
        words: [
          "Explorez",
          "Majorque",
          "librement",
          "sans",
          "vous",
          "soucier",
          "des",
          "limites",
          "de",
          "distance.",
        ],
      },
      {
        title: "Entretien précis",
        image: IMAGES.maintenance,
        words: [
          "Contrôles",
          "réguliers,",
          "nettoyage",
          "quotidien",
          "et",
          "préparation",
          "soignée",
          "avant",
          "chaque",
          "location.",
        ],
      },
      {
        title: "Tout inclus",
        image: IMAGES.inclusive,
        words: [
          "Casques,",
          "antivol",
          "et",
          "support",
          "téléphone",
          "inclus",
          "avec",
          "votre",
          "location.",
        ],
      },
      {
        title: "Support local",
        image: IMAGES.support,
        words: [
          "Support",
          "local",
          "sympathique",
          "depuis",
          "Magaluf",
          "chaque",
          "fois",
          "que",
          "vous",
          "avez",
          "besoin",
          "d’aide.",
        ],
      },
    ],
  },

  it: {
    heading: "Perché i clienti scelgono NEXA",
    promise: "Promessa NEXA",
    nexa: "NEXA",
    benefits: [
      {
        title: "Prenotazione rapida",
        image: IMAGES.express,
        words: [
          "Prenotazione",
          "online",
          "veloce",
          "con",
          "dettagli",
          "chiari",
          "di",
          "ritiro",
          "e",
          "riconsegna.",
        ],
      },
      {
        title: "Chilometri illimitati",
        image: IMAGES.unlimited,
        words: [
          "Esplora",
          "Maiorca",
          "liberamente",
          "senza",
          "preoccuparti",
          "dei",
          "limiti",
          "di",
          "distanza.",
        ],
      },
      {
        title: "Manutenzione precisa",
        image: IMAGES.maintenance,
        words: [
          "Controlli",
          "regolari,",
          "pulizia",
          "quotidiana",
          "e",
          "preparazione",
          "accurata",
          "prima",
          "di",
          "ogni",
          "noleggio.",
        ],
      },
      {
        title: "Tutto incluso",
        image: IMAGES.inclusive,
        words: [
          "Caschi,",
          "lucchetto",
          "di",
          "sicurezza",
          "e",
          "supporto",
          "telefono",
          "inclusi.",
        ],
      },
      {
        title: "Supporto locale",
        image: IMAGES.support,
        words: [
          "Supporto",
          "locale",
          "cordiale",
          "da",
          "Magaluf",
          "ogni",
          "volta",
          "che",
          "hai",
          "bisogno.",
        ],
      },
    ],
  },

  pt: {
    heading: "Porque os clientes escolhem a NEXA",
    promise: "Promessa NEXA",
    nexa: "NEXA",
    benefits: [
      {
        title: "Reserva rápida",
        image: IMAGES.express,
        words: [
          "Reserva",
          "online",
          "rápida",
          "com",
          "detalhes",
          "claros",
          "de",
          "levantamento",
          "e",
          "devolução.",
        ],
      },
      {
        title: "Quilómetros ilimitados",
        image: IMAGES.unlimited,
        words: [
          "Explore",
          "Maiorca",
          "livremente",
          "sem",
          "se",
          "preocupar",
          "com",
          "limites",
          "de",
          "distância.",
        ],
      },
      {
        title: "Manutenção precisa",
        image: IMAGES.maintenance,
        words: [
          "Revisões",
          "regulares,",
          "limpeza",
          "diária",
          "e",
          "preparação",
          "cuidadosa",
          "antes",
          "de",
          "cada",
          "aluguer.",
        ],
      },
      {
        title: "Tudo incluído",
        image: IMAGES.inclusive,
        words: [
          "Capacetes,",
          "cadeado",
          "de",
          "segurança",
          "e",
          "suporte",
          "de",
          "telemóvel",
          "incluídos.",
        ],
      },
      {
        title: "Suporte local",
        image: IMAGES.support,
        words: [
          "Suporte",
          "local",
          "amigável",
          "em",
          "Magaluf",
          "sempre",
          "que",
          "precisar",
          "de",
          "ajuda.",
        ],
      },
    ],
  },

  sv: {
    heading: "Varför kunder väljer NEXA",
    promise: "NEXA-löftet",
    nexa: "NEXA",
    benefits: [
      {
        title: "Snabb bokning",
        image: IMAGES.express,
        words: [
          "Snabb",
          "onlinebokning",
          "med",
          "tydliga",
          "detaljer",
          "för",
          "uthämtning",
          "och",
          "återlämning.",
        ],
      },
      {
        title: "Obegränsade kilometer",
        image: IMAGES.unlimited,
        words: [
          "Utforska",
          "Mallorca",
          "fritt",
          "utan",
          "att",
          "oroa",
          "dig",
          "för",
          "distansgränser.",
        ],
      },
      {
        title: "Noggrant underhåll",
        image: IMAGES.maintenance,
        words: [
          "Regelbundna",
          "kontroller,",
          "daglig",
          "rengöring",
          "och",
          "noggrann",
          "förberedelse",
          "före",
          "varje",
          "hyra.",
        ],
      },
      {
        title: "Allt inkluderat",
        image: IMAGES.inclusive,
        words: [
          "Hjälmar,",
          "säkerhetslås",
          "och",
          "mobilhållare",
          "ingår",
          "med",
          "din",
          "tur.",
        ],
      },
      {
        title: "Lokal support",
        image: IMAGES.support,
        words: [
          "Vänlig",
          "lokal",
          "support",
          "från",
          "Magaluf",
          "när",
          "du",
          "behöver",
          "hjälp.",
        ],
      },
    ],
  },
};

function getSafeLocale(locale: string): Locale {
  return ["en", "es", "de", "fr", "it", "pt", "sv"].includes(locale)
    ? (locale as Locale)
    : "en";
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 70,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: "easeOut",
    },
  },
};

function FlipCard({
  item,
  index,
  promise,
}: {
  item: BenefitCard;
  index: number;
  promise: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="group h-[clamp(310px,25vw,370px)] w-full min-w-0 [perspective:1400px]"
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 0.4, -0.4, 0] }}
        transition={{
          duration: 4.8 + index * 0.25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-full w-full"
      >
        <div className="relative h-full w-full rounded-[clamp(24px,2vw,30px)] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
          <div className="absolute inset-0 overflow-hidden rounded-[clamp(24px,2vw,30px)] border border-white/10 bg-[#050505] shadow-[0_28px_80px_rgba(0,0,0,0.6)] [backface-visibility:hidden]">
            <div className="relative h-[calc(100%-clamp(76px,6vw,90px))] w-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 20vw, 300px"
                className="object-cover transition duration-700 group-hover:scale-105"
                priority={index < 3}
              />
            </div>

            <div className="flex h-[clamp(76px,6vw,90px)] items-center justify-center border-t border-white/10 bg-black px-4">
              <h3 className="text-center text-[clamp(18px,1.55vw,22px)] font-black tracking-[-0.04em] text-white">
                {item.title}
              </h3>
            </div>
          </div>

          <div className="absolute inset-0 rounded-[clamp(24px,2vw,30px)] border border-[#FF7A00]/35 bg-[radial-gradient(circle_at_50%_0%,rgba(255,122,0,0.28),transparent_44%),linear-gradient(145deg,#111111,#000000)] p-[clamp(14px,1.35vw,20px)] shadow-[0_30px_90px_rgba(255,122,0,0.16)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex h-full w-full flex-col justify-center rounded-[clamp(20px,1.6vw,24px)] border border-white/10 bg-black/45 p-[clamp(16px,1.75vw,24px)] backdrop-blur-xl">
              <div className="mb-4 w-fit rounded-full bg-[#FF7A00] px-3 py-1 text-[clamp(8px,0.65vw,10px)] font-black uppercase tracking-[0.14em] text-black">
                {promise}
              </div>

              <h3 className="text-[clamp(21px,1.9vw,27px)] font-black leading-none tracking-[-0.05em] text-white">
                {item.title}
              </h3>

              <div className="mt-5 flex flex-wrap gap-x-1.5 gap-y-2 text-[clamp(13px,1.1vw,16px)] font-semibold leading-[1.65] text-white/82">
                {item.words.map((word, wordIndex) => (
                  <span
                    key={`${item.title}-${word}-${wordIndex}`}
                    className="opacity-0 group-hover:animate-[nexaWord_0.32s_ease_forwards]"
                    style={{
                      animationDelay: `${0.18 + wordIndex * 0.13}s`,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileMiniCard({
  item,
  index,
  nexa,
}: {
  item: BenefitCard;
  index: number;
  nexa: string;
}) {
  const shortText = item.words.slice(0, 6).join(" ");

  return (
    <motion.div
      variants={itemVariants}
      className="mobile-mini-card relative min-w-0 [perspective:900px]"
    >
      <div
        className="mobile-flip-inner relative h-full w-full rounded-[16px] [transform-style:preserve-3d]"
        style={{
          animationDelay: `${1.15 + index * 2.05}s`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-white/10 bg-[#050505] shadow-[0_16px_45px_rgba(0,0,0,0.48)] [backface-visibility:hidden]">
          <div className="relative h-[74px] w-full overflow-hidden bg-black">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="25vw"
              className="object-cover"
              priority={index < 2}
            />
          </div>

          <div className="flex h-[42px] items-center justify-center border-t border-white/10 bg-black px-1.5">
            <h3 className="text-center text-[10px] font-black leading-tight tracking-[-0.04em] text-white">
              {item.title}
            </h3>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden rounded-[16px] border border-[#FF7A00]/35 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.32),transparent_48%),linear-gradient(145deg,#111111,#000000)] p-2 shadow-[0_16px_42px_rgba(255,122,0,0.16)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex h-full w-full flex-col justify-center rounded-[12px] border border-white/10 bg-black/45 px-2 py-2 text-center backdrop-blur-xl">
            <div className="mx-auto mb-1 rounded-full bg-[#FF7A00] px-2 py-[3px] text-[6px] font-black uppercase tracking-[0.12em] text-black">
              {nexa}
            </div>

            <h3 className="text-[9px] font-black leading-tight tracking-[-0.04em] text-white">
              {item.title}
            </h3>

            <p className="mt-1 text-[7.5px] font-semibold leading-[1.35] text-white/72">
              {shortText}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WhyRidersChooseNexa() {
  const locale = getSafeLocale(useLocale());
  const copy = COPY[locale];
  const mobileBenefits = copy.benefits.slice(0, 4);

  return (
    <section className="relative isolate overflow-hidden bg-black px-[clamp(14px,2vw,32px)] py-[clamp(34px,5vw,78px)]">
      <div className="mx-auto w-full max-w-[1580px]">
        <div className="mb-[clamp(20px,3.5vw,44px)] text-center">
          <h2 className="text-[30px] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[clamp(36px,4vw,64px)]">
            {copy.heading}
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.28 }}
          className="grid grid-cols-4 gap-2 sm:hidden"
        >
          {mobileBenefits.map((item, index) => (
            <MobileMiniCard
              key={item.title}
              item={item}
              index={index}
              nexa={copy.nexa}
            />
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.28 }}
          className="hidden grid-cols-1 gap-[clamp(18px,1.8vw,28px)] sm:grid sm:grid-cols-2 lg:grid-cols-5"
        >
          {copy.benefits.map((item, index) => (
            <FlipCard
              key={item.title}
              item={item}
              index={index}
              promise={copy.promise}
            />
          ))}
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes nexaWord {
          from {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes nexaMobileCardFlipSequence {
          0%,
          9% {
            transform: rotateY(0deg);
          }

          16%,
          35% {
            transform: rotateY(180deg);
          }

          42%,
          100% {
            transform: rotateY(0deg);
          }
        }

        .mobile-mini-card {
          height: 116px;
        }

        .mobile-flip-inner {
          animation-name: nexaMobileCardFlipSequence;
          animation-duration: 8.2s;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-iteration-count: infinite;
          animation-fill-mode: both;
          will-change: transform;
        }

        @media (min-width: 641px) {
          .mobile-flip-inner {
            animation: none !important;
          }
        }

        @media (min-width: 1024px) and (max-width: 1280px) {
          .group.h-\\[clamp\\(310px\\,25vw\\,370px\\)\\] {
            height: 320px;
          }
        }

        @media (min-width: 1281px) and (max-width: 1536px) {
          .group.h-\\[clamp\\(310px\\,25vw\\,370px\\)\\] {
            height: 345px;
          }
        }

        @media (min-width: 1537px) {
          .group.h-\\[clamp\\(310px\\,25vw\\,370px\\)\\] {
            height: 370px;
          }
        }
      `}</style>
    </section>
  );
}