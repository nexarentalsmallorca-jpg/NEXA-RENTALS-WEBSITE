// app/[locale]/scooter-rental-mallorca-driving-licence/page.tsx

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

import GoogleReviewsV3 from "../../components/GoogleReviewsV3";
import LocationV3 from "../../components/LocationV3";
import NexaStatsStripV3 from "../../components/NexaStatsStripV3";
import NeroWebsiteAssistant from "../../components/NeroWebsiteAssistant";
import {
  findSeoRouteGroup,
  getSeoAlternates,
  getSeoUrl,
  type SeoLanguage,
} from "../../../lib/seoRoutes";

const pageFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-nexa-seo",
});

const SEO_LANGUAGE = "en" satisfies SeoLanguage;
const SEO_PATH = "/scooter-rental-mallorca-driving-licence";
const SEO_ROUTE_GROUP = (() => {
  const group = findSeoRouteGroup(SEO_LANGUAGE, SEO_PATH);
  if (!group) throw new Error(`Missing SEO route group: ${SEO_PATH}`);
  return group;
})();

const PAGE_LANGUAGES = [
  { code: "en", label: "English", flag: "/images/en.png" },
  { code: "de", label: "Deutsch", flag: "/images/de.png" },
  { code: "fr", label: "Français", flag: "/images/fr.png" },
  { code: "it", label: "Italiano", flag: "/images/it.png" },
  { code: "es", label: "Español", flag: "/images/es.png" },
] as const;

type PageProps = {
  params: { locale: string } | Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getSeoUrl(SEO_LANGUAGE, SEO_PATH);
  const shouldIndex = locale === SEO_LANGUAGE;

  return {
    title: "Scooter Licence Mallorca: 125cc Rules | NEXA Rentals",
    description:
      "Check which driving licence you need to rent a 125cc scooter in Mallorca, including A, A1, A2 and eligible car licences. Prepare before booking.",
    keywords: [
      "scooter rental Mallorca driving licence",
      "licence for 125cc scooter Mallorca",
      "car licence scooter Mallorca",
      "international driving permit Mallorca scooter",
      "scooter rental requirements Mallorca",
    ],
    alternates: {
      canonical: canonicalUrl,
      languages: getSeoAlternates(SEO_ROUTE_GROUP),
    },
    openGraph: {
      title: "Which Licence Do You Need for a Scooter in Mallorca?",
      description:
        "Understand the licence and document requirements for renting a 125cc scooter from NEXA Rentals in Magaluf.",
      url: canonicalUrl,
      siteName: "NEXA Rentals",
      images: [
        {
          url: "https://www.nexarentals.es/images/personscooter.jpg",
          width: 1200,
          height: 630,
          alt: "125cc scooter licence requirements in Mallorca",
        },
      ],
      locale: "en_GB",
      type: "website",
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: { index: shouldIndex, follow: true },
    },
  };
}

export default async function ScooterLicenceMallorcaPage({
  params,
}: PageProps) {
  const { locale } = await params;
  const homeHref = `/${locale}`;
  const bookHref = `/${locale}/home`;
  const contactHref = `/${locale}/contact`;
  const currentLanguage =
    PAGE_LANGUAGES.find((language) => language.code === locale) ||
    PAGE_LANGUAGES[0];

  const faqItems = [
    {
      question: "Can I rent a 125cc scooter in Mallorca with a car licence?",
      answer:
        "Spanish rules allow qualifying category B licence holders with at least three years of experience to ride certain motorcycles covered by category A1 within Spain. Rental acceptance can also depend on the issuing country and licence shown, so contact NEXA Rentals before paying if you are unsure.",
    },
    {
      question: "Are A, A1 and A2 motorcycle licences accepted?",
      answer:
        "A valid original A, A1 or A2 motorcycle licence is normally suitable for our 125cc scooters, subject to identity, validity and rental checks at collection.",
    },
    {
      question: "Do I need an International Driving Permit in Mallorca?",
      answer:
        "Some licences issued outside the EU or EEA may need an International Driving Permit or official translation. The permit does not replace your original licence; bring both when required.",
    },
    {
      question: "Can I rent with a provisional or learner licence?",
      answer:
        "No. NEXA Rentals does not accept provisional or learner licences. You must present a valid full driving licence that authorises the vehicle category.",
    },
    {
      question: "Which documents must I bring?",
      answer:
        "Bring your original physical driving licence and a valid passport or national identity card. If an International Driving Permit or official translation is required, bring that as well.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className={`${pageFont.variable} licence-page`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <header className="licence-nav">
        <Link href={homeHref}>
          <Image
            src="/images/reallogo.png"
            alt="NEXA Rentals"
            width={220}
            height={74}
            priority
          />
        </Link>
        <Link href={bookHref} className="nav-book">
          Book now
        </Link>
        <div className="nav-right">
          <Link href={contactHref} className="nav-contact">
            Contact
          </Link>
          <details>
            <summary>
              <Image
                src={currentLanguage.flag}
                alt={currentLanguage.label}
                width={20}
                height={20}
              />
              {currentLanguage.code.toUpperCase()} ▾
            </summary>
            <div className="language-menu">
              {PAGE_LANGUAGES.map((language) => (
                <Link
                  key={language.code}
                  href={`/${language.code}${SEO_ROUTE_GROUP.routes[language.code]}`}
                >
                  <Image
                    src={language.flag}
                    alt={language.label}
                    width={20}
                    height={20}
                  />
                  {language.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </header>

      <section className="licence-hero shell">
        <div className="hero-copy">
          <span className="eyebrow">125cc scooter licence guide</span>
          <h1>Which driving licence do you need in Mallorca?</h1>
          <p>
            Check whether your licence can be accepted for a 125cc scooter
            before you book. Clear requirements and no confusion at collection.
          </p>
          <div className="actions">
            <Link href={bookHref} className="primary">
              Check scooters &amp; prices
            </Link>
            <Link href={contactHref} className="secondary">
              Ask about your licence
            </Link>
          </div>
          <div className="pills">
            <span>A / A1 / A2</span>
            <span>Eligible B licences</span>
            <span>Original documents</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orange-shape" />
          <Image
            src="/images/personscooter.jpg"
            alt="Riding a 125cc rental scooter in Mallorca"
            width={900}
            height={700}
            priority
          />
          <div className="answer-card">
            <small>Most common answer</small>
            <strong>Full licence required</strong>
            <span>Bring the original document.</span>
          </div>
        </div>
      </section>

      <section className="intro shell">
        <span className="eyebrow">Know before you book</span>
        <h2>Licence options for a 125cc rental scooter</h2>
        <p>
          The licence you need depends on its category, how long you have held
          it and where it was issued. Your original licence must remain valid
          for the entire rental period.
        </p>
      </section>

      <section className="licence-grid shell">
        <article>
          <b>01</b>
          <h3>A, A1 or A2 licence</h3>
          <p>
            A valid full motorcycle licence covering a 125cc scooter is the
            clearest option.
          </p>
          <span className="accepted">Normally accepted</span>
        </article>
        <article>
          <b>02</b>
          <h3>Category B car licence</h3>
          <p>
            Qualifying B licences held for at least three years may cover
            certain A1 motorcycles in Spain.
          </p>
          <span className="check">Check eligibility</span>
        </article>
        <article>
          <b>03</b>
          <h3>Non-EU or non-EEA licence</h3>
          <p>
            You may also need an International Driving Permit or an official
            translation.
          </p>
          <span className="check">Contact us first</span>
        </article>
        <article>
          <b>04</b>
          <h3>Provisional or learner licence</h3>
          <p>
            Provisional permits, learner licences, photographs and copies are
            not accepted.
          </p>
          <span className="rejected">Not accepted</span>
        </article>
      </section>

      <section className="documents">
        <div className="documents-inner shell">
          <div>
            <span className="eyebrow">Collection checklist</span>
            <h2>Bring the correct original documents</h2>
            <p>
              Screenshots and photocopies are not enough when collecting your
              scooter in Magaluf.
            </p>
          </div>
          <div className="checklist">
            <p>
              <b>✓ Original driving licence</b>
              <span>Valid for the scooter category.</span>
            </p>
            <p>
              <b>✓ Passport or national ID</b>
              <span>The identity must match the booking.</span>
            </p>
            <p>
              <b>✓ International permit when required</b>
              <span>Bring it with your original licence.</span>
            </p>
          </div>
        </div>
      </section>

      <section className="warning shell">
        <div className="warning-icon">!</div>
        <div>
          <h2>Not sure whether your licence qualifies?</h2>
          <p>
            Send us the issuing country, category and first-issue date before
            paying. Final eligibility is confirmed from the original documents.
          </p>
        </div>
        <Link href={contactHref}>Contact NEXA</Link>
      </section>

      <section className="component">
        <GoogleReviewsV3 />
      </section>
      <section className="component">
        <NexaStatsStripV3 />
      </section>

      <section className="faq">
        <div className="shell faq-inner">
          <span className="eyebrow">Driving licence FAQ</span>
          <h2>Scooter rental licence questions</h2>
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="component">
        <LocationV3 />
      </section>
      <section className="final-cta">
        <span>Licence ready?</span>
        <h2>Book your 125cc scooter in Mallorca</h2>
        <p>Reserve online and collect directly from NEXA Rentals in Magaluf.</p>
        <Link href={bookHref}>Book your scooter</Link>
      </section>

      <NeroWebsiteAssistant />

      <style>{`
        .licence-page,.licence-page *{box-sizing:border-box}.licence-page{background:#fff;color:#111116;font-family:var(--font-nexa-seo),Poppins,Arial,sans-serif;overflow:hidden}.shell{width:min(1180px,calc(100% - 40px));margin:auto}.licence-nav{height:76px;padding:0 max(20px,calc((100% - 1180px)/2));display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;background:#050507;color:#fff;position:sticky;top:0;z-index:50}.licence-nav>a:first-child{display:flex;width:max-content}.licence-nav img{width:116px;height:auto}.nav-book,.primary,.warning>a,.final-cta>a{padding:14px 25px;border-radius:999px;background:#ff7900;color:#fff;text-decoration:none;font-weight:800}.nav-book{background:#fff;color:#111116;text-transform:uppercase;font-size:12px;letter-spacing:.08em}.nav-right{justify-self:end;display:flex;align-items:center;gap:12px}.nav-contact{color:#fff;text-decoration:none;font-weight:700}.nav-right details{position:relative}.nav-right summary{padding:10px 13px;border:1px solid #3b3b41;border-radius:999px;display:flex;align-items:center;gap:7px;cursor:pointer;list-style:none;font-size:12px;font-weight:800}.nav-right summary img,.language-menu img{width:20px;height:20px}.language-menu{position:absolute;right:0;top:50px;width:170px;padding:8px;border-radius:16px;background:#151519;box-shadow:0 20px 45px #0006}.language-menu a{padding:9px;border-radius:10px;display:flex;gap:9px;align-items:center;color:#fff;text-decoration:none;font-size:13px}.language-menu a:hover{background:#ff7900}.licence-hero{padding:85px 0;display:grid;grid-template-columns:.95fr 1.05fr;gap:75px;align-items:center}.eyebrow{color:#ff7900;font-size:12px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.hero-copy h1{margin:17px 0 22px;font-size:clamp(48px,5vw,78px);line-height:.98;letter-spacing:-.06em}.hero-copy>p,.intro>p,.documents p,.warning p,.faq p,.final-cta p{color:#666670;line-height:1.7;font-size:17px}.actions,.pills{margin-top:28px;display:flex;flex-wrap:wrap;gap:11px}.secondary{padding:14px 24px;border:1px solid #d7d7dd;border-radius:999px;color:#111116;text-decoration:none;font-weight:800}.pills span{padding:8px 12px;border-radius:999px;background:#f0f0f2;font-size:12px;font-weight:700}.hero-visual{min-height:530px;position:relative;display:grid;place-items:center}.orange-shape{position:absolute;inset:35px 0 0 18%;border-radius:42px;background:linear-gradient(145deg,#ff6500,#ffba43);transform:rotate(2deg)}.hero-visual>img{position:relative;width:84%;height:445px;object-fit:cover;border-radius:35px;box-shadow:0 28px 60px #1114}.answer-card{position:absolute;left:0;bottom:0;width:280px;padding:20px;border-radius:22px;background:#111116;color:#fff;box-shadow:0 20px 45px #0005}.answer-card small{color:#ff9a35}.answer-card strong,.answer-card span{display:block;margin-top:5px}.answer-card span{color:#bcbcc3;font-size:13px}.intro{padding:75px 0 38px;max-width:830px;text-align:center}.intro h2,.documents h2,.warning h2,.faq h2,.final-cta h2{margin:13px 0 17px;font-size:clamp(34px,4vw,54px);line-height:1.05;letter-spacing:-.04em}.licence-grid{padding:25px 0 95px;display:grid;grid-template-columns:1fr 1fr;gap:18px}.licence-grid article{padding:32px;border:1px solid #e6e6eb;border-radius:28px;box-shadow:0 15px 42px #1111}.licence-grid article>b{color:#ff7900}.licence-grid h3{font-size:24px;margin:15px 0 10px}.licence-grid p{min-height:55px;color:#666670;line-height:1.65}.licence-grid article>span{display:inline-block;padding:8px 11px;border-radius:999px;font-size:12px;font-weight:800}.accepted{background:#e4f7eb;color:#087436}.check{background:#fff0df;color:#a84b00}.rejected{background:#ffe8e8;color:#a51f1f}.documents{padding:95px 0;background:#111116;color:#fff}.documents-inner{display:grid;grid-template-columns:.9fr 1.1fr;gap:80px;align-items:center}.documents p{color:#bbb}.checklist{display:grid;gap:12px}.checklist p{margin:0;padding:19px;border:1px solid #303038;border-radius:18px;background:#1a1a20}.checklist b,.checklist span{display:block}.checklist b{color:#fff}.warning{margin-top:60px;margin-bottom:60px;padding:34px;border-radius:28px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:22px;background:#ff7900}.warning-icon{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:#111116;color:#fff;font-size:28px;font-weight:900}.warning h2{margin:0 0 5px;font-size:27px}.warning p{margin:0;color:#422000;font-size:14px}.warning>a{background:#111116}.component{padding:45px 0}.faq{padding:85px 0;background:#f7f7f8}.faq-inner{max-width:900px}.faq details{margin-top:11px;padding:0 22px;border:1px solid #dddde3;border-radius:18px;background:#fff}.faq summary{padding:21px 25px 21px 0;cursor:pointer;font-weight:800}.faq p{padding:0 0 20px;margin:0;font-size:15px}.final-cta{padding:95px 20px;background:#111116;color:#fff;text-align:center}.final-cta>span{color:#ff8b20;font-weight:800}.final-cta p{color:#bbb}.final-cta>a{display:inline-block;margin-top:12px}@media(max-width:850px){.licence-nav{grid-template-columns:auto 1fr auto}.nav-contact{display:none}.licence-hero,.documents-inner{grid-template-columns:1fr}.hero-copy{text-align:center}.actions,.pills{justify-content:center}.licence-grid{grid-template-columns:1fr}.warning{grid-template-columns:auto 1fr}.warning>a{grid-column:1/-1;text-align:center}}@media(max-width:600px){.shell{width:min(100% - 28px,1180px)}.licence-nav{height:68px;padding:0 12px;gap:8px}.licence-nav img{width:86px}.nav-book{padding:11px 14px;font-size:10px}.nav-right summary{padding:8px}.licence-hero{padding:50px 0;gap:35px}.hero-copy h1{font-size:44px}.hero-copy>p{font-size:16px}.actions{display:grid}.hero-visual{min-height:400px}.hero-visual>img{height:330px;border-radius:26px}.orange-shape{border-radius:28px}.answer-card{width:72%;padding:16px}.intro{padding-top:65px}.licence-grid article{padding:25px}.documents,.faq,.final-cta{padding:70px 0}.warning{grid-template-columns:1fr;text-align:center}.warning-icon{margin:auto}.intro h2,.documents h2,.faq h2,.final-cta h2{font-size:35px}}
      `}</style>
    </main>
  );
}
