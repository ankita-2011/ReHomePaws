import mongoose from "mongoose";
import dns from "dns";

// Force Node.js to use Google's public DNS servers to resolve MongoDB Atlas SRV records.
// The system/ISP DNS often cannot resolve _mongodb._tcp.* SRV entries, causing ECONNREFUSED.
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

let isUsingLocalDB = false;

const connectDB = async () => {
  try {
    // Primary Atlas connection
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }
    // Ensure a database name is present (default to rehomepaws)
    if (uri.includes("mongodb.net/?")) {
      uri = uri.replace("mongodb.net/?", "mongodb.net/rehomepaws?");
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Atlas connected successfully");
  } catch (err) {
    console.error("MongoDB Atlas connection failed:", err.message);
    // Fallback to local MongoDB if env var provided
    const localUri = process.env.LOCAL_MONGODB_URI;
    if (!localUri) {
      console.error("No LOCAL_MONGODB_URI defined; cannot fallback.");
      process.exit(1);
    }
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 20000,
      });
      console.log("Connected to local MongoDB fallback.");
      isUsingLocalDB = true;
    } catch (fallbackErr) {
      console.error("Local MongoDB fallback failed:", fallbackErr.message);
      process.exit(1);
    }
  }
};

export default connectDB;
export const getDBFallbackFlag = () => isUsingLocalDB;