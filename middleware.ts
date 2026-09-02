import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales, type Locale } from "./i18n/routing";
import {
  SEO_LANGUAGES,
  seoRouteGroups,
  type SeoLanguage,
} from "./lib/seoRoutes";

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
});

const ADMIN_COOKIE_NAME = "nexa_admin_session";

type SeoRouteTarget = {
  language: SeoLanguage;
  path: string;
};

/*
  Creates one lookup covering all 110 campaign URLs.

  Examples:
  /scooter-rental-magaluf -> English
  /roller-mieten-magaluf -> German
  /location-scooter-magaluf -> French
*/
const SEO_ROUTE_TARGETS = new Map<string, SeoRouteTarget>();

for (const group of seoRouteGroups) {
  for (const language of SEO_LANGUAGES) {
    const path = group.routes[language];

    SEO_ROUTE_TARGETS.set(path, {
      language,
      path,
    });
  }
}

/*
  Legacy SEO pages that should redirect to the localized homepage.
  These are not part of the 22-page multilingual campaign.
*/
const SEO_REDIRECT_PATHS = new Set([
  "/best-scooter-rental-magaluf",
  "/best-scooter-rental-mallorca",
  "/cheap-scooter-rental-magaluf",
  "/cheap-scooter-rental-mallorca",
  "/ebike-rental-mallorca",
  "/ebike-rental-mallorca-cheap",
  "/rent-scooter-mallorca-125cc",
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
    Boolean(pathname.match(/\.(.*)$/))
  );
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip assets, APIs and internal Next.js requests.
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
    Force every campaign slug onto its intended language.

    Examples:
    /roller-mieten-magaluf
      -> /de/roller-mieten-magaluf

    /en/roller-mieten-magaluf
      -> /de/roller-mieten-magaluf

    /de/scooter-rental-magaluf
      -> /en/scooter-rental-magaluf
  */
  const seoRouteTarget = SEO_ROUTE_TARGETS.get(cleanPathWithoutLocale);

  if (
    seoRouteTarget &&
    (!hasLocalePrefix || firstSegment !== seoRouteTarget.language)
  ) {
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname =
      `/${seoRouteTarget.language}${seoRouteTarget.path}`;

    return NextResponse.redirect(redirectUrl, 308);
  }

  // Redirect legacy SEO pages to the localized homepage.
  if (SEO_REDIRECT_PATHS.has(cleanPathWithoutLocale)) {
    const redirectUrl = request.nextUrl.clone();
    const localeToUse = hasLocalePrefix ? firstSegment : defaultLocale;

    redirectUrl.pathname = `/${localeToUse}`;
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl, 308);
  }

  /*
    Vehicles route should open the localized Home showroom.

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
    Admin stays outside the language routes.

    /en/admin-nexa-secret -> /admin-nexa-secret
  */
  if (hasLocalePrefix && isAdminRoute) {
    const cleanAdminUrl = request.nextUrl.clone();

    cleanAdminUrl.pathname = cleanPathWithoutLocale;

    return NextResponse.redirect(cleanAdminUrl);
  }

  // The admin login page must remain publicly reachable.
  if (isAdminLoginRoute) {
    return NextResponse.next();
  }

  // Protect all private admin pages.
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

  // Everything else uses the normal NextIntl language system.
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};