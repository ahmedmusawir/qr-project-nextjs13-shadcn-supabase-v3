/**
 * Page: /auth
 *
 * This component represents the authentication page for the app and serves as the
 * entry point for users. It includes tabs for login and signup functionality.
 *
 * In addition to its authentication functionality, this page is also responsible for
 * triggering a request to the server-side API to generate a ticket types JSON file.
 *
 * Steps:
 * 1. Fetch product IDs from the `/api/ghl/events` endpoint.
 * 2. Call the `/api/ghl/generate-ticket-types` endpoint, passing the product IDs.
 * 3. Server-side API route will generate the ticket types JSON and save it to
 *    `public/ticket_types.json`.
 *
 * Client-Side Logic:
 * This page is a client component since it accesses `localStorage`, which is required
 * to manage redirects after authentication. The JSON generation logic is handled by an
 * API call to the server-side.
 */

"use client";

import AuthTabs from "@/components/auth/AuthTabs";
import React, { useEffect } from "react";

const AuthPage = () => {
  const redirectURL = localStorage.getItem("redirectAfterLogin");

  useEffect(() => {
    async function generateTicketTypes() {
      try {
        // Fetch product IDs from the GHL events API
        const response = await fetch("/api/ghl/events");
        const data = await response.json();

        console.log("Event Data - /auth", data);

        if (data.productIds) {
          const productIds = data.productIds;
          const locationId = process.env.NEXT_PUBLIC_GHL_LOCATION_ID;

          // Call the server-side API to generate the ticket types JSON
          const res = await fetch("/api/ghl/ticket-types", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productIds, locationId }),
          });

          console.log("RESONSE AUTH PAGE:", res);

          if (res.ok) {
            console.log("Ticket types JSON generated successfully.");
          } else {
            console.error("Failed to generate ticket types JSON");
          }
        }
      } catch (error) {
        console.error("Error generating ticket types JSON:", error);
      }
    }

    generateTicketTypes();
  }, []);

  return (
    <>
      <AuthTabs />
    </>
  );
};

export default AuthPage;
