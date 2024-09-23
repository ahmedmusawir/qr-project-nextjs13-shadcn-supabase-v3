import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ReadyToSyncDialog from "./ReadyToSyncDialog";
import SyncInProgressDialog from "./SyncInProgressDialog";
import ConfirmCancelDialog from "./ConfirmCancelDialog";
import SyncDelayDialog from "./SyncDelayDialog";

const SyncButtonBlock = () => {
  const [showReadyDialog, setShowReadyDialog] = useState(false);
  const [showSyncProgressDialog, setShowSyncProgressDialog] = useState(false);
  const [showConfirmCancelDialog, setShowConfirmCancelDialog] = useState(false);
  const [showSyncDelayDialog, setShowSyncDelayDialog] = useState(false); // Show sync delay dialog
  const [isSyncDelayed, setIsSyncDelayed] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [totalValidOrders] = useState(18); // Simulated value from JSON
  const [syncedOrders, setSyncedOrders] = useState(0);

  const handleOpenReadyDialog = () => setShowReadyDialog(true);
  const handleCloseReadyDialog = () => setShowReadyDialog(false);

  useEffect(() => {
    // Check if a sync has recently been completed
    const syncDelay = localStorage.getItem("syncInProgress"); // Only check if sync has been completed
    if (syncDelay) {
      setIsSyncDelayed(true);
      setShowSyncDelayDialog(true); // Show the delay dialog if sync completed
      setLastSyncTime("2:02 PM"); // Static time for the demo
    } else {
      setIsSyncDelayed(false);
    }
  }, []);

  const handleStartSync = () => {
    setShowReadyDialog(false);
    setShowSyncProgressDialog(true);

    // Simulate progress every few seconds
    const interval = setInterval(() => {
      setSyncedOrders((prev) => {
        if (prev >= totalValidOrders) {
          clearInterval(interval);
          setShowSyncProgressDialog(false); // Simulate finishing the sync

          // Store the sync status in localStorage after successful sync completion
          localStorage.setItem("syncInProgress", "true");
          setIsSyncDelayed(true); // Trigger delay state
          setShowSyncDelayDialog(true); // Show the delay dialog
        }
        return prev + 1;
      });
    }, 3000); // Sync progress every 3 seconds
  };

  const handleCancelSync = () => setShowConfirmCancelDialog(true);
  const handleConfirmCancelSync = () => {
    setShowConfirmCancelDialog(false);
    setShowSyncProgressDialog(false);
    setSyncedOrders(0); // Reset the count
  };

  const handleCancelConfirm = () => setShowConfirmCancelDialog(false);

  const handleCloseSyncDelay = () => setShowSyncDelayDialog(false);

  return (
    <div className="float-end flex flex-col">
      <span className="inline-flex items-center rounded-md bg-slate-500 px-2 py-1 text-xs font-medium text-white">
        Last Sync-ed at {lastSyncTime || "10:01 AM"}
      </span>
      <Button
        size={"xl"}
        className="bg-indigo-700 hover:bg-indigo-600 text-white mt-2"
        onClick={handleOpenReadyDialog} // Open the dialog when clicked
        disabled={isSyncDelayed} // Disable if sync is in progress
      >
        {isSyncDelayed ? "Sync Disabled" : "Sync Data"}
      </Button>

      {showReadyDialog && (
        <ReadyToSyncDialog
          onClose={handleCloseReadyDialog}
          onStart={handleStartSync}
        />
      )}

      {showSyncProgressDialog && (
        <SyncInProgressDialog
          totalOrders={totalValidOrders}
          syncedOrders={syncedOrders}
          onCancelSync={handleCancelSync}
        />
      )}

      {showConfirmCancelDialog && (
        <ConfirmCancelDialog
          onConfirm={handleConfirmCancelSync}
          onCancel={handleCancelConfirm}
        />
      )}

      {showSyncDelayDialog && (
        <SyncDelayDialog onClose={handleCloseSyncDelay} />
      )}
    </div>
  );
};

export default SyncButtonBlock;
