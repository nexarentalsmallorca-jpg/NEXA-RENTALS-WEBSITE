"use client";

import { useEffect } from "react";
import { BLOG_VIEW_UPDATED_EVENT } from "@/app/components/blog/BlogViewCount";

type Props = {
  postId: string;
};

const sessionKey = (id: string) => `nexa-blog-viewed-${id}`;

export default function BlogViewTracker({ postId }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(sessionKey(postId))) return;

    const run = async () => {
      try {
        const res = await fetch("/api/blog/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
        if (!res.ok) return;

        const data = (await res.json()) as {
          postId: string;
          viewCount: number;
        };
        sessionStorage.setItem(sessionKey(postId), "1");
        window.dispatchEvent(
          new CustomEvent(BLOG_VIEW_UPDATED_EVENT, {
            detail: { postId: data.postId, viewCount: data.viewCount },
          })
        );
      } catch {
        /* ignore */
      }
    };

    run();
  }, [postId]);

  return null;
}
