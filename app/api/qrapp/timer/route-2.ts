import { NextResponse } from "next/server";

// Trigger the timer by emitting an event to Socket.IO
export async function GET() {
  const io = globalThis.io;

  if (!io) {
    return NextResponse.json(
      { message: "Socket.IO server not available" },
      { status: 500 }
    );
  }

  io.emit("start_timer"); // Trigger the start_timer event
  return NextResponse.json({ message: "Timer started" });
}
