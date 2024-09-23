import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SyncDelayDialogProps {
  onClose: () => void;
}

const SyncDelayDialog: React.FC<SyncDelayDialogProps> = ({ onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Sync In Progress</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>
            Last successful sync was at 2:02 PM. Please wait for the next sync
            to be available.
          </p>
          <p>
            Sync will be available in approximately 30 minutes. A timer will be
            shown here counting down.
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
