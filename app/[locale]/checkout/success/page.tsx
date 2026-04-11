import Link from "next/link";

type RawSearchParams = Promise<{
  paid?: string | string[];
  remaining?: string | string[];
  pickupDate?: string | string[];
  pickupTime?: string | string[];
  dropoffDate?: string | string[];
  dropoffTime?: string | string[];
  customerName?: string | string[];
}>;

function getValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function formatMoney(value?: string) {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return "—";
  return `€${num.toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "—";

  const parts = value.split("-");
  if (parts.length !== 3) return value;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function safeText(value?: string) {
  return value && value.trim() ? value : "—";
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: RawSearchParams;
}) {
  const params = await searchParams;

  const customerName = safeText(getValue(params.customerName));
  const amountPaid = formatMoney(getValue(params.paid));
  const remainingAmount = formatMoney(getValue(params.remaining));
  const pickupDate = formatDate(getValue(params.pickupDate));
  const pickupTime = safeText(getValue(params.pickupTime));
  const dropoffDate = formatDate(getValue(params.dropoffDate));
  const dropoffTime = safeText(getValue(params.dropoffTime));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070708] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,122,0,0.18),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%,transparent_70%,rgba(255,122,0,0.04))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-2xl rounded-[30px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl md:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 shadow-[0_0_40px_rgba(255,122,0,0.35)]">
            <span className="text-4xl text-white">✓</span>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
              Reservation Paid 50%
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Booking Confirmed
            </h1>

            <p className="mt-3 text-base text-white/75 md:text-lg">
              Your reservation has been secured successfully. We look forward to
              welcoming you to NEXA RENTALS in Mallorca.
            </p>
          </div>

          <div className="my-7 h-px bg-white/10" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Payment Summary
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-white/65">Amount Paid</span>
                  <span className="text-base font-semibold text-white">
                    {amountPaid}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-white/65">Remaining Amount</span>
                  <span className="text-base font-semibold text-white">
                    {remainingAmount}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-white/65">Customer Name</span>
                  <span className="text-base font-semibold text-white">
                    {customerName}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Rental Schedule
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-white/65">Pickup</span>
                  <span className="text-right text-base font-semibold text-white">
                    {pickupDate}
                    <br />
                    <span className="text-sm font-medium text-white/75">
                      {pickupTime}
                    </span>
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-white/65">Drop-off</span>
                  <span className="text-right text-base font-semibold text-white">
                    {dropoffDate}
                    <br />
                    <span className="text-sm font-medium text-white/75">
                      {dropoffTime}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              Important For Pickup
            </p>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
              <p>• A refundable security deposit of €150 is required at pickup.</p>
              <p>• Valid driving licence required: Category B held for 3+ years or A1.</p>
              <p>• Please bring your passport or national ID.</p>
              <p>• Remaining rental amount will be paid at pickup.</p>
              <p>• Please arrive at the agreed pickup time to avoid delays.</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex-1 rounded-2xl bg-[#ff7a00] px-6 py-3.5 text-center text-base font-bold text-black shadow-[0_0_35px_rgba(255,122,0,0.38)] transition hover:brightness-110"
            >
              Back to Home
            </Link>

            <Link
              href="/fleet"
              className="flex-1 rounded-2xl border border-white/12 bg-white/[0.03] px-6 py-3.5 text-center text-base font-semibold text-white transition hover:bg-white/[0.06]"
            >
              View Fleet
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}