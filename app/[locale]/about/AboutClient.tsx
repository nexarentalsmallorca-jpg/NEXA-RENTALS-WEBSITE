"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/Navbar";

const brandOrange = "#FF7A00";
const neonBlue = "#00D9FF";
const neonPurple = "#8B5CF6";

const highlights = [
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
];

const aiTimeline = [
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
];

const serviceCards = [
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
];

const promisePoints = [
  "Advanced AI support on website and WhatsApp",
  "Fast online booking flow",
  "Premium digital-first experience",
  "Multilingual customer communication",
  "Tourist-friendly service",
  "Clear and professional information",
  "Modern brand presentation",
  "Smarter customer journey",
];

const faqs = [
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
];

export default function AboutClient() {
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

      {/* progress line */}
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

      {/* mouse spotlight */}
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
        {/* GLOBAL BACKGROUND */}
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

        {/* HERO */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-0 md:px-10 md:pb-20 md:pt-0">
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="relative">
                <GlowBadge>
                  Mallorca’s first AI-powered scooter rental experience
                </GlowBadge>

                <div className="mt-6">
                  <p className="mb-4 text-sm font-black uppercase tracking-[0.34em] text-white/42">
                    FUTURE-FIRST RENTAL BRAND
                  </p>

                  <h1 className="max-w-5xl text-[46px] font-black leading-[0.93] tracking-[-0.055em] sm:text-[62px] md:text-[78px] lg:text-[92px]">
                    We were the{" "}
                    <GradientText>first</GradientText> to bring an advanced{" "}
                    <GradientText>AI assistant</GradientText> into the scooter
                    rental experience in Mallorca.
                  </h1>
                </div>

                <p className="mt-7 max-w-3xl text-base leading-8 text-white/76 md:text-lg">
                  NEXA Rentals is a premium scooter and e-bike rental company in
                  Magaluf created to modernize the rental experience through
                  advanced technology, smarter communication, and a premium
                  digital-first customer journey.
                </p>

                <p className="mt-5 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                  Our AI assistant works on both the website and WhatsApp,
                  responds quickly, supports multiple languages, and helps
                  customers understand services, booking details, and general
                  rental information more intelligently.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    href="/fleet"
                    className="group relative inline-flex min-h-[58px] items-center justify-center overflow-hidden rounded-2xl px-7 text-sm font-bold text-black transition duration-300 hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${brandOrange} 0%, #ffd3a7 34%, ${neonPurple} 72%, ${neonBlue} 100%)`,
                      boxShadow: "0 18px 40px rgba(255,122,0,0.24)",
                    }}
                  >
                    <span className="relative z-10">View Fleet</span>
                    <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.04] hover:border-cyan-300/40 hover:bg-white/[0.1]"
                  >
                    Book Now
                  </Link>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-3">
                  <StatCard title="24/7" subtitle="AI Assistance" />
                  <StatCard title="Multi" subtitle="Language Support" />
                  <StatCard title="Fast" subtitle="Smart Booking" />
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
                          NEXA AI CORE
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight">
                          Nero Assistant
                        </h2>
                      </div>

                      <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                        Online 24/7
                      </div>
                    </div>

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

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <SystemChip text="Website AI" />
                      <SystemChip text="WhatsApp AI" />
                      <SystemChip text="Multilingual Replies" />
                      <SystemChip text="Human Handover" />
                    </div>

                    <div className="mt-7 space-y-4">
                      <ChatBubble
                        role="customer"
                        text="Hi, can I book a scooter tomorrow?"
                      />
                      <ChatBubble
                        role="ai"
                        text="Hi, I’m Nero, the AI assistant from NEXA Rentals. I can help with availability, booking details, prices, and general rental information."
                      />
                      <ChatBubble
                        role="customer"
                        text="Can you help in French too?"
                      />
                      <ChatBubble
                        role="ai"
                        text="Oui, bien sûr. Je peux vous aider en français et vous guider étape par étape."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl backdrop-blur-xl md:p-12">
              <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
                <SectionHeading
                  eyebrow="WHO WE ARE"
                  title={
                    <>
                      A premium mobility brand designed for the{" "}
                      <GradientText>future of customer experience</GradientText>
                    </>
                  }
                  text="NEXA Rentals is a modern scooter and e-bike rental company in Magaluf, Mallorca, created for customers who expect more speed, more clarity, and a more advanced service experience."
                />

                <div className="space-y-5 text-base leading-8 text-white/72">
                  <p>
                    We created NEXA Rentals to push the local rental experience
                    forward. Instead of relying on traditional methods, we built
                    a digital-first system that feels cleaner, faster, and more
                    intelligent.
                  </p>
                  <p>
                    Our company is known for premium presentation, advanced
                    support systems, futuristic visual design, and a modern
                    customer journey focused on convenience and quality.
                  </p>
                  <p>
                    NEXA Rentals is not only about scooters and e-bikes. It is
                    about creating a memorable and high-quality experience that
                    customers feel from the moment they land on the website.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* HIGHLIGHTS */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="WHY NEXA IS DIFFERENT"
              title={
                <>
                  A more futuristic, faster, and{" "}
                  <GradientText>smarter rental experience</GradientText>
                </>
              }
              text="NEXA Rentals combines technology, premium branding, and customer convenience into one complete mobility experience."
              center
            />
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item, index) => (
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

        {/* AI EVOLUTION */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="sticky top-24">
                <SectionHeading
                  eyebrow="THE AI EVOLUTION"
                  title={
                    <>
                      The first-mover approach to{" "}
                      <GradientText>instant rental support</GradientText>
                    </>
                  }
                  text="NEXA Rentals introduced AI-powered communication to give customers fast, intelligent, and multilingual assistance whenever they need it."
                />

                <div className="mt-8 rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.08),rgba(139,92,246,0.08),rgba(0,217,255,0.07))] p-6 backdrop-blur-xl">
                  <p className="text-sm leading-7 text-white/76">
                    Our AI assistant helps customers understand services,
                    pricing, booking options, and general rental information
                    more quickly and more clearly.
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="space-y-5">
              {aiTimeline.map((item, index) => (
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

        {/* SERVICES */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="WHAT WE OFFER"
              title={
                <>
                  Premium mobility connected with{" "}
                  <GradientText>advanced technology</GradientText>
                </>
              }
              text="NEXA Rentals offers a more complete mobility experience by combining vehicle rental with AI-powered support and digital convenience."
              center
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {serviceCards.map((service, index) => (
              <Reveal key={service.title} delay={index * 70}>
                <ServiceCard title={service.title} text={service.text} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* MISSION */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.16),rgba(139,92,246,0.10),rgba(0,217,255,0.09),rgba(255,255,255,0.035))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[95px]" />
              <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-orange-500/10 blur-[95px]" />

              <div className="relative max-w-5xl">
                <p className="text-sm font-black uppercase tracking-[0.32em] text-orange-200/85">
                  OUR MISSION
                </p>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] md:text-6xl">
                  To make renting in Mallorca{" "}
                  <GradientText>faster, smarter, and more memorable.</GradientText>
                </h2>
                <p className="mt-6 max-w-4xl text-base leading-8 text-white/74 md:text-lg">
                  Our mission is to modernize scooter and e-bike rental through
                  premium vehicles, advanced AI support, fast communication, and
                  a customer experience that feels modern from the first click.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* PROMISE GRID */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <Reveal>
              <SectionHeading
                eyebrow="THE NEXA PROMISE"
                title={
                  <>
                    Premium service powered by{" "}
                    <GradientText>smarter systems</GradientText>
                  </>
                }
                text="Every part of the NEXA Rentals experience is designed to make the customer journey clearer, faster, and more impressive."
              />
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {promisePoints.map((item, index) => (
                <Reveal key={item} delay={index * 45}>
                  <PromiseCard text={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title={
                <>
                  Frequently asked about{" "}
                  <GradientText>NEXA Rentals</GradientText>
                </>
              }
              text="This section helps both customers and search engines understand the page more clearly, making the About page stronger and more SEO-friendly."
              center
            />
          </Reveal>

          <div className="mt-12 space-y-4">
            {faqs.map((item, index) => (
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

        {/* FINAL CTA */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-8 md:px-10 md:pb-32">
          <Reveal>
            <div className="relative overflow-hidden rounded-[42px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,0,0.18),rgba(139,92,246,0.14),rgba(0,217,255,0.12),rgba(255,255,255,0.04))] p-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-12">
              <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-orange-500/15 blur-[95px]" />
              <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-[95px]" />

              <div className="relative max-w-4xl">
                <p className="text-sm font-black uppercase tracking-[0.32em] text-orange-100/80">
                  READY TO RIDE?
                </p>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.045em] md:text-6xl">
                  Discover Mallorca with{" "}
                  <GradientText>NEXA Rentals</GradientText>.
                </h2>
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/76 md:text-lg">
                  Book your scooter or e-bike online and enjoy a faster,
                  smarter, and more premium way to move around Magaluf and
                  Mallorca.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    href="/fleet"
                    className="group relative inline-flex min-h-[58px] items-center justify-center overflow-hidden rounded-2xl px-7 text-sm font-bold text-black transition duration-300 hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${brandOrange} 0%, #ffd3aa 36%, ${neonPurple} 72%, ${neonBlue} 100%)`,
                      boxShadow: "0 18px 45px rgba(255,122,0,0.28)",
                    }}
                  >
                    <span className="relative z-10">View Fleet</span>
                    <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                  </Link>

                  <Link
                    href="/"
                    className="inline-flex min-h-[58px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.04] hover:border-cyan-300/40 hover:bg-white/[0.1]"
                  >
                    Book Online
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

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
    </>
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

function ServiceCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:bg-purple-500/10" />
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/38">
          NEXA SYSTEM
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
}: {
  role: "customer" | "ai";
  text: string;
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
          {isAi ? "Nero AI" : "Customer"}
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      xmlns="http://www.w3.org/2000/svg"
    >
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.6 9H20.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3.6 15H20.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 3C14.2 5.3 15.4 8.2 15.4 12C15.4 15.8 14.2 18.7 12 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 3C9.8 5.3 8.6 8.2 8.6 12C8.6 15.8 9.8 18.7 12 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 3H15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 3V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7.5 6H16.5C18.433 6 20 7.567 20 9.5V15.5C20 17.433 18.433 19 16.5 19H7.5C5.567 19 4 17.433 4 15.5V9.5C4 7.567 5.567 6 7.5 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M9 12H9.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M15 12H15.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 15C10.3 15.7 11.1 16 12 16C12.9 16 13.7 15.7 14.5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 11H2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21.5 11H20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-7 w-7"
      xmlns="http://www.w3.org/2000/svg"
    >
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