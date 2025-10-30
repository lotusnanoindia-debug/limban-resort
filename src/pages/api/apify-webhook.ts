import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  // Verify Apify API key
  const apiKey = request.headers.get("x-apify-key");
  const expectedKey = import.meta.env.APIFY_WEBHOOK_KEY;

  if (!apiKey || apiKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await request.json();
    console.log("Apify webhook received:", payload);

    // Extract reviews from Apify response
    const reviews = payload.data?.reviews || [];

    if (!reviews.length) {
      return new Response(
        JSON.stringify({ message: "No reviews to process" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    let upserted = 0;
    let skipped = 0;

    // Process each review
    for (const review of reviews) {
      const {
        source, // 'google' or 'tripadvisor'
        reviewId,
        reviewerName,
        reviewerLocation,
        reviewerPhotoUrl,
        rating,
        reviewText,
        reviewTitle,
        reviewUrl,
        publishedDate,
        tripType,
        travelDate,
        roomTip,
        ownerResponse,
        ownerResponseDate,
      } = review;

      // Check if review exists
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("source", source)
        .eq(
          source === "google" ? "google_review_id" : "tripadvisor_review_id",
          reviewId,
        )
        .single();

      if (existing) {
        skipped++;
        console.log(`Review already exists: ${source}/${reviewId}`);
        continue;
      }

      // Upsert new review
      const { error } = await supabase.from("reviews").insert({
        source,
        reviewer_name: reviewerName,
        reviewer_location: reviewerLocation,
        reviewer_photo_url: reviewerPhotoUrl,
        rating,
        review_text: reviewText,
        review_title: reviewTitle,
        review_url: reviewUrl,
        published_date: publishedDate,
        trip_type: tripType,
        travel_date: travelDate,
        room_tip: roomTip,
        google_review_id: source === "google" ? reviewId : null,
        tripadvisor_review_id: source === "tripadvisor" ? reviewId : null,
        owner_response_text: ownerResponse,
        owner_response_date: ownerResponseDate,
      });

      if (error) {
        console.error(`Failed to insert review ${reviewId}:`, error);
      } else {
        upserted++;
        console.log(`✅ Inserted: ${source}/${reviewerName}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: reviews.length,
        upserted,
        skipped,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
