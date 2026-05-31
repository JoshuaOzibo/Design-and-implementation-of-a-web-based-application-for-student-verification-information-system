import express from "express";
import * as logController from "../controllers/log.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { queryLogsSchema } from "../middleware/log.validation.js";

const router = express.Router();

// Apply auth protection to all log endpoints
router.use(protect);

// Get paginated and filtered logs list
router.get("/", validate(queryLogsSchema), logController.getLogs);

// Export logs list as CSV file download
router.get("/export", validate(queryLogsSchema), logController.exportLogs);

export default router;
export { router };
