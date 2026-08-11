// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isValidLocale } from "./routing";

import en from "../app/messages/en.json";
import es from "../app/messages/es.json";
import de from "../app/messages/de.json";
import fr from "../app/messages/fr.json";
import it from "../app/messages/it.json";
import pt from "../app/messages/pt.json";
import sv from "../app/messages/sv.json";

const MESSAGES = {
  en,
  es,
  de,
  fr,
  it,
  nl: en,
  pl: en,
  sv,
  da: en,
  no: en,
  pt,
  sr: en,
  uk: en,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;

  const locale = isValidLocale(requestedLocale)
    ? requestedLocale
    : defaultLocale;

  return {
    locale,
    messages: MESSAGES[locale],
  };
});