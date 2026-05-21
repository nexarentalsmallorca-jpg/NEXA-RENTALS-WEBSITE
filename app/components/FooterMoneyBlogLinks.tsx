import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getMoneyBlogLinks } from "@/lib/blog-seo";
import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
};

export default async function FooterMoneyBlogLinks({ locale }: Props) {
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const links = getMoneyBlogLinks(locale);

  if (links.length === 0) return null;

  return (
    <section
      className="relative overflow-x-clip border-t border-white/[0.08] text-white"
      style={{ background: "#0f1115" }}
      aria-labelledby="footer-rental-guides-heading"
    >
      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <h2
          id="footer-rental-guides-heading"
          className="text-sm font-semibold tracking-wide text-white/90"
        >
          {tFooter("rentalGuides")}
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((item) => (
            <li key={item.postId}>
              <Link
                href={`/${locale}/blog/${item.slug}`}
                className="block text-xs leading-snug text-white/60 transition hover:text-[#FF7A00]"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link
            href={`/${locale}/blog`}
            className="text-xs font-semibold text-[#FF7A00] underline-offset-4 hover:underline"
          >
            {tFooter("blog")} →
          </Link>
        </p>
      </div>
    </section>
  );
}
