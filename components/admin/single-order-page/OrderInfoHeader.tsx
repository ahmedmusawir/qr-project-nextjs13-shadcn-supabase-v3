import { Order } from "@/types/orders";
import React from "react";

interface OrderProps {
  order: Order;
}

const OrderInfoHeader = ({ order }: OrderProps) => {
  return (
    <>
      <div className="px-4 sm:px-0 pb-5 sm:pb-12">
        <img
          src={order.event_image}
          alt="Event"
          className="h-32 w-32 rounded-full sm:float-start mr-10 mb-8"
          //   className="h-16 w-16 rounded-md float-start mr-10"
        />
        <h2 className="text-3xl sm:text-4xl font-semibold leading-7 text-gray-900">
          Order Information:{" "}
        </h2>
        <p className="mt-5 sm:mt-1 max-w-2xl text-sm leading-6 text-gray-500 font-bold">
          Event Name: <span className="text-red-500">{order.event_name}</span>
        </p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 font-bold">
          Order ID: <span className="text-red-500">{order.order_id}</span>
        </p>
      </div>
    </>
  );
};

export default OrderInfoHeader;
