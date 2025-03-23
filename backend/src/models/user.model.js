//This is how user information will be formatted in the database

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // email: {
    //     type: String,
    //     required: true,
    // }, //I don't want to be responsible for emails
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 10,
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    firstFailedAttempt: {
        type: Date,
        default: null,
    },
    profilePic: {
        type: String,
        default: "",
    },

},
{ timestamps: true } //from profile created at and member since
);

const User = mongoose.model("User", userSchema); //create the model with mongoose (Mongo needs User to be singular and first letter cap)
export default User;