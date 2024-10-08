import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { message: "GET request successful FOR UPSERT FIELD" },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const supabase = createClient();

  try {
    const { product_id, product_name, field_id, field_name } = await req.json();

    if (!product_id || !field_id) {
      return NextResponse.json(
        { error: "product_id and field_id are required" },
        { status: 400 }
      );
    }

    // Step 1: Check if the field is already active on another product
    const { data: existingActiveField, error: existingActiveFieldError } =
      await supabase
        .from("ghl_qr_fields")
        .select("*")
        .eq("field_id", field_id)
        .eq("status", "active")
        .neq("product_id", product_id) // Ensure it's not the current product
        .single();

    if (
      existingActiveFieldError &&
      existingActiveFieldError.code !== "PGRST116"
    ) {
      throw existingActiveFieldError;
    }

    if (existingActiveField) {
      // If the field is already active on another product, return an error
      return NextResponse.json(
        {
          success: false,
          error: "This field is already active on another product.",
        },
        { status: 400 }
      );
    }

    // Step 2: Find any active records with the same product_id
    const { data: activeRecords, error: activeError } = await supabase
      .from("ghl_qr_fields")
      .select("*")
      .eq("product_id", product_id)
      .eq("status", "active");

    if (activeError) throw activeError;

    // Step 3: If found, update them to inactive
    if (activeRecords && activeRecords.length > 0) {
      const { error: updateError } = await supabase
        .from("ghl_qr_fields")
        .update({ status: "inactive" })
        .eq("product_id", product_id)
        .eq("status", "active");

      if (updateError) throw updateError;
    }

    // Step 4: Check if the combo exists and is inactive, then upsert
    const { data: existingRecord, error: existingError } = await supabase
      .from("ghl_qr_fields")
      .select("*")
      .eq("product_id", product_id)
      .eq("field_id", field_id)
      .single();

    if (existingError && existingError.code !== "PGRST116") throw existingError;

    if (existingRecord) {
      // Step 5: Update the existing inactive record to active
      const { error: upsertError } = await supabase
        .from("ghl_qr_fields")
        .update({ status: "active" })
        .eq("product_id", product_id)
        .eq("field_id", field_id);

      if (upsertError) throw upsertError;
    } else {
      // Step 6: Insert the new record as active
      const { error: insertError } = await supabase
        .from("ghl_qr_fields")
        .insert({
          product_id,
          product_name,
          field_id,
          field_name,
          status: "active",
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: "Custom-field connected to Product successfully.",
    });
  } catch (error: any) {
    console.error("Error upserting product-field combination:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
