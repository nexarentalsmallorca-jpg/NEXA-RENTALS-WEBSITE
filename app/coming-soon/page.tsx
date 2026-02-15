"use client";

import { useState } from "react";

export default function ComingSoon() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    // ✅ redirect to middleware unlock
    window.location.href = `/?dev=${encodeURIComponent(pw)}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-3">🚀 Coming Soon</h1>
        <p className="text-white/70 mb-6">NEXA Rentals is launching soon.</p>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Admin password"
            className="flex-1 rounded-xl px-4 py-3 text-black font-semibold outline-none"
          />
          <button
            type="submit"
            className="rounded-xl px-5 py-3 font-extrabold bg-orange-500 text-black"
          >
            Unlock
          </button>
        </form>

        {err && <div className="mt-3 text-red-400 font-semibold">{err}</div>}

        <div className="mt-3 text-xs text-white/50">
          (Admin only)
        </div>
      </div>
    </div>
  );
}
