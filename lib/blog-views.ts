import {
  incrementLocalBlogView,
  readLocalBlogViewCounts,
  type BlogViewCounts,
} from "./blog-views-store";
import { getSupabaseAdminOptional } from "./supabaseOptional";

export type { BlogViewCounts };

export async function getAllBlogViewCounts(): Promise<BlogViewCounts> {
  const supabase = getSupabaseAdminOptional();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("blog_post_views")
        .select("post_id, view_count");

      if (!error && data) {
        return Object.fromEntries(
          data.map((row) => [
            row.post_id as string,
            Number(row.view_count) || 0,
          ])
        );
      }
    } catch {
      /* fall through to local file */
    }
  }

  return readLocalBlogViewCounts();
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
        return Number(data);
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

      if (inserted) return Number(inserted.view_count) || 1;
    } catch {
      /* fall through */
    }
  }

  return incrementLocalBlogView(postId);
}
