//Functions for auth.routes.js
//signup, login, logout, updateProfile, checkauth Functions

//imports
import { generateToken } from "../lib/utils.js"; //Generate jwt token
import User from "../models/user.model.js" //The model/format of the User's data
import bcrypt from "bcryptjs" //Allows hashing of passwords
import cloudinary from "../lib/cloudinary.js";

//for signup route in auth.route.js
export const signup = async (req, res) => {
    const {username, password} = req.body;
    try {
        //Check to make sure a username and password are provided 
        if(!username || !password) {
            return res.status(400).json({ message: "Must provide a Username and Password." })
        }

        //Check Password to make sure it is the right length and complexity
        //Password Length
        if (password.length < 10) {
            return res.status(400).json({ message: "Password must be at least 10 characters." });
        }
        //There is at least 1 number
        const hasNumber = /\d/; // Regex to check for a digit (0-9)
        if (!hasNumber.test(password)) {
            return res.status(400).json({ message: "Password must contain at least 1 number." });
        }
        // There is at least 1 letter
        const hasLetter = /[a-zA-Z]/; // Regex to check for letters (both lower and upper case)
        if (!hasLetter.test(password)) {
            return res.status(400).json({ message: "Password must contain at least 1 letter." });
        }
        //There is at least 1 symbol
        const hasSymbol = /[^a-zA-Z0-9]/; // Regex to check for non-alphanumeric characters (symbols)
        if (!hasSymbol.test(password)) {
            return res.status(400).json({ message: "Password must contain at least 1 symbol." });
        }

        //Check is Username is taken
        const user = await User.findOne({username}) //look for username in DB
        if (user) return res.status(400).json({ message: "Username already taken" }); 
    

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)


        //Create New User
        const newUser = new User({
            username: username,
            password: hashedPassword
        })

        //Generate JWT Token
        if (newUser) {
            //generate jwt token
            generateToken(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                username: newUser.$assertPopulatedusername,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ message: "Invalid user data "});
        }

    } catch (error) {
        console.log("Error in signup contoller", error.message);
        res.status(500).json({ message: "Internal Server Error" });

    }
}; //async(asyncronis function allows for things like wait or promise)

export const login =  async (req, res) => {
    const { username, password } = req.body;
    try {
        //Check if Usernames Match
        const user = await User.findOne({username}); //check username
        //If no user matches name
        if(!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        // Check if the user has exceeded the login attempt limit
        const currentTime = Date.now();
        const lockoutPeriod = 10 * 60 * 1000; // 10 minutes (in milliseconds)
        const maxFailedAttempts = 5;

         // If the user has failed attempts within the last 10 minutes
        if (user.failedLoginAttempts >= maxFailedAttempts) {
            const timeSinceFirstAttempt = currentTime - user.firstFailedAttempt.getTime();
            
            // Block the user if it's within the lockout period
            if (timeSinceFirstAttempt < lockoutPeriod) {
            return res.status(429).json({
                message: `Too many login attempts. Please try again after ${Math.ceil(
                (lockoutPeriod - timeSinceFirstAttempt) / 60000
                )} minutes.`,
            });
            }
    
            // Reset the failed login attempt count after lockout period
            user.failedLoginAttempts = 0;
            user.firstFailedAttempt = null;
            await user.save();
        }

        
        //Check if Passwords Match
        const isPasswordCorrect = await bcrypt.compare(password, user.password); //compare to hash password
        if (!isPasswordCorrect) {
            user.failedLoginAttempts += 1;
            if (user.failedLoginAttempts === 1) {
                user.firstFailedAttempt = new Date(); // Set the first failed attempt time
              }
            await user.save();
            return res.status(400).json({ message: "Invalid Credentials" });
        }


        // If Username and Password match, reset failed attempts and generate token
        user.failedLoginAttempts = 0;
        user.firstFailedAttempt = null;
        await user.save();

        //If Username and Password match then generate token
        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            username: user.fullName,
            profilePic: user.profilePic,
          });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error "});
    }
}; 

export const logout =  (req, res) => {
    try {
        //Clear Cookies
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }   
}; 

//If have time try to change this so it does not use cloudinary bucket
//Changing profile pics isnt required so its probably fine for now

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        quality: "auto:low", // Compress image automatically
        format: "webp", // Convert to WebP for better compression
        transformation: [{ width: 600, height: 600, crop: "limit" }] // Restrict size
        });
      
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);


      
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};
  

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
