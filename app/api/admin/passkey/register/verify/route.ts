
import { NextRequest, NextResponse } from "next/server";
import {
  createHash,
  timingSafeEqual,
} from "node:crypto";

import {
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

import { isoBase64URL } from "@simplewebauthn/server/helpers";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

import {
  verifyNexaAdminSession,
} from "@/lib/nexaAdminSession";

import {
  NEXA_WEBAUTHN_ORIGIN,
  NEXA_WEBAUTHN_RP_ID,
  getRegisteredOwnerPasskey,
} from "@/lib/nexaOwnerWebAuthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRATION_COOKIE =
  "nexa_owner_registration_challenge";

const ENROLLMENT_COOKIE =
  "nexa_owner_enrollment_authorization";

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

function verifyOwnerEnrollment(
  request: NextRequest
): boolean {
  const configuredSecret =
    process.env.NEXA_OWNER_ENROLLMENT_SECRET;

  const submittedSecret =
    request.cookies.get(ENROLLMENT_COOKIE)?.value;

  if (
    !configuredSecret ||
    configuredSecret.length < 32 ||
    !submittedSecret
  ) {
    return false;
  }

  const expectedHash = createHash("sha256")
    .update(configuredSecret)
    .digest();

  const receivedHash = createHash("sha256")
    .update(submittedSecret)
    .digest();

  return timingSafeEqual(
    expectedHash,
    receivedHash
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyNexaAdminSession(request)) {
      return jsonError(
        "Please log in to NEXA OS first.",
        401
      );
    }

    if (!verifyOwnerEnrollment(request)) {
      return jsonError(
        "Owner enrollment authorization is required.",
        403
      );
    }

    if (
      request.headers.get("origin") !==
      NEXA_WEBAUTHN_ORIGIN
    ) {
      return jsonError(
        "Invalid registration origin.",
        403
      );
    }

    const existingPasskey =
      await getRegisteredOwnerPasskey();

    if (existingPasskey) {
      return jsonError(
        "An owner passkey is already registered.",
        409
      );
    }

    const expectedChallenge =
      request.cookies.get(
        REGISTRATION_COOKIE
      )?.value;

    if (!expectedChallenge) {
      return jsonError(
        "Registration expired. Please start again.",
        400
      );
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return jsonError(
        "Invalid registration response."
      );
    }

    const {
      data: pendingChallenge,
      error: challengeError,
    } = await supabaseAdmin
      .from("nexa_owner_auth_challenges")
      .select("id")
      .eq("challenge", expectedChallenge)
      .eq("purpose", "registration")
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (challengeError) {
      throw challengeError;
    }

    if (!pendingChallenge) {
      return jsonError(
        "Registration challenge is invalid or expired.",
        400
      );
    }

    const verification =
      await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: NEXA_WEBAUTHN_ORIGIN,
        expectedRPID: NEXA_WEBAUTHN_RP_ID,
        requireUserVerification: true,
      });

    if (
      !verification.verified ||
      !verification.registrationInfo
    ) {
      return jsonError(
        "Device registration could not be verified.",
        400
      );
    }

    const info = verification.registrationInfo;

    if (
      info.credentialDeviceType !== "singleDevice" ||
      info.credentialBackedUp
    ) {
      return jsonError(
        "This passkey can be backed up or synced. NEXA owner access requires a device-bound credential.",
        403
      );
    }

    const credential = info.credential;

    if (!credential) {
      return jsonError(
        "No verified credential was returned.",
        400
      );
    }

    const {
      data: consumed,
      error: consumeError,
    } = await supabaseAdmin
      .from("nexa_owner_auth_challenges")
      .update({
        consumed_at: new Date().toISOString(),
      })
      .eq("id", pendingChallenge.id)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .select("id")
      .maybeSingle();

    if (consumeError) {
      throw consumeError;
    }

    if (!consumed) {
      return jsonError(
        "Registration challenge was already used.",
        409
      );
    }

    const { error: insertError } =
      await supabaseAdmin
        .from("nexa_owner_passkeys")
        .insert({
          credential_id: credential.id,
          public_key: isoBase64URL.fromBuffer(
            credential.publicKey
          ),
          counter: credential.counter,
          transports: body.response?.transports || [],
          device_type: info.credentialDeviceType,
          backed_up: info.credentialBackedUp,
        });

    if (insertError) {
      console.error(
        "NEXA owner credential storage error:",
        insertError
      );

      return jsonError(
        "Unable to save owner credential.",
        500
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message:
          "NEXA owner passkey registered successfully.",
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set({
      name: REGISTRATION_COOKIE,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin/passkey/register",
      maxAge: 0,
    });

    response.cookies.set({
      name: ENROLLMENT_COOKIE,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin/passkey/register",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error(
      "NEXA owner registration verification error:",
      error
    );

    return jsonError(
      "Unable to verify owner device registration.",
      500
    );
  }
}
