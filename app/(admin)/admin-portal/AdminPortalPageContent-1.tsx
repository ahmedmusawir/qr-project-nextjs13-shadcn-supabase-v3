"use client";

import React, { useState, useEffect, Suspense } from "react";
import AdminBookingList from "@/components/admin/AdminBookingList";
import BackButton from "@/components/common/BackButton";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";
import { fetchOrders } from "@/services/orderServices";
import { Order, Orders } from "@/types/orders";
import PostPagination from "@/components/posts/PostPagination";
import AdminPagination from "@/components/admin/AdminPagination";
import Loading from "../loading";

const AdminPortalPageContent = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5); // Default page size

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data: Orders = await fetchOrders(currentPage, pageSize);
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    loadOrders();
  }, [currentPage, pageSize]);

  // console.log("Orders in Admin Portal Page:", orders);

  return (
    <>
      <Head>
        <title>Admin Portal</title>
        <meta name="description" content="Admin Portal for managing bookings" />
      </Head>
      <Page className={""} FULL={false}>
        <Link className="float-end" href="/admin-booking">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white">
            Create Booking
          </Button>
        </Link>
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="h1">Admin Portal</h1>
          <h2 className="h2">Booked events list:</h2>
          <AdminBookingList orders={orders} />
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </Row>
      </Page>
    </>
  );
};

export default AdminPortalPageContent;
