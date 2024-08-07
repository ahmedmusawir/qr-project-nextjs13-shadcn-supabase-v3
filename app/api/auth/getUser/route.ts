import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  console.log("[getUser Route.ts] User Data: ", data);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Auth session missing!" },
      { status: 401 }
    );
  }

  return NextResponse.json({ data });
}
