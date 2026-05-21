import type { BlogFaq, BlogSection } from "./blogs";

export function estimateReadTime(parts: {
  quickAnswer: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
}): string {
  const text = [
    parts.quickAnswer,
    ...parts.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...parts.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(" ");

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(10, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export function countWords(parts: {
  quickAnswer: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
}): number {
  const text = [
    parts.quickAnswer,
    ...parts.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
    ...parts.faqs.flatMap((f) => [f.question, f.answer]),
  ].join(" ");

  return text.trim().split(/\s+/).filter(Boolean).length;
}
