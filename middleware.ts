import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = true;

const locales = ["de", "en", "es", "fr", "it", "pt", "sv"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.json" ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);

  if (!MAINTENANCE_MODE) {
    return intlResponse;
  }

  // allow your local testing routes
  if (
    pathname.includes("/test-home") ||
    pathname.includes("/test") ||
    pathname.includes("/preview")
  ) {
    return intlResponse;
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = locales.includes(firstSegment as (typeof locales)[number]);
  const currentLocale = hasLocalePrefix ? firstSegment : defaultLocale;

  if (pathname === `/${currentLocale}/maintenance` || pathname === "/maintenance") {
    return intlResponse;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${currentLocale}/maintenance`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};