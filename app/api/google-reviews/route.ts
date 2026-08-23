import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_SECONDS = 60 * 60; // 1 hour

type GooglePlaceResponse = {
  rating?: number;
  userRatingCount?: number;
};

function cleanEnv(value: unknown) {
  return String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\r/g, "")
    .replace(/\n/g, "");
}

export async function GET() {
  try {
    const apiKey = cleanEnv(
      process.env.GOOGLE_PLACES_API_KEY ||
        process.env.GOOGLE_MAPS_API_KEY
    );

    const placeId = cleanEnv(
      process.env.GOOGLE_PLACE_ID ||
        process.env.GOOGLE_MAPS_PLACE_ID
    );

    if (!apiKey) {
      console.error(
        "GOOGLE REVIEWS API: Missing GOOGLE_PLACES_API_KEY."
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Google Places API key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (!placeId) {
      console.error(
        "GOOGLE REVIEWS API: Missing GOOGLE_PLACE_ID."
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Google Place ID is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount",
      },
      next: {
        revalidate: CACHE_SECONDS,
      },
    });

    const data = (await response.json().catch(() => null)) as
      | GooglePlaceResponse
      | {
          error?: {
            message?: string;
            status?: string;
            code?: number;
          };
        }
      | null;

    if (!response.ok) {
      const googleError =
        data &&
        "error" in data &&
        data.error
          ? data.error
          : null;

      console.error("GOOGLE REVIEWS API ERROR:", {
        status: response.status,
        message: googleError?.message,
        googleStatus: googleError?.status,
        googleCode: googleError?.code,
      });

      return NextResponse.json(
        {
          ok: false,
          error:
            googleError?.message ||
            `Google Places request failed with HTTP ${response.status}.`,
        },
        {
          status: response.status,
        }
      );
    }

    const place = data as GooglePlaceResponse;

    const rating = Number(place?.rating || 0);
    const reviewCount = Number(
      place?.userRatingCount || 0
    );

    if (
      !Number.isFinite(reviewCount) ||
      reviewCount <= 0
    ) {
      console.warn(
        "GOOGLE REVIEWS API: Google returned no userRatingCount.",
        data
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Google did not return a valid review count.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        rating:
          Number.isFinite(rating) && rating > 0
            ? rating
            : 5,
        reviewCount,
        updatedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
        },
      }
    );
  } catch (error: any) {
    console.error(
      "GOOGLE REVIEWS API FAILED:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Failed to load Google review information.",
      },
      {
        status: 500,
      }
    );
  }
}