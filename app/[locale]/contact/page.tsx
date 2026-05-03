"use client";

import Navbar from "@/app/Navbar";
import dynamic from "next/dynamic";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const NeroWebsiteAssistant = dynamic(
  () => import("@/app/components/NeroWebsiteAssistant"),
  {
    ssr: false,
    loading: () => null,
  }
);

const ORANGE = "#FF7A00";
const BLUE = "#00D9FF";
const PURPLE = "#8B5CF6";

const WHATSAPP_NUMBER = "34971482342";
const PHONE_DISPLAY = "+34 971 48 23 42";
const EMAIL = "info@nexarentals.es";
const ADDRESS = "Carrer Galeón 13, Magaluf, Mallorca";
const MAPS_LINK = "https://maps.app.goo.gl/YZBz7UeeHicKD4B99";

const NAVBAR_OFFSET = 170;

const quickQuestions = [
  "Can I rent a 125cc scooter with a car license?",
  "How much is the deposit?",
  "Is insurance included?",
  "Can I book a scooter for tomorrow?",
];

function ContactPageContent() {
  const aiSectionRef = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [scrollY, setScrollY] = useState(0);

  const focusNeroInput = () => {
    window.setTimeout(() => {
      const section = aiSectionRef.current;
      if (!section) return;

      const input = section.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLElement
      >(
        "textarea, input[type='text'], input:not([type]), [contenteditable='true']"
      );

      input?.focus();
    }, 750);
  };

  const scrollToNeroSection = () => {
    const section = aiSectionRef.current;
    if (!section) return;

    const y = section.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  const openNeroChat = (e?: React.MouseEvent<HTMLAnchorElement>) => {
    e?.preventDefault();

    scrollToNeroSection();
    window.history.replaceState(null, "", "#nexa-ai-chat");
    focusNeroInput();
  };

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    if (window.location.hash === "#nexa-ai-chat") {
      window.setTimeout(() => {
        scrollToNeroSection();
        focusNeroInput();
      }, 900);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const orbMove = useMemo(() => scrollY * 0.1, [scrollY]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fillFormWithQuestion = (question: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: question,
      message: `Hi NEXA Rentals, I have a question: ${question}`,
    }));

    setTimeout(() => {
      const form = document.getElementById("contact-form");
      if (!form) return;

      const y = form.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }, 80);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setSuccessMessage("Thank you. Your message has been sent successfully.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <div className="relative z-[10001]">
          <Navbar />
        </div>
      </Suspense>

      <main className="relative min-h-screen overflow-hidden bg-[#030303] px-4 pb-20 pt-10 text-white sm:px-6 md:pt-16">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(255,122,0,0.18),transparent_25%),radial-gradient(circle_at_92%_10%,rgba(0,217,255,0.12),transparent_28%),radial-gradient(circle_at_50%_88%,rgba(139,92,246,0.16),transparent_32%),linear-gradient(180deg,#020202_0%,#080808_50%,#030303_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.12]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.72)_80%)]" />

          <div
            className="absolute -left-28 top-24 h-[430px] w-[430px] rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(circle, rgba(255,122,0,0.22), rgba(255,122,0,0.08), transparent 74%)",
              transform: `translate3d(0, ${orbMove}px, 0)`,
            }}
          />

          <div
            className="absolute right-[-140px] top-[170px] h-[520px] w-[520px] rounded-full blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, rgba(0,217,255,0.14), rgba(139,92,246,0.14), transparent 76%)",
              transform: `translate3d(0, ${orbMove * 0.7}px, 0)`,
            }}
          />

          <div className="absolute inset-0 opacity-25 mix-blend-screen">
            <div className="floating-contact-particle contact-particle-1" />
            <div className="floating-contact-particle contact-particle-2" />
            <div className="floating-contact-particle contact-particle-3" />
            <div className="floating-contact-particle contact-particle-4" />
            <div className="floating-contact-particle contact-particle-5" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Hero */}
          <section className="grid items-center gap-10 pb-12 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:pt-12">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 shadow-2xl backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: ORANGE }}
                    />
                    <span
                      className="relative inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: ORANGE }}
                    />
                  </span>
                  Contact NEXA Rentals in Magaluf
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                  Contact{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, ${BLUE})`,
                    }}
                  >
                    NEXA Rentals
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                  Need help with scooter rental, e-bike rental, license rules,
                  deposit, insurance, pickup location, or booking details? Chat
                  with Nero AI, send us a message, or contact us directly on
                  WhatsApp.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex min-h-[56px] items-center justify-center overflow-hidden rounded-2xl px-7 text-sm font-bold text-black transition duration-300 hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 38%, ${PURPLE} 72%, ${BLUE} 100%)`,
                      boxShadow: "0 18px 45px rgba(255,122,0,0.25)",
                    }}
                  >
                    <span className="relative z-10">WhatsApp Us</span>
                    <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                  </a>

                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex min-h-[56px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.04] hover:border-cyan-300/40 hover:bg-white/[0.1]"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative">
                <div className="absolute -inset-10 rounded-[40px] bg-[radial-gradient(circle,rgba(255,122,0,0.18),rgba(139,92,246,0.14),rgba(0,217,255,0.12),transparent_75%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,122,0,0.13),rgba(139,92,246,0.09),rgba(0,217,255,0.07))]" />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

                  <div className="relative rounded-[28px] border border-white/10 bg-black/35 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.34em] text-white/40">
                          NERO AI CONTACT SUPPORT
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight">
                          Ask before you wait
                        </h2>
                      </div>

                      <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200">
                        Online
                      </div>
                    </div>

                    <div className="relative mt-8 flex justify-center">
                      <div className="relative h-[180px] w-[180px]">
                        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.58),rgba(139,92,246,0.48),rgba(0,217,255,0.34),rgba(255,255,255,0.07),transparent_74%)] blur-[3px] animate-pulse" />
                        <div className="absolute inset-[14px] rounded-full border border-white/15 bg-[radial-gradient(circle,rgba(255,122,0,0.24),rgba(139,92,246,0.22),rgba(0,217,255,0.16),rgba(0,0,0,0.22))] backdrop-blur-xl" />
                        <div className="absolute inset-[48px] rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(255,255,255,0.85),rgba(255,122,0,0.45),rgba(139,92,246,0.42),rgba(0,217,255,0.38),transparent_100%)] shadow-[0_0_44px_rgba(255,255,255,0.18)]" />

                        <div className="contact-orb-ring contact-orb-ring-1" />
                        <div className="contact-orb-ring contact-orb-ring-2" />
                        <div className="contact-orb-ring contact-orb-ring-3" />

                        <div className="contact-orb-node contact-orb-node-1" />
                        <div className="contact-orb-node contact-orb-node-2" />
                        <div className="contact-orb-node contact-orb-node-3" />
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-200/80">
                        Instant help
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/78">
                        Nero AI can help with prices, availability, license
                        rules, deposit, insurance, pickup location, and booking
                        details.
                      </p>
                    </div>

                    <a
                      href="#nexa-ai-chat"
                      onClick={openNeroChat}
                      className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl text-sm font-black text-black transition duration-300 hover:scale-[1.02]"
                      style={{
                        background: `linear-gradient(135deg, ${ORANGE}, #ffd3aa, ${BLUE})`,
                      }}
                    >
                      Chat with Nero AI now
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Contact Cards */}
          <section className="grid grid-cols-1 gap-5 pb-12 md:grid-cols-3">
            <ContactCard
              title="WhatsApp"
              label="Fast support for bookings"
              value={PHONE_DISPLAY}
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              icon="WA"
              delay={0}
            />

            <ContactCard
              title="Email"
              label="General inquiries"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
              icon="@"
              delay={80}
            />

            <ContactCard
              title="Pickup Location"
              label="Magaluf"
              value={ADDRESS}
              href={MAPS_LINK}
              icon="PIN"
              delay={160}
            />
          </section>

          {/* Full-width Nero AI assistant */}
          <section
            id="nexa-ai-chat"
            ref={aiSectionRef}
            className="scroll-mt-[170px] pb-14"
          >
            <Reveal>
              <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6 md:p-8">
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />
                <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-[100px]" />
                <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/10 blur-[110px]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="relative mb-7 text-center">
                  <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 shadow-2xl backdrop-blur-xl">
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: ORANGE }}
                      />
                      <span
                        className="relative inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ORANGE }}
                      />
                    </span>
                    Live AI support before you contact us
                  </div>

                  <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl md:text-5xl">
                    Chat instantly with{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${ORANGE}, ${PURPLE}, ${BLUE})`,
                      }}
                    >
                      Nero AI
                    </span>
                  </h2>

                  <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/66 md:text-base">
                    Ask Nero about scooter prices, license requirements,
                    deposits, insurance, pickup location, e-bikes, availability,
                    or booking details. If you still need personal help, use the
                    contact form below.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#050505] p-2 shadow-2xl md:p-4">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,122,0,0.08),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(0,217,255,0.08),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.08),transparent_35%)]" />

                  <div className="relative min-h-[760px] overflow-hidden rounded-[26px] border border-white/10 bg-black/40">
                    <NeroWebsiteAssistant />
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* Form + Quick Help */}
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div
                id="contact-form"
                className="relative scroll-mt-[170px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-xl sm:p-7 md:p-8"
              >
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-white/42">
                    DIRECT MESSAGE
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    Send us a message
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-white/62">
                    Your message will be sent directly to the NEXA Rentals team.
                    We usually reply as quickly as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />

                      <InputField
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                      />

                      <InputField
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <textarea
                      name="message"
                      placeholder="Your message..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="resize-none rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/38 focus:border-orange-400/50 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(255,122,0,0.08)] sm:text-base"
                    />

                    {successMessage && (
                      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        {successMessage}
                      </div>
                    )}

                    {errorMessage && (
                      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative mt-2 min-h-[56px] overflow-hidden rounded-2xl text-sm font-black text-black transition duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                      style={{
                        background: `linear-gradient(135deg, ${ORANGE} 0%, #ffd3aa 38%, ${PURPLE} 72%, ${BLUE} 100%)`,
                      }}
                    >
                      <span className="relative z-10">
                        {loading ? "Sending..." : "Send Message"}
                      </span>
                      <span className="absolute inset-0 translate-x-[-100%] bg-white/35 transition duration-700 group-hover:translate-x-[100%]" />
                    </button>
                  </form>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <aside className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl md:p-8">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute -bottom-20 left-4 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.32em] text-white/42">
                    QUICK CONTACT
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    Need faster support?
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-white/66">
                    For urgent bookings or quick questions, WhatsApp is usually
                    the fastest option. For detailed messages, use the form.
                  </p>

                  <div className="mt-7 space-y-3">
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => fillFormWithQuestion(question)}
                        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-left text-sm font-semibold text-white/68 transition duration-300 hover:-translate-y-1 hover:border-orange-400/35 hover:bg-white/[0.06] hover:text-white"
                      >
                        Fill form: {question}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 rounded-[26px] border border-white/10 bg-black/30 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-200/80">
                      Location
                    </p>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      We are located in Magaluf. Tap below to open the exact
                      pickup location in Google Maps.
                    </p>
                  </div>

                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 text-sm font-black text-white backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-cyan-300/35 hover:bg-white/[0.1]"
                  >
                    Open Directions
                  </a>

                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl px-6 text-sm font-black text-black transition duration-300 hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${ORANGE}, #ffd3aa, ${BLUE})`,
                    }}
                  >
                    Open WhatsApp
                  </a>
                </div>
              </aside>
            </Reveal>
          </section>
        </div>
      </main>

      <style jsx global>{`
        .floating-contact-particle {
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
          animation: contactFloat 10s ease-in-out infinite;
        }

        .contact-particle-1 {
          width: 9px;
          height: 9px;
          left: 12%;
          top: 20%;
        }

        .contact-particle-2 {
          width: 12px;
          height: 12px;
          left: 78%;
          top: 18%;
          animation-delay: 1.4s;
        }

        .contact-particle-3 {
          width: 8px;
          height: 8px;
          left: 62%;
          top: 54%;
          animation-delay: 2.8s;
        }

        .contact-particle-4 {
          width: 11px;
          height: 11px;
          left: 24%;
          top: 76%;
          animation-delay: 4.1s;
        }

        .contact-particle-5 {
          width: 7px;
          height: 7px;
          left: 90%;
          top: 70%;
          animation-delay: 5.3s;
        }

        .contact-orb-ring {
          position: absolute;
          inset: 50%;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          transform: translate(-50%, -50%);
        }

        .contact-orb-ring-1 {
          width: 120px;
          height: 120px;
          animation: contactSpin 14s linear infinite;
        }

        .contact-orb-ring-2 {
          width: 145px;
          height: 145px;
          border-color: rgba(0, 217, 255, 0.22);
          animation: contactSpinReverse 18s linear infinite;
        }

        .contact-orb-ring-3 {
          width: 168px;
          height: 168px;
          border-color: rgba(139, 92, 246, 0.18);
          animation: contactSpin 24s linear infinite;
        }

        .contact-orb-node {
          position: absolute;
          height: 9px;
          width: 9px;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 1),
            rgba(255, 122, 0, 0.82),
            rgba(0, 217, 255, 0.65)
          );
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.25);
        }

        .contact-orb-node-1 {
          top: 24px;
          left: 86px;
        }

        .contact-orb-node-2 {
          top: 82px;
          right: 10px;
        }

        .contact-orb-node-3 {
          bottom: 28px;
          left: 42px;
        }

        @keyframes contactFloat {
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

        @keyframes contactSpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes contactSpinReverse {
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

function ContactCard({
  title,
  label,
  value,
  href,
  icon,
  delay,
}: {
  title: string;
  label: string;
  value: string;
  href: string;
  icon: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="group relative block h-full overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-xl backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-cyan-300/25 hover:bg-white/[0.07] hover:shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
      >
        <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/10" />

        <div className="relative">
          <div
            className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-xs font-black text-black"
            style={{
              background: `linear-gradient(135deg, ${ORANGE}, #ffd3aa, ${BLUE})`,
            }}
          >
            {icon}
          </div>

          <h3 className="text-xl font-black tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-white/58">{label}</p>
          <p className="mt-4 text-sm font-bold leading-6 text-white underline underline-offset-4">
            {value}
          </p>
        </div>
      </a>
    </Reveal>
  );
}

function InputField({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white outline-none transition duration-300 placeholder:text-white/38 focus:border-orange-400/50 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(255,122,0,0.08)] sm:text-base"
    />
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

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        visible
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-8 opacity-0 blur-sm"
      }`}
    >
      {children}
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}