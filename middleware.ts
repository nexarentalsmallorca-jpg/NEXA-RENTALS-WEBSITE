import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "./i18n/routing";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});

const ADMIN_COOKIE_NAME = "nexa_admin_session";

/*
  SEO pages that should redirect to the main homepage.

  Example:
  /en/scooter-rental-magaluf  -> /en
  /es/scooter-rental-mallorca -> /es
  /fr/cheap-scooter-rental-magaluf -> /fr

  Non-locale versions:
  /scooter-rental-magaluf -> /en
*/
const SEO_REDIRECT_PATHS = new Set([
  "/best-scooter-rental-magaluf",
  "/best-scooter-rental-mallorca",
  "/cheap-scooter-rental-magaluf",
  "/cheap-scooter-rental-mallorca",
  "/ebike-rental-mallorca",
  "/ebike-rental-mallorca-cheap",
  "/rent-scooter-mallorca-125cc",
  "/scooter-rental-magaluf",
  "/scooter-rental-mallorca",
]);

function hasLocale(pathSegment: string | undefined): pathSegment is Locale {
  return Boolean(pathSegment && locales.includes(pathSegment as Locale));
}

function isPublicAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.json" ||
    pathname === "/site.webmanifest" ||
    pathname.match(/\.(.*)$/)
  );
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, APIs, images, icons and internal Next.js routes
  if (isPublicAssetPath(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = hasLocale(firstSegment);

  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  const cleanPathWithoutLocale = normalizePath(pathWithoutLocale);

  const isAdminRoute =
    cleanPathWithoutLocale === "/admin-nexa-secret" ||
    cleanPathWithoutLocale.startsWith("/admin-nexa-secret/");

  const isAdminLoginRoute =
    cleanPathWithoutLocale === "/admin-nexa-secret/login";

  /*
    Redirect old SEO landing pages to the main localized homepage.

    Examples:
    /en/scooter-rental-magaluf -> /en
    /es/cheap-scooter-rental-mallorca -> /es
    /scooter-rental-mallorca -> /en
  */
  if (SEO_REDIRECT_PATHS.has(cleanPathWithoutLocale)) {
    const redirectUrl = request.nextUrl.clone();
    const localeToUse = hasLocalePrefix ? firstSegment : defaultLocale;

    redirectUrl.pathname = `/${localeToUse}`;
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl, 308);
  }

  /*
    Vehicles route should open the local Home showroom page.

    Examples:
    /en/vehicles -> /en/Home
    /vehicles    -> /en/Home
  */
  if (cleanPathWithoutLocale === "/vehicles") {
    const redirectUrl = request.nextUrl.clone();
    const localeToUse = hasLocalePrefix ? firstSegment : defaultLocale;

    redirectUrl.pathname = `/${localeToUse}/Home`;
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl, 308);
  }

  /*
    Admin must stay outside language routes.

    Example:
    /en/admin-nexa-secret
    becomes:
    /admin-nexa-secret
  */
  if (hasLocalePrefix && isAdminRoute) {
    const cleanAdminUrl = request.nextUrl.clone();
    cleanAdminUrl.pathname = cleanPathWithoutLocale;
    return NextResponse.redirect(cleanAdminUrl);
  }

  /*
    Allow login page without authentication.
    This page must be reachable so you can log in.
  */
  if (isAdminLoginRoute) {
    return NextResponse.next();
  }

  /*
    Protect every private admin page.
    Nobody can open the dashboard, bookings, contracts,
    vehicles, sales, customers, calendar or settings
    without the private admin cookie.
  */
  if (isAdminRoute) {
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    if (adminToken !== "active") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin-nexa-secret/login";
      loginUrl.searchParams.set("next", cleanPathWithoutLocale);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Everything else uses your normal language system
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};