require("dotenv").config();

const { MongoClient } = require("mongodb");

// Replace 'your_connection_string' with your actual MongoDB connection string
const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/Large_Data";

// Create a new MongoClient
const client = new MongoClient(mongoURI);

// Connect to the database
const connectDB = async () => {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Export the client and connect function
module.exports = {
  connectDB,
  client,
};
