// i18n/request.ts
import {getRequestConfig} from "next-intl/server";
import {notFound} from "next/navigation";
import {locales} from "../next-intl.config";

export default getRequestConfig(async (ctx) => {
  const locale = await ctx.requestLocale;

  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {locale, messages};
});