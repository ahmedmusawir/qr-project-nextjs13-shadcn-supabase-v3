import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/common/Spinner";
import io from "socket.io-client";

interface SyncInProgressDialogProps {
  totalOrders: number;
  onClose: () => void; // Handle completion
}

const SyncInProgressDialog = ({
  totalOrders,
  onClose,
}: SyncInProgressDialogProps) => {
  const [syncedOrders, setSyncedOrders] = useState(0); // Track synced orders
  const [progressPercent, setProgressPercent] = useState(0); // Track progress percentage
  const [heartbeat, setHeartbeat] = useState("");

  useEffect(() => {
    // Use the environment variable for dynamic URL
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
    );

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    // Listen for heartbeats
    socket.on("heartbeat", (message) => {
      setHeartbeat(message);
    });

    // Listen for sync progress updates
    socket.on("sync_progress", (data) => {
      console.log("Received sync progress:", data);

      setSyncedOrders(data.syncedOrders); // Update synced orders
      setProgressPercent(Math.round((data.syncedOrders / totalOrders) * 100)); // Calculate percentage
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [totalOrders]);

  return (
    <Dialog open>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Data Sync Process Has Begun!</DialogTitle>
        </DialogHeader>
        <p>Total Orders to Sync: {totalOrders}</p>
        <p>
          Currently Processing: {syncedOrders} of {totalOrders}
        </p>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                {progressPercent}% Completed
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
            <div
              style={{ width: `${progressPercent}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
            ></div>
          </div>
        </div>

        <div>
          <Spinner />
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Live Heartbeat: {heartbeat}
        </div>
        <DialogFooter>
          <Button
            className="bg-red-500 hover:bg-red-700 text-white"
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
