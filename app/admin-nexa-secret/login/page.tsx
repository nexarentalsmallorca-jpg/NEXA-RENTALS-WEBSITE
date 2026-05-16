"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function AdminLoginContent() {
  const searchParams = useSearchParams();

  const nextUrl = useMemo(() => {
    const next = searchParams.get("next");

    if (!next || !next.startsWith("/admin-nexa-secret")) {
      return "/admin-nexa-secret";
    }

    return next;
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("nexa_admin_logged_in", "true");

      window.location.href = nextUrl;
    } catch (err) {
      console.error("NEXA OS login error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060A] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-orange-500/25 blur-[130px]" />
        <div className="absolute right-[-12%] top-[20%] h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[140px]" />
        <div className="absolute bottom-[-16%] left-[35%] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[500px]">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-orange-400 via-purple-500 to-sky-400 text-3xl font-black shadow-[0_0_65px_rgba(255,130,0,0.35)]">
              N
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.35em] text-orange-300">
              NEXA Rentals
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              NEXA OS
            </h1>

            <p className="mt-3 text-sm font-medium leading-6 text-white/50">
              Private operating system for bookings, vehicles, contracts,
              customers, sales and availability.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-[36px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:p-8"
          >
            <div className="mb-6 rounded-[26px] border border-orange-400/20 bg-gradient-to-br from-orange-500/15 via-purple-500/10 to-sky-500/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/45">
                Secure Admin Access
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                Enter NEXA OS
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-white/45">
                Only approved NEXA Rentals admin accounts can access this
                private system.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Admin Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-[#080A10]/80 px-4 py-4 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/60 focus:bg-[#0B0E16]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-white/40">
                  Admin Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter NEXA OS password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-[#080A10]/80 px-4 py-4 pr-24 text-sm font-bold text-white outline-none transition placeholder:text-white/25 focus:border-orange-400/60 focus:bg-[#0B0E16]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white/60 transition hover:bg-white/[0.1] hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_18px_55px_rgba(255,128,0,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Checking Access..." : "Enter NEXA OS"}
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                  System Status
                </p>

                <p className="mt-1 text-sm font-black text-emerald-300">
                  Private admin portal online
                </p>
              </div>

              <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.9)]" />
            </div>
          </form>

          <p className="mt-6 text-center text-xs font-semibold text-white/30">
            NEXA OS · Private business management system
          </p>
        </div>
      </section>
    </main>
  );
}

function AdminLoginFallback() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060A] px-4 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-orange-500/25 blur-[130px]" />
        <div className="absolute right-[-12%] top-[20%] h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[140px]" />
        <div className="absolute bottom-[-16%] left-[35%] h-[520px] w-[520px] rounded-full bg-purple-500/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      <div className="relative z-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-orange-400 via-purple-500 to-sky-400 text-2xl font-black shadow-[0_0_55px_rgba(255,130,0,0.35)]">
          N
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-orange-300">
          Loading NEXA OS
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
}