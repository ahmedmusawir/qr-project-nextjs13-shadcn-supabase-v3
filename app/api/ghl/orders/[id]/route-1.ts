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
import { fetchGhlOrderDetails } from "@/services/ghlServices";

// Helper function to fetch price name
async function fetchPriceName(
  productId: string,
  priceId: string,
  locationId: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/price/${priceId}?product_id=${productId}&location_id=${locationId}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(`Failed to fetch price name: ${data.error}`);
  }
  return data.priceName;
}

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

    console.log(`[Order Details for ${orderId}]`, orderDetails);

    // Initialize ticket quantities
    const ticketQuantities: { [key: string]: number } = {};

    // Step 2: Calculate ticket quantities based on order items
    for (const item of orderDetails.items) {
      const productId = item.product._id;
      const priceId = item.price._id;
      const locationId = orderDetails.altId;

      // Fetch the dynamic price name
      const priceName = await fetchPriceName(productId, priceId, locationId);

      // Add the quantity to the correct ticket type (dynamic)
      ticketQuantities[priceName] =
        (ticketQuantities[priceName] || 0) + item.qty;
    }

    // Step 3: Upsert the order details into `ghl_qr_orders`
    const { error: upsertError } = await supabase.from("ghl_qr_orders").upsert({
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
      event_ticket_price: orderDetails.items[0]?.price?.amount,
      event_ticket_type: orderDetails.items[0]?.price?.name,
      event_ticket_currency: orderDetails.items[0]?.price?.currency,
      event_available_qty: orderDetails.items[0]?.price?.availableQuantity,
      event_ticket_qty: orderDetails.items[0]?.qty,
      // Upsert the total quantities dynamically for all ticket types
      ticket_quantities: ticketQuantities,
    });

    if (upsertError) {
      console.error("Error upserting order details:", upsertError.message);
    } else {
      console.log("Order details upserted successfully.");
    }

    // Step 4: Insert missing tickets into `ghl_qr_tickets`
    for (const item of orderDetails.items) {
      const productId = item.product._id;
      const priceId = item.price._id;
      const locationId = orderDetails.altId;

      // Fetch the dynamic price name
      const ticketType = await fetchPriceName(productId, priceId, locationId);
      const qty = item.qty;
      console.log("THIS IS THE TICKET TYPE:", ticketType);

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

      // Insert only the missing tickets
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
