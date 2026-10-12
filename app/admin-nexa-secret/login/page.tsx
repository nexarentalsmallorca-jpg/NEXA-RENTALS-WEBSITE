
"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  startAuthentication,
} from "@simplewebauthn/browser";

type ApiResult = {
  success?: boolean;
  error?: string;
  message?: string;
  options?: any;
};

function getSafeNextPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/admin-nexa-secret";
  }

  try {
    const url = new URL(
      value,
      window.location.origin
    );

    if (
      url.origin !== window.location.origin ||
      !url.pathname.startsWith(
        "/admin-nexa-secret"
      ) ||
      url.pathname.startsWith(
        "/admin-nexa-secret/login"
      )
    ) {
      return "/admin-nexa-secret";
    }

    return url.pathname + url.search + url.hash;
  } catch {
    return "/admin-nexa-secret";
  }
}

function LoginContent() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [passkeyAvailable, setPasskeyAvailable] =
    useState(false);

  const nextPath = getSafeNextPath(
    searchParams.get("next")
  );

  useEffect(() => {
    let active = true;

    async function checkPasskeySupport() {
      const supported =
        typeof window !== "undefined" &&
        window.isSecureContext &&
        typeof PublicKeyCredential !== "undefined";

      if (!supported) {
        return;
      }

      try {
        const available =
          await PublicKeyCredential
            .isUserVerifyingPlatformAuthenticatorAvailable();

        if (active) {
          setPasskeyAvailable(available);
        }
      } catch {
        if (active) {
          setPasskeyAvailable(false);
        }
      }
    }

    checkPasskeySupport();

    return () => {
      active = false;
    };
  }, []);

  async function handlePasswordLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading || passkeyLoading) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const result: ApiResult =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to log in."
        );
      }

      localStorage.setItem(
        "nexa_admin_logged_in",
        "true"
      );

      window.location.assign(nextPath);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePasskeyLogin() {
    if (loading || passkeyLoading) {
      return;
    }

    setError("");
    setMessage("");
    setPasskeyLoading(true);

    try {
      const optionsResponse = await fetch(
        "/api/admin/passkey/login/options",
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

      const optionsResult: ApiResult =
        await optionsResponse.json();

      if (
        !optionsResponse.ok ||
        !optionsResult.success ||
        !optionsResult.options
      ) {
        throw new Error(
          optionsResult.error ||
            "Unable to start passkey login."
        );
      }

      const authenticationResponse =
        await startAuthentication({
          optionsJSON: optionsResult.options,
        });

      const verifyResponse = await fetch(
        "/api/admin/passkey/login/verify",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            authenticationResponse
          ),
        }
      );

      const verifyResult: ApiResult =
        await verifyResponse.json();

      if (
        !verifyResponse.ok ||
        !verifyResult.success
      ) {
        throw new Error(
          verifyResult.error ||
            "Passkey authentication failed."
        );
      }

      localStorage.setItem(
        "nexa_admin_logged_in",
        "true"
      );

      setMessage("Access granted.");

      window.location.assign(nextPath);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to authenticate."
      );
    } finally {
      setPasskeyLoading(false);
    }
  }

  const busy = loading || passkeyLoading;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090e] px-4 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[430px] rounded-[30px] border border-white/10 bg-[#10131c]/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border border-orange-400/20 bg-orange-500/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fb923c"
              strokeWidth="1.6"
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

          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-orange-400">
            NEXA RENTALS
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            NEXA OS
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Private management system
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {message}
          </div>
        )}

        {passkeyAvailable && (
          <div className="mb-7">
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={busy}
              className="flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-sm font-bold text-black shadow-[0_10px_35px_rgba(249,115,22,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 11a2 2 0 0 0-2 2v2" />
                <path d="M14 15v-2a2 2 0 0 0-4 0" />
                <path d="M8 17v-4a4 4 0 0 1 8 0v4" />
                <path d="M6 15v-2a6 6 0 0 1 12 0v2" />
                <path d="M4 13a8 8 0 0 1 16 0" />
              </svg>

              {passkeyLoading
                ? "Verifying your passkey..."
                : "Unlock with Passkey"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Use your registered device credential
            </p>

            <div className="mt-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-widest text-slate-500">
                Or use password
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </div>
        )}

        <form
          onSubmit={handlePasswordLogin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="nexa-email"
              className="mb-2 block text-xs font-semibold text-slate-300"
            >
              Admin email
            </label>

            <input
              id="nexa-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={busy}
              placeholder="admin@nexarentals.es"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-400/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="nexa-password"
              className="mb-2 block text-xs font-semibold text-slate-300"
            >
              Password
            </label>

            <input
              id="nexa-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={busy}
              placeholder="Enter your password"
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-400/50 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-sm font-bold text-white transition hover:bg-white/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign in to NEXA OS"}
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
              />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            Authorized NEXA personnel only
          </div>

          <p className="mt-3 text-[11px] text-slate-600">
            © {new Date().getFullYear()} NEXA RENTALS
          </p>
        </div>
      </div>
    </main>
  );
}

export default function NexaAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#07090e] text-sm text-slate-400">
          Loading NEXA OS...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
