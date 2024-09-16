import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  fetchGhlOrderList,
  fetchGhlOrderDetails,
  fetchTicketTypesFromJson,
  fetchTicketTypesFromApi,
} from "@/services/ghlServices";

export async function GET() {
  try {
    const supabase = createClient();

    // Step 1: Fetch the list of orders (just IDs)
    const orderIds = await fetchGhlOrderList();

    console.log("[/api/ghl/orders/sync] Order IDs:", orderIds);

    // Step 2: Loop through each order ID to fetch the order details
    for (const orderId of orderIds) {
      const orderDetails = await fetchGhlOrderDetails(orderId);

      console.log(`[Order Details for ${orderId}]`, orderDetails);

      // Initialize ticket quantities object
      let ticketQuantities: { [key: string]: number } = {};

      // Step 3: Calculate ticket quantities based on dynamic ticket types
      for (const item of orderDetails.items) {
        const productId = item.product._id;
        const locationId = orderDetails.altId;

        // Try fetching ticket types from the JSON file first
        let ticketTypes = await fetchTicketTypesFromJson(productId);

        // Fallback to GHL API if ticket types are not found in the JSON file
        if (ticketTypes.length === 0) {
          ticketTypes = await fetchTicketTypesFromApi(productId, locationId);
        }

        // Add quantities based on ticket types
        for (const type of ticketTypes) {
          if (!ticketQuantities[type]) {
            ticketQuantities[type] = 0;
          }
          ticketQuantities[type] += item.qty;
        }
      }

      // Step 4: Upsert into `ghl_qr_orders`
      const totalTicketQty = Object.values(ticketQuantities).reduce(
        (acc, qty) => acc + qty,
        0
      );

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
        event_ticket_qty: totalTicketQty,
        ticket_quantities: ticketQuantities, // Store the dynamic ticket quantities
      });

      // Step 5: Insert or update tickets into `ghl_qr_tickets`
      for (const [ticketType, qty] of Object.entries(ticketQuantities)) {
        // Check existing tickets for the given type
        const { data: existingTickets, error } = await supabase
          .from("ghl_qr_tickets")
          .select("*")
          .eq("order_id", orderDetails._id)
          .eq("ticket_type", ticketType);

        if (error) {
          console.error(
            `Error fetching existing tickets for order ${orderId}:`,
            error.message
          );
          continue;
        }

        const existingCount = existingTickets ? existingTickets.length : 0;

        // Insert only the missing tickets
        for (let i = existingCount; i < qty; i++) {
          await supabase.from("ghl_qr_tickets").insert({
            order_id: orderDetails._id,
            ticket_type: ticketType,
            status: "live",
          });
        }
      }
    }

    return NextResponse.json({
      message: "Orders synced successfully",
    });
  } catch (error: any) {
    console.error("[/api/ghl/orders/sync] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
