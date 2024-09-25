import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Your Supabase setup

// Static data for upserting into the test_orders table
const testData = [
  { product_name: "Product A", quantity: 2, order_status: "synced" },
  { product_name: "Product B", quantity: 1, order_status: "synced" },
  { product_name: "Product C", quantity: 3, order_status: "synced" },
];

// Import the valid orders from a JSON file
import validOrders from "@/public/valid_order_list.json"; // Update path as needed

export async function GET() {
  const supabase = createClient();

  try {
    // Loop through the valid orders and upsert data
    for (let i = 0; i < validOrders.length; i++) {
      const orderId = validOrders[i];
      const staticData = testData[i % testData.length]; // Cycle through testData

      console.log(
        `Upserting order: ${orderId} with product: ${staticData.product_name}`
      );

      // Perform upsert
      const { error } = await supabase.from("test_orders").upsert({
        order_id: orderId,
        product_name: staticData.product_name,
        quantity: staticData.quantity,
        order_status: staticData.order_status,
      });

      // Delay of 2 seconds between each insert
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (error) {
        console.error(`Error upserting order ${orderId}:`, error);
      } else {
        console.log(`Order ${orderId} upserted successfully.`);
      }
    }

    return NextResponse.json({ message: "Test sync completed" });
  } catch (error: any) {
    console.error("Error during sync process:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
