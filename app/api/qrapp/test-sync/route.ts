import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { updateSyncStatus } from "@/services/syncStatusService"; // Service to update sync status
import validOrders from "@/public/valid_order_list.json"; // Assuming this is the order list
import { SyncStatus } from "@/types/sync";

// Static data for upserting into the test_orders table
const testData = [
  { product_name: "Product A", quantity: 2, order_status: "synced" },
  { product_name: "Product B", quantity: 1, order_status: "synced" },
  { product_name: "Product C", quantity: 3, order_status: "synced" },
];

export async function GET() {
  const supabase = createClient();
  const io = globalThis.io; // Access the global Socket.IO instance

  try {
    // Capture the start time
    const startTime = new Date().toISOString();

    // Update the sync status to indicate the sync has started
    const initialStatus: SyncStatus = {
      syncInProgress: true,
      startTime, // Start time when the sync started
      endTime: null,
      totalOrders: validOrders.length, // Dynamic order count
      syncedOrders: 0,
      status: "Syncing", // Syncing status
      delay_in_sec: 0,
    };

    // Update the sync status JSON to reflect the start of the sync process
    await updateSyncStatus(initialStatus);

    // Broadcast the initial sync status
    if (io) {
      io.emit("sync_status", initialStatus);
      console.log("Broadcasted sync status (Start):", initialStatus);
    }

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

      if (error) {
        console.error(`Error upserting order ${orderId}:`, error);
      } else {
        console.log(`Order ${orderId} upserted successfully.`);
      }

      // Broadcast the updated progress after each upsert
      const progressStatus: SyncStatus = {
        ...initialStatus,
        syncedOrders: i + 1, // Update the syncedOrders count
        status: "Syncing",
      };

      if (io) {
        io.emit("sync_progress", progressStatus);
        console.log("Broadcasted sync progress:", progressStatus);
      }

      // Delay of 2 seconds between each insert to simulate real-time processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("ALL ORDERS UPDATED SUCCESS! /api/qrapp/test-sync");

    // Capture the end time
    const endTime = new Date().toISOString();

    // Update the sync status to indicate sync is complete with delay
    const finalStatus: SyncStatus = {
      syncInProgress: false,
      startTime, // Same start time
      endTime, // Sync completed time
      totalOrders: validOrders.length, // Total orders synced
      syncedOrders: validOrders.length, // All orders synced
      status: "Delay", // Set to Delay after sync
      delay_in_sec: 60, // Delay for 60 seconds (for now)
    };

    console.log("=======================================");
    console.log("/api/qrapp/test-sync: NEW DELAY STATUS", finalStatus);
    console.log("=======================================");

    // Update the sync status JSON to reflect the completion of the sync process
    await updateSyncStatus(finalStatus);

    // Broadcast the final sync completion status
    if (io) {
      io.emit("sync_status", finalStatus);
      console.log("Broadcasted final sync status (Completion):", finalStatus);
    }

    console.log("Sync process complete. Status updated to 'Delay'.");

    return NextResponse.json({ message: "Test sync completed successfully" });
  } catch (error: any) {
    console.error("Error during sync process:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
