// middleware.ts
import createMiddleware from "next-intl/middleware";
import {locales, defaultLocale} from "./next-intl.config";

export default createMiddleware({
  locales: [...locales],
  defaultLocale
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"]
};