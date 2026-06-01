import express from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { protect, restrictTo } from "../middleware/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Apply auth protection to all upload endpoints
router.use(protect);

// Upload single student photo file (Admin & Verification Officer)
router.post("/", restrictTo("Admin", "Verification Officer"), upload.single("photo"), uploadController.uploadFile);

// Delete single photo file (Admin & Verification Officer)
router.delete("/", restrictTo("Admin", "Verification Officer"), uploadController.deleteFile);

export default router;
export { router };
