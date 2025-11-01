import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const APIFY_WEBHOOK_KEY = process.env.APIFY_WEBHOOK_KEY;
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify webhook authentication
    const authHeader = request.headers.get("x-apify-key");
    if (authHeader !== APIFY_WEBHOOK_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse Apify webhook payload
    const payload = await request.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    // Extract dataset ID from resource object
    const datasetId = payload.resource?.defaultDatasetId;
    const actorRunId = payload.resource?.id;
    const status = payload.resource?.status;

    if (status !== "SUCCEEDED") {
      console.log(`Run ${actorRunId} did not succeed. Status: ${status}`);
      return new Response(
        JSON.stringify({
          message: `Run status: ${status}. No action taken.`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!datasetId) {
      console.error("No defaultDatasetId found in webhook payload");
      return new Response(
        JSON.stringify({
          error: "Missing defaultDatasetId",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(`Fetching dataset: ${datasetId}`);

    // Fetch dataset items from Apify API
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`,
      {
        headers: {
          Authorization: `Bearer ${APIFY_API_TOKEN}`,
        },
      },
    );

    if (!datasetResponse.ok) {
      throw new Error(
        `Apify API error: ${datasetResponse.status} ${datasetResponse.statusText}`,
      );
    }

    const reviews = await datasetResponse.json();
    console.log(`Fetched ${reviews.length} reviews from Apify`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Process and upsert reviews
    let insertedCount = 0;
    let skippedCount = 0;

    for (const review of reviews) {
      // Determine source (Google Maps or TripAdvisor)
      const source = review.reviewId ? "google" : "tripadvisor";

      // Map Apify data to your Supabase schema
      const reviewData = {
        source,
        reviewer_name: review.name || review.username || null,
        reviewer_location: review.reviewerLocation || null,
        reviewer_photo_url: review.profilePhotoUrl || review.avatarUrl || null,
        rating: review.stars || review.rating || null,
        review_text: review.text || review.reviewText || null,
        review_title: review.title || null,
        review_url: review.url || review.reviewUrl || null,
        published_date: review.publishedAtDate || review.publishedDate || null,
        owner_response_text:
          review.responseFromOwnerText || review.ownerResponse?.text || null,
        owner_response_date:
          review.responseFromOwnerDate ||
          review.ownerResponse?.publishedDate ||
          null,
        trip_type: review.tripType || null,
        travel_date: review.travelDate || null,
        room_tip: review.roomTip || null,
        google_review_id: source === "google" ? review.reviewId : null,
        tripadvisor_review_id: source === "tripadvisor" ? review.id : null,
        updated_at: new Date().toISOString(),
      };

      // Check if review already exists
      const uniqueId = source === "google" ? review.reviewId : review.id;
      const uniqueColumn =
        source === "google" ? "google_review_id" : "tripadvisor_review_id";

      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq(uniqueColumn, uniqueId)
        .single();

      if (existing) {
        skippedCount++;
        console.log(`Skipped duplicate review: ${uniqueId}`);
        continue;
      }

      // Insert new review
      const { error } = await supabase.from("reviews").insert(reviewData);

      if (error) {
        console.error(`Error inserting review ${uniqueId}:`, error);
      } else {
        insertedCount++;
      }
    }

    console.log(
      `Sync complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        skipped: skippedCount,
        total: reviews.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
