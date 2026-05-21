import type { Locale } from "@/i18n/routing";
import type { BlogPost, BlogTranslation } from "@/lib/blogs";
import {
  applyBlogLinkLocalization,
  buildAnySlugToLocaleBlogSlugMap,
  buildEnglishToLocaleBlogSlugMap,
  finalizeBlogTranslation,
  isStubBlogContent,
  localizeBlogMarkdownLinks,
  type BlogLocaleContent,
} from "./helpers";
import { generatedBlogTranslations } from "./generated";
import { blogTranslations } from "./translations";

const READ_MINUTES: Record<string, number> = {
  "scooter-rental-price-magaluf": 14,
  "license-125cc-scooter-spain": 15,
  "ebike-rental-price-magaluf": 14,
  "best-place-rent-scooter-magaluf": 14,
  "what-you-need-rent-scooter-mallorca": 15,
  "ebike-vs-taxi-magaluf": 14,
  "magaluf-to-palma-ebike": 13,
  "rent-scooter-mallorca-car-licence": 15,
  "scooter-rental-mallorca-deposit": 14,
  "scooter-rental-magaluf-near-beach": 14,
  "best-scooter-routes-magaluf": 15,
  "best-places-visit-scooter-magaluf": 15,
  "magaluf-to-palma-scooter": 14,
  "scooter-vs-taxi-magaluf": 14,
  "scooter-vs-car-rental-mallorca": 15,
  "is-renting-scooter-mallorca-worth-it": 15,
  "tourists-rent-125cc-mallorca": 15,
  "scooter-rental-palmanova": 14,
  "magaluf-vs-palmanova-rental": 14,
  "helmets-included-mallorca": 13,
  "what-included-scooter-magaluf": 14,
  "half-day-scooter-magaluf": 14,
  "rent-scooter-online-magaluf": 14,
  "ebike-vs-scooter-magaluf": 15,
  "best-ebike-routes-magaluf": 15,
};

const DEFAULT_READ = 7;

function expandStubFromEnglish(
  en: BlogTranslation,
  pack: BlogLocaleContent,
  locale: Locale,
  enSlugToLocaleSlug: Map<string, string>
): BlogLocaleContent {
  const link = (text: string) =>
    localizeBlogMarkdownLinks(text, locale, enSlugToLocaleSlug);

  return {
    slug: pack.slug,
    title: pack.title,
    metaTitle: pack.metaTitle,
    metaDescription: pack.metaDescription,
    excerpt: pack.excerpt,
    imageAlt: pack.imageAlt,
    quickAnswer: pack.quickAnswer,
    sections: en.sections.map((section, index) => ({
      heading: pack.sections[index]?.heading ?? section.heading,
      paragraphs: section.paragraphs.map((p) => link(p)),
    })),
    faqs: en.faqs.map((faq) => ({
      question: faq.question,
      answer: link(faq.answer),
    })),
    ctaTitle: pack.ctaTitle || en.ctaTitle,
    ctaText: pack.ctaText || en.ctaText,
  };
}

export function applyBlogTranslations(posts: BlogPost[]): BlogPost[] {
  const locales = Object.keys(blogTranslations) as Locale[];

  return posts.map((post) => {
    const en = post.translations.en;
    const minutes = READ_MINUTES[post.id] ?? DEFAULT_READ;

    const merged: BlogPost["translations"] = { en };

    for (const locale of locales) {
      if (locale === "en") continue;

      const manualPack = blogTranslations[locale]?.[post.id];
      const generatedPack = generatedBlogTranslations[locale]?.[post.id];
      const pack = generatedPack ?? manualPack;
      if (!pack) continue;

      const enSlugMap = buildEnglishToLocaleBlogSlugMap(posts, locale);
      const anySlugMap = buildAnySlugToLocaleBlogSlugMap(locale);
      const slugMap = new Map([...enSlugMap, ...anySlugMap]);
      let content = pack;

      if (!generatedPack && manualPack && isStubBlogContent(manualPack)) {
        content = expandStubFromEnglish(en, manualPack, locale, slugMap);
      }

      content = applyBlogLinkLocalization(content, locale, slugMap);

      merged[locale] = finalizeBlogTranslation(
        content,
        locale,
        en.category,
        en.publishedAt,
        minutes
      );
    }

    return { ...post, translations: merged };
  });
}
