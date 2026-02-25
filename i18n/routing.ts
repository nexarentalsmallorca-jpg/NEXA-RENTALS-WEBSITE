export const locales = ['en', 'es', 'de', 'fr', 'it', 'pt', 'sv'] as const;

export const defaultLocale = 'en';

export type Locale = (typeof locales)[number];