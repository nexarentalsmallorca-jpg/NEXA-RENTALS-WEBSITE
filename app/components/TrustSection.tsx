"use client";

export default function TrustSection() {
  const items = [
    {
      title: "Fully\nInsured",
      desc: "Comprehensive\ncoverage",
      icon: <ShieldCheckIcon />,
    },
    {
      title: "Instant\nBooking",
      desc: "Reserve in\nseconds",
      icon: <CalendarCheckIcon />,
    },
    {
      title: "Low\nDeposit",
      desc: "Rent worry-\nfree",
      icon: <ShieldLowIcon />,
    },
    {
      title: "24/7\nSupport",
      desc: "Always here\nto help",
      icon: <SupportIcon />,
    },
    {
      title: "No\nHidden Fees",
      desc: "Transparent\npricing",
      icon: <NoFeesIcon />,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-black py-16">
      {/* subtle sparks / glow background */}
      <div className="pointer-events-none absolute inset-0 trust-sparks" />

      <div className="relative mx-auto max-w-7xl px-6">
        <h2 className="text-center font-sans text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Why Rent With Us?
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="trust-card group relative rounded-3xl border border-orange-500/35 bg-white/[0.03] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
            >
              <div className="trust-icon mb-5">{it.icon}</div>

              <div className="whitespace-pre-line text-2xl font-extrabold leading-tight text-white">
                {it.title}
              </div>

              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">
                {it.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Icons (inline SVGs) ---------------- */

function ShieldCheckIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="text-orange-500">
      <path
        d="M12 22s8-4.5 8-11V6l-8-3-8 3v5c0 6.5 8 11 8 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.5 12.2 11 14.7l4.8-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="text-orange-500">
      <path
        d="M8 2v3M16 2v3M3 9h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 5h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.2 14.2 10 16l4-4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldLowIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="text-orange-500">
      <path
        d="M12 22s8-4.5 8-11V6l-8-3-8 3v5c0 6.5 8 11 8 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 14.5h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 11.2h5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="text-orange-500">
      <path
        d="M12 2a8 8 0 0 0-8 8v3a3 3 0 0 0 3 3h1v-7H7a5 5 0 0 1 10 0h-1v7h1a3 3 0 0 0 3-3v-3a8 8 0 0 0-8-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 19h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NoFeesIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" className="text-orange-500">
      <path
        d="M12 1.8a10.2 10.2 0 1 0 0 20.4 10.2 10.2 0 0 0 0-20.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 17 17 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.2 10.2c.8-1.3 4-1.3 4.8 0 .4.7.1 1.4-.8 1.8l-1.6.7c-.8.3-1.1 1-.7 1.7.8 1.3 4 1.3 4.8 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
