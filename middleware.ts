import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
  const hasLocalePrefix = locales.includes(
    firstSegment as (typeof locales)[number]
  );
  const currentLocale = hasLocalePrefix ? firstSegment : defaultLocale;

  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  const isAdminRoute =
    pathWithoutLocale === "/admin-nexa-secret" ||
    pathWithoutLocale.startsWith("/admin-nexa-secret/");

  const isAdminLoginRoute = pathWithoutLocale === "/admin-nexa-secret/login";

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

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};