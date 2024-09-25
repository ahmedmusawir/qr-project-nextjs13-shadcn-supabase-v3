import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

const SYNC_STATUS_PATH = path.join(process.cwd(), "public", "sync_status.json");

// Utility function to read the sync status from the JSON file
export const readSyncStatus = () => {
  try {
    const data = fs.readFileSync(SYNC_STATUS_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading sync status file:", error);
    return {
      syncInProgress: false,
      startTime: null,
      endTime: null,
      totalOrders: 0,
      syncedOrders: 0,
      status: "Not Started",
    };
  }
};

// Utility function to write to the sync status file
export const writeSyncStatus = (statusData: any) => {
  try {
    fs.writeFileSync(
      SYNC_STATUS_PATH,
      JSON.stringify(statusData, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error writing sync status file:", error);
  }
};

// Function to get local timezone time in ISO format
const getLocalTimeISO = () => {
  const localTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  }); // Adjust timeZone as needed
  return new Date(localTime).toISOString();
};

// GET handler: Return the current sync status
export async function GET() {
  const syncStatus = readSyncStatus();
  return NextResponse.json(syncStatus);
}

// POST handler: Update the sync status
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { syncInProgress, totalOrders, syncedOrders, status, delay_in_sec } =
      body;

    // Read the current status
    const currentStatus = readSyncStatus();

    // Update the status fields with proper checks for undefined values
    const updatedStatus = {
      ...currentStatus,
      syncInProgress:
        syncInProgress !== undefined
          ? syncInProgress
          : currentStatus.syncInProgress,
      totalOrders:
        totalOrders !== undefined ? totalOrders : currentStatus.totalOrders,
      syncedOrders:
        syncedOrders !== undefined ? syncedOrders : currentStatus.syncedOrders,
      status: status !== undefined ? status : currentStatus.status,
      delay_in_sec:
        delay_in_sec !== undefined ? delay_in_sec : currentStatus.delay_in_sec,
      startTime:
        syncInProgress && !currentStatus.syncInProgress
          ? getLocalTimeISO()
          : currentStatus.startTime,
      endTime:
        !syncInProgress && currentStatus.syncInProgress
          ? getLocalTimeISO()
          : currentStatus.endTime,
    };

    // Write updated status back to file
    writeSyncStatus(updatedStatus);

    return NextResponse.json({ message: "Sync status updated successfully" });
  } catch (error: any) {
    console.error("Error updating sync status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
