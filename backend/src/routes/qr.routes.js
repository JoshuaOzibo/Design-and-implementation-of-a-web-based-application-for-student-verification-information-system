import express from "express";
import * as qrController from "../controllers/qr.controller.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Verify QR code identity (Publicly accessible for browser view, optionally authenticated)
router.get("/verify/:verificationId", qrController.verifyQR);

// Apply auth protection to subsequent administration endpoints
router.use(protect);

// Generate QR code for student (Admin & Verification Officer)
router.post("/generate/:studentId", restrictTo("Admin", "Verification Officer"), qrController.generateQR);

// Regenerate QR code for student (Admin & Verification Officer)
router.post("/regenerate/:studentId", restrictTo("Admin", "Verification Officer"), qrController.regenerateQR);

export default router;
export { router };
