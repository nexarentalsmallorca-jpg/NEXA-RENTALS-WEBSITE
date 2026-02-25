import {Suspense} from "react";
import HomeClient from "../HomeClient";

type PageProps = {
  params: Promise<{locale: string}>;
};

export default async function Page({params}: PageProps) {
  const {locale} = await params;

  return (
    <Suspense fallback={null}>
      <HomeClient key={locale} />
    </Suspense>
  );
}