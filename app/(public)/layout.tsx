import { ReactNode } from "react";
import Main from "@/components/common/Main";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/home/Footer";

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
        <Footer />
      </div>
    </>
  );
}
