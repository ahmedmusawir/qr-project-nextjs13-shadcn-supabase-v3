import AdminBookingList from "@/components/admin/AdminBookingList";
import BackButton from "@/components/common/BackButton";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const AdminPortalPageContent = () => {
  return (
    <>
      <Head>
        <title>AdminPortalPageContent</title>
        <meta name="description" content="This is the template page" />
      </Head>
      <Page className={""} FULL={false}>
        {/* <BackButton text="Go Back" link="/admin-portal" /> */}
        <Link className="float-end" href="/admin-booking">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white">
            Create Booking
          </Button>
        </Link>
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="h1">Admin Portal</h1>
          <h2 className="h2">Booked events list:</h2>
          <AdminBookingList />
        </Row>
      </Page>
    </>
  );
};

export default AdminPortalPageContent;
