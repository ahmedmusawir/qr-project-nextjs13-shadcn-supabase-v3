/**
 * Endpoint: /api/ghl/orders/[id]
 *
 * This endpoint is used to fetch specific order details from GHL (GoHighLevel)
 * using the provided order ID. Once the order details are retrieved, it performs
 * the following operations:
 *
 * 1. Extracts key information from the order such as payment details, contact info,
 *    event details, and ticket quantities.
 *
 * 2. Upserts (inserts or updates) the order information into the 'ghl_qr_orders'
 *    table to ensure that the latest order details are stored in the Supabase database.
 *
 * 3. Checks the quantity of tickets associated with the order (VIP, Regular, etc.) and
 *    inserts only the missing tickets into the 'ghl_qr_tickets' table. This ensures that
 *    no duplicate tickets are added while keeping the ticket data in sync with GHL.
 *
 * 4. Returns a JSON response confirming the sync process, or an error message if any
 *    issues occur during the execution.
 *
 * This endpoint is intended to be called after a new order is placed, keeping the
 * Supabase database up to date with the latest order and ticket information.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  fetchGhlOrderDetails,
  fetchTicketTypesFromJson,
  fetchTicketTypesFromApi,
} from "@/services/ghlServices";

// Async function to handle the GET request
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const orderId = params.id;

    // Step 1: Fetch the order details using the orderId
    const orderDetails = await fetchGhlOrderDetails(orderId);

    if (!orderDetails) {
      throw new Error(`Order not found for ID: ${orderId}`);
    }

    // console.log(`[Order Details for ${orderId}]`, orderDetails);

    // Step 2: Initialize ticket quantities
    let ticketQuantities: { [key: string]: number } = {};

    // Step 3: Loop through the order items and fetch ticket types
    for (const item of orderDetails.items) {
      const productId = item.product._id;
      const locationId = orderDetails.altId;

      // Try fetching ticket types from the JSON file
      let ticketTypes = await fetchTicketTypesFromJson(productId);

      // Fallback to GHL API if ticket types not found in the JSON
      if (ticketTypes.length === 0) {
        ticketTypes = await fetchTicketTypesFromApi(productId, locationId);
      }

      // Calculate quantities based on the ticket types
      for (const type of ticketTypes) {
        if (!ticketQuantities[type]) {
          ticketQuantities[type] = 0;
        }
        ticketQuantities[type] += item.qty;
      }
    }

    // Step 4: Upsert the order details into `ghl_qr_orders`
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
      ticket_quantities: ticketQuantities, // Store the dynamic ticket quantities
    });

    // Step 4: Insert missing tickets into `ghl_qr_tickets`
    for (const item of orderDetails.items) {
      const ticketType = item.price?.name;
      const qty = item.qty;

      // First, check how many tickets already exist for this order
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

      // Insert the tickets
      for (let i = existingCount; i < qty; i++) {
        await supabase.from("ghl_qr_tickets").insert({
          order_id: orderDetails._id,
          ticket_type: ticketType,
          status: "live",
        });
      }
    }

    // Return a success response
    return NextResponse.json({
      message: `Order ${orderId} synced successfully.`,
    });
  } catch (error: any) {
    // Handle errors and return an error response
    console.error(`Error syncing order ${params.id}:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
