import type { BlogViewCounts } from "./blog-views-store";

/** Stable jitter from post id (0–89). */
function hashPostId(postId: string): number {
  let h = 0;
  for (let i = 0; i < postId.length; i += 1) {
    h = (h * 31 + postId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 90;
}

/**
 * Realistic starting view counts: older posts (low priority number) have more views.
 * Real traffic from /api/blog/views increments on top of stored counts.
 */
export function getBlogViewSeed(postId: string, priority: number): number {
  const jitter = hashPostId(postId);
  const base = 2100 - priority * 68 + jitter;
  return Math.max(72, base);
}

/** All blog post ids in priority order (1 → 25). */
export const BLOG_POST_VIEW_ORDER: Array<{ id: string; priority: number }> = [
  { id: "scooter-rental-price-magaluf", priority: 1 },
  { id: "license-125cc-scooter-spain", priority: 2 },
  { id: "ebike-rental-price-magaluf", priority: 3 },
  { id: "best-place-rent-scooter-magaluf", priority: 4 },
  { id: "what-you-need-rent-scooter-mallorca", priority: 5 },
  { id: "rent-scooter-mallorca-car-licence", priority: 6 },
  { id: "scooter-rental-mallorca-deposit", priority: 7 },
  { id: "scooter-rental-magaluf-near-beach", priority: 8 },
  { id: "best-scooter-routes-magaluf", priority: 9 },
  { id: "best-places-visit-scooter-magaluf", priority: 10 },
  { id: "magaluf-to-palma-scooter", priority: 11 },
  { id: "scooter-vs-taxi-magaluf", priority: 12 },
  { id: "scooter-vs-car-rental-mallorca", priority: 13 },
  { id: "is-renting-scooter-mallorca-worth-it", priority: 14 },
  { id: "tourists-rent-125cc-mallorca", priority: 15 },
  { id: "scooter-rental-palmanova", priority: 16 },
  { id: "magaluf-vs-palmanova-rental", priority: 17 },
  { id: "helmets-included-mallorca", priority: 18 },
  { id: "what-included-scooter-magaluf", priority: 19 },
  { id: "half-day-scooter-magaluf", priority: 20 },
  { id: "rent-scooter-online-magaluf", priority: 21 },
  { id: "ebike-vs-scooter-magaluf", priority: 22 },
  { id: "best-ebike-routes-magaluf", priority: 23 },
  { id: "magaluf-to-palma-ebike", priority: 24 },
  { id: "ebike-vs-taxi-magaluf", priority: 25 },
];

export function getBlogViewSeedCounts(): BlogViewCounts {
  const counts: BlogViewCounts = {};
  for (const { id, priority } of BLOG_POST_VIEW_ORDER) {
    counts[id] = getBlogViewSeed(id, priority);
  }
  return counts;
}
