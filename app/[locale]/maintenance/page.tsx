"use client";

export default function MaintenancePage() {
  const whatsappNumber = "34971482342"; // replace with your real WhatsApp

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0c0f14] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,106,0,0.16),transparent_38%),linear-gradient(180deg,#0c0f14_0%,#090b10_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-orange-400 backdrop-blur">
          Nexa Rentals • Website Update in Progress
        </div>

        <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
          We’re Upgrading Your Booking Experience
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
          Our website is temporarily under updates while we improve the entire booking flow for a faster,
          cleaner, and more premium experience.
        </p>

        <div className="mt-10 w-full max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-left shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            What’s being updated?
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-orange-400">
                Faster Booking
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">
                We are replacing the previous 3-step booking flow with a new express booking experience.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-orange-400">
                Better UI
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">
                The full design is being updated to feel cleaner, easier, and more premium across all devices.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-orange-400">
                Under 1 Minute
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">
                After the update, you’ll be able to book your ride in under 1 minute with our new 2-step system.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-5 text-center">
            <p className="text-base font-semibold leading-7 text-white">
              Bookings are still available via WhatsApp during this update.
              <br />
              Click the button below to reserve your scooter instantly.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#FF6A00] px-7 py-3 text-base font-black text-white transition hover:brightness-95"
            >
              Book via WhatsApp
            </a>
          </div>

          <p className="mt-6 text-center text-sm font-medium text-white/55">
            The website will be back online in a few days with the new express booking experience.
          </p>
        </div>
      </div>

      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Book via WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] shadow-[0_12px_35px_rgba(0,0,0,0.35)] transition hover:scale-105"
      >
        <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            fill="white"
            d="M19.11 17.23c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.62.14-.19.28-.71.9-.87 1.09-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.24-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.33.43-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.5-.07-.14-.62-1.5-.85-2.06-.22-.53-.45-.45-.62-.46h-.53c-.19 0-.5.07-.76.35-.26.28-1 1-.99 2.43 0 1.43 1.04 2.81 1.18 3 .14.19 2.04 3.12 4.94 4.37.69.3 1.23.48 1.65.61.69.22 1.31.19 1.81.12.55-.08 1.64-.67 1.87-1.32.23-.66.23-1.22.16-1.33-.06-.12-.24-.19-.52-.33Z"
          />
          <path
            fill="white"
            fillRule="evenodd"
            d="M16.01 3.2c-7.06 0-12.78 5.72-12.78 12.78 0 2.26.59 4.39 1.63 6.24L3 29l6.98-1.81a12.73 12.73 0 0 0 6.03 1.53h.01c7.06 0 12.78-5.72 12.78-12.78S23.08 3.2 16.01 3.2Zm0 23.38h-.01a10.6 10.6 0 0 1-5.41-1.49l-.39-.23-4.14 1.07 1.1-4.04-.25-.41a10.6 10.6 0 0 1-1.63-5.55c0-5.87 4.78-10.65 10.66-10.65 5.87 0 10.65 4.78 10.65 10.65 0 5.88-4.78 10.65-10.65 10.65Z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </main>
  );
}