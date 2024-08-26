"use client";
import React, { useEffect, useState } from "react";
import AdminBookingList from "@/components/admin/AdminBookingList";
import BackButton from "@/components/common/BackButton";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Spinner from "@/components/common/Spinner";
import { fetchOrders } from "@/services/orderServices";
import Head from "next/head";
import { Orders } from "@/types/orders";
import AdminPagination from "@/components/admin/AdminPagination";

const AdminPortalPageContent = () => {
  const [orders, setOrders] = useState<Orders["orders"]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isLoading, setIsLoading] = useState(true); // Initialize loading state
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true); // Start loading
        const data = await fetchOrders(currentPage, pageSize);
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    loadOrders();
  }, [currentPage, pageSize]);

  return (
    <>
      <Head>
        <title>Admin Portal</title>
        <meta name="description" content="Admin portal for managing bookings" />
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

          {isLoading ? (
            <Spinner /> // Display Spinner while loading
          ) : (
            <AdminBookingList orders={orders} /> // Display data when done loading
          )}
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
