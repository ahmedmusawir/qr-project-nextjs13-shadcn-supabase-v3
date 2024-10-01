// server.js
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

// Prepare the Next.js app and Socket.IO server
app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Initialize Socket.IO on the same server as Next.js
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // WebSocket connection
  io.on("connection", (socket) => {
    console.log("A client connected");

    // Emit the initial sync status when a client connects
    const syncStatus = readSyncStatus();
    if (syncStatus) {
      socket.emit("sync_status", syncStatus);
      console.log("Broadcasted initial sync status:", syncStatus);
    }

    // Handle client disconnect
    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  // All other requests are handled by Next.js
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log("Server running on http://localhost:3000");
  });
});
