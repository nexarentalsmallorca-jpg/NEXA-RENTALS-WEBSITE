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
  {
    section: string;
    title: string;
    text: string;
    link: string;
    border: string;
    hubBox: string;
    hubButton: string;
  }
> = {
  default: {
    section: "border-stone-200/90 bg-white/80",
    title: "text-stone-950",
    text: "text-stone-600",
    link: "text-stone-700 hover:text-[#c45f00]",
    border: "border-stone-200",
    hubBox: "border-orange-200 bg-orange-50/70",
    hubButton: "bg-orange-500 text-white hover:brightness-105",
  },
  dark: {
    section: "border-white/10 bg-white/[0.04]",
    title: "text-white",
    text: "text-white/65",
    link: "text-white/75 hover:text-[#FF7A00]",
    border: "border-white/10",
    hubBox: "border-white/10 bg-white/[0.05]",
    hubButton: "bg-[#FF7A00] text-white hover:brightness-105",
  },
  light: {
    section: "border-stone-200 bg-[#f3f2ef]",
    title: "text-stone-950",
    text: "text-stone-600",
    link: "text-stone-700 hover:text-[#c45f00]",
    border: "border-stone-200",
    hubBox: "border-orange-200 bg-white",
    hubButton: "bg-orange-500 text-white hover:brightness-105",
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
  const guidesHref = `/${locale}/blog/scooter-rental-guides`;

  if (links.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-8 ${styles.section} ${className}`}
      aria-labelledby="mallorca-rental-guides-heading"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h2
            id="mallorca-rental-guides-heading"
            className={`font-[family-name:var(--font-playfair)] text-xl font-semibold tracking-tight sm:text-2xl ${styles.title}`}
          >
            {t("rentalGuidesTitle")}
          </h2>

          <p className={`mt-2 max-w-2xl text-sm leading-relaxed sm:text-[15px] ${styles.text}`}>
            {t("rentalGuidesIntro")}
          </p>
        </div>

        <Link
          href={guidesHref}
          className={`inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-bold shadow-[0_10px_26px_rgba(255,122,0,0.22)] transition sm:w-auto ${styles.hubButton}`}
        >
          View all guides →
        </Link>
      </div>

      <div className={`mt-6 rounded-2xl border p-4 sm:p-5 ${styles.hubBox}`}>
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] ${
            variant === "dark" ? "text-[#FF7A00]" : "text-orange-600"
          }`}
        >
          Complete NEXA guide hub
        </p>

        <p className={`mt-2 text-sm leading-6 ${styles.text}`}>
          Browse every important NEXA Rentals guide about scooter rental,
          e-bike rental, 125cc licence rules, deposits, prices, helmets,
          routes, Magaluf, Palmanova and Mallorca booking tips.
        </p>

        <Link
          href={guidesHref}
          className={`mt-3 inline-flex text-sm font-semibold underline-offset-4 hover:underline ${
            variant === "dark" ? "text-[#FF7A00]" : "text-[#c45f00]"
          }`}
        >
          Open scooter rental guide hub →
        </Link>
      </div>

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
          href={guidesHref}
          className={`text-sm font-semibold underline-offset-4 hover:underline ${
            variant === "dark" ? "text-[#FF7A00]" : "text-[#c45f00]"
          }`}
        >
          View the full NEXA scooter rental guide hub
        </Link>
      </p>
    </section>
  );
}