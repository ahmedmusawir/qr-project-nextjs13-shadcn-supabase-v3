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

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated || roles.is_qr_admin !== 1) {
          // Store the current URL before redirecting
          const currentURL = window.location.href;
          localStorage.setItem("redirectAfterLogin", currentURL);

          router.push("/auth");
        }
      }
    }, [isAuthenticated, roles, router, isLoading]);

    if (isLoading || !isAuthenticated || roles.is_qr_admin !== 1) {
      return <Spinner />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminProtection;
