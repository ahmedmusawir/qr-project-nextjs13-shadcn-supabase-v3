import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Extract the event ID or GHL product ID from the URL parameters
  const { id } = params;

  // Extract query parameters for pagination
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10); // Default to 10 items per page

  // Check if the event_id (id) is provided
  if (!id) {
    return NextResponse.json(
      { error: "event_id is required" },
      { status: 400 }
    );
  }

  // Calculate the offset for pagination
  const offset = (page - 1) * pageSize;

  // Get the total count of orders for the event
  const { count, error: countError } = await supabase
    .from("ghl_qr_orders")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Fetch the paginated data
  const { data, error } = await supabase
    .from("ghl_qr_orders")
    .select(
      `
      order_id, 
      event_name, 
      event_image, 
      date_added, 
      total_paid, 
      payment_status, 
      contact_firstname, 
      contact_lastname, 
      contact_email, 
      contact_phone
    `
    )
    .eq("event_id", id)
    .order("order_id", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "No orders found for this event" },
      { status: 404 }
    );
  }

  // Calculate the total number of pages
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Return the paginated data with metadata
  return NextResponse.json({
    orders: data,
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      pageSize,
    },
  });
}
