"use client";

import { Order } from "@/types/orders";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { Button } from "../../ui/button";

interface Prop {
  orders: Order[];
}

const AdminOrderList = ({ orders }: Prop) => {
  console.log("List of Orders from AdminOrderList:", orders);
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10"
    >
      {orders.length === 0 && (
        <div className="not-found-block flex flex-col items-center justify-center col-span-full mt-[-100px]">
          <img
            src="https://res.cloudinary.com/dyb0qa58h/image/upload/v1725423361/NO-ITEM-FOUND_bwdwum.webp"
            alt="icon"
            className="mt-10"
          />
          <h1 className="font-bold text-red-500 text-center">
            No Orders Found
          </h1>
        </div>
      )}
      {orders.map((order) => (
        <li
          key={order.order_id}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {order.contact_firstname} {order.contact_lastname}
                </h3>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {order.payment_status}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">
                {order.event_name}
              </p>
              <p className="mt-5">
                <Link className="" href={`/orders/${order.order_id}`}>
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white w-full">
                    Order Details
                  </Button>
                </Link>
              </p>
            </div>
            <img
              alt=""
              src={order.event_image}
              className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
            />
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <a
                  href={`mailto:${order.contact_email}`}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <EnvelopeIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400"
                  />
                  Email
                </a>
              </div>
              <div className="-ml-px flex w-0 flex-1">
                <a
                  href={`tel:${order.contact_phone}`}
                  className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <PhoneIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-gray-400"
                  />
                  Call
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default AdminOrderList;
