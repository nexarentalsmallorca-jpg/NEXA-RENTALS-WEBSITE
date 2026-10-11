
import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const NEXA_WEBAUTHN_RP_ID = "nexarentals.es";

export const NEXA_WEBAUTHN_ORIGIN =
  "https://nexarentals.es";

export const NEXA_WEBAUTHN_RP_NAME =
  "NEXA Rentals Owner Access";

export const NEXA_WEBAUTHN_CHALLENGE_TTL = 5 * 60 * 1000;

export {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
};

export async function getRegisteredOwnerPasskey() {
  const { data, error } = await supabaseAdmin
    .from("nexa_owner_passkeys")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load owner passkey: ${error.message}`
    );
  }

  return data;
}

export async function saveOwnerChallenge(
  challenge: string,
  purpose: "registration" | "authentication"
) {
  const expiresAt = new Date(
    Date.now() + NEXA_WEBAUTHN_CHALLENGE_TTL
  ).toISOString();

  const { data, error } = await supabaseAdmin
    .from("nexa_owner_auth_challenges")
    .insert({
      challenge,
      purpose,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || "Failed to save authentication challenge."
    );
  }

  return data.id as string;
}

export async function consumeOwnerChallenge(
  challenge: string,
  purpose: "registration" | "authentication"
) {
  const { data, error } = await supabaseAdmin
    .from("nexa_owner_auth_challenges")
    .update({
      consumed_at: new Date().toISOString(),
    })
    .eq("challenge", challenge)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to consume authentication challenge: ${error.message}`
    );
  }

  return Boolean(data);
}
