import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SYNC_STATUS_PATH = path.join(process.cwd(), "public", "sync_status.json");

// Function to read sync status from file
export const readSyncStatus = () => {
  try {
    const data = fs.readFileSync(SYNC_STATUS_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading sync status:", error);
    return {};
  }
};

// Function to write sync status to file
export const writeSyncStatus = (statusData: any) => {
  try {
    fs.writeFileSync(
      SYNC_STATUS_PATH,
      JSON.stringify(statusData, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Error writing sync status:", error);
  }
};

// GET handler: Return the current sync status
export async function GET() {
  const syncStatus = readSyncStatus();
  return NextResponse.json(syncStatus);
}

// POST handler: Update the sync status and broadcast it
export async function POST(req: Request) {
  const io = globalThis.io; // Access the global socket.io instance

  try {
    const body = await req.json();
    const { syncInProgress, totalOrders, syncedOrders, status, delay_in_sec } =
      body;

    // Read the current status
    const currentStatus = readSyncStatus();

    // Update the sync status
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
          ? new Date().toISOString()
          : currentStatus.startTime,
      endTime:
        !syncInProgress && currentStatus.syncInProgress
          ? new Date().toISOString()
          : currentStatus.endTime,
    };

    // Write updated status to file
    writeSyncStatus(updatedStatus);

    // Broadcast the updated sync status to all clients
    if (io) {
      io.emit("sync_status", updatedStatus); // Emit the updated status
      console.log("Broadcasted updated sync status:", updatedStatus);
    }

    //================FINAL JSON UPDATE START====================
    // Timer code to update status after delay
    if (updatedStatus.status === "Delay" && updatedStatus.delay_in_sec > 0) {
      console.log(
        "Starting backend timer for",
        updatedStatus.delay_in_sec,
        "seconds..."
      );

      // Instead of calling a separate function, let's handle the timer directly here
      let countdown = updatedStatus.delay_in_sec;

      // Emit the countdown every second
      const interval = setInterval(() => {
        if (countdown >= 0) {
          io?.emit(
            "delay_timer",
            `Sync Button will be ready in: ${countdown} seconds`
          );
          console.log(`Countdown: ${countdown} seconds remaining`);
          countdown--;
        } else {
          io?.emit("delay_timer", "ENDED");
          clearInterval(interval);
        }
      }, 1000);

      // After the delay, update the status to "Complete"
      const finalStatus = {
        ...updatedStatus,
        status: "Complete", // Change status to "Complete"
        delay_in_sec: 0, // Reset delay_in_sec
      };

      // Write the final "Complete" status after the delay
      setTimeout(() => {
        writeSyncStatus(finalStatus);

        // Broadcast final status
        io?.emit("sync_status", finalStatus);
        console.log("Status updated to 'Complete' after the timer finished.");
      }, updatedStatus.delay_in_sec * 1000); // Update the status after the delay ends
    }
    //================FINAL JSON UPDATE FINISH===================

    return NextResponse.json({ message: "Sync status updated successfully" });
  } catch (error: any) {
    console.error("Error updating sync status:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
