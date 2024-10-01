"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ComponentType, ReactNode } from "react";
import Spinner from "@/components/common/Spinner";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

const withAdminProtection = (WrappedComponent: ComponentType<LayoutProps>) => {
  return (props: LayoutProps) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const roles = useAuthStore((state) => state.roles);
    const isLoading = useAuthStore((state) => state.isLoading);
    const logoutInProgress = useAuthStore((state) => state.logoutInProgress);

    useEffect(() => {
      // console.log("[Admin HOC] isAuthenticated:", isAuthenticated);
      // console.log("[Admin HOC] roles:", roles);
      // console.log("[Admin HOC] isLoading:", isLoading);
      // console.log("[Admin HOC] logoutInProgress:", logoutInProgress);

      if (!isLoading && !logoutInProgress) {
        if (!isAuthenticated || roles.is_qr_admin !== 1) {
          // Store the current URL before redirecting
          const currentURL = window.location.href;
          // console.log("[Admin HOC] Storing current URL:", currentURL);
          localStorage.setItem("redirectAfterLogin", currentURL);

          // console.log("[Admin HOC] Redirecting to /auth");
          router.push("/auth");
        }
      }
    }, [isAuthenticated, roles, router, isLoading, logoutInProgress]);

    if (isLoading || !isAuthenticated || roles.is_qr_admin !== 1) {
      // console.log("[Admin HOC] We are stuck here");
      return <Spinner />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminProtection;
