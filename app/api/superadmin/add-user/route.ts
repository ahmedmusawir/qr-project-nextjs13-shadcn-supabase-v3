import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client"; // Updated import for admin client

export async function POST(req: NextRequest) {
  const { email, password, user_metadata } = await req.json();
  const supabase = createAdminClient();

  try {
    // Create user using the Admin API to avoid auto login
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata, // Pass user metadata directly
      email_confirm: true, // Automatically confirm the email
    });

    if (error) {
      console.error("Error creating user:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // You can log the user creation for debugging if needed
    console.log("CREATED USER /superadmin/add-user", data);

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Error in /superadmin-add-user route:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
