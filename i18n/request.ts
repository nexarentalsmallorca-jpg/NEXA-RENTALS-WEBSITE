// i18n/request.ts
import {getRequestConfig} from "next-intl/server";
import {locales, defaultLocale} from "./routing";

import en from "../app/messages/en.json";
import es from "../app/messages/es.json";
import de from "../app/messages/de.json";
import fr from "../app/messages/fr.json";
import it from "../app/messages/it.json";
import pt from "../app/messages/pt.json";
import sv from "../app/messages/sv.json";

const MESSAGES = {en, es, de, fr, it, pt, sv};

export default getRequestConfig(async (ctx) => {
  const locale = await ctx.requestLocale;

  const safeLocale =
    locale && locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: MESSAGES[safeLocale as keyof typeof MESSAGES] ?? MESSAGES[defaultLocale],
  };
});