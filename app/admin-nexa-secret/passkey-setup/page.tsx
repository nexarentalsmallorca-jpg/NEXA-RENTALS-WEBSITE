
"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import Link from "next/link";

type ApiResult = {
  success?: boolean;
  error?: string;
  options?: any;
};

export default function NexaPasskeySetupPage() {
  const [secret, setSecret] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function authorize() {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/passkey/enrollment", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const result: ApiResult = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Authorization failed.");
      }

      setAuthorized(true);
      setSecret("");
      setMessage("Authorized. Register your Samsung within 5 minutes.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authorization failed.");
    } finally {
      setBusy(false);
    }
  }

  async function register() {
    if (busy || !authorized) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const optionsResponse = await fetch(
        "/api/admin/passkey/register/options",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      const options: ApiResult = await optionsResponse.json();

      if (!optionsResponse.ok || !options.success || !options.options) {
        throw new Error(options.error || "Unable to prepare registration.");
      }

      const credential = await startRegistration({
        optionsJSON: options.options,
      });

      const verifyResponse = await fetch(
        "/api/admin/passkey/register/verify",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credential),
        }
      );

      const verified: ApiResult = await verifyResponse.json();

      if (!verifyResponse.ok || !verified.success) {
        throw new Error(verified.error || "Registration failed.");
      }

      setRegistered(true);
      setMessage("Your Samsung owner passkey has been registered.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#07090e] px-4 py-10 text-white">
      <div className="w-full max-w-[460px] rounded-[30px] border border-white/10 bg-[#10131c] p-7 shadow-2xl sm:p-9">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/admin-nexa-secret"
            className="text-xs text-slate-400"
          >
            ← NEXA OS
          </Link>
          <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-300">
            Owner setup
          </span>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] border border-orange-400/20 bg-orange-500/10 text-4xl text-orange-400">
            ◉
          </div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-orange-400">
            NEXA RENTALS
          </p>
          <h1 className="text-2xl font-bold">
            Register Owner Passkey
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Secure owner access for your Samsung device.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {!registered ? (
          <div className="space-y-5">
            {!authorized && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-300">
                    Private owner enrollment secret
                  </label>
                  <input
                    type="password"
                    autoComplete="off"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder="Enter private owner secret"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-4 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={authorize}
                  disabled={busy || !secret}
                  className="w-full rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4 text-sm font-bold text-orange-300 disabled:opacity-50"
                >
                  {busy ? "Authorizing..." : "Authorize Owner Device"}
                </button>
              </>
            )}

            {authorized && (
              <button
                type="button"
                onClick={register}
                disabled={busy}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-sm font-bold text-black disabled:opacity-50"
              >
                {busy ? "Registering..." : "Register Samsung Passkey"}
              </button>
            )}

            <p className="text-center text-xs leading-5 text-slate-500">
              Android may use fingerprint, face verification or PIN.
              Only one approved owner credential can be registered.
            </p>
          </div>
        ) : (
          <div className="space-y-5 text-center">
            <div className="text-4xl text-emerald-400">✓</div>
            <h2 className="text-xl font-bold">Passkey Registered</h2>
            <Link
              href="/admin-nexa-secret/login"
              className="flex min-h-[52px] items-center justify-center rounded-xl bg-orange-500 px-5 font-bold text-black"
            >
              Continue to Owner Login
            </Link>
          </div>
        )}

        <p className="mt-8 border-t border-white/10 pt-5 text-center text-[11px] text-slate-500">
          NEXA OS · Secure Owner Enrollment
        </p>
      </div>
    </main>
  );
}
