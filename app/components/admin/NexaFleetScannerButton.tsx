
"use client";

import Link from "next/link";

type NexaFleetScannerButtonProps = {
  className?: string;
  compact?: boolean;
};

export default function NexaFleetScannerButton({
  className = "",
  compact = false,
}: NexaFleetScannerButtonProps) {
  return (
    <Link
      href="/admin-nexa-secret/scan"
      aria-label="Scan scooter QR code"
      className={[
        "group relative flex items-center",
        "justify-between overflow-hidden",
        "rounded-2xl border border-orange-400/20",
        "bg-gradient-to-br from-[#21190f] to-[#11151e]",
        "text-white shadow-lg",
        "transition-all duration-200",
        "hover:border-orange-400/50",
        "hover:shadow-[0_12px_35px_rgba(249,115,22,0.12)]",
        "active:scale-[0.99]",
        compact ? "gap-3 px-4 py-3" : "gap-4 p-5",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex min-w-0 items-center gap-4">
        <div
          className={[
            "flex shrink-0 items-center justify-center",
            "rounded-xl border border-orange-400/20",
            "bg-orange-500/10 text-orange-400",
            compact ? "h-11 w-11" : "h-14 w-14",
          ].join(" ")}
        >
          <svg
            width={compact ? 23 : 28}
            height={compact ? 23 : 28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 9V5a1 1 0 0 1 1-1h4" />
            <path d="M15 4h4a1 1 0 0 1 1 1v4" />
            <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
            <path d="M9 20H5a1 1 0 0 1-1-1v-4" />

            <rect
              x="8"
              y="8"
              width="8"
              height="8"
              rx="1"
            />

            <path d="M10 10h1v1h-1z" />
            <path d="M13 10h1v1h-1z" />
            <path d="M10 13h1v1h-1z" />
            <path d="M13 13h1v1h-1z" />
          </svg>
        </div>

        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h3
              className={[
                "font-bold tracking-tight",
                compact ? "text-sm" : "text-base",
              ].join(" ")}
            >
              Scan Scooter
            </h3>

            {!compact && (
              <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-300">
                QR
              </span>
            )}
          </div>

          <p
            className={[
              "leading-5 text-slate-400",
              compact ? "text-xs" : "text-sm",
            ].join(" ")}
          >
            Open scooter maintenance instantly
          </p>
        </div>
      </div>

      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-orange-300 transition group-hover:translate-x-1 group-hover:border-orange-400/30">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </div>
    </Link>
  );
}
