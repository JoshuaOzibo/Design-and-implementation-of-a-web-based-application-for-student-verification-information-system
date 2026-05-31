import * as authService from "../services/auth.service.js";
import { config } from "../config/env_config.js";

// Helper helper function to send cookies
const setRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching token lifespan
  };
  res.cookie("refreshToken", token, cookieOptions);
};

/**
 * Handle staff registration request
 */
export const register = async (req, res, next) => {
  try {
    const user = await authService.registerStaff(req.body);
    res.status(201).json({
      success: true,
      message: "Staff member registered successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle staff login request
 */
export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.loginStaff(req.body);
    
    // Set refresh token in secure cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle refresh access token request
 */
export const refresh = async (req, res, next) => {
  try {
    // Extract token from cookie first, fallback to request body
    const token = req.cookies.refreshToken || req.body.refreshToken;
    
    const { accessToken } = await authService.refreshAccessToken(token);

    res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle staff logout request
 */
export const logout = async (req, res, next) => {
  try {
    // The protect middleware will attach user to req.user
    if (req.user && req.user.id) {
      await authService.logoutStaff(req.user.id);
    }
    
    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    next(error);
  }
};
