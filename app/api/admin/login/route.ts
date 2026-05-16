import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "nexa_admin_session";

function createError(message: string, status = 401) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    const adminEmail = String(process.env.NEXA_ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();

    const adminPassword = String(process.env.NEXA_ADMIN_PASSWORD || "");

    if (!adminEmail || !adminPassword) {
      console.error("❌ Missing NEXA admin login ENV variables:", {
        NEXA_ADMIN_EMAIL: Boolean(adminEmail),
        NEXA_ADMIN_PASSWORD: Boolean(adminPassword),
        NEXA_ADMIN_EMAIL_LENGTH: adminEmail.length,
        NEXA_ADMIN_PASSWORD_LENGTH: adminPassword.length,
      });

      return createError(
        "Admin login is not configured. Add NEXA_ADMIN_EMAIL and NEXA_ADMIN_PASSWORD in Vercel Environment Variables.",
        500
      );
    }

    if (!email || !password) {
      return createError("Email and password are required.", 400);
    }

    if (email !== adminEmail || password !== adminPassword) {
      return createError("Wrong email or password.", 401);
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully.",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "active",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("❌ NEXA admin login route error:", error);

    return createError("Server error. Please try again.", 500);
  }
}