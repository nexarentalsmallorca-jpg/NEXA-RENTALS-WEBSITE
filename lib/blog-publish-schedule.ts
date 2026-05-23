import type { BlogPost } from "./blogs";

/** Latest publish day (site “today” for blog scheduling). */
export const BLOG_PUBLISH_ANCHOR_DATE = "2026-05-23";

function addUtcDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** One post per calendar day: priority 1 = oldest, highest priority = anchor date. */
export function getPublishDateForPriority(
  priority: number,
  maxPriority: number
): string {
  const daysFromStart = priority - 1;
  const startDate = addUtcDays(
    BLOG_PUBLISH_ANCHOR_DATE,
    -(maxPriority - 1)
  );
  return addUtcDays(startDate, daysFromStart);
}

export function applyBlogPublishSchedule(posts: BlogPost[]): BlogPost[] {
  const maxPriority = Math.max(...posts.map((p) => p.priority ?? 1));

  return posts.map((post) => {
    const priority = post.priority ?? maxPriority;
    const publishedAt = getPublishDateForPriority(priority, maxPriority);

    const translations = Object.fromEntries(
      Object.entries(post.translations).map(([locale, translation]) => {
        if (!translation) return [locale, translation];
        return [
          locale,
          {
            ...translation,
            publishedAt,
            updatedAt: publishedAt,
          },
        ];
      })
    ) as BlogPost["translations"];

    return { ...post, translations };
  });
}
