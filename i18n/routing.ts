export const locales = ["de", "en", "es", "fr", "it", "pt", "sv"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];