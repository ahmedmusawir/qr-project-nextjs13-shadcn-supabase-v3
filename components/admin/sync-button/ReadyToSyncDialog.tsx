import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReadyToSyncDialogProps {
  onClose: () => void;
  onStart: () => void;
}

const ReadyToSyncDialog = ({ onClose, onStart }: ReadyToSyncDialogProps) => {
  return (
    <Dialog open>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Ready to Sync Data?</DialogTitle>
        </DialogHeader>
        <p>
          Please remember:
          <ul>
            <li>
              1. It's a long process, might take 5 to 10 minutes to finish!
            </li>
            <li>
              2. Please avoid canceling mid-process to prevent data corruption.
            </li>
          </ul>
        </p>
        <DialogFooter>
          <Button
            className="bg-indigo-500 text-white hover:bg-indigo-700"
            variant="default"
            onClick={onStart}
          >
            Start Data Sync
          </Button>
          <Button
            className="bg-red-500 text-white hover:bg-red-700"
            variant="destructive"
            onClick={onClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReadyToSyncDialog;
