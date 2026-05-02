import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = process.env.NODE_ENV === "production";

const locales = ["de", "en", "es", "fr", "it", "pt", "sv"] as const;
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
});

const ADMIN_COOKIE_NAME = "nexa_admin_auth";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and internal routes
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

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = locales.includes(firstSegment as (typeof locales)[number]);
  const currentLocale = hasLocalePrefix ? firstSegment : defaultLocale;

  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  const isAdminRoute =
    pathWithoutLocale === "/admin-nexa-secret" ||
    pathWithoutLocale.startsWith("/admin-nexa-secret/");

  const isAdminLoginRoute =
    pathWithoutLocale === "/admin-nexa-secret/login";

  // Protect private admin dashboard with cookie auth
  if (isAdminRoute && !isAdminLoginRoute) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (adminToken !== "ok") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = hasLocalePrefix
        ? `/${currentLocale}/admin-nexa-secret/login`
        : "/admin-nexa-secret/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const intlResponse = intlMiddleware(request);

  // Disable maintenance mode outside production
  if (!MAINTENANCE_MODE) {
    return intlResponse;
  }

  // Allow local testing routes
  if (
    pathname.includes("/test-home") ||
    pathname.includes("/test") ||
    pathname.includes("/preview")
  ) {
    return intlResponse;
  }

  // Allow admin dashboard and admin login even during maintenance mode
  if (isAdminRoute) {
    return intlResponse;
  }

  // Allow maintenance page itself
  if (
    pathname === `/${currentLocale}/maintenance` ||
    pathname === "/maintenance"
  ) {
    return intlResponse;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${currentLocale}/maintenance`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};