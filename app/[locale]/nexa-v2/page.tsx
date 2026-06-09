import PremiumHomeClient from "@/app/components/premium-home/PremiumHomeClient";

type NexaV2PageProps = {
  params: {
    locale: string;
  };
};

export default function NexaV2Page({ params }: NexaV2PageProps) {
  return <PremiumHomeClient locale={params.locale} />;
}