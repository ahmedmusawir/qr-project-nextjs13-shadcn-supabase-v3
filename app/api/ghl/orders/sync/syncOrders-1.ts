import { SupabaseClient } from "@supabase/supabase-js";
import { fetchGhlOrderDetails } from "@/services/ghlServices";
import { logger } from "./utils";

export const syncOrderDetails = async (
  orderId: string,
  supabase: SupabaseClient
) => {
  logger.info(`[Starting sync for Order ID: ${orderId}]`);

  // Fetch order details from GHL API
  const orderDetails = await fetchGhlOrderDetails(orderId);
  if (!orderDetails) {
    logger.warn(`[Order ${orderId} not found. Skipping.]`);
    return false;
  }

  logger.info(`[Order details for ${orderId}:`, orderDetails);

  // Initialize ticket quantities object
  let ticketQuantities: { [key: string]: number } = {};

  // Extract ticket types and quantities
  for (const item of orderDetails.items) {
    const ticketType = item.price?.name;
    const qty = item.qty;

    if (!ticketType || !qty) {
      logger.error(
        `[Missing ticket type or quantity for item in order ${orderId}.]`
      );
      continue;
    }

    if (!ticketQuantities[ticketType]) {
      ticketQuantities[ticketType] = 0;
    }
    ticketQuantities[ticketType] += qty;

    logger.info(`[Ticket type: ${ticketType}, Quantity: ${qty}]`);
  }

  // Log final ticket quantities for the order
  logger.info(
    `[Final Ticket Quantities for Order ${orderId}:`,
    ticketQuantities
  );

  // Upsert order details into `ghl_qr_orders`
  await supabase.from("ghl_qr_orders").upsert({
    order_id: orderDetails._id,
    location_id: orderDetails.altId,
    total_paid: orderDetails.amount,
    payment_status: orderDetails.paymentStatus,
    payment_currency: orderDetails.currency,
    order_status: orderDetails.status,
    contact_id: orderDetails.contactSnapshot?.id,
    contact_firstname: orderDetails.contactSnapshot?.firstName,
    contact_lastname: orderDetails.contactSnapshot?.lastName,
    contact_email: orderDetails.contactSnapshot?.email,
    contact_phone: orderDetails.contactSnapshot?.phone,
    date_added: orderDetails.createdAt,
    event_id: orderDetails.items[0]?.product?._id,
    event_name: orderDetails.items[0]?.product?.name,
    event_image: orderDetails.items[0]?.product?.image,
    event_ticket_qty: Object.values(ticketQuantities).reduce(
      (acc, qty) => acc + qty,
      0
    ),
    ticket_quantities: ticketQuantities,
  });

  logger.info(`[Order ${orderId} upserted successfully.]`);

  return ticketQuantities; // Return ticket quantities for further ticket processing
};
