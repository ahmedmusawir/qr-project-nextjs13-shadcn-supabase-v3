// Function to upsert product-field combo using the server-side API
export const upsertProductFieldCombo = async (
  product_id: string,
  product_name: string,
  field_id: string,
  field_name: string
) => {
  try {
    const response = await fetch("/api/qrapp/upsert-field", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id,
        product_name,
        field_id,
        field_name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to upsert product-field combo"
      );
    }

    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
    };
  } catch (error: any) {
    console.error("Error upserting product-field combination:", error.message);
    return { success: false, error: error.message };
  }
};

// Fetch the current active field
export const getActiveFieldForProduct = async (product_id: string) => {
  const response = await fetch(
    `/api/qrapp/active-fields?product_id=${product_id}`
  );
  if (!response.ok) {
    console.error("Error fetching active field:", response.statusText);
    return null;
  }

  const data = await response.json();
  if (data.field_name === null) {
    console.log(`No active field found for product_id: ${product_id}`);
  }
  return data.field_name || "No active field connected";
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
