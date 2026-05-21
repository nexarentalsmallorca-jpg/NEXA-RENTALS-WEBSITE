import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getMoneyBlogLinks } from "@/lib/blog-seo";
import type { Locale } from "@/i18n/routing";

type Variant = "default" | "dark" | "light";

type Props = {
  locale: Locale;
  variant?: Variant;
  className?: string;
};

const VARIANT_STYLES: Record<
  Variant,
  { section: string; title: string; link: string; border: string }
> = {
  default: {
    section: "border-stone-200/90 bg-white/80",
    title: "text-stone-950",
    link: "text-stone-700 hover:text-[#c45f00]",
    border: "border-stone-200",
  },
  dark: {
    section: "border-white/10 bg-white/[0.04]",
    title: "text-white",
    link: "text-white/75 hover:text-[#FF7A00]",
    border: "border-white/10",
  },
  light: {
    section: "border-stone-200 bg-[#f3f2ef]",
    title: "text-stone-950",
    link: "text-stone-700 hover:text-[#c45f00]",
    border: "border-stone-200",
  },
};

export default async function BlogRentalGuides({
  locale,
  variant = "default",
  className = "",
}: Props) {
  const t = await getTranslations({ locale, namespace: "blog" });
  const links = getMoneyBlogLinks(locale);
  const styles = VARIANT_STYLES[variant];

  if (links.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-8 ${styles.section} ${className}`}
      aria-labelledby="mallorca-rental-guides-heading"
    >
      <h2
        id="mallorca-rental-guides-heading"
        className={`font-[family-name:var(--font-playfair)] text-xl font-semibold tracking-tight sm:text-2xl ${styles.title}`}
      >
        {t("rentalGuidesTitle")}
      </h2>
      <p
        className={`mt-2 max-w-2xl text-sm leading-relaxed sm:text-[15px] ${
          variant === "dark" ? "text-white/65" : "text-stone-600"
        }`}
      >
        {t("rentalGuidesIntro")}
      </p>
      <ul
        className={`mt-5 grid gap-2 border-t pt-5 sm:grid-cols-2 ${styles.border}`}
      >
        {links.map((item) => (
          <li key={item.postId}>
            <Link
              href={`/${locale}/blog/${item.slug}`}
              className={`block rounded-lg px-1 py-1.5 text-sm font-medium transition ${styles.link}`}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link
          href={`/${locale}/blog`}
          className={`text-sm font-semibold underline-offset-4 hover:underline ${
            variant === "dark" ? "text-[#FF7A00]" : "text-[#c45f00]"
          }`}
        >
          {t("rentalGuidesViewAll")}
        </Link>
      </p>
    </section>
  );
}
