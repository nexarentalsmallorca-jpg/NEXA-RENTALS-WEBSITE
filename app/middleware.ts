import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = "nexa123"; // change this

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // allow next internals + static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // allow coming soon page
  if (pathname.startsWith("/coming-soon")) {
    return NextResponse.next();
  }

  // allow you with secret
  if (nextUrl.searchParams.get("dev") === SECRET) {
    return NextResponse.next();
  }

  // redirect everyone else
  const url = nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
