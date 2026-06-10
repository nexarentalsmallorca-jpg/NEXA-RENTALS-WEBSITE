import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/app/Navbar";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { getBlogsForLocale } from "@/lib/blogs";

type Props = {
  params: Promise<{ locale: string }>;
};

const PAGE_BG = "#F9F8F7";

const importantKeywords = [
  "scooter",
  "125cc",
  "licence",
  "license",
  "deposit",
  "magaluf",
  "palmanova",
  "helmet",
  "helmets",
  "route",
  "routes",
  "price",
  "cost",
  "taxi",
  "car",
  "ebike",
  "e-bike",
  "skoter",
  "patente",
  "carta",
  "permis",
  "korkort",
  "precio",
  "prix",
  "preco",
  "prezzo",
  "kostar",
  "alquilar",
  "louer",
  "mieten",
  "noleggiare",
  "alugar",
  "hyra",
];

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const locale = rawLocale as Locale;

  const title = "Scooter Rental Guides Mallorca | NEXA Rentals";
  const description =
    "All NEXA Rentals scooter, e-bike, licence, deposit, price and route guides for Magaluf, Palmanova and Mallorca.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.nexarentals.es/${locale}/blog/scooter-rental-guides`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `https://www.nexarentals.es/${locale}/blog/scooter-rental-guides`,
      siteName: "NEXA Rentals",
      type: "website",
    },
  };
}

export default async function ScooterRentalGuidesPage({ params }: Props) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  const blogs = getBlogsForLocale(locale)
    .filter((blog) =>
      importantKeywords.some((keyword) =>
        `${blog.slug} ${blog.title} ${blog.metaDescription}`
          .toLowerCase()
          .includes(keyword)
      )
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main
      className="min-h-screen overflow-x-clip text-stone-950"
      style={{ backgroundColor: PAGE_BG }}
    >
      <Suspense
        fallback={
          <div className="h-24 w-full" style={{ backgroundColor: PAGE_BG }} />
        }
      >
        <Navbar />
      </Suspense>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">
          NEXA Rentals Mallorca
        </p>

        <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-playfair)] text-4xl font-semibold tracking-tight sm:text-5xl">
          Scooter Rental Guides for Mallorca
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
          Find all NEXA Rentals guides about scooter rental, e-bike rental,
          licence rules, deposits, prices, helmets, routes and pickup
          information for Magaluf, Palmanova and Mallorca.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/scooter-rental-magaluf`}
            className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(255,122,0,0.25)] transition hover:brightness-105"
          >
            Scooter Rental Magaluf
          </Link>

          <Link
            href={`/${locale}/rent-scooter-mallorca-125cc`}
            className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-orange-300 hover:bg-orange-50"
          >
            125cc Licence Guide
          </Link>

          <Link
            href={`/${locale}/ebike-rental-mallorca`}
            className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-orange-300 hover:bg-orange-50"
          >
            E-Bike Rental Mallorca
          </Link>

          <Link
            href={`/${locale}/blog`}
            className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-orange-300 hover:bg-orange-50"
          >
            Back to Blog
          </Link>
        </div>

        <section className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog.slug}
              href={`/${locale}/blog/${blog.slug}`}
              className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                {blog.category} · {blog.readTime}
              </p>

              <h2 className="mt-3 text-lg font-semibold leading-snug text-stone-950 group-hover:text-[#c45f00]">
                {blog.title}
              </h2>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
                {blog.excerpt}
              </p>

              <span className="mt-5 inline-block text-sm font-semibold text-orange-600">
                Read guide →
              </span>
            </Link>
          ))}
        </section>

        {blogs.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-stone-700">
            No guides found for this language yet.
          </div>
        ) : null}
      </section>
    </main>
  );
}