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
    console.error("❌ Missing Google Drive OAuth ENV variables:", {
      GOOGLE_DRIVE_CLIENT_ID: Boolean(clientId),
      GOOGLE_DRIVE_CLIENT_SECRET: Boolean(clientSecret),
      GOOGLE_DRIVE_REFRESH_TOKEN: Boolean(refreshToken),
      GOOGLE_DRIVE_CLIENT_ID_LENGTH: clientId?.length || 0,
      GOOGLE_DRIVE_CLIENT_SECRET_LENGTH: clientSecret?.length || 0,
      GOOGLE_DRIVE_REFRESH_TOKEN_LENGTH: refreshToken?.length || 0,
    });

    return null;
  }

  console.log("✅ Google Drive OAuth ENV variables loaded:", {
    GOOGLE_DRIVE_CLIENT_ID: true,
    GOOGLE_DRIVE_CLIENT_SECRET: true,
    GOOGLE_DRIVE_REFRESH_TOKEN: true,
    GOOGLE_DRIVE_CLIENT_ID_LENGTH: clientId.length,
    GOOGLE_DRIVE_CLIENT_SECRET_LENGTH: clientSecret.length,
    GOOGLE_DRIVE_REFRESH_TOKEN_LENGTH: refreshToken.length,
  });

  const oauth2Client = new google.auth.OAuth2(
    clientId.trim(),
    clientSecret.trim(),
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken.trim(),
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
  console.log("📄 Starting Google Drive upload:", {
    fileName,
    pdfBufferSize: pdfBuffer.length,
  });

  const drive = getOAuthDriveClient();

  if (!drive) {
    return {
      uploaded: false,
      skipped: true,
      reason:
        "Google Drive OAuth ENV vars are missing. Check Vercel Logs for exact missing variable.",
      fileId: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      debug: {
        GOOGLE_DRIVE_CLIENT_ID: Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID),
        GOOGLE_DRIVE_CLIENT_SECRET: Boolean(
          process.env.GOOGLE_DRIVE_CLIENT_SECRET
        ),
        GOOGLE_DRIVE_REFRESH_TOKEN: Boolean(
          process.env.GOOGLE_DRIVE_REFRESH_TOKEN
        ),
      },
    };
  }

  const folderId = process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID;

  if (!folderId || !folderId.trim()) {
    console.error("❌ Missing Google Drive folder ID:", {
      GOOGLE_DRIVE_CONTRACTS_FOLDER_ID: Boolean(folderId),
      GOOGLE_DRIVE_CONTRACTS_FOLDER_ID_LENGTH: folderId?.length || 0,
    });

    return {
      uploaded: false,
      skipped: true,
      reason: "GOOGLE_DRIVE_CONTRACTS_FOLDER_ID is missing.",
      fileId: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      debug: {
        GOOGLE_DRIVE_CONTRACTS_FOLDER_ID: Boolean(folderId),
      },
    };
  }

  console.log("✅ Google Drive folder ID loaded:", {
    GOOGLE_DRIVE_CONTRACTS_FOLDER_ID: true,
    GOOGLE_DRIVE_CONTRACTS_FOLDER_ID_LENGTH: folderId.length,
  });

  try {
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

    console.log("✅ PDF uploaded to Google Drive:", {
      fileId: uploadedFile.data.id,
      fileName: uploadedFile.data.name,
      webViewLink: uploadedFile.data.webViewLink,
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
  } catch (error: any) {
    console.error("❌ Google Drive upload failed:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      errors: error?.errors,
      responseData: error?.response?.data,
    });

    throw error;
  }
}