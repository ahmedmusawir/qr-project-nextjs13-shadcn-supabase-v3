"use client";

import { ReactNode } from "react";
import withSuperAdminProtection from "@/hoc/withSuperAdminProtection";
import NavbarSuperadmin from "@/components/global/NavbarSuperadmin";
import SuperAdminSidebar from "@/components/layout/SuperAdminSidebar";

interface LayoutProps {
  children: ReactNode;
}

const SuperAdminLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarSuperadmin />
      <div className="flex flex-1">
        <div className="hidden md:block h-auto flex-shrink-0 border-4 w-[25rem]">
          <SuperAdminSidebar />
        </div>
        <div className="flex-1 p-5 md:max-w-[1140px]">{children}</div>
      </div>
    </div>
  );
};

// export default SuperAdminLayout;
export default withSuperAdminProtection(SuperAdminLayout);
