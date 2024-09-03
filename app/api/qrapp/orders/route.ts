// app/api/qrapp/orders/route.ts
// http://localhost:3000/api/qrapp/orders?page=1&pageSize=5

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createClient();

  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10); // Default to 10 items per page

  // Calculate the offset for pagination
  const offset = (page - 1) * pageSize;

  // Get the total count of orders
  const { count, error: countError } = await supabase
    .from("ghl_qr_orders")
    .select("*", { count: "exact", head: true });

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  // Fetch the paginated data
  const { data: orders, error } = await supabase
    .from("ghl_qr_orders")
    .select(
      "order_id, total_paid, payment_status, contact_firstname, contact_lastname, date_added, event_image, event_ticket_qty, event_name"
    )
    .eq("payment_status", "paid")
    .order("order_id", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate the total number of pages
  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  // Return the paginated data with metadata
  return NextResponse.json({
    orders,
    pagination: {
      totalItems: count,
      totalPages,
      currentPage: page,
      pageSize,
    },
  });
}
