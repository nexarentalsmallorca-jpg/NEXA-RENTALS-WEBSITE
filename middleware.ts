
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
  All SEO campaign URLs.
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
  Legacy SEO redirects.
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

/*
  Convert a byte array into lowercase hexadecimal.
*/
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, "0")
    )
    .join("");
}

/*
  Verify the signed admin session.

  Token format:
  v1.expiration.nonce.signature

  The login API signs the payload using
  HMAC-SHA256 and NEXA_ADMIN_SESSION_SECRET.
*/
async function verifyAdminSession(
  request: NextRequest
): Promise<boolean> {
  const token = request.cookies.get(
    ADMIN_COOKIE_NAME
  )?.value;

  const secret =
    process.env.NEXA_ADMIN_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
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
    providedSignature,
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

  if (!/^[a-f0-9]{64}$/.test(providedSignature)) {
    return false;
  }

  const expiresAt = Number(expiresText);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
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
      ["sign"]
    );

    const payload =
      `${version}.${expiresText}.${nonce}`;

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    const expectedSignature = bytesToHex(
      new Uint8Array(signature)
    );

    /*
      Constant-time comparison is handled
      by verifying the HMAC using Web Crypto
      instead of comparing strings directly.
    */

    const signatureBytes = new Uint8Array(32);

    for (let i = 0; i < 32; i++) {
      signatureBytes[i] = parseInt(
        providedSignature.slice(
          i * 2,
          i * 2 + 2
        ),
        16
      );
    }

    return crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload)
    );
  } catch (error) {
    console.error(
      "NEXA admin session verification error:",
      error
    );

    return false;
  }
}

export default async function middleware(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  /*
    Skip APIs, assets and internal Next.js
    requests.

    Private fleet APIs perform their own
    server-side session verification.
  */
  if (isPublicAssetPath(pathname)) {
    return NextResponse.next();
  }

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
    SEO campaign language redirects.
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
    Legacy SEO redirects.
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
    Vehicle showroom redirects.
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
    Admin routes stay outside next-intl.

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
    Login page is publicly accessible.
  */
  if (isAdminLoginRoute) {
    return NextResponse.next();
  }

  /*
    Protect private admin pages using
    the signed session.
  */
  if (isAdminRoute) {
    const authenticated =
      await verifyAdminSession(request);

    if (!authenticated) {
      const loginUrl =
        request.nextUrl.clone();

      loginUrl.pathname =
        "/admin-nexa-secret/login";

      loginUrl.searchParams.set(
        "next",
        cleanPathWithoutLocale
      );

      return NextResponse.redirect(
        loginUrl
      );
    }

    return NextResponse.next();
  }

  /*
    All other pages use next-intl.
  */
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
  ],
};
