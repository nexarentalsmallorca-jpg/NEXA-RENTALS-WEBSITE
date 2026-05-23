import type { Metadata } from "next";
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

  return (
    <main className="min-h-screen overflow-x-clip" style={{ backgroundColor: "#e8e7e3" }}>
      <Suspense fallback={<div className="h-24 w-full" style={{ backgroundColor: "#e8e7e3" }} />}>
        <Navbar />
      </Suspense>

      <BlogPageClient
        locale={locale}
        blogs={blogs}
        initialPopular={initialPopular}
        viewCounts={viewCounts}
      />

      <div className="mx-auto w-full min-w-0 max-w-[1320px] px-4 pb-8 sm:px-6 md:px-8 lg:px-10">
        <BlogRentalGuides locale={locale} variant="light" className="mt-4" />
      </div>

      <BlogIndexArchive locale={locale} blogs={blogs} />
    </main>
  );
}
