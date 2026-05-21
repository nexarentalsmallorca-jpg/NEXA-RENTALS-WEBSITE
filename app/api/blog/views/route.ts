import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { getAllBlogViewCounts, incrementBlogView } from "@/lib/blog-views";
import { allBlogPosts } from "@/lib/blogs";

const VALID_IDS = new Set(allBlogPosts.map((p) => p.id));

export async function GET() {
  const counts = await getAllBlogViewCounts();
  return NextResponse.json({ counts });
}

export async function POST(request: Request) {
  let body: { postId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const postId = body.postId?.trim();
  if (!postId || !VALID_IDS.has(postId)) {
    return NextResponse.json({ error: "Unknown post" }, { status: 400 });
  }

  const viewCount = await incrementBlogView(postId);
  return NextResponse.json({ postId, viewCount });
}
