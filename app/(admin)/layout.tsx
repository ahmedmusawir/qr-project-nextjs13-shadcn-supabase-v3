"use client";

import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import withAdminProtection from "@/hoc/withAdminProtection";
import AdminSidebar from "@/components/layout/AdminSidebar";

interface LayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <section className="flex flex-1">
        <div className="hidden xl:block h-auto flex-shrink-0 border-4 w-[15rem]">
          <AdminSidebar />
        </div>
        <div className="flex-grow bg-gray-100">{children}</div>
      </section>
    </div>
  );
};

export default withAdminProtection(AdminLayout);
