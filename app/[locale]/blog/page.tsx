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

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: "/en/blog",
        es: "/es/blog",
        de: "/de/blog",
        fr: "/fr/blog",
        it: "/it/blog",
        pt: "/pt/blog",
        sv: "/sv/blog",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/blog`,
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
      />
    </main>
  );
}
