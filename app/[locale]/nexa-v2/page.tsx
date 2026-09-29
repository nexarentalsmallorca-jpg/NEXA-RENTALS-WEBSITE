import PremiumHomeClient from "@/app/components/premium-home/PremiumHomeClient";

type NexaV2PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function NexaV2Page({ params }: NexaV2PageProps) {
  const { locale } = await params;

  return <PremiumHomeClient locale={locale} />;
}