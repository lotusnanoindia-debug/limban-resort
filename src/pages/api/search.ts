import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get("query") || "";
    const dateFrom = url.searchParams.get("dateFrom") || "";
    const dateTo = url.searchParams.get("dateTo") || "";

    console.log("=== SEARCH API CALLED ===");
    console.log("Query:", query);
    console.log("DateFrom:", dateFrom);
    console.log("DateTo:", dateTo);

    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    );

    const searchTerm = query.trim();

    if (!searchTerm && !dateFrom && !dateTo) {
      console.log("No search criteria - returning empty");
      return new Response(
        JSON.stringify({
          rooms: [],
          dining: [],
          general: [],
          corporate: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const buildQuery = (
      tableName: string,
      selectColumns: string,
      dateColumn: string,
      searchColumns: string[],
    ) => {
      let query = supabase.from(tableName).select(selectColumns);

      if (searchTerm) {
        const conditions = searchColumns
          .map((col) => `${col}.ilike.%${searchTerm}%`)
          .join(",");

        console.log(`${tableName} search conditions:`, conditions);
        query = query.or(conditions);
      }

      if (dateFrom && dateTo) {
        query = query.gte(dateColumn, dateFrom).lte(dateColumn, dateTo);
      }

      return query.order(dateColumn, { ascending: false }).limit(100);
    };

    const [roomResults, diningResults, generalResults, corporateResults] =
      await Promise.all([
        buildQuery(
          "contact_submissions",
          "id, created_at, firstName, lastName, email, phone, roomName, checkin, checkout, adults, children, basePrice, nightsReserved, wantSafaris, transfer, message",
          "created_at",
          ["firstName", "lastName", "email", "phone", "roomName", "message"],
        ),

        buildQuery(
          "dining_submissions",
          "id, created_at, first_name, last_name, email, phone, outletname, dining_date, dining_time, adults, children, message, status",
          "created_at",
          [
            "first_name",
            "last_name",
            "email",
            "phone",
            "outletname",
            "message",
          ],
        ),

        buildQuery(
          "general_enquiries",
          "id, created_at, first_name, last_name, email, phone, enquiry_type, message, status, assigned_to, internal_notes",
          "created_at",
          [
            "first_name",
            "last_name",
            "email",
            "phone",
            "enquiry_type",
            "message",
          ],
        ),

        buildQuery(
          "corporate_enquiries",
          "id, submitted_at, contact_name, company_name, email, phone, event_type, attendee_count, preferred_date, duration, message",
          "submitted_at",
          [
            "contact_name",
            "company_name",
            "email",
            "phone",
            "event_type",
            "message",
          ],
        ),
      ]);

    console.log("Results:", {
      rooms: roomResults.data?.length,
      dining: diningResults.data?.length,
      general: generalResults.data?.length,
      corporate: corporateResults.data?.length,
    });

    return new Response(
      JSON.stringify({
        rooms: roomResults.data || [],
        dining: diningResults.data || [],
        general: generalResults.data || [],
        corporate: corporateResults.data || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({
        error: "Search failed",
        rooms: [],
        dining: [],
        general: [],
        corporate: [],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
