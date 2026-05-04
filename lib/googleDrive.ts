import { google } from "googleapis";
import { Readable } from "stream";

const CONTRACTS_FOLDER_NAME = "NEXA RENTALS CONTRACTS";

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

function getGooglePrivateKey() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!privateKey) return "";

  return privateKey.replace(/\\n/g, "\n");
}

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = getGooglePrivateKey();

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({
    version: "v3",
    auth,
  });
}

async function findOrCreateContractsFolder() {
  const drive = getDriveClient();

  if (!drive) {
    return null;
  }

  const envFolderId = process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID;

  if (envFolderId && envFolderId.trim()) {
    return envFolderId.trim();
  }

  const existingFolder = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${CONTRACTS_FOLDER_NAME}' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  const foundFolder = existingFolder.data.files?.[0];

  if (foundFolder?.id) {
    return foundFolder.id;
  }

  const createdFolder = await drive.files.create({
    requestBody: {
      name: CONTRACTS_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return createdFolder.data.id || null;
}

export async function uploadContractPdfToGoogleDrive({
  fileName,
  pdfBuffer,
}: {
  fileName: string;
  pdfBuffer: Buffer;
}) {
  const drive = getDriveClient();

  if (!drive) {
    return {
      uploaded: false,
      skipped: true,
      reason:
        "Google Drive env vars are missing. PDF generated, but Drive upload skipped.",
      fileId: null,
      webViewLink: null,
      folderId: null,
    };
  }

  const folderId = await findOrCreateContractsFolder();

  if (!folderId) {
    throw new Error("Google Drive contracts folder could not be found or created.");
  }

  const uploadedFile = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: "application/pdf",
      parents: [folderId],
    },
    media: {
      mimeType: "application/pdf",
      body: bufferToStream(pdfBuffer),
    },
    fields: "id, name, webViewLink, webContentLink",
  });

  if (uploadedFile.data.id) {
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  }

  return {
    uploaded: true,
    skipped: false,
    reason: null,
    fileId: uploadedFile.data.id || null,
    webViewLink: uploadedFile.data.webViewLink || null,
    webContentLink: uploadedFile.data.webContentLink || null,
    folderId,
  };
}