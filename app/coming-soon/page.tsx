"use client";

import { useState } from "react";

export default function ComingSoonPage() {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const unlock = async () => {
    setErr("");
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass }),
    });
    if (res.ok) window.location.href = "/";
    else setErr("Wrong password");
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <div className="text-sm text-orange-400 font-semibold tracking-wide">
          NEXA Rentals
        </div>
        <h1 className="mt-3 text-4xl font-extrabold">Coming Soon</h1>
        <p className="mt-3 text-white/70">
          We’re preparing something premium. Launching shortly.
        </p>

        <div className="mt-7">
          <label className="text-sm text-white/70">Owner access</label>
          <div className="mt-2 flex gap-2">
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type="password"
              placeholder="Enter password"
              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-orange-500/60"
            />
            <button
              onClick={unlock}
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black hover:bg-orange-400"
            >
              Unlock
            </button>
          </div>
          {err ? <div className="mt-2 text-sm text-red-400">{err}</div> : null}
        </div>

        <div className="mt-6 text-xs text-white/40">
          Tip: Set LOCK_SITE=true in your deployment environment.
        </div>
      </div>
    </main>
  );
}
