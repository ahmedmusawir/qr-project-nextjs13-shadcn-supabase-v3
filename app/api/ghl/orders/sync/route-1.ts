import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getValidOrderIds, logger } from "./utils";
import { syncOrderDetails } from "./syncOrders";
import { syncTickets } from "./syncTickets";

export async function GET() {
  try {
    const supabase = createClient();

    // Step 1: Fetch the list of valid orders from the JSON file
    const validOrderIds = getValidOrderIds();
    logger.info(`[Valid Order IDs]:`, validOrderIds);

    // Step 2: Loop through each valid order and sync
    for (const orderId of validOrderIds) {
      const ticketQuantities = await syncOrderDetails(orderId, supabase);
      if (ticketQuantities) {
        await syncTickets(orderId, ticketQuantities, supabase);
      }
    }

    return NextResponse.json({
      message: "Orders and tickets synced successfully",
    });
  } catch (error: any) {
    logger.error(`[Error during sync: ${error.message}]`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
