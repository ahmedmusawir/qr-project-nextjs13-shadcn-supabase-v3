import { ReactNode } from "react";
import NavbarHome from "@/components/global/NavbarHome";
import Main from "@/components/common/Main";
import Navbar from "@/components/global/Navbar";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <Main className="flex flex-col">
          {children
            ? children
            : "This is a Layout container. Must have children"}
        </Main>
      </div>
    </>
  );
}
