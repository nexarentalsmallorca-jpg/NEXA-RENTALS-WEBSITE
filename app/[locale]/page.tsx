// app/[locale]/page.tsx
import HomeClient from "../HomeClient";
import {getTranslations} from "next-intl/server";

type Props = {
  params: {locale: string};
};
export const locales = ["en", "es", "de", "fr", "it", "pt", "sv"] as const;
export default async function LocaleHomePage({params}: Props) {
  const t = await getTranslations({locale: params.locale});

  return (
    <HomeClient
      heroTitle={t("hero.title")}
      heroSubtitle={t("hero.subtitle")}
      pickupLabel={t("booking.pickup")}
      dropoffDateLabel={t("booking.dropoffDate")}
      timeLabel={t("booking.time")}
      searchLabel={t("booking.search")}
    />
  );
}