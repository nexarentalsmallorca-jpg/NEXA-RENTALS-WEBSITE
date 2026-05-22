import { google } from "googleapis";
import { Readable } from "stream";
import {
  cleanGoogleDriveEnv,
  createGoogleDriveOAuthClient,
  formatGoogleDriveOAuthError,
  verifyGoogleDriveOAuth,
} from "@/lib/googleDriveOAuth";

type UploadContractPdfParams = {
  fileName: string;
  pdfBuffer: Buffer;

  folderName?: string;
  customerFolderName?: string;
  customerName?: string;
  contractDate?: string;
  contractNumber?: string;
  vehicleCode?: string;
  vehiclePlate?: string;
};

type DriveFolderResult = {
  id: string | null;
  name: string;
  webViewLink: string | null;
  existed: boolean;
};

type DriveParentContext = {
  id: string;
  name: string;
  driveId: string | null;
  isSharedDrive: boolean;
};

const DRIVE_LIST_DEFAULTS = {
  spaces: "drive" as const,
  supportsAllDrives: true,
  includeItemsFromAllDrives: true,
};

function formatDriveApiError(error: any) {
  return formatGoogleDriveOAuthError(error);
}

async function getDriveParentContext(
  drive: any,
  parentFolderId: string
): Promise<DriveParentContext> {
  const meta = await drive.files.get({
    fileId: parentFolderId,
    fields: "id, name, driveId, capabilities",
    supportsAllDrives: true,
  });

  const canAddChildren = meta.data.capabilities?.canAddChildren;

  if (canAddChildren === false) {
    throw new Error(
      `Google Drive folder "${meta.data.name || parentFolderId}" does not allow creating files. Share it with Editor access for the OAuth Google account.`
    );
  }

  return {
    id: meta.data.id || parentFolderId,
    name: meta.data.name || "Contracts",
    driveId: meta.data.driveId || null,
    isSharedDrive: Boolean(meta.data.driveId),
  };
}

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function sanitizeDriveName(name: string) {
  const clean = cleanText(name || "NEXA_CONTRACT")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, "-")
    .replace(/[^a-zA-Z0-9-_ .]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/-+/g, "-")
    .replace(/^[-_.\s]+|[-_.\s]+$/g, "")
    .slice(0, 150);

  return clean || "NEXA_CONTRACT";
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function ensurePdfFileName(fileName: string) {
  const safeName = sanitizeDriveName(fileName.replace(/\.pdf$/i, ""));
  return `${safeName}.pdf`;
}

export function getCustomerFolderNameFromFileName(fileName: string) {
  const withoutPdf = fileName.replace(/\.pdf$/i, "");
  return sanitizeDriveName(withoutPdf || "NEXA_CUSTOMER_CONTRACT");
}

function getContractsParentFolderCandidates(): string[] {
  const fromEnv = cleanText(process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_NAME);

  const defaults = [
    "NEXA Rentals Contract",
    "NEXA Rentals Contracts",
    "NEXA_Rentals_Contract",
    "NEXA_Rentals_Contracts",
  ];

  return Array.from(
    new Set([fromEnv, ...defaults].filter(Boolean) as string[])
  );
}

function getFolderNameSearchVariants(folderName: string) {
  const raw = cleanText(folderName);
  const sanitized = sanitizeDriveName(raw);

  return Array.from(
    new Set(
      [raw, sanitized, raw.replace(/_/g, " "), sanitized.replace(/_/g, " ")].filter(
        Boolean
      )
    )
  );
}

function createFinalCustomerFolderName({
  fileName,
  folderName,
  customerFolderName,
  customerName,
  contractDate,
  contractNumber,
  vehicleCode,
  vehiclePlate,
}: {
  fileName: string;
  folderName?: string;
  customerFolderName?: string;
  customerName?: string;
  contractDate?: string;
  contractNumber?: string;
  vehicleCode?: string;
  vehiclePlate?: string;
}) {
  const directFolderName = cleanText(customerFolderName || folderName);

  if (directFolderName) {
    return sanitizeDriveName(directFolderName);
  }

  const parts = [
    cleanText(contractDate),
    cleanText(contractNumber),
    cleanText(customerName),
    cleanText(vehicleCode),
    cleanText(vehiclePlate),
  ].filter(Boolean);

  if (parts.length > 0) {
    return sanitizeDriveName(parts.join("_"));
  }

  return getCustomerFolderNameFromFileName(fileName);
}

function getOAuthDriveClient() {
  const clientId = cleanGoogleDriveEnv(process.env.GOOGLE_DRIVE_CLIENT_ID);
  const clientSecret = cleanGoogleDriveEnv(
    process.env.GOOGLE_DRIVE_CLIENT_SECRET
  );
  const refreshToken = cleanGoogleDriveEnv(
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  );

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

  const oauth2Client = createGoogleDriveOAuthClient();

  if (!oauth2Client) {
    return null;
  }

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

async function findFolderByNameGlobally({
  drive,
  folderName,
}: {
  drive: any;
  folderName: string;
}): Promise<DriveFolderResult | null> {
  const variants = getFolderNameSearchVariants(folderName);

  for (const variant of variants) {
    const query = [
      `name = '${escapeDriveQueryValue(variant)}'`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      "trashed = false",
    ].join(" and ");

    const result = await drive.files.list({
      q: query,
      fields: "files(id, name, webViewLink)",
      corpora: "allDrives",
      pageSize: 5,
      ...DRIVE_LIST_DEFAULTS,
    });

    const folder = result.data.files?.[0];

    if (folder?.id) {
      return {
        id: folder.id,
        name: folder.name || variant,
        webViewLink: folder.webViewLink || null,
        existed: true,
      };
    }
  }

  return null;
}

async function findFolderInGoogleDrive({
  drive,
  parentFolderId,
  folderName,
}: {
  drive: any;
  parentFolderId: string;
  folderName: string;
}): Promise<DriveFolderResult | null> {
  const safeFolderName = sanitizeDriveName(folderName);

  const query = [
    `name = '${escapeDriveQueryValue(safeFolderName)}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `'${escapeDriveQueryValue(parentFolderId)}' in parents`,
    "trashed = false",
  ].join(" and ");

  const result = await drive.files.list({
    q: query,
    fields: "files(id, name, webViewLink)",
    corpora: "allDrives",
    pageSize: 1,
    ...DRIVE_LIST_DEFAULTS,
  });

  const folder = result.data.files?.[0];

  if (!folder?.id) return null;

  return {
    id: folder.id,
    name: folder.name || safeFolderName,
    webViewLink: folder.webViewLink || null,
    existed: true,
  };
}

async function findCustomerFolderInParent({
  drive,
  parentFolderId,
  folderName,
}: {
  drive: any;
  parentFolderId: string;
  folderName: string;
}): Promise<DriveFolderResult | null> {
  const variants = getFolderNameSearchVariants(folderName);

  for (const variant of variants) {
    const found = await findFolderInGoogleDrive({
      drive,
      parentFolderId,
      folderName: variant,
    });

    if (found?.id) return found;
  }

  return null;
}

async function createFolderInGoogleDrive({
  drive,
  parentFolderId,
  folderName,
  parentContext,
}: {
  drive: any;
  parentFolderId: string;
  folderName: string;
  parentContext?: DriveParentContext | null;
}): Promise<DriveFolderResult> {
  const safeFolderName = sanitizeDriveName(folderName);

  const existingFolder = await findCustomerFolderInParent({
    drive,
    parentFolderId,
    folderName: safeFolderName,
  });

  if (existingFolder?.id) {
    console.log("✅ Existing Google Drive folder found:", {
      folderId: existingFolder.id,
      folderName: existingFolder.name,
      folderLink: existingFolder.webViewLink,
      parentFolderId,
    });

    return existingFolder;
  }

  console.log("📁 Creating Google Drive folder:", {
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
    enforceSingleParent: true,
  });

  console.log("✅ Google Drive folder created:", {
    folderId: createdFolder.data.id,
    folderName: createdFolder.data.name,
    folderLink: createdFolder.data.webViewLink,
    parentFolderId,
  });

  return {
    id: createdFolder.data.id || null,
    name: createdFolder.data.name || safeFolderName,
    webViewLink: createdFolder.data.webViewLink || null,
    existed: false,
  };
}

async function getOrCreateContractsParentFolder({
  drive,
  configuredParentFolderId,
}: {
  drive: any;
  configuredParentFolderId?: string | null;
}) {
  const cleanConfiguredId = cleanText(configuredParentFolderId);

  if (cleanConfiguredId) {
    const parentContext = await getDriveParentContext(drive, cleanConfiguredId);

    console.log("✅ Using configured Google Drive parent folder:", {
      parentFolderId: parentContext.id,
      parentFolderName: parentContext.name,
      driveId: parentContext.driveId,
      isSharedDrive: parentContext.isSharedDrive,
    });

    return parentContext.id;
  }

  const candidates = getContractsParentFolderCandidates();

  console.log(
    "⚠️ GOOGLE_DRIVE_CONTRACTS_FOLDER_ID missing. Searching for parent folder:",
    { candidates }
  );

  for (const candidate of candidates) {
    const existingGlobal = await findFolderByNameGlobally({
      drive,
      folderName: candidate,
    });

    if (existingGlobal?.id) {
      console.log("✅ Existing parent contracts folder found (global search):", {
        parentFolderId: existingGlobal.id,
        parentFolderName: existingGlobal.name,
        parentFolderLink: existingGlobal.webViewLink,
        searchedAs: candidate,
      });

      return existingGlobal.id;
    }

    const existingInRoot = await findFolderInGoogleDrive({
      drive,
      parentFolderId: "root",
      folderName: candidate,
    });

    if (existingInRoot?.id) {
      console.log("✅ Existing parent contracts folder found (root):", {
        parentFolderId: existingInRoot.id,
        parentFolderName: existingInRoot.name,
        parentFolderLink: existingInRoot.webViewLink,
        searchedAs: candidate,
      });

      return existingInRoot.id;
    }
  }

  const createName = sanitizeDriveName(candidates[0] || "NEXA_Rentals_Contracts");

  const createdFolder = await createFolderInGoogleDrive({
    drive,
    parentFolderId: "root",
    folderName: createName,
  });

  if (!createdFolder.id) {
    throw new Error("Google Drive contracts parent folder could not be created.");
  }

  console.log("✅ Parent contracts folder created:", {
    parentFolderId: createdFolder.id,
    parentFolderName: createdFolder.name,
    parentFolderLink: createdFolder.webViewLink,
  });

  return createdFolder.id;
}

async function findExistingPdfInFolder({
  drive,
  folderId,
  fileName,
}: {
  drive: any;
  folderId: string;
  fileName: string;
}) {
  const safeFileName = ensurePdfFileName(fileName);

  const query = [
    `name = '${escapeDriveQueryValue(safeFileName)}'`,
    `'${escapeDriveQueryValue(folderId)}' in parents`,
    "mimeType = 'application/pdf'",
    "trashed = false",
  ].join(" and ");

  const result = await drive.files.list({
    q: query,
    fields: "files(id, name, webViewLink, webContentLink)",
    corpora: "allDrives",
    pageSize: 1,
    ...DRIVE_LIST_DEFAULTS,
  });

  return result.data.files?.[0] || null;
}

async function deleteExistingPdfIfFound({
  drive,
  folderId,
  fileName,
}: {
  drive: any;
  folderId: string;
  fileName: string;
}) {
  const existingFile = await findExistingPdfInFolder({
    drive,
    folderId,
    fileName,
  });

  if (!existingFile?.id) return null;

  await drive.files.delete({
    fileId: existingFile.id,
    supportsAllDrives: true,
  });

  console.log("🗑️ Old duplicate PDF deleted before uploading new version:", {
    fileId: existingFile.id,
    fileName: existingFile.name,
    folderId,
  });

  return existingFile;
}

export async function uploadContractPdfToGoogleDrive({
  fileName,
  pdfBuffer,
  folderName,
  customerFolderName,
  customerName,
  contractDate,
  contractNumber,
  vehicleCode,
  vehiclePlate,
}: UploadContractPdfParams) {
  console.log("📄 Starting Google Drive upload:", {
    fileName,
    pdfBufferSize: pdfBuffer?.length || 0,
    folderName,
    customerFolderName,
    customerName,
    contractDate,
    contractNumber,
    vehicleCode,
    vehiclePlate,
  });

  const oauthCheck = await verifyGoogleDriveOAuth();

  if (!oauthCheck.ok) {
    return {
      uploaded: false,
      skipped: false,
      failed: true,
      reason: oauthCheck.error || "Google Drive OAuth failed.",
      error: oauthCheck.error || "Google Drive OAuth failed.",
      fileId: null,
      fileName: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      folderName: null,
      folderWebViewLink: null,
      parentFolderId: null,
      debug: {
        oauth: oauthCheck,
      },
    };
  }

  const drive = getOAuthDriveClient();

  if (!drive) {
    return {
      uploaded: false,
      skipped: true,
      failed: false,
      reason:
        "Google Drive OAuth ENV vars are missing. Check GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET and GOOGLE_DRIVE_REFRESH_TOKEN.",
      fileId: null,
      fileName: null,
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

  if (!fileName || !cleanText(fileName)) {
    return {
      uploaded: false,
      skipped: false,
      failed: true,
      reason: "Missing PDF fileName.",
      error: "Missing PDF fileName.",
      fileId: null,
      fileName: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      folderName: null,
      folderWebViewLink: null,
      parentFolderId: null,
    };
  }

  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    return {
      uploaded: false,
      skipped: false,
      failed: true,
      reason: "Missing or empty PDF buffer.",
      error: "Missing or empty PDF buffer.",
      fileId: null,
      fileName: null,
      webViewLink: null,
      webContentLink: null,
      folderId: null,
      folderName: null,
      folderWebViewLink: null,
      parentFolderId: null,
    };
  }

  let parentFolderId: string | null = null;

  try {
    parentFolderId = await getOrCreateContractsParentFolder({
      drive,
      configuredParentFolderId: process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID,
    });

    if (!parentFolderId) {
      throw new Error("Google Drive parent folder ID is missing or invalid.");
    }

    const parentContext = await getDriveParentContext(drive, parentFolderId);

    const safeFileName = ensurePdfFileName(fileName);

    // Subfolder name matches the PDF file name (without .pdf), per NEXA workflow.
    const finalCustomerFolderName =
      getCustomerFolderNameFromFileName(safeFileName) ||
      createFinalCustomerFolderName({
        fileName,
        folderName,
        customerFolderName,
        customerName,
        contractDate,
        contractNumber,
        vehicleCode,
        vehiclePlate,
      });

    console.log("✅ Google Drive upload names prepared:", {
      parentFolderId: parentContext.id,
      parentFolderName: parentContext.name,
      isSharedDrive: parentContext.isSharedDrive,
      safeFileName,
      finalCustomerFolderName,
    });

    const customerFolder = await createFolderInGoogleDrive({
      drive,
      parentFolderId: parentContext.id,
      folderName: finalCustomerFolderName,
      parentContext,
    });

    if (!customerFolder.id) {
      throw new Error("Customer Google Drive folder was not created correctly.");
    }

    await deleteExistingPdfIfFound({
      drive,
      folderId: customerFolder.id,
      fileName: safeFileName,
    });

    let uploadedFile: any = null;
    let lastUploadError: any = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        uploadedFile = await drive.files.create({
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
          enforceSingleParent: true,
        });
        lastUploadError = null;
        break;
      } catch (uploadError: any) {
        lastUploadError = uploadError;
        const retryable =
          uploadError?.code === 503 ||
          uploadError?.code === 429 ||
          uploadError?.status === 503;

        console.warn("⚠️ Google Drive PDF upload attempt failed:", {
          attempt,
          message: uploadError?.message,
          code: uploadError?.code,
          retryable,
        });

        if (!retryable || attempt === 2) {
          throw uploadError;
        }
      }
    }

    if (!uploadedFile?.data?.id) {
      throw lastUploadError || new Error("Google Drive PDF upload returned no file id.");
    }

    console.log("✅ PDF uploaded inside customer Google Drive folder:", {
      fileId: uploadedFile.data.id,
      fileName: uploadedFile.data.name,
      webViewLink: uploadedFile.data.webViewLink,
      webContentLink: uploadedFile.data.webContentLink,
      customerFolderId: customerFolder.id,
      customerFolderName: customerFolder.name,
      customerFolderLink: customerFolder.webViewLink,
      customerFolderExisted: customerFolder.existed,
    });

    return {
      uploaded: true,
      skipped: false,
      failed: false,
      reason: null,

      fileId: uploadedFile.data.id || null,
      fileName: uploadedFile.data.name || safeFileName,
      webViewLink: uploadedFile.data.webViewLink || null,
      webContentLink: uploadedFile.data.webContentLink || null,

      folderId: customerFolder.id,
      folderName: customerFolder.name,
      folderWebViewLink: customerFolder.webViewLink,
      folderExisted: customerFolder.existed,

      customerFolderName: customerFolder.name,
      customerFolderId: customerFolder.id,
      customerFolderWebViewLink: customerFolder.webViewLink,

      parentFolderId,
    };
  } catch (error: any) {
    console.error("❌ Google Drive upload failed:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      errors: error?.errors,
      responseData: error?.response?.data,
      parentFolderId,
    });

    return {
      uploaded: false,
      skipped: false,
      failed: true,
      reason: formatDriveApiError(error),
      error: formatDriveApiError(error),

      fileId: null,
      fileName: null,
      webViewLink: null,
      webContentLink: null,

      folderId: null,
      folderName:
        customerFolderName ||
        folderName ||
        getCustomerFolderNameFromFileName(fileName),
      folderWebViewLink: null,

      parentFolderId,
      debug: {
        code: error?.code,
        status: error?.status,
        responseData: error?.response?.data,
      },
    };
  }
}