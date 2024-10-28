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

    // If remove_this is true, delete the current field-product association
    if (remove_this) {
      const { error: deleteError } = await supabase
        .from("ghl_qr_fields")
        .delete()
        .eq("product_id", product_id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message:
          "Custom field has been released from the product successfully.",
      });
    }

    // If `remove_this` is false or not provided, proceed with upsert logic
    if (!field_id) {
      return NextResponse.json(
        { error: "field_id is required for associating a custom field" },
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

    // Step 2: Insert the new record as active if no conflicts are found
    const { error: insertError } = await supabase.from("ghl_qr_fields").insert({
      product_id,
      product_name,
      field_id,
      field_name,
      status: "active",
    });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      message: "Custom field connected to product successfully.",
    });
  } catch (error: any) {
    console.error("Error upserting product-field combination:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
