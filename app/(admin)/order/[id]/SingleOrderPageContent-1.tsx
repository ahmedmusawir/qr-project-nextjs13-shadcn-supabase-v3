"use client";

import { PaperClipIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchOrderById } from "@/services/orderServices";
import { Order } from "@/types/orders";
import Spinner from "@/components/common/Spinner";
import TicketTable from "@/components/admin/TicketTable";

const tickets = [
  {
    id: "1234",
    order_id: "66c356325478d22b7d2bc98e",
    ticket_type: "VIP",
    status: "live",
  },
  {
    id: "5678",
    order_id: "66bc19a19b06065ff088a4cf",
    ticket_type: "Regular",
    status: "live",
  },
];

const SingleOrderPageContent = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // Ensure id is a string
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const getOrder = async () => {
      try {
        const fetchedOrder = await fetchOrderById(id);
        console.log("Fetched Order Data:", fetchedOrder);
        setOrder(fetchedOrder);
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    getOrder();
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
      <div className="px-4 sm:px-0">
        <h2 className="text-xxl font-semibold leading-7 text-gray-900">
          <img
            src={order.event_image}
            alt="Event"
            className="h-16 w-16 rounded-md float-start mr-10"
          />
          Order Information:{" "}
          <span className="text-red-500">{order.event_name}</span>
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Personal details and application.
        </p>
      </div>
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700">
        <dl className="divide-y divide-gray-200 dark:divide-gray-700">
          <div className="bg-gray-100 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 dark:bg-gray-800">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Full name
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              {order.contact_firstname} {order.contact_lastname}
            </dd>
          </div>
          <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 dark:bg-gray-700">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Email Address
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              {order.contact_email}
            </dd>
          </div>
          <div className="bg-gray-100 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 dark:bg-gray-800">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Regular Ticket Qty
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              {order.regular_ticket_qty}
            </dd>
          </div>
          <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 dark:bg-gray-700">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Payment Status
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              {order.payment_status}
            </dd>
          </div>
          <div className="bg-gray-100 px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 dark:bg-gray-800">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Payment Amount
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              ${order.total_paid}.00
            </dd>
          </div>
          <div className="bg-white px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-3 dark:bg-gray-700">
            <dt className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Vip Ticket Qty
            </dt>
            <dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0 dark:text-gray-300">
              <div className="ml-4 flex-shrink-0">{order.vip_ticket_qty}</div>
            </dd>
          </div>
        </dl>
      </div>
      <div className="mt-8">
        <h3>Tickets List</h3>
        <TicketTable tickets={tickets} />
      </div>
    </div>
  );
};

export default SingleOrderPageContent;
