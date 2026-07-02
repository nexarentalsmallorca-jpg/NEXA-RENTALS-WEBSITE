"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type StatItem = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  compact?: boolean;
  decimals?: number;
  image?: string;
  icon?: "star" | "days";
};

const BASE_DATE = new Date("2026-06-26T00:00:00+02:00").getTime();

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDaysSinceBase() {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const base = new Date(BASE_DATE);

  const baseDay = new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate()
  ).getTime();

  return Math.max(0, Math.floor((today - baseDay) / 86400000));
}

function getDailyGrowth(
  days: number,
  min: number,
  max: number,
  seedOffset: number
) {
  let total = 0;

  for (let day = 1; day <= days; day += 1) {
    const random = seededRandom(day + seedOffset);
    total += Math.floor(min + random * (max - min + 1));
  }

  return total;
}

function formatNumber(value: number, compact?: boolean, decimals = 0) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }

  if (compact && value >= 1000) {
    return `${Math.floor(value / 1000)}K`;
  }

  return Math.floor(value).toLocaleString("en-GB");
}

function useLoopingCountUp(target: number, duration = 1450, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const startAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      setValue(0);

      const start = performance.now();

      const animate = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextValue = target * eased;

        setValue(
          decimals > 0
            ? Number(nextValue.toFixed(decimals))
            : Math.floor(nextValue)
        );

        if (progress < 1 && visibleRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setValue(target);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting) {
          startAnimation();
        }
      },
      {
        threshold: 0.35,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, duration, decimals]);

  return { value, ref };
}

function StatIcon({ item }: { item: StatItem }) {
  if (item.image) {
    return (
      <Image
        src={item.image}
        alt=""
        width={78}
        height={78}
        className="h-[58px] w-[58px] object-contain sm:h-[68px] sm:w-[68px] lg:h-[74px] lg:w-[74px]"
      />
    );
  }

  if (item.icon === "star") {
    return (
      <div className="flex h-[58px] w-[58px] items-center justify-center text-[42px] leading-none text-black sm:h-[68px] sm:w-[68px] sm:text-[48px] lg:h-[74px] lg:w-[74px] lg:text-[54px]">
        ★
      </div>
    );
  }

  return (
    <div className="flex h-[58px] w-[58px] items-center justify-center text-[24px] font-semibold leading-none tracking-[-0.08em] text-black sm:h-[68px] sm:w-[68px] sm:text-[28px] lg:h-[74px] lg:w-[74px] lg:text-[32px]">
      365
    </div>
  );
}

function StatItemBlock({ item }: { item: StatItem }) {
  const { value, ref } = useLoopingCountUp(
    item.value,
    1450,
    item.decimals ?? 0
  );

  return (
    <div
      ref={ref}
      className="group flex min-h-[190px] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[210px] sm:px-6 lg:min-h-[230px] lg:px-8"
    >
      <div className="mb-5 flex items-center justify-center transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04]">
        <StatIcon item={item} />
      </div>

      <div className="flex items-baseline justify-center gap-1 text-black">
        <span className="text-[42px] font-semibold leading-none tracking-[-0.08em] sm:text-[52px] lg:text-[62px]">
          {formatNumber(value, item.compact, item.decimals)}
        </span>

        {item.suffix ? (
          <span className="text-[28px] font-semibold leading-none tracking-[-0.06em] sm:text-[36px] lg:text-[42px]">
            {item.suffix}
          </span>
        ) : null}
      </div>

      <div className="mt-4 max-w-[190px] text-[10px] font-bold uppercase leading-[1.5] tracking-[0.24em] text-black/50 sm:text-[11px]">
        {item.label}
      </div>
    </div>
  );
}

export default function NexaStatsStripV3() {
  const stats = useMemo<StatItem[]>(() => {
    const days = getDaysSinceBase();

    const riders = 1000 + getDailyGrowth(days, 2, 4, 91);
    const kilometres = 500000 + getDailyGrowth(days, 900, 1300, 217);

    return [
      {
        id: "riders",
        value: riders,
        suffix: "+",
        label: "Satisfied Riders",
        image: "/images/c1.png",
      },
      {
        id: "kilometres",
        value: kilometres,
        suffix: "+",
        label: "Kilometres Explored",
        compact: true,
        image: "/images/c2.png",
      },
      {
        id: "rating",
        value: 5,
        decimals: 1,
        suffix: "★",
        label: "Google Rated",
        icon: "star",
      },
      {
        id: "days",
        value: 365,
        label: "Days Open",
        icon: "days",
      },
    ];
  }, []);

  return (
    <section
      className={`${montserrat.className} relative overflow-hidden bg-white px-5 py-14 text-black sm:px-8 sm:py-16 lg:px-10 lg:py-20`}
    >
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-2 items-stretch gap-y-4 lg:grid-cols-4">
        {stats.map((item) => (
          <StatItemBlock key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}