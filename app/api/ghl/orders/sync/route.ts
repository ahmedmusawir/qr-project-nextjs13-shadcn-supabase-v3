import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  fetchGhlOrderList,
  fetchGhlOrderDetails,
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

      // Initialize quantities
      let vipQty = 0;
      let regularQty = 0;

      // Step 3: Calculate ticket quantities and update `ghl_qr_orders`
      for (const item of orderDetails.items) {
        if (item.price?.name === "VIP") {
          vipQty += item.qty;
        } else if (item.price?.name === "Regular") {
          regularQty += item.qty;
        }
      }

      // Upsert into `ghl_qr_orders`
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
        date_added: orderDetails.contactSnapshot?.dateAdded,
        event_id: orderDetails.items[0]?.product?._id,
        event_name: orderDetails.items[0]?.product?.name,
        event_image: orderDetails.items[0]?.product?.image,
        event_ticket_price: orderDetails.items[0]?.price?.amount,
        event_ticket_type: orderDetails.items[0]?.price?.name,
        event_ticket_currency: orderDetails.items[0]?.price?.currency,
        event_available_qty: orderDetails.items[0]?.price?.availableQuantity,
        event_ticket_qty: orderDetails.items[0]?.qty,
        vip_ticket_qty: vipQty,
        regular_ticket_qty: regularQty,
      });

      // Step 4: Insert or update tickets into `ghl_qr_tickets`
      for (const item of orderDetails.items) {
        const ticketType = item.price?.name;
        const qty = item.qty;

        console.log("QUANTITY: ", qty);

        // First, check how many tickets already exist
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
