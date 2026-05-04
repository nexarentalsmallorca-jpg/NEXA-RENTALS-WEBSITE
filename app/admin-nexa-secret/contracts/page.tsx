const contracts = [
  {
    name: "Website Customer",
    file: "2026-05-04_Website_Customer_Piaggio_Liberty_125.pdf",
    date: "04 May 2026",
    status: "Generated",
  },
  {
    name: "Walk-in Customer",
    file: "2026-05-04_Walk-in_Customer_EBike.pdf",
    date: "04 May 2026",
    status: "Ready",
  },
];

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
          PDF Archive
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
          Contracts
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
          Every generated contract will be stored here and later uploaded
          automatically to Google Drive.
        </p>
      </section>

      <section className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.file}
            className="flex flex-col justify-between gap-4 rounded-[28px] border border-white/10 bg-[#080A10]/80 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl md:flex-row md:items-center"
          >
            <div>
              <p className="text-lg font-black text-white">{contract.name}</p>
              <p className="mt-1 text-sm text-white/45">{contract.file}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                {contract.date}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-black text-white/70">
                Download
              </button>
              <button className="rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-sky-500 px-4 py-3 text-sm font-black text-white">
                Print
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}