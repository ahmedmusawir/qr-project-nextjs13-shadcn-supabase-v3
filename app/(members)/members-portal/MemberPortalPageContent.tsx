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
        <p>
          Used to be member portal page ... we don't need this for this project
        </p>
      </Page>
    </>
  );
};

export default MemberPortalPageContent;
