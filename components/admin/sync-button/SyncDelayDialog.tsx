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

interface SyncDelayDialogProps {
  onClose: () => void;
}

const SyncDelayDialog = ({ onClose }: SyncDelayDialogProps) => {
  const [delayCountdown, setDelayCountdown] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [heartbeat, setHeartbeat] = useState("");

  useEffect(() => {
    // Connect to the Socket.IO server
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

    // Listen for delay countdown
    socket.on("delay_timer", (countdown: string) => {
      console.log("COUNTDOWN", countdown);
      // Check if the countdown is a number or "Countdown ENDED"
      if (countdown.includes("ENDED")) {
        setDelayCountdown(null); // Set the countdown to null to stop the clock
        setStatusMessage("Sync Button is Ready!"); // Display ready message
      } else {
        // Parse the countdown number if it's still running
        const count = parseInt(countdown.match(/\d+/)?.[0] || "0");
        setDelayCountdown(count); // Directly update delay countdown
        setStatusMessage(""); // Clear the message while countdown is running
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader className="bg-slate-700 p-5">
          <DialogTitle>
            <h1 className="text-red-500">Sync Delay</h1>
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p className="font-extrabold">
            Sync will be available once the countdown is complete.
          </p>

          <div className="mt-6">
            {delayCountdown !== null ? (
              <>
                <CountdownTimer delayInSec={delayCountdown} />
              </>
            ) : (
              <p className="text-2xl font-bold text-green-700">
                {statusMessage}
              </p>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Live Heartbeat: {heartbeat}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-green-700 hover:bg-green-600 text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Countdown Timer component to break down into minutes and seconds
const CountdownTimer = ({ delayInSec }: { delayInSec: number }) => {
  // Convert delayInSec to minutes and seconds
  const mins = Math.floor(delayInSec / 60);
  const secs = delayInSec % 60;

  return (
    <div className="flex items-center justify-center space-x-3 bg-gray-100 p-5">
      <div className="w-40 p-4 bg-white rounded shadow">
        <p className="text-4xl font-medium text-gray-700">{mins}</p>
        <p className="text-sm text-gray-500">Mins</p>
      </div>
      <div className="w-40 p-4 bg-white rounded shadow">
        <p className="text-4xl font-medium text-gray-700">{secs}</p>
        <p className="text-sm text-gray-500">Secs</p>
      </div>
    </div>
  );
};

export default SyncDelayDialog;
