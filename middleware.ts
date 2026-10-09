
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  defaultLocale,
  locales,
  type Locale,
} from "./i18n/routing";

import {
  SEO_LANGUAGES,
  seoRouteGroups,
  type SeoLanguage,
} from "./lib/seoRoutes";

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

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
  SEO CAMPAIGN ROUTES

  Preserve all existing campaign URLs
  and their intended languages.
*/

const SEO_ROUTE_TARGETS = new Map<
  string,
  SeoRouteTarget
>();

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
  LEGACY SEO REDIRECTS

  /scooter-rental-mallorca remains active
  and must not be redirected.
*/

const SEO_REDIRECT_PATHS = new Set([
  "/best-scooter-rental-magaluf",
  "/best-scooter-rental-mallorca",
  "/cheap-scooter-rental-magaluf",
  "/cheap-scooter-rental-mallorca",
  "/ebike-rental-mallorca",
  "/ebike-rental-mallorca-cheap",
  "/rent-scooter-mallorca-125cc",
]);

function hasLocale(
  pathSegment: string | undefined
): pathSegment is Locale {
  return Boolean(
    pathSegment &&
      locales.includes(pathSegment as Locale)
  );
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "");
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

/*
  ADMIN SESSION VERIFICATION

  Compatible with the signed session created
  by app/api/admin/login/route.ts.

  Token:
    v1.expiration.nonce.signature

  Signature:
    HMAC-SHA256(
      NEXA_ADMIN_SESSION_SECRET,
      "v1.expiration.nonce"
    )

  Uses Web Crypto, not Node.js crypto.
*/

async function verifyAdminSession(
  request: NextRequest
): Promise<boolean> {
  const token = request.cookies.get(
    ADMIN_COOKIE_NAME
  )?.value;

  const secret =
    process.env.NEXA_ADMIN_SESSION_SECRET;

  if (
    !token ||
    !secret ||
    secret.length < 32
  ) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const [
    version,
    expiresText,
    nonce,
    signatureHex,
  ] = parts;

  if (version !== "v1") {
    return false;
  }

  if (!/^\d+$/.test(expiresText)) {
    return false;
  }

  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/.test(signatureHex)) {
    return false;
  }

  const expiresAt = Number(expiresText);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now
  ) {
    return false;
  }

  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const signatureBytes = new Uint8Array(32);

    for (let index = 0; index < 32; index++) {
      signatureBytes[index] = Number.parseInt(
        signatureHex.slice(
          index * 2,
          index * 2 + 2
        ),
        16
      );
    }

    const payload =
      `${version}.${expiresText}.${nonce}`;

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload)
    );
  } catch (error) {
    console.error(
      "NEXA admin session verification failed:",
      error
    );

    return false;
  }
}

function redirectToAdminLogin(
  request: NextRequest,
  requestedPath: string
) {
  const loginUrl = request.nextUrl.clone();

  loginUrl.pathname =
    "/admin-nexa-secret/login";

  loginUrl.search = "";

  loginUrl.searchParams.set(
    "next",
    requestedPath
  );

  return NextResponse.redirect(loginUrl);
}

/*
  MAIN ROUTING MIDDLEWARE

  Public website:
    next-intl

  SEO campaign routes:
    language-specific redirects

  Private admin:
    signed-session verification

  Public QR pages:
    normal next-intl routing
*/

export default async function middleware(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  /*
    1. Ignore API endpoints and static assets.

    Private APIs verify admin sessions
    independently.
  */

  if (isPublicAssetPath(pathname)) {
    return NextResponse.next();
  }

  /*
    2. Detect locale prefixes.
  */

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const firstSegment = segments[0];

  const hasLocalePrefix = hasLocale(
    firstSegment
  );

  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  const cleanPathWithoutLocale = normalizePath(
    pathWithoutLocale
  );

  /*
    3. Identify private admin routes.
  */

  const isAdminRoute =
    cleanPathWithoutLocale ===
      "/admin-nexa-secret" ||
    cleanPathWithoutLocale.startsWith(
      "/admin-nexa-secret/"
    );

  const isAdminLoginRoute =
    cleanPathWithoutLocale ===
    "/admin-nexa-secret/login";

  /*
    4. SEO campaign language redirects.

    Preserve all existing campaign routes.
  */

  const seoRouteTarget = SEO_ROUTE_TARGETS.get(
    cleanPathWithoutLocale
  );

  if (
    seoRouteTarget &&
    (
      !hasLocalePrefix ||
      firstSegment !== seoRouteTarget.language
    )
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    redirectUrl.pathname =
      `/${seoRouteTarget.language}${seoRouteTarget.path}`;

    return NextResponse.redirect(
      redirectUrl,
      308
    );
  }

  /*
    5. Legacy SEO redirects.
  */

  if (
    SEO_REDIRECT_PATHS.has(
      cleanPathWithoutLocale
    )
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    const localeToUse = hasLocalePrefix
      ? firstSegment
      : defaultLocale;

    redirectUrl.pathname =
      `/${localeToUse}`;

    redirectUrl.search = "";

    return NextResponse.redirect(
      redirectUrl,
      308
    );
  }

  /*
    6. Vehicle showroom redirects.

    /vehicles -> /en/Home
    /en/vehicles -> /en/Home
  */

  if (
    cleanPathWithoutLocale === "/vehicles"
  ) {
    const redirectUrl =
      request.nextUrl.clone();

    const localeToUse = hasLocalePrefix
      ? firstSegment
      : defaultLocale;

    redirectUrl.pathname =
      `/${localeToUse}/Home`;

    redirectUrl.search = "";

    return NextResponse.redirect(
      redirectUrl,
      308
    );
  }

  /*
    7. Admin routes stay outside next-intl.

    /en/admin-nexa-secret
      -> /admin-nexa-secret
  */

  if (
    hasLocalePrefix &&
    isAdminRoute
  ) {
    const cleanAdminUrl =
      request.nextUrl.clone();

    cleanAdminUrl.pathname =
      cleanPathWithoutLocale;

    return NextResponse.redirect(
      cleanAdminUrl
    );
  }

  /*
    8. Allow access to the admin login page.
  */

  if (isAdminLoginRoute) {
    return NextResponse.next();
  }

  /*
    9. Protect all private admin pages.

    Invalid, missing or expired sessions
    redirect to the login page.
  */

  if (isAdminRoute) {
    const authenticated =
      await verifyAdminSession(request);

    if (!authenticated) {
      return redirectToAdminLogin(
        request,
        cleanPathWithoutLocale
      );
    }

    return NextResponse.next();
  }

  /*
    10. All other pages use normal
    next-intl routing.
  */

  return intlMiddleware(request);
}
