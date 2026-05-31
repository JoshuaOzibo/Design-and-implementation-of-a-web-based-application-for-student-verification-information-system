import express from "express";
import authRouter from "./auth.routes.js";
import studentRouter from "./student.routes.js";
import qrRouter from "./qr.routes.js";
import verificationRouter from "./verification.routes.js";
import logRouter from "./log.routes.js";
import uploadRouter from "./upload.routes.js";
import analyticsRouter from "./analytics.routes.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Verification API running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development"
  });
});

// Authentication routes
router.use("/auth", authRouter);

// Student management routes
router.use("/students", studentRouter);

// QR Code Identity routes
router.use("/qr", qrRouter);

// Verification Engine routes
router.use("/verify", verificationRouter);

// Verification Logs routes
router.use("/logs", logRouter);

// File Upload routes
router.use("/upload", uploadRouter);

// Dashboard Analytics routes
router.use("/analytics", analyticsRouter);

export default router;
export { router };
