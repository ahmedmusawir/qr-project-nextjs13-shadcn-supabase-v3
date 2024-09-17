import { NextResponse } from "next/server";
import { fetchGhlOrderDetails } from "@/services/ghlServices";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Step 1: Fetch the list of valid orders from the JSON file
    const validOrderListPath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );
    const validOrderIds = JSON.parse(
      fs.readFileSync(validOrderListPath, "utf-8")
    );

    console.log("[/api/ghl/orders/sync] Valid Order IDs:", validOrderIds);

    // Process each valid order
    for (const orderId of validOrderIds) {
      const orderDetails = await fetchGhlOrderDetails(orderId);
      console.log(`[Order Details for ${orderId}]`, orderDetails);

      // Initialize ticket quantities object
      let ticketQuantities: { [key: string]: number } = {};

      // Step 2: Loop through the order items and extract ticket type and quantity
      for (const item of orderDetails.items) {
        const ticketType = item.price?.name; // Extract ticket type
        const qty = item.qty; // Extract ticket quantity

        if (!ticketQuantities[ticketType]) {
          ticketQuantities[ticketType] = 0;
        }

        ticketQuantities[ticketType] += qty;

        // Log the ticket type and quantity for debugging
        console.log(`Ticket type: ${ticketType}, Quantity: ${qty}`);
      }

      // Log the final ticket quantities for each order
      console.log(
        `Final Ticket Quantities for Order ${orderId}:`,
        ticketQuantities
      );
    }

    return NextResponse.json({
      message: "Orders processed successfully (DB actions skipped)",
    });
  } catch (error: any) {
    console.error("[/api/ghl/orders/sync] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
