import BlogParagraph from "@/app/components/blog/BlogParagraph";

type Props = {
  text: string;
};

export default function BlogQuickAnswer({ text }: Props) {
  return (
    <aside className="blog-quick-answer nexa-prose-safe relative my-2">
      <div className="blog-quick-answer__ring" aria-hidden />
      <div className="blog-quick-answer__inner">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
            style={{
              background:
                "linear-gradient(135deg, #FF7A00 0%, #ff9a3d 55%, #ffb86c 100%)",
            }}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#c45f00]">
              Quick answer
            </p>
            <p className="mt-1 text-sm font-medium text-stone-600">
              The short version — read this first
            </p>
          </div>
        </div>
        <div className="mt-5 border-t border-[#FF7A00]/15 pt-5">
          <BlogParagraph
            text={text}
            className="text-[17px] font-medium leading-[1.85] text-stone-800 sm:text-[18px] sm:leading-[1.9]"
          />
        </div>
      </div>
    </aside>
  );
}
