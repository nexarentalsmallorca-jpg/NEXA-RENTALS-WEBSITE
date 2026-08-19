export const dynamic = "force-dynamic";

import CheckoutClient from "./CheckoutClient";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <CheckoutClient initialLocale={locale} />;
}