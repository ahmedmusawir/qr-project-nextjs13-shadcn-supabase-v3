"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const WebSocketTestPage = () => {
  const [heartbeat, setHeartbeat] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [delayCountdown, setDelayCountdown] = useState("");

  useEffect(() => {
    // Connect to the Socket.IO server
    // Use the environment variable for dynamic URL
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
    );

    socket.on("connect", () => {
      setHeartbeat("Connected to server");
    });

    // Listen for heartbeats
    socket.on("heartbeat", (message) => {
      setHeartbeat(message);
    });

    // Listen for sync progress updates
    socket.on("sync_progress", (status) => {
      setSyncStatus(status);
    });

    // Listen for delay countdown
    socket.on("delay_timer", (countdown) => {
      setDelayCountdown(countdown);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Function to trigger the timer via API call
  const startSync = async () => {
    console.log("Triggering sync via API...");
    try {
      const response = await fetch("/api/qrapp/timer");
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error("Error starting sync:", error);
    }
  };

  return (
    <div>
      <h1>Order Sync & Delay Test</h1>
      <p>Check the browser console for sync progress.</p>

      <ul>
        <li>Live Heartbeat: {heartbeat}</li>
        <li>Sync Status: {syncStatus}</li>
        <li>Delay Countdown: {delayCountdown}</li>
      </ul>

      <button onClick={startSync} className="bg-blue-500 text-white p-2 mt-4">
        Start Sync
      </button>
    </div>
  );
};

export default WebSocketTestPage;
