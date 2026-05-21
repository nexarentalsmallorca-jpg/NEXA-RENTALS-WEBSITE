"use client";

import { Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export const BLOG_VIEW_UPDATED_EVENT = "nexa-blog-view-updated";

type Props = {
  postId: string;
  initialCount?: number;
  className?: string;
  size?: "sm" | "md";
};

function formatCount(n: number) {
  return n.toLocaleString("en-GB");
}

export default function BlogViewCount({
  postId,
  initialCount = 0,
  className = "",
  size = "md",
}: Props) {
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/blog/views", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { counts?: Record<string, number> };
      if (typeof data.counts?.[postId] === "number") {
        setCount(data.counts[postId]);
      }
    } catch {
      /* ignore */
    }
  }, [postId]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount, postId]);

  useEffect(() => {
    refresh();

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ postId: string; viewCount: number }>)
        .detail;
      if (detail?.postId === postId) {
        setCount(detail.viewCount);
      }
    };

    window.addEventListener(BLOG_VIEW_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(BLOG_VIEW_UPDATED_EVENT, onUpdate);
  }, [postId, refresh]);

  const iconSize = size === "sm" ? 14 : 18;
  const textClass =
    size === "sm"
      ? "text-[11px] sm:text-xs"
      : "text-sm sm:text-[15px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-stone-500 ${textClass} ${className}`}
      title={`${formatCount(count)} views`}
    >
      <Eye
        size={iconSize}
        strokeWidth={1.75}
        className="shrink-0 text-stone-400"
        aria-hidden
      />
      <span className="font-medium tabular-nums text-stone-600">
        {formatCount(count)}
      </span>
      <span className="sr-only">views</span>
    </span>
  );
}
