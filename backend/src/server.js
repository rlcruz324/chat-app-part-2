import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import rateLimit from "express-rate-limit"; // Import rate limiting middleware

import connectToMongoDB from "./lib/db.js";

//import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
//const app = express(); //make express app

import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: "Too many requests from this IP, please try again later.",
  headers: true,
});


app.use(rateLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectToMongoDB();
});



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// import express from "express";
// import dotenv from "dotenv";// Allows us to use .env and get value in ${PORT}
// import cookieParser from "cookie-parser";
// import cors from "cors"; //The CORS package helps configure the CORS behavior of your server. It allows you to specify which domains (origins) are allowed to access your server's resources. This is essential for allowing or blocking cross-origin requests from other websites or applications.
// import WebSocket, { WebSocketServer } from 'ws'; 
// //https stuff
// import https from "https";
// import fs from 'fs';

// // ////////Import Routes
// import authRoutes from "./routes/auth.route.js" //authRoutes function from auth.routes.js
// import messageRoutes from "./routes/message.route.js"

// import connectToMongoDB from "./lib/db.js";

// const app = express(); //make express app

// //SSL/TLS certificate and key currently for local host
// // Read the certificate and key files
// const cert = fs.readFileSync('SSL/localhost.pem');
// const key = fs.readFileSync('SSL/localhost-key.pem');
// //Create HTTPS server options
// const httpsOptions = {
//     cert: cert,
//     key: key,
// };
// // Create HTTPS server
// const server = https.createServer(httpsOptions, app);
// // Create a WebSocket server instance, using the existing HTTPS server
// const wss = new WebSocketServer({ server });

// wss.on('connection', ws => {
//   console.log('Client connected');
  
//   ws.on('message', message => {
//     console.log(`Received: ${message}`);
//     ws.send(`Server received: ${message}`);
//   });
  
//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
  
//   ws.on('error', error => {
//     console.error('WebSocket error:', error);
//   });
// });

// app.use(express.json());//allows us to extract json data out of body
// //Instead of having a list of routes we use express as middleware to call to a route
// app.use(cookieParser()); //allows us to parse cookies
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );


// app.use("/api/auth", authRoutes) //when you go to /api/auth we are going to call auth.routes.js (authRoutes)
// app.use("/api/message", messageRoutes) //when you go to /api/message we are going to call message.routes.js 


// dotenv.config(); // Allows us to use .env and get value in ${PORT}
// const PORT = process.env.PORT || 5001; //gets PORT from process.env.PORT file or port 5000
// //starts express server at specified port
// server.listen(PORT, () => {
//     connectToMongoDB(); //uses function from db.js in lib folder
//     console.log(`Server Running on port ${PORT} at https://localhost:${PORT}`); //logs that server is running
// });

//////////////////////////////////////////////////
// app.listen(5001, () => {
//     console.log("Server is running on port 5001");
// });

// app.get("/", (req, res) => {
//     res.send("Hello World!!!!!!!!!!!!!!!!!!!!");
// });

// //Instead of having a list of routes we use express as middleware to call to a route
// app.use("/api/auth", authRoutes) //when you go to /api/auth we are going to call auth.routes.js (authRoutes)
