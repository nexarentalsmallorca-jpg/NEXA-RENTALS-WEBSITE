"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ShopSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [typed, setTyped] = useState("");
  const [inView, setInView] = useState(false);
useEffect(() => {
  if (!inView) return;

  const text =
    "Visit our shop in Magaluf and rent directly in person — no booking needed.";

  let i = 0;
  const id = setInterval(() => {
    i++;
    setTyped(text.slice(0, i));
    if (i >= text.length) clearInterval(id);
  }, 20);

  return () => clearInterval(id);
}, [inView]);

  useEffect(() => {
  const el = sectionRef.current;
  if (!el) return;

  const obs = new IntersectionObserver(
    ([entry]) => {
      // ✅ toggle BOTH ways so animation can replay
      setInView(entry.isIntersecting);
    },
    { threshold: 0.35 }
  );

  obs.observe(el);
  return () => obs.disconnect();
}, []);

  return (
    <section
      ref={sectionRef}
      id="shop"
      className="relative overflow-hidden bg-black py-16"
    >
      <div className="pointer-events-none absolute inset-0 shop-glow" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-10">
          {/* LEFT: IMAGE (no border/card) */}
       <div
  className={[
    "transition-all duration-700 ease-out lg:translate-x-50",
    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
  ].join(" ")}
>

  <Image
  src="/images/shop.png"
  alt="NEXA shop"
  width={1100}
  height={1100}
  className="w-full h-auto scale-700"
/>
</div>


          {/* RIGHT: SIMPLE */}
          <div className={`lg:col-span-9 lg:pl-100 ${inView ? "reveal-on" : "reveal-off"}`}>


            <h2 className="reveal-item text-2xl font-extrabold tracking-tight text-white md:text-3xl">
  Prefer renting in person?
  <span className="block text-orange-400">Visit our shop in Magaluf</span>
</h2>

<p className="reveal-item mt-3 max-w-lg text-[13px] text-white/70 md:text-sm">
  Visit our shop in Magaluf and rent directly in person — no booking needed.
</p>



           <div className="reveal-item mt-6 grid gap-4 sm:grid-cols-2">
              <InfoLine title="Pickup Location" value="Magaluf (Carrer Galeón 13)" />
              <InfoLine title="Opening Hours" value="Daily • 10:00 – 22:00" />
            </div>

            <div className="reveal-item mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-semibold text-white">What to bring</div>
              <ul className="mt-3 space-y-2 text-[13px] text-white/70">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Valid ID (passport or residence card)
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Driving license (if required for your vehicle)
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                  Payment method (card/cash depending on availability)
                </li>
              </ul>
            </div>

            <div className="reveal-item mt-7 flex flex-wrap gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Carrer%20Gale%C3%B3n%2013%20Magaluf"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-extrabold text-black transition hover:bg-orange-400 active:scale-[0.99]"
              >
                Get Directions
              </a>

              <a
                href="https://wa.me/34000000000?text=Hi%20NEXA%20Rentals!%20I%20want%20to%20rent%20today."
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:border-orange-500/40 hover:bg-white/10"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoLine({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[12px] font-semibold tracking-wide text-white/55">{title}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
