"use client";
import React, { useEffect, useState } from "react";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Spinner from "@/components/common/Spinner";
import { fetchEvents } from "@/services/eventServices";
import Head from "next/head";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminEventList from "@/components/admin/AdminEventList";
import { useGHLDataStore } from "@/store/useGHLDataStore";
import { fetchCustomFields } from "@/services/fieldServices";

const AdminPortalPageContent = () => {
  const { setEvents, setFields } = useGHLDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadEventsAndFields = async () => {
      try {
        setIsLoading(true);
        const eventsData = await fetchEvents(currentPage, pageSize);
        setEvents(eventsData.events);
        setTotalPages(eventsData.pagination.totalPages);

        const fieldsData = await fetchCustomFields();
        setFields(fieldsData);
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
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="h1">Admin Portal</h1>
          <h2 className="h2">Events list:</h2>

          {isLoading ? <Spinner /> : <AdminEventList />}
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
