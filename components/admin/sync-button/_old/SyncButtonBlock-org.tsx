import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SyncDialog from "../SyncDialog";

const SyncButtonBlock = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage dialog open/close state

  const handleSyncClick = () => {
    setIsDialogOpen(true); // Open the dialog on sync button click
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false); // Close the dialog when cancel or sync is pressed
  };

  return (
    <div className="float-end flex flex-col">
      <span className="inline-flex items-center rounded-md bg-slate-500 px-2 py-1 text-xs font-medium text-white">
        Last Sync-ed at 10:01 AM
      </span>

      <Button
        size={"xl"}
        className="bg-indigo-700 hover:bg-indigo-600 text-white mt-2"
        onClick={handleSyncClick} // Open the dialog when clicked
      >
        Sync Data
      </Button>

      {/* Sync Dialog component */}
      <SyncDialog isOpen={isDialogOpen} onClose={handleDialogClose} />
    </div>
  );
};

export default SyncButtonBlock;
