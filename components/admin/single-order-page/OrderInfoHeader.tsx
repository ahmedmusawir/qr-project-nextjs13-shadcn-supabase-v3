import { Order } from "@/types/orders";
import React from "react";

interface OrderProps {
  order: Order;
}

const OrderInfoHeader = ({ order }: OrderProps) => {
  return (
    <>
      <div className="px-4 sm:px-0">
        <h2 className="text-xl sm:text-xxl font-semibold leading-7 text-gray-900">
          <img
            src={order.event_image}
            alt="Event"
            className="h-16 w-16 rounded-md float-start mr-10"
          />
          Order Information:{" "}
        </h2>
        <p className="mt-10 sm:mt-1 max-w-2xl text-sm leading-6 text-gray-500 font-bold">
          Event Name: <span className="text-red-500">{order.event_name}</span>
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 font-bold">
          Order ID: <span className="text-red-500">{order.order_id}</span>
        </p>
      </div>
    </>
  );
};

export default OrderInfoHeader;
