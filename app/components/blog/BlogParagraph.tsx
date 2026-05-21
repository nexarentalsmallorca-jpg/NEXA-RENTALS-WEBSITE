import Link from "next/link";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

type Props = {
  text: string;
  className?: string;
};

function isInternal(href: string) {
  return href.startsWith("/") || href.includes("nexarentals.es");
}

export default function BlogParagraph({ text, className }: Props) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const label = match[1];
    const href = match[2];

    if (isInternal(href)) {
      parts.push(
        <Link
          key={`${match.index}-${href}`}
          href={href}
          className="font-semibold text-[#c45f00] underline decoration-[#FF7A00]/35 underline-offset-4 transition hover:text-[#FF7A00]"
        >
          {label}
        </Link>
      );
    } else {
      parts.push(
        <a
          key={`${match.index}-${href}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#c45f00] underline decoration-[#FF7A00]/35 underline-offset-4 transition hover:text-[#FF7A00]"
        >
          {label}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <p className={`nexa-prose-safe ${className ?? ""}`.trim()}>
      {parts.length > 0 ? parts : text}
    </p>
  );
}
