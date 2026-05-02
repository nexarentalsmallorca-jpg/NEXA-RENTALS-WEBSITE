"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type BenefitCard = {
  title: string;
  image: string;
  words: string[];
};

const benefits: BenefitCard[] = [
  {
    title: "Express Booking",
    image: "/images/R4.png",
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
    image: "/images/R5.png",
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
    image: "/images/R6.png",
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
    image: "/images/R2.png",
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
    image: "/images/R3.png",
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
];

const mobileBenefits = benefits.slice(0, 4);

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 70,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function FlipCard({ item, index }: { item: BenefitCard; index: number }) {
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
                NEXA Promise
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

function MobileMiniCard({ item, index }: { item: BenefitCard; index: number }) {
  const shortText = item.words.slice(0, 6).join(" ");

  return (
    <motion.div
      variants={itemVariants}
      className="mobile-mini-card relative min-w-0 [perspective:900px]"
    >
      <div
        className="mobile-flip-inner relative h-full w-full rounded-[16px] [transform-style:preserve-3d]"
        style={{
          animationDelay: `${1.15 + index * 1.65}s`,
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
              NEXA
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
  return (
    <section className="relative isolate overflow-hidden bg-black px-[clamp(14px,2vw,32px)] py-[clamp(34px,5vw,78px)]">
      <div className="mx-auto w-full max-w-[1580px]">
        <div className="mb-[clamp(20px,3.5vw,44px)] text-center">
          <h2 className="text-[30px] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[clamp(36px,4vw,64px)]">
            Why Riders Choose NEXA
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
            <MobileMiniCard key={item.title} item={item} index={index} />
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.28 }}
          className="hidden grid-cols-1 gap-[clamp(18px,1.8vw,28px)] sm:grid sm:grid-cols-2 lg:grid-cols-5"
        >
          {benefits.map((item, index) => (
            <FlipCard key={item.title} item={item} index={index} />
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
          7% {
            transform: rotateY(0deg);
          }

          11%,
          23% {
            transform: rotateY(180deg);
          }

          27%,
          100% {
            transform: rotateY(0deg);
          }
        }

        .mobile-mini-card {
          height: 116px;
        }

        .mobile-flip-inner {
          animation-name: nexaMobileCardFlipSequence;
          animation-duration: 6.6s;
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