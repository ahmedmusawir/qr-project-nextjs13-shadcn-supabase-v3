import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// API to add a user to ghl_qr_users table
export async function POST(req: NextRequest) {
  const { id, name, email, type } = await req.json();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ghl_qr_users")
    .insert([{ id, name, email, type }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
