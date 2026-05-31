import mongoose from "mongoose";
import { config } from "./env_config.js";
import logger from "../utils/logger.js";

// Import all models to register their schemas in Mongoose
import "../models/Faculty.js";
import "../models/Department.js";
import "../models/User.js";
import "../models/Student.js";
import "../models/QRIdentity.js";
import "../models/VerificationLog.js";

const connectDB = async () => {
  try {
    logger.info("Connecting to MongoDB database...");
    
    const conn = await mongoose.connect(config.mongo_uri);

    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
    
    // Register event listeners for ongoing connection issues
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection runtime error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected");
    });

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connection reconnected");
    });
    
  } catch (error) {
    logger.error("Failed to connect to MongoDB database:", error);
    process.exit(1);
  }
};

export default connectDB;