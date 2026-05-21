import { hasRealHeroImage } from "./blogs";
import type { BlogViewCounts } from "./blog-views";

export const POPULAR_STRIP_MAX = 6;

export type BlogListLike = {
  id: string;
  priority?: number;
  publishedAt: string;
  heroImage: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  imageAlt: string;
};

export type PopularBlogItem = BlogListLike & { viewCount: number };

/** Original five posts with custom hero images (created before placeholder posts). */
export function getDefaultPopularPosts<T extends BlogListLike>(
  blogs: T[],
  limit = POPULAR_STRIP_MAX
): PopularBlogItem[] {
  return blogs
    .filter((post) => hasRealHeroImage(post.id))
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
    .slice(0, limit)
    .map((post) => ({ ...post, viewCount: 0 }));
}

export function resolvePopularPosts<T extends BlogListLike>(
  blogs: T[],
  viewCounts: BlogViewCounts,
  limit = POPULAR_STRIP_MAX
): PopularBlogItem[] {
  const totalViews = Object.values(viewCounts).reduce((sum, n) => sum + n, 0);

  if (totalViews === 0) {
    return getDefaultPopularPosts(blogs, limit);
  }

  return blogs
    .map((post) => ({
      ...post,
      viewCount: viewCounts[post.id] ?? 0,
    }))
    .sort((a, b) => {
      if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
      return (a.priority ?? 99) - (b.priority ?? 99);
    })
    .slice(0, limit);
}

