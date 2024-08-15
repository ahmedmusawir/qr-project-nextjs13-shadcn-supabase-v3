// app/api/qrapp/orders/[id]/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Extract the order ID from the URL parameters
  const { id } = params;

  // Fetch the order by its ID
  const { data: order, error } = await supabase
    .from("ghl_qr_orders")
    .select("*")
    .eq("order_id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the order data
  return NextResponse.json(order);
}
