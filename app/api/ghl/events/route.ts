/**
 * Endpoint: /api/ghl/events
 *
 * This endpoint fetches a list of product IDs (events) from the GHL API.
 * It makes a GET request to the GHL API using the provided location ID and returns
 * an array of product IDs in a simplified format.
 *
 * Steps:
 * 1. Call the GHL API endpoint `/products/?locationId={locationId}` to retrieve the product list.
 * 2. Extract only the `_id` field from each product.
 * 3. Return the list of product IDs as a JSON array.
 *
 * Authorization:
 * The request requires a valid GHL API access token, passed via the Authorization header.
 * The location ID is retrieved from environment variables, ensuring flexibility.
 *
 * Parameters:
 * - locationId: The location ID required by the GHL API, fetched from environment variables.
 *
 * Response:
 * - Success: Returns a JSON array of product IDs.
 * - Error: Returns an error message if the API request fails.
 *
 * Usage:
 * This endpoint is designed to provide a list of event (product) IDs that can be used
 * in further API calls, such as fetching ticket types or other event details.
 */

import { NextRequest, NextResponse } from "next/server";

// Fetch product data from GHL API
async function fetchProductIds(locationId: string) {
  const apiUrl = `https://services.leadconnectorhq.com/products/?locationId=${locationId}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
      Version: "2021-07-28",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching product data: ${response.statusText}`);
  }

  const data = await response.json();
  return data.products.map((product: { _id: string }) => product._id);
}

// Handle GET request to /api/ghl/events
export async function GET(req: NextRequest) {
  try {
    const locationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

    if (!locationId) {
      return NextResponse.json(
        { error: "Missing required environment variable: locationId" },
        { status: 400 }
      );
    }

    // Fetch product IDs (event IDs) from the GHL API
    const productIds = await fetchProductIds(locationId);

    // Return the product IDs in the response
    return NextResponse.json({ productIds }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching product IDs:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
