import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ReadyToSyncDialog from "./ReadyToSyncDialog";
import SyncInProgressDialog from "./SyncInProgressDialog";
import ConfirmCancelDialog from "./ConfirmCancelDialog";

const SyncButtonBlock = () => {
  const [showReadyDialog, setShowReadyDialog] = useState(false);
  const [showSyncProgressDialog, setShowSyncProgressDialog] = useState(false);
  const [showConfirmCancelDialog, setShowConfirmCancelDialog] = useState(false);

  const [isSyncDelayed, setIsSyncDelayed] = useState(false); // State to show delay dialog
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [totalValidOrders] = useState(18); // Simulated value from JSON
  const [syncedOrders, setSyncedOrders] = useState(0);

  const handleOpenReadyDialog = () => setShowReadyDialog(true);
  const handleCloseReadyDialog = () => setShowReadyDialog(false);

  useEffect(() => {
    // Check if a sync has recently been completed
    const lastSuccessTime = localStorage.getItem("syncLastSuccessTime");
    if (lastSuccessTime) {
      const timePassed = Date.now() - Number(lastSuccessTime);
      if (timePassed < 30 * 60 * 1000) {
        setIsSyncDelayed(true);
        setLastSyncTime(new Date(Number(lastSuccessTime)).toLocaleTimeString());
      }
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

          // Store the sync timestamp in localStorage after successful sync completion
          localStorage.setItem("syncLastSuccessTime", Date.now().toString());

          // Optionally, you can also show the SyncDelayDialog here
          setIsSyncDelayed(true);
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

  return (
    <div className="float-end flex flex-col">
      <span className="inline-flex items-center rounded-md bg-slate-500 px-2 py-1 text-xs font-medium text-white">
        Last Sync-ed at 10:01 AM
      </span>
      <Button
        size={"xl"}
        className="bg-indigo-700 hover:bg-indigo-600 text-white mt-2"
        onClick={handleOpenReadyDialog} // Open the dialog when clicked
      >
        Sync Data
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
    </div>
  );
};

export default SyncButtonBlock;
