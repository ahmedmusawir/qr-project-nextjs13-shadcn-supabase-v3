import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  fetchGhlOrderDetails,
  fetchTicketTypesFromJson,
  fetchTicketTypesFromApi,
} from "@/services/ghlServices";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const supabase = createClient();

    // Step 1: Fetch the list of valid orders from the JSON file
    const validOrderListPath = path.join(
      process.cwd(),
      "public",
      "valid_order_list.json"
    );
    const validOrderIds = JSON.parse(
      fs.readFileSync(validOrderListPath, "utf-8")
    );

    console.log("[/api/ghl/orders/sync] Valid Order IDs:", validOrderIds);

    for (const orderId of validOrderIds) {
      const orderDetails = await fetchGhlOrderDetails(orderId);
      console.log(`[Order Details for ${orderId}]`, orderDetails);

      let ticketQuantities: { [key: string]: number } = {};

      // Step 2: Calculate ticket quantities based on dynamic ticket types
      for (const item of orderDetails.items) {
        const productId = item.product._id;
        const locationId = orderDetails.altId;

        let ticketTypes = await fetchTicketTypesFromJson(productId);
        if (ticketTypes.length === 0) {
          ticketTypes = await fetchTicketTypesFromApi(productId, locationId);
        }

        // Add ticket quantities
        for (const type of ticketTypes) {
          if (!ticketQuantities[type]) {
            ticketQuantities[type] = 0;
          }
          ticketQuantities[type] += item.qty;
        }
      }

      const totalTicketQty = Object.values(ticketQuantities).reduce(
        (acc, qty) => acc + qty,
        0
      );

      // Upsert into `ghl_qr_orders` (this should not affect the tickets)
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
        ticket_quantities: ticketQuantities, // Store dynamic ticket quantities
      });

      // Step 3: Insert or update tickets into `ghl_qr_tickets`
      for (const [ticketType, qty] of Object.entries(ticketQuantities)) {
        // Fetch existing tickets to avoid replacing them
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
        console.log(
          `Existing ${ticketType} tickets for ${orderId}: ${existingCount}`
        );

        // Insert missing tickets
        for (let i = existingCount; i < qty; i++) {
          console.log(`Inserting missing ${ticketType} ticket for ${orderId}`);
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
