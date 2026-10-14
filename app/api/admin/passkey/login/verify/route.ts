
import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

import {
  NEXA_WEBAUTHN_ORIGIN,
  NEXA_WEBAUTHN_RP_ID,
  verifyAuthenticationResponse,
  getRegisteredOwnerPasskey,
} from "@/lib/nexaOwnerWebAuthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_COOKIE_NAME = "nexa_admin_session";
const LOGIN_CHALLENGE_COOKIE = "nexa_owner_login_challenge";
const SESSION_DURATION = 60 * 60 * 24;

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function createOwnerSession(secret: string): string {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION;

  const nonce = randomBytes(16).toString("hex");

  // Passkey-authenticated owner sessions use v2.
  // Password sessions continue using their existing format.
  const payload = `v2.${expiresAt}.${nonce}`;

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("origin") !== NEXA_WEBAUTHN_ORIGIN) {
      return jsonError("Invalid authentication origin.", 403);
    }

    const sessionSecret = process.env.NEXA_ADMIN_SESSION_SECRET;

    if (!sessionSecret || sessionSecret.length < 32) {
      return jsonError(
        "Owner authentication is not configured.",
        500
      );
    }

    const expectedChallenge = request.cookies.get(
      LOGIN_CHALLENGE_COOKIE
    )?.value;

    if (!expectedChallenge) {
      return jsonError(
        "Authentication expired. Please try again.",
        400
      );
    }

    const { data: pendingChallenge, error: challengeError } =
      await supabaseAdmin
        .from("nexa_owner_auth_challenges")
        .select("id")
        .eq("challenge", expectedChallenge)
        .eq("purpose", "authentication")
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

    if (challengeError) throw challengeError;

    if (!pendingChallenge) {
      return jsonError(
        "Authentication challenge is invalid or expired.",
        400
      );
    }

    const ownerPasskey = await getRegisteredOwnerPasskey();

    if (!ownerPasskey) {
      return jsonError(
        "No owner passkey is registered. Register your Samsung first.",
        401
      );
    }

    if (
      ownerPasskey.device_type !== "singleDevice" ||
      ownerPasskey.backed_up === true
    ) {
      return jsonError(
        "The registered credential is not approved for device-bound access.",
        403
      );
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof body.id !== "string"
    ) {
      return jsonError("Invalid authentication response.");
    }

    if (body.id !== ownerPasskey.credential_id) {
      return jsonError(
        "This credential is not authorized for NEXA OS.",
        403
      );
    }

    const publicKey = new Uint8Array(
      Buffer.from(ownerPasskey.public_key, "base64url")
    );

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: NEXA_WEBAUTHN_ORIGIN,
      expectedRPID: NEXA_WEBAUTHN_RP_ID,
      credential: {
        id: ownerPasskey.credential_id,
        publicKey,
        counter: Number(ownerPasskey.counter),
        transports: ownerPasskey.transports || [],
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return jsonError("Owner authentication failed.", 401);
    }

    const { data: consumed, error: consumeError } =
      await supabaseAdmin
        .from("nexa_owner_auth_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", pendingChallenge.id)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .select("id")
        .maybeSingle();

    if (consumeError) throw consumeError;

    if (!consumed) {
      return jsonError(
        "Authentication challenge has already been used.",
        409
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("nexa_owner_passkeys")
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", ownerPasskey.id);

    if (updateError) throw updateError;

    const response = NextResponse.json(
      {
        success: true,
        message: "Owner authentication successful.",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: createOwnerSession(sessionSecret),
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    response.cookies.set({
      name: LOGIN_CHALLENGE_COOKIE,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin/passkey/login",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("NEXA passkey authentication error:", error);

    return jsonError(
      "Unable to verify owner authentication.",
      500
    );
  }
}
