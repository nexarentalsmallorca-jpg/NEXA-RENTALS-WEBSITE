import type { Locale } from "@/i18n/routing";
import type {
  BlogCategory,
  BlogTranslation,
} from "@/lib/blogs";
import {
  blogSlugByAnySlug,
  type BlogSlugEntry,
} from "@/lib/blog-slug-index";

export type BlogLocaleContent = Omit<
  BlogTranslation,
  "category" | "readTime" | "publishedAt" | "updatedAt" | "heroImage"
>;

const READ_TIME: Record<Locale, string> = {
  en: "min read",
  es: "min de lectura",
  de: "Min. Lesezeit",
  fr: "min de lecture",
  it: "min di lettura",
  nl: "min leestijd",
  pl: "min czytania",
  sv: "min läsning",
  da: "min. læsetid",
  no: "min lesetid",
  pt: "min de leitura",
  sr: "min čitanja",
  uk: "хв читання",
};

const BOOK_LINK_TEXT: Record<Locale, string> = {
  en: "book your scooter online",
  es: "reserva tu scooter online",
  de: "buche deinen Roller online",
  fr: "réservez votre scooter en ligne",
  it: "prenota il tuo scooter online",
  nl: "boek je scooter online",
  pl: "zarezerwuj skuter online",
  sv: "boka din scooter online",
  da: "book din scooter online",
  no: "bestill scooteren din på nett",
  pt: "reserve o seu scooter online",
  sr: "rezervišite skuter onlajn",
  uk: "забронюйте скутер онлайн",
};

const CONTACT_LINK_TEXT: Record<Locale, string> = {
  en: "contact NEXA Rentals",
  es: "contacta con NEXA Rentals",
  de: "kontaktiere NEXA Rentals",
  fr: "contactez NEXA Rentals",
  it: "contatta NEXA Rentals",
  nl: "neem contact op met NEXA Rentals",
  pl: "skontaktuj się z NEXA Rentals",
  sv: "kontakta NEXA Rentals",
  da: "kontakt NEXA Rentals",
  no: "kontakt NEXA Rentals",
  pt: "contacte a NEXA Rentals",
  sr: "kontaktirajte NEXA Rentals",
  uk: "зв’яжіться з NEXA Rentals",
};

export function blogReadTime(minutes: number, locale: Locale) {
  return `${minutes} ${READ_TIME[locale]}`;
}

export function blogBookLink(locale: Locale, label?: string) {
  const text = label ?? BOOK_LINK_TEXT[locale];

  return `[${text}](https://www.nexarentals.es/${locale})`;
}

export function blogContactLink(locale: Locale, label?: string) {
  const text = label ?? CONTACT_LINK_TEXT[locale];

  return `[${text}](https://www.nexarentals.es/${locale}/contact)`;
}

export function localizeMarkdownLinks(text: string, locale: Locale) {
  return text.replace(
    /\/en\/(vehicles|contact)/g,
    `/${locale}/$1`,
  );
}

/** Map English blog slugs to the slug used in the target locale. */
export function buildEnglishToLocaleBlogSlugMap(
  posts: {
    translations: Partial<
      Record<Locale, { slug: string }>
    > & {
      en: { slug: string };
    };
  }[],
  locale: Locale,
): Map<string, string> {
  const map = new Map<string, string>();

  for (const post of posts) {
    const enSlug = post.translations.en.slug;
    const locSlug = post.translations[locale]?.slug;

    if (locSlug) {
      map.set(enSlug, locSlug);
    }
  }

  return map;
}

/** Map any known slug (any locale) to the slug used in `locale`. */
export function buildAnySlugToLocaleBlogSlugMap(
  locale: Locale,
): Map<string, string> {
  const map = new Map<string, string>();

  for (
    const entry of Object.values(
      blogSlugByAnySlug,
    ) as BlogSlugEntry[]
  ) {
    const target = entry[locale];

    if (!target) {
      continue;
    }

    for (const value of Object.values(entry)) {
      if (
        typeof value === "string" &&
        value !== entry.id
      ) {
        map.set(value, target);
      }
    }
  }

  return map;
}

export function localizeBlogMarkdownLinks(
  text: string,
  locale: Locale,
  slugToLocaleSlug: Map<string, string>,
) {
  let result = localizeMarkdownLinks(text, locale);

  const replaceSlug = (slug: string) =>
    slugToLocaleSlug.get(slug) ?? slug;

  result = result.replace(
    /https:\/\/www\.nexarentals\.es\/(?:en|[a-z]{2})\/blog\/([a-z0-9-]+)/gi,
    (_match, slug: string) =>
      `https://www.nexarentals.es/${locale}/blog/${replaceSlug(
        slug,
      )}`,
  );

  result = result.replace(
    /https:\/\/www\.nexarentals\.es\/blog\/([a-z0-9-]+)/gi,
    (_match, slug: string) =>
      `https://www.nexarentals.es/${locale}/blog/${replaceSlug(
        slug,
      )}`,
  );

  result = result.replace(
    /\/en\/blog\/([a-z0-9-]+)/gi,
    (_match, slug: string) =>
      `/${locale}/blog/${replaceSlug(slug)}`,
  );

  result = result.replace(
    new RegExp(
      `/${locale}/blog/([a-z0-9-]+)`,
      "gi",
    ),
    (_match, slug: string) =>
      `/${locale}/blog/${replaceSlug(slug)}`,
  );

  return result;
}

/** Factory packs use two short generic paragraphs per section. */
export function isStubBlogContent(
  content: BlogLocaleContent,
): boolean {
  if (content.sections.length === 0) {
    return true;
  }

  return content.sections.every(
    (section) => section.paragraphs.length === 2,
  );
}

/** Generated locale pack that still matches English body copy. */
export function isEnglishBlogLocalePack(
  pack: BlogLocaleContent,
  en: BlogTranslation,
): boolean {
  let total = 0;
  let same = 0;

  const compare = (a?: string, b?: string) => {
    if (!a?.trim() || !b?.trim()) {
      return;
    }

    total += 1;

    if (a.trim() === b.trim()) {
      same += 1;
    }
  };

  compare(pack.quickAnswer, en.quickAnswer);
  compare(pack.excerpt, en.excerpt);
  compare(
    pack.metaDescription,
    en.metaDescription,
  );

  for (
    let i = 0;
    i < pack.sections.length;
    i++
  ) {
    compare(
      pack.sections[i]?.heading,
      en.sections[i]?.heading,
    );

    const paragraphs =
      pack.sections[i]?.paragraphs ?? [];

    for (
      let j = 0;
      j < paragraphs.length;
      j++
    ) {
      compare(
        paragraphs[j],
        en.sections[i]?.paragraphs[j],
      );
    }
  }

  for (let i = 0; i < pack.faqs.length; i++) {
    compare(
      pack.faqs[i]?.question,
      en.faqs[i]?.question,
    );

    compare(
      pack.faqs[i]?.answer,
      en.faqs[i]?.answer,
    );
  }

  if (total === 0) {
    return true;
  }

  return same / total >= 0.3;
}

export function applyBlogLinkLocalization(
  content: BlogLocaleContent,
  locale: Locale,
  slugToLocaleSlug: Map<string, string>,
): BlogLocaleContent {
  const link = (text: string) =>
    localizeBlogMarkdownLinks(
      text,
      locale,
      slugToLocaleSlug,
    );

  return {
    ...content,
    quickAnswer: link(content.quickAnswer),
    excerpt: link(content.excerpt),
    ctaText: link(content.ctaText),
    sections: content.sections.map(
      (section) => ({
        heading: section.heading,
        paragraphs:
          section.paragraphs.map(link),
      }),
    ),
    faqs: content.faqs.map((faq) => ({
      question: faq.question,
      answer: link(faq.answer),
    })),
  };
}

export function finalizeBlogTranslation(
  content: BlogLocaleContent,
  locale: Locale,
  category: BlogCategory,
  publishedAt: string,
  readMinutes: number,
): BlogTranslation {
  return {
    ...content,
    heroImage: "",
    category,
    publishedAt,
    updatedAt: publishedAt,
    readTime: blogReadTime(
      readMinutes,
      locale,
    ),
    metaTitle:
      content.metaTitle ??
      `${content.title} | NEXA Rentals Mallorca`,
    quickAnswer: localizeMarkdownLinks(
      content.quickAnswer,
      locale,
    ),
    excerpt: localizeMarkdownLinks(
      content.excerpt,
      locale,
    ),
    ctaText: localizeMarkdownLinks(
      content.ctaText,
      locale,
    ),
    sections: content.sections.map(
      (section) => ({
        heading: section.heading,
        paragraphs:
          section.paragraphs.map(
            (paragraph) =>
              localizeMarkdownLinks(
                paragraph,
                locale,
              ),
          ),
      }),
    ),
    faqs: content.faqs.map((faq) => ({
      question: faq.question,
      answer: localizeMarkdownLinks(
        faq.answer,
        locale,
      ),
    })),
  };
}

export function mergeBlogLocales(
  en: BlogTranslation,
  locale: Locale,
  category: BlogCategory,
  publishedAt: string,
  readMinutes: number,
  pack?: BlogLocaleContent,
): BlogTranslation {
  if (!pack) {
    return en;
  }

  return finalizeBlogTranslation(
    pack,
    locale,
    category,
    publishedAt,
    readMinutes,
  );
}

export type BlogLocalePack = Record<
  string,
  BlogLocaleContent
>;