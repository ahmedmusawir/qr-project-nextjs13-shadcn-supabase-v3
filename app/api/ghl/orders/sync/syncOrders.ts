import { fetchGhlOrderDetails } from "@/services/ghlServices";
import { SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const syncOrders = async (supabase: SupabaseClient, logger: any) => {
  // Step 1: Fetch the list of valid orders from the JSON file
  const validOrderListPath = path.join(
    process.cwd(),
    "public",
    "valid_order_list.json"
  );
  const validOrderIds = JSON.parse(
    fs.readFileSync(validOrderListPath, "utf-8")
  );

  logger.info(`[Valid Order IDs]:`, validOrderIds);

  let ordersSynced = 0;
  let ticketQuantitiesArray: Array<{
    orderId: string;
    quantities: { [key: string]: number };
  }> = [];

  // Step 2: Loop through each valid order and sync
  for (const orderId of validOrderIds) {
    logger.info(`[Starting sync for Order ID: ${orderId}]`);

    // Fetch order details from GHL API
    const orderDetails = await fetchGhlOrderDetails(orderId);
    if (!orderDetails) {
      logger.warn(`[Order ${orderId} not found. Skipping.]`);
      continue;
    }

    // Initialize ticket quantities object for this order
    let ticketQuantities: { [key: string]: number } = {};

    // Step 3: Extract ticket quantities
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
    }

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
      ticket_quantities: ticketQuantities, // Store dynamic ticket quantities
    });

    // Add the order ID and its corresponding ticket quantities to the array
    ticketQuantitiesArray.push({
      orderId,
      quantities: ticketQuantities,
    });

    ordersSynced++;
  }

  // Return an array of objects containing orderId and its ticket quantities
  return { ordersSynced, ticketQuantitiesArray };
};
