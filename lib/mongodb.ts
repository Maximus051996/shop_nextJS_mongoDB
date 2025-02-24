import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI in your .env file");
}

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("✅ Using existing MongoDB connection");
      return;
    }

    await mongoose.connect(MONGODB_URI); // No extra options needed in Mongoose 6+
    console.log("🔥 MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
