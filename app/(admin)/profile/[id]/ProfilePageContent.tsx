import React from "react";
import Head from "next/head";
import Page from "@/components/common/Page";
import ProfileHeader from "@/components/admin/profile-page/ProfileHeader";
import UserInfoBlock from "@/components/admin/profile-page/UserInfoBlock";
import { useAuthStore } from "@/store/useAuthStore";
import PasswordForm from "@/components/admin/profile-page/PasswordForm";

interface Props {
  userId: string;
}
const ProfilePageContent = ({ userId }: Props) => {
  const { user } = useAuthStore();
  // console.log("User: ProfilePageContent.tsx", user);

  // Ensure correct user is on the correct profile page
  if (user?.id !== userId) {
    // Redirect or handle unauthorized access here
    return <div>Unauthorized access</div>;
  }

  return (
    <>
      <Head>
        <title>Next Starter Home</title>
        <meta
          name="description"
          content="This is the profilePageContent page"
        />
      </Head>
      {/* <Container className={"border border-gray-500"} FULL={false}> */}
      <Page className={"justify-center"} FULL={false}>
        <ProfileHeader user={user} />
        <UserInfoBlock user={user} />
        <PasswordForm />
      </Page>
    </>
  );
};

export default ProfilePageContent;
