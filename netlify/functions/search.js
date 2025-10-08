const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  const query = event.queryStringParameters?.query || "";

  const supabase = createClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!query.trim()) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        rooms: [],
        dining: [],
        general: [],
        corporate: [],
      }),
    };
  }

  try {
    const searchTerm = query.trim();

    const buildQuery = (
      tableName,
      selectColumns,
      dateColumn,
      searchColumns,
    ) => {
      let q = supabase.from(tableName).select(selectColumns);

      const conditions = searchColumns
        .map((col) => `${col}.ilike.%${searchTerm}%`)
        .join(",");

      q = q.or(conditions);

      return q.order(dateColumn, { ascending: false }).limit(100);
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

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rooms: roomResults.data || [],
        dining: diningResults.data || [],
        general: generalResults.data || [],
        corporate: corporateResults.data || [],
      }),
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Search failed",
        rooms: [],
        dining: [],
        general: [],
        corporate: [],
      }),
    };
  }
};
