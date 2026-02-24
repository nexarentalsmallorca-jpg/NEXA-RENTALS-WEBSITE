// next-intl.config.ts
export const locales = ["en", "es", "de", "fr", "sv", "it", "pt"] as const;

export const defaultLocale = "en" as const;

export type AppLocale = (typeof locales)[number];