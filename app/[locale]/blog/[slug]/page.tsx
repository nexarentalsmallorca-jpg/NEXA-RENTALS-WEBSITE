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
  buildPostHreflangLanguages,
  blogCanonicalUrl,
  INDEXABLE_ROBOTS,
  SITE_URL,
} from "@/lib/blog-seo";
import {
  getBlogBySlug,
  getBlogHeroImage,
  getBlogTranslation,
  getBlogsForLocale,
} from "@/lib/blogs";
import { getBlogViewCount } from "@/lib/blog-views";

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
  const canonical = blogCanonicalUrl(locale, blog.slug);

  return {
    title: blog.metaTitle,
    description: blog.metaDescription,
    robots: INDEXABLE_ROBOTS,
    alternates: {
      canonical,
      languages: buildPostHreflangLanguages(post),
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
