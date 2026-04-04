import React from "react";
import Navbar from "../Navbar";

type LegalSection = {
  heading: string;
  paragraphs: string[];
};

type LegalPageProps = {
  title: string;
  subtitle?: string;
  sections: LegalSection[];
};

export default function LegalPage({
  title,
  subtitle,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-4xl px-6 pb-16 pt-28 md:px-8 md:pb-20 md:pt-32">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#FF7A00] md:text-5xl">
          {title}
        </h1>

        {subtitle ? (
          <p className="mb-10 text-base leading-8 text-white/75 md:text-lg">
            {subtitle}
          </p>
        ) : null}

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="mb-4 text-2xl font-semibold text-[#FF7A00]">
                {section.heading}
              </h2>

              <div className="space-y-4">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-base leading-8 text-white/85">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}