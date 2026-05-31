import express from "express";
import authRouter from "./auth.routes.js";
import studentRouter from "./student.routes.js";
import qrRouter from "./qr.routes.js";

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

export default router;
export { router };
