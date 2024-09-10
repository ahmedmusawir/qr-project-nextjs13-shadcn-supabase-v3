import { NextRequest, NextResponse } from "next/server";

// Fetch price details from GHL API
async function fetchGhlPriceDetails(
  productId: string,
  priceId: string,
  locationId: string
) {
  const response = await fetch(
    `https://services.leadconnectorhq.com/products/${productId}/price/${priceId}?locationId=${locationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
        Version: "2021-07-28",
      },
    }
  );

  //   console.log("productId GHL", productId);
  //   console.log("PriceId from GHL", priceId);
  //   console.log("LocationId from GHL", locationId);
  //   console.log("Response from GHL", response);
  //   console.log(
  //     `https://services.leadconnectorhq.com/products/${productId}/price/${priceId}?locationId=${locationId}`
  //   );

  if (!response.ok) {
    throw new Error(`Failed to fetch price details for priceId: ${priceId}`);
  }

  const data = await response.json();
  return data;
}

// Handle GET request
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract product ID and price ID from the request (assuming the product ID and locationId will come as query params)
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");
    const locationId = searchParams.get("location_id");

    if (!productId || !locationId) {
      throw new Error(
        "Missing required product_id or location_id query parameters."
      );
    }

    const priceId = params.id;
    const priceDetails = await fetchGhlPriceDetails(
      productId,
      priceId,
      locationId
    );

    // Return only the 'name' field (the price name)
    return NextResponse.json({
      priceName: priceDetails.name,
    });
  } catch (error: any) {
    console.error(`Error fetching price details: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
