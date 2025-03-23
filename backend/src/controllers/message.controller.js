import crypto from 'crypto';
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Encryption key and IV length
const ENCRYPTION_KEY = "bUQXBJpTj8aKEu1xQXwUzq9lifBu8heI" // Move this to ,env file if have time
const IV_LENGTH = 16; // AES block size is 16 bytes

// Encrypt function
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Return iv + encrypted text
};

// Decrypt function
const decrypt = (encrypted) => {
  const [ivHex, encryptedText] = encrypted.split(':'); // Separate iv and encrypted text
  if (!ivHex || !encryptedText) {
    throw new Error("Invalid encrypted message format");
  }

  const iv = Buffer.from(ivHex, 'hex'); // Convert IV from hex
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  
  return decrypted;
};

// Function that fetches every single user except ourselves for the sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; //gets logged in user id
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); //find all the users minus their passwords except the currently logged in one 

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get messages between two users.
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; //Gets the userid of the user i want to send message to
    const myId = req.user._id; //Gets the current users id

    // Find all the messages where I am the sender or the other user is the sender
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId }, // myid = usertochatid
        { senderId: userToChatId, receiverId: myId }, // or vice versa
      ],
    });

    // Decrypt the text of each message
    const decryptedMessages = messages.map((message) => {
      if (message.text) {
        try {
          message.text = decrypt(message.text); // Decrypt the message text
        } catch (error) {
          console.error("Error during decryption: ", error.message);
          message.text = "Error decrypting message"; // Return a placeholder if decryption fails
        }
      }
      return message;
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body; // Grab the text, image, or file from the database
    const { id: receiverId } = req.params; // Grab the receiver id
    const senderId = req.user._id; // Grab the sender id

    // Encrypt the text message before saving
    let encryptedText;
    if (text) {
      encryptedText = encrypt(text); // Encrypt the message
    }

    // If user sends an image, upload it to Cloudinary
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    
    // Create the message object
    const newMessage = new Message({
      senderId,
      receiverId,
      text: encryptedText, // Save encrypted text
      image: imageUrl,
    });

    // Create the send message object
    const sendMessage = new Message({
      senderId,
      receiverId,
      text, // Save encrypted text
      image: imageUrl,
    });

    await newMessage.save(); // Save the message

    // Real-time functionality using socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", sendMessage);
    }

    res.status(201).json(sendMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};