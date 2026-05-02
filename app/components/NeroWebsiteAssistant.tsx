"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "nexa_nero_website_chat_v1";

const QUICK_QUESTIONS = [
  "How much is a scooter for 24 hours?",
  "What license do I need?",
  "Is insurance included?",
  "Where are you located?",
  "What is included with the scooter?",
  "Can I rent with B license?",
];

const GHOST_PROMPTS = [
  "Hey Nero, can you help me book a scooter?",
  "Hey Nero, what scooter do you recommend for today?",
  "Hey Nero, can you explain the license rules?",
  "Hey Nero, how much is a scooter for 24 hours?",
  "Hey Nero, can you help me choose Half Day or Full Day?",
  "Hey Nero, is insurance included with the scooter?",
  "Hey Nero, what do I need to bring for the booking?",
  "Hey Nero, can you help me reserve a scooter in Magaluf?",
];

const NORMAL_PLACEHOLDER =
  "Ask Nero about prices, license, deposit, insurance...";

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function NeroWebsiteAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Nero, the NEXA Rentals AI assistant 😊 Ask me about prices, license, deposit, insurance, location or how to book.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ghostPlaceholder, setGhostPlaceholder] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const ghostIntervalRef = useRef<number | null>(null);
  const ghostTimeoutRef = useRef<number | null>(null);
  const lastAutoFocusRef = useRef(0);
  const hasAutoFocusedOnceRef = useRef(false);
  const touchStartYRef = useRef(0);

  const canUseMic = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const activePlaceholder = useMemo(() => {
    if (listening) return "Listening...";
    if (input.trim()) return NORMAL_PLACEHOLDER;
    return ghostPlaceholder || NORMAL_PLACEHOLDER;
  }, [listening, input, ghostPlaceholder]);

  function clearGhostTyping() {
    if (ghostIntervalRef.current) {
      window.clearInterval(ghostIntervalRef.current);
      ghostIntervalRef.current = null;
    }

    if (ghostTimeoutRef.current) {
      window.clearTimeout(ghostTimeoutRef.current);
      ghostTimeoutRef.current = null;
    }
  }

  function startGhostTyping() {
    if (inputRef.current?.value.trim()) return;

    clearGhostTyping();

    const prompt =
      GHOST_PROMPTS[Math.floor(Math.random() * GHOST_PROMPTS.length)];

    let index = 0;
    setGhostPlaceholder("");

    ghostIntervalRef.current = window.setInterval(() => {
      index += 1;
      setGhostPlaceholder(prompt.slice(0, index));

      if (index >= prompt.length) {
        clearGhostTyping();

        ghostTimeoutRef.current = window.setTimeout(() => {
          if (!inputRef.current?.value.trim()) {
            setGhostPlaceholder("");
          }
        }, 5200);
      }
    }, 38);
  }

  function activateNeroInput(scroll = false) {
    const now = Date.now();

    if (now - lastAutoFocusRef.current < 1800) return;

    lastAutoFocusRef.current = now;

    if (scroll) {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      startGhostTyping();
    }, scroll ? 650 : 180);
  }

  function handleChatTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    touchStartYRef.current = e.touches[0]?.clientY || 0;
  }

  function handleChatTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const box = chatScrollRef.current;
    if (!box) return;

    const currentY = e.touches[0]?.clientY || 0;
    const deltaY = touchStartYRef.current - currentY;

    const canScrollInside = box.scrollHeight > box.clientHeight + 2;

    if (!canScrollInside) {
      box.style.overflowY = "visible";

      window.requestAnimationFrame(() => {
        if (box) box.style.overflowY = "auto";
      });

      return;
    }

    const atTop = box.scrollTop <= 0;
    const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 2;

    if ((atTop && deltaY < 0) || (atBottom && deltaY > 0)) {
      box.style.overflowY = "visible";

      window.requestAnimationFrame(() => {
        if (box) box.style.overflowY = "auto";
      });
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-30));
        }
      }
    } catch {
      // ignore localStorage error
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore localStorage error
    }

    const box = chatScrollRef.current;

    if (box) {
      box.scrollTo({
        top: box.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    function handleFocusEvent() {
      activateNeroInput(true);
    }

    window.addEventListener("nexa:focus-nero-chat", handleFocusEvent);

    return () => {
      window.removeEventListener("nexa:focus-nero-chat", handleFocusEvent);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.45 &&
          !hasAutoFocusedOnceRef.current
        ) {
          hasAutoFocusedOnceRef.current = true;
          activateNeroInput(false);
        }
      },
      {
        threshold: [0.45, 0.65],
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      clearGhostTyping();
    };
  }, []);

  async function sendMessage(customMessage?: string) {
    const finalMessage = (customMessage || input).trim();

    if (!finalMessage || loading) return;

    clearGhostTyping();
    setGhostPlaceholder("");

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: finalMessage,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/website-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: finalMessage,
          history: nextMessages.slice(-12),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data?.reply ||
            "Sorry, I had a small technical issue. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, Nero had a small technical issue. Please try again or contact us on WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    clearGhostTyping();
    setGhostPlaceholder("");

    const fresh: ChatMessage[] = [
      {
        role: "assistant",
        content:
          "Chat cleared. I’m Nero, the NEXA Rentals AI assistant. How can I help you? 😊",
      },
    ];

    setMessages(fresh);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore localStorage error
    }

    window.setTimeout(() => {
      inputRef.current?.focus();
      startGhostTyping();
    }, 150);
  }

  function startVoice() {
    if (!canUseMic || listening) return;

    clearGhostTyping();
    setGhostPlaceholder("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  }

  function stopVoice() {
    recognitionRef.current?.stop?.();
    setListening(false);
  }

  return (
    <section
      ref={sectionRef}
      id="nero-ai-assistant"
      className="relative overflow-hidden bg-[#03040a] px-4 py-10 text-white sm:px-[clamp(16px,2vw,32px)] sm:py-[clamp(58px,6vw,96px)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.22),transparent_31%),radial-gradient(circle_at_84%_12%,rgba(249,115,22,0.24),transparent_30%),radial-gradient(circle_at_55%_85%,rgba(168,85,247,0.24),transparent_36%),linear-gradient(135deg,#03040a_0%,#090717_45%,#120906_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.10] sm:bg-[size:clamp(48px,5vw,72px)_clamp(48px,5vw,72px)] sm:opacity-[0.12]" />
        <div className="absolute left-1/2 top-0 h-[280px] w-[86vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.20),transparent_68%)] blur-3xl sm:h-[clamp(280px,30vw,420px)]" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-3xl sm:h-[clamp(320px,34vw,520px)] sm:w-[clamp(320px,34vw,520px)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1480px]">
        <div className="mb-5 text-center sm:mb-[clamp(32px,4vw,52px)]">
          <div className="mx-auto mb-3 inline-flex max-w-[min(100%,620px)] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 shadow-[0_0_28px_rgba(124,58,237,0.18)] backdrop-blur-xl sm:mb-5 sm:gap-3 sm:px-4 sm:py-2">
            <img
              src="/images/ai-icon.png"
              alt="Nexa AI"
              className="h-6 w-6 object-contain drop-shadow-[0_0_14px_rgba(124,58,237,0.65)] sm:h-[clamp(24px,2vw,28px)] sm:w-[clamp(24px,2vw,28px)]"
              draggable={false}
            />
            <span className="truncate bg-gradient-to-r from-[#fb923c] via-[#c084fc] to-[#60a5fa] bg-clip-text text-[9px] font-black uppercase tracking-[0.18em] text-transparent sm:text-[clamp(10px,0.82vw,12px)] sm:tracking-[0.28em]">
              Instant Nexa AI Support
            </span>
          </div>

          <h2 className="mx-auto max-w-[340px] text-[30px] font-black leading-[0.95] tracking-[-0.055em] sm:max-w-5xl sm:text-[clamp(38px,4.75vw,74px)] sm:leading-[0.96]">
            <span className="text-white">Nero</span>{" "}
            <span className="bg-gradient-to-r from-[#fb923c] via-[#c084fc] to-[#60a5fa] bg-clip-text text-transparent">
              NEXA AI
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-[320px] text-[13px] leading-relaxed text-white/60 sm:mt-5 sm:max-w-3xl sm:text-[clamp(15px,1.1vw,18px)] sm:text-white/70">
            Ask about prices, license, deposit, insurance or booking.
          </p>
        </div>

        <div className="grid gap-[clamp(18px,1.6vw,24px)] lg:grid-cols-[minmax(310px,380px)_minmax(0,1fr)] lg:items-stretch">
          <aside className="relative hidden overflow-hidden rounded-[clamp(28px,2.4vw,34px)] border border-white/10 bg-white/[0.035] p-[clamp(16px,1.45vw,22px)] shadow-[0_26px_90px_rgba(0,0,0,0.45),0_0_70px_rgba(124,58,237,0.14)] backdrop-blur-2xl lg:block lg:h-[min(700px,calc(100vh-150px))] lg:min-h-[560px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_42%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[clamp(27px,2.3vw,33px)] border border-white/5" />

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative flex h-[clamp(56px,4.4vw,64px)] w-[clamp(56px,4.4vw,64px)] shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(96,165,250,0.16),rgba(124,58,237,0.20),rgba(249,115,22,0.18))] shadow-[0_0_38px_rgba(124,58,237,0.32)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_38%)]" />
                  <img
                    src="/images/ai-icon.png"
                    alt="Nexa AI Copilot"
                    className="relative h-[clamp(38px,3vw,44px)] w-[clamp(38px,3vw,44px)] object-contain drop-shadow-[0_0_18px_rgba(96,165,250,0.45)]"
                    draggable={false}
                  />
                </div>

                <div className="min-w-0">
                  <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[clamp(8px,0.65vw,10px)] font-black uppercase tracking-[0.18em] text-white/50">
                    NEXA AI System
                  </div>
                  <h3 className="mt-2 text-[clamp(21px,1.75vw,24px)] font-black tracking-[-0.04em]">
                    Ask Nero
                  </h3>
                  <p className="text-[clamp(12px,0.95vw,14px)] text-white/55">
                    Quick answers before booking.
                  </p>
                </div>
              </div>

              <div className="mt-[clamp(20px,2vw,28px)] space-y-[clamp(8px,0.75vw,10px)]">
                {QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-[clamp(11px,1vw,14px)] text-left text-[clamp(12px,0.95vw,14px)] font-bold text-white/82 shadow-[0_10px_26px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-[1px] hover:border-orange-400/50 hover:bg-white/[0.07] active:scale-[0.99]"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(192,132,252,0.12),rgba(96,165,250,0.14))] opacity-0 transition duration-300 group-hover:opacity-100" />
                    <span className="relative flex items-center justify-between gap-3">
                      <span>{question}</span>
                      <span className="text-lg text-white/30 transition group-hover:translate-x-1 group-hover:text-orange-300">
                        →
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-[clamp(20px,2vw,28px)] overflow-hidden rounded-[26px] border border-orange-400/25 bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(124,58,237,0.10),rgba(96,165,250,0.10))] p-4 shadow-[0_0_34px_rgba(249,115,22,0.10)]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-orange-300 shadow-[0_0_18px_rgba(251,146,60,1)]" />
                  <p className="text-[clamp(12px,0.95vw,14px)] font-black text-orange-200">
                    Booking tip
                  </p>
                  <span className="text-orange-300">⚡</span>
                </div>
                <p className="mt-2 text-[clamp(12px,0.95vw,14px)] leading-relaxed text-white/68">
                  Select your plan first, then choose pickup date, pickup time,
                  return time and proceed to checkout.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Prices", "License", "Deposit"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/25 px-2 py-3 text-center"
                  >
                    <p className="text-[clamp(8px,0.65vw,10px)] font-black uppercase tracking-[0.16em] text-white/38">
                      AI Help
                    </p>
                    <p className="mt-1 text-[clamp(11px,0.85vw,12px)] font-bold text-white/78">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="relative flex h-[520px] min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#05060b]/92 shadow-[0_22px_70px_rgba(0,0,0,0.55),0_0_60px_rgba(96,165,250,0.10)] backdrop-blur-2xl sm:h-[620px] sm:rounded-[clamp(28px,2.4vw,34px)] lg:h-[min(700px,calc(100vh-150px))] lg:min-h-[560px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.13),transparent_34%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.14),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/5 sm:rounded-[clamp(27px,2.3vw,33px)]" />

            <div className="relative z-10 shrink-0 border-b border-white/10 bg-white/[0.035] px-4 py-3 sm:px-[clamp(16px,1.4vw,20px)] sm:py-[clamp(13px,1.1vw,16px)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(96,165,250,0.16),rgba(124,58,237,0.20),rgba(249,115,22,0.18))] shadow-[0_0_26px_rgba(124,58,237,0.24)] sm:h-[clamp(44px,3.3vw,48px)] sm:w-[clamp(44px,3.3vw,48px)]">
                    <img
                      src="/images/ai-icon.png"
                      alt="NEXA AI"
                      className="h-7 w-7 object-contain sm:h-8 sm:w-8"
                      draggable={false}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate bg-gradient-to-r from-[#fdba74] via-[#c084fc] to-[#7dd3fc] bg-clip-text text-[16px] font-black tracking-[-0.03em] text-transparent sm:text-[clamp(16px,1.25vw,18px)]">
                      NEXA AI Chat
                    </h3>
                    <p className="truncate text-[11px] text-white/45 sm:text-[clamp(11px,0.82vw,12px)]">
                      Nero · Built by NEXA Rentals
                    </p>
                  </div>
                </div>

                <button
                  onClick={clearChat}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[11px] font-black text-white/72 transition hover:border-orange-300/40 hover:bg-white/[0.10] hover:text-white active:scale-95 sm:px-4 sm:text-[clamp(11px,0.82vw,12px)]"
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              ref={chatScrollRef}
              onTouchStart={handleChatTouchStart}
              onTouchMove={handleChatTouchMove}
              className="relative z-10 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 sm:space-y-4 sm:p-[clamp(14px,1.35vw,24px)]"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
              }}
            >
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";

                return (
                  <div
                    key={`${msg.role}-${index}`}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[90%] overflow-hidden rounded-[22px] px-4 py-3 text-[13px] leading-relaxed shadow-xl sm:max-w-[88%] sm:rounded-[26px] sm:px-[clamp(16px,1.35vw,20px)] sm:py-[clamp(12px,1vw,14px)] sm:text-[clamp(13px,1.05vw,16px)] md:max-w-[76%] ${
                        isUser
                          ? "rounded-br-md border border-orange-300/20 bg-[linear-gradient(135deg,#fb923c_0%,#f97316_45%,#c084fc_100%)] text-white shadow-[0_16px_38px_rgba(249,115,22,0.18)]"
                          : "rounded-bl-md border border-white/10 bg-white/[0.075] text-white/90 shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
                      }`}
                    >
                      {!isUser && (
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.10),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.08),transparent_42%)]" />
                      )}

                      <p className="relative whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-[22px] rounded-bl-md border border-white/10 bg-white/[0.075] px-4 py-3 text-[13px] text-white/70 shadow-xl sm:rounded-[26px] sm:px-5 sm:py-3.5 sm:text-sm">
                    <span className="inline-flex items-center gap-2">
                      <span>Nero is typing</span>
                      <span className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-300" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300 [animation-delay:240ms]" />
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 shrink-0 border-t border-white/10 bg-white/[0.035] p-3 sm:p-[clamp(12px,1.1vw,16px)]">
              <div className="flex items-end gap-2 sm:gap-[clamp(8px,0.85vw,12px)]">
                <button
                  onClick={listening ? stopVoice : startVoice}
                  disabled={!canUseMic}
                  className={`relative h-[48px] w-[48px] shrink-0 overflow-hidden rounded-2xl border font-black transition active:scale-95 sm:h-[clamp(50px,3.9vw,56px)] sm:w-[clamp(50px,3.9vw,56px)] ${
                    listening
                      ? "border-red-300/40 bg-red-500 text-white shadow-[0_0_28px_rgba(239,68,68,0.25)]"
                      : "border-white/10 bg-white/[0.07] text-white hover:border-blue-300/40 hover:bg-white/[0.11]"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                  title={
                    canUseMic
                      ? "Use microphone"
                      : "Microphone not supported on this browser"
                  }
                >
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
                  <span className="relative">{listening ? "■" : "🎙️"}</span>
                </button>

                <div className="relative flex flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => {
                      clearGhostTyping();
                      setGhostPlaceholder("");
                      setInput(e.target.value);
                    }}
                    placeholder={activePlaceholder}
                    className={[
                      "min-h-[48px] max-h-28 flex-1 resize-none rounded-2xl border border-white/10 bg-black/55 px-3 py-3 text-[13px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition focus:border-orange-300/55 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12)] sm:min-h-[clamp(50px,3.9vw,56px)] sm:max-h-32 sm:px-4 sm:text-[clamp(14px,1.05vw,16px)]",
                      ghostPlaceholder && !input.trim()
                        ? "placeholder:text-white/48"
                        : "placeholder:text-white/35",
                    ].join(" ")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />

                  {inputFocused && ghostPlaceholder && !input.trim() && !listening && (
                    <div className="pointer-events-none absolute -top-9 left-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-bold text-white/45 shadow-[0_10px_26px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:left-3 sm:text-[11px]">
                      Try typing here
                    </div>
                  )}
                </div>

                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="h-[48px] rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#f97316_0%,#c084fc_50%,#60a5fa_100%)] px-4 text-[13px] font-black text-white shadow-[0_16px_36px_rgba(124,58,237,0.24)] transition hover:scale-[1.02] hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[clamp(50px,3.9vw,56px)] sm:px-[clamp(18px,2vw,32px)] sm:text-base"
                >
                  Send
                </button>
              </div>

              <div className="mt-2 hidden flex-col gap-1 text-[clamp(10px,0.78vw,12px)] text-white/35 sm:flex sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Voice input uses your browser microphone. Chat history is saved
                  only on this device.
                </p>
                <p className="font-bold text-white/45">
                  Powered by NEXA Rentals AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}