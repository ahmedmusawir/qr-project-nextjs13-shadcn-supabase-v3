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
    const { product_id, product_name, field_id, field_name, remove_this } =
      await req.json();

    // Validate that product_id is provided
    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    // Handle "No Field" option by checking `remove_this`
    if (remove_this) {
      // Step 1: Delete the record associated with the given product_id
      const { error: deleteError } = await supabase
        .from("ghl_qr_fields")
        .delete()
        .eq("product_id", product_id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: "Custom field association removed successfully.",
      });
    }

    // If `remove_this` is false or not provided, proceed with upsert logic
    if (!field_id) {
      return NextResponse.json(
        { error: "field_id is required for associating a custom field" },
        { status: 400 }
      );
    }

    // Step 2: Check if the field is already active on another product
    const { data: existingActiveField, error: existingActiveFieldError } =
      await supabase
        .from("ghl_qr_fields")
        .select("*")
        .eq("field_id", field_id)
        .eq("status", "active")
        .neq("product_id", product_id)
        .single();

    if (
      existingActiveFieldError &&
      existingActiveFieldError.code !== "PGRST116"
    ) {
      throw existingActiveFieldError;
    }

    if (existingActiveField) {
      return NextResponse.json(
        {
          success: false,
          error: "This field is already active on another product.",
        },
        { status: 400 }
      );
    }

    // Step 3: Deactivate any active records with the same product_id
    const { data: activeRecords, error: activeError } = await supabase
      .from("ghl_qr_fields")
      .select("*")
      .eq("product_id", product_id)
      .eq("status", "active");

    if (activeError) throw activeError;

    if (activeRecords && activeRecords.length > 0) {
      const { error: updateError } = await supabase
        .from("ghl_qr_fields")
        .update({ status: "inactive" })
        .eq("product_id", product_id)
        .eq("status", "active");

      if (updateError) throw updateError;
    }

    // Step 4: Upsert logic - check if the combo exists and is inactive, then update
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
      message: "Custom field connected to Product successfully.",
    });
  } catch (error: any) {
    console.error("Error upserting product-field combination:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
