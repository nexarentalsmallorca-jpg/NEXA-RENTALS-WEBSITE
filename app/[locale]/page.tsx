// app/[locale]/page.tsx
import HomeClient from "../HomeClient";
import {getTranslations} from "next-intl/server";

type Props = {
  params: {locale: string};
};

export default async function LocaleHomePage({params}: Props) {
  // You don't strictly need locale here because next-intl reads it from route,
  // but keeping it doesn't hurt.
  const t = await getTranslations();

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