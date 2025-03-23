import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
//send cookies in every single request
  withCredentials: true,
});

//This lets me use the apis I made in backend like auth.route.js and message.route.js
// Ensure all API requests go to the correct backend server.
// Send authentication credentials (cookies, tokens) automatically.
// Make HTTP requests in a consistent and reusable way.