// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isValidLocale, type Locale } from "./routing";

import en from "../app/messages/en.json";
import es from "../app/messages/es.json";
import de from "../app/messages/de.json";
import fr from "../app/messages/fr.json";
import it from "../app/messages/it.json";
import pt from "../app/messages/pt.json";
import sv from "../app/messages/sv.json";

const MESSAGES: Record<Locale, typeof en> = {
  en,
  es,
  de,
  fr,
  it,
  pt,
  sv,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;

  const locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  return {
    locale,
    messages: MESSAGES[locale] ?? MESSAGES[defaultLocale],
  };
});