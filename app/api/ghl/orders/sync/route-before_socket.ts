import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { syncOrders } from "./syncOrders";
import { syncTickets } from "./syncTickets";
import { createCustomLogger } from "@/utils/logging/logger";

export async function GET() {
  const logger = createCustomLogger("ghl-order-sync", "sync");

  try {
    const supabase = createClient();

    // Start the timer
    const startTime = Date.now();
    let totalOrdersSynced = 0;
    let totalTicketsAdded = 0;

    // Step 1: Sync Orders and get the order IDs and ticket quantities
    const { ticketQuantitiesArray } = await syncOrders(supabase, logger);

    // Count the total number of orders synced
    totalOrdersSynced = ticketQuantitiesArray.length;

    // Step 2: Loop through each order and sync tickets
    for (const { orderId, quantities } of ticketQuantitiesArray) {
      const ticketsAdded = await syncTickets(
        orderId,
        quantities,
        supabase,
        logger
      );
      totalTicketsAdded += ticketsAdded;
    }

    // Capture the end time and calculate total time taken
    const endTime = Date.now();
    const totalTimeMs = endTime - startTime;
    const totalMinutes = Math.floor(totalTimeMs / 60000);
    const totalSeconds = Math.floor((totalTimeMs % 60000) / 1000);

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
