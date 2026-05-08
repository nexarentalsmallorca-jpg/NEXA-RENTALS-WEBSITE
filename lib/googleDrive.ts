import { google } from "googleapis";
import { Readable } from "stream";

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

function sanitizeDriveName(name: string) {
  return String(name || "NEXA_CONTRACT")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

function getCustomerFolderNameFromFileName(fileName: string) {
  const withoutPdf = fileName.replace(/\.pdf$/i, "");
  return sanitizeDriveName(withoutPdf || "NEXA_CUSTOMER_CONTRACT");
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

async function createCustomerFolderInGoogleDrive({
  drive,
  parentFolderId,
  folderName,
}: {
  drive: any;
  parentFolderId: string;
  folderName: string;
}) {
  const safeFolderName = sanitizeDriveName(folderName);

  console.log("📁 Creating customer Google Drive folder:", {
    safeFolderName,
    parentFolderId,
  });

  const createdFolder = await drive.files.create({
    requestBody: {
      name: safeFolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    },
    fields: "id, name, webViewLink",
    supportsAllDrives: true,
  });

  console.log("✅ Customer folder created in Google Drive:", {
    folderId: createdFolder.data.id,
    folderName: createdFolder.data.name,
    folderLink: createdFolder.data.webViewLink,
  });

  return {
    id: createdFolder.data.id || null,
    name: createdFolder.data.name || safeFolderName,
    webViewLink: createdFolder.data.webViewLink || null,
  };
}

export async function uploadContractPdfToGoogleDrive({
  fileName,
  pdfBuffer,
  customerFolderName,
}: {
  fileName: string;
  pdfBuffer: Buffer;
  customerFolderName?: string;
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
      folderName: null,
      folderWebViewLink: null,
      parentFolderId: null,
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

  const parentFolderId = process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID;

  if (!parentFolderId || !parentFolderId.trim()) {
    console.error("❌ Missing Google Drive folder ID:", {
      GOOGLE_DRIVE_CONTRACTS_FOLDER_ID: Boolean(parentFolderId),
      GOOGLE_DRIVE_CONTRACTS_FOLDER_ID_LENGTH: parentFolderId?.length || 0,
    });

    return {
      uploaded: false,
      skipped: true,
      reason: "GOOGLE_DRIVE_CONTRACTS_FOLDER_ID is missing.",
      fileId: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      folderName: null,
      folderWebViewLink: null,
      parentFolderId: null,
      debug: {
        GOOGLE_DRIVE_CONTRACTS_FOLDER_ID: Boolean(parentFolderId),
      },
    };
  }

  console.log("✅ Google Drive main contracts folder ID loaded:", {
    GOOGLE_DRIVE_CONTRACTS_FOLDER_ID: true,
    GOOGLE_DRIVE_CONTRACTS_FOLDER_ID_LENGTH: parentFolderId.length,
  });

  try {
    const safeFileName = sanitizeDriveName(fileName).endsWith(".pdf")
      ? sanitizeDriveName(fileName)
      : `${sanitizeDriveName(fileName)}.pdf`;

    const finalCustomerFolderName =
      customerFolderName && customerFolderName.trim()
        ? sanitizeDriveName(customerFolderName)
        : getCustomerFolderNameFromFileName(fileName);

    const customerFolder = await createCustomerFolderInGoogleDrive({
      drive,
      parentFolderId: parentFolderId.trim(),
      folderName: finalCustomerFolderName,
    });

    if (!customerFolder.id) {
      throw new Error("Customer Google Drive folder was not created correctly.");
    }

    const uploadedFile = await drive.files.create({
      requestBody: {
        name: safeFileName,
        mimeType: "application/pdf",
        parents: [customerFolder.id],
      },
      media: {
        mimeType: "application/pdf",
        body: bufferToStream(pdfBuffer),
      },
      fields: "id, name, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    console.log("✅ PDF uploaded inside customer Google Drive folder:", {
      fileId: uploadedFile.data.id,
      fileName: uploadedFile.data.name,
      webViewLink: uploadedFile.data.webViewLink,
      customerFolderId: customerFolder.id,
      customerFolderName: customerFolder.name,
      customerFolderLink: customerFolder.webViewLink,
    });

    return {
      uploaded: true,
      skipped: false,
      reason: null,

      fileId: uploadedFile.data.id || null,
      webViewLink: uploadedFile.data.webViewLink || null,
      webContentLink: uploadedFile.data.webContentLink || null,

      folderId: customerFolder.id,
      folderName: customerFolder.name,
      folderWebViewLink: customerFolder.webViewLink,

      parentFolderId: parentFolderId.trim(),
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