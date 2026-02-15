import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = "nexa123"; // change this

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Always allow Next internal files + static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // Allow coming soon page
  if (pathname.startsWith("/coming-soon")) {
    return NextResponse.next();
  }

  // Allow you with secret
  if (nextUrl.searchParams.get("dev") === SECRET) {
    return NextResponse.next();
  }

  // Redirect everyone else
  const url = nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = ""; // optional: remove query params
  return NextResponse.redirect(url);
}

// Run on all routes except static/internal
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
