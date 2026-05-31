import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";

import { config } from "./config/env_config.js";
import logger from "./utils/logger.js";
import ApiError from "./utils/ApiError.js";
import { errorConverter, errorHandler } from "./middleware/error_handler.js";
import router from "./routes/index.js";

const app = express();

// Request logging middleware integrated with Winston
const morganFormat = config.env === "production" ? "combined" : "dev";
const morganStream = {
  write: (message) => logger.http(message.trim()),
};
app.use(morgan(morganFormat, { stream: morganStream }));

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: true, // Allow all origins for development, adjust for production if needed
    credentials: true,
  })
);

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Parse Cookie header and populate req.cookies
app.use(cookieParser());

// Gzip compression
app.use(compression());

// Limit repeated requests to public APIs
if (config.env === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: "Too many requests from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use("/api", limiter);
}

// API versioning base route
app.use("/api/v1", router);

// Root path fallback
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Verification System API Gateway",
    documentation: "/api/v1/health"
  });
});

// Send back a 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

export default app;
export { app };