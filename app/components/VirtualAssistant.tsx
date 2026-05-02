"use client";

import { useMemo, useRef, useState } from "react";

type Caption = {
  start: number;
  end: number;
  text: string;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  video: string;
  keywords: string[];
  captions: Caption[];
};

const faqs: FAQ[] = [
  {
    id: "license",
    question: "What driving license do I need?",
    answer:
      "To rent a 125cc scooter, you need a B car license held for at least 3 years, or an A1/A license.",
    video: "/videos/drivers-license.mp4",
    keywords: ["license", "driving", "b license", "a1", "car license", "scooter"],
    captions: [
      { start: 0, end: 3, text: "To rent a 125cc scooter with Nexa Rentals," },
      { start: 3, end: 7, text: "you need a B car license held for at least 3 years," },
      { start: 7, end: 10, text: "or an A1 or A motorcycle license." },
      { start: 10, end: 14, text: "Please bring your original driving license and ID or passport." },
    ],
  },
  {
    id: "deposit",
    question: "Do you take a deposit?",
    answer:
      "Yes, we take a refundable €150 deposit. You can pay by cash or card pre-authorization.",
    video: "/videos/deposit.mp4",
    keywords: ["deposit", "150", "cash", "card", "preauthorization"],
    captions: [
      { start: 0, end: 4, text: "Yes, we take a refundable deposit of 150 euros." },
      { start: 4, end: 8, text: "You can leave it in cash or by card pre-authorization." },
      { start: 8, end: 13, text: "With card, your bank only holds the amount until we release it." },
    ],
  },
  {
    id: "insurance",
    question: "What insurance is included?",
    answer: "Basic third-party insurance is included with every scooter rental.",
    video: "/videos/deposit.mp4",
    keywords: ["insurance", "cover", "accident", "third party"],
    captions: [
      { start: 0, end: 4, text: "Every scooter rental includes basic third-party insurance." },
      { start: 4, end: 8, text: "This covers damage caused to third parties according to the policy." },
      { start: 8, end: 12, text: "Damage to our scooter is the customer's responsibility." },
    ],
  },
  {
    id: "included",
    question: "What is included with the scooter rental?",
    answer:
      "Every scooter rental includes helmets, security lock, phone holder and unlimited kilometres.",
    video: "/videos/deposit.mp4",
    keywords: ["included", "helmet", "lock", "phone holder", "kilometres"],
    captions: [
      { start: 0, end: 4, text: "Your scooter rental includes helmets, a security lock," },
      { start: 4, end: 8, text: "a phone holder, and unlimited kilometres." },
      { start: 8, end: 12, text: "Everything is included so you can enjoy Mallorca freely." },
    ],
  },
  {
    id: "price",
    question: "How much does it cost to rent a scooter?",
    answer: "Our 125cc scooters start from €39 half-day and €49 for 24 hours.",
    video: "/videos/deposit.mp4",
    keywords: ["price", "cost", "rent", "day", "half day"],
    captions: [
      { start: 0, end: 4, text: "Our 125cc scooters start from 39 euros for half day." },
      { start: 4, end: 8, text: "For 24 hours, the price starts from 49 euros." },
      { start: 8, end: 12, text: "Helmets, lock, phone holder, and unlimited kilometres are included." },
    ],
  },
  {
    id: "two-people",
    question: "Can two people ride on one scooter?",
    answer:
      "Yes, two people can ride on one scooter if the passenger follows the legal age and safety rules.",
    video: "/videos/deposit.mp4",
    keywords: ["two people", "passenger", "couple", "ride together"],
    captions: [
      { start: 0, end: 4, text: "Yes, two people can ride on one scooter." },
      { start: 4, end: 8, text: "The passenger must follow the legal age and safety rules." },
      { start: 8, end: 12, text: "Both riders must wear helmets at all times." },
    ],
  },
  {
    id: "assistance",
    question: "Do you offer roadside assistance?",
    answer:
      "Yes, free mechanical assistance is included within 10 km. Outside this area, service charges may apply.",
    video: "/videos/deposit.mp4",
    keywords: ["assistance", "breakdown", "help", "mechanic", "towing"],
    captions: [
      { start: 0, end: 4, text: "Yes, we offer free mechanical assistance within 10 kilometres." },
      { start: 4, end: 9, text: "Outside this area, service charges may apply depending on location." },
      { start: 9, end: 13, text: "This can include mechanic help, towing, or video guidance." },
    ],
  },
  {
    id: "damage",
    question: "What happens if I damage the scooter?",
    answer:
      "The customer is responsible for damages caused during the rental period according to the rental contract.",
    video: "/videos/deposit.mp4",
    keywords: ["damage", "crash", "accident", "broken", "responsible"],
    captions: [
      { start: 0, end: 4, text: "If the scooter is damaged during your rental," },
      { start: 4, end: 8, text: "the customer is responsible according to the rental contract." },
      { start: 8, end: 12, text: "We always check the scooter before and after every rental." },
    ],
  },
  {
    id: "kilometres",
    question: "How many kilometres are included?",
    answer: "Unlimited kilometres are included with every scooter rental.",
    video: "/videos/deposit.mp4",
    keywords: ["kilometres", "km", "unlimited", "distance"],
    captions: [
      { start: 0, end: 4, text: "Unlimited kilometres are included with every scooter rental." },
      { start: 4, end: 8, text: "You can explore Mallorca freely without worrying about distance." },
    ],
  },
  {
    id: "documents",
    question: "What documents do I need to bring?",
    answer: "Please bring your passport or ID and your valid driving license.",
    video: "/videos/deposit.mp4",
    keywords: ["documents", "passport", "id", "driving license", "bring"],
    captions: [
      { start: 0, end: 4, text: "Please bring your passport or ID," },
      { start: 4, end: 8, text: "and your valid original driving license." },
      { start: 8, end: 12, text: "We need to check these documents before giving the scooter." },
    ],
  },
];

export default function VirtualAssistant() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [search, setSearch] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [liveSubtitle, setLiveSubtitle] = useState("");

  const filteredFaqs = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return faqs;

    return faqs.filter((faq) => {
      const questionMatch = faq.question.toLowerCase().includes(value);
      const keywordMatch = faq.keywords.some((keyword) =>
        keyword.toLowerCase().includes(value)
      );

      return questionMatch || keywordMatch;
    });
  }, [search]);

  const handleSelectQuestion = (faq: FAQ) => {
    setSelectedFaq(faq);
    setHasStarted(true);
    setLiveSubtitle(faq.captions[0]?.text || faq.answer);

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !selectedFaq) return;

    const currentTime = videoRef.current.currentTime;

    const activeCaption = selectedFaq.captions.find(
      (caption) => currentTime >= caption.start && currentTime < caption.end
    );

    setLiveSubtitle(activeCaption?.text || selectedFaq.answer);
  };

  return (
    <section className="relative w-full overflow-hidden bg-black py-16 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="mb-9 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.35em] text-[#FF7A00]">
            Virtual Help Desk
          </p>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Ask Nexa Assistant
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            Choose a question and our virtual assistant will explain everything
            clearly before you book.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#080808] shadow-2xl">
          <div className="grid min-h-[700px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_520px] xl:grid-cols-[minmax(0,1fr)_560px]">
            {/* LEFT SIDE VIDEO AREA */}
            <div className="relative min-h-[500px] overflow-hidden bg-black lg:min-h-[700px]">
              {!hasStarted && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35">
                  <div className="max-w-md rounded-3xl border border-white/15 bg-black/75 p-8 text-center backdrop-blur-md">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF7A00] text-2xl shadow-lg shadow-orange-500/30">
                      ▶
                    </div>

                    <h3 className="text-2xl font-black">Select a question</h3>

                    <p className="mt-3 text-sm leading-6 text-white/65">
                      Click any question on the right side and the assistant
                      video will start automatically.
                    </p>
                  </div>
                </div>
              )}

              <video
                ref={videoRef}
                key={selectedFaq?.video || "empty-video"}
                src={selectedFaq?.video || ""}
                playsInline
                preload="metadata"
                controls={false}
                muted={false}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={() => {
                  if (selectedFaq) setLiveSubtitle(selectedFaq.answer);
                }}
                className="h-full min-h-[500px] w-full object-cover lg:min-h-[700px]"
              />

              {/* LIVE SUBTITLE */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/75 to-transparent px-5 pb-7 pt-40 sm:px-8">
                <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/80 px-6 py-4 text-center shadow-2xl backdrop-blur-md">
                  <p className="text-base font-black leading-7 text-white sm:text-lg lg:text-xl">
                    {hasStarted
                      ? liveSubtitle
                      : "Your live subtitles will appear here after selecting a question."}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE QUESTIONS PANEL */}
            <div className="relative border-t border-white/10 bg-gradient-to-b from-[#111] via-black to-[#050505] p-5 lg:border-l lg:border-t-0 xl:p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/25 via-transparent to-emerald-500/20" />

              <div className="relative z-10 flex h-full flex-col rounded-[28px] border border-white/10 bg-black/85 p-5 shadow-2xl backdrop-blur-md">
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/50">
                    Ask Question
                  </label>

                  <div className="flex gap-3">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search license, deposit..."
                      className="h-[54px] w-full rounded-2xl border border-white/10 bg-white px-5 text-sm font-semibold text-black outline-none placeholder:text-black/45"
                    />

                    <button
                      type="button"
                      className="flex h-[54px] w-[58px] shrink-0 items-center justify-center rounded-2xl bg-[#FF7A00] text-lg font-black text-black transition hover:scale-105"
                    >
                      🎤
                    </button>
                  </div>
                </div>

                <div className="mb-4 rounded-2xl bg-white px-5 py-4 text-center text-base font-black leading-6 text-black">
                  {selectedFaq ? selectedFaq.question : "Choose a question below"}
                </div>

                <div className="custom-nexa-scroll flex max-h-[535px] flex-col gap-3 overflow-y-auto pr-2">
                  {filteredFaqs.map((faq, index) => {
                    const isActive = selectedFaq?.id === faq.id;

                    return (
                      <button
                        key={faq.id}
                        onClick={() => handleSelectQuestion(faq)}
                        className={`rounded-2xl px-5 py-4 text-center text-base font-black leading-6 transition duration-300 sm:text-lg ${
                          isActive
                            ? "bg-[#FF7A00] text-black shadow-lg shadow-orange-500/30"
                            : "bg-white text-black hover:bg-[#FF7A00] hover:text-black"
                        }`}
                      >
                        {index + 1}. {faq.question}
                      </button>
                    );
                  })}

                  {filteredFaqs.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-white/60">
                        No matching question found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-nexa-scroll::-webkit-scrollbar {
          width: 7px;
        }

        .custom-nexa-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
        }

        .custom-nexa-scroll::-webkit-scrollbar-thumb {
          background: #ff7a00;
          border-radius: 999px;
        }

        .custom-nexa-scroll::-webkit-scrollbar-thumb:hover {
          background: #ff9a33;
        }
      `}</style>
    </section>
  );
}               