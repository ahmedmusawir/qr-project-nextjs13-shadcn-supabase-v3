import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// API to delete a user from ghl_qr_users table
export async function DELETE(req: NextRequest) {
  const { id } = await req.json(); // Expecting user ID to delete
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ghl_qr_users")
    .delete()
    .eq("id", id); // Delete user by ID

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
