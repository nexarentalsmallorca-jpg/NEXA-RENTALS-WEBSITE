const customers = [
  {
    name: "Website Customer",
    phone: "+34 600 000 000",
    document: "Passport / ID",
    lastRental: "Piaggio Liberty 125",
  },
  {
    name: "Walk-in Customer",
    phone: "+34 611 111 111",
    document: "Driving License",
    lastRental: "E-Bike",
  },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_25px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-300">
          Customer Database
        </p>
        <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
          Customers
        </h2>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
          Customer details, license details and rental history will be stored
          here for faster future bookings.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {customers.map((customer) => (
          <div
            key={customer.phone}
            className="rounded-[32px] border border-white/10 bg-[#080A10]/80 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Customer
            </p>
            <h3 className="mt-3 text-2xl font-black text-white">
              {customer.name}
            </h3>
            <p className="mt-2 text-sm text-white/50">{customer.phone}</p>
            <p className="mt-1 text-sm text-white/50">{customer.document}</p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">
                Last Rental
              </p>
              <p className="mt-1 font-black text-white">{customer.lastRental}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}