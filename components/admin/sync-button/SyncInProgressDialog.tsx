import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [syncedTickets, setSyncedTickets] = useState(0); // Track ticket types checked
  const [orderProgressPercent, setOrderProgressPercent] = useState(0); // Track order progress percentage
  const [ticketProgressPercent, setTicketProgressPercent] = useState(0); // Track ticket progress percentage
  const [currentPhase, setCurrentPhase] = useState("Syncing Orders"); // Track which phase we're in
  const [heartbeat, setHeartbeat] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
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

    // Listen for sync progress during Order sync
    socket.on("sync_progress", (data) => {
      setCurrentPhase("Syncing Orders");
      console.log("Received sync progress:", data);

      setSyncedOrders(data.syncedOrders); // Update synced orders
      const progress = Math.round((data.syncedOrders / totalOrders) * 100);
      setOrderProgressPercent(progress); // Calculate and update percentage
    });

    // Listen for sync progress during Ticket sync
    socket.on("sync_ticket_progress", (data) => {
      setCurrentPhase("Verifying Tickets");
      console.log("Received sync ticket progress:", data);

      const progress = Math.round(
        (data.totalTicketsChecked / data.totalTicketTypes) * 100
      );
      setTicketProgressPercent(progress); // Update ticket sync progress percentage
      setSyncedTickets(data.totalTicketsChecked);
    });

    // Listen for sync completion
    socket.on("sync_complete", (data) => {
      console.log("Received sync complete:", data.message);
      setOrderProgressPercent(100); // Ensure progress bar is filled for orders
      setTicketProgressPercent(100); // Ensure progress bar is filled for tickets
      setStatusMessage(
        "The Sync Process is complete! You may close this dialog."
      );
    });

    // Clean up the WebSocket connection
    return () => {
      socket.disconnect();
    };
  }, [totalOrders]);

  return (
    <Dialog open>
      <DialogContent className="bg-white">
        <DialogHeader className="bg-slate-600 p-5">
          <DialogTitle className="text-white font-bold">
            Data Sync Process:
          </DialogTitle>
        </DialogHeader>
        <p>Phase: {currentPhase}</p>

        {/* Order Sync Progress */}
        {orderProgressPercent < 100 && (
          <>
            <p>
              Currently Syncing Orders: {syncedOrders} of {totalOrders}
            </p>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  {orderProgressPercent}% Orders Synced
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${orderProgressPercent}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                ></div>
              </div>
            </div>
          </>
        )}

        {/* Ticket Sync Progress */}
        {orderProgressPercent === 100 && ticketProgressPercent < 100 && (
          <>
            <p>Currently Verifying Tickets: {syncedTickets}</p>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  {ticketProgressPercent}% Tickets Verified
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${ticketProgressPercent}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                ></div>
              </div>
            </div>
          </>
        )}

        {/* Completion Message */}
        {orderProgressPercent === 100 && ticketProgressPercent === 100 && (
          <h3 className="text-2xl font-bold text-green-700">
            {statusMessage ||
              "The Sync Process is complete! You may close this dialog."}
          </h3>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Live Heartbeat: {heartbeat}
        </div>
        <DialogFooter>
          <Button
            className="bg-green-700 hover:bg-green-600 text-white"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncInProgressDialog;
