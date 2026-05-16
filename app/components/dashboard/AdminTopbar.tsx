"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { Bike, CalendarDays, Menu, Plus, Wrench, X } from "lucide-react";

type AdminTopbarProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  theme: "dark" | "light";
};

function getPageTitle(pathname: string) {
  if (pathname.includes("/maintenance")) return "Maintenance";
  if (pathname.includes("/sales")) return "Sales";
  if (pathname.includes("/bookings")) return "Bookings";
  if (pathname.includes("/create-booking")) return "Create Booking";
  if (pathname.includes("/vehicles")) return "Vehicles";
  if (pathname.includes("/calendar")) return "Calendar";
  if (pathname.includes("/customers")) return "Customers";
  if (pathname.includes("/contracts")) return "Contracts";
  if (pathname.includes("/settings")) return "Settings";
  return "Dashboard";
}

function getPageSubtitle(pathname: string) {
  if (pathname.includes("/maintenance")) return "Service, cleaning, tires, lights and fleet health.";
  if (pathname.includes("/sales")) return "Daily revenue, cash/card split and booking performance.";
  if (pathname.includes("/bookings")) return "Active rentals, reservations, returns and customer movement.";
  if (pathname.includes("/create-booking")) return "Create a rental, generate a contract and block the vehicle.";
  if (pathname.includes("/vehicles")) return "Fleet status, plates, models and vehicle availability.";
  if (pathname.includes("/calendar")) return "Pickup, return and reservation dates in one place.";
  if (pathname.includes("/customers")) return "Customer records and booking history.";
  if (pathname.includes("/contracts")) return "Generated rental contracts and document archive.";
  if (pathname.includes("/settings")) return "Internal rules, integrations and system settings.";
  return "Fleet, bookings, revenue and today's work.";
}

function getQuickAction(pathname: string) {
  if (pathname.includes("/sales")) {
    return { href: "/admin-nexa-secret/bookings", label: "Bookings" };
  }

  if (pathname.includes("/maintenance")) {
    return { href: "/admin-nexa-secret/vehicles", label: "Fleet" };
  }

  if (pathname.includes("/calendar")) {
    return { href: "/admin-nexa-secret/bookings", label: "Bookings" };
  }

  return { href: "/admin-nexa-secret/create-booking", label: "New Booking" };
}

export default function AdminTopbar({
  mobileMenuOpen,
  setMobileMenuOpen,
  theme,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const subtitle = getPageSubtitle(pathname);
  const quickAction = getQuickAction(pathname);

  return (
    <header className={`sticky top-0 z-30 border-b px-4 py-3 backdrop-blur-2xl sm:px-5 lg:px-7 ${
      theme === "light"
        ? "border-black/[0.08] bg-[#F7F2EA]/82"
        : "border-white/[0.08] bg-[#07080A]/82"
    }`}>
      <div className="mx-auto flex w-full max-w-[1540px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition lg:hidden ${
              theme === "light"
                ? "border-black/10 bg-white text-black hover:bg-black/5"
                : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.09]"
            }`}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.75)]" />
              <p className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-orange-300 sm:text-[11px]">
                Nexa Rentals OS
              </p>
            </div>

            <h1 className={`mt-1 truncate text-2xl font-black tracking-tight md:text-3xl ${
              theme === "light" ? "text-black" : "text-white"
            }`}>
              {title}
            </h1>

            <p className={`mt-1 hidden max-w-2xl truncate text-sm font-semibold md:block ${
              theme === "light" ? "text-black/52" : "text-white/45"
            }`}>
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <TopbarLink href="/admin-nexa-secret/maintenance" label="Maintenance" icon={<Wrench size={15} />} />
          <TopbarLink href="/admin-nexa-secret/calendar" label="Calendar" icon={<CalendarDays size={15} />} />

          <Link
            href={quickAction.href}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-black shadow-[0_14px_34px_rgba(255,255,255,0.13)] transition hover:-translate-y-0.5 hover:bg-orange-200 sm:px-4"
          >
            {quickAction.href.includes("create-booking") ? <Plus size={16} /> : <Bike size={16} />}
            <span className="hidden sm:inline">{quickAction.label}</span>
          </Link>

          <div className="hidden rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 sm:block">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
              Admin
            </p>
            <p className="text-sm font-black text-white">Sahil</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function TopbarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 text-xs font-black text-white/65 transition hover:bg-white/[0.08] hover:text-white xl:inline-flex"
    >
      {icon}
      {label}
    </Link>
  );
}
