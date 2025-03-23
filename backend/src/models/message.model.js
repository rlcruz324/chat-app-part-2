//The Message Format In the database 
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    //file and fileType not in tutorial 
    //mongodb should be able to store emojis
    //Test for sending files between users hopefully can implement this later
    file: {
        type: String, // This will store the file URL/path
    },
    fileType: {
        type: String, // Optional: Store the file type (e.g., "pdf", "docx")
    },
    // iv: {
    //   type: String, // Store the iv as a string (in hex format)
    //   required: true, // Make it required if you plan to always store it
    // },
  },
  { timestamps: true } //to show created at
);

const Message = mongoose.model("Message", messageSchema);

export default Message;