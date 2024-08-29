import { createClient } from "@/utils/supabase/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export async function updateGHLField(
  contact_id: string,
  product_id: string,
  qrCodeImage: string
) {
  const supabase = createClient();

  try {
    // Step 1: Query the Supabase table for the active field associated with the product_id
    const { data, error } = await supabase
      .from("ghl_qr_fields")
      .select("field_id")
      .eq("product_id", product_id)
      .eq("status", "active")
      .single(); // Assuming only one active field per product

    if (error || !data) {
      throw new Error(
        `Failed to find active field for product ${product_id}: ${
          error?.message || "No active field found"
        }`
      );
    }

    const field_id = data.field_id;

    // Step 2: Prepare the custom field data for the PUT request
    const customFields = [
      {
        id: field_id,
        value: qrCodeImage,
      },
    ];

    // Step 3: Make the PUT request to update the contact's custom field using the endpoint from Step 1
    const response = await fetch(
      `${API_BASE_URL}/api/ghl/contacts/${contact_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customFields }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update GHL contact ${contact_id}: ${response.statusText}`
      );
    }

    // If everything went well, return success
    return {
      success: true,
      message: `Contact ${contact_id} updated with QR code`,
    };
  } catch (error: any) {
    console.error("Error updating GHL field:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
