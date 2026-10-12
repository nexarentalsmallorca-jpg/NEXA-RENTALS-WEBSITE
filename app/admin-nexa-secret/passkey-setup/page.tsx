
"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import Link from "next/link";

type ApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  options?: any;
};

export default function NexaPasskeySetupPage() {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function registerDevice() {
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const optionsResponse = await fetch(
        "/api/admin/passkey/register/options",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const optionsResult: ApiResponse =
        await optionsResponse.json();

      if (
        !optionsResponse.ok ||
        !optionsResult.success ||
        !optionsResult.options
      ) {
        throw new Error(
          optionsResult.error ||
            "Unable to prepare registration."
        );
      }

      const registrationResponse =
        await startRegistration({
          optionsJSON: optionsResult.options,
        });

      const verifyResponse = await fetch(
        "/api/admin/passkey/register/verify",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            registrationResponse
          ),
        }
      );

      const verifyResult: ApiResponse =
        await verifyResponse.json();

      if (
        !verifyResponse.ok ||
        !verifyResult.success
      ) {
        throw new Error(
          verifyResult.error ||
            "Device registration failed."
        );
      }

      setRegistered(true);
      setMessage(
        "Your owner passkey has been registered successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register device."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090e] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-[460px] rounded-[30px] border border-white/10 bg-[#10131c]/95 p-7 shadow-2xl sm:p-9">
        <div className="mb-7 flex items-center justify-between">
          <Link
            href="/admin-nexa-secret"
            className="text-xs font-medium text-slate-400 transition hover:text-white"
          >
            ← NEXA OS
          </Link>

          <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-300">
            Owner setup
          </span>
        </div>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] border border-orange-400/20 bg-orange-500/10">
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fb923c"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 11a2 2 0 0 0-2 2v2" />
              <path d="M14 15v-2a2 2 0 0 0-4 0" />
              <path d="M8 17v-4a4 4 0 0 1 8 0v4" />
              <path d="M6 15v-2a6 6 0 0 1 12 0v2" />
              <path d="M4 13a8 8 0 0 1 16 0" />
              <path d="M10 19c1 1 3 1 4 0" />
            </svg>
          </div>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-orange-400">
            NEXA RENTALS
          </p>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Register Owner Passkey
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Enroll your device's passkey for
            secure access to NEXA OS.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-300"
          >
            {message}
          </div>
        )}

        {!registered ? (
          <>
            <div className="mb-7 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-300">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Open on your Samsung
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Use the phone you want to
                    enroll, not another device.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-300">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Confirm device verification
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Android may request your
                    fingerprint, face unlock or PIN.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-300">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Verify your credential
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    NEXA checks the registration
                    and rejects credentials reported
                    as backup-eligible.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={registerDevice}
              disabled={loading}
              className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-sm font-bold text-black shadow-[0_10px_35px_rgba(249,115,22,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Registering your passkey..."
                : "Register Owner Passkey"}
            </button>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Only one owner credential can be
              registered. Keep your password login
              available until setup is complete.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-3xl text-emerald-400">
              ✓
            </div>

            <h2 className="text-xl font-bold">
              Passkey Registered
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your approved credential is saved.
              You can now use the passkey login
              option once authentication setup
              is fully enabled.
            </p>

            <Link
              href="/admin-nexa-secret"
              className="mt-7 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-orange-500 px-5 text-sm font-bold text-black transition hover:bg-orange-400"
            >
              Return to NEXA OS
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-white/10 pt-5 text-center">
          <p className="text-[11px] text-slate-500">
            NEXA OS · Secure Owner Enrollment
          </p>
        </div>
      </div>
    </main>
  );
}
