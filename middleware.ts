import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = "@@ss4448";
const COOKIE_NAME = "nexa_admin";

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

  // already unlocked (cookie)
  const hasCookie = req.cookies.get(COOKIE_NAME)?.value === "1";
  if (hasCookie) return NextResponse.next();

  // unlock link: set cookie once
  if (url.searchParams.get("dev") === SECRET) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  // allow coming soon page itself
  if (pathname.startsWith("/coming-soon")) {
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
