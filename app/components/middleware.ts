import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isEnabled = process.env.LOCK_SITE === "true";
  if (!isEnabled) return NextResponse.next();

  const url = req.nextUrl;

  // allow next assets + api + lock page
  const path = url.pathname;
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/images") ||
    path === "/coming-soon"
  ) {
    return NextResponse.next();
  }

  // if user already unlocked, allow
  const unlocked = req.cookies.get("nexa_unlocked")?.value === "1";
  if (unlocked) return NextResponse.next();

  // otherwise redirect to coming soon
  url.pathname = "/coming-soon";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!favicon.ico).*)"],
};
