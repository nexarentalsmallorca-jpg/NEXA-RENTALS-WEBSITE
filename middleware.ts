// middleware.ts
import createMiddleware from "next-intl/middleware";

// ✅ Keep this list in sync with /messages/*.json
const locales = ["de", "en", "es", "fr", "it", "pt", "sv"] as const;
const defaultLocale = "en";

export default createMiddleware({
  locales: [...locales],
  defaultLocale
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};