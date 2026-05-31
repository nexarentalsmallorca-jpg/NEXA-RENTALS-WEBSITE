import { google } from "googleapis";
import { Readable } from "stream";

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

type GoogleRetryOptions = {
  label: string;
  maxAttempts?: number;
};

type DriveAny = any;

const DRIVE_LIST_DEFAULTS = {
  spaces: "drive",
  supportsAllDrives: true,
  includeItemsFromAllDrives: true,
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanEnv(value: unknown) {
  return cleanText(value)
    .replace(/^["']|["']$/g, "")
    .replace(/\r/g, "")
    .replace(/\n/g, "");
}

function maskValue(value: string | undefined | null) {
  const clean = cleanText(value);
  if (!clean) return null;
  if (clean.length <= 10) return `${clean.length} chars`;
  return `${clean.slice(0, 6)}...${clean.slice(-4)} (${clean.length} chars)`;
}

function isInvalidGrant(error: any) {
  const responseError = error?.response?.data?.error;
  const message = String(
    error?.response?.data?.error_description ||
      error?.response?.data?.error ||
      error?.message ||
      ""
  ).toLowerCase();

  return responseError === "invalid_grant" || message.includes("invalid_grant");
}

function isRetryableGoogleError(error: any) {
  const status = Number(error?.status || error?.code || error?.response?.status);

  return (
    status === 408 ||
    status === 409 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

function formatGoogleDriveError(error: any) {
  const status = Number(error?.status || error?.code || error?.response?.status);

  const googleError = error?.response?.data?.error;
  const googleDescription = error?.response?.data?.error_description;

  const message =
    googleDescription ||
    error?.response?.data?.error?.message ||
    googleError ||
    error?.errors?.[0]?.message ||
    error?.message ||
    "Unknown Google Drive error";

  if (isInvalidGrant(error)) {
    return [
      "Google OAuth refresh token is expired, revoked, or invalid.",
      "This is usually NOT a PDF bug.",
      "Fix: Google Cloud Console > OAuth consent screen must be In production, not Testing.",
      "Then regenerate GOOGLE_DRIVE_REFRESH_TOKEN using the same GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET that are saved in Vercel.",
      "After updating the token in Vercel, redeploy the website.",
      `Original error: ${message}`,
    ].join(" ");
  }

  if (status === 401) {
    return [
      "Unauthorized. Google rejected the OAuth credentials.",
      "Regenerate GOOGLE_DRIVE_REFRESH_TOKEN using the SAME Google Client ID and Client Secret that are in Vercel.",
      "Also redeploy Vercel after changing env variables.",
      `Original error: ${message}`,
    ].join(" ");
  }

  if (status === 403) {
    return [
      "Forbidden. The Google account/token does not have permission for this Drive folder, or the OAuth scope is too limited.",
      "Regenerate the token with scope https://www.googleapis.com/auth/drive and make sure the Google account has Editor access to the folder.",
      `Original error: ${message}`,
    ].join(" ");
  }

  if (status === 404) {
    return [
      "Google Drive folder or file not found.",
      "Check GOOGLE_DRIVE_CONTRACTS_FOLDER_ID and make sure the OAuth Google account can access that folder.",
      `Original error: ${message}`,
    ].join(" ");
  }

  return String(message || "Unknown Google Drive error");
}

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withGoogleRetry(
  action: () => Promise<any>,
  options: GoogleRetryOptions
): Promise<any> {
  const maxAttempts = options.maxAttempts || 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await action();
    } catch (error: any) {
      lastError = error;

      const retryable = isRetryableGoogleError(error);

      console.warn(`⚠️ Google Drive action failed: ${options.label}`, {
        attempt,
        maxAttempts,
        retryable,
        message: error?.message,
        code: error?.code,
        status: error?.status || error?.response?.status,
        responseData: error?.response?.data,
      });

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      await sleep(700 * attempt);
    }
  }

  throw lastError || new Error(`Google Drive action failed: ${options.label}`);
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
    "NextArinus_contract",
    "NextArinus_contracts",
    "NextArinus Contract",
    "NextArinus Contracts",
  ];

  return Array.from(new Set([fromEnv, ...defaults].filter(Boolean)));
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

async function createOAuthDriveClient(): Promise<DriveAny> {
  const clientId = cleanEnv(process.env.GOOGLE_DRIVE_CLIENT_ID);
  const clientSecret = cleanEnv(process.env.GOOGLE_DRIVE_CLIENT_SECRET);
  const refreshToken = cleanEnv(process.env.GOOGLE_DRIVE_REFRESH_TOKEN);

  console.log("🔐 Google Drive OAuth env check:", {
    GOOGLE_DRIVE_CLIENT_ID: Boolean(clientId),
    GOOGLE_DRIVE_CLIENT_SECRET: Boolean(clientSecret),
    GOOGLE_DRIVE_REFRESH_TOKEN: Boolean(refreshToken),
    GOOGLE_DRIVE_CLIENT_ID_MASKED: maskValue(clientId),
    GOOGLE_DRIVE_CLIENT_SECRET_MASKED: maskValue(clientSecret),
    GOOGLE_DRIVE_REFRESH_TOKEN_MASKED: maskValue(refreshToken),
  });

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google Drive OAuth env variables. Required: GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN."
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const tokenResponse = await oauth2Client.getAccessToken();

    if (!tokenResponse?.token) {
      throw new Error("Google OAuth did not return an access token.");
    }

    console.log("✅ Google Drive OAuth access token generated successfully.");
  } catch (error: any) {
    console.error("❌ Google OAuth token refresh failed:", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      responseData: error?.response?.data,
      invalidGrant: isInvalidGrant(error),
    });

    throw new Error(formatGoogleDriveError(error));
  }

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  }) as any;
}

async function driveFilesGet(drive: DriveAny, params: Record<string, any>) {
  return withGoogleRetry(
    () => (drive.files.get as any)(params),
    { label: "drive.files.get" }
  );
}

async function driveFilesList(
  drive: DriveAny,
  params: Record<string, any>,
  label: string
) {
  return withGoogleRetry(
    () => (drive.files.list as any)(params),
    { label }
  );
}

async function driveFilesCreate(
  drive: DriveAny,
  params: Record<string, any>,
  label: string,
  maxAttempts = 3
) {
  return withGoogleRetry(
    () => (drive.files.create as any)(params),
    { label, maxAttempts }
  );
}

async function driveFilesDelete(
  drive: DriveAny,
  params: Record<string, any>,
  label: string
) {
  return withGoogleRetry(
    () => (drive.files.delete as any)(params),
    { label }
  );
}

async function getDriveParentContext(
  drive: DriveAny,
  parentFolderId: string
): Promise<DriveParentContext> {
  const meta = await driveFilesGet(drive, {
    fileId: parentFolderId,
    fields: "id, name, driveId, capabilities",
    supportsAllDrives: true,
  });

  const canAddChildren = meta?.data?.capabilities?.canAddChildren;

  if (canAddChildren === false) {
    throw new Error(
      `Google Drive folder "${meta?.data?.name || parentFolderId}" does not allow creating files. Share it with Editor access for the OAuth Google account.`
    );
  }

  return {
    id: meta?.data?.id || parentFolderId,
    name: meta?.data?.name || "Contracts",
    driveId: meta?.data?.driveId || null,
    isSharedDrive: Boolean(meta?.data?.driveId),
  };
}

async function findFolderByNameGlobally({
  drive,
  folderName,
}: {
  drive: DriveAny;
  folderName: string;
}): Promise<DriveFolderResult | null> {
  const variants = getFolderNameSearchVariants(folderName);

  for (const variant of variants) {
    const query = [
      `name = '${escapeDriveQueryValue(variant)}'`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      "trashed = false",
    ].join(" and ");

    const result = await driveFilesList(
      drive,
      {
        q: query,
        fields: "files(id, name, webViewLink)",
        corpora: "allDrives",
        pageSize: 5,
        ...DRIVE_LIST_DEFAULTS,
      },
      `find folder globally: ${variant}`
    );

    const folder = result?.data?.files?.[0];

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
  drive: DriveAny;
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

  const result = await driveFilesList(
    drive,
    {
      q: query,
      fields: "files(id, name, webViewLink)",
      corpora: "allDrives",
      pageSize: 1,
      ...DRIVE_LIST_DEFAULTS,
    },
    `find folder in parent: ${safeFolderName}`
  );

  const folder = result?.data?.files?.[0];

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
  drive: DriveAny;
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
}: {
  drive: DriveAny;
  parentFolderId: string;
  folderName: string;
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

  const createdFolder = await driveFilesCreate(
    drive,
    {
      requestBody: {
        name: safeFolderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id, name, webViewLink",
      supportsAllDrives: true,
    },
    `create folder: ${safeFolderName}`
  );

  console.log("✅ Google Drive folder created:", {
    folderId: createdFolder?.data?.id,
    folderName: createdFolder?.data?.name,
    folderLink: createdFolder?.data?.webViewLink,
    parentFolderId,
  });

  return {
    id: createdFolder?.data?.id || null,
    name: createdFolder?.data?.name || safeFolderName,
    webViewLink: createdFolder?.data?.webViewLink || null,
    existed: false,
  };
}

async function getOrCreateContractsParentFolder({
  drive,
  configuredParentFolderId,
}: {
  drive: DriveAny;
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
      console.log("✅ Existing parent contracts folder found globally:", {
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
      console.log("✅ Existing parent contracts folder found in root:", {
        parentFolderId: existingInRoot.id,
        parentFolderName: existingInRoot.name,
        parentFolderLink: existingInRoot.webViewLink,
        searchedAs: candidate,
      });

      return existingInRoot.id;
    }
  }

  const createName = sanitizeDriveName(
    candidates[0] || "NEXA_Rentals_Contracts"
  );

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
  drive: DriveAny;
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

  const result = await driveFilesList(
    drive,
    {
      q: query,
      fields: "files(id, name, webViewLink, webContentLink)",
      corpora: "allDrives",
      pageSize: 1,
      ...DRIVE_LIST_DEFAULTS,
    },
    `find existing PDF: ${safeFileName}`
  );

  return result?.data?.files?.[0] || null;
}

async function deleteExistingPdfIfFound({
  drive,
  folderId,
  fileName,
}: {
  drive: DriveAny;
  folderId: string;
  fileName: string;
}) {
  const existingFile = await findExistingPdfInFolder({
    drive,
    folderId,
    fileName,
  });

  if (!existingFile?.id) return null;

  await driveFilesDelete(
    drive,
    {
      fileId: existingFile.id,
      supportsAllDrives: true,
    },
    `delete duplicate PDF: ${existingFile.name || existingFile.id}`
  );

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
    const drive = await createOAuthDriveClient();

    parentFolderId = await getOrCreateContractsParentFolder({
      drive,
      configuredParentFolderId: process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID,
    });

    if (!parentFolderId) {
      throw new Error("Google Drive parent folder ID is missing or invalid.");
    }

    const parentContext = await getDriveParentContext(drive, parentFolderId);
    const safeFileName = ensurePdfFileName(fileName);

    const finalCustomerFolderName = createFinalCustomerFolderName({
      fileName: safeFileName,
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
    });

    if (!customerFolder.id) {
      throw new Error("Customer Google Drive folder was not created correctly.");
    }

    await deleteExistingPdfIfFound({
      drive,
      folderId: customerFolder.id,
      fileName: safeFileName,
    });

    const uploadedFile = await driveFilesCreate(
      drive,
      {
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
      },
      `upload PDF: ${safeFileName}`,
      3
    );

    if (!uploadedFile?.data?.id) {
      throw new Error("Google Drive PDF upload returned no file id.");
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
      status: error?.status || error?.response?.status,
      errors: error?.errors,
      responseData: error?.response?.data,
      invalidGrant: isInvalidGrant(error),
      parentFolderId,
    });

    const readableError = formatGoogleDriveError(error);

    return {
      uploaded: false,
      skipped: false,
      failed: true,
      reason: readableError,
      error: readableError,

      fileId: null,
      fileName: null,
      webViewLink: null,
      webContentLink: null,

      folderId: null,
      folderName:
        customerFolderName ||
        folderName ||
        createFinalCustomerFolderName({
          fileName,
          customerName,
          contractDate,
          contractNumber,
          vehicleCode,
          vehiclePlate,
        }),
      folderWebViewLink: null,

      parentFolderId,
      debug: {
        code: error?.code,
        status: error?.status || error?.response?.status,
        responseData: error?.response?.data,
        invalidGrant: isInvalidGrant(error),
      },
    };
  }
}