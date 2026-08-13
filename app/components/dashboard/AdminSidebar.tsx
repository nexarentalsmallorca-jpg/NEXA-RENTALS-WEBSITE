"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import {
  BarChart3,
  Bike,
  CalendarDays,
  Check,
  CircleGauge,
  ClipboardList,
  FileText,
  LogOut,
  Moon,
  Plus,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Wrench,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  theme: "dark" | "light";
  toggleTheme: () => void;
};

type NavItem = {
  label: string;
  shortLabel?: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
  badge?: string;
  description?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Control",
    items: [
      {
        label: "Dashboard",
        href: "/admin-nexa-secret",
        icon: CircleGauge,
        description: "Today overview",
      },
      {
        label: "Bookings",
        href: "/admin-nexa-secret/bookings",
        icon: CalendarDays,
        description: "Reservations & rentals",
      },
      {
        label: "Reservations",
        href: "/admin-nexa-secret/reservations",
        icon: ClipboardList,
        description: "Online & future bookings",
      },
      {
        label: "Create Booking",
        shortLabel: "New Booking",
        href: "/admin-nexa-secret/create-booking",
        icon: Plus,
        description: "Manual contract",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Sales / Revenue",
        shortLabel: "Sales",
        href: "/admin-nexa-secret/sales",
        icon: BarChart3,
        badge: "Charts",
        description: "Daily cash/card analytics",
      },
      {
        label: "Contracts",
        href: "/admin-nexa-secret/contracts",
        icon: FileText,
        description: "PDF archive",
      },
      {
        label: "Customers",
        href: "/admin-nexa-secret/customers",
        icon: Users,
        description: "Customer history",
      },
    ],
  },
  {
    title: "Fleet",
    items: [
      {
        label: "Vehicles",
        href: "/admin-nexa-secret/vehicles",
        icon: Bike,
        description: "Fleet status",
      },
      {
        label: "Maintenance",
        href: "/admin-nexa-secret/maintenance",
        icon: Wrench,
        badge: "New",
        description: "Service, cleaning & km",
      },
      {
        label: "Calendar",
        href: "/admin-nexa-secret/calendar",
        icon: CalendarDays,
        description: "Availability",
      },
      {
        label: "Settings",
        href: "/admin-nexa-secret/settings",
        icon: Settings,
        description: "Rules & system",
      },
    ],
  },
];

function isActivePath(
  pathname: string,
  href: string
) {
  if (href === "/admin-nexa-secret") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function getActiveSectionTitle(
  pathname: string
) {
  for (const section of navSections) {
    const activeItem = section.items.find(
      (item) =>
        isActivePath(pathname, item.href)
    );

    if (activeItem) {
      return activeItem.label;
    }
  }

  return "Dashboard";
}

export default function AdminSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  theme,
  toggleTheme,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const activeTitle =
    getActiveSectionTitle(pathname);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(
        "NEXA OS logout error:",
        error
      );
    }

    localStorage.removeItem(
      "nexa_admin_logged_in"
    );

    window.location.href =
      "/admin-nexa-secret/login";
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 lg:block">
        <Link
          href="/admin-nexa-secret"
          onClick={closeMobileMenu}
          className="group block flex-1"
        >
          <div
            className={`rounded-2xl border p-4 transition ${
              theme === "light"
                ? "border-black/10 bg-white/75 hover:bg-white"
                : "border-white/10 bg-white/[0.045] hover:bg-white/[0.07]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-black shadow-[0_16px_38px_rgba(255,255,255,0.11)]">
                N
              </div>

              <div className="min-w-0">
                <p
                  className={`truncate text-lg font-black tracking-tight ${
                    theme === "light"
                      ? "text-black"
                      : "text-white"
                  }`}
                >
                  Nexa OS
                </p>

                <p
                  className={`truncate text-[10px] font-black uppercase tracking-[0.2em] ${
                    theme === "light"
                      ? "text-black/45"
                      : "text-white/38"
                  }`}
                >
                  Private dashboard
                </p>
              </div>
            </div>

            <div
              className={`mt-4 rounded-xl border px-3 py-2 ${
                theme === "light"
                  ? "border-black/10 bg-black/[0.035]"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <p className="truncate text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                {activeTitle}
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  theme === "light"
                    ? "text-black/50"
                    : "text-white/42"
                }`}
              >
                Rental operations
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={closeMobileMenu}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition lg:hidden ${
            theme === "light"
              ? "border-black/10 bg-white text-black hover:bg-black/5"
              : "border-white/10 bg-white/[0.05] text-white hover:bg-white/[0.08]"
          }`}
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title}>
            <p
              className={`mb-2 px-2 text-[10px] font-black uppercase tracking-[0.22em] ${
                theme === "light"
                  ? "text-black/35"
                  : "text-white/25"
              }`}
            >
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  isActivePath(
                    pathname,
                    item.href
                  );

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      isActive
                        ? "bg-white text-black shadow-[0_16px_36px_rgba(255,255,255,0.08)]"
                        : theme === "light"
                        ? "text-black/60 hover:bg-black/[0.055] hover:text-black"
                        : "text-white/58 hover:bg-white/[0.055] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-black text-white"
                          : theme === "light"
                          ? "bg-black/[0.055] text-black/48 group-hover:bg-black/[0.09] group-hover:text-black"
                          : "bg-white/[0.055] text-white/48 group-hover:bg-white/[0.09] group-hover:text-white"
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={2.3}
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate">
                        {item.shortLabel ||
                          item.label}
                      </span>

                      {item.description ? (
                        <span
                          className={`mt-0.5 hidden truncate text-[11px] font-semibold lg:block ${
                            isActive
                              ? "text-black/52"
                              : theme ===
                                "light"
                              ? "text-black/36"
                              : "text-white/28"
                          }`}
                        >
                          {item.description}
                        </span>
                      ) : null}
                    </span>

                    {item.badge ? (
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                          isActive
                            ? "border-black/10 bg-black/10 text-black/65"
                            : item.href.includes(
                                "maintenance"
                              )
                            ? "border-orange-400/20 bg-orange-500/10 text-orange-300"
                            : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={`mt-5 space-y-3 border-t pt-4 ${
          theme === "light"
            ? "border-black/10"
            : "border-white/10"
        }`}
      >
        <button
          type="button"
          onClick={toggleTheme}
          className={`flex w-full items-center justify-between rounded-2xl border p-3 text-sm font-black transition ${
            theme === "light"
              ? "border-black/10 bg-white/80 text-black hover:bg-white"
              : "border-white/10 bg-white/[0.045] text-white hover:bg-white/[0.08]"
          }`}
        >
          <span>
            {theme === "light"
              ? "Light theme"
              : "Dark theme"}
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
            {theme === "light" ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </span>
        </button>

        <div
          className={`rounded-2xl border p-4 ${
            theme === "light"
              ? "border-black/10 bg-white/75"
              : "border-white/10 bg-white/[0.045]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={`text-sm font-black ${
                  theme === "light"
                    ? "text-black"
                    : "text-white"
                }`}
              >
                Fleet Health
              </p>

              <p
                className={`mt-1 text-xs font-semibold ${
                  theme === "light"
                    ? "text-black/50"
                    : "text-white/42"
                }`}
              >
                Tracking active
              </p>
            </div>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
              <Check size={19} />
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2">
            <ShieldCheck
              size={14}
              className="text-emerald-300"
            />

            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Online
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300 transition hover:bg-red-500/15 hover:text-red-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen w-[276px] shrink-0 border-r p-5 shadow-[18px_0_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl lg:block ${
          theme === "light"
            ? "border-black/[0.08] bg-[#F7F2EA]/92 text-black"
            : "border-white/[0.08] bg-[#07080A]/94 text-white"
        }`}
      >
        {sidebarContent}
      </aside>

      <div
        className={`fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileMenu}
      />

      <aside
        className={`fixed left-0 top-0 z-[60] h-screen w-[88%] max-w-[340px] border-r p-5 shadow-[30px_0_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-transform duration-300 lg:hidden ${
          theme === "light"
            ? "border-black/[0.08] bg-[#F7F2EA]/98 text-black"
            : "border-white/[0.08] bg-[#07080A]/98 text-white"
        } ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}