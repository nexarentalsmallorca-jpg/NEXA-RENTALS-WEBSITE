import { google } from "googleapis";
import { Readable } from "stream";

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

function getOAuthDriveClient() {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

export async function uploadContractPdfToGoogleDrive({
  fileName,
  pdfBuffer,
}: {
  fileName: string;
  pdfBuffer: Buffer;
}) {
  const drive = getOAuthDriveClient();

  if (!drive) {
    return {
      uploaded: false,
      skipped: true,
      reason:
        "Google Drive OAuth ENV vars are missing. PDF generated, but Drive upload skipped.",
      fileId: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
    };
  }

  const folderId = process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID;

  if (!folderId || !folderId.trim()) {
    return {
      uploaded: false,
      skipped: true,
      reason: "GOOGLE_DRIVE_CONTRACTS_FOLDER_ID is missing.",
      fileId: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
    };
  }

  const uploadedFile = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "application/pdf",
      parents: [folderId.trim()],
    },
    media: {
      mimeType: "application/pdf",
      body: bufferToStream(pdfBuffer),
    },
    fields: "id, name, webViewLink, webContentLink",
    supportsAllDrives: true,
  });

  return {
    uploaded: true,
    skipped: false,
    reason: null,
    fileId: uploadedFile.data.id || null,
    webViewLink: uploadedFile.data.webViewLink || null,
    webContentLink: uploadedFile.data.webContentLink || null,
    folderId: folderId.trim(),
  };
}