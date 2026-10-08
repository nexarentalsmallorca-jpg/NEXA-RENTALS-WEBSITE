
import { NextRequest, NextResponse } from "next/server";
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "nexa_admin_session";
const SESSION_DURATION = 60 * 60 * 24;

function createError(message: string, status = 401) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function createSession(secret: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const nonce = randomBytes(16).toString("hex");

  const payload = `v1.${expiresAt}.${nonce}`;

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    const password = String(body?.password || "");

    const adminEmail = String(
      process.env.NEXA_ADMIN_EMAIL || ""
    )
      .trim()
      .toLowerCase();

    const adminPassword = String(
      process.env.NEXA_ADMIN_PASSWORD || ""
    );

    const sessionSecret = String(
      process.env.NEXA_ADMIN_SESSION_SECRET || ""
    );

    if (!adminEmail || !adminPassword || sessionSecret.length < 32) {
      console.error("NEXA admin authentication configuration missing.");

      return createError(
        "Admin authentication is not configured correctly.",
        500
      );
    }

    if (!email || !password) {
      return createError(
        "Email and password are required.",
        400
      );
    }

    const emailValid = safeCompare(email, adminEmail);
    const passwordValid = safeCompare(password, adminPassword);

    if (!emailValid || !passwordValid) {
      return createError("Wrong email or password.", 401);
    }

    const sessionToken = createSession(sessionSecret);

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    return response;
  } catch (error) {
    console.error("NEXA admin login error:", error);

    return createError(
      "Server error. Please try again.",
      500
    );
  }
}
