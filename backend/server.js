import { config } from "./src/config/env_config.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import logger from "./src/utils/logger.js";

// Handle uncaught exceptions globally
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception! Server shutting down...", error);
  process.exit(1);
});

const PORT = config.port || 5000;
let server;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Start Express Server
    server = app.listen(PORT, () => {
      logger.info(`=========================================`);
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`=========================================`);
    });
  } catch (error) {
    logger.error("Database connection failed or startup error:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection! Gracefully shutting down server...", error);
  if (server) {
    server.close(() => {
      logger.info("Server closed successfully.");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle termination signals
const gracefulShutdown = () => {
  if (server) {
    logger.info("SIGTERM/SIGINT signal received. Gracefully shutting down...");
    server.close(() => {
      logger.info("Express server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

startServer();
export default server;
export { server };