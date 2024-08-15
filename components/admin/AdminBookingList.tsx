import { Order } from "@/types/orders";
import { Button } from "../ui/button";

interface AdminBookingListProps {
  orders: Order[];
}

const AdminBookingList = ({ orders }: AdminBookingListProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {orders.map((order) => (
        <div
          key={order.order_id}
          className="relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:border-gray-400"
        >
          <div className="flex-shrink-0">
            <img
              alt=""
              src={order.event_image}
              className="h-16 w-16 rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            {/* <a href="#" className="focus:outline-none"> */}
            <span aria-hidden="true" className="absolute inset-0" />
            <h3 className="font-medium text-red-500">{order.event_name}</h3>
            <p className="truncate text-sm text-gray-500">
              <span className="text-gray-800 font-bold">Booked By:</span>
              <br />
              {order.contact_firstname} {order.contact_lastname}
            </p>
            <p className="truncate text-sm text-gray-500">
              <span className="text-gray-800 font-bold">Booked At:</span>
              <br />
              {order.date_added}
            </p>
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
              Paid: ${order.total_paid}
            </span>
            {/* </a> */}
            <Button className="bg-gray-700 hover:bg-gray-600 text-white mt-12">
              Booking Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminBookingList;
