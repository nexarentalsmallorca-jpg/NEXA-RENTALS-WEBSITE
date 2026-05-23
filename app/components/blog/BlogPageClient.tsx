"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import BlogMostPopular from "@/app/components/blog/BlogMostPopular";
import { useBlogPopularDoorReveal } from "@/app/components/blog/useBlogPopularDoorReveal";
import {
  resolvePopularPosts,
  type PopularBlogItem,
} from "@/lib/blog-popular";
import { motion, useInView, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import BlogViewCount from "@/app/components/blog/BlogViewCount";
import { passVerticalWheelToPage } from "@/lib/pass-vertical-wheel";
import { isBlogPlaceholderImage, type BlogCategory } from "@/lib/blogs";
import type { Locale } from "@/i18n/routing";

export type BlogListItem = {
  id: string;
  priority?: number;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  readTime: string;
  publishedAt: string;
  heroImage: string;
  imageAlt: string;
};

const PAGE_BG = "#e8e7e3";
const ORANGE = "#FF7A00";
const ORANGE_DARK = "#c45f00";

/** How far upper/lower page sections slide apart on reveal (desktop) */
const REVEAL_SLIDE_PX = 72;
const REVEAL_SLIDE_PX_MOBILE = 28;

function useRevealSlidePx() {
  const [px, setPx] = useState(REVEAL_SLIDE_PX);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setPx(mq.matches ? REVEAL_SLIDE_PX_MOBILE : REVEAL_SLIDE_PX);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return px;
}
const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;
const REVEAL_DURATION = 2.15;

/** Uniform 16:9 frames — height follows column width (responsive by breakpoint) */
const GRID_IMAGE_FRAME =
  "relative w-full overflow-hidden rounded-2xl aspect-[16/9]";
const FEATURED_IMAGE_FRAME =
  "relative w-full overflow-hidden rounded-2xl aspect-[16/9] sm:aspect-[2/1] lg:aspect-[16/9]";
const IMAGE_FILL_CLASS =
  "object-cover object-center transition duration-[850ms] ease-out group-hover:scale-[1.05] group-active:scale-[1.02]";
const PLACEHOLDER_IMAGE_CLASS =
  "object-contain object-center p-10 sm:p-14 bg-[#e8e7e3] transition duration-[850ms] ease-out group-hover:scale-[1.03]";

function blogImageClass(src: string) {
  return isBlogPlaceholderImage(src) ? PLACEHOLDER_IMAGE_CLASS : IMAGE_FILL_CLASS;
}

const TOPIC_FILTERS: Array<BlogCategory | "All"> = [
  "All",
  "Prices",
  "License",
  "E-Bikes",
  "Booking",
  "Tips",
  "Routes",
  "Deposits",
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

type Props = {
  locale: Locale;
  blogs: BlogListItem[];
  initialPopular: PopularBlogItem[];
  viewCounts: Record<string, number>;
};

function formatPublishedDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function PublishedBy({
  publishedAt,
  className = "",
  large = false,
}: {
  publishedAt: string;
  className?: string;
  large?: boolean;
}) {
  const t = useTranslations("blog.article");
  return (
    <p
      className={`leading-relaxed text-stone-500 ${large ? "text-sm sm:text-[15px] lg:text-base" : "text-xs sm:text-[13px] lg:text-sm"} ${className}`}
    >
      {t("publishedBy")}{" "}
      <span className="font-bold" style={{ color: ORANGE }}>
        {t("publishedByTeam")}
      </span>{" "}
      {t("publishedOnDate")}{" "}
      <span className="font-bold" style={{ color: ORANGE_DARK }}>
        {formatPublishedDate(publishedAt)}
      </span>
    </p>
  );
}

/** Featured: Perplexity layout (image left, text right) + luxury hover/parallax */
function FeaturedBlock({
  locale,
  post,
  viewCount,
}: {
  locale: Locale;
  post: BlogListItem;
  viewCount: number;
}) {
  const t = useTranslations("blog");
  const tCat = useTranslations("blog.categories");
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="grid min-w-0 items-center gap-6 sm:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14"
    >
      <Link
        href={`/${locale}/blog/${post.slug}`}
        className="group relative block min-w-0 overflow-hidden rounded-2xl ring-1 ring-stone-900/[0.06] transition-all duration-700 hover:shadow-[0_32px_80px_rgba(15,23,42,0.14)] hover:ring-[#FF7A00]/25 active:scale-[0.995]"
        onWheel={passVerticalWheelToPage}
      >
        <div className={FEATURED_IMAGE_FRAME}>
          <Image
            src={post.heroImage}
            alt={post.imageAlt}
            fill
            priority
            className={blogImageClass(post.heroImage)}
            sizes="(max-width: 1024px) 100vw, (max-width: 1320px) 50vw, 640px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/15 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="pointer-events-none absolute inset-0 bg-[#FF7A00]/0 transition-colors duration-700 group-hover:bg-[#FF7A00]/[0.06]" />
        </div>
      </Link>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.85, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="min-w-0 lg:py-4"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400 sm:text-xs">
          {tCat(post.category)} · {post.readTime}
        </p>

        <h2 className="mt-3 break-words font-[family-name:var(--font-playfair)] text-[1.45rem] font-semibold leading-[1.12] tracking-[-0.02em] text-stone-950 sm:mt-4 sm:text-[2rem] lg:text-[2.35rem] xl:text-[2.5rem]">
          {post.title}
        </h2>

        <PublishedBy publishedAt={post.publishedAt} large className="mt-4 sm:mt-5" />

        <BlogViewCount
          postId={post.id}
          initialCount={viewCount}
          size="sm"
          className="mt-3"
        />

        <p className="mt-5 text-[15px] leading-[1.7] text-stone-600 sm:text-base lg:text-lg">
          {post.excerpt}
        </p>

        <Link
          href={`/${locale}/blog/${post.slug}`}
          className="group/btn mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-stone-800/90 px-8 text-sm font-medium tracking-wide text-stone-900 transition-all duration-500 hover:border-[#FF7A00] hover:bg-stone-950 hover:text-white hover:shadow-[0_12px_36px_rgba(255,122,0,0.2)] active:scale-[0.98] sm:mt-8 sm:h-12 sm:px-9 sm:text-[15px]"
        >
          {t("readMore")}
          <span
            className="inline-block transition-transform duration-500 group-hover/btn:translate-x-1"
            aria-hidden
          >
            →
          </span>
        </Link>
      </motion.div>
    </motion.section>
  );
}

function GridCard({
  post,
  locale,
  index,
  viewCount,
}: {
  post: BlogListItem;
  locale: Locale;
  index: number;
  viewCount: number;
}) {
  const tCat = useTranslations("blog.categories");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.article
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay: (index % 3) * 0.08 }}
    >
      <motion.div
        whileHover={{ y: -10 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        <Link
          href={`/${locale}/blog/${post.slug}`}
          className="group block"
          aria-label={post.title}
          onWheel={passVerticalWheelToPage}
        >
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-stone-900/[0.05] transition-all duration-700 group-hover:shadow-[0_24px_56px_rgba(15,23,42,0.12)] group-hover:ring-[#FF7A00]/30">
            <div className={GRID_IMAGE_FRAME}>
              <Image
                src={post.heroImage}
                alt={post.imageAlt}
                fill
                className={blogImageClass(post.heroImage)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-50 transition-opacity duration-700 group-hover:opacity-70" />
              <div className="pointer-events-none absolute inset-0 bg-[#FF7A00]/0 transition-colors duration-700 group-hover:bg-[#FF7A00]/[0.08]" />
            </div>
          </div>

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400 sm:mt-5 sm:text-[11px]">
            {tCat(post.category)}
          </p>

          <h3 className="mt-2 break-words font-[family-name:var(--font-playfair)] text-[1.05rem] font-semibold leading-[1.22] tracking-[-0.01em] text-stone-950 transition-colors duration-500 group-hover:text-[#c45f00] sm:mt-2.5 sm:text-lg lg:text-xl">
            {post.title}
          </h3>

          <PublishedBy publishedAt={post.publishedAt} className="mt-2 sm:mt-3" />

          <p className="mt-1.5 text-[11px] text-stone-400 sm:text-xs">
            {post.readTime}
          </p>
        </Link>
      </motion.div>
    </motion.article>
  );
}

export default function BlogPageClient({
  locale,
  blogs,
  initialPopular,
  viewCounts,
}: Props) {
  const t = useTranslations("blog");
  const tCat = useTranslations("blog.categories");
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<BlogCategory | "All">("All");
  const [popularPosts, setPopularPosts] =
    useState<PopularBlogItem[]>(initialPopular);
  const [liveViewCounts, setLiveViewCounts] =
    useState<Record<string, number>>(viewCounts);
  const { revealRef, phase, marqueeActive } = useBlogPopularDoorReveal();
  const revealOpen = phase === "opening" || phase === "open";
  const revealSlidePx = useRevealSlidePx();

  useEffect(() => {
    let cancelled = false;

    const refreshPopular = async () => {
      try {
        const res = await fetch("/api/blog/views", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          counts?: Record<string, number>;
        };
        if (cancelled) return;
        const counts = data.counts ?? {};
        setLiveViewCounts(counts);
        setPopularPosts(resolvePopularPosts(blogs, counts, 6));
      } catch {
        /* keep server-provided initialPopular */
      }
    };

    refreshPopular();
    return () => {
      cancelled = true;
    };
  }, [blogs]);

  const featured = blogs[0];
  const gridSource = blogs.slice(1);

  const filteredGrid = useMemo(() => {
    const q = query.trim().toLowerCase();
    return gridSource.filter((post) => {
      const matchesTopic =
        activeTopic === "All" || post.category === activeTopic;
      const categoryLabel = tCat(post.category).toLowerCase();
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        categoryLabel.includes(q);
      return matchesTopic && matchesQuery;
    });
  }, [gridSource, query, activeTopic, tCat]);

  const featuredVisible =
    featured &&
    (activeTopic === "All" || featured.category === activeTopic) &&
    (!query.trim() ||
      featured.title.toLowerCase().includes(query.trim().toLowerCase()) ||
      featured.excerpt.toLowerCase().includes(query.trim().toLowerCase()));

  const revealTransition = {
    duration: REVEAL_DURATION,
    ease: REVEAL_EASE,
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden text-stone-900"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="mx-auto w-full min-w-0 max-w-[1320px] px-4 pt-24 sm:px-6 sm:pt-28 md:px-8 lg:px-10">
        {featured && featuredVisible && (
          <motion.div
            className="relative z-20 min-w-0"
            style={{ backgroundColor: PAGE_BG }}
            animate={{ y: revealOpen ? -revealSlidePx : 0 }}
            transition={revealTransition}
          >
            <FeaturedBlock
              locale={locale}
              post={featured}
              viewCount={liveViewCounts[featured.id] ?? 0}
            />
          </motion.div>
        )}
      </div>

      <motion.div
        ref={revealRef}
        className={`blog-popular-bleed relative z-10 ${
          revealOpen ? "overflow-x-clip overflow-y-visible" : "overflow-hidden"
        }`}
        initial={false}
        animate={{
          height: revealOpen ? "auto" : 0,
          opacity: revealOpen ? 1 : 0,
        }}
        transition={{
          height: revealTransition,
          opacity: { duration: REVEAL_DURATION * 0.9, ease: REVEAL_EASE },
        }}
        aria-hidden={!revealOpen}
      >
        <BlogMostPopular
          locale={locale}
          posts={popularPosts}
          marqueeActive={marqueeActive}
        />
      </motion.div>

      <div className="mx-auto w-full min-w-0 max-w-[1320px] px-4 pb-16 sm:px-6 sm:pb-20 md:px-8 lg:px-10">
        <motion.div
          className={`relative z-20 min-w-0 ${revealOpen ? "-mt-1" : ""}`}
          style={{ backgroundColor: PAGE_BG }}
          animate={{ y: revealOpen ? revealSlidePx : 0 }}
          transition={revealTransition}
        >
          <div
            className={`border-t border-stone-400/35 ${
              revealOpen ? "mt-3 pt-4" : "mt-0 border-transparent pt-0"
            }`}
          />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-medium text-stone-800 sm:text-[15px]">
              {t("topics")}
            </span>
          </div>

          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              {TOPIC_FILTERS.map((topic) => {
                const active = activeTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveTopic(topic)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition sm:px-[1.1rem] sm:py-2.5 sm:text-sm ${
                      active
                        ? "bg-stone-800 text-white"
                        : "bg-[#dddcd8] text-stone-700 hover:bg-[#d0cfc9]"
                    }`}
                  >
                    {tCat(topic)}
                  </button>
                );
              })}
          </div>
        </div>

        <label className="mt-4 block min-w-0">
          <span className="sr-only">{t("searchAria")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-xl border border-stone-300/80 bg-[#f3f2ef] px-4 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-stone-500 focus:bg-white sm:h-12 sm:px-5 sm:text-[15px]"
          />
        </label>

        <div className="mt-6 grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-14 xl:gap-x-9 xl:gap-y-16 [&_article]:flex [&_article]:min-w-0 [&_article]:flex-col">
          {filteredGrid.map((post, index) => (
            <GridCard
              key={post.id}
              post={post}
              locale={locale}
              index={index}
              viewCount={liveViewCounts[post.id] ?? 0}
            />
          ))}
        </div>

        {filteredGrid.length === 0 && !featuredVisible && (
          <p className="mt-16 text-center text-stone-500">{t("noResults")}</p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mt-14 rounded-2xl border border-stone-200 bg-gradient-to-br from-[#fff7f0] to-white p-7 text-center sm:mt-20 sm:p-14"
          style={{ boxShadow: "0 20px 60px rgba(255,122,0,0.06)" }}
        >
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-stone-950 sm:text-3xl">
            {t("readyTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-stone-600">
            {t("readyBody")}{" "}
            <a
              href="https://www.nexarentals.es"
              className="font-semibold text-[#c45f00] hover:text-[#FF7A00]"
            >
              nexarentals.es
            </a>
          </p>
          <Link
            href={`/${locale}/vehicles`}
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl px-8 text-sm font-semibold text-white transition hover:brightness-105"
            style={{
              background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9a3d 100%)`,
              boxShadow: "0 12px 32px rgba(255,122,0,0.2)",
            }}
          >
            {t("viewVehicles")}
          </Link>
        </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
