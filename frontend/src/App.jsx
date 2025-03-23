// const App = () => {
//   return( 
//     <div>



//     </div>
//   )
// }
// export default App

import Navbar from "./components/Navbar";

//Import the Pages We need to navigate to
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";

import { axiosInstance } from "./lib/axios"; //allows us to use axios.get axios.post etc to interact with the apis I made in backend

import { useAuthStore } from "./store/useAuthStore"; //lets us use the useAuthStore we made from useAuthStore.js
// import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  // const { theme } = useThemeStore();

  // console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  //Adds Loading State 
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        {/* //Displays rotating icon while page is loading */}
        <Loader className="size-10 animate-spin" /> 
      </div>
    );

  return (
  //   <div data-theme={theme}>
    <div>
      {/* On Top of Every Page we want the Navbar component that we made in components/Navbar.jsx*/}
      <Navbar /> 

      {/* These are the routes to each page that we need. */}
      <Routes>
        {/* if we got to homepage show the homepage component located in pages folder */}
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;