"use client";

import { useParams } from "next/navigation";
import ProfilePageContent from "./ProfilePageContent";

const Profile = () => {
  const { id } = useParams();

  // Ensuring id is a string (not an array)
  const userId = Array.isArray(id) ? id[0] : id;

  return <ProfilePageContent userId={userId} />;
};

export default Profile;
