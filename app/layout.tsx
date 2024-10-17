/**
 * RootLayout: /app/layout.tsx
 *
 * This layout file is responsible for wrapping all pages within the application.
 * It sets up the ThemeProvider, global styles, and Toaster for notifications.
 * It also handles backend operations during the initial page load, such as
 * generating the ticket types JSON file.
 *
 * The `fetchAndGenerateTicketTypes` function from the services folder is invoked here
 * to ensure that the ticket types data is fetched and generated on the server side
 * before rendering any pages. This operation is cached using Next.js's revalidation
 * mechanism to prevent unnecessary API calls.
 *
 * This approach ensures a non-blocking, efficient process for handling backend
 * operations while keeping the client-side components lightweight.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/MainLayout";
import { fetchAndGenerateTicketTypes } from "@/services/ticketServices";
import { fetchAndGenerateValidOrderList } from "@/services/orderServices";
import { ThemeProvider } from "./providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moose Next Framework v3",
  description: "This is just ui/ux framework with Shadcn",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch and generate ticket types on server-side during layout load
  await fetchAndGenerateTicketTypes();

  // Fetch and generate valid order list during layout load
  await fetchAndGenerateValidOrderList();

  // console.log("Service role key:", process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
