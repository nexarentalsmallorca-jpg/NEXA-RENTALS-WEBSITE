import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET = "nexa123"; // 🔐 change this

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Allow coming-soon page
  if (url.pathname.startsWith("/coming-soon")) {
    return NextResponse.next();
  }

  // Allow if secret query exists
  if (req.nextUrl.searchParams.get("dev") === SECRET) {
    return NextResponse.next();
  }

  // Otherwise redirect users
  url.pathname = "/coming-soon";
  return NextResponse.redirect(url);
}
