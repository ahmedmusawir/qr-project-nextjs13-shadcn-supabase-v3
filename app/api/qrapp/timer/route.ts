import { NextResponse } from "next/server";

// Trigger the timer by emitting an event to Socket.IO
export async function GET() {
  const io = globalThis.io; // Use the globally available Socket.IO instance

  if (!io) {
    return NextResponse.json(
      { message: "Socket.IO server not available" },
      { status: 500 }
    );
  }

  // Check if a timer is already running
  let countdown = 30; // Set the initial countdown to 30 seconds

  // Emit the countdown every second
  const interval = setInterval(() => {
    if (countdown >= 0) {
      io.emit("delay_timer", `Countdown: ${countdown} seconds remaining`);
      countdown--;
    } else {
      io.emit("delay_timer", "Countdown ENDED");
      clearInterval(interval);
    }
  }, 1000);

  io.emit("sync_progress", "Sync in progress..."); // Initial sync progress message
  return NextResponse.json({ message: "Timer started" });
}
