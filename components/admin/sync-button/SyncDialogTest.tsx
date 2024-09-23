import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assuming you're using shadcn UI components
import { Button } from "@/components/ui/button";

interface SyncDialogTestProps {
  isOpen: boolean;
  onClose: () => void; // Callback function to close the dialog
}

const SyncDialogTest = ({ isOpen, onClose }: SyncDialogTestProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Sync</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button className="bg-indigo-700 hover:bg-indigo-600 text-white mr-4">
            Let's Sync
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-500 text-white"
            onClick={onClose} // Close dialog on cancel click
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncDialogTest;
