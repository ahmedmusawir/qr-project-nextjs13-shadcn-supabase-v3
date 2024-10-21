"use client";

import { useEffect } from "react";
import { useFetchUser } from "@/hooks/useFetchUser";
import { useAuthStore } from "@/store/useAuthStore";
import Spinner from "../common/Spinner";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchUser = useFetchUser();

  useEffect(() => {
    const init = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error(error);
        // Will handle the error, e.g., show a notification or redirect to login
      }
    };

    init();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
};

export default MainLayout;
