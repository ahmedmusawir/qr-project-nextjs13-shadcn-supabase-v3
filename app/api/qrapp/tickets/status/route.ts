// API route to update the status of all tickets for a specific order by order_id.
// Receives a PUT request with the order_id and new status (e.g., "validated" or "live") and updates all associated tickets.

// /api/qrapp/tickets/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(req: Request) {
  const { order_id, status } = await req.json(); // Expecting order_id and status in the request body
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("ghl_qr_tickets")
      .update({ status })
      .eq("order_id", order_id);

    if (error) {
      return NextResponse.json(
        { message: "Failed to update tickets status", error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "All tickets updated successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
