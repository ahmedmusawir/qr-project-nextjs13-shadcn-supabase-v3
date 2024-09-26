import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CountdownTimer from "./CountdownTimer";

interface SyncDelayDialogProps {
  onClose: () => void;
  delayInSec: number;
  updateStatusToComplete: () => void; // Trigger when countdown completes
}

const SyncDelayDialog = ({
  onClose,
  delayInSec,
  updateStatusToComplete,
}: SyncDelayDialogProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Sync Delay</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>Sync will be available once the countdown is complete.</p>
          <CountdownTimer
            delaySeconds={delayInSec}
            onComplete={updateStatusToComplete}
          />
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
