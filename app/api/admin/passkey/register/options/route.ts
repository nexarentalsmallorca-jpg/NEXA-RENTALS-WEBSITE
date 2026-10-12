
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { verifyNexaAdminSession } from "@/lib/nexaAdminSession";
import {
  NEXA_WEBAUTHN_ORIGIN,
  NEXA_WEBAUTHN_RP_ID,
  NEXA_WEBAUTHN_RP_NAME,
  generateRegistrationOptions,
  getRegisteredOwnerPasskey,
  saveOwnerChallenge,
} from "@/lib/nexaOwnerWebAuthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGISTRATION_COOKIE =
  "nexa_owner_registration_challenge";

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
    // Only an authenticated administrator may
    // start enrolling the owner's device.

    if (!verifyNexaAdminSession(request)) {
      return jsonError(
        "Please log in to NEXA OS first.",
        401
      );
    }

    // Prevent another website from initiating
    // registration using an existing admin cookie.

    if (
      request.headers.get("origin") !==
      NEXA_WEBAUTHN_ORIGIN
    ) {
      return jsonError(
        "Registration must be started from the official NEXA website.",
        403
      );
    }

    // The owner must enroll only one credential.
    // Registration verification will also enforce
    // this restriction.

    const existingPasskey =
      await getRegisteredOwnerPasskey();

    if (existingPasskey) {
      return jsonError(
        "An owner passkey is already registered.",
        409
      );
    }

    // Generate a unique, non-identifying WebAuthn
    // user handle.

    const userID = new Uint8Array(
      randomBytes(32)
    );

    // Ask Android for its built-in authenticator
    // and require local user verification.

    const options =
      await generateRegistrationOptions({
        rpName: NEXA_WEBAUTHN_RP_NAME,
        rpID: NEXA_WEBAUTHN_RP_ID,

        userName: "nexa-owner",
        userDisplayName: "NEXA Owner",
        userID,

        attestationType: "direct",

        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "required",
          requireResidentKey: true,
          userVerification: "required",
        },

        supportedAlgorithmIDs: [-7, -257],

        timeout: 60000,
      });

    // Save the challenge server-side.
    // The verification endpoint must validate
    // and atomically consume this challenge.

    await saveOwnerChallenge(
      options.challenge,
      "registration"
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

    // Bind this registration attempt to the
    // browser that requested the challenge.
    //
    // HttpOnly prevents client-side JavaScript
    // from reading the challenge cookie.

    response.cookies.set({
      name: REGISTRATION_COOKIE,
      value: options.challenge,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/admin/passkey/register",
      maxAge: CHALLENGE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(
      "NEXA passkey registration options error:",
      error
    );

    return jsonError(
      "Unable to prepare owner passkey registration.",
      500
    );
  }
}
