import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ✅ Turn this on/off whenever you want
const MAINTENANCE_MODE = true;

// ✅ Keep this list in sync with /messages/*.json
const locales = ["de", "en", "es", "fr", "it", "pt", "sv"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals, static files, API, sitemap, robots, etc.
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

  // Run your normal locale middleware first
  const intlResponse = intlMiddleware(request);

  // If maintenance mode is off, continue normal site behavior
  if (!MAINTENANCE_MODE) {
    return intlResponse;
  }

  // Detect locale from path
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = locales.includes(firstSegment as (typeof locales)[number]);
  const currentLocale = hasLocalePrefix ? firstSegment : defaultLocale;

  // Allow the maintenance page itself
  if (pathname === `/${currentLocale}/maintenance` || pathname === "/maintenance") {
    return intlResponse;
  }

  // Rewrite all pages to the localized maintenance page
  const url = request.nextUrl.clone();
  url.pathname = `/${currentLocale}/maintenance`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};