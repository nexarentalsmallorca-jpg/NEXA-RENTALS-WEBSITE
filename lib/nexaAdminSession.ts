
import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const NEXA_ADMIN_COOKIE = "nexa_admin_session";

export function verifyNexaAdminSession(
  request: NextRequest
): boolean {
  const token = request.cookies.get(
    NEXA_ADMIN_COOKIE
  )?.value;

  const secret = process.env.NEXA_ADMIN_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 4) {
    return false;
  }

  const [version, expiresText, nonce, providedSignature] =
    parts;

  if (version !== "v1") {
    return false;
  }

  if (!/^\d+$/.test(expiresText)) {
    return false;
  }

  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/.test(providedSignature)) {
    return false;
  }

  const expiresAt = Number(expiresText);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const payload = `${version}.${expiresText}.${nonce}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(providedSignature, "hex")
  );
}
