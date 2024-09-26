import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CountdownTimer from "./CountdownTimer"; // Updated countdown timer

interface SyncDelayDialogProps {
  delayInSec: number;
  onClose: () => void;
}

const SyncDelayDialog = ({ delayInSec, onClose }: SyncDelayDialogProps) => {
  useEffect(() => {
    // Check if the delay_start_time exists in localStorage
    if (!localStorage.getItem("delay_start_time")) {
      const currentTime = new Date().getTime();
      localStorage.setItem("delay_start_time", currentTime.toString()); // Save the current time as the start time
    }
  }, [delayInSec]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Sync Delay</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>Sync will be available once the countdown is complete.</p>
          <CountdownTimer delayInSec={delayInSec} />{" "}
          {/* Use the updated timer */}
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-indigo-700 hover:bg-indigo-600 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncDelayDialog;
