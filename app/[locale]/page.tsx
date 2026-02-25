import HomeClient from "../HomeClient";

type PageProps = {
  params: Promise<{locale: string}>;
};

export default async function Page({params}: PageProps) {
  const {locale} = await params;

  return <HomeClient key={locale} />;
}