import { useEffect, useState, useRef } from "react";
import { useSyncStore } from "@/store/useSyncStore";
import { SyncStatus } from "@/types/sync";

interface CountdownTimerProps {
  delaySeconds: number; // Accept the delay seconds
  onComplete: () => void; // Function to call when countdown is complete
}

const CountdownTimer = ({ delaySeconds, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(delaySeconds);

  const syncStatus = useSyncStore((state) => state.syncStatus);
  const updateSyncStatus = useSyncStore((state) => state.updateSyncStatus);

  // Store the last time delay_in_sec was updated
  const lastSyncTimeRef = useRef<number>(delaySeconds);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          onComplete(); // Trigger the completion logic when countdown hits 0
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [onComplete]);

  // Update Zustand and syncStatus, but only when delay_in_sec actually changes
  useEffect(() => {
    const newDelayInSec = timeLeft;

    // Only update when the time has actually decreased
    if (syncStatus && newDelayInSec !== lastSyncTimeRef.current) {
      // Throttle the status update (e.g., update once every 30 seconds)
      if (newDelayInSec % 30 === 0) {
        updateSyncStatus({ ...syncStatus, delay_in_sec: newDelayInSec });
        lastSyncTimeRef.current = newDelayInSec; // Keep track of the last updated time
      }
    }
  }, [timeLeft, syncStatus, updateSyncStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs };
  };

  const { mins, secs } = formatTime(timeLeft);

  return (
    <div className="flex items-center justify-center space-x-3 bg-gray-100 p-5">
      <div className="w-40 p-4 bg-white rounded shadow">
        <p className="text-lg font-medium text-gray-700">{mins}</p>
        <p className="text-sm text-gray-500">Mins</p>
      </div>
      <div className="w-40 p-4 bg-white rounded shadow">
        <p className="text-lg font-medium text-gray-700">{secs}</p>
        <p className="text-sm text-gray-500">Secs</p>
      </div>
    </div>
  );
};

export default CountdownTimer;
