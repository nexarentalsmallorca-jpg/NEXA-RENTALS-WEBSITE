import AdminShell from "../../components/dashboard/AdminShell";

export default function SettingsPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
            System Settings
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            Settings
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
            Business rules, pricing, contract settings, Google Drive connection
            and admin access will be controlled from here.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <h3 className="text-2xl font-black text-white">Business Rules</h3>

            <div className="mt-5 space-y-4">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30"
                placeholder="Deposit amount: €150"
              />

              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30"
                placeholder="Max rental days: 6"
              />

              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30"
                placeholder="Shop opening time: 09:30"
              />

              <input
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 text-white outline-none placeholder:text-white/30"
                placeholder="Shop closing time: 20:00"
              />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <h3 className="text-2xl font-black text-white">Integrations</h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="font-black text-white">Supabase</p>
                <p className="mt-1 text-sm text-white/50">
                  Database connection coming next.
                </p>
              </div>

              <div className="rounded-3xl border border-sky-400/20 bg-sky-400/10 p-4">
                <p className="font-black text-white">Google Drive</p>
                <p className="mt-1 text-sm text-white/50">
                  Auto-save contract PDFs later.
                </p>
              </div>

              <div className="rounded-3xl border border-purple-400/20 bg-purple-400/10 p-4">
                <p className="font-black text-white">Stripe</p>
                <p className="mt-1 text-sm text-white/50">
                  Website payments already planned.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}