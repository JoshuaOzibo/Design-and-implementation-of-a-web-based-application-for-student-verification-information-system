import express from "express";
import * as qrController from "../controllers/qr.controller.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Apply auth protection to all QR endpoints
router.use(protect);

// Verify QR code identity (all authenticated staff roles can verify)
router.get("/verify/:verificationId", qrController.verifyQR);

// Generate QR code for student (Admin only)
router.post("/generate/:studentId", restrictTo("Admin"), qrController.generateQR);

// Regenerate QR code for student (Admin only)
router.post("/regenerate/:studentId", restrictTo("Admin"), qrController.regenerateQR);

export default router;
export { router };
