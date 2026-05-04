"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin-nexa-secret",
    icon: "⌁",
  },
  {
    label: "Bookings",
    href: "/admin-nexa-secret/bookings",
    icon: "▣",
  },
  {
    label: "Create Booking",
    href: "/admin-nexa-secret/create-booking",
    icon: "+",
  },
  {
    label: "Vehicles",
    href: "/admin-nexa-secret/vehicles",
    icon: "◈",
  },
  {
    label: "Calendar",
    href: "/admin-nexa-secret/calendar",
    icon: "◷",
  },
  {
    label: "Customers",
    href: "/admin-nexa-secret/customers",
    icon: "◎",
  },
  {
    label: "Contracts",
    href: "/admin-nexa-secret/contracts",
    icon: "✦",
  },
  {
    label: "Settings",
    href: "/admin-nexa-secret/settings",
    icon: "⚙",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[290px] shrink-0 border-r border-white/10 bg-[#05060A]/95 p-5 text-white shadow-[20px_0_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:block">
      <div className="flex h-full flex-col">
        <Link href="/admin-nexa-secret" className="group">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-inner transition hover:bg-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-purple-500 to-sky-400 text-lg font-black text-white shadow-[0_0_35px_rgba(255,130,0,0.35)]">
                N
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">NEXA OS</p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Control Center
                </p>
              </div>
            </div>
          </div>
        </Link>

        <nav className="mt-7 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin-nexa-secret" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 text-white shadow-[0_14px_45px_rgba(255,120,0,0.22)]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-base ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-white/[0.05] text-white/50 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[24px] border border-orange-400/20 bg-gradient-to-br from-orange-500/15 via-purple-500/10 to-sky-500/10 p-4">
          <p className="text-sm font-black text-white">System Status</p>
          <p className="mt-1 text-xs font-medium text-white/50">
            Dashboard base ready. Supabase connection coming next.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}