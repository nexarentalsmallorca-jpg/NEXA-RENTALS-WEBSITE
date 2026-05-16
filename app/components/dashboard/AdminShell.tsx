"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("nexa_admin_theme") === "light"
      ? "light"
      : "dark";
  });

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("nexa_admin_theme", nextTheme);
      return nextTheme;
    });
  }

  return (
    <div
      data-admin-theme={theme}
      className={`min-h-screen overflow-hidden transition-colors ${
        theme === "light"
          ? "bg-[#F4F0EA] text-[#17120D]"
          : "bg-[#07080A] text-white"
      }`}
    >
      <div className="pointer-events-none fixed inset-0">
        <div
          className={`absolute inset-0 ${
            theme === "light"
              ? "bg-[radial-gradient(circle_at_18%_0%,rgba(255,122,24,0.20),transparent_30%),radial-gradient(circle_at_92%_16%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#FBF8F3_0%,#F4F0EA_48%,#EEE6DC_100%)]"
              : "bg-[radial-gradient(circle_at_18%_0%,rgba(255,122,24,0.14),transparent_30%),radial-gradient(circle_at_92%_16%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#07080A_0%,#090A0D_42%,#050506_100%)]"
          }`}
        />
        <div
          className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] ${
            theme === "light" ? "opacity-70" : "opacity-45"
          }`}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <AdminSidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="min-h-screen flex-1 overflow-x-hidden lg:pl-[276px]">
          <AdminTopbar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            theme={theme}
          />

          <div className="mx-auto w-full max-w-[1540px] px-4 pb-20 pt-4 sm:px-5 lg:px-7 lg:pb-10 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
