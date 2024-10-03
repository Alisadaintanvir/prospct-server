const socketIo = require("socket.io");

let io;

// Initialize Socket.io and export it for use in other parts of the app
const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*", // Allow requests from any origin (adjust this as needed)
      methods: ["GET", "POST"],
    },
  });

  // Handle connection
  io.on("connection", (socket) => {
    // Handle joining a room
    socket.on("joinRoom", (fileId) => {
      socket.join(fileId); // Join the specific room based on fileId
      console.log(`User ${socket.id} joined room: ${fileId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};

// Emit events for real-time updates
const emitVerificationUpdate = (fileId, status) => {
  if (io) {
    // Emit the status update to the specific room (fileId)
    io.to(fileId).emit("verificationUpdate", { status });
    console.log(`Emitting update to room ${fileId}: Status = ${status}`);
  }
};

module.exports = { initSocket, emitVerificationUpdate };
