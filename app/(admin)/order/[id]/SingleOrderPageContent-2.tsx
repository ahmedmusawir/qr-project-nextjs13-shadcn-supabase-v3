"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchOrderById } from "@/services/orderServices";
import { fetchTicketsByOrderId } from "@/services/ticketServices"; // Import the new service
import { Order } from "@/types/orders";
import { Ticket } from "@/types/tickets";
import Spinner from "@/components/common/Spinner";
import TicketTable from "@/components/admin/TicketTable";

const SingleOrderPageContent = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const getOrderAndTickets = async () => {
      try {
        const fetchedOrder = await fetchOrderById(id);
        console.log("Fetched Order Data:", fetchedOrder);
        setOrder(fetchedOrder);

        const fetchedTickets = await fetchTicketsByOrderId(id);
        console.log("Fetched Tickets Data:", fetchedTickets);
        setTickets(fetchedTickets);
      } catch (error) {
        console.error("Error fetching order or tickets:", error);
      }
    };

    getOrderAndTickets();
  }, [id]);

  if (!order) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {/* ... (existing code) ... */}
      <div className="mt-8">
        <h3>Tickets List</h3>
        <TicketTable tickets={tickets} />
      </div>
    </div>
  );
};

export default SingleOrderPageContent;
