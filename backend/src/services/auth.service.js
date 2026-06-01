import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";

/**
 * Register a new staff user
 * @param {object} userData - Registration fields
 * @returns {Promise<object>} Created user
 */
export const registerStaff = async (userData) => {
  const { staffId, email } = userData;

  // Check if staff ID already exists
  const existingStaffId = await User.findOne({ staffId });
  if (existingStaffId) {
    throw new ApiError(400, "A staff member with this Staff ID already exists");
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(400, "A staff member with this email already exists");
  }

  const user = await User.create(userData);
  
  // Exclude password from the returned object
  const userJson = user.toObject();
  delete userJson.password;
  
  return userJson;
};

/**
 * Login a staff member
 * @param {object} credentials - Login credentials (email/staffId and password)
 * @returns {Promise<object>} Object containing user info, accessToken, and refreshToken
 */
export const loginStaff = async ({ staffId, email, password }) => {
  // Query by email or staff ID
  const query = email ? { email } : { staffId };
  
  // Explicitly retrieve password
  const user = await User.findOne(query).select("+password");
  
  if (!user) {
    throw new ApiError(401, "Invalid staff credentials");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Your staff account has been deactivated. Please contact ICT support.");
  }

  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid staff credentials");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Exclude password and refresh token from the returned user object
  const userJson = user.toObject();
  delete userJson.password;
  delete userJson.refreshToken;

  return {
    user: userJson,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh Access Token using a valid Refresh Token
 * @param {string} token - Refresh Token
 * @returns {Promise<object>} Object containing new accessToken
 */
export const refreshAccessToken = async (token) => {
  if (!token) {
    throw new ApiError(401, "Refresh token is missing");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Find user and explicitly retrieve stored refreshToken
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Your staff account has been deactivated");
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
};

/**
 * Logout staff member by revoking their refresh token
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const logoutStaff = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }
};

/**
 * Update staff profile details
 */
export const updateProfile = async (userId, { fullName, email, staffId }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if staff ID conflicts with another user
  if (staffId && staffId !== user.staffId) {
    const existingStaff = await User.findOne({ staffId });
    if (existingStaff) {
      throw new ApiError(400, "A staff member with this Staff ID already exists");
    }
    user.staffId = staffId;
  }

  // Check if email conflicts with another user
  if (email && email.toLowerCase() !== user.email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw new ApiError(400, "A staff member with this email already exists");
    }
    user.email = email.toLowerCase();
  }

  if (fullName) {
    user.fullName = fullName;
  }

  await user.save();

  const userJson = user.toObject();
  delete userJson.password;
  delete userJson.refreshToken;

  return userJson;
};

/**
 * Update staff password
 */
export const updatePassword = async (userId, { currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current and new passwords are required");
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, "Incorrect current password");
  }

  user.password = newPassword;
  await user.save();
};
