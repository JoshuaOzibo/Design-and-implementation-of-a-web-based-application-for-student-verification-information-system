import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middleware/validation.js";
import { registerSchema, loginSchema } from "../middleware/auth.validation.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Register staff member
router.post("/register", validate(registerSchema), authController.register);

// Login staff member
router.post("/login", validate(loginSchema), authController.login);

// Refresh access token
router.post("/refresh", authController.refresh);

// Logout staff member (protected)
router.post("/logout", protect, authController.logout);

export default router;
export { router };
