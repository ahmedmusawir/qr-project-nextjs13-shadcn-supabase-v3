import BackButton from "@/components/common/BackButton";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import MemberEventList from "@/components/members/MemberEventList";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const MemberPortalPageContent = () => {
  return (
    <>
      <Head>
        <title>MemberPortalPageContent</title>
        <meta name="description" content="This is the template page" />
      </Head>
      <Page className={""} FULL={false}>
        <BackButton text="Go Back" link="/" />
        <Link className="float-end" href="/">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white">
            Create Booking
          </Button>
        </Link>
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="h1">Members' Portal</h1>
          <h2 className="h2">Your booked events list:</h2>
          <MemberEventList />
        </Row>
      </Page>
    </>
  );
};

export default MemberPortalPageContent;
