import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { uploadContractPdfToGoogleDrive } from "@/lib/googleDrive";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "booking-documents";
const SESSION_TABLE =
  "document_verification_sessions";

const MAX_IMAGE_BYTES =
  8 * 1024 * 1024;

const MAX_CONTRACT_BYTES =
  12 * 1024 * 1024;

const MAX_TOTAL_BYTES =
  28 * 1024 * 1024;

type IdentityType =
  | "id"
  | "passport";

type UploadKey =
  | "dlFront"
  | "dlBack"
  | "idFront"
  | "idBack"
  | "contractPdf";

type UploadResult = {
  path: string;
  name: string;
};

type PreparedUpload = {
  buffer: Buffer;
  contentType: string;
  safeName: string;
};

type GoogleDriveResult = {
  uploaded?: boolean;
  skipped?: boolean;
  failed?: boolean;

  reason?: string | null;

  fileId?: string | null;
  fileName?: string | null;

  webViewLink?: string | null;
  webContentLink?: string | null;

  folderId?: string | null;
  folderName?: string | null;
  folderWebViewLink?: string | null;
  parentFolderId?: string | null;

  [key: string]: unknown;
};

type DocumentUploadData = {
  driverIndex: number;
  identityType: IdentityType;

  dlFrontPath: string;
  dlBackPath: string;
  idFrontPath: string;
  idBackPath: string;

  dlFrontName: string;
  dlBackName: string;
  idFrontName: string;
  idBackName: string;

  uploadedAt: string;
};

class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(
      message
    );

    this.name =
      "ApiError";

    this.status =
      status;
  }
}

function cleanText(
  value:
    | FormDataEntryValue
    | null
    | unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function getTextField(
  formData: FormData,
  key: string,
  maxLength = 250
) {
  return cleanText(
    formData.get(
      key
    )
  ).slice(
    0,
    maxLength
  );
}

function sanitizeFileName(
  value: string
) {
  const sanitized =
    String(
      value ||
      "file"
    )
      .normalize(
        "NFKD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-zA-Z0-9._-]+/g,
        "_"
      )
      .replace(
        /_+/g,
        "_"
      )
      .replace(
        /^\.+/,
        ""
      )
      .slice(
        0,
        180
      );

  return (
    !sanitized ||
    sanitized ===
      "." ||
    sanitized ===
      ".."
  )
    ? "file"
    : sanitized;
}

function withExtension(
  originalName: string,
  fallbackStem: string,
  extension: string
) {
  const safeName =
    sanitizeFileName(
      originalName ||
      fallbackStem
    );

  const stem =
    safeName.replace(
      /\.[^.]*$/,
      ""
    ) ||
    fallbackStem;

  return `${stem.slice(
    0,
    160
  )}.${extension}`;
}

function validateBookingId(
  value: string
) {
  if (
    !value ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(
      value
    )
  ) {
    throw new ApiError(
      "Invalid bookingId.",
      400
    );
  }

  return value;
}

function isUploadFile(
  value:
    FormDataEntryValue | null
): value is File {
  return value instanceof
    File;
}

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function getOptionalFile(
  formData: FormData,
  key: string
) {
  const value =
    formData.get(
      key
    );

  if (
    value ===
    null
  ) {
    return null;
  }

  if (
    !isUploadFile(
      value
    )
  ) {
    throw new ApiError(
      `${key} must be a file.`,
      400
    );
  }

  if (
    value.size <=
    0
  ) {
    throw new ApiError(
      `${key} is empty.`,
      400
    );
  }

  return value;
}

function getContractFile(
  formData: FormData
) {
  const possibleKeys = [
    "contractPdf",
    "contract",
    "pdf",
    "file",
  ];

  for (
    const key of
    possibleKeys
  ) {
    const value =
      formData.get(
        key
      );

    if (
      value ===
      null
    ) {
      continue;
    }

    if (
      isUploadFile(
        value
      )
    ) {
      if (
        value.size <=
        0
      ) {
        throw new ApiError(
          "The contract PDF is empty.",
          400
        );
      }

      return value;
    }

    if (
      cleanText(
        value
      )
    ) {
      throw new ApiError(
        `${key} must be a PDF file.`,
        400
      );
    }
  }

  return null;
}

function detectImageType(
  buffer: Buffer
) {
  if (
    buffer.length >=
      3 &&
    buffer[0] ===
      0xff &&
    buffer[1] ===
      0xd8 &&
    buffer[2] ===
      0xff
  ) {
    return {
      contentType:
        "image/jpeg",

      extension:
        "jpg",
    };
  }

  if (
    buffer.length >=
      8 &&
    buffer[0] ===
      0x89 &&
    buffer[1] ===
      0x50 &&
    buffer[2] ===
      0x4e &&
    buffer[3] ===
      0x47 &&
    buffer[4] ===
      0x0d &&
    buffer[5] ===
      0x0a &&
    buffer[6] ===
      0x1a &&
    buffer[7] ===
      0x0a
  ) {
    return {
      contentType:
        "image/png",

      extension:
        "png",
    };
  }

  if (
    buffer.length >=
      12 &&
    buffer
      .subarray(
        0,
        4
      )
      .toString(
        "ascii"
      ) ===
      "RIFF" &&
    buffer
      .subarray(
        8,
        12
      )
      .toString(
        "ascii"
      ) ===
      "WEBP"
  ) {
    return {
      contentType:
        "image/webp",

      extension:
        "webp",
    };
  }

  if (
    buffer.length >=
    6
  ) {
    const signature =
      buffer
        .subarray(
          0,
          6
        )
        .toString(
          "ascii"
        );

    if (
      signature ===
        "GIF87a" ||
      signature ===
        "GIF89a"
    ) {
      return {
        contentType:
          "image/gif",

        extension:
          "gif",
      };
    }
  }

  return null;
}

async function prepareImage(
  file: File,
  label: string,
  fallbackStem: string
): Promise<PreparedUpload> {
  if (
    file.size >
    MAX_IMAGE_BYTES
  ) {
    throw new ApiError(
      `${label} must be smaller than 8 MB.`,
      400
    );
  }

  const buffer =
    Buffer.from(
      await file.arrayBuffer()
    );

  const detected =
    detectImageType(
      buffer
    );

  if (
    !detected
  ) {
    throw new ApiError(
      `${label} must be a real JPEG, PNG, WEBP, or GIF image.`,
      400
    );
  }

  return {
    buffer,

    contentType:
      detected.contentType,

    safeName:
      withExtension(
        file.name,
        fallbackStem,
        detected.extension
      ),
  };
}

async function preparePdf(
  file: File
): Promise<PreparedUpload> {
  if (
    file.size >
    MAX_CONTRACT_BYTES
  ) {
    throw new ApiError(
      "The contract PDF must be smaller than 12 MB.",
      400
    );
  }

  const buffer =
    Buffer.from(
      await file.arrayBuffer()
    );

  if (
    buffer.length <
      5 ||
    buffer
      .subarray(
        0,
        5
      )
      .toString(
        "ascii"
      ) !==
      "%PDF-"
  ) {
    throw new ApiError(
      "The contract must be a valid PDF file.",
      400
    );
  }

  return {
    buffer,

    contentType:
      "application/pdf",

    safeName:
      withExtension(
        file.name,
        "contract",
        "pdf"
      ),
  };
}

async function validateVerificationSession(
  supabase:
    SupabaseClient,
  sessionToken:
    string,
  bookingId:
    string
) {
  if (
    !sessionToken ||
    sessionToken.length <
      16 ||
    sessionToken.length >
      512
  ) {
    throw new ApiError(
      "Missing or invalid verification session.",
      400
    );
  }

  const {
    data:
      session,
    error,
  } =
    await supabase
      .from(
        SESSION_TABLE
      )
      .select(
        "session_token,booking_id,status,expires_at,licence_data"
      )
      .eq(
        "session_token",
        sessionToken
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "DOCUMENT UPLOAD SESSION LOOKUP ERROR:",
      error.message
    );

    throw new ApiError(
      "The verification session could not be validated.",
      500
    );
  }

  if (
    !session
  ) {
    throw new ApiError(
      "Verification session not found.",
      404
    );
  }

  if (
    String(
      session.booking_id ||
      ""
    ) !==
    bookingId
  ) {
    throw new ApiError(
      "The verification session does not belong to this booking.",
      403
    );
  }

  const expiresAt =
    new Date(
      session.expires_at
    ).getTime();

  if (
    !Number.isFinite(
      expiresAt
    )
  ) {
    throw new ApiError(
      "The verification session has an invalid expiry date.",
      500
    );
  }

  if (
    expiresAt <=
    Date.now()
  ) {
    throw new ApiError(
      "Verification session expired.",
      410
    );
  }

  const status =
    String(
      session.status ||
      ""
    ).toLowerCase();

  if (
    [
      "failed",
      "expired",
      "cancelled",
      "rejected",
    ].includes(
      status
    )
  ) {
    throw new ApiError(
      "Verification session is no longer active.",
      409
    );
  }

  const driverIndex =
    Math.min(
      15,
      Math.max(
        1,
        Number(
          session
            .licence_data
            ?.driverProfile
            ?.driverIndex
        ) ||
          1
      )
    );

  return {
    ...session,

    driverIndex,
  };
}

async function uploadPreparedFile(
  supabase:
    SupabaseClient,
  folder:
    string,
  label:
    string,
  prepared:
    PreparedUpload
): Promise<UploadResult> {
  const path =
    `${folder}/` +
    `${label}-` +
    `${Date.now()}-` +
    `${randomUUID()}-` +
    `${prepared.safeName}`;

  const {
    error,
  } =
    await supabase
      .storage
      .from(
        BUCKET
      )
      .upload(
        path,
        prepared.buffer,
        {
          contentType:
            prepared.contentType,

          upsert:
            false,

          cacheControl:
            "3600",
        }
      );

  if (
    error
  ) {
    console.error(
      "SUPABASE DOCUMENT UPLOAD ERROR:",
      {
        label,

        message:
          error.message,
      }
    );

    throw new ApiError(
      `${label} could not be stored securely.`,
      502
    );
  }

  return {
    path,

    name:
      prepared.safeName,
  };
}

async function removePartialUploads(
  supabase:
    SupabaseClient,
  paths:
    string[]
) {
  if (
    !paths.length
  ) {
    return;
  }

  const {
    error,
  } =
    await supabase
      .storage
      .from(
        BUCKET
      )
      .remove(
        paths
      );

  if (
    error
  ) {
    console.error(
      "PARTIAL DOCUMENT CLEANUP ERROR:",
      error.message
    );
  }
}

function emptyUploadResult():
  UploadResult {
  return {
    path:
      "",

    name:
      "",
  };
}

/*
 * Save the secure document references inside the same
 * verification session that belongs to this driver.
 *
 * This allows the Stripe webhook to read every driver's
 * documents directly from Supabase instead of placing
 * private storage paths inside Stripe metadata.
 */
async function persistDocumentUpload(
  supabase:
    SupabaseClient,
  sessionToken:
    string,
  bookingId:
    string,
  driverIndex:
    number,
  identityType:
    IdentityType,
  existingLicenceData:
    unknown,
  upload:
    Omit<
      DocumentUploadData,
      | "driverIndex"
      | "identityType"
      | "uploadedAt"
    >
) {
  const currentLicenceData =
    isRecord(
      existingLicenceData
    )
      ? existingLicenceData
      : {};

  const currentDocumentUpload =
    isRecord(
      currentLicenceData
        .documentUpload
    )
      ? currentLicenceData
          .documentUpload
      : {};

  const documentUpload:
    DocumentUploadData = {
      ...currentDocumentUpload,

      driverIndex,
      identityType,

      dlFrontPath:
        upload.dlFrontPath,

      dlBackPath:
        upload.dlBackPath,

      idFrontPath:
        upload.idFrontPath,

      idBackPath:
        upload.idBackPath,

      dlFrontName:
        upload.dlFrontName,

      dlBackName:
        upload.dlBackName,

      idFrontName:
        upload.idFrontName,

      idBackName:
        upload.idBackName,

      uploadedAt:
        new Date()
          .toISOString(),
    };

  const nextLicenceData = {
    ...currentLicenceData,

    documentUpload,
  };

  const {
    data:
      updatedSession,
    error,
  } =
    await supabase
      .from(
        SESSION_TABLE
      )
      .update({
        licence_data:
          nextLicenceData,
      })
      .eq(
        "session_token",
        sessionToken
      )
      .eq(
        "booking_id",
        bookingId
      )
      .select(
        "session_token"
      )
      .maybeSingle();

  if (
    error
  ) {
    console.error(
      "DOCUMENT SESSION PATH SAVE ERROR:",
      error.message
    );

    throw new ApiError(
      "The documents were uploaded, but their secure references could not be saved.",
      500
    );
  }

  if (
    !updatedSession
  ) {
    throw new ApiError(
      "The verification session disappeared before the document references could be saved.",
      409
    );
  }
}

function initialGoogleDriveResult(
  reason:
    string
): GoogleDriveResult {
  return {
    uploaded:
      false,

    skipped:
      true,

    failed:
      false,

    reason,

    fileId:
      null,

    fileName:
      null,

    webViewLink:
      null,

    webContentLink:
      null,

    folderId:
      null,

    folderName:
      null,

    folderWebViewLink:
      null,

    parentFolderId:
      null,
  };
}

export async function POST(
  req: Request
) {
  try {
    const formData =
      await req.formData();

    const bookingId =
      validateBookingId(
        getTextField(
          formData,
          "bookingId",
          128
        )
      );

    const sessionToken =
      getTextField(
        formData,
        "sessionToken",
        512
      ) ||
      getTextField(
        formData,
        "verificationSessionToken",
        512
      );

    const verifiedSession =
      await validateVerificationSession(
        supabaseAdmin,
        sessionToken,
        bookingId
      );

    const driverFolder =
      `${bookingId}/` +
      `driver-${String(
        verifiedSession
          .driverIndex
      ).padStart(
        2,
        "0"
      )}`;

    const rawIdentityType =
      getTextField(
        formData,
        "identityType",
        20
      );

    const dlFrontFile =
      getOptionalFile(
        formData,
        "dlFront"
      );

    const dlBackFile =
      getOptionalFile(
        formData,
        "dlBack"
      );

    const idFrontFile =
      getOptionalFile(
        formData,
        "idFront"
      );

    const idBackFile =
      getOptionalFile(
        formData,
        "idBack"
      );

    const contractPdfFile =
      getContractFile(
        formData
      );

    const hasAnyDocuments =
      Boolean(
        dlFrontFile ||
        dlBackFile ||
        idFrontFile ||
        idBackFile
      );

    if (
      !hasAnyDocuments &&
      !contractPdfFile
    ) {
      throw new ApiError(
        "No document or contract files were provided.",
        400
      );
    }

    let identityType:
      IdentityType | null =
        null;

    if (
      hasAnyDocuments
    ) {
      if (
        rawIdentityType !==
          "id" &&
        rawIdentityType !==
          "passport"
      ) {
        throw new ApiError(
          "identityType must be id or passport.",
          400
        );
      }

      identityType =
        rawIdentityType;

      if (
        !dlFrontFile
      ) {
        throw new ApiError(
          "Driving licence front is missing.",
          400
        );
      }

      if (
        !dlBackFile
      ) {
        throw new ApiError(
          "Driving licence back is missing.",
          400
        );
      }

      if (
        !idFrontFile
      ) {
        throw new ApiError(
          identityType ===
          "passport"
            ? "Passport photo page is missing."
            : "Identity card front is missing.",
          400
        );
      }

      if (
        identityType ===
          "id" &&
        !idBackFile
      ) {
        throw new ApiError(
          "Identity card back is missing.",
          400
        );
      }
    }

    const allFiles = [
      dlFrontFile,
      dlBackFile,
      idFrontFile,
      idBackFile,
      contractPdfFile,
    ].filter(
      (
        file
      ): file is File =>
        Boolean(
          file
        )
    );

    const totalBytes =
      allFiles.reduce(
        (
          total,
          file
        ) =>
          total +
          file.size,
        0
      );

    if (
      totalBytes >
      MAX_TOTAL_BYTES
    ) {
      throw new ApiError(
        "The combined upload is too large.",
        400
      );
    }

    const preparedUploads:
      Array<{
        key:
          UploadKey;

        storageLabel:
          string;

        folder:
          string;

        prepared:
          PreparedUpload;
      }> = [];

    if (
      dlFrontFile
    ) {
      preparedUploads.push({
        key:
          "dlFront",

        storageLabel:
          "dl-front",

        folder:
          driverFolder,

        prepared:
          await prepareImage(
            dlFrontFile,
            "Driving licence front",
            "driving-licence-front"
          ),
      });
    }

    if (
      dlBackFile
    ) {
      preparedUploads.push({
        key:
          "dlBack",

        storageLabel:
          "dl-back",

        folder:
          driverFolder,

        prepared:
          await prepareImage(
            dlBackFile,
            "Driving licence back",
            "driving-licence-back"
          ),
      });
    }

    if (
      idFrontFile
    ) {
      preparedUploads.push({
        key:
          "idFront",

        storageLabel:
          identityType ===
          "passport"
            ? "passport"
            : "id-front",

        folder:
          driverFolder,

        prepared:
          await prepareImage(
            idFrontFile,

            identityType ===
              "passport"
              ? "Passport photo page"
              : "Identity card front",

            identityType ===
              "passport"
              ? "passport"
              : "identity-card-front"
          ),
      });
    }

    if (
      idBackFile
    ) {
      preparedUploads.push({
        key:
          "idBack",

        storageLabel:
          "id-back",

        folder:
          driverFolder,

        prepared:
          await prepareImage(
            idBackFile,
            "Identity card back",
            "identity-card-back"
          ),
      });
    }

    let preparedContract:
      PreparedUpload | null =
        null;

    if (
      contractPdfFile
    ) {
      preparedContract =
        await preparePdf(
          contractPdfFile
        );

      preparedUploads.push({
        key:
          "contractPdf",

        storageLabel:
          "contract",

        folder:
          bookingId,

        prepared:
          preparedContract,
      });
    }

    const settledUploads =
      await Promise.allSettled(
        preparedUploads.map(
          async (
            upload
          ) => ({
            key:
              upload.key,

            result:
              await uploadPreparedFile(
                supabaseAdmin,
                upload.folder,
                upload.storageLabel,
                upload.prepared
              ),
          })
        )
      );

    const successfulUploads =
      settledUploads
        .filter(
          (
            item
          ): item is PromiseFulfilledResult<{
            key:
              UploadKey;

            result:
              UploadResult;
          }> =>
            item.status ===
            "fulfilled"
        )
        .map(
          (
            item
          ) =>
            item.value
        );

    const failedUpload =
      settledUploads.find(
        (
          item
        ) =>
          item.status ===
          "rejected"
      );

    if (
      failedUpload
    ) {
      await removePartialUploads(
        supabaseAdmin,
        successfulUploads.map(
          (
            item
          ) =>
            item.result.path
        )
      );

      throw failedUpload.reason;
    }

    const resultMap =
      new Map<
        UploadKey,
        UploadResult
      >(
        successfulUploads.map(
          (
            item
          ) => [
            item.key,
            item.result,
          ]
        )
      );

    const dlFrontRes =
      resultMap.get(
        "dlFront"
      ) ||
      emptyUploadResult();

    const dlBackRes =
      resultMap.get(
        "dlBack"
      ) ||
      emptyUploadResult();

    const idFrontRes =
      resultMap.get(
        "idFront"
      ) ||
      emptyUploadResult();

    const idBackRes =
      resultMap.get(
        "idBack"
      ) ||
      emptyUploadResult();

    const contractSupabaseRes =
      resultMap.get(
        "contractPdf"
      ) ||
      emptyUploadResult();

    /*
     * Persist every driver's secure document references.
     *
     * If this database update fails, remove all files uploaded
     * during this request so the operation remains consistent.
     */
    if (
      hasAnyDocuments &&
      identityType
    ) {
      try {
        await persistDocumentUpload(
          supabaseAdmin,
          sessionToken,
          bookingId,
          verifiedSession
            .driverIndex,
          identityType,
          verifiedSession
            .licence_data,
          {
            dlFrontPath:
              dlFrontRes.path,

            dlBackPath:
              dlBackRes.path,

            idFrontPath:
              idFrontRes.path,

            idBackPath:
              idBackRes.path,

            dlFrontName:
              dlFrontRes.name,

            dlBackName:
              dlBackRes.name,

            idFrontName:
              idFrontRes.name,

            idBackName:
              idBackRes.name,
          }
        );
      } catch (
        sessionSaveError
      ) {
        await removePartialUploads(
          supabaseAdmin,
          successfulUploads.map(
            (
              item
            ) =>
              item.result.path
          )
        );

        throw sessionSaveError;
      }
    }

    let googleDriveContract =
      initialGoogleDriveResult(
        "No contract PDF file was sent to the upload API."
      );

    if (
      preparedContract
    ) {
      try {
        googleDriveContract =
          (
            await uploadContractPdfToGoogleDrive(
              {
                fileName:
                  preparedContract
                    .safeName,

                pdfBuffer:
                  preparedContract
                    .buffer,

                folderName:
                  getTextField(
                    formData,
                    "folderName",
                    180
                  ) ||
                  undefined,

                customerFolderName:
                  getTextField(
                    formData,
                    "customerFolderName",
                    180
                  ) ||
                  undefined,

                customerName:
                  getTextField(
                    formData,
                    "customerName",
                    180
                  ) ||
                  undefined,

                contractDate:
                  getTextField(
                    formData,
                    "contractDate",
                    50
                  ) ||
                  undefined,

                contractNumber:
                  getTextField(
                    formData,
                    "contractNumber",
                    120
                  ) ||
                  bookingId,

                vehicleCode:
                  getTextField(
                    formData,
                    "vehicleCode",
                    120
                  ) ||
                  undefined,

                vehiclePlate:
                  getTextField(
                    formData,
                    "vehiclePlate",
                    50
                  ) ||
                  undefined,
              }
            )
          ) as GoogleDriveResult;
      } catch (
        driveError: any
      ) {
        console.error(
          "GOOGLE DRIVE CONTRACT UPLOAD ERROR:",
          {
            message:
              driveError
                ?.message,
          }
        );

        googleDriveContract = {
          ...initialGoogleDriveResult(
            "The contract was saved securely, but the Google Drive copy could not be created."
          ),

          skipped:
            false,

          failed:
            true,
        };
      }
    }

    return NextResponse.json({
      success:
        true,

      driverIndex:
        verifiedSession
          .driverIndex,

      dlFrontPath:
        dlFrontRes.path,

      dlBackPath:
        dlBackRes.path,

      idFrontPath:
        idFrontRes.path,

      idBackPath:
        idBackRes.path,

      dlFrontName:
        dlFrontRes.name,

      dlBackName:
        dlBackRes.name,

      idFrontName:
        idFrontRes.name,

      idBackName:
        idBackRes.name,

      contractPdfPath:
        contractSupabaseRes.path,

      contractPdfName:
        contractSupabaseRes.name,

      googleDriveContractUploaded:
        Boolean(
          googleDriveContract
            ?.uploaded
        ),

      googleDriveContractSkipped:
        Boolean(
          googleDriveContract
            ?.skipped
        ),

      googleDriveContractFailed:
        Boolean(
          googleDriveContract
            ?.failed
        ),

      googleDriveContractReason:
        googleDriveContract
          ?.reason ||
        null,

      googleDriveFileId:
        googleDriveContract
          ?.fileId ||
        null,

      googleDriveFileName:
        googleDriveContract
          ?.fileName ||
        null,

      googleDriveFileLink:
        googleDriveContract
          ?.webViewLink ||
        null,

      googleDriveFileDownloadLink:
        googleDriveContract
          ?.webContentLink ||
        null,

      googleDriveFolderId:
        googleDriveContract
          ?.folderId ||
        null,

      googleDriveFolderName:
        googleDriveContract
          ?.folderName ||
        null,

      googleDriveFolderLink:
        googleDriveContract
          ?.folderWebViewLink ||
        null,

      googleDriveParentFolderId:
        googleDriveContract
          ?.parentFolderId ||
        null,

      googleDrive:
        googleDriveContract,
    });
  } catch (
    error: any
  ) {
    console.error(
      "UPLOAD BOOKING DOCUMENTS ERROR:",
      {
        message:
          error?.message,

        stack:
          error?.stack,
      }
    );

    const status =
      error instanceof
          ApiError
        ? error.status
        : 500;

    return NextResponse.json(
      {
        success:
          false,

        error:
          error?.message ||
          "Upload failed. Please try again.",
      },
      {
        status,
      }
    );
  }
}