import { SupabaseClient } from "@supabase/supabase-js";

// Sync tickets for a specific order
export const syncTickets = async (
  orderId: string,
  ticketQuantities: { [key: string]: number },
  supabase: SupabaseClient,
  logger: any,
  io: any // Add io instance here to broadcast updates
) => {
  let ticketsAdded = 0;
  let ticketsChecked = 0;
  const totalTicketTypes = Object.entries(ticketQuantities).length;

  for (const [ticketType, qty] of Object.entries(ticketQuantities)) {
    // Check if tickets already exist for this order and type
    const { data: existingTickets, error: ticketError } = await supabase
      .from("ghl_qr_tickets")
      .select("*")
      .eq("order_id", orderId)
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
        order_id: orderId,
        ticket_type: ticketType,
        status: "live",
      });
      ticketsAdded++;
    }

    // Update the ticket verification progress
    ticketsChecked++;
    const ticketProgressStatus = {
      syncInProgress: true,
      totalOrders: 0, // Since we are in ticket sync phase, orders are irrelevant here
      syncedOrders: 0, // Ignore syncedOrders for tickets
      totalTicketsChecked: ticketsChecked, // Track how many ticket types are processed
      totalTicketTypes, // Total types of tickets for this order
      status: `Verifying Tickets for Order ${orderId}`,
    };

    if (io) {
      io.emit("sync_ticket_progress", ticketProgressStatus);
      logger.info("Broadcasted sync ticket progress:", ticketProgressStatus);
    }
  }

  return ticketsAdded;
};
