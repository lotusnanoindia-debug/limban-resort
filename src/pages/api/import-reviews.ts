import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

function parseDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const dt = new Date(dateStr);
    return dt.toISOString();
  } catch {
    return null;
  }
}

function transformTripAdvisorReview(review: any) {
  const user = review.user || {};
  const userLocation = user.userLocation || {};
  const ownerResponse = review.ownerResponse || {};
  const avatar = user.avatar || {};

  return {
    source: "tripadvisor",
    reviewer_name: user.name,
    reviewer_location: userLocation.name || null,
    reviewer_photo_url: avatar.image || null,
    rating: review.rating,
    review_text: review.text,
    review_title: review.title,
    review_url: review.url,
    published_date: parseDate(review.publishedDate),
    owner_response_text: ownerResponse.text || null,
    owner_response_date: parseDate(ownerResponse.publishedDate),
    trip_type: review.tripType,
    travel_date: review.travelDate,
    room_tip: review.roomTip,
    google_review_id: null,
    tripadvisor_review_id: review.id,
  };
}

function transformGoogleReview(review: any) {
  return {
    source: "google",
    reviewer_name: review.name,
    reviewer_location: review.location,
    reviewer_photo_url: review.photo,
    rating: review.rating,
    review_text: review.text,
    review_title: null,
    review_url: review.link,
    published_date: parseDate(review.date),
    owner_response_text: review.responseText,
    owner_response_date: parseDate(review.responseDate),
    trip_type: null,
    travel_date: null,
    room_tip: null,
    google_review_id: review.reviewId,
    tripadvisor_review_id: null,
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const datasetId = payload.datasetId || payload.resource?.defaultDatasetId;

    if (!datasetId) {
      return new Response(JSON.stringify({ error: "No dataset ID provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apifyResponse = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`,
    );

    if (!apifyResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch from Apify" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const reviews = await apifyResponse.json();

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No reviews to import",
        }),
        { status: 200 },
      );
    }

    const transformedReviews = reviews
      .map((review: any) => {
        if (review.id && review.url?.includes("tripadvisor")) {
          return transformTripAdvisorReview(review);
        } else if (review.reviewId) {
          return transformGoogleReview(review);
        }
        return null;
      })
      .filter(Boolean);

    if (transformedReviews.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No valid reviews found",
        }),
        { status: 200 },
      );
    }

    const { error } = await supabase
      .from("reviews")
      .upsert(transformedReviews, {
        onConflict: "google_review_id,tripadvisor_review_id",
        ignoreDuplicates: true,
      });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        imported: transformedReviews.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({
        error: "Invalid request",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
