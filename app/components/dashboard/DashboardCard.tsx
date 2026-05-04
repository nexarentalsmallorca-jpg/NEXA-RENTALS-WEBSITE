import React from "react";

type DashboardCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  glow?: "orange" | "blue" | "purple" | "green" | "red";
};

const glowStyles = {
  orange: "from-orange-500/25 via-orange-400/10 to-transparent border-orange-400/20",
  blue: "from-sky-500/25 via-blue-400/10 to-transparent border-sky-400/20",
  purple: "from-purple-500/25 via-fuchsia-400/10 to-transparent border-purple-400/20",
  green: "from-emerald-500/25 via-green-400/10 to-transparent border-emerald-400/20",
  red: "from-red-500/25 via-rose-400/10 to-transparent border-red-400/20",
};

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  glow = "orange",
}: DashboardCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border bg-[#080A10]/80 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl ${glowStyles[glow]}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-90" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/45">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
            {value}
          </h3>
          {subtitle ? (
            <p className="mt-2 text-sm font-medium text-white/50">{subtitle}</p>
          ) : null}
        </div>

        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl text-white shadow-inner">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}