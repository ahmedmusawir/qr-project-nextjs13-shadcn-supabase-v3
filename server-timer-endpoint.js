const express = require("express");
const next = require("next");
const http = require("http");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

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

  globalThis.io = io; // Make io globally available

  io.on("connection", (socket) => {
    console.log("A client connected");

    // Send heartbeat messages every 3 seconds
    let heartbeatCount = 1;
    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", `Heartbeat ${heartbeatCount}`);
      heartbeatCount++;
    }, 3000);

    socket.on("disconnect", () => {
      clearInterval(heartbeatInterval); // Clear interval on disconnect
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
    console.log("Socket.IO server running on ws://localhost:3000");
  });
});
