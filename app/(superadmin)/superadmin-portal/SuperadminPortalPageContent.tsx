"use client";

import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import UserList from "@/components/superadmin/UserList";
import Head from "next/head";
import { useEffect, useState } from "react";
import { fetchUsers } from "@/services/userServices"; // Import the function
import { User } from "@/types/user";
import Spinner from "@/components/common/Spinner"; // Optional spinner component for loading
import { useAuthStore } from "@/store/useAuthStore";

const SuperadminPortalPageContent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        console.log("Fetched Users:", fetchedUsers);
        setUsers(fetchedUsers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUsers(); // Fetch users on component mount
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">The ERROR:{error}</p>;
  }

  return (
    <>
      <Head>
        <title>SuperadminPortalPageContent</title>
        <meta name="description" content="This is the template page" />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="h1">
            Superadmins' Portal <br />
            <small className="text-lg text-indigo-600">
              Logged in as {user.email}
            </small>
          </h1>
          <h2 className="h2">The User List</h2>
          {/* Pass the fetched users to UserList */}
          <UserList users={users} />
        </Row>
      </Page>
    </>
  );
};

export default SuperadminPortalPageContent;
