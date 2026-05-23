import {
  incrementLocalBlogView,
  readLocalBlogViewCounts,
  type BlogViewCounts,
} from "./blog-views-store";
import {
  BLOG_POST_VIEW_ORDER,
  getBlogViewSeedCounts,
} from "./blog-view-seeds";
import { getSupabaseAdminOptional } from "./supabaseOptional";

function withViewSeedFloor(postId: string, stored: number): number {
  const seed = getBlogViewSeedCounts()[postId] ?? 0;
  return Math.max(stored, seed);
}

function mergeViewCounts(...sources: BlogViewCounts[]): BlogViewCounts {
  const merged: BlogViewCounts = {};

  for (const { id } of BLOG_POST_VIEW_ORDER) {
    let stored = 0;
    for (const source of sources) {
      const n = source[id];
      if (typeof n === "number" && Number.isFinite(n)) {
        stored = Math.max(stored, n);
      }
    }
    merged[id] = withViewSeedFloor(id, stored);
  }

  return merged;
}

export type { BlogViewCounts };

export async function getAllBlogViewCounts(): Promise<BlogViewCounts> {
  const local = await readLocalBlogViewCounts();
  const supabase = getSupabaseAdminOptional();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_post_views")
        .select("post_id, view_count");

      if (!error && data) {
        const remote = Object.fromEntries(
          data.map((row) => [
            row.post_id as string,
            Number(row.view_count) || 0,
          ])
        );
        return mergeViewCounts(local, remote);
      }
    } catch {
      /* fall through */
    }
  }

  return mergeViewCounts(local);
}

export async function getBlogViewCount(postId: string): Promise<number> {
  const counts = await getAllBlogViewCounts();
  return counts[postId] ?? 0;
}

export async function incrementBlogView(postId: string): Promise<number> {
  const supabase = getSupabaseAdminOptional();

  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("increment_blog_post_view", {
        p_post_id: postId,
      });

      if (!error && data !== null && data !== undefined) {
        return withViewSeedFloor(postId, Number(data));
      }

      const { data: row, error: upsertError } = await supabase
        .from("blog_post_views")
        .select("view_count")
        .eq("post_id", postId)
        .maybeSingle();

      if (!upsertError && row) {
        const next = Number(row.view_count) + 1;
        await supabase
          .from("blog_post_views")
          .update({
            view_count: next,
            updated_at: new Date().toISOString(),
          })
          .eq("post_id", postId);
        return next;
      }

      const { data: inserted } = await supabase
        .from("blog_post_views")
        .insert({ post_id: postId, view_count: 1 })
        .select("view_count")
        .single();

      if (inserted) {
        return withViewSeedFloor(postId, Number(inserted.view_count) || 1);
      }
    } catch {
      /* fall through */
    }
  }

  const localNext = await incrementLocalBlogView(postId);
  return withViewSeedFloor(postId, localNext);
}
