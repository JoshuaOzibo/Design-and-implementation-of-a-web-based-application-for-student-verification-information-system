import jwt from "jsonwebtoken";
import { config } from "../config/env_config.js";

/**
 * Generate Access Token for a user
 * @param {object} user - User document/object
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiration }
  );
};

/**
 * Generate Refresh Token for a user
 * @param {object} user - User document/object
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiration }
  );
};

/**
 * Verify JWT Access Token
 * @param {string} token - Signed Access Token
 * @returns {object} Token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify JWT Refresh Token
 * @param {string} token - Signed Refresh Token
 * @returns {object} Token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
