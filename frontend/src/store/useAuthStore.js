//Functions for useAuthStore

import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

//This function initializes and returns a store that manages authentication-related state.
export const useAuthStore = create((set, get) => ({
    //Zustland flags
    authUser: null, //Holds the authenticated user's data (initially null).
    isSigningUp: false, //This flag indicates whether the sign-up process is in progress. Initally false
    isLoggingIn: false, //This flag tracks whether the user is currently logging in.
    isUpdatingProfile: false, //This flag indicates whether the user's profile is being updated.

    isCheckingAuth: true, //A flag indicating whether the authentication check is in progress.
//   These flags are typically used for controlling the user interface experience during asynchronous operations. For example, during any of these actions (sign-up, login, or profile update), you may want to:
//   Disable form fields or buttons to prevent users from submitting the form multiple times.
//   Display a loading spinner or some indicator that the action is in progress.
//   Provide feedback on success or failure once the action completes.

  onlineUsers: [],
  socket: null,

    //Use my checkAuth function from /backend/src/controllers/auth.controller.js
    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check"); 
            //using axios so don't need to .get{"http://localhost:5001/api/auth/check"}

            set({ authUser: res.data }); //updates the authUser state flag
            get().connectSocket();
            
        } catch (error) {
            console.log("Error in checkAuth:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });
        toast.success("Account created successfully");
        get().connectSocket();
        } catch (error) {
        toast.error(error.response.data.message);
        } finally {
        set({ isSigningUp: false });
        }
    },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));