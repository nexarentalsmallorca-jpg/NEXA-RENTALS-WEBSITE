import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/app/Navbar";
import BlogPageClient from "@/app/components/blog/BlogPageClient";
import {
  defaultLocale,
  isValidLocale,
  type Locale,
} from "../../../i18n/routing";
import { getTranslations } from "next-intl/server";
import BlogIndexArchive from "@/app/components/blog/BlogIndexArchive";
import BlogRentalGuides from "@/app/components/blog/BlogRentalGuides";
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
  const guidesHref = `/${locale}/blog/scooter-rental-guides`;

  return (
    <main
      className="min-h-screen overflow-x-clip"
      style={{ backgroundColor: "#e8e7e3" }}
    >
      <Suspense
        fallback={
          <div
            className="h-24 w-full"
            style={{ backgroundColor: "#e8e7e3" }}
          />
        }
      >
        <Navbar />
      </Suspense>

      <BlogPageClient
        locale={locale}
        blogs={blogs}
        initialPopular={initialPopular}
        viewCounts={viewCounts}
      />

      <section className="mx-auto w-full min-w-0 max-w-[1320px] px-4 pb-4 pt-4 sm:px-6 md:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-orange-200/70 bg-white/85 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
                NEXA Rentals Mallorca
              </p>

              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
                All scooter rental guides in one place
              </h2>

              <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
                Explore every important NEXA guide about scooter rental,
                e-bike rental, 125cc licence rules, deposits, prices, helmets,
                routes, Palmanova, Magaluf and Mallorca booking tips.
              </p>
            </div>

            <Link
              href={guidesHref}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-bold text-white shadow-[0_10px_28px_rgba(255,122,0,0.25)] transition hover:brightness-105 sm:w-auto"
            >
              View all scooter rental guides →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full min-w-0 max-w-[1320px] px-4 pb-8 sm:px-6 md:px-8 lg:px-10">
        <BlogRentalGuides locale={locale} variant="light" className="mt-4" />
      </div>

      <BlogIndexArchive locale={locale} blogs={blogs} />
    </main>
  );
}