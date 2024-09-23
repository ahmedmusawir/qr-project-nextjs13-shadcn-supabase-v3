import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmCancelDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCancelDialog = ({
  onConfirm,
  onCancel,
}: ConfirmCancelDialogProps) => {
  return (
    <Dialog open>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Are you sure you want to stop the sync?</DialogTitle>
        </DialogHeader>
        <p>
          Please remember, if you cancel now, it may cause Data corruption and
          app malfunction.
        </p>
        <DialogFooter>
          <Button
            className="bg-red-500 hover:bg-red-700 text-white"
            variant="destructive"
            onClick={onConfirm}
          >
            Yes, Stop Sync
          </Button>
          <Button
            className="bg-indigo-500 hover:bg-indigo-700 text-white"
            variant="default"
            onClick={onCancel}
          >
            No, Continue Sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmCancelDialog;
