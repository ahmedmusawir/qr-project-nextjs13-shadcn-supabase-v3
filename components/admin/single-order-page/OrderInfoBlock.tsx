import { Order } from "@/types/orders";
import React from "react";

interface OrderProps {
  order: Order;
}

const OrderInfoBlock = ({ order }: OrderProps) => {
  return (
    <>
      {/* Large Screen Layout (Double-Column) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Left Column (Table 1) */}
        <table className="table-auto w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                Full Name:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                {order.contact_firstname} {order.contact_lastname}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-2 pl-3 md:py-3 md:pl-5">
                Email Address:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center">
                {order.contact_email}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                Payment Status:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                {order.payment_status}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Right Column (Table 2) */}
        <table className="table-auto w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                Payment Amount:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                ${order.total_paid}.00
              </td>
            </tr>
            <tr className="bg-white">
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-2 pl-3 md:py-3 md:pl-5">
                Regular Ticket Qty:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center">
                7
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="w-1/2 text-sm md:text-base font-medium text-gray-100 dark:text-white bg-slate-600 py-2 pl-3 md:py-3 md:pl-5">
                VIP Ticket Qty:
              </td>
              <td className="w-1/2 text-sm md:text-base text-gray-700 dark:text-gray-300 text-center bg-gray-300">
                10
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Small Screen Layout (Single-Column) */}
      <div className="block md:hidden mt-5">
        <table className="table-auto w-full">
          <tbody>
            <tr className="bg-gray-100">
              <td className="text-center text-sm font-medium text-gray-100 dark:text-white bg-slate-600 py-3 pl-5">
                Full Name:
              </td>
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                {order.contact_firstname} {order.contact_lastname}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                Email Address:
              </td>
              <td className="text-center text-sm text-gray-700 dark:text-gray-300 bg-white py-3">
                {order.contact_email}
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="text-center text-sm font-medium text-gray-100 dark:text-white bg-slate-600 py-3 pl-5">
                Payment Status:
              </td>
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                {order.payment_status}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                Payment Amount:
              </td>
              <td className="text-center text-sm text-gray-700 dark:text-gray-300 bg-white py-3">
                ${order.total_paid}.00
              </td>
            </tr>
            <tr className="bg-gray-100">
              <td className="text-center text-sm font-medium text-gray-100 dark:text-white bg-slate-600 py-3 pl-5">
                Regular Ticket Qty:
              </td>
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                7
              </td>
            </tr>
            <tr className="bg-white">
              <td className="text-center text-sm md:text-base text-gray-700 dark:text-gray-300 bg-gray-300 py-3 pl-3 md:py-3 md:pl-5">
                VIP Ticket Qty:
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 text-center bg-white py-3">
                10
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderInfoBlock;
