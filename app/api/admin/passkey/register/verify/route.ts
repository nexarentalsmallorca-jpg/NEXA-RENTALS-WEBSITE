
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyNexaAdminSession } from "@/lib/nexaAdminSession";

import {
  NEXA_WEBAUTHN_ORIGIN,
  NEXA_WEBAUTHN_RP_ID,
  getRegisteredOwnerPasskey,
} from "@/lib/nexaOwnerWebAuthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRATION_COOKIE = "nexa_owner_registration_challenge";
const ENROLLMENT_COOKIE = "nexa_owner_enrollment_authorization";

function fail(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function authorized(request: NextRequest): boolean {
  const secret = process.env.NEXA_OWNER_ENROLLMENT_SECRET;
  const token = request.cookies.get(ENROLLMENT_COOKIE)?.value;

  if (!secret || secret.length < 32 || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [expiresString, nonce, signature] = parts;
  const expires = Number(expiresString);

  if (
    !Number.isSafeInteger(expires) ||
    expires <= Math.floor(Date.now() / 1000) ||
    expires > Math.floor(Date.now() / 1000) + 300 ||
    !/^[a-f0-9]{32}$/.test(nonce) ||
    !/^[a-f0-9]{64}$/.test(signature)
  ) {
    return false;
  }

  const payload = `${expiresString}.${nonce}`;
  const expected = createHmac("sha256", secret)
    .update(`nexa-enrollment.${payload}`)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(expected, received)
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyNexaAdminSession(request)) {
      return fail("Please log in first.", 401);
    }

    if (!authorized(request)) {
      return fail("Owner enrollment authorization required.", 403);
    }

    if (request.headers.get("origin") !== NEXA_WEBAUTHN_ORIGIN) {
      return fail("Invalid registration origin.", 403);
    }

    if (await getRegisteredOwnerPasskey()) {
      return fail("Owner passkey already registered.", 409);
    }

    const expectedChallenge = request.cookies.get(
      REGISTRATION_COOKIE
    )?.value;

    if (!expectedChallenge) {
      return fail("Registration expired.");
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return fail("Invalid registration response.");
    }

    const { data: pending, error: challengeError } =
      await supabaseAdmin
        .from("nexa_owner_auth_challenges")
        .select("id")
        .eq("challenge", expectedChallenge)
        .eq("purpose", "registration")
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

    if (challengeError) throw challengeError;
    if (!pending) return fail("Registration challenge expired.");

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: NEXA_WEBAUTHN_ORIGIN,
      expectedRPID: NEXA_WEBAUTHN_RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return fail("Passkey verification failed.");
    }

    const info = verification.registrationInfo;

    if (
      info.credentialDeviceType !== "singleDevice" ||
      info.credentialBackedUp
    ) {
      return fail(
        "This credential is backup-eligible or synced. A device-bound credential is required.",
        403
      );
    }

    const credential = info.credential;

    if (!credential) {
      return fail("Verified credential missing.");
    }

    const { data: consumed, error: consumeError } =
      await supabaseAdmin
        .from("nexa_owner_auth_challenges")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", pending.id)
        .is("consumed_at", null)
        .gt("expires_at", new Date().toISOString())
        .select("id")
        .maybeSingle();

    if (consumeError) throw consumeError;
    if (!consumed) return fail("Challenge already used.", 409);

    const { error: insertError } = await supabaseAdmin
      .from("nexa_owner_passkeys")
      .insert({
        credential_id: credential.id,
        public_key: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter,
        transports: body.response?.transports || [],
        device_type: info.credentialDeviceType,
        backed_up: info.credentialBackedUp,
      });

    if (insertError) {
      console.error("Passkey storage:", insertError);
      return fail("Unable to save owner passkey.", 500);
    }

    const response = NextResponse.json(
      { success: true, message: "Owner passkey registered." },
      { headers: { "Cache-Control": "no-store" } }
    );

    for (const name of [REGISTRATION_COOKIE, ENROLLMENT_COOKIE]) {
      response.cookies.set({
        name,
        value: "",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/api/admin/passkey/register",
        maxAge: 0,
      });
    }

    return response;
  } catch (error) {
    console.error("Owner registration:", error);
    return fail("Unable to verify registration.", 500);
  }
}
