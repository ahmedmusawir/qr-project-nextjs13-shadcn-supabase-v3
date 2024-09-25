import { NextRequest, NextResponse } from "next/server";

// Fetch price data from GHL API
async function fetchPriceData(productId: string, locationId: string) {
  const apiUrl = `https://services.leadconnectorhq.com/products/${productId}/price?locationId=${locationId}`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`, // Corrected authorization
      Version: "2021-07-28", // Correct version header
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching price data: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Handle GET request to /api/ghl/price
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const locationId =
      searchParams.get("location_id") ||
      process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

    if (!productId || !locationId) {
      return NextResponse.json(
        { error: "Missing required parameters: product_id or location_id" },
        { status: 400 }
      );
    }

    // Fetch the price data from GHL API
    const priceData = await fetchPriceData(productId, locationId);
    // console.log("price data:", priceData.prices);
    const prices = priceData.prices;

    // Return the price data in the response
    return NextResponse.json({ prices }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching price data:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
