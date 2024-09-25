import { SyncStatus } from "@/types/sync";
// This is required cuz this is being called in /app/layout.ts (RootLayout) which is
// a server-side component. Client-side ones understand relative URLs
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"; // Fallback if not set

const syncStatusUrl = "/api/qrapp/sync-status"; // Define URL variable

// Fetch sync status with proper error handling and cache control
export const getSyncStatus = async (): Promise<SyncStatus | null> => {
  try {
    const response = await fetch(syncStatusUrl, {
      cache: "no-store", // Disable caching to always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sync status: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("READ STATUS JSON: [/syncStatusService]", data);

    return data;
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return null;
  }
};

// Update sync status and handle any potential errors
// export const updateSyncStatus = async (newStatus: SyncStatus) => {
//   try {
//     const response = await fetch(baseUrl + syncStatusUrl, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(newStatus),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to update sync status: ${response.statusText}`);
//     }

//     // console.log("UPDATE SYNC STATUS: [syncStatusService]:", response);
//     return response.json();
//   } catch (error) {
//     console.error("Error updating sync status:", error);
//   }
// };

// Update sync status and handle any potential errors
export const updateSyncStatus = async (newStatus: SyncStatus) => {
  try {
    console.log("Attempting to update sync status:", newStatus);

    const response = await fetch(baseUrl + syncStatusUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStatus),
    });

    // console.log("---------------------------------------------------");
    // console.log("SYNC SERVICE: Response from updating sync status:", response);
    // console.log("---------------------------------------------------");

    if (!response.ok) {
      throw new Error(`Failed to update sync status: ${response.statusText}`);
    }

    const updatedData = await response.json();

    // console.log("---------------------------------------------------");
    // console.log(
    //   "SYNC SERVICE:Updated sync status written to JSON:",
    //   updatedData
    // );
    // console.log("---------------------------------------------------");

    return updatedData;
  } catch (error) {
    console.error("Error updating sync status:", error);
  }
};

// Fetching Total Valid Orders from the /public/valid_order_list.json file
export const fetchOrderTotal = async () => {
  try {
    const response = await fetch("/api/qrapp/orders/total-orders", {
      cache: "no-store", // Always fetch fresh data
    });
    const data = await response.json();
    return data.totalOrders; // Return the totalOrders
  } catch (error) {
    console.error("Error fetching total orders:", error);
    return 0; // Default to 0 in case of error
  }
};
