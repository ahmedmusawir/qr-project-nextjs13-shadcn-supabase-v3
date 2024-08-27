import { createClient } from "@/utils/supabase/client";

// Updating the product/field combo records for GHL Webhook Implementation
export const upsertProductFieldCombo = async (
  product_id: string,
  product_name: string,
  field_id: string,
  field_name: string
) => {
  const supabase = createClient();

  try {
    // Step 1: Find any active records with the same product_id
    const { data: activeRecords, error: activeError } = await supabase
      .from("ghl_qr_fields")
      .select("*")
      .eq("product_id", product_id)
      .eq("status", "active");

    if (activeError) throw activeError;

    // Step 2: If found, update them to inactive
    if (activeRecords && activeRecords.length > 0) {
      const { error: updateError } = await supabase
        .from("ghl_qr_fields")
        .update({ status: "inactive" })
        .eq("product_id", product_id)
        .eq("status", "active");

      if (updateError) throw updateError;
    }

    // Step 3: Check if the combo exists and is inactive, then upsert
    const { data: existingRecord, error: existingError } = await supabase
      .from("ghl_qr_fields")
      .select("*")
      .eq("product_id", product_id)
      .eq("field_id", field_id)
      .single();

    if (existingError && existingError.code !== "PGRST116") throw existingError;

    if (existingRecord) {
      // Step 4: Update the existing inactive record to active
      const { error: upsertError } = await supabase
        .from("ghl_qr_fields")
        .update({ status: "active" })
        .eq("product_id", product_id)
        .eq("field_id", field_id);

      if (upsertError) throw upsertError;
    } else {
      // Step 5: Insert the new record as active
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

    return {
      success: true,
      message: "Product-field combination saved successfully.",
    };
  } catch (error: any) {
    console.error("Error upserting product-field combination:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch the current active field
export const getActiveFieldForProduct = async (product_id: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ghl_qr_fields")
    .select("field_name")
    .eq("product_id", product_id)
    .eq("status", "active")
    .single(); // Assuming there should only be one active record

  if (error) {
    console.error("Error fetching active field:", error);
    return null;
  }

  return data ? data.field_name : null;
};

// Fetching all the custom fields from GHL
export const fetchCustomFields = async () => {
  const response = await fetch("/api/qrapp/fields");
  if (!response.ok) {
    throw new Error("Failed to fetch custom fields");
  }
  const data = await response.json();
  return data.map((field: any) => ({
    field_id: field.id,
    field_name: field.name,
  }));
};
