import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";
import { config } from "../config/env_config.js";

// Error converter middleware to translate various errors to ApiError
export const errorConverter = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || (error.name === "ValidationError" || error.name === "ZodError" ? 400 : 500);
    let message = error.message || "Internal Server Error";
    
    // Customize message/details for specific error types
    if (error.name === "ZodError") {
      message = "Validation Error";
    } else if (error.code === 11000) {
      statusCode = 400;
      const field = Object.keys(error.keyValue)[0];
      message = `Duplicate field value entered for: ${field}. Please use another value.`;
    } else if (error.name === "CastError") {
      statusCode = 400;
      message = `Invalid ${error.path}: ${error.value}`;
    } else if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token. Please log in again.";
    } else if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Your token has expired. Please log in again.";
    }

    error = new ApiError(statusCode, message, false, err.stack);
    
    // Attach original details if they exist (like Zod issues)
    if (err.issues) {
      error.details = err.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));
    }
  }

  next(error);
};

// Error handler middleware to format and send the response
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // In production, mask non-operational internal errors
  if (config.env === "production" && !err.isOperational) {
    statusCode = 500;
    message = "Internal Server Error";
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    message,
    ...(err.details && { errors: err.details }),
    ...(config.env === "development" && { stack: err.stack }),
  };

  // Log error
  if (config.env === "development" || err.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${err.message}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - Status: ${statusCode} - Message: ${err.message}`);
  }

  res.status(statusCode).json(response);
};
