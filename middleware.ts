import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = "mynexasecret2026";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // allow next internals + static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // allow coming-soon page
  if (pathname.startsWith("/coming-soon")) {
    return NextResponse.next();
  }

  // allow you with secret
  if (url.searchParams.get("dev") === SECRET) {
    return NextResponse.next();
  }

  // redirect everyone else
  const redirectUrl = url.clone();
  redirectUrl.pathname = "/coming-soon";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
