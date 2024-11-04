/**
 * Function: fetchAndGenerateValidOrderList
 *
 * This function is responsible for fetching and generating the list of valid orders
 * based on product availability in GoHighLevel (GHL). It calls the `/api/ghl/orders`
 * endpoint, which filters all the orders that contain valid, active products.
 *
 * - The function is set to revalidate every 3600 seconds (1 hour) to ensure that
 *   the list of valid orders remains up-to-date without unnecessary repeated calls.
 *
 * - If the fetch operation succeeds, the valid orders are logged and can be used
 *   elsewhere in the system.
 *
 * - In case of failure, an error is logged to help with debugging.
 *
 * This function can be triggered during application load to optimize the order syncing
 * process and improve performance by pre-filtering orders with valid products.
 */
// services/orderServices.ts
export const fetchAndGenerateValidOrderList = async (): Promise<void> => {
  try {
    // This is required cuz this is being called in /app/layout.ts (RootLayout) which is
    // a server-side component. Client-side ones understand relative URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"; // Fallback if not set

    // const response = await fetch(`/api/ghl/orders`, {
    const response = await fetch(`${baseUrl}/api/ghl/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Set revalidation to 1 hour (3600 seconds)
    });

    if (!response.ok) {
      throw new Error("Failed to fetch valid order list.");
    }

    const data = await response.json();
    console.log("Valid order list:", data);
  } catch (error) {
    console.error("Error fetching and generating valid order list:", error);
  }
};

// Fetching single order by ID
export const fetchOrderById = async (orderId: string) => {
  try {
    // Make the GET request to the /orders/[id] endpoint
    const response = await fetch(`/api/qrapp/orders/${orderId}`, {
      cache: "no-store",
    });

    // Handle the response
    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    // Parse the response data
    const data = await response.json();
    return data; // Return the data for further use
  } catch (error) {
    console.error(error);
    throw error;
  }
};
