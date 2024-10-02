const express = require("express");
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const SYNC_STATUS_PATH = path.join(__dirname, "public", "sync_status.json");

// Function to read sync status from file
function readSyncStatus() {
  try {
    const data = fs.readFileSync(SYNC_STATUS_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading sync status:", error);
    return null;
  }
}

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  globalThis.io = io; // Make io globally available

  // WebSocket connection
  io.on("connection", (socket) => {
    console.log("A client connected");

    // Emit the initial sync status when a client connects
    const syncStatus = readSyncStatus();
    if (syncStatus) {
      socket.emit("sync_status", syncStatus);
      console.log("Broadcasted initial sync status:", syncStatus);
    }

    // Send heartbeat messages every 3 seconds
    let heartbeatCount = 1;
    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", `Heartbeat ${heartbeatCount}`);
      heartbeatCount++;
    }, 3000);

    // Handle client disconnect
    socket.on("disconnect", () => {
      console.log("A client disconnected");
      clearInterval(heartbeatInterval); // Clear the interval when a client disconnects
    });
  });

  // Serve static files from the `.next` folder for production
  server.use(express.static(path.join(__dirname, ".next")));

  // All other requests are handled by Next.js
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  // Start the server on port 4001 (or any other custom port you prefer)
  httpServer.listen(4001, (err) => {
    if (err) throw err;
    console.log("Server running on http://localhost:4001");
    console.log("Socket.IO server running on ws://localhost:4001");
  });
});
