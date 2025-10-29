import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url }) => {
  const offset = parseInt(url.searchParams.get("offset") || "9");
  const limit = parseInt(url.searchParams.get("limit") || "9");

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .gte("rating", 4)
    .not("review_text", "is", null)
    .order("published_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ reviews }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
