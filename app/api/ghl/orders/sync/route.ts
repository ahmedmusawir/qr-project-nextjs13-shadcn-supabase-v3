import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { syncOrders } from "./syncOrders";
import { syncTickets } from "./syncTickets";
import { createCustomLogger } from "@/utils/logging/logger";
import { updateSyncStatus } from "@/services/syncStatusService";
import { SyncStatus } from "@/types/sync";
import fs from "fs";
import path from "path";

export async function GET() {
  const logger = createCustomLogger("ghl-order-sync", "sync");

  // Access the global Socket.IO instance
  const io = globalThis.io;

  try {
    const supabase = createClient();

    // Start the timer in milliseconds for calculating total time
    const startTimeMs = Date.now();
    let totalOrdersSynced = 0;
    let totalTicketsAdded = 0;

    // **NEW**: Fetch the list of valid orders to get totalOrders
    const validOrderListPath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );
    const validOrderIds = JSON.parse(
      fs.readFileSync(validOrderListPath, "utf-8")
    );
    const totalOrders = validOrderIds.length;

    // Emit initial sync status (broadcast to all clients)
    const initialStatus: SyncStatus = {
      syncInProgress: true,
      startTime: new Date().toISOString(), // Set start time when the sync started
      endTime: null,
      totalOrders: totalOrders, // Total orders that need syncing
      syncedOrders: 0, // Initial synced order count
      status: "Syncing", // Sync in progress
      delay_in_sec: 0, // No delay initially
    };
    if (io) {
      io.emit("sync_status", initialStatus);
    }
    logger.info("Broadcasted initial sync status:", initialStatus);

    // **Pass io to syncOrders**
    const { ticketQuantitiesArray } = await syncOrders(supabase, logger, io);

    // Count the total number of orders synced
    totalOrdersSynced = ticketQuantitiesArray.length;

    // Step 2: Loop through each order and sync tickets
    for (let i = 0; i < totalOrdersSynced; i++) {
      const { orderId, quantities } = ticketQuantitiesArray[i];
      const ticketsAdded = await syncTickets(
        orderId,
        quantities,
        supabase,
        logger,
        io
      );
      totalTicketsAdded += ticketsAdded;

      // Emit progress after each order's tickets are synced
      if (io) {
        const progressStatus = {
          syncInProgress: true,
          totalOrders: totalOrders,
          syncedOrders: i + 1, // Orders synced so far
          totalTickets: totalTicketsAdded,
          status: "Syncing Orders", // Still in syncing process
        };
        io.emit("sync_progress", progressStatus);
        logger.info("Broadcasted sync progress:", progressStatus);
      }
    }

    // Broadcast ticket syncing phase before starting
    if (io) {
      io.emit("sync_ticket_progress", {
        totalTicketsChecked: 0,
        totalTicketTypes: 0,
        status: "Verifying Tickets",
      });
      logger.info("Broadcasted ticket verification phase started.");
    }

    // Capture the end time as a string (for logging)
    const endTimeStr = new Date().toISOString();

    // Final status to be updated in the JSON and broadcast to clients
    const finalStatus: SyncStatus = {
      syncInProgress: false,
      startTime: initialStatus.startTime, // Keep original start time
      endTime: endTimeStr, // Set end time
      totalOrders: totalOrders,
      syncedOrders: totalOrders,
      status: "Delay", // Set to Delay after sync
      delay_in_sec: 30, // Delay in seconds
    };

    await updateSyncStatus(finalStatus); // Ensure this line runs after the sync process ends

    // Also, emit the final sync status via WebSocket
    if (io) {
      io.emit("sync_status", finalStatus); // Emit the final status
      io.emit("sync_complete", { message: "Sync Process Complete!" });
    }

    // Calculate total time taken
    const endTimeMs = Date.now(); // Capture the end time in milliseconds
    const totalTimeMs = endTimeMs - startTimeMs; // Total time in milliseconds
    const totalMinutes = Math.floor(totalTimeMs / 60000); // Minutes
    const totalSeconds = Math.floor((totalTimeMs % 60000) / 1000); // Remaining seconds

    // Log the sync summary
    logger.info(`
      =============================================
      SYNC PROCESS SUCCESSFUL!
      TOTAL ORDERS SYNCED: ${totalOrdersSynced}
      TOTAL TICKETS ADDED: ${totalTicketsAdded}
      TOTAL TIME TAKEN: ${totalMinutes} min ${totalSeconds} sec
      =============================================
    `);

    return NextResponse.json({
      message: "Orders and tickets synced successfully",
    });
  } catch (error: any) {
    logger.error(`[Error during sync: ${error.message}]`);

    // Emit error status to Socket.IO
    if (io) {
      io.emit("sync_status", {
        syncInProgress: false,
        totalOrders: 0,
        syncedOrders: 0,
        totalTickets: 0,
        status: "Error", // Sync failed
      });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
