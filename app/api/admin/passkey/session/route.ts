
import { NextRequest, NextResponse } from "next/server";
import { verifyNexaPasskeySession } from "@/lib/nexaAdminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const owner = verifyNexaPasskeySession(request);

  return NextResponse.json(
    {
      success: true,
      owner,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
        Vary: "Cookie",
      },
    }
  );
}
