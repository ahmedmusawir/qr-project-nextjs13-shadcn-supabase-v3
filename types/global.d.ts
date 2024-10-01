// Extend the globalThis interface to include the io property
declare namespace globalThis {
  var io: import("socket.io").Server | undefined;
}
