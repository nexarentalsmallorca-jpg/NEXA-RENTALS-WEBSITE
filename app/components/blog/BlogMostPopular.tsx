"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { isBlogPlaceholderImage } from "@/lib/blogs";
import type { PopularBlogItem } from "@/lib/blog-popular";
import type { Locale } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { BlogCategory } from "@/lib/blogs";

const GOLD = "#D4A853";
const ORANGE = "#FF7A00";

type Props = {
  locale: Locale;
  posts: PopularBlogItem[];
  marqueeActive?: boolean;
};

function PopularCard({
  post,
  locale,
  categoryLabel,
}: {
  post: PopularBlogItem;
  locale: Locale;
  categoryLabel: string;
}) {
  const placeholder = isBlogPlaceholderImage(post.heroImage);

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group/popular block w-[min(88vw,340px)] shrink-0 sm:w-[440px] lg:w-[500px]"
      aria-label={post.title}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#141414] shadow-[0_16px_48px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.08] transition-all duration-700 group-hover/popular:-translate-y-1.5 group-hover/popular:shadow-[0_24px_64px_rgba(255,122,0,0.2)] group-hover/popular:ring-[#D4A853]/40 group-active/popular:scale-[0.99]">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#121212]">
          <Image
            src={post.heroImage}
            alt={post.imageAlt}
            fill
            className={`transition duration-[900ms] ease-out group-hover/popular:scale-[1.03] ${
              placeholder
                ? "object-contain object-center p-6"
                : "object-contain object-center"
            }`}
            sizes="(max-width: 640px) 92vw, 500px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/75 via-transparent to-transparent" />

          <div
            className="absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md sm:text-[10px]"
            style={{
              borderColor: "rgba(212, 168, 83, 0.45)",
              background: "rgba(10, 10, 10, 0.65)",
              color: "#F0D78C",
            }}
          >
            {categoryLabel}
          </div>

          {post.viewCount > 0 && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md">
              <Eye size={12} strokeWidth={1.75} className="text-[#F0D78C]" aria-hidden />
              <span className="tabular-nums">
                {post.viewCount.toLocaleString(locale)}
              </span>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.06] bg-gradient-to-b from-[#181818] to-[#0c0c0c] px-4 py-3.5 sm:px-5 sm:py-4">
          <h3 className="line-clamp-2 font-[family-name:var(--font-playfair)] text-base font-semibold leading-snug tracking-[-0.01em] text-[#f5f3ef] transition-colors duration-500 group-hover/popular:text-[#F0D78C] sm:text-[17px]">
            {post.title}
          </h3>
          <p className="mt-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
            <span
              className="inline-block h-px w-5 shrink-0"
              style={{ background: `linear-gradient(90deg, ${ORANGE}, transparent)` }}
              aria-hidden
            />
            {post.readTime}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function BlogMostPopular({
  locale,
  posts,
  marqueeActive = false,
}: Props) {
  const t = useTranslations("blog");
  const tCat = useTranslations("blog.categories");
  const [paused, setPaused] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" });
    };

    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, []);

  if (posts.length === 0) return null;

  const loopItems = [...posts, ...posts];

  return (
    <section
      className="relative w-full"
      aria-labelledby="blog-most-popular-heading"
    >
      <div
        ref={stripRef}
        className="relative overflow-x-clip overflow-y-visible bg-[#050505] py-5 sm:py-6"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 45% at 50% 0%, rgba(255,122,0,0.16) 0%, transparent 55%), radial-gradient(ellipse 50% 35% at 92% 90%, rgba(212,168,83,0.1) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 mx-auto mb-5 max-w-[1320px] px-5 sm:mb-6 sm:px-8 lg:px-10">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            {t("trending")}
          </p>
          <h2
            id="blog-most-popular-heading"
            className="mt-2 font-[family-name:var(--font-playfair)] text-[1.65rem] font-semibold tracking-[-0.03em] text-white sm:text-[2rem]"
          >
            {t("mostPopular")}
          </h2>
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-stone-400 sm:text-sm">
            {t("mostPopularSubtitle")}
          </p>
        </div>

        <div
          className="blog-popular-marquee relative z-10 overflow-x-clip overflow-y-visible pb-1"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div className="blog-popular-marquee__fade blog-popular-marquee__fade--left" />
          <div className="blog-popular-marquee__fade blog-popular-marquee__fade--right" />

          <div
            className={`blog-popular-marquee__track flex w-max items-stretch gap-5 sm:gap-6 ${
              paused ? "blog-popular-marquee__track--paused" : ""
            } ${marqueeActive ? "blog-popular-marquee__track--active" : "blog-popular-marquee__track--idle"}`}
          >
            {loopItems.map((post, index) => (
              <PopularCard
                key={`${post.id}-${index}`}
                post={post}
                locale={locale}
                categoryLabel={tCat(post.category as BlogCategory)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
