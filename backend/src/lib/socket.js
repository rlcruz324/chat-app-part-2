// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:5173"],
//   },
// });

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// // Used to store online users
// const userSocketMap = {}; // {userId: socketId}

// // Rate limiting settings
// const RATE_LIMIT = 5; // Max events allowed
// const TIME_FRAME = 10 * 1000; // Time window in milliseconds (10 sec)

// const userRateLimitMap = {}; // { userId: { count, lastReset } }

// // Middleware for rate limiting
// io.use((socket, next) => {
//   const userId = socket.handshake.query.userId;
//   if (!userId) {
//     return next(new Error("Authentication required"));
//   }

//   if (!userRateLimitMap[userId]) {
//     userRateLimitMap[userId] = { count: 0, lastReset: Date.now() };
//   }

//   const userData = userRateLimitMap[userId];
//   const currentTime = Date.now();

//   if (currentTime - userData.lastReset > TIME_FRAME) {
//     userData.count = 0;
//     userData.lastReset = currentTime;
//   }

//   if (userData.count >= RATE_LIMIT) {
//     return next(new Error("Rate limit exceeded. Try again later."));
//   }

//   userData.count++;
//   next();
// });

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId) userSocketMap[userId] = socket.id;

//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("message", (msg) => {
//     const userData = userRateLimitMap[userId];

//     if (userData.count >= RATE_LIMIT) {
//       socket.emit("error", "You're sending messages too fast. Please slow down.");
//       return;
//     }

//     userData.count++;

//     io.emit("message", { userId, msg });
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// server.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });

// export { io, app, server };




import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };