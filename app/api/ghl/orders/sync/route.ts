import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchGhlOrderDetails } from "@/services/ghlServices";
import fs from "fs";
import path from "path";
// import { orderSyncLogger as logger } from "@/utils/logging/logger";
import { createCustomLogger } from "@/utils/logging/logger";

export async function GET() {
  try {
    const supabase = createClient();

    const logger = createCustomLogger("ghl-order-sync", "sync");

    // Step 1: Fetch the list of valid orders from the JSON file
    const validOrderListPath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );
    const validOrderIds = JSON.parse(
      fs.readFileSync(validOrderListPath, "utf-8")
    );

    // Log the valid order IDs
    logger.info(`[Valid Order IDs]:`, validOrderIds);

    // Step 2: Loop through each valid order and sync
    for (const orderId of validOrderIds) {
      logger.info(`[Starting sync for Order ID: ${orderId}]`);

      // Fetch order details from GHL API
      const orderDetails = await fetchGhlOrderDetails(orderId);
      if (!orderDetails) {
        logger.warn(`[Order ${orderId} not found. Skipping.]`);
        continue;
      }

      logger.info(`[Order details for ${orderId}:`, orderDetails);

      // Initialize ticket quantities object
      let ticketQuantities: { [key: string]: number } = {};

      // Step 3: Loop through the order items and extract ticket type and quantity
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

      // Step 4: Upsert order details into `ghl_qr_orders`
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

      // Log order upsert success
      logger.info(`[Order ${orderId} upserted.]`);

      // Step 5: Upsert tickets into `ghl_qr_tickets` based on ticket type
      for (const [ticketType, qty] of Object.entries(ticketQuantities)) {
        // Check if tickets already exist for this order and type
        const { data: existingTickets, error: ticketError } = await supabase
          .from("ghl_qr_tickets")
          .select("*")
          .eq("order_id", orderDetails._id)
          .eq("ticket_type", ticketType);

        if (ticketError) {
          logger.error(
            `[Error fetching tickets for order ${orderId}: ${ticketError.message}]`
          );
          continue;
        }

        const existingCount = existingTickets ? existingTickets.length : 0;

        // Insert missing tickets
        for (let i = existingCount; i < qty; i++) {
          logger.info(
            `[Inserting missing ${ticketType} ticket for ${orderId}]`
          );
          await supabase.from("ghl_qr_tickets").upsert({
            order_id: orderDetails._id,
            ticket_type: ticketType,
            status: "live",
          });
        }
      }

      logger.info(`[Sync for order ${orderId} complete.]`);
    }

    return NextResponse.json({
      message: "Orders and tickets synced successfully",
    });
  } catch (error: any) {
    const logger = createCustomLogger("ghl-order-sync", "sync");
    logger.error(`[Error during sync: ${error.message}]`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
