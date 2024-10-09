"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchOrderById } from "@/services/orderServices";
import { Order } from "@/types/orders";
import Spinner from "@/components/common/Spinner";
import { Ticket } from "@/types/tickets";
import { fetchTicketsByOrderId } from "@/services/ticketServices";
import BackButton from "@/components/common/BackButton";
import TicketTable from "@/components/admin/single-order-page/TicketTable";
import OrderInfoBlock from "@/components/admin/single-order-page/OrderInfoBlock";
import OrderInfoHeader from "@/components/admin/single-order-page/OrderInfoHeader";

const SingleOrderPageContent = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Ensure id is a string
  const [order, setOrder] = useState<Order | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTicketsLoading, setisTicketsLoading] = useState(false);

  useEffect(() => {
    const getOrderAndTickets = async () => {
      try {
        const fetchedOrder = await fetchOrderById(id);
        console.log("Fetched Order Data:", fetchedOrder);
        setOrder(fetchedOrder);

        setisTicketsLoading(true);
        const fetchedTickets = await fetchTicketsByOrderId(id);
        console.log("Fetched Tickets Data:", fetchedTickets);
        setTickets(fetchedTickets);
        setisTicketsLoading(false);
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
    <>
      <BackButton text="Back To Posts" />

      <OrderInfoHeader order={order} />
      <OrderInfoBlock order={order} />

      <div className="mt-16">
        <h3>Tickets List</h3>
        {isTicketsLoading && <Spinner />}

        <TicketTable tickets={tickets} />
      </div>
    </>
  );
};

export default SingleOrderPageContent;
