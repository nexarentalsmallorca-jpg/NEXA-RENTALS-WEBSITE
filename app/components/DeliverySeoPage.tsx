"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { DeliverySeoPage as DeliverySeoPageData } from "../../lib/deliverySeoPages";

type Props = {
  page: DeliverySeoPageData;
};

export default function DeliverySeoPage({ page }: Props) {
  const [typedHeading, setTypedHeading] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fullText = page.heading;

    setTypedHeading("");
    setReady(false);

    let index = 0;
    let cancelled = false;

    function typeNext() {
      if (cancelled) return;

      if (index < fullText.length) {
        setTypedHeading((current) => current + fullText.charAt(index));
        index += 1;
        window.setTimeout(typeNext, 28);
        return;
      }

      window.setTimeout(() => {
        if (!cancelled) {
          setReady(true);
        }
      }, 100);
    }

    const startTimer = window.setTimeout(typeNext, 140);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, [page.heading]);

  const bookHref = `/${page.locale}/home`;

  return (
    <main className={`delivery-seo-page ${ready ? "is-ready" : ""}`}>
      <section className="delivery-hero">
        <Image
          src="/images/personscooter.jpg"
          alt={`${page.area} scooter delivery with NEXA Rentals`}
          fill
          priority
          className="delivery-hero-image"
        />

        <div className="delivery-overlay" />

        <div className="delivery-hero-content">
          <div className="delivery-eyebrow">
            <span />
            {page.eyebrow}
          </div>

          <h1 aria-label={page.heading}>
            <span className="mobile-heading">{typedHeading}</span>
            <span className="desktop-heading">{page.heading}</span>
          </h1>

          <p className="delivery-tagline">{page.tagline}</p>

          <Link href={bookHref} className="delivery-primary-cta">
            {page.cta}
          </Link>
        </div>

        <div className="delivery-panel">
          <strong>{page.panelTitle}</strong>
          <span>{page.panelText}</span>
        </div>
      </section>

      <section className="delivery-included">
        <div className="delivery-included-grid">
          <article>
            <Image
              src="/images/ex4.png"
              alt="Two helmets included"
              width={170}
              height={120}
            />
            <strong>Two helmets</strong>
            <span>Included</span>
          </article>

          <article>
            <Image
              src="/images/ex1.jpg"
              alt="Top case included"
              width={170}
              height={120}
            />
            <strong>Top case</strong>
            <span>Included</span>
          </article>

          <article>
            <Image
              src="/images/ex2.jpg"
              alt="Phone holder included"
              width={170}
              height={120}
            />
            <strong>Phone holder</strong>
            <span>Included</span>
          </article>

          <article>
            <Image
              src="/images/ex3.png"
              alt="Security lock included"
              width={170}
              height={120}
            />
            <strong>Security lock</strong>
            <span>Included</span>
          </article>

          <article>
            <Image
              src="/images/ex5.png"
              alt="Basic insurance included"
              width={170}
              height={120}
            />
            <strong>Basic insurance</strong>
            <span>Included</span>
          </article>
        </div>
      </section>

      <section className="delivery-content">
        <div className="delivery-content-inner">
          <span className="delivery-section-label">
            {page.panelTitle}
          </span>

          <h2>
            125cc scooter delivery to {page.area}
          </h2>

          <p>{page.intro}</p>
          <p>{page.secondParagraph}</p>

          <div className="delivery-nearby">
            <h3>Nearby delivery areas</h3>

            <div>
              {page.nearbyAreas.map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
          </div>

          <Link href={bookHref} className="delivery-bottom-cta">
            {page.cta}
          </Link>
        </div>
      </section>

      <section className="delivery-seo-copy">
        <div className="delivery-seo-copy-inner">
          <span className="delivery-section-label">
            Scooter delivery in Mallorca
          </span>

          <h2>
            Book a scooter for delivery to your hotel, Airbnb or apartment.
          </h2>

          <p>
            NEXA Rentals offers 125cc scooter rental for visitors staying in
            {` ${page.area}`}. You can choose your scooter online, select your
            rental dates and continue to the booking system where Hotel / Airbnb
            Delivery and Office Pickup are both available.
          </p>

          <p>
            This page is designed for travellers searching for scooter delivery,
            scooter rental and hotel delivery options in {page.area}. If you
            prefer to collect the scooter yourself, you can still choose Office
            Pickup from our Magaluf location during booking.
          </p>

          <div className="delivery-keywords">
            {page.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="delivery-final-cta">
        <h2>Ready to arrange your scooter?</h2>

        <p>
          Check availability, choose your dates and select delivery or office
          pickup during booking.
        </p>

        <Link href={bookHref}>{page.cta}</Link>
      </section>

      <style jsx>{`
        .delivery-seo-page {
          min-height: 100vh;
          background: #ffffff;
          color: #111116;
          overflow-x: hidden;
        }

        .delivery-hero {
          position: relative;
          min-height: 760px;
          overflow: hidden;
          background: #000000;
        }

        .delivery-hero-image {
          object-fit: cover;
          object-position: center 50%;
        }

        .delivery-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.72) 0%,
              rgba(0, 0, 0, 0.38) 50%,
              rgba(0, 0, 0, 0.1) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.1) 0%,
              rgba(0, 0, 0, 0.08) 68%,
              rgba(0, 0, 0, 0.38) 100%
            );
          z-index: 1;
        }

        .delivery-hero-content {
          position: relative;
          z-index: 3;
          max-width: 1240px;
          margin: 0 auto;
          padding: 130px 40px 200px;
          color: #ffffff;
        }

        .delivery-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .delivery-eyebrow span {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ff7a00;
        }

        h1 {
          max-width: 760px;
          margin: 24px 0 0;
          font-size: clamp(52px, 6vw, 86px);
          line-height: 0.98;
          letter-spacing: -0.065em;
          font-weight: 900;
        }

        .mobile-heading {
          display: none;
        }

        .delivery-tagline {
          max-width: 720px;
          margin: 26px 0 0;
          font-size: 20px;
          line-height: 1.45;
          font-weight: 800;
        }

        .delivery-primary-cta {
          margin-top: 34px;
          min-height: 58px;
          padding: 0 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff6500, #ff9f1c);
          color: #ffffff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.02em;
          box-shadow:
            0 0 0 2px rgba(255, 255, 255, 0.8),
            0 18px 50px rgba(255, 122, 0, 0.36);
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .delivery-primary-cta:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow:
            0 0 0 2px rgba(255, 255, 255, 0.92),
            0 22px 58px rgba(255, 122, 0, 0.45);
        }

        .delivery-panel {
          position: absolute;
          z-index: 4;
          left: 0;
          right: 0;
          bottom: 0;
          min-height: 138px;
          padding: 34px 48px 28px;
          background: linear-gradient(135deg, #ff6500, #ff9f1c);
          clip-path: polygon(
            0 32%,
            18% 24%,
            38% 29%,
            58% 18%,
            77% 22%,
            100% 0,
            100% 100%,
            0 100%
          );
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          color: #ffffff;
          text-align: right;
        }

        .delivery-panel strong {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .delivery-panel span {
          margin-top: 4px;
          font-size: 14px;
          font-weight: 800;
        }

        .delivery-included {
          padding: 58px 30px 74px;
        }

        .delivery-included-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 28px;
        }

        .delivery-included article {
          text-align: center;
        }

        .delivery-included img {
          width: 100%;
          max-width: 150px;
          height: 110px;
          object-fit: contain;
        }

        .delivery-included strong {
          display: block;
          margin-top: 10px;
          font-size: 18px;
          font-weight: 900;
        }

        .delivery-included span {
          display: block;
          margin-top: 4px;
          color: #777582;
          font-size: 13px;
          font-weight: 700;
        }

        .delivery-content,
        .delivery-seo-copy {
          padding: 88px 28px;
        }

        .delivery-content {
          background: #fafafd;
        }

        .delivery-seo-copy {
          background: #ffffff;
        }

        .delivery-content-inner,
        .delivery-seo-copy-inner {
          max-width: 950px;
          margin: 0 auto;
        }

        .delivery-section-label {
          color: #ff7a00;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .delivery-content h2,
        .delivery-seo-copy h2 {
          margin: 14px 0 0;
          font-size: clamp(38px, 5vw, 60px);
          line-height: 1.02;
          letter-spacing: -0.06em;
          font-weight: 900;
        }

        .delivery-content p,
        .delivery-seo-copy p {
          margin: 22px 0 0;
          color: #65636f;
          font-size: 17px;
          line-height: 1.8;
          font-weight: 500;
        }

        .delivery-nearby {
          margin-top: 32px;
        }

        .delivery-nearby h3 {
          margin: 0 0 14px;
          font-size: 22px;
          font-weight: 900;
        }

        .delivery-nearby div,
        .delivery-keywords {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .delivery-nearby span,
        .delivery-keywords span {
          padding: 10px 14px;
          border-radius: 999px;
          background: #f1f1f5;
          color: #4f4d58;
          font-size: 12px;
          font-weight: 800;
        }

        .delivery-bottom-cta {
          margin-top: 32px;
          min-height: 54px;
          padding: 0 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #111116;
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        .delivery-keywords {
          margin-top: 30px;
        }

        .delivery-final-cta {
          padding: 70px 28px;
          background: #111116;
          color: #ffffff;
          text-align: center;
        }

        .delivery-final-cta h2 {
          margin: 0;
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1.02;
          letter-spacing: -0.06em;
          font-weight: 900;
        }

        .delivery-final-cta p {
          margin: 18px auto 26px;
          max-width: 650px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          line-height: 1.7;
        }

        .delivery-final-cta a {
          min-height: 56px;
          padding: 0 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff6500, #ff9f1c);
          color: #ffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        @media (max-width: 680px) {
          .delivery-hero {
            min-height: 1160px;
          }

          .delivery-hero-image {
            object-position: 54% center;
            filter: brightness(1.08) saturate(1.02) contrast(0.96);
            transform: scale(0.98);
          }

          .delivery-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.12) 0%,
                rgba(0, 0, 0, 0.12) 50%,
                rgba(0, 0, 0, 0.2) 100%
              );
          }

          .delivery-hero-content {
            padding: 76px 28px 220px;
          }

          .delivery-eyebrow {
            font-size: 12px;
          }

          h1 {
            max-width: 620px;
            margin-top: 20px;
            font-size: clamp(42px, 12.5vw, 58px);
            line-height: 0.98;
          }

          .desktop-heading {
            display: none;
          }

          .mobile-heading {
            display: inline;
          }

          .delivery-tagline {
            margin-top: 20px;
            font-size: 17px;
            opacity: 0;
            transform: translateX(-24px);
            transition:
              opacity 420ms ease,
              transform 420ms ease;
          }

          .delivery-primary-cta {
            width: min(390px, 100%);
            min-height: 72px;
            margin-top: 26px;
            padding: 0 24px;
            font-size: 18px;
            opacity: 0;
            transform: translateX(-40px);
            transition:
              opacity 450ms ease,
              transform 450ms ease;
          }

          .is-ready .delivery-tagline,
          .is-ready .delivery-primary-cta {
            opacity: 1;
            transform: translateX(0);
          }

          .delivery-panel {
            min-height: 130px;
            padding: 36px 24px 24px;
            clip-path: polygon(
              0 26%,
              22% 24%,
              43% 28%,
              64% 18%,
              81% 23%,
              100% 8%,
              100% 100%,
              0 100%
            );
          }

          .delivery-panel strong {
            font-size: 20px;
          }

          .delivery-panel span {
            font-size: 12px;
          }

          .delivery-included {
            padding: 46px 18px 64px;
          }

          .delivery-included-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 30px 12px;
          }

          .delivery-included article:nth-child(4),
          .delivery-included article:nth-child(5) {
            transform: translateX(50%);
          }

          .delivery-included img {
            height: 92px;
          }

          .delivery-included strong {
            font-size: 15px;
          }

          .delivery-included span {
            font-size: 12px;
          }

          .delivery-content,
          .delivery-seo-copy {
            padding: 64px 20px;
          }

          .delivery-content h2,
          .delivery-seo-copy h2 {
            font-size: 38px;
          }

          .delivery-content p,
          .delivery-seo-copy p {
            font-size: 15.5px;
          }

          .delivery-bottom-cta {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}