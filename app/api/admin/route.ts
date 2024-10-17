import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin-client";

/**
 * THIS DOES NOT REFRESH THE USERS. ALWAYS SHOWS THE SAME USERS
 * API route to fetch users from Supabase.
 * This route interacts with the Supabase admin API to fetch a list of users.
 * The Supabase service role key is used to authenticate and access the admin features.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {NextResponse} - A JSON response containing the list of users or an error message.
 */
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();

  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    // console.log("Users fetched:", data.users);
    return NextResponse.json(
      { message: "Posts Route Accessed Successfully!", data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error in fetching users:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// FOR REFERENCE
// const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// const supabase = createClient(supabase_url, service_role_key, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false,
//   },
// });

// Access auth admin api
// const adminAuthClient = supabase.auth.admin;
