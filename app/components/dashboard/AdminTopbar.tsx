"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getPageTitle(pathname: string) {
  if (pathname.includes("/bookings")) return "Bookings";
  if (pathname.includes("/create-booking")) return "Create Booking";
  if (pathname.includes("/vehicles")) return "Vehicles";
  if (pathname.includes("/calendar")) return "Availability Calendar";
  if (pathname.includes("/customers")) return "Customers";
  if (pathname.includes("/contracts")) return "Contracts";
  if (pathname.includes("/settings")) return "Settings";
  return "Dashboard";
}

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#05060A]/75 px-4 py-4 text-white backdrop-blur-2xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300/80">
            NEXA Rentals
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin-nexa-secret/create-booking"
            className="hidden rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-5 py-3 text-sm font-black text-white shadow-[0_15px_45px_rgba(255,128,0,0.25)] transition hover:-translate-y-0.5 md:block"
          >
            + New Booking
          </Link>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-xs font-bold text-white/45">Admin</p>
            <p className="text-sm font-black text-white">Sahil</p>
          </div>
        </div>
      </div>
    </header>
  );
}