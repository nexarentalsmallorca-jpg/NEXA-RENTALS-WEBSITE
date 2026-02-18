"use client";

import { useEffect, useState } from "react";

export default function ComingSoon() {
  const [pw, setPw] = useState("");

  const PASSWORD = "@@ss4448";

  // If already unlocked, go home
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unlocked = localStorage.getItem("nexa_unlocked") === "1";
    if (unlocked) window.location.href = "/";
  }, []);

  const unlock = () => {
    // trim removes accidental spaces
    const input = pw.trim();

    if (input === PASSWORD) {
      localStorage.setItem("nexa_unlocked", "1");
      window.location.href = "/";
    } else {
      alert("Wrong password");
      setPw("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-5xl font-extrabold mb-2">🚀 Coming Soon</h1>
        <p className="text-white/70 mb-8">NEXA Rentals is launching soon.</p>

        {/* ✅ PASSWORD FIELD */}
        <div className="flex items-center justify-center gap-3">
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            className="w-[260px] rounded-xl px-4 py-3 text-white font-semibold outline-none bg-white/10"
            type="password"
            onKeyDown={(e) => {
              if (e.key === "Enter") unlock();
            }}
          />
          <button
            onClick={unlock}
            className="rounded-xl px-8 py-3 font-extrabold bg-orange-500 text-black hover:brightness-95 transition"
          >
            Unlock
          </button>
        </div>

        <div className="mt-3 text-xs text-white/50">(Admin only)</div>
      </div>
    </div>
  );
}
