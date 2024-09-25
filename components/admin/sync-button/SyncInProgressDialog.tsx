import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/common/Spinner";

interface SyncInProgressDialogProps {
  totalOrders: number;
  onClose: () => void; // Handle completion
}

const SyncInProgressDialog = ({
  totalOrders,
  onClose,
}: SyncInProgressDialogProps) => {
  return (
    <Dialog open>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Data Sync Process Has Begun!</DialogTitle>
        </DialogHeader>
        <p>Total Orders to Sync: {totalOrders}</p>
        <div>
          <Spinner />
        </div>
        <DialogFooter>
          <Button
            className="bg-red-500 hover:bg-red-700 text-white"
            variant="destructive"
            onClick={onClose} // Handle closing the modal
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncInProgressDialog;
