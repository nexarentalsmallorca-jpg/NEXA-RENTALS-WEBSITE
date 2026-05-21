import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/app/components/blog/BlogArticle";
import {
  defaultLocale,
  isValidLocale,
  locales,
  type Locale,
} from "@/i18n/routing";
import {
  getBlogBySlug,
  getBlogHeroImage,
  getBlogTranslation,
  getBlogsForLocale,
  hasBlogLocale,
} from "@/lib/blogs";
import { getBlogViewCount } from "@/lib/blog-views";

const SITE_URL = "https://www.nexarentals.es";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getBlogsForLocale(locale).map((blog) => ({
      locale,
      slug: blog.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: requestedLocale, slug } = await params;
  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  const post = getBlogBySlug(locale, slug);
  if (!post) {
    return { title: "Blog | NEXA Rentals" };
  }

  const blog = getBlogTranslation(post, locale);
  const heroImage = getBlogHeroImage(post.id);
  const canonical = `${SITE_URL}/${locale}/blog/${blog.slug}`;

  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales
          .filter((loc) => hasBlogLocale(post, loc))
          .map((loc) => [
            loc,
            `${SITE_URL}/${loc}/blog/${getBlogTranslation(post, loc).slug}`,
          ])
      ),
    },
    openGraph: {
      title: blog.metaTitle,
      description: blog.metaDescription,
      url: canonical,
      siteName: "NEXA Rentals",
      type: "article",
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      images: [
        {
          url: `${SITE_URL}${heroImage}`,
          alt: blog.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.metaTitle,
      description: blog.metaDescription,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale: requestedLocale, slug } = await params;
  const locale: Locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  const post = getBlogBySlug(locale, slug);
  if (!post) {
    notFound();
  }

  const blog = getBlogTranslation(post, locale);
  const initialViewCount = await getBlogViewCount(post.id);
  const allBlogs = getBlogsForLocale(locale);
  const related = allBlogs
    .filter((item) => item.slug !== blog.slug)
    .slice(0, 3)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      category: item.category,
      readTime: item.readTime,
    }));

  return (
    <BlogArticle
      locale={locale}
      blog={{
        id: post.id,
        ...blog,
        heroImage: getBlogHeroImage(post.id),
      }}
      initialViewCount={initialViewCount}
      related={related}
    />
  );
}
