"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type PremiumHomeClientProps = {
  locale: string;
};

gsap.registerPlugin(ScrollTrigger);

export default function PremiumHomeClient({ locale }: PremiumHomeClientProps) {
  const bookingHref = `/${locale}/booking`;

  const pageRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLElement | null>(null);
  const scooterRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<HTMLDivElement | null>(null);
  const topBoxMarkerRef = useRef<HTMLDivElement | null>(null);
  const seatMarkerRef = useRef<HTMLDivElement | null>(null);
  const lockMarkerRef = useRef<HTMLDivElement | null>(null);
  const phoneMarkerRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const bookingPanelRef = useRef<HTMLDivElement | null>(null);
  const finalCtaRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scooter = scooterRef.current;
      const light = lightRef.current;
      const topBoxMarker = topBoxMarkerRef.current;
      const seatMarker = seatMarkerRef.current;
      const lockMarker = lockMarkerRef.current;
      const phoneMarker = phoneMarkerRef.current;
      const lock = lockRef.current;
      const phone = phoneRef.current;
      const bookingPanel = bookingPanelRef.current;
      const finalCta = finalCtaRef.current;

      if (!scooter || !storyRef.current) return;

      gsap.set(scooter, {
        scale: 1,
        xPercent: 0,
        yPercent: 0,
        rotate: 0,
        transformOrigin: "50% 50%",
      });

      gsap.set(
        [
          topBoxMarker,
          seatMarker,
          lockMarker,
          phoneMarker,
          lock,
          phone,
          bookingPanel,
          finalCta,
        ],
        {
          autoAlpha: 0,
        }
      );

      gsap.set([topBoxMarker, seatMarker, lockMarker, phoneMarker], {
        scale: 0.7,
      });

      gsap.set(lock, {
        y: 80,
        rotate: -18,
        scale: 0.82,
      });

      gsap.set(phone, {
        y: 40,
        rotate: 8,
        scale: 0.82,
      });

      gsap.set(bookingPanel, {
        x: 120,
        scale: 0.94,
      });

      gsap.set(finalCta, {
        y: 40,
      });

      const floatTween = gsap.to(scooter, {
        y: -10,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "none",
        },
        scrollTrigger: {
          trigger: storyRef.current,
          start: "top top",
          end: "+=700%",
          scrub: 1.35,
          pin: true,
          anticipatePin: 1,
        },
      });

      timeline
        /**
         * SCENE 1
         * Full premium arrival.
         */
        .to(
          light,
          {
            opacity: 1,
            scale: 1.08,
            duration: 1,
          },
          0
        )
        .fromTo(
          scooter,
          {
            autoAlpha: 0,
            scale: 0.92,
            yPercent: 4,
          },
          {
            autoAlpha: 1,
            scale: 1,
            yPercent: 0,
            duration: 1,
          },
          0
        )

        /**
         * SCENE 2
         * Camera pushes into top box.
         */
        .to(
          scooter,
          {
            scale: 2.18,
            xPercent: -22,
            yPercent: 16,
            rotate: -1.2,
            duration: 1.2,
          },
          1
        )
        .to(
          topBoxMarker,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
          },
          1.35
        )
        .to(
          light,
          {
            xPercent: 18,
            yPercent: -8,
            scale: 1.18,
            opacity: 0.92,
            duration: 1.2,
          },
          1
        )

        /**
         * SCENE 3
         * Camera moves to seat / underseat storage.
         * Later we will swap this with real open-seat image.
         */
        .to(
          topBoxMarker,
          {
            autoAlpha: 0,
            scale: 0.75,
            duration: 0.25,
          },
          2
        )
        .to(
          scooter,
          {
            scale: 2.38,
            xPercent: -8,
            yPercent: 2,
            rotate: 0.6,
            duration: 1.1,
          },
          2
        )
        .to(
          seatMarker,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
          },
          2.35
        )

        /**
         * SCENE 4
         * Disc alarm lock reveal.
         */
        .to(
          seatMarker,
          {
            autoAlpha: 0,
            scale: 0.75,
            duration: 0.25,
          },
          3
        )
        .to(
          lock,
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 0.55,
          },
          3.05
        )
        .to(
          scooter,
          {
            scale: 2.45,
            xPercent: 20,
            yPercent: -7,
            rotate: 0,
            duration: 1.1,
          },
          3
        )
        .to(
          lockMarker,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
          },
          3.35
        )

        /**
         * SCENE 5
         * Phone holder / handlebar zoom.
         */
        .to(
          lockMarker,
          {
            autoAlpha: 0,
            scale: 0.75,
            duration: 0.25,
          },
          4
        )
        .to(
          lock,
          {
            autoAlpha: 0,
            y: -40,
            rotate: 14,
            scale: 0.86,
            duration: 0.4,
          },
          4
        )
        .to(
          scooter,
          {
            scale: 2.72,
            xPercent: -36,
            yPercent: 34,
            rotate: -1.2,
            duration: 1.1,
          },
          4
        )
        .to(
          phone,
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: 0.5,
          },
          4.25
        )
        .to(
          phoneMarker,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.35,
          },
          4.35
        )

        /**
         * SCENE 6
         * Pull back to full scooter.
         */
        .to(
          phoneMarker,
          {
            autoAlpha: 0,
            scale: 0.75,
            duration: 0.25,
          },
          5
        )
        .to(
          phone,
          {
            autoAlpha: 0,
            y: -30,
            scale: 0.9,
            duration: 0.35,
          },
          5
        )
        .to(
          scooter,
          {
            scale: 1.06,
            xPercent: 0,
            yPercent: 0,
            rotate: 0,
            duration: 1.25,
          },
          5
        )
        .to(
          light,
          {
            xPercent: 0,
            yPercent: 0,
            scale: 1.08,
            opacity: 1,
            duration: 1.25,
          },
          5
        )
        .to(
          [topBoxMarker, seatMarker, lockMarker, phoneMarker],
          {
            autoAlpha: 1,
            scale: 0.86,
            stagger: 0.08,
            duration: 0.5,
          },
          5.45
        )

        /**
         * SCENE 7
         * Booking reveal.
         */
        .to(
          [topBoxMarker, seatMarker, lockMarker, phoneMarker],
          {
            autoAlpha: 0,
            scale: 0.7,
            duration: 0.35,
          },
          6.1
        )
        .to(
          scooter,
          {
            scale: 0.82,
            xPercent: -28,
            yPercent: 0,
            rotate: -0.5,
            duration: 1,
          },
          6.1
        )
        .to(
          bookingPanel,
          {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
          },
          6.25
        )
        .to(
          finalCta,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
          },
          6.55
        );

      const handleMouseMove = (event: MouseEvent) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;

        gsap.to(scooter, {
          x: x * 22,
          y: y * 16,
          rotateY: x * 4,
          rotateX: y * -3,
          duration: 0.8,
          ease: "power3.out",
        });

        gsap.to(light, {
          x: x * -28,
          y: y * -18,
          duration: 1,
          ease: "power3.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        floatTween.kill();
      };
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen overflow-x-hidden bg-black text-white">
      <section
        ref={storyRef}
        className="relative h-screen overflow-hidden bg-[#030303]"
      >
        {/* Deep premium studio background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(245,158,11,0.12),transparent_26%),linear-gradient(120deg,#000000,#101114_48%,#000000)]" />

        {/* Moving spotlight */}
        <div
          ref={lightRef}
          className="absolute left-1/2 top-1/2 h-[78vmin] w-[78vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 opacity-80 blur-3xl"
        />

        {/* Orange floor glow */}
        <div className="absolute bottom-[13%] left-1/2 h-32 w-[44rem] -translate-x-1/2 rounded-full bg-orange-300/10 blur-3xl" />

        {/* Premium circular lines */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[92vmin] w-[92vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
        <div className="pointer-events-none absolute left-[58%] top-[52%] h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200/[0.035]" />

        {/* Top minimal nav only */}
        <header className="pointer-events-none absolute left-0 top-0 z-40 w-full">
          <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between px-6 sm:px-10 lg:px-14">
            <Link
              href={`/${locale}`}
              className="pointer-events-auto inline-flex flex-col"
            >
              <span className="tracking-[0.48em] text-2xl font-semibold leading-none sm:text-3xl">
                NEXA
              </span>
              <span className="mt-2 text-[10px] tracking-[0.62em] text-white/50">
                RENTALS
              </span>
            </Link>

            <Link
              href={bookingHref}
              className="pointer-events-auto rounded-xl border border-orange-200/70 px-5 py-3 text-sm font-medium text-orange-100 transition hover:bg-orange-200 hover:text-black sm:px-7"
            >
              Book Online
            </Link>
          </div>
        </header>

        {/* Main scooter stage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={scooterRef}
            className="relative h-[68vh] w-[92vw] max-w-[1180px] will-change-transform"
            style={{
              transformStyle: "preserve-3d",
              perspective: "1200px",
            }}
          >
            <Image
              src="/images/piaggio.png"
              alt="Black Piaggio Liberty 125 scooter with top box from NEXA Rentals"
              fill
              priority
              sizes="100vw"
              className="object-contain drop-shadow-[0_50px_95px_rgba(0,0,0,0.88)]"
            />
          </div>
        </div>

        {/* Floor reflection/shadow */}
        <div className="absolute bottom-[8%] left-1/2 h-20 w-[54vw] -translate-x-1/2 rounded-full bg-black/80 blur-2xl" />
        <div className="absolute bottom-[6%] left-1/2 h-px w-[48vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Text-free focus markers */}
        <div
          ref={topBoxMarkerRef}
          className="absolute right-[20.5%] top-[32%] z-30 h-28 w-28 rounded-full border border-orange-200/90 shadow-[0_0_45px_rgba(251,191,36,0.22)]"
        >
          <div className="absolute inset-3 rounded-full border border-orange-200/25" />
        </div>

        <div
          ref={seatMarkerRef}
          className="absolute right-[33%] top-[45%] z-30 h-32 w-44 rounded-[999px] border border-orange-200/90 shadow-[0_0_45px_rgba(251,191,36,0.22)]"
        >
          <div className="absolute inset-4 rounded-[999px] border border-orange-200/25" />
        </div>

        <div
          ref={lockMarkerRef}
          className="absolute left-[45%] bottom-[26%] z-30 h-28 w-28 rounded-full border border-orange-200/90 shadow-[0_0_45px_rgba(251,191,36,0.22)]"
        >
          <div className="absolute inset-3 rounded-full border border-orange-200/25" />
        </div>

        <div
          ref={phoneMarkerRef}
          className="absolute left-[50%] top-[28%] z-30 h-24 w-24 rounded-full border border-orange-200/90 shadow-[0_0_45px_rgba(251,191,36,0.22)]"
        >
          <div className="absolute inset-3 rounded-full border border-orange-200/25" />
        </div>

        {/* Temporary visual lock object until real image asset is added */}
        <div
          ref={lockRef}
          className="absolute left-[49%] bottom-[25%] z-40 flex h-24 w-20 items-center justify-center rounded-3xl border border-orange-200/70 bg-black/70 shadow-[0_22px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl"
        >
          <div className="h-10 w-10 rounded-full border-[6px] border-orange-200/80" />
        </div>

        {/* Temporary visual phone holder object until real image asset is added */}
        <div
          ref={phoneRef}
          className="absolute left-[52%] top-[24%] z-40 h-28 w-20 rounded-2xl border border-white/25 bg-black/80 shadow-[0_22px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl"
        >
          <div className="absolute inset-2 rounded-xl border border-orange-200/45 bg-white/5" />
          <div className="absolute left-1/2 top-3 h-1 w-7 -translate-x-1/2 rounded-full bg-white/30" />
        </div>

        {/* Booking reveal panel, appears only at the end */}
        <div
          ref={bookingPanelRef}
          className="absolute right-6 top-1/2 z-50 w-[calc(100vw-3rem)] max-w-[430px] -translate-y-1/2 rounded-[2rem] border border-white/10 bg-white/[0.075] p-6 opacity-0 shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:right-10 sm:p-8 lg:right-16"
        >
          <div className="mb-6 h-2 w-20 rounded-full bg-orange-200/70" />

          <h2 className="text-4xl font-light tracking-[-0.06em] text-white">
            Ready to ride?
          </h2>

          <p className="mt-4 text-base leading-relaxed text-white/62">
            Choose your scooter, select your time, and reserve online with 50%
            payment.
          </p>

          <div className="mt-8 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/80">
              1. Choose Half Day or Full Day
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/80">
              2. Select pickup date and time
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/80">
              3. Pay 50% online
            </div>
          </div>

          <div ref={finalCtaRef} className="mt-8">
            <Link
              href={bookingHref}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-200 px-6 py-4 text-sm font-semibold text-black shadow-[0_0_55px_rgba(251,191,36,0.18)] transition hover:bg-white"
            >
              Book Online
            </Link>
          </div>
        </div>

        {/* Bottom minimal scroll line */}
        <div className="absolute bottom-0 left-1/2 z-40 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-white/50 to-transparent" />
      </section>

      {/* Grey scooter section placeholder for later */}
      <section className="flex min-h-screen items-center justify-center bg-[#e8e8e5] px-6 text-black">
        <div className="max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-black/45">
            Next section
          </p>
          <h2 className="mt-5 text-5xl font-light tracking-[-0.06em] sm:text-7xl">
            Grey SYM product scene comes after the black scooter story.
          </h2>
        </div>
      </section>
    </main>
  );
}