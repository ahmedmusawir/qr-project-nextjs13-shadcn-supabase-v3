import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./utils";

// Sync tickets for a specific order
export const syncTickets = async (
  orderId: string,
  ticketQuantities: { [key: string]: number },
  supabase: SupabaseClient
) => {
  for (const [ticketType, qty] of Object.entries(ticketQuantities)) {
    // Check if tickets already exist for this order and type
    const { data: existingTickets, error: ticketError } = await supabase
      .from("ghl_qr_tickets")
      .select("*")
      .eq("order_id", orderId)
      .eq("ticket_type", ticketType);

    if (ticketError) {
      logger.error(
        `[Error fetching tickets for order ${orderId}: ${ticketError.message}]`
      );
      continue;
    }

    const existingCount = existingTickets ? existingTickets.length : 0;

    // Insert missing tickets based on comparison
    for (let i = existingCount; i < qty; i++) {
      logger.info(`[Inserting missing ${ticketType} ticket for ${orderId}]`);
      await supabase.from("ghl_qr_tickets").upsert({
        order_id: orderId,
        ticket_type: ticketType,
        status: "live",
      });
    }

    logger.info(`[Completed syncing tickets for Order ID: ${orderId}]`);
  }
};
