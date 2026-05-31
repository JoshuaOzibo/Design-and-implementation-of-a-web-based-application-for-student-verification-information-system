import express from "express";
import * as verificationController from "../controllers/verification.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { verifyStudentSchema } from "../middleware/verification.validation.js";

const router = express.Router();

// Apply auth protection to all verification engine endpoints
router.use(protect);

// Unified verification checkpoint endpoint
router.post("/", validate(verifyStudentSchema), verificationController.verifyStudent);

export default router;
export { router };
