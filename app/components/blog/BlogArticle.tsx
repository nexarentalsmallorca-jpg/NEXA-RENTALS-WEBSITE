import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { Roboto } from "next/font/google";
import BlogParagraph from "@/app/components/blog/BlogParagraph";
import BlogQuickAnswer from "@/app/components/blog/BlogQuickAnswer";
import BlogViewCount from "@/app/components/blog/BlogViewCount";
import BlogViewTracker from "@/app/components/blog/BlogViewTracker";
import { getTranslations } from "next-intl/server";
import {
  isBlogPlaceholderImage,
  type BlogCategory,
  type BlogTranslation,
} from "@/lib/blogs";
import { blogCanonicalUrl, SITE_URL } from "@/lib/blog-seo";
import type { Locale } from "@/i18n/routing";

const pageFont = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const PAGE_BG = "#ffffff";
const INSTAGRAM_URL = "https://www.instagram.com/nexarentalsmallorca/";
const INSTAGRAM_HANDLE = "@nexarentalsmallorca";

type RelatedPost = {
  slug: string;
  title: string;
  category: BlogCategory;
  readTime: string;
};

type Props = {
  locale: Locale;
  blog: BlogTranslation & { id: string };
  initialViewCount?: number;
  related: RelatedPost[];
};

type LanguageItem = {
  code: string;
  label: string;
  short: string;
  flagSrc: string;
};

const LANGUAGES: LanguageItem[] = [
  { code: "en", label: "English", short: "EN", flagSrc: "/images/en.png" },
  { code: "es", label: "Español", short: "ES", flagSrc: "/images/es.png" },
  { code: "de", label: "Deutsch", short: "DE", flagSrc: "/images/de.png" },
  { code: "fr", label: "Français", short: "FR", flagSrc: "/images/fr.png" },
  { code: "it", label: "Italiano", short: "IT", flagSrc: "/images/it.png" },
  { code: "nl", label: "Nederlands", short: "NL", flagSrc: "/images/NL.png" },
  { code: "pl", label: "Polski", short: "PL", flagSrc: "/images/PL.png" },
  { code: "sv", label: "Svenska", short: "SV", flagSrc: "/images/sv.png" },
  { code: "da", label: "Dansk", short: "DA", flagSrc: "/images/DA.png" },
  { code: "no", label: "Norsk", short: "NO", flagSrc: "/images/NO.png" },
  { code: "pt", label: "Português", short: "PT", flagSrc: "/images/pt.png" },
  { code: "cs", label: "Čeština", short: "CS", flagSrc: "/images/CS.png" },
  { code: "uk", label: "Українська", short: "UK", flagSrc: "/images/UK.png" },
];

function formatPublishedDateLong(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function MetaLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-none text-stone-500">{children}</p>;
}

function MetaValue({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[15px] font-medium leading-snug text-stone-900">
      {children}
    </p>
  );
}

function SocialIconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center border border-stone-300/90 bg-white text-stone-700 transition hover:border-stone-500 hover:bg-stone-50 hover:text-black"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function getArticleWordCount(blog: BlogTranslation) {
  const allText = [
    blog.title,
    blog.excerpt,
    blog.quickAnswer,
    blog.ctaTitle,
    blog.ctaText,
    ...blog.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
    ]),
    ...blog.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ]
    .join(" ")
    .trim();

  if (!allText) return undefined;

  return allText.split(/\s+/).filter(Boolean).length;
}

export default async function BlogArticle({
  locale,
  blog,
  related,
  initialViewCount = 0,
}: Props) {
  const t = await getTranslations({ locale, namespace: "blog.article" });
  const tBlog = await getTranslations({ locale, namespace: "blog" });
  const tCat = await getTranslations({ locale, namespace: "blog.categories" });
  const categoryLabel = tCat(blog.category);

  const articleUrl = blogCanonicalUrl(locale, blog.slug);
  const homeHref = `/${locale}/home`;
  const blogHref = `/${locale}/blog`;
  const publishedLong = formatPublishedDateLong(blog.publishedAt, locale);
  const articleWordCount = getArticleWordCount(blog);
  const hasFaqs = blog.faqs.length > 0;

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.metaDescription,
    image: `${SITE_URL}${blog.heroImage}`,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Organization",
      name: "NEXA Rentals Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "NEXA Rentals",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: blog.category,
    inLanguage: locale,
    ...(articleWordCount ? { wordCount: articleWordCount } : {}),
  };

  const faqJsonLd = hasFaqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: blog.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: tBlog("breadcrumbHome"),
        item: `${SITE_URL}/${locale}/home`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tBlog("breadcrumbBlog"),
        item: `${SITE_URL}/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div
        className={`${pageFont.className} min-h-screen overflow-x-clip text-stone-900`}
        style={{ backgroundColor: PAGE_BG }}
      >
        <div className="fixed left-5 top-5 z-[100] md:left-8 md:top-8">
          <Link
            href={homeHref}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 border border-stone-300 bg-white/90 px-5 text-[12px] font-bold uppercase tracking-[0.18em] text-stone-900 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-black hover:bg-black hover:text-white"
          >
            <span className="text-lg leading-none">←</span>
            <span>{t("back")}</span>
          </Link>
        </div>

        <div className="fixed right-5 top-5 z-[100] md:right-8 md:top-8">
          <details className="group relative">
            <summary className="inline-flex min-h-[46px] min-w-[96px] cursor-pointer list-none items-center justify-center gap-2 border border-stone-300 bg-white/90 px-4 text-[12px] font-bold uppercase tracking-[0.16em] text-stone-900 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-black hover:bg-white [&::-webkit-details-marker]:hidden">
              <Image
                src={currentLanguage.flagSrc}
                alt={currentLanguage.label}
                width={18}
                height={18}
                className="rounded-full"
              />
              <span>{currentLanguage.short}</span>
              <span className="text-[10px] transition-transform duration-300 group-open:rotate-180">
                ▾
              </span>
            </summary>

            <div className="absolute right-0 top-[calc(100%+10px)] z-[110] w-[245px] border border-stone-200 bg-white/95 p-2 text-stone-900 shadow-[0_26px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
              <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">
                Select language
              </div>

              <div className="max-h-[430px] overflow-y-auto">
                {LANGUAGES.map((language) => {
                  const active = language.code === locale;

                  return (
                    <Link
                      key={language.code}
                      href={`/${language.code}/blog`}
                      className={[
                        "flex w-full items-center justify-between px-3 py-2.5 text-left transition active:scale-[0.98]",
                        active
                          ? "bg-black text-white"
                          : "text-stone-700 hover:bg-stone-100 hover:text-black",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <Image
                          src={language.flagSrc}
                          alt={language.label}
                          width={22}
                          height={22}
                          className="rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.12)]"
                        />
                        <span className="text-sm font-medium">
                          {language.label}
                        </span>
                      </span>

                      <span
                        className={[
                          "text-[10px] font-bold uppercase tracking-[0.16em]",
                          active ? "text-white" : "text-stone-400",
                        ].join(" ")}
                      >
                        {active ? "Active" : language.short}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </details>
        </div>

        <article className="nexa-prose-safe mx-auto w-full min-w-0 max-w-[1100px] px-4 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-28 lg:px-10">
          <BlogViewTracker postId={blog.id} />

          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={blogHref}
              className="inline-flex min-h-11 items-center text-sm font-medium text-stone-500 transition hover:text-black"
            >
              ← {tBlog("breadcrumbBlog")}
            </Link>
          </div>

          <div
            className={`relative aspect-[2/1] w-full overflow-hidden sm:aspect-[16/9] ${
              isBlogPlaceholderImage(blog.heroImage)
                ? "bg-white"
                : "bg-stone-200"
            }`}
          >
            <Image
              src={blog.heroImage}
              alt={blog.imageAlt}
              fill
              priority
              className={
                isBlogPlaceholderImage(blog.heroImage)
                  ? "object-contain object-center p-12 sm:p-16"
                  : "object-cover object-center"
              }
              sizes="(max-width: 1100px) 100vw, 1100px"
            />
          </div>

          <div className="mt-6 border border-stone-200 bg-white p-4 shadow-[0_8px_32px_rgba(15,23,42,0.04)] sm:mt-10 sm:border-0 sm:border-b sm:border-stone-300/70 sm:bg-transparent sm:p-0 sm:pb-8 sm:shadow-none">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:gap-10 md:gap-14">
              <div className="min-w-0">
                <MetaLabel>{t("writtenBy")}</MetaLabel>
                <MetaValue>
                  <span className="font-semibold text-black">
                    {t("publishedByTeam")}
                  </span>
                </MetaValue>
              </div>

              <div className="min-w-0">
                <MetaLabel>{t("publishedOn")}</MetaLabel>
                <MetaValue>{publishedLong}</MetaValue>
              </div>

              <div className="col-span-2 min-w-0 sm:col-span-1">
                <MetaLabel>{t("views")}</MetaLabel>
                <MetaValue>
                  <BlogViewCount
                    postId={blog.id}
                    initialCount={initialViewCount}
                  />
                </MetaValue>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-stone-200/80 pt-5 sm:mt-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:border-0 sm:pt-0">
              <div className="flex items-center gap-3">
                <SocialIconButton
                  href={INSTAGRAM_URL}
                  label={`Instagram ${INSTAGRAM_HANDLE}`}
                >
                  <InstagramIcon />
                </SocialIconButton>

                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate text-sm font-medium text-stone-600 underline-offset-2 transition hover:text-black hover:underline"
                >
                  {INSTAGRAM_HANDLE}
                </a>
              </div>

              <Link
                href={homeHref}
                className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-sm font-semibold text-white transition hover:bg-stone-800 sm:h-11 sm:w-auto"
              >
                {t("rentOnline")}
              </Link>
            </div>
          </div>

          <header className="w-full pt-10 sm:pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400">
              {categoryLabel} · {blog.readTime}
            </p>

            <h1 className="mt-4 max-w-[52ch] break-words text-[1.55rem] font-bold leading-[1.12] tracking-[-0.02em] text-stone-950 sm:text-[2.5rem] lg:text-[2.85rem]">
              {blog.title}
            </h1>

            <p className="mt-4 max-w-[65ch] text-base leading-[1.72] text-stone-600 sm:mt-5 sm:text-lg sm:leading-[1.75] lg:text-xl">
              {blog.excerpt}
            </p>
          </header>

          <div className="mt-12 w-full sm:mt-14">
            <BlogQuickAnswer text={blog.quickAnswer} />

            <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16">
              {blog.sections.map((section) => (
                <section key={section.heading} className="w-full">
                  <h2 className="max-w-[48ch] break-words text-xl font-bold tracking-tight text-stone-950 sm:text-3xl">
                    {section.heading}
                  </h2>

                  <div className="mt-6 max-w-[75ch] space-y-5">
                    {section.paragraphs.map((paragraph) => (
                      <BlogParagraph
                        key={paragraph.slice(0, 64)}
                        text={paragraph}
                        className="text-[17px] leading-[1.9] text-stone-700 sm:text-lg sm:leading-[1.95]"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {hasFaqs ? (
              <section className="mt-16 w-full border-t border-stone-200 pt-14 sm:mt-20">
                <h2 className="text-2xl font-bold text-stone-950 sm:text-3xl">
                  {t("faqTitle")}
                </h2>

                <dl className="mt-10 max-w-[75ch] space-y-10">
                  {blog.faqs.map((faq) => (
                    <div key={faq.question}>
                      <dt className="text-lg font-bold text-stone-950 sm:text-xl">
                        {faq.question}
                      </dt>

                      <dd className="mt-4 text-[17px] leading-[1.9] text-stone-600 sm:text-lg">
                        {faq.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section className="mt-12 flex flex-col items-stretch gap-4 border border-stone-200 bg-white p-5 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-lg font-bold text-stone-950 sm:text-xl">
                  {blog.ctaTitle}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600 sm:text-[15px]">
                  {blog.ctaText}
                </p>
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
                <Link
                  href={homeHref}
                  className="inline-flex h-12 w-full items-center justify-center bg-black px-6 text-sm font-semibold text-white transition hover:bg-stone-800 sm:h-11 sm:w-auto"
                >
                  {t("rentOnline")}
                </Link>

                <Link
                  href={homeHref}
                  className="inline-flex h-12 w-full items-center justify-center border border-stone-300 bg-white px-5 text-sm font-medium text-stone-800 transition hover:border-black hover:bg-black hover:text-white sm:h-11 sm:w-auto"
                >
                  View vehicles
                </Link>
              </div>
            </section>

            {related.length > 0 && (
              <section className="mt-16 border-t border-stone-200 pb-8 pt-12">
                <h2 className="text-lg font-bold text-stone-950">
                  {t("continueReading")}
                </h2>

                <ul className="mt-6 divide-y divide-stone-200">
                  {related.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="group block py-5"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                          {tCat(post.category)}
                        </span>

                        <span className="mt-2 block font-medium text-stone-900 transition group-hover:text-black">
                          {post.title}
                        </span>

                        <span className="mt-1 block text-sm text-stone-500">
                          {post.readTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </div>
    </>
  );
}