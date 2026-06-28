import type { Locale } from "@/i18n/routing";

type Variant = "default" | "dark" | "light";

type Props = {
  locale: Locale;
  variant?: Variant;
  className?: string;
};

export default async function BlogRentalGuides(_props: Props) {
  return null;
}