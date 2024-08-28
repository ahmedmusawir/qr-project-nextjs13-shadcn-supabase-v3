// pages/api/ghl/field.ts

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    const product_id = req.nextUrl.searchParams.get("product_id");

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ghl_qr_fields")
      .select("field_name")
      .eq("product_id", product_id)
      .eq("status", "active")
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {
      return NextResponse.json(
        { field_name: data[0].field_name },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "No active field found" },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
