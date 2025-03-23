import express from "express";

//Import Functions from auth.controller.js
import { login, logout, signup, updateProfile, checkAuth} from "../controllers/auth.controller.js";
//Import Function from auth.middleware.js
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router(); //creates a router


//instead of all the functions being here they will be in controllers folder
//this way if they end up being really long they don't clog up auth.routes.js
//functions are in auth.controller.js

router.post("/signup", signup); //if this router is a get to /signup then run signup function from auth.controller
router.post("/login", login); //if this router is a get to /login then run login function from auth.controller
router.post("/logout", logout); ////if this router is a get to /logout then run login function from auth.controller

//A POST request is an HTTP request method used to send data to a server to create or update a resource

router.put("/update-profile", protectRoute, updateProfile);
//users must be authenticated to update profile pic (protectRoute) middleware auth.middleware.js
//protectRoute checks if user is authenticated if they are we move to updateProfile

router.get("/check", protectRoute, checkAuth);
//If we refresh we need to check if user is authenticated 
//If they are we take them to the profile page
//If not we take them to the login page

// router.get("/signup", (req, res) => {
//     res.send("signup route")
// })

// router.get("/login", (req, res) => {
//     res.send("login route")
// })

// router.get("/logout", (req, res) => {
//     res.send("logout route")
// })


export default router; //exports the router so we can use it in server.js


