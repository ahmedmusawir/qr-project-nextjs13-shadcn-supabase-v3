// Start the delay timer and broadcast updates every second
async function startDelayTimer(delayInSeconds: number) {
  const io = globalThis.io; // Access the global socket.io instance
  console.log(`Starting backend timer for ${delayInSeconds} seconds...`);

  for (let i = delayInSeconds; i >= 0; i--) {
    const data = {
      status: "Delay",
      delayInSec: i,
    };

    // Broadcast the current timer value to all connected clients
    if (io) {
      io.emit("sync_status", data); // Emit the timer value as sync status
      console.log(`Broadcasting delay timer: ${i} seconds remaining`);
    }

    // Wait for 1 second before the next update
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("Delay timer completed.");
}

export default startDelayTimer;
