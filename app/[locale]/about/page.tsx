import Link from "next/link";
import Navbar from "@/app/Navbar";

const brandOrange = "#FF7A00";

const highlights = [
  {
    title: "Fast Online Booking",
    text: "Reserve your scooter or e-bike in just a few clicks with a smooth and modern booking experience.",
    icon: <BoltIcon />,
  },
  {
    title: "Premium Fleet",
    text: "Our vehicles are selected to deliver comfort, reliability, style, and a smooth riding experience in Mallorca.",
    icon: <ShieldIcon />,
  },
  {
    title: "Tourist-Friendly Service",
    text: "We focus on making rentals simple, clear, and convenient for visitors exploring the island.",
    icon: <PeopleIcon />,
  },
  {
    title: "Mallorca-Based Convenience",
    text: "From beaches to scenic roads, Nexa Rentals helps you enjoy the island with more freedom and less waiting.",
    icon: <PinIcon />,
  },
];

const services = [
  {
    title: "Scooter Rentals",
    text: "Perfect for quick, flexible movement around Mallorca. Ideal for beach trips, restaurants, shopping areas, and discovering the island with total freedom.",
  },
  {
    title: "E-Bike Rentals",
    text: "A stylish and modern way to explore. Great for scenic rides, relaxed island routes, and customers who want a smart, comfortable, and eco-conscious option.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Vehicle",
    text: "Browse our fleet and select the scooter or e-bike that matches your style and plans.",
  },
  {
    number: "02",
    title: "Select Your Dates",
    text: "Choose your pick-up and drop-off dates through our booking system in seconds.",
  },
  {
    number: "03",
    title: "Book Online",
    text: "Complete your reservation through a simple, secure, and professional online process.",
  },
  {
    number: "04",
    title: "Pick Up & Explore",
    text: "Collect your vehicle and enjoy Mallorca with freedom, flexibility, and convenience.",
  },
];

const faqs = [
  {
    q: "What is Nexa Rentals?",
    a: "Nexa Rentals is a premium scooter and e-bike rental brand in Mallorca focused on fast online booking, modern vehicles, and a smooth customer experience.",
  },
  {
    q: "Who is Nexa Rentals for?",
    a: "Nexa Rentals is designed for tourists and visitors who want an easy, stylish, and flexible way to explore Mallorca.",
  },
  {
    q: "Can I book online?",
    a: "Yes. Our platform is built for quick and simple online reservations so customers can secure their ride in just a few steps.",
  },
  {
    q: "What type of vehicles do you offer?",
    a: "We offer scooters and e-bikes selected for comfort, convenience, and an enjoyable island riding experience.",
  },
  {
    q: "Why choose Nexa Rentals?",
    a: "Because we combine a premium brand experience, straightforward booking, customer-focused service, and vehicles designed for exploring Mallorca with ease.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="relative z-[10001]">
        <Navbar />
      </div>

      <main className="relative z-0 overflow-hidden bg-black text-white">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,0,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,122,0,0.12),transparent_25%),linear-gradient(180deg,#040404_0%,#0A0A0A_45%,#050505_100%)]" />
          <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:70px_70px] opacity-[0.12]" />
        </div>

        {/* HERO */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-2 md:px-10 md:pb-24 md:pt-4">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <span
                  className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: brandOrange }}
                />
                Premium Mobility Experience in Mallorca
              </div>

              <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                About{" "}
                <span style={{ color: brandOrange }} className="drop-shadow-sm">
                  Nexa Rentals
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
                Nexa Rentals is a modern scooter and e-bike rental brand in
                Mallorca created for travelers who want{" "}
                <span style={{ color: brandOrange }}>freedom</span>,{" "}
                <span style={{ color: brandOrange }}>speed</span>, and a{" "}
                <span style={{ color: brandOrange }}>premium experience</span>.
                We combine stylish vehicles, easy online booking, and a
                customer-first approach to make island exploration simple and
                enjoyable.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/fleet"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${brandOrange} 0%, #ff9a3d 100%)`,
                    boxShadow: "0 10px 30px rgba(255,122,0,0.25)",
                  }}
                >
                  View Fleet
                </Link>

                <Link
                  href="/"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition hover:border-white/25 hover:bg-white/10"
                >
                  Book Now
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <StatCard title="Premium" subtitle="Brand Experience" />
                <StatCard title="Fast" subtitle="Online Booking" />
                <StatCard title="Mallorca" subtitle="Tourist Focused" />
              </div>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-6 rounded-[32px] blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,122,0,0.22) 0%, rgba(255,122,0,0.05) 45%, transparent 75%)",
                }}
              />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,122,0,0.14),transparent_40%,rgba(255,255,255,0.04))]" />
                <div className="relative">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                        NEXA RENTALS
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold">
                        Built for modern island travel
                      </h2>
                    </div>
                    <div
                      className="rounded-full px-3 py-1 text-xs font-semibold text-black"
                      style={{ backgroundColor: brandOrange }}
                    >
                      Mallorca
                    </div>
                  </div>

                  <div className="space-y-4">
                    <InfoRow
                      title="Our Vision"
                      text="To build a premium mobility brand that makes exploring Mallorca more convenient, flexible, and memorable."
                    />
                    <InfoRow
                      title="Our Focus"
                      text="Simple booking, stylish vehicles, quality service, and a trusted rental experience for tourists and visitors."
                    />
                    <InfoRow
                      title="Our Promise"
                      text="A smoother way to move around the island with a service designed around convenience and customer confidence."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <SectionHeading
              eyebrow="WHO WE ARE"
              title={
                <>
                  A{" "}
                  <span style={{ color: brandOrange }}>
                    modern rental brand
                  </span>{" "}
                  designed for Mallorca
                </>
              }
              text="Nexa Rentals was created to make local transportation easier, faster, and more enjoyable for visitors. Instead of depending on expensive taxis, limited schedules, or slow options, customers can choose a smarter way to explore the island."
            />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 md:p-8">
              <p className="text-base leading-8 text-white/75">
                We believe renting should feel simple, professional, and premium
                from the first click to the final return. That is why we focus on
                clear booking, attractive vehicles, convenient service, and a
                brand experience that feels polished and trustworthy.
              </p>
              <p className="mt-5 text-base leading-8 text-white/75">
                Whether customers want to move around busy tourist areas, visit
                beaches, enjoy scenic routes, or simply experience more of
                Mallorca with freedom, Nexa Rentals is built to deliver that
                experience with style and ease.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <MiniFeature title="Simple Process" />
                <MiniFeature title="Professional Image" />
                <MiniFeature title="Island Flexibility" />
                <MiniFeature title="Customer-Focused Service" />
              </div>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-16">
          <div className="overflow-hidden rounded-[30px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.12),rgba(255,255,255,0.03),rgba(0,0,0,0.2))] p-8 md:p-10">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-300/80">
                OUR MISSION
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
                To make discovering Mallorca more{" "}
                <span style={{ color: brandOrange }}>flexible</span>, more{" "}
                <span style={{ color: brandOrange }}>stylish</span>, and more{" "}
                <span style={{ color: brandOrange }}>convenient</span>
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
                Our mission is to offer a better alternative for island travel
                through premium scooters and e-bikes, easy online booking, and a
                service experience that feels modern, dependable, and tourist
                friendly. We want every customer to spend less time worrying about
                transport and more time enjoying Mallorca.
              </p>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE NEXA */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-18">
          <SectionHeading
            eyebrow="WHY CHOOSE NEXA"
            title={
              <>
                More than a rental — a{" "}
                <span style={{ color: brandOrange }}>premium experience</span>
              </>
            }
            text="Our goal is not only to provide vehicles, but to create a rental experience that feels smooth, reliable, and professionally built from start to finish."
            center
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white/[0.06]"
              >
                <div
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,122,0,0.18), rgba(255,122,0,0.06))",
                    color: brandOrange,
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-18">
          <div className="grid gap-8 lg:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.title}
                className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-8"
              >
                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-orange-500/10 blur-2xl" />
                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                    WHAT WE OFFER
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    <span style={{ color: brandOrange }}>{service.title}</span>
                  </h3>
                  <p className="mt-4 text-base leading-8 text-white/75">
                    {service.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-18">
          <SectionHeading
            eyebrow="THE NEXA EXPERIENCE"
            title={
              <>
                A simple booking journey from{" "}
                <span style={{ color: brandOrange }}>selection</span> to{" "}
                <span style={{ color: brandOrange }}>exploration</span>
              </>
            }
            text="We keep the process clear and professional so customers can reserve quickly and start enjoying Mallorca without unnecessary delays."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6"
              >
                <div
                  className="mb-4 text-3xl font-bold"
                  style={{ color: brandOrange }}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BUILT FOR MALLORCA + TRUST */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-18">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                BUILT FOR MALLORCA
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Explore the island with more{" "}
                <span style={{ color: brandOrange }}>freedom</span> and less{" "}
                <span style={{ color: brandOrange }}>hassle</span>
              </h2>
              <p className="mt-5 text-base leading-8 text-white/75">
                Mallorca is best enjoyed with flexibility. From coastal roads and
                beaches to town centers and scenic viewpoints, having the right
                vehicle transforms the way visitors experience the island. Nexa
                Rentals is built around that idea: helping customers move more
                easily, discover more places, and enjoy every day with greater
                independence.
              </p>
            </div>

            <div className="rounded-[28px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,122,0,0.11))] p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-orange-300/80">
                THE NEXA PROMISE
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight">
                Clear, trusted, and{" "}
                <span style={{ color: brandOrange }}>customer-focused</span>
              </h2>
              <ul className="mt-6 space-y-4 text-white/78">
                <li className="flex items-start gap-3">
                  <CheckMark />
                  <span>Professional presentation and premium brand feel</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckMark />
                  <span>Simple online reservation experience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckMark />
                  <span>Vehicles selected for comfort, style, and convenience</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckMark />
                  <span>Service built around trust, clarity, and ease</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-18">
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Frequently asked about{" "}
                <span style={{ color: brandOrange }}>Nexa Rentals</span>
              </>
            }
            text="A professional brand page should answer key questions clearly and help customers feel more confident before booking."
            center
          />

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-[22px] border border-white/10 bg-white/[0.04] p-6"
              >
                <h3 className="text-lg font-semibold">{item.q}</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-10 md:pb-28">
          <div className="overflow-hidden rounded-[32px] border border-orange-500/20 bg-[linear-gradient(135deg,rgba(255,122,0,0.16),rgba(255,255,255,0.04),rgba(0,0,0,0.25))] p-8 md:p-12">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.24em] text-orange-300/80">
                READY TO RIDE?
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
                Discover Mallorca with{" "}
                <span style={{ color: brandOrange }}>Nexa Rentals</span>
              </h2>
              <p className="mt-5 text-base leading-8 text-white/78 md:text-lg">
                Book your scooter or e-bike online and enjoy a smoother,
                smarter, and more premium way to move around the island.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/fleet"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${brandOrange} 0%, #ff9a3d 100%)`,
                    boxShadow: "0 10px 30px rgba(255,122,0,0.22)",
                  }}
                >
                  View Fleet
                </Link>

                <Link
                  href="/"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </section>
          </main>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/45">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-white/72 md:text-lg">
        {text}
      </p>
    </div>
  );
}

function StatCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
      <div className="text-xl font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/65">{subtitle}</div>
    </div>
  );
}

function InfoRow({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-white/75">{text}</p>
    </div>
  );
}

function MiniFeature({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/85">
      {title}
    </div>
  );
}

function CheckMark() {
  return (
    <span
      className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(255,122,0,0.15)", color: brandOrange }}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className="h-3.5 w-3.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 10.5L8 14L15.5 6.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BoltIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13 2L5 13H11L10 22L18 11H12L13 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3L19 6V11C19 16 15.5 19.5 12 21C8.5 19.5 5 16 5 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 21V19C16 17.3431 14.6569 16 13 16H7C5.34315 16 4 17.3431 4 19V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 12C12.2091 12 14 10.2091 14 8C14 5.79086 12.2091 4 10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M20 21V19C20 17.8056 19.2892 16.7771 18.2666 16.3125"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15.5 4.1875C16.5421 4.65138 17.25 5.6978 17.25 6.875C17.25 8.0522 16.5421 9.09862 15.5 9.5625"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21C12 21 19 14.5 19 9.5C19 5.63401 15.866 2.5 12 2.5C8.13401 2.5 5 5.63401 5 9.5C5 14.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 12C13.3807 12 14.5 10.8807 14.5 9.5C14.5 8.11929 13.3807 7 12 7C10.6193 7 9.5 8.11929 9.5 9.5C9.5 10.8807 10.6193 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}