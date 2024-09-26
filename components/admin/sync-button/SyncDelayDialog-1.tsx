import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SyncDelayDialogProps {
  onClose: () => void;
  delayInSec: number;
}

const SyncDelayDialog = ({ onClose, delayInSec }: SyncDelayDialogProps) => {
  const [countdown, setCountdown] = useState(delayInSec);

  // Simulate countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clear the interval on unmount
  }, [delayInSec]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Sync Delay</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>
            Last successful sync was at 2:02 PM. Please wait for the next sync
            to be available.
          </p>
          <p>
            Sync will be available in approximately {countdown} seconds. A timer
            will be shown here counting down.
          </p>
        </div>
        <Button
          onClick={onClose}
          className="bg-indigo-700 hover:bg-indigo-600 text-white"
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SyncDelayDialog;
