import mongoose from "mongoose"; //allows us to connect to mongoDB server

//Function to connect to MongoDB
const connectToMongoDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);//Try to connect to server using MONGO_DB_URI from .env file
        console.log("Connected to MongoDB");//If connects console log 
    } catch (error) {
        console.log("Error connecting to MongoDB", error.message);//If fails console log error
    }
};

export default connectToMongoDB; //export function to use in server.js