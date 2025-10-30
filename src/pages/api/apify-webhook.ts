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
    console.log("Raw payload:", JSON.stringify(payload).slice(0, 200));

    // Handle both array and nested formats
    let reviews = Array.isArray(payload.data?.reviews)
      ? payload.data.reviews
      : [];

    if (!Array.isArray(reviews) && typeof reviews === "object") {
      reviews = Object.values(reviews);
    }

    if (!reviews.length) {
      return new Response(
        JSON.stringify({ message: "No reviews", received: payload }),
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
      const reviewId = review.id || review.reviewId;
      const source = "google"; // Google scraper

      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("google_review_id", reviewId)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      const { error } = await supabase.from("reviews").insert({
        source,
        reviewer_name: review.name || review.reviewerName,
        reviewer_photo_url: review.profilePhotoUrl || review.reviewerPhotoUrl,
        rating: review.rating || 5,
        review_text: review.text || review.reviewText,
        review_url: review.url || review.reviewUrl,
        published_date: review.publishedAtTime || new Date().toISOString(),
        google_review_id: reviewId,
      });

      if (error) {
        errors++;
        console.error(`Failed to insert ${reviewId}:`, error.message);
      } else {
        upserted++;
      }
    }

    console.log(
      `Webhook: ${upserted} upserted, ${skipped} skipped, ${errors} errors`,
    );

    return new Response(
      JSON.stringify({ success: true, upserted, skipped, errors }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Processing failed", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
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
