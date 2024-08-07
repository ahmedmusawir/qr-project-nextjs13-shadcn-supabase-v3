"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();

  // Client-side logout function
  const handleLogout = async () => {
    useAuthStore.getState().setLogoutInProgress(true); // Set logout in progress

    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      // Clear client-side authentication state (e.g., Zustand)
      localStorage.removeItem("redirectAfterLogin");
      useAuthStore.getState().logout();
      router.push("/auth");
    } else {
      console.error("Failed to log out");
    }
    // Ensure logout in progress is set to false after the process
    useAuthStore.getState().setLogoutInProgress(false);
  };

  return <div onClick={handleLogout}>Logout</div>;
};

export default Logout;
