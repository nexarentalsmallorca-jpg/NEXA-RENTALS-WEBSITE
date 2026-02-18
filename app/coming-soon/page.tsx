"use client";

import { useState } from "react";

export default function ComingSoon() {
  const [pw, setPw] = useState("");

  const unlock = () => {
    window.location.href = `/?dev=${encodeURIComponent(pw)}`;
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
            className="w-[260px] rounded-xl px-4 py-3 text-white font-semibold outline-none"
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
