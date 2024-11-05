import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client";

export async function DELETE(req: NextRequest) {
  const { id } = await req.json(); // User ID from the request body
  const supabase = createAdminClient();

  try {
    // Delete the user from Supabase authentication system
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error("Error deleting user from Supabase:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "User successfully deleted from Supabase." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in /superadmin/delete-user route:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
