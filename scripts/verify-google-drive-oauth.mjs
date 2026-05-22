/**
 * Run locally: node scripts/verify-google-drive-oauth.mjs
 * Loads .env.local if present (simple KEY=value parser).
 */
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function clean(value) {
  const t = String(value || "").trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

loadEnvFile(ENV_PATH);

const clientId = clean(process.env.GOOGLE_DRIVE_CLIENT_ID);
const clientSecret = clean(process.env.GOOGLE_DRIVE_CLIENT_SECRET);
const refreshToken = clean(process.env.GOOGLE_DRIVE_REFRESH_TOKEN);
const redirectUri =
  clean(process.env.GOOGLE_DRIVE_REDIRECT_URI) ||
  "https://developers.google.com/oauthplayground";

if (!clientId || !clientSecret || !refreshToken) {
  console.error(
    "Missing GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, or GOOGLE_DRIVE_REFRESH_TOKEN in .env.local"
  );
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
oauth2.setCredentials({ refresh_token: refreshToken });

try {
  const { token } = await oauth2.getAccessToken();
  console.log("OK — access token received.", token ? "(non-empty)" : "(empty!)");
  process.exit(0);
} catch (err) {
  const msg =
    err?.response?.data?.error_description ||
    err?.response?.data?.error ||
    err?.message;
  console.error("FAILED:", msg);
  if (String(msg).toLowerCase().includes("invalid_grant")) {
    console.error(`
invalid_grant fix:
1. Google Cloud Console → Credentials → OAuth client
2. Add redirect URI: ${redirectUri}
3. https://developers.google.com/oauthplayground → gear → your Client ID + Secret
4. Scope: https://www.googleapis.com/auth/drive → Authorize → Exchange → copy Refresh token
5. Update Vercel GOOGLE_DRIVE_REFRESH_TOKEN (same Client ID/Secret), redeploy
`);
  }
  process.exit(1);
}
