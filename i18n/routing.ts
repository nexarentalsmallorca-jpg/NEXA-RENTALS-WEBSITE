export const locales = ["en", "es", "de", "fr", "it", "pt", "sv"] as const;

export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string | undefined | null): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}