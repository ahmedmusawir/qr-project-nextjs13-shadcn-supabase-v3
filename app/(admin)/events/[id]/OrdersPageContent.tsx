"use client";
import React, { useEffect, useState } from "react";
import Page from "@/components/common/Page";
import Spinner from "@/components/common/Spinner";
import { fetchEventOrders } from "@/services/eventServices";
import Head from "next/head";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminOrderList from "@/components/admin/single-event-page/AdminOrderList";
import { Order } from "@/types/orders";
import BackButton from "@/components/common/BackButton";

interface Props {
  eventId: string;
}

const OrdersPageContent = ({ eventId }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadEventsAndFields = async () => {
      try {
        setIsLoading(true);
        const ordersData = await fetchEventOrders(
          eventId,
          currentPage,
          pageSize
        );
        setOrders(ordersData.orders);
        setTotalPages(ordersData.pagination.totalPages);

        // console.log("Orders by Event: 66bc172716adf78eb1f8793e", ordersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEventsAndFields();
  }, [currentPage, pageSize]);

  return (
    <>
      <Head>
        <title>Admin Portal</title>
        <meta name="description" content="Admin portal for managing events" />
      </Head>
      <Page className={""} FULL={false}>
        <BackButton text="Go Back" />

        <div className="px-4 sm:px-0 mb-10">
          <h2 className="text-xxl font-semibold leading-7 text-gray-900">
            Order List:
          </h2>
          <p className="mt-1 max-w-2xl text-lg leading-6 text-gray-500">
            A GHL Order List by Event
          </p>
        </div>
        {isLoading ? <Spinner /> : <AdminOrderList orders={orders} />}
        {orders.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </Page>
    </>
  );
};

export default OrdersPageContent;
