
import { NextRequest, NextResponse } from "next/server";
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { verifyNexaAdminSession } from "@/lib/nexaAdminSession";
import {
  NEXA_WEBAUTHN_ORIGIN,
  getRegisteredOwnerPasskey,
} from "@/lib/nexaOwnerWebAuthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE = "nexa_owner_enrollment_authorization";

function errorResponse(error: string, status: number) {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyNexaAdminSession(request)) {
      return errorResponse("Admin login required.", 401);
    }

    if (request.headers.get("origin") !== NEXA_WEBAUTHN_ORIGIN) {
      return errorResponse("Invalid origin.", 403);
    }

    if (await getRegisteredOwnerPasskey()) {
      return errorResponse("Owner passkey already registered.", 409);
    }

    const secret = process.env.NEXA_OWNER_ENROLLMENT_SECRET;

    if (!secret || secret.length < 32) {
      return errorResponse("Enrollment secret not configured.", 503);
    }

    const body = await request.json().catch(() => null);

    if (
      typeof body?.secret !== "string" ||
      body.secret.length > 1024
    ) {
      return errorResponse("Invalid authorization.", 403);
    }

    const expected = createHmac("sha256", secret)
      .update("nexa-owner-enrollment-secret")
      .digest();

    const received = createHmac("sha256", body.secret)
      .update("nexa-owner-enrollment-secret")
      .digest();

    if (!timingSafeEqual(expected, received)) {
      return errorResponse("Invalid authorization.", 403);
    }

    const expires = Math.floor(Date.now() / 1000) + 300;
    const nonce = randomBytes(16).toString("hex");
    const payload = `${expires}.${nonce}`;

    const signature = createHmac("sha256", secret)
      .update(`nexa-enrollment.${payload}`)
      .digest("hex");

    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set({
      name: COOKIE,
      value: `${payload}.${signature}`,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin/passkey/register",
      maxAge: 300,
    });

    return response;
  } catch (error) {
    console.error("Enrollment authorization:", error);
    return errorResponse("Authorization failed.", 500);
  }
}
