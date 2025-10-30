import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
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
    const reviews = payload.data?.reviews || [];

    if (!reviews.length) {
      return new Response(
        JSON.stringify({ message: "No reviews to process" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let upserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const review of reviews) {
      const {
        source,
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
        continue;
      }

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
        errors++;
        console.error(
          `Failed to insert ${source}/${reviewerName}:`,
          error.message,
        );
      } else {
        upserted++;
      }
    }

    console.log(
      `Webhook processed: ${upserted} upserted, ${skipped} skipped, ${errors} errors`,
    );

    return new Response(
      JSON.stringify({ success: true, upserted, skipped, errors }),
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

export const GET: APIRoute = async ({ request }) => {
  const apiKey = request.headers.get("x-apify-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "No API key provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ status: "Webhook ready" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
