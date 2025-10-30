// /src/pages/api/load-more-reviews.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { offset = 0, limit = 9 } = await request.json();

    console.log("API received - offset:", offset, "limit:", limit);

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .gte("rating", 4)
      .not("review_text", "is", null)
      .order("published_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Supabase error:", error);
      return new Response(
        JSON.stringify({ error: error.message, reviews: [] }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    console.log("API returning:", reviews?.length, "reviews");

    return new Response(JSON.stringify({ reviews: reviews || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("API error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message, reviews: [] }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
