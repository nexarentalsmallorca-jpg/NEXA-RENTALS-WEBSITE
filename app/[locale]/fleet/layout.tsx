
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type SessionResult = {
  success?: boolean;
  owner?: boolean;
};

export default function FleetVehicleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();

  const rawCode = params.code;
  const code = (
    typeof rawCode === "string"
      ? rawCode
      : Array.isArray(rawCode)
        ? rawCode[0] || ""
        : ""
  ).toUpperCase();

  const [owner, setOwner] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkOwner() {
      try {
        const response = await fetch(
          "/api/admin/passkey/session",
          {
            credentials: "same-origin",
            cache: "no-store",
          }
        );

        const result: SessionResult = await response.json();

        if (active) {
          setOwner(
            response.ok &&
            result.success === true &&
            result.owner === true
          );
        }
      } catch {
        if (active) setOwner(false);
      } finally {
        if (active) setChecking(false);
      }
    }

    checkOwner();

    return () => {
      active = false;
    };
  }, [code]);

  const validCode = /^N[0-9]+$/.test(code);

  const maintenancePath =
    `/admin-nexa-secret/maintenance/${encodeURIComponent(code)}`;

  const loginPath =
    `/admin-nexa-secret/login?next=${encodeURIComponent(
      maintenancePath
    )}`;

  return (
    <>
      {children}

      {validCode && !checking && (
        <div className="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-32px)] max-w-md -translate-x-1/2">
          {owner ? (
            <Link
              href={maintenancePath}
              className="flex min-h-[60px] items-center justify-center gap-3 rounded-2xl border border-orange-300/30 bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-center text-sm font-extrabold text-black shadow-[0_15px_45px_rgba(0,0,0,0.55)]"
            >
              <span aria-hidden="true">✎</span>
              EDIT {code} MAINTENANCE
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <Link
              href={loginPath}
              className="mx-auto flex w-fit items-center justify-center rounded-full border border-white/15 bg-[#10131c]/95 px-5 py-3 text-xs font-semibold text-slate-300 shadow-xl backdrop-blur-xl"
            >
              🔒 Staff access
            </Link>
          )}
        </div>
      )}
    </>
  );
}
