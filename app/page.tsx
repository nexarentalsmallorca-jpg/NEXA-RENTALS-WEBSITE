// app/page.tsx
import {redirect} from "next/navigation";

const defaultLocale = "en";

export default function Page() {
  redirect(`/${defaultLocale}`);
}