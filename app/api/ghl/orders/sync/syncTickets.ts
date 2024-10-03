import { SupabaseClient } from "@supabase/supabase-js";

// Sync tickets for a specific order
export const syncTickets = async (
  orderId: string, // Add orderId as a parameter
  ticketQuantities: { [key: string]: number },
  supabase: SupabaseClient,
  logger: any
) => {
  let ticketsAdded = 0;

  for (const [ticketType, qty] of Object.entries(ticketQuantities)) {
    // Check if tickets already exist for this order and type
    const { data: existingTickets, error: ticketError } = await supabase
      .from("ghl_qr_tickets")
      .select("*")
      .eq("order_id", orderId) // Use orderId here
      .eq("ticket_type", ticketType);

    if (ticketError) {
      logger.error(
        `[Error fetching tickets for ticket type ${ticketType}: ${ticketError.message}]`
      );
      continue;
    }

    const existingCount = existingTickets ? existingTickets.length : 0;

    // Insert missing tickets
    for (let i = existingCount; i < qty; i++) {
      logger.info(
        `[Inserting missing ${ticketType} ticket for order ${orderId}]`
      );
      await supabase.from("ghl_qr_tickets").upsert({
        order_id: orderId, // Use orderId here
        ticket_type: ticketType,
        status: "live",
      });

      ticketsAdded++;
    }
  }

  return ticketsAdded;
};
