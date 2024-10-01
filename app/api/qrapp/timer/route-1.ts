import { NextRequest, NextResponse } from "next/server";
import WebSocket, { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;
let timerRunning = false;

// Initialize WebSocket server inside the route
function initWebSocketServer(req: any, res: any) {
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    console.log("WebSocket server initialized");

    req.socket.server.on("upgrade", (request: any, socket: any, head: any) => {
      wss?.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss?.emit("connection", ws, request);
      });
    });

    wss.on("connection", (ws: WebSocket) => {
      console.log("A client connected");

      ws.on("message", (message: Buffer) => {
        const receivedMessage = message.toString("utf-8");
        console.log("Received message:", receivedMessage);

        if (receivedMessage.trim() === "start_timer") {
          startTimer(ws); // Start the timer
        }
      });

      ws.on("close", () => {
        console.log("A client disconnected");
      });
    });
  }

  return NextResponse.json({ message: "WebSocket server initialized" });
}

async function startTimer(ws: WebSocket) {
  if (timerRunning) {
    ws.send("Timer is already running");
    return;
  }

  timerRunning = true;
  let countdown = 30;

  const interval = setInterval(() => {
    if (countdown >= 0) {
      ws.send(`Countdown: ${countdown} seconds remaining`);
      countdown--;
    } else {
      ws.send("Countdown ENDED");
      clearInterval(interval);
      timerRunning = false;
    }
  }, 1000);

  console.log("Timer started");
}

// Handle GET request
export async function GET(req: NextRequest) {
  if (!wss) {
    return initWebSocketServer(req, {});
  }

  return NextResponse.json({ message: "WebSocket server is already running" });
}
