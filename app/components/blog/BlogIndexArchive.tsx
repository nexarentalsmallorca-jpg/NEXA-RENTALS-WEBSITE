import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { BlogListItem } from "@/app/components/blog/BlogPageClient";
import type { Locale } from "@/i18n/routing";

type Props = {
  locale: Locale;
  blogs: BlogListItem[];
};

export default async function BlogIndexArchive({ locale, blogs }: Props) {
  const t = await getTranslations({ locale, namespace: "blog" });

  return (
    <section
      className="border-t border-stone-400/35 bg-[#e8e7e3] py-12 sm:py-14"
      aria-labelledby="blog-index-archive-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-[1320px] px-4 sm:px-6 md:px-8 lg:px-10">
        <h1
          id="blog-index-archive-heading"
          className="font-[family-name:var(--font-playfair)] text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.02em] text-stone-950 sm:text-[2rem]"
        >
          {t("indexHeading")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-[15px]">
          {t("indexIntro")}
        </p>
        <nav className="mt-8" aria-label={t("allArticlesNav")}>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="block rounded-xl border border-stone-200/80 bg-[#f3f2ef]/80 px-4 py-3 text-sm font-medium text-stone-800 transition hover:border-[#FF7A00]/35 hover:bg-white hover:text-[#c45f00]"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
