"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Client-side logout function
  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      // Clear client-side authentication state (e.g., Zustand)
      useAuthStore.getState().logout();
      router.push("/auth");
    } else {
      console.error("Failed to log out");
    }
  };

  return <div onClick={handleLogout}>Logout</div>;
};

export default Logout;
