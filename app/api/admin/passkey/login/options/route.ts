
import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

import {
  NEXA_WEBAUTHN_ORIGIN,
  NEXA_WEBAUTHN_RP_ID,
  generateAuthenticationOptions,
  getRegisteredOwnerPasskey,
  saveOwnerChallenge,
} from "@/lib/nexaOwnerWebAuthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOGIN_CHALLENGE_COOKIE =
  "nexa_owner_login_challenge";

const CHALLENGE_MAX_AGE = 300;

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

export async function POST(request: NextRequest) {
  try {
    // Only accept authentication requests
    // originating from the official website.

    if (
      request.headers.get("origin") !==
      NEXA_WEBAUTHN_ORIGIN
    ) {
      return jsonError(
        "Authentication must start from the official NEXA website.",
        403
      );
    }

    // Check whether the owner has enrolled
    // a passkey.

    const ownerPasskey =
      await getRegisteredOwnerPasskey();

    if (!ownerPasskey) {
      return jsonError(
        "Owner passkey authentication is not configured.",
        409
      );
    }

    // Refuse credentials that are marked
    // as backed up or multi-device.

    if (
      ownerPasskey.device_type !== "singleDevice" ||
      ownerPasskey.backed_up === true
    ) {
      return jsonError(
        "The registered credential is not approved for device-bound owner access.",
        403
      );
    }

    // Generate a fresh WebAuthn challenge.
    //
    // Only the registered owner's credential
    // is permitted in this authentication request.

    const options =
      await generateAuthenticationOptions({
        rpID: NEXA_WEBAUTHN_RP_ID,

        allowCredentials: [
          {
            id: ownerPasskey.credential_id,
            transports: ownerPasskey.transports || [],
          },
        ],

        userVerification: "required",

        timeout: 60000,
      });

    // Save the authentication challenge
    // server-side for later verification.

    await saveOwnerChallenge(
      options.challenge,
      "authentication"
    );

    const response = NextResponse.json(
      {
        success: true,
        options,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    // Bind this challenge to the browser
    // that requested it.
    //
    // The verification endpoint will read
    // the HttpOnly cookie and compare it
    // with the stored challenge.

    response.cookies.set({
      name: LOGIN_CHALLENGE_COOKIE,
      value: options.challenge,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin/passkey/login",
      maxAge: CHALLENGE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(
      "NEXA passkey login options error:",
      error
    );

    return jsonError(
      "Unable to start owner authentication.",
      500
    );
  }
}
