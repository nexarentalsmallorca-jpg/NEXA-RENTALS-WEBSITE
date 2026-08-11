export const locales = [
  "en",
  "es",
  "de",
  "fr",
  "it",
  "nl",
  "pl",
  "sv",
  "da",
  "no",
  "pt",
  "sr",
  "uk",
] as const;

export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export function isValidLocale(
  locale: string | undefined | null,
): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}