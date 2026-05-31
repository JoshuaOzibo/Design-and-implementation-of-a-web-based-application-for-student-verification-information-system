import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply auth protection to all analytics endpoints
router.use(protect);

// Get dashboard statistics
router.get("/", analyticsController.getAnalytics);

export default router;
export { router };
