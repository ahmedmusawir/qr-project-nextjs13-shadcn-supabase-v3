/**
 * API: /api/ghl/orders
 *
 * This API route is responsible for filtering all orders in GoHighLevel (GHL) based on product availability.
 * The goal is to identify which orders have products that are still active and available in the system.
 * The available products are fetched from the GHL API using the `/api/ghl/events` endpoint.
 *
 * Here's the process this route follows:
 *
 * 1. **Fetch Product IDs**: The route fetches all active product IDs by invoking the `/api/ghl/events` endpoint,
 *    which returns a list of available product IDs.
 *
 * 2. **Fetch All Orders**: It retrieves all existing order IDs from GHL using the `fetchGhlOrderList` service.
 *
 * 3. **Filter Orders by Product Availability**: For each order, the order details are fetched using `fetchGhlOrderDetails`.
 *    The route then checks whether the product ID associated with the order exists in the list of valid product IDs.
 *    If the product is valid, the order ID is added to the list of valid orders.
 *
 * 4. **Save the Valid Order List**: After filtering the orders, the valid order IDs are saved into a JSON file
 *    (`public/valid_order_list.json`) on the server. This JSON file can be referenced later to avoid processing
 *    orders that don't contain valid products.
 *
 * 5. **Revalidation**: This process can be invoked during the application load and set to revalidate periodically
 *    (e.g., once per hour) to keep the valid order list updated.
 *
 * **Error Handling**: In case of any error during the process (e.g., network issues with GHL, or missing product data),
 * the route responds with a detailed error message.
 *
 * **Usage**: This route is intended to be used as part of a background process that keeps the order sync process
 * optimized by excluding orders with invalid or unavailable products, thus lightening the load on the system during order syncs.
 */

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchGhlOrderList,
  fetchGhlOrderDetails,
} from "@/services/ghlServices"; // Adjust the imports as needed

export async function GET(req: NextRequest) {
  return NextResponse.json(
    {
      message:
        "GET request successful! This endpoint uses POST. Plz use Postman",
    },
    { status: 200 }
  );
}

// POST method to handle generating the valid order list
export async function POST(req: NextRequest) {
  try {
    const locationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

    // Step 1: Fetch product IDs using the events endpoint
    const productResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/events`
    );
    const { productIds } = await productResponse.json();

    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: "No valid products found" },
        { status: 400 }
      );
    }

    // Step 2: Fetch all order IDs from the GHL API
    const orderIds = await fetchGhlOrderList();

    console.log("Order IDs:", orderIds);
    console.log("Product IDs:", productIds);

    // Step 3: Filter orders based on product availability
    const validOrderIds = [];
    for (const orderId of orderIds) {
      // Fetch order details asynchronously
      const orderDetails = await fetchGhlOrderDetails(orderId);
      console.log("Order Details:", orderDetails);

      if (orderDetails?.items && orderDetails.items.length > 0) {
        const productId = orderDetails.items[0]?.product?._id;
        if (productIds.includes(productId)) {
          validOrderIds.push(orderId);
        }
      }
    }

    // Step 4: Write the valid order list to a JSON file
    const jsonFilePath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );

    fs.writeFileSync(jsonFilePath, JSON.stringify(validOrderIds, null, 2));

    // Return success response
    return NextResponse.json(
      { message: "Valid order list generated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating valid order list:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
