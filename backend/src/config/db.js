import mongoose from "mongoose";
import { config } from "./env_config.js";


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo_uri);

    console.log(
      `MongoDB Connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error("Database Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;