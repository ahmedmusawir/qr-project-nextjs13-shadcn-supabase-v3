import React from "react";
import OrdersPageContent from "./OrdersPageContent";
import BackButton from "@/components/common/BackButton";

const OrdersPage = ({ params }: { params: { id: string } }) => {
  const eventId = params.id;
  console.log("EventID: ", eventId);

  return (
    <div className="p-10">
      <OrdersPageContent eventId={eventId} />
    </div>
  );
};

export default OrdersPage;
