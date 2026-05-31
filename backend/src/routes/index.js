import express from "express";

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

// We can add other routes later here, e.g. router.use("/auth", authRouter)

export default router;
export { router };
