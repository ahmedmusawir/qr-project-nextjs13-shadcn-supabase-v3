import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Extract the event ID from the URL parameters
  const { id } = params;

  // Check if the event_id (id) is provided
  if (!id) {
    return NextResponse.json(
      { error: "event_id is required" },
      { status: 400 }
    );
  }

  // Fetch the orders for the given event_id
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
    .eq("event_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { message: "No orders found for this event" },
      { status: 404 }
    );
  }

  // Return the order data
  return NextResponse.json(data);
}
