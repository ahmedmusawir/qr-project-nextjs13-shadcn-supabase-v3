import { Ticket } from "@/types/tickets";

export const fetchTicketsByOrderId = async (
  orderId: string
): Promise<Ticket[]> => {
  try {
    const response = await fetch(`/api/qrapp/tickets/${orderId}`);
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
