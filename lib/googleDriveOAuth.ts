import { google } from "googleapis";

export const GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT =
  "https://developers.google.com/oauthplayground";

export const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

/** Strip whitespace and accidental quotes from Vercel/env copy-paste. */
export function cleanGoogleDriveEnv(value: string | undefined) {
  const trimmed = String(value || "").trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export type GoogleDriveEnvStatus = {
  clientId: boolean;
  clientSecret: boolean;
  refreshToken: boolean;
  contractsFolderId: boolean;
  redirectUri: string;
};

export function getGoogleDriveEnvStatus(): GoogleDriveEnvStatus {
  return {
    clientId: Boolean(cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_CLIENT_ID)),
    clientSecret: Boolean(
      cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_CLIENT_SECRET)
    ),
    refreshToken: Boolean(
      cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_REFRESH_TOKEN)
    ),
    contractsFolderId: Boolean(
      cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID)
    ),
    redirectUri:
      cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_REDIRECT_URI) ||
      GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT,
  };
}

export function createGoogleDriveOAuthClient() {
  const clientId = cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_CLIENT_ID);
  const clientSecret = cleanGoogleDriveEnv(
    process.env.GOOGLE_DRIVE_CLIENT_SECRET
  );
  const refreshToken = cleanGoogleDriveEnv(
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  );
  const redirectUri =
    cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_REDIRECT_URI) ||
    GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

export function getInvalidGrantHelp(redirectUri: string) {
  return [
    "invalid_grant: Google rejected the refresh token.",
    "1) Google Cloud Console → APIs & Services → Credentials → your OAuth client.",
    `2) Authorized redirect URI must include exactly: ${redirectUri}`,
    `3) Open https://developers.google.com/oauthplayground → gear icon → Use your own OAuth credentials → paste Client ID + Secret.`,
    `4) Step 1: select scope ${GOOGLE_DRIVE_SCOPE} → Authorize with the SAME Gmail that owns the Drive folder.`,
    "5) Step 2: Exchange authorization code for tokens → copy the new Refresh token (not access token).",
    "6) Vercel → Project → Settings → Environment Variables: update GOOGLE_DRIVE_REFRESH_TOKEN (no quotes). Redeploy.",
    "7) Client ID + Secret in Vercel must be the SAME pair used in OAuth Playground.",
    "If the OAuth app is in Testing mode, refresh tokens expire after 7 days — publish the app or re-issue the token.",
  ].join(" ");
}

export function formatGoogleDriveOAuthError(error: any, redirectUri?: string) {
  const uri =
    redirectUri ||
    cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_REDIRECT_URI) ||
    GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT;

  const apiMessage =
    error?.response?.data?.error_description ||
    error?.response?.data?.error ||
    error?.errors?.[0]?.message ||
    error?.message ||
    "Google Drive authentication failed.";

  const normalized = String(apiMessage).toLowerCase();

  if (normalized.includes("invalid_grant")) {
    return getInvalidGrantHelp(uri);
  }

  if (normalized.includes("insufficient") || error?.code === 403) {
    return `${apiMessage} — Share folder GOOGLE_DRIVE_CONTRACTS_FOLDER_ID with Editor access for the OAuth Gmail account. Scope: ${GOOGLE_DRIVE_SCOPE}`;
  }

  return String(apiMessage);
}

export async function verifyGoogleDriveOAuth(): Promise<{
  ok: boolean;
  error?: string;
  hint?: string;
  redirectUri: string;
  tokenType?: string;
  expiryDate?: number | null;
}> {
  const redirectUri =
    cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_REDIRECT_URI) ||
    GOOGLE_DRIVE_OAUTH_PLAYGROUND_REDIRECT;

  const oauth2Client = createGoogleDriveOAuthClient();

  if (!oauth2Client) {
    return {
      ok: false,
      redirectUri,
      error: "Missing GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, or GOOGLE_DRIVE_REFRESH_TOKEN.",
      hint: "Set all three in Vercel (Production) and redeploy.",
    };
  }

  try {
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      return {
        ok: false,
        redirectUri,
        error: "OAuth returned no access token.",
        hint: getInvalidGrantHelp(redirectUri),
      };
    }

    const credentials = oauth2Client.credentials;

    return {
      ok: true,
      redirectUri,
      tokenType: credentials.token_type || undefined,
      expiryDate: credentials.expiry_date ?? null,
    };
  } catch (error: any) {
    return {
      ok: false,
      redirectUri,
      error: formatGoogleDriveOAuthError(error, redirectUri),
      hint: getInvalidGrantHelp(redirectUri),
    };
  }
}
