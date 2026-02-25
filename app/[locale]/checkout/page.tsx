// app/[locale]/checkout/page.tsx
export const dynamic = "force-dynamic";

import CheckoutClient from "./CheckoutClient";

export default function Page() {
  return <CheckoutClient />;
}