"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type IdentityType =
  | "id"
  | "passport";

type StepKey =
  | "dlFront"
  | "dlBack"
  | "idFront"
  | "idBack";

type Stage =
  | "loading"
  | "camera"
  | "identity-choice"
  | "analyzing"
  | "decision"
  | "complete"
  | "error";

type SessionData = {
  success: boolean;

  bookingId?: string;

  status?:
    | "pending"
    | "scanning"
    | "completed"
    | "failed"
    | "expired"
    | "cancelled";

  error?: string;
};

type Analysis = {
  success: boolean;

  outcome:
    | "accepted"
    | "retake"
    | "manual_review"
    | "rejected";

  message: string;
  reasons: string[];

  retakeSides: StepKey[];

  licenceData: any;
  identityData: any;
  analysis: any;

  error?: string;
};

type Quality = {
  tone:
    | "good"
    | "warn"
    | "neutral";

  text: string;
};

const STEP_COPY: Record<
  StepKey,
  {
    eyebrow: string;
    title: string;
    instruction: string;
  }
> = {
  dlFront: {
    eyebrow:
      "Driving licence · Front",

    title:
      "Place the front inside the frame",

    instruction:
      "Keep all four corners visible. Avoid glare and hold the licence steady.",
  },

  dlBack: {
    eyebrow:
      "Driving licence · Back",

    title:
      "Now scan the back",

    instruction:
      "Turn the licence over and keep the complete card inside the frame.",
  },

  idFront: {
    eyebrow:
      "Identity document · Front",

    title:
      "Place the document inside the frame",

    instruction:
      "Show the complete photo page or the front of your ID card.",
  },

  idBack: {
    eyebrow:
      "Identity card · Back",

    title:
      "Now scan the back",

    instruction:
      "Keep every edge visible and make sure the small text is sharp.",
  },
};

function clean(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

function safeReturnUrl(
  raw: string
) {
  if (!raw) {
    return "";
  }

  try {
    const url = new URL(
      raw,
      window.location.origin
    );

    /*
     * Prevent external redirect URLs.
     */
    if (
      url.origin !==
      window.location.origin
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function isStep(
  value: unknown
): value is StepKey {
  return [
    "dlFront",
    "dlBack",
    "idFront",
    "idBack",
  ].includes(
    String(value)
  );
}

/*
 * Large native phone photos and HEIC-like
 * images are converted into a normal JPEG.
 */
async function normalizePhoto(
  file: File
) {
  if (
    file.size <=
      6 * 1024 * 1024 &&
    [
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(file.type)
  ) {
    return file;
  }

  const objectUrl =
    URL.createObjectURL(file);

  try {
    const image =
      await new Promise<HTMLImageElement>(
        (
          resolve,
          reject
        ) => {
          const element =
            new Image();

          element.onload = () =>
            resolve(element);

          element.onerror = () =>
            reject(
              new Error(
                "This photo format cannot be read. Please take a new photo."
              )
            );

          element.src =
            objectUrl;
        }
      );

    const longest =
      Math.max(
        image.naturalWidth,
        image.naturalHeight
      );

    const scale =
      Math.min(
        1,
        1800 / longest
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      Math.max(
        1,
        Math.round(
          image.naturalWidth *
            scale
        )
      );

    canvas.height =
      Math.max(
        1,
        Math.round(
          image.naturalHeight *
            scale
        )
      );

    const ctx =
      canvas.getContext(
        "2d"
      );

    if (!ctx) {
      throw new Error(
        "Could not prepare the selected photo."
      );
    }

    ctx.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob =
      await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            "image/jpeg",
            0.88
          )
      );

    if (!blob) {
      throw new Error(
        "Could not prepare the selected photo."
      );
    }

    return new File(
      [blob],
      `${Date.now()}-document.jpg`,
      {
        type: "image/jpeg",
      }
    );
  } finally {
    URL.revokeObjectURL(
      objectUrl
    );
  }
}

export default function VerifyDocumentsPage() {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(
      null
    );

  const sampleCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const retakeQueueRef =
    useRef<StepKey[] | null>(
      null
    );

  const mountedRef =
    useRef(true);

  const [
    sessionToken,
    setSessionToken,
  ] = useState("");

  const [
    bookingId,
    setBookingId,
  ] = useState("");

  const [
    returnUrl,
    setReturnUrl,
  ] = useState("");

  const [
    identityType,
    setIdentityType,
  ] =
    useState<IdentityType | null>(
      null
    );

  const [
    files,
    setFiles,
  ] =
    useState<
      Partial<
        Record<
          StepKey,
          File
        >
      >
    >({});

  const [
    step,
    setStep,
  ] =
    useState<StepKey>(
      "dlFront"
    );

  const [
    stage,
    setStage,
  ] =
    useState<Stage>(
      "loading"
    );

  const [
    cameraReady,
    setCameraReady,
  ] =
    useState(false);

  const [
    capturing,
    setCapturing,
  ] =
    useState(false);

  const [
    quality,
    setQuality,
  ] =
    useState<Quality>({
      tone: "neutral",

      text:
        "Opening rear camera...",
    });

  const [
    analysis,
    setAnalysis,
  ] =
    useState<Analysis | null>(
      null
    );

  const [
    finalOutcome,
    setFinalOutcome,
  ] =
    useState<
      | "accepted"
      | "manual_review"
    >("accepted");

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    cameraError,
    setCameraError,
  ] =
    useState(false);

  const stopCamera =
    useCallback(() => {
      for (
        const track of
        streamRef.current?.getTracks() ||
        []
      ) {
        track.stop();
      }

      streamRef.current =
        null;

      if (
        videoRef.current
      ) {
        videoRef.current.srcObject =
          null;
      }

      setCameraReady(
        false
      );
    }, []);

  const patchSession =
    useCallback(
      async (
        body: Record<
          string,
          unknown
        >
      ) => {
        const response =
          await fetch(
            "/api/document-verification/session",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  sessionToken,
                  ...body,
                }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Could not update verification session."
          );
        }

        return data;
      },
      [sessionToken]
    );

  /*
   * Load and start the secure session.
   */
  useEffect(() => {
    mountedRef.current =
      true;

    const previousBody =
      document.body.style.cssText;

    const previousHtml =
      document.documentElement
        .style.cssText;

    document.body.style.overflow =
      "hidden";

    document.body.style.background =
      "#000";

    document.body.style.margin =
      "0";

    document.documentElement.style.background =
      "#000";

    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      clean(
        params.get(
          "session"
        )
      );

    const back =
      safeReturnUrl(
        clean(
          params.get(
            "return"
          )
        )
      );

    setSessionToken(
      token
    );

    setReturnUrl(
      back
    );

    async function initialize() {
      try {
        if (!token) {
          throw new Error(
            "The secure verification session is missing."
          );
        }

        const response =
          await fetch(
            `/api/document-verification/session?session=${encodeURIComponent(
              token
            )}`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as SessionData;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "This verification session is unavailable."
          );
        }

        if (
          data.status ===
          "completed"
        ) {
          setStage(
            "complete"
          );

          return;
        }

        if (
          [
            "failed",
            "expired",
            "cancelled",
          ].includes(
            data.status || ""
          )
        ) {
          throw new Error(
            "This verification session can no longer be used."
          );
        }

        if (
          !data.bookingId
        ) {
          throw new Error(
            "The booking verification ID is missing."
          );
        }

        setBookingId(
          data.bookingId
        );

        const started =
          await fetch(
            "/api/document-verification/session",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  sessionToken:
                    token,

                  action:
                    "start",
                }),
            }
          );

        const startData =
          await started.json();

        if (
          !started.ok ||
          !startData.success
        ) {
          throw new Error(
            startData.error ||
              "Could not start the scanner."
          );
        }

        setStage(
          "camera"
        );
      } catch (
        caught: any
      ) {
        setError(
          caught?.message ||
            "Could not start document verification."
        );

        setStage(
          "error"
        );
      }
    }

    void initialize();

    return () => {
      mountedRef.current =
        false;

      stopCamera();

      document.body.style.cssText =
        previousBody;

      document.documentElement.style.cssText =
        previousHtml;
    };
  }, [stopCamera]);

  const startCamera =
    useCallback(async () => {
      stopCamera();

      setCameraError(
        false
      );

      setError("");

      setQuality({
        tone: "neutral",

        text:
          "Opening rear camera...",
      });

      try {
        if (
          !navigator
            .mediaDevices
            ?.getUserMedia
        ) {
          throw new Error(
            "This browser does not support live camera access."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio:
                false,

              video: {
                facingMode: {
                  ideal:
                    "environment",
                },

                width: {
                  ideal:
                    1920,
                },

                height: {
                  ideal:
                    1080,
                },
              },
            }
          );

        if (
          !mountedRef.current
        ) {
          for (
            const track of
            stream.getTracks()
          ) {
            track.stop();
          }

          return;
        }

        streamRef.current =
          stream;

        if (
          !videoRef.current
        ) {
          throw new Error(
            "Camera preview could not be mounted."
          );
        }

        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();

        setCameraReady(
          true
        );

        setQuality({
          tone: "neutral",

          text:
            "Align the document inside the frame",
        });
      } catch (
        caught: any
      ) {
        stopCamera();

        setCameraError(
          true
        );

        setError(
          caught?.name ===
            "NotAllowedError"
            ? "Camera permission was blocked. Allow camera access in your browser, or take a photo using the button below."
            : caught?.message ||
                "Could not open the camera."
        );

        setStage(
          "error"
        );
      }
    }, [stopCamera]);

  /*
   * Open the camera whenever a new
   * document side becomes active.
   */
  useEffect(() => {
    if (
      stage !== "camera"
    ) {
      return;
    }

    void startCamera();

    return stopCamera;
  }, [
    stage,
    step,
    startCamera,
    stopCamera,
  ]);

  /*
   * Lightweight local quality guide.
   * OpenAI performs the final screening.
   */
  useEffect(() => {
    if (
      stage !== "camera" ||
      !cameraReady
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          const video =
            videoRef.current;

          if (
            !video ||
            video.readyState <
              2 ||
            !video.videoWidth
          ) {
            return;
          }

          const canvas =
            sampleCanvasRef.current ||
            document.createElement(
              "canvas"
            );

          sampleCanvasRef.current =
            canvas;

          canvas.width =
            120;

          canvas.height =
            76;

          const ctx =
            canvas.getContext(
              "2d",
              {
                willReadFrequently:
                  true,
              }
            );

          if (!ctx) {
            return;
          }

          ctx.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const pixels =
            ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            ).data;

          let brightness =
            0;

          let glare =
            0;

          let edges =
            0;

          let previous =
            0;

          const count =
            pixels.length /
            4;

          for (
            let i = 0;
            i <
            pixels.length;
            i += 4
          ) {
            const gray =
              (
                pixels[i] *
                  0.299 +
                pixels[i + 1] *
                  0.587 +
                pixels[i + 2] *
                  0.114
              ) | 0;

            brightness +=
              gray;

            if (
              gray > 245
            ) {
              glare += 1;
            }

            if (i > 0) {
              edges +=
                Math.abs(
                  gray -
                    previous
                );
            }

            previous =
              gray;
          }

          brightness /=
            count;

          glare /=
            count;

          edges /=
            count;

          if (
            brightness <
            42
          ) {
            setQuality({
              tone: "warn",

              text:
                "Too dark — move toward better light",
            });
          } else if (
            glare >
            0.24
          ) {
            setQuality({
              tone: "warn",

              text:
                "Too much glare — tilt the document slightly",
            });
          } else if (
            edges <
            5.5
          ) {
            setQuality({
              tone: "warn",

              text:
                "Hold still and move slightly closer",
            });
          } else {
            setQuality({
              tone: "good",

              text:
                "Good position — capture now",
            });
          }
        },
        450
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    stage,
    cameraReady,
  ]);

  function frameAspect() {
    return (
      identityType ===
        "passport" &&
      step === "idFront"
        ? 1.42
        : 1.586
    );
  }

  async function makeCameraFile() {
    const video =
      videoRef.current;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      throw new Error(
        "The camera is not ready yet."
      );
    }

    const aspect =
      frameAspect();

    const sourceAspect =
      video.videoWidth /
      video.videoHeight;

    let sx = 0;
    let sy = 0;

    let sw =
      video.videoWidth;

    let sh =
      video.videoHeight;

    /*
     * Crop exactly the same area
     * visible inside the frame.
     */
    if (
      sourceAspect >
      aspect
    ) {
      sw =
        video.videoHeight *
        aspect;

      sx =
        (
          video.videoWidth -
          sw
        ) / 2;
    } else {
      sh =
        video.videoWidth /
        aspect;

      sy =
        (
          video.videoHeight -
          sh
        ) / 2;
    }

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      1600;

    canvas.height =
      Math.round(
        1600 / aspect
      );

    const ctx =
      canvas.getContext(
        "2d"
      );

    if (!ctx) {
      throw new Error(
        "Could not capture the photograph."
      );
    }

    ctx.drawImage(
      video,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob =
      await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            "image/jpeg",
            0.9
          )
      );

    if (!blob) {
      throw new Error(
        "Could not save the photograph."
      );
    }

    return new File(
      [blob],
      `${step}-${Date.now()}.jpg`,
      {
        type:
          "image/jpeg",
      }
    );
  }

  async function analyzeDocuments(
    nextFiles: Partial<
      Record<
        StepKey,
        File
      >
    >,
    selectedType: IdentityType
  ) {
    try {
      setStage(
        "analyzing"
      );

      setError("");

      stopCamera();

      const form =
        new FormData();

      form.append(
        "sessionToken",
        sessionToken
      );

      form.append(
        "identityType",
        selectedType
      );

      for (
        const key of [
          "dlFront",
          "dlBack",
          "idFront",
          "idBack",
        ] as StepKey[]
      ) {
        const file =
          nextFiles[key];

        if (file) {
          form.append(
            key,
            file
          );
        }
      }

      const response =
        await fetch(
          "/api/document-verification/analyze",
          {
            method:
              "POST",

            body:
              form,
          }
        );

      const data =
        (await response.json()) as Analysis;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Could not analyze the documents."
        );
      }

      setAnalysis(
        data
      );

      if (
        data.outcome ===
          "accepted" ||
        data.outcome ===
          "manual_review"
      ) {
        await saveAndComplete(
          data,
          nextFiles,
          selectedType
        );
      } else {
        setStage(
          "decision"
        );
      }
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
          "Document analysis failed."
      );

      setCameraError(
        false
      );

      setStage(
        "error"
      );
    }
  }

  async function saveAndComplete(
    result: Pick<
      Analysis,
      | "outcome"
      | "licenceData"
      | "identityData"
      | "analysis"
      | "message"
      | "reasons"
    >,

    nextFiles: Partial<
      Record<
        StepKey,
        File
      >
    >,

    selectedType: IdentityType
  ) {
    if (!bookingId) {
      throw new Error(
        "The booking verification ID is missing."
      );
    }

    if (
      !nextFiles.dlFront ||
      !nextFiles.dlBack ||
      !nextFiles.idFront
    ) {
      throw new Error(
        "One or more required photographs are missing."
      );
    }

    if (
      selectedType ===
        "id" &&
      !nextFiles.idBack
    ) {
      throw new Error(
        "The back of the ID card is missing."
      );
    }

    const upload =
      new FormData();

    upload.append(
      "bookingId",
      bookingId
    );

    upload.append(
      "sessionToken",
      sessionToken
    );

    upload.append(
      "dlFront",
      nextFiles.dlFront
    );

    upload.append(
      "dlBack",
      nextFiles.dlBack
    );

    upload.append(
      "idFront",
      nextFiles.idFront
    );

    if (
      nextFiles.idBack
    ) {
      upload.append(
        "idBack",
        nextFiles.idBack
      );
    }

    const uploadResponse =
      await fetch(
        "/api/stripe/upload-booking-documents",
        {
          method:
            "POST",

          body:
            upload,
        }
      );

    const uploaded =
      await uploadResponse.json();

    if (
      !uploadResponse.ok ||
      !uploaded.success
    ) {
      throw new Error(
        uploaded.error ||
          "Could not save the document photographs."
      );
    }

    await patchSession({
      action:
        "complete",

      identityType:
        selectedType,

      firstName:
        result.licenceData
          ?.firstName ||
        result.identityData
          ?.firstName ||
        "",

      lastName:
        result.licenceData
          ?.lastName ||
        result.identityData
          ?.lastName ||
        "",

      homeAddress:
        result.identityData
          ?.address ||
        result.licenceData
          ?.address ||
        "",

      licenceData: {
        ...result.licenceData,

        verificationOutcome:
          result.outcome,

        verificationReasons:
          result.reasons,
      },

      identityData:
        result.identityData,

      dlFrontPath:
        uploaded.dlFrontPath,

      dlBackPath:
        uploaded.dlBackPath,

      idFrontPath:
        uploaded.idFrontPath,

      idBackPath:
        uploaded.idBackPath ||
        "",

      dlFrontName:
        uploaded.dlFrontName,

      dlBackName:
        uploaded.dlBackName,

      idFrontName:
        uploaded.idFrontName,

      idBackName:
        uploaded.idBackName ||
        "",
    });

    setFinalOutcome(
      result.outcome ===
        "manual_review"
        ? "manual_review"
        : "accepted"
    );

    setStage(
      "complete"
    );
  }

  async function acceptFile(
    file: File
  ) {
    const nextFiles = {
      ...files,
      [step]: file,
    };

    setFiles(
      nextFiles
    );

    stopCamera();

    const queue =
      retakeQueueRef.current;

    if (queue) {
      const remaining =
        queue.slice(1);

      retakeQueueRef.current =
        remaining.length
          ? remaining
          : null;

      if (
        remaining.length
      ) {
        setStep(
          remaining[0]
        );

        setStage(
          "camera"
        );
      } else if (
        identityType
      ) {
        await analyzeDocuments(
          nextFiles,
          identityType
        );
      }

      return;
    }

    if (
      step === "dlFront"
    ) {
      setStep(
        "dlBack"
      );

      setStage(
        "camera"
      );
    } else if (
      step === "dlBack"
    ) {
      setStage(
        "identity-choice"
      );
    } else if (
      step === "idFront" &&
      identityType === "id"
    ) {
      setStep(
        "idBack"
      );

      setStage(
        "camera"
      );
    } else if (
      identityType
    ) {
      await analyzeDocuments(
        nextFiles,
        identityType
      );
    }
  }

  async function capture() {
    if (capturing) {
      return;
    }

    try {
      setCapturing(
        true
      );

      const file =
        await makeCameraFile();

      await acceptFile(
        file
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
          "Could not capture the photograph."
      );

      setStage(
        "error"
      );
    } finally {
      setCapturing(
        false
      );
    }
  }

  async function useSelectedPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!selected) {
      return;
    }

    if (
      !selected.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select or take an image."
      );

      return;
    }

    try {
      setCameraError(
        false
      );

      const normalized =
        await normalizePhoto(
          selected
        );

      await acceptFile(
        normalized
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
          "Could not read the selected photo."
      );

      setStage(
        "error"
      );
    }
  }

  function chooseIdentity(
    type: IdentityType
  ) {
    setIdentityType(
      type
    );

    setStep(
      "idFront"
    );

    setStage(
      "camera"
    );
  }

  function beginRetake() {
    const requested =
      (
        analysis?.retakeSides ||
        []
      )
        .filter(isStep)
        .filter(
          (key) =>
            identityType ===
            "passport"
              ? key !==
                "idBack"
              : true
        );

    const queue: StepKey[] =
      requested.length
        ? [
            ...new Set(
              requested
            ),
          ]
        : [
            "dlFront",
            "dlBack",
            "idFront",
          ];

    retakeQueueRef.current =
      queue;

    const nextFiles = {
      ...files,
    };

    for (
      const key of
      queue
    ) {
      delete nextFiles[key];
    }

    setFiles(
      nextFiles
    );

    setStep(
      queue[0]
    );

    setAnalysis(
      null
    );

    setStage(
      "camera"
    );
  }

  async function continueForManualReview() {
    if (
      !identityType
    ) {
      return;
    }

    try {
      setStage(
        "analyzing"
      );

      await saveAndComplete(
        {
          outcome:
            "manual_review",

          message:
            "Documents require manual review.",

          reasons: [
            "Automatic screening was unavailable",
          ],

          licenceData:
            {},

          identityData: {
            selectedType:
              identityType,
          },

          analysis:
            null,
        },

        files,

        identityType
      );
    } catch (
      caught: any
    ) {
      setError(
        caught?.message ||
          "Could not save the documents."
      );

      setStage(
        "error"
      );
    }
  }

  function retryAfterError() {
    setError("");

    const hasAllFiles =
      Boolean(
        identityType &&
          files.dlFront &&
          files.dlBack &&
          files.idFront &&
          (
            identityType ===
              "passport" ||
            files.idBack
          )
      );

    if (
      hasAllFiles &&
      identityType
    ) {
      void analyzeDocuments(
        files,
        identityType
      );

      return;
    }

    setStage(
      "camera"
    );
  }

  async function leaveAfterRejection() {
    try {
      await patchSession({
        action:
          "fail",

        errorMessage:
          analysis?.message ||
          "Documents not accepted.",
      });
    } catch {
      /*
       * Navigation must still work.
       */
    }

    if (returnUrl) {
      window.location.assign(
        returnUrl
      );
    } else {
      window.history.back();
    }
  }

  /*
   * Return to checkout automatically
   * after a successful scan.
   */
  useEffect(() => {
    if (
      stage !== "complete" ||
      !returnUrl ||
      !sessionToken
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          const url =
            new URL(
              returnUrl
            );

          url.searchParams.set(
            "verification_session",
            sessionToken
          );

          url.searchParams.set(
            "verification_result",
            finalOutcome
          );

          window.location.assign(
            url.toString()
          );
        },
        1700
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    stage,
    returnUrl,
    sessionToken,
    finalOutcome,
  ]);

  const copy =
    STEP_COPY[step];

  const frameClass =
    identityType ===
      "passport" &&
    step === "idFront"
      ? "aspect-[1.42/1]"
      : "aspect-[1.586/1]";

  const progress =
    useMemo(() => {
      const total =
        identityType ===
        "passport"
          ? 3
          : 4;

      const captured =
        Object.keys(
          files
        ).length;

      return Math.max(
        1,
        Math.min(
          total,
          captured + 1
        )
      );
    }, [
      files,
      identityType,
    ]);

  return (
    <div className="fixed inset-0 z-[2147483647] min-h-[100svh] overflow-y-auto bg-black font-sans text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={
          useSelectedPhoto
        }
      />

      {stage ===
      "camera" ? (
        <main className="mx-auto flex min-h-[100svh] w-full max-w-[820px] flex-col px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-6">
          <header className="flex items-start justify-between gap-5">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/45">
                NEXA secure scanner
              </div>

              <h1 className="mt-1 text-[18px] font-black tracking-[-0.03em]">
                {copy.eyebrow}
              </h1>
            </div>

            <div className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-black text-white/60">
              Step {progress}
            </div>
          </header>

          <section className="flex flex-1 flex-col justify-center py-5">
            <div
              className={[
                "relative mx-auto w-full max-w-[700px] overflow-hidden rounded-[18px] bg-[#111] shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_30px_80px_rgba(0,0,0,0.65)]",
                frameClass,
              ].join(" ")}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.18),transparent_16%,transparent_84%,rgba(0,0,0,.18))]" />

              <div className="nexa-scan-line pointer-events-none absolute left-[4%] right-[4%] top-[8%] h-px bg-white/85 shadow-[0_0_16px_rgba(255,255,255,.9)]" />

              <FrameCorners />

              {!cameraReady ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <Spinner />
                </div>
              ) : null}
            </div>

            <div className="mx-auto mt-5 w-full max-w-[700px] text-center">
              <DocumentMotion
                side={
                  step.endsWith(
                    "Back"
                  )
                    ? "back"
                    : "front"
                }
              />

              <h2 className="mt-3 text-[21px] font-black tracking-[-0.04em] sm:text-[25px]">
                {copy.title}
              </h2>

              <p className="mx-auto mt-2 max-w-[560px] text-[12px] font-semibold leading-5 text-white/52 sm:text-[13px]">
                {
                  copy.instruction
                }
              </p>

              <div
                className={[
                  "mx-auto mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black",

                  quality.tone ===
                  "good"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : quality.tone ===
                        "warn"
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                      : "border-white/12 bg-white/5 text-white/55",
                ].join(" ")}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                {quality.text}
              </div>
            </div>
          </section>

          <div className="mx-auto flex w-full max-w-[700px] items-center gap-3">
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="min-h-[58px] flex-1 rounded-[12px] border border-white/15 bg-white/5 px-4 text-[11px] font-black uppercase tracking-[0.12em] text-white/75"
            >
              Use photo
            </button>

            <button
              type="button"
              disabled={
                !cameraReady ||
                capturing
              }
              onClick={() =>
                void capture()
              }
              className="min-h-[58px] flex-[1.8] rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black transition active:scale-[0.98] disabled:bg-white/20 disabled:text-white/35"
            >
              {capturing
                ? "Capturing..."
                : "Capture document"}
            </button>
          </div>
        </main>
      ) : null}

      {stage ===
      "identity-choice" ? (
        <Centered>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
            Driving licence captured
          </div>

          <h1 className="mt-3 text-[31px] font-black tracking-[-0.055em]">
            Choose your identity document
          </h1>

          <p className="mx-auto mt-3 max-w-md text-[13px] font-semibold leading-6 text-white/50">
            Use the original document
            you will bring when
            collecting the scooter.
          </p>

          <div className="mt-8 grid w-full max-w-[560px] grid-cols-2 gap-3">
            <Choice
              label="ID card"
              detail="Front and back"
              icon="ID"
              onClick={() =>
                chooseIdentity(
                  "id"
                )
              }
            />

            <Choice
              label="Passport"
              detail="Photo page"
              icon="✦"
              onClick={() =>
                chooseIdentity(
                  "passport"
                )
              }
            />
          </div>
        </Centered>
      ) : null}

      {stage ===
        "loading" ||
      stage ===
        "analyzing" ? (
        <Centered>
          <Spinner />

          <h1 className="mt-6 text-[28px] font-black tracking-[-0.05em]">
            {stage ===
            "loading"
              ? "Opening secure scanner"
              : "Reviewing your documents"}
          </h1>

          <p className="mt-3 text-[13px] font-semibold text-white/45">
            {stage ===
            "loading"
              ? "Connecting to your booking..."
              : "Checking clarity, dates, names and licence categories..."}
          </p>
        </Centered>
      ) : null}

      {stage ===
        "decision" &&
      analysis ? (
        <Centered>
          <div
            className={[
              "flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black",

              analysis.outcome ===
              "retake"
                ? "bg-amber-400 text-black"
                : "bg-red-600 text-white",
            ].join(" ")}
          >
            {analysis.outcome ===
            "retake"
              ? "↻"
              : "!"}
          </div>

          <h1 className="mt-6 text-[29px] font-black tracking-[-0.05em]">
            {analysis.outcome ===
            "retake"
              ? "Please retake a photo"
              : "Licence cannot be accepted"}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[13px] font-semibold leading-6 text-white/58">
            {analysis.message}
          </p>

          {analysis.outcome ===
          "retake" ? (
            <button
              type="button"
              onClick={
                beginRetake
              }
              className="mt-7 min-h-[56px] w-full max-w-md rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black"
            >
              Retake requested photo
            </button>
          ) : (
            <div className="mt-7 flex w-full max-w-md flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setFiles({});
                  setIdentityType(
                    null
                  );
                  setAnalysis(
                    null
                  );
                  setStep(
                    "dlFront"
                  );
                  setStage(
                    "camera"
                  );
                }}
                className="min-h-[56px] rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black"
              >
                Scan again
              </button>

              <button
                type="button"
                onClick={() =>
                  void leaveAfterRejection()
                }
                className="min-h-[48px] rounded-[12px] border border-white/15 text-[11px] font-black text-white/60"
              >
                Return to checkout
              </button>
            </div>
          )}
        </Centered>
      ) : null}

      {stage ===
      "complete" ? (
        <Centered>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-[32px] font-black text-black">
            ✓
          </div>

          <h1 className="mt-7 text-[31px] font-black tracking-[-0.055em]">
            {finalOutcome ===
            "manual_review"
              ? "Documents received"
              : "Verification complete"}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[13px] font-semibold leading-6 text-white/55">
            {finalOutcome ===
            "manual_review"
              ? "Your booking can continue. NEXA Rentals will confirm the documents manually before pickup."
              : "Your documents passed the automatic checks and were connected to your booking."}
          </p>

          <div className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            {returnUrl
              ? "Returning to checkout..."
              : "You can return to the booking screen"}
          </div>
        </Centered>
      ) : null}

      {stage ===
      "error" ? (
        <Centered>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl font-black">
            !
          </div>

          <h1 className="mt-6 text-[29px] font-black tracking-[-0.05em]">
            Scanner needs attention
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[13px] font-semibold leading-6 text-red-200">
            {error}
          </p>

          <div className="mt-7 flex w-full max-w-md flex-col gap-3">
            {cameraError ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="min-h-[56px] rounded-[12px] bg-white px-5 text-[12px] font-black uppercase tracking-[0.14em] text-black"
              >
                Take photo instead
              </button>
            ) : null}

            <button
              type="button"
              onClick={
                retryAfterError
              }
              className="min-h-[54px] rounded-[12px] border border-white/15 bg-white/5 px-5 text-[12px] font-black uppercase tracking-[0.14em] text-white"
            >
              Try again
            </button>

            {!cameraError &&
            identityType &&
            files.dlFront &&
            files.dlBack &&
            files.idFront &&
            (
              identityType ===
                "passport" ||
              files.idBack
            ) ? (
              <button
                type="button"
                onClick={() =>
                  void continueForManualReview()
                }
                className="py-3 text-[11px] font-black text-white/50"
              >
                Continue for manual review
              </button>
            ) : null}
          </div>
        </Centered>
      ) : null}

      <style jsx global>{`
        @keyframes nexa-scan {
          0% {
            top: 8%;
            opacity: 0.25;
          }

          50% {
            opacity: 1;
          }

          100% {
            top: 91%;
            opacity: 0.25;
          }
        }

        @keyframes nexa-card {
          0%,
          100% {
            transform: translateX(-7px)
              rotate(-2deg);
          }

          50% {
            transform: translateX(7px)
              rotate(2deg);
          }
        }

        @keyframes nexa-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .nexa-scan-line {
          animation: nexa-scan
            2.2s ease-in-out
            infinite;
        }

        .nexa-card-motion {
          animation: nexa-card
            2.4s ease-in-out
            infinite;
        }

        .nexa-spinner {
          animation: nexa-spin
            0.85s linear
            infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nexa-scan-line,
          .nexa-card-motion,
          .nexa-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function Centered({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-[760px] flex-col items-center justify-center px-5 py-10 text-center">
      {children}
    </main>
  );
}

function Spinner() {
  return (
    <div className="nexa-spinner h-11 w-11 rounded-full border-[3px] border-white/15 border-t-white" />
  );
}

function FrameCorners() {
  return (
    <div className="pointer-events-none absolute inset-[10px]">
      <i className="absolute left-0 top-0 h-9 w-9 rounded-tl-[10px] border-l-[3px] border-t-[3px] border-white" />

      <i className="absolute right-0 top-0 h-9 w-9 rounded-tr-[10px] border-r-[3px] border-t-[3px] border-white" />

      <i className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-[10px] border-b-[3px] border-l-[3px] border-white" />

      <i className="absolute bottom-0 right-0 h-9 w-9 rounded-br-[10px] border-b-[3px] border-r-[3px] border-white" />
    </div>
  );
}

function DocumentMotion({
  side,
}: {
  side:
    | "front"
    | "back";
}) {
  return (
    <div className="nexa-card-motion mx-auto flex h-10 w-16 items-center rounded-[5px] border border-white/20 bg-white/10 px-2">
      <div className="h-5 w-4 rounded-sm bg-white/20" />

      <div className="ml-2 flex-1 space-y-1">
        <div className="h-0.5 w-full bg-white/30" />

        <div className="h-0.5 w-4/5 bg-white/20" />

        <div className="h-0.5 w-3/5 bg-white/20" />
      </div>

      <span className="sr-only">
        {side}
      </span>
    </div>
  );
}

function Choice({
  label,
  detail,
  icon,
  onClick,
}: {
  label: string;
  detail: string;
  icon: string;
  onClick(): void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[180px] rounded-[16px] border border-white/15 bg-white/[0.06] p-5 text-left transition active:scale-[0.98]"
    >
      <div className="flex h-12 w-16 items-center justify-center rounded-[7px] bg-white text-[13px] font-black text-black">
        {icon}
      </div>

      <div className="mt-6 text-[18px] font-black">
        {label}
      </div>

      <div className="mt-1 text-[11px] font-bold text-white/40">
        {detail}
      </div>
    </button>
  );
}