// API route to update the status of a single ticket by ticket_id.
// Receives a PUT request with the new status (e.g., "validated" or "live") and updates the corresponding ticket.

// /api/qrapp/tickets/status/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { status } = await req.json(); // Expecting status in the request body

  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("ghl_qr_tickets")
      .update({ status })
      .eq("ticket_id", id);

    if (error) {
      return NextResponse.json(
        { message: "Failed to update ticket status", error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Ticket status updated successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
