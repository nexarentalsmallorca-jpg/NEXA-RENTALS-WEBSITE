import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BlogPageClient from "@/app/components/blog/BlogPageClient";
import {
  defaultLocale,
  isValidLocale,
  type Locale,
} from "../../../i18n/routing";
import { getTranslations } from "next-intl/server";
import {
  buildBlogIndexHreflangLanguages,
  blogIndexCanonicalUrl,
  INDEXABLE_ROBOTS,
} from "@/lib/blog-seo";
import { getBlogsForLocale } from "../../../lib/blogs";
import { resolvePopularPosts } from "../../../lib/blog-popular";
import { getAllBlogViewCounts } from "../../../lib/blog-views";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string }>;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requestedLocale } = await params;

  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  const t = await getTranslations({ locale, namespace: "blog" });
  const title = t("metaTitle");
  const description = t("metaDescription");

  const canonical = blogIndexCanonicalUrl(locale);

  return {
    title,
    description,
    robots: INDEXABLE_ROBOTS,
    alternates: {
      canonical,
      languages: buildBlogIndexHreflangLanguages(),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NEXA Rentals",
      type: "website",
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale: requestedLocale } = await params;

  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  const blogs = getBlogsForLocale(locale);
  const viewCounts = await getAllBlogViewCounts();
  const initialPopular = resolvePopularPosts(blogs, viewCounts, 6);

  const currentLanguage =
    LANGUAGES.find((language) => language.code === locale) || LANGUAGES[0];

  const backHref = `/${locale}/home`;

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-[#26313d]">
      <div className="fixed left-5 top-5 z-[100] md:left-8 md:top-8">
        <Link
          href={backHref}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 border border-[#26313d]/20 bg-white/90 px-5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#26313d] shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#26313d] hover:bg-[#26313d] hover:text-white"
        >
          <span className="text-lg leading-none">←</span>
          <span>Back</span>
        </Link>
      </div>

      <div className="fixed right-5 top-5 z-[100] md:right-8 md:top-8">
        <details className="group relative">
          <summary className="inline-flex min-h-[46px] min-w-[96px] cursor-pointer list-none items-center justify-center gap-2 border border-[#26313d]/20 bg-white/90 px-4 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#26313d] shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl transition duration-300 hover:border-[#26313d] hover:bg-white [&::-webkit-details-marker]:hidden">
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

          <div className="absolute right-0 top-[calc(100%+10px)] z-[110] w-[245px] border border-[#26313d]/14 bg-white/95 p-2 text-[#26313d] shadow-[0_26px_90px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
            <div className="px-3 pb-2 pt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#26313d]/42">
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
                        ? "bg-[#26313d] text-white"
                        : "text-[#26313d]/72 hover:bg-[#26313d]/[0.06] hover:text-[#26313d]",
                    ].join(" ")}
                  >
                    <span className="flex items-center gap-3">
                      <Image
                        src={language.flagSrc}
                        alt={language.label}
                        width={22}
                        height={22}
                        className="rounded-full shadow-[0_0_0_1px_rgba(38,49,61,0.12)]"
                      />
                      <span className="text-sm font-semibold">
                        {language.label}
                      </span>
                    </span>

                    <span
                      className={[
                        "text-[10px] font-extrabold uppercase tracking-[0.16em]",
                        active ? "text-white" : "text-[#26313d]/38",
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

      <BlogPageClient
        locale={locale}
        blogs={blogs}
        initialPopular={initialPopular}
        viewCounts={viewCounts}
      />
    </main>
  );
}