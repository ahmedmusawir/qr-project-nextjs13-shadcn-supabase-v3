import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const supabase = createClient();
  const { orderId } = params;

  const { data, error } = await supabase
    .from("ghl_qr_tickets")
    .select("ticket_id, order_id, ticket_type, status")
    .eq("order_id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
