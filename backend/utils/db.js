const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
// MongoDB connection string
const dbURI = `${process.env.MONGO_URL}`;

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(dbURI);
      console.log("MongoDB connected successfully");
    } else {
      console.log("MongoDB already connected");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

module.exports = connectDB;
