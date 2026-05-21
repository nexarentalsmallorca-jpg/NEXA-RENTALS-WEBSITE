import { writeFileSync } from "fs";
import { join } from "path";
import { blogPosts } from "../lib/blogs";
import { additionalBlogPosts } from "../lib/blog-content/additional-posts";
import { applyBlogTranslations } from "../lib/blog-content/i18n/apply";
import type { Locale } from "../i18n/routing";

const posts = applyBlogTranslations([...blogPosts, ...additionalBlogPosts]);

type SlugEntry = { id: string } & Partial<Record<Locale, string>>;

const bySlug: Record<string, SlugEntry> = {};

for (const post of posts) {
  for (const [loc, t] of Object.entries(post.translations)) {
    if (!t) continue;
    if (!bySlug[t.slug]) bySlug[t.slug] = { id: post.id };
    bySlug[t.slug][loc as Locale] = t.slug;
  }
}

const file = `import type { Locale } from "@/i18n/routing";

/** Maps any locale slug to post id and per-locale slugs (for client-side language switching). */
export type BlogSlugEntry = { id: string } & Partial<Record<Locale, string>>;

export const blogSlugByAnySlug: Record<string, BlogSlugEntry> = ${JSON.stringify(bySlug, null, 2)};
`;

writeFileSync(join(process.cwd(), "lib/blog-slug-index.ts"), file);
console.log(`Wrote ${Object.keys(bySlug).length} slug entries to lib/blog-slug-index.ts`);
