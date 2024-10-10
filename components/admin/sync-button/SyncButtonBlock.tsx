import { useSyncStore } from "@/store/useSyncStore";
import { Button } from "@/components/ui/button";
import ReadyToSyncDialog from "./ReadyToSyncDialog";
import SyncInProgressDialog from "./SyncInProgressDialog";
import SyncDelayDialog from "./SyncDelayDialog";
import { SyncStatus } from "@/types/sync";
import { useState } from "react";
import Spinner from "@/components/common/Spinner";
import { fetchOrderTotal } from "@/services/syncStatusService";

const SyncButtonBlock = () => {
  const {
    syncStatus,
    fetchSyncStatus,
    updateSyncStatus,
    isDialogOpen,
    setIsDialogOpen,
  } = useSyncStore();
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle Sync button click
  const handleSyncClick = async () => {
    setIsLoading(true); // Set loading to true while we fetch data

    console.log("Fetching sync status...");

    try {
      await fetchSyncStatus(); // Fetch the latest status with no caching
      console.log("Sync status fetched successfully:", syncStatus);
    } catch (error) {
      console.error("Error fetching sync status:", error);
    } finally {
      setIsLoading(false); // Set loading to false after the status is fetched
      setIsDialogOpen(true); // Open the dialog after fetching status
    }
  };

  // Function to start the sync process
  const handleStartSync = async () => {
    // Fetch the total orders dynamically from valid_order_list.json
    const totalOrders = await fetchOrderTotal();

    const newStatus: SyncStatus = {
      syncInProgress: true,
      startTime: new Date().toISOString(),
      endTime: null,
      totalOrders: totalOrders, // This should now be dynamic (can be fetched from JSON)
      syncedOrders: 0,
      status: "Syncing",
      delay_in_sec: 0,
    };

    // Update the sync status in the JSON file
    await updateSyncStatus(newStatus);

    // Call the backend REAL sync process
    await fetch("/api/ghl/orders/sync", { method: "GET" });

    // Call the backend test sync process
    // await fetch("/api/qrapp/test-sync", { method: "GET" });

    fetchSyncStatus(); // Refresh the sync status immediately after starting sync
    setIsDialogOpen(true); // Show the SyncInProgressDialog immediately
  };

  // Close dialog handler
  const handleDialogClose = () => setIsDialogOpen(false);

  return (
    <div className="sm:float-end flex flex-col">
      <span className="inline-flex items-center rounded-md bg-slate-500 px-2 py-1 text-xs font-medium text-white">
        Last Sync-ed at{" "}
        {syncStatus?.endTime
          ? new Date(syncStatus.endTime).toLocaleTimeString()
          : "N/A"}
      </span>
      <Button
        size={"xl"}
        className="bg-indigo-700 hover:bg-indigo-600 text-white mb-8 sm:mb-1 mt-1"
        onClick={handleSyncClick}
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : "Sync Data"}
      </Button>
      {isDialogOpen && syncStatus && (
        <>
          {syncStatus.syncInProgress ? (
            <SyncInProgressDialog
              totalOrders={syncStatus.totalOrders}
              onClose={handleDialogClose}
            />
          ) : syncStatus.status === "Delay" ? (
            <SyncDelayDialog onClose={handleDialogClose} />
          ) : (
            <ReadyToSyncDialog
              onClose={handleDialogClose}
              onStart={handleStartSync}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SyncButtonBlock;
