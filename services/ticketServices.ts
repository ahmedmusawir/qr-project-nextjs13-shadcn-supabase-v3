// Service function to update the status of a single ticket by ticket_id.
// Sends a PUT request to the /api/qrapp/tickets/status/[id] endpoint with the new status.

export async function updateTicketStatusById(
  ticket_id: string,
  status: string
) {
  try {
    const response = await fetch(`/api/qrapp/tickets/status/${ticket_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Error updating ticket status by ID:", error);
    throw error;
  }
}

// Service function to update the status of all tickets for a given order_id.
// Sends a PUT request to the /api/qrapp/tickets/status endpoint with the order_id and new status to update all related tickets.

export async function updateTicketsStatusByOrderId(
  order_id: string,
  status: string
) {
  try {
    const response = await fetch(`/api/qrapp/tickets/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id, status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    console.error("Error updating tickets status by order ID:", error);
    throw error;
  }
}

/**
 * Service: fetchAndGenerateTicketTypes
 *
 * This service function is responsible for fetching product IDs from the GHL events API
 * and generating the ticket types JSON file. It sends a POST request to the
 * /api/ghl/ticket-types API, passing the product IDs and location ID as the request body.
 *
 * The function uses Next.js's revalidation feature to cache the product IDs API call for
 * 5 minutes (300 seconds) to avoid excessive server calls. The ticket types JSON
 * file is updated only when the cache is invalidated or expired.
 *
 * The generated ticket types JSON file is saved to the public directory and
 * contains a list of ticket types for each product.
 */

// This function will handle fetching and caching of ticket types
export async function fetchAndGenerateTicketTypes(): Promise<void> {
  try {
    // Fetch product IDs from the GHL events API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/events`,
      {
        method: "GET",
        next: { revalidate: 3600 }, // Cache for 5 minutes
      }
    );

    const data = await response.json();
    if (data.productIds) {
      const productIds = data.productIds;
      const locationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

      // Call the server-side API to generate the ticket types JSON
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ghl/ticket-types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds, locationId }),
          cache: "no-cache",
          // next: { revalidate: 300 }, // This will not generate any json file
        }
      );

      // console.log("RESPONSE ticketServices:", res);

      if (res.ok) {
        console.log("Ticket types JSON generated successfully.");
      } else {
        console.error("Failed to generate ticket types JSON");
      }
    }
  } catch (error) {
    console.error("Error generating ticket types JSON:", error);
  }
}

/**
 * Function: fetchTicketsByOrderId
 *
 * This function fetches the list of tickets associated with a given order ID from the
 * /api/qrapp/tickets/[orderId] API endpoint. It sends a GET request and expects a
 * response containing an array of Ticket objects.
 *
 * The API call uses the "no-store" caching strategy to ensure that fresh data is
 * always retrieved from the server and not from any cached responses.
 *
 * If the request is successful, it returns an array of Ticket objects. In the case
 * of an error (e.g., network issues or a non-OK response), the function logs the error
 * and returns an empty array.
 *
 * This function is asynchronous and should be used where real-time ticket data is
 * required for a specific order.
 *
 * @param {string} orderId - The unique identifier of the order to fetch tickets for.
 * @returns {Promise<Ticket[]>} - A promise that resolves to an array of Ticket objects.
 */
import { Ticket } from "@/types/tickets";

export const fetchTicketsByOrderId = async (
  orderId: string
): Promise<Ticket[]> => {
  try {
    const response = await fetch(`/api/qrapp/tickets/${orderId}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch tickets");
    }
    const tickets: Ticket[] = await response.json();
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
};
