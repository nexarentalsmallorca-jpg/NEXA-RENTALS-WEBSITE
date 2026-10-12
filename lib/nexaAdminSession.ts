
import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import type { NextRequest } from "next/server";

export const NEXA_ADMIN_COOKIE = "nexa_admin_session";

export type NexaAdminSessionType =
  | "password"
  | "passkey";

export type NexaAdminSession = {
  type: NexaAdminSessionType;
  version: "v1" | "v2";
  expiresAt: number;
};

const SESSION_DURATION_SECONDS = 24 * 60 * 60;

function getSessionSecret(): string | null {
  const secret = process.env.NEXA_ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    return null;
  }

  return secret;
}

function signPayload(
  payload: string,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

function safeCompareHex(
  provided: string,
  expected: string
): boolean {
  if (
    !/^[a-f0-9]{64}$/.test(provided) ||
    !/^[a-f0-9]{64}$/.test(expected)
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(provided, "hex"),
    Buffer.from(expected, "hex")
  );
}

function parseSessionToken(
  token: string
): NexaAdminSession | null {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  const parts = token.split(".");

  // Existing password sessions:
  // v1.expiresAt.nonce.signature
  if (parts.length === 4) {
    const [
      version,
      expiresText,
      nonce,
      providedSignature,
    ] = parts;

    if (version !== "v1") {
      return null;
    }

    if (
      !/^\d+$/.test(expiresText) ||
      !/^[a-f0-9]{32}$/.test(nonce)
    ) {
      return null;
    }

    const expiresAt = Number(expiresText);

    if (
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const payload =
      `${version}.${expiresText}.${nonce}`;

    const expectedSignature = signPayload(
      payload,
      secret
    );

    if (
      !safeCompareHex(
        providedSignature,
        expectedSignature
      )
    ) {
      return null;
    }

    return {
      type: "password",
      version: "v1",
      expiresAt,
    };
  }

  // New passkey sessions:
  // v2.passkey.expiresAt.nonce.signature
  if (parts.length === 5) {
    const [
      version,
      authMethod,
      expiresText,
      nonce,
      providedSignature,
    ] = parts;

    if (
      version !== "v2" ||
      authMethod !== "passkey"
    ) {
      return null;
    }

    if (
      !/^\d+$/.test(expiresText) ||
      !/^[a-f0-9]{32}$/.test(nonce)
    ) {
      return null;
    }

    const expiresAt = Number(expiresText);

    if (
      !Number.isSafeInteger(expiresAt) ||
      expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    const payload =
      `${version}.${authMethod}.${expiresText}.${nonce}`;

    const expectedSignature = signPayload(
      payload,
      secret
    );

    if (
      !safeCompareHex(
        providedSignature,
        expectedSignature
      )
    ) {
      return null;
    }

    return {
      type: "passkey",
      version: "v2",
      expiresAt,
    };
  }

  return null;
}

export function getNexaAdminSession(
  request: NextRequest
): NexaAdminSession | null {
  const token = request.cookies.get(
    NEXA_ADMIN_COOKIE
  )?.value;

  if (!token) {
    return null;
  }

  return parseSessionToken(token);
}

// Existing admin access remains compatible.
export function verifyNexaAdminSession(
  request: NextRequest
): boolean {
  return getNexaAdminSession(request) !== null;
}

// Use this for protected maintenance APIs.
export function verifyNexaPasskeySession(
  request: NextRequest
): boolean {
  const session = getNexaAdminSession(request);

  return (
    session?.version === "v2" &&
    session.type === "passkey"
  );
}

// Call this ONLY after successfully verifying
// a registered passkey on the server.
export function createNexaPasskeySession(): {
  token: string;
  expiresAt: number;
} {
  const secret = getSessionSecret();

  if (!secret) {
    throw new Error(
      "NEXA_ADMIN_SESSION_SECRET is missing or too short."
    );
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) +
    SESSION_DURATION_SECONDS;

  const nonce = randomBytes(16).toString("hex");

  const payload =
    `v2.passkey.${expiresAt}.${nonce}`;

  const signature = signPayload(
    payload,
    secret
  );

  return {
    token: `${payload}.${signature}`,
    expiresAt,
  };
}
