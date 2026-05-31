import { verifyAccessToken } from "../utils/token.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/**
 * Middleware to protect routes and verify JWT access token
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(401, "Authentication required. Please log in.");
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      throw new ApiError(401, "Authentication failed. Invalid or expired token.");
    }

    // Find user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, "Authentication failed. User no longer exists.");
    }

    if (user.status !== "active") {
      throw new ApiError(403, "Authentication failed. Your account is deactivated.");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access based on staff roles
 * @param {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required."));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Authorized roles: ${roles.join(", ")}`)
      );
    }
    
    next();
  };
};
