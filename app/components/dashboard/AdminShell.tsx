import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-10%] h-[420px] w-[420px] rounded-full bg-orange-500/20 blur-[110px]" />
        <div className="absolute right-[-10%] top-[18%] h-[460px] w-[460px] rounded-full bg-sky-500/15 blur-[120px]" />
        <div className="absolute bottom-[-12%] left-[35%] h-[420px] w-[420px] rounded-full bg-purple-500/15 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]" />
      </div>

      <div className="relative z-10 flex">
        <AdminSidebar />

        <main className="min-h-screen flex-1">
          <AdminTopbar />
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}